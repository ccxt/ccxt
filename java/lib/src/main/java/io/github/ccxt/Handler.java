package io.github.ccxt;

import java.util.Map;

/**
 * A ws message handler a topic table dispatches to.
 *
 * <p>Tables of {@code topic -> this::handleX} method references replace the reflective
 * {@code Helpers.callDynamically(this, name, args)} dispatch: the entry is a plain map read and the
 * handler a virtual call, so no per-message method lookup, argument adaptation or coercion runs.
 */
public interface Handler {

    /**
     * @param client the connection the message arrived on
     * @param message the parsed message body
     */
    void handle(Client client, Map<String, Object> message);
}
