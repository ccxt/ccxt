
//  ---------------------------------------------------------------------------

import Exchange from './abstract/sarmayex.js';
import { Market, Strings, Ticker, Tickers } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class sarmayex
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class sarmayex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'sarmayex',
            'name': 'Sarmayex',
            'country': [ 'IR' ],
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
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/sarmayex/64x64.png',
                'api': {
                    'public': 'https://api.sarmayex.com',
                },
                'www': 'https://sarmayex.com',
                'doc': [
                    'https://sarmayex.com',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'api/v1/public/currencies': 1,
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

    async fetchMarkets (symbols: Strings = undefined, params = {}): Promise<Market[]> {
        /**
         * @method
         * @name sarmayex#fetchMarkets
         * @description retrieves data on all markets for sarmayex
         * @see https://api.sarmayex.com/api/v1/public/currencies
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        let response = await this.publicGetApiV1PublicCurrencies (params);
        response = this.safeDict (response, 'data');
        const markets = this.safeList (response, 'currencies');
        const result = [];
        const quotes = [ 'IRT', 'USDT' ];
        for (let i = 0; i < markets.length; i++) {
            const base = this.safeString (markets[i], 'symbol');
            for (let index = 0; index < quotes.length; index++) {
                const quote = quotes[index];
                markets[i]['base'] = base;
                markets[i]['quote'] = quote;
                if (base === quote) {
                    continue;
                }
                const market = await this.parseMarket (markets[i]);
                result.push (market);
            }
        }
        return result;
    }

    parseMarket (market): Market {
        //   {
        //     'id': 87,
        //     'title': 'تتر',
        //     'title_en': 'Tether',
        //     'symbol': 'USDT',
        //     'sell_price': '58,987',
        //     'sell_price_usd': '1.0000',
        //     'sell_price_wm': '1.062',
        //     'sell_price_pm': '1.085',
        //     'can_sell': 1,
        //     'can_sell_iw': 1,
        //     'can_buy': 1,
        //     'can_buy_iw': 1,
        //     'buy_price': '58,448',
        //     'min_buy': '0.00000000',
        //     'max_buy': '232348196.00000000',
        //     'percent_change_1h': 0.00495761,
        //     'percent_change_24h': 0.0333481,
        //     'percent_change_7d': 0.0540622,
        //     'tick': 4,
        //     'need_tag': 0,
        //     'need_address': 1,
        //     'use_copon': 1,
        //     'updated_at': 1717936143,
        //     'image': '',
        //     'has_content': 1,
        //     'withdraw_nets': [],
        //     'deposit_nets': [],
        //     'sell_request_gateway': 1,
        //     'exist_in_wallet': 1,
        //     'tags': [
        //         {
        //             'id': 3,
        //             'name': 'استیبل کوین',
        //         },
        //         {
        //             'id': 13,
        //             'name': 'قابل پرداخت',
        //         },
        //     ],
        // };
        let baseId = this.safeString (market, 'base');
        let quoteId = this.safeString (market, 'quote');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const id = base + quote;
        baseId = baseId.toLowerCase ();
        quoteId = quoteId.toLowerCase ();
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

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name sarmayex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://api.sarmayex.com/api/v1/public/currencies
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
        }
        let response = await this.publicGetApiV1PublicCurrencies (params);
        response = this.safeDict (response, 'data');
        const markets = this.safeList (response, 'currencies');
        const result = [];
        const quotes = [ 'IRT', 'USDT' ];
        for (let i = 0; i < markets.length; i++) {
            const base = this.safeString (markets[i], 'symbol');
            for (let index = 0; index < quotes.length; index++) {
                const quote = quotes[index];
                if (base === quote) {
                    continue;
                }
                markets[i]['base'] = base;
                markets[i]['quote'] = quote;
                markets[i]['symbol'] = base + quote;
                const ticker = await this.parseTicker (markets[i]);
                const symbol = ticker['symbol'];
                result[symbol] = ticker;
            }
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name sarmayex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api.sarmayex.com/api/v1/public/currencies
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const ticker = await this.fetchTickers ([ symbol ]);
        return ticker[symbol];
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //   {
        //     'id': 87,
        //     'title': 'تتر',
        //     'title_en': 'Tether',
        //     'symbol': 'USDT',
        //     'sell_price': '58,987',
        //     'sell_price_usd': '1.0000',
        //     'sell_price_wm': '1.062',
        //     'sell_price_pm': '1.085',
        //     'can_sell': 1,
        //     'can_sell_iw': 1,
        //     'can_buy': 1,
        //     'can_buy_iw': 1,
        //     'buy_price': '58,448',
        //     'min_buy': '0.00000000',
        //     'max_buy': '232348196.00000000',
        //     'percent_change_1h': 0.00495761,
        //     'percent_change_24h': 0.0333481,
        //     'percent_change_7d': 0.0540622,
        //     'tick': 4,
        //     'need_tag': 0,
        //     'need_address': 1,
        //     'use_copon': 1,
        //     'updated_at': 1717936143,
        //     'image': '',
        //     'has_content': 1,
        //     'withdraw_nets': [],
        //     'deposit_nets': [],
        //     'sell_request_gateway': 1,
        //     'exist_in_wallet': 1,
        //     'tags': [
        //         {
        //             'id': 3,
        //             'name': 'استیبل کوین',
        //         },
        //         {
        //             'id': 13,
        //             'name': 'قابل پرداخت',
        //         },
        //     ],
        // };
        const marketType = 'otc';
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, marketType);
        ticker['sell_price'] = ticker['sell_price'].replace (',', '');
        ticker['sell_price_usd'] = ticker['sell_price'].replace (',', '');
        ticker['buy_price'] = ticker['sell_price'].replace (',', '');
        let last = this.safeFloat (ticker, 'sell_price_usd', 0);
        if (ticker['quote'] === 'IRT') {
            last = this.safeFloat (ticker, 'sell_price', 0);
        }
        const change = this.safeFloat (ticker, 'percent_change_24h', 0);
        const timestamp = this.safeInteger (ticker, 'updated_at');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp * 1000,
            'datetime': this.iso8601 (timestamp * 1000),
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.urls['api']['public'] + '/' + path;
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
