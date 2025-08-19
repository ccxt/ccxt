import { HDKey } from '@scure/bip32';
import { entropyToMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
// import { keccak256 } from 'ethereum-cryptography/keccak';
// import { stripHexPrefix } from './helpers';

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
 * @description Get private information for onboarding using an Ethereum Signature.
 *
 * @returns Mnemonic and Public/Private HD keys
 */
// export const deriveHDKeyFromEthereumSignature = (
//   signature: string,
// ): {
//   mnemonic: string;
//   privateKey: Uint8Array | null;
//   publicKey: Uint8Array | null;
// } => {
//   const buffer = Buffer.from(stripHexPrefix(signature), 'hex');

//   if (buffer.length !== 65) {
//     throw new Error('Signature must be 65 bytes');
//   }

//   // Remove the 'v' value by taking only the first 64 bytes of the signature
//   const rsValues = buffer.subarray(0, 64);
//   // Hash the 'r' and 's' values down to 32 bytes (256 bits) using Keccak-256
//   const entropy = keccak256(rsValues);
//   return exportMnemonicAndPrivateKey(entropy);
// };

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
