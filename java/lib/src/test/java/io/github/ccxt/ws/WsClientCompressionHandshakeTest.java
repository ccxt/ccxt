package io.github.ccxt.ws;

import static org.junit.jupiter.api.Assertions.*;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.Unpooled;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpHeaderNames;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.HttpVersion;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.net.InetSocketAddress;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.concurrent.TimeUnit;

/**
 * Coinbase's WebSocket server advertises permessage-deflate parameters
 * including `server_no_context_takeover` and `client_no_context_takeover`,
 * which Netty's default WebSocketClientCompressionHandler.INSTANCE refuses
 * with `CodecException: invalid WebSocket Extension handshake`.
 *
 * This test boots a localhost Netty WebSocket server configured the same way
 * (allow-no-context, request-no-context), then asserts WsClient can complete
 * the handshake. Without the permissive PerMessageDeflateClientExtensionHandshaker
 * in WsClient.java, this fails — proving the fix works in-process and protects
 * any other exchange that adopts the same extension parameters.
 */
class WsClientCompressionHandshakeTest {

    private static final String WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

    /**
     * Hand-crafts the WebSocket handshake response so that the
     * `Sec-WebSocket-Extensions` header always includes
     * `server_no_context_takeover` and `client_no_context_takeover` —
     * exactly what Coinbase advertises. Netty's bundled server-side
     * handshakers don't unilaterally include these unless the client
     * already offers them, so we bypass them here to force the bug surface.
     */
    private static class CoinbaseLikeHandshakeResponder
            extends io.netty.channel.SimpleChannelInboundHandler<FullHttpRequest> {
        @Override
        protected void channelRead0(ChannelHandlerContext ctx, FullHttpRequest req) throws Exception {
            String key = req.headers().get(HttpHeaderNames.SEC_WEBSOCKET_KEY);
            String accept = Base64.getEncoder().encodeToString(
                    MessageDigest.getInstance("SHA-1")
                            .digest((key + WS_GUID).getBytes("UTF-8")));
            FullHttpResponse resp = new DefaultFullHttpResponse(
                    HttpVersion.HTTP_1_1, HttpResponseStatus.SWITCHING_PROTOCOLS, Unpooled.EMPTY_BUFFER);
            resp.headers().set(HttpHeaderNames.UPGRADE, "websocket");
            resp.headers().set(HttpHeaderNames.CONNECTION, "Upgrade");
            resp.headers().set(HttpHeaderNames.SEC_WEBSOCKET_ACCEPT, accept);
            resp.headers().set(HttpHeaderNames.SEC_WEBSOCKET_EXTENSIONS,
                    "permessage-deflate; server_no_context_takeover; client_no_context_takeover");
            ctx.writeAndFlush(resp);
        }
    }

    @Test
    @Timeout(value = 15, unit = TimeUnit.SECONDS)
    void wsClientHandshakesAgainstNoContextDeflateServer() throws Exception {
        EventLoopGroup boss = new NioEventLoopGroup(1);
        EventLoopGroup worker = new NioEventLoopGroup(2);
        Channel server = null;
        WsClient client = null;
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(boss, worker)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) {
                            ChannelPipeline p = ch.pipeline();
                            p.addLast(new HttpServerCodec());
                            p.addLast(new HttpObjectAggregator(65536));
                            p.addLast(new CoinbaseLikeHandshakeResponder());
                        }
                    });

            server = b.bind(new InetSocketAddress("127.0.0.1", 0)).sync().channel();
            int port = ((InetSocketAddress) server.localAddress()).getPort();

            client = new WsClient(
                    "ws://127.0.0.1:" + port + "/ws", null,
                    /* handleMessage */ (c, m) -> {},
                    /* ping */ c -> null,
                    /* onClose */ (c, r) -> {},
                    /* onError */ (c, e) -> {},
                    /* verbose */ false,
                    /* keepAlive */ 30_000L,
                    /* decompressBinary */ false,
                    /* validateServerSsl */ true);

            // connect() throws on handshake failure (e.g. CodecException). If the
            // permissive handshaker isn't wired up in WsClient, this is where the
            // Coinbase bug surfaces.
            Boolean connected = client.connect(0).get(10, TimeUnit.SECONDS);

            assertTrue(connected != null && connected,
                    "WsClient handshake must complete against a server requiring "
                            + "client_no_context_takeover; default INSTANCE rejects it.");
            assertTrue(client.isConnected, "client must be in connected state");
        } finally {
            if (client != null) client.close();
            if (server != null) server.close().sync();
            worker.shutdownGracefully();
            boss.shutdownGracefully();
        }
    }

    /**
     * Pin: the permissive compression handler must be instantiated per-pipeline.
     * WebSocketClientExtensionHandler is NOT annotated @Sharable (unlike Netty's
     * stock WebSocketClientCompressionHandler.INSTANCE), so reusing one instance
     * across multiple WsClients crashes pipeline init on every connection past
     * the first with `ChannelPipelineException: ... is not a @Sharable handler,
     * so can't be added or removed multiple times.` Real-world impact: every WS
     * exchange after the first fails its handshake when running the live sweep
     * concurrently. This test opens TWO WsClients against the same server to
     * catch a regression to the static-instance form.
     */
    @Test
    @Timeout(value = 15, unit = TimeUnit.SECONDS)
    void multipleWsClientsCanShareTheCompressionHandlerSetup() throws Exception {
        EventLoopGroup boss = new NioEventLoopGroup(1);
        EventLoopGroup worker = new NioEventLoopGroup(2);
        Channel server = null;
        WsClient a = null;
        WsClient b = null;
        try {
            ServerBootstrap srv = new ServerBootstrap();
            srv.group(boss, worker)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) {
                            ChannelPipeline p = ch.pipeline();
                            p.addLast(new HttpServerCodec());
                            p.addLast(new HttpObjectAggregator(65536));
                            p.addLast(new CoinbaseLikeHandshakeResponder());
                        }
                    });
            server = srv.bind(new InetSocketAddress("127.0.0.1", 0)).sync().channel();
            int port = ((InetSocketAddress) server.localAddress()).getPort();

            a = newClient("ws://127.0.0.1:" + port + "/ws/a");
            b = newClient("ws://127.0.0.1:" + port + "/ws/b");

            assertTrue(a.connect(0).get(8, TimeUnit.SECONDS),
                    "first client must connect cleanly");
            assertTrue(b.connect(0).get(8, TimeUnit.SECONDS),
                    "second client must also connect — fails when the compression "
                            + "handler is reused as a static @Sharable-less instance");
        } finally {
            if (a != null) a.close();
            if (b != null) b.close();
            if (server != null) server.close().sync();
            worker.shutdownGracefully();
            boss.shutdownGracefully();
        }
    }

    private static WsClient newClient(String url) {
        return new WsClient(
                url, null,
                (c, m) -> {}, c -> null, (c, r) -> {}, (c, e) -> {},
                false, 30_000L, false, true);
    }
}
