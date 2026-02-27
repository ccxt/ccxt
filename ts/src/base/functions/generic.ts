
// ----------------------------------------------------------------------------

import { Dictionary, IndexType } from '../types.js';
import { isObject, isNumber, isDictionary, isArray } from './type.js';

// ----------------------------------------------------------------------------

const keys = Object.keys; // eslint-disable-line padding-line-between-statements
const values = (x: any[] | Dictionary<any>) => ((!isArray (x)) ? Object.values (x) : x); // don't copy arrays if they're already arrays
const index = (x: any[]) => new Set (values (x));
const extend = (...args: any[]) => Object.assign ({}, ...args); // NB: side-effect free
const clone = (x: any) => (isArray (x) ? Array.from (x) : extend (x)); // clone arrays or objects

// ----------------------------------------------------------------------------

const ordered = (x: any[] | Dictionary<any>) => x; // a stub to keep assoc keys in order (in JS it does nothing, it's mostly for Python)

const unique = (x: any[]) => Array.from (index (x));

const arrayConcat = (a: any[], b: any[]) => a.concat (b);

// ------------------------------------------------------------------------

const inArray = (needle: any, haystack: any[]) => haystack.includes (needle);

const toArray = (object: Dictionary<any>|any[]) => Object.values (object);

const isEmpty = (object: any[] | Dictionary<any>) => {
    if (!object) {
        return true;
    }
    return (Array.isArray (object) ? object : Object.keys (object)).length < 1;
};

const keysort = (x: Dictionary<any>, out: Dictionary<any> = {}) => {
    for (const k of keys (x).sort ()) {
        out[k] = x[k];
    }
    return out;
};

const sort = (array: string[]| any) => {
    const newArray = array.slice();
    newArray.sort();
    return newArray;
}


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

const groupBy = (x: Dictionary<any>, k: string, out: Dictionary<any> = {}) => {
    for (const v of values (x)) {
        if (k in v) {
            const p = v[k];
            out[p] = out[p] || [];
            out[p].push (v);
        }
    }
    return out;
};

const indexBy = (x: Dictionary<any>, k: IndexType, out: Dictionary<any> = {}) => {

    for (const v of values (x)) {
        if (k in v) {
            out[v[k]] = v;
        }
    }
    return out;
};

const filterBy = (x: Dictionary<any>, k: string, value: any = undefined, out: Dictionary<any>[] = []) => {

    for (const v of values (x)) {
        if (v[k] === value) {
            out.push (v);
        }
    }
    return out;
};

const sortBy = (array: any[], key: IndexType, descending = false, defaultValue:any = 0, direction = descending ? -1 : 1) => array.sort ((a: Dictionary<any>, b: Dictionary<any>) => {
    const first = (key in a) ? a[key] : defaultValue;
    const second = (key in b) ? b[key] : defaultValue;
    if (first < second) {
        return -direction;
    } else if (first > second) {
        return direction;
    } else {
        return 0;
    }
});

const sortBy2 = (array: any[], key1: IndexType, key2: IndexType, descending = false, direction = descending ? -1 : 1) => array.sort ((a: Dictionary<any>, b: Dictionary<any>) => {
    if (a[key1] < b[key1]) {
        return -direction;
    } else if (a[key1] > b[key1]) {
        return direction;
    } else {
        if (a[key2] < b[key2]) {
            return -direction;
        } else if (a[key2] > b[key2]) {
            return direction;
        } else {
            return 0;
        }
    }
});

const flatten = function flatten (x: any[], out: any[] = []) {

    for (const v of x) {
        if (isArray (v)) {
            flatten (v, out);
        } else {
            out.push (v);
        }
    }
    return out;
};

const pluck = (x: Dictionary<any>, k: any) => values (x).filter ((v) => k in v).map ((v) => v[k]);

const omit = (x: Dictionary<any>, ...args: any) => {

    if (!Array.isArray (x)) {

        const out = clone (x);

        for (const k of args) {
            if (isArray (k)) { // omit (x, ['a', 'b'])
                for (const kk of k) {
                    delete out[kk];
                }
            } else {
                delete out[k]; // omit (x, 'a', 'b')
            }
        }

        return out;
    }

    return x;
};

const sum = (...xs: any[]) => {

    const ns = xs.filter (isNumber); // leave only numbers

    return (ns.length > 0) ? ns.reduce ((a, b) => a + b, 0) : undefined;
};

const deepExtend = function (...args: any) {
    let result: any = null;
    let resultIsObject = false;

    for (const arg of args) {
        if (arg !== null && typeof arg === 'object' && arg.constructor === Object) {
            // This is a plain object (even if empty) so set the return type.
            if (result === null || !resultIsObject) {
                result = {};
                resultIsObject = true;
            }

            // Skip actual merging if object is empty.
            if (Object.keys(arg).length === 0) {
                continue;
            }

            for (const key in arg) {
                const value = arg[key];
                const current = result[key];
                
                if (current !== null && typeof current === 'object' && current.constructor === Object &&
                    value !== null && typeof value === 'object' && value.constructor === Object) {
                    result[key] = deepExtend(current, value);
                } else {
                    result[key] = value;
                }
            }
        } else {
            // arg is null or other non-object.
            result = arg;
            resultIsObject = false;
        }
    }

    return result;
}


const merge = (target: Dictionary<any>, ...args: any) => {
    // doesn't overwrite defined keys with undefined
    const overwrite: Dictionary<any> = {};
    const merged = Object.assign ({}, ...args);
    const keys = Object.keys (merged);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (target[key] === undefined) {
            overwrite[key] = merged[key];
        }
    }
    // eslint-disable-next-line
    return Object.assign ({}, target, overwrite)
};

export {
    keys
    , values
    , extend
    , clone
    , index
    , ordered
    , unique
    , arrayConcat

    // ------------------------------------------------------------------------

    , inArray
    , toArray
    , isEmpty

    // ------------------------------------------------------------------------
    , sort
    , keysort

    // ------------------------------------------------------------------------

    , indexBy

    // ------------------------------------------------------------------------

    , groupBy

    // ------------------------------------------------------------------------

    , filterBy

    // ------------------------------------------------------------------------
    // NB: MUTATES ARRAY!

    , sortBy

    , sortBy2

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
