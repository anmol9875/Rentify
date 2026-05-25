# Rentify Backend API Documentation

Complete API reference for the Rentify rental platform backend.

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Tokens are obtained via `/api/auth/login` and expire in 7 days.

---

## 📋 API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "fullName": "John Doe",
  "role": "buyer" | "seller"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiI...",
  "user": {
    "id": "userId",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "buyer"
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiI...",
  "user": {
    "id": "userId",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "buyer",
    "walletBalance": 0
  }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": {
    "id": "userId",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "buyer",
    "phone": "+923331560377",
    "address": { ... },
    "walletBalance": 2500,
    "totalSpent": 5400,
    "totalEarnings": 0
  }
}
```

---

### User Management Endpoints

#### Get User Profile
```
GET /api/users/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": { ... }
}
```

#### Update User Profile
```
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Doe Updated",
  "phone": "+923331560377",
  "address": {
    "street": "123 Main St",
    "city": "Karachi",
    "zipCode": "75500",
    "country": "Pakistan"
  }
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

#### Change Password
```
PUT /api/users/:id/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456",
  "confirmPassword": "NewPass456"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Get Wallet Balance
```
GET /api/users/:id/wallet
Authorization: Bearer <token>

Response:
{
  "success": true,
  "balance": 2500,
  "totalSpent": 5400,
  "totalEarnings": 0
}
```

---

### Product Management Endpoints

#### Get All Products
```
GET /api/products
Query Parameters:
  - category?: string
  - minPrice?: number
  - maxPrice?: number
  - search?: string

Response:
{
  "success": true,
  "count": 10,
  "products": [
    {
      "_id": "productId",
      "title": "Circle Arch 7' - White",
      "description": "...",
      "price": 100,
      "category": "General",
      "image": "base64...",
      "seller": { id, fullName, email },
      "inventory": { total: 1, available: 1 },
      "rating": { average: 4.5, count: 10 }
    }
  ]
}
```

#### Get Product by ID
```
GET /api/products/:id

Response:
{
  "success": true,
  "product": { ... }
}
```

#### Get Seller's Products
```
GET /api/products/seller/:sellerId

Response:
{
  "success": true,
  "count": 5,
  "products": [ ... ]
}
```

#### Create Product (Seller Only)
```
POST /api/products
Authorization: Bearer <token> (Must be seller)
Content-Type: application/json

{
  "title": "Elegant Chiavari Chair",
  "description": "Premium gold Chiavari chairs perfect for weddings...",
  "price": 12,
  "category": "Furniture",
  "image": "base64_encoded_image_or_url"
}

Response:
{
  "success": true,
  "message": "Product created successfully",
  "product": { ... }
}
```

#### Update Product (Seller Only)
```
PUT /api/products/:id
Authorization: Bearer <token> (Must be seller/owner)
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 15,
  "category": "Furniture"
}

Response:
{
  "success": true,
  "message": "Product updated successfully",
  "product": { ... }
}
```

#### Delete Product (Seller Only)
```
DELETE /api/products/:id
Authorization: Bearer <token> (Must be seller/owner)

Response:
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### Rental Endpoints

#### Create Rental
```
POST /api/rentals
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "61a5....",
  "startDate": "2025-12-20",
  "endDate": "2025-12-25",
  "quantity": 1,
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Karachi",
    "zipCode": "75500",
    "country": "Pakistan",
    "phone": "+923331560377"
  }
}

Response:
{
  "success": true,
  "message": "Rental created successfully",
  "rental": {
    "_id": "rentalId",
    "rentalId": "R1699...",
    "product": { ... },
    "buyer": { ... },
    "seller": { ... },
    "startDate": "2025-12-20",
    "endDate": "2025-12-25",
    "basePrice": 100,
    "tax": 10,
    "securityDeposit": 100,
    "totalCost": 210,
    "status": "Pending",
    "paymentStatus": "pending"
  },
  "transaction": "TXN..."
}
```

#### Get User's Rentals
```
GET /api/rentals
Authorization: Bearer <token>
Query Parameters:
  - role?: "buyer" | "seller"
  - status?: "Pending" | "Active" | "Under Inspection" | "Completed"

Response:
{
  "success": true,
  "count": 5,
  "rentals": [ ... ]
}
```

#### Get Rental by ID
```
GET /api/rentals/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "rental": { ... }
}
```

#### Update Rental Status
```
PUT /api/rentals/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Active" | "Under Inspection" | "Completed"
}

Response:
{
  "success": true,
  "message": "Rental status updated",
  "rental": { ... }
}
```

#### Submit Return Request
```
POST /api/rentals/:id/return
Authorization: Bearer <token> (Must be buyer)
Content-Type: application/json

{
  "beforeImages": ["image1_base64", "image2_base64"],
  "afterImages": ["image1_base64", "image2_base64"]
}

Response:
{
  "success": true,
  "message": "Return request submitted",
  "rental": { ... },
  "beforeImages": [...],
  "afterImages": [...]
}
```

