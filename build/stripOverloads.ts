import fs from 'fs';
import path from 'path';

// TypeScript method overload signatures (body-less declarations ending with ';')
// are used in ts/src/base/Exchange.ts to give precise return types (e.g. safeDict /
// safeList return a non-undefined type when a default value is supplied). The
// ast-transpiler (C#/Go/Java) cannot parse these body-less declarations, so we strip
// them before feeding the file to the AST transpiler. They carry no runtime code -
// the implementation signature (with default params) below them handles every case.
// The optional `(?:<[^>()]*>)?` group also matches generic overloads such as
// `handleOptionAndParams <T>(params: object, ...): [T, Dict];` - if those leak
// through, the transpiler crashes in printFunctionBody with
// "Cannot read properties of undefined (reading 'statements')" because the
// declaration has no body.
const overloadLineRegex = /^\s*(?:async\s+)?[a-zA-Z0-9_$]+\s*(?:<[^>()]*>)?\s*\([^{]*\)\s*:\s*[^{};]+;\s*$/;

// Definite-assignment property declarations (`apiKey!: string;`) also crash the
// ast-transpiler: it does not understand the exclamationToken on a
// PropertyDeclaration. The `!` is a compile-time-only strictPropertyInitialization
// escape hatch with zero runtime semantics, so dropping it from the transpiler
// input copy is safe. Matches only `<indent><identifier>!:` at the start of a
// line, so non-null assertions in expressions (`foo!.bar`) are never touched.
const definiteAssignmentPropRegex = /^(\s*(?:(?:public|protected|private|readonly|declare|abstract|static)\s+)*[A-Za-z_$][A-Za-z0-9_$]*)!(\s*:)/;

// Writes a copy of `srcPath` with overload signature lines removed and
// definite-assignment `!` markers dropped, into the SAME directory (so relative
// imports keep resolving), and returns the temp file path.
// The caller is responsible for deleting it (see removeOverloadStrippedFile).
function writeOverloadStrippedFile (srcPath: string): string {
    const content = fs.readFileSync (srcPath, 'utf8');
    const filtered = content.split ('\n')
        .filter ((line) => !overloadLineRegex.test (line))
        .map ((line) => line.replace (definiteAssignmentPropRegex, '$1$2'))
        .join ('\n');
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
    writeOverloadStrippedFile,
    removeOverloadStrippedFile,
};
