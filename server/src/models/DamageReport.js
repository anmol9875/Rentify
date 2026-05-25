// Mongoose schema for damage reports and related rental inspection data.
import mongoose from 'mongoose'
import { DAMAGE_SEVERITY } from '../config/constants.js'

const damageReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
      required: true,
    },
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    beforeImages: [
      {
        type: String, // URLs or paths
      },
    ],
    afterImages: [
      {
        type: String, // URLs or paths
      },
    ],
    aiAnalysis: {
      damageDetected: Boolean,
      confidence: Number, // 0-100
      severity: {
        type: String,
        enum: [
          DAMAGE_SEVERITY.NO_DAMAGE,
          DAMAGE_SEVERITY.MINOR,
          DAMAGE_SEVERITY.MAJOR,
          DAMAGE_SEVERITY.CRITICAL,
        ],
      },
      suggestedPenalty: Number,
      analysis: String, // Detailed description
      detectedAreas: [String], // Areas of damage
      analysisStatus: {
        type: String,
        enum: ['pending', 'completed', 'image_mismatch', 'low_confidence'],
        default: 'pending',
      },
      imageMatch: {
        type: Boolean,
        default: true,
      },
      similarityScore: Number,
      semanticScore: Number,
      featureScore: Number,
    },
    sellerDecision: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    sellerNotes: String,
    finalPenalty: Number,
    refundAmount: Number,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'resolved'],
      default: 'pending',
    },
    contactInfo: {
      buyerEmail: String,
      buyerPhone: String,
      sellerEmail: String,
      sellerPhone: String,
    },
  },
  { timestamps: true }
)

export default mongoose.model('DamageReport', damageReportSchema)
