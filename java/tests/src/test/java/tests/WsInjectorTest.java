package tests;

import io.github.ccxt.Exchange;
import io.github.ccxt.BaseExchange;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tests.exchange.TestMain;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.ForkJoinWorkerThread;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.jupiter.api.Assertions.*;

class WsInjectorTest {
    private boolean previousSyncSleep;

    @Test
    void authenticationCoordinationDoesNotMakeTheSubscriptionReady() {
        Exchange exchange = new Exchange();
        String url = "wss://static-test.invalid";
        BaseTest.setupWsMockTransport(exchange, url);
        var client = exchange.client(url);
        for (String hash : List.of("authenticate:signature:spot", "authenticate:margin:listenToken")) {
            client.future(hash);
            assertFalse(BaseTest.wsClientHasPendingFutures(exchange, url),
                "Signing has not registered a request that can consume the acknowledgement");
            client.future("1");
            assertTrue(BaseTest.wsClientHasPendingFutures(exchange, url));
            client.resolve("ack", "1");
            assertFalse(BaseTest.wsClientHasPendingFutures(exchange, url),
                "A retained coordination future must not trigger the next frame");
            client.resolve(true, hash);
        }
        client.future("authenticate");
        assertTrue(BaseTest.wsClientHasPendingFutures(exchange, url),
            "An ordinary authentication response future must still accept frames");
        client.resolve(true, "authenticate");
    }

    @Test
    void delayedSubscriptionRegistrationReceivesItsAcknowledgement() throws Exception {
        Exchange exchange = new Exchange();
        String url = "wss://static-test.invalid";
        BaseTest.setupWsMockTransport(exchange, url);
        var client = exchange.client(url);
        client.future("authenticate:signature:spot");
        assertFalse(BaseTest.wsClientHasPendingFutures(exchange, url));
        client.handleMessageCallback = (ignored, message) -> {
            client.resolve(message, "1");
            client.resolve(true, "authenticate:signature:spot");
        };
        // Start the injector while signing has not yet registered its request.
        var injector = new TestMain().injectWsMessages(exchange, url, List.of("ack"));
        var request = client.future("1").getFuture();
        try {
            assertEquals("ack", request.get(10, TimeUnit.SECONDS));
            injector.get(10, TimeUnit.SECONDS);
            assertFalse(BaseTest.wsClientHasPendingFutures(exchange, url));
        } finally {
            client.reject(new RuntimeException("test cleanup"));
            injector.cancel(true);
        }
    }

    @BeforeEach
    void saveSleepMode() {
        previousSyncSleep = BaseExchange.syncSleep;
    }

    @AfterEach
    void restoreSleepMode() {
        BaseExchange.syncSleep = previousSyncSleep;
    }

    @Test
    void commonPoolWatchCanRegisterAndAwaitItsFrame() throws Exception {
        Exchange exchange = new Exchange();
        String url = "wss://static-test.invalid";
        BaseTest.setupWsMockTransport(exchange, url);
        var client = exchange.client(url);
        client.handleMessageCallback = (ignored, message) -> client.resolve(message, "trade");
        AtomicReference<CompletableFuture<Object>> injector = new AtomicReference<>();
        var watch = ForkJoinPool.commonPool().submit(() -> {
            assertInstanceOf(ForkJoinWorkerThread.class, Thread.currentThread());
            // Match the private-watch ordering: start the injector before the
            // authentication join, then register and await the watch future.
            // A common-pool injector is eligible for helpAsyncBlocker stealing
            // during this join, before the subscription is ready.
            var authenticated = CompletableFuture.supplyAsync(() -> true);
            injector.set(new TestMain().injectWsMessages(exchange, url, List.of("frame")));
            authenticated.join();
            return client.future("trade").getFuture().orTimeout(8, TimeUnit.SECONDS).join();
        });
        try {
            assertEquals("frame", watch.get(10, TimeUnit.SECONDS));
            injector.get().get(10, TimeUnit.SECONDS);
        } finally {
            client.reject(new RuntimeException("test cleanup"));
            watch.cancel(true);
        }
    }

    @Test
    void unresolvedFixtureRejectsItsPendingWatch() throws Exception {
        Exchange exchange = new Exchange();
        String url = "wss://static-test.invalid";
        BaseTest.setupWsMockTransport(exchange, url);
        var client = exchange.client(url);
        var result = client.future("trade").getFuture();
        client.handleMessageCallback = (ignored, message) -> {};
        new TestMain().injectWsMessages(exchange, url, List.of("unmatched"))
            .get(10, TimeUnit.SECONDS);
        assertThrows(java.util.concurrent.ExecutionException.class,
            () -> result.get(1, TimeUnit.SECONDS));
    }

    @Test
    void injectorCannotBeStolenByAWatchWaitingInTheCommonPool() throws Exception {
        Exchange exchange = new Exchange();
        String url = "wss://static-test.invalid";
        BaseTest.setupWsMockTransport(exchange, url);
        var client = exchange.client(url);
        var result = client.future("trade").getFuture();
        AtomicBoolean ranInForkJoinPool = new AtomicBoolean();
        client.handleMessageCallback = (ignored, message) -> {
            ranInForkJoinPool.set(Thread.currentThread() instanceof ForkJoinWorkerThread);
            client.resolve(message, "trade");
        };
        var injector = new TestMain().injectWsMessages(exchange, url, List.of("frame"));
        assertEquals("frame", result.get(10, TimeUnit.SECONDS));
        injector.get(10, TimeUnit.SECONDS);
        assertFalse(ranInForkJoinPool.get(), "The injector must not be eligible for ForkJoin work stealing");
    }
}
