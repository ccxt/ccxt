//import ccxt from '../../ts/ccxt.js';
import { okx } from '../../ts/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    // const myEx = new ccxt.okx ({});
    const myEx = new okx ({});
    //
    //
    //
    //
    //
    myEx.proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // It prepends redirect url to requests, so requests leads to call url i.e.: https://cors-anywhere.herokuapp.com/?https://target_url.com . It might be useful for simple redirection or CORS bypassing purposes (Note, this will not work for websocket connections, but only for REST calls).
    console.log (await myEx.fetch ('https://api.ipify.org/'));
    myEx.proxyUrl = undefined;
    //
    //
    //
    //
    //
    myEx.proxyHttp = 'http://51.83.140.52:11230'; // It sets a real proxy for communication, so calls are made directly to url https://target_url.com , but tunneled through a proxy server (Note, this might work for websocket connections too).
    console.log (await myEx.fetch ('https://api.ipify.org/'));
    myEx.proxyHttp = undefined;
    //
    //
    //
    //
    //
    myEx.proxySocks = 'socks://127.0.0.1:1080'; // It is for socks5 proxy (Note, this might work for websocket connections too).
    console.log (await myEx.fetch ('https://api.ipify.org/'));
    myEx.proxySocks = undefined;
    //
}
await example ();
