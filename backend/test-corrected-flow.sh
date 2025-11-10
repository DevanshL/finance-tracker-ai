#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

BACKEND_URL="http://localhost:5000"

print_header() {
    echo -e "\n${CYAN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  $1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}\n"
}

print_test() {
    echo -e "${BLUE}→ $1${NC}"
}

print_pass() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_fail() {
    echo -e "${RED}✗ $1${NC}"
}

# ==========================================
# TEST 1: REGISTER WITH CORRECT FIELDS
# ==========================================

test_register() {
    print_header "TEST 1: REGISTER WITH CORRECT FIELDS"
    
    EMAIL="test$(date +%s)@test.com"
    PASSWORD="Test1234"
    NAME="Test User"
    
    print_test "POST /api/auth/register"
    echo -e "${YELLOW}Email: $EMAIL${NC}"
    echo -e "${YELLOW}Name: $NAME${NC}"
    echo -e "${YELLOW}Password: $PASSWORD${NC}\n"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\":\"$NAME\",
            \"email\":\"$EMAIL\",
            \"password\":\"$PASSWORD\",
            \"passwordConfirm\":\"$PASSWORD\"
        }" \
        --max-time 5 2>/dev/null)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo -e "Status: ${YELLOW}$HTTP_CODE${NC}"
    echo -e "Response:"
    echo "$BODY" | json_pp 2>/dev/null || echo "$BODY"
    echo ""
    
    if [ "$HTTP_CODE" = "201" ]; then
        print_pass "Registration successful"
        TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        if [ ! -z "$TOKEN" ]; then
            print_pass "Token received: ${TOKEN:0:20}..."
            echo "$TOKEN" > /tmp/test_token.txt
        else
            print_fail "Token not in response"
        fi
    else
        print_fail "Registration failed with status $HTTP_CODE"
    fi
}

# ==========================================
# TEST 2: LOGIN WITH CORRECT FIELDS
# ==========================================

test_login() {
    print_header "TEST 2: LOGIN WITH CORRECT FIELDS"
    
    EMAIL="test@test.com"
    PASSWORD="Test1234"
    
    print_test "POST /api/auth/login"
    echo -e "${YELLOW}Email: $EMAIL${NC}"
    echo -e "${YELLOW}Password: $PASSWORD${NC}\n"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\":\"$EMAIL\",
            \"password\":\"$PASSWORD\"
        }" \
        --max-time 5 2>/dev/null)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo -e "Status: ${YELLOW}$HTTP_CODE${NC}"
    echo -e "Response:"
    echo "$BODY" | json_pp 2>/dev/null || echo "$BODY"
    echo ""
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_pass "Login successful"
        TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        if [ ! -z "$TOKEN" ]; then
            print_pass "Token received: ${TOKEN:0:20}..."
            echo "$TOKEN" > /tmp/test_token.txt
        fi
    else
        print_fail "Login failed with status $HTTP_CODE"
    fi
}

# ==========================================
# TEST 3: USE TOKEN ON PROTECTED ENDPOINTS
# ==========================================

test_protected_endpoints() {
    print_header "TEST 3: USE TOKEN ON PROTECTED ENDPOINTS"
    
    if [ ! -f /tmp/test_token.txt ]; then
        print_fail "No token available"
        return
    fi
    
    TOKEN=$(cat /tmp/test_token.txt)
    
    print_test "GET /api/budgets with token"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL/api/budgets" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        --max-time 5 2>/dev/null)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo -e "Status: ${YELLOW}$HTTP_CODE${NC}"
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        print_pass "Budgets endpoint accessible"
    else
        print_fail "Budgets failed with status $HTTP_CODE"
    fi
    
    print_test "GET /api/goals with token"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL/api/goals" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        --max-time 5 2>/dev/null)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        print_pass "Goals endpoint accessible"
    else
        print_fail "Goals failed with status $HTTP_CODE"
    fi
    
    print_test "POST /api/budgets - Create budget"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/budgets" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "category":"Groceries",
            "amount":500,
            "period":"monthly",
            "alert":80
        }' \
        --max-time 5 2>/dev/null)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        print_pass "Budget creation successful"
    else
        print_fail "Budget creation failed with status $HTTP_CODE"
    fi
    
    print_test "POST /api/goals - Create goal"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/goals" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name":"Emergency Fund",
            "targetAmount":15000,
            "currentAmount":0,
            "deadline":"2025-12-31"
        }' \
        --max-time 5 2>/dev/null)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        print_pass "Goal creation successful"
    else
        print_fail "Goal creation failed with status $HTTP_CODE"
    fi
}

# ==========================================
# MAIN
# ==========================================

main() {
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║         CORRECTED AUTHENTICATION FLOW TEST                    ║
║                   Finance Tracker                             ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    test_register
    test_login
    test_protected_endpoints
    
    echo -e "${CYAN}═══════════════════════════════════════════${NC}\n"
}

main
