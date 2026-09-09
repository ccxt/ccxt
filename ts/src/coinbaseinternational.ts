
// ----------------------------------------------------------------------------

import { sha256 } from '@noble/hashes/sha2.js';
import { jwt } from './base/functions/rsa.js';
import { ecdsa } from './base/functions/crypto.js';
import { p256 as P256 } from '@noble/curves/nist.js';
import Exchange from './abstract/coinbaseinternational.js';
import { ExchangeError, ArgumentsRequired, InvalidOrder, AuthenticationError } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Int, Num, OrderSide, OrderType, Order, Trade, Ticker, Str, Transaction, Balances, Tickers, Strings, Market, Currency, CurrencyInterface, TransferEntry, Position, FundingRateHistory, Currencies, Dict, NullableDict, int, OHLCV, Endpoint } from './base/types.js';

// ----------------------------------------------------------------------------

/**
 * @class coinbaseinternational
 * @augments Exchange
 */
export default class coinbaseinternational extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'coinbaseinternational',
            'name': 'Coinbase International',
            'countries': [ 'US' ],
            'certified': false,
            'pro': true,
            'rateLimit': 100, // 10 requests per second
            'version': 'v2',
            'userAgent': this.userAgents['chrome'],
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': true,
                'option': true,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
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
                'fetchAccounts': false,
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
                'fetchDepositsWithdrawals': true,
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
                'fetchMyBuys': false,
                'fetchMySells': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
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
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://github.com/ccxt/ccxt/assets/43336371/866ae638-6ab5-4ebf-ab2c-cdcce9545625',
                'api': {
                    'rest': 'https://drb.coinbase.com/api/v2',
                },
                'www': 'https://international.coinbase.com',
                'doc': [
                    'https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/derivatives/overview',
                    'https://docs.deribit.com',
                ],
                'fees': [
                    'https://help.coinbase.com/en/international-exchange/trading-deposits-withdrawals/international-exchange-fees',
                ],
                'referral': '',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'post': {
                        'auth': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'get': {
                        'disable_heartbeat': { 'cost': 1 } as Endpoint<Dict>,
                        'get_announcements': { 'cost': 1 } as Endpoint<Dict>,
                        'get_block_rfq_trades': { 'cost': 1 } as Endpoint<Dict>,
                        'get_book_summary_by_currency': { 'cost': 1 } as Endpoint<Dict>,
                        'get_book_summary_by_instrument': { 'cost': 1 } as Endpoint<Dict>,
                        'get_combo_details': { 'cost': 1 } as Endpoint<Dict>,
                        'get_combo_ids': { 'cost': 1 } as Endpoint<Dict>,
                        'get_combos': { 'cost': 1 } as Endpoint<Dict>,
                        'get_contract_size': { 'cost': 1 } as Endpoint<Dict>,
                        'get_currencies': { 'cost': 1 } as Endpoint<Dict>,
                        'get_delivery_prices': { 'cost': 1 } as Endpoint<Dict>,
                        'get_expirations': { 'cost': 1 } as Endpoint<Dict>,
                        'get_funding_chart_data': { 'cost': 1 } as Endpoint<Dict>,
                        'get_funding_rate_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_funding_rate_value': { 'cost': 1 } as Endpoint<Dict>,
                        'get_historical_volatility': { 'cost': 1 } as Endpoint<Dict>,
                        'get_index_chart_data': { 'cost': 1 } as Endpoint<Dict>,
                        'get_index_price': { 'cost': 1 } as Endpoint<Dict>,
                        'get_index_price_names': { 'cost': 1 } as Endpoint<Dict>,
                        'get_instrument': { 'cost': 1 } as Endpoint<Dict>,
                        'get_instruments': { 'cost': 1 } as Endpoint<Dict>,
                        'get_last_settlements_by_currency': { 'cost': 1 } as Endpoint<Dict>,
                        'get_last_settlements_by_instrument': { 'cost': 1 } as Endpoint<Dict>,
                        'get_last_trades_by_currency': { 'cost': 1 } as Endpoint<Dict>,
                        'get_last_trades_by_currency_and_time': { 'cost': 1 } as Endpoint<Dict>,
                        'get_last_trades_by_instrument': { 'cost': 1 } as Endpoint<Dict>,
                        'get_last_trades_by_instrument_and_time': { 'cost': 1 } as Endpoint<Dict>,
                        'get_mark_price_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_order_book': { 'cost': 1 } as Endpoint<Dict>,
                        'get_order_book_by_instrument_id': { 'cost': 1 } as Endpoint<Dict>,
                        'get_supported_index_names': { 'cost': 1 } as Endpoint<Dict>,
                        'get_time': { 'cost': 1 } as Endpoint<Dict>,
                        'get_trade_volumes': { 'cost': 1 } as Endpoint<Dict>,
                        'get_tradingview_chart_data': { 'cost': 1 } as Endpoint<Dict>,
                        'get_volatility_index_data': { 'cost': 1 } as Endpoint<Dict>,
                        'hello': { 'cost': 1 } as Endpoint<Dict>,
                        'set_heartbeat': { 'cost': 1 } as Endpoint<Dict>,
                        'status': { 'cost': 1 } as Endpoint<Dict>,
                        'subscribe': { 'cost': 1 } as Endpoint<Dict>,
                        'test': { 'cost': 1 } as Endpoint<Dict>,
                        'ticker': { 'cost': 1 } as Endpoint<Dict>,
                        'unsubscribe': { 'cost': 1 } as Endpoint<Dict>,
                        'unsubscribe_all': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
                'private': {
                    'get': {
                        'accept_block_rfq': { 'cost': 1 } as Endpoint<Dict>,
                        'add_block_rfq_quote': { 'cost': 1 } as Endpoint<Dict>,
                        'approve_block_trade': { 'cost': 1 } as Endpoint<Dict>,
                        'buy': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_all': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_all_block_rfq_quotes': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_all_by_currency': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_all_by_currency_pair': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_all_by_instrument': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_all_by_kind_or_type': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_block_rfq': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_block_rfq_quote': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_block_rfq_trigger': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_by_label': { 'cost': 1 } as Endpoint<Dict>,
                        'change_margin_model': { 'cost': 1 } as Endpoint<Dict>,
                        'close_position': { 'cost': 1 } as Endpoint<Dict>,
                        'create_block_rfq': { 'cost': 1 } as Endpoint<Dict>,
                        'create_combo': { 'cost': 1 } as Endpoint<Dict>,
                        'disable_cancel_on_disconnect': { 'cost': 1 } as Endpoint<Dict>,
                        'edit': { 'cost': 1 } as Endpoint<Dict>,
                        'edit_block_rfq_quote': { 'cost': 1 } as Endpoint<Dict>,
                        'edit_by_label': { 'cost': 1 } as Endpoint<Dict>,
                        'enable_cancel_on_disconnect': { 'cost': 1 } as Endpoint<Dict>,
                        'execute_block_trade': { 'cost': 1 } as Endpoint<Dict>,
                        'get_access_log': { 'cost': 1 } as Endpoint<Dict>,
                        'get_account_summaries': { 'cost': 1 } as Endpoint<Dict>,
                        'get_account_summary': { 'cost': 1 } as Endpoint<Dict>,
                        'get_block_rfq_makers': { 'cost': 1 } as Endpoint<Dict>,
                        'get_block_rfq_quotes': { 'cost': 1 } as Endpoint<Dict>,
                        'get_block_rfq_user_info': { 'cost': 1 } as Endpoint<Dict>,
                        'get_block_rfqs': { 'cost': 1 } as Endpoint<Dict>,
                        'get_block_trade': { 'cost': 1 } as Endpoint<Dict>,
                        'get_block_trade_requests': { 'cost': 1 } as Endpoint<Dict>,
                        'get_block_trades': { 'cost': 1 } as Endpoint<Dict>,
                        'get_broker_trade_requests': { 'cost': 1 } as Endpoint<Dict>,
                        'get_broker_trades': { 'cost': 1 } as Endpoint<Dict>,
                        'get_cancel_on_disconnect': { 'cost': 1 } as Endpoint<Dict>,
                        'get_leg_prices': { 'cost': 1 } as Endpoint<Dict>,
                        'get_margins': { 'cost': 1 } as Endpoint<Dict>,
                        'get_open_orders': { 'cost': 1 } as Endpoint<Dict>,
                        'get_open_orders_by_currency': { 'cost': 1 } as Endpoint<Dict>,
                        'get_open_orders_by_instrument': { 'cost': 1 } as Endpoint<Dict>,
                        'get_open_orders_by_label': { 'cost': 1 } as Endpoint<Dict>,
                        'get_order_history_by_currency': { 'cost': 1 } as Endpoint<Dict>,
                        'get_order_history_by_instrument': { 'cost': 1 } as Endpoint<Dict>,
                        'get_order_margin_by_ids': { 'cost': 1 } as Endpoint<Dict>,
                        'get_order_state': { 'cost': 1 } as Endpoint<Dict>,
                        'get_order_state_by_label': { 'cost': 1 } as Endpoint<Dict>,
                        'get_position': { 'cost': 1 } as Endpoint<Dict>,
                        'get_positions': { 'cost': 1 } as Endpoint<Dict>,
                        'get_settlement_history_by_currency': { 'cost': 1 } as Endpoint<Dict>,
                        'get_settlement_history_by_instrument': { 'cost': 1 } as Endpoint<Dict>,
                        'get_transaction_log': { 'cost': 10 } as Endpoint<Dict>, // 1 request per second
                        'get_trigger_order_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_user_trades_by_currency': { 'cost': 1 } as Endpoint<Dict>,
                        'get_user_trades_by_currency_and_time': { 'cost': 1 } as Endpoint<Dict>,
                        'get_user_trades_by_instrument': { 'cost': 1 } as Endpoint<Dict>,
                        'get_user_trades_by_instrument_and_time': { 'cost': 1 } as Endpoint<Dict>,
                        'get_user_trades_by_order': { 'cost': 1 } as Endpoint<Dict>,
                        'invalidate_block_trade_signature': { 'cost': 1 } as Endpoint<Dict>,
                        'logout': { 'cost': 1 } as Endpoint<Dict>,
                        'pme/simulate': { 'cost': 1 } as Endpoint<Dict>,
                        'reject_block_trade': { 'cost': 1 } as Endpoint<Dict>,
                        'sell': { 'cost': 1 } as Endpoint<Dict>,
                        'simulate_block_trade': { 'cost': 1 } as Endpoint<Dict>,
                        'simulate_portfolio': { 'cost': 1 } as Endpoint<Dict>,
                        'subscribe': { 'cost': 1 } as Endpoint<Dict>,
                        'unsubscribe': { 'cost': 1 } as Endpoint<Dict>,
                        'unsubscribe_all': { 'cost': 1 } as Endpoint<Dict>,
                        'verify_block_trade': { 'cost': 1 } as Endpoint<Dict>,
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
                'exact': {
                    '13004': AuthenticationError,
                },
                'broad': {
                    'invalid_credentials': AuthenticationError,
                },
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '6h': '360',
                '1d': '1D',
            },
            'options': {
                'brokerId': 'nfqkvdjp',
                'portfolio': '', // default portfolio id
                'networksById': {
                    'networks/algorand-mainnet': 'ALGO',
                    'networks/aptos-mainnet': 'APT',
                    'networks/arbitrum-mainnet': 'ARBITRUM',
                    'networks/avacchain-mainnet': 'AVAX',
                    'networks/base-mainnet': 'BASE',
                    'networks/bitcoin-mainnet': 'BTC',
                    'networks/bitcoincash-mainnet': 'BCH',
                    'networks/bittensor-mainnet': 'TAO',
                    'networks/bsc-mainnet': 'BSC',
                    'networks/cardano-mainnet': 'ADA',
                    'networks/cosmos-mainnet': 'ATOM',
                    'networks/dfinity-mainnet': 'ICP',
                    'networks/doge-mainnet': 'DOGE',
                    'networks/ethereum-mainnet': 'ETH',
                    'networks/filecoin-mainnet': 'FIL',
                    'networks/hedera-mainnet': 'HBAR',
                    'networks/hyperliquid-mainnet': 'HYPE',
                    'networks/litecoin-mainnet': 'LTC',
                    'networks/near-mainnet': 'NEAR',
                    'networks/optimism-mainnet': 'OPTIMISM',
                    'networks/polkadot-mainnet': 'DOT',
                    'networks/polygon-mainnet': 'MATIC',
                    'networks/ripple-mainnet': 'XRP',
                    'networks/solana-mainnet': 'SOL',
                    'networks/stellar-mainnet': 'XLM',
                    'networks/sui-mainnet': 'SUI',
                    'networks/vechain-mainnet': 'VET',
                },
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': true,
                        'stopLossPrice': false, // todo implementation
                        'takeProfitPrice': false, // todo implementation
                        'attachedStopLossTakeProfit': undefined, // todo implementation
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': true,
                            'GTC': true, // has 30 days max
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': 10000,
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 300,
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': {
                        'extends': 'default',
                    },
                },
                'future': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': {
                        'extends': 'default',
                    },
                },
                'option': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': {
                        'extends': 'default',
                    },
                },
            },
        });
    }

    /**
     * @method
     * @name coinbaseinternational#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.cdp.coinbase.com/api-reference/supporting/public-get_time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    override async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetGetTime (params);
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": 1788865676744,
        //         "usIn": 1788865676744468,
        //         "usOut": 1788865676744569,
        //         "usDiff": 101,
        //         "testnet": false
        //     }
        //
        const timestamp = this.safeInteger (response, 'result');
        return timestamp;
    }

    /**
     * @method
     * @name coinbaseinternational#fetchMarkets
     * @description retrieves data on all markets for coinbaseinternational
     * @see https://docs.cdp.coinbase.com/api-reference/market-data/public-get_instruments
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetGetInstruments (params);
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 1788770469,
        //         "result": [
        //             {
        //                 "block_trade_tick_size": 0.01,
        //                 "lot_size": 100,
        //                 "settlement_currency": "USDC",
        //                 "index_id": 34000004,
        //                 "creation_timestamp": 1786804445000,
        //                 "state": "open",
        //                 "max_liquidation_commission": 0.01,
        //                 "base_currency_uuid": "b1646860-6b23-5f7d-a506-cba0902f0ca9",
        //                 "taker_commission": 3.5e-4,
        //                 "base_currency": "AAVE",
        //                 "kind": "future",
        //                 "underlying_type": "crypto",
        //                 "instrument_id": 675320,
        //                 "is_active": true,
        //                 "instrument_type": "linear",
        //                 "future_type": "linear",
        //                 "expiration_timestamp": 32503708800000,
        //                 "max_leverage": 50,
        //                 "counter_currency": "USDC",
        //                 "tick_size_steps": [],
        //                 "quote_currency_uuid": "2b92315d-eab7-5bef-84fa-089a131333f5",
        //                 "maker_commission": 1.5e-4,
        //                 "tick_size": 0.01,
        //                 "settlement_period": "perpetual",
        //                 "product_group": "TIER_3",
        //                 "block_trade_commission": 2.5e-4,
        //                 "min_trade_amount": 0.01,
        //                 "contract_size": 0.01,
        //                 "price_index": "aave_usdc",
        //                 "quote_currency": "USDC",
        //                 "instrument_name": "AAVE_USDC-PERPETUAL",
        //                 "max_non_default_leverage": 5.0,
        //                 "block_trade_min_trade_amount": 200000
        //             },
        //             {
        //                 "state": "open",
        //                 "price_index": "eth_usd",
        //                 "kind": "option",
        //                 "instrument_name": "ETH-25JUN27-5500-P",
        //                 "maker_commission": 0.0003,
        //                 "taker_commission": 0.0003,
        //                 "instrument_type": "reversed",
        //                 "instrument_id": 677208,
        //                 "expiration_timestamp": 1813910400000,
        //                 "underlying_type": "crypto",
        //                 "product_group": "ETH",
        //                 "creation_timestamp": 1787173020000,
        //                 "is_active": true,
        //                 "contract_size": 1.0,
        //                 "tick_size": 0.0001,
        //                 "strike": 5.5e3,
        //                 "counter_currency": "USD",
        //                 "option_type": "put",
        //                 "block_trade_commission": 0.0003,
        //                 "min_trade_amount": 1,
        //                 "block_trade_min_trade_amount": 250,
        //                 "block_trade_tick_size": 0.0001,
        //                 "settlement_currency": "ETH",
        //                 "settlement_period": "month",
        //                 "base_currency": "ETH",
        //                 "index_id": 2000033,
        //                 "quote_currency": "ETH",
        //                 "tick_size_steps": [
        //                     {
        //                         "tick_size": 0.0005,
        //                         "above_price": 0.005
        //                     }
        //                 ],
        //                 "lot_size": 10,
        //                 "base_currency_uuid": "d85dce9b-5b73-5c3c-8978-522ce1d1c1b4",
        //                 "quote_currency_uuid": "d85dce9b-5b73-5c3c-8978-522ce1d1c1b4"
        //             }
        //         ],
        //         "usIn": 1788770471610519,
        //         "usOut": 1788770471610767,
        //         "usDiff": 248,
        //         "testnet": false
        //     }
        //
        const instruments = this.safeList (response, 'result', []);
        const parsedMarkets = this.parseMarkets (instruments);
        return parsedMarkets;
    }

    override parseMarket (market: Dict): Market {
        const instrumentName = this.safeString (market, 'instrument_name');
        const lowercaseId = this.safeStringLower (market, 'instrument_name');
        const baseId = this.safeString (market, 'base_currency');
        const quoteId = this.safeString (market, 'counter_currency');
        const settleId = this.safeString (market, 'settlement_currency', quoteId);
        const kind = this.safeString (market, 'kind', '');
        const settlementPeriod = this.safeString (market, 'settlement_period');
        const isSpot = (kind === 'spot');
        const isPerpetual = (settlementPeriod === 'perpetual');
        const isFuture = (kind === 'future') && !isPerpetual;
        const isOption = (kind === 'option');
        const comboPosition = kind.indexOf ('combo');
        const isComboMarket = comboPosition >= 0;
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        let type = 'swap';
        if (isSpot) {
            type = 'spot';
        } else if (isFuture) {
            type = 'future';
        } else if (isOption) {
            type = 'option';
        }
        let symbol = instrumentName;
        if (!isComboMarket) {
            symbol = base + '/' + quote;
            if (!isSpot) {
                symbol = symbol + ':' + settle;
            }
        }
        const linear = settle === quote;
        const inverse = settle !== quote;
        const minTradeAmount = this.safeNumber (market, 'min_trade_amount');
        const tickSize = this.safeNumber (market, 'tick_size');
        const expiry = this.safeInteger (market, 'expiration_timestamp');
        const active = this.safeBool (market, 'is_active');
        const strike = this.safeNumber (market, 'strike');
        const optionType = this.safeString (market, 'option_type');
        if (isOption || isFuture) {
            const expiryString = this.yymmdd (expiry, '');
            symbol = symbol + '-' + expiryString;
        }
        if (isOption) {
            let optionTypeLetter = 'P';
            if (optionType === 'call') {
                optionTypeLetter = 'C';
            }
            const strikeString = this.numberToString (strike);
            symbol = symbol + '-' + strikeString + '-' + optionTypeLetter;
        }
        const marketStructure = {
            'id': instrumentName,
            'lowercaseId': lowercaseId,
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
            'swap': isPerpetual,
            'future': isFuture,
            'option': isOption,
            'active': active,
            'contract': !isSpot,
            'linear': linear,
            'inverse': inverse,
            'taker': this.safeNumber (market, 'taker_commission'),
            'maker': this.safeNumber (market, 'maker_commission'),
            'contractSize': this.safeNumber (market, 'contract_size'),
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'strike': strike,
            'optionType': optionType,
            'precision': {
                'amount': minTradeAmount,
                'price': tickSize,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': this.safeNumber (market, 'max_leverage'),
                },
                'amount': {
                    'min': minTradeAmount,
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
            'created': this.safeInteger (market, 'creation_timestamp'),
        };
        const parsedMarket = this.safeMarketStructure (marketStructure);
        return parsedMarket;
    }

    /**
     * @method
     * @name coinbaseinternational#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.cdp.coinbase.com/api-reference/market-data/public-get_currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    override async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetGetCurrencies (params);
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": [
        //             {
        //                 "decimals": 6,
        //                 "currency": "AAVE",
        //                 "apr": 0.0,
        //                 "min_withdrawal_fee": 0.0,
        //                 "withdrawal_fee": 0.0,
        //                 "coin_type": "AAVE",
        //                 "withdrawal_priorities": [],
        //                 "network_fee": 0.0,
        //                 "coinbase_networks": [
        //                     {
        //                         "display_name": "Ethereum",
        //                         "resource_name": "networks/ethereum-mainnet"
        //                     }
        //                 ],
        //                 "network_currency": "AAVE",
        //                 "min_confirmations": 0,
        //                 "currency_long": "Aave",
        //                 "in_cross_collateral_pool": false,
        //                 "onchain_operations_precision": 6,
        //                 "currency_uuid": "b1646860-6b23-5f7d-a506-cba0902f0ca9"
        //             }
        //         ],
        //         "usIn": 1788866173661805,
        //         "usOut": 1788866173664998,
        //         "usDiff": 3193,
        //         "testnet": false
        //     }
        //
        const currencies = this.safeList (response, 'result', []);
        return this.parseCurrencies (currencies);
    }

    override parseCurrency (currency: Dict): CurrencyInterface {
        //
        //     {
        //         "decimals": 6,
        //         "currency": "AAVE",
        //         "apr": 0.0,
        //         "min_withdrawal_fee": 0.0,
        //         "withdrawal_fee": 0.0,
        //         "coin_type": "AAVE",
        //         "withdrawal_priorities": [],
        //         "network_fee": 0.0,
        //         "coinbase_networks": [
        //             {
        //                 "display_name": "Ethereum",
        //                 "resource_name": "networks/ethereum-mainnet"
        //             }
        //         ],
        //         "network_currency": "AAVE",
        //         "min_confirmations": 0,
        //         "currency_long": "Aave",
        //         "in_cross_collateral_pool": false,
        //         "onchain_operations_precision": 6,
        //         "currency_uuid": "b1646860-6b23-5f7d-a506-cba0902f0ca9"
        //     }
        //
        const currencyId = this.safeString (currency, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const precision = this.safeInteger2 (currency, 'onchain_operations_precision', 'decimals');
        const networkFee = this.safeNumber (currency, 'network_fee');
        const withdrawalFee = this.safeNumber (currency, 'withdrawal_fee');
        const rawNetworks = this.safeList (currency, 'coinbase_networks', []);
        const networks: Dict = {};
        for (let i = 0; i < rawNetworks.length; i++) {
            const rawNetwork = rawNetworks[i];
            const networkId = this.safeString (rawNetwork, 'resource_name');
            const network = this.networkIdToCode (networkId, code);
            if (network !== undefined) {
                networks[network] = this.safeNetwork ({
                    'info': rawNetwork,
                    'id': networkId,
                    'name': this.safeString (rawNetwork, 'display_name'),
                    'network': network,
                    'active': undefined,
                    'deposit': undefined,
                    'withdraw': undefined,
                    'precision': precision,
                    'fee': networkFee,
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
                });
            }
        }
        return this.safeCurrencyStructure ({
            'id': currencyId,
            'name': this.safeString (currency, 'currency_long'),
            'code': code,
            'precision': precision,
            'info': currency,
            'active': undefined,
            'deposit': undefined,
            'withdraw': undefined,
            'networks': networks,
            'fee': withdrawalFee,
            'fees': {
                'withdraw': withdrawalFee,
            },
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
        });
    }

    /**
     * @method
     * @name coinbaseinternational#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.cdp.coinbase.com/api-reference/market-data/public-get_tradingview_chart_data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, default 100 max 10000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = 100, params = {}): Promise<OHLCV[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, 10000) as OHLCV[];
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_name': market['id'],
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
        };
        const duration = this.parseTimeframe (timeframe);
        const now = this.milliseconds ();
        if (since === undefined) {
            if (limit === undefined) {
                limit = 100;
            }
            request['start_timestamp'] = now - (limit - 1) * duration * 1000;
            request['end_timestamp'] = now;
        } else {
            since = Math.max (since - 1, 0);
            request['start_timestamp'] = since;
            if (limit === undefined) {
                request['end_timestamp'] = now;
            } else {
                request['end_timestamp'] = this.sum (since, limit * duration * 1000);
            }
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        const response = await this.publicGetGetTradingviewChartData (this.extend (request, params));
        //
        //     {
        //         "usOut": 1788853501919338,
        //         "usIn": 1788853501916627,
        //         "usDiff": 2711,
        //         "testnet": false,
        //         "result": {
        //             "volume": [0.0001, 0.0168, 0],
        //             "ticks": [1788853380000, 1788853440000, 1788853500000],
        //             "status": "ok",
        //             "open": [78494.0, 78444.0, 78441.0],
        //             "low": [ 78494.0, 78441.0, 78441.0],
        //             "high": [78494.0, 78444.0, 78441.0],
        //             "cost": [7.8494, 1317.8151, 0],
        //             "close": [78494.0, 78441.0, 78441.0]
        //         },
        //         "jsonrpc": "2.0"
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        const candles = this.convertTradingViewToOHLCV (result as any, 'ticks', 'open', 'high', 'low', 'close', 'volume', true);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        const isArray = Array.isArray (ohlcv);
        if (isArray) {
            return ohlcv as OHLCV;
        }
        return [
            this.parse8601 (this.safeString2 (ohlcv, 'start', 'time')),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name coinbaseinternational#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.cdp.coinbase.com/api-reference/market-data/public-get_funding_rate_history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    override async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const duration = this.parseTimeframe ('1h') * 1000;
        const now = this.milliseconds ();
        if (since === undefined) {
            since = now - (30 * 24 * 60 * 60 * 1000);
        }
        const request: Dict = {
            'instrument_name': market['id'],
            'start_timestamp': since,
            'end_timestamp': now,
        };
        if (limit !== undefined) {
            const endTimestamp = this.sum (since, limit * duration);
            request['end_timestamp'] = endTimestamp;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        const response = await this.publicGetGetFundingRateHistory (this.extend (request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": [
        //             {
        //                 "timestamp": 1786269600000,
        //                 "index_price": 64832.34,
        //                 "interest_8h": 0.0,
        //                 "interest_1h": 0.0,
        //                 "prev_index_price": 64773.05
        //             },
        //         ],
        //         "usIn": 1788858185989192,
        //         "usOut": 1788858185991663,
        //         "usDiff": 2471,
        //         "testnet": false
        //     }
        //
        const rawRates = this.safeList (response, 'result', []);
        return this.parseFundingRateHistories (rawRates, market, since, limit);
    }

    override parseFundingRateHistory (info: any, market: Market = undefined) {
        return this.parseFundingRate (info, market) as FundingRateHistory;
    }

    override parseFundingRate (contract: any, market: Market = undefined) {
        //
        // fetchFundingRateHistory
        //
        //     {
        //         "timestamp": 1786269600000,
        //         "index_price": 64832.34,
        //         "interest_8h": 0.0,
        //         "interest_1h": 0.0,
        //         "prev_index_price": 64773.05
        //     }
        //
        const timestamp = this.safeInteger (contract, 'timestamp');
        return {
            'info': contract,
            'symbol': this.safeSymbol (undefined, market),
            'markPrice': undefined,
            'indexPrice': this.safeNumber (contract, 'index_price'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'interest_8h'),
            'fundingTimestamp': timestamp,
            'fundingDatetime': this.iso8601 (timestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    /**
     * @method
     * @name coinbaseinternational#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.cdp.coinbase.com/api-reference/market-data/public-ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols);
        if (symbols === undefined) {
            symbols = this.symbols;
        }
        const tickers: Dict = {};
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const ticker = await this.fetchTicker (symbol, params);
            tickers[symbol] = ticker;
        }
        return this.filterByArray (tickers, 'symbol', symbols, true);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cdp.coinbase.com/api-reference/market-data/public-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_name': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 1788867257,
        //         "result": {
        //             "timestamp": 1788867258984,
        //             "state": "open",
        //             "stats": {
        //                 "high": 79695.0,
        //                 "low": 78184.0,
        //                 "price_change": -1.2347,
        //                 "volume": 15.0492,
        //                 "volume_usd": 1188223.3,
        //                 "volume_notional": 1188367.9964
        //             },
        //             "index_price": 78451.93,
        //             "instrument_name": "BTC_USDC",
        //             "last_price": 78469.0,
        //             "min_price": 76882.0,
        //             "max_price": 80021.0,
        //             "mark_price": 78451.93,
        //             "best_ask_price": 78493.0,
        //             "best_bid_price": 78465.0,
        //             "best_ask_amount": 0.0004,
        //             "best_bid_amount": 0.001
        //         },
        //         "usIn": 1788867259058846,
        //         "usOut": 1788867259060040,
        //         "usDiff": 1194,
        //         "testnet": false
        //     }
        //
        const ticker = this.safeDict (response, 'result', {});
        return this.parseTicker (ticker, market);
    }

    override parseTicker (ticker: object, market: Market = undefined): Ticker {
        //
        //     {
        //         "timestamp": 1788867258984,
        //         "state": "open",
        //         "stats": {
        //             "high": 79695.0,
        //             "low": 78184.0,
        //             "price_change": -1.2347,
        //             "volume": 15.0492,
        //             "volume_usd": 1188223.3,
        //             "volume_notional": 1188367.9964
        //         },
        //         "index_price": 78451.93,
        //         "instrument_name": "BTC_USDC",
        //         "last_price": 78469.0,
        //         "min_price": 76882.0,
        //         "max_price": 80021.0,
        //         "mark_price": 78451.93,
        //         "best_ask_price": 78493.0,
        //         "best_bid_price": 78465.0,
        //         "best_ask_amount": 0.0004,
        //         "best_bid_amount": 0.001
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const stats = this.safeDict (ticker, 'stats', {});
        const last = this.safeNumber (ticker, 'last_price');
        const marketId = this.safeString (ticker, 'instrument_name');
        return this.safeTicker ({
            'info': ticker,
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'bid': this.safeNumber (ticker, 'best_bid_price'),
            'bidVolume': this.safeNumber (ticker, 'best_bid_amount'),
            'ask': this.safeNumber (ticker, 'best_ask_price'),
            'askVolume': this.safeNumber (ticker, 'best_ask_amount'),
            'high': this.safeNumber (stats, 'high'),
            'low': this.safeNumber (stats, 'low'),
            'open': undefined,
            'close': last,
            'last': last,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'vwap': undefined,
            'baseVolume': this.safeNumber (stats, 'volume'),
            'quoteVolume': this.safeNumber (stats, 'volume_notional'),
            'previousClose': undefined,
            'markPrice': this.safeNumber (ticker, 'mark_price'),
            'indexPrice': this.safeNumber (ticker, 'index_price'),
        });
    }

    /**
     * @method
     * @name coinbaseinternational#fetchOrderBook
     * @description fetches a market order book
     * @see https://docs.cdp.coinbase.com/api-reference/market-data/public-get_order_book
     * @param {string} symbol unified market symbol
     * @param {int} [limit] the maximum number of bids and asks to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_name': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetGetOrderBook (this.extend (request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "timestamp": 1788868357984,
        //             "state": "open",
        //             "stats": {
        //                 "high": 79695.0,
        //                 "low": 78184.0,
        //                 "price_change": -1.2564,
        //                 "volume": 15.14,
        //                 "volume_usd": 1195335.73,
        //                 "volume_notional": 1195481.8941
        //             },
        //             "change_id": 9047601566,
        //             "index_price": 78375.89,
        //             "instrument_name": "BTC_USDC",
        //             "bids": [
        //                 [78376.0, 0.0037],
        //                 [78373.0, 0.04],
        //                 [78369.0, 0.0006],
        //                 [78361.0, 0.001],
        //                 [78355.0, 0.001]
        //             ],
        //             "asks": [
        //                 [78419.0, 0.0015],
        //                 [78421.0, 0.0405],
        //                 [78431.0, 0.0008],
        //                 [78432.0, 0.0001],
        //                 [78433.0, 0.009]
        //             ],
        //             "last_price": 78436.0,
        //             "min_price": 76808.0,
        //             "max_price": 79944.0,
        //             "mark_price": 78375.89,
        //             "best_ask_price": 78419.0,
        //             "best_bid_price": 78376.0,
        //             "best_ask_amount": 0.0015,
        //             "best_bid_amount": 0.0037
        //         },
        //         "usIn": 1788868358451540,
        //         "usOut": 1788868358451883,
        //         "usDiff": 343,
        //         "testnet": false
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        const timestamp = this.safeInteger (result, 'timestamp');
        return this.parseOrderBook (result, market['symbol'], timestamp);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_account_summaries
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async fetchBalance (params = {}): Promise<Balances> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        await this.authenticateV2 ();
        const response = await this.privateGetGetAccountSummaries (params);
        //
        // {
        //     "id": 2515,
        //     "jsonrpc": "2.0",
        //     "result": {
        //         "block_rfq_self_match_prevention": true,
        //         "creation_timestamp": 1687352432143,
        //         "email": "user@example.com",
        //         "id": 10,
        //         "interuser_transfers_enabled": false,
        //         "login_enabled": false,
        //         "mmp_enabled": false,
        //         "referrer_id": null,
        //         "security_keys_enabled": false,
        //         "self_trading_extended_to_subaccounts": false,
        //         "self_trading_reject_mode": "cancel_maker",
        //         "summaries": [
        //         {
        //             "available_funds": 301.38059622,
        //             "available_withdrawal_funds": 301.35396172,
        //             "balance": 302.60065765,
        //             "cross_collateral_enabled": false,
        //             "currency": "BTC",
        //             "delta_total": 31.602958,
        //             "delta_total_map": {
        //             "btc_usd": 31.594357699
        //             },
        //             "equity": 302.61869214,
        //             "estimated_liquidation_ratio": 0.10098722,
        //             "estimated_liquidation_ratio_map": {
        //             "btc_usd": 0.1009872222854525
        //             },
        //             "fee_balance": 0,
        //             "fees": {
        //             "btc_usd": {
        //                 "future": {
        //                 "block_trade": 0.3,
        //                 "default": {
        //                     "maker": -0.0001,
        //                     "taker": 0.00035000000000000005,
        //                     "type": "fixed"
        //                 }
        //                 },
        //                 "option": {
        //                 "block_trade": 0.625,
        //                 "default": {
        //                     "maker": 0.625,
        //                     "taker": 0.625,
        //                     "type": "relative"
        //                 }
        //                 },
        //                 "perpetual": {
        //                 "block_trade": 0.3,
        //                 "default": {
        //                     "maker": -0.0001,
        //                     "taker": 0.00035000000000000005,
        //                     "type": "fixed"
        //                 }
        //                 }
        //             }
        //             },
        //             "futures_pl": -0.32434225,
        //             "futures_session_rpl": -0.03258105,
        //             "futures_session_upl": 0.05921555,
        //             "initial_margin": 1.24669592,
        //             "limits": {
        //             "limits_per_currency": false,
        //             "matching_engine": {
        //                 "cancel_all": {
        //                 "burst": 250,
        //                 "rate": 200
        //                 },
        //                 "guaranteed_quotes": {
        //                 "burst": 2,
        //                 "rate": 2
        //                 },
        //                 "max_quotes": {
        //                 "burst": 10,
        //                 "rate": 10
        //                 },
        //                 "quotes": {
        //                 "burst": 500,
        //                 "rate": 500
        //                 },
        //                 "spot": {
        //                 "burst": 250,
        //                 "rate": 200
        //                 },
        //                 "trading": {
        //                 "total": {
        //                     "burst": 250,
        //                     "rate": 200
        //                 }
        //                 }
        //             },
        //             "non_matching_engine": {
        //                 "burst": 1500,
        //                 "rate": 1000
        //             }
        //             },
        //             "maintenance_margin": 0.8857841,
        //             "margin_balance": 302.62729214,
        //             "margin_model": "segregated_sm",
        //             "options_delta": -1.01962,
        //             "options_gamma": 0.00001,
        //             "options_gamma_map": {
        //             "btc_usd": 0.00001
        //             },
        //             "options_pl": -0.0065,
        //             "options_session_rpl": 0,
        //             "options_session_upl": -0.0065,
        //             "options_theta": 15.97071,
        //             "options_value": -0.0086,
        //             "options_vega": 0.0858,
        //             "options_vega_map": {
        //             "btc_usd": 0.0858
        //             },
        //             "portfolio_margining_enabled": false,
        //             "projected_delta_total": 32.613978,
        //             "projected_initial_margin": 1.01529592,
        //             "projected_maintenance_margin": 0.7543841,
        //             "session_rpl": -0.03258105,
        //             "session_upl": 0.05271555,
        //             "spot_reserve": 0,
        //             "total_pl": -0.33084225
        //         },
        //         {
        //             "additional_reserve": 0,
        //             "available_funds": 99.999598,
        //             "available_withdrawal_funds": 99.999597,
        //             "balance": 100,
        //             "cross_collateral_enabled": false,
        //             "currency": "ETH",
        //             "delta_total": 0,
        //             "delta_total_map": {
        //             "eth_usd": 0
        //             },
        //             "equity": 100,
        //             "estimated_liquidation_ratio": 0,
        //             "estimated_liquidation_ratio_map": {
        //             "eth_usd": 0
        //             },
        //             "fee_balance": 0,
        //             "fees": {
        //             "eth_usd": {
        //                 "future": {
        //                 "block_trade": 0.2,
        //                 "default": {
        //                     "maker": -0.00005,
        //                     "taker": 0.00025,
        //                     "type": "fixed"
        //                 }
        //                 },
        //                 "option": {
        //                 "block_trade": 0.5,
        //                 "default": {
        //                     "maker": 0.5,
        //                     "taker": 0.5,
        //                     "type": "relative"
        //                 }
        //                 },
        //                 "perpetual": {
        //                 "block_trade": 0.2,
        //                 "default": {
        //                     "maker": -0.00005,
        //                     "taker": 0.00025,
        //                     "type": "fixed"
        //                 }
        //                 }
        //             }
        //             },
        //             "futures_pl": 0,
        //             "futures_session_rpl": 0,
        //             "futures_session_upl": 0,
        //             "initial_margin": 0.000402,
        //             "limits": {
        //             "limits_per_currency": false,
        //             "matching_engine": {
        //                 "cancel_all": {
        //                 "burst": 250,
        //                 "rate": 200
        //                 },
        //                 "guaranteed_quotes": {
        //                 "burst": 2,
        //                 "rate": 2
        //                 },
        //                 "max_quotes": {
        //                 "burst": 10,
        //                 "rate": 10
        //                 },
        //                 "quotes": {
        //                 "burst": 500,
        //                 "rate": 500
        //                 },
        //                 "spot": {
        //                 "burst": 250,
        //                 "rate": 200
        //                 },
        //                 "trading": {
        //                 "total": {
        //                     "burst": 250,
        //                     "rate": 200
        //                 }
        //                 }
        //             },
        //             "non_matching_engine": {
        //                 "burst": 1500,
        //                 "rate": 1000
        //             }
        //             },
        //             "maintenance_margin": 0,
        //             "margin_balance": 100,
        //             "margin_model": "segregated_sm",
        //             "options_delta": 0,
        //             "options_gamma": 0,
        //             "options_gamma_map": {},
        //             "options_pl": 0,
        //             "options_session_rpl": 0,
        //             "options_session_upl": 0,
        //             "options_theta": 0,
        //             "options_theta_map": {},
        //             "options_value": 0,
        //             "options_vega": 0,
        //             "options_vega_map": {},
        //             "portfolio_margining_enabled": false,
        //             "projected_delta_total": 0,
        //             "projected_initial_margin": 0.0002,
        //             "projected_maintenance_margin": 0,
        //             "session_rpl": 0,
        //             "session_upl": 0,
        //             "spot_reserve": 0.0002,
        //             "total_pl": 0
        //         }
        //         ],
        //         "system_name": "user",
        //         "type": "main",
        //         "username": "user"
        //     }
        // }
        //
        const result = this.safeDict (response, 'result', {});
        const balances = this.safeDict (result, 'summaries', []);
        const balance = this.parseBalance (balances);
        return balance;
    }

    override parseBalance (response: any): Balances {
        const currencyId = this.safeString (response, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const result: Dict = {
            'info': response,
        };
        const account = this.account ();
        account['free'] = this.safeString (response, 'available_funds');
        account['total'] = this.safeString (response, 'equity');
        if (code !== undefined) {
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_transaction_log
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest transfer to fetch
     * @param {string} [params.continuation] continuation token for pagination
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    override async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<TransferEntry[]> {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransfers() requires a currency code argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const currency = this.currency (code);
        const now = this.milliseconds ();
        if (since === undefined) {
            since = now - (30 * 24 * 60 * 60 * 1000);
        }
        const request: Dict = {
            'currency': currency['id'],
            'start_timestamp': since,
            'end_timestamp': now,
            'query': 'transfer',
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        await this.authenticateV2 ();
        const response = await this.privateGetGetTransactionLog (this.extend (request, params));
        //
        //     {
        //         "id": 4,
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "continuation": 61282,
        //             "logs": [
        //                 {
        //                     "balance": 3001.22270418,
        //                     "cashflow": -2.5,
        //                     "change": -2.5,
        //                     "commission": 0,
        //                     "currency": "BTC",
        //                     "equity": 3000.9275869,
        //                     "id": 61312,
        //                     "info": {
        //                         "other_user": "Subaccount",
        //                         "other_user_id": 27,
        //                         "transfer_type": "subaccount"
        //                     },
        //                     "instrument_name": null,
        //                     "interest_pl": null,
        //                     "order_id": null,
        //                     "position": null,
        //                     "price": null,
        //                     "side": "-",
        //                     "timestamp": 1613659830333,
        //                     "trade_id": null,
        //                     "type": "transfer",
        //                     "user_id": 7,
        //                     "user_seq": 6009,
        //                     "username": "TestUser"
        //                 },
        //             ]
        //         }
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        const transfers = this.safeList (result, 'logs', []);
        return this.parseTransfers (transfers, currency, since, limit);
    }

    override parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        //
        //     {
        //         "balance": 3001.22270418,
        //         "cashflow": -2.5,
        //         "change": -2.5,
        //         "commission": 0,
        //         "currency": "BTC",
        //         "equity": 3000.9275869,
        //         "id": 61312,
        //         "info": {
        //             "other_user": "Subaccount",
        //             "other_user_id": 27,
        //             "transfer_type": "subaccount"
        //         },
        //         "instrument_name": null,
        //         "interest_pl": null,
        //         "order_id": null,
        //         "position": null,
        //         "price": null,
        //         "side": "-",
        //         "timestamp": 1613659830333,
        //         "trade_id": null,
        //         "type": "transfer",
        //         "user_id": 7,
        //         "user_seq": 6009,
        //         "username": "TestUser"
        //     }
        //
        const transactionTimestamp = this.safeInteger (transfer, 'timestamp');
        const currencyId = this.safeString (transfer, 'currency');
        const info = this.safeDict (transfer, 'info', {});
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'id'),
            'timestamp': transactionTimestamp,
            'datetime': this.iso8601 (transactionTimestamp),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (transfer, 'change'),
            'fromAccount': this.safeString (transfer, 'username'),
            'toAccount': this.safeString (info, 'other_user'),
            'status': 'ok',
        };
    }

    /**
     * @method
     * @name coinbaseinternational#fetchPosition
     * @description fetch data on an open position
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    override async fetchPosition (symbol: string, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_name': market['id'],
        };
        await this.authenticateV2 ();
        const response = await this.privateGetGetPosition (this.extend (request, params));
        //
        //     {
        //         "id": 404,
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "average_price": 0,
        //             "delta": 0,
        //             "direction": "buy",
        //             "estimated_liquidation_price": 0,
        //             "floating_profit_loss": 0,
        //             "index_price": 3555.86,
        //             "initial_margin": 0,
        //             "instrument_name": "BTC-PERPETUAL",
        //             "interest_value": 1.7362511643080387,
        //             "kind": "future",
        //             "leverage": 100,
        //             "maintenance_margin": 0,
        //             "mark_price": 3556.62,
        //             "open_orders_margin": 0.000165889,
        //             "realized_profit_loss": 0,
        //             "settlement_price": 3555.44,
        //             "size": 0,
        //             "size_currency": 0,
        //             "total_profit_loss": 0
        //         }
        //     }
        //
        const position = this.safeDict (response, 'result', {});
        return this.parsePosition (position, market);
    }

    override parsePosition (position: Dict, market: Market = undefined) {
        //
        //     {
        //         "average_price": 0,
        //         "delta": 0,
        //         "direction": "buy",
        //         "estimated_liquidation_price": 0,
        //         "floating_profit_loss": 0,
        //         "index_price": 3555.86,
        //         "initial_margin": 0,
        //         "instrument_name": "BTC-PERPETUAL",
        //         "interest_value": 1.7362511643080387,
        //         "kind": "future",
        //         "leverage": 100,
        //         "maintenance_margin": 0,
        //         "mark_price": 3556.62,
        //         "open_orders_margin": 0.000165889,
        //         "realized_profit_loss": 0,
        //         "settlement_price": 3555.44,
        //         "size": 0,
        //         "size_currency": 0,
        //         "total_profit_loss": 0
        //     }
        //
        const instrumentName = this.safeString (position, 'instrument_name');
        market = this.safeMarket (instrumentName, market);
        let side = this.safeString (position, 'direction');
        if (side === 'buy') {
            side = 'long';
        } else if (side === 'sell') {
            side = 'short';
        }
        const notional = this.safeString (position, 'size_currency');
        const initialMargin = this.safeString (position, 'initial_margin');
        const maintenanceMargin = this.safeString (position, 'maintenance_margin');
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'entryPrice': this.safeNumber (position, 'average_price'),
            'markPrice': this.safeNumber (position, 'mark_price'),
            'notional': this.parseNumber (Precise.stringAbs (notional)),
            'collateral': undefined,
            'unrealizedPnl': this.safeNumber (position, 'floating_profit_loss'),
            'side': side,
            'contracts': this.safeNumber (position, 'size'),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'timestamp': undefined,
            'datetime': undefined,
            'hedged': undefined,
            'maintenanceMargin': this.parseNumber (maintenanceMargin),
            'maintenanceMarginPercentage': undefined,
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': undefined,
            'leverage': this.safeNumber (position, 'leverage'),
            'liquidationPrice': this.safeNumber (position, 'estimated_liquidation_price'),
            'marginRatio': undefined,
            'marginMode': undefined,
            'percentage': undefined,
        });
    }

    /**
     * @method
     * @name coinbaseinternational#fetchPositions
     * @description fetch all open positions
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    override async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        await this.authenticateV2 ();
        const response = await this.privateGetGetPositions (params);
        //
        //     {
        //         "id": 2236,
        //         "jsonrpc": "2.0",
        //         "result": [
        //             {
        //                 "average_price": 7440.18,
        //                 "delta": 0.006687487,
        //                 "direction": "buy",
        //                 "estimated_liquidation_price": 1.74,
        //                 "floating_profit_loss": 0,
        //                 "index_price": 7466.79,
        //                 "initial_margin": 0.000197283,
        //                 "instrument_name": "BTC-PERPETUAL",
        //                 "interest_value": 1.7362511643080387,
        //                 "kind": "future",
        //                 "leverage": 34,
        //                 "maintenance_margin": 0.000143783,
        //                 "mark_price": 7476.65,
        //                 "open_orders_margin": 0.000197288,
        //                 "realized_funding": -1e-8,
        //                 "realized_profit_loss": -9e-9,
        //                 "settlement_price": 7476.65,
        //                 "size": 50,
        //                 "size_currency": 0.006687487,
        //                 "total_profit_loss": 0.000032781
        //             }
        //         ]
        //     }
        //
        const result = this.safeList (response, 'result', []);
        const positions = this.parsePositions (result);
        if (this.isEmpty (symbols)) {
            return positions;
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArrayPositions (positions, 'symbol', symbols, false);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_transaction_log
     * @param {string} code unified currency code
     * @param {int} [since] timestamp in ms of the earliest transaction to fetch
     * @param {int} [limit] the maximum number of transactions to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest transaction to fetch
     * @param {string} [params.query] transaction-log query filter
     * @param {string} [params.continuation] continuation token for pagination
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositsWithdrawals() requires a currency code argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const currency = this.currency (code);
        const now = this.milliseconds ();
        if (since === undefined) {
            since = now - (30 * 24 * 60 * 60 * 1000);
        }
        const request: Dict = {
            'currency': currency['id'],
            'start_timestamp': since,
            'end_timestamp': now,
        };
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        await this.authenticateV2 ();
        const response = await this.privateGetGetTransactionLog (this.extend (request, params));
        //
        //     {
        //         "id": 4,
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "continuation": 61282,
        //             "logs": [
        //                 {
        //                     "balance": 3003.72054712,
        //                     "cashflow": 0.65,
        //                     "change": 0.65,
        //                     "commission": 0,
        //                     "currency": "BTC",
        //                     "equity": 3003.4876111,
        //                     "id": 61291,
        //                     "info": {
        //                         "addr": "2N8prMvpZHr8aYqodX3S4yhz5wMxjY8La3p",
        //                         "deposit_type": "wallet",
        //                         "transaction": "de6eba075855f32c9510f338d3ca0900376cedcb9f7b142caccfbdc292d3237e"
        //                     },
        //                     "instrument_name": null,
        //                     "interest_pl": null,
        //                     "order_id": null,
        //                     "position": null,
        //                     "price": null,
        //                     "side": "-",
        //                     "timestamp": 1613657828414,
        //                     "trade_id": null,
        //                     "type": "deposit",
        //                     "user_id": 7,
        //                     "user_seq": 6007,
        //                     "username": "TestUser"
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        const transactions = this.safeList (result, 'logs', []);
        return this.parseTransactions (transactions, currency, since, limit);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_transaction_log
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest transaction to fetch
     * @param {string} [params.continuation] continuation token for pagination
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        params['query'] = 'withdrawal';
        return await this.fetchDepositsWithdrawals (code, since, limit, params);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_transaction_log
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest transaction to fetch
     * @param {string} [params.continuation] continuation token for pagination
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        params['query'] = 'deposit';
        return await this.fetchDepositsWithdrawals (code, since, limit, params);
    }

    override parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        //     {
        //         "balance": 3003.72054712,
        //         "cashflow": 0.65,
        //         "change": 0.65,
        //         "commission": 0,
        //         "currency": "BTC",
        //         "equity": 3003.4876111,
        //         "id": 61291,
        //         "info": {
        //             "addr": "2N8prMvpZHr8aYqodX3S4yhz5wMxjY8La3p",
        //             "deposit_type": "wallet",
        //             "transaction": "de6eba075855f32c9510f338d3ca0900376cedcb9f7b142caccfbdc292d3237e"
        //         },
        //         "instrument_name": null,
        //         "interest_pl": null,
        //         "order_id": null,
        //         "position": null,
        //         "price": null,
        //         "side": "-",
        //         "timestamp": 1613657828414,
        //         "trade_id": null,
        //         "type": "deposit",
        //         "user_id": 7,
        //         "user_seq": 6007,
        //         "username": "TestUser"
        //     }
        //
        const transactionTimestamp = this.safeInteger (transaction, 'timestamp');
        const info = this.safeDict (transaction, 'info', {});
        const transactionType = this.safeString (transaction, 'type');
        const transactionId = this.safeString (transaction, 'id');
        const currencyId = this.safeString (transaction, 'currency');
        const address = this.safeString (info, 'addr');
        return {
            'info': transaction,
            'id': transactionId,
            'txid': this.safeString (info, 'transaction'),
            'timestamp': transactionTimestamp,
            'datetime': this.iso8601 (transactionTimestamp),
            'network': undefined,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': transactionType,
            'amount': this.safeNumber (transaction, 'change'),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'status': 'ok',
            'updated': transactionTimestamp,
            'fee': {
                'cost': undefined,
                'currency': undefined,
            },
        } as Transaction;
    }

    /**
     * @method
     * @name coinbaseinternational#createOrder
     * @description create a trade order
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-buy
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-sell
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency, quote currency for 'market' 'buy' orders
     * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.stopPrice] alias for triggerPrice
     * @param {float} [params.triggerPrice] price to trigger stop orders
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {bool} [params.postOnly] true or false
     * @param {string} [params.tif] 'GTC', 'IOC', 'GTD' default is 'GTC' for limit orders and 'IOC' for market orders
     * @param {string} [params.expire_time] The expiration time required for orders with the time in force set to GTT. Must not go beyond 30 days of the current time. Uses ISO-8601 format (e.g., 2023-03-16T23:59:53Z)
     * @param {string} [params.stp_mode] Possible values: [NONE, AGGRESSING, BOTH] Specifies the behavior for self match handling. None disables the functionality, new cancels the newest order, and both cancels both orders.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const triggerPrice = this.safeNumberN (params, [ 'triggerPrice', 'stopPrice', 'stop_price' ]);
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a side argument');
        }
        const request: Dict = {
            'instrument_name': market['id'],
            'amount': this.amountToPrecision (market['symbol'], amount),
            'type': type,
        };
        if (triggerPrice !== undefined) {
            if (type === 'limit') {
                request['type'] = 'stop_limit';
            } else {
                request['type'] = 'stop_market';
            }
            request['trigger_price'] = triggerPrice;
        }
        if (type === 'limit') {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price parameter for a limit order types');
            }
            request['price'] = price;
        }
        const postOnly = this.safeBool2 (params, 'postOnly', 'post_only');
        const timeInForce = this.safeString2 (params, 'tif', 'timeInForce');
        if (postOnly !== undefined) {
            request['post_only'] = postOnly;
            request['reject_post_only'] = postOnly;
        }
        if (timeInForce !== undefined) {
            const timeInForces: Dict = {
                'GTC': 'good_til_cancelled',
                'IOC': 'immediate_or_cancel',
                'FOK': 'fill_or_kill',
                'GTD': 'good_til_day',
            };
            request['time_in_force'] = this.safeString (timeInForces, timeInForce, timeInForce);
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            request['label'] = clientOrderId;
        }
        params = this.omit (params, [ 'clientOrderId', 'client_order_id', 'postOnly', 'post_only', 'tif', 'timeInForce', 'triggerPrice', 'stopPrice', 'stop_price' ]);
        await this.authenticateV2 ();
        let response = undefined;
        if (side === 'buy') {
            response = await this.privateGetBuy (this.extend (request, params));
        } else {
            response = await this.privateGetSell (this.extend (request, params));
        }
        //
        //     {
        //         "id": 6130,
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "order": {
        //                 "amount": 21,
        //                 "api": true,
        //                 "average_price": 202.8,
        //                 "creation_timestamp": 1590486335742,
        //                 "direction": "sell",
        //                 "filled_amount": 21,
        //                 "instrument_name": "ETH-PERPETUAL",
        //                 "is_liquidation": false,
        //                 "is_rebalance": false,
        //                 "label": "",
        //                 "last_update_timestamp": 1590486335742,
        //                 "max_show": 21,
        //                 "order_id": "ETH-584864807",
        //                 "order_state": "filled",
        //                 "order_type": "limit",
        //                 "post_only": false,
        //                 "price": 198.75,
        //                 "reduce_only": true,
        //                 "replaced": false,
        //                 "time_in_force": "good_til_cancelled",
        //                 "web": false
        //             },
        //             "trades": [
        //                 {
        //                     "amount": 21,
        //                     "direction": "sell",
        //                     "fee": 0.00007766,
        //                     "fee_currency": "ETH",
        //                     "index_price": 202.86,
        //                     "instrument_name": "ETH-PERPETUAL",
        //                     "liquidity": "T",
        //                     "mark_price": 202.79,
        //                     "matching_id": null,
        //                     "order_id": "ETH-584864807",
        //                     "order_type": "limit",
        //                     "post_only": false,
        //                     "price": 202.8,
        //                     "reduce_only": true,
        //                     "state": "filled",
        //                     "tick_direction": 0,
        //                     "timestamp": 1590486335742,
        //                     "trade_id": "ETH-2696097",
        //                     "trade_seq": 1966068
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        const order = this.safeDict (result, 'order', {});
        const trades = this.safeList (result, 'trades', []);
        order['trades'] = trades;
        return this.parseOrder (order, market);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder, editOrder
        //
        //     {
        //         "amount": 21,
        //         "api": true,
        //         "average_price": 202.8,
        //         "creation_timestamp": 1590486335742,
        //         "direction": "sell",
        //         "filled_amount": 21,
        //         "instrument_name": "ETH-PERPETUAL",
        //         "is_liquidation": false,
        //         "is_rebalance": false,
        //         "label": "",
        //         "last_update_timestamp": 1590486335742,
        //         "max_show": 21,
        //         "order_id": "ETH-584864807",
        //         "order_state": "filled",
        //         "order_type": "limit",
        //         "post_only": false,
        //         "price": 198.75,
        //         "reduce_only": true,
        //         "replaced": false,
        //         "time_in_force": "good_til_cancelled",
        //         "web": false
        //     }
        //
        // cancelOrder
        //
        //     {
        //         "amount": 5,
        //         "api": false,
        //         "creation_timestamp": 1550575961291,
        //         "direction": "sell",
        //         "instrument_name": "ETH-PERPETUAL",
        //         "is_liquidation": false,
        //         "is_rebalance": false,
        //         "label": "",
        //         "last_update_timestamp": 1550575961291,
        //         "max_show": 5,
        //         "order_id": "ETH-SLIS-12",
        //         "order_state": "untriggered",
        //         "order_type": "stop_market",
        //         "post_only": false,
        //         "price": "market_price",
        //         "reduce_only": false,
        //         "time_in_force": "good_til_cancelled",
        //         "trigger": "index_price",
        //         "trigger_price": 144.73,
        //         "triggered": false
        //     }
        //
        // fetchOrder, fetchOpenOrders
        //
        //     {
        //         "amount": 37,
        //         "api": false,
        //         "average_price": 118.94,
        //         "creation_timestamp": 1550219749176,
        //         "direction": "sell",
        //         "filled_amount": 37,
        //         "instrument_name": "ETH-PERPETUAL",
        //         "is_liquidation": false,
        //         "is_rebalance": false,
        //         "label": "",
        //         "last_update_timestamp": 1550219810944,
        //         "max_show": 37,
        //         "order_id": "ETH-331562",
        //         "order_state": "filled",
        //         "order_type": "limit",
        //         "post_only": false,
        //         "price": 118.94,
        //         "reduce_only": false,
        //         "time_in_force": "good_til_cancelled"
        //     }
        //
        const instrumentName = this.safeString (order, 'instrument_name');
        market = this.safeMarket (instrumentName, market);
        const timestamp = this.safeInteger (order, 'creation_timestamp');
        const lastUpdateTimestamp = this.safeInteger (order, 'last_update_timestamp');
        const filled = this.safeNumber (order, 'filled_amount');
        const amount = this.safeNumber (order, 'amount');
        let remaining: Num = undefined;
        if ((filled !== undefined) && (amount !== undefined)) {
            remaining = amount - filled;
        }
        const price = this.safeNumber (order, 'price');
        const average = this.safeNumber (order, 'average_price');
        const filledString = this.safeString (order, 'filled_amount');
        const averageString = this.safeString (order, 'average_price');
        let cost: Num = undefined;
        if ((filledString !== undefined) && (averageString !== undefined)) {
            cost = this.parseNumber (Precise.stringMul (filledString, averageString));
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'order_id'),
            'clientOrderId': this.safeString (order, 'label'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastUpdateTimestamp,
            'symbol': market['symbol'],
            'type': this.parseOrderType (this.safeStringLower (order, 'order_type')),
            'timeInForce': this.parseTimeInForce (this.safeString (order, 'time_in_force')),
            'postOnly': this.safeBool (order, 'post_only'),
            'side': this.safeString (order, 'direction'),
            'price': price,
            'triggerPrice': this.safeNumber2 (order, 'trigger_price', 'stop_price'),
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'average': average,
            'status': this.parseOrderStatus (this.safeStringLower (order, 'order_state')),
            'fee': undefined,
            'trades': this.safeList (order, 'trades'),
        }, market);
    }

    parseTimeInForce (timeInForce: Str) {
        const timeInForces: Dict = {
            'good_til_cancelled': 'GTC',
            'fill_or_kill': 'FOK',
            'immediate_or_cancel': 'IOC',
            'good_til_day': 'GTD',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'open': 'open',
            'cancelled': 'canceled',
            'filled': 'closed',
            'rejected': 'rejected',
            'untriggered': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type: Str) {
        const types: Dict = {
            'stop_limit': 'limit',
            'take_limit': 'limit',
            'stop_market': 'market',
            'take_market': 'market',
        };
        return this.safeString (types, (type as string), type);
    }

    /**
     * @method
     * @name coinbaseinternational#cancelOrder
     * @description cancels an open order
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel
     * @param {string} id order id
     * @param {string} symbol not used by cancelOrder()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {
            'order_id': id,
        };
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        await this.authenticateV2 ();
        const response = await this.privateGetCancel (this.extend (request, params));
        //
        //     {
        //         "id": 4214,
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "amount": 5,
        //             "api": false,
        //             "creation_timestamp": 1550575961291,
        //             "direction": "sell",
        //             "instrument_name": "ETH-PERPETUAL",
        //             "is_liquidation": false,
        //             "is_rebalance": false,
        //             "label": "",
        //             "last_update_timestamp": 1550575961291,
        //             "max_show": 5,
        //             "order_id": "ETH-SLIS-12",
        //             "order_state": "untriggered",
        //             "order_type": "stop_market",
        //             "post_only": false,
        //             "price": "market_price",
        //             "reduce_only": false,
        //             "time_in_force": "good_til_cancelled",
        //             "trigger": "index_price",
        //             "trigger_price": 144.73,
        //             "triggered": false
        //         }
        //     }
        //
        const order = this.safeDict (response, 'result', {});
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name coinbaseinternational#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel_all
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel_all_by_instrument
     * @param {string} [symbol] unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelAllOrders (symbol: Str = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let response = undefined;
        await this.authenticateV2 ();
        if (symbol !== undefined) {
            const market = this.market (symbol);
            const request: Dict = {
                'instrument_name': market['id'],
            };
            response = await this.privateGetCancelAllByInstrument (this.extend (request, params));
        } else {
            response = await this.privateGetCancelAll (params);
        }
        //
        //     {
        //         "id": 47,
        //         "jsonrpc": "2.0",
        //         "result": 4
        //     }
        //
        const order = this.safeOrder ({ 'info': response });
        return [ order ];
    }

    /**
     * @method
     * @name coinbaseinternational#editOrder
     * @description edit a trade order
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-edit
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.clientOrderId client order id
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'order_id': id,
        };
        if (amount !== undefined) {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const triggerPrice = this.safeNumberN (params, [ 'stopPrice', 'stop_price', 'triggerPrice' ]);
        if (triggerPrice !== undefined) {
            request['trigger_price'] = triggerPrice;
        }
        params = this.omit (params, [ 'triggerPrice', 'stopPrice', 'stop_price' ]);
        await this.authenticateV2 ();
        const response = await this.privateGetEdit (this.extend (request, params));
        //
        //     {
        //         "id": 9,
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "order": {
        //                 "amount": 150,
        //                 "api": true,
        //                 "average_price": 0,
        //                 "creation_timestamp": 1616155547764,
        //                 "direction": "buy",
        //                 "filled_amount": 0,
        //                 "instrument_name": "BTC-PERPETUAL",
        //                 "is_liquidation": false,
        //                 "is_rebalance": false,
        //                 "label": "i_love_deribit",
        //                 "last_update_timestamp": 1616155550773,
        //                 "max_show": 150,
        //                 "order_id": "94166",
        //                 "order_state": "open",
        //                 "order_type": "limit",
        //                 "post_only": false,
        //                 "price": 50111,
        //                 "reduce_only": false,
        //                 "replaced": true,
        //                 "time_in_force": "good_til_cancelled",
        //                 "web": false
        //             },
        //             "trades": []
        //         }
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        const order = this.safeDict (result, 'order', {});
        const trades = this.safeList (result, 'trades', []);
        order['trades'] = trades;
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_order_state
     * @param {string} id the order id
     * @param {string} symbol unified market symbol that the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'order_id': id,
        };
        await this.authenticateV2 ();
        const response = await this.privateGetGetOrderState (this.extend (request, params));
        //
        //     {
        //         "id": 4316,
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "amount": 37,
        //             "api": false,
        //             "average_price": 118.94,
        //             "creation_timestamp": 1550219749176,
        //             "direction": "sell",
        //             "filled_amount": 37,
        //             "instrument_name": "ETH-PERPETUAL",
        //             "is_liquidation": false,
        //             "is_rebalance": false,
        //             "label": "",
        //             "last_update_timestamp": 1550219810944,
        //             "max_show": 37,
        //             "order_id": "ETH-331562",
        //             "order_state": "filled",
        //             "order_type": "limit",
        //             "post_only": false,
        //             "price": 118.94,
        //             "reduce_only": false,
        //             "time_in_force": "good_til_cancelled"
        //         }
        //     }
        //
        const order = this.safeDict (response, 'result', {});
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchOpenOrders
     * @description fetches information on all currently open orders
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_open_orders_by_instrument
     * @param {string} symbol unified market symbol of the orders
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.offset] offset
     * @param {string} [params.event_type] The most recent type of event that happened to the order. Allowed values: NEW, TRADE, REPLACED
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_name': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        await this.authenticateV2 ();
        const response = await this.privateGetGetOpenOrdersByInstrument (this.extend (request, params));
        //
        //     {
        //         "id": 1953,
        //         "jsonrpc": "2.0",
        //         "result": [
        //             {
        //                 "amount": 10,
        //                 "api": true,
        //                 "average_price": 0,
        //                 "creation_timestamp": 1550050597036,
        //                 "direction": "buy",
        //                 "filled_amount": 0,
        //                 "instrument_name": "BTC-15FEB19-3250-P",
        //                 "is_liquidation": false,
        //                 "is_rebalance": false,
        //                 "label": "fooBar",
        //                 "last_update_timestamp": 1550050597036,
        //                 "max_show": 10,
        //                 "order_id": "146062",
        //                 "order_state": "open",
        //                 "order_type": "limit",
        //                 "post_only": false,
        //                 "price": 0.0028,
        //                 "reduce_only": false,
        //                 "time_in_force": "good_til_cancelled"
        //             }
        //         ]
        //     }
        //
        const rawOrders = this.safeList (response, 'result', []);
        return this.parseOrders (rawOrders, market, since, limit);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_user_trades_by_instrument
     * @param {string} symbol unified market symbol of the trades
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] the maximum number of trade structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_name': market['id'],
            'include_old': true,
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        await this.authenticateV2 ();
        const response = await this.privateGetGetUserTradesByInstrument (this.extend (request, params));
        //
        //     {
        //         "id": 9292,
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "has_more": false,
        //             "trades": [
        //                 {
        //                     "amount": 1,
        //                     "direction": "sell",
        //                     "fee": 0.0004,
        //                     "fee_currency": "BTC",
        //                     "index_price": 8993.47,
        //                     "instrument_name": "BTC-27MAY20-8750-C",
        //                     "iv": 38.51,
        //                     "liquidity": "M",
        //                     "mark_price": 0.03135383,
        //                     "matching_id": null,
        //                     "order_id": "4008699030",
        //                     "order_type": "limit",
        //                     "post_only": false,
        //                     "price": 0.028,
        //                     "reduce_only": false,
        //                     "state": "filled",
        //                     "tick_direction": 1,
        //                     "timestamp": 1590480620145,
        //                     "trade_id": "48078936",
        //                     "trade_seq": 1,
        //                     "underlying_price": 8994.95
        //                 },
        //                 {
        //                     "amount": 10,
        //                     "direction": "buy",
        //                     "fee": -2.1e-7,
        //                     "fee_currency": "BTC",
        //                     "index_price": 9679.48,
        //                     "instrument_name": "BTC-26JUN20",
        //                     "liquidity": "M",
        //                     "mark_price": 9684,
        //                     "matching_id": null,
        //                     "order_id": "3993343822",
        //                     "order_type": "limit",
        //                     "post_only": false,
        //                     "price": 9681.5,
        //                     "reduce_only": false,
        //                     "state": "filled",
        //                     "tick_direction": 2,
        //                     "timestamp": 1589923311862,
        //                     "trade_id": "47958936",
        //                     "trade_seq": 299513
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        const trades = this.safeList (result, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchMyTrades
        //
        //     {
        //         "amount": 1,
        //         "direction": "sell",
        //         "fee": 0.0004,
        //         "fee_currency": "BTC",
        //         "index_price": 8993.47,
        //         "instrument_name": "BTC-27MAY20-8750-C",
        //         "iv": 38.51,
        //         "liquidity": "M",
        //         "mark_price": 0.03135383,
        //         "matching_id": null,
        //         "order_id": "4008699030",
        //         "order_type": "limit",
        //         "post_only": false,
        //         "price": 0.028,
        //         "reduce_only": false,
        //         "state": "filled",
        //         "tick_direction": 1,
        //         "timestamp": 1590480620145,
        //         "trade_id": "48078936",
        //         "trade_seq": 1,
        //         "underlying_price": 8994.95
        //     },
        //     {
        //         "amount": 10,
        //         "direction": "buy",
        //         "fee": -2.1e-7,
        //         "fee_currency": "BTC",
        //         "index_price": 9679.48,
        //         "instrument_name": "BTC-26JUN20",
        //         "liquidity": "M",
        //         "mark_price": 9684,
        //         "matching_id": null,
        //         "order_id": "3993343822",
        //         "order_type": "limit",
        //         "post_only": false,
        //         "price": 9681.5,
        //         "reduce_only": false,
        //         "state": "filled",
        //         "tick_direction": 2,
        //         "timestamp": 1589923311862,
        //         "trade_id": "47958936",
        //         "trade_seq": 299513
        //     }
        //
        const instrumentName = this.safeString (trade, 'instrument_name');
        market = this.safeMarket (instrumentName, market);
        const timestamp = this.safeInteger (trade, 'timestamp');
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'amount');
        const amountString = this.safeString (trade, 'amount');
        const priceString = this.safeString (trade, 'price');
        let cost: Num = undefined;
        if ((amountString !== undefined) && (priceString !== undefined)) {
            cost = this.parseNumber (Precise.stringMul (amountString, priceString));
        }
        const feeCurrencyId = this.safeString (trade, 'fee_currency');
        const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
        const fee = {
            'cost': this.safeNumber (trade, 'fee'),
            'currency': feeCurrency,
        };
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'trade_id'),
            'order': this.safeString (trade, 'order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': this.safeString (trade, 'order_type'),
            'side': this.safeString (trade, 'direction'),
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }

    createAuthToken (seconds: Int, method: Str = undefined, url: Str = undefined, useEddsa = false) {
        let uri: Str = undefined;
        if (url !== undefined) {
            uri = method + ' ' + url.replace ('https://', '');
            const questionMarkPosition = uri.indexOf ('?');
            if (questionMarkPosition > 0) {
                uri = uri.slice (0, questionMarkPosition);
            }
        }
        const nonce = this.randomBytes (16);
        const issuer = 'cdp';
        let audience: Str = undefined;
        if (useEddsa) {
            audience = 'cdp_service';
        }
        const request: Dict = {
            'iss': issuer,
            'nbf': seconds,
            'exp': (seconds as number) + 120,
            'sub': this.apiKey,
            'iat': seconds,
        };
        if (audience !== undefined) {
            request['aud'] = [ audience ];
        }
        if (uri !== undefined) {
            if (useEddsa) {
                request['uris'] = [ uri ];
            } else {
                request['uri'] = uri;
            }
        }
        if (useEddsa) {
            const byteArray = this.base64ToBinary (this.secret);
            const seed = this.arraySlice (byteArray, 0, 32);
            const signedToken = jwt (request, seed, sha256, false, { 'kid': this.apiKey, 'nonce': nonce, 'alg': 'EdDSA' });
            return signedToken;
        }
        const header = {
            'alg': 'ES256',
            'typ': 'JWT',
            'kid': this.apiKey,
            'nonce': nonce,
        };
        const encodedHeader = this.urlencodeBase64 (this.json (header));
        const encodedRequest = this.urlencodeBase64 (this.json (request));
        const token = encodedHeader + '.' + encodedRequest;
        const signedHash = ecdsa (token, this.secret, P256, sha256);
        const r = signedHash['r'].padStart (64, '0');
        const s = signedHash['s'].padStart (64, '0');
        const signature = this.urlencodeBase64 (this.base16ToBinary (r + s));
        return token + '.' + signature;
    }

    /**
     * @ignore
     * @method
     * @description exchanges a CDP JWT for a Deribit gateway access token
     * @see https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/derivatives/technical#authentication
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {string} a Deribit gateway access token
     */
    async authenticateV2 (params = {}): Promise<string> {
        const now = this.milliseconds ();
        const token = this.token;
        const tokenExpires = this.safeInteger (this.options, 'v2TokenExpires');
        if ((token !== undefined) && (tokenExpires !== undefined) && (now < tokenExpires)) {
            return token;
        }
        const response = await this.publicPostAuth (params);
        const result = this.safeDict (response, 'result', {});
        const accessToken = this.safeString (result, 'access_token');
        const expiresIn = this.safeInteger (result, 'expires_in');
        if (accessToken === undefined) {
            throw new AuthenticationError (this.id + ' public/auth did not return an access token');
        }
        if (expiresIn === undefined) {
            throw new AuthenticationError (this.id + ' public/auth did not return an expiry');
        }
        const tokenExpiresInMilliseconds = expiresIn * 1000;
        this.token = accessToken;
        this.options['v2TokenExpires'] = this.sum (now, tokenExpiresInMilliseconds);
        return accessToken;
    }

    override sign (path: any, api: any = 'public', method = 'GET', params = {}, headers: NullableDict = undefined, body: Str = undefined) {
        const access = api;
        const rpcMethod = access + '/' + path;
        const url = this.urls['api']['rest'];
        if ((access === 'public') && (path === 'auth')) {
            this.checkRequiredCredentials ();
            const seconds = this.seconds ();
            const useV2CloudApiKey = this.safeBool (this.options, 'v2CloudAPiKey', false);
            const secretIsPem = this.secret.startsWith ('-----BEGIN');
            const secretEndsWithEquals = this.secret.endsWith ('=');
            let useEddsa = false;
            if (!secretIsPem && ((this.secret.length === 88) || useV2CloudApiKey || secretEndsWithEquals)) {
                useEddsa = true;
            }
            const authUrl = this.urls['api']['rest'];
            params = this.extend ({
                'grant_type': 'coinbase_cdp',
                'token': this.createAuthToken (seconds, method, authUrl, useEddsa),
            }, params);
        } else if (access === 'private') {
            if ((this.token === undefined) || (this.token === '')) {
                throw new AuthenticationError (this.id + ' requires an access token from public/auth');
            }
            headers = {
                'Authorization': 'Bearer ' + this.token,
            };
        }
        if (method === 'GET') {
            let requestUrl = url + '/' + rpcMethod;
            if (Object.keys (params).length > 0) {
                requestUrl += '?' + this.urlencode (params);
            }
            return { 'url': requestUrl, 'method': method, 'body': body, 'headers': headers };
        }
        const request = {
            'jsonrpc': '2.0',
            'id': this.nonce (),
            'method': rpcMethod,
            'params': params,
        };
        body = this.json (request);
        headers = this.extend ({ 'Content-Type': 'application/json' }, headers);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        //
        //     { "jsonrpc": "2.0", "id": 1, "error": { "code": 13004, "message": "invalid_credentials" } }
        //
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        const error = this.safeDict (response, 'error');
        if (error === undefined) {
            return undefined;
        }
        const errorCode = this.safeString (error, 'code');
        const errorMessage = this.safeString (error, 'message');
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
        throw new ExchangeError (feedback);
    }
}
