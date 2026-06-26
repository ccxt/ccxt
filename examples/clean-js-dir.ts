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


const extensions = ['.js', '.d.ts', '.d.ts.map'];
if (fs.existsSync(dirToClean)) {
    const files = fs.readdirSync(dirToClean);
    
    for (const file of files) {
        if (extensions.some(ext => file.endsWith(ext))) {
            fs.unlinkSync(path.join(dirToClean, file));
        }
    }
}
