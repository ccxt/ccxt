import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
// ABOUT CCXT PROXIES, READ MORE AT: https://docs.ccxt.com/#/README?id=proxy
async function example_proxyUrl() {
    const myEx = new ccxt.kucoin();
    myEx.proxyUrl = 'http://5.75.153.75:8090/proxy_url.php?caller=https://ccxt.com&url=';
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
async function example_httpProxy() {
    const myEx = new ccxt.kucoin();
    myEx.httpProxy = 'http://5.75.153.75:8002'; // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
async function example_socksProxy() {
    const myEx = new ccxt.kucoin();
    myEx.socksProxy = 'socks5://127.0.0.1:1080'; // from protocols: socks, socks5, socks5h
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
async function example_webSockets() {
    const myEx = new ccxt.pro.kucoin();
    myEx.httpProxy = 'http://5.75.153.75:8002'; // even though you are using WebSockets, you might also need to set up proxy for the exchange's REST requests
    myEx.wsProxy = 'http://5.75.153.75:8002'; // "wsProxy" or "wssProxy" or "wsSocksProxy" (depending on your proxy protocol)
    await myEx.loadMarkets();
    while (true) {
        const ticker = await myEx.watchTicker('BTC/USDT');
        console.log(ticker);
    }
}
await example_proxyUrl();
// await example_httpProxy ();
// await example_socksProxy ();
// await example_webSockets ();
