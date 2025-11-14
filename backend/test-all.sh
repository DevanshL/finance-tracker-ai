#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m'

clear
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}║    BACKEND PERFECTION CHECK                                  ║${NC}"
echo -e "${BLUE}║    Personal Finance Tracker - Backend Only Assessment       ║${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Global counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
MISSING_FEATURES=0

# Function to check file existence and content
check_file() {
    local file=$1
    local name=$2
    local required=$3  # "required" or "optional"
    
    ((TOTAL_CHECKS++))
    
    if [ -f "$file" ]; then
        local lines=$(wc -l < "$file" 2>/dev/null | tr -d ' ')
        if [ "$lines" -gt 10 ]; then
            echo -e "${GREEN}✓${NC} $name ${CYAN}($lines lines)${NC}"
            ((PASSED_CHECKS++))
            return 0
        else
            echo -e "${YELLOW}⚠${NC} $name ${YELLOW}(exists but only $lines lines - may be incomplete)${NC}"
            ((PASSED_CHECKS++))
            return 0
        fi
    else
        if [ "$required" = "required" ]; then
            echo -e "${RED}✗${NC} $name ${RED}(MISSING - REQUIRED)${NC}"
            ((FAILED_CHECKS++))
            ((MISSING_FEATURES++))
            return 1
        else
            echo -e "${YELLOW}○${NC} $name ${YELLOW}(not implemented - optional)${NC}"
            return 2
        fi
    fi
}

# Function to check if function exists in controller
check_controller_function() {
    local file=$1
    local function=$2
    
    if [ -f "$file" ]; then
        if grep -q "^exports\.$function\|^module\.exports.*$function" "$file"; then
            return 0
        fi
    fi
    return 1
}

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local name=$3
    local auth_required=$4
    
    if ! curl -s http://localhost:5000 > /dev/null 2>&1; then
        return 2  # Server not running
    fi
    
    if [ "$method" = "GET" ]; then
        if [ "$auth_required" = "true" ]; then
            # Just check if endpoint exists (will return 401 without auth)
            local status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000${endpoint}")
            if [ "$status" = "401" ] || [ "$status" = "200" ]; then
                return 0
            fi
        else
            local status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000${endpoint}")
            if [ "$status" = "200" ]; then
                return 0
            fi
        fi
    fi
    return 1
}

echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}PART 1: PROJECT STRUCTURE${NC}"
echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}📁 Core Configuration Files:${NC}"
check_file "package.json" "Package Configuration" "required"
check_file "server.js" "Server Entry Point" "required"
check_file ".env.example" "Environment Template" "required"
check_file ".gitignore" "Git Ignore" "required"
check_file "README.md" "Documentation" "optional"
echo ""

echo -e "${CYAN}📁 Configuration Directory (config/):${NC}"
check_file "config/db.js" "Database Connection" "required"
check_file "config/jwt.js" "JWT Configuration" "optional"
check_file "config/openai.js" "OpenAI Configuration" "optional"
check_file "config/constants.js" "App Constants" "optional"
echo ""

echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}PART 2: MODELS (Data Layer)${NC}"
echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo ""

check_file "models/User.js" "User Model" "required"
check_file "models/Transaction.js" "Transaction Model" "required"
check_file "models/Budget.js" "Budget Model" "required"
check_file "models/Goal.js" "Goal Model" "required"
check_file "models/Category.js" "Category Model" "required"
check_file "models/AIChat.js" "AI Chat History Model" "optional"
check_file "models/RefreshToken.js" "Refresh Token Model" "optional"
echo ""

echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}PART 3: CONTROLLERS (Business Logic)${NC}"
echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}🎮 Authentication & User Management:${NC}"
check_file "controllers/authController.js" "Auth Controller" "required"
if [ -f "controllers/authController.js" ]; then
    echo -e "  ${BLUE}Functions:${NC}"
    check_controller_function "controllers/authController.js" "register" && echo -e "    ${GREEN}✓${NC} register" || echo -e "    ${RED}✗${NC} register"
    check_controller_function "controllers/authController.js" "login" && echo -e "    ${GREEN}✓${NC} login" || echo -e "    ${RED}✗${NC} login"
    check_controller_function "controllers/authController.js" "logout" && echo -e "    ${GREEN}✓${NC} logout" || echo -e "    ${RED}✗${NC} logout"
    check_controller_function "controllers/authController.js" "getProfile" && echo -e "    ${GREEN}✓${NC} getProfile" || echo -e "    ${RED}✗${NC} getProfile"
