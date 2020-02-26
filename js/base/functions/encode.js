"use strict";

/*  ------------------------------------------------------------------------ */

const CryptoJS = require ('../../static_dependencies/crypto-js/crypto-js')
const qs       = require ('../../static_dependencies/qs/index')
const BN = require ('../../static_dependencies/BN/bn')

/*  ------------------------------------------------------------------------ */

module.exports =

    { json:   (data, params = undefined) => JSON.stringify (data)
    , unjson: JSON.parse

    , isJsonEncodedObject: object => (
        (typeof object === 'string') &&
        (object.length >= 2) &&
        ((object[0] === '{') || (object[0] === '['))
    )

    , stringToBinary (str) {
        const arr = new Uint8Array (str.length)
        for (let i = 0; i < str.length; i++) { arr[i] = str.charCodeAt (i); }
        return CryptoJS.lib.WordArray.create (arr)
    }

    , stringToBase64: string => CryptoJS.enc.Latin1.parse (string).toString (CryptoJS.enc.Base64)
    , utf16ToBase64:  string => CryptoJS.enc.Utf16 .parse (string).toString (CryptoJS.enc.Base64)
    , base64ToBinary: string => CryptoJS.enc.Base64.parse (string)
    , base64ToString: string => CryptoJS.enc.Base64.parse (string).toString (CryptoJS.enc.Utf8)
    , binaryToBase64: binary => binary.toString (CryptoJS.enc.Base64)
    , base16ToBinary: string => CryptoJS.enc.Hex.parse (string)
    , binaryToBase16: binary => binary.toString (CryptoJS.enc.Hex)
    , binaryConcat: (...args) => args.reduce ((a, b) => a.concat (b))
    , binaryConcatArray: (arr) => arr.reduce ((a, b) => a.concat (b))

    , urlencode: object => qs.stringify (object)
    , urlencodeWithArrayRepeat: object => qs.stringify (object, { arrayFormat: 'repeat' })
    , rawencode: object => qs.stringify (object, { encode: false })
    , encode: x => x
    , decode: x => x

    // Url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores

    , urlencodeBase64: base64string => base64string.replace (/[=]+$/, '')
                                                   .replace (/\+/g, '-')
                                                   .replace (/\//g, '_')

    , numberToLE: (n, padding) => {
        const hexArray = new BN (n).toArray ('le', padding)
        return byteArrayToWordArray (hexArray)
    }

    , numberToBE: (n, padding) => {
        const hexArray = new BN (n).toArray ('be', padding)
        return byteArrayToWordArray (hexArray)
    }
}

function byteArrayToWordArray(ba) {
    const wa = []
    for (let i = 0; i < ba.length; i++) {
        wa[(i / 4) | 0] |= ba[i] << (24 - 8 * i)
    }
    return CryptoJS.lib.WordArray.create (wa, ba.length)
}

module.exports['byteArrayToWordArray'] = byteArrayToWordArray

/*  ------------------------------------------------------------------------ */
