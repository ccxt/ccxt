package io.github.ccxt;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

// native java test, hand-written - validateServerSsl = false must let both REST and WS
// connect to a server whose certificate is self-signed, expired and issued for another
// hostname, while the default (true) must reject it. the shared server lives in
// ts/src/test/static/ssl/server.cjs (requires node on PATH)
class ValidateServerSslTest {

    private static Process server;
    private static int port;

    @BeforeAll
    static void startServer() throws Exception {
        File dir = new File(System.getProperty("user.dir")).getAbsoluteFile();
        File script = null;
        for (File d = dir; d != null && script == null; d = d.getParentFile()) {
            File candidate = new File(d, "ts/src/test/static/ssl/server.cjs");
            if (candidate.isFile()) {
                script = candidate;
            }
        }
        assertNotNull(script, "ts/src/test/static/ssl/server.cjs not found above " + dir);
        server = new ProcessBuilder("node", script.getPath()).redirectError(ProcessBuilder.Redirect.INHERIT).start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(server.getInputStream(), StandardCharsets.UTF_8));
        String line = reader.readLine();
        assertNotNull(line, "ssl test server did not report its port");
        port = Integer.parseInt(line.trim());
    }

    @AfterAll
    static void stopServer() throws Exception {
        if (server != null) {
            server.getOutputStream().close();
            server.destroy();
        }
    }

    private static Exchange exchange(boolean validateServerSsl) {
        Map<String, Object> config = new HashMap<>();
        config.put("timeout", 5000);
        if (!validateServerSsl) {
            config.put("validateServerSsl", false);
        }
        return new Exchange(config);
    }

    private String restUrl() {
        return "https://127.0.0.1:" + port + "/ping";
    }

    private Object rest(Exchange exchange) throws Exception {
        return exchange.fetch(restUrl(), "GET").get(10, TimeUnit.SECONDS);
    }

    private Object ws(Exchange exchange) throws Exception {
        CompletableFuture<Object> received = new CompletableFuture<>();
        Client client = exchange.client("wss://127.0.0.1:" + port + "/ws");
        client.handleMessageCallback = (c, message) -> received.complete(message);
        try {
            client.connect(0).get(10, TimeUnit.SECONDS);
            return received.get(10, TimeUnit.SECONDS);
        } finally {
            exchange.close().get(10, TimeUnit.SECONDS);
        }
    }

    private static void assertOk(Object response, String message) {
        assertTrue(response instanceof Map<?, ?> m && Boolean.TRUE.equals(m.get("ok")), message + ", got: " + response);
    }

    @Test
    @Timeout(value = 60, unit = TimeUnit.SECONDS)
    void testValidateServerSsl() throws Exception {
        Exchange strict = exchange(true);
        assertTrue(strict.validateServerSsl, "validateServerSsl must default to true");
        assertThrows(Exception.class, () -> rest(strict), "REST must fail against an invalid certificate by default");
        assertThrows(Exception.class, () -> ws(exchange(true)), "WS must fail against an invalid certificate by default");

        Exchange lax = exchange(false);
        assertFalse(lax.validateServerSsl, "validateServerSsl: false must be read from the config");
        assertOk(rest(lax), "REST must succeed with validateServerSsl = false");
        assertOk(ws(exchange(false)), "WS must succeed with validateServerSsl = false");

        // flipping the field after construction must rebuild the http client
        Exchange flipped = exchange(true);
        assertThrows(Exception.class, () -> rest(flipped), "REST must fail before the flag is flipped");
        flipped.validateServerSsl = false;
        assertOk(rest(flipped), "REST must honor validateServerSsl set after construction");
    }
}
