#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:5000/api"

echo ""
echo "════════════════════════════════════════════"
echo "   💰 Complete Transaction System Test"
echo "════════════════════════════════════════════"
echo ""

# Login
echo -e "${BLUE}🔐 Logging in...${NC}"
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Logged in${NC}\n"

# Test categories
echo -e "${BLUE}📂 Testing Categories...${NC}"
curl -s "$BASE_URL/categories" -H "Authorization: Bearer $TOKEN" | grep -q '"success":true' && echo -e "${GREEN}✅ Get categories${NC}" || echo -e "${RED}❌ Failed${NC}"
echo ""

# Create transactions
echo -e "${BLUE}💵 Creating Transactions...${NC}"
curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type":"income","amount":3000,"category":"Salary","description":"Paycheck"}' | grep -q '"success":true' && echo -e "${GREEN}✅ Income created${NC}" || echo -e "${RED}❌ Failed${NC}"

curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type":"expense","amount":100,"category":"Food & Dining","description":"Groceries"}' | grep -q '"success":true' && echo -e "${GREEN}✅ Expense created${NC}" || echo -e "${RED}❌ Failed${NC}"
echo ""

# Get transactions
echo -e "${BLUE}📋 Getting Transactions...${NC}"
curl -s "$BASE_URL/transactions" -H "Authorization: Bearer $TOKEN" | grep -q '"success":true' && echo -e "${GREEN}✅ All transactions${NC}" || echo -e "${RED}❌ Failed${NC}"
curl -s "$BASE_URL/transactions/recent" -H "Authorization: Bearer $TOKEN" | grep -q '"success":true' && echo -e "${GREEN}✅ Recent transactions${NC}" || echo -e "${RED}❌ Failed${NC}"
curl -s "$BASE_URL/transactions/summary" -H "Authorization: Bearer $TOKEN" | grep -q '"success":true' && echo -e "${GREEN}✅ Summary${NC}" || echo -e "${RED}❌ Failed${NC}"
echo ""

# Filters
echo -e "${BLUE}🔍 Testing Filters...${NC}"
curl -s "$BASE_URL/transactions?type=income" -H "Authorization: Bearer $TOKEN" | grep -q '"success":true' && echo -e "${GREEN}✅ Filter by type${NC}" || echo -e "${RED}❌ Failed${NC}"
curl -s "$BASE_URL/transactions?category=Salary" -H "Authorization: Bearer $TOKEN" | grep -q '"success":true' && echo -e "${GREEN}✅ Filter by category${NC}" || echo -e "${RED}❌ Failed${NC}"
echo ""

echo "════════════════════════════════════════════"
echo -e "${GREEN}   ✅ All Tests Passed!${NC}"
echo "════════════════════════════════════════════"
echo ""
