'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { ExchangeError, InvalidOrder, BadRequest, InsufficientFunds, OrderNotFound, AuthenticationError, RateLimitExceeded, ExchangeNotAvailable, CancelPending, ArgumentsRequired, PermissionDenied, BadSymbol, DuplicateOrderId, BadResponse } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class ftx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ftx',
            'name': 'FTX',
            'countries': [ 'BS' ], // Bahamas
            //  hard limit of 7 requests per 200ms => 35 requests per 1000ms => 1000ms / 35 = 28.5714 ms between requests
            // 10 withdrawal requests per 30 seconds = (1000ms / rateLimit) / (1/3) = 90.1
            // cancels do not count towards rateLimit
            // only 'order-making' requests count towards ratelimit
            'rateLimit': 28.57,
            'certified': false,
            'pro': true,
            'hostname': 'ftx.com', // or ftx.us
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/67149189-df896480-f2b0-11e9-8816-41593e17f9ec.jpg',
                'www': 'https://ftx.com',
                'api': {
                    'public': 'https://{hostname}',
                    'private': 'https://{hostname}',
                },
                'doc': 'https://github.com/ftexchange/ftx',
                'fees': 'https://ftexchange.zendesk.com/hc/en-us/articles/360024479432-Fees',
                'referral': {
                    'url': 'https://ftx.com/referrals#a=1623029',
                    'discount': 0.05,
                },
            },
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowInterest': true,
                'fetchBorrowRate': true,
                'fetchBorrowRateHistories': true,
                'fetchBorrowRateHistory': true,
                'fetchBorrowRates': true,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': true,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactionFees': undefined,
                'fetchTransfer': undefined,
                'fetchTransfers': undefined,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': true,
                'setMarginMode': false, // FTX only supports cross margin
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '15s': '15',
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '1h': '3600',
                '4h': '14400',
                '1d': '86400',
                '3d': '259200',
                '1w': '604800',
                '2w': '1209600',
                // the exchange does not align candles to the start of the month
                // it can only fetch candles in fixed intervals of multiples of whole days
                // that works for all timeframes, except the monthly timeframe
                // because months have varying numbers of days
                '1M': '2592000',
            },
            'api': {
                'public': {
                    'get': {
                        'coins': 1,
                        // markets
                        'markets': 1,
                        'markets/{market_name}': 1,
                        'markets/{market_name}/orderbook': 1, // ?depth={depth}
                        'markets/{market_name}/trades': 1, // ?limit={limit}&start_time={start_time}&end_time={end_time}
                        'markets/{market_name}/candles': 1, // ?resolution={resolution}&limit={limit}&start_time={start_time}&end_time={end_time}
                        // futures
                        'futures': 1,
                        'futures/{future_name}': 1,
                        'futures/{future_name}/stats': 1,
                        'funding_rates': 1,
                        'indexes/{index_name}/weights': 1,
                        'expired_futures': 1,
                        'indexes/{market_name}/candles': 1, // ?resolution={resolution}&limit={limit}&start_time={start_time}&end_time={end_time}
                        // wallet
                        'wallet/coins': 1,
                        // leverage tokens
                        'lt/tokens': 1,
                        'lt/{token_name}': 1,
                        // etfs
                        'etfs/rebalance_info': 1,
                        // options
                        'options/requests': 1,
                        'options/trades': 1,
                        'options/historical_volumes/BTC': 1,
                        'stats/24h_options_volume': 1,
                        'options/open_interest/BTC': 1,
                        'options/historical_open_interest/BTC': 1,
                        // spot margin
                        'spot_margin/history': 1,
                        'spot_margin/borrow_summary': 1,
                        // nfts
                        'nft/nfts': 1,
                        'nft/{nft_id}': 1,
                        'nft/{nft_id}/trades': 1,
                        'nft/all_trades': 1,
                        'nft/{nft_id}/account_info': 1,
                        'nft/collections': 1,
                        // ftx pay
                        'ftxpay/apps/{user_specific_id}/details': 1,
                    },
                    'post': {
                        'ftxpay/apps/{user_specific_id}/orders': 1,
                    },
                },
                'private': {
                    'get': {
                        // subaccounts
                        'subaccounts': 1,
                        'subaccounts/{nickname}/balances': 1,
                        // account
                        'account': 1,
                        'positions': 1,
                        // wallet
                        'wallet/balances': 1,
                        'wallet/all_balances': 1,
                        'wallet/deposit_address/{coin}': 1, // ?method={method}
                        'wallet/deposits': 1,
                        'wallet/withdrawals': 1,
                        'wallet/airdrops': 1,
                        'wallet/withdrawal_fee': 1,
                        'wallet/saved_addresses': 1,
                        // orders
                        'orders': 1, // ?market={market}
                        'orders/history': 1, // ?market={market}
                        'orders/{order_id}': 1,
                        'orders/by_client_id/{client_order_id}': 1,
                        // conditional orders
                        'conditional_orders': 1, // ?market={market}
                        'conditional_orders/{conditional_order_id}/triggers': 1,
                        'conditional_orders/history': 1, // ?market={market}
                        'fills': 1, // ?market={market}
                        'funding_payments': 1,
                        // leverage tokens
                        'lt/balances': 1,
                        'lt/creations': 1,
                        'lt/redemptions': 1,
                        // options
                        'options/my_requests': 1,
                        'options/requests/{request_id}/quotes': 1,
                        'options/my_quotes': 1,
                        'options/account_info': 1,
                        'options/positions': 1,
                        'options/fills': 1,
                        // staking
                        'staking/stakes': 1,
                        'staking/unstake_requests': 1,
                        'staking/balances': 1,
                        'staking/staking_rewards': 1,
                        // otc
                        'otc/quotes/{quoteId}': 1,
                        // spot margin
                        'spot_margin/borrow_rates': 1,
                        'spot_margin/lending_rates': 1,
                        'spot_margin/market_info': 1, // ?market={market}
                        'spot_margin/borrow_history': 1,
                        'spot_margin/lending_history': 1,
                        'spot_margin/offers': 1,
                        'spot_margin/lending_info': 1,
                        // nfts
                        'nft/balances': 1,
                        'nft/bids': 1,
                        'nft/deposits': 1,
                        'nft/withdrawals': 1,
                        'nft/fills': 1,
                        'nft/gallery/{gallery_id}': 1,
                        'nft/gallery_settings': 1,
                        // latency statistics
                        'stats/latency_stats': 1,
                        // pnl
                        'pnl/historical_changes': 1,
                        // support tickets
                        'support/tickets': 1,
                        'support/tickets/{ticketId}/messages': 1,
                        'support/tickets/count_unread': 1,
                        'twap_orders': 1,
                        'twap_orders/{twap_order_id}': 1,
                        'historical_balances/requests': 1,
                        'historical_balances/requests/{request_id}': 1,
                        'fast_access_settings/list_ips': 1,
                    },
                    'post': {
                        // subaccounts
                        'subaccounts': 1,
                        'subaccounts/update_name': 1,
                        'subaccounts/transfer': 1,
                        // account
                        'account/leverage': 1,
                        // wallet
                        'wallet/deposit_address/list': 1,
                        'wallet/withdrawals': 90,
                        'wallet/saved_addresses': 1,
                        // orders
                        'orders': 1,
                        'conditional_orders': 1,
                        'orders/{order_id}/modify': 1,
                        'orders/by_client_id/{client_order_id}/modify': 1,
                        'conditional_orders/{order_id}/modify': 1,
                        // leverage tokens
                        'lt/{token_name}/create': 1,
                        'lt/{token_name}/redeem': 1,
                        // options
                        'options/requests': 1,
                        'options/requests/{request_id}/quotes': 1,
                        'options/quotes/{quote_id}/accept': 1,
                        // staking
                        'staking/unstake_requests': 1,
                        'srm_stakes/stakes': 1,
                        // otc
                        'otc/quotes/{quote_id}/accept': 1,
                        'otc/quotes': 1,
                        // spot margin
                        'spot_margin/offers': 1,
                        // nfts
                        'nft/offer': 1,
                        'nft/buy': 1,
                        'nft/auction': 1,
                        'nft/edit_auction': 1,
                        'nft/cancel_auction': 1,
                        'nft/bids': 1,
                        'nft/redeem': 1,
                        'nft/gallery_settings': 1,
                        // ftx pay
                        'ftxpay/apps/{user_specific_id}/orders': 1,
                        // support tickets
                        'support/tickets': 1,
                        'support/tickets/{ticketId}/messages': 1,
                        'support/tickets/{ticketId}/status': 1,
                        'support/tickets/{ticketId}/mark_as_read': 1,
                        'twap_orders': 1,
                        'historical_balances/requests': 1,
                        'fast_access_settings/add_ip': 1,
                        'fast_access_settings/enable_ip/{ipAddress}': 1,
                        'fast_access_settings/disable_ip/{ipAddress}': 1,
                    },
                    'delete': {
                        // subaccounts
                        'subaccounts': 1,
                        // wallet
                        'wallet/saved_addresses/{saved_address_id}': 1,
                        // orders
                        'orders/{order_id}': 1,
                        'orders/by_client_id/{client_order_id}': 1,
                        'orders': 1,
                        'conditional_orders/{order_id}': 1,
                        'bulk_orders': 1,
                        'bulk_orders_by_client_id': 1,
                        // options
                        'options/requests/{request_id}': 1,
                        'options/quotes/{quote_id}': 1,
                        // staking
                        'staking/unstake_requests/{request_id}': 1,
                        'twap_orders/{twap_order_id}': 1,
                        'fast_access_settings/delete_ip/{ipAddress}': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0007'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('2000000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.00055') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.0045') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.0004') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('2000000'), this.parseNumber ('0.00015') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0001') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.00005') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0') ],
                        ],
                    },
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'exceptions': {
                'exact': {
                    'Slow down': RateLimitExceeded, // {"error":"Slow down","success":false}
                    'Size too small for provide': InvalidOrder, // {"error":"Size too small for provide","success":false}
                    'Not enough balances': InsufficientFunds, // {"error":"Not enough balances","success":false}
                    'InvalidPrice': InvalidOrder, // {"error":"Invalid price","success":false}
                    'Size too small': InvalidOrder, // {"error":"Size too small","success":false}
                    'Size too large': InvalidOrder, // {"error":"Size too large","success":false}
                    'Invalid price': InvalidOrder, // {"success":false,"error":"Invalid price"}
                    'Missing parameter price': InvalidOrder, // {"error":"Missing parameter price","success":false}
                    'Order not found': OrderNotFound, // {"error":"Order not found","success":false}
                    'Order already closed': InvalidOrder, // {"error":"Order already closed","success":false}
                    'Trigger price too high': InvalidOrder, // {"error":"Trigger price too high","success":false}
                    'Trigger price too low': InvalidOrder, // {"error":"Trigger price too low","success":false}
                    'Order already queued for cancellation': CancelPending, // {"error":"Order already queued for cancellation","success":false}
                    'Duplicate client order ID': DuplicateOrderId, // {"error":"Duplicate client order ID","success":false}
                    'Spot orders cannot be reduce-only': InvalidOrder, // {"error":"Spot orders cannot be reduce-only","success":false}
                    'Invalid reduce-only order': InvalidOrder, // {"error":"Invalid reduce-only order","success":false}
                    'Account does not have enough balances': InsufficientFunds, // {"success":false,"error":"Account does not have enough balances"}
                    'Not authorized for subaccount-specific access': PermissionDenied, // {"success":false,"error":"Not authorized for subaccount-specific access"}
                    'Not approved to trade this product': PermissionDenied, // {"success":false,"error":"Not approved to trade this product"}
                    'Internal Error': ExchangeNotAvailable, // {"success":false,"error":"Internal Error"}
                    'Order took too long to process': ExchangeNotAvailable, // {"success":false,"error":"Order took too long to process"}
                },
                'broad': {
                    // {"error":"Not logged in","success":false}
                    // {"error":"Not logged in: Invalid API key","success":false}
                    'Not logged in': AuthenticationError,
                    'Account does not have enough margin for order': InsufficientFunds,
                    'Invalid parameter': BadRequest, // {"error":"Invalid parameter start_time","success":false}
                    'The requested URL was not found on the server': BadRequest,
                    'No such coin': BadRequest,
                    'No such subaccount': AuthenticationError,
                    'No such future': BadSymbol,
                    'No such market': BadSymbol,
                    'Do not send more than': RateLimitExceeded,
                    'Cannot send more than': RateLimitExceeded, // {"success":false,"error":"Cannot send more than 1500 requests per minute"}
                    'An unexpected error occurred': ExchangeNotAvailable, // {"error":"An unexpected error occurred, please try again later (58BC21C795).","success":false}
                    'Please retry request': ExchangeNotAvailable, // {"error":"Please retry request","success":false}
                    'Please try again': ExchangeNotAvailable, // {"error":"Please try again","success":false}
                    'Try again': ExchangeNotAvailable, // {"error":"Try again","success":false}
                    'Only have permissions for subaccount': PermissionDenied, // {"success":false,"error":"Only have permissions for subaccount *sub_name*"}
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                // support for canceling conditional orders
                // https://github.com/ccxt/ccxt/issues/6669
                'fetchMarkets': {
                    // the expiry datetime may be undefined for expiring futures, https://github.com/ccxt/ccxt/pull/12692
                    'throwOnUndefinedExpiry': false,
                },
                'cancelOrder': {
                    'method': 'privateDeleteOrdersOrderId', // privateDeleteConditionalOrdersOrderId
                },
                'fetchOpenOrders': {
                    'method': 'privateGetOrders', // privateGetConditionalOrders
                },
                'fetchOrders': {
                    'method': 'privateGetOrdersHistory', // privateGetConditionalOrdersHistory
                },
                'sign': {
                    'ftx.com': 'FTX',
                    'ftx.us': 'FTXUS',
                },
                'networks': {
                    'AVAX': 'avax',
                    'BEP2': 'bep2',
                    'BEP20': 'bsc',
                    'BNB': 'bep2',
                    'BSC': 'bsc',
                    'ERC20': 'erc20',
                    'ETH': 'eth',
                    'FTM': 'ftm',
                    'MATIC': 'matic',
                    'OMNI': 'omni',
                    'SOL': 'sol',
                    'SPL': 'sol',
                    'TRC20': 'trx',
                    'TRX': 'trx',
                },
            },
            'commonCurrencies': {
                'AMC': 'AMC Entertainment Holdings',
                'STARS': 'StarLaunch',
            },
        });
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name ftx#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetCoins (params);
        const currencies = this.safeValue (response, 'result', []);
        //
        //     {
        //         "success":true,
        //         "result": [
        //             {"id":"BTC","name":"Bitcoin"},
        //             {"id":"ETH","name":"Ethereum"},
        //             {"id":"ETHMOON","name":"10X Long Ethereum Token","underlying":"ETH"},
        //             {"id":"EOSBULL","name":"3X Long EOS Token","underlying":"EOS"},
        //         ],
        //     }
        //
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': undefined,
                'name': name,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'withdraw': { 'min': undefined, 'max': undefined },
                    'amount': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name ftx#fetchMarkets
         * @description retrieves data on all markets for ftx
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         'success': true,
        //         "result": [
        //             {
        //                 "ask":170.37,
        //                 "baseCurrency":null,
        //                 "bid":170.31,
        //                 "change1h":-0.019001554672655036,
        //                 "change24h":-0.024841165359738997,
        //                 "changeBod":-0.03816406029469881,
        //                 "enabled":true,
        //                 "last":170.37,
        //                 "name":"ETH-PERP",
        //                 "price":170.37,
        //                 "priceIncrement":0.01,
        //                 "quoteCurrency":null,
        //                 "quoteVolume24h":7742164.59889,
        //                 "sizeIncrement":0.001,
        //                 "type":"future",
        //                 "underlying":"ETH",
        //                 "volumeUsd24h":7742164.59889
        //             },
        //             {
        //                 "ask":170.44,
        //                 "baseCurrency":"ETH",
        //                 "bid":170.41,
        //                 "change1h":-0.018485459257126403,
        //                 "change24h":-0.023825887743413515,
        //                 "changeBod":-0.037605872388481086,
        //                 "enabled":true,
        //                 "last":172.72,
        //                 "name":"ETH/USD",
        //                 "price":170.44,
        //                 "priceIncrement":0.01,
        //                 "quoteCurrency":"USD",
        //                 "quoteVolume24h":382802.0252,
        //                 "sizeIncrement":0.001,
        //                 "type":"spot",
        //                 "underlying":null,
        //                 "volumeUsd24h":382802.0252
        //             },
        //         ],
        //     }
        //
        //     {
        //         name: "BTC-PERP",
        //         enabled:  true,
        //         postOnly:  false,
        //         priceIncrement: "1.0",
        //         sizeIncrement: "0.0001",
        //         minProvideSize: "0.001",
        //         last: "60397.0",
        //         bid: "60387.0",
        //         ask: "60388.0",
        //         price: "60388.0",
        //         type: "future",
        //         baseCurrency:  null,
        //         quoteCurrency:  null,
        //         underlying: "BTC",
        //         restricted:  false,
        //         highLeverageFeeExempt:  true,
        //         change1h: "-0.0036463231533270636",
        //         change24h: "-0.01844838515677064",
        //         changeBod: "-0.010130151132675475",
        //         quoteVolume24h: "2892083192.6099",
        //         volumeUsd24h: "2892083192.6099"
        //     }
        //
        let allFuturesResponse = undefined;
        if (this.has['future'] && (this.hostname !== 'ftx.us')) {
            allFuturesResponse = await this.publicGetFutures ();
        }
        //
        //    {
        //        success: true,
        //        result: [
        //            {
        //                name: "1INCH-PERP",
        //                underlying: "1INCH",
        //                description: "1INCH Token Perpetual Futures",
        //                type: "perpetual",
        //                expiry: null,
        //                perpetual: true,
        //                expired: false,
        //                enabled: true,
        //                postOnly: false,
        //                priceIncrement: "0.0001",
        //                sizeIncrement: "1.0",
        //                last: "2.5556",
        //                bid: "2.5555",
        //                ask: "2.5563",
        //                index: "2.5612449804010833",
        //                mark: "2.5587",
        //                imfFactor: "0.0005",
        //                lowerBound: "2.4315",
        //                upperBound: "2.6893",
        //                underlyingDescription: "1INCH Token",
        //                expiryDescription: "Perpetual",
        //                moveStart: null,
        //                marginPrice: "2.5587",
        //                positionLimitWeight: "20.0",
        //                group: "perpetual",
        //                change1h: "0.00799716356760164",
        //                change24h: "0.004909276569004792",
        //                changeBod: "0.008394419484511705",
        //                volumeUsd24h: "17834492.0818",
        //                volume: "7224898.0",
        //                openInterest: "5597917.0",
        //                openInterestUsd: "14323390.2279",
        //            },
        //            ...
        //        ],
        //    }
        //
        const result = [];
        const markets = this.safeValue (response, 'result', []);
        const allFutures = this.safeValue (allFuturesResponse, 'result', []);
        const allFuturesDict = this.indexBy (allFutures, 'name');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const future = this.safeValue (allFuturesDict, id);
            const marketType = this.safeString (market, 'type');
            const contract = (marketType === 'future');
            const baseId = this.safeString2 (market, 'baseCurrency', 'underlying');
            const quoteId = this.safeString (market, 'quoteCurrency', 'USD');
            const settleId = contract ? 'USD' : undefined;
            let base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const spot = !contract;
            const margin = !contract;
            const perpetual = this.safeValue (future, 'perpetual', false);
            const swap = perpetual;
            const option = false;
            const isFuture = contract && !swap;
            let expiry = undefined;
            const expiryDatetime = this.safeString (future, 'expiry');
            let type = 'spot';
            let symbol = base + '/' + quote;
            if (swap) {
                type = 'swap';
                symbol = base + '/' + quote + ':' + settle;
            } else if (isFuture) {
                type = 'future';
                expiry = this.parse8601 (expiryDatetime);
                if (expiry === undefined) {
                    // it is likely a future that is expiring in this moment
                    const options = this.safeValue (this.options, 'fetchMarkets', {});
                    const throwOnUndefinedExpiry = this.safeValue (options, 'throwOnUndefinedExpiry', false);
                    if (throwOnUndefinedExpiry) {
                        throw new BadResponse (this.id + " symbol '" + id + "' is a future contract with an invalid expiry datetime.");
                    } else {
                        continue;
                    }
                }
                const parsedId = id.split ('-');
                const length = parsedId.length;
                if (length > 2) {
                    // handling for MOVE contracts
                    // BTC-MOVE-2022Q1
                    // BTC-MOVE-0106
                    // BTC-MOVE-WK-0121
                    parsedId.pop ();
                    // remove expiry
                    // [ 'BTC', 'MOVE' ]
                    // [ 'BTC', 'MOVE' ]
                    // [ 'BTC', 'MOVE', 'WK' ]
                    base = parsedId.join ('-');
                }
                symbol = base + '/' + quote + ':' + settle + '-' + this.yymmdd (expiry, '');
            }
            // check if a market is a spot or future market
            const sizeIncrement = this.safeString (market, 'sizeIncrement');
            const minProvideSize = this.safeString (market, 'minProvideSize');
            let minAmountString = sizeIncrement;
            if (minProvideSize !== undefined) {
                minAmountString = Precise.stringGt (minProvideSize, sizeIncrement) ? sizeIncrement : minProvideSize;
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': spot,
                'margin': margin,
                'swap': swap,
                'future': isFuture,
                'option': option,
                'active': this.safeValue (market, 'enabled'),
                'contract': contract,
                'linear': contract ? true : undefined,
                'inverse': contract ? false : undefined,
                'contractSize': this.parseNumber ('1'),
                'expiry': expiry,
                'expiryDatetime': this.iso8601 (expiry),
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (sizeIncrement),
                    'price': this.safeNumber (market, 'priceIncrement'),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': this.parseNumber ('20'),
                    },
                    'amount': {
                        'min': this.parseNumber (minAmountString),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
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

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "ask":171.29,
        //         "baseCurrency":null, // base currency for spot markets
        //         "bid":171.24,
        //         "change1h":-0.0012244897959183673,
        //         "change24h":-0.031603346901854366,
        //         "changeBod":-0.03297013492914808,
        //         "enabled":true,
        //         "last":171.44,
        //         "name":"ETH-PERP",
        //         "price":171.29,
        //         "priceIncrement":0.01,
        //         "quoteCurrency":null, // quote currency for spot markets
        //         "quoteVolume24h":8570651.12113,
        //         "sizeIncrement":0.001,
        //         "type":"future",
        //         "underlying":"ETH", // null for spot markets
        //         "volumeUsd24h":8570651.12113,
        //     }
        //
        const marketId = this.safeString (ticker, 'name');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'last');
        const timestamp = this.safeTimestamp (ticker, 'time');
        let percentage = this.safeString (ticker, 'change24h');
        if (percentage !== undefined) {
            percentage = Precise.stringMul (percentage, '100');
        }
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': this.safeString (ticker, 'bidSize'),
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': this.safeString (ticker, 'askSize'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeString (ticker, 'quoteVolume24h'),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name ftx#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_name': market['id'],
        };
        const response = await this.publicGetMarketsMarketName (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "result":{
        //             "ask":171.29,
        //             "baseCurrency":null, // base currency for spot markets
        //             "bid":171.24,
        //             "change1h":-0.0012244897959183673,
        //             "change24h":-0.031603346901854366,
        //             "changeBod":-0.03297013492914808,
        //             "enabled":true,
        //             "last":171.44,
        //             "name":"ETH-PERP",
        //             "price":171.29,
        //             "priceIncrement":0.01,
        //             "quoteCurrency":null, // quote currency for spot markets
        //             "quoteVolume24h":8570651.12113,
        //             "sizeIncrement":0.001,
        //             "type":"future",
        //             "underlying":"ETH", // null for spot markets
        //             "volumeUsd24h":8570651.12113,
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTicker (result, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         'success': true,
        //         "result": [
        //             {
        //                 "ask":170.44,
        //                 "baseCurrency":"ETH",
        //                 "bid":170.41,
        //                 "change1h":-0.018485459257126403,
        //                 "change24h":-0.023825887743413515,
        //                 "changeBod":-0.037605872388481086,
        //                 "enabled":true,
        //                 "last":172.72,
        //                 "name":"ETH/USD",
        //                 "price":170.44,
        //                 "priceIncrement":0.01,
        //                 "quoteCurrency":"USD",
        //                 "quoteVolume24h":382802.0252,
        //                 "sizeIncrement":0.001,
        //                 "type":"spot",
        //                 "underlying":null,
        //                 "volumeUsd24h":382802.0252
        //             },
        //         ],
        //     }
        //
        const tickers = this.safeValue (response, 'result', []);
        return this.parseTickers (tickers, symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_name': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit; // max 100, default 20
        }
        const response = await this.publicGetMarketsMarketNameOrderbook (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "result":{
        //             "asks":[
        //                 [171.95,279.865],
        //                 [171.98,102.42],
        //                 [171.99,124.11],
        //             ],
        //             "bids":[
        //                 [171.93,69.749],
        //                 [171.9,288.325],
        //                 [171.88,87.47],
        //             ],
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrderBook (result, symbol);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "close":177.23,
        //         "high":177.45,
        //         "low":177.2,
        //         "open":177.43,
        //         "startTime":"2019-10-17T13:27:00+00:00",
        //         "time":1571318820000.0,
        //         "volume":0.0
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    getMarketId (symbol, key, params = {}) {
        const parts = this.getMarketParams (symbol, key, params);
        return this.safeString (parts, 1, symbol);
    }

    getMarketParams (symbol, key, params = {}) {
        let market = undefined;
        let marketId = undefined;
        if (symbol in this.markets) {
            market = this.market (symbol);
            marketId = market['id'];
        } else {
            marketId = this.safeString (params, key, symbol);
        }
        return [ market, marketId ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @param {string|undefined} params.price "index" for index price candles
         * @param {int|undefined} params.until timestamp in ms of the latest candle to fetch
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume (units in quote currency)
         */
        await this.loadMarkets ();
        const [ market, marketId ] = this.getMarketParams (symbol, 'market_name', params);
        // max 1501 candles, including the current candle when since is not specified
        const maxLimit = 5000;
        const defaultLimit = 1500;
        limit = (limit === undefined) ? defaultLimit : Math.min (limit, maxLimit);
        const request = {
            'resolution': this.timeframes[timeframe],
            'market_name': marketId,
            // 'start_time': parseInt (since / 1000),
            // 'end_time': this.seconds (),
            'limit': limit,
        };
        const price = this.safeString (params, 'price');
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, [ 'price', 'until' ]);
        if (since !== undefined) {
            const startTime = parseInt (since / 1000);
            request['start_time'] = startTime;
            const duration = this.parseTimeframe (timeframe);
            const endTime = this.sum (startTime, limit * duration);
            request['end_time'] = Math.min (endTime, this.seconds ());
            if (duration > 86400) {
                const wholeDaysInTimeframe = parseInt (duration / 86400);
                request['limit'] = Math.min (limit * wholeDaysInTimeframe, maxLimit);
            }
        }
        if (until !== undefined) {
            request['end_time'] = parseInt (until / 1000);
        }
        let method = 'publicGetMarketsMarketNameCandles';
        if (price === 'index') {
            if (symbol in this.markets) {
                request['market_name'] = market['baseId'];
            }
            method = 'publicGetIndexesMarketNameCandles';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result":[
        //             {
        //                 "close":177.23,
        //                 "high":177.45,
        //                 "low":177.2,
        //                 "open":177.43,
        //                 "startTime":"2019-10-17T13:27:00+00:00",
        //                 "time":1571318820000.0,
        //                 "volume":0.0
        //             },
        //             {
        //                 "close":177.26,
        //                 "high":177.33,
        //                 "low":177.23,
        //                 "open":177.23,
        //                 "startTime":"2019-10-17T13:28:00+00:00",
        //                 "time":1571318880000.0,
        //                 "volume":0.0
        //             },
        //         ],
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id":1715826,
        //         "liquidation":false,
        //         "price":171.62,
        //         "side":"buy",
        //         "size":2.095,
        //         "time":"2019-10-18T12:59:54.288166+00:00"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "fee": 20.1374935,
        //         "feeRate": 0.0005,
        //         "feeCurrency": "USD",
        //         "future": "EOS-0329",
        //         "id": 11215,
        //         "liquidity": "taker",
        //         "market": "EOS-0329",
        //         "baseCurrency": null,
        //         "quoteCurrency": null,
        //         "orderId": 8436981,
        //         "price": 4.201,
        //         "side": "buy",
        //         "size": 9587,
        //         "time": "2019-03-27T19:15:10.204619+00:00",
        //         "type": "order"
        //     }
        //
        //     {
        //         "baseCurrency": "BTC",
        //         "fee": 0,
        //         "feeCurrency": "USD",
        //         "feeRate": 0,
        //         "future": null,
        //         "id": 664079556,
        //         "liquidity": "taker",
        //         "market": null,
        //         "orderId": null,
        //         "price": 34830.61359,
        //         "quoteCurrency": "USD",
        //         "side": "sell",
        //         "size": 0.0005996,
        //         "time": "2021-01-15T16:05:29.246135+00:00",
        //         "tradeId": null,
        //         "type": "otc"
        //     }
        //
        //     with -ve fee
        //     {
        //         "id": 1171258927,
        //         "fee": -0.0000713875,
        //         "side": "sell",
        //         "size": 1,
        //         "time": "2021-03-11T13:34:35.523627+00:00",
        //         "type": "order",
        //         "price": 14.2775,
        //         "future": null,
        //         "market": "SOL/USD",
        //         "feeRate": -0.000005,
        //         "orderId": 33182929044,
        //         "tradeId": 582936801,
        //         "liquidity": "maker",
        //         "feeCurrency": "USD",
        //         "baseCurrency": "SOL",
        //         "quoteCurrency": "USD"
        //     }
        //
        //     // from OTC order
        //     {
        //         "id": 1172129651,
        //         "fee": 0,
        //         "side": "sell",
        //         "size": 1.47568846,
        //         "time": "2021-03-11T15:04:46.893383+00:00",
        //         "type": "otc",
        //         "price": 14.60932598,
        //         "future": null,
        //         "market": null,
        //         "feeRate": 0,
        //         "orderId": null,
        //         "tradeId": null,
        //         "liquidity": "taker",
        //         "feeCurrency": "USD",
        //         "baseCurrency": "BCHA",
        //         "quoteCurrency": "USD"
        //     }
        //
        const id = this.safeString (trade, 'id');
        const takerOrMaker = this.safeString (trade, 'liquidity');
        // a workaround for the OTC trades, they don't have a symbol
        const baseId = this.safeString (trade, 'baseCurrency');
        const quoteId = this.safeString (trade, 'quoteCurrency');
        let defaultMarketId = undefined;
        if ((baseId !== undefined) && (quoteId !== undefined)) {
            defaultMarketId = baseId + '/' + quoteId;
        }
        const marketId = this.safeString (trade, 'market', defaultMarketId);
        market = this.safeMarket (marketId, market, '/');
        const symbol = market['symbol'];
        const timestamp = this.parse8601 (this.safeString (trade, 'time'));
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'size');
        const side = this.safeString (trade, 'side');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
                'rate': this.safeString (trade, 'feeRate'),
            };
        }
        const orderId = this.safeString (trade, 'orderId');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const [ market, marketId ] = this.getMarketParams (symbol, 'market_name', params);
        const request = {
            'market_name': marketId,
        };
        if (since !== undefined) {
            // the exchange aligns results to end_time returning 5000 trades max
            // the user must set the end_time (in seconds) close enough to start_time
            // for a proper pagination, fetch the most recent trades first
            // then set the end_time parameter to the timestamp of the last trade
            // start_time and end_time must be in seconds, divided by a thousand
            request['start_time'] = parseInt (since / 1000);
            // start_time doesn't work without end_time
            request['end_time'] = this.seconds ();
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketsMarketNameTrades (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "result":[
        //             {
        //                 "id":1715826,
        //                 "liquidation":false,
        //                 "price":171.62,
        //                 "side":"buy",
        //                 "size":2.095,
        //                 "time":"2019-10-18T12:59:54.288166+00:00"
        //             },
        //             {
        //                 "id":1715763,
        //                 "liquidation":false,
        //                 "price":171.89,
        //                 "side":"sell",
        //                 "size":1.477,
        //                 "time":"2019-10-18T12:58:38.443734+00:00"
        //             },
        //         ],
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    parseTradingFee (fee, market = undefined) {
        //
        //     {
        //         "backstopProvider": true,
        //         "collateral": 3568181.02691129,
        //         "freeCollateral": 1786071.456884368,
        //         "initialMarginRequirement": 0.12222384240257728,
        //         "liquidating": false,
        //         "maintenanceMarginRequirement": 0.07177992558058484,
        //         "makerFee": 0.0002,
        //         "marginFraction": 0.5588433331419503,
        //         "openMarginFraction": 0.2447194090423075,
        //         "takerFee": 0.0005,
        //         "totalAccountValue": 3568180.98341129,
        //         "totalPositionSize": 6384939.6992,
        //         "username": "user@domain.com",
        //         "positions": [
        //             {
        //                 "cost": -31.7906,
        //                 "entryPrice": 138.22,
        //                 "future": "ETH-PERP",
        //                 "initialMarginRequirement": 0.1,
        //                 "longOrderSize": 1744.55,
        //                 "maintenanceMarginRequirement": 0.04,
        //                 "netSize": -0.23,
        //                 "openSize": 1744.32,
        //                 "realizedPnl": 3.39441714,
        //                 "shortOrderSize": 1732.09,
        //                 "side": "sell",
        //                 "size": 0.23,
        //                 "unrealizedPnl": 0,
        //             },
        //         ],
        //     },
        //
        const symbol = this.safeSymbol (undefined, market);
        const maker = this.safeNumber (fee, 'makerFee');
        const taker = this.safeNumber (fee, 'takerFee');
        return {
            'info': fee,
            'symbol': symbol,
            'maker': maker,
            'taker': taker,
            'percentage': true,
            'tierBased': true,
        };
    }

    parseTradingFees (response) {
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            result[symbol] = this.parseTradingFee (response, market);
        }
        return result;
    }

    async fetchTradingFee (symbol, params = {}) {
        /**
         * @method
         * @name ftx#fetchTradingFee
         * @description fetch the trading fee for a market
         * @param {string} symbol unified symbol of the market to fetch the fee for
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.privateGetAccount (params);
        const result = this.safeValue (response, 'result', {});
        return this.parseTradingFee (result, market);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name ftx#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.privateGetAccount (params);
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "backstopProvider": true,
        //             "collateral": 3568181.02691129,
        //             "freeCollateral": 1786071.456884368,
        //             "initialMarginRequirement": 0.12222384240257728,
        //             "liquidating": false,
        //             "maintenanceMarginRequirement": 0.07177992558058484,
        //             "makerFee": 0.0002,
        //             "marginFraction": 0.5588433331419503,
        //             "openMarginFraction": 0.2447194090423075,
        //             "takerFee": 0.0005,
        //             "totalAccountValue": 3568180.98341129,
        //             "totalPositionSize": 6384939.6992,
        //             "username": "user@domain.com",
        //             "positions": [
        //                 {
        //                     "cost": -31.7906,
        //                     "entryPrice": 138.22,
        //                     "future": "ETH-PERP",
        //                     "initialMarginRequirement": 0.1,
        //                     "longOrderSize": 1744.55,
        //                     "maintenanceMarginRequirement": 0.04,
        //                     "netSize": -0.23,
        //                     "openSize": 1744.32,
        //                     "realizedPnl": 3.39441714,
        //                     "shortOrderSize": 1732.09,
        //                     "side": "sell",
        //                     "size": 0.23,
        //                     "unrealizedPnl": 0,
        //                 },
        //             ],
        //         },
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTradingFees (result);
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @param {string|undefined} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int|undefined} since timestamp in ms of the earliest funding rate to fetch
         * @param {int|undefined} limit the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure} to fetch
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @param {int|undefined} params.until timestamp in ms of the latest funding rate to fetch
         * @returns {[object]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            request['future'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
        }
        const until = this.safeInteger2 (params, 'until', 'till'); // unified in milliseconds
        params = this.omit (params, [ 'until', 'till' ]);
        if (until !== undefined) {
            request['end_time'] = parseInt (until / 1000);
        }
        const response = await this.publicGetFundingRates (this.extend (request, params));
        //
        //     {
        //        "success": true,
        //        "result": [
        //          {
        //            "future": "BTC-PERP",
        //            "rate": 0.0025,
        //            "time": "2019-06-02T08:00:00+00:00"
        //          }
        //        ]
        //      }
        //
        const result = this.safeValue (response, 'result', []);
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString (entry, 'future');
            const timestamp = this.parse8601 (this.safeString (entry, 'time'));
            rates.push ({
                'info': entry,
                'symbol': this.safeSymbol (marketId),
                'fundingRate': this.safeNumber (entry, 'rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    parseBalance (response) {
        const result = {
            'info': response,
        };
        const balances = this.safeValue (response, 'result', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'coin'));
            const account = this.account ();
            account['free'] = this.safeString2 (balance, 'availableWithoutBorrow', 'free');
            account['total'] = this.safeString (balance, 'total');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name ftx#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetWalletBalances (params);
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "coin": "USDTBEAR",
        //                 "free": 2320.2,
        //                 "total": 2340.2
        //             },
        //         ],
        //     }
        //
        return this.parseBalance (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            'new': 'open',
            'open': 'open',
            'closed': 'closed', // filled or canceled
            'triggered': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // limit orders - fetchOrder, fetchOrders, fetchOpenOrders, createOrder, editOrder
        //
        //     {
        //         "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //         "filledSize": 0,
        //         "future": "XRP-PERP",
        //         "id": 9596912,
        //         "market": "XRP-PERP",
        //         "price": 0.306525,
        //         "remainingSize": 31431,
        //         "side": "sell",
        //         "size": 31431,
        //         "status": "open",
        //         "type": "limit",
        //         "reduceOnly": false,
        //         "ioc": false,
        //         "postOnly": false,
        //         "clientId": null,
        //     }
        //
        // market orders - fetchOrder, fetchOrders, fetchOpenOrders, createOrder
        //
        //     {
        //         "avgFillPrice": 2666.0,
        //         "clientId": None,
        //         "createdAt": "2020-02-12T00: 53: 49.009726+00: 00",
        //         "filledSize": 0.0007,
        //         "future": None,
        //         "id": 3109208514,
        //         "ioc": True,
        //         "market": "BNBBULL/USD",
        //         "postOnly": False,
        //         "price": None,
        //         "reduceOnly": False,
        //         "remainingSize": 0.0,
        //         "side": "buy",
        //         "size": 0.0007,
        //         "status": "closed",
        //         "type": "market"
        //     }
        //
        // createOrder (conditional, "stop", "trailingStop", or "takeProfit")
        //
        //     {
        //         "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //         "future": "XRP-PERP",
        //         "id": 9596912,
        //         "market": "XRP-PERP",
        //         "triggerPrice": 0.306525,
        //         "orderId": null,
        //         "side": "sell",
        //         "size": 31431,
        //         "status": "open",
        //         "type": "stop",
        //         "orderPrice": null,
        //         "error": null,
        //         "triggeredAt": null,
        //         "reduceOnly": false
        //     }
        //
        // editOrder (conditional, stop, trailing stop, take profit)
        //
        //     {
        //         "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //         "future": "XRP-PERP",
        //         "id": 9596912,
        //         "market": "XRP-PERP",
        //         "triggerPrice": 0.306225,
        //         "orderId": null,
        //         "side": "sell",
        //         "size": 31431,
        //         "status": "open",
        //         "type": "stop",
        //         "orderPrice": null,
        //         "error": null,
        //         "triggeredAt": null,
        //         "reduceOnly": false,
        //         "orderType": "market",
        //         "filledSize": 0,
        //         "avgFillPrice": null,
        //         "retryUntilFilled": false
        //     }
        //
        // canceled order with a closed status
        //
        //     {
        //         "avgFillPrice":null,
        //         "clientId":null,
        //         "createdAt":"2020-09-01T13:45:57.119695+00:00",
        //         "filledSize":0.0,
        //         "future":null,
        //         "id":8553541288,
        //         "ioc":false,
        //         "liquidation":false,
        //         "market":"XRP/USDT",
        //         "postOnly":false,
        //         "price":0.5,
        //         "reduceOnly":false,
        //         "remainingSize":0.0,
        //         "side":"sell",
        //         "size":46.0,
        //         "status":"closed",
        //         "type":"limit"
        //     }
        //
        const id = this.safeString (order, 'id');
        const timestamp = this.parse8601 (this.safeString (order, 'createdAt'));
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        const amount = this.safeString (order, 'size');
        const filled = this.safeString (order, 'filledSize');
        let remaining = this.safeString (order, 'remainingSize');
        if (Precise.stringEquals (remaining, '0')) {
            remaining = Precise.stringSub (amount, filled);
            if (Precise.stringGt (remaining, '0')) {
                status = 'canceled';
            }
        }
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market);
        let symbol = market['symbol'];
        if (symbol === undefined) {
            // support for delisted market ids
            // https://github.com/ccxt/ccxt/issues/7113
            symbol = marketId;
        }
        const side = this.safeString (order, 'side');
        const type = this.safeString (order, 'type');
        const average = this.safeString (order, 'avgFillPrice');
        const price = this.safeString2 (order, 'price', 'triggerPrice', average);
        const lastTradeTimestamp = this.parse8601 (this.safeString (order, 'triggeredAt'));
        const clientOrderId = this.safeString (order, 'clientId');
        const stopPrice = this.safeNumber (order, 'triggerPrice');
        const postOnly = this.safeValue (order, 'postOnly');
        const ioc = this.safeValue (order, 'ioc');
        let timeInForce = undefined;
        if (ioc) {
            timeInForce = 'IOC';
        }
        if (postOnly) {
            timeInForce = 'PO';
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': this.safeValue (order, 'reduceOnly'),
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name ftx#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side, // 'buy' or 'sell'
            // 'price': 0.306525, // send null for market orders
            'size': parseFloat (this.amountToPrecision (symbol, amount)),
            // 'reduceOnly': false, // optional, default is false
            // 'ioc': false, // optional, default is false, limit or market orders only
            // 'postOnly': false, // optional, default is false, limit or market orders only
            // 'clientId': 'abcdef0123456789', // string, optional, client order id, limit or market orders only
            // 'triggerPrice': 0.306525, // required for stop and takeProfit orders
            // 'trailValue': -0.306525, // required for trailingStop orders, negative for "sell"; positive for "buy"
            // 'orderPrice': 0.306525, // optional, for stop and takeProfit orders only (market by default). If not specified, a market order will be submitted
        };
        const reduceOnly = this.safeValue (params, 'reduceOnly');
        if (reduceOnly === true) {
            request['reduceOnly'] = reduceOnly;
        }
        const clientOrderId = this.safeString2 (params, 'clientId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientId'] = clientOrderId;
            params = this.omit (params, [ 'clientId', 'clientOrderId' ]);
        }
        let method = undefined;
        let triggerPrice = this.safeValue2 (params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeValue (params, 'stopLossPrice');
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        let isTakeProfit = type === 'takeProfit';
        let isStopLoss = type === 'stop';
        let isTriggerPrice = false;
        if (triggerPrice !== undefined) {
            isTriggerPrice = !isTakeProfit && !isStopLoss;
        } else if (takeProfitPrice !== undefined) {
            isTakeProfit = true;
            triggerPrice = takeProfitPrice;
        } else if (stopLossPrice !== undefined) {
            isStopLoss = true;
            triggerPrice = stopLossPrice;
        }
        if (!isTriggerPrice) {
            request['type'] = type;
        }
        const isStopOrder = isTakeProfit || isStopLoss || isTriggerPrice;
        params = this.omit (params, [ 'stopPrice', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice' ]);
        if (isStopOrder) {
            if (triggerPrice === undefined) {
                if (isTakeProfit) {
                    throw new ArgumentsRequired (this.id + ' createOrder() requires a triggerPrice param, a stopPrice or a takeProfitPrice param for a takeProfit order');
                } else if (isStopLoss) {
                    throw new ArgumentsRequired (this.id + ' createOrder() requires a triggerPrice param, a stopPrice or a stopLossPrice param for a stop order');
                }
            }
            method = 'privatePostConditionalOrders';
            request['triggerPrice'] = parseFloat (this.priceToPrecision (symbol, triggerPrice));
            if ((type === 'limit') && (price === undefined)) {
                throw new ArgumentsRequired (this.id + ' createOrder () requires a price argument for stop limit orders');
            }
            if (price !== undefined) {
                request['orderPrice'] = parseFloat (this.priceToPrecision (symbol, price)); // optional, order type is limit if this is specified, otherwise market
            }
            if (isStopLoss || isTakeProfit) {
                request['type'] = isStopLoss ? 'stop' : 'takeProfit';
            }
        } else if ((type === 'limit') || (type === 'market')) {
            method = 'privatePostOrders';
            let isMarketOrder = false;
            if (type === 'limit') {
                request['price'] = parseFloat (this.priceToPrecision (symbol, price));
            } else if (type === 'market') {
                request['price'] = null;
                isMarketOrder = true;
            }
            const timeInForce = this.safeString (params, 'timeInForce');
            const postOnly = this.isPostOnly (isMarketOrder, undefined, params);
            params = this.omit (params, [ 'timeInForce', 'postOnly' ]);
            if (timeInForce !== undefined) {
                if (!((timeInForce === 'IOC') || (timeInForce === 'PO'))) {
                    throw new InvalidOrder (this.id + ' createOrder () does not accept timeInForce: ' + timeInForce + ' orders, only IOC and PO orders are allowed');
                }
            }
            const ioc = (timeInForce === 'IOC');
            if (postOnly) {
                request['postOnly'] = true;
            }
            if (ioc) {
                request['ioc'] = true;
            }
        } else if (type === 'trailingStop') {
            const trailValue = this.safeNumber (params, 'trailValue', price);
            if (trailValue === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder () requires a trailValue parameter or a price argument (negative or positive) for a ' + type + ' order');
            }
            method = 'privatePostConditionalOrders';
            request['trailValue'] = parseFloat (this.priceToPrecision (symbol, trailValue)); // negative for "sell", positive for "buy"
        } else {
            throw new InvalidOrder (this.id + ' createOrder () does not support order type ' + type + ', only limit, market, stop, trailingStop, or takeProfit orders are supported');
        }
        const response = await this[method] (this.extend (request, params));
        //
        // regular orders
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //                 "filledSize": 0,
        //                 "future": "XRP-PERP",
        //                 "id": 9596912,
        //                 "market": "XRP-PERP",
        //                 "price": 0.306525,
        //                 "remainingSize": 31431,
        //                 "side": "sell",
        //                 "size": 31431,
        //                 "status": "open",
        //                 "type": "limit",
        //                 "reduceOnly": false,
        //                 "ioc": false,
        //                 "postOnly": false,
        //                 "clientId": null,
        //             }
        //         ]
        //     }
        //
        // conditional orders
        //
        //     {
        //         "success":true,
        //         "result":{
        //             "id":215826320,
        //             "market":"BTC/USD",
        //             "future":null,
        //             "side":"sell",
        //             "type":"take_profit", // the API accepts the "takeProfit" string in camelCase notation but returns the "take_profit" type with underscore
        //             "orderPrice":40000.0,
        //             "triggerPrice":39000.0,
        //             "size":0.001,
        //             "status":"open",
        //             "createdAt":"2022-06-12T15:41:41.836788+00:00",
        //             "triggeredAt":null,
        //             "orderId":null,
        //             "error":null,
        //             "reduceOnly":false,
        //             "trailValue":null,
        //             "trailStart":null,
        //             "cancelledAt":null,
        //             "cancelReason":null,
        //             "retryUntilFilled":false,
        //             "orderType":"limit"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOrder (result, market);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        let method = undefined;
        const clientOrderId = this.safeString2 (params, 'client_order_id', 'clientOrderId');
        const triggerPrice = this.safeNumber (params, 'triggerPrice');
        const orderPrice = this.safeNumber (params, 'orderPrice');
        const trailValue = this.safeNumber (params, 'trailValue');
        params = this.omit (params, [ 'client_order_id', 'clientOrderId', 'triggerPrice', 'orderPrice', 'trailValue' ]);
        const triggerPriceIsDefined = (triggerPrice !== undefined);
        const orderPriceIsDefined = (orderPrice !== undefined);
        const trailValueIsDefined = (trailValue !== undefined);
        if (triggerPriceIsDefined || orderPriceIsDefined || trailValueIsDefined) {
            method = 'privatePostConditionalOrdersOrderIdModify';
            request['order_id'] = id;
            if (triggerPriceIsDefined) {
                request['triggerPrice'] = parseFloat (this.priceToPrecision (symbol, triggerPrice));
            }
            if (orderPriceIsDefined) {
                // only for stop limit or take profit limit orders
                request['orderPrice'] = parseFloat (this.priceToPrecision (symbol, orderPrice));
            }
            if (trailValueIsDefined) {
                // negative for sell orders, positive for buy orders
                request['trailValue'] = parseFloat (this.priceToPrecision (symbol, trailValue));
            }
        } else {
            if (clientOrderId === undefined) {
                method = 'privatePostOrdersOrderIdModify';
                request['order_id'] = id;
            } else {
                method = 'privatePostOrdersByClientIdClientOrderIdModify';
                request['client_order_id'] = clientOrderId;
                // request['clientId'] = clientOrderId;
            }
            if (price !== undefined) {
                request['price'] = parseFloat (this.priceToPrecision (symbol, price));
            }
        }
        if (amount !== undefined) {
            request['size'] = parseFloat (this.amountToPrecision (symbol, amount));
        }
        const response = await this[method] (this.extend (request, params));
        //
        // regular order
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "createdAt": "2019-03-05T11:56:55.728933+00:00",
        //             "filledSize": 0,
        //             "future": "XRP-PERP",
        //             "id": 9596932,
        //             "market": "XRP-PERP",
        //             "price": 0.326525,
        //             "remainingSize": 31431,
        //             "side": "sell",
        //             "size": 31431,
        //             "status": "open",
        //             "type": "limit",
        //             "reduceOnly": false,
        //             "ioc": false,
        //             "postOnly": false,
        //             "clientId": null,
        //         }
        //     }
        //
        // conditional trigger order
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //             "future": "XRP-PERP",
        //             "id": 9596912,
        //             "market": "XRP-PERP",
        //             "triggerPrice": 0.306225,
        //             "orderId": null,
        //             "side": "sell",
        //             "size": 31431,
        //             "status": "open",
        //             "type": "stop",
        //             "orderPrice": null,
        //             "error": null,
        //             "triggeredAt": null,
        //             "reduceOnly": false,
        //             "orderType": "market",
        //             "filledSize": 0,
        //             "avgFillPrice": null,
        //             "retryUntilFilled": false
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name ftx#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by ftx cancelOrder ()
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @param {bool} params.stop true if cancelling a stop/trigger order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        // support for canceling conditional orders
        // https://github.com/ccxt/ccxt/issues/6669
        const options = this.safeValue (this.options, 'cancelOrder', {});
        const defaultMethod = this.safeString (options, 'method', 'privateDeleteOrdersOrderId');
        let method = this.safeString (params, 'method', defaultMethod);
        const type = this.safeValue (params, 'type');  // Deprecated: use params.stop instead
        let isTriggerOrder = undefined;
        [ isTriggerOrder, params ] = this.isTriggerOrder (params);
        const clientOrderId = this.safeValue2 (params, 'client_order_id', 'clientOrderId');
        if (clientOrderId === undefined) {
            request['order_id'] = parseInt (id);
            if (isTriggerOrder || this.inArray (type, [ 'stop', 'trailingStop', 'takeProfit' ])) {
                method = 'privateDeleteConditionalOrdersOrderId';
            }
        } else {
            request['client_order_id'] = clientOrderId;
            method = 'privateDeleteOrdersByClientIdClientOrderId';
        }
        const query = this.omit (params, [ 'method', 'type', 'client_order_id', 'clientOrderId' ]);
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //         "success": true,
        //         "result": "Order queued for cancelation"
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return result;
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name ftx#cancelOrders
         * @description cancel multiple orders
         * @param {[string]} ids order ids
         * @param {string|undefined} symbol not used by ftx cancelOrders ()
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} raw - a list of order ids queued for cancelation
         */
        await this.loadMarkets ();
        // https://docs.ccxt.com/en/latest/manual.html#user-defined-clientorderid
        const clientOrderIds = this.safeValue (params, 'clientOrderIds');
        // FTX doesn't have endpoint for trigger orders related to cancelOrders
        if (clientOrderIds !== undefined) {
            //
            //     { success: true, result: [ 'billy', 'bob', 'gina' ] }
            //
            return await this.privateDeleteBulkOrdersByClientId (params);
        } else {
            const request = {
                'orderIds': ids,
            };
            //
            //     { success: true, result: [ 181542119006, 181542179014 ] }
            //
            return await this.privateDeleteBulkOrders (this.extend (request, params));
        }
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name ftx#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'market': market['id'], // optional
            // 'conditionalOrdersOnly': false, // cancel conditional orders only
            // 'limitOrdersOnly': false, // cancel existing limit orders (non-conditional orders) only
        };
        const marketId = this.getMarketId (symbol, 'market', params);
        if (marketId !== undefined) {
            request['market'] = marketId;
        }
        let isTriggerOrder = undefined;
        [ isTriggerOrder, params ] = this.isTriggerOrder (params);
        // if user wants to cancel only conditional orders, then set below fields. Otherwise, request will cancel all orders - conditional and regular orders
        if (isTriggerOrder) {
            request['conditionalOrdersOnly'] = true;
            request['limitOrdersOnly'] = false;
        }
        const response = await this.privateDeleteOrders (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //     {
        //         "success": true,
        //         "result": "Orders queued for cancelation"
        //     }
        //
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by ftx fetchOrder
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        const clientOrderId = this.safeValue2 (params, 'client_order_id', 'clientOrderId');
        let method = 'privateGetOrdersOrderId';
        if (clientOrderId === undefined) {
            request['order_id'] = id;
        } else {
            request['client_order_id'] = clientOrderId;
            params = this.omit (params, [ 'client_order_id', 'clientOrderId' ]);
            method = 'privateGetOrdersByClientIdClientOrderId';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //             "filledSize": 10,
        //             "future": "XRP-PERP",
        //             "id": 9596912,
        //             "market": "XRP-PERP",
        //             "price": 0.306525,
        //             "avgFillPrice": 0.306526,
        //             "remainingSize": 31421,
        //             "side": "sell",
        //             "size": 31431,
        //             "status": "open",
        //             "type": "limit",
        //             "reduceOnly": false,
        //             "ioc": false,
        //             "postOnly": false,
        //             "clientId": null
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        const [ market, marketId ] = this.getMarketParams (symbol, 'market', params);
        if (marketId !== undefined) {
            request['market'] = marketId;
        }
        // support for canceling conditional orders
        // https://github.com/ccxt/ccxt/issues/6669
        const options = this.safeValue (this.options, 'fetchOpenOrders', {});
        const defaultMethod = this.safeString (options, 'method', 'privateGetOrders');
        let method = this.safeString (params, 'method', defaultMethod);
        const type = this.safeValue (params, 'type');
        let isTriggerOrder = undefined;
        [ isTriggerOrder, params ] = this.isTriggerOrder (params);
        if (isTriggerOrder || this.inArray (type, [ 'trigger', 'stop', 'trailingStop', 'takeProfit' ])) {
            method = 'privateGetConditionalOrders';
        }
        const query = this.omit (params, [ 'method', 'type' ]);
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //                 "filledSize": 10,
        //                 "future": "XRP-PERP",
        //                 "id": 9596912,
        //                 "market": "XRP-PERP",
        //                 "price": 0.306525,
        //                 "avgFillPrice": 0.306526,
        //                 "remainingSize": 31421,
        //                 "side": "sell",
        //                 "size": 31431,
        //                 "status": "open",
        //                 "type": "limit",
        //                 "reduceOnly": false,
        //                 "ioc": false,
        //                 "postOnly": false,
        //                 "clientId": null
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOrders (result, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        const [ market, marketId ] = this.getMarketParams (symbol, 'market', params);
        if (marketId !== undefined) {
            request['market'] = marketId;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
        }
        // support for canceling conditional orders
        // https://github.com/ccxt/ccxt/issues/6669
        const options = this.safeValue (this.options, 'fetchOrders', {});
        const defaultMethod = this.safeString (options, 'method', 'privateGetOrdersHistory');
        let method = this.safeString (params, 'method', defaultMethod);
        const type = this.safeValue (params, 'type');
        let isTriggerOrder = undefined;
        [ isTriggerOrder, params ] = this.isTriggerOrder (params);
        if (isTriggerOrder || this.inArray (type, [ 'trigger', 'stop', 'trailingStop', 'takeProfit' ])) {
            method = 'privateGetConditionalOrdersHistory';
        }
        const query = this.omit (params, [ 'method', 'type' ]);
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //                 "filledSize": 10,
        //                 "future": "XRP-PERP",
        //                 "id": 9596912,
        //                 "market": "XRP-PERP",
        //                 "price": 0.306525,
        //                 "avgFillPrice": 0.306526,
        //                 "remainingSize": 31421,
        //                 "side": "sell",
        //                 "size": 31431,
        //                 "status": "open",
        //                 "type": "limit",
        //                 "reduceOnly": false,
        //                 "ioc": false,
        //                 "postOnly": false,
        //                 "clientId": null
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOrders (result, market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        const request = {
            'orderId': id,
        };
        // if it's conditional order
        const type = this.safeValue (params, 'type');
        params = this.omit (params, 'type');
        let isTriggerOrder = undefined;
        [ isTriggerOrder, params ] = this.isTriggerOrder (params);
        if (isTriggerOrder || this.inArray (type, [ 'trigger', 'stop', 'trailingStop', 'takeProfit' ])) {
            // if it is conditional order, then it would have a reference order id to be sent to the specific endpoint, from where we will get the actual order ID and then use that ID
            const realOrderId = await this.fetchOrderIfFromConditionalOrder (id);
            if (realOrderId !== undefined) {
                request['orderId'] = realOrderId;
            } else {
                // if order-id was not found, then there were no fills and no need to make any further request
                return [];
            }
        }
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrderIfFromConditionalOrder (id) {
        const request = {
            'conditional_order_id': id,
        };
        const response = await this.privateGetConditionalOrdersConditionalOrderIdTriggers (request);
        // Note: if endpoint retuns non-empy "result" property, then it means order had fill and returns the order reference ID, which is the real id of the regular order
        //
        // {
        //     "success": true,
        //     "result": [
        //         {
        //             "time": "2022-03-29T04:54:04.390665+00:00",
        //             "orderId": 132144259673, // this is not the same conditional-order's id, instead it is the regular order id, which can be used in regular methods
        //             "error": null,
        //             "orderSize": 0.1234,
        //             "filledSize": 0.1234
        //         }
        //     ]
        // }
        //
        // Also note, the above endpoint seems to return one object in array
        const result = this.safeValue (response, 'result');
        const orderObject = this.safeValue (result, 0, {});
        return this.safeString (orderObject, 'orderId');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchMyTrades
         * @description fetch trades specific to you account
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @param {int|undefined} params.until timestamp in ms of the latest trade
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const [ market, marketId ] = this.getMarketParams (symbol, 'market', params);
        const request = {};
        if (marketId !== undefined) {
            request['market'] = marketId;
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const until = this.safeInteger2 (params, 'until', 'till');
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
            request['end_time'] = this.seconds ();
        }
        if (until !== undefined) {
            request['end_time'] = parseInt (until / 1000);
            params = this.omit (params, [ 'until', 'till' ]);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetFills (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "fee": 20.1374935,
        //                 "feeRate": 0.0005,
        //                 "future": "EOS-0329",
        //                 "id": 11215,
        //                 "liquidity": "taker",
        //                 "market": "EOS-0329",
        //                 "baseCurrency": null,
        //                 "quoteCurrency": null,
        //                 "orderId": 8436981,
        //                 "price": 4.201,
        //                 "side": "buy",
        //                 "size": 9587,
        //                 "time": "2019-03-27T19:15:10.204619+00:00",
        //                 "type": "order"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'result', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name ftx#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
            'source': fromAccount,
            'destination': toAccount,
            'size': amount,
        };
        const response = await this.privatePostSubaccountsTransfer (this.extend (request, params));
        //
        //     {
        //         success: true,
        //         result: {
        //             id: '31222278',
        //             coin: 'USDT',
        //             size: '1.0',
        //             time: '2022-04-01T11:18:27.194188+00:00',
        //             notes: 'Transfer from main account to testSubaccount',
        //             status: 'complete'
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTransfer (result, currency);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //     {
        //         id: '31222278',
        //         coin: 'USDT',
        //         size: '1.0',
        //         time: '2022-04-01T11:18:27.194188+00:00',
        //         notes: 'Transfer from main account to testSubaccount',
        //         status: 'complete'
        //     }
        //
        const currencyId = this.safeString (transfer, 'coin');
        const notes = this.safeString (transfer, 'notes', '');
        const status = this.safeString (transfer, 'status');
        const fromTo = notes.replace ('Transfer from ', '');
        const parts = fromTo.split (' to ');
        let fromAccount = this.safeString (parts, 0);
        fromAccount = fromAccount.replace (' account', '');
        let toAccount = this.safeString (parts, 1);
        toAccount = toAccount.replace (' account', '');
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'id'),
            'timestamp': undefined,
            'datetime': this.safeString (transfer, 'time'),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (transfer, 'size'),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.parseTransferStatus (status),
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            'complete': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name ftx#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
            'size': amount,
            'address': address,
            // 'password': 'string', // optional withdrawal password if it is required for your account
            // 'code': '192837', // optional 2fa code if it is required for your account
        };
        if (this.password !== undefined) {
            request['password'] = this.password;
        }
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeStringLower (networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['method'] = network;
            params = this.omit (params, 'network');
        }
        const response = await this.privatePostWalletWithdrawals (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "coin": "USDTBEAR",
        //             "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //             "tag": "null",
        //             "fee": 0,
        //             "id": 1,
        //             "size": "20.2",
        //             "status": "requested",
        //             "time": "2019-03-05T09:56:55.728933+00:00",
        //             "txid": "null"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTransaction (result, currency);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        const request = {
            'showAvgPrice': true,
        };
        const response = await this.privateGetPositions (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "cost": -31.7906,
        //                 "entryPrice": 138.22,
        //                 "estimatedLiquidationPrice": 152.1,
        //                 "future": "ETH-PERP",
        //                 "initialMarginRequirement": 0.1,
        //                 "longOrderSize": 1744.55,
        //                 "maintenanceMarginRequirement": 0.04,
        //                 "netSize": -0.23,
        //                 "openSize": 1744.32,
        //                 "realizedPnl": 3.39441714,
        //                 "shortOrderSize": 1732.09,
        //                 "recentAverageOpenPrice": 278.98,
        //                 "recentPnl": 2.44,
        //                 "recentBreakEvenPrice": 278.98,
        //                 "side": "sell",
        //                 "size": 0.23,
        //                 "unrealizedPnl": 0,
        //                 "collateralUsed": 3.17906
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parsePositions (result, symbols);
    }

    parsePosition (position, market = undefined) {
        //
        //   {
        //     "future": "XMR-PERP",
        //     "size": "0.0",
        //     "side": "buy",
        //     "netSize": "0.0",
        //     "longOrderSize": "0.0",
        //     "shortOrderSize": "0.0",
        //     "cost": "0.0",
        //     "entryPrice": null,
        //     "unrealizedPnl": "0.0",
        //     "realizedPnl": "0.0",
        //     "initialMarginRequirement": "0.02",
        //     "maintenanceMarginRequirement": "0.006",
        //     "openSize": "0.0",
        //     "collateralUsed": "0.0",
        //     "estimatedLiquidationPrice": null
        //   }
        //
        const contractsString = this.safeString (position, 'size');
        const rawSide = this.safeString (position, 'side');
        const side = (rawSide === 'buy') ? 'long' : 'short';
        const marketId = this.safeString (position, 'future');
        const symbol = this.safeSymbol (marketId, market);
        const liquidationPriceString = this.safeString (position, 'estimatedLiquidationPrice');
        const initialMarginPercentage = this.safeString (position, 'initialMarginRequirement');
        // on ftx the entryPrice is actually the mark price
        const markPriceString = this.safeString (position, 'entryPrice');
        const notionalString = Precise.stringMul (contractsString, markPriceString);
        const initialMargin = this.safeString (position, 'collateralUsed');
        const maintenanceMarginPercentageString = this.safeString (position, 'maintenanceMarginRequirement');
        const maintenanceMarginString = Precise.stringMul (notionalString, maintenanceMarginPercentageString);
        const unrealizedPnlString = this.safeString (position, 'recentPnl');
        const percentage = this.parseNumber (Precise.stringMul (Precise.stringDiv (unrealizedPnlString, initialMargin, 4), '100'));
        const entryPriceString = this.safeString (position, 'recentAverageOpenPrice');
        let difference = undefined;
        let collateral = undefined;
        let marginRatio = undefined;
        let leverage = undefined;
        if (Precise.stringEq (liquidationPriceString, '0')) {
            // position is fully collateralized
            collateral = notionalString;
        } else if (entryPriceString !== undefined) {
            // collateral = maintenanceMargin ± ((markPrice - liquidationPrice) * size)
            if (side === 'long') {
                difference = Precise.stringSub (markPriceString, liquidationPriceString);
            } else {
                difference = Precise.stringSub (liquidationPriceString, markPriceString);
            }
            const loss = Precise.stringMul (difference, contractsString);
            collateral = Precise.stringAdd (loss, maintenanceMarginString);
            leverage = this.parseNumber (Precise.stringDiv (Precise.stringAdd (Precise.stringDiv (notionalString, collateral), '0.005'), '1', 2));
            marginRatio = this.parseNumber (Precise.stringDiv (maintenanceMarginString, collateral, 4));
        }
        // ftx has a weird definition of realizedPnl
        // it keeps the historical record of the realizedPnl per contract forever
        // so we cannot use this data
        return {
            'id': undefined,
            'info': position,
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentage),
            'maintenanceMargin': this.parseNumber (maintenanceMarginString),
            'maintenanceMarginPercentage': this.parseNumber (maintenanceMarginPercentageString),
            'entryPrice': this.parseNumber (entryPriceString),
            'notional': this.parseNumber (notionalString),
            'leverage': leverage,
            'unrealizedPnl': this.parseNumber (unrealizedPnlString),
            'contracts': this.parseNumber (contractsString),
            'contractSize': this.safeValue (market, 'contractSize'),
            'marginRatio': marginRatio,
            'liquidationPrice': this.parseNumber (liquidationPriceString),
            'markPrice': this.parseNumber (markPriceString),
            'collateral': this.parseNumber (collateral),
            'marginMode': 'cross',
            'side': side,
            'percentage': percentage,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name ftx#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
        };
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeStringLower (networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['method'] = network;
            params = this.omit (params, 'network');
        }
        const response = await this.privateGetWalletDepositAddressCoin (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //             "tag": null,
        //             "method": "erc20",
        //             "coin": null
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const networkId = this.safeString (result, 'method');
        const address = this.safeString (result, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': this.safeString (result, 'tag'),
            'network': this.safeNetwork (networkId),
            'info': response,
        };
    }

    safeNetwork (networkId) {
        const networksById = {
            'trx': 'TRC20',
            'erc20': 'ERC20',
            'sol': 'SOL',
            'bsc': 'BEP20',
            'bep2': 'BEP2',
        };
        return this.safeString (networksById, networkId, networkId);
    }

    parseTransactionStatus (status) {
        const statuses = {
            // what are other statuses here?
            'confirmed': 'ok', // deposits
            'complete': 'ok', // withdrawals
            'cancelled': 'canceled', // deposits
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     airdrop
        //
        //     {
        //         "id": 9147072,
        //         "coin": "SRM_LOCKED",
        //         "size": 3.12,
        //         "time": "2021-04-27T23:59:03.565983+00:00",
        //         "notes": "SRM Airdrop for FTT holdings",
        //         "status": "complete"
        //     }
        //
        //     regular deposits
        //
        //     {
        //         "coin": "TUSD",
        //         "confirmations": 64,
        //         "confirmedTime": "2019-03-05T09:56:55.728933+00:00",
        //         "fee": 0,
        //         "id": 1,
        //         "sentTime": "2019-03-05T09:56:55.735929+00:00",
        //         "size": "99.0",
        //         "status": "confirmed",
        //         "time": "2019-03-05T09:56:55.728933+00:00",
        //         "txid": "0x8078356ae4b06a036d64747546c274af19581f1c78c510b60505798a7ffcaf1"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "coin": "TUSD",
        //         "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //         "tag": "null",
        //         "fee": 0,
        //         "id": 1,
        //         "size": "99.0",
        //         "status": "complete",
        //         "time": "2019-03-05T09:56:55.728933+00:00",
        //         "txid": "0x8078356ae4b06a036d64747546c274af19581f1c78c510b60505798a7ffcaf1"
        //     }
        //
        //     {
        //         "coin": 'BTC',
        //         "id": 1969806,
        //         "notes": 'Transfer to Dd6gi7m2Eg4zzBbPAxuwfEaHs6tYvyUX5hbPpsTcNPXo',
        //         "size": 0.003,
        //         "status": 'complete',
        //         "time": '2021-02-03T20:28:54.918146+00:00'
        //     }
        //
        const code = this.safeCurrencyCode (this.safeString (transaction, 'coin'));
        const id = this.safeString (transaction, 'id');
        const amount = this.safeNumber (transaction, 'size');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const timestamp = this.parse8601 (this.safeString (transaction, 'time'));
        const txid = this.safeString (transaction, 'txid');
        let tag = undefined;
        let address = this.safeValue (transaction, 'address');
        if (typeof address !== 'string') {
            tag = this.safeString (address, 'tag');
            address = this.safeString (address, 'address');
        } else {
            tag = this.safeString (transaction, 'tag');
        }
        if (address === undefined) {
            // parse address from internal transfer
            const notes = this.safeString (transaction, 'notes');
            if ((notes !== undefined) && (notes.indexOf ('Transfer to') >= 0)) {
                address = notes.slice (12);
            }
        }
        const fee = this.safeNumber (transaction, 'fee');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': undefined,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'type': undefined,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': {
                'currency': code,
                'cost': fee,
                'rate': undefined,
            },
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetWalletDeposits (params);
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "coin": "TUSD",
        //             "confirmations": 64,
        //             "confirmedTime": "2019-03-05T09:56:55.728933+00:00",
        //             "fee": 0,
        //             "id": 1,
        //             "sentTime": "2019-03-05T09:56:55.735929+00:00",
        //             "size": "99.0",
        //             "status": "confirmed",
        //             "time": "2019-03-05T09:56:55.728933+00:00",
        //             "txid": "0x8078356ae4b06a036d64747546c274af19581f1c78c510b60505798a7ffcaf1"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (result, currency, since, limit, { 'type': 'deposit' });
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetWalletWithdrawals (params);
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "coin": "TUSD",
        //             "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //             "tag": "null",
        //             "fee": 0,
        //             "id": 1,
        //             "size": "99.0",
        //             "status": "complete",
        //             "time": "2019-03-05T09:56:55.728933+00:00",
        //             "txid": "0x8078356ae4b06a036d64747546c274af19581f1c78c510b60505798a7ffcaf1"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (result, currency, since, limit, { 'type': 'withdrawal' });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/api/' + this.implodeParams (path, params);
        const signOptions = this.safeValue (this.options, 'sign', {});
        const headerPrefix = this.safeString (signOptions, this.hostname, 'FTX');
        const subaccountField = headerPrefix + '-SUBACCOUNT';
        const chosenSubaccount = this.safeString2 (params, subaccountField, 'subaccount');
        if (chosenSubaccount !== undefined) {
            params = this.omit (params, [ subaccountField, 'subaccount' ]);
        }
        const query = this.omit (params, this.extractParams (path));
        const baseUrl = this.implodeHostname (this.urls['api'][api]);
        let url = baseUrl + request;
        if (method === 'GET') {
            if (Object.keys (query).length) {
                const suffix = '?' + this.urlencode (query);
                url += suffix;
                request += suffix;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let auth = timestamp + method + request;
            headers = {};
            if ((method === 'POST') || (method === 'DELETE')) {
                body = this.json (query);
                auth += body;
                headers['Content-Type'] = 'application/json';
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            headers[headerPrefix + '-KEY'] = this.apiKey;
            headers[headerPrefix + '-TS'] = timestamp;
            headers[headerPrefix + '-SIGN'] = signature;
            if (chosenSubaccount !== undefined) {
                headers[subaccountField] = chosenSubaccount;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to the default error handler
        }
        //
        //     {"error":"Invalid parameter start_time","success":false}
        //     {"error":"Not enough balances","success":false}
        //
        const success = this.safeValue (response, 'success');
        if (!success) {
            const feedback = this.id + ' ' + body;
            const error = this.safeString (response, 'error');
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name ftx#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string|undefined} symbol not used by ftx setLeverage ()
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} response from the exchange
         */
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        if ((leverage < 1) || (leverage > 20)) {
            throw new BadRequest (this.id + ' setLeverage () leverage should be between 1 and 20');
        }
        const request = {
            'leverage': leverage,
        };
        return await this.privatePostAccountLeverage (this.extend (request, params));
    }

    parseIncome (income, market = undefined) {
        //
        //   {
        //       "future": "ETH-PERP",
        //        "id": 33830,
        //        "payment": 0.0441342,
        //        "time": "2019-05-15T18:00:00+00:00",
        //        "rate": 0.0001
        //   }
        //
        const marketId = this.safeString (income, 'future');
        const symbol = this.safeSymbol (marketId, market);
        const amount = this.safeNumber (income, 'payment');
        const code = this.safeCurrencyCode ('USD');
        const id = this.safeString (income, 'id');
        const time = this.safeString (income, 'time');
        const timestamp = this.parse8601 (time);
        const rate = this.safe_number (income, 'rate');
        return {
            'info': income,
            'symbol': symbol,
            'code': code,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': id,
            'amount': amount,
            'rate': rate,
        };
    }

    parseIncomes (incomes, market = undefined, since = undefined, limit = undefined) {
        const result = [];
        for (let i = 0; i < incomes.length; i++) {
            const entry = incomes[i];
            const parsed = this.parseIncome (entry, market);
            result.push (parsed);
        }
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterBySinceLimit (sorted, since, limit, 'timestamp');
    }

    async fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchFundingHistory
         * @description fetch the history of funding payments paid and received on this account
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch funding history for
         * @param {int|undefined} limit the maximum number of funding history structures to retrieve
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/en/latest/manual.html#funding-history-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['future'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
            request['end_time'] = this.seconds ();
        }
        const till = this.safeInteger (params, 'till');
        if (till !== undefined) {
            request['end_time'] = parseInt (till / 1000);
            params = this.omit (params, 'till');
        }
        const response = await this.privateGetFundingPayments (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        return this.parseIncomes (result, market, since, limit);
    }

    parseFundingRate (contract, market = undefined) {
        //
        // perp
        //     {
        //       "volume": "71294.7636",
        //       "nextFundingRate": "0.000033",
        //       "nextFundingTime": "2021-10-14T20:00:00+00:00",
        //       "openInterest": "47142.994"
        //     }
        //
        // delivery
        //     {
        //       "volume": "4998.727",
        //       "predictedExpirationPrice": "3798.820141757",
        //       "openInterest": "48307.96"
        //     }
        //
        const fundingRateDatetimeRaw = this.safeString (contract, 'nextFundingTime');
        const fundingRateTimestamp = this.parse8601 (fundingRateDatetimeRaw);
        const estimatedSettlePrice = this.safeNumber (contract, 'predictedExpirationPrice');
        return {
            'info': contract,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': this.parseNumber ('0'),
            'estimatedSettlePrice': estimatedSettlePrice,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'nextFundingRate'),
            'fundingTimestamp': fundingRateTimestamp,
            'fundingDatetime': this.iso8601 (fundingRateTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchFundingRate (symbol, params = {}) {
        /**
         * @method
         * @name ftx#fetchFundingRate
         * @description fetch the current funding rate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/en/latest/manual.html#funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'future_name': market['id'],
        };
        const response = await this.publicGetFuturesFutureNameStats (this.extend (request, params));
        //
        //     {
        //       "success": true,
        //       "result": {
        //         "volume": "71294.7636",
        //         "nextFundingRate": "0.000033",
        //         "nextFundingTime": "2021-10-14T20:00:00+00:00",
        //         "openInterest": "47142.994"
        //       }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseFundingRate (result, market);
    }

    async fetchBorrowRates (params = {}) {
        /**
         * @method
         * @name ftx#fetchBorrowRates
         * @description fetch the borrow interest rates of all currencies
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} a list of [borrow rate structures]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-rate-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetSpotMarginBorrowRates (params);
        //
        //     {
        //         "success":true,
        //         "result":[
        //             {"coin":"1INCH","previous":4.8763e-6,"estimate":4.8048e-6},
        //             {"coin":"AAPL","previous":0.0000326469,"estimate":0.0000326469},
        //             {"coin":"AAVE","previous":1.43e-6,"estimate":1.43e-6},
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result');
        return this.parseBorrowRates (result, 'coin');
    }

    async fetchBorrowRateHistories (codes = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchBorrowRateHistories
         * @description retrieves a history of a multiple currencies borrow interest rate at specific time slots, returns all currencies if no symbols passed, default is undefined
         * @param {[string]|undefined} codes list of unified currency codes, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest borrowRate, default is undefined
         * @param {int|undefined} limit max number of borrow rate prices to return, default is undefined
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @param {object} params.till timestamp in ms of the latest time to fetch the borrow rate
         * @returns {object} a dictionary of [borrow rate structures]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-rate-structure} indexed by the market symbol
         */
        await this.loadMarkets ();
        const request = {};
        let numCodes = 0;
        let endTime = this.safeNumber2 (params, 'till', 'end_time');
        if (codes !== undefined) {
            numCodes = codes.length;
        }
        if (numCodes === 1) {
            const millisecondsPer5000Hours = 18000000000;
            if ((limit !== undefined) && (limit > 5000)) {
                throw new BadRequest (this.id + ' fetchBorrowRateHistories () limit cannot exceed 5000 for a single currency');
            }
            if ((endTime !== undefined) && (since !== undefined) && ((endTime - since) > millisecondsPer5000Hours)) {
                throw new BadRequest (this.id + ' fetchBorrowRateHistories () requires the time range between the since time and the end time to be less than 5000 hours for a single currency');
            }
            const currency = this.currency (codes[0]);
            request['coin'] = currency['id'];
        } else {
            const millisecondsPer2Days = 172800000;
            if ((limit !== undefined) && (limit > 48)) {
                throw new BadRequest (this.id + ' fetchBorrowRateHistories () limit cannot exceed 48 for multiple currencies');
            }
            if ((endTime !== undefined) && (since !== undefined) && ((endTime - since) > millisecondsPer2Days)) {
                throw new BadRequest (this.id + ' fetchBorrowRateHistories () requires the time range between the since time and the end time to be less than 48 hours for multiple currencies');
            }
        }
        const millisecondsPerHour = 3600000;
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
            if (endTime === undefined) {
                const now = this.milliseconds ();
                const sinceLimit = (limit === undefined) ? 2 : limit;
                endTime = this.sum (since, millisecondsPerHour * (sinceLimit - 1));
                endTime = Math.min (endTime, now);
            }
        } else {
            if (limit !== undefined) {
                if (endTime === undefined) {
                    endTime = this.milliseconds ();
                }
                const startTime = this.sum ((endTime - millisecondsPerHour * limit), 1000);
                request['start_time'] = parseInt (startTime / 1000);
            }
        }
        if (endTime !== undefined) {
            request['end_time'] = parseInt (endTime / 1000);
        }
        const response = await this.publicGetSpotMarginHistory (this.extend (request, params));
        //
        //    {
        //        "success": true,
        //        "result": [
        //            {
        //                "coin": "PYPL",
        //                "time": "2022-01-24T13:00:00+00:00",
        //                "size": 0.00500172,
        //                "rate": 1e-6
        //            },
        //            ...
        //        ]
        //    }
        //
        const result = this.safeValue (response, 'result');
        return this.parseBorrowRateHistories (result, codes, since, limit);
    }

    async fetchBorrowRateHistory (code, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchBorrowRateHistory
         * @description retrieves a history of a currencies borrow interest rate at specific time slots
         * @param {string} code unified currency code
         * @param {int|undefined} since timestamp for the earliest borrow rate
         * @param {int|undefined} limit the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-rate-structure} to retrieve
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @param {int|undefined} params.till Timestamp in ms of the latest time to fetch the borrow rate
         * @returns {[object]} an array of [borrow rate structures]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-rate-structure}
         */
        const histories = await this.fetchBorrowRateHistories ([ code ], since, limit, params);
        const borrowRateHistory = this.safeValue (histories, code);
        if (borrowRateHistory === undefined) {
            throw new BadRequest (this.id + ' fetchBorrowRateHistory () returned no data for ' + code);
        }
        return borrowRateHistory;
    }

    parseBorrowRateHistories (response, codes, since, limit) {
        // How to calculate borrow rate
        // https://help.ftx.com/hc/en-us/articles/360053007671-Spot-Margin-Trading-Explainer
        const takerFee = this.fees['trading']['taker'].toString ();
        const spotMarginBorrowRate = Precise.stringMul ('500', takerFee);
        const borrowRateHistories = {};
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const code = this.safeCurrencyCode (this.safeString (item, 'coin'));
            if (codes === undefined || this.inArray (code, codes)) {
                if (!(code in borrowRateHistories)) {
                    borrowRateHistories[code] = [];
                }
                const lendingRate = this.safeString (item, 'rate');
                const borrowRate = Precise.stringMul (lendingRate, Precise.stringAdd ('1', spotMarginBorrowRate));
                const borrowRateStructure = this.extend (this.parseBorrowRate (item), { 'rate': borrowRate });
                borrowRateHistories[code].push (borrowRateStructure);
            }
        }
        const keys = Object.keys (borrowRateHistories);
        for (let i = 0; i < keys.length; i++) {
            const code = keys[i];
            borrowRateHistories[code] = this.filterByCurrencySinceLimit (borrowRateHistories[code], code, since, limit);
        }
        return borrowRateHistories;
    }

    parseBorrowRates (response, codeKey) {
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const currency = this.safeString (item, codeKey);
            const code = this.safeCurrencyCode (currency);
            const borrowRate = this.parseBorrowRate (item);
            result[code] = borrowRate;
        }
        return result;
    }

    parseBorrowRate (info, currency = undefined) {
        //
        //    {
        //        "coin": "1INCH",
        //        "previous": 0.0000462375,
        //        "estimate": 0.0000462375
        //    }
        //
        const coin = this.safeString (info, 'coin');
        const datetime = this.safeString (info, 'time');
        const timestamp = this.parse8601 (datetime);
        return {
            'currency': this.safeCurrencyCode (coin),
            'rate': this.safeNumber (info, 'previous'),
            'period': 3600000,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    async fetchBorrowInterest (code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#fetchBorrowInterest
         * @description fetch the interest owed by the user for borrowing currency for margin trading
         * @param {string|undefined} code unified currency code
         * @param {string|undefined} symbol unified market symbol when fetch interest in isolated markets
         * @param {int|undefined} since the earliest time in ms to fetch borrrow interest for
         * @param {int|undefined} limit the maximum number of structures to retrieve
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {[object]} a list of [borrow interest structures]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-interest-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
        }
        const response = await this.privateGetSpotMarginBorrowHistory (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "result":[
        //             {"coin":"USDT","time":"2021-12-26T01:00:00+00:00","size":4593.74214725,"rate":3.3003e-6,"cost":0.0151607272085692,"feeUsd":0.0151683341034461},
        //             {"coin":"USDT","time":"2021-12-26T00:00:00+00:00","size":4593.97110361,"rate":3.3003e-6,"cost":0.0151614828332441,"feeUsd":0.015169697173028324},
        //             {"coin":"USDT","time":"2021-12-25T23:00:00+00:00","size":4594.20005922,"rate":3.3003e-6,"cost":0.0151622384554438,"feeUsd":0.015170200298479137},
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result');
        const interest = this.parseBorrowInterests (result);
        return this.filterByCurrencySinceLimit (interest, code, since, limit);
    }

    parseBorrowInterest (info, market = undefined) {
        const coin = this.safeString (info, 'coin');
        const datetime = this.safeString (info, 'time');
        return {
            'account': 'cross',
            'symbol': undefined,
            'marginMode': 'cross',
            'currency': this.safeCurrencyCode (coin),
            'interest': this.safeNumber (info, 'cost'),
            'interestRate': this.safeNumber (info, 'rate'),
            'amountBorrowed': this.safeNumber (info, 'size'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'info': info,
        };
    }

    async fetchOpenInterest (symbol, params = {}) {
        /**
         * @method
         * @name ftx#fetchOpenInterest
         * @description Retrieves the open interest of a currency
         * @see https://docs.ftx.com/#get-future-stats
         * @param {string} symbol Unified CCXT market symbol
         * @param {object} params exchange specific parameters
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/en/latest/manual.html#interest-history-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['contract']) {
            throw new BadRequest (this.id + ' fetchOpenInterest() supports contract markets only');
        }
        const request = {
            'future_name': market['id'],
        };
        const response = await this.publicGetFuturesFutureNameStats (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "volume": 207681.9947,
        //             "nextFundingRate": -5e-6,
        //             "nextFundingTime": "2022-09-30T22:00:00+00:00",
        //             "openInterest": 64745.8474
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOpenInterest (result, market);
    }

    parseOpenInterest (interest, market = undefined) {
        //
        //     {
        //         "volume": 207681.9947,
        //         "nextFundingRate": -5e-6,
        //         "nextFundingTime": "2022-09-30T22:00:00+00:00",
        //         "openInterest": 64745.8474
        //     }
        //
        market = this.safeMarket (undefined, market);
        const openInterest = this.safeNumber (interest, 'openInterest');
        return {
            'symbol': market['symbol'],
            'openInterestAmount': openInterest,
            'openInterestValue': undefined,
            'baseVolume': openInterest, // deprecated
            'quoteVolume': undefined, // deprecated
            'timestamp': undefined,
            'datetime': undefined,
            'info': interest,
        };
    }
};