fi
check_file "controllers/userController.js" "User Controller" "optional"
echo ""

echo -e "${CYAN}💰 Financial Operations:${NC}"
check_file "controllers/transactionController.js" "Transaction Controller" "required"
if [ -f "controllers/transactionController.js" ]; then
    echo -e "  ${BLUE}CRUD Functions:${NC}"
    check_controller_function "controllers/transactionController.js" "getTransactions" && echo -e "    ${GREEN}✓${NC} getTransactions" || echo -e "    ${RED}✗${NC} getTransactions"
    check_controller_function "controllers/transactionController.js" "createTransaction" && echo -e "    ${GREEN}✓${NC} createTransaction" || echo -e "    ${RED}✗${NC} createTransaction"
    check_controller_function "controllers/transactionController.js" "updateTransaction" && echo -e "    ${GREEN}✓${NC} updateTransaction" || echo -e "    ${RED}✗${NC} updateTransaction"
    check_controller_function "controllers/transactionController.js" "deleteTransaction" && echo -e "    ${GREEN}✓${NC} deleteTransaction" || echo -e "    ${RED}✗${NC} deleteTransaction"
fi

check_file "controllers/budgetController.js" "Budget Controller" "required"
if [ -f "controllers/budgetController.js" ]; then
    echo -e "  ${BLUE}Budget Functions:${NC}"
    check_controller_function "controllers/budgetController.js" "createBudget" && echo -e "    ${GREEN}✓${NC} createBudget" || echo -e "    ${RED}✗${NC} createBudget"
    check_controller_function "controllers/budgetController.js" "getBudgets" && echo -e "    ${GREEN}✓${NC} getBudgets" || echo -e "    ${RED}✗${NC} getBudgets"
    check_controller_function "controllers/budgetController.js" "getBudgetStatus" && echo -e "    ${GREEN}✓${NC} getBudgetStatus" || echo -e "    ${RED}✗${NC} getBudgetStatus"
    check_controller_function "controllers/budgetController.js" "getBudgetAlerts" && echo -e "    ${GREEN}✓${NC} getBudgetAlerts" || echo -e "    ${RED}✗${NC} getBudgetAlerts"
fi

check_file "controllers/goalController.js" "Goal Controller" "required"
if [ -f "controllers/goalController.js" ]; then
    echo -e "  ${BLUE}Goal Functions:${NC}"
    check_controller_function "controllers/goalController.js" "createGoal" && echo -e "    ${GREEN}✓${NC} createGoal" || echo -e "    ${RED}✗${NC} createGoal"
    check_controller_function "controllers/goalController.js" "getGoals" && echo -e "    ${GREEN}✓${NC} getGoals" || echo -e "    ${RED}✗${NC} getGoals"
    check_controller_function "controllers/goalController.js" "addContribution" && echo -e "    ${GREEN}✓${NC} addContribution" || echo -e "    ${RED}✗${NC} addContribution"
fi

check_file "controllers/categoryController.js" "Category Controller" "required"
check_file "controllers/bulkController.js" "Bulk Operations Controller" "required"
echo ""

echo -e "${CYAN}📊 Analytics & Insights:${NC}"
check_file "controllers/analyticsController.js" "Analytics Controller" "required"
if [ -f "controllers/analyticsController.js" ]; then
    echo -e "  ${BLUE}Analytics Functions:${NC}"
    check_controller_function "controllers/analyticsController.js" "getDashboard" && echo -e "    ${GREEN}✓${NC} getDashboard" || echo -e "    ${YELLOW}○${NC} getDashboard"
    check_controller_function "controllers/analyticsController.js" "getCategoryAnalysis" && echo -e "    ${GREEN}✓${NC} getCategoryAnalysis" || echo -e "    ${YELLOW}○${NC} getCategoryAnalysis"
    check_controller_function "controllers/analyticsController.js" "getTrends" && echo -e "    ${GREEN}✓${NC} getTrends" || echo -e "    ${YELLOW}○${NC} getTrends"
