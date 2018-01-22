'use strict';

/*  ------------------------------------------------------------------------ */

module.exports = {

    aggregate (bidasks) {

        let result = {}

        for (const [price, volume] of bidasks) {
            if (volume > 0)
                result[price] = (result[price] || 0) + volume
        }

        return Object.keys (result)
                    .map (price => [parseFloat (price),
                                    parseFloat (result[price])])
    }
}

/*  ------------------------------------------------------------------------ */
