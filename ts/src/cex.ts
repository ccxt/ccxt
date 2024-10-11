
//  ---------------------------------------------------------------------------

import Exchange from './abstract/cex.js';
import { ExchangeError, ArgumentsRequired, AuthenticationError, NullResponse, InvalidOrder, InsufficientFunds, InvalidNonce, OrderNotFound, RateLimitExceeded, DDoSProtection, BadSymbol } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Currency, Currencies, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class cex
 * @augments Exchange
 */
export default class cex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cex',
            'name': 'CEX.IO',
            'countries': [ 'GB', 'EU', 'CY', 'RU' ],
            'rateLimit': 1500,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false, // has but not through api
                'swap': false,
                'future': false,
                'option': false,
                'fetchTime': true,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
            },
            'timeframes': {
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg',
                'api': {
                    // 'rest': 'https://cex.io/api',
                    'public': 'https://trade.cex.io/api/spot/rest-public',
                    // 'private': 'https://trade.cex.io/api/spot/rest-public',
                },
                'www': 'https://cex.io',
                'doc': 'https://trade.cex.io/docs/',
                'fees': [
                    'https://cex.io/fee-schedule',
                    'https://cex.io/limits-commissions',
                ],
                'referral': 'https://cex.io/r/0/up105393824/0/',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'get': {

                    },
                    'post': {
                        'get_server_time': 1,
                        'get_pairs_info': 1,
                        'get_currencies_info': 1,
                        'get_processing_info': 10,
                        'get_ticker': 1,
                        'get_trade_history': 1,
                    },
                },
                'private': {
                    'get': {

                    },
                    'post': {

                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {},
                'broad': {
                },
            },
            'options': {
                'networks': {
                    'BTC': 'bitcoin',
                    'ERC20': 'ERC20',
                    'BSC20': 'binancesmartchain',
                    'DOGE': 'dogecoin',
                    'ALGO': 'algorand',
                    'XLM': 'stellar',
                    'ATOM': 'cosmos',
                    'LTC': 'litecoin',
                    'XRP': 'ripple',
                    'FTM': 'fantom',
                    'MINA': 'mina',
                    'THETA': 'theta',
                    'XTZ': 'tezos',
                    'TIA': 'celestia',
                    'CRONOS': 'cronos', //
                    'MATIC': 'polygon',
                    'TON': 'ton',
                    'TRC20': 'tron',
                    'SOLANA': 'solana',
                    'SGB': 'songbird',
                    'DYDX': 'dydx',
                    'DASH': 'dash',
                    'ZIL': 'zilliqa',
                    'EOS': 'eos',
                    'AVALANCHEC': 'avalanche',
                    'ETHPOW': 'ethereumpow',
                    'NEAR': 'near',
                    'ARB': 'arbitrum',
                    'DOT': 'polkadot',
                    'OPT': 'optimism',
                    'INJ': 'injective',
                    'ADA': 'cardano',
                    'ONT': 'ontology',
                    'ICP': 'icp',
                    'KAVA': 'kava',
                    'KSM': 'kusama',
                    'SEI': 'sei',
                    // 'OSM': 'osmosis',
                    'NEO': 'neo',
                    'NEO3': 'neo3',
                    // 'TERRAOLD': 'terra', // tbd
                    // 'TERRA': 'terra2', // tbd
                    // 'EVER': 'everscale', // tbd
                    'XDC': 'xdc',
                },
            },
        });
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name cex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://trade.cex.io/docs/#rest-public-api-calls-currencies-info
         * @param {dict} [params] extra parameters specific to the exchange API endpoint
         * @returns {dict} an associative dictionary of currencies
         */
        const promise1 = this.publicPostGetCurrenciesInfo (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": [
        //            {
        //                "currency": "ZAP",
        //                "fiat": false,
        //                "precision": "8",
        //                "walletPrecision": "6",
        //                "walletDeposit": true,
        //                "walletWithdrawal": true
        //            },
        //            ...
        //
        const promise2 = this.publicPostGetProcessingInfo (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "ADA": {
        //                "name": "Cardano",
        //                "blockchains": {
        //                    "cardano": {
        //                        "type": "coin",
        //                        "deposit": "enabled",
        //                        "minDeposit": "1",
        //                        "withdrawal": "enabled",
        //                        "minWithdrawal": "5",
        //                        "withdrawalFee": "1",
        //                        "withdrawalFeePercent": "0",
        //                        "depositConfirmations": "15"
        //                    }
        //                }
        //            },
        //            ...
        //
        const responses = await Promise.all ([ promise1, promise2 ]);
        const dataCurrencies = this.safeList (responses[0], 'data', []);
        const dataNetworks = this.safeDict (responses[1], 'data', {});
        const currenciesIndexed = this.indexBy (dataCurrencies, 'currency');
        const data = this.deepExtend (currenciesIndexed, dataNetworks);
        return this.parseCurrencies (this.values (data));
    }

    parseCurrency (rawCurrency: Dict): Currency {
        const id = this.safeString (rawCurrency, 'currency');
        const code = this.safeCurrencyCode (id);
        const type = this.safeBool (rawCurrency, 'fiat') ? 'fiat' : 'crypto';
        const currencyDepositEnabled = this.safeBool (rawCurrency, 'walletDeposit');
        const currencyWithdrawEnabled = this.safeBool (rawCurrency, 'walletWithdrawal');
        const currencyPrecision = this.parseNumber (this.parsePrecision (this.safeString (rawCurrency, 'precision')));
        const networks: Dict = {};
        const rawNetworks = this.safeDict (rawCurrency, 'blockchains', {});
        const keys = Object.keys (rawNetworks);
        for (let j = 0; j < keys.length; j++) {
            const networkId = keys[j];
            const rawNetwork = rawNetworks[networkId];
            const networkCode = this.networkIdToCode (networkId);
            const deposit = this.safeString (rawNetwork, 'deposit') === 'enabled';
            const withdraw = this.safeString (rawNetwork, 'withdrawal') === 'enabled';
            networks[networkCode] = {
                'id': networkId,
                'network': networkCode,
                'margin': undefined,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': this.safeNumber (rawNetwork, 'withdrawalFee'),
                'precision': currencyPrecision,
                'limits': {
                    'deposit': {
                        'min': this.safeNumber (rawNetwork, 'minDeposit'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (rawNetwork, 'minWithdrawal'),
                        'max': undefined,
                    },
                },
                'info': rawNetwork,
            };
        }
        return this.safeCurrencyStructure ({
            'id': id,
            'code': code,
            'name': undefined,
            'type': type,
            'active': undefined,
            'deposit': currencyDepositEnabled,
            'withdraw': currencyWithdrawEnabled,
            'fee': undefined,
            'precision': currencyPrecision,
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'networks': networks,
            'info': rawCurrency,
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name cex#fetchMarkets
         * @description retrieves data on all markets for ace
         * @see https://trade.cex.io/docs/#rest-public-api-calls-pairs-info
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicPostGetPairsInfo (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": [
        //            {
        //                "base": "AI",
        //                "quote": "USD",
        //                "baseMin": "30",
        //                "baseMax": "2516000",
        //                "baseLotSize": "0.000001",
        //                "quoteMin": "10",
        //                "quoteMax": "1000000",
        //                "quoteLotSize": "0.01000000",
        //                "basePrecision": "6",
        //                "quotePrecision": "8",
        //                "pricePrecision": "4",
        //                "minPrice": "0.0377",
        //                "maxPrice": "19.5000"
        //            },
        //            ...
        //
        const data = this.safeList (response, 'data', []);
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        const baseId = this.safeString (market, 'base');
        const base = this.safeCurrencyCode (baseId);
        const quoteId = this.safeString (market, 'quote');
        const quote = this.safeCurrencyCode (quoteId);
        const id = base + '-' + quote; // not actual id, but for this exchange we can use this abbreviation, because e.g. tickers have hyphen in between
        const symbol = base + '/' + quote;
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'baseId': baseId,
            'quote': quote,
            'quoteId': quoteId,
            'settle': undefined,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'limits': {
                'amount': {
                    'min': this.safeNumber (market, 'baseMin'),
                    'max': this.safeNumber (market, 'baseMax'),
                },
                'price': {
                    'min': this.safeNumber (market, 'minPrice'),
                    'max': this.safeNumber (market, 'maxPrice'),
                },
                'cost': {
                    'min': this.safeNumber (market, 'quoteMin'),
                    'max': this.safeNumber (market, 'quoteMax'),
                },
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'precision': {
                'amount': this.safeString (market, 'baseLotSize'),
                'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'pricePrecision'))),
                // 'cost': this.parseNumber (this.parsePrecision (this.safeString (market, 'quoteLotSize'))), // buggy, doesn't reflect their documentation
                'base': this.parseNumber (this.parsePrecision (this.safeString (market, 'basePrecision'))),
                'quote': this.parseNumber (this.parsePrecision (this.safeString (market, 'quotePrecision'))),
            },
            'active': undefined,
            'created': undefined,
            'info': market,
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name cex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicPostGetServerTime (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "timestamp": "1728472063472",
        //            "ISODate": "2024-10-09T11:07:43.472Z"
        //        }
        //    }
        //
        const data = this.safeDict (response, 'data');
        const timestamp = this.safeInteger (data, 'timestamp');
        return timestamp;
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name cex#fetchTicker
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://trade.cex.io/docs/#rest-public-api-calls-ticker
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.fetchTickers ([ symbol ], params);
        return this.safeDict (response, symbol, {}) as Ticker;
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name cex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://trade.cex.io/docs/#rest-public-api-calls-ticker
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            request['pairs'] = this.marketIds (symbols);
        }
        const response = await this.publicPostGetTicker (this.extend (request, params));
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "AI-USD": {
        //                "bestBid": "0.3917",
        //                "bestAsk": "0.3949",
        //                "bestBidChange": "0.0035",
        //                "bestBidChangePercentage": "0.90",
        //                "bestAskChange": "0.0038",
        //                "bestAskChangePercentage": "0.97",
        //                "low": "0.3787",
        //                "high": "0.3925",
        //                "volume30d": "2945.722277",
        //                "lastTradeDateISO": "2024-10-11T06:18:42.077Z",
        //                "volume": "120.736000",
        //                "quoteVolume": "46.65654070",
        //                "lastTradeVolume": "67.914000",
        //                "volumeUSD": "46.65",
        //                "last": "0.3949",
        //                "lastTradePrice": "0.3925",
        //                "priceChange": "0.0038",
        //                "priceChangePercentage": "0.97"
        //            },
        //            ...
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseTickers (data, symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'id');
        const symbol = this.safeSymbol (marketId, market);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bestBid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'bestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'lastTradePrice'),
            'previousClose': undefined,
            'change': this.safeNumber (ticker, 'priceChange'),
            'percentage': this.safeNumber (ticker, 'priceChangePercentage'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name cex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://trade.cex.io/docs/#rest-public-api-calls-trade-history
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['fromDateISO'] = this.iso8601 (since);
        }
        let until = undefined;
        [ until, params ] = this.handleParamInteger2 (params, 'until', 'till');
        if (until !== undefined) {
            request['toDateISO'] = this.iso8601 (until);
        }
        if (limit !== undefined) {
            request['pageSize'] = Math.min (limit, 10000); // has a bug, still returns more trades
        }
        const response = await this.publicPostGetTradeHistory (this.extend (request, params));
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "pageSize": "10",
        //            "trades": [
        //                {
        //                    "tradeId": "1728630559823-0",
        //                    "dateISO": "2024-10-11T07:09:19.823Z",
        //                    "side": "SELL",
        //                    "price": "60879.5",
        //                    "amount": "0.00165962"
        //                },
        //                ... followed by older trades
        //
        const data = this.safeDict (response, 'data', {});
        const trades = this.safeList (data, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // public fetchTrades
        //
        //                {
        //                    "tradeId": "1728630559823-0",
        //                    "dateISO": "2024-10-11T07:09:19.823Z",
        //                    "side": "SELL",
        //                    "price": "60879.5",
        //                    "amount": "0.00165962"
        //                },
        //
        const dateStr = this.safeString (trade, 'dateISO');
        const timestamp = this.parse8601 (dateStr);
        market = this.safeMarket (undefined, market);
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': this.safeString (trade, 'tradeId'),
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': this.safeStringLower (trade, 'side'),
            'price': this.safeString (trade, 'price'),
            'amount' : this.safeString (trade, 'amount'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                body = this.json (query);
                headers = {
                    'Content-Type': 'application/json',
                };
            }
        } else {
            // this.checkRequiredCredentials ();
            // const nonce = this.nonce ().toString ();
            // const auth = nonce + this.uid + this.apiKey;
            // const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
            // body = this.json (this.extend ({
            //     'key': this.apiKey,
            //     'signature': signature.toUpperCase (),
            //     'nonce': nonce,
            // }, query));
            // headers = {
            //     'Content-Type': 'application/json',
            // };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        // if (Array.isArray (response)) {
        //     return response; // public endpoints may return []-arrays
        // }
        // if (body === 'true') {
        //     return undefined;
        // }
        // if (response === undefined) {
        //     throw new NullResponse (this.id + ' returned ' + this.json (response));
        // }
        // if ('e' in response) {
        //     if ('ok' in response) {
        //         if (response['ok'] === 'ok') {
        //             return undefined;
        //         }
        //     }
        // }
        // if ('error' in response) {
        //     const message = this.safeString (response, 'error');
        //     const feedback = this.id + ' ' + body;
        //     this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
        //     this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        //     throw new ExchangeError (feedback);
        // }
        // return undefined;
    }
}
