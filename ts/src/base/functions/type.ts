/*  ------------------------------------------------------------------------ */

import { safeInputType, Int, Str, NullableIndexType, Num, Dictionary } from '../types.js';

const isNumber = Number.isFinite;
const isInteger = Number.isInteger;
const isArray = Array.isArray;
const hasProps = (o: any) => ((o !== undefined) && (o !== null));
const isString = (s: any) => (typeof s === 'string');
const isObject = (o: any) => ((o !== null) && (typeof o === 'object'));
const isRegExp = (o: any) => (o instanceof RegExp);
const isDictionary = (o: any) => (isObject (o) && (Object.getPrototypeOf (o) === Object.prototype) && !isArray (o) && !isRegExp (o));
const isStringCoercible = (x: any) => ((hasProps (x) && x.toString) || isNumber (x));

/*  .............................................   */

const prop = (o: any, k: NullableIndexType) => {
    if (k === undefined || k === null) {
        return undefined;
    }
    return (isObject (o) && o[k] !== '' && o[k] !== null ? o[k] : undefined);
};
const prop2 = (o: any, k1: NullableIndexType, k2: NullableIndexType) => {
    if (!isObject (o)) {
        return undefined;
    }
    if (k1 !== undefined && k1 !== null) {
        if (o[k1] !== undefined && o[k1] !== '' && o[k1] !== null) {
            return o[k1];
        }
    }
    if (k2 !== undefined && k2 !== null) {
        if (o[k2] !== '' && o[k2] !== null) {
            return o[k2];
        }
    }
    return undefined;
};
const getValueFromKeysInArray = (object: Dictionary<any>, array: any[]) => isObject (object) ? object[array.find ((k: NullableIndexType) => prop (object, k) !== undefined)] : undefined;
/*  .............................................   */

const asFloat = (x: any): number | typeof NaN => ((isNumber (x) || (isString (x) && x.length !== 0)) ? parseFloat (x) : NaN);
const asInteger = (x: any): number | typeof NaN => ((isNumber (x) || (isString (x) && x.length !== 0)) ? Math.trunc (Number (x)) : NaN);
/*  .............................................   */

function safeFloat (o: safeInputType, k: NullableIndexType, $default?: number): Num {
    const n = asFloat (prop (o, k));
    return isNumber (n) ? n : $default;
}

function safeInteger (o: safeInputType, k: NullableIndexType, $default: number): number;
function safeInteger (o: safeInputType, k: NullableIndexType, $default?: number): Int;
function safeInteger (o: safeInputType, k: NullableIndexType, $default?: number): Int {
    const n = asInteger (prop (o, k));
    return isNumber (n) ? n : $default;
}

function safeIntegerProduct (o: safeInputType, k: NullableIndexType, $factor: number, $default?: number): Int {
    const n = asFloat (prop (o, k));
    return isNumber (n) ? parseInt (n * $factor as any) : $default;
}

function safeTimestamp (o: safeInputType, k: NullableIndexType, $default?: number): Int {
    const n = asFloat (prop (o, k));
    return isNumber (n) ? parseInt (n * 1000 as any) : $default;
}

function safeValue (o: safeInputType, k: NullableIndexType, $default?: any) {
    const x = prop (o, k);
    return hasProps (x) ? x : $default;
}

function safeString (o: safeInputType, k: NullableIndexType, $default: string): string;
function safeString (o: safeInputType, k: NullableIndexType, $default?: string): Str;
function safeString (o: safeInputType, k: NullableIndexType, $default?: string): Str {
    const x = prop(o, k);
    if (typeof x === 'string') return x;
    if (Number.isFinite (x)) return String (x);
    return $default;
}

function safeStringLower (o: safeInputType, k: NullableIndexType, $default?: string): Str {
    const x = prop (o, k);
    if (typeof x === 'string') return x.toLowerCase ();
    if (Number.isFinite (x)) return String (x).toLowerCase ();
    return $default;
}

function safeStringUpper (o: safeInputType, k: NullableIndexType, $default?: string): Str {
    const x = prop (o, k);
    if (typeof x === 'string') return x.toUpperCase ();
    if (Number.isFinite (x)) return String (x).toUpperCase ();
    return $default;
}
/*  .............................................   */

function safeFloat2 (o: safeInputType, k1: NullableIndexType, k2: NullableIndexType, $default?: number): Num {
    const n = asFloat (prop2 (o, k1, k2));
    return isNumber (n) ? n : $default;
}

function safeInteger2 (o: safeInputType, k1: NullableIndexType, k2: NullableIndexType, $default: number): number;
function safeInteger2 (o: safeInputType, k1: NullableIndexType, k2: NullableIndexType, $default?: number): Int;
function safeInteger2 (o: safeInputType, k1: NullableIndexType, k2: NullableIndexType, $default?: number): Int {
    const n = asInteger (prop2 (o, k1, k2));
    return isNumber (n) ? n : $default;
}

function safeIntegerProduct2 (o: safeInputType, k1: NullableIndexType, k2: NullableIndexType, $factor: number, $default?: number): Int {
    const n = asFloat (prop2 (o, k1, k2));
    return isNumber (n) ? parseInt (n * $factor as any) : $default;
}

