// SS-10 census: declarations/assignments whose initializer is a TS conditional
// (`cond ? a : b`) and whose arms are statically String, in the files the Java
// transpiler emits. Syntactic prover mirroring build/java-local-types.js
// (dataflowValueType) + build/javaTranspiler.ts (isProvablyStringExpression),
// extended with the safeString family this slice is about.
//
// usage: npx tsx build/ss10-census.mjs [--json]
import ts from 'typescript6';
import fs from 'node:fs';
import path from 'node:path';

const DIRS = [ 'ts/src/exchanges', 'ts/src/pro', 'ts/src/prediction', 'ts/src/base' ];
const SINGLE_FILES = [ 'ts/src/base/Exchange.ts', 'ts/src/base/PredictionExchange.ts' ];

const SAFE_STRING = new Set([ 'safeString', 'safeString2', 'safeStringN' ]);
const SAFE_STRING_CASE = new Set([ 'safeStringUpper', 'safeStringLower', 'safeStringUpper2', 'safeStringLower2', 'safeStringUpperN', 'safeStringLowerN' ]);
const STRING_BASE_METHODS = new Set([ 'iso8601', 'numberToString' ]);
const PRECISE_STRING_STATICS = new Set([ 'stringAdd', 'stringSub', 'stringMul', 'stringDiv', 'stringMod', 'stringAbs', 'stringNeg', 'stringMax', 'stringMin', 'stringOr' ]);

function unwrap (node) {
    while (node !== undefined && ts.isParenthesizedExpression (node)) node = node.expression;
    return node;
}

function isThisPropertyCall (node, names) {
    return node !== undefined && ts.isCallExpression (node)
        && ts.isPropertyAccessExpression (node.expression)
        && node.expression.expression.kind === ts.SyntaxKind.ThisKeyword
        && names.has (node.expression.name.escapedText);
}

// returns 'String' | 'null' | undefined ; 'String+cast' marks a case-family arm.
// `armTags` records which producer families produced an arm.
function armType (node, armTags) {
    node = unwrap (node);
    if (node === undefined) return undefined;
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
            armTags.add ('literal');
            return 'String';
        case ts.SyntaxKind.NullKeyword:
            return 'null';
        case ts.SyntaxKind.Identifier:
            return node.escapedText === 'undefined' ? 'null' : undefined;
        case ts.SyntaxKind.ConditionalExpression: {
            const a = armType (node.whenTrue, armTags);
            const b = armType (node.whenFalse, armTags);
            if (a === undefined || b === undefined) return undefined;
            if (a === b) return a === 'null' ? undefined : a;
            if (a === 'null') return b;
            if (b === 'null') return a;
            return undefined;
        }
        case ts.SyntaxKind.BinaryExpression:
            return node.operatorToken.kind === ts.SyntaxKind.PlusToken && armType (node.left, armTags) === 'String' ? 'String' : undefined;
        case ts.SyntaxKind.CallExpression: {
            if (isThisPropertyCall (node, SAFE_STRING)) { armTags.add ('safeString'); return 'String'; }
            if (isThisPropertyCall (node, SAFE_STRING_CASE)) { armTags.add ('safeStringCase'); return 'String+cast'; }
            if (isThisPropertyCall (node, STRING_BASE_METHODS)) { armTags.add ('baseMethod'); return 'String'; }
            const callee = node.expression;
            if (ts.isPropertyAccessExpression (callee) && ts.isIdentifier (callee.expression)
                && callee.expression.escapedText === 'Precise' && PRECISE_STRING_STATICS.has (callee.name.escapedText)) { armTags.add ('precise'); return 'String'; }
            return undefined;
        }
        default:
            return undefined;
    }
}

// the whole conditional: undefined or { type, tags }
function conditionalType (node) {
    node = unwrap (node);
    if (node === undefined || !ts.isConditionalExpression (node)) return undefined;
    const tags = new Set ();
    const a = armType (node.whenTrue, tags);
    const b = armType (node.whenFalse, tags);
    if (a === undefined || b === undefined) return undefined;
    let type;
    if (a === b) type = a === 'null' ? undefined : a;
    else if (a === 'null') type = b;
    else if (b === 'null') type = a;
    if (type === undefined) return undefined;
    return { type: type.replace ('+cast', ''), tags: [ ...tags ].sort () };
}

function* walk (node) {
    yield node;
    for (const child of node.getChildren ()) yield* walk (child);
}

const declarations = [];
const assignments = [];
const files = [];
for (const dir of DIRS) {
    if (!fs.existsSync (dir)) continue;
    for (const f of fs.readdirSync (dir)) {
        if (f.endsWith ('.ts')) files.push (path.join (dir, f));
    }
}
for (const f of SINGLE_FILES) if (fs.existsSync (f)) files.push (f);

for (const file of files) {
    const text = fs.readFileSync (file, 'utf8');
    const sf = ts.createSourceFile (file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    for (const node of walk (sf)) {
        if (ts.isVariableDeclaration (node) && ts.isIdentifier (node.name) && node.initializer !== undefined) {
            const info = conditionalType (node.initializer);
            if (info !== undefined) {
                declarations.push ({ file, line: sf.getLineAndCharacterOfPosition (node.getStart ()).line + 1, name: node.name.escapedText, ...info });
            }
        } else if (ts.isBinaryExpression (node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier (node.left)) {
            const info = conditionalType (node.right);
            if (info !== undefined) {
                assignments.push ({ file, line: sf.getLineAndCharacterOfPosition (node.getStart ()).line + 1, name: node.left.escapedText, ...info });
            }
        }
    }
}

const tagCount = (list) => {
    const m = new Map ();
    for (const e of list) {
        const k = e.tags.join ('+');
        m.set (k, (m.get (k) || 0) + 1);
    }
    return [ ...m.entries () ].sort ((a, b) => b[1] - a[1]);
};

console.error (`== conditional-initializer declarations with all-String arms: ${declarations.length}`);
console.error ('   by arm tags: ' + JSON.stringify (tagCount (declarations)));
console.error (`   with safeString arm: ${declarations.filter ((d) => d.tags.includes ('safeString')).length}`);
console.error (`== conditional-assignment sites: ${assignments.length}`);
console.error ('   by arm tags: ' + JSON.stringify (tagCount (assignments)));
console.error (`   with safeString arm: ${assignments.filter ((a) => a.tags.includes ('safeString')).length}`);
if (process.argv.includes ('--json')) {
    console.log (JSON.stringify ({ declarations, assignments }, null, 1));
} else {
    for (const d of declarations) if (process.argv.includes ('--safe-only') ? d.tags.includes ('safeString') : true) console.log (`DECL ${d.file}:${d.line} ${d.name} -> ${d.type} [${d.tags.join (',')}]`);
    for (const a of assignments) if (process.argv.includes ('--safe-only') ? a.tags.includes ('safeString') : true) console.log (`ASGN ${a.file}:${a.line} ${a.name} -> ${a.type} [${a.tags.join (',')}]`);
}
