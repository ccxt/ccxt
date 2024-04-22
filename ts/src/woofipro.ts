
// ---------------------------------------------------------------------------

import Exchange from './abstract/woofipro.js';
import { AuthenticationError, RateLimitExceeded, BadRequest, ExchangeError, InvalidOrder, ArgumentsRequired, NotSupported, OnMaintenance } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import { eddsa } from './base/functions/crypto.js';
import { ed25519 } from './static_dependencies/noble-curves/ed25519.js';
import type { TransferEntry, Balances, Bool, Currency, FundingRateHistory, Int, Market, MarketType, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Trade, Transaction, Leverage, Account, Currencies, TradingFees, Conversion } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class woofipro
 * @augments Exchange
 */
export default class woofipro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'woofipro',
            'name': 'WOOFI PRO',
            'countries': [ 'KY' ], // Cayman Islands
            'rateLimit': 100,
            'version': 'v1',
            'certified': true,
            'pro': true,
            'hostname': 'dex.woo.org',
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelWithdraw': false, // exchange have that endpoint disabled atm, but was once implemented in ccxt per old docs: https://kronosresearch.github.io/wootrade-documents/#cancel-withdraw-request
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': true,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchConvertCurrencies': true,
                'fetchConvertQuote': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': 'emulated',
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': true,
                'setMargin': false,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': true, // exchange have that endpoint disabled atm, but was once implemented in ccxt per old docs: https://kronosresearch.github.io/wootrade-documents/#token-withdraw
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1mon',
                '1y': '1y',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api-evm.orderly.org',
                    'private': 'https://api-evm.orderly.org',
                },
                'test': {
                    'public': 'https://testnet-api-evm.orderly.org',
                    'private': 'https://testnet-api-evm.orderly.org',
                },
                'www': 'https://dex.woo.org',
                'doc': [
                    'https://orderly.network/docs/build-on-evm/building-on-evm',
                ],
                'fees': [
                    'https://dex.woo.org/en/orderly',
                ],
                'referral': {
                    'url': '',
                    'discount': 0, // TODO: update
                },
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'public/volume/stats': 1,
                            'public/broker/name': 1,
                            'public/chain_info/{broker_id}': 1,
                            'public/system_info': 1,
                            'public/vault_balance': 1,
                            'public/insurancefund': 1,
                            'public/chain_info': 1,
                            'faucet/usdc': 1,
                            'public/account': 1,
                            'get_account': 1,
                            'registration_nonce': 1,
                            'get_orderly_key': 1,
                            'public/liquidation': 1,
                            'public/liquidated_positions': 1,
                            'public/config': 1,
                            'public/campaign/ranking': 10,
                            'public/campaign/stats': 10,
                            'public/campaign/user': 10,
                            'public/campaign/stats/details': 10,
                            'public/campaigns': 10,
                            'public/points/leaderboard': 1,
                            'client/points': 1,
                            'public/points/epoch': 1,
                            'public/points/epoch_dates': 1,
                            'public/referral/check_ref_code': 1,
                            'public/referral/verify_ref_code': 1,
                            'referral/admin_info': 1,
                            'referral/info': 1,
                            'referral/referee_info': 1,
                            'referral/referee_rebate_summary': 1,
                            'referral/referee_history': 1,
                            'referral/referral_history': 1,
                            'referral/rebate_summary': 1,
                            'client/distribution_history': 1,
                            'tv/config': 1,
                            'tv/history': 1,
                            'tv/symbol_info': 1,
                            'public/funding_rate_history': 1,
                            'public/funding_rate/{symbol}': 0.33,
                            'public/funding_rates': 1,
                            'public/info': 1,
                            'public/info/{symbol}': 1,
                            'public/market_trades': 1,
                            'public/token': 1,
                            'public/futures': 1,
                            'public/futures/{symbol}': 1,
                        },
                        'post': {
                            'register_account': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'client/key_info': 6,
                            'client/orderly_key_ip_restriction': 6,
                            'order/{oid}': 1,
                            'client/order/{client_order_id}': 1,
                            'algo/order/{oid}': 1,
                            'algo/client/order/{client_order_id}': 1,
                            'orders': 1,
                            'algo/orders': 1,
                            'trade/{tid}': 1,
                            'trades': 1,
                            'order/{oid}/trades': 1,
                            'client/liquidator_liquidations': 1,
                            'liquidations': 1,
                            'asset/history': 60,
                            'client/holding': 1,
                            'withdraw_nonce': 1,
                            'settle_nonce': 1,
                            'pnl_settlement/history': 1,
                            'volume/user/daily': 60,
                            'volume/user/stats': 60,
                            'client/statistics': 60,
                            'client/info': 60,
                            'client/statistics/daily': 60,
                            'positions': 3.33,
                            'position/{symbol}': 3.33,
                            'funding_fee/history': 30,
                            'notification/inbox/notifications': 60,
                            'notification/inbox/unread': 60,
                            'volume/broker/daily': 60,
                            'broker/fee_rate/default': 10,
                            'broker/user_info': 10,
                            'orderbook/{symbol}': 1,
                            'kline': 1,
                        },
                        'post': {
                            'orderly_key': 1,
                            'client/set_orderly_key_ip_restriction': 6,
                            'client/reset_orderly_key_ip_restriction': 6,
                            'order': 1,
                            'batch-order': 10,
                            'algo/order': 1,
                            'liquidation': 1,
                            'claim_insurance_fund': 1,
                            'withdraw_request': 1,
                            'settle_pnl': 1,
                            'notification/inbox/mark_read': 60,
                            'notification/inbox/mark_read_all': 60,
                            'client/leverage': 120,
                            'client/maintenance_config': 60,
                            'delegate_signer': 10,
                            'delegate_orderly_key': 10,
                            'delegate_settle_pnl': 10,
                            'delegate_withdraw_request': 10,
                            'broker/fee_rate/set': 10,
                            'broker/fee_rate/set_default': 10,
                            'broker/fee_rate/default': 10,
                            'referral/create': 10,
                            'referral/update': 10,
                            'referral/bind': 10,
                            'referral/edit_split': 10,
                        },
                        'put': {
                            'order': 1,
                            'algo/order': 1,
                        },
                        'delete': {
                            'order': 1,
                            'algo/order': 1,
                            'client/order': 1,
                            'algo/client/order': 1,
                            'algo/orders': 1,
                            'orders': 1,
                            'batch-order': 1,
                            'client/batch-order': 1,
                        },
                    },
                },
            },
			'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
                'privateKey': false,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0005'),
                },
            },
            'options': {
                'sandboxMode': false,
                'brokerId': '',
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

    setSandboxMode (enable: boolean) {
        super.setSandboxMode (enable);
        this.options['sandboxMode'] = enable;
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name woofipro#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-system-maintenance-status
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.v1PublicGetPublicSystemInfo (params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "status": 0,
        //             "msg": "System is functioning properly."
        //         },
        //         "timestamp": "1709274106602"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        let status = this.safeString (data, 'status');
        if (status === undefined) {
            status = 'error';
        } else if (status === '0') {
            status = 'ok';
        } else {
            status = 'maintenance';
        }
        return {
            'status': status,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

	async fetchTime (params = {}) {
        /**
         * @method
         * @name woofipro#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-system-maintenance-status
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.v1PublicGetPublicSystemInfo (params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "status": 0,
        //             "msg": "System is functioning properly."
        //         },
        //         "timestamp": "1709274106602"
        //     }
        //
        return this.safeInteger (response, 'timestamp');
    }

    parseMarket (market): Market {
        //
        //   {
        //     "symbol": "PERP_BTC_USDC",
        //     "quote_min": 123,
        //     "quote_max": 100000,
        //     "quote_tick": 0.1,
        //     "base_min": 0.00001,
        //     "base_max": 20,
        //     "base_tick": 0.00001,
        //     "min_notional": 1,
        //     "price_range": 0.02,
        //     "price_scope": 0.4,
        //     "std_liquidation_fee": 0.03,
        //     "liquidator_fee": 0.015,
        //     "claim_insurance_fund_discount": 0.0075,
        //     "funding_period": 8,
        //     "cap_funding": 0.000375,
        //     "floor_funding": -0.000375,
        //     "interest_rate": 0.0001,
        //     "created_time": 1684140107326,
        //     "updated_time": 1685345968053,
        //     "base_mmr": 0.05,
        //     "base_imr": 0.1,
        //     "imr_factor": 0.0002512,
        //     "liquidation_tier": "1"
        //   }
        //
        const marketId = this.safeString (market, 'symbol');
        const parts = marketId.split ('_');
        const first = this.safeString (parts, 0);
        let marketType: MarketType;
        let spot = false;
        let swap = false;
        if (first === 'SPOT') {
            spot = true;
            marketType = 'spot';
        } else if (first === 'PERP') {
            swap = true;
            marketType = 'swap';
        }
        const baseId = this.safeString (parts, 1);
        const quoteId = this.safeString (parts, 2);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let settleId: Str = undefined;
        let settle: Str = undefined;
        let symbol = base + '/' + quote;
        let contractSize: Num = undefined;
        let linear: Bool = undefined;
        let margin = true;
        if (swap) {
            margin = false;
            settleId = this.safeString (parts, 2);
            settle = this.safeCurrencyCode (settleId);
            symbol = base + '/' + quote + ':' + settle;
            contractSize = this.parseNumber ('1');
            linear = true;
        }
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': marketType,
            'spot': spot,
            'margin': margin,
            'swap': swap,
            'future': false,
            'option': false,
            'active': undefined,
            'contract': swap,
            'linear': linear,
            'inverse': undefined,
            'contractSize': contractSize,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (market, 'base_tick'),
                'price': this.safeNumber (market, 'quote_tick'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'base_min'),
                    'max': this.safeNumber (market, 'base_max'),
                },
                'price': {
                    'min': this.safeNumber (market, 'quote_min'),
                    'max': this.safeNumber (market, 'quote_max'),
                },
                'cost': {
                    'min': this.safeNumber (market, 'min_notional'),
                    'max': undefined,
                },
            },
            'created': this.safeTimestamp (market, 'created_time'),
            'info': market,
        };
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name woofipro#fetchMarkets
         * @description retrieves data on all markets for woofipro
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-available-symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.v1PublicGetPublicInfo (params);
        //
        //   {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "rows": [
        //         {
        //           "symbol": "PERP_BTC_USDC",
        //           "quote_min": 123,
        //           "quote_max": 100000,
        //           "quote_tick": 0.1,
        //           "base_min": 0.00001,
        //           "base_max": 20,
        //           "base_tick": 0.00001,
        //           "min_notional": 1,
        //           "price_range": 0.02,
        //           "price_scope": 0.4,
        //           "std_liquidation_fee": 0.03,
        //           "liquidator_fee": 0.015,
        //           "claim_insurance_fund_discount": 0.0075,
        //           "funding_period": 8,
        //           "cap_funding": 0.000375,
        //           "floor_funding": -0.000375,
        //           "interest_rate": 0.0001,
        //           "created_time": 1684140107326,
        //           "updated_time": 1685345968053,
        //           "base_mmr": 0.05,
        //           "base_imr": 0.1,
        //           "imr_factor": 0.0002512,
        //           "liquidation_tier": "1"
        //         }
        //       ]
        //     }
        //   }
        //
        const data = this.safeDict (response, 'data', {});
        const rows = this.safeList (data, 'rows', []);
        return this.parseMarkets (rows);
    }

	async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name woofipro#fetchCurrencies
         * @description fetches all available currencies on an exchange
		 * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-token-info
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const result = {};
        const response = await this.v1PublicGetPublicToken (params);
        //
		// 	{
		// 		"success": true,
		// 		"timestamp": 1702989203989,
		// 		"data": {
		// 		  "rows": [{
		// 			"token": "USDC",
		// 			"decimals": 6,
		// 			"minimum_withdraw_amount": 0.000001,
		// 			"token_hash": "0xd6aca1be9729c13d677335161321649cccae6a591554772516700f986f942eaa",
		// 			"chain_details": [{
		// 				"chain_id": 43113,
		// 				"contract_address": "0x5d64c9cfb0197775b4b3ad9be4d3c7976e0d8dc3",
		// 				"cross_chain_withdrawal_fee": 123,
		// 				"decimals": 6,
		// 				"withdraw_fee": 2
		// 				}]
		// 			}
		// 		  ]
		// 		}
		// 	}
        //
		const data = this.safeDict (response, 'data', {});
        const tokenRows = this.safeList (data, 'rows', []);
        for (let i = 0; i < tokenRows.length; i++) {
			const token = tokenRows[i];
            const currencyId = this.safeString (token, 'token');
            const networks = this.safeList (token, 'chain_details');
            const code = this.safeCurrencyCode (currencyId);
            let minPrecision = undefined;
            const resultingNetworks = {};
            for (let j = 0; j < networks.length; j++) {
                const network = networks[j];
				// TODO: transform chain id to human readable name
                const networkId = this.safeString (network, 'chain_id');
                const precision = this.parsePrecision (this.safeString (network, 'decimals'));
                if (precision !== undefined) {
                    minPrecision = (minPrecision === undefined) ? precision : Precise.stringMin (precision, minPrecision);
                }
                resultingNetworks[networkId] = {
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
                    'fee': this.safeNumber (network, 'withdrawal_fee'),
                    'precision': this.parseNumber (precision),
                    'info': network,
                };
            }
            result[code] = {
                'id': currencyId,
                'name': currencyId,
                'code': code,
                'precision': this.parseNumber (minPrecision),
                'active': undefined,
                'fee': undefined,
                'networks': resultingNetworks,
                'deposit': undefined,
                'withdraw': undefined,
                'limits': {
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (token, 'minimum_withdraw_amount'),
                        'max': undefined,
                    },
                },
                'info': token,
            };
        }
        return result;
    }

	parseTokenAndFeeTemp (item, feeTokenKey, feeAmountKey) {
        const feeCost = this.safeString (item, feeAmountKey);
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (item, feeTokenKey);
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return fee;
    }

	parseTrade (trade, market: Market = undefined): Trade {
        //
        // public/market_trades
        //
        //     {
        //         "symbol": "SPOT_BTC_USDT",
        //         "side": "SELL",
        //         "executed_price": 46222.35,
        //         "executed_quantity": 0.0012,
        //         "executed_timestamp": "1683878609166"
        //     }
        //
        // fetchOrderTrades, fetchOrder
        //
        //     {
        //         "id": "99119876",
        //         "symbol": "SPOT_WOO_USDT",
        //         "fee": "0.0024",
        //         "side": "BUY",
        //         "executed_timestamp": "1641481113.084",
        //         "order_id": "87001234",
        //         "order_tag": "default", <-- this param only in "fetchOrderTrades"
        //         "executed_price": "1",
        //         "executed_quantity": "12",
        //         "fee_asset": "WOO",
        //         "is_maker": "1"
        //     }
        //
        const isFromFetchOrder = ('id' in trade);
        const timestamp = this.safeInteger (trade, 'executed_timestamp');
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString (trade, 'executed_price');
        const amount = this.safeString (trade, 'executed_quantity');
        const order_id = this.safeString (trade, 'order_id');
        const fee = this.parseTokenAndFeeTemp (trade, 'fee_asset', 'fee');
        const cost = Precise.stringMul (price, amount);
        const side = this.safeStringLower (trade, 'side');
        const id = this.safeString (trade, 'id');
        let takerOrMaker: Str = undefined;
        if (isFromFetchOrder) {
            const isMaker = this.safeString (trade, 'is_maker') === '1';
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': order_id,
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

	async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name woofipro#fetchTrades
         * @description get the list of most recent trades for a particular symbol
		 * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-market-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PublicGetPublicMarketTrades (this.extend (request, params));
        //
		// 	{
		// 		"success": true,
		// 		"timestamp": 1702989203989,
		// 		"data": {
		// 		  "rows": [{
		// 			"symbol": "PERP_ETH_USDC",
		// 			"side": "BUY",
		// 			"executed_price": 2050,
		// 			"executed_quantity": 1,
		// 			"executed_timestamp": 1683878609166
		// 		  }]
		// 		}
		// 	}
        //
        const data = this.safeDict (response, 'data', {});
		const rows = this.safeList (data, 'rows', []);
        return this.parseTrades (rows, market, since, limit);
    }

	parseFundingRate (fundingRate, market: Market = undefined) {
        //
        //         {
        //             "symbol":"PERP_AAVE_USDT",
        //             "est_funding_rate":-0.00003447,
        //             "est_funding_rate_timestamp":1653633959001,
        //             "last_funding_rate":-0.00002094,
        //             "last_funding_rate_timestamp":1653631200000,
        //             "next_funding_time":1653634800000,
		// 			   "sum_unitary_funding": 521.367
        //         }
        //
        //
        const symbol = this.safeString (fundingRate, 'symbol');
        market = this.market (symbol);
        const nextFundingTimestamp = this.safeInteger (fundingRate, 'next_funding_time');
        const estFundingRateTimestamp = this.safeInteger (fundingRate, 'est_funding_rate_timestamp');
        const lastFundingRateTimestamp = this.safeInteger (fundingRate, 'last_funding_rate_timestamp');
        return {
            'info': fundingRate,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': this.parseNumber ('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': estFundingRateTimestamp,
            'datetime': this.iso8601 (estFundingRateTimestamp),
            'fundingRate': this.safeNumber (fundingRate, 'est_funding_rate'),
            'fundingTimestamp': nextFundingTimestamp,
            'fundingDatetime': this.iso8601 (nextFundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': this.safeNumber (fundingRate, 'last_funding_rate'),
            'previousFundingTimestamp': lastFundingRateTimestamp,
            'previousFundingDatetime': this.iso8601 (lastFundingRateTimestamp),
        };
    }

    async fetchFundingRate (symbol: string, params = {}) {
		/**
         * @method
         * @name woofipro#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-predicted-funding-rate-for-one-market
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PublicGetPublicFundingRateSymbol (this.extend (request, params));
        //
		// 	{
		// 		"success": true,
		// 		"timestamp": 1702989203989,
		// 		"data": {
		// 			"symbol": "PERP_ETH_USDC",
		// 			"est_funding_rate": 123,
		// 			"est_funding_rate_timestamp": 1683880020000,
		// 			"last_funding_rate": 0.0001,
		// 			"last_funding_rate_timestamp": 1683878400000,
		// 			"next_funding_time": 1683907200000,
		// 			"sum_unitary_funding": 521.367
		// 		}
		// 	}
        //
		const data = this.safeDict (response, 'data', {});
        return this.parseFundingRate (data, market);
    }

	async fetchFundingRates (symbols: Strings = undefined, params = {}) {
		/**
         * @method
         * @name woofipro#fetchFundingRates
         * @description fetch the current funding rates
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-predicted-funding-rates-for-all-markets
         * @param {string[]} symbols unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.v1PublicGetPublicFundingRates (params);
        //
		// 	{
		// 		"success": true,
		// 		"timestamp": 1702989203989,
		// 		"data": {
		// 		  "rows": [
		// 			{
		// 			"symbol": "PERP_ETH_USDC",
		// 			"est_funding_rate": 123,
		// 			"est_funding_rate_timestamp": 1683880020000,
		// 			"last_funding_rate": 0.0001,
		// 			"last_funding_rate_timestamp": 1683878400000,
		// 			"next_funding_time": 1683907200000,
		// 			"sum_unitary_funding": 521.367
		// 			}
		// 		  ]
		// 		}
		// 	}
        //
		const data = this.safeDict (response, 'data', {});
        const rows = this.safeList (data, 'rows', []);
        const result = this.parseFundingRates (rows);
        return this.filterByArray (result, 'symbol', symbols);
    }

	async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name woofipro#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-funding-rate-history-for-one-market
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest funding rate
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchFundingRateHistory', symbol, since, limit, params, 'page', 25) as FundingRateHistory[];
        }
        let request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        [ request, params ] = this.handleUntilOption ('end_t', request, params, 0.001);
        const response = await this.v1PublicGetPublicFundingRateHistory (this.extend (request, params));
        //
		// 	{
		// 		"success": true,
		// 		"timestamp": 1702989203989,
		// 		"data": {
		// 		  "rows": [{
		// 			"symbol": "PERP_ETH_USDC",
		// 			"funding_rate": 0.0001,
		// 			"funding_rate_timestamp": 1684224000000,
		// 			"next_funding_time": 1684252800000
		// 		  }],
		// 		  "meta": {
		// 			"total": 9,
		// 			"records_per_page": 25,
		// 			"current_page": 1
		// 		  }
		// 	    }
		// 	}
        //
		const data = this.safeDict (response, 'data', {});
        const result = this.safeList (data, 'rows', []);
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString (entry, 'symbol');
            const timestamp = this.safeInteger (entry, 'funding_rate_timestamp');
            rates.push ({
                'info': entry,
                'symbol': this.safeSymbol (marketId),
                'fundingRate': this.safeNumber (entry, 'funding_rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit) as FundingRateHistory[];
    }

	async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name woofipro#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/orderbook-snapshot
		 * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            limit = Math.min (limit, 1000);
            request['max_level'] = limit;
        }
        const response = await this.v1PrivateGetOrderbookSymbol (this.extend (request, params));
        //
		// 	{
		// 		"success": true,
		// 		"timestamp": 1702989203989,
		// 		"data": {
		// 		  "asks": [{
		// 			"price": 10669.4,
		// 			"quantity": 1.56263218
		// 		  }],
		// 		  "bids": [{
		// 			"price": 10669.4,
		// 			"quantity": 1.56263218
		// 		  }],
		// 		  "timestamp": 123
		// 		}
		// 	}
        //
		const data = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (data, 'timestamp');
        return this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
    }

	parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 'start_timestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

	async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name woofipro#fetchOHLCV
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-kline
		 * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] max=1000, max=100 when since is defined and is less than (now - (999 * (timeframe in ms)))
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'type': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        const response = await this.v1PrivateGetKline (this.extend (request, params));
		const data = this.safeDict (response, 'data', {});
		//
		// 	{
		// 		"success": true,
		// 		"timestamp": 1702989203989,
		// 		"data": {
		// 		  "rows": [{
		// 			"open": 66166.23,
		// 			"close": 66124.56,
		// 			"low": 66038.06,
		// 			"high": 66176.97,
		// 			"volume": 23.45528526,
		// 			"amount": 1550436.21725288,
		// 			"symbol": "PERP_BTC_USDC",
		// 			"type": "1m",
		// 			"start_timestamp": 1636388220000,
		// 			"end_timestamp": 1636388280000
		// 		  }]
		// 		}
		// 	}
		//
        const rows = this.safeList (data, 'rows', []);
        return this.parseOHLCVs (rows, market, timeframe, since, limit);
    }

	parseOrder (order, market: Market = undefined): Order {
        //
        // Possible input functions:
        // * createOrder
        // * cancelOrder
        // * fetchOrder
        // * fetchOrders
        // const isFromFetchOrder = ('order_tag' in order); TO_DO
        //
        // stop order after creating it:
        //   {
        //     "orderId": "1578938",
        //     "clientOrderId": "0",
        //     "algoType": "STOP_LOSS",
        //     "quantity": "0.1"
        //   }
        // stop order after fetching it:
        //   {
        //       "algoOrderId": "1578958",
        //       "clientOrderId": "0",
        //       "rootAlgoOrderId": "1578958",
        //       "parentAlgoOrderId": "0",
        //       "symbol": "SPOT_LTC_USDT",
        //       "orderTag": "default",
        //       "algoType": "STOP_LOSS",
        //       "side": "BUY",
        //       "quantity": "0.1",
        //       "isTriggered": false,
        //       "triggerPrice": "100",
        //       "triggerStatus": "USELESS",
        //       "type": "LIMIT",
        //       "rootAlgoStatus": "CANCELLED",
        //       "algoStatus": "CANCELLED",
        //       "triggerPriceType": "MARKET_PRICE",
        //       "price": "75",
        //       "triggerTime": "0",
        //       "totalExecutedQuantity": "0",
        //       "averageExecutedPrice": "0",
        //       "totalFee": "0",
        //       "feeAsset": '',
        //       "reduceOnly": false,
        //       "createdTime": "1686149609.744",
        //       "updatedTime": "1686149903.362"
        //   }
        //
        const timestamp = this.safeTimestampN (order, [ 'timestamp', 'created_time', 'createdTime' ]);
        const orderId = this.safeStringN (order, [ 'order_id', 'orderId', 'algoOrderId' ]);
        const clientOrderId = this.omitZero (this.safeString2 (order, 'client_order_id', 'clientOrderId')); // Somehow, this always returns 0 for limit order
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString2 (order, 'order_price', 'price');
        const amount = this.safeString2 (order, 'order_quantity', 'quantity'); // This is base amount
        const cost = this.safeString2 (order, 'order_amount', 'amount'); // This is quote amount
        const orderType = this.safeStringLower2 (order, 'order_type', 'type');
        const status = this.safeValue2 (order, 'status', 'algoStatus');
        const side = this.safeStringLower (order, 'side');
        const filled = this.omitZero (this.safeValue2 (order, 'executed', 'totalExecutedQuantity'));
        const average = this.omitZero (this.safeString2 (order, 'average_executed_price', 'averageExecutedPrice'));
        const remaining = Precise.stringSub (cost, filled);
        const fee = this.safeValue2 (order, 'total_fee', 'totalFee');
        const feeCurrency = this.safeString2 (order, 'fee_asset', 'feeAsset');
        const transactions = this.safeValue (order, 'Transactions');
        const stopPrice = this.safeNumber (order, 'triggerPrice');
        let takeProfitPrice: Num = undefined;
        let stopLossPrice: Num = undefined;
        const childOrders = this.safeValue (order, 'childOrders');
        if (childOrders !== undefined) {
            const first = this.safeValue (childOrders, 0);
            const innerChildOrders = this.safeValue (first, 'childOrders', []);
            const innerChildOrdersLength = innerChildOrders.length;
            if (innerChildOrdersLength > 0) {
                const takeProfitOrder = this.safeValue (innerChildOrders, 0);
                const stopLossOrder = this.safeValue (innerChildOrders, 1);
                takeProfitPrice = this.safeNumber (takeProfitOrder, 'triggerPrice');
                stopLossPrice = this.safeNumber (stopLossOrder, 'triggerPrice');
            }
        }
        const lastUpdateTimestamp = this.safeTimestamp2 (order, 'updatedTime', 'updated_time');
        return this.safeOrder ({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'status': this.parseOrderStatus (status),
            'symbol': symbol,
            'type': orderType,
            'timeInForce': this.parseTimeInForce (orderType),
            'postOnly': undefined, // TO_DO
            'reduceOnly': this.safeBool (order, 'reduce_only'),
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'takeProfitPrice': takeProfitPrice,
            'stopLossPrice': stopLossPrice,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining, // TO_DO
            'cost': cost,
            'trades': transactions,
            'fee': {
                'cost': fee,
                'currency': feeCurrency,
            },
            'info': order,
        }, market);
    }

	parseTimeInForce (timeInForce) {
        const timeInForces = {
            'ioc': 'IOC',
            'fok': 'FOK',
            'post_only': 'PO',
        };
        return this.safeString (timeInForces, timeInForce, undefined);
    }

    parseOrderStatus (status) {
        if (status !== undefined) {
            const statuses = {
                'NEW': 'open',
                'FILLED': 'closed',
                'CANCEL_SENT': 'canceled',
                'CANCEL_ALL_SENT': 'canceled',
                'CANCELLED': 'canceled',
                'PARTIAL_FILLED': 'open',
                'REJECTED': 'rejected',
                'INCOMPLETE': 'open',
                'COMPLETED': 'closed',
            };
            return this.safeString (statuses, status, status);
        }
        return status;
    }

	async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @method
         * @name woofipro#createOrder
         * @description create a trade order
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/create-order
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/create-algo-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.triggerPrice] The price a trigger order is triggered at
         * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
         * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
         * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
         * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
         * @param {float} [params.algoType] 'STOP'or 'TP_SL' or 'POSITIONAL_TP_SL'
         * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const reduceOnly = this.safeBool2 (params, 'reduceOnly', 'reduce_only');
        params = this.omit (params, [ 'reduceOnly', 'reduce_only' ]);
        const orderType = type.toUpperCase ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderSide = side.toUpperCase ();
        const request = {
            'symbol': market['id'],
            'side': orderSide,
        };
        const stopPrice = this.safeNumber2 (params, 'triggerPrice', 'stopPrice');
        const stopLoss = this.safeValue (params, 'stopLoss');
        const takeProfit = this.safeValue (params, 'takeProfit');
        const algoType = this.safeString (params, 'algoType');
        const isStop = stopPrice !== undefined || stopLoss !== undefined || takeProfit !== undefined || (this.safeValue (params, 'childOrders') !== undefined);
        const isMarket = orderType === 'MARKET';
        const timeInForce = this.safeStringLower (params, 'timeInForce');
        const postOnly = this.isPostOnly (isMarket, undefined, params);
        const orderQtyKey = isStop ? 'quantity' : 'order_quantity';
        const priceKey = isStop ? 'price' : 'order_price';
        const typeKey = isStop ? 'type' : 'order_type';
        request[typeKey] = orderType; // LIMIT/MARKET/IOC/FOK/POST_ONLY/ASK/BID
        if (!isStop) {
            if (postOnly) {
                request['order_type'] = 'POST_ONLY';
            } else if (timeInForce === 'fok') {
                request['order_type'] = 'FOK';
            } else if (timeInForce === 'ioc') {
                request['order_type'] = 'IOC';
            }
        }
        if (reduceOnly) {
            request['reduce_only'] = reduceOnly;
        }
        if (price !== undefined) {
            request[priceKey] = this.priceToPrecision (symbol, price);
        }
        if (isMarket && !isStop) {
            request[orderQtyKey] = this.amountToPrecision (symbol, amount);
        } else if (algoType !== 'POSITIONAL_TP_SL') {
            request[orderQtyKey] = this.amountToPrecision (symbol, amount);
        }
        const clientOrderId = this.safeStringN (params, [ 'clOrdID', 'clientOrderId', 'client_order_id' ]);
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
		if (stopPrice !== undefined) {
			request['trigger_price'] = this.priceToPrecision (symbol, stopPrice);
			request['algo_type'] = 'STOP';
        } else if ((stopLoss !== undefined) || (takeProfit !== undefined)) {
            request['algo_type'] = 'TP_SL';
            const outterOrder = {
                'symbol': market['id'],
                'reduce_only': false,
                'algo_type': 'POSITIONAL_TP_SL',
                'child_orders': [],
            };
            const closeSide = (orderSide === 'BUY') ? 'SELL' : 'BUY';
            if (stopLoss !== undefined) {
                const stopLossPrice = this.safeNumber2 (stopLoss, 'triggerPrice', 'price', stopLoss);
                const stopLossOrder = {
                    'side': closeSide,
                    'algo_type': 'TP_SL',
                    'trigger_price': this.priceToPrecision (symbol, stopLossPrice),
                    'type': 'LIMIT',
                    'reduce_only': true,
                };
                outterOrder['child_orders'].push (stopLossOrder);
            }
            if (takeProfit !== undefined) {
                const takeProfitPrice = this.safeNumber2 (takeProfit, 'triggerPrice', 'price', takeProfit);
                const takeProfitOrder = {
                    'side': closeSide,
                    'algo_type': 'TP_SL',
                    'trigger_price': this.priceToPrecision (symbol, takeProfitPrice),
                    'type': 'LIMIT',
                    'reduce_only': true,
                };
                outterOrder['child_orders'].push (takeProfitOrder);
            }
            request['child_orders'] = [ outterOrder ];
        }
        params = this.omit (params, [ 'clOrdID', 'clientOrderId', 'client_order_id', 'postOnly', 'timeInForce', 'stopPrice', 'triggerPrice', 'stopLoss', 'takeProfit', 'trailingPercent', 'trailingAmount', 'trailingTriggerPrice' ]);
        let response = undefined;
        if (isStop) {
            response = await this.v1PrivatePostAlgoOrder (this.extend (request, params));
			//
			// 	{
			// 		"success": true,
			// 		"timestamp": 1702989203989,
			// 		"data": {
			// 		  "order_id": 13,
			// 		  "client_order_id": "testclientid",
			// 		  "algo_type": "STOP",
			// 		  "quantity": 100.12
			// 		}
			// 	}
			//
        } else {
            response = await this.v1PrivatePostOrder (this.extend (request, params));
			//
			// 	{
			// 		"success": true,
			// 		"timestamp": 1702989203989,
			// 		"data": {
			// 		  "order_id": 13,
			// 		  "client_order_id": "testclientid",
			// 		  "order_type": "LIMIT",
			// 		  "order_price": 100.12,
			// 		  "order_quantity": 0.987654,
			// 		  "order_amount": 0.8,
			// 		  "error_message": "none"
			// 		}
			// 	}
			//
        }
        const data = this.safeDict (response, 'data');
        const order = this.parseOrder (data, market);
        order['type'] = type;
        return order;
    }

	async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name woofipro#cancelOrder
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-order
		 * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-order-by-client_order_id
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-algo-order
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-algo-order-by-client_order_id
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.stop] whether the order is a stop/algo order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const stop = this.safeBool (params, 'stop', false);
        params = this.omit (params, 'stop');
        if (!stop && (symbol === undefined)) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
			'symbol': market['id'],
		};
        const clientOrderIdUnified = this.safeString2 (params, 'clOrdID', 'clientOrderId');
        const clientOrderIdExchangeSpecific = this.safeString (params, 'client_order_id', clientOrderIdUnified);
        const isByClientOrder = clientOrderIdExchangeSpecific !== undefined;
        let response = undefined;
        if (stop) {
			if (isByClientOrder) {
				request['client_order_id'] = clientOrderIdExchangeSpecific;
                params = this.omit (params, [ 'clOrdID', 'clientOrderId', 'client_order_id' ]);
                response = await this.v1PrivateDeleteAlgoClientOrder (this.extend (request, params));
			} else {
				request['order_id'] = id;
				response = await this.v1PrivateDeleteAlgoOrder (this.extend (request, params));
			}
        } else {
            if (isByClientOrder) {
                request['client_order_id'] = clientOrderIdExchangeSpecific;
                params = this.omit (params, [ 'clOrdID', 'clientOrderId', 'client_order_id' ]);
                response = await this.v1PrivateDeleteClientOrder (this.extend (request, params));
            } else {
                request['order_id'] = id;
                response = await this.v1PrivateDeleteOrder (this.extend (request, params));
            }
        }
        //
		// 	{
		// 		"success": true,
		// 		"timestamp": 1702989203989,
		// 		"data": {
		// 		  "status": "CANCEL_SENT"
		// 		}
		// 	}
		//
		// 	{
		// 		"success": true,
		// 		"timestamp": 1702989203989,
		// 		"status": "CANCEL_SENT"
		// 	}
        //
        const extendParams = { 'symbol': symbol };
        if (isByClientOrder) {
            extendParams['client_order_id'] = clientOrderIdExchangeSpecific;
        } else {
            extendParams['id'] = id;
        }
		if (stop) {
			return this.extend (this.parseOrder (response), extendParams);
		}
		const data = this.safeDict (response, 'data', {});
        return this.extend (this.parseOrder (data), extendParams);
    }

	async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name woofipro#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-orders
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-algo-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.stop] whether the order is a stop/algo order
         * @param {boolean} [params.is_triggered] whether the order has been triggered (false by default)
         * @param {string} [params.side] 'buy' or 'sell'
         * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchOrders', symbol, since, limit, params, 'page', 500) as Order[];
        }
        const request = {};
        let market: Market = undefined;
        const stop = this.safeBool2 (params, 'stop', 'trigger');
        params = this.omit (params, [ 'stop', 'trigger' ]);
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        if (limit !== undefined) {
            request['size'] = limit;
        } else {
            request['size'] = 500;
        }
        if (stop) {
            request['algo_type'] = 'stop';
        }
        let response = undefined;
        if (stop) {
            response = await this.v1PrivateGetAlgoOrders (this.extend (request, params));
        } else {
            response = await this.v1PrivateGetOrders (this.extend (request, params));
        }
        //
        //     {
        //         "success":true,
        //         "meta":{
        //             "total":1,
        //             "records_per_page":100,
        //             "current_page":1
        //         },
        //         "rows":[
        //             {
        //                 "symbol":"PERP_BTC_USDT",
        //                 "status":"FILLED",
        //                 "side":"SELL",
        //                 "created_time":"1611617776.000",
        //                 "updated_time":"1611617776.000",
        //                 "order_id":52121167,
        //                 "order_tag":"default",
        //                 "price":null,
        //                 "type":"MARKET",
        //                 "quantity":0.002,
        //                 "amount":null,
        //                 "visible":0,
        //                 "executed":0.002,
        //                 "total_fee":0.01732885,
        //                 "fee_asset":"USDT",
        //                 "client_order_id":null,
        //                 "average_executed_price":28881.41
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', response);
        const orders = this.safeList (data, 'rows');
        return this.parseOrders (orders, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, section = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = section[0];
        const access = section[1];
        const pathWithParams = this.implodeParams (path, params);
        let url = this.implodeHostname (this.urls['api'][access]);
        url += '/' + version + '/';
        params = this.omit (params, this.extractParams (path));
        params = this.keysort (params);
        if (access === 'public') {
            url += pathWithParams;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            if (method === 'POST' && (path === 'algo/order' || path === 'order')) {
                const isSandboxMode = this.safeBool (this.options, 'sandboxMode', false);
                if (!isSandboxMode) {
                    const applicationId = 'bc830de7-50f3-460b-9ee0-f430f83f9dad';
                    const brokerId = this.safeString (this.options, 'brokerId', applicationId);
                    const isStop = path.indexOf ('algo') > -1;
                    if (isStop) {
                        params['brokerId'] = brokerId;
                    } else {
                        params['broker_id'] = brokerId;
                    }
                }
                params = this.keysort (params);
            }
            let auth = '';
            const ts = this.nonce ().toString ();
            url += pathWithParams;
            headers = {
                'orderly-account-id': this.uid,
				'orderly-key':  this.apiKey,
                'orderly-timestamp': ts,
            };
			auth = ts + method + '/' + version + '/' + pathWithParams;
			if (method === 'POST' || method === 'PUT') {
				body = this.json (params);
				auth += body;
				headers['content-type'] = 'application/json';
			} else {
				if (Object.keys (params).length) {
					const query = this.urlencode (params);
					url += '?' + query;
					auth += '?' + query;
				}
				headers['content-type'] = 'application/x-www-form-urlencoded';
			}
			let secret = this.secret;
			if (secret.indexOf ('ed25519:') >= 0) {
				secret = secret.slice (secret.indexOf ('ed25519:') + 8);
			}
			secret = this.base58ToBinary (secret);
			const signature = eddsa (this.encode (auth), secret, ed25519);
            headers['orderly-signature'] = this.urlencodeBase64 (signature);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     400 Bad Request {"success":false,"code":-1012,"message":"Amount is required for buy market orders when margin disabled."}
        //                     {"code":"-1011","message":"The system is under maintenance.","success":false}
        //
        const success = this.safeBool (response, 'success');
        const errorCode = this.safeString (response, 'code');
        if (!success) {
            const feedback = this.id + ' ' + this.json (response);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        return undefined;
    }
}
