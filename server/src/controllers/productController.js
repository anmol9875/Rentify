// Controller for product operations, including catalog seeding and seller item management.
import Product from '../models/Product.js'
import Rental from '../models/Rental.js'
import DamageReport from '../models/DamageReport.js'
import User from '../models/User.js'
import { AppError } from '../middleware/errorHandler.js'
import { DEFAULT_PRODUCTS } from '../data/defaultProducts.js'

const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value))

const ensureCatalogSeeded = async () => {
  let owner = await User.findOne({
    role: 'seller',
    fullName: { $regex: /hajira/i },
  })

  if (!owner) {
    owner = await User.findOne({ role: 'seller' }).sort({ createdAt: 1 })
  }

  if (!owner) {
    return
  }

  for (const product of DEFAULT_PRODUCTS) {
    await Product.findOneAndUpdate(
      { catalogId: product.catalogId },
      {
        ...product,
        seller: owner._id,
        inventory: {
          total: 10,
          available: 10,
        },
        isActive: true,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    )
  }

  const catalogProducts = await Product.find({
    catalogId: { $in: DEFAULT_PRODUCTS.map((product) => product.catalogId) },
  }).select('_id')

  const catalogProductIds = catalogProducts.map((product) => product._id)

  if (catalogProductIds.length > 0) {
    await Rental.updateMany(
      { product: { $in: catalogProductIds } },
      { $set: { seller: owner._id } }
    )

    await DamageReport.updateMany(
      { product: { $in: catalogProductIds } },
      { $set: { seller: owner._id } }
    )
  }
}

export const getAllProducts = async (req, res, next) => {
  try {
    await ensureCatalogSeeded()
    const { category, minPrice, maxPrice, search } = req.query
    
    let query = { isActive: true }
    
    if (category) query.category = category
    if (search) query.title = { $regex: search, $options: 'i' }
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = parseInt(minPrice)
      if (maxPrice) query.price.$lte = parseInt(maxPrice)
    }

    const products = await Product.find(query)
      .populate('seller', 'fullName email phone')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    next(error)
  }
}

export const getProductById = async (req, res, next) => {
  try {
    await ensureCatalogSeeded()

    const query = isValidObjectId(req.params.id)
      ? { $or: [{ _id: req.params.id }, { catalogId: req.params.id }] }
      : { catalogId: req.params.id }

    const product = await Product.findOne(query)
      .populate('seller', 'fullName email phone rating')

    if (!product) {
      throw new AppError('Product not found', 404)
    }

    res.status(200).json({
      success: true,
      product,
    })
  } catch (error) {
    next(error)
  }
}

export const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category, duration, image, quantity } = req.body

    if (!title || !description || typeof price !== 'number' || !image) {
      throw new AppError('All fields are required', 400)
    }

    if (title.length < 3 || title.length > 100) {
      throw new AppError('Title must be between 3 and 100 characters', 400)
    }

    if (description.length < 10 || description.length > 500) {
      throw new AppError('Description must be between 10 and 500 characters', 400)
    }

    if (price <= 0 || price > 100000) {
      throw new AppError('Invalid price', 400)
    }

    if (Buffer.byteLength(image, 'utf8') > 12 * 1024 * 1024) {
      throw new AppError('Product image is too large. Please upload a smaller image.', 400)
    }

    const quantityValue = quantity && parseInt(quantity, 10) > 0 ? parseInt(quantity, 10) : 1

    const product = new Product({
      title,
      description,
      price,
      category: category || 'General',
      duration: duration || '5 day',
      image,
      catalogId: `seller-${Date.now()}`,
      seller: req.user.userId,
      inventory: {
        total: quantityValue,
        available: quantityValue,
      },
    })

    await product.save()
    await product.populate('seller', 'fullName email')

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    })
  } catch (error) {
    next(error)
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const { title, description, price, category, duration, image, quantity } = req.body
    
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      throw new AppError('Product not found', 404)
    }

    if (product.seller.toString() !== req.user.userId) {
      throw new AppError('Only product owner can update it', 403)
    }

    if (title !== undefined) {
      if (title.length < 3 || title.length > 100) {
        throw new AppError('Title must be between 3 and 100 characters', 400)
      }
      product.title = title
    }

    if (description !== undefined) {
      if (description.length < 10 || description.length > 500) {
        throw new AppError('Description must be between 10 and 500 characters', 400)
      }
      product.description = description
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || price <= 0 || price > 100000) {
        throw new AppError('Invalid price', 400)
      }
      product.price = price
    }

    if (category) product.category = category
    if (duration) product.duration = duration
    if (quantity !== undefined) {
      const quantityValue = parseInt(quantity, 10)
      if (quantityValue > 0) {
        const currentRented = product.inventory.total - product.inventory.available
        product.inventory.total = quantityValue
        product.inventory.available = Math.max(0, quantityValue - currentRented)
      }
    }
    if (image) {
      if (Buffer.byteLength(image, 'utf8') > 12 * 1024 * 1024) {
        throw new AppError('Product image is too large. Please upload a smaller image.', 400)
      }
      product.image = image
    }

    await product.save()
    await product.populate('seller', 'fullName email')

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      throw new AppError('Product not found', 404)
    }

    if (product.seller.toString() !== req.user.userId) {
      throw new AppError('Only product owner can delete it', 403)
    }

    // Soft delete
    product.isActive = false
    await product.save()

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      seller: req.params.sellerId,
      isActive: true,
    }).populate('seller', 'fullName email rating')

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    next(error)
  }
}

export const getMyProducts = async (req, res, next) => {
  try {
    await ensureCatalogSeeded()
    const products = await Product.find({
      seller: req.user.userId,
      isActive: true,
    }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    next(error)
  }
}
