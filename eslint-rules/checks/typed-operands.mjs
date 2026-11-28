#!/usr/bin/env node
// Source check: typed-operands
//
// Reports arithmetic (+ - * / and += -= *= /=), ordering compares (< > <= >=),
// strict compares of an any / unknown operand against a literal (=== / !== 'x' | 1 | true) and string
// methods (.split .indexOf .slice .replace .toLowerCase ...) whose operand
// type is `any`, `unknown`, or a union that includes undefined (Str, Int, Num).
// These shapes print Add / Subtract / Multiply / Divide / IsLessThan /
// IsGreaterThan / IsEqual / Split ... helper calls in the Go, Java, C# and Rust
// ports because the generator cannot see a plain operand type.
//
// It needs the type checker, so it is a source check, not an ESLint rule.
// Ratchet: per-file counts are compared with eslint-rules/baseline/typed-operands.json;
// exit 1 only when a file has MORE findings than its baseline.
//
// Usage (from the repo root):
//   node eslint-rules/checks/typed-operands.mjs            # ratchet check
//   node eslint-rules/checks/typed-operands.mjs --list     # print every finding
//   node eslint-rules/checks/typed-operands.mjs --counts   # print JSON {file: count}
//   node eslint-rules/checks/typed-operands.mjs [files..]  # restrict to files
//
// TypeScript: the root `typescript` package is the native compiler without a JS
// API, so this loads the `typescript6` alias (same one build/use-typescript6.cjs uses).

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire (import.meta.url);
let ts;
try {
    ts = require ('typescript6');
} catch {
    ts = require ('typescript');
}

export const RULE_NAME = 'typed-operands';

const ARITH = new Set ([
    ts.SyntaxKind.PlusToken, ts.SyntaxKind.MinusToken, ts.SyntaxKind.AsteriskToken, ts.SyntaxKind.SlashToken,
    ts.SyntaxKind.PlusEqualsToken, ts.SyntaxKind.MinusEqualsToken, ts.SyntaxKind.AsteriskEqualsToken, ts.SyntaxKind.SlashEqualsToken,
]);
const ORDER = new Set ([
    ts.SyntaxKind.LessThanToken, ts.SyntaxKind.GreaterThanToken,
    ts.SyntaxKind.LessThanEqualsToken, ts.SyntaxKind.GreaterThanEqualsToken,
]);
const EQUAL = new Set ([ ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken ]);
export const STRING_METHODS = new Set ([
    'split', 'indexOf', 'lastIndexOf', 'slice', 'substring', 'replace', 'replaceAll',
    'toLowerCase', 'toUpperCase', 'startsWith', 'endsWith', 'includes', 'trim',
]);

const FAMILY = {
    [ts.SyntaxKind.PlusToken]: 'Add', [ts.SyntaxKind.PlusEqualsToken]: 'Add',
    [ts.SyntaxKind.MinusToken]: 'Subtract', [ts.SyntaxKind.MinusEqualsToken]: 'Subtract',
    [ts.SyntaxKind.AsteriskToken]: 'Multiply', [ts.SyntaxKind.AsteriskEqualsToken]: 'Multiply',
    [ts.SyntaxKind.SlashToken]: 'Divide', [ts.SyntaxKind.SlashEqualsToken]: 'Divide',
    [ts.SyntaxKind.LessThanToken]: 'IsLessThan', [ts.SyntaxKind.LessThanEqualsToken]: 'IsLessThanOrEqual',
    [ts.SyntaxKind.GreaterThanToken]: 'IsGreaterThan', [ts.SyntaxKind.GreaterThanEqualsToken]: 'IsGreaterThanOrEqual',
    [ts.SyntaxKind.EqualsEqualsEqualsToken]: 'IsEqual', [ts.SyntaxKind.ExclamationEqualsEqualsToken]: 'IsEqual',
};

// '' when the type is plain, else 'any' | 'unknown' | 'possibly undefined'
function weakness (type) {
    if (type.flags & ts.TypeFlags.Any) {
        return 'any';
    }
    if (type.flags & ts.TypeFlags.Unknown) {
        return 'unknown';
    }
    if (type.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void)) {
        return 'possibly undefined';
    }
    if (type.isUnion ()) {
        for (const t of type.types) {
            const w = weakness (t);
            if (w !== '') {
                return w === 'any' ? 'any' : 'possibly undefined';
            }
        }
    }
    return '';
}

