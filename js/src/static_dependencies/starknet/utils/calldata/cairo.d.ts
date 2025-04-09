import { Abi, AbiEnums, AbiStructs, BigNumberish, ContractVersion, Uint256, Uint512 } from '../../types/index.js';
/**
 * Checks if the given name ends with "_len".
 *
 * @param {string} name - The name to be checked.
 * @returns - True if the name ends with "_len", false otherwise.
 */
export declare const isLen: (name: string) => boolean;
/**
 * Checks if a given type is felt.
 *
 * @param {string} type - The type to check.
 * @returns - True if the type is felt, false otherwise.
 */
export declare const isTypeFelt: (type: string) => boolean;
/**
 * Checks if the given type is an array type.
 *
 * @param {string} type - The type to check.
 * @returns - `true` if the type is an array type, `false` otherwise.
 */
export declare const isTypeArray: (type: string) => boolean;
/**
 * Checks if the given type is a tuple type.
 *
 * @param {string} type - The type to be checked.
 * @returns - `true` if the type is a tuple type, otherwise `false`.
 */
export declare const isTypeTuple: (type: string) => boolean;
/**
 * Checks whether a given type is a named tuple.
 *
 * @param {string} type - The type to be checked.
 * @returns - True if the type is a named tuple, false otherwise.
 */
export declare const isTypeNamedTuple: (type: string) => boolean;
/**
 * Checks if a given type is a struct.
 *
 * @param {string} type - The type to check for existence.
 * @param {AbiStructs} structs - The collection of structs to search in.
 * @returns - True if the type exists in the structs, false otherwise.
 */
export declare const isTypeStruct: (type: string, structs: AbiStructs) => boolean;
/**
 * Checks if a given type is an enum.
 *
 * @param {string} type - The type to check.
 * @param {AbiEnums} enums - The enumeration to search in.
 * @returns - True if the type exists in the enumeration, otherwise false.
 */
export declare const isTypeEnum: (type: string, enums: AbiEnums) => boolean;
/**
 * Determines if the given type is an Option type.
 *
 * @param {string} type - The type to check.
 * @returns - True if the type is an Option type, false otherwise.
 */
export declare const isTypeOption: (type: string) => boolean;
/**
 * Checks whether a given type starts with 'core::result::Result::'.
 *
 * @param {string} type - The type to check.
 * @returns - True if the type starts with 'core::result::Result::', false otherwise.
 */
export declare const isTypeResult: (type: string) => boolean;
/**
 * Checks if the given value is a valid Uint type.
 *
 * @param {string} type - The value to check.
 * @returns - Returns true if the value is a valid Uint type, otherwise false.
 */
export declare const isTypeUint: (type: string) => boolean;
/**
 * Checks if the given type is `uint256`.
 *
 * @param {string} type - The type to be checked.
 * @returns - Returns true if the type is `uint256`, otherwise false.
 */
export declare const isTypeUint256: (type: string) => boolean;
/**
 * Checks if the given type is a literal type.
 *
 * @param {string} type - The type to check.
 * @returns - True if the type is a literal type, false otherwise.
 */
export declare const isTypeLiteral: (type: string) => boolean;
/**
 * Checks if the given type is a boolean type.
 *
 * @param {string} type - The type to be checked.
 * @returns - Returns true if the type is a boolean type, otherwise false.
 */
export declare const isTypeBool: (type: string) => boolean;
/**
 * Checks if the provided type is equal to 'core::starknet::contract_address::ContractAddress'.
 * @param {string} type - The type to be checked.
 * @returns - true if the type matches 'core::starknet::contract_address::ContractAddress', false otherwise.
 */
export declare const isTypeContractAddress: (type: string) => boolean;
/**
 * Determines if the given type is an Ethereum address type.
 *
 * @param {string} type - The type to check.
 * @returns - Returns true if the given type is 'core::starknet::eth_address::EthAddress', otherwise false.
 */
export declare const isTypeEthAddress: (type: string) => boolean;
/**
 * Checks if the given type is 'core::bytes_31::bytes31'.
 *
 * @param {string} type - The type to check.
 * @returns - True if the type is 'core::bytes_31::bytes31', false otherwise.
 */
export declare const isTypeBytes31: (type: string) => boolean;
/**
 * Checks if the given type is equal to the 'core::byte_array::ByteArray'.
 *
 * @param {string} type - The type to check.
 * @returns - True if the given type is equal to 'core::byte_array::ByteArray', false otherwise.
 */
export declare const isTypeByteArray: (type: string) => boolean;
export declare const isTypeSecp256k1Point: (type: string) => boolean;
export declare const isCairo1Type: (type: string) => boolean;
/**
 * Retrieves the array type from the given type string.
 *
 * @param {string} type - The type string.
 * @returns - The array type.
 */
export declare const getArrayType: (type: string) => string;
/**
 * Test if an ABI comes from a Cairo 1 contract
 * @param abi representing the interface of a Cairo contract
 * @returns TRUE if it is an ABI from a Cairo1 contract
 * @example
 * ```typescript
 * const isCairo1: boolean = isCairo1Abi(myAbi: Abi);
 * ```
 */
export declare function isCairo1Abi(abi: Abi): boolean;
/**
 * Return ContractVersion (Abi version) based on Abi
 * or undefined for unknown version
 * @param abi
 * @returns string
 */
export declare function getAbiContractVersion(abi: Abi): ContractVersion;
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
export declare const uint256: (it: BigNumberish) => Uint256;
/**
 * Create Uint512 Cairo type (helper for common struct type)
 * @param it BigNumberish representation of a 512 bits unsigned number
 * @returns Uint512 struct
 * @example
 * ```typescript
 * uint512('345745685892349863487563453485768723498');
 * ```
 */
export declare const uint512: (it: BigNumberish) => Uint512;
/**
 * Create unnamed tuple Cairo type (helper same as common struct type)
 * @example
 * ```typescript
 * tuple(1, '0x101', 16);
 * ```
 */
export declare const tuple: (...args: (BigNumberish | object | boolean)[]) => Record<number, BigNumberish | object | boolean>;
/**
 * Create felt Cairo type (cairo type helper)
 * @returns format: felt-string
 */
export declare function felt(it: BigNumberish): string;
