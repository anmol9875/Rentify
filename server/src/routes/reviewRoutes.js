import express from 'express'
import { submitReview } from '../controllers/reviewController.js'
import { authMiddleware, buyerOnly } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.post('/', buyerOnly, submitReview)

export default router
