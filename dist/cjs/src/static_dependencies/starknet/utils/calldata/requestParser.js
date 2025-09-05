'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var uint256 = require('../cairoDataTypes/uint256.js');
var uint512 = require('../cairoDataTypes/uint512.js');
var encode = require('../encode.js');
var num = require('../num.js');
var shortString = require('../shortString.js');
var byteArray = require('./byteArray.js');
var cairo = require('./cairo.js');
var CairoOption = require('./enum/CairoOption.js');
var CairoResult = require('./enum/CairoResult.js');
var tuple = require('./tuple.js');

// ----------------------------------------------------------------------------
/**
 * parse base types
 * @param type type from abi
 * @param val value provided
 * @returns string | string[]
 */
function parseBaseTypes(type, val) {
    switch (true) {
        case uint256.CairoUint256.isAbiType(type):
            return new uint256.CairoUint256(val).toApiRequest();
        case uint512.CairoUint512.isAbiType(type):
            return new uint512.CairoUint512(val).toApiRequest();
        case cairo.isTypeBytes31(type):
            return shortString.encodeShortString(val.toString());
        case cairo.isTypeSecp256k1Point(type): {
            const pubKeyETH = encode.removeHexPrefix(num.toHex(val)).padStart(128, '0');
            const pubKeyETHy = cairo.uint256(encode.addHexPrefix(pubKeyETH.slice(-64)));
            const pubKeyETHx = cairo.uint256(encode.addHexPrefix(pubKeyETH.slice(0, -64)));
            return [
                cairo.felt(pubKeyETHx.low),
                cairo.felt(pubKeyETHx.high),
                cairo.felt(pubKeyETHy.low),
                cairo.felt(pubKeyETHy.high),
            ];
        }
        default:
            return cairo.felt(val);
    }
}
/**
 * Parse tuple type string to array of known objects
 * @param element request element
 * @param typeStr tuple type string
 * @returns Tupled[]
 */
function parseTuple(element, typeStr) {
    const memberTypes = tuple(typeStr);
    const elements = Object.values(element);
    if (elements.length !== memberTypes.length) {
        throw Error(`ParseTuple: provided and expected abi tuple size do not match.
      provided: ${elements} 
      expected: ${memberTypes}`);
    }
    return memberTypes.map((it, dx) => {
        return {
            element: elements[dx],
            type: it.type ?? it,
        };
    });
}
function parseByteArray(element) {
    const myByteArray = byteArray.byteArrayFromString(element);
    return [
        myByteArray.data.length.toString(),
        ...myByteArray.data.map((bn) => bn.toString()),
        myByteArray.pending_word.toString(),
        myByteArray.pending_word_len.toString(),
    ];
}
/**
 * Deep parse of the object that has been passed to the method
 *
 * @param element - element that needs to be parsed
 * @param type  - name of the method
 * @param structs - structs from abi
 * @param enums - enums from abi
 * @return {string | string[]} - parsed arguments in format that contract is expecting
 */
