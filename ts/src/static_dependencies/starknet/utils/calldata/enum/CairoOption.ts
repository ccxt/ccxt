export enum CairoOptionVariant {
  Some = 0,
  None = 1,
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
export class CairoOption<T> {
  readonly Some?: T;

  readonly None?: boolean;

  constructor(variant: CairoOptionVariant, someContent?: T) {
    if (!(variant in CairoOptionVariant)) {
      throw new Error('Wrong variant : should be CairoOptionVariant.Some or .None.');
    }
    if (variant === CairoOptionVariant.Some) {
      if (typeof someContent === 'undefined') {
        throw new Error(
          'The creation of a Cairo Option with "Some" variant needs a content as input.'
        );
      }
      this.Some = someContent;
      this.None = undefined;
    } else {
      this.Some = undefined;
      this.None = true;
    }
  }

  /**
   *
   * @returns the content of the valid variant of a Cairo custom Enum.
   *  If None, returns 'undefined'.
   */
  public unwrap(): T | undefined {
    if (this.None) {
      return undefined;
    }
    return this.Some;
  }

  /**
   *
   * @returns true if the valid variant is 'isSome'.
   */
  public isSome(): boolean {
    return !(typeof this.Some === 'undefined');
  }

  /**
   *
   * @returns true if the valid variant is 'isNone'.
   */
  public isNone(): boolean {
    return this.None === true;
  }
}
