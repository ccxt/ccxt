import io.github.ccxt.BaseExchange;

// Playground sandbox helper, precompiled into runtime/java/classes by
// scripts/setup-runtimes.sh and put on the run classpath by lib/runners/java.ts.
//
// ccxt-java reads NO proxy configuration from the environment (System.getenv
// never appears in io/github/ccxt/**): REST goes through java.net.http.HttpClient,
// which the runner covers with -Dhttps.proxyHost/-Dhttps.proxyPort JVM flags, but
// the Netty WebSocket client (ws/WsClient.java) only proxies when the exchange's
// own wssProxy field is set — JVM flags never reach Netty. So watch* snippets wrap
// construction:  Binance exchange = Playground.proxy(new Binance());
//
// Outside the playground (no proxy env) this is a no-op.
public final class Playground {
    private Playground() {}

    public static <T extends BaseExchange> T proxy(T exchange) {
        String p = System.getenv("HTTPS_PROXY");
        if (p == null || p.isEmpty()) p = System.getenv("https_proxy");
        if (p == null || p.isEmpty()) p = System.getenv("HTTP_PROXY");
        if (p == null || p.isEmpty()) p = System.getenv("http_proxy");
        if (p != null && !p.isEmpty()) {
            exchange.httpsProxy = p; // REST (redundant with the JVM flags; harmless)
            exchange.wssProxy = p;   // WebSocket (Netty HttpProxyHandler)
        }
        return exchange;
    }
}
