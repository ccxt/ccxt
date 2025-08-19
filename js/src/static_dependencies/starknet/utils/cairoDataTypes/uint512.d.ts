/**
 * Singular class handling cairo u512 data type
 */
import { BigNumberish, type Uint512 } from '../../types/index.js';
export declare const UINT_512_MAX: bigint;
export declare const UINT_512_MIN = 0n;
export declare const UINT_128_MIN = 0n;
export declare class CairoUint512 {
    limb0: bigint;
    limb1: bigint;
    limb2: bigint;
    limb3: bigint;
    static abiSelector: string;
    /**
     * Default constructor (Lib usage)
     * @param bigNumberish BigNumberish value representing u512
     */
    constructor(bigNumberish: BigNumberish);
    /**
     * Direct props initialization (Api response)
     */
    constructor(limb0: BigNumberish, limb1: BigNumberish, limb2: BigNumberish, limb3: BigNumberish);
    /**
     * Initialization from Uint512 object
     */
    constructor(uint512: Uint512);
    /**
     * Validate if BigNumberish can be represented as Uint512
     */
    static validate(bigNumberish: BigNumberish): bigint;
    /**
     * Validate if limbs can be represented as Uint512
     */
    static validateProps(limb0: BigNumberish, limb1: BigNumberish, limb2: BigNumberish, limb3: BigNumberish): {
        limb0: bigint;
        limb1: bigint;
        limb2: bigint;
        limb3: bigint;
    };
    /**
     * Check if BigNumberish can be represented as Uint512
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
     * Return Uint512 structure with HexString props
     * limbx: HexString
     */
    toUint512HexString(): {
        limb0: string;
        limb1: string;
        limb2: string;
        limb3: string;
    };
    /**
     * Return Uint512 structure with DecimalString props
     * limbx DecString
     */
    toUint512DecimalString(): {
        limb0: string;
        limb1: string;
        limb2: string;
        limb3: string;
    };
    /**
     * Return api requests representation witch is felt array
     */
    toApiRequest(): string[];
}
