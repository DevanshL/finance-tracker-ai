#!/bin/bash

BASE_URL="http://localhost:5000/api"

# Get token - try login first, then register if needed
echo "Attempting login..."
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}')

# Extract token using jq for better parsing
TOKEN=$(echo $LOGIN | jq -r '.data.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "Login failed, trying registration..."
    
    REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123"
      }')
    
    TOKEN=$(echo $REGISTER | jq -r '.data.token // empty')
fi

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Failed to get token"
    echo "Login response: $LOGIN"
    echo "Register response: $REGISTER"
    exit 1
fi

echo "✅ Token received: ${TOKEN:0:50}..."
echo ""

# Test bulk create with proper token
echo "Testing bulk create..."
RESULT=$(curl -s -X POST "$BASE_URL/transactions/bulk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "transactions": [
      {
        "type": "expense",
        "amount": 30,
        "category": "Food & Dining",
        "description": "Coffee",
        "date": "2025-10-27"
      },
      {
        "type": "expense",
        "amount": 15,
        "category": "Transportation",
        "description": "Uber",
        "date": "2025-10-27"
      }
    ]
  }')

echo "$RESULT" | jq '.'
echo ""

if echo "$RESULT" | grep -q '"success":true'; then
    echo "✅ Bulk create successful!"
else
    echo "❌ Bulk create failed"
fi
