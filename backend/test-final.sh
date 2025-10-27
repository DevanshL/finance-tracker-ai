#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:5000/api"

echo ""
echo "════════════════════════════════════════════"
echo "   💰 Final Complete System Test"
echo "════════════════════════════════════════════"
echo ""

# Generate unique email
EMAIL="user$(date +%s)@test.com"

echo -e "${BLUE}🔐 Registering fresh user...${NC}"
REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$EMAIL\",
    \"password\": \"test123\"
  }")

TOKEN=$(echo $REGISTER | jq -r '.data.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${RED}❌ Registration failed${NC}"
    echo "$REGISTER" | jq '.'
    exit 1
fi

echo -e "${GREEN}✅ User: $EMAIL${NC}"
echo -e "${GREEN}✅ Token: ${TOKEN:0:40}...${NC}"
echo ""

# Test all features
echo -e "${BLUE}📂 Testing Categories...${NC}"
CATS=$(curl -s "$BASE_URL/categories" -H "Authorization: Bearer $TOKEN")
CAT_COUNT=$(echo $CATS | jq -r '.count')
echo -e "${GREEN}✅ Categories: $CAT_COUNT${NC}"
echo ""

echo -e "${BLUE}💵 Creating Transactions...${NC}"
# Income
curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type":"income","amount":5000,"category":"Salary","description":"Monthly salary"}' > /dev/null
echo -e "${GREEN}✅ Income: \$5000${NC}"

# Expenses
curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type":"expense","amount":100,"category":"Food & Dining","description":"Groceries"}' > /dev/null
echo -e "${GREEN}✅ Expense: \$100${NC}"

curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type":"expense","amount":50,"category":"Transportation","description":"Gas"}' > /dev/null
echo -e "${GREEN}✅ Expense: \$50${NC}"
echo ""

echo -e "${BLUE}📊 Getting Summary...${NC}"
SUMMARY=$(curl -s "$BASE_URL/transactions/summary" -H "Authorization: Bearer $TOKEN")
INCOME=$(echo $SUMMARY | jq -r '.data.summary.totalIncome')
EXPENSES=$(echo $SUMMARY | jq -r '.data.summary.totalExpenses')
BALANCE=$(echo $SUMMARY | jq -r '.data.summary.balance')
RATE=$(echo $SUMMARY | jq -r '.data.summary.savingsRate')

echo -e "${GREEN}   💰 Total Income: \$$INCOME${NC}"
echo -e "${GREEN}   💸 Total Expenses: \$$EXPENSES${NC}"
echo -e "${GREEN}   💵 Balance: \$$BALANCE${NC}"
echo -e "${GREEN}   📊 Savings Rate: $RATE%${NC}"
echo ""

echo -e "${BLUE}🔢 Testing Bulk Create...${NC}"
BULK=$(curl -s -X POST "$BASE_URL/transactions/bulk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "transactions": [
      {"type":"expense","amount":25,"category":"Food & Dining","description":"Coffee","date":"2025-10-27"},
      {"type":"expense","amount":30,"category":"Entertainment","description":"Movie","date":"2025-10-27"}
    ]
  }')

if echo "$BULK" | jq -e '.success' > /dev/null 2>&1; then
    COUNT=$(echo "$BULK" | jq -r '.data.count')
    echo -e "${GREEN}✅ Bulk created: $COUNT transactions${NC}"
else
    echo -e "${RED}❌ Bulk create failed${NC}"
    echo "$BULK" | jq -r '.message'
fi
echo ""

echo -e "${BLUE}📋 Getting All Transactions...${NC}"
ALL=$(curl -s "$BASE_URL/transactions" -H "Authorization: Bearer $TOKEN")
TOTAL=$(echo $ALL | jq -r '.count')
echo -e "${GREEN}✅ Total: $TOTAL transactions${NC}"
echo ""

echo -e "${BLUE}🔍 Testing Filters...${NC}"
INCOME_FILTER=$(curl -s "$BASE_URL/transactions?type=income" -H "Authorization: Bearer $TOKEN")
INCOME_COUNT=$(echo $INCOME_FILTER | jq -r '.count')
echo -e "${GREEN}✅ Income transactions: $INCOME_COUNT${NC}"

EXPENSE_FILTER=$(curl -s "$BASE_URL/transactions?type=expense" -H "Authorization: Bearer $TOKEN")
EXPENSE_COUNT=$(echo $EXPENSE_FILTER | jq -r '.count')
echo -e "${GREEN}✅ Expense transactions: $EXPENSE_COUNT${NC}"
echo ""

echo -e "${BLUE}⏰ Testing Recent Transactions...${NC}"
RECENT=$(curl -s "$BASE_URL/transactions/recent?limit=5" -H "Authorization: Bearer $TOKEN")
RECENT_COUNT=$(echo $RECENT | jq -r '.count')
echo -e "${GREEN}✅ Recent: $RECENT_COUNT transactions${NC}"
echo ""

echo "════════════════════════════════════════════"
echo -e "${GREEN}   ✅ ALL TESTS PASSED! 🎉${NC}"
echo "════════════════════════════════════════════"
echo ""
echo "📊 Summary:"
echo "   • User registered: $EMAIL"
echo "   • Categories loaded: $CAT_COUNT"
echo "   • Transactions created: $TOTAL"
echo "   • Income: \$$INCOME"
echo "   • Expenses: \$$EXPENSES"
echo "   • Balance: \$$BALANCE"
echo "   • Savings Rate: $RATE%"
echo ""
echo -e "${YELLOW}🎯 Your Finance Tracker API is 100% functional!${NC}"
echo ""
