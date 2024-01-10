// @ts-nocheck

// to set custom "proxy-agent" for ccxt

import ccxt from 'ccxt';
import HttpProxyAgent from 'http-proxy-agent';
import HttpsProxyAgent from 'https-proxy-agent';

const proxy = 'http://1.2.3.4:5678';
const agent = new HttpProxyAgent (proxy); // or HttpsProxyAgent if you need http
// then pass it through constructor:
const kraken = new ccxt.kraken ({ agent });
// or set it later:
kraken.agent = agent;
