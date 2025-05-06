import { Abi, FunctionAbi } from '../../../types/index.js';
import { AbiParserInterface } from './interface.js';
export declare class AbiParser2 implements AbiParserInterface {
    abi: Abi;
    constructor(abi: Abi);
    /**
     * abi method inputs length
     * @param abiMethod FunctionAbi
     * @returns number
     */
    methodInputsLength(abiMethod: FunctionAbi): number;
    /**
     * get method definition from abi
     * @param name string
     * @returns FunctionAbi | undefined
     */
    getMethod(name: string): FunctionAbi | undefined;
    /**
     * Get Abi in legacy format
     * @returns Abi
     */
    getLegacyFormat(): Abi;
}
