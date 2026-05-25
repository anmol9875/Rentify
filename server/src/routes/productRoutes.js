// Defines product API endpoints for public browsing and seller management.
import express from 'express'
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getMyProducts,
} from '../controllers/productController.js'
import { authMiddleware, sellerOnly } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getAllProducts)
router.get('/seller/:sellerId', getSellerProducts)

// Get authenticated seller's products
router.get('/my-products', authMiddleware, sellerOnly, getMyProducts)

router.get('/:id', getProductById)

// Protected routes (seller only)
router.post('/', authMiddleware, sellerOnly, createProduct)
router.put('/:id', authMiddleware, sellerOnly, updateProduct)
router.delete('/:id', authMiddleware, sellerOnly, deleteProduct)

export default router
