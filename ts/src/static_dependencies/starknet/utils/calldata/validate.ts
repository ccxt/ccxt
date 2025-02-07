/**
 * Validate cairo contract method arguments
 * Flow: Determine type from abi and than validate against parameter
 */
import {
  AbiEntry,
  AbiEnums,
  AbiStructs,
  BigNumberish,
  FunctionAbi,
  Literal,
  Uint,
} from '../../types/index.js';
import assert from '../assert.js';
import { CairoUint256 } from '../cairoDataTypes/uint256.js';
import { CairoUint512 } from '../cairoDataTypes/uint512.js';
import { isBigInt, isBoolean, isHex, isNumber, toBigInt } from '../num.js';
import { isLongText, isString } from '../shortString.js';
import {
  getArrayType,
  isLen,
  isTypeArray,
  isTypeBool,
  isTypeByteArray,
  isTypeBytes31,
  isTypeEnum,
  isTypeFelt,
  isTypeLiteral,
  isTypeOption,
  isTypeResult,
  isTypeStruct,
  isTypeTuple,
  isTypeUint,
} from './cairo.js';

const validateFelt = (parameter: any, input: AbiEntry) => {
  assert(
    isString(parameter) || isNumber(parameter) || isBigInt(parameter),
    `Validate: arg ${input.name} should be a felt typed as (String, Number or BigInt)`
  );
  if (isString(parameter) && !isHex(parameter)) return; // shortstring
  const param = BigInt(parameter.toString(10));
  assert(
    // from : https://github.com/starkware-libs/starknet-specs/blob/29bab650be6b1847c92d4461d4c33008b5e50b1a/api/starknet_api_openrpc.json#L1266
    param >= 0n && param <= 2n ** 252n - 1n,
    `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 2^252-1]`
  );
};

const validateBytes31 = (parameter: any, input: AbiEntry) => {
  assert(isString(parameter), `Validate: arg ${input.name} should be a string.`);
  assert(
    parameter.length < 32,
    `Validate: arg ${input.name} cairo typed ${input.type} should be a string of less than 32 characters.`
  );
};

const validateByteArray = (parameter: any, input: AbiEntry) => {
  assert(isString(parameter), `Validate: arg ${input.name} should be a string.`);
};

const validateUint = (parameter: any, input: AbiEntry) => {
  if (isNumber(parameter)) {
    assert(
      parameter <= Number.MAX_SAFE_INTEGER,
      `Validation: Parameter is to large to be typed as Number use (BigInt or String)`
    );
  }
  assert(
    isString(parameter) ||
      isNumber(parameter) ||
      isBigInt(parameter) ||
      (typeof parameter === 'object' && 'low' in parameter && 'high' in parameter) ||
      (typeof parameter === 'object' &&
        ['limb0', 'limb1', 'limb2', 'limb3'].every((key) => key in parameter)),
    `Validate: arg ${input.name} of cairo type ${
      input.type
    } should be type (String, Number or BigInt), but is ${typeof parameter} ${parameter}.`
  );
  let param: bigint;
  switch (input.type) {
    case Uint.u256:
      param = new CairoUint256(parameter).toBigInt();
      break;
    case Uint.u512:
      param = new CairoUint512(parameter).toBigInt();
      break;
    default:
      param = toBigInt(parameter);
  }
  switch (input.type) {
    case Uint.u8:
      assert(
        param >= 0n && param <= 255n,
        `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0 - 255]`
      );
      break;

    case Uint.u16:
      assert(
        param >= 0n && param <= 65535n,
        `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 65535]`
      );
      break;

    case Uint.u32:
      assert(
        param >= 0n && param <= 4294967295n,
        `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 4294967295]`
      );
      break;

    case Uint.u64:
      assert(
        param >= 0n && param <= 2n ** 64n - 1n,
        `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 2^64-1]`
      );
      break;

    case Uint.u128:
      assert(
        param >= 0n && param <= 2n ** 128n - 1n,
        `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 2^128-1]`
      );
      break;

    case Uint.u256:
      assert(
        param >= 0n && param <= 2n ** 256n - 1n,
        `Validate: arg ${input.name} is ${input.type} 0 - 2^256-1`
      );
      break;

    case Uint.u512:
      assert(CairoUint512.is(param), `Validate: arg ${input.name} is ${input.type} 0 - 2^512-1`);
      break;

    case Literal.ClassHash:
      assert(
        // from : https://github.com/starkware-libs/starknet-specs/blob/29bab650be6b1847c92d4461d4c33008b5e50b1a/api/starknet_api_openrpc.json#L1670
        param >= 0n && param <= 2n ** 252n - 1n,
        `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 2^252-1]`
      );
      break;

    case Literal.ContractAddress:
      assert(
        // from : https://github.com/starkware-libs/starknet-specs/blob/29bab650be6b1847c92d4461d4c33008b5e50b1a/api/starknet_api_openrpc.json#L1245
        param >= 0n && param <= 2n ** 252n - 1n,
        `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 2^252-1]`
      );
      break;
    case Literal.Secp256k1Point: {
      assert(
        param >= 0n && param <= 2n ** 512n - 1n,
        `Validate: arg ${input.name} must be ${input.type} : a 512 bits number.`
      );
      break;
    }

    default:
      break;
  }
};

const validateBool = (parameter: any, input: AbiEntry) => {
  assert(
    isBoolean(parameter),
    `Validate: arg ${input.name} of cairo type ${input.type} should be type (Boolean)`
  );
};

