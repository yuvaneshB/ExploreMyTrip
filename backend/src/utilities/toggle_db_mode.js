import fs from 'fs';
import path from 'path';

const mode = process.argv[2]; // 'mock' or 'real'

if (mode !== 'mock' && mode !== 'real') {
  console.error('Usage: node toggle_db_mode.js [mock|real]');
  process.exit(1);
}

const directories = [
  './src/models',
  './src/config',
  './src/utilities'
];

const mockSourcePath = path.resolve('./src/config/mongooseMock.js');

const updateImports = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      updateImports(fullPath);
      return;
    }
    
    if (file.endsWith('.js')) {
      // Don't replace inside mongooseMock or toggle_db_mode themselves
      if (file === 'mongooseMock.js' || file === 'toggle_db_mode.js') return;

      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Calculate relative path from this file to the mock source
      const dirOfFile = path.dirname(fullPath);
      let relativePath = path.relative(dirOfFile, mockSourcePath).replace(/\\/g, '/');
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }
      
      if (mode === 'mock') {
        // Replace real mongoose with mock mongoose
        content = content.replace(/from\s+['"]mongoose['"]/g, `from '${relativePath}'`);
        content = content.replace(/import\s+mongoose\s+from\s+['"]mongoose['"]/g, `import mongoose from '${relativePath}'`);
      } else {
        // Restore real mongoose
        content = content.replace(/from\s+['\"].*mongooseMock\.js['\"]/g, "from 'mongoose'");
      }
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated ${file} to use ${mode} database.`);
    }
  });
};

// First restore all imports to a clean state to reset pathing
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    // Run 'real' first to clean up old incorrect paths
    const files = fs.readdirSync(dir);
    files.forEach(f => {
      if (f === 'toggle_db_mode.js' || f === 'mongooseMock.js') return;
      const pth = path.join(dir, f);
      if (fs.statSync(pth).isFile() && f.endsWith('.js')) {
        let content = fs.readFileSync(pth, 'utf8');
        content = content.replace(/from\s+['\"].*mongooseMock\.js['\"]/g, "from 'mongoose'");
        fs.writeFileSync(pth, content, 'utf8');
      }
    });
  }
});

// Now apply target mode
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    updateImports(dir);
  }
});

console.log(`Successfully toggled MERN codebase to use: ${mode.toUpperCase()} DATABASE.`);
