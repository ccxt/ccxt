// ----------------------------------------------------------------------------
import { isNumber, isDictionary, isArray } from './type.js';
// ----------------------------------------------------------------------------
const keys = Object.keys; // eslint-disable-line padding-line-between-statements
const values = (x) => ((!isArray(x)) ? Object.values(x) : x); // don't copy arrays if they're already arrays
const index = (x) => new Set(values(x));
const extend = (...args) => Object.assign({}, ...args); // NB: side-effect free
const clone = (x) => (isArray(x) ? Array.from(x) : extend(x)); // clone arrays or objects
// ----------------------------------------------------------------------------
const ordered = (x) => x; // a stub to keep assoc keys in order (in JS it does nothing, it's mostly for Python)
const unique = (x) => Array.from(index(x));
const arrayConcat = (a, b) => a.concat(b);
// ------------------------------------------------------------------------
const inArray = (needle, haystack) => haystack.includes(needle);
const toArray = (object) => Object.values(object);
const isEmpty = (object) => {
    if (!object) {
        return true;
    }
    return (Array.isArray(object) ? object : Object.keys(object)).length < 1;
};
const keysort = (x, out = {}) => {
    for (const k of keys(x).sort()) {
        out[k] = x[k];
    }
    return out;
};
/*
    Accepts a map/array of objects and a key name to be used as an index:
    array = [
        { someKey: 'value1', anotherKey: 'anotherValue1' },
        { someKey: 'value2', anotherKey: 'anotherValue2' },
        { someKey: 'value3', anotherKey: 'anotherValue3' },
    ]
    key = 'someKey'
    Returns a map:
    {
        value1: { someKey: 'value1', anotherKey: 'anotherValue1' },
        value2: { someKey: 'value2', anotherKey: 'anotherValue2' },
        value3: { someKey: 'value3', anotherKey: 'anotherValue3' },
    }
*/
const groupBy = (x, k, out = {}) => {
    for (const v of values(x)) {
        if (k in v) {
            const p = v[k];
            out[p] = out[p] || [];
            out[p].push(v);
        }
    }
    return out;
};
const indexBy = (x, k, out = {}) => {
    for (const v of values(x)) {
        if (k in v) {
            out[v[k]] = v;
        }
    }
    return out;
};
const filterBy = (x, k, value = undefined, out = []) => {
    for (const v of values(x)) {
        if (v[k] === value) {
            out.push(v);
        }
    }
    return out;
};
const sortBy = (array, key, descending = false, direction = descending ? -1 : 1) => array.sort((a, b) => {
    if (a[key] < b[key]) {
        return -direction;
    }
    else if (a[key] > b[key]) {
        return direction;
    }
    else {
        return 0;
    }
});
const sortBy2 = (array, key1, key2, descending = false, direction = descending ? -1 : 1) => array.sort((a, b) => {
    if (a[key1] < b[key1]) {
        return -direction;
    }
    else if (a[key1] > b[key1]) {
        return direction;
    }
    else {
        if (a[key2] < b[key2]) {
            return -direction;
        }
        else if (a[key2] > b[key2]) {
            return direction;
        }
        else {
            return 0;
        }
    }
});
const flatten = function flatten(x, out = []) {
    for (const v of x) {
        if (isArray(v)) {
            flatten(v, out);
        }
        else {
            out.push(v);
        }
    }
    return out;
};
const pluck = (x, k) => values(x).filter((v) => k in v).map((v) => v[k]);
const omit = (x, ...args) => {
    if (!Array.isArray(x)) {
        const out = clone(x);
        for (const k of args) {
            if (isArray(k)) { // omit (x, ['a', 'b'])
                for (const kk of k) {
                    delete out[kk];
                }
            }
            else {
                delete out[k]; // omit (x, 'a', 'b')
            }
        }
        return out;
    }
    return x;
};
const sum = (...xs) => {
    const ns = xs.filter(isNumber); // leave only numbers
    return (ns.length > 0) ? ns.reduce((a, b) => a + b, 0) : undefined;
};
const deepExtend = function deepExtend(...xs) {
    let out = undefined;
    for (const x of xs) {
        if (isDictionary(x)) {
            if (!isDictionary(out)) {
                out = {};
            }
            for (const k in x) {
                out[k] = deepExtend(out[k], x[k]);
            }
        }
        else {
            out = x;
        }
    }
    return out;
};
const merge = (target, ...args) => {
    // doesn't overwrite defined keys with undefined
    const overwrite = {};
    const merged = Object.assign({}, ...args);
    const keys = Object.keys(merged);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (target[key] === undefined) {
            overwrite[key] = merged[key];
        }
    }
    // eslint-disable-next-line
    return Object.assign({}, target, overwrite);
};
export { keys, values, extend, clone, index, ordered, unique, arrayConcat
// ------------------------------------------------------------------------
, inArray, toArray, isEmpty
// ------------------------------------------------------------------------
, keysort
// ------------------------------------------------------------------------
, indexBy
// ------------------------------------------------------------------------
, groupBy
// ------------------------------------------------------------------------
, filterBy
// ------------------------------------------------------------------------
// NB: MUTATES ARRAY!
, sortBy, sortBy2
// ------------------------------------------------------------------------
, flatten
// ------------------------------------------------------------------------
, pluck
// ------------------------------------------------------------------------
, omit
// ------------------------------------------------------------------------
, sum
// ------------------------------------------------------------------------
, deepExtend
// ------------------------------------------------------------------------
, merge,
// ----------------------------------------------------------------------------
 };
