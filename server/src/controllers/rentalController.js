// Controller for rental creation, updates, return workflow, and rental history.
import Rental from '../models/Rental.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import { RENTAL_STATUS, SECURITY_DEPOSIT, TAX_PERCENTAGE } from '../config/constants.js'
import { AppError } from '../middleware/errorHandler.js'
import { hashPassword } from '../utils/validation.js'

const generateRentalId = () => {
  return `R${Date.now()}${Math.floor(Math.random() * 1000)}`
}

const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value))

const findOrCreateCatalogSeller = async () => {
  let seller = await User.findOne({ email: 'catalog-seller@rentify.local' })

  if (!seller) {
    seller = new User({
      email: 'catalog-seller@rentify.local',
      password: await hashPassword('CatalogSeller123'),
      fullName: 'Rentify Catalog Seller',
      role: 'seller',
      isVerified: true,
    })
    await seller.save()
  }

  return seller
}

const resolveProductForRental = async ({ productId, catalogProductId, productSnapshot }) => {
  if (isValidObjectId(productId)) {
    const existingProduct = await Product.findById(productId)
    if (existingProduct) return existingProduct
  }

  if (!catalogProductId && !productSnapshot?.title) {
    return null
  }

  const catalogId = String(catalogProductId || productId)
  let product = await Product.findOne({ catalogId })

  if (!product && productSnapshot?.title) {
    product = await Product.findOne({ title: productSnapshot.title, isActive: true })
  }

  if (!product && productSnapshot) {
    const catalogSeller = await findOrCreateCatalogSeller()

    product = new Product({
      catalogId,
      title: productSnapshot.title,
      description: productSnapshot.description || `${productSnapshot.title} available for rent.`,
      price: Number(productSnapshot.price) || 0,
      duration: productSnapshot.duration || '5 day',
      image: productSnapshot.image,
      seller: catalogSeller._id,
      inventory: {
        total: 50,
        available: 50,
      },
      isActive: true,
    })

    await product.save()
  }

  return product
}

export const createRental = async (req, res, next) => {
  try {
    const { productId, catalogProductId, productSnapshot, startDate, endDate, quantity, deliveryAddress } = req.body

    if (!productId || !startDate || !endDate || !deliveryAddress) {
      throw new AppError('Missing required fields', 400)
    }

    const normalizedQuantity = Math.max(1, Number(quantity) || 1)

    const product = await resolveProductForRental({ productId, catalogProductId, productSnapshot })
    if (!product) {
      throw new AppError('Product not found', 404)
    }

    if (!product.isActive) {
      throw new AppError('Product is no longer available', 400)
    }

    // Check inventory
    if (product.inventory.available < normalizedQuantity) {
      throw new AppError('Not enough inventory', 400)
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

    if (days <= 0) {
      throw new AppError('Invalid rental period', 400)
    }

    const basePrice = product.price * normalizedQuantity * (days / 5) // Price is per 5 days
    const tax = basePrice * TAX_PERCENTAGE
    const totalCost = basePrice + tax + SECURITY_DEPOSIT

    const rental = new Rental({
      rentalId: generateRentalId(),
      product: product._id,
      buyer: req.user.userId,
      seller: product.seller,
      startDate: start,
      endDate: end,
      quantity: normalizedQuantity,
      basePrice,
      tax,
      securityDeposit: SECURITY_DEPOSIT,
      totalCost,
      deliveryAddress,
      status: RENTAL_STATUS.PENDING,
    })

    await rental.save()
    product.inventory.available = Math.max(0, product.inventory.available - normalizedQuantity)
    product.totalRentals += 1
    await product.save()

    await User.findByIdAndUpdate(req.user.userId, {
      $inc: {
        totalSpent: totalCost,
      },
    })

    await rental.populate([
      { path: 'product', select: 'title price image' },
      { path: 'buyer', select: 'fullName email phone' },
      { path: 'seller', select: 'fullName email phone' },
    ])

    // Create transaction record
    const transaction = new Transaction({
      transactionId: `TXN${Date.now()}`,
      user: req.user.userId,
      type: 'rental',
      amount: totalCost,
      description: `Rental for ${product.title}`,
      rental: rental._id,
      status: 'pending',
    })
    await transaction.save()

    res.status(201).json({
      success: true,
      message: 'Rental created successfully',
      rental,
      transaction: transaction.transactionId,
    })
  } catch (error) {
    next(error)
  }
}

export const getRentals = async (req, res, next) => {
  try {
    const { status, role } = req.query
    
    let query = {}
    
    if (role === 'buyer') {
      query.buyer = req.user.userId
    } else if (role === 'seller') {
      query.seller = req.user.userId
    }

    if (status) {
      query.status = status
    }

    const rentals = await Rental.find(query)
      .populate('product', 'title price image')
      .populate('buyer', 'fullName email phone')
      .populate('seller', 'fullName email phone')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    })
  } catch (error) {
    next(error)
  }
}

export const getRentalById = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('product')
      .populate('buyer', 'fullName email phone')
      .populate('seller', 'fullName email phone')
      .populate('damageReport')

    if (!rental) {
      throw new AppError('Rental not found', 404)
    }

    res.status(200).json({
      success: true,
      rental,
    })
  } catch (error) {
    next(error)
  }
}

export const updateRentalStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    
    const rental = await Rental.findById(req.params.id)
    
    if (!rental) {
      throw new AppError('Rental not found', 404)
    }

    // Only seller or buyer can update status
    if (rental.seller.toString() !== req.user.userId && rental.buyer.toString() !== req.user.userId) {
      throw new AppError('Unauthorized to update this rental', 403)
    }

    rental.status = status
    await rental.save()

    res.status(200).json({
      success: true,
      message: 'Rental status updated',
      rental,
    })
  } catch (error) {
    next(error)
  }
}

export const submitReturnRequest = async (req, res, next) => {
  try {
    const { beforeImages, afterImages } = req.body
    
    const rental = await Rental.findById(req.params.id)
    
    if (!rental) {
      throw new AppError('Rental not found', 404)
    }

    if (rental.buyer.toString() !== req.user.userId) {
      throw new AppError('Only buyer can submit return request', 403)
    }

    if (rental.status !== RENTAL_STATUS.ACTIVE) {
      throw new AppError('Can only return active rentals', 400)
    }

    // Update shipping status
    rental.shippingStatus = 'returned'
    rental.status = RENTAL_STATUS.UNDER_INSPECTION
    await rental.save()

    res.status(200).json({
      success: true,
      message: 'Return request submitted',
      rental,
      beforeImages,
      afterImages,
    })
  } catch (error) {
    next(error)
  }
}
