/* eslint-disable */
'use strict'

const zero = BigInt (0)
const minusOne = BigInt (-1)
const base = BigInt (10)

class Precise {
    constructor (number, decimals = undefined) {
        if (decimals === undefined) {
            let modifier = 0
            number = number.toLowerCase ()
            if (number.indexOf ('e') > -1) {
                [ number, modifier ] = number.split ('e')
                modifier = parseInt (modifier)
            }
            const decimalIndex = number.indexOf ('.')
            this.decimals = (decimalIndex > -1) ? number.length - decimalIndex - 1 : 0
            const integerString = number.replace ('.', '')
            this.integer = BigInt (integerString)
            this.decimals = this.decimals - modifier
        } else {
            this.integer = number
            this.decimals = decimals
        }
    }

    mul (other) {
        // other must be another instance of Precise
        const integerResult = this.integer * other.integer
        return new Precise (integerResult, this.decimals + other.decimals)
    }

    div (other, precision = 18) {
        const distance = precision - this.decimals + other.decimals
        let numerator
        if (distance === 0) {
            numerator = this.integer
        } else if (distance < 0) {
            const exponent = base ** BigInt (-distance)
            numerator = this.integer / exponent
        } else {
            const exponent = base ** BigInt (distance)
            numerator = this.integer * exponent
        }
        const result = numerator / other.integer
        return new Precise (result, precision)
    }

    add (other) {
        if (this.decimals === other.decimals) {
            const integerResult = this.integer + other.integer
            return new Precise (integerResult, this.decimals)
        } else {
            const [ smaller, bigger ] =
                (this.decimals > other.decimals) ? [ other, this ] : [ this, other ]
            const exponent = bigger.decimals - smaller.decimals
            const normalised = smaller.integer * (base ** BigInt (exponent))
            const result = normalised + bigger.integer
            return new Precise (result, bigger.decimals)
        }
    }

    mod (other) {
        const rationizerNumerator = Math.max (-this.decimals + other.decimals, 0)
        const numerator = this.integer * (base ** BigInt (rationizerNumerator))
        const rationizerDenominator = Math.max (-other.decimals + this.decimals, 0)
        const denominator = other.integer * (base ** BigInt (rationizerDenominator))
        const result = numerator % denominator
        return new Precise (result, rationizerDenominator + other.decimals)
    }

    sub (other) {
        const negative = new Precise (-other.integer, other.decimals)
        return this.add (negative)
    }

    abs () {
        return new Precise (this.integer < 0 ? this.integer * minusOne : this.integer, this.decimals)
    }

    neg () {
        return new Precise (-this.integer, this.decimals)
    }

    min (other) {
        return this.lt (other) ? this : other
    }

    max (other) {
        return this.gt (other) ? this : other
    }

    gt (other) {
        const sum = this.sub (other)
        return sum.integer > 0
    }

    ge (other) {
        const sum = this.sub (other)
        return sum.integer >= 0
    }

    lt (other) {
        return other.gt (this)
    }

    le (other) {
        return other.ge (this)
    }

    reduce () {
        const string = this.integer.toString ()
        const start = string.length - 1
        if (start === 0) {
            if (string === '0') {
                this.decimals = 0
            }
            return this
        }
        let i
        for (i = start; i >= 0; i--) {
            if (string.charAt (i) !== '0') {
                break
            }
        }
        const difference = start - i
        if (difference === 0) {
            return this
        }
        this.decimals -= difference
        this.integer = BigInt (string.slice (0, i + 1))
    }

    equals (other) {
        this.reduce ()
        other.reduce ()
        return (this.decimals === other.decimals) && (this.integer === other.integer)
    }

    toString () {
        this.reduce ()
        let sign
        let abs
        if (this.integer < 0) {
            sign = '-'
            abs = -this.integer
        } else {
            sign = ''
            abs = this.integer
        }
        const integerArray = Array.from (abs.toString (this.base).padStart (this.decimals, '0'))
        const index = integerArray.length - this.decimals
        let item
        if (index === 0) {
            // if we are adding to the front
            item = '0.'
        } else if (this.decimals < 0) {
            item = '0'.repeat (-this.decimals)
        } else if (this.decimals === 0) {
            item = ''
        } else {
            item = '.'
        }
        integerArray.splice (index, 0, item)
        return sign + integerArray.join ('')
    }

    static stringMul (string1, string2) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined
        }
        return (new Precise (string1)).mul (new Precise (string2)).toString ()
    }

    static stringDiv (string1, string2, precision = 18) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined
        }
        const string2Precise = new Precise (string2)
        if (string2Precise.integer === zero) {
            return undefined
        }
        return (new Precise (string1)).div (string2Precise, precision).toString ()
    }

    static stringAdd (string1, string2) {
        if ((string1 === undefined) && (string2 === undefined)) {
            return undefined
        }
        if (string1 === undefined) {
            return string2
        } else if (string2 === undefined) {
            return string1
        }
        return (new Precise (string1)).add (new Precise (string2)).toString ()
    }

    static stringSub (string1, string2) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined
        }
        return (new Precise (string1)).sub (new Precise (string2)).toString ()
    }

    static stringAbs (string) {
        if (string === undefined) {
            return undefined
        }
        return (new Precise (string)).abs ().toString ()
    }

    static stringNeg (string) {
        if (string === undefined) {
            return undefined
        }
        return (new Precise (string)).neg ().toString ()
    }

    static stringMod (string1, string2) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined
        }
        return (new Precise (string1)).mod (new Precise (string2)).toString ()
    }

    static stringEquals (string1, string2) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined
        }
        return (new Precise (string1)).equals (new Precise (string2))
    }

    static stringEq (string1, string2) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined
        }
        return (new Precise (string1)).equals (new Precise (string2))
    }

    static stringMin (string1, string2) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined
        }
        return (new Precise (string1)).min (new Precise (string2)).toString ()
    }

    static stringMax (string1, string2) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined
        }
        return (new Precise (string1)).max (new Precise (string2)).toString ()
    }

    static stringGt (string1, string2) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined
        }
        return (new Precise (string1)).gt (new Precise (string2))
    }

    static stringGe (string1, string2) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined
        }
        return (new Precise (string1)).ge (new Precise (string2))
    }

    static stringLt (string1, string2) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined
        }
        return (new Precise (string1)).lt (new Precise (string2))
    }

    static stringLe (string1, string2) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined
        }
        return (new Precise (string1)).le (new Precise (string2))
    }
}

module.exports = Precise;
