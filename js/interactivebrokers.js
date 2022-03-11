'use strict';

//  ---------------------------------------------------------------------------
 
const Exchange = require ('./base/Exchange');
const { BadSymbol, ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, BadRequest } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class currencycom extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'interactivebrokers2',
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
                        '/v1/api/fyi/unreadnumber': 1,
                        '/v1/api/fyi/settings': 1,
                        '/v1/api/fyi/disclaimer/{typecode}': 1,
                        '/v1/api/fyi/deliveryoptions': 1,
                        '/v1/api/fyi/notifications': 1,
                        '/v1/api/fyi/notifications/more': 1,
                        '/v1/api/ccp/status': 1,
                        '/v1/api/ccp/account': 1,
                        '/v1/api/ccp/positions': 1,
                        '/v1/api/ccp/orders': 1,
                        '/v1/api/ccp/trades': 1,
                        '/v1/api/iserver/account/trades': 1,
                        '/v1/api/iserver/accounts': 1,
                        '/v1/api/iserver/account/:accountId/alerts': 1,
                        '/v1/api/iserver/account/alert/:id': 1,
                        '/v1/api/iserver/account/mta': 1,
                        '/v1/api/iserver/account/orders': 1,
                        '/v1/api/iserver/account/order/status/{orderId}': 1,
                        '/v1/api/iserver/marketdata/snapshot': 1,
                        '/v1/api/iserver/marketdata/{conid}/unsubscribe': 1,
                        '/v1/api/iserver/marketdata/unsubscribeall': 1,
                        '/v1/api/iserver/marketdata/history': 1,
                        '/v1/api/iserver/contract/{conid}/info': 1,
                        '/v1/api/iserver/secdef/strikes': 1,
                        '/v1/api/iserver/secdef/info': 1,
                        '/v1/api/iserver/contract/{conid}/algos': 1,
                        '/v1/api/iserver/contract/{conid}/info-and-rules': 1,
                        '/v1/api/iserver/scanner/params': 1,
                        '/v1/api/iserver/account/pnl/partitioned': 1,
                        '/v1/api/trsrv/secdef/schedule': 1,
                        '/v1/api/trsrv/futures': 1,
                        '/v1/api/trsrv/stocks': 1,
                        '/v1/api/portfolio/accounts': 1,
                        '/v1/api/portfolio/subaccounts': 1,
                        '/v1/api/portfolio/{accountId}/meta': 1,
                        '/v1/api/portfolio/{accountId}/allocation': 1,
                        '/v1/api/portfolio/{accountId}/positions/{pageId}': 1,
                        '/v1/api/portfolio/{accountId}/position/{conid}': 1,
                        '/v1/api/portfolio/{accountId}/summary': 1,
                        '/v1/api/portfolio/{accountId}/ledger': 1,
                        '/v1/api/portfolio/positions/{conid}': 1,
                        '/v1/api/sso/validate': 1,
                        '/v1/api/ibcust/entity/info': 1,
                    },
                    'post': {
                        '/v1/api/ws': 1,
                        '/v1/api/tickle': 1,
                        '/v1/api/logout': 1,
                        '/v1/api/ccp/auth/init': 1,
                        '/v1/api/fyi/settings/{typecode}': 1,
                        '/v1/api/fyi/deliveryoptions/device': 1,
                        '/v1/api/ccp/auth/response': 1,
                        '/v1/api/ccp/order': 1,
                        '/v1/api/iserver/auth/status': 1,
                        '/v1/api/iserver/reauthenticate': 1,
                        '/v1/api/iserver/account': 1,
                        '/v1/api/iserver/account/{accountId}/alert': 1,
                        '/v1/api/iserver/account/:accountId/alert/activate': 1,
                        '/v1/api/iserver/account/{accountId}/order': 1,
                        '/v1/api/iserver/account/{accountId}/orders': 1,
                        '/v1/api/iserver/account/orders/{faGroup}': 1,
                        '/v1/api/iserver/reply/{replyid}': 1,
                        '/v1/api/iserver/account/{accountId}/order/whatif': 1,
                        '/v1/api/iserver/account/{accountId}/orders/whatif': 1,
                        '/v1/api/iserver/account/{accountId}/order/{orderId}': 1,
                        '/v1/api/iserver/secdef/search': 1,
                        '/v1/api/iserver/scanner/run': 1,
                        '/v1/api/trsrv/secdef': 1,
                        '/v1/api/portfolio/allocation': 1,
                        '/v1/api/portfolio/{accountId}/positions/invalidate': 1,
                        '/v1/api/pa/performance': 1,
                        '/v1/api/pa/summary': 1,
                        '/v1/api/pa/transactions': 1,
                    },
                    'put': {
                        '/v1/api/fyi/disclaimer/{typecode}': 1,
                        '/v1/api/fyi/deliveryoptions/email': 1,
                        '/v1/api/fyi/notifications/{notificationId}': 1,
                        '/v1/api/ccp/order': 1,
                    },
                    'delete': {
                        '/v1/api/fyi/deliveryoptions/{deviceId}': 1,
                        '/v1/api/ccp/order': 1,
                        '/v1/api/iserver/account/{accountId}/alert/{alertId}': 1,
                        '/v1/api/iserver/account/{accountId}/order/{orderId}': 1,
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
        });
    }

    async fetchMarkets (params = {}) {
        await this.IBKR_load ();
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
};
