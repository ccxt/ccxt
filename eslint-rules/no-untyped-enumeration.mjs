// no-untyped-enumeration: Object.keys / Object.values / .length must run on a value whose dict / list type is known,
// and a method returning an ad-hoc array of mixed values must declare a tuple return type.
// Untyped receivers print ObjectKeys(x) / ObjectValues(x) / GetArrayLength(x) in Go, getArrayLength in C#, and an
// undeclared tuple is read back slot by slot through GetValue (x, 0) in Go / Java / C#.
// Ratchet: findings are counted per file and reported only when the file has MORE than eslint-rules/baseline/<rule>.json.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RULE = 'no-untyped-enumeration';
const here = dirname (fileURLToPath (import.meta.url));
const repoRoot = dirname (here);
let baselineCache = undefined;

function loadBaseline () {
    if (baselineCache === undefined) {
        const file = join (here, 'baseline', RULE + '.json');
        baselineCache = existsSync (file) ? JSON.parse (readFileSync (file, 'utf8')) : {};
    }
    return baselineCache;
}

// declared type names that are a concrete dict or list (types.ts) or a string (for .length)
const DICT_NAMES = new Set ([ 'Dict', 'NullableDict', 'Dictionary', 'Record', 'Object' ]);
const LIST_NAMES = new Set ([ 'List', 'NullableList', 'Strings', 'Array', 'ReadonlyArray', 'OHLCV', 'OHLCVC' ]);
const STRING_NAMES = new Set ([ 'Str', 'NetworkCode' ]);
// this.<reader> (...) calls whose result type is a concrete dict, list or string
const DICT_READERS = new Set ([ 'safeDict', 'safeDict2', 'safeDictN', 'indexBy', 'groupBy', 'extend', 'deepExtend', 'omit', 'keysort', 'ordered', 'safeBalance', 'parseBalance' ]);
const LIST_READERS = new Set ([ 'safeList', 'safeList2', 'safeListN', 'toArray', 'sortBy', 'sortBy2', 'filterBy', 'filterByArray', 'arrayConcat', 'marketSymbols', 'marketIds', 'parseTrades', 'parseOrders', 'parseOHLCVs', 'parseLedger', 'parseTransactions', 'filterBySymbolSinceLimit', 'filterBySinceLimit', 'filterByValueSinceLimit', 'aggregate', 'parseBidsAsks' ]);
const STRING_READERS = new Set ([ 'safeString', 'safeString2', 'safeStringN', 'safeStringLower', 'safeStringUpper', 'safeStringLower2', 'safeStringUpper2', 'json', 'urlencode', 'rawencode', 'encode', 'hmac', 'hash', 'stringToBase64', 'binaryToBase64', 'numberToString', 'decimalToPrecision', 'uuid', 'uuid22', 'uuid16', 'iso8601', 'ymdhms', 'yyyymmdd', 'implodeParams', 'safeCurrencyCode', 'safeSymbol' ]);
const STRING_METHODS = new Set ([ 'toString', 'slice', 'substring', 'substr', 'toUpperCase', 'toLowerCase', 'trim', 'replace', 'replaceAll', 'padStart', 'padEnd', 'concat' ]);

function unwrapType (t) {
    // T | undefined, Promise<T>
    if (t === undefined || t === null) {
        return undefined;
    }
    if (t.type === 'TSTypeAnnotation') {
        return unwrapType (t.typeAnnotation);
    }
    if (t.type === 'TSUnionType') {
        const rest = t.types.filter ((x) => x.type !== 'TSUndefinedKeyword' && x.type !== 'TSNullKeyword');
        return rest.length === 1 ? unwrapType (rest[0]) : t;
    }
    return t;
}

function typeName (t) {
    if (t.type === 'TSTypeReference' && t.typeName.type === 'Identifier') {
        return t.typeName.name;
    }
    return undefined;
}

// 'dict' | 'list' | 'string' | 'tuple' | undefined for a type annotation
function kindOfType (annotation) {
    const t = unwrapType (annotation);
    if (t === undefined) {
        return undefined;
    }
    if (t.type === 'TSArrayType') {
        return 'list';
    }
    if (t.type === 'TSTupleType') {
        return 'tuple';
    }
    if (t.type === 'TSStringKeyword') {
        return 'string';
    }
    if (t.type === 'TSTypeLiteral') {
        return 'dict';
    }
    const name = typeName (t);
    if (name === undefined) {
        return undefined;
    }
    if (DICT_NAMES.has (name)) {
        return 'dict';
    }
    if (LIST_NAMES.has (name)) {
        return 'list';
    }
    if (STRING_NAMES.has (name)) {
        return 'string';
    }
    return undefined;
}

