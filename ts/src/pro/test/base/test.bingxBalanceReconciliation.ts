import assert from 'assert';
import bingx from '../../bingx.js';

// Native JS test: control REST completion explicitly, without network access or sleeps.
function deferred () {
    let resolve!: (value?: any) => void;
    const promise = new Promise<any> ((resolvePromise) => {
        resolve = resolvePromise;
    });
    return { promise, resolve };
}

function createExchange (ExchangeClass: typeof bingx) {
    const exchange: any = new ExchangeClass ();
    exchange.markets = {};
    exchange.options['listenKey'] = 'offline-balance-test';
    exchange.authenticate = async () => undefined;
    exchange.fetch = async () => {
        throw new Error ('BingX balance regression must not access the network');
    };
    return exchange;
}

function frame (used: string | undefined = undefined) {
    const balance: any = { 'a': 'USDT', 'wb': '60', 'cw': '60', 'bc': '10' };
    if (used !== undefined) {
        balance['lk'] = used;
    }
    return { 'e': 'ACCOUNT_UPDATE', 'E': 1721356200000, 'a': { 'B': [ balance ] } };
}

function snapshot (exchange: any) {
    return exchange.safeBalance ({
        'info': { 'source': 'rest' },
        'timestamp': 1721356199000,
        'datetime': '2024-07-19T02:29:59.000Z',
        'USDT': { 'free': '40', 'used': '10', 'total': '50' },
        'BTC': { 'free': '1', 'used': '0', 'total': '1' },
    });
}

function assertCurrency (balance: any, code: string, free: any, used: any, total: any) {
    const expected: Record<string, any> = { free, used, total };
    for (const key of [ 'free', 'used', 'total' ]) {
        assert (Object.prototype.hasOwnProperty.call (balance[code], key), code + '.' + key + ' must be explicit');
        assert (Object.prototype.hasOwnProperty.call (balance[key], code), key + '.' + code + ' must be explicit');
        assert.strictEqual (balance[code][key], expected[key], code + '.' + key);
        assert.strictEqual (balance[key][code], expected[key], key + '.' + code);
    }
}

async function assertSnapshotOrder (ExchangeClass: typeof bingx, type: string, awaitSnapshot: boolean, used: string | undefined) {
    const exchange = createExchange (ExchangeClass);
    const rest = deferred ();
    const started = deferred ();
    let snapshotTask: Promise<any> | undefined = undefined;
    let watchCalls = 0;
    exchange.fetchBalance = async (params: any) => {
        assert.strictEqual (params['type'], type);
        started.resolve ();
        return await rest.promise;
    };
    exchange.spawn = (method: any, ...args: any[]) => {
        snapshotTask = method.apply (exchange, args);
    };
    exchange.watch = async (url: string) => {
        watchCalls++;
        if (awaitSnapshot) {
            assertCurrency (exchange.balance[type], 'USDT', 40, 10, 50);
        }
        exchange.handleBalance (exchange.client (url), frame (used));
        return exchange.balance[type];
    };
    try {
        const watching = exchange.watchBalance ({ 'type': type, 'fetchBalanceSnapshot': true, 'awaitBalanceSnapshot': awaitSnapshot });
        await started.promise;
        const expectedUsed = (used === undefined) ? undefined : Number (used);
        const expectedFree = (used === undefined) ? undefined : 60 - Number (used);
        if (awaitSnapshot) {
            assert.strictEqual (watchCalls, 0, 'watch must wait for the requested snapshot');
        } else {
            const first = await watching;
            assertCurrency (first, 'USDT', expectedFree, expectedUsed, 60);
        }
        rest.resolve (snapshot (exchange));
        await snapshotTask;
        await watching;
        assert.strictEqual (watchCalls, 1);
        assertCurrency (exchange.balance[type], 'USDT', expectedFree, expectedUsed, 60);
        assertCurrency (exchange.balance[type], 'BTC', 1, 0, 1);
        assert.strictEqual (exchange.balance[type]['timestamp'], 1721356200000, 'older REST metadata must not replace the WS timestamp');
        assert.strictEqual (exchange.balance[type]['info'][0]['wb'], '60');
        // A subsequent frame without lk must not reuse an old snapshot or WS used value.
        const url = exchange.urls['api']['ws'][(type === 'spot') ? 'spot' : 'linear'] + '?listenKey=offline-balance-test';
        exchange.handleBalance (exchange.client (url), frame ());
        assertCurrency (exchange.balance[type], 'USDT', undefined, undefined, 60);
        assertCurrency (exchange.balance[type], 'BTC', 1, 0, 1);
    } finally {
        rest.resolve (snapshot (exchange));
        if (snapshotTask !== undefined) {
            await snapshotTask;
        }
        await exchange.close ();
    }
}

async function assertNoSnapshot (ExchangeClass: typeof bingx, type: string, used: string | undefined) {
    const exchange = createExchange (ExchangeClass);
    exchange.spawn = () => {
        throw new Error ('fetchBalanceSnapshot=false must not spawn a REST snapshot');
    };
    exchange.fetchBalance = async () => {
        throw new Error ('fetchBalanceSnapshot=false must not fetch a REST snapshot');
    };
    exchange.watch = async (url: string) => {
        exchange.handleBalance (exchange.client (url), frame (used));
        return exchange.balance[type];
    };
    try {
        const result = await exchange.watchBalance ({ 'type': type, 'fetchBalanceSnapshot': false, 'awaitBalanceSnapshot': true });
        const expectedUsed = (used === undefined) ? undefined : Number (used);
        const expectedFree = (used === undefined) ? undefined : 60 - Number (used);
        assertCurrency (result, 'USDT', expectedFree, expectedUsed, 60);
    } finally {
        await exchange.close ();
    }
}

export async function assertBingxBalanceReconciliation (ExchangeClass: typeof bingx = bingx) {
    for (const type of [ 'spot', 'swap' ]) {
        for (const used of [ undefined, '0', '5' ]) {
            await assertNoSnapshot (ExchangeClass, type, used);
        }
        for (const awaitSnapshot of [ true, false ]) {
            for (const used of [ undefined, '5' ]) {
                await assertSnapshotOrder (ExchangeClass, type, awaitSnapshot, used);
            }
        }
    }
}

async function testBingxBalanceReconciliation () {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
        await Promise.race ([
            assertBingxBalanceReconciliation (),
            new Promise ((resolve, reject) => {
                timeout = setTimeout (() => reject (new Error ('BingX balance regression timed out')), 10000);
            }),
        ]);
    } finally {
        clearTimeout (timeout);
    }
}

export default testBingxBalanceReconciliation;
