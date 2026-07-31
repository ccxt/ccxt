import fs from 'fs';
import path from 'path';

// TypeScript method overload signatures (body-less declarations ending with ';')
// are used in ts/src/base/Exchange.ts to give precise return types (e.g. safeDict /
// safeList return a non-undefined type when a default value is supplied). The
// ast-transpiler (C#/Go/Java) cannot parse these body-less declarations, so we strip
// them before feeding the file to the AST transpiler. They carry no runtime code -
// the implementation signature (with default params) below them handles every case.
const overloadLineRegex = /^\s*(?:async\s+)?[a-zA-Z0-9_$]+\s*\([^{]*\)\s*:\s*[^{};]+;\s*$/;

// Writes a copy of `srcPath` with overload signature lines removed, into the SAME
// directory (so relative imports keep resolving), and returns the temp file path.
// The caller is responsible for deleting it (see removeOverloadStrippedFile).
function writeOverloadStrippedFile (srcPath: string): string {
    const content = fs.readFileSync (srcPath, 'utf8');
    const filtered = content.split ('\n').filter ((line) => !overloadLineRegex.test (line)).join ('\n');
    if (filtered === content) {
        return srcPath; // nothing to strip, transpile the original file directly
    }
    const dir = path.dirname (srcPath);
    const ext = path.extname (srcPath);
    const base = path.basename (srcPath, ext);
    // the transpilers fan out into parallel worker processes that each strip the same
    // base file - the temp name must be per-process, or the workers create/delete each
    // other's copy (ENOENT on unlink, or a worker parsing a half-deleted file)
    const tmpPath = path.join (dir, base + '.nooverloads.' + process.pid.toString () + ext);
    fs.writeFileSync (tmpPath, filtered);
    return tmpPath;
}

function removeOverloadStrippedFile (tmpPath: string, srcPath: string): void {
    if (tmpPath !== srcPath) {
        try {
            fs.unlinkSync (tmpPath);
        } catch (e) {
            // already removed - nothing to clean up
        }
    }
}

export {
    writeOverloadStrippedFile,
    removeOverloadStrippedFile,
};
