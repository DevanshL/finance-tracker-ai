# Finance Tracker with AI Coach

Personal finance management application with AI-powered insights.

## Tech Stack
- Backend: Node.js, Express.js, MongoDB
- Frontend: React 18, Vite, Tailwind CSS
- AI: Google Gemini API

## 🗂️ Backend Structure
```
backend/
├── config/                      # Configuration files
│   ├── constants.js             # App-wide constants
│   └── db.js                    # MongoDB connection setup
│
├── controllers/                 # Request handlers
│   ├── authController.js        # Authentication logic
│   ├── transactionController.js # Transaction CRUD
│   ├── budgetController.js      # Budget management
│   ├── goalController.js        # Goal tracking
│   ├── aiController.js          # AI insights & predictions
│   ├── analyticsController.js   # Analytics & reports
│   ├── dashboardController.js   # Dashboard data
│   ├── categoryController.js    # Category management
│   ├── bulkController.js        # Bulk operations
│   ├── exportController.js      # Data export
│   ├── searchController.js      # Search functionality
│   └── recurringTransactionsController.js
│
├── middleware/                  # Custom middleware
│   ├── auth.js                  # JWT authentication
│   ├── errorHandler.js          # Global error handling
│   └── validator.js             # Input validation
│
├── models/                      # Mongoose schemas
│   ├── User.js                  # User model
│   ├── Transaction.js           # Transaction model
│   ├── Budget.js                # Budget model
│   ├── Goal.js                  # Goal model
│   ├── Category.js              # Category model
│   ├── RecurringTransaction.js  # Recurring transaction model
│   └── Notification.js          # Notification model
│
├── routes/                      # API routes
│   ├── auth.js                  # Auth routes
│   ├── transactions.js          # Transaction routes
│   ├── budgets.js               # Budget routes
│   ├── goals.js                 # Goal routes
│   ├── ai.js                    # AI routes
│   ├── analytics.js             # Analytics routes
│   ├── dashboard.js             # Dashboard routes
│   ├── categories.js            # Category routes
│   ├── export.js                # Export routes
│   └── search.js                # Search routes
│
├── services/                    # Business logic layer
│   ├── aiService.js             # AI integration service
│   ├── analyticsService.js      # Analytics calculations
│   ├── dashboardService.js      # Dashboard data aggregation
│   ├── exportService.js         # Export generation
│   └── backupService.js         # Backup/restore logic
│
├── utils/                       # Helper functions
│   ├── csvHandler.js            # CSV processing
│   ├── dateHelpers.js           # Date utilities
│   ├── generateToken.js         # JWT token generation
│   └── seedCategories.js        # Database seeding
│
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
└── server.js                    # App entry point
```

---

