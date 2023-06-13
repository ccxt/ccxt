import ccxt from '../../js/ccxt.js';
// import { kucoin } from '../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example_1 () {
    const myEx = new ccxt.kucoin ();
    myEx.proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // It prepends redirect url to requests, so requests leads to call url i.e.: https://cors-anywhere.herokuapp.com/?https://target_url.com . It might be useful for simple redirection or CORS bypassing purposes (Note, this will not work for websocket connections, but only for REST calls).
    // you can also set ".proxyUrlCallback" to callback function with with signature `(url, method, headers, body)` and from there return the proxy url string.
    console.log (await myEx.fetch ('https://api.ipify.org/'));
}

async function example_2 () {
    const myEx = new ccxt.kucoin ();
    // same as httpProxy
    myEx.httpsProxy = 'http://51.83.140.52:11230'; // It sets a real proxy for communication, so calls are made directly to url https://target_url.com , but tunneled through a proxy server (Note, this might work for websocket connections too).
    console.log (await myEx.fetch ('https://api.ipify.org/'));
}


async function example_3 () {
    const myEx = new ccxt.kucoin ();
    myEx.socksProxy = 'socks5://127.0.0.1:1080'; // It is for socks5 or socks5h proxy (Note, this might work for websocket connections too).
    console.log (await myEx.fetch ('https://api.ipify.org/'));
}


async function example_4 () {
    const myEx = new ccxt.kucoin ();
    // for advanced use, set  `meEx.proxyAgentCallback` callback
    myEx.proxyAgentCallback = myCallback;
}

function myCallback (url, method, headers, body) {
    // in JS it sets .agent property for fetch, in PHP it sets .userAgent, in Python (sync) it returns dict of proxies for `Requests` module, in Python (async) it returns signle proxy entry
    return {}; //
}

await example_1 ();
