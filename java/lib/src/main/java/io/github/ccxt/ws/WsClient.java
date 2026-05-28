package io.github.ccxt.ws;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.zip.GZIPInputStream;
import java.util.zip.Inflater;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.github.ccxt.Exchange;
import io.github.ccxt.base.JsonHelper;
import io.github.ccxt.errors.NetworkError;
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.ChannelPromise;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.http.DefaultHttpHeaders;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpClientCodec;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.websocketx.BinaryWebSocketFrame;
import io.netty.handler.codec.http.websocketx.CloseWebSocketFrame;
import io.netty.handler.codec.http.websocketx.PingWebSocketFrame;
import io.netty.handler.codec.http.websocketx.PongWebSocketFrame;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketClientHandshaker;
import io.netty.handler.codec.http.websocketx.WebSocketClientHandshakerFactory;
import io.netty.handler.codec.http.websocketx.WebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketFrameAggregator;
import io.netty.handler.codec.http.websocketx.WebSocketHandshakeException;
import io.netty.handler.codec.http.websocketx.WebSocketVersion;
import io.netty.handler.codec.http.websocketx.extensions.WebSocketClientExtensionHandler;
import io.netty.handler.codec.http.websocketx.extensions.compression.PerMessageDeflateClientExtensionHandshaker;
import io.netty.handler.codec.http.websocketx.extensions.compression.WebSocketClientCompressionHandler;
import io.netty.handler.proxy.HttpProxyHandler;
import io.netty.handler.proxy.Socks5ProxyHandler;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;

/**
 * Netty-based WebSocket client for CCXT.
 * Matches the architecture of C# Client.cs and Go exchange_wsclient.go:
 * - Single async connection per URL
 * - ConcurrentHashMap for futures and subscriptions
 * - Ping/pong keep-alive loop
 * - Reconnection via lazy re-connect on next watch() call
 */
public class WsClient {

    private static final ObjectMapper JSON_MAPPER = new ObjectMapper();

    // Shared event loop group across all WsClient instances (one per JVM)
    private static final EventLoopGroup SHARED_EVENT_LOOP = new NioEventLoopGroup(
            Math.max(2, Runtime.getRuntime().availableProcessors()));

