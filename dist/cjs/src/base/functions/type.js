'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*  ------------------------------------------------------------------------ */
const isNumber = Number.isFinite;
const isInteger = Number.isInteger;
const isArray = Array.isArray;
const hasProps = (o) => ((o !== undefined) && (o !== null));
const isString = (s) => (typeof s === 'string');
const isObject = (o) => ((o !== null) && (typeof o === 'object'));
const isRegExp = (o) => (o instanceof RegExp);
const isDictionary = (o) => (isObject(o) && (Object.getPrototypeOf(o) === Object.prototype) && !isArray(o) && !isRegExp(o));
const isStringCoercible = (x) => ((hasProps(x) && x.toString) || isNumber(x));
/*  .............................................   */
const prop = (o, k) => (isObject(o) && o[k] !== '' && o[k] !== null ? o[k] : undefined);
const prop2 = (o, k1, k2) => (!isObject(o)
    ? undefined
    : (o[k1] !== undefined && o[k1] !== '' && o[k1] !== null
        ? o[k1]
        : (o[k2] !== '' && o[k2] !== null
            ? o[k2]
            : undefined)));
const getValueFromKeysInArray = (object, array) => object[array.find((k) => prop(object, k) !== undefined)];
/*  .............................................   */
const asFloat = (x) => ((isNumber(x) || (isString(x) && x.length !== 0)) ? parseFloat(x) : NaN);
const asInteger = (x) => ((isNumber(x) || (isString(x) && x.length !== 0)) ? Math.trunc(Number(x)) : NaN);
/*  .............................................   */
const safeFloat = (o, k, $default) => {
    const n = asFloat(prop(o, k));
    return isNumber(n) ? n : $default;
};
const safeInteger = (o, k, $default) => {
    const n = asInteger(prop(o, k));
    return isNumber(n) ? n : $default;
};
const safeIntegerProduct = (o, k, $factor, $default) => {
    const n = asFloat(prop(o, k));
    return isNumber(n) ? parseInt(n * $factor) : $default;
};
const safeTimestamp = (o, k, $default) => {
    const n = asFloat(prop(o, k));
    return isNumber(n) ? parseInt(n * 1000) : $default;
};
const safeValue = (o, k, $default) => {
    const x = prop(o, k);
    return hasProps(x) ? x : $default;
};
const safeString = (o, k, $default) => {
    const x = prop(o, k);
    return isStringCoercible(x) ? String(x) : $default;
};
const safeStringLower = (o, k, $default) => {
    const x = prop(o, k);
    return isStringCoercible(x) ? String(x).toLowerCase() : $default;
};
const safeStringUpper = (o, k, $default) => {
    const x = prop(o, k);
    return isStringCoercible(x) ? String(x).toUpperCase() : $default;
};
/*  .............................................   */
const safeFloat2 = (o, k1, k2, $default) => {
    const n = asFloat(prop2(o, k1, k2));
    return isNumber(n) ? n : $default;
};
const safeInteger2 = (o, k1, k2, $default) => {
    const n = asInteger(prop2(o, k1, k2));
    return isNumber(n) ? n : $default;
};
const safeIntegerProduct2 = (o, k1, k2, $factor, $default) => {
    const n = asInteger(prop2(o, k1, k2));
    return isNumber(n) ? parseInt(n * $factor) : $default;
};
const safeTimestamp2 = (o, k1, k2, $default) => {
    const n = asFloat(prop2(o, k1, k2));
    return isNumber(n) ? parseInt(n * 1000) : $default;
};
const safeValue2 = (o, k1, k2, $default) => {
    const x = prop2(o, k1, k2);
    return hasProps(x) ? x : $default;
};
const safeString2 = (o, k1, k2, $default) => {
    const x = prop2(o, k1, k2);
    return isStringCoercible(x) ? String(x) : $default;
};
const safeStringLower2 = (o, k1, k2, $default) => {
    const x = prop2(o, k1, k2);
    return isStringCoercible(x) ? String(x).toLowerCase() : $default;
};
const safeStringUpper2 = (o, k1, k2, $default) => {
    const x = prop2(o, k1, k2);
    return isStringCoercible(x) ? String(x).toUpperCase() : $default;
};
const safeFloatN = (o, k, $default) => {
    const n = asFloat(getValueFromKeysInArray(o, k));
    return isNumber(n) ? n : $default;
};
const safeIntegerN = (o, k, $default) => {
    if (o === undefined) {
        return $default;
    }
    const n = asInteger(getValueFromKeysInArray(o, k));
    return isNumber(n) ? n : $default;
};
const safeIntegerProductN = (o, k, $factor, $default) => {
    const n = asInteger(getValueFromKeysInArray(o, k));
    return isNumber(n) ? parseInt(n * $factor) : $default;
};
const safeTimestampN = (o, k, $default) => {
    const n = asFloat(getValueFromKeysInArray(o, k));
    return isNumber(n) ? parseInt(n * 1000) : $default;
};
const safeValueN = (o, k, $default) => {
    if (o === undefined) {
        return $default;
    }
    const x = getValueFromKeysInArray(o, k);
    return hasProps(x) ? x : $default;
};
const safeStringN = (o, k, $default) => {
    if (o === undefined) {
        return $default;
    }
    const x = getValueFromKeysInArray(o, k);
    return isStringCoercible(x) ? String(x) : $default;
};
const safeStringLowerN = (o, k, $default) => {
    if (o === undefined) {
        return $default;
    }
    const x = getValueFromKeysInArray(o, k);
    return isStringCoercible(x) ? String(x).toLowerCase() : $default;
};
const safeStringUpperN = (o, k, $default) => {
    const x = getValueFromKeysInArray(o, k);
    return isStringCoercible(x) ? String(x).toUpperCase() : $default;
};
/*  ------------------------------------------------------------------------ */

exports.asFloat = asFloat;
exports.asInteger = asInteger;
exports.hasProps = hasProps;
exports.isArray = isArray;
exports.isDictionary = isDictionary;
exports.isInteger = isInteger;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isString = isString;
exports.isStringCoercible = isStringCoercible;
exports.prop = prop;
exports.safeFloat = safeFloat;
exports.safeFloat2 = safeFloat2;
exports.safeFloatN = safeFloatN;
exports.safeInteger = safeInteger;
exports.safeInteger2 = safeInteger2;
exports.safeIntegerN = safeIntegerN;
exports.safeIntegerProduct = safeIntegerProduct;
exports.safeIntegerProduct2 = safeIntegerProduct2;
exports.safeIntegerProductN = safeIntegerProductN;
exports.safeString = safeString;
exports.safeString2 = safeString2;
exports.safeStringLower = safeStringLower;
exports.safeStringLower2 = safeStringLower2;
exports.safeStringLowerN = safeStringLowerN;
exports.safeStringN = safeStringN;
exports.safeStringUpper = safeStringUpper;
exports.safeStringUpper2 = safeStringUpper2;
exports.safeStringUpperN = safeStringUpperN;
exports.safeTimestamp = safeTimestamp;
exports.safeTimestamp2 = safeTimestamp2;
exports.safeTimestampN = safeTimestampN;
exports.safeValue = safeValue;
exports.safeValue2 = safeValue2;
exports.safeValueN = safeValueN;
