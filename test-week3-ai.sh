#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     AUTH DIAGNOSTIC & AUTO-FIX                             ║"
echo "║     Finance Tracker - Login Issue Resolver                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

API_URL="http://localhost:5000/api"
FRONTEND_URL="http://localhost:5173"

# Generate unique test user
TIMESTAMP=$(date +%s)
TEST_EMAIL="testuser${TIMESTAMP}@example.com"
TEST_PASSWORD="password123"
TEST_NAME="Test User"

echo "═══════════════════════════════════════════════════════════"
echo "📋 STEP 1: Environment Check"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check backend
echo -n "Backend (port 5000): "
if curl -s ${API_URL} > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not running${NC}"
    echo "Start with: cd backend && npm start"
    exit 1
fi

# Check frontend
echo -n "Frontend (port 5173): "
if curl -s ${FRONTEND_URL} > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not running${NC}"
    echo "Start with: cd frontend && npm run dev"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📋 STEP 2: Create Fresh Test User"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Creating unique test user: ${TEST_EMAIL}"
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\":\"${TEST_NAME}\",
    \"email\":\"${TEST_EMAIL}\",
    \"password\":\"${TEST_PASSWORD}\",
    \"passwordConfirm\":\"${TEST_PASSWORD}\"
  }")

echo "Response: ${REGISTER_RESPONSE}"
echo ""

