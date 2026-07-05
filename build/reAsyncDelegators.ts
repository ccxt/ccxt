import fs from 'fs';
import path from 'path';

// PR #29111 / pro-sync-delegators: pure WS delegator methods in ts/src/pro/*.ts are
// declared WITHOUT `async` (returning the inner Promise directly) to avoid the cost of
// an extra async wrapper + await hop per call in JS/Python(async)/PHP(async).
// The AST transpilers (C#/Java/Go) cannot represent a non-async method that returns a
// Promise: C# emits Task-typed methods without async/await (CS0029/CS4032/CS1061),
// Java/Go break override/interface signatures entirely.
// So, for the static languages ONLY, we restore the `async`/`return await` form before
// feeding the file to the AST transpiler. The generated C#/Java/Go output is then
// byte-identical to the classic async form, while JS/PHP/Python keep the fast path.
//
// Matches a single-line method signature like:
//     watchTicker (symbol: string, params = {}): Promise<Ticker> {
// (an `async` method cannot match: `async` would be captured as the method name and the
// next character would be a space, not an opening parenthesis)
const nonAsyncPromiseMethodRegex = /^(\s+)([a-zA-Z_$][\w$]*)(\s*\([^)]*\)\s*):\s*(Promise<[^;{]*>)\s*\{\s*$/;

function reAsyncContent (content: string): string | undefined {
    const lines = content.split ('\n');
    let changed = false;
    let methodIndent: string | undefined = undefined; // inside a re-asynced method when set
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (methodIndent === undefined) {
            const match = line.match (nonAsyncPromiseMethodRegex);
            if (match) {
                const [ , indent, name, args ] = match;
                lines[i] = line.replace (indent + name + args, indent + 'async ' + name + args);
                methodIndent = indent;
                changed = true;
            }
        } else {
            if (line === methodIndent + '}') {
                methodIndent = undefined; // method body ended
            } else {
                // all `return this.x (...)` statements inside such methods return Promises
                // (otherwise the method could not have been declared non-async), so
                // restoring `await` is always type-correct for the static languages
                lines[i] = line.replace (/^(\s*)return this\./, '$1return await this.');
            }
        }
    }
    return changed ? lines.join ('\n') : undefined;
}

// Writes a copy of `srcPath` with non-async Promise-returning delegators converted back
// to the async/await form, into the SAME directory (so relative imports keep resolving),
// and returns the temp file path. Returns `srcPath` unchanged when there is nothing to
// convert. The caller must delete the copy via removeReAsyncedTranspileCopy.
function writeReAsyncedTranspileCopy (srcPath: string): string {
    const content = fs.readFileSync (srcPath, 'utf8');
    const reAsynced = reAsyncContent (content);
    if (reAsynced === undefined) {
        return srcPath; // nothing to convert, transpile the original file directly
    }
    const dir = path.dirname (srcPath);
    const ext = path.extname (srcPath);
    const base = path.basename (srcPath, ext);
    const tmpPath = path.join (dir, base + '.reasynced' + ext);
    fs.writeFileSync (tmpPath, reAsynced);
    return tmpPath;
}

function removeReAsyncedTranspileCopy (tmpPath: string, srcPath: string): void {
    if (tmpPath !== srcPath && fs.existsSync (tmpPath)) {
        fs.unlinkSync (tmpPath);
    }
}

export {
    reAsyncContent,
    writeReAsyncedTranspileCopy,
    removeReAsyncedTranspileCopy,
};