## 🎨 Frontend Structure
```
frontend/
├── public/                      # Static assets
│   ├── vite.svg                 # App icon
│   └── index.html               # HTML template
│
├── src/
│   ├── components/              # React components
│   │   │
│   │   ├── ai/                  # AI-related components
│   │   │   ├── AIInsights.jsx   # Insights display
│   │   │   ├── AISummary.jsx    # Summary cards
│   │   │   └── Recommendations.jsx # Recommendations list
│   │   │
│   │   ├── analytics/           # Analytics components
│   │   │   ├── SpendingChart.jsx # Spending visualizations
│   │   │   ├── TrendChart.jsx   # Trend analysis
│   │   │   ├── CategoryBreakdown.jsx # Category charts
│   │   │   └── StatsCard.jsx    # Stat display cards
│   │   │
│   │   ├── budgets/             # Budget components
│   │   │   ├── BudgetList.jsx   # Budget overview
│   │   │   ├── BudgetCard.jsx   # Individual budget card
│   │   │   ├── BudgetForm.jsx   # Create/edit budget
│   │   │   ├── BudgetProgress.jsx # Progress bar
│   │   │   └── BudgetAlerts.jsx # Alert notifications
│   │   │
│   │   ├── goals/               # Goal components
│   │   │   ├── GoalList.jsx     # Goals overview
│   │   │   ├── GoalCard.jsx     # Individual goal card
│   │   │   ├── GoalForm.jsx     # Create/edit goal
│   │   │   ├── GoalProgress.jsx # Progress tracker
│   │   │   └── ContributeModal.jsx # Add contribution
│   │   │
│   │   ├── transactions/        # Transaction components
│   │   │   ├── TransactionList.jsx # Transaction table
│   │   │   ├── TransactionForm.jsx # Add/edit transaction
│   │   │   ├── TransactionFilters.jsx # Filter controls
│   │   │   ├── BulkUpload.jsx   # CSV import
│   │   │   └── TransactionCard.jsx # Mobile card view
│   │   │
│   │   ├── dashboard/           # Dashboard components
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── QuickStats.jsx   # Summary statistics
│   │   │   ├── RecentTransactions.jsx # Recent list
│   │   │   └── BudgetOverview.jsx # Budget summary
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── Navbar.jsx       # Navigation bar
│   │   │   ├── Sidebar.jsx      # Side navigation
│   │   │   ├── Footer.jsx       # Page footer
│   │   │   └── Layout.jsx       # Page wrapper
│   │   │
│   │   ├── common/              # Reusable components
│   │   │   ├── Button.jsx       # Custom button
│   │   │   ├── Modal.jsx        # Modal dialog
│   │   │   ├── Input.jsx        # Form input
│   │   │   ├── Select.jsx       # Select dropdown
│   │   │   ├── DatePicker.jsx   # Date picker
│   │   │   ├── Loading.jsx      # Loading spinner
│   │   │   ├── Alert.jsx        # Alert messages
│   │   │   └── Card.jsx         # Card container
│   │   │
│   │   └── auth/                # Authentication components
│   │       ├── Login.jsx        # Login form
│   │       ├── Register.jsx     # Registration form
│   │       └── PrivateRoute.jsx # Protected routes
│   │
│   ├── context/                 # React Context
│   │   ├── AuthContext.jsx      # Authentication state
│   │   ├── TransactionContext.jsx # Transaction state
│   │   ├── BudgetContext.jsx    # Budget state
│   │   └── ThemeContext.jsx     # Theme state
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.js           # Auth hook
│   │   ├── useTransactions.js   # Transaction hook
│   │   ├── useBudgets.js        # Budget hook
│   │   ├── useGoals.js          # Goal hook
│   │   ├── useAnalytics.js      # Analytics hook
│   │   └── useLocalStorage.js   # LocalStorage hook
│   │
│   ├── services/                # API services
│   │   ├── api.js               # Axios instance
│   │   ├── authService.js       # Auth API calls
│   │   ├── transactionService.js # Transaction API
│   │   ├── budgetService.js     # Budget API
│   │   ├── goalService.js       # Goal API
│   │   ├── aiService.js         # AI API calls
│   │   └── analyticsService.js  # Analytics API
│   │
│   ├── utils/                   # Utility functions
│   │   ├── formatters.js        # Data formatting
│   │   ├── validators.js        # Form validation
│   │   ├── constants.js         # App constants
│   │   └── helpers.js           # Helper functions
│   │
│   ├── App.jsx                  # Root component
│   ├── App.css                  # Global styles
│   ├── main.jsx                 # App entry point
│   └── index.css                # Tailwind imports
│
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── index.html                   # HTML entry point
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
├── vite.config.js               # Vite configuration
└── README.md                    # Documentation
```

---

## 🚀 Key Features

### Backend Features
- **Authentication**: JWT-based user authentication
- **Transaction Management**: Full CRUD operations for financial transactions
- **Budget Tracking**: Create and monitor budgets with alerts
- **Goal Setting**: Track financial goals and contributions
- **AI Integration**: AI-powered insights and spending predictions
- **Analytics**: Comprehensive financial analytics and reports
- **Bulk Operations**: Import/export data via CSV
- **Recurring Transactions**: Automated recurring transaction handling
- **Search & Filter**: Advanced search and filtering capabilities

### Frontend Features
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Dashboard**: Overview of financial health at a glance
- **Interactive Charts**: Visual representation of spending patterns
- **Real-time Updates**: Live data updates using React Context
- **Dark Mode**: Theme switching capability
- **CSV Import/Export**: Bulk transaction management
- **AI Insights**: Personalized financial recommendations

---

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- AI/ML Integration

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios
- Context API
- React Router

---

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
# Create .env file with required variables
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
# Create .env file with API URL
npm run dev
```

---

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AI_API_KEY=your_ai_api_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Contact

For questions or support, please open an issue in the repository.
