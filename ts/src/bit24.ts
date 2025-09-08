
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bit24.js';
import { Market, Strings, Ticker, Tickers } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class bit24
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class bit24 extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bit24',
            'name': 'Bit24',
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
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/bit24/64x64.png',
                'api': {
                    'public': 'https://bit24.cash/api/',
                },
                'www': 'https://bit24.cash/',
                'doc': [
                    'https://bit24.cash/',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'pro/v3/markets': 1,
                    },
                },
            },
            'fees': {
            },
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name bit24#fetchMarkets
         * @description retrieves data on all markets for bit24 with pagination
         * @see https://bit24.cash/api/pro/v3/markets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const result = [];
        let page = 1;
        const limit = 100; // check Bit24 docs for max allowed per page
        while (true) {
            const response = await this.publicGetProV3Markets (this.extend (params, {
                'page': page,
                'per_page': limit,
            }));
            const markets = this.safeDict (response, 'data');
            const marketList = this.safeList (markets, 'results', []);
            for (let i = 0; i < marketList.length; i++) {
                const marketdata = marketList[i];
                const market = this.parseMarket (marketdata);
                result.push (market);
            }
            // stop condition: if fewer results than limit, last page reached
            if (marketList.length < limit) {
                break;
            }
            page += 1;
        }
        return result;
    }

    parseMarket (market): Market {
        // {
        // id: 59,
        // market_name: "FTT/IRT",
        // quote_coin_decimal: 0,
        // base_coin_decimal: 2,
        // each_price: "83669.0000000000000000",
        // is_favorite: false,
        // max_leverage: null,
        // margin_profit_retention_fee: null,
        // margin_order_expire_days: null,
        // max_long_margin_leverage: null,
        // max_short_margin_leverage: null,
        // base_coin: {
        // symbol: "FTT",
        // name: "FTX Token",
        // fa_name: "اف تی ایکس توکن",
        // logo: "https://exchange-storage.bit24.cash/exchange/icons/ftt.png",
        // coin_type: 0
        // },
        // quote_coin: {
        // symbol: "IRT",
        // name: "Toman",
        // fa_name: "تومان",
        // logo: "https://exchange-storage.bit24.cash/exchange/icons/IRT.png",
        // coin_type: 1
        // },
        // margin_order_status: {
        // index: 0,
        // name: "غیرفعال"
        // },
        // bot_order_status: {
        // index: 1,
        // name: "فعال"
        // },
        // market_24h_information: {
        // base_volume: "467.86",
        // quote_volume: "39880070",
        // change_percent: "-1.687",
        // change_amount: "-1436",
        // min_price: "83137",
        // max_price: "87128",
        // first_price: "85105",
        // last_price: "83669"
        // }
        // }
        const base_coin = this.safeDict (market, 'base_coin');
        let baseId = this.safeString (base_coin, 'symbol');
        const quote_coin = this.safeDict (market, 'quote_coin');
        let quoteId = this.safeString (quote_coin, 'symbol');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        baseId = baseId.toLowerCase ();
        quoteId = quoteId.toLowerCase ();
        const id = baseId + '-' + quoteId;
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
         * @name bit24#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://bit24.com/pro/v3/tickers
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
        }
        let page = 1;
        const limit = 100; // adjust if Bit24 docs show a different default
        const result = {};
        while (true) {
            const response = await this.publicGetProV3Markets (this.extend (params, {
                'page': page,
                'per_page': limit,
            }));
            const data = this.safeDict (response, 'data', {});
            const tickerList = this.safeList (data, 'results', []);
            for (let i = 0; i < tickerList.length; i++) {
                const tickerData = tickerList[i];
                const ticker = this.parseTicker (tickerData);
                const symbol = ticker['symbol'];
                result[symbol] = ticker;
            }
            if (tickerList.length < limit) {
                break;
            }
            page += 1;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name bit24#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://bit24.com/management/all-coins/?format=json
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const ticker = await this.fetchTickers ([ symbol ]);
        return ticker[symbol];
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        // {
        // id: 59,
        // market_name: "FTT/IRT",
        // quote_coin_decimal: 0,
        // base_coin_decimal: 2,
        // each_price: "83669.0000000000000000",
        // is_favorite: false,
        // max_leverage: null,
        // margin_profit_retention_fee: null,
        // margin_order_expire_days: null,
        // max_long_margin_leverage: null,
        // max_short_margin_leverage: null,
        // base_coin: {
        // symbol: "FTT",
        // name: "FTX Token",
        // fa_name: "اف تی ایکس توکن",
        // logo: "https://exchange-storage.bit24.cash/exchange/icons/ftt.png",
        // coin_type: 0
        // },
        // quote_coin: {
        // symbol: "IRT",
        // name: "Toman",
        // fa_name: "تومان",
        // logo: "https://exchange-storage.bit24.cash/exchange/icons/IRT.png",
        // coin_type: 1
        // },
        // margin_order_status: {
        // index: 0,
        // name: "غیرفعال"
        // },
        // bot_order_status: {
        // index: 1,
        // name: "فعال"
        // },
        // market_24h_information: {
        // base_volume: "467.86",
        // quote_volume: "39880070",
        // change_percent: "-1.687",
        // change_amount: "-1436",
        // min_price: "83137",
        // max_price: "87128",
        // first_price: "85105",
        // last_price: "83669"
        // }
        // },
        const marketType = 'spot';
        const base_coin = this.safeDict (ticker, 'base_coin', {});
        let base_symbol = this.safeString (base_coin, 'symbol');
        base_symbol = base_symbol.toLowerCase ();
        const quote_coin = this.safeDict (ticker, 'quote_coin', {});
        let quote_symbol = this.safeString (quote_coin, 'symbol');
        quote_symbol = quote_symbol.toLowerCase ();
        const marketId = base_symbol + '-' + quote_symbol;
        const symbol = this.safeSymbol (marketId, market, undefined, marketType);
        const last = this.safeFloat (ticker, 'each_price', 0);
        const markerInfo = this.safeDict (ticker, 'market_24h_information', {});
        const change = this.safeFloat (markerInfo, 'change_percent', 0);
        const minPrice = this.safeFloat (markerInfo, 'min_price', 0);
        const maxPrice = this.safeFloat (markerInfo, 'max_price', 0);
        const baseVolume = this.safeFloat (markerInfo, 'base_volume', 0);
        const quoteVolume = this.safeFloat (markerInfo, 'quote_volume', 0);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': maxPrice,
            'low': minPrice,
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
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        url = url + '?' + this.urlencode (query);
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
