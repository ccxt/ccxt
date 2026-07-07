'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var base = require('@scure/base');

// ----------------------------------------------------------------------------
function hex2b64(h) {
    return base.base64.encode(base.hex.decode(h));
}
// convert a base64 string to hex
function b64tohex(s) {
    return base.hex.encode(base.base64.decode(s));
}

exports.b64tohex = b64tohex;
exports.hex2b64 = hex2b64;
