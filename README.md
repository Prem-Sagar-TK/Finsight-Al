# 💰 FinSight AI — Smart Fintech Dashboard

> A full-stack AI-powered personal finance management platform built with React + Node.js + MongoDB.

![FinSight AI](https://img.shields.io/badge/FinSight-AI-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)

---

## 📖 Overview

**FinSight AI** is a modern personal finance dashboard that helps users track spending, manage budgets, analyze financial insights, and monitor subscriptions — all in one place. The app features JWT-based authentication, interactive Chart.js visualizations, CSV export, dark/light mode, and a clean responsive UI.

---

## 🗂️ Project Structure

```
Finsight-Al/
├── frontend/          # React + Vite client application
│   ├── src/
│   │   ├── pages/     # All page components
│   │   ├── layouts/   # DashboardLayout (sidebar + header)
│   │   ├── context/   # AuthContext, ThemeContext
│   │   ├── utils/     # Helper functions
│   │   └── assets/    # Static assets
│   ├── index.html
│   └── package.json
│
├── backend/           # Node.js + Express REST API
│   ├── src/
│   │   ├── config/    # MongoDB connection
│   │   ├── controllers/  # Route handler logic
│   │   ├── middleware/   # Auth middleware (JWT)
│   │   ├── models/    # Mongoose schemas
│   │   ├── routes/    # API route definitions
│   │   ├── utils/     # Utility helpers
│   │   └── server.js  # Entry point
│   ├── seed.js        # Demo data seeder
│   └── package.json
│
└── README.md
```

---

## ✨ Features

### 🔐 Authentication
- User registration & login with **bcrypt** password hashing
- **JWT** token-based sessions stored in `localStorage`
- Protected routes with automatic redirect
- Forgot password flow

### 📊 Dashboard
- Real-time summary cards (total balance, income, expenses, savings)
- Monthly spending trend charts (Line / Bar via **Chart.js**)
- Recent transactions overview
- Category-wise expense breakdown (Pie / Doughnut charts)

### 💳 Transactions
- Add, view, filter, and search transactions
- Category tagging (Food, Transport, Entertainment, etc.)
- Date range filtering
- **CSV export** of transaction history
- CSV import support

### 📈 Insights
- AI-generated spending patterns and alerts
- Month-over-month comparison
- Top spending categories
- Savings rate analysis

### 🎯 Budgets
- Create and track budgets per category
- Visual progress bars with over-budget warnings
- Budget vs. actual spend comparison charts

### 🔔 Subscriptions
- Track recurring subscriptions (Netflix, Spotify, etc.)
- Monthly cost summary
- Renewal date reminders

### 📋 Reports
- Downloadable financial reports by date range
- Income vs. expense summaries
- Category breakdown tables

### ⚙️ Settings & Profile
- Dark / Light mode toggle
- Profile update (name, email, avatar)
- Notification preferences
- Billing & plan management

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
| React Router DOM v7 | Client-side routing |
| Chart.js + react-chartjs-2 | Data visualization |
| Tailwind CSS v4 | Utility-first styling |
| Axios | HTTP client |
| date-fns | Date formatting & manipulation |
| @heroicons/react | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens (JWT) | Authentication tokens |
| bcryptjs | Password hashing |
| multer | File upload handling |
| csv-parser | CSV file parsing |
| dotenv | Environment variable management |
| nodemon | Development auto-reload |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port `27017`)
- npm v9+

---

### 1. Clone the Repository

```bash
git clone https://github.com/Prem-Sagar-TK/Finsight-Al.git
cd Finsight-Al
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finsight
JWT_SECRET=your_super_secret_jwt_key_here
```

Start the backend server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will be available at **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend dev server:

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

---

### 4. Seed Demo Data (Optional)

To populate the database with sample transactions, budgets, and users:

```bash
cd backend
node seed.js
```

---

## 🌐 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Login and receive JWT |

### Transactions — `/api/transactions`
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all transactions (auth required) |
| `POST` | `/` | Add a new transaction |
| `DELETE` | `/:id` | Delete a transaction |
| `POST` | `/import` | Import transactions from CSV |

### Budgets — `/api/budgets`
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all budgets |
| `POST` | `/` | Create a new budget |
| `PUT` | `/:id` | Update a budget |
| `DELETE` | `/:id` | Delete a budget |

### Insights — `/api/insights`
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get AI-generated spending insights |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health status |

---

## 📁 Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing Page | Marketing homepage |
| `/login` | Login | User login |
| `/register` | Register | New user sign-up |
| `/forgot-password` | Forgot Password | Password reset flow |
| `/dashboard` | Dashboard | Main overview |
| `/dashboard/transactions` | Transactions | Transaction manager |
| `/dashboard/insights` | Insights | Spending analytics |
| `/dashboard/budgets` | Budgets | Budget tracker |
| `/dashboard/subscriptions` | Subscriptions | Subscription manager |
| `/dashboard/reports` | Reports | Financial reports |
| `/dashboard/profile` | Profile | User profile |
| `/dashboard/settings` | Settings | App settings |
| `/dashboard/billing` | Billing | Plan & billing info |

---

## 🔒 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/finsight` |
| `JWT_SECRET` | Secret key for signing JWTs | *(required)* |

---

## 🏗️ Database Models

### User
```
name, email, password (hashed), createdAt
```

### Transaction
```
userId, title, amount, type (income/expense), category, date, notes
```

### Budget
```
userId, category, limit, month, year
```

---

## 📦 Available Scripts

### Frontend (`/frontend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend (`/backend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start production server |
| `node seed.js` | Seed database with demo data |

---

## 🎨 Design System

- **Color Palette**: Indigo / Violet primary accents on a light `#eef0f4` base
- **Dark Mode**: Full dark mode support via `ThemeContext`
- **Typography**: System font stack with `font-sans`
- **Charts**: Chart.js with custom color schemes per category
- **Icons**: Heroicons (outline + solid)

