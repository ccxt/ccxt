import { Abi, FunctionAbi, RawArgs } from '../../../types/index.js';
import { AbiParserInterface } from './interface.js';
export declare function createAbiParser(abi: Abi): AbiParserInterface;
export declare function getAbiVersion(abi: Abi): 0 | 1 | 2;
export declare function isNoConstructorValid(method: string, argsCalldata: RawArgs, abiMethod?: FunctionAbi): boolean;
