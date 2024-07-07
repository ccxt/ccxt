'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var JSEncrypt = require('../../static_dependencies/jsencrypt/JSEncrypt.js');
var index = require('../../static_dependencies/scure-base/index.js');
var encode = require('./encode.js');
var crypto = require('./crypto.js');
var p256 = require('../../static_dependencies/noble-curves/p256.js');

function rsa(request, secret, hash) {
    const RSA = new JSEncrypt.JSEncrypt();
    const digester = (input) => index.base16.encode(hash(input));
    RSA.setPrivateKey(secret);
    const name = (hash.create()).constructor.name.toLowerCase();
    return RSA.sign(request, digester, name);
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
    const token = [encodedHeader, encodedData].join('.');
    const algoType = alg.slice(0, 2);
    let signature = undefined;
    if (algoType === 'HS') {
        signature = encode.urlencodeBase64(crypto.hmac(token, secret, hash, 'binary'));
    }
    else if (isRSA || algoType === 'RS') {
        signature = encode.urlencodeBase64(encode.base64ToBinary(rsa(token, index.utf8.encode(secret), hash)));
    }
    else if (algoType === 'ES') {
        const signedHash = crypto.ecdsa(token, index.utf8.encode(secret), p256.P256, hash);
        const r = signedHash.r.padStart(64, '0');
        const s = signedHash.s.padStart(64, '0');
        signature = encode.urlencodeBase64(encode.base16ToBinary(r + s));
    }
    return [token, signature].join('.');
}

exports.jwt = jwt;
exports.rsa = rsa;
