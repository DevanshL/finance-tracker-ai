# Local Environment Setup Guide

## ✅ Completed Setup

### Global Requirements (Minimal)
- ✅ Node.js 18+ installed
- ✅ npm installed
- ✅ VS Code installed

### Local Project Dependencies
All dependencies are installed locally in `node_modules/` folders:

**Backend Dependencies:**
- express, mongoose, dotenv, cors, helmet
- express-rate-limit, morgan, bcryptjs, jsonwebtoken
- express-validator, @google/generative-ai

**Frontend Dependencies:**
- react, react-dom, react-router-dom
- axios, react-hot-toast, lucide-react
- recharts, date-fns, react-hook-form, zod
- tailwindcss, postcss, autoprefixer

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
Server will run on: http://localhost:5000

### Start Frontend Server
```bash
cd frontend
npm run dev
```
Server will run on: http://localhost:5173

## 📁 Project Structure
```
finance-tracker-ai/
├── backend/
│   ├── node_modules/      # All backend dependencies (local)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── node_modules/      # All frontend dependencies (local)
│   ├── src/
│   ├── public/
│   ├── .env
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)
- NODE_ENV=development
- PORT=5000
- MONGODB_URI=[To be added]
- JWT_SECRET=[To be generated]
- GEMINI_API_KEY=[To be added]
- FRONTEND_URL=http://localhost:5173

### Frontend (.env)
- VITE_API_URL=http://localhost:5000/api

## ⚙️ Next Steps

1. **MongoDB Atlas Setup:**
   - Create account at https://cloud.mongodb.com
   - Create free cluster (M0)
   - Get connection string
   - Update backend/.env MONGODB_URI

2. **Gemini API Setup:**
   - Get API key from https://makersuite.google.com/app/apikey
   - Update backend/.env GEMINI_API_KEY

3. **Generate JWT Secret:**
```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
   - Copy output and update backend/.env JWT_SECRET

## 🧪 Testing

### Test Backend
```bash
# Test API
curl http://localhost:5000/api

# Test health
curl http://localhost:5000/health

# Test dependencies
curl http://localhost:5000/api/test
```

### Test Frontend
Open browser: http://localhost:5173

## 📦 Package Management

### Add New Backend Package
```bash
cd backend
npm install package-name
```

### Add New Frontend Package
```bash
cd frontend
npm install package-name
```

### Remove Package
```bash
npm uninstall package-name
```

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Clear Node Modules
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Check Node Version
```bash
node --version  # Should be v18.x.x or higher
npm --version   # Should be 9.x.x or higher
```

## ✨ All dependencies are LOCAL to this project!
No global pollution, everything is contained in the project folders.
