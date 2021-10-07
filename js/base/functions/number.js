'use strict'
var assert = require('assert');

/*  ------------------------------------------------------------------------

    NB: initially, I used objects for options passing:

            decimalToPrecision ('123.456', { digits: 2, round: true, afterPoint: true })

    ...but it turns out it's hard to port that across different languages and it is also
       probably has a performance penalty -- while it's a performance critical code! So
       I switched to using named constants instead, as it is actually more readable and
       succinct, and surely doesn't come with any inherent performance downside:

            decimalToPrecision ('123.456', ROUND, 2, DECIMAL_PLACES)                     */

const ROUND      = 0                // rounding mode
    , TRUNCATE   = 1
    , ROUND_UP   = 2
    , ROUND_DOWN = 3

const DECIMAL_PLACES     = 0        // digits counting mode
    , SIGNIFICANT_DIGITS = 1
    , TICK_SIZE = 2

const NO_PADDING    = 0             // zero-padding mode
    , PAD_WITH_ZERO = 1

const precisionConstants = {
    ROUND,
    TRUNCATE,
    ROUND_UP,
    ROUND_DOWN,
    DECIMAL_PLACES,
    SIGNIFICANT_DIGITS,
    TICK_SIZE,
    NO_PADDING,
    PAD_WITH_ZERO,
}
const Precise = require ('../Precise');
const zero = new Precise('0')
const Bzero = BigInt(0)

/*  ------------------------------------------------------------------------ */

// See https://stackoverflow.com/questions/1685680/how-to-avoid-scientific-notation-for-large-numbers-in-javascript for discussion

function numberToString (x) { // avoids scientific notation for too large and too small numbers
    if (x === undefined) return undefined

    if (typeof x !== 'number') return x.toString ()

    const s = x.toString ()
    if (Math.abs (x) < 1.0) {
        const n_e = s.split ('e-')
        const n = n_e[0].replace ('.', '')
        const e = parseInt (n_e[1])
        const neg = (s[0] === '-')
        if (e) {
            x = (neg ? '-' : '') + '0.' + (new Array (e)).join ('0') + n.substring (neg)
            return x
        }
    } else {
        const parts = s.split ('e')
        if (parts[1]) {
            let e = parseInt (parts[1])
            const m = parts[0].split ('.')
            let part = ''
            if (m[1]) {
                e -= m[1].length
                part = m[1]
            }
            return m[0] + part + (new Array (e + 1)).join ('0')
        }
    }
    return s
}

//-----------------------------------------------------------------------------
// expects non-scientific notation

const truncate_regExpCache = []
    , truncate_to_string = (num, precision = 0) => {
        num = numberToString (num)
        if (precision > 0) {
            const re = truncate_regExpCache[precision] || (truncate_regExpCache[precision] = new RegExp ("([-]*\\d+\\.\\d{" + precision + "})(\\d)"))
            const [ , result] = num.toString ().match (re) || [null, num]
            return result.toString ()
        }
        return parseInt (num).toString ()
    }
    , truncate = (num, precision = 0) => parseFloat (truncate_to_string (num, precision))

function precisionFromString (string) {
    const split = string.replace (/0+$/g, '').split ('.')
    return (split.length > 1) ? (split[1].length) : 0
}

/*  ------------------------------------------------------------------------ */

