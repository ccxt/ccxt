'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var base = require('@scure/base');
var utils_js = require('@noble/curves/utils.js');
var msgpack = require('../../static_dependencies/messagepack/msgpack.js');
var index = require('../../static_dependencies/qs/index.js');

// ----------------------------------------------------------------------------
/*  ------------------------------------------------------------------------ */
const json = (data, params = undefined) => JSON.stringify(data), isJsonEncodedObject = (object) => ((typeof object === 'string') &&
    // (object.length >= 2) && // commented: https://github.com/ccxt/ccxt/pull/28193
    ((object[0] === '{') || (object[0] === '['))), binaryToString = base.utf8.encode, stringToBinary = base.utf8.decode, stringToBase64 = (string) => base.base64.encode(base.utf8.decode(string)), base64ToString = (string) => base.utf8.encode(base.base64.decode(string)), base64ToBinary = base.base64.decode, binaryToBase64 = base.base64.encode, base16ToBinary = base.hex.decode, binaryToBase16 = base.hex.encode, base58ToBinary = base.base58.decode, binaryToBase58 = base.base58.encode, binaryConcat = utils_js.concatBytes, binaryConcatArray = (arr) => utils_js.concatBytes(...arr), urlencode = (object, sort = false) => index["default"].stringify(object), urlencodeNested = (object) => index["default"].stringify(object, { encodeValuesOnly: true }) // implemented only in python
, urlencodeWithArrayRepeat = (object) => index["default"].stringify(object, { arrayFormat: 'repeat' }), rawencode = (object, sort = false) => index["default"].stringify(object, { encode: false }), encode = base.utf8.decode // lol
, decode = base.utf8.encode
// Url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores
, urlencodeBase64 = (payload) => {
    const payload64 = (typeof payload === 'string') ? stringToBase64(payload) : binaryToBase64(payload);
    return payload64.replace(/[=]+$/, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}, numberToLE = (n, padding) => utils_js.numberToBytesLE(BigInt(n), padding), numberToBE = (n, padding) => utils_js.numberToBytesBE(BigInt(n), padding);
function packb(req) {
    return msgpack.serialize(req);
}
function base64ToBase64Url(base64, stripPadding = true) {
    let base64url = base64.replace(/\+/g, "-").replace(/\//g, "_");
    if (stripPadding) {
        base64url = base64url.replace(/=+$/, "");
    }
    return base64url;
}
/*  ------------------------------------------------------------------------ */

exports.base16ToBinary = base16ToBinary;
exports.base58ToBinary = base58ToBinary;
exports.base64ToBase64Url = base64ToBase64Url;
exports.base64ToBinary = base64ToBinary;
exports.base64ToString = base64ToString;
exports.binaryConcat = binaryConcat;
exports.binaryConcatArray = binaryConcatArray;
exports.binaryToBase16 = binaryToBase16;
exports.binaryToBase58 = binaryToBase58;
exports.binaryToBase64 = binaryToBase64;
exports.binaryToString = binaryToString;
exports.decode = decode;
exports.encode = encode;
exports.isJsonEncodedObject = isJsonEncodedObject;
exports.json = json;
exports.numberToBE = numberToBE;
exports.numberToLE = numberToLE;
exports.packb = packb;
exports.rawencode = rawencode;
exports.stringToBase64 = stringToBase64;
exports.stringToBinary = stringToBinary;
exports.urlencode = urlencode;
exports.urlencodeBase64 = urlencodeBase64;
exports.urlencodeNested = urlencodeNested;
exports.urlencodeWithArrayRepeat = urlencodeWithArrayRepeat;
