// Call-site census for candidate generated method parameters (JN-15).
// Reads the census rows (build/java-param-census.mjs --json) and, for every
// candidate String position, scans the generated Java tree for `this.<name>(`
// and `super.<name>(` call sites, classifying the argument text at that position.
//
// usage: node build/java-param-sites.mjs [--json]

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const root = 'java/lib/src/main/java';
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

// for a wrapper `super.<name>(a, b, ...)` call, the declared Java type of the
// enclosing wrapper method's parameter `argName` (the wrappers are one-liners with a
// regular shape: `public Ret name(Type a, Type b, ...) {`)
function wrapperArgType(fileText, methodName, argName) {
    const head = new RegExp('public[^\\n=;]*\\b' + methodName + '\\s*\\(([^)]*)\\)', 'g');
    let match;
    while ((match = head.exec(fileText)) !== null) {
        for (const param of match[1].split(',')) {
            const m = /^\s*([\w.<>,\s\[\]]+?)\s+(\w+)\s*$/.exec(param);
            if (m && m[2] === argName) {
                return m[1].trim();
            }
        }
    }
    return undefined;
}

const candidates = rows.filter((r) => r.consistent && !r.assignedAny && r.javaType === 'String');
const report = [];
// a first-position argument that is provably a String box in the generated Java
function argLooksString(text) {
    const t = text.trim();
    return /^"(?:[^"\\]|\\.)*"$/.test(t)      // string literal
        || t.startsWith('(String)')           // explicit checkcast
        || t.startsWith('((String)');         // parenthesised checkcast
}
for (const cand of candidates) {
    const needle = cand.name + '(';
    const sites = [];
    for (const f of files) {
        const text = contents.get(f);
        for (const recv of ['this.', 'super.']) {
            let idx = 0;
            while ((idx = text.indexOf(recv + needle, idx)) !== -1) {
                // skip a declaration: "public ... <name>(" has no receiver
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
                const argText = text.slice(open, i - 1);
                const args = splitArgs(argText);
                sites.push({ file: path.relative('.', f), receiver: recv.slice(0, -1), arg: args[cand.position] ?? '', argc: args.length });
                idx = i;
            }
        }
    }
    const thisSites = sites.filter((s) => s.receiver === 'this');
    const superSites = sites.filter((s) => s.receiver === 'super');
    const badThis = thisSites.filter((s) => !argLooksString(s.arg));
    const badSuper = superSites.filter((s) => {
        if (argLooksString(s.arg)) {
            return false;
        }
        const m = /^([A-Za-z_][A-Za-z0-9_]*)$/.exec(s.arg.trim());
        if (m === null) {
            return true; // an expression we cannot classify — treat as unsafe
        }
        const declared = wrapperArgType(contents.get(s.file), cand.name, m[1]);
        return declared !== 'String' && declared !== 'String[]';
    });
    report.push({
        name: cand.name,
        position: cand.position,
        decls: cand.count,
        callSites: sites.length,
        thisSites: thisSites.length,
        superSites: superSites.length,
        clean: badThis.length === 0 && badSuper.length === 0,
        badThis: badThis.slice(0, 4).map((s) => s.file + ' :: ' + s.arg),
        badSuper: badSuper.slice(0, 4).map((s) => s.file + ' :: ' + s.arg),
    });
}

const cleanCallSites = report.filter((r) => r.clean);

report.sort((a, b) => (a.thisSites - b.thisSites) || (b.count - a.count));

if (process.argv.includes('--json')) {
    console.log(JSON.stringify(cleanCallSites.map((r) => ({
        name: r.name, position: r.position, decls: r.decls, callSites: r.callSites,
        thisSites: r.thisSites, superSites: r.superSites, badThis: r.badThis,
    })), null, 1));
} else {
    console.log('String candidates (consistent, unassigned):', report.length);
    console.log('  call-site clean (every this.<name>( arg0 provably String):', cleanCallSites.length);
    console.log('  declarations behind clean candidates:', cleanCallSites.reduce((a, r) => a + r.decls, 0));
    console.log('\n-- DIRTY call sites (candidates to exclude) --');
    for (const r of report.filter((r) => !r.clean)) {
        console.log(`${r.name}[${r.position}] decls=${r.decls} this=${r.thisSites} badThis=${r.badThis.length} badSuper=${r.badSuper.length}`);
        for (const e of r.badThis) console.log('   this ', e);
        for (const e of r.badSuper) console.log('   super', e);
    }
    console.log('\n-- clean, sorted by declarations --');
    for (const r of cleanCallSites.slice(0, 50)) {
        console.log(`${String(r.decls).padStart(5)} decls  ${r.name}[${r.position}] this=${r.thisSites} super=${r.superSites}`);
    }
}
