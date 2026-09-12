#!/usr/bin/env node
// TS: safeString-family calls with >=3 args whose LAST arg is a numeric/boolean/null literal.
const fs = require('fs');
const path = require('path');
function walk(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith('.ts')) out.push(p);
    }
}
const files = [];
for (const r of process.argv.slice(2)) walk(r, files);
const names = ['safeString', 'safeString2', 'safeStringN', 'safeStringLower', 'safeStringUpper', 'safeStringLower2', 'safeStringUpper2', 'safeStringLowerN', 'safeStringUpperN'];
let hits = 0;
for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    for (const name of names) {
        const rx = new RegExp('\\b' + name + '\\s*\\(', 'g');
        let m;
        while ((m = rx.exec(src)) !== null) {
            const start = m.index + m[0].length;
            let depth = 1, i = start, inStr = false;
            while (i < src.length && depth > 0) {
                const c = src[i];
                if (inStr) { if (c === '\\') i++; else if (c === '"' || c === "'") inStr = false; }
                else if (c === '"' || c === "'") inStr = true;
                else if (c === '(') depth++;
                else if (c === ')') depth--;
                i++;
            }
            const args = src.slice(start, i - 1);
            const parts = [];
            let d = 0, cur = '', s2 = false;
            for (let j = 0; j < args.length; j++) {
                const c = args[j];
                if (s2) { cur += c; if (c === '\\') { cur += args[++j]; } else if (c === '"' || c === "'") s2 = false; continue; }
                if (c === '"' || c === "'") { s2 = true; cur += c; continue; }
                if (c === '(' || c === '[' || c === '{') d++;
                if (c === ')' || c === ']' || c === '}') d--;
                if (c === ',' && d === 0) { parts.push(cur); cur = ''; continue; }
                cur += c;
            }
            if (cur.trim()) parts.push(cur);
            if (parts.length < 3) continue;
            const last = parts[parts.length - 1].trim().replace(/^\((.*)\)$/, '$1').trim();
            if (/^-?\d+(\.\d+)?$/.test(last) || /^(true|false|null|undefined)$/.test(last)) {
                hits++;
                const lineNo = src.slice(0, m.index).split('\n').length;
                const line = src.split('\n')[lineNo - 1].trim();
                if (hits <= 30) console.log(`${f}:${lineNo}: ${line.slice(0, 170)}`);
            }
        }
    }
}
console.log('TOTAL >=3-arg calls with numeric/bool/null default:', hits);