function calleeMethod (node) {
    if (node.type !== 'CallExpression' || node.callee.type !== 'MemberExpression' || node.callee.computed || node.callee.property.type !== 'Identifier') {
        return undefined;
    }
    return node.callee.property.name;
}

function isObjectCall (node, names) {
    return node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && !node.callee.computed &&
        node.callee.object.type === 'Identifier' && node.callee.object.name === 'Object' &&
        node.callee.property.type === 'Identifier' && names.includes (node.callee.property.name);
}

function isThisCall (node) {
    return node.type === 'CallExpression' && node.callee.type === 'MemberExpression' &&
        (node.callee.object.type === 'ThisExpression' || node.callee.object.type === 'Super');
}

// kind of an expression known without a type checker (literals, typed readers, typed locals)
function kindOfExpression (node, context, seen) {
    if (node === undefined || node === null) {
        return undefined;
    }
    switch (node.type) {
    case 'ObjectExpression':
        return 'dict';
    case 'ArrayExpression':
        return 'list';
    case 'TemplateLiteral':
        return 'string';
    case 'Literal':
        if (typeof node.value === 'string') {
            return 'string';
        }
        if (typeof node.value === 'number') {
            return 'number';
        }
        if (typeof node.value === 'boolean') {
            return 'boolean';
        }
        return node.value === null ? 'undefined' : undefined;
    case 'AwaitExpression':
        return kindOfExpression (node.argument, context, seen);
    case 'TSNonNullExpression':
        return kindOfExpression (node.expression, context, seen);
    case 'BinaryExpression':
        if ([ '===', '!==', '==', '!=', '<', '>', '<=', '>=', 'in', 'instanceof' ].includes (node.operator)) {
            return 'boolean';
        }
        if (node.operator === '+') {
            const l = kindOfExpression (node.left, context, seen);
            const r = kindOfExpression (node.right, context, seen);
            if (l === 'string' || r === 'string') {
                return 'string';
            }
            return (l === 'number' && r === 'number') ? 'number' : undefined;
        }
        return 'number';
    case 'UnaryExpression':
        if (node.operator === '!') {
            return 'boolean';
        }
        if (node.operator === 'typeof') {
            return 'string';
        }
        return node.operator === 'void' ? 'undefined' : 'number';
    case 'Identifier':
        if (node.name === 'undefined') {
            return 'undefined';
        }
        return kindOfIdentifier (node, context, seen);
    case 'CallExpression': {
        if (isObjectCall (node, [ 'keys', 'values', 'entries', 'getOwnPropertyNames' ])) {
            return 'list';
        }
        if (isObjectCall (node, [ 'assign' ])) {
            return 'dict';
        }
        const method = calleeMethod (node);
        if (method === undefined) {
            return undefined;
        }
        if (isThisCall (node)) {
            if (DICT_READERS.has (method)) {
                return 'dict';
            }
            if (LIST_READERS.has (method)) {
                return 'list';
            }
            if (STRING_READERS.has (method)) {
                return 'string';
            }
            return undefined;
        }
        if (method === 'split' || method === 'map' || method === 'filter') {
            return 'list';
        }
        if (method === 'join') {
            return 'string';
        }
        if (STRING_METHODS.has (method) && kindOfExpression (node.callee.object, context, seen) === 'string') {
            return 'string';
        }
        if (method === 'slice' || method === 'concat') {
            return kindOfExpression (node.callee.object, context, seen) === 'list' ? 'list' : undefined;
        }
        return undefined;
    }
    default:
        // casts (x as List) are deliberately unknown: a cast at the read site is not a typed value
        return undefined;
    }
}

function findVariable (node, context) {
    let scope = context.sourceCode.getScope (node);
    while (scope) {
        const v = scope.set.get (node.name);
        if (v !== undefined) {
            return v;
        }
        scope = scope.upper;
    }
    return undefined;
}

