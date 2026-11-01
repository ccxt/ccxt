package io.github.ccxt.ws;

import static org.junit.jupiter.api.Assertions.*;

import io.github.ccxt.Client;
import io.github.ccxt.Exchange;

import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * cleanupWsClient must reclaim the per-client messageExecutor without
 * shutting it down synchronously (which rejects in-flight frames and
 * regressed 15 exchanges in the full Java WS sweep) — it schedules a
 * graceful shutdown after a grace period instead, disarmed if the client
 * reconnects in time.
 */
class WsClientExecutorShutdownTest {

    private static Client stubClient(String url) {
        return new Client(
                url, null,
                /* handleMessage */ (c, m) -> {},
                /* ping */ c -> null,
                /* onClose */ (c, r) -> {},
                /* onError */ (c, e) -> {},
                /* verbose */ false,
                /* keepAlive */ 30_000L,
                /* decompressBinary */ false,
                /* validateServerSsl */ true);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> clientsMap(Exchange ex) {
        return (Map<String, Object>) ex.clients;
    }

    /** onMessage is package-private on WsClient; reach it without the Client subtype in the way. */
    private static void deliver(Client client, Object frame) {
        ((WsClient) client).onMessage(frame);
    }

    private static void awaitShutdown(Client client, long timeoutMs) throws InterruptedException {
        long deadline = System.currentTimeMillis() + timeoutMs;
        while (!client.isMessageExecutorShutdown() && System.currentTimeMillis() < deadline) {
            Thread.sleep(10);
        }
    }

    /** No synchronous shutdown on cleanup; termination after the grace period. */
    @Test
    void cleanupSchedulesDeferredExecutorShutdown() throws Exception {
        Exchange ex = new Exchange();
        Client client = stubClient("wss://example.invalid/leak");
        client.executorShutdownDelayMs = 100;
        clientsMap(ex).put(client.url, client);

        ex.onError(client, new RuntimeException("simulated disconnect"));

        assertFalse(clientsMap(ex).containsKey(client.url), "client must be discarded");
        assertFalse(client.isMessageExecutorShutdown(),
                "executor must not be shut down synchronously on cleanup");

        awaitShutdown(client, 5_000);
        assertTrue(client.isMessageExecutorShutdown(),
                "executor must terminate after the grace period");
    }

    /** Regression guard: a frame in flight during cleanup must still be processed. */
    @Test
    void queuedMessagesStillProcessedWithinGracePeriod() throws Exception {
        CountDownLatch handled = new CountDownLatch(1);
        Client client = new Client(
                "wss://example.invalid/drain", null,
                /* handleMessage */ (c, m) -> handled.countDown(),
                /* ping */ c -> null,
                /* onClose */ (c, r) -> {},
                /* onError */ (c, e) -> {},
                false, 30_000L, false, true);
        client.executorShutdownDelayMs = 200;

        Exchange ex = new Exchange();
        clientsMap(ex).put(client.url, client);
        ex.onError(client, new RuntimeException("simulated disconnect"));

        deliver(client, "late frame");

        assertTrue(handled.await(2, TimeUnit.SECONDS),
                "in-flight frame must still be handled after cleanup");
        awaitShutdown(client, 5_000);
        assertTrue(client.isMessageExecutorShutdown());
    }

    /** A frame arriving after termination is dropped, not thrown into Netty. */
    @Test
    void frameAfterShutdownIsDroppedWithoutThrowing() throws Exception {
        Client client = stubClient("wss://example.invalid/drop");
        client.executorShutdownDelayMs = 50;

        Exchange ex = new Exchange();
        clientsMap(ex).put(client.url, client);
        ex.onError(client, new RuntimeException("simulated disconnect"));

        awaitShutdown(client, 5_000);
        assertTrue(client.isMessageExecutorShutdown());
        assertDoesNotThrow(() -> deliver(client, "post-shutdown frame"));
    }

    /** A discarded client that re-dials within the grace period must not lose its executor. */
    @Test
    void reconnectWithinGracePeriodDisarmsShutdown() throws Exception {
        CountDownLatch handled = new CountDownLatch(1);
        Client client = new Client(
                "wss://example.invalid/redial", null,
                /* handleMessage */ (c, m) -> handled.countDown(),
                /* ping */ c -> null,
                /* onClose */ (c, r) -> {},
                /* onError */ (c, e) -> {},
                false, 30_000L, false, true);
        client.executorShutdownDelayMs = 100;

        Exchange ex = new Exchange();
        clientsMap(ex).put(client.url, client);
        ex.onError(client, new RuntimeException("simulated disconnect"));

        // Same-instance re-dial as a watch() retry performs; the backoff keeps the test offline.
        client.connect(60_000);

        Thread.sleep(400); // well past the grace period
        assertFalse(client.isMessageExecutorShutdown(),
                "shutdown must be disarmed when the client reconnected");

        deliver(client, "post-reconnect frame");
        assertTrue(handled.await(2, TimeUnit.SECONDS),
                "reconnected client must still process frames");

        // Once the redial is gone, a later disconnect re-arms the shutdown.
        client.startedConnecting.set(false);
        clientsMap(ex).put(client.url, client);
        ex.onError(client, new RuntimeException("second disconnect"));
        awaitShutdown(client, 5_000);
        assertTrue(client.isMessageExecutorShutdown());
    }

    /** Double scheduling and Exchange.close() must coexist. */
    @Test
    void schedulingIsIdempotentAndCoexistsWithClose() {
        Client client = stubClient("wss://example.invalid/idempotent");
        client.executorShutdownDelayMs = 50;

        client.scheduleExecutorShutdown();
        assertDoesNotThrow(client::scheduleExecutorShutdown);
        assertDoesNotThrow(client::close); // close() shuts the executor down immediately

        assertTrue(client.isMessageExecutorShutdown());
    }
}
