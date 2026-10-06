//  ---------------------------------------------------------------------------

import Exchange from './abstract/interactivebrokers.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, OrderNotFound, RateLimitExceeded } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Account, Balances, Dict, Endpoint, List, NullableDict, Str, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class interactivebrokers
 * @augments Exchange
 */
export default class interactivebrokers extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'interactivebrokers',
            'name': 'Interactive Brokers',
            'countries': [ 'US' ],
            'version': 'v1',
            'rateLimit': 100, // the client portal gateway allows ~10 requests per second
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
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': false,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1min',
            },
            'urls': {
                'logo': '',
                'api': {
                    // the client portal gateway runs locally and proxies the requests to IBKR
                    'private': 'https://localhost:5000/',
                },
                'www': 'https://www.interactivebrokers.com/',
                'referral': '',
                'doc': [
                    'https://www.interactivebrokers.com/docs/web-api/introduction',
                    'https://github.com/Voyz/ibind/blob/master/docs/oauth/oauth_1a.md#enabling_oauth1a',
                    'https://ndcdyn.interactivebrokers.com/oauth/?loginType=1&action=OAUTH&clt=0&RL=1&ip2loc=US#/configuration',
                ],
                'fees': 'https://www.interactivebrokers.com/en/index.php?f=1590&p=crypto',
            },
            'api': {
                'private': {
                    'get': {
                        // informational
                        'trsrv/secdef/schedule': { 'cost': 1 } as Endpoint<List>, // trading schedule up to a month for the requested contract
                        'trsrv/futures': { 'cost': 1 } as Endpoint<Dict>, // non-expired future contracts (conid) for given symbol(s)
                        'trsrv/stocks': { 'cost': 1 } as Endpoint<Dict>, // stock contracts (conid) for given symbol(s)
                        // iserver
                        'iserver/account/trades': { 'cost': 1 } as Endpoint<List>,
                        'iserver/account/{accountId}/alerts': { 'cost': 1 } as Endpoint<List>,
                        'iserver/account/alert/{id}': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/mta': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/order/status/{orderId}': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/pnl/partitioned': { 'cost': 1 } as Endpoint<Dict>,
                        // must be called before modifying an order or querying open orders
                        // 'iserver' endpoints do not work on free-trial accounts
                        'iserver/accounts': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/marketdata/snapshot': { 'cost': 1 } as Endpoint<List>, // requires conids
                        'iserver/marketdata/{conid}/unsubscribe': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/marketdata/unsubscribeall': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/marketdata/history': { 'cost': 1 } as Endpoint<Dict>, // requires conid
                        'iserver/contract/{conid}/info': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/secdef/strikes': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/secdef/info': { 'cost': 1 } as Endpoint<List>,
                        'iserver/contract/{conid}/algos': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/contract/{conid}/info-and-rules': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/scanner/params': { 'cost': 1 } as Endpoint<Dict>,
                        // portfolio
                        // in non-tiered account structures, portfolio/accounts must be called prior to other /portfolio endpoints
                        'portfolio/accounts': { 'cost': 1 } as Endpoint<List>,
                        'portfolio/subaccounts': { 'cost': 1 } as Endpoint<List>,
                        'portfolio/{accountId}/meta': { 'cost': 1 } as Endpoint<Dict>,
                        'portfolio/{accountId}/allocation': { 'cost': 1 } as Endpoint<Dict>,
                        'portfolio/{accountId}/positions/{pageId}': { 'cost': 1 } as Endpoint<List>,
                        'portfolio/{accountId}/position/{conid}': { 'cost': 1 } as Endpoint<List>,
                        'portfolio/{accountId}/summary': { 'cost': 1 } as Endpoint<Dict>,
                        'portfolio/{accountId}/ledger': { 'cost': 1 } as Endpoint<Dict>,
                        'portfolio/positions/{conid}': { 'cost': 1 } as Endpoint<Dict>,
                        // fyi
                        'fyi/unreadnumber': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/settings': { 'cost': 1 } as Endpoint<List>,
                        'fyi/disclaimer/{typecode}': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/deliveryoptions': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/notifications': { 'cost': 1 } as Endpoint<List>,
                        'fyi/notifications/more': { 'cost': 1 } as Endpoint<List>,
                        // others
                        'ibcust/entity/info': { 'cost': 1 } as Endpoint<Dict>,
                        'portal/sso/validate': { 'cost': 1 } as Endpoint<Dict>, // extends active session
                        'sso/Dispatcher': { 'cost': 1 } as Endpoint<Dict>, // undocumented: validates the login
                    },
                    'post': {
                        // iserver
                        'iserver/auth/status': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/reauthenticate': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account': { 'cost': 1 } as Endpoint<Dict>, // switch account
                        'iserver/account/{accountId}/alert': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/{accountId}/alert/activate': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/{accountId}/orders': { 'cost': 1 } as Endpoint<List>,
                        'iserver/account/orders/{faGroup}': { 'cost': 1 } as Endpoint<List>, // financial advisor orders
                        'iserver/reply/{replyid}': { 'cost': 1 } as Endpoint<List>, // order reply confirmation
                        'iserver/account/{accountId}/orders/whatif': { 'cost': 1 } as Endpoint<Dict>, // order preview with commission info
                        'iserver/account/{accountId}/order/{orderId}': { 'cost': 1 } as Endpoint<List>, // modify order
                        'iserver/secdef/search': { 'cost': 1 } as Endpoint<List>, // search by symbol or company name
                        'iserver/scanner/run': { 'cost': 1 } as Endpoint<Dict>,
                        // portfolio
                        'portfolio/allocation': { 'cost': 1 } as Endpoint<Dict>, // consolidated view of all accounts returned by /portfolio/accounts
                        'portfolio/{accountId}/positions/invalidate': { 'cost': 1 } as Endpoint<Dict>,
                        // fyi
                        'fyi/settings/{typecode}': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/deliveryoptions/device': { 'cost': 1 } as Endpoint<Dict>,
                        // others
                        'pa/performance': { 'cost': 1 } as Endpoint<Dict>,
                        'pa/summary': { 'cost': 1 } as Endpoint<Dict>,
                        'pa/transactions': { 'cost': 1 } as Endpoint<Dict>,
                        'ws': { 'cost': 1 } as Endpoint<Dict>,
                        'tickle': { 'cost': 1 } as Endpoint<Dict>, // validates the session
                        'logout': { 'cost': 1 } as Endpoint<Dict>,
                        'trsrv/secdef': { 'cost': 1 } as Endpoint<Dict>, // requires conids
                    },
                    'put': {
                        'fyi/disclaimer/{typecode}': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/deliveryoptions/email': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/notifications/{notificationId}': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'delete': {
                        'fyi/deliveryoptions/{deviceId}': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/{accountId}/alert/{alertId}': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/{accountId}/order/{orderId}': { 'cost': 1 } as Endpoint<Dict>, // cancel order
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
            'requiredCredentials': {
                // authentication is handled by the locally running client portal gateway
                'apiKey': false,
                'secret': false,
            },
            'options': {
                'accountId': undefined, // default account used by private methods, filled by fetchAccounts
                'accounts': [],
                'fetchPortfolioAccounts': {
                    'method': 'privateGetPortfolioAccounts', // or 'privateGetPortfolioSubaccounts'
                },
            },
            'features': {
                'default': {
                    'sandbox': false,
                },
                'spot': {
                    'extends': 'default',
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'exceptions': {
                'exact': {
                    '401': AuthenticationError,
                    '429': RateLimitExceeded,
                },
                'broad': {
                    'Conid(s) missing': ArgumentsRequired, // {"error":"Bad Request: Conid(s) missing","statusCode":400}
                    'not authenticated': AuthenticationError,
                    'Invalid symbol': BadSymbol,
                    'Order not found': OrderNotFound,
                    'Bad Request': BadRequest,
                },
            },
            'commonCurrencies': {},
        });
    }

    /**
     * @method
     * @name interactivebrokers#isConnected
     * @description checks whether the client portal gateway session is authenticated
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#tickle
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true if the brokerage session is authenticated
     */
    async isConnected (params: Dict = {}): Promise<boolean> {
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
        const iserver = this.safeDict (response, 'iserver', {});
        const authStatus = this.safeDict (iserver, 'authStatus', {});
        const authenticated = this.safeBool (authStatus, 'authenticated', false);
        const connected = this.safeBool (authStatus, 'connected', false);
        return authenticated && connected;
    }

    /**
     * @method
     * @name interactivebrokers#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#accounts
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#portfolio-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'privateGetPortfolioAccounts' (default) or 'privateGetPortfolioSubaccounts'
     * @returns {object[]} a list of [account structures]{@link https://docs.ccxt.com/?id=account-structure}
     */
    override async fetchAccounts (params: Dict = {}): Promise<Account[]> {
        // as required by IBKR, iserver/accounts must be called at least once before any other trading endpoint
        const serviceAccounts = await this.fetchServiceAccounts ();
        const portfolioAccounts = await this.fetchPortfolioAccounts (params);
        const accounts = this.parseAccounts (portfolioAccounts);
        const accountIds: string[] = [];
        for (let i = 0; i < accounts.length; i++) {
            const accountId = this.safeString (accounts[i], 'id');
            if (accountId !== undefined) {
                accountIds.push (accountId);
            }
        }
        this.options['accounts'] = accountIds;
        if (this.safeString (this.options, 'accountId') === undefined) {
            let selectedAccount = this.safeString (serviceAccounts, 'selectedAccount');
            if (selectedAccount === undefined) {
                selectedAccount = this.safeString (accountIds, 0);
            }
            this.options['accountId'] = selectedAccount;
        }
        return accounts;
    }

    override parseAccount (account: Dict): Account {
        //
        //     {
        //         "id": "U3449298",
        //         "accountId": "U3449298",
        //         "accountVan": "U3449298",
        //         "accountTitle": "John Doe",
        //         "displayName": "John Doe",
        //         "accountAlias": null,
        //         "accountStatus": "1646607600000",
        //         "currency": "USD",
        //         "type": "INDIVIDUAL",
        //         "tradingType": "STKNOPT",
        //         ...
        //     }
        //
        const currencyId = this.safeString (account, 'currency');
        return {
            'id': this.safeString2 (account, 'accountId', 'id'),
            'type': this.safeStringLower (account, 'type'),
            'code': this.safeCurrencyCode (currencyId),
            'info': account,
        };
    }

    /**
     * @method
     * @name interactivebrokers#fetchServiceAccounts
     * @description fetch the accounts the user has trading access to, must be called before modifying an order or querying open orders
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#accounts
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw response from the exchange
     */
    async fetchServiceAccounts (params: Dict = {}): Promise<Dict> {
        const response = await this.privateGetIserverAccounts (params);
        //
        //     {
        //         "accounts": [ "U3449298" ],
        //         "acctProps": {
        //             "U3449298": {
        //                 "hasChildAccounts": false,
        //                 "supportsCashQty": true,
        //                 "supportsFractions": false
        //             }
        //         },
        //         "aliases": { "U3449298": "U3449298" },
        //         "chartPeriods": { "STK": [ "*" ], "OPT": [ "2h", "1d", "2d", "1w", "1m" ], ... },
        //         "selectedAccount": "U3449298",
        //         "allowFeatures": { ... },
        //         "serverInfo": {
        //             "serverName": "JaeZ01197",
        //             "serverVersion": "Build 10.14.0l, Mar 1, 2022 5:28:08 PM"
        //         },
        //         "sessionId": "613de523.0000000b"
        //     }
        //
        return response;
    }

    /**
     * @method
     * @name interactivebrokers#fetchPortfolioAccounts
     * @description fetch the accounts for which the user can view position and account information
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#portfolio-accounts
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#portfolio-subaccounts
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'privateGetPortfolioAccounts' (default) or 'privateGetPortfolioSubaccounts'
     * @returns {object[]} the raw response from the exchange
     */
    async fetchPortfolioAccounts (params: Dict = {}): Promise<Dict[]> {
        const [ method, query ] = this.handleOptionAndParams (params, 'fetchPortfolioAccounts', 'method', 'privateGetPortfolioAccounts');
        let response = undefined;
        if (method === 'privateGetPortfolioSubaccounts') {
            response = await this.privateGetPortfolioSubaccounts (query);
        } else {
            response = await this.privateGetPortfolioAccounts (query);
        }
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

    /**
     * @method
     * @name interactivebrokers#switchToAccount
     * @description switch the active account (for users with multiple accounts)
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#switch-account
     * @ignore
     * @param {string} accountId the account id to switch to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw response from the exchange
     */
    async switchToAccount (accountId: string, params: Dict = {}): Promise<Dict> {
        if (accountId === undefined) {
            throw new ArgumentsRequired (this.id + ' switchToAccount() requires an accountId argument');
        }
        const request: Dict = {
            'acctId': accountId,
        };
        const response = await this.privatePostIserverAccount (this.extend (request, params));
        //
        //     {
        //         "set": true,
        //         "acctId": "U3449298"
        //     }
        //
        // if the account is already selected, the gateway responds with http 501 instead
        //
        this.options['accountId'] = accountId;
        return response;
    }

    /**
     * @method
     * @name interactivebrokers#loadAccountId
     * @description returns the account id from params, options, or the first account returned by fetchAccounts
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id to use
     * @returns {Array} the account id and the params without accountId
     */
    async loadAccountId (params: Dict = {}): Promise<any[]> {
        const [ accountIdFromParams, query ] = this.handleOptionAndParams (params, 'loadAccountId', 'accountId');
        let accountId: Str = accountIdFromParams;
        if (accountId === undefined) {
            await this.fetchAccounts ();
            accountId = this.safeString (this.options, 'accountId');
        }
        if (accountId === undefined) {
            throw new ArgumentsRequired (this.id + ' requires an accountId in params["accountId"] or options["accountId"], fetchAccounts() returned no accounts');
        }
        return [ accountId, query ];
    }

    /**
     * @method
     * @name interactivebrokers#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#portfolio-ledger
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"] or the selected account
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        const [ accountId, query ] = await this.loadAccountId (params);
        const request: Dict = {
            'accountId': accountId,
        };
        const response = await this.privateGetPortfolioAccountIdLedger (this.extend (request, query));
        //
        //     {
        //         "USD": {
        //             "commoditymarketvalue": 0.0,
        //             "futuremarketvalue": 0.0,
        //             "settledcash": 214716688.0,
        //             "exchangerate": 1,
        //             "sessionid": 1,
        //             "cashbalance": 214716688.0,
        //             "corporatebondsmarketvalue": 0.0,
        //             "netliquidationvalue": 215335840.0,
        //             "interest": 305569.94,
        //             "unrealizedpnl": 39695.82,
        //             "stockmarketvalue": 314123.88,
        //             "currency": "USD",
        //             "realizedpnl": 0.0,
        //             "acctcode": "U1234567",
        //             "key": "LedgerList",
        //             "timestamp": 1702582321,
        //             "secondkey": "USD",
        //             ...
        //         },
        //         "BASE": { ... }
        //     }
        //
        return this.parseBalance (response);
    }

    override parseBalance (response: any): Balances {
        const result: Dict = {
            'info': response,
        };
        const currencyIds = Object.keys (response);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            if (currencyId === 'BASE') {
                continue; // aggregated entry in the account base currency
            }
            const balance = this.safeDict (response, currencyId, {});
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'cashbalance');
            result[code as string] = account;
        }
        const timestamp = this.safeTimestamp (this.safeDict (response, 'BASE', {}), 'timestamp');
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.safeBalance (result);
    }

    override sign (path: string, api = 'public', method = 'GET', params: Dict = {}, headers: NullableDict = undefined, body: Str = undefined): Dict {
        let url = this.urls['api'][api] + this.version + '/api/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let requestBody: Str = body;
        let requestHeaders: NullableDict = headers;
        if ((method === 'GET') || (method === 'DELETE')) {
            if (Object.keys (query).length > 0) {
                url += '?' + this.urlencode (query);
            }
        } else {
            requestBody = this.json (query);
            requestHeaders = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': requestBody, 'headers': requestHeaders };
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     {
        //         "error": "Bad Request: Conid(s) missing",
        //         "statusCode": 400
        //     }
        //
        const errorMessage = this.safeString (response, 'error');
        if (errorMessage !== undefined) {
            const feedback = this.id + ' ' + body;
            const statusCode = this.safeString (response, 'statusCode');
            this.throwExactlyMatchedException (this.exceptions['exact'], statusCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
