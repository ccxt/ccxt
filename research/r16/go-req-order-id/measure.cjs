// usage (non-symbol required string params): node measure.cjs <worktree> -> per unified method: required `symbol: string` param agreement,
// nil compares / writes in any declaration, and call-site argument kinds (text-level, TS6 AST)
const ts = require('/root/ccxt/node_modules/typescript6');
const fs = require('fs'), path = require('path');
const root = process.argv[2];
const files = [];
(function walk (d) { for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(path.join(d, e.name)); }
    else if (e.name.endsWith('.ts') && !e.name.endsWith('.d.ts')) files.push(path.join(d, e.name)); } })('ts/src');
const sfs = files.map(rel => [rel, ts.createSourceFile(rel, fs.readFileSync(path.join(root, rel), 'utf8'), ts.ScriptTarget.Latest, true)]);
const methods = (sf, cb) => ts.forEachChild(sf, function v (n) { if (ts.isMethodDeclaration(n) && n.name && ts.isIdentifier(n.name)) cb(n); ts.forEachChild(n, v); });
const cand = new Map(); // key name#idx -> [name, idx]
for (const [rel, sf] of sfs) if (rel.startsWith('ts/src/base/')) methods(sf, (m) => m.parameters.forEach((p, i) => {
    if (ts.isIdentifier(p.name) && p.name.text !== 'symbol' && !p.initializer && !p.questionToken && p.type && p.type.getText(sf) === 'string') if (rel === 'ts/src/base/Exchange.ts' && m.modifiers && m.modifiers.some(x => x.kind === ts.SyntaxKind.AsyncKeyword)) cand.set(m.name.text + '#' + i, [m.name.text, i, p.name.text]);
}));
const res = new Map();
const byName = new Map();
for (const [k, [m, i, pn]] of cand) { const r = { name: m, idx: i, pname: pn, decls: 0, bad: [] }; res.set(k, r); if (!byName.has(m)) byName.set(m, []); byName.get(m).push(r); }
const nil = (y) => y.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(y) && y.text === 'undefined');
for (const [rel, sf] of sfs) methods(sf, (m) => {
    for (const r of (byName.get(m.name.text) || [])) {
    if (ts.isClassDeclaration(m.parent) === false) continue;
    r.decls++;
    const at = `${rel}:${sf.getLineAndCharacterOfPosition(m.getStart()).line + 1}`;
    const p = m.parameters[r.idx];
    if (!p || !ts.isIdentifier(p.name)) { r.bad.push(`${at} shape`); continue; }
    if (p.initializer || p.questionToken) { r.bad.push(`${at} optional`); continue; }
    const t = p.type ? p.type.getText(sf) : 'NONE';
    if (t !== 'string') { r.bad.push(`${at} type ${t}`); continue; }
    if (!m.body) continue;
    const name = p.name.text;
    (function w (x) {
        if (ts.isBinaryExpression(x)) {
            const op = x.operatorToken.kind; const isId = (y) => ts.isIdentifier(y) && y.text === name;
            if ([ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(op)
                && ((isId(x.left) && nil(x.right)) || (isId(x.right) && nil(x.left)))) { const st = x.parent, th = st && st.thenStatement;
                if (op === ts.SyntaxKind.EqualsEqualsEqualsToken && ts.isIfStatement(st) && st.expression === x && !st.elseStatement && th && ts.isBlock(th) && th.statements.length === 1 && ts.isThrowStatement(th.statements[0])) r.grd = (r.grd || 0) + 1; else r.bad.push(`${at} nilcmp ${x.parent.getText(sf).slice(0, 60).replace(/\s+/g, ' ')}`); }
            else if (op >= ts.SyntaxKind.FirstAssignment && op <= ts.SyntaxKind.LastAssignment && isId(x.left)) r.bad.push(`${at} write ${x.right.getText(sf).slice(0, 50)}`);
            else if (op === ts.SyntaxKind.EqualsToken && ts.isArrayLiteralExpression(x.left) && x.left.elements.some(isId)) r.bad.push(`${at} destructure`);
        }
        ts.forEachChild(x, w); })(m.body);
    }
});
// call sites: argument kinds
for (const [rel, sf] of sfs) ts.forEachChild(sf, function v (n) {
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && byName.has(n.expression.name.text)) for (const r of byName.get(n.expression.name.text)) {
        const a = n.arguments[r.idx];
        let m = n.parent; while (m && !ts.isMethodDeclaration(m) && !ts.isFunctionDeclaration(m) && !ts.isArrowFunction(m) && !ts.isFunctionExpression(m)) m = m.parent;
        let kind = 'expr';
        if (!a) kind = 'missing';
        else if (ts.isStringLiteral(a)) kind = 'lit';
        else if (ts.isIdentifier(a) && m && m.parameters) {
            const p = m.parameters.find(q => ts.isIdentifier(q.name) && q.name.text === a.text);
            kind = p ? ('param:' + (p.type ? p.type.getText(sf) : 'NONE') + (p.initializer || p.questionToken ? '?' : '')) : 'local';
        } else if (nil(a)) kind = 'NIL';
        r.calls = r.calls || {}; r.calls[kind] = (r.calls[kind] || 0) + 1;
        if (kind !== 'lit' && kind !== 'param:string') { r.callx = r.callx || []; r.callx.push(`${rel}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1} ${kind} ${a ? a.getText(sf).slice(0, 40) : ''}`); }
    }
    ts.forEachChild(n, v);
});
const out = [...res.entries()].sort((a, b) => b[1].decls - a[1].decls);
for (const [m, r] of out) {
    console.log(`${r.bad.length ? 'BAD ' : 'OK  '} ${r.name}[${r.idx}:${r.pname}] decls=${r.decls} bad=${r.bad.length} grd=${r.grd || 0} calls=${JSON.stringify(r.calls || {})}`);
}
if (process.env.V) for (const [m, r] of out) { for (const b of r.bad) console.log('X', m, b); for (const c of (r.callx || [])) console.log('C', m, c); }
