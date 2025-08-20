import { StarknetChainId } from '../constants.js';
import { BigNumberish } from '../types/index.js';
import { CairoCustomEnum } from './calldata/enum/CairoCustomEnum.js';
/**
 * Decodes an array of BigInts into a string using the given algorithm.
 * @param {bigint[]} encoded - The encoded array of BigInts.
 * @return {string} The decoded string.
 */
export declare function useDecoded(encoded: bigint[]): string;
/**
 * Encodes a string into a bigint value.
 *
 * @param {string} decoded - The string to be encoded.
 * @returns {bigint} - The encoded bigint value.
 */
export declare function useEncoded(decoded: string): bigint;
export declare const enum StarknetIdContract {
    MAINNET = "0x6ac597f8116f886fa1c97a23fa4e08299975ecaf6b598873ca6792b9bbfb678",
    TESTNET_SEPOLIA = "0x0707f09bc576bd7cfee59694846291047e965f4184fe13dac62c56759b3b6fa7"
}
/**
 * Returns the Starknet ID contract address based on the provided chain ID.
 *
 * @param {StarknetChainId} chainId - The chain ID of the Starknet network.
 * @return {string} The Starknet ID contract address.
 * @throws {Error} Throws an error if the Starknet ID contract is not deployed on the network.
 */
export declare function getStarknetIdContract(chainId: StarknetChainId): string;
export declare const enum StarknetIdIdentityContract {
    MAINNET = "0x05dbdedc203e92749e2e746e2d40a768d966bd243df04a6b712e222bc040a9af",
    TESTNET_SEPOLIA = "0x070DF8B4F5cb2879f8592849fA8f3134da39d25326B8558cc9C8FE8D47EA3A90"
}
/**
 * Returns the Starknet ID identity contract address for the given chain ID.
 *
 * @param {StarknetChainId} chainId - The chain ID for the specified network.
 *
 * @return {string} - The Starknet ID identity contract address for the specified network.
 *
 * @throws {Error} - If the Starknet ID verifier contract is not deployed on the network.
 */
export declare function getStarknetIdIdentityContract(chainId: StarknetChainId): string;
export declare const StarknetIdMulticallContract = "0x034ffb8f4452df7a613a0210824d6414dbadcddce6c6e19bf4ddc9e22ce5f970";
/**
 * Returns the Starknet.id multicall contract address based on the provided chainId.
 *
 * @param {StarknetChainId} chainId - The chainId of the network.
 * @return {string} - The address of the Starknet.id multicall contract.
 * @throws {Error} - If the Starknet.id multicall contract is not deployed on the network.
 */
export declare function getStarknetIdMulticallContract(chainId: StarknetChainId): string;
export declare const enum StarknetIdVerifierContract {
    MAINNET = "0x07d14dfd8ee95b41fce179170d88ba1f0d5a512e13aeb232f19cfeec0a88f8bf",
    TESTNET_SEPOLIA = "0x0182EcE8173C216A395f4828e1523541b7e3600bf190CB252E1a1A0cE219d184"
}
/**
 * Returns the address of the Starknet ID Verifier contract based on the specified chain ID.
 *
 * @param {StarknetChainId} chainId - The ID of the Starknet chain.
 * @return {string} - The address of the Starknet ID Verifier contract.
 * @throws {Error} - If the Starknet ID Verifier contract is not deployed on the specified network.
 */
export declare function getStarknetIdVerifierContract(chainId: StarknetChainId): string;
export declare const enum StarknetIdPfpContract {
    MAINNET = "0x070aaa20ec4a46da57c932d9fd89ca5e6bb9ca3188d3df361a32306aff7d59c7",
    TESTNET_SEPOLIA = "0x058061bb6bdc501eE215172c9f87d557C1E0f466dC498cA81b18f998Bf1362b2"
}
/**
 * Retrieves the contract address of the Starknet.id profile picture verifier contract based on the given chain ID.
 *
 * @param {StarknetChainId} chainId - The chain ID of the network.
 * @returns {string} - The contract address of the Starknet.id profile picture verifier contract.
 * @throws {Error} - Throws an error if the Starknet.id profile picture verifier contract is not yet deployed on the network.
 */
export declare function getStarknetIdPfpContract(chainId: StarknetChainId): string;
export declare const enum StarknetIdPopContract {
    MAINNET = "0x0293eb2ba9862f762bd3036586d5755a782bd22e6f5028320f1d0405fd47bff4",
    TESTNET_SEPOLIA = "0x0023FE3b845ed5665a9eb3792bbB17347B490EE4090f855C1298d03BB5F49B49"
}
/**
 * Retrieves the Starknet ID Proof of Personhood (IdPop) verifier contract address for the given chain ID.
 *
 * @param {StarknetChainId} chainId - The chain ID of the Starknet network.
 * @return {string} - The Starknet ID Pop contract address.
 * @throws {Error} - If the Starknet ID Pop contract is not deployed on the specified network.
 */
export declare function getStarknetIdPopContract(chainId: StarknetChainId): string;
/**
 * Executes a method and returns a CairoCustomEnum object.
 *
 * Functions to build CairoCustomEnum for multicall contracts
 * @param {Object} staticEx - An optional object defining the "Static" value of the CairoCustomEnum.
 * @param {number[]} ifEqual - An optional array defining the "IfEqual" value of the CairoCustomEnum.
 * @param {number[]} ifNotEqual - An optional array defining the "IfNotEqual" value of the CairoCustomEnum.
 * @return {CairoCustomEnum} - The created CairoCustomEnum object.
 */
export declare function execution(staticEx: {} | undefined, ifEqual?: number[] | undefined, ifNotEqual?: number[] | undefined): CairoCustomEnum;
/**
 * Creates a new instance of CairoCustomEnum.
 *
 * @param {BigNumberish | undefined} hardcoded - The hardcoded value for the CairoCustomEnum.
 * @param {number[] | undefined} reference - The reference array for the CairoCustomEnum.
 * @returns {CairoCustomEnum} The new instance of CairoCustomEnum.
 */
export declare function dynamicFelt(hardcoded: BigNumberish | undefined, reference?: number[] | undefined): CairoCustomEnum;
/**
 * Creates a new instance of CairoCustomEnum with the given parameters.
 * @param {BigNumberish | undefined} hardcoded - The hardcoded value.
 * @param {BigNumberish[] | undefined} [reference] - The reference value (optional).
 * @param {BigNumberish[] | undefined} [arrayReference] - The array reference value (optional).
 * @return {CairoCustomEnum} - The new instance of CairoCustomEnum.
 */
export declare function dynamicCallData(hardcoded: BigNumberish | undefined, reference?: BigNumberish[] | undefined, arrayReference?: BigNumberish[] | undefined): CairoCustomEnum;
