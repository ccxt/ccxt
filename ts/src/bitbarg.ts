
//  ---------------------------------------------------------------------------
import Exchange from './abstract/bitbarg.js';
import { Market, Strings, Ticker, Tickers } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class bitbarg
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class bitbarg extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bitbarg',
            'name': 'Bitbarg',
            'countries': [ 'IR' ],
            'rateLimit': 1000,
            'version': '1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'editOrder': false,
                'fetchBalance': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL2OrderBook': false,
                'fetchL3OrderBook': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchOrderTrades': 'emulated',
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'comment': 'This comment is optional',
            'urls': {
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/bitbarg/64x64.png',
                'api': {
                    'public': 'https://api.bitbarg.com',
                },
                'www': 'https://bitbarg.com/',
                'doc': [
                    'https://bitbarg.com/',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        '/api/v1/currencies': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
            },
        });
    }

    parseMarket (market): Market {
        // "id": 53,
        // "icon": "https://s3.bitbarg.com/currencies/btc.webp",
        // "tradeActive": true,
        // "faName": "بیت کوین",
        // "enName": "Bitcoin",
        // "coin": "BTC",
        // "path": "bitcoin",
        // "price": 112192,
        // "quote": "813430226.5004",
        // "percent": -5.735,
        // "decimal": 8,
        // "isFavorite": false,
        const baseId = this.safeString (market, 'coin');
        const quoteId = 'USDT';
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const id = baseId + '/' + quoteId;
        return {
            'id': id,
            'symbol': id,
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
            'active': true,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': undefined,
                'price': undefined,
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
            'created': undefined,
            'info': market,
        };
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name bitbarg#fetchMarkets
         * @description retrieves data on all markets for bitbarg
         * @see https://api.bitbarg.com/api/v1/currencies?pageSize=-1
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const request = {
            'pageSize': -1,
        };
        const response = await this.publicGetApiV1Currencies (this.extend (request, params));
        const result = [];
        const data = this.safeDict (response, 'result', {});
        const items = this.safeList (data, 'items', []);
        // Create markets for each currency with IRT quote
        for (let i = 0; i < items.length; i++) {
            const market = this.parseMarket (items[i]);
            result.push (market);
        }
        return result;
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name bitbarg#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://api.bitbarg.com/api/v1/currencies?pageSize=-1
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
        }
        const request = {
            'pageSize': -1,
        };
        const response = await this.publicGetApiV1Currencies (request);
        const data = this.safeDict (response, 'result', {});
        const items = this.safeList (data, 'items', []);
        const result = {};
        for (let i = 0; i < items.length; i++) {
            const coinData = items[i];
            const baseId = this.safeString (coinData, 'coin');
            // Create ticker for USDT quote
            const quoteId = 'USDT';
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const ticker = this.extend ({
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'id': baseId + '/' + quoteId,
            }, coinData);
            result[symbol] = this.parseTicker (ticker);
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name bitbarg#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api.bitbarg.com/api/v1/currencies?pageSize=-1
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const ticker = await this.fetchTickers ([ symbol ]);
        return ticker[symbol];
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        // {
        //     "id": 1,
        //     "icon": "https://...",
        //     "tradeActive": true,
        //     "faName": "بیت کوین",
        //     "enName": "Bitcoin",
        //     "coin": "BTC",
        //     "path": "bitcoin",
        //     "price": 110387.56,
        //     "quote": "57479298399.76",
        //     "percent": -3.01,
        //     "decimal": 5,
        //     "isFavorite": false,
        //     "chart": [...]
        // }
        const marketType = 'spot';
        const marketId = this.safeString (ticker, 'coin') + '/' + 'USDT';
        const symbol = this.safeSymbol (marketId, market, undefined, marketType);
        const last = this.safeFloat (ticker, 'price', 0);
        const percentage = this.safeFloat (ticker, 'percent', 0);
        const baseVolume = this.safeFloat (ticker, 'quote');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': last,
            'bidVolume': undefined,
            'ask': last,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['public'] + path;
        if (Object.keys (params).length) {
            url += '?' + this.urlencode (params);
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
