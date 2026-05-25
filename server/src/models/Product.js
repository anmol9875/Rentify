// Mongoose schema for product items available for rent in the catalog.
import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
    },
    catalogId: {
      type: String,
      sparse: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      max: 100000,
    },
    category: {
      type: String,
      default: 'General',
    },
    duration: {
      type: String,
      default: '5 day',
    },
    image: {
      type: String, // Base64 or URL
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inventory: {
      total: {
        type: Number,
        default: 1,
      },
      available: {
        type: Number,
        default: 1,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalRentals: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
)

export default mongoose.model('Product', productSchema)
