/**
 * Validate cairo contract method arguments
 * Flow: Determine type from abi and than validate against parameter
 */
import { AbiEnums, AbiStructs, FunctionAbi } from '../../types/index.js';
export default function validateFields(abiMethod: FunctionAbi, args: Array<any>, structs: AbiStructs, enums: AbiEnums): void;
