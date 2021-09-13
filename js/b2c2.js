'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, InvalidAddress, AuthenticationError, OnMaintenance, RateLimitExceeded, PermissionDenied, NotSupported, BadRequest, BadSymbol } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class b2c2 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'b2c2',
            'name': 'B2C2',
            'countries': [ 'GB' ],
            'rateLimit': 500,
            'has': {
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOrders': true,
                'fetchLedger': true,
                'fetchMyTrades': true,
                'createOrder': true,
                'fetchOrder': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/37808081-b87f2d9c-2e59-11e8-894d-c1900b7584fe.jpg',
                'api': {
                    'private': 'https://api.uat.b2c2.net',
                },
                'test': {
                    'private': 'https://api.uat.b2c2.net',
                },
                'www': 'https://b2c2.com',
                'doc': 'https://docs.b2c2.net',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'api': {
                'private': {
                    'get': [
                        'account_info',
                        'balance',
                        'currency',
                        'funding_rates',
                        'instruments',
                        'ledger',
                        'order',
                        'order/{order_id_or_client_order_id}',
                        'trade',
                        'trade/{trade_id}',
                        'withdrawal',
                        'withdrawal/{withdrawal_id}',
                    ],
                    'post': [
                        'request_for_quote/',
                        'order/',
                        'withdrawal/',
                    ],
                    'delete': [
                        'order/{order_id_or_client_order_id}',
                        'withdrawal/{withdrawal_id}',
                    ],
                },
            },
            'httpExceptions': {
                '400': BadRequest, // Bad Request –- Incorrect parameters.
                '401': AuthenticationError, // Unauthorized – Wrong Token.
                '404': ExchangeNotAvailable, // Not Found – The specified endpoint could not be found.
                '405': ExchangeNotAvailable, // Method Not Allowed – You tried to access an endpoint with an invalid method.
                '406': BadRequest, // Not Acceptable – Incorrect request format.
                '429': RateLimitExceeded, // Too Many Requests – Rate limited, pause requests.
                '500': ExchangeError, // Internal Server Error – We had a problem with our server. Try again later.
                '503': OnMaintenance, // Service unavailable
            },
            'exceptions': {
                'exact': {
                    '1000': ExchangeError, // Generic –- Unknown error.
                    '1001': InvalidOrder, // Instrument not allowed – Instrument does not exist or you are not authorized to trade it.
                    '1002': PermissionDenied, // The RFQ does not belong to you.
                    '1003': InvalidOrder, // Different instrument – You tried to post a trade with a different instrument than the related RFQ.
                    '1004': InvalidOrder, // Different side – You tried to post a trade with a different side than the related RFQ.
                    '1005': InvalidOrder, // Different price – You tried to post a trade with a different price than the related RFQ.
                    '1006': InvalidOrder, // Different quantity – You tried to post a trade with a different quantity than the related RFQ.
                    '1007': InvalidOrder, // Quote is not valid – Quote may have expired.
                    '1009': InvalidOrder, // Price not valid – The price is not valid anymore. This error can occur during big market moves.
                    '1010': InvalidOrder, // Quantity too big – Max quantity per trade reached.
                    '1011': InsufficientFunds, // Not enough balance – Not enough balance.
                    '1012': InsufficientFunds, // Max risk exposure reached – Please see our FAQ for more information about the risk exposure.
                    '1013': InsufficientFunds, // Max credit exposure reached – Please see our FAQ for more information about the credit exposure.
                    '1014': InvalidAddress, // No BTC address associated – You don’t have a BTC address associated to your account.
                    '1015': InvalidOrder, // Too many decimals – We only allow four decimals in quantities.
                    '1016': OnMaintenance, // Trading is disabled – May occur after a maintenance or under exceptional circumstances.
                    '1017': BadRequest, // Illegal parameter – Wrong type or parameter.
                    '1018': OnMaintenance, // Settlement is disabled at the moment.
                    '1019': InvalidOrder, // Quantity is too small.
                    '1020': InvalidOrder, // The field valid_until is malformed.
                    '1021': OrderNotFound, // Your Order has expired.
                    '1022': BadSymbol, // Currency not allowed.
                    '1023': NotSupported, // We only support “FOK” order_type at the moment.
                    '1100': ExchangeError, // Other error.
                    '1101': BadRequest, // Field required – Field required.
                    '1102': BadRequest, // Pagination offset too big – Narrow down the data space using parameters such as ‘created*gte’, ‘created*lt’, ‘since’.
                    '1200': OnMaintenance, // API Maintenance
                },
            },
            'options': {
                'fetchMyTrades': {
                    'sort': 'timestamp,asc',
                },
                'fetchOpenOrders': {
                    'sort': 'createdAt,asc',
                },
                'fetchClosedOrders': {
                    'sort': 'createdAt,asc',
                },
                'defaultSort': 'timestamp,asc',
                'defaultSortOrders': 'createdAt,asc',
            },
            'currencies': { 'ADA': { 'info': { 'long_only': false, 'minimum_trade_size': '1.0', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Cardano', 'ada_max_qty_per_trade': 4000000 }, 'id': 'ADA', 'code': 'ADA', 'name': 'Cardano', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 1, 'max': 4000000 }}}, 'AUD': { 'info': { 'long_only': false, 'minimum_trade_size': '0.01', 'stable_coin': false, 'currency_type': 'fiat', 'is_crypto': false, 'readable_name': 'Australian Dollar', 'aud_max_qty_per_trade': 750000 }, 'id': 'AUD', 'code': 'AUD', 'name': 'Australian Dollar', 'type': 'fiat', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.01, 'max': 750000 }}}, 'BCH': { 'info': { 'long_only': false, 'minimum_trade_size': '0.01', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Bitcoin cash', 'bch_max_qty_per_trade': 500 }, 'id': 'BCH', 'code': 'BCH', 'name': 'Bitcoin cash', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.01, 'max': 500 }}}, 'BNB': { 'info': { 'long_only': false, 'minimum_trade_size': '0.01', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Binance Coin', 'bnb_max_qty_per_trade': 1700 }, 'id': 'BNB', 'code': 'BNB', 'name': 'Binance Coin', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.01, 'max': 1700 }}}, 'BTC': { 'info': { 'long_only': false, 'minimum_trade_size': '0.0005', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Bitcoin', 'btc_max_qty_per_trade': 100 }, 'id': 'BTC', 'code': 'BTC', 'name': 'Bitcoin', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.0005, 'max': 100 }}}, 'CAD': { 'info': { 'long_only': false, 'minimum_trade_size': '0.01', 'stable_coin': false, 'currency_type': 'fiat', 'is_crypto': false, 'readable_name': 'Canadian Dollar', 'cad_max_qty_per_trade': 750000 }, 'id': 'CAD', 'code': 'CAD', 'name': 'Canadian Dollar', 'type': 'fiat', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.01, 'max': 750000 }}}, 'CHF': { 'info': { 'long_only': false, 'minimum_trade_size': '0.01', 'stable_coin': false, 'currency_type': 'fiat', 'is_crypto': false, 'readable_name': 'Swiss Franc', 'chf_max_qty_per_trade': 550000 }, 'id': 'CHF', 'code': 'CHF', 'name': 'Swiss Franc', 'type': 'fiat', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.01, 'max': 550000 }}}, 'CNH': { 'info': { 'long_only': false, 'minimum_trade_size': '1.0', 'stable_coin': false, 'currency_type': 'fiat', 'is_crypto': false, 'readable_name': 'Offshore Renminbi', 'cnh_max_qty_per_trade': 600000 }, 'id': 'CNH', 'code': 'CNH', 'name': 'Offshore Renminbi', 'type': 'fiat', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 1, 'max': 600000 }}}, 'DOG': { 'info': { 'long_only': false, 'minimum_trade_size': '1.0', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Dogecoin', 'dog_max_qty_per_trade': 1800000 }, 'id': 'DOG', 'code': 'DOG', 'name': 'Dogecoin', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 1, 'max': 1800000 }}}, 'DOT': { 'info': { 'long_only': false, 'minimum_trade_size': '0.5', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Polkadot', 'dot_max_qty_per_trade': 100000 }, 'id': 'DOT', 'code': 'DOT', 'name': 'Polkadot', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.5, 'max': 100000 }}}, 'EOS': { 'info': { 'long_only': false, 'minimum_trade_size': '1.0', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'EOS', 'eos_max_qty_per_trade': 20000 }, 'id': 'EOS', 'code': 'EOS', 'name': 'EOS', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 1, 'max': 20000 }}}, 'ETH': { 'info': { 'long_only': false, 'minimum_trade_size': '0.005', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Ether', 'eth_max_qty_per_trade': 1000 }, 'id': 'ETH', 'code': 'ETH', 'name': 'Ether', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.005, 'max': 1000 }}}, 'EUR': { 'info': { 'long_only': false, 'minimum_trade_size': '0.01', 'stable_coin': false, 'currency_type': 'fiat', 'is_crypto': false, 'readable_name': 'Euro', 'eur_max_qty_per_trade': 500000 }, 'id': 'EUR', 'code': 'EUR', 'name': 'Euro', 'type': 'fiat', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.01, 'max': 500000 }}}, 'GBP': { 'info': { 'long_only': false, 'minimum_trade_size': '0.01', 'stable_coin': false, 'currency_type': 'fiat', 'is_crypto': false, 'readable_name': 'Great British Pound', 'gbp_max_qty_per_trade': 450000 }, 'id': 'GBP', 'code': 'GBP', 'name': 'Great British Pound', 'type': 'fiat', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.01, 'max': 450000 }}}, 'JPY': { 'info': { 'long_only': false, 'minimum_trade_size': '0.01', 'stable_coin': false, 'currency_type': 'fiat', 'is_crypto': false, 'readable_name': 'Japanese Yen', 'jpy_max_qty_per_trade': 65000000 }, 'id': 'JPY', 'code': 'JPY', 'name': 'Japanese Yen', 'type': 'fiat', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.01, 'max': 65000000 }}}, 'LNK': { 'info': { 'long_only': false, 'minimum_trade_size': '0.1', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Chainlink', 'lnk_max_qty_per_trade': 60000 }, 'id': 'LNK', 'code': 'LNK', 'name': 'Chainlink', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.1, 'max': 60000 }}}, 'LTC': { 'info': { 'long_only': false, 'minimum_trade_size': '0.1', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Litecoin', 'ltc_max_qty_per_trade': 4000 }, 'id': 'LTC', 'code': 'LTC', 'name': 'Litecoin', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.1, 'max': 4000 }}}, 'MXN': { 'info': { 'long_only': false, 'minimum_trade_size': '1.0', 'stable_coin': false, 'currency_type': 'fiat', 'is_crypto': false, 'readable_name': '', 'mxn_max_qty_per_trade': 12300000 }, 'id': 'MXN', 'code': 'MXN', 'name': '', 'type': 'fiat', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 1, 'max': 12300000 }}}, 'NZD': { 'info': { 'long_only': false, 'minimum_trade_size': '0.01', 'stable_coin': false, 'currency_type': 'fiat', 'is_crypto': false, 'readable_name': '' }, 'id': 'NZD', 'code': 'NZD', 'name': '', 'type': 'fiat', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.01 }}}, 'SGD': { 'info': { 'long_only': false, 'minimum_trade_size': '0.01', 'stable_coin': false, 'currency_type': 'fiat', 'is_crypto': false, 'readable_name': 'Singapore Dollar', 'sgd_max_qty_per_trade': 800000 }, 'id': 'SGD', 'code': 'SGD', 'name': 'Singapore Dollar', 'type': 'fiat', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.01, 'max': 800000 }}}, 'UNI': { 'info': { 'long_only': false, 'minimum_trade_size': '0.1', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Uniswap', 'uni_max_qty_per_trade': 25000 }, 'id': 'UNI', 'code': 'UNI', 'name': 'Uniswap', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.1, 'max': 25000 }}}, 'USC': { 'info': { 'long_only': false, 'minimum_trade_size': '0.01', 'stable_coin': true, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'USD Coin', 'usc_max_qty_per_trade': 600000 }, 'id': 'USC', 'code': 'USC', 'name': 'USD Coin', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.01, 'max': 600000 }}}, 'USD': { 'info': { 'long_only': false, 'minimum_trade_size': '0.01', 'stable_coin': false, 'currency_type': 'fiat', 'is_crypto': false, 'readable_name': 'US Dollar', 'usd_max_qty_per_trade': 600000 }, 'id': 'USD', 'code': 'USD', 'name': 'US Dollar', 'type': 'fiat', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.01, 'max': 600000 }}}, 'UST': { 'info': { 'long_only': false, 'minimum_trade_size': '0.01', 'stable_coin': true, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Tether', 'ust_max_qty_per_trade': 600000 }, 'id': 'UST', 'code': 'UST', 'name': 'Tether', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.01, 'max': 600000 }}}, 'XAU': { 'info': { 'long_only': false, 'minimum_trade_size': '1.0', 'stable_coin': false, 'currency_type': 'synthetic', 'is_crypto': false, 'readable_name': 'XAU', 'xau_max_qty_per_trade': 1000 }, 'id': 'XAU', 'code': 'XAU', 'name': 'XAU', 'type': 'synthetic', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 1, 'max': 1000 }}}, 'XLM': { 'info': { 'long_only': false, 'minimum_trade_size': '100.0', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Stellar', 'xlm_max_qty_per_trade': 4000000 }, 'id': 'XLM', 'code': 'XLM', 'name': 'Stellar', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 100, 'max': 4000000 }}}, 'XMR': { 'info': { 'long_only': false, 'minimum_trade_size': '0.01', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Monero' }, 'id': 'XMR', 'code': 'XMR', 'name': 'Monero', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 0.01 }}}, 'XRP': { 'info': { 'long_only': false, 'minimum_trade_size': '20.0', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Ripple', 'xrp_max_qty_per_trade': 200000 }, 'id': 'XRP', 'code': 'XRP', 'name': 'Ripple', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 20, 'max': 200000 }}}, 'XTZ': { 'info': { 'long_only': false, 'minimum_trade_size': '1.0', 'stable_coin': false, 'currency_type': 'crypto', 'is_crypto': true, 'readable_name': 'Tezos', 'xtz_max_qty_per_trade': 170000 }, 'id': 'XTZ', 'code': 'XTZ', 'name': 'Tezos', 'type': 'crypto', 'active': true, 'precision': 4, 'limits': { 'withdraw': {}, 'amount': { 'min': 1, 'max': 170000 }}}},
            'markets': { 'LTC/USD': { 'limits': { 'amount': { 'min': 0.1, 'max': 4000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 600000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'LTCUSD.SPOT', 'underlier': 'LTCUSD', 'type': 'SPOT' }, 'id': 'LTCUSD.SPOT', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD', 'baseId': 'LTC', 'quoteId': 'USD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'BCH/USD': { 'limits': { 'amount': { 'min': 0.01, 'max': 500 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 600000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'BCHUSD.SPOT', 'underlier': 'BCHUSD', 'type': 'SPOT' }, 'id': 'BCHUSD.SPOT', 'symbol': 'BCH/USD', 'base': 'BCH', 'quote': 'USD', 'baseId': 'BCH', 'quoteId': 'USD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'EOS/AUD': { 'limits': { 'amount': { 'min': 1, 'max': 20000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'EOSAUD.SPOT', 'underlier': 'EOSAUD', 'type': 'SPOT' }, 'id': 'EOSAUD.SPOT', 'symbol': 'EOS/AUD', 'base': 'EOS', 'quote': 'AUD', 'baseId': 'EOS', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'UST/AUD': { 'limits': { 'amount': { 'min': 0.01, 'max': 600000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'USTAUD.SPOT', 'underlier': 'USTAUD', 'type': 'SPOT' }, 'id': 'USTAUD.SPOT', 'symbol': 'UST/AUD', 'base': 'UST', 'quote': 'AUD', 'baseId': 'UST', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'LNK/ETH': { 'limits': { 'amount': { 'min': 0.1, 'max': 60000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.005, 'max': 1000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'LNKETH.SPOT', 'underlier': 'LNKETH', 'type': 'SPOT' }, 'id': 'LNKETH.SPOT', 'symbol': 'LNK/ETH', 'base': 'LNK', 'quote': 'ETH', 'baseId': 'LNK', 'quoteId': 'ETH', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'BTC/USD': { 'limits': { 'amount': { 'min': 0.0005, 'max': 100 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 600000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'BTCUSD.SPOT', 'underlier': 'BTCUSD', 'type': 'SPOT' }, 'id': 'BTCUSD.SPOT', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'BTC', 'quoteId': 'USD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'ETH/BTC': { 'limits': { 'amount': { 'min': 0.005, 'max': 1000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.0005, 'max': 100 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'ETHBTC.SPOT', 'underlier': 'ETHBTC', 'type': 'SPOT' }, 'id': 'ETHBTC.SPOT', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'ETH', 'quoteId': 'BTC', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'ETH/USD': { 'limits': { 'amount': { 'min': 0.005, 'max': 1000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 600000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'ETHUSD.SPOT', 'underlier': 'ETHUSD', 'type': 'SPOT' }, 'id': 'ETHUSD.SPOT', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD', 'baseId': 'ETH', 'quoteId': 'USD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'BCH/AUD': { 'limits': { 'amount': { 'min': 0.01, 'max': 500 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'BCHAUD.SPOT', 'underlier': 'BCHAUD', 'type': 'SPOT' }, 'id': 'BCHAUD.SPOT', 'symbol': 'BCH/AUD', 'base': 'BCH', 'quote': 'AUD', 'baseId': 'BCH', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'LTC/AUD': { 'limits': { 'amount': { 'min': 0.1, 'max': 4000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'LTCAUD.SPOT', 'underlier': 'LTCAUD', 'type': 'SPOT' }, 'id': 'LTCAUD.SPOT', 'symbol': 'LTC/AUD', 'base': 'LTC', 'quote': 'AUD', 'baseId': 'LTC', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'DOT/BTC': { 'limits': { 'amount': { 'min': 0.5, 'max': 100000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.0005, 'max': 100 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'DOTBTC.SPOT', 'underlier': 'DOTBTC', 'type': 'SPOT' }, 'id': 'DOTBTC.SPOT', 'symbol': 'DOT/BTC', 'base': 'DOT', 'quote': 'BTC', 'baseId': 'DOT', 'quoteId': 'BTC', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'DOT/USD': { 'limits': { 'amount': { 'min': 0.5, 'max': 100000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 600000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'DOTUSD.SPOT', 'underlier': 'DOTUSD', 'type': 'SPOT' }, 'id': 'DOTUSD.SPOT', 'symbol': 'DOT/USD', 'base': 'DOT', 'quote': 'USD', 'baseId': 'DOT', 'quoteId': 'USD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'DOT/ETH': { 'limits': { 'amount': { 'min': 0.5, 'max': 100000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.005, 'max': 1000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'DOTETH.SPOT', 'underlier': 'DOTETH', 'type': 'SPOT' }, 'id': 'DOTETH.SPOT', 'symbol': 'DOT/ETH', 'base': 'DOT', 'quote': 'ETH', 'baseId': 'DOT', 'quoteId': 'ETH', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'DOT/AUD': { 'limits': { 'amount': { 'min': 0.5, 'max': 100000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'DOTAUD.SPOT', 'underlier': 'DOTAUD', 'type': 'SPOT' }, 'id': 'DOTAUD.SPOT', 'symbol': 'DOT/AUD', 'base': 'DOT', 'quote': 'AUD', 'baseId': 'DOT', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'XTZ/AUD': { 'limits': { 'amount': { 'min': 1, 'max': 170000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'XTZAUD.SPOT', 'underlier': 'XTZAUD', 'type': 'SPOT' }, 'id': 'XTZAUD.SPOT', 'symbol': 'XTZ/AUD', 'base': 'XTZ', 'quote': 'AUD', 'baseId': 'XTZ', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'DOG/AUD': { 'limits': { 'amount': { 'min': 1, 'max': 1800000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'DOGAUD.SPOT', 'underlier': 'DOGAUD', 'type': 'SPOT' }, 'id': 'DOGAUD.SPOT', 'symbol': 'DOG/AUD', 'base': 'DOG', 'quote': 'AUD', 'baseId': 'DOG', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'BCH/BTC': { 'limits': { 'amount': { 'min': 0.01, 'max': 500 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.0005, 'max': 100 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'BCHBTC.SPOT', 'underlier': 'BCHBTC', 'type': 'SPOT' }, 'id': 'BCHBTC.SPOT', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'baseId': 'BCH', 'quoteId': 'BTC', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'XRP/BTC': { 'limits': { 'amount': { 'min': 20, 'max': 200000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.0005, 'max': 100 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'XRPBTC.SPOT', 'underlier': 'XRPBTC', 'type': 'SPOT' }, 'id': 'XRPBTC.SPOT', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'baseId': 'XRP', 'quoteId': 'BTC', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'XRP/ETH': { 'limits': { 'amount': { 'min': 20, 'max': 200000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.005, 'max': 1000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'XRPETH.SPOT', 'underlier': 'XRPETH', 'type': 'SPOT' }, 'id': 'XRPETH.SPOT', 'symbol': 'XRP/ETH', 'base': 'XRP', 'quote': 'ETH', 'baseId': 'XRP', 'quoteId': 'ETH', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'LNK/AUD': { 'limits': { 'amount': { 'min': 0.1, 'max': 60000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'LNKAUD.SPOT', 'underlier': 'LNKAUD', 'type': 'SPOT' }, 'id': 'LNKAUD.SPOT', 'symbol': 'LNK/AUD', 'base': 'LNK', 'quote': 'AUD', 'baseId': 'LNK', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'USC/AUD': { 'limits': { 'amount': { 'min': 0.01, 'max': 600000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'USCAUD.SPOT', 'underlier': 'USCAUD', 'type': 'SPOT' }, 'id': 'USCAUD.SPOT', 'symbol': 'USC/AUD', 'base': 'USC', 'quote': 'AUD', 'baseId': 'USC', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'XLM/BTC': { 'limits': { 'amount': { 'min': 100, 'max': 4000000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.0005, 'max': 100 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'XLMBTC.SPOT', 'underlier': 'XLMBTC', 'type': 'SPOT' }, 'id': 'XLMBTC.SPOT', 'symbol': 'XLM/BTC', 'base': 'XLM', 'quote': 'BTC', 'baseId': 'XLM', 'quoteId': 'BTC', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'XLM/ETH': { 'limits': { 'amount': { 'min': 100, 'max': 4000000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.005, 'max': 1000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'XLMETH.SPOT', 'underlier': 'XLMETH', 'type': 'SPOT' }, 'id': 'XLMETH.SPOT', 'symbol': 'XLM/ETH', 'base': 'XLM', 'quote': 'ETH', 'baseId': 'XLM', 'quoteId': 'ETH', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'BTC/AUD': { 'limits': { 'amount': { 'min': 0.0005, 'max': 100 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'BTCAUD.SPOT', 'underlier': 'BTCAUD', 'type': 'SPOT' }, 'id': 'BTCAUD.SPOT', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD', 'baseId': 'BTC', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'ETH/AUD': { 'limits': { 'amount': { 'min': 0.005, 'max': 1000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'ETHAUD.SPOT', 'underlier': 'ETHAUD', 'type': 'SPOT' }, 'id': 'ETHAUD.SPOT', 'symbol': 'ETH/AUD', 'base': 'ETH', 'quote': 'AUD', 'baseId': 'ETH', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'LTC/BTC': { 'limits': { 'amount': { 'min': 0.1, 'max': 4000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.0005, 'max': 100 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'LTCBTC.SPOT', 'underlier': 'LTCBTC', 'type': 'SPOT' }, 'id': 'LTCBTC.SPOT', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'LTC', 'quoteId': 'BTC', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'XRP/USD': { 'limits': { 'amount': { 'min': 20, 'max': 200000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 600000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'XRPUSD.SPOT', 'underlier': 'XRPUSD', 'type': 'SPOT' }, 'id': 'XRPUSD.SPOT', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD', 'baseId': 'XRP', 'quoteId': 'USD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'XRP/AUD': { 'limits': { 'amount': { 'min': 20, 'max': 200000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'XRPAUD.SPOT', 'underlier': 'XRPAUD', 'type': 'SPOT' }, 'id': 'XRPAUD.SPOT', 'symbol': 'XRP/AUD', 'base': 'XRP', 'quote': 'AUD', 'baseId': 'XRP', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'EOS/USD': { 'limits': { 'amount': { 'min': 1, 'max': 20000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 600000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'EOSUSD.SPOT', 'underlier': 'EOSUSD', 'type': 'SPOT' }, 'id': 'EOSUSD.SPOT', 'symbol': 'EOS/USD', 'base': 'EOS', 'quote': 'USD', 'baseId': 'EOS', 'quoteId': 'USD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'UST/USD': { 'limits': { 'amount': { 'min': 0.01, 'max': 600000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 600000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'USTUSD.SPOT', 'underlier': 'USTUSD', 'type': 'SPOT' }, 'id': 'USTUSD.SPOT', 'symbol': 'UST/USD', 'base': 'UST', 'quote': 'USD', 'baseId': 'UST', 'quoteId': 'USD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'LTC/ETH': { 'limits': { 'amount': { 'min': 0.1, 'max': 4000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.005, 'max': 1000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'LTCETH.SPOT', 'underlier': 'LTCETH', 'type': 'SPOT' }, 'id': 'LTCETH.SPOT', 'symbol': 'LTC/ETH', 'base': 'LTC', 'quote': 'ETH', 'baseId': 'LTC', 'quoteId': 'ETH', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'LNK/USD': { 'limits': { 'amount': { 'min': 0.1, 'max': 60000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 600000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'LNKUSD.SPOT', 'underlier': 'LNKUSD', 'type': 'SPOT' }, 'id': 'LNKUSD.SPOT', 'symbol': 'LNK/USD', 'base': 'LNK', 'quote': 'USD', 'baseId': 'LNK', 'quoteId': 'USD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'UNI/AUD': { 'limits': { 'amount': { 'min': 0.1, 'max': 25000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'UNIAUD.SPOT', 'underlier': 'UNIAUD', 'type': 'SPOT' }, 'id': 'UNIAUD.SPOT', 'symbol': 'UNI/AUD', 'base': 'UNI', 'quote': 'AUD', 'baseId': 'UNI', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'BNB/AUD': { 'limits': { 'amount': { 'min': 0.01, 'max': 1700 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'BNBAUD.SPOT', 'underlier': 'BNBAUD', 'type': 'SPOT' }, 'id': 'BNBAUD.SPOT', 'symbol': 'BNB/AUD', 'base': 'BNB', 'quote': 'AUD', 'baseId': 'BNB', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'ADA/AUD': { 'limits': { 'amount': { 'min': 1, 'max': 4000000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'ADAAUD.SPOT', 'underlier': 'ADAAUD', 'type': 'SPOT' }, 'id': 'ADAAUD.SPOT', 'symbol': 'ADA/AUD', 'base': 'ADA', 'quote': 'AUD', 'baseId': 'ADA', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'EOS/BTC': { 'limits': { 'amount': { 'min': 1, 'max': 20000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.0005, 'max': 100 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'EOSBTC.SPOT', 'underlier': 'EOSBTC', 'type': 'SPOT' }, 'id': 'EOSBTC.SPOT', 'symbol': 'EOS/BTC', 'base': 'EOS', 'quote': 'BTC', 'baseId': 'EOS', 'quoteId': 'BTC', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'XLM/USD': { 'limits': { 'amount': { 'min': 100, 'max': 4000000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 600000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'XLMUSD.SPOT', 'underlier': 'XLMUSD', 'type': 'SPOT' }, 'id': 'XLMUSD.SPOT', 'symbol': 'XLM/USD', 'base': 'XLM', 'quote': 'USD', 'baseId': 'XLM', 'quoteId': 'USD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'USC/USD': { 'limits': { 'amount': { 'min': 0.01, 'max': 600000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 600000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'USCUSD.SPOT', 'underlier': 'USCUSD', 'type': 'SPOT' }, 'id': 'USCUSD.SPOT', 'symbol': 'USC/USD', 'base': 'USC', 'quote': 'USD', 'baseId': 'USC', 'quoteId': 'USD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'XLM/AUD': { 'limits': { 'amount': { 'min': 100, 'max': 4000000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.01, 'max': 750000 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'XLMAUD.SPOT', 'underlier': 'XLMAUD', 'type': 'SPOT' }, 'id': 'XLMAUD.SPOT', 'symbol': 'XLM/AUD', 'base': 'XLM', 'quote': 'AUD', 'baseId': 'XLM', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }, 'LNK/BTC': { 'limits': { 'amount': { 'min': 0.1, 'max': 60000 }, 'price': { 'min': 0.0001 }, 'cost': { 'min': 0.0005, 'max': 100 }}, 'precision': { 'base': 4, 'quote': 4, 'price': 4, 'amount': 4 }, 'tierBased': false, 'percentage': true, 'info': { 'name': 'LNKBTC.SPOT', 'underlier': 'LNKBTC', 'type': 'SPOT' }, 'id': 'LNKBTC.SPOT', 'symbol': 'LNK/BTC', 'base': 'LNK', 'quote': 'BTC', 'baseId': 'LNK', 'quoteId': 'BTC', 'type': 'SPOT', 'spot': true, 'margin': false, 'active': true }},
        });
    }

    async fetchCurrencies (params = {}) {
        const ccys = await this.privateGetCurrency (params);
        const account_info = await this.privateGetAccountInfo (params);
        //
        // currencies endpoint
        // {
        //     "AUD": {
        //       "long_only": false,
        //       "minimum_trade_size": 0.01,
        //       "stable_coin": false,
        //       "currency_type": "fiat",
        //       "is_crypto": false,
        //       "readable_name": ""
        //     },
        //     "BCH": {
        //       "long_only": false,
        //       "minimum_trade_size": 0.01,
        //       "stable_coin": false,
        //       "currency_type": "crypto",
        //       "is_crypto": true,
        //       "readable_name": "Bitcoin cash"
        //     },
        // ...
        // Account info endpoint
        // {
        //     "max_risk_exposure": "500000",
        //     "risk_exposure": "74054.96",
        //     "currency": "USD",
        //     "btc_max_qty_per_trade": "100",
        //     "ust_max_qty_per_trade": "600000",
        //     "eth_max_qty_per_trade": "1000",
        //     "ltc_max_qty_per_trade": "4000",
        //     "bch_max_qty_per_trade": "500",
        //     "xrp_max_qty_per_trade": "200000",
        //     ...
        //   }
        const result = {};
        const keys = Object.keys (ccys);
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const code = this.safeCurrencyCode (id);
            const ccy = ccys[keys[i]];
            const name = this.safeString (ccy, 'readable_name');
            const currency_type = this.safeString (ccy, 'currency_type');
            const minTradeSize = this.safeNumber (ccy, 'minimum_trade_size');
            const maxTradeSizeKey = id.toLowerCase () + '_max_qty_per_trade';
            const maxTradeSize = this.safeNumber (account_info, maxTradeSizeKey);
            ccy[maxTradeSizeKey] = maxTradeSize; // update back into the raw info for debugging
            result[code] = {
                'info': ccy,
                'id': id,
                'code': code,
                'name': name,
                'type': currency_type,
                'active': true,
                'fee': undefined,
                'precision': 4,
                'limits': {
                    'withdraw': { 'min': undefined, 'max': undefined },
                    'amount': { 'min': minTradeSize, 'max': maxTradeSize },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        // FIXME hack to force reload currencies
        const currencies = await this.fetchCurrencies ();
        this.currencies = this.deepExtend (currencies, this.currencies);
        const response = await this.privateGetInstruments (params);
        //
        // [
        //     {
        //       "name": "LTCUSD.SPOT",
        //       "underlier": "LTCUSD",
        //       "type": "SPOT"
        //     },
        //     {
        //       "name": "BCHUSD.SPOT",
        //       "underlier": "BCHUSD",
        //       "type": "SPOT"
        //     },
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            result.push (this.parseMarket (response[i]));
        }
        return result;
    }

    parseMarket (market) {
        // instruments endpoint
        // [
        //     {
        //       "name": "LTCUSD.SPOT",
        //       "underlier": "LTCUSD",
        //       "type": "SPOT"
        //     },
        //     {
        //       "name": "BCHUSD.SPOT",
        //       "underlier": "BCHUSD",
        //       "type": "SPOT"
        //     },
        // ...
        //
        //
        // currency object
        //
        //     result[code] = {
        //         'info': ccy,
        //         'id': id,
        //         'code': code,
        //         'name': name,
        //         'type': currency_type,
        //         'active': true,
        //         'fee': undefined,
        //         'precision': 4,
        //         'limits': {
        //             'withdraw': { 'min': undefined, 'max': undefined },
        //             'amount': { 'min': minTradeSize, 'max': maxTradeSize },
        //         },
        //     };
        // }
        const id = this.safeString (market, 'name');
        let underlier = this.safeString (market, 'underlier');
        underlier = underlier.toUpperCase ();
        const baseId = underlier.slice (0, 3); // left in underlier
        const quoteId = underlier.slice (3, 6); // right in underlier
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const type = this.safeString (market, 'type');
        let spot = false;
        let margin = false;
        if (type === 'SPOT') {
            spot = true;
        } else if (type === 'CFD') {
            margin = true;
        }
        const active = true;
        const ccyBase = this.currencies[base];
        const ccyQuote = this.currencies[quote];
        // const pricePrecision = ccyQuote['limits']['amount']['min'];
        // const amountPrecision = ccyBase['limits']['amount']['min'];
        // const precision = {
        //     'price': pricePrecision,
        //     'amount': amountPrecision,
        // };
        // FIXME - hard coded precisions
        const precision = {
            'base': 4,
            'quote': 4,
            'price': 4,
            'amount': 4,
        };
        const amountMin = ccyBase['limits']['amount']['min'];
        const amountMax = ccyBase['limits']['amount']['max'];
        const costMin = ccyQuote['limits']['amount']['min'];
        const costMax = ccyQuote['limits']['amount']['max'];
        const limits = {
            'amount': { 'min': amountMin, 'max': amountMax },
            'price': { 'min': 0.0001, 'max': undefined },
            'cost': { 'min': costMin, 'max': costMax },
        };
        // const taker = undefined; // no maker or taker fees for b2c2
        // const maker = undefined; // no maker or taker fees for b2c2
        return {
            'info': market,
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'type': type,
            'spot': spot,
            'margin': margin,
            'active': active,
            'precision': precision,
            'limits': limits,
            'tierBased': false,
            'percentage': true,
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        // {
        //     "USD": "0",
        //     "BTC": "0",
        //     "JPY": "0",
        //     "GBP": "0",
        //     "ETH": "0",
        //     "EUR": "0",
        //     "CAD": "0",
        //     "LTC": "0",
        //     "XRP": "0",
        //     "BCH": "0"
        // }
        const now = this.milliseconds ();
        const result = {
            'info': response,
            'timestamp': now,
            'datetime': this.iso8601 (now),
        };
        const assets = response;
        const keys = Object.keys (assets);
        for (let i = 0; i < keys.length; i++) {
            const balance = assets[keys[i]];
            const code = keys[i];
            const account = this.account ();
            account['free'] = balance;
            account['used'] = 0;
            account['total'] = balance;
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createQuote (symbol, side, amount, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const lowercaseSide = side.toLowerCase ();
        const request = {
            'quantity': this.amountToPrecision (symbol, amount),
            'side': lowercaseSide,
            'instrument': market['id'],
        };
        const response = await this.privatePostRequestForQuote (this.extend (request, params));
        return this.parseQuote (response, market);
    }

    parseQuote (quote, market = undefined) {
        // {
        //     "created": "2021-08-23T07:20:39.670767Z",
        //     "valid_until": "2021-08-23T07:21:00.670772Z",
        //     "rfq_id": "75fdad8c-69a3-45c2-b6a8-dba3f701c759",
        //     "client_rfq_id": "43fa40fb-bfdd-4e1d-8978-d84ab103ab1f",
        //     "quantity": "1.0000000000",
        //     "side": "sell",
        //     "instrument": "BTCUSD.SPOT",
        //     "price": "50113.00000000"
        //   }
        const timestamp = this.parse8601 (this.safeString (quote, 'created'));
        const validUntilTimestamp = this.parse8601 (this.safeString (quote, 'valid_until'));
        const id = this.safeString (quote, 'rfq_id');
        const clQuoteId = this.safeString (quote, 'client_rfq_id');
        const amount = this.safeNumber (quote, 'quantity');
        const amountString = this.safeString (quote, 'quantity');
        const type = 'quote';
        const side = this.safeStringLower (quote, 'side');
        const marketId = this.safeString (quote, 'instrument');
        const symbol = this.safeSymbol (marketId, market);
        const price = this.safeNumber (quote, 'price');
        const priceString = this.safeString (quote, 'price');
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        let status = undefined;
        if (validUntilTimestamp > this.milliseconds ()) {
            status = 'open';
        } else {
            status = 'closed';
        }
        const fee = undefined;
        // this.calculateFee (symbol, type, side, amount, price, takerOrMaker); // no fees for B2C2
        if (fee !== undefined) {
            fee.cost = this.feeToPrecision (symbol, fee.cost);
        }
        return this.safeOrder ({
            'info': quote,
            'id': id,
            'clQuoteId': clQuoteId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'validUntilTimestamp': validUntilTimestamp,
            'validUntilDatetime': this.iso8601 (validUntilTimestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'status': status,
            'fee': fee,
        });
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // side: 'buy' | 'sell';
        // type: 'market' | 'limit';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const lowercaseSide = side.toLowerCase ();
        const lowercaseType = type.toLowerCase ();
        const request = {
            'quantity': this.amountToPrecision (symbol, amount),
            'side': lowercaseSide,
            'instrument': market['id'],
            'order_type': undefined,
        };
        if (lowercaseType === 'limit') {
            request['order_type'] = 'FOK';
            request['price'] = this.priceToPrecision (symbol, price);
        } else {
            request['order_type'] = 'MKT';
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        // [
        //     {
        //         order_id: 'dbeb3cc2-68a9-4364-9d80-91de5f1f2133',
        //         client_order_id: 'eba0fc09-0f51-4298-ab88-42c70eb2ba39',
        //         instrument: 'BTCUSD.SPOT',
        //         price: '40498.00000000',
        //         executed_price: '40477.00000000',
        //         quantity: '1.0000000000',
        //         side: 'buy',
        //         order_type: 'MKT',
        //         created: '2021-05-21T06:56:31.519896Z',
        //         trades: [
        //           {
        //             trade_id: '8862acae-834c-42da-986c-b4d1618dc016',
        //             rfq_id: null,
        //             cfd_contract: null,
        //             order: 'dbeb3cc2-68a9-4364-9d80-91de5f1f2133',
        //             quantity: '1.0000000000',
        //             side: 'buy',
        //             instrument: 'BTCUSD.SPOT',
        //             price: '40477.00000000',
        //             created: '2021-05-21T06:56:31.548302Z',
        //             origin: 'screen:mobile',
        //             executing_unit: ''
        //           }
        //         ],
        //         executing_unit: ''
        //       }
        // ]
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = { 'order_id_or_client_order_id': id };
        const response = await this.privateGetOrderOrderIdOrClientOrderId (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let marketId = undefined;
        if (symbol !== undefined) {
            marketId = this.market (symbol)['id'];
        }
        // 'created__lt': undefined,
        // 'client_order_id': undefined,
        // 'order_type': undefined,
        // 'executing_unit': undefined,
        const request = {
            // 'limit': limit,
        };
        if (marketId !== undefined) {
            request['instrument'] = marketId;
        }
        if (since !== undefined) {
            request['created__gte'] = this.iso8601 (since);
        }
        const response = await this.privateGetOrder (this.extend (request, params));
        const response_next = await this.fetchRecursively ();
        if (response_next !== undefined) {
            response.push (response_next);
        }
        return this.parseOrders (response, undefined, since, limit);
    }

    async fetchRecursively () {
        const links = this.safeString (this.last_response_headers, 'Link');
        console.log (links);
        let next = undefined;
        if (links.indexOf ('next') >= 0) {
            const start = links.indexOf ('//') + 2;
            const end = links.indexOf ('>');
            next = links.substring (start, end);
            const startsub = next.indexOf ('/') + 1;
            next = next.substring (startsub);
        }
        console.log (next);
        if (next !== undefined) {
            const response = await this.request (next, 'private', 'GET');
            const response_next = await this.fetchRecursively ();
            if (response_next !== undefined) {
                response.push (response_next);
            }
            return response;
        } else {
            return undefined;
        }
    }

    parseOrder (order, market = undefined) {
        // From fetchOrder(s)
        // [
        //     {
        //       "order_id": "373991c8-727d-4b55-94c2-eece7b81023c",
        //       "client_order_id": "fd76dbde-fdd5-40a9-9211-19eaa19653be",
        //       "instrument": "XRPUSD.SPOT",
        //       "price": "0.59525000",
        //       "executed_price": "0.59525000",
        //       "quantity": "1000.0000000000",
        //       "side": "buy",
        //       "order_type": "MKT",
        //       "created": "2021-07-23T13:36:24.885622Z",
        //       "executing_unit": ""
        //     },
        //
        // From a successful createOrder
        // {        order_id:   "e0bc5d5d-f285-42d3-aa85-6a1b76baf74c",
        // client_order_id:   "e21732d8-c62b-4922-841e-42c9e8ffdf40",
        //      instrument:   "ETHUSD.SPOT",
        //           price:    null,
        //  executed_price:   "3278.20000000",
        //        quantity:   "1.0000000000",
        //            side:   "buy",
        //      order_type:   "MKT",
        //         created:   "2021-09-13T04:55:38.095940Z",
        //  executing_unit:   "test1",
        //          trades: [ {       trade_id: "2ec7679f-8e52-4020-a1fd-44ad3b24c0b3",
        //                              rfq_id:  null,
        //                        cfd_contract:  null,
        //                               order: "e0bc5d5d-f285-42d3-aa85-6a1b76baf74c",
        //                            quantity: "1.0000000000",
        //                                side: "buy",
        //                          instrument: "ETHUSD.SPOT",
        //                               price: "3278.20000000",
        //                             created: "2021-09-13T04:55:38.101368Z",
        //                              origin: "rest",
        //                      executing_unit: "test1"                                 } ] }
        //
        const id = this.safeString (order, 'order_id');
        const clientOrderId = this.safeString (order, 'client_order_id');
        const customer_id = this.safeString (order, 'executing_unit');
        const marketId = this.safeString (order, 'instrument');
        const symbol = this.safeSymbol (marketId, market);
        const price = this.safeNumber (order, 'price');
        const averagepxString = this.safeString (order, 'executed_price');
        const averagepx = this.safeNumber (order, 'executed_price');
        const amountString = this.safeString (order, 'quantity');
        const amount = this.safeNumber (order, 'quantity');
        const side = this.safeStringLower (order, 'side');
        let type = this.safeStringUpper (order, 'order_type');
        if (type === 'FOK') {
            type = 'limit';
        } else {
            type = 'market';
        }
        const timestamp = this.parse8601 (this.safeString (order, 'created'));
        let filled = undefined;
        let status = undefined;
        let cost = undefined;
        let remaining = undefined;
        const takerOrMaker = 'taker';
        const fee = undefined;
        if (averagepx !== undefined) {
            status = 'closed';
            filled = amount;
            cost = this.parseNumber (Precise.stringMul (averagepxString, amountString));
            // fee = this.calculateFee (symbol, type, side, filled, averagepx, takerOrMaker); // no fees for B2C2
            if (fee !== undefined) {
                fee.cost = this.feeToPrecision (symbol, fee.cost);
            }
        } else {
            status = 'open';
            remaining = amount;
        }
        const rawTrades = this.safeValue (order, 'trades', []);
        let trades = undefined;
        const tradeParams = {
            'clientOrderId': clientOrderId,
            'type': type,
            'takerOrMaker': takerOrMaker,
        };
        if (rawTrades !== undefined) {
            trades = this.parseTrades (rawTrades, market, undefined, undefined, tradeParams);
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'customer_id': customer_id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': averagepx,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        });
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // 'created__gte': undefined,
        // 'created__lt': undefined,
        // 'since': undefined, // need to map to markets
        // 'ordering': undefined, // asc or desc, default desc
        // 'executing_unit': undefined,
        const request = {
            'limit': limit,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument'] = market['id'];
        }
        if (since !== undefined) {
            request['since'] = this.iso8601 (since);
        }
        const response = await this.privateGetTrade (this.extend (request, params));
        const response_next = await this.fetchRecursively ();
        if (response_next !== undefined) {
            response.push (response_next);
        }
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // When returned as part of the order object
        // {        order_id:   "e0bc5d5d-f285-42d3-aa85-6a1b76baf74c",
        // client_order_id:   "e21732d8-c62b-4922-841e-42c9e8ffdf40",
        //      instrument:   "ETHUSD.SPOT",
        //           price:    null,
        //  executed_price:   "3278.20000000",
        //        quantity:   "1.0000000000",
        //            side:   "buy",
        //      order_type:   "MKT",
        //         created:   "2021-09-13T04:55:38.095940Z",
        //  executing_unit:   "test1",
        //          trades: [ {       trade_id: "2ec7679f-8e52-4020-a1fd-44ad3b24c0b3",
        //                              rfq_id:  null,
        //                        cfd_contract:  null,
        //                               order: "e0bc5d5d-f285-42d3-aa85-6a1b76baf74c",
        //                            quantity: "1.0000000000",
        //                                side: "buy",
        //                          instrument: "ETHUSD.SPOT",
        //                               price: "3278.20000000",
        //                             created: "2021-09-13T04:55:38.101368Z",
        //                              origin: "rest",
        //                      executing_unit: "test1"                                 } ] }
        //
        // When returnes from fetchmytrades
        // {"trade_id":"2ec7679f-8e52-4020-a1fd-44ad3b24c0b3",
        // "rfq_id":null,
        // "order":"e0bc5d5d-f285-42d3-aa85-6a1b76baf74c",
        // "quantity":"1.0000000000",
        // "side":"buy",
        // "instrument":"ETHUSD.SPOT",
        // "price":"3278.20000000",
        // "created":"2021-09-13T04:55:38.101368Z",
        // "end_client_id":"",
        // "client_rfq_id":null,
        // "client_order_id":"e21732d8-c62b-4922-841e-42c9e8ffdf40",
        // "user":"Demo_Leonie",
        // "origin":"rest",
        // "executing_unit":"test1"},
        //
        const id = this.safeString (trade, 'trade_id');
        const amountString = this.safeString (trade, 'quantity');
        const amount = this.parseNumber (amountString);
        const side = this.safeStringLower (trade, 'side');
        const marketId = this.safeString (trade, 'instrument');
        const symbol = this.safeSymbol (marketId, market);
        const priceString = this.safeString (trade, 'price');
        const price = this.parseNumber (priceString);
        const timestamp = this.parse8601 (this.safeString (trade, 'created'));
        const orderId = this.safeString (trade, 'order');
        const clientOrderId = this.safeString (trade, 'client_order_id'); // parent order must provide in params override
        const customer_id = this.safeString (trade, 'executing_unit');
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const type = this.safeString (trade, 'type'); // parent order must provide in params override
        const takerOrMaker = this.safeString (trade, 'takerOrMaker'); // parent order must provide in params override
        const fee = undefined;
        // this.calculateFee (symbol, type, side, amount, price, takerOrMaker); // no fees for B2C2
        if (fee !== undefined) {
            fee.cost = this.feeToPrecision (symbol, fee.cost);
        }
        return {
            'info': trade,
            'id': id,
            'customer_id': customer_id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'clientOrderId': clientOrderId,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        };
    }

    parseLedgerEntryType (type) {
        // Currently four types of ledgers are possible:
        // trade (ledger resulting of a trade, there are two ledgers per trade)
        // transfer (either you sent funds to B2C2, or B2C2 sent you funds)
        // funding (funding rate charged for your open positions if you have some, CFD only)
        // realised_pnl (Realised P&L, CFD only)
        const types = {
            'transfer': 'transaction',
            'funding': 'funding',
            'realised_pnl': 'margin',
            'trade': 'trade',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        // [
        //     {
        //       "transaction_id": "3b8c41be-1bae-45aa-a6fb-86fce3ebef85",
        //       "created": "2021-07-23T13:36:24.889949Z",
        //       "reference": "57912eaf-02dc-461f-ad0d-8c636c01c997",
        //       "currency": "USD",
        //       "amount": "-595.2500000000000000",
        //       "type": "trade",
        //       "group": "trading"
        //     },
        //     {
        //       "transaction_id": "cd92a3d5-a782-4bb2-86b2-815d76667658",
        //       "created": "2021-07-23T13:36:24.889949Z",
        //       "reference": "57912eaf-02dc-461f-ad0d-8c636c01c997",
        //       "currency": "XRP",
        //       "amount": "1000.0000000000000000",
        //       "type": "trade",
        //       "group": "trading"
        //     },
        const id = this.safeString (item, 'transaction_id');
        const timestamp = this.parse8601 (this.safeString (item, 'created'));
        const referenceId = this.safeString (item, 'reference');
        const currencyId = this.safeString (item, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency); // not sure why we need the currency param?!
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const account = this.safeString (item, 'group');
        let amount = this.safeNumber (item, 'amount');
        let direction = undefined;
        if (amount < 0) {
            direction = 'out';
            amount = Math.abs (amount);
        } else {
            direction = 'in';
        }
        // const status = this.parseTransactionStatus (this.safeString (item, 'transactStatus'));
        return {
            'id': id,
            'info': item,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': direction,
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'status': 'settled',
            'fee': undefined,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        // We don't need to put these in request, python sends
        // 'created__lt': undefined,
        // 'type': undefined,
        const request = {
            'limit': limit,
        };
        if (since !== undefined) {
            request['since'] = since;
            request['created__gte'] = since;
        }
        if (currency !== undefined) {
            request['currency'] = currency['code'];
        }
        const response = await this.privateGetLedger (this.extend (request, params));
        const response_next = await this.fetchRecursively ();
        if (response_next !== undefined) {
            response.push (response_next);
        }
        return this.parseLedger (response, currency, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        // Request a settlement for a given amount to the given destination in a given currency.
        // Your account must exhibit a sufficient balance in the requested currency.
        // Note that for non approved addresses, the amount can only be lower than 0.1.
        // The address_protocol parameter is either “Omni” or “ERC20” and only used for UST settlement requests.
        // For other currencies, leave null. The address_suffix is the memo or the tag of the address as entered on the website.
        // post_data = {
        //     'amount': '1000',
        //     'currency': 'XRP',
        //     'destination_address': {
        //         'address_value': 'rUQngTebGgF1tCexhuPaQBr5MufweybMom',
        //         'address_suffix': 'tag0',
        //         'address_protocol': None
        //     }
        // }
        // Fiat withdrawal
        // post_data = {
        //     'amount': '1000',
        //     'currency': 'USD',
        //     'destination_bank_account': 'USD Bank Account'
        // }
        // Response:
        // {
        //     "amount": "1000.00000000",
        //     "currency": "XRP",
        //     "withdrawal_id": "5c7e90cc-a8d6-4db5-8348-44053b2dcbdf",
        //     "reference": "",
        //     "settled": false,
        //     "created": "2021-06-09T09:46:00.162599Z",
        //     "destination_address": {
        //       "address_value": "rUQngTebGgF1tCexhuPaQBr5MufweybMom",
        //       "address_suffix": "tag0",
        //       "address_protocol": null
        //     },
        //     "destination_bank_account": null
        //   }
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'amount': amount,
            'currency': currency['id'],
        };
        const dest = {
            'address_value': address,
        };
        if (tag !== undefined) {
            request['addressTag'] = tag;
        }
        if (currency === 'UST') {
            request['address_protocol'] = 'ERC20';
        }
        request['destination_address'] = dest;
        const response = await this.privatePostWithdrawal (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'withdrawal_id'),
        };
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = undefined;
        const request = {
            'limit': limit,
        };
        const response = await this.privateGetWithdrawal (this.extend (request, params));
        const response_next = await this.fetchRecursively ();
        if (response_next !== undefined) {
            response.push (response_next);
        }
        return this.parseWithdrawals (response, currency, since, limit);
    }

    parseWithdrawal (transaction, currency = undefined) {
        // [
        //     {
        //       "amount": "2.00000000",
        //       "currency": "BTC",
        //       "destination_address": "0xC323E80eF4deC2195G239F4f1e830417D294F841",
        //       "destination_bank_account": null,
        //       "reference": "",
        //       "settled": false,
        //       "created": "2021-06-09T09:46:00.162599Z",
        //       "withdrawal_id": "ed846746-f7e0-4af9-85bb-36732e60d6d8"
        //     },
        //     {
        //       "amount": "10.00000000",
        //       "currency": "BTC",
        //       "destination_address": null,
        //       "destination_bank_account": "EUR BA",
        //       "reference": "",
        //       "settled": true,
        //       "created": "2021-06-09T09:46:00.162599Z",
        //       "withdrawal_id": "b4426ff2-19c6-48ca-8b07-2c344dc34ecb"
        //     }
        //   ]
        const amount = this.safeNumber (transaction, 'amount');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const address = this.safeString (transaction, 'destination_address');
        const updated = undefined;
        let tag = this.safeString (transaction, 'reference'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        let status = 'pending';
        if (transaction['settled'] === true) {
            status = 'settled';
        }
        const timestamp = this.parse8601 (this.safeString (transaction, 'applyTime'));
        const id = this.safeString (transaction, 'withdrawal_id');
        return {
            'info': transaction,
            'id': id,
            'txid': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'type': 'withdrawal',
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'internal': false,
            'fee': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.implodeHostname (this.urls['api'][api]) + '/';
        url += this.implodeParams (path, params);
        if (api === 'private') {
            if (method === 'GET') {
                headers = {
                    'Authorization': 'Token ' + this.apiKey,
                };
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (method === 'POST') {
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + this.apiKey,
                };
                if (Object.keys (params).length) {
                    body = this.json (query);
                }
            }
        }
        const r = { 'url': url, 'method': method, 'body': body, 'headers': headers };
        return r;
    }
};
