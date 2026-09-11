// Pair verifier for the JN-15 slice: every -/+ line pair must be identical modulo the
// parameter TYPE tokens (the method name, modifiers, return type, parameter names, order
// and arity must all be unchanged).
import { execFileSync } from 'child_process';

const diff = execFileSync('git', ['diff', '853ab685540', '-U0', '--', 'java/'], { maxBuffer: 1 << 28 }).toString();
const lines = diff.split('\n');

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

// `Type name` -> `name`; `Object... optionalArgs` -> `optionalArgs`
function paramName(param) {
    const m = /([A-Za-z_][A-Za-z0-9_]*)\s*$/.exec(param.replace(/\[[^\]]*\]/g, '[]'));
    return m ? m[1] : param;
}

function normalize(sig) {
    const open = sig.indexOf('(');
    const close = sig.lastIndexOf(')');
    if (open === -1 || close === -1) return { head: sig.trim(), names: null };
    const head = sig.slice(0, open).trim();
    const params = splitArgs(sig.slice(open + 1, close));
    return { head, names: params.map(paramName).join(',') };
}

let pairs = 0; const bad = []; const typeChanges = new Map();
for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l.startsWith('-') || l.startsWith('---')) continue;
    const nxt = lines[i + 1];
    if (nxt === undefined || !nxt.startsWith('+') || nxt.startsWith('+++')) { bad.push('unpaired: ' + l); continue; }
    const a = normalize(l.slice(1)), b = normalize(nxt.slice(1));
    pairs++;
    if (a.head !== b.head || a.names !== b.names) {
        bad.push(`head/names differ:\n  - ${l}\n  + ${nxt}`);
        continue;
    }
    // count the type tokens that changed
    const oldLine = l.slice(1), newLine = nxt.slice(1);
    const oldParams = splitArgs(oldLine.slice(oldLine.indexOf('(') + 1, oldLine.lastIndexOf(')')));
    const newParams = splitArgs(newLine.slice(newLine.indexOf('(') + 1, newLine.lastIndexOf(')')));
    oldParams.forEach((p, k) => {
        const oldType = p.slice(0, p.length - (paramName(p).length)).trim();
        const newType = newParams[k].slice(0, newParams[k].length - (paramName(newParams[k]).length)).trim();
        if (oldType !== newType) typeChanges.set(oldType + ' -> ' + newType, (typeChanges.get(oldType + ' -> ' + newType) ?? 0) + 1);
    });
}
console.log('pairs verified:', pairs);
console.log('violations   :', bad.length);
for (const b of bad.slice(0, 10)) console.log('   ', b);
console.log('parameter type transitions:');
for (const [k, v] of [...typeChanges].sort((a, b) => b[1] - a[1])) console.log(`   ${String(v).padStart(5)}  ${k}`);
