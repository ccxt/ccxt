'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var modular = require('../noble-curves/abstract/modular.js');
var secp256k1 = require('../noble-curves/secp256k1.js');
var hmac = require('../noble-hashes/hmac.js');
var ripemd160 = require('../noble-hashes/ripemd160.js');
var sha256 = require('../noble-hashes/sha256.js');
var sha512 = require('../noble-hashes/sha512.js');
var utils = require('../noble-hashes/utils.js');
var index = require('../scure-base/index.js');

/**
 * BIP32 hierarchical deterministic (HD) wallets over secp256k1.
 * @module
 * @example
 * ```js
 * import { HDKey } from "@scure/bip32";
 * const hdkey1 = HDKey.fromMasterSeed(seed);
 * const hdkey2 = HDKey.fromExtendedKey(base58key);
 * const hdkey3 = HDKey.fromJSON({ xpriv: string });
 *
 * // props
 * [hdkey1.depth, hdkey1.index, hdkey1.chainCode];
 * console.log(hdkey2.privateKey, hdkey2.publicKey);
 * console.log(hdkey3.derive("m/0/2147483647'/1"));
 * const sig = hdkey3.sign(hash);
 * hdkey3.verify(hash, sig);
 * ```
 * @version 1.7.0
 */
const Point = secp256k1.secp256k1.ProjectivePoint;
function bytesToNumber(bytes) {
    utils.abytes(bytes);
    const h = bytes.length === 0 ? '0' : utils.bytesToHex(bytes);
    return BigInt('0x' + h);
}
function numberToBytes(num) {
    if (typeof num !== 'bigint')
        throw new Error('bigint expected');
    return utils.hexToBytes(num.toString(16).padStart(64, '0'));
}
const MASTER_SECRET = utils.utf8ToBytes('Bitcoin seed');
// Bitcoin hardcoded by default
const BITCOIN_VERSIONS = { private: 0x0488ade4, public: 0x0488b21e };
const HARDENED_OFFSET = 0x80000000;
const hash160 = (data) => ripemd160.ripemd160(sha256.sha256(data));
const fromU32 = (data) => utils.createView(data).getUint32(0, false);
const toU32 = (n) => {
    if (!Number.isSafeInteger(n) || n < 0 || n > 2 ** 32 - 1) {
        throw new Error('invalid number, should be from 0 to 2**32-1, got ' + n);
    }
    const buf = new Uint8Array(4);
    utils.createView(buf).setUint32(0, n, false);
    return buf;
};
class HDKey {
    constructor(opt) {
        this.depth = 0;
        this.index = 0;
        this.chainCode = null;
        this.parentFingerprint = 0;
        if (!opt || typeof opt !== 'object') {
            throw new Error('HDKey.constructor must not be called directly');
        }
        this.versions = opt.versions || BITCOIN_VERSIONS;
        this.depth = opt.depth || 0;
        this.chainCode = opt.chainCode || null;
        this.index = opt.index || 0;
        this.parentFingerprint = opt.parentFingerprint || 0;
        if (!this.depth) {
            if (this.parentFingerprint || this.index) {
                throw new Error('HDKey: zero depth with non-zero index/parent fingerprint');
            }
        }
        if (opt.publicKey && opt.privateKey) {
            throw new Error('HDKey: publicKey and privateKey at same time.');
        }
        if (opt.privateKey) {
            if (!secp256k1.secp256k1.utils.isValidPrivateKey(opt.privateKey)) {
                throw new Error('Invalid private key');
            }
            this.privKey =
                typeof opt.privateKey === 'bigint' ? opt.privateKey : bytesToNumber(opt.privateKey);
            this.privKeyBytes = numberToBytes(this.privKey);
            this.pubKey = secp256k1.secp256k1.getPublicKey(opt.privateKey, true);
        }
        else if (opt.publicKey) {
            this.pubKey = Point.fromHex(opt.publicKey).toRawBytes(true); // force compressed point
        }
        else {
            throw new Error('HDKey: no public or private key provided');
        }
        this.pubHash = hash160(this.pubKey);
    }
    get fingerprint() {
        if (!this.pubHash) {
            throw new Error('No publicKey set!');
        }
        return fromU32(this.pubHash);
    }
    get identifier() {
        return this.pubHash;
    }
    get pubKeyHash() {
        return this.pubHash;
    }
    get privateKey() {
        return this.privKeyBytes || null;
    }
    get publicKey() {
        return this.pubKey || null;
    }
    get privateExtendedKey() {
        const priv = this.privateKey;
        if (!priv) {
            throw new Error('No private key');
        }
        return index.base58.encode(this.serialize(this.versions.private, utils.concatBytes(new Uint8Array([0]), priv)));
    }
    get publicExtendedKey() {
        if (!this.pubKey) {
            throw new Error('No public key');
        }
        return index.base58.encode(this.serialize(this.versions.public, this.pubKey));
    }
    static fromMasterSeed(seed, versions = BITCOIN_VERSIONS) {
        utils.abytes(seed);
        if (8 * seed.length < 128 || 8 * seed.length > 512) {
            throw new Error('HDKey: seed length must be between 128 and 512 bits; 256 bits is advised, got ' +
                seed.length);
        }
        const I = hmac.hmac(sha512.sha512, MASTER_SECRET, seed);
        return new HDKey({
            versions,
            chainCode: I.slice(32),
            privateKey: I.slice(0, 32),
        });
    }
    static fromExtendedKey(base58key, versions = BITCOIN_VERSIONS) {
        // => version(4) || depth(1) || fingerprint(4) || index(4) || chain(32) || key(33)
        const keyBuffer = index.base58.decode(base58key);
        const keyView = utils.createView(keyBuffer);
        const version = keyView.getUint32(0, false);
        const opt = {
            versions,
            depth: keyBuffer[4],
            parentFingerprint: keyView.getUint32(5, false),
            index: keyView.getUint32(9, false),
            chainCode: keyBuffer.slice(13, 45),
        };
        const key = keyBuffer.slice(45);
        const isPriv = key[0] === 0;
        if (version !== versions[isPriv ? 'private' : 'public']) {
            throw new Error('Version mismatch');
        }
        if (isPriv) {
            return new HDKey({ ...opt, privateKey: key.slice(1) });
        }
        else {
            return new HDKey({ ...opt, publicKey: key });
        }
    }
    static fromJSON(json) {
        return HDKey.fromExtendedKey(json.xpriv);
    }
    derive(path) {
        if (!/^[mM]'?/.test(path)) {
            throw new Error('Path must start with "m" or "M"');
        }
        if (/^[mM]'?$/.test(path)) {
            return this;
        }
        const parts = path.replace(/^[mM]'?\//, '').split('/');
        // tslint:disable-next-line
        let child = this;
        for (const c of parts) {
            const m = /^(\d+)('?)$/.exec(c);
            const m1 = m && m[1];
            if (!m || m.length !== 3 || typeof m1 !== 'string')
                throw new Error('invalid child index: ' + c);
            let idx = +m1;
            if (!Number.isSafeInteger(idx) || idx >= HARDENED_OFFSET) {
                throw new Error('Invalid index');
            }
            // hardened key
            if (m[2] === "'") {
                idx += HARDENED_OFFSET;
            }
            child = child.deriveChild(idx);
        }
        return child;
    }
    deriveChild(index) {
        if (!this.pubKey || !this.chainCode) {
            throw new Error('No publicKey or chainCode set');
        }
        let data = toU32(index);
        if (index >= HARDENED_OFFSET) {
            // Hardened
            const priv = this.privateKey;
            if (!priv) {
                throw new Error('Could not derive hardened child key');
            }
            // Hardened child: 0x00 || ser256(kpar) || ser32(index)
            data = utils.concatBytes(new Uint8Array([0]), priv, data);
        }
        else {
            // Normal child: serP(point(kpar)) || ser32(index)
            data = utils.concatBytes(this.pubKey, data);
        }
        const I = hmac.hmac(sha512.sha512, this.chainCode, data);
        const childTweak = bytesToNumber(I.slice(0, 32));
        const chainCode = I.slice(32);
        if (!secp256k1.secp256k1.utils.isValidPrivateKey(childTweak)) {
            throw new Error('Tweak bigger than curve order');
        }
        const opt = {
            versions: this.versions,
            chainCode,
            depth: this.depth + 1,
            parentFingerprint: this.fingerprint,
            index,
        };
        try {
            // Private parent key -> private child key
            if (this.privateKey) {
                const added = modular.mod(this.privKey + childTweak, secp256k1.secp256k1.CURVE.n);
                if (!secp256k1.secp256k1.utils.isValidPrivateKey(added)) {
                    throw new Error('The tweak was out of range or the resulted private key is invalid');
                }
                opt.privateKey = added;
            }
            else {
                const added = Point.fromHex(this.pubKey).add(Point.fromPrivateKey(childTweak));
                // Cryptographically impossible: hmac-sha512 preimage would need to be found
                if (added.equals(Point.ZERO)) {
                    throw new Error('The tweak was equal to negative P, which made the result key invalid');
                }
                opt.publicKey = added.toRawBytes(true);
            }
            return new HDKey(opt);
        }
        catch (err) {
            return this.deriveChild(index + 1);
        }
    }
    sign(hash) {
        if (!this.privateKey) {
            throw new Error('No privateKey set!');
        }
        utils.abytes(hash);
        return secp256k1.secp256k1.sign(hash, this.privKey).toCompactRawBytes();
    }
    verify(hash, signature) {
        utils.abytes(hash);
        utils.abytes(signature);
        if (!this.publicKey) {
            throw new Error('No publicKey set!');
        }
        let sig;
        try {
            sig = secp256k1.secp256k1.Signature.fromCompact(signature);
        }
        catch (error) {
            return false;
        }
        return secp256k1.secp256k1.verify(sig, hash, this.publicKey);
    }
    wipePrivateData() {
        this.privKey = undefined;
        if (this.privKeyBytes) {
            this.privKeyBytes.fill(0);
            this.privKeyBytes = undefined;
        }
        return this;
    }
    toJSON() {
        return {
            xpriv: this.privateExtendedKey,
            xpub: this.publicExtendedKey,
        };
    }
    serialize(version, key) {
        if (!this.chainCode) {
            throw new Error('No chainCode set');
        }
        utils.abytes(key);
        // version(4) || depth(1) || fingerprint(4) || index(4) || chain(32) || key(33)
        return utils.concatBytes(toU32(version), new Uint8Array([this.depth]), toU32(this.parentFingerprint), toU32(this.index), this.chainCode, key);
    }
}

exports.HARDENED_OFFSET = HARDENED_OFFSET;
exports.HDKey = HDKey;
