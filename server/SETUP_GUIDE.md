# Backend Setup & Deployment Guide

Complete guide to set up and run the Rentify backend server.

## 📦 Prerequisites

### Required
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Local](https://docs.mongodb.com/manual/installation/) or [Atlas Cloud](https://www.mongodb.com/cloud/atlas)
- **Python** (3.8 or higher) - [Download](https://www.python.org/)

### Optional
- **Postman** - For API testing [Download](https://www.postman.com/)

## 🚀 Quick Start

### Step 1: Clone & Navigate to Server

```bash
cd server
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

### Step 3: Create Environment File

```bash
# Copy template
cp .env.example .env

# Edit .env with your settings
# Windows: notepad .env
# macOS/Linux: nano .env
```

### Step 4: Configure .env

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/rentify

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Python AI Server
PYTHON_AI_URL=http://localhost:5001

# Frontend
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### Step 5: Start MongoDB

**Local MongoDB:**
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Windows (ensure MongoDB service is running)
net start MongoDB

# Linux
sudo systemctl start mongod
```

**Or use MongoDB Atlas (Cloud):**
- Create cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get connection string
- Update `MONGODB_URI` in .env

### Step 6: Start Express Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

Expected output:
```
✅ Rentify Server running on port 5000
📝 Environment: development
🗄️ Database: mongodb://localhost:27017/rentify
```

### Step 7: Setup Python AI Module (Separate Terminal)

```bash
cd ai_module

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run Python server
python app.py
```

Expected output:
```
 * Running on http://0.0.0.0:5001
```

## ✅ Verify Installation

### Test Node Server

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Test Python AI Service

```bash
curl http://localhost:5001/api/health
```

Response:
```json
{
  "success": true,
  "service": "Damage Analyzer"
}
```

### Test Database Connection

```bash
# Create a user (test database)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123",
    "fullName": "Test User",
    "role": "buyer"
  }'
```

## 📝 Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   └── constants.js      # App constants
│   ├── models/               # MongoDB schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Rental.js
│   │   ├── DamageReport.js
│   │   ├── Transaction.js
│   │   └── WalletHistory.js
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── rentalController.js
│   │   ├── damageReportController.js
│   │   └── transactionController.js
│   ├── routes/               # API endpoints
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── rentalRoutes.js
│   │   ├── damageReportRoutes.js
│   │   └── transactionRoutes.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js           # JWT authentication
│   │   └── errorHandler.js   # Error handling
│   ├── utils/                # Helper functions
│   │   ├── jwt.js
│   │   ├── validation.js
│   │   └── aiService.js      # AI service calls
│   └── server.js             # Main app entry
├── ai_module/
│   ├── damage_analyzer.py    # AI model
│   ├── app.py                # Flask API
│   ├── requirements.txt      # Python dependencies
│   └── README.md
├── .env.example              # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints (Quick Reference)

```
POST   /api/auth/register        - Create new account
POST   /api/auth/login           - Login
GET    /api/auth/me              - Get current user

GET    /api/users/:id            - Get user profile
PUT    /api/users/:id            - Update profile
PUT    /api/users/:id/password   - Change password
GET    /api/users/:id/wallet     - Get wallet balance

GET    /api/products             - Get all products
POST   /api/products             - Create product (seller)
GET    /api/products/:id         - Get product details
PUT    /api/products/:id         - Update product (seller)
DELETE /api/products/:id         - Delete product (seller)

POST   /api/rentals              - Create rental
GET    /api/rentals              - Get user rentals
GET    /api/rentals/:id          - Get rental details
PUT    /api/rentals/:id/status   - Update status
POST   /api/rentals/:id/return   - Submit return

POST   /api/damage-reports       - Create report
POST   /api/damage-reports/analyze - AI analysis
GET    /api/damage-reports       - Get reports
POST   /api/damage-reports/:id/decide - Seller decision

GET    /api/transactions         - Get transaction history
POST   /api/transactions/withdraw - Withdraw funds
GET    /api/transactions/wallet/transactions - Wallet summary
```

See `API_DOCUMENTATION.md` for full details.

## 🔐 Security Best Practices

### Development
```env
JWT_SECRET=dev_secret_key_not_secure
NODE_ENV=development
```

### Production
```env
JWT_SECRET=use_a_long_random_string_here_at_least_32_chars
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

Generate secure secret:
```bash
# macOS/Linux
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Windows
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🧪 Testing Endpoints

### Create Test Account

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@test.com",
    "password": "BuyerPass123",
    "confirmPassword": "BuyerPass123",
    "fullName": "Test Buyer",
    "role": "buyer"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Use Token in Requests

```bash
TOKEN="your_token_here"

# Get profile
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Get products
curl http://localhost:5000/api/products

# Create product (seller only)
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "description": "This is a test product for rental",
    "price": 50,
    "category": "General",
    "image": "base64_image_or_url"
  }'
```

## 🚢 Deployment

### Heroku

```bash
# Create Heroku app
heroku create rentify-backend

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### AWS/DigitalOcean/Linode

1. Create Linux VM
2. Install Node.js and MongoDB
3. Clone repository
4. Install dependencies
5. Set environment variables
6. Start with PM2:

```bash
npm install -g pm2
pm2 start src/server.js --name "rentify"
pm2 start ai_module/app.py --name "rentify-ai"
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
docker build -t rentify-backend .
docker run -p 5000:5000 rentify-backend
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** 
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Use MongoDB Atlas if local not available

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### Python Dependencies Failed
```bash
# Reinstall
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall

# Or use Python 3.8+
python3 -m pip install -r requirements.txt
```

### AI Service Not Responding
- Ensure Python server is running on port 5001
- Check `PYTHON_AI_URL` in Express .env
- Verify both servers are accessible

## 📊 Database Management

### MongoDB Compass (GUI)
[Download MongoDB Compass](https://www.mongodb.com/products/compass)

Connect to local database:
```
mongodb://localhost:27017
```

### Command Line (mongosh)
```bash
# Connect to local database
mongosh

# List databases
show databases

# Use rentify database
use rentify

# List collections
show collections

# View sample user
db.users.findOne()

# Count documents
db.products.countDocuments()
```

## 🔄 Development Workflow

1. Make changes to code
2. Server auto-reloads (nodemon)
3. Test with cURL or Postman
4. Check MongoDB Compass for data
5. Review logs in terminal

## 📞 Support

- Check `README.md` in each folder
- Review API documentation
- Check error messages for hints
- Test endpoints with Postman collection

## ✨ Next Steps

- [ ] Setup frontend to use API
- [ ] Configure HTTPS for production
- [ ] Implement payment processing
- [ ] Add email notifications
- [ ] Setup monitoring/logging
- [ ] Create API rate limiting
- [ ] Add caching layer (Redis)
- [ ] Setup CI/CD pipeline
