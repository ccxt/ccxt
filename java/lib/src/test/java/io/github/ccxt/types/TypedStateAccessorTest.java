package io.github.ccxt.types;

import static org.junit.jupiter.api.Assertions.*;

import io.github.ccxt.exchanges.Binance;

import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Offline tests for the typed state accessors emitted on every typed exchange wrapper
 * (build/generateJavaWrappers.ts genStateAccessors): getMarket / getCurrency /
 * getMarkets / getCurrencies / getTickers.
 *
 * No network: the raw caches that setMarkets() / fetchTickers() populate are filled
 * directly with the same unified shapes, then the accessors are driven through the real
 * inherited helpers (BaseExchange.market / BaseExchange.currency).
 */
class TypedStateAccessorTest {

    private static Map<String, Object> map(Object... kv) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i < kv.length; i += 2) {
            m.put((String) kv[i], kv[i + 1]);
        }
        return m;
    }

    private static Binance exchangeWithCaches() {
        Binance ex = new Binance();
        Map<String, Object> markets = new LinkedHashMap<>();
        markets.put("BTC/USDT", map(
            "id", "BTCUSDT", "symbol", "BTC/USDT", "base", "BTC", "quote", "USDT",
            "type", "spot", "spot", true, "active", true, "taker", 0.001));
        markets.put("ETH/USDT", map(
            "id", "ETHUSDT", "symbol", "ETH/USDT", "base", "ETH", "quote", "USDT",
            "type", "spot", "spot", true, "active", true, "taker", 0.001));
        ex.markets = markets;
        ex.currencies = map("BTC", map("id", "BTC", "code", "BTC", "name", "Bitcoin"));
        ex.tickers = map("BTC/USDT", map("symbol", "BTC/USDT", "last", 42000.0, "bid", 41999.0));
        return ex;
    }

    @Test
    void testGetMarketIsTypedAndDelegatesToTheBaseLookup() {
        Binance ex = exchangeWithCaches();
        MarketInterface m = ex.getMarket("BTC/USDT");
        assertEquals("BTC/USDT", m.symbol);
        assertEquals("BTC", m.base);
        assertEquals("USDT", m.quote);
        assertEquals(0.001, m.taker);
        assertEquals(Boolean.TRUE, m.spot);
        // the base lookup's own validation is preserved: an unknown symbol still throws
        assertThrows(RuntimeException.class, () -> ex.getMarket("NOPE/USDT"));
    }

    @Test
    void testGetCurrencyIsTyped() {
        Binance ex = exchangeWithCaches();
        CurrencyInterface c = ex.getCurrency("BTC");
        assertEquals("BTC", c.code);
        assertEquals("Bitcoin", c.name);
    }

    @Test
    void testGetMarketsReturnsATypedViewOfTheCache() {
        Binance ex = exchangeWithCaches();
        Map<String, MarketInterface> markets = ex.getMarkets();
        assertEquals(2, markets.size());
        assertEquals("BTCUSDT", markets.get("BTC/USDT").id);
        assertEquals("ETHUSDT", markets.get("ETH/USDT").id);
        // the lift names the shape; it does not replace the raw cache entry
        assertInstanceOf(MarketInterface.class, markets.get("BTC/USDT"));
        assertInstanceOf(Map.class, ((Map<?, ?>) ex.markets).get("BTC/USDT"));
    }

    @Test
    void testGetCurrenciesAndGetTickers() {
        Binance ex = exchangeWithCaches();
        assertEquals("Bitcoin", ex.getCurrencies().get("BTC").name);
        Map<String, Ticker> tickers = ex.getTickers();
        assertEquals(42000.0, tickers.get("BTC/USDT").last);
        assertEquals(41999.0, tickers.get("BTC/USDT").bid);
    }

    @Test
    void testUnloadedCachesAreNullNotEmptyObjects() {
        Binance fresh = new Binance();
        // markets is null until loadMarkets(); the accessor must report that, not
        // hand back an empty map that reads as "the exchange has no markets".
        assertNull(fresh.getMarkets());
    }

    @Test
    void testAccessorsDoNotMutateTheUnderlyingCache() {
        Binance ex = exchangeWithCaches();
        Map<String, MarketInterface> view = ex.getMarkets();
        view.clear();
        // getMarkets() returns a fresh view; the exchange's own cache is intact
        assertEquals(2, ((Map<?, ?>) ex.markets).size());
        assertEquals(2, ex.getMarkets().size());
    }
}