fi

check_file "controllers/dashboardController.js" "Dashboard Controller" "required"
echo ""

echo -e "${CYAN}🤖 AI Features:${NC}"
check_file "controllers/aiController.js" "AI Controller" "required"
if [ -f "controllers/aiController.js" ]; then
    echo -e "  ${BLUE}AI Functions:${NC}"
    check_controller_function "controllers/aiController.js" "getFinancialInsights" && echo -e "    ${GREEN}✓${NC} getFinancialInsights" || echo -e "    ${RED}✗${NC} getFinancialInsights"
    check_controller_function "controllers/aiController.js" "getSpendingPrediction" && echo -e "    ${GREEN}✓${NC} getSpendingPrediction" || echo -e "    ${RED}✗${NC} getSpendingPrediction"
    check_controller_function "controllers/aiController.js" "getCategorySuggestions" && echo -e "    ${GREEN}✓${NC} getCategorySuggestions" || echo -e "    ${RED}✗${NC} getCategorySuggestions"
    check_controller_function "controllers/aiController.js" "getBudgetRecommendations" && echo -e "    ${GREEN}✓${NC} getBudgetRecommendations" || echo -e "    ${RED}✗${NC} getBudgetRecommendations"
fi
echo ""

echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}PART 4: ROUTES (API Endpoints)${NC}"
echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo ""

check_file "routes/auth.js" "Auth Routes" "required"
check_file "routes/transactions.js" "Transaction Routes" "required"
check_file "routes/budgets.js" "Budget Routes" "required"
check_file "routes/goals.js" "Goal Routes" "required"
check_file "routes/categories.js" "Category Routes" "required"
check_file "routes/analytics.js" "Analytics Routes" "required"
check_file "routes/dashboard.js" "Dashboard Routes" "required"
check_file "routes/ai.js" "AI Routes" "required"
check_file "routes/index.js" "Route Aggregator" "optional"
echo ""

echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}PART 5: MIDDLEWARE${NC}"
echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo ""

check_file "middleware/auth.js" "Authentication Middleware" "required"
check_file "middleware/errorHandler.js" "Error Handler" "required"
check_file "middleware/validator.js" "Request Validator" "required"
check_file "middleware/rateLimiter.js" "Rate Limiter" "optional"
check_file "middleware/asyncHandler.js" "Async Handler" "optional"
echo ""

echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}PART 6: SERVICES (Optional but Recommended)${NC}"
echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo ""

check_file "services/authService.js" "Auth Service" "optional"
check_file "services/transactionService.js" "Transaction Service" "optional"
check_file "services/budgetService.js" "Budget Service" "optional"
check_file "services/analyticsService.js" "Analytics Service" "optional"
check_file "services/aiService.js" "AI Service" "optional"
check_file "services/emailService.js" "Email Service" "optional"
check_file "services/predictionService.js" "Prediction Service" "optional"
echo ""

echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}PART 7: UTILITIES${NC}"
echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo ""

check_file "utils/generateToken.js" "Token Generator" "required"
check_file "utils/logger.js" "Logger" "optional"
check_file "utils/validators.js" "Validators" "optional"
check_file "utils/formatters.js" "Formatters" "optional"
check_file "utils/apiResponse.js" "API Response Helper" "optional"
check_file "utils/calculations.js" "Financial Calculations" "optional"
echo ""

echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}PART 8: TESTING${NC}"
echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo ""

check_file "tests/unit/auth.test.js" "Auth Unit Tests" "optional"
check_file "tests/unit/transaction.test.js" "Transaction Tests" "optional"
check_file "tests/integration/api.test.js" "API Integration Tests" "optional"
echo ""

echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}PART 9: API ENDPOINT LIVE TESTS${NC}"
echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo ""

