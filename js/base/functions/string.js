"use strict";

/*  ------------------------------------------------------------------------ */

module.exports =
    
    { uuid: a => a ? (a ^ Math.random () * 16 >> a / 4).toString (16)
                   : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace (/[018]/g, uuid)
        
    , unCamelCase: s => s.replace (/[a-z][A-Z]/g, x => x[0] + '_' + x[1].toLowerCase ()) // hasFetchOHLCV   → has_fetch_oHLCV
                         .replace (/[a-z][A-Z]/g, x => x[0].toUpperCase () + x[1])       // has_fetch_oHLCV → has_fetch_OHLCV

    , capitalize: s => s.length
                            ? (s.charAt (0).toUpperCase () + s.slice (1))
                            : s
    }

/*  ------------------------------------------------------------------------ */
