# Finance Tracker API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGc..."
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

---

## Transaction Endpoints

### Get All Transactions
```http
GET /transactions?page=1&limit=20&type=expense&category=Food
Authorization: Bearer <token>
```

### Create Transaction
```http
POST /transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "amount": 50.00,
  "category": "Food",
  "description": "Grocery shopping",
  "date": "2024-01-15",
  "paymentMethod": "Credit Card"
}
```

### Get Single Transaction
```http
GET /transactions/:id
Authorization: Bearer <token>
```

### Update Transaction
```http
PUT /transactions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 55.00,
  "description": "Grocery shopping (updated)"
}
```

### Delete Transaction
```http
DELETE /transactions/:id
Authorization: Bearer <token>
```

### Bulk Create Transactions
```http
POST /transactions/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactions": [
    {
      "type": "expense",
      "amount": 25.00,
      "category": "Food",
      "description": "Coffee"
    },
    {
      "type": "income",
      "amount": 500.00,
      "category": "Salary",
      "description": "Freelance work"
    }
  ]
}
```

---

## Budget Endpoints

### Get All Budgets
```http
GET /budgets
Authorization: Bearer <token>
```

### Create Budget
```http
POST /budgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Monthly Food Budget",
  "category": "Food",
  "amount": 500,
  "period": "monthly",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### Get Budget Status
```http
GET /budgets/:id/status
Authorization: Bearer <token>
```

### Get Budget Alerts
```http
GET /budgets/alerts
Authorization: Bearer <token>
```

---

## Goals Endpoints

### Get All Goals
```http
GET /goals
Authorization: Bearer <token>
```

### Create Goal
```http
POST /goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Emergency Fund",
  "description": "Save for emergencies",
  "targetAmount": 10000,
  "deadline": "2024-12-31"
}
```

### Add Contribution
```http
POST /goals/:id/contribute
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500
}
```

---

## Analytics Endpoints

### Get Overview
```http
GET /analytics/overview?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### Get Category Analysis
```http
GET /analytics/categories
Authorization: Bearer <token>
```

### Get Trends
```http
GET /analytics/trends
Authorization: Bearer <token>
```

---

## AI Coach Endpoints

### Get Financial Insights
```http
GET /ai/insights
Authorization: Bearer <token>
```

### Get Spending Prediction
```http
GET /ai/predictions
Authorization: Bearer <token>
```

### Suggest Category
```http
POST /ai/suggest-category
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Coffee at Starbucks"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "amount": "Amount must be positive"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```
