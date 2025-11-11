// ----------------------------------------------------------------------------
// Copy TypeScript type definitions to dist/cjs for IntelliSense support
// ----------------------------------------------------------------------------

import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';

function copyTypesRecursive(srcDir, destDir) {
    const entries = readdirSync(srcDir);
    
    for (const entry of entries) {
        const srcPath = join(srcDir, entry);
        const destPath = join(destDir, entry);
        const stat = statSync(srcPath);
        
        if (stat.isDirectory()) {
            mkdirSync(destPath, { recursive: true });
            copyTypesRecursive(srcPath, destPath);
        } else if (entry.endsWith('.d.ts')) {
            mkdirSync(dirname(destPath), { recursive: true });
            copyFileSync(srcPath, destPath);
        }
    }
}

// Copy main type definition file to dist root (for require() compatibility)
if (!existsSync('./js/ccxt.d.ts')) {
    console.error('Error: ./js/ccxt.d.ts not found. Make sure types are generated first.');
    process.exit(1);
}

copyFileSync('./js/ccxt.d.ts', './dist/ccxt.d.ts');

// Also copy to dist/cjs for consistency
copyFileSync('./js/ccxt.d.ts', './dist/cjs/ccxt.d.ts');

// Copy all .d.ts files from js/src to dist/cjs/src
copyTypesRecursive('./js/src', './dist/cjs/src');

console.log('TypeScript type definitions copied to dist/cjs for IntelliSense support');