---

### Damage Report Endpoints

#### Create Damage Report
```
POST /api/damage-reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "rentalId": "rentalId",
  "beforeImages": ["base64_image1", "base64_image2"],
  "afterImages": ["base64_image1", "base64_image2"]
}

Response:
{
  "success": true,
  "message": "Damage report created",
  "report": {
    "_id": "reportId",
    "reportId": "D1699...",
    "rental": "rentalId",
    "product": "productId",
    "buyer": "buyerId",
    "seller": "sellerId",
    "status": "pending"
  }
}
```

#### Analyze Damage (AI Analysis)
```
POST /api/damage-reports/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "reportId": "reportId",
  "beforeImagePath": "path/to/before.jpg or data:image/...",
  "afterImagePath": "path/to/after.jpg or data:image/..."
}

Response:
{
  "success": true,
  "message": "Damage analysis completed",
  "analysis": {
    "damageDetected": true,
    "confidence": 87,
    "severity": "Minor",
    "suggestedPenalty": 75,
    "analysis": "Minor damage detected...",
    "detectedAreas": [
      { "x": 150, "y": 200, "width": 50, "height": 40 }
    ]
  }
}
```

#### Get Damage Reports
```
GET /api/damage-reports
Authorization: Bearer <token>
Query Parameters:
  - role?: "seller" | "buyer"
  - status?: "pending" | "approved" | "rejected" | "resolved"

Response:
{
  "success": true,
  "count": 3,
  "reports": [ ... ]
}
```

#### Seller Makes Decision on Damage
```
POST /api/damage-reports/:id/decide
Authorization: Bearer <token> (Must be seller)
Content-Type: application/json

{
  "reportId": "reportId",
  "decision": "approved" | "rejected",
  "notes": "Optional notes about the decision"
}

Response:
{
  "success": true,
  "message": "Damage decision approved",
  "finalPenalty": 75,
  "refundAmount": 25
}
```

#### Get Damage Report by ID
```
GET /api/damage-reports/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "report": { ... }
}
```

---

### Transaction & Wallet Endpoints

#### Get Transaction History
```
GET /api/transactions
Authorization: Bearer <token>
Query Parameters:
  - limit?: number (default: 50)

Response:
{
  "success": true,
  "count": 10,
  "transactions": [
    {
      "_id": "txnId",
      "transactionId": "TXN...",
      "user": "userId",
      "type": "rental" | "refund" | "penalty" | "withdrawal",
      "amount": 210,
      "description": "Rental for Circle Arch 7' - White",
      "status": "completed",
      "createdAt": "2025-02-20..."
    }
  ]
}
```

#### Get Transaction by ID
```
GET /api/transactions/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "transaction": { ... }
}
```

#### Get Wallet Transactions Summary
```
GET /api/transactions/wallet/transactions
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 15,
  "transactions": [...],
  "summary": {
    "totalRentals": 2100,
    "totalRefunds": 100,
    "totalPenalties": 75,
    "totalWithdrawals": 500
  }
}
```

#### Process Withdrawal (Seller)
```
POST /api/transactions/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500,
  "method": "bank" | "easypaisa" | "jazzcash"
}

Response:
{
  "success": true,
  "message": "Withdrawal processed successfully",
  "newBalance": 3000,
  "transaction": "TXN..."
}
```

---

## 📊 Response Format

All responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Optional message",
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

## 🔍 Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 Testing

Use tools like Postman or cURL to test endpoints:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123",
    "fullName": "Test User",
    "role": "buyer"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Get Products
curl http://localhost:5000/api/products
```

---

## 🔄 Common Workflows

### Complete Rental Transaction
1. GET /api/products (Browse)
2. POST /api/rentals (Create rental order)
3. POST /api/damage-reports (Submit return)
4. POST /api/damage-reports/analyze (AI inspects)
5. POST /api/damage-reports/:id/decide (Seller decides)
6. GET /api/transactions/wallet/transactions (Check summary)

### Seller Workflow
1. POST /api/products (List item)
2. GET /api/rentals (Check active rentals)
3. POST /api/damage-reports/:id/decide (Review damage)
4. POST /api/transactions/withdraw (Withdraw earnings)

---

## ⚠️ Error Handling

Common errors:

```json
{
  "success": false,
  "error": "No token provided",
  "statusCode": 401
}
```

```json
{
  "success": false,
  "error": "Invalid or expired token",
  "statusCode": 401
}
```

```json
{
  "success": false,
  "error": "Only sellers can access this resource",
  "statusCode": 403
}
```

---

## 🚀 Environment Variables

See `.env.example` for required configuration.

Key variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PYTHON_AI_URL` - URL to Python AI service
- `PORT` - Server port
- `FRONTEND_URL` - Frontend origin for CORS
