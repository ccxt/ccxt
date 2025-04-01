import { AbiEntry, AbiEnums, AbiStructs } from '../../types/index.js';
/**
 * Parse one field of the calldata by using input field from the abi for that method
 *
 * @param argsIterator - Iterator for value of the field
 * @param input  - input(field) information from the abi that will be used to parse the data
 * @param structs - structs from abi
 * @param enums - enums from abi
 * @return {string | string[]} - parsed arguments in format that contract is expecting
 */
export declare function parseCalldataField(argsIterator: Iterator<any>, input: AbiEntry, structs: AbiStructs, enums: AbiEnums): string | string[];
