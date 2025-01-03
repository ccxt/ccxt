'use strict';

var uint256 = require('../cairoDataTypes/uint256.js');
var uint512 = require('../cairoDataTypes/uint512.js');
var encode = require('../encode.js');
var num = require('../num.js');
var shortString = require('../shortString.js');
var byteArray = require('./byteArray.js');
var cairo = require('./cairo.js');
var CairoCustomEnum = require('./enum/CairoCustomEnum.js');
var CairoOption = require('./enum/CairoOption.js');
var CairoResult = require('./enum/CairoResult.js');
var tuple = require('./tuple.js');

/**
 * Parse base types
 * @param type type of element
 * @param it iterator
 * @returns bigint | boolean
 */
function parseBaseTypes(type, it) {
    let temp;
    switch (true) {
        case cairo.isTypeBool(type):
            temp = it.next().value;
            return Boolean(BigInt(temp));
        case uint256.CairoUint256.isAbiType(type):
            const low = it.next().value;
            const high = it.next().value;
            return new uint256.CairoUint256(low, high).toBigInt();
        case uint512.CairoUint512.isAbiType(type):
            const limb0 = it.next().value;
            const limb1 = it.next().value;
            const limb2 = it.next().value;
            const limb3 = it.next().value;
            return new uint512.CairoUint512(limb0, limb1, limb2, limb3).toBigInt();
        case type === 'core::starknet::eth_address::EthAddress':
            temp = it.next().value;
            return BigInt(temp);
        case type === 'core::bytes_31::bytes31':
            temp = it.next().value;
            return shortString.decodeShortString(temp);
        case cairo.isTypeSecp256k1Point(type):
            const xLow = encode.removeHexPrefix(it.next().value).padStart(32, '0');
            const xHigh = encode.removeHexPrefix(it.next().value).padStart(32, '0');
            const yLow = encode.removeHexPrefix(it.next().value).padStart(32, '0');
            const yHigh = encode.removeHexPrefix(it.next().value).padStart(32, '0');
            const pubK = BigInt(encode.addHexPrefix(xHigh + xLow + yHigh + yLow));
            return pubK;
        default:
            temp = it.next().value;
            return BigInt(temp);
    }
}
/**
 * Parse of the response elements that are converted to Object (Struct) by using the abi
 *
 * @param responseIterator - iterator of the response
 * @param element - element of the field {name: string, type: string}
 * @param structs - structs from abi
 * @param enums
 * @return {any} - parsed arguments in format that contract is expecting
 */
