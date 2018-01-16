"use strict";

/*  ------------------------------------------------------------------------ */

const { unCamelCase } = require ('./functions/string')

const unCamelCasePropertyNames = x => {
                                    for (const k in x) x[unCamelCase (k)] = x[k] // camel_case_method = camelCaseMethod
                                    return x
                                }

/*  ------------------------------------------------------------------------ */

module.exports = unCamelCasePropertyNames ({

    ...require ('./functions/platform'),
    ...require ('./functions/generic'),
    ...require ('./functions/string'),
    ...require ('./functions/type'),
    ...require ('./functions/number'),
    ...require ('./functions/encode'),
    ...require ('./functions/crypto'),
    ...require ('./functions/time'),
    ...require ('./functions/throttle'),

/*  .............................................   */

    json:   JSON.stringify,
    unjson: JSON.parse,

/*  .............................................   */

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
})

/*  ------------------------------------------------------------------------ */
