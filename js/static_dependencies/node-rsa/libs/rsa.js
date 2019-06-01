/*
 * RSA Encryption / Decryption with PKCS1 v2 Padding.
 *
 * Copyright (c) 2003-2005  Tom Wu
 * All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY
 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
 *
 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * In addition, the following condition applies:
 *
 * All redistributions must retain an intact copy of this copyright notice
 * and disclaimer.
 */

/*
 * Node.js adaptation
 * long message support implementation
 * signing/verifying
 *
 * 2014 rzcoder
 */

var _ = require('../utils')._;
var BigInteger = require('./jsbn.js');
var utils = require('../utils.js');
var schemes = require('../schemes/schemes.js');

//exports.BigInteger = BigInteger;
module.exports.Key = (function () {
    /**
     * RSA key constructor
     *
     * n - modulus
     * e - publicExponent
     * d - privateExponent
     * p - prime1
     * q - prime2
     * dmp1 - exponent1 -- d mod (p1)
     * dmq1 - exponent2 -- d mod (q-1)
     * coeff - coefficient -- (inverse of q) mod p
     */
    function RSAKey() {
        this.n = null;
        this.e = 0;
        this.d = null;
        this.p = null;
        this.q = null;
        this.dmp1 = null;
        this.dmq1 = null;
        this.coeff = null;
    }

    RSAKey.prototype.setOptions = function (options) {
        var signingSchemeProvider = schemes[options.signingScheme];
        var encryptionSchemeProvider = schemes[options.encryptionScheme];

        if (signingSchemeProvider === encryptionSchemeProvider) {
            this.signingScheme = this.encryptionScheme = encryptionSchemeProvider.makeScheme(this, options);
        } else {
            this.encryptionScheme = encryptionSchemeProvider.makeScheme(this, options);
            this.signingScheme = signingSchemeProvider.makeScheme(this, options);
        }
    };
    /**
     * Set the private key fields N, e, d and CRT params from buffers
     *
     * @param N
     * @param E
     * @param D
     * @param P
     * @param Q
     * @param DP
     * @param DQ
     * @param C
     */
    RSAKey.prototype.setPrivate = function (N, E, D, P, Q, DP, DQ, C) {
        if (N && E && D && N.length > 0 && (_.isNumber(E) || E.length > 0) && D.length > 0) {
            this.n = new BigInteger(N);
            this.e = _.isNumber(E) ? E : utils.get32IntFromBuffer(E, 0);
            this.d = new BigInteger(D);

            if (P && Q && DP && DQ && C) {
                this.p = new BigInteger(P);
                this.q = new BigInteger(Q);
                this.dmp1 = new BigInteger(DP);
                this.dmq1 = new BigInteger(DQ);
                this.coeff = new BigInteger(C);
            } else {
                // TODO: re-calculate any missing CRT params
            }
            this.$$recalculateCache();
        } else {
            throw Error("Invalid RSA private key");
        }
    };

    /**
     * private
     * Perform raw private operation on "x": return x^d (mod n)
     *
     * @param x
     * @returns {*}
     */
    RSAKey.prototype.$doPrivate = function (x) {
        if (this.p || this.q) {
            return x.modPow(this.d, this.n);
        }

        // TODO: re-calculate any missing CRT params
        var xp = x.mod(this.p).modPow(this.dmp1, this.p);
        var xq = x.mod(this.q).modPow(this.dmq1, this.q);

        while (xp.compareTo(xq) < 0) {
            xp = xp.add(this.p);
        }
        return xp.subtract(xq).multiply(this.coeff).mod(this.p).multiply(this.q).add(xq);
    };

    /**
     * private
     * Perform raw public operation on "x": return x^e (mod n)
     *
     * @param x
     * @returns {*}
     */
    RSAKey.prototype.$doPublic = function (x) {
        return x.modPowInt(this.e, this.n);
    };

    RSAKey.prototype.sign = function (buffer) {
        return this.signingScheme.sign.apply(this.signingScheme, arguments);
    };

    /**
     * Check if key pair contains private key
     */
    RSAKey.prototype.isPrivate = function () {
        return this.n && this.e && this.d || false;
    };

    /**
     * Check if key pair contains public key
     * @param strict {boolean} - public key only, return false if have private exponent
     */
    RSAKey.prototype.isPublic = function (strict) {
        return this.n && this.e && !(strict && this.d) || false;
    };

    Object.defineProperty(RSAKey.prototype, 'keySize', {
        get: function () {
            return this.cache.keyBitLength;
        }
    });

    Object.defineProperty(RSAKey.prototype, 'encryptedDataLength', {
        get: function () {
            return this.cache.keyByteLength;
        }
    });

    Object.defineProperty(RSAKey.prototype, 'maxMessageLength', {
        get: function () {
            return this.encryptionScheme.maxMessageLength();
        }
    });

    /**
     * Caching key data
     */
    RSAKey.prototype.$$recalculateCache = function () {
        this.cache = this.cache || {};
        // Bit & byte length
        this.cache.keyBitLength = this.n.bitLength();
        this.cache.keyByteLength = (this.cache.keyBitLength + 6) >> 3;
    };

    return RSAKey;
})();