function parseCalldataValue(element, type, structs, enums) {
    if (element === undefined) {
        throw Error(`Missing parameter for type ${type}`);
    }
    // value is Array
    if (Array.isArray(element)) {
        const result = [];
        result.push(cairo.felt(element.length)); // Add length to array
        const arrayType = cairo.getArrayType(type);
        return element.reduce((acc, it) => {
            return acc.concat(parseCalldataValue(it, arrayType, structs, enums));
        }, result);
    }
    // checking if the passed element is struct
    if (structs[type] && structs[type].members.length) {
        if (uint256.CairoUint256.isAbiType(type)) {
            return new uint256.CairoUint256(element).toApiRequest();
        }
        if (uint512.CairoUint512.isAbiType(type)) {
            return new uint512.CairoUint512(element).toApiRequest();
        }
        if (type === 'core::starknet::eth_address::EthAddress')
            return parseBaseTypes(type, element);
        if (type === 'core::byte_array::ByteArray')
            return parseByteArray(element);
        const { members } = structs[type];
        const subElement = element;
        return members.reduce((acc, it) => {
            return acc.concat(parseCalldataValue(subElement[it.name], it.type, structs, enums));
        }, []);
    }
    // check if abi element is tuple
    if (cairo.isTypeTuple(type)) {
        const tupled = parseTuple(element, type);
        return tupled.reduce((acc, it) => {
            const parsedData = parseCalldataValue(it.element, it.type, structs, enums);
            return acc.concat(parsedData);
        }, []);
    }
    // check if u256 C1v0
    if (uint256.CairoUint256.isAbiType(type)) {
        return new uint256.CairoUint256(element).toApiRequest();
    }
    // check if u512
    if (uint512.CairoUint512.isAbiType(type)) {
        return new uint512.CairoUint512(element).toApiRequest();
    }
    // check if Enum
    if (cairo.isTypeEnum(type, enums)) {
        const { variants } = enums[type];
        // Option Enum
        if (cairo.isTypeOption(type)) {
            const myOption = element;
            if (myOption.isSome()) {
                const listTypeVariant = variants.find((variant) => variant.name === 'Some');
                if (typeof listTypeVariant === 'undefined') {
                    throw Error(`Error in abi : Option has no 'Some' variant.`);
                }
                const typeVariantSome = listTypeVariant.type;
                if (typeVariantSome === '()') {
                    return CairoOption.CairoOptionVariant.Some.toString();
                }
                const parsedParameter = parseCalldataValue(myOption.unwrap(), typeVariantSome, structs, enums);
                if (Array.isArray(parsedParameter)) {
                    return [CairoOption.CairoOptionVariant.Some.toString(), ...parsedParameter];
                }
                return [CairoOption.CairoOptionVariant.Some.toString(), parsedParameter];
            }
            return CairoOption.CairoOptionVariant.None.toString();
        }
        // Result Enum
        if (cairo.isTypeResult(type)) {
            const myResult = element;
            if (myResult.isOk()) {
                const listTypeVariant = variants.find((variant) => variant.name === 'Ok');
                if (typeof listTypeVariant === 'undefined') {
                    throw Error(`Error in abi : Result has no 'Ok' variant.`);
                }
                const typeVariantOk = listTypeVariant.type;
                if (typeVariantOk === '()') {
                    return CairoResult.CairoResultVariant.Ok.toString();
                }
                const parsedParameter = parseCalldataValue(myResult.unwrap(), typeVariantOk, structs, enums);
                if (Array.isArray(parsedParameter)) {
                    return [CairoResult.CairoResultVariant.Ok.toString(), ...parsedParameter];
                }
                return [CairoResult.CairoResultVariant.Ok.toString(), parsedParameter];
            }
            // is Result::Err
            const listTypeVariant = variants.find((variant) => variant.name === 'Err');
            if (typeof listTypeVariant === 'undefined') {
                throw Error(`Error in abi : Result has no 'Err' variant.`);
            }
            const typeVariantErr = listTypeVariant.type;
            if (typeVariantErr === '()') {
                return CairoResult.CairoResultVariant.Err.toString();
            }
            const parsedParameter = parseCalldataValue(myResult.unwrap(), typeVariantErr, structs, enums);
            if (Array.isArray(parsedParameter)) {
                return [CairoResult.CairoResultVariant.Err.toString(), ...parsedParameter];
            }
            return [CairoResult.CairoResultVariant.Err.toString(), parsedParameter];
        }
        // Custom Enum
        const myEnum = element;
        const activeVariant = myEnum.activeVariant();
        const listTypeVariant = variants.find((variant) => variant.name === activeVariant);
        if (typeof listTypeVariant === 'undefined') {
            throw Error(`Not find in abi : Enum has no '${activeVariant}' variant.`);
        }
        const typeActiveVariant = listTypeVariant.type;
        const numActiveVariant = variants.findIndex((variant) => variant.name === activeVariant); // can not fail due to check of listTypeVariant
        if (typeActiveVariant === '()') {
            return numActiveVariant.toString();
        }
        const parsedParameter = parseCalldataValue(myEnum.unwrap(), typeActiveVariant, structs, enums);
        if (Array.isArray(parsedParameter)) {
            return [numActiveVariant.toString(), ...parsedParameter];
        }
        return [numActiveVariant.toString(), parsedParameter];
    }
    if (typeof element === 'object') {
        throw Error(`Parameter ${element} do not align with abi parameter ${type}`);
    }
    return parseBaseTypes(type, element);
}
/**
 * Parse one field of the calldata by using input field from the abi for that method
 *
 * @param argsIterator - Iterator for value of the field
 * @param input  - input(field) information from the abi that will be used to parse the data
 * @param structs - structs from abi
 * @param enums - enums from abi
 * @return {string | string[]} - parsed arguments in format that contract is expecting
 */
function parseCalldataField(argsIterator, input, structs, enums) {
    const { name, type } = input;
    let { value } = argsIterator.next();
    switch (true) {
        // Array
        case cairo.isTypeArray(type):
            if (!Array.isArray(value) && !shortString.isText(value)) {
                throw Error(`ABI expected parameter ${name} to be array or long string, got ${value}`);
            }
            if (shortString.isString(value)) {
                // long string match cairo felt*
                value = shortString.splitLongString(value);
            }
            return parseCalldataValue(value, input.type, structs, enums);
        case type === 'core::starknet::eth_address::EthAddress':
            return parseBaseTypes(type, value);
        // Struct or Tuple
        case cairo.isTypeStruct(type, structs) ||
            cairo.isTypeTuple(type) ||
            uint256.CairoUint256.isAbiType(type) ||
            uint256.CairoUint256.isAbiType(type):
            return parseCalldataValue(value, type, structs, enums);
        // Enums
        case cairo.isTypeEnum(type, enums):
            return parseCalldataValue(value, type, structs, enums);
        // Felt or unhandled
        default:
            return parseBaseTypes(type, value);
    }
}

exports.parseCalldataField = parseCalldataField;
