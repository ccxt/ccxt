'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var JSEncrypt = require('../../static_dependencies/jsencrypt/JSEncrypt.js');
var index = require('../../static_dependencies/scure-base/index.js');
var encode = require('./encode.js');
var crypto = require('./crypto.js');

function rsa(request, secret, hash) {
    const RSA = new JSEncrypt.JSEncrypt();
    const digester = (input) => index.base16.encode(hash(input));
    RSA.setPrivateKey(secret);
    const name = (hash.create()).constructor.name.toLowerCase();
    return RSA.sign(request, digester, name);
}
function jwt(request, secret, hash, isRSA = false) {
    const alg = (isRSA ? 'RS' : 'HS') + (hash.outputLen * 8);
    const encodedHeader = encode.urlencodeBase64(encode.stringToBase64(JSON.stringify({ 'alg': alg, 'typ': 'JWT' })));
    const encodedData = encode.urlencodeBase64(encode.stringToBase64(JSON.stringify(request)));
    const token = [encodedHeader, encodedData].join('.');
    const algoType = alg.slice(0, 2);
    let signature = undefined;
    if (algoType === 'HS') {
        signature = encode.urlencodeBase64(crypto.hmac(token, secret, hash, 'base64'));
    }
    else if (algoType === 'RS') {
        signature = encode.urlencodeBase64(rsa(token, index.utf8.encode(secret), hash));
    }
    return [token, signature].join('.');
}

exports.jwt = jwt;
exports.rsa = rsa;
