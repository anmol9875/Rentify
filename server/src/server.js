// Main Express server startup file that loads middleware, routes, and database connection.
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/database.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

// Import routes
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import rentalRoutes from './routes/rentalRoutes.js'
import damageReportRoutes from './routes/damageReportRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const PORT = process.env.PORT || 5000
let pythonProcess = null

// Function to start Python AI app
const startPythonApp = () => {
  const pythonAppPath = path.join(__dirname, '../ai_module')
  
  console.log('🚀 Starting Python AI app...')
  
  try {
    pythonProcess = spawn('python', ['app.py'], {
      cwd: pythonAppPath,
      stdio: 'inherit', // This pipes Python output to Node's console
      shell: true,
    })

    pythonProcess.on('error', (error) => {
      console.error('❌ Failed to start Python app:', error.message)
    })

    pythonProcess.on('exit', (code) => {
      if (code !== 0) {
        console.warn(`⚠️ Python app exited with code ${code}`)
      }
    })
  } catch (error) {
    console.error('❌ Error spawning Python process:', error.message)
  }
}

// Graceful shutdown for Python process
process.on('exit', () => {
  if (pythonProcess) {
    pythonProcess.kill()
  }
})

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...')
  if (pythonProcess) {
    pythonProcess.kill()
  }
  process.exit(0)
})

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Connect to MongoDB
connectDB()

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/rentals', rentalRoutes)
app.use('/api/damage-reports', damageReportRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/reviews', reviewRoutes)

// 404 handler
app.use(notFoundHandler)

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`✅ Rentify Server running on port ${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🗄️ Database: ${process.env.MONGODB_URI}`)
  
  // Start Python AI app after Node server is ready
  startPythonApp()
})

export default app
