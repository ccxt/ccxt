'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var calldata = require('../../types/calldata.js');
require('../../types/lib/index.js');
var felt$1 = require('../cairoDataTypes/felt.js');
var uint256$1 = require('../cairoDataTypes/uint256.js');
require('../cairoDataTypes/uint512.js');

// ----------------------------------------------------------------------------
// Intended for internal usage, maybe should be exported somewhere else and not exported to utils
/**
 * Checks if the given name ends with "_len".
 *
 * @param {string} name - The name to be checked.
 * @returns - True if the name ends with "_len", false otherwise.
 */
const isLen = (name) => /_len$/.test(name);
/**
 * Checks if a given type is felt.
 *
 * @param {string} type - The type to check.
 * @returns - True if the type is felt, false otherwise.
 */
const isTypeFelt = (type) => type === 'felt' || type === 'core::felt252';
/**
 * Checks if the given type is an array type.
 *
 * @param {string} type - The type to check.
 * @returns - `true` if the type is an array type, `false` otherwise.
 */
const isTypeArray = (type) => /\*/.test(type) ||
    type.startsWith('core::array::Array::') ||
    type.startsWith('core::array::Span::');
/**
 * Checks if the given type is a tuple type.
 *
 * @param {string} type - The type to be checked.
 * @returns - `true` if the type is a tuple type, otherwise `false`.
 */
const isTypeTuple = (type) => /^\(.*\)$/i.test(type);
/**
 * Checks whether a given type is a named tuple.
 *
 * @param {string} type - The type to be checked.
 * @returns - True if the type is a named tuple, false otherwise.
 */
const isTypeNamedTuple = (type) => /\(.*\)/i.test(type) && type.includes(':');
/**
 * Checks if a given type is a struct.
 *
 * @param {string} type - The type to check for existence.
 * @param {AbiStructs} structs - The collection of structs to search in.
 * @returns - True if the type exists in the structs, false otherwise.
 */
const isTypeStruct = (type, structs) => type in structs;
/**
 * Checks if a given type is an enum.
 *
 * @param {string} type - The type to check.
 * @param {AbiEnums} enums - The enumeration to search in.
 * @returns - True if the type exists in the enumeration, otherwise false.
 */
const isTypeEnum = (type, enums) => type in enums;
/**
 * Determines if the given type is an Option type.
 *
 * @param {string} type - The type to check.
 * @returns - True if the type is an Option type, false otherwise.
 */
const isTypeOption = (type) => type.startsWith('core::option::Option::');
/**
 * Checks whether a given type starts with 'core::result::Result::'.
 *
 * @param {string} type - The type to check.
 * @returns - True if the type starts with 'core::result::Result::', false otherwise.
 */
const isTypeResult = (type) => type.startsWith('core::result::Result::');
/**
 * Checks if the given value is a valid Uint type.
 *
 * @param {string} type - The value to check.
 * @returns - Returns true if the value is a valid Uint type, otherwise false.
 */
const isTypeUint = (type) => Object.values(calldata.Uint).includes(type);
/**
 * Checks if the given type is a literal type.
 *
 * @param {string} type - The type to check.
 * @returns - True if the type is a literal type, false otherwise.
 */
const isTypeLiteral = (type) => Object.values(calldata.Literal).includes(type);
/**
 * Checks if the given type is a boolean type.
 *
 * @param {string} type - The type to be checked.
 * @returns - Returns true if the type is a boolean type, otherwise false.
 */
const isTypeBool = (type) => type === 'core::bool';
/**
 * Determines if the given type is an Ethereum address type.
 *
 * @param {string} type - The type to check.
 * @returns - Returns true if the given type is 'core::starknet::eth_address::EthAddress', otherwise false.
 */
const isTypeEthAddress = (type) => type === 'core::starknet::eth_address::EthAddress';
/**
 * Checks if the given type is 'core::bytes_31::bytes31'.
 *
 * @param {string} type - The type to check.
 * @returns - True if the type is 'core::bytes_31::bytes31', false otherwise.
 */