if echo "${REGISTER_RESPONSE}" | grep -q "\"success\":true"; then
    echo -e "${GREEN}✅ Test user created successfully${NC}"
    TOKEN=$(echo "${REGISTER_RESPONSE}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    USER_CREATED=true
else
    echo -e "${RED}❌ Failed to create user${NC}"
    echo "Error: $(echo ${REGISTER_RESPONSE} | grep -o '"message":"[^"]*"' | cut -d'"' -f4)"
    USER_CREATED=false
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📋 STEP 3: Test Login"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ "$USER_CREATED" = true ]; then
    echo "Testing login with new user..."
    LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")
    
    if echo "${LOGIN_RESPONSE}" | grep -q "\"success\":true"; then
        echo -e "${GREEN}✅ Login successful${NC}"
        TOKEN=$(echo "${LOGIN_RESPONSE}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        echo "Token: ${TOKEN:0:40}..."
    else
        echo -e "${RED}❌ Login failed${NC}"
        echo "Response: ${LOGIN_RESPONSE}"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📋 STEP 4: Verify Token"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ ! -z "$TOKEN" ]; then
    echo "Testing /auth/me endpoint..."
    ME_RESPONSE=$(curl -s -X GET "${API_URL}/auth/me" \
      -H "Authorization: Bearer ${TOKEN}")
    
    if echo "${ME_RESPONSE}" | grep -q "email"; then
        echo -e "${GREEN}✅ Token is valid${NC}"
        echo "User data: $(echo ${ME_RESPONSE} | grep -o '"email":"[^"]*"')"
    else
        echo -e "${RED}❌ Token validation failed${NC}"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📋 STEP 5: Frontend Files Verification"
echo "═══════════════════════════════════════════════════════════"
echo ""

FILES_OK=true

# Check App.jsx
if [ -f "frontend/src/App.jsx" ]; then
    echo -e "${GREEN}✅${NC} App.jsx exists"
    
    if grep -q "useAuthStore" frontend/src/App.jsx; then
        echo -e "${GREEN}✅${NC} Uses useAuthStore"
    else
        echo -e "${RED}❌${NC} Missing useAuthStore"
        FILES_OK=false
    fi
    
    if grep -q "initializeAuth" frontend/src/App.jsx; then
        echo -e "${GREEN}✅${NC} Calls initializeAuth"
    else
        echo -e "${YELLOW}⚠️${NC}  Missing initializeAuth call"
        FILES_OK=false
    fi
else
    echo -e "${RED}❌${NC} App.jsx not found"
    FILES_OK=false
fi

echo ""

# Check authStore.js
if [ -f "frontend/src/store/authStore.js" ]; then
    echo -e "${GREEN}✅${NC} authStore.js exists"
    
    if grep -q "initializeAuth" frontend/src/store/authStore.js; then
        echo -e "${GREEN}✅${NC} Has initializeAuth function"
    else
        echo -e "${RED}❌${NC} Missing initializeAuth"
        FILES_OK=false
    fi
    
    if grep -q "isAuthenticated: true" frontend/src/store/authStore.js; then
        echo -e "${GREEN}✅${NC} Sets isAuthenticated on login"
    else
        echo -e "${YELLOW}⚠️${NC}  Check isAuthenticated logic"
    fi
else
    echo -e "${RED}❌${NC} authStore.js not found"
    FILES_OK=false
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📋 STEP 6: Browser Testing Instructions"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ "$USER_CREATED" = true ] && [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✅ Backend authentication is working!${NC}"
    echo ""
    echo "Now test in browser:"
    echo "1. Open: ${FRONTEND_URL}"
    echo "2. Login with:"
    echo -e "   ${CYAN}Email:${NC} ${TEST_EMAIL}"
    echo -e "   ${CYAN}Password:${NC} ${TEST_PASSWORD}"
    echo ""
    echo "3. Open DevTools Console (F12) and run:"
    echo ""
    echo -e "${YELLOW}"
    cat << 'EOF'
// Quick diagnostic
console.log('Auth check:', useAuthStore.getState().isAuthenticated);
console.log('Route:', window.location.pathname);

// If authenticated but still on login page
if (useAuthStore.getState().isAuthenticated && window.location.pathname === '/login') {
  console.log('⚠️ Auth working but redirect failed!');
  console.log('Force navigating...');
  window.location.href = '/dashboard';
}
EOF
    echo -e "${NC}"
else
    echo -e "${RED}❌ Backend authentication not working${NC}"
    echo "Check backend logs for errors"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📋 STEP 7: Quick Fixes"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "If redirect still doesn't work after login:"
echo ""
echo "FIX 1: Remove React.StrictMode"
echo "   File: frontend/src/main.jsx"
echo "   Change: <React.StrictMode><App /></React.StrictMode>"
echo "   To:     <App />"
echo ""
echo "FIX 2: Force navigate in Login.jsx"
echo "   In onSubmit function, add:"
echo "   window.location.href = '/dashboard';"
echo ""
echo "FIX 3: Clear browser storage"
echo "   In console: localStorage.clear(); location.reload();"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "📊 FINAL SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ "$USER_CREATED" = true ] && [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✅ Backend: WORKING${NC}"
    echo -e "${GREEN}✅ Authentication: WORKING${NC}"
    echo -e "${GREEN}✅ Test User Created: ${TEST_EMAIL}${NC}"
    echo ""
    
    if [ "$FILES_OK" = true ]; then
        echo -e "${GREEN}✅ Frontend Files: OK${NC}"
        echo ""
        echo -e "${CYAN}Issue is likely a React state/routing problem.${NC}"
        echo "Try the browser commands above to diagnose."
    else
        echo -e "${YELLOW}⚠️  Frontend Files: ISSUES FOUND${NC}"
        echo "Review the file checks above."
    fi
else
    echo -e "${RED}❌ Backend authentication has issues${NC}"
    echo "Cannot proceed with frontend testing."
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Diagnostic completed at $(date)"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Save credentials to file
if [ "$USER_CREATED" = true ]; then
    echo "# Test User Credentials" > test-credentials.txt
    echo "Email: ${TEST_EMAIL}" >> test-credentials.txt
    echo "Password: ${TEST_PASSWORD}" >> test-credentials.txt
    echo "Token: ${TOKEN}" >> test-credentials.txt
    echo ""
    echo -e "${CYAN}📝 Credentials saved to: test-credentials.txt${NC}"
fi