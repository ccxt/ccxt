'use strict';

var calldata = require('../../types/calldata.js');
require('../../types/lib/index.js');
var assert = require('../assert.js');
var uint256 = require('../cairoDataTypes/uint256.js');
var uint512 = require('../cairoDataTypes/uint512.js');
var num = require('../num.js');
var shortString = require('../shortString.js');
var cairo = require('./cairo.js');

// ----------------------------------------------------------------------------
const validateFelt = (parameter, input) => {
    assert(shortString.isString(parameter) || num.isNumber(parameter) || num.isBigInt(parameter), `Validate: arg ${input.name} should be a felt typed as (String, Number or BigInt)`);
    if (shortString.isString(parameter) && !num.isHex(parameter))
        return; // shortstring
    const param = BigInt(parameter.toString(10));
    assert(
    // from : https://github.com/starkware-libs/starknet-specs/blob/29bab650be6b1847c92d4461d4c33008b5e50b1a/api/starknet_api_openrpc.json#L1266
    param >= 0n && param <= 2n ** 252n - 1n, `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 2^252-1]`);
};
const validateBytes31 = (parameter, input) => {
    assert(shortString.isString(parameter), `Validate: arg ${input.name} should be a string.`);
    assert(parameter.length < 32, `Validate: arg ${input.name} cairo typed ${input.type} should be a string of less than 32 characters.`);
};
const validateByteArray = (parameter, input) => {
    assert(shortString.isString(parameter), `Validate: arg ${input.name} should be a string.`);
};
const validateUint = (parameter, input) => {
    if (num.isNumber(parameter)) {
        assert(parameter <= Number.MAX_SAFE_INTEGER, `Validation: Parameter is to large to be typed as Number use (BigInt or String)`);
    }
    assert(shortString.isString(parameter) ||
        num.isNumber(parameter) ||
        num.isBigInt(parameter) ||
        (typeof parameter === 'object' && 'low' in parameter && 'high' in parameter) ||
        (typeof parameter === 'object' &&
            ['limb0', 'limb1', 'limb2', 'limb3'].every((key) => key in parameter)), `Validate: arg ${input.name} of cairo type ${input.type} should be type (String, Number or BigInt), but is ${typeof parameter} ${parameter}.`);
    let param;
    switch (input.type) {
        case calldata.Uint.u256:
            param = new uint256.CairoUint256(parameter).toBigInt();
            break;
        case calldata.Uint.u512:
            param = new uint512.CairoUint512(parameter).toBigInt();
            break;
        default:
            param = num.toBigInt(parameter);
    }
    switch (input.type) {
        case calldata.Uint.u8:
            assert(param >= 0n && param <= 255n, `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0 - 255]`);
            break;
        case calldata.Uint.u16:
            assert(param >= 0n && param <= 65535n, `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 65535]`);
            break;
        case calldata.Uint.u32:
            assert(param >= 0n && param <= 4294967295n, `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 4294967295]`);
            break;
        case calldata.Uint.u64:
            assert(param >= 0n && param <= 2n ** 64n - 1n, `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 2^64-1]`);
            break;
        case calldata.Uint.u128:
            assert(param >= 0n && param <= 2n ** 128n - 1n, `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 2^128-1]`);
            break;
        case calldata.Uint.u256:
            assert(param >= 0n && param <= 2n ** 256n - 1n, `Validate: arg ${input.name} is ${input.type} 0 - 2^256-1`);
            break;
        case calldata.Uint.u512:
            assert(uint512.CairoUint512.is(param), `Validate: arg ${input.name} is ${input.type} 0 - 2^512-1`);
            break;
        case calldata.Literal.ClassHash:
            assert(
            // from : https://github.com/starkware-libs/starknet-specs/blob/29bab650be6b1847c92d4461d4c33008b5e50b1a/api/starknet_api_openrpc.json#L1670
            param >= 0n && param <= 2n ** 252n - 1n, `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 2^252-1]`);
            break;
        case calldata.Literal.ContractAddress:
            assert(
            // from : https://github.com/starkware-libs/starknet-specs/blob/29bab650be6b1847c92d4461d4c33008b5e50b1a/api/starknet_api_openrpc.json#L1245
            param >= 0n && param <= 2n ** 252n - 1n, `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 2^252-1]`);
            break;
        case calldata.Literal.Secp256k1Point: {
            assert(param >= 0n && param <= 2n ** 512n - 1n, `Validate: arg ${input.name} must be ${input.type} : a 512 bits number.`);
            break;
        }
    }
};
const validateBool = (parameter, input) => {
    assert(num.isBoolean(parameter), `Validate: arg ${input.name} of cairo type ${input.type} should be type (Boolean)`);
};
const validateStruct = (parameter, input, structs) => {
    // c1v2 uint256 or u512 in struct
    if (input.type === calldata.Uint.u256 || input.type === calldata.Uint.u512) {
        validateUint(parameter, input);
        return;
    }
    if (input.type === 'core::starknet::eth_address::EthAddress') {
        assert(typeof parameter !== 'object', `EthAddress type is waiting a BigNumberish. Got ${parameter}`);
        const param = BigInt(parameter.toString(10));
        assert(
        // from : https://github.com/starkware-libs/starknet-specs/blob/29bab650be6b1847c92d4461d4c33008b5e50b1a/api/starknet_api_openrpc.json#L1259
        param >= 0n && param <= 2n ** 160n - 1n, `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 2^160-1]`);
        return;
    }
    assert(typeof parameter === 'object' && !Array.isArray(parameter), `Validate: arg ${input.name} is cairo type struct (${input.type}), and should be defined as js object (not array)`);
    // shallow struct validation, only first depth level
    structs[input.type].members.forEach(({ name }) => {
        assert(Object.keys(parameter).includes(name), `Validate: arg ${input.name} should have a property ${name}`);
    });
};
const validateEnum = (parameter, input) => {
    assert(typeof parameter === 'object' && !Array.isArray(parameter), `Validate: arg ${input.name} is cairo type Enum (${input.type}), and should be defined as js object (not array)`);
    const methodsKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(parameter));
    const keys = [...Object.getOwnPropertyNames(parameter), ...methodsKeys];
    if (cairo.isTypeOption(input.type) && keys.includes('isSome') && keys.includes('isNone')) {
        return; // Option Enum
    }
    if (cairo.isTypeResult(input.type) && keys.includes('isOk') && keys.includes('isErr')) {
        return; // Result Enum
    }
    if (keys.includes('variant') && keys.includes('activeVariant')) {
        return; // Custom Enum
    }
    throw new Error(`Validate Enum: argument ${input.name}, type ${input.type}, value received ${parameter}, is not an Enum.`);
};
const validateTuple = (parameter, input) => {
    assert(typeof parameter === 'object' && !Array.isArray(parameter), `Validate: arg ${input.name} should be a tuple (defined as object)`);
    // todo: skip tuple structural validation for now
};
const validateArray = (parameter, input, structs, enums) => {
    const baseType = cairo.getArrayType(input.type);
    // Long text (special case when parameter is not an array but long text)
    if (cairo.isTypeFelt(baseType) && shortString.isLongText(parameter)) {
        return;
    }
    assert(Array.isArray(parameter), `Validate: arg ${input.name} should be an Array`);
    switch (true) {
        case cairo.isTypeFelt(baseType):
            parameter.forEach((param) => validateFelt(param, input));
            break;
        case cairo.isTypeTuple(baseType):
            parameter.forEach((it) => validateTuple(it, { name: input.name, type: baseType }));
            break;
        case cairo.isTypeArray(baseType):
            parameter.forEach((param) => validateArray(param, { name: '', type: baseType }, structs, enums));
            break;
        case cairo.isTypeStruct(baseType, structs):
            parameter.forEach((it) => validateStruct(it, { name: input.name, type: baseType }, structs));
            break;
        case cairo.isTypeEnum(baseType, enums):
            parameter.forEach((it) => validateEnum(it, { name: input.name, type: baseType }));
            break;
        case cairo.isTypeUint(baseType) || cairo.isTypeLiteral(baseType):
            parameter.forEach((param) => validateUint(param, { name: '', type: baseType }));
            break;
        case cairo.isTypeBool(baseType):
            parameter.forEach((param) => validateBool(param, input));
            break;
        default:
            throw new Error(`Validate Unhandled: argument ${input.name}, type ${input.type}, value ${parameter}`);
    }
};
function validateFields(abiMethod, args, structs, enums) {
    abiMethod.inputs.reduce((acc, input) => {
        const parameter = args[acc];
        switch (true) {
            case cairo.isLen(input.name):
                return acc;
            case cairo.isTypeFelt(input.type):
                validateFelt(parameter, input);
                break;
            case cairo.isTypeBytes31(input.type):
                validateBytes31(parameter, input);
                break;
            case cairo.isTypeUint(input.type) || cairo.isTypeLiteral(input.type):
                validateUint(parameter, input);
                break;
            case cairo.isTypeBool(input.type):
                validateBool(parameter, input);
                break;
            case cairo.isTypeByteArray(input.type):
                validateByteArray(parameter, input);
                break;
            case cairo.isTypeArray(input.type):
                validateArray(parameter, input, structs, enums);
                break;
            case cairo.isTypeStruct(input.type, structs):
                validateStruct(parameter, input, structs);
                break;
            case cairo.isTypeEnum(input.type, enums):
                validateEnum(parameter, input);
                break;
            case cairo.isTypeTuple(input.type):
                validateTuple(parameter, input);
                break;
            default:
                throw new Error(`Validate Unhandled: argument ${input.name}, type ${input.type}, value ${parameter}`);
        }
        return acc + 1;
    }, 0);
}

module.exports = validateFields;
