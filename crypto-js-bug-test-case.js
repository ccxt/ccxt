"use strict";

var crypto = require ('crypto')
var CryptoJS = require ('crypto-js')

let apiKey = 'CGAra4mIwKxgV3uYB4XZI4nVVmjXyIpER+5bFUuXGlIQ4MJFKLQfTJWK'
let secret = 'wrkstzsrwdj9pJlUGjj+wOTQgYAaO8MankKJPhASNGEY7hbFAtumQ45C7K/2SwCSgL8WcusUuTgarP5mmqo1uQ=='
let nonce = '1501027285'
let body = 'nonce=' + nonce
let url = '/0/private/Balance'

var correct = function (path, request, secret64, nonce) {
    const secret        = new Buffer (secret64, 'base64');                              // decode secret64 → secret
    const hash          = new crypto.createHash ('sha256');                             // create a hash from secret
    const hmac          = new crypto.createHmac ('sha512', secret);                     // create a hmac signer with secret64 as private key
    const hash_digest   = hash.update (nonce + request).digest ('binary');              // sha256 hash of nonce+request, results in binary hash
    const hmac_digest   = hmac.update (path + hash_digest, 'binary').digest ('base64'); // hmac-sign path+hash (binary), encode output in base64
    return hmac_digest;
}

var incorrect = function (path, request, secret64, nonce) {
    let secret      = CryptoJS.enc.Base64.parse (secret64);                                            // decode secret64 → secret
    let hash_digest = CryptoJS.SHA256 (nonce + request).toString (CryptoJS.enc.Latin1);                // sha256 hash of nonce+request, latin1 for binary
    let hmac_digest = CryptoJS.HmacSHA512 (path + hash_digest, secret).toString (CryptoJS.enc.Base64); // hmac-sign path+hash (binary), encode output in base64
    return hmac_digest;
}

let good = correct (url, body, secret, nonce);
let bad = incorrect (url, body, secret, nonce);
console.log ('good:', correct (url, body, secret, nonce));
console.log ('bad:', incorrect (url, body, secret, nonce));
console.log ('(good == bad) ==', good == bad)