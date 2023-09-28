
import ccxt from '../../ts/ccxt.js';

// AUTO-TRANSPILE //
async function example_1 () {
    const myEx = new ccxt.kucoin ();
    myEx.proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // It prepends redirect url to requests, so requests leads to call url i.e.: https://cors-anywhere.herokuapp.com/?https://target_url.com . It might be useful for simple redirection or CORS bypassing purposes (Note, this will not work for websocket connections, but only for REST calls).
    console.log (await myEx.fetch ('https://api.ipify.org/'));
}

async function example_2 () {
    const myEx = new ccxt.kucoin ();
    // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    myEx.httpsProxy = 'http://1.2.3.4:5555'; // It sets a real proxy for communication, so calls are made directly to url https://target_url.com , but tunneled through a proxy server (Note, this might work for websocket connections too).
    console.log (await myEx.fetch ('https://api.ipify.org/'));
}

async function example_3 () {
    const myEx = new ccxt.kucoin ();
    myEx.socksProxy = 'socks5://127.0.0.1:1080'; // It is for socks5 or socks5h proxy (Note, this might work for websocket connections too).
    console.log (await myEx.fetch ('https://api.ipify.org/'));
}

// Note, you can use your callback (instead of string value) for each of them, i.e.:
//
//     myEx.proxyUrlCallback = function (url, method, headers, body) { return 'http://1.2.3.4/'; }
//              or
//     myEx.proxyUrlCallback = my_callback_function;
//              or
//     myEx.proxyUrlCallback = '\yourNamesPace\yourFunction'; // only in php


await example_1 ();
// await example_2 ();
// await example_3 ();
