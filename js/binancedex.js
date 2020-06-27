'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { AuthenticationError, ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class binancedex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binancedex',
            'name': 'Binance DEX',
            'countries': [ 'GB', 'EU' ],
            'rateLimit': 200,
            'version': 'v1',
            'has': {
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'CORS': false,
                'createDepositAddress': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'privateAPI': true,
                'publicAPI': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': '',
                'api': 'https://dex.binance.org/',
                'www': 'https://binance.org/',
                'doc': 'https://docs.binance.org/api-reference/',
                'fees': 'https://docs.binance.org/trading-spec.html',
            },
            'fees': {
                'trading': {
                },
                'funding': {
                },
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'ticker/24hr',
                        'depth',
                        'klines',
                        'orders/{id}',
                        'account/{address}',
                    ],
                },
                'private': {
                    'post': [
                        'broadcast/?sync=1',
                    ],
                },
            },
            'commonCurrencies': {
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'privateKey': true,
                'walletAddress': true,
            },
            'accountInfo': {},
            'exceptions': {
                'exact': {
                },
                'broad': {
                    'signature verification failed': AuthenticationError,
                },
            },
            'options': {
                'orderTypes': {
                    'limit': 2,
                },
                'orderSide': {
                    'buy': 1,
                    'sell': 2,
                },
            },
        });
    }

    async fetchCurrencies (params = {}) {
        params['limit'] = this.safeValue (params, 'limit', 1000);
        const response = await this.publicGetTokens (params);
        const responseLen = response.length;
        const result = {};
        for (let i = 0; i < responseLen; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const symbol = this.safeString (currency, 'original_symbol');
            result[symbol] = {
                'id': id,
                'code': this.safeCurrencyCode (symbol),
                'info': this.safeString (currency, 'name'),
                'name': symbol,
                'active': true,
                'fee': undefined,
                'limits': {
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
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        params['limit'] = this.safeValue (params, 'limit', 1000);
        const markets = await this.publicGetMarkets (params);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseSymbol = this.safeString (market, 'base_asset_symbol');
            const quoteSymbol = this.safeString (market, 'quote_asset_symbol');
            const lotSize = this.safeFloat (market, 'lot_size');
            const tickSize = this.safeFloat (market, 'tick_size');
            const originalBaseSymbol = baseSymbol.split ('-')[0];
            const originalQuoteSymbol = quoteSymbol.split ('-')[0];
            const symbol = originalBaseSymbol + '/' + originalQuoteSymbol;
            const id = baseSymbol + '_' + quoteSymbol;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': originalBaseSymbol,
                'quote': originalQuoteSymbol,
                'baseId': baseSymbol,
                'quoteId': quoteSymbol,
                'info': market,
                'precision': {
                    'amount': lotSize,
                    'price': tickSize,
                },
                'limits': {
                    'amount': {
                        'min': lotSize,
                        'max': undefined,
                    },
                    'price': {
                        'min': tickSize,
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const lastPrice = this.safeFloat (ticker, 'lastPrice');
        const weightedAvgPrice = this.safeFloat (ticker, 'weightedAvgPrice');
        const timestamp = this.safeInteger (ticker, 'closeTime');
        return {
            'symbol': this.markets_by_id[this.safeString (ticker, 'symbol')]['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highPrice'),
            'low': this.safeFloat (ticker, 'lowPrice'),
            'bid': this.safeFloat (ticker, 'bidPrice'),
            'bidVolume': this.safeFloat (ticker, 'bidQuantity'),
            'ask': this.safeFloat (ticker, 'askPrice'),
            'askVolume': this.safeFloat (ticker, 'askQuantity'),
            'vwap': weightedAvgPrice,
            'open': this.safeFloat (ticker, 'openPrice'),
            'close': lastPrice,
            'last': lastPrice,
            'previousClose': this.safeFloat (ticker, 'prevClosePrice'),
            'change': this.safeFloat (ticker, 'priceChange'),
            'percentage': this.safeFloat (ticker, 'priceChangePercent'),
            'average': weightedAvgPrice,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const tickers = await this.publicGetTicker24hr (this.extend (request, params));
        return this.parseTicker (tickers[0], undefined);
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetTicker24hr (params);
        return this.parseTickers (tickers, symbols);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeFloat (ohlcv, 0),
            this.safeFloat (ohlcv, 1),
            this.safeFloat (ohlcv, 2),
            this.safeFloat (ohlcv, 3),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 7),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': timeframe,
        };
        // default = 300, max = 1000
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.publicGetKlines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const request = {
            'address': this.walletAddress,
        };
        const response = await this.publicGetAccountAddress (this.extend (request, params));
        const balances = response['balances'];
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const free = this.safeFloat (balance, 'free');
            const frozen = this.safeFloat (balance, 'frozen');
            const locked = this.safeFloat (balance, 'locked');
            account['free'] = free;
            account['used'] = locked;
            account['total'] = free + frozen + locked;
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchAccountInfo (params = {}) {
        const request = {
            'address': this.walletAddress,
        };
        const response = await this.publicGetAccountAddress (this.extend (request, params));
        this.accountInfo = {
            'sequence': response['sequence'],
            'public_key': response['public_key'],
            'account_number': response['account_number'],
        };
        return this.accountInfo;
    }

    isAccountInfoAvailable () {
        const keys = Object.keys (this.accountInfo);
        return keys.length === 3;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const orderbook = await this.publicGetDepth (this.extend (request, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 0, 1);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const order_type = 2;
        if (!this.isAccountInfoAvailable ()) {
            await this.fetchAccountInfo ();
        }
        let order_side = 1;
        if (side === 'sell') {
            order_side = 2;
        }
        const msg = {
            // 'body': create_order_msg(self.accountInfo['wallet'], market['id'], order_type, order_side, amount, price),
            'body': 'magic goes here',
            'order_type': order_type,
            'market': market['id'],
            'order_side': order_side,
        };
        const response = this.privatePostBroadcastSync1 (msg);
        // self.accountInfo['wallet'].increment_sequence()
        return {
            'info': response,
            'id': this.parseJson (response[0]['data'])['order_id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (!this.isAccountInfoAvailable ()) {
            await this.fetchAccountInfo ();
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const msg = {
            // 'body': cancel_order_msg(self.accountInfo['wallet'], id, market['id']),
            'body': 'magic goes here',
            'id': market['id'],
        };
        const result = {
            'info': this.privatePostBroadcastSync1 (msg),
        };
        // self.accountInfo['wallet'].increment_sequence()
        return result;
    }

    parseOrder (order, market = undefined) {
        const orderStatusMap = {
            'FullyFill': 'closed',
            'Canceled': 'canceled',
            'PartialFill': 'open',
            'Ack': 'open',
            'Expired': 'canceled',
            'FailedBlocking': 'canceled',
            'FailedMatching': 'canceled',
            'IocExpire': 'canceled',
            'IocNoFill': 'canceled',
        };
        let status = undefined;
        const orderStatus = this.safeString (order, 'status', undefined);
        if (orderStatus in orderStatusMap) {
            status = orderStatusMap[orderStatus];
        }
        let side = 'buy';
        if (order['side'] === this.options['orderSide']['sell']) {
            side = 'sell';
        }
        const marketId = this.safeString (order, 'symbol');
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            const marketInfo = this.markets_by_id[marketId];
            symbol = marketInfo['symbol'];
        }
        let orderType = 'market';
        if (order['type'] === this.options['orderTypes']['limit']) {
            orderType = 'limit';
        }
        const timestamp = this.parse8601 (this.safeString (order, 'orderCreateTime'));
        const quantity = this.safeFloat (order, 'quantity');
        const filledQuantity = this.safeFloat (order, 'cumulateQuantity');
        const price = this.safeFloat (order, 'price');
        const id = this.safeString (order, 'orderId');
        let feeCurrency = undefined;
        let feeCost = 0;
        const feeData = this.safeString (order, 'fee').split (';');
        const feeInfoField = feeData.length - 2;
        if (feeInfoField >= 0) {
            const feeInfo = feeData[feeInfoField].split (':');
            if (feeInfo.length > 0) {
                feeCurrency = feeInfo[0];
            }
            if (feeInfo.length > 1) {
                feeCost = parseFloat (feeInfo[1].replace (';', ''));
            }
        }
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': price,
            'average': undefined,
            'amount': quantity,
            'remaining': quantity - filledQuantity,
            'filled': filledQuantity,
            'status': status,
            'fee': {
                'cost': feeCost,
                'currency': feeCurrency,
            },
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.publicGetOrdersId (this.extend (request, params));
        return this.parseOrder (response, symbol);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + 'api/v1/' + this.implodeParams (path, params);
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            if (api === 'private') {
                body = params['body'];
                headers = {
                    'Content-type': 'text/plain',
                };
            } else {
                body = this.json (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (!response || httpCode === 200) {
            return; // fallback to default error handler
        }
        const error = this.safeValue (response, 'message');
        if (error) {
            const feedback = this.id + ' ' + this.json (response);
            const exact = this.exceptions['exact'];
            if (error in exact) {
                throw new exact[error] (feedback);
            }
            const broad = this.exceptions['broad'];
            const broadKey = this.findBroadlyMatchedKey (broad, error);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            throw new ExchangeError (feedback); // unknown error
        }
    }
};
