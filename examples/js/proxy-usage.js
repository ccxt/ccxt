import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
async function example_proxyUrl() {
    const myEx = new ccxt.kucoin();
    myEx.proxyUrl = 'http://5.75.153.75:8090/proxy.php?url=';
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
async function example_httpProxy() {
    const myEx = new ccxt.kucoin();
    myEx.httpProxy = 'http://5.75.153.75:8002'; // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
async function example_socksProxy() {
    const myEx = new ccxt.kucoin();
    myEx.socksProxy = 'socks5://127.0.0.1:1080'; // socks5 or socks5h
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
async function example_webSockets() {
    const myEx = new ccxt.pro.kucoin();
    myEx.httpProxy = 'http://5.75.153.75:8002'; // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    myEx.wsProxy = 'http://5.75.153.75:8002'; // "wsProxy" or "wssProxy" (depending on your proxy protocol)
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
