'use strict'

const zero = BigInt (0)
const minusOne = BigInt (-1)

class Precise {
    constructor (number, decimals = 0) {
        const isBigInt = typeof number === 'bigint'
        const isString = typeof number === 'string'
        if (!(isBigInt || isString)) {
            throw new Error ('Precise initiated with something other than a string or BN')
        }
        if (isBigInt) {
            this.integer = number
            this.decimals = decimals
        } else {
            if (decimals) {
                throw new Error ('Cannot set decimals when initializing with a string')
            }
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
        }
        this.base = 10
        this.reduce ()
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
            const exponent = BigInt (this.base) ** BigInt (-distance)
            numerator = this.integer / exponent
        } else {
            const exponent = BigInt (this.base) ** BigInt (distance)
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
            const normalised = smaller.integer * (BigInt (this.base) ** BigInt (exponent))
            const result = normalised + bigger.integer
            return new Precise (result, bigger.decimals)
        }
    }

    mod (other) {
        const base = BigInt (this.base)
        const rationizerNumerator = Math.max (-this.decimals + other.decimals, 0)
        const numerator = this.integer * (base ** BigInt (rationizerNumerator))
        const rationizerDenominator = Math.max (-other.decimals + this.decimals, 0)
        const denominator = other.integer * (base ** BigInt (rationizerDenominator))
        const result = numerator % denominator
        return new Precise (result, rationizerDenominator + other.decimals)
    }

    pow (other) {
        const result = this.integer ** other.integer
        return new Precise (result, this.decimals * parseInt (other.integer))
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

    reduce () {
        if (this.integer === zero) {
            this.decimals = 0
            return this
        }
        const base = BigInt (this.base)
        let mod = this.integer % base
        while (mod === zero) {
            this.integer = this.integer / base
            mod = this.integer % base
            this.decimals--
        }
        return this
    }

    toString () {
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
        return (new Precise (string1)).div (new Precise (string2), precision).toString ()
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

    static stringPow (string1, string2) {
        if ((string1 === undefined) || (string2 === undefined)) {
            return undefined
        }
        return (new Precise (string1)).pow (new Precise (string2)).toString ()
    }
}

module.exports = Precise;
