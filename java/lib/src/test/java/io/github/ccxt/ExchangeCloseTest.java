package io.github.ccxt;

import static org.junit.jupiter.api.Assertions.*;

import io.github.ccxt.errors.ExchangeClosedByUser;
import io.github.ccxt.ws.Future;
import io.github.ccxt.ws.WsClient;

import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Mirrors TS Exchange.close() (ts/src/base/Exchange.ts:1537):
 *  - iterates this.clients
 *  - tags each client with an ExchangeClosedByUser exception
 *  - calls client.close() on each
 *  - clears the clients map
 *
 * Also pins #7 from the audit: a future blocked on a watch must surface the
 * typed ExchangeClosedByUser exception after Exchange.close(), not the bare
 * RuntimeException("Connection closed by the user") that hides intent.
 */
class ExchangeCloseTest {

    private static WsClient stubClient(String url) {
        return new WsClient(
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

    /**
     * close() must drain the clients map. Mirrors the TS contract:
     * `delete this.clients[client.url]` for each entry.
     */
    @Test
    void closeClearsAllClients() throws Exception {
        Exchange ex = new Exchange();
        Map<String, Object> clients = clientsMap(ex);
        WsClient a = stubClient("wss://example.invalid/a");
        WsClient b = stubClient("wss://example.invalid/b");
        clients.put(a.url, a);
        clients.put(b.url, b);

        ex.close();

        assertTrue(clientsMap(ex).isEmpty(),
                "Exchange.close() must remove every WsClient from the clients map");
    }

    /**
     * In-flight futures held by a WsClient must reject with the typed
     * ExchangeClosedByUser exception once Exchange.close() runs — so callers
     * can `catch (ExchangeClosedByUser e)` and distinguish "I asked for this"
     * from a remote-side disconnect.
     */
    @Test
    void closePropagatesTypedExceptionToInflightFutures() throws Exception {
        Exchange ex = new Exchange();
        WsClient client = stubClient("wss://example.invalid/typed");
        clientsMap(ex).put(client.url, client);

        Future inflight = client.future("BTC/USDT@orderbook");

        ex.close();

        Throwable rejection = assertThrows(Exception.class,
                () -> inflight.getFuture().get(2, java.util.concurrent.TimeUnit.SECONDS))
                .getCause();
        assertNotNull(rejection, "future must be rejected after close()");
        assertTrue(rejection instanceof ExchangeClosedByUser
                        || (rejection.getCause() instanceof ExchangeClosedByUser),
                "expected ExchangeClosedByUser, got " + rejection.getClass().getName()
                        + ": " + rejection.getMessage());
    }
}
