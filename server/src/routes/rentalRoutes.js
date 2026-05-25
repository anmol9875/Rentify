// Defines rental endpoints for authenticated users to create and manage rentals.
import express from 'express'
import {
  createRental,
  getRentals,
  getRentalById,
  updateRentalStatus,
  submitReturnRequest,
} from '../controllers/rentalController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// All rental routes require auth
router.use(authMiddleware)

router.post('/', createRental)
router.get('/', getRentals)
router.get('/:id', getRentalById)
router.put('/:id/status', updateRentalStatus)
router.post('/:id/return', submitReturnRequest)

export default router
