// Mongoose schema for transaction records and payment history.
import mongoose from 'mongoose'
import { TRANSACTION_TYPES } from '../config/constants.js'

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        TRANSACTION_TYPES.RENTAL,
        TRANSACTION_TYPES.REFUND,
        TRANSACTION_TYPES.SECURITY_DEPOSIT,
        TRANSACTION_TYPES.PENALTY,
        TRANSACTION_TYPES.WITHDRAWAL,
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: String,
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
    },
    damageReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DamageReport',
    },
    paymentMethod: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed',
    },
    notes: String,
  },
  { timestamps: true }
)

export default mongoose.model('Transaction', transactionSchema)
