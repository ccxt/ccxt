
import ccxt from '../../ts/ccxt.js';

// // AUTO-TRANSPILE //

const targetSite = 'https://api.ipify.org/';

async function example_proxyUrl () {
    const myEx = new ccxt.kucoin ();
    myEx.proxyUrl = 'http://5.75.153.75:8090/proxy.php?url=';
    console.log (await myEx.fetch (targetSite));
}

async function example_httpProxy () {
    const myEx = new ccxt.kucoin ();
    myEx.httpsProxy = 'http://5.75.153.75:8888'; // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    console.log (await myEx.fetch (targetSite));
}

async function example_socksProxy () {
    const myEx = new ccxt.kucoin ();
    myEx.socksProxy = 'socks5://127.0.0.1:1080'; // socks5 or socks5h
    console.log (await myEx.fetch (targetSite));
}

async function example_webSockets () {
    const myEx = new ccxt.kucoin ();
    myEx.httpProxy = 'http://5.75.153.75:8002'; // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    await myEx.initializeProxies (); // only needed in JAVASCRIPT, not in PYTHON or PHP
    myEx.handleMessage = ws_helper_callback;
    await myEx.watch ('ws://5.75.153.75:9876', 'empty');
    console.log('WS proxy test finished');
}

function ws_helper_callback (client, message) {
    console.log ('WS received:', message);
}

await example_proxyUrl ();
// await example_httpProxy ();
// await example_socksProxy ();
// await example_webSockets ();
