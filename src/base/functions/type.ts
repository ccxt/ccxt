/*  ------------------------------------------------------------------------ */

const isNumber          = Number.isFinite
    , isArray           = Array.isArray
    , hasProps          = (o: any) => ((o !== undefined) && (o !== null))
    , isString          = (s: any) =>                 (typeof s === 'string')
    , isObject          = (o: any) => ((o !== null) && (typeof o === 'object'))
    , isDictionary      = (o: any) => (isObject (o) && !isArray (o))
    , isStringCoercible = (x: any) => ((hasProps (x) && x.toString) || isNumber (x))

/*  .............................................   */

const prop = (o: any, k: string) => (isObject (o) ? o[k] : undefined)
    , prop2 = (o: any, k1: string, k2: string) => (!isObject (o) ? undefined : (((k1 in o) && (o[k1] !== null)) ? o[k1] : o[k2]))

/*  .............................................   */

const asFloat   = (x: any) => ((isNumber (x) || isString (x)) ? parseFloat (x)     : NaN)
    , asInteger = (x: any) => ((isNumber (x) || isString (x)) ? parseInt   (x, 10) : NaN)

/*  .............................................   */

export default {

    isNumber
    , isArray
    , isObject
    , isString
    , isStringCoercible
    , isDictionary

    , hasProps
    , prop

    , asFloat
    , asInteger

    , safeFloat:          (o: any, k: string,                   $default: number, n: number =   asFloat (prop (o, k))) => (isNumber (n)          ? n                             : $default)
    , safeInteger:        (o: any, k: string,                   $default: number, n: number = asInteger (prop (o, k))) => (isNumber (n)          ? n                             : $default)
    , safeIntegerProduct: (o: any, k: string, $factor: number , $default: number, n: number = asInteger (prop (o, k))) => (isNumber (n)          ? parseInt (<any>(n * $factor)) : $default)
    , safeTimestamp:      (o: any, k: string,                   $default: number, n: number =   asFloat (prop (o, k))) => (isNumber (n)          ? parseInt (<any>(n * 1000))    : $default)
    , safeValue:          (o: any, k: string,                   $default: string, x: string =            prop (o, k))  => (hasProps (x)          ? x                             : $default)
    , safeString:         (o: any, k: string,                   $default: string, x: string =            prop (o, k))  => (isStringCoercible (x) ? String (x)                    : $default)
    , safeStringLower:    (o: any, k: string,                   $default: string, x: string =            prop (o, k))  => (isStringCoercible (x) ? String (x).toLowerCase ()     : $default)
    , safeStringUpper:    (o: any, k: string,                   $default: string, x: string =            prop (o, k))  => (isStringCoercible (x) ? String (x).toUpperCase ()     : $default)

    // not using safeFloats with an array argument as we're trying to save some cycles here
    // we're not using safeFloat3 either because those cases are too rare to deserve their own optimization

    , safeFloat2:          (o: any, k1: string, k2: string,                  $default: number, n: number =   asFloat (prop2 (o, k1, k2))) => (isNumber (n)          ? n                             : $default)
    , safeInteger2:        (o: any, k1: string, k2: string,                  $default: number, n: number = asInteger (prop2 (o, k1, k2))) => (isNumber (n)          ? n                             : $default)
    , safeIntegerProduct2: (o: any, k1: string, k2: string, $factor: number, $default: number, n: number = asInteger (prop2 (o, k1, k2))) => (isNumber (n)          ? parseInt (<any>(n * $factor)) : $default)
    , safeTimestamp2:      (o: any, k1: string, k2: string,                  $default: number, n: number =   asFloat (prop2 (o, k1, k2))) => (isNumber (n)          ? parseInt (<any>(n * 1000))    : $default)
    , safeValue2:          (o: any, k1: string, k2: string,                  $default: number, x: string =            prop2 (o, k1, k2))  => (hasProps (x)          ? x                             : $default)
    , safeString2:         (o: any, k1: string, k2: string,                  $default: number, x: string =            prop2 (o, k1, k2))  => (isStringCoercible (x) ? String (x)                    : $default)
    , safeStringLower2:    (o: any, k1: string, k2: string,                  $default: number, x: string =            prop2 (o, k1, k2))  => (isStringCoercible (x) ? String (x).toLowerCase ()     : $default)
    , safeStringUpper2:    (o: any, k1: string, k2: string,                  $default: number, x: string =            prop2 (o, k1, k2))  => (isStringCoercible (x) ? String (x).toUpperCase ()     : $default)

}

/*  ------------------------------------------------------------------------ */
