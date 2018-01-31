'use strict'

const { isString, isNumber } = require ('./type')

/*  ------------------------------------------------------------------------

    NB: initially, I used objects for options passing:

            decimalStringToPrecision ('123.456', { digits: 2, round: true, afterPoint: true })

    ...but it turns out it's hard to port that across different languages and it is also
       probably has a performance penalty -- while it's a performance critical code! So
       I switched to using named constants instead, as it is actually more readable and
       succinct, and surely doesn't come with any inherent performance downside:

            decimalStringToPrecision ('123.456', ROUND, 2, AFTER_POINT)                     */


const ROUND    = 0                  // rounding mode
    , TRUNCATE = 1

const SIGNIFICANT_DIGITS_ONLY = 0   // digits counting mode
    , AFTER_POINT             = 1

const NO_PADDING      = 0           // zero-padding mode
    , PAD_WITH_ZEROES = 1

/*  ------------------------------------------------------------------------ */

// See https://stackoverflow.com/questions/1685680/how-to-avoid-scientific-notation-for-large-numbers-in-javascript for discussion

function numberToString (x) { // avoids scientific notation for too large and too small numbers

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

const decimalToPrecision = (x, roundingMode
                             , numDigits
                             , digitsCountingMode = AFTER_POINT
                             , paddingMode        = NO_PADDING) => { 

/*  TODO: decimalToPrecision (123456.789, -2) === 123500        */ 

    if (numDigits < 0) throw new Error ('negative precision is not yet supported')

/*  Convert to a string (if needed), skip trailing dot (if any)   */

    const str             = numberToString (x)
        , startsWithMinus = str[0] === '-'
        , endsWithDot     = str[str.length - 1] === '.'
        , strStart        = startsWithMinus ? 1 : 0
        , strEnd          = str.length - (endsWithDot ? 1 : 0)
    
/*  Char code constants         */

    const MINUS = 45
        , DOT = 46
        , ZERO = 48
        , FIVE = (ZERO + 5)
        , NINE = (ZERO + 9)

/*  Significant digits positions    */

    let start = -1
      , end   = -1

/*  For -123.4567 the `chars` array will hold 01234567 (leading zero is reserved for rounding cases when 099 → 100)    */

    const chars    = new Int8Array (strEnd - strStart)
          chars[0] = ZERO

/*  Validate & copy digits, find the actual dot position              */

    let dotBefore = chars.length

    for (let i = 1; i <= chars.length; i++) {

        const c = str.charCodeAt (strStart + (i - 1))

        if (c === DOT) {
            dotBefore = i

        } else if ((c < ZERO) || (c > NINE)) {
            throw new Error (`invalid number (contains an illegal character '${str[i - 1]}')`)
            
        } else {
            chars[i - ((dotBefore > i) ? 0 : 1)] = c
            if ((c !== ZERO) && (start < 0)) start = i
        }
    }

/*  Determine the character index up to which the precision will be reduced  */

    const reducePrecisionUntil =                                                            // truncating to 4:
                (((start > dotBefore) && (digitsCountingMode === SIGNIFICANT_DIGITS_ONLY))  // 0.0001234567 
                    ? start                                                                 //          ↑   (SIGNIFICANT_DIGITS_ONLY)
                    : dotBefore) + numDigits                                                // 0.0001234567
                                                                                            //       ↑      (AFTER_POINT)
    
/*  Reset the last significant digit index, as it will change during the rounding/truncation.   */

    end = -1

/*  Perform rounding/truncation per digit, from end to start, by using the following
    algorithm (rounding 999 → 1000, as an example):

        step  =          i=3      i=2      i=1      i=0

        chars =         0999     0999     0900     1000 
        memo  =         ---0     --1-     -1--     0---                     */

    for (let i = chars.length - 1, memo = 0; i >= 0; i--) {

        let c = chars[i]

        if (i !== 0) {
            c += memo

            if (i >= reducePrecisionUntil) {
                c = (roundingMode === ROUND)
                        ? ((c > FIVE) ? (NINE + 1) : ZERO) // single-digit rounding
                        : ZERO                             // "floor" to zero
            }
            if (c > NINE) { c = ZERO; memo = 1; }
            else memo = 0

        } else {
            c = ZERO + memo // leading extra digit (0900 → 1000)
        }

        chars[i] = c

        if (c !== ZERO) {
            if (end < 0) end = i // update the last significant digit index
            start = i            // update the first significant digit index
        }
    }

/*  Correct the significant digits range        */

    if (start >= dotBefore) start = dotBefore - 1 // 0.000(1)234  ---->  (0).0001234                  
    if (end < dotBefore)    end   = dotBefore - 1 // 12(3)000.4   ----> 12300(0).4

    const firstPrecisionDigit = (digitsCountingMode === AFTER_POINT)
                                        ? dotBefore                         // 123.(0)00456
                                        : start                             //   0.000(1)23 or (1)23.00056

        , nSign      = startsWithMinus ? 1 : 0                              // (-)123.456
        , nBeforeDot = nSign + (dotBefore - start)                          // (-123).456
        , nAfterDot  = Math.max (0, end - dotBefore + 1)                    //  -123.(456)

        , actualLength        = (end - start) + 1                           // -(123.456)
        , desiredLength       = (paddingMode === NO_PADDING)
                                    ? actualLength                          // -(123.456)
                                    : (firstPrecisionDigit + numDigits)     // -(123.456    )

        , pad        = (desiredLength - actualLength)                       //  -123.456(    )
        , padStart   = (nBeforeDot + 1 + nAfterDot)                         //  -123.456(←
        , padEnd     = (padStart + pad)                                     //  -123.456    →)
        , isInteger  = (nAfterDot + pad) === 0                              //  -123

/*  Fill the output buffer with characters    */

    const out = new Int8Array (nBeforeDot + (isInteger ? 0 : 1) + nAfterDot + pad)

    let i, j                                                                                      // building -123.456000:
                                                                                                  // ---------------------
    if (startsWithMinus)                                              out[0]          = MINUS     // -     minus sign
    for (i = nSign, j = start;              i < nBeforeDot; i++, j++) out[i]          = chars[j]  // 123   before dot
    if  (!isInteger)                                                  out[nBeforeDot] = DOT       // .     dot
    for (i = nBeforeDot + 1, j = dotBefore; i < padStart;   i++, j++) out[i]          = chars[j]  // 456   after dot
    for (i = padStart;                      i < padEnd;     i++)      out[i]          = ZERO      // 000   padding

/*  Build a string from the output buffer     */

    return String.fromCharCode (...out)
}

/*  ------------------------------------------------------------------------ */

module.exports = {
 
    numberToString,
    decimalToPrecision,

    TRUNCATE,
    ROUND,
    AFTER_POINT,
    SIGNIFICANT_DIGITS_ONLY,
    NO_PADDING,
    PAD_WITH_ZEROES,
}

/*  ------------------------------------------------------------------------ */
