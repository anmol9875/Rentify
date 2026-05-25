// Controller for creating damage reports and running AI-based damage analysis.
import DamageReport from '../models/DamageReport.js'
import Rental from '../models/Rental.js'
import User from '../models/User.js'
import WalletHistory from '../models/WalletHistory.js'
import Transaction from '../models/Transaction.js'
import { analyzeDamage, calculatePenalty } from '../utils/aiService.js'
import { DAMAGE_SEVERITY } from '../config/constants.js'
import { AppError } from '../middleware/errorHandler.js'

const generateReportId = () => {
  return `D${Date.now()}${Math.floor(Math.random() * 1000)}`
}

const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
}

export const createDamageReport = async (req, res, next) => {
  try {
    const { rentalId, beforeImages, afterImages } = req.body

    if (!rentalId || !beforeImages || !afterImages) {
      throw new AppError('Missing required fields', 400)
    }

    const rental = await Rental.findById(rentalId)
    if (!rental) {
      throw new AppError('Rental not found', 404)
    }

    // Create damage report
    const report = new DamageReport({
      reportId: generateReportId(),
      rental: rentalId,
      product: rental.product,
      buyer: rental.buyer,
      seller: rental.seller,
      beforeImages,
      afterImages,
      status: 'pending',
    })

    await report.save()

    res.status(201).json({
      success: true,
      message: 'Damage report created',
      report,
    })
  } catch (error) {
    next(error)
  }
}

export const analyzeDamageReport = async (req, res, next) => {
  try {
    const { reportId, rentalId, beforeImage, afterImage } = req.body

    if ((!reportId && !rentalId) || !beforeImage || !afterImage) {
      throw new AppError('Missing required fields', 400)
    }

    let report = null
    let rental = null

    if (reportId) {
      report = await DamageReport.findById(reportId)
      if (!report) {
        throw new AppError('Report not found', 404)
      }
      rental = await Rental.findById(report.rental).populate('product', 'title category price image')
    } else {
      rental = await Rental.findById(rentalId).populate('product', 'title category price image')
      if (!rental) {
        throw new AppError('Rental not found', 404)
      }

      report = await DamageReport.findOne({ rental: rentalId })
      if (!report) {
        report = new DamageReport({
          reportId: generateReportId(),
          rental: rental._id,
          product: rental.product?._id || rental.product,
          buyer: rental.buyer,
          seller: rental.seller,
          status: 'pending',
        })
      }
    }

    if (!rental) {
      throw new AppError('Rental not found', 404)
    }

    const productPrice = rental.product?.price || rental.basePrice || rental.totalCost || 0
    const expectedCategory = rental.product?.category || rental.product?.title || ''

    const aiAnalysis = await analyzeDamage({
      beforeImage,
      afterImage,
      expectedCategory,
      itemPrice: productPrice,
    })

    // Calculate penalty based on AI analysis
    const suggestedPenalty = calculatePenalty(aiAnalysis)

    // Update report with AI analysis
    report.beforeImages = [beforeImage]
    report.afterImages = [afterImage]
    report.aiAnalysis = {
      damageDetected: aiAnalysis.damage_detected || false,
      confidence: aiAnalysis.confidence || 0,
      severity: aiAnalysis.severity || DAMAGE_SEVERITY.NO_DAMAGE,
      suggestedPenalty,
      analysis: aiAnalysis.analysis || 'No significant damage detected',
      detectedAreas: aiAnalysis.detected_areas || [],
      analysisStatus: aiAnalysis.analysis_status || 'completed',
      imageMatch: aiAnalysis.image_match !== false,
      similarityScore: aiAnalysis.similarity_score ?? null,
      semanticScore: aiAnalysis.semantic_score ?? null,
      featureScore: aiAnalysis.feature_score ?? null,
    }

    await report.save()

    if (rental.damageReport?.toString() !== report._id.toString()) {
      rental.damageReport = report._id
    }
    if (rental.status !== 'Under Inspection') {
      rental.status = 'Under Inspection'
    }
    await rental.save()

    res.status(200).json({
      success: true,
      message: 'Damage analysis completed',
      report,
      analysis: report.aiAnalysis,
    })
  } catch (error) {
    next(error)
  }
}

export const getDamageReports = async (req, res, next) => {
  try {
    const { status, role } = req.query
    
    let query = {}
    
    if (role === 'seller') {
      query.seller = req.user.userId
    } else if (role === 'buyer') {
      query.buyer = req.user.userId
    }

    if (status) {
      query.status = status
    }

    const reports = await DamageReport.find(query)
      .populate('rental', 'rentalId product startDate endDate totalCost penalty')
      .populate('product', 'title image')
      .populate('buyer', 'fullName email')
      .populate('seller', 'fullName email')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    })
  } catch (error) {
    next(error)
  }
}

