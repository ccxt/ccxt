// Call-site census for candidate generated method parameters (JN-15).
// Reads the census rows (build/java-param-census.mjs --json) and scans the WHOLE
// generated java tree (lib + tests + cli + examples — the gradle compileJava gate
// compiles all four subprojects) for calls to a candidate method, classifying the
// argument at the narrowed position:
//   - a string literal or a `(String)` checkcast is provably a String box;
//   - a bare identifier is resolved in the SAME FILE: it is a String argument when
//     every declaration of that name in the file is `String` (a local declaration or
//     a method parameter), and unsafe when any declaration is another type or none is
//     found;
//   - a wrapper `super.<name>(...)` call is resolved against the enclosing wrapper
//     method's own parameter list (the wrappers declare typed params from the TS
//     signature);
//   - anything else (a call, a property access, a numeric literal, ...) is unsafe.
//
// usage: node build/java-param-sites.mjs [root] [--json]

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const root = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'java';
const census = JSON.parse(execFileSync('node', ['build/java-param-census.mjs', 'ts/src', '--json'], { maxBuffer: 1 << 28 }).toString());
const rows = census.safe;

function javaFiles(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) javaFiles(p, out); else if (e.name.endsWith('.java')) out.push(p);
    }
    return out;
}
const files = javaFiles(root);
const contents = new Map(files.map((f) => [f, fs.readFileSync(f, 'utf8')]));

// split "a, b, (c, d), e" respecting nesting + string literals
function splitArgs(text) {
    const args = []; let depth = 0; let cur = ''; let inStr = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inStr) { cur += ch; if (ch === '"' && text[i - 1] !== '\\') inStr = false; continue; }
        if (ch === '"') { inStr = true; cur += ch; continue; }
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        if (ch === ')' || ch === ']' || ch === '}') depth--;
        if (ch === ',' && depth === 0) { args.push(cur.trim()); cur = ''; continue; }
        cur += ch;
    }
    if (cur.trim() !== '') args.push(cur.trim());
    return args;
}

function argLooksStringLiteral(text) {
    const t = text.trim();
    return /^"(?:[^"\\]|\\.)*"$/.test(t) || t.startsWith('(String)') || t.startsWith('((String)');
}

// every declared type of `name` in one file: local declarations and method parameters
function declaredTypes(fileText, name) {
    const types = new Set();
    const re = new RegExp('\\b(String|Object|java\\.util\\.[\\w.<>, ]+?|long|double|int|float|boolean|Long|Double|Integer|Boolean|Client|Exception)\\s+(?:final\\s+)?' + name + '\\s*(?=[,;=)])', 'g');
    let m;
    while ((m = re.exec(fileText)) !== null) {
        types.add(m[1]);
    }
    return types;
}

// the enclosing wrapper method's parameter type for `name` (wrapper files declare their
// params from the TS signature: `public Ret name(Type a, Type b, ...) {`)
function wrappingMethodArgType(fileText, methodName, name) {
    const re = new RegExp('public[^\\n=;{}]*\\b' + methodName + '\\s*\\(([^)]*)\\)', 'g');
    let match;
    while ((match = re.exec(fileText)) !== null) {
        for (const param of splitArgs(match[1])) {
            const m = /^\s*([\w.<>,\s\[\]]+?)\s+(\w+)\s*$/.exec(param);
            if (m && m[2] === name) {
                return m[1].trim();
            }
        }
    }
    return undefined;
}

function argIsProvablyString(file, text, site, cand) {
    const arg = site.arg.trim();
    if (argLooksStringLiteral(arg)) {
        return true;
    }
    const identifier = /^([A-Za-z_$][A-Za-z0-9_$]*)$/.exec(arg);
    if (identifier === null) {
        return false;
    }
    if (site.receiver === 'super') {
        const declared = wrappingMethodArgType(text, cand.name, identifier[1]);
        return declared === 'String' || declared === 'String[]';
    }
    const types = declaredTypes(text, identifier[1]);
    return types.size > 0 && [...types].every((t) => t === 'String');
}

const candidates = rows.filter((r) => r.consistent && !r.assignedAny && r.javaType === 'String');
const report = [];
for (const cand of candidates) {
    const needle = cand.name + '(';
    const sites = [];
    for (const f of files) {
        const text = contents.get(f);
        for (const recv of ['this.', 'super.', 'exchange.', 'ex.']) {
            let idx = 0;
            while ((idx = text.indexOf(recv + needle, idx)) !== -1) {
                const open = idx + recv.length + needle.length;
                let depth = 1; let i = open;
                let inStr = false;
                while (i < text.length && depth > 0) {
                    const ch = text[i];
                    if (inStr) { if (ch === '"' && text[i - 1] !== '\\') inStr = false; }
                    else if (ch === '"') inStr = true;
                    else if (ch === '(') depth++;
                    else if (ch === ')') depth--;
                    i++;
                }
                const args = splitArgs(text.slice(open, i - 1));
                sites.push({ file: path.relative('.', f), receiver: recv.slice(0, -1), arg: args[cand.position] ?? '', argc: args.length });
                idx = i;
            }
        }
    }
    const bad = sites.filter((s) => !argIsProvablyString(s.file, contents.get(s.file), s, cand));
    report.push({
        name: cand.name,
        position: cand.position,
        decls: cand.count,
        callSites: sites.length,
        clean: bad.length === 0,
        bad: bad.slice(0, 3).map((s) => s.file.replace('java/', '') + ' :: ' + s.arg.slice(0, 40)),
    });
}

const cleanCallSites = report.filter((r) => r.clean);

if (process.argv.includes('--json')) {
    console.log(JSON.stringify(cleanCallSites.map((r) => ({
        name: r.name, position: r.position, decls: r.decls, callSites: r.callSites,
    })), null, 1));
} else {
    console.log('java tree scanned:', files.length, 'files under', root);
    console.log('String candidates (consistent, unassigned):', report.length);
    console.log('  call-site clean:', cleanCallSites.length,
        '(declarations:', cleanCallSites.reduce((a, r) => a + r.decls, 0) + ')');
    console.log('\n-- PRUNED by the whole-tree call-site scan --');
    for (const r of report.filter((r) => !r.clean)) {
        console.log(`${r.name}[${r.position}] decls=${r.decls} sites=${r.callSites}`);
        for (const e of r.bad) console.log('        ', e);
    }
    console.log('\n-- clean, sorted by declarations --');
    for (const r of cleanCallSites.slice(0, 40)) {
        console.log(`${String(r.decls).padStart(5)} decls  ${r.name}[${r.position}] sites=${r.callSites}`);
    }
}
