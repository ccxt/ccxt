package io.github.ccxt;

import io.github.ccxt.ws.WsClient;

import java.util.function.BiConsumer;
import java.util.function.Function;

/**
 * Bridge class so that transpiled exchange code referencing "Client"
 * uses our WsClient implementation.
 */
public class Client extends WsClient {

    public Client(String url, String proxy,
                  BiConsumer<WsClient, Object> handleMessage,
                  Function<WsClient, Object> ping,
                  BiConsumer<WsClient, Object> onClose,
                  BiConsumer<WsClient, Object> onError,
                  boolean verbose, long keepAlive, boolean decompressBinary) {
        super(url, proxy, handleMessage, ping, onClose, onError, verbose, keepAlive, decompressBinary, true);
    }

    public Client(String url, String proxy,
                  BiConsumer<WsClient, Object> handleMessage,
                  Function<WsClient, Object> ping,
                  BiConsumer<WsClient, Object> onClose,
                  BiConsumer<WsClient, Object> onError,
                  boolean verbose, long keepAlive, boolean decompressBinary,
                  boolean validateServerSsl) {
        super(url, proxy, handleMessage, ping, onClose, onError, verbose, keepAlive, decompressBinary, validateServerSsl);
    }
}
