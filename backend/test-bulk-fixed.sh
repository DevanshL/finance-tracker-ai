#!/bin/bash

BASE_URL="http://localhost:5000/api"

echo "🔐 Creating fresh user..."

# Use timestamp for unique email
TIMESTAMP=$(date +%s)
EMAIL="testuser${TIMESTAMP}@example.com"

REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$EMAIL\",
    \"password\": \"password123\"
  }")

# Extract token using jq
TOKEN=$(echo $REGISTER | jq -r '.data.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Failed to get token"
    echo "Response: $REGISTER"
    exit 1
fi

echo "✅ User registered: $EMAIL"
echo "✅ Token: ${TOKEN:0:50}..."
echo ""

# Test bulk create
echo "📝 Testing bulk create..."
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
      },
      {
        "type": "income",
        "amount": 500,
        "category": "Freelance",
        "description": "Website project",
        "date": "2025-10-27"
      }
    ]
  }')

echo "$RESULT" | jq '.'
echo ""

if echo "$RESULT" | jq -e '.success' > /dev/null 2>&1; then
    COUNT=$(echo "$RESULT" | jq -r '.data.count')
    echo "✅ Bulk create successful! Created $COUNT transactions"
else
    echo "❌ Bulk create failed"
    echo "$RESULT" | jq -r '.message'
fi
