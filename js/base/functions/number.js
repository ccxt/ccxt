'use strict'

const { isString, isNumber } = require ('./type')

/*  ------------------------------------------------------------------------

    NB: initially, I used objects for options passing:

            decimalStringToPrecision ('123.456', 2, { round: true, afterPoint: true })

    ...but it turns out that it's hard to port that across different languages and it
       probably has a performance penalty -- while it's a performance critical code! So
       I switched to using named constants instead, as it is actually more readable and
       succint, and surely doesn't come with any inherent performance penalty:

            decimalStringToPrecision ('123.456', 2, ROUND, AFTER_POINT)                     */


const ROUND    = 0              // rounding mode
    , TRUNCATE = 1

const ALL_SIGNIFICANT = 0       // digits counting mode
    , AFTER_POINT     = 1

const NO_PADDING     = 0        // zero-padding mode
    , PAD_WITH_ZEROS = 1

/*  ------------------------------------------------------------------------ */

// See https://stackoverflow.com/questions/1685680/how-to-avoid-scientific-notation-for-large-numbers-in-javascript for discussion

function numberToString (x) { // avoid scientific notation for too large and too small numbers

    if (isString (x)) return x

    if (Math.abs (x) < 1.0) {
        const e = parseInt (x.toString ().split ('e-')[1])
        if (e) {
            x *= Math.pow (10, e-1)
            x = '0.' + (new Array (e)).join ('0') + x.toString ().substring (2)
        }
    } else {
        let e = parseInt (x.toString ().split ('+')[1])
        if (e > 20) {
            e -= 20
            x /= Math.pow (10, e)
            x += (new Array (e+1)).join ('0')
        }
    }
    return x.toString ()
}

/*  ------------------------------------------------------------------------ */

const decimalToPrecision = (x, numDigits
                             , roundingMode
                             , digitsCountingMode
                             , paddingMode) => { 

    const str = numberToString (x)

    const digits = Array.from (str)
    const result = []

    const dotAt = digits.indexOf ('.')

    // let dotAt = -1

    // for (let i = 0, n = digits.length; i < n; i++) {

    //     const d = digits[i]

    //     if (d === '.') {
    //         if (dotAt >= 0) throw new Error ('invalid number (contains multiple dots)')
    //         else dotAt = i
    //     } else if (d !== '0') {
    //         const code = d.charCodeAt (0)
    //         if ((code < 48) || (code > 57)) throw new Error ('invalid number (contains illegal characters)')
    //     }
    // }

    let memo = 0
    
    const to = (digitsCountingMode === AFTER_POINT)
                    ? (((dotAt >= 0) ? dotAt : digits.length) + numDigits)
                    : numDigits

    for (let i = digits.length - 1; i >= 0; i--) {
        const d = digits[i]
        if (d !== '.') {
            let n = (d.charCodeAt (0) - 48) + memo
            let numDigitsAhead = i
            let dotAhead = (dotAt >= 0) && (i >= dotAt)
            if ((numDigitsAhead + (dotAhead ? -1 : 0)) >= to) { // ignore dot when counting digits ahead
                n = (roundingMode === TRUNCATE)
                        ? 0
                        : ((n > 5) ? 10 : 0) // rounding on per-digit basis
            }
            if (n > 9) { n = 0; memo = 1; }
            else memo = 0
            digits[i] = n
        }
    }
    return (memo || '') + digits.join ('')
}

/*  ------------------------------------------------------------------------ */

// const roundNumber = (x, { digits = 8, fixed = true }) => { // accepts either strings or Numbers
    
//     const s = numberToString (x)

//     if (fixed) {
//         return roundDecimalString (s, digits, true)

//     } else {
//         const [,zeros,significantPart] = s.match (/^([^1-9]*)(.+)$/)
//         return zeros + roundDecimalString (significantPart, digits)
//     }
// }

/*  ------------------------------------------------------------------------ */

// const precisionFromString = (string) => {
//     const split = string.replace (/0+$/g, '').split ('.')
//     return (split.length > 1) ? (split[1].length) : 0
// }

/*  ------------------------------------------------------------------------ */

module.exports = {
 
    numberToString,
    decimalToPrecision,
    // toPrecision,
    // padWithZeroes,
    // roundDecimalString,
    // precisionFromString
}

/*  ------------------------------------------------------------------------ */
