import { JSEncrypt } from "../../static_dependencies/jsencrypt/JSEncrypt.js";
import { CHash } from '../../static_dependencies/noble-hashes/utils.js';
import { base16, utf8 } from '../../static_dependencies/scure-base/index.js';
import { urlencodeBase64, stringToBase64, base16ToBinary, binaryToBase64 } from './encode.js';
import { hmac } from './crypto.js';
import { P256 } from '../../static_dependencies/noble-curves/p256.js';
import { ecdsa } from '../../base/functions/crypto.js';

function rsa (request: string, secret: string, hash: CHash) {
    const RSA = new JSEncrypt ()
    const digester = (input) => base16.encode (hash (input))
    RSA.setPrivateKey (secret)
    const name = (hash.create ()).constructor.name.toLowerCase ()
    return RSA.sign (request, digester, name) as string;
}

function jwt (request: {}, secret: Uint8Array, hash: CHash, isRSA = false, opts = {}) {
    let alg = (isRSA ? 'RS' : 'HS') + (hash.outputLen * 8);
    if (opts['alg']) {
        alg = opts['alg'].toUpperCase ();
    }
    const header = Object.assign({ 'alg': alg, 'typ': 'JWT' }, opts);
    if (header['iat'] !== undefined) {
        request['iat'] = header['iat'];
        delete header['iat'];
    }
    const encodedHeader = urlencodeBase64(stringToBase64 (JSON.stringify(header)));
    const encodedData = urlencodeBase64 (stringToBase64 (JSON.stringify (request)));
    const token = [ encodedHeader, encodedData ].join ('.');
    const algoType = alg.slice (0, 2);
    let signature = undefined;
    if (algoType === 'HS') {
        signature = urlencodeBase64 (hmac (token, secret, hash, 'base64'));
    } else if (isRSA || algoType === 'RS') {
        signature = urlencodeBase64 (rsa (token, utf8.encode (secret), hash));
    } else if (algoType === 'ES') {
        const signedHash = ecdsa (token, utf8.encode (secret), P256, hash);
        const r = signedHash.r.padStart (64, '0');
        const s = signedHash.s.padStart (64, '0');
        signature = urlencodeBase64 (binaryToBase64 (base16ToBinary (r + s)));
    }
    return [ token, signature ].join ('.');
}

export { rsa, jwt }
