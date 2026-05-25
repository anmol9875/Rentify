import Review from '../models/Review.js'
import Rental from '../models/Rental.js'
import Product from '../models/Product.js'
import { AppError } from '../middleware/errorHandler.js'

export const submitReview = async (req, res, next) => {
  try {
    const { rentalId, rating, review = '' } = req.body

    if (!rentalId || !rating) {
      throw new AppError('Rental and rating are required', 400)
    }

    const normalizedRating = Number(rating)
    if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400)
    }

    if (review.length > 500) {
      throw new AppError('Review must be less than 500 characters', 400)
    }

    const rental = await Rental.findById(rentalId)
    if (!rental) {
      throw new AppError('Rental not found', 404)
    }

    if (rental.buyer.toString() !== req.user.userId) {
      throw new AppError('Only the buyer can review this rental', 403)
    }

    const savedReview = await Review.findOneAndUpdate(
      { rental: rental._id },
      {
        rental: rental._id,
        product: rental.product,
        buyer: rental.buyer,
        seller: rental.seller,
        rating: normalizedRating,
        review: review.trim(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    )

    const productReviews = await Review.find({ product: rental.product })
    const ratingTotal = productReviews.reduce((sum, item) => sum + Number(item.rating || 0), 0)
    const average = productReviews.length > 0 ? ratingTotal / productReviews.length : 0

    await Product.findByIdAndUpdate(rental.product, {
      rating: {
        average,
        count: productReviews.length,
      },
    })

    res.status(200).json({
      success: true,
      message: 'Review submitted successfully',
      review: savedReview,
    })
  } catch (error) {
    next(error)
  }
}
