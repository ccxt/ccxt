export declare type CairoEnumRaw = {
    [key: string]: any;
};
/**
 * Class to handle Cairo custom Enum
 * @param enumContent object containing the variants and its content. Example :
 *  {Success: 234, Warning: undefined, Error: undefined}.
 *  Only one variant with a value, object, array.
 * @returns an instance representing a Cairo custom Enum.
 * @example
 * ```typescript
 * const myCairoEnum = new CairoCustomEnum( {Success: undefined, Warning: "0x7f32ea", Error: undefined})
 * ```
 */
export declare class CairoCustomEnum {
    /**
     * direct readonly access to variants of the Cairo Custom Enum.
     * @returns a value of type any
     * @example
     * ```typescript
     * const successValue = myCairoEnum.variant.Success;
     */
    readonly variant: CairoEnumRaw;
    /**
     * @param enumContent an object with the variants as keys and the content as value. Only one content shall be defined.
     */
    constructor(enumContent: CairoEnumRaw);
    /**
     *
     * @returns the content of the valid variant of a Cairo custom Enum.
     */
    unwrap(): any;
    /**
     *
     * @returns the name of the valid variant of a Cairo custom Enum.
     */
    activeVariant(): string;
}
