// Mongoose schema for rental orders and rental lifecycle tracking.
import mongoose from 'mongoose'
import { RENTAL_STATUS } from '../config/constants.js'

const rentalSchema = new mongoose.Schema(
  {
    rentalId: {
      type: String,
      unique: true,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    securityDeposit: {
      type: Number,
      default: 100,
    },
    totalCost: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        RENTAL_STATUS.PENDING,
        RENTAL_STATUS.ACTIVE,
        RENTAL_STATUS.UNDER_INSPECTION,
        RENTAL_STATUS.COMPLETED,
        RENTAL_STATUS.CANCELLED,
      ],
      default: RENTAL_STATUS.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'partial'],
      default: 'pending',
    },
    deliveryAddress: {
      street: String,
      city: String,
      zipCode: String,
      country: String,
      phone: String,
    },
    shippingStatus: {
      type: String,
      enum: ['pending', 'shipped', 'delivered', 'returned'],
      default: 'pending',
    },
    damageReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DamageReport',
    },
    penalty: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Rental', rentalSchema)
