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

export * from './functions/platform';

export * from './functions/generic';

export * from './functions/string';

export * from './functions/type';

export * from './functions/number';

export * from './functions/encode';

export * from './functions/crypto';

export * from './functions/time';

export * from './functions/throttle';

export * from './functions/misc';

/*  ------------------------------------------------------------------------ */
