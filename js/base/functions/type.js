"use strict";

/*  ------------------------------------------------------------------------ */

const isNumber          = Number.isFinite
    , isArray           = Array.isArray
    , isString          = s =>                 (typeof s === 'string')
    , isObject          = o => (o !== null) && (typeof o === 'object')
    , isDictionary      = o => (isObject (o) && !isArray (o))
    , isStringCoercible = x => (hasProps (x) && x.toString) || isNumber (x)

/*  .............................................   */

const hasProps = o => (o !== undefined) &&
                      (o !== null)

    , prop = (o, k) => isObject (o) ? o[k]
                                    : undefined

/*  .............................................   */

const asFloat   = x => (isNumber (x) || isString (x)) ? parseFloat (x)     : NaN
    , asInteger = x => (isNumber (x) || isString (x)) ? parseInt   (x, 10) : NaN

/*  .............................................   */

module.exports =

    { isNumber
    , isArray
    , isObject
    , isString
    , isStringCoercible
    , isDictionary

    , hasProps
    , prop

    , asFloat
    , asInteger
    
    , safeFloat:   (o, k, $default, n =   asFloat (prop (o, k))) => isNumber (n)          ? n          : $default
    , safeInteger: (o, k, $default, n = asInteger (prop (o, k))) => isNumber (n)          ? n          : $default
    , safeValue:   (o, k, $default, x =            prop (o, k) ) => hasProps (x)          ? x          : $default
    , safeString:  (o, k, $default, x =            prop (o, k) ) => isStringCoercible (x) ? String (x) : $default

    }

/*  ------------------------------------------------------------------------ */
