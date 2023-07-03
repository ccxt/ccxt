'use strict'

// ----------------------------------------------------------------------------

import ccxt from '../../../dist/cjs/ccxt.js'
const huobi = ccxt['huobi']

// ----------------------------------------------------------------------------


// mocking responses from the exchange needed for private methods execution
const mockCall = (url) => {
    const urlWithoutParams = url.split('?')[0];
    switch (urlWithoutParams) {
        case 'https://api.huobi.pro/v1/common/symbols':
            return {
                "status": "ok",
                "data": [
                    {
                        "base-currency": "edu",
                        "quote-currency": "eth",
                        "price-precision": 12,
                        "amount-precision": 2,
                        "symbol-partition": "st",
                        "symbol": "edueth",
                        "state": "offline",
                        "value-precision": 8,
                        "min-order-amt": 1,
                        "max-order-amt": 1000000000,
                        "min-order-value": 0.001,
                        "limit-order-min-order-amt": 1,
                        "limit-order-max-order-amt": 1000000000,
                        "limit-order-max-buy-amt": 1000000000,
                        "limit-order-max-sell-amt": 1000000000,
                        "buy-limit-must-less-than": 1.1,
                        "sell-limit-must-greater-than": 0.9,
                        "sell-market-min-order-amt": 1,
                        "sell-market-max-order-amt": 100000000,
                        "buy-market-max-order-value": 270,
                        "market-sell-order-rate-must-less-than": 0.1,
                        "market-buy-order-rate-must-less-than": 0.1,
                        "api-trading": "enabled",
                        "tags": ""
                    },
                ]
            }
        case 'https://api.huobi.pro/v2/reference/currencies':
            return {
                "code": 200,
                "data": [
                    {
                        "currency": "usdt",
                        "assetType": 1,
                        "chains": [
                            {
                                "chain": "algousdt",
                                "displayName": "ALGO",
                                "fullName": "",
                                "isDynamic": false,
                                "numOfConfirmations": 60,
                                "numOfFastConfirmations": 15,
                                "depositStatus": "allowed",
                                "minDepositAmt": "1",
                                "withdrawStatus": "prohibited",
                                "minWithdrawAmt": "2",
                                "withdrawPrecision": 6,
                                "maxWithdrawAmt": "1000000.000000000000000000",
                                "withdrawQuotaPerDay": "1000000.000000000000000000",
                                "withdrawQuotaPerYear": null,
                                "withdrawQuotaTotal": null,
                                "withdrawFeeType": "fixed",
                                "transactFeeWithdraw": "0.001",
                                "addrWithTag": false,
                                "addrDepositTag": false
                            },
                        ]
                    }
                ]
            }
        case 'https://api.hbdm.com/linear-swap-api/v1/swap_contract_info?business_type=futures':
            return {
                "status": "ok",
                "data": [
                    {
                        "symbol": "BTC",
                        "contract_code": "BTC-USDT-230421",
                        "contract_size": 0.001000000000000000,
                        "price_tick": 0.100000000000000000,
                        "delivery_date": "20230421",
                        "delivery_time": "1682064000000",
                        "create_date": "20230407",
                        "contract_status": 1,
                        "settlement_date": "1682006400000",
                        "support_margin_mode": "cross",
                        "business_type": "futures",
                        "pair": "BTC-USDT",
                        "contract_type": "this_week",
                        "trade_partition": "USDT"
                    },
                ]
            }
        case 'https://api.hbdm.com/api/v1/contract_contract_info':
            return {
                "status": "ok",
                "data": [
                    {
                        "symbol": "BTC",
                        "contract_code": "BTC230421",
                        "contract_type": "this_week",
                        "contract_size": 100.000000000000000000,
                        "price_tick": 0.010000000000000000,
                        "delivery_date": "20230421",
                        "delivery_time": "1682064000000",
                        "create_date": "20230407",
                        "contract_status": 1,
                        "settlement_time": "1682064000000"
                    },
                ]
            }
        case 'https://api.hbdm.com/linear-swap-api/v1/swap_contract_info':
            return {
                "status": "ok",
                "data": [
                    {
                        "symbol": "BTC",
                        "contract_code": "BTC-USDT",
                        "contract_size": 0.001000000000000000,
                        "price_tick": 0.100000000000000000,
                        "delivery_date": "",
                        "delivery_time": "",
                        "create_date": "20201021",
                        "contract_status": 1,
                        "settlement_date": "1682006400000",
                        "support_margin_mode": "all",
                        "business_type": "swap",
                        "pair": "BTC-USDT",
                        "contract_type": "swap",
                        "trade_partition": "USDT"
                    },
                ]
            }
        case 'https://api.hbdm.com/swap-api/v1/swap_contract_info':
            return {
                "status": "ok",
                "data": [
                    {
                        "symbol": "BTC",
                        "contract_code": "BTC-USD",
                        "contract_size": 100.000000000000000000,
                        "price_tick": 0.100000000000000000,
                        "delivery_time": "",
                        "create_date": "20200325",
                        "contract_status": 1,
                        "settlement_date": "1682006400000"
                    },
                ]
            }
        case 'https://fakeProxy.com/https://api.hbdm.com/linear-swap-api/v3/swap_cross_matchresults_exact':
            return {
                "status": "ok",
                "data": {
                    "trades": []
                }
            }
        default:
            return {}
    }
}

const URL_MUST_CONTAINING_PROXY = [
    'https://fakeProxy.com/https://api.hbdm.com/linear-swap-api/v3/swap_cross_matchresults_exact'
]

class ProxyError extends Error {
    constructor(message) {
        super(message);
    }
}

class HuobiCustom extends huobi {
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
    // Initialize the custom Binance exchange class
    const exchange = new HuobiCustom({
        apiKey: '12345678',
        secret: '12345678',
        forcedProxy: 'https://fakeProxy.com/',
    });

    await exchange.fetchMyTrades('BTC/USDT:USDT');
})();