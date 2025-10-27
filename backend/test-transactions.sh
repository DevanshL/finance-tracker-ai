#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:5000/api"

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   🧪 Transaction System Testing            ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Step 1: Login to get token
echo -e "${BLUE}📌 Step 1: Login to get token${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get token. Please register first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "   Token: ${TOKEN:0:30}..."
echo ""

# Step 2: Get Categories
echo -e "${BLUE}📌 Step 2: Get All Categories${NC}"
CATEGORIES=$(curl -s -X GET "$BASE_URL/categories" \
  -H "Authorization: Bearer $TOKEN")

if echo "$CATEGORIES" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Categories retrieved${NC}"
    CATEGORY_COUNT=$(echo $CATEGORIES | grep -o '"count":[0-9]*' | sed 's/"count"://')
    echo "   Total categories: $CATEGORY_COUNT"
else
    echo -e "${RED}❌ Failed to get categories${NC}"
fi
echo ""

# Step 3: Create Income Transaction
echo -e "${BLUE}📌 Step 3: Create Income Transaction${NC}"
INCOME=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "income",
    "amount": 5000,
    "category": "Salary",
    "description": "Monthly salary",
    "date": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "paymentMethod": "Bank Transfer"
  }')

if echo "$INCOME" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Income transaction created${NC}"
    echo "   Amount: $5000"
else
    echo -e "${RED}❌ Failed to create income${NC}"
    echo "   Response: $INCOME"
fi
echo ""

# Step 4: Create Expense Transaction
echo -e "${BLUE}📌 Step 4: Create Expense Transaction${NC}"
EXPENSE=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "expense",
    "amount": 50,
    "category": "Food & Dining",
    "description": "Lunch at restaurant",
    "date": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "paymentMethod": "Credit Card"
  }')

if echo "$EXPENSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Expense transaction created${NC}"
    echo "   Amount: $50"
else
    echo -e "${RED}❌ Failed to create expense${NC}"
fi
echo ""

# Step 5: Get All Transactions
echo -e "${BLUE}�� Step 5: Get All Transactions${NC}"
TRANSACTIONS=$(curl -s -X GET "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN")

if echo "$TRANSACTIONS" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Transactions retrieved${NC}"
    COUNT=$(echo $TRANSACTIONS | grep -o '"count":[0-9]*' | sed 's/"count"://')
    echo "   Total transactions: $COUNT"
else
    echo -e "${RED}❌ Failed to get transactions${NC}"
fi
echo ""

# Step 6: Get Transaction Summary
echo -e "${BLUE}📌 Step 6: Get Transaction Summary${NC}"
SUMMARY=$(curl -s -X GET "$BASE_URL/transactions/summary?period=month" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SUMMARY" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Summary retrieved${NC}"
    TOTAL_INCOME=$(echo $SUMMARY | grep -o '"totalIncome":[0-9.]*' | sed 's/"totalIncome"://')
    TOTAL_EXPENSES=$(echo $SUMMARY | grep -o '"totalExpenses":[0-9.]*' | sed 's/"totalExpenses"://')
    BALANCE=$(echo $SUMMARY | grep -o '"balance":[0-9.-]*' | sed 's/"balance"://')
    echo "   Total Income: \$$TOTAL_INCOME"
    echo "   Total Expenses: \$$TOTAL_EXPENSES"
    echo "   Balance: \$$BALANCE"
else
    echo -e "${RED}❌ Failed to get summary${NC}"
fi
echo ""

# Step 7: Filter Transactions by Type
echo -e "${BLUE}📌 Step 7: Filter by Type (Income)${NC}"
FILTERED=$(curl -s -X GET "$BASE_URL/transactions?type=income" \
  -H "Authorization: Bearer $TOKEN")

if echo "$FILTERED" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Filtered transactions retrieved${NC}"
    INCOME_COUNT=$(echo $FILTERED | grep -o '"count":[0-9]*' | sed 's/"count"://')
    echo "   Income transactions: $INCOME_COUNT"
else
    echo -e "${RED}❌ Failed to filter transactions${NC}"
fi
echo ""

# Step 8: Get Recent Transactions
echo -e "${BLUE}📌 Step 8: Get Recent Transactions${NC}"
RECENT=$(curl -s -X GET "$BASE_URL/transactions/recent?limit=5" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RECENT" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Recent transactions retrieved${NC}"
    RECENT_COUNT=$(echo $RECENT | grep -o '"count":[0-9]*' | sed 's/"count"://')
    echo "   Recent count: $RECENT_COUNT"
else
    echo -e "${RED}❌ Failed to get recent transactions${NC}"
fi
echo ""

# Step 9: Create Custom Category
echo -e "${BLUE}📌 Step 9: Create Custom Category${NC}"
CUSTOM_CAT=$(curl -s -X POST "$BASE_URL/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Crypto Investment",
    "type": "expense",
    "icon": "₿",
    "color": "#f7931a"
  }')

if echo "$CUSTOM_CAT" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Custom category created${NC}"
    echo "   Category: Crypto Investment"
else
    echo -e "${YELLOW}⚠️  Category might already exist${NC}"
fi
echo ""

echo "╔════════════════════════════════════════════╗"
echo "║           ✅ All Tests Completed!          ║"
echo "╚════════════════════════════════════════════╝"
echo ""