function kindOfIdentifier (node, context, seen) {
    const variable = findVariable (node, context);
    if (variable === undefined || variable.defs.length === 0) {
        return undefined;
    }
    const def = variable.defs[0];
    if (def.type === 'Variable') {
        const decl = def.node; // VariableDeclarator
        if (decl.id.type !== 'Identifier') {
            return undefined; // destructured tuple slot: kind unknown
        }
        const declared = kindOfType (decl.id.typeAnnotation);
        if (declared !== undefined) {
            return declared;
        }
        if (decl.id.typeAnnotation !== undefined) {
            return undefined; // declared, but not a concrete dict / list (any, Market, ...)
        }
        // untyped local: TypeScript infers it from a const initializer only
        if (def.parent.kind !== 'const' || seen.has (variable)) {
            return undefined;
        }
        seen.add (variable);
        return kindOfExpression (decl.init, context, seen);
    }
    if (def.type === 'Parameter') {
        const id = def.name;
        const declared = kindOfType (id.typeAnnotation);
        if (declared !== undefined) {
            return declared;
        }
        if (id.typeAnnotation === undefined && id.parent && id.parent.type === 'AssignmentPattern' && id.parent.left === id) {
            const d = kindOfExpression (id.parent.right, context, seen);
            return (d === 'dict' || d === 'list' || d === 'string') ? d : undefined;
        }
    }
    return undefined;
}

function returnTypeOf (fn) {
    const t = unwrapType (fn.returnType);
    if (t === undefined) {
        return undefined;
    }
    if (typeName (t) === 'Promise' && t.typeArguments && t.typeArguments.params.length === 1) {
        return unwrapType (t.typeArguments.params[0]);
    }
    return t;
}

function enclosingFunction (node) {
    let p = node.parent;
    while (p) {
        if (p.type === 'FunctionExpression' || p.type === 'FunctionDeclaration' || p.type === 'ArrowFunctionExpression') {
            return p;
        }
        p = p.parent;
    }
    return undefined;
}

export default {
    'meta': {
        'type': 'problem',
        'docs': {
            'description': 'disallow Object.keys / Object.values / .length on untyped values and undeclared mixed tuple returns',
        },
        'schema': [],
        'messages': {
            'enumerate': 'Object.{{name}} on an untyped value: read it into a local first (const x: Dict = this.safeDict (response, \'k\', {})) and enumerate that.',
            'length': '.length on an untyped value: read it into a typed local first (const rows: Dict[] = this.safeList (response, \'k\', [])) and use rows.length.',
            'tuple': 'Array literal of mixed values returned without a declared tuple type: declare the return type (e.g. [Str, Dict]) or return a Dict.',
        },
    },
    create (context) {
        const findings = [];
        const add = (node, messageId, data) => findings.push ({ node, messageId, data });
        const isTyped = (node) => {
            const k = kindOfExpression (node, context, new Set ());
            return k === 'dict' || k === 'list' || k === 'string' || k === 'tuple';
        };
        return {
            CallExpression (node) {
                if (isObjectCall (node, [ 'keys', 'values' ]) && node.arguments.length === 1) {
                    const k = kindOfExpression (node.arguments[0], context, new Set ());
                    if (k !== 'dict' && k !== 'list') {
                        add (node, 'enumerate', { 'name': node.callee.property.name });
                    }
                }
            },
            MemberExpression (node) {
                if (node.computed || node.property.type !== 'Identifier' || node.property.name !== 'length') {
                    return;
                }
                if (node.parent.type === 'AssignmentExpression' && node.parent.left === node) {
                    return;
                }
                if (!isTyped (node.object)) {
                    add (node, 'length', {});
                }
            },
            ReturnStatement (node) {
                const arr = node.argument;
                if (!arr || arr.type !== 'ArrayExpression' || arr.elements.length < 2) {
                    return;
                }
                const fn = enclosingFunction (node);
                if (fn === undefined || fn.type === 'ArrowFunctionExpression' || fn.parent.type !== 'MethodDefinition') {
                    return;
                }
                const rt = returnTypeOf (fn);
                if (rt !== undefined && (rt.type === 'TSTupleType' || rt.type === 'TSArrayType' || LIST_NAMES.has (typeName (rt)))) {
                    return; // declared tuple, or a declared homogeneous list
                }
                const kinds = new Set ();
                let unknown = false;
                for (const el of arr.elements) {
                    const k = el ? kindOfExpression (el, context, new Set ()) : undefined;
                    if (k === undefined) {
                        unknown = true;
                    } else if (k !== 'undefined') {
                        kinds.add (k);
                    }
                }
                if (kinds.size > 1 || (unknown && kinds.size > 0)) {
                    add (arr, 'tuple', {});
                }
            },
            'Program:exit' () {
                const ignoreBaseline = process.env.CCXT_SAFE_NO_BASELINE === '1';
                const file = relative (repoRoot, context.filename).split (sep).join ('/');
                const allowed = ignoreBaseline ? 0 : (loadBaseline ()[file] || 0);
                if (findings.length <= allowed) {
                    return;
                }
                for (const f of findings) {
                    context.report ({ 'node': f.node, 'messageId': f.messageId, 'data': f.data });
                }
            },
        };
    },
};
