"use strict";

var crypto = require ('crypto')
var CryptoJS = require ('crypto-js')

var log = require ('ololog')

let apiKey = 'CGAra4mIwKxgV3uYB4XZI4nVVmjXyIpER+5bFUuXGlIQ4MJFKLQfTJWK'
let secret = 'wrkstzsrwdj9pJlUGjj+wOTQgYAaO8MankKJPhASNGEY7hbFAtumQ45C7K/2SwCSgL8WcusUuTgarP5mmqo1uQ=='
let nonce = '1501027285'
let request = 'nonce=' + nonce
let path = '/0/private/Balance'

var crypto_sig = function (path, request, secret64, nonce) {

    const msg = path + new crypto.createHash ('sha256')
                                 .update (nonce + request)
                                 .digest ('binary')

    return new crypto.createHmac ('sha512', new Buffer (secret64, 'base64'))
                     .update (msg, 'binary')
                     .digest ('base64')
}

function ASCIIStringToUint8Array (str) {

    const arr = new Uint8Array (str.length)

    for (let i = 0; i < str.length; i++) { arr[i] = str.charCodeAt(i); }

    return arr;
}

var WordArray = CryptoJS.lib.WordArray

var cryptojs_sig = function (path, request, secret64, nonce) {

    const msg = WordArray.create (ASCIIStringToUint8Array (path))
                         .concat (CryptoJS.SHA256 (nonce + request))

    return CryptoJS.HmacSHA512 (msg, CryptoJS.enc.Base64.parse (secret64))
                   .toString (CryptoJS.enc.Base64)
}

console.log ('good:', crypto_sig   (path, request, secret, nonce));
console.log ('bad:',  cryptojs_sig (path, request, secret, nonce));

