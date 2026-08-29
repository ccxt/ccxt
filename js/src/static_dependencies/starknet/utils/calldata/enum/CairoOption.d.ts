export declare enum CairoOptionVariant {
    Some = 0,
    None = 1
}
/**
 * Class to handle Cairo Option
 * @param variant CairoOptionVariant.Some or CairoOptionVariant.None
 * @param someContent value of type T.
 * @returns an instance representing a Cairo Option.
 * @example
 * ```typescript
 * const myOption = new CairoOption<BigNumberish>(CairoOptionVariant.Some, "0x54dda8");
 * ```
 */
export declare class CairoOption<T> {
    readonly Some?: T;
    readonly None?: boolean;
    constructor(variant: CairoOptionVariant, someContent?: T);
    /**
     *
     * @returns the content of the valid variant of a Cairo custom Enum.
     *  If None, returns 'undefined'.
     */
    unwrap(): T | undefined;
    /**
     *
     * @returns true if the valid variant is 'isSome'.
     */
    isSome(): boolean;
    /**
     *
     * @returns true if the valid variant is 'isNone'.
     */
    isNone(): boolean;
}
