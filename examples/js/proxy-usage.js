import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
// 1) ABOUT CCXT PROXIES, READ MORE AT: https://docs.ccxt.com/#/README?id=proxy
// 2) in python, uncomment the below:
// if sys.platform == 'win32':
//     asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
async function example_proxyUrl() {
    const myEx = new ccxt.kucoin();
    myEx.proxyUrl = 'http://188.245.226.105:8090/proxy_url.php?caller=https://ccxt.com&url=';
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
async function example_httpProxy() {
    const myEx = new ccxt.kucoin();
    myEx.httpProxy = 'http://188.245.226.105:8911'; // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
async function example_socksProxy() {
    const myEx = new ccxt.kucoin();
    myEx.socksProxy = 'socks5://127.0.0.1:1080'; // from protocols: socks, socks5, socks5h
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
async function example_webSockets() {
    const myEx = new ccxt.pro.kucoin();
    myEx.httpProxy = 'http://188.245.226.105:8911'; // even though you are using WebSockets, you might also need to set up proxy for the exchange's REST requests
    myEx.wsProxy = 'http://188.245.226.105:8911'; // "wsProxy" or "wssProxy" or "wsSocksProxy" (depending on your proxy protocol)
    await myEx.loadMarkets();
    //
    // To ensure your WS proxy works, uncomment below code and watch the log
    //
    // myEx.verbose = true;
    // await myEx.loadHttpProxyAgent ();
    // await myEx.watch ('ws://188.245.226.105:9876/', 'myip'); // in the incoming logs, confirm that you see the proxy IP in "hello" message
    //
    console.log(await myEx.watchTicker('BTC/USDT'));
    await myEx.close();
}
// await example_proxyUrl ();
await example_httpProxy();
// await example_socksProxy ();
// await example_webSockets ();
