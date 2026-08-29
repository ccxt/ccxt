/**
 * Singular class handling cairo u256 data type
 */
import { BigNumberish, Uint256 } from '../../types/index.js';
export declare const UINT_128_MAX: bigint;
export declare const UINT_256_MAX: bigint;
export declare const UINT_256_MIN = 0n;
export declare const UINT_256_LOW_MAX = 340282366920938463463374607431768211455n;
export declare const UINT_256_HIGH_MAX = 340282366920938463463374607431768211455n;
export declare const UINT_256_LOW_MIN = 0n;
export declare const UINT_256_HIGH_MIN = 0n;
export declare class CairoUint256 {
    low: bigint;
    high: bigint;
    static abiSelector: string;
    /**
     * Default constructor (Lib usage)
     * @param bigNumberish BigNumberish value representing uin256
     */
    constructor(bigNumberish: BigNumberish);
    /**
     * Direct props initialization (Api response)
     */
    constructor(low: BigNumberish, high: BigNumberish);
    /**
     * Initialization from Uint256 object
     */
    constructor(uint256: Uint256);
    /**
     * Validate if BigNumberish can be represented as Unit256
     */
    static validate(bigNumberish: BigNumberish): bigint;
    /**
     * Validate if low and high can be represented as Unit256
     */
    static validateProps(low: BigNumberish, high: BigNumberish): {
        low: bigint;
        high: bigint;
    };
    /**
     * Check if BigNumberish can be represented as Unit256
     */
    static is(bigNumberish: BigNumberish): boolean;
    /**
     * Check if provided abi type is this data type
     */
    static isAbiType(abiType: string): boolean;
    /**
     * Return bigint representation
     */
    toBigInt(): bigint;
    /**
     * Return Uint256 structure with HexString props
     * {low: HexString, high: HexString}
     */
    toUint256HexString(): {
        low: string;
        high: string;
    };
    /**
     * Return Uint256 structure with DecimalString props
     * {low: DecString, high: DecString}
     */
    toUint256DecimalString(): {
        low: string;
        high: string;
    };
    /**
     * Return api requests representation witch is felt array
     */
    toApiRequest(): string[];
}
