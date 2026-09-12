import assert from 'assert';
import Client from '../../../base/ws/Client.js';
import { wsClientHasPendingFutures } from '../../../test/tests.helpers.js';

// Native JS test: tests.helpers has separate implementations in each language.
export function assertWsSnapshotReadiness (hasPendingFutures: typeof wsClientHasPendingFutures) {
    const noop = () => {};
    const url = 'ws://localhost:1234';
    const client = new Client (url, noop, noop, noop, noop, {});
    const exchange = { 'client': () => client };
    assert (!hasPendingFutures (exchange, url), 'an idle client must not accept injected frames');
    const spotSnapshot = client.future ('spot:fetchBalanceSnapshot');
    assert (!hasPendingFutures (exchange, url), 'a pending REST balance snapshot must not make the WS injector ready');
    spotSnapshot.resolve (undefined);
    assert (!hasPendingFutures (exchange, url), 'a retained resolved snapshot must not make the WS injector ready');
    const swapSnapshot = client.future ('swap:fetchBalanceSnapshot');
    assert (!hasPendingFutures (exchange, url), 'swap REST snapshots must also be ignored');
    const messageHashes = [ 'spot:balance', 'swap:balance', 'authenticate', 'orderbook:BTC/USDT' ];
    for (const messageHash of messageHashes) {
        client.future (messageHash);
        assert (hasPendingFutures (exchange, url), 'a real WS future must remain ready alongside REST snapshots: ' + messageHash);
        client.resolve (undefined, messageHash);
        assert (!hasPendingFutures (exchange, url), 'a consumed WS future must not leave the injector ready');
    }
    swapSnapshot.resolve (undefined);
}

function testWsSnapshotReadiness () {
    assertWsSnapshotReadiness (wsClientHasPendingFutures);
}

export default testWsSnapshotReadiness;
