"use strict";

/*  ------------------------------------------------------------------------ */

const CryptoJS = require ('crypto-js')
const qs       = require ('qs') // querystring (TODO: get rid of that dependency)

/*  ------------------------------------------------------------------------ */

module.exports =

    { json:   (data, params = undefined) => JSON.stringify (data)
    , unjson: JSON.parse

    , stringToBinary (str) {
        const arr = new Uint8Array (str.length)
        for (let i = 0; i < str.length; i++) { arr[i] = str.charCodeAt (i); }
        return CryptoJS.lib.WordArray.create (arr)
    }

    , stringToBase64: string => CryptoJS.enc.Latin1.parse (string).toString (CryptoJS.enc.Base64)
    , utf16ToBase64:  string => CryptoJS.enc.Utf16 .parse (string).toString (CryptoJS.enc.Base64)
    , base64ToBinary: string => CryptoJS.enc.Base64.parse (string)
    , base64ToString: string => CryptoJS.enc.Base64.parse (string).toString (CryptoJS.enc.Utf8)
    , binaryToString: string => string

    , binaryConcat: (...args) => args.reduce ((a, b) => a.concat (b))

    , urlencode: object => qs.stringify (object)
    , rawencode: object => qs.stringify (object, { encode: false })

    // Url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores

    , urlencodeBase64: base64string => base64string.replace (/[=]+$/, '')
                                                   .replace (/\+/g, '-')
                                                   .replace (/\//g, '_')
}

/*  ------------------------------------------------------------------------ */
