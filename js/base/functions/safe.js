"use strict";

/*  ------------------------------------------------------------------------ */

module.exports = {
    
    safeFloat:   (obj, key, default_ = undefined, n = parseFloat (obj && obj[key]))     => Number.isFinite (n) ? n : default_,
    safeInteger: (obj, key, default_ = undefined, n = parseInt   (obj && obj[key], 10)) => Number.isFinite (n) ? n : default_,
    safeValue:   (obj, key, default_ = undefined, x = obj && obj[key]) => ((x !== undefined) && (x !== null)) ? x : default_,
    safeString:  (obj, key, default_ = undefined) => {

        if (!obj || !(key in obj))
            return default_

        const x = obj[key]

        if (!x && (typeof x !== 'string') && !Number.isFinite (x))
            return default_

        return x.toString ()
    }
}

/*  ------------------------------------------------------------------------ */
