#!/bin/bash

echo "🧪 Testing Finance Tracker Backend API"
echo "======================================="
echo ""

API_URL="http://localhost:5000/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register a new user
echo "📝 Test 1: Register User"
echo "------------------------"
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "passwordConfirm": "password123"
  }')

echo "Response: ${REGISTER_RESPONSE}"
echo ""

# Check if registration was successful
if echo "${REGISTER_RESPONSE}" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Registration successful${NC}"
  TOKEN=$(echo "${REGISTER_RESPONSE}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "Token: ${TOKEN:0:20}..."
else
  echo -e "${YELLOW}⚠️  Registration failed (user might already exist)${NC}"
  
  # Try to login instead
  echo ""
  echo "🔐 Attempting login instead..."
  echo "------------------------------"
  LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "password123"
    }')
  
  echo "Response: ${LOGIN_RESPONSE}"
  echo ""
  
  if echo "${LOGIN_RESPONSE}" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Login successful${NC}"
    TOKEN=$(echo "${LOGIN_RESPONSE}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "Token: ${TOKEN:0:20}..."
  else
    echo -e "${RED}❌ Login failed${NC}"
    exit 1
  fi
fi

echo ""
echo "======================================="
echo ""

# Test 2: Get current user with token
echo "👤 Test 2: Get Current User (/auth/me)"
echo "---------------------------------------"
ME_RESPONSE=$(curl -s -X GET "${API_URL}/auth/me" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Response: ${ME_RESPONSE}"
echo ""

if echo "${ME_RESPONSE}" | grep -q '"email"'; then
  echo -e "${GREEN}✅ Get user successful${NC}"
else
  echo -e "${RED}❌ Get user failed${NC}"
fi

echo ""
echo "======================================="
echo ""

# Test 3: Check if token is valid
echo "🔍 Test 3: Token Validation"
echo "---------------------------"

if [ -z "${TOKEN}" ]; then
  echo -e "${RED}❌ No token available${NC}"
else
  echo -e "${GREEN}✅ Token exists${NC}"
  echo "Token format check:"
  
  # Count dots in JWT (should be 2)
  DOT_COUNT=$(echo "${TOKEN}" | tr -cd '.' | wc -c)
  if [ ${DOT_COUNT} -eq 2 ]; then
    echo -e "${GREEN}✅ Valid JWT format (3 parts)${NC}"
  else
    echo -e "${RED}❌ Invalid JWT format${NC}"
  fi
fi

echo ""
echo "======================================="
echo ""

# Test 4: Test with invalid token
echo "🚫 Test 4: Invalid Token Test"
echo "------------------------------"
INVALID_RESPONSE=$(curl -s -X GET "${API_URL}/auth/me" \
  -H "Authorization: Bearer invalid_token_12345")

echo "Response: ${INVALID_RESPONSE}"
echo ""

if echo "${INVALID_RESPONSE}" | grep -q "401\|Unauthorized\|invalid\|expired"; then
  echo -e "${GREEN}✅ Server correctly rejects invalid tokens${NC}"
else
  echo -e "${YELLOW}⚠️  Unexpected response for invalid token${NC}"
fi

echo ""
echo "======================================="
echo ""

# Summary
echo "📊 Test Summary"
echo "---------------"
echo "API URL: ${API_URL}"
echo "Token Available: $([ -z "${TOKEN}" ] && echo "No" || echo "Yes")"
echo ""
echo -e "${GREEN}✅ All critical tests completed${NC}"
echo ""
echo "💡 Next Steps:"
echo "   1. Make sure backend is running on port 5000"
echo "   2. Check that /auth/me endpoint is working"
echo "   3. Verify JWT token format"
echo ""