import { LegacyCompiledContract, LegacyContractClass } from './legacy.js';
import { CompiledSierra, SierraContractClass } from './sierra.js';
/**
 * format produced after compressing compiled contract
 *
 * CompressedCompiledContract
 */
export declare type ContractClass = LegacyContractClass | SierraContractClass;
/**
 * format produced after compile .cairo to .json
 */
export declare type CompiledContract = LegacyCompiledContract | CompiledSierra;
/**
 * Compressed or decompressed Cairo0 or Cairo1 Contract
 */
export declare type CairoContract = ContractClass | CompiledContract;
export declare enum EntryPointType {
    EXTERNAL = "EXTERNAL",
    L1_HANDLER = "L1_HANDLER",
    CONSTRUCTOR = "CONSTRUCTOR"
}
export * from './abi.js';
export * from './legacy.js';
export * from './sierra.js';
