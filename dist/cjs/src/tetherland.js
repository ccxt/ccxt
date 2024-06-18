'use strict';

var tetherland$1 = require('./abstract/tetherland.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class tetherland
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
class tetherland extends tetherland$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'tetherland',
            'name': 'TetherLand',
            'country': ['IR'],
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
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/tetherland/64x64.png',
                'api': {
                    'public': 'https://api.teterlands.com',
                },
                'www': 'https://tetherland.org',
                'doc': [
                    'https://docs.tetherland.com/docs/tetherland/71ca11f41704f-user-api',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'api/v5/currencies': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber('0.001'),
                    'taker': this.parseNumber('0.001'),
                },
            },
        });
    }
    async fetchMarkets(symbols = undefined, params = {}) {
        /**
         * @method
         * @name tetherland#fetchMarkets
         * @description retrieves data on all markets for tetherland
         * @see https://docs.tetherland.com/docs/tetherland/71ca11f41704f-user-api
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetApiV5Currencies(params);
        const markets = this.safeDict(response, 'data');
        const result = [];
        const quotes = ['USDT', 'IRT'];
        for (let i = 0; i < markets.length; i++) {
            for (let key = 0; key < quotes.length; key++) {
                if (markets[i]['symbol'] === 'USDT' && quotes[key] === 'USDT') {
                    continue;
                }
                markets[i]['quote'] = quotes[key];
                const market = await this.parseMarket(markets[i]);
                result.push(market);
            }
        }
        return result;
    }
    parseMarket(market) {
        // {
        //     'name': 'Bitcoin',
        //     'fa_name': 'بیت کوین',
        //     'logo': '/uploads/images/2022/8/masc3iMjEPBTC.svg',
        //     'accent_color': '#ff8d00',
        //     'symbol': 'BTC',
        //     'price': '69,497.50',
        //     'toman_amount': 4117726875,
        //     'min_usdt_value': null,
        //     'min_usdt_amount': 15,
        //     'max_usdt_amount': 10000,
        //     'min_value': null,
        //     'max_amount': '0.200000000000',
        //     'min_irr_amount': 883500,
        //     'max_irr_amount': 589000000,
        //     'priority': 1,
        //     'price_round_digit': 2,
        //     'amount_round_digit': 6,
        //     'changes_24h': -2.68,
        //     'changes_7d': 7.522256527082521,
        //     'trendy': 0,
        //     'exchange': null,
        //     'categories': [ ],
        //     'createdAt': null,
        //     'has_staking': true,
        //     'staking_plan': {
        //         'id': 38,
        //         'coin_id': 1,
        //         'periods': { '30': '1.2', '60': '1.5', 'flex': '1' },
        //         'capacity': '5.00000',
        //         'minimum_staking_amount': '0.00150',
        //         'maximum_staking_amount': '1.00000',
        //         'total_staked': '5.00000',
        //         'largest_benefit': 1.5,
        //         'trendy': 0,
        //         'status': 'COMPLETED',
        //         'info': 'رمزارز مورد نظر PoS نیست و پاداش حاصل از نگه‌داری آن از طریق دیفای استیکینگ تامین می‌شود.',
        //         'created_at': '2023-07-15T13:01:25.000000Z',
        //         'updated_at': '2024-06-01T14:56:40.000000Z',
        //         'deleted_at': null,
        //         'priority': 18,
        //     },
        // }
        let [baseId, quoteId] = [this.safeString(market, 'symbol'), this.safeString(market, 'quote')];
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const id = base + '/' + quote;
        baseId = baseId.toLowerCase();
        quoteId = quoteId.toLowerCase();
        return {
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
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name tetherland#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://docs.tetherland.com/docs/tetherland/71ca11f41704f-user-api
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
        }
        const response = await this.publicGetApiV5Currencies(params);
        const markets = this.safeDict(response, 'data');
        const result = [];
        const quotes = ['USDT', 'IRT'];
        for (let i = 0; i < markets.length; i++) {
            for (let key = 0; key < quotes.length; key++) {
                if (markets[i]['symbol'] === 'USDT' && quotes[key] === 'USDT') {
                    continue;
                }
                markets[i]['quote'] = quotes[key];
                markets[i]['id'] = markets[i]['symbol'] + '/' + markets[i]['quote'];
                const market = await this.parseTicker(markets[i]);
                const symbol = market['symbol'];
                result[symbol] = market;
            }
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name tetherland#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.tetherland.com/docs/tetherland/71ca11f41704f-user-api
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const ticker = await this.fetchTickers([symbol]);
        return ticker[symbol];
    }
    parseTicker(ticker, market = undefined) {
        // {
        //     'name': 'Bitcoin',
        //     'fa_name': 'بیت کوین',
        //     'logo': '/uploads/images/2022/8/masc3iMjEPBTC.svg',
        //     'accent_color': '#ff8d00',
        //     'symbol': 'BTC',
        //     'price': '69,497.50',
        //     'toman_amount': 4117726875,
        //     'min_usdt_value': null,
        //     'min_usdt_amount': 15,
        //     'max_usdt_amount': 10000,
        //     'min_value': null,
        //     'max_amount': '0.200000000000',
        //     'min_irr_amount': 883500,
        //     'max_irr_amount': 589000000,
        //     'priority': 1,
        //     'price_round_digit': 2,
        //     'amount_round_digit': 6,
        //     'changes_24h': -2.68,
        //     'changes_7d': 7.522256527082521,
        //     'trendy': 0,
        //     'exchange': null,
        //     'categories': [ ],
        //     'createdAt': null,
        //     'has_staking': true,
        //     'staking_plan': {
        //         'id': 38,
        //         'coin_id': 1,
        //         'periods': { '30': '1.2', '60': '1.5', 'flex': '1' },
        //         'capacity': '5.00000',
        //         'minimum_staking_amount': '0.00150',
        //         'maximum_staking_amount': '1.00000',
        //         'total_staked': '5.00000',
        //         'largest_benefit': 1.5,
        //         'trendy': 0,
        //         'status': 'COMPLETED',
        //         'info': 'رمزارز مورد نظر PoS نیست و پاداش حاصل از نگه‌داری آن از طریق دیفای استیکینگ تامین می‌شود.',
        //         'created_at': '2023-07-15T13:01:25.000000Z',
        //         'updated_at': '2024-06-01T14:56:40.000000Z',
        //         'deleted_at': null,
        //         'priority': 18,
        //     },
        // }
        const marketType = 'otc';
        const marketId = this.safeString(ticker, 'id');
        const quote = this.safeString(ticker, 'quote');
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        let last = this.safeFloat(ticker, 'price', 0);
        if (quote === 'IRT') {
            last = this.safeFloat(ticker, 'toman_amount', 0);
        }
        const change = this.safeFloat(ticker, 'changes_24h', 0);
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.urls['api']['public'] + '/' + path;
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = tetherland;
