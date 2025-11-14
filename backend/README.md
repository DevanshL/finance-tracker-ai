# Personal Finance Tracker Backend

A comprehensive backend API for personal finance management with AI-powered insights.

## Features

- 🔐 User Authentication & Authorization
- 💰 Transaction Management (Income & Expenses)
- 📊 Budget Planning & Tracking
- 🎯 Financial Goals
- 📈 Analytics & Reports
- 🤖 AI Financial Coach
- 📱 Real-time Updates via WebSocket

## Tech Stack

- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- OpenAI API (for AI features)
- Socket.io (WebSocket)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_key
   ```

4. Seed database (optional):
   ```bash
   node scripts/seed.js
   ```

5. Start server:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- POST `/api/auth/logout` - Logout user

### Transactions
- GET `/api/transactions` - Get all transactions
- POST `/api/transactions` - Create transaction
- GET `/api/transactions/:id` - Get single transaction
- PUT `/api/transactions/:id` - Update transaction
- DELETE `/api/transactions/:id` - Delete transaction

### Budgets
- GET `/api/budgets` - Get all budgets
- POST `/api/budgets` - Create budget
- GET `/api/budgets/:id` - Get single budget
- PUT `/api/budgets/:id` - Update budget
- DELETE `/api/budgets/:id` - Delete budget

### Goals
- GET `/api/goals` - Get all goals
- POST `/api/goals` - Create goal
- GET `/api/goals/:id` - Get single goal
- PUT `/api/goals/:id` - Update goal
- DELETE `/api/goals/:id` - Delete goal

### Analytics
- GET `/api/analytics/overview` - Get financial overview
- GET `/api/analytics/trends` - Get spending trends
- GET `/api/analytics/categories` - Get category analysis

### AI Coach
- GET `/api/ai/insights` - Get AI financial insights
- GET `/api/ai/predictions` - Get spending predictions
- POST `/api/ai/suggest-category` - Get category suggestions

## Testing

Run test scripts:
```bash
./test-all.sh
./test-transactions.sh
```

## License

MIT
