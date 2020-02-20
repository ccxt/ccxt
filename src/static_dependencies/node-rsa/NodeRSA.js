/*!
 * RSA library for Node.js
 *
 * Author: rzcoder
 * License MIT
 */

var rsa = require('./libs/rsa.js');
var _ = require('./utils')._;
var schemes = require('./schemes/schemes.js');
var formats = require('./formats/formats.js');

module.exports = (function () {
    var SUPPORTED_HASH_ALGORITHMS = {
        browser: ['md5', 'ripemd160', 'sha1', 'sha256', 'sha512']
    };

    var DEFAULT_ENCRYPTION_SCHEME = 'pkcs1';
    var DEFAULT_SIGNING_SCHEME = 'pkcs1';

    var EXPORT_FORMAT_ALIASES = {
        'private': 'pkcs1-private-pem',
        'private-der': 'pkcs1-private-der',
        'public': 'pkcs8-public-pem',
        'public-der': 'pkcs8-public-der',
    };

    /**
     * @param key {string|buffer|object} Key in PEM format, or data for generate key {b: bits, e: exponent}
     * @constructor
     */
    function NodeRSA(key, format, options) {
        if (!(this instanceof NodeRSA)) {
            return new NodeRSA(key, format, options);
        }

        if (_.isObject(format)) {
            options = format;
            format = undefined;
        }

        this.$options = {
            signingScheme: DEFAULT_SIGNING_SCHEME,
            signingSchemeOptions: {
                hash: 'sha256',
                saltLength: null
            },
            encryptionScheme: DEFAULT_ENCRYPTION_SCHEME,
            encryptionSchemeOptions: {
                hash: 'sha1',
                label: null
            },
            environment: 'browser',
            rsaUtils: this
        };
        this.keyPair = new rsa.Key();
        this.$cache = {};

        if (Buffer.isBuffer(key) || _.isString(key)) {
            this.importKey(key, format);
        } else if (_.isObject(key)) {
            this.generateKeyPair(key.b, key.e);
        }

        this.setOptions(options);
    }

    /**
     * Set and validate options for key instance
     * @param options
     */
    NodeRSA.prototype.setOptions = function (options) {
        options = options || {};
        if (options.environment) {
            this.$options.environment = options.environment;
        }

        if (options.signingScheme) {
            if (_.isString(options.signingScheme)) {
                var signingScheme = options.signingScheme.toLowerCase().split('-');
                if (signingScheme.length == 1) {
                    if (SUPPORTED_HASH_ALGORITHMS.node.indexOf(signingScheme[0]) > -1) {
                        this.$options.signingSchemeOptions = {
                            hash: signingScheme[0]
                        };
                        this.$options.signingScheme = DEFAULT_SIGNING_SCHEME;
                    } else {
                        this.$options.signingScheme = signingScheme[0];
                        this.$options.signingSchemeOptions = {
                            hash: null
                        };
                    }
                } else {
                    this.$options.signingSchemeOptions = {
                        hash: signingScheme[1]
                    };
                    this.$options.signingScheme = signingScheme[0];
                }
            } else if (_.isObject(options.signingScheme)) {
                this.$options.signingScheme = options.signingScheme.scheme || DEFAULT_SIGNING_SCHEME;
                this.$options.signingSchemeOptions = _.omit(options.signingScheme, 'scheme');
            }

            if (!schemes.isSignature(this.$options.signingScheme)) {
                throw Error('Unsupported signing scheme');
            }

            if (this.$options.signingSchemeOptions.hash &&
                SUPPORTED_HASH_ALGORITHMS[this.$options.environment].indexOf(this.$options.signingSchemeOptions.hash) === -1) {
                throw Error('Unsupported hashing algorithm for ' + this.$options.environment + ' environment');
            }
        }

        if (options.encryptionScheme) {
            if (_.isString(options.encryptionScheme)) {
                this.$options.encryptionScheme = options.encryptionScheme.toLowerCase();
                this.$options.encryptionSchemeOptions = {};
            } else if (_.isObject(options.encryptionScheme)) {
                this.$options.encryptionScheme = options.encryptionScheme.scheme || DEFAULT_ENCRYPTION_SCHEME;
                this.$options.encryptionSchemeOptions = _.omit(options.encryptionScheme, 'scheme');
            }

            if (!schemes.isEncryption(this.$options.encryptionScheme)) {
                throw Error('Unsupported encryption scheme');
            }

            if (this.$options.encryptionSchemeOptions.hash &&
                SUPPORTED_HASH_ALGORITHMS[this.$options.environment].indexOf(this.$options.encryptionSchemeOptions.hash) === -1) {
                throw Error('Unsupported hashing algorithm for ' + this.$options.environment + ' environment');
            }
        }

        this.keyPair.setOptions(this.$options);
    };

    /**
     * Importing key
     * @param keyData {string|buffer|Object}
     * @param format {string}
     */
    NodeRSA.prototype.importKey = function (keyData, format) {
        if (!keyData) {
            throw Error("Empty key given");
        }

        if (format) {
            format = EXPORT_FORMAT_ALIASES[format] || format;
        }

        if (!formats.detectAndImport(this.keyPair, keyData, format) && format === undefined) {
            throw Error("Key format must be specified");
        }

        this.$cache = {};

        return this;
    };

    /**
     * Check if key pair contains private key
     */
    NodeRSA.prototype.isPrivate = function () {
        return this.keyPair.isPrivate();
    };

    /**
     * Check if key pair contains public key
     * @param [strict] {boolean} - public key only, return false if have private exponent
     */
    NodeRSA.prototype.isPublic = function (strict) {
        return this.keyPair.isPublic(strict);
    };

    /**
     * Check if key pair doesn't contains any data
     */
    NodeRSA.prototype.isEmpty = function (strict) {
        return !(this.keyPair.n || this.keyPair.e || this.keyPair.d);
    };

    /**
     *  Signing data
     *
     * @param buffer {string|number|object|array|Buffer} - data for signing. Object and array will convert to JSON string.
     * @param encoding {string} - optional. Encoding for output result, may be 'buffer', 'binary', 'hex' or 'base64'. Default 'buffer'.
     * @param source_encoding {string} - optional. Encoding for given string. Default utf8.
     * @returns {string|Buffer}
     */
    NodeRSA.prototype.sign = function (buffer, encoding, source_encoding) {
        if (!this.isPrivate()) {
            throw Error("This is not private key");
        }

        var res = this.keyPair.sign(this.$getDataForEncrypt(buffer, source_encoding));

        if (encoding && encoding != 'buffer') {
            res = res.toString(encoding);
        }

        return res;
    };

    /**
     * Preparing given data for encrypting/signing. Just make new/return Buffer object.
     *
     * @param buffer {string|number|object|array|Buffer} - data for encrypting. Object and array will convert to JSON string.
     * @param encoding {string} - optional. Encoding for given string. Default utf8.
     * @returns {Buffer}
     */
    NodeRSA.prototype.$getDataForEncrypt = function (buffer, encoding) {
        if (_.isString(buffer) || _.isNumber(buffer)) {
            return Buffer.from('' + buffer, encoding || 'utf8');
        } else if (Buffer.isBuffer(buffer)) {
            return buffer;
        } else if (_.isObject(buffer)) {
            return Buffer.from(JSON.stringify(buffer));
        } else {
            throw Error("Unexpected data type");
        }
    };

    return NodeRSA;
})();
