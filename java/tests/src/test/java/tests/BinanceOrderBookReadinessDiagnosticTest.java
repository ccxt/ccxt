package tests;

import io.github.ccxt.BaseExchange;
import io.github.ccxt.exchanges.pro.Binance;
import org.junit.jupiter.api.Test;
import tests.exchange.TestMain;
import java.nio.file.Path;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import static org.junit.jupiter.api.Assertions.*;

class BinanceOrderBookReadinessDiagnosticTest {
    static class ObservedBinance extends Binance {
        final CountDownLatch injectorWaiting = new CountDownLatch(1);

        @Override
        public CompletableFuture<Object> sleep(Object milliseconds) {
            injectorWaiting.countDown();
            return super.sleep(milliseconds);
        }
    }
    static class PausedSubscriptions extends ConcurrentHashMap<String, Object> {
        final CountDownLatch entered = new CountDownLatch(1);
        final CountDownLatch release = new CountDownLatch(1);
        final CountDownLatch registered = new CountDownLatch(1);

        @Override
        public Object putIfAbsent(String key, Object value) {
            entered.countDown();
            try {
                if (!release.await(10, TimeUnit.SECONDS)) {
                    throw new IllegalStateException("subscription registration was not released");
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException(e);
            }
            Object result = super.putIfAbsent(key, value);
            registered.countDown();
            return result;
        }
    }

    @Test
    void acknowledgementWaitsForDelayedRegistration() throws Exception {
        runScenario(true);
    }

    @Test
    void acknowledgementAfterRegistrationStartsSnapshot() throws Exception {
        runScenario(false);
    }

    @SuppressWarnings("unchecked")
    void runScenario(boolean early) throws Exception {
        boolean oldSleep = BaseExchange.syncSleep;
        var root = Path.of("../..");
        Map<String, Object> markets = (Map<String, Object>) BaseTest.jsonParse(Files.readString(root.resolve("ts/src/test/static/markets/binance.json")));
        Map<String, Object> fixture = (Map<String, Object>) BaseTest.jsonParse(Files.readString(root.resolve("ts/src/test/static/ws/binance.json")));
        var methods = (Map<String, Object>) fixture.get("methods");
        var cases = (List<Map<String, Object>>) methods.get("watchOrderBook");
        var data = cases.stream().filter(x -> "linear swap orderbook with pu continuity chain".equals(x.get("description"))).findFirst().orElseThrow();
        var exchange = new ObservedBinance();
        exchange.setMarkets(markets);
        String url = (String) data.get("url");
        BaseTest.setupWsMockTransport(exchange, url);
        BaseTest.setFetchResponse(exchange, data.get("httpResponse"));
        var client = exchange.client(url);
        var subscriptions = new PausedSubscriptions();
        client.subscriptions = subscriptions;
        var handler = client.handleMessageCallback;
        client.handleMessageCallback = (ignored, message) -> {
            if (((Map<?, ?>) message).containsKey("result")) {
                assertEquals(0, subscriptions.registered.getCount());
                assertFalse(client.mockSentMessages.isEmpty());
            }
            handler.accept(client, message);
        };
        var watch = exchange.watchOrderBook("BTC/USDT:USDT", new Object[0]);
        try {
            assertTrue(subscriptions.entered.await(10, TimeUnit.SECONDS));
            assertTrue(BaseTest.wsClientHasPendingFutures(exchange, url));
            assertTrue(client.mockSentMessages.isEmpty());
            if (!early) {
                subscriptions.release.countDown();
                assertTrue(subscriptions.registered.await(10, TimeUnit.SECONDS));
            }
            var injector = new TestMain().injectWsMessages(exchange, url, data.get("messages"));
            if (early) {
                assertTrue(exchange.injectorWaiting.await(2, TimeUnit.SECONDS));
                assertFalse(injector.isDone());
                subscriptions.release.countDown();
            }
            injector.get(20, TimeUnit.SECONDS);
            var book = watch.get(2, TimeUnit.SECONDS);
            assertNotNull(book);
            assertEquals(110L, ((Number) book.get("nonce")).longValue());
        } finally {
            subscriptions.release.countDown();
            client.reject(new RuntimeException("diagnostic cleanup"));
            watch.cancel(true);
            BaseExchange.syncSleep = oldSleep;
        }
    }
}
