package io.github.ccxt.ws;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
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
 * - Owner-thread maps for futures and subscriptions
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

    // State. Every field here is owned by this client's message thread: only an owner
    // task (ownerCall/ownerRun) reads or writes it. The public maps are OwnerMap
    // hand-off views over those owner-thread HashMaps, so transpiled code keeps its shape.
    public String url;
    private final Map<String, Future> futuresOwned = new java.util.LinkedHashMap<>();
    private final Map<String, Object> subscriptionsOwned = new java.util.LinkedHashMap<>();
    private final Map<String, Object> rejectionsOwned = new java.util.LinkedHashMap<>();
    public final Map<String, Future> futures = new OwnerMap<>(this.futuresOwned);
    public final Map<String, Object> subscriptions = new OwnerMap<>(this.subscriptionsOwned);
    public final Map<String, Object> rejections = new OwnerMap<>(this.rejectionsOwned);
    public boolean isConnected = false;
    public boolean startedConnecting = false;
    public long connectionEstablished = 0;
    public CompletableFuture<Boolean> connected;
    public long lastPong = 0;
    // mirrors js Client.error: null while live, the terminal error once retired.
    // Owner-thread state like the rest of the client: a caller reads it through errorState()
    // and publishes it through setError(), both of which are owner tasks.
    private Object error = null;
    public boolean isMock = false; // static ws tests: transport is stubbed, sends are recorded
    public final java.util.List<Object> mockSentMessages = new java.util.ArrayList<>(); // owner thread only
    /**
     * Optional typed reason for a deliberate close. Set by Exchange.close()
     * to an ExchangeClosedByUser before invoking this.close(); the close path
     * then uses it to reject in-flight futures so callers can distinguish
     * "I asked for this" from a remote-side disconnect.
     */
    public Throwable closeReason = null;

    // Set by close()/teardown; owner thread only.
    private boolean closed = false;
    // Owner thread only.
    private boolean executorShutdownScheduled = false;

    // Typed accessors for internal use
    public Map<String, Object> subscriptionsMap() { return subscriptions; }

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
    private Channel channel; // owner thread only; the event loop hands it over in attachChannel
    private String proxy;

    // Headers attached to the upgrade request. Set by Exchange.client() from
    // options.ws.options.headers; createConnection() defaults User-Agent + Origin
    // when missing so Cloudflare-fronted endpoints don't 403 on the bot fingerprint.
    public java.util.Map<String, String> handshakeHeaders;

    // Fallback single-thread executor: one thread per client when the owning exchange
    // installed no owner (standalone WsClient, tests). Serializes owner tasks and keeps
    // frame arrival order. Virtual-thread factory keeps blocking .join() calls cheap.
    private final ExecutorService messageExecutor = Executors.newSingleThreadExecutor(
            Thread.ofVirtual().name("ws-msg-", 0).factory());

    // Installed by the owning exchange: every client of that exchange runs its owner
    // tasks on this one thread, so the ws caches get a single writer by construction.
    private volatile ExecutorService ownerExecutor;

    private ExecutorService executor() {
        ExecutorService shared = this.ownerExecutor;
        return (shared != null) ? shared : this.messageExecutor;
    }

    /** True while this client's own executor (not a shared exchange owner) is in charge. */
    private boolean ownsExecutor() {
        return this.ownerExecutor == null;
    }

    /** Hand the per-exchange owner thread over; null keeps the per-client fallback. */
    public void setOwnerExecutor(ExecutorService owner) {
        this.ownerExecutor = owner;
    }

    /** Grace period before a discarded client's messageExecutor shuts down; overridable in tests. */
    public long executorShutdownDelayMs = 5000;

    // ─── Owner thread ───
    // All mutable client state lives on the owner thread: the exchange's single ws
    // owner when one is installed, else this client's messageExecutor. Callers enter
    // through that executor's queue, so state changes are serialized without a monitor.
    private static final ThreadLocal<Boolean> OWNER = ThreadLocal.withInitial(() -> Boolean.FALSE);

    private boolean isOwner() {
        return OWNER.get(); // unboxed: the ThreadLocal always holds a value
    }

    /** Run body on the owner thread; failures are logged, callers never wait. */
    private void ownerRun(Runnable body) {
        if (this.isOwner()) {
            body.run();
            return;
        }
        try {
            this.executor().execute(() -> {
                OWNER.set(Boolean.TRUE);
                try {
                    body.run();
                } catch (Throwable t) {
                    if (this.verbose) {
                        System.err.println(getFormattedDate() + "owner task failed: " + t);
                    }
                } finally {
                    OWNER.remove();
                }
            });
        } catch (java.util.concurrent.RejectedExecutionException e) {
            body.run(); // owner already retired: discarded client, nothing to serialize against
        }
    }

    /** Run body on the owner thread and return its value to the caller. */
    private <T> T ownerCall(java.util.function.Supplier<T> body) {
        if (this.isOwner()) {
            return body.get();
        }
        CompletableFuture<T> reply = new CompletableFuture<>();
        try {
            this.executor().execute(() -> {
                OWNER.set(Boolean.TRUE);
                try {
                    reply.complete(body.get());
                } catch (Throwable t) {
                    reply.completeExceptionally(t);
                } finally {
                    OWNER.remove();
                }
            });
        } catch (java.util.concurrent.RejectedExecutionException e) {
            return body.get(); // owner already retired: discarded client
        }
        return reply.join();
    }

    /** The terminal error (null while live), read on the owner thread. */
    public Object errorState() {
        return this.ownerCall(() -> this.error);
    }

    /** Publish the terminal error; the owner performs the write, and only the first one lands. */
    public void setError(Object terminal) {
        this.ownerRun(() -> {
            if (this.error == null) {
                this.error = terminal;
            }
        });
    }

    /**
     * Map view whose state lives on the owner thread: every operation is an owner
     * task, so the backing map is single-owner and readers never see a partial write.
     * Bulk reads return a copy taken on the owner; nothing holds a reference to it.
     */
    private final class OwnerMap<K, V> extends java.util.AbstractMap<K, V> {
        private final Map<K, V> owned;

        OwnerMap(Map<K, V> owned) {
            this.owned = owned;
        }

        private <R> R onOwner(java.util.function.Supplier<R> body) {
            return WsClient.this.ownerCall(body);
        }

        private void onOwnerRun(Runnable body) {
            WsClient.this.ownerRun(body);
        }

        private Map<K, V> snapshot() {
            return onOwner(() -> new java.util.LinkedHashMap<>(this.owned));
        }

        @Override public int size() { return onOwner(() -> this.owned.size()); }
        @Override public boolean isEmpty() { return onOwner(() -> this.owned.isEmpty()); }
        @Override public boolean containsKey(Object key) { return onOwner(() -> this.owned.containsKey(key)); }
        @Override public boolean containsValue(Object value) { return onOwner(() -> this.owned.containsValue(value)); }
        @Override public V get(Object key) { return onOwner(() -> this.owned.get(key)); }
        @Override public V getOrDefault(Object key, V fallback) { return onOwner(() -> this.owned.getOrDefault(key, fallback)); }
        @Override public V put(K key, V value) { return onOwner(() -> (value == null) ? this.owned.remove(key) : this.owned.put(key, value)); }
        @Override public V putIfAbsent(K key, V value) { return onOwner(() -> this.owned.putIfAbsent(key, value)); }
        @Override public void putAll(Map<? extends K, ? extends V> other) { onOwnerRun(() -> this.owned.putAll(other)); }
        @Override public V remove(Object key) { return onOwner(() -> this.owned.remove(key)); }
        @Override public boolean remove(Object key, Object value) { return onOwner(() -> this.owned.remove(key, value)); }
        @Override public V replace(K key, V value) { return onOwner(() -> this.owned.replace(key, value)); }
        @Override public boolean replace(K key, V oldValue, V newValue) { return onOwner(() -> this.owned.replace(key, oldValue, newValue)); }
        @Override public V computeIfAbsent(K key, java.util.function.Function<? super K, ? extends V> fn) { return onOwner(() -> this.owned.computeIfAbsent(key, fn)); }
        @Override public V computeIfPresent(K key, java.util.function.BiFunction<? super K, ? super V, ? extends V> fn) { return onOwner(() -> this.owned.computeIfPresent(key, fn)); }
        @Override public V compute(K key, java.util.function.BiFunction<? super K, ? super V, ? extends V> fn) { return onOwner(() -> this.owned.compute(key, fn)); }
        @Override public V merge(K key, V value, java.util.function.BiFunction<? super V, ? super V, ? extends V> fn) { return onOwner(() -> this.owned.merge(key, value, fn)); }
        @Override public void clear() { onOwnerRun(() -> this.owned.clear()); }
        @Override public void forEach(java.util.function.BiConsumer<? super K, ? super V> action) { snapshot().forEach(action); }
        @Override public java.util.Set<K> keySet() { return snapshot().keySet(); }
        @Override public java.util.Collection<V> values() { return snapshot().values(); }
        @Override public java.util.Set<Map.Entry<K, V>> entrySet() { return snapshot().entrySet(); }
    }

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
     * A rejection queued before the future existed fails it fast.
     * Both maps are touched inside one owner task, so the check-then-act is atomic.
     */
    public Future future(String messageHash) {
        return this.ownerCall(() -> this.futureOwned(messageHash));
    }

    private Future futureOwned(String messageHash) {
        Future f = futuresOwned.computeIfAbsent(messageHash, k -> new Future());
        Object rejection = rejectionsOwned.remove(messageHash);
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
     * With no consumer future the value is dropped.
     */
    public void resolve(Object content, Object messageHash2) {
        // hand-off with a reply: a caller observes the settled future when this returns
        this.ownerCall(() -> {
            this.resolveOwned(content, messageHash2);
            return null;
        });
    }

    private void resolveOwned(Object content, Object messageHash2) {
        if (messageHash2 == null) {
            if (this.verbose) {
                System.out.println("resolve received null messageHash");
            }
            return;
        }
        String messageHash = messageHash2.toString();
        Future f = futuresOwned.remove(messageHash);
        rejectionsOwned.remove(messageHash); // clear any stale rejection for this hash
        if (f != null) {
            f.resolve(content);
        }
    }

    /**
     * Reject a specific future, or all futures if messageHash is null.
     */
    public void reject(Object error, Object messageHash2) {
        // hand-off with a reply: a caller observes the settlement when this returns
        this.ownerCall(() -> {
            this.rejectOwned(error, messageHash2);
            return null;
        });
    }

    private void rejectOwned(Object error, Object messageHash2) {
        if (messageHash2 != null) {
            String messageHash = messageHash2.toString();
            Future f = futuresOwned.remove(messageHash);
            if (f == null) {
                rejectionsOwned.put(messageHash, error);
            } else {
                f.reject(error);
            }
        } else {
            // Drain first, then settle: a continuation may re-enter the client.
            var settled = new java.util.ArrayList<Future>();
            for (String key : new java.util.ArrayList<>(futuresOwned.keySet())) {
                Future f = futuresOwned.remove(key);
                if (f != null) {
                    settled.add(f);
                }
            }
            for (Future f : settled) {
                f.reject(error);
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
        return this.ownerCall(() -> this.connectOwned(backoffDelay));
    }

    /**
     * Owner task: the start/CAS and the read of `connected` are one step, so a
     * concurrent onError cannot pair a started flag with a stale future.
     */
    private CompletableFuture<Boolean> connectOwned(int backoffDelay) {
        if (!this.startedConnecting) {
            this.startedConnecting = true;
            if (this.isMock) {
                // mocked transport: the offline harness drives the frames, no socket is opened
                return this.connected;
            }
            if (backoffDelay > 0) {
                CompletableFuture.delayedExecutor(backoffDelay,
                        java.util.concurrent.TimeUnit.MILLISECONDS, Exchange.VIRTUAL_EXECUTOR)
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

            // Dual-stack via NioSocketChannel + JDK resolver (no preferIPv4Stack; no HE delay API).

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
        // hand-off with a reply: the caller observes the opened state when this returns
        this.ownerCall(() -> {
            this.onOpenOwned();
            return null;
        });
    }

    private void onOpenOwned() {
        if (this.verbose) {
            System.out.println(getFormattedDate() + "WsClient connected: " + this.url);
        }
        this.closed = false;
        this.isConnected = true;
        this.connectionEstablished = System.currentTimeMillis();
        this.lastPong = this.connectionEstablished;
        this.connected.complete(true);
        // Keep-alive ticks are owner tasks: no ping thread, no interrupted sleep.
        this.scheduleNextPing(this.keepAlive);
    }

    void onMessage(Object message) {
        this.ownerRun(() -> {
            // Any received frame counts as keepalive — many exchanges (lbank,
            // hashkey, krakenfutures, …) use application-level ping/pong, so
            // onPong() never fires and pingTick would kill a healthy link.
            this.lastPong = System.currentTimeMillis();
            if (this.closed) {
                return; // close() already settled this client: drop late frames
            }
            if (this.handleMessageCallback == null) {
                return;
            }
            // Owner task: Netty's event loop stays free and frames keep arrival order.
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

    public void onPong() {
        this.ownerRun(() -> {
            this.lastPong = System.currentTimeMillis();
            if (this.verbose) {
                System.out.println(getFormattedDate() + "Pong received: " + this.lastPong);
            }
        });
    }

    void onClose(Object reason) {
        this.ownerCall(() -> {
            this.onCloseOwned(reason);
            return null;
        });
    }

    private void onCloseOwned(Object reason) {
        if (this.verbose) {
            System.out.println(getFormattedDate() + "WsClient closed: " + this.url + " reason: " + reason);
        }
        this.isConnected = false;
        this.startedConnecting = false;
        // this.error stays set: BaseExchange.onClose reads it as the terminal marker
        if (this.onCloseCallback != null) {
            this.onCloseCallback.accept(this, reason);
        }
    }

    // mirrors js Client.onError: set the error marker, reset, notify the
    // exchange. one owner task elects a single winner when the transport error,
    // a late onClose and a close race.
    public void onError(Object err) {
        this.ownerCall(() -> {
            this.onErrorOwned(err);
            return null;
        });
    }

    private void onErrorOwned(Object err) {
        if (this.verbose) {
            System.err.println( getFormattedDate() + "WsClient error on " + this.url + ": " + err);
        }
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
        this.isConnected = false;

        // Complete-then-replace: surface the error to current awaiters and
        // install a fresh future for the next connect() attempt.
        if (!this.connected.isDone()) {
            this.connected.completeExceptionally(wrapped);
        }
        this.connected = new CompletableFuture<>();
        // cleared only after the fresh future is installed - a connect() caller
        // that wins the start must be guaranteed to read the new future
        this.startedConnecting = false;

        if (this.error != null) {
            return;
        }
        this.error = wrapped;
        this.subscriptionsOwned.clear();
        this.reject(wrapped); // no messageHash: rejects every pending future

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

    /** Arm the next keep-alive tick on the owner; there is no ping thread to interrupt. */
    private void scheduleNextPing(long delayMs) {
        if (this.keepAlive <= 0) {
            return;
        }
        CompletableFuture.delayedExecutor(delayMs,
                java.util.concurrent.TimeUnit.MILLISECONDS, Exchange.VIRTUAL_EXECUTOR)
                .execute(() -> this.ownerRun(this::pingTick));
    }

    private void pingTick() {
        if (this.closed || !this.isConnected || this.keepAlive <= 0) {
            return;
        }
        long now = System.currentTimeMillis();
        if (this.lastPong == 0) {
            this.lastPong = now;
        }
        if (this.lastPong + this.keepAlive * this.maxPingPongMisses < now) {
            this.onError(new RuntimeException(
                    getFormattedDate() + "Connection to " + this.url + " lost, no pong within " + this.keepAlive + "ms"));
            return;
        }
        boolean ok = true;
        if (this.pingCallback != null) {
            try {
                Object pingResult = this.pingCallback.apply(this);
                if (pingResult != null) {
                    this.send(pingResult);
                } else if (this.channel != null && this.channel.isActive()) {
                    // callback was not overriden we still need to send the frame
                    if (this.verbose) {
                        System.out.println(getFormattedDate() + "Ping Frame: " + this.lastPong);
                    }
                    this.channel.writeAndFlush(new PingWebSocketFrame());
                }
            } catch (Exception pingEx) {
                this.onError(pingEx);
                ok = false;
            }
        } else if (this.channel != null && this.channel.isActive()) {
            if (this.verbose) {
                System.out.println(getFormattedDate() + "Ping Frame: " + this.lastPong);
            }
            this.channel.writeAndFlush(new PingWebSocketFrame());
        }
        if (ok) {
            this.scheduleNextPing(this.keepAlive);
        }
    }

    // ─── Send ───

    /**
     * Send a message over the WebSocket. Accepts String or Object (serialized to JSON).
     * Returns a CompletableFuture that completes when the message is flushed to the network.
     * Callers should handle the returned future to detect send failures.
     */
    public CompletableFuture<Void> send(Object message) {
        if (this.isOwner()) {
            return this.sendOwned(message);
        }
        CompletableFuture<Void> result = new CompletableFuture<>();
        this.ownerRun(() -> this.sendOwned(message).whenComplete((v, err) -> {
            if (err != null) {
                result.completeExceptionally(err);
            } else {
                result.complete(null);
            }
        }));
        return result;
    }

    private CompletableFuture<Void> sendOwned(Object message) {
        if (this.isMock) {
            // static ws tests: record the outgoing frame so the test can assert it
            try {
                String mockJson;
                if (message instanceof String s) {
                    mockJson = s;
                } else {
                    mockJson = JSON_MAPPER.writeValueAsString(message);
                }
                this.mockSentMessages.add(JSON_MAPPER.readValue(mockJson, Object.class));
            } catch (Exception e) {
                // ignore malformed frames, the assertion will surface the gap
            }
            return CompletableFuture.completedFuture(null);
        }
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
     * Does not set this.error: reset() closes on app-level errors and the
     * registry entry is then detached by BaseExchange.onClose's error == null guard.
     */
    public void close() {
        this.ownerCall(() -> {
            this.closeOwned();
            return null;
        });
    }

    private void closeOwned() {
        if (this.closed) {
            return; // idempotent: the first close settles the table
        }
        this.closed = true;
        if (this.verbose) {
            System.out.println("WsClient closing: " + this.url);
        }
        if (this.channel != null && this.channel.isActive()) {
            this.channel.writeAndFlush(new CloseWebSocketFrame());
        }
        this.isConnected = false;
        this.startedConnecting = false;

        // Drain first, then settle: a continuation may re-enter the client.
        // Prefer closeReason (ExchangeClosedByUser) over a bare RuntimeException.
        Throwable rejectionReason = (this.closeReason != null)
                ? this.closeReason
                : new io.github.ccxt.errors.ExchangeClosedByUser("Connection closed by the user");
        var settled = new java.util.ArrayList<Future>();
        for (String key : new java.util.ArrayList<>(futuresOwned.keySet())) {
            Future f = futuresOwned.remove(key);
            if (f != null && !f.isDone()) {
                settled.add(f);
            }
        }
        for (Future f : settled) {
            f.reject(rejectionReason);
        }

        // The owner retires on its own timer, so a late connect() never lands mid-close.
        this.scheduleExecutorShutdownOwned();
    }

    /**
     * Delayed graceful executor shutdown for a discarded client: a synchronous
     * shutdown rejects in-flight frames, omitting it leaks the executor. If the
     * client reconnects before the timer fires, the shutdown is disarmed so a
     * later disconnect can re-arm it.
     */
    public void scheduleExecutorShutdown() {
        this.ownerRun(this::scheduleExecutorShutdownOwned);
    }

    private void scheduleExecutorShutdownOwned() {
        if (this.executorShutdownScheduled) {
            return;
        }
        this.executorShutdownScheduled = true;
        CompletableFuture.delayedExecutor(this.executorShutdownDelayMs,
                java.util.concurrent.TimeUnit.MILLISECONDS, Exchange.VIRTUAL_EXECUTOR)
                .execute(() -> this.ownerRun(() -> {
                    // Same owner as connect(): a reconnect disarms the timer first.
                    if (this.isConnected || this.startedConnecting) {
                        this.executorShutdownScheduled = false;
                        return;
                    }
                    this.closed = true;
                    // A shared exchange owner outlives this client: only retire our own.
                    if (this.ownsExecutor()) {
                        messageExecutor.shutdown();
                    }
                }));
    }

    /** Netty's event loop hands the live transport channel to the owner thread. */
    void attachChannel(Channel ch) {
        this.ownerCall(() -> {
            this.channel = ch;
            return null;
        });
    }

    /**
     * Hand-off for the offline ws test harness: run ws work on the owner thread and
     * wait for it, so a mocked frame and the state it writes never straddle threads.
     */
    public void runOnOwner(Runnable body) {
        this.ownerCall(() -> {
            body.run();
            return null;
        });
    }

    /** For tests and consumers verifying cleanup. */
    public boolean isMessageExecutorShutdown() {
        // a client on the shared exchange owner retires without shutting the owner down
        return this.ownsExecutor() ? messageExecutor.isShutdown() : this.closed;
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
            wsClient.attachChannel(ctx.channel());
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
