// Controller for transaction history, wallet actions, and withdrawal processing.
import Transaction from '../models/Transaction.js'
import WalletHistory from '../models/WalletHistory.js'
import User from '../models/User.js'
import { AppError } from '../middleware/errorHandler.js'

const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
}

export const getTransactionHistory = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.userId })
      .populate('rental', 'rentalId product')
      .populate('damageReport', 'reportId')
      .sort({ createdAt: -1 })
      .limit(50)

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    })
  } catch (error) {
    next(error)
  }
}

export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'fullName email')
      .populate('rental')
      .populate('damageReport')

    if (!transaction) {
      throw new AppError('Transaction not found', 404)
    }

    res.status(200).json({
      success: true,
      transaction,
    })
  } catch (error) {
    next(error)
  }
}

export const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, description, rentalId, paymentMethod } = req.body

    if (!type || typeof amount !== 'number' || amount <= 0) {
      throw new AppError('Invalid transaction data', 400)
    }

    const transaction = new Transaction({
      transactionId: generateTransactionId(),
      user: req.user.userId,
      type,
      amount,
      description,
      rental: rentalId,
      paymentMethod,
      status: 'pending',
    })

    await transaction.save()

    res.status(201).json({
      success: true,
      message: 'Transaction created',
      transaction,
    })
  } catch (error) {
    next(error)
  }
}

export const processWithdrawal = async (req, res, next) => {
  try {
    const { amount, method } = req.body

    if (typeof amount !== 'number' || amount <= 0) {
      throw new AppError('Invalid withdrawal amount', 400)
    }

    if (!['bank', 'easypaisa', 'jazzcash'].includes(method)) {
      throw new AppError('Invalid withdrawal method', 400)
    }

    const user = await User.findById(req.user.userId)
    
    if (!user) {
      throw new AppError('User not found', 404)
    }

    if (user.walletBalance < amount) {
      throw new AppError('Insufficient balance', 400)
    }

    // Deduct from wallet
    user.walletBalance -= amount
    await user.save()

    // Create withdrawal transaction
    const transaction = new Transaction({
      transactionId: generateTransactionId(),
      user: req.user.userId,
      type: 'withdrawal',
      amount,
      description: `Withdrawal to ${method}`,
      paymentMethod: method,
      status: 'completed',
    })

    await transaction.save()

    // Record wallet history
    const walletHistory = new WalletHistory({
      user: req.user.userId,
      previousBalance: user.walletBalance + amount,
      amount,
      newBalance: user.walletBalance,
      transaction: transaction._id,
      action: 'debit',
      description: `Withdrawal to ${method}`,
    })

    await walletHistory.save()

    res.status(200).json({
      success: true,
      message: 'Withdrawal processed successfully',
      newBalance: user.walletBalance,
      transaction: transaction.transactionId,
    })
  } catch (error) {
    next(error)
  }
}

export const getWalletTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.userId,
      type: { $in: ['rental', 'refund', 'penalty', 'withdrawal'] },
    })
      .sort({ createdAt: -1 })
      .limit(100)

    const summary = {
      totalRentals: transactions
        .filter(t => t.type === 'rental')
        .reduce((sum, t) => sum + t.amount, 0),
      totalRefunds: transactions
        .filter(t => t.type === 'refund')
        .reduce((sum, t) => sum + t.amount, 0),
      totalPenalties: transactions
        .filter(t => t.type === 'penalty')
        .reduce((sum, t) => sum + t.amount, 0),
      totalWithdrawals: transactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0),
    }

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
      summary,
    })
  } catch (error) {
    next(error)
  }
}
