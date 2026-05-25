// Error handling middleware that formats API errors and 404 responses.
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  return res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    error: 'Route not found',
    statusCode: 404,
  })
}

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}
