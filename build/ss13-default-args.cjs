#!/usr/bin/env node
// Classify the DEFAULT arg (3rd arg, or 3rd+ for N-variants) of safeString-family
// calls in generated Java: print any whose default is not a string literal.
const fs = require('fs');
const path = require('path');
function walk(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith('.java')) out.push(p);
    }
}
const files = [];
for (const r of process.argv.slice(2)) walk(r, files);
const names = ['safeString', 'safeString2', 'safeStringN', 'SafeStringTyped'];
const nonLiteral = {};
let total3 = 0;
for (const f of files) {
    if (f.includes('/base/SafeMethods.java')) continue;
    const src = fs.readFileSync(f, 'utf8');
    for (const name of names) {
        const rx = new RegExp('\\b' + name + '\\s*\\(', 'g');
        let m;
        while ((m = rx.exec(src)) !== null) {
            const start = m.index + m[0].length;
            let depth = 1, i = start, inStr = false;
            while (i < src.length && depth > 0) {
                const c = src[i];
                if (inStr) { if (c === '\\') i++; else if (c === '"') inStr = false; }
                else if (c === '"') inStr = true;
                else if (c === '(') depth++;
                else if (c === ')') depth--;
                i++;
            }
            const args = src.slice(start, i - 1);
            const parts = [];
            let d = 0, cur = '', s2 = false;
            for (let j = 0; j < args.length; j++) {
                const c = args[j];
                if (s2) { cur += c; if (c === '\\') { cur += args[++j]; } else if (c === '"') s2 = false; continue; }
                if (c === '"') { s2 = true; cur += c; continue; }
                if (c === '(') d++;
                if (c === ')') d--;
                if (c === ',' && d === 0) { parts.push(cur); cur = ''; continue; }
                cur += c;
            }
            if (cur) parts.push(cur);
            if (parts.length < 3) continue;
            total3++;
            const last = parts[parts.length - 1].trim();
            if (!/^"/.test(last) && !/^'/.test(last)) {
                const k = last;
                nonLiteral[k] = (nonLiteral[k] || 0) + 1;
            }
        }
    }
}
const sorted = Object.entries(nonLiteral).sort((a, b) => b[1] - a[1]);
console.log('total calls with >=3 args:', total3);
console.log('non-literal defaults (count, expr):');
for (const [k, v] of sorted) console.log(String(v).padStart(6), k.slice(0, 100));
