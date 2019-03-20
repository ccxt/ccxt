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
            'web3ProviderURL': 'https://infura.io/',
            'has': {
                'CORS': false,
                'cancelOrder': true,
                'createDepositAddress': false,
                'createOrder': true,
                'deposit': true,
                'fetchBalance': false,
                'fetchClosedOrders': false,
                'fetchContractHash': true,
                'fetchCurrencies': true,
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
                'withdraw': true,
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

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetExchangeTokens (params);
        let currencies = Object.keys (response);
        let network = '';
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = response[currencies[i]];
            let id = currencies[i];
            let name = response[currencies[i]]['name'];
            let code = this.commonCurrencyCode (id);
            let precision = response[currencies[i]]['precision'];
            let active = response[currencies[i]]['trading_active'];
            let type = response[currencies[i]]['type'];
            let address = response[currencies[i]]['hash'];
            let minimum = response[currencies[i]]['minimum_quantity'];
            if (response[currencies[i]]['type'] === 'NEO' || response[currencies[i]]['type'] === 'NEP-5') {
                network = 'neo';
            } else if (response[currencies[i]]['type'] === 'ETH' || response[currencies[i]]['type'] === 'ERC-20') {
                network = 'eth';
            } else if (response[currencies[i]]['type'] === 'EOS') {
                network = 'eos';
            } else if (response[currencies[i]]['type'] === 'QTUM') {
                network = 'qtum';
            }
            result[code] = {
                'id': id,
                'code': code,
                'address': address,
                'network': network,
                'info': currency,
                'type': type,
                'name': name,
                'active': active,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minimum,
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
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetExchangePairs (this.extend ({
            'show_details': 1,
        }, params));
        let tokens = await this.fetchCurrencies (this.extend ({
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
            let active = (tokens[base]['active'] && tokens[quote]['active']);
            this.options['contract'] = contracts[quote];
            let precision = {
                'amount': market['precision'],
                'cost': market['precision'],
                'price': market['precision'],
            };
            let limits = {
                'amount': {
                    'min': tokens[quote]['limits']['amount']['min'],
                },
                'cost': {
                    'min': tokens[base]['limits']['amount']['min'],
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
            orderDict[orderParams[i]['id']] = this.signHashSignature (orderParams[i]['txn']['sha256'], privateKey);
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

    async createSubmitOrder (orderPayload, params = {}) {
        let createOrderPayload = await this.privatePostOrders (this.extend (orderPayload, params));
        return createOrderPayload;
    }

    async createExecuteOrder (orderPayload, params = {}) {
        let executeOrderPayload = await this.privatePostOrdersIdBroadcast (this.extend (orderPayload, params));
        return executeOrderPayload;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        const errorMessage = this.id + ' createOrder() requires `exchange.walletAddress` and `exchange.privateKey`. The .walletAddress should be a "0x"-prefixed hexstring like "0xbF2d65B3b2907214EEA3562f21B80f6Ed7220377". The .privateKey for that wallet should be a "0x"-prefixed hexstring like "0xe4f40d465efa94c98aec1a51f574329344c772c1bce33be07fa20a56795fdd09".';
        if (!this.walletAddress || (this.walletAddress.indexOf ('0x') !== 0)) {
            throw new InvalidAddress (errorMessage);
        }
        if (!this.privateKey || (this.privateKey.indexOf ('0x') !== 0)) {
            throw new InvalidAddress (errorMessage);
        }
        await this.loadMarkets ();
        let useSwitcheoToken = undefined;
        let market = this.market (symbol);
        let orderAmount = 0;
        let orderPrice = 0;
        let orderType = '';
        if (market['network'].toLowerCase () === 'eth') {
            orderAmount = this.toWei (this.amountToPrecision (symbol, amount), 'ether');
        }
        if ('useSwitcheoToken' in params) {
            useSwitcheoToken = params.useSwitcheoToken;
        }
        if (market['network'].toLowerCase () === 'eth' || useSwitcheoToken === undefined) {
            useSwitcheoToken = false; // Fees can be paid in the quote currency or Switcheo
        } else if (useSwitcheoToken) {
            useSwitcheoToken = true;
        }
        if (type === 'limit') {
            orderPrice = this.priceToPrecision (symbol, price); // Price denominated in quote tokens (limit orders only)
            orderType = 'limit';
        } else if (type === 'market') {
            orderType = 'market';
        }
        let createOrderPayload = {
            'blockchain': market['network'].toLowerCase (),
            'contract_hash': this.options['contract'],
            'order_type': orderType,
            'quantity': orderAmount,
            'pair': market['id'],
            'side': side,
            'timestamp': this.milliseconds (),
            'use_native_tokens': useSwitcheoToken,
        };
        if (type === 'limit') {
            createOrderPayload['price'] = orderPrice;
        } else {
            createOrderPayload['price'] = undefined;
        }
        let stableStringify = this.stringifyMessage (createOrderPayload);
        let hexMessage = this.hashStringMessage (stableStringify).replace ('0x', '');
        createOrderPayload['signature'] = this.signHashSignature (hexMessage, this.privateKey);
        createOrderPayload['address'] = this.walletAddress.toLowerCase ();
        let headers = {
            'Content-type': 'application/json',
            'Accept': 'text/plain',
        };
        let orderPayload = {
            'body': createOrderPayload,
            'headers': headers,
        };
        let submitCreateOrderResponse = await this.createSubmitOrder (orderPayload, params);
        let orderId = submitCreateOrderResponse['id'];
        let signedCreateOrder = this.signCreateOrder (submitCreateOrderResponse, this.privateKey);
        let executeCreateOrderParams = {
            'id': orderId,
            'headers': headers,
            'body': signedCreateOrder,
        };
        let submitExecuteOrder = await this.createExecuteOrder (executeCreateOrderParams, params);
        let unifiedResponse = {
            'info': submitExecuteOrder,
            'id': orderId,
        };
        return unifiedResponse;
    }

    async createCancelOrder (cancelPayload, params = {}) {
        let createCancelPayload = await this.privatePostCancellations (this.extend (cancelPayload, params));
        return createCancelPayload;
    }

    async executeCancelOrder (cancelPayload, params = {}) {
        let executeCancelPayload = await this.privatePostCancellationsIdBroadcast (this.extend (cancelPayload, params));
        return executeCancelPayload;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let cancelRequest = {
            'order_id': id,
            'timestamp': this.milliseconds (),
        };
        console.log (cancelRequest);
        let stableStringify = this.stringifyMessage (cancelRequest);
        let hexMessage = this.hashStringMessage (stableStringify).replace ('0x', '');
        cancelRequest['signature'] = this.signHashSignature (hexMessage, this.privateKey);
        cancelRequest['address'] = this.walletAddress.toLowerCase ();
        let headers = {
            'Content-type': 'application/json',
            'Accept': 'text/plain',
        };
        let cancelOrderPayload = {
            'body': cancelRequest,
            'headers': headers,
        };
        console.log (cancelOrderPayload);
        let createCancelResponse = await this.createCancelOrder (cancelOrderPayload, params);
        console.log (createCancelResponse);
        let cancelId = createCancelResponse['id'];
        let cancelMessage = {
            'signature': this.signHashSignature (createCancelResponse['transaction']['sha256'], this.privateKey),
        };
        let executeCancelOrderParams = {
            'id': cancelId,
            'headers': headers,
            'body': cancelMessage,
        };
        let executeCancel = await this.executeCancelOrder (executeCancelOrderParams, params);
        return executeCancel;
    }

    async createDeposit (depositPayload, params = {}) {
        let createDepositPayload = await this.privatePostDeposits (this.extend (depositPayload, params));
        return createDepositPayload;
    }

    async executeDeposit (depositPayload, params = {}) {
        let executeDepositPayload = await this.privatePostDepositsIdBroadcast (this.extend (depositPayload, params));
        return executeDepositPayload;
    }

    async deposit (symbol, amount, params = {}) {
        await this.loadMarkets ();
        let contractHash = await this.fetchContractHash ();
        let depositRequest = {
            'blockchain': this.currencies[symbol]['network'],
            'asset_id': symbol,
            'timestamp': this.milliseconds (),
        };
        if (this.currencies[symbol]['network'] === 'eth') {
            depositRequest['amount'] = this.toWei (amount, 'ether');
            depositRequest['contract_hash'] = contractHash['ETH'];
            let stableStringify = this.stringifyMessage (depositRequest);
            let hexMessage = this.hashStringMessage (stableStringify).replace ('0x', '');
            depositRequest['signature'] = this.signHashSignature (hexMessage, this.privateKey);
            depositRequest['address'] = this.walletAddress.toLowerCase ();
        }
        let headers = {
            'Content-type': 'application/json',
            'Accept': 'text/plain',
        };
        let depositPayload = {
            'body': depositRequest,
            'headers': headers,
        };
        let createDepositResponse = await this.createDeposit (depositPayload, params);
        let depositId = createDepositResponse['id'];
        let txnPayload = {
            'from': this.toChecksumAddress (createDepositResponse['transaction']['from']),
            'to': this.toChecksumAddress (createDepositResponse['transaction']['to']),
            'value': createDepositResponse['transaction']['value'],
            'data': createDepositResponse['transaction']['data'],
            'gas': createDepositResponse['transaction']['gas'],
            'gasPrice': createDepositResponse['transaction']['gasPrice'],
            'chainId': createDepositResponse['transaction']['chainId'],
            'nonce': createDepositResponse['transaction']['nonce'],
        };
        let signedTxn = await this.signEthTransaction (txnPayload);
        let txnHash = this.generateEthTransactionHash (signedTxn.rawTransaction);
        this.sendEthSignedTransaction (signedTxn.rawTransaction);
        let txnMessage = {
            'transaction_hash': txnHash,
        };
        let executeDepositParams = {
            'id': depositId,
            'headers': headers,
            'body': txnMessage,
        };
        let executeDepositPayload = await this.executeDeposit (executeDepositParams, params);
        return executeDepositPayload;
    }

    async createWithdrawal (withdrawalPayload, params = {}) {
        let createWithdrawalPayload = await this.privatePostWithdrawals (this.extend (withdrawalPayload, params));
        return createWithdrawalPayload;
    }

    async executeWithdrawal (withdrawalPayload, params = {}) {
        let executeWithdrawalPayload = await this.privatePostWithdrawalsIdBroadcast (this.extend (withdrawalPayload, params));
        return executeWithdrawalPayload;
    }

    async withdraw (symbol, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        let contractHash = await this.fetchContractHash ();
        let withdrawalRequest = {
            'blockchain': this.currencies[symbol]['network'],
            'asset_id': symbol,
            'timestamp': this.milliseconds (),
        };
        if (this.currencies[symbol]['network'] === 'eth') {
            withdrawalRequest['amount'] = this.toWei (amount, 'ether');
            withdrawalRequest['contract_hash'] = contractHash['ETH'];
            let stableStringify = this.stringifyMessage (withdrawalRequest);
            let hexMessage = this.hashStringMessage (stableStringify).replace ('0x', '');
            withdrawalRequest['signature'] = this.signHashSignature (hexMessage, this.privateKey);
            withdrawalRequest['address'] = this.walletAddress.toLowerCase ();
        }
        let headers = {
            'Content-type': 'application/json',
            'Accept': 'text/plain',
        };
        let withdrawalPayload = {
            'body': withdrawalRequest,
            'headers': headers,
        };
        let createWithdrawalResponse = await this.createWithdrawal (withdrawalPayload, params);
        let withdrawalId = createWithdrawalResponse['id'];
        let withdrawalMessage = {
            'signature': this.signHashSignature (createWithdrawalResponse['transaction']['sha256'], this.privateKey),
        };
        let executeWithdrawalParams = {
            'id': withdrawalId,
            'headers': headers,
            'body': withdrawalMessage,
        };
        let executeWithdrawal = await this.executeWithdrawal (executeWithdrawalParams);
        let unifiedResponse = {
            'info': executeWithdrawal,
            'id': withdrawalId,
        };
        return unifiedResponse;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length)
                request += '?' + this.urlencode (query);
        } else if (method === 'POST') {
            if ('headers' in query) {
                headers = query['headers'];
            }
            if ('body' in query) {
                body = this.stringifyMessage (query['body']);
            }
        }
        let url = this.urls['api'] + '/' + this.version + request;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