const decimalToPrecision = (x, roundingMode
                             , numPrecisionDigits
                             , countingMode       = DECIMAL_PLACES
                             , paddingMode        = NO_PADDING) => {

    if (typeof numPrecisionDigits === 'string') {
        numPrecisionDigits = new Precise (numPrecisionDigits)
    } else if (Number.isInteger (numPrecisionDigits)) {
	    numPrecisionDigits = new Precise (BigInt (numPrecisionDigits), 0)
    } else if (Number.isFinite (numPrecisionDigits)) {
	    // Occurrences of this should be eliminated and replaced by strings instead.
        // ASSUME that the precision is specified to two decimal places.
        let exponent = Math.floor (Math.log10 (numPrecisionDigits))-1
	    const mantissa = Math.round (numPrecisionDigits / Math.pow (10, exponent))
        numPrecisionDigits = new Precise (BigInt (mantissa), -exponent)
    } else if (numPrecisionDigits instanceof Precise) {
	    // do nothing
    } else {
	    assert (false)
    }

    if (typeof x === 'string') {
        x = new Precise (x)
    } else if (Number.isInteger (x)) {
	    x = new Precise (BigInt (x), 0)
    } else if (x instanceof Precise) {
	    // do nothing
    } else {
	    assert (false)
    }

    if (countingMode === TICK_SIZE) {
        if (numPrecisionDigits.integer <= Bzero) {
            throw new Error ('TICK_SIZE cant be used with negative or zero numPrecisionDigits')
        }
    }

    if (numPrecisionDigits.integer < Bzero) {
        const toNearest = numPrecisionDigits.neg().pow10()
        if (roundingMode === ROUND) {
            return x.div (toNearest).round ().mul (toNearest).toString ()
        }
        if (roundingMode === TRUNCATE) {
            if (x.integer >= Bzero) {
                return x.div (toNearest).floor ().mul (toNearest).toString ()
            } else {
                return x.div (toNearest).ceil ().mul (toNearest).toString ()
            }
        }
    }

/*  handle tick size */
    if (countingMode === TICK_SIZE) {
        numPrecisionDigits.reduce ()
        const newNumPrecisionDigits = numPrecisionDigits.decimals > 0 ? numPrecisionDigits.decimals : 0
        const remainder = x.mod (numPrecisionDigits)
        if (remainder.integer != Bzero) {
            if (roundingMode === ROUND) {
                x = x.div (numPrecisionDigits).round ().mul (numPrecisionDigits)
            } else if (roundingMode === TRUNCATE) {
                if (x.integer >= Bzero) {
                    x = x.div (numPrecisionDigits).floor ().mul (numPrecisionDigits)
                } else {
                    x = x.div (numPrecisionDigits).ceil ().mul (numPrecisionDigits)
                }
            }
        }
		roundingMode = ROUND
		numPrecisionDigits = new Precise(BigInt(newNumPrecisionDigits), 0)
		countingMode = DECIMAL_PLACES
        // return decimalToPrecision (x, ROUND, newNumPrecisionDigits, DECIMAL_PLACES, paddingMode)
    }

    assert ((countingMode === DECIMAL_PLACES) || (countingMode === SIGNIFICANT_DIGITS))
    assert (numPrecisionDigits.decimals <= 0)
	const numPrecisionDigitsInt = Number(numPrecisionDigits.integer) * (10 ** -numPrecisionDigits.decimals);
	assert ((roundingMode === ROUND) || (roundingMode === TRUNCATE))
	
	let result = ''

	if (roundingMode === ROUND) {
		let toNearest = null
		if (countingMode === DECIMAL_PLACES) {
			toNearest = numPrecisionDigits.neg().pow10()
		} else if (countingMode === SIGNIFICANT_DIGITS) {
			let significantPosition = null
			if (x.integer === 0) {
				assert (x.decimals === 0)
				significantPosition = 0
			} else {
				significantPosition = (x.integer<0 ? x.integer*BigInt(-1) : x.integer).toString().length - x.decimals 
			}
			const precisionDigits = significantPosition - numPrecisionDigitsInt
			toNearest = (new Precise(BigInt(precisionDigits), 0)).pow10()
		}
		x = x.div(toNearest).round().mul(toNearest)
		roundingMode = TRUNCATE
	}

    x.reduce()
    let sign
    let abs
    if (x.integer < 0) {
        sign = '-'
        abs = -x.integer
    } else {
        sign = ''
        abs = x.integer
    }
	const integerString = abs.toString (x.base)
    let integerArray = Array.from (integerString.padStart (x.decimals, '0'))
    let index = integerArray.length - x.decimals
    let item
    if (index === 0) {
        // if we are adding to the front
        item = '0.'
    } else {
        item = '.'
    }

	assert(roundingMode === TRUNCATE)
	let adjustmentDigits
	if (countingMode === DECIMAL_PLACES) {
		adjustmentDigits = numPrecisionDigitsInt - x.decimals
	} else if (countingMode === SIGNIFICANT_DIGITS) {
		let significantPosition
		if (integerString === "0") {
			assert(x.decimals === 0)
			significantPosition = 0
		} else {
			significantPosition = integerString.length - x.decimals 
		}
		adjustmentDigits = (numPrecisionDigitsInt - significantPosition) - x.decimals
	}
	if (adjustmentDigits > 0) {
		if (paddingMode === NO_PADDING) {
			adjustmentDigits = Math.max(-x.decimals, 0)
		}
		if (adjustmentDigits != 0) {
			integerArray = integerArray.concat(Array.from("".padStart(adjustmentDigits, '0')))
		}
	} else if (adjustmentDigits < 0) {
		if (-adjustmentDigits <= x.decimals) {
			integerArray.splice(adjustmentDigits)
		} else {
			if (integerArray.length === -adjustmentDigits) {
				const count = integerArray.length - x.decimals - 1
				integerArray.splice(0, count)
				index = index - count
				integerArray[0] = '0'
			} else {
				const ibegin = integerArray.length + adjustmentDigits
				const iend = integerArray.length - Math.max(x.decimals, 0)
				for (var i=ibegin; i<iend; ++i) {
					integerArray[i] = '0'
				}
			}
			if (x.decimals > 0) {
				integerArray.splice(-x.decimals)
			} else if (x.decimals < 0) {
				integerArray = integerArray.concat(Array.from("".padStart(-x.decimals, '0')))
			}
		}
	}
    integerArray.splice (index, 0, item)
    result = sign + integerArray.join ('')

	const hasDot = result.includes('.')
	if (paddingMode === NO_PADDING) {
		if ((result === '') && (numPrecisionDigitsInt === 0)) {
			return '0'
		}
		if (hasDot) {
			result = result.replace(/0*$/, "")
		}
	}
	if (hasDot) {
		result = result.replace(/\.$/, "")
	}
	if ((result === "-0") || (result === '-0.' + '0'.repeat(Math.max(result.length-3,0)))) {
		result = result.substring(1)
	}
	
	return result
}

function omitZero (stringNumber) {
    if (stringNumber === undefined || stringNumber === '') {
        return undefined
    }
    if (parseFloat (stringNumber) === 0) {
        return undefined
    }
    return stringNumber
}

/*  ------------------------------------------------------------------------ */

module.exports = {
    numberToString,
    precisionFromString,
    decimalToPrecision,
    truncate_to_string,
    truncate,
    omitZero,
    precisionConstants,
    ROUND,
    TRUNCATE,
    ROUND_UP,
    ROUND_DOWN,
    DECIMAL_PLACES,
    SIGNIFICANT_DIGITS,
    TICK_SIZE,
    NO_PADDING,
    PAD_WITH_ZERO,
}

/*  ------------------------------------------------------------------------ */
