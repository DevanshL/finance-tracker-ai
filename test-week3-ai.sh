#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="http://localhost:5000/api"
TIMESTAMP=$(date +%s)
EMAIL="test${TIMESTAMP}@example.com"
PASSWORD="Password123!"

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}   WEEK 3 COMPLETE TEST (Days 13-18)${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}\n"

print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

PASSED=0
FAILED=0

# Authentication
echo -e "${YELLOW}[1/20] Authentication${NC}"
REGISTER=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(echo $REGISTER | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$TOKEN" ]; then
    print_result 0 "Authentication"
    ((PASSED++))
else
    print_result 1 "Authentication"
    ((FAILED++))
    exit 1
fi

# Setup test data
CATEGORIES=$(curl -s -X GET "${API_URL}/categories" -H "Authorization: Bearer ${TOKEN}")
CATEGORY_ID=$(echo $CATEGORIES | grep -o '"_id":"[^"]*' | head -1 | sed 's/"_id":"//')

curl -s -X POST "${API_URL}/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{\"description\":\"Test Expense\",\"amount\":100,\"type\":\"expense\",\"category\":\"${CATEGORY_ID}\",\"date\":\"2025-10-20\"}" > /dev/null

echo -e "\n${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Day 13-14: AI Integration${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"

# AI Chat
echo -e "\n${YELLOW}[2/20] AI Chat${NC}"
CHAT=$(curl -s -X POST "${API_URL}/ai/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"message":"Give me 3 quick money saving tips"}')

if echo "$CHAT" | grep -q "success.*true"; then
    print_result 0 "AI Chat"
    ((PASSED++))
else
    print_result 1 "AI Chat"
    ((FAILED++))
fi

# Analyze Spending
echo -e "\n${YELLOW}[3/20] AI Spending Analysis${NC}"
ANALYZE=$(curl -s -X GET "${API_URL}/ai/analyze-spending?period=month" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$ANALYZE" | grep -q "success.*true"; then
    print_result 0 "Spending Analysis"
    ((PASSED++))
else
    print_result 1 "Spending Analysis"
    ((FAILED++))
fi

# Budget Recommendations
echo -e "\n${YELLOW}[4/20] AI Budget Recommendations${NC}"
BUDGET_REC=$(curl -s -X POST "${API_URL}/ai/budget-recommendations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"monthlyIncome":5000}')

if echo "$BUDGET_REC" | grep -q "success.*true"; then
    print_result 0 "Budget Recommendations"
    ((PASSED++))
else
    print_result 1 "Budget Recommendations"
    ((FAILED++))
fi

# Savings Plan
echo -e "\n${YELLOW}[5/20] AI Savings Plan${NC}"
SAVINGS=$(curl -s -X POST "${API_URL}/ai/savings-plan" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"currentSavings":1000,"goalAmount":10000,"timeframe":12,"monthlyIncome":5000}')

if echo "$SAVINGS" | grep -q "success.*true"; then
    print_result 0 "Savings Plan"
    ((PASSED++))
else
    print_result 1 "Savings Plan"
    ((FAILED++))
fi

# Financial Health
echo -e "\n${YELLOW}[6/20] AI Financial Health${NC}"
HEALTH=$(curl -s -X GET "${API_URL}/ai/financial-health" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$HEALTH" | grep -q "success.*true"; then
    print_result 0 "Financial Health"
    ((PASSED++))
else
    print_result 1 "Financial Health"
    ((FAILED++))
fi

echo -e "\n${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Day 15-16: Recurring Transactions${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"

# Create Recurring Transaction
echo -e "\n${YELLOW}[7/20] Create Recurring Transaction${NC}"
RECURRING=$(curl -s -X POST "${API_URL}/recurring-transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"description\":\"Monthly Rent\",
    \"amount\":1500,
    \"type\":\"expense\",
    \"category\":\"${CATEGORY_ID}\",
    \"frequency\":\"monthly\",
    \"startDate\":\"2025-10-01\",
    \"autoProcess\":true
  }")

RECURRING_ID=$(echo $RECURRING | grep -o '"_id":"[^"]*' | head -1 | sed 's/"_id":"//')

if [ -n "$RECURRING_ID" ]; then
    print_result 0 "Create Recurring Transaction"
    ((PASSED++))
else
    print_result 1 "Create Recurring Transaction"
    ((FAILED++))
fi

# Get Recurring Transactions
echo -e "\n${YELLOW}[8/20] Get Recurring Transactions${NC}"
GET_RECURRING=$(curl -s -X GET "${API_URL}/recurring-transactions" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$GET_RECURRING" | grep -q "success.*true"; then
    print_result 0 "Get Recurring Transactions"
    ((PASSED++))
else
    print_result 1 "Get Recurring Transactions"
    ((FAILED++))
fi

# Get Upcoming Recurring
echo -e "\n${YELLOW}[9/20] Get Upcoming Recurring${NC}"
UPCOMING=$(curl -s -X GET "${API_URL}/recurring-transactions/upcoming?days=30" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$UPCOMING" | grep -q "success.*true"; then
    print_result 0 "Upcoming Recurring"
    ((PASSED++))
else
    print_result 1 "Upcoming Recurring"
    ((FAILED++))
fi

# Toggle Recurring Transaction
echo -e "\n${YELLOW}[10/20] Toggle Recurring Transaction${NC}"
if [ -n "$RECURRING_ID" ]; then
    TOGGLE=$(curl -s -X PATCH "${API_URL}/recurring-transactions/${RECURRING_ID}/toggle" \
      -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$TOGGLE" | grep -q "success.*true"; then
        print_result 0 "Toggle Recurring"
        ((PASSED++))
    else
        print_result 1 "Toggle Recurring"
        ((FAILED++))
    fi
else
    print_result 1 "Toggle Recurring (No ID)"
    ((FAILED++))
fi

# Skip Next Occurrence
echo -e "\n${YELLOW}[11/20] Skip Next Occurrence${NC}"
if [ -n "$RECURRING_ID" ]; then
    SKIP=$(curl -s -X POST "${API_URL}/recurring-transactions/${RECURRING_ID}/skip" \
      -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$SKIP" | grep -q "success.*true"; then
        print_result 0 "Skip Occurrence"
        ((PASSED++))
    else
        print_result 1 "Skip Occurrence"
        ((FAILED++))
    fi
else
    print_result 1 "Skip Occurrence (No ID)"
    ((FAILED++))
fi

echo -e "\n${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Day 17-18: Reports & Scheduling${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"

# Generate Spending Report
echo -e "\n${YELLOW}[12/20] Generate Spending Report${NC}"
SPENDING_REPORT=$(curl -s -X POST "${API_URL}/reports/spending" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"period":"month","name":"Test Spending Report"}')

REPORT_ID=$(echo $SPENDING_REPORT | grep -o '"_id":"[^"]*' | head -1 | sed 's/"_id":"//')

if [ -n "$REPORT_ID" ]; then
    print_result 0 "Spending Report"
    ((PASSED++))
else
    print_result 1 "Spending Report"
    ((FAILED++))
fi

# Generate Income Report
echo -e "\n${YELLOW}[13/20] Generate Income Report${NC}"
INCOME_REPORT=$(curl -s -X POST "${API_URL}/reports/income" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"period":"month"}')

if echo "$INCOME_REPORT" | grep -q "success.*true"; then
    print_result 0 "Income Report"
    ((PASSED++))
else
    print_result 1 "Income Report"
    ((FAILED++))
fi

# Generate Budget Report
echo -e "\n${YELLOW}[14/20] Generate Budget Report${NC}"
BUDGET_REPORT=$(curl -s -X POST "${API_URL}/reports/budget" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"period":"month"}')

if echo "$BUDGET_REPORT" | grep -q "success.*true"; then
    print_result 0 "Budget Report"
    ((PASSED++))
else
    print_result 1 "Budget Report"
    ((FAILED++))
fi

# Generate Goals Report
echo -e "\n${YELLOW}[15/20] Generate Goals Report${NC}"
GOALS_REPORT=$(curl -s -X POST "${API_URL}/reports/goals" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"name":"Test Goals Report"}')

if echo "$GOALS_REPORT" | grep -q "success.*true"; then
    print_result 0 "Goals Report"
    ((PASSED++))
else
    print_result 1 "Goals Report"
    ((FAILED++))
fi

# Generate Comprehensive Report
echo -e "\n${YELLOW}[16/20] Generate Comprehensive Report${NC}"
COMP_REPORT=$(curl -s -X POST "${API_URL}/reports/comprehensive" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"period":"month"}')

if echo "$COMP_REPORT" | grep -q "success.*true"; then
    print_result 0 "Comprehensive Report"
    ((PASSED++))
else
    print_result 1 "Comprehensive Report"
    ((FAILED++))
fi

# Get All Reports
echo -e "\n${YELLOW}[17/20] Get All Reports${NC}"
ALL_REPORTS=$(curl -s -X GET "${API_URL}/reports" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$ALL_REPORTS" | grep -q "success.*true"; then
    print_result 0 "Get Reports"
    ((PASSED++))
else
    print_result 1 "Get Reports"
    ((FAILED++))
fi

# Get Single Report
echo -e "\n${YELLOW}[18/20] Get Single Report${NC}"
if [ -n "$REPORT_ID" ]; then
    SINGLE_REPORT=$(curl -s -X GET "${API_URL}/reports/${REPORT_ID}" \
      -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$SINGLE_REPORT" | grep -q "success.*true"; then
        print_result 0 "Get Single Report"
        ((PASSED++))
    else
        print_result 1 "Get Single Report"
        ((FAILED++))
    fi
else
    print_result 1 "Get Single Report (No ID)"
    ((FAILED++))
fi

# Schedule Report
echo -e "\n${YELLOW}[19/20] Schedule Report${NC}"
SCHEDULE=$(curl -s -X POST "${API_URL}/reports/schedule" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"type":"spending","frequency":"monthly","period":"month"}')

if echo "$SCHEDULE" | grep -q "success.*true"; then
    print_result 0 "Schedule Report"
    ((PASSED++))
else
    print_result 1 "Schedule Report"
    ((FAILED++))
fi

# Export Report as PDF
echo -e "\n${YELLOW}[20/20] Export Report PDF${NC}"
if [ -n "$REPORT_ID" ]; then
    PDF_CODE=$(curl -s -w "%{http_code}" -o /dev/null \
      -X GET "${API_URL}/reports/${REPORT_ID}/export/pdf" \
      -H "Authorization: Bearer ${TOKEN}")
    
    if [ "$PDF_CODE" = "200" ]; then
        print_result 0 "Export PDF"
        ((PASSED++))
    else
        print_result 1 "Export PDF (HTTP $PDF_CODE)"
        ((FAILED++))
    fi
else
    print_result 1 "Export PDF (No ID)"
    ((FAILED++))
fi

# Final Results
echo -e "\n${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}          WEEK 3 TEST RESULTS${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}\n"

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo -e "${GREEN}✅ Passed: ${PASSED}/${TOTAL}${NC}"
echo -e "${RED}❌ Failed: ${FAILED}/${TOTAL}${NC}"
echo -e "${BLUE}📊 Success Rate: ${PERCENTAGE}%${NC}\n"

if [ $PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}🎉 EXCELLENT! Week 3 Complete!${NC}\n"
    echo -e "${GREEN}✨ Day 13-14: AI Integration ✅${NC}"
    echo -e "${GREEN}✨ Day 15-16: Recurring Transactions ✅${NC}"
    echo -e "${GREEN}✨ Day 17-18: Reports & Scheduling ✅${NC}\n"
    echo -e "${GREEN}🚀 3 WEEKS DONE - BACKEND COMPLETE!${NC}\n"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some features need attention${NC}\n"
    exit 1
fi