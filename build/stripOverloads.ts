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
// In every AST-transpiled language (C#, Go, Java) rsa/jwt are synchronous, so we
// strip the `async` keyword from these method declarations and the `await` from
// their call-sites (including the internal rsa/jwt calls) BEFORE handing the source
// to the ast-transpiler, so they transpile to plain synchronous methods.
// This is the single source of truth: imported by the C#/Go/Java transpilers,
// their Piscina workers, and generateJavaWrappers.
function stripSignAsyncForAst (tsContent: string): string {
    return tsContent
        // free-function declarations in base/functions/rsa.ts: drop `async` AND unwrap the
        // `: Promise<string>` return type so the type checker sees rsa/jwt returning string.
        .replace (/\basync function (rsa|jwt) (\([^)]*\)): Promise<([^>]+)>/g, 'function $1 $2: $3')
        // method declarations: `async sign (` -> `sign (` (also createAuthToken/createWSAuth/signParams)
        .replace (/\basync (sign|createAuthToken|createWSAuth|signParams) \(/g, '$1 (')
        // awaited call-sites of those methods: `await this.sign (` -> `this.sign (`
        .replace (/\bawait (this\.(?:sign|createAuthToken|createWSAuth|signParams)\s*\()/g, '$1')
        // awaited rsa/jwt (imported free functions or this.rsa/this.jwt)
        .replace (/\bawait ((?:this\.)?(?:rsa|jwt)\s*\()/g, '$1');
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

export {
    stripSignAsyncForAst,
    writeOverloadStrippedFile,
    removeOverloadStrippedFile,
};
