// census: boolean-declared method params in ts/src and every call-site argument at that position
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire (import.meta.url);
const ts = require (path.resolve ('node_modules/typescript6'));
const root = 'ts/src';
const files = [];
const walk = (d) => { for (const e of fs.readdirSync (d, { withFileTypes: true })) { const f = path.join (d, e.name); if (e.isDirectory ()) { if (e.name !== 'test') walk (f); } else if (f.endsWith ('.ts') && !f.endsWith ('.d.ts')) files.push (f); } };
walk (root);
const decls = new Map (); // name -> [{file, params:[{text, type, init}]}]
const calls = new Map (); // name -> [{file, line, args:[text]}]
const boolish = (p) => {
    const t = p.type ? p.type.getText () : undefined;
    if (t === 'boolean' || t === 'Bool') return t;
    if (t === undefined && p.initializer && (p.initializer.kind === ts.SyntaxKind.TrueKeyword || p.initializer.kind === ts.SyntaxKind.FalseKeyword)) return 'inferred';
    return undefined;
};
for (const f of files) {
    const text = fs.readFileSync (f, 'utf8');
    const sf = ts.createSourceFile (f, text, ts.ScriptTarget.Latest, true);
    const visit = (n) => {
        if (ts.isMethodDeclaration (n) && n.name && ts.isIdentifier (n.name)) {
            const list = decls.get (n.name.text) ?? [];
            list.push ({ file: f, line: sf.getLineAndCharacterOfPosition (n.getStart ()).line + 1, params: n.parameters.map ((p) => ({ name: p.name.getText (), type: p.type?.getText (), bool: boolish (p), init: p.initializer?.getText (), q: !!p.questionToken })) });
            decls.set (n.name.text, list);
        }
        if (ts.isCallExpression (n) && ts.isPropertyAccessExpression (n.expression)) {
            const name = n.expression.name.text;
            const list = calls.get (name) ?? [];
            list.push ({ file: f, line: sf.getLineAndCharacterOfPosition (n.getStart ()).line + 1, recv: n.expression.expression.getText (), args: n.arguments.map ((a) => a.getText ()) });
            calls.set (name, list);
        }
        ts.forEachChild (n, visit);
    };
    visit (sf);
}
const out = [];
for (const [name, list] of decls) {
    const maxp = Math.max (...list.map ((d) => d.params.length));
    for (let i = 0; i < maxp; i++) {
        if (!list.some ((d) => d.params[i]?.bool)) continue;
        const kinds = list.map ((d) => d.params[i] ? (d.params[i].bool ?? ('X:' + (d.params[i].type ?? '?'))) + (d.params[i].init !== undefined ? '=' + d.params[i].init : (d.params[i].q ? '?' : '')) : 'absent');
        const cs = (calls.get (name) ?? []).map ((c) => c.args[i] === undefined ? '<omit>' : c.args[i]);
        const argCounts = {};
        for (const a of cs) argCounts[a] = (argCounts[a] ?? 0) + 1;
        out.push ({ name, i, decls: list.length, kinds: [...new Set (kinds)], files: list.map ((d) => d.file.replace ('ts/src/', '') + ':' + d.line), args: argCounts });
    }
}
fs.writeFileSync ('research/r16/cs-bool-params/census.json', JSON.stringify (out, null, 1));
for (const r of out) console.log (r.name, r.i, r.decls, JSON.stringify (r.kinds), JSON.stringify (r.args));
