using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.WebSockets;
using System.Reflection;

namespace Tests;

using ccxt;

// hand-written C#-only dual-stack (IPv4 + IPv6) transport tests — fully offline,
// no network I/O is performed; only transport configuration is inspected.
public partial class BaseTest
{
    public void testDualStack()
    {
        var exchange = new ccxt.Exchange();
        Assert(exchange.httpClient != null, "httpClient should be initialized in the constructor");

        // the library targets netstandard2.0/2.1 and constructs an HttpClientHandler
        // (the _handler field is declared on the base HttpMessageInvoker type, so
        // walk up the hierarchy to find it)
        FieldInfo handlerField = null;
        for (var t = typeof(HttpClient); t != null && handlerField == null; t = t.BaseType)
        {
            handlerField = t.GetField("_handler", BindingFlags.NonPublic | BindingFlags.Instance);
        }
        Assert(handlerField != null, "HttpClient handler field (_handler) should exist");
        var handler = handlerField.GetValue(exchange.httpClient) as HttpMessageHandler;
        Assert(handler != null, "HttpClient's inner handler should not be null");
        Assert(handler is HttpClientHandler, "handler should be an HttpClientHandler, got: " + handler.GetType().FullName);
        var clientHandler = (HttpClientHandler)handler;
        Assert(clientHandler.Proxy == null, "proxy should be null by default");
        Assert((clientHandler.AutomaticDecompression & DecompressionMethods.GZip) == DecompressionMethods.GZip, "gzip decompression should remain enabled");
        Assert((clientHandler.AutomaticDecompression & DecompressionMethods.Deflate) == DecompressionMethods.Deflate, "deflate decompression should remain enabled");

        // On modern runtimes HttpClientHandler wraps SocketsHttpHandler. Assert
        // the effective transport is that handler and that no custom dial was
        // installed, so the runtime's own default (dual-stack) connect is used.
        var underlyingField = typeof(HttpClientHandler).GetField("_underlyingHandler", BindingFlags.NonPublic | BindingFlags.Instance);
        Assert(underlyingField != null, "HttpClientHandler._underlyingHandler field should exist on this runtime");
        var underlying = underlyingField.GetValue(clientHandler);
        Assert(underlying != null, "underlying handler should not be null");
        Assert(underlying is SocketsHttpHandler, "underlying handler should be a SocketsHttpHandler (dual-stack default), got: " + underlying.GetType().FullName);
        var connectCallback = typeof(SocketsHttpHandler).GetProperty("ConnectCallback");
        Assert(connectCallback != null, "SocketsHttpHandler.ConnectCallback property should exist on this runtime");
        Assert(connectCallback.GetValue(underlying) == null, "ConnectCallback should stay unset: the default dual-stack connect must be used (a callback filtering AddressFamily.InterNetwork would break IPv6)");

        // Connect aggressiveness is at its floor and is runtime-owned.
        //
        // .NET does not implement Happy Eyeballs (RFC 8305) -- dotnet/runtime#26177
        // is open with milestone "Future" -- so resolved addresses are dialed
        // *sequentially*, never raced. There is consequently no HE delay knob to
        // lower: no address-family selector, no connect-attempt-delay, nothing.
        // Pin that fact so this test starts failing (prompting a re-review of the
        // comments in Exchange.initHttpClient) if a future runtime adds one.
        var socketsHandlerMembers = typeof(SocketsHttpHandler)
            .GetMembers(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Static)
            .Select(m => m.Name)
            .Where(n => n.IndexOf("Happy", StringComparison.OrdinalIgnoreCase) >= 0
                     || n.IndexOf("Eyeball", StringComparison.OrdinalIgnoreCase) >= 0
                     || n.IndexOf("AddressFamily", StringComparison.OrdinalIgnoreCase) >= 0
                     || n.IndexOf("AttemptDelay", StringComparison.OrdinalIgnoreCase) >= 0
                     || n.IndexOf("ConnectDelay", StringComparison.OrdinalIgnoreCase) >= 0)
            .Distinct()
            .ToList();
        Assert(socketsHandlerMembers.Count == 0, "SocketsHttpHandler is expected to expose no Happy Eyeballs / address-family / connect-delay surface (sequential dial, lowest possible aggressiveness); found: " + string.Join(", ", socketsHandlerMembers));

        // ClientWebSocketOptions likewise exposes no such knob.
        var wsOptionMembers = typeof(ClientWebSocketOptions)
            .GetMembers(BindingFlags.Public | BindingFlags.Instance)
            .Select(m => m.Name)
            .Where(n => n.IndexOf("Happy", StringComparison.OrdinalIgnoreCase) >= 0
                     || n.IndexOf("AddressFamily", StringComparison.OrdinalIgnoreCase) >= 0
                     || n.IndexOf("AttemptDelay", StringComparison.OrdinalIgnoreCase) >= 0)
            .Distinct()
            .ToList();
        Assert(wsOptionMembers.Count == 0, "ClientWebSocketOptions is expected to expose no Happy Eyeballs / address-family surface; found: " + string.Join(", ", wsOptionMembers));

        // proxy path: setting httpProxy re-creates the client and must keep the
        // same dual-stack-friendly handler type with the proxy attached
        exchange.httpProxy = "http://127.0.0.1:8888";
        Assert(exchange.httpClient != null, "httpClient should be re-created when httpProxy is set");
        var proxiedHandler = handlerField.GetValue(exchange.httpClient) as HttpMessageHandler;
        Assert(proxiedHandler is HttpClientHandler, "proxied handler should still be an HttpClientHandler, got: " + proxiedHandler.GetType().FullName);
        Assert(((HttpClientHandler)proxiedHandler).Proxy != null, "proxy should be set when httpProxy is configured");

        // WS transport: ClientWebSocket is dual-stack by default (the OS picks
        // the address family) and exposes no address-family knob at all — assert
        // the client is created and that no proxy is attached unless configured
        var wsClient = new BaseExchange.WebSocketClient("wss://example.com", null, null);
        Assert(wsClient.webSocket != null, "webSocket should be initialized");
        Assert(wsClient.webSocket is ClientWebSocket, "webSocket should be a ClientWebSocket");
        var wsProxied = new BaseExchange.WebSocketClient("wss://example.com", "http://127.0.0.1:8888", null);
        Assert(wsProxied.webSocket.Options.Proxy != null, "ws proxy should be set when a proxy is configured");
    }
}
