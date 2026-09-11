// Java method-parameter typing census (JN-15).
//
// Measures the blast radius of narrowing a generated Java Core method parameter
// from `Object` to a concrete type.  Java overrides are INVARIANT, so a base
// declaration (Exchange.java, from ts/src/base/Exchange.ts) and EVERY exchange
// override must carry the same printed parameter type; the type must be provable
// from the TS annotation and identical across every declaration of that method
// name.  This script does a syntactic census (no type checker needed): the
// printed parameter list is decided by initializer/questionToken presence, and
// the annotation text is what the printer's ArgTypeReplacements maps.
//
// usage: node build/java-param-census.mjs [ts-src-root] [--json]

import fs from 'fs';
import path from 'path';
import ts from 'typescript6';

const root = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'ts/src';
const asJson = process.argv.includes('--json');

// TS annotation text -> Java type the printer would emit for a PARAMETER
// (ArgTypeReplacements in ast-transpiler/src/javaTranspiler.ts).  Only the boxed
// set the local-typing engine knows how to name is useful here.
const ANNOTATION_TO_JAVA = {
    'string': 'String',
    'Str': 'String',
    'Int': 'long',
    'number': 'double',
    'Num': 'double',
    'boolean': 'boolean',
    'Dict': 'java.util.Map<String, Object>',
    'Strings': 'java.util.List<String>',
    'List': 'java.util.List<Object>',
};

// annotations that the local-typing engine can name a local with
const BOXED_JAVA = new Set(['String', 'java.util.List<Object>', 'java.util.Map<String, Object>']);

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(p, out);
        } else if (entry.name.endsWith('.ts')) {
            out.push(p);
        }
    }
    return out;
}

// every assignment target name inside a method body (param reassignment check)
function assignedNames(node) {
    const names = new Set();
    const visit = (n) => {
        if (ts.isBinaryExpression(n) && ts.isIdentifier(n.left)) {
            const k = n.operatorToken.kind;
            if (k === ts.SyntaxKind.EqualsToken
                || (k >= ts.SyntaxKind.FirstAssignment && k <= ts.SyntaxKind.LastAssignment)) {
                names.add(n.left.escapedText);
            }
        }
        // `[a, b] = ...` / `({a} = ...)` destructuring assignment: the printer flags every
        // identifier element in ReassignedVars (javaTranspiler.ts:628)
        if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken
            && (ts.isArrayLiteralExpression(n.left) || ts.isObjectLiteralExpression(n.left))) {
            const elements = ts.isArrayLiteralExpression(n.left) ? n.left.elements : n.left.properties;
            for (const e of elements) {
                const target = ts.isPropertyAssignment(e) ? e.initializer
                    : (ts.isShorthandPropertyAssignment(e) ? e.name : e);
                if (target !== undefined && ts.isIdentifier(target)) {
                    names.add(target.escapedText);
                }
            }
        }
        if ((ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n))
            && ts.isIdentifier(n.operand)) {
            names.add(n.operand.escapedText);
        }
        ts.forEachChild(n, visit);
    };
    visit(node);
    return names;
}

// does the body use `name` as the LEFT operand of `+` (Helpers.add left slot)? the
// printed overload family moves once the param is a String, so the right operand decides
function plusLeftRights(node, name) {
    const rights = [];
    const visit = (n) => {
        if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.PlusToken) {
            let left = n.left;
            while (ts.isParenthesizedExpression(left)) left = left.expression;
            if (ts.isIdentifier(left) && left.escapedText === name) {
                rights.push(n.right.getText().slice(0, 60));
            }
        }
        ts.forEachChild(n, visit);
    };
    visit(node);
    return rights;
}

const declarations = new Map(); // "name\u0000pos" -> [{file, name, annotation, assigned}]
const methodNames = new Set();

for (const file of walk(root)) {
    const text = fs.readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    const visit = (node) => {
        if (ts.isMethodDeclaration(node) && node.name !== undefined && node.parameters !== undefined) {
            const name = node.name.escapedText;
            methodNames.add(name);
            const assigned = node.body !== undefined ? assignedNames(node.body) : new Set();
            node.parameters.forEach((p, i) => {
                if (!ts.isIdentifier(p.name)) return;
                const optional = p.initializer !== undefined || p.questionToken !== undefined;
                const annotation = p.type !== undefined ? p.type.getText() : 'missing';
                const key = name + '\u0000' + i;
                if (!declarations.has(key)) declarations.set(key, []);
                declarations.get(key).push({
                    file: path.relative('.', file),
                    paramName: p.name.escapedText,
                    annotation,
                    optional,
                    assigned: assigned.has(p.name.escapedText),
                    plusRights: node.body !== undefined ? plusLeftRights(node.body, p.name.escapedText) : [],
                });
            });
        }
        ts.forEachChild(node, visit);
    };
    visit(sf);
}

