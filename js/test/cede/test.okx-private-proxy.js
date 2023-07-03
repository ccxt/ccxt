'use strict'

// ----------------------------------------------------------------------------

import ccxt from '../../../dist/cjs/ccxt.js'
const okx = ccxt['okx']

// ----------------------------------------------------------------------------


// mocking responses from the exchange needed for private methods execution
const mockCall = () => ({});

const URL_MUST_CONTAINING_PROXY = [
    'https://fakeProxy.com/https://www.okx.com/api/v5/asset/currencies',
    'https://fakeProxy.com/https://www.okx.com/api/v5/account/balance'
]

class ProxyError extends Error {
    constructor(message) {
        super(message);
    }
}

class OKXCustom extends okx {
    async fetch(url, method = 'GET', headers = undefined, body = undefined) {
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
    // Initialize the custom OKX exchange class
    const exchange = new OKXCustom({
        apiKey: '12345678',
        secret: '12345678',
        password: '12345678',
        forcedProxy: 'https://fakeProxy.com/',
    });

    // Privates endpoints that will be called :
    // https://fakeProxy.com/https://www.okx.com/api/v5/asset/currencies
    // https://fakeProxy.com/https://www.okx.com/api/v5/account/balance

    // Public endpoints that will be called :
    // https://www.okx.com/api/v5/public/instruments?instType=SPOT
    // https://www.okx.com/api/v5/public/instruments?instType=SWAP
    // https://www.okx.com/api/v5/public/instruments?instType=FUTURES
    // https://www.okx.com/api/v5/public/instruments?instType=OPTION

    await exchange.fetchBalance('ETH-USDT');
})();
