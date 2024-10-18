export enum CairoResultVariant {
  Ok = 0,
  Err = 1,
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
export class CairoResult<T, U> {
  readonly Ok?: T;

  readonly Err?: U;

  constructor(variant: CairoResultVariant, resultContent: T | U) {
    if (!(variant in CairoResultVariant)) {
      throw new Error('Wrong variant : should be CairoResultVariant.Ok or .Err.');
    }
    if (variant === CairoResultVariant.Ok) {
      this.Ok = resultContent as T;
      this.Err = undefined;
    } else {
      this.Ok = undefined;
      this.Err = resultContent as U;
    }
  }

  /**
   *
   * @returns the content of the valid variant of a Cairo Result.
   */
  public unwrap(): T | U {
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
  public isOk(): boolean {
    return !(typeof this.Ok === 'undefined');
  }

  /**
   *
   * @returns true if the valid variant is 'isErr'.
   */
  public isErr(): boolean {
    return !(typeof this.Err === 'undefined');
  }
}
