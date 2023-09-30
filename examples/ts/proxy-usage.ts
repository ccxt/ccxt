
import ccxt from '../../ts/ccxt.js';

// AUTO-TRANSPILE //

const targetSite = 'https://api.ipify.org/';

async function example_1 () {
    const myEx = new ccxt.kucoin ();
    myEx.proxyUrl = 'http://5.75.153.75:8090/proxy.php?url=';
    console.log (await myEx.fetch (targetSite));
}

async function example_2 () {
    const myEx = new ccxt.kucoin ();
    // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    myEx.httpsProxy = 'http://1.2.3.4:5555';
    console.log (await myEx.fetch (targetSite));
}

async function example_3 () {
    const myEx = new ccxt.kucoin ();
    myEx.socksProxy = 'socks5://127.0.0.1:1080'; // It is for socks5 or socks5h proxy (Note, this might work for websocket connections too).
    console.log (await myEx.fetch (targetSite));
}

await example_1 ();
// await example_2 ();
// await example_3 ();
