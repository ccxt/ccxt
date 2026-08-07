package io.github.ccxt.wrappers;

import static org.junit.jupiter.api.Assertions.*;

import io.github.ccxt.exchanges.Okx;
import io.github.ccxt.types.Trade;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

/**
 * The wrapper generator emits one truncation overload per arity from
 * required-only up to (but not including) the full signature. Each truncation
 * delegates to the full method, filling missing trailing args with nulls or
 * the param's declared default value. This test pins the contract by
 * intercepting the full method on a subclass and observing what each
 * truncation actually forwards.
 *
 * Okx.fetchTrades(String symbol, Long since, Long limit, Map params) is
 * a 1-required + 3-optional shape, so the generator should emit three
 * truncations — (symbol), (symbol, since), (symbol, since, limit) — plus the
 * full one. We exercise all four.
 */
class TruncationOverloadTest {

    /** Captures the args that reach the full typed method. */
    private static class CapturingOkx extends Okx {
        final AtomicReference<Object[]> captured = new AtomicReference<>();

        CapturingOkx() {
            super(new HashMap<String, Object>());
        }

        @Override
        public List<Trade> fetchTrades(String symbol, Long since, Long limit, Map<String, Object> params) {
            captured.set(new Object[] { symbol, since, limit, params });
            return List.of();
        }
    }

    @Test
    void requiredOnlyTruncationFillsAllOptionalsWithNull() {
        CapturingOkx ex = new CapturingOkx();
        ex.fetchTrades("BTC/USD:USDC");
        Object[] args = ex.captured.get();
        assertNotNull(args, "full method must be invoked by the truncation");
        assertEquals("BTC/USD:USDC", args[0]);
        assertNull(args[1], "since must default to null");
        assertNull(args[2], "limit must default to null");
        assertNull(args[3], "params must default to null");
    }

    @Test
    void firstOptionalTruncationKeepsCallerValueNullsRest() {
        CapturingOkx ex = new CapturingOkx();
        ex.fetchTrades("ETH/USD:USDC", 1234567890L);
        Object[] args = ex.captured.get();
        assertEquals("ETH/USD:USDC", args[0]);
        assertEquals(1234567890L, args[1]);
        assertNull(args[2]);
        assertNull(args[3]);
    }

    @Test
    void twoOptionalsTruncationKeepsCallerValuesNullsTail() {
        CapturingOkx ex = new CapturingOkx();
        ex.fetchTrades("BTC/USD:USDC", 1L, 50L);
        Object[] args = ex.captured.get();
        assertEquals("BTC/USD:USDC", args[0]);
        assertEquals(1L, args[1]);
        assertEquals(50L, args[2]);
        assertNull(args[3]);
    }

    @Test
    void fullSignaturePassesEverythingThrough() {
        CapturingOkx ex = new CapturingOkx();
        Map<String, Object> params = new HashMap<>();
        params.put("custom", "value");
        ex.fetchTrades("BTC/USD:USDC", 1L, 50L, params);
        Object[] args = ex.captured.get();
        assertEquals("BTC/USD:USDC", args[0]);
        assertEquals(1L, args[1]);
        assertEquals(50L, args[2]);
        assertSame(params, args[3]);
    }
}
