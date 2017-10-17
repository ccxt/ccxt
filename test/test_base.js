/*  ------------------------------------------------------------------------ */

const ccxt     = require ('../ccxt')
    , assert   = require ('assert')
    , log      = require ('ololog')
    , ansi     = require ('ansicolor').nice;

/*  ------------------------------------------------------------------------ */

describe ('ccxt base code', () => {

    it ('sleep() is robust', async () => {

        const delay = 10

        for (let i = 0; i < 30; i++) {

            const before = Date.now ()
            await ccxt.sleep (delay)
            const now = Date.now ()

            const elapsed = now - before
            assert (elapsed >= (delay - 1)) // not too fast
            assert (elapsed < (delay * 2)) // but not too slow either...
        }
    })

    it ('calculateFee() works', () => {

        const price  = 100.00
        const amount = 10.00
        const taker  = 0.0025
        const maker  = 0.0010
        const fees   = { taker, maker }
        const market = {
            'id':     'foobar',
            'symbol': 'FOO/BAR',
            'base':   'FOO',
            'quote':  'BAR',
            'taker':   taker,
            'maker':   maker,
            'precision': {
                'amount': 8,
                'price': 8,
            },
        }

        const exchange = new ccxt.Exchange ({
            'id': 'mock',
            'markets': {
                'FOO/BAR': market,
            },
        })

        Object.keys (fees).forEach (takerOrMaker => {

            const result = exchange.calculateFee (market['symbol'], 'limit', 'sell', amount, price, takerOrMaker, {})

            assert.deepEqual (result, {
                'currency': 'BAR',
                'rate': fees[takerOrMaker],
                'cost': fees[takerOrMaker] * amount * price,
            })
        })
    })

    it ('rate limiting works', async () => {

        const calls = []
        const rateLimit = 100
        const exchange = new ccxt.Exchange ({

            id: 'mock',
            rateLimit,
            enableRateLimit: true,

            async executeRestRequest (...args) { calls.push ({ when: Date.now (), path: args[0], args }) }
        })

        await exchange.fetch ('foo')
        await exchange.fetch ('bar')
        await exchange.fetch ('baz')

        await Promise.all ([
            exchange.fetch ('qux'),
            exchange.fetch ('zap'),
            exchange.fetch ('lol')
        ])

        assert.deepEqual (calls.map (x => x.path), ['foo', 'bar', 'baz', 'qux', 'zap', 'lol'])

        calls.reduce ((prevTime, call) => {
            // log ('delta T:', call.when - prevTime)
            assert ((call.when - prevTime) >= (rateLimit - 1))
            return call.when
        }, 0)
    })

    it ('getCurrencyUsedOnOpenOrders() works', () => {


        const calls = []
        const rateLimit = 100
        const exchange = new ccxt.Exchange ({
            'orders': [
                { status: 'open',   symbol: 'ETH/BTC', side: 'sell', price: 200.0, amount: 20.0 },
                { status: 'open',   symbol: 'ETH/BTC', side: 'buy',  price: 200.0, amount: 20.0 },
                { status: 'open',   symbol: 'ETH/BTC', side: 'sell', price: 200.0, amount: 20.0 },
                { status: 'closed', symbol: 'BTC/USD', side: 'sell', price: 10.0, amount: 10.0 },
                { status: 'open',   symbol: 'BTC/USD', side: 'buy',  price: 10.0, amount: 10.0 },
                { status: 'open',   symbol: 'BTC/USD', side: 'sell', price: 10.0, amount: 10.0 },
            ],
            'markets': {
                'ETH/BTC': { id: 'ETH/BTC', symbol: 'ETH/BTC', base: 'ETH', quote: 'BTC' },
                'BTC/USD': { id: 'BTC/USD', symbol: 'BTC/USD', base: 'BTC', quote: 'USD' },
            },
        })

        assert.equal (exchange.getCurrencyUsedOnOpenOrders ('LTC'), 0)
        assert.equal (exchange.getCurrencyUsedOnOpenOrders ('ETH'), 40)
        assert.equal (exchange.getCurrencyUsedOnOpenOrders ('USD'), 100)
        assert.equal (exchange.getCurrencyUsedOnOpenOrders ('BTC'), 4010)

    })

    it ('aggregate() works', () => {

        const bids = [
            [ 789.1, 123.0 ],
            [ 789.100, 123.0 ],
            [ 123.0, 456.0 ],
            [ 789.0, 123.0 ],
            [ 789.10, 123.0 ],
        ]

        const asks = [
            [ 123.0, 456.0 ],
            [ 789.0, 123.0 ],
            [ 789.10, 123.0 ],
        ]

        assert.deepEqual (ccxt.aggregate (bids.sort ()), [
            [ 123.0, 456.0 ],
            [ 789.0, 123.0 ],
            [ 789.1, 369.0 ],
        ])

        assert.deepEqual (ccxt.aggregate (asks.sort ()), [
            [ 123.0, 456.0 ],
            [ 789.0, 123.0 ],
            [ 789.10, 123.0 ],
        ])

        assert.deepEqual (ccxt.aggregate ([]), [])
    })

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

    it ('truncate() works', () => {

        assert.equal (ccxt.truncate (0, 0), 0)
        assert.equal (ccxt.truncate (-17.56,   2), -17.56)
        assert.equal (ccxt.truncate ( 17.56,   2),  17.56)
        assert.equal (ccxt.truncate (-17.569,  2), -17.56)
        assert.equal (ccxt.truncate ( 17.569,  2),  17.56)
        assert.equal (ccxt.truncate (49.9999,  4), 49.9999)
        assert.equal (ccxt.truncate (49.99999, 4), 49.9999)
    })

    it.only ('parseBalance() works', () => {

        const exchange = new ccxt.Exchange ({
            'markets': {
                'ETH/BTC': { 'id': 'ETH/BTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', }
            }
        })

        const input = {
            'ETH': { 'free': 10, 'used': 10, 'total': 20 },
            'ZEC': { 'free': 0, 'used': 0, 'total': 0 },
        }

        const expected = {
            'ETH': { 'free': 10, 'used': 10, 'total': 20 },
            'ZEC': { 'free': 0, 'used': 0, 'total': 0 },
            'free': {
                'ETH': 10,
                'ZEC': 0,
            },
            'used': {
                'ETH': 10,
                'ZEC': 0,
            },
            'total': {
                'ETH': 20,
                'ZEC': 0,
            },
        }

        const actual = exchange.parseBalance (input)

        log ('Actual:', '\t', actual)

        log ('Expected:', '\t', expected)

        assert.deepEqual (actual, expected)
    })
})

/*  ------------------------------------------------------------------------ */
