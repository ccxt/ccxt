
import { pro } from '../../../../ccxt.js'; // import from TS dir

// AUTO-TRANSPILE //


async function example_webSockets () {
    const myEx = new pro.kucoin ();
    // myEx.wsSocksProxy = 'socks://127.0.0.1:1080'; // "wsProxy" or "wssProxy" (depending on your proxy protocol)
    await myEx.loadMarkets ();
    myEx.handleMessage = ws_helper_callback; // todo for PHP: specifically this custom example does not work in PHP to retrieve the target message, however proxies do work in PHP for websockets independently from this example
    await myEx.loadHttpProxyAgent ();
    const fakeExchangeWsUrl = 'ws://5.75.153.75:9876';
    await myEx.watch (fakeExchangeWsUrl, 'test', 'test');
    console.log ('WS proxy test finished');
}

function ws_helper_callback (client, message) {
    console.log ('WS received:', message);
}

await example_webSockets ();
