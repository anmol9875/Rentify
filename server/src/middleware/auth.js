// Middleware to verify JWT tokens and protect routes that require login.
import { verifyToken } from '../utils/jwt.js'

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        statusCode: 401,
      })
    }

    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        statusCode: 401,
      })
    }

    req.user = {
      userId: decoded.userId,
      userRole: decoded.userRole,
    }
    
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      statusCode: 401,
    })
  }
}

export const sellerOnly = (req, res, next) => {
  if (req.user?.userRole !== 'seller') {
    return res.status(403).json({
      success: false,
      error: 'Only sellers can access this resource',
      statusCode: 403,
    })
  }
  next()
}

export const buyerOnly = (req, res, next) => {
  if (req.user?.userRole !== 'buyer') {
    return res.status(403).json({
      success: false,
      error: 'Only buyers can access this resource',
      statusCode: 403,
    })
  }
  next()
}
