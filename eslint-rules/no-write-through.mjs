// no-write-through: rejects write and membership shapes that the generators print as
// AddElementToObject / addElementToObject / add_element_to_object and InOp helper calls.
//
// Reported:
//   1. nested element writes  a[b][c] = v  (and deeper, any assignment operator, ++/--)
//   2. element writes  x[k] = v  where x is not a local declared `Dict` or a declared list
//   3. `k in x` where x is not a local declared `Dict`
//   4. `delete x[k]`
//
// Ratchet: findings are counted per file and reported only when a file has MORE findings
// than its entry in baseline/no-write-through.json (missing entry = 0). Option
// `{ ratchet: false }` reports every finding (used by the tests).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname (fileURLToPath (import.meta.url));
const repoRoot = path.resolve (here, '..');
const baselineFile = path.join (here, 'baseline', 'no-write-through.json');

let baselineCache = undefined;
function loadBaseline () {
    if (baselineCache === undefined) {
        try {
            baselineCache = JSON.parse (fs.readFileSync (baselineFile, 'utf8'));
        } catch {
            baselineCache = {};
        }
    }
    return baselineCache;
}

const DICT_NAMES = new Set ([ 'Dict', 'Dictionary' ]);
const LIST_NAMES = new Set ([ 'List', 'Strings', 'Array', 'IndexType', 'ReadonlyArray' ]);

function typeName (typeNode) {
    if (typeNode && typeNode.type === 'TSTypeReference' && typeNode.typeName.type === 'Identifier') {
        return typeNode.typeName.name;
    }
    return undefined;
}

function isDictType (typeNode) {
    return DICT_NAMES.has (typeName (typeNode));
}

function isListType (typeNode) {
    if (!typeNode) {
        return false;
    }
    if (typeNode.type === 'TSArrayType' || typeNode.type === 'TSTupleType') {
        return true;
    }
    return LIST_NAMES.has (typeName (typeNode));
}

// type annotation written at the declaration of a local variable or parameter, or undefined
function declaredType (context, identifier) {
    const sourceCode = context.sourceCode || context.getSourceCode ();
    let scope = sourceCode.getScope ? sourceCode.getScope (identifier) : context.getScope ();
    while (scope) {
        const variable = scope.set.get (identifier.name);
        if (variable) {
            for (const def of variable.defs) {
                let id = def.name;
                if (def.type === 'Variable' && def.node.id === id && id.typeAnnotation) {
                    return id.typeAnnotation.typeAnnotation;
                }
                if (def.type === 'Parameter') {
                    // `params: Dict = {}` parses as AssignmentPattern whose left is the identifier
                    if (id.typeAnnotation) {
                        return id.typeAnnotation.typeAnnotation;
                    }
                    const parent = id.parent;
                    if (parent && parent.type === 'AssignmentPattern' && parent.left.typeAnnotation) {
                        return parent.left.typeAnnotation.typeAnnotation;
                    }
                }
            }
            return undefined;
        }
        scope = scope.upper;
    }
    return undefined;
}

function isDeclaredDict (context, node) {
    return node.type === 'Identifier' && isDictType (declaredType (context, node));
}

function isDeclaredDictOrList (context, node) {
    if (node.type !== 'Identifier') {
        return false;
    }
    const t = declaredType (context, node);
    return isDictType (t) || isListType (t);
}

function unwrap (node) {
    while (node && (node.type === 'TSNonNullExpression' || node.type === 'TSAsExpression' || node.type === 'ChainExpression')) {
        node = node.expression;
    }
    return node;
}

export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow nested element writes, element writes and `in` on undeclared values, and `delete` (they print AddElementToObject / InOp helpers)',
        },
        schema: [
            {
                type: 'object',
                properties: { ratchet: { type: 'boolean' } },
                additionalProperties: false,
            },
        ],
        messages: {
            nested: 'Nested write-through `a[b][c] = v`: build the inner dict in a local `const inner: Dict = ...`, set `inner[c] = v`, then store `a[b] = inner`.',
            untypedWrite: 'Element write on `{{name}}`, which is not a local declared `Dict` or list: copy into a local `const x: Dict = ...` (or `const rows: Dict[] = []`) and write to that.',
            untypedIn: '`in` on `{{name}}`, which is not a local declared `Dict`: read it with a base reader (`this.safeString (x, key)`) and test `!== undefined`, or declare the local `: Dict`.',
            deleteOp: '`delete x[k]`: build a new `Dict` without the key, or use `this.omit (x, k)`.',
            overBaseline: '{{detail}} ({{count}} findings in this file, baseline {{baseline}}).',
        },
    },
    create (context) {
        const options = context.options[0] || {};
        const ratchet = options.ratchet !== false;
        const sourceCode = context.sourceCode || context.getSourceCode ();
        const findings = [];

        function add (node, messageId, data = {}) {
            findings.push ({ node, messageId, data });
        }

        function checkTarget (target) {
            target = unwrap (target);
            if (!target || target.type !== 'MemberExpression' || !target.computed) {
                return;
            }
            const object = unwrap (target.object);
            if (object.type === 'MemberExpression' && object.computed) {
                add (target, 'nested');
                return;
            }
            if (!isDeclaredDictOrList (context, object)) {
                add (target, 'untypedWrite', { name: sourceCode.getText (object) });
            }
        }

        return {
            AssignmentExpression (node) {
                checkTarget (node.left);
            },
            UpdateExpression (node) {
                checkTarget (node.argument);
            },
            BinaryExpression (node) {
                if (node.operator !== 'in') {
                    return;
                }
                const right = unwrap (node.right);
                if (!isDeclaredDict (context, right)) {
                    add (node, 'untypedIn', { name: sourceCode.getText (right) });
                }
            },
            UnaryExpression (node) {
                if (node.operator === 'delete') {
                    add (node, 'deleteOp');
                }
            },
            'Program:exit' () {
                if (!ratchet) {
                    for (const f of findings) {
                        context.report (f);
                    }
                    return;
                }
                const file = path.relative (repoRoot, context.filename || context.getFilename ()).split (path.sep).join ('/');
                const baseline = loadBaseline ()[file] || 0;
                if (findings.length <= baseline) {
                    return;
                }
                for (const f of findings) {
                    const detail = Object.entries (f.data).reduce ((s, [ k, v ]) => s.split ('{{' + k + '}}').join (v), MESSAGES[f.messageId]);
                    context.report ({ node: f.node, messageId: 'overBaseline', data: { detail, count: String (findings.length), baseline: String (baseline) } });
                }
            },
        };
    },
};

const MESSAGES = {
    nested: 'Nested write-through `a[b][c] = v`: build the inner dict in a local `const inner: Dict = ...`, set `inner[c] = v`, then store `a[b] = inner`',
    untypedWrite: 'Element write on `{{name}}`, which is not a local declared `Dict` or list: copy into a local `const x: Dict = ...` (or `const rows: Dict[] = []`) and write to that',
    untypedIn: '`in` on `{{name}}`, which is not a local declared `Dict`: read it with a base reader (`this.safeString (x, key)`) and test `!== undefined`, or declare the local `: Dict`',
    deleteOp: '`delete x[k]`: build a new `Dict` without the key, or use `this.omit (x, k)`',
};
