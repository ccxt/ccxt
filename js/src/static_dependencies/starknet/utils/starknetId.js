import { StarknetChainId, ZERO } from '../constants.js';
import { tuple } from './calldata/cairo.js';
import { CairoCustomEnum } from './calldata/enum/CairoCustomEnum.js';
/* eslint-disable no-param-reassign */
const basicAlphabet = 'abcdefghijklmnopqrstuvwxyz0123456789-';
const basicSizePlusOne = BigInt(basicAlphabet.length + 1);
const bigAlphabet = '这来';
const basicAlphabetSize = BigInt(basicAlphabet.length);
const bigAlphabetSize = BigInt(bigAlphabet.length);
const bigAlphabetSizePlusOne = BigInt(bigAlphabet.length + 1);
function extractStars(str) {
    let k = 0;
    while (str.endsWith(bigAlphabet[bigAlphabet.length - 1])) {
        str = str.substring(0, str.length - 1);
        k += 1;
    }
    return [str, k];
}
/**
 * Decodes an array of BigInts into a string using the given algorithm.
 * @param {bigint[]} encoded - The encoded array of BigInts.
 * @return {string} The decoded string.
 */
export function useDecoded(encoded) {
    let decoded = '';
    encoded.forEach((subdomain) => {
        while (subdomain !== ZERO) {
            const code = subdomain % basicSizePlusOne;
            subdomain /= basicSizePlusOne;
            if (code === BigInt(basicAlphabet.length)) {
                const nextSubdomain = subdomain / bigAlphabetSizePlusOne;
                if (nextSubdomain === ZERO) {
                    const code2 = subdomain % bigAlphabetSizePlusOne;
                    subdomain = nextSubdomain;
                    if (code2 === ZERO)
                        decoded += basicAlphabet[0];
                    else
                        decoded += bigAlphabet[Number(code2) - 1];
                }
                else {
                    const code2 = subdomain % bigAlphabetSize;
                    decoded += bigAlphabet[Number(code2)];
                    subdomain /= bigAlphabetSize;
                }
            }
            else
                decoded += basicAlphabet[Number(code)];
        }
        const [str, k] = extractStars(decoded);
        if (k)
            decoded =
                str +
                    (k % 2 === 0
                        ? bigAlphabet[bigAlphabet.length - 1].repeat(k / 2 - 1) +
                            bigAlphabet[0] +
                            basicAlphabet[1]
                        : bigAlphabet[bigAlphabet.length - 1].repeat((k - 1) / 2 + 1));
        decoded += '.';
    });
    if (!decoded) {
        return decoded;
    }
    return decoded.concat('stark');
}
/**
 * Encodes a string into a bigint value.
 *
 * @param {string} decoded - The string to be encoded.
 * @returns {bigint} - The encoded bigint value.
 */
export function useEncoded(decoded) {
    let encoded = BigInt(0);
    let multiplier = BigInt(1);
    if (decoded.endsWith(bigAlphabet[0] + basicAlphabet[1])) {
        const [str, k] = extractStars(decoded.substring(0, decoded.length - 2));
        decoded = str + bigAlphabet[bigAlphabet.length - 1].repeat(2 * (k + 1));
    }
    else {
        const [str, k] = extractStars(decoded);
        if (k)
            decoded = str + bigAlphabet[bigAlphabet.length - 1].repeat(1 + 2 * (k - 1));
    }
    for (let i = 0; i < decoded.length; i += 1) {
        const char = decoded[i];
        const index = basicAlphabet.indexOf(char);
        const bnIndex = BigInt(basicAlphabet.indexOf(char));
        if (index !== -1) {
            // add encoded + multiplier * index
            if (i === decoded.length - 1 && decoded[i] === basicAlphabet[0]) {
                encoded += multiplier * basicAlphabetSize;
                multiplier *= basicSizePlusOne;
                // add 0
                multiplier *= basicSizePlusOne;
            }
            else {
                encoded += multiplier * bnIndex;
                multiplier *= basicSizePlusOne;
            }
        }
        else if (bigAlphabet.indexOf(char) !== -1) {
            // add encoded + multiplier * (basicAlphabetSize)
            encoded += multiplier * basicAlphabetSize;
            multiplier *= basicSizePlusOne;
            // add encoded + multiplier * index
            const newid = (i === decoded.length - 1 ? 1 : 0) + bigAlphabet.indexOf(char);
            encoded += multiplier * BigInt(newid);
            multiplier *= bigAlphabetSize;
        }
    }
    return encoded;
}
/**
 * Returns the Starknet ID contract address based on the provided chain ID.
 *
 * @param {StarknetChainId} chainId - The chain ID of the Starknet network.
 * @return {string} The Starknet ID contract address.
 * @throws {Error} Throws an error if the Starknet ID contract is not deployed on the network.
 */
