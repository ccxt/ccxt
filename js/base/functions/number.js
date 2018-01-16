"use strict";

/*  ------------------------------------------------------------------------ */

const decimal = float => parseFloat (float).toString ()

/*  ------------------------------------------------------------------------ */

//toPrecision (x, { round: true, digits: 6, fixed: true, pad: true, output: 'string' })

// See https://stackoverflow.com/questions/1685680/how-to-avoid-scientific-notation-for-large-numbers-in-javascript for discussion

function toFixed (x) { // avoid scientific notation for too large and too small numbers

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
    return x
}

const numberToString = toFixed

// See https://stackoverflow.com/questions/4912788/truncate-not-round-off-decimal-numbers-in-javascript for discussion

// > So, after all it turned out, rounding bugs will always haunt you, no matter how hard you try to compensate them.
// > Hence the problem should be attacked by representing numbers exactly in decimal notation.

const truncate_regExpCache = []
    , truncate_to_string = (num, precision = 0) => {
        num = toFixed (num)
        if (precision > 0) {
            const re = truncate_regExpCache[precision] || (truncate_regExpCache[precision] = new RegExp("([-]*\\d+\\.\\d{" + precision + "})(\\d)"))
            const [,result] = num.toString ().match (re) || [null, num]
            return result.toString ()
        }
        return parseInt (num).toString ()
    }
    , truncate = (num, precision = 0) => parseFloat (truncate_to_string (num, precision))

const precisionFromString = (string) => {
    const split = string.replace (/0+$/g, '').split ('.')
    return (split.length > 1) ? (split[1].length) : 0
}

/*  ------------------------------------------------------------------------ */

module.exports = {
 
    decimal,
    toFixed,
    truncate_to_string,
    precisionFromString
}

/*  ------------------------------------------------------------------------ */
