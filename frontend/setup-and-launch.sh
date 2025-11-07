#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║          🚀 FINANCE TRACKER - FRONTEND LAUNCHER 🚀           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the right directory
if [ -f "package.json" ] && [ -d "src" ]; then
    echo -e "${GREEN}✅ Found frontend directory${NC}"
elif [ -d "frontend" ]; then
    echo -e "${CYAN}📂 Navigating to frontend directory...${NC}"
    cd frontend
else
    echo -e "${RED}❌ Error: Cannot find frontend files${NC}"
    echo -e "${YELLOW}Please run from either:${NC}"
    echo -e "  - Project root directory, OR"
    echo -e "  - Frontend directory"
    exit 1
fi

echo -e "${CYAN}📂 Working directory: $(pwd)${NC}"
echo ""

# Quick file check
echo -e "${YELLOW}🔍 Quick Check:${NC}"
[ -f "package.json" ] && echo -e "${GREEN}✅ package.json${NC}" || echo -e "${RED}❌ package.json${NC}"
[ -f "src/main.jsx" ] && echo -e "${GREEN}✅ src/main.jsx${NC}" || echo -e "${RED}❌ src/main.jsx${NC}"
[ -f "src/App.jsx" ] && echo -e "${GREEN}✅ src/App.jsx${NC}" || echo -e "${RED}❌ src/App.jsx${NC}"
[ -d "src/pages" ] && echo -e "${GREEN}✅ src/pages${NC}" || echo -e "${RED}❌ src/pages${NC}"
[ -d "src/components" ] && echo -e "${GREEN}✅ src/components${NC}" || echo -e "${RED}❌ src/components${NC}"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Dependencies not found. Installing...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
    echo ""
fi

# Check backend
echo -e "${YELLOW}🔌 Checking backend...${NC}"
if curl -s http://localhost:5000/api/health > /dev/null 2>&1 || curl -s http://localhost:5000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running at http://localhost:5000${NC}"
else
    echo -e "${RED}❌ Backend is not running${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Frontend needs backend to work!${NC}"
    echo ""
    echo -e "${CYAN}To start backend, open a new terminal and run:${NC}"
    echo -e "  ${GREEN}cd backend${NC}"
    echo -e "  ${GREEN}npm install${NC}"
    echo -e "  ${GREEN}npm start${NC}"
    echo ""
    read -p "Continue without backend? (y/n): " continue_choice
    if [ "$continue_choice" != "y" ]; then
        echo -e "${YELLOW}Exiting... Please start backend first${NC}"
        exit 0
    fi
fi

echo ""
echo -e "${GREEN}✅ Ready to launch!${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🌐 Frontend:${NC} http://localhost:5173"
echo -e "${GREEN}🔧 Backend:${NC}  http://localhost:5000"
echo ""
echo -e "${YELLOW}📌 What to expect:${NC}"
echo -e "   1. Browser opens automatically"
echo -e "   2. You should see the Login page"
echo -e "   3. If blank, press F12 to check console for errors"
echo ""
echo -e "${YELLOW}📌 First time using the app?${NC}"
echo -e "   1. Click 'Register' to create an account"
echo -e "   2. Fill in your details"
echo -e "   3. Login and start tracking!"
echo ""
echo -e "${YELLOW}🛑 To stop: Press ${RED}Ctrl+C${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

sleep 2
npm run dev