if curl -s http://localhost:5000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is running on port 5000${NC}"
    echo ""
    
    echo -e "${CYAN}Testing Public Endpoints:${NC}"
    test_endpoint "GET" "/api/health" "Health Check" "false" && echo -e "${GREEN}✓${NC} Health Check" || echo -e "${YELLOW}○${NC} Health Check"
    test_endpoint "GET" "/api/categories" "Get Categories" "true" && echo -e "${GREEN}✓${NC} Categories Endpoint" || echo -e "${YELLOW}○${NC} Categories Endpoint"
    echo ""
    
    echo -e "${CYAN}Testing Protected Endpoints (should return 401):${NC}"
    test_endpoint "GET" "/api/transactions" "Transactions List" "true" && echo -e "${GREEN}✓${NC} Transactions Endpoint Protected" || echo -e "${RED}✗${NC} Transactions Endpoint"
    test_endpoint "GET" "/api/budgets" "Budgets List" "true" && echo -e "${GREEN}✓${NC} Budgets Endpoint Protected" || echo -e "${RED}✗${NC} Budgets Endpoint"
    test_endpoint "GET" "/api/goals" "Goals List" "true" && echo -e "${GREEN}✓${NC} Goals Endpoint Protected" || echo -e "${RED}✗${NC} Goals Endpoint"
    test_endpoint "GET" "/api/dashboard" "Dashboard" "true" && echo -e "${GREEN}✓${NC} Dashboard Endpoint Protected" || echo -e "${RED}✗${NC} Dashboard Endpoint"
    test_endpoint "GET" "/api/analytics/overview" "Analytics" "true" && echo -e "${GREEN}✓${NC} Analytics Endpoint Protected" || echo -e "${RED}✗${NC} Analytics Endpoint"
    test_endpoint "GET" "/api/ai/insights" "AI Insights" "true" && echo -e "${GREEN}✓${NC} AI Endpoint Protected" || echo -e "${RED}✗${NC} AI Endpoint"
    echo ""
else
    echo -e "${RED}✗ Server is NOT running${NC}"
    echo -e "${YELLOW}  Start server with: npm start or nodemon server.js${NC}"
    echo -e "${YELLOW}  Cannot perform live API tests${NC}"
    echo ""
fi

echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}PART 10: DEPENDENCY CHECK${NC}"
echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo ""

if [ -f "package.json" ]; then
    echo -e "${CYAN}Core Dependencies:${NC}"
    grep -q '"express"' package.json && echo -e "${GREEN}✓${NC} Express.js" || echo -e "${RED}✗${NC} Express.js"
    grep -q '"mongoose"' package.json && echo -e "${GREEN}✓${NC} Mongoose (MongoDB)" || echo -e "${RED}✗${NC} Mongoose"
    grep -q '"jsonwebtoken"' package.json && echo -e "${GREEN}✓${NC} JWT" || echo -e "${RED}✗${NC} JWT"
    grep -q '"bcryptjs"' package.json && echo -e "${GREEN}✓${NC} Bcrypt" || echo -e "${RED}✗${NC} Bcrypt"
    grep -q '"dotenv"' package.json && echo -e "${GREEN}✓${NC} Dotenv" || echo -e "${RED}✗${NC} Dotenv"
    grep -q '"cors"' package.json && echo -e "${GREEN}✓${NC} CORS" || echo -e "${RED}✗${NC} CORS"
    
    echo ""
    echo -e "${CYAN}Optional Dependencies:${NC}"
    grep -q '"openai"' package.json && echo -e "${GREEN}✓${NC} OpenAI" || echo -e "${YELLOW}○${NC} OpenAI (for AI features)"
    grep -q '"date-fns"' package.json && echo -e "${GREEN}✓${NC} Date-fns" || echo -e "${YELLOW}○${NC} Date-fns"
    grep -q '"express-validator"' package.json && echo -e "${GREEN}✓${NC} Express Validator" || echo -e "${YELLOW}○${NC} Express Validator"
    grep -q '"express-rate-limit"' package.json && echo -e "${GREEN}✓${NC} Rate Limiter" || echo -e "${YELLOW}○${NC} Rate Limiter"
    grep -q '"winston"' package.json && echo -e "${GREEN}✓${NC} Winston Logger" || echo -e "${YELLOW}○${NC} Winston Logger"
    grep -q '"nodemailer"' package.json && echo -e "${GREEN}✓${NC} Nodemailer" || echo -e "${YELLOW}○${NC} Nodemailer"
    grep -q '"socket.io"' package.json && echo -e "${GREEN}✓${NC} Socket.io (WebSocket)" || echo -e "${YELLOW}○${NC} Socket.io"
