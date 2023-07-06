'use strict'

// ----------------------------------------------------------------------------

import ccxt from '../../../dist/cjs/ccxt.js'
const bitget = ccxt['bitget']

// ----------------------------------------------------------------------------


// mocking responses from the exchange needed for private methods execution
const mockCall = (url) => {
    const urlWithoutParams = url.split('?')[0];
    switch (urlWithoutParams) {
        case 'https://api.bitget.com/api/spot/v1/public/currencies':
            return {
                "code": "00000",
                "msg": "success",
                "requestTime": 0,
                "data": [
                    {
                        "coinId": "1",
                        "coinName": "BTC",
                        "transfer": "true",
                        "chains": [
                            {
                                "chain": "BTC",
                                "needTag": "false",
                                "withdrawable": "true",
                                "rechargeable": "true",
                                "withdrawFee": "0.0005",
                                "extraWithDrawFee": "0",
                                "depositConfirm": "1",
                                "withdrawConfirm": "1",
                                "minDepositAmount": "0.0001",
                                "minWithdrawAmount": "0.002",
                                "browserUrl": "https://blockchair.com/bitcoin/transaction/"
                            },
                            {
                                "chain": "BEP20",
                                "needTag": "false",
                                "withdrawable": "true",
                                "rechargeable": "true",
                                "withdrawFee": "0.0000051",
                                "extraWithDrawFee": "0",
                                "depositConfirm": "15",
                                "withdrawConfirm": "15",
                                "minDepositAmount": "0.000001",
                                "minWithdrawAmount": "0.0000078",
                                "browserUrl": "https://bscscan.com/tx/"
                            }
                        ]
                    },
                ]
            }
        default:
            return {}
        };
    }

const URL_MUST_CONTAINING_PROXY = [
    'https://fakeProxy.com/https://api.bitget.com/api/spot/v1/wallet/deposit-address',
]

class ProxyError extends Error {
    constructor(message) {
        super(message);
    }
}

class BitgetCustom extends bitget {
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
    const exchange = new BitgetCustom({
        apiKey: '12345678',
        secret: '12345678',
        password: '12345678',
        forcedProxy: 'https://fakeProxy.com/',
    });

    // Privates endpoints that will be called :
    // https://fakeProxy.com/https://api.bitget.com/api/spot/v1/wallet/deposit-address

    // Public endpoints that will be called :
    // https://api.bitget.com/api/spot/v1/public/currencies
    // https://api.bitget.com/api/spot/v1/public/products
    // https://api.bitget.com/api/mix/v1/market/contracts?productType=umcbl
    // https://api.bitget.com/api/mix/v1/market/contracts?productType=dmcbl
    // https://api.bitget.com/api/mix/v1/market/contracts?productType=cmcbl

    await exchange.fetchDepositAddress('BTC');
})();
