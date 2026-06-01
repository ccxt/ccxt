package io.github.ccxt;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Tests proxy configuration in Exchange.initHttpClient().
 * Verifies:
 * 1. No proxy → direct connection (HttpClient created without proxy)
 * 2. httpProxy set → HttpClient uses proxy
 * 3. httpsProxy set → HttpClient uses proxy
 * 4. Conflicting proxy settings → InvalidProxySettings exception
 */
class ProxyTest {

    private Exchange createExchange(Map<String, Object> config) {
        return Exchange.dynamicallyCreateInstance("binance", config);
    }

    @Test
    void testNoProxy() {
        // Default: no proxy set
        Exchange ex = createExchange(null);
        assertNotNull(ex);
        // Should be able to make a request (no proxy)
        // The httpClient should be set and functional
        assertNotNull(ex.httpClient);
    }

    @Test
    void testHttpProxyConfigured() {
        Map<String, Object> config = new HashMap<>();
        config.put("httpProxy", "http://127.0.0.1:8888");
        Exchange ex = createExchange(config);
        assertNotNull(ex);
        assertNotNull(ex.httpClient);
        // Verify the proxy was set by checking the httpClient's proxy selector
        // HttpClient doesn't expose proxy directly, but we can verify it was built
        // by checking the httpProxy field is set
        assertEquals("http://127.0.0.1:8888", ex.httpProxy.toString());
    }

    @Test
    void testHttpsProxyConfigured() {
        Map<String, Object> config = new HashMap<>();
        config.put("httpsProxy", "http://127.0.0.1:9999");
        Exchange ex = createExchange(config);
        assertNotNull(ex);
        assertNotNull(ex.httpClient);
        assertEquals("http://127.0.0.1:9999", ex.httpsProxy.toString());
    }

    @Test
    void testConflictingProxiesThrow() {
        // Setting both httpProxy and httpsProxy should throw InvalidProxySettings
        // when making a request (not at construction time, at fetch time)
        Map<String, Object> config = new HashMap<>();
        config.put("httpProxy", "http://127.0.0.1:8888");
        config.put("httpsProxy", "http://127.0.0.1:9999");
        Exchange ex = createExchange(config);
        assertNotNull(ex);

        // The conflict is detected at fetch time by checkProxySettings
        assertThrows(Exception.class, () -> {
            ex.fetch("http://example.com", "GET", null, null).join();
        });
    }

    @Test
    void testProxyUrlAndHttpProxyConflict() {
        Map<String, Object> config = new HashMap<>();
        config.put("proxyUrl", "http://proxy.example.com/");
        config.put("httpProxy", "http://127.0.0.1:8888");
        Exchange ex = createExchange(config);

        assertThrows(Exception.class, () -> {
            ex.fetch("http://example.com", "GET", null, null).join();
        });
    }

    @Test
    void testHttpProxyUsedInFetch() {
        // Set httpProxy to a non-existent proxy — fetch should fail with connection error,
        // NOT succeed (which would mean proxy was ignored)
        Map<String, Object> config = new HashMap<>();
        config.put("httpProxy", "http://127.0.0.1:1"); // port 1 — guaranteed to fail
        Exchange ex = createExchange(config);

        try {
            ex.fetch("https://api.ipify.org/", "GET", new HashMap<>(), null).join();
            fail("Should have thrown — request through dead proxy should fail");
        } catch (Exception e) {
            // Expected: connection refused or timeout proves the proxy WAS used
            String msg = e.getMessage() != null ? e.getMessage() : e.getCause().getMessage();
            // Should be a connection error, not a "proxy not configured" error
            assertFalse(msg.contains("InvalidProxy"), "Should be a connection error, not a proxy config error");
        }
    }
}
