"use strict";

//-----------------------------------------------------------------------------

const CryptoJS = require ('crypto-js')
    , qs       = require ('qs') // querystring

//-----------------------------------------------------------------------------

const { RequestTimeout } = require ('./errors')

//-----------------------------------------------------------------------------
// utility helpers

const setTimeout_safe = (done, ms, targetTime = Date.now () + ms) => { // setTimeout can fire earlier than specified, so we need to ensure it does not happen...

    setTimeout (() => {
        const rest = targetTime - Date.now ()
        if (rest > 0) {
            setTimeout_safe (done, rest, targetTime) // try sleep more
        } else {
            done ()
        }
    }, ms)
}

const sleep = ms => new Promise (resolve => setTimeout_safe (resolve, ms))

const decimal = float => parseFloat (float).toString ()

const timeout = (ms, promise) =>
        Promise.race ([
            promise,
            sleep (ms).then (() => { throw new RequestTimeout ('request timed out') })
        ])

const capitalize = string => string.length ? (string.charAt (0).toUpperCase () + string.slice (1)) : string

const keysort = object => {
    const result = {}
    Object.keys (object).sort ().forEach (key => result[key] = object[key])
    return result
}

const extend = (...args) => Object.assign ({}, ...args)

const deepExtend = function (...args) {

    // if (args.length < 1)
    //     return args
    // else if (args.length < 2)
    //     return args[0]

    let result = undefined

    for (const arg of args) {

        if (arg && (typeof arg == 'object') && (arg.constructor === Object || !('constructor' in arg))) {

            if (typeof result != 'object') {
                result = {}
            }

            for (const key in arg) {
                result[key] = deepExtend (result[key], arg[key])
            }

        } else {

            result = arg
        }
    }

    return result
}

const omit = (object, ...args) => {
    const result = extend (object)
    for (const x of args) {
        if (typeof x === 'string') {
            delete result[x]
        } else if (Array.isArray (x)) {
            for (const k of x)
                delete result[k]
        }
    }
    return result
}

const groupBy = (array, key) => {
    const result = {}
    Object
        .values (array)
        .filter (entry => entry[key] != 'undefined')
        .forEach (entry => {
            if (typeof result[entry[key]] == 'undefined')
                result[entry[key]] = []
            result[entry[key]].push (entry)
        })
    return result
}

const filterBy = (array, key, value = undefined) => {
    if (value) {
        let grouped = groupBy (array, key)
        if (value in grouped)
            return grouped[value]
        return []
    }
    return array
}

const indexBy = (array, key) => {
    const result = {}
    Object
        .values (array)
        .filter (entry => entry[key] != 'undefined')
        .forEach (entry => {
            result[entry[key]] = entry
        })
    return result
}

const sortBy = (array, key, descending = false) => {
    descending = descending ? -1 : 1
    return array.sort ((a, b) => ((a[key] < b[key]) ? -descending : ((a[key] > b[key]) ? descending : 0)))
}

const flatten = (array, result = []) => {
    for (let i = 0, length = array.length; i < length; i++) {
        const value = array[i]
        if (Array.isArray (value)) {
            flatten (value, result)
        } else {
            result.push (value)
        }
    }
    return result
}

const unique = array => array.filter ((value, index, self) => (self.indexOf (value) == index))

const pluck = (array, key) => array
                                .filter (element => (typeof element[key] != 'undefined'))
                                .map (element => element[key])

const urlencode = object => qs.stringify (object)
const rawencode = object => qs.stringify (object, { encode: false })

const sum = (...args) => {
    const result = args.filter (arg => typeof arg != 'undefined')
    return (result.length > 0) ?
        result.reduce ((sum, value) => sum + value, 0) : undefined
}

const safeFloat = (object, key, defaultValue = undefined) => {
    if (key in object) {
        if (typeof object[key] == 'number')
            return object[key]
        else if ((typeof object[key] == 'string') && object[key])
            return parseFloat (object[key])
    }
    return defaultValue
}

const safeString = (object, key, defaultValue = undefined) => {
    return ((key in object) && object[key]) ? object[key].toString () : defaultValue
}

const safeInteger = (object, key, defaultValue = undefined) => {
    return ((key in object) && object[key]) ? parseInt (object[key]) : defaultValue
}

const safeValue = (object, key, defaultValue = undefined) => {
    return ((key in object) && object[key]) ? object[key] : defaultValue
}


// See https://stackoverflow.com/questions/1685680/how-to-avoid-scientific-notation-for-large-numbers-in-javascript for discussion

