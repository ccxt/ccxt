'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var crypto = require('crypto');
var base = require('@scure/base');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

// ----------------------------------------------------------------------------
/*  ------------------------------------------------------------------------ */
function decryptPrivateKey(encryptionPrivKey, encryptionSecret) {
    if (crypto__default["default"] === undefined || crypto__default["default"].createSign === undefined) {
        throw new Error('decryptPrivateKey is currently not supported in the browser');
    }
    return crypto__default["default"].privateDecrypt({ 'key': encryptionPrivKey, 'padding': crypto__default["default"].constants.RSA_PKCS1_PADDING }, base.base64.decode(encryptionSecret)); // this.base64ToBinary 
}
/*  ------------------------------------------------------------------------ */

exports.decryptPrivateKey = decryptPrivateKey;
