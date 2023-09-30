
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
    myEx.httpsProxy = 'http://5.75.153.75:8888'; // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    console.log (await myEx.fetch (targetSite));
}

async function example_3 () {
    const myEx = new ccxt.kucoin ();
    myEx.socksProxy = 'socks5://127.0.0.1:1080'; // socks5 or socks5h
    console.log (await myEx.fetch (targetSite));
}

await example_1 ();
// await example_2 ();
// await example_3 ();
