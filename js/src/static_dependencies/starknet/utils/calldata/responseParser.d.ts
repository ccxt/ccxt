import { AbiEntry, AbiEnums, AbiStructs, Args, EventEntry, ParsedStruct } from '../../types/index.js';
/**
 * Parse elements of the response and structuring them into one field by using output property from the abi for that method
 *
 * @param responseIterator - iterator of the response
 * @param output - output(field) information from the abi that will be used to parse the data
 * @param structs - structs from abi
 * @param parsedResult
 * @return - parsed response corresponding to the abi structure of the field
 */
export default function responseParser(responseIterator: Iterator<string>, output: AbiEntry | EventEntry, structs?: AbiStructs, enums?: AbiEnums, parsedResult?: Args | ParsedStruct): any;
