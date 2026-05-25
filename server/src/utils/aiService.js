import dotenv from 'dotenv'
import path from 'path'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'

dotenv.config()

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:5001'
const ENABLE_AUXILIARY_AI_CHECKS = process.env.ENABLE_AUXILIARY_AI_CHECKS === 'true'
const IMAGE_MATCH_MIN_SIMILARITY = Number(process.env.IMAGE_MATCH_MIN_SIMILARITY || 0.62)
const DAMAGE_MIN_CONFIDENCE = Number(process.env.DAMAGE_MIN_CONFIDENCE || 70)
const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url))
const SERVER_ROOT = path.resolve(CURRENT_DIR, '..', '..')
const REPO_ROOT = path.resolve(SERVER_ROOT, '..')
const CLIENT_PUBLIC_DIR = path.resolve(REPO_ROOT, 'client', 'public')

const dataUrlPattern = /^data:(.+);base64,(.+)$/

const normalizeSeverityLabel = (value) => {
  const normalized = String(value || '').trim().toLowerCase()

  if (normalized === 'no_damage') return 'No Damage'
  if (normalized === 'minor') return 'Minor'
  if (normalized === 'major') return 'Major'
  if (normalized === 'critical') return 'Critical'

  return 'No Damage'
}

const buildImageFile = async (imageSource, fallbackName = 'image.jpg') => {
  if (!imageSource) {
    throw new Error('Missing image source for AI analysis')
  }

  if (typeof imageSource !== 'string') {
    throw new Error('Unsupported image source format')
  }

  const dataUrlMatch = imageSource.match(dataUrlPattern)
  if (dataUrlMatch) {
    const [, mimeType, base64Payload] = dataUrlMatch
    const extension = mimeType.split('/')[1] || 'jpg'
    const buffer = Buffer.from(base64Payload, 'base64')

    return {
      blob: new Blob([buffer], { type: mimeType }),
      filename: fallbackName.replace(/\.[^.]+$/, `.${extension}`),
    }
  }

  if (/^https?:\/\//i.test(imageSource)) {
    const response = await fetch(imageSource)
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const extension = contentType.split('/')[1] || path.extname(fallbackName).replace('.', '') || 'jpg'

    return {
      blob: new Blob([arrayBuffer], { type: contentType }),
      filename: fallbackName.replace(/\.[^.]+$/, `.${extension}`),
    }
  }

  const candidatePaths = []

  if (imageSource.startsWith('/')) {
    candidatePaths.push(path.resolve(CLIENT_PUBLIC_DIR, imageSource.slice(1)))
  }

  if (path.isAbsolute(imageSource)) {
    candidatePaths.push(imageSource)
    candidatePaths.push(path.resolve(CLIENT_PUBLIC_DIR, path.basename(imageSource)))
  } else {
    candidatePaths.push(path.resolve(process.cwd(), imageSource))
    candidatePaths.push(path.resolve(SERVER_ROOT, imageSource))
    candidatePaths.push(path.resolve(REPO_ROOT, imageSource))
    candidatePaths.push(path.resolve(CLIENT_PUBLIC_DIR, imageSource))
    candidatePaths.push(path.resolve(CLIENT_PUBLIC_DIR, path.basename(imageSource)))
  }

  let resolvedPath = null
  for (const candidatePath of candidatePaths) {
    try {
      await fs.access(candidatePath)
      resolvedPath = candidatePath
      break
    } catch {
      // Try the next candidate path.
    }
  }

  if (!resolvedPath) {
    throw new Error(`Image file could not be resolved for AI analysis: ${imageSource}`)
  }

  const fileBuffer = await fs.readFile(resolvedPath)
  const extension = path.extname(resolvedPath) || '.jpg'

  return {
    blob: new Blob([fileBuffer], { type: `image/${extension.replace('.', '')}` }),
    filename: fallbackName.replace(/\.[^.]+$/, extension),
  }
}

