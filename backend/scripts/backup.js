// Database backup script
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const MONGODB_URI = process.env.MONGODB_URI;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

console.log('Starting database backup...');
console.log('Backup location:', backupPath);

// Execute mongodump command
const command = `mongodump --uri="${MONGODB_URI}" --out="${backupPath}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
  
  if (stderr) {
    console.error('Backup warnings:', stderr);
  }
  
  console.log('Backup completed successfully!');
  console.log('Backup saved to:', backupPath);
  
  // Clean old backups (keep last 7 days)
  cleanOldBackups();
});

function cleanOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR);
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  
  files.forEach(file => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    
    if (now - stats.mtimeMs > sevenDays) {
      console.log('Removing old backup:', file);
      fs.rmSync(filePath, { recursive: true, force: true });
    }
  });
}
