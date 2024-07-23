
// AUTO_TRANSPILE_ENABLED

import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testGroupBy() {

    const sampleArray = [
        { 'foo': 'a' },
        { 'foo': 'b' },
        { 'foo': 'c' },
        { 'foo': 'b' },
        { 'foo': 'c' },
        { 'foo': 'c' },
    ]

    deepEqual (groupBy (sampleArray, 'foo'), {
        'a': [ { 'foo': 'a' } ],
        'b': [ { 'foo': 'b' }, { 'foo': 'b' } ],
        'c': [ { 'foo': 'c' }, { 'foo': 'c' }, { 'foo': 'c' } ],
    })
}

function testFilterBy() {

    const sampleArray = [
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

    deepEqual (filterBy (sampleArray, 'foo', 'a'), [
        { 'foo': 'a' },
        { 'foo': 'a', 'bar': 'b' },
    ])
}

function testOmit() {

    deepEqual (omit ({ }, 'foo'), {})
    deepEqual (omit ({ foo: 2 }, 'foo'), { })
    deepEqual (omit ({ foo: 2, bar: 3 }, 'foo'), { bar: 3 })
    deepEqual (omit ({ foo: 2, bar: 3 }, ['foo']), { bar: 3 })
    deepEqual (omit ({ foo: 2, bar: 3 }), { foo: 2, bar: 3 })
    deepEqual (omit ({ foo: 2, bar: 3 }, 'foo', 'bar'), {})
    deepEqual (omit ({ foo: 2, bar: 3 }, ['foo'], 'bar'), {})
    deepEqual (omit ({ 5: 2, bar: 3 }, [ 5 ]), { bar: 3 })
    deepEqual (omit ({ 5: 2, bar: 3 }, 5), { bar: 3 })
}

function testSum() {

    equal (undefined, sum ())
    equal (2,   sum (2))
    equal (432, sum (2, 30, 400))
    equal (432, sum (2, undefined, [ 88 ], 30, '7', 400, null))
}

function testSortBy() {

    const arr = [{ 'x': 5 }, { 'x': 2 }, { 'x': 4 }, { 'x': 0 }, { 'x': 1 }, { 'x': 3 }]
    sortBy (arr, 'x')

    deepEqual (arr, [
        { 'x': 0 },
        { 'x': 1 },
        { 'x': 2 },
        { 'x': 3 },
        { 'x': 4 },
        { 'x': 5 },
    ])

    deepEqual (sortBy (arr, 'x', true), [
        { 'x': 5 },
        { 'x': 4 },
        { 'x': 3 },
        { 'x': 2 },
        { 'x': 1 },
        { 'x': 0 },
    ])

    deepEqual (sortBy ([], 'x'), [])
}

function testGeneric() {
	testDeepExtend()
	testGroupBy()
	testFilterBy()
	testOmit()
	testSum()
	testSortBy()
}

export default testGeneric;
