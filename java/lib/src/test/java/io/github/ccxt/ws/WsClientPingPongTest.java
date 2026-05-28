package io.github.ccxt.ws;

import static org.junit.jupiter.api.Assertions.*;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.embedded.EmbeddedChannel;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpHeaders;
import io.netty.handler.codec.http.websocketx.PingWebSocketFrame;
import io.netty.handler.codec.http.websocketx.PongWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketClientHandshaker;
import io.netty.handler.codec.http.websocketx.WebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketVersion;

import org.junit.jupiter.api.Test;

import java.net.URI;
import java.nio.charset.StandardCharsets;

/**
 * Binance closes the connection with `1008 Pong timeout` if it sends a server-
 * initiated Ping frame and we don't reply with a Pong carrying the same payload.
 * Netty does NOT auto-respond to inbound Ping frames; that's the application's
 * job. Without the dispatch branch in WsClient.WsClientHandler.channelRead0,
 * inbound Pings are silently dropped and Binance times us out within ~10 minutes.
 */
class WsClientPingPongTest {

    /** Pretend handshake is already complete so we exercise post-handshake frame dispatch. */
    private static class AlwaysCompleteHandshaker extends WebSocketClientHandshaker {
        AlwaysCompleteHandshaker() {
            super(URI.create("ws://example.invalid/"), WebSocketVersion.V13, null,
                    new io.netty.handler.codec.http.DefaultHttpHeaders(), 65536);
        }
        @Override public boolean isHandshakeComplete() { return true; }
        @Override protected io.netty.handler.codec.http.FullHttpRequest newHandshakeRequest() { return null; }
        @Override protected void verify(FullHttpResponse response) {}
        @Override protected io.netty.handler.codec.http.websocketx.WebSocketFrameDecoder newWebsocketDecoder() { return null; }
        @Override protected io.netty.handler.codec.http.websocketx.WebSocketFrameEncoder newWebSocketEncoder() { return null; }
    }

    @Test
    void inboundPingMustTriggerOutboundPongWithSamePayload() throws Exception {
        WsClient client = new WsClient(
                "wss://example.invalid/ws",
                null,
                /* handleMessage */ (c, m) -> {},
                /* ping */ c -> null,
                /* onClose */ (c, r) -> {},
                /* onError */ (c, e) -> {},
                /* verbose */ false,
                /* keepAlive */ 30_000L,
                /* decompressBinary */ false,
                /* validateServerSsl */ true);
        try {
            WsClient.WsClientHandler handler = new WsClient.WsClientHandler(new AlwaysCompleteHandshaker(), client);
            EmbeddedChannel ch = new EmbeddedChannel(handler);

            byte[] payload = "binance-ping-payload".getBytes(StandardCharsets.UTF_8);
            ch.writeInbound(new PingWebSocketFrame(Unpooled.wrappedBuffer(payload)));
            ch.flushOutbound();

            Object out = ch.readOutbound();
            assertNotNull(out, "WsClient must reply to server ping with a pong frame, "
                    + "otherwise Binance closes with 1008 Pong timeout");
            assertTrue(out instanceof PongWebSocketFrame,
                    "expected PongWebSocketFrame outbound, got: " + out.getClass().getName());
            ByteBuf content = ((PongWebSocketFrame) out).content();
            byte[] echoed = new byte[content.readableBytes()];
            content.getBytes(content.readerIndex(), echoed);
            assertArrayEquals(payload, echoed,
                    "Pong reply must echo the ping's payload (RFC 6455 §5.5.3)");

            ch.finish();
        } finally {
            client.close();
        }
    }
}
