import fs from 'fs';
import path from 'path';

// TypeScript method overload signatures (body-less declarations ending with ';')
// are used in ts/src/base/Exchange.ts to give precise return types (e.g. safeDict /
// safeList return a non-undefined type when a default value is supplied). The
// ast-transpiler (C#/Go/Java) cannot parse these body-less declarations, so we strip
// them before feeding the file to the AST transpiler. They carry no runtime code -
// the implementation signature (with default params) below them handles every case.
const overloadLineRegex = /^\s*(?:async\s+)?[a-zA-Z0-9_$]+\s*\([^{]*\)\s*:\s*[^{};]+;\s*$/;

// `sign` (and its crypto helpers createAuthToken / createWSAuth / signParams) are
// async ONLY in TypeScript/JavaScript, because crypto.subtle (used by rsa) is async.
// In every transpiled language rsa/jwt are synchronous, so these methods/functions stay
// synchronous there. This is the single source of truth for that list — used both by the
// AST strip below and (imported) by the Python/PHP regex transpiler in build/transpile.ts.
const SIGN_SYNC_METHODS = [ 'sign', 'createAuthToken', 'createWSAuth', 'signParams' ]; // class methods
const SIGN_SYNC_FUNCTIONS = [ 'rsa', 'jwt' ]; // base/functions/rsa.ts free functions
const methodsAlt = SIGN_SYNC_METHODS.join ('|');
const funcsAlt = SIGN_SYNC_FUNCTIONS.join ('|');

// Strip the `async`/`await` for the above methods/functions before handing the source to
// the ast-transpiler (C#, Go, Java), so they transpile to plain synchronous code.
function stripSignAsyncForAst (tsContent: string): string {
    return tsContent
        // free-function declarations in base/functions/rsa.ts: drop `async` AND unwrap the
        // `: Promise<string>` return type so the type checker sees rsa/jwt returning string.
        .replace (new RegExp ('\\basync function (' + funcsAlt + ') (\\([^)]*\\)): Promise<([^>]+)>', 'g'), 'function $1 $2: $3')
        // method declarations: `async sign (` -> `sign (` (also createAuthToken/createWSAuth/signParams)
        .replace (new RegExp ('\\basync (' + methodsAlt + ') \\(', 'g'), '$1 (')
        // awaited call-sites of those methods: `await this.sign (` -> `this.sign (`
        .replace (new RegExp ('\\bawait (this\\.(?:' + methodsAlt + ')\\s*\\()', 'g'), '$1')
        // awaited rsa/jwt (imported free functions or this.rsa/this.jwt)
        .replace (new RegExp ('\\bawait ((?:this\\.)?(?:' + funcsAlt + ')\\s*\\()', 'g'), '$1');
}

// Writes a copy of `srcPath` with overload signature lines removed, into the SAME
// directory (so relative imports keep resolving), and returns the temp file path.
// The caller is responsible for deleting it (see removeOverloadStrippedFile).
function writeOverloadStrippedFile (srcPath: string): string {
    const content = fs.readFileSync (srcPath, 'utf8');
    const noOverloads = content.split ('\n').filter ((line) => !overloadLineRegex.test (line)).join ('\n');
    const filtered = stripSignAsyncForAst (noOverloads);
    if (filtered === content) {
        return srcPath; // nothing to strip, transpile the original file directly
    }
    const dir = path.dirname (srcPath);
    const ext = path.extname (srcPath);
    const base = path.basename (srcPath, ext);
    const tmpPath = path.join (dir, base + '.nooverloads' + ext);
    fs.writeFileSync (tmpPath, filtered);
    return tmpPath;
}

function removeOverloadStrippedFile (tmpPath: string, srcPath: string): void {
    if (tmpPath !== srcPath && fs.existsSync (tmpPath)) {
        fs.unlinkSync (tmpPath);
    }
}

// Transpile `filePath` with `sign` (and its crypto helpers) made synchronous, WITHOUT
// creating a separate temp file. byPath mode is required so the file's real location is
// used and relative imports (extends Exchange, ./base/functions/rsa.js) still resolve for
// type inference — in-memory transpilation loses that (e.g. drops `override`). So the
// original content is held in memory, the stripped content is written in place for the
// duration of the transpile, then the original is restored.
function transpileSignSyncByPath (transpileByPath: (p: string) => any, filePath: string): any {
    const original = fs.readFileSync (filePath, 'utf8');
    const stripped = stripSignAsyncForAst (original);
    if (stripped === original) {
        return transpileByPath (filePath); // nothing to strip
    }
    fs.writeFileSync (filePath, stripped);
    try {
        return transpileByPath (filePath);
    } finally {
        fs.writeFileSync (filePath, original);
    }
}

// Monkey-patch an ast-transpiler's byPath method (e.g. 'transpileGoByPath') so every
// file it transpiles has `sign` made synchronous first (see transpileSignSyncByPath).
// Shared by the C#/Go/Java transpilers (in setupTranspiler) and their Piscina workers.
function patchTranspileByPathWithSyncSign (transpiler: any, byPathMethod: string): void {
    const original = transpiler[byPathMethod].bind (transpiler);
    transpiler[byPathMethod] = (filePath: string) => transpileSignSyncByPath (original, filePath);
}

// Base files whose sign-async-ness the AST transpiler resolves (via `extends Exchange`
// and the rsa/jwt imports) when inferring an exchange override's return type / async-ness.
// They must be sign-synchronous ON DISK while exchanges + wrappers transpile.
const SIGN_SYNC_BASE_FILES = [ './ts/src/base/Exchange.ts', './ts/src/base/functions/rsa.ts' ];

// Runs `fn` with SIGN_SYNC_BASE_FILES made sign-synchronous on disk (originals held in
// memory, restored afterwards). Used by the C#/Java transpiler entrypoints: the top-level
// process strips them before forking workers and restores them once everything finishes;
// child processes pass `inherit = true` (they reuse the parent's already-stripped files).
async function withSyncSignBaseFiles (inherit: boolean, fn: () => Promise<void> | void): Promise<void> {
    if (inherit) {
        await fn ();
        return;
    }
    const backups: { [path: string]: string } = {};
    for (const f of SIGN_SYNC_BASE_FILES) {
        backups[f] = fs.readFileSync (f, 'utf8');
        fs.writeFileSync (f, stripSignAsyncForAst (backups[f]));
    }
    try {
        await fn ();
    } finally {
        for (const f of Object.keys (backups)) {
            fs.writeFileSync (f, backups[f]);
        }
    }
}

export {
    SIGN_SYNC_METHODS,
    SIGN_SYNC_FUNCTIONS,
    stripSignAsyncForAst,
    patchTranspileByPathWithSyncSign,
    withSyncSignBaseFiles,
    writeOverloadStrippedFile,
    removeOverloadStrippedFile,
};
