// no-untyped: reject the TypeScript shapes that print untyped locals
// (`any` in Go, `Object` in Java, `object` in C#, `Value` in Rust) in the ports.
//
// Reports:
//   anyType      `any` in a type position (`x: any`, `Promise<any>`, `any[]`)
//   asAny        `expr as any`
//   letUndefined `let x = undefined` (or `let x;`) without a type annotation
//   untypedParam a method parameter with no type, on a method that is not an `override`
//                (overrides inherit their signature from the base class)
//   noReturnType a class method with no return type annotation (constructor and setters excluded)
//
// Ratchet: findings are counted per file. A file reports only when it has MORE findings
// than eslint-rules/baseline/no-untyped.json allows, so today's source passes and new
// untyped code fails. Option `{ baseline: { '<path>': n } }` overrides the json (tests).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname (fileURLToPath (import.meta.url));
const repoRoot = path.resolve (here, '..');
let defaultBaseline;

function loadBaseline () {
    if (defaultBaseline === undefined) {
        try {
            defaultBaseline = JSON.parse (fs.readFileSync (path.join (here, 'baseline', 'no-untyped.json'), 'utf8'));
        } catch (e) {
            defaultBaseline = {};
        }
    }
    return defaultBaseline;
}

function relativeKey (filename) {
    const abs = path.resolve (filename);
    const rel = path.relative (repoRoot, abs).split (path.sep).join ('/');
    return rel.startsWith ('..') ? filename.split (path.sep).join ('/') : rel;
}

function paramName (p) {
    if (p.type === 'Identifier') {
        return p.name;
    }
    if (p.type === 'AssignmentPattern' && p.left.type === 'Identifier') {
        return p.left.name;
    }
    if (p.type === 'RestElement' && p.argument.type === 'Identifier') {
        return '...' + p.argument.name;
    }
    if (p.type === 'TSParameterProperty') {
        return paramName (p.parameter);
    }
    return '?';
}

function paramHasType (p) {
    if (p.type === 'TSParameterProperty') {
        return paramHasType (p.parameter);
    }
    if (p.type === 'AssignmentPattern') {
        return Boolean (p.left.typeAnnotation);
    }
    return Boolean (p.typeAnnotation);
}

function methodName (node) {
    if (node.key && node.key.type === 'Identifier') {
        return node.key.name;
    }
    if (node.key && node.key.type === 'PrivateIdentifier') {
        return '#' + node.key.name;
    }
    if (node.key && node.key.type === 'Literal') {
        return String (node.key.value);
    }
    return '<computed>';
}

export default {
    'meta': {
        'type': 'problem',
        'docs': {
            'description': 'reject any, as any, untyped let-undefined locals, untyped helper parameters and missing return types (ratcheted per file)',
        },
        'schema': [
            {
                'type': 'object',
                'properties': {
                    'baseline': { 'type': 'object', 'additionalProperties': { 'type': 'integer' } },
                },
                'additionalProperties': false,
            },
        ],
        'messages': {
            'anyType': 'no-untyped ({{count}} > baseline {{baseline}}): `any` type; write the real type (Dict, List, Str, Int, Num, string, boolean, a unified type).',
            'asAny': 'no-untyped ({{count}} > baseline {{baseline}}): `as any`; read the value with a typed base reader (safeDict/safeList/safeString) or declare the right type.',
            'letUndefined': 'no-untyped ({{count}} > baseline {{baseline}}): `let {{name}}` seeded undefined without a type; write `let {{name}}: Str = undefined` (or Dict, Int, ...) or one const per branch.',
            'untypedParam': 'no-untyped ({{count}} > baseline {{baseline}}): parameter `{{name}}` of {{method}} has no type; annotate it (Dict, List, Str, Int, Num, string, boolean).',
            'noReturnType': 'no-untyped ({{count}} > baseline {{baseline}}): method {{method}} has no return type; write it (e.g. `: Dict`, `: Promise<Order>`, `: void`).',
        },
    },
    create (context) {
        const options = context.options[0] || {};
        const baselineMap = options.baseline || loadBaseline ();
        const filename = context.filename || context.getFilename ();
        const key = relativeKey (filename);
        const allowed = baselineMap[key] || 0;
        const findings = [];
        const add = (node, messageId, data = {}) => findings.push ({ node, messageId, data });
        return {
            TSAnyKeyword (node) {
                // `catch (e: any)`: TypeScript only allows any / unknown there, and the ports ignore it
                const annotated = node.parent && node.parent.parent;
                if (annotated && annotated.parent && annotated.parent.type === 'CatchClause') {
                    return;
                }
                if (node.parent && node.parent.type === 'TSAsExpression') {
                    add (node.parent, 'asAny');
                } else {
                    add (node, 'anyType');
                }
            },
            VariableDeclarator (node) {
                const decl = node.parent;
                if (decl.kind !== 'let' || node.id.type !== 'Identifier' || node.id.typeAnnotation) {
                    return;
                }
                // for (let x ...) loop heads are not seeded-undefined locals
                if (decl.parent && (decl.parent.type === 'ForInStatement' || decl.parent.type === 'ForOfStatement')) {
                    return;
                }
                const init = node.init;
                if (init === null || (init.type === 'Identifier' && init.name === 'undefined')) {
                    add (node, 'letUndefined', { 'name': node.id.name });
                }
            },
            MethodDefinition (node) {
                if (node.value.type !== 'FunctionExpression' && node.value.type !== 'TSEmptyBodyFunctionExpression') {
                    return;
                }
                const name = methodName (node);
                const fn = node.value;
                if (!node.override) {
                    for (const p of fn.params) {
                        if (!paramHasType (p)) {
                            add (p, 'untypedParam', { 'name': paramName (p), 'method': name });
                        }
                    }
                }
                if (node.kind === 'method' || node.kind === 'get') {
                    if (!fn.returnType) {
                        add (node.key, 'noReturnType', { 'method': name });
                    }
                }
            },
            'Program:exit' () {
                if (findings.length <= allowed) {
                    return;
                }
                for (const f of findings) {
                    context.report ({
                        'node': f.node,
                        'messageId': f.messageId,
                        'data': { ...f.data, 'count': String (findings.length), 'baseline': String (allowed) },
                    });
                }
            },
        };
    },
};
