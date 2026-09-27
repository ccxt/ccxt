package io.github.ccxt;

import static org.junit.jupiter.api.Assertions.*;

import io.github.ccxt.errors.NetworkError;
import io.github.ccxt.ws.Future;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

// native java test, hand-written - pins WsClient retirement to the client
// object rather than to its registry url key, mirroring js Client.error and
// Client.reset. all offline: the synthetic url is never dialed.
// see https://github.com/ccxt/ccxt/issues/30463
class WsClientRetirementRaceTest {

    private static final String RETIREMENT_URL = "ws://localhost:1234/retirement-race";

    private static Client makeSeededClient(String seed) {
        Client client = new Client(
                RETIREMENT_URL, null,
                /* handleMessage */ (c, m) -> {},
                /* ping */ c -> null,
                /* onClose */ (c, r) -> {},
                /* onError */ (c, e) -> {},
                /* verbose */ false,
                /* keepAlive */ 30_000L,
                /* decompressBinary */ false);
        client.future(seed + "-pending");
        client.subscriptionsMap().put(seed + "-subscription", true);
        return client;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> clientsMap(Exchange ex) {
        return (Map<String, Object>) ex.clients;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Future> futuresOf(Client client) {
        return (Map<String, Future>) client.futures;
    }

    private static void assertRetired(Client client, String who) {
        assertNotNull(client.error, who + ": retirement must set the terminal error marker");
        assertTrue(futuresOf(client).isEmpty(), who + ": retirement must clear futures");
        assertTrue(client.subscriptionsMap().isEmpty(), who + ": retirement must clear subscriptions");
    }

    private static void assertRejectedWithNetworkError(Future future, String message) {
        assertTrue(future.getFuture().isCompletedExceptionally(), message + " (future still pending)");
        Throwable rejection = assertThrows(ExecutionException.class,
                () -> future.getFuture().get(2, TimeUnit.SECONDS)).getCause();
        assertTrue(rejection instanceof NetworkError,
                message + " (got " + rejection.getClass().getName() + ": " + rejection.getMessage() + ")");
    }

    /**
     * Error path with a race: the caller's client retires, the replacement
     * installed under the same url keeps its state and its registry slot.
     */
    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void testRetirementReplacementRace() {
        Exchange exchange = new Exchange();
        Client callerClient = makeSeededClient("caller");
        Future callerFuture = futuresOf(callerClient).get("caller-pending");
        Client replacementClient = makeSeededClient("replacement");
        Future replacementFuture = futuresOf(replacementClient).get("replacement-pending");
        // the reconnect got there first: the registry already holds the
        // replacement when cleanup for the erroring caller runs
        clientsMap(exchange).put(RETIREMENT_URL, replacementClient);

        callerClient.onErrorCallback = (c, e) -> exchange.onError((Client) c, e);
        callerClient.onError(new NetworkError("simulated reconnect failure"));

        assertRetired(callerClient, "caller");
        assertRejectedWithNetworkError(callerFuture,
                "caller: pending future must reject with the cleanup error");
        assertNull(replacementClient.error, "replacement: must not be retired");
        assertEquals(1, clientsMap(exchange).size(), "replacement: registry must keep one entry");
        assertSame(replacementClient, clientsMap(exchange).get(RETIREMENT_URL),
                "replacement: must keep its registry slot");
        assertEquals(1, futuresOf(replacementClient).size(),
                "replacement: futures must stay registered");
        assertFalse(replacementFuture.getFuture().isDone(),
                "replacement: pending future must stay pending");
        assertEquals(1, replacementClient.subscriptionsMap().size(),
                "replacement: subscriptions must stay");
    }

    /**
     * Error path without a race: the registered client itself errors —
     * retired and removed, registry left empty.
     */
    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void testRetirementSameReference() {
        Exchange exchange = new Exchange();
        Client client = makeSeededClient("solo");
        Future future = futuresOf(client).get("solo-pending");
        clientsMap(exchange).put(RETIREMENT_URL, client);

        client.onErrorCallback = (c, e) -> exchange.onError((Client) c, e);
        client.onError(new NetworkError("transport error"));

        assertRetired(client, "solo");
        assertRejectedWithNetworkError(future,
                "solo: pending future must reject with the cleanup error");
        assertTrue(clientsMap(exchange).isEmpty(), "solo: registry must be empty after cleanup");
    }

    /**
     * a late transport error must not re-retire with a new error: the first
     * error wins and repeat calls are no-ops.
     */
    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void testRetirementIsIdempotent() {
        Client client = makeSeededClient("twice");
        Future future = futuresOf(client).get("twice-pending");
        NetworkError first = new NetworkError("first");

        client.onError(first);
        client.onError(new NetworkError("late close"));

        assertSame(first, client.error, "retirement must happen at most once, the first error wins");
        assertRetired(client, "twice");
        assertRejectedWithNetworkError(future, "twice: the first retirement must win the settlement");
    }

    /**
     * The futuresSync lock must elect a single retirement winner even when
     * every lifecycle path arrives at once on different threads.
     */
    @Test
    @Timeout(value = 60, unit = TimeUnit.SECONDS)
    void testConcurrentClosersElectOneWinner() throws Exception {
        for (int attempt = 0; attempt < 64; attempt++) {
            Client client = makeSeededClient("race-" + attempt);
            Future pending = futuresOf(client).get("race-" + attempt + "-pending");
            int racers = 4;
            CountDownLatch start = new CountDownLatch(1);
            List<java.util.concurrent.Future<?>> tasks = new ArrayList<>();
            try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
                for (int i = 0; i < racers; i++) {
                    NetworkError mine = new NetworkError("racer-" + i);
                    tasks.add(pool.submit(() -> {
                        start.await();
                        client.onError(mine);
                        return null;
                    }));
                }
                start.countDown();
                for (java.util.concurrent.Future<?> task : tasks) {
                    task.get(30, TimeUnit.SECONDS);
                }
            }
            assertNotNull(client.error, "a concurrent race must still retire the client");
            assertTrue(pending.getFuture().isCompletedExceptionally(),
                    "the pending future must be settled");
            assertTrue(futuresOf(client).isEmpty(), "futures must be drained after the race");
        }
    }
}
