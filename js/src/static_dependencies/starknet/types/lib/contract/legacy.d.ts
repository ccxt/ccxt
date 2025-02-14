import { Abi } from './abi.js';
/** LEGACY CONTRACT */
/**
 * format produced after compressing 'program' property
 */
export declare type LegacyContractClass = {
    program: CompressedProgram;
    entry_points_by_type: EntryPointsByType;
    abi: Abi;
};
/**
 * format produced after compiling .cairo to .json
 */
export declare type LegacyCompiledContract = Omit<LegacyContractClass, 'program'> & {
    program: Program;
};
/** SUBTYPES */
export declare type Builtins = string[];
export declare type CompressedProgram = string;
export declare type EntryPointsByType = {
    CONSTRUCTOR: ContractEntryPointFields[];
    EXTERNAL: ContractEntryPointFields[];
    L1_HANDLER: ContractEntryPointFields[];
};
export declare type ContractEntryPointFields = {
    selector: string;
    offset: string | number;
    builtins?: Builtins;
};
export interface Program extends Record<string, any> {
    builtins: string[];
    data: string[];
}
