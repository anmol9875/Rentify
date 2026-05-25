# 📚 Backend Documentation Index

Welcome to the Rentify Backend! This index helps you navigate all documentation files.

## 🎯 Start Here

### First Time Setup?
→ **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Step-by-step installation and running instructions

### Want a Quick Overview?
→ **[BACKEND_SUMMARY.md](./BACKEND_SUMMARY.md)** - What's included, features, and quick start

### Need to Build Something?
→ **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with cURL examples

### Curious About Architecture?
→ **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, workflows, and data flow

### Understanding the Code?
→ **[FILE_STRUCTURE.md](./FILE_STRUCTURE.md)** - File organization and navigation guide

---

## 📖 Documentation Files

### Setup & Getting Started
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Installation, running, troubleshooting, deployment
- **[README.md](./README.md)** - Project overview and tech stack
- **[BACKEND_SUMMARY.md](./BACKEND_SUMMARY.md)** - Features, checklist, next steps

### Development & Integration
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - All 33 endpoints with request/response examples
- **[FILE_STRUCTURE.md](./FILE_STRUCTURE.md)** - File organization and code navigation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and workflows

### Configuration
- **.env.example** - Environment variables template
- **ai_module/.env.example** - Python AI module env template

---

## 🚀 Quick Links

### Common Tasks

#### I want to...

