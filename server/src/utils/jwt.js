// JWT helper functions for creating and verifying auth tokens.
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const generateToken = (userId, userRole) => {
  return jwt.sign(
    { userId, userRole },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

export const decodeToken = (token) => {
  return jwt.decode(token)
}
