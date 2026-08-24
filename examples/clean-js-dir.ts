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
    // clean the flat files plus the per-topic OUTPUT subfolders — only those mirroring
    // a source folder under examples/ts (e.g. prediction/); other subdirs under
    // examples/js are hand-maintained standalone projects and must not be touched
    const tsSourceDir = path.join(__dirname, 'ts');
    const entries = fs.readdirSync(dirToClean, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const tsSubdir = path.join(tsSourceDir, entry.name);
            if (!fs.existsSync(tsSubdir)) {
                continue;
            }
            // mirror-based: only delete outputs whose .ts source exists, so hand-written
            // files living next to them (configs, helpers) are never touched
            const subdir = path.join(dirToClean, entry.name);
            for (const file of fs.readdirSync(subdir)) {
                const ext = extensions.find(e => file.endsWith(e));
                if (ext === undefined) {
                    continue;
                }
                const baseName = file.slice(0, file.length - ext.length);
                if (fs.existsSync(path.join(tsSubdir, baseName + '.ts'))) {
                    fs.unlinkSync(path.join(subdir, file));
                }
            }
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
            fs.unlinkSync(path.join(dirToClean, entry.name));
        }
    }
}
