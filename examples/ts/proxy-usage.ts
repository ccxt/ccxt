
import ccxt from '../../ts/ccxt.js';

// AUTO-TRANSPILE //

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

await example_proxyUrl ();
// await example_httpProxy ();
// await example_socksProxy ();
