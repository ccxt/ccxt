
// ---------------------------------------------------------------------------

import Exchange from './abstract/woofipro.js';
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
                'createTrailingAmountOrder': true,
                'createTrailingPercentOrder': true,
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
			if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
				body = this.json (params);
				auth += body;
			} else {
				if (Object.keys (params).length) {
					const query = this.urlencode (params);
					url += '?' + query;
					auth += '?' + query;
				}
			}
			headers['content-type'] = 'application/json';
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