**Install and run the backend**
1. Copy `.env.example` to `.env`
2. Configure MongoDB URI
3. `npm install`
4. `npm run dev`
→ See: [SETUP_GUIDE.md - Quick Start](./SETUP_GUIDE.md#quick-start)

**Start the Python AI service**
1. `cd ai_module`
2. Setup Python virtual environment
3. `pip install -r requirements.txt`
4. `python app.py`
→ See: [ai_module/README.md](./ai_module/README.md)

**Create an API endpoint**
1. Create controller in `src/controllers/`
2. Add route in `src/routes/`
3. Register route in `src/server.js`
→ See: [ARCHITECTURE.md - API Flow](./ARCHITECTURE.md#-api-flow-example)

**Test API endpoints**
1. Use Postman or cURL
2. Include JWT token in Authorization header
3. Follow request/response format
→ See: [API_DOCUMENTATION.md - Testing](./API_DOCUMENTATION.md#-testing)

**Deploy to production**
1. Update `.env` with production values
2. Use strong JWT_SECRET
3. Connect to production MongoDB
4. Deploy to Heroku/AWS/etc
→ See: [SETUP_GUIDE.md - Deployment](./SETUP_GUIDE.md#-deployment)

---

## 🏛️ Documentation Structure

```
README.md                          ← Start here for overview
    ↓
SETUP_GUIDE.md                     ← Install and run
    ├→ BACKEND_SUMMARY.md          ← Features overview
    ├→ FILE_STRUCTURE.md           ← Code organization
    │
API_DOCUMENTATION.md               ← Build with API
    ├→ ARCHITECTURE.md             ← Understand design
    ├→ src/controllers/*.js        ← Implementation
    └→ src/routes/*.js             ← Endpoints

ai_module/README.md                ← AI system details
    └→ ai_module/*.py              ← Python code
```

---

## 📋 What You Get

### Documentation
- ✅ 5 comprehensive markdown guides
- ✅ 33 API endpoints documented
- ✅ Complete code examples
- ✅ Architecture diagrams
- ✅ Troubleshooting guide

### Code
- ✅ 6 MongoDB schemas
- ✅ 6 Controllers (business logic)
- ✅ 6 Route files
- ✅ 2 Middleware files
- ✅ 3 Utility files
- ✅ Python AI service

### Configuration
- ✅ Express.js setup
- ✅ MongoDB connection
- ✅ JWT authentication
- ✅ CORS support
- ✅ Error handling

---

## 🔍 Finding Things

### By Feature

**Authentication**
- Concepts: [ARCHITECTURE.md - Authentication Flow](./ARCHITECTURE.md#-authentication-flow)
- API: [API_DOCUMENTATION.md - Auth Endpoints](./API_DOCUMENTATION.md#authentication-endpoints)
- Code: `src/controllers/authController.js` & `src/middleware/auth.js`

**Products**
- Concepts: [ARCHITECTURE.md - Seller Product Listing](./ARCHITECTURE.md#seller-product-listing)
- API: [API_DOCUMENTATION.md - Product Endpoints](./API_DOCUMENTATION.md#product-management-endpoints)
- Code: `src/controllers/productController.js`

**Rentals**
- Concepts: [ARCHITECTURE.md - Complete Rental Transaction](./ARCHITECTURE.md#complete-rental-transaction)
- API: [API_DOCUMENTATION.md - Rental Endpoints](./API_DOCUMENTATION.md#rental-endpoints)
- Code: `src/controllers/rentalController.js`

**Damage Detection**
- Concepts: [ARCHITECTURE.md - Damage Detection Flow](./ARCHITECTURE.md#-key-workflows)
- API: [API_DOCUMENTATION.md - Damage Report Endpoints](./API_DOCUMENTATION.md#damage-report-endpoints)
- Code: `src/controllers/damageReportController.js` & `ai_module/damage_analyzer.py`

**Wallet/Transactions**
- Concepts: [ARCHITECTURE.md - Wallet System](./ARCHITECTURE.md#-external-integrations-future)
- API: [API_DOCUMENTATION.md - Transaction Endpoints](./API_DOCUMENTATION.md#transaction--wallet-endpoints)
- Code: `src/controllers/transactionController.js`

### By Technology

**Express.js**
- Setup: [SETUP_GUIDE.md - Quick Start](./SETUP_GUIDE.md#quick-start)
- Routing: [FILE_STRUCTURE.md - Routes Layer](./FILE_STRUCTURE.md#-routes-layer)
- Middleware: [ARCHITECTURE.md - Middleware Stack](./ARCHITECTURE.md#-middleware-stack)

**MongoDB**
- Schemas: [ARCHITECTURE.md - Database Schema](./ARCHITECTURE.md#-database-schema-relationships)
- Models: [FILE_STRUCTURE.md - Database Layer](./FILE_STRUCTURE.md#database-layer)
- Setup: [SETUP_GUIDE.md - Database Management](./SETUP_GUIDE.md#-database-management)

**JWT Authentication**
- Concepts: [ARCHITECTURE.md - Authentication](./ARCHITECTURE.md#-authentication-flow)
- Implementation: `src/utils/jwt.js`
- Middleware: `src/middleware/auth.js`

**Python AI**
- Setup: [ai_module/README.md](./ai_module/README.md)
- How it works: [ai_module/README.md - How It Works](./ai_module/README.md#-how-it-works)
- Integration: [ARCHITECTURE.md - System Architecture](./ARCHITECTURE.md#-system-architecture)

---

## 🧪 Testing

### Manual Testing
→ [API_DOCUMENTATION.md - Testing](./API_DOCUMENTATION.md#-testing-the-api)

### Common Test Cases

**User Registration**
```bash
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

**Create Product**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Product Name",
    "description": "Product description",
    "price": 50,
    "category": "General",
    "image": "image_url_or_base64"
  }'
```

**Create Rental**
```bash
curl -X POST http://localhost:5000/api/rentals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "productId",
    "startDate": "2025-12-20",
    "endDate": "2025-12-25",
    "quantity": 1,
    "deliveryAddress": { "street": "...", "city": "...", "zipCode": "...", "country": "Pakistan", "phone": "..." }
  }'
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for all examples.

---

## 🚢 Deployment

### Quick Deployment to Heroku
→ [SETUP_GUIDE.md - Heroku Deployment](./SETUP_GUIDE.md#heroku)

### AWS/Cloud Deployment
→ [SETUP_GUIDE.md - AWS/DigitalOcean/Linode](./SETUP_GUIDE.md#awsdigitalocelindoe)

### Docker Deployment
→ [SETUP_GUIDE.md - Using Docker](./SETUP_GUIDE.md#using-docker)

---

## 🐛 Troubleshooting

### Common Issues
→ [SETUP_GUIDE.md - Troubleshooting](./SETUP_GUIDE.md#-troubleshooting)

- MongoDB connection error
- Port already in use
- Python dependencies failed
- AI service not responding

---

## 🎓 Learning Path

1. **Understand the System**
   → Read: [README.md](./README.md) (5 min)

2. **Set Up Locally**
   → Follow: [SETUP_GUIDE.md - Quick Start](./SETUP_GUIDE.md#quick-start) (15 min)

3. **Explore the Code**
   → Review: [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) (10 min)

4. **Test an Endpoint**
   → Use: [API_DOCUMENTATION.md - Testing](./API_DOCUMENTATION.md#-testing-the-api) (10 min)

5. **Understand Architecture**
   → Study: [ARCHITECTURE.md](./ARCHITECTURE.md) (20 min)

6. **Integrate with Frontend**
   → Reference: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoints

**Total Time: ~60 minutes** to full understanding!

---

## 📞 Support

### I'm stuck on...

**Installation?**
→ [SETUP_GUIDE.md](./SETUP_GUIDE.md)

**API Integration?**
→ [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**Understanding the code?**
→ [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) + [ARCHITECTURE.md](./ARCHITECTURE.md)

**Deploying?**
→ [SETUP_GUIDE.md - Deployment](./SETUP_GUIDE.md#-deployment)

**AI module?**
→ [ai_module/README.md](./ai_module/README.md)

---

## ✨ Features by Documentation

### Authentication
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Setup JWT
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#authentication-endpoints) - Register/Login endpoints
- [ARCHITECTURE.md](./ARCHITECTURE.md#-authentication-flow) - How it works

### Products
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#product-management-endpoints) - CRUD endpoints
- [ARCHITECTURE.md](./ARCHITECTURE.md#seller-product-listing) - Seller workflow

### Rentals
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#rental-endpoints) - Rental endpoints
- [ARCHITECTURE.md](./ARCHITECTURE.md#complete-rental-transaction) - Complete flow

### Damage Detection
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#damage-report-endpoints) - Damage endpoints
- [ARCHITECTURE.md](./ARCHITECTURE.md#-key-workflows) - Damage workflow
- [ai_module/README.md](./ai_module/README.md) - AI system

### Wallet & Transactions
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#transaction--wallet-endpoints) - Transaction endpoints
- [ARCHITECTURE.md](./ARCHITECTURE.md#-key-workflows) - Withdrawal workflow

---

## 🎯 Next Steps

1. **Choose your documentation file** based on your task above
2. **Follow the instructions** in that file
3. **Refer back here** if you get lost
4. **Ask questions** using the documentation as reference

---

## 📊 Documentation Stats

| Document | Pages | Topic | Time |
|----------|-------|-------|------|
| SETUP_GUIDE.md | ~10 | Installation & Deployment | 20 min |
| API_DOCUMENTATION.md | ~15 | All 33 Endpoints | 30 min |
| ARCHITECTURE.md | ~8 | System Design | 20 min |
| BACKEND_SUMMARY.md | ~6 | Features & Overview | 10 min |
| FILE_STRUCTURE.md | ~8 | Code Organization | 15 min |

---

## ⭐ Quick Reference Card

```
├─ Installation:     npm install                                    
├─ Run Dev:         npm run dev                                     
├─ Run Prod:        npm start                                      
├─ AI Service:      python ai_module/app.py                        
├─ Test Health:     curl http://localhost:5000/api/health          
├─ MongoDB:         mongosh                                         
├─ Stop Server:     Ctrl+C                                         
└─ Environment:     cp .env.example .env                           
```

---

**Last Updated:** February 21, 2026
**Backend Version:** 1.0.0
**Documentation Version:** 1.0.0

**🎉 You're all set! Pick a documentation file and get started!**