export function getStarknetIdContract(chainId) {
    switch (chainId) {
        case StarknetChainId.SN_MAIN:
            return "0x6ac597f8116f886fa1c97a23fa4e08299975ecaf6b598873ca6792b9bbfb678" /* StarknetIdContract.MAINNET */;
        case StarknetChainId.SN_SEPOLIA:
            return "0x0707f09bc576bd7cfee59694846291047e965f4184fe13dac62c56759b3b6fa7" /* StarknetIdContract.TESTNET_SEPOLIA */;
        default:
            throw new Error('Starknet.id is not yet deployed on this network');
    }
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
export function getStarknetIdIdentityContract(chainId) {
    switch (chainId) {
        case StarknetChainId.SN_MAIN:
            return "0x05dbdedc203e92749e2e746e2d40a768d966bd243df04a6b712e222bc040a9af" /* StarknetIdIdentityContract.MAINNET */;
        case StarknetChainId.SN_SEPOLIA:
            return "0x070DF8B4F5cb2879f8592849fA8f3134da39d25326B8558cc9C8FE8D47EA3A90" /* StarknetIdIdentityContract.TESTNET_SEPOLIA */;
        default:
            throw new Error('Starknet.id verifier contract is not yet deployed on this network');
    }
}
export const StarknetIdMulticallContract = '0x034ffb8f4452df7a613a0210824d6414dbadcddce6c6e19bf4ddc9e22ce5f970';
/**
 * Returns the Starknet.id multicall contract address based on the provided chainId.
 *
 * @param {StarknetChainId} chainId - The chainId of the network.
 * @return {string} - The address of the Starknet.id multicall contract.
 * @throws {Error} - If the Starknet.id multicall contract is not deployed on the network.
 */
export function getStarknetIdMulticallContract(chainId) {
    switch (chainId) {
        case StarknetChainId.SN_MAIN:
            return StarknetIdMulticallContract;
        case StarknetChainId.SN_SEPOLIA:
            return StarknetIdMulticallContract;
        default:
            throw new Error('Starknet.id multicall contract is not yet deployed on this network');
    }
}
/**
 * Returns the address of the Starknet ID Verifier contract based on the specified chain ID.
 *
 * @param {StarknetChainId} chainId - The ID of the Starknet chain.
 * @return {string} - The address of the Starknet ID Verifier contract.
 * @throws {Error} - If the Starknet ID Verifier contract is not deployed on the specified network.
 */
export function getStarknetIdVerifierContract(chainId) {
    switch (chainId) {
        case StarknetChainId.SN_MAIN:
            return "0x07d14dfd8ee95b41fce179170d88ba1f0d5a512e13aeb232f19cfeec0a88f8bf" /* StarknetIdVerifierContract.MAINNET */;
        case StarknetChainId.SN_SEPOLIA:
            return "0x0182EcE8173C216A395f4828e1523541b7e3600bf190CB252E1a1A0cE219d184" /* StarknetIdVerifierContract.TESTNET_SEPOLIA */;
        default:
            throw new Error('Starknet.id verifier contract is not yet deployed on this network');
    }
}
/**
 * Retrieves the contract address of the Starknet.id profile picture verifier contract based on the given chain ID.
 *
 * @param {StarknetChainId} chainId - The chain ID of the network.
 * @returns {string} - The contract address of the Starknet.id profile picture verifier contract.
 * @throws {Error} - Throws an error if the Starknet.id profile picture verifier contract is not yet deployed on the network.
 */
export function getStarknetIdPfpContract(chainId) {
    switch (chainId) {
        case StarknetChainId.SN_MAIN:
            return "0x070aaa20ec4a46da57c932d9fd89ca5e6bb9ca3188d3df361a32306aff7d59c7" /* StarknetIdPfpContract.MAINNET */;
        case StarknetChainId.SN_SEPOLIA:
            return "0x058061bb6bdc501eE215172c9f87d557C1E0f466dC498cA81b18f998Bf1362b2" /* StarknetIdPfpContract.TESTNET_SEPOLIA */;
        default:
            throw new Error('Starknet.id profile picture verifier contract is not yet deployed on this network');
    }
}
/**
 * Retrieves the Starknet ID Proof of Personhood (IdPop) verifier contract address for the given chain ID.
 *
 * @param {StarknetChainId} chainId - The chain ID of the Starknet network.
 * @return {string} - The Starknet ID Pop contract address.
 * @throws {Error} - If the Starknet ID Pop contract is not deployed on the specified network.
 */
export function getStarknetIdPopContract(chainId) {
    switch (chainId) {
        case StarknetChainId.SN_MAIN:
            return "0x0293eb2ba9862f762bd3036586d5755a782bd22e6f5028320f1d0405fd47bff4" /* StarknetIdPopContract.MAINNET */;
        case StarknetChainId.SN_SEPOLIA:
            return "0x0023FE3b845ed5665a9eb3792bbB17347B490EE4090f855C1298d03BB5F49B49" /* StarknetIdPopContract.TESTNET_SEPOLIA */;
        default:
            throw new Error('Starknet.id proof of personhood verifier contract is not yet deployed on this network');
    }
}
/**
 * Executes a method and returns a CairoCustomEnum object.
 *
 * Functions to build CairoCustomEnum for multicall contracts
 * @param {Object} staticEx - An optional object defining the "Static" value of the CairoCustomEnum.
 * @param {number[]} ifEqual - An optional array defining the "IfEqual" value of the CairoCustomEnum.
 * @param {number[]} ifNotEqual - An optional array defining the "IfNotEqual" value of the CairoCustomEnum.
 * @return {CairoCustomEnum} - The created CairoCustomEnum object.
 */
export function execution(staticEx, ifEqual = undefined, ifNotEqual = undefined) {
    return new CairoCustomEnum({
        Static: staticEx,
        IfEqual: ifEqual ? tuple(ifEqual[0], ifEqual[1], ifEqual[2]) : undefined,
        IfNotEqual: ifNotEqual ? tuple(ifNotEqual[0], ifNotEqual[1], ifNotEqual[2]) : undefined,
    });
}
/**
 * Creates a new instance of CairoCustomEnum.
 *
 * @param {BigNumberish | undefined} hardcoded - The hardcoded value for the CairoCustomEnum.
 * @param {number[] | undefined} reference - The reference array for the CairoCustomEnum.
 * @returns {CairoCustomEnum} The new instance of CairoCustomEnum.
 */
export function dynamicFelt(hardcoded, reference = undefined) {
    return new CairoCustomEnum({
        Hardcoded: hardcoded,
        Reference: reference ? tuple(reference[0], reference[1]) : undefined,
    });
}
/**
 * Creates a new instance of CairoCustomEnum with the given parameters.
 * @param {BigNumberish | undefined} hardcoded - The hardcoded value.
 * @param {BigNumberish[] | undefined} [reference] - The reference value (optional).
 * @param {BigNumberish[] | undefined} [arrayReference] - The array reference value (optional).
 * @return {CairoCustomEnum} - The new instance of CairoCustomEnum.
 */
export function dynamicCallData(hardcoded, reference = undefined, arrayReference = undefined) {
    return new CairoCustomEnum({
        Hardcoded: hardcoded,
        Reference: reference ? tuple(reference[0], reference[1]) : undefined,
        ArrayReference: arrayReference ? tuple(arrayReference[0], arrayReference[1]) : undefined,
    });
}
