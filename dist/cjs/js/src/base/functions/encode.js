'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('../../static_dependencies/scure-base/index.js');
var utils = require('../../static_dependencies/noble-curves/abstract/utils.js');
var index$1 = require('../../static_dependencies/qs/index.cjs.js');

/* eslint-disable */
/*  ------------------------------------------------------------------------ */
const json = (data, params = undefined) => JSON.stringify(data), isJsonEncodedObject = object => ((typeof object === 'string') &&
    (object.length >= 2) &&
    ((object[0] === '{') || (object[0] === '['))), binaryToString = index.utf8.encode, stringToBinary = index.utf8.decode, stringToBase64 = string => index.base64.encode(index.utf8.decode(string)), base64ToString = string => index.utf8.encode(index.base64.decode(string)), base64ToBinary = index.base64.decode, binaryToBase64 = index.base64.encode, base16ToBinary = index.base16.decode, binaryToBase16 = index.base16.encode, base58ToBinary = index.base58.decode, binaryToBase58 = index.base58.encode, binaryConcat = utils.concatBytes, binaryConcatArray = (arr) => utils.concatBytes(...arr), urlencode = object => index$1.stringify(object), urlencodeNested = object => index$1.stringify(object) // implemented only in python
, urlencodeWithArrayRepeat = object => index$1.stringify(object, { arrayFormat: 'repeat' }), rawencode = object => index$1.stringify(object, { encode: false }), encode = index.utf8.decode // lol
, decode = index.utf8.encode
// Url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores
, urlencodeBase64 = base64string => base64string.replace(/[=]+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_'), numberToLE = (n, padding) => utils.numberToBytesLE(BigInt(n), padding), numberToBE = (n, padding) => utils.numberToBytesBE(BigInt(n), padding);
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
exports.binaryToString = binaryToString;
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
