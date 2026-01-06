'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index$1 = require('../scure-bip32/index.js');
var index = require('../scure-bip39/index.js');
var english = require('../scure-bip39/wordlists/english.js');

// ----------------------------------------------------------------------------
/**
 * @description Get Mnemonic and priv/pub keys from privateKeyBytes and BIP44 HD path
 *
 * @url https://github.com/confio/cosmos-hd-key-derivation-spec#bip44
 *
 * @param entropy used to generate mnemonic
 *
 * @param path BIP44 HD Path. Default is The Cosmos Hub path
 *
 * @throws Error if the hdkey does not exist
 *
 * @returns Mnemonic and priv/pub keys
 */
const exportMnemonicAndPrivateKey = (entropy, path = "m/44'/118'/0'/0/0") => {
    const mnemonic = index.entropyToMnemonic(entropy, english.wordlist);
    const { privateKey, publicKey } = deriveHDKeyFromMnemonic(mnemonic, path);
    return {
        mnemonic,
        privateKey,
        publicKey,
    };
};
/**
 * @description Derive priv/pub keys from mnemonic and BIP44 HD path
 *
 * @url https://github.com/confio/cosmos-hd-key-derivation-spec#bip44
 *
 * @param mnemonic used to generate seed
 *
 * @param path BIP44 HD Path. Default is The Cosmos Hub path
 *
 * @throws Error if the hdkey does not exist
 *
 * @returns Priv/pub keys
 */
const deriveHDKeyFromMnemonic = (mnemonic, path = "m/44'/118'/0'/0/0") => {
    const seed = index.mnemonicToSeedSync(mnemonic);
    const hdkey = index$1.HDKey.fromMasterSeed(seed);
    const derivedHdkey = hdkey.derive(path);
    if (!hdkey.privateKey) {
        throw new Error('null hd key');
    }
    return {
        privateKey: derivedHdkey.privateKey,
        publicKey: derivedHdkey.publicKey,
    };
};

exports.deriveHDKeyFromMnemonic = deriveHDKeyFromMnemonic;
exports.exportMnemonicAndPrivateKey = exportMnemonicAndPrivateKey;