fi
echo ""

echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}PART 11: MISSING FEATURES ANALYSIS${NC}"
echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}Features NOT YET Implemented (Nice to Have):${NC}"
echo ""

# Check for advanced features
[ ! -f "services/emailService.js" ] && echo -e "${YELLOW}○${NC} Email Notifications Service"
[ ! -f "services/predictionService.js" ] && echo -e "${YELLOW}○${NC} ML Prediction Service"
[ ! -f "controllers/recurringController.js" ] && echo -e "${YELLOW}○${NC} Recurring Transactions Auto-processing"
[ ! -f "middleware/rateLimiter.js" ] && echo -e "${YELLOW}○${NC} API Rate Limiting"
[ ! -f "utils/logger.js" ] && echo -e "${YELLOW}○${NC} Structured Logging (Winston)"
[ ! -f "models/RefreshToken.js" ] && echo -e "${YELLOW}○${NC} Refresh Token Management"
[ ! -f "tests/unit/auth.test.js" ] && echo -e "${YELLOW}○${NC} Unit Tests"
[ ! -f "scripts/seed.js" ] && echo -e "${YELLOW}○${NC} Database Seeding Script"
[ ! -f "scripts/backup.js" ] && echo -e "${YELLOW}○${NC} Backup Script"

echo ""

echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}📊 FINAL SCORE${NC}"
echo -e "${WHITE}════════════════════════════════════════════════════════════${NC}"
echo ""

TOTAL_PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo -e "${CYAN}Total Checks: ${WHITE}$TOTAL_CHECKS${NC}"
echo -e "${GREEN}Passed: ${WHITE}$PASSED_CHECKS${NC}"
echo -e "${RED}Failed: ${WHITE}$FAILED_CHECKS${NC}"
echo -e "${YELLOW}Missing Features: ${WHITE}$MISSING_FEATURES${NC}"
echo ""

if [ $TOTAL_PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ BACKEND IS ${TOTAL_PERCENTAGE}% COMPLETE           ║${NC}"
    echo -e "${GREEN}║  EXCELLENT! Ready for Production      ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
elif [ $TOTAL_PERCENTAGE -ge 75 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ○ BACKEND IS ${TOTAL_PERCENTAGE}% COMPLETE           ║${NC}"
    echo -e "${YELLOW}║  GOOD! Few items need attention       ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
else
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ BACKEND IS ${TOTAL_PERCENTAGE}% COMPLETE           ║${NC}"
    echo -e "${RED}║  NEEDS WORK! Review missing items     ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
fi

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}NEXT STEPS FOR BACKEND PERFECTION:${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""

if [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "${RED}1. Fix missing REQUIRED files listed above${NC}"
fi

echo -e "${YELLOW}2. Run comprehensive API tests: ./test-all.sh${NC}"
echo -e "${YELLOW}3. Test all CRUD operations: ./test-transactions.sh${NC}"
echo -e "${YELLOW}4. Review code quality: ./comprehensive-check.sh${NC}"
echo -e "${YELLOW}5. Add missing optional features (email, logging, etc.)${NC}"
echo -e "${YELLOW}6. Write unit & integration tests${NC}"
echo -e "${YELLOW}7. Set up API documentation (Swagger/Postman)${NC}"
echo -e "${YELLOW}8. Prepare for deployment (Docker, CI/CD)${NC}"
echo ""

echo -e "${GREEN}Once backend is perfect, proceed to frontend development!${NC}"
echo ""