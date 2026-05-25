// Controller handling authentication actions like register, login, and current user retrieval.
import User from '../models/User.js'
import { hashPassword, comparePassword, validateEmail, validatePassword } from '../utils/validation.js'
import { generateToken } from '../utils/jwt.js'
import { AppError } from '../middleware/errorHandler.js'

export const register = async (req, res, next) => {
  try {
    const { email, password, confirmPassword, fullName, role } = req.body

    // Validation
    if (!email || !password || !confirmPassword || !fullName || !role) {
      throw new AppError('All fields are required', 400)
    }

    if (!validateEmail(email)) {
      throw new AppError('Invalid email format', 400)
    }

    if (!validatePassword(password)) {
      throw new AppError('Password must contain uppercase, lowercase, number and be at least 8 characters', 400)
    }

    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', 400)
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new AppError('Email already registered', 400)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      fullName,
      role,
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id, user.role)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw new AppError('Email and password are required', 400)
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      const existingUsers = await User.find().select('password')
      let passwordMatchesExistingUser = false

      for (const existingUser of existingUsers) {
        const passwordMatches = await comparePassword(password, existingUser.password)
        if (passwordMatches) {
          passwordMatchesExistingUser = true
          break
        }
      }

      throw new AppError(
        passwordMatchesExistingUser ? 'Wrong email' : 'Wrong email and password',
        401
      )
    }

    // Check password
    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      throw new AppError('Wrong password', 401)
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('User account is inactive', 403)
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user._id, user.role)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        walletBalance: user.walletBalance,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
    
    if (!user) {
      throw new AppError('User not found', 404)
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        address: user.address,
        walletBalance: user.walletBalance,
        totalSpent: user.totalSpent,
        totalEarnings: user.totalEarnings,
      },
    })
  } catch (error) {
    next(error)
  }
}
