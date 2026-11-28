// safe-reader-default: reports a this.safeString / safeInteger / safeNumber read with no default whose result
// is used in `+`, an ordering compare (< > <= >=) or a string method without a `!== undefined` test of that local,
// or that seeds a local declared `string` / `number`.
// The value may be undefined, so the Go / Java / C# / Rust generators print Add / IsLessThan / Split ... helper calls.
import { makeRatchet } from './_ratchet.mjs';

const RULE = 'safe-reader-default';
const READERS = new Set ([ 'safeString', 'safeInteger', 'safeNumber' ]);
const OPERATORS = new Set ([ '+', '+=', '<', '>', '<=', '>=' ]);
const STRING_METHODS = new Set ([
    'split', 'indexOf', 'lastIndexOf', 'slice', 'substring', 'replace', 'replaceAll',
    'toLowerCase', 'toUpperCase', 'startsWith', 'endsWith', 'includes', 'trim',
]);

// this.safeString (x, 'k') with exactly two arguments, or undefined
function readerName (node) {
    if (!node || node.type !== 'CallExpression' || node.arguments.length !== 2) {
        return undefined;
    }
    const callee = node.callee;
    if (callee.type !== 'MemberExpression' || callee.computed || callee.object.type !== 'ThisExpression') {
        return undefined;
    }
    return READERS.has (callee.property.name) ? callee.property.name : undefined;
}

// how `node` (a value) is used by its parent: an operator / method name, or undefined when harmless
function unsafeUse (node) {
    const parent = node.parent;
    if (parent.type === 'BinaryExpression' && OPERATORS.has (parent.operator)) {
        return parent.operator;
    }
    if (parent.type === 'AssignmentExpression' && parent.operator === '+=' && parent.right === node) {
        return '+=';
    }
    if (parent.type === 'MemberExpression' && parent.object === node && !parent.computed
        && STRING_METHODS.has (parent.property.name) && parent.parent.type === 'CallExpression' && parent.parent.callee === parent) {
        return '.' + parent.property.name + ' ()';
    }
    return undefined;
}

function isTest (node, name, operator) {
    if (node.type !== 'BinaryExpression' || (node.operator !== operator && node.operator !== operator.slice (0, 2))) {
        return false;
    }
    const isName = (n) => n.type === 'Identifier' && n.name === name;
    const isUndef = (n) => (n.type === 'Identifier' && n.name === 'undefined') || (n.type === 'Literal' && n.value === null);
    return (isName (node.left) && isUndef (node.right)) || (isName (node.right) && isUndef (node.left));
}

// `a !== undefined` somewhere in an && chain (positive) / || chain (negative)
function chainHasTest (node, name, operator, joiner) {
    if (node.type === 'LogicalExpression' && node.operator === joiner) {
        return chainHasTest (node.left, name, operator, joiner) || chainHasTest (node.right, name, operator, joiner);
    }
    return isTest (node, name, operator);
}

function exits (statement) {
    if (statement.type === 'ReturnStatement' || statement.type === 'ThrowStatement') {
        return true;
    }
    if (statement.type === 'BlockStatement' && statement.body.length > 0) {
        return exits (statement.body[statement.body.length - 1]);
    }
    return false;
}

function guarded (node, name) {
    let child = node;
    for (let p = node.parent; p; child = p, p = p.parent) {
        if (p.type === 'IfStatement' || p.type === 'ConditionalExpression') {
            if (p.consequent === child && chainHasTest (p.test, name, '!==', '&&')) {
                return true;
            }
            if (p.alternate === child && chainHasTest (p.test, name, '===', '||')) {
                return true;
            }
        }
        if (p.type === 'LogicalExpression' && p.right === child) {
            if (p.operator === '&&' && chainHasTest (p.left, name, '!==', '&&')) {
                return true;
            }
            if (p.operator === '||' && chainHasTest (p.left, name, '===', '||')) {
                return true;
            }
        }
        // an earlier `if (x === undefined) { return / throw }` in the same block
        if ((p.type === 'BlockStatement' || p.type === 'Program') && Array.isArray (p.body)) {
            for (const statement of p.body) {
                if (statement === child) {
                    break;
                }
                if (statement.type === 'IfStatement' && !statement.alternate && exits (statement.consequent)
                    && chainHasTest (statement.test, name, '===', '||')) {
                    return true;
                }
            }
        }
        if (p.type === 'FunctionDeclaration' || p.type === 'FunctionExpression' || p.type === 'ArrowFunctionExpression') {
            return false;
        }
    }
    return false;
}

export default {
    'meta': {
        'type': 'problem',
        'docs': {
            'description': 'require a default (or a !== undefined test) on safeString / safeInteger / safeNumber reads used in + / < / string methods',
        },
        'schema': [],
        'messages': {
            'noDefault': 'this.{{reader}} result is used in {{use}} but may be undefined: give the read a default (this.{{reader}} (x, \'k\', \'\' or 0)) or test !== undefined first.',
        },
    },
    create (context) {
        const ratchet = makeRatchet (RULE, context);
        const sourceCode = context.sourceCode || context.getSourceCode ();
        return {
            CallExpression (node) {
                const reader = readerName (node);
                if (reader === undefined) {
                    return;
                }
                const use = unsafeUse (node);
                if (use !== undefined) {
                    ratchet.add (node, 'noDefault', { reader, use });
                }
            },
            VariableDeclarator (node) {
                const reader = readerName (node.init);
                if (reader === undefined || node.id.type !== 'Identifier') {
                    return;
                }
                // `const s: string = this.safeString (x, k)`: the reader returns Str / Int / Num, so tsc fails (TS2322)
                const declared = node.id.typeAnnotation && node.id.typeAnnotation.typeAnnotation;
                if (declared && (declared.type === 'TSStringKeyword' || declared.type === 'TSNumberKeyword')) {
                    ratchet.add (node.init, 'noDefault', { reader, 'use': 'a ' + sourceCode.getText (declared) + ' local' });
                    return;
                }
                const variable = sourceCode.getDeclaredVariables (node).find ((v) => v.name === node.id.name);
                if (!variable || variable.references.some ((r) => r.isWrite () && r.identifier !== node.id)) {
                    return; // reassigned later: the reads may see another value
                }
                for (const ref of variable.references) {
                    if (!ref.isRead ()) {
                        continue;
                    }
                    const use = unsafeUse (ref.identifier);
                    if (use !== undefined && !guarded (ref.identifier, node.id.name)) {
                        ratchet.add (ref.identifier, 'noDefault', { reader, use });
                    }
                }
            },
            'Program:exit' () {
                ratchet.flush ();
            },
        };
    },
};
