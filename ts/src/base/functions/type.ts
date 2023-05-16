/*  ------------------------------------------------------------------------ */

import { implicitReturnType } from '../types.js';

const isNumber = Number.isFinite;
const isInteger = Number.isInteger;
const isArray = Array.isArray;
const hasProps = (o) => ((o !== undefined) && (o !== null));
const isString = (s) => (typeof s === 'string');
const isObject = (o) => ((o !== null) && (typeof o === 'object'));
const isRegExp = (o) => (o instanceof RegExp);
const isDictionary = (o) => (isObject (o) && (Object.getPrototypeOf (o) === Object.prototype) && !isArray (o) && !isRegExp (o));
const isStringCoercible = (x) => ((hasProps (x) && x.toString) || isNumber (x));

/*  .............................................   */

const prop = (o, k) => (isObject (o) && o[k] !== '' && o[k] !== null ? o[k] : undefined);
const prop2 = (o, k1, k2) => (
    !isObject (o)
        ? undefined
        : (
            o[k1] !== undefined && o[k1] !== '' && o[k1] !== null
                ? o[k1]
                : (
                    o[k2] !== '' && o[k2] !== null
                        ? o[k2]
                        : undefined
                )
        )
);
const getValueFromKeysInArray = (object, array) => object[array.find ((k) => prop (object, k) !== undefined)];
/*  .............................................   */
const asFloat = (x) => ((isNumber (x) || (isString (x) && x.length !== 0)) ? parseFloat (x) : NaN);
const asInteger = (x) => ((isNumber (x) || (isString (x) && x.length !== 0)) ? Math.trunc (Number (x)) : NaN);
/*  .............................................   */

const safeFloat = (o: implicitReturnType, k: string | number, $default?: number): number => {
    const n = asFloat (prop (o, k));
    return isNumber (n) ? n : $default;
};

const safeInteger = (o: implicitReturnType, k: string | number, $default?: number): number => {
    const n = asInteger (prop (o, k));
    return isNumber (n) ? n : $default;
};

const safeIntegerProduct = (o: implicitReturnType, k: string | number, $factor: number, $default?: number): number => {
    const n = asInteger (prop (o, k))
    return isNumber (n) ? parseInt (n * $factor as any) : $default
};

const safeTimestamp = (o: implicitReturnType, k: string | number, $default?: number) => {
    const n = asFloat (prop (o, k));
    return isNumber (n) ? parseInt (n * 1000 as any) : $default;
};

const safeValue = (o: implicitReturnType, k: string | number, $default?) => {
    const x = prop (o, k);
    return hasProps (x) ? x : $default;
}

const safeString = (o: implicitReturnType, k: string | number, $default?: string): string => {
    const x = prop (o, k);
    return isStringCoercible (x) ? String (x) : $default;
}

const safeStringLower = (o: implicitReturnType, k: string | number, $default?: string): string => {
    const x = prop (o, k);
    return isStringCoercible (x) ? String (x).toLowerCase () : $default
};

const safeStringUpper = (o: implicitReturnType, k: string | number, $default?: string): string => {
    const x = prop (o, k)
    return isStringCoercible (x) ? String (x).toUpperCase () : $default
};
/*  .............................................   */

const safeFloat2 = (o: implicitReturnType, k1: string | number, k2: string | number, $default?: number): number => {
    const n = asFloat (prop2 (o, k1, k2));
    return isNumber (n) ? n : $default;
};

const safeInteger2 = (o: implicitReturnType, k1: string | number, k2: string | number, $default?: number): number => {
    const n = asInteger (prop2 (o, k1, k2));
    return isNumber (n) ? n : $default;
};

const safeIntegerProduct2 = (o: implicitReturnType, k1: string | number, k2: string | number, $factor: number, $default?: number): number => {
    const n = asInteger (prop2 (o, k1, k2));
    return isNumber (n) ? parseInt (n * $factor as any) : $default;
};

const safeTimestamp2 = (o: implicitReturnType, k1: string | number, k2: string | number, $default?): number => {
    const n = asFloat (prop2 (o, k1, k2));
    return isNumber (n) ? parseInt (n * 1000 as any) : $default;
};

const safeValue2 = (o: implicitReturnType, k1: string | number, k2: string | number, $default?) => {
    const x = prop2 (o, k1, k2);
    return hasProps (x) ? x : $default;
};

const safeString2 = (o: implicitReturnType, k1: string | number, k2: string | number, $default?: string): string => {
    const x = prop2 (o, k1, k2);
    return isStringCoercible (x) ? String (x) : $default;
};

const safeStringLower2 = (o: implicitReturnType, k1: string | number, k2: string | number, $default?: string): string => {
    const x = prop2 (o, k1, k2);
    return isStringCoercible (x) ? String (x).toLowerCase () : $default;
};

const safeStringUpper2 = (o: implicitReturnType, k1: string | number, k2: string | number, $default?: string): string => {
    const x = prop2 (o, k1, k2);
    return isStringCoercible (x) ? String (x).toUpperCase () : $default;
};

const safeFloatN = (o: implicitReturnType, k: (string | number)[], $default?: number): number => {
    const n = asFloat (getValueFromKeysInArray (o, k));
    return isNumber (n) ? n : $default;
};

const safeIntegerN = (o: implicitReturnType, k: (string | number)[], $default?: number): number => {
    const n = asInteger (getValueFromKeysInArray (o, k));
    return isNumber (n) ? n : $default;
};

const safeIntegerProductN = (o: implicitReturnType, k: (string | number)[], $factor: number, $default?: number): number => {
    const n = asInteger (getValueFromKeysInArray (o, k));
    return isNumber (n) ? parseInt (n * $factor as any) : $default;
};

const safeTimestampN = (o: implicitReturnType, k: (string | number)[], $default?: number): number => {
    const n = asFloat (getValueFromKeysInArray (o, k));
    return isNumber (n) ? parseInt (n * 1000 as any) : $default;
};

const safeValueN = (o: implicitReturnType, k: (string | number)[], $default?) => {
    const x = getValueFromKeysInArray (o, k);
    return hasProps (x) ? x : $default;
};

const safeStringN = (o: implicitReturnType, k: (string | number)[], $default?: string): string => {
    const x = getValueFromKeysInArray (o, k);
    return isStringCoercible (x) ? String (x) : $default;
};

const safeStringLowerN = (o: implicitReturnType, k: (string | number)[], $default?: string): string => {
    const x = getValueFromKeysInArray (o, k);
    return isStringCoercible (x) ? String (x).toLowerCase () : $default;
};

const safeStringUpperN = (o: implicitReturnType, k: (string | number)[], $default?: string): string => {
    const x = getValueFromKeysInArray (o, k);
    return isStringCoercible (x) ? String (x).toUpperCase () : $default;
};

export {
    isNumber
    , isInteger
    , isArray
    , isObject
    , isString
    , isStringCoercible
    , isDictionary
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
