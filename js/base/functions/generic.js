"use strict";

/*  ------------------------------------------------------------------------ */

const { isObject, isNumber, isDictionary, isArray } = require ('./type')

/*  ------------------------------------------------------------------------ */

const keys = Object.keys

    , values = x => !isArray (x)  // don't copy arrays if they're already arrays!
                        ? Object.values (x)
                        : x

    , index = x => new Set (values (x))

    , extend = (...args) => Object.assign ({}, ...args) // NB: side-effect free

    , clone = x => isArray (x)
                        ? Array.from (x) // clones arrays
                        : extend (x)     // clones objects

/*  ------------------------------------------------------------------------ */

module.exports =

    { keys
    , values
    , extend
    , clone
    , index
    , ordered: x => x // a stub to keep assoc keys in order (in JS it does nothing, it's mostly for Python)
    , unique:  x => Array.from (index (x))

    /*  .............................................   */

    , inArray (needle, haystack) {

        return haystack.includes (needle)
    }

    , toArray (object) {

        return Object.values (object)
    }

    , isEmpty (object) {
        if (!object)
            return true;
        return (Array.isArray (object) ? object : Object.keys (object)).length < 1;
    }

/*  .............................................   */

    , keysort (x, out = {}) {

        for (const k of keys (x).sort ())
            out[k] = x[k]

        return out
    }

/*  .............................................   */

    /*
       Accepts a map/array of objects and a key name to be used as an index:
       array = [
          { someKey: 'value1', anotherKey: 'anotherValue1' },
          { someKey: 'value2', anotherKey: 'anotherValue2' },
          { someKey: 'value3', anotherKey: 'anotherValue3' },
       ]
       key = 'someKey'

       Returns a map:
      {
          value1: { someKey: 'value1', anotherKey: 'anotherValue1' },
          value2: { someKey: 'value2', anotherKey: 'anotherValue2' },
          value3: { someKey: 'value3', anotherKey: 'anotherValue3' },
      }
    */

    , indexBy (x, k, out = {}) {

        for (const v of values (x))
            if (k in v)
                out[v[k]] = v

        return out
    }

/*  .............................................   */

    /*
       Accepts a map/array of objects and a key name to be used as a grouping parameter:
       array = [
          { someKey: 'value1', anotherKey: 'anotherValue1' },
          { someKey: 'value1', anotherKey: 'anotherValue2' },
          { someKey: 'value3', anotherKey: 'anotherValue3' },
       ]
       key = 'someKey'

       Returns a map:
      {
          value1: [
            { someKey: 'value1', anotherKey: 'anotherValue1' },
            { someKey: 'value1', anotherKey: 'anotherValue2' },
          ]
          value3: [
            { someKey: 'value3', anotherKey: 'anotherValue3' }
          ],
      }
    */

    , groupBy (x, k, out = {}) {

        for (const v of values (x)) {
            if (k in v) {
                const p = v[k]
                out[p] = out[p] || []
                out[p].push (v)
            }
        }
        return out
    }

/*  .............................................   */

    /*
       Accepts a map/array of objects, a key name and a key value to be used as a filter:
       array = [
          { someKey: 'value1', anotherKey: 'anotherValue1' },
          { someKey: 'value2', anotherKey: 'anotherValue2' },
          { someKey: 'value3', anotherKey: 'anotherValue3' },
       ]
       key = 'someKey'
       value = 'value1'

       Returns an array:
      [
          value1: { someKey: 'value1', anotherKey: 'anotherValue1' },
      ]
    */

    , filterBy (x, k, value = undefined, out = []) {

        for (const v of values (x))
            if (v[k] === value)
                out.push (v)

        return out
    }

/*  .............................................   */

    , sortBy: (array, // NB: MUTATES ARRAY!
               key,
               descending = false,
               direction  = descending ? -1 : 1) => array.sort ((a, b) =>
                                                                ((a[key] < b[key]) ? -direction :
                                                                ((a[key] > b[key]) ?  direction : 0)))

/*  .............................................   */

    , flatten: function flatten (x, out = []) {

        for (const v of x) {
            if (isArray (v)) flatten (v, out)
            else out.push (v)
        }

        return out
    }

/*  .............................................   */

    , pluck: (x, k) => values (x)
                        .filter (v => k in v)
                        .map (v => v[k])

/*  .............................................   */

    , omit (x, ...args) {

        if (!Array.isArray (x)) {

            const out = clone (x)

            for (const k of args) {

                if (isArray (k)) { // omit (x, ['a', 'b'])

                    for (const kk of k) {
                        delete out[kk]
                    }
                }

                else delete out[k] // omit (x, 'a', 'b')
            }

            return out
        }
        
        return x
    }

/*  .............................................   */

    , sum (...xs) {

        const ns = xs.filter (isNumber) // leave only numbers

        return (ns.length > 0)
                    ? ns.reduce ((a, b) => a + b, 0)
                    : undefined
    }

/*  .............................................   */

    , deepExtend: function deepExtend (...xs) {

        let out = undefined

        for (const x of xs) {

            if (isDictionary (x)) {

                if (!isObject (out))
                    out = {}

                for (const k in x)
                    out[k] = deepExtend (out[k], x[k])

            } else out = x
        }

        return out
    }

/*  ------------------------------------------------------------------------ */

}
