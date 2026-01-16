
//  ---------------------------------------------------------------------------

import Exchange from './abstract/grvt.js';
import { ExchangeError, ArgumentsRequired, InsufficientFunds, InvalidOrder, InvalidNonce, AuthenticationError, RateLimitExceeded, PermissionDenied, BadRequest, BadSymbol, OperationFailed, OperationRejected } from './base/errors.js';
import { Precise } from './base/Precise.js';
import type { Balances, Currencies, Currency, Dict, FundingRateHistory, FundingHistory, Int, Leverage, Leverages, MarginMode, MarginModes, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Trade, Transaction, TransferEntry, int } from './base/types.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';
import { TICK_SIZE } from './base/functions/number.js';

//  ---------------------------------------------------------------------------

/**
 * @class grvt
 * @augments Exchange
 */
export default class grvt extends Exchange {
    describe (): any {
        const rlOthers = 40;
        const rlOrders = 20;
        return this.deepExtend (super.describe (), {
            'id': 'grvt',
            'name': 'GRVT',
            'countries': [ 'SG' ], // Singapore
            'rateLimit': 10,
            'certified': false,
            'version': 'v1',
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRateHistory': true,
                'fetchLeverages': true,
                'fetchMarginModes': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'setLeverage': true,
                'signIn': true,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'CI_1_M',
                '3m': 'CI_3_M',
                '5m': 'CI_5_M',
                '15m': 'CI_15_M',
                '30m': 'CI_30_M',
                '1h': 'CI_1_H',
                '2h': 'CI_2_H',
                '4h': 'CI_4_H',
                '6h': 'CI_6_H',
                '8h': 'CI_8_H',
                '12h': 'CI_12_H',
                '1d': 'CI_1_D',
                '3d': 'CI_3_D',
                '5d': 'CI_5_D',
                '1w': 'CI_1_W',
                '2w': 'CI_2_W',
                '3w': 'CI_3_W',
                '4w': 'CI_4_W',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/67abe346-1273-461a-bd7c-42fa32907c8e',
                'api': {
                    'privateEdge': 'https://edge.grvt.io/',
                    'privateTrading': 'https://trades.grvt.io/',
                    'publicMarket': 'https://market-data.grvt.io/',
                },
                'www': 'https://grvt.io',
                'referral': '----------------------------------------------------',
                'doc': [
                    'https://api-docs.grvt.io/',
                ],
                'fees': '',
            },
            'api': {
                // RL : https://help.grvt.io/en/articles/9636566-what-are-the-rate-limitations-on-grvt
                'privateEdge': {
                    'post': {
                        'auth/api_key/login': 100,
                    },
                },
                'publicMarket': {
                    'post': {
                        'full/v1/instrument': 4,
                        'full/v1/all_instruments': 4,
                        'full/v1/instruments': 4,
                        'full/v1/currency': 12,
                        'full/v1/margin_rules': 12,
                        'full/v1/mini': 4,
                        'full/v1/ticker': 4,
                        'full/v1/book': 12,
                        'full/v1/trade': 12,
                        'full/v1/trade_history': 12,
                        'full/v1/kline': 12,
                        'full/v1/funding': 12,
                    },
                },
                'privateTrading': {
                    'post': {
                        'full/v1/create_order': 5,
                        'full/v1/cancel_order': 5,
                        'full/v1/cancel_on_disconnect': 100,
                        'full/v1/cancel_all_orders': 50,
                        'full/v1/order': rlOrders,
                        'full/v1/order_history': rlOrders,
                        'full/v1/open_orders': rlOrders,
                        'full/v1/fill_history': rlOrders,
                        'full/v1/positions': rlOrders,
                        'full/v1/funding_payment_history': rlOthers,
                        'full/v1/account_summary': rlOthers,
                        'full/v1/account_history': rlOthers,
                        'full/v1/aggregated_account_summary': rlOthers,
                        'full/v1/funding_account_summary': rlOthers,
                        'full/v1/transfer': 100,
                        'full/v1/deposit_history': 100,
                        'full/v1/transfer_history': 100,
                        'full/v1/withdrawal': 100,
                        'full/v1/withdrawal_history': 100,
                        'full/v1/add_position_margin': rlOthers, // addMargin
                        'full/v1/get_position_margin_limits': rlOthers,
                        'full/v1/set_position_config': rlOthers,  // setPositionMode/setMarginMode
                        'full/v1/set_initial_leverage': rlOthers,
                        'full/v1/get_all_initial_leverage': rlOthers,
                        'full/v1/set_derisk_mm_ratio': rlOthers,
                        'full/v1/vault_burn_tokens': rlOthers,
                        'full/v1/vault_invest': rlOthers,
                        'full/v1/vault_investor_summary': rlOthers,
                        'full/v1/vault_redeem': rlOthers,
                        'full/v1/vault_redeem_cancel': rlOthers,
                        'full/v1/vault_view_redemption_queue': rlOthers,
                        'full/v1/vault_manager_investor_history': rlOthers,
                        'full/v1/authorize_builder': rlOthers,
                        'full/v1/get_authorized_builders': rlOthers,
                        'full/v1/builder_fill_history': rlOthers,
                    },
                },
            },
            // exchange-specific options
            'options': {
                'subAccountId': undefined, // needs to be set manually by user
                // https://api.rhino.fi/bridge/configs
                'networks': {
                    'ARBONE': '42161',
                    'AVAXC': '43114',
                    'BASE': '8453',
                    'BSC': '56',
                    'ETH': '1',
                    'ERC20': '1',
                    'OP': '10',
                    'SOL': '900',
                    'TRX': '728126428',
                    'ZKSYNCERA': '324',
                },
                'networksById': {
                    '1': 'ERC20',
                },
                'builderFee': true,
                'builder': '0x21d2a053495994b1132a38cd1171acec40c6741e',
                'builderRate': 0.01,
            },
            'precisionMode': TICK_SIZE,
            'quoteJsonNumbers': false, // needed for some endpoints (todo: specify in implementations)
            'exceptions': {
                'exact': {
                    '1000': AuthenticationError, // "You need to authenticate prior to using this functionality"
                    '1001': PermissionDenied, // "You are not authorized to access this functionality"
                    '1002': OperationFailed, // "Internal Server Error"
                    '1003': BadRequest, // "Request could not be processed due to malformed syntax"
                    '1004': OperationRejected, // "Data Not Found"
                    '1005': OperationFailed, // "Unknown Error"
                    '1006': RateLimitExceeded, // "You have surpassed the allocated rate limit for your tier"
                    '1008': PermissionDenied, // "Your IP has not been whitelisted for access"
                    '1009': OperationRejected, // "We are temporarily deactivating this API endpoint, please try again later"
                    '1012': BadRequest, // "Invalid signature chain ID"
                    '1400': PermissionDenied, // "Signer does not have trade permission"
                    '2000': PermissionDenied, // "Signature is from an unauthorized signer"
                    '2001': InvalidNonce, // "Signature has expired"
                    '2002': BadRequest, // "Signature does not match payload"
                    '2003': PermissionDenied, // "Order sub account does not match logged in user"
                    '2004': InvalidNonce, // "Signature is from an expired session key"
                    '2005': BadRequest, // "Signature V must be 27/28"
                    '2006': BadRequest, // "Signature R/S must have exactly 64 characters long without 0x prefix"
                    '2007': BadRequest, // "Signature S must be in the lower half of the curve"
                    '2008': BadRequest, // "Signature exceeds maximum allowed duration."
                    '2010': InvalidOrder, // "Order ID should be empty when creating an order"
                    '2011': InvalidOrder, // "Client Order ID should be supplied when creating an order"
                    '2012': InvalidOrder, // "Client Order ID overlaps with existing active order"
                    '2020': InvalidOrder, // "Market Order must always be supplied without a limit price"
                    '2021': InvalidOrder, // "Limit Order must always be supplied with a limit price"
                    '2030': InvalidOrder, // "Orderbook Orders must have a TimeInForce of GTT/IOC/FOK"
                    '2031': InvalidOrder, // "RFQ Orders must have a TimeInForce of GTT/AON/IOC/FOK"
                    '2032': InvalidOrder, // "Post Only can only be set to true for GTT/AON orders"
                    '2040': InvalidOrder, // "Order must contain at least one leg"
                    '2041': InvalidOrder, // "Order Legs must be sorted by Derivative.Instrument/Underlying/BaseCurrency/Expiration/StrikePrice"
                    '2042': InvalidOrder, // "Orderbook Orders must contain only one leg"
                    '2050': InvalidOrder, // "Order state must be empty upon creation"
                    '2051': InvalidOrder, // "Order execution metadata must be empty upon creation"
                    '2060': BadSymbol, // "Order Legs contain one or more inactive derivative"
                    '2061': BadSymbol, // "Unsupported Instrument Requested"
                    '2062': InvalidOrder, // "Order size smaller than min size"
                    '2063': InvalidOrder, // "Order size smaller than min block size in block trade venue"
                    '2064': InvalidOrder, // "Invalid limit price tick"
                    '2065': InvalidOrder, // "Order size too granular"
                    '2070': InvalidOrder, // "Liquidation Order is not supported"
                    '2080': InsufficientFunds, // "Insufficient margin to create order"
                    '2081': OperationRejected, // "Order Fill would result in exceeding maximum position size"
                    '2082': InvalidOrder, // "Pre-order check failed"
                    '2083': OperationRejected, // "Order Fill would result in exceeding maximum position size under current configurable leverage tier"
                    '2090': RateLimitExceeded, // "Max open orders exceeded"
                    '2100': BadRequest, // "Invalid initial leverage"
                    '2101': BadRequest, // "Vaults cannot configure leverage"
                    '2102': OperationRejected, // "Margin type change failed, has open position for this instrument"
                    '2103': OperationRejected, // "Margin type change failed, has open orders for this instrument"
                    '2104': BadRequest, // "Margin type not supported"
                    '2105': BadRequest, // "Margin type change failed"
                    '2107': BadRequest, // "Attempted to set leverage below minimum"
                    '2108': BadRequest, // "Attempted to set leverage above maximum"
                    '2110': InvalidOrder, // "Invalid trigger by"
                    '2111': InvalidOrder, // "Unsupported trigger by"
                    '2112': InvalidOrder, // "Invalid trigger order"
                    '2113': InvalidOrder, // "Trigger price must be non-zero"
                    '2114': InvalidOrder, // "Invalid position linked TPSL orders, position linked TPSL must be a reduce-only order"
                    '2115': InvalidOrder, // "Invalid position linked TPSL orders, position linked TPSL must not have smaller size than the position"
                    '2116': InvalidOrder, // "Position linked TPSL order for this asset already exists"
                    '2117': InvalidOrder, // "Position linked TPSL orders must be created from web or mobile clients"
                    '2300': OperationRejected, // "Order cancel time-to-live settings currently disabled."
                    '2301': OperationRejected, // "Order cancel time-to-live exceeds maximum allowed value."
                    '2400': OperationRejected, // "Reduce only order with no position"
                    '2401': OperationRejected, // "Reduce only order must not increase position size"
                    '2402': OperationRejected, // "Reduce only order size exceeds maximum allowed value"
                    '3000': BadSymbol, // "Instrument is invalid"
                    '3004': OperationRejected, // "Instrument does not have a valid maintenance margin configuration"
                    '3005': OperationRejected, // "Instrument's underlying currency does not have a valid balance decimal configuration"
                    '3006': OperationRejected, // "Instrument's quote currency does not have a valid balance decimal configuration"
                    '3021': BadRequest, // "Either order ID or client order ID must be supplied"
                    '3031': BadRequest, // "Depth is invalid"
                    '4000': InsufficientFunds, // "Insufficient balance to complete transfer"
                    '4002': OperationFailed, // "Transfer failed with an unrefined failure reason, please report to GRVT"
                    '4010': OperationRejected, // "This wallet is not supported. Please try another wallet."
                    '5000': OperationRejected, // "Transfer Metadata does not match the expected structure."
                    '5001': OperationRejected, // "Transfer Provider does not match the expected provider."
                    '5002': OperationRejected, // "Direction of the transfer does not match the expected direction."
                    '5003': OperationRejected, // "Endpoint account ID is invalid."
                    '5004': OperationRejected, // "Funding account does not exist in our system."
                    '5005': OperationRejected, // "Invalid ChainID for the transfer request."
                    '6000': OperationRejected, // "Countdown time is bigger than 300s supported"
                    '6100': OperationRejected, // "Derisk MM Ratio is out of range"
                    '7000': OperationRejected, // "Vault ID provided is invalid and does not belong to any vault"
                    '7001': InsufficientFunds, // "Vault does not have sufficient LP token balance"
                    '7002': OperationFailed, // "User has an ongoing redemption"
                    '7003': OperationRejected, // "This vault has been delisted/closed."
                    '7004': OperationRejected, // "This investment would cause the vault to exceed its valuation cap."
                    '7005': InsufficientFunds, // "You are attempting to burn more vault tokens than you own."
                    '7006': OperationFailed, // "You are attempting to burn vault tokens whilst having an active redemption request."
                    '7007': PermissionDenied, // "The investor is not an LP for this vault."
                    '7100': OperationFailed, // "Unknown transaction type"
                    '7101': OperationRejected, // "Transfer account not found"
                    '7102': OperationRejected, // "Transfer sub-account not found"
                    '7103': OperationRejected, // "Charged trading fee below the config minimum"
                    '7450': OperationRejected, // "Add margin failed"
                    '7451': OperationRejected, // "Add margin to empty position"
                    '7452': OperationRejected, // "Add margin to non isolated position"
                    '7453': OperationRejected, // "Max addable amount exceeded"
                    '7454': OperationRejected, // "Max removable amount exceeded"
                    '7455': OperationRejected, // "Not isolated margin position"
                    '7500': OperationRejected, // "Builder Fee exceeds the allowed program limit."
                    '7501': BadRequest, // "Builder Fee can't be negative."
                    '7502': OperationRejected, // "Builder Account does not exist."
                    '7503': OperationRejected, // "Builder is already authorized for this account with the given fee."
                    '7504': OperationRejected, // "Builder is not authorized for the specified user.","status":400
                },
                'broad': {},
            },
        });
    }

    eipDefinitions () {
        return {
            'EIP712_ORDER_TYPE': {
                'Order': [
                    { 'name': 'subAccountID', 'type': 'uint64' },
                    { 'name': 'isMarket', 'type': 'bool' },
                    { 'name': 'timeInForce', 'type': 'uint8' },
                    { 'name': 'postOnly', 'type': 'bool' },
                    { 'name': 'reduceOnly', 'type': 'bool' },
                    { 'name': 'legs', 'type': 'OrderLeg[]' },
                    { 'name': 'nonce', 'type': 'uint32' },
                    { 'name': 'expiration', 'type': 'int64' },
                ],
                'OrderLeg': [
                    { 'name': 'assetID', 'type': 'uint256' },
                    { 'name': 'contractSize', 'type': 'uint64' },
                    { 'name': 'limitPrice', 'type': 'uint64' },
                    { 'name': 'isBuyingContract', 'type': 'bool' },
                ],
            },
            'EIP712_ORDER_WITH_BUILDER_TYPE': {
                'OrderWithBuilderFee': [
                    { 'name': 'subAccountID', 'type': 'uint64' },
                    { 'name': 'isMarket', 'type': 'bool' },
                    { 'name': 'timeInForce', 'type': 'uint8' },
                    { 'name': 'postOnly', 'type': 'bool' },
                    { 'name': 'reduceOnly', 'type': 'bool' },
                    { 'name': 'legs', 'type': 'OrderLeg[]' },
                    { 'name': 'builder', 'type': 'address' },
                    { 'name': 'builderFee', 'type': 'uint32' },
                    { 'name': 'nonce', 'type': 'uint32' },
                    { 'name': 'expiration', 'type': 'int64' },
                ],
                'OrderLeg': [
                    { 'name': 'assetID', 'type': 'uint256' },
                    { 'name': 'contractSize', 'type': 'uint64' },
                    { 'name': 'limitPrice', 'type': 'uint64' },
                    { 'name': 'isBuyingContract', 'type': 'bool' },
                ],
            },
            'EIP712_TRANSFER_TYPE': {
                'Transfer': [
                    { 'name': 'fromAccount', 'type': 'address' },
                    { 'name': 'fromSubAccount', 'type': 'uint64' },
                    { 'name': 'toAccount', 'type': 'address' },
                    { 'name': 'toSubAccount', 'type': 'uint64' },
                    { 'name': 'tokenCurrency', 'type': 'uint8' },
                    { 'name': 'numTokens', 'type': 'uint64' },
                    { 'name': 'nonce', 'type': 'uint32' },
                    { 'name': 'expiration', 'type': 'int64' },
                ],
            },
            'EIP712_WITHDRAWAL_TYPE': {
                'Withdrawal': [
                    { 'name': 'fromAccount', 'type': 'address' },
                    { 'name': 'toEthAddress', 'type': 'address' },
                    { 'name': 'tokenCurrency', 'type': 'uint8' },
                    { 'name': 'numTokens', 'type': 'uint64' },
                    { 'name': 'nonce', 'type': 'uint32' },
                    { 'name': 'expiration', 'type': 'int64' },
                ],
            },
            'EIP712_BUILDER_APPROVAL_TYPE': {
                'AuthorizeBuilder': [
                    { 'name': 'mainAccountID', 'type': 'address' },
                    { 'name': 'builderAccountID', 'type': 'address' },
                    { 'name': 'maxFutureFeeRate', 'type': 'uint32' },
                    { 'name': 'maxSpotFeeRate', 'type': 'uint32' },
                    { 'name': 'nonce', 'type': 'uint32' },
                    { 'name': 'expiration', 'type': 'int64' },
                ],
            },
        };
    }

    async loadMarketsAndSignIn () {
        await Promise.all ([ this.loadMarkets (), this.signIn () ]);
    }

    /**
     * @method
     * @name grvt#signIn
     * @description sign in, must be called prior to using other authenticated methods
     * @see https://api-docs.grvt.io/#authentication
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns response from exchange
     */
    async signIn (params = {}) {
        await this.sleep (10); // temporary workaround for allowing promise-all to prioritize loadMarkets
        this.checkRequiredCredentials ();
        const now = this.milliseconds ();
        // expires in 24 hours as CS suggested
        const expires = this.safeInteger (this.options, 'signInExpiration', 0);
        // if previous sign-in not expired (give 10 seconds margin)
        if (expires !== undefined && expires > now + 10000) {
            return;
        }
        const request = {
            'api_key': this.apiKey,
        };
        const response = await this.privateEdgePostAuthApiKeyLogin (this.extend (request, params));
        //
        //    {
        //        "location": "",
        //        "status": "success"
        //    }
        //
        this.options['signInExpiration'] = now + 86400000; // 24 hours
        return response;
    }

    /**
     * @method
     * @name grvt#fetchMarkets
     * @description retrieves data on all markets
     * @see https://api-docs.grvt.io/market_data_api/#get-instrument-prod
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicMarketPostFullV1AllInstruments (params);
        //
        //    {
        //        "result": [
        //            {
        //                "instrument": "AAVE_USDT_Perp",
        //                "instrument_hash": "0x032201",
        //                "base": "AAVE",
        //                "quote": "USDT",
        //                "kind": "PERPETUAL",
        //                "venues": [
        //                    "ORDERBOOK",
        //                    "RFQ"
        //                ],
        //                "settlement_period": "PERPETUAL",
        //                "base_decimals": "9",
        //                "quote_decimals": "6",
        //                "tick_size": "0.01",
        //                "min_size": "0.1",
        //                "create_time": "1764303867576216941",
        //                "max_position_size": "3000.0",
        //                "funding_interval_hours": "8",
        //                "adjusted_funding_rate_cap": "0.75",
        //                "adjusted_funding_rate_floor": "-0.75"
        //            },
        //            ...
        //
        const result = this.safeList (response, 'result', []);
        return this.parseMarkets (result);
    }

    parseMarket (market): Market {
        //
        //    {
        //        "instrument": "BTC_USDT_Perp",
        //        "instrument_hash": "0x030501",
        //        "base": "BTC",
        //        "quote": "USDT",
        //        "kind": "PERPETUAL",
        //        "venues": [
        //            "ORDERBOOK",
        //            "RFQ"
        //        ],
        //        "settlement_period": "PERPETUAL",
        //        "base_decimals": 9,
        //        "quote_decimals": 6,
        //        "tick_size": "0.1",
        //        "min_size": "0.001",
        //        "create_time": "1768040726362828205",
        //        "max_position_size": "1000.0",
        //        "funding_interval_hours": 8,
        //        "adjusted_funding_rate_cap": "0.3",
        //        "adjusted_funding_rate_floor": "-0.3",
        //        "min_notional": "100.0"
        //    }
        //
        const marketId = this.safeString (market, 'instrument');
        const baseId = this.safeString (market, 'base');
        const quoteId = this.safeString (market, 'quote');
        const settleId = quoteId;
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        const symbol = base + '/' + quote + ':' + settle;
        let type: Str = undefined;
        const typeRaw = this.safeString (market, 'kind');
        if (typeRaw === 'PERPETUAL') {
            type = 'swap';
        }
        const isSpot = (type === 'spot');
        const isSwap = (type === 'swap');
        const isFuture = (type === 'future');
        const isContract = isSwap || isFuture;
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': isSpot,
            'margin': false,
            'swap': isSwap,
            'future': isFuture,
            'option': false,
            'active': undefined, // todo: ask support to add
            'contract': isContract,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (market, 'min_size'), // not base_decimals!
                'price': this.safeNumber (market, 'tick_size'),
                'base': this.parseNumber (this.parsePrecision (this.safeString (market, 'base_decimals'))),
                'quote': this.parseNumber (this.parsePrecision (this.safeString (market, 'quote_decimals'))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'min_size'),
                    'max': this.safeNumber (market, 'max_position_size'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (market, 'min_notional'),
                    'max': undefined,
                },
            },
            'created': this.safeIntegerProduct (market, 'create_time', 0.000001),
            'info': market,
        } as Market;
    }

    /**
     * @method
     * @name grvt#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api-docs.grvt.io/market_data_api/#get-currency-response
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicMarketPostFullV1Currency (params);
        //
        //    {
        //        "result": [
        //            {
        //                "id": "4",
        //                "symbol": "ETH",
        //                "balance_decimals": "9",
        //                "quantity_multiplier": "1000000000"
        //            },
        //            ..
        //
        const responseResult = this.safeList (response, 'result', []);
        return this.parseCurrencies (responseResult);
    }

    parseCurrency (rawCurrency: Dict): Currency {
        //
        //            {
        //                "id": "4",
        //                "symbol": "ETH",
        //                "balance_decimals": "9",
        //                "quantity_multiplier": "1000000000"
        //            },
        //
        const id = this.safeString (rawCurrency, 'symbol');
        const code = this.safeCurrencyCode (id);
        return this.safeCurrencyStructure ({
            'info': rawCurrency,
            'id': id,
            'code': code,
            'name': undefined,
            'active': undefined,
            'deposit': undefined,
            'withdraw': undefined,
            'fee': undefined,
            'precision': this.parseNumber (this.parsePrecision (this.safeString (rawCurrency, 'balance_decimals'))),
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'type': 'crypto', // only crypto for now
            'networks': undefined,
            'numericId': this.safeInteger (rawCurrency, 'id'),
        });
    }

    /**
     * @method
     * @name grvt#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.grvt.io/market_data_api/#ticker_1
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': this.marketId (symbol),
        };
        const response = await this.publicMarketPostFullV1Ticker (this.extend (request, params));
        //
        //    {
        //        "result": {
        //            "event_time": "1764774730025055205",
        //            "instrument": "BTC_USDT_Perp",
        //            "mark_price": "92697.300078773",
        //            "index_price": "92727.818122278",
        //            "last_price": "92683.0",
        //            "last_size": "0.001",
        //            "mid_price": "92682.95",
        //            "best_bid_price": "92682.9",
        //            "best_bid_size": "5.332",
        //            "best_ask_price": "92683.0",
        //            "best_ask_size": "0.009",
        //            "funding_rate_8h_curr": "0.0037",
        //            "funding_rate_8h_avg": "0.0037",
        //            "interest_rate": "0.0",
        //            "forward_price": "0.0",
        //            "buy_volume_24h_b": "2893.898",
        //            "sell_volume_24h_b": "2907.847",
        //            "buy_volume_24h_q": "266955739.1606",
        //            "sell_volume_24h_q": "268170211.7109",
        //            "high_price": "93908.3",
        //            "low_price": "89900.1",
        //            "open_price": "90129.2",
        //            "open_interest": "1523.218935908",
        //            "long_short_ratio": "1.472543",
        //            "funding_rate": "0.0037",
        //            "next_funding_time": "1764777600000000000"
        //        }
        //    }
        //
        const result = this.safeDict (response, 'result', {});
        return this.parseTicker (result, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //  {
        //            "event_time": "1764774730025055205",
        //            "instrument": "BTC_USDT_Perp",
        //            "mark_price": "92697.300078773",
        //            "index_price": "92727.818122278",
        //            "last_price": "92683.0",
        //            "last_size": "0.001",
        //            "mid_price": "92682.95",
        //            "best_bid_price": "92682.9",
        //            "best_bid_size": "5.332",
        //            "best_ask_price": "92683.0",
        //            "best_ask_size": "0.009",
        //            "funding_rate_8h_curr": "0.0037",
        //            "funding_rate_8h_avg": "0.0037",
        //            "interest_rate": "0.0",
        //            "forward_price": "0.0",
        //            "buy_volume_24h_b": "2893.898",
        //            "sell_volume_24h_b": "2907.847",
        //            "buy_volume_24h_q": "266955739.1606",
        //            "sell_volume_24h_q": "268170211.7109",
        //            "high_price": "93908.3",
        //            "low_price": "89900.1",
        //            "open_price": "90129.2",
        //            "open_interest": "1523.218935908",
        //            "long_short_ratio": "1.472543",
        //            "funding_rate": "0.0037",
        //            "next_funding_time": "1764777600000000000"
        //        }
        //
        const marketId = this.safeString (ticker, 'instrument');
        return this.safeTicker ({
            'info': ticker,
            'symbol': this.safeSymbol (marketId, market),
            'open': this.safeString (ticker, 'open_price'),
            'high': this.safeString (ticker, 'high_price'),
            'low': this.safeString (ticker, 'low_price'),
            'last': this.safeString (ticker, 'last_price'),
            'bid': this.safeString (ticker, 'best_bid_price'),
            'bidVolume': this.safeString (ticker, 'best_bid_size'),
            'ask': this.safeString (ticker, 'best_ask_price'),
            'askVolume': this.safeString (ticker, 'best_ask_size'),
            'change': undefined,
            'percentage': undefined,
            'baseVolume': this.safeString (ticker, 'buy_volume_24h_b'),
            'quoteVolume': this.safeString (ticker, 'buy_volume_24h_q'),
            'markPrice': this.safeString (ticker, 'mark_price'),
            'indexPrice': this.safeString (ticker, 'index_price'),
            'vwap': undefined,
            'average': undefined,
            'previousClose': undefined,
        });
    }

    /**
     * @method
     * @name grvt#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.grvt.io/market_data_api/#orderbook-levels
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const request = {
            'instrument': this.marketId (symbol),
        };
        if (limit === undefined) {
            limit = 100;
        }
        if (limit <= 500) {
            request['depth'] = this.findNearestCeiling ([ 10, 50, 100, 500 ], limit);
        }
        const response = await this.publicMarketPostFullV1Book (this.extend (request, params));
        //
        //    {
        //        "result": {
        //            "event_time": "1764777396650000000",
        //            "instrument": "BTC_USDT_Perp",
        //            "bids": [
        //                { "price": "92336.0", "size": "0.005", "num_orders": "1" },
        //                ...
        //            ],
        //            "asks": [
        //                { "price": "92336.1", "size": "5.711", "num_orders": "37" },
        //                ...
        //            ]
        //        }
        //    }
        //
        const result = this.safeDict (response, 'result', {});
        const timestamp = this.parse8601 (this.safeString (result, 'event_time'));
        const marketId = this.safeString (result, 'instrument');
        return this.parseOrderBook (result, this.safeSymbol (marketId), timestamp, 'bids', 'asks', 'price', 'size');
    }

    /**
     * @method
     * @name grvt#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api-docs.grvt.io/market_data_api/#trade_1
     * @param {string} symbol unified symbol of the market
     * @param {int} [since] timestamp in ms of the earliest item to fetch
     * @param {int} [limit] the maximum amount of items to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'instrument': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        [ request, params ] = this.handleUntilOptionString ('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString (since * 1000000);
        }
        const response = await this.publicMarketPostFullV1TradeHistory (this.extend (request, params));
        //
        //    {
        //        "next": "eyJ0cmFkZUlkIjo2NDc5MTAyMywidHJhZGVJbmRleCI6MX0",
        //        "result": [
        //            {
        //                "event_time": "1764779531332118705",
        //                "instrument": "ETH_USDT_Perp",
        //                "is_taker_buyer": false,
        //                "size": "23.73",
        //                "price": "3089.88",
        //                "mark_price": "3089.360002315",
        //                "index_price": "3090.443723246",
        //                "interest_rate": "0.0",
        //                "forward_price": "0.0",
        //                "trade_id": "64796657-1",
        //                "venue": "ORDERBOOK",
        //                "is_rpi": false
        //            },
        //            ...
        //
        const result = this.safeList (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //
        //            {
        //                "event_time": "1764779531332118705",
        //                "instrument": "ETH_USDT_Perp",
        //                "size": "23.73",
        //                "price": "3089.88",
        //                "is_rpi": false,
        //                "mark_price": "3089.360002315",
        //                "index_price": "3090.443723246",
        //                "interest_rate": "0.0",
        //                "forward_price": "0.0",
        //                "trade_id": "64796657-1",
        //                "venue": "ORDERBOOK",
        //                "is_taker_buyer": false
        //            }
        //
        // fetchMyTrades
        //
        //            {
        //                "event_time": "1764945709702747558",
        //                "instrument": "BTC_USDT_Perp",
        //                "size": "0.001",
        //                "price": "90000.0",
        //                "is_rpi": false
        //                "mark_price": "90050.164063298",
        //                "index_price": "90089.803654938",
        //                "interest_rate": "0.0",
        //                "forward_price": "0.0",
        //                "trade_id": "65424692-2",
        //                "venue": "ORDERBOOK",
        //                "is_buyer": true,
        //                "is_taker": false,
        //                "broker": "UNSPECIFIED",
        //                "realized_pnl": "0.0",
        //                "fee": "-0.00009",
        //                "fee_rate": "0.0",
        //                "order_id": "0x01010105034cddc7000000006621285c",
        //                "client_order_id": "1375879248",
        //                "signer": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                "sub_account_id": "2147050003876484",
        //            }
        //
        const marketId = this.safeString (trade, 'instrument');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeIntegerProduct (trade, 'event_time', 0.000001);
        let takerOrMaker = undefined;
        const isTakerBuyer = this.safeBool (trade, 'is_taker_buyer');
        let side: Str = undefined;
        if (isTakerBuyer !== undefined) {
            side = isTakerBuyer ? 'buy' : 'sell';
            takerOrMaker = 'taker';
        } else {
            takerOrMaker = this.safeBool (trade, 'is_taker') ? 'taker' : 'maker';
            side = this.safeBool (trade, 'is_buyer') ? 'buy' : 'sell';
        }
        let fee = undefined;
        const feeString = this.safeString (trade, 'fee');
        if (feeString !== undefined) {
            fee = {
                'cost': this.parseNumber (feeString),
                'currency': market['quote'],
                'rate': this.safeNumber (trade, 'fee_rate'),
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'trade_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'size'),
            'cost': undefined,
            'fee': fee,
            'order': this.safeString (trade, 'order_id'),
        }, market);
    }

    /**
     * @method
     * @name grvt#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs.grvt.io/market_data_api/#candlestick_1
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest item to fetch
     * @param {int} [limit] the maximum amount of items to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        const maxLimit = 1000;
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, maxLimit) as OHLCV[];
        }
        const market = this.market (symbol);
        let request = {
            'instrument': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        const priceTypeMap = {
            'last': 'TRADE',
            'mark': 'MARK',
            'index': 'INDEX',
            // 'median': 'MEDIAN',
        };
        const selectedPriceType = this.safeString (params, 'priceType', 'last');
        request['type'] = this.safeString (priceTypeMap, selectedPriceType);
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        [ request, params ] = this.handleUntilOptionString ('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString (since * 1000000);
        }
        const response = await this.publicMarketPostFullV1Kline (this.extend (request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "open_time": "1767288240000000000",
        //                "close_time": "1767288300000000000",
        //                "open": "88178.8",
        //                "close": "88176.7",
        //                "high": "88192.7",
        //                "low": "88176.6",
        //                "volume_b": "15.32",
        //                "volume_q": "1350962.4782",
        //                "trades": 38,
        //                "instrument": "BTC_USDT_Perp"
        //            },
        //        ],
        //        "next": "eyJvcGVuVGltZSI6MTc2NzI1ODMwMDAwMDAwMDAwMH0"
        //    }
        //
        const candles = this.safeList (response, 'result', []);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //            {
        //                "open_time": "1767288240000000000",
        //                "close_time": "1767288300000000000",
        //                "open": "88178.8",
        //                "close": "88176.7",
        //                "high": "88192.7",
        //                "low": "88176.6",
        //                "volume_b": "15.32",
        //                "volume_q": "1350962.4782",
        //                "trades": 38,
        //                "instrument": "BTC_USDT_Perp"
        //            }
        //
        return [
            this.safeIntegerProduct (ohlcv, 'open_time', 0.000001),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume_b'),
        ];
    }

    /**
     * @method
     * @name grvt#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://api-docs.grvt.io/market_data_api/#funding-rate
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchFundingRateHistory', symbol, since, limit, '8h', params) as FundingRateHistory[];
        }
        const market = this.market (symbol);
        let request: Dict = {
            'instrument': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        [ request, params ] = this.handleUntilOptionString ('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString (since * 1000000);
        }
        const response = await this.publicMarketPostFullV1Funding (this.extend (request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "instrument": "BTC_USDT_Perp",
        //                "funding_rate": "-0.0034",
        //                "funding_time": "1760494260000000000",
        //                "mark_price": "112721.159060304",
        //                "funding_rate_8_h_avg": "-0.0038",
        //                "funding_interval_hours": "0"
        //            },
        //            ...
        //        ],
        //        "next": "eyJmdW5kaW5nVGltZSI6MTc2MDQ5NDI2MDAwMDAwMDAwMH0"
        //    }
        //
        const result = this.safeList (response, 'result', []);
        return this.parseFundingRateHistories (result, market);
    }

    parseFundingRateHistory (rawItem, market: Market = undefined): FundingRateHistory {
        //
        //            {
        //                "instrument": "BTC_USDT_Perp",
        //                "funding_rate": "-0.0034",
        //                "funding_time": "1760494260000000000",
        //                "mark_price": "112721.159060304",
        //                "funding_rate_8_h_avg": "-0.0038",
        //                "funding_interval_hours": "0"
        //            },
        //
        const marketId = this.safeString (rawItem, 'instrument');
        const ts = this.safeIntegerProduct (rawItem, 'funding_time', 0.000001);
        return {
            'info': rawItem,
            'symbol': this.safeSymbol (marketId, market),
            'fundingRate': this.safeNumber (rawItem, 'funding_rate'),
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
        };
    }

    getSubAccountId (params) {
        let subAccountId = undefined;
        [ subAccountId, params ] = this.handleOptionAndParams (params, undefined, 'subAccountId');
        if (subAccountId === undefined) {
            throw new ArgumentsRequired (this.id + ' you should set params["subAccountId"] = "YOUR_TRADING_ACCOUNT_ID", which can be found in the API-KEYS page');
        }
        return subAccountId.toString ();
    }

    /**
     * @method
     * @name grvt#fetchBalance
     * @description query for account info
     * @see https://api-docs.grvt.io/trading_api/#sub-account-summary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarketsAndSignIn ();
        const request = {
            'sub_account_id': this.getSubAccountId (params),
        };
        const response = await this.privateTradingPostFullV1AccountSummary (this.extend (request, params));
        //
        //    {
        //        "result": {
        //            "event_time": "1764863116142428457",
        //            "sub_account_id": "2147050003876484",
        //            "margin_type": "SIMPLE_CROSS_MARGIN",
        //            "settle_currency": "USDT",
        //            "unrealized_pnl": "0.0",
        //            "total_equity": "15.0",
        //            "initial_margin": "0.0",
        //            "maintenance_margin": "0.0",
        //            "available_balance": "15.0",
        //            "spot_balances": [
        //                {
        //                    "currency": "USDT",
        //                    "balance": "15.0",
        //                    "index_price": "1.000289735"
        //                }
        //            ],
        //            "positions": [],
        //            "settle_index_price": "1.000289735",
        //            "derisk_margin": "0.0",
        //            "derisk_to_maintenance_margin_ratio": "1.0",
        //            "total_cross_equity": "15.0",
        //            "cross_unrealized_pnl": "0.0"
        //        }
        //    }
        //
        const result = this.safeDict (response, 'result', {});
        return this.parseBalance (result);
    }

    parseBalance (response): Balances {
        //
        //        {
        //            "event_time": "1764863116142428457",
        //            "sub_account_id": "2147050003876484",
        //            "margin_type": "SIMPLE_CROSS_MARGIN",
        //            "settle_currency": "USDT",
        //            "unrealized_pnl": "0.0",
        //            "total_equity": "15.0",
        //            "initial_margin": "0.0",
        //            "maintenance_margin": "0.0",
        //            "available_balance": "15.0",
        //            "spot_balances": [
        //                {
        //                    "currency": "USDT",
        //                    "balance": "15.0",
        //                    "index_price": "1.000289735"
        //                }
        //            ],
        //            "positions": [],
        //            "settle_index_price": "1.000289735",
        //            "derisk_margin": "0.0",
        //            "derisk_to_maintenance_margin_ratio": "1.0",
        //            "total_cross_equity": "15.0",
        //            "cross_unrealized_pnl": "0.0"
        //        }
        //
        const timestamp = this.safeIntegerProduct (response, 'event_time', 0.000001);
        const result: Dict = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const spotBalances = this.safeList (response, 'spot_balances', []);
        const availableBalance = this.safeString (response, 'available_balance');
        for (let i = 0; i < spotBalances.length; i++) {
            const balance = spotBalances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'balance');
            account['free'] = availableBalance; // todo: revise after API team clarification
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name grvt#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://api-docs.grvt.io/trading_api/#transfer
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarketsAndSignIn ();
        let request: Dict = {};
        let currency = undefined;
        if (code === undefined) {
            request['currency'] = null;
        } else {
            currency = this.currency (code);
            request['currency'] = [ currency['code'] ];
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        [ request, params ] = this.handleUntilOptionString ('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString (since * 1000000);
        }
        const useTransfersEndpoint = this.safeBool (this.options, 'useTransfersEndpointForDepositsWithdrawals', true);
        if (useTransfersEndpoint) {
            const transfers = await this.internalFetchTransfers (this.extend (request, params), currency, since, limit);
            const filteredResults = this.filterTransfersByType (transfers, 'deposit', true);
            const transactions = this.getListFromObjectValues (filteredResults[0], 'info');
            return this.parseTransactions (transactions, currency, since, limit);
        } else {
            const response = await this.privateTradingPostFullV1DepositHistory (this.extend (request, params));
            //
            // {
            //     "result": [{
            //         "l_1_hash": "0x10000101000203040506",
            //         "l_2_hash": "0x10000101000203040506",
            //         "to_account_id": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
            //         "currency": "USDT",
            //         "num_tokens": "1500.0",
            //         "initiated_time": "1697788800000000000",
            //         "confirmed_time": "1697788800000000000",
            //         "from_address": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0"
            //     }],
            //     "next": "Qw0918="
            // }
            //
            const result = this.safeList (response, 'result', []);
            return this.parseTransactions (result, currency, since, limit);
        }
    }

    /**
     * @method
     * @name grvrt#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_withdrawals
     * @param {string} [code] unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarketsAndSignIn ();
        let request: Dict = {};
        let currency = undefined;
        if (code === undefined) {
            request['currency'] = null;
        } else {
            currency = this.currency (code);
            request['currency'] = [ currency['code'] ];
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        [ request, params ] = this.handleUntilOptionString ('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString (since * 1000000);
        }
        const useTransfersEndpoint = this.safeBool (this.options, 'useTransfersEndpointForDepositsWithdrawals', true);
        if (useTransfersEndpoint) {
            const transfers = await this.internalFetchTransfers (this.extend (request, params), currency, since, limit);
            const filteredResults = this.filterTransfersByType (transfers, 'withdrawal', true);
            const transactions = this.getListFromObjectValues (filteredResults[0], 'info');
            return this.parseTransactions (transactions, currency, since, limit);
        } else {
            const response = await this.privateTradingPostFullV1WithdrawalHistory (this.extend (request, params));
            //
            // {
            //     "result": [{
            //         "tx_id": "1028403",
            //         "from_account_id": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
            //         "to_eth_address": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
            //         "currency": "USDT",
            //         "num_tokens": "1500.0",
            //         "signature": {
            //             "signer": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
            //             "r": "0xb788d96fee91c7cdc35918e0441b756d4000ec1d07d900c73347d9abbc20acc8",
            //             "s": "0x3d786193125f7c29c958647da64d0e2875ece2c3f845a591bdd7dae8c475e26d",
            //             "v": 28,
            //             "expiration": "1697788800000000000",
            //             "nonce": 1234567890,
            //             "chain_id": "325"
            //         },
            //         "event_time": "1697788800000000000",
            //         "l_1_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            //         "l_2_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
            //     }],
            //     "next": "Qw0918="
            // }
            //
            const result = this.safeList (response, 'result', []);
            return this.parseTransactions (result, currency, since, limit);
        }
    }

    async internalFetchTransfers (req, currency: any = undefined, since: Int = undefined, limit: Int = undefined) {
        const response = await this.privateTradingPostFullV1TransferHistory (req);
        //
        //    {
        //        "result": [
        //            {
        //                "tx_id": "65119836",
        //                "from_account_id": "0xc451b0191351ce308fdfd779d73814c910fc5ecb",
        //                "from_sub_account_id": "0",
        //                "to_account_id": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                "to_sub_account_id": "0",
        //                "currency": "USDT",
        //                "num_tokens": "4.998",
        //                "signature": {
        //                    "signer": "0xf4fdbaf9655bfd607098f4f887aaca58c9667203",
        //                    "r": "0x5f780b99e5e8516f85e66af49b469eeeeeee724290d7f49f1e84b25ad038fa81",
        //                    "s": "0x66c76fdb37a25db8c6b368625d96ee91ab1ffca1786d84dc806b08d1460e97bc",
        //                    "v": "27",
        //                    "expiration": "1767455807929000000",
        //                    "nonce": "45905",
        //                    "chain_id": "0"
        //                },
        //                "event_time": "1764863808817370541",
        //                "transfer_type": "NON_NATIVE_BRIDGE_DEPOSIT",
        //                "transfer_metadata": "{\\"provider\\":\\"rhino\\",\\"direction\\":\\"deposit\\",\\"chainid\\":\\"8453\\",\\"endpoint\\":\\"0x01b89ac919ead1bd513b548962075137c683b9ab\\",\\"provider_tx_id\\":\\"0x1dff8c839f8e21b5af7e121a1ae926017e734aafe8c4ae9942756b3091793b4f\\",\\"provider_ref_id\\":\\"6931aefa5f1ab6fcf0d2f856\\"}"
        //            },
        //            ...
        //        ],
        //        "next": ""
        //    }
        //
        const rows = this.safeList (response, 'result', []);
        const transfers = this.parseTransfers (rows, currency, since, limit);
        return transfers;
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // fetchDeposits
        //
        //    {
        //         "l_1_hash": "0x10000101000203040506",
        //         "l_2_hash": "0x10000101000203040506",
        //         "to_account_id": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
        //         "currency": "USDT",
        //         "num_tokens": "1500.0",
        //         "initiated_time": "1697788800000000000",
        //         "confirmed_time": "1697788800000000000",
        //         "from_address": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "tx_id": "1028403",
        //         "from_account_id": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
        //         "to_eth_address": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
        //         "currency": "USDT",
        //         "num_tokens": "1500.0",
        //         "signature": {
        //             "signer": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
        //             "r": "0xb788d96fee91c7cdc35918e0441b756d4000ec1d07d900c73347d9abbc20acc8",
        //             "s": "0x3d786193125f7c29c958647da64d0e2875ece2c3f845a591bdd7dae8c475e26d",
        //             "v": 28,
        //             "expiration": "1697788800000000000",
        //             "nonce": 1234567890,
        //             "chain_id": "325"
        //         },
        //         "event_time": "1697788800000000000",
        //         "l_1_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        //         "l_2_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
        //     }
        //
        // fetchTransfers
        //
        //           {
        //                "tx_id": "65119836",
        //                "from_account_id": "0xc451b0191351ce308fdfd779d73814c910fc5ecb",
        //                "from_sub_account_id": "0",
        //                "to_account_id": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                "to_sub_account_id": "0",
        //                "currency": "USDT",
        //                "num_tokens": "4.998",
        //                "signature": {
        //                    "signer": "0xf4fdbaf9655bfd607098f4f887aaca58c9667203",
        //                    "r": "0x5f780b99e5e8516f85e66af49b469eeeeeee724290d7f49f1e84b25ad038fa81",
        //                    "s": "0x66c76fdb37a25db8c6b368625d96ee91ab1ffca1786d84dc806b08d1460e97bc",
        //                    "v": "27",
        //                    "expiration": "1767455807929000000",
        //                    "nonce": "45905",
        //                    "chain_id": "0"
        //                },
        //                "event_time": "1764863808817370541",
        //                "transfer_type": "NON_NATIVE_BRIDGE_DEPOSIT",
        //                "transfer_metadata": "{\\"provider\\":\\"rhino\\",\\"direction\\":\\"deposit\\",\\"chainid\\":\\"8453\\",\\"endpoint\\":\\"0x01b89ac919ead1bd513b548962075137c683b9ab\\",\\"provider_tx_id\\":\\"0x1dff8c839f8e21b5af7e121a1ae926017e734aafe8c4ae9942756b3091793b4f\\",\\"provider_ref_id\\":\\"6931aefa5f1ab6fcf0d2f856\\"}"
        //            },
        //
        // withdraw
        //
        //    {
        //        "result": {
        //            "ack": "true"
        //        }
        //    }
        //
        let direction: Str = undefined;
        let txId: Str = undefined;
        let networkCode: Str = undefined;
        let addressFrom = this.safeString (transaction, 'from_account_id');
        let addressTo = this.safeString (transaction, 'to_account_id');
        if ('transfer_metadata' in transaction) {
            const metaData = this.omitZero (this.safeString (transaction, 'transfer_metadata'));
            if (metaData !== undefined) {
                const parsedMeta = this.parseJson (metaData);
                direction = this.safeStringLower (parsedMeta, 'direction');
                txId = this.safeString (parsedMeta, 'provider_tx_id');
                const chainId = this.safeString (parsedMeta, 'chainid');
                networkCode = this.networkIdToCode (chainId);
                if (direction === 'withdrawal') {
                    addressTo = this.safeString (parsedMeta, 'endpoint');
                } else if (direction === 'deposit') {
                    addressFrom = this.safeString (parsedMeta, 'endpoint');
                }
            }
        }
        const timestamp = this.safeIntegerProduct2 (transaction, 'event_time', 'initiated_time', 0.000001);
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        return {
            'info': transaction,
            'id': undefined,
            'txid': txId,
            'type': direction,
            'currency': code,
            'network': networkCode,
            'amount': this.safeNumber (transaction, 'num_tokens'),
            'status': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'updated': undefined,
            'comment': undefined,
            'fee': undefined,
        } as Transaction;
    }

    /**
     * @method
     * @name grvt#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://api-docs.grvt.io/trading_api/#transfer-history
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve (default 10, max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] whether to paginate the results (default false)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<TransferEntry[]> {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransfers() requires a code argument');
        }
        await this.loadMarketsAndSignIn ();
        let request: Dict = {};
        const currency = this.currency (code);
        const maxLimit = 1000;
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTransfers', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchTransfers', undefined, since, limit, params, maxLimit);
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        [ request, params ] = this.handleUntilOptionString ('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString (since * 1000000);
        }
        const response = await this.privateTradingPostFullV1TransferHistory (this.extend (request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "tx_id": "65119836",
        //                "from_account_id": "0xc451b0191351ce308fdfd779d73814c910fc5ecb",
        //                "from_sub_account_id": "0",
        //                "to_account_id": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                "to_sub_account_id": "0",
        //                "currency": "USDT",
        //                "num_tokens": "4.998",
        //                "signature": {
        //                    "signer": "0xf4fdbaf9655bfd607098f4f887aaca58c9667203",
        //                    "r": "0x5f780b99e5e8516f85e66af49b469eeeeeee724290d7f49f1e84b25ad038fa81",
        //                    "s": "0x66c76fdb37a25db8c6b368625d96ee91ab1ffca1786d84dc806b08d1460e97bc",
        //                    "v": "27",
        //                    "expiration": "1767455807929000000",
        //                    "nonce": "45905",
        //                    "chain_id": "0"
        //                },
        //                "event_time": "1764863808817370541",
        //                "transfer_type": "NON_NATIVE_BRIDGE_DEPOSIT",
        //                "transfer_metadata": "{\\"provider\\":\\"rhino\\",\\"direction\\":\\"deposit\\",\\"chainid\\":\\"8453\\",\\"endpoint\\":\\"0x01b89ac919ead1bd513b548962075137c683b9ab\\",\\"provider_tx_id\\":\\"0x1dff8c839f8e21b5af7e121a1ae926017e734aafe8c4ae9942756b3091793b4f\\",\\"provider_ref_id\\":\\"6931aefa5f1ab6fcf0d2f856\\"}"
        //            },
        //            ...
        //        ],
        //        "next": ""
        //    }
        //
        const rows = this.safeList (response, 'result', []);
        const transfers = this.parseTransfers (rows, currency, since, limit);
        const filteredResults = this.filterTransfersByType (transfers, 'internal', false);
        return filteredResults[1];
    }

    filterTransfersByType (transfers: any, transferType: string, onlyMainAccount = true): any {
        const matchedResults = [];
        const nonMatchedResults = [];
        for (let i = 0; i < transfers.length; i++) {
            const transfer = transfers[i];
            if ((onlyMainAccount && transfer['fromAccount'] === '0' && transfer['toAccount'] === '0') || (!onlyMainAccount && (transfer['fromAccount'] !== '0' || transfer['toAccount'] !== '0'))) {
                const metadata = this.safeString (transfer['info'], 'transfer_metadata');
                const parsedMetadata = this.parseJson (metadata);
                const direction = this.safeString (parsedMetadata, 'direction');
                if (direction === transferType) {
                    matchedResults.push (transfer);
                } else {
                    nonMatchedResults.push (transfer);
                }
            }
        }
        return [ matchedResults, nonMatchedResults ];
    }

    /**
     * @method
     * @name grvt#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://api-docs.grvt.io/trading_api/#transfer_1
     * @param {string} code unified currency codeåå
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer (code: string, amount: number, fromAccount: string, toAccount:string, params = {}): Promise<TransferEntry> {
        await this.loadMarketsAndSignIn ();
        await this.loadAggregatedAccountSummary ();
        const currency = this.currency (code);
        const defaultFromAccountId = this.safeString (this.options, 'userMainAccountId');
        if (this.inArray (fromAccount, [ 'trading', 'funding' ]) && this.inArray (toAccount, [ 'trading', 'funding' ])) {
            const tradingAccountId = this.safeString (this.options, 'tradingAccountId');
            const fundingAccountId = this.safeString (this.options, 'fundingAccountId');
            if (tradingAccountId === undefined || fundingAccountId === undefined) {
                throw new ArgumentsRequired (this.id + ' transfer(): you should set .options["tradingAccountId"] and exchange.options["fundingAccountId"] to the corresponding account IDs or directly pass accountIds as fromAccount and toAccount arguments (use "0" as funding account id)');
            }
            fromAccount = (fromAccount === 'trading') ? tradingAccountId : fundingAccountId;
            toAccount = (toAccount === 'trading') ? tradingAccountId : fundingAccountId;
        }
        let request: Dict = {
            'from_account_id': this.safeString (params, 'from_account_id', defaultFromAccountId),
            'from_sub_account_id': this.safeString (params, 'from_sub_account_id', fromAccount),
            'to_account_id': this.safeString (params, 'to_account_id', defaultFromAccountId),
            'to_sub_account_id': this.safeString (params, 'to_sub_account_id', toAccount),
            'currency': currency['id'],
            'num_tokens': this.currencyToPrecision (code, amount),
            'signature': this.defaultSignature (),
            'transfer_type': 'STANDARD',
            'transfer_metadata': null,
        };
        request = this.createSignedRequest (request, 'EIP712_TRANSFER_TYPE', currency);
        const response = await this.privateTradingPostFullV1Transfer (this.extend (request, params));
        //
        // {
        //     "result": {
        //         "ack": "true",
        //         "tx_id": "1028403"
        //     }
        // }
        //
        const result = this.safeDict (response, 'result', {});
        return this.parseTransfer (result, currency);
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        //
        // transfer
        //
        //     {
        //         "ack": "true",
        //         "tx_id": "1028403"
        //     }
        //
        // fetchTransfers
        //
        //            {
        //                "tx_id": "65119836",
        //                "from_account_id": "0xc451b0191351ce308fdfd779d73814c910fc5ecb",
        //                "from_sub_account_id": "0",
        //                "to_account_id": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                "to_sub_account_id": "0",
        //                "currency": "USDT",
        //                "num_tokens": "4.998",
        //                "signature": {
        //                    "signer": "0xf4fdbaf9655bfd607098f4f887aaca58c9667203",
        //                    "r": "0x5f780b99e5e8516f85e66af49b469eeeeeee724290d7f49f1e84b25ad038fa81",
        //                    "s": "0x66c76fdb37a25db8c6b368625d96ee91ab1ffca1786d84dc806b08d1460e97bc",
        //                    "v": "27",
        //                    "expiration": "1767455807929000000",
        //                    "nonce": "45905",
        //                    "chain_id": "0"
        //                },
        //                "event_time": "1764863808817370541",
        //                "transfer_type": "NON_NATIVE_BRIDGE_DEPOSIT",
        //                "transfer_metadata": "{\\"provider\\":\\"rhino\\",\\"direction\\":\\"deposit\\",\\"chainid\\":\\"8453\\",\\"endpoint\\":\\"0x01b89ac919ead1bd513b548962075137c683b9ab\\",\\"provider_tx_id\\":\\"0x1dff8c839f8e21b5af7e121a1ae926017e734aafe8c4ae9942756b3091793b4f\\",\\"provider_ref_id\\":\\"6931aefa5f1ab6fcf0d2f856\\"}"
        //            }
        //
        const currencyId = this.safeString (transfer, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeIntegerProduct (transfer, 'event_time', 0.000001);
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'tx_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': this.safeString (transfer, 'from_sub_account_id'),
            'toAccount': this.safeString (transfer, 'to_sub_account_id'),
            'status': undefined,
        };
    }

    async loadAggregatedAccountSummary () {
        if (this.safeString (this.options, 'userMainAccountId') !== undefined) {
            return;
        }
        const response = await this.privateTradingPostFullV1AggregatedAccountSummary ();
        const result = this.safeDict (response, 'result', {});
        const mainAccountId = this.safeString (result, 'main_account_id');
        this.options['userMainAccountId'] = mainAccountId;
    }

    /**
     * @method
     * @name grvt#withdraw
     * @description make a withdrawal
     * @see https://api-docs.grvt.io/trading_api/#withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.network the network to withdraw on (mandatory)
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params = {}): Promise<Transaction> {
        this.checkAddress (address);
        await this.loadMarketsAndSignIn ();
        await this.loadAggregatedAccountSummary ();
        const defaultFromAccountId = this.safeString (this.options, 'userMainAccountId');
        const currency = this.currency (code);
        let request: Dict = {
            'to_eth_address': address,
            'from_account_id': defaultFromAccountId,
            'currency': currency['id'],
            'num_tokens': this.currencyToPrecision (code, amount),
            'signature': this.defaultSignature (),
        };
        const [ networkCode, query ] = this.handleNetworkCodeAndParams (params);
        const networkId = this.networkCodeToId (networkCode);
        if (networkId === undefined) {
            throw new BadRequest (this.id + ' withdraw() requires a network parameter');
        }
        request['signature']['chainId'] = networkId;
        request = this.createSignedRequest (request, 'EIP712_WITHDRAWAL_TYPE', currency);
        const response = await this.privateTradingPostFullV1Withdrawal (this.extend (request, query));
        //
        // {
        //     "result": {
        //         "ack": "true"
        //     }
        // }
        //
        const result = this.safeDict (response, 'result', {});
        return this.parseTransaction (result, currency);
    }

    /**
     * @method
     * @name grvt#createOrder
     * @description create a trade order
     * @see https://api-docs.grvt.io/trading_api/#create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float} [params.stopLossPrice] The price a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price a take profit order is triggered at
     * @param {string} [params.timeInForce] "GTC", "IOC", or "POST_ONLY"
     * @param {bool} [params.postOnly] true or false
     * @param {bool} [params.reduceOnly] Ensures that the executed order does not flip the opened position.
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarketsAndSignIn ();
        // await this.initializeClient (); // todo: after clarifying about another endpoint
        const market = this.market (symbol);
        const orderLeg = {
            'instrument': market['id'],
            'size': amount.toString (),
            'limit_price': this.numberToString (price),
        };
        if (side === 'sell') {
            orderLeg['is_buying_asset'] = false;
        } else if (side === 'buy') {
            orderLeg['is_buying_asset'] = true;
        } else {
            throw new InvalidOrder (this.id + ' createOrder(): order side must be either "buy" or "sell"');
        }
        let request = {
            'sub_account_id': this.getSubAccountId (params),
            'time_in_force': 'GOOD_TILL_TIME',
            'legs': [ orderLeg ],
            'signature': this.defaultSignature (),
            'metadata': {
                'client_order_id': this.nonce ().toString (),
                // 'create_time': (this.milliseconds() * str(1000000)),
                // 'trigger': None or {
                //     'trigger_type': 'TAKE_PROFIT',
                //     'tpsl': {
                //         'trigger_by': 'LAST',
                //          'trigger_price': '80000.0',
                //          'close_position': false,
                //     },
                // },
                // 'broker': 'BROKER_CODE', // None
            },
            'is_market': false,
            'post_only': false,
            'reduce_only': false,
            // 'order_id': null,
            // 'state': null,
        };
        let eipType = 'EIP712_ORDER_TYPE';
        if (this.safeBool (this.options, 'builderFee', true)) {
            eipType = 'EIP712_ORDER_WITH_BUILDER_TYPE';
            request['builder'] = this.safeString (this.options, 'builder');
            request['builder_fee'] = this.safeString (this.options, 'builderRate');
        }
        // @ts-ignore
        request = this.createSignedRequest (request, eipType);
        const fullRequest = {
            'order': request,
        };
        const response = await this.privateTradingPostFullV1CreateOrder (this.extend (fullRequest, params));
        //
        //    {
        //        "result": {
        //            "order_id": "0x00",
        //            "sub_account_id": "2147050003876484",
        //            "is_market": false,
        //            "time_in_force": "GOOD_TILL_TIME",
        //            "post_only": false,
        //            "reduce_only": false,
        //            "legs": [
        //                {
        //                    "instrument": "BTC_USDT_Perp",
        //                    "size": "0.001",
        //                    "limit_price": "50000.0",
        //                    "is_buying_asset": true
        //                }
        //            ],
        //            "signature": {
        //                "signer": "0xbf465e6083a43b170791ea29393f60...",
        //                "r": "0x161826bc2fc43e07b4c1e4aeb01b3e58901f936af10b399e...",
        //                "s": "0x1b6d09609430ef73cb53dd87dbe73939824409296b3673719...",
        //                "v": 27,
        //                "expiration": "1766076771082000000",
        //                "nonce": 1766076671,
        //                "chain_id": "0"
        //            },
        //            "metadata": {
        //                "client_order_id": "1766076671",
        //                "create_time": "1766076671243762741",
        //                "trigger": {
        //                    "trigger_type": "UNSPECIFIED",
        //                    "tpsl": {
        //                        "trigger_by": "UNSPECIFIED",
        //                        "trigger_price": "0.0",
        //                        "close_position": false
        //                    }
        //                },
        //                "broker": "UNSPECIFIED",
        //                "is_position_transfer": false,
        //                "allow_crossing": false
        //            },
        //            "state": {
        //                "status": "PENDING",
        //                "reject_reason": "UNSPECIFIED",
        //                "book_size": [
        //                    "0.001"
        //                ],
        //                "traded_size": [
        //                    "0.0"
        //                ],
        //                "update_time": "1766076671243762741",
        //                "avg_fill_price": [
        //                    "0.0"
        //                ]
        //            },
        //            "builder": "0x00",
        //            "builder_fee": "0.0"
        //        }
        //    }
        //
        const data = this.safeDict (response, 'result', {});
        return this.parseOrder (data, market);
    }

    convertToBigIntCustom (x) {
        return parseInt (x);
    }

    eipMessageForOrder (order, structureType: Str = undefined) {
        const priceMultiplier = '1000000000';
        const orderLegs = this.safeList (order, 'legs', []);
        const legs = [];
        for (let i = 0; i < orderLegs.length; i++) {
            const leg = orderLegs[i];
            const market = this.market (leg['instrument']);
            const bigInt10 = this.convertToBigIntCustom ('10');
            const precisionValue = this.precisionFromString (this.safeString (market['precision'], 'base'));
            const sizeMultiplier = bigInt10 ** this.convertToBigIntCustom (precisionValue.toString ());
            const size = leg['size'];
            const sizeParts = size.split ('.');
            const sizeDec = this.safeString (sizeParts, 1, '');
            const sizeDecLength = sizeDec.length;
            const sizeDecLengthStr = sizeDecLength.toString ();
            const size_int = this.convertToBigIntCustom (size.replace ('.', '')) * sizeMultiplier / (bigInt10 ** this.convertToBigIntCustom (sizeDecLengthStr));
            const price = leg['limit_price'];
            const limitParts = price.split ('.');
            const limitDec = this.safeString (limitParts, 1, '');
            const limitDecLength = limitDec.length;
            const limitDecLengthStr = limitDecLength.toString ();
            const price_int = (this.convertToBigIntCustom (price.replace ('.', '')) * this.convertToBigIntCustom (priceMultiplier) / (bigInt10 ** this.convertToBigIntCustom (limitDecLengthStr)));
            legs.push ({
                'assetID': market['info']['instrument_hash'],
                'contractSize': this.parseToInt (size_int),
                'limitPrice': this.parseToInt (price_int),
                'isBuyingContract': leg['is_buying_asset'],
            });
        }
        const returnValue = {
            'subAccountID': order['sub_account_id'],
            'isMarket': order['is_market'],
            'timeInForce': 1, // good_till_time
            'postOnly': order['post_only'],
            'reduceOnly': order['reduce_only'],
            'legs': legs,
            'nonce': order['signature']['nonce'],
            'expiration': order['signature']['expiration'],
        };
        if (structureType === 'EIP712_ORDER_WITH_BUILDER_TYPE') {
            returnValue['builder'] = order['builder'];
            returnValue['builderFee'] = this.parseToInt (parseFloat (order['builder_fee']) * this.feeAmountMultiplier ());
        }
        return returnValue;
    }

    eipMessageForBuilderApproval (dataObj) {
        const amountMultiplier = this.feeAmountMultiplier ();
        return {
            'mainAccountID': dataObj['main_account_id'],
            'builderAccountID': dataObj['builder_account_id'],
            'maxFutureFeeRate': this.parseToInt (parseFloat (dataObj['max_futures_fee_rate']) * amountMultiplier),
            'maxSpotFeeRate': this.parseToInt (parseFloat (dataObj['max_spot_fee_rate']) * amountMultiplier),
            'nonce': dataObj['signature']['nonce'],
            'expiration': dataObj['signature']['expiration'],
        };
    }

    eipMessageForWithdrawal (withdrawal, currency: Currency = undefined) {
        const amountMultiplier = this.convertToBigIntCustom ('1000000');
        return {
            'fromAccount': withdrawal['from_account_id'],
            'toEthAddress': withdrawal['to_eth_address'],
            'tokenCurrency': currency['numericId'],
            'numTokens': this.parseToInt (withdrawal['num_tokens'] * amountMultiplier),
            'nonce': withdrawal['signature']['nonce'],
            'expiration': withdrawal['signature']['expiration'],
        };
    }

    eipMessageForTransfer (transfer, currency: Currency = undefined) {
        const amountMultiplier = this.convertToBigIntCustom ('1000000');
        const amountInt = transfer['num_tokens'] * amountMultiplier;
        return {
            'fromAccount': transfer['from_account_id'],
            'fromSubAccount': transfer['from_sub_account_id'],
            'toAccount': transfer['to_account_id'],
            'toSubAccount': transfer['to_sub_account_id'],
            'tokenCurrency': currency['numericId'],
            'numTokens': this.parseToInt (amountInt),
            'nonce': transfer['signature']['nonce'],
            'expiration': transfer['signature']['expiration'],
        };
    }

    feeAmountMultiplier () {
        return this.convertToBigIntCustom ('10000'); // multiply needed https://t.me/c/3396937126/88
    }

    /**
     * @method
     * @name grvt#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api-docs.grvt.io/trading_api/#fill-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarketsAndSignIn ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchMyTrades', symbol, since, limit, params) as Trade[];
        }
        let request = {
            'sub_account_id': this.getSubAccountId (params),
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['base'] = [];
            request['base'].push (market['baseId']);
            request['quote'] = [];
            request['quote'].push (market['quoteId']);
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        [ request, params ] = this.handleUntilOptionString ('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString (since * 1000000);
        }
        const response = await this.privateTradingPostFullV1FillHistory (this.extend (request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "event_time": "1764945709702747558",
        //                "sub_account_id": "2147050003876484",
        //                "instrument": "BTC_USDT_Perp",
        //                "is_buyer": true,
        //                "is_taker": false,
        //                "size": "0.001",
        //                "price": "90000.0",
        //                "mark_price": "90050.164063298",
        //                "index_price": "90089.803654938",
        //                "interest_rate": "0.0",
        //                "forward_price": "0.0",
        //                "realized_pnl": "0.0",
        //                "fee": "-0.00009",
        //                "fee_rate": "0.0",
        //                "trade_id": "65424692-2",
        //                "order_id": "0x01010105034cddc7000000006621285c",
        //                "venue": "ORDERBOOK",
        //                "client_order_id": "1375879248",
        //                "signer": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                "broker": "UNSPECIFIED",
        //                "is_rpi": false
        //            },
        //            ...
        //        ],
        //        "next": ""
        //    }
        //
        const result = this.safeList (response, 'result', []);
        return this.parseTrades (result, undefined, since, limit);
    }

    /**
     * @method
     * @name grvt#fetchPositions
     * @description fetch all open positions
     * @see https://api-docs.grvt.io/trading_api/#positions-request
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarketsAndSignIn ();
        const request = {
            'sub_account_id': this.getSubAccountId (params),
        };
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
            request['base'] = [];
            request['quote'] = [];
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.market (symbol);
                if (market['contract'] !== true) {
                    throw new BadRequest (this.id + ' fetchPositions() supports contract markets only');
                }
                request['base'].push (market['baseId']);
                request['quote'].push (market['quoteId']);
            }
        }
        const response = await this.privateTradingPostFullV1Positions (this.extend (request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "event_time": "1765258069092857642",
        //                "sub_account_id": "2147050003876484",
        //                "instrument": "BTC_USDT_Perp",
        //                "size": "0.001",
        //                "notional": "89.8169",
        //                "entry_price": "90000.0",
        //                "exit_price": "0.0",
        //                "mark_price": "89816.900008979",
        //                "unrealized_pnl": "-0.183099",
        //                "realized_pnl": "0.0",
        //                "total_pnl": "-0.183099",
        //                "roi": "-0.2034",
        //                "quote_index_price": "1.00017885",
        //                "est_liquidation_price": "77951.450008979",
        //                "leverage": "28.0",
        //                "cumulative_fee": "-0.00009",
        //                "cumulative_realized_funding_payment": "0.033862"
        //            }
        //        ]
        //    }
        //
        const result = this.safeList (response, 'result', []);
        return this.parsePositions (result, symbols);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        //            {
        //                "event_time": "1765258069092857642",
        //                "sub_account_id": "2147050003876484",
        //                "instrument": "BTC_USDT_Perp",
        //                "size": "0.001",
        //                "notional": "89.8169",
        //                "entry_price": "90000.0",
        //                "exit_price": "0.0",
        //                "mark_price": "89816.900008979",
        //                "unrealized_pnl": "-0.183099",
        //                "realized_pnl": "0.0",
        //                "total_pnl": "-0.183099",
        //                "roi": "-0.2034",
        //                "quote_index_price": "1.00017885",
        //                "est_liquidation_price": "77951.450008979",
        //                "leverage": "28.0",
        //                "cumulative_fee": "-0.00009",
        //                "cumulative_realized_funding_payment": "0.033862"
        //            }
        //
        const marketId = this.safeString (position, 'instrument');
        const timestamp = this.safeIntegerProduct (position, 'event_time', 0.000001);
        const sizeRaw = this.safeString (position, 'size');
        const isLong = (Precise.stringGe (sizeRaw, '0'));
        const side = isLong ? 'long' : 'short';
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': this.safeSymbol (marketId, market),
            'notional': this.parseNumber (Precise.stringAbs (this.safeString (position, 'notional'))),
            'marginMode': undefined,
            'liquidationPrice': this.safeNumber (position, 'est_liquidation_price'),
            'entryPrice': this.safeNumber (position, 'entry_price'),
            'unrealizedPnl': this.safeNumber (position, 'unrealized_pnl'),
            'realizedPnl': this.safeNumber (position, 'realized_pnl'),
            'percentage': undefined,
            'contracts': this.parseNumber (Precise.stringAbs (sizeRaw)),
            'markPrice': this.safeNumber (position, 'mark_price'),
            'lastPrice': undefined,
            'side': side,
            'hedged': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': this.safeInteger (position, 'lastUpdateTime'),
            'maintenanceMargin': this.safeNumber (position, 'maintenanceMargin'),
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': this.safeNumber (position, 'initialMargin'),
            'initialMarginPercentage': undefined,
            'leverage': this.safeNumber (position, 'leverage'),
            'marginRatio': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    /**
     * @method
     * @name grvt#fetchLeverages
     * @description fetch the set leverage for all contract markets
     * @see https://api-docs.grvt.io/trading_api/#get-all-initial-leverage
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    async fetchLeverages (symbols: Strings = undefined, params = {}): Promise<Leverages> {
        await this.loadMarketsAndSignIn ();
        const request: Dict = {
            'sub_account_id': this.getSubAccountId (params),
        };
        const response = await this.privateTradingPostFullV1GetAllInitialLeverage (this.extend (request, params));
        //
        //    {
        //        "results": [
        //            {
        //                "instrument": "AAVE_USDT_Perp",
        //                "leverage": "10.0",
        //                "min_leverage": "1.0",
        //                "max_leverage": "50.0",
        //                "margin_type": "CROSS"
        //            },
        //
        const results = this.safeList (response, 'results', []);
        return this.parseLeverages (results, symbols);
    }

    /**
     * @method
     * @name grvt#setLeverage
     * @description set the level of leverage for a market
     * @see https://api-docs.grvt.io/trading_api/#set-initial-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: int, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarketsAndSignIn ();
        const market = this.market (symbol);
        const request: Dict = {
            'sub_account_id': this.getSubAccountId (params),
            'instrument': market['id'],
            'leverage': this.numberToString (leverage),
        };
        const response = await this.privateTradingPostFullV1SetInitialLeverage (this.extend (request, params));
        //
        //    {
        //        "success": true
        //    }
        //
        return this.parseLeverage (response, market);
    }

    parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        //
        // setLeverage
        //
        //     {
        //         "success": true
        //     }
        //
        // fetchLeverages
        //
        //     {
        //         "instrument": "AAVE_USDT_Perp",
        //         "leverage": "10.0",
        //         "min_leverage": "1.0",
        //         "max_leverage": "50.0",
        //         "margin_type": "CROSS"
        //     }
        //
        const marketId = this.safeString (leverage, 'instrument');
        const leverageValue = this.safeNumber (leverage, 'leverage');
        const marginType = this.safeStringLower (leverage, 'margin_type');
        return {
            'info': leverage,
            'symbol': this.safeSymbol (marketId, market),
            'marginMode': marginType,
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        } as Leverage;
    }

    /**
     * @method
     * @name grvt#fetchMarginModes
     * @description fetches margin mode of the user
     * @see https://api-docs.grvt.io/trading_api/#get-all-initial-leverage
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [margin mode structures]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    async fetchMarginModes (symbols: Str[] = undefined, params = {}): Promise<MarginModes> {
        await this.loadMarketsAndSignIn ();
        const request: Dict = {
            'sub_account_id': this.getSubAccountId (params),
        };
        const response = await this.privateTradingPostFullV1GetAllInitialLeverage (this.extend (request, params));
        //
        //    {
        //        "results": [
        //            {
        //                "instrument": "AAVE_USDT_Perp",
        //                "leverage": "10.0",
        //                "min_leverage": "1.0",
        //                "max_leverage": "50.0",
        //                "margin_type": "CROSS"
        //            },
        //
        const results = this.safeList (response, 'results', []);
        return this.parseLeverages (results, symbols);
    }

    parseMarginMode (marginMode: Dict, market = undefined): MarginMode {
        //
        // fetchMarginModes
        //
        //            {
        //                "instrument": "AAVE_USDT_Perp",
        //                "leverage": "10.0",
        //                "min_leverage": "1.0",
        //                "max_leverage": "50.0",
        //                "margin_type": "CROSS"
        //            },
        //
        const marketId = this.safeString (marginMode, 'symbol');
        return {
            'info': marginMode,
            'symbol': this.safeSymbol (marketId, market),
            'marginMode': this.safeStringLower (marginMode, 'margin_type'),
        } as MarginMode;
    }

    /**
     * @method
     * @name grvt#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://api-docs.grvt.io/trading_api/#funding-payment-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarketsAndSignIn ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchFundingHistory', symbol, since, limit, params, 1000) as FundingHistory[];
        }
        let request = {
            'sub_account_id': this.getSubAccountId (params),
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['base'] = [];
            request['base'].push (market['baseId']);
            request['quote'] = [];
            request['quote'].push (market['quoteId']);
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        [ request, params ] = this.handleUntilOptionString ('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString (since * 1000000);
        }
        const response = await this.privateTradingPostFullV1FundingPaymentHistory (this.extend (request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "event_time": "1765267200004987902",
        //                "sub_account_id": "2147050003876484",
        //                "instrument": "BTC_USDT_Perp",
        //                "currency": "USDT",
        //                "amount": "-0.004522",
        //                "tx_id": "66625184"
        //            },
        //            ..
        //        ],
        //        "next": ""
        //    }
        //
        const result = this.safeList (response, 'result', []);
        return this.parseIncomes (result, market, since, limit);
    }

    parseIncome (income, market: Market = undefined) {
        //
        //            {
        //                "event_time": "1765267200004987902",
        //                "sub_account_id": "2147050003876484",
        //                "instrument": "BTC_USDT_Perp",
        //                "currency": "USDT",
        //                "amount": "-0.004522",
        //                "tx_id": "66625184"
        //            }
        //
        const marketId = this.safeString (income, 'instrument');
        const currencyId = this.safeString (income, 'currency');
        const timestamp = this.safeIntegerProduct (income, 'event_time', 0.000001);
        return {
            'info': income,
            'symbol': this.safeSymbol (marketId, market),
            'code': this.safeCurrencyCode (currencyId),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': this.safeString (income, 'tx_id'),
            'amount': this.safeNumber (income, 'amount'),
        };
    }

    /**
     * @method
     * @name grvt#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api-docs.grvt.io/trading_api/#order-history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarketsAndSignIn ();
        let request = {
            'sub_account_id': this.getSubAccountId (params),
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['base'] = [];
            request['base'].push (market['baseId']);
            request['quote'] = [];
            request['quote'].push (market['quoteId']);
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        [ request, params ] = this.handleUntilOptionString ('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString (since * 1000000);
        }
        const response = await this.privateTradingPostFullV1OrderHistory (this.extend (request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "order_id": "0x01010105034cddc7000000006621285c",
        //                "sub_account_id": "2147050003876484",
        //                "is_market": false,
        //                "time_in_force": "GOOD_TILL_TIME",
        //                "post_only": false,
        //                "reduce_only": false,
        //                "legs": [
        //                    {
        //                        "instrument": "BTC_USDT_Perp",
        //                        "size": "0.001",
        //                        "limit_price": "90000.0",
        //                        "is_buying_asset": true
        //                    }
        //                ],
        //                "signature": {
        //                    "signer": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                    "r": "0x2d567b0a04525baf0bbd792db3bb3a28c1bcc5e95936f6dc2515a28ad8529313",
        //                    "s": "0x0bc2468d96c819c8de005aa7bebfb58eecb34dd7a1bae1e81e74c7b8bc4cddc7",
        //                    "v": "27",
        //                    "expiration": "1767455222801000000",
        //                    "nonce": "1375879248",
        //                    "chain_id": "0"
        //                },
        //                "metadata": {
        //                    "client_order_id": "1375879248",
        //                    "create_time": "1764863234474424590",
        //                    "trigger": {
        //                        "trigger_type": "UNSPECIFIED",
        //                        "tpsl": {
        //                            "trigger_by": "UNSPECIFIED",
        //                            "trigger_price": "0.0",
        //                            "close_position": false
        //                        }
        //                    },
        //                    "broker": "UNSPECIFIED",
        //                    "is_position_transfer": false,
        //                    "allow_crossing": false
        //                },
        //                "state": {
        //                    "status": "FILLED",
        //                    "reject_reason": "UNSPECIFIED",
        //                    "book_size": [
        //                        "0.0"
        //                    ],
        //                    "traded_size": [
        //                        "0.001"
        //                    ],
        //                    "update_time": "1764945709704912003",
        //                    "avg_fill_price": [
        //                        "90000.0"
        //                    ]
        //                }
        //            },
        //            ...
        //        ],
        //        "next": ""
        //    }
        //
        const result = this.safeList (response, 'result', []);
        return this.parseOrders (result, market, since, limit);
    }

    /**
     * @method
     * @name grvt#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api-docs.grvt.io/trading_api/#open-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarketsAndSignIn ();
        const request = {
            'sub_account_id': this.getSubAccountId (params),
        };
        const response = await this.privateTradingPostFullV1OpenOrders (this.extend (request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "order_id": "0x0101010503e693410000000069530a7d",
        //                "sub_account_id": "2147050003876484",
        //                "is_market": false,
        //                "time_in_force": "GOOD_TILL_TIME",
        //                "post_only": false,
        //                "reduce_only": false,
        //                "legs": [
        //                    {
        //                        "instrument": "BTC_USDT_Perp",
        //                        "size": "0.002",
        //                        "limit_price": "88123.0",
        //                        "is_buying_asset": true
        //                    }
        //                ],
        //                "signature": {
        //                    "signer": "0x0982ebb82523fd20d1347d59f5a989ed84caa4b5",
        //                    "r": "0x22b13e5bc7c8d6793db9d0adf6a51340437292baf83aa4f89a01a3c0c1fef4a8",
        //                    "s": "0x46ecd483126c388cc933022979a9636670f64af3773d04a84ecbeac423e69341",
        //                    "v": "28",
        //                    "expiration": "1767871961406000000",
        //                    "nonce": "588129369",
        //                    "chain_id": "0"
        //                },
        //                "metadata": {
        //                    "client_order_id": "588129369",
        //                    "create_time": "1765279966899943792",
        //                    "trigger": {
        //                        "trigger_type": "UNSPECIFIED",
        //                        "tpsl": {
        //                            "trigger_by": "UNSPECIFIED",
        //                            "trigger_price": "0.0",
        //                            "close_position": false
        //                        }
        //                    },
        //                    "broker": "UNSPECIFIED",
        //                    "is_position_transfer": false,
        //                    "allow_crossing": false
        //                },
        //                "state": {
        //                    "status": "OPEN",
        //                    "reject_reason": "UNSPECIFIED",
        //                    "book_size": [
        //                        "0.002"
        //                    ],
        //                    "traded_size": [
        //                        "0.0"
        //                    ],
        //                    "update_time": "1765279966899943792",
        //                    "avg_fill_price": [
        //                        "0.0"
        //                    ]
        //                }
        //            }
        //        ]
        //    }
        //
        const result = this.safeList (response, 'result', []);
        return this.parseOrders (result, undefined, since, limit);
    }

    /**
     * @method
     * @name grvt#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api-docs.grvt.io/trading_api/#get-order
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarketsAndSignIn ();
        const request = {
            'sub_account_id': this.getSubAccountId (params),
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            params = this.omit (params, 'clientOrderId', 'client_order_id');
            request['client_order_id'] = clientOrderId;
        } else {
            request['order_id'] = id;
        }
        const response = await this.privateTradingPostFullV1Order (this.extend (request, params));
        //
        //    {
        //        "result": {
        //            "order_id": "0x01010105034cddc7000000006621285c",
        //            "sub_account_id": "2147050003876484",
        //            "is_market": false,
        //            "time_in_force": "GOOD_TILL_TIME",
        //            "post_only": false,
        //            "reduce_only": false,
        //            "legs": [
        //                {
        //                    "instrument": "BTC_USDT_Perp",
        //                    "size": "0.001",
        //                    "limit_price": "90000.0",
        //                    "is_buying_asset": true
        //                }
        //            ],
        //            "signature": {
        //                "signer": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                "r": "0x2d567b0a04525baf0bbd792db3bb3a28c1bcc5e95936f6dc2515a28ad8529313",
        //                "s": "0x0bc2468d96c819c8de005aa7bebfb58eecb34dd7a1bae1e81e74c7b8bc4cddc7",
        //                "v": "27",
        //                "expiration": "1767455222801000000",
        //                "nonce": "1375879248",
        //                "chain_id": "0"
        //            },
        //            "metadata": {
        //                "client_order_id": "1375879248",
        //                "create_time": "1764863234474424590",
        //                "trigger": {
        //                    "trigger_type": "UNSPECIFIED",
        //                    "tpsl": {
        //                        "trigger_by": "UNSPECIFIED",
        //                        "trigger_price": "0.0",
        //                        "close_position": false
        //                    }
        //                },
        //                "broker": "UNSPECIFIED",
        //                "is_position_transfer": false,
        //                "allow_crossing": false
        //            },
        //            "state": {
        //                "status": "FILLED",
        //                "reject_reason": "UNSPECIFIED",
        //                "book_size": [
        //                    "0.0"
        //                ],
        //                "traded_size": [
        //                    "0.001"
        //                ],
        //                "update_time": "1764945709704912003",
        //                "avg_fill_price": [
        //                    "90000.0"
        //                ]
        //            }
        //        }
        //    }
        //
        const result = this.safeDict (response, 'result', {});
        return this.parseOrder (result);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // fetchOrders, fetchOpenOrders, fetchOrder, createOrder
        //
        //           {
        //                "order_id": "0x0101010503e693410000000069530a7d",
        //                "sub_account_id": "2147050003876484",
        //                "is_market": false,
        //                "time_in_force": "GOOD_TILL_TIME",
        //                "post_only": false,
        //                "reduce_only": false,
        //                "legs": [
        //                    {
        //                        "instrument": "BTC_USDT_Perp",
        //                        "size": "0.002",
        //                        "limit_price": "88123.0",
        //                        "is_buying_asset": true
        //                    }
        //                ],
        //                "signature": {
        //                    "signer": "0x0982ebb82523fd20d1347d59f5a989ed84caa4b5",
        //                    "r": "0x22b13e5bc7c8d6793db9d0adf6a51340437292baf83aa4f89a01a3c0c1fef4a8",
        //                    "s": "0x46ecd483126c388cc933022979a9636670f64af3773d04a84ecbeac423e69341",
        //                    "v": "28",
        //                    "expiration": "1767871961406000000",
        //                    "nonce": "588129369",
        //                    "chain_id": "0"
        //                },
        //                "metadata": {
        //                    "client_order_id": "588129369",
        //                    "create_time": "1765279966899943792",
        //                    "trigger": {
        //                        "trigger_type": "UNSPECIFIED",
        //                        "tpsl": {
        //                            "trigger_by": "UNSPECIFIED",
        //                            "trigger_price": "0.0",
        //                            "close_position": false
        //                        }
        //                    },
        //                    "broker": "UNSPECIFIED",
        //                    "is_position_transfer": false,
        //                    "allow_crossing": false
        //                },
        //                "state": {
        //                    "status": "OPEN",
        //                    "reject_reason": "UNSPECIFIED",
        //                    "book_size": [
        //                        "0.002"
        //                    ],
        //                    "traded_size": [
        //                        "0.0"
        //                    ],
        //                    "update_time": "1765279966899943792",
        //                    "avg_fill_price": [
        //                        "0.0"
        //                    ]
        //                },
        //                "builder": "0x00",
        //                "builder_fee": "0.0"
        //            }
        //
        // cancelOrder, cancelAllOrders
        //
        //    {
        //        "ack": true
        //    }
        //
        if ('ack' in order) {
            return this.safeOrder ({
                'info': order,
                'id': undefined,
            });
        }
        const isMarket = this.safeString (order, 'is_market');
        const orderType = isMarket ? 'market' : 'limit';
        const isPostOnly = this.safeBool (order, 'post_only');
        const isReduceOnly = this.safeBool (order, 'reduce_only');
        const timeInForceRaw = this.safeString (order, 'time_in_force');
        const timeInForce = isPostOnly ? 'PO' : this.parseTimeInForce (timeInForceRaw);
        let size = undefined;
        let side = undefined;
        let price = undefined;
        let filled = undefined;
        let avgPrice = undefined;
        const legs = this.safeList (order, 'legs');
        const metadata = this.safeDict (order, 'metadata', {});
        const stateObj = this.safeDict (order, 'state', {});
        const filledAmounts = this.safeList (stateObj, 'traded_size', []);
        const avgPrices = this.safeList (stateObj, 'avg_fill_price', []);
        const primaryOrderIndex = 0;
        const firstLeg = this.safeDict (legs, primaryOrderIndex);
        if (firstLeg !== undefined) {
            const marketId = this.safeString (firstLeg, 'instrument');
            market = this.safeMarket (marketId, market);
            size = this.safeString (firstLeg, 'size');
            side = this.safeString (firstLeg, 'is_buying_asset') ? 'buy' : 'sell';
            price = this.safeString (firstLeg, 'limit_price');
            filled = this.safeString (filledAmounts, primaryOrderIndex);
            avgPrice = this.safeString (avgPrices, primaryOrderIndex);
        }
        const timestamp = this.safeIntegerProduct (metadata, 'create_time', 0.000001);
        // const triggerDetails = this.safeDict (metadata, 'trigger', {});
        const legsLength = legs.length;
        return this.safeOrder ({
            'isMultiLeg': (legsLength > 1),
            'id': this.safeString (order, 'order_id'),
            'clientOrderId': this.safeString (metadata, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimeStamp': undefined,
            'lastUpdateTimestamp': this.safeIntegerProduct (stateObj, 'update_time', 0.000001),
            'status': this.parseOrderStatus (this.safeString (stateObj, 'status')),
            'symbol': market['symbol'],
            'type': orderType,
            'timeInForce': timeInForce,
            'postOnly': isPostOnly,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'cost': undefined,
            'average': avgPrice,
            'amount': size,
            'filled': filled,
            'remaining': undefined,
            'trades': undefined,
            'fees': undefined,
            'reduceOnly': isReduceOnly,
            'info': order,
        }, market);
    }

    parseTimeInForce (type: Str): Str {
        const types: Dict = {
            'GOOD_TILL_TIME': 'GTC', // yeah, not GTD
            'IMMEDIATE_OR_CANCEL': 'IOC',
            'FILL_OR_KILL': 'FOK',
        };
        return this.safeStringUpper (types, type, type);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'PENDING': 'pending',
            'OPEN': 'open',
            'FILLED': 'closed',
            'REJECTED': 'rejected',
            'CANCELLED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name grvt#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://api-docs.grvt.io/trading_api/#cancel-all-orders
     * @param {string} symbol cancel alls open orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        await this.loadMarketsAndSignIn ();
        const request = {
            'sub_account_id': this.getSubAccountId (params),
        };
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['base'] = [];
            request['base'].push (market['baseId']);
            request['quote'] = [];
            request['quote'].push (market['quoteId']);
        }
        const response = await this.privateTradingPostFullV1CancelAllOrders (this.extend (request, params));
        //
        //    {
        //        "result": {
        //            "ack": true
        //        }
        //    }
        //
        const result = this.safeDict (response, 'result', {});
        return this.parseOrders ([ result ], undefined);
    }

    /**
     * @method
     * @name grvt#cancelOrder
     * @description cancels an open order
     * @see https://api-docs.grvt.io/trading_api/#cancel-order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        const request = {
            'sub_account_id': this.getSubAccountId (params),
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            params = this.omit (params, 'clientOrderId', 'client_order_id');
            request['client_order_id'] = clientOrderId;
        } else {
            request['order_id'] = id;
        }
        const response = await this.privateTradingPostFullV1CancelOrder (this.extend (request, params));
        //
        //    {
        //        "result": {
        //            "ack": true
        //        }
        //    }
        //
        const result = this.safeDict (response, 'result', {});
        return this.parseOrder (result);
    }

    async initializeClient (params = {}) {
        const buildFee = this.safeBool (this.options, 'builderFee', true);
        if (!buildFee) {
            return false; // skip if builder fee is not enabled
        }
        const approvedBuilderFee = this.safeBool (this.options, 'approvedBuilderFee', false);
        if (approvedBuilderFee) {
            return true; // skip if builder fee is already approved
        }
        const results = await Promise.all ([ this.privateTradingPostFullV1GetAuthorizedBuilders (), this.loadAggregatedAccountSummary () ]);
        //
        // {
        //     "results": [{
        //         "builder_account_id": "GRVT_MAIN_ACCOUNT_ID_HERE",
        //         "max_futures_fee_rate": 0.001,
        //         "max_spot_fee_rate": 0.0001
        //     }]
        // }
        //
        const currentBuilders = results[0];
        const result = this.safeList (currentBuilders, 'results', []);
        const length = result.length;
        let run = false;
        if (length <= 0) {
            run = true;
        }
        if (run) {
            try {
                const defaultFromAccountId = this.safeString (this.options, 'userMainAccountId'); // this.ethGetAddressFromPrivateKey (this.secret); // this.safeString (this.options, 'userMainAccountId');
                let request: Dict = {
                    'main_account_id': defaultFromAccountId,
                    'builder_account_id': this.safeString (this.options, 'builder'),
                    'max_futures_fee_rate': this.safeString (this.options, 'builderRate'),
                    'max_spot_fee_rate': this.safeString (this.options, 'builderRate'),
                    'signature': this.defaultSignature (),
                };
                request = this.createSignedRequest (request, 'EIP712_BUILDER_APPROVAL_TYPE');
                await this.privateTradingPostFullV1AuthorizeBuilder (this.extend (request, params));
                //
                // {
                //     "result": {
                //         "ack": "true"
                //     }
                // }
                //
                this.options['approvedBuilderFee'] = true;
            } catch (e) {
                this.options['builderFee'] = false; // disable builder fee if an error occurs
            }
            return true;
        }
    }

    eipDomainData () {
        //     GrvtEnv.DEV.value: 327,
        //     GrvtEnv.STAGING.value: 327,
        //     GrvtEnv.TESTNET.value: 326,
        //     GrvtEnv.PROD.value: 325,
        return {
            'name': 'GRVT Exchange',
            'version': '0',
            'chainId': 325,
        };
    }

    createSignedRequest (request: any, structureType: string, currencyObj = undefined, signerAddress: Str = undefined): Dict {
        let messageData = undefined;
        if (structureType === 'EIP712_TRANSFER_TYPE') {
            messageData = this.eipMessageForTransfer (request, currencyObj);
        } else if (structureType === 'EIP712_WITHDRAWAL_TYPE') {
            messageData = this.eipMessageForWithdrawal (request, currencyObj);
        } else if (structureType === 'EIP712_ORDER_TYPE' || structureType === 'EIP712_ORDER_WITH_BUILDER_TYPE') {
            messageData = this.eipMessageForOrder (request, structureType);
        } else if (structureType === 'EIP712_BUILDER_APPROVAL_TYPE') {
            messageData = this.eipMessageForBuilderApproval (request);
        }
        const domainData = this.eipDomainData ();
        const definitions = this.eipDefinitions ();
        const ethEncodedMessage = this.ethEncodeStructuredData (domainData, definitions[structureType], messageData);
        const ethEncodedMessageHashed = '0x' + this.hash (ethEncodedMessage, keccak, 'hex');
        const privateKeyWithoutZero = this.remove0xPrefix (this.secret);
        const signature = ecdsa (this.remove0xPrefix (ethEncodedMessageHashed), privateKeyWithoutZero, secp256k1);
        request['signature']['r'] = this.formatSignatureRS (signature['r']);
        request['signature']['s'] = this.formatSignatureRS (signature['s']);
        request['signature']['v'] = this.sum (27, signature['v']);
        request['signature']['signer'] = (signerAddress === undefined) ? this.ethGetAddressFromPrivateKey ('0x' + privateKeyWithoutZero) : signerAddress;
        return request;
    }

    formatSignatureRS (value: string) {
        const padded = value.padStart (64, '0');
        if (padded.startsWith ('0x')) {
            return padded;
        } else {
            return '0x' + padded;
        }
    }

    defaultSignature () {
        const expiration = this.milliseconds () * 1000000 + 1000000 * this.safeInteger (this.options, 'expirationSeconds', 30) * 1000;
        return {
            'signer': '',
            'r': '',
            's': '',
            'v': 0,
            'expiration': expiration.toString (),
            'nonce': this.nonce (),
            'chain_id': '325',
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        path = this.implodeParams (path, params);
        let url = this.urls['api'][api] + path;
        let queryString = '';
        if (method === 'GET') {
            if (Object.keys (query).length) {
                queryString = this.urlencode (query);
                url += '?' + queryString;
            }
        } else if (method === 'POST') {
            body = this.json (params);
        }
        const isPrivate = api.startsWith ('private');
        if (isPrivate) {
            this.checkRequiredCredentials ();
            if (queryString !== '') {
                path = path + '?' + queryString;
            }
            headers = {
                'Content-Type': 'application/json',
            };
            if (path === 'auth/api_key/login') {
                headers['Cookie'] = 'rm=true;';
            } else {
                const accountId = this.safeString (this.options, 'AuthAccountId');
                const cookieValue = this.safeString (this.options, 'AuthCookieValue');
                if (cookieValue === undefined || accountId === undefined) {
                    throw new AuthenticationError (this.id + ' : at first, you need to authenticate with exchange using signIn() method.');
                }
                headers['Cookie'] = cookieValue;
                headers['X-Grvt-Account-Id'] = accountId;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (url.endsWith ('auth/api_key/login')) {
            const accountId = this.safeString2 (headers, 'X-Grvt-Account-Id', 'x-grvt-account-id');
            this.options['AuthAccountId'] = accountId;
            const cookie = this.safeString2 (headers, 'Set-Cookie', 'set-cookie');
            if (cookie !== undefined) {
                const cookieValue = cookie.split (';')[0];
                this.options['AuthCookieValue'] = cookieValue;
            }
            if (this.options['AuthCookieValue'] === undefined || this.options['AuthAccountId'] === undefined) {
                throw new AuthenticationError (this.id + ' signIn() failed to receive auth-cookie or account-id');
            }
        } else {
            const errorCode = this.safeString (response, 'code');
            if (errorCode !== undefined) {
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                throw new ExchangeError (feedback);
            } else {
                const message = this.safeString (response, 'message');
                if (message !== undefined) {
                    const feedback = this.id + ' ' + body;
                    this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
                    throw new ExchangeError (feedback);
                } else {
                    const status = this.safeString (response, 'status');
                    if (status !== undefined && status !== 'success') {
                        const feedback = this.id + ' ' + body;
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
        return undefined;
    }
}
