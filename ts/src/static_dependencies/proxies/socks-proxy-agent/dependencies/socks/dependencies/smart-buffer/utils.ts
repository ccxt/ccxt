import { SmartBuffer } from './smartbuffer.js';
// @ts-ignore
import { Buffer } from 'buffer';

/**
 * Error strings
 */
const ERRORS = {
  INVALID_ENCODING: 'Invalid encoding provided. Please specify a valid encoding the internal Node.js Buffer supports.',
  INVALID_SMARTBUFFER_SIZE: 'Invalid size provided. Size must be a valid integer greater than zero.',
  INVALID_SMARTBUFFER_BUFFER: 'Invalid Buffer provided in SmartBufferOptions.',
  INVALID_SMARTBUFFER_OBJECT: 'Invalid SmartBufferOptions object supplied to SmartBuffer constructor or factory methods.',
  INVALID_OFFSET: 'An invalid offset value was provided.',
  INVALID_OFFSET_NON_NUMBER: 'An invalid offset value was provided. A numeric value is required.',
  INVALID_LENGTH: 'An invalid length value was provided.',
  INVALID_LENGTH_NON_NUMBER: 'An invalid length value was provived. A numeric value is required.',
  INVALID_TARGET_OFFSET: 'Target offset is beyond the bounds of the internal SmartBuffer data.',
  INVALID_TARGET_LENGTH: 'Specified length value moves cursor beyong the bounds of the internal SmartBuffer data.',
  INVALID_READ_BEYOND_BOUNDS: 'Attempted to read beyond the bounds of the managed data.',
  INVALID_WRITE_BEYOND_BOUNDS: 'Attempted to write beyond the bounds of the managed data.'
};

/**
 * Checks if a given encoding is a valid Buffer encoding. (Throws an exception if check fails)
 *
 * @param { String } encoding The encoding string to check.
 */
function checkEncoding(encoding: BufferEncoding) {
  if (!Buffer.isEncoding(encoding)) {
    throw new Error(ERRORS.INVALID_ENCODING);
  }
}

/**
 * Checks if a given number is a finite integer. (Throws an exception if check fails)
 *
 * @param { Number } value The number value to check.
 */
function isFiniteInteger(value: number): boolean {
  return typeof value === 'number' && isFinite(value) && isInteger(value);
}

/**
 * Checks if an offset/length value is valid. (Throws an exception if check fails)
 *
 * @param value The value to check.
 * @param offset True if checking an offset, false if checking a length.
 */
function checkOffsetOrLengthValue(value: any, offset: boolean) {
  if (typeof value === 'number') {
    // Check for non finite/non integers
    if (!isFiniteInteger(value) || value < 0) {
      throw new Error(offset ? ERRORS.INVALID_OFFSET : ERRORS.INVALID_LENGTH);
    }
  } else {
    throw new Error(offset ? ERRORS.INVALID_OFFSET_NON_NUMBER : ERRORS.INVALID_LENGTH_NON_NUMBER);
  }
}

/**
 * Checks if a length value is valid. (Throws an exception if check fails)
 *
 * @param { Number } length The value to check.
 */
function checkLengthValue(length: any) {
  checkOffsetOrLengthValue(length, false);
}

/**
 * Checks if a offset value is valid. (Throws an exception if check fails)
 *
 * @param { Number } offset The value to check.
 */
function checkOffsetValue(offset: any) {
  checkOffsetOrLengthValue(offset, true);
}

/**
 * Checks if a target offset value is out of bounds. (Throws an exception if check fails)
 *
 * @param { Number } offset The offset value to check.
 * @param { SmartBuffer } buff The SmartBuffer instance to check against.
 */
function checkTargetOffset(offset: number, buff: SmartBuffer) {
  if (offset < 0 || offset > buff.length) {
    throw new Error(ERRORS.INVALID_TARGET_OFFSET);
  }
}

/**
 * Determines whether a given number is a integer.
 * @param value The number to check.
 */
function isInteger(value: number) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

interface Buffer {
  readBigInt64BE(offset?: number): bigint;
  readBigInt64LE(offset?: number): bigint;
  readBigUInt64BE(offset?: number): bigint;
  readBigUInt64LE(offset?: number): bigint;

  writeBigInt64BE(value: bigint, offset?: number): number;
  writeBigInt64LE(value: bigint, offset?: number): number;
  writeBigUInt64BE(value: bigint, offset?: number): number;
  writeBigUInt64LE(value: bigint, offset?: number): number;
}

/**
 * Throws if Node.js version is too low to support bigint
 */
function bigIntAndBufferInt64Check(bufferMethod: keyof Buffer) {
  if (typeof BigInt === 'undefined') {
    throw new Error('Platform does not support JS BigInt type.');
  }

  if (typeof Buffer.prototype[bufferMethod] === 'undefined') {
    throw new Error(`Platform does not support Buffer.prototype.${bufferMethod}.`);
  }
}

export {
  ERRORS, isFiniteInteger, checkEncoding, checkOffsetValue,
  checkLengthValue, checkTargetOffset, bigIntAndBufferInt64Check
};
