'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var cryptoJs = require('../../static_dependencies/crypto-js/crypto-js.cjs.js');
var index = require('../../static_dependencies/qs/index.cjs.js');
var bn = require('../../static_dependencies/BN/bn.cjs.js');

/* eslint-disable */
/*  ------------------------------------------------------------------------ */
// global vars for base58 encoding
const base58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
let base58Decoder = null;
let base58Encoder = null;
/*  ------------------------------------------------------------------------ */
const json = (data, params = undefined) => JSON.stringify(data), isJsonEncodedObject = object => ((typeof object === 'string') &&
    (object.length >= 2) &&
    ((object[0] === '{') || (object[0] === '['))), stringToBinary = string => cryptoJs.enc.Latin1.parse(string), stringToBase64 = string => cryptoJs.enc.Latin1.parse(string).toString(cryptoJs.enc.Base64), base64ToBinary = string => cryptoJs.enc.Base64.parse(string), base64ToString = string => cryptoJs.enc.Base64.parse(string).toString(cryptoJs.enc.Utf8), binaryToBase64 = binary => binary.toString(cryptoJs.enc.Base64), base16ToBinary = string => cryptoJs.enc.Hex.parse(string), binaryToBase16 = binary => binary.toString(cryptoJs.enc.Hex), binaryConcat = (...args) => args.reduce((a, b) => a.concat(b)), binaryConcatArray = (arr) => arr.reduce((a, b) => a.concat(b)), urlencode = object => index.stringify(object), urlencodeNested = object => index.stringify(object) // implemented only in python
, urlencodeWithArrayRepeat = object => index.stringify(object, { arrayFormat: 'repeat' }), rawencode = object => index.stringify(object, { encode: false }), encode = x => x, decode = x => x
// Url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores
, urlencodeBase64 = base64string => base64string.replace(/[=]+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_'), numberToLE = (n, padding) => {
    const hexArray = new bn(n).toArray('le', padding);
    return byteArrayToWordArray(hexArray);
}, numberToBE = (n, padding = undefined) => {
    const hexArray = new bn(n).toArray('be', padding);
    return byteArrayToWordArray(hexArray);
}, base58ToBinary = (string) => {
    if (!base58Decoder) {
        base58Decoder = {};
        base58Encoder = {};
        for (let i = 0; i < 58; i++) {
            const c = base58Alphabet[i];
            const bigNum = new bn(i);
            base58Decoder[c] = bigNum;
            base58Encoder[bigNum] = c;
        }
    }
    let result = new bn(0);
    const base = new bn(58);
    for (let i = 0; i < string.length; i++) {
        const character = string[i];
        result.imul(base);
        result.iadd(base58Decoder[character]);
    }
    return byteArrayToWordArray(result.toArray('be'));
}, binaryToBase58 = (wordArray) => {
    if (!base58Encoder) {
        base58Decoder = {};
        base58Encoder = {};
        for (let i = 0; i < 58; i++) {
            const c = base58Alphabet[i];
            const bigNum = new bn(i);
            base58Decoder[c] = bigNum;
            base58Encoder[bigNum] = c;
        }
    }
    const base = new bn(58);
    // hex is only compatible encoding between cryptojs and BN
    const hexString = wordArray.toString(cryptoJs.enc.Hex);
    let result = new bn(hexString, 16);
    let string = [];
    while (!result.isZero()) {
        const { div, mod } = result.divmod(base);
        result = div;
        string.push(base58Encoder[mod]);
    }
    return string.reverse().join('');
};
function byteArrayToWordArray(ba) {
    const wa = [];
    for (let i = 0; i < ba.length; i++) {
        wa[(i / 4) | 0] |= ba[i] << (24 - 8 * i);
    }
    return cryptoJs.lib.WordArray.create(wa, ba.length);
}
/*  ------------------------------------------------------------------------ */

exports.base16ToBinary = base16ToBinary;
exports.base58ToBinary = base58ToBinary;
exports.base64ToBinary = base64ToBinary;
exports.base64ToString = base64ToString;
exports.binaryConcat = binaryConcat;
exports.binaryConcatArray = binaryConcatArray;
exports.binaryToBase16 = binaryToBase16;
exports.binaryToBase58 = binaryToBase58;
exports.binaryToBase64 = binaryToBase64;
exports.byteArrayToWordArray = byteArrayToWordArray;
exports.decode = decode;
exports.encode = encode;
exports.isJsonEncodedObject = isJsonEncodedObject;
exports.json = json;
exports.numberToBE = numberToBE;
exports.numberToLE = numberToLE;
exports.rawencode = rawencode;
exports.stringToBase64 = stringToBase64;
exports.stringToBinary = stringToBinary;
exports.urlencode = urlencode;
exports.urlencodeBase64 = urlencodeBase64;
exports.urlencodeNested = urlencodeNested;
exports.urlencodeWithArrayRepeat = urlencodeWithArrayRepeat;