const validateStruct = (parameter: any, input: AbiEntry, structs: AbiStructs) => {
  // c1v2 uint256 or u512 in struct
  if (input.type === Uint.u256 || input.type === Uint.u512) {
    validateUint(parameter, input);
    return;
  }

  if (input.type === 'core::starknet::eth_address::EthAddress') {
    assert(
      typeof parameter !== 'object',
      `EthAddress type is waiting a BigNumberish. Got ${parameter}`
    );
    const param = BigInt(parameter.toString(10));
    assert(
      // from : https://github.com/starkware-libs/starknet-specs/blob/29bab650be6b1847c92d4461d4c33008b5e50b1a/api/starknet_api_openrpc.json#L1259
      param >= 0n && param <= 2n ** 160n - 1n,
      `Validate: arg ${input.name} cairo typed ${input.type} should be in range [0, 2^160-1]`
    );
    return;
  }

  assert(
    typeof parameter === 'object' && !Array.isArray(parameter),
    `Validate: arg ${input.name} is cairo type struct (${input.type}), and should be defined as js object (not array)`
  );

  // shallow struct validation, only first depth level
  structs[input.type].members.forEach(({ name }) => {
    assert(
      Object.keys(parameter).includes(name),
      `Validate: arg ${input.name} should have a property ${name}`
    );
  });
};

const validateEnum = (parameter: any, input: AbiEntry) => {
  assert(
    typeof parameter === 'object' && !Array.isArray(parameter),
    `Validate: arg ${input.name} is cairo type Enum (${input.type}), and should be defined as js object (not array)`
  );
  const methodsKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(parameter));
  const keys = [...Object.getOwnPropertyNames(parameter), ...methodsKeys];
  if (isTypeOption(input.type) && keys.includes('isSome') && keys.includes('isNone')) {
    return; // Option Enum
  }
  if (isTypeResult(input.type) && keys.includes('isOk') && keys.includes('isErr')) {
    return; // Result Enum
  }
  if (keys.includes('variant') && keys.includes('activeVariant')) {
    return; // Custom Enum
  }
  throw new Error(
    `Validate Enum: argument ${input.name}, type ${input.type}, value received ${parameter}, is not an Enum.`
  );
};

const validateTuple = (parameter: any, input: AbiEntry) => {
  assert(
    typeof parameter === 'object' && !Array.isArray(parameter),
    `Validate: arg ${input.name} should be a tuple (defined as object)`
  );
  // todo: skip tuple structural validation for now
};

const validateArray = (parameter: any, input: AbiEntry, structs: AbiStructs, enums: AbiEnums) => {
  const baseType = getArrayType(input.type);
  // Long text (special case when parameter is not an array but long text)
  if (isTypeFelt(baseType) && isLongText(parameter)) {
    return;
  }

  assert(Array.isArray(parameter), `Validate: arg ${input.name} should be an Array`);

  switch (true) {
    case isTypeFelt(baseType):
      parameter.forEach((param: BigNumberish) => validateFelt(param, input));
      break;
    case isTypeTuple(baseType):
      parameter.forEach((it: any) => validateTuple(it, { name: input.name, type: baseType }));
      break;

    case isTypeArray(baseType):
      parameter.forEach((param: BigNumberish) =>
        validateArray(param, { name: '', type: baseType }, structs, enums)
      );
      break;
    case isTypeStruct(baseType, structs):
      parameter.forEach((it: any) =>
        validateStruct(it, { name: input.name, type: baseType }, structs)
      );
      break;
    case isTypeEnum(baseType, enums):
      parameter.forEach((it: any) => validateEnum(it, { name: input.name, type: baseType }));
      break;
    case isTypeUint(baseType) || isTypeLiteral(baseType):
      parameter.forEach((param: BigNumberish) => validateUint(param, { name: '', type: baseType }));
      break;
    case isTypeBool(baseType):
      parameter.forEach((param: BigNumberish) => validateBool(param, input));
      break;
    default:
      throw new Error(
        `Validate Unhandled: argument ${input.name}, type ${input.type}, value ${parameter}`
      );
  }
};

export default function validateFields(
  abiMethod: FunctionAbi,
  args: Array<any>,
  structs: AbiStructs,
  enums: AbiEnums
) {
  abiMethod.inputs.reduce((acc, input) => {
    const parameter = args[acc];

    switch (true) {
      case isLen(input.name):
        return acc;
      case isTypeFelt(input.type):
        validateFelt(parameter, input);
        break;
      case isTypeBytes31(input.type):
        validateBytes31(parameter, input);
        break;
      case isTypeUint(input.type) || isTypeLiteral(input.type):
        validateUint(parameter, input);
        break;
      case isTypeBool(input.type):
        validateBool(parameter, input);
        break;
      case isTypeByteArray(input.type):
        validateByteArray(parameter, input);
        break;
      case isTypeArray(input.type):
        validateArray(parameter, input, structs, enums);
        break;
      case isTypeStruct(input.type, structs):
        validateStruct(parameter, input, structs);
        break;
      case isTypeEnum(input.type, enums):
        validateEnum(parameter, input);
        break;
      case isTypeTuple(input.type):
        validateTuple(parameter, input);
        break;
      default:
        throw new Error(
          `Validate Unhandled: argument ${input.name}, type ${input.type}, value ${parameter}`
        );
    }

    return acc + 1;
  }, 0);
}
