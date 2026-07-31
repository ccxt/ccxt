package io.github.ccxt;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

/** Offline dual-stack regression: construction must not set preferIPv4Stack. */
class DualStackTest {

    private static final String PROP = "java.net.preferIPv4Stack";
    private static String savedProperty;

    @BeforeAll
    static void clearIPv4StackPreference() {
        // Clear preferIPv4Stack so we can detect if construction re-sets it.
        savedProperty = System.getProperty(PROP);
        System.clearProperty(PROP);
    }

    @AfterAll
    static void restoreIPv4StackPreference() {
        // Restore JVM property for other tests in this fork.
        if (savedProperty != null) {
            System.setProperty(PROP, savedProperty);
        } else {
            System.clearProperty(PROP);
        }
    }

    private Exchange createExchange(Map<String, Object> config) {
        return (Exchange) Exchange.dynamicallyCreateInstance("binance", config);
    }

    @Test
    void constructionDoesNotForceIPv4Stack() {
        Exchange ex = createExchange(null);
        assertNotNull(ex);
        String value = System.getProperty(PROP);
        assertNotEquals("true", value, "construction must not set preferIPv4Stack=true");
    }

    @Test
    void constructionWithConfigDoesNotForceIPv4Stack() {
        Map<String, Object> config = new HashMap<>();
        config.put("enableRateLimit", true);
        Exchange ex = createExchange(config);
        assertNotNull(ex);
        String value = System.getProperty(PROP);
        assertNotEquals("true", value, "construction with config must not set preferIPv4Stack=true");
    }

    @Test
    void constructionDoesNotForceAddressFamilyPreference() {
        // Construction must not set preferIPv4Stack or preferIPv6Addresses.
        String savedV6 = System.getProperty("java.net.preferIPv6Addresses");
        System.clearProperty("java.net.preferIPv6Addresses");
        try {
            Exchange ex = createExchange(null);
            assertNotNull(ex);
            assertNull(System.getProperty(PROP),
                    "construction must not set java.net.preferIPv4Stack at all");
            assertNull(System.getProperty("java.net.preferIPv6Addresses"),
                    "construction must not set preferIPv6Addresses");
        } finally {
            if (savedV6 != null) {
                System.setProperty("java.net.preferIPv6Addresses", savedV6);
            }
        }
    }

    @Test
    void jvmCanOpenIPv6Sockets() throws Exception {
        // With preferIPv4Stack cleared, an INET6 socket must be creatable.
        try (java.nio.channels.SocketChannel ch =
                     java.nio.channels.SocketChannel.open(
                             java.net.StandardProtocolFamily.INET6)) {
            assertTrue(ch.isOpen(), "JVM should be able to open an IPv6 socket");
        }
    }

    @Test
    void httpClientIsConstructed() {
        Exchange ex = createExchange(null);
        assertNotNull(ex.httpClient,
                "httpClient should be initialized after exchange construction");
    }
}
