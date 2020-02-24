/*  ------------------------------------------------------------------------ */

export const isNumber          = Number.isFinite
export const isArray           = Array.isArray
export const hasProps          = (o: any) => ((o !== undefined) && (o !== null))
export const isString          = (s: any) =>                 (typeof s === 'string')
export const isObject          = (o: any) => ((o !== null) && (typeof o === 'object'))
export const isDictionary      = (o: any) => (isObject (o) && !isArray (o))
export const isStringCoercible = (x: any) => ((hasProps (x) && x.toString) || isNumber (x))

/*  .............................................   */

const prop = <T>(o: T, k: keyof T) => (isObject (o) ? o[k] : undefined)
    , prop2 = (o: any, k1: string, k2: string) => (!isObject (o) ? undefined : (((k1 in o) && (o[k1] !== null)) ? o[k1] : o[k2]))

/*  .............................................   */

const asFloat   = (x: any) => ((isNumber (x) || isString (x)) ? parseFloat (x)     : NaN)
    , asInteger = (x: any) => ((isNumber (x) || isString (x)) ? parseInt   (x, 10) : NaN)

/*  .............................................   */

export const safeFloat          = <T>(o: Dictionary<T>, k: string | number,                   $default?: number, n: number =   asFloat (prop (o, k))) => (isNumber (n)          ? n                             : $default)
export const safeInteger        = <T>(o: Dictionary<T>, k: string | number,                   $default?: number, n: number = asInteger (prop (o, k))) => (isNumber (n)          ? n                             : $default)
export const safeIntegerProduct = <T>(o: Dictionary<T>, k: string | number, $factor: number , $default?: number, n: number = asInteger (prop (o, k))) => (isNumber (n)          ? parseInt (<any>(n * $factor)) : $default)
export const safeTimestamp      = <T>(o: Dictionary<T>, k: string | number,                   $default?: number, n: number =   asFloat (prop (o, k))) => (isNumber (n)          ? parseInt (<any>(n * 1000))    : $default)
export const safeValue          = <T>(o: Dictionary<T>, k: string | number,                   $default?: string, x                    = prop (o, k))  => (hasProps (x)          ? x                             : $default)
export const safeString         = <T>(o: Dictionary<T>, k: string | number,                   $default?: string, x                    = prop (o, k))  => (isStringCoercible (x) ? String (x)                    : $default)
export const safeStringLower    = <T>(o: Dictionary<T>, k: string | number,                   $default?: string, x                    = prop (o, k))  => (isStringCoercible (x) ? String (x).toLowerCase ()     : $default)
export const safeStringUpper    = <T>(o: Dictionary<T>, k: string | number,                   $default?: string, x                    = prop (o, k))  => (isStringCoercible (x) ? String (x).toUpperCase ()     : $default)

// not using safeFloats with an array argument as we're trying to save some cycles here
// we're not using safeFloat3 either because those cases are too rare to deserve their own optimization

export const safeFloat2          = (o: any, k1: string, k2: string,                  $default: number, n: number =   asFloat (prop2 (o, k1, k2))) => (isNumber (n)          ? n                             : $default)
export const safeInteger2        = (o: any, k1: string, k2: string,                  $default: number, n: number = asInteger (prop2 (o, k1, k2))) => (isNumber (n)          ? n                             : $default)
export const safeIntegerProduct2 = (o: any, k1: string, k2: string, $factor: number, $default: number, n: number = asInteger (prop2 (o, k1, k2))) => (isNumber (n)          ? parseInt (<any>(n * $factor)) : $default)
export const safeTimestamp2      = (o: any, k1: string, k2: string,                  $default: number, n: number =   asFloat (prop2 (o, k1, k2))) => (isNumber (n)          ? parseInt (<any>(n * 1000))    : $default)
export const safeValue2          = (o: any, k1: string, k2: string,                  $default: string, x: string =            prop2 (o, k1, k2))  => (hasProps (x)          ? x                             : $default)
export const safeString2         = (o: any, k1: string, k2: string,                  $default: string, x: string =            prop2 (o, k1, k2))  => (isStringCoercible (x) ? String (x)                    : $default)
export const safeStringLower2    = (o: any, k1: string, k2: string,                  $default: string, x: string =            prop2 (o, k1, k2))  => (isStringCoercible (x) ? String (x).toLowerCase ()     : $default)
export const safeStringUpper2    = (o: any, k1: string, k2: string,                  $default: string, x: string =            prop2 (o, k1, k2))  => (isStringCoercible (x) ? String (x).toUpperCase ()     : $default)

/*  ------------------------------------------------------------------------ */
