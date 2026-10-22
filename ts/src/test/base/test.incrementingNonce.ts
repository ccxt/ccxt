
import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testIncrementingNonce () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    // seed lastNonce above the current clock so two successive calls land in the same
    // tick and must return n and n + 1 deterministically (avoids a second-boundary flake)
    const seed = 9999999999999;
    exchange.options['lastNonce'] = seed;
    const first = exchange.incrementingNonce ();
    const second = exchange.incrementingNonce ();
    assert (first > seed, 'incrementingNonce should bump past the stored lastNonce');
    assert (second === first + 1, 'two incrementingNonce calls in the same tick should return n and n + 1');
    assert (second > first, 'incrementingNonce should be strictly increasing');
}

export default testIncrementingNonce;
