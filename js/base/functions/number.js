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

const ROUND      = 1                // rounding mode
    , TRUNCATE   = 2
    , ROUND_UP   = 4
    , ROUND_DOWN = 8

const DECIMAL_PLACES     = 16        // digits counting mode
    , SIGNIFICANT_DIGITS = 32
    , TICK_SIZE = 64

const NO_PADDING    = 128             // zero-padding mode
    , PAD_WITH_ZERO = 256

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
const Precise = require ('../Precise')
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

	var result = ''
	var hasDot = null
	var numPrecisionDigitsNum = null

	/*  handle tick size */
    if (countingMode === TICK_SIZE) {
		var numPrecisionDigitsP = null
	    if (typeof numPrecisionDigits === 'string') {
	        numPrecisionDigitsP = new Precise (numPrecisionDigits)
	    } else if (Number.isInteger (numPrecisionDigits)) {
		    numPrecisionDigitsP = new Precise (BigInt (numPrecisionDigits), 0)
	    } else if (Number.isFinite (numPrecisionDigits)) {
		    // Occurrences of this should be eliminated and replaced by strings instead.
	        let exponent = Math.floor (Math.log10 (numPrecisionDigits))-15+1
		    const mantissa = Math.round (numPrecisionDigits / Math.pow (10, exponent))
	        numPrecisionDigitsP = new Precise (BigInt (mantissa), -exponent)
	        numPrecisionDigitsP.reduce ()
	    } else {
	        throw new Error ('numPrecisionDigits must be a string or a Number')
	    }
		if (numPrecisionDigitsP.integer <= Bzero) {
			throw new Error ('TICK_SIZE cant be used with negative or zero numPrecisionDigits')
		}
	
		var xP = null
	    if (typeof x === 'string') {
	        xP = new Precise (x)
	    } else if (Number.isInteger (x)) {
		    xP = new Precise (BigInt (x), 0)
	    } else if (Number.isFinite (x)) {
		    // Occurrences of this should be eliminated and replaced by strings instead.
	        let exponent = Math.floor (Math.log10 (Math.abs (x)))-15+1
		    const mantissa = Math.round (x / Math.pow (10, exponent))
	        xP = new Precise (BigInt (mantissa), -exponent)
	        xP.reduce ()
	    } else {
	        throw new Error ('x must be a string or a Number')
	    }
        const newNumPrecisionDigits = numPrecisionDigitsP.decimals > 0 ? numPrecisionDigitsP.decimals : 0
        const remainder = xP.mod (numPrecisionDigitsP)
        if (remainder.integer != Bzero) {
            if (roundingMode === ROUND) {
                xP = xP.div (numPrecisionDigitsP).round ().mul (numPrecisionDigitsP)
            } else if (roundingMode === TRUNCATE) {
                if (xP.integer >= Bzero) {
                    xP = xP.div (numPrecisionDigitsP).floor ().mul (numPrecisionDigitsP)
                } else {
                    xP = xP.div (numPrecisionDigitsP).ceil ().mul (numPrecisionDigitsP)
                }
            }
        }
		x = xP.toString ()
		roundingMode = ROUND
		numPrecisionDigitsNum = newNumPrecisionDigits
		countingMode = DECIMAL_PLACES
        // return decimalToPrecision (x, ROUND, newNumPrecisionDigits, DECIMAL_PLACES, paddingMode)
    } else {
		if (Number.isFinite(x)) {
			x = numberToString(x)
		} else if (typeof x !== 'string') {
	        throw new Error ('x must be a string or a Number')
		}
		//if (x.match(/^-?[0-9]+(\.[0-9]*)?$/) === null) {
	    //    throw new Error ('x must be a string representing a number in non-scientific notation')
		//}
		
		if (typeof numPrecisionDigits === 'string') {
			numPrecisionDigitsNum = Number(numPrecisionDigits)
	    } else if (Number.isInteger (numPrecisionDigits)) {
			numPrecisionDigitsNum = numPrecisionDigits
	    } else {
	        throw new Error ('numPrecisionDigits must be a string or an integer Number')
	    }
	}

	if ( numPrecisionDigitsNum % 1 !== 0 ) {
        throw new Error ('numPrecisionDigits must be an integer for DECIMAL_PLACES and SIGNIFICANT_DIGITS')
	}
    if (countingMode === SIGNIFICANT_DIGITS) {
        if (numPrecisionDigits < 0) {
            throw new Error ('SIGNIFICANT_DIGITS cant be used with negative numPrecisionDigits')
        }
		if (numPrecisionDigits === 0) {
			return '0'
		}
    }
	
	var pointIndex = x.indexOf('.')
	if (pointIndex === -1) {
		pointIndex = x.length
	}
	var firstDigitPos = 0
	while ((firstDigitPos < x.length) && (x[firstDigitPos] < '1') || (x[firstDigitPos] > '9')) {
		firstDigitPos++
	}
	var lastDigitPos = null
	if (countingMode === DECIMAL_PLACES) {
		lastDigitPos = pointIndex + numPrecisionDigitsNum
		if (lastDigitPos < pointIndex) {
			lastDigitPos--
		}
	} else if (countingMode === SIGNIFICANT_DIGITS) {
		lastDigitPos = firstDigitPos + numPrecisionDigitsNum
		if (((firstDigitPos < pointIndex) && (lastDigitPos < pointIndex)) || (firstDigitPos > pointIndex)) {
			lastDigitPos--
		}
	} else {
		assert(false)
	}
    let charArray = Array.from (x)
	if (roundingMode === ROUND) {
		var p = lastDigitPos
		var p2 = p+1
		if ((pointIndex == p2) && (pointIndex !== x.length)) {
			p2++
		}
		var carry = 0
		while (((p >= 0) && (p < charArray.length) && (charArray[p] != '-')) || (p2 >= 0)) {
			if (p >= charArray.length) {
				break
			}
			if ((p2 >= charArray.length) || (charArray[p2].charCodeAt() - '0'.charCodeAt() + 10*carry < 5)) {
				break
			}
			carry = 1
			if (p === -1) {
				charArray.splice (p+1, 0, String.fromCharCode ('0'.charCodeAt() + carry))
				p++
				pointIndex++
				if (countingMode === DECIMAL_PLACES) {
					lastDigitPos++
				}
				break
			} else if (charArray[p].charCodeAt() - '0'.charCodeAt() + carry <= 9) {
				charArray[p] = String.fromCharCode (charArray[p].charCodeAt() + carry)
				if (p < firstDigitPos) {
					const delta = p - firstDigitPos
					firstDigitPos += delta
					if (countingMode === SIGNIFICANT_DIGITS) {
						lastDigitPos += delta
					}
				}
				break
			}
			charArray[p] = '0'
			p2 = p
			p--
			if ((p !== -1) && (charArray[p] === '.')) {
				p--
			}
			if ((p === -1) || (charArray[p] === '-')) {
				charArray.splice (p+1, 0, String.fromCharCode ('0'.charCodeAt() + carry))
				p++
				pointIndex++
				if (countingMode === DECIMAL_PLACES) {
					lastDigitPos++
				}
				break
			}
		}
		if ((lastDigitPos < 0) || ((lastDigitPos < charArray.length) && (charArray[lastDigitPos] === '-'))) {
			return '0'
		}
		for (p = charArray.length-1; p > lastDigitPos; --p) {
			if (p != pointIndex) {
				charArray[p] = '0'
			}
		}
	} else if (roundingMode === TRUNCATE) {
		if ((lastDigitPos < 0) || ((lastDigitPos < charArray.length) && (charArray[lastDigitPos] === '-'))) {
			return '0'
		}
		for (var p=lastDigitPos+1; p<pointIndex; ++p) {
			charArray[p] = '0'
		}
	} else {
		assert(false)
	}
	result = charArray.splice (0, Math.max (pointIndex, lastDigitPos+1)).join ('')
	hasDot = result.includes('.')
	if (paddingMode === NO_PADDING) {
		if ((result.length === 0) && (numPrecisionDigitsNum === 0)) {
			return '0'
		}
		if (hasDot) {
			var trailingZeroInd = result.length
			while ((trailingZeroInd > 0) && (result[trailingZeroInd-1] === '0')) {
				trailingZeroInd--
			}
			if (trailingZeroInd < result.length) {
				result = result.slice (0, trailingZeroInd)
			}
		}
	} else if (paddingMode === PAD_WITH_ZERO) {
		if (result.length < lastDigitPos) {
			if (pointIndex === result.length) {
				result += '.'
			}
			result += '0'.repeat (lastDigitPos - result.length + 1)
		}
	} else {
		assert(false)
	}
	if (hasDot) {
		if ((result.length > 0) && (result[result.length-1] === '.')) {
			result = result.slice (0, result.length - 1)
		}
	}
	if ((result === "-0") || (result === '-0.' + '0'.repeat (Math.max(result.length-3,0)))) {
		result = result.slice (1)
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
