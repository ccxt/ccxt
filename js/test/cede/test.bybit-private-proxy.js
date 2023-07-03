'use strict'

// ----------------------------------------------------------------------------

import ccxt from '../../../dist/cjs/ccxt.js'
const bybit = ccxt['bybit']

// ----------------------------------------------------------------------------


// mocking responses from the exchange needed for private methods execution
const mockCall = (url) => ({});

const URL_MUST_CONTAINING_PROXY = [
    'https://fakeProxy.com/https://api.bybit.com/v5/asset/coin/query-info',
    'https://fakeProxy.com/https://api.bybit.com/user/v3/private/query-api',
    'https://fakeProxy.com/https://api.bybit.com/contract/v3/private/account/wallet/balance',
]

class ProxyError extends Error {
    constructor(message) {
        super(message);
    }
}

class BybitCustom extends bybit {
    async fetch(url, method = 'GET', headers = undefined, body = undefined) {
        console.log(url)
        const newUrl = this.implodeParams(url, this.omit(this.extend({}, this.urls), this.version));
        const urlWithoutParams = newUrl.split('?')[0];
        if (newUrl.includes("https://fakeProxy.com/")) {
            if (!URL_MUST_CONTAINING_PROXY.includes(urlWithoutParams)) {
                throw new ProxyError(`URL "${urlWithoutParams}" shouldn't contain https://fakeProxy.com/`);
            }
        } else {
            if (URL_MUST_CONTAINING_PROXY.some((key) => key.includes(urlWithoutParams))) {
                throw new ProxyError(`URL "${urlWithoutParams}" should contain https://fakeProxy.com/`);
            }
        }

        return mockCall(url);
    }
}

(async () => {
    // Initialize the custom Bybit exchange class
    const exchange = new BybitCustom({
        apiKey: '12345678',
        secret: '12345678',
        forcedProxy: 'https://fakeProxy.com/',
    });

    // Privates endpoints that will be called :
    // https://fakeProxy.com/https://api.bybit.com/asset/v3/private/coin-info/query
    // https://fakeProxy.com/https://api.bybit.com/user/v3/private/query-api
    // https://fakeProxy.com/https://api.bybit.com/contract/v3/private/account/wallet/balance

    // Public endpoints that will be called :
    // https://api.bybit.com/spot/v1/symbols
    // https://api.bybit.com/derivatives/v3/public/instruments-info

    await exchange.fetchBalance('ETH-USDT');
})();
