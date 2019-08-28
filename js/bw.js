'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, AuthenticationError, InvalidOrder, InsufficientFunds, RequestTimeout } = require ('./base/errors');
const { ROUND, DECIMAL_PLACES, NO_PADDING } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bw extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bw',
            'name': 'bw.com',
            'countries': [ 'CN' ],
            'rateLimit': 1500,
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
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'privateAPI': false,
                'publicAPI': false,
                'withdraw': false,
            },
            'timeframes': {
            },
            'urls': {
                'api': 'https://www.bw.com/exchange/',
                'www': 'https://www.bw.com',
                'doc': 'https://www.bw.com/restApi',
                'fees': 'https://www.bw.com/feesRate',
                'referral': '',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.1 / 100,
                    'maker': 0.1 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.1 / 100],
                        ],
                        'maker': [
                            [0, 0.1 / 100],
                        ],
                    },
                },
                'funding': {
                },
            },
            'exceptions': {
                // TODO
                'exact': {
                    'EOF': BadRequest,
                },
                'broad': {
                    'json: cannot unmarshal object into Go value of type': BadRequest,
                    'not allowed to cancel this order': BadRequest,
                    'request timed out': RequestTimeout,
                    'balance_freezing.freezing validation.balance_freeze': InsufficientFunds,
                    'order_creation.validation.validation': InvalidOrder,
                },
            },
            'api': {
                'public': {
                    'get': [
                        'config/controller/website/marketcontroller/getByWebId',
                    ],
                },
                'private': {
                    'post': [
                    ],
                },
            },
            'commonCurrencies': {
            },
            'precisionMode': DECIMAL_PLACES,
            'options': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        const exchangeResult = await this.publicGetConfigControllerWebsiteMarketcontrollerGetByWebId (params);
        const markets = exchangeResult['datas'];
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'marketId');
            const numericId = parseInt (id);
            const name = this.safeStringUpper (market, 'name');
            let [ quote, base ] = name.split ('_');
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const baseId = this.safeString (market, 'buyerCurrencyId');
            const quoteId = this.safeString (market, 'sellerCurrencyId');
            const baseNumericId = parseInt (baseId);
            const quoteNumericId = parseInt (quoteId);
            const symbol = base + '/' + quote;
            const state = this.safeInteger (market, 'state');
            const active = state === 1;
            result.push ({
                'id': id,
                'active': active,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'baseNumericId': baseNumericId,
                'quoteNumericId': quoteNumericId,
                'info': market,
                'precision': {
                    'amount': this.safeInteger (market, 'amountDecimal'),
                    'price': this.safeInteger (market, 'priceDecimal'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minAmount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': 0,
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + path;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to default error handler
        }
        const error = response['error'];
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
