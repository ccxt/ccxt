// no-safe-value: bans this.safeValue / safeValue2 / safeValueN in exchange sources.
// safeValue returns an untyped value, which the Go / Java / C# / Rust generators wrap in GetValue / helper calls.
import { makeRatchet } from './_ratchet.mjs';

const RULE = 'no-safe-value';
const BANNED = new Set ([ 'safeValue', 'safeValue2', 'safeValueN' ]);

function propertyName (node) {
    if (!node.computed && node.property.type === 'Identifier') {
        return node.property.name;
    }
    if (node.computed && node.property.type === 'Literal' && typeof node.property.value === 'string') {
        return node.property.value;
    }
    return undefined;
}

export default {
    'meta': {
        'type': 'problem',
        'docs': {
            'description': 'disallow this.safeValue, safeValue2 and safeValueN; use a typed reader',
        },
        'schema': [],
        'messages': {
            'banned': 'this.{{name}} returns an untyped value: use safeDict / safeList / safeString / safeInteger / safeNumber / safeBool (with a default) instead.',
        },
    },
    create (context) {
        const ratchet = makeRatchet (RULE, context);
        return {
            MemberExpression (node) {
                if (node.object.type !== 'ThisExpression' && node.object.type !== 'Super') {
                    return;
                }
                const name = propertyName (node);
                if (name !== undefined && BANNED.has (name)) {
                    ratchet.add (node, 'banned', { name });
                }
            },
            'Program:exit' () {
                ratchet.flush ();
            },
        };
    },
};
