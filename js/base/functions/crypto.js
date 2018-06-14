"use strict";

/*  ------------------------------------------------------------------------ */

const CryptoJS = require ('crypto-js')
const { capitalize } = require ('./string')
const { stringToBase64, utf16ToBase64, urlencodeBase64 } = require ('./encode')

/*  ------------------------------------------------------------------------ */

const hash = (request, hash = 'md5', digest = 'hex') => {
    const result = CryptoJS[hash.toUpperCase ()] (request)
    return (digest === 'binary') ? result : result.toString (CryptoJS.enc[capitalize (digest)])
}

/*  .............................................   */

const hmac = (request, secret, hash = 'sha256', digest = 'hex') => {
    const result = CryptoJS['Hmac' + hash.toUpperCase ()] (request, secret)
    if (digest) {
        const encoding = (digest === 'binary') ? 'Latin1' : capitalize (digest)
        return result.toString (CryptoJS.enc[capitalize (encoding)])
    }
    return result
}

/*  .............................................   */

const jwt = function JSON_web_token (request, secret, alg = 'HS256', hash = 'sha256') {
    const encodedHeader = urlencodeBase64 (stringToBase64 (JSON.stringify ({ 'alg': alg, 'typ': 'JWT' })))
        , encodedData = urlencodeBase64 (stringToBase64 (JSON.stringify (request)))
        , token = [ encodedHeader, encodedData ].join ('.')
        , signature = urlencodeBase64 (utf16ToBase64 (hmac (token, secret, hash, 'utf16')))
    return [ token, signature ].join ('.')
}

/*  ------------------------------------------------------------------------ */

module.exports = {

    hash,
    hmac,
    jwt
}

/*  ------------------------------------------------------------------------ */
