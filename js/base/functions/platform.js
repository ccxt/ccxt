"use strict";

/*  ------------------------------------------------------------------------ */

module.exports = {

    isNode: (typeof window === 'undefined') &&
          !((typeof WorkerGlobalScope !== 'undefined') && (self instanceof WorkerGlobalScope))

    , isWindows: (typeof process !== 'undefined') ? process.platform === "win32" : false
}

/*  ------------------------------------------------------------------------ */
