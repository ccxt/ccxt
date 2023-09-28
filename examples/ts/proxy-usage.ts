
import ccxt from '../../ts/ccxt.js';

// AUTO-TRANSPILE //
async function example_1 () {
    const myEx = new ccxt.kucoin ();
    myEx.proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    console.log (await myEx.fetch ('https://api.ipify.org/'));
}

async function example_2 () {
    const myEx = new ccxt.kucoin ();
    // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    myEx.httpsProxy = 'http://1.2.3.4:5555';
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
