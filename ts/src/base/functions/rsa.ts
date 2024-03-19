import { JSEncrypt } from "../../static_dependencies/jsencrypt/JSEncrypt.js";
import { CHash } from '../../static_dependencies/noble-hashes/utils.js';
import { base16, utf8 } from '../../static_dependencies/scure-base/index.js';
import { urlencodeBase64, stringToBase64 } from './encode.js';
import { hmac } from './crypto.js';


function rsa (request: string, secret: string, hash: CHash) {
    const RSA = new JSEncrypt ()
    const digester = (input) => base16.encode (hash (input))
    RSA.setPrivateKey (secret)
    const name = (hash.create ()).constructor.name.toLowerCase ()
    return RSA.sign (request, digester, name)
}

function jwt (request: {}, secret: Uint8Array, hash: CHash, isRSA = false, opts = {}) {
    const alg = (isRSA ? 'RS' : 'HS') + (hash.outputLen * 8)
    const header = Object.assign({ 'alg': alg, 'typ': 'JWT' }, opts);
    const encodedHeader = urlencodeBase64(stringToBase64(JSON.stringify(header)));
    const encodedData = urlencodeBase64 (stringToBase64 (JSON.stringify (request)));
    const token = [ encodedHeader, encodedData ].join ('.');
    const algoType = alg.slice (0, 2);
    let signature = undefined;
    if (algoType === 'HS') {
        signature = urlencodeBase64 (hmac (token, secret, hash, 'base64'));
    } else if (algoType === 'RS') {
        signature = urlencodeBase64 (rsa (token, utf8.encode (secret), hash));
    }
    return [ token, signature ].join ('.');
}

export { rsa, jwt }
