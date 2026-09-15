package tests;

import io.github.ccxt.Exchange;
import org.junit.jupiter.api.Test;
import tests.exchange.TestMain;
import java.util.List;
import java.util.concurrent.ForkJoinWorkerThread;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import static org.junit.jupiter.api.Assertions.*;

class WsInjectorTest {
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
