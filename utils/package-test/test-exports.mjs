// Validates that all file paths referenced in ccxt's package.json "exports"
// map actually exist in the installed package.
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ccxtDir = resolve(__dirname, 'node_modules', 'ccxt');
const pkg = JSON.parse(readFileSync(resolve(ccxtDir, 'package.json'), 'utf8'));

let failed = false;

function checkPaths(obj, prefix) {
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            const fullPath = resolve(ccxtDir, value);
            if (!existsSync(fullPath)) {
                console.error(`[Exports] MISSING: ${prefix}.${key} -> ${value}`);
                failed = true;
            } else {
                console.log(`[Exports] OK: ${prefix}.${key} -> ${value}`);
            }
        } else if (typeof value === 'object') {
            checkPaths(value, `${prefix}.${key}`);
        }
    }
}

checkPaths(pkg.exports, 'exports');

if (failed) {
    process.exit(1);
}
console.log('[Exports] All paths valid');
