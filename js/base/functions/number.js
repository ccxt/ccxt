"use strict";

const { isString, isNumber } = require ('./type')

/*  ------------------------------------------------------------------------ */

const decimal = float => parseFloat (float).toString ()

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

const padWithZeroes = (x, digits = 0) => {

    const [int, frac = ''] = x.split ('.')

    return int + ((frac || (digits > 0))
                        ? ('.' + frac.padEnd (digits, '0'))
                        : '')
}

const roundDecimalString = (s, to, afterDot = false) => { 

    const digits = Array.from (s)
    const result = []
    const dot = s.indexOf ('.')

    let memo = 0

    if (afterDot) to = ((dot >= 0) ? dot : digits.length) + to

    for (let i = digits.length - 1; i >= 0; i--) {
        const d = digits[i]
        if (d !== '.') {
            let n = (d.charCodeAt (0) - 48) + memo
            let numDigitsAhead = i
            let dotAhead = (dot >= 0) && (i >= dot)
            if ((numDigitsAhead + (dotAhead ? -1 : 0)) >= to) { // ignore dot when counting digits ahead
                n = (n > 5) ? 10 : 0 // rounding on per-digit basis
            }
            if (n > 9) { n = 0; memo = 1; }
            else memo = 0
            digits[i] = n
        }
    }
    return (memo || '') + digits.join ('')
}


const roundNumber = (x, { digits = 8, fixed = true }) => { // accepts either strings or Numbers
    
    const s = numberToString (x)

    if (fixed) {
        return roundDecimalString (s, digits, true)

    } else {
        const [,zeros,significantPart] = s.match (/^([^1-9]*)(.+)$/)
        return zeros + roundDecimalString (significantPart, digits)
    }
}

// See https://stackoverflow.com/questions/4912788/truncate-not-round-off-decimal-numbers-in-javascript for discussion

// > So, after all it turned out, rounding bugs will always haunt you, no matter how hard you try to compensate them.
// > Hence the problem should be attacked by representing numbers exactly in decimal notation.

const regexCache = []
const truncNumber = (x, { digits = 0, fixed = true }) => { // accepts either strings or Numbers

    const s = numberToString (x)

    if (digits > 0) {
        const re = regexCache[digits] || (regexCache[digits] = new RegExp("([-]*\\d+\\.\\d{" + digits + "})(\\d)"))
        const [,result] = s.match (re) || [null, s]
        return fixed
                ? padWithZeroes (result, digits)
                : result

    } else {
        throw new Error ('not implemented yet')
    }
}

const precisionFromString = (string) => {
    const split = string.replace (/0+$/g, '').split ('.')
    return (split.length > 1) ? (split[1].length) : 0
}

const toPrecision = (x, { round = true, digits = 8, fixed = true, output = 'string' }) => { // accepts either strings or Numbers

    const s = round ? roundNumber (x, { digits, fixed })
                    : truncNumber (x, { digits, fixed })

    return (output === 'string') ? s
                                 : Number (s)
}


/*  ------------------------------------------------------------------------ */

module.exports = {
 
    decimal,
    numberToString,
    toPrecision,
    padWithZeroes,
    roundDecimalString,
    precisionFromString
}

/*  ------------------------------------------------------------------------ */
