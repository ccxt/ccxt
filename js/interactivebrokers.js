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
                        // ISERVER
                        'iserver/account/trades': 1, // -
                        'iserver/account/{accountId}/alerts': 1,
                        'iserver/account/alert/{id}': 1,
                        'iserver/account/mta': 1,
                        'iserver/account/orders': 1, // -
                        'iserver/account/order/status/{orderId}': 1, // -
                        'iserver/account/pnl/partitioned': 1, // unrealized pln (?)
                        //     The below endpoint returns a list of accounts the user has trading access to,
                        //     their respective aliases and the currently selected account.
                        //     Note 1: this endpoint must be called before modifying an order or querying open orders.
                        //     Note 2: 'iserver' endpoints doesn't seem to work on free-trial accounts.
                        'iserver/accounts': 1, // +
                        'iserver/marketdata/snapshot': 1, // needs conid !!!!
                        'iserver/marketdata/{conid}/unsubscribe': 1, // needs conid !!!!
                        'iserver/marketdata/unsubscribeall': 1,
                        'iserver/marketdata/history': 1, // needs conid !!!!
                        'iserver/contract/{conid}/info': 1, // needs conid !!!!
                        'iserver/secdef/strikes': 1, // needs conid !!!!
                        'iserver/secdef/info': 1, // needs conid !!!!
                        'iserver/contract/{conid}/algos': 1, // needs conid !!!!
                        'iserver/contract/{conid}/info-and-rules': 1, // needs conid !!!!
                        'iserver/scanner/params': 1, // scannable params (sample: pastebin(dot)com/bQh3nr35)
                        'trsrv/secdef/schedule': 1, // trading schedule up to a month for the requested contract (sample: pastebin(dot)com/BTQW7Pxc)
                        'trsrv/futures': 1, // a list of non-expired future contracts (conid) for given symbol(s)
                        'trsrv/stocks': 1, // an object contains all stock contracts (conid) for given symbol(s)
                        // PORTFOLIO
                        //      In non-tiered account structures, the below endpoint returns a list of accounts for which
                        //      the user can view position and account information. This endpoint must be called prior to
                        //      calling other /portfolio endpoints for those accounts.
                        'portfolio/accounts': 1,
                        'portfolio/subaccounts': 1,
                        'portfolio/{accountId}/meta': 1,
                        'portfolio/{accountId}/allocation': 1,
                        'portfolio/{accountId}/positions/{pageId}': 1,
                        'portfolio/{accountId}/position/{conid}': 1,
                        'portfolio/{accountId}/summary': 1,
                        'portfolio/{accountId}/ledger': 1,
                        'portfolio/positions/{conid}': 1,
                        // CCP (Beta)
                        'ccp/status': 1,
                        'ccp/account': 1,
                        'ccp/positions': 1,
                        'ccp/orders': 1,
                        'ccp/trades': 1,
                        // FYI
                        'fyi/unreadnumber': 1,
                        'fyi/settings': 1,
                        'fyi/disclaimer/{typecode}': 1,
                        'fyi/deliveryoptions': 1,
                        'fyi/notifications': 1,
                        'fyi/notifications/more': 1,
                        // others
                        'ibcust/entity/info': 1,
                        'portal/sso/validate': 1, // extends active session
                        'sso/Dispatcher': 1, // uncodumented: validates the login
                    },
                    'post': {
                        // ISERVER
                        'iserver/auth/status': 1,
                        'iserver/reauthenticate': 1,
                        'iserver/account': 1,
                        'iserver/account/{accountId}/alert': 1,
                        'iserver/account/{accountId}/alert/activate': 1,
                        'iserver/account/{accountId}/order': 1,
                        'iserver/account/{accountId}/orders': 1,
                        'iserver/account/orders/{faGroup}': 1,
                        'iserver/reply/{replyid}': 1,
                        'iserver/account/{accountId}/order/whatif': 1,
                        'iserver/account/{accountId}/orders/whatif': 1,
                        'iserver/account/{accountId}/order/{orderId}': 1,
                        'iserver/secdef/search': 1,
                        'iserver/scanner/run': 1,
                        // portfolio
                        'portfolio/allocation': 1,
                        'portfolio/{accountId}/positions/invalidate': 1,
                        // CCP (Beta)
                        'ccp/auth/init': 1,
                        'ccp/auth/response': 1,
                        'ccp/order': 1,
                        // FYI
                        'fyi/settings/{typecode}': 1,
                        'fyi/deliveryoptions/device': 1,
                        // others
                        'pa/performance': 1,
                        'pa/summary': 1,
                        'pa/transactions': 1,
                        'ws': 1,
                        'tickle': 1, // validates the login
                        'logout': 1,
                        'trsrv/secdef': 1,
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
                'fetchAccountsMethod': 'privateGetIserverAccounts', // privateGetIserverAccounts, privateGetPortfolioAccounts
            },
            'exceptions': {
                'broad': {
                },
                'exact': {
                    // 400 Bad Request {"error":"Bad Request: Conid(s) missing","statusCode":400}
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

    async isConnected (params = {}) {
        const response = await this.privatePostTickle (params);
        //
        //     {
        //         "session": "140a9b1902d27e94x236dc142ce933a6",
        //         "ssoExpires": 483732,
        //         "collission": false,
        //         "userId": 46130428,
        //         "iserver": {
        //             "authStatus": {
        //                 "authenticated": true,
        //                 "competing": false,
        //                 "connected": true,
        //                 "message": "",
        //                 "MAC": "F4:03:43:E4:EF:C0",
        //                 "serverInfo": {
        //                     "serverName": "JieZ46418",
        //                     "serverVersion": "Build 10.14.0l, Mar 1, 2022 5:28:08 PM"
        //                 }
        //             }
        //         }
        //     }
        //
        const expires = this.safeInteger (response, 'expires');
        return (expires > 0);
    }

    async fetchAccounts (params = {}) {
        await this.loadMarkets ();
        let method = this.safeString (this.options, 'fetchAccountsMethod');
        method = this.safeString (params, 'method', method);
        params = this.omit (params, 'method');
        const response = await this[method] (params);
        //
        // iserver/accounts
        //
        //     {
        //         "accounts": [
        //           "U3449298"
        //         ],
        //         "acctProps": {
        //           "U3449298": {
        //             "hasChildAccounts": false,
        //             "supportsCashQty": true,
        //             "supportsFractions": false
        //           }
        //         },
        //         "aliases": {
        //           "U3449298": "U3449298"
        //         },
        //         "chartPeriods": {
        //           "STK": ["*"],
        //           "CFD": ["*"],
        //           "OPT": ["2h","1d","2d","1w","1m"],
        //           "FOP": ["2h","1d","2d","1w","1m"],
        //           "WAR": ["*"],
        //           "IOPT": ["*"],
        //           "FUT": ["*"],
        //           "CASH": ["*"],
        //           "IND": ["*"],
        //           "BOND": ["*"],
        //           "FUND": ["*"],
        //           "CMDTY": ["*"],
        //           "PHYSS": ["*"],
        //           "CRYPTO": ["*"]
        //         },
        //         "selectedAccount": "U3449298",
        //         "allowFeatures": {
        //           "showGFIS": true,
        //           "allowFXConv": true,
        //           "allowTypeAhead": true,
        //           "snapshotRefreshTimeout": "30",
        //           "liteUser": false,
        //           "showWebNews": true,
        //           "research": true,
        //           "debugPnl": true,
        //           "showTaxOpt": true,
        //           "showImpactDashboard": true,
        //           "allowedAssetTypes": "STK,CFD,OPT,FOP,WAR,FUT,BAG,CASH,IND,BOND,BILL,FUND,SLB,News,CMDTY,IOPT,ICU,ICS,PHYSS,CRYPTO"
        //         },
        //         "serverInfo": {
        //           "serverName": "JaeZ01197",
        //           "serverVersion": "Build 10.14.0l, Mar 1, 2022 5:28:08 PM"
        //         },
        //         "sessionId": "613de523.0000000b"
        //     }
        //
        //
        // portfolio/accounts
        //
        //     [
        //         {
        //             "id": "U3449298",
        //             "accountId": "U3449298",
        //             "accountVan": "U3449298",
        //             "accountTitle": "John Doe",
        //             "displayName": "John Doe",
        //             "accountAlias": null,
        //             "accountStatus": "1646607600000",
        //             "currency": "USD",
        //             "type": "INDIVIDUAL",
        //             "tradingType": "STKNOPT",
        //             "ibEntity": "IBLLC-US",
        //             "faclient": false,
        //             "clearingStatus": "O",
        //             "covestor": false,
        //             "parent": {
        //                 "mmc": [],
        //                 "accountId": "",
        //                 "isMParent": false,
        //                 "isMChild": false,
        //                 "isMultiplex": false
        //             },
        //             "desc": "U3449298"
        //         }
        //     ]
        //
        return response;
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
