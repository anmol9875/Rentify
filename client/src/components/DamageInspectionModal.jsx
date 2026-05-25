import { useEffect, useState } from 'react'
import { analyzeDamage, approveDamageReport } from '../services/api.js'

function WarningIcon() {
  return (
    <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default function DamageInspectionModal({ rental, onClose, onUpdateRental }) {
  const normalizeAnalysis = (analysis) => {
    if (!analysis) return null

    return {
      detected: analysis.detected ?? analysis.damageDetected ?? false,
      confidence: analysis.confidence ?? 0,
      severity: analysis.severity ?? 'Pending',
      suggestedPenalty: analysis.suggestedPenalty ?? 0,
      analysis: analysis.analysis || 'AI analysis pending.',
      penaltyRange: analysis.penaltyRange || analysis.penalty_range || null,
      analysisStatus: analysis.analysisStatus || analysis.analysis_status || 'completed',
      imageMatch: analysis.imageMatch ?? analysis.image_match ?? true,
      similarityScore: analysis.similarityScore ?? analysis.similarity_score ?? null,
      semanticScore: analysis.semanticScore ?? analysis.semantic_score ?? null,
      featureScore: analysis.featureScore ?? analysis.feature_score ?? null,
    }
  }

  const [currentStep, setCurrentStep] = useState(0)
  const [uploadedAfterImage, setUploadedAfterImage] = useState(rental?.afterImage || null)
  const [activeReportId, setActiveReportId] = useState(rental?.reportId || null)
  const [analysisResult, setAnalysisResult] = useState(normalizeAnalysis(rental?.aiAnalysis))
  const [analysisError, setAnalysisError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSavingDecision, setIsSavingDecision] = useState(false)

  const damageData = analysisResult || {
    detected: false,
    confidence: 0,
    severity: 'Pending',
    suggestedPenalty: 0,
    analysis: 'Upload the returned-item image to run AI comparison for this item.',
    analysisStatus: 'pending',
    imageMatch: true,
    similarityScore: null,
  }

  const hasImageMismatch = analysisResult?.imageMatch === false || analysisResult?.analysisStatus === 'image_mismatch'
  const hasLowConfidence = analysisResult?.analysisStatus === 'low_confidence'

  useEffect(() => {
    setAnalysisResult(normalizeAnalysis(rental?.aiAnalysis))
    setUploadedAfterImage(rental?.afterImage || null)
    setActiveReportId(rental?.reportId || null)
  }, [rental])

  const runAnalysis = async () => {
    if (!uploadedAfterImage || !rental?.beforeImage || !rental?.id) {
      setAnalysisError('Before and after images are required for AI analysis.')
      return
    }

    try {
      setIsAnalyzing(true)
      setAnalysisError('')

      const response = await analyzeDamage({
        rentalId: rental.id,
        reportId: activeReportId,
        beforeImage: rental.beforeImage,
        afterImage: uploadedAfterImage,
      })

      const savedAnalysis = normalizeAnalysis(response?.analysis)

      setAnalysisResult(savedAnalysis)

      if (response?.report?._id) {
        setActiveReportId(response.report._id)
        onUpdateRental?.({
          type: 'analysis-complete',
          rentalId: rental.id,
          reportId: response.report._id,
        })
      }
    } catch (error) {
      setAnalysisError(error.message || 'Failed to run AI analysis.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleNoDamage = async () => {
    if (!activeReportId) {
      setAnalysisError('Run the AI analysis first so a damage report can be created.')
      return
    }

    try {
      setIsSavingDecision(true)
      await approveDamageReport(activeReportId, 'rejected')
      onUpdateRental?.({
        type: 'decision-complete',
        rentalId: rental.id,
        reportId: activeReportId,
      })
      onClose()
    } catch (error) {
      setAnalysisError(error.message || 'Failed to save the no-damage decision.')
    } finally {
      setIsSavingDecision(false)
    }
  }

  const handleConfirmDamage = async () => {
    if (!activeReportId) {
      setAnalysisError('Run the AI analysis first so a damage report can be created.')
      return
    }

    if (hasImageMismatch) {
      setAnalysisError('The before and after images do not match. Upload matching photos before confirming damage.')
      return
    }

    if (hasLowConfidence) {
      setAnalysisError('The AI prediction confidence is too low. Inspect manually before applying any penalty.')
      return
    }

    try {
      setIsSavingDecision(true)
      await approveDamageReport(activeReportId, 'approved')
      onUpdateRental?.({
        type: 'decision-complete',
        rentalId: rental.id,
        reportId: activeReportId,
      })
      onClose()
    } catch (error) {
      setAnalysisError(error.message || 'Failed to confirm damage.')
    } finally {
      setIsSavingDecision(false)
    }
  }

  const handleAfterImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result
      if (typeof result === 'string') {
        setUploadedAfterImage(result)
        setAnalysisResult(null)
        setAnalysisError('')
      }
    }
    reader.readAsDataURL(file)
  }

  const steps = [
    {
      title: 'Rental Information',
      content: (
        <div className="bg-[#f5f1ea] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#4b3b2a] mb-4">Rental Information</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left font-semibold text-[#2c2c2c]">Item</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#2c2c2c]">Buyer</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#2c2c2c]">Rental Period</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#2c2c2c]">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-[#2c2c2c]">{rental.item}</td>
                  <td className="px-4 py-3 text-[#2c2c2c]">{rental.buyer}</td>
                  <td className="px-4 py-3 text-[#2c2c2c]">{rental.period}</td>
                  <td className="px-4 py-3 font-semibold text-[#2c2c2c]">{rental.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      title: 'Image Comparison',
      content: (
        <div className="bg-[#f5f1ea] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#4b3b2a] mb-4">Image Comparison</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-center text-sm font-semibold text-teal-600 mb-3 pb-2 border-b-2 border-teal-50 bg-teal-50 py-2 rounded">
                Before Rental
              </h4>
              <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                {rental?.beforeImage ? (
                  <img
                    src={rental.beforeImage}
                    alt="Before rental"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                    No before image available
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-center text-sm font-semibold text-red-600 mb-3 pb-2 border-b-2 border-red-50 bg-red-50 py-2 rounded">
                After Rental
              </h4>
              <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                {uploadedAfterImage ? (
                  <img
                    src={uploadedAfterImage}
                    alt="After rental"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                    No after image uploaded yet
                  </div>
                )}
              </div>
              <label className="mt-4 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[#D2B48C] bg-white px-4 py-4 text-center transition-colors hover:bg-[#faf7f2]">
                <div>
                  <p className="text-sm font-medium text-[#4b3b2a]">Upload comparison image</p>
                  <p className="text-xs text-[#6b6b6b] mt-1">Choose the returned product image for inspection</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAfterImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'AI Damage Report',
      content: (
        <div className="bg-[#f5f1ea] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#4b3b2a] mb-4">AI Damage Report</h3>
          {analysisResult ? (
            hasImageMismatch ? (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3 mb-4">
                <WarningIcon />
                <div>
                  <h4 className="text-lg font-bold text-amber-800">Images Do Not Match</h4>
                  <p className="mt-1 text-sm text-amber-700">
                    The AI could not confirm that the before and after photos show the same item.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">AI Confidence</p>
                  <p className="text-2xl font-bold text-[#2c2c2c]">0%</p>
                </div>
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">Severity Level</p>
                  <p className="text-2xl font-bold text-[#2c2c2c]">Invalid</p>
                </div>
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">Suggested Penalty</p>
                  <p className="text-2xl font-bold text-amber-700">Rs. 0.00</p>
                </div>
              </div>

              <div className="bg-white rounded p-4">
                <p className="text-xs font-semibold text-amber-800 mb-2">AI Analysis</p>
                <p className="text-sm text-amber-800">{damageData.analysis}</p>
                {damageData.similarityScore !== null ? (
                  <p className="mt-2 text-xs text-amber-700">
                    Similarity score: {Number(damageData.similarityScore).toFixed(2)}
                  </p>
                ) : null}
              </div>
            </div>
            ) : hasLowConfidence ? (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3 mb-4">
                <WarningIcon />
                <div>
                  <h4 className="text-lg font-bold text-amber-800">Low Confidence Result</h4>
                  <p className="mt-1 text-sm text-amber-700">
                    The model is not confident enough to apply a damage penalty.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">AI Confidence</p>
                  <p className="text-2xl font-bold text-[#2c2c2c]">{damageData.confidence}%</p>
                </div>
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">Severity Level</p>
                  <p className="text-2xl font-bold text-[#2c2c2c]">Uncertain</p>
                </div>
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">Suggested Penalty</p>
                  <p className="text-2xl font-bold text-amber-700">Rs. 0.00</p>
                </div>
              </div>

              <div className="bg-white rounded p-4">
                <p className="text-xs font-semibold text-amber-800 mb-2">AI Analysis</p>
                <p className="text-sm text-amber-800">{damageData.analysis}</p>
              </div>
            </div>
            ) : damageData.detected ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3 mb-4">
                <WarningIcon />
                <div>
                  <h4 className="text-lg font-bold text-red-700">Damage Detected</h4>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">AI Confidence</p>
                  <p className="text-2xl font-bold text-[#2c2c2c]">{damageData.confidence}%</p>
                </div>
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">Severity Level</p>
                  <p className="text-2xl font-bold text-[#2c2c2c]">{damageData.severity}</p>
                </div>
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">Suggested Penalty</p>
                  <p className="text-2xl font-bold text-red-600">Rs. {Number(damageData.suggestedPenalty || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-white rounded p-4">
                <p className="text-xs font-semibold text-blue-700 mb-2">AI Analysis</p>
                <p className="text-sm text-blue-700">{damageData.analysis}</p>
              </div>
            </div>
            ) : (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
              <div className="mb-4">
                <h4 className="text-lg font-bold text-green-700">No Damage Detected</h4>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">AI Confidence</p>
                  <p className="text-2xl font-bold text-[#2c2c2c]">{damageData.confidence}%</p>
                </div>
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">Severity Level</p>
                  <p className="text-2xl font-bold text-[#2c2c2c]">{damageData.severity}</p>
                </div>
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">Suggested Penalty</p>
                  <p className="text-2xl font-bold text-green-700">Rs. {Number(damageData.suggestedPenalty || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-white rounded p-4">
                <p className="text-xs font-semibold text-green-700 mb-2">AI Analysis</p>
                <p className="text-sm text-green-700">{damageData.analysis}</p>
              </div>
            </div>
            )
          ) : (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="text-lg font-bold text-[#2c2c2c] mb-2">AI Comparison Pending</h4>
              <p className="text-sm text-gray-600">{damageData.analysis}</p>
              <p className="mt-2 text-xs text-gray-500">
                {uploadedAfterImage
                  ? 'Comparison image selected and ready for AI analysis.'
                  : 'Upload the returned-item image in the previous step to prepare for AI analysis.'}
              </p>
            </div>
          )}

          {analysisError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {analysisError}
            </div>
          )}

          <button
            type="button"
            onClick={runAnalysis}
            disabled={!uploadedAfterImage || isAnalyzing}
            className="w-full rounded-lg bg-[#2c2c2c] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzing ? 'Running AI analysis...' : 'Run AI Analysis'}
          </button>
        </div>
      ),
    },
    {
      title: 'Seller Decision',
      content: (
        <div className="bg-[#f5f1ea] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#4b3b2a] mb-2">Seller Decision</h3>
          <p className="text-sm text-gray-600 mb-6">
            Review the AI analysis and images, then confirm your decision. The buyer will be notified of the outcome.
          </p>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleConfirmDamage}
                disabled={!activeReportId || hasImageMismatch || hasLowConfidence || isSavingDecision}
                className="flex flex-col items-center justify-center gap-1 rounded-lg bg-red-600 px-4 py-4 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XIcon />
                <span>Confirm Damage</span>
                <span className="text-xs font-normal">
                  {hasImageMismatch
                    ? 'Upload matching images first'
                    : hasLowConfidence
                      ? 'Manual review required'
                    : `Apply penalty of Rs. ${Number(damageData.suggestedPenalty || 0).toFixed(2)}`}
                </span>
              </button>
              <button
                onClick={handleNoDamage}
                disabled={!activeReportId || isSavingDecision}
                className="flex flex-col items-center justify-center gap-1 rounded-lg bg-green-600 px-4 py-4 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckIcon />
                <span>No Damage</span>
                <span className="text-xs font-normal">Release escrow payment</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-[#2c2c2c] font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Review Later
            </button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-[#f5f1ea] rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[#D2B48C] px-8 py-6 flex items-center justify-between border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-[#4b3b2a]">Damage Inspection</h2>
              <p className="text-sm text-gray-600 mt-1">Review AI damage detection results</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-300 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-[#2c2c2c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {steps[currentStep].content}
          </div>

          {/* Footer with navigation */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep ? 'bg-[#c49a5f] w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-6 py-2 border border-gray-300 text-[#2c2c2c] font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep === steps.length - 1}
                className="px-6 py-2 bg-[#c49a5f] hover:bg-[#b8966b] text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
