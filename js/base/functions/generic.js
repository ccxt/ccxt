"use strict";

/*  ------------------------------------------------------------------------ */

const empty = () => Object.create (null) // empty obj without even a prototype

    , keys = Object.keys

    , values = x => !Array.isArray (x)  // don't copy arrays if they're already arrays!
                        ? Object.values (x)
                        : x

    , index = x => new Set (values (x))

    , extend = (...args) => Object.assign (empty (), ...args) // NB: side-effect free

    , clone = x => Array.isArray (x)
                            ? Array.from (x) // clones arrays
                            : extend (x)     // clones objects

/*  ------------------------------------------------------------------------ */

module.exports = {

      empty
    , keys
    , values
    , extend
    , clone
    , index
    , ordered: x => x // a stub to keep assoc keys in order (in JS it does nothing, it's mostly for Python)   
    , unique:  x => Array.from (index (x))
    
/*  .............................................   */

    , keysort (x, out = empty ()) {
        
        for (const k of keys (x).sort ())
            out[k] = x[k]
        
        return out
    }

/*  .............................................   */

    , indexBy (x, k, out = empty ()) {

        for (const v of values (x))
            if (k in v)
                out[v[k]] = v
    
        return out
    }

/*  .............................................   */

    , groupBy (x, k, out = empty ()) {

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
            if (Array.isArray (v)) flatten (v, out)
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

        const out = clone (x)
    
        for (const k of args) {
    
            if (typeof k === 'string')  // omit (x, 'a', 'b')
                delete out[k]
    
            else if (Array.isArray (k)) // omit (x, ['a', 'b'])
                for (const kk of k)
                    delete out[kk]
        }
        
        return out
    }
         
/*  .............................................   */

    , sum (...xs) {

        const ns = xs.filter (Number.isFinite) // leave only numbers
    
        return (ns.length > 0)
                    ? ns.reduce ((a, b) => a + b, 0)
                    : undefined
    }

/*  .............................................   */

    , deepExtend: function deepExtend (...xs) {

        let out = undefined

        for (const x of xs) {

            if (x && (typeof x === 'object') && !Array.isArray (x)) {

                if (typeof out !== 'object')
                    out = Object.create (null)

                for (const k in x)
                    out[k] = deepExtend (out[k], x[k])

            } else out = x
        }

        return out
    }

/*  ------------------------------------------------------------------------ */

}
