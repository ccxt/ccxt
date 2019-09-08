"use strict";

/*  ------------------------------------------------------------------------ */

const CryptoJS = require ('../../static_dependencies/crypto-js/crypto-js')
const qs       = require ('../../static_dependencies/qs/index')

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
    , binaryToBase64: binary => binary.toString (CryptoJS.enc.Base64)
    , base16ToBinary: string => CryptoJS.enc.Hex.parse (string)

    , binaryConcat: (...args) => args.reduce ((a, b) => a.concat (b))

    , urlencode: object => qs.stringify (object)
    , rawencode: object => qs.stringify (object, { encode: false })
    , encode: x => x
    , decode: x => x

    // Url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores

    , urlencodeBase64: base64string => base64string.replace (/[=]+$/, '')
                                                   .replace (/\+/g, '-')
                                                   .replace (/\//g, '_')

    , numberToLE: function (n, padding, wordArray = undefined) {
        if (wordArray === undefined) {
            wordArray = new CryptoJS.lib.WordArray.init ()
            wordArray.words[0] = 0
        } else if (n === 0) {
            if (padding > wordArray.sigBytes) {
                // i have no words
                const toPad = padding - wordArray.sigBytes
                const padInteger = toPad % 4
                wordArray.words[0] = (wordArray.words[0] >> (8 * padInteger)) & ((1 << (8 * (4 - padInteger))) - 1)
                wordArray.words = new Array (Math.floor (toPad / 4)).fill (0).concat (wordArray.words)
                wordArray.sigBytes = padding
            }
            return wordArray
        }
        wordArray.words[0] += (n % 256) << (24 - (8 * wordArray.sigBytes))
        wordArray.sigBytes++
        return this.numberToLE (Math.floor (n / 256), padding, wordArray)
    }
    , numberToBE: function (n, padding) {
        const sigBytes = 1 + (n > 0xFF) + (n > 0xFF00) + (n > 0xFF0000)
        const wordArray = new CryptoJS.lib.WordArray.init ()
        wordArray.words[0] = n << (8 * (4 - sigBytes))
        wordArray.sigBytes = Math.max (sigBytes, padding)
        return wordArray
    }
}
/*  ------------------------------------------------------------------------ */
