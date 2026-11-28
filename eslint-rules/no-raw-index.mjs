// no-raw-index: element reads `x['k']` / `x[i]` on values the generators cannot type.
//
// Go, Java, C# and Rust print a native index only when the receiver is a local (or parameter) whose type is
// known to be a dict or a list. Every other element read prints a GetValue / getValue / get_value helper.
//
// Safe (not reported):
//  - writes: `x[k] = v`, `delete x[k]`, `x[k]++` targets (only READS are checked);
//  - receiver is an identifier declared with a dict type (`Dict`, `Dictionary<T>`, `Record<..>`, `{ .. }`, `Market`,
//    `MarketInterface`, `Currency`, `CurrencyInterface`) or initialised from a dict shape (`{}`, `this.safeDict (..)`,
//    `this.extend (..)`, `this.indexBy (..)`, `x as Dict`); any key;
//  - receiver is an identifier declared with a list type (`List`, `T[]`, `Array<T>`) or initialised from a list shape
//    (`[]`, `this.safeList (..)`, `s.split (..)`, `Object.keys (..)`, `x as List`), and the index is either a numeric
//    literal or the counter of an enclosing `for (let i = 0; i < xs.length; i++)` over the same list
//    (also `i < n` where `const n = xs.length`).
// Everything else is reported: untyped locals (`const response = await this.publicGet..`), `this.options['k']`,
// chained reads `a['b']['c']` (the outer read), calls `f ()[0]`, a list indexed by an unproven expression.
//
// Ratchet: findings are counted per file; a file reports only when it has MORE findings than its baseline
// (eslint-rules/baseline/no-raw-index.json, or the `baseline` option).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RULE_NAME = 'no-raw-index';
const here = path.dirname (fileURLToPath (import.meta.url));
let defaultBaseline;

function loadBaseline () {
    if (defaultBaseline === undefined) {
        try {
            defaultBaseline = JSON.parse (fs.readFileSync (path.join (here, 'baseline', RULE_NAME + '.json'), 'utf8'));
        } catch {
            defaultBaseline = {};
        }
    }
    return defaultBaseline;
}

const DICT_TYPES = new Set ([ 'Dict', 'Dictionary', 'Record', 'Market', 'MarketInterface', 'Currency', 'CurrencyInterface' ]);
const LIST_TYPES = new Set ([ 'List', 'Array', 'Strings' ]);
const DICT_CALLS = new Set ([ 'safeDict', 'safeDict2', 'safeDictN', 'extend', 'deepExtend', 'indexBy', 'groupBy', 'omit', 'market', 'currency', 'safeMarket', 'safeCurrency' ]);
const LIST_CALLS = new Set ([ 'safeList', 'safeList2', 'safeListN', 'toArray', 'arrayConcat', 'sortBy', 'filterBy' ]);
// typed Exchange fields: Go/Java/C#/Rust declare them as dicts, so `this.options[k]` prints a native index
const THIS_DICT_FIELDS = new Set ([ 'options', 'urls', 'exceptions', 'fees', 'userAgents', 'has', 'api', 'timeframes', 'precision', 'requiredCredentials', 'headers', 'commonCurrencies', 'features' ]);
const THIS_LIST_FIELDS = new Set ([ 'symbols', 'ids', 'codes' ]);
const LIST_RETURNING = new Set ([ 'marketSymbols', 'marketIds', 'marketCodes', 'getListFromObjectValues' ]);
const SKIP_PATH = /(^|\/)(test|tests|abstract|static_dependencies)\//;

function kindOfType (t) {
    if (!t) {
        return undefined;
    }
    switch (t.type) {
        case 'TSTypeAnnotation': return kindOfType (t.typeAnnotation);
        case 'TSArrayType': case 'TSTupleType': return 'list';
        case 'TSTypeLiteral': return 'dict';
        case 'TSTypeReference': {
            const name = t.typeName.type === 'Identifier' ? t.typeName.name : undefined;
            if (DICT_TYPES.has (name)) {
                return 'dict';
            }
            if (LIST_TYPES.has (name)) {
                return 'list';
            }
            return undefined;
        }
        case 'TSUnionType': {
            // `Dict | undefined` keeps the dict kind; mixed containers do not
            const kinds = new Set (t.types.filter ((x) => x.type !== 'TSUndefinedKeyword' && x.type !== 'TSNullKeyword').map (kindOfType));
            return kinds.size === 1 ? [ ...kinds ][0] : undefined;
        }
        default: return undefined;
    }
}

