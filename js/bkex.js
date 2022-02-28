'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InvalidAddress, ExchangeError, BadRequest, AuthenticationError, RateLimitExceeded, BadSymbol, InvalidOrder, InsufficientFunds, ArgumentsRequired, OrderNotFound, PermissionDenied, NotSupported } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class bkex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bkex',
            'name': 'BKEX',
            'countries': [ 'BVI' ], // British Virgin Islands
            'rateLimit': 100,
            'version': 'v2',
            'certified': true,
            'has': {
                'publicAPI': true,
                'privateAPI': true,
                'CORS': undefined,
                'spot': undefined,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'addMargin': undefined,
                'cancelAllOrders': undefined,
                'cancelOrder': true,
                'cancelOrders': undefined,
                'createDepositAddress': undefined,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'deposit': undefined,
                'editOrder': 'emulated',
                'fetchAccounts': undefined,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchBorrowRates': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': 'emulated',
                'fetchDeposit': undefined,
                'fetchDepositAddress': undefined,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': undefined,
                'fetchDeposits': undefined,
                'fetchFundingFee': undefined,
                'fetchFundingFees': undefined,
                'fetchFundingHistory': undefined,
                'fetchFundingRate': undefined,
                'fetchFundingRateHistory': undefined,
                'fetchFundingRates': undefined,
                'fetchIndexOHLCV': undefined,
                'fetchL2OrderBook': true,
                'fetchLedger': undefined,
                'fetchLedgerEntry': undefined,
                'fetchLeverageTiers': undefined,
                'fetchMarketLeverageTiers': undefined,
                'fetchMarkets': true,
                'fetchMarkOHLCV': undefined,
                'fetchMyTrades': undefined,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': undefined,
                'fetchOrder': undefined,
                'fetchOrderBook': true,
                'fetchOrderBooks': undefined,
                'fetchOrders': undefined,
                'fetchOrderTrades': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': undefined,
                'fetchStatus': 'emulated',
                'fetchTicker': true,
                'fetchTickers': undefined,
                'fetchTime': undefined,
                'fetchTrades': true,
                'fetchTradingFee': undefined,
                'fetchTradingFees': undefined,
                'fetchTradingLimits': undefined,
                'fetchTransactions': undefined,
                'fetchTransfers': undefined,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': undefined,
                'loadMarkets': true,
                'reduceMargin': undefined,
                'setLeverage': undefined,
                'setMarginMode': undefined,
                'setPositionMode': undefined,
                'signIn': undefined,
                'transfer': undefined,
                'withdraw': undefined,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': '',
                'api': {
                    'spot': {
                        'public': 'https://api.bkex.com',
                        'private': 'https://api.bkex.com',
                    },
                    'contract': {
                        'public': 'https://api.bkex.com',
                        'private': 'https://api.bkex.com',
                    },
                },
                'www': 'https://www.bkex.com/',
                'doc': [
                    'https://bkexapi.github.io/docs/api_en.htm',
                ],
                'fees': [
                    'https://www.bkex.com/help/instruction/33',
                ],
                'referral': '',
            },
            'api': {
                'spot': {
                    'public': {
                        'get': {
                            '/v2/common/symbols': 1,
                            '/v2/common/currencys': 1,
                            '/v2/common/timestamp': 1,
                            '/v2/q/kline': 1,
                            '/v2/q/tickers': 1,
                            '/v2/q/ticker/price': 1,
                            '/v2/q/depth': 1,
                            '/v2/q/deals': 1,
                        },
                    },
                    'private': {
                        'get': {
                            '/v2/u/api/info': 1,
                            '/v2/u/account/balance': 1,
                            '/v2/u/wallet/address': 1,
                            '/v2/u/wallet/depositRecord': 1,
                            '/v2/u/wallet/withdrawRecord': 1,
                            '/v2/u/order/openOrders': 1,
                            '/v2/u/order/openOrder/detail': 1,
                            '/v2/u/order/historyOrders': 1,
                        },
                        'post': {
                            '/v2/u/account/transfer': 1,
                            '/v2/u/wallet/withdraw': 1,
                            '/v2/u/order/create': 1,
                            '/v2/u/order/cancel': 1,
                            '/v2/u/order/batchCreate': 1,
                            '/v2/u/order/batchCancel': 1,
                        },
                        'delete': {
                        },
                    },
                },
                'contract': {
                    'public': {
                        'get': {
                            '/v2/contract/common/brokerInfo': 1,
                            '/v2/contract/q/index': 1,
                            '/v2/contract/q/depth': 1,
                            '/v2/contract/q/depthMerged': 1,
                            '/v2/contract/q/trades': 1,
                            '/v2/contract/q/kline': 1,
                            '/v2/contract/q/ticker24hr': 1,
                        },
                    },
                    'private': {
                        'get': {
                            '/v2/contract/trade/getOrder': 1,
                            '/v2/contract/trade/openOrders': 1,
                            '/v2/contract/trade/historyOrders': 1,
                            '/v2/contract/trade/myTrades': 1,
                            '/v2/contract/trade/positions': 1,
                            '/v2/contract/u/account': 1,
                        },
                        'post': {
                            '/v2/contract/trade/order': 1,
                            '/v2/contract/trade/orderCancel': 1,
                            '/v2/contract/trade/modifyMargin': 1,
                            '/v2/contract/ws/dataStream/create': 1,
                            '/v2/contract/ws/dataStream/update': 1,
                            '/v2/contract/ws/dataStream/delete': 1,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.15 / 100,
                    'taker': 0.2 / 100,
                },
            },
            'options': {
                'timeframes': {
                    'spot': {
                    },
                    'contract': {
                    },
                },
                'defaultType': 'spot', // spot, swap
                'networks': {
                    'TRX': 'TRC-20',
                    'TRC20': 'TRC-20',
                    'ETH': 'ERC-20',
                    'ERC20': 'ERC-20',
                    'BEP20': 'BEP-20(BSC)',
                },
            },
            'commonCurrencies': {
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.spotPublicGetV2CommonSymbols (params);
        // {
        //     "code": "0",
        //     "data": [
        //         {
        //             "minimumOrderSize": "0",
        //             "minimumTradeVolume": "0E-18",
        //             "pricePrecision": "11",
        //             "supportTrade": true,
        //             "symbol": "COMT_USDT",
        //             "volumePrecision": 0
        //         },
        //     ],
        //     "msg": "success",
        //     "status": 0
        // }
        const data = this.safeValue (response, 'data');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            result.push ({
                'id': id,
                'marketId': baseId + '_' + quoteId,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'future': false,
                'swap': false,
                'option': false,
                'active': this.safeValue (market, 'supportTrade'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeInteger (market, 'volumePrecision'),
                    'price': this.safeInteger (market, 'pricePrecision'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minimumOrderSize'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minimumTradeVolume'),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const [ section, access ] = api;
        let url = this.urls['api'][section][access] + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (access === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        // success
        //
        //   {
        //      "code": "0",
        //      "msg": "success",
        //      "status": 0,
        //      "data": [...],
        //   }
        //
        // error
        //   {
        //      "timestamp": "1646041085490",
        //      "status": "403",
        //      "error": "Forbidden",
        //      "message": "签名错误",
        //      "path": "/whatever/incorrect/path"
        //   }
        const message = this.safeValue (response, 'msg');
        if (message === 'success') {
            return;
        }
        const responseCode = this.safeString (response, 'code');
        if (responseCode !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], responseCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
