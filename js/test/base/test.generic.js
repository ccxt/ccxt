'use strict'

/*  ------------------------------------------------------------------------ */

global.log = require ('ololog') // for easier debugging

/*  ------------------------------------------------------------------------ */

const ccxt     = require ('../../ccxt.js')
    , assert   = require ('assert')
    , ansi     = require ('ansicolor').nice
    , chai     = require ('chai').should ()

/*  ------------------------------------------------------------------------ */

describe ('base/generic.js works', () => {

    it ('deepExtend() works', () => {

        let count = 0;

        const values = [{
            a: 1,
            b: 2,
            d: {
                a: 1,
                b: [],
                c: { test1: 123, test2: 321 }},
            f: 5,
            g: 123,
            i: 321,
            j: [1, 2],
        },
        {
            b: 3,
            c: 5,
            d: {
                b: { first: 'one', second: 'two' },
                c: { test2: 222 }},
            e: { one: 1, two: 2 },
            f: [{ 'foo': 'bar' }],
            g: (void 0),
            h: /abc/g,
            i: null,
            j: [3, 4]
        }]

        const extended = ccxt.deepExtend (...values)
        assert.deepEqual ({
            a: 1,
            b: 3,
            d: {
                a: 1,
                b: { first: 'one', second: 'two' },
                c: { test1: 123, test2: 222 }
            },
            f: [{ 'foo': 'bar' }],
            g: undefined,
            c: 5,
            e: { one: 1, two: 2 },
            h: /abc/g,
            i: null,
            j: [3, 4]
        }, extended)

        assert.deepEqual (ccxt.deepExtend (undefined, undefined, {'foo': 'bar' }), { 'foo': 'bar' })
    })

    it ('groupBy() works', () => {

        const array = [
            { 'foo': 'a' },
            { 'foo': 'b' },
            { 'foo': 'c' },
            { 'foo': 'b' },
            { 'foo': 'c' },
            { 'foo': 'c' },
        ]

        assert.deepEqual (ccxt.groupBy (array, 'foo'), {
            'a': [ { 'foo': 'a' } ],
            'b': [ { 'foo': 'b' }, { 'foo': 'b' } ],
            'c': [ { 'foo': 'c' }, { 'foo': 'c' }, { 'foo': 'c' } ],
        })
    })

    it ('filterBy() works', () => {

        const array = [
            { 'foo': 'a' },
            { 'foo': undefined },
            { 'foo': 'b' },
            { },
            { 'foo': 'a', 'bar': 'b' },
            { 'foo': 'c' },
            { 'foo': 'd' },
            { 'foo': 'b' },
            { 'foo': 'c' },
            { 'foo': 'c' },
        ]

        assert.deepEqual (ccxt.filterBy (array, 'foo', 'a'), [
            { 'foo': 'a' },
            { 'foo': 'a', 'bar': 'b' },
        ])
    })

    it ('omit works', () => {

        assert.deepEqual (ccxt.omit ({ }, 'foo'), {})
        assert.deepEqual (ccxt.omit ({ foo: 2 }, 'foo'), { })
        assert.deepEqual (ccxt.omit ({ foo: 2, bar: 3 }, 'foo'), { bar: 3 })
        assert.deepEqual (ccxt.omit ({ foo: 2, bar: 3 }, ['foo']), { bar: 3 })
        assert.deepEqual (ccxt.omit ({ foo: 2, bar: 3 }), { foo: 2, bar: 3 })
        assert.deepEqual (ccxt.omit ({ foo: 2, bar: 3 }, 'foo', 'bar'), {})
        assert.deepEqual (ccxt.omit ({ foo: 2, bar: 3 }, ['foo'], 'bar'), {})
        assert.deepEqual (ccxt.omit ({ 5: 2, bar: 3 }, [5]), { bar: 3 })
        assert.deepEqual (ccxt.omit ({ 5: 2, bar: 3 }, 5), { bar: 3 })
    })

    it ('sum works', () => {

        assert (ccxt.sum () === undefined)

        ccxt.sum (2).should.equal (2)
        ccxt.sum (2,30,400).should.equal (432)
        ccxt.sum (2,undefined,[88],30,'7',400,null).should.equal (432)
    })

    it ('sortBy works', () => {

        const arr = [{ x: 5 }, { x: 2 }, { x: 4 }, { x: 0 },{ x: 1 },{ x: 3 }]
        ccxt.sortBy (arr, 'x')
        
        assert.deepEqual (arr
          [ { x: 0 },
            { x: 1 },
            { x: 2 },
            { x: 3 },
            { x: 4 },
            { x: 5 }  ])

        assert.deepEqual (ccxt.sortBy (arr, 'x', true),
          [ { x: 5 },
            { x: 4 },
            { x: 3 },
            { x: 2 },
            { x: 1 },
            { x: 0 }  ])

        assert.deepEqual (ccxt.sortBy ([], 'x'), [])
    })
})