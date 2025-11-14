# Deployment Guide

## Prerequisites
- Node.js 14+ installed
- MongoDB Atlas account or MongoDB instance
- Gemini API key (for AI features)
- Domain name (optional)

## Environment Variables

Create a `.env` file with:

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-tracker

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Finance Tracker <noreply@financetracker.com>

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-domain.com
```

## Deployment Options

### 1. Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create finance-tracker-api

# Add MongoDB addon (or use MongoDB Atlas)
heroku addons:create mongolab

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set GEMINI_API_KEY=your_key

# Deploy
git push heroku main

# Open app
heroku open
```

### 2. Railway

1. Connect GitHub repository
2. Add environment variables in dashboard
3. Deploy automatically on push

### 3. DigitalOcean App Platform

1. Connect GitHub repository
2. Configure environment variables
3. Deploy

### 4. AWS EC2

```bash
# SSH into server
ssh ubuntu@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone your-repo-url
cd finance-tracker/backend

# Install dependencies
npm install --production

# Start with PM2
pm2 start server.js --name finance-api
pm2 save
pm2 startup
```

### 5. Docker

```bash
# Build image
docker build -t finance-tracker-api .

# Run container
docker run -p 5000:5000 --env-file .env finance-tracker-api

# Or use docker-compose
docker-compose up -d
```

## Post-Deployment

1. **Test API**: Use provided test scripts
2. **Monitor**: Set up logging and monitoring
3. **Backups**: Schedule regular database backups
4. **SSL**: Enable HTTPS with Let's Encrypt
5. **CDN**: Configure CDN for static assets (if any)

## Monitoring

```bash
# View PM2 logs
pm2 logs

# Monitor process
pm2 monit

# Restart
pm2 restart finance-api
```

## Backup

```bash
# Run backup script
npm run backup

# Or set up cron job
crontab -e
# Add: 0 2 * * * cd /path/to/app && npm run backup
```
