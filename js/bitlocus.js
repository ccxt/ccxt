'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require('./base/Exchange');
const {
	PermissionDenied,
	AuthenticationError,
	InvalidNonce,
} = require('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitlocus extends Exchange {
	describe() {
		return this.deepExtend(super.describe(), {
			id: 'bitlocus',
			name: 'Bitlocus',
			countries: ['EU', 'UK'],
			rateLimit: 500,
			has: {
				fetchMarkets: true,
				fetchCurrencies: true,
				createOrder: true,
				cancelOrder: true,
				cancelAllOrders: true,
				fetchOpenOrders: true,
				fetchOrder: true,
				fetchOrderBook: true,
				fetchBalance: true,
				fetchMyTrades: true,
				fetchTrades: true,
				fetchTicker: true,
				CORS: undefined,
			},
			timeframes: {
				'1m': 1,
				'5m': 5,
				'15m': 15,
				'30m': 30,
				'1h': 60,
				'4h': 240,
				'1d': 1440,
				'1w': 10080,
				'2w': 21600,
			},
			urls: {
				logo: 'https://app.bitlocus.com/1f672f60d12a6b5f446daa93da02f796.png',
				api: {
					public: 'https://api.bitlocus.com',
					private: 'https://api.bitlocus.com',
				},
				www: 'https://www.bitlocus.com',
				doc: 'https://api.bitlocus.com/#introduction',
			},
			fees: {
				trading: {
					percentage: true,
					taker: this.parseNumber('0.002'),
					maker: this.parseNumber('0.001'),
				},
			},
			api: {
				public: {
					get: [
						'assets',
						'markets',
						'order_book/{ticker}',
						'trade_history/{ticker}',
					],
				},
				private: {
					get: [
						'balance',
						'order_info',
						'open_orders',
						'user_trades',
						'payments',
					],
					post: [
						'add_limit_order',
						'add_market_order',
						'cancel',
						'cancel_all_orders',
					],
				},
			},
			exceptions: {
				451: AuthenticationError, // Credentials not found
				452: AuthenticationError, // API key is not active
				453: InvalidNonce, // Nonce value is not valid
				454: PermissionDenied, // This API key has no permission to use the endpoint
				454: PermissionDenied, // Forbidden. User tier level is too low
			},
		});
	}
};
