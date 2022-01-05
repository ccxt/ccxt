/* eslint-disable func-call-spacing */
'use strict';

//  ---------------------------------------------------------------------------
const axios = require('axios');
const Exchange = require ('./base/Exchange');
const { NotSupported, RateLimitExceeded, AuthenticationError, PermissionDenied, ArgumentsRequired, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, InvalidNonce, BadSymbol } = require ('./base/errors');
const { SIGNIFICANT_DIGITS, DECIMAL_PLACES, TRUNCATE, ROUND } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bit4you extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bit4you',
            'name': 'Bit4you',
            'countries': [ 'BE' ], // Belgium
            'version': 'v1',
            'rateLimit': 1500,
            'requiredCredentials': {
                'token': true, // bearer token
                'apiKey': false,
                'secret': false,
                'uid': false,
                'login': false,
                'password': false,
                'twofa': false,
                'privateKey': false,
                'walletAddress': false,
            },
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'CORS': undefined,
                'createDepositAddress': true,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': true,
                'fetchDeposits': undefined,
                'fetchFundingFees': true,
                'fetchIndexOHLCV': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': true,
                'fetchWithdrawals': undefined,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://www.bit4you.io/img/logo/logo.svg',
                'www': 'https://www.bit4you.io/',
                'doc': 'https://docs.bit4you.io/',
                'fees': 'https://www.bit4you.io/services#fees',
                'api': {
                    'coinmarketcap': 'https://www.bit4you.io/api/cmc/v1/', // ex:"/api/cmc/v1/summary"
                    'graphql': 'https://www.bit4you.io/api/markets/graphql',
                    'public': 'https://docs.bit4you.io/',
                    'private': 'https://docs.bit4you.io/',
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        try {
            const response = await axios.get('https://www.bit4you.io/api/market/list');
            return response.data || [];
        } catch (error) {
            return error;
        }
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        try {
            const response = await axios.get(`https://www.bit4you.io/api/cmc/v1/orderbook/${symbol}`);
            return response.data || [];
        } catch (error) {
            return error;
        }
    }
};
