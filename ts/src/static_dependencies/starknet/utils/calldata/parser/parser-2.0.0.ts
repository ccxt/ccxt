import { Abi, FunctionAbi, EventAbi, StructAbi, InterfaceAbi } from '../../../types/index.js';
import { AbiParserInterface } from './interface.js';

export class AbiParser2 implements AbiParserInterface {
  abi: Abi;

  constructor(abi: Abi) {
    this.abi = abi;
  }

  /**
   * abi method inputs length
   * @param abiMethod FunctionAbi
   * @returns number
   */
  public methodInputsLength(abiMethod: FunctionAbi) {
    return abiMethod.inputs.length;
  }

  /**
   * get method definition from abi
   * @param name string
   * @returns FunctionAbi | undefined
   */
  public getMethod(name: string): FunctionAbi | undefined {
    const intf = this.abi.find(
      (it: FunctionAbi | EventAbi | StructAbi | InterfaceAbi) => it.type === 'interface'
    ) as InterfaceAbi;
    return intf.items.find((it) => it.name === name);
  }

  /**
   * Get Abi in legacy format
   * @returns Abi
   */
  public getLegacyFormat(): Abi {
    return this.abi.flatMap((e: FunctionAbi | EventAbi | StructAbi | InterfaceAbi) => {
      if (e.type === 'interface') {
        return e.items;
      }
      return e;
    });
  }
}
