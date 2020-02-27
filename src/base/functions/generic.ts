/*  ------------------------------------------------------------------------ */

import { isObject, isNumber, isDictionary, isArray } from './type'

/*  ------------------------------------------------------------------------ */

export const keys = Object.keys

    , values: <T>(x: Collection<T>) => T[] =
        (x) => !isArray (x)  // don't copy arrays if they're already arrays!
            ? Object.values (x)
            : x

    , index = (x: any) => new Set (values (x))

    , extend = (...args: any[]) => Object.assign ({}, ...args) // NB: side-effect free

    , clone = (x: any) => isArray (x)
                            ? Array.from (x) // clones arrays
                            : extend (x)     // clones objects

/*  ------------------------------------------------------------------------ */

export const

    ordered = <T>(x: T) => x // a stub to keep assoc keys in order (in JS it does nothing, it's mostly for Python)

    , unique = (x: any) => Array.from (index (x))

    /*  .............................................   */

    , inArray = <T>(needle: T, haystack: T[]) => haystack.includes (needle)

    , toArray = (object: object) => Object.values (object)

    , isEmpty = (object: object) => {
        if (!object)
            return true;
        return (Array.isArray (object) ? object : Object.keys (object)).length < 1;
    }

/*  .............................................   */

    , keysort = (x: any, out: any = {}) => {

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

    , indexBy = <T>(x: Collection<T>, k: keyof T, out: Dictionary<T> = {}) => {

        for (const v of values (x))
            if (k in v)
                out[v[k] as any] = v

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

    , groupBy = <T>(x: Collection<T>, k: keyof T, out: any = {}) => {

        for (const v of values (x)) {
            if (k in v) {
                const p = v[k]
                out[p] = out[p] ?? []
                out[p].push (v)
            }
        }
        return out as Dictionary<T[]>
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

    , filterBy = <T>(x: Collection<T>, k: keyof T, value: T[keyof T], out: T[] = []) => {

        for (const v of values (x))
            if (v[k] === value)
                out.push (v)

        return out
    }

/*  .............................................   */

    , sortBy = (array: any[], // NB: MUTATES ARRAY!
                key: string | number,
                descending = false,
                direction = descending ? -1 : 1) => array.sort ((a, b) =>
                                                               ((a[key] < b[key]) ? -direction :
                                                               ((a[key] > b[key]) ?  direction : 0)))

/*  .............................................   */

    , flatten = <T>(x: T[][] | T[], out: T[] = []) => {

        for (const v of x) {
            if (isArray (v)) flatten (v, out)
            else out.push (v)
        }

        return out
    }

/*  .............................................   */

    , pluck = (x: Dictionary<any>, k: string) => values (x)
                                    .filter (v => k in v)
                                    .map (v => v[k])

/*  .............................................   */

    , omit = (x: any, ...args: any[]) => {

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

    , sum = (...xs: any[]) => {

        const ns = xs.filter (isNumber) // leave only numbers

        return (ns.length > 0)
                    ? ns.reduce ((a, b) => a + b, 0)
                    : undefined
    }

/*  .............................................   */

    , deepExtend = (...xs: any[]) => {

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
