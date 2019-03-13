'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, DDoSProtection, InvalidAddress } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class switcheo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'switcheo',
            'name': 'Switcheo',
            'countries': [ 'SG' ],
            'rateLimit': 3000,
            'version': 'v2',
            'userAgent': this.userAgents['chrome'],
            'certified': false,
            'parseJsonResponse': false,
            'requiresWeb3': true,
            'has': {
                'CORS': false,
                'cancelOrder': true,
                'createDepositAddress': false,
                'createOrder': false,
                'deposit': false,
                'fetchBalance': false,
                'fetchClosedOrders': false,
                'fetchContractHash': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchPairs': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchBidsAsks': false,
                'fetchTrades': false,
                'withdraw': false,
                'fetchTransactions': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'fetchMySells': false,
                'fetchMyBuys': false,
            },
            'urls': {
                'logo': 'https://docs.switcheo.network/images/logo.png',
                'api': 'https://api.switcheo.network',
                'www': 'https://switcheo.exchange',
                'doc': 'https://docs.switcheo.network',
                'fees': 'https://intercom.help/switcheonetwork/trading-on-switcheo-exchange/how-to-trade-on-switcheo-exchange/trading-fees',
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/timestamp',
                        'exchange/contracts',
                        'exchange/pairs',
                        'exchange/tokens',
                        'fees',
                        'exchange/announcement_message',
                        'tickers/candlesticks',
                        'tickers/last_24_hours',
                        'tickers/last_price',
                        'offers',
                        'offers/book',
                        'trades',
                        'trades/recent',
                        'balances',
                    ],
                },
                'private': {
                    'post': [
                        'cancellations',
                        'cancellations/{id}/broadcast',
                        'deposits',
                        'deposits/{id}/broadcast',
                        'orders',
                        'orders/{id}/broadcast',
                        'withdrawals',
                        'withdrawals/{id}/broadcast',
                    ],
                },
            },
            'exceptions': {
                'param_required': ExchangeError, // 400 Missing parameter
                'validation_error': ExchangeError, // 400 Unable to validate POST/PUT
                'invalid_request': ExchangeError, // 400 Invalid request
                'authentication_error': AuthenticationError, // 401 Invalid auth (generic)
                'invalid_scope': AuthenticationError, // 403 User hasn’t authenticated necessary scope
                'not_found': ExchangeError, // 404 Resource not found
                'rate_limit_exceeded': DDoSProtection, // 429 Rate limit exceeded
                'internal_server_error': ExchangeError, // 500 Internal server error
            },
            'options': {
                'contract': '',
            },
        });
    }

    async fetchTime () {
        let response = await this.publicGetExchangeTimestamp ();
        return response['timestamp'];
    }

    parseCurrentContract (contracts) {
        let i = 0;
        let j = 0;
        let switcheoContracts = contracts;
        let current_contract = {};
        let switcheoBlockchains = Object.keys (switcheoContracts);
        for (i = 0; i < switcheoBlockchains.length; i++) {
            let maxVersionNumber = 0;
            let maxVersionKey = '';
            let key = switcheoBlockchains[i];
            let contractVersion = Object.keys (switcheoContracts[key]);
            for (j = 0; j < contractVersion.length; j++) {
                let versionNumber = parseFloat (contractVersion[j].slice (1).replace ('_', '.'));
                if (versionNumber > maxVersionNumber) {
                    maxVersionNumber = versionNumber;
                    maxVersionKey = contractVersion[j];
                }
            }
            current_contract[key] = switcheoContracts[key][maxVersionKey];
        }
        current_contract['GAS'] = current_contract['NEO'];
        current_contract['SWTH'] = current_contract['NEO'];
        current_contract['SDUSD'] = current_contract['NEO'];
        current_contract['SDUSDC'] = current_contract['NEO'];
        current_contract['PAX'] = current_contract['ETH'];
        current_contract['DAI'] = current_contract['ETH'];
        return current_contract;
    }

    async fetchContractHash () {
        let response = await this.publicGetExchangeContracts ();
        return this.parseCurrentContract (response);
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetExchangePairs (this.extend ({
            'show_details': 1,
        }, params));
        let tokens = await this.publicGetExchangeTokens (this.extend ({
            'show_listing_details': 1,
            'show_inactive': 1,
        }, params));
        let contracts = await this.fetchContractHash ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['name'];
            let base = market['name'].split ('_')[0];
            let quote = market['name'].split ('_')[1];
            let symbol = base + '/' + quote;
            let active = (tokens[base]['trading_active'] && tokens[quote]['trading_active']);
            this.options['contract'] = contracts[quote];
            let precision = {
                'amount': market['precision'],
                'cost': market['precision'],
                'price': market['precision'],
            };
            let limits = {
                'amount': {
                    'min': tokens[quote]['minimum_quantity'],
                },
                'cost': {
                    'min': tokens[base]['minimum_quantity'],
                },
            };
            result.push (this.extend ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'network': quote,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            }));
        }
        return result;
    }

    async fetchPairs () {
        let pairs = await this.publicGetExchangePairs ();
        return pairs;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
            'contract': this.options['contract'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        let response = await this.publicGetOffersBook (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'quantity');
    }

    signOrderList (orderParams, privateKey) {
        let orderDict = {};
        for (let i = 0; i < orderParams.length; i++) {
            let signedOrder = this.signMessageHash (orderParams[i]['txn']['sha256'], privateKey);
            orderDict[orderParams[i]['id']] = '0x' + signedOrder;
        }
        return orderDict;
    }

    signCreateOrder (createOrderDetails, privateKey) {
        let executeOrder = {
            'signatures': {
                'fill_groups': this.signOrderList (createOrderDetails['fill_groups'], privateKey),
                'fills': {},
                'makes': this.signOrderList (createOrderDetails['makes'], privateKey),
            },
        };
        return executeOrder;
    }

    async createOrder (symbol, type, side, amount, price = undefined, useSwitcheoToken = undefined, params = {}) {
        const errorMessage = this.id + ' createOrder() requires `exchange.walletAddress` and `exchange.privateKey`. The .walletAddress should be a "0x"-prefixed hexstring like "0xbF2d65B3b2907214EEA3562f21B80f6Ed7220377". The .privateKey for that wallet should be a "0x"-prefixed hexstring like "0xe4f40d465efa94c98aec1a51f574329344c772c1bce33be07fa20a56795fdd09".';
        if (!this.walletAddress || (this.walletAddress.indexOf ('0x') !== 0)) {
            throw new InvalidAddress (errorMessage);
        }
        if (!this.privateKey || (this.privateKey.indexOf ('0x') !== 0)) {
            throw new InvalidAddress (errorMessage);
        }
        await this.loadMarkets ();
        let timestamp = this.milliseconds ();
        let market = this.market (symbol);
        let reserveRequest = {
            'walletAddress': this.walletAddress.toLowerCase (), // Your Wallet Address
            'baseTokenAddress': market['base'], // Base token address
            'quoteTokenAddress': market['quote'], // Quote token address
            'side': side, // buy or sell
            'orderAmount': this.toWei (this.amountToPrecision (symbol, amount), 'ether'), // Base token amount in wei
        };
        if (market['network'].toLowerCase () === 'eth' || useSwitcheoToken === undefined) {
            useSwitcheoToken = false; // Fees can be paid in the quote currency or Switcheo
        } else if (useSwitcheoToken) {
            useSwitcheoToken = true;
        }
        if (type === 'limit') {
            reserveRequest['price'] = this.priceToPrecision (symbol, price); // Price denominated in quote tokens (limit orders only)
            reserveRequest['order_type'] = 'limit';
        } else if (type === 'market') {
            reserveRequest['order_type'] = 'market';
        }
        let createOrder = {
            'blockchain': market['network'].toLowerCase (),
            'contract_hash': this.options['contract'],
            'order_type': reserveRequest['order_type'],
            'quantity': reserveRequest['orderAmount'],
            'pair': market['id'],
            'side': side,
            'timestamp': timestamp,
            'use_native_tokens': useSwitcheoToken,
        };
        if (type === 'limit') {
            createOrder['price'] = reserveRequest['price'];
        } else {
            createOrder['price'] = undefined;
        }
        let stableStringify = this.stringifyMessage (createOrder);
        let hexMessage = this.toHex (stableStringify);
        let signedMessage = this.signMessageHash (hexMessage, this.privateKey);
        createOrder['signature'] = signedMessage;
        createOrder['address'] = this.walletAddress.toLowerCase ();
        let headers = {
            'Content-type': 'application/json',
            'Accept': 'text/plain',
        };
        let submitCreateOrder = await this.privatePostOrders (params, headers, createOrder);
        let orderId = submitCreateOrder['id'];
        let signedCreateOrder = this.signCreateOrder (submitCreateOrder, this.privateKey);
        let submitExecuteOrder = await this.privatePostOrdersIdBroadcast ({ 'id': orderId }, headers, signedCreateOrder);
        return submitExecuteOrder;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let cancelRequest = {
            'order_id': id,
            'timestamp': this.milliseconds (),
        };
        let stableStringify = this.stringifyMessage (cancelRequest);
        let hexMessage = this.toHex (stableStringify);
        let signedMessage = this.signMessageHash (hexMessage, this.privateKey);
        cancelRequest['signature'] = signedMessage;
        cancelRequest['address'] = this.walletAddress.toLowerCase ();
        let headers = {
            'Content-type': 'application/json',
            'Accept': 'text/plain',
        };
        let createCancel = await this.privatePostCancellations (params, headers, cancelRequest);
        let cancelId = createCancel['id'];
        let signedCancel = this.signMessageHash (createCancel['transaction']['sha256'], this.privateKey);
        let executeCancel = await this.privatePostCancellationsIdBroadcast ({ 'id': cancelId }, headers, { 'signature': '0x' + signedCancel });
        return executeCancel;
    }

    async deposit (symbol, amount, params = {}) {
        let depositRequest = {
            'blockchain': 'eth',
            'asset_id': symbol,
            'amount': this.toWei (amount, 'ether'),
            'contract_hash': this.fetchContractHash ()['ETH'],
            'timestamp': this.milliseconds (),
        };
        console.log (depositRequest);
        let stableStringify = this.stringifyMessage (depositRequest);
        let hexMessage = this.toHex (stableStringify);
        let signedMessage = this.signMessageHash (hexMessage, this.privateKey);
        depositRequest['signature'] = signedMessage;
        depositRequest['address'] = this.walletAddress.toLowerCase ();
        let headers = {
            'Content-type': 'application/json',
            'Accept': 'text/plain',
        };
        let createDeposit = await this.privatePostDeposits (params, headers, depositRequest);
        console.log (createDeposit);
        let depositId = createDeposit['id'];
        console.log (depositId);
        let executeDeposit = await this.privatePostDepositsIdBroadcast ({ 'id': depositId }, headers, this.signTransaction (createDeposit, this.privateKey));
        return executeDeposit;
    }

    async withdrawal (symbol, amount, params = {}) {
        let withdrawalRequest = {
            'blockchain': 'eth',
            'asset_id': symbol,
            'amount': this.toWei (amount, 'ether'),
            'contract_hash': this.fetchContractHash ()['ETH'],
            'timestamp': this.milliseconds (),
        };
        let stableStringify = this.stringifyMessage (withdrawalRequest);
        let hexMessage = this.toHex (stableStringify);
        let signedMessage = this.signMessageHash (hexMessage, this.privateKey);
        withdrawalRequest['signature'] = signedMessage;
        withdrawalRequest['address'] = this.walletAddress.toLowerCase ();
        let headers = {
            'Content-type': 'application/json',
            'Accept': 'text/plain',
        };
        let createWithdrawal = await this.privatePostWithdrawals (params, headers, withdrawalRequest);
        let withdrawalId = createWithdrawal['id'];
        let signedWithdrawal = this.signMessageHash (createWithdrawal['transaction']['sha256'], this.privateKey);
        let executeWithdrawal = await this.privatePostWithdrawalsIdBroadcast ({ 'id': withdrawalId }, headers, { 'signature': '0x' + signedWithdrawal });
        return executeWithdrawal;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length)
                request += '?' + this.urlencode (query);
        }
        let url = this.urls['api'] + '/' + this.version + request;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
