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

	var result = ''
	var hasDot = null
	assert(typeof x === 'string')
	// Only numbers composed of digits and up to one decimal point are accepted.
	// No scientific notation.
	assert(x.match(/^-?[0-9]+(\.[0-9]*)?$/) !== null)
	var numPrecisionDigitsNum = null
	if (typeof numPrecisionDigits === 'string') {
		numPrecisionDigitsNum = Number(numPrecisionDigits)
	} else {
		numPrecisionDigitsNum = numPrecisionDigits
	}
    if (countingMode === SIGNIFICANT_DIGITS) {
        if (numPrecisionDigits < 0) {
            throw new Error ('SIGNIFICANT_DIGITS cant be used with negative numPrecisionDigits')
        }
		if (numPrecisionDigits === 0) {
			return '0'
		}
    }

	/*  handle tick size */
    if (countingMode === TICK_SIZE) {
		var numPrecisionDigitsP = null
	    if (typeof numPrecisionDigits === 'string') {
	        numPrecisionDigitsP = new Precise (numPrecisionDigits)
	    } else if (Number.isInteger (numPrecisionDigits)) {
		    numPrecisionDigitsP = new Precise (BigInt (numPrecisionDigits), 0)
	    } else if (Number.isFinite (numPrecisionDigits)) {
		    // Occurrences of this should be eliminated and replaced by strings instead.
	        // ASSUME that the precision is specified to two decimal places.
	        let exponent = Math.floor (Math.log10 (numPrecisionDigits))-1
		    const mantissa = Math.round (numPrecisionDigits / Math.pow (10, exponent))
	        numPrecisionDigitsP = new Precise (BigInt (mantissa), -exponent)
	    } else if (numPrecisionDigits instanceof Precise) {
		    numPrecisionDigitsP = numPrecisionDigits
	    } else {
		    assert (false)
	    }
	
		var xP = null
	    if (typeof x === 'string') {
	        xP = new Precise (x)
	    } else if (Number.isInteger (x)) {
		    xP = new Precise (BigInt (x), 0)
	    } else if (x instanceof Precise) {
		    xP = x
	    } else {
		    assert (false)
	    }
        numPrecisionDigitsP.reduce ()
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
    }
	assert (countingMode !== TICK_SIZE)

	assert( numPrecisionDigitsNum % 1 == 0 )
	
	var pointIndex = x.indexOf('.')
	if (pointIndex === -1) {
		pointIndex = x.length
	}
    let charArray = Array.from (x)
	var lastDigitPos = null
	if (countingMode === DECIMAL_PLACES) {
		lastDigitPos = pointIndex + numPrecisionDigitsNum
		if (lastDigitPos < pointIndex) {
			lastDigitPos--
		}
	} else if (countingMode === SIGNIFICANT_DIGITS) {
		var firstDigitPos = 0
		if (charArray[0] === '-') {
			firstDigitPos++
		}
		while ((firstDigitPos < charArray.length)
			&& ((charArray[firstDigitPos] === '0') || (charArray[firstDigitPos] === '.')))
		{
			firstDigitPos++
		}
		lastDigitPos = firstDigitPos + numPrecisionDigitsNum
		if ((firstDigitPos < pointIndex) && (lastDigitPos < pointIndex)) {
			lastDigitPos--
		} else if (firstDigitPos > pointIndex) {
			lastDigitPos--
		}
	}
    if (roundingMode === ROUND) {
		var p = lastDigitPos
		var p2 = p+1
		if ((pointIndex == p2) && (pointIndex !== x.length)) {
			p2++
		}
		var carry = 0
		while (((p >= 0) && (charArray[p] != '-')) || (p2 >= 0)) {
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
		if ((lastDigitPos < 0) || (charArray[lastDigitPos] === '-')) {
			return '0'
		}
		for (p = charArray.length-1; p > lastDigitPos; --p) {
			if (p != pointIndex) {
				charArray[p] = '0'
			}
		}
		result = charArray.splice (0, Math.max (pointIndex, lastDigitPos+1)).join ('')
    }
    if (roundingMode === TRUNCATE) {
		if ((lastDigitPos < 0) || ((lastDigitPos < charArray.length) && (charArray[lastDigitPos] === '-'))) {
			return '0' 
		}
		for (var p=lastDigitPos+1; p<pointIndex; ++p) {
			charArray[p] = '0'
		}
		result = charArray.splice (0, Math.max (pointIndex, lastDigitPos+1)).join ('')
	}
	hasDot = result.includes('.')
	if (paddingMode === NO_PADDING) {
		if ((result === '') && (numPrecisionDigitsNum === 0)) {
			return '0'
		}
		if (hasDot) {
			result = result.replace (/0*$/, "")
		}
	} else if ((paddingMode === PAD_WITH_ZERO) && (result.length < lastDigitPos)) {
		if (pointIndex === result.length) {
			result += '.'
		}
		result += '0'.repeat (lastDigitPos - result.length + 1)
	}
	if (hasDot) {
		result = result.replace (/\.$/, "")
	}
	if ((result === "-0") || (result === '-0.' + '0'.repeat (Math.max(result.length-3,0)))) {
		result = '0'
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
