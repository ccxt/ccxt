'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('../../../scure-base/index.js');

// ----------------------------------------------------------------------------
function hex2b64(h) {
    return index.base64.encode(index.base16.decode(h));
}
// convert a base64 string to hex
function b64tohex(s) {
    return index.base16.encode(index.base64.decode(s));
}

exports.b64tohex = b64tohex;
exports.hex2b64 = hex2b64;
