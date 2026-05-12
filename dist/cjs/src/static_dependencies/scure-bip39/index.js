'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pbkdf2 = require('../noble-hashes/pbkdf2.js');
var sha256 = require('../noble-hashes/sha256.js');
var sha512 = require('../noble-hashes/sha512.js');
var utils = require('../noble-hashes/utils.js');
var index = require('../scure-base/index.js');

// ----------------------------------------------------------------------------
// Japanese wordlist
const isJapanese = (wordlist) => wordlist[0] === '\u3042\u3044\u3053\u304f\u3057\u3093';
// Normalization replaces equivalent sequences of characters
// so that any two texts that are equivalent will be reduced
// to the same sequence of code points, called the normal form of the original text.
// https://tonsky.me/blog/unicode/#why-is-a----
function nfkd(str) {
    if (typeof str !== 'string')
        throw new TypeError('invalid mnemonic type: ' + typeof str);
    return str.normalize('NFKD');
}
function normalize(str) {
    const norm = nfkd(str);
    const words = norm.split(' ');
    if (![12, 15, 18, 21, 24].includes(words.length))
        throw new Error('Invalid mnemonic');
    return { nfkd: norm, words };
}
function aentropy(ent) {
    utils.abytes(ent);
    if (![16, 20, 24, 28, 32].includes(ent.length))
        throw new Error('invalid entropy length');
}
/**
 * Generate x random words. Uses Cryptographically-Secure Random Number Generator.
 * @param wordlist imported wordlist for specific language
 * @param strength mnemonic strength 128-256 bits
 * @example
 * generateMnemonic(wordlist, 128)
 * // 'legal winner thank year wave sausage worth useful legal winner thank yellow'
 */
// export function generateMnemonic(wordlist: string[], strength: number = 128): string {
//   if (strength % 32 !== 0 || strength > 256) throw new TypeError('Invalid entropy');
//   return entropyToMnemonic(randomBytes(strength / 8), wordlist);
// }
const calcChecksum = (entropy) => {
    // Checksum is ent.length/4 bits long
    const bitsLeft = 8 - entropy.length / 4;
    // Zero rightmost "bitsLeft" bits in byte
    // For example: bitsLeft=4 val=10111101 -> 10110000
    return new Uint8Array([(sha256.sha256(entropy)[0] >> bitsLeft) << bitsLeft]);
};
function getCoder(wordlist) {
    if (!Array.isArray(wordlist) || wordlist.length !== 2048 || typeof wordlist[0] !== 'string')
        throw new Error('Wordlist: expected array of 2048 strings');
    wordlist.forEach((i) => {
        if (typeof i !== 'string')
            throw new Error('wordlist: non-string element: ' + i);
    });
    return index.utils.chain(index.utils.checksum(1, calcChecksum), index.utils.radix2(11, true), index.utils.alphabet(wordlist));
}
/**
 * Reversible: Converts raw entropy in form of byte array to mnemonic string.
 * @param entropy byte array
 * @param wordlist imported wordlist for specific language
 * @returns 12-24 words
 * @example
 * const ent = new Uint8Array([
 *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f,
 *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f
 * ]);
 * entropyToMnemonic(ent, wordlist);
 * // 'legal winner thank year wave sausage worth useful legal winner thank yellow'
 */
function entropyToMnemonic(entropy, wordlist) {
    aentropy(entropy);
    const words = getCoder(wordlist).encode(entropy);
    return words.join(isJapanese(wordlist) ? '\u3000' : ' ');
}
const psalt = (passphrase) => nfkd('mnemonic' + passphrase);
/**
 * Irreversible: Uses KDF to derive 64 bytes of key data from mnemonic + optional password.
 * @param mnemonic 12-24 words
 * @param passphrase string that will additionally protect the key
 * @returns 64 bytes of key data
 * @example
 * const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
 * mnemonicToSeedSync(mnem, 'password');
 * // new Uint8Array([...64 bytes])
 */
function mnemonicToSeedSync(mnemonic, passphrase = '') {
    return pbkdf2.pbkdf2(sha512.sha512, normalize(mnemonic).nfkd, psalt(passphrase), { c: 2048, dkLen: 64 });
}

exports.entropyToMnemonic = entropyToMnemonic;
exports.mnemonicToSeedSync = mnemonicToSeedSync;
