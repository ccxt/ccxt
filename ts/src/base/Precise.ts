import { Str, Int } from './types.js';

const zero = BigInt (0);
const minusOne = BigInt (-1);
const base = BigInt (10);
// static bounded lookup table for 10^n, n in [0, 64] — order-independent,
// never invalidated, uniform O(1) cost for any input (falls back to
// exponentiation for exponents beyond the table)
const powersOfTen: bigint[] = [ BigInt (1) ];
for (let i = 1; i <= 64; i++) {
    powersOfTen.push (powersOfTen[ i - 1 ] * base);
}

/**
 * @description returns 10 raised to the given non-negative exponent, from a static bounded lookup table with an exponentiation fallback past its end
 * @param {number} exponent non-negative integer exponent
 * @returns {bigint} 10 raised to the exponent
 */
function powerOfTen (exponent: number): bigint {
    return (exponent < powersOfTen.length) ? powersOfTen[exponent] : base ** BigInt (exponent);
}
class Precise {
    decimals: number;

    integer: bigint;

    base = undefined;

    constructor (number: bigint | string, decimals: Int = undefined) {
        if (decimals === undefined) {
            let modifier = 0;
            number = (number as string).toLowerCase ();
            if (number.indexOf ('e') > -1) {
                let modifierString = '0';
                [ number, modifierString ] = number.split ('e');
                modifier = parseInt (modifierString);
            }
            const decimalIndex = number.indexOf ('.');
            if (decimalIndex > -1) {
                this.decimals = number.length - decimalIndex - 1;
                this.integer = BigInt (number.slice (0, decimalIndex) + number.slice (decimalIndex + 1));
            } else {
                this.decimals = 0;
                this.integer = BigInt (number);
            }
            this.decimals = this.decimals - modifier;
        } else {
            this.integer = number as bigint;
            this.decimals = decimals;
        }
    }

    mul (other: Precise) {
        // other must be another instance of Precise
        const integerResult = this.integer * other.integer;
        return new Precise (integerResult, this.decimals + other.decimals);
    }

    div (other: Precise, precision = 18) {
        const distance = precision - this.decimals + other.decimals;
        let numerator: bigint;
        if (distance === 0) {
            numerator = this.integer;
        } else if (distance < 0) {
            numerator = this.integer / powerOfTen (-distance);
        } else {
            numerator = this.integer * powerOfTen (distance);
        }
        const result = numerator / other.integer;
        return new Precise (result, precision);
    }

    add (other: Precise) {
        if (this.decimals === other.decimals) {
            const integerResult = this.integer + other.integer;
            return new Precise (integerResult, this.decimals);
        }
        const diff = this.decimals - other.decimals;
        if (diff > 0) {
            const scaledOther = other.integer * powerOfTen (diff);
            return new Precise (scaledOther + this.integer, this.decimals);
        }
        const scaledThis = this.integer * powerOfTen (-diff);
        return new Precise (scaledThis + other.integer, other.decimals);
    }

    mod (other: Precise) {
        const rationizerNumerator = Math.max (-this.decimals + other.decimals, 0);
        const numerator = this.integer * powerOfTen (rationizerNumerator);
        const rationizerDenominator = Math.max (-other.decimals + this.decimals, 0);
        const denominator = other.integer * powerOfTen (rationizerDenominator);
        const result = numerator % denominator;
        return new Precise (result, rationizerDenominator + other.decimals);
    }

    sub (other: Precise) {
        if (this.decimals === other.decimals) {
            return new Precise (this.integer - other.integer, this.decimals);
        }
        // inline of add (this, neg (other)) without the intermediate instance
        const thisIsBigger = this.decimals > other.decimals;
        const smallerInteger = thisIsBigger ? other.integer : this.integer;
        const biggerInteger = thisIsBigger ? this.integer : other.integer;
        const biggerDecimals = thisIsBigger ? this.decimals : other.decimals;
        const smallerDecimals = thisIsBigger ? other.decimals : this.decimals;
        const normalised = smallerInteger * powerOfTen (biggerDecimals - smallerDecimals);
        const result = thisIsBigger ? (biggerInteger - normalised) : (normalised - biggerInteger);
        return new Precise (result, biggerDecimals);
    }

    abs () {
        return new Precise (this.integer < 0 ? this.integer * minusOne : this.integer, this.decimals);
    }

    neg () {
        return new Precise (-this.integer, this.decimals);
    }

    or (other: Precise) {
        const integerResult = this.integer | other.integer;
        return new Precise (integerResult, this.decimals);
    }

    min (other: Precise) {
        return this.lt (other) ? this : other;
    }

    max (other: Precise) {
        return this.gt (other) ? this : other;
    }

