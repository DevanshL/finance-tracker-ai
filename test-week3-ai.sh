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
echo -e "${BLUE}   WEEK 5 COMPLETE TEST (Days 25-28)${NC}"
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
echo -e "${YELLOW}[1/16] Authentication${NC}"
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

echo -e "\n${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Day 25-26: WebSocket Real-time${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"

# Get WebSocket Info
echo -e "\n${YELLOW}[2/16] Get WebSocket Info${NC}"
WS_INFO=$(curl -s -X GET "${API_URL}/websocket/info" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$WS_INFO" | grep -q "wsUrl"; then
    print_result 0 "WebSocket Info"
    ((PASSED++))
else
    print_result 1 "WebSocket Info"
    ((FAILED++))
fi

# Get WebSocket Stats
echo -e "\n${YELLOW}[3/16] Get WebSocket Stats${NC}"
WS_STATS=$(curl -s -X GET "${API_URL}/websocket/stats" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$WS_STATS" | grep -q "totalConnections"; then
    print_result 0 "WebSocket Stats"
    ((PASSED++))
else
    print_result 1 "WebSocket Stats"
    ((FAILED++))
fi

# Send Test Notification
echo -e "\n${YELLOW}[4/16] Send Test WebSocket Notification${NC}"
TEST_NOTIF=$(curl -s -X POST "${API_URL}/websocket/test" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"message":"Test WebSocket message"}')

if echo "$TEST_NOTIF" | grep -q "success"; then
    print_result 0 "WebSocket Test Notification"
    ((PASSED++))
else
    print_result 1 "WebSocket Test Notification"
    ((FAILED++))
fi

echo -e "\n${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Day 27-28: User Settings${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"

# Get Settings
echo -e "\n${YELLOW}[5/16] Get User Settings${NC}"
SETTINGS=$(curl -s -X GET "${API_URL}/settings" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$SETTINGS" | grep -q "display"; then
    print_result 0 "Get Settings"
    ((PASSED++))
else
    print_result 1 "Get Settings"
    ((FAILED++))
fi

# Get Available Options
echo -e "\n${YELLOW}[6/16] Get Available Options${NC}"
OPTIONS=$(curl -s -X GET "${API_URL}/settings/options" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$OPTIONS" | grep -q "currencies"; then
    print_result 0 "Available Options"
    ((PASSED++))
else
    print_result 1 "Available Options"
    ((FAILED++))
fi

# Update Display Settings
echo -e "\n${YELLOW}[7/16] Update Display Settings${NC}"
DISPLAY=$(curl -s -X PATCH "${API_URL}/settings/display" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"currency":"EUR","language":"en","theme":"dark"}')

if echo "$DISPLAY" | grep -q "EUR"; then
    print_result 0 "Update Display Settings"
    ((PASSED++))
else
    print_result 1 "Update Display Settings"
    ((FAILED++))
fi

# Update Notification Settings
echo -e "\n${YELLOW}[8/16] Update Notification Settings${NC}"
NOTIF_SETTINGS=$(curl -s -X PATCH "${API_URL}/settings/notifications" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"email":{"enabled":true,"budgetAlerts":true}}')

if echo "$NOTIF_SETTINGS" | grep -q "email"; then
    print_result 0 "Update Notification Settings"
    ((PASSED++))
else
    print_result 1 "Update Notification Settings"
    ((FAILED++))
fi

# Update Privacy Settings
echo -e "\n${YELLOW}[9/16] Update Privacy Settings${NC}"
PRIVACY=$(curl -s -X PATCH "${API_URL}/settings/privacy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"profileVisibility":"private"}')

if echo "$PRIVACY" | grep -q "profileVisibility"; then
    print_result 0 "Update Privacy Settings"
    ((PASSED++))
else
    print_result 1 "Update Privacy Settings"
    ((FAILED++))
fi

# Update Budget Settings
echo -e "\n${YELLOW}[10/16] Update Budget Settings${NC}"
BUDGET_SETTINGS=$(curl -s -X PATCH "${API_URL}/settings/budgets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"defaultPeriod":"monthly","alertThreshold":85}')

if echo "$BUDGET_SETTINGS" | grep -q "alertThreshold"; then
    print_result 0 "Update Budget Settings"
    ((PASSED++))
else
    print_result 1 "Update Budget Settings"
    ((FAILED++))
fi

# Update Goal Settings
echo -e "\n${YELLOW}[11/16] Update Goal Settings${NC}"
GOAL_SETTINGS=$(curl -s -X PATCH "${API_URL}/settings/goals" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"defaultPriority":"high","reminderFrequency":"weekly"}')

if echo "$GOAL_SETTINGS" | grep -q "reminderFrequency"; then
    print_result 0 "Update Goal Settings"
    ((PASSED++))
else
    print_result 1 "Update Goal Settings"
    ((FAILED++))
fi

# Update AI Settings
echo -e "\n${YELLOW}[12/16] Update AI Settings${NC}"
AI_SETTINGS=$(curl -s -X PATCH "${API_URL}/settings/ai" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"enabled":true,"autoAnalysis":true}')

if echo "$AI_SETTINGS" | grep -q "enabled"; then
    print_result 0 "Update AI Settings"
    ((PASSED++))
else
    print_result 1 "Update AI Settings"
    ((FAILED++))
fi

# Update Export Settings
echo -e "\n${YELLOW}[13/16] Update Export Settings${NC}"
EXPORT_SETTINGS=$(curl -s -X PATCH "${API_URL}/settings/export" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"defaultFormat":"pdf","includeCharts":true}')

if echo "$EXPORT_SETTINGS" | grep -q "defaultFormat"; then
    print_result 0 "Update Export Settings"
    ((PASSED++))
else
    print_result 1 "Update Export Settings"
    ((FAILED++))
fi

# Update Backup Settings
echo -e "\n${YELLOW}[14/16] Update Backup Settings${NC}"
BACKUP_SETTINGS=$(curl -s -X PATCH "${API_URL}/settings/backup" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"autoBackup":true,"frequency":"weekly"}')

if echo "$BACKUP_SETTINGS" | grep -q "frequency"; then
    print_result 0 "Update Backup Settings"
    ((PASSED++))
else
    print_result 1 "Update Backup Settings"
    ((FAILED++))
fi

# Update All Settings
echo -e "\n${YELLOW}[15/16] Update All Settings${NC}"
UPDATE_ALL=$(curl -s -X PUT "${API_URL}/settings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"display":{"currency":"USD"},"ai":{"enabled":true}}')

if echo "$UPDATE_ALL" | grep -q "success.*true"; then
    print_result 0 "Update All Settings"
    ((PASSED++))
else
    print_result 1 "Update All Settings"
    ((FAILED++))
fi

# Reset Settings
echo -e "\n${YELLOW}[16/16] Reset Settings to Default${NC}"
RESET=$(curl -s -X POST "${API_URL}/settings/reset" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$RESET" | grep -q "reset to default"; then
    print_result 0 "Reset Settings"
    ((PASSED++))
else
    print_result 1 "Reset Settings"
    ((FAILED++))
fi

# Final Results
echo -e "\n${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}          WEEK 5 TEST RESULTS${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}\n"

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo -e "${GREEN}✅ Passed: ${PASSED}/${TOTAL}${NC}"
echo -e "${RED}❌ Failed: ${FAILED}/${TOTAL}${NC}"
echo -e "${BLUE}📊 Success Rate: ${PERCENTAGE}%${NC}\n"

if [ $PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}🎉 EXCELLENT! Week 5 Complete!${NC}\n"
    echo -e "${GREEN}✨ Day 25-26: WebSocket Real-time ✅${NC}"
    echo -e "${GREEN}✨ Day 27-28: User Settings ✅${NC}\n"
    echo -e "${GREEN}🚀 5 WEEKS COMPLETE - 100+ ENDPOINTS!${NC}\n"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some features need attention${NC}\n"
    exit 1
fi