import ccxt from '../../js/ccxt.js';
// 1) ABOUT CCXT PROXIES, READ MORE AT: https://docs.ccxt.com/README?id=proxy
// 2) in python, uncomment the below:
// if sys.platform == 'win32':
//     asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
async function example_proxyUrl() {
    const myEx = new ccxt.kucoin();
    myEx.proxyUrl = 'http://188.245.226.105:8090/proxy_url.php?caller=https://ccxt.com&url=';
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
async function example_httpProxy() {
    const myEx = new ccxt.kucoin();
    myEx.httpProxy = 'http://188.245.226.105:8911'; // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
async function example_socksProxy() {
    const myEx = new ccxt.kucoin();
    myEx.socksProxy = 'socks5://127.0.0.1:1080'; // from protocols: socks, socks5, socks5h
    console.log(await myEx.fetch('https://api.ipify.org/'));
}
async function example_webSockets() {
    const myEx = new ccxt.pro.kucoin();
    myEx.httpProxy = 'http://188.245.226.105:8911'; // even though you are using WebSockets, you might also need to set up proxy for the exchange's REST requests
    myEx.wsProxy = 'http://188.245.226.105:8911'; // "wsProxy" or "wssProxy" or "wsSocksProxy" (depending on your proxy protocol)
    await myEx.loadMarkets();
    //
    // To ensure your WS proxy works, uncomment below code and watch the log
    //
    // myEx.verbose = true;
    // await myEx.loadHttpProxyAgent ();
    // await myEx.watch ('ws://188.245.226.105:9876/', 'myip'); // in the incoming logs, confirm that you see the proxy IP in "hello" message
    //
    console.log(await myEx.watchTicker('BTC/USDT'));
    await myEx.close();
}
// await example_proxyUrl ();
await example_httpProxy();
// await example_socksProxy ();
// await example_webSockets ();
/*
Note, in some languages you can also set your custom agent like, eg:


############################ JAVASCRIPT ############################

// ccxt's node REST transport is undici-based: set the unified proxy property and
// ccxt creates (and caches) an undici.ProxyAgent dispatcher for you internally

const socks = 'socks5://127.0.0.1:1080';
const exchange = new ccxt.binance ({
    'socksProxy': socks, // or 'httpProxy' / 'httpsProxy'
});

// advanced: inject a custom-tuned undici ProxyAgent for that proxy url
// (custom tls options, proxy headers, pooling limits, ...)

const { ProxyAgent } = require ('undici');
exchange.proxyDictionaries[socks] = new ProxyAgent ({ 'uri': socks });

// websocket connections still use node-style agents ("npm i socks-proxy-agent" first):

const SocksProxyAgent = require ('socks-proxy-agent');
const myAgent = new SocksProxyAgent (socks);
const wsExchange = new ccxt.pro.binance ({
    'options': {
        'ws': {
            'options': { 'agent': myAgent },
        },
    },
});



############################ PYTHON ############################
import asyncio
import ccxt.async_support as ccxt
import aiohttp
import aiohttp_socks

async def test():

    connector = aiohttp_socks.ProxyConnector.from_url('socks5://user:password@127.0.0.1:1080')
    session = aiohttp.ClientSession(connector=connector)

    exchange = ccxt.binance({
        'session': session,
        # ...
    })

    # ...

    await exchange.close()  # Close the exchange
    await session.close()  # don't forget to close the session

    # ...

asyncio.run(test())

*/ 
