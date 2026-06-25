import fs from 'node:fs';
import { execSync } from 'child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'url';

// js specific codes //
const __dirname = path.dirname (fileURLToPath (import.meta.url)) + path.sep;
const dirToClean = path.join(__dirname, 'js');

// 1. Clean the directory
if (fs.existsSync(dirToClean)) {
    console.log(`Cleaning ${dirToClean}...`);
    fs.rmSync(dirToClean, { recursive: true, force: true });
}

// 2. Run the TSC command
try {
    console.log('Compiling TypeScript...');
    execSync('tsc -p ./examples/tsconfig.json', { stdio: 'inherit' });
    console.log('Build completed successfully.');
} catch (error) {
    console.error('Build failed.');
    process.exit(1);
}