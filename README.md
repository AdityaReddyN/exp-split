# 💰 Expense Split App

A **modern, full-stack expense splitting application** built with React, Node.js, and PostgreSQL. Split bills with friends, manage group expenses, and settle payments securely using Stripe.

![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![React](https://img.shields.io/badge/react-18.2-blue.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-12+-336791.svg)
![Stripe](https://img.shields.io/badge/stripe-integrated-5469d4.svg)
![CSS](https://img.shields.io/badge/css-vanilla-blue.svg)

## 🎯 Quick Links

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation-guide)
- [Configuration](#-configuration)
- [Running the App](#-running-the-application)
- [Usage](#-usage-guide)
- [API Documentation](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 🎯 Core Features
- **User Authentication** - Secure JWT-based login and registration with bcrypt hashing
- **Group Management** - Create public/private groups with unique 6-character join codes
- **Expense Tracking** - Add and categorize expenses with receipts
- **Smart Splitting** - Three split types: Equal, Custom Amount, or Percentage-based
- **Balance Calculation** - Real-time balance tracking between group members
- **Settlement Optimization** - Greedy algorithm to minimize transactions
- **Payment Integration** - Secure payments via Stripe with test mode support
- **Receipt Management** - Upload and store expense receipts with file validation
- **Transaction History** - Complete payment history with settlement records

### 🎨 Design & UX
- **Vanilla CSS** - Pure CSS styling with CSS variables (no Tailwind dependency)
- **Responsive Design** - Works perfectly on mobile (320px+), tablet, and desktop
- **Smooth Animations** - Professional transitions and loading states
- **Accessible** - WCAG AA compliant with keyboard navigation support
- **Modern UI** - Clean, professional interface with gradients and effects
- **Performance Optimized** - Fast load times and minimal bundle size

---

## 🛠️ Tech Stack

### Frontend
```
React 18.2.0          - UI framework with hooks
Vite 4.4.9            - Lightning-fast build tool & dev server
React Router 6.15     - Client-side routing
Axios 1.5.0           - HTTP client with interceptors
Stripe.js             - Payment processing
Chart.js 4.4.0        - Data visualization
Lucide React          - Icon library
QRCode.react 1.0.1    - QR code generation
Vanilla CSS           - Pure CSS with CSS variables
```

### Backend
```
Node.js 18+           - JavaScript runtime
Express 4.18.2        - Web application framework
PostgreSQL 12+        - Relational database
JWT                   - Token-based authentication
bcrypt                - Password hashing
Stripe API            - Payment processing
Multer 1.4.5          - File upload handling
CORS 2.8.5            - Cross-origin resource sharing
dotenv 16.3.1         - Environment configuration
Nodemailer 7.0        - Email notifications (optional)
```

---

## 📁 Project Structure

```
exp-split/
│
├── backend/
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── groups.js            # Group CRUD operations
│   │   ├── expenses.js          # Expense management
│   │   ├── settlements.js       # Settlement calculations
│   │   ├── payments.js          # Stripe payment endpoints
│   │   └── upload.js            # File upload endpoints
│   │
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   │
│   ├── utils/
│   │   ├── db.js                # PostgreSQL connection pool
│   │   └── settlementAlgorithm.js # Greedy debt minimization
│   │
│   ├── server.js                # Express app
│   ├── package.json             # Dependencies
│   ├── .env.example             # Environment template
│   ├── .env                     # Your configuration (create this)
│   ├── database.sql             # Database schema
│   └── uploads/                 # Receipt storage
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── GroupDetail.jsx
│   │   │   └── styles/
│   │   │       ├── Login.css
│   │   │       ├── Register.css
│   │   │       └── Dashboard.css
│   │   │
│   │   ├── components/
│   │   │   ├── CreateGroupModal.jsx
│   │   │   ├── JoinGroupModal.jsx
│   │   │   ├── AddExpenseModal.jsx
│   │   │   ├── PaymentModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ToastContainer.jsx
│   │   │
│   │   ├── utils/
│   │   │   ├── api.js           # Axios configuration
│   │   │   ├── auth.js          # Auth helpers
│   │   │   └── toast.js         # Toast notifications
│   │   │
│   │   ├── App.jsx              # Main router
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   │
│   ├── package.json             # Dependencies
│   ├── vite.config.js           # Vite configuration
│   ├── .env.example             # Environment template
│   ├── .env                     # Your configuration (create this)
│   └── index.html
│
└── README.md                    # This file
```

---

## 📋 Prerequisites

### Required Software

**Node.js 18.0 or higher**
- Download: https://nodejs.org/
- Verify:
  ```bash
  node --version    # v18.0.0 or higher
  npm --version     # 9.0.0 or higher
  ```

**PostgreSQL 12 or higher**
- Download: https://www.postgresql.org/download/
- Verify:
  ```bash
  psql --version
  ```

**Git** (for cloning)
- Download: https://git-scm.com/
- Verify:
  ```bash
  git --version
  ```

### Required Accounts

**Stripe Account** (Free tier available)
- Sign up: https://dashboard.stripe.com/register
- Get test API keys from Dashboard
- Use test mode for development

### Optional

**Gmail Account** - For email notifications (optional feature)

---

## 📥 Installation Guide

### Step 1: Get the Code

**Option A: Clone with Git** (Recommended)
```bash
git clone https://github.com/AdityaReddyN/exp-split.git
cd exp-split
```

**Option B: Download & Extract**
- Visit: https://github.com/AdityaReddyN/exp-split
- Click "Code" → "Download ZIP"
- Extract and navigate to folder
- Open terminal in project root

---

### Step 2: Backend Installation

```bash
# Navigate to backend folder
cd backend

# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected packages:**
```
├── express@4.18.2
├── pg@8.10.0
├── bcrypt@6.0.0 (or similar)
├── jsonwebtoken@9.0.2
├── stripe@12.x.x
├── dotenv@16.3.1
├── cors@2.8.5
├── multer@1.4.5-lts.1
└── nodemailer@7.0.x
```

---

### Step 3: Database Creation

```bash
# Start PostgreSQL (if not already running)
# On Mac: brew services start postgresql
# On Windows: Start PostgreSQL from Services
# On Linux: sudo systemctl start postgresql

# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE expense_split_db;

# Exit PostgreSQL
\q

# Verify database created
psql -U postgres -l | grep expense_split_db
```

---

### Step 4: Database Schema Import

```bash
# From backend folder, import schema
psql -U postgres -d expense_split_db -f database.sql

# Verify tables were created
psql -U postgres -d expense_split_db

# List all tables
\dt

# You should see:
# - expenses
# - expense_splits
# - group_members
# - groups
# - settlements
# - users

# Exit
\q
```

---

### Step 5: Backend Configuration

```bash
# In backend folder, create .env from example
cp .env.example .env

# Open and edit .env file
# On Mac: open .env
# On Windows: start .env
# On Linux: nano .env
```

**Fill in your Backend .env:**

```env
# ==========================================
# DATABASE CONNECTION
# ==========================================
DATABASE_URL=postgresql://postgres:password@localhost:5432/expense_split_db

# Replace:
# - password: Your PostgreSQL password (default: postgres)
# - localhost: Your database host
# - 5432: PostgreSQL port (default: 5432)
# - expense_split_db: Database name

# ==========================================
# SERVER CONFIGURATION
# ==========================================
PORT=3000
NODE_ENV=development

# ==========================================
# JWT SECRET (Generate a random string)
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# ==========================================
JWT_SECRET=your_random_32_character_secret_key_here_change_this_to_random

# ==========================================
# STRIPE PAYMENT KEYS
# Get from: https://dashboard.stripe.com/apikeys
# ==========================================
STRIPE_PUBLIC_KEY=pk_test_51234567890abcdefghijklmnop
STRIPE_SECRET_KEY=sk_test_abcdefghijklmnopqrstuvwxyz1234567890


# ==========================================
# FILE UPLOAD
# ==========================================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# ==========================================
# CORS (Allow frontend to access backend)
# ==========================================
CORS_ORIGIN=http://localhost:5173
```

---

### Step 6: Frontend Installation

```bash
# Navigate to frontend folder
cd ../frontend

# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected packages:**
```
├── react@18.2.0
├── react-dom@18.2.0
├── react-router-dom@6.15.0
├── axios@1.5.0
├── lucide-react@0.263.1
├── @stripe/react-stripe-js@1.x.x
├── @stripe/js@1.x.x
├── chart.js@4.4.0
└── qrcode.react@1.0.1
```

---

### Step 7: Frontend Configuration

```bash
# In frontend folder, create .env from example
cp .env.example .env

# Open and edit .env file
# On Mac: open .env
# On Windows: start .env
# On Linux: nano .env
```

**Fill in your Frontend .env:**

```env
# ==========================================
# API CONFIGURATION
# ==========================================
# Points to your backend server
VITE_API_URL=http://localhost:3000/api

# ==========================================
# STRIPE PUBLIC KEY
# Get from: https://dashboard.stripe.com/apikeys
# Must match STRIPE_PUBLIC_KEY in backend .env
# ==========================================
VITE_STRIPE_PUBLIC_KEY=pk_test_51234567890abcdefghijklmnop

# ==========================================
# ENVIRONMENT
# ==========================================
VITE_ENV=development
```

---

## 🚀 Running the Application

### Option 1: Run All in Separate Terminals (Recommended)

**Terminal 1: Backend Server**
```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 3000
Environment: development
Database connected ✓
```

**Terminal 2: Frontend Development Server**
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v4.4.9 ready in 200 ms

➜  Local:   http://localhost:5173/
```

**Terminal 3: Optional - Monitor**
```bash
# Keep for checking logs or running commands
# You can run database queries here if needed
```

### Access the Application

| Component | URL |
|-----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| API Health Check | http://localhost:3000/api/health |

---

## 🔐 Stripe Configuration

### Get Your Stripe Keys

1. Visit [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign in to your account
3. Click **"Developers"** in left sidebar
4. Click **"API Keys"**
5. You'll see two keys:
   - **Publishable Key** - starts with `pk_test_` (for frontend)
   - **Secret Key** - starts with `sk_test_` (for backend)
6. For webhooks, click **"Webhooks"** and get the signing secret

### Test Cards

Use these cards in test mode:

| Card | Number | Expiry | CVC | Result |
|------|--------|--------|-----|--------|
| Visa | 4242 4242 4242 4242 | 12/25 | 123 | ✅ Success |
| Visa (Fail) | 4000 0000 0000 0002 | 12/25 | 123 | ❌ Declined |
| Mastercard | 5555 5555 5555 4444 | 12/25 | 123 | ✅ Success |

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register          Create new account
POST   /api/auth/login             Login with credentials
GET    /api/auth/me                Get current user
```

### Groups
```
POST   /api/groups                 Create new group
GET    /api/groups/my-groups       Get user's groups
GET    /api/groups/public          Get public groups
POST   /api/groups/join            Join group with code
GET    /api/groups/:id             Get group details
GET    /api/groups/:id/members     Get group members
```

### Expenses
```
POST   /api/expenses               Add new expense
GET    /api/expenses/group/:id     Get group expenses
GET    /api/expenses/balances/:id  Get member balances
DELETE /api/expenses/:id           Delete expense
```

### Settlements
```
GET    /api/settlements/:id        Get settlement details
POST   /api/settlements/mark-paid  Mark as paid
GET    /api/settlements/history/:id Settlement history
```

### Payments
```
POST   /api/payments/create-intent Create payment intent
POST   /api/payments/confirm       Confirm payment
```

### Uploads
```
POST   /api/upload/receipt         Upload receipt image
GET    /api/upload/:filename       Download receipt
```

---

## 🎯 Usage Guide

### 1. Create an Account
- Go to http://localhost:5173
- Click "Sign Up"
- Enter: Full Name, Email, Password
- Click "Create Account"

### 2. Create or Join a Group
**Option A: Create Group**
- Click "Create" button
- Enter: Group Name, Description, Category
- Choose: Private or Public
- Click "Create Group"

**Option B: Join Group**
- Click "Join" button
- Enter: 6-character group code
- Click "Join Group"

### 3. Add an Expense
- Go to group
- Click "Add Expense" button
- Enter:
  - Description (e.g., "Dinner")
  - Amount (e.g., 1200)
  - Who paid
  - Split type (Equal, Custom, Percentage)
  - Select members to split with
- Click "Add Expense"

### 4. View Balances
- Go to group
- Click "Balances" tab
- Green = You're owed money
- Red = You owe money

### 5. Make a Payment
- Click "Settlements" tab
- Find the settlement you need to pay
- Click "Pay Now"
- Enter card details (use test card in test mode)
- Click "Pay"
- Payment confirmed ✓

---

## 🐛 Troubleshooting

### Backend Issues

**"Port 3000 already in use"**
```bash
# Find process on port 3000
lsof -i :3000              # Mac/Linux

# Kill the process
kill -9 <PID>              # Mac/Linux
taskkill /PID <PID> /F     # Windows
```

**"Cannot connect to database"**
```bash
# Check PostgreSQL is running
psql --version

# Verify connection string in .env
# Format: postgresql://user:password@host:port/database

# Test connection
psql -U postgres -d expense_split_db
```

**"npm ERR! not ok code 1"**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**"API not responding"**
- Check backend is running: `npm run dev` in backend folder
- Verify VITE_API_URL in .env matches backend port
- Check DevTools Network tab for failed requests

**"Blank white page"**
- Open DevTools (F12) → Console
- Check for error messages
- Refresh page (Ctrl+F5 for hard refresh)
- Check Network tab for failed requests

**"Stripe payment not working"**
- Verify stripe keys in both .env files
- Check browser console for errors
- Use test card numbers (4242 4242 4242 4242)
- Ensure webhook secret is set

### Common Errors

| Error | Solution |
|-------|----------|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL not running |
| `listen EADDRINUSE: address already in use :3000` | Port 3000 taken, change PORT in .env |
| `401 Unauthorized` | JWT token expired, login again |
| `CORS policy: blocked by CORS` | Check CORS_ORIGIN matches frontend URL |
| `Cannot GET /api/...` | API endpoint wrong or backend not running |
| `Stripe: pk_test_ not set` | Add VITE_STRIPE_PUBLIC_KEY to .env |

---

## 📚 Additional Documentation

- Backend API detailed docs: See `backend/README.md`
- Frontend setup: See `frontend/README.md`
- CSS styling guide: See `VANILLA_CSS_INTEGRATION.md`
- Stripe integration: See `STRIPE_SETUP.md`

---

## 🔐 Security Features

- ✅ JWT authentication with expiry
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS protection
- ✅ Environment variables for secrets
- ✅ Stripe PCI compliance
- ✅ File upload validation
- ✅ HTTPS ready for production

---

## 📦 Build for Production

### Backend
```bash
cd backend
npm run build
NODE_ENV=production npm start
```

### Frontend
```bash
cd frontend
npm run build              # Creates dist/ folder
npm run preview           # Preview production build
```

Deploy `dist/` folder to your hosting service (Vercel, Netlify, etc.)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing`
5. Create Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👨‍💻 Author

**Aditya Reddy**
- GitHub: [@AdityaReddyN](https://github.com/AdityaReddyN)
- Repository: [exp-split](https://github.com/AdityaReddyN/exp-split)

---

## 📧 Support & Questions

- 📖 Check [Troubleshooting](#-troubleshooting) section
- 🔍 Search existing GitHub Issues
- 💬 Create new Issue with detailed description
- 🐛 Include error messages and steps to reproduce

---

**Last Updated:** January 31, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

**Happy Expense Splitting! 💰✨**
