"use strict";

var crypto   = require ('crypto')
var CryptoJS = require ('crypto-js')
var ccxt     = require ('./ccxt')
var log      = require ('ololog')

let apiKey = 'CGAra4mIwKxgV3uYB4XZI4nVVmjXyIpER+5bFUuXGlIQ4MJFKLQfTJWK'
let secret64 = 'wrkstzsrwdj9pJlUGjj+wOTQgYAaO8MankKJPhASNGEY7hbFAtumQ45C7K/2SwCSgL8WcusUuTgarP5mmqo1uQ=='
let nonce = '1501027285'
let request = 'nonce=' + nonce
let path = '/0/private/Balance'
let params = {}

var crypto_sig = function (path, secret, nonceRequest) {

    const msg = path + new crypto.createHash ('sha256').update (nonceRequest).digest ('binary')

    return new crypto.createHmac ('sha512', secret).update (msg, 'binary').digest ('base64')
}

function stringToBinary (str) {
    const arr = new Uint8Array (str.length)
    for (let i = 0; i < str.length; i++) { arr[i] = str.charCodeAt(i); }
    return CryptoJS.lib.WordArray.create (arr)
}

function binaryConcat (first, ... args) {
    for (let arg of args)
        first = first.concat (arg);
    return first
}

var cryptojs_sig = function (path, secret, nonceRequest) {
    let msg = binaryConcat (stringToBinary (path), CryptoJS.SHA256 (nonceRequest));
    return CryptoJS.HmacSHA512 (msg, secret).toString (CryptoJS.enc.Base64)
}

let nonceRequest = nonce + request
let secret1 = CryptoJS.enc.Base64.parse (secret64)
let secret2 = new Buffer (secret64, 'base64')

console.log ('bad:',  cryptojs_sig (path, secret1, nonceRequest))
console.log ('good:', crypto_sig   (path, secret2, nonceRequest))


let kraken = new ccxt.kraken ({
    "apiKey": "hEvQNMDIeoCJbr7W/ZBb5CGOrx3G0lWF5B3zqa1JBxdZlEaL8EK+D0Mw",
    "secret": "JaE9wI6Nwgh5oRxiHcVxurwzwBxwc05W/qv/k1srGg4s3EYuXPpNkLLM5NYbbWpM8rCyijIeDavRuqWbU0ZV9A==",
    // request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
    //     let url = '/' + this.version + '/' + type + '/' + path;
    //     if (type == 'public') {
    //         if (Object.keys (params).length)
    //             url += '?' + this.urlencode (params);
    //     } else {
    //         let nonce = this.nonce ().toString ();
    //         body = this.urlencode (this.extend ({ 'nonce': nonce }, params));
    //         let auth = this.encode (nonce + body);
    //         let hash = this.hash (auth, 'sha256', 'binary');
    //         let binary = this.stringToBinary (this.encode (url));
    //         let binhash = this.binaryConcat (binary, hash);
    //         let secret = this.base64ToBinary (this.secret);
    //         let signature = this.hmac (binhash, secret, 'sha512', 'base64');
    //         headers = {
    //             'API-Key': this.apiKey,
    //             'API-Sign': signature,
    //             'Content-type': 'application/x-www-form-urlencoded',
    //         };
    //     }
    //     url = this.urls['api'] + url;
    //     return this.fetch (url, method, headers, body);
    // },

})

async function test () {
    console.log (await kraken.fetchBalance ())
}

test ()
// console.log ('check:', )