const isTypeBytes31 = (type) => type === 'core::bytes_31::bytes31';
/**
 * Checks if the given type is equal to the 'core::byte_array::ByteArray'.
 *
 * @param {string} type - The type to check.
 * @returns - True if the given type is equal to 'core::byte_array::ByteArray', false otherwise.
 */
const isTypeByteArray = (type) => type === 'core::byte_array::byteArray.js';
const isTypeSecp256k1Point = (type) => type === 'core::starknet::secp256k1::Secp256k1Point';
const isCairo1Type = (type) => type.includes('::');
/**
 * Retrieves the array type from the given type string.
 *
 * @param {string} type - The type string.
 * @returns - The array type.
 */
const getArrayType = (type) => {
    if (isCairo1Type(type)) {
        return type.substring(type.indexOf('<') + 1, type.lastIndexOf('>'));
    }
    return type.replace('*', '');
};
/**
 * Test if an ABI comes from a Cairo 1 contract
 * @param abi representing the interface of a Cairo contract
 * @returns TRUE if it is an ABI from a Cairo1 contract
 * @example
 * ```typescript
 * const isCairo1: boolean = isCairo1Abi(myAbi: Abi);
 * ```
 */
function isCairo1Abi(abi) {
    const { cairo } = getAbiContractVersion(abi);
    if (cairo === undefined) {
        throw Error('Unable to determine Cairo version');
    }
    return cairo === '1';
}
/**
 * Return ContractVersion (Abi version) based on Abi
 * or undefined for unknown version
 * @param abi
 * @returns string
 */
function getAbiContractVersion(abi) {
    // determine by interface for "Cairo 1.2"
    if (abi.find((it) => it.type === 'interface')) {
        return { cairo: '1', compiler: '2' };
    }
    // determine by function io types "Cairo 1.1" or "Cairo 0.0"
    // find first function with inputs or outputs
    const testFunction = abi.find((it) => it.type === 'function' && (it.inputs.length || it.outputs.length));
    if (!testFunction) {
        return { cairo: undefined, compiler: undefined };
    }
    const io = testFunction.inputs.length ? testFunction.inputs : testFunction.outputs;
    if (isCairo1Type(io[0].type)) {
        return { cairo: '1', compiler: '1' };
    }
    return { cairo: '0', compiler: '0' };
}
/**
 * named tuple cairo type is described as js object {}
 * struct cairo type are described as js object {}
 * array cairo type are described as js array []
 */
/**
 * Create Uint256 Cairo type (helper for common struct type)
 * @example
 * ```typescript
 * uint256('892349863487563453485768723498');
 * ```
 */
const uint256 = (it) => {
    return new uint256$1.CairoUint256(it).toUint256DecimalString();
};
/**
 * Create felt Cairo type (cairo type helper)
 * @returns format: felt-string
 */
function felt(it) {
    return felt$1.CairoFelt(it);
}

exports.felt = felt;
exports.getAbiContractVersion = getAbiContractVersion;
exports.getArrayType = getArrayType;
exports.isCairo1Abi = isCairo1Abi;
exports.isCairo1Type = isCairo1Type;
exports.isLen = isLen;
exports.isTypeArray = isTypeArray;
exports.isTypeBool = isTypeBool;
exports.isTypeByteArray = isTypeByteArray;
exports.isTypeBytes31 = isTypeBytes31;
exports.isTypeEnum = isTypeEnum;
exports.isTypeEthAddress = isTypeEthAddress;
exports.isTypeFelt = isTypeFelt;
exports.isTypeLiteral = isTypeLiteral;
exports.isTypeNamedTuple = isTypeNamedTuple;
exports.isTypeOption = isTypeOption;
exports.isTypeResult = isTypeResult;
exports.isTypeSecp256k1Point = isTypeSecp256k1Point;
exports.isTypeStruct = isTypeStruct;
exports.isTypeTuple = isTypeTuple;
exports.isTypeUint = isTypeUint;
exports.uint256 = uint256;
