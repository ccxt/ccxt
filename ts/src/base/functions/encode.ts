/* eslint-disable */
/*  ------------------------------------------------------------------------ */

import { base16, base58, base64, utf8 } from "../../static_dependencies/scure-base/index.js";

import qs from '../../static_dependencies/qs/index.cjs'

/*  ------------------------------------------------------------------------ */

const json =  (data, params = undefined) => JSON.stringify (data)
    , isJsonEncodedObject = object => (
        (typeof object === 'string') &&
        (object.length >= 2) &&
        ((object[0] === '{') || (object[0] === '['))
    )
    , stringToBinary = utf8.decode
    , stringToBase64 = string => base64.encode (utf8.decode (string))
    , base64ToString = string => utf8.encode (base64.decode (string))
    , base64ToBinary = base64.decode
    , binaryToBase64 = base64.encode
    , base16ToBinary = base16.decode
    , binaryToBase16 = base16.encode
    , base58ToBinary = base58.decode
    , binaryToBase58 = base58.encode
    , binaryConcat = (...args) => {
        const sizes = args.map (a => a.byteLength)
        const newSize = sizes.reduce ((a, b) => a + b, 0)
        const result = new Uint8Array (newSize)
        let offset = 0
        for (let i = 0; i < sizes.length; i++) {
            result.set (args[i], offset)
            offset += sizes[i]
        }
        return result
    }
    , binaryConcatArray = (arr) => binaryConcat (...arr)

    , urlencode = object => qs.stringify (object)
    , urlencodeNested =  object => qs.stringify (object) // implemented only in python
    , urlencodeWithArrayRepeat = object => qs.stringify (object, { arrayFormat: 'repeat' })
    , rawencode = object => qs.stringify (object, { encode: false })
    , encode = x => x
    , decode = x => x

    // Url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores

    , urlencodeBase64 = base64string => base64string.replace (/[=]+$/, '')
                                                   .replace (/\+/g, '-')
                                                   .replace (/\//g, '_')

    , numberToLE = (n: Number, padding) => {


    }

    , numberToBE = (n: Number, padding = undefined) => {
    }


export {
    json
    , isJsonEncodedObject
    , stringToBinary
    , stringToBase64
    , base64ToBinary
    , base64ToString
    , binaryToBase64
    , base16ToBinary
    , binaryToBase16
    , binaryConcat
    , binaryConcatArray
    , urlencode
    , urlencodeWithArrayRepeat
    , rawencode
    , encode
    , decode
    // Url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores
    , urlencodeBase64
    , numberToLE
    , numberToBE
    , base58ToBinary
    , binaryToBase58
    , urlencodeNested
}

/*  ------------------------------------------------------------------------ */
