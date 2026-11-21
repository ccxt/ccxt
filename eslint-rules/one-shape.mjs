// one-shape: a local holds one shape for its whole life.
// Reports (1) a local assigned from expressions of different kinds (dict / list / awaited call / string),
// (2) a `let` seeded with {} / [] / undefined and later filled from an awaited endpoint call inside a branch,
// (3) Array.isArray (x) / typeof x on a local that came from an endpoint call or a this.safe* reader.
// Ratchet: findings are counted per file and reported only when the file has more than its baseline.
// Guards the IsArray / toArray / into_opt_list helper families and untyped response locals.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname (fileURLToPath (import.meta.url));
let defaultBaseline;
function loadBaseline () {
    if (defaultBaseline === undefined) {
        try {
            defaultBaseline = JSON.parse (fs.readFileSync (path.join (here, 'baseline', 'one-shape.json'), 'utf8'));
        } catch (e) {
            defaultBaseline = {};
        }
    }
    return defaultBaseline;
}

function unwrap (node) {
    while (node && (node.type === 'TSAsExpression' || node.type === 'TSNonNullExpression' || node.type === 'TSTypeAssertion' || node.type === 'TSSatisfiesExpression')) {
        node = node.expression;
    }
    return node;
}

function isUndefined (node) {
    node = unwrap (node);
    return node === null || node === undefined || (node.type === 'Identifier' && node.name === 'undefined') || (node.type === 'Literal' && node.value === null);
}

function kindOf (node) {
    node = unwrap (node);
    if (!node) {
        return undefined;
    }
    switch (node.type) {
    case 'ObjectExpression': return 'dict';
    case 'ArrayExpression': return 'list';
    case 'AwaitExpression': return 'awaited call';
    case 'TemplateLiteral': return 'string';
    case 'Literal': return (typeof node.value === 'string') ? 'string' : undefined;
    default: return undefined;
    }
}

function isEmptySeed (node) {
    node = unwrap (node);
    if (isUndefined (node)) {
        return true;
    }
    return (node.type === 'ObjectExpression' && node.properties.length === 0) || (node.type === 'ArrayExpression' && node.elements.length === 0);
}

function isSafeReaderCall (node) {
    node = unwrap (node);
    return node && node.type === 'CallExpression' && node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'ThisExpression' && node.callee.property.type === 'Identifier' &&
        /^safe[A-Z]/.test (node.callee.property.name);
}

function isEndpointSource (node) {
    node = unwrap (node);
    return node && (node.type === 'AwaitExpression' || isSafeReaderCall (node));
}

// every value written to the variable: initialiser plus plain `=` assignments
function writesOf (variable) {
    const out = [];
    for (const def of variable.defs) {
        if (def.type === 'Variable' && def.node.id.type === 'Identifier') {
            out.push ({ value: def.node.init, node: def.node, decl: true });
        }
    }
    for (const ref of variable.references) {
        if (!ref.isWrite () || ref.init) {
            continue;
        }
        const parent = ref.identifier.parent;
        if (parent && parent.type === 'AssignmentExpression' && parent.operator === '=' && parent.left === ref.identifier) {
            out.push ({ value: parent.right, node: parent, decl: false });
        }
    }
    return out;
}

function enclosingBlock (node) {
    let n = node.parent;
    while (n && n.type !== 'BlockStatement' && n.type !== 'Program' && n.type !== 'SwitchCase') {
        n = n.parent;
    }
    return n;
}

export default {
    meta: {
        type: 'problem',
        docs: { description: 'a local holds one shape; no Array.isArray / typeof tests on endpoint results' },
        schema: [ {
            type: 'object',
            properties: { baseline: { type: 'object' } },
            additionalProperties: false,
        } ],
        messages: {
            mixedKinds: "'{{name}}' is assigned a {{kinds}}: use one typed const per shape (const rows: Dict[] = ...).",
            seededEndpoint: "'{{name}}' is seeded empty and filled from an endpoint in a branch: use one const per branch and finish the work there.",
            shapeTest: "{{test}} on '{{name}}' (an endpoint/safe-reader result): read the documented shape with safeDict / safeList instead.",
        },
    },
    create (context) {
        const options = context.options[0] || {};
        const baseline = options.baseline || loadBaseline ();
        const filename = context.filename || context.getFilename ();
        const rel = path.relative (process.cwd (), filename).split (path.sep).join ('/');
        const allowed = baseline[rel] || 0;
        const sourceCode = context.sourceCode || context.getSourceCode ();
        const findings = [];
        const seen = new Set ();

        function resolve (identifier) {
            let scope = sourceCode.getScope ? sourceCode.getScope (identifier) : context.getScope ();
            while (scope) {
                const v = scope.set.get (identifier.name);
                if (v) {
                    return v;
                }
                scope = scope.upper;
            }
            return undefined;
        }

        function checkVariable (variable) {
            if (seen.has (variable)) {
                return;
            }
            seen.add (variable);
            const def = variable.defs[0];
            if (!def || def.type !== 'Variable' || def.node.id.type !== 'Identifier') {
                return;
            }
            const writes = writesOf (variable);
            const kinds = new Set ();
            for (const w of writes) {
                const k = kindOf (w.value);
                if (k !== undefined) {
                    kinds.add (k);
                }
            }
            if (kinds.size > 1) {
                findings.push ({ node: def.node.id, messageId: 'mixedKinds', data: { name: variable.name, kinds: Array.from (kinds).sort ().join (' and a ') } });
                return;
            }
            if (def.parent.kind === 'let' && isEmptySeed (def.node.init)) {
                const declBlock = enclosingBlock (def.node);
                const branchFill = writes.some ((w) => !w.decl && unwrap (w.value) && unwrap (w.value).type === 'AwaitExpression' && enclosingBlock (w.node) !== declBlock);
                if (branchFill) {
                    findings.push ({ node: def.node.id, messageId: 'seededEndpoint', data: { name: variable.name } });
                }
            }
        }

        function checkShapeTest (node, arg, test) {
            arg = unwrap (arg);
            if (!arg || arg.type !== 'Identifier') {
                return;
            }
            const variable = resolve (arg);
            if (!variable || !variable.defs.length || variable.defs[0].type !== 'Variable') {
                return; // parameters, imports, globals: not an endpoint result
            }
            if (writesOf (variable).some ((w) => isEndpointSource (w.value))) {
                findings.push ({ node, messageId: 'shapeTest', data: { test, name: arg.name } });
            }
        }

        return {
            VariableDeclarator (node) {
                if (node.id.type !== 'Identifier') {
                    return;
                }
                for (const v of sourceCode.getDeclaredVariables ? sourceCode.getDeclaredVariables (node) : context.getDeclaredVariables (node)) {
                    checkVariable (v);
                }
            },
            CallExpression (node) {
                const c = node.callee;
                if (c.type === 'MemberExpression' && c.object.type === 'Identifier' && c.object.name === 'Array' &&
                    c.property.type === 'Identifier' && c.property.name === 'isArray' && node.arguments.length === 1) {
                    checkShapeTest (node, node.arguments[0], 'Array.isArray');
                }
            },
            UnaryExpression (node) {
                if (node.operator === 'typeof') {
                    checkShapeTest (node, node.argument, 'typeof');
                }
            },
            'Program:exit' () {
                if (findings.length > allowed) {
                    for (const f of findings) {
                        context.report (f);
                    }
                }
            },
        };
    },
};