function kindOfInit (e) {
    if (!e) {
        return undefined;
    }
    switch (e.type) {
        case 'ObjectExpression': return 'dict';
        case 'ArrayExpression': return 'list';
        case 'TSAsExpression': case 'TSTypeAssertion': return kindOfType (e.typeAnnotation);
        case 'AwaitExpression': return kindOfInit (e.argument);
        case 'MemberExpression':
            if (!e.computed && e.object.type === 'ThisExpression' && THIS_LIST_FIELDS.has (e.property.name)) {
                return 'list';
            }
            return undefined;
        case 'CallExpression': {
            const c = e.callee;
            if (c.type !== 'MemberExpression' || c.computed || c.property.type !== 'Identifier') {
                return undefined;
            }
            const m = c.property.name;
            if (c.object.type === 'ThisExpression') {
                if (DICT_CALLS.has (m)) {
                    return 'dict';
                }
                // `const [ a, rest ] = this.handleOptionAndParams (..)` family: the ports destructure the tuple natively
                if (/^handle[A-Z]\w*AndParams\d*$|^handleParam\w+$|^handleUntilOption$/.test (m)) {
                    return 'tuple';
                }
                if (LIST_CALLS.has (m) || LIST_RETURNING.has (m)) {
                    return 'list';
                }
                // typed parsers: parseOrder/parseTradingFee return a structure, parseOrders/parseTrades a list
                if (/^parse[A-Z]\w*$/.test (m) && !/^parse(Number|ToInt|ToNumeric|Json|Date|Timeframe|Precision)/.test (m)) {
                    return m.endsWith ('s') ? 'list' : 'dict';
                }
                return undefined;
            }
            if (m === 'split') {
                return 'list';
            }
            if (c.object.type === 'Identifier' && c.object.name === 'Object' && (m === 'keys' || m === 'values')) {
                return 'list';
            }
            return undefined;
        }
        default: return undefined;
    }
}

function findVariable (scope, name) {
    for (let s = scope; s; s = s.upper) {
        const v = s.set.get (name);
        if (v) {
            return v;
        }
    }
    return undefined;
}

function declaredKind (variable) {
    if (!variable || variable.defs.length !== 1) {
        return undefined;
    }
    const def = variable.defs[0];
    if (def.type === 'Parameter') {
        // def.name is the identifier; its typeAnnotation covers `p: Dict` and `p: Dict = {}`
        return kindOfType (def.name.typeAnnotation);
    }
    if (def.type === 'Variable' && def.node.id === def.name) {
        const typed = kindOfType (def.name.typeAnnotation);
        if (typed) {
            return typed;
        }
        // `let market = undefined; if (..) { market = this.market (symbol); }`: every write must give the same kind
        const kinds = new Set ();
        const init = def.node.init;
        if (init && !isUndefined (init)) {
            kinds.add (kindOfInit (init));
        }
        for (const ref of variable.references) {
            if (ref.isWrite () && ref.writeExpr && ref.writeExpr !== init) {
                if (ref.identifier.parent.type !== 'AssignmentExpression' || ref.identifier.parent.operator !== '=') {
                    return undefined;
                }
                if (!isUndefined (ref.writeExpr)) {
                    kinds.add (kindOfInit (ref.writeExpr));
                }
            }
        }
        return kinds.size === 1 ? [ ...kinds ][0] : undefined;
    }
    return undefined;
}

function isUndefined (e) {
    return (e.type === 'Identifier' && e.name === 'undefined') || (e.type === 'Literal' && e.value === null);
}

// the counter of an enclosing `for (let i = 0; i < list.length; i++)` with list = receiverName
function isLoopBound (node, indexName, receiverName, scope) {
    for (let p = node.parent; p; p = p.parent) {
        if (p.type === 'ForStatement' && p.init && p.init.type === 'VariableDeclaration'
            && p.init.declarations.some ((d) => d.id.type === 'Identifier' && d.id.name === indexName)) {
            const t = p.test;
            if (!t || t.type !== 'BinaryExpression' || (t.operator !== '<' && t.operator !== '<=')
                || t.left.type !== 'Identifier' || t.left.name !== indexName) {
                return false;
            }
            return isLengthOf (t.right, receiverName, scope);
        }
        if (p.type === 'FunctionExpression' || p.type === 'FunctionDeclaration' || p.type === 'ArrowFunctionExpression') {
            return false;
        }
    }
    return false;
}

