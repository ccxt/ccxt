'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var base64$1 = require('./lib/jsbn/base64.js');
var hex = require('./lib/asn1js/hex.js');
var base64 = require('./lib/asn1js/base64.js');
var asn1 = require('./lib/asn1js/asn1.js');
var rsa = require('./lib/jsbn/rsa.js');
var jsbn = require('./lib/jsbn/jsbn.js');
var asn11_0 = require('./lib/jsrsasign/asn1-1.0.js');

/**
 * Create a new JSEncryptRSAKey that extends Tom Wu's RSA key object.
 * This object is just a decorator for parsing the key parameter
 * @param {string|Object} key - The key in string format, or an object containing
 * the parameters needed to build a RSAKey object.
 * @constructor
 */
class JSEncryptRSAKey extends rsa.RSAKey {
    constructor(key) {
        super();
        // Call the super constructor.
        //  RSAKey.call(this);
        // If a key key was provided.
        if (key) {
            // If this is a string...
            if (typeof key === "string") {
                this.parseKey(key);
            }
            else if (JSEncryptRSAKey.hasPrivateKeyProperty(key) ||
                JSEncryptRSAKey.hasPublicKeyProperty(key)) {
                // Set the values for the key.
                this.parsePropertiesFrom(key);
            }
        }
    }
    /**
     * Method to parse a pem encoded string containing both a public or private key.
     * The method will translate the pem encoded string in a der encoded string and
     * will parse private key and public key parameters. This method accepts public key
     * in the rsaencryption pkcs #1 format (oid: 1.2.840.113549.1.1.1).
     *
     * @todo Check how many rsa formats use the same format of pkcs #1.
     *
     * The format is defined as:
     * PublicKeyInfo ::= SEQUENCE {
     *   algorithm       AlgorithmIdentifier,
     *   PublicKey       BIT STRING
     * }
     * Where AlgorithmIdentifier is:
     * AlgorithmIdentifier ::= SEQUENCE {
     *   algorithm       OBJECT IDENTIFIER,     the OID of the enc algorithm
     *   parameters      ANY DEFINED BY algorithm OPTIONAL (NULL for PKCS #1)
     * }
     * and PublicKey is a SEQUENCE encapsulated in a BIT STRING
     * RSAPublicKey ::= SEQUENCE {
     *   modulus           INTEGER,  -- n
     *   publicExponent    INTEGER   -- e
     * }
     * it's possible to examine the structure of the keys obtained from openssl using
     * an asn.1 dumper as the one used here to parse the components: http://lapo.it/asn1js/
     * @argument {string} pem the pem encoded string, can include the BEGIN/END header/footer
     * @private
     */
    parseKey(pem) {
        try {
            let modulus = 0;
            let public_exponent = 0;
            const reHex = /^\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\s*)+$/;
            const der = reHex.test(pem) ? hex.Hex.decode(pem) : base64.Base64.unarmor(pem);
            let asn1$1 = asn1.ASN1.decode(der);
            // Fixes a bug with OpenSSL 1.0+ private keys
            if (asn1$1.sub.length === 3) {
                asn1$1 = asn1$1.sub[2].sub[0];
            }
            if (asn1$1.sub.length === 9) {
                // Parse the private key.
                modulus = asn1$1.sub[1].getHexStringValue(); // bigint
                this.n = jsbn.parseBigInt(modulus, 16);
                public_exponent = asn1$1.sub[2].getHexStringValue(); // int
                this.e = parseInt(public_exponent, 16);
                const private_exponent = asn1$1.sub[3].getHexStringValue(); // bigint
                this.d = jsbn.parseBigInt(private_exponent, 16);
                const prime1 = asn1$1.sub[4].getHexStringValue(); // bigint
                this.p = jsbn.parseBigInt(prime1, 16);
                const prime2 = asn1$1.sub[5].getHexStringValue(); // bigint
                this.q = jsbn.parseBigInt(prime2, 16);
                const exponent1 = asn1$1.sub[6].getHexStringValue(); // bigint
                this.dmp1 = jsbn.parseBigInt(exponent1, 16);
                const exponent2 = asn1$1.sub[7].getHexStringValue(); // bigint
                this.dmq1 = jsbn.parseBigInt(exponent2, 16);
                const coefficient = asn1$1.sub[8].getHexStringValue(); // bigint
                this.coeff = jsbn.parseBigInt(coefficient, 16);
            }
            else if (asn1$1.sub.length === 2) {
                if (asn1$1.sub[0].sub) {
                    // Parse ASN.1 SubjectPublicKeyInfo type as defined by X.509
                    var bit_string = asn1$1.sub[1];
                    var sequence = bit_string.sub[0];
                    modulus = sequence.sub[0].getHexStringValue();
                    this.n = jsbn.parseBigInt(modulus, 16);
                    public_exponent = sequence.sub[1].getHexStringValue();
                    this.e = parseInt(public_exponent, 16);
                }
                else {
                    // Parse ASN.1 RSAPublicKey type as defined by PKCS #1
                    modulus = asn1$1.sub[0].getHexStringValue();
                    this.n = jsbn.parseBigInt(modulus, 16);
                    public_exponent = asn1$1.sub[1].getHexStringValue();
                    this.e = parseInt(public_exponent, 16);
                }
            }
            else {
                return false;
            }
            return true;
        }
        catch (ex) {
            return false;
        }
    }
    /**
     * Translate rsa parameters in a hex encoded string representing the rsa key.
     *
     * The translation follow the ASN.1 notation :
     * RSAPrivateKey ::= SEQUENCE {
     *   version           Version,
     *   modulus           INTEGER,  -- n
     *   publicExponent    INTEGER,  -- e
     *   privateExponent   INTEGER,  -- d
     *   prime1            INTEGER,  -- p
     *   prime2            INTEGER,  -- q
     *   exponent1         INTEGER,  -- d mod (p1)
     *   exponent2         INTEGER,  -- d mod (q-1)
     *   coefficient       INTEGER,  -- (inverse of q) mod p
     * }
     * @returns {string}  DER Encoded String representing the rsa private key
     * @private
     */
    getPrivateBaseKey() {
        const options = {
            array: [
                new asn11_0.KJUR.asn1.DERInteger({ int: 0 }),
                new asn11_0.KJUR.asn1.DERInteger({ bigint: this.n }),
                new asn11_0.KJUR.asn1.DERInteger({ int: this.e }),
                new asn11_0.KJUR.asn1.DERInteger({ bigint: this.d }),
                new asn11_0.KJUR.asn1.DERInteger({ bigint: this.p }),
                new asn11_0.KJUR.asn1.DERInteger({ bigint: this.q }),
                new asn11_0.KJUR.asn1.DERInteger({ bigint: this.dmp1 }),
                new asn11_0.KJUR.asn1.DERInteger({ bigint: this.dmq1 }),
                new asn11_0.KJUR.asn1.DERInteger({ bigint: this.coeff }),
            ],
        };
        const seq = new asn11_0.KJUR.asn1.DERSequence(options);
        return seq.getEncodedHex();
    }
    /**
     * base64 (pem) encoded version of the DER encoded representation
     * @returns {string} pem encoded representation without header and footer
     * @public
     */
    getPrivateBaseKeyB64() {
        return base64$1.hex2b64(this.getPrivateBaseKey());
    }
    /**
     * Translate rsa parameters in a hex encoded string representing the rsa public key.
     * The representation follow the ASN.1 notation :
     * PublicKeyInfo ::= SEQUENCE {
     *   algorithm       AlgorithmIdentifier,
     *   PublicKey       BIT STRING
     * }
     * Where AlgorithmIdentifier is:
     * AlgorithmIdentifier ::= SEQUENCE {
     *   algorithm       OBJECT IDENTIFIER,     the OID of the enc algorithm
     *   parameters      ANY DEFINED BY algorithm OPTIONAL (NULL for PKCS #1)
     * }
     * and PublicKey is a SEQUENCE encapsulated in a BIT STRING
     * RSAPublicKey ::= SEQUENCE {
     *   modulus           INTEGER,  -- n
     *   publicExponent    INTEGER   -- e
     * }
     * @returns {string} DER Encoded String representing the rsa public key
     * @private
     */
    getPublicBaseKey() {
        const first_sequence = new asn11_0.KJUR.asn1.DERSequence({
            array: [
                new asn11_0.KJUR.asn1.DERObjectIdentifier({ oid: "1.2.840.113549.1.1.1" }),
                new asn11_0.KJUR.asn1.DERNull(),
            ],
        });
        const second_sequence = new asn11_0.KJUR.asn1.DERSequence({
            array: [
                new asn11_0.KJUR.asn1.DERInteger({ bigint: this.n }),
                new asn11_0.KJUR.asn1.DERInteger({ int: this.e }),
            ],
        });
        const bit_string = new asn11_0.KJUR.asn1.DERBitString({
            hex: "00" + second_sequence.getEncodedHex(),
        });
        const seq = new asn11_0.KJUR.asn1.DERSequence({
            array: [first_sequence, bit_string],
        });
        return seq.getEncodedHex();
    }
    /**
     * base64 (pem) encoded version of the DER encoded representation
     * @returns {string} pem encoded representation without header and footer
     * @public
     */
    getPublicBaseKeyB64() {
        return base64$1.hex2b64(this.getPublicBaseKey());
    }
    /**
     * wrap the string in block of width chars. The default value for rsa keys is 64
     * characters.
     * @param {string} str the pem encoded string without header and footer
     * @param {Number} [width=64] - the length the string has to be wrapped at
     * @returns {string}
     * @private
     */
    static wordwrap(str, width) {
        width = width || 64;
        if (!str) {
            return str;
        }
        const regex = "(.{1," + width + "})( +|$\n?)|(.{1," + width + "})";
        return str.match(RegExp(regex, "g")).join("\n");
    }
    /**
     * Retrieve the pem encoded private key
     * @returns {string} the pem encoded private key with header/footer
     * @public
     */
    getPrivateKey() {
        let key = "-----BEGIN RSA PRIVATE KEY-----\n";
        key += JSEncryptRSAKey.wordwrap(this.getPrivateBaseKeyB64()) + "\n";
        key += "-----END RSA PRIVATE KEY-----";
        return key;
    }
    /**
     * Retrieve the pem encoded public key
     * @returns {string} the pem encoded public key with header/footer
     * @public
     */
    getPublicKey() {
        let key = "-----BEGIN PUBLIC KEY-----\n";
        key += JSEncryptRSAKey.wordwrap(this.getPublicBaseKeyB64()) + "\n";
        key += "-----END PUBLIC KEY-----";
        return key;
    }
    /**
     * Check if the object contains the necessary parameters to populate the rsa modulus
     * and public exponent parameters.
     * @param {object} [obj={}] - An object that may contain the two public key
     * parameters
     * @returns {boolean} true if the object contains both the modulus and the public exponent
     * properties (n and e)
     * @todo check for types of n and e. N should be a parseable bigInt object, E should
     * be a parseable integer number
     * @private
     */
    static hasPublicKeyProperty(obj) {
        obj = obj || {};
        return obj.hasOwnProperty("n") && obj.hasOwnProperty("e");
    }
    /**
     * Check if the object contains ALL the parameters of an RSA key.
     * @param {object} [obj={}] - An object that may contain nine rsa key
     * parameters
     * @returns {boolean} true if the object contains all the parameters needed
     * @todo check for types of the parameters all the parameters but the public exponent
     * should be parseable bigint objects, the public exponent should be a parseable integer number
     * @private
     */
    static hasPrivateKeyProperty(obj) {
        obj = obj || {};
        return (obj.hasOwnProperty("n") &&
            obj.hasOwnProperty("e") &&
            obj.hasOwnProperty("d") &&
            obj.hasOwnProperty("p") &&
            obj.hasOwnProperty("q") &&
            obj.hasOwnProperty("dmp1") &&
            obj.hasOwnProperty("dmq1") &&
            obj.hasOwnProperty("coeff"));
    }
    /**
     * Parse the properties of obj in the current rsa object. Obj should AT LEAST
     * include the modulus and public exponent (n, e) parameters.
     * @param {object} obj - the object containing rsa parameters
     * @private
     */
    parsePropertiesFrom(obj) {
        this.n = obj.n;
        this.e = obj.e;
        if (obj.hasOwnProperty("d")) {
            this.d = obj.d;
            this.p = obj.p;
            this.q = obj.q;
            this.dmp1 = obj.dmp1;
            this.dmq1 = obj.dmq1;
            this.coeff = obj.coeff;
        }
    }
}

exports.JSEncryptRSAKey = JSEncryptRSAKey;
