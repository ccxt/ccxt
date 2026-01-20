// Depends on jsbn.js and rng.js
// Version 1.1: support utf-8 encoding in pkcs1pad2
// convert a (hex) string to a bignum object
import { BigInteger, nbi, parseBigInt } from "./jsbn.js";
import { SecureRandom } from "./rng.js";
// function linebrk(s,n) {
//   var ret = "";
//   var i = 0;
//   while(i + n < s.length) {
//     ret += s.substring(i,i+n) + "\n";
//     i += n;
//   }
//   return ret + s.substring(i,s.length);
// }
// function byte2Hex(b) {
//   if(b < 0x10)
//     return "0" + b.toString(16);
//   else
//     return b.toString(16);
// }
function pkcs1pad1(s, n) {
    if (n < s.length + 22) {
        console.error("Message too long for RSA");
        return null;
    }
    const len = n - s.length - 6;
    let filler = "";
    for (let f = 0; f < len; f += 2) {
        filler += "ff";
    }
    const m = "0001" + filler + "00" + s;
    return parseBigInt(m, 16);
}
// PKCS#1 (type 2, random) pad input string s to n bytes, and return a bigint
function pkcs1pad2(s, n) {
    if (n < s.length + 11) { // TODO: fix for utf-8
        console.error("Message too long for RSA");
        return null;
    }
    const ba = [];
    let i = s.length - 1;
    while (i >= 0 && n > 0) {
        const c = s.charCodeAt(i--);
        if (c < 128) { // encode using utf-8
            ba[--n] = c;
        }
        else if ((c > 127) && (c < 2048)) {
            ba[--n] = (c & 63) | 128;
            ba[--n] = (c >> 6) | 192;
        }
        else {
            ba[--n] = (c & 63) | 128;
            ba[--n] = ((c >> 6) & 63) | 128;
            ba[--n] = (c >> 12) | 224;
        }
    }
    ba[--n] = 0;
    const rng = new SecureRandom();
    const x = [];
    while (n > 2) { // random non-zero pad
        x[0] = 0;
        while (x[0] == 0) {
            rng.nextBytes(x);
        }
        ba[--n] = x[0];
    }
    ba[--n] = 2;
    ba[--n] = 0;
    return new BigInteger(ba);
}
// "empty" RSA key constructor
export class RSAKey {
    constructor() {
        this.n = null;
        this.e = 0;
        this.d = null;
        this.p = null;
        this.q = null;
        this.dmp1 = null;
        this.dmq1 = null;
        this.coeff = null;
    }
    //#region PROTECTED
    // protected
    // RSAKey.prototype.doPublic = RSADoPublic;
    // Perform raw public operation on "x": return x^e (mod n)
    doPublic(x) {
        return x.modPowInt(this.e, this.n);
    }
    // RSAKey.prototype.doPrivate = RSADoPrivate;
    // Perform raw private operation on "x": return x^d (mod n)
    doPrivate(x) {
        if (this.p == null || this.q == null) {
            return x.modPow(this.d, this.n);
        }
        // TODO: re-calculate any missing CRT params
        let xp = x.mod(this.p).modPow(this.dmp1, this.p);
        const xq = x.mod(this.q).modPow(this.dmq1, this.q);
        while (xp.compareTo(xq) < 0) {
            xp = xp.add(this.p);
        }
        return xp.subtract(xq).multiply(this.coeff).mod(this.p).multiply(this.q).add(xq);
    }
    //#endregion PROTECTED
    //#region PUBLIC
    // RSAKey.prototype.setPublic = RSASetPublic;
    // Set the public key fields N and e from hex strings
    setPublic(N, E) {
        if (N != null && E != null && N.length > 0 && E.length > 0) {
            this.n = parseBigInt(N, 16);
            this.e = parseInt(E, 16);
        }
        else {
            console.error("Invalid RSA public key");
        }
    }
    // RSAKey.prototype.encrypt = RSAEncrypt;
    // Return the PKCS#1 RSA encryption of "text" as an even-length hex string
    encrypt(text) {
        const maxLength = (this.n.bitLength() + 7) >> 3;
        const m = pkcs1pad2(text, maxLength);
        if (m == null) {
            return null;
        }
        const c = this.doPublic(m);
        if (c == null) {
            return null;
        }
        let h = c.toString(16);
        let length = h.length;
        // fix zero before result
        for (let i = 0; i < maxLength * 2 - length; i++) {
            h = "0" + h;
        }
        return h;
    }
    // RSAKey.prototype.setPrivate = RSASetPrivate;
    // Set the private key fields N, e, and d from hex strings
    setPrivate(N, E, D) {
        if (N != null && E != null && N.length > 0 && E.length > 0) {
            this.n = parseBigInt(N, 16);
            this.e = parseInt(E, 16);
            this.d = parseBigInt(D, 16);
        }
        else {
            console.error("Invalid RSA private key");
        }
    }
    // RSAKey.prototype.setPrivateEx = RSASetPrivateEx;
    // Set the private key fields N, e, d and CRT params from hex strings
    setPrivateEx(N, E, D, P, Q, DP, DQ, C) {
        if (N != null && E != null && N.length > 0 && E.length > 0) {
            this.n = parseBigInt(N, 16);
            this.e = parseInt(E, 16);
            this.d = parseBigInt(D, 16);
            this.p = parseBigInt(P, 16);
            this.q = parseBigInt(Q, 16);
            this.dmp1 = parseBigInt(DP, 16);
            this.dmq1 = parseBigInt(DQ, 16);
            this.coeff = parseBigInt(C, 16);
        }
        else {
            console.error("Invalid RSA private key");
        }
    }
    // RSAKey.prototype.generate = RSAGenerate;
    // Generate a new random private key B bits long, using public expt E
    generate(B, E) {
        const rng = new SecureRandom();
        const qs = B >> 1;
        this.e = parseInt(E, 16);
        const ee = new BigInteger(E, 16);
        for (;;) {
            for (;;) {
                this.p = new BigInteger(B - qs, 1, rng);
                if (this.p.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0 && this.p.isProbablePrime(10)) {
                    break;
                }
            }
            for (;;) {
                this.q = new BigInteger(qs, 1, rng);
                if (this.q.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0 && this.q.isProbablePrime(10)) {
                    break;
                }
            }
            if (this.p.compareTo(this.q) <= 0) {
                const t = this.p;
                this.p = this.q;
                this.q = t;
            }
            const p1 = this.p.subtract(BigInteger.ONE);
            const q1 = this.q.subtract(BigInteger.ONE);
            const phi = p1.multiply(q1);
            if (phi.gcd(ee).compareTo(BigInteger.ONE) == 0) {
                this.n = this.p.multiply(this.q);
                this.d = ee.modInverse(phi);
                this.dmp1 = this.d.mod(p1);
                this.dmq1 = this.d.mod(q1);
                this.coeff = this.q.modInverse(this.p);
                break;
            }
        }
    }
    // RSAKey.prototype.decrypt = RSADecrypt;
    // Return the PKCS#1 RSA decryption of "ctext".
    // "ctext" is an even-length hex string and the output is a plain string.
    decrypt(ctext) {
        const c = parseBigInt(ctext, 16);
        const m = this.doPrivate(c);
        if (m == null) {
            return null;
        }
        return pkcs1unpad2(m, (this.n.bitLength() + 7) >> 3);
    }
    // Generate a new random private key B bits long, using public expt E
    generateAsync(B, E, callback) {
        const rng = new SecureRandom();
        const qs = B >> 1;
        this.e = parseInt(E, 16);
        const ee = new BigInteger(E, 16);
        const rsa = this;
        // These functions have non-descript names because they were originally for(;;) loops.
        // I don't know about cryptography to give them better names than loop1-4.
        const loop1 = function () {
            const loop4 = function () {
                if (rsa.p.compareTo(rsa.q) <= 0) {
                    const t = rsa.p;
                    rsa.p = rsa.q;
                    rsa.q = t;
                }
                const p1 = rsa.p.subtract(BigInteger.ONE);
                const q1 = rsa.q.subtract(BigInteger.ONE);
                const phi = p1.multiply(q1);
                if (phi.gcd(ee).compareTo(BigInteger.ONE) == 0) {
                    rsa.n = rsa.p.multiply(rsa.q);
                    rsa.d = ee.modInverse(phi);
                    rsa.dmp1 = rsa.d.mod(p1);
                    rsa.dmq1 = rsa.d.mod(q1);
                    rsa.coeff = rsa.q.modInverse(rsa.p);
                    setTimeout(function () { callback(); }, 0); // escape
                }
                else {
                    setTimeout(loop1, 0);
                }
            };
            const loop3 = function () {
                rsa.q = nbi();
                rsa.q.fromNumberAsync(qs, 1, rng, function () {
                    rsa.q.subtract(BigInteger.ONE).gcda(ee, function (r) {
                        if (r.compareTo(BigInteger.ONE) == 0 && rsa.q.isProbablePrime(10)) {
                            setTimeout(loop4, 0);
                        }
                        else {
                            setTimeout(loop3, 0);
                        }
                    });
                });
            };
            const loop2 = function () {
                rsa.p = nbi();
                rsa.p.fromNumberAsync(B - qs, 1, rng, function () {
                    rsa.p.subtract(BigInteger.ONE).gcda(ee, function (r) {
                        if (r.compareTo(BigInteger.ONE) == 0 && rsa.p.isProbablePrime(10)) {
                            setTimeout(loop3, 0);
                        }
                        else {
                            setTimeout(loop2, 0);
                        }
                    });
                });
            };
            setTimeout(loop2, 0);
        };
        setTimeout(loop1, 0);
    }
    sign(text, digestMethod, digestName) {
        const header = getDigestHeader(digestName);
        const digest = header + digestMethod(text).toString();
        const m = pkcs1pad1(digest, this.n.bitLength() / 4);
        if (m == null) {
            return null;
        }
        const c = this.doPrivate(m);
        if (c == null) {
            return null;
        }
        const h = c.toString(16);
        if ((h.length & 1) == 0) {
            return h;
        }
        else {
            return "0" + h;
        }
    }
    verify(text, signature, digestMethod) {
        const c = parseBigInt(signature, 16);
        const m = this.doPublic(c);
        if (m == null) {
            return null;
        }
        const unpadded = m.toString(16).replace(/^1f+00/, "");
        const digest = removeDigestHeader(unpadded);
        return digest == digestMethod(text).toString();
    }
}
// Undo PKCS#1 (type 2, random) padding and, if valid, return the plaintext
function pkcs1unpad2(d, n) {
    const b = d.toByteArray();
    let i = 0;
    while (i < b.length && b[i] == 0) {
        ++i;
    }
    if (b.length - i != n - 1 || b[i] != 2) {
        return null;
    }
    ++i;
    while (b[i] != 0) {
        if (++i >= b.length) {
            return null;
        }
    }
    let ret = "";
    while (++i < b.length) {
        const c = b[i] & 255;
        if (c < 128) { // utf-8 decode
            ret += String.fromCharCode(c);
        }
        else if ((c > 191) && (c < 224)) {
            ret += String.fromCharCode(((c & 31) << 6) | (b[i + 1] & 63));
            ++i;
        }
        else {
            ret += String.fromCharCode(((c & 15) << 12) | ((b[i + 1] & 63) << 6) | (b[i + 2] & 63));
            i += 2;
        }
    }
    return ret;
}
// https://tools.ietf.org/html/rfc3447#page-43
const DIGEST_HEADERS = {
    md2: "3020300c06082a864886f70d020205000410",
    md5: "3020300c06082a864886f70d020505000410",
    sha1: "3021300906052b0e03021a05000414",
    sha224: "302d300d06096086480165030402040500041c",
    sha256: "3031300d060960864801650304020105000420",
    sha384: "3041300d060960864801650304020205000430",
    sha512: "3051300d060960864801650304020305000440",
    ripemd160: "3021300906052b2403020105000414"
};
function getDigestHeader(name) {
    return DIGEST_HEADERS[name] || "";
}
function removeDigestHeader(str) {
    for (const name in DIGEST_HEADERS) {
        if (DIGEST_HEADERS.hasOwnProperty(name)) {
            const header = DIGEST_HEADERS[name];
            const len = header.length;
            if (str.substr(0, len) == header) {
                return str.substr(len);
            }
        }
    }
    return str;
}
// Return the PKCS#1 RSA encryption of "text" as a Base64-encoded string
// function RSAEncryptB64(text) {
//  var h = this.encrypt(text);
//  if(h) return hex2b64(h); else return null;
// }
// public
// RSAKey.prototype.encrypt_b64 = RSAEncryptB64;
