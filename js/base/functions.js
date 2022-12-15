/* eslint-disable */
'use strict';

/*  ------------------------------------------------------------------------ */

const { unCamelCase } = require ('./functions/string')

const unCamelCasePropertyNames = x => {
    for (const k in x) x[unCamelCase (k)] = x[k] // camel_case_method = camelCaseMethod
    return x
}

/*  ------------------------------------------------------------------------ */

module.exports = unCamelCasePropertyNames (Object.assign ({}

    , require ('./functions/platform')
    , require ('./functions/generic')
    , require ('./functions/string')
    , require ('./functions/type')
    , require ('./functions/number')
    , require ('./functions/encode')
    , require ('./functions/crypto')
    , require ('./functions/time')
    , require ('./functions/throttle')
    , require ('./functions/misc')
))

/*  ------------------------------------------------------------------------ */