    // aligned comparison without intermediate instance allocation:
    // aligns the operand with fewer decimals by multiplying its integer
    // by 10^difference, then compares the scaled integers
    compare (other: Precise): number {
        if (this.decimals === other.decimals) {
            if (this.integer === other.integer) {
                return 0;
            }
            return (this.integer < other.integer) ? -1 : 1;
        }
        const diff = this.decimals - other.decimals;
        if (diff > 0) {
            const scaledOther = other.integer * powerOfTen (diff);
            if (this.integer === scaledOther) {
                return 0;
            }
            return (this.integer < scaledOther) ? -1 : 1;
        }
        const scaledThis = this.integer * powerOfTen (-diff);
        if (scaledThis === other.integer) {
            return 0;
        }
        return (scaledThis < other.integer) ? -1 : 1;
    }

    gt (other: Precise) {
        return this.compare (other) > 0;
    }

    ge (other: Precise) {
        return this.compare (other) >= 0;
    }

    lt (other: Precise) {
        return this.compare (other) < 0;
    }

    le (other: Precise) {
        return this.compare (other) <= 0;
    }

    // strips trailing zero digits from the integer representation and
    // returns the reduced digit string (sign included) so callers that
    // immediately stringify avoid a second integer-to-string conversion
    reduce () {
        const string = this.integer.toString ();
        const start = string.length - 1;
        if (start === 0) {
            if (string === '0') {
                this.decimals = 0;
            }
            return string;
        }
        let i;
        for (i = start; i >= 0; i--) {
            if (string.charCodeAt (i) !== 48) {
                break;
            }
        }
        const difference = start - i;
        if (difference === 0) {
            return string;
        }
        this.decimals -= difference;
        const reduced = string.slice (0, i + 1);
        this.integer = BigInt (reduced);
        return reduced;
    }

    equals (other: any) {
        this.reduce ();
        other.reduce ();
        return (this.decimals === other.decimals) && (this.integer === other.integer);
    }

    toString () {
        let digits = this.reduce ();
        let sign = '';
        if (digits.charCodeAt (0) === 45) { // '-'
            sign = '-';
            digits = digits.slice (1);
        }
        const decimals = this.decimals;
        if (decimals <= 0) {
            return sign + digits + '0'.repeat (-decimals);
        }
        if (digits.length <= decimals) {
            return sign + '0.' + digits.padStart (decimals, '0');
        }
        const index = digits.length - decimals;
        return sign + digits.slice (0, index) + '.' + digits.slice (index);
    }

    static stringMul (string1: Str, string2: Str) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined;
        }
        return (new Precise (string1)).mul (new Precise (string2)).toString ();
    }

    static stringDiv (string1: Str, string2: Str, precision = 18) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined;
        }
        const string2Precise = new Precise (string2);
        if (string2Precise.integer === zero) {
            return undefined;
        }
        return (new Precise (string1)).div (string2Precise, precision).toString ();
    }

    static stringAdd (string1: Str, string2: Str) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined;
        }
        return (new Precise (string1)).add (new Precise (string2)).toString ();
    }

    static stringSub (string1: Str, string2: Str) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined;
        }
        return (new Precise (string1)).sub (new Precise (string2)).toString ();
    }

    static stringAbs (string: Str) {
        if (string === undefined) {
            return undefined;
        }
        return (new Precise (string)).abs ().toString ();
    }

    static stringNeg (string: Str) {
        if (string === undefined) {
            return undefined;
        }
        return (new Precise (string)).neg ().toString ();
    }

    static stringMod (string1: Str, string2: Str) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined;
        }
        return (new Precise (string1)).mod (new Precise (string2)).toString ();
    }

    static stringOr (string1: Str, string2: Str) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined;
        }
        return (new Precise (string1)).or (new Precise (string2)).toString ();
    }

    static stringEquals (string1: Str, string2: Str) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return false;
        }
        return (new Precise (string1)).equals (new Precise (string2));
    }

    static stringEq (string1: Str, string2: Str) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return false;
        }
        return (new Precise (string1)).equals (new Precise (string2));
    }

    static stringMin (string1: Str, string2: Str) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined;
        }
        return (new Precise (string1)).min (new Precise (string2)).toString ();
    }

    static stringMax (string1: Str, string2: Str) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined;
        }
        return (new Precise (string1)).max (new Precise (string2)).toString ();
    }

    static stringGt (string1: Str, string2: Str) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return false;
        }
        return (new Precise (string1)).gt (new Precise (string2));
    }

    static stringGe (string1: Str, string2: Str) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return false;
        }
        return (new Precise (string1)).ge (new Precise (string2));
    }

    static stringLt (string1: Str, string2: Str) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return false;
        }
        return (new Precise (string1)).lt (new Precise (string2));
    }

    static stringLe (string1: Str, string2: Str) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return false;
        }
        return (new Precise (string1)).le (new Precise (string2));
    }
}

export default Precise;

export { Precise };
