export declare enum CairoResultVariant {
    Ok = 0,
    Err = 1
}
/**
 * Class to handle Cairo Result
 * @param variant CairoResultVariant.Ok or CairoResultVariant.Err
 * @param resultContent value of type T or U.
 * @returns an instance representing a Cairo Result.
 * @example
 * ```typescript
 * const myOption = new CairoResult<BigNumberish, CustomError>(CairoResultVariant.Ok, "0x54dda8");
 * ```
 */
export declare class CairoResult<T, U> {
    readonly Ok?: T;
    readonly Err?: U;
    constructor(variant: CairoResultVariant, resultContent: T | U);
    /**
     *
     * @returns the content of the valid variant of a Cairo Result.
     */
    unwrap(): T | U;
    /**
     *
     * @returns true if the valid variant is 'Ok'.
     */
    isOk(): boolean;
    /**
     *
     * @returns true if the valid variant is 'isErr'.
     */
    isErr(): boolean;
}
