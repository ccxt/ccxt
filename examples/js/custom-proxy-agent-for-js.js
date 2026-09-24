// @NO_AUTO_TRANSPILE
// @ts-nocheck
// to set a custom proxy for ccxt's REST requests
//
// note: ccxt's node transport is undici-based, so REST proxying is configured with
// the unified proxy properties (which build undici.ProxyAgent dispatchers internally) -
// the old node-style 'agent' option (http-proxy-agent / https-proxy-agent instances)
// is only honored by user-supplied custom fetchImplementation functions
import ccxt from 'ccxt';
import { ProxyAgent } from 'undici';
const proxy = 'http://1.2.3.4:5678';
// A) simplest: set the unified proxy property and ccxt creates
//    (and caches) the undici ProxyAgent dispatcher for you
const kraken = new ccxt.kraken({ 'httpsProxy': proxy }); // or httpProxy / socksProxy
// or set it later
kraken.httpsProxy = proxy;
// B) advanced: inject your own undici ProxyAgent (custom tls options, proxy
//    headers, pooling limits, ...) - ccxt will use it for that proxy url
const myDispatcher = new ProxyAgent({
    'uri': proxy,
    'keepAliveTimeout': 60 * 1000,
    'connections': 256,
    'pipelining': 1,
});
kraken.proxyDictionaries[proxy] = myDispatcher;
