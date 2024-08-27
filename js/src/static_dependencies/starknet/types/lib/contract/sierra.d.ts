import { Abi } from './abi.js';
import { EntryPointsByType } from './legacy.js';
/** SYSTEM TYPES */
export declare type CairoAssembly = {
    prime: string;
    compiler_version: string;
    bytecode: ByteCode;
    hints: any[];
    pythonic_hints?: PythonicHints;
    bytecode_segment_lengths?: number[];
    entry_points_by_type: EntryPointsByType;
};
/** COMPILED CONTRACT */
/**
 * format produced after starknet-compile .cairo to .json
 *
 * sierra_program is hex array
 */
export declare type CompiledSierra = {
    sierra_program: ByteCode;
    sierra_program_debug_info?: SierraProgramDebugInfo;
    contract_class_version: string;
    entry_points_by_type: SierraEntryPointsByType;
    abi: Abi;
};
/**
 * format produced after compressing 'sierra_program', stringifies 'abi' property and omit sierra_program_debug_info
 *
 * CompressedCompiledSierra
 */
export declare type SierraContractClass = Omit<CompiledSierra, 'abi' | 'sierra_program_debug_info'> & {
    sierra_program: string;
    abi: string;
};
export declare type CompiledSierraCasm = CairoAssembly;
/** SUBTYPES */
export declare type ByteCode = string[];
export declare type PythonicHints = [number, string[]][];
export declare type SierraProgramDebugInfo = {
    type_names: [number, string][];
    libfunc_names: [number, string][];
    user_func_names: [number, string][];
};
export declare type SierraEntryPointsByType = {
    CONSTRUCTOR: SierraContractEntryPointFields[];
    EXTERNAL: SierraContractEntryPointFields[];
    L1_HANDLER: SierraContractEntryPointFields[];
};
export declare type SierraContractEntryPointFields = {
    selector: string;
    function_idx: number;
};
