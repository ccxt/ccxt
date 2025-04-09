import { Abi, AbiEnums, AbiStructs, AllowArray, ArgsOrCalldata, Calldata, HexCalldata, RawArgs, Result, ValidateType } from '../../types/index.js';
import { AbiParserInterface } from './parser/interface.js';
export * as cairo from './cairo.js';
export * as byteArray from './byteArray.js';
export declare class CallData {
    abi: Abi;
    parser: AbiParserInterface;
    protected readonly structs: AbiStructs;
    protected readonly enums: AbiEnums;
    constructor(abi: Abi);
    /**
     * Validate arguments passed to the method as corresponding to the ones in the abi
     * @param type ValidateType - type of the method
     * @param method string - name of the method
     * @param args ArgsOrCalldata - arguments that are passed to the method
     */
    validate(type: ValidateType, method: string, args?: ArgsOrCalldata): void;
    /**
     * Compile contract callData with abi
     * Parse the calldata by using input fields from the abi for that method
     * @param method string - method name
     * @param argsCalldata RawArgs - arguments passed to the method. Can be an array of arguments (in the order of abi definition), or an object constructed in conformity with abi (in this case, the parameter can be in a wrong order).
     * @return Calldata - parsed arguments in format that contract is expecting
     * @example
     * ```typescript
     * const calldata = myCallData.compile("constructor", ["0x34a", [1, 3n]]);
     * ```
     * ```typescript
     * const calldata2 = myCallData.compile("constructor", {list:[1, 3n], balance:"0x34"}); // wrong order is valid
     * ```
     */
    compile(method: string, argsCalldata: RawArgs): Calldata;
    /**
     * Compile contract callData without abi
     * @param rawArgs RawArgs representing cairo method arguments or string array of compiled data
     * @returns Calldata
     */
    static compile(rawArgs: RawArgs): Calldata;
    /**
     * Parse elements of the response array and structuring them into response object
     * @param method string - method name
     * @param response string[] - response from the method
     * @return Result - parsed response corresponding to the abi
     */
    parse(method: string, response: string[]): Result;
    /**
     * Format cairo method response data to native js values based on provided format schema
     * @param method string - cairo method name
     * @param response string[] - cairo method response
     * @param format object - formatter object schema
     * @returns Result - parsed and formatted response object
     */
    format(method: string, response: string[], format: object): Result;
    /**
     * Helper to extract structs from abi
     * @param abi Abi
     * @returns AbiStructs - structs from abi
     */
    static getAbiStruct(abi: Abi): AbiStructs;
    /**
     * Helper to extract enums from abi
     * @param abi Abi
     * @returns AbiEnums - enums from abi
     */
    static getAbiEnum(abi: Abi): AbiEnums;
    /**
     * Helper: Compile HexCalldata | RawCalldata | RawArgs
     * @param rawCalldata HexCalldata | RawCalldata | RawArgs
     * @returns Calldata
     */
    static toCalldata(rawCalldata?: RawArgs): Calldata;
    /**
     * Helper: Convert raw to HexCalldata
     * @param raw HexCalldata | RawCalldata | RawArgs
     * @returns HexCalldata
     */
    static toHex(raw?: RawArgs): HexCalldata;
    /**
     * Parse the elements of a contract response and structure them into one or several Result.
     * In Cairo 0, arrays are not supported.
     * @param typeCairo string or string[] - Cairo type name, ex : "hello::hello::UserData"
     * @param response string[] - serialized data corresponding to typeCairo.
     * @return Result or Result[] - parsed response corresponding to typeData.
     * @example
     * const res2=helloCallData.decodeParameters("hello::hello::UserData",["0x123456","0x1"]);
     * result = { address: 1193046n, is_claimed: true }
     */
    decodeParameters(typeCairo: AllowArray<string>, response: string[]): AllowArray<Result>;
}
