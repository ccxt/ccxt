#!/usr/bin/env node
// Census: how is the safeString family *called* in built/generated Java?
// Counts call sites by method + by shape of the last argument (default).
const fs = require('fs');
const path = require('path');

function walk(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith('.java')) out.push(p);
    }
}
const roots = process.argv.slice(2);
const files = [];
for (const r of roots) walk(r, files);

const names = ['SafeStringTyped', 'SafeString', 'safeString', 'SafeStringN', 'safeStringN', 'safeString2'];
const counts = {};   // name -> {total, withDefault, lastArgSamples}
let total = 0;
for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    // crude call scan: find "name(" and balance parens
    for (const name of names) {
        let idx = 0;
        const rx = new RegExp('\\b' + name + '\\s*\\(', 'g');
        let m;
        while ((m = rx.exec(src)) !== null) {
            if (name === 'safeString' && /\.\s*safeString$/.test(src.slice(Math.max(0, m.index - 12), m.index + name.length + 1).replace(/\s+/g, '')) === false) {
                // still count; fine-grained receiver check not needed
            }
            const start = m.index + m[0].length; // after '('
            let depth = 1, i = start, inStr = false, inChar = false;
            while (i < src.length && depth > 0) {
                const c = src[i];
                if (inStr) { if (c === '\\') i++; else if (c === '"') inStr = false; }
                else if (inChar) { if (c === '\\') i++; else if (c === '\'') inChar = false; }
                else if (c === '"') inStr = true;
                else if (c === '\'') inChar = true;
                else if (c === '(') depth++;
                else if (c === ')') depth--;
                i++;
            }
            const args = src.slice(start, i - 1);
            // split top-level commas
            const parts = [];
            let d = 0, cur = '', s2 = false, c2 = false;
            for (let j = 0; j < args.length; j++) {
                const c = args[j];
                if (s2) { cur += c; if (c === '\\') { cur += args[++j]; } else if (c === '"') s2 = false; continue; }
                if (c2) { cur += c; if (c === '\\') { cur += args[++j]; } else if (c === '\'') c2 = false; continue; }
                if (c === '"') { s2 = true; cur += c; continue; }
                if (c === '\'') { c2 = true; cur += c; continue; }
                if (c === '(') d++;
                if (c === ')') d--;
                if (c === ',' && d === 0) { parts.push(cur.trim()); cur = ''; continue; }
                cur += c;
            }
            if (cur.trim().length) parts.push(cur.trim());
            total++;
            const key = name;
            if (!counts[key]) counts[key] = { total: 0, lastArg: {} };
            counts[key].total++;
            const last = parts[parts.length - 1] || '';
            const cls = /^"/.test(last) ? 'string-literal'
                : /^-?\d+$/.test(last) ? 'int-literal'
                : /^-?\d+\.\d+$/.test(last) ? 'float-literal'
                : /^true$|^false$/.test(last) ? 'bool-literal'
                : /^null$/.test(last) ? 'null'
                : (last === '' ? 'none' : 'other(' + last.slice(0, 40) + ')');
            const c = counts[key];
            c.lastArg[cls] = (c.lastArg[cls] || 0) + 1;
        }
    }
}
console.log(JSON.stringify({ files: files.length, total, counts }, null, 2));
