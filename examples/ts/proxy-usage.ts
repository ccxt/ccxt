
import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

// ABOUT CCXT PROXIES, READ MORE AT: https://docs.ccxt.com/#/README?id=proxy

async function example_proxyUrl () {
    const myEx = new ccxt.kucoin ();
    myEx.proxyUrl = 'http://5.75.153.75:8090/proxy_url.php?caller=https://ccxt.com&url=';
    console.log (await myEx.fetch ('https://api.ipify.org/'));
}

async function example_httpProxy () {
    const myEx = new ccxt.kucoin ();
    myEx.httpProxy = 'http://5.75.153.75:8002'; // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    console.log (await myEx.fetch ('https://api.ipify.org/'));
}

async function example_socksProxy () {
    const myEx = new ccxt.kucoin ();
    myEx.socksProxy = 'socks5://127.0.0.1:1080'; // from protocols: socks, socks5, socks5h
    console.log (await myEx.fetch ('https://api.ipify.org/'));
}

async function example_webSockets () {
    const myEx = new ccxt.pro.kucoin ();
    myEx.httpsProxy = 'http://5.75.153.75:8002'; // httpProxy or httpsProxy for REST requests ( even though you are using WebSockets, you might also need to set up proxy for the exchange's REST requests)
    await myEx.loadMarkets ();
    myEx.wssProxy = 'http://5.75.153.75:8002'; // "wsProxy" or "wssProxy" or "wsSocksProxy" (depending on your proxy protocol)
    while (true) {
        const ticker = await myEx.watchTicker ('BTC/USDT');
        console.log (ticker);
        break;
    }
    // ### to ensure that ws-proxy works correctly and how remote test server sees your IP, use below and check output ###
    // myEx.verbose = true;
    // await myEx.loadHttpProxyAgent (); // only in js, if ws:// protocol is used
    // await myEx.watch ('ws://5.75.153.75:9876', 'test', 'test');
}


// test any from: example_proxyUrl(), example_httpProxy(), example_socksProxy(), example_webSockets()
await example_httpProxy ();
