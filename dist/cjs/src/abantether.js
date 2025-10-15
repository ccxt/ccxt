'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var abantether$1 = require('./abstract/abantether.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class abantether
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
class abantether extends abantether$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'abantether',
            'name': 'Aban tether',
            'countries': ['IR'],
            'rateLimit': 1000,
            'version': '1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'otc': true,
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
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/abantether/64x64.png',
                'api': {
                    'public': 'https://api.abantether.com',
                },
                'www': 'https://abantether.com',
                'doc': [
                    'https://abantether.com',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'manager/coins/data': 1,
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
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name abantether#fetchMarkets
         * @description retrieves data on all markets for abantether
         * @see https://api.abantether.com/manager/coins/data
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetManagerCoinsData(params);
        const data = this.safeList(response, 'data', []);
        const result = [];
        const quotes = ['IRT', 'USDT'];
        for (let i = 0; i < data.length; i++) {
            const base = this.safeString(data[i], 'symbol');
            for (let index = 0; index < quotes.length; index++) {
                const quote = quotes[index];
                data[i]['base'] = base;
                data[i]['quote'] = quote;
                if (base === quote) {
                    continue;
                }
                const market = this.parseMarket(data[i]);
                result.push(market);
            }
        }
        return result;
    }
    parseMarket(market) {
        // {
        //     "id": 1,
        //     "name": "Tether USDt",
        //     "symbol": "USDT",
        //     "persian_name": "تتر",
        //     "is_active": true,
        //     "is_withdrawal_active": true,
        //     "is_deposit_active": true,
        //     "is_mid_wallet_transfer_active": true,
        //     "is_buy_active": true,
        //     "is_sell_active": true,
        //     "is_credit_active": true,
        //     "min_trade": "1.00",
        //     "max_trade": "100000.00",
        //     "tether_price": "1",
        //     "price_buy": "113540.0",
        //     "price_sell": "112630.0",
        //     "volume24h": "225163179366.25",
        //     "percent_change_1h": "0.00",
        //     "percent_change_24h": "0.00",
        //     "percent_change_7d": "0.04",
        //     "market_cap": "179884960573.99",
        //     "coin_type": "COIN",
        //     "exchange_type": "fake",
        //     "icon": "f71021586005413ea6f3a0bd1f7d8a55",
        //     "fund_tether_buy": "0",
        //     "fund_tether_sell": "0",
        //     "irt_decimal_point": 2,
        //     "tether_decimal_point": 6,
        //     "amount_decimal_point": 6,
        //     "base": "BTC",
        //     "qoute": "USDT",
        // },
        let baseId = this.safeString(market, 'base');
        let quoteId = this.safeString(market, 'quote');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const id = base + quote;
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
         * @name abantether#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://api.abantether.com/manager/coins/data
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
        }
        const response = await this.publicGetManagerCoinsData(params);
        const data = this.safeList(response, 'data', []);
        const result = {};
        const quotes = ['IRT', 'USDT'];
        for (let i = 0; i < data.length; i++) {
            const base = this.safeString(data[i], 'symbol');
            for (let index = 0; index < quotes.length; index++) {
                const quote = quotes[index];
                if (base === quote) {
                    continue;
                }
                data[i]['base'] = base;
                data[i]['quote'] = quote;
                data[i]['symbol'] = base + quote;
                const ticker = this.parseTicker(data[i]);
                const symbol = ticker['symbol'];
                result[symbol] = ticker;
            }
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name abantether#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api.abantether.com/manager/coins/data
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const ticker = await this.fetchTickers([symbol]);
        return ticker[symbol];
    }
    parseTicker(ticker, market = undefined) {
        // {
        //     "id": 2,
        //     "name": "Bitcoin",
        //     "symbol": "BTC",
        //     "persian_name": "بیت کوین",
        //     "is_active": true,
        //     "is_withdrawal_active": true,
        //     "is_deposit_active": true,
        //     "is_mid_wallet_transfer_active": true,
        //     "is_buy_active": true,
        //     "is_sell_active": true,
        //     "is_credit_active": true,
        //     "min_trade": "1.00",
        //     "max_trade": "65000.00",
        //     "tether_price": "114909.43000000",
        //     "price_buy": "13049114870.800000000",
        //     "price_sell": "12944547289.500000000",
        //     "volume24h": "93585526493.26",
        //     "percent_change_1h": "-0.29",
        //     "percent_change_24h": "3.22",
        //     "percent_change_7d": "-7.19",
        //     "market_cap": "2292874615411.72",
        //     "coin_type": "COIN",
        //     "exchange_type": "binance",
        //     "icon": "561aa10abc0c45f7aa4499f48d618c80",
        //     "fund_tether_buy": "0",
        //     "fund_tether_sell": "0",
        //     "irt_decimal_point": 0,
        //     "tether_decimal_point": 2,
        //     "amount_decimal_point": 9
        // },
        const marketType = 'otc';
        const marketId = this.safeString(ticker, 'symbol');
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        let last = this.safeFloat(ticker, 'tether_price', 0);
        if (ticker['quote'] === 'IRT') {
            last = this.safeFloat(ticker, 'price_buy', 0);
        }
        const change = this.safeFloat(ticker, 'percent_change_24h', 0);
        const baseVolume = this.safeFloat(ticker, 'volume24h', 0);
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
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.urls['api']['public'] + '/' + path + '?format=json';
        headers = { 'Content-Type': 'application/json', 'Cookie': '__arcsco=42f03956ded5873c087d9f052b33cbff' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

exports["default"] = abantether;
