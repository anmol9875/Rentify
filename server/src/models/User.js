// Mongoose schema for user accounts, roles, and authentication info.
import mongoose from 'mongoose'
import { USER_ROLES } from '../config/constants.js'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    fullName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [USER_ROLES.BUYER, USER_ROLES.SELLER],
      default: USER_ROLES.BUYER,
    },
    phone: {
      type: String,
      required: false,
    },
    profileImage: {
      type: String,
      required: false,
    },
    address: {
      street: String,
      city: String,
      zipCode: String,
      country: {
        type: String,
        default: 'Pakistan',
      },
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
