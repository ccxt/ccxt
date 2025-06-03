/* eslint-disable */
/*  ------------------------------------------------------------------------ */

import { base16, base58, base64, utf8 } from "../../static_dependencies/scure-base/index.js";
import { numberToBytesBE, numberToBytesLE, concatBytes } from '../../static_dependencies/noble-curves/abstract/utils.js';
import { serialize } from '../../static_dependencies/messagepack/msgpack.js'

import qs from '../../static_dependencies/qs/index.cjs'

/*  ------------------------------------------------------------------------ */

const json =  (data: any, params = undefined) => JSON.stringify (data)
    , isJsonEncodedObject = (object: any) => (
        (typeof object === 'string') &&
        (object.length >= 2) &&
        ((object[0] === '{') || (object[0] === '['))
    )
    , binaryToString = utf8.encode
    , stringToBinary = utf8.decode
    , stringToBase64 = (string: string) => base64.encode (utf8.decode (string))
    , base64ToString = (string: string) => utf8.encode (base64.decode (string))
    , base64ToBinary = base64.decode
    , binaryToBase64 = base64.encode
    , base16ToBinary = base16.decode
    , binaryToBase16 = base16.encode
    , base58ToBinary = base58.decode
    , binaryToBase58 = base58.encode
    , binaryConcat = concatBytes
    , binaryConcatArray = (arr: any[]) => concatBytes (...arr)

    , urlencode = (object: object, sort = false) => qs.stringify (object)
    , urlencodeNested =  (object: object) => qs.stringify (object) // implemented only in python
    , urlencodeWithArrayRepeat = (object: object) => qs.stringify (object, { arrayFormat: 'repeat' })
    , rawencode = (object: object) => qs.stringify (object, { encode: false })
    , encode = utf8.decode // lol
    , decode = utf8.encode

    // Url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores

    , urlencodeBase64 = (payload: string | Uint8Array) => {
        const payload64 = (typeof payload === 'string') ? stringToBase64 (payload) : binaryToBase64 (payload)
        return payload64.replace (/[=]+$/, '')
            .replace (/\+/g, '-')
            .replace (/\//g, '_')
    }

    , numberToLE = (n: number, padding: number) => numberToBytesLE (BigInt (n), padding)

    , numberToBE = (n: number, padding: number) => numberToBytesBE (BigInt (n), padding)


    function packb(req: any) {
        return serialize(req);
    }

export {
    json
    , isJsonEncodedObject
    , binaryToString
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
    , packb
}

/*  ------------------------------------------------------------------------ */
