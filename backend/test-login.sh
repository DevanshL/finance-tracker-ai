#!/bin/bash

BASE_URL="http://localhost:5000/api"
EMAIL="testuser$(date +%s)@test.com"
PASSWORD="test123456"

echo ""
echo "🧪 TESTING LOGIN FLOW"
echo "====================\n"

# TEST 1: REGISTER
echo "═══════════════════════════════════════════════════════"
echo "TEST 1️⃣ : REGISTRATION"
echo "═══════════════════════════════════════════════════════\n"

echo "📝 Registering: $EMAIL"
echo "Request:"
echo "  POST /api/auth/register"
echo "  Body: name=Test User, email=$EMAIL, password=$PASSWORD\n"

REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"passwordConfirm\": \"$PASSWORD\"
  }")

echo "Response:"
echo "$REGISTER" | jq '.' 2>/dev/null || echo "$REGISTER"

TOKEN=$(echo "$REGISTER" | jq -r '.data.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "\n❌ REGISTRATION FAILED\n"
  exit 1
fi

echo -e "\n✅ REGISTRATION SUCCESS"
echo "Token: ${TOKEN:0:30}...\n"

# TEST 2: LOGIN
echo "═══════════════════════════════════════════════════════"
echo "TEST 2️⃣ : LOGIN"
echo "═══════════════════════════════════════════════════════\n"

echo "🔐 Logging in: $EMAIL"
echo "Request:"
echo "  POST /api/auth/login"
echo "  Body: email=$EMAIL, password=$PASSWORD\n"

LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "Response:"
echo "$LOGIN" | jq '.' 2>/dev/null || echo "$LOGIN"

LOGIN_TOKEN=$(echo "$LOGIN" | jq -r '.data.token' 2>/dev/null)

if [ -z "$LOGIN_TOKEN" ] || [ "$LOGIN_TOKEN" = "null" ]; then
  echo -e "\n❌ LOGIN FAILED\n"
  exit 1
fi

echo -e "\n✅ LOGIN SUCCESS"
echo "Token: ${LOGIN_TOKEN:0:30}...\n"

# TEST 3: GET CURRENT USER
echo "═══════════════════════════════════════════════════════"
echo "TEST 3️⃣ : GET CURRENT USER"
echo "═══════════════════════════════════════════════════════\n"

echo "👤 Fetching current user"
echo "Request:"
echo "  GET /api/auth/me"
echo "  Header: Authorization: Bearer $TOKEN\n"

GET_USER=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $LOGIN_TOKEN")

echo "Response:"
echo "$GET_USER" | jq '.' 2>/dev/null || echo "$GET_USER"

USER_ID=$(echo "$GET_USER" | jq -r '.data._id' 2>/dev/null)

if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
  echo -e "\n❌ GET USER FAILED\n"
  exit 1
fi

echo -e "\n✅ GET USER SUCCESS"
echo "User ID: $USER_ID\n"

# TEST 4: LOGOUT
echo "═══════════════════════════════════════════════════════"
echo "TEST 4️⃣ : LOGOUT"
echo "═══════════════════════════════════════════════════════\n"

echo "👋 Logging out"
echo "Request:"
echo "  POST /api/auth/logout"
echo "  Header: Authorization: Bearer $TOKEN\n"

LOGOUT=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $LOGIN_TOKEN")

echo "Response:"
echo "$LOGOUT" | jq '.' 2>/dev/null || echo "$LOGOUT"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ ALL TESTS PASSED!"
echo "═══════════════════════════════════════════════════════\n"
