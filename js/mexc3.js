'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest, ExchangeError } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class mexc3 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mexc',
            'name': 'MEXC Global',
            'countries': [ 'SC' ], // Seychelles
            'rateLimit': 50, // default rate limit is 20 times per second
            'version': 'v3',
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
                'cancelOrder': undefined,
                'cancelOrders': undefined,
                'createDepositAddress': undefined,
                'createLimitOrder': undefined,
                'createMarketOrder': undefined,
                'createOrder': undefined,
                'deposit': undefined,
                'editOrder': 'emulated',
                'fetchAccounts': undefined,
                'fetchBalance': undefined,
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
                'fetchStatus': true,
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
                'loadMarkets': undefined,
                'reduceMargin': undefined,
                'setLeverage': undefined,
                'setMarginMode': undefined,
                'setPositionMode': undefined,
                'signIn': undefined,
                'transfer': undefined,
                'withdraw': undefined,
            },
            'timeframes': {
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg',
                'api': {
                    'spot': {
                        'public': 'https://api.mexc.com',
                        'private': 'https://api.mexc.com',
                    },
                },
                'www': 'https://www.mexc.com/',
                'doc': [
                    'https://mxcdevelop.github.io/apidocs/spot_v3_en/',
                ],
                'fees': [
                    'https://www.mexc.com/fee',
                ],
                'referral': 'https://m.mexc.com/auth/signup?inviteCode=1FQ1G',
            },
            'api': {
                'spot': {
                    'public': {
                        'get': {
                            'ping': 1,
                            'time': 1,
                            'exchangeInfo': 1,
                            'depth': 1,
                            'trades': 1,
                            'historicalTrades': 1,
                            'aggTrades': 1,
                            'klines': 1,
                            'avgPrice': 1,
                            'ticker/24hr': 1,
                            'ticker/price': 1,
                            'ticker/bookTicker': 1,
                            'order': 1,
                            'openOrders': 1,
                            'allOrders': 1,
                            'account': 1,
                            'myTrades': 1,
                            'etf/info': 1,
                        },
                    },
                    'private': {
                        'get': {
                        },
                        'post': {
                            'order': 1,
                            'order/test': 1,
                        },
                        'delete': {
                            'order': 1,
                            'openOrders': 1,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100, // maker / taker
                    'taker': 0.2 / 100,
                },
            },
            'options': {
                'fetchMarkets': {
                    'types': {
                        'spot': true,
                        'future': {
                            'linear': false,
                            'inverse': false,
                        },
                        'swap': {
                            'linear': false,
                            'inverse': false,
                        },
                    },
                },
                'timeframes': {
                    'spot': {
                    },
                },
                'defaultType': 'spot', // spot, swap
                'networks': {
                    'TRX': 'TRC-20',
                    'TRC20': 'TRC-20',
                    'ETH': 'ERC-20',
                    'ERC20': 'ERC-20',
                    'BEP20': 'BEP20(BSC)',
                },
            },
            'commonCurrencies': {
                'BEYONDPROTOCOL': 'BEYOND',
                'BIFI': 'BIFIF',
                'BYN': 'BeyondFi',
                'COFI': 'COFIX', // conflict with CoinFi
                'DFI': 'DfiStarter',
                'DFT': 'dFuture',
                'DRK': 'DRK',
                'EGC': 'Egoras Credit',
                'FLUX1': 'FLUX', // switched places
                'FLUX': 'FLUX1', // switched places
                'FREE': 'FreeRossDAO', // conflict with FREE Coin
                'HERO': 'Step Hero', // conflict with Metahero
                'MIMO': 'Mimosa',
                'PROS': 'Pros.Finance', // conflict with Prosper
                'SIN': 'Sin City Token',
            },
            'exceptions': {
                'exact': {
                    '-1128': BadRequest,
                },
                'broad': {
                    'Combination of optional parameters invalid': BadRequest, // {"msg":"Combination of optional parameters invalid.","code":-1128,"_extend":null}
                },
            },
        });
    }

    async fetchStatus (params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchStatus', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPublicGetPing',
            'swap': '',
        });
        const response = await this[method] (this.extend (query));
        //
        // {}
        //
        const length = Object.keys (response).length;
        const status = length === 0 ? 'ok' : 'maintenance';
        this.status = this.extend (this.status, {
            'status': status,
            'updated': this.milliseconds (),
        });
        return this.status;
    }

    async fetchTime (params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTime', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPublicGetTime',
            'swap': '',
        });
        const response = await this[method] (this.extend (query));
        //
        // spot
        //
        //     {
        //         "serverTime": "1647519277579"
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    async fetchMarkets (params = {}) {
        const response = await this.spotPublicGetExchangeInfo (params);
        //
        //     {
        //         "timezone": "CST",
        //         "serverTime": 1647521860402,
        //         "rateLimits": [],
        //         "exchangeFilters": [],
        //         "symbols": [
        //           {
        //             "symbol": "BTCUSDT",
        //             "status": "ENABLED",
        //             "baseAsset": "BTC",
        //             "baseAssetPrecision": 6,
        //             "quoteAsset": "USDT",
        //             "quotePrecision": 2,
        //             "quoteAssetPrecision": 2,
        //             "baseCommissionPrecision": 6,
        //             "quoteCommissionPrecision": 2,
        //             "orderTypes": [
        //               "LIMIT",
        //               "LIMIT_MAKER"
        //             ],
        //             "icebergAllowed": false,
        //             "ocoAllowed": false,
        //             "quoteOrderQtyMarketAllowed": false,
        //             "isSpotTradingAllowed": true,
        //             "isMarginTradingAllowed": false,
        //             "permissions": [
        //               "SPOT"
        //             ],
        //             "filters": []
        //           },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'symbols', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const status = this.safeString (market, 'status');
            result.push ({
                'id': id,
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
                'swap': false,
                'future': false,
                'option': false,
                'active': (status === 'ENABLED'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': undefined,
                'maker': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': undefined,
                    'price': this.safeInteger (market, 'quotePrecision'),
                    'base': this.safeInteger (market, 'baseAssetPrecision'),
                    'quote': this.safeInteger (market, 'quoteAssetPrecision'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (market['spot']) {
            method = 'spotPublicGetDepth';
        } else if (market['swap']) {
            method = '';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "lastUpdateId": "744267132",
        //         "bids": [
        //             [
        //                 "40838.50",
        //                 "0.387864"
        //             ],
        //             [
        //                 "40837.95",
        //                 "0.008400"
        //             ],
        //         ],
        //         "asks": [
        //             [
        //                 "40838.61",
        //                 "6.544908"
        //             ],
        //             [
        //                 "40838.88",
        //                 "0.498000"
        //             ],
        //         ]
        //     }
        //
        const orderbook = this.parseOrderBook (response, symbol);
        orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
        return orderbook;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            // request['startTime'] = since; bug in api, waiting for fix
        }
        let method = undefined;
        if (market['spot']) {
            method = this.safeString (params, 'method', 'spotPublicGetAggTrades'); // AggTrades, HistoricalTrades, Trades
        } else if (market['swap']) {
            method = '';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     /trades, /historicalTrades
        //
        //     [
        //         {
        //             "id": null,
        //             "price": "40798.94",
        //             "qty": "0.000508",
        //             "quoteQty": "20.72586152",
        //             "time": "1647546934374",
        //             "isBuyerMaker": true,
        //             "isBestMatch": true
        //         },
        //     ]
        //
        //     /aggrTrades
        //
        //     [
        //         {
        //           "a": null,
        //           "f": null,
        //           "l": null,
        //           "p": "40679",
        //           "q": "0.001309",
        //           "T": 1647551328000,
        //           "m": true,
        //           "M": true
        //         },
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger2 (trade, 'time', 'T');
        market = this.safeMarket (undefined, market);
        const symbol = market['symbol'];
        const priceString = this.safeString2 (trade, 'price', 'p');
        const amountString = this.safeString2 (trade, 'qty', 'q');
        const costString = this.safeString (trade, 'quoteQty');
        const buyerMaker = this.safeString2 (trade, 'isBuyerMaker', 'm');
        const type = undefined;
        let side = undefined;
        let takerOrMaker = undefined;
        if (buyerMaker !== undefined) {
            side = buyerMaker ? 'sell' : 'buy';
            takerOrMaker = 'taker';
        }
        let id = this.safeString2 (trade, 'id', 'a');
        if (id === undefined) {
            id = this.syntheticTradeId (market, timestamp, side, amountString, priceString, type, takerOrMaker);
        }
        return this.safeTrade ({
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    syntheticTradeId (market = undefined, timestamp = undefined, side = undefined, amount = undefined, price = undefined, orderType = undefined, takerOrMaker = undefined) {
        // TODO: can be unified method? this approach is being used by multiple exchanges (mexc, woo-coinsbit, dydx, ...)
        let id = '';
        if (timestamp !== undefined) {
            id = this.numberToString (timestamp) + '-' + this.safeString (market, 'id', '_');
            if (side !== undefined) {
                id += '-' + side;
            }
            if (amount !== undefined) {
                id += '-' + this.numberToString (amount);
            }
            if (price !== undefined) {
                id += '-' + this.numberToString (price);
            }
            if (takerOrMaker !== undefined) {
                id += '-' + takerOrMaker;
            }
            if (orderType !== undefined) {
                id += '-' + orderType;
            }
        }
        return id;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const [ section, access ] = api;
        [ path, params ] = this.resolvePath (path, params);
        let url = this.urls['api'][section][access] + '/api/' + this.version + '/' + path;
        if (method === 'GET' || method === 'DELETE') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //     {"msg":"Combination of optional parameters invalid.","code":-1128,"_extend":null}
        //
        const errorCode = this.safeValue (response, 'code');
        if (errorCode !== undefined) {
            const msg = this.safeString (response, 'msg');
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], msg, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
