// NO_AUTO_TRANSPILE
import assert from 'assert';
import { ArrayCacheBySymbolBySide } from '../../../base/ws/Cache.js';

function testCacheRemoveSymbol (CacheClass = ArrayCacheBySymbolBySide) {
    for (const pollGlobal of [ false, true ]) {
        for (const pollSymbol of [ false, true ]) {
            const cache = new CacheClass ();
            const ethLong = { symbol: 'ETH', side: 'long', contracts: 4 };
            const ethShort = { symbol: 'ETH', side: 'short', contracts: 5 };
            cache.append (ethLong);
            cache.append ({ symbol: 'LTC', side: 'long', contracts: 2 });
            cache.append (ethShort);
            if (pollGlobal) {
                assert.equal (cache.getLimit (undefined, undefined), 3);
            }
            if (pollSymbol) {
                assert.equal (cache.getLimit ('ETH', undefined), 2);
                assert.equal (cache.getLimit ('LTC', undefined), 1);
            }
            cache.remove ('MISSING');
            assert.equal (cache.length, 3);
            cache.remove ('LTC');
            assert.equal (cache.length, 2);
            assert.equal (cache[0], ethLong);
            assert.equal (cache[1], ethShort);
            assert.equal (cache.getLimit ('LTC', undefined), 0);
            cache.remove ('LTC');
            cache.append ({ symbol: 'LTC', side: 'both', contracts: 0 });
            assert.equal (cache.length, 3);
            assert.equal (cache.getLimit (undefined, undefined), pollGlobal ? 1 : 3);
            assert.equal (cache.getLimit ('LTC', undefined), 1);
            // Polling LTC/global must not consume ETH's independent scope.
            cache.append ({ symbol: 'ETH', side: 'long', contracts: 6 });
            assert.equal (cache.getLimit ('ETH', undefined), pollSymbol ? 1 : 2);
            assert.equal (cache.length, 3);
        }
    }
    const emptiedCache = new CacheClass ();
    emptiedCache.remove ('LTC');
    emptiedCache.append ({ symbol: 'LTC', side: 'long', contracts: 2 });
    emptiedCache.append ({ symbol: 'LTC', side: 'short', contracts: 3 });
    emptiedCache.remove ('LTC');
    assert.equal (emptiedCache.length, 0);
    assert.equal (emptiedCache.getLimit (undefined, undefined), 0);
    assert.equal (emptiedCache.getLimit ('LTC', undefined), 0);
    emptiedCache.append ({ symbol: 'LTC', side: 'long', contracts: 1 });
    assert.equal (emptiedCache.length, 1);
    assert.equal (emptiedCache[0]['contracts'], 1);
    assert.equal (emptiedCache.getLimit (undefined, undefined), 1);
}

export default testCacheRemoveSymbol;
