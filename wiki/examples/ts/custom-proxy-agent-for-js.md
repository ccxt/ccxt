- [Custom Proxy Agent For Js](./examples/ts/)


 ```javascript
 // @ts-nocheck
// to set custom "proxy-agent" for ccxt
import ccxt from 'ccxt';
import HttpProxyAgent from 'http-proxy-agent';
import HttpsProxyAgent from 'https-proxy-agent';
const proxy = 'http://1.2.3.4:5678';
const httpAgent = new HttpProxyAgent (proxy); 
const httpsAgent = new HttpsProxyAgent (proxy);
// then pass it through constructor
const kraken = new ccxt.kraken ({ agent: httpAgent /* or httpsAgent */ });
// or set it later
kraken.agent = agent;
 
```