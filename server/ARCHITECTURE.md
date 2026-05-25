# Rentify Backend Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vite)                       │
│                   http://localhost:5173                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        │ HTTP/REST      │    JWT Token   │
        │ Requests       │    in Header   │
        │                │                │
        ▼                │                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Express.js API Server (Port 5000)                  │
│  ├─ Auth Routes       (/api/auth/*)                            │
│  ├─ User Routes       (/api/users/*)                           │
│  ├─ Product Routes    (/api/products/*)                        │
│  ├─ Rental Routes     (/api/rentals/*)                         │
│  ├─ Damage Routes     (/api/damage-reports/*)                  │
│  └─ Transaction Routes (/api/transactions/*)                   │
└──┬───────────┬──────────────────────────────────────────────────┘
   │           │
   │           │ HTTP Calls
   │           │ (Image Analysis)
   │           ▼
   │  ┌────────────────────────────────────────────┐
   │  │   Python AI Service (Port 5001)            │
   │  │  ├─ Flask API Server                       │
   │  │  ├─ Damage Analyzer Module                 │
   │  │  ├─ Image Comparison (SSIM)                │
   │  │  ├─ Confidence Scoring                     │
   │  │  └─ Penalty Calculation                    │
   │  └────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────────┐
│           MongoDB Atlas/Local (Port 27017)                      │
│  ├─ Users Collection                                            │
│  ├─ Products Collection                                         │
│  ├─ Rentals Collection                                          │
│  ├─ DamageReports Collection                                    │
│  ├─ Transactions Collection                                     │
│  └─ WalletHistories Collection                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

```
1. User Registration
   └─> POST /api/auth/register
       ├─ Validate input
       ├─ Hash password (bcryptjs)
       ├─ Create user in MongoDB
       └─> Return JWT Token + User Data

2. User Login
   └─> POST /api/auth/login
       ├─ Validate email/password
       ├─ Compare password hash
       ├─ Generate JWT Token
       └─> Return Token + User Data

3. Protected Routes
   └─> Authorization: Bearer <token>
       ├─ Verify JWT signature
       ├─ Extract userId & userRole
       ├─ Attach to req.user
       └─> Process request or reject
```

## 📦 Database Schema Relationships

```
User
  ├─ _id (ObjectId)
  ├─ email (String, unique)
  ├─ password (String, hashed)
  ├─ fullName (String)
  ├─ role (buyer | seller)
  ├─ phone (String)
  ├─ address (Object)
  ├─ walletBalance (Number)
  ├─ totalSpent (Number)
  ├─ totalEarnings (Number)
  └─ timestamps

Product
  ├─ _id (ObjectId)
  ├─ title (String)
  ├─ description (String)
  ├─ price (Number)
  ├─ category (String)
  ├─ image (String - base64/URL)
  ├─ seller → User._id (Reference)
  ├─ inventory { total, available }
  ├─ isActive (Boolean)
  ├─ rating { average, count }
  └─ timestamps

Rental
  ├─ _id (ObjectId)
  ├─ rentalId (String, unique)
  ├─ product → Product._id (Reference)
  ├─ buyer → User._id (Reference)
  ├─ seller → User._id (Reference)
  ├─ startDate (Date)
  ├─ endDate (Date)
  ├─ quantity (Number)
  ├─ basePrice (Number)
  ├─ tax (Number)
  ├─ securityDeposit (Number)
  ├─ totalCost (Number)
  ├─ status (Pending | Active | Under Inspection | Completed)
  ├─ paymentStatus (pending | paid | refunded)
  ├─ deliveryAddress (Object)
  ├─ shippingStatus (pending | shipped | delivered | returned)
  ├─ damageReport → DamageReport._id (Reference)
  ├─ penalty (Number)
  └─ timestamps

DamageReport
  ├─ _id (ObjectId)
  ├─ reportId (String, unique)
  ├─ rental → Rental._id (Reference)
  ├─ product → Product._id (Reference)
  ├─ buyer → User._id (Reference)
  ├─ seller → User._id (Reference)
  ├─ beforeImages (Array of URLs/paths)
  ├─ afterImages (Array of URLs/paths)
  ├─ aiAnalysis {
  │   ├─ damageDetected (Boolean)
  │   ├─ confidence (Number 0-100)
  │   ├─ severity (No Damage | Minor | Major | Critical)
  │   ├─ suggestedPenalty (Number)
  │   ├─ analysis (String)
  │   └─ detectedAreas (Array)
  │ }
  ├─ sellerDecision (pending | approved | rejected)
  ├─ sellerNotes (String)
  ├─ finalPenalty (Number)
  ├─ refundAmount (Number)
  ├─ status (pending | approved | rejected | resolved)
  └─ timestamps

Transaction
  ├─ _id (ObjectId)
  ├─ transactionId (String, unique)
  ├─ user → User._id (Reference)
  ├─ type (rental | refund | penalty | withdrawal | security_deposit)
  ├─ amount (Number)
  ├─ description (String)
  ├─ rental → Rental._id (Reference)
  ├─ damageReport → DamageReport._id (Reference)
  ├─ paymentMethod (String)
  ├─ status (pending | completed | failed | cancelled)
  └─ timestamps

WalletHistory
  ├─ _id (ObjectId)
  ├─ user → User._id (Reference)
  ├─ previousBalance (Number)
  ├─ amount (Number)
  ├─ newBalance (Number)
  ├─ transaction → Transaction._id (Reference)
  ├─ action (debit | credit)
  ├─ description (String)
  └─ timestamps
```

## 🔄 Key Workflows

### Complete Rental Transaction
```
1. Browse Products
   ├─ GET /api/products
   └─ Display all available items

2. View Product Details
   ├─ GET /api/products/:id
   └─ Show price, description, images

3. Create Rental Order
   ├─ POST /api/rentals
   ├─ Calculate: basePrice × days
   ├─ Add: tax (10%), securityDeposit ($100)
   ├─ Create Rental (status: Pending)
   └─ Create Transaction record

4. Buyer Returns Item
   ├─ POST /api/rentals/:id/return
   ├─ Upload before/after images
   ├─ Set status: Under Inspection
   └─ Notify seller

5. AI Damage Analysis
   ├─ POST /api/damage-reports/analyze
   ├─ Send images to Python service
   ├─ Python service:
   │  ├─ Load and preprocess images
   │  ├─ Calculate SSIM (similarity)
   │  ├─ Detect damage areas
   │  ├─ Classify severity
   │  └─ Return analysis + penalty
   └─ Save analysis to MongoDB

6. Seller Reviews Damage
   ├─ GET /api/damage-reports?role=seller
   ├─ View before/after images
   ├─ See AI analysis + confidence
   └─ Make decision

7. Seller Approves/Rejects
   ├─ POST /api/damage-reports/:id/decide
   ├─ If approved:
   │  ├─ Deduct penalty from buyer wallet
   │  ├─ Credit penalty to seller wallet
   │  └─ Update rental status: Completed
   └─ If rejected:
      ├─ Full refund to buyer
      └─ No penalty

8. Complete
   ├─ Both wallets updated
   ├─ Transaction recorded
   ├─ Rental marked Completed
   └─ Funds transferred
```

### Seller Product Listing
```
1. Seller Login → GET /api/auth/me (verify role)
2. POST /api/products with:
   ├─ title, description, price
   ├─ category, image (base64)
   ├─ seller = req.user.userId
3. Product saved to MongoDB
4. Appears in /api/products list
5. Only seller can update/delete (middleware check)
```

### Seller Withdrawal
```
1. Seller checks balance
   ├─ GET /api/users/:id/wallet
   └─ See available balance

2. Initiates withdrawal
   ├─ POST /api/transactions/withdraw
   ├─ Choose method: bank, easypaisa, jazzcash
   ├─ Specify amount
   └─ Create transaction

3. Wallet updated
   ├─ Balance decreased
   ├─ Transaction recorded
   ├─ WalletHistory logged
   └─ Funds transferred to chosen method
```

## 🛡️ Middleware Stack

```
Frontend Request
    │
    ▼
CORS Middleware (Check origin)
    │
    ▼
Express JSON Parser
    │
    ▼
Auth Middleware (if route is protected)
    │
    ├─ Extract JWT from header
    ├─ Verify signature
    ├─ Check expiration
    ├─ Attach user data to req
    └─ Continue or reject

    ▼
Role Check Middleware (if needed)
    ├─ Check req.user.userRole
    ├─ Allow if seller/buyer
    └─ Reject otherwise

    ▼
Route Handler (Controller)
    │
    ├─ Validate input
    ├─ Query database
    ├─ Business logic
    ├─ Return response
    └─ Handle errors

    ▼
Error Handler Middleware
    ├─ Catch all errors
    ├─ Format response
    ├─ Send to client
    └─ Log error

    ▼
Response to Client
```

## 📡 API Flow Example

### User Creates Rental

```
Frontend
  │
  ├─ User clicks "Rent Now"
  │
  ├─ POST /api/rentals
  │  ├─ Body: {
  │  │  "productId": "...",
  │  │  "startDate": "2025-12-20",
  │  │  "endDate": "2025-12-25",
  │  │  "quantity": 1,
  │  │  "deliveryAddress": { ... }
  │  │ }
  │  └─ Header: Authorization: Bearer <token>
  │
  ▼
Express Server
  │
  ├─ Auth Middleware: Verify token
  │
  ├─ Rental Controller:
  │  ├─ Validate input
  │  ├─ Check product exists & active
  │  ├─ Calculate pricing:
  │  │  ├─ Days = 5
  │  │  ├─ basePrice = product.price × quantity × (days/5) = 100 × 1 × 1 = 100
  │  │  ├─ tax = 100 × 0.10 = 10
  │  │  ├─ securityDeposit = 100
  │  │  └─ totalCost = 210
  │  │
  │  ├─ Create Rental document:
  │  │  ├─ rentalId: "R1699123456789"
  │  │  ├─ buyer: userId
  │  │  ├─ seller: product.seller
  │  │  ├─ status: "Pending"
  │  │  └─ Save to MongoDB
  │  │
  │  ├─ Create Transaction:
  │  │  ├─ transactionId: "TXN1699123456789"
  │  │  ├─ type: "rental"
  │  │  ├─ amount: 210
  │  │  └─ status: "pending"
  │  │
  │  └─ Return response with rental details
  │
  ▼
Error Handler (if any error)
  │
  └─ Return error response with statusCode
  │
  ▼
Frontend
  │
  ├─ Extract token from response
  ├─ Save order details
  ├─ Redirect to order confirmation
  └─ Display success message
```

## 🔌 External Integrations (Future)

```
Payment Gateway (Stripe/2Checkout)
  └─> Process checkout payments
  └─> Handle refunds

Email Service (SendGrid/AWS SES)
  └─> Order confirmations
  └─> Return/damage notifications
  └─> Withdrawal confirmations

Storage (AWS S3/GCS)
  └─> Store item images
  └─> Store damage report images

Analytics (Google Analytics/Mixpanel)
  └─> Track rental metrics
  └─> User behavior analysis
```

## 📊 Performance Considerations

```
Database Indexing
  ├─ Users: index on email (unique)
  ├─ Products: index on seller, isActive
  ├─ Rentals: index on buyer, seller, status
  ├─ DamageReports: index on rental, status, seller
  └─ Transactions: index on user, createdAt

Caching Layer (Future)
  ├─ Cache products list
  ├─ Cache user profiles
  ├─ Cache wallet balance
  └─ Invalidate on updates

API Rate Limiting (Future)
  ├─ 100 requests/minute per IP
  ├─ 10 rental creates/hour per user
  └─ Protect against abuse
```

## 🚀 Deployment Checklist

```
Before Production:
  ☐ Set NODE_ENV=production
  ☐ Use strong JWT_SECRET (32+ chars)
  ☐ Use production MongoDB URI
  ☐ Set FRONTEND_URL to production domain
  ☐ Enable HTTPS/SSL
  ☐ Setup monitoring & logging
  ☐ Configure error tracking (Sentry)
  ☐ Setup automated backups
  ☐ Configure CDN for images
  ☐ Setup CI/CD pipeline
  ☐ Load test the API
  ☐ Security audit & penetration testing
  ☐ Document API changes
  ☐ Setup status page
  ☐ Create runbooks for operations
```

---

**Complete backend system ready for integration with frontend!**
