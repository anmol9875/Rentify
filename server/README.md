# Rentify Backend Server

Backend API for Rentify rental marketplace built with Node.js/Express, MongoDB, and Python AI damage detection.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **AI Module**: Python (Damage Detection)
- **File Upload**: Multer
- **Validation**: Express Validator

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files (database, auth)
│   ├── controllers/      # Business logic for routes
│   ├── middleware/       # Authentication, error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions
│   ├── server.js        # Main app entry
│   └── db.js            # Database connection
├── ai_module/           # Python AI damage detector
├── uploads/             # Temporary file storage
├── .env.example         # Environment variables template
└── package.json         # Dependencies
```

## 🔧 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Python 3.8+ (for AI module)

### Setup

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Update .env with your MongoDB URI and JWT secret
# Then start the server

npm run dev    # Development mode (with nodemon)
npm start      # Production mode
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `PUT /api/users/:id/password` - Change password
- `PUT /api/users/:id/wallet` - Update wallet balance

### Products (Seller)
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Seller only)
- `PUT /api/products/:id` - Update product (Seller only)
- `DELETE /api/products/:id` - Delete product (Seller only)
- `GET /api/products/seller/:sellerId` - Get seller's products

### Rentals
- `GET /api/rentals` - Get user's rentals
- `POST /api/rentals` - Create rental order
- `GET /api/rentals/:id` - Get rental details
- `PUT /api/rentals/:id/status` - Update rental status
- `POST /api/rentals/:id/return` - Submit return request

### Damage Reports
- `GET /api/damage-reports` - Get damage reports
- `POST /api/damage-reports` - Create damage report
- `POST /api/damage-reports/:id/inspect` - AI damage inspection
- `PUT /api/damage-reports/:id/decide` - Seller decides on damage

### Wallet/Transactions
- `GET /api/wallet/:userId` - Get wallet balance
- `GET /api/transactions` - Get transaction history
- `POST /api/transactions/withdraw` - Withdraw funds (Seller)
- `POST /api/transactions/refund` - Process refund

### Cart (Temporary - Frontend can use localStorage)
- `POST /api/cart/add` - Add to cart
- `GET /api/cart` - Get cart items
- `DELETE /api/cart/:itemId` - Remove from cart
- `POST /api/cart/checkout` - Checkout cart

## 🔐 Authentication

All protected routes require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens expire in 7 days by default.

## 🤖 AI Damage Detection Module

Located in `ai_module/` directory.

### Python Setup
```bash
cd ai_module
pip install -r requirements.txt
python app.py
```

### AI Features
- Compares before/after images
- Detects damage with confidence score
- Calculates penalty amounts
- Returns severity level (Minor, Major, Critical)

## 📊 Database Schema

### Collections
- **Users** - User accounts (buyer/seller)
- **Products** - Rental inventory
- **Rentals** - Active and past rentals
- **DamageReports** - Damage inspection records
- **Transactions** - Wallet transactions
- **WalletHistories** - Wallet balance tracking

## 🔄 Key Workflows

### Rental Flow
1. User creates rental order
2. Payment processed
3. Security deposit held
4. Item shipped
5. Item returned
6. AI inspects for damage
7. Seller approves/rejects damage
8. Penalty applied (if damaged)
9. Refunds & earnings processed

### Damage Detection Flow
1. Buyer submits before/after images
2. API sends to Python AI module
3. AI analyzes images
4. Returns confidence score & penalty
5. Seller reviews in dashboard
6. Final decision recorded

## 🐛 Error Handling

All errors return standardized JSON:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## 🚢 Deployment

1. Set `NODE_ENV=production` in .env
2. Update MongoDB to production URI
3. Use strong JWT_SECRET
4. Deploy to Heroku/Vercel/AWS

## 📝 License

ISC