function isLiteral (node) {
    while (ts.isParenthesizedExpression (node)) {
        node = node.expression;
    }
    return ts.isStringLiteral (node) || ts.isNoSubstitutionTemplateLiteral (node) || ts.isNumericLiteral (node)
        || node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword
        || (ts.isPrefixUnaryExpression (node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral (node.operand));
}

function isLengthAccess (node) {
    while (ts.isParenthesizedExpression (node)) {
        node = node.expression;
    }
    return ts.isPropertyAccessExpression (node) && node.name.text === 'length';
}

function isThisProperty (node) {
    while (ts.isParenthesizedExpression (node)) {
        node = node.expression;
    }
    return ts.isPropertyAccessExpression (node) && node.expression.kind === ts.SyntaxKind.ThisKeyword;
}

function isTypeofExpr (node) {
    while (ts.isParenthesizedExpression (node)) {
        node = node.expression;
    }
    return ts.isTypeOfExpression (node);
}

const HINT = {
    arith: 'give the operand a default at the read (this.safeInteger (x, \'k\', 0)) or use Precise for string maths',
    order: 'compare plain values: default the read (this.safeInteger (x, \'k\', 0)) or test !== undefined first and compare inside the branch',
    equal: 'read the value with a typed reader (this.safeString (x, \'k\')) before comparing it with a literal',
    string: 'read the receiver with this.safeString (x, \'k\', \'\') (or test !== undefined first) before calling string methods on it',
};

// Find all findings in one source file
export function checkSourceFile (sf, checker) {
    const findings = [];
    const add = (node, kind, family, w, what) => {
        const { line, character } = sf.getLineAndCharacterOfPosition (node.getStart (sf));
        findings.push ({
            line: line + 1,
            column: character + 1,
            kind,
            family,
            message: `${what} is ${w} (${family}); ${HINT[kind]}`,
        });
    };
    const typeOf = (n) => checker.getTypeAtLocation (n);
    const visit = (node) => {
        if (ts.isBinaryExpression (node)) {
            const op = node.operatorToken.kind;
            if (ARITH.has (op) || ORDER.has (op)) {
                const kind = ARITH.has (op) ? 'arith' : 'order';
                for (const side of [ node.left, node.right ]) {
                    if (kind === 'order' && isLengthAccess (side)) {
                        continue; // i < rows.length: the compare prints natively, the length is another family
                    }
                    const w = weakness (typeOf (side));
                    if (w === 'possibly undefined' && isThisProperty (side)) {
                        continue; // this.version / this.id (Str fields) print as plain struct fields, no helper
                    }
                    if (w !== '') {
                        add (side, kind, FAMILY[op], w, `operand of '${node.operatorToken.getText (sf)}'`);
                        break; // one finding per expression
                    }
                }
            } else if (EQUAL.has (op)) {
                const l = isLiteral (node.left);
                const r = isLiteral (node.right);
                if (l !== r) {
                    const other = l ? node.right : node.left;
                    if (!isTypeofExpr (other)) {
                        // Str / Int === literal prints natively (x != nil && *x == "lit"); only any / unknown is counted
                        const w = weakness (typeOf (other));
                        if (w === 'any' || w === 'unknown') {
                            add (other, 'equal', FAMILY[op], w, `operand compared with a literal`);
                        }
                    }
                }
            }
        } else if (ts.isCallExpression (node) && ts.isPropertyAccessExpression (node.expression)) {
            const name = node.expression.name.text;
            if (STRING_METHODS.has (name)) {
                const recv = node.expression.expression;
                if (recv.kind !== ts.SyntaxKind.ThisKeyword) {
                    const w = weakness (typeOf (recv));
                    if (w !== '') {
                        const fam = name.charAt (0).toUpperCase () + name.slice (1);
                        add (recv, 'string', fam, w, `receiver of .${name} ()`);
                    }
                }
            }
        }
        ts.forEachChild (node, visit);
    };
    visit (sf);
    return findings;
}

// fixtures: { 'a.ts': 'source', ... } -> { 'a.ts': findings[] } (used by the tests)
export function checkFixtures (fixtures) {
    const options = { strict: true, strictNullChecks: true, target: ts.ScriptTarget.ES2022, noEmit: true, lib: [ 'lib.es2022.d.ts' ] };
    const host = ts.createCompilerHost (options);
    const origGet = host.getSourceFile.bind (host);
    const origExists = host.fileExists.bind (host);
    host.getSourceFile = (name, lang) => (name in fixtures ? ts.createSourceFile (name, fixtures[name], lang, true) : origGet (name, lang));
    host.fileExists = (name) => (name in fixtures) || origExists (name);
    host.readFile = ((orig) => (name) => (name in fixtures ? fixtures[name] : orig (name))) (host.readFile.bind (host));
    const program = ts.createProgram (Object.keys (fixtures), options, host);
    const checker = program.getTypeChecker ();
    const out = {};
    for (const name of Object.keys (fixtures)) {
        out[name] = checkSourceFile (program.getSourceFile (name), checker);
    }
    return out;
}

export function scopeFiles (root) {
    const list = [];
    for (const dir of [ 'ts/src', 'ts/src/pro', 'ts/src/prediction' ]) {
        const abs = path.join (root, dir);
        if (!fs.existsSync (abs)) {
            continue;
        }
        for (const f of fs.readdirSync (abs).sort ()) {
            if (f.endsWith ('.ts') && !f.endsWith ('.d.ts')) {
                list.push (path.posix.join (dir, f));
            }
        }
    }
    for (const f of [ 'ts/src/base/Exchange.ts', 'ts/src/base/PredictionExchange.ts' ]) {
        if (fs.existsSync (path.join (root, f))) {
            list.push (f);
        }
    }
    return list;
}

export function checkRepo (root, files) {
    const configPath = path.join (root, 'tsconfig.json');
    const config = ts.readConfigFile (configPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent (config.config, ts.sys, root);
    const options = { ...parsed.options, noEmit: true, incremental: false };
    const program = ts.createProgram (files.map ((f) => path.join (root, f)), options);
    const checker = program.getTypeChecker ();
    const result = {};
    for (const f of files) {
        const sf = program.getSourceFile (path.join (root, f));
        result[f] = sf ? checkSourceFile (sf, checker) : [];
    }
    return result;
}

function main (argv) {
    const root = process.cwd ();
    const flags = new Set (argv.filter ((a) => a.startsWith ('--')));
    const given = argv.filter ((a) => !a.startsWith ('--'));
    const all = scopeFiles (root);
    const files = given.length ? given.map ((f) => path.relative (root, path.resolve (f)).split (path.sep).join ('/')) : all;
    const result = checkRepo (root, files);
    const counts = {};
    for (const f of files) {
        if (result[f].length) {
            counts[f] = result[f].length;
        }
    }
    if (flags.has ('--counts')) {
        process.stdout.write (JSON.stringify (counts, null, 2) + '\n');
        return 0;
    }
    const baselinePath = path.join (root, 'eslint-rules', 'baseline', RULE_NAME + '.json');
    const baseline = fs.existsSync (baselinePath) ? JSON.parse (fs.readFileSync (baselinePath, 'utf8')) : {};
    let failed = 0;
    let total = 0;
    for (const f of files) {
        const found = result[f];
        total += found.length;
        const allowed = baseline[f] || 0;
        const over = found.length > allowed;
        if (over) {
            failed++;
            process.stderr.write (`${f}: ${found.length} ${RULE_NAME} findings, baseline ${allowed}\n`);
        }
        if (over || flags.has ('--list')) {
            for (const x of found) {
                process.stdout.write (`${f}:${x.line}:${x.column} ${x.message}\n`);
            }
        }
    }
    process.stderr.write (`${RULE_NAME}: ${total} findings in ${files.length} files, ${failed} over baseline\n`);
    return failed ? 1 : 0;
}

if (process.argv[1] && path.resolve (process.argv[1]) === fileURLToPath (import.meta.url)) {
    process.exitCode = main (process.argv.slice (2));
}
