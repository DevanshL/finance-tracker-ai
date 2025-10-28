const fs = require('fs');
const path = require('path');

console.log('\n==================================');
console.log('PROJECT DIRECTORY STRUCTURE');
console.log('==================================\n');

const currentDir = process.cwd();
console.log(`📁 Current Directory: ${currentDir}\n`);

function getTree(dir, prefix = '', isLast = true, maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth) return;
    
    try {
        const items = fs.readdirSync(dir);
        
        // Filter out common ignored items
        const filtered = items.filter(item => 
            !item.startsWith('.') && 
            item !== 'node_modules' && 
            item !== 'dist' && 
            item !== 'build' &&
            item !== 'coverage'
        );
        
        filtered.forEach((item, index) => {
            const fullPath = path.join(dir, item);
            const isLastItem = index === filtered.length - 1;
            const stats = fs.statSync(fullPath);
            
            const connector = isLastItem ? '└── ' : '├── ';
            const icon = stats.isDirectory() ? '📁' : '📄';
            
            console.log(prefix + connector + icon + ' ' + item);
            
            if (stats.isDirectory()) {
                const newPrefix = prefix + (isLastItem ? '    ' : '│   ');
                getTree(fullPath, newPrefix, isLastItem, maxDepth, currentDepth + 1);
            }
        });
    } catch (error) {
        // Silent fail for permission errors
    }
}

// Check if backend and frontend exist
const hasBackend = fs.existsSync(path.join(currentDir, 'backend'));
const hasFrontend = fs.existsSync(path.join(currentDir, 'frontend'));

if (!hasBackend && !hasFrontend) {
    console.log('⚠️  No backend or frontend directories found!');
    console.log('Current directory contents:\n');
    getTree(currentDir, '', true, 2, 0);
} else {
    if (hasBackend) {
        console.log('🔷 BACKEND:');
        console.log('📁 backend');
        getTree(path.join(currentDir, 'backend'), '', true, 3, 0);
        console.log('\n');
    }
    
    if (hasFrontend) {
        console.log('🔶 FRONTEND:');
        console.log('📁 frontend');
        getTree(path.join(currentDir, 'frontend'), '', true, 3, 0);
        console.log('\n');
    }
}

console.log('==================================');
console.log('✨ Structure display complete!\n');
console.log('💡 TIP: Copy and paste this entire output');
console.log('   and share it with me so I can see');
console.log('   exactly what files you have.\n');
console.log('==================================\n');