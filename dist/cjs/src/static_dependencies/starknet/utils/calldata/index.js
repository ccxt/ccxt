'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var calldata = require('../../types/calldata.js');
require('../../types/lib/index.js');
var assert = require('../assert.js');
var num = require('../num.js');
var selector = require('../selector.js');
var shortString = require('../shortString.js');
var byteArray = require('./byteArray.js');
var cairo = require('./cairo.js');
var CairoOption = require('./enum/CairoOption.js');
var CairoResult = require('./enum/CairoResult.js');
var formatter = require('./formatter.js');
var index = require('./parser/index.js');
var propertyOrder = require('./propertyOrder.js');
var requestParser = require('./requestParser.js');
var responseParser = require('./responseParser.js');
var validate = require('./validate.js');

// ----------------------------------------------------------------------------
class CallData {
    constructor(abi) {
        this.structs = CallData.getAbiStruct(abi);
        this.enums = CallData.getAbiEnum(abi);
        this.parser = index.createAbiParser(abi);
        this.abi = this.parser.getLegacyFormat();
    }
    /**
     * Validate arguments passed to the method as corresponding to the ones in the abi
     * @param type ValidateType - type of the method
     * @param method string - name of the method
     * @param args ArgsOrCalldata - arguments that are passed to the method
     */
    validate(type, method, args = []) {
        // ensure provided method of type exists
        if (type !== calldata.ValidateType.DEPLOY) {
            const invocableFunctionNames = this.abi
                .filter((abi) => {
                if (abi.type !== 'function')
                    return false;
                const isView = abi.stateMutability === 'view' || abi.state_mutability === 'view';
                return type === calldata.ValidateType.INVOKE ? !isView : isView;
            })
                .map((abi) => abi.name);
            assert(invocableFunctionNames.includes(method), `${type === calldata.ValidateType.INVOKE ? 'invocable' : 'viewable'} method not found in abi`);
        }
        // get requested method from abi
        const abiMethod = this.abi.find((abi) => type === calldata.ValidateType.DEPLOY
            ? abi.name === method && abi.type === 'constructor'
            : abi.name === method && abi.type === 'function');
        if (index.isNoConstructorValid(method, args, abiMethod)) {
            return;
        }
        // validate arguments length
        const inputsLength = this.parser.methodInputsLength(abiMethod);
        if (args.length !== inputsLength) {
            throw Error(`Invalid number of arguments, expected ${inputsLength} arguments, but got ${args.length}`);
        }
        // validate parameters
        validate(abiMethod, args, this.structs, this.enums);
    }
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
    compile(method, argsCalldata) {
        const abiMethod = this.abi.find((abiFunction) => abiFunction.name === method);
        if (index.isNoConstructorValid(method, argsCalldata, abiMethod)) {
            return [];
        }
        let args;
        if (Array.isArray(argsCalldata)) {
            args = argsCalldata;
        }
        else {
            // order the object
            const orderedObject = propertyOrder(argsCalldata, abiMethod.inputs, this.structs, this.enums);
            args = Object.values(orderedObject);
            //   // validate array elements to abi
            validate(abiMethod, args, this.structs, this.enums);
        }
        const argsIterator = args[Symbol.iterator]();
        const callArray = abiMethod.inputs.reduce((acc, input) => cairo.isLen(input.name) && !cairo.isCairo1Type(input.type)
            ? acc
            : acc.concat(requestParser.parseCalldataField(argsIterator, input, this.structs, this.enums)), []);
        // add compiled property to array object
        Object.defineProperty(callArray, '__compiled__', {
            enumerable: false,
            writable: false,
            value: true,
        });
        return callArray;
    }
    /**
     * Compile contract callData without abi
     * @param rawArgs RawArgs representing cairo method arguments or string array of compiled data
     * @returns Calldata
     */
    static compile(rawArgs) {
        const createTree = (obj) => {
            const getEntries = (o, prefix = '.') => {
                const oe = Array.isArray(o) ? [o.length.toString(), ...o] : o;
                return Object.entries(oe).flatMap(([k, v]) => {
                    let value = v;
                    if (k === 'entrypoint')
                        value = selector.getSelectorFromName(value);
                    else if (shortString.isLongText(value))
                        value = byteArray.byteArrayFromString(value);
                    const kk = Array.isArray(oe) && k === '0' ? '$$len' : k;
                    if (num.isBigInt(value))
                        return [[`${prefix}${kk}`, cairo.felt(value)]];
                    if (Object(value) === value) {
                        const methodsKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(value));
                        const keys = [...Object.getOwnPropertyNames(value), ...methodsKeys];
                        if (keys.includes('isSome') && keys.includes('isNone')) {
                            // Option
                            const myOption = value;
                            const variantNb = myOption.isSome()
                                ? CairoOption.CairoOptionVariant.Some
                                : CairoOption.CairoOptionVariant.None;
                            if (myOption.isSome())
                                return getEntries({ 0: variantNb, 1: myOption.unwrap() }, `${prefix}${kk}.`);
                            return [[`${prefix}${kk}`, cairo.felt(variantNb)]];
                        }
                        if (keys.includes('isOk') && keys.includes('isErr')) {
                            // Result
                            const myResult = value;
                            const variantNb = myResult.isOk() ? CairoResult.CairoResultVariant.Ok : CairoResult.CairoResultVariant.Err;
                            return getEntries({ 0: variantNb, 1: myResult.unwrap() }, `${prefix}${kk}.`);
                        }
                        if (keys.includes('variant') && keys.includes('activeVariant')) {
                            // CustomEnum
                            const myEnum = value;
                            const activeVariant = myEnum.activeVariant();
                            const listVariants = Object.keys(myEnum.variant);
                            const activeVariantNb = listVariants.findIndex((variant) => variant === activeVariant);
                            if (typeof myEnum.unwrap() === 'object' &&
                                Object.keys(myEnum.unwrap()).length === 0 // empty object : {}
                            ) {
                                return [[`${prefix}${kk}`, cairo.felt(activeVariantNb)]];
                            }
                            return getEntries({ 0: activeVariantNb, 1: myEnum.unwrap() }, `${prefix}${kk}.`);
                        }
                        // normal object
                        return getEntries(value, `${prefix}${kk}.`);
                    }
                    return [[`${prefix}${kk}`, cairo.felt(value)]];
                });
            };
            const result = Object.fromEntries(getEntries(obj));
            return result;
        };
        let callTreeArray;
        if (!Array.isArray(rawArgs)) {
            // flatten structs, tuples, add array length. Process leafs as Felt
            const callTree = createTree(rawArgs);
            // convert to array
            callTreeArray = Object.values(callTree);
        }
        else {
            // already compiled data but modified or raw args provided as array, recompile it
            // recreate tree
            const callObj = { ...rawArgs };
            const callTree = createTree(callObj);
            callTreeArray = Object.values(callTree);
        }
        // add compiled property to array object
        Object.defineProperty(callTreeArray, '__compiled__', {
            enumerable: false,
            writable: false,
            value: true,
        });
        return callTreeArray;
    }
    /**
     * Parse elements of the response array and structuring them into response object
     * @param method string - method name
     * @param response string[] - response from the method
     * @return Result - parsed response corresponding to the abi
     */
    parse(method, response) {
        const { outputs } = this.abi.find((abi) => abi.name === method);
        const responseIterator = response.flat()[Symbol.iterator]();
        const parsed = outputs.flat().reduce((acc, output, idx) => {
            const propName = output.name ?? idx;
            acc[propName] = responseParser(responseIterator, output, this.structs, this.enums, acc);
            if (acc[propName] && acc[`${propName}_len`]) {
                delete acc[`${propName}_len`];
            }
            return acc;
        }, {});
        // Cairo1 avoid object.0 structure
        return Object.keys(parsed).length === 1 && 0 in parsed ? parsed[0] : parsed;
    }
    /**
     * Format cairo method response data to native js values based on provided format schema
     * @param method string - cairo method name
     * @param response string[] - cairo method response
     * @param format object - formatter object schema
     * @returns Result - parsed and formatted response object
     */
    format(method, response, format) {
        const parsed = this.parse(method, response);
        return formatter(parsed, format);
    }
    /**
     * Helper to extract structs from abi
     * @param abi Abi
     * @returns AbiStructs - structs from abi
     */
    static getAbiStruct(abi) {
        return abi
            .filter((abiEntry) => abiEntry.type === 'struct')
            .reduce((acc, abiEntry) => ({
            ...acc,
            [abiEntry.name]: abiEntry,
        }), {});
    }
    /**
     * Helper to extract enums from abi
     * @param abi Abi
     * @returns AbiEnums - enums from abi
     */
    static getAbiEnum(abi) {
        const fullEnumList = abi
            .filter((abiEntry) => abiEntry.type === 'enum')
            .reduce((acc, abiEntry) => ({
            ...acc,
            [abiEntry.name]: abiEntry,
        }), {});
        delete fullEnumList['core::bool'];
        return fullEnumList;
    }
    /**
     * Helper: Compile HexCalldata | RawCalldata | RawArgs
     * @param rawCalldata HexCalldata | RawCalldata | RawArgs
     * @returns Calldata
     */
    static toCalldata(rawCalldata = []) {
        return CallData.compile(rawCalldata);
    }
    /**
     * Helper: Convert raw to HexCalldata
     * @param raw HexCalldata | RawCalldata | RawArgs
     * @returns HexCalldata
     */
    static toHex(raw = []) {
        const calldata = CallData.compile(raw);
        return calldata.map((it) => num.toHex(it));
    }
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
    decodeParameters(typeCairo, response) {
        const typeCairoArray = Array.isArray(typeCairo) ? typeCairo : [typeCairo];
        const responseIterator = response.flat()[Symbol.iterator]();
        const decodedArray = typeCairoArray.map((typeParam) => responseParser(responseIterator, { name: '', type: typeParam }, this.structs, this.enums));
        return decodedArray.length === 1 ? decodedArray[0] : decodedArray;
    }
}

exports.CallData = CallData;
