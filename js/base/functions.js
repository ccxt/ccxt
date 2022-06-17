/*  ------------------------------------------------------------------------ */

// const { unCamelCase } = require ('./functions/string')

// const unCamelCasePropertyNames = x => {
//     for (const k in x) x[unCamelCase (k)] = x[k] // camel_case_method = camelCaseMethod
//     return x
// }

/*  ------------------------------------------------------------------------ */

// module.exports = unCamelCasePropertyNames (Object.assign ({}

//     , require ('./functions/platform')
//     , require ('./functions/generic')
//     , require ('./functions/string')
//     , require ('./functions/type')
//     , require ('./functions/number')
//     , require ('./functions/encode')
//     , require ('./functions/crypto')
//     , require ('./functions/time')
//     , require ('./functions/throttle')
//     , require ('./functions/misc')
// ))

export * from './functions/platform.js';

export * from './functions/generic.js';

export * from './functions/string.js';

export * from './functions/type.js';

export * from './functions/number.js';

export * from './functions/encode.js';

export * from './functions/crypto.js';

export * from './functions/time.js';

export * from './functions/throttle.js';

export * from './functions/misc.js';

/*  ------------------------------------------------------------------------ */
