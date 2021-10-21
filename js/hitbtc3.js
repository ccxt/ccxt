const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');

module.exports = class hitbtc3 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hitbtc3',
            'name': 'HitBTC',
            'countries': [ 'HK' ],
            'rateLimit': 1500,
            'version': '3',
            'pro': true,
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createDepositAddress': true,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTransactions': true,
                'fetchWithdrawals': false,
                'withdraw': true,
                'transfer': true,
            },
            'precisionMode': TICK_SIZE,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'test': {
                    'public': 'https://api.demo.hitbtc.com',
                    'private': 'https://api.demo.hitbtc.com',
                },
                'api': {
                    'public': 'https://api.hitbtc.com/api/3',
                    'private': 'https://api.hitbtc.com/api/3',
                },
                'www': 'https://hitbtc.com',
                'referral': 'https://hitbtc.com/?ref_id=5a5d39a65d466',
                'doc': [
                    'https://api.hitbtc.com',
                    'https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv2.md',
                ],
                'fees': [
                    'https://hitbtc.com/fees-and-limits',
                    'https://support.hitbtc.com/hc/en-us/articles/115005148605-Fees-and-limits',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'public/currency',
                        'public/symbol',
                        'public/ticker',
                        'public/price/rate',
                        'public/trades',
                        'public/orderbook',
                        'public/candles',
                        'public/futures/info',
                        'public/futures/history/funding',
                        'public/futures/candles/index_price',
                        'public/futures/candles/mark_price',
                        'public/futures/candles/premium_index',
                        'public/futures/candles/open_interest',
                    ],
                },
                'private': {
                    'get': [
                        'spot/balance',
                        'spot/order',
                        'spot/order/{client_order_id}',
                        'spot/fee',
                        'spot/fee/{symbol}',
                        'spot/history/order',
                        'spot/history/trade',
                        'margin/account',
                        'margin/account/isolated/{symbol}',
                        'margin/order',
                        'margin/order/{client_order_id}',
                        'margin/history/order',
                        'margin/history/trade',
                        'futures/balance',
                        'futures/account',
                        'futures/account/isolated/{symbol}',
                        'futures/order',
                        'futures/order/{client_order_id}',
                        'futures/fee',
                        'futures/fee/{symbol}',
                        'futures/history/order',
                        'futures/history/trade',
                        'wallet/balance',
                        'wallet/crypto/address',
                        'wallet/crypto/address/recent-deposit',
                        'wallet/crypto/address/recent-withdraw',
                        'wallet/crypto/address/check-mine',
                        'wallet/transactions',
                        'wallet/crypto/check-offchain-available',
                        'wallet/crypto/fee/estimate',
                        'sub-account',
                        'sub-account/acl',
                        'sub-account/balance/{subAccID}',
                        'sub-account/crypto/address/{subAccID}/{currency}',
                    ],
                    'post': [
                        'spot/order',
                        'margin/order',
                        'futures/order',
                        'wallet/convert',
                        'wallet/crypto/withdraw',
                        'wallet/transfer',
                        'sub-account/freeze',
                        'sub-account/activate',
                        'sub-account/transfer',
                        'sub-account/acl',
                    ],
                    'patch': [
                        'spot/order/{client_order_id}',
                        'margin/order/{client_order_id}',
                        'futures/order/{client_order_id}',
                    ],
                    'delete': [
                        'spot/order',
                        'spot/order/{client_order_id}',
                        'margin/position',
                        'margin/position/isolated/{symbol}',
                        'margin/order',
                        'margin/order/{client_order_id}',
                        'futures/position',
                        'futures/position/isolated/{symbol}',
                        'futures/order',
                        'futures/order/{client_order_id}',
                        'wallet/crypto/withdraw/{id}',
                    ],
                    'put': [
                        'margin/account/isolated/{symbol}',
                        'futures/account/isolated/{symbol}',
                        'wallet/crypto/withdraw/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0009'),
                    'maker': this.parseNumber ('0.0009'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0009') ],
                            [ this.parseNumber ('10'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('100'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('500'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('1000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('5000'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('10000'), this.parseNumber ('0.0001') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('-0.0001') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('-0.0001') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0009') ],
                            [ this.parseNumber ('10'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('100'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('500'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('1000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('5000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('10000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0002') ],
                        ],
                    },
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const request = {};
        const response = await this.publicGetPublicSymbol (this.extend (request, params));
        //
        // fetches both spot and future markets
        //
        //     {
        //         "ETHBTC": {
        //             "type": "spot",
        //             "base_currency": "ETH",
        //             "quote_currency": "BTC",
        //             "quantity_increment": "0.001",
        //             "tick_size": "0.000001",
        //             "take_rate": "0.001",
        //             "make_rate": "-0.0001",
        //             "fee_currency": "BTC",
        //             "margin_trading": true,
        //             "max_initial_leverage": "10.00"
        //         }
        //     }
        //
        const marketIds = Object.keys (response);
        const result = [];
        for (let i = 0; i < marketIds.length; i++) {
            const id = marketIds[i];
            const entry = response[id];
            const baseId = this.safeString (entry, 'base_currency');
            const quoteId = this.safeString (entry, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const maker = this.safeNumber (entry, 'make_rate');
            const taker = this.safeNumber (entry, 'take_rate');
            const feeCurrency = this.safeString (entry, 'fee_currency');
            const feeSide = (feeCurrency === quoteId) ? 'quote' : 'base';
            const margin = this.safeValue (entry, 'margin_trading', false);
            const type = this.safeString (entry, 'type');
            const spot = (type === 'spot');
            const futures = (type === 'futures');
            const priceIncrement = this.safeNumber (entry, 'tick_size');
            const amountIncrement = this.safeNumber (entry, 'quantity_increment');
            const precision = {
                'price': priceIncrement,
                'amount': amountIncrement,
            };
            const limits = {
                'amount': {
                    'min': undefined,
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
            };
            result.push ({
                'info': entry,
                'symbol': symbol,
                'id': id,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'spot': spot,
                'margin': margin,
                'futures': futures,
                'type': type,
                'feeSide': feeSide,
                'maker': maker,
                'taker': taker,
                'precision': precision,
                'limits': limits,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetPublicCurrency (params);
        //
        //     {
        //       "WEALTH": {
        //         "full_name": "ConnectWealth",
        //         "payin_enabled": false,
        //         "payout_enabled": false,
        //         "transfer_enabled": true,
        //         "precision_transfer": "0.001",
        //         "networks": [
        //           {
        //             "network": "ETH",
        //             "protocol": "ERC20",
        //             "default": true,
        //             "payin_enabled": false,
        //             "payout_enabled": false,
        //             "precision_payout": "0.001",
        //             "payout_fee": "0.016800000000",
        //             "payout_is_payment_id": false,
        //             "payin_payment_id": false,
        //             "payin_confirmations": "2"
        //           }
        //         ]
        //       }
        //     }
        //
        const result = {};
        const currencies = Object.keys (response);
        for (let i = 0; i < currencies.length; i++) {
            const currencyId = currencies[i];
            const code = this.safeCurrencyCode (currencyId);
            const entry = response[currencyId];
            const name = this.safeString (entry, 'full_name');
            const precision = this.safeNumber (entry, 'precision_transfer');
            const payinEnabled = this.safeValue (entry, 'payin_enabled', false);
            const payoutEnabled = this.safeValue (entry, 'payout_enabled', false);
            const transferEnabled = this.safeValue (entry, 'transfer_enabled', false);
            const active = payinEnabled && payoutEnabled && transferEnabled;
            const rawNetworks = this.safeValue (entry, 'networks', []);
            const networks = {};
            for (let j = 0; j < rawNetworks.length; j++) {
                const rawNetwork = rawNetworks[j];
                let networkId = this.safeString (rawNetwork, 'protocol');
                if (networkId.length === 0) {
                    networkId = this.safeString (rawNetwork, 'network');
                }
                const network = this.safeNetwork (networkId);
                const fee = this.safeNumber (rawNetwork, 'payout_fee');
                const precision = this.safeNumber (rawNetwork, 'precision_payout');
                const payinEnabledNetwork = this.safeValue (entry, 'payin_enabled', false);
                const payoutEnabledNetwork = this.safeValue (entry, 'payout_enabled', false);
                const transferEnabledNetwork = this.safeValue (entry, 'transfer_enabled', false);
                const active = payinEnabledNetwork && payoutEnabledNetwork && transferEnabledNetwork;
                networks[network] = {
                    'info': rawNetwork,
                    'id': networkId,
                    'network': network,
                    'fee': fee,
                    'active': active,
                    'precision': precision,
                    'limits': {
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                };
            }
            result[code] = {
                'info': entry,
                'code': code,
                'id': currencyId,
                'precision': precision,
                'name': name,
                'active': active,
                'networks': networks,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    safeNetwork (networkId) {
        const networksById = {
        };
        return this.safeString (networksById, networkId, networkId);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
        };
        const response = await this.privateGetWalletCryptoAddress (request);
        return response;
    }

    async fetchBalance (params) {
        const response = await this.privateGetSpotBalance ();
        return response;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        let getRequest = undefined;
        const keys = Object.keys (query);
        const queryLength = keys.length;
        if (method === 'GET') {
            if (queryLength) {
                getRequest = '?' + this.urlencode (query);
                url = url + getRequest;
            }
        } else {
            body = this.json (params);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            const payload = [ method, '/api/3/' + path ];
            if (method === 'GET') {
                if (getRequest !== undefined) {
                    payload.push (getRequest);
                }
            } else {
                payload.push (body);
            }
            payload.push (timestamp);
            const payloadString = payload.join ('');
            const signature = this.hmac (this.encode (payloadString), this.encode (this.secret), 'sha256', 'hex');
            const secondPayload = this.apiKey + ':' + signature + ':' + timestamp;
            const encoded = this.stringToBase64 (secondPayload);
            headers = {
                'Authorization': 'HS256 ' + encoded,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
