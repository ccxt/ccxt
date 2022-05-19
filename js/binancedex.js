'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class binancedex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binancedex',
            'name': 'Binancedex',
            'countries': [ 'JP', 'MT' ], // Japan, Malta
            'rateLimit': 100,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'createOrder': true,
                'editOrder': false,
                'fetchBalance': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': '',
                'api': 'https://dex-asiapacific.binance.org/api/v1',
                'www': 'https://www.bnbchain.world/',
            },
            'requiredCredentials': {
                'wallet': true,
                'password': true,
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'klines',
                        'mini/tokens',
                        'tokens',
                    ],
                },
                'private': {
                },
            },
            'fees': {
            },
            'options': {
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'commonCurrencies': {
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const request = {
            'limit': 1000,
        };
        const response = await this.publicGetTokens (this.extend (request, params));
        //
        //     [
        //         {
        //             name: '100x',
        //             original_symbol: '100X',
        //             symbol: '100X-0A2M',
        //             owner: 'bnb1rw99629ue5rlal4llqrzltvweltv4fhu5nzlrq',
        //             token_uri: 'https://discord.gg/Cw4az9',
        //             token_type: '2',
        //             total_supply: '1000000.00000000',
        //             mintable: false
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const currencyId = this.safeString (currency, 'symbol');
            const code = this.safeString (currency, 'original_symbol');
            result[code] = {
                'id': currencyId,
                'code': code,
                'info': currency,
                'type': undefined,
                'name': undefined,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': undefined,
                'limits': undefined,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const request = {
            'limit': 1000,
        };
        const response = await this.publicGetMarkets (this.extend (request, params));
        //
        //     {
        //         base_asset_symbol: 'ADA-9F4',
        //         list_price: '0.08000000',
        //         lot_size: '1.00000000',
        //         quote_asset_symbol: 'BUSD-BD1',
        //         tick_size: '0.00000100'
        //     }
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const baseId = this.safeString (market, 'base_asset_symbol');
            const quoteId = this.safeString (market, 'quote_asset_symbol');
            const [ base ] = baseId.split ('-');
            const [ quote ] = quoteId.split ('-');
            const id = baseId + '_' + quoteId;
            const uppercaseId = id.toUpperCase ();
            const symbol = base + '/' + quote;
            const precision = {
                'price': this.safeInteger (market, 'tick_size'),
                'amount': this.safeInteger (market, 'lot_size'),
            };
            result.push ({
                'id': id,
                'uppercaseId': uppercaseId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': base,
                'quoteId': quote,
                'settle': undefined,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'derivative': false,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'limits': undefined,
                'precision': precision,
                'active': undefined,
                'info': market,
            });
        }
        return result;
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeInteger (ohlcv, 'timestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const resolution = this.timeframes[timeframe];
        const request = {
            'symbol': market['id'],
            'pair': market['id'],
            'interval': resolution,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const timeframeInSeconds = this.parseTimeframe (timeframe);
        if (since !== undefined) {
            request['startTime'] = Math.floor (since / 1000);
            request['endTime'] = this.sum (request['startTime'], limit * timeframeInSeconds);
        }
        const response = await this.publicGetKlines (this.extend (request, params));
        //
        //     [
        //         1652883600000,
        //         '0.53458000',
        //         '0.53458000',
        //         '0.53458000',
        //         '0.53458000',
        //         '0.00000000',
        //         1652883899999,
        //         '0.00000000',
        //         0
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (headers === undefined) {
            headers = {};
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            // for signing transaction
        } else if (api === 'public' && method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to the default error handler
        }
        if (code >= 200 && code < 300) {
            return;
        }
        const feedback = this.id + ' ' + body;
        // const error = this.safeString (response, 'error');
        // this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
        // this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
        throw new ExchangeError (feedback); // unknown message
    }
};
