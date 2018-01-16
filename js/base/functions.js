"use strict";

/*  ------------------------------------------------------------------------ */

const { unCamelCase } = require ('./function/string')

const unCamelCasePropertyNames = x => {
                                    for (const k in x)
                                        x[unCamelCase (k)] = x[k] // camel_case_method = camelCaseMethod
                                }

/*  ------------------------------------------------------------------------ */

module.exports = unCamelCasePropertyNames ({

    ...require ('./functions/platform'),
    ...require ('./functions/generic'),
    ...require ('./functions/string'),
    ...require ('./functions/safe'),
    ...require ('./functions/number'),
    ...require ('./functions/encode'),
    ...require ('./functions/crypto'),
    ...require ('./functions/time'),

/*  ------------------------------------------------------------------------ */

    json:   JSON.stringify,
    unjson: JSON.parse,

/*  ------------------------------------------------------------------------ */

    aggregate (bidasks) { // orderbook aggregation helper

        let result = {}
    
        bidasks.forEach (([ price, volume ]) => {
            if (volume > 0)
                result[price] = (result[price] || 0) + volume
        })
    
        return Object.keys (result).map (price => [
            parseFloat (price),
            parseFloat (result[price]),
        ])
    }
})

/*  ------------------------------------------------------------------------ */
