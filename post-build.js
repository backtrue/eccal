#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Copy built files from dist/public to server/public for production serving
async function copyBuildFiles() {
  const sourceDir = path.join(__dirname, 'dist', 'public');
  const targetDir = path.join(__dirname, 'server', 'public');

  try {
    // Remove existing target directory
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true });
    }

    // Create target directory
    fs.mkdirSync(targetDir, { recursive: true });

    // Copy files if source exists
    if (fs.existsSync(sourceDir)) {
      await copyDirectory(sourceDir, targetDir);
      console.log('✅ Build files copied to server/public');
    } else {
      console.log('⚠️  Source directory dist/public not found');
    }
  } catch (error) {
    console.error('❌ Error copying build files:', error);
    process.exit(1);
  }
}

async function copyDirectory(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      await copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyBuildFiles();