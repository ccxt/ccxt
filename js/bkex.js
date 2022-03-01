'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

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
                'CORS': undefined,
                'spot': undefined,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'addMargin': undefined,
                'cancelAllOrders': undefined,
                'cancelOrder': undefined,
                'cancelOrders': undefined,
                'createDepositAddress': undefined,
                'createLimitOrder': undefined,
                'createMarketOrder': undefined,
                'createOrder': undefined,
                'deposit': undefined,
                'editOrder': undefined,
                'fetchAccounts': undefined,
                'fetchBalance': undefined,
                'fetchBidsAsks': undefined,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRates': undefined,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': true,
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
                'fetchL2OrderBook': undefined,
                'fetchLedger': undefined,
                'fetchLedgerEntry': undefined,
                'fetchLeverageTiers': undefined,
                'fetchMarketLeverageTiers': undefined,
                'fetchMarkets': true,
                'fetchMarkOHLCV': undefined,
                'fetchMyTrades': undefined,
                'fetchOHLCV': true,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': undefined,
                'fetchOrder': undefined,
                'fetchOrderBook': undefined,
                'fetchOrderBooks': undefined,
                'fetchOrders': undefined,
                'fetchOrderTrades': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': undefined,
                'fetchStatus': undefined,
                'fetchTicker': undefined,
                'fetchTickers': undefined,
                'fetchTime': true,
                'fetchTrades': undefined,
                'fetchTradingFee': undefined,
                'fetchTradingFees': undefined,
                'fetchTradingLimits': undefined,
                'fetchTransactions': undefined,
                'fetchTransfers': undefined,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': undefined,
                'loadMarkets': true,
                'privateAPI': true,
                'publicAPI': true,
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
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w'
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.bkex.com',
                    'private': 'https://api.bkex.com',
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
                'public': {
                    'get': {
                        '/common/symbols': 1,
                        '/common/currencys': 1,
                        '/common/timestamp': 1,
                        '/q/kline': 1,
                        '/q/tickers': 1,
                        '/q/ticker/price': 1,
                        '/q/depth': 1,
                        '/q/deals': 1,
                        // contracts:
                        '/contract/common/brokerInfo': 1,
                        '/contract/q/index': 1,
                        '/contract/q/depth': 1,
                        '/contract/q/depthMerged': 1,
                        '/contract/q/trades': 1,
                        '/contract/q/kline': 1,
                        '/contract/q/ticker24hr': 1,
                    },
                },
                'private': {
                    'get': {
                        '/u/api/info': 1,
                        '/u/account/balance': 1,
                        '/u/wallet/address': 1,
                        '/u/wallet/depositRecord': 1,
                        '/u/wallet/withdrawRecord': 1,
                        '/u/order/openOrders': 1,
                        '/u/order/openOrder/detail': 1,
                        '/u/order/historyOrders': 1,
                        // contracts:
                        '/contract/trade/getOrder': 1,
                        '/contract/trade/openOrders': 1,
                        '/contract/trade/historyOrders': 1,
                        '/contract/trade/myTrades': 1,
                        '/contract/trade/positions': 1,
                        '/contract/u/account': 1,
                    },
                    'post': {
                        '/u/account/transfer': 1,
                        '/u/wallet/withdraw': 1,
                        '/u/order/create': 1,
                        '/u/order/cancel': 1,
                        '/u/order/batchCreate': 1,
                        '/u/order/batchCancel': 1,
                        // contracts:
                        '/contract/trade/order': 1,
                        '/contract/trade/orderCancel': 1,
                        '/contract/trade/modifyMargin': 1,
                        '/contract/ws/dataStream/create': 1,
                        '/contract/ws/dataStream/update': 1,
                        '/contract/ws/dataStream/delete': 1,
                    },
                    'delete': {
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
        const response = await this.publicGetCommonSymbols (params);
        //
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
        //
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

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCommonCurrencys (params);
        //
        // {
        //     "code": "0",
        //     "data": [
        //        {
        //           "currency": "ETH",
        //           "maxWithdrawOneDay": "100.000000000000000000",
        //           "maxWithdrawSingle": "50.000000000000000000",
        //           "minWithdrawSingle": "0.005000000000000000",
        //           "supportDeposit": true,
        //           "supportTrade": true,
        //           "supportWithdraw": true,
        //           "withdrawFee": 0.01
        //        },
        //     ],
        //     "msg": "success",
        //     "status": 0
        // }
        //
        const data = this.safeValue (response, 'data', {});
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const withdrawEnabled = this.safeValue (currency, 'supportWithdraw');
            const depositEnabled = this.safeValue (currency, 'supportDeposit');
            const tradeEnabled = this.safeValue (currency, 'supportTrade');
            const active = withdrawEnabled && depositEnabled && tradeEnabled;
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'active': active,
                'fee': this.safeNumber (currency, 'withdrawFee'),
                'precision': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': this.safeNumber (currency, 'minWithdrawSingle'), 'max': this.safeNumber (currency, 'maxWithdrawSingle') },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetCommonTimestamp (params);
        //
        // {
        //     "code": '0',
        //     "data": 1573542445411,
        //     "msg": "success",
        //     "status": 0
        // }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        if (since !== undefined) {
            request['from'] = since;
            // when 'since' [from] argument is set, then exchange also requires 'to' value to be set. So we have to set 'to' argument depending 'limit' amount (if limit was not provided, then exchange-default 500 atm).
            if (limit === undefined) {
                limit = 500;
            }
            const duration = this.parseTimeframe (timeframe);
            const timerange = limit * duration * 1000;
            request['to'] = this.sum (request['from'], timerange);
        }
        const response = await this.publicGetQKline (request);
        //
        // {
        //     "code": "0",
        //     "data": [
        //       {
        //          "close": "43414.68",
        //          "high": "43446.47",
        //          "low": "43403.05",
        //          "open": "43406.05",
        //          "quoteVolume": "61500.40099",
        //          "symbol": "BTC_USDT",
        //          "ts": "1646152440000",
        //          "volume": 1.41627
        //       },
        //     ],
        //     "msg": "success",
        //     "status": 0
        // }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.safeInteger (ohlcv, 'ts'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.version + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const query = this.urlencode (params);
            if (method !== 'GET') {
                body = query;
            }
            const signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha256');
            headers = {
                'Cache-Control': 'no-cache',
                'Content-type': 'application/x-www-form-urlencoded',
                'X_ACCESS_KEY': this.apiKey,
                'X_SIGNATURE': signature,
            };
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
