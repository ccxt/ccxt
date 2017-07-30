"use strict";

var crypto = require ('crypto')
var CryptoJS = require ('crypto-js')

var log = require ('ololog')

let apiKey = 'CGAra4mIwKxgV3uYB4XZI4nVVmjXyIpER+5bFUuXGlIQ4MJFKLQfTJWK'
let secret64 = 'wrkstzsrwdj9pJlUGjj+wOTQgYAaO8MankKJPhASNGEY7hbFAtumQ45C7K/2SwCSgL8WcusUuTgarP5mmqo1uQ=='
let nonce = '1501027285'
let request = 'nonce=' + nonce
let path = '/0/private/Balance'

var crypto_sig = function (path, secret, nonceRequest) {

    const msg = path + new crypto.createHash ('sha256').update (nonceRequest).digest ('binary')

    return new crypto.createHmac ('sha512', secret).update (msg, 'binary').digest ('base64')
}

function ASCIIStringToUint8Array (str) {

    const arr = new Uint8Array (str.length)
    for (let i = 0; i < str.length; i++) { arr[i] = str.charCodeAt(i); }
    return arr
}

var cryptojs_sig = function (path, secret, nonceRequest) {

    let msg = CryptoJS.lib.WordArray.create (ASCIIStringToUint8Array (path)).concat (CryptoJS.SHA256 (nonceRequest))

    return CryptoJS.HmacSHA512 (msg, secret).toString (CryptoJS.enc.Base64)
}

let nonceRequest = nonce + request
let secret1 = CryptoJS.enc.Base64.parse (secret64)
let secret2 = new Buffer (secret64, 'base64')
console.log (secret1, secret2)

console.log ('bad:',  cryptojs_sig (path, secret1, nonceRequest))
console.log ('good:', crypto_sig   (path, secret2, nonceRequest))

// console.log ('check:', )

