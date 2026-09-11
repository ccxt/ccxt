// Second-order census for the JN-15 parameter slice: how many generated LOCALS become
// typable because a parameter is now provably String.
//
// The parameter slice makes `String symbol` a provable value source. A local initialised
// FROM it (`const x = <param>` in TS -> `Object x = <param>;` in the generated Java) is
// the only new edge for the local-typing engine. This script measures:
//   (1) TS locals whose initializer is a bare read of a narrowed parameter;
//   (2) TS locals whose initializer MENTIONS a narrowed parameter, by shape (a call
//       argument or an object-literal value is not a type source);
//   (3) java `Object <local> = <String param>;` sites, split into the printer's synthetic
//       `finalX` lambda captures, the ReassignedVars `x3 = x2` snapshots, and plain copies.
//
// usage: node build/java-param-locals.mjs

import fs from 'fs';
import path from 'path';
import ts from 'typescript6';

const tableText = fs.readFileSync('build/java-param-table.generated.js', 'utf8');
const TABLE = {};
for (const m of tableText.matchAll(/"([A-Za-z0-9_]+)": \{([^}]*)\}/g)) {
    TABLE[m[1]] = new Set([...m[2].matchAll(/(\d+): 'String'/g)].map((x) => Number(x[1])));
}

function walk(dir, ext, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, ext, out);
        else if (e.name.endsWith(ext)) out.push(p);
    }
    return out;
}

// ---- (1) + (2): the TS sources ------------------------------------------------
let copies = 0;
let mentioning = 0;
const shapes = new Map();
for (const file of walk('ts/src', '.ts')) {
    const text = fs.readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    const visit = (node) => {
        if (ts.isMethodDeclaration(node) && node.name !== undefined && node.body !== undefined) {
            const positions = TABLE[node.name.escapedText];
            if (positions !== undefined && node.body !== undefined) {
                const narrowed = new Set();
                node.parameters.forEach((p, i) => {
                    if (positions.has(i) && ts.isIdentifier(p.name)
                        && p.initializer === undefined && p.questionToken === undefined) {
                        narrowed.add(p.name.escapedText);
                    }
                });
                if (narrowed.size > 0) {
                    const visitBody = (n) => {
                        if (ts.isVariableDeclaration(n) && n.initializer !== undefined
                            && ts.isIdentifier(n.name) && ts.isIdentifier(n.initializer)
                            && narrowed.has(n.initializer.escapedText)) {
                            copies++;
                        }
                        if (ts.isVariableDeclaration(n) && n.initializer !== undefined
                            && ts.isIdentifier(n.name) && ts.isIdentifier(n.initializer) === false) {
                            let references = false;
                            const scan = (x) => {
                                if (ts.isIdentifier(x) && narrowed.has(x.escapedText)) references = true;
                                ts.forEachChild(x, scan);
                            };
                            scan(n.initializer);
                            if (references) {
                                mentioning++;
                                const init = n.initializer;
                                const shape = ts.isBinaryExpression(init) ? 'binary-' + (init.operatorToken.kind === ts.SyntaxKind.PlusToken ? 'plus' : 'other')
                                    : ts.isConditionalExpression(init) ? 'ternary'
                                        : ts.isCallExpression(init) ? 'call-argument'
                                            : ts.isObjectLiteralExpression(init) ? 'object-literal'
                                                : 'other';
                                shapes.set(shape, (shapes.get(shape) ?? 0) + 1);
                            }
                        }
                        ts.forEachChild(n, visitBody);
                    };
                    visitBody(node.body);
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sf);
}

// ---- (3): the generated java --------------------------------------------------
let plain = 0, finalWrap = 0, snap = 0;
const plainSamples = [];
for (const file of walk('java', '.java')) {
    const text = fs.readFileSync(file, 'utf8');
    const params = new Set();
    for (const m of text.matchAll(/\bString\s+([A-Za-z_][A-Za-z0-9_]*)\s*[,)]/g)) params.add(m[1]);
    if (params.size === 0) continue;
    for (const m of text.matchAll(/\bObject\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([A-Za-z_][A-Za-z0-9_]*)\s*;/g)) {
        if (!params.has(m[2]) || m[1] === m[2]) continue;
        if (m[1].startsWith('final')) finalWrap++;
        else if (/^\w+[23]$/.test(m[1]) || /^\w+[23]$/.test(m[2])) snap++;
        else {
            plain++;
            if (plainSamples.length < 10) plainSamples.push(`${path.relative('java', file)}: Object ${m[1]} = ${m[2]};`);
        }
    }
}

console.log('narrowed parameter positions in the table:', Object.values(TABLE).reduce((a, s) => a + s.size, 0));
console.log('(1) TS `const x = <param>` direct copies        :', copies);
console.log('(2) TS locals whose initializer MENTIONS a param:', mentioning);
for (const [k, v] of [...shapes].sort((a, b) => b[1] - a[1])) console.log(`      ${String(v).padStart(4)}  ${k}`);
console.log('(3) java `Object x = <String param>;` sites    :', finalWrap + snap + plain);
console.log('      printer finalX lambda captures:', finalWrap);
console.log('      ReassignedVars x3 = x2 snapshots:', snap);
console.log('      plain copies:', plain);
for (const s of plainSamples) console.log('        ', s);