const postFormData = async (endpoint, fields, timeoutMs = 30000) => {
  const formData = new FormData()

  for (const [key, value] of Object.entries(fields)) {
    if (!value) continue

    if (value.blob) {
      formData.append(key, value.blob, value.filename)
    } else {
      formData.append(key, value)
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const response = await fetch(`${PYTHON_AI_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    signal: controller.signal,
  })
  clearTimeout(timeoutId)

  const responseText = await response.text()
  let data = null

  try {
    data = responseText ? JSON.parse(responseText) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.error ||
      responseText ||
      `AI request failed for ${endpoint}`
    )
  }

  return data ?? {}
}

const runOptionalAiStep = async (label, operation, fallbackValue) => {
  try {
    return await operation()
  } catch (error) {
    console.error(`Optional AI step failed: ${label}`, error)
    return fallbackValue
  }
}

export const analyzeDamage = async ({
  beforeImage,
  afterImage,
  expectedCategory,
  itemPrice,
}) => {
  try {
    const [beforeFile, afterFile] = await Promise.all([
      buildImageFile(beforeImage, 'before.jpg'),
      buildImageFile(afterImage, 'after.jpg'),
    ])

    const comparison = await postFormData(
      '/compare-images',
      {
        original_image: beforeFile,
        return_image: afterFile,
      },
      20000
    )

    const similarityScore = Number(comparison.similarity_score || 0)
    const imagesMatch =
      typeof comparison.image_match === 'boolean'
        ? comparison.image_match
        : similarityScore >= IMAGE_MATCH_MIN_SIMILARITY

    if (!imagesMatch) {
      return {
        damage_detected: false,
        confidence: 0,
        severity: 'No Damage',
        suggested_penalty: 0,
        penalty_range: [0, 0],
        analysis:
          'The before and after images do not appear to show the same item. Please upload matching before and after photos before running damage analysis.',
        image_quality: {
          is_blurry: false,
          is_too_dark: false,
          is_usable: true,
        },
        category_validation: {
          detected_objects: [],
          matches_expected: true,
        },
        similarity_score: similarityScore,
        semantic_score: comparison.semantic_score ?? null,
        feature_score: comparison.feature_score ?? null,
        significant_change: false,
        image_match: false,
        analysis_status: 'image_mismatch',
      }
    }

    const damageDetection = await postFormData(
      '/detect-damage',
      {
        image: afterFile,
      },
      45000
    )

    let qualityCheck = {
      quality: {
        is_blurry: false,
        is_too_dark: false,
        is_usable: true,
      },
      category_validation: {
        detected_objects: [],
        matches_expected: true,
      },
    }

    if (ENABLE_AUXILIARY_AI_CHECKS) {
      qualityCheck = await runOptionalAiStep(
        'verify-image',
        () =>
          postFormData(
            '/verify-image',
            {
              image: afterFile,
              expected_category: expectedCategory || '',
            },
            12000
          ),
        qualityCheck
      )
    }

    const normalizedSeverity = normalizeSeverityLabel(damageDetection.damage_level)
    const confidencePercent = Math.round(
      (damageDetection.confidence <= 1 ? damageDetection.confidence * 100 : damageDetection.confidence)
    )
    const hasConfidentDamagePrediction =
      normalizedSeverity !== 'No Damage' && confidencePercent >= DAMAGE_MIN_CONFIDENCE

    if (normalizedSeverity !== 'No Damage' && !hasConfidentDamagePrediction) {
      return {
        damage_detected: false,
        confidence: confidencePercent,
        severity: 'No Damage',
        suggested_penalty: 0,
        penalty_range: [0, 0],
        analysis:
          `The model gave a low-confidence ${normalizedSeverity.toLowerCase()} prediction (${confidencePercent}%). No penalty should be applied without manual inspection.`,
        image_quality: qualityCheck.quality,
        category_validation: qualityCheck.category_validation,
        similarity_score: comparison.similarity_score,
        semantic_score: comparison.semantic_score ?? null,
        feature_score: comparison.feature_score ?? null,
        significant_change: comparison.significant_change,
        image_match: true,
        analysis_status: 'low_confidence',
      }
    }

    const penalty = await fetch(`${PYTHON_AI_URL}/calculate-penalty`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        damage_level: damageDetection.damage_level,
        item_price: Number(itemPrice || 0),
      }),
    }).then(async (response) => {
      const responseText = await response.text()
      let data = null

      try {
        data = responseText ? JSON.parse(responseText) : null
      } catch {
        data = null
      }

      if (!response.ok) {
        throw new Error(data?.detail || data?.error || responseText || 'Penalty calculation failed')
      }
      return data ?? {}
    })

    const damageDetected = normalizedSeverity !== 'No Damage'

    const summaryParts = []
    if (!qualityCheck.quality?.is_usable) {
      summaryParts.push('Returned image quality is weak, so the result may be less reliable.')
    }
    if (qualityCheck.category_validation?.matches_expected === false) {
      summaryParts.push('Uploaded image may not match the expected product category.')
    }
    summaryParts.push(
      damageDetected
        ? `AI classified the returned item as ${normalizedSeverity.toLowerCase()} damage.`
        : 'AI did not find meaningful damage in the returned image.'
    )
    if (ENABLE_AUXILIARY_AI_CHECKS) {
      summaryParts.push(`Image similarity score: ${comparison.similarity_score}.`)
    }

    return {
      damage_detected: damageDetected,
      confidence: confidencePercent,
      severity: normalizedSeverity,
      suggested_penalty: penalty.penalty_amount || 0,
      penalty_range: penalty.penalty_range || [0, 0],
      analysis: summaryParts.join(' '),
      image_quality: qualityCheck.quality,
      category_validation: qualityCheck.category_validation,
      similarity_score: comparison.similarity_score,
      semantic_score: comparison.semantic_score ?? null,
      feature_score: comparison.feature_score ?? null,
      significant_change: comparison.significant_change,
      image_match: true,
      analysis_status: 'completed',
    }
  } catch (error) {
    console.error('Error calling Python AI service:', error)
    throw new Error(error.message || 'Damage analysis failed')
  }
}

export const calculatePenalty = (damageData) => {
  return Number(damageData?.suggested_penalty || 0)
}
