import { CairoUint256 } from '../cairoDataTypes/uint256.js';
import { CairoUint512 } from '../cairoDataTypes/uint512.js';
import { addHexPrefix, removeHexPrefix } from '../encode.js';
import { toHex } from '../num.js';
import { encodeShortString, isString, isText, splitLongString } from '../shortString.js';
import { byteArrayFromString } from './byteArray.js';
import { felt, getArrayType, isTypeArray, isTypeBytes31, isTypeEnum, isTypeOption, isTypeResult, isTypeSecp256k1Point, isTypeStruct, isTypeTuple, uint256, } from './cairo.js';
import { CairoOptionVariant, CairoResultVariant, } from './enum/index.js';
import extractTupleMemberTypes from './tuple.js';
/**
 * parse base types
 * @param type type from abi
 * @param val value provided
 * @returns string | string[]
 */
function parseBaseTypes(type, val) {
    switch (true) {
        case CairoUint256.isAbiType(type):
            return new CairoUint256(val).toApiRequest();
        case CairoUint512.isAbiType(type):
            return new CairoUint512(val).toApiRequest();
        case isTypeBytes31(type):
            return encodeShortString(val.toString());
        case isTypeSecp256k1Point(type): {
            const pubKeyETH = removeHexPrefix(toHex(val)).padStart(128, '0');
            const pubKeyETHy = uint256(addHexPrefix(pubKeyETH.slice(-64)));
            const pubKeyETHx = uint256(addHexPrefix(pubKeyETH.slice(0, -64)));
            return [
                felt(pubKeyETHx.low),
                felt(pubKeyETHx.high),
                felt(pubKeyETHy.low),
                felt(pubKeyETHy.high),
            ];
        }
        default:
            return felt(val);
    }
}
/**
 * Parse tuple type string to array of known objects
 * @param element request element
 * @param typeStr tuple type string
 * @returns Tupled[]
 */
function parseTuple(element, typeStr) {
    const memberTypes = extractTupleMemberTypes(typeStr);
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
    const myByteArray = byteArrayFromString(element);
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
        result.push(felt(element.length)); // Add length to array
        const arrayType = getArrayType(type);
        return element.reduce((acc, it) => {
            return acc.concat(parseCalldataValue(it, arrayType, structs, enums));
        }, result);
    }
    // checking if the passed element is struct
    if (structs[type] && structs[type].members.length) {
        if (CairoUint256.isAbiType(type)) {
            return new CairoUint256(element).toApiRequest();
        }
        if (CairoUint512.isAbiType(type)) {
            return new CairoUint512(element).toApiRequest();
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
    if (isTypeTuple(type)) {
        const tupled = parseTuple(element, type);
        return tupled.reduce((acc, it) => {
            const parsedData = parseCalldataValue(it.element, it.type, structs, enums);
            return acc.concat(parsedData);
        }, []);
    }
    // check if u256 C1v0
    if (CairoUint256.isAbiType(type)) {
        return new CairoUint256(element).toApiRequest();
    }
    // check if u512
    if (CairoUint512.isAbiType(type)) {
        return new CairoUint512(element).toApiRequest();
    }
    // check if Enum
    if (isTypeEnum(type, enums)) {
        const { variants } = enums[type];
        // Option Enum
        if (isTypeOption(type)) {
            const myOption = element;
            if (myOption.isSome()) {
                const listTypeVariant = variants.find((variant) => variant.name === 'Some');
                if (typeof listTypeVariant === 'undefined') {
                    throw Error(`Error in abi : Option has no 'Some' variant.`);
                }
                const typeVariantSome = listTypeVariant.type;
                if (typeVariantSome === '()') {
                    return CairoOptionVariant.Some.toString();
                }
                const parsedParameter = parseCalldataValue(myOption.unwrap(), typeVariantSome, structs, enums);
                if (Array.isArray(parsedParameter)) {
                    return [CairoOptionVariant.Some.toString(), ...parsedParameter];
                }
                return [CairoOptionVariant.Some.toString(), parsedParameter];
            }
            return CairoOptionVariant.None.toString();
        }
        // Result Enum
        if (isTypeResult(type)) {
            const myResult = element;
            if (myResult.isOk()) {
                const listTypeVariant = variants.find((variant) => variant.name === 'Ok');
                if (typeof listTypeVariant === 'undefined') {
                    throw Error(`Error in abi : Result has no 'Ok' variant.`);
                }
                const typeVariantOk = listTypeVariant.type;
                if (typeVariantOk === '()') {
                    return CairoResultVariant.Ok.toString();
                }
                const parsedParameter = parseCalldataValue(myResult.unwrap(), typeVariantOk, structs, enums);
                if (Array.isArray(parsedParameter)) {
                    return [CairoResultVariant.Ok.toString(), ...parsedParameter];
                }
                return [CairoResultVariant.Ok.toString(), parsedParameter];
            }
            // is Result::Err
            const listTypeVariant = variants.find((variant) => variant.name === 'Err');
            if (typeof listTypeVariant === 'undefined') {
                throw Error(`Error in abi : Result has no 'Err' variant.`);
            }
            const typeVariantErr = listTypeVariant.type;
            if (typeVariantErr === '()') {
                return CairoResultVariant.Err.toString();
            }
            const parsedParameter = parseCalldataValue(myResult.unwrap(), typeVariantErr, structs, enums);
            if (Array.isArray(parsedParameter)) {
                return [CairoResultVariant.Err.toString(), ...parsedParameter];
            }
            return [CairoResultVariant.Err.toString(), parsedParameter];
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
export function parseCalldataField(argsIterator, input, structs, enums) {
    const { name, type } = input;
    let { value } = argsIterator.next();
    switch (true) {
        // Array
        case isTypeArray(type):
            if (!Array.isArray(value) && !isText(value)) {
                throw Error(`ABI expected parameter ${name} to be array or long string, got ${value}`);
            }
            if (isString(value)) {
                // long string match cairo felt*
                value = splitLongString(value);
            }
            return parseCalldataValue(value, input.type, structs, enums);
        case type === 'core::starknet::eth_address::EthAddress':
            return parseBaseTypes(type, value);
        // Struct or Tuple
        case isTypeStruct(type, structs) ||
            isTypeTuple(type) ||
            CairoUint256.isAbiType(type) ||
            CairoUint256.isAbiType(type):
            return parseCalldataValue(value, type, structs, enums);
        // Enums
        case isTypeEnum(type, enums):
            return parseCalldataValue(value, type, structs, enums);
        // Felt or unhandled
        default:
            return parseBaseTypes(type, value);
    }
}
