import { Abi } from './abi';
import { EntryPointsByType } from './legacy';

/** SYSTEM TYPES */
export type CairoAssembly = {
  prime: string;
  compiler_version: string;
  bytecode: ByteCode;
  hints: any[];
  pythonic_hints?: PythonicHints;
  bytecode_segment_lengths?: number[]; // if Sierra >= v1.5.0
  entry_points_by_type: EntryPointsByType;
};

/** COMPILED CONTRACT */
/**
 * format produced after starknet-compile .cairo to .json
 *
 * sierra_program is hex array
 */
export type CompiledSierra = {
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
export type SierraContractClass = Omit<CompiledSierra, 'abi' | 'sierra_program_debug_info'> & {
  sierra_program: string;
  abi: string;
};
export type CompiledSierraCasm = CairoAssembly;

/** SUBTYPES */
export type ByteCode = string[];
export type PythonicHints = [number, string[]][];

export type SierraProgramDebugInfo = {
  type_names: [number, string][];
  libfunc_names: [number, string][];
  user_func_names: [number, string][];
};

export type SierraEntryPointsByType = {
  CONSTRUCTOR: SierraContractEntryPointFields[];
  EXTERNAL: SierraContractEntryPointFields[];
  L1_HANDLER: SierraContractEntryPointFields[];
};

export type SierraContractEntryPointFields = {
  selector: string;
  function_idx: number;
};
