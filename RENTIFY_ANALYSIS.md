# Rentify - Complete Website Analysis

## 📱 **Overview**
Rentify is a rental marketplace platform built with React that connects **Buyers** (renters) with **Sellers** (item owners). The platform handles equipment/décor rental transactions with built-in damage detection, wallet systems, and multi-role dashboards.

---

## 👥 **User Roles & Authentication**

### **Two User Types:**
1. **Buyer** - Rents items from sellers
2. **Seller** - Lists and rents out their items

### **Authentication Flow:**
- Custom Auth Context with localStorage persistence
- Login/Register component with user type selection
- Data stored in localStorage: `rentify_user` JSON object
  - Properties: `email`, `password`, `fullName`, `userType`/`role`, `isLoggedIn`

### **User Validation Rules:**
- **Email**: Valid format required (regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`)
- **Password**: Min 8 chars, uppercase, lowercase, number required
- **Full Name**: Min 2 characters
- **Username**: Min 3 chars, alphanumeric + underscores only
- **Phone**: Pakistani format (+92XXXXXXXXXX or 03XXXXXXXXXX)

---

## 🛍️ **Product Management**

### **Product Model:**
```javascript
{
  id: unique_identifier,
  title: String,
  description: String,
  price: Number (per 5-day rental),
  duration: '5 day' (fixed),
  image: String (base64 or URL),
  category: Optional
}
```

### **Seller Workflow:**
1. Navigate to Collections page
2. Click "Add New Product"
3. Fill modal with:
   - Product name (3-100 chars)
   - Description (10-500 chars)
   - Price (0-100,000)
   - Product image (file upload → base64 conversion)
4. Products stored in localStorage: `sellerProducts` JSON array

### **Product Validation:**
- Name: 3-100 characters
- Description: 10-500 characters
- Price: Greater than 0, max 100,000
- Image: Required

---

## 🛒 **Shopping & Rental Process**

### **Buyer Journey:**
1. **Browse**: Home page displays default products (8 items)
2. **Select Dates**: Use RentalBar calendar widget
   - Pick-up date
   - Return date
   - Duration-based pricing calculation
   - Stores in localStorage: `selectedRange`
3. **Add to Cart**: 
   - Add items with quantity
   - Cart stored in localStorage: `cart` JSON array
   - Each item: `{id, title, price, quantity, duration, image}`
4. **View Cart**: Side modal shows all items, subtotal, security deposit ($100 fixed)
5. **Checkout**:
   - Delivery address required
   - Tax calculation (10% of subtotal)
   - Security deposit ($100)
   - Total = Subtotal + Tax + Security Deposit

### **Checkout Form Validation:**
- Name: Letters, spaces, hyphens, apostrophes only
- Email: Standard email format
- Address: Min 5 characters
- City: Letters, spaces, hyphens, apostrophes only
- Postal Code: Exactly 5 digits (Pakistani format)
- Phone: Pakistani numbers only
- Country: Pakistan only

---

## 💳 **Wallet System**

### **Buyer Wallet:**
- **Balance**: Current wallet balance
- **Total Spent**: Lifetime spending
- **Payment Methods**: Visa/Mastercard, EasyPaisa, JazzCash
- **Recent Transactions**: Transaction history with dates
- Transaction types: rental, refund, deposit
- Deducted for orders, refunded if no damage

### **Seller Wallet:**
- **Available Balance**: Money ready to withdraw
- **Total Earnings**: Lifetime earnings
- **Withdrawal Methods**: Bank transfer, EasyPaisa, JazzCash
- **Quick Amounts**: Preset withdrawal buttons (500, 1000, 2000)
- Earned from successful rentals minus platform fees

---

## 📊 **Buyer Dashboard**

### **Features:**
1. **Active Rentals** - Current rentals with status
   - Status types: Active, Under Inspection, Completed
   - Actions: Return Item, Awaited Inspection
   
2. **Rental States:**
   - **Active**: Can return item (opens ReturnItemModal)
   - **Under Inspection**: Awaiting damage assessment
   - **Completed**: Transaction finished

3. **Return Item Flow:**
   - Select rental → Click "Return Item" → Upload photos/files
   - Shows "Thank You" message
   - Option to submit damage review (optional)
   - Review form captures: rating, comments, damage report
   - Status → "Under Inspection" after submission

4. **Sample Rental Data:**
   - Elegant Chiavari Chairs: $240, 12/20-12/22, Active
   - LED Stage Lighting: $450, 12/10-12/12, Under Inspection

---

## 🏪 **Seller Dashboard**

### **Three Sections:**

#### **1. Seller Metrics (Current):**
- Total Items: Count of inventory
- Active Rentals: Current ongoing rentals
- Total Earnings: Sum of all completed rentals
- Damage Reports: Pending inspection count

#### **2. Seller Rentals:**
- Table showing all rentals with status
- Statuses: Active, Under Inspection, Completed
- Columns: Item, Buyer, Period, Amount, Status, Action
- Actions:
  - Active rentals: In Progress (no action)
  - Under Inspection: "Inspect" button → DamageInspectionModal
  - Completed: Show completed status

#### **3. Damage Reports:**
- **Pending Reports**: Awaiting seller decision
  - AI detection with confidence % (e.g., 87%)
  - Severity levels: Minor, Major
  - Suggested penalty amount
  - Before/After images for comparison
  
- **Confirmed Reports**: Already processed
  - Status marked as Confirmed
  - Penalty applied to transaction
  - Shows base amount + penalty breakdown

- **Seller Actions**:
  - Review damage details
  - View AI analysis and confidence score
  - Approve damage (apply penalty)
  - Reject damage (no penalty)

---

## 🔍 **Damage Detection & Inspection**

### **AI Damage Detection System:**
- **Confidence**: 0-100% accuracy rating
- **Severity Levels**: Minor, Major, Critical
- **Analysis**: Descriptions of detected damage
- **Suggested Penalty**: Calculated based on damage type/severity

### **Damage Inspection Modal (Seller View):**
1. **Step 1 - Rental Information**
   - Item details, buyer info, rental period, cost
2. **Step 2 - Before Photos**
   - Initial condition images
3. **Step 3 - After Photos**
   - Return condition images
4. **Step 4 - AI Analysis**
   - Confidence score, severity, suggested penalty
   - Detailed damage analysis text
5. **Decision**:
   - ✅ **No Damage** - Release full security deposit
   - ❌ **Confirm Damage** - Apply suggested penalty

### **Penalty System:**
- Deducted from buyer's wallet/security deposit
- Added to seller's earnings
- Transaction recorded in wallet histories

---

## 📄 **Pages & Routes**

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home | Landing page with hero, inventory, features |
| `/collections` | Collections | Browse products (shows default + seller products) |
| `/product/:id` | Product | Detailed product view with rental bar & add to cart |
| `/checkout` | Checkout | Billing address & order confirmation |
| `/dashboard` | Dashboard | Buyer/Seller dashboard (role-based) |
| `/profile` | Profile | User settings - Profile, Password, Notifications, Seller Dashboard |
| `/faq` | Faq | Frequently asked questions |

---

## 💾 **LocalStorage Schema**

```javascript
// Authentication
rentify_user: {
  email: string,
  userType: "buyer" | "seller",
  role: "buyer" | "seller",
  fullName?: string,
  isLoggedIn: boolean
}

// Shopping
cart: [
  {
    id: number,
    title: string,
    price: number,
    quantity: number,
    duration: string,
    image: string
  }
]

selectedRange: {
  start: ISO_DATE_STRING,
  end: ISO_DATE_STRING
}

// Seller Inventory
sellerProducts: [
  {
    id: timestamp,
    title: string,
    description: string,
    price: number,
    duration: "5 day",
    image: base64_string
  }
]
```

---

## 🎨 **Design System**

### **Color Palette:**
- **Primary**: `#D2B48C` (Tan/Gold)
- **Dark**: `#4b3b2a` (Dark Brown)
- **Text**: `#2c2c2c` (Dark Gray)
- **Muted**: `#6b6b6b` (Medium Gray)
- **Background**: `#f5f1ea` (Light Beige)
- **Accents**: Blues, Yellows, Greens (for status badges)

### **UI Components:**
- Modals with backdrop blur
- Calendar picker for date selection
- Image file uploads
- Input validation with error messages
- Status badges with color coding
- Icons for actions (cart, wallet, inspection, etc.)

---

## 🔄 **Key Workflows**

### **Workflow 1: Complete Rental Transaction**
```
Buyer Login → Browse Products → Select Dates → Add to Cart 
→ Proceed to Checkout → Submit Address & Payment → Order Placed 
→ Seller Notified → Rental Active → Buyer Returns Item → Damage Inspection 
→ (If damaged) Penalty Applied → Seller Receives Payment → Transaction Complete
```

### **Workflow 2: Seller Adding Products**
```
Seller Login → Navigate to Collections → Click "Add Product" 
→ Upload Details & Image → Product Listed → Visible in Collections & Home
```

### **Workflow 3: Damage Detection & Resolution**
```
Buyer Returns Item → AI Analyzes Images → Report Generated 
→ Seller Reviews in Dashboard → Approve/Reject Damage 
→ (If approved) Penalty from Security Deposit → Resolved
```

---

## 📈 **Key Metrics Tracked**

### **Buyer Metrics:**
- Wallet balance
- Total spent
- Active rentals
- Rental history
- Payment methods

### **Seller Metrics:**
- Total inventory count
- Active rentals
- Total earnings
- Pending damage reports
- Rental history
- Available balance for withdrawal

---

## 🔐 **Security Considerations**

### **Current Implementation (Frontend Only):**
- Auth data in localStorage (vulnerable)
- No backend validation
- No encryption
- Base64 image storage (could exceed storage limits)

### **Backend Requirements (To Be Built):**
- Secure JWT token authentication
- Password hashing (bcrypt/argon2)
- Server-side validation of all inputs
- Database persistence (users, products, rentals, transactions)
- Image storage (cloud storage like AWS S3)
- Damage detection API integration
- Payment gateway integration
- Transaction logging & audit trails

---

## 📱 **Component Hierarchy**

```
App
├── Home
│   ├── Header
│   ├── Hero
│   ├── RentalInventory
│   ├── WhyRentHero
│   ├── HowItWorks
│   └── Footer
├── Collections
│   ├── Header
│   ├── CollectionsHero
│   ├── RentalInventory (with seller products)
│   ├── AddProductModal
│   └── Footer
├── Product/:id
│   ├── Header
│   ├── RentalBar (date selection)
│   ├── CartModal
│   └── Footer
├── Checkout
│   ├── Header
│   ├── CheckoutForm (address & payment)
│   └── Footer
├── Dashboard (role-based)
│   ├── Header
│   ├── BuyerView:
│   │   ├── DashboardHero
│   │   ├── DashboardMetrics
│   │   ├── MyRentals
│   │   ├── ReturnItemModal
│   │   ├── ReviewForm
│   │   └── ThankYouMessage
│   ├── SellerView:
│   │   ├── SellerMetrics
│   │   ├── SellerRentals
│   │   ├── DamageReports
│   │   └── DamageInspectionModal
│   └── Footer
├── Profile (role-based)
│   ├── Header
│   ├── ProfileHero
│   ├── ProfileNavigation
│   ├── ProfileInformation
│   ├── ChangePassword
│   ├── NotificationPreferences
│   ├── SellerDashboard (if seller)
│   └── Footer
└── FAQ
```

---

## ✅ **Ready for Backend Development**

**All frontend workflows are now mapped and ready for backend API integration.** 

The backend needs to handle:
1. ✅ User authentication & authorization
2. ✅ Product CRUD operations (seller inventory)
3. ✅ Rental order processing & management
4. ✅ Wallet/transaction system
5. ✅ Damage detection & penalty system
6. ✅ Data persistence (replacement for localStorage)
7. ✅ Payment processing integration
8. ✅ Image/file storage
9. ✅ Notification system (optional)
10. ✅ Admin dashboard (optional)
