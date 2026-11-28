// length-in-condition: `x.length` used directly inside an if / while / ternary test or an && / || chain,
// where `x` is not known to be a string. The PHP regex pass prints such a length as strlen(), which throws
// `strlen(): array given` for a list. Store the length in a plain local first: `const n = x.length;`.
import { makeRatchet } from './_ratchet.mjs';

const RULE = 'length-in-condition';
const STRING_TYPES = new Set ([ 'TSStringKeyword', 'TSLiteralType' ]);
const STRING_TYPE_NAMES = new Set ([ 'Str', 'OrderSide', 'OrderType' ]);
const STRING_READERS = /^safe(String|StringLower|StringUpper)(2|N)?$|^safeCurrencyCode$|^safeSymbol$|^(number|amount|price|cost|currency)ToPrecision$|^decimalToPrecision$|^json$|^url[Ee]ncode\w*$|^remove0xPrefix$|^stringToBase16$|^uuid\d*$|^iso8601$/;
// methods that always return a string, whatever the receiver
const STRING_METHODS = new Set ([ 'toLowerCase', 'toUpperCase', 'trim', 'substring', 'replaceAll', 'toString', 'join', 'padStart', 'padEnd' ]);

// credential fields of Exchange, always strings
const THIS_STRING_FIELDS = new Set ([ 'id', 'apiKey', 'secret', 'uid', 'login', 'password', 'twofa', 'privateKey', 'walletAddress', 'token', 'accountId' ]);

function findVariable (scope, name) {
    for (let s = scope; s; s = s.upper) {
        const v = s.set.get (name);
        if (v) {
            return v;
        }
    }
    return undefined;
}

function isStringAnnotation (t) {
    if (!t) {
        return false;
    }
    if (t.type === 'TSTypeAnnotation') {
        return isStringAnnotation (t.typeAnnotation);
    }
    if (STRING_TYPES.has (t.type)) {
        return t.type === 'TSStringKeyword' || typeof t.literal?.value === 'string';
    }
    if (t.type === 'TSTypeReference' && t.typeName.type === 'Identifier') {
        return STRING_TYPE_NAMES.has (t.typeName.name);
    }
    if (t.type === 'TSUnionType') {
        const rest = t.types.filter ((x) => x.type !== 'TSUndefinedKeyword' && x.type !== 'TSNullKeyword');
        return rest.length > 0 && rest.every (isStringAnnotation);
    }
    return false;
}

function isStringExpression (e, scope, seen) {
    if (!e) {
        return false;
    }
    switch (e.type) {
        case 'Literal': return typeof e.value === 'string';
        case 'TemplateLiteral': return true;
        case 'TSAsExpression': case 'TSTypeAssertion': return isStringAnnotation (e.typeAnnotation);
        case 'TSNonNullExpression': return isStringExpression (e.expression, scope, seen);
        case 'BinaryExpression':
            return e.operator === '+' && (isStringExpression (e.left, scope, seen) || isStringExpression (e.right, scope, seen));
        case 'MemberExpression':
            return !e.computed && e.object.type === 'ThisExpression' && THIS_STRING_FIELDS.has (e.property.name);
        case 'Identifier': return isStringIdentifier (e.name, scope, seen);
        case 'CallExpression': {
            const c = e.callee;
            if (c.type !== 'MemberExpression' || c.computed || c.property.type !== 'Identifier') {
                return false;
            }
            if (c.object.type === 'ThisExpression') {
                return STRING_READERS.test (c.property.name);
            }
            return STRING_METHODS.has (c.property.name);
        }
        default: return false;
    }
}

// a name whose every definition and write is a string
function isStringIdentifier (name, scope, seen) {
    const v = findVariable (scope, name);
    if (!v || v.defs.length !== 1 || seen.has (v)) {
        return false;
    }
    seen.add (v);
    const def = v.defs[0];
    if (def.type === 'Parameter') {
        return isStringAnnotation (def.name.typeAnnotation);
    }
    if (def.type !== 'Variable' || def.node.id !== def.name) {
        return false;
    }
    if (isStringAnnotation (def.name.typeAnnotation)) {
        return true;
    }
    const init = def.node.init;
    if (!init || !isStringExpression (init, scope, seen)) {
        return false;
    }
    const isUndefined = (x) => x && x.type === 'Identifier' && x.name === 'undefined';
    return v.references.every ((r) => !r.isWrite () || r.writeExpr === init || isUndefined (r.writeExpr) || isStringExpression (r.writeExpr, scope, seen));
}

// the .length sits in a condition: only parentheses, unary, binary and logical nodes up to an
// if / while / do-while / ternary test, or any && / || on the way
function inCondition (node) {
    let child = node;
    for (let p = node.parent; p; child = p, p = p.parent) {
        if (p.type === 'LogicalExpression' && (p.operator === '&&' || p.operator === '||')) {
            return true;
        }
        if ((p.type === 'IfStatement' || p.type === 'WhileStatement' || p.type === 'DoWhileStatement' || p.type === 'ConditionalExpression') && p.test === child) {
            return true;
        }
        if (p.type !== 'BinaryExpression' && p.type !== 'UnaryExpression' && p.type !== 'TSNonNullExpression') {
            return false;
        }
    }
    return false;
}

export default {
    'meta': {
        'type': 'problem',
        'docs': {
            'description': 'store the .length of a non-string value in a plain local before using it in an if / while / ternary test or an && / || chain',
        },
        'schema': [],
        'messages': {
            'lengthInCondition': '{{name}}.length inside a condition prints strlen () in PHP when {{name}} is a list: store it in a plain local first (const n = {{name}}.length;).',
        },
    },
    create (context) {
        const ratchet = makeRatchet (RULE, context);
        const sourceCode = context.sourceCode || context.getSourceCode ();
        return {
            MemberExpression (node) {
                if (node.computed || node.property.type !== 'Identifier' || node.property.name !== 'length') {
                    return;
                }
                if (!inCondition (node)) {
                    return;
                }
                // Object.keys (x).length has its own PHP rule that prints count ()
                const o = node.object;
                if (o.type === 'CallExpression' && o.callee.type === 'MemberExpression' && o.callee.object.type === 'Identifier'
                    && o.callee.object.name === 'Object' && o.callee.property.name === 'keys') {
                    return;
                }
                const scope = sourceCode.getScope ? sourceCode.getScope (node) : context.getScope ();
                if (isStringExpression (node.object, scope, new Set ())) {
                    return;
                }
                ratchet.add (node, 'lengthInCondition', { 'name': sourceCode.getText (node.object) });
            },
            'Program:exit' () {
                ratchet.flush ();
            },
        };
    },
};
