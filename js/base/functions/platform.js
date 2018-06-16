"use strict";

/*  ------------------------------------------------------------------------ */

module.exports = {

    isNode: typeof module !== 'undefined' && typeof module.exports !== 'undefined'

    , isWindows: (typeof process !== 'undefined') ? process.platform === "win32" : false
}

/*  ------------------------------------------------------------------------ */
