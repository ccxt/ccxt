
// ---------------------------------------------------------------------------

import Exchange from './abstract/hibachi.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Currencies, Dict, Market, Str, Ticker } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class hibachi
 * @augments Exchange
 */
export default class hibachi extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'hibachi',
            'name': 'Hibachi',
            'countries': [ 'US' ],
            'rateLimit': 100,
            'userAgent': this.userAgents['chrome'],
            'certified': false,
            'pro': false,
            'dex': true,
            // TODO: flip it to `true` once we implement the handler
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelWithdraw': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': 'emulated',
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                // TODO: add all timeframes
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/xxx', // TODO: upload logo
                'api': {
                    'public': 'https://data-api.hibachi.xyz',
                    'private': 'https://api.hibachi.xyz',
                },
                'www': 'https://www.hibachi.xyz/',
            },
            'api': {
                'public': {
                    'get': {
                        'market/exchange-info': 1,
                        'market/data/prices': 1,
                        'market/data/stats': 1,
                    },
                },
                'private': {
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
                'accountId': true,
                'privateKey': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0000'),
                    'taker': this.parseNumber ('0.0002'),
                },
            },
            'options': {
            },
            'features': {
                'default': {
                    // TODO: add settings here
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    parseMarket (market: Dict): Market {
        const marketId = this.safeString (market, 'symbol');
        const numericId = this.safeNumber (market, 'id');
        const marketType = 'swap';
        const baseId = this.safeString (market, 'underlyingSymbol');
        const quoteId = this.safeString (market, 'settlementSymbol');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settleId: Str = this.safeString (market, 'settlementSymbol');
        const settle: Str = this.safeCurrencyCode (settleId);
        const symbol = base + '/' + quote + ':' + settle;
        return {
            'id': marketId,
            'numericId': numericId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': marketType,
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': this.safeString (market, 'status') === 'LIVE',
            'contract': true,
            'linear': true,
            'inverse': false,
            'contractSize': this.parseNumber ('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (market, 'minOrderSize'),
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
                    'min': this.safeNumber (market, 'minNotional'),
                    'max': undefined,
                },
            },
            // We don't expose this timestamp yet. Hardcode to the launch date of our exchange: 2024/10/10
            // TODO: use the real timestamp once we have it
            'created': 1728561600000,
            'info': market,
        };
    }

    /**
     * @method
     * @name hibachi#fetchMarkets
     * @description retrieves data on all markets for hibachi
     * @see https://api-doc.hibachi.xyz/#183981da-8df5-40a0-a155-da15015dd536
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetMarketExchangeInfo (params);
        // {
        //     "displayName": "ETH/USDT Perps",
        //     "id": 1,
        //     "maintenanceFactorForPositions": "0.030000",
        //     "marketCloseTimestamp": null,
        //     "marketOpenTimestamp": null,
        //     "minNotional": "1",
        //     "minOrderSize": "0.000000001",
        //     "orderbookGranularities": [
        //         "0.01",
        //         "0.1",
        //         "1",
        //         "10"
        //     ],
        //     "riskFactorForOrders": "0.066667",
        //     "riskFactorForPositions": "0.030000",
        //     "settlementDecimals": 6,
        //     "settlementSymbol": "USDT",
        //     "status": "LIVE",
        //     "stepSize": "0.000000001",
        //     "symbol": "ETH/USDT-P",
        //     "tickSize": "0.000001",
        //     "underlyingDecimals": 9,
        //     "underlyingSymbol": "ETH"
        // },
        const rows = this.safeList (response, 'futureContracts');
        return this.parseMarkets (rows);
    }

    /**
     * @method
     * @name hibachi#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api-doc.hibachi.xyz/#183981da-8df5-40a0-a155-da15015dd536
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        // Hibachi only supports USDT on Arbitrum at this time
        // We don't have an API endpoint to expose this information yet
        const result: Dict = {};
        const networks: Dict = {};
        const networkId = 'ARBITRUM';
        networks[networkId] = {
            'id': networkId,
            'network': networkId,
            'limits': {
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'active': undefined,
            'deposit': undefined,
            'withdraw': undefined,
            'info': {},
        };
        const code = this.safeCurrencyCode ('USDT');
        result[code] = this.safeCurrencyStructure ({
            'id': 'USDT',
            'name': 'USDT',
            'type': 'fiat',
            'code': code,
            'precision': this.parseNumber ('0.000001'),
            'active': true,
            'fee': undefined,
            'networks': networks,
            'deposit': true,
            'withdraw': true,
            'limits': {
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': {},
        });
        return result;
    }

    parseTicker (prices: Dict, stats: Dict, market: Market = undefined): Ticker {
        const bid = this.safeFloat (prices, 'bidPrice');
        const ask = this.safeFloat (prices, 'askPrice');
        const last = this.safeFloat (prices, 'tradePrice');
        const high = this.safeFloat (stats, 'high24h');
        const low = this.safeFloat (stats, 'low24h');
        const volume = this.safeFloat (stats, 'volume24h');
        prices['high24h'] = high;
        prices['low24h'] = low;
        prices['volume24h'] = volume;
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': undefined,
            'datetime': undefined,
            'bid': bid,
            'ask': ask,
            'last': last,
            'high': high,
            'low': low,
            'bidVolume': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': volume,
            'info': prices,
        }, market);
    }

    /**
     * @method
     * @name hibachi#fetchTicker
     * @see https://api-doc.hibachi.xyz/#4abb30c4-e5c7-4b0f-9ade-790111dbfa47
     * @description fetches a price ticker and the related information for the past 24h
     * @param {string} symbol unified symbol of the market
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: Str): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const prices_response = await this.publicGetMarketDataPrices (this.extend (request));
        const stats_response = await this.publicGetMarketDataStats (this.extend (request));
        return this.parseTicker (prices_response, stats_response);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.omit (params, this.extractParams (path));
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        const query = this.urlencode (request);
        if (api === 'private') {
            // TODO: add auth header with API key here
            headers = this.extend (headers, {});
        } else if (query.length !== 0) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
