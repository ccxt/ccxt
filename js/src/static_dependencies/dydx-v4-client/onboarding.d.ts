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
export declare const exportMnemonicAndPrivateKey: (entropy: Uint8Array, path?: string) => {
    mnemonic: string;
    privateKey: Uint8Array | null;
    publicKey: Uint8Array | null;
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
export declare const deriveHDKeyFromMnemonic: (mnemonic: string, path?: string) => {
    privateKey: Uint8Array | null;
    publicKey: Uint8Array | null;
};
