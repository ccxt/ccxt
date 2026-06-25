import fs from 'node:fs';
import { execSync } from 'child_process';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url)) + path.sep;
const dirToClean = path.join(__dirname, 'js');

if (!dirToClean.endsWith('examples' + path.sep + 'js')) {
    console.error('Error: The directory to clean is not the expected "examples/js" directory.');
    process.exit(1);
}

// 1. Clean only .js files in the directory
if (fs.existsSync(dirToClean)) {
    console.log(`Cleaning .js files in ${dirToClean}...`);
    
    const files = fs.readdirSync(dirToClean);
    
    for (const file of files) {
        if ( file.endsWith ('.js') || file.endsWith ('.d.ts') || file.endsWith ('.d.ts.map') ) {
            fs.unlinkSync(path.join(dirToClean, file));
        }
    }
    console.log('Cleanup complete.');
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