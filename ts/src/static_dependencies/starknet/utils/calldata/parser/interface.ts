import { Abi, FunctionAbi } from '../../../types/index.js';

export abstract class AbiParserInterface {
  /**
   * Helper to calculate inputs length from abi
   * @param abiMethod FunctionAbi
   * @return number
   */
  public abstract methodInputsLength(abiMethod: FunctionAbi): number;

  /**
   *
   * @param name string
   * @return FunctionAbi | undefined
   */
  public abstract getMethod(name: string): FunctionAbi | undefined;

  /**
   * Return Abi in legacy format
   * @return Abi
   */
  public abstract getLegacyFormat(): Abi;
}
