// ternary-placement: a conditional expression in a place the generators cannot
// lower to a plain statement prints an inline closure (Go `func() any {...}()`,
// Java switch/ternary blobs, Rust match blobs, C# cast blobs).
// Flagged placements:
//   - property value of an object literal      { 'k': c ? a : b }
//   - argument of a call / new expression      f (c ? a : b)
//   - element of an array literal              [ c ? a : b ]
//   - return value whose arms have different kinds   return c ? 'x' : undefined
//   - nested inside another conditional        c ? (d ? a : b) : e
// Ratchet: findings are counted per file and reported only when a file has more
// than its entry in baseline/ternary-placement.json (missing entry = 0).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RULE = 'ternary-placement';
const here = path.dirname (fileURLToPath (import.meta.url));
let baselineCache;
function loadBaseline () {
    if (baselineCache === undefined) {
        try {
            baselineCache = JSON.parse (fs.readFileSync (path.join (here, 'baseline', RULE + '.json'), 'utf8'));
        } catch (e) {
            baselineCache = {};
        }
    }
    return baselineCache;
}

// ts/src/*.ts, ts/src/pro/*.ts, ts/src/prediction/*.ts, base/Exchange.ts, base/PredictionExchange.ts
export function scopeKey (filename) {
    const norm = filename.split (path.sep).join ('/');
    const idx = norm.lastIndexOf ('ts/src/');
    if (idx < 0) {
        return undefined;
    }
    const rel = norm.slice (idx);
    if (/^ts\/src\/(pro\/|prediction\/)?[^/]+\.ts$/.test (rel) || rel === 'ts/src/base/Exchange.ts' || rel === 'ts/src/base/PredictionExchange.ts') {
        return rel;
    }
    return undefined;
}

function unwrap (node) {
    // skip TS wrappers that do not change placement: (x as T), x!, <T>x
    while (node && (node.type === 'TSAsExpression' || node.type === 'TSNonNullExpression' || node.type === 'TSTypeAssertion' || node.type === 'TSSatisfiesExpression')) {
        node = node.expression;
    }
    return node;
}

function outerParent (node) {
    let child = node;
    let parent = node.parent;
    while (parent && (parent.type === 'TSAsExpression' || parent.type === 'TSNonNullExpression' || parent.type === 'TSTypeAssertion' || parent.type === 'TSSatisfiesExpression')) {
        child = parent;
        parent = parent.parent;
    }
    return { child, parent };
}

// kind of a ternary arm; undefined = unknown (not compared)
function armKind (node) {
    node = unwrap (node);
    if (!node) {
        return undefined;
    }
    switch (node.type) {
        case 'Literal':
            if (node.value === null) {
                return 'absent';
            }
            if (node.regex) {
                return 'regex';
            }
            return typeof node.value; // string | number | boolean | bigint
        case 'TemplateLiteral':
            return 'string';
        case 'Identifier':
            return node.name === 'undefined' ? 'absent' : undefined;
        case 'UnaryExpression':
            if (node.operator === '-' || node.operator === '+') {
                return armKind (node.argument) === 'number' ? 'number' : undefined;
            }
            if (node.operator === '!') {
                return 'boolean';
            }
            if (node.operator === 'void') {
                return 'absent';
            }
            return undefined;
        case 'ObjectExpression':
            return 'dict';
        case 'ArrayExpression':
            return 'list';
        case 'ArrowFunctionExpression':
        case 'FunctionExpression':
            return 'function';
        case 'BinaryExpression':
            if ([ '===', '!==', '==', '!=', '<', '>', '<=', '>=', 'in', 'instanceof' ].includes (node.operator)) {
                return 'boolean';
            }
            return undefined;
        default:
            return undefined;
    }
}

const MESSAGES = {
    property: 'Ternary as an object-literal value prints an inline closure; assign it with if / else into a typed local first, then use the local.',
    argument: 'Ternary as a call argument prints an inline closure; assign it with if / else into a typed local first, then pass the local.',
    element: 'Ternary as an array element prints an inline closure; assign it with if / else into a typed local first, then use the local.',
    returnMixed: 'Ternary returned with arms of different kinds ({{a}} / {{b}}) prints an any-typed closure; return from each branch of an if / else instead.',
    nested: 'Nested ternary prints a closure inside a closure; write an if / else if / else chain into a typed local.',
};

export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow conditional expressions in placements the generators print as inline closures (ratcheted per file).',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    baseline: { type: 'object', additionalProperties: { type: 'integer' } },
                    ignoreScope: { type: 'boolean' },
                },
                additionalProperties: false,
            },
        ],
        messages: MESSAGES,
    },
    create (context) {
        const options = context.options[0] || {};
        const filename = context.filename || context.getFilename ();
        const key = scopeKey (filename);
        if (key === undefined && !options.ignoreScope) {
            return {};
        }
        const baseline = options.baseline || loadBaseline ();
        const allowed = (key !== undefined && baseline[key] !== undefined) ? baseline[key] : 0;
        const findings = [];
        return {
            ConditionalExpression (node) {
                const { child, parent } = outerParent (node);
                if (!parent) {
                    return;
                }
                if (parent.type === 'ConditionalExpression') {
                    findings.push ({ node, messageId: 'nested' });
                    return;
                }
                if (parent.type === 'Property' && parent.value === child && parent.parent && parent.parent.type === 'ObjectExpression') {
                    findings.push ({ node, messageId: 'property' });
                    return;
                }
                if ((parent.type === 'CallExpression' || parent.type === 'NewExpression') && parent.arguments.includes (child)) {
                    findings.push ({ node, messageId: 'argument' });
                    return;
                }
                if (parent.type === 'ArrayExpression' && parent.elements.includes (child)) {
                    findings.push ({ node, messageId: 'element' });
                    return;
                }
                if ((parent.type === 'ReturnStatement' && parent.argument === child) || (parent.type === 'ArrowFunctionExpression' && parent.body === child)) {
                    const a = armKind (node.consequent);
                    const b = armKind (node.alternate);
                    if (a !== undefined && b !== undefined && a !== b) {
                        findings.push ({ node, messageId: 'returnMixed', data: { a, b } });
                    }
                }
            },
            'Program:exit' () {
                if (findings.length > allowed) {
                    for (const f of findings) {
                        const data = Object.assign ({}, f.data || {});
                        context.report ({ node: f.node, messageId: f.messageId, data });
                    }
                }
            },
        };
    },
};