function isLengthOf (e, receiverName, scope) {
    if (e.type === 'MemberExpression' && !e.computed && e.property.name === 'length') {
        return e.object.type === 'Identifier' && e.object.name === receiverName;
    }
    if (e.type === 'Identifier') {
        const v = findVariable (scope, e.name);
        if (v && v.defs.length === 1 && v.defs[0].type === 'Variable' && v.defs[0].parent.kind === 'const') {
            const init = v.defs[0].node.init;
            return !!init && isLengthOf (init, receiverName, scope);
        }
    }
    return false;
}

function isWriteTarget (node) {
    const p = node.parent;
    if (p.type === 'AssignmentExpression' && p.left === node && p.operator === '=') {
        return true;
    }
    if (p.type === 'UnaryExpression' && p.operator === 'delete') {
        return true;
    }
    // destructuring targets `[ a[k], b ] = ..`
    return p.type === 'ArrayPattern' || (p.type === 'Property' && p.parent.type === 'ObjectPattern' && p.value === node);
}

export default {
    'meta': {
        'type': 'problem',
        'docs': {
            'description': 'disallow element reads x[k] on values not declared as a dict or list (prints GetValue/getValue/get_value)',
        },
        'schema': [
            {
                'type': 'object',
                'properties': {
                    'baseline': { 'type': 'object' },
                },
                'additionalProperties': false,
            },
        ],
        'messages': {
            'dict': 'raw read {{text}}: read with this.safeString / safeInteger / safeDict / safeList (receiver, key) or declare the receiver `: Dict` ({{count}} findings, baseline {{base}}).',
            'list': 'raw read {{text}}: index a declared list only inside `for (let i = 0; i < xs.length; i++)` or read it with this.safeDict / safeString (xs, i) ({{count}} findings, baseline {{base}}).',
        },
    },
    create (context) {
        const filename = (context.filename || context.getFilename ()).split (path.sep).join ('/');
        const relative = path.relative (context.cwd || process.cwd (), filename).split (path.sep).join ('/');
        if (SKIP_PATH.test (relative)) {
            return {};
        }
        const options = context.options[0] || {};
        const baseline = options.baseline || loadBaseline ();
        const source = context.sourceCode || context.getSourceCode ();
        const findings = [];
        return {
            'MemberExpression' (node) {
                if (!node.computed || isWriteTarget (node)) {
                    return;
                }
                const obj = node.object;
                if (obj.type === 'MemberExpression' && !obj.computed && obj.object.type === 'ThisExpression') {
                    if (THIS_DICT_FIELDS.has (obj.property.name)) {
                        return;
                    }
                    if (THIS_LIST_FIELDS.has (obj.property.name) && node.property.type === 'Literal') {
                        return;
                    }
                }
                // `this.handleUntilOption (..)[0]`: typed tuple readers are destructured natively
                if (obj.type === 'CallExpression' && obj.callee.type === 'MemberExpression' && obj.callee.object.type === 'ThisExpression'
                    && !obj.callee.computed && /^handle[A-Z]/.test (obj.callee.property.name)
                    && node.property.type === 'Literal' && typeof node.property.value === 'number') {
                    return;
                }
                if (obj.type === 'Identifier') {
                    const scope = source.getScope ? source.getScope (node) : context.getScope ();
                    const kind = declaredKind (findVariable (scope, obj.name));
                    if (kind === 'dict') {
                        return;
                    }
                    if (kind === 'tuple' && node.property.type === 'Literal' && typeof node.property.value === 'number') {
                        return;
                    }
                    if (kind === 'list') {
                        const idx = node.property;
                        if (idx.type === 'Literal' && typeof idx.value === 'number') {
                            return;
                        }
                        if (idx.type === 'Identifier' && isLoopBound (node, idx.name, obj.name, scope)) {
                            return;
                        }
                        findings.push ({ node, 'messageId': 'list' });
                        return;
                    }
                }
                findings.push ({ node, 'messageId': 'dict' });
            },
            'Program:exit' () {
                const base = baseline[relative] || 0;
                if (findings.length <= base) {
                    return;
                }
                for (const f of findings) {
                    let text = source.getText (f.node);
                    if (text.length > 60) {
                        text = text.slice (0, 57) + '...';
                    }
                    context.report ({ 'node': f.node, 'messageId': f.messageId, 'data': { text, 'count': String (findings.length), 'base': String (base) } });
                }
            },
        };
    },
};
