"use strict";

/*  ------------------------------------------------------------------------ */

const isNumber          = Number.isFinite
    , isInteger         = Number.isInteger
    , isArray           = Array.isArray
    , hasProps          = o => ((o !== undefined) && (o !== null))
    , isString          = s => (typeof s === 'string')
    , isObject          = o => ((o !== null) && (typeof o === 'object'))
    , isRegExp          = o => (o instanceof RegExp)
    , isDictionary      = o => (isObject (o) && (Object.getPrototypeOf (o) === Object.prototype) && !isArray (o) && !isRegExp (o))
    , isStringCoercible = x => ((hasProps (x) && x.toString) || isNumber (x))

/*  .............................................   */

const prop = (o, k) => (isObject (o) && o[k] !== '' && o[k] !== null ? o[k] : undefined)
    , prop2 = (o, k1, k2) => (
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
    )
    , getValueFromKeysInArray = (object, array) => object[array.find (k => prop (object,k) !== undefined)]

/*  .............................................   */

const asFloat   = x => ((isNumber (x) || (isString (x) && x.length !== 0)) ? parseFloat (x) : NaN)
    , asInteger = x => ((isNumber (x) || (isString (x) && x.length !== 0)) ? Math.trunc (Number(x)) : NaN)

/*  .............................................   */

module.exports = {

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

    , safeFloat:          (o, k,          $default, n =   asFloat (prop (o, k))) => (isNumber (n)          ? n                         : $default)
    , safeInteger:        (o, k,          $default, n = asInteger (prop (o, k))) => (isNumber (n)          ? n                         : $default)
    , safeIntegerProduct: (o, k, $factor, $default, n = asInteger (prop (o, k))) => (isNumber (n)          ? parseInt (n * $factor)    : $default)
    , safeTimestamp:      (o, k,          $default, n =   asFloat (prop (o, k))) => (isNumber (n)          ? parseInt (n * 1000)       : $default)
    , safeValue:          (o, k,          $default, x =            prop (o, k))  => (hasProps (x)          ? x                         : $default)
    , safeString:         (o, k,          $default, x =            prop (o, k))  => (isStringCoercible (x) ? String (x)                : $default)
    , safeStringLower:    (o, k,          $default, x =            prop (o, k))  => (isStringCoercible (x) ? String (x).toLowerCase () : $default ? $default.toLowerCase () : $default)
    , safeStringUpper:    (o, k,          $default, x =            prop (o, k))  => (isStringCoercible (x) ? String (x).toUpperCase () : $default ? $default.toUpperCase () : $default)

    // not using safeFloats with an array argument as we're trying to save some cycles here
    // we're not using safeFloat3 either because those cases are too rare to deserve their own optimization

    , safeFloat2:          (o, k1, k2,          $default, n =   asFloat (prop2 (o, k1, k2))) => (isNumber (n)          ? n                         : $default)
    , safeInteger2:        (o, k1, k2,          $default, n = asInteger (prop2 (o, k1, k2))) => (isNumber (n)          ? n                         : $default)
    , safeIntegerProduct2: (o, k1, k2, $factor, $default, n = asInteger (prop2 (o, k1, k2))) => (isNumber (n)          ? parseInt (n * $factor)    : $default)
    , safeTimestamp2:      (o, k1, k2,          $default, n =   asFloat (prop2 (o, k1, k2))) => (isNumber (n)          ? parseInt (n * 1000)       : $default)
    , safeValue2:          (o, k1, k2,          $default, x =            prop2 (o, k1, k2))  => (hasProps (x)          ? x                         : $default)
    , safeString2:         (o, k1, k2,          $default, x =            prop2 (o, k1, k2))  => (isStringCoercible (x) ? String (x)                : $default)
    , safeStringLower2:    (o, k1, k2,          $default, x =            prop2 (o, k1, k2))  => (isStringCoercible (x) ? String (x).toLowerCase () : $default ? $default.toLowerCase () : $default)
    , safeStringUpper2:    (o, k1, k2,          $default, x =            prop2 (o, k1, k2))  => (isStringCoercible (x) ? String (x).toUpperCase () : $default ? $default.toUpperCase () : $default)

    // safeMethodN
    , safeFloatN:          (o, k,          $default, n =   asFloat (getValueFromKeysInArray (o, k))) => (isNumber (n)          ? n                         : $default)
    , safeIntegerN:        (o, k,          $default, n = asInteger (getValueFromKeysInArray (o, k))) => (isNumber (n)          ? n                         : $default)
    , safeIntegerProductN: (o, k, $factor, $default, n = asInteger (getValueFromKeysInArray (o, k))) => (isNumber (n)          ? parseInt (n * $factor)    : $default)
    , safeTimestampN:      (o, k,          $default, n =   asFloat (getValueFromKeysInArray (o, k))) => (isNumber (n)          ? parseInt (n * 1000)       : $default)
    , safeValueN:          (o, k,          $default, x =            getValueFromKeysInArray (o, k))  => (hasProps (x)          ? x                         : $default)
    , safeStringN:         (o, k,          $default, x =            getValueFromKeysInArray (o, k))  => (isStringCoercible (x) ? String (x)                : $default)
    , safeStringLowerN:    (o, k,          $default, x =            getValueFromKeysInArray (o, k))  => (isStringCoercible (x) ? String (x).toLowerCase () : $default ? $default.toLowerCase () : $default)
    , safeStringUpperN:    (o, k,          $default, x =            getValueFromKeysInArray (o, k))  => (isStringCoercible (x) ? String (x).toUpperCase () : $default ? $default.toUpperCase () : $default)
}

/*  ------------------------------------------------------------------------ */