function parseResponseValue(responseIterator, element, structs, enums) {
    if (element.type === '()') {
        return {};
    }
    // type uint256 struct (c1v2)
    if (uint256.CairoUint256.isAbiType(element.type)) {
        const low = responseIterator.next().value;
        const high = responseIterator.next().value;
        return new uint256.CairoUint256(low, high).toBigInt();
    }
    // type uint512 struct
    if (uint512.CairoUint512.isAbiType(element.type)) {
        const limb0 = responseIterator.next().value;
        const limb1 = responseIterator.next().value;
        const limb2 = responseIterator.next().value;
        const limb3 = responseIterator.next().value;
        return new uint512.CairoUint512(limb0, limb1, limb2, limb3).toBigInt();
    }
    // type C1 ByteArray struct, representing a LongString
    if (cairo.isTypeByteArray(element.type)) {
        const parsedBytes31Arr = [];
        const bytes31ArrLen = BigInt(responseIterator.next().value);
        while (parsedBytes31Arr.length < bytes31ArrLen) {
            parsedBytes31Arr.push(num.toHex(responseIterator.next().value));
        }
        const pending_word = num.toHex(responseIterator.next().value);
        const pending_word_len = BigInt(responseIterator.next().value);
        const myByteArray = {
            data: parsedBytes31Arr,
            pending_word,
            pending_word_len,
        };
        return byteArray.stringFromByteArray(myByteArray);
    }
    // type c1 array
    if (cairo.isTypeArray(element.type)) {
        // eslint-disable-next-line no-case-declarations
        const parsedDataArr = [];
        const el = { name: '', type: cairo.getArrayType(element.type) };
        const len = BigInt(responseIterator.next().value); // get length
        while (parsedDataArr.length < len) {
            parsedDataArr.push(parseResponseValue(responseIterator, el, structs, enums));
        }
        return parsedDataArr;
    }
    // type struct
    if (structs && element.type in structs && structs[element.type]) {
        if (element.type === 'core::starknet::eth_address::EthAddress') {
            return parseBaseTypes(element.type, responseIterator);
        }
        return structs[element.type].members.reduce((acc, el) => {
            acc[el.name] = parseResponseValue(responseIterator, el, structs, enums);
            return acc;
        }, {});
    }
    // type Enum (only CustomEnum)
    if (enums && element.type in enums && enums[element.type]) {
        const variantNum = Number(responseIterator.next().value); // get variant number
        const rawEnum = enums[element.type].variants.reduce((acc, variant, num) => {
            if (num === variantNum) {
                acc[variant.name] = parseResponseValue(responseIterator, { name: '', type: variant.type }, structs, enums);
                return acc;
            }
            acc[variant.name] = undefined;
            return acc;
        }, {});
        // Option
        if (element.type.startsWith('core::option::Option')) {
            const content = variantNum === CairoOption.CairoOptionVariant.Some ? rawEnum.Some : undefined;
            return new CairoOption.CairoOption(variantNum, content);
        }
        // Result
        if (element.type.startsWith('core::result::Result')) {
            let content;
            if (variantNum === CairoResult.CairoResultVariant.Ok) {
                content = rawEnum.Ok;
            }
            else {
                content = rawEnum.Err;
            }
            return new CairoResult.CairoResult(variantNum, content);
        }
        // Cairo custom Enum
        const customEnum = new CairoCustomEnum.CairoCustomEnum(rawEnum);
        return customEnum;
    }
    // type tuple
    if (cairo.isTypeTuple(element.type)) {
        const memberTypes = tuple(element.type);
        return memberTypes.reduce((acc, it, idx) => {
            const name = it?.name ? it.name : idx;
            const type = it?.type ? it.type : it;
            const el = { name, type };
            acc[name] = parseResponseValue(responseIterator, el, structs, enums);
            return acc;
        }, {});
    }
    // type c1 array
    if (cairo.isTypeArray(element.type)) {
        // eslint-disable-next-line no-case-declarations
        const parsedDataArr = [];
        const el = { name: '', type: cairo.getArrayType(element.type) };
        const len = BigInt(responseIterator.next().value); // get length
        while (parsedDataArr.length < len) {
            parsedDataArr.push(parseResponseValue(responseIterator, el, structs, enums));
        }
        return parsedDataArr;
    }
    // base type
    return parseBaseTypes(element.type, responseIterator);
}
/**
 * Parse elements of the response and structuring them into one field by using output property from the abi for that method
 *
 * @param responseIterator - iterator of the response
 * @param output - output(field) information from the abi that will be used to parse the data
 * @param structs - structs from abi
 * @param parsedResult
 * @return - parsed response corresponding to the abi structure of the field
 */
function responseParser(responseIterator, output, structs, enums, parsedResult) {
    const { name, type } = output;
    let temp;
    switch (true) {
        case cairo.isLen(name):
            temp = responseIterator.next().value;
            return BigInt(temp);
        case (structs && type in structs) || cairo.isTypeTuple(type):
            return parseResponseValue(responseIterator, output, structs, enums);
        case enums && cairo.isTypeEnum(type, enums):
            return parseResponseValue(responseIterator, output, structs, enums);
        case cairo.isTypeArray(type):
            // C1 Array
            if (cairo.isCairo1Type(type)) {
                return parseResponseValue(responseIterator, output, structs, enums);
            }
            // C0 Array
            // eslint-disable-next-line no-case-declarations
            const parsedDataArr = [];
            if (parsedResult && parsedResult[`${name}_len`]) {
                const arrLen = parsedResult[`${name}_len`];
                while (parsedDataArr.length < arrLen) {
                    parsedDataArr.push(parseResponseValue(responseIterator, { name, type: output.type.replace('*', '') }, structs, enums));
                }
            }
            return parsedDataArr;
        default:
            return parseBaseTypes(type, responseIterator);
    }
}

module.exports = responseParser;
