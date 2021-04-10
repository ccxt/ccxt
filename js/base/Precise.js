'use strict'

const BN = require ('../static_dependencies/BN/bn')

class Precise {
    constructor (number, decimals = 0) {
        const isBN = number instanceof BN
        const isString = typeof number === 'string'
        if (!(isBN || isString)) {
            throw new Error ('Precise initiated with something other than a string or BN')
        }
        if (isBN) {
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
            this.integer = new BN (integerString)
            this.decimals = this.decimals - modifier
        }
        this.base = 10
        this.reduce ()
    }

    mul (other) {
        // other must be another instance of Precise
        const integerResult = this.integer.mul (other.integer)
        return new Precise (integerResult, this.decimals + other.decimals)
    }

    div (other, precision = 18) {
        const distance = precision - this.decimals + other.decimals
        let numerator
        if (distance === 0) {
            numerator = this.integer
        } else if (distance < 0) {
            const exponent = new BN (this.base).pow (new BN (-distance))
            numerator = this.integer.div (exponent)
        } else {
            const exponent = new BN (this.base).pow (new BN (distance))
            numerator = this.integer.mul (exponent)
        }
        const result = numerator.div (other.integer)
        return new Precise (result, precision)
    }

    add (other) {
        if (this.decimals === other.decimals) {
            const integerResult = this.integer.add (other.integer)
            return new Precise (integerResult, this.decimals)
        } else {
            const [ smaller, bigger ] =
                (this.decimals > other.decimals) ? [ other, this ] : [ this, other ]
            const exponent = new BN (bigger.decimals - smaller.decimals)
            const normalised = smaller.integer.mul (new BN (this.base).pow (exponent))
            const result = normalised.add (bigger.integer)
            return new Precise (result, bigger.decimals)
        }
    }

    sub (other) {
        const negative = new Precise (other.integer.neg (), other.decimals)
        return this.add (negative)
    }

    reduce () {
        const zero = new BN (0)
        if (this.integer.eq (zero)) {
            this.decimals = 0
            return this
        }
        const base = new BN (this.base)
        let divmod = this.integer.divmod (base)
        while (divmod.mod.eq (zero)) {
            this.integer = divmod.div
            this.decimals--
            divmod = this.integer.divmod (base)
        }
        return this
    }

    toString () {
        const sign = this.integer.negative ? '-' : ''
        const integerArray = Array.from (this.integer.abs ().toString (this.base).padStart (this.decimals, '0'))
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
}

module.exports = Precise;
