/**
 * Class Hash
 */
import { BigNumberish, CompiledContract, CompiledSierra, CompiledSierraCasm, LegacyCompiledContract, RawArgs } from '../../types/index.js';
export declare function computePedersenHash(a: BigNumberish, b: BigNumberish): string;
export declare function computePoseidonHash(a: BigNumberish, b: BigNumberish): string;
/**
 * Compute pedersen hash from data
 * @returns format: hex-string - pedersen hash
 */
export declare function computeHashOnElements(data: BigNumberish[]): string;
export declare const computePedersenHashOnElements: typeof computeHashOnElements;
export declare function computePoseidonHashOnElements(data: BigNumberish[]): string;
/**
 * Calculate contract address from class hash
 * @returns format: hex-string
 */
export declare function calculateContractAddressFromHash(salt: BigNumberish, classHash: BigNumberish, constructorCalldata: RawArgs, deployerAddress: BigNumberish): string;
/**
 * Format json-string to conform starknet json-string
 * @param json json-string
 * @returns format: json-string
 */
export declare function formatSpaces(json: string): string;
/**
 * Compute hinted class hash for legacy compiled contract (Cairo 0)
 * @returns format: hex-string
 */
export default function computeHintedClassHash(compiledContract: LegacyCompiledContract): string;
/**
 * Computes the class hash for legacy compiled contract (Cairo 0)
 * @returns format: hex-string
 */
export declare function computeLegacyContractClassHash(contract: LegacyCompiledContract | string): string;
/**
 * Compute hash of the bytecode for Sierra v1.5.0 onwards (Cairo 2.6.0)
 * Each segment is Poseidon hashed.
 * The global hash is : 1 + PoseidonHash(len0, h0, len1, h1, ...)
 * @param casm compiled Sierra CASM file content.
 * @returns the bytecode hash as bigint.
 */
export declare function hashByteCodeSegments(casm: CompiledSierraCasm): bigint;
/**
 * Compute compiled class hash for contract (Cairo 1)
 * @returns format: hex-string
 */
export declare function computeCompiledClassHash(casm: CompiledSierraCasm): string;
/**
 * Compute sierra contract class hash (Cairo 1)
 * @returns format: hex-string
 */
export declare function computeSierraContractClassHash(sierra: CompiledSierra): string;
/**
 * Compute ClassHash (sierra or legacy) based on provided contract
 * @returns format: hex-string
 */
export declare function computeContractClassHash(contract: CompiledContract | string): string;
