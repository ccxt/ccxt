import { HDKey } from '../scure-bip32/index.js';
import { entropyToMnemonic, mnemonicToSeedSync } from '../scure-bip39/index.js';
import { wordlist } from '../scure-bip39/wordlists/english.js';

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
export const exportMnemonicAndPrivateKey = (
  entropy: Uint8Array,
  path: string = "m/44'/118'/0'/0/0",
): {
  mnemonic: string;
  privateKey: Uint8Array | null;
  publicKey: Uint8Array | null;
} => {
  const mnemonic = entropyToMnemonic(entropy, wordlist);
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
export const deriveHDKeyFromMnemonic = (
  mnemonic: string,
  path: string = "m/44'/118'/0'/0/0",
): {
  privateKey: Uint8Array | null;
  publicKey: Uint8Array | null;
} => {
  const seed = mnemonicToSeedSync(mnemonic);

  const hdkey = HDKey.fromMasterSeed(seed);
  const derivedHdkey = hdkey.derive(path);

  if (!hdkey.privateKey) {
    throw new Error('null hd key');
  }

  return {
    privateKey: derivedHdkey.privateKey,
    publicKey: derivedHdkey.publicKey,
  };
};
