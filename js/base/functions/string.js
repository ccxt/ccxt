"use strict";

/*  ------------------------------------------------------------------------ */

const uuid = a => a ? (a ^ Math.random () * 16 >> a / 4).toString (16)
                    : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace (/[018]/g, uuid)

module.exports =

    { uuid

      // hasFetchOHLCV → has_fetch_ohlcv; parseHTTPResponse → parse_http_response
    , unCamelCase: s => s.match (/^[A-Z0-9_]+$/) ? s : (s.replace (/[a-z0-9][A-Z]/g, x => x[0] + '_' + x[1]).replace(/[A-Z0-9][A-Z0-9][a-z]/g, x => x[0] + '_' + x[1] + x[2]).toLowerCase ())

    , capitalize: s => s.length
                            ? (s.charAt (0).toUpperCase () + s.slice (1))
                            : s
    }

/*  ------------------------------------------------------------------------ */
