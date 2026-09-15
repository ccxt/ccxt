// NO_AUTO_TRANSPILE
import assert from 'assert';
import bybit from '../../bybit.js';
import Client from '../../../base/ws/Client.js';

// native ts test, intentionally not transpiled: exercises bybit.watchTopics
// filtering of already-subscribed topics and handleErrorMessage rollback
// (https://github.com/ccxt/ccxt/pull/30439)

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

function createHarness () {
    const url = 'wss://localhost/bybit-watchtopics';
    const exchange = new bybit ({
        'enableRateLimit': false,
    });
    const sent: any[] = [];
    const noop = () => {};
    const client = new Client (url, noop, noop, noop, noop, {});
    client.connect = () => {
        if (!client.isConnected) {
            client.isConnected = true;
            (client.connected as any).resolve (url);
        }
        return client.connected;
    };
    client.send = async (message: any) => {
        sent.push (message);
        return message;
    };
    exchange.clients = {};
    exchange.clients[url] = client;
    return { 'exchange': exchange, 'client': client, 'sent': sent, 'url': url };
}

function lastArgs (sent: any[]) {
    assert (sent.length > 0, 'expected a subscribe payload to have been sent');
    return sent[sent.length - 1]['args'];
}

async function testWsBybitWatchTopics () {
    // grow-list filter: 1:1 topics/hashes, a later call must send only the
    // newly added topic rather than repeating already-subscribed ones
    let harness = createHarness ();
    let exchange = harness.exchange;
    let client = harness.client;
    let sent = harness.sent;
    let url = harness.url;
    const growFirst = exchange.watchTopics (url, [ 'hashA', 'hashB' ], [ 'topicA', 'topicB' ]);
    growFirst.catch (() => {});
    await sleep (0);
    assert.deepStrictEqual (lastArgs (sent), [ 'topicA', 'topicB' ], 'first 1:1 subscribe must send every new topic');
    const growSecond = exchange.watchTopics (url, [ 'hashA', 'hashB', 'hashC' ], [ 'topicA', 'topicB', 'topicC' ]);
    growSecond.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 2, 'growing the 1:1 list must send a second subscribe');
    assert.deepStrictEqual (lastArgs (sent), [ 'topicC' ], 'growing the 1:1 list must send only the new topic');
    client.reject (new Error ('cleanup'));

    // fully-subscribed no-op: an identical second call must not send
    harness = createHarness ();
    exchange = harness.exchange;
    client = harness.client;
    sent = harness.sent;
    url = harness.url;
    const noopFirst = exchange.watchTopics (url, [ 'hashA', 'hashB' ], [ 'topicA', 'topicB' ]);
    noopFirst.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 1, 'first identical-call subscribe must send');
    const noopSecond = exchange.watchTopics (url, [ 'hashA', 'hashB' ], [ 'topicA', 'topicB' ]);
    noopSecond.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 1, 'identical second call must not send another subscribe');
    client.reject (new Error ('cleanup'));

    // reject rollback: a success:false reply with matching req_id must
    // delete optimistic subscriptions and reject the waiting hashes
    harness = createHarness ();
    exchange = harness.exchange;
    client = harness.client;
    sent = harness.sent;
    url = harness.url;
    const pendingReject = exchange.watchTopics (url, [ 'hashX' ], [ 'topicX' ]);
    let rejectError: any = undefined;
    pendingReject.catch ((e: any) => {
        rejectError = e;
    });
    await sleep (0);
    assert ('hashX' in client.subscriptions, 'optimistic subscription must be recorded before the reply');
    const reqId = sent[0]['req_id'];
    const subscription = client.subscriptions['hashX'];
    assert.equal (subscription['id'], reqId, 'optimistic subscription must carry the request id');
    const handled = exchange.handleErrorMessage (client, {
        'success': false,
        'ret_msg': 'already subscribed',
        'req_id': reqId,
    });
    assert.equal (handled, true, 'handleErrorMessage must consume the error reply');
    assert (!('hashX' in client.subscriptions), 'optimistic subscription must be deleted on reject');
    await sleep (0);
    assert (rejectError !== undefined, 'watchTopics future must reject on a matching req_id error');

    // mismatched topic/hash (watchOrders spot): after recording topics on
    // the subscription object, a later call with a new hash and overlapping
    // topics must not resend already-recorded topics
    harness = createHarness ();
    exchange = harness.exchange;
    client = harness.client;
    sent = harness.sent;
    url = harness.url;
    const mismatchFirst = exchange.watchTopics (url, [ 'orders' ], [ 'order', 'stopOrder' ]);
    mismatchFirst.catch (() => {});
    await sleep (0);
    assert.deepStrictEqual (lastArgs (sent), [ 'order', 'stopOrder' ], 'watchOrders spot must subscribe both topics');
    assert.deepStrictEqual (client.subscriptions['orders']['topics'], [ 'order', 'stopOrder' ], 'subscription object must record the topics that were sent');
    const mismatchSecond = exchange.watchTopics (url, [ 'orders:BTC/USDT' ], [ 'order', 'stopOrder' ]);
    mismatchSecond.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 1, 'overlapping topics under a new hash must not resend already-recorded topics');
    const mismatchThird = exchange.watchTopics (url, [ 'orders:ETH/USDT' ], [ 'order', 'stopOrder', 'execution' ]);
    mismatchThird.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 2, 'a new topic under a new hash must send a subscribe');
    assert.deepStrictEqual (lastArgs (sent), [ 'execution' ], 'mismatched-length grow must send only the unrecorded topic');
    client.reject (new Error ('cleanup'));
}

export default testWsBybitWatchTopics;

const invokedDirectly = process.argv[1] !== undefined && process.argv[1].indexOf ('test.bybitWatchTopics') !== -1;
if (invokedDirectly) {
    testWsBybitWatchTopics ().then (() => {
        console.log ('test.bybitWatchTopics passed');
    }).catch ((e) => {
        console.error (e);
        process.exit (1);
    });
}
