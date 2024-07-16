
// ----------------------------------------------------------------------------

import Exchange from './abstract/coinbaseinternational.js';
import { ExchangeError, ArgumentsRequired, BadRequest, InvalidOrder, PermissionDenied, DuplicateOrderId, AuthenticationError } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Int, OrderSide, OrderType, Order, Trade, Ticker, Str, Transaction, Balances, Tickers, Strings, Market, Currency, TransferEntry, Position, FundingRateHistory, Currencies, Dict, int } from './base/types.js';

// ----------------------------------------------------------------------------

/**
 * @class coinbaseinternational
 * @augments Exchange
 */
export default class coinbaseinternational extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinbaseinternational',
            'name': 'Coinbase International',
            'countries': [ 'US' ],
            'certified': true,
            'pro': true,
            'rateLimit': 100, // 10 requests per second
            'version': 'v1',
            'userAgent': this.userAgents['chrome'],
            'headers': {
                'CB-VERSION': '2018-05-30',
            },
            'has': {
                'CORS': true,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': true,
                'createLimitBuyOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrder': true,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyBuys': true,
                'fetchMySells': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchPosition': true,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMargin': true,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://github.com/ccxt/ccxt/assets/43336371/866ae638-6ab5-4ebf-ab2c-cdcce9545625',
                'api': {
                    'rest': 'https://api.international.coinbase.com/api',
                },
                'test': {
                    'rest': 'https://api-n5e1.coinbase.com/api',
                },
                'www': 'https://international.coinbase.com',
                'doc': [
                    'https://docs.cloud.coinbase.com/intx/docs',
                ],
                'fees': [
                    'https://help.coinbase.com/en/international-exchange/trading-deposits-withdrawals/international-exchange-fees',
                ],
                'referral': '',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'api': {
                'v1': {
                    'public': {
                        'get': [
                            'assets',
                            'assets/{assets}',
                            'assets/{asset}/networks',
                            'instruments',
                            'instruments/{instrument}',
                            'instruments/{instrument}/quote',
                            'instruments/{instrument}/funding',
                            '',
                        ],
                    },
                    'private': {
                        'get': [
                            'orders',
                            'orders/{id}',
                            'portfolios',
                            'portfolios/{portfolio}',
                            'portfolios/{portfolio}/detail',
                            'portfolios/{portfolio}/summary',
                            'portfolios/{portfolio}/balances',
                            'portfolios/{portfolio}/balances/{asset}',
                            'portfolios/{portfolio}/positions',
                            'portfolios/{portfolio}/positions/{instrument}',
                            'portfolios/fills',
                            'portfolios/{portfolio}/fills',
                            'transfers',
                            'transfers/{transfer_uuid}',
                        ],
                        'post': [
                            'orders',
                            'portfolios',
                            'portfolios/margin',
                            'portfolios/transfer',
                            'transfers/withdraw',
                            'transfers/address',
                            'transfers/create-counterparty-id',
                            'transfers/validate-counterparty-id',
                            'transfers/withdraw/counterparty',
                        ],
                        'put': [
                            'orders/{id}',
                            'portfolios/{portfolio}',
                        ],
                        'delete': [
                            'orders',
                            'orders/{id}',
                        ],
                    },
                },
            },
            'fees': {
                'trading': {
                    'taker': this.parseNumber ('0.004'),
                    'maker': this.parseNumber ('0.002'),
                    'tierBased': true,
                    'percentage': true,
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.004') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.004') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0035') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0035') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.003') ],
                            [ this.parseNumber ('250000000'), this.parseNumber ('0.0025') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0016') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('250000000'), this.parseNumber ('0') ],
                        ],
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {},
                'broad': {
                    'DUPLICATE_CLIENT_ORDER_ID': DuplicateOrderId,
                    'Order rejected': InvalidOrder,
                    'market orders must be IoC': InvalidOrder,
                    'tif is required': InvalidOrder,
                    'Invalid replace order request': InvalidOrder,
                    'Unauthorized': PermissionDenied,
                    'invalid result_limit': BadRequest,
                    'is a required field': BadRequest,
                    'Not Found': BadRequest,
                    'ip not allowed': AuthenticationError,
                },
            },
            'timeframes': {
                '1m': 'ONE_MINUTE',
                '5m': 'FIVE_MINUTE',
                '15m': 'FIFTEEN_MINUTE',
                '30m': 'THIRTY_MINUTE',
                '1h': 'ONE_HOUR',
                '2h': 'TWO_HOUR',
                '6h': 'SIX_HOUR',
                '1d': 'ONE_DAY',
            },
            'options': {
                'brokerId': 'nfqkvdjp',
                'portfolio': '', // default portfolio id
                'withdraw': {
                    'method': 'v1PrivatePostTransfersWithdraw', // use v1PrivatePostTransfersWithdrawCounterparty for counterparty withdrawals
                },
                'networksById': {
                    'ethereum': 'ETH',
                    'arbitrum': 'ARBITRUM',
                    'avacchain': 'AVAX',
                    'optimism': 'OPTIMISM',
                    'polygon': 'MATIC',
                    'solana': 'SOL',
                    'bitcoin': 'BTC',
                },
            },
        });
    }

    async handlePortfolioAndParams (methodName: string, params = {}) {
        let portfolio = undefined;
        [ portfolio, params ] = this.handleOptionAndParams (params, methodName, 'portfolio');
        if ((portfolio !== undefined) && (portfolio !== '')) {
            return [ portfolio, params ];
        }
        const defaultPortfolio = this.safeString (this.options, 'portfolio');
        if ((defaultPortfolio !== undefined) && (defaultPortfolio !== '')) {
            return [ defaultPortfolio, params ];
        }
        const accounts = await this.fetchAccounts ();
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            const info = this.safeDict (account, 'info', {});
            if (this.safeBool (info, 'is_default')) {
                const portfolioId = this.safeString (info, 'portfolio_id');
                this.options['portfolio'] = portfolioId;
                return [ portfolioId, params ];
            }
        }
        throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a portfolio parameter or set the default portfolio with this.options["portfolio"]');
    }

    async handleNetworkIdAndParams (currencyCode: string, methodName: string, params) {
        let networkId = undefined;
        [ networkId, params ] = this.handleOptionAndParams (params, methodName, 'network_arn_id');
        if (networkId === undefined) {
            await this.loadCurrencyNetworks (currencyCode);
            const networks = this.currencies[currencyCode]['networks'];
            const network = this.safeString2 (params, 'networkCode', 'network');
            if (network === undefined) {
                // find default network
                if (this.isEmpty (networks)) {
                    throw new BadRequest (this.id + ' createDepositAddress network not found for currency ' + currencyCode + ' please specify networkId in params');
                }
                const defaultNetwork = this.findDefaultNetwork (networks);
                networkId = defaultNetwork['id'];
            } else {
                networkId = this.networkCodeToId (network, currencyCode);
            }
        }
        return [ networkId, params ];
    }

    async fetchAccounts (params = {}) {
        /**
         * @method
         * @name coinbaseinternational#fetchAccounts
         * @description fetch all the accounts associated with a profile
         * @see https://docs.cloud.coinbase.com/intx/reference/getportfolios
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
         */
        await this.loadMarkets ();
        const response = await this.v1PrivateGetPortfolios (params);
        //
        //    [
        //        {
        //           "portfolio_id":"1ap32qsc-1-0",
        //           "portfolio_uuid":"028d7f6c-b92c-7361-8b7e-2932711e5a22",
        //           "name":"CCXT Portfolio 030624-17:16",
        //           "user_uuid":"e6cf46b6-a32f-5fa7-addb-3324d4526fbd",
        //           "maker_fee_rate":"0",
        //           "taker_fee_rate":"0.0002",
        //           "trading_lock":false,
        //           "borrow_disabled":false,
        //           "is_lsp":false,
        //           "is_default":true,
        //           "cross_collateral_enabled":false
        //        }
        //    ]
        //
        return this.parseAccounts (response, params);
    }

    parseAccount (account) {
        //
        //    {
        //       "portfolio_id":"1ap32qsc-1-0",
        //       "portfolio_uuid":"028d7f6c-b92c-7361-8b7e-2932711e5a22",
        //       "name":"CCXT Portfolio 030624-17:16",
        //       "user_uuid":"e6cf46b6-a32f-5fa7-addb-3324d4526fbd",
        //       "maker_fee_rate":"0",
        //       "taker_fee_rate":"0.0002",
        //       "trading_lock":false,
        //       "borrow_disabled":false,
        //       "is_lsp":false,
        //       "is_default":true,
        //       "cross_collateral_enabled":false
        //    }
        //
        return {
            'id': this.safeString2 (account, 'portfolio_id', 'portfolio_uuid'),
            'type': undefined,
            'code': undefined,
            'info': account,
        };
    }

    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coinbaseinternational#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @see https://docs.cloud.coinbase.com/intx/reference/getinstrumentfunding
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate');
        let maxEntriesPerRequest = undefined;
        [ maxEntriesPerRequest, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'maxEntriesPerRequest', 100);
        const pageKey = 'ccxtPageKey';
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchFundingRateHistory', symbol, since, limit, params, pageKey, maxEntriesPerRequest) as FundingRateHistory[];
        }
        const market = this.market (symbol);
        const page = this.safeInteger (params, pageKey, 1) - 1;
        const request: Dict = {
            'instrument': market['id'],
            'result_offset': this.safeInteger2 (params, 'offset', 'result_offset', page * maxEntriesPerRequest),
        };
        if (limit !== undefined) {
            request['result_limit'] = limit;
        }
        const response = await this.v1PublicGetInstrumentsInstrumentFunding (this.extend (request, params));
        //
        //    {
        //        "pagination":{
        //           "result_limit":"25",
        //           "result_offset":"0"
        //        },
        //        "results":[
        //           {
        //              "instrument_id":"149264167780483072",
        //              "funding_rate":"0.000011",
        //              "mark_price":"47388.1",
        //              "event_time":"2024-02-10T16:00:00Z"
        //           },
        //           ...
        //        ]
        //    }
        //
        const rawRates = this.safeList (response, 'results', []);
        return this.parseFundingRateHistories (rawRates, market, since, limit);
    }

    parseFundingRateHistory (info, market: Market = undefined) {
        return this.parseFundingRate (info, market) as FundingRateHistory;
    }

    parseFundingRate (contract, market: Market = undefined) {
        //
        //    {
        //       "instrument_id":"149264167780483072",
        //       "funding_rate":"0.000011",
        //       "mark_price":"47388.1",
        //       "event_time":"2024-02-10T16:00:00Z"
        //    }
        //
        const fundingDatetime = this.safeString2 (contract, 'event_time', 'time');
        return {
            'info': contract,
            'symbol': this.safeSymbol (undefined, market),
            'markPrice': this.safeNumber (contract, 'mark_price'),
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': this.parse8601 (fundingDatetime),
            'datetime': fundingDatetime,
            'fundingRate': this.safeNumber (contract, 'funding_rate'),
            'fundingTimestamp': this.parse8601 (fundingDatetime),
            'fundingDatetime': fundingDatetime,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async createDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name coinbaseinternational#createDepositAddress
         * @description create a currency deposit address
         * @see https://docs.cloud.coinbase.com/intx/reference/createaddress
         * @see https://docs.cloud.coinbase.com/intx/reference/createcounterpartyid
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.network_arn_id] Identifies the blockchain network (e.g., networks/ethereum-mainnet/assets/313ef8a9-ae5a-5f2f-8a56-572c0e2a4d5a) if not provided will pick default
         * @param {string} [params.network] unified network code to identify the blockchain network
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        let method = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'createDepositAddress', 'method', 'v1PrivatePostTransfersAddress');
        let portfolio = undefined;
        [ portfolio, params ] = await this.handlePortfolioAndParams ('createDepositAddress', params);
        const request: Dict = {
            'portfolio': portfolio,
        };
        if (method === 'v1PrivatePostTransfersAddress') {
            const currency = this.currency (code);
            request['asset'] = currency['id'];
            let networkId = undefined;
            [ networkId, params ] = await this.handleNetworkIdAndParams (code, 'createDepositAddress', params);
            request['network_arn_id'] = networkId;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // v1PrivatePostTransfersAddress
        //    {
        //        address: "3LkwYscRyh6tUR1XTqXSJQoJnK7ucC1F4n",
        //        network_arn_id: "networks/bitcoin-mainnet/assets/6ecc0dcc-10a2-500e-b315-a3b9abae19ce",
        //        destination_tag: "",
        //    }
        // v1PrivatePostTransfersCreateCounterpartyId
        //    {
        //        "portfolio_uuid":"018e0a8b-6b6b-70e0-9689-1e7926c2c8bc",
        //        "counterparty_id":"CB2ZPUCZBE"
        //    }
        //
        const tag = this.safeString (response, 'destination_tag');
        const address = this.safeString2 (response, 'address', 'counterparty_id');
        return {
            'currency': code,
            'tag': tag,
            'address': address,
            'info': response,
        };
    }

    findDefaultNetwork (networks) {
        const networksArray = this.toArray (networks);
        for (let i = 0; i < networksArray.length; i++) {
            const info = networksArray[i]['info'];
            const is_default = this.safeBool (info, 'is_default', false);
            if (is_default === true) {
                return networksArray[i];
            }
        }
        return networksArray[0];
    }

    async loadCurrencyNetworks (code, params = {}) {
        const currency = this.currency (code);
        const networks = this.safeDict (currency, 'networks');
        if (networks !== undefined) {
            return;
        }
        const request: Dict = {
            'asset': currency['id'],
        };
        const rawNetworks = await this.v1PublicGetAssetsAssetNetworks (request);
        //
        //    [
        //        {
        //            "asset_id":"1",
        //            "asset_uuid":"2b92315d-eab7-5bef-84fa-089a131333f5",
        //            "asset_name":"USDC",
        //            "network_arn_id":"networks/ethereum-mainnet/assets/9bc140b4-69c3-5fc9-bd0d-b041bcf40039",
        //            "min_withdrawal_amt":"1",
        //            "max_withdrawal_amt":"100000000",
        //            "network_confirms":35,
        //            "processing_time":485,
        //            "is_default":true,
        //            "network_name":"ethereum",
        //            "display_name":"Ethereum"
        //        },
        //        ....
        //    ]
        //
        currency['networks'] = this.parseNetworks (rawNetworks);
    }

    parseNetworks (networks, params = {}) {
        const result: Dict = {};
        for (let i = 0; i < networks.length; i++) {
            const network = this.extend (this.parseNetwork (networks[i]), params);
            result[network['network']] = network;
        }
        return result;
    }

    parseNetwork (network, params = {}) {
        //
        //    {
        //        "asset_id":"1",
        //        "asset_uuid":"2b92315d-eab7-5bef-84fa-089a131333f5",
        //        "asset_name":"USDC",
        //        "network_arn_id":"networks/ethereum-mainnet/assets/9bc140b4-69c3-5fc9-bd0d-b041bcf40039",
        //        "min_withdrawal_amt":"1",
        //        "max_withdrawal_amt":"100000000",
        //        "network_confirms":35,
        //        "processing_time":485,
        //        "is_default":true,
        //        "network_name":"ethereum",
        //        "display_name":"Ethereum"
        //    }
        //
        const currencyId = this.safeString (network, 'asset_name');
        const currencyCode = this.safeCurrencyCode (currencyId);
        const networkId = this.safeString (network, 'network_arn_id');
        return this.safeNetwork ({
            'info': network,
            'id': networkId,
            'name': this.safeString (network, 'display_name'),
            'network': this.networkIdToCode (this.safeStringN (network, [ 'network_name', 'display_name', 'network_arn_id' ], ''), currencyCode),
            'active': undefined,
            'deposit': undefined,
            'withdraw': undefined,
            'precision': undefined,
            'fee': undefined,
            'limits': {
                'withdraw': {
                    'min': this.safeNumber (network, 'min_withdrawal_amt'),
                    'max': this.safeNumber (network, 'max_withdrawal_amt'),
                },
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
            },
        });
    }

    async setMargin (symbol: string, amount: number, params = {}): Promise<any> {
        /**
         * @method
         * @name coinbaseinternational#setMargin
         * @description Either adds or reduces margin in order to set the margin to a specific value
         * @see https://docs.cloud.coinbase.com/intx/reference/setportfoliomarginoverride
         * @param {string} symbol unified market symbol of the market to set margin in
         * @param {float} amount the amount to set the margin to
         * @param {object} [params] parameters specific to the exchange API endpoint
         * @returns {object} A [margin structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#add-margin-structure}
         */
        let portfolio = undefined;
        [ portfolio, params ] = await this.handlePortfolioAndParams ('setMargin', params);
        if (symbol !== undefined) {
            throw new BadRequest (this.id + ' setMargin() only allows setting margin to full portfolio');
        }
        const request: Dict = {
            'portfolio': portfolio,
            'margin_override': amount,
        };
        return await this.v1PrivatePostPortfoliosMargin (this.extend (request, params));
    }

    async fetchDepositsWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name exchange#fetchDepositsWithdrawals
         * @description fetch history of deposits and withdrawals
         * @see https://docs.cloud.coinbase.com/intx/reference/gettransfers
         * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
         * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
         * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.portfolios] Identifies the portfolios by UUID (e.g., 892e8c7c-e979-4cad-b61b-55a197932cf1) or portfolio ID (e.g., 5189861793641175). Can provide single or multiple portfolios to filter by or fetches transfers for all portfolios if none are provided.
         * @param {int} [params.until] Only find transfers updated before this time. Use timestamp format
         * @param {string} [params.status] The current status of transfer. Possible values: [PROCESSED, NEW, FAILED, STARTED]
         * @param {string} [params.type] The type of transfer Possible values: [DEPOSIT, WITHDRAW, REBATE, STIPEND, INTERNAL, FUNDING]
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let paginate = undefined;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchDepositsWithdrawals', 'paginate');
        let maxEntriesPerRequest = undefined;
        [ maxEntriesPerRequest, params ] = this.handleOptionAndParams (params, 'fetchDepositsWithdrawals', 'maxEntriesPerRequest', 100);
        const pageKey = 'ccxtPageKey';
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchDepositsWithdrawals', code, since, limit, params, pageKey, maxEntriesPerRequest) as Transaction[];
        }
        const page = this.safeInteger (params, pageKey, 1) - 1;
        const request: Dict = {
            'result_offset': this.safeInteger2 (params, 'offset', 'result_offset', page * maxEntriesPerRequest),
        };
        if (since !== undefined) {
            request['time_from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            const newLimit = Math.min (limit, 100);
            request['result_limit'] = newLimit;
        }
        let portfolios = undefined;
        [ portfolios, params ] = this.handleOptionAndParams (params, 'fetchDepositsWithdrawals', 'portfolios');
        if (portfolios !== undefined) {
            request['portfolios'] = portfolios;
        }
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchDepositsWithdrawals', 'until');
        if (until !== undefined) {
            request['time_to'] = this.iso8601 (until);
        }
        const response = await this.v1PrivateGetTransfers (this.extend (request, params));
        //
        //    {
        //        "pagination":{
        //           "result_limit":25,
        //           "result_offset":0
        //        },
        //        "results":[
        //           {
        //              "transfer_uuid":"8e471d77-4208-45a8-9e5b-f3bd8a2c1fc3",
        //              "transfer_type":"WITHDRAW",
        //              "amount":"1.000000",
        //              "asset":"USDC",
        //              "status":"PROCESSED",
        //              "network_name":"ethereum",
        //              "created_at":"2024-03-14T02:32:18.497795Z",
        //              "updated_at":"2024-03-14T02:35:38.514588Z",
        //              "from_portfolio":{
        //                 "id":"1yun54bb-1-6",
        //                 "uuid":"018e0a8b-6b6b-70e0-9689-1e7926c2c8bc",
        //                 "name":"fungus technology o?Portfolio"
        //              },
        //              "to_address":"0xcdcE79F820BE9d6C5033db5c31d1AE3A8c2399bB"
        //           }
        //        ]
        //    }
        //
        const rawTransactions = this.safeList (response, 'results', []);
        return this.parseTransactions (rawTransactions);
    }

    async fetchPosition (symbol: string, params = {}) {
        /**
         * @method
         * @name coinbaseinternational#fetchPosition
         * @see https://docs.cloud.coinbase.com/intx/reference/getportfolioposition
         * @description fetch data on an open position
         * @param {string} symbol unified market symbol of the market the position is held in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        let portfolio = undefined;
        [ portfolio, params ] = await this.handlePortfolioAndParams ('fetchPosition', params);
        const request: Dict = {
            'portfolio': portfolio,
            'instrument': this.marketId (symbol),
        };
        const position = await this.v1PrivateGetPortfoliosPortfolioPositionsInstrument (this.extend (request, params));
        //
        //    {
        //        "symbol":"BTC-PERP",
        //        "instrument_id":"114jqr89-0-0",
        //        "instrument_uuid":"b3469e0b-222c-4f8a-9f68-1f9e44d7e5e0",
        //        "vwap":"52482.3",
        //        "net_size":"0",
        //        "buy_order_size":"0.001",
        //        "sell_order_size":"0",
        //        "im_contribution":"0.2",
        //        "unrealized_pnl":"0",
        //        "mark_price":"52406.8",
        //        "entry_vwap":"52472.9"
        //    }
        //
        return this.parsePosition (position);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        //    {
        //       "symbol":"BTC-PERP",
        //       "instrument_id":"114jqr89-0-0",
        //       "instrument_uuid":"b3469e0b-222c-4f8a-9f68-1f9e44d7e5e0",
        //       "vwap":"52482.3",
        //       "net_size":"0",
        //       "buy_order_size":"0.001",
        //       "sell_order_size":"0",
        //       "im_contribution":"0.2",
        //       "unrealized_pnl":"0",
        //       "mark_price":"52406.8",
        //       "entry_vwap":"52472.9"
        //    }
        //
        const marketId = this.safeString (position, 'symbol');
        let quantity = this.safeString (position, 'net_size');
        market = this.safeMarket (marketId, market, '-');
        let side = 'long';
        if (Precise.stringLe (quantity, '0')) {
            side = 'short';
            quantity = Precise.stringMul ('-1', quantity);
        }
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'id'),
            'symbol': market['symbol'],
            'entryPrice': undefined,
            'markPrice': this.safeNumber (position, 'mark_price'),
            'notional': undefined,
            'collateral': undefined,
            'unrealizedPnl': this.safeNumber (position, 'unrealized_pnl'),
            'side': side,
            'contracts': this.parseNumber (quantity),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'timestamp': undefined,
            'datetime': undefined,
            'hedged': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': this.safeNumber (position, 'im_contribution'),
            'initialMarginPercentage': undefined,
            'leverage': undefined,
            'liquidationPrice': undefined,
            'marginRatio': undefined,
            'marginMode': undefined,
            'percentage': undefined,
        });
    }

    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        /**
         * @method
         * @name coinbaseinternational#fetchPositions
         * @see https://docs.cloud.coinbase.com/intx/reference/getportfoliopositions
         * @description fetch all open positions
         * @param {string[]} [symbols] list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [method] method name to call, "positionRisk", "account" or "option", default is "positionRisk"
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        let portfolio = undefined;
        [ portfolio, params ] = await this.handlePortfolioAndParams ('fetchPositions', params);
        const request: Dict = {
            'portfolio': portfolio,
        };
        const response = await this.v1PrivateGetPortfoliosPortfolioPositions (this.extend (request, params));
        //
        //    [
        //        {
        //           "symbol":"BTC-PERP",
        //           "instrument_id":"114jqr89-0-0",
        //           "instrument_uuid":"b3469e0b-222c-4f8a-9f68-1f9e44d7e5e0",
        //           "vwap":"52482.3",
        //           "net_size":"0",
        //           "buy_order_size":"0.001",
        //           "sell_order_size":"0",
        //           "im_contribution":"0.2",
        //           "unrealized_pnl":"0",
        //           "mark_price":"52406.8",
        //           "entry_vwap":"52472.9"
        //        }
        //    ]
        //
        const positions = this.parsePositions (response);
        if (this.isEmpty (symbols)) {
            return positions;
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArrayPositions (positions, 'symbol', symbols, false);
    }

    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name coinbaseinternational#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://docs.cloud.coinbase.com/intx/reference/gettransfers
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.portfolios] Identifies the portfolios by UUID (e.g., 892e8c7c-e979-4cad-b61b-55a197932cf1) or portfolio ID (e.g., 5189861793641175). Can provide single or multiple portfolios to filter by or fetches transfers for all portfolios if none are provided.
         * @param {int} [params.until] Only find transfers updated before this time. Use timestamp format
         * @param {string} [params.status] The current status of transfer. Possible values: [PROCESSED, NEW, FAILED, STARTED]
         * @param {string} [params.type] The type of transfer Possible values: [DEPOSIT, WITHDRAW, REBATE, STIPEND, INTERNAL, FUNDING]
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        params['type'] = 'WITHDRAW';
        return await this.fetchDepositsWithdrawals (code, since, limit, params);
    }

    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name coinbaseinternational#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.portfolios] Identifies the portfolios by UUID (e.g., 892e8c7c-e979-4cad-b61b-55a197932cf1) or portfolio ID (e.g., 5189861793641175). Can provide single or multiple portfolios to filter by or fetches transfers for all portfolios if none are provided.
         * @param {int} [params.until] Only find transfers updated before this time. Use timestamp format
         * @param {string} [params.status] The current status of transfer. Possible values: [PROCESSED, NEW, FAILED, STARTED]
         * @param {string} [params.type] The type of transfer Possible values: [DEPOSIT, WITHDRAW, REBATE, STIPEND, INTERNAL, FUNDING]
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        params['type'] = 'DEPOSIT';
        return await this.fetchDepositsWithdrawals (code, since, limit, params);
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            'PROCESSED': 'ok',
            'NEW': 'pending',
            'STARTED': 'pending',
            'FAILED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        //    {
        //        "idem":"8e471d77-4208-45a8-9e5b-f3bd8a2c1fc3"
        //    }
        // const transactionType = this.safeString (transaction, 'type');
        const datetime = this.safeString (transaction, 'updated_at');
        const fromPorfolio = this.safeDict (transaction, 'from_portfolio', {});
        const addressFrom = this.safeStringN (transaction, [ 'from_address', 'from_cb_account', this.safeStringN (fromPorfolio, [ 'id', 'uuid', 'name' ]), 'from_counterparty_id' ]);
        const toPorfolio = this.safeDict (transaction, 'from_portfolio', {});
        const addressTo = this.safeStringN (transaction, [ 'to_address', 'to_cb_account', this.safeStringN (toPorfolio, [ 'id', 'uuid', 'name' ]), 'to_counterparty_id' ]);
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'transfer_uuid'),
            'txid': this.safeString (transaction, 'transaction_uuid'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'network': this.networkIdToCode (this.safeString (transaction, 'network_name')),
            'address': undefined, // TODO check if withdraw or deposit and populate
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': this.safeString (transaction, 'resource'),
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': this.safeCurrencyCode (this.safeString (transaction, 'asset'), currency),
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'updated': this.parse8601 (datetime),
            'fee': {
                'cost': undefined,
                'currency': undefined,
            },
        } as Transaction;
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //    {
        //       "portfolio_id":"1wp37qsc-1-0",
        //       "portfolio_uuid":"018d7f6c-b92c-7361-8b7e-2932711e5a22",
        //       "portfolio_name":"CCXT Portfolio 020624-17:16",
        //       "fill_id":"1xbfy19y-1-184",
        //       "exec_id":"280841526207070392",
        //       "order_id":"1xbfv8yw-1-0",
        //       "instrument_id":"114jqr89-0-0",
        //       "instrument_uuid":"b3469e0b-222c-4f8a-9f68-1f9e44d7e5e0",
        //       "symbol":"BTC-PERP",
        //       "match_id":"280841526207053840",
        //       "fill_price":"52500",
        //       "fill_qty":"0.01",
        //       "client_id":"1x59ctku-1-1",
        //       "client_order_id":"ccxt3e4e2a5f-4a89-",
        //       "order_qty":"0.01",
        //       "limit_price":"52500",
        //       "total_filled":"0.01",
        //       "filled_vwap":"52500",
        //       "expire_time":"",
        //       "stop_price":"",
        //       "side":"BUY",
        //       "tif":"GTC",
        //       "stp_mode":"BOTH",
        //       "flags":"",
        //       "fee":"0.105",
        //       "fee_asset":"USDC",
        //       "order_status":"DONE",
        //       "event_time":"2024-02-15T00:43:57.631Z"
        //    }
        //
        const marketId = this.safeString (trade, 'symbol');
        const datetime = this.safeString (trade, 'event_time');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString2 (trade, 'fill_id', 'exec_id'),
            'order': this.safeString (trade, 'order_id'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': this.safeSymbol (marketId, market),
            'type': undefined,
            'side': this.safeStringLower (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeNumber (trade, 'fill_price'),
            'amount': this.safeNumber (trade, 'fill_qty'),
            'cost': undefined,
            'fee': {
                'cost': this.safeNumber (trade, 'fee'),
                'currency': this.safeCurrencyCode (this.safeString (trade, 'fee_asset')),
            },
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name coinbaseinternational#fetchMarkets
         * @see https://docs.cloud.coinbase.com/intx/reference/getinstruments
         * @description retrieves data on all markets for coinbaseinternational
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.v1PublicGetInstruments (params);
        //
        //    [
        //        {
        //           "instrument_id":"149264164756389888",
        //           "instrument_uuid":"e9360798-6a10-45d6-af05-67c30eb91e2d",
        //           "symbol":"ETH-PERP",
        //           "type":"PERP",
        //           "base_asset_id":"118059611793145856",
        //           "base_asset_uuid":"d85dce9b-5b73-5c3c-8978-522ce1d1c1b4",
        //           "base_asset_name":"ETH",
        //           "quote_asset_id":"1",
        //           "quote_asset_uuid":"2b92315d-eab7-5bef-84fa-089a131333f5",
        //           "quote_asset_name":"USDC",
        //           "base_increment":"0.0001",
        //           "quote_increment":"0.01",
        //           "price_band_percent":"0.02",
        //           "market_order_percent":"0.0075",
        //           "qty_24hr":"44434.8131",
        //           "notional_24hr":"110943454.279785",
        //           "avg_daily_qty":"1099171.6025",
        //           "avg_daily_notional":"2637240145.456987",
        //           "previous_day_qty":"78909.3939",
        //           "open_interest":"1270.749",
        //           "position_limit_qty":"1831.9527",
        //           "position_limit_adq_pct":"0.05",
        //           "replacement_cost":"0.23",
        //           "base_imf":"0.1",
        //           "min_notional_value":"10",
        //           "funding_interval":"3600000000000",
        //           "trading_state":"TRADING",
        //           "quote":{
        //              "best_bid_price":"2490.8",
        //              "best_bid_size":"9.0515",
        //              "best_ask_price":"2490.81",
        //              "best_ask_size":"4.8486",
        //              "trade_price":"2490.39",
        //              "trade_qty":"0.9508",
        //              "index_price":"2490.5",
        //              "mark_price":"2490.8",
        //              "settlement_price":"2490.81",
        //              "limit_up":"2615.42",
        //              "limit_down":"2366.34",
        //              "predicted_funding":"0.000009",
        //              "timestamp":"2024-02-10T16:07:39.454Z"
        //           }
        //        },
        //        ...
        //    ]
        //
        return this.parseMarkets (response);
    }

    parseMarket (market: Dict): Market {
        //
        //   {
        //       "instrument_id":"149264164756389888",
        //       "instrument_uuid":"e9360798-6a10-45d6-af05-67c30eb91e2d",
        //       "symbol":"ETH-PERP",
        //       "type":"PERP",
        //       "base_asset_id":"118059611793145856",
        //       "base_asset_uuid":"d85dce9b-5b73-5c3c-8978-522ce1d1c1b4",
        //       "base_asset_name":"ETH",
        //       "quote_asset_id":"1",
        //       "quote_asset_uuid":"2b92315d-eab7-5bef-84fa-089a131333f5",
        //       "quote_asset_name":"USDC",
        //       "base_increment":"0.0001",
        //       "quote_increment":"0.01",
        //       "price_band_percent":"0.02",
        //       "market_order_percent":"0.0075",
        //       "qty_24hr":"44434.8131",
        //       "notional_24hr":"110943454.279785",
        //       "avg_daily_qty":"1099171.6025",
        //       "avg_daily_notional":"2637240145.456987",
        //       "previous_day_qty":"78909.3939",
        //       "open_interest":"1270.749",
        //       "position_limit_qty":"1831.9527",
        //       "position_limit_adq_pct":"0.05",
        //       "replacement_cost":"0.23",
        //       "base_imf":"0.1",
        //       "min_notional_value":"10",
        //       "funding_interval":"3600000000000",
        //       "trading_state":"TRADING",
        //       "quote":{
        //          "best_bid_price":"2490.8",
        //          "best_bid_size":"9.0515",
        //          "best_ask_price":"2490.81",
        //          "best_ask_size":"4.8486",
        //          "trade_price":"2490.39",
        //          "trade_qty":"0.9508",
        //          "index_price":"2490.5",
        //          "mark_price":"2490.8",
        //          "settlement_price":"2490.81",
        //          "limit_up":"2615.42",
        //          "limit_down":"2366.34",
        //          "predicted_funding":"0.000009",
        //          "timestamp":"2024-02-10T16:07:39.454Z"
        //       }
        //    }
        //
        const marketId = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'base_asset_name');
        const quoteId = this.safeString (market, 'quote_asset_name');
        const typeId = this.safeString (market, 'type'); // 'SPOT', 'PERP'
        const isSpot = (typeId === 'SPOT');
        const fees = this.fees;
        let symbol = baseId + '/' + quoteId;
        let settleId = undefined;
        if (!isSpot) {
            settleId = quoteId;
            symbol += ':' + quoteId;
        }
        return {
            'id': marketId,
            'lowercaseId': marketId.toLowerCase (),
            'symbol': symbol,
            'base': baseId,
            'quote': quoteId,
            'settle': settleId ? settleId : undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId ? settleId : undefined,
            'type': isSpot ? 'spot' : 'swap',
            'spot': isSpot,
            'margin': false,
            'swap': !isSpot,
            'future': false,
            'option': false,
            'active': this.safeString (market, 'trading_state') === 'TRADING',
            'contract': !isSpot,
            'linear': isSpot ? undefined : (settleId === quoteId),
            'inverse': isSpot ? undefined : (settleId !== quoteId),
            'taker': fees['trading']['taker'],
            'maker': fees['trading']['maker'],
            'contractSize': isSpot ? undefined : 1,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (market, 'base_increment'),
                'price': this.safeNumber (market, 'quote_increment'),
                'cost': this.safeNumber (market, 'quote_increment'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': this.safeNumber (market, 'base_imf'),
                },
                'amount': {
                    'min': undefined,
                    'max': isSpot ? undefined : this.safeNumber (market, 'position_limit_qty'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (market, 'min_notional_value'),
                    'max': undefined,
                },
            },
            'info': market,
            'created': undefined,
        };
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name coinbaseinternational#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://docs.cloud.coinbase.com/intx/reference/getassets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const currencies = await this.v1PublicGetAssets (params);
        //
        //    [
        //        {
        //           "asset_id":"1",
        //           "asset_uuid":"2b92315d-eab7-5bef-84fa-089a131333f5",
        //           "asset_name":"USDC",
        //           "status":"ACTIVE",
        //           "collateral_weight":1.0,
        //           "supported_networks_enabled":true
        //        },
        //        ...
        //    ]
        //
        const result: Dict = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = this.parseCurrency (currencies[i]);
            result[currency['code']] = currency;
        }
        return result;
    }

    parseCurrency (currency: Dict) {
        //
        //    {
        //       "asset_id":"1",
        //       "asset_uuid":"2b92315d-eab7-5bef-84fa-089a131333f5",
        //       "asset_name":"USDC",
        //       "status":"ACTIVE",
        //       "collateral_weight":1.0,
        //       "supported_networks_enabled":true
        //    }
        //
        const id = this.safeString (currency, 'asset_name');
        const code = this.safeCurrencyCode (id);
        const statusId = this.safeString (currency, 'status');
        return {
            'id': id,
            'name': code,
            'code': code,
            'precision': undefined,
            'info': currency,
            'active': (statusId === 'ACTIVE'),
            'deposit': undefined,
            'withdraw': undefined,
            'networks': undefined,
            'fee': undefined,
            'fees': undefined,
            'limits': this.limits,
        };
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name coinbaseinternational#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://docs.cloud.coinbase.com/intx/reference/getinstruments
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const instruments = await this.v1PublicGetInstruments (params);
        const tickers: Dict = {};
        for (let i = 0; i < instruments.length; i++) {
            const instrument = instruments[i];
            const marketId = this.safeString (instrument, 'symbol');
            const symbol = this.safeSymbol (marketId);
            const quote = this.safeDict (instrument, 'quote', {});
            tickers[symbol] = this.parseTicker (quote, this.safeMarket (marketId));
        }
        return this.filterByArray (tickers, 'symbol', symbols, true);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name coinbaseinternational#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.cloud.coinbase.com/intx/reference/getinstrumentquote
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instrument': this.marketId (symbol),
        };
        const ticker = await this.v1PublicGetInstrumentsInstrumentQuote (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker: object, market: Market = undefined): Ticker {
        //
        //    {
        //        "best_bid_price":"2490.8",
        //        "best_bid_size":"9.0515",
        //        "best_ask_price":"2490.81",
        //        "best_ask_size":"4.8486",
        //        "trade_price":"2490.39",
        //        "trade_qty":"0.9508",
        //        "index_price":"2490.5",
        //        "mark_price":"2490.8",
        //        "settlement_price":"2490.81",
        //        "limit_up":"2615.42",
        //        "limit_down":"2366.34",
        //        "predicted_funding":"0.000009",
        //        "timestamp":"2024-02-10T16:07:39.454Z"
        //    }
        //
        const datetime = this.safeString (ticker, 'timestamp');
        return this.safeTicker ({
            'info': ticker,
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'bid': this.safeNumber (ticker, 'best_bid_price'),
            'bidVolume': this.safeNumber (ticker, 'best_bid_size'),
            'ask': this.safeNumber (ticker, 'best_ask_price'),
            'askVolume': this.safeNumber (ticker, 'best_ask_size'),
            'high': undefined,
            'low': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'vwap': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'previousClose': undefined,
        });
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name coinbaseinternational#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.cloud.coinbase.com/intx/reference/getportfoliobalances
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.v3] default false, set true to use v3 api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        let portfolio = undefined;
        [ portfolio, params ] = await this.handlePortfolioAndParams ('fetchBalance', params);
        const request: Dict = {
            'portfolio': portfolio,
        };
        const balances = await this.v1PrivateGetPortfoliosPortfolioBalances (this.extend (request, params));
        //
        //    [
        //        {
        //           "asset_id":"0-0-1",
        //           "asset_name":"USDC",
        //           "asset_uuid":"2b92315d-eab7-5bef-84fa-089a131333f5",
        //           "quantity":"500000.0000000000",
        //           "hold":"0",
        //           "hold_available_for_collateral":"0",
        //           "transfer_hold":"0",
        //           "collateral_value":"500000.0",
        //           "max_withdraw_amount":"500000.0000000000",
        //           "loan":"0",
        //           "loan_collateral_requirement":"0.0"
        //        }
        //    ]
        //
        return this.parseBalance (balances);
    }

    parseBalance (response): Balances {
        //
        //    {
        //       "asset_id":"0-0-1",
        //       "asset_name":"USDC",
        //       "asset_uuid":"2b92315d-eab7-5bef-84fa-089a131333f5",
        //       "quantity":"500000.0000000000",
        //       "hold":"0",
        //       "hold_available_for_collateral":"0",
        //       "transfer_hold":"0",
        //       "collateral_value":"500000.0",
        //       "max_withdraw_amount":"500000.0000000000",
        //       "loan":"0",
        //       "loan_collateral_requirement":"0.0"
        //    }
        //
        const result: Dict = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const rawBalance = response[i];
            const currencyId = this.safeString (rawBalance, 'asset_name');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (rawBalance, 'quantity');
            account['used'] = this.safeString (rawBalance, 'hold');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async transfer (code: string, amount: number, fromAccount: string, toAccount: string, params = {}): Promise<TransferEntry> {
        /**
         * @method
         * @name coinbaseinternational#transfer
         * @description Transfer an amount of asset from one portfolio to another.
         * @see https://docs.cloud.coinbase.com/intx/reference/createportfolioassettransfer
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transfer structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'asset': currency['id'],
            'ammount': amount,
            'from': fromAccount,
            'to': toAccount,
        };
        const response = await this.v1PrivatePostPortfoliosTransfer (this.extend (request, params));
        const success = this.safeBool (response, 'success');
        return {
            'info': response,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': code,
            'amount': amount,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': success ? 'ok' : 'failed',
        };
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: number = undefined, params = {}) {
        /**
         * @method
         * @name coinbaseinternational#createOrder
         * @description create a trade order
         * @see https://docs.cloud.coinbase.com/intx/reference/createorder
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency, quote currency for 'market' 'buy' orders
         * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.stopPrice] price to trigger stop orders
         * @param {float} [params.triggerPrice] price to trigger stop orders
         * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
         * @param {bool} [params.postOnly] true or false
         * @param {string} [params.tif] 'GTC', 'IOC', 'GTD' default is 'GTC' for limit orders and 'IOC' for market orders
         * @param {string} [params.expire_time] The expiration time required for orders with the time in force set to GTT. Must not go beyond 30 days of the current time. Uses ISO-8601 format (e.g., 2023-03-16T23:59:53Z)
         * @param {string} [params.stp_mode] Possible values: [NONE, AGGRESSING, BOTH] Specifies the behavior for self match handling. None disables the functionality, new cancels the newest order, and both cancels both orders.
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let typeId = type.toUpperCase ();
        const stopPrice = this.safeNumberN (params, [ 'triggerPrice', 'stopPrice', 'stop_price' ]);
        const clientOrderIdprefix = this.safeString (this.options, 'brokerId', 'nfqkvdjp');
        let clientOrderId = clientOrderIdprefix + '-' + this.uuid ();
        clientOrderId = clientOrderId.slice (0, 17);
        const request: Dict = {
            'client_order_id': clientOrderId,
            'side': side.toUpperCase (),
            'instrument': market['id'],
            'size': this.amountToPrecision (market['symbol'], amount),
        };
        if (stopPrice !== undefined) {
            if (type === 'limit') {
                typeId = 'STOP_LIMIT';
            } else {
                typeId = 'STOP';
            }
            request['stop_price'] = stopPrice;
        }
        request['type'] = typeId;
        if (type === 'limit') {
            if (price === undefined) {
                throw new InvalidOrder (this.id + 'createOrder() requires a price parameter for a limit order types');
            }
            request['price'] = price;
        }
        let portfolio = undefined;
        [ portfolio, params ] = await this.handlePortfolioAndParams ('createOrder', params);
        if (portfolio !== undefined) {
            request['portfolio'] = portfolio;
        }
        const postOnly = this.safeBool2 (params, 'postOnly', 'post_only');
        let tif = this.safeString2 (params, 'tif', 'timeInForce');
        // market orders must be IOC
        if (typeId === 'MARKET') {
            if (tif !== undefined && tif !== 'IOC') {
                throw new InvalidOrder (this.id + 'createOrder() market orders must have tif set to "IOC"');
            }
            tif = 'IOC';
        } else {
            tif = (tif === undefined) ? 'GTC' : tif;
        }
        if (postOnly !== undefined) {
            request['post_only'] = postOnly;
        }
        request['tif'] = tif;
        params = this.omit (params, [ 'client_order_id', 'user', 'postOnly', 'timeInForce' ]);
        const response = await this.v1PrivatePostOrders (this.extend (request, params));
        //
        //    {
        //        "order_id":"1x96skvg-1-0",
        //        "client_order_id":"ccxt",
        //        "side":"BUY",
        //        "instrument_id":"114jqr89-0-0",
        //        "instrument_uuid":"b3469e0b-222c-4f8a-9f68-1f9e44d7e5e0",
        //        "symbol":"BTC-PERP",
        //        "portfolio_id":"1wp37qsc-1-0",
        //        "portfolio_uuid":"018d7f6c-b92c-7361-8b7e-2932711e5a22",
        //        "type":"LIMIT",
        //        "price":"10000",
        //        "size":"0.001",
        //        "tif":"GTC",
        //        "stp_mode":"BOTH",
        //        "event_type":"NEW",
        //        "order_status":"WORKING",
        //        "leaves_qty":"0.001",
        //        "exec_qty":"0",
        //        "avg_price":"0",
        //        "fee":"0"
        //    }
        //
        return this.parseOrder (response, market);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //    {
        //        "order_id":"1x96skvg-1-0",
        //        "client_order_id":"ccxt",
        //        "side":"BUY",
        //        "instrument_id":"114jqr89-0-0",
        //        "instrument_uuid":"b3469e0b-222c-4f8a-9f68-1f9e44d7e5e0",
        //        "symbol":"BTC-PERP",
        //        "portfolio_id":"1wp37qsc-1-0",
        //        "portfolio_uuid":"018d7f6c-b92c-7361-8b7e-2932711e5a22",
        //        "type":"LIMIT",
        //        "price":"10000",
        //        "size":"0.001",
        //        "tif":"GTC",
        //        "stp_mode":"BOTH",
        //        "event_type":"NEW",
        //        "order_status":"WORKING",
        //        "leaves_qty":"0.001",
        //        "exec_qty":"0",
        //        "avg_price":"0",
        //        "fee":"0"
        //    }
        //
        const marketId = this.safeString (order, 'symbol');
        const feeCost = this.safeNumber (order, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
            };
        }
        const datetime = this.safeString2 (order, 'submit_time', 'event_time');
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'order_id'),
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'lastTradeTimestamp': undefined,
            'symbol': this.safeSymbol (marketId, market),
            'type': this.parseOrderType (this.safeString (order, 'type')),
            'timeInForce': this.safeString (order, 'tif'),
            'postOnly': undefined,
            'side': this.safeStringLower (order, 'side'),
            'price': this.safeString (order, 'price'),
            'stopPrice': this.safeString (order, 'stop_price'),
            'triggerPrice': this.safeString (order, 'stop_price'),
            'amount': this.safeString (order, 'size'),
            'filled': this.safeString (order, 'exec_qty'),
            'remaining': this.safeString (order, 'leaves_qty'),
            'cost': undefined,
            'average': this.safeString (order, 'avg_price'),
            'status': this.parseOrderStatus (this.safeString (order, 'order_status')),
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'NEW': 'open',
            'PARTIAL_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'REPLACED': 'canceled',
            'PENDING_CANCEL': 'open',
            'REJECTED': 'rejected',
            'PENDING_NEW': 'open',
            'EXPIRED': 'expired',
            'PENDING_REPLACE': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type: Str) {
        if (type === 'UNKNOWN_ORDER_TYPE') {
            return undefined;
        }
        const types: Dict = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'STOP': 'limit',
            'STOP_LIMIT': 'limit',
        };
        return this.safeString (types, type, type);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coinbaseinternational#cancelOrder
         * @description cancels an open order
         * @see https://docs.cloud.coinbase.com/intx/reference/cancelorder
         * @param {string} id order id
         * @param {string} symbol not used by coinbaseinternational cancelOrder()
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let portfolio = undefined;
        [ portfolio, params ] = await this.handlePortfolioAndParams ('cancelOrder', params);
        const request: Dict = {
            'portfolio': portfolio,
            'id': id,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const orders = await this.v1PrivateDeleteOrdersId (this.extend (request, params));
        //
        //    {
        //        "order_id":"1x96skvg-1-0",
        //        "client_order_id":"ccxt",
        //        "side":"BUY",
        //        "instrument_id":"114jqr89-0-0",
        //        "instrument_uuid":"b3469e0b-222c-4f8a-9f68-1f9e44d7e5e0",
        //        "symbol":"BTC-PERP",
        //        "portfolio_id":"1wp37qsc-1-0",
        //        "portfolio_uuid":"018d7f6c-b92c-7361-8b7e-2932711e5a22",
        //        "type":"LIMIT",
        //        "price":"10000",
        //        "size":"0.001",
        //        "tif":"GTC",
        //        "stp_mode":"BOTH",
        //        "event_type":"CANCELED",
        //        "order_status":"DONE",
        //        "leaves_qty":"0.001",
        //        "exec_qty":"0",
        //        "avg_price":"0",
        //        "fee":"0"
        //    }
        //
        return this.parseOrder (orders, market);
    }

    async cancelAllOrders (symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name coinbaseinternational#cancelAllOrders
         * @description cancel all open orders
         * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let portfolio = undefined;
        [ portfolio, params ] = await this.handlePortfolioAndParams ('cancelAllOrders', params);
        const request: Dict = {
            'portfolio': portfolio,
        };
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['instrument'] = market['id'];
        }
        const orders = await this.v1PrivateDeleteOrders (this.extend (request, params));
        return this.parseOrders (orders, market);
    }

    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: number = undefined, price: number = undefined, params = {}) {
        /**
         * @method
         * @name coinbaseinternational#editOrder
         * @description edit a trade order
         * @see https://docs.cloud.coinbase.com/intx/reference/modifyorder
         * @param {string} id cancel order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the base currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} params.clientOrderId client order id
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'id': id,
        };
        let portfolio = undefined;
        [ portfolio, params ] = await this.handlePortfolioAndParams ('editOrder', params);
        if (portfolio !== undefined) {
            request['portfolio'] = portfolio;
        }
        if (amount !== undefined) {
            request['size'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const stopPrice = this.safeNumberN (params, [ 'stopPrice', 'stop_price', 'triggerPrice' ]);
        if (stopPrice !== undefined) {
            request['stop_price'] = stopPrice;
        }
        const clientOrderId = this.safeString2 (params, 'client_order_id', 'clientOrderId');
        if (clientOrderId === undefined) {
            throw new BadRequest (this.id + ' editOrder() requires a clientOrderId parameter');
        }
        request['client_order_id'] = clientOrderId;
        const order = await this.v1PrivatePutOrdersId (this.extend (request, params));
        return this.parseOrder (order, market);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coinbaseinternational#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://docs.cloud.coinbase.com/intx/reference/modifyorder
         * @param {string} id the order id
         * @param {string} symbol unified market symbol that the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let portfolio = undefined;
        [ portfolio, params ] = await this.handlePortfolioAndParams ('fetchOrder', params);
        const request: Dict = {
            'id': id,
            'portfolio': portfolio,
        };
        const order = await this.v1PrivateGetOrdersId (this.extend (request, params));
        //
        //    {
        //        "order_id":"1x96skvg-1-0",
        //        "client_order_id":"ccxt",
        //        "side":"BUY",
        //        "instrument_id":"114jqr89-0-0",
        //        "instrument_uuid":"b3469e0b-222c-4f8a-9f68-1f9e44d7e5e0",
        //        "symbol":"BTC-PERP",
        //        "portfolio_id":"1wp37qsc-1-0",
        //        "portfolio_uuid":"018d7f6c-b92c-7361-8b7e-2932711e5a22",
        //        "type":"LIMIT",
        //        "price":"10000",
        //        "size":"0.001",
        //        "tif":"GTC",
        //        "stp_mode":"BOTH",
        //        "event_type":"NEW",
        //        "event_time":"2024-02-14T03:25:14Z",
        //        "submit_time":"2024-02-14T03:25:13.999Z",
        //        "order_status":"WORKING",
        //        "leaves_qty":"0.001",
        //        "exec_qty":"0",
        //        "avg_price":"0",
        //        "fee":"0"
        //    }
        //
        return this.parseOrder (order, market);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name coinbaseinternational#fetchOpenOrders
         * @description fetches information on all currently open orders
         * @see https://docs.cloud.coinbase.com/intx/reference/getorders
         * @param {string} symbol unified market symbol of the orders
         * @param {int} [since] timestamp in ms of the earliest order, default is undefined
         * @param {int} [limit] the maximum number of open order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @param {int} [params.offset] offset
         * @param {string} [params.event_type] The most recent type of event that happened to the order. Allowed values: NEW, TRADE, REPLACED
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let portfolio = undefined;
        [ portfolio, params ] = await this.handlePortfolioAndParams ('fetchOpenOrders', params);
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'paginate');
        let maxEntriesPerRequest = undefined;
        [ maxEntriesPerRequest, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'maxEntriesPerRequest', 100);
        const pageKey = 'ccxtPageKey';
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchOpenOrders', symbol, since, limit, params, pageKey, maxEntriesPerRequest) as Order[];
        }
        const page = this.safeInteger (params, pageKey, 1) - 1;
        const request: Dict = {
            'portfolio': portfolio,
            'result_offset': this.safeInteger2 (params, 'offset', 'result_offset', page * maxEntriesPerRequest),
        };
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['instrument'] = symbol;
        }
        if (limit !== undefined) {
            if (limit > 100) {
                throw new BadRequest (this.id + ' fetchOpenOrders() maximum limit is 100');
            }
            request['result_limit'] = limit;
        }
        if (since !== undefined) {
            request['ref_datetime'] = this.iso8601 (since);
        }
        const response = await this.v1PrivateGetOrders (this.extend (request, params));
        //
        //    {
        //        "pagination":{
        //           "result_limit":25,
        //           "result_offset":0
        //        },
        //        "results":[
        //           {
        //              "order_id":"1y4cm6b4-1-0",
        //              "client_order_id":"ccxtd0dd4b5d-8e5f-",
        //              "side":"SELL",
        //              "instrument_id":"114jqr89-0-0",
        //              "instrument_uuid":"b3469e0b-222c-4f8a-9f68-1f9e44d7e5e0",
        //              "symbol":"BTC-PERP",
        //              "portfolio_id":"1wp37qsc-1-0",
        //              "portfolio_uuid":"018d7f6c-b92c-7361-8b7e-2932711e5a22",
        //              "type":"LIMIT",
        //              "price":"54000",
        //              "size":"0.01",
        //              "tif":"GTC",
        //              "stp_mode":"BOTH",
        //              "event_type":"NEW",
        //              "event_time":"2024-02-24T16:46:37.413Z",
        //              "submit_time":"2024-02-24T16:46:37.412Z",
        //              "order_status":"WORKING",
        //              "leaves_qty":"0.01",
        //              "exec_qty":"0",
        //              "avg_price":"0",
        //              "fee":"0"
        //           },
        //           ...
        //        ]
        //    }
        //
        const rawOrders = this.safeList (response, 'results', []);
        return this.parseOrders (rawOrders, market, since, limit);
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coinbaseinternational#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://docs.cloud.coinbase.com/intx/reference/getmultiportfoliofills
         * @param {string} symbol unified market symbol of the trades
         * @param {int} [since] timestamp in ms of the earliest order, default is undefined
         * @param {int} [limit] the maximum number of trade structures to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch trades for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate');
        const pageKey = 'ccxtPageKey';
        let maxEntriesPerRequest = undefined;
        [ maxEntriesPerRequest, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'maxEntriesPerRequest', 100);
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchMyTrades', symbol, since, limit, params, pageKey, maxEntriesPerRequest) as Trade[];
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const page = this.safeInteger (params, pageKey, 1) - 1;
        const request: Dict = {
            'result_offset': this.safeInteger2 (params, 'offset', 'result_offset', page * maxEntriesPerRequest),
        };
        if (limit !== undefined) {
            if (limit > 100) {
                throw new BadRequest (this.id + ' fetchMyTrades() maximum limit is 100. Consider setting paginate to true to fetch more trades.');
            }
            request['result_limit'] = limit;
        }
        if (since !== undefined) {
            request['time_from'] = this.iso8601 (since);
        }
        const until = this.safeStringN (params, [ 'until' ]);
        if (until !== undefined) {
            params = this.omit (params, [ 'until' ]);
            request['ref_datetime'] = this.iso8601 (until);
        }
        const response = await this.v1PrivateGetPortfoliosFills (this.extend (request, params));
        //
        //    {
        //        "pagination":{
        //           "result_limit":25,
        //           "result_offset":0
        //        },
        //        "results":[
        //           {
        //              "portfolio_id":"1wp37qsc-1-0",
        //              "portfolio_uuid":"018d7f6c-b92c-7361-8b7e-2932711e5a22",
        //              "portfolio_name":"CCXT Portfolio 020624-17:16",
        //              "fill_id":"1xbfy19y-1-184",
        //              "exec_id":"280841526207070392",
        //              "order_id":"1xbfv8yw-1-0",
        //              "instrument_id":"114jqr89-0-0",
        //              "instrument_uuid":"b3469e0b-222c-4f8a-9f68-1f9e44d7e5e0",
        //              "symbol":"BTC-PERP",
        //              "match_id":"280841526207053840",
        //              "fill_price":"52500",
        //              "fill_qty":"0.01",
        //              "client_id":"1x59ctku-1-1",
        //              "client_order_id":"ccxt3e4e2a5f-4a89-",
        //              "order_qty":"0.01",
        //              "limit_price":"52500",
        //              "total_filled":"0.01",
        //              "filled_vwap":"52500",
        //              "expire_time":"",
        //              "stop_price":"",
        //              "side":"BUY",
        //              "tif":"GTC",
        //              "stp_mode":"BOTH",
        //              "flags":"",
        //              "fee":"0.105",
        //              "fee_asset":"USDC",
        //              "order_status":"DONE",
        //              "event_time":"2024-02-15T00:43:57.631Z"
        //           },
        //        ]
        //    }
        //
        const trades = this.safeList (response, 'results', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}) {
        /**
         * @method
         * @name coinbaseinternational#withdraw
         * @description make a withdrawal
         * @see https://docs.cloud.coinbase.com/intx/reference/withdraw
         * @see https://docs.cloud.coinbase.com/intx/reference/counterpartywithdraw
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} [tag] an optional tag for the withdrawal
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.add_network_fee_to_total] if true, deducts network fee from the portfolio, otherwise deduct fee from the withdrawal
         * @param {string} [params.network_arn_id] Identifies the blockchain network (e.g., networks/ethereum-mainnet/assets/313ef8a9-ae5a-5f2f-8a56-572c0e2a4d5a)
         * @param {string} [params.nonce] a unique integer representing the withdrawal request
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        let portfolio = undefined;
        [ portfolio, params ] = await this.handlePortfolioAndParams ('withdraw', params);
        let method = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'withdraw', 'method', 'v1PrivatePostTransfersWithdraw');
        let networkId = undefined;
        [ networkId, params ] = await this.handleNetworkIdAndParams (code, 'withdraw', params);
        const request: Dict = {
            'portfolio': portfolio,
            'type': 'send',
            'asset': currency['id'],
            'address': address,
            'amount': amount,
            'currency': currency['id'],
            'network_arn_id': networkId,
            'nonce': this.nonce (),
        };
        const response = await this[method] (this.extend (request, params));
        //
        //    {
        //        "idem":"8e471d77-4208-45a8-9e5b-f3bd8a2c1fc3"
        //    }
        //
        return this.parseTransaction (response, currency);
    }

    safeNetwork (network) {  // TODO: Move to exchange.ts
        let withdrawEnabled = this.safeBool (network, 'withdraw');
        let depositEnabled = this.safeBool (network, 'deposit');
        const limits = this.safeDict (network, 'limits');
        const withdraw = this.safeDict (limits, 'withdraw');
        const withdrawMax = this.safeNumber (withdraw, 'max');
        const deposit = this.safeDict (limits, 'deposit');
        const depositMax = this.safeNumber (deposit, 'max');
        if (withdrawEnabled === undefined && withdrawMax !== undefined) {
            withdrawEnabled = (withdrawMax > 0);
        }
        if (depositEnabled === undefined && depositMax !== undefined) {
            depositEnabled = (depositMax > 0);
        }
        const networkId = this.safeString (network, 'id');
        const isEnabled = (withdrawEnabled && depositEnabled);
        return {
            'info': network['info'],
            'id': networkId,
            'name': this.safeString (network, 'name'),
            'network': this.safeString (network, 'network'),
            'active': this.safeBool (network, 'active', isEnabled),
            'deposit': depositEnabled,
            'withdraw': withdrawEnabled,
            'fee': this.safeNumber (network, 'fee'),
            'precision': this.safeNumber (network, 'precision'),
            'limits': {
                'withdraw': {
                    'min': this.safeNumber (withdraw, 'min'),
                    'max': withdrawMax,
                },
                'deposit': {
                    'min': this.safeNumber (deposit, 'min'),
                    'max': depositMax,
                },
            },
        };
    }

    sign (path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = api[0];
        const signed = api[1] === 'private';
        let fullPath = '/' + version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const savedPath = '/api' + fullPath;
        if (method === 'GET' || method === 'DELETE') {
            if (Object.keys (query).length) {
                fullPath += '?' + this.urlencodeWithArrayRepeat (query);
            }
        }
        const url = this.urls['api']['rest'] + fullPath;
        if (signed) {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let payload = '';
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    payload = body;
                }
            }
            const auth = nonce + method + savedPath + payload;
            const signature = this.hmac (this.encode (auth), this.base64ToBinary (this.secret), sha256, 'base64');
            headers = {
                'CB-ACCESS-TIMESTAMP': nonce,
                'CB-ACCESS-SIGN': signature,
                'CB-ACCESS-PASSPHRASE': this.password,
                'CB-ACCESS-KEY': this.apiKey,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        //
        //    {
        //        "title":"io.javalin.http.BadRequestResponse: Order rejected (DUPLICATE_CLIENT_ORDER_ID - duplicate client order id detected)",
        //        "status":400
        //    }
        //
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        const feedback = this.id + ' ' + body;
        const errMsg = this.safeString (response, 'title');
        if (errMsg !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errMsg, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errMsg, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
