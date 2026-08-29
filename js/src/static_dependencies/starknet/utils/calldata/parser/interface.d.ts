import { Abi, FunctionAbi } from '../../../types/index.js';
export declare abstract class AbiParserInterface {
    /**
     * Helper to calculate inputs length from abi
     * @param abiMethod FunctionAbi
     * @return number
     */
    abstract methodInputsLength(abiMethod: FunctionAbi): number;
    /**
     *
     * @param name string
     * @return FunctionAbi | undefined
     */
    abstract getMethod(name: string): FunctionAbi | undefined;
    /**
     * Return Abi in legacy format
     * @return Abi
     */
    abstract getLegacyFormat(): Abi;
}
