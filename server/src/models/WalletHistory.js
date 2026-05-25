// Mongoose schema for wallet top-ups, deductions, and transaction logs.
import mongoose from 'mongoose'

const walletHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    previousBalance: Number,
    amount: Number,
    newBalance: Number,
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    action: {
      type: String,
      enum: ['debit', 'credit'],
      required: true,
    },
    description: String,
  },
  { timestamps: true }
)

export default mongoose.model('WalletHistory', walletHistorySchema)
