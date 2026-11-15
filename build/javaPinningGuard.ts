// Lexical guard: fails the build if a blocking call sits inside a `synchronized`
// block or method under java/lib/src/main/java. JDK 21 virtual threads pin their
// carrier when blocking inside a monitor (fixed only by JDK 24 / JEP 491).
import * as fs from 'fs';
import * as path from 'path';

const LIST = process.argv.includes('--list');
const ROOT = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'java', 'lib', 'src', 'main', 'java');

// Each pattern is matched against comment/string-stripped source of the region.
const BLOCKING: Array<[string, RegExp]> = [
    ['.join()', /\.join\s*\(\s*\)/],
    ['Future.get()', /\.get\s*\(\s*\)|\.get\s*\([^()]*TimeUnit\./],
    ['Thread.sleep', /\bThread\s*\.\s*sleep\s*\(/],
    ['.send(', /\.send\s*\(/],
    ['sendAsync(...).join', /\.sendAsync\s*\([\s\S]*?\)\s*\.join\s*\(/],
    ['.take(', /\.take\s*\(/],
    ['.acquire(', /\.acquire\s*\(/],
    ['wait(', /(?<![A-Za-z0-9_$])wait\s*\(/],
];

const NON_BLOCKING_GET = /^(Atomic\w+|ThreadLocal|Optional|Supplier|\w*Reference|Map|HashMap|List|ArrayList)$/;

// `.get()` is only blocking on a Future; skip receivers declared in-file with a non-blocking type.
function isNonBlockingGet (code: string, body: string, at: number): boolean {
    const before = body.slice(0, at);
    const recv = /([A-Za-z_$][\w$]*)\s*(?:\(\s*\))?\s*$/.exec(before)?.[1];
    if (!recv) return false;
    if (recv === 'get') return true; // chained .get().get() – already covered by the first hit
    const decl = new RegExp('(\\b[A-Z][\\w$]*)\\s*(?:<[^;{]*?>)?\\s+' + recv.replace(/\$/g, '\\$') + '\\b\\s*[=;,)]');
    const m = decl.exec(code);
    return m !== null && NON_BLOCKING_GET.test(m[1]);
}

interface Violation { file: string; line: number; kind: string; owner: string }

// Blank out comments and string/char literals, preserving newlines so line numbers survive.
function strip (src: string): string {
    let out = '';
    let i = 0;
    const n = src.length;
    while (i < n) {
        const c = src[i];
        const c2 = src[i + 1];
        if (c === '/' && c2 === '/') {
            while (i < n && src[i] !== '\n') { out += ' '; i++; }
        } else if (c === '/' && c2 === '*') {
            i += 2; out += '  ';
            while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { out += src[i] === '\n' ? '\n' : ' '; i++; }
            i += 2; out += '  ';
        } else if (c === '"' && src.startsWith('"""', i)) {
            i += 3; out += '   ';
            while (i < n && !src.startsWith('"""', i)) { out += src[i] === '\n' ? '\n' : '_'; i++; }
            i += 3; out += '   ';
        } else if (c === '"' || c === '\'') {
            const q = c; i++; out += ' ';
            while (i < n && src[i] !== q) { if (src[i] === '\\') { out += '__'; i += 2; continue; } out += '_'; i++; }
            i++; out += ' ';
        } else {
            out += c; i++;
        }
    }
    return out;
}

// Returns [start, end) char offsets of every synchronized region (block body or method body).
function syncRegions (code: string): Array<[number, number, string]> {
    const regions: Array<[number, number, string]> = [];
    const re = /(?<![A-Za-z0-9_$])synchronized(?![A-Za-z0-9_$])/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
        let j = m.index + m[0].length;
        while (j < code.length && /\s/.test(code[j])) j++;
        let owner: string;
        if (code[j] === '(') {
            // synchronized (expr) { ... }
            let depth = 0;
            const exprStart = j;
            for (; j < code.length; j++) {
                if (code[j] === '(') depth++;
                else if (code[j] === ')') { depth--; if (depth === 0) { j++; break; } }
            }
            owner = 'synchronized ' + code.slice(exprStart, j).replace(/\s+/g, ' ');
        } else {
            // synchronized modifier on a method: header runs up to the first '{'
            const headerStart = j;
            while (j < code.length && code[j] !== '{' && code[j] !== ';') j++;
            if (code[j] === ';') continue; // abstract/native – no body
            owner = 'synchronized method ' + code.slice(headerStart, j).replace(/\s+/g, ' ').trim();
        }
        while (j < code.length && code[j] !== '{') j++;
        if (j >= code.length) continue;
        const bodyStart = j;
        let depth = 0;
        for (; j < code.length; j++) {
            if (code[j] === '{') depth++;
            else if (code[j] === '}') { depth--; if (depth === 0) { j++; break; } }
        }
        regions.push([bodyStart, j, owner]);
    }
    return regions;
}

function lineOf (code: string, offset: number): number {
    let line = 1;
    for (let i = 0; i < offset; i++) if (code[i] === '\n') line++;
    return line;
}

function scanFile (file: string): { violations: Violation[]; regions: number } {
    const code = strip(fs.readFileSync(file, 'utf8'));
    const violations: Violation[] = [];
    const regions = syncRegions(code);
    for (const [start, end, owner] of regions) {
        if (LIST) console.log(`${path.relative(process.cwd(), file)}:${lineOf(code, start)}-${lineOf(code, end)}  ${owner}`);
        const body = code.slice(start, end);
        for (const [kind, re] of BLOCKING) {
            const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
            let m: RegExpExecArray | null;
            while ((m = g.exec(body)) !== null) {
                if (kind === 'Future.get()' && isNonBlockingGet(code, body, m.index)) continue;
                violations.push({ file, line: lineOf(code, start + m.index), kind, owner });
            }
        }
    }
    return { violations, regions: regions.length };
}

function walk (dir: string, out: string[] = []): string[] {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith('.java')) out.push(p);
    }
    return out;
}

const files = walk(ROOT);
let total = 0;
let regionCount = 0;
const all: Violation[] = [];
for (const f of files) {
    const { violations, regions } = scanFile(f);
    regionCount += regions;
    all.push(...violations);
}
total = all.length;
const rel = (f: string) => path.relative(process.cwd(), f);
if (total > 0) {
    console.error(`javaPinningGuard: ${total} blocking call(s) inside synchronized regions (virtual-thread pinning risk):`);
    for (const v of all) {
        console.error(`  ${rel(v.file)}:${v.line}  ${v.kind}  in ${v.owner}`);
    }
    process.exit(1);
}
console.log(`javaPinningGuard: OK — ${files.length} files, ${regionCount} synchronized regions, 0 blocking calls inside them`);
