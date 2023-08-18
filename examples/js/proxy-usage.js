import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
async function example_1() {
    const myEx = new ccxt.kucoin();
    myEx.proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // It prepends redirect url to requests, so requests leads to call url i.e.: https://cors-anywhere.herokuapp.com/?https://target_url.com . It might be useful for simple redirection or CORS bypassing purposes (Note, this will not work for websocket connections, but only for REST calls).
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
async function example_2() {
    const myEx = new ccxt.kucoin();
    // choose "httpProxy" or "httpsProxy" depending on your proxy url protocol
    myEx.httpsProxy = 'http://51.83.140.52:11230'; // It sets a real proxy for communication, so calls are made directly to url https://target_url.com , but tunneled through a proxy server (Note, this might work for websocket connections too).
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
async function example_3() {
    const myEx = new ccxt.kucoin();
    myEx.socksProxy = 'socks5://127.0.0.1:1080'; // It is for socks5 or socks5h proxy (Note, this might work for websocket connections too).
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
// Note, you can use your callback (instead of string value) for each of them, i.e.:
//
//
//     myEx.proxyUrlCallback = function (url, method, headers, body) { return 'xyz'; }
//
// or
//
//     myEx.proxyUrlCallback = mycallback;
//
// Note, in PHP you can also pass a callback's string with a qualified namespace/class name, i.e. '\yourFunction' or '\yourNamesPace\yourFunction'
await example_1();
// await example_2 ();
// await example_3 ();
