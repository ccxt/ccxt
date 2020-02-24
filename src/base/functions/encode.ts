/*  ------------------------------------------------------------------------ */

// const CryptoJS = require ('../../static_dependencies/crypto-js/crypto-js')
// const qs       = require ('../../static_dependencies/qs/index')
// const BN = require ('../../static_dependencies/BN/bn')
import * as CryptoJS from 'crypto-js'
import * as qs from 'qs'
import * as BN from 'bn.js'

/*  ------------------------------------------------------------------------ */

export const json = (data: any, params = undefined) => JSON.stringify (data)

export const unjson = JSON.parse

export const isJsonEncodedObject = (object: any) => (
    (typeof object === 'string') &&
    (object.length >= 2) &&
    ((object[0] === '{') || (object[0] === '['))
)

export function stringToBinary (str: string) {
    const arr = new Uint8Array (str.length)
    for (let i = 0; i < str.length; i++) { arr[i] = str.charCodeAt (i); }
    return CryptoJS.lib.WordArray.create (arr)
}

export const stringToBase64 = (string: string) => CryptoJS.enc.Latin1.parse (string).toString (CryptoJS.enc.Base64)
export const utf16ToBase64 =  (string: string) => CryptoJS.enc.Utf16 .parse (string).toString (CryptoJS.enc.Base64)
export const base64ToBinary = (string: string) => CryptoJS.enc.Base64.parse (string)
export const base64ToString = (string: string) => CryptoJS.enc.Base64.parse (string).toString (CryptoJS.enc.Utf8)
export const binaryToBase64 = (binary: any) => binary.toString (CryptoJS.enc.Base64)
export const base16ToBinary = (string: string) => CryptoJS.enc.Hex.parse (string)
export const binaryToBase16 = (binary: any) => binary.toString (CryptoJS.enc.Hex)
export const binaryConcat = <T>(...args: T[][]) => args.reduce ((a, b) => a.concat (b))
export const binaryConcatArray = <T>(arr: T[][]) => arr.reduce ((a, b) => a.concat (b))
export const urlencode = (object: object) => qs.stringify (object)
export const urlencodeWithArrayRepeat = (object: object) => qs.stringify (object, { arrayFormat: 'repeat' })
export const rawencode = (object: object) => qs.stringify (object, { encode: false })
export const encode = <T>(x: T) => x
export const decode = <T>(x: T) => x

// Url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores

export const urlencodeBase64 = (base64string: string) => base64string.replace (/[=]+$/, '')
                                                                     .replace (/\+/g, '-')
                                                                     .replace (/\//g, '_')

export const numberToLE = (n: number, padding: number) => {
    const hexArray = new BN (n).toArray ('le', padding)
    return byteArrayToWordArray (hexArray)
}

export const numberToBE = (n: number, padding: number) => {
    const hexArray = new BN (n).toArray ('be', padding)
    return byteArrayToWordArray (hexArray)
}

export function byteArrayToWordArray(ba: number[]) {
    const wa: number[] = []
    for (let i = 0; i < ba.length; i++) {
        wa[(i / 4) | 0] |= ba[i] << (24 - 8 * i)
    }
    return (<any>CryptoJS.lib.WordArray.create) (wa, ba.length)
}

/*  ------------------------------------------------------------------------ */
