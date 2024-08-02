'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

exports.CairoResultVariant = void 0;
(function (CairoResultVariant) {
    CairoResultVariant[CairoResultVariant["Ok"] = 0] = "Ok";
    CairoResultVariant[CairoResultVariant["Err"] = 1] = "Err";
})(exports.CairoResultVariant || (exports.CairoResultVariant = {}));
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
class CairoResult {
    constructor(variant, resultContent) {
        if (!(variant in exports.CairoResultVariant)) {
            throw new Error('Wrong variant : should be CairoResultVariant.Ok or .Err.');
        }
        if (variant === exports.CairoResultVariant.Ok) {
            this.Ok = resultContent;
            this.Err = undefined;
        }
        else {
            this.Ok = undefined;
            this.Err = resultContent;
        }
    }
    /**
     *
     * @returns the content of the valid variant of a Cairo Result.
     */
    unwrap() {
        if (typeof this.Ok !== 'undefined') {
            return this.Ok;
        }
        if (typeof this.Err !== 'undefined') {
            return this.Err;
        }
        throw new Error('Both Result.Ok and .Err are undefined. Not authorized.');
    }
    /**
     *
     * @returns true if the valid variant is 'Ok'.
     */
    isOk() {
        return !(typeof this.Ok === 'undefined');
    }
    /**
     *
     * @returns true if the valid variant is 'isErr'.
     */
    isErr() {
        return !(typeof this.Err === 'undefined');
    }
}

exports.CairoResult = CairoResult;
