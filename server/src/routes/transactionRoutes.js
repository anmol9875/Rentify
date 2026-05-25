// Defines transaction and wallet endpoints for payment history and withdrawals.
import express from 'express'
import {
  getTransactionHistory,
  getTransactionById,
  createTransaction,
  processWithdrawal,
  getWalletTransactions,
} from '../controllers/transactionController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// All transaction routes require auth
router.use(authMiddleware)

router.get('/wallet/transactions', getWalletTransactions)
router.get('/', getTransactionHistory)
router.post('/', createTransaction)
router.post('/withdraw', processWithdrawal)
router.get('/:id', getTransactionById)

export default router
