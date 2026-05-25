// Defines user profile and wallet endpoints for authenticated account actions.
import express from 'express'
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getWalletBalance,
  updateWalletBalance,
} from '../controllers/userController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// All user routes require auth
router.use(authMiddleware)

router.get('/:id', getUserProfile)
router.put('/:id', updateUserProfile)
router.put('/:id/password', changePassword)
router.get('/:id/wallet', getWalletBalance)
router.put('/:id/wallet', updateWalletBalance)

export default router
