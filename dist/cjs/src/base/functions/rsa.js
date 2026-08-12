'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var crypto = require('crypto');
var base = require('@scure/base');
var encode = require('./encode.js');
var crypto$1 = require('./crypto.js');
var nist_js = require('@noble/curves/nist.js');
var ed25519_js = require('@noble/curves/ed25519.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

// ----------------------------------------------------------------------------
// RSASSA-PKCS1-v1_5 (and RSASSA-PSS via padding = 'pss') signing through Node's built-in
// `crypto` module. This is synchronous and works in Node.js / Bun / Deno (anything exposing
// node:crypto). It is NOT available in the browser bundle (rspack stubs the `crypto` module),
// so rsa throws there: RSA signing is currently unsupported in the browser.
function rsa(request, secret, hash, padding = 'pkcs1') {
    if (crypto__default["default"] === undefined || crypto__default["default"].createSign === undefined) {
        throw new Error('rsa is currently not supported in the browser');
    }
    // @noble/hashes v2 renamed the digest classes from SHA256 to _SHA256, etc
    const name = (hash.create()).constructor.name.toLowerCase().replace('_', '');
    const algorithms = {
        'sha256': 'RSA-SHA256',
        'sha384': 'RSA-SHA384',
        'sha512': 'RSA-SHA512',
    };
    const algorithm = algorithms[name];
    const signer = crypto__default["default"].createSign(algorithm);
    signer.update(request);
    if (padding === 'pss') {
        // RSASSA-PSS (RFC 8017), salt length = digest length, MGF1 with the same hash
        return signer.sign({ 'key': secret, 'padding': crypto__default["default"].constants.RSA_PKCS1_PSS_PADDING, 'saltLength': crypto__default["default"].constants.RSA_PSS_SALTLEN_DIGEST }, 'base64');
    }
    return signer.sign(secret, 'base64');
}
function jwt(request, secret, hash, isRSA = false, opts = {}) {
    let alg = (isRSA ? 'RS' : 'HS') + (hash.outputLen * 8);
    if (opts['alg']) {
        alg = opts['alg'].toUpperCase();
    }
    const header = Object.assign({ 'alg': alg, 'typ': 'JWT' }, opts);
    if (header['iat'] !== undefined) {
        request['iat'] = header['iat'];
        delete header['iat'];
    }
    const encodedHeader = encode.urlencodeBase64(JSON.stringify(header));
    const encodedData = encode.urlencodeBase64(JSON.stringify(request));
    let token = [encodedHeader, encodedData].join('.');
    const algoType = alg.slice(0, 2);
    let signature = undefined;
    if (algoType === 'HS') {
        signature = encode.urlencodeBase64(crypto$1.hmac(token, secret, hash, 'binary'));
    }
    else if (isRSA || algoType === 'RS') {
        signature = encode.urlencodeBase64(encode.base64ToBinary(rsa(token, base.utf8.encode(secret), hash)));
    }
    else if (algoType === 'ES') {
        const signedHash = crypto$1.ecdsa(token, base.utf8.encode(secret), nist_js.p256, hash);
        const r = signedHash.r.padStart(64, '0');
        const s = signedHash.s.padStart(64, '0');
        signature = encode.urlencodeBase64(encode.base16ToBinary(r + s));
    }
    else if (algoType === 'ED') {
        const base64str = crypto$1.eddsa(toHex(token), secret, ed25519_js.ed25519);
        // we need urlencoded64 not base64
        signature = encode.base64ToBase64Url(base64str);
    }
    return [token, signature].join('.');
}
function toHex(str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
        result += str.charCodeAt(i).toString(16);
    }
    return result;
}

exports.jwt = jwt;
exports.rsa = rsa;