export const sellerDecideOnDamage = async (req, res, next) => {
  try {
    const { reportId, decision, notes } = req.body // decision: 'approved' or 'rejected'

    if (!reportId || !decision || !['approved', 'rejected'].includes(decision)) {
      throw new AppError('Invalid decision', 400)
    }

    const report = await DamageReport.findById(reportId)
    if (!report) {
      throw new AppError('Report not found', 404)
    }

    if (report.seller.toString() !== req.user.userId) {
      throw new AppError('Only assigned seller can make decision', 403)
    }

    const rental = await Rental.findById(report.rental)
    if (!rental) {
      throw new AppError('Rental not found for this damage report', 404)
    }

    report.sellerDecision = decision
    report.sellerNotes = notes || ''

    let finalPenalty = 0
    let refundAmount = rental.securityDeposit

    if (decision === 'approved') {
      if (report.aiAnalysis?.imageMatch === false || report.aiAnalysis?.analysisStatus === 'image_mismatch') {
        throw new AppError('Cannot approve damage because the before and after images do not match.', 400)
      }

      if (report.aiAnalysis?.analysisStatus === 'low_confidence') {
        throw new AppError('Cannot approve damage because the AI prediction confidence is too low.', 400)
      }

      finalPenalty = report.aiAnalysis?.suggestedPenalty || 0
      report.finalPenalty = finalPenalty
      report.status = 'approved'
      refundAmount = Math.max(0, rental.securityDeposit - finalPenalty)
    } else {
      report.finalPenalty = 0
      report.status = 'rejected'
      refundAmount = rental.securityDeposit
    }

    report.refundAmount = refundAmount
    await report.save()

    const buyer = await User.findById(report.buyer)

    // Process refund and penalty transactions
    if (buyer && rental.securityDeposit > 0) {
      const refundValue = decision === 'approved' ? rental.securityDeposit : refundAmount
      const previousBalance = buyer.walletBalance
      buyer.walletBalance += refundValue
      await buyer.save()

      const refundTxn = new Transaction({
        transactionId: generateTransactionId(),
        user: report.buyer,
        type: 'refund',
        amount: refundValue,
        description: `Refund for rental ${rental.rentalId}`,
        rental: rental._id,
        damageReport: reportId,
        status: 'completed',
      })
      await refundTxn.save()

      await WalletHistory.create({
        user: report.buyer,
        previousBalance,
        amount: refundValue,
        newBalance: buyer.walletBalance,
        transaction: refundTxn._id,
        action: 'credit',
        description: `Refund after inspection for rental ${rental.rentalId}`,
      })
    }

    if (finalPenalty > 0 && buyer) {
      const previousBalance = buyer.walletBalance
      buyer.walletBalance = Math.max(0, buyer.walletBalance - finalPenalty)
      await buyer.save()

      const buyerPenaltyTxn = new Transaction({
        transactionId: generateTransactionId(),
        user: report.buyer,
        type: 'penalty',
        amount: finalPenalty,
        description: `Damage penalty approved for rental ${rental.rentalId}`,
        rental: rental._id,
        damageReport: reportId,
        status: 'completed',
        notes: 'Deducted from the held security deposit / buyer wallet balance.',
      })
      await buyerPenaltyTxn.save()

      await WalletHistory.create({
        user: report.buyer,
        previousBalance,
        amount: finalPenalty,
        newBalance: buyer.walletBalance,
        transaction: buyerPenaltyTxn._id,
        action: 'debit',
        description: `Damage penalty deducted for rental ${rental.rentalId}`,
      })

      // Credit penalty to seller
      const seller = await User.findById(report.seller)
      const sellerPreviousBalance = seller.walletBalance
      seller.walletBalance += finalPenalty
      seller.totalEarnings += finalPenalty
      await seller.save()

      const penaltyTxn = new Transaction({
        transactionId: generateTransactionId(),
        user: report.seller,
        type: 'penalty',
        amount: finalPenalty,
        description: `Damage penalty for rental ${rental.rentalId}`,
        rental: rental._id,
        damageReport: reportId,
        status: 'completed',
      })
      await penaltyTxn.save()

      await WalletHistory.create({
        user: report.seller,
        previousBalance: sellerPreviousBalance,
        amount: finalPenalty,
        newBalance: seller.walletBalance,
        transaction: penaltyTxn._id,
        action: 'credit',
        description: `Damage penalty credited for rental ${rental.rentalId}`,
      })
    }

    // Update rental status to completed
    rental.status = 'Completed'
    rental.penalty = finalPenalty
    rental.damageReport = reportId
    rental.notes = decision === 'approved'
      ? `Damage approved. Penalty applied: Rs. ${Number(finalPenalty).toFixed(2)}`
      : 'Inspection completed. No damage penalty was applied.'
    await rental.save()

    res.status(200).json({
      success: true,
      message: `Damage decision ${decision}`,
      finalPenalty,
      refundAmount,
    })
  } catch (error) {
    next(error)
  }
}

export const getDamageReportById = async (req, res, next) => {
  try {
    const report = await DamageReport.findById(req.params.id)
      .populate('rental')
      .populate('product', 'title')
      .populate('buyer', 'fullName email phone')
      .populate('seller', 'fullName email phone')

    if (!report) {
      throw new AppError('Report not found', 404)
    }

    res.status(200).json({
      success: true,
      report,
    })
  } catch (error) {
    next(error)
  }
}
