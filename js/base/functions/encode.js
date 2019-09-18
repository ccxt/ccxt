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
    , binaryToBase16: binary => binary.toString (CryptoJS.enc.Hex)
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
        n = parseInt (n)
        if (wordArray === undefined) {
            wordArray = new CryptoJS.lib.WordArray.init ()
        } else if (n === 0) {
            CryptoJS.pad.ZeroPadding.pad (wordArray, padding)
            return wordArray
        }
        const remainder = wordArray.sigBytes % 4
        const byte = (n % 0x100) << (24 - (8 * remainder))
        if (remainder === 0) {
            wordArray.words.push (byte)
        } else {
            wordArray.words[wordArray.words.length - 1] += byte
        }
        wordArray.sigBytes++
        return this.numberToLE (Math.floor (n / 256), padding, wordArray)
    }

    , numberToBE: (n, padding) => {
        n = parseInt (n)
        const wordArray = new CryptoJS.lib.WordArray.init ()
        const shiftAmount = padding % 4
        const firstByte = n >>> (8 * shiftAmount)
        const secondByte = n << (8 * (4 - shiftAmount))
        const zeros = Math.max (0, Math.floor (padding / 4) - 1)
        const bytes = padding > 4 ? [firstByte, secondByte] : [secondByte]
        wordArray.words = Array (zeros).fill (0).concat (bytes)
        wordArray.sigBytes = padding
        return wordArray
    }
}
/*  ------------------------------------------------------------------------ */
