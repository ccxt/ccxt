/*
 * RSA Encryption / Decryption with PKCS1 v2 Padding.
 *
 * ~MIT License~
 * Contributors:
 * Tom Wu, rzcoder, frosty00
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

    RSAKey.prototype.sign = function (buffer) {
        return this.signingScheme.sign.apply(this.signingScheme, arguments);
    };

    /**
     * Check if key pair contains private key
     */
    RSAKey.prototype.isPrivate = function () {
        return this.n && this.e && this.d || false;
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

