'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var base = require('@scure/base');
var legacy_js = require('@noble/hashes/legacy.js');
var crypto = require('./crypto.js');

// ----------------------------------------------------------------------------
function totp(secret) {
    const dec2hex = (s) => ((s < 15.5 ? '0' : '') + Math.round(s).toString(16));
    const hex2dec = (s) => parseInt(s, 16);
    const leftpad = (s, p) => (p + s).slice(-p.length); // both s and p are short strings
    secret = secret.replace(' ', ''); // support 2fa-secrets with spaces like "4TDV WOGO" → "4TDVWOGO"
    const epoch = Math.round(new Date().getTime() / 1000.0);
    const time = leftpad(dec2hex(Math.floor(epoch / 30)), '0000000000000000');
    const hmacRes = crypto.hmac(base.hex.decode(time), base.base32.decode(secret), legacy_js.sha1, 'hex');
    const offset = hex2dec(hmacRes.substring(hmacRes.length - 1));
    // eslint-disable-next-line
    let otp = (hex2dec(hmacRes.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
    return otp.substring(otp.length - 6, otp.length);
}

exports["default"] = totp;
exports.totp = totp;