function toFixed (x) { // avoid scientific notation for too large and too small numbers

    if (Math.abs (x) < 1.0) {
        const e = parseInt (x.toString ().split ('e-')[1])
        if (e) {
            x *= Math.pow (10, e-1)
            x = '0.' + (new Array (e)).join ('0') + x.toString ().substring (2)
        }
    } else {
        let e = parseInt (x.toString ().split ('+')[1])
        if (e > 20) {
            e -= 20
            x /= Math.pow (10, e)
            x += (new Array (e+1)).join ('0')
        }
    }
    return x
}

// See https://stackoverflow.com/questions/4912788/truncate-not-round-off-decimal-numbers-in-javascript for discussion

// > So, after all it turned out, rounding bugs will always haunt you, no matter how hard you try to compensate them.
// > Hence the problem should be attacked by representing numbers exactly in decimal notation.

const truncate_regExpCache = []
    , truncate = (num, precision = 0) => {
        num = toFixed (num)
        const re = truncate_regExpCache[precision] || (truncate_regExpCache[precision] = new RegExp("([-]*\\d+\\.\\d{" + precision + "})(\\d)"))
        const [,result] = num.toString ().match (re) || [null, num]
        return parseFloat (result)
    }

const ordered = x => x // a stub to keep assoc keys in order, in JS it does nothing, it's mostly for Python

const aggregate = function (bidasks) {

    let result = {}

    bidasks.forEach (([ price, volume ]) => {
        result[price] = (result[price] || 0) + volume
    })

    return Object.keys (result).map (price => [
        parseFloat (price),
        parseFloat (result[price]),
    ])
}

//-----------------------------------------------------------------------------
// string ←→ binary ←→ base64 conversion routines

const stringToBinary = str => {
    const arr = new Uint8Array (str.length)
    for (let i = 0; i < str.length; i++) { arr[i] = str.charCodeAt(i); }
    return CryptoJS.lib.WordArray.create (arr)
}

const stringToBase64 = string => CryptoJS.enc.Latin1.parse (string).toString (CryptoJS.enc.Base64)
    , utf16ToBase64  = string => CryptoJS.enc.Utf16 .parse (string).toString (CryptoJS.enc.Base64)
    , base64ToBinary = string => CryptoJS.enc.Base64.parse (string)
    , base64ToString = string => CryptoJS.enc.Base64.parse (string).toString (CryptoJS.enc.Utf8)
    , binaryToString = string => string

const binaryConcat = (...args) => args.reduce ((a, b) => a.concat (b))

// url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores
const urlencodeBase64 = base64string => base64string.replace (/[=]+$/, '')
                                                    .replace (/\+/g, '-')
                                                    .replace (/\//g, '_')

//-----------------------------------------------------------------------------
// cryptography

const hash = (request, hash = 'md5', digest = 'hex') => {
    const result = CryptoJS[hash.toUpperCase ()] (request)
    return (digest == 'binary') ? result : result.toString (CryptoJS.enc[capitalize (digest)])
}

const hmac = (request, secret, hash = 'sha256', digest = 'hex') => {
    const encoding = (digest == 'binary') ? 'Latin1' : capitalize (digest)
    return CryptoJS['Hmac' + hash.toUpperCase ()] (request, secret).toString (CryptoJS.enc[capitalize (encoding)])
}

//-----------------------------------------------------------------------------
// a JSON Web Token authentication method

const jwt = (request, secret, alg = 'HS256', hash = 'sha256') => {
    const encodedHeader = urlencodeBase64 (stringToBase64 (JSON.stringify ({ 'alg': alg, 'typ': 'JWT' })))
        , encodedData = urlencodeBase64 (stringToBase64 (JSON.stringify (request)))
        , token = [ encodedHeader, encodedData ].join ('.')
        , signature = urlencodeBase64 (utf16ToBase64 (hmac (token, secret, hash, 'utf16')))
    return [ token, signature ].join ('.')
}

//-----------------------------------------------------------------------------

module.exports = {

    // common utility functions

    sleep,
    timeout,
    capitalize,
    keysort,
    extend,
    deepExtend,
    omit,
    groupBy,
    indexBy,
    sortBy,
    filterBy,
    flatten,
    unique,
    pluck,
    urlencode,
    rawencode,
    sum,
    decimal,
    safeFloat,
    safeString,
    safeInteger,
    safeValue,
    ordered,
    aggregate,
    truncate,

    // underscore aliases

    index_by: indexBy,
    sort_by: sortBy,
    group_by: groupBy,
    filter_by: filterBy,
    safe_float: safeFloat,
    safe_string: safeString,
    safe_integer: safeInteger,
    safe_value: safeValue,

    // crypto functions

    binaryConcat,
    stringToBinary,
    binaryToString,
    stringToBase64,
    utf16ToBase64,
    base64ToBinary,
    base64ToString,
    urlencodeBase64,
    hash,
    hmac,
    jwt,

    // json
    json:   JSON.stringify,
    unjson: JSON.parse
}