function safeTimestamp2 (o: safeInputType, k1: NullableIndexType, k2: NullableIndexType, $default?: Int): Int {
    const n = asFloat (prop2 (o, k1, k2));
    return isNumber (n) ? parseInt (n * 1000 as any) : $default;
}

function safeValue2 (o: safeInputType, k1: NullableIndexType, k2: NullableIndexType, $default?: any) {
    const x = prop2 (o, k1, k2);
    return hasProps (x) ? x : $default;
}

function safeString2 (o: safeInputType, k1: NullableIndexType, k2: NullableIndexType, $default: string): string;
function safeString2 (o: safeInputType, k1: NullableIndexType, k2: NullableIndexType, $default?: string): Str;
function safeString2 (o: safeInputType, k1: NullableIndexType, k2: NullableIndexType, $default?: string): Str {
    const x = prop2 (o, k1, k2);
    if (typeof x === 'string') return x;
    if (Number.isFinite (x)) return String (x);
    return $default;
}

function safeStringLower2 (o: safeInputType, k1: NullableIndexType, k2: NullableIndexType, $default?: string): Str {
    const x = prop2 (o, k1, k2);
    if (typeof x === 'string') return x.toLowerCase ();
    if (Number.isFinite (x)) return String (x).toLowerCase ();
    return $default;
}

function safeStringUpper2 (o: safeInputType, k1: NullableIndexType, k2: NullableIndexType, $default?: string): Str {
    const x = prop2 (o, k1, k2);
    if (typeof x === 'string') return x.toUpperCase ();
    if (Number.isFinite (x)) return String (x).toUpperCase ();
    return $default;
}

function safeFloatN (o: safeInputType, k: (NullableIndexType)[], $default?: number): Num {
    const n = asFloat (getValueFromKeysInArray (o, k));
    return isNumber (n) ? n : $default;
}

function safeIntegerN (o: safeInputType, k: (NullableIndexType)[], $default: number): number;
function safeIntegerN (o: safeInputType, k: (NullableIndexType)[], $default?: number): Int;
function safeIntegerN (o: safeInputType, k: (NullableIndexType)[], $default?: number): Int {
    if (o === undefined) {
        return $default;
    }
    const n = asInteger (getValueFromKeysInArray (o, k));
    return isNumber (n) ? n : $default;
}

function safeIntegerProductN (o: safeInputType, k: (NullableIndexType)[], $factor: number, $default?: number): Int {
    const n = asFloat (getValueFromKeysInArray (o, k));
    return isNumber (n) ? parseInt (n * $factor as any) : $default;
}

function safeTimestampN (o: safeInputType, k: (NullableIndexType)[], $default?: number): Int {
    const n = asFloat (getValueFromKeysInArray (o, k));
    return isNumber (n) ? parseInt (n * 1000 as any) : $default;
}

function safeValueN (o: safeInputType, k: (NullableIndexType)[], $default?: any) {
    if (o === undefined) {
        return $default;
    }
    const x = getValueFromKeysInArray (o, k);
    return hasProps (x) ? x : $default;
}

function safeStringN (o: safeInputType, k: (NullableIndexType)[], $default: string): string;
function safeStringN (o: safeInputType, k: (NullableIndexType)[], $default?: string): Str;
function safeStringN (o: safeInputType, k: (NullableIndexType)[], $default?: string): Str {
    if (o === undefined) return $default; 
    const x = getValueFromKeysInArray (o, k); 
    if (typeof x === 'string') return x;
    if (Number.isFinite (x)) return String (x);
    return $default;
}

function safeStringLowerN (o: safeInputType, k: (NullableIndexType)[], $default?: string): Str {
    if (o === undefined) return $default; 
    const x = getValueFromKeysInArray (o, k);
    if (typeof x === 'string') return x.toLowerCase ();
    if (Number.isFinite (x)) return String (x).toLowerCase ();
    return $default;
}

function safeStringUpperN (o: safeInputType, k: (NullableIndexType)[], $default?: string): Str {
    if (o === undefined) return $default; 
    const x = getValueFromKeysInArray (o, k);
    if (typeof x === 'string') return x.toUpperCase ();
    if (Number.isFinite (x)) return String (x).toUpperCase ();
    return $default;
}

export {
    isNumber
    , isInteger
    , isArray
    , isObject
    , isString
    , isStringCoercible
    , isDictionary as isDict
    , hasProps
    , prop
    , asFloat
    , asInteger
    , safeFloat
    , safeInteger
    , safeIntegerProduct
    , safeTimestamp
    , safeValue
    , safeString
    , safeStringLower
    , safeStringUpper

    // not using safeFloats with an array argument as we're trying to save some cycles here
    // we're not using safeFloat3 either because those cases are too rare to deserve their own optimization

    , safeFloat2
    , safeInteger2
    , safeIntegerProduct2
    , safeTimestamp2
    , safeValue2
    , safeString2
    , safeStringLower2
    , safeStringUpper2

    // safeMethodN
    , safeFloatN
    , safeIntegerN
    , safeIntegerProductN
    , safeTimestampN
    , safeValueN
    , safeStringN
    , safeStringLowerN
    , safeStringUpperN,
};

/*  ------------------------------------------------------------------------ */
