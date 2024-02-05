using ccxt;
using ccxt.pro;

namespace examples;

partial class Examples
{
// ABOUT CCXT PROXIES, READ MORE AT: https://docs.ccxt.com/#/README?id=proxy
    async public Task proxyUsage_proxyUrl()
    {
        var myEx = new ccxt.kucoin();
        myEx.proxyUrl = "http://5.75.153.75:8090/proxy_url.php?caller=https://ccxt.com&url=";
        Console.WriteLine(await myEx.fetch("https://api.ipify.org/"));
    }

    async public Task proxyUsage_httpProxy()
    {
        var myEx = new ccxt.kucoin();
        myEx.httpProxy = "http://5.75.153.75:8002"; // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
        Console.WriteLine(await myEx.fetch("https://api.ipify.org/"));
    }

    async public Task proxyUsage_socksProxy()
    {
        var myEx = new ccxt.kucoin();
        myEx.socksProxy = "socks5://127.0.0.1:1080"; // from protocols: socks, socks5, socks5h
        Console.WriteLine(await myEx.fetch("https://api.ipify.org/"));
    }

    async public Task proxyUsage_webSockets()
    {
        var myEx = new ccxt.pro.kucoin();
        myEx.httpProxy =
            "http://5.75.153.75:8002"; // even though you are using WebSockets, you might also need to set up proxy for the exchange's REST requests
        myEx.wsProxy =
            "http://5.75.153.75:8002"; // "wsProxy" or "wssProxy" or "wsSocksProxy" (depending on your proxy protocol)
        await myEx.loadMarkets();
        while (true)
        {
            var ticker = await myEx.watchTicker("BTC/USDT");
            Console.WriteLine(ticker);
        }
    }
}