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
            'web3ProviderURL': '',
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'privateKey': true,
                'walletAddress': true,
                'web3ProviderURL': true,
                'web3InfuraKey': true,
            },
            'has': {
                'CORS': false,
                'cancelOrder': true,
                'createOrder': true,
                'deposit': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchContractHash': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchOrders': true,
                'fetchPairs': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': false,
                'withdraw': true,
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
                        'balances',
                        'exchange/announcement_message',
                        'exchange/contracts',
                        'exchange/pairs',
                        'exchange/timestamp',
                        'exchange/tokens',
                        'fees',
                        'offers',
                        'offers/book',
                        'orders',
                        'orders/{id}',
                        'tickers/candlesticks',
                        'tickers/last_24_hours',
                        'tickers/last_price',
                        'trades',
                        'trades/recent',
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
                'contracts': {},
                'currentContracts': {},
                'currencyHashes': {},
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

    async fetchContractHash (params = {}) {
        let response = await this.publicGetExchangeContracts (params);
        let currentContract = this.parseCurrentContract (response);
        this.options['contracts'] = response;
        this.options['currentContracts'] = currentContract;
        return currentContract;
    }

    async fetchCurrencies (params = {}) {
        if (!('show_listing_details' in params))
            params['show_listing_details'] = 1;
        if (!('show_inactive' in params))
            params['show_inactive'] = 1;
        let response = await this.publicGetExchangeTokens (params);
        let contracts = await this.fetchContractHash (params);
        let currencies = Object.keys (response);
        let network = '';
        let contractHash = '';
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = response[currencies[i]];
            let id = currencies[i];
            let name = response[currencies[i]]['name'];
            let code = this.commonCurrencyCode (id);
            let precision = response[currencies[i]]['precision'];
            let decimals = response[currencies[i]]['decimals'];
            let active = response[currencies[i]]['trading_active'];
            let type = response[currencies[i]]['type'];
            let address = response[currencies[i]]['hash'];
            let minimum = response[currencies[i]]['minimum_quantity'];
            if (response[currencies[i]]['type'] === 'NEO' || response[currencies[i]]['type'] === 'NEP-5') {
                network = 'neo';
                contractHash = contracts['NEO'];
            } else if (response[currencies[i]]['type'] === 'ETH' || response[currencies[i]]['type'] === 'ERC-20') {
                network = 'eth';
                contractHash = contracts['ETH'];
            } else if (response[currencies[i]]['type'] === 'EOS') {
                network = 'eos';
                contractHash = contracts['EOS'];
            } else if (response[currencies[i]]['type'] === 'QTUM') {
                network = 'qtum';
                contractHash = contracts['QTUM'];
            }
            if (!(network in this.options['currencyHashes']))
                this.options['currencyHashes'][network] = {};
            this.options['currencyHashes'][network][address] = code;
            result[code] = {
                'id': id,
                'code': code,
                'address': address,
                'network': network,
                'contract_hash': contractHash,
                'info': currency,
                'type': type,
                'name': name,
                'active': active,
                'fee': undefined,
                'precision': precision,
                'decimals': decimals,
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
        let contracts = await this.fetchContractHash ();
        let tokens = await this.fetchCurrencies (params);
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
                'amount': tokens[base]['info']['decimals'],
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
                'network': quote.toLowerCase (),
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            }));
        }
        return result;
    }

    async fetchPairs (params = {}) {
        let pairs = await this.publicGetExchangePairs (this.extend (params));
        return pairs;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'blockchain': market['network'],
            'pair': market['id'],
            'contract_hash': this.options['currentContracts'][market['quote']],
        };
        if (market['quote'] === 'NEO') {
            request['contract_hash'] = this.options['currentContracts'][market['quote']];
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined && limit > 0 && limit <= 10000) {
            request['limit'] = limit;
        }
        if ('startTime' in params) {
            request['from'] = params.startTime;
        }
        if ('endTime' in params) {
            request['to'] = params.endTime;
        }
        let response = await this.publicGetTrades (this.extend (request, params));
        return response;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let contract_hashes = [];
        let contracts = Object.keys (this.options['currentContracts']);
        for (let i = 0; i < contracts.length; i++) {
            contract_hashes.push (this.options['currentContracts'][contracts[i]]);
        }
        let request = {
            'addresses': [ this.walletAddress ],
            'contract_hashes': contract_hashes,
        };
        let response = await this.publicGetBalances (this.extend (request, params));
        let freeBalance = {};
        let freeKeys = Object.keys (response['confirmed']);
        for (let j = 0; j < freeKeys.length; j++) {
            freeBalance[freeKeys[j]] = this.fromWei (response['confirmed'][freeKeys[j]], 'ether', this.currencies[freeKeys[j]]['info']['decimals']);
        }
        let usedBalance = {};
        let usedKeys = Object.keys (response['locked']);
        for (let k = 0; k < usedKeys.length; k++) {
            usedBalance[usedKeys[k]] = this.fromWei (response['locked'][usedKeys[k]], 'ether', this.currencies[usedKeys[k]]['info']['decimals']);
        }
        let totalBalance = {};
        let totalKeys = freeKeys;
        for (let l = 0; l < usedKeys.length; l++) {
            let isUnique = true;
            for (let c = 0; c < totalKeys.length; c++) {
                if (totalKeys[c] in totalKeys)
                    isUnique = false;
            }
            if (isUnique)
                totalKeys.push (usedKeys[l]);
        }
        for (let m = 0; m < totalKeys.length; m++) {
            let key = totalKeys[m];
            let free = 0;
            let used = 0;
            if (key in freeBalance)
                free = freeBalance[key];
            if (key in usedBalance)
                used = usedBalance[key];
            totalBalance[key] = this.sum (free, used);
        }
        let unifiedBalance = {
            'info': response,       // the original untouched non-parsed reply with details
            'free': freeBalance,    // money, available for trading, by currency
            'used': usedBalance,    // money on hold, locked, frozen, or pending, by currency}
            'total': totalBalance,  // total (free + used), by currency
        };
        for (let n = 0; n < totalKeys.length; n++) {
            let key = totalKeys[n];
            let free = 0;
            let used = 0;
            let total = 0;
            if (key in freeBalance)
                free = freeBalance[key];
            if (key in usedBalance)
                used = usedBalance[key];
            total = this.sum (free, used);
            unifiedBalance[key] = {
                'free': parseFloat (free),
                'used': parseFloat (used),
                'total': total,
            };
        }
        return unifiedBalance;
    }

    parseOrder (order) {
        let pair = order['pair'].replace ('_', '/');
        let wantAssetId = order['want_asset_id'];
        let wantAssetSymbol = this.options['currencyHashes'][order['blockchain']][wantAssetId];
        let lastTradeTimestamp = undefined;
        let tradeAmount = 0;
        let fee = {};
        let feeAmount = 0;
        let feeAsset = '';
        let trades = [];
        let price = [];
        let type = '';
        if (!order['price'])
            type = 'market';
        else
            type = 'limit';
        if (order['fills'].length > 0) {
            for (let k = 0; k < order['fills'].length; k++) {
                let fills = order['fills'][k];
                if (fills['status'] === 'success') {
                    tradeAmount += parseFloat (fills['want_amount']);
                    feeAsset = this.options['currencyHashes'][order['blockchain']][fills['fee_asset_id']];
                    let feeAmountBlockchain = 0;
                    if (order['blockchain'] === 'neo') {
                        feeAmountBlockchain = this.decimalToPrecision (this.fromWei (parseInt (fills['fee_amount']), 'ether', this.currencies[feeAsset]['info']['decimals']), 0, this.currencies[feeAsset]['info']['decimals']);
                    } else if (order['blockchain'] === 'eth') {
                        feeAmountBlockchain = this.fromWei (parseInt (fills['fee_amount']), 'ether', this.currencies[feeAsset]['info']['decimals']);
                    }
                    feeAmount += feeAmountBlockchain;
                    trades.push (fills['id']);
                    price.push (fills['price']);
                    let fillTimestamp = this.toEpoch (fills['created_at']);
                    if (lastTradeTimestamp === undefined || fillTimestamp > lastTradeTimestamp)
                        lastTradeTimestamp = fillTimestamp;
                }
            }
            fee['currency'] = feeAsset;
            fee['cost'] = feeAmount;
        }
        if (order['makes'].length > 0) {
            for (let m = 0; m < order['makes'].length; m++) {
                let makes = order['makes'][m];
                if (makes['status'] === 'success' || makes['status'] === 'cancelling' || makes['status'] === 'cancelled') {
                    price.push (makes['price']);
                    if (makes['trades'].length > 0) {
                        for (let n = 0; n < makes['trades'].length; n++) {
                            let makeTrades = makes['trades'][n];
                            if (makeTrades['status'] === 'success') {
                                tradeAmount += parseFloat (makeTrades['filled_amount']);
                                feeAsset = this.options['currencyHashes'][order['blockchain']][makeTrades['fee_asset_id']];
                                let feeAmountBlockchain = 0;
                                if (order['blockchain'] === 'neo') {
                                    feeAmountBlockchain = this.decimalToPrecision (this.fromWei (parseInt (makeTrades['fee_amount']), 'ether', this.currencies[feeAsset]['info']['decimals']) * -0.5, 0, this.currencies[feeAsset]['info']['decimals']);
                                } else if (order['blockchain'] === 'eth') {
                                    feeAmountBlockchain = this.fromWei (parseInt (makeTrades['fee_amount']), 'ether', this.currencies[feeAsset]['info']['decimals']) * -0.5;
                                }
                                feeAmount += feeAmountBlockchain;
                                trades.push (makeTrades['id']);
                                let fillTimestamp = this.toEpoch (makeTrades['created_at']);
                                if (lastTradeTimestamp === undefined || fillTimestamp > lastTradeTimestamp)
                                    lastTradeTimestamp = fillTimestamp;
                            }
                        }
                        fee['currency'] = feeAsset;
                        fee['cost'] = feeAmount;
                    }
                }
            }
        }
        let total = 0;
        for (let l = 0; l < price.length; l++) {
            total += parseFloat (price[l]);
        }
        let avgPrice = (total / price.length);
        let wantAmount = parseFloat (order['want_amount']);
        let remainingAmount = wantAmount - tradeAmount;
        let tradedAmount = this.fromWei (tradeAmount, 'ether', this.currencies[wantAssetSymbol]['info']['decimals']);
        let totalCost = 0;
        if (order['side'] === 'buy')
            totalCost = tradedAmount * avgPrice;
        else if (order['side'] === 'sell')
            totalCost = tradedAmount / avgPrice;
        let unifiedOrder = {
            'id': order['id'],
            'datetime': order['created_at'],
            'timestamp': order['created_at_epoch'],
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': order['order_status'],
            'symbol': pair,
            'type': type,
            'side': order['side'],
            'price': avgPrice,
            'amount': this.fromWei (wantAmount, 'ether', this.currencies[wantAssetSymbol]['info']['decimals']),
            'filled': tradedAmount,
            'remaining': this.fromWei (remainingAmount, 'ether', this.currencies[wantAssetSymbol]['info']['decimals']),
            'cost': totalCost,
            'trades': trades,
            'fee': fee,
            'info': order,
        };
        return unifiedOrder;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'id': id,
        };
        let response = await this.publicGetOrdersId (this.extend (request, params));
        response['created_at_epoch'] = this.toEpoch (response['created_at']);
        let responseFormatted = this.parseOrder (response);
        return responseFormatted;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'address': this.walletAddress,
        };
        if (symbol) {
            request['contract_hash'] = this.currencies[symbol];
            request['pair'] = this.market (symbol.toUpperCase ().replace ('_', '/'))['id'];
        }
        if (since) {
            request['from'] = params['since'];
        }
        if ('order_status' in params) {
            request['order_status'] = params['order_status'];
        }
        if ('before_id' in params) {
            request['before_id'] = params['before'];
        }
        if (limit) {
            request['limit'] = limit;
        }
        let response = await this.publicGetOrders (this.extend (request, params));
        for (let i = 0; i < response.length; i++) {
            response[i]['created_at_epoch'] = this.toEpoch (response[i]['created_at']);
        }
        let responseFormatted = [];
        let reverseArrayLength = response.length - 1;
        for (let j = 0; j < response.length; j++) {
            let index = reverseArrayLength - j;
            responseFormatted.push (this.parseOrder (response[index]));
        }
        return responseFormatted;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        params['order_status'] = 'open';
        let response = await this.fetchOrders (symbol, since, limit, params);
        return response;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        params['order_status'] = ['completed', 'cancelled'];
        let response = await this.fetchOrders (symbol, since, limit, params);
        return response;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = {};
        if (limit > 50 && limit <= 200) {
            response = await this.fetchOrders (symbol, since, limit, params);
        } else {
            response = await this.fetchOrders (symbol, since, undefined, params);
        }
        let tradesFormatted = [];
        for (let i = 0; i < response.length; i++) {
            let order = response[i];
            if (order['trades'].length > 0) {
                let info = order['info'];
                let wantAssetId = info['want_asset_id'];
                let wantAssetSymbol = this.options['currencyHashes'][info['blockchain']][wantAssetId];
                let offerAssetId = info['offer_asset_id'];
                let offerAssetSymbol = this.options['currencyHashes'][info['blockchain']][offerAssetId];
                let feeAsset = '';
                let feeAmount = 0;
                let fillTimestamp = 0;
                let price = 0;
                let amount = 0;
                let cost = 0;
                for (let j = 0; j < info['fills'].length; j++) {
                    let fill = info['fills'][j];
                    if (fill['status'] === 'success') {
                        feeAsset = this.options['currencyHashes'][info['blockchain']][fill['fee_asset_id']];
                        feeAmount = fill['fee_amount'];
                        fillTimestamp = this.toEpoch (fill['created_at']);
                        price = parseFloat (fill['price']);
                        amount = parseFloat (fill['want_amount']);
                        if (order['side'] === 'buy')
                            cost = amount * price;
                        else if (order['side'] === 'sell')
                            cost = amount / price;
                        cost = Math.round (cost);
                        let priceFormat = 0;
                        let amountFormat = 0;
                        let costFormat = 0;
                        if (info['blockchain'] === 'neo') {
                            feeAmount = this.decimalToPrecision (this.fromWei (feeAmount, 'ether', this.currencies[feeAsset]['info']['decimals']), 0, this.currencies[feeAsset]['info']['decimals']);
                            priceFormat = this.decimalToPrecision (price, 0, 8);
                            amountFormat = this.decimalToPrecision (this.fromWei (amount, 'ether', this.currencies[wantAssetSymbol]['info']['decimals']), 0, this.currencies[wantAssetSymbol]['info']['decimals']);
                            costFormat = this.decimalToPrecision (this.fromWei (cost, 'ether', this.currencies[offerAssetSymbol]['info']['decimals']), 0, this.currencies[offerAssetSymbol]['info']['decimals']);
                        } else if (info['blockchain'] === 'eth') {
                            feeAmount = this.fromWei (feeAmount, 'ether', this.currencies[feeAsset]['info']['decimals']);
                            priceFormat = this.decimalToPrecision (price, 0, 8);
                            amountFormat = this.decimalToPrecision (this.fromWei (amount, 'ether', this.currencies[wantAssetSymbol]['info']['decimals']), 0, this.currencies[wantAssetSymbol]['info']['decimals']);
                            costFormat = this.decimalToPrecision (this.fromWei (cost, 'ether', this.currencies[offerAssetSymbol]['info']['decimals']), 0, this.currencies[offerAssetSymbol]['info']['decimals']);
                        }
                        let tradeFormatted = {
                            'info': info,
                            'id': order['id'],
                            'timestamp': fillTimestamp,
                            'datetime': fill['created_at'],
                            'symbol': order['symbol'],
                            'order': fill['id'],
                            'type': order['type'],
                            'side': order['side'],
                            'takerOrMaker': 'taker',
                            'price': priceFormat,
                            'amount': amountFormat,
                            'cost': costFormat,
                            'fee': {
                                'cost': feeAmount,
                                'currency': feeAsset,
                            },
                        };
                        // let trades_csv = 'Trade,' + tradeFormatted['amount'] + ',' + wantAssetSymbol + ',,' + tradeFormatted['cost'] + ',' + offerAssetSymbol + ',Switcheo,' + tradeFormatted['datetime'] + ',' + tradeFormatted['side'] + ',' + tradeFormatted['symbol'] + ',' + tradeFormatted['price'] + ',' + tradeFormatted['fee']['cost'] + ',' + tradeFormatted['fee']['currency'] + ',' + this.walletAddress + ',' + order['id'] + ',taker';
                        tradesFormatted.push (tradeFormatted);
                    }
                }
                for (let m = 0; m < info['makes'].length; m++) {
                    let make = info['makes'][m];
                    if (make['trades'].length > 0) {
                        for (let n = 0; n < make['trades'].length; n++) {
                            let trade = make['trades'][n];
                            let feeAsset = '';
                            let feeAmount = 0;
                            let price = 0;
                            let amount = 0;
                            let cost = 0;
                            if (trade['status'] === 'success') {
                                feeAsset = this.options['currencyHashes'][info['blockchain']][trade['fee_asset_id']];
                                feeAmount = trade['fee_amount'];
                                fillTimestamp = this.toEpoch (trade['created_at']);
                                price = parseFloat (trade['price']);
                                amount = parseFloat (trade['filled_amount']);
                                if (order['side'] === 'buy')
                                    cost = amount * price;
                                else if (order['side'] === 'sell')
                                    cost = amount / price;
                                cost = Math.round (cost);
                                let priceFormat = 0;
                                let amountFormat = 0;
                                let costFormat = 0;
                                if (info['blockchain'] === 'neo') {
                                    feeAmount = this.decimalToPrecision (this.fromWei (feeAmount, 'ether', this.currencies[feeAsset]['info']['decimals']) * -0.5, 0, this.currencies[feeAsset]['info']['decimals']);
                                    priceFormat = this.decimalToPrecision (price, 0, 8);
                                    amountFormat = this.decimalToPrecision (this.fromWei (amount, 'ether', this.currencies[wantAssetSymbol]['info']['decimals']), 0, this.currencies[wantAssetSymbol]['info']['decimals']);
                                    costFormat = this.decimalToPrecision (this.fromWei (cost, 'ether', this.currencies[offerAssetSymbol]['info']['decimals']), 0, this.currencies[offerAssetSymbol]['info']['decimals']);
                                } else if (info['blockchain'] === 'eth') {
                                    feeAmount = this.fromWei (feeAmount, 'ether', this.currencies[feeAsset]['info']['decimals']) * -0.5;
                                    priceFormat = this.decimalToPrecision (price, 0, 8);
                                    amountFormat = this.fromWei (amount, 'ether', this.currencies[wantAssetSymbol]['info']['decimals']);
                                    costFormat = this.fromWei (cost, 'ether', this.currencies[offerAssetSymbol]['info']['decimals']);
                                }
                                let tradeFormatted = {
                                    'info': info,
                                    'id': order['id'],
                                    'timestamp': fillTimestamp,
                                    'datetime': trade['created_at'],
                                    'symbol': order['symbol'],
                                    'order': trade['id'],
                                    'type': order['type'],
                                    'side': order['side'],
                                    'takerOrMaker': 'maker',
                                    'price': priceFormat,
                                    'amount': amountFormat,
                                    'cost': costFormat,
                                    'fee': {
                                        'cost': feeAmount,
                                        'currency': feeAsset,
                                    },
                                };
                                // let trades_csv = 'Trade,' + tradeFormatted['amount'] + ',' + wantAssetSymbol + ',,' + tradeFormatted['cost'] + ',' + offerAssetSymbol + ',Switcheo,' + tradeFormatted['datetime'] + ',' + tradeFormatted['side'] + ',' + tradeFormatted['symbol'] + ',' + tradeFormatted['price'] + ',' + tradeFormatted['fee']['cost'] + ',' + tradeFormatted['fee']['currency'] + ',' + this.walletAddress + ',' + order['id'] + ',maker';
                                tradesFormatted.push (tradeFormatted);
                            }
                        }
                    }
                }
            }
        }
        let tradesSorted = this.sortBy (tradesFormatted, 'timestamp');
        let tradesLimited = [];
        let tradeArrayLength = tradesSorted.length;
        let loopStart = 0;
        if (limit) {
            if (tradeArrayLength > limit)
                loopStart = tradeArrayLength - limit;
        }
        for (let j = loopStart; j < tradesSorted.length; j++) {
            tradesLimited.push (tradesSorted[j]);
        }
        return tradesLimited;
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
        if (market['network'] === 'eth') {
            orderAmount = this.toWei (this.amountToPrecision (symbol, amount), 'ether', market['precision']['amount']);
        }
        if ('useSwitcheoToken' in params) {
            useSwitcheoToken = params.useSwitcheoToken;
        }
        if (market['network'] === 'eth' || useSwitcheoToken === undefined) {
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
            'blockchain': market['network'],
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
        let createCancelResponse = await this.createCancelOrder (cancelOrderPayload, params);
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
        if (api === 'private')
            this.checkRequiredCredentials ();
        if (method === 'GET') {
            request += '?' + this.urlencode (query, 'brackets');
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
