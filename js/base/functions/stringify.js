// let json = typeof JSON !== 'undefined' ? JSON : require ('jsonify');

"use strict";

let json = JSON;

let isArray = Array.isArray || function (x) {
    return {}.toString.call (x) === '[object Array]';
};

let objectKeys = Object.keys || function (obj) {
    let has = Object.prototype.hasOwnProperty || function () { return true };
    let keys = [];
    for (let key in obj) {
        if (has.call (obj, key)) keys.push (key);
    }
    return keys;
};

const stableStringify = (obj, opts) => {
    if (!opts) opts = {};
    if (typeof opts === 'function') opts = { cmp: opts };
    let space = opts.space || '';
    if (typeof space === 'number') space = Array (space + 1).join (' ');
    let cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;
    let replacer = opts.replacer || function (key, value) { return value; };

    let cmp = opts.cmp && (function (f) {
        return function (node) {
            return function (a, b) {
                let aobj = { key: a, value: node[a] };
                let bobj = { key: b, value: node[b] };
                return f (aobj, bobj);
            };
        };
    }) (opts.cmp);

    let seen = [];
    return (function stringify (parent, key, node, level) {
        let indent = space ? ('\n' + new Array (level + 1).join (space)) : '';
        let colonSeparator = space ? ': ' : ':';

        if (node && node.toJSON && typeof node.toJSON === 'function') {
            node = node.toJSON ();
        }

        node = replacer.call (parent, key, node);

        if (node === undefined) {
            return;
        }
        if (typeof node !== 'object' || node === null) {
            return json.stringify (node);
        }
        if (isArray (node)) {
            let out = [];
            for (let i = 0; i < node.length; i++) {
                let item = stringify (node, i, node[i], level + 1) || json.stringify (null);
                out.push (indent + space + item);
            }
            return '[' + out.join (',') + indent + ']';
        }
        else {
            if (seen.indexOf (node) !== -1) {
                if (cycles) return json.stringify ('__cycle__');
                throw new TypeError ('Converting circular structure to JSON');
            }
            else seen.push (node);

            let keys = objectKeys (node).sort (cmp && cmp (node));
            let out = [];
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let value = stringify (node, key, node[key], level + 1);

                if (!value) continue;

                let keyValue = json.stringify (key)
                    + colonSeparator
                    + value;
                out.push (indent + space + keyValue);
            }
            seen.splice (seen.indexOf (node), 1);
            return '{' + out.join (',') + indent + '}';
        }
    }) ({ '': obj }, '', obj, 0);
}

module.exports = {
    stableStringify,
}
