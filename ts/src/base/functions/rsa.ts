import { CHash } from '@noble/hashes/utils.js';
import { base64, utf8 } from '@scure/base';
import { urlencodeBase64, base16ToBinary, base64ToBinary, base64ToBase64Url } from './encode.js';
import { eddsa, hmac, pemToDer } from './crypto.js';
import { p256 as P256 } from '@noble/curves/nist.js';
import { ecdsa } from '../../base/functions/crypto.js';
import { Dictionary } from "../types.js";
import { ed25519 } from "@noble/curves/ed25519.js";

// DER length encoding (definite form)
function encodeDerLength (length: number): number[] {
    if (length < 0x80) {
        return [ length ];
    }
    const bytes = [];
    let temp = length;
    while (temp > 0) {
        bytes.unshift (temp & 0xff);
        temp = Math.floor (temp / 256);
    }
    return [ 0x80 | bytes.length ].concat (bytes);
}

// Wrap a PKCS#1 RSAPrivateKey (DER) inside a PKCS#8 PrivateKeyInfo, because
// crypto.subtle.importKey only accepts 'pkcs8' / 'spki', never raw PKCS#1.
function pkcs1ToPkcs8 (pkcs1: Uint8Array): Uint8Array {
    // AlgorithmIdentifier { rsaEncryption (1.2.840.113549.1.1.1), NULL }
    const algId = [ 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00 ];
    const version = [ 0x02, 0x01, 0x00 ]; // INTEGER 0
    const octetStringHeader = [ 0x04 ].concat (encodeDerLength (pkcs1.length));
    const prefix = version.concat (algId).concat (octetStringHeader);
    const contentLength = prefix.length + pkcs1.length;
    const sequence = [ 0x30 ].concat (encodeDerLength (contentLength));
    const out = new Uint8Array (sequence.length + prefix.length + pkcs1.length);
    out.set (sequence, 0);
    out.set (prefix, sequence.length);
    out.set (pkcs1, sequence.length + prefix.length);
    return out;
}

// RSASSA-PKCS1-v1_5 signing via the native Web Crypto API (crypto.subtle),
// available in Node.js >= 15, Bun, Deno and all modern browsers.
async function rsa (request: string, secret: string, hash: CHash): Promise<string> {
    let der = pemToDer (secret);
    // crypto.subtle cannot import a bare PKCS#1 key, wrap it as PKCS#8 first
    if (secret.indexOf ('BEGIN RSA PRIVATE KEY') > -1) {
        der = pkcs1ToPkcs8 (der);
    }
    // @noble/hashes v2 renamed the digest classes from SHA256 to _SHA256, etc
    const name = (hash.create ()).constructor.name.toLowerCase ().replace ('_', '');
    const algoName = (name === 'sha256') ? 'SHA-256' : ((name === 'sha384') ? 'SHA-384' : 'SHA-512');
    const cryptoKey = await crypto.subtle.importKey ('pkcs8', der as BufferSource, { 'name': 'RSASSA-PKCS1-v1_5', 'hash': algoName }, false, [ 'sign' ]);
    const data = utf8.decode (request);
    const signature = await crypto.subtle.sign ('RSASSA-PKCS1-v1_5', cryptoKey, data as BufferSource);
    return base64.encode (new Uint8Array (signature));
}

async function jwt (request: Dictionary<any>, secret: Uint8Array, hash: CHash, isRSA = false, opts: Dictionary<any> = {}): Promise<string> {
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
    let signature = undefined;
    if (algoType === 'HS') {
        signature = urlencodeBase64 (hmac (token, secret, hash, 'binary'));
    } else if (isRSA || algoType === 'RS') {
        signature = urlencodeBase64 (base64ToBinary (await rsa (token, utf8.encode (secret), hash)));
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
