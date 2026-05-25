// Defines damage report endpoints for submitting and analyzing rental damage.
import express from 'express'
import {
  createDamageReport,
  analyzeDamageReport,
  getDamageReports,
  sellerDecideOnDamage,
  getDamageReportById,
} from '../controllers/damageReportController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// All damage report routes require auth
router.use(authMiddleware)

router.post('/', createDamageReport)
router.post('/analyze', analyzeDamageReport)
router.get('/', getDamageReports)
router.get('/:id', getDamageReportById)
router.post('/:id/decide', sellerDecideOnDamage)

export default router