// group: a candidate is a position where EVERY declaration is non-optional and
// carries the same Java-mapped type
const rows = [];
for (const [key, decls] of declarations) {
    const [name, posStr] = key.split('\u0000');
    const pos = Number(posStr);
    if (decls.some((d) => d.optional)) continue; // prints into `Object... optionalArgs`
    const annotations = new Set(decls.map((d) => d.annotation));
    const javaTypes = new Set(decls.map((d) => ANNOTATION_TO_JAVA[d.annotation]));
    const assignedAny = decls.some((d) => d.assigned);
    const base = decls.some((d) => /(^|\/)ts\/src\/base\//.test(d.file));
    rows.push({
        name,
        position: pos,
        count: decls.length,
        base,
        annotation: [...annotations].join('|'),
        javaType: javaTypes.size === 1 ? [...javaTypes][0] : [...javaTypes].join('|'),
        consistent: javaTypes.size === 1 && !javaTypes.has(undefined) && !annotations.has('missing'),
        assignedAny,
        plusRights: [...new Set(decls.flatMap((d) => d.plusRights))],
        boxed: javaTypes.size === 1 && BOXED_JAVA.has([...javaTypes][0]),
        files: decls.length,
        paramNames: [...new Set(decls.map((d) => d.paramName))].join('|'),
        sample: decls.slice(0, 3).map((d) => d.file + ':' + d.paramName),
        allFiles: decls.map((d) => d.file),
    });
}

rows.sort((a, b) => b.count - a.count);

// a `+` right operand that provably stays a String box: a quoted literal, a template
// literal, `null`/`undefined` (both print as String.valueOf -> identical either way)
function plusRightLooksSafe(text) {
    return /^["'`]/.test(text) || text === 'null' || text === 'undefined';
}

const candidates = rows.filter((r) => r.consistent && !r.assignedAny);
const safe = candidates.filter((r) => r.plusRights.every(plusRightLooksSafe));

if (asJson) {
    console.log(JSON.stringify({ rows, safe }, null, 1));
} else {
    console.log('total printed-param positions (method,index):', rows.length);
    console.log('consistent + unassigned positions:', candidates.length);
    console.log('  of those, +left-safe:', safe.length,
        '(declarations:', safe.reduce((a, r) => a + r.count, 0) + ')');
    console.log('positions whose Java type is boxed (engine-namable):',
        candidates.filter((r) => r.boxed).length);
    console.log('declarations in those boxed positions:',
        candidates.filter((r) => r.boxed).reduce((a, r) => a + r.count, 0));
    console.log('\n-- TOP string positions (consistent, unassigned, +safe) --');
    for (const r of safe.filter((r) => r.javaType === 'String').slice(0, 60)) {
        console.log(`${String(r.count).padStart(5)} decls  ${r.name}[${r.position}]  ${r.paramNames}  base=${r.base}  e.g. ${r.sample[0]}`);
    }
    console.log('\n-- TOP list/map positions --');
    for (const r of safe.filter((r) => r.boxed && r.javaType !== 'String').slice(0, 20)) {
        console.log(`${String(r.count).padStart(5)} decls  ${r.name}[${r.position}]  ${r.javaType}  ${r.paramNames}`);
    }
    console.log('\n-- candidates rejected only by the +left guard --');
    for (const r of candidates.filter((r) => !r.plusRights.every(plusRightLooksSafe)).slice(0, 20)) {
        console.log(`${String(r.count).padStart(5)} decls  ${r.name}[${r.position}]  ${r.javaType}  rights=${JSON.stringify(r.plusRights).slice(0, 90)}`);
    }
    console.log('\n-- inconsistent / assigned (rejected) top --');
    for (const r of rows.filter((r) => !(r.consistent && !r.assignedAny)).slice(0, 15)) {
        console.log(`${String(r.count).padStart(5)} decls  ${r.name}[${r.position}]  ann=${r.annotation}  assigned=${r.assignedAny}  consistent=${r.consistent}`);
    }
}
