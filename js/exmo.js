'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, ExchangeError, OrderNotFound, AuthenticationError, InsufficientFunds, InvalidOrder, InvalidNonce, NotSupported, OnMaintenance, RateLimitExceeded, BadRequest, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class exmo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'exmo',
            'name': 'EXMO',
            'countries': [ 'ES', 'RU' ], // Spain, Russia
            'rateLimit': 350, // once every 350 ms ≈ 180 requests per minute ≈ 3 requests per second
            'version': 'v1.1',
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchFundingFees': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': 'emulated',
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchOrderTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '45m': '45',
                '1h': '60',
                '2h': '120',
                '3h': '180',
                '4h': '240',
                '1d': 'D',
                '1w': 'W',
                '1M': 'M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg',
                'api': {
                    'public': 'https://api.exmo.com',
                    'private': 'https://api.exmo.com',
                    'web': 'https://exmo.me',
                },
                'www': 'https://exmo.me',
                'referral': 'https://exmo.me/?ref=131685',
                'doc': [
                    'https://exmo.me/en/api_doc?ref=131685',
                    'https://github.com/exmo-dev/exmo_api_lib/tree/master/nodejs',
                ],
                'fees': 'https://exmo.com/en/docs/fees',
            },
            'api': {
                'web': {
                    'get': [
                        'ctrl/feesAndLimits',
                        'en/docs/fees',
                    ],
                },
                'public': {
                    'get': [
                        'currency',
                        'currency/list/extended',
                        'order_book',
                        'pair_settings',
                        'ticker',
                        'trades',
                        'candles_history',
                        'required_amount',
                        'payments/providers/crypto/list',
                    ],
                },
                'private': {
                    'post': [
                        'user_info',
                        'order_create',
                        'order_cancel',
                        'stop_market_order_create',
                        'stop_market_order_cancel',
                        'user_open_orders',
                        'user_trades',
                        'user_cancelled_orders',
                        'order_trades',
                        'deposit_address',
                        'withdraw_crypt',
                        'withdraw_get_txid',
                        'excode_create',
                        'excode_load',
                        'code_check',
                        'wallet_history',
                        'wallet_operations',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false, // fixed funding fees for crypto, see fetchFundingFees below
                },
            },
            'options': {
                'useWebapiForFetchingFees': false, // TODO: figure why Exmo bans us when we try to fetch() their web urls
                'feesAndLimits': {
                    'success': 1,
                    'ctlr': 'feesAndLimits',
                    'error': '',
                    'data': {
                        'limits': [
                            { 'pair': 'BTC/USD', 'min_q': '0.0001', 'max_q': '1000', 'min_p': '1', 'max_p': '30000', 'min_a': '1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BTC/RUB', 'min_q': '0.0001', 'max_q': '1000', 'min_p': '1', 'max_p': '2000000', 'min_a': '10', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BTC/EUR', 'min_q': '0.0001', 'max_q': '1000', 'min_p': '1', 'max_p': '30000', 'min_a': '1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BTC/GBP', 'min_q': '0.0001', 'max_q': '1000', 'min_p': '1', 'max_p': '30000', 'min_a': '1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BTC/UAH', 'min_q': '0.0001', 'max_q': '1000', 'min_p': '1', 'max_p': '15000000', 'min_a': '10', 'max_a': '15000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BTC/PLN', 'min_q': '0.0001', 'max_q': '1000', 'min_p': '1', 'max_p': '20000000', 'min_a': '50', 'max_a': '2000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BTC/TRY', 'min_q': '0.0001', 'max_q': '1000', 'min_p': '1', 'max_p': '800000', 'min_a': '40', 'max_a': '6000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BTC/KZT', 'min_q': '0.0001', 'max_q': '1000', 'min_p': '1000', 'max_p': '12000000', 'min_a': '1000', 'max_a': '100000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BTC/USDT', 'min_q': '0.0001', 'max_q': '1000', 'min_p': '0.01', 'max_p': '30000', 'min_a': '3', 'max_a': '500000', 'taker': '0', 'maker': '0' },
                            { 'pair': 'ETH/BTC', 'min_q': '0.001', 'max_q': '5000', 'min_p': '0.00000001', 'max_p': '10', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETH/USD', 'min_q': '0.001', 'max_q': '5000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '3', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETH/RUB', 'min_q': '0.001', 'max_q': '5000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '150', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XRP/BTC', 'min_q': '1', 'max_q': '5000000', 'min_p': '0.0000001', 'max_p': '1', 'min_a': '0.00001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XRP/USD', 'min_q': '1', 'max_q': '5000000', 'min_p': '0.001', 'max_p': '1000', 'min_a': '0.001', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XRP/RUB', 'min_q': '1', 'max_q': '5000000', 'min_p': '0.000001', 'max_p': '1000', 'min_a': '0.01', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ADA/BTC', 'min_q': '1', 'max_q': '10000000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ADA/ETH', 'min_q': '0.01', 'max_q': '10000000', 'min_p': '0.00000001', 'max_p': '10', 'min_a': '0.001', 'max_a': '5000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ADA/USD', 'min_q': '0.01', 'max_q': '10000000', 'min_p': '0.0001', 'max_p': '1000', 'min_a': '0.01', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ALGO/EXM', 'min_q': '1', 'max_q': '1000000', 'min_p': '0.001', 'max_p': '10000', 'min_a': '1', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ALGO/BTC', 'min_q': '1', 'max_q': '1000000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.000001', 'max_a': '50', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ALGO/USDT', 'min_q': '1', 'max_q': '1000000', 'min_p': '0.001', 'max_p': '1000', 'min_a': '1', 'max_a': '500000', 'taker': '0', 'maker': '0' },
                            { 'pair': 'ALGO/RUB', 'min_q': '1', 'max_q': '1000000', 'min_p': '0.000001', 'max_p': '10000', 'min_a': '1', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ALGO/EUR', 'min_q': '1', 'max_q': '1000000', 'min_p': '0.001', 'max_p': '1000', 'min_a': '1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ATOM/EXM', 'min_q': '1', 'max_q': '500000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '200', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ATOM/BTC', 'min_q': '1', 'max_q': '500000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ATOM/USD', 'min_q': '1', 'max_q': '500000', 'min_p': '0.001', 'max_p': '1000', 'min_a': '0.5', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ATOM/EUR', 'min_q': '1', 'max_q': '500000', 'min_p': '0.001', 'max_p': '1000', 'min_a': '0.5', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BCH/USD', 'min_q': '0.003', 'max_q': '5000', 'min_p': '0.00000001', 'max_p': '30000', 'min_a': '0.0001', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BCH/RUB', 'min_q': '0.003', 'max_q': '5000', 'min_p': '0.00000001', 'max_p': '2000000', 'min_a': '0.0001', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BCH/EUR', 'min_q': '0.003', 'max_q': '5000', 'min_p': '0.01', 'max_p': '300000', 'min_a': '3', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BCH/UAH', 'min_q': '0.003', 'max_q': '5000', 'min_p': '0.1', 'max_p': '30000', 'min_a': '10', 'max_a': '15000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BCH/BTC', 'min_q': '0.003', 'max_q': '5000', 'min_p': '0.00000001', 'max_p': '5', 'min_a': '0.0001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BCH/ETH', 'min_q': '0.003', 'max_q': '5000', 'min_p': '0.0000001', 'max_p': '200', 'min_a': '0.0001', 'max_a': '5000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BCH/USDT', 'min_q': '0.003', 'max_q': '5000', 'min_p': '0.01', 'max_p': '5000', 'min_a': '3', 'max_a': '500000', 'taker': '0', 'maker': '0' },
                            { 'pair': 'BTG/USD', 'min_q': '0.01', 'max_q': '100000', 'min_p': '0.001', 'max_p': '1000', 'min_a': '3', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BTG/BTC', 'min_q': '0.01', 'max_q': '100000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BTG/ETH', 'min_q': '0.01', 'max_q': '100000', 'min_p': '0.0001', 'max_p': '100', 'min_a': '0.01', 'max_a': '5000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BTT/RUB', 'min_q': '1', 'max_q': '500000000', 'min_p': '0.000001', 'max_p': '1000', 'min_a': '0.000001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BTT/UAH', 'min_q': '1', 'max_q': '500000000', 'min_p': '0.000001', 'max_p': '1000', 'min_a': '0.000001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'BTT/BTC', 'min_q': '1', 'max_q': '500000000', 'min_p': '0.00000001', 'max_p': '0.1', 'min_a': '0.00001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'CRON/BTC', 'min_q': '1', 'max_q': '100000', 'min_p': '0.0000001', 'max_p': '1', 'min_a': '0.00001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'CRON/ETH', 'min_q': '1', 'max_q': '100000', 'min_p': '0.0000001', 'max_p': '10', 'min_a': '0.00001', 'max_a': '5000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'CRON/USDT', 'min_q': '1', 'max_q': '100000', 'min_p': '0.001', 'max_p': '1000', 'min_a': '0.001', 'max_a': '500000', 'taker': '0', 'maker': '0' },
                            { 'pair': 'CRON/EXM', 'min_q': '1', 'max_q': '100000000', 'min_p': '0.00000001', 'max_p': '1000', 'min_a': '0.01', 'max_a': '100000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'DAI/USD', 'min_q': '1', 'max_q': '500000', 'min_p': '0.001', 'max_p': '1000', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'DAI/RUB', 'min_q': '1', 'max_q': '500000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '0.5', 'max_a': '30000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'DAI/BTC', 'min_q': '1', 'max_q': '500000', 'min_p': '0.0000001', 'max_p': '0.1', 'min_a': '0.00001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'DAI/ETH', 'min_q': '1', 'max_q': '500000', 'min_p': '0.000001', 'max_p': '10', 'min_a': '0.0001', 'max_a': '5000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'DASH/USD', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.01', 'max_p': '10000', 'min_a': '3', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'DASH/RUB', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '150', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'DASH/UAH', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.01', 'max_p': '200000', 'min_a': '10', 'max_a': '15000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'DASH/BTC', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.0001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'DASH/USDT', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.01', 'max_p': '5000', 'min_a': '3', 'max_a': '500000', 'taker': '0', 'maker': '0' },
                            { 'pair': 'DCR/RUB', 'min_q': '0.01', 'max_q': '50000', 'min_p': '0.00001', 'max_p': '100000', 'min_a': '0.5', 'max_a': '3000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'DCR/UAH', 'min_q': '0.01', 'max_q': '50000', 'min_p': '0.00001', 'max_p': '100000', 'min_a': '0.25', 'max_a': '1000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'DCR/BTC', 'min_q': '0.01', 'max_q': '50000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'DOGE/USD', 'min_q': '100', 'max_q': '500000000', 'min_p': '0.0000001', 'max_p': '1000', 'min_a': '0.01', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'DOGE/BTC', 'min_q': '100', 'max_q': '500000000', 'min_p': '0.0000001', 'max_p': '1', 'min_a': '0.0001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'EOS/USD', 'min_q': '0.01', 'max_q': '500000', 'min_p': '0.01', 'max_p': '1000', 'min_a': '0.5', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'EOS/EUR', 'min_q': '0.01', 'max_q': '500000', 'min_p': '0.001', 'max_p': '1000', 'min_a': '0.5', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'EOS/BTC', 'min_q': '0.01', 'max_q': '500000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETC/USD', 'min_q': '0.2', 'max_q': '100000', 'min_p': '0.01', 'max_p': '10000', 'min_a': '0.01', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETC/RUB', 'min_q': '0.2', 'max_q': '100000', 'min_p': '0.01', 'max_p': '10000', 'min_a': '0.01', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETC/BTC', 'min_q': '0.2', 'max_q': '100000', 'min_p': '0.0001', 'max_p': '0.5', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETH/EUR', 'min_q': '0.001', 'max_q': '5000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '3', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETH/GBP', 'min_q': '0.001', 'max_q': '5000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '3', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETH/UAH', 'min_q': '0.001', 'max_q': '5000', 'min_p': '0.01', 'max_p': '1000000', 'min_a': '90', 'max_a': '15000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETH/PLN', 'min_q': '0.001', 'max_q': '5000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '50', 'max_a': '2000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETH/TRY', 'min_q': '0.001', 'max_q': '5000', 'min_p': '0.1', 'max_p': '80000', 'min_a': '10', 'max_a': '6000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETH/KZT', 'min_q': '0.001', 'max_q': '5000', 'min_p': '4', 'max_p': '40000000', 'min_a': '3', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETH/USDT', 'min_q': '0.001', 'max_q': '5000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '3', 'max_a': '500000', 'taker': '0', 'maker': '0' },
                            { 'pair': 'ETH/LTC', 'min_q': '0.001', 'max_q': '5000', 'min_p': '0.00000001', 'max_p': '100000', 'min_a': '0.05', 'max_a': '100000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETZ/BTC', 'min_q': '1', 'max_q': '50000000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.0001', 'max_a': '10', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETZ/ETH', 'min_q': '1', 'max_q': '50000000', 'min_p': '0.00000001', 'max_p': '100', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ETZ/USDT', 'min_q': '1', 'max_q': '50000000', 'min_p': '0.000001', 'max_p': '1000', 'min_a': '0.01', 'max_a': '1000', 'taker': '0', 'maker': '0' },
                            { 'pair': 'EXM/USDT', 'min_q': '1', 'max_q': '100000000', 'min_p': '0.00000001', 'max_p': '1000', 'min_a': '0.01', 'max_a': '100000', 'taker': '0', 'maker': '0' },
                            { 'pair': 'EXM/ETH', 'min_q': '1', 'max_q': '100000000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.0001', 'max_a': '5000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'GAS/USD', 'min_q': '0.01', 'max_q': '500000', 'min_p': '0.01', 'max_p': '50000', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'GAS/BTC', 'min_q': '0.01', 'max_q': '500000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'GNT/BTC', 'min_q': '1', 'max_q': '10000000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'GNT/ETH', 'min_q': '0.01', 'max_q': '10000000', 'min_p': '0.00000001', 'max_p': '10', 'min_a': '0.01', 'max_a': '5000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'GUSD/USD', 'min_q': '1', 'max_q': '500000', 'min_p': '0.1', 'max_p': '10', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'GUSD/RUB', 'min_q': '1', 'max_q': '500000', 'min_p': '0.01', 'max_p': '1000', 'min_a': '10', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'GUSD/BTC', 'min_q': '1', 'max_q': '500000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.0015', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'HP/BTC', 'min_q': '1', 'max_q': '100000000', 'min_p': '0.00000001', 'max_p': '0.1', 'min_a': '0.00001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'HB/BTC', 'min_q': '10', 'max_q': '100000000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.000001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'LSK/USD', 'min_q': '0.1', 'max_q': '500000', 'min_p': '0.1', 'max_p': '1000', 'min_a': '1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'LSK/RUB', 'min_q': '0.1', 'max_q': '500000', 'min_p': '0.001', 'max_p': '100000', 'min_a': '0.5', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'LSK/BTC', 'min_q': '1', 'max_q': '500000', 'min_p': '0.0000001', 'max_p': '1', 'min_a': '0.0015', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'LTC/USD', 'min_q': '0.05', 'max_q': '10000', 'min_p': '0.01', 'max_p': '10000', 'min_a': '3', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'LTC/RUB', 'min_q': '0.05', 'max_q': '10000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '150', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'LTC/EUR', 'min_q': '0.05', 'max_q': '10000', 'min_p': '0.01', 'max_p': '10000', 'min_a': '3', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'LTC/UAH', 'min_q': '0.05', 'max_q': '10000', 'min_p': '0.01', 'max_p': '300000', 'min_a': '5', 'max_a': '18000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'LTC/BTC', 'min_q': '0.05', 'max_q': '10000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'MKR/BTC', 'min_q': '0.0001', 'max_q': '1000', 'min_p': '0.0001', 'max_p': '100', 'min_a': '0.000001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'MKR/DAI', 'min_q': '0.0001', 'max_q': '1000', 'min_p': '0.5', 'max_p': '500000', 'min_a': '0.005', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'MNC/USD', 'min_q': '10', 'max_q': '500000000', 'min_p': '0.000001', 'max_p': '10000', 'min_a': '0.01', 'max_a': '100000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'MNC/BTC', 'min_q': '10', 'max_q': '500000000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.000001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'MNC/ETH', 'min_q': '10', 'max_q': '500000000', 'min_p': '0.0000001', 'max_p': '10', 'min_a': '0.00001', 'max_a': '1000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'NEO/USD', 'min_q': '0.01', 'max_q': '100000', 'min_p': '0.01', 'max_p': '50000', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'NEO/RUB', 'min_q': '0.01', 'max_q': '100000', 'min_p': '0.001', 'max_p': '1500000', 'min_a': '50', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'NEO/BTC', 'min_q': '0.1', 'max_q': '100000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'OMG/USD', 'min_q': '0.01', 'max_q': '500000', 'min_p': '0.01', 'max_p': '1000', 'min_a': '0.5', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'OMG/BTC', 'min_q': '1', 'max_q': '500000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'OMG/ETH', 'min_q': '0.01', 'max_q': '500000', 'min_p': '0.00000001', 'max_p': '10', 'min_a': '0.01', 'max_a': '5000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ONG/EXM', 'min_q': '1', 'max_q': '1000000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '100', 'max_a': '15000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ONG/BTC', 'min_q': '1', 'max_q': '1000000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.00001', 'max_a': '10', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ONG/RUB', 'min_q': '1', 'max_q': '1000000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '100', 'max_a': '250000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ONG/UAH', 'min_q': '1', 'max_q': '1000000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '50', 'max_a': '6000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ONT/EXM', 'min_q': '1', 'max_q': '500000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '200', 'max_a': '15000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ONT/BTC', 'min_q': '1', 'max_q': '500000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.00001', 'max_a': '10', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ONT/RUB', 'min_q': '1', 'max_q': '500000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '100', 'max_a': '6000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ONT/UAH', 'min_q': '1', 'max_q': '500000', 'min_p': '0.01', 'max_p': '100000', 'min_a': '200', 'max_a': '250000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'PTI/RUB', 'min_q': '1', 'max_q': '50000000', 'min_p': '0.00000001', 'max_p': '600000', 'min_a': '10', 'max_a': '600000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'PTI/BTC', 'min_q': '1', 'max_q': '50000000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.000001', 'max_a': '10', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'PTI/EOS', 'min_q': '1', 'max_q': '50000000', 'min_p': '0.0000001', 'max_p': '5000', 'min_a': '0.01', 'max_a': '20000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'PTI/USDT', 'min_q': '1', 'max_q': '50000000', 'min_p': '0.000001', 'max_p': '10000', 'min_a': '0.01', 'max_a': '100000', 'taker': '0', 'maker': '0' },
                            { 'pair': 'QTUM/USD', 'min_q': '0.1', 'max_q': '500000', 'min_p': '0.00000001', 'max_p': '10000', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'QTUM/BTC', 'min_q': '0.1', 'max_q': '500000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.0001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'QTUM/ETH', 'min_q': '0.1', 'max_q': '500000', 'min_p': '0.00000001', 'max_p': '100', 'min_a': '0.001', 'max_a': '5000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ROOBEE/BTC', 'min_q': '1', 'max_q': '10000000', 'min_p': '0.00000001', 'max_p': '0.1', 'min_a': '0.00001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'SMART/USD', 'min_q': '10', 'max_q': '100000000', 'min_p': '0.000001', 'max_p': '1000', 'min_a': '1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'SMART/RUB', 'min_q': '10', 'max_q': '100000000', 'min_p': '0.0001', 'max_p': '100000', 'min_a': '10', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'SMART/EUR', 'min_q': '10', 'max_q': '100000000', 'min_p': '0.000001', 'max_p': '1000', 'min_a': '1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'SMART/BTC', 'min_q': '10', 'max_q': '100000000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.00001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'TRX/USD', 'min_q': '1', 'max_q': '50000000', 'min_p': '0.0001', 'max_p': '1000', 'min_a': '0.01', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'TRX/EUR', 'min_q': '0.01', 'max_q': '50000000', 'min_p': '0.0001', 'max_p': '1000', 'min_a': '0.01', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'TRX/RUB', 'min_q': '1', 'max_q': '50000000', 'min_p': '0.000001', 'max_p': '100000', 'min_a': '0.1', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'TRX/UAH', 'min_q': '1', 'max_q': '50000000', 'min_p': '0.000001', 'max_p': '100000', 'min_a': '0.1', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'TRX/BTC', 'min_q': '1', 'max_q': '50000000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'USDC/USD', 'min_q': '1', 'max_q': '500000', 'min_p': '0.0001', 'max_p': '1000', 'min_a': '3', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'USDC/BTC', 'min_q': '1', 'max_q': '500000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.0001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'USDC/ETH', 'min_q': '1', 'max_q': '500000', 'min_p': '0.0000001', 'max_p': '100', 'min_a': '0.001', 'max_a': '1000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'USDC/USDT', 'min_q': '1', 'max_q': '500000', 'min_p': '0.0001', 'max_p': '1000', 'min_a': '3', 'max_a': '500000', 'taker': '0', 'maker': '0' },
                            { 'pair': 'USDT/USD', 'min_q': '1', 'max_q': '500000', 'min_p': '0.5', 'max_p': '10', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'USDT/RUB', 'min_q': '1', 'max_q': '500000', 'min_p': '0.01', 'max_p': '1000', 'min_a': '10', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'USDT/EUR', 'min_q': '0.01', 'max_q': '500000', 'min_p': '0.1', 'max_p': '10', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'USDT/GBP', 'min_q': '1', 'max_q': '500000', 'min_p': '0.5', 'max_p': '10', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'USDT/UAH', 'min_q': '0.01', 'max_q': '500000', 'min_p': '1', 'max_p': '3000', 'min_a': '2', 'max_a': '15000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'USDT/KZT', 'min_q': '1', 'max_q': '500000', 'min_p': '200', 'max_p': '4000', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'VLX/BTC', 'min_q': '1', 'max_q': '10000000', 'min_p': '0.00000001', 'max_p': '0.1', 'min_a': '0.00001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'WAVES/USD', 'min_q': '0.5', 'max_q': '500000', 'min_p': '0.001', 'max_p': '3500', 'min_a': '0.5', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'WAVES/RUB', 'min_q': '0.5', 'max_q': '500000', 'min_p': '0.01', 'max_p': '10000', 'min_a': '1', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'WAVES/BTC', 'min_q': '0.5', 'max_q': '500000', 'min_p': '0.000001', 'max_p': '1', 'min_a': '0.0001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'WAVES/ETH', 'min_q': '0.5', 'max_q': '500000', 'min_p': '0.00001', 'max_p': '30', 'min_a': '0.0035', 'max_a': '3500', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XEM/USD', 'min_q': '10', 'max_q': '10000000', 'min_p': '0.00001', 'max_p': '1000', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XEM/EUR', 'min_q': '10', 'max_q': '10000000', 'min_p': '0.00001', 'max_p': '1000', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XEM/UAH', 'min_q': '1', 'max_q': '10000000', 'min_p': '0.0001', 'max_p': '30000', 'min_a': '10', 'max_a': '15000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XEM/BTC', 'min_q': '10', 'max_q': '10000000', 'min_p': '0.0000001', 'max_p': '1', 'min_a': '0.00015', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XLM/USD', 'min_q': '0.01', 'max_q': '5000000', 'min_p': '0.0001', 'max_p': '1000', 'min_a': '0.01', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XLM/RUB', 'min_q': '0.01', 'max_q': '5000000', 'min_p': '0.00001', 'max_p': '100000', 'min_a': '0.1', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XLM/TRY', 'min_q': '0.01', 'max_q': '5000000', 'min_p': '0.00001', 'max_p': '100000', 'min_a': '0.1', 'max_a': '6000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XLM/BTC', 'min_q': '1', 'max_q': '5000000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XMR/USD', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.001', 'max_p': '1000', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XMR/RUB', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.001', 'max_p': '600000', 'min_a': '10', 'max_a': '16000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XMR/EUR', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.001', 'max_p': '1000', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XMR/UAH', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.001', 'max_p': '300000', 'min_a': '5', 'max_a': '16000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XMR/BTC', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.0001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XMR/ETH', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.00000001', 'max_p': '100', 'min_a': '0.001', 'max_a': '5000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XRP/EUR', 'min_q': '1', 'max_q': '5000000', 'min_p': '0.001', 'max_p': '1000', 'min_a': '0.001', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XRP/GBP', 'min_q': '1', 'max_q': '5000000', 'min_p': '0.001', 'max_p': '1000', 'min_a': '0.001', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XRP/TRY', 'min_q': '1', 'max_q': '5000000', 'min_p': '0.0001', 'max_p': '1000', 'min_a': '0.01', 'max_a': '6000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XRP/UAH', 'min_q': '1', 'max_q': '5000000', 'min_p': '0.0001', 'max_p': '1000', 'min_a': '0.01', 'max_a': '15000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XRP/USDT', 'min_q': '1', 'max_q': '5000000', 'min_p': '0.001', 'max_p': '1000', 'min_a': '0.001', 'max_a': '500000', 'taker': '0', 'maker': '0' },
                            { 'pair': 'XRP/ETH', 'min_q': '1', 'max_q': '5000000', 'min_p': '0.00000001', 'max_p': '10', 'min_a': '0.00001', 'max_a': '5000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XTZ/USD', 'min_q': '0.1', 'max_q': '100000', 'min_p': '0.0001', 'max_p': '1000', 'min_a': '0.1', 'max_a': '100000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XTZ/RUB', 'min_q': '0.1', 'max_q': '100000', 'min_p': '0.00001', 'max_p': '100000', 'min_a': '0.5', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XTZ/BTC', 'min_q': '0.1', 'max_q': '100000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.00001', 'max_a': '10', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'XTZ/ETH', 'min_q': '0.1', 'max_q': '100000', 'min_p': '0.0000001', 'max_p': '10', 'min_a': '0.0001', 'max_a': '1000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ZEC/USD', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.001', 'max_p': '5000', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ZEC/RUB', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.001', 'max_p': '100000', 'min_a': '0.1', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ZEC/EUR', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.001', 'max_p': '5000', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ZEC/BTC', 'min_q': '0.01', 'max_q': '10000', 'min_p': '0.00001', 'max_p': '10', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ZRX/USD', 'min_q': '0.01', 'max_q': '10000000', 'min_p': '0.00001', 'max_p': '1000', 'min_a': '0.1', 'max_a': '500000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ZRX/BTC', 'min_q': '1', 'max_q': '10000000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ZRX/ETH', 'min_q': '0.01', 'max_q': '10000000', 'min_p': '0.00000001', 'max_p': '10', 'min_a': '0.01', 'max_a': '5000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'ZAG/BTC', 'min_q': '1', 'max_q': '10000000', 'min_p': '0.00000001', 'max_p': '0.1', 'min_a': '0.00001', 'max_a': '100', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'USD/RUB', 'min_q': '1', 'max_q': '500000', 'min_p': '0.01', 'max_p': '1000', 'min_a': '10', 'max_a': '50000000', 'taker': '0.4', 'maker': '0.4' },
                            { 'pair': 'EXM/BTC', 'min_q': '1', 'max_q': '100000000', 'min_p': '0.00000001', 'max_p': '1', 'min_a': '0.0000001', 'max_a': '1', 'taker': '0.4', 'maker': '0.4' },
                        ],
                        'fees': [
                            {
                                'group': 'crypto',
                                'title': 'Cryptocurrency',
                                'items': [
                                    { 'prov': 'EXM', 'dep': '0%', 'wd': '1 EXM' },
                                    { 'prov': 'BTC', 'dep': '0%', 'wd': '0.0004 BTC' },
                                    { 'prov': 'LTC', 'dep': '0%', 'wd': '0.01 LTC' },
                                    { 'prov': 'DOGE', 'dep': '0%', 'wd': '1 Doge' },
                                    { 'prov': 'DASH', 'dep': '0%', 'wd': '0.002 DASH' },
                                    { 'prov': 'ETH', 'dep': '0%', 'wd': '0.003 ETH' },
                                    { 'prov': 'WAVES', 'dep': '0%', 'wd': '0.001 WAVES' },
                                    { 'prov': 'ZEC', 'dep': '0%', 'wd': '0.001 ZEC' },
                                    { 'prov': 'USDT', 'dep': '0%', 'wd': '' },
                                    { 'prov': 'XMR', 'dep': '0%', 'wd': '0.001 XMR' },
                                    { 'prov': 'XRP', 'dep': '0%', 'wd': '0.02 XRP' },
                                    { 'prov': 'ETC', 'dep': '0%', 'wd': '0.01 ETC' },
                                    { 'prov': 'BCH', 'dep': '0%', 'wd': '0.001 BCH' },
                                    { 'prov': 'BTG', 'dep': '0%', 'wd': '0.001 BTG' },
                                    { 'prov': 'EOS', 'dep': '0%', 'wd': '0.05 EOS' },
                                    { 'prov': 'XLM', 'dep': '0%', 'wd': '0.01 XLM' },
                                    { 'prov': 'OMG', 'dep': '0.1 OMG', 'wd': '0.5 OMG' },
                                    { 'prov': 'TRX', 'dep': '0%', 'wd': '1 TRX' },
                                    { 'prov': 'ADA', 'dep': '0%', 'wd': '1 ADA' },
                                    { 'prov': 'NEO', 'dep': '0%', 'wd': '0%' },
                                    { 'prov': 'GAS', 'dep': '0%', 'wd': '0%' },
                                    { 'prov': 'ZRX', 'dep': '0%', 'wd': '1 ZRX' },
                                    { 'prov': 'GNT', 'dep': '0%', 'wd': '1 GNT' },
                                    { 'prov': 'GUSD', 'dep': '0%', 'wd': '0.5 GUSD' },
                                    { 'prov': 'LSK', 'dep': '0%', 'wd': '0.1 LSK' },
                                    { 'prov': 'XEM', 'dep': '0%', 'wd': '5 XEM' },
                                    { 'prov': 'SMART', 'dep': '0%', 'wd': '0.5 SMART' },
                                    { 'prov': 'QTUM', 'dep': '0%', 'wd': '0.01 QTUM' },
                                    { 'prov': 'HB', 'dep': '0%', 'wd': '10 HB' },
                                    { 'prov': 'DAI', 'dep': '0%', 'wd': '1 DAI' },
                                    { 'prov': 'MKR', 'dep': '0%', 'wd': '0.005 MKR' },
                                    { 'prov': 'MNC', 'dep': '0%', 'wd': '15 MNC' },
                                    { 'prov': 'PTI', 'dep': '-', 'wd': '10 PTI' },
                                    { 'prov': 'ETZ', 'dep': '0%', 'wd': '1 ETZ' },
                                    { 'prov': 'USDC', 'dep': '0%', 'wd': '0.5 USDC' },
                                    { 'prov': 'ROOBEE', 'dep': '0%', 'wd': '200 ROOBEE' },
                                    { 'prov': 'DCR', 'dep': '0%', 'wd': '0.01 DCR' },
                                    { 'prov': 'ZAG', 'dep': '0%', 'wd': '0%' },
                                    { 'prov': 'BTT', 'dep': '0 BTT', 'wd': '100 BTT' },
                                    { 'prov': 'VLX', 'dep': '0%', 'wd': '1 VLX' },
                                    { 'prov': 'CRON', 'dep': '0%', 'wd': '5 CRON' },
                                    { 'prov': 'ONT', 'dep': '0%', 'wd': '1 ONT' },
                                    { 'prov': 'ONG', 'dep': '0%', 'wd': '5 ONG' },
                                    { 'prov': 'ALGO', 'dep': '0%', 'wd': '0.01 ALGO' },
                                    { 'prov': 'ATOM', 'dep': '0%', 'wd': '0.05 ATOM' },
                                ],
                            },
                            {
                                'group': 'usd',
                                'title': 'USD',
                                'items': [
                                    { 'prov': 'Payeer', 'dep': '3.95%', 'wd': '-' },
                                    { 'prov': 'EX-CODE', 'dep': '', 'wd': '0.2%' },
                                    { 'prov': 'AdvCash', 'dep': '0%', 'wd': '2.49%' },
                                    { 'prov': 'Visa/MasterCard (Simplex)', 'dep': '4.5% + 0.5 USD', 'wd': '-' },
                                    { 'prov': 'Visa', 'dep': '3.45%', 'wd': '-' },
                                    { 'prov': 'Frick Bank', 'dep': '0 USD', 'wd': '-' },
                                ],
                            },
                            {
                                'group': 'eur',
                                'title': 'EUR',
                                'items': [
                                    { 'prov': 'Visa/MasterCard', 'dep': '4.5% + 0.5  EUR', 'wd': '-' },
                                    { 'prov': 'EX-CODE', 'dep': '', 'wd': '0.2%' },
                                    { 'prov': 'Visa', 'dep': '2.95%', 'wd': '-' },
                                    { 'prov': 'Frick Internal Transfer', 'dep': '0 EUR', 'wd': '-' },
                                    { 'prov': 'SEPA Frick Bank', 'dep': '0 EUR', 'wd': '1 EUR' },
                                    { 'prov': 'WIRE Frick Bank', 'dep': '0%', 'wd': '20 EUR' },
                                    { 'prov': 'SEPA Weg Ag', 'dep': '-', 'wd': '1 EUR' },
                                ],
                            },
                            {
                                'group': 'gbp',
                                'title': 'GBP',
                                'items': [
                                    { 'prov': 'EX-CODE', 'dep': '', 'wd': '0.2%' },
                                    { 'prov': 'WIRE Frick Bank', 'dep': '10 GBP', 'wd': '-' },
                                ],
                            },
                            {
                                'group': 'rub',
                                'title': 'RUB',
                                'items': [
                                    { 'prov': 'Payeer', 'dep': '2.49%', 'wd': '3.49%' },
                                    { 'prov': 'EX-CODE', 'dep': '', 'wd': '0.2%' },
                                    { 'prov': 'Qiwi', 'dep': '1.49%', 'wd': '2.49%' },
                                    { 'prov': 'Yandex Money', 'dep': '1.49%', 'wd': '1.95 %' },
                                    { 'prov': 'AdvCash', 'dep': '0.99%', 'wd': '0.99%' },
                                    { 'prov': 'Visa/MasterCard', 'dep': '2.99%', 'wd': '3.99% + 60 RUB' },
                                ],
                            },
                            {
                                'group': 'pln',
                                'title': 'PLN',
                                'items': [
                                    { 'prov': 'EX-CODE', 'dep': '', 'wd': '0.2%' },
                                ],
                            },
                            {
                                'group': 'try',
                                'title': 'TRY',
                                'items': [
                                    { 'prov': 'EX-CODE', 'dep': '', 'wd': '0.2%' },
                                    { 'prov': 'Visa', 'dep': '3.05%', 'wd': '-' },
                                    { 'prov': 'Visa/MasterCard (Simplex)', 'dep': '4.5% + 2 TRY', 'wd': '-' },
                                    { 'prov': 'AdvCash', 'dep': '0%', 'wd': '-' },
                                ],
                            },
                            {
                                'group': 'uah',
                                'title': 'UAH',
                                'items': [
                                    { 'prov': 'EX-CODE', 'dep': '', 'wd': '0.2%' },
                                    { 'prov': 'Terminal', 'dep': '2.6%', 'wd': '-' },
                                    { 'prov': 'Visa/MasterCard EasyTransfer', 'dep': '-', 'wd': '2.99%' },
                                    { 'prov': 'Visa/MasterCard', 'dep': '1% + 5 UAH', 'wd': '-' },
                                ],
                            },
                            {
                                'group': 'kzt',
                                'title': 'KZT',
                                'items': [
                                    { 'prov': 'Visa/MasterCard', 'dep': '3.5%', 'wd': '2.99% + 450 KZT' },
                                    { 'prov': 'EX-CODE', 'dep': '', 'wd': '0.2%' },
                                    { 'prov': 'AdvCash', 'dep': '0%', 'wd': '-' },
                                ],
                            },
                        ],
                    },
                },
            },
            'exceptions': {
                'exact': {
                    '40005': AuthenticationError, // Authorization error, incorrect signature
                    '40009': InvalidNonce, //
                    '40015': ExchangeError, // API function do not exist
                    '40016': OnMaintenance, // {"result":false,"error":"Error 40016: Maintenance work in progress"}
                    '40017': AuthenticationError, // Wrong API Key
                    '40032': PermissionDenied, // {"result":false,"error":"Error 40032: Access is denied for this API key"}
                    '40034': RateLimitExceeded, // {"result":false,"error":"Error 40034: Access is denied, rate limit is exceeded"}
                    '50052': InsufficientFunds,
                    '50054': InsufficientFunds,
                    '50304': OrderNotFound, // "Order was not found '123456789'" (fetching order trades for an order that does not have trades yet)
                    '50173': OrderNotFound, // "Order with id X was not found." (cancelling non-existent, closed and cancelled order)
                    '50277': InvalidOrder,
                    '50319': InvalidOrder, // Price by order is less than permissible minimum for this pair
                    '50321': InvalidOrder, // Price by order is more than permissible maximum for this pair
                },
                'broad': {
                    'range period is too long': BadRequest,
                    'invalid syntax': BadRequest,
                    'API rate limit exceeded': RateLimitExceeded, // {"result":false,"error":"API rate limit exceeded for 99.33.55.224. Retry after 60 sec.","history":[],"begin":1579392000,"end":1579478400}
                },
            },
            'orders': {}, // orders cache / emulation
        });
    }

    async fetchTradingFees (params = {}) {
        if (this.options['useWebapiForFetchingFees']) {
            const response = await this.webGetEnDocsFees (params);
            let parts = response.split ('<td class="th_fees_2" colspan="2">');
            let numParts = parts.length;
            if (numParts !== 2) {
                throw new NotSupported (this.id + ' fetchTradingFees format has changed');
            }
            const rest = parts[1];
            parts = rest.split ('</td>');
            numParts = parts.length;
            if (numParts < 2) {
                throw new NotSupported (this.id + ' fetchTradingFees format has changed');
            }
            const fee = parseFloat (parts[0].replace ('%', '')) * 0.01;
            const taker = fee;
            const maker = fee;
            return {
                // 'info': response,
                'maker': maker,
                'taker': taker,
            };
        } else {
            return {
                'maker': this.fees['trading']['maker'],
                'taker': this.fees['trading']['taker'],
            };
        }
    }

    parseFixedFloatValue (input) {
        if ((input === undefined) || (input === '-')) {
            return undefined;
        }
        if (input === '') {
            return 0;
        }
        const isPercentage = (input.indexOf ('%') >= 0);
        const parts = input.split (' ');
        const value = parts[0].replace ('%', '');
        const result = parseFloat (value);
        if ((result > 0) && isPercentage) {
            throw new ExchangeError (this.id + ' parseFixedFloatValue detected an unsupported non-zero percentage-based fee ' + input);
        }
        return result;
    }

    async fetchFundingFees (params = {}) {
        let response = undefined;
        if (this.options['useWebapiForFetchingFees']) {
            response = await this.webGetCtrlFeesAndLimits (params);
        } else {
            response = this.options['feesAndLimits'];
        }
        // the code below assumes all non-zero crypto fees are fixed (for now)
        const withdraw = {};
        const deposit = {};
        const groups = this.safeValue (response['data'], 'fees');
        const groupsByGroup = this.indexBy (groups, 'group');
        const items = groupsByGroup['crypto']['items'];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const code = this.safeCurrencyCode (this.safeString (item, 'prov'));
            const withdrawalFee = this.safeString (item, 'wd');
            const depositFee = this.safeString (item, 'dep');
            if (withdrawalFee !== undefined) {
                withdraw[code] = this.parseFixedFloatValue (withdrawalFee);
            }
            if (depositFee !== undefined) {
                deposit[code] = this.parseFixedFloatValue (depositFee);
            }
        }
        // sets fiat fees to undefined
        const fiatGroups = this.toArray (this.omit (groupsByGroup, 'crypto'));
        for (let i = 0; i < fiatGroups.length; i++) {
            const code = this.safeCurrencyCode (this.safeString (fiatGroups[i], 'title'));
            withdraw[code] = undefined;
            deposit[code] = undefined;
        }
        const result = {
            'info': response,
            'withdraw': withdraw,
            'deposit': deposit,
        };
        // cache them for later use
        this.options['fundingFees'] = result;
        return result;
    }

    async fetchCurrencies (params = {}) {
        const fees = await this.fetchFundingFees (params);
        // todo redesign the 'fee' property in currencies
        const ids = Object.keys (fees['withdraw']);
        const limitsByMarketId = this.indexBy (fees['info']['data']['limits'], 'pair');
        const marketIds = Object.keys (limitsByMarketId);
        const minAmounts = {};
        const minPrices = {};
        const minCosts = {};
        const maxAmounts = {};
        const maxPrices = {};
        const maxCosts = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const limit = limitsByMarketId[marketId];
            const [ baseId, quoteId ] = marketId.split ('/');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const maxAmount = this.safeFloat (limit, 'max_q');
            const maxPrice = this.safeFloat (limit, 'max_p');
            const maxCost = this.safeFloat (limit, 'max_a');
            const minAmount = this.safeFloat (limit, 'min_q');
            const minPrice = this.safeFloat (limit, 'min_p');
            const minCost = this.safeFloat (limit, 'min_a');
            minAmounts[base] = Math.min (this.safeFloat (minAmounts, base, minAmount), minAmount);
            maxAmounts[base] = Math.max (this.safeFloat (maxAmounts, base, maxAmount), maxAmount);
            minPrices[quote] = Math.min (this.safeFloat (minPrices, quote, minPrice), minPrice);
            minCosts[quote] = Math.min (this.safeFloat (minCosts, quote, minCost), minCost);
            maxPrices[quote] = Math.max (this.safeFloat (maxPrices, quote, maxPrice), maxPrice);
            maxCosts[quote] = Math.max (this.safeFloat (maxCosts, quote, maxCost), maxCost);
        }
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const code = this.safeCurrencyCode (id);
            const fee = this.safeValue (fees['withdraw'], code);
            const active = true;
            result[code] = {
                'id': id,
                'code': code,
                'name': code,
                'active': active,
                'fee': fee,
                'precision': 8,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (minAmounts, code),
                        'max': this.safeFloat (maxAmounts, code),
                    },
                    'price': {
                        'min': this.safeFloat (minPrices, code),
                        'max': this.safeFloat (maxPrices, code),
                    },
                    'cost': {
                        'min': this.safeFloat (minCosts, code),
                        'max': this.safeFloat (maxCosts, code),
                    },
                },
                'info': id,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetPairSettings (params);
        //
        //     {
        //         "BTC_USD":{
        //             "min_quantity":"0.0001",
        //             "max_quantity":"1000",
        //             "min_price":"1",
        //             "max_price":"30000",
        //             "max_amount":"500000",
        //             "min_amount":"1",
        //             "price_precision":8,
        //             "commission_taker_percent":"0.4",
        //             "commission_maker_percent":"0.4"
        //         },
        //     }
        //
        const keys = Object.keys (response);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = response[id];
            const symbol = id.replace ('_', '/');
            const [ baseId, quoteId ] = symbol.split ('/');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const taker = this.safeFloat (market, 'commission_taker_percent');
            const maker = this.safeFloat (market, 'commission_maker_percent');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'taker': taker / 100,
                'maker': maker / 100,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'min_quantity'),
                        'max': this.safeFloat (market, 'max_quantity'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'min_price'),
                        'max': this.safeFloat (market, 'max_price'),
                    },
                    'cost': {
                        'min': this.safeFloat (market, 'min_amount'),
                        'max': this.safeFloat (market, 'max_amount'),
                    },
                },
                'precision': {
                    'amount': 8,
                    'price': this.safeInteger (market, 'price_precision'),
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        const options = this.safeValue (this.options, 'fetchOHLCV');
        const maxLimit = this.safeInteger (options, 'maxLimit', 3000);
        const duration = this.parseTimeframe (timeframe);
        const now = this.milliseconds ();
        if (since === undefined) {
            if (limit === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOHLCV requires a since argument or a limit argument');
            } else {
                if (limit > maxLimit) {
                    throw new BadRequest (this.id + ' fetchOHLCV will serve ' + maxLimit.toString () + ' candles at most');
                }
                request['from'] = parseInt (now / 1000) - limit * duration - 1;
                request['to'] = parseInt (now / 1000);
            }
        } else {
            request['from'] = parseInt (since / 1000) - 1;
            if (limit === undefined) {
                request['to'] = parseInt (now / 1000);
            } else {
                if (limit > maxLimit) {
                    throw new BadRequest (this.id + ' fetchOHLCV will serve ' + maxLimit.toString () + ' candles at most');
                }
                const to = this.sum (since, limit * duration * 1000);
                request['to'] = parseInt (to / 1000);
            }
        }
        const response = await this.publicGetCandlesHistory (this.extend (request, params));
        //
        //     {
        //         "candles":[
        //             {"t":1584057600000,"o":0.02235144,"c":0.02400233,"h":0.025171,"l":0.02221,"v":5988.34031761},
        //             {"t":1584144000000,"o":0.0240373,"c":0.02367413,"h":0.024399,"l":0.0235,"v":2027.82522329},
        //             {"t":1584230400000,"o":0.02363458,"c":0.02319242,"h":0.0237948,"l":0.02223196,"v":1707.96944997},
        //         ]
        //     }
        //
        const candles = this.safeValue (response, 'candles', []);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "t":1584057600000,
        //         "o":0.02235144,
        //         "c":0.02400233,
        //         "h":0.025171,
        //         "l":0.02221,
        //         "v":5988.34031761
        //     }
        //
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeFloat (ohlcv, 'o'),
            this.safeFloat (ohlcv, 'h'),
            this.safeFloat (ohlcv, 'l'),
            this.safeFloat (ohlcv, 'c'),
            this.safeFloat (ohlcv, 'v'),
        ];
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostUserInfo (params);
        const result = { 'info': response };
        const free = this.safeValue (response, 'balances', {});
        const used = this.safeValue (response, 'reserved', {});
        const codes = Object.keys (free);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currencyId = this.currencyId (code);
            const account = this.account ();
            if (currencyId in free) {
                account['free'] = this.safeFloat (free, currencyId);
            }
            if (currencyId in used) {
                account['used'] = this.safeFloat (used, currencyId);
            }
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrderBook (this.extend (request, params));
        const result = this.safeValue (response, market['id']);
        return this.parseOrderBook (result, undefined, 'bid', 'ask');
    }

    async fetchOrderBooks (symbols = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = undefined;
        if (symbols === undefined) {
            ids = this.ids.join (',');
            // max URL length is 2083 symbols, including http schema, hostname, tld, etc...
            if (ids.length > 2048) {
                const numIds = this.ids.length;
                throw new ExchangeError (this.id + ' has ' + numIds.toString () + ' symbols exceeding max URL length, you are required to specify a list of symbols in the first argument to fetchOrderBooks');
            }
        } else {
            ids = this.marketIds (symbols);
            ids = ids.join (',');
        }
        const request = {
            'pair': ids,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrderBook (this.extend (request, params));
        const result = {};
        const marketIds = Object.keys (response);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            let symbol = marketId;
            if (marketId in this.markets_by_id) {
                const market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
            result[symbol] = this.parseOrderBook (response[marketId], undefined, 'bid', 'ask');
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeTimestamp (ticker, 'updated');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last_trade');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy_price'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell_price'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'avg'),
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'vol_curr'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        const result = {};
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.markets_by_id[id];
            const symbol = market['symbol'];
            const ticker = response[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        const market = this.market (symbol);
        return this.parseTicker (response[market['id']], market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "trade_id":165087520,
        //         "date":1587470005,
        //         "type":"buy",
        //         "quantity":"1.004",
        //         "price":"0.02491461",
        //         "amount":"0.02501426"
        //     },
        //
        // fetchMyTrades, fetchOrderTrades
        //
        //     {
        //         "trade_id": 3,
        //         "date": 1435488248,
        //         "type": "buy",
        //         "pair": "BTC_USD",
        //         "order_id": 12345,
        //         "quantity": 1,
        //         "price": 100,
        //         "amount": 100,
        //         "exec_type": "taker",
        //         "commission_amount": "0.02",
        //         "commission_currency": "BTC",
        //         "commission_percent": "0.2"
        //     }
        //
        const timestamp = this.safeTimestamp (trade, 'date');
        let symbol = undefined;
        const id = this.safeString (trade, 'trade_id');
        const orderId = this.safeString (trade, 'order_id');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'quantity');
        const cost = this.safeFloat (trade, 'amount');
        const side = this.safeString (trade, 'type');
        const type = undefined;
        const marketId = this.safeString (trade, 'pair');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const takerOrMaker = this.safeString (trade, 'exec_type');
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'commission_amount');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'commission_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            let feeRate = this.safeFloat (trade, 'commission_percent');
            if (feeRate !== undefined) {
                feeRate /= 1000;
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
                'rate': feeRate,
            };
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "ETH_BTC":[
        //             {
        //                 "trade_id":165087520,
        //                 "date":1587470005,
        //                 "type":"buy",
        //                 "quantity":"1.004",
        //                 "price":"0.02491461",
        //                 "amount":"0.02501426"
        //             },
        //             {
        //                 "trade_id":165087369,
        //                 "date":1587469938,
        //                 "type":"buy",
        //                 "quantity":"0.94",
        //                 "price":"0.02492348",
        //                 "amount":"0.02342807"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, market['id'], []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // a symbol is required but it can be a single string, or a non-empty array
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument (a single symbol or an array)');
        }
        await this.loadMarkets ();
        let pair = undefined;
        let market = undefined;
        if (Array.isArray (symbol)) {
            const numSymbols = symbol.length;
            if (numSymbols < 1) {
                throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a non-empty symbol array');
            }
            const marketIds = this.marketIds (symbol);
            pair = marketIds.join (',');
        } else {
            market = this.market (symbol);
            pair = market['id'];
        }
        const request = {
            'pair': pair,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostUserTrades (this.extend (request, params));
        let result = [];
        const marketIds = Object.keys (response);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            let symbol = undefined;
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            const items = response[marketId];
            const trades = this.parseTrades (items, market, since, limit, {
                'symbol': symbol,
            });
            result = this.arrayConcat (result, trades);
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const prefix = (type === 'market') ? (type + '_') : '';
        const market = this.market (symbol);
        if ((type === 'market') && (price === undefined)) {
            price = 0;
        }
        const request = {
            'pair': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'type': prefix + side,
            'price': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostOrderCreate (this.extend (request, params));
        const id = this.safeString (response, 'order_id');
        const timestamp = this.milliseconds ();
        amount = parseFloat (amount);
        price = parseFloat (price);
        const status = 'open';
        return {
            'id': id,
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'remaining': amount,
            'filled': 0.0,
            'fee': undefined,
            'trades': undefined,
            'clientOrderId': undefined,
            'average': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = { 'order_id': id };
        return await this.privatePostOrderCancel (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id.toString (),
        };
        const response = await this.privatePostOrderTrades (this.extend (request, params));
        //
        //     {
        //         "type": "buy",
        //         "in_currency": "BTC",
        //         "in_amount": "1",
        //         "out_currency": "USD",
        //         "out_amount": "100",
        //         "trades": [
        //             {
        //                 "trade_id": 3,
        //                 "date": 1435488248,
        //                 "type": "buy",
        //                 "pair": "BTC_USD",
        //                 "order_id": 12345,
        //                 "quantity": 1,
        //                 "price": 100,
        //                 "amount": 100
        //             }
        //         ]
        //     }
        //
        const order = this.parseOrder (response);
        return this.extend (order, {
            'id': id.toString (),
        });
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'order_id': id.toString (),
        };
        const response = await this.privatePostOrderTrades (this.extend (request, params));
        //
        //     {
        //         "type": "buy",
        //         "in_currency": "BTC",
        //         "in_amount": "1",
        //         "out_currency": "USD",
        //         "out_amount": "100",
        //         "trades": [
        //             {
        //                 "trade_id": 3,
        //                 "date": 1435488248,
        //                 "type": "buy",
        //                 "pair": "BTC_USD",
        //                 "order_id": 12345,
        //                 "quantity": 1,
        //                 "price": 100,
        //                 "amount": 100,
        //                 "exec_type": "taker",
        //                 "commission_amount": "0.02",
        //                 "commission_currency": "BTC",
        //                 "commission_percent": "0.2"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'trades');
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostUserOpenOrders (params);
        const marketIds = Object.keys (response);
        let orders = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            let market = undefined;
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
            const parsedOrders = this.parseOrders (response[marketId], market);
            orders = this.arrayConcat (orders, parsedOrders);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrders, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "order_id": "14",
        //         "created": "1435517311",
        //         "type": "buy",
        //         "pair": "BTC_USD",
        //         "price": "100",
        //         "quantity": "1",
        //         "amount": "100"
        //     }
        //
        // fetchOrder
        //
        //     {
        //         "type": "buy",
        //         "in_currency": "BTC",
        //         "in_amount": "1",
        //         "out_currency": "USD",
        //         "out_amount": "100",
        //         "trades": [
        //             {
        //                 "trade_id": 3,
        //                 "date": 1435488248,
        //                 "type": "buy",
        //                 "pair": "BTC_USD",
        //                 "order_id": 12345,
        //                 "quantity": 1,
        //                 "price": 100,
        //                 "amount": 100
        //             }
        //         ]
        //     }
        //
        let id = this.safeString (order, 'order_id');
        let timestamp = this.safeTimestamp (order, 'created');
        let symbol = undefined;
        const side = this.safeString (order, 'type');
        if (market === undefined) {
            let marketId = undefined;
            if ('pair' in order) {
                marketId = order['pair'];
            } else if (('in_currency' in order) && ('out_currency' in order)) {
                if (side === 'buy') {
                    marketId = order['in_currency'] + '_' + order['out_currency'];
                } else {
                    marketId = order['out_currency'] + '_' + order['in_currency'];
                }
            }
            if ((marketId !== undefined) && (marketId in this.markets_by_id)) {
                market = this.markets_by_id[marketId];
            }
        }
        let amount = this.safeFloat (order, 'quantity');
        if (amount === undefined) {
            const amountField = (side === 'buy') ? 'in_amount' : 'out_amount';
            amount = this.safeFloat (order, amountField);
        }
        let price = this.safeFloat (order, 'price');
        let cost = this.safeFloat (order, 'amount');
        let filled = 0.0;
        const trades = [];
        const transactions = this.safeValue (order, 'trades', []);
        let feeCost = undefined;
        let lastTradeTimestamp = undefined;
        let average = undefined;
        const numTransactions = transactions.length;
        if (numTransactions > 0) {
            feeCost = 0;
            for (let i = 0; i < numTransactions; i++) {
                const trade = this.parseTrade (transactions[i], market);
                if (id === undefined) {
                    id = trade['order'];
                }
                if (timestamp === undefined) {
                    timestamp = trade['timestamp'];
                }
                if (timestamp > trade['timestamp']) {
                    timestamp = trade['timestamp'];
                }
                filled = this.sum (filled, trade['amount']);
                feeCost = this.sum (feeCost, trade['fee']['cost']);
                trades.push (trade);
            }
            lastTradeTimestamp = trades[numTransactions - 1]['timestamp'];
        }
        let status = this.safeString (order, 'status'); // in case we need to redefine it for canceled orders
        let remaining = undefined;
        if (amount !== undefined) {
            remaining = amount - filled;
            if (filled >= amount) {
                status = 'closed';
            } else {
                status = 'open';
            }
        }
        if (market === undefined) {
            market = this.getMarketFromTrades (trades);
        }
        let feeCurrency = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        }
        if (cost === undefined) {
            if (price !== undefined) {
                cost = price * filled;
            }
        } else {
            if (filled > 0) {
                if (average === undefined) {
                    average = cost / filled;
                }
                if (price === undefined) {
                    price = cost / filled;
                }
            }
        }
        const fee = {
            'cost': feeCost,
            'currency': feeCurrency,
        };
        return {
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': average,
            'trades': trades,
            'fee': fee,
            'info': order,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostDepositAddress (params);
        const depositAddress = this.safeString (response, code);
        let address = undefined;
        let tag = undefined;
        if (depositAddress) {
            const addressAndTag = depositAddress.split (',');
            address = addressAndTag[0];
            const numParts = addressAndTag.length;
            if (numParts > 1) {
                tag = addressAndTag[1];
            }
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    getMarketFromTrades (trades) {
        const tradesBySymbol = this.indexBy (trades, 'pair');
        const symbols = Object.keys (tradesBySymbol);
        const numSymbols = symbols.length;
        if (numSymbols === 1) {
            return this.markets[symbols[0]];
        }
        return undefined;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        const rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        let key = 'quote';
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'amount': amount,
            'currency': currency['id'],
            'address': address,
        };
        if (tag !== undefined) {
            request['invoice'] = tag;
        }
        const response = await this.privatePostWithdrawCrypt (this.extend (request, params));
        return {
            'info': response,
            'id': response['task_id'],
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'transferred': 'ok',
            'paid': 'ok',
            'pending': 'pending',
            'processing': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchTransactions
        //
        //          {
        //            "dt": 1461841192,
        //            "type": "deposit",
        //            "curr": "RUB",
        //            "status": "processing",
        //            "provider": "Qiwi (LA) [12345]",
        //            "amount": "1",
        //            "account": "",
        //            "txid": "ec46f784ad976fd7f7539089d1a129fe46...",
        //          }
        //
        const timestamp = this.safeTimestamp (transaction, 'dt');
        let amount = this.safeFloat (transaction, 'amount');
        if (amount !== undefined) {
            amount = Math.abs (amount);
        }
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const txid = this.safeString (transaction, 'txid');
        const type = this.safeString (transaction, 'type');
        const currencyId = this.safeString (transaction, 'curr');
        const code = this.safeCurrencyCode (currencyId, currency);
        let address = this.safeString (transaction, 'account');
        if (address !== undefined) {
            const parts = address.split (':');
            const numParts = parts.length;
            if (numParts === 2) {
                address = parts[1].replace (' ', '');
            }
        }
        let fee = undefined;
        // fixed funding fees only (for now)
        if (!this.fees['funding']['percentage']) {
            const key = (type === 'withdrawal') ? 'withdraw' : 'deposit';
            let feeCost = this.safeFloat (this.options['fundingFees'][key], code);
            // users don't pay for cashbacks, no fees for that
            const provider = this.safeString (transaction, 'provider');
            if (provider === 'cashback') {
                feeCost = 0;
            }
            if (feeCost !== undefined) {
                // withdrawal amount includes the fee
                if (type === 'withdrawal') {
                    amount = amount - feeCost;
                }
                fee = {
                    'cost': feeCost,
                    'currency': code,
                    'rate': undefined,
                };
            }
        }
        return {
            'info': transaction,
            'id': undefined,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': undefined, // refix it properly
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['date'] = parseInt (since / 1000);
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privatePostWalletHistory (this.extend (request, params));
        //
        //     {
        //       "result": true,
        //       "error": "",
        //       "begin": "1493942400",
        //       "end": "1494028800",
        //       "history": [
        //          {
        //            "dt": 1461841192,
        //            "type": "deposit",
        //            "curr": "RUB",
        //            "status": "processing",
        //            "provider": "Qiwi (LA) [12345]",
        //            "amount": "1",
        //            "account": "",
        //            "txid": "ec46f784ad976fd7f7539089d1a129fe46...",
        //          },
        //          {
        //            "dt": 1463414785,
        //            "type": "withdrawal",
        //            "curr": "USD",
        //            "status": "paid",
        //            "provider": "EXCODE",
        //            "amount": "-1",
        //            "account": "EX-CODE_19371_USDda...",
        //            "txid": "",
        //          },
        //       ],
        //     }
        //
        return this.parseTransactions (response['history'], currency, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';
        if (api !== 'web') {
            url += this.version + '/';
        }
        url += path;
        if ((api === 'public') || (api === 'web')) {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    nonce () {
        return this.milliseconds ();
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if (('result' in response) || ('errmsg' in response)) {
            //
            //     {"result":false,"error":"Error 50052: Insufficient funds"}
            //     {"s":"error","errmsg":"strconv.ParseInt: parsing \"\": invalid syntax"}
            //
            let success = this.safeValue (response, 'result', false);
            if (typeof success === 'string') {
                if ((success === 'true') || (success === '1')) {
                    success = true;
                } else {
                    success = false;
                }
            }
            if (!success) {
                let code = undefined;
                const message = this.safeString2 (response, 'error', 'errmsg');
                const errorParts = message.split (':');
                const numParts = errorParts.length;
                if (numParts > 1) {
                    const errorSubParts = errorParts[0].split (' ');
                    const numSubParts = errorSubParts.length;
                    code = (numSubParts > 1) ? errorSubParts[1] : errorSubParts[0];
                }
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
