import { JSEncrypt } from "../../static_dependencies/jsencrypt/JSEncrypt.js";
import { BigInteger } from "../../static_dependencies/jsencrypt/lib/jsbn/jsbn.js";
import { CHash, utf8ToBytes } from '@noble/hashes/utils.js';
import { hex as base16, base64, utf8 } from '@scure/base';
import { urlencodeBase64, base16ToBinary, base64ToBinary, binaryToString, base64ToBase64Url } from './encode.js';
import { eddsa, hmac } from './crypto.js';
import { p256 as P256 } from '@noble/curves/nist.js';
import { ecdsa } from '../../base/functions/crypto.js';
import { Dictionary } from "../types.js";
import { ed25519 } from "@noble/curves/ed25519.js";

function mgf1 (seed: Uint8Array, maskLen: number, hash: CHash): Uint8Array {
    // MGF1 mask generation function (PKCS#1 / RFC 8017) using the given hash
    const hLen = hash.outputLen;
    const blocks = Math.ceil (maskLen / hLen);
    const out = new Uint8Array (blocks * hLen);
    for (let i = 0; i < blocks; i++) {
        const counter = new Uint8Array ([ (i >>> 24) & 0xff, (i >>> 16) & 0xff, (i >>> 8) & 0xff, i & 0xff ]);
        const input = new Uint8Array (seed.length + 4);
        input.set (seed);
        input.set (counter, seed.length);
        out.set (hash (input), i * hLen);
    }
    return out.slice (0, maskLen);
}

function rsaPss (request: string, secret: string, hash: CHash): string {
    // RSASSA-PSS signature (RFC 8017) with salt length = hash output length, returned base64.
    // implemented in pure JS (browser-safe) on top of the bundled RSA primitive, since the
    // JSEncrypt signer only does PKCS#1 v1.5 padding
    const RSA = new JSEncrypt ();
    RSA.setPrivateKey (secret);
    const key = RSA.getKey () as any;
    const modBits = key.n.bitLength ();
    const emBits = modBits - 1;
    const emLen = Math.ceil (emBits / 8);
    const hLen = hash.outputLen;
    const sLen = hLen;
    const mHash = hash (utf8ToBytes (request));
    const salt = new Uint8Array (sLen);
    globalThis.crypto.getRandomValues (salt);
    // M' = (0x)00 00 00 00 00 00 00 00 || mHash || salt
    const mPrime = new Uint8Array (8 + hLen + sLen);
    mPrime.set (mHash, 8);
    mPrime.set (salt, 8 + hLen);
    const H = hash (mPrime);
    const dbLen = emLen - hLen - 1;
    const psLen = emLen - sLen - hLen - 2;
    const db = new Uint8Array (dbLen);
    db[psLen] = 0x01;
    db.set (salt, psLen + 1);
    const dbMask = mgf1 (H, dbLen, hash);
    const maskedDb = new Uint8Array (dbLen);
    for (let i = 0; i < dbLen; i++) {
        maskedDb[i] = db[i] ^ dbMask[i];
    }
    // zero the leftmost (8*emLen - emBits) bits of the leftmost octet
    maskedDb[0] &= (0xFF >> (8 * emLen - emBits));
    const em = new Uint8Array (emLen);
    em.set (maskedDb, 0);
    em.set (H, dbLen);
    em[emLen - 1] = 0xbc;
    const c = key.doPrivate (new BigInteger (base16.encode (em), 16));
    const modLen = (modBits + 7) >> 3;
    let cHex = c.toString (16);
    cHex = cHex.padStart (modLen * 2, '0');
    return base64.encode (base16.decode (cHex));
}

function rsa (request: string, secret: string, hash: CHash, padding: string = 'pkcs1') {
    if (padding === 'pss') {
        return rsaPss (request, secret, hash);
    }
    const RSA = new JSEncrypt ()
    const digester = (input: string | Uint8Array) => base16.encode (hash ((typeof input === 'string') ? utf8ToBytes (input) : input))
    RSA.setPrivateKey (secret)
    // @noble/hashes v2 renamed the digest classes from SHA256 to _SHA256, etc
    const name = (hash.create ()).constructor.name.toLowerCase ().replace ('_', '')
    return RSA.sign (request, digester, name) as string;
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
    let signature = undefined;
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