    static {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            SHARED_EVENT_LOOP.shutdownGracefully();
        }, "ccxt-ws-shutdown"));
    }

    // State — typed as Object for compatibility with transpiled code that casts these
    public String url;
    public Object futures = new ConcurrentHashMap<String, Future>();
    public Object subscriptions = new ConcurrentHashMap<String, Object>();
    public Object rejections = new ConcurrentHashMap<String, Object>();
    public volatile boolean isConnected = false;
    public final AtomicBoolean startedConnecting = new AtomicBoolean(false);
    public volatile long connectionEstablished = 0;
    public volatile CompletableFuture<Boolean> connected;
    public volatile long lastPong = 0;
    public boolean error = false;
    /**
     * Optional typed reason for a deliberate close. Set by Exchange.close()
     * to an ExchangeClosedByUser before invoking this.close(); the close path
     * then uses it to reject in-flight futures so callers can distinguish
     * "I asked for this" from a remote-side disconnect.
     */
    public volatile Throwable closeReason = null;

    // Guards atomic complete-then-replace of `connected` and ping-thread bookkeeping.
    private final Object connectedLock = new Object();
    private volatile Thread pingThread;

    // Typed accessors for internal use
    @SuppressWarnings("unchecked")
    private ConcurrentHashMap<String, Future> futuresMap() { return (ConcurrentHashMap<String, Future>) futures; }
    @SuppressWarnings("unchecked")
    public ConcurrentHashMap<String, Object> subscriptionsMap() { return (ConcurrentHashMap<String, Object>) subscriptions; }
    @SuppressWarnings("unchecked")
    private ConcurrentHashMap<String, Object> rejectionsMap() { return (ConcurrentHashMap<String, Object>) rejections; }

    // Config
    public long keepAlive = 30000;
    public int maxPingPongMisses = 3;
    public boolean verbose = false;
    public boolean validateServerSsl = true;
    public boolean decompressBinary = true;

    // Callbacks (set by Exchange)
    public BiConsumer<WsClient, Object> handleMessageCallback;
    public Function<WsClient, Object> pingCallback;
    public BiConsumer<WsClient, Object> onCloseCallback;
    public BiConsumer<WsClient, Object> onErrorCallback;

    // Netty internals
    private volatile Channel channel;
    private String proxy;

    // Headers attached to the upgrade request. Set by Exchange.client() from
    // options.ws.options.headers; createConnection() defaults User-Agent + Origin
    // when missing so Cloudflare-fronted endpoints don't 403 on the bot fingerprint.
    public java.util.Map<String, String> handshakeHeaders;

    // Per-client single-thread executor: serializes handleMessageCallback so that
    // frames from one connection are processed in arrival order (matches C# Client.cs
    // Receiving loop). Different WsClients still run in parallel since each owns its
    // own executor. Virtual-thread factory keeps blocking .join() calls cheap.
    private final ExecutorService messageExecutor = Executors.newSingleThreadExecutor(
            Thread.ofVirtual().name("ws-msg-", 0).factory());

    public WsClient(String url, String proxy,
                    BiConsumer<WsClient, Object> handleMessage,
                    Function<WsClient, Object> ping,
                    BiConsumer<WsClient, Object> onClose,
                    BiConsumer<WsClient, Object> onError,
                    boolean verbose, long keepAlive, boolean decompressBinary,
                    boolean validateServerSsl) {
        this.url = url;
        this.proxy = proxy;
        this.validateServerSsl = validateServerSsl;
        this.handleMessageCallback = handleMessage;
        this.pingCallback = ping;
        this.onCloseCallback = onClose;
        this.onErrorCallback = onError;
        this.verbose = verbose;
        this.keepAlive = keepAlive;
        this.decompressBinary = decompressBinary;
        this.connected = new CompletableFuture<>();
    }


    public static String getFormattedDate() {
        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

        return "[" + LocalDateTime.now().format(formatter) + "] ";
    }

    // ─── Future management (matches C# Client.cs lines 77-130) ───

    /**
     * Get or create a Future for a messageHash.
     * If a rejection was queued before the future existed, reject it immediately.
     */
    public Future future(String messageHash) {
        Future f = futuresMap().computeIfAbsent(messageHash, k -> new Future());
        Object rejection = rejectionsMap().remove(messageHash);
        if (rejection != null) {
            f.reject(rejection);
        }
        return f;
    }

    public Future reusableFuture(String messageHash) {
        return this.future(messageHash);
    }

    /**
     * Resolve a specific future by messageHash.
     * Removes it from the map so the next watch() call creates a fresh one.
     */
    public void resolve(Object content, Object messageHash2) {
        if (this.verbose && messageHash2 == null) {
            System.out.println("resolve received null messageHash");
            return;
        }
        String messageHash = messageHash2.toString();
        rejectionsMap().remove(messageHash); // clear any stale rejection for this hash
        Future f = futuresMap().remove(messageHash);
        if (f != null) {
            f.resolve(content);
        }
    }

    /**
     * Reject a specific future, or all futures if messageHash is null.
     */
    public void reject(Object error, Object messageHash2) {
        if (messageHash2 != null) {
            String messageHash = messageHash2.toString();
            Future f = futuresMap().remove(messageHash);
            if (f != null) {
                f.reject(error);
            } else {
                rejectionsMap().put(messageHash, error);
            }
        } else {
            // Reject all pending futures — snapshot keys to avoid ConcurrentModificationException.
            var snapshot = new java.util.ArrayList<>(futuresMap().keySet());
            for (String key : snapshot) {
                Future f = futuresMap().remove(key);
                if (f != null) {
                    f.reject(error);
                }
            }
        }
    }

    public void reject(Object error) {
        reject(error, (Object) null);
    }

    /**
     * Reset the client by rejecting all pending futures and closing the connection.
     * Called when an unrecoverable error is detected by exchange-specific WS code.
     */
    public void reset(Object error) {
        this.reject(error);
        this.close();
    }

    // ─── Connection management ───

    /**
     * Connect to the WebSocket server. Returns a future that completes when connected.
     * If already connecting/connected, returns the existing future.
     */
    public CompletableFuture<Boolean> connect(int backoffDelay) {
        if (this.startedConnecting.compareAndSet(false, true)) {
            if (backoffDelay > 0) {
                CompletableFuture.delayedExecutor(backoffDelay,
                        java.util.concurrent.TimeUnit.MILLISECONDS)
                        .execute(this::createConnection);
            } else {
                Exchange.VIRTUAL_EXECUTOR.execute(this::createConnection);
            }
        }
        return this.connected;
    }

    private void createConnection() {
        try {
            URI uri = new URI(this.url);
            String scheme = uri.getScheme();
            String host = uri.getHost();
            int port = uri.getPort();
            if (port == -1) {
                port = "wss".equalsIgnoreCase(scheme) ? 443 : 80;
            }
            boolean ssl = "wss".equalsIgnoreCase(scheme);

            final SslContext sslCtx;
            if (ssl) {
                var sslBuilder = SslContextBuilder.forClient();
                if (!this.validateServerSsl) {
                    sslBuilder.trustManager(InsecureTrustManagerFactory.INSTANCE);
                }
                sslCtx = sslBuilder.build();
            } else {
                sslCtx = null;
            }

            // Netty doesn't auto-attach User-Agent/Origin like browser/node WebSocket
            // libraries do, so we set them ourselves — caller-supplied values win.
            DefaultHttpHeaders requestHeaders = new DefaultHttpHeaders();
            boolean hasUserAgent = false;
            boolean hasOrigin = false;
            if (this.handshakeHeaders != null) {
                for (java.util.Map.Entry<String, String> e : this.handshakeHeaders.entrySet()) {
                    if (e.getKey() == null || e.getValue() == null) continue;
                    requestHeaders.add(e.getKey(), e.getValue());
                    if ("User-Agent".equalsIgnoreCase(e.getKey())) hasUserAgent = true;
                    if ("Origin".equalsIgnoreCase(e.getKey())) hasOrigin = true;
                }
            }
            if (!hasUserAgent) {
                requestHeaders.add("User-Agent", "ccxt/java");
            }
            if (!hasOrigin) {
                String origin = ("wss".equalsIgnoreCase(scheme) ? "https://" : "http://") + host;
                requestHeaders.add("Origin", origin);
            }

            WebSocketClientHandshaker handshaker = WebSocketClientHandshakerFactory.newHandshaker(
                    uri, WebSocketVersion.V13, null, true,
                    requestHeaders, 65536 * 100);

            final WsClientHandler handler = new WsClientHandler(handshaker, this);
            final int finalPort = port;

            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(SHARED_EVENT_LOOP)
                    .channel(NioSocketChannel.class)
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) {
                            ChannelPipeline pipeline = ch.pipeline();

                            // Proxy support
                            if (proxy != null && !proxy.isEmpty()) {
                                try {
                                    URI proxyUri = new URI(proxy);
                                    if ("socks5".equalsIgnoreCase(proxyUri.getScheme())) {
                                        pipeline.addLast(new Socks5ProxyHandler(
                                                new InetSocketAddress(proxyUri.getHost(), proxyUri.getPort())));
                                    } else {
                                        pipeline.addLast(new HttpProxyHandler(
                                                new InetSocketAddress(proxyUri.getHost(), proxyUri.getPort())));
                                    }
                                } catch (Exception e) {
                                    if (verbose) System.err.println("Proxy config error: " + e.getMessage());
                                }
                            }

                            // SSL
                            if (sslCtx != null) {
                                pipeline.addLast(sslCtx.newHandler(ch.alloc(), host, finalPort));
                            }

                            // HTTP codec for WebSocket handshake
                            pipeline.addLast(new HttpClientCodec());
                            pipeline.addLast(new HttpObjectAggregator(65536 * 100));

                            // WebSocket compression (permessage-deflate). A new instance
                            // per channel is required because WebSocketClientExtensionHandler
                            // is not @Sharable. The flags below match gorilla/websocket
                            // defaults and accept server_no_context_takeover /
                            // client_no_context_takeover (e.g. Coinbase).
                            pipeline.addLast(new WebSocketClientExtensionHandler(
                                    new PerMessageDeflateClientExtensionHandshaker(6, true, 15, true, true)));

                            // Reassemble fragmented frames before handing to our handler.
                            // Without this, bingx/bitrue's large gzip-compressed data frames
                            // are split into a leading BinaryWebSocketFrame + multiple
                            // ContinuationWebSocketFrames; we only consume the first chunk
                            // (truncated gzip → decompress fails → message silently dropped →
                            // watchOrderBook future never resolves). 8 MiB matches Netty docs'
                            // recommended cap for market-data feeds.
                            pipeline.addLast(new WebSocketFrameAggregator(8 * 1024 * 1024));

                            // WebSocket frame handler
                            pipeline.addLast(handler);
                        }
                    });

            bootstrap.connect(host, port).sync();
            handler.handshakeFuture().sync();

        } catch (Exception e) {
            if (this.verbose) {
                System.err.println(getFormattedDate() + "WebSocket connection error: " + e.getMessage());
            }
            this.onError(e);
        }
    }

    void onOpen() {
        if (this.verbose) {
            System.out.println(getFormattedDate() + "WsClient connected: " + this.url);
        }
        this.isConnected = true;
        this.connectionEstablished = System.currentTimeMillis();
        this.lastPong = this.connectionEstablished;
        this.connected.complete(true);

        // Start ping loop on a virtual thread; keep a reference so close() can interrupt it.
        this.pingThread = Thread.ofVirtual().start(this::pingLoop);
    }

    void onMessage(Object message) {
        // Any received frame counts as keepalive — many exchanges (lbank,
        // hashkey, krakenfutures, …) use application-level ping/pong rather
        // than WS protocol PING/PONG, so onPong() never fires. Without this,
        // pingLoop kills the connection after `keepAlive * maxPingPongMisses`
        // ms even though the link is healthy and delivering data.
        this.lastPong = System.currentTimeMillis();
        if (this.handleMessageCallback != null) {
            // Offload to a per-client single-thread executor: keeps Netty's event loop
            // unblocked AND preserves frame ordering per connection. Cross-frame races
            // on shared exchange state (orderbook cache, balance sub-maps, etc.) are
            // eliminated for same-client traffic.
            messageExecutor.execute(() -> {
                try {
                    if (this.verbose) {
                        System.out.println(getFormattedDate() + "OnMessage:" + message);
                    }
                    this.handleMessageCallback.accept(this, message);
                } catch (Exception e) {
                    if (this.verbose) {
                        System.err.println("handleMessage error: " + e.getMessage());
                    }
                    this.reject(e);
                }
            });
        }
    }

    public void onPong() {
        this.lastPong = System.currentTimeMillis();
        if (this.verbose) {
            System.out.println(getFormattedDate() + "Pong received: " + this.lastPong);
        }
    }

    void onClose(Object reason) {
        if (this.verbose) {
            System.out.println(getFormattedDate() + "WsClient closed: " + this.url + " reason: " + reason);
        }
        this.isConnected = false;
        this.startedConnecting.set(false);
        this.error = false;
        if (this.onCloseCallback != null) {
            this.onCloseCallback.accept(this, reason);
        }
    }

    void onError(Object err) {
        if (this.verbose) {
            System.err.println( getFormattedDate() + "WsClient error on " + this.url + ": " + err);
        }
        this.isConnected = false;
        this.startedConnecting.set(false);
        this.error = true;

        Throwable t = (err instanceof Throwable th)
                ? th
                : new RuntimeException(String.valueOf(err));

        // Wrap raw Netty / I/O / SSL exceptions in NetworkError so the test
        // harness's isTemporaryFailure() check (instanceof OperationFailed)
        // treats them as transient — matches Python's `NetworkError(str(e))`
        // behaviour. Without this, a handshake 4xx or socket reset propagates
        // out of `watch()` as the raw WebSocketHandshakeException and tests
        // mark it as a fatal failure instead of retrying.
        Throwable wrapped = wrapAsNetworkError(t);

        // Complete-then-replace: surface the error to current awaiters and
        // install a fresh future for the next connect() attempt.
        synchronized (connectedLock) {
            if (!this.connected.isDone()) {
                this.connected.completeExceptionally(wrapped);
            }
            this.connected = new CompletableFuture<>();
        }

        if (this.onErrorCallback != null) {
            this.onErrorCallback.accept(this, wrapped);
        }
    }

    /** See onError — wraps connection-level exceptions in NetworkError. */
    private static Throwable wrapAsNetworkError(Throwable t) {
        if (t instanceof io.github.ccxt.errors.BaseError) {
            return t;
        }
        String pkg = t.getClass().getName();
        boolean isNetwork =
            pkg.startsWith("io.netty.")
            || t instanceof java.net.SocketException
            || t instanceof java.net.UnknownHostException
            || t instanceof java.io.IOException
            || t instanceof java.util.concurrent.TimeoutException
            || t instanceof javax.net.ssl.SSLException;
        if (!isNetwork) return t;
        String msg = t.getMessage() != null ? t.getMessage() : t.getClass().getSimpleName();
        io.github.ccxt.errors.NetworkError wrapped =
                new io.github.ccxt.errors.NetworkError(msg);
        wrapped.initCause(t);
        return wrapped;
    }

    // ─── Ping/Pong keep-alive ───

    private void pingLoop() {
        try {
            Thread.sleep(this.keepAlive);
            long now = System.currentTimeMillis();
            if (this.lastPong == 0) {
                this.lastPong = now;
            }

            while (this.keepAlive > 0 && this.isConnected) {
                now = System.currentTimeMillis();
                if (this.lastPong + this.keepAlive * this.maxPingPongMisses < now) {
                    this.onError(new RuntimeException(
                          getFormattedDate() + "Connection to " + this.url + " lost, no pong within " + this.keepAlive + "ms"));
                    break;
                }

                if (this.pingCallback != null) {
                    try {
                        Object pingResult = this.pingCallback.apply(this);
                        if (pingResult != null) {
                            this.send(pingResult);
                        } else {
                            // callback was not overriden we still need to send the frame
                            if (this.channel != null && this.channel.isActive()) {
                                if (this.verbose) {
                                    System.out.println(getFormattedDate() + "Ping Frame: " + this.lastPong);
                                }
                                this.channel.writeAndFlush(new PingWebSocketFrame());
                            }
                        }
                    } catch (Exception pingEx) {
                        this.onError(pingEx);
                        break;
                    }
                } else if (this.channel != null && this.channel.isActive()) {
                    if (this.verbose) {
                        System.out.println(getFormattedDate() + "Ping Frame: " + this.lastPong);
                    }
                    this.channel.writeAndFlush(new PingWebSocketFrame());
                }

                Thread.sleep(this.keepAlive);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            if (this.verbose) {
                System.err.println(getFormattedDate() + "PingLoop error: " + e.getMessage());
            }
            this.onError(e);
        }
    }

    // ─── Send ───

    /**
     * Send a message over the WebSocket. Accepts String or Object (serialized to JSON).
     * Returns a CompletableFuture that completes when the message is flushed to the network.
     * Callers should handle the returned future to detect send failures.
     */
    public CompletableFuture<Void> send(Object message) {
        String json;
        if (message instanceof String s) {
            json = s;
        } else {
            try {
                json = JSON_MAPPER.writeValueAsString(message);
            } catch (Exception e) {
                json = String.valueOf(message);
            }
        }

        if (this.verbose) {
            System.out.println(getFormattedDate() +  "Sending: " + json);
        }

        if (this.channel != null && this.channel.isActive()) {
            CompletableFuture<Void> result = new CompletableFuture<>();
            this.channel.writeAndFlush(new TextWebSocketFrame(json)).addListener(future -> {
                if (future.isSuccess()) {
                    result.complete(null);
                } else {
                    result.completeExceptionally(future.cause());
                }
            });
            return result;
        }
        return CompletableFuture.failedFuture(
                new RuntimeException("WebSocket not connected: " + this.url));
    }

    /**
     * Close the WebSocket connection and reject all pending futures.
     */
    public void close() {
        if (this.verbose) {
            System.out.println("WsClient closing: " + this.url);
        }
        if (this.channel != null && this.channel.isActive()) {
            this.channel.writeAndFlush(new CloseWebSocketFrame());
        }
        this.isConnected = false;
        this.startedConnecting.set(false);

        // Wake the ping loop so it exits without waiting for the next keepAlive tick.
        Thread pt = this.pingThread;
        if (pt != null) {
            pt.interrupt();
        }

        // Snapshot keys before mutating the map to avoid ConcurrentModificationException.
        // Prefer the typed closeReason (set by Exchange.close()) over a bare
        // RuntimeException, so consumers can `catch (ExchangeClosedByUser)` and
        // tell deliberate shutdown from a remote-side disconnect.
        Throwable rejectionReason = (this.closeReason != null)
                ? this.closeReason
                : new io.github.ccxt.errors.ExchangeClosedByUser("Connection closed by the user");
        var snapshot = new java.util.ArrayList<>(futuresMap().keySet());
        for (String key : snapshot) {
            Future f = futuresMap().remove(key);
            if (f != null && !f.isDone()) {
                f.reject(rejectionReason);
            }
        }

        messageExecutor.shutdown();
    }

    // ─── Binary decompression (matches C# lines 393-471) ───
    // Note: Netty handles WebSocket frame aggregation before our handler sees frames,
    // so multi-frame deflate messages are already reassembled at this point.

    static String decompressGzip(byte[] data) {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(data);
             GZIPInputStream gis = new GZIPInputStream(bais)) {
            return new String(gis.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("GZIP decompression failed", e);
        }
    }

    static String decompressDeflate(byte[] data) {
        Inflater inflater = new Inflater(true); // raw deflate (no header)
        try {
            inflater.setInput(data);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[4096];
            while (!inflater.finished()) {
                int count = inflater.inflate(buf);
                if (count == 0 && inflater.needsInput()) break;
                out.write(buf, 0, count);
            }
            return out.toString(StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Deflate decompression failed", e);
        } finally {
            inflater.end();
        }
    }

    static boolean looksLikeGzip(byte[] data) {
        return data.length >= 2 && (data[0] & 0xFF) == 0x1f && (data[1] & 0xFF) == 0x8b;
    }

    static boolean looksLikeRawDeflate(byte[] data) {
        if (data.length < 1) return false;
        int btype = (data[0] >> 1) & 0b11;
        return btype == 0b01 || btype == 0b10;
    }

    // ─── Netty WebSocket frame handler ───

    // Note: SimpleChannelInboundHandler with channelRead0 auto-releases ByteBuf references
    // (including BinaryWebSocketFrame content), so no manual ReferenceCountUtil.release() is needed.
    static class WsClientHandler extends SimpleChannelInboundHandler<Object> {

        private final WebSocketClientHandshaker handshaker;
        private final WsClient wsClient;
        private ChannelPromise handshakePromise;
        private final StringBuilder textBuffer = new StringBuilder();

        WsClientHandler(WebSocketClientHandshaker handshaker, WsClient wsClient) {
            this.handshaker = handshaker;
            this.wsClient = wsClient;
        }

        ChannelFuture handshakeFuture() {
            return handshakePromise;
        }

        @Override
        public void handlerAdded(ChannelHandlerContext ctx) {
            handshakePromise = ctx.newPromise();
        }

        @Override
        public void channelActive(ChannelHandlerContext ctx) {
            handshaker.handshake(ctx.channel());
            wsClient.channel = ctx.channel();
        }

        @Override
        public void channelInactive(ChannelHandlerContext ctx) {
            // Mirror JS/Python/PHP/Go which all construct a NetworkError at the
            // WS close site (e.g. ts/src/base/ws/Client.ts onClose:298,
            // python/ccxt/async_support/base/ws/client.py:224). Passing a String
            // here would let it propagate through cleanupWsClient unwrapped and
            // surface as a plain RuntimeException, defeating the test harness's
            // OperationFailed-based retry path.
            wsClient.onClose(new NetworkError("connection closed by remote server"));
        }

        @Override
        protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
            Channel ch = ctx.channel();

            if (!handshaker.isHandshakeComplete()) {
                try {
                    handshaker.finishHandshake(ch, (FullHttpResponse) msg);
                    handshakePromise.setSuccess();
                    wsClient.onOpen();
                } catch (WebSocketHandshakeException e) {
                    handshakePromise.setFailure(e);
                    wsClient.onError(e);
                }
                return;
            }

            if (msg instanceof FullHttpResponse response) {
                throw new IllegalStateException(
                        "Unexpected FullHttpResponse (status=" + response.status() + ")");
            }

            WebSocketFrame frame = (WebSocketFrame) msg;

            if (frame instanceof TextWebSocketFrame textFrame) {
                String text = textFrame.text();
                Object parsed = text;
                try {
                    parsed = JsonHelper.deserialize(text);
                } catch (Exception e) {
                    // Not JSON — pass raw string
                }
                wsClient.onMessage(parsed);

            } else if (frame instanceof BinaryWebSocketFrame binaryFrame) {
                byte[] data = new byte[binaryFrame.content().readableBytes()];
                binaryFrame.content().readBytes(data);

                if (!wsClient.decompressBinary) {
                    wsClient.onMessage(data);
                    return;
                }

                // Try decompression. The looksLikeRawDeflate heuristic checks
                // only 2 bits of the first byte and false-positives on plain
                // JSON: `{` (0x7B) and `[` (0x5B) both pass it. If the WS server
                // has permessage-deflate negotiated, Netty already decompressed
                // the frame and the bytes here are JSON — re-inflating crashes
                // with `Deflate decompression failed`. Fall back to UTF-8 when
                // decompression throws so a bad heuristic guess doesn't kill
                // the whole subscription.
                String text;
                if (looksLikeGzip(data)) {
                    try {
                        text = decompressGzip(data);
                    } catch (Exception e) {
                        text = new String(data, StandardCharsets.UTF_8);
                    }
                } else if (looksLikeRawDeflate(data)) {
                    try {
                        text = decompressDeflate(data);
                    } catch (Exception e) {
                        text = new String(data, StandardCharsets.UTF_8);
                    }
                } else {
                    text = new String(data, StandardCharsets.UTF_8);
                }

                Object parsed = text;
                try {
                    parsed = JsonHelper.deserialize(text);
                } catch (Exception e) {
                    // Not JSON
                }
                wsClient.onMessage(parsed);

            } else if (frame instanceof PingWebSocketFrame pingFrame) {
                // RFC 6455 §5.5.3: a Pong frame sent in response to a Ping frame
                // must echo the Ping's application data. Without this reply,
                // Binance closes the stream with `1008 Pong timeout`.
                if (wsClient.verbose) {
                    System.out.println(getFormattedDate() + "Received Ping Frame will respond with Pong");
                }
                ctx.writeAndFlush(new PongWebSocketFrame(pingFrame.content().retain()));

            } else if (frame instanceof PongWebSocketFrame) {
                wsClient.onPong();

            } else if (frame instanceof CloseWebSocketFrame closeFrame) {
                wsClient.onClose(new NetworkError(
                    "connection closed by remote server, closing code " + closeFrame.statusCode()
                    + " " + closeFrame.reasonText()));
            }
        }

        @Override
        public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
            if (!handshakePromise.isDone()) {
                handshakePromise.setFailure(cause);
            }
            wsClient.onError(cause);
            ctx.close();
        }
    }
}
