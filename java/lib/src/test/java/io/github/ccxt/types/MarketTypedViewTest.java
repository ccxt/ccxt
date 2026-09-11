package io.github.ccxt.types;

import static org.junit.jupiter.api.Assertions.*;

import io.github.ccxt.BaseExchange;
import io.github.ccxt.errors.BadSymbol;
import io.github.ccxt.errors.ExchangeError;
import org.junit.jupiter.api.Test;

import java.util.*;

/**
 * Typed market views (BaseExchange.marketsTyped / marketTyped / marketsByIdTyped).
 * Offline: drives setMarkets() directly, the same storage path loadMarkets() ends in.
 */
class MarketTypedViewTest {

    private static Map<String, Object> row (String id, String symbol, String base, String quote) {
        Map<String, Object> row = new LinkedHashMap<> ();
        row.put ("id", id);
        row.put ("symbol", symbol);
        row.put ("base", base);
        row.put ("quote", quote);
        return row;
    }

    private static BaseExchange loaded (Object... rows) {
        BaseExchange exchange = new BaseExchange ();
        exchange.setMarkets (new ArrayList<> (Arrays.asList (rows)));
        return exchange;
    }

    @Test
    @SuppressWarnings("unchecked")
    void storageStaysRawRows () {
        BaseExchange exchange = loaded (row ("BTCUSDT", "BTC/USDT", "BTC", "USDT"));
        Map<String, Object> markets = (Map<String, Object>) exchange.markets;
        assertTrue (markets.get ("BTC/USDT") instanceof Map, "row stays a raw Map");
        assertFalse (markets.get ("BTC/USDT") instanceof MarketInterface, "storage is not wrapped");
        assertTrue (((Map<String, Object>) exchange.markets_by_id).get ("BTCUSDT") instanceof List, "per-id value is a list");
    }

    @Test
    void marketsTypedWrapsEveryRow () {
        BaseExchange exchange = loaded (
                row ("BTCUSDT", "BTC/USDT", "BTC", "USDT"),
                row ("ETHUSDT", "ETH/USDT", "ETH", "USDT"));
        Map<String, MarketInterface> typed = exchange.marketsTyped ();
        assertEquals (2, typed.size ());
        assertEquals ("BTCUSDT", typed.get ("BTC/USDT").id);
        assertEquals ("BTC", typed.get ("BTC/USDT").base);
        assertEquals ("USDT", typed.get ("ETH/USDT").quote);
    }

    @Test
    void marketsTypedIsANullSafeView () {
        assertNull (new BaseExchange ().marketsTyped (), "unloaded markets read as null, not empty");
        BaseExchange exchange = loaded (row ("BTCUSDT", "BTC/USDT", "BTC", "USDT"));
        Map<String, MarketInterface> typed = exchange.marketsTyped ();
        typed.remove ("BTC/USDT");
        assertTrue (((Map<String, Object>) exchange.markets).containsKey ("BTC/USDT"), "the view is disposable");
    }

    @Test
    void marketTypedResolvesLikeMarket () {
        BaseExchange exchange = loaded (row ("BTCUSDT", "BTC/USDT", "BTC", "USDT"));
        assertEquals ("BTC/USDT", exchange.marketTyped ("BTC/USDT").symbol);
        assertThrows (BadSymbol.class, () -> exchange.marketTyped ("NOPE/PAIR"));
        assertThrows (ExchangeError.class, () -> new BaseExchange ().marketTyped ("BTC/USDT"), "markets not loaded");
    }

    @Test
    void marketsByIdTypedGroupsConflicts () {
        BaseExchange exchange = loaded (
                row ("BTCUSDT", "BTC/USDT", "BTC", "USDT"),
                row ("BTCUSDT", "BTC/USDT:USDT", "BTC", "USDT"),
                row ("ETHUSDT", "ETH/USDT", "ETH", "USDT"));
        Map<String, List<MarketInterface>> typed = exchange.marketsByIdTyped ();
        assertEquals (2, typed.size ());
        assertEquals (2, typed.get ("BTCUSDT").size (), "same-id markets group into one list");
        assertEquals (1, typed.get ("ETHUSDT").size ());
        Set<String> symbols = new HashSet<> ();
        for (MarketInterface market : typed.get ("BTCUSDT")) {
            symbols.add (market.symbol);
        }
        assertEquals (new HashSet<> (Arrays.asList ("BTC/USDT", "BTC/USDT:USDT")), symbols, "both conflicting markets are present");
        assertNull (new BaseExchange ().marketsByIdTyped (), "unloaded markets read as null");
    }
}
