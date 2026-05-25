// Controller for user profile updates, password changes, and wallet balance management.
import User from '../models/User.js'
import { hashPassword, comparePassword, validatePassword } from '../utils/validation.js'
import { AppError } from '../middleware/errorHandler.js'

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    
    if (!user) {
      throw new AppError('User not found', 404)
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    next(error)
  }
}

export const updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, phone, address } = req.body
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        fullName,
        phone,
        address,
      },
      { new: true }
    ).select('-password')

    if (!user) {
      throw new AppError('User not found', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    })
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new AppError('All password fields are required', 400)
    }

    const user = await User.findById(req.user.userId)
    
    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.password)
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401)
    }

    if (newPassword !== confirmPassword) {
      throw new AppError('New passwords do not match', 400)
    }

    if (!validatePassword(newPassword)) {
      throw new AppError('Password must contain uppercase, lowercase, number and be at least 8 characters', 400)
    }

    if (currentPassword === newPassword) {
      throw new AppError('New password must be different from current password', 400)
    }

    // Hash and update password
    user.password = await hashPassword(newPassword)
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const getWalletBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
    
    if (!user) {
      throw new AppError('User not found', 404)
    }

    res.status(200).json({
      success: true,
      balance: user.walletBalance,
      totalSpent: user.totalSpent,
      totalEarnings: user.totalEarnings,
    })
  } catch (error) {
    next(error)
  }
}

export const updateWalletBalance = async (req, res, next) => {
  try {
    const { amount, action } = req.body // action: 'credit' or 'debit'

    if (typeof amount !== 'number' || amount <= 0) {
      throw new AppError('Invalid amount', 400)
    }

    const user = await User.findById(req.user.userId)
    
    if (!user) {
      throw new AppError('User not found', 404)
    }

    if (action === 'debit') {
      if (user.walletBalance < amount) {
        throw new AppError('Insufficient wallet balance', 400)
      }
      user.walletBalance -= amount
    } else if (action === 'credit') {
      user.walletBalance += amount
    } else {
      throw new AppError('Invalid action', 400)
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Wallet updated successfully',
      newBalance: user.walletBalance,
    })
  } catch (error) {
    next(error)
  }
}
