package io.github.ccxt;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

/**
 * Dual-stack IPv6 regression test.
 *
 * BaseExchange.initExchange() used to call
 *   System.setProperty("java.net.preferIPv4Stack", "true");
 * which forces the whole JVM onto the IPv4 stack, breaking IPv6-only and
 * dual-stack hosts for both REST (java.net.http.HttpClient) and WS
 * (Netty NioSocketChannel). The property is now removed so the JVM default
 * (dual-stack, IPv6 preferred when available with IPv4 fallback) applies.
 *
 * These tests are offline-safe: they assert on the system property and on
 * httpClient construction only, no DNS or network access.
 */
class DualStackTest {

    private static final String PROP = "java.net.preferIPv4Stack";
    private static String savedProperty;

    @BeforeAll
    static void clearIPv4StackPreference() {
        // If the gradle/test JVM was launched with -Djava.net.preferIPv4Stack=true
        // (or a previous test set it), clear it first so we can observe whether
        // exchange construction re-sets it. Construction must NOT set it.
        savedProperty = System.getProperty(PROP);
        System.clearProperty(PROP);
    }

    @AfterAll
    static void restoreIPv4StackPreference() {
        // Leave the JVM as we found it for other tests in the same fork.
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
        assertNotEquals("true", value,
                "Exchange construction must not set java.net.preferIPv4Stack=true " +
                "(forces JVM-wide IPv4-only, breaks dual-stack IPv6)");
    }

    @Test
    void constructionWithConfigDoesNotForceIPv4Stack() {
        Map<String, Object> config = new HashMap<>();
        config.put("enableRateLimit", true);
        Exchange ex = createExchange(config);
        assertNotNull(ex);
        String value = System.getProperty(PROP);
        assertNotEquals("true", value,
                "Exchange construction with user config must not set " +
                "java.net.preferIPv4Stack=true");
    }

    @Test
    void constructionDoesNotForceAddressFamilyPreference() {
        // The JVM has no Happy-Eyeballs delay knob (no equivalent of Node's
        // autoSelectFamilyAttemptTimeout on java.net.http.HttpClient or on
        // Netty 4.1.x Bootstrap). The least aggressive correct configuration is
        // to set NO address-family system property at all, so both of these
        // must remain unset by exchange construction.
        String savedV6 = System.getProperty("java.net.preferIPv6Addresses");
        System.clearProperty("java.net.preferIPv6Addresses");
        try {
            Exchange ex = createExchange(null);
            assertNotNull(ex);
            assertNull(System.getProperty(PROP),
                    "construction must not set java.net.preferIPv4Stack at all");
            assertNull(System.getProperty("java.net.preferIPv6Addresses"),
                    "construction must not set java.net.preferIPv6Addresses; " +
                    "the JDK default already yields dual-stack and forcing it " +
                    "does not speed up family selection");
        } finally {
            if (savedV6 != null) {
                System.setProperty("java.net.preferIPv6Addresses", savedV6);
            }
        }
    }

    @Test
    void jvmCanOpenIPv6Sockets() throws Exception {
        // Sanity check that the test JVM is not IPv4-only: with
        // preferIPv4Stack cleared, an INET6 socket must be creatable.
        // This is what makes IPv6 endpoints reachable for both HttpClient
        // and Netty's NioSocketChannel. No DNS/network access.
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
