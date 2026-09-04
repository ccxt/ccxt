/**
 *  There are many simple utilities required to interact with
 *  Ethereum and to simplify the library, without increasing
 *  the library dependencies for simple functions.
 *
 *  @_section api/utils:Utilities  [about-utils]
 */
import { getBytes, getBytesCopy, isHexString, isBytesLike, hexlify, concat, dataLength, dataSlice, stripZerosLeft, zeroPadValue, zeroPadBytes } from "./data.js";
export { getBytes, getBytesCopy, isHexString, isBytesLike, hexlify, concat, dataLength, dataSlice, stripZerosLeft, zeroPadValue, zeroPadBytes };
export { isCallException, isError, assert, assertArgument, assertArgumentCount, assertPrivate, assertNormalize, makeError } from "./errors.js";
export { fromTwos, toTwos, mask, getBigInt, getNumber, getUint, toBigInt, toNumber, toBeHex, toBeArray, toQuantity } from "./maths.js";
export { resolveProperties, defineProperties } from "./properties.js";
export { toUtf8Bytes, toUtf8CodePoints, toUtf8String, Utf8ErrorFuncs, } from "./utf8.js";
export type { BytesLike } from "./data.js";
export type { ErrorCode, EthersError, UnknownError, NotImplementedError, UnsupportedOperationError, NetworkError, ServerError, TimeoutError, BadDataError, CancelledError, BufferOverrunError, NumericFaultError, InvalidArgumentError, MissingArgumentError, UnexpectedArgumentError, CallExceptionError, InsufficientFundsError, NonceExpiredError, OffchainFaultError, ReplacementUnderpricedError, TransactionReplacedError, UnconfiguredNameError, ActionRejectedError, CallExceptionAction, CallExceptionTransaction, CodedEthersError } from "./errors.js";
export type { BigNumberish, Numeric } from "./maths.js";
export type { Utf8ErrorFunc, UnicodeNormalizationForm, Utf8ErrorReason } from "./utf8.js";
export declare function id(value: any): string;
export declare function keccak256(value: any): string;
export declare function sha256(value: any): string;
