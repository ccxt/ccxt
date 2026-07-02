import crypto from 'crypto';
import { CHash } from '@noble/hashes/utils.js';
import { utf8 } from '@scure/base';
import { urlencodeBase64, base16ToBinary, base64ToBinary, base64ToBase64Url } from './encode.js';
import { eddsa, hmac } from './crypto.js';
import { p256 as P256 } from '@noble/curves/nist.js';
import { ecdsa } from '../../base/functions/crypto.js';
import { Dictionary } from "../types.js";
import { Str } from "../types.js";
import { ed25519 } from "@noble/curves/ed25519.js";

// RSASSA-PKCS1-v1_5 signing via Node's built-in `crypto` module. This is synchronous
// and works in Node.js / Bun / Deno (anything exposing node:crypto). It is NOT available
// in the browser bundle (rspack stubs the `crypto` module), so rsa throws there: RSA
// signing is currently unsupported in the browser.
function rsa (request: string, secret: string, hash: CHash): string {
    if (crypto === undefined || crypto.createSign === undefined) {
        throw new Error ('rsa is currently not supported in the browser');
    }
    // @noble/hashes v2 renamed the digest classes from SHA256 to _SHA256, etc
    const name = (hash.create ()).constructor.name.toLowerCase ().replace ('_', '');
    const algorithms = {
        'sha256': 'RSA-SHA256',
        'sha384': 'RSA-SHA384',
        'sha512': 'RSA-SHA512',
    };
    const algorithm = algorithms[name];
    const signer = crypto.createSign (algorithm);
    signer.update (request);
    return signer.sign (secret, 'base64');
}

function jwt (request: Dictionary<any>, secret: Uint8Array, hash: CHash, isRSA = false, opts: Dictionary<any> = {}) {
    let alg = (isRSA ? 'RS' : 'HS') + (hash.outputLen * 8);
    if (opts['alg']) {
        alg = opts['alg'].toUpperCase ();
    }
    const header = Object.assign({ 'alg': alg, 'typ': 'JWT' }, opts);

    if (header['iat'] !== undefined) {
        request['iat'] = header['iat'];
        delete header['iat'];
    }
    const encodedHeader = urlencodeBase64 (JSON.stringify(header));
    const encodedData = urlencodeBase64 (JSON.stringify (request));
    let token = [ encodedHeader, encodedData ].join ('.');
    const algoType = alg.slice (0, 2);
    let signature: Str = undefined;
    if (algoType === 'HS') {
        signature = urlencodeBase64 (hmac (token, secret, hash, 'binary'));
    } else if (isRSA || algoType === 'RS') {
        signature = urlencodeBase64 (base64ToBinary (rsa (token, utf8.encode (secret), hash)));
    } else if (algoType === 'ES') {
        const signedHash = ecdsa (token, utf8.encode (secret), P256, hash);
        const r = signedHash.r.padStart (64, '0');
        const s = signedHash.s.padStart (64, '0');
        signature = urlencodeBase64 (base16ToBinary (r + s));
    } else if (algoType === 'ED') {
        const base64str = eddsa(toHex(token), secret, ed25519);
        // we need urlencoded64 not base64
        signature = base64ToBase64Url (base64str);
    }
    return [ token, signature ].join ('.');
}

  function toHex(str) {
    var result = '';
    for (var i=0; i<str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result;
  }


export { rsa, jwt }
