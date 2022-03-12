'use strict';

//  ---------------------------------------------------------------------------
 
const Exchange = require ('./base/Exchange');
const { BadSymbol, ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, BadRequest } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class interactivebrokers extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'interactivebrokers',
            'name': 'Interactive Brokers ',
            'countries': [ 'US' ], // USA
            'rateLimit': 100,
            'version': 'v1',
            // new metainfo interface
            'has': {
                'publicAPI': true,
                'privateAPI': true,
                'CORS': undefined,
                'spot': undefined,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'addMargin': undefined,
                'cancelAllOrders': undefined,
                'cancelOrder': undefined,
                'cancelOrders': undefined,
                'createDepositAddress': undefined,
                'createLimitOrder': undefined,
                'createMarketOrder': undefined,
                'createOrder': undefined,
                'deposit': undefined,
                'editOrder': 'emulated',
                'fetchAccounts': undefined,
                'fetchBalance': undefined,
                'fetchBidsAsks': undefined,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchBorrowRates': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': 'emulated',
                'fetchDeposit': undefined,
                'fetchDepositAddress': undefined,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': undefined,
                'fetchDeposits': undefined,
                'fetchFundingFee': undefined,
                'fetchFundingFees': undefined,
                'fetchFundingHistory': undefined,
                'fetchFundingRate': undefined,
                'fetchFundingRateHistory': undefined,
                'fetchFundingRates': undefined,
                'fetchIndexOHLCV': undefined,
                'fetchL2OrderBook': undefined,
                'fetchLedger': undefined,
                'fetchLedgerEntry': undefined,
                'fetchLeverageTiers': undefined,
                'fetchMarketLeverageTiers': undefined,
                'fetchMarkets': undefined,
                'fetchMarkOHLCV': undefined,
                'fetchMyTrades': undefined,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': undefined,
                'fetchOrder': undefined,
                'fetchOrderBook': undefined,
                'fetchOrderBooks': undefined,
                'fetchOrders': undefined,
                'fetchOrderTrades': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': undefined,
                'fetchStatus': 'emulated',
                'fetchTicker': undefined,
                'fetchTickers': undefined,
                'fetchTime': undefined,
                'fetchTrades': undefined,
                'fetchTradingFee': undefined,
                'fetchTradingFees': undefined,
                'fetchTradingLimits': undefined,
                'fetchTransactions': undefined,
                'fetchTransfers': undefined,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': undefined,
                'loadMarkets': true,
                'reduceMargin': undefined,
                'setLeverage': undefined,
                'setMarginMode': undefined,
                'setPositionMode': undefined,
                'signIn': undefined,
                'transfer': undefined,
                'withdraw': undefined,
            },
            'timeframes': {
                '1m': '1m',
            },
            'hostname': '',
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://localhost:5000/',
                    'private': 'https://localhost:5000/',
                },
                'test': {
                    'public': '',
                    'private': '',
                },
                'www': 'https://www.interactivebrokers.com/',
                'referral': '',
                'doc': [
                    'https://www.interactivebrokers.com/en/index.php?f=5041', // main
                    'https://interactivebrokers.github.io/cpwebapi/', // Client-Portal web-api
                    'https://interactivebrokers.github.io/cpwebapi/swagger-ui.html', // Swagger
                    'https://www.interactivebrokers.com/api/doc.html', // Redoc (Swagger based)
                    'https://download2.interactivebrokers.com/portal/clientportal.gw.zip', // local client
                ],
                'fees': 'https://www.interactivebrokers.com/en/index.php?f=1590&p=crypto',
            },
            'api': {
                'public': {
                    'get': {
                    },
                },
                'marketcap': {
                    'get': {
                    },
                },
                'private': {
                    'get': {
                        'sso/Dispatcher': 1, // uncodumented: validates the login
                        'fyi/unreadnumber': 1,
                        'fyi/settings': 1,
                        'fyi/disclaimer/{typecode}': 1,
                        'fyi/deliveryoptions': 1,
                        'fyi/notifications': 1,
                        'fyi/notifications/more': 1,
                        'ccp/status': 1,
                        'ccp/account': 1,
                        'ccp/positions': 1,
                        'ccp/orders': 1,
                        'ccp/trades': 1,
                        'iserver/account/trades': 1, // auth issue
                        'iserver/accounts': 1, // auth issue
                        'iserver/account/:accountId/alerts': 1, // auth issue
                        'iserver/account/alert/:id': 1, // auth issue
                        'iserver/account/mta': 1, // auth issue
                        'iserver/account/orders': 1, // auth issue
                        'iserver/account/order/status/{orderId}': 1, // auth issue
                        'iserver/marketdata/snapshot': 1, // auth issue
                        'iserver/marketdata/{conid}/unsubscribe': 1, // auth issue
                        'iserver/marketdata/unsubscribeall': 1, // auth issue
                        'iserver/marketdata/history': 1, // auth issue
                        'iserver/contract/{conid}/info': 1, // auth issue
                        'iserver/secdef/strikes': 1, // auth issue
                        'iserver/secdef/info': 1, // auth issue
                        'iserver/contract/{conid}/algos': 1, // auth issue
                        'iserver/contract/{conid}/info-and-rules': 1, // auth issue
                        'iserver/scanner/params': 1, // auth issue
                        'iserver/account/pnl/partitioned': 1, // auth issue
                        'trsrv/secdef/schedule': 1, // trading schedule up to a month for the requested contract
                        'trsrv/futures': 1, // a list of non-expired future contracts (conid) for given symbol(s)
                        'trsrv/stocks': 1, // an object contains all stock contracts (conid) for given symbol(s)
                        'portfolio/accounts': 1,
                        'portfolio/subaccounts': 1,
                        'portfolio/{accountId}/meta': 1,
                        'portfolio/{accountId}/allocation': 1,
                        'portfolio/{accountId}/positions/{pageId}': 1,
                        'portfolio/{accountId}/position/{conid}': 1,
                        'portfolio/{accountId}/summary': 1,
                        'portfolio/{accountId}/ledger': 1,
                        'portfolio/positions/{conid}': 1,
                        'sso/validate': 1,
                        'ibcust/entity/info': 1,
                    },
                    'post': {
                        'ws': 1,
                        'tickle': 1, // documented: validates the login
                        'logout': 1,
                        'ccp/auth/init': 1,
                        'fyi/settings/{typecode}': 1,
                        'fyi/deliveryoptions/device': 1,
                        'ccp/auth/response': 1,
                        'ccp/order': 1,
                        'iserver/auth/status': 1,
                        'iserver/reauthenticate': 1,
                        'iserver/account': 1,
                        'iserver/account/{accountId}/alert': 1,
                        'iserver/account/:accountId/alert/activate': 1,
                        'iserver/account/{accountId}/order': 1,
                        'iserver/account/{accountId}/orders': 1,
                        'iserver/account/orders/{faGroup}': 1,
                        'iserver/reply/{replyid}': 1,
                        'iserver/account/{accountId}/order/whatif': 1,
                        'iserver/account/{accountId}/orders/whatif': 1,
                        'iserver/account/{accountId}/order/{orderId}': 1,
                        'iserver/secdef/search': 1,
                        'iserver/scanner/run': 1,
                        'trsrv/secdef': 1,
                        'portfolio/allocation': 1,
                        'portfolio/{accountId}/positions/invalidate': 1,
                        'pa/performance': 1,
                        'pa/summary': 1,
                        'pa/transactions': 1,
                    },
                    'put': {
                        'fyi/disclaimer/{typecode}': 1,
                        'fyi/deliveryoptions/email': 1,
                        'fyi/notifications/{notificationId}': 1,
                        'ccp/order': 1,
                    },
                    'delete': {
                        'fyi/deliveryoptions/{deviceId}': 1,
                        'ccp/order': 1,
                        'iserver/account/{accountId}/alert/{alertId}': 1,
                        'iserver/account/{accountId}/order/{orderId}': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.002'),
                    'maker': this.parseNumber ('0.002'),
                },
            },
            'precisionMode': TICK_SIZE,
            // exchange-specific options
            'options': {
            },
            'exceptions': {
                'broad': {
                },
                'exact': {
                },
            },
            'commonCurrencies': {
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetGetInstruments (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'InstrumentId');
            // const lowercaseId = this.safeStringLower (market, 'symbol');
            const baseId = this.safeString (market, 'Product1');
            const quoteId = this.safeString (market, 'Product2');
            const base = this.safeCurrencyCode (this.safeString (market, 'Product1Symbol'));
            const quote = this.safeCurrencyCode (this.safeString (market, 'Product2Symbol'));
            const sessionStatus = this.safeString (market, 'SessionStatus');
            const isDisable = this.safeValue (market, 'IsDisable');
            const sessionRunning = (sessionStatus === 'Running');
            result.push ({
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
                'active': (sessionRunning && !isDisable),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'QuantityIncrement'),
                    'price': this.safeNumber (market, 'PriceIncrement'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'MinimumQuantity'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.safeNumber (market, 'MinimumPrice'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        [ path, params ] = this.resolvePath (path, params);
        let url = this.urls['api'][api] + this.version + '/api/' + path;
        if (method === 'GET' || method === 'DELETE') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            body = this.json (params);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to default error handler
        }
        const errorMessage = this.safeString (response, 'errorMessage', '');
        const errorCode = this.safeString (response, 'errorCode', '');
        if (errorMessage !== '') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
