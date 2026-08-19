import { Str, Int } from './types.js';

const zero = BigInt (0);
const minusOne = BigInt (-1);
const base = BigInt (10);

// cache of powers of ten, since base ** BigInt (n) is expensive and
// the same small exponents are requested over and over again
const POW10_CACHE_LIMIT = 512;
const pow10Cache: bigint[] = [ BigInt (1) ];

function pow10 (exponent: number): bigint {
    if (exponent < POW10_CACHE_LIMIT) {
        let length = pow10Cache.length;
        if (exponent < length) {
            return pow10Cache[exponent];
        }
        let last = pow10Cache[length - 1];
        while (length <= exponent) {
            last = last * base;
            pow10Cache.push (last);
            length++;
        }
        return last;
    }
    return base ** BigInt (exponent);
}

class Precise {
    decimals: number;

    integer: bigint;

    base = undefined;

    constructor (number: bigint | string, decimals: Int = undefined) {
        if (decimals === undefined) {
            let str = number as string;
            let modifier = 0;
            // avoid toLowerCase () unless there is scientific notation
            let eIndex = str.indexOf ('e');
            if (eIndex === -1) {
                eIndex = str.indexOf ('E');
            }
            if (eIndex > -1) {
                modifier = parseInt (str.slice (eIndex + 1));
                str = str.slice (0, eIndex);
            }
            const decimalIndex = str.indexOf ('.');
            if (decimalIndex > -1) {
                this.decimals = str.length - decimalIndex - 1 - modifier;
                this.integer = BigInt (str.slice (0, decimalIndex) + str.slice (decimalIndex + 1));
            } else {
                this.decimals = -modifier;
                this.integer = BigInt (str);
            }
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
            numerator = this.integer / pow10 (-distance);
        } else {
            numerator = this.integer * pow10 (distance);
        }
        const result = numerator / other.integer;
        return new Precise (result, precision);
    }

    add (other: Precise) {
        if (this.decimals === other.decimals) {
            const integerResult = this.integer + other.integer;
            return new Precise (integerResult, this.decimals);
        } else {
            const [ smaller, bigger ] = (this.decimals > other.decimals) ? [ other, this ] : [ this, other ];
            const exponent = bigger.decimals - smaller.decimals;
            const normalised = smaller.integer * pow10 (exponent);
            const result = normalised + bigger.integer;
            return new Precise (result, bigger.decimals);
        }
    }

    mod (other: Precise) {
        const rationizerNumerator = Math.max (-this.decimals + other.decimals, 0);
        const numerator = this.integer * pow10 (rationizerNumerator);
        const rationizerDenominator = Math.max (-other.decimals + this.decimals, 0);
        const denominator = other.integer * pow10 (rationizerDenominator);
        const result = numerator % denominator;
        return new Precise (result, rationizerDenominator + other.decimals);
    }

    sub (other: Precise) {
        // inlined addition of the negation, avoiding an intermediate Precise allocation
        if (this.decimals === other.decimals) {
            return new Precise (this.integer - other.integer, this.decimals);
        } else if (this.decimals > other.decimals) {
            const normalised = other.integer * pow10 (this.decimals - other.decimals);
            return new Precise (this.integer - normalised, this.decimals);
        } else {
            const normalised = this.integer * pow10 (other.decimals - this.decimals);
            return new Precise (normalised - other.integer, other.decimals);
        }
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

    // compares without allocating intermediate Precise instances
    // returns a negative number if this < other, 0 if equal, positive if this > other
    private cmp (other: Precise): number {
        let thisInteger = this.integer;
        let otherInteger = other.integer;
        if (this.decimals > other.decimals) {
            otherInteger = otherInteger * pow10 (this.decimals - other.decimals);
        } else if (this.decimals < other.decimals) {
            thisInteger = thisInteger * pow10 (other.decimals - this.decimals);
        }
        return (thisInteger < otherInteger) ? -1 : ((thisInteger > otherInteger) ? 1 : 0);
    }

    min (other: Precise) {
        return (this.cmp (other) < 0) ? this : other;
    }

    max (other: Precise) {
        return (this.cmp (other) > 0) ? this : other;
    }

    gt (other: Precise) {
        return this.cmp (other) > 0;
    }

    ge (other: Precise) {
        return this.cmp (other) >= 0;
    }

    lt (other: Precise) {
        return other.gt (this);
    }

    le (other: Precise) {
        return other.ge (this);
    }

    reduce () {
        const string = this.integer.toString ();
        const start = string.length - 1;
        if (start === 0) {
            if (string === '0') {
                this.decimals = 0;
            }
            return this;
        }
        let i;
        for (i = start; i >= 0; i--) {
            if (string.charCodeAt (i) !== 48) { // '0'
                break;
            }
        }
        const difference = start - i;
        if (difference === 0) {
            return this;
        }
        this.decimals -= difference;
        this.integer = BigInt (string.slice (0, i + 1));
    }

    equals (other: any) {
        this.reduce ();
        other.reduce ();
        return (this.decimals === other.decimals) && (this.integer === other.integer);
    }

    toString () {
        this.reduce ();
        let sign;
        let abs;
        if (this.integer < 0) {
            sign = '-';
            abs = -this.integer;
        } else {
            sign = '';
            abs = this.integer;
        }
        const string = abs.toString ();
        const decimals = this.decimals;
        if (decimals === 0) {
            return sign + string;
        } else if (decimals < 0) {
            return sign + string + '0'.repeat (-decimals);
        }
        const length = string.length;
        if (length > decimals) {
            return sign + string.slice (0, length - decimals) + '.' + string.slice (length - decimals);
        }
        return sign + '0.' + ((length < decimals) ? ('0'.repeat (decimals - length) + string) : string);
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
