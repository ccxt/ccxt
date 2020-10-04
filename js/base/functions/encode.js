"use strict";

/*  ------------------------------------------------------------------------ */

const CryptoJS = require ('../../static_dependencies/crypto-js/crypto-js')
const qs       = require ('../../static_dependencies/qs/index')
const BN = require ('../../static_dependencies/BN/bn')


/*  ------------------------------------------------------------------------ */

// global vars for base58 encoding
const base58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
let base58Decoder = null
let base58Encoder = null

/*  ------------------------------------------------------------------------ */

module.exports =

    { json:   (data, params = undefined) => JSON.stringify (data)
    , unjson: JSON.parse

    , isJsonEncodedObject: object => (
        (typeof object === 'string') &&
        (object.length >= 2) &&
        ((object[0] === '{') || (object[0] === '['))
    )

    , stringToBinary: string => CryptoJS.enc.Latin1.parse (string)
    , stringToBase64: string => CryptoJS.enc.Latin1.parse (string).toString (CryptoJS.enc.Base64)
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

    , base58ToBinary: (string) => {
        if (!base58Decoder) {
            base58Decoder = {}
            base58Encoder = {}
            for (let i = 0; i < 58; i++) {
                const c = base58Alphabet[i]
                const bigNum = new BN (i)
                base58Decoder[c] = bigNum
                base58Encoder[bigNum] = c
            }
        }
        let result = new BN (0)
        const base = new BN (58)
        for (let i = 0; i < string.length; i++) {
            const character = string[i]
            result.imul (base)
            result.iadd (base58Decoder[character])
        }
        return byteArrayToWordArray (result.toArray ('be'))
    }

    , binaryToBase58: (wordArray) => {
        if (!base58Encoder) {
            base58Decoder = {}
            base58Encoder = {}
            for (let i = 0; i < 58; i++) {
                const c = base58Alphabet[i]
                const bigNum = new BN (i)
                base58Decoder[c] = bigNum
                base58Encoder[bigNum] = c
            }
        }
        const base = new BN (58)
        // hex is only compatible encoding between cryptojs and BN
        const hexString = wordArray.toString (CryptoJS.enc.Hex)
        let result = new BN (hexString, 16)
        let string = []
        while (!result.isZero ()) {
            const { div, mod } = result.divmod (base)
            result = div
            string.push (base58Encoder[mod])
        }
        return string.reverse ().join ('')
    }
}

function byteArrayToWordArray (ba) {
    const wa = []
    for (let i = 0; i < ba.length; i++) {
        wa[(i / 4) | 0] |= ba[i] << (24 - 8 * i)
    }
    return CryptoJS.lib.WordArray.create (wa, ba.length)
}

module.exports['byteArrayToWordArray'] = byteArrayToWordArray

/*  ------------------------------------------------------------------------ */
