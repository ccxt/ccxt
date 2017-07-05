"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {

    var isNode = typeof window === 'undefined';

    //-----------------------------------------------------------------------------

    var capitalize = function capitalize(string) {
        return string.length ? string.charAt(0).toUpperCase() + string.slice(1) : string;
    };

    var keysort = function keysort(object) {
        var result = {};
        Object.keys(object).sort().forEach(function (key) {
            return result[key] = object[key];
        });
        return result;
    };

    var extend = function extend() {
        var _arguments = arguments;

        var result = {};
        for (var i = 0; i < arguments.length; i++) {
            if (_typeof(arguments[i]) === 'object') Object.keys(arguments[i]).forEach(function (key) {
                return result[key] = _arguments[i][key];
            });
        }return result;
    };

    var omit = function omit(object) {
        var result = extend(object);
        for (var i = 1; i < arguments.length; i++) {
            if (typeof arguments[i] === 'string') delete result[arguments[i]];else if (Array.isArray(arguments[i])) for (var k = 0; k < arguments[i].length; k++) {
                delete result[arguments[i][k]];
            }
        }return result;
    };

    var indexBy = function indexBy(array, key) {
        var result = {};
        for (var i = 0; i < array.length; i++) {
            result[array[i][key]] = array[i];
        }return result;
    };

    var flat = function flat(array) {
        return array.reduce(function (acc, cur) {
            return acc.concat(cur);
        }, []);
    };

    var urlencode = function urlencode(object) {
        return Object.keys(object).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(object[key]);
        }).join('&');
    };

    //-----------------------------------------------------------------------------

    if (isNode) {

        var crypto = require('crypto');
        var fetch = require('node-fetch');

        var stringToBinary = function stringToBinary(string) {
            return Buffer.from(string, 'binary');
        };

        var stringToBase64 = function stringToBase64(string) {
            return new Buffer(string).toString('base64');
        };

        var utf16ToBase64 = function utf16ToBase64(string) {
            return stringToBase64(string);
        };

        var base64ToBinary = function base64ToBinary(string) {
            return Buffer.from(string, 'base64');
        };

        var base64ToString = function base64ToString(string) {
            return Buffer.from(string, 'base64').toString();
        };

        var hash = function hash(request) {
            var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'md5';
            var digest = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'hex';

            return crypto.createHash(hash).update(request).digest(digest);
        };

        var hmac = function hmac(request, secret) {
            var hash = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'sha256';
            var digest = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'hex';

            return crypto.createHmac(hash, secret).update(request).digest(digest);
        };
    } else {

        var fetch = function fetch(url, options) {
            var verbose = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


            return new Promise(function (resolve, reject) {

                if (verbose) console.log(url, options);

                var xhr = new XMLHttpRequest();
                var method = options.method || 'GET';

                xhr.open(method, url, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) resolve(xhr.responseText);else throw new Error(method, url, xhr.status, xhr.responseText);
                    }
                };

                if (typeof options.headers != 'undefined') for (var header in options.headers) {
                    xhr.setRequestHeader(header, options.headers[header]);
                }xhr.send(options.body);
            });
        };

        var stringToBinary = function stringToBinary(string) {
            return CryptoJS.enc.Latin1.parse(string);
        };

        var stringToBase64 = function stringToBase64(string) {
            return CryptoJS.enc.Latin1.parse(string).toString(CryptoJS.enc.Base64);
        };

        var utf16ToBase64 = function utf16ToBase64(string) {
            return CryptoJS.enc.Utf16.parse(string).toString(CryptoJS.enc.Base64);
        };

        var base64ToBinary = function base64ToBinary(string) {
            return CryptoJS.enc.Base64.parse(string);
        };

        var base64ToString = function base64ToString(string) {
            return CryptoJS.enc.Base64.parse(string).toString(CryptoJS.enc.Utf8);
        };

        var hash = function hash(request) {
            var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'md5';
            var digest = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'hex';

            var encoding = digest === 'binary' ? 'Latin1' : capitalize(digest);
            return CryptoJS[hash.toUpperCase()](request).toString(CryptoJS.enc[encoding]);
        };

        var hmac = function hmac(request, secret) {
            var hash = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'sha256';
            var digest = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'hex';

            var encoding = digest === 'binary' ? 'Latin1' : capitalize(digest);
            return CryptoJS['Hmac' + hash.toUpperCase()](request, secret).toString(CryptoJS.enc[capitalize(encoding)]);
        };
    }

    var urlencodeBase64 = function urlencodeBase64(base64string) {
        return base64string.replace(/[=]+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
    };

    var jwt = function jwt(request, secret) {
        var alg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'HS256';
        var hash = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'sha256';

        var encodedHeader = urlencodeBase64(stringToBase64(JSON.stringify({ 'alg': alg, 'typ': 'JWT' })));
        var encodedData = urlencodeBase64(stringToBase64(JSON.stringify(request)));
        var token = [encodedHeader, encodedData].join('.');
        var signature = urlencodeBase64(utf16ToBase64(hmac(token, secret, hash, 'utf16')));
        return [token, signature].join('.');
    };

    //-----------------------------------------------------------------------------

    var Market = function Market(config) {
        var _this5 = this;

        this.hash = hash;
        this.hmac = hmac;
        this.jwt = jwt;
        this.stringToBinary = stringToBinary;
        this.stringToBase64 = stringToBase64;
        this.base64ToBinary = base64ToBinary;
        this.urlencode = urlencode;
        this.omit = omit;
        this.extend = extend;
        this.flatten = flat;
        this.indexBy = indexBy;
        this.keysort = keysort;
        this.capitalize = capitalize;

        this.init = function () {
            var _this = this;

            if (isNode) this.nodeVersion = process.version.match(/\d+\.\d+.\d+/)[0];

            if (this.api) Object.keys(this.api).forEach(function (type) {
                Object.keys(_this.api[type]).forEach(function (method) {
                    var urls = _this.api[type][method];

                    var _loop = function _loop() {
                        var url = urls[i].trim();
                        var splitPath = url.split(/[^a-zA-Z0-9]/);

                        var uppercaseMethod = method.toUpperCase();
                        var lowercaseMethod = method.toLowerCase();
                        var camelcaseMethod = capitalize(lowercaseMethod);
                        var camelcaseSuffix = splitPath.map(capitalize).join('');
                        var underscoreSuffix = splitPath.map(function (x) {
                            return x.trim().toLowerCase();
                        }).filter(function (x) {
                            return x.length > 0;
                        }).join('_');

                        if (camelcaseSuffix.indexOf(camelcaseMethod) === 0) camelcaseSuffix = camelcaseSuffix.slice(camelcaseMethod.length);

                        if (underscoreSuffix.indexOf(lowercaseMethod) === 0) underscoreSuffix = underscoreSuffix.slice(lowercaseMethod.length);

                        var camelcase = type + camelcaseMethod + capitalize(camelcaseSuffix);
                        var underscore = type + '_' + lowercaseMethod + '_' + underscoreSuffix;

                        var f = function f(params) {
                            return _this.request(url, type, uppercaseMethod, params);
                        };

                        _this[camelcase] = f;
                        _this[underscore] = f;
                    };

                    for (var i = 0; i < urls.length; i++) {
                        _loop();
                    }
                });
            });
        };

        // this.fetch = function (url, options) {

        //     if (isNode)
        //         options.headers = extend ({
        //             'User-Agent': 'ccxt/0.1.0 (+https://github.com/kroitor/ccxt) Node.js/' + this.nodeVersion + ' (JavaScript)'
        //         }, options.headers)

        //     if (this.verbose)
        //         console.log (this.id, url, options)

        //     return (fetch ((this.cors ? this.cors : '') + url, options)
        //         .then (response => (typeof response === 'string') ? response : response.text ())
        //         .then (response => {
        //             try {
        //                 return JSON.parse (response)
        //             } catch (e) {
        //                 var cloudflareProtection = response.match (/cloudflare/i) ? 'DDoS protection by Cloudflare' : ''
        //                 if (this.verbose)
        //                     console.log (this.id, response, cloudflareProtection, e)
        //                 throw e
        //             }
        //         }))
        // }

        this.fetch = function (url) {
            var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'GET';

            var _this2 = this;

            var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
            var body = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;


            if (isNode) headers = extend({
                'User-Agent': 'ccxt/0.1.0 (+https://github.com/kroitor/ccxt) Node.js/' + this.nodeVersion + ' (JavaScript)'
            }, headers);

            var options = { 'method': method, 'headers': headers, 'body': body };

            if (this.verbose) console.log(this.id, url, options);

            return fetch((this.cors ? this.cors : '') + url, options).then(function (response) {
                return typeof response === 'string' ? response : response.text();
            }).then(function (response) {
                try {
                    return JSON.parse(response);
                } catch (e) {
                    var cloudflareProtection = response.match(/cloudflare/i) ? 'DDoS protection by Cloudflare' : '';
                    if (_this2.verbose) console.log(_this2.id, response, cloudflareProtection, e);
                    throw e;
                }
            });
        };

        this.load_products = this.loadProducts = function () {
            var _this3 = this;

            var reload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (!reload && this.products) return new Promise(function (resolve, reject) {
                return resolve(_this3.products);
            });
            return this.fetchProducts().then(function (products) {
                return _this3.products = indexBy(products, 'symbol');
            });
        };

        this.fetch_products = this.fetchProducts = function () {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                return resolve(_this4.products);
            });
        };

        this.commonCurrencyCode = function (currency) {
            return currency === 'XBT' ? 'BTC' : currency;
        };

        this.product = function (product) {
            return typeof product === 'string' && typeof this.products != 'undefined' && typeof this.products[product] != 'undefined' ? this.products[product] : product;
        };

        this.product_id = this.productId = function (product) {
            return this.product(product).id || product;
        };

        this.symbol = function (product) {
            return this.product(product).symbol || product;
        };

        this.extract_params = this.extractParams = function (string) {
            var re = /{([a-zA-Z0-9_]+?)}/g;
            var matches = [];
            var match = void 0;
            while (match = re.exec(string)) {
                matches.push(match[1]);
            }return matches;
        };

        this.implode_params = this.implodeParams = function (string, params) {
            for (var property in params) {
                string = string.replace('{' + property + '}', params[property]);
            }return string;
        };

        this.buy = function (product, amount) {
            var price = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            return this.order(product, 'buy', amount, price, params);
        };

        this.sell = function (product, amount) {
            var price = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            return this.order(product, 'sell', amount, price, params);
        };

        this.trade = this.order = function (product, side, amount) {
            var price = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
            var params = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

            var type = typeof price == 'undefined' ? 'market' : 'limit';
            return this.createOrder(product, type, side, amount, price, params);
        };

        this.create_buy_order = this.createBuyOrder = function (product, type, amount) {
            var price = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
            var params = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

            return this.createOrder(product, type, 'buy', amount, price, params);
        };

        this.create_sell_order = this.createSellOrder = function (product, type, amount) {
            var price = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
            var params = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

            return this.createOrder(product, type, 'sell', amount, price, params);
        };

        this.create_limit_buy_order = this.createLimitBuyOrder = function (product, amount, price) {
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            return this.createLimitOrder(product, 'buy', amount, price, params);
        };

        this.create_limit_sell_order = this.createLimitSellOrder = function (product, amount, price) {
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            return this.createLimitOrder(product, 'sell', amount, price, params);
        };

        this.create_market_buy_order = this.createMarketBuyOrder = function (product, amount) {
            var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            return this.createMarketOrder(product, 'buy', amount, params);
        };

        this.create_market_sell_order = this.createMarketSellOrder = function (product, amount) {
            var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            return this.createMarketOrder(product, 'sell', amount, params);
        };

        this.create_limit_order = this.createLimitOrder = function (product, side, amount, price) {
            var params = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

            return this.createOrder(product, 'limit', side, amount, price, params);
        };

        this.create_market_order = this.createMarketOrder = function (product, side, amount) {
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            return this.createOrder(product, 'market', side, amount, undefined, params);
        };

        this.iso8601 = function (timestamp) {
            return new Date(timestamp).toISOString();
        };
        this.parse8601 = Date.parse;
        this.seconds = function () {
            return Math.floor(_this5.milliseconds() / 1000);
        };
        this.microseconds = function () {
            return Math.floor(_this5.milliseconds() * 1000);
        };
        this.milliseconds = Date.now;
        this.nonce = this.seconds;
        this.id = undefined;
        this.rateLimit = 2000;
        this.timeout = undefined;
        this.yyyymmddhhmmss = function (timestamp) {
            var date = new Date(timestamp);
            var yyyy = date.getUTCFullYear();
            var MM = date.getUTCMonth();
            var dd = date.getUTCDay();
            var hh = date.getUTCHours();
            var mm = date.getUTCMinutes();
            var ss = date.getUTCSeconds();
            MM = MM < 10 ? '0' + MM : MM;
            dd = dd < 10 ? '0' + dd : dd;
            hh = hh < 10 ? '0' + hh : hh;
            mm = mm < 10 ? '0' + mm : mm;
            ss = ss < 10 ? '0' + ss : ss;
            return yyyy + '-' + MM + '-' + dd + ' ' + hh + ':' + mm + ':' + ss;
        };

        for (var property in config) {
            this[property] = config[property];
        }this.fetch_balance = this.fetchBalance;
        this.fetch_order_book = this.fetchOrderBook;
        this.fetch_ticker = this.fetchTicker;
        this.fetch_trades = this.fetchTrades;

        this.verbose = this.log || this.debug || this.verbosity == 1 || this.verbose;

        this.init();
    };

    //=============================================================================

    var _1broker = {

        'id': '_1broker',
        'name': '1Broker',
        'countries': 'US',
        'rateLimit': 2000,
        'version': 'v2',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766021-420bd9fc-5ecb-11e7-8ed6-56d0081efed2.jpg',
            'api': 'https://1broker.com/api',
            'www': 'https://1broker.com',
            'doc': 'https://1broker.com/?c=en/content/api-documentation'
        },
        'api': {
            'private': {
                'get': ['market/bars', 'market/categories', 'market/details', 'market/list', 'market/quotes', 'market/ticks', 'order/cancel', 'order/create', 'order/open', 'position/close', 'position/close_cancel', 'position/edit', 'position/history', 'position/open', 'position/shared/get', 'social/profile_statistics', 'social/profile_trades', 'user/bitcoin_deposit_address', 'user/details', 'user/overview', 'user/quota_status', 'user/transaction_log']
            }
        },

        fetchCategories: function fetchCategories() {
            var categories,
                _this6 = this;

            return Promise.resolve().then(function () {
                return _this6.privateGetMarketCategories();
            }).then(function (_resp) {
                categories = _resp;

                return categories['response'];
            });
        },
        fetchProducts: function fetchProducts() {
            function _recursive() {
                var _this8 = this;

                if (c < categories.length) {
                    return Promise.resolve().then(function () {
                        category = categories[c];
                        return _this8.privateGetMarketList({
                            'category': category.toLowerCase()
                        });
                    }).then(function (_resp) {
                        products = _resp;

                        for (p = 0; p < products['response'].length; p++) {
                            product = products['response'][p];

                            if (category == 'FOREX' || category == 'CRYPTO') {
                                id = product['symbol'];
                                symbol = product['name'];
                                _symbol$split = symbol.split('/');
                                _symbol$split2 = _slicedToArray(_symbol$split, 2);
                                base = _symbol$split2[0];
                                quote = _symbol$split2[1];

                                result.push({
                                    'id': id,
                                    'symbol': symbol,
                                    'base': base,
                                    'quote': quote,
                                    'info': product
                                });
                            } else {
                                _id = product['symbol'];
                                _symbol = product['symbol'];
                                name = product['name'];
                                type = product['type'].toLowerCase();

                                result.push({
                                    'id': _id,
                                    'symbol': _symbol,
                                    'name': name,
                                    'type': type,
                                    'info': product
                                });
                            }
                        }
                        c++;
                        return _recursive();
                    });
                }
            }

            var categories,
                result,
                c,
                category,
                products,
                p,
                product,
                id,
                symbol,
                _symbol$split,
                _symbol$split2,
                base,
                quote,
                _id,
                _symbol,
                name,
                type,
                _this7 = this;

            return Promise.resolve().then(function () {
                return _this7.fetchCategories();
            }).then(function (_resp) {
                categories = _resp;
                result = [];
                c = 0;
                return _recursive();
            }).then(function () {
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privateGetUserOverview();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                orderbook,
                timestamp,
                bidPrice,
                askPrice,
                bid,
                ask,
                _this11 = this;

            return Promise.resolve().then(function () {
                return _this11.privateGetMarketQuotes({
                    'symbols': _this11.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                orderbook = response['response'][0];
                timestamp = _this11.parse8601(orderbook['updated']);
                bidPrice = parseFloat(orderbook['bid']);
                askPrice = parseFloat(orderbook['ask']);
                bid = [bidPrice, undefined];
                ask = [askPrice, undefined];

                return {
                    'timestamp': timestamp,
                    'datetime': _this11.iso8601(timestamp),
                    'bids': [bid],
                    'asks': [ask]
                };
            });
        },
        fetchTicker: function fetchTicker(product) {
            var result,
                orderbook,
                ticker,
                timestamp,
                _this12 = this;

            return Promise.resolve().then(function () {
                return _this12.privateGetMarketBars({
                    'symbol': _this12.productId(product),
                    'resolution': 60,
                    'limit': 1
                });
            }).then(function (_resp) {
                result = _resp;
                return _this12.fetchOrderBook(product);
            }).then(function (_resp) {
                orderbook = _resp;
                ticker = result['response'][0];
                timestamp = _this12.parse8601(ticker['date']);

                return {
                    'timestamp': timestamp,
                    'datetime': _this12.iso8601(timestamp),
                    'high': parseFloat(ticker['h']),
                    'low': parseFloat(ticker['l']),
                    'bid': orderbook['bids'][0]['price'],
                    'ask': orderbook['asks'][0]['price'],
                    'vwap': undefined,
                    'open': parseFloat(ticker['o']),
                    'close': parseFloat(ticker['c']),
                    'first': undefined,
                    'last': undefined,
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': undefined
                };
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'symbol': this.productId(product),
                'margin': amount,
                'direction': side == 'sell' ? 'short' : 'long',
                'leverage': 1,
                'type': side
            };
            if (type == 'limit') order['price'] = price;else order['type'] += '_market';
            return this.privateGetOrderCreate(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/' + path + '.php';
            var query = this.extend({ 'token': this.apiKey }, params);
            url += '?' + this.urlencode(query);
            return this.fetch(url, method);
        }
    };

    //-----------------------------------------------------------------------------

    var cryptocapital = {

        'comment': 'Crypto Capital API',
        'api': {
            'public': {
                'get': ['stats', 'historical-prices', 'order-book', 'transactions']
            },
            'private': {
                'post': ['balances-and-info', 'open-orders', 'user-transactions', 'btc-deposit-address/get', 'btc-deposit-address/new', 'deposits/get', 'withdrawals/get', 'orders/new', 'orders/edit', 'orders/cancel', 'orders/status', 'withdrawals/new']
            }
        },

        fetchBalance: function fetchBalance() {
            return this.privatePostBalancesAndInfo();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                orderbook,
                timestamp,
                result,
                sides,
                keys,
                k,
                key,
                side,
                orders,
                i,
                order,
                _timestamp,
                price,
                amount,
                _this13 = this;

            return Promise.resolve().then(function () {
                return _this13.publicGetOrderBook({
                    'currency': _this13.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                orderbook = response['order-book'];
                timestamp = _this13.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this13.iso8601(timestamp)
                };
                sides = { 'bids': 'bid', 'asks': 'ask' };
                keys = Object.keys(sides);

                for (k = 0; k < keys.length; k++) {
                    key = keys[k];
                    side = sides[key];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        _timestamp = parseInt(order['timestamp']) * 1000;
                        price = parseFloat(order['price']);
                        amount = parseFloat(order['order_amount']);

                        result[key].push([price, amount, _timestamp]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this14 = this;

            return Promise.resolve().then(function () {
                return _this14.publicGetStats({
                    'currency': _this14.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['stats'];
                timestamp = _this14.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this14.iso8601(timestamp),
                    'high': parseFloat(ticker['max']),
                    'low': parseFloat(ticker['min']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': undefined,
                    'open': parseFloat(ticker['open']),
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last_price']),
                    'change': parseFloat(ticker['daily_change']),
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['total_btc_traded'])
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTransactions({
                'currency': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'side': side,
                'type': type,
                'currency': this.productId(product),
                'amount': amount
            };
            if (type == 'limit') order['limit_price'] = price;
            return this.privatePostOrdersNew(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + path;
            if (type == 'public') {
                if (Object.keys(params).length) url += '?' + this.urlencode(params);
            } else {
                var query = this.extend({
                    'api_key': this.apiKey,
                    'nonce': this.nonce()
                }, params);
                query['signature'] = this.hmac(JSON.stringify(query), this.secret);
                body = JSON.stringify(query);
                headers = { 'Content-Type': 'application/json' };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var _1btcxe = extend(cryptocapital, {

        'id': '_1btcxe',
        'name': '1BTCXE',
        'countries': 'PA', // Panama
        'comment': 'Crypto Capital API',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766049-2b294408-5ecc-11e7-85cc-adaff013dc1a.jpg',
            'api': 'https://1btcxe.com/api',
            'www': 'https://1btcxe.com',
            'doc': 'https://1btcxe.com/api-docs.php'
        },
        'products': {
            'BTC/USD': { 'id': 'USD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
            'BTC/EUR': { 'id': 'EUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
            'BTC/CNY': { 'id': 'CNY', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY' },
            'BTC/RUB': { 'id': 'RUB', 'symbol': 'BTC/RUB', 'base': 'BTC', 'quote': 'RUB' },
            'BTC/CHF': { 'id': 'CHF', 'symbol': 'BTC/CHF', 'base': 'BTC', 'quote': 'CHF' },
            'BTC/JPY': { 'id': 'JPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY' },
            'BTC/GBP': { 'id': 'GBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP' },
            'BTC/CAD': { 'id': 'CAD', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD' },
            'BTC/AUD': { 'id': 'AUD', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD' },
            'BTC/AED': { 'id': 'AED', 'symbol': 'BTC/AED', 'base': 'BTC', 'quote': 'AED' },
            'BTC/BGN': { 'id': 'BGN', 'symbol': 'BTC/BGN', 'base': 'BTC', 'quote': 'BGN' },
            'BTC/CZK': { 'id': 'CZK', 'symbol': 'BTC/CZK', 'base': 'BTC', 'quote': 'CZK' },
            'BTC/DKK': { 'id': 'DKK', 'symbol': 'BTC/DKK', 'base': 'BTC', 'quote': 'DKK' },
            'BTC/HKD': { 'id': 'HKD', 'symbol': 'BTC/HKD', 'base': 'BTC', 'quote': 'HKD' },
            'BTC/HRK': { 'id': 'HRK', 'symbol': 'BTC/HRK', 'base': 'BTC', 'quote': 'HRK' },
            'BTC/HUF': { 'id': 'HUF', 'symbol': 'BTC/HUF', 'base': 'BTC', 'quote': 'HUF' },
            'BTC/ILS': { 'id': 'ILS', 'symbol': 'BTC/ILS', 'base': 'BTC', 'quote': 'ILS' },
            'BTC/INR': { 'id': 'INR', 'symbol': 'BTC/INR', 'base': 'BTC', 'quote': 'INR' },
            'BTC/MUR': { 'id': 'MUR', 'symbol': 'BTC/MUR', 'base': 'BTC', 'quote': 'MUR' },
            'BTC/MXN': { 'id': 'MXN', 'symbol': 'BTC/MXN', 'base': 'BTC', 'quote': 'MXN' },
            'BTC/NOK': { 'id': 'NOK', 'symbol': 'BTC/NOK', 'base': 'BTC', 'quote': 'NOK' },
            'BTC/NZD': { 'id': 'NZD', 'symbol': 'BTC/NZD', 'base': 'BTC', 'quote': 'NZD' },
            'BTC/PLN': { 'id': 'PLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN' },
            'BTC/RON': { 'id': 'RON', 'symbol': 'BTC/RON', 'base': 'BTC', 'quote': 'RON' },
            'BTC/SEK': { 'id': 'SEK', 'symbol': 'BTC/SEK', 'base': 'BTC', 'quote': 'SEK' },
            'BTC/SGD': { 'id': 'SGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' },
            'BTC/THB': { 'id': 'THB', 'symbol': 'BTC/THB', 'base': 'BTC', 'quote': 'THB' },
            'BTC/TRY': { 'id': 'TRY', 'symbol': 'BTC/TRY', 'base': 'BTC', 'quote': 'TRY' },
            'BTC/ZAR': { 'id': 'ZAR', 'symbol': 'BTC/ZAR', 'base': 'BTC', 'quote': 'ZAR' }
        }
    });

    //-----------------------------------------------------------------------------

    var anxpro = {

        'id': 'anxpro',
        'name': 'ANXPro',
        'countries': ['JP', 'SG', 'HK', 'NZ'],
        'version': '2',
        'rateLimit': 2000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg',
            'api': 'https://anxpro.com/api',
            'www': 'https://anxpro.com',
            'doc': 'https://anxpro.com/pages/api'
        },
        'api': {
            'public': {
                'get': ['{currency_pair}/money/ticker', '{currency_pair}/money/depth/full', '{currency_pair}/money/trade/fetch']
            },
            'private': {
                'post': ['{currency_pair}/money/order/add', '{currency_pair}/money/order/cancel', '{currency_pair}/money/order/quote', '{currency_pair}/money/order/result', '{currency_pair}/money/orders', 'money/{currency}/address', 'money/{currency}/send_simple', 'money/info', 'money/trade/list', 'money/wallet/history']
            }
        },
        'products': {
            'BTC/USD': { 'id': 'BTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
            'BTC/HKD': { 'id': 'BTCHKD', 'symbol': 'BTC/HKD', 'base': 'BTC', 'quote': 'HKD' },
            'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
            'BTC/CAD': { 'id': 'BTCCAD', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD' },
            'BTC/AUD': { 'id': 'BTCAUD', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD' },
            'BTC/SGD': { 'id': 'BTCSGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' },
            'BTC/JPY': { 'id': 'BTCJPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY' },
            'BTC/GBP': { 'id': 'BTCGBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP' },
            'BTC/NZD': { 'id': 'BTCNZD', 'symbol': 'BTC/NZD', 'base': 'BTC', 'quote': 'NZD' },
            'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
            'DOGE/BTC': { 'id': 'DOGEBTC', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC' },
            'STR/BTC': { 'id': 'STRBTC', 'symbol': 'STR/BTC', 'base': 'STR', 'quote': 'BTC' },
            'XRP/BTC': { 'id': 'XRPBTC', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC' }
        },

        fetchBalance: function fetchBalance() {
            return this.privatePostMoneyInfo();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this15 = this;

            return Promise.resolve().then(function () {
                return _this15.publicGetCurrencyPairMoneyDepthFull({
                    'currency_pair': _this15.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                orderbook = response['data'];
                timestamp = parseInt(orderbook['dataUpdateTime']) / 1000;
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this15.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order['price']);
                        amount = parseFloat(order['amount']);

                        result[side].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this16 = this;

            return Promise.resolve().then(function () {
                return _this16.publicGetCurrencyPairMoneyTicker({
                    'currency_pair': _this16.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['data'];
                timestamp = parseInt(ticker['dataUpdateTime'] / 1000);

                return {
                    'timestamp': timestamp,
                    'datetime': _this16.iso8601(timestamp),
                    'high': parseFloat(ticker['high']['value']),
                    'low': parseFloat(ticker['low']['value']),
                    'bid': parseFloat(ticker['buy']['value']),
                    'ask': parseFloat(ticker['sell'])['value'],
                    'vwap': parseFloat(ticker['vwap']['value']),
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']['value']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': parseFloat(ticker['avg']['value']),
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['vol']['value'])
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetCurrencyPairMoneyTradeFetch({
                'currency_pair': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'currency_pair': this.productId(product),
                'amount_int': amount,
                'type': side
            };
            if (type == 'limit') order['price_int'] = price;
            return this.privatePostCurrencyPairOrderAdd(this.extend(order, params));
        },
        nonce: function nonce() {
            return this.milliseconds();
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var request = this.implodeParams(path, params);
            var query = this.omit(params, this.extractParams(path));
            var url = this.urls['api'] + '/' + this.version + '/' + request;
            if (type == 'public') {
                if (Object.keys(query).length) url += '?' + this.urlencode(query);
            } else {
                var nonce = this.nonce();
                body = this.urlencode(this.extend({ 'nonce': nonce }, query));
                var secret = this.base64ToBinary(this.secret);
                var auth = request + "\0" + body;
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Rest-Key': this.apiKey,
                    'Rest-Sign': this.hmac(auth, secret, 'sha512', 'base64')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var bit2c = {

        'id': 'bit2c',
        'name': 'Bit2C',
        'countries': 'IL', // Israel
        'rateLimit': 3000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766119-3593220e-5ece-11e7-8b3a-5a041f6bcc3f.jpg',
            'api': 'https://www.bit2c.co.il',
            'www': 'https://www.bit2c.co.il',
            'doc': ['https://www.bit2c.co.il/home/api', 'https://github.com/OferE/bit2c']
        },
        'api': {
            'public': {
                'get': ['Exchanges/{pair}/Ticker', 'Exchanges/{pair}/orderbook', 'Exchanges/{pair}/trades']
            },
            'private': {
                'post': ['Account/Balance', 'Account/Balance/v2', 'Merchant/CreateCheckout', 'Order/AccountHistory', 'Order/AddCoinFundsRequest', 'Order/AddFund', 'Order/AddOrder', 'Order/AddOrderMarketPriceBuy', 'Order/AddOrderMarketPriceSell', 'Order/CancelOrder', 'Order/MyOrders', 'Payment/GetMyId', 'Payment/Send']
            }
        },
        'products': {
            'BTC/NIS': { 'id': 'BtcNis', 'symbol': 'BTC/NIS', 'base': 'BTC', 'quote': 'NIS' },
            'LTC/BTC': { 'id': 'LtcBtc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
            'LTC/NIS': { 'id': 'LtcNis', 'symbol': 'LTC/NIS', 'base': 'LTC', 'quote': 'NIS' }
        },

        fetchBalance: function fetchBalance() {
            return this.privatePostAccountBalanceV2();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _timestamp2,
                _this17 = this;

            return Promise.resolve().then(function () {
                return _this17.publicGetExchangesPairOrderbook({
                    'pair': _this17.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this17.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this17.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = order[0];
                        amount = order[1];
                        _timestamp2 = order[2] * 1000;

                        result[side].push([price, amount, _timestamp2]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this18 = this;

            return Promise.resolve().then(function () {
                return _this18.publicGetExchangesPairTicker({
                    'pair': _this18.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this18.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this18.iso8601(timestamp),
                    'high': parseFloat(ticker['h']),
                    'low': parseFloat(ticker['l']),
                    'bid': undefined,
                    'ask': undefined,
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['ll']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': parseFloat(ticker['av']),
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['a'])
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetExchangesPairTrades({
                'pair': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var method = 'privatePostOrderAddOrder';
            var order = {
                'Amount': amount,
                'Pair': this.productId(product)
            };
            if (type == 'market') {
                method += 'MarketPrice' + this.capitalize(side);
            } else {
                order['Price'] = price;
                order['Total'] = amount * price;
                order['IsBid'] = side == 'buy';
            }
            return this[method](this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.implodeParams(path, params);
            if (type == 'public') {
                url += '.json';
            } else {
                var nonce = this.nonce();
                var query = this.extend({ 'nonce': nonce }, params);
                body = this.urlencode(query);
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length,
                    'key': this.apiKey,
                    'sign': this.hmac(body, this.secret, 'sha512', 'base64')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var bitbay = {

        'id': 'bitbay',
        'name': 'BitBay',
        'countries': ['PL', 'EU'], // Poland
        'rateLimit': 1000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg',
            'www': 'https://bitbay.net',
            'api': {
                'public': 'https://bitbay.net/API/Public',
                'private': 'https://bitbay.net/API/Trading/tradingApi.php'
            },
            'doc': ['https://bitbay.net/public-api', 'https://bitbay.net/account/tab-api', 'https://github.com/BitBayNet/API']
        },
        'api': {
            'public': {
                'get': ['{id}/all', '{id}/market', '{id}/orderbook', '{id}/ticker', '{id}/trades']
            },
            'private': {
                'post': ['info', 'trade', 'cancel', 'orderbook', 'orders', 'transfer', 'withdraw', 'history', 'transactions']
            }
        },
        'products': {
            'BTC/USD': { 'id': 'BTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
            'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
            'BTC/PLN': { 'id': 'BTCPLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN' },
            'LTC/USD': { 'id': 'LTCUSD', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD' },
            'LTC/EUR': { 'id': 'LTCEUR', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR' },
            'LTC/PLN': { 'id': 'LTCPLN', 'symbol': 'LTC/PLN', 'base': 'LTC', 'quote': 'PLN' },
            'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
            'ETH/USD': { 'id': 'ETHUSD', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD' },
            'ETH/EUR': { 'id': 'ETHEUR', 'symbol': 'ETH/EUR', 'base': 'ETH', 'quote': 'EUR' },
            'ETH/PLN': { 'id': 'ETHPLN', 'symbol': 'ETH/PLN', 'base': 'ETH', 'quote': 'PLN' },
            'ETH/BTC': { 'id': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
            'LSK/USD': { 'id': 'LSKUSD', 'symbol': 'LSK/USD', 'base': 'LSK', 'quote': 'USD' },
            'LSK/EUR': { 'id': 'LSKEUR', 'symbol': 'LSK/EUR', 'base': 'LSK', 'quote': 'EUR' },
            'LSK/PLN': { 'id': 'LSKPLN', 'symbol': 'LSK/PLN', 'base': 'LSK', 'quote': 'PLN' },
            'LSK/BTC': { 'id': 'LSKBTC', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC' }
        },

        fetchBalance: function fetchBalance() {
            return this.privatePostInfo();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                _this19 = this;

            return Promise.resolve().then(function () {
                return _this19.publicGetIdOrderbook({
                    'id': _this19.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this19.milliseconds();
                result = {
                    'bids': orderbook['bids'],
                    'asks': orderbook['asks'],
                    'timestamp': timestamp,
                    'datetime': _this19.iso8601(timestamp)
                };

                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this20 = this;

            return Promise.resolve().then(function () {
                return _this20.publicGetIdTicker({
                    'id': _this20.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this20.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this20.iso8601(timestamp),
                    'high': parseFloat(ticker['max']),
                    'low': parseFloat(ticker['min']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': parseFloat(ticker['vwap']),
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': parseFloat(ticker['average']),
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetIdTrades({
                'id': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var p = this.product(product);
            return this.privatePostTrade(this.extend({
                'type': side,
                'currency': p['base'],
                'amount': amount,
                'payment_currency': p['quote'],
                'rate': price
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'][type];
            if (type == 'public') {
                url += '/' + this.implodeParams(path, params) + '.json';
            } else {
                body = this.urlencode(this.extend({
                    'method': path,
                    'moment': this.nonce()
                }, params));
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length,
                    'API-Key': this.apiKey,
                    'API-Hash': this.hmac(body, this.secret, 'sha512')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var bitbays = {

        'id': 'bitbays',
        'name': 'BitBays',
        'countries': ['CN', 'GB', 'HK', 'AU', 'CA'],
        'rateLimit': 2000,
        'version': 'v1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27808599-983687d2-6051-11e7-8d95-80dfcbe5cbb4.jpg',
            'api': 'https://bitbays.com/api',
            'www': 'https://bitbays.com',
            'doc': 'https://bitbays.com/help/api/'
        },
        'api': {
            'public': {
                'get': ['ticker', 'trades', 'depth']
            },
            'private': {
                'post': ['cancel', 'info', 'orders', 'order', 'transactions', 'trade']
            }
        },
        'products': {
            'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
            'BTC/CNY': { 'id': 'btc_cny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY' },
            'ODS/BTC': { 'id': 'ods_btc', 'symbol': 'ODS/BTC', 'base': 'ODS', 'quote': 'BTC' },
            'LSK/BTC': { 'id': 'lsk_btc', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC' },
            'LSK/CNY': { 'id': 'lsk_cny', 'symbol': 'LSK/CNY', 'base': 'LSK', 'quote': 'CNY' }
        },

        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this21 = this;

            return Promise.resolve().then(function () {
                return _this21.publicGetDepth({
                    'market': _this21.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                orderbook = response['result'];
                timestamp = _this21.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this21.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order[0]);
                        amount = parseFloat(order[1]);

                        result[side].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this22 = this;

            return Promise.resolve().then(function () {
                return _this22.publicGetTicker({
                    'market': _this22.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['result'];
                timestamp = _this22.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this22.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['buy']),
                    'ask': parseFloat(ticker['sell']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['vol']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTrades({
                'market': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'market': this.productId(product),
                'op': side,
                'amount': amount
            };
            if (type == 'market') {
                order['order_type'] = 1;
                order['price'] = price;
            } else {
                order['order_type'] = 0;
            }
            return this.privatePostTrade(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/' + path;
            if (type == 'public') {
                if (Object.keys(params).length) url += '?' + this.urlencode(params);
            } else {
                var nonce = this.nonce();
                body = this.urlencode(this.extend({
                    'nonce': nonce
                }, params));
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length,
                    'Key': this.apiKey,
                    'Sign': this.hmac(body, this.secret, 'sha512')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var bitcoincoid = {

        'id': 'bitcoincoid',
        'name': 'Bitcoin.co.id',
        'countries': 'ID', // Indonesia
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766138-043c7786-5ecf-11e7-882b-809c14f38b53.jpg',
            'api': {
                'public': 'https://vip.bitcoin.co.id/api',
                'private': 'https://vip.bitcoin.co.id/tapi'
            },
            'www': 'https://www.bitcoin.co.id',
            'doc': ['https://vip.bitcoin.co.id/trade_api', 'https://vip.bitcoin.co.id/downloads/BITCOINCOID-API-DOCUMENTATION.pdf']
        },
        'api': {
            'public': {
                'get': ['{pair}/ticker', '{pair}/trades', '{pair}/depth']
            },
            'private': {
                'post': ['getInfo', 'transHistory', 'trade', 'tradeHistory', 'openOrders', 'cancelOrder']
            }
        },
        'products': {
            'BTC/IDR': { 'id': 'btc_idr', 'symbol': 'BTC/IDR', 'base': 'BTC', 'quote': 'IDR', 'baseId': 'btc', 'quoteId': 'idr' },
            'BTS/BTC': { 'id': 'bts_btc', 'symbol': 'BTS/BTC', 'base': 'BTS', 'quote': 'BTC', 'baseId': 'bts', 'quoteId': 'btc' },
            'DASH/BTC': { 'id': 'drk_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC', 'baseId': 'drk', 'quoteId': 'btc' },
            'DOGE/BTC': { 'id': 'doge_btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC', 'baseId': 'doge', 'quoteId': 'btc' },
            'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'eth', 'quoteId': 'btc' },
            'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc' },
            'NXT/BTC': { 'id': 'nxt_btc', 'symbol': 'NXT/BTC', 'base': 'NXT', 'quote': 'BTC', 'baseId': 'nxt', 'quoteId': 'btc' },
            'STR/BTC': { 'id': 'str_btc', 'symbol': 'STR/BTC', 'base': 'STR', 'quote': 'BTC', 'baseId': 'str', 'quoteId': 'btc' },
            'NEM/BTC': { 'id': 'nem_btc', 'symbol': 'NEM/BTC', 'base': 'NEM', 'quote': 'BTC', 'baseId': 'nem', 'quoteId': 'btc' },
            'XRP/BTC': { 'id': 'xrp_btc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'baseId': 'xrp', 'quoteId': 'btc' }
        },

        fetchBalance: function fetchBalance() {
            return this.privatePostGetInfo();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                sides,
                keys,
                k,
                key,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this23 = this;

            return Promise.resolve().then(function () {
                return _this23.publicGetPairDepth({
                    'pair': _this23.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this23.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this23.iso8601(timestamp)
                };
                sides = { 'bids': 'buy', 'asks': 'sell' };
                keys = Object.keys(sides);

                for (k = 0; k < keys.length; k++) {
                    key = keys[k];
                    side = sides[key];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order[0]);
                        amount = parseFloat(order[1]);

                        result[key].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var pair,
                response,
                ticker,
                timestamp,
                baseVolume,
                quoteVolume,
                _this24 = this;

            return Promise.resolve().then(function () {
                pair = _this24.product(product);
                return _this24.publicGetPairTicker({
                    'pair': pair['id']
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['ticker'];
                timestamp = parseFloat(ticker['server_time']) * 1000;
                baseVolume = 'vol_' + pair['baseId'].toLowerCase();
                quoteVolume = 'vol_' + pair['quoteId'].toLowerCase();

                return {
                    'timestamp': timestamp,
                    'datetime': _this24.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['buy']),
                    'ask': parseFloat(ticker['sell']),
                    'vwap': parseFloat(ticker['vwap']),
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': parseFloat(ticker['average']),
                    'baseVolume': parseFloat(ticker[baseVolume]),
                    'quoteVolume': parseFloat(ticker[quoteVolume]),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetPairTrades({
                'pair': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var p = this.product(product);
            var order = {
                'pair': p['id'],
                'type': side,
                'price': price
            };
            var base = p['base'].toLowerCase();
            order[base] = amount;
            return this.privatePostTrade(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'][type];
            if (type == 'public') {
                url += '/' + this.implodeParams(path, params);
            } else {
                body = this.urlencode(this.extend({
                    'method': path,
                    'nonce': this.nonce()
                }, params));
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length,
                    'Key': this.apiKey,
                    'Sign': this.hmac(body, this.secret, 'sha512')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var bitfinex = {

        'id': 'bitfinex',
        'name': 'Bitfinex',
        'countries': 'US',
        'version': 'v1',
        'rateLimit': 2000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
            'api': 'https://api.bitfinex.com',
            'www': 'https://www.bitfinex.com',
            'doc': ['https://bitfinex.readme.io/v1/docs', 'https://bitfinex.readme.io/v2/docs', 'https://github.com/bitfinexcom/bitfinex-api-node']
        },
        'api': {
            'public': {
                'get': ['book/{symbol}', 'candles/{symbol}', 'lendbook/{currency}', 'lends/{currency}', 'pubticker/{symbol}', 'stats/{symbol}', 'symbols', 'symbols_details', 'today', 'trades/{symbol}']
            },
            'private': {
                'post': ['account_infos', 'balances', 'basket_manage', 'credits', 'deposit/new', 'funding/close', 'history', 'history/movements', 'key_info', 'margin_infos', 'mytrades', 'offer/cancel', 'offer/new', 'offer/status', 'offers', 'order/cancel', 'order/cancel/all', 'order/cancel/multi', 'order/cancel/replace', 'order/new', 'order/new/multi', 'order/status', 'orders', 'position/claim', 'positions', 'summary', 'taken_funds', 'total_taken_funds', 'transfer', 'unused_taken_funds', 'withdraw']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                p,
                product,
                id,
                base,
                quote,
                symbol,
                _this25 = this;

            return Promise.resolve().then(function () {
                return _this25.publicGetSymbolsDetails();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products.length; p++) {
                    product = products[p];
                    id = product['pair'].toUpperCase();
                    base = id.slice(0, 3);
                    quote = id.slice(3, 6);
                    symbol = base + '/' + quote;

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privatePostBalances();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _timestamp3,
                _this26 = this;

            return Promise.resolve().then(function () {
                return _this26.publicGetBookSymbol({
                    'symbol': _this26.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this26.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this26.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order['price']);
                        amount = parseFloat(order['amount']);
                        _timestamp3 = parseInt(parseFloat(order['timestamp']));

                        result[side].push([price, amount, _timestamp3]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this27 = this;

            return Promise.resolve().then(function () {
                return _this27.publicGetPubtickerSymbol({
                    'symbol': _this27.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = parseFloat(ticker['timestamp']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this27.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last_price']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': parseFloat(ticker['mid']),
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTradesSymbol({
                'symbol': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            return this.privatePostOrderNew(this.extend({
                'symbol': this.productId(product),
                'amount': amount.toString(),
                'price': price.toString(),
                'side': side,
                'type': 'exchange ' + type,
                'ocoorder': false,
                'buy_price_oco': 0,
                'sell_price_oco': 0
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var request = '/' + this.version + '/' + this.implodeParams(path, params);
            var query = this.omit(params, this.extractParams(path));
            var url = this.urls['api'] + request;
            if (type == 'public') {
                if (Object.keys(query).length) url += '?' + this.urlencode(query);
            } else {
                var nonce = this.nonce();
                query = this.extend({
                    'nonce': nonce.toString(),
                    'request': request
                }, query);
                var payload = this.stringToBase64(JSON.stringify(query));
                headers = {
                    'X-BFX-APIKEY': this.apiKey,
                    'X-BFX-PAYLOAD': payload,
                    'X-BFX-SIGNATURE': this.hmac(payload, this.secret, 'sha384')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var bitlish = {

        'id': 'bitlish',
        'name': 'bitlish',
        'countries': ['GB', 'EU', 'RU'],
        'rateLimit': 2000,
        'version': 'v1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766275-dcfc6c30-5ed3-11e7-839d-00a846385d0b.jpg',
            'api': 'https://bitlish.com/api',
            'www': 'https://bitlish.com',
            'doc': 'https://bitlish.com/api'
        },
        'api': {
            'public': {
                'get': ['instruments', 'ohlcv', 'pairs', 'tickers', 'trades_depth', 'trades_history']
            },
            'private': {
                'post': ['accounts_operations', 'balance', 'cancel_trade', 'cancel_trades_by_ids', 'cancel_all_trades', 'create_bcode', 'create_template_wallet', 'create_trade', 'deposit', 'list_accounts_operations_from_ts', 'list_active_trades', 'list_bcodes', 'list_my_matches_from_ts', 'list_my_trades', 'list_my_trads_from_ts', 'list_payment_methods', 'list_payments', 'redeem_code', 'resign', 'signin', 'signout', 'trade_details', 'trade_options', 'withdraw', 'withdraw_by_id']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                keys,
                p,
                product,
                id,
                symbol,
                _symbol$split3,
                _symbol$split4,
                base,
                quote,
                _this28 = this;

            return Promise.resolve().then(function () {
                return _this28.publicGetPairs();
            }).then(function (_resp) {
                products = _resp;
                result = [];
                keys = Object.keys(products);

                for (p = 0; p < keys.length; p++) {
                    product = products[keys[p]];
                    id = product['id'];
                    symbol = product['name'];
                    _symbol$split3 = symbol.split('/');
                    _symbol$split4 = _slicedToArray(_symbol$split3, 2);
                    base = _symbol$split4[0];
                    quote = _symbol$split4[1];

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                tickers,
                ticker,
                timestamp,
                _this29 = this;

            return Promise.resolve().then(function () {
                p = _this29.product(product);
                return _this29.publicGetTickers();
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers[p['id']];
                timestamp = _this29.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this29.iso8601(timestamp),
                    'high': parseFloat(ticker['max']),
                    'low': parseFloat(ticker['min']),
                    'bid': undefined,
                    'ask': undefined,
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': parseFloat(ticker['first']),
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': undefined,
                    'info': ticker
                };
            });
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                sides,
                keys,
                k,
                key,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this30 = this;

            return Promise.resolve().then(function () {
                return _this30.publicGetTradesDepth({
                    'pair_id': _this30.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = parseInt(parseInt(orderbook['last']) / 1000);
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this30.iso8601(timestamp)
                };
                sides = { 'bids': 'bid', 'asks': 'ask' };
                keys = Object.keys(sides);

                for (k = 0; k < keys.length; k++) {
                    key = keys[k];
                    side = sides[key];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order['price']);
                        amount = parseFloat(order['volume']);

                        result[key].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTradesHistory({
                'pair_id': this.productId(product)
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privatePostBalance();
        },
        signIn: function signIn() {
            return this.privatePostSignin({
                'login': this.login,
                'passwd': this.password
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'pair_id': this.productId(product),
                'dir': side == 'buy' ? 'bid' : 'ask',
                'amount': amount
            };
            if (type == 'limit') order['price'] = price;
            return this.privatePostCreateTrade(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/' + path;
            if (type == 'public') {
                if (Object.keys(params).length) url += '?' + this.urlencode(params);
            } else {
                body = JSON.stringify(this.extend({ 'token': this.apiKey }, params));
                headers = { 'Content-Type': 'application/json' };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var bitmarket = {

        'id': 'bitmarket',
        'name': 'BitMarket',
        'countries': ['PL', 'EU'],
        'rateLimit': 3000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27767256-a8555200-5ef9-11e7-96fd-469a65e2b0bd.jpg',
            'api': {
                'public': 'https://www.bitmarket.net',
                'private': 'https://www.bitmarket.pl/api2/' // last slash is critical
            },
            'www': ['https://www.bitmarket.pl', 'https://www.bitmarket.net'],
            'doc': ['https://www.bitmarket.net/docs.php?file=api_public.html', 'https://www.bitmarket.net/docs.php?file=api_private.html', 'https://github.com/bitmarket-net/api']
        },
        'api': {
            'public': {
                'get': ['json/{market}/ticker', 'json/{market}/orderbook', 'json/{market}/trades', 'json/ctransfer', 'graphs/{market}/90m', 'graphs/{market}/6h', 'graphs/{market}/1d', 'graphs/{market}/7d', 'graphs/{market}/1m', 'graphs/{market}/3m', 'graphs/{market}/6m', 'graphs/{market}/1y']
            },
            'private': {
                'post': ['info', 'trade', 'cancel', 'orders', 'trades', 'history', 'withdrawals', 'tradingdesk', 'tradingdeskStatus', 'tradingdeskConfirm', 'cryptotradingdesk', 'cryptotradingdeskStatus', 'cryptotradingdeskConfirm', 'withdraw', 'withdrawFiat', 'withdrawPLNPP', 'withdrawFiatFast', 'deposit', 'transfer', 'transfers', 'marginList', 'marginOpen', 'marginClose', 'marginCancel', 'marginModify', 'marginBalanceAdd', 'marginBalanceRemove', 'swapList', 'swapOpen', 'swapClose']
            }
        },
        'products': {
            'BTC/PLN': { 'id': 'BTCPLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN' },
            'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
            'LTC/PLN': { 'id': 'LTCPLN', 'symbol': 'LTC/PLN', 'base': 'LTC', 'quote': 'PLN' },
            'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
            'LMX/BTC': { 'id': 'LiteMineXBTC', 'symbol': 'LMX/BTC', 'base': 'LMX', 'quote': 'BTC' }
        },

        fetchBalance: function fetchBalance() {
            return this.privatePostInfo();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                _this31 = this;

            return Promise.resolve().then(function () {
                return _this31.publicGetJsonMarketOrderbook({
                    'market': _this31.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this31.milliseconds();
                result = {
                    'bids': orderbook['bids'],
                    'asks': orderbook['asks'],
                    'timestamp': timestamp,
                    'datetime': _this31.iso8601(timestamp)
                };

                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this32 = this;

            return Promise.resolve().then(function () {
                return _this32.publicGetJsonMarketTicker({
                    'market': _this32.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this32.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this32.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': parseFloat(ticker['vwap']),
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetJsonMarketTrades({
                'market': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            return this.privatePostTrade(this.extend({
                'market': this.productId(product),
                'type': side,
                'amount': amount,
                'rate': price
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'][type];
            if (type == 'public') {
                url += '/' + this.implodeParams(path + '.json', params);
            } else {
                var nonce = this.nonce();
                var query = this.extend({
                    'tonce': nonce,
                    'method': path
                }, params);
                body = this.urlencode(query);
                headers = {
                    'API-Key': this.apiKey,
                    'API-Hash': this.hmac(body, this.secret, 'sha512')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var bitmex = {

        'id': 'bitmex',
        'name': 'BitMEX',
        'countries': 'SC', // Seychelles
        'version': 'v1',
        'rateLimit': 2000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg',
            'api': 'https://www.bitmex.com',
            'www': 'https://www.bitmex.com',
            'doc': ['https://www.bitmex.com/app/apiOverview', 'https://github.com/BitMEX/api-connectors/tree/master/official-http']
        },
        'api': {
            'public': {
                'get': ['announcement', 'announcement/urgent', 'funding', 'instrument', 'instrument/active', 'instrument/activeAndIndices', 'instrument/activeIntervals', 'instrument/compositeIndex', 'instrument/indices', 'insurance', 'leaderboard', 'liquidation', 'orderBook', 'orderBook/L2', 'quote', 'quote/bucketed', 'schema', 'schema/websocketHelp', 'settlement', 'stats', 'stats/history', 'trade', 'trade/bucketed']
            },
            'private': {
                'get': ['apiKey', 'chat', 'chat/channels', 'chat/connected', 'execution', 'execution/tradeHistory', 'notification', 'order', 'position', 'user', 'user/affiliateStatus', 'user/checkReferralCode', 'user/commission', 'user/depositAddress', 'user/margin', 'user/minWithdrawalFee', 'user/wallet', 'user/walletHistory', 'user/walletSummary'],
                'post': ['apiKey', 'apiKey/disable', 'apiKey/enable', 'chat', 'order', 'order/bulk', 'order/cancelAllAfter', 'order/closePosition', 'position/isolate', 'position/leverage', 'position/riskLimit', 'position/transferMargin', 'user/cancelWithdrawal', 'user/confirmEmail', 'user/confirmEnableTFA', 'user/confirmWithdrawal', 'user/disableTFA', 'user/logout', 'user/logoutAll', 'user/preferences', 'user/requestEnableTFA', 'user/requestWithdrawal'],
                'put': ['order', 'order/bulk', 'user'],
                'delete': ['apiKey', 'order', 'order/all']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                p,
                product,
                id,
                base,
                quote,
                isFuturesContract,
                symbol,
                _this33 = this;

            return Promise.resolve().then(function () {
                return _this33.publicGetInstrumentActive();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products.length; p++) {
                    product = products[p];
                    id = product['symbol'];
                    base = product['underlying'];
                    quote = product['quoteCurrency'];
                    isFuturesContract = id != base + quote;

                    base = _this33.commonCurrencyCode(base);
                    quote = _this33.commonCurrencyCode(quote);
                    symbol = isFuturesContract ? id : base + '/' + quote;

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privateGetUserMargin({ 'currency': 'all' });
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                o,
                order,
                side,
                amount,
                price,
                _this34 = this;

            return Promise.resolve().then(function () {
                return _this34.publicGetOrderBookL2({
                    'symbol': _this34.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this34.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this34.iso8601(timestamp)
                };

                for (o = 0; o < orderbook.length; o++) {
                    order = orderbook[o];
                    side = order['side'] == 'Sell' ? 'asks' : 'bids';
                    amount = order['size'];
                    price = order['price'];

                    result[side].push([price, amount]);
                }
                // TODO sort bidasks
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var request,
                quotes,
                quotesLength,
                quote,
                tickers,
                ticker,
                timestamp,
                _this35 = this;

            return Promise.resolve().then(function () {
                request = {
                    'symbol': _this35.productId(product),
                    'binSize': '1d',
                    'partial': true,
                    'count': 1,
                    'reverse': true
                };
                return _this35.publicGetQuoteBucketed(request);
            }).then(function (_resp) {
                quotes = _resp;
                quotesLength = quotes.length;
                quote = quotes[quotesLength - 1];
                return _this35.publicGetTradeBucketed(request);
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers[0];
                timestamp = _this35.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this35.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(quote['bidPrice']),
                    'ask': parseFloat(quote['askPrice']),
                    'vwap': parseFloat(ticker['vwap']),
                    'open': undefined,
                    'close': parseFloat(ticker['close']),
                    'first': undefined,
                    'last': undefined,
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': parseFloat(ticker['homeNotional']),
                    'quoteVolume': parseFloat(ticker['foreignNotional']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTrade({
                'symbol': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'symbol': this.productId(product),
                'side': this.capitalize(side),
                'orderQty': amount,
                'ordType': this.capitalize(type)
            };
            if (type == 'limit') order['rate'] = price;
            return this.privatePostOrder(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var query = '/api/' + this.version + '/' + path;
            if (Object.keys(params).length) query += '?' + this.urlencode(params);
            var url = this.urls['api'] + query;
            if (type == 'private') {
                var nonce = this.nonce().toString();
                if (method == 'POST') if (Object.keys(params).length) body = JSON.stringify(params);
                var request = [method, query, nonce, body || ''].join('');
                headers = {
                    'Content-Type': 'application/json',
                    'api-nonce': nonce,
                    'api-key': this.apiKey,
                    'api-signature': this.hmac(request, this.secret)
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var bitso = {

        'id': 'bitso',
        'name': 'Bitso',
        'countries': 'MX', // Mexico
        'rateLimit': 2000, // 30 requests per minute
        'version': 'v3',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766335-715ce7aa-5ed5-11e7-88a8-173a27bb30fe.jpg',
            'api': 'https://api.bitso.com',
            'www': 'https://bitso.com',
            'doc': 'https://bitso.com/api_info'
        },
        'api': {
            'public': {
                'get': ['available_books', 'ticker', 'order_book', 'trades']
            },
            'private': {
                'get': ['account_status', 'balance', 'fees', 'fundings', 'fundings/{fid}', 'funding_destination', 'kyc_documents', 'ledger', 'ledger/trades', 'ledger/fees', 'ledger/fundings', 'ledger/withdrawals', 'mx_bank_codes', 'open_orders', 'order_trades/{oid}', 'orders/{oid}', 'user_trades', 'user_trades/{tid}', 'withdrawals/', 'withdrawals/{wid}'],
                'post': ['bitcoin_withdrawal', 'debit_card_withdrawal', 'ether_withdrawal', 'orders', 'phone_number', 'phone_verification', 'phone_withdrawal', 'spei_withdrawal'],
                'delete': ['orders/{oid}', 'orders/all']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                p,
                product,
                id,
                symbol,
                _symbol$split5,
                _symbol$split6,
                base,
                quote,
                _this36 = this;

            return Promise.resolve().then(function () {
                return _this36.publicGetAvailableBooks();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products['payload'].length; p++) {
                    product = products['payload'][p];
                    id = product['book'];
                    symbol = id.toUpperCase().replace('_', '/');
                    _symbol$split5 = symbol.split('/');
                    _symbol$split6 = _slicedToArray(_symbol$split5, 2);
                    base = _symbol$split6[0];
                    quote = _symbol$split6[1];

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privateGetBalance();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this37 = this;

            return Promise.resolve().then(function () {
                return _this37.publicGetOrderBook({
                    'book': _this37.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                orderbook = response['payload'];
                timestamp = _this37.parse8601(orderbook['updated_at']);
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this37.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order['price']);
                        amount = parseFloat(order['amount']);

                        result[side].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this38 = this;

            return Promise.resolve().then(function () {
                return _this38.publicGetTicker({
                    'book': _this38.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['payload'];
                timestamp = _this38.parse8601(ticker['created_at']);

                return {
                    'timestamp': timestamp,
                    'datetime': _this38.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': parseFloat(ticker['vwap']),
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': undefined,
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTrades({
                'book': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'book': this.productId(product),
                'side': side,
                'type': type,
                'major': amount
            };
            if (type == 'limit') order['price'] = price;
            return this.privatePostOrders(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var query = '/' + this.version + '/' + this.implodeParams(path, params);
            var url = this.urls['api'] + query;
            if (type == 'public') {
                if (Object.keys(params).length) url += '?' + this.urlencode(params);
            } else {
                if (Object.keys(params).length) body = JSON.stringify(params);
                var nonce = this.nonce().toString();
                var request = [nonce, method, query, body || ''].join('');
                var signature = this.hmac(request, this.secret);
                var auth = this.apiKey + ':' + nonce + ':' + signature;
                headers = { 'Authorization': "Bitso " + auth };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var bitstamp = {

        'id': 'bitstamp',
        'name': 'Bitstamp',
        'countries': 'GB',
        'rateLimit': 1000,
        'version': 'v2',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
            'api': 'https://www.bitstamp.net/api',
            'www': 'https://www.bitstamp.net',
            'doc': 'https://www.bitstamp.net/api'
        },
        'api': {
            'public': {
                'get': ['order_book/{id}/', 'ticker_hour/{id}/', 'ticker/{id}/', 'transactions/{id}/']
            },
            'private': {
                'post': ['balance/', 'balance/{id}/', 'buy/{id}/', 'buy/market/{id}/', 'cancel_order/', 'liquidation_address/info/', 'liquidation_address/new/', 'open_orders/all/', 'open_orders/{id}/', 'sell/{id}/', 'sell/market/{id}/', 'transfer-from-main/', 'transfer-to-main/', 'user_transactions/', 'user_transactions/{id}/', 'withdrawal/cancel/', 'withdrawal/open/', 'withdrawal/status/', 'xrp_address/', 'xrp_withdrawal/']
            }
        },
        'products': {
            'BTC/USD': { 'id': 'btcusd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
            'BTC/EUR': { 'id': 'btceur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
            'EUR/USD': { 'id': 'eurusd', 'symbol': 'EUR/USD', 'base': 'EUR', 'quote': 'USD' },
            'XRP/USD': { 'id': 'xrpusd', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD' },
            'XRP/EUR': { 'id': 'xrpeur', 'symbol': 'XRP/EUR', 'base': 'XRP', 'quote': 'EUR' },
            'XRP/BTC': { 'id': 'xrpbtc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC' }
        },

        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this39 = this;

            return Promise.resolve().then(function () {
                return _this39.publicGetOrderBookId({
                    'id': _this39.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = parseInt(orderbook['timestamp']) * 1000;
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this39.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order[0]);
                        amount = parseFloat(order[1]);

                        result[side].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this40 = this;

            return Promise.resolve().then(function () {
                return _this40.publicGetTickerId({
                    'id': _this40.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = parseInt(ticker['timestamp']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this40.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': parseFloat(ticker['vwap']),
                    'open': parseFloat(ticker['open']),
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTransactionsId({
                'id': this.productId(product)
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privatePostBalance();
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var method = 'privatePost' + this.capitalize(side);
            var order = {
                'id': this.productId(product),
                'amount': amount
            };
            if (type == 'market') method += 'Market';else order['price'] = price;
            method += 'Id';
            return this[method](this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams(path, params);
            var query = this.omit(params, this.extractParams(path));
            if (type == 'public') {
                if (Object.keys(query).length) url += '?' + this.urlencode(query);
            } else {
                var nonce = this.nonce().toString();
                var auth = nonce + this.uid + this.apiKey;
                var signature = this.hmac(auth, this.secret);
                query = this.extend({
                    'key': this.apiKey,
                    'signature': signature.toUpperCase(),
                    'nonce': nonce
                }, query);
                body = this.urlencode(query);
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var bittrex = {

        'id': 'bittrex',
        'name': 'Bittrex',
        'countries': 'US',
        'version': 'v1.1',
        'rateLimit': 2000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg',
            'api': 'https://bittrex.com/api',
            'www': 'https://bittrex.com',
            'doc': ['https://bittrex.com/Home/Api', 'https://www.npmjs.org/package/node.bittrex.api']
        },
        'api': {
            'public': {
                'get': ['currencies', 'markethistory', 'markets', 'marketsummaries', 'marketsummary', 'orderbook', 'ticker']
            },
            'account': {
                'get': ['balance', 'balances', 'depositaddress', 'deposithistory', 'order', 'orderhistory', 'withdrawalhistory', 'withdraw']
            },
            'market': {
                'get': ['buylimit', 'buymarket', 'cancel', 'openorders', 'selllimit', 'sellmarket']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                p,
                product,
                id,
                base,
                quote,
                symbol,
                _this41 = this;

            return Promise.resolve().then(function () {
                return _this41.publicGetMarkets();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products['result'].length; p++) {
                    product = products['result'][p];
                    id = product['MarketName'];
                    base = product['BaseCurrency'];
                    quote = product['MarketCurrency'];
                    symbol = base + '/' + quote;

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.accountGetBalances();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                orderbook,
                timestamp,
                result,
                sides,
                keys,
                k,
                key,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this42 = this;

            return Promise.resolve().then(function () {
                return _this42.publicGetOrderbook({
                    'market': _this42.productId(product),
                    'type': 'both',
                    'depth': 50
                });
            }).then(function (_resp) {
                response = _resp;
                orderbook = response['result'];
                timestamp = _this42.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this42.iso8601(timestamp)
                };
                sides = { 'bids': 'buy', 'asks': 'sell' };
                keys = Object.keys(sides);

                for (k = 0; k < keys.length; k++) {
                    key = keys[k];
                    side = sides[key];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order['Rate']);
                        amount = parseFloat(order['Quantity']);

                        result[key].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this43 = this;

            return Promise.resolve().then(function () {
                return _this43.publicGetMarketsummary({
                    'market': _this43.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['result'][0];
                timestamp = _this43.parse8601(ticker['TimeStamp']);

                return {
                    'timestamp': timestamp,
                    'datetime': _this43.iso8601(timestamp),
                    'high': parseFloat(ticker['High']),
                    'low': parseFloat(ticker['Low']),
                    'bid': parseFloat(ticker['Bid']),
                    'ask': parseFloat(ticker['Ask']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['Last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['Volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetMarkethistory({
                'market': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var method = 'marketGet' + this.capitalize(side) + type;
            var order = {
                'market': this.productId(product),
                'quantity': amount
            };
            if (type == 'limit') order['rate'] = price;
            return this[method](this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/';
            if (type == 'public') {
                url += type + '/' + method.toLowerCase() + path;
                if (Object.keys(params).length) url += '?' + this.urlencode(params);
            } else {
                var nonce = this.nonce();
                url += type + '/';
                if (type == 'account' && path != 'withdraw' || path == 'openorders') url += method.toLowerCase();
                url += path + '?' + this.urlencode(this.extend({
                    'nonce': nonce,
                    'apikey': this.apiKey
                }, params));
                headers = { 'apisign': this.hmac(url, this.secret, 'sha512') };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var btcchina = {

        'id': 'btcchina',
        'name': 'BTCChina',
        'countries': 'CN',
        'rateLimit': 3000,
        'version': 'v1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766368-465b3286-5ed6-11e7-9a11-0f6467e1d82b.jpg',
            'api': {
                'public': 'https://data.btcchina.com/data',
                'private': 'https://api.btcchina.com/api_trade_v1.php'
            },
            'www': 'https://www.btcchina.com',
            'doc': 'https://www.btcchina.com/apidocs'
        },
        'api': {
            'public': {
                'get': ['historydata', 'orderbook', 'ticker', 'trades']
            },
            'private': {
                'post': ['BuyIcebergOrder', 'BuyOrder', 'BuyOrder2', 'BuyStopOrder', 'CancelIcebergOrder', 'CancelOrder', 'CancelStopOrder', 'GetAccountInfo', 'getArchivedOrder', 'getArchivedOrders', 'GetDeposits', 'GetIcebergOrder', 'GetIcebergOrders', 'GetMarketDepth', 'GetMarketDepth2', 'GetOrder', 'GetOrders', 'GetStopOrder', 'GetStopOrders', 'GetTransactions', 'GetWithdrawal', 'GetWithdrawals', 'RequestWithdrawal', 'SellIcebergOrder', 'SellOrder', 'SellOrder2', 'SellStopOrder']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                keys,
                p,
                key,
                product,
                parts,
                id,
                base,
                quote,
                symbol,
                _this44 = this;

            return Promise.resolve().then(function () {
                return _this44.publicGetTicker({
                    'market': 'all'
                });
            }).then(function (_resp) {
                products = _resp;
                result = [];
                keys = Object.keys(products);

                for (p = 0; p < keys.length; p++) {
                    key = keys[p];
                    product = products[key];
                    parts = key.split('_');
                    id = parts[1];
                    base = id.slice(0, 3);
                    quote = id.slice(3, 6);

                    base = base.toUpperCase();
                    quote = quote.toUpperCase();
                    symbol = base + '/' + quote;

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privatePostGetAccountInfo();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                _this45 = this;

            return Promise.resolve().then(function () {
                return _this45.publicGetOrderbook({
                    'market': _this45.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = orderbook['date'] * 1000;
                ;
                result = {
                    'bids': orderbook['bids'],
                    'asks': orderbook['asks'],
                    'timestamp': timestamp,
                    'datetime': _this45.iso8601(timestamp)
                };
                // TODO sort bidasks

                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                tickers,
                ticker,
                timestamp,
                _this46 = this;

            return Promise.resolve().then(function () {
                p = _this46.product(product);
                return _this46.publicGetTicker({
                    'market': p['id']
                });
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers['ticker'];
                timestamp = ticker['date'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this46.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['buy']),
                    'ask': parseFloat(ticker['sell']),
                    'vwap': parseFloat(ticker['vwap']),
                    'open': parseFloat(ticker['open']),
                    'close': parseFloat(ticker['prev_close']),
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['vol']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTrades({
                'market': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var p = this.product(product);
            var method = 'privatePost' + this.capitalize(side) + 'Order2';
            var order = {};
            var id = p['id'].toUpperCase();
            if (type == 'market') {
                order['params'] = [undefined, amount, id];
            } else {
                order['params'] = [price, amount, id];
            }
            return this[method](this.extend(order, params));
        },
        nonce: function nonce() {
            return this.microseconds();
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'][type] + '/' + path;
            if (type == 'public') {
                if (Object.keys(params).length) url += '?' + this.urlencode(params);
            } else {
                var p = [];
                if ('params' in params) p = params['params'];
                var nonce = this.nonce();
                var request = {
                    'method': path,
                    'id': nonce,
                    'params': p
                };
                p = p.join(',');
                body = JSON.stringify(request);
                var query = 'tonce=' + nonce + '&accesskey=' + this.apiKey + '&requestmethod=' + method.toLowerCase() + '&id=' + nonce + '&method=' + path + '&params=' + p;
                var signature = this.hmac(query, this.secret, 'sha1');
                var auth = this.apiKey + ':' + signature;
                headers = {
                    'Content-Length': body.length,
                    'Authorization': 'Basic ' + this.stringToBase64(query),
                    'Json-Rpc-Tonce': nonce
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------

    var btce = {

        'id': 'btce',
        'name': 'BTC-e',
        'countries': ['BG', 'RU'], // Bulgaria, Russia
        'version': '3',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27843225-1b571514-611a-11e7-9208-2641a560b561.jpg',
            'api': 'https://btc-e.com/api',
            'www': 'https://btc-e.com',
            'doc': ['https://btc-e.com/api/3/docs', 'https://btc-e.com/tapi/docs']
        },
        'api': {
            'public': {
                'get': ['info', 'ticker/{pair}', 'depth/{pair}', 'trades/{pair}']
            },
            'private': {
                'post': ['getInfo', 'Trade', 'ActiveOrders', 'OrderInfo', 'CancelOrder', 'TradeHistory', 'TransHistory', 'CoinDepositAddress', 'WithdrawCoin', 'CreateCoupon', 'RedeemCoupon']
            }
        },

        fetchProducts: function fetchProducts() {
            var response,
                products,
                keys,
                result,
                p,
                id,
                product,
                _id$split,
                _id$split2,
                base,
                quote,
                symbol,
                _this47 = this;

            return Promise.resolve().then(function () {
                return _this47.publicGetInfo();
            }).then(function (_resp) {
                response = _resp;
                products = response['pairs'];
                keys = Object.keys(products);
                result = [];

                for (p = 0; p < keys.length; p++) {
                    id = keys[p];
                    product = products[id];
                    _id$split = id.split('_');
                    _id$split2 = _slicedToArray(_id$split, 2);
                    base = _id$split2[0];
                    quote = _id$split2[1];

                    base = base.toUpperCase();
                    quote = quote.toUpperCase();
                    symbol = base + '/' + quote;

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privatePostGetInfo();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var p,
                response,
                orderbook,
                timestamp,
                result,
                _this48 = this;

            return Promise.resolve().then(function () {
                p = _this48.product(product);
                return _this48.publicGetDepthPair({
                    'pair': p['id']
                });
            }).then(function (_resp) {
                response = _resp;
                orderbook = response[p['id']];
                timestamp = _this48.milliseconds();
                result = {
                    'bids': orderbook['bids'],
                    'asks': orderbook['asks'],
                    'timestamp': timestamp,
                    'datetime': _this48.iso8601(timestamp)
                };

                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                tickers,
                ticker,
                timestamp,
                _this49 = this;

            return Promise.resolve().then(function () {
                p = _this49.product(product);
                return _this49.publicGetTickerPair({
                    'pair': p['id']
                });
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers[p['id']];
                timestamp = ticker['updated'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this49.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['buy']),
                    'ask': parseFloat(ticker['sell']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': parseFloat(ticker['avg']),
                    'baseVolume': parseFloat(ticker['vol_cur']),
                    'quoteVolume': parseFloat(ticker['vol']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTradesPair({
                'pair': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'pair': this.productId(product),
                'type': side,
                'amount': amount,
                'rate': price
            };
            return this.privatePostTrade(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams(path, params);
            var query = this.omit(params, this.extractParams(path));
            if (type == 'public') {
                if (Object.keys(query).length) url += '?' + this.urlencode(query);
            } else {
                var nonce = this.nonce();
                body = this.urlencode(this.extend({
                    'nonce': nonce
                }, params));
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length,
                    'Key': this.apiKey,
                    'Sign': this.hmac(body, this.secret, 'sha512')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var btcx = {

        'id': 'btcx',
        'name': 'BTCX',
        'countries': ['IS', 'US', 'EU'],
        'rateLimit': 3000, // support in english is very poor, unable to tell rate limits
        'version': 'v1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766385-9fdcc98c-5ed6-11e7-8f14-66d5e5cd47e6.jpg',
            'api': 'https://btc-x.is/api',
            'www': 'https://btc-x.is',
            'doc': 'https://btc-x.is/custom/api-document.html'
        },
        'api': {
            'public': {
                'get': ['depth/{id}/{limit}', 'ticker/{id}', 'trade/{id}/{limit}']
            },
            'private': {
                'post': ['balance', 'cancel', 'history', 'order', 'redeem', 'trade', 'withdraw']
            }
        },
        'products': {
            'BTC/USD': { 'id': 'btc/usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
            'BTC/EUR': { 'id': 'btc/eur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' }
        },

        fetchBalance: function fetchBalance() {
            return this.privatePostBalance();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this50 = this;

            return Promise.resolve().then(function () {
                return _this50.publicGetDepthIdLimit({
                    'id': _this50.productId(product),
                    'limit': 1000
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this50.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this50.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = order['price'];
                        amount = order['amount'];

                        result[side].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this51 = this;

            return Promise.resolve().then(function () {
                return _this51.publicGetTickerId({
                    'id': _this51.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['time'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this51.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['buy']),
                    'ask': parseFloat(ticker['sell']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTradeIdLimit({
                'id': this.productId(product),
                'limit': 100
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            return this.privatePostTrade(this.extend({
                'type': side.toUpperCase(),
                'market': this.productId(product),
                'amount': amount,
                'price': price
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/';
            if (type == 'public') {
                url += this.implodeParams(path, params);
            } else {
                var nonce = this.nonce();
                url += type;
                body = this.urlencode(this.extend({
                    'Method': path.toUpperCase(),
                    'Nonce': nonce
                }, params));
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Key': this.apiKey,
                    'Signature': this.hmac(body, this.secret, 'sha512')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var bxinth = {

        'id': 'bxinth',
        'name': 'BX.in.th',
        'countries': 'TH', // Thailand
        'rateLimit': 2000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766412-567b1eb4-5ed7-11e7-94a8-ff6a3884f6c5.jpg',
            'api': 'https://bx.in.th/api',
            'www': 'https://bx.in.th',
            'doc': 'https://bx.in.th/info/api'
        },
        'api': {
            'public': {
                'get': ['', // ticker
                'options', 'optionbook', 'orderbook', 'pairing', 'trade', 'tradehistory']
            },
            'private': {
                'post': ['balance', 'biller', 'billgroup', 'billpay', 'cancel', 'deposit', 'getorders', 'history', 'option-issue', 'option-bid', 'option-sell', 'option-myissue', 'option-mybid', 'option-myoptions', 'option-exercise', 'option-cancel', 'option-history', 'order', 'withdrawal', 'withdrawal-history']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                keys,
                result,
                p,
                product,
                id,
                base,
                quote,
                symbol,
                _this52 = this;

            return Promise.resolve().then(function () {
                return _this52.publicGetPairing();
            }).then(function (_resp) {
                products = _resp;
                keys = Object.keys(products);
                result = [];

                for (p = 0; p < keys.length; p++) {
                    product = products[keys[p]];
                    id = product['pairing_id'];
                    base = product['primary_currency'];
                    quote = product['secondary_currency'];
                    symbol = base + '/' + quote;

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privatePostBalance();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this53 = this;

            return Promise.resolve().then(function () {
                return _this53.publicGetOrderbook({
                    'pairing': _this53.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this53.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this53.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order[0]);
                        amount = parseFloat(order[1]);

                        result[side].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                tickers,
                ticker,
                timestamp,
                _this54 = this;

            return Promise.resolve().then(function () {
                p = _this54.product(product);
                return _this54.publicGet({ 'pairing': p['id'] });
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers[p['id']];
                timestamp = _this54.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this54.iso8601(timestamp),
                    'high': undefined,
                    'low': undefined,
                    'bid': parseFloat(ticker['orderbook']['bids']['highbid']),
                    'ask': parseFloat(ticker['orderbook']['asks']['highbid']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last_price']),
                    'change': parseFloat(ticker['change']),
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['volume_24hours']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTrade({
                'pairing': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            return this.privatePostOrder(this.extend({
                'pairing': this.productId(product),
                'type': side,
                'amount': amount,
                'rate': price
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + path + '/';
            if (Object.keys(params).length) url += '?' + this.urlencode(params);
            if (type == 'private') {
                var nonce = this.nonce();
                var signature = this.hash(this.apiKey + nonce + this.secret, 'sha256');
                body = this.urlencode(this.extend({
                    'key': this.apiKey,
                    'nonce': nonce,
                    'signature': signature
                    // twofa: this.twofa,
                }, params));
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var ccex = {

        'id': 'ccex',
        'name': 'C-CEX',
        'countries': ['DE', 'EU'],
        'rateLimit': 2000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766433-16881f90-5ed8-11e7-92f8-3d92cc747a6c.jpg',
            'api': {
                'tickers': 'https://c-cex.com/t',
                'public': 'https://c-cex.com/t/api_pub.html',
                'private': 'https://c-cex.com/t/api.html'
            },
            'www': 'https://c-cex.com',
            'doc': 'https://c-cex.com/?id=api'
        },
        'api': {
            'tickers': {
                'get': ['coinnames', '{market}', 'pairs', 'prices', 'volume_{coin}']
            },
            'public': {
                'get': ['balancedistribution', 'markethistory', 'markets', 'marketsummaries', 'orderbook']
            },
            'private': {
                'get': ['buylimit', 'cancel', 'getbalance', 'getbalances', 'getopenorders', 'getorder', 'getorderhistory', 'mytrades', 'selllimit']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                p,
                product,
                id,
                base,
                quote,
                symbol,
                _this55 = this;

            return Promise.resolve().then(function () {
                return _this55.publicGetMarkets();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products['result'].length; p++) {
                    product = products['result'][p];
                    id = product['MarketName'];
                    base = product['MarketCurrency'];
                    quote = product['BaseCurrency'];
                    symbol = base + '/' + quote;

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privateGetBalances();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                orderbook,
                timestamp,
                result,
                sides,
                keys,
                k,
                key,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this56 = this;

            return Promise.resolve().then(function () {
                return _this56.publicGetOrderbook({
                    'market': _this56.productId(product),
                    'type': 'both',
                    'depth': 100
                });
            }).then(function (_resp) {
                response = _resp;
                orderbook = response['result'];
                timestamp = _this56.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this56.iso8601(timestamp)
                };
                sides = { 'bids': 'buy', 'asks': 'sell' };
                keys = Object.keys(sides);

                for (k = 0; k < keys.length; k++) {
                    key = keys[k];
                    side = sides[key];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order['Rate']);
                        amount = parseFloat(order['Quantity']);

                        result[key].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this57 = this;

            return Promise.resolve().then(function () {
                return _this57.tickersGetMarket({
                    'market': _this57.productId(product).toLowerCase()
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['ticker'];
                timestamp = ticker['updated'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this57.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['buy']),
                    'ask': parseFloat(ticker['sell']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['lastprice']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': parseFloat(ticker['avg']),
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['buysupport']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetMarkethistory({
                'market': this.productId(product),
                'type': 'both',
                'depth': 100
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var method = 'privateGet' + this.capitalize(side) + type;
            return this[method](this.extend({
                'market': this.productId(product),
                'quantity': amount,
                'rate': price
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'][type];
            if (type == 'private') {
                var nonce = this.nonce().toString();
                var query = this.keysort(this.extend({
                    'a': path,
                    'apikey': this.apiKey,
                    'nonce': nonce
                }, params));
                url += '?' + this.urlencode(query);
                headers = { 'apisign': this.hmac(url, this.secret, 'sha512') };
            } else if (type == 'public') {
                url += '?' + this.urlencode(this.extend({
                    'a': 'get' + path
                }, params));
            } else {
                url += '/' + this.implodeParams(path, params) + '.json';
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var cex = {

        'id': 'cex',
        'name': 'CEX.IO',
        'countries': ['GB', 'EU', 'CY', 'RU'],
        'rateLimit': 2000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg',
            'api': 'https://cex.io/api',
            'www': 'https://cex.io',
            'doc': 'https://cex.io/cex-api'
        },
        'api': {
            'public': {
                'get': ['currency_limits', 'last_price/{pair}', 'last_prices/{currencies}', 'ohlcv/hd/{yyyymmdd}/{pair}', 'order_book/{pair}', 'ticker/{pair}', 'tickers/{currencies}', 'trade_history/{pair}'],
                'post': ['convert/{pair}', 'price_stats/{pair}']
            },
            'private': {
                'post': ['active_orders_status/', 'archived_orders/{pair}', 'balance/', 'cancel_order/', 'cancel_orders/{pair}', 'cancel_replace_order/{pair}', 'close_position/{pair}', 'get_address/', 'get_myfee/', 'get_order/', 'get_order_tx/', 'open_orders/{pair}', 'open_orders/', 'open_position/{pair}', 'open_positions/{pair}', 'place_order/{pair}', 'place_order/{pair}']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                p,
                product,
                id,
                symbol,
                _symbol$split7,
                _symbol$split8,
                base,
                quote,
                _this58 = this;

            return Promise.resolve().then(function () {
                return _this58.publicGetCurrencyLimits();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products['data']['pairs'].length; p++) {
                    product = products['data']['pairs'][p];
                    id = product['symbol1'] + '/' + product['symbol2'];
                    symbol = id;
                    _symbol$split7 = symbol.split('/');
                    _symbol$split8 = _slicedToArray(_symbol$split7, 2);
                    base = _symbol$split8[0];
                    quote = _symbol$split8[1];

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privatePostBalance();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                _this59 = this;

            return Promise.resolve().then(function () {
                return _this59.publicGetOrderBookPair({
                    'pair': _this59.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = orderbook['timestamp'] * 1000;
                result = {
                    'bids': orderbook['bids'],
                    'asks': orderbook['asks'],
                    'timestamp': timestamp,
                    'datetime': _this59.iso8601(timestamp)
                };

                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this60 = this;

            return Promise.resolve().then(function () {
                return _this60.publicGetTickerPair({
                    'pair': _this60.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = parseInt(ticker['timestamp']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this60.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': parseFloat(ticker['change']),
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTradeHistoryPair({
                'pair': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'pair': this.productId(product),
                'type': side,
                'amount': amount
            };
            if (type == 'limit') order['price'] = price;else order['order_type'] = type;
            return this.privatePostPlaceOrderPair(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.implodeParams(path, params);
            var query = this.omit(params, this.extractParams(path));
            if (type == 'public') {
                if (Object.keys(query).length) url += '?' + this.urlencode(query);
            } else {
                var nonce = this.nonce().toString();
                body = this.urlencode(this.extend({
                    'key': this.apiKey,
                    'signature': this.hmac(nonce + this.uid + this.apiKey, this.secret).toUpperCase(),
                    'nonce': nonce
                }, query));
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var coincheck = {

        'id': 'coincheck',
        'name': 'coincheck',
        'countries': ['JP', 'ID'],
        'rateLimit': 2000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766464-3b5c3c74-5ed9-11e7-840e-31b32968e1da.jpg',
            'api': 'https://coincheck.com/api',
            'www': 'https://coincheck.com',
            'doc': 'https://coincheck.com/documents/exchange/api'
        },
        'api': {
            'public': {
                'get': ['exchange/orders/rate', 'order_books', 'rate/{pair}', 'ticker', 'trades']
            },
            'private': {
                'get': ['accounts', 'accounts/balance', 'accounts/leverage_balance', 'bank_accounts', 'deposit_money', 'exchange/orders/opens', 'exchange/orders/transactions', 'exchange/orders/transactions_pagination', 'exchange/leverage/positions', 'lending/borrows/matches', 'send_money', 'withdraws'],
                'post': ['bank_accounts', 'deposit_money/{id}/fast', 'exchange/orders', 'exchange/transfers/to_leverage', 'exchange/transfers/from_leverage', 'lending/borrows', 'lending/borrows/{id}/repay', 'send_money', 'withdraws'],
                'delete': ['bank_accounts/{id}', 'exchange/orders/{id}', 'withdraws/{id}']
            }
        },
        'products': {
            'BTC/JPY': { 'id': 'btc_jpy', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY' }, // the only real pair
            'ETH/JPY': { 'id': 'eth_jpy', 'symbol': 'ETH/JPY', 'base': 'ETH', 'quote': 'JPY' },
            'ETC/JPY': { 'id': 'etc_jpy', 'symbol': 'ETC/JPY', 'base': 'ETC', 'quote': 'JPY' },
            'DAO/JPY': { 'id': 'dao_jpy', 'symbol': 'DAO/JPY', 'base': 'DAO', 'quote': 'JPY' },
            'LSK/JPY': { 'id': 'lsk_jpy', 'symbol': 'LSK/JPY', 'base': 'LSK', 'quote': 'JPY' },
            'FCT/JPY': { 'id': 'fct_jpy', 'symbol': 'FCT/JPY', 'base': 'FCT', 'quote': 'JPY' },
            'XMR/JPY': { 'id': 'xmr_jpy', 'symbol': 'XMR/JPY', 'base': 'XMR', 'quote': 'JPY' },
            'REP/JPY': { 'id': 'rep_jpy', 'symbol': 'REP/JPY', 'base': 'REP', 'quote': 'JPY' },
            'XRP/JPY': { 'id': 'xrp_jpy', 'symbol': 'XRP/JPY', 'base': 'XRP', 'quote': 'JPY' },
            'ZEC/JPY': { 'id': 'zec_jpy', 'symbol': 'ZEC/JPY', 'base': 'ZEC', 'quote': 'JPY' },
            'XEM/JPY': { 'id': 'xem_jpy', 'symbol': 'XEM/JPY', 'base': 'XEM', 'quote': 'JPY' },
            'LTC/JPY': { 'id': 'ltc_jpy', 'symbol': 'LTC/JPY', 'base': 'LTC', 'quote': 'JPY' },
            'DASH/JPY': { 'id': 'dash_jpy', 'symbol': 'DASH/JPY', 'base': 'DASH', 'quote': 'JPY' },
            'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
            'ETC/BTC': { 'id': 'etc_btc', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC' },
            'LSK/BTC': { 'id': 'lsk_btc', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC' },
            'FCT/BTC': { 'id': 'fct_btc', 'symbol': 'FCT/BTC', 'base': 'FCT', 'quote': 'BTC' },
            'XMR/BTC': { 'id': 'xmr_btc', 'symbol': 'XMR/BTC', 'base': 'XMR', 'quote': 'BTC' },
            'REP/BTC': { 'id': 'rep_btc', 'symbol': 'REP/BTC', 'base': 'REP', 'quote': 'BTC' },
            'XRP/BTC': { 'id': 'xrp_btc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC' },
            'ZEC/BTC': { 'id': 'zec_btc', 'symbol': 'ZEC/BTC', 'base': 'ZEC', 'quote': 'BTC' },
            'XEM/BTC': { 'id': 'xem_btc', 'symbol': 'XEM/BTC', 'base': 'XEM', 'quote': 'BTC' },
            'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
            'DASH/BTC': { 'id': 'dash_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC' }
        },

        fetchBalance: function fetchBalance() {
            return this.privateGetAccountsBalance();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this61 = this;

            return Promise.resolve().then(function () {
                return _this61.publicGetOrderBooks();
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this61.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this61.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order[0]);
                        amount = parseFloat(order[1]);

                        result[side].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this62 = this;

            return Promise.resolve().then(function () {
                return _this62.publicGetTicker();
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['timestamp'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this62.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTrades();
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var prefix = '';
            var order = {
                'pair': this.productId(product)
            };
            if (type == 'market') {
                var order_type = type + '_' + side;
                order['order_type'] = order_type;
                var _prefix = side == buy ? order_type + '_' : '';
                order[_prefix + 'amount'] = amount;
            } else {
                order['order_type'] = side;
                order['rate'] = price;
                order['amount'] = amount;
            }
            return this.privatePostExchangeOrders(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.implodeParams(path, params);
            var query = this.omit(params, this.extractParams(path));
            if (type == 'public') {
                if (Object.keys(query).length) url += '?' + this.urlencode(query);
            } else {
                var nonce = this.nonce().toString();
                if (Object.keys(query).length) body = this.urlencode(this.keysort(query));
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length,
                    'ACCESS-KEY': this.apiKey,
                    'ACCESS-NONCE': nonce,
                    'ACCESS-SIGNATURE': this.hmac(nonce + url + (body || ''), this.secret)
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var coinmate = {

        'id': 'coinmate',
        'name': 'CoinMate',
        'countries': ['GB', 'CZ'], // UK, Czech Republic
        'rateLimit': 1000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27811229-c1efb510-606c-11e7-9a36-84ba2ce412d8.jpg',
            'api': 'https://coinmate.io/api',
            'www': 'https://coinmate.io',
            'doc': ['https://coinmate.io/developers', 'http://docs.coinmate.apiary.io/#reference']
        },
        'api': {
            'public': {
                'get': ['orderBook', 'ticker', 'transactions']
            },
            'private': {
                'post': ['balances', 'bitcoinWithdrawal', 'bitcoinDepositAddresses', 'buyInstant', 'buyLimit', 'cancelOrder', 'cancelOrderWithInfo', 'createVoucher', 'openOrders', 'redeemVoucher', 'sellInstant', 'sellLimit', 'transactionHistory', 'unconfirmedBitcoinDeposits']
            }
        },
        'products': {
            'BTC/EUR': { 'id': 'BTC_EUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
            'BTC/CZK': { 'id': 'BTC_CZK', 'symbol': 'BTC/CZK', 'base': 'BTC', 'quote': 'CZK' }
        },

        fetchBalance: function fetchBalance() {
            return this.privatePostBalances();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this63 = this;

            return Promise.resolve().then(function () {
                return _this63.publicGetOrderBook({
                    'currencyPair': _this63.productId(product),
                    'groupByPriceLimit': 'False'
                });
            }).then(function (_resp) {
                response = _resp;
                orderbook = response['data'];
                timestamp = orderbook['timestamp'] * 1000;
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this63.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = order['price'];
                        amount = order['amount'];

                        result[side].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this64 = this;

            return Promise.resolve().then(function () {
                return _this64.publicGetTicker({
                    'currencyPair': _this64.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['data'];
                timestamp = ticker['timestamp'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this64.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['amount']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTransactions({
                'currencyPair': this.productId(product),
                'minutesIntoHistory': 10
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var method = 'privatePost' + this.capitalize(side);
            var order = {
                'currencyPair': this.productId(product)
            };
            if (type == 'market') {
                if (side == 'buy') order['total'] = amount; // amount in fiat
                else order['amount'] = amount; // amount in fiat
                method += 'Instant';
            } else {
                order['amount'] = amount; // amount in crypto
                order['price'] = price;
                method += this.capitalize(type);
            }
            return this[method](self.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + path;
            if (type == 'public') {
                if (Object.keys(params).length) url += '?' + this.urlencode(params);
            } else {
                var nonce = this.nonce().toString();
                var auth = [nonce, this.uid, this.apiKey].join(' ');
                var signature = this.hmac(auth, this.secret);
                body = this.urlencode(this.extend({
                    'clientId': this.uid,
                    'nonce': nonce,
                    'publicKey': this.apiKey,
                    'signature': signature.toUpperCase()
                }, params));
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var coinsecure = {

        'id': 'coinsecure',
        'name': 'Coinsecure',
        'countries': 'IN', // India
        'rateLimit': 1000,
        'version': 'v1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766472-9cbd200a-5ed9-11e7-9551-2267ad7bac08.jpg',
            'api': 'https://api.coinsecure.in',
            'www': 'https://coinsecure.in',
            'doc': ['https://api.coinsecure.in', 'https://github.com/coinsecure/plugins']
        },
        'api': {
            'public': {
                'get': ['bitcoin/search/confirmation/{txid}', 'exchange/ask/low', 'exchange/ask/orders', 'exchange/bid/high', 'exchange/bid/orders', 'exchange/lastTrade', 'exchange/max24Hr', 'exchange/min24Hr', 'exchange/ticker', 'exchange/trades']
            },
            'private': {
                'get': ['mfa/authy/call', 'mfa/authy/sms', 'netki/search/{netkiName}', 'user/bank/otp/{number}', 'user/kyc/otp/{number}', 'user/profile/phone/otp/{number}', 'user/wallet/coin/address/{id}', 'user/wallet/coin/deposit/confirmed/all', 'user/wallet/coin/deposit/confirmed/{id}', 'user/wallet/coin/deposit/unconfirmed/all', 'user/wallet/coin/deposit/unconfirmed/{id}', 'user/wallet/coin/wallets', 'user/exchange/bank/fiat/accounts', 'user/exchange/bank/fiat/balance/available', 'user/exchange/bank/fiat/balance/pending', 'user/exchange/bank/fiat/balance/total', 'user/exchange/bank/fiat/deposit/cancelled', 'user/exchange/bank/fiat/deposit/unverified', 'user/exchange/bank/fiat/deposit/verified', 'user/exchange/bank/fiat/withdraw/cancelled', 'user/exchange/bank/fiat/withdraw/completed', 'user/exchange/bank/fiat/withdraw/unverified', 'user/exchange/bank/fiat/withdraw/verified', 'user/exchange/ask/cancelled', 'user/exchange/ask/completed', 'user/exchange/ask/pending', 'user/exchange/bid/cancelled', 'user/exchange/bid/completed', 'user/exchange/bid/pending', 'user/exchange/bank/coin/addresses', 'user/exchange/bank/coin/balance/available', 'user/exchange/bank/coin/balance/pending', 'user/exchange/bank/coin/balance/total', 'user/exchange/bank/coin/deposit/cancelled', 'user/exchange/bank/coin/deposit/unverified', 'user/exchange/bank/coin/deposit/verified', 'user/exchange/bank/coin/withdraw/cancelled', 'user/exchange/bank/coin/withdraw/completed', 'user/exchange/bank/coin/withdraw/unverified', 'user/exchange/bank/coin/withdraw/verified', 'user/exchange/bank/summary', 'user/exchange/coin/fee', 'user/exchange/fiat/fee', 'user/exchange/kycs', 'user/exchange/referral/coin/paid', 'user/exchange/referral/coin/successful', 'user/exchange/referral/fiat/paid', 'user/exchange/referrals', 'user/exchange/trade/summary', 'user/login/token/{token}', 'user/summary', 'user/wallet/summary', 'wallet/coin/withdraw/cancelled', 'wallet/coin/withdraw/completed', 'wallet/coin/withdraw/unverified', 'wallet/coin/withdraw/verified'],
                'post': ['login', 'login/initiate', 'login/password/forgot', 'mfa/authy/initiate', 'mfa/ga/initiate', 'signup', 'user/netki/update', 'user/profile/image/update', 'user/exchange/bank/coin/withdraw/initiate', 'user/exchange/bank/coin/withdraw/newVerifycode', 'user/exchange/bank/fiat/withdraw/initiate', 'user/exchange/bank/fiat/withdraw/newVerifycode', 'user/password/change', 'user/password/reset', 'user/wallet/coin/withdraw/initiate', 'wallet/coin/withdraw/newVerifycode'],
                'put': ['signup/verify/{token}', 'user/exchange/kyc', 'user/exchange/bank/fiat/deposit/new', 'user/exchange/ask/new', 'user/exchange/bid/new', 'user/exchange/instant/buy', 'user/exchange/instant/sell', 'user/exchange/bank/coin/withdraw/verify', 'user/exchange/bank/fiat/account/new', 'user/exchange/bank/fiat/withdraw/verify', 'user/mfa/authy/initiate/enable', 'user/mfa/ga/initiate/enable', 'user/netki/create', 'user/profile/phone/new', 'user/wallet/coin/address/new', 'user/wallet/coin/new', 'user/wallet/coin/withdraw/sendToExchange', 'user/wallet/coin/withdraw/verify'],
                'delete': ['user/gcm/{code}', 'user/logout', 'user/exchange/bank/coin/withdraw/unverified/cancel/{withdrawID}', 'user/exchange/bank/fiat/deposit/cancel/{depositID}', 'user/exchange/ask/cancel/{orderID}', 'user/exchange/bid/cancel/{orderID}', 'user/exchange/bank/fiat/withdraw/unverified/cancel/{withdrawID}', 'user/mfa/authy/disable/{code}', 'user/mfa/ga/disable/{code}', 'user/profile/phone/delete', 'user/profile/image/delete/{netkiName}', 'user/wallet/coin/withdraw/unverified/cancel/{withdrawID}']
            }
        },
        'products': {
            'BTC/INR': { 'id': 'BTC/INR', 'symbol': 'BTC/INR', 'base': 'BTC', 'quote': 'INR' }
        },

        fetchBalance: function fetchBalance() {
            return this.privateGetUserExchangeBankSummary();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var bids,
                asks,
                orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this65 = this;

            return Promise.resolve().then(function () {
                return _this65.publicGetExchangeBidOrders();
            }).then(function (_resp) {
                bids = _resp;
                return _this65.publicGetExchangeAskOrders();
            }).then(function (_resp) {
                asks = _resp;
                orderbook = {
                    'bids': bids['message'],
                    'asks': asks['message']
                };
                timestamp = _this65.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this65.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = order['rate'];
                        amount = order['vol'];

                        result[side].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this66 = this;

            return Promise.resolve().then(function () {
                return _this66.publicGetExchangeTicker();
            }).then(function (_resp) {
                response = _resp;
                ticker = response['message'];
                timestamp = ticker['timestamp'];

                return {
                    'timestamp': timestamp,
                    'datetime': _this66.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': undefined,
                    'open': parseFloat(ticker['open']),
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['lastPrice']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': parseFloat(ticker['coinvolume']),
                    'quoteVolume': parseFloat(ticker['fiatvolume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetExchangeTrades();
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var method = 'privatePutUserExchange';
            var order = {};
            if (type == 'market') {
                method += 'Instant' + this.capitalize(side);
                if (side == 'buy') order['maxFiat'] = amount;else order['maxVol'] = amount;
            } else {
                var direction = side == 'buy' ? 'Bid' : 'Ask';
                method += direction + 'New';
                order['rate'] = price;
                order['vol'] = amount;
            }
            return this[method](self.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams(path, params);
            var query = this.omit(params, this.extractParams(path));
            if (type == 'private') {
                headers = { 'Authorization': this.apiKey };
                if (Object.keys(query).length) {
                    body = JSON.stringify(query);
                    headers['Content-Type'] = 'application/json';
                }
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var exmo = {

        'id': 'exmo',
        'name': 'EXMO',
        'countries': ['ES', 'RU'], // Spain, Russia
        'rateLimit': 1000, // once every 350 ms ≈ 180 requests per minute ≈ 3 requests per second
        'version': 'v1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg',
            'api': 'https://api.exmo.com',
            'www': 'https://exmo.me',
            'doc': ['https://exmo.me/ru/api_doc', 'https://github.com/exmo-dev/exmo_api_lib/tree/master/nodejs']
        },
        'api': {
            'public': {
                'get': ['currency', 'order_book', 'pair_settings', 'ticker', 'trades']
            },
            'private': {
                'post': ['user_info', 'order_create', 'order_cancel', 'user_open_orders', 'user_trades', 'user_cancelled_orders', 'order_trades', 'required_amount', 'deposit_address', 'withdraw_crypt', 'withdraw_get_txid', 'excode_create', 'excode_load', 'wallet_history']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                keys,
                result,
                p,
                id,
                product,
                symbol,
                _symbol$split9,
                _symbol$split10,
                base,
                quote,
                _this67 = this;

            return Promise.resolve().then(function () {
                return _this67.publicGetPairSettings();
            }).then(function (_resp) {
                products = _resp;
                keys = Object.keys(products);
                result = [];

                for (p = 0; p < keys.length; p++) {
                    id = keys[p];
                    product = products[id];
                    symbol = id.replace('_', '/');
                    _symbol$split9 = symbol.split('/');
                    _symbol$split10 = _slicedToArray(_symbol$split9, 2);
                    base = _symbol$split10[0];
                    quote = _symbol$split10[1];

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privatePostUserInfo();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var p,
                response,
                orderbook,
                timestamp,
                result,
                sides,
                keys,
                k,
                key,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this68 = this;

            return Promise.resolve().then(function () {
                p = _this68.product(product);
                return _this68.publicGetOrderBook({
                    'pair': p['id']
                });
            }).then(function (_resp) {
                response = _resp;
                orderbook = response[p['id']];
                timestamp = _this68.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this68.iso8601(timestamp)
                };
                sides = { 'bids': 'bid', 'asks': 'ask' };
                keys = Object.keys(sides);

                for (k = 0; k < keys.length; k++) {
                    key = keys[k];
                    side = sides[key];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order[0]);
                        amount = parseFloat(order[1]);

                        result[key].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                p,
                ticker,
                timestamp,
                _this69 = this;

            return Promise.resolve().then(function () {
                return _this69.publicGetTicker();
            }).then(function (_resp) {
                response = _resp;
                p = _this69.product(product);
                ticker = response[p['id']];
                timestamp = ticker['updated'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this69.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['buy_price']),
                    'ask': parseFloat(ticker['sell_price']),
                    'vwap': undefined,
                    'open': parseFloat(ticker['open']),
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last_trade']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': parseFloat(ticker['avg']),
                    'baseVolume': parseFloat(ticker['vol']),
                    'quoteVolume': parseFloat(ticker['vol_curr']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTrades({
                'pair': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var prefix = '';
            if (type == 'market') prefix = 'market_';
            var order = {
                'pair': this.productId(product),
                'quantity': amount,
                'price': price || 0,
                'type': prefix + side
            };
            return this.privatePostOrderCreate(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/' + path;
            if (type == 'public') {
                if (Object.keys(params).length) url += '?' + this.urlencode(params);
            } else {
                var nonce = this.nonce();
                body = this.urlencode(this.extend({ 'nonce': nonce }, params));
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length,
                    'Key': this.apiKey,
                    'Sign': this.hmac(body, this.secret, 'sha512')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var fyb = {

        'rateLimit': 2000,
        'api': {
            'public': {
                'get': ['ticker', 'tickerdetailed', 'orderbook', 'trades']
            },
            'private': {
                'post': ['test', 'getaccinfo', 'getpendingorders', 'getorderhistory', 'cancelpendingorder', 'placeorder', 'withdraw']
            }
        },

        fetchBalance: function fetchBalance() {
            return this.privatePostGetaccinfo();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this70 = this;

            return Promise.resolve().then(function () {
                return _this70.publicGetOrderbook();
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this70.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this70.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order[0]);
                        amount = parseFloat(order[1]);

                        result[side].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this71 = this;

            return Promise.resolve().then(function () {
                return _this71.publicGetTickerdetailed();
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this71.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this71.iso8601(timestamp),
                    'high': undefined,
                    'low': undefined,
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['vol']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTrades();
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            return this.privatePostPlaceorder(this.extend({
                'qty': amount,
                'price': price,
                'type': side[0].toUpperCase()
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + path;
            if (type == 'public') {
                url += '.json';
            } else {
                var nonce = this.nonce();
                body = this.urlencode(this.extend({ 'timestamp': nonce }, params));
                headers = {
                    'Content-type': 'application/x-www-form-urlencoded',
                    'key': this.apiKey,
                    'sig': this.hmac(body, this.secret, 'sha1')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var fybse = extend(fyb, {
        'id': 'fybse',
        'name': 'FYB-SE',
        'countries': 'SE', // Sweden
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766512-31019772-5edb-11e7-8241-2e675e6797f1.jpg',
            'api': 'https://www.fybse.se/api/SEK',
            'www': 'https://www.fybse.se',
            'doc': 'http://docs.fyb.apiary.io'
        },
        'products': {
            'BTC/SEK': { 'id': 'SEK', 'symbol': 'BTC/SEK', 'base': 'BTC', 'quote': 'SEK' }
        }
    });

    //-----------------------------------------------------------------------------

    var fybsg = extend(fyb, {
        'id': 'fybsg',
        'name': 'FYB-SG',
        'countries': 'SG', // Singapore
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766513-3364d56a-5edb-11e7-9e6b-d5898bb89c81.jpg',
            'api': 'https://www.fybsg.com/api/SGD',
            'www': 'https://www.fybsg.com',
            'doc': 'http://docs.fyb.apiary.io'
        },
        'products': {
            'BTC/SGD': { 'id': 'SGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' }
        }
    });

    //-----------------------------------------------------------------------------

    var gdax = {
        'id': 'gdax',
        'name': 'GDAX',
        'countries': 'US',
        'rateLimit': 1000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766527-b1be41c6-5edb-11e7-95f6-5b496c469e2c.jpg',
            'api': 'https://api.gdax.com',
            'www': 'https://www.gdax.com',
            'doc': 'https://docs.gdax.com'
        },
        'api': {
            'public': {
                'get': ['currencies', 'products', 'products/{id}/book', 'products/{id}/candles', 'products/{id}/stats', 'products/{id}/ticker', 'products/{id}/trades', 'time']
            },
            'private': {
                'get': ['accounts', 'accounts/{id}', 'accounts/{id}/holds', 'accounts/{id}/ledger', 'coinbase-accounts', 'fills', 'funding', 'orders', 'orders/{id}', 'payment-methods', 'position', 'reports/{id}', 'users/self/trailing-volume'],
                'post': ['deposits/coinbase-account', 'deposits/payment-method', 'funding/repay', 'orders', 'position/close', 'profiles/margin-transfer', 'reports', 'withdrawals/coinbase', 'withdrawals/crypto', 'withdrawals/payment-method'],
                'delete': ['orders', 'orders/{id}']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                p,
                product,
                id,
                base,
                quote,
                symbol,
                _this72 = this;

            return Promise.resolve().then(function () {
                return _this72.publicGetProducts();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products.length; p++) {
                    product = products[p];
                    id = product['id'];
                    base = product['base_currency'];
                    quote = product['quote_currency'];
                    symbol = base + '/' + quote;

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privateGetAccounts();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this73 = this;

            return Promise.resolve().then(function () {
                return _this73.publicGetProductsIdBook({
                    'id': _this73.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this73.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this73.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order[0]);
                        amount = parseFloat(order[1]);

                        result[side].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                ticker,
                quote,
                timestamp,
                _this74 = this;

            return Promise.resolve().then(function () {
                p = _this74.product(product);
                return _this74.publicGetProductsIdTicker({
                    'id': p['id']
                });
            }).then(function (_resp) {
                ticker = _resp;
                return _this74.publicGetProductsIdStats({
                    'id': p['id']
                });
            }).then(function (_resp) {
                quote = _resp;
                timestamp = _this74.parse8601(ticker['time']);

                return {
                    'timestamp': timestamp,
                    'datetime': _this74.iso8601(timestamp),
                    'high': parseFloat(quote['high']),
                    'low': parseFloat(quote['low']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': undefined,
                    'open': parseFloat(quote['open']),
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(quote['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetProductsIdTrades({
                'id': this.productId(product) // fixes issue #2
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'client_oid': this.nonce(),
                'product_id': this.productId(product),
                'side': side,
                'size': amount,
                'type': type
            };
            if (type == 'limit') order['price'] = price;
            return this.privatePostOrder(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var request = '/' + this.implodeParams(path, params);
            var url = this.urls['api'] + request;
            var query = this.omit(params, this.extractParams(path));
            if (type == 'public') {
                if (Object.keys(query).length) url += '?' + this.urlencode(query);
            } else {
                var nonce = this.nonce().toString();
                if (Object.keys(query).length) body = JSON.stringify(query);
                var what = nonce + method + request + (body || '');
                var secret = this.base64ToBinary(this.secret);
                var signature = this.hash(what, secret, 'sha256', 'binary');
                headers = {
                    'CB-ACCESS-KEY': this.apiKey,
                    'CB-ACCESS-SIGN': this.stringToBase64(signature),
                    'CB-ACCESS-TIMESTAMP': nonce,
                    'CB-ACCESS-PASSPHRASE': this.password
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------
    // TBD REQUIRES 2FA VIA AUTHY, A BANK ACCOUNT, IDENTITY VERIFICATION TO START

    var gemini = {
        'id': 'gemini',
        'name': 'Gemini',
        'countries': 'US',
        'rateLimit': 2000, // 200 for private API
        'version': 'v1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg',
            'api': 'https://api.gemini.com',
            'www': 'https://gemini.com',
            'doc': 'https://docs.gemini.com/rest-api'
        },
        'api': {
            'public': {
                'get': ['symbols', 'pubticker/{symbol}', 'book/{symbol}', 'trades/{symbol}', 'auction/{symbol}', 'auction/{symbol}/history']
            },
            'private': {
                'post': ['order/new', 'order/cancel', 'order/cancel/session', 'order/cancel/all', 'order/status', 'orders', 'mytrades', 'tradevolume', 'balances', 'deposit/{currency}/newAddress', 'withdraw/{currency}', 'heartbeat']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                p,
                product,
                id,
                uppercaseProduct,
                base,
                quote,
                symbol,
                _this75 = this;

            return Promise.resolve().then(function () {
                return _this75.publicGetSymbols();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products.length; p++) {
                    product = products[p];
                    id = product;
                    uppercaseProduct = product.toUpperCase();
                    base = uppercaseProduct.slice(0, 3);
                    quote = uppercaseProduct.slice(3, 6);
                    symbol = base + '/' + quote;

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _timestamp4,
                _this76 = this;

            return Promise.resolve().then(function () {
                return _this76.publicGetBookSymbol({
                    'symbol': _this76.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this76.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this76.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order['price']);
                        amount = parseFloat(order['amount']);
                        _timestamp4 = parseInt(order['timestamp']) * 1000;

                        result[side].push([price, amount, _timestamp4]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                ticker,
                timestamp,
                baseVolume,
                quoteVolume,
                _this77 = this;

            return Promise.resolve().then(function () {
                p = _this77.product(product);
                return _this77.publicGetPubtickerSymbol({
                    'symbol': p['id']
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['volume']['timestamp'];
                baseVolume = p['base'];
                quoteVolume = p['quote'];

                return {
                    'timestamp': timestamp,
                    'datetime': _this77.iso8601(timestamp),
                    'high': undefined,
                    'low': undefined,
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': parseFloat(ticker['volume'][baseVolume]),
                    'quoteVolume': parseFloat(ticker['volume'][quoteVolume]),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTradesSymbol({
                'symbol': this.productId(product)
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privatePostBalances();
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            if (type == 'market') throw new Error(this.id + ' allows limit orders only');
            var order = {
                'client_order_id': this.nonce(),
                'symbol': this.productId(product),
                'amount': amount.toString(),
                'price': price.toString(),
                'side': side,
                'type': 'exchange limit' // gemini allows limit orders only
            };
            return this.privatePostOrderNew(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = '/' + this.version + '/' + this.implodeParams(path, params);
            var query = this.omit(params, this.extractParams(path));
            if (type == 'public') {
                if (Object.keys(query).length) url += '?' + this.urlencode(query);
            } else {
                var nonce = this.nonce();
                var request = this.extend({
                    'request': url,
                    'nonce': nonce
                }, query);
                var payload = this.stringToBase64(JSON.stringify(request));
                var signature = this.hmac(payload, this.secret, 'sha384');
                headers = {
                    'Content-Type': 'text/plain',
                    'Content-Length': 0,
                    'X-GEMINI-APIKEY': this.apiKey,
                    'X-GEMINI-PAYLOAD': payload,
                    'X-GEMINI-SIGNATURE': signature
                };
            }
            url = this.urls['api'] + url;
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var hitbtc = {

        'id': 'hitbtc',
        'name': 'HitBTC',
        'countries': 'HK', // Hong Kong
        'rateLimit': 2000,
        'version': '1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
            'api': 'http://api.hitbtc.com',
            'www': 'https://hitbtc.com',
            'doc': ['https://hitbtc.com/api', 'http://hitbtc-com.github.io/hitbtc-api', 'http://jsfiddle.net/bmknight/RqbYB']
        },
        'api': {
            'public': {
                'get': ['{symbol}/orderbook', '{symbol}/ticker', '{symbol}/trades', '{symbol}/trades/recent', 'symbols', 'ticker', 'time,']
            },
            'trading': {
                'get': ['balance', 'orders/active', 'orders/recent', 'order', 'trades/by/order', 'trades'],
                'post': ['new_order', 'cancel_order', 'cancel_orders']
            },
            'payment': {
                'get': ['balance', 'address/{currency}', 'transactions', 'transactions/{transaction}'],
                'post': ['transfer_to_trading', 'transfer_to_main', 'address/{currency}', 'payout']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                p,
                product,
                id,
                base,
                quote,
                symbol,
                _this78 = this;

            return Promise.resolve().then(function () {
                return _this78.publicGetSymbols();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products['symbols'].length; p++) {
                    product = products['symbols'][p];
                    id = product['symbol'];
                    base = product['commodity'];
                    quote = product['currency'];
                    symbol = base + '/' + quote;

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.tradingGetBalance();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this79 = this;

            return Promise.resolve().then(function () {
                return _this79.publicGetSymbolOrderbook({
                    'symbol': _this79.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this79.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this79.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order[0]);
                        amount = parseFloat(order[1]);

                        result[side].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this80 = this;

            return Promise.resolve().then(function () {
                return _this80.publicGetSymbolTicker({
                    'symbol': _this80.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['timestamp'];

                return {
                    'timestamp': timestamp,
                    'datetime': _this80.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': undefined,
                    'open': parseFloat(ticker['open']),
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': parseFloat(ticker['volume']),
                    'quoteVolume': parseFloat(ticker['volume_quote']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetSymbolTrades({
                'symbol': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'clientOrderId': this.nonce(),
                'symbol': this.productId(product),
                'side': side,
                'quantity': amount,
                'type': type
            };
            if (type == 'limit') order['price'] = price;
            return this.tradingPostNewOrder(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = '/api/' + this.version + '/' + type + '/' + this.implodeParams(path, params);
            var query = this.omit(params, this.extractParams(path));
            if (type == 'public') {
                if (Object.keys(query).length) url += '?' + this.urlencode(query);
            } else {
                var nonce = this.nonce();
                query = this.extend({ 'nonce': nonce, 'apikey': this.apiKey }, query);
                if (method == 'POST') if (Object.keys(query).length) body = this.urlencode(query);
                if (Object.keys(query).length) url += '?' + this.urlencode(query);
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Signature': this.hmac(url + (body || ''), this.secret, 'sha512').toLowerCase()
                };
            }
            url = this.urls['api'] + url;
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var huobi = {

        'id': 'huobi',
        'name': 'Huobi',
        'countries': 'CN',
        'rateLimit': 5000,
        'version': 'v3',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
            'api': 'http://api.huobi.com',
            'www': 'https://www.huobi.com',
            'doc': 'https://github.com/huobiapi/API_Docs_en/wiki'
        },
        'api': {
            'staticmarket': {
                'get': ['{id}_kline_{period}', 'ticker_{id}', 'depth_{id}', 'depth_{id}_{length}', 'detail_{id}']
            },
            'usdmarket': {
                'get': ['{id}_kline_{period}', 'ticker_{id}', 'depth_{id}', 'depth_{id}_{length}', 'detail_{id}']
            },
            'trade': {
                'post': ['get_account_info', 'get_orders', 'order_info', 'buy', 'sell', 'buy_market', 'sell_market', 'cancel_order', 'get_new_deal_orders', 'get_order_id_by_trade_id', 'withdraw_coin', 'cancel_withdraw_coin', 'get_withdraw_coin_result', 'transfer', 'loan', 'repayment', 'get_loan_available', 'get_loans']
            }
        },
        'products': {
            'BTC/CNY': { 'id': 'btc', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', 'type': 'staticmarket', 'coinType': 1 },
            'LTC/CNY': { 'id': 'ltc', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY', 'type': 'staticmarket', 'coinType': 2 },
            'BTC/USD': { 'id': 'btc', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'type': 'usdmarket', 'coinType': 1 }
        },

        fetchBalance: function fetchBalance() {
            return this.tradePostGetAccountInfo();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var p,
                method,
                orderbook,
                timestamp,
                result,
                _this81 = this;

            return Promise.resolve().then(function () {
                p = _this81.product(product);
                method = p['type'] + 'GetDepthId';
                return _this81[method]({ 'id': p['id'] });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this81.milliseconds();
                result = {
                    'bids': orderbook['bids'],
                    'asks': orderbook['asks'],
                    'timestamp': timestamp,
                    'datetime': _this81.iso8601(timestamp)
                };

                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                method,
                response,
                ticker,
                timestamp,
                _this82 = this;

            return Promise.resolve().then(function () {
                p = _this82.product(product);
                method = p['type'] + 'GetTickerId';
                return _this82[method]({ 'id': p['id'] });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['ticker'];
                timestamp = parseInt(response['time']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this82.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['buy']),
                    'ask': parseFloat(ticker['sell']),
                    'vwap': undefined,
                    'open': parseFloat(ticker['open']),
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['vol']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            var p = this.product(product);
            var method = p['type'] + 'GetDetailId';
            return this[method]({ 'id': p['id'] });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var p = this.product(product);
            var method = 'tradePost' + this.capitalize(side);
            var order = {
                'coin_type': p['coinType'],
                'amount': amount,
                'market': p['quote'].toLowerCase()
            };
            if (type == 'limit') order['price'] = price;else method += this.capitalize(type);
            return this[method](this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'trade';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'];
            if (type == 'trade') {
                url += '/api' + this.version;
                var query = this.keysort(this.extend({
                    'method': path,
                    'access_key': this.apiKey,
                    'created': this.nonce()
                }, params));
                var queryString = this.urlencode(this.omit(query, 'market'));
                // secret key must be at the end of query to be signed
                queryString += '&secret_key=' + this.secret;
                query['sign'] = this.hash(queryString);
                body = this.urlencode(query);
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length
                };
            } else {
                url += '/' + type + '/' + this.implodeParams(path, params) + '_json.js';
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var itbit = {

        'id': 'itbit',
        'name': 'itBit',
        'countries': 'US',
        'rateLimit': 3000,
        'version': 'v1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg',
            'api': 'https://api.itbit.com',
            'www': 'https://www.itbit.com',
            'doc': ['https://www.itbit.com/api', 'https://api.itbit.com/docs']
        },
        'api': {
            'public': {
                'get': ['markets/{symbol}/ticker', 'markets/{symbol}/order_book', 'markets/{symbol}/trades']
            },
            'private': {
                'get': ['wallets', 'wallets/{walletId}', 'wallets/{walletId}/balances/{currencyCode}', 'wallets/{walletId}/funding_history', 'wallets/{walletId}/trades', 'wallets/{walletId}/orders/{orderId}'],
                'post': ['wallet_transfers', 'wallets', 'wallets/{walletId}/cryptocurrency_deposits', 'wallets/{walletId}/cryptocurrency_withdrawals', 'wallets/{walletId}/orders', 'wire_withdrawal'],
                'delete': ['wallets/{walletId}/orders/{orderId}']
            }
        },
        'products': {
            'BTC/USD': { 'id': 'XBTUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
            'BTC/SGD': { 'id': 'XBTSGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' },
            'BTC/EUR': { 'id': 'XBTEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' }
        },

        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _this83 = this;

            return Promise.resolve().then(function () {
                return _this83.publicGetMarketsSymbolOrderBook({
                    'symbol': _this83.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this83.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this83.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order[0]);
                        amount = parseFloat(order[1]);

                        result[side].push([price, amount]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this84 = this;

            return Promise.resolve().then(function () {
                return _this84.publicGetMarketsSymbolTicker({
                    'symbol': _this84.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this84.parse8601(ticker['serverTimeUTC']);

                return {
                    'timestamp': timestamp,
                    'datetime': _this84.iso8601(timestamp),
                    'high': parseFloat(ticker['high24h']),
                    'low': parseFloat(ticker['low24h']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': parseFloat(ticker['vwap24h']),
                    'open': parseFloat(ticker['openToday']),
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['lastPrice']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['volume24h']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetMarketsSymbolTrades({
                'symbol': this.productId(product)
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privateGetWallets();
        },
        nonce: function nonce() {
            return this.milliseconds();
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            if (type == 'market') throw new Error(this.id + ' allows limit orders only');
            amount = amount.toString();
            price = price.toString();
            var p = this.product(product);
            var order = {
                'side': side,
                'type': type,
                'currency': p['base'],
                'amount': amount,
                'display': amount,
                'price': price,
                'instrument': p['id']
            };
            return this.privatePostTradeAdd(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams(path, params);
            var query = this.omit(params, this.extractParams(path));
            if (type == 'public') {
                if (Object.keys(query).length) url += '?' + this.urlencode(query);
            } else {
                if (Object.keys(query).length) body = JSON.stringify(query);else body = '';
                var nonce = this.nonce().toString();
                var timestamp = nonce;
                var auth = [method, url, body, nonce, timestamp];
                var message = nonce + JSON.stringify(auth);
                var hashedMessage = this.hash(message, 'sha256', 'binary');
                var signature = this.hmac(url + hashedMessage, this.secret, 'sha512', 'base64');
                headers = {
                    'Authorization': self.apiKey + ':' + signature,
                    'Content-Type': 'application/json',
                    'X-Auth-Timestamp': timestamp,
                    'X-Auth-Nonce': nonce
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var jubi = {

        'id': 'jubi',
        'name': 'jubi.com',
        'countries': 'CN',
        'rateLimit': 2000,
        'version': 'v1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766581-9d397d9a-5edd-11e7-8fb9-5d8236c0e692.jpg',
            'api': 'https://www.jubi.com/api',
            'www': 'https://www.jubi.com',
            'doc': 'https://www.jubi.com/help/api.html'
        },
        'api': {
            'public': {
                'get': ['depth', 'orders', 'ticker']
            },
            'private': {
                'post': ['balance', 'trade_add', 'trade_cancel', 'trade_list', 'trade_view', 'wallet']
            }
        },
        'products': {
            'BTC/CNY': { 'id': 'btc', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY' },
            'ETH/CNY': { 'id': 'eth', 'symbol': 'ETH/CNY', 'base': 'ETH', 'quote': 'CNY' },
            'ANS/CNY': { 'id': 'ans', 'symbol': 'ANS/CNY', 'base': 'ANS', 'quote': 'CNY' },
            'BLK/CNY': { 'id': 'blk', 'symbol': 'BLK/CNY', 'base': 'BLK', 'quote': 'CNY' },
            'DNC/CNY': { 'id': 'dnc', 'symbol': 'DNC/CNY', 'base': 'DNC', 'quote': 'CNY' },
            'DOGE/CNY': { 'id': 'doge', 'symbol': 'DOGE/CNY', 'base': 'DOGE', 'quote': 'CNY' },
            'EAC/CNY': { 'id': 'eac', 'symbol': 'EAC/CNY', 'base': 'EAC', 'quote': 'CNY' },
            'ETC/CNY': { 'id': 'etc', 'symbol': 'ETC/CNY', 'base': 'ETC', 'quote': 'CNY' },
            'FZ/CNY': { 'id': 'fz', 'symbol': 'FZ/CNY', 'base': 'FZ', 'quote': 'CNY' },
            'GOOC/CNY': { 'id': 'gooc', 'symbol': 'GOOC/CNY', 'base': 'GOOC', 'quote': 'CNY' },
            'GAME/CNY': { 'id': 'game', 'symbol': 'GAME/CNY', 'base': 'GAME', 'quote': 'CNY' },
            'HLB/CNY': { 'id': 'hlb', 'symbol': 'HLB/CNY', 'base': 'HLB', 'quote': 'CNY' },
            'IFC/CNY': { 'id': 'ifc', 'symbol': 'IFC/CNY', 'base': 'IFC', 'quote': 'CNY' },
            'JBC/CNY': { 'id': 'jbc', 'symbol': 'JBC/CNY', 'base': 'JBC', 'quote': 'CNY' },
            'KTC/CNY': { 'id': 'ktc', 'symbol': 'KTC/CNY', 'base': 'KTC', 'quote': 'CNY' },
            'LKC/CNY': { 'id': 'lkc', 'symbol': 'LKC/CNY', 'base': 'LKC', 'quote': 'CNY' },
            'LSK/CNY': { 'id': 'lsk', 'symbol': 'LSK/CNY', 'base': 'LSK', 'quote': 'CNY' },
            'LTC/CNY': { 'id': 'ltc', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY' },
            'MAX/CNY': { 'id': 'max', 'symbol': 'MAX/CNY', 'base': 'MAX', 'quote': 'CNY' },
            'MET/CNY': { 'id': 'met', 'symbol': 'MET/CNY', 'base': 'MET', 'quote': 'CNY' },
            'MRYC/CNY': { 'id': 'mryc', 'symbol': 'MRYC/CNY', 'base': 'MRYC', 'quote': 'CNY' },
            'MTC/CNY': { 'id': 'mtc', 'symbol': 'MTC/CNY', 'base': 'MTC', 'quote': 'CNY' },
            'NXT/CNY': { 'id': 'nxt', 'symbol': 'NXT/CNY', 'base': 'NXT', 'quote': 'CNY' },
            'PEB/CNY': { 'id': 'peb', 'symbol': 'PEB/CNY', 'base': 'PEB', 'quote': 'CNY' },
            'PGC/CNY': { 'id': 'pgc', 'symbol': 'PGC/CNY', 'base': 'PGC', 'quote': 'CNY' },
            'PLC/CNY': { 'id': 'plc', 'symbol': 'PLC/CNY', 'base': 'PLC', 'quote': 'CNY' },
            'PPC/CNY': { 'id': 'ppc', 'symbol': 'PPC/CNY', 'base': 'PPC', 'quote': 'CNY' },
            'QEC/CNY': { 'id': 'qec', 'symbol': 'QEC/CNY', 'base': 'QEC', 'quote': 'CNY' },
            'RIO/CNY': { 'id': 'rio', 'symbol': 'RIO/CNY', 'base': 'RIO', 'quote': 'CNY' },
            'RSS/CNY': { 'id': 'rss', 'symbol': 'RSS/CNY', 'base': 'RSS', 'quote': 'CNY' },
            'SKT/CNY': { 'id': 'skt', 'symbol': 'SKT/CNY', 'base': 'SKT', 'quote': 'CNY' },
            'TFC/CNY': { 'id': 'tfc', 'symbol': 'TFC/CNY', 'base': 'TFC', 'quote': 'CNY' },
            'VRC/CNY': { 'id': 'vrc', 'symbol': 'VRC/CNY', 'base': 'VRC', 'quote': 'CNY' },
            'VTC/CNY': { 'id': 'vtc', 'symbol': 'VTC/CNY', 'base': 'VTC', 'quote': 'CNY' },
            'WDC/CNY': { 'id': 'wdc', 'symbol': 'WDC/CNY', 'base': 'WDC', 'quote': 'CNY' },
            'XAS/CNY': { 'id': 'xas', 'symbol': 'XAS/CNY', 'base': 'XAS', 'quote': 'CNY' },
            'XPM/CNY': { 'id': 'xpm', 'symbol': 'XPM/CNY', 'base': 'XPM', 'quote': 'CNY' },
            'XRP/CNY': { 'id': 'xrp', 'symbol': 'XRP/CNY', 'base': 'XRP', 'quote': 'CNY' },
            'XSGS/CNY': { 'id': 'xsgs', 'symbol': 'XSGS/CNY', 'base': 'XSGS', 'quote': 'CNY' },
            'YTC/CNY': { 'id': 'ytc', 'symbol': 'YTC/CNY', 'base': 'YTC', 'quote': 'CNY' },
            'ZET/CNY': { 'id': 'zet', 'symbol': 'ZET/CNY', 'base': 'ZET', 'quote': 'CNY' },
            'ZCC/CNY': { 'id': 'zcc', 'symbol': 'ZCC/CNY', 'base': 'ZCC', 'quote': 'CNY' }
        },

        fetchBalance: function fetchBalance() {
            return this.privatePostBalance();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var orderbook,
                timestamp,
                result,
                _this85 = this;

            return Promise.resolve().then(function () {
                return _this85.publicGetDepth({
                    'coin': _this85.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this85.milliseconds();
                result = {
                    'bids': orderbook['bids'],
                    'asks': orderbook['asks'],
                    'timestamp': timestamp,
                    'datetime': _this85.iso8601(timestamp)
                };

                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this86 = this;

            return Promise.resolve().then(function () {
                return _this86.publicGetTicker({
                    'coin': _this86.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this86.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this86.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['buy']),
                    'ask': parseFloat(ticker['sell']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': parseFloat(ticker['vol']),
                    'quoteVolume': parseFloat(ticker['volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetOrders({
                'coin': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            return this.privatePostTradeAdd(this.extend({
                'amount': amount,
                'price': price,
                'type': side,
                'coin': this.productId(product)
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/' + path;
            if (type == 'public') {
                if (Object.keys(params).length) url += '?' + this.urlencode(params);
            } else {
                var nonce = this.nonce().toString();
                var query = this.extend({
                    'key': this.apiKey,
                    'nonce': nonce
                }, params);
                query['signature'] = this.hmac(this.urlencode(query), this.hash(this.secret));
                body = this.urlencode(query);
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------
    // kraken is also owner of ex. Coinsetter / CaVirtEx / Clevercoin

    var kraken = {

        'id': 'kraken',
        'name': 'Kraken',
        'countries': 'US',
        'version': '0',
        'rateLimit': 3000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg',
            'api': 'https://api.kraken.com',
            'www': 'https://www.kraken.com',
            'doc': ['https://www.kraken.com/en-us/help/api', 'https://github.com/nothingisdead/npm-kraken-api']
        },
        'api': {
            'public': {
                'get': ['Assets', 'AssetPairs', 'Depth', 'OHLC', 'Spread', 'Ticker', 'Time', 'Trades']
            },
            'private': {
                'post': ['AddOrder', 'Balance', 'CancelOrder', 'ClosedOrders', 'DepositAddresses', 'DepositMethods', 'DepositStatus', 'Ledgers', 'OpenOrders', 'OpenPositions', 'QueryLedgers', 'QueryOrders', 'QueryTrades', 'TradeBalance', 'TradesHistory', 'TradeVolume', 'Withdraw', 'WithdrawCancel', 'WithdrawInfo', 'WithdrawStatus']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                keys,
                result,
                p,
                id,
                product,
                base,
                quote,
                darkpool,
                symbol,
                _this87 = this;

            return Promise.resolve().then(function () {
                return _this87.publicGetAssetPairs();
            }).then(function (_resp) {
                products = _resp;
                keys = Object.keys(products['result']);
                result = [];

                for (p = 0; p < keys.length; p++) {
                    id = keys[p];
                    product = products['result'][id];
                    base = product['base'];
                    quote = product['quote'];

                    if (base[0] == 'X' || base[0] == 'Z') {
                        base = base.slice(1);
                    }if (quote[0] == 'X' || quote[0] == 'Z') {
                        quote = quote.slice(1);
                    }base = _this87.commonCurrencyCode(base);
                    quote = _this87.commonCurrencyCode(quote);
                    darkpool = id.indexOf('.d') >= 0;
                    symbol = darkpool ? product['altname'] : base + '/' + quote;

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var p,
                response,
                orderbook,
                timestamp,
                result,
                sides,
                s,
                side,
                orders,
                i,
                order,
                price,
                amount,
                _timestamp5,
                _this88 = this;

            return Promise.resolve().then(function () {
                p = _this88.product(product);
                return _this88.publicGetDepth({
                    'pair': p['id']
                });
            }).then(function (_resp) {
                response = _resp;
                orderbook = response['result'][p['id']];
                timestamp = _this88.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this88.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order[0]);
                        amount = parseFloat(order[1]);
                        _timestamp5 = order[2] * 1000;

                        result[side].push([price, amount, _timestamp5]);
                    }
                }
                return result;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                response,
                ticker,
                timestamp,
                _this89 = this;

            return Promise.resolve().then(function () {
                p = _this89.product(product);
                return _this89.publicGetTicker({
                    'pair': p['id']
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['result'][p['id']];
                timestamp = _this89.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this89.iso8601(timestamp),
                    'high': parseFloat(ticker['h'][1]),
                    'low': parseFloat(ticker['l'][1]),
                    'bid': parseFloat(ticker['b'][0]),
                    'ask': parseFloat(ticker['a'][0]),
                    'vwap': parseFloat(ticker['p'][1]),
                    'open': parseFloat(ticker['o']),
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['c'][0]),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['v'][1]),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTrades({
                'pair': this.productId(product)
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privatePostBalance();
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'pair': this.productId(product),
                'type': side,
                'ordertype': type,
                'volume': amount
            };
            if (type == 'limit') order['price'] = price;
            return this.privatePostAddOrder(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = '/' + this.version + '/' + type + '/' + path;
            if (type == 'public') {
                if (Object.keys(params).length) url += '?' + this.urlencode(params);
            } else {
                var nonce = this.nonce().toString();
                var query = this.extend({ 'nonce': nonce }, params);
                body = this.urlencode(query);
                query = this.stringToBinary(url + this.hash(nonce + body, 'sha256', 'binary'));
                var secret = this.base64ToBinary(this.secret);
                headers = {
                    'API-Key': this.apiKey,
                    'API-Sign': this.hmac(query, secret, 'sha512', 'base64'),
                    'Content-type': 'application/x-www-form-urlencoded'
                };
            }
            url = this.urls['api'] + url;
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var luno = {

        'id': 'luno',
        'name': 'luno',
        'countries': ['GB', 'SG', 'ZA'],
        'rateLimit': 5000,
        'version': '1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg',
            'api': 'https://api.mybitx.com/api',
            'www': 'https://www.luno.com',
            'doc': ['https://npmjs.org/package/bitx', 'https://github.com/bausmeier/node-bitx']
        },
        'api': {
            'public': {
                'get': ['orderbook', 'ticker', 'tickers', 'trades']
            },
            'private': {
                'get': ['accounts/{id}/pending', 'accounts/{id}/transactions', 'balance', 'fee_info', 'funding_address', 'listorders', 'listtrades', 'orders/{id}', 'quotes/{id}', 'withdrawals', 'withdrawals/{id}'],
                'post': ['accounts', 'postorder', 'marketorder', 'stoporder', 'funding_address', 'withdrawals', 'send', 'quotes', 'oauth2/grant'],
                'put': ['quotes/{id}'],
                'delete': ['quotes/{id}', 'withdrawals/{id}']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                p,
                product,
                id,
                base,
                quote,
                symbol,
                _this90 = this;

            return Promise.resolve().then(function () {
                return _this90.publicGetTickers();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products['tickers'].length; p++) {
                    product = products['tickers'][p];
                    id = product['pair'];
                    base = id.slice(0, 3);
                    quote = id.slice(3, 6);

                    base = _this90.commonCurrencyCode(base);
                    quote = _this90.commonCurrencyCode(quote);
                    symbol = base + '/' + quote;

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privateGetBalance();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                _this91 = this;

            return Promise.resolve().then(function () {
                return _this91.publicGetOrderbook({
                    'pair': _this91.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this92 = this;

            return Promise.resolve().then(function () {
                return _this92.publicGetTicker({
                    'pair': _this92.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['timestamp'];

                return {
                    'timestamp': timestamp,
                    'datetime': _this92.iso8601(timestamp),
                    'high': undefined,
                    'low': undefined,
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last_trade']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['rolling_24_hour_volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTrades({
                'pair': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var method = 'privatePost';
            var order = { 'pair': this.productId(product) };
            if (type == 'market') {
                method += 'Marketorder';
                order['type'] = side.toUpperCase();
                if (side == 'buy') order['counter_volume'] = amount;else order['base_volume'] = amount;
            } else {
                method += 'Order';
                order['volume'] = amount;
                order['price'] = price;
                if (side == 'buy') order['type'] = 'BID';else order['type'] = 'ASK';
            }
            return this[method](this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams(path, params);
            var query = this.omit(params, this.extractParams(path));
            if (Object.keys(query).length) url += '?' + this.urlencode(query);
            if (type == 'private') {
                var auth = this.stringToBase64(this.apiKey + ':' + this.secret);
                headers = { 'Authorization': 'Basic ' + auth };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var mercado = {

        'id': 'mercado',
        'name': 'Mercado Bitcoin',
        'countries': 'BR', // Brazil
        'rateLimit': 1000,
        'version': 'v3',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg',
            'api': {
                'public': 'https://www.mercadobitcoin.net/api',
                'private': 'https://www.mercadobitcoin.net/tapi'
            },
            'www': 'https://www.mercadobitcoin.com.br',
            'doc': ['https://www.mercadobitcoin.com.br/api-doc', 'https://www.mercadobitcoin.com.br/trade-api']
        },
        'api': {
            'public': {
                'get': [// last slash critical
                'orderbook/', 'orderbook_litecoin/', 'ticker/', 'ticker_litecoin/', 'trades/', 'trades_litecoin/', 'v2/ticker/', 'v2/ticker_litecoin/']
            },
            'private': {
                'post': ['cancel_order', 'get_account_info', 'get_order', 'get_withdrawal', 'list_system_messages', 'list_orders', 'list_orderbook', 'place_buy_order', 'place_sell_order', 'withdraw_coin']
            }
        },
        'products': {
            'BTC/BRL': { 'id': 'BRLBTC', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'suffix': '' },
            'LTC/BRL': { 'id': 'BRLLTC', 'symbol': 'LTC/BRL', 'base': 'LTC', 'quote': 'BRL', 'suffix': 'Litecoin' }
        },

        fetchOrderBook: function fetchOrderBook(product) {
            var p,
                method,
                response,
                _this93 = this;

            return Promise.resolve().then(function () {
                p = _this93.product(product);
                method = 'publicGetOrderbook' + _this93.capitalize(p['suffix']);
                return _this93[method]();
            }).then(function (_resp) {
                response = _resp;

                return response;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                method,
                response,
                ticker,
                timestamp,
                _this94 = this;

            return Promise.resolve().then(function () {
                p = _this94.product(product);
                method = 'publicGetV2Ticker' + _this94.capitalize(p['suffix']);
                return _this94[method]();
            }).then(function (_resp) {
                response = _resp;
                ticker = response['ticker'];
                timestamp = parseInt(ticker['date']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this94.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['buy']),
                    'ask': parseFloat(ticker['sell']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['vol']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            var p = this.product(product);
            var method = 'publicGetTrades' + this.capitalize(p['suffix']);
            return this[method]();
        },
        fetchBalance: function fetchBalance() {
            return this.privatePostGetAccountInfo();
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            if (type == 'market') throw new Error(this.id + ' allows limit orders only');
            var method = 'privatePostPlace' + this.capitalize(side) + 'Order';
            var order = {
                'coin_pair': this.productId(product),
                'quantity': amount,
                'limit_price': price
            };
            return this[method](this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'][type] + '/';
            if (type == 'public') {
                url += path;
            } else {
                url += this.version + '/';
                var nonce = this.nonce();
                body = this.urlencode(this.extend({
                    'tapi_method': path,
                    'tapi_nonce': nonce
                }, params));
                var auth = '/tapi/' + this.version + '/' + '?' + body;
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'TAPI-ID': this.apiKey,
                    'TAPI-MAC': this.hmac(auth, this.secret, 'sha512')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------
    // OKCoin 
    // China
    // https://www.okcoin.com/
    // https://www.okcoin.com/rest_getStarted.html
    // https://github.com/OKCoin/websocket
    // https://www.npmjs.com/package/okcoin.com
    // https://www.okcoin.cn
    // https://www.okcoin.cn/rest_getStarted.html

    var okcoin = {

        'version': 'v1',
        'rateLimit': 2000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
        'api': {
            'public': {
                'get': ['depth', 'exchange_rate', 'future_depth', 'future_estimated_price', 'future_hold_amount', 'future_index', 'future_kline', 'future_price_limit', 'future_ticker', 'future_trades', 'kline', 'otcs', 'ticker', 'trades']
            },
            'private': {
                'post': ['account_records', 'batch_trade', 'borrow_money', 'borrow_order_info', 'borrows_info', 'cancel_borrow', 'cancel_order', 'cancel_otc_order', 'cancel_withdraw', 'future_batch_trade', 'future_cancel', 'future_devolve', 'future_explosive', 'future_order_info', 'future_orders_info', 'future_position', 'future_position_4fix', 'future_trade', 'future_trades_history', 'future_userinfo', 'future_userinfo_4fix', 'lend_depth', 'order_fee', 'order_history', 'order_info', 'orders_info', 'otc_order_history', 'otc_order_info', 'repayment', 'submit_otc_order', 'trade', 'trade_history', 'trade_otc_order', 'withdraw', 'withdraw_info', 'unrepayments_info', 'userinfo']
            }
        },

        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                _this95 = this;

            return Promise.resolve().then(function () {
                return _this95.publicGetDepth({
                    'symbol': _this95.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this96 = this;

            return Promise.resolve().then(function () {
                return _this96.publicGetTicker({
                    'symbol': _this96.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['ticker'];
                timestamp = parseInt(response['date']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this96.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['buy']),
                    'ask': parseFloat(ticker['sell']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['vol']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTrades({
                'symbol': this.productId(product)
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privatePostUserinfo();
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'symbol': this.productId(product),
                'type': side,
                'amount': amount
            };
            if (type == 'limit') order['price'] = price;else order['type'] += '_market';
            return this.privatePostTrade(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = '/api/' + this.version + '/' + path + '.do';
            if (type == 'public') {
                if (Object.keys(params).length) url += '?' + this.urlencode(params);
            } else {
                var query = this.keysort(this.extend({
                    'api_key': this.apiKey
                }, params));
                // secret key must be at the end of query
                var queryString = this.urlencode(query) + '&secret_key=' + this.secret;
                query['sign'] = this.hash(queryString).toUpperCase();
                body = this.urlencode(query);
                headers = { 'Content-type': 'application/x-www-form-urlencoded' };
            }
            url = this.urls['api'] + url;
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var okcoincny = extend(okcoin, {
        'id': 'okcoincny',
        'name': 'OKCoin CNY',
        'countries': 'CN',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766792-8be9157a-5ee5-11e7-926c-6d69b8d3378d.jpg',
            'api': 'https://www.okcoin.cn',
            'www': 'https://www.okcoin.cn',
            'doc': 'https://www.okcoin.cn/rest_getStarted.html'
        },
        'products': {
            'BTC/CNY': { 'id': 'btc_cny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY' },
            'LTC/CNY': { 'id': 'ltc_cny', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY' }
        }
    });

    //-----------------------------------------------------------------------------

    var okcoinusd = extend(okcoin, {
        'id': 'okcoinusd',
        'name': 'OKCoin USD',
        'countries': ['CN', 'US'],
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg',
            'api': 'https://www.okcoin.com',
            'www': 'https://www.okcoin.com',
            'doc': ['https://www.okcoin.com/rest_getStarted.html', 'https://www.npmjs.com/package/okcoin.com']
        },
        'products': {
            'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
            'LTC/USD': { 'id': 'ltc_usd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD' }
        }
    });

    //-----------------------------------------------------------------------------

    var paymium = {

        'id': 'paymium',
        'name': 'Paymium',
        'countries': ['FR', 'EU'],
        'rateLimit': 3000,
        'version': 'v1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27790564-a945a9d4-5ff9-11e7-9d2d-b635763f2f24.jpg',
            'api': 'https://paymium.com/api',
            'www': 'https://www.paymium.com',
            'doc': ['https://www.paymium.com/page/developers', 'https://github.com/Paymium/api-documentation']
        },
        'api': {
            'public': {
                'get': ['countries', 'data/{id}/ticker', 'data/{id}/trades', 'data/{id}/depth', 'bitcoin_charts/{id}/trades', 'bitcoin_charts/{id}/depth']
            },
            'private': {
                'get': ['merchant/get_payment/{UUID}', 'user', 'user/addresses', 'user/addresses/{btc_address}', 'user/orders', 'user/orders/{UUID}', 'user/price_alerts'],
                'post': ['user/orders', 'user/addresses', 'user/payment_requests', 'user/price_alerts', 'merchant/create_payment'],
                'delete': ['user/orders/{UUID}/cancel', 'user/price_alerts/{id}']
            }
        },
        'products': {
            'BTC/EUR': { 'id': 'eur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' }
        },

        fetchBalance: function fetchBalance() {
            return this.privateGetUser();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                _this97 = this;

            return Promise.resolve().then(function () {
                return _this97.publicGetDataIdDepth({
                    'id': _this97.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this98 = this;

            return Promise.resolve().then(function () {
                return _this98.publicGetDataIdTicker({
                    'id': _this98.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['at'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this98.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': parseFloat(ticker['vwap']),
                    'open': parseFloat(ticker['open']),
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['price']),
                    'change': undefined,
                    'percentage': parseFloat(ticker['variation']),
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetDataIdTrades({
                'id': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'type': this.capitalize(type) + 'Order',
                'currency': this.productId(product),
                'direction': side,
                'amount': amount
            };
            if (type == 'market') order['price'] = price;
            return this.privatePostUserOrders(this.extend(order, params));
        },
        cancelOrder: function cancelOrder(id) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return this.privatePostCancelOrder(this.extend({
                'orderNumber': id
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams(path, params);
            var query = this.omit(params, this.extractParams(path));
            if (type == 'public') {
                if (Object.keys(query).length) url += '?' + this.urlencode(query);
            } else {
                body = JSON.stringify(params);
                var nonce = this.nonce().toString();
                var auth = nonce + url + body;
                headers = {
                    'Api-Key': this.apiKey,
                    'Api-Signature': this.hmac(auth, this.secret),
                    'Api-Nonce': nonce,
                    'Content-Type': 'application/json'
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var poloniex = {

        'id': 'poloniex',
        'name': 'Poloniex',
        'countries': 'US',
        'rateLimit': 1000, // 6 calls per second
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
            'api': {
                'public': 'https://poloniex.com/public',
                'private': 'https://poloniex.com/tradingApi'
            },
            'www': 'https://poloniex.com',
            'doc': ['https://poloniex.com/support/api/', 'http://pastebin.com/dMX7mZE0']
        },
        'api': {
            'public': {
                'get': ['return24hVolume', 'returnChartData', 'returnCurrencies', 'returnLoanOrders', 'returnOrderBook', 'returnTicker', 'returnTradeHistory']
            },
            'private': {
                'post': ['buy', 'cancelLoanOffer', 'cancelOrder', 'closeMarginPosition', 'createLoanOffer', 'generateNewAddress', 'getMarginPosition', 'marginBuy', 'marginSell', 'moveOrder', 'returnActiveLoans', 'returnAvailableAccountBalances', 'returnBalances', 'returnCompleteBalances', 'returnDepositAddresses', 'returnDepositsWithdrawals', 'returnFeeInfo', 'returnLendingHistory', 'returnMarginAccountSummary', 'returnOpenLoanOffers', 'returnOpenOrders', 'returnOrderTrades', 'returnTradableBalances', 'returnTradeHistory', 'sell', 'toggleAutoRenew', 'transferBalance', 'withdraw']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                keys,
                result,
                p,
                id,
                product,
                symbol,
                _symbol$split11,
                _symbol$split12,
                base,
                quote,
                _this99 = this;

            return Promise.resolve().then(function () {
                return _this99.publicGetReturnTicker();
            }).then(function (_resp) {
                products = _resp;
                keys = Object.keys(products);
                result = [];

                for (p = 0; p < keys.length; p++) {
                    id = keys[p];
                    product = products[id];
                    symbol = id.replace('_', '/');
                    _symbol$split11 = symbol.split('/');
                    _symbol$split12 = _slicedToArray(_symbol$split11, 2);
                    base = _symbol$split12[0];
                    quote = _symbol$split12[1];

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privatePostReturnCompleteBalances({
                'account': 'all'
            });
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                _this100 = this;

            return Promise.resolve().then(function () {
                return _this100.publicGetReturnOrderBook({
                    'currencyPair': _this100.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                tickers,
                ticker,
                timestamp,
                _this101 = this;

            return Promise.resolve().then(function () {
                p = _this101.product(product);
                return _this101.publicGetReturnTicker();
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers[p['id']];
                timestamp = _this101.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this101.iso8601(timestamp),
                    'high': parseFloat(ticker['high24hr']),
                    'low': parseFloat(ticker['low24hr']),
                    'bid': parseFloat(ticker['highestBid']),
                    'ask': parseFloat(ticker['lowestAsk']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': undefined,
                    'change': parseFloat(ticker['percentChange']),
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': parseFloat(ticker['baseVolume']),
                    'quoteVolume': parseFloat(ticker['quoteVolume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetReturnTradeHistory({
                'currencyPair': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var method = 'privatePost' + this.capitalize(side);
            return this[method](this.extend({
                'currencyPair': this.productId(product),
                'rate': price,
                'amount': amount
            }, params));
        },
        cancelOrder: function cancelOrder(id) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return this.privatePostCancelOrder(this.extend({
                'orderNumber': id
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'][type];
            var query = this.extend({ 'command': path }, params);
            if (type == 'public') {
                url += '?' + this.urlencode(query);
            } else {
                query['nonce'] = this.nonce();
                body = this.urlencode(query);
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Key': this.apiKey,
                    'Sign': this.hmac(body, this.secret, 'sha512')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var quadrigacx = {

        'id': 'quadrigacx',
        'name': 'QuadrigaCX',
        'countries': 'CA',
        'rateLimit': 2000,
        'version': 'v2',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766825-98a6d0de-5ee7-11e7-9fa4-38e11a2c6f52.jpg',
            'api': 'https://api.quadrigacx.com',
            'www': 'https://www.quadrigacx.com',
            'doc': 'https://www.quadrigacx.com/api_info'
        },
        'api': {
            'public': {
                'get': ['order_book', 'ticker', 'transactions']
            },
            'private': {
                'post': ['balance', 'bitcoin_deposit_address', 'bitcoin_withdrawal', 'buy', 'cancel_order', 'ether_deposit_address', 'ether_withdrawal', 'lookup_order', 'open_orders', 'sell', 'user_transactions']
            }
        },
        'products': {
            'BTC/CAD': { 'id': 'btc_cad', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD' },
            'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
            'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
            'ETH/CAD': { 'id': 'eth_cad', 'symbol': 'ETH/CAD', 'base': 'ETH', 'quote': 'CAD' }
        },

        fetchBalance: function fetchBalance() {
            return this.privatePostBalance();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                _this102 = this;

            return Promise.resolve().then(function () {
                return _this102.publicGetOrderBook({
                    'book': _this102.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this103 = this;

            return Promise.resolve().then(function () {
                return _this103.publicGetTicker({
                    'book': _this103.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = parseInt(ticker['timestamp']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this103.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': parseFloat(ticker['vwap']),
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': undefined,
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTransactions({
                'book': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var method = 'privatePost' + this.capitalize(side);
            var order = {
                'amount': amount,
                'book': this.productId(product)
            };
            if (type == 'limit') order['price'] = price;
            return this[method](this.extend(order, params));
        },
        cancelOrder: function cancelOrder(id) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return this.privatePostCancelOrder(this.extend({ id: id }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/' + path;
            if (type == 'public') {
                url += '?' + this.urlencode(params);
            } else {
                var nonce = this.nonce();
                var request = [nonce, this.uid, this.apiKey].join('');
                var signature = this.hmac(request, this.secret);
                var query = this.extend({
                    'key': this.apiKey,
                    'nonce': nonce,
                    'signature': signature
                }, params);
                body = JSON.stringify(query);
                headers = {
                    'Content-Type': 'application/json',
                    'Content-Length': body.length
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var quoine = {

        'id': 'quoine',
        'name': 'QUOINE',
        'countries': ['JP', 'SG', 'VN'],
        'version': '2',
        'rateLimit': 2000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766844-9615a4e8-5ee8-11e7-8814-fcd004db8cdd.jpg',
            'api': 'https://api.quoine.com',
            'www': 'https://www.quoine.com',
            'doc': 'https://developers.quoine.com'
        },
        'api': {
            'public': {
                'get': ['products', 'products/{id}', 'products/{id}/price_levels', 'executions', 'ir_ladders/{currency}']
            },
            'private': {
                'get': ['accounts/balance', 'crypto_accounts', 'executions/me', 'fiat_accounts', 'loan_bids', 'loans', 'orders', 'orders/{id}', 'orders/{id}/trades', 'trades', 'trades/{id}/loans', 'trading_accounts', 'trading_accounts/{id}'],
                'post': ['fiat_accounts', 'loan_bids', 'orders'],
                'put': ['loan_bids/{id}/close', 'loans/{id}', 'orders/{id}', 'orders/{id}/cancel', 'trades/{id}', 'trades/{id}/close', 'trades/close_all', 'trading_accounts/{id}']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                p,
                product,
                id,
                base,
                quote,
                symbol,
                _this104 = this;

            return Promise.resolve().then(function () {
                return _this104.publicGetProducts();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products.length; p++) {
                    product = products[p];
                    id = product['id'];
                    base = product['base_currency'];
                    quote = product['quoted_currency'];
                    symbol = base + '/' + quote;

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privateGetAccountsBalance();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                _this105 = this;

            return Promise.resolve().then(function () {
                return _this105.publicGetProductsIdPriceLevels({
                    'id': _this105.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this106 = this;

            return Promise.resolve().then(function () {
                return _this106.publicGetProductsId({
                    'id': _this106.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this106.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this106.iso8601(timestamp),
                    'high': parseFloat(ticker['high_market_ask']),
                    'low': parseFloat(ticker['low_market_bid']),
                    'bid': parseFloat(ticker['market_bid']),
                    'ask': parseFloat(ticker['market_ask']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last_traded_price']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': parseFloat(ticker['volume_24h']),
                    'quoteVolume': undefined,
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetExecutions({
                'product_id': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'order_type': type,
                'product_id': this.productId(product),
                'side': side,
                'quantity': amount
            };
            if (type == 'limit') order['price'] = price;
            return this.privatePostOrders(this.extend({
                'order': order
            }, params));
        },
        cancelOrder: function cancelOrder(id) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return this.privatePutOrdersIdCancel(this.extend({
                'id': id
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = '/' + this.implodeParams(path, params);
            var query = this.omit(params, this.extractParams(path));
            headers = {
                'X-Quoine-API-Version': this.version,
                'Content-type': 'application/json'
            };
            if (type == 'public') {
                if (Object.keys(query).length) url += '?' + this.urlencode(query);
            } else {
                var nonce = this.nonce();
                var request = {
                    'path': url,
                    'nonce': nonce,
                    'token_id': this.apiKey,
                    'iat': Math.floor(nonce / 1000) // issued at
                };
                if (Object.keys(query).length) body = JSON.stringify(query);
                headers['X-Quoine-Auth'] = this.jwt(request, this.secret);
            }
            return this.fetch(this.urls['api'] + url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var therock = {

        'id': 'therock',
        'name': 'TheRockTrading',
        'countries': 'MT',
        'rateLimit': 1000,
        'version': 'v1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766869-75057fa2-5ee9-11e7-9a6f-13e641fa4707.jpg',
            'api': 'https://api.therocktrading.com',
            'www': 'https://therocktrading.com',
            'doc': 'https://api.therocktrading.com/doc/'
        },
        'api': {
            'public': {
                'get': ['funds/{id}/orderbook', 'funds/{id}/ticker', 'funds/{id}/trades', 'funds/tickers']
            },
            'private': {
                'get': ['balances', 'balances/{id}', 'discounts', 'discounts/{id}', 'funds', 'funds/{id}', 'funds/{id}/trades', 'funds/{fund_id}/orders', 'funds/{fund_id}/orders/{id}', 'funds/{fund_id}/position_balances', 'funds/{fund_id}/positions', 'funds/{fund_id}/positions/{id}', 'transactions', 'transactions/{id}', 'withdraw_limits/{id}', 'withdraw_limits'],
                'post': ['atms/withdraw', 'funds/{fund_id}/orders'],
                'delete': ['funds/{fund_id}/orders/{id}', 'funds/{fund_id}/orders/remove_all']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                p,
                product,
                id,
                base,
                quote,
                symbol,
                _this107 = this;

            return Promise.resolve().then(function () {
                return _this107.publicGetFundsTickers();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products['tickers'].length; p++) {
                    product = products['tickers'][p];
                    id = product['fund_id'];
                    base = id.slice(0, 3);
                    quote = id.slice(3, 6);
                    symbol = base + '/' + quote;

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privateGetBalances();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                _this108 = this;

            return Promise.resolve().then(function () {
                return _this108.publicGetFundsIdOrderbook({
                    'id': _this108.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this109 = this;

            return Promise.resolve().then(function () {
                return _this109.publicGetFundsIdTicker({
                    'id': _this109.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this109.parse8601(ticker['date']);

                return {
                    'timestamp': timestamp,
                    'datetime': _this109.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': undefined,
                    'open': parseFloat(ticker['open']),
                    'close': parseFloat(ticker['close']),
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': parseFloat(ticker['volume_traded']),
                    'quoteVolume': parseFloat(ticker['volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetFundsIdTrades({
                'id': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            if (type == 'market') throw new Error(this.id + ' allows limit orders only');
            return this.privatePostFundsFundIdOrders(this.extend({
                'fund_id': this.productId(product),
                'side': side,
                'amount': amount,
                'price': price
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams(path, params);
            var query = this.omit(params, this.extractParams(path));
            if (type == 'private') {
                var nonce = this.nonce().toString();
                headers = {
                    'X-TRT-KEY': this.apiKey,
                    'X-TRT-NONCE': nonce,
                    'X-TRT-SIGN': this.hmac(nonce + url, this.secret, 'sha512')
                };
                if (Object.keys(query).length) {
                    body = JSON.stringify(query);
                    headers['Content-Type'] = 'application/json';
                }
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var vaultoro = {

        'id': 'vaultoro',
        'name': 'Vaultoro',
        'countries': 'CH',
        'rateLimit': 1000,
        'version': '1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766880-f205e870-5ee9-11e7-8fe2-0d5b15880752.jpg',
            'api': 'https://api.vaultoro.com',
            'www': 'https://www.vaultoro.com',
            'doc': 'https://api.vaultoro.com'
        },
        'api': {
            'public': {
                'get': ['bidandask', 'buyorders', 'latest', 'latesttrades', 'markets', 'orderbook', 'sellorders', 'transactions/day', 'transactions/hour', 'transactions/month']
            },
            'private': {
                'get': ['balance', 'mytrades', 'orders'],
                'post': ['buy/{symbol}/{type}', 'cancel/{orderid', 'sell/{symbol}/{type}', 'withdraw']
            }
        },

        fetchProducts: function fetchProducts() {
            var result,
                products,
                product,
                base,
                quote,
                symbol,
                baseId,
                quoteId,
                id,
                _this110 = this;

            return Promise.resolve().then(function () {
                result = [];
                return _this110.publicGetMarkets();
            }).then(function (_resp) {
                products = _resp;
                product = products['data'];
                base = product['BaseCurrency'];
                quote = product['MarketCurrency'];
                symbol = base + '/' + quote;
                baseId = base;
                quoteId = quote;
                id = product['MarketName'];

                result.push({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'info': product
                });
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privateGetBalance();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                _this111 = this;

            return Promise.resolve().then(function () {
                return _this111.publicGetOrderbook();
            }).then(function (_resp) {
                response = _resp;

                return response;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var quote,
                bidsLength,
                bid,
                ask,
                response,
                ticker,
                timestamp,
                _this112 = this;

            return Promise.resolve().then(function () {
                return _this112.publicGetBidandask();
            }).then(function (_resp) {
                quote = _resp;
                bidsLength = quote['bids'].length;
                bid = quote['bids'][bidsLength - 1];
                ask = quote['asks'][0];
                return _this112.publicGetMarkets();
            }).then(function (_resp) {
                response = _resp;
                ticker = response['data'];
                timestamp = _this112.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this112.iso8601(timestamp),
                    'high': parseFloat(ticker['24hHigh']),
                    'low': parseFloat(ticker['24hLow']),
                    'bid': bid[0],
                    'ask': ask[0],
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['lastPrice']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['24hVolume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetTransactionsDay();
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var p = this.product(product);
            var method = 'privatePost' + this.capitalize(side) + 'SymbolType';
            return this[method](this.extend({
                'symbol': p['quoteId'].toLowerCase(),
                'type': type,
                'gld': amount,
                'price': price || 1
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/';
            if (type == 'public') {
                url += path;
            } else {
                var nonce = this.nonce();
                url += this.version + '/' + this.implodeParams(path, params);
                var query = this.extend({
                    'nonce': nonce,
                    'apikey': this.apiKey
                }, this.omit(params, this.extractParams(path)));
                url += '?' + this.urlencode(query);
                headers = {
                    'Content-Type': 'application/json',
                    'X-Signature': this.hmac(url, this.secret)
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var virwox = {

        'id': 'virwox',
        'name': 'VirWoX',
        'countries': 'AT',
        'rateLimit': 1000,
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766894-6da9d360-5eea-11e7-90aa-41f2711b7405.jpg',
            'api': {
                'public': 'http://api.virwox.com/api/json.php',
                'private': 'https://www.virwox.com/api/trading.php'
            },
            'www': 'https://www.virwox.com',
            'doc': 'https://www.virwox.com/developers.php'
        },
        'api': {
            'public': {
                'get': ['getInstruments', 'getBestPrices', 'getMarketDepth', 'estimateMarketOrder', 'getTradedPriceVolume', 'getRawTradeData', 'getStatistics', 'getTerminalList', 'getGridList', 'getGridStatistics'],
                'post': ['getInstruments', 'getBestPrices', 'getMarketDepth', 'estimateMarketOrder', 'getTradedPriceVolume', 'getRawTradeData', 'getStatistics', 'getTerminalList', 'getGridList', 'getGridStatistics']
            },
            'private': {
                'get': ['cancelOrder', 'getBalances', 'getCommissionDiscount', 'getOrders', 'getTransactions', 'placeOrder'],
                'post': ['cancelOrder', 'getBalances', 'getCommissionDiscount', 'getOrders', 'getTransactions', 'placeOrder']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                keys,
                result,
                p,
                product,
                id,
                symbol,
                base,
                quote,
                _this113 = this;

            return Promise.resolve().then(function () {
                return _this113.publicGetInstruments();
            }).then(function (_resp) {
                products = _resp;
                keys = Object.keys(products['result']);
                result = [];

                for (p = 0; p < keys.length; p++) {
                    product = products['result'][keys[p]];
                    id = product['instrumentID'];
                    symbol = product['symbol'];
                    base = product['longCurrency'];
                    quote = product['shortCurrency'];

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.privatePostGetBalances();
        },
        fetchBestPrices: function fetchBestPrices(product) {
            return this.publicPostGetBestPrices({
                'symbols': [this.symbol(product)]
            });
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                _this114 = this;

            return Promise.resolve().then(function () {
                return _this114.publicPostGetMarketDepth({
                    'symbols': [_this114.symbol(product)],
                    'buyDepth': 100,
                    'sellDepth': 100
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var end,
                start,
                response,
                tickers,
                keys,
                length,
                lastKey,
                ticker,
                timestamp,
                _this115 = this;

            return Promise.resolve().then(function () {
                end = _this115.milliseconds();
                start = end - 86400000;
                return _this115.publicGetTradedPriceVolume({
                    'instrument': _this115.symbol(product),
                    'endDate': _this115.yyyymmddhhmmss(end),
                    'startDate': _this115.yyyymmddhhmmss(start),
                    'HLOC': 1
                });
            }).then(function (_resp) {
                response = _resp;
                tickers = response['result']['priceVolumeList'];
                keys = Object.keys(tickers);
                length = keys.length;
                lastKey = keys[length - 1];
                ticker = tickers[lastKey];
                timestamp = _this115.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this115.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': undefined,
                    'ask': undefined,
                    'vwap': undefined,
                    'open': parseFloat(ticker['open']),
                    'close': parseFloat(ticker['close']),
                    'first': undefined,
                    'last': undefined,
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': parseFloat(ticker['longVolume']),
                    'quoteVolume': parseFloat(ticker['shortVolume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.publicGetRawTradeData({
                'instrument': this.symbol(product),
                'timespan': 3600
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            var order = {
                'instrument': this.symbol(product),
                'orderType': side.toUpperCase(),
                'amount': amount
            };
            if (type == 'limit') order['price'] = price;
            return this.privatePostPlaceOrder(this.extend(order, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'public';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'][type];
            var auth = {};
            if (type == 'public') {
                auth['key'] = this.apiKey;
                auth['user'] = this.login;
                auth['pass'] = this.password;
            }
            var nonce = this.nonce();
            if (method == 'GET') {
                url += '?' + this.urlencode(this.extend({
                    'method': path,
                    'id': nonce
                }, auth, params));
            } else {
                headers = { 'Content-type': 'application/json' };
                body = JSON.stringify({
                    'method': path,
                    'params': this.extend(auth, params),
                    'id': nonce
                });
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var yobit = {

        'id': 'yobit',
        'name': 'YoBit',
        'countries': 'RU',
        'rateLimit': 2000, // responses are cached every 2 seconds
        'version': '3',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg',
            'api': 'https://yobit.net',
            'www': 'https://www.yobit.net',
            'doc': 'https://www.yobit.net/en/api/'
        },
        'api': {
            'api': {
                'get': ['depth/{pairs}', 'info', 'ticker/{pairs}', 'trades/{pairs}']
            },
            'tapi': {
                'post': ['ActiveOrders', 'CancelOrder', 'GetDepositAddress', 'getInfo', 'OrderInfo', 'Trade', 'TradeHistory', 'WithdrawCoinsToAddress']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                keys,
                result,
                p,
                id,
                product,
                symbol,
                _symbol$split13,
                _symbol$split14,
                base,
                quote,
                _this116 = this;

            return Promise.resolve().then(function () {
                return _this116.apiGetInfo();
            }).then(function (_resp) {
                products = _resp;
                keys = Object.keys(products['pairs']);
                result = [];

                for (p = 0; p < keys.length; p++) {
                    id = keys[p];
                    product = products['pairs'][id];
                    symbol = id.toUpperCase().replace('_', '/');
                    _symbol$split13 = symbol.split('/');
                    _symbol$split14 = _slicedToArray(_symbol$split13, 2);
                    base = _symbol$split14[0];
                    quote = _symbol$split14[1];

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.tapiPostGetInfo();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                _this117 = this;

            return Promise.resolve().then(function () {
                return _this117.apiGetDepthPairs({
                    'pairs': _this117.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                tickers,
                ticker,
                timestamp,
                _this118 = this;

            return Promise.resolve().then(function () {
                p = _this118.product(product);
                return _this118.apiGetTickerPairs({
                    'pairs': p['id']
                });
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers[p['id']];
                timestamp = ticker['updated'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this118.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['buy']),
                    'ask': parseFloat(ticker['sell']),
                    'vwap': undefined,
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': parseFloat(ticker['avg']),
                    'baseVolume': parseFloat(ticker['vol_cur']),
                    'quoteVolume': parseFloat(ticker['vol']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.apiGetTradesPairs({
                'pairs': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            if (type == 'market') throw new Error(this.id + ' allows limit orders only');
            return this.tapiPostTrade(this.extend({
                'pair': this.productId(product),
                'type': side,
                'amount': amount,
                'rate': price
            }, params));
        },
        cancelOrder: function cancelOrder(id) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return this.tapiPostCancelOrder(this.extend({
                'order_id': id
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'api';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + type;
            if (type == 'api') {
                url += '/' + this.version + '/' + this.implodeParams(path, params);
                var query = this.omit(params, this.extractParams(path));
                if (Object.keys(query).length) url += '?' + this.urlencode(query);
            } else {
                var nonce = this.nonce();
                var _query = this.extend({ 'method': path, 'nonce': nonce }, params);
                body = this.urlencode(_query);
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'key': this.apiKey,
                    'sign': this.hmac(body, this.secret, 'sha512')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //-----------------------------------------------------------------------------

    var zaif = {

        'id': 'zaif',
        'name': 'Zaif',
        'countries': 'JP',
        'rateLimit': 3000,
        'version': '1',
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg',
            'api': 'https://api.zaif.jp',
            'www': 'https://zaif.jp',
            'doc': ['https://corp.zaif.jp/api-docs', 'https://corp.zaif.jp/api-docs/api_links', 'https://www.npmjs.com/package/zaif.jp', 'https://github.com/you21979/node-zaif']
        },
        'api': {
            'api': {
                'get': ['depth/{pair}', 'currencies/{pair}', 'currencies/all', 'currency_pairs/{pair}', 'currency_pairs/all', 'last_price/{pair}', 'ticker/{pair}', 'trades/{pair}']
            },
            'tapi': {
                'post': ['active_orders', 'cancel_order', 'deposit_history', 'get_id_info', 'get_info', 'get_info2', 'get_personal_info', 'trade', 'trade_history', 'withdraw', 'withdraw_history']
            },
            'ecapi': {
                'post': ['createInvoice', 'getInvoice', 'getInvoiceIdsByOrderNumber', 'cancelInvoice']
            }
        },

        fetchProducts: function fetchProducts() {
            var products,
                result,
                p,
                product,
                id,
                symbol,
                _symbol$split15,
                _symbol$split16,
                base,
                quote,
                _this119 = this;

            return Promise.resolve().then(function () {
                return _this119.apiGetCurrencyPairsAll();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products.length; p++) {
                    product = products[p];
                    id = product['currency_pair'];
                    symbol = product['name'];
                    _symbol$split15 = symbol.split('/');
                    _symbol$split16 = _slicedToArray(_symbol$split15, 2);
                    base = _symbol$split16[0];
                    quote = _symbol$split16[1];

                    result.push({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'info': product
                    });
                }
                return result;
            });
        },
        fetchBalance: function fetchBalance() {
            return this.tapiPostGetInfo();
        },
        fetchOrderBook: function fetchOrderBook(product) {
            var response,
                _this120 = this;

            return Promise.resolve().then(function () {
                return _this120.apiGetDepthPair({
                    'pair': _this120.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this121 = this;

            return Promise.resolve().then(function () {
                return _this121.apiGetTickerPair({
                    'pair': _this121.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this121.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this121.iso8601(timestamp),
                    'high': parseFloat(ticker['high']),
                    'low': parseFloat(ticker['low']),
                    'bid': parseFloat(ticker['bid']),
                    'ask': parseFloat(ticker['ask']),
                    'vwap': parseFloat(ticker['vwap']),
                    'open': undefined,
                    'close': undefined,
                    'first': undefined,
                    'last': parseFloat(ticker['last']),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': parseFloat(ticker['volume']),
                    'info': ticker
                };
            });
        },
        fetchTrades: function fetchTrades(product) {
            return this.apiGetTradesPair({
                'pair': this.productId(product)
            });
        },
        createOrder: function createOrder(product, type, side, amount) {
            var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

            if (type == 'market') throw new Error(this.id + ' allows limit orders only');
            return this.tapiPostTrade(this.extend({
                'currency_pair': this.productId(product),
                'action': side == 'buy' ? 'bid' : 'ask',
                'amount': amount,
                'price': price
            }, params));
        },
        cancelOrder: function cancelOrder(id) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return this.tapiPostCancelOrder(this.extend({
                'order_id': id
            }, params));
        },
        request: function request(path) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'api';
            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
            var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
            var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

            var url = this.urls['api'] + '/' + type;
            if (type == 'api') {
                url += '/' + this.version + '/' + this.implodeParams(path, params);
            } else {
                var nonce = this.nonce();
                body = this.urlencode(this.extend({
                    'method': path,
                    'nonce': nonce
                }, params));
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length,
                    'Key': this.apiKey,
                    'Sign': this.hmac(body, this.secret, 'sha512')
                };
            }
            return this.fetch(url, method, headers, body);
        }
    };

    //=============================================================================

    var markets = {

        '_1broker': _1broker,
        '_1btcxe': _1btcxe,
        'anxpro': anxpro,
        'bit2c': bit2c,
        'bitbay': bitbay,
        'bitbays': bitbays,
        'bitcoincoid': bitcoincoid,
        'bitfinex': bitfinex,
        'bitlish': bitlish,
        'bitmarket': bitmarket,
        'bitmex': bitmex,
        'bitso': bitso,
        'bitstamp': bitstamp,
        'bittrex': bittrex,
        'btcchina': btcchina,
        'btce': btce,
        'btcx': btcx,
        'bxinth': bxinth,
        'ccex': ccex,
        'cex': cex,
        'coincheck': coincheck,
        'coinmate': coinmate,
        'coinsecure': coinsecure,
        'exmo': exmo,
        'fybse': fybse,
        'fybsg': fybsg,
        'gdax': gdax,
        'gemini': gemini,
        'hitbtc': hitbtc,
        'huobi': huobi,
        'itbit': itbit,
        'jubi': jubi,
        'kraken': kraken,
        'luno': luno,
        'mercado': mercado,
        'okcoincny': okcoincny,
        'okcoinusd': okcoinusd,
        'paymium': paymium,
        'poloniex': poloniex,
        'quadrigacx': quadrigacx,
        'quoine': quoine,
        'therock': therock,
        'vaultoro': vaultoro,
        'virwox': virwox,
        'yobit': yobit,
        'zaif': zaif
    };

    var defineAllMarkets = function defineAllMarkets(markets) {
        var result = {};

        var _loop2 = function _loop2(id) {
            result[id] = function (params) {
                return new Market(extend(markets[id], params));
            };
        };

        for (var id in markets) {
            _loop2(id);
        }return result;
    };

    if (isNode) module.exports = defineAllMarkets(markets);else window.ccxt = defineAllMarkets(markets);
})();

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFTLEtBQS9ELEVBcEJKO0FBcUJSLHdCQUFZLEVBQUUsTUFBTSxNQUFSLEVBQWdCLFVBQVUsVUFBMUIsRUFBc0MsUUFBUSxNQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBckJKO0FBc0JSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBdEJKO0FBdUJSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBdkJKO0FBd0JSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBeEJKO0FBeUJSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBekJKO0FBMEJSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBMUJKO0FBMkJSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBM0JKO0FBNEJSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBNUJKO0FBNkJSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBN0JKO0FBOEJSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBOUJKO0FBK0JSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBL0JKO0FBZ0NSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBaENKO0FBaUNSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBakNKO0FBa0NSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBbENKO0FBbUNSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBbkNKO0FBb0NSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBcENKO0FBcUNSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBckNKO0FBc0NSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBdENKO0FBdUNSLHdCQUFZLEVBQUUsTUFBTSxNQUFSLEVBQWdCLFVBQVUsVUFBMUIsRUFBc0MsUUFBUSxNQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBdkNKO0FBd0NSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBeENKO0FBeUNSLHVCQUFZLEVBQUUsTUFBTSxLQUFSLEVBQWdCLFVBQVUsU0FBMUIsRUFBc0MsUUFBUSxLQUE5QyxFQUFzRCxTQUFTLEtBQS9ELEVBekNKO0FBMENSLHVCQUFZLEVBQUUsTUFB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QkFBZSxPQXBDTDtBQXFDVixxQkFBZSxTQXJDTDtBQXNDVixxQkFBZSxTQXRDTDtBQXVDVixtQkFBZSxPQXZDTDtBQXdDVixvQkFBZSxRQXhDTDtBQXlDVixzQkFBZSxVQXpDTDtBQTBDVixrQkFBZSxNQTFDTDtBQTJDVixtQkFBZSxPQTNDTDtBQTRDVixvQkFBZSxRQTVDTDtBQTZDVixrQkFBZSxNQTdDTDtBQThDVixpQkFBZSxLQTlDTDtBQStDVixnQkFBZTtBQS9DTCxLQUFkOztBQWtEQSxRQUFJLG1CQUFtQixTQUFuQixnQkFBbUIsQ0FBVSxPQUFWLEVBQW1CO0FBQ3RDLFlBQUksU0FBUyxFQUFiOztBQURzQyxxQ0FFN0IsRUFGNkI7QUFHbEMsbUJBQU8sRUFBUCxJQUFhLFVBQVUsTUFBVixFQUFrQjtBQUMzQix1QkFBTyxJQUFJLE1BQUosQ0FBWSxPQUFRLFFBQVEsRUFBUixDQUFSLEVBQXFCLE1BQXJCLENBQVosQ0FBUDtBQUNILGFBRkQ7QUFIa0M7O0FBRXRDLGFBQUssSUFBSSxFQUFULElBQWUsT0FBZjtBQUFBLG1CQUFTLEVBQVQ7QUFBQSxTQUlBLE9BQU8sTUFBUDtBQUNILEtBUEQ7O0FBU0EsUUFBSSxNQUFKLEVBQ0ksT0FBTyxPQUFQLEdBQWlCLGlCQUFrQixPQUFsQixDQUFqQixDQURKLEtBR0ksT0FBTyxJQUFQLEdBQWMsaUJBQWtCLE9BQWxCLENBQWQ7QUFFSCxDQW5pUEQiLCJmaWxlIjoiY2N4dC5lczUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxuKGZ1bmN0aW9uICgpIHtcblxudmFyIGlzTm9kZSA9ICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJylcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgY2FwaXRhbGl6ZSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aCA/IChzdHJpbmcuY2hhckF0ICgwKS50b1VwcGVyQ2FzZSAoKSArIHN0cmluZy5zbGljZSAoMSkpIDogc3RyaW5nXG59XG5cbnZhciBrZXlzb3J0ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9XG4gICAgT2JqZWN0LmtleXMgKG9iamVjdCkuc29ydCAoKS5mb3JFYWNoIChrZXkgPT4gcmVzdWx0W2tleV0gPSBvYmplY3Rba2V5XSlcbiAgICByZXR1cm4gcmVzdWx0XG59XG5cbnZhciBleHRlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge31cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcbiAgICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbaV0gPT09ICdvYmplY3QnKVxuICAgICAgICAgICAgT2JqZWN0LmtleXMgKGFyZ3VtZW50c1tpXSkuZm9yRWFjaCAoa2V5ID0+XG4gICAgICAgICAgICAgICAgKHJlc3VsdFtrZXldID0gYXJndW1lbnRzW2ldW2tleV0pKVxuICAgIHJldHVybiByZXN1bHRcbn1cblxudmFyIG9taXQgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgdmFyIHJlc3VsdCA9IGV4dGVuZCAob2JqZWN0KVxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxuICAgICAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1tpXSA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICBkZWxldGUgcmVzdWx0W2FyZ3VtZW50c1tpXV1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheSAoYXJndW1lbnRzW2ldKSlcbiAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgYXJndW1lbnRzW2ldLmxlbmd0aDsgaysrKVxuICAgICAgICAgICAgICAgIGRlbGV0ZSByZXN1bHRbYXJndW1lbnRzW2ldW2tdXVxuICAgIHJldHVybiByZXN1bHRcbn1cblxudmFyIGluZGV4QnkgPSBmdW5jdGlvbiAoYXJyYXksIGtleSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKylcbiAgICAgICAgcmVzdWx0W2FycmF5W2ldW2tleV1dID0gYXJyYXlbaV1cbiAgICByZXR1cm4gcmVzdWx0XG59XG5cbnZhciBmbGF0ID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgcmV0dXJuIGFycmF5LnJlZHVjZSAoKGFjYywgY3VyKSA9PiBhY2MuY29uY2F0IChjdXIpLCBbXSlcbn1cblxudmFyIHVybGVuY29kZSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMgKG9iamVjdCkubWFwIChrZXkgPT4gXG4gICAgICAgIGVuY29kZVVSSUNvbXBvbmVudCAoa2V5KSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCAob2JqZWN0W2tleV0pKS5qb2luICgnJicpXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuaWYgKGlzTm9kZSkge1xuXG4gICAgY29uc3QgY3J5cHRvID0gcmVxdWlyZSAoJ2NyeXB0bycpXG4gICAgdmFyICAgZmV0Y2ggID0gcmVxdWlyZSAoJ25vZGUtZmV0Y2gnKVxuXG4gICAgdmFyIHN0cmluZ1RvQmluYXJ5ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20gKHN0cmluZywgJ2JpbmFyeScpXG4gICAgfVxuXG4gICAgdmFyIHN0cmluZ1RvQmFzZTY0ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gbmV3IEJ1ZmZlciAoc3RyaW5nKS50b1N0cmluZyAoJ2Jhc2U2NCcpXG4gICAgfVxuXG4gICAgdmFyIHV0ZjE2VG9CYXNlNjQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmdUb0Jhc2U2NCAoc3RyaW5nKVxuICAgIH1cblxuICAgIHZhciBiYXNlNjRUb0JpbmFyeSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tIChzdHJpbmcsICdiYXNlNjQnKVxuICAgIH1cblxuICAgIHZhciBiYXNlNjRUb1N0cmluZyA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tIChzdHJpbmcsICdiYXNlNjQnKS50b1N0cmluZyAoKVxuICAgIH1cblxuICAgIHZhciBoYXNoID0gZnVuY3Rpb24gKHJlcXVlc3QsIGhhc2ggPSAnbWQ1JywgZGlnZXN0ID0gJ2hleCcpIHtcbiAgICAgICAgcmV0dXJuIGNyeXB0by5jcmVhdGVIYXNoIChoYXNoKS51cGRhdGUgKHJlcXVlc3QpLmRpZ2VzdCAoZGlnZXN0KVxuICAgIH1cblxuICAgIHZhciBobWFjID0gZnVuY3Rpb24gKHJlcXVlc3QsIHNlY3JldCwgaGFzaCA9ICdzaGEyNTYnLCBkaWdlc3QgPSAnaGV4Jykge1xuICAgICAgICByZXR1cm4gY3J5cHRvLmNyZWF0ZUhtYWMgKGhhc2gsIHNlY3JldCkudXBkYXRlIChyZXF1ZXN0KS5kaWdlc3QgKGRpZ2VzdClcbiAgICB9XG5cbn0gZWxzZSB7XG5cbiAgICB2YXIgZmV0Y2ggPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zLCB2ZXJib3NlID0gZmFsc2UpIHtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UgKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgaWYgKHZlcmJvc2UpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cgKHVybCwgb3B0aW9ucylcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCAoKVxuICAgICAgICAgICAgdmFyIG1ldGhvZCA9IG9wdGlvbnMubWV0aG9kIHx8ICdHRVQnXG5cbiAgICAgICAgICAgIHhoci5vcGVuIChtZXRob2QsIHVybCwgdHJ1ZSkgICAgICAgICAgICBcbiAgICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7IFxuICAgICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09IDIwMClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUgKHhoci5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgKG1ldGhvZCwgdXJsLCB4aHIuc3RhdHVzLCB4aHIucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmhlYWRlcnMgIT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaGVhZGVyIGluIG9wdGlvbnMuaGVhZGVycylcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIgKGhlYWRlciwgb3B0aW9ucy5oZWFkZXJzW2hlYWRlcl0pXG5cbiAgICAgICAgICAgIHhoci5zZW5kIChvcHRpb25zLmJvZHkpXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgdmFyIHN0cmluZ1RvQmluYXJ5ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gQ3J5cHRvSlMuZW5jLkxhdGluMS5wYXJzZSAoc3RyaW5nKVxuICAgIH1cblxuICAgIHZhciBzdHJpbmdUb0Jhc2U2NCA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIENyeXB0b0pTLmVuYy5MYXRpbjEucGFyc2UgKHN0cmluZykudG9TdHJpbmcgKENyeXB0b0pTLmVuYy5CYXNlNjQpXG4gICAgfVxuXG4gICAgdmFyIHV0ZjE2VG9CYXNlNjQgID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gQ3J5cHRvSlMuZW5jLlV0ZjE2LnBhcnNlIChzdHJpbmcpLnRvU3RyaW5nIChDcnlwdG9KUy5lbmMuQmFzZTY0KVxuICAgIH1cblxuICAgIHZhciBiYXNlNjRUb0JpbmFyeSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIENyeXB0b0pTLmVuYy5CYXNlNjQucGFyc2UgKHN0cmluZylcbiAgICB9XG5cbiAgICB2YXIgYmFzZTY0VG9TdHJpbmcgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBDcnlwdG9KUy5lbmMuQmFzZTY0LnBhcnNlIChzdHJpbmcpLnRvU3RyaW5nIChDcnlwdG9KUy5lbmMuVXRmOClcbiAgICB9XG5cbiAgICB2YXIgaGFzaCA9IGZ1bmN0aW9uIChyZXF1ZXN0LCBoYXNoID0gJ21kNScsIGRpZ2VzdCA9ICdoZXgnKSB7XG4gICAgICAgIHZhciBlbmNvZGluZyA9IChkaWdlc3QgPT09ICdiaW5hcnknKSA/ICdMYXRpbjEnIDogY2FwaXRhbGl6ZSAoZGlnZXN0KVxuICAgICAgICByZXR1cm4gQ3J5cHRvSlNbaGFzaC50b1VwcGVyQ2FzZSAoKV0gKHJlcXVlc3QpLnRvU3RyaW5nIChDcnlwdG9KUy5lbmNbZW5jb2RpbmddKVxuICAgIH1cblxuICAgIHZhciBobWFjID0gZnVuY3Rpb24gKHJlcXVlc3QsIHNlY3JldCwgaGFzaCA9ICdzaGEyNTYnLCBkaWdlc3QgPSAnaGV4Jykge1xuICAgICAgICB2YXIgZW5jb2RpbmcgPSAoZGlnZXN0ID09PSAnYmluYXJ5JykgPyAnTGF0aW4xJyA6IGNhcGl0YWxpemUgKGRpZ2VzdClcbiAgICAgICAgcmV0dXJuIENyeXB0b0pTWydIbWFjJyArIGhhc2gudG9VcHBlckNhc2UgKCldIChyZXF1ZXN0LCBzZWNyZXQpLnRvU3RyaW5nIChDcnlwdG9KUy5lbmNbY2FwaXRhbGl6ZSAoZW5jb2RpbmcpXSlcbiAgICB9XG59XG5cbnZhciB1cmxlbmNvZGVCYXNlNjQgPSBmdW5jdGlvbiAoYmFzZTY0c3RyaW5nKSB7XG4gICAgcmV0dXJuIGJhc2U2NHN0cmluZy5yZXBsYWNlICgvWz1dKyQvLCAnJykucmVwbGFjZSAoL1xcKy9nLCAnLScpLnJlcGxhY2UgKC9cXC8vZywgJ18nKSBcbn1cblxudmFyIGp3dCA9IGZ1bmN0aW9uIChyZXF1ZXN0LCBzZWNyZXQsIGFsZyA9ICdIUzI1NicsIGhhc2ggPSAnc2hhMjU2Jykge1xuICAgIHZhciBlbmNvZGVkSGVhZGVyID0gdXJsZW5jb2RlQmFzZTY0IChzdHJpbmdUb0Jhc2U2NCAoSlNPTi5zdHJpbmdpZnkgKHsgJ2FsZyc6IGFsZywgJ3R5cCc6ICdKV1QnIH0pKSlcbiAgICB2YXIgZW5jb2RlZERhdGEgPSB1cmxlbmNvZGVCYXNlNjQgKHN0cmluZ1RvQmFzZTY0IChKU09OLnN0cmluZ2lmeSAocmVxdWVzdCkpKVxuICAgIHZhciB0b2tlbiA9IFsgZW5jb2RlZEhlYWRlciwgZW5jb2RlZERhdGEgXS5qb2luICgnLicpXG4gICAgdmFyIHNpZ25hdHVyZSA9IHVybGVuY29kZUJhc2U2NCAodXRmMTZUb0Jhc2U2NCAoaG1hYyAodG9rZW4sIHNlY3JldCwgaGFzaCwgJ3V0ZjE2JykpKVxuICAgIHJldHVybiBbIHRva2VuLCBzaWduYXR1cmUgXS5qb2luICgnLicpXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIE1hcmtldCA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgIHRoaXMuaGFzaCA9IGhhc2hcbiAgICB0aGlzLmhtYWMgPSBobWFjXG4gICAgdGhpcy5qd3QgPSBqd3RcbiAgICB0aGlzLnN0cmluZ1RvQmluYXJ5ID0gc3RyaW5nVG9CaW5hcnlcbiAgICB0aGlzLnN0cmluZ1RvQmFzZTY0ID0gc3RyaW5nVG9CYXNlNjRcbiAgICB0aGlzLmJhc2U2NFRvQmluYXJ5ID0gYmFzZTY0VG9CaW5hcnlcbiAgICB0aGlzLnVybGVuY29kZSA9IHVybGVuY29kZVxuICAgIHRoaXMub21pdCA9IG9taXRcbiAgICB0aGlzLmV4dGVuZCA9IGV4dGVuZFxuICAgIHRoaXMuZmxhdHRlbiA9IGZsYXRcbiAgICB0aGlzLmluZGV4QnkgPSBpbmRleEJ5XG4gICAgdGhpcy5rZXlzb3J0ID0ga2V5c29ydFxuICAgIHRoaXMuY2FwaXRhbGl6ZSA9IGNhcGl0YWxpemVcblxuICAgIHRoaXMuaW5pdCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAoaXNOb2RlKVxuICAgICAgICAgICAgdGhpcy5ub2RlVmVyc2lvbiA9IHByb2Nlc3MudmVyc2lvbi5tYXRjaCAoL1xcZCtcXC5cXGQrLlxcZCsvKSBbMF1cblxuICAgICAgICBpZiAodGhpcy5hcGkpXG4gICAgICAgICAgICBPYmplY3Qua2V5cyAodGhpcy5hcGkpLmZvckVhY2ggKHR5cGUgPT4ge1xuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzICh0aGlzLmFwaVt0eXBlXSkuZm9yRWFjaCAobWV0aG9kID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVybHMgPSB0aGlzLmFwaVt0eXBlXVttZXRob2RdXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXJscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVybCA9IHVybHNbaV0udHJpbSAoKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNwbGl0UGF0aCA9IHVybC5zcGxpdCAoL1teYS16QS1aMC05XS8pXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1cHBlcmNhc2VNZXRob2QgID0gbWV0aG9kLnRvVXBwZXJDYXNlICgpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG93ZXJjYXNlTWV0aG9kICA9IG1ldGhvZC50b0xvd2VyQ2FzZSAoKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhbWVsY2FzZU1ldGhvZCAgPSBjYXBpdGFsaXplIChsb3dlcmNhc2VNZXRob2QpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2FtZWxjYXNlU3VmZml4ICA9IHNwbGl0UGF0aC5tYXAgKGNhcGl0YWxpemUpLmpvaW4gKCcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVuZGVyc2NvcmVTdWZmaXggPSBzcGxpdFBhdGgubWFwICh4ID0+IHgudHJpbSAoKS50b0xvd2VyQ2FzZSAoKSkuZmlsdGVyICh4ID0+IHgubGVuZ3RoID4gMCkuam9pbiAoJ18nKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FtZWxjYXNlU3VmZml4LmluZGV4T2YgKGNhbWVsY2FzZU1ldGhvZCkgPT09IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FtZWxjYXNlU3VmZml4ID0gY2FtZWxjYXNlU3VmZml4LnNsaWNlIChjYW1lbGNhc2VNZXRob2QubGVuZ3RoKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodW5kZXJzY29yZVN1ZmZpeC5pbmRleE9mIChsb3dlcmNhc2VNZXRob2QpID09PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVyc2NvcmVTdWZmaXggPSB1bmRlcnNjb3JlU3VmZml4LnNsaWNlIChsb3dlcmNhc2VNZXRob2QubGVuZ3RoKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2FtZWxjYXNlICA9IHR5cGUgKyBjYW1lbGNhc2VNZXRob2QgKyBjYXBpdGFsaXplIChjYW1lbGNhc2VTdWZmaXgpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdW5kZXJzY29yZSA9IHR5cGUgKyAnXycgKyBsb3dlcmNhc2VNZXRob2QgKyAnXycgKyB1bmRlcnNjb3JlU3VmZml4XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmID0gKHBhcmFtcyA9PiB0aGlzLnJlcXVlc3QgKHVybCwgdHlwZSwgdXBwZXJjYXNlTWV0aG9kLCBwYXJhbXMpKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzW2NhbWVsY2FzZV0gID0gZlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1t1bmRlcnNjb3JlXSA9IGZcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vIHRoaXMuZmV0Y2ggPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XG5cbiAgICAvLyAgICAgaWYgKGlzTm9kZSlcbiAgICAvLyAgICAgICAgIG9wdGlvbnMuaGVhZGVycyA9IGV4dGVuZCAoe1xuICAgIC8vICAgICAgICAgICAgICdVc2VyLUFnZW50JzogJ2NjeHQvMC4xLjAgKCtodHRwczovL2dpdGh1Yi5jb20va3JvaXRvci9jY3h0KSBOb2RlLmpzLycgKyB0aGlzLm5vZGVWZXJzaW9uICsgJyAoSmF2YVNjcmlwdCknXG4gICAgLy8gICAgICAgICB9LCBvcHRpb25zLmhlYWRlcnMpXG5cbiAgICAvLyAgICAgaWYgKHRoaXMudmVyYm9zZSlcbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nICh0aGlzLmlkLCB1cmwsIG9wdGlvbnMpXG5cbiAgICAvLyAgICAgcmV0dXJuIChmZXRjaCAoKHRoaXMuY29ycyA/IHRoaXMuY29ycyA6ICcnKSArIHVybCwgb3B0aW9ucylcbiAgICAvLyAgICAgICAgIC50aGVuIChyZXNwb25zZSA9PiAodHlwZW9mIHJlc3BvbnNlID09PSAnc3RyaW5nJykgPyByZXNwb25zZSA6IHJlc3BvbnNlLnRleHQgKCkpXG4gICAgLy8gICAgICAgICAudGhlbiAocmVzcG9uc2UgPT4ge1xuICAgIC8vICAgICAgICAgICAgIHRyeSB7XG4gICAgLy8gICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlIChyZXNwb25zZSlcbiAgICAvLyAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgLy8gICAgICAgICAgICAgICAgIHZhciBjbG91ZGZsYXJlUHJvdGVjdGlvbiA9IHJlc3BvbnNlLm1hdGNoICgvY2xvdWRmbGFyZS9pKSA/ICdERG9TIHByb3RlY3Rpb24gYnkgQ2xvdWRmbGFyZScgOiAnJ1xuICAgIC8vICAgICAgICAgICAgICAgICBpZiAodGhpcy52ZXJib3NlKVxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgKHRoaXMuaWQsIHJlc3BvbnNlLCBjbG91ZGZsYXJlUHJvdGVjdGlvbiwgZSlcbiAgICAvLyAgICAgICAgICAgICAgICAgdGhyb3cgZVxuICAgIC8vICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgIH0pKVxuICAgIC8vIH1cblxuICAgIHRoaXMuZmV0Y2ggPSBmdW5jdGlvbiAodXJsLCBtZXRob2QgPSAnR0VUJywgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIGlmIChpc05vZGUpXG4gICAgICAgICAgICBoZWFkZXJzID0gZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ1VzZXItQWdlbnQnOiAnY2N4dC8wLjEuMCAoK2h0dHBzOi8vZ2l0aHViLmNvbS9rcm9pdG9yL2NjeHQpIE5vZGUuanMvJyArIHRoaXMubm9kZVZlcnNpb24gKyAnIChKYXZhU2NyaXB0KSdcbiAgICAgICAgICAgIH0sIGhlYWRlcnMpXG5cbiAgICAgICAgbGV0IG9wdGlvbnMgPSB7ICdtZXRob2QnOiBtZXRob2QsICdoZWFkZXJzJzogaGVhZGVycywgJ2JvZHknOiBib2R5IH1cblxuICAgICAgICBpZiAodGhpcy52ZXJib3NlKVxuICAgICAgICAgICAgY29uc29sZS5sb2cgKHRoaXMuaWQsIHVybCwgb3B0aW9ucylcblxuICAgICAgICByZXR1cm4gKGZldGNoICgodGhpcy5jb3JzID8gdGhpcy5jb3JzIDogJycpICsgdXJsLCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4gKHJlc3BvbnNlID0+ICh0eXBlb2YgcmVzcG9uc2UgPT09ICdzdHJpbmcnKSA/IHJlc3BvbnNlIDogcmVzcG9uc2UudGV4dCAoKSlcbiAgICAgICAgICAgIC50aGVuIChyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UgKHJlc3BvbnNlKVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNsb3VkZmxhcmVQcm90ZWN0aW9uID0gcmVzcG9uc2UubWF0Y2ggKC9jbG91ZGZsYXJlL2kpID8gJ0REb1MgcHJvdGVjdGlvbiBieSBDbG91ZGZsYXJlJyA6ICcnXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnZlcmJvc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyAodGhpcy5pZCwgcmVzcG9uc2UsIGNsb3VkZmxhcmVQcm90ZWN0aW9uLCBlKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpXG4gICAgfVxuXG4gICAgdGhpcy5sb2FkX3Byb2R1Y3RzID0gXG4gICAgdGhpcy5sb2FkUHJvZHVjdHMgPSBmdW5jdGlvbiAocmVsb2FkID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKCFyZWxvYWQgJiYgdGhpcy5wcm9kdWN0cylcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSAoKHJlc29sdmUsIHJlamVjdCkgPT4gcmVzb2x2ZSAodGhpcy5wcm9kdWN0cykpXG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoUHJvZHVjdHMgKCkudGhlbiAocHJvZHVjdHMgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvZHVjdHMgPSBpbmRleEJ5IChwcm9kdWN0cywgJ3N5bWJvbCcpXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5mZXRjaF9wcm9kdWN0cyA9IFxuICAgIHRoaXMuZmV0Y2hQcm9kdWN0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlICgocmVzb2x2ZSwgcmVqZWN0KSA9PiByZXNvbHZlICh0aGlzLnByb2R1Y3RzKSlcbiAgICB9XG5cbiAgICB0aGlzLmNvbW1vbkN1cnJlbmN5Q29kZSA9IGZ1bmN0aW9uIChjdXJyZW5jeSkgeyBcbiAgICAgICAgcmV0dXJuIChjdXJyZW5jeSA9PT0gJ1hCVCcpID8gJ0JUQycgOiBjdXJyZW5jeVxuICAgIH1cblxuICAgIHRoaXMucHJvZHVjdCA9IGZ1bmN0aW9uIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiAoKCh0eXBlb2YgcHJvZHVjdCA9PT0gJ3N0cmluZycpICYmXG4gICAgICAgICAgICAodHlwZW9mIHRoaXMucHJvZHVjdHMgIT0gJ3VuZGVmaW5lZCcpICYmXG4gICAgICAgICAgICAodHlwZW9mIHRoaXMucHJvZHVjdHNbcHJvZHVjdF0gIT0gJ3VuZGVmaW5lZCcpKSA/IHRoaXMucHJvZHVjdHNbcHJvZHVjdF0gOiBwcm9kdWN0KSAgICAgICAgXG4gICAgfVxuXG4gICAgdGhpcy5wcm9kdWN0X2lkID0gXG4gICAgdGhpcy5wcm9kdWN0SWQgID0gZnVuY3Rpb24gKHByb2R1Y3QpIHsgXG4gICAgICAgIHJldHVybiB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpLmlkIHx8IHByb2R1Y3RcbiAgICB9XG5cbiAgICB0aGlzLnN5bWJvbCA9IGZ1bmN0aW9uIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpLnN5bWJvbCB8fCBwcm9kdWN0XG4gICAgfVxuXG4gICAgdGhpcy5leHRyYWN0X3BhcmFtcyA9IFxuICAgIHRoaXMuZXh0cmFjdFBhcmFtcyA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgdmFyIHJlID0gL3soW2EtekEtWjAtOV9dKz8pfS9nXG4gICAgICAgIHZhciBtYXRjaGVzID0gW11cbiAgICAgICAgbGV0IG1hdGNoXG4gICAgICAgIHdoaWxlIChtYXRjaCA9IHJlLmV4ZWMgKHN0cmluZykpXG4gICAgICAgICAgICBtYXRjaGVzLnB1c2ggKG1hdGNoWzFdKVxuICAgICAgICByZXR1cm4gbWF0Y2hlc1xuICAgIH1cblxuICAgIHRoaXMuaW1wbG9kZV9wYXJhbXMgPSBcbiAgICB0aGlzLmltcGxvZGVQYXJhbXMgPSBmdW5jdGlvbiAoc3RyaW5nLCBwYXJhbXMpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcGVydHkgaW4gcGFyYW1zKVxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UgKCd7JyArIHByb3BlcnR5ICsgJ30nLCBwYXJhbXNbcHJvcGVydHldKVxuICAgICAgICByZXR1cm4gc3RyaW5nXG4gICAgfVxuXG4gICAgdGhpcy5idXkgPSBmdW5jdGlvbiAocHJvZHVjdCwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3JkZXIgKHByb2R1Y3QsICdidXknLCBhbW91bnQsIHByaWNlLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5zZWxsID0gZnVuY3Rpb24gKHByb2R1Y3QsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yZGVyIChwcm9kdWN0LCAnc2VsbCcsIGFtb3VudCwgcHJpY2UsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLnRyYWRlID1cbiAgICB0aGlzLm9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCB0eXBlID0gKHR5cGVvZiBwcmljZSA9PSAndW5kZWZpbmVkJykgPyAnbWFya2V0JyA6ICdsaW1pdCdcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9idXlfb3JkZXIgPVxuICAgIHRoaXMuY3JlYXRlQnV5T3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgdHlwZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHsgXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCAnYnV5JywgIGFtb3VudCwgcHJpY2UsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9zZWxsX29yZGVyID1cbiAgICB0aGlzLmNyZWF0ZVNlbGxPcmRlciA9IGZ1bmN0aW9uIChwcm9kdWN0LCB0eXBlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgJ3NlbGwnLCBhbW91bnQsIHByaWNlLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVfbGltaXRfYnV5X29yZGVyID1cbiAgICB0aGlzLmNyZWF0ZUxpbWl0QnV5T3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgYW1vdW50LCBwcmljZSwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTGltaXRPcmRlciAgKHByb2R1Y3QsICdidXknLCAgYW1vdW50LCBwcmljZSwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlX2xpbWl0X3NlbGxfb3JkZXIgPSBcbiAgICB0aGlzLmNyZWF0ZUxpbWl0U2VsbE9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIGFtb3VudCwgcHJpY2UsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUxpbWl0T3JkZXIgKHByb2R1Y3QsICdzZWxsJywgYW1vdW50LCBwcmljZSwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlX21hcmtldF9idXlfb3JkZXIgPVxuICAgIHRoaXMuY3JlYXRlTWFya2V0QnV5T3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgYW1vdW50LCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVNYXJrZXRPcmRlciAocHJvZHVjdCwgJ2J1eScsICBhbW91bnQsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9tYXJrZXRfc2VsbF9vcmRlciA9XG4gICAgdGhpcy5jcmVhdGVNYXJrZXRTZWxsT3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgYW1vdW50LCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVNYXJrZXRPcmRlciAocHJvZHVjdCwgJ3NlbGwnLCBhbW91bnQsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9saW1pdF9vcmRlciA9IFxuICAgIHRoaXMuY3JlYXRlTGltaXRPcmRlciA9IGZ1bmN0aW9uIChwcm9kdWN0LCBzaWRlLCBhbW91bnQsIHByaWNlLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVPcmRlciAocHJvZHVjdCwgJ2xpbWl0JywgIHNpZGUsIGFtb3VudCwgcHJpY2UsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9tYXJrZXRfb3JkZXIgPVxuICAgIHRoaXMuY3JlYXRlTWFya2V0T3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgc2lkZSwgYW1vdW50LCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVPcmRlciAocHJvZHVjdCwgJ21hcmtldCcsIHNpZGUsIGFtb3VudCwgdW5kZWZpbmVkLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5pc284NjAxICAgICAgICA9IHRpbWVzdGFtcCA9PiBuZXcgRGF0ZSAodGltZXN0YW1wKS50b0lTT1N0cmluZyAoKVxuICAgIHRoaXMucGFyc2U4NjAxICAgICAgPSBEYXRlLnBhcnNlIFxuICAgIHRoaXMuc2Vjb25kcyAgICAgICAgPSAoKSA9PiBNYXRoLmZsb29yICh0aGlzLm1pbGxpc2Vjb25kcyAoKSAvIDEwMDApXG4gICAgdGhpcy5taWNyb3NlY29uZHMgICA9ICgpID0+IE1hdGguZmxvb3IgKHRoaXMubWlsbGlzZWNvbmRzICgpICogMTAwMClcbiAgICB0aGlzLm1pbGxpc2Vjb25kcyAgID0gRGF0ZS5ub3dcbiAgICB0aGlzLm5vbmNlICAgICAgICAgID0gdGhpcy5zZWNvbmRzXG4gICAgdGhpcy5pZCAgICAgICAgICAgICA9IHVuZGVmaW5lZFxuICAgIHRoaXMucmF0ZUxpbWl0ICAgICAgPSAyMDAwXG4gICAgdGhpcy50aW1lb3V0ICAgICAgICA9IHVuZGVmaW5lZFxuICAgIHRoaXMueXl5eW1tZGRoaG1tc3MgPSB0aW1lc3RhbXAgPT4ge1xuICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlICh0aW1lc3RhbXApXG4gICAgICAgIGxldCB5eXl5ID0gZGF0ZS5nZXRVVENGdWxsWWVhciAoKVxuICAgICAgICBsZXQgTU0gPSBkYXRlLmdldFVUQ01vbnRoICgpXG4gICAgICAgIGxldCBkZCA9IGRhdGUuZ2V0VVRDRGF5ICgpXG4gICAgICAgIGxldCBoaCA9IGRhdGUuZ2V0VVRDSG91cnMgKClcbiAgICAgICAgbGV0IG1tID0gZGF0ZS5nZXRVVENNaW51dGVzICgpXG4gICAgICAgIGxldCBzcyA9IGRhdGUuZ2V0VVRDU2Vjb25kcyAoKVxuICAgICAgICBNTSA9IE1NIDwgMTAgPyAoJzAnICsgTU0pIDogTU1cbiAgICAgICAgZGQgPSBkZCA8IDEwID8gKCcwJyArIGRkKSA6IGRkXG4gICAgICAgIGhoID0gaGggPCAxMCA/ICgnMCcgKyBoaCkgOiBoaFxuICAgICAgICBtbSA9IG1tIDwgMTAgPyAoJzAnICsgbW0pIDogbW1cbiAgICAgICAgc3MgPSBzcyA8IDEwID8gKCcwJyArIHNzKSA6IHNzXG4gICAgICAgIHJldHVybiB5eXl5ICsgJy0nICsgTU0gKyAnLScgKyBkZCArICcgJyArIGhoICsgJzonICsgbW0gKyAnOicgKyBzc1xuICAgIH1cblxuICAgIGZvciAodmFyIHByb3BlcnR5IGluIGNvbmZpZylcbiAgICAgICAgdGhpc1twcm9wZXJ0eV0gPSBjb25maWdbcHJvcGVydHldXG5cbiAgICB0aGlzLmZldGNoX2JhbGFuY2UgICAgPSB0aGlzLmZldGNoQmFsYW5jZVxuICAgIHRoaXMuZmV0Y2hfb3JkZXJfYm9vayA9IHRoaXMuZmV0Y2hPcmRlckJvb2tcbiAgICB0aGlzLmZldGNoX3RpY2tlciAgICAgPSB0aGlzLmZldGNoVGlja2VyXG4gICAgdGhpcy5mZXRjaF90cmFkZXMgICAgID0gdGhpcy5mZXRjaFRyYWRlc1xuICBcbiAgICB0aGlzLnZlcmJvc2UgPSB0aGlzLmxvZyB8fCB0aGlzLmRlYnVnIHx8ICh0aGlzLnZlcmJvc2l0eSA9PSAxKSB8fCB0aGlzLnZlcmJvc2VcblxuICAgIHRoaXMuaW5pdCAoKVxufVxuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnZhciBfMWJyb2tlciA9IHtcblxuICAgICdpZCc6ICdfMWJyb2tlcicsXG4gICAgJ25hbWUnOiAnMUJyb2tlcicsXG4gICAgJ2NvdW50cmllcyc6ICdVUycsXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjInLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MDIxLTQyMGJkOWZjLTVlY2ItMTFlNy04ZWQ2LTU2ZDAwODFlZmVkMi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vMWJyb2tlci5jb20vYXBpJywgICAgICAgIFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vMWJyb2tlci5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vMWJyb2tlci5jb20vP2M9ZW4vY29udGVudC9hcGktZG9jdW1lbnRhdGlvbicsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ21hcmtldC9iYXJzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0L2NhdGVnb3JpZXMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXQvZGV0YWlscycsXG4gICAgICAgICAgICAgICAgJ21hcmtldC9saXN0JyxcbiAgICAgICAgICAgICAgICAnbWFya2V0L3F1b3RlcycsXG4gICAgICAgICAgICAgICAgJ21hcmtldC90aWNrcycsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NyZWF0ZScsXG4gICAgICAgICAgICAgICAgJ29yZGVyL29wZW4nLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9jbG9zZScsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL2Nsb3NlX2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL2VkaXQnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vb3BlbicsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL3NoYXJlZC9nZXQnLFxuICAgICAgICAgICAgICAgICdzb2NpYWwvcHJvZmlsZV9zdGF0aXN0aWNzJyxcbiAgICAgICAgICAgICAgICAnc29jaWFsL3Byb2ZpbGVfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAndXNlci9iaXRjb2luX2RlcG9zaXRfYWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZGV0YWlscycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvb3ZlcnZpZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL3F1b3RhX3N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvdHJhbnNhY3Rpb25fbG9nJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoQ2F0ZWdvcmllcyAoKSB7XG4gICAgICAgIGxldCBjYXRlZ29yaWVzID0gYXdhaXQgdGhpcy5wcml2YXRlR2V0TWFya2V0Q2F0ZWdvcmllcyAoKTtcbiAgICAgICAgcmV0dXJuIGNhdGVnb3JpZXNbJ3Jlc3BvbnNlJ107XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgY2F0ZWdvcmllcyA9IGF3YWl0IHRoaXMuZmV0Y2hDYXRlZ29yaWVzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgY2F0ZWdvcmllcy5sZW5ndGg7IGMrKykge1xuICAgICAgICAgICAgbGV0IGNhdGVnb3J5ID0gY2F0ZWdvcmllc1tjXTtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHJpdmF0ZUdldE1hcmtldExpc3QgKHsgXG4gICAgICAgICAgICAgICAgJ2NhdGVnb3J5JzogY2F0ZWdvcnkudG9Mb3dlckNhc2UgKCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ3Jlc3BvbnNlJ10ubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWydyZXNwb25zZSddW3BdO1xuICAgICAgICAgICAgICAgIGlmICgoY2F0ZWdvcnkgPT0gJ0ZPUkVYJykgfHwgKGNhdGVnb3J5ID09ICdDUllQVE8nKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydzeW1ib2wnXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN5bWJvbCA9IHByb2R1Y3RbJ25hbWUnXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydzeW1ib2wnXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN5bWJvbCA9IHByb2R1Y3RbJ3N5bWJvbCddO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHByb2R1Y3RbJ25hbWUnXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHR5cGUgPSBwcm9kdWN0Wyd0eXBlJ10udG9Mb3dlckNhc2UgKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgICAgICAgICAnbmFtZSc6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAndHlwZSc6IHR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkgeyBcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldFVzZXJPdmVydmlldyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wcml2YXRlR2V0TWFya2V0UXVvdGVzICh7XG4gICAgICAgICAgICAnc3ltYm9scyc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSByZXNwb25zZVsncmVzcG9uc2UnXVswXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMucGFyc2U4NjAxIChvcmRlcmJvb2tbJ3VwZGF0ZWQnXSk7XG4gICAgICAgIGxldCBiaWRQcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyYm9va1snYmlkJ10pO1xuICAgICAgICBsZXQgYXNrUHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlcmJvb2tbJ2FzayddKTtcbiAgICAgICAgbGV0IGJpZCA9IFsgYmlkUHJpY2UsIHVuZGVmaW5lZCBdO1xuICAgICAgICBsZXQgYXNrID0gWyBhc2tQcmljZSwgdW5kZWZpbmVkIF07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2JpZHMnOiBbIGJpZCBdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbIGFzayBdLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzdWx0ID0gYXdhaXQgdGhpcy5wcml2YXRlR2V0TWFya2V0QmFycyAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdyZXNvbHV0aW9uJzogNjAsXG4gICAgICAgICAgICAnbGltaXQnOiAxLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMuZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzdWx0WydyZXNwb25zZSddWzBdO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5wYXJzZTg2MDEgKHRpY2tlclsnZGF0ZSddKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2wnXSksXG4gICAgICAgICAgICAnYmlkJzogb3JkZXJib29rWydiaWRzJ11bMF1bJ3ByaWNlJ10sXG4gICAgICAgICAgICAnYXNrJzogb3JkZXJib29rWydhc2tzJ11bMF1bJ3ByaWNlJ10sXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogcGFyc2VGbG9hdCAodGlja2VyWydjJ10pLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICB9OyBcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnbWFyZ2luJzogYW1vdW50LFxuICAgICAgICAgICAgJ2RpcmVjdGlvbic6IChzaWRlID09ICdzZWxsJykgPyAnc2hvcnQnIDogJ2xvbmcnLFxuICAgICAgICAgICAgJ2xldmVyYWdlJzogMSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9yZGVyWyd0eXBlJ10gKz0gJ19tYXJrZXQnO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0T3JkZXJDcmVhdGUgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aCArICcucGhwJztcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgJ3Rva2VuJzogdGhpcy5hcGlLZXkgfSwgcGFyYW1zKTtcbiAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgY3J5cHRvY2FwaXRhbCA9IHtcblxuICAgICdjb21tZW50JzogJ0NyeXB0byBDYXBpdGFsIEFQSScsXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3N0YXRzJyxcbiAgICAgICAgICAgICAgICAnaGlzdG9yaWNhbC1wcmljZXMnLFxuICAgICAgICAgICAgICAgICdvcmRlci1ib29rJyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzogeyAgICAgICAgICAgIFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzLWFuZC1pbmZvJyxcbiAgICAgICAgICAgICAgICAnb3Blbi1vcmRlcnMnLFxuICAgICAgICAgICAgICAgICd1c2VyLXRyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICAgICAgJ2J0Yy1kZXBvc2l0LWFkZHJlc3MvZ2V0JyxcbiAgICAgICAgICAgICAgICAnYnRjLWRlcG9zaXQtYWRkcmVzcy9uZXcnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0cy9nZXQnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy9nZXQnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvbmV3JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL2VkaXQnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzL25ldycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2VzQW5kSW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHsgXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0T3JkZXJCb29rICh7XG4gICAgICAgICAgICAnY3VycmVuY3knOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgb3JkZXJib29rID0gcmVzcG9uc2VbJ29yZGVyLWJvb2snXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSB7ICdiaWRzJzogJ2JpZCcsICdhc2tzJzogJ2FzaycgfTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAoc2lkZXMpO1xuICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IGtleXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2tdO1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1trZXldO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAob3JkZXJbJ3RpbWVzdGFtcCddKSAqIDEwMDA7XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbJ3ByaWNlJ10pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsnb3JkZXJfYW1vdW50J10pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldLnB1c2ggKFsgcHJpY2UsIGFtb3VudCwgdGltZXN0YW1wIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0U3RhdHMgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsnc3RhdHMnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydtYXgnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydtaW4nXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RfcHJpY2UnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogcGFyc2VGbG9hdCAodGlja2VyWydkYWlseV9jaGFuZ2UnXSksXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3RvdGFsX2J0Y190cmFkZWQnXSksXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYW5zYWN0aW9ucyAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICd0eXBlJzogdHlwZSxcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsnbGltaXRfcHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyc05ldyAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdhcGlfa2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogdGhpcy5ub25jZSAoKSxcbiAgICAgICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgICAgICBxdWVyeVsnc2lnbmF0dXJlJ10gPSB0aGlzLmhtYWMgKEpTT04uc3RyaW5naWZ5IChxdWVyeSksIHRoaXMuc2VjcmV0KTtcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgXzFidGN4ZSA9IGV4dGVuZCAoY3J5cHRvY2FwaXRhbCwge1xuXG4gICAgJ2lkJzogJ18xYnRjeGUnLFxuICAgICduYW1lJzogJzFCVENYRScsXG4gICAgJ2NvdW50cmllcyc6ICdQQScsIC8vIFBhbmFtYVxuICAgICdjb21tZW50JzogJ0NyeXB0byBDYXBpdGFsIEFQSScsXG4gICAgJ3VybHMnOiB7IFxuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MDQ5LTJiMjk0NDA4LTVlY2MtMTFlNy04NWNjLWFkYWZmMDEzZGMxYS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vMWJ0Y3hlLmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vMWJ0Y3hlLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly8xYnRjeGUuY29tL2FwaS1kb2NzLnBocCcsXG4gICAgfSwgICAgXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ1VTRCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnLCB9LFxuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ0VVUicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInLCB9LFxuICAgICAgICAnQlRDL0NOWSc6IHsgJ2lkJzogJ0NOWScsICdzeW1ib2wnOiAnQlRDL0NOWScsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDTlknLCB9LFxuICAgICAgICAnQlRDL1JVQic6IHsgJ2lkJzogJ1JVQicsICdzeW1ib2wnOiAnQlRDL1JVQicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdSVUInLCB9LFxuICAgICAgICAnQlRDL0NIRic6IHsgJ2lkJzogJ0NIRicsICdzeW1ib2wnOiAnQlRDL0NIRicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDSEYnLCB9LFxuICAgICAgICAnQlRDL0pQWSc6IHsgJ2lkJzogJ0pQWScsICdzeW1ib2wnOiAnQlRDL0pQWScsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdKUFknLCB9LFxuICAgICAgICAnQlRDL0dCUCc6IHsgJ2lkJzogJ0dCUCcsICdzeW1ib2wnOiAnQlRDL0dCUCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdHQlAnLCB9LFxuICAgICAgICAnQlRDL0NBRCc6IHsgJ2lkJzogJ0NBRCcsICdzeW1ib2wnOiAnQlRDL0NBRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDQUQnLCB9LFxuICAgICAgICAnQlRDL0FVRCc6IHsgJ2lkJzogJ0FVRCcsICdzeW1ib2wnOiAnQlRDL0FVRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdBVUQnLCB9LFxuICAgICAgICAnQlRDL0FFRCc6IHsgJ2lkJzogJ0FFRCcsICdzeW1ib2wnOiAnQlRDL0FFRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdBRUQnLCB9LFxuICAgICAgICAnQlRDL0JHTic6IHsgJ2lkJzogJ0JHTicsICdzeW1ib2wnOiAnQlRDL0JHTicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdCR04nLCB9LFxuICAgICAgICAnQlRDL0NaSyc6IHsgJ2lkJzogJ0NaSycsICdzeW1ib2wnOiAnQlRDL0NaSycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDWksnLCB9LFxuICAgICAgICAnQlRDL0RLSyc6IHsgJ2lkJzogJ0RLSycsICdzeW1ib2wnOiAnQlRDL0RLSycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdES0snLCB9LFxuICAgICAgICAnQlRDL0hLRCc6IHsgJ2lkJzogJ0hLRCcsICdzeW1ib2wnOiAnQlRDL0hLRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdIS0QnLCB9LFxuICAgICAgICAnQlRDL0hSSyc6IHsgJ2lkJzogJ0hSSycsICdzeW1ib2wnOiAnQlRDL0hSSycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdIUksnLCB9LFxuICAgICAgICAnQlRDL0hVRic6IHsgJ2lkJzogJ0hVRicsICdzeW1ib2wnOiAnQlRDL0hVRicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdIVUYnLCB9LFxuICAgICAgICAnQlRDL0lMUyc6IHsgJ2lkJzogJ0lMUycsICdzeW1ib2wnOiAnQlRDL0lMUycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdJTFMnLCB9LFxuICAgICAgICAnQlRDL0lOUic6IHsgJ2lkJzogJ0lOUicsICdzeW1ib2wnOiAnQlRDL0lOUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdJTlInLCB9LFxuICAgICAgICAnQlRDL01VUic6IHsgJ2lkJzogJ01VUicsICdzeW1ib2wnOiAnQlRDL01VUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdNVVInLCB9LFxuICAgICAgICAnQlRDL01YTic6IHsgJ2lkJzogJ01YTicsICdzeW1ib2wnOiAnQlRDL01YTicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdNWE4nLCB9LFxuICAgICAgICAnQlRDL05PSyc6IHsgJ2lkJzogJ05PSycsICdzeW1ib2wnOiAnQlRDL05PSycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdOT0snLCB9LFxuICAgICAgICAnQlRDL05aRCc6IHsgJ2lkJzogJ05aRCcsICdzeW1ib2wnOiAnQlRDL05aRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdOWkQnLCB9LFxuICAgICAgICAnQlRDL1BMTic6IHsgJ2lkJzogJ1BMTicsICdzeW1ib2wnOiAnQlRDL1BMTicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdQTE4nLCB9LFxuICAgICAgICAnQlRDL1JPTic6IHsgJ2lkJzogJ1JPTicsICdzeW1ib2wnOiAnQlRDL1JPTicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdST04nLCB9LFxuICAgICAgICAnQlRDL1NFSyc6IHsgJ2lkJzogJ1NFSycsICdzeW1ib2wnOiAnQlRDL1NFSycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdTRUsnLCB9LFxuICAgICAgICAnQlRDL1NHRCc6IHsgJ2lkJzogJ1NHRCcsICdzeW1ib2wnOiAnQlRDL1NHRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdTR0QnLCB9LFxuICAgICAgICAnQlRDL1RIQic6IHsgJ2lkJzogJ1RIQicsICdzeW1ib2wnOiAnQlRDL1RIQicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdUSEInLCB9LFxuICAgICAgICAnQlRDL1RSWSc6IHsgJ2lkJzogJ1RSWScsICdzeW1ib2wnOiAnQlRDL1RSWScsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdUUlknLCB9LFxuICAgICAgICAnQlRDL1pBUic6IHsgJ2lkJzogJ1pBUicsICdzeW1ib2wnOiAnQlRDL1pBUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdaQVInLCB9LFxuICAgIH0sXG59KVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBhbnhwcm8gPSB7XG5cbiAgICAnaWQnOiAnYW54cHJvJyxcbiAgICAnbmFtZSc6ICdBTlhQcm8nLFxuICAgICdjb3VudHJpZXMnOiBbICdKUCcsICdTRycsICdISycsICdOWicsIF0sXG4gICAgJ3ZlcnNpb24nOiAnMicsXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjU5ODMtZmQ4NTk1ZGEtNWVjOS0xMWU3LTgyZTMtYWRiM2FiOGMyNjEyLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hbnhwcm8uY29tL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9hbnhwcm8uY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2FueHByby5jb20vcGFnZXMvYXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICd7Y3VycmVuY3lfcGFpcn0vbW9uZXkvdGlja2VyJyxcbiAgICAgICAgICAgICAgICAne2N1cnJlbmN5X3BhaXJ9L21vbmV5L2RlcHRoL2Z1bGwnLFxuICAgICAgICAgICAgICAgICd7Y3VycmVuY3lfcGFpcn0vbW9uZXkvdHJhZGUvZmV0Y2gnLCAvLyBkaXNhYmxlZCBieSBBTlhQcm9cbiAgICAgICAgICAgIF0sICAgIFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICd7Y3VycmVuY3lfcGFpcn0vbW9uZXkvb3JkZXIvYWRkJyxcbiAgICAgICAgICAgICAgICAne2N1cnJlbmN5X3BhaXJ9L21vbmV5L29yZGVyL2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ3tjdXJyZW5jeV9wYWlyfS9tb25leS9vcmRlci9xdW90ZScsXG4gICAgICAgICAgICAgICAgJ3tjdXJyZW5jeV9wYWlyfS9tb25leS9vcmRlci9yZXN1bHQnLFxuICAgICAgICAgICAgICAgICd7Y3VycmVuY3lfcGFpcn0vbW9uZXkvb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnbW9uZXkve2N1cnJlbmN5fS9hZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnbW9uZXkve2N1cnJlbmN5fS9zZW5kX3NpbXBsZScsXG4gICAgICAgICAgICAgICAgJ21vbmV5L2luZm8nLFxuICAgICAgICAgICAgICAgICdtb25leS90cmFkZS9saXN0JyxcbiAgICAgICAgICAgICAgICAnbW9uZXkvd2FsbGV0L2hpc3RvcnknLFxuICAgICAgICAgICAgXSwgICAgXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvVVNEJzogeyAnaWQnOiAnQlRDVVNEJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0JUQy9IS0QnOiB7ICdpZCc6ICdCVENIS0QnLCAnc3ltYm9sJzogJ0JUQy9IS0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSEtEJyB9LFxuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ0JUQ0VVUicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdCVEMvQ0FEJzogeyAnaWQnOiAnQlRDQ0FEJywgJ3N5bWJvbCc6ICdCVEMvQ0FEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NBRCcgfSxcbiAgICAgICAgJ0JUQy9BVUQnOiB7ICdpZCc6ICdCVENBVUQnLCAnc3ltYm9sJzogJ0JUQy9BVUQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQVVEJyB9LFxuICAgICAgICAnQlRDL1NHRCc6IHsgJ2lkJzogJ0JUQ1NHRCcsICdzeW1ib2wnOiAnQlRDL1NHRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdTR0QnIH0sXG4gICAgICAgICdCVEMvSlBZJzogeyAnaWQnOiAnQlRDSlBZJywgJ3N5bWJvbCc6ICdCVEMvSlBZJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ0JUQy9HQlAnOiB7ICdpZCc6ICdCVENHQlAnLCAnc3ltYm9sJzogJ0JUQy9HQlAnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnR0JQJyB9LFxuICAgICAgICAnQlRDL05aRCc6IHsgJ2lkJzogJ0JUQ05aRCcsICdzeW1ib2wnOiAnQlRDL05aRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdOWkQnIH0sXG4gICAgICAgICdMVEMvQlRDJzogeyAnaWQnOiAnTFRDQlRDJywgJ3N5bWJvbCc6ICdMVEMvQlRDJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0RPR0UvQlRDJzogeyAnaWQnOiAnRE9HRUJUQycsICdzeW1ib2wnOiAnRE9HRS9CVEMnLCAnYmFzZSc6ICdET0dFJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ1NUUi9CVEMnOiB7ICdpZCc6ICdTVFJCVEMnLCAnc3ltYm9sJzogJ1NUUi9CVEMnLCAnYmFzZSc6ICdTVFInLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnWFJQL0JUQyc6IHsgJ2lkJzogJ1hSUEJUQycsICdzeW1ib2wnOiAnWFJQL0JUQycsICdiYXNlJzogJ1hSUCcsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0TW9uZXlJbmZvICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEN1cnJlbmN5UGFpck1vbmV5RGVwdGhGdWxsICh7XG4gICAgICAgICAgICAnY3VycmVuY3lfcGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSByZXNwb25zZVsnZGF0YSddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKG9yZGVyYm9va1snZGF0YVVwZGF0ZVRpbWUnXSkgLyAxMDAwO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbJ3ByaWNlJ10pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsnYW1vdW50J10pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRDdXJyZW5jeVBhaXJNb25leVRpY2tlciAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ2RhdGEnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50ICh0aWNrZXJbJ2RhdGFVcGRhdGVUaW1lJ10gLyAxMDAwKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddWyd2YWx1ZSddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddWyd2YWx1ZSddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddWyd2YWx1ZSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSlbJ3ZhbHVlJ10sXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddWyd2YWx1ZSddKSxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXVsndmFsdWUnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXZnJ11bJ3ZhbHVlJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddWyd2YWx1ZSddKSxcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0Q3VycmVuY3lQYWlyTW9uZXlUcmFkZUZldGNoICh7XG4gICAgICAgICAgICAnY3VycmVuY3lfcGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnY3VycmVuY3lfcGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdhbW91bnRfaW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlX2ludCddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0Q3VycmVuY3lQYWlyT3JkZXJBZGQgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIG5vbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgcmVxdWVzdCA9IHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHJlcXVlc3Q7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoeyAnbm9uY2UnOiBub25jZSB9LCBxdWVyeSkpO1xuICAgICAgICAgICAgbGV0IHNlY3JldCA9IHRoaXMuYmFzZTY0VG9CaW5hcnkgKHRoaXMuc2VjcmV0KTtcbiAgICAgICAgICAgIGxldCBhdXRoID0gcmVxdWVzdCArIFwiXFwwXCIgKyBib2R5O1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ1Jlc3QtS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1Jlc3QtU2lnbic6IHRoaXMuaG1hYyAoYXV0aCwgc2VjcmV0LCAnc2hhNTEyJywgJ2Jhc2U2NCcpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdDJjID0ge1xuXG4gICAgJ2lkJzogJ2JpdDJjJyxcbiAgICAnbmFtZSc6ICdCaXQyQycsXG4gICAgJ2NvdW50cmllcyc6ICdJTCcsIC8vIElzcmFlbFxuICAgICdyYXRlTGltaXQnOiAzMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MTE5LTM1OTMyMjBlLTVlY2UtMTFlNy04YjNhLTVhMDQxZjZiY2MzZi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vd3d3LmJpdDJjLmNvLmlsJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5iaXQyYy5jby5pbCcsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cuYml0MmMuY28uaWwvaG9tZS9hcGknLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9PZmVyRS9iaXQyYycsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnRXhjaGFuZ2VzL3twYWlyfS9UaWNrZXInLFxuICAgICAgICAgICAgICAgICdFeGNoYW5nZXMve3BhaXJ9L29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ0V4Y2hhbmdlcy97cGFpcn0vdHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ0FjY291bnQvQmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ0FjY291bnQvQmFsYW5jZS92MicsXG4gICAgICAgICAgICAgICAgJ01lcmNoYW50L0NyZWF0ZUNoZWNrb3V0JyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvQWNjb3VudEhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdPcmRlci9BZGRDb2luRnVuZHNSZXF1ZXN0JyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvQWRkRnVuZCcsXG4gICAgICAgICAgICAgICAgJ09yZGVyL0FkZE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvQWRkT3JkZXJNYXJrZXRQcmljZUJ1eScsXG4gICAgICAgICAgICAgICAgJ09yZGVyL0FkZE9yZGVyTWFya2V0UHJpY2VTZWxsJyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvQ2FuY2VsT3JkZXInLFxuICAgICAgICAgICAgICAgICdPcmRlci9NeU9yZGVycycsXG4gICAgICAgICAgICAgICAgJ1BheW1lbnQvR2V0TXlJZCcsXG4gICAgICAgICAgICAgICAgJ1BheW1lbnQvU2VuZCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL05JUyc6IHsgJ2lkJzogJ0J0Y05pcycsICdzeW1ib2wnOiAnQlRDL05JUycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdOSVMnIH0sXG4gICAgICAgICdMVEMvQlRDJzogeyAnaWQnOiAnTHRjQnRjJywgJ3N5bWJvbCc6ICdMVEMvQlRDJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0xUQy9OSVMnOiB7ICdpZCc6ICdMdGNOaXMnLCAnc3ltYm9sJzogJ0xUQy9OSVMnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnTklTJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEFjY291bnRCYWxhbmNlVjIgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEV4Y2hhbmdlc1BhaXJPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gb3JkZXJbMF07XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IG9yZGVyWzFdO1xuICAgICAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBvcmRlclsyXSAqIDEwMDA7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCwgdGltZXN0YW1wIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEV4Y2hhbmdlc1BhaXJUaWNrZXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbCddKSxcbiAgICAgICAgICAgICdiaWQnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXNrJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsbCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogcGFyc2VGbG9hdCAodGlja2VyWydhdiddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydhJ10pLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRFeGNoYW5nZXNQYWlyVHJhZGVzICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0T3JkZXJBZGRPcmRlcic7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdBbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAnUGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHtcbiAgICAgICAgICAgIG1ldGhvZCArPSAnTWFya2V0UHJpY2UnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9yZGVyWydQcmljZSddID0gcHJpY2U7XG4gICAgICAgICAgICBvcmRlclsnVG90YWwnXSA9IGFtb3VudCAqIHByaWNlO1xuICAgICAgICAgICAgb3JkZXJbJ0lzQmlkJ10gPSAoc2lkZSA9PSAnYnV5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy5qc29uJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoeyAnbm9uY2UnOiBub25jZSB9LCBwYXJhbXMpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ3NpZ24nOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJywgJ2Jhc2U2NCcpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdGJheSA9IHtcblxuICAgICdpZCc6ICdiaXRiYXknLFxuICAgICduYW1lJzogJ0JpdEJheScsXG4gICAgJ2NvdW50cmllcyc6IFsgJ1BMJywgJ0VVJywgXSwgLy8gUG9sYW5kXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYxMzItOTc4YTdiZDgtNWVjZS0xMWU3LTk1NDAtYmM5NmQxZTliYmI4LmpwZycsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9iaXRiYXkubmV0JyxcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdwdWJsaWMnOiAnaHR0cHM6Ly9iaXRiYXkubmV0L0FQSS9QdWJsaWMnLFxuICAgICAgICAgICAgJ3ByaXZhdGUnOiAnaHR0cHM6Ly9iaXRiYXkubmV0L0FQSS9UcmFkaW5nL3RyYWRpbmdBcGkucGhwJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL2JpdGJheS5uZXQvcHVibGljLWFwaScsXG4gICAgICAgICAgICAnaHR0cHM6Ly9iaXRiYXkubmV0L2FjY291bnQvdGFiLWFwaScsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL0JpdEJheU5ldC9BUEknLFxuICAgICAgICBdLCBcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICd7aWR9L2FsbCcsXG4gICAgICAgICAgICAgICAgJ3tpZH0vbWFya2V0JyxcbiAgICAgICAgICAgICAgICAne2lkfS9vcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICd7aWR9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3tpZH0vdHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2luZm8nLFxuICAgICAgICAgICAgICAgICd0cmFkZScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICdoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7ICBcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdCVENVU0QnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ0JUQ0VVUicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdCVEMvUExOJzogeyAnaWQnOiAnQlRDUExOJywgJ3N5bWJvbCc6ICdCVEMvUExOJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1BMTicgfSxcbiAgICAgICAgJ0xUQy9VU0QnOiB7ICdpZCc6ICdMVENVU0QnLCAnc3ltYm9sJzogJ0xUQy9VU0QnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnTFRDL0VVUic6IHsgJ2lkJzogJ0xUQ0VVUicsICdzeW1ib2wnOiAnTFRDL0VVUicsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdMVEMvUExOJzogeyAnaWQnOiAnTFRDUExOJywgJ3N5bWJvbCc6ICdMVEMvUExOJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ1BMTicgfSxcbiAgICAgICAgJ0xUQy9CVEMnOiB7ICdpZCc6ICdMVENCVEMnLCAnc3ltYm9sJzogJ0xUQy9CVEMnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnRVRIL1VTRCc6IHsgJ2lkJzogJ0VUSFVTRCcsICdzeW1ib2wnOiAnRVRIL1VTRCcsICdiYXNlJzogJ0VUSCcsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdFVEgvRVVSJzogeyAnaWQnOiAnRVRIRVVSJywgJ3N5bWJvbCc6ICdFVEgvRVVSJywgJ2Jhc2UnOiAnRVRIJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICAgICAgJ0VUSC9QTE4nOiB7ICdpZCc6ICdFVEhQTE4nLCAnc3ltYm9sJzogJ0VUSC9QTE4nLCAnYmFzZSc6ICdFVEgnLCAncXVvdGUnOiAnUExOJyB9LFxuICAgICAgICAnRVRIL0JUQyc6IHsgJ2lkJzogJ0VUSEJUQycsICdzeW1ib2wnOiAnRVRIL0JUQycsICdiYXNlJzogJ0VUSCcsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMU0svVVNEJzogeyAnaWQnOiAnTFNLVVNEJywgJ3N5bWJvbCc6ICdMU0svVVNEJywgJ2Jhc2UnOiAnTFNLJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0xTSy9FVVInOiB7ICdpZCc6ICdMU0tFVVInLCAnc3ltYm9sJzogJ0xTSy9FVVInLCAnYmFzZSc6ICdMU0snLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgICAgICAnTFNLL1BMTic6IHsgJ2lkJzogJ0xTS1BMTicsICdzeW1ib2wnOiAnTFNLL1BMTicsICdiYXNlJzogJ0xTSycsICdxdW90ZSc6ICdQTE4nIH0sXG4gICAgICAgICdMU0svQlRDJzogeyAnaWQnOiAnTFNLQlRDJywgJ3N5bWJvbCc6ICdMU0svQlRDJywgJ2Jhc2UnOiAnTFNLJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHsgXG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0SWRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogb3JkZXJib29rWydiaWRzJ10sXG4gICAgICAgICAgICAnYXNrcyc6IG9yZGVyYm9va1snYXNrcyddLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0SWRUaWNrZXIgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWF4J10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWluJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2F2ZXJhZ2UnXSksXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRJZFRyYWRlcyAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IHBbJ2Jhc2UnXSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncGF5bWVudF9jdXJyZW5jeSc6IHBbJ3F1b3RlJ10sXG4gICAgICAgICAgICAncmF0ZSc6IHByaWNlLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV07XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpICsgJy5qc29uJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbWV0aG9kJzogcGF0aCxcbiAgICAgICAgICAgICAgICAnbW9tZW50JzogdGhpcy5ub25jZSAoKSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0FQSS1LZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnQVBJLUhhc2gnOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0YmF5cyA9IHtcblxuICAgICdpZCc6ICdiaXRiYXlzJyxcbiAgICAnbmFtZSc6ICdCaXRCYXlzJyxcbiAgICAnY291bnRyaWVzJzogWyAnQ04nLCAnR0InLCAnSEsnLCAnQVUnLCAnQ0EnIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3ODA4NTk5LTk4MzY4N2QyLTYwNTEtMTFlNy04ZDk1LTgwZGZjYmU1Y2JiNC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYml0YmF5cy5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2JpdGJheXMuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2JpdGJheXMuY29tL2hlbHAvYXBpLycsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnZGVwdGgnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnaW5mbycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAndHJhZGUnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdidGNfdXNkJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0JUQy9DTlknOiB7ICdpZCc6ICdidGNfY255JywgJ3N5bWJvbCc6ICdCVEMvQ05ZJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ09EUy9CVEMnOiB7ICdpZCc6ICdvZHNfYnRjJywgJ3N5bWJvbCc6ICdPRFMvQlRDJywgJ2Jhc2UnOiAnT0RTJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0xTSy9CVEMnOiB7ICdpZCc6ICdsc2tfYnRjJywgJ3N5bWJvbCc6ICdMU0svQlRDJywgJ2Jhc2UnOiAnTFNLJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0xTSy9DTlknOiB7ICdpZCc6ICdsc2tfY255JywgJ3N5bWJvbCc6ICdMU0svQ05ZJywgJ2Jhc2UnOiAnTFNLJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXREZXB0aCAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSByZXNwb25zZVsncmVzdWx0J107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWzBdKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbMV0pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydyZXN1bHQnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnb3AnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHtcbiAgICAgICAgICAgIG9yZGVyWydvcmRlcl90eXBlJ10gPSAxO1xuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9yZGVyWydvcmRlcl90eXBlJ10gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VHJhZGUgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdTaWduJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdGNvaW5jb2lkID0ge1xuXG4gICAgJ2lkJzogJ2JpdGNvaW5jb2lkJyxcbiAgICAnbmFtZSc6ICdCaXRjb2luLmNvLmlkJyxcbiAgICAnY291bnRyaWVzJzogJ0lEJywgLy8gSW5kb25lc2lhXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYxMzgtMDQzYzc3ODYtNWVjZi0xMWU3LTg4MmItODA5YzE0ZjM4YjUzLmpwZycsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAncHVibGljJzogJ2h0dHBzOi8vdmlwLmJpdGNvaW4uY28uaWQvYXBpJyxcbiAgICAgICAgICAgICdwcml2YXRlJzogJ2h0dHBzOi8vdmlwLmJpdGNvaW4uY28uaWQvdGFwaScsXG4gICAgICAgIH0sXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuYml0Y29pbi5jby5pZCcsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly92aXAuYml0Y29pbi5jby5pZC90cmFkZV9hcGknLFxuICAgICAgICAgICAgJ2h0dHBzOi8vdmlwLmJpdGNvaW4uY28uaWQvZG93bmxvYWRzL0JJVENPSU5DT0lELUFQSS1ET0NVTUVOVEFUSU9OLnBkZicsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAne3BhaXJ9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3twYWlyfS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICd7cGFpcn0vZGVwdGgnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnZ2V0SW5mbycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAndHJhZGVIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnb3Blbk9yZGVycycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvSURSJzogIHsgJ2lkJzogJ2J0Y19pZHInLCAnc3ltYm9sJzogJ0JUQy9JRFInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSURSJywgJ2Jhc2VJZCc6ICdidGMnLCAncXVvdGVJZCc6ICdpZHInIH0sXG4gICAgICAgICdCVFMvQlRDJzogIHsgJ2lkJzogJ2J0c19idGMnLCAnc3ltYm9sJzogJ0JUUy9CVEMnLCAnYmFzZSc6ICdCVFMnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdidHMnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdEQVNIL0JUQyc6IHsgJ2lkJzogJ2Rya19idGMnLCAnc3ltYm9sJzogJ0RBU0gvQlRDJywgJ2Jhc2UnOiAnREFTSCcsICdxdW90ZSc6ICdCVEMnLCAnYmFzZUlkJzogJ2RyaycsICdxdW90ZUlkJzogJ2J0YycgfSxcbiAgICAgICAgJ0RPR0UvQlRDJzogeyAnaWQnOiAnZG9nZV9idGMnLCAnc3ltYm9sJzogJ0RPR0UvQlRDJywgJ2Jhc2UnOiAnRE9HRScsICdxdW90ZSc6ICdCVEMnLCAnYmFzZUlkJzogJ2RvZ2UnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdFVEgvQlRDJzogIHsgJ2lkJzogJ2V0aF9idGMnLCAnc3ltYm9sJzogJ0VUSC9CVEMnLCAnYmFzZSc6ICdFVEgnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdldGgnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdMVEMvQlRDJzogIHsgJ2lkJzogJ2x0Y19idGMnLCAnc3ltYm9sJzogJ0xUQy9CVEMnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdsdGMnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdOWFQvQlRDJzogIHsgJ2lkJzogJ254dF9idGMnLCAnc3ltYm9sJzogJ05YVC9CVEMnLCAnYmFzZSc6ICdOWFQnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdueHQnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdTVFIvQlRDJzogIHsgJ2lkJzogJ3N0cl9idGMnLCAnc3ltYm9sJzogJ1NUUi9CVEMnLCAnYmFzZSc6ICdTVFInLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdzdHInLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdORU0vQlRDJzogIHsgJ2lkJzogJ25lbV9idGMnLCAnc3ltYm9sJzogJ05FTS9CVEMnLCAnYmFzZSc6ICdORU0nLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICduZW0nLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdYUlAvQlRDJzogIHsgJ2lkJzogJ3hycF9idGMnLCAnc3ltYm9sJzogJ1hSUC9CVEMnLCAnYmFzZSc6ICdYUlAnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICd4cnAnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0R2V0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0UGFpckRlcHRoICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0geyAnYmlkcyc6ICdidXknLCAnYXNrcyc6ICdzZWxsJyB9O1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChzaWRlcyk7XG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwga2V5cy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgbGV0IGtleSA9IGtleXNba107XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW2tleV07XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbMF0pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsxXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwYWlyID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQYWlyVGlja2VyICh7XG4gICAgICAgICAgICAncGFpcic6IHBhaXJbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3RpY2tlciddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VGbG9hdCAodGlja2VyWydzZXJ2ZXJfdGltZSddKSAqIDEwMDA7XG4gICAgICAgIGxldCBiYXNlVm9sdW1lID0gJ3ZvbF8nICsgcGFpclsnYmFzZUlkJ10udG9Mb3dlckNhc2UgKCk7XG4gICAgICAgIGxldCBxdW90ZVZvbHVtZSA9ICd2b2xfJyArIHBhaXJbJ3F1b3RlSWQnXS50b0xvd2VyQ2FzZSAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXZlcmFnZSddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyW2Jhc2VWb2x1bWVdKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlcltxdW90ZVZvbHVtZV0pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFBhaXJUcmFkZXMgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3BhaXInOiBwWydpZCddLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UsXG4gICAgICAgIH07XG4gICAgICAgIGxldCBiYXNlID0gcFsnYmFzZSddLnRvTG93ZXJDYXNlICgpO1xuICAgICAgICBvcmRlcltiYXNlXSA9IGFtb3VudDtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV07XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdtZXRob2QnOiBwYXRoLFxuICAgICAgICAgICAgICAgICdub25jZSc6IHRoaXMubm9uY2UgKCksXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdLZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnU2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXRmaW5leCA9IHtcblxuICAgICdpZCc6ICdiaXRmaW5leCcsXG4gICAgJ25hbWUnOiAnQml0ZmluZXgnLFxuICAgICdjb3VudHJpZXMnOiAnVVMnLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjI0NC1lMzI4YTUwYy01ZWQyLTExZTctOTQ3Yi0wNDE0MTY1NzliYjMuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5iaXRmaW5leC5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmJpdGZpbmV4LmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9iaXRmaW5leC5yZWFkbWUuaW8vdjEvZG9jcycsXG4gICAgICAgICAgICAnaHR0cHM6Ly9iaXRmaW5leC5yZWFkbWUuaW8vdjIvZG9jcycsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL2JpdGZpbmV4Y29tL2JpdGZpbmV4LWFwaS1ub2RlJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdib29rL3tzeW1ib2x9JyxcbiAgICAgICAgICAgICAgICAnY2FuZGxlcy97c3ltYm9sfScsXG4gICAgICAgICAgICAgICAgJ2xlbmRib29rL3tjdXJyZW5jeX0nLFxuICAgICAgICAgICAgICAgICdsZW5kcy97Y3VycmVuY3l9JyxcbiAgICAgICAgICAgICAgICAncHVidGlja2VyL3tzeW1ib2x9JyxcbiAgICAgICAgICAgICAgICAnc3RhdHMve3N5bWJvbH0nLFxuICAgICAgICAgICAgICAgICdzeW1ib2xzJyxcbiAgICAgICAgICAgICAgICAnc3ltYm9sc19kZXRhaWxzJyxcbiAgICAgICAgICAgICAgICAndG9kYXknLFxuICAgICAgICAgICAgICAgICd0cmFkZXMve3N5bWJvbH0nLCAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRfaW5mb3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2Jhc2tldF9tYW5hZ2UnLFxuICAgICAgICAgICAgICAgICdjcmVkaXRzJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdC9uZXcnLFxuICAgICAgICAgICAgICAgICdmdW5kaW5nL2Nsb3NlJyxcbiAgICAgICAgICAgICAgICAnaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ2hpc3RvcnkvbW92ZW1lbnRzJyxcbiAgICAgICAgICAgICAgICAna2V5X2luZm8nLFxuICAgICAgICAgICAgICAgICdtYXJnaW5faW5mb3MnLFxuICAgICAgICAgICAgICAgICdteXRyYWRlcycsXG4gICAgICAgICAgICAgICAgJ29mZmVyL2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29mZmVyL25ldycsXG4gICAgICAgICAgICAgICAgJ29mZmVyL3N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ29mZmVycycsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NhbmNlbC9hbGwnLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwvbXVsdGknLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwvcmVwbGFjZScsXG4gICAgICAgICAgICAgICAgJ29yZGVyL25ldycsXG4gICAgICAgICAgICAgICAgJ29yZGVyL25ldy9tdWx0aScsXG4gICAgICAgICAgICAgICAgJ29yZGVyL3N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL2NsYWltJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb25zJyxcbiAgICAgICAgICAgICAgICAnc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJ3Rha2VuX2Z1bmRzJyxcbiAgICAgICAgICAgICAgICAndG90YWxfdGFrZW5fZnVuZHMnLFxuICAgICAgICAgICAgICAgICd0cmFuc2ZlcicsXG4gICAgICAgICAgICAgICAgJ3VudXNlZF90YWtlbl9mdW5kcycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFN5bWJvbHNEZXRhaWxzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydwYWlyJ10udG9VcHBlckNhc2UgKCk7XG4gICAgICAgICAgICBsZXQgYmFzZSA9IGlkLnNsaWNlICgwLCAzKTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IGlkLnNsaWNlICgzLCA2KTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZXMgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEJvb2tTeW1ib2wgKHsgXG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbJ3ByaWNlJ10pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsnYW1vdW50J10pO1xuICAgICAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAocGFyc2VGbG9hdCAob3JkZXJbJ3RpbWVzdGFtcCddKSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCwgdGltZXN0YW1wIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFB1YnRpY2tlclN5bWJvbCAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUZsb2F0ICh0aWNrZXJbJ3RpbWVzdGFtcCddKSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RfcHJpY2UnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWlkJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXNTeW1ib2wgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RPcmRlck5ldyAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LnRvU3RyaW5nICgpLFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UudG9TdHJpbmcgKCksXG4gICAgICAgICAgICAnc2lkZSc6IHNpZGUsXG4gICAgICAgICAgICAndHlwZSc6ICdleGNoYW5nZSAnICsgdHlwZSxcbiAgICAgICAgICAgICdvY29vcmRlcic6IGZhbHNlLFxuICAgICAgICAgICAgJ2J1eV9wcmljZV9vY28nOiAwLFxuICAgICAgICAgICAgJ3NlbGxfcHJpY2Vfb2NvJzogMCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCByZXF1ZXN0ID0gJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgcmVxdWVzdDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHsgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UudG9TdHJpbmcgKCksXG4gICAgICAgICAgICAgICAgJ3JlcXVlc3QnOiByZXF1ZXN0LFxuICAgICAgICAgICAgfSwgcXVlcnkpO1xuICAgICAgICAgICAgbGV0IHBheWxvYWQgPSB0aGlzLnN0cmluZ1RvQmFzZTY0IChKU09OLnN0cmluZ2lmeSAocXVlcnkpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ1gtQkZYLUFQSUtFWSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdYLUJGWC1QQVlMT0FEJzogcGF5bG9hZCxcbiAgICAgICAgICAgICAgICAnWC1CRlgtU0lHTkFUVVJFJzogdGhpcy5obWFjIChwYXlsb2FkLCB0aGlzLnNlY3JldCwgJ3NoYTM4NCcpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdGxpc2ggPSB7XG5cbiAgICAnaWQnOiAnYml0bGlzaCcsXG4gICAgJ25hbWUnOiAnYml0bGlzaCcsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0dCJywgJ0VVJywgJ1JVJywgXSxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCwgICAgXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2Mjc1LWRjZmM2YzMwLTVlZDMtMTFlNy04MzlkLTAwYTg0NjM4NWQwYi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYml0bGlzaC5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2JpdGxpc2guY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2JpdGxpc2guY29tL2FwaScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnaW5zdHJ1bWVudHMnLFxuICAgICAgICAgICAgICAgICdvaGxjdicsXG4gICAgICAgICAgICAgICAgJ3BhaXJzJyxcbiAgICAgICAgICAgICAgICAndGlja2VycycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlc19kZXB0aCcsXG4gICAgICAgICAgICAgICAgJ3RyYWRlc19oaXN0b3J5JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzX29wZXJhdGlvbnMnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX3RyYWRlJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX3RyYWRlc19ieV9pZHMnLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfYWxsX3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZV9iY29kZScsXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZV90ZW1wbGF0ZV93YWxsZXQnLFxuICAgICAgICAgICAgICAgICdjcmVhdGVfdHJhZGUnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0JyxcbiAgICAgICAgICAgICAgICAnbGlzdF9hY2NvdW50c19vcGVyYXRpb25zX2Zyb21fdHMnLFxuICAgICAgICAgICAgICAgICdsaXN0X2FjdGl2ZV90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdsaXN0X2Jjb2RlcycsXG4gICAgICAgICAgICAgICAgJ2xpc3RfbXlfbWF0Y2hlc19mcm9tX3RzJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9teV90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdsaXN0X215X3RyYWRzX2Zyb21fdHMnLFxuICAgICAgICAgICAgICAgICdsaXN0X3BheW1lbnRfbWV0aG9kcycsXG4gICAgICAgICAgICAgICAgJ2xpc3RfcGF5bWVudHMnLFxuICAgICAgICAgICAgICAgICdyZWRlZW1fY29kZScsXG4gICAgICAgICAgICAgICAgJ3Jlc2lnbicsXG4gICAgICAgICAgICAgICAgJ3NpZ25pbicsXG4gICAgICAgICAgICAgICAgJ3NpZ25vdXQnLFxuICAgICAgICAgICAgICAgICd0cmFkZV9kZXRhaWxzJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfb3B0aW9ucycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdfYnlfaWQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0UGFpcnMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAocHJvZHVjdHMpO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IGtleXMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNba2V5c1twXV07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydpZCddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IHByb2R1Y3RbJ25hbWUnXTtcbiAgICAgICAgICAgIGxldCBbIGJhc2UsIHF1b3RlIF0gPSBzeW1ib2wuc3BsaXQgKCcvJyk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHRpY2tlcnMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlcnMgKCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSB0aWNrZXJzW3BbJ2lkJ11dO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21heCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21pbiddKSxcbiAgICAgICAgICAgICdiaWQnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXNrJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnZmlyc3QnXSksXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0VHJhZGVzRGVwdGggKHtcbiAgICAgICAgICAgICdwYWlyX2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50IChwYXJzZUludCAob3JkZXJib29rWydsYXN0J10pIC8gMTAwMCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IHsgJ2JpZHMnOiAnYmlkJywgJ2Fza3MnOiAnYXNrJyB9O1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChzaWRlcyk7XG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwga2V5cy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgbGV0IGtleSA9IGtleXNba107XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW2tleV07XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbJ3ByaWNlJ10pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsndm9sdW1lJ10pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXNIaXN0b3J5ICh7XG4gICAgICAgICAgICAncGFpcl9pZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgc2lnbkluICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RTaWduaW4gKHtcbiAgICAgICAgICAgICdsb2dpbic6IHRoaXMubG9naW4sXG4gICAgICAgICAgICAncGFzc3dkJzogdGhpcy5wYXNzd29yZCxcbiAgICAgICAgfSk7XG4gICAgfSwgICAgXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3BhaXJfaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnZGlyJzogKHNpZGUgPT0gJ2J1eScpID8gJ2JpZCcgOiAnYXNrJyxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdENyZWF0ZVRyYWRlICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHBhdGg7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAodGhpcy5leHRlbmQgKHsgJ3Rva2VuJzogdGhpcy5hcGlLZXkgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXRtYXJrZXQgPSB7XG5cbiAgICAnaWQnOiAnYml0bWFya2V0JyxcbiAgICAnbmFtZSc6ICdCaXRNYXJrZXQnLFxuICAgICdjb3VudHJpZXMnOiBbICdQTCcsICdFVScsIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDMwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjcyNTYtYTg1NTUyMDAtNWVmOS0xMWU3LTk2ZmQtNDY5YTY1ZTJiMGJkLmpwZycsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAncHVibGljJzogJ2h0dHBzOi8vd3d3LmJpdG1hcmtldC5uZXQnLFxuICAgICAgICAgICAgJ3ByaXZhdGUnOiAnaHR0cHM6Ly93d3cuYml0bWFya2V0LnBsL2FwaTIvJywgLy8gbGFzdCBzbGFzaCBpcyBjcml0aWNhbFxuICAgICAgICB9LFxuICAgICAgICAnd3d3JzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3LmJpdG1hcmtldC5wbCcsXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cuYml0bWFya2V0Lm5ldCcsXG4gICAgICAgIF0sXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cuYml0bWFya2V0Lm5ldC9kb2NzLnBocD9maWxlPWFwaV9wdWJsaWMuaHRtbCcsXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cuYml0bWFya2V0Lm5ldC9kb2NzLnBocD9maWxlPWFwaV9wcml2YXRlLmh0bWwnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9iaXRtYXJrZXQtbmV0L2FwaScsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnanNvbi97bWFya2V0fS90aWNrZXInLFxuICAgICAgICAgICAgICAgICdqc29uL3ttYXJrZXR9L29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ2pzb24ve21hcmtldH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnanNvbi9jdHJhbnNmZXInLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vOTBtJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzZoJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzFkJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzdkJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzFtJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzNtJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzZtJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzF5JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2luZm8nLFxuICAgICAgICAgICAgICAgICd0cmFkZScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2FscycsXG4gICAgICAgICAgICAgICAgJ3RyYWRpbmdkZXNrJyxcbiAgICAgICAgICAgICAgICAndHJhZGluZ2Rlc2tTdGF0dXMnLFxuICAgICAgICAgICAgICAgICd0cmFkaW5nZGVza0NvbmZpcm0nLFxuICAgICAgICAgICAgICAgICdjcnlwdG90cmFkaW5nZGVzaycsXG4gICAgICAgICAgICAgICAgJ2NyeXB0b3RyYWRpbmdkZXNrU3RhdHVzJyxcbiAgICAgICAgICAgICAgICAnY3J5cHRvdHJhZGluZ2Rlc2tDb25maXJtJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd0ZpYXQnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd1BMTlBQJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdGaWF0RmFzdCcsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXQnLFxuICAgICAgICAgICAgICAgICd0cmFuc2ZlcicsXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVycycsXG4gICAgICAgICAgICAgICAgJ21hcmdpbkxpc3QnLFxuICAgICAgICAgICAgICAgICdtYXJnaW5PcGVuJyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luQ2xvc2UnLFxuICAgICAgICAgICAgICAgICdtYXJnaW5DYW5jZWwnLFxuICAgICAgICAgICAgICAgICdtYXJnaW5Nb2RpZnknLFxuICAgICAgICAgICAgICAgICdtYXJnaW5CYWxhbmNlQWRkJyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luQmFsYW5jZVJlbW92ZScsXG4gICAgICAgICAgICAgICAgJ3N3YXBMaXN0JyxcbiAgICAgICAgICAgICAgICAnc3dhcE9wZW4nLFxuICAgICAgICAgICAgICAgICdzd2FwQ2xvc2UnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9QTE4nOiB7ICdpZCc6ICdCVENQTE4nLCAnc3ltYm9sJzogJ0JUQy9QTE4nLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnUExOJyB9LFxuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ0JUQ0VVUicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdMVEMvUExOJzogeyAnaWQnOiAnTFRDUExOJywgJ3N5bWJvbCc6ICdMVEMvUExOJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ1BMTicgfSxcbiAgICAgICAgJ0xUQy9CVEMnOiB7ICdpZCc6ICdMVENCVEMnLCAnc3ltYm9sJzogJ0xUQy9CVEMnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnTE1YL0JUQyc6IHsgJ2lkJzogJ0xpdGVNaW5lWEJUQycsICdzeW1ib2wnOiAnTE1YL0JUQycsICdiYXNlJzogJ0xNWCcsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHsgXG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEpzb25NYXJrZXRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IG9yZGVyYm9va1snYmlkcyddLFxuICAgICAgICAgICAgJ2Fza3MnOiBvcmRlcmJvb2tbJ2Fza3MnXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0SnNvbk1hcmtldFRpY2tlciAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWyd2d2FwJ10pLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRKc29uTWFya2V0VHJhZGVzICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VHJhZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdyYXRlJzogcHJpY2UsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXVt0eXBlXTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIHVybCArPSAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGggKyAnLmpzb24nLCBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ3RvbmNlJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ21ldGhvZCc6IHBhdGgsXG4gICAgICAgICAgICB9LCBwYXJhbXMpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdBUEktS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ0FQSS1IYXNoJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdG1leCA9IHtcblxuICAgICdpZCc6ICdiaXRtZXgnLFxuICAgICduYW1lJzogJ0JpdE1FWCcsXG4gICAgJ2NvdW50cmllcyc6ICdTQycsIC8vIFNleWNoZWxsZXNcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYzMTktZjY1M2M2ZTYtNWVkNC0xMWU3LTkzM2QtZjBiYzM2OTlhZThmLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly93d3cuYml0bWV4LmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuYml0bWV4LmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cuYml0bWV4LmNvbS9hcHAvYXBpT3ZlcnZpZXcnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9CaXRNRVgvYXBpLWNvbm5lY3RvcnMvdHJlZS9tYXN0ZXIvb2ZmaWNpYWwtaHR0cCcsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYW5ub3VuY2VtZW50JyxcbiAgICAgICAgICAgICAgICAnYW5ub3VuY2VtZW50L3VyZ2VudCcsXG4gICAgICAgICAgICAgICAgJ2Z1bmRpbmcnLFxuICAgICAgICAgICAgICAgICdpbnN0cnVtZW50JyxcbiAgICAgICAgICAgICAgICAnaW5zdHJ1bWVudC9hY3RpdmUnLFxuICAgICAgICAgICAgICAgICdpbnN0cnVtZW50L2FjdGl2ZUFuZEluZGljZXMnLFxuICAgICAgICAgICAgICAgICdpbnN0cnVtZW50L2FjdGl2ZUludGVydmFscycsXG4gICAgICAgICAgICAgICAgJ2luc3RydW1lbnQvY29tcG9zaXRlSW5kZXgnLFxuICAgICAgICAgICAgICAgICdpbnN0cnVtZW50L2luZGljZXMnLFxuICAgICAgICAgICAgICAgICdpbnN1cmFuY2UnLFxuICAgICAgICAgICAgICAgICdsZWFkZXJib2FyZCcsXG4gICAgICAgICAgICAgICAgJ2xpcXVpZGF0aW9uJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJCb29rJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJCb29rL0wyJyxcbiAgICAgICAgICAgICAgICAncXVvdGUnLFxuICAgICAgICAgICAgICAgICdxdW90ZS9idWNrZXRlZCcsXG4gICAgICAgICAgICAgICAgJ3NjaGVtYScsXG4gICAgICAgICAgICAgICAgJ3NjaGVtYS93ZWJzb2NrZXRIZWxwJyxcbiAgICAgICAgICAgICAgICAnc2V0dGxlbWVudCcsXG4gICAgICAgICAgICAgICAgJ3N0YXRzJyxcbiAgICAgICAgICAgICAgICAnc3RhdHMvaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAndHJhZGUvYnVja2V0ZWQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdhcGlLZXknLFxuICAgICAgICAgICAgICAgICdjaGF0JyxcbiAgICAgICAgICAgICAgICAnY2hhdC9jaGFubmVscycsXG4gICAgICAgICAgICAgICAgJ2NoYXQvY29ubmVjdGVkJyxcbiAgICAgICAgICAgICAgICAnZXhlY3V0aW9uJyxcbiAgICAgICAgICAgICAgICAnZXhlY3V0aW9uL3RyYWRlSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ25vdGlmaWNhdGlvbicsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24nLFxuICAgICAgICAgICAgICAgICd1c2VyJyxcbiAgICAgICAgICAgICAgICAndXNlci9hZmZpbGlhdGVTdGF0dXMnLFxuICAgICAgICAgICAgICAgICd1c2VyL2NoZWNrUmVmZXJyYWxDb2RlJyxcbiAgICAgICAgICAgICAgICAndXNlci9jb21taXNzaW9uJyxcbiAgICAgICAgICAgICAgICAndXNlci9kZXBvc2l0QWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbWFyZ2luJyxcbiAgICAgICAgICAgICAgICAndXNlci9taW5XaXRoZHJhd2FsRmVlJyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldEhpc3RvcnknLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldFN1bW1hcnknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdhcGlLZXknLFxuICAgICAgICAgICAgICAgICdhcGlLZXkvZGlzYWJsZScsXG4gICAgICAgICAgICAgICAgJ2FwaUtleS9lbmFibGUnLFxuICAgICAgICAgICAgICAgICdjaGF0JyxcbiAgICAgICAgICAgICAgICAnb3JkZXInLFxuICAgICAgICAgICAgICAgICdvcmRlci9idWxrJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY2FuY2VsQWxsQWZ0ZXInLFxuICAgICAgICAgICAgICAgICdvcmRlci9jbG9zZVBvc2l0aW9uJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vaXNvbGF0ZScsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL2xldmVyYWdlJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vcmlza0xpbWl0JyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vdHJhbnNmZXJNYXJnaW4nLFxuICAgICAgICAgICAgICAgICd1c2VyL2NhbmNlbFdpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICd1c2VyL2NvbmZpcm1FbWFpbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvY29uZmlybUVuYWJsZVRGQScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvY29uZmlybVdpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICd1c2VyL2Rpc2FibGVURkEnLFxuICAgICAgICAgICAgICAgICd1c2VyL2xvZ291dCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbG9nb3V0QWxsJyxcbiAgICAgICAgICAgICAgICAndXNlci9wcmVmZXJlbmNlcycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcmVxdWVzdEVuYWJsZVRGQScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcmVxdWVzdFdpdGhkcmF3YWwnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwdXQnOiBbXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvYnVsaycsXG4gICAgICAgICAgICAgICAgJ3VzZXInLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ2FwaUtleScsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvYWxsJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH1cbiAgICB9LCBcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEluc3RydW1lbnRBY3RpdmUgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1twXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ3N5bWJvbCddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0Wyd1bmRlcmx5aW5nJ107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydxdW90ZUN1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgaXNGdXR1cmVzQ29udHJhY3QgPSBpZCAhPSAoYmFzZSArIHF1b3RlKTtcbiAgICAgICAgICAgIGJhc2UgPSB0aGlzLmNvbW1vbkN1cnJlbmN5Q29kZSAoYmFzZSk7XG4gICAgICAgICAgICBxdW90ZSA9IHRoaXMuY29tbW9uQ3VycmVuY3lDb2RlIChxdW90ZSk7XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gaXNGdXR1cmVzQ29udHJhY3QgPyBpZCA6IChiYXNlICsgJy8nICsgcXVvdGUpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0VXNlck1hcmdpbiAoeyAnY3VycmVuY3knOiAnYWxsJyB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0T3JkZXJCb29rTDIgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGZvciAobGV0IG8gPSAwOyBvIDwgb3JkZXJib29rLmxlbmd0aDsgbysrKSB7XG4gICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcmJvb2tbb107XG4gICAgICAgICAgICBsZXQgc2lkZSA9IChvcmRlclsnc2lkZSddID09ICdTZWxsJykgPyAnYXNrcycgOiAnYmlkcyc7XG4gICAgICAgICAgICBsZXQgYW1vdW50ID0gb3JkZXJbJ3NpemUnXTtcbiAgICAgICAgICAgIGxldCBwcmljZSA9IG9yZGVyWydwcmljZSddO1xuICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPIHNvcnQgYmlkYXNrc1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnYmluU2l6ZSc6ICcxZCcsXG4gICAgICAgICAgICAncGFydGlhbCc6IHRydWUsXG4gICAgICAgICAgICAnY291bnQnOiAxLFxuICAgICAgICAgICAgJ3JldmVyc2UnOiB0cnVlLCAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBsZXQgcXVvdGVzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRRdW90ZUJ1Y2tldGVkIChyZXF1ZXN0KTtcbiAgICAgICAgbGV0IHF1b3Rlc0xlbmd0aCA9IHF1b3Rlcy5sZW5ndGg7XG4gICAgICAgIGxldCBxdW90ZSA9IHF1b3Rlc1txdW90ZXNMZW5ndGggLSAxXTtcbiAgICAgICAgbGV0IHRpY2tlcnMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRyYWRlQnVja2V0ZWQgKHJlcXVlc3QpO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1swXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHF1b3RlWydiaWRQcmljZSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0IChxdW90ZVsnYXNrUHJpY2UnXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogcGFyc2VGbG9hdCAodGlja2VyWydjbG9zZSddKSxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaG9tZU5vdGlvbmFsJ10pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydmb3JlaWduTm90aW9uYWwnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGUgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdzaWRlJzogdGhpcy5jYXBpdGFsaXplIChzaWRlKSxcbiAgICAgICAgICAgICdvcmRlclF0eSc6IGFtb3VudCxcbiAgICAgICAgICAgICdvcmRUeXBlJzogdGhpcy5jYXBpdGFsaXplICh0eXBlKSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydyYXRlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RPcmRlciAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gJy9hcGkvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHBhdGg7XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICBxdWVyeSArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyBxdWVyeTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3ByaXZhdGUnKSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgaWYgKG1ldGhvZCA9PSAnUE9TVCcpXG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5IChwYXJhbXMpO1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSBbIG1ldGhvZCwgcXVlcnksIG5vbmNlLCBib2R5IHx8ICcnXS5qb2luICgnJyk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgJ2FwaS1ub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdhcGkta2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ2FwaS1zaWduYXR1cmUnOiB0aGlzLmhtYWMgKHJlcXVlc3QsIHRoaXMuc2VjcmV0KSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXRzbyA9IHtcblxuICAgICdpZCc6ICdiaXRzbycsXG4gICAgJ25hbWUnOiAnQml0c28nLFxuICAgICdjb3VudHJpZXMnOiAnTVgnLCAvLyBNZXhpY29cbiAgICAncmF0ZUxpbWl0JzogMjAwMCwgLy8gMzAgcmVxdWVzdHMgcGVyIG1pbnV0ZVxuICAgICd2ZXJzaW9uJzogJ3YzJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjMzNS03MTVjZTdhYS01ZWQ1LTExZTctODhhOC0xNzNhMjdiYjMwZmUuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5iaXRzby5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vYml0c28uY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2JpdHNvLmNvbS9hcGlfaW5mbycsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYXZhaWxhYmxlX2Jvb2tzJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfYm9vaycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRfc3RhdHVzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2ZlZXMnLFxuICAgICAgICAgICAgICAgICdmdW5kaW5ncycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRpbmdzL3tmaWR9JyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZ19kZXN0aW5hdGlvbicsXG4gICAgICAgICAgICAgICAgJ2t5Y19kb2N1bWVudHMnLFxuICAgICAgICAgICAgICAgICdsZWRnZXInLFxuICAgICAgICAgICAgICAgICdsZWRnZXIvdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnbGVkZ2VyL2ZlZXMnLFxuICAgICAgICAgICAgICAgICdsZWRnZXIvZnVuZGluZ3MnLFxuICAgICAgICAgICAgICAgICdsZWRnZXIvd2l0aGRyYXdhbHMnLFxuICAgICAgICAgICAgICAgICdteF9iYW5rX2NvZGVzJyxcbiAgICAgICAgICAgICAgICAnb3Blbl9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcl90cmFkZXMve29pZH0nLFxuICAgICAgICAgICAgICAgICdvcmRlcnMve29pZH0nLFxuICAgICAgICAgICAgICAgICd1c2VyX3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3VzZXJfdHJhZGVzL3t0aWR9JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMvJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMve3dpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiaXRjb2luX3dpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdkZWJpdF9jYXJkX3dpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdldGhlcl93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAncGhvbmVfbnVtYmVyJyxcbiAgICAgICAgICAgICAgICAncGhvbmVfdmVyaWZpY2F0aW9uJyxcbiAgICAgICAgICAgICAgICAncGhvbmVfd2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ3NwZWlfd2l0aGRyYXdhbCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlbGV0ZSc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3tvaWR9JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL2FsbCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEF2YWlsYWJsZUJvb2tzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ3BheWxvYWQnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sncGF5bG9hZCddW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnYm9vayddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGlkLnRvVXBwZXJDYXNlICgpLnJlcGxhY2UgKCdfJywgJy8nKTtcbiAgICAgICAgICAgIGxldCBbIGJhc2UsIHF1b3RlIF0gPSBzeW1ib2wuc3BsaXQgKCcvJyk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyQm9vayAoe1xuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgb3JkZXJib29rID0gcmVzcG9uc2VbJ3BheWxvYWQnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMucGFyc2U4NjAxIChvcmRlcmJvb2tbJ3VwZGF0ZWRfYXQnXSk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IFsgJ2JpZHMnLCAnYXNrcycgXTtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBzaWRlcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1tzXTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlclsncHJpY2UnXSk7XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IHBhcnNlRmxvYXQgKG9yZGVyWydhbW91bnQnXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAnYm9vayc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsncGF5bG9hZCddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5wYXJzZTg2MDEgKHRpY2tlclsnY3JlYXRlZF9hdCddKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWyd2d2FwJ10pLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXMgKHtcbiAgICAgICAgICAgICdib29rJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdib29rJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3R5cGUnOiB0eXBlLFxuICAgICAgICAgICAgJ21ham9yJzogYW1vdW50LFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RPcmRlcnMgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCBxdWVyeSA9ICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyBxdWVyeTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHBhcmFtcyk7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSBbIG5vbmNlLCBtZXRob2QsIHF1ZXJ5LCBib2R5IHx8ICcnIF0uam9pbiAoJycpO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaG1hYyAocmVxdWVzdCwgdGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgbGV0IGF1dGggPSB0aGlzLmFwaUtleSArICc6JyArIG5vbmNlICsgJzonICsgc2lnbmF0dXJlO1xuICAgICAgICAgICAgaGVhZGVycyA9IHsgJ0F1dGhvcml6YXRpb24nOiBcIkJpdHNvIFwiICsgYXV0aCB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0c3RhbXAgPSB7XG5cbiAgICAnaWQnOiAnYml0c3RhbXAnLFxuICAgICduYW1lJzogJ0JpdHN0YW1wJyxcbiAgICAnY291bnRyaWVzJzogJ0dCJyxcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndmVyc2lvbic6ICd2MicsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3ODYzNzctOGM4YWI1N2UtNWZlOS0xMWU3LThlYTQtMmIwNWI2YmNjZWVjLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly93d3cuYml0c3RhbXAubmV0L2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuYml0c3RhbXAubmV0JyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL3d3dy5iaXRzdGFtcC5uZXQvYXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdvcmRlcl9ib29rL3tpZH0vJyxcbiAgICAgICAgICAgICAgICAndGlja2VyX2hvdXIve2lkfS8nLFxuICAgICAgICAgICAgICAgICd0aWNrZXIve2lkfS8nLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMve2lkfS8nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZS8nLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlL3tpZH0vJyxcbiAgICAgICAgICAgICAgICAnYnV5L3tpZH0vJyxcbiAgICAgICAgICAgICAgICAnYnV5L21hcmtldC97aWR9LycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlci8nLFxuICAgICAgICAgICAgICAgICdsaXF1aWRhdGlvbl9hZGRyZXNzL2luZm8vJyxcbiAgICAgICAgICAgICAgICAnbGlxdWlkYXRpb25fYWRkcmVzcy9uZXcvJyxcbiAgICAgICAgICAgICAgICAnb3Blbl9vcmRlcnMvYWxsLycsXG4gICAgICAgICAgICAgICAgJ29wZW5fb3JkZXJzL3tpZH0vJyxcbiAgICAgICAgICAgICAgICAnc2VsbC97aWR9LycsXG4gICAgICAgICAgICAgICAgJ3NlbGwvbWFya2V0L3tpZH0vJyxcbiAgICAgICAgICAgICAgICAndHJhbnNmZXItZnJvbS1tYWluLycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyLXRvLW1haW4vJyxcbiAgICAgICAgICAgICAgICAndXNlcl90cmFuc2FjdGlvbnMvJyxcbiAgICAgICAgICAgICAgICAndXNlcl90cmFuc2FjdGlvbnMve2lkfS8nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2FsL2NhbmNlbC8nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2FsL29wZW4vJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbC9zdGF0dXMvJyxcbiAgICAgICAgICAgICAgICAneHJwX2FkZHJlc3MvJyxcbiAgICAgICAgICAgICAgICAneHJwX3dpdGhkcmF3YWwvJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvVVNEJzogeyAnaWQnOiAnYnRjdXNkJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdidGNldXInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgICAgICAnRVVSL1VTRCc6IHsgJ2lkJzogJ2V1cnVzZCcsICdzeW1ib2wnOiAnRVVSL1VTRCcsICdiYXNlJzogJ0VVUicsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdYUlAvVVNEJzogeyAnaWQnOiAneHJwdXNkJywgJ3N5bWJvbCc6ICdYUlAvVVNEJywgJ2Jhc2UnOiAnWFJQJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ1hSUC9FVVInOiB7ICdpZCc6ICd4cnBldXInLCAnc3ltYm9sJzogJ1hSUC9FVVInLCAnYmFzZSc6ICdYUlAnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgICAgICAnWFJQL0JUQyc6IHsgJ2lkJzogJ3hycGJ0YycsICdzeW1ib2wnOiAnWFJQL0JUQycsICdiYXNlJzogJ1hSUCcsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRPcmRlckJvb2tJZCAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50IChvcmRlcmJvb2tbJ3RpbWVzdGFtcCddKSAqIDEwMDA7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IFsgJ2JpZHMnLCAnYXNrcycgXTtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBzaWRlcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1tzXTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlclswXSk7XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IHBhcnNlRmxvYXQgKG9yZGVyWzFdKTtcbiAgICAgICAgICAgICAgICByZXN1bHRbc2lkZV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlcklkICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKHRpY2tlclsndGltZXN0YW1wJ10pICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWyd2d2FwJ10pLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhbnNhY3Rpb25zSWQgKHsgXG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlUG9zdCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0JylcbiAgICAgICAgICAgIG1ldGhvZCArPSAnTWFya2V0JztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgbWV0aG9kICs9ICdJZCc7XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgbGV0IGF1dGggPSBub25jZSArIHRoaXMudWlkICsgdGhpcy5hcGlLZXk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5obWFjIChhdXRoLCB0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdzaWduYXR1cmUnOiBzaWduYXR1cmUudG9VcHBlckNhc2UgKCksXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBxdWVyeSk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdHRyZXggPSB7XG5cbiAgICAnaWQnOiAnYml0dHJleCcsXG4gICAgJ25hbWUnOiAnQml0dHJleCcsXG4gICAgJ2NvdW50cmllcyc6ICdVUycsXG4gICAgJ3ZlcnNpb24nOiAndjEuMScsXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYzNTItY2YwYjNjMjYtNWVkNS0xMWU3LTgyYjctZjM4MjZiN2E5N2Q4LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9iaXR0cmV4LmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vYml0dHJleC5jb20nLFxuICAgICAgICAnZG9jJzogWyBcbiAgICAgICAgICAgICdodHRwczovL2JpdHRyZXguY29tL0hvbWUvQXBpJyxcbiAgICAgICAgICAgICdodHRwczovL3d3dy5ucG1qcy5vcmcvcGFja2FnZS9ub2RlLmJpdHRyZXguYXBpJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdjdXJyZW5jaWVzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0aGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ21hcmtldHMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzdW1tYXJpZXMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzdW1tYXJ5JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJywgICAgICAgICAgICBcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdhY2NvdW50Jzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdGFkZHJlc3MnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0aGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbGhpc3RvcnknLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAnbWFya2V0Jzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYnV5bGltaXQnLFxuICAgICAgICAgICAgICAgICdidXltYXJrZXQnLFxuICAgICAgICAgICAgICAgICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgICdvcGVub3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnc2VsbGxpbWl0JyxcbiAgICAgICAgICAgICAgICAnc2VsbG1hcmtldCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRNYXJrZXRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ3Jlc3VsdCddLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWydyZXN1bHQnXVtwXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ01hcmtldE5hbWUnXTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gcHJvZHVjdFsnQmFzZUN1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydNYXJrZXRDdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWNjb3VudEdldEJhbGFuY2VzICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyYm9vayAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogJ2JvdGgnLFxuICAgICAgICAgICAgJ2RlcHRoJzogNTAsXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgb3JkZXJib29rID0gcmVzcG9uc2VbJ3Jlc3VsdCddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IHsgJ2JpZHMnOiAnYnV5JywgJ2Fza3MnOiAnc2VsbCcgfTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAoc2lkZXMpO1xuICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IGtleXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2tdO1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1trZXldO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWydSYXRlJ10pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsnUXVhbnRpdHknXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0TWFya2V0c3VtbWFyeSAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsncmVzdWx0J11bMF07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLnBhcnNlODYwMSAodGlja2VyWydUaW1lU3RhbXAnXSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ0hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydMb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydCaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydBc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ0xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydWb2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0TWFya2V0aGlzdG9yeSAoeyBcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdtYXJrZXRHZXQnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKSArIHR5cGU7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAncXVhbnRpdHknOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncmF0ZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9IHR5cGUgKyAnLycgKyBtZXRob2QudG9Mb3dlckNhc2UgKCkgKyBwYXRoO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgdXJsICs9IHR5cGUgKyAnLyc7XG4gICAgICAgICAgICBpZiAoKCh0eXBlID09ICdhY2NvdW50JykgJiYgKHBhdGggIT0gJ3dpdGhkcmF3JykpIHx8IChwYXRoID09ICdvcGVub3JkZXJzJykpXG4gICAgICAgICAgICAgICAgdXJsICs9IG1ldGhvZC50b0xvd2VyQ2FzZSAoKTtcbiAgICAgICAgICAgIHVybCArPSBwYXRoICsgJz8nICsgdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ2FwaWtleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnYXBpc2lnbic6IHRoaXMuaG1hYyAodXJsLCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBidGNjaGluYSA9IHtcblxuICAgICdpZCc6ICdidGNjaGluYScsXG4gICAgJ25hbWUnOiAnQlRDQ2hpbmEnLFxuICAgICdjb3VudHJpZXMnOiAnQ04nLFxuICAgICdyYXRlTGltaXQnOiAzMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjM2OC00NjViMzI4Ni01ZWQ2LTExZTctOWExMS0wZjY0NjdlMWQ4MmIuanBnJyxcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdwdWJsaWMnOiAnaHR0cHM6Ly9kYXRhLmJ0Y2NoaW5hLmNvbS9kYXRhJyxcbiAgICAgICAgICAgICdwcml2YXRlJzogJ2h0dHBzOi8vYXBpLmJ0Y2NoaW5hLmNvbS9hcGlfdHJhZGVfdjEucGhwJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5idGNjaGluYS5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vd3d3LmJ0Y2NoaW5hLmNvbS9hcGlkb2NzJ1xuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2hpc3RvcnlkYXRhJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ0J1eUljZWJlcmdPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0J1eU9yZGVyJyxcbiAgICAgICAgICAgICAgICAnQnV5T3JkZXIyJyxcbiAgICAgICAgICAgICAgICAnQnV5U3RvcE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnQ2FuY2VsSWNlYmVyZ09yZGVyJyxcbiAgICAgICAgICAgICAgICAnQ2FuY2VsT3JkZXInLFxuICAgICAgICAgICAgICAgICdDYW5jZWxTdG9wT3JkZXInLFxuICAgICAgICAgICAgICAgICdHZXRBY2NvdW50SW5mbycsXG4gICAgICAgICAgICAgICAgJ2dldEFyY2hpdmVkT3JkZXInLFxuICAgICAgICAgICAgICAgICdnZXRBcmNoaXZlZE9yZGVycycsXG4gICAgICAgICAgICAgICAgJ0dldERlcG9zaXRzJyxcbiAgICAgICAgICAgICAgICAnR2V0SWNlYmVyZ09yZGVyJyxcbiAgICAgICAgICAgICAgICAnR2V0SWNlYmVyZ09yZGVycycsXG4gICAgICAgICAgICAgICAgJ0dldE1hcmtldERlcHRoJyxcbiAgICAgICAgICAgICAgICAnR2V0TWFya2V0RGVwdGgyJyxcbiAgICAgICAgICAgICAgICAnR2V0T3JkZXInLFxuICAgICAgICAgICAgICAgICdHZXRPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdHZXRTdG9wT3JkZXInLFxuICAgICAgICAgICAgICAgICdHZXRTdG9wT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnR2V0VHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAnR2V0V2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ0dldFdpdGhkcmF3YWxzJyxcbiAgICAgICAgICAgICAgICAnUmVxdWVzdFdpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdTZWxsSWNlYmVyZ09yZGVyJyxcbiAgICAgICAgICAgICAgICAnU2VsbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnU2VsbE9yZGVyMicsXG4gICAgICAgICAgICAgICAgJ1NlbGxTdG9wT3JkZXInLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAnbWFya2V0JzogJ2FsbCcsXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHByb2R1Y3RzKTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQga2V5ID0ga2V5c1twXTtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNba2V5XTtcbiAgICAgICAgICAgIGxldCBwYXJ0cyA9IGtleS5zcGxpdCAoJ18nKTtcbiAgICAgICAgICAgIGxldCBpZCA9IHBhcnRzWzFdO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBpZC5zbGljZSAoMCwgMyk7XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBpZC5zbGljZSAoMywgNik7XG4gICAgICAgICAgICBiYXNlID0gYmFzZS50b1VwcGVyQ2FzZSAoKTtcbiAgICAgICAgICAgIHF1b3RlID0gcXVvdGUudG9VcHBlckNhc2UgKCk7XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEdldEFjY291bnRJbmZvICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gb3JkZXJib29rWydkYXRlJ10gKiAxMDAwOztcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogb3JkZXJib29rWydiaWRzJ10sXG4gICAgICAgICAgICAnYXNrcyc6IG9yZGVyYm9va1snYXNrcyddLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgLy8gVE9ETyBzb3J0IGJpZGFza3NcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VycyA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAnbWFya2V0JzogcFsnaWQnXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSB0aWNrZXJzWyd0aWNrZXInXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsnZGF0ZSddICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogcGFyc2VGbG9hdCAodGlja2VyWydwcmV2X2Nsb3NlJ10pLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlUG9zdCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpICsgJ09yZGVyMic7XG4gICAgICAgIGxldCBvcmRlciA9IHt9O1xuICAgICAgICBsZXQgaWQgPSBwWydpZCddLnRvVXBwZXJDYXNlICgpO1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0Jykge1xuICAgICAgICAgICAgb3JkZXJbJ3BhcmFtcyddID0gWyB1bmRlZmluZWQsIGFtb3VudCwgaWQgXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9yZGVyWydwYXJhbXMnXSA9IFsgcHJpY2UsIGFtb3VudCwgaWQgXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBub25jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pY3Jvc2Vjb25kcyAoKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV0gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgcCA9IFtdO1xuICAgICAgICAgICAgaWYgKCdwYXJhbXMnIGluIHBhcmFtcylcbiAgICAgICAgICAgICAgICBwID0gcGFyYW1zWydwYXJhbXMnXTtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBsZXQgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICAnbWV0aG9kJzogcGF0aCxcbiAgICAgICAgICAgICAgICAnaWQnOiBub25jZSxcbiAgICAgICAgICAgICAgICAncGFyYW1zJzogcCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwID0gcC5qb2luICgnLCcpO1xuICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5IChyZXF1ZXN0KTtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IChcbiAgICAgICAgICAgICAgICAndG9uY2U9JyArIG5vbmNlICtcbiAgICAgICAgICAgICAgICAnJmFjY2Vzc2tleT0nICsgdGhpcy5hcGlLZXkgK1xuICAgICAgICAgICAgICAgICcmcmVxdWVzdG1ldGhvZD0nICsgbWV0aG9kLnRvTG93ZXJDYXNlICgpICtcbiAgICAgICAgICAgICAgICAnJmlkPScgKyBub25jZSArXG4gICAgICAgICAgICAgICAgJyZtZXRob2Q9JyArIHBhdGggK1xuICAgICAgICAgICAgICAgICcmcGFyYW1zPScgKyBwXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaG1hYyAocXVlcnksIHRoaXMuc2VjcmV0LCAnc2hhMScpO1xuICAgICAgICAgICAgbGV0IGF1dGggPSB0aGlzLmFwaUtleSArICc6JyArIHNpZ25hdHVyZTsgXG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdBdXRob3JpemF0aW9uJzogJ0Jhc2ljICcgKyB0aGlzLnN0cmluZ1RvQmFzZTY0IChxdWVyeSksXG4gICAgICAgICAgICAgICAgJ0pzb24tUnBjLVRvbmNlJzogbm9uY2UsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYnRjZSA9IHtcblxuICAgICdpZCc6ICdidGNlJyxcbiAgICAnbmFtZSc6ICdCVEMtZScsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0JHJywgJ1JVJyBdLCAvLyBCdWxnYXJpYSwgUnVzc2lhXG4gICAgJ3ZlcnNpb24nOiAnMycsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc4NDMyMjUtMWI1NzE1MTQtNjExYS0xMWU3LTkyMDgtMjY0MWE1NjBiNTYxLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9idGMtZS5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2J0Yy1lLmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9idGMtZS5jb20vYXBpLzMvZG9jcycsXG4gICAgICAgICAgICAnaHR0cHM6Ly9idGMtZS5jb20vdGFwaS9kb2NzJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdpbmZvJyxcbiAgICAgICAgICAgICAgICAndGlja2VyL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2RlcHRoL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97cGFpcn0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnZ2V0SW5mbycsXG4gICAgICAgICAgICAgICAgJ1RyYWRlJyxcbiAgICAgICAgICAgICAgICAnQWN0aXZlT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnT3JkZXJJbmZvJyxcbiAgICAgICAgICAgICAgICAnQ2FuY2VsT3JkZXInLFxuICAgICAgICAgICAgICAgICdUcmFkZUhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdUcmFuc0hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdDb2luRGVwb3NpdEFkZHJlc3MnLFxuICAgICAgICAgICAgICAgICdXaXRoZHJhd0NvaW4nLFxuICAgICAgICAgICAgICAgICdDcmVhdGVDb3Vwb24nLFxuICAgICAgICAgICAgICAgICdSZWRlZW1Db3Vwb24nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRJbmZvICgpO1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSByZXNwb25zZVsncGFpcnMnXTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAocHJvZHVjdHMpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwga2V5cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IGlkID0ga2V5c1twXTtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbaWRdO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IGlkLnNwbGl0ICgnXycpO1xuICAgICAgICAgICAgYmFzZSA9IGJhc2UudG9VcHBlckNhc2UgKCk7XG4gICAgICAgICAgICBxdW90ZSA9IHF1b3RlLnRvVXBwZXJDYXNlICgpO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RHZXRJbmZvICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0RGVwdGhQYWlyICh7XG4gICAgICAgICAgICAncGFpcic6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgb3JkZXJib29rID0gcmVzcG9uc2VbcFsnaWQnXV07IFxuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IG9yZGVyYm9va1snYmlkcyddLFxuICAgICAgICAgICAgJ2Fza3MnOiBvcmRlcmJvb2tbJ2Fza3MnXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VycyA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyUGFpciAoe1xuICAgICAgICAgICAgJ3BhaXInOiBwWydpZCddLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHRpY2tlcnNbcFsnaWQnXV07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3VwZGF0ZWQnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2F2ZyddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2xfY3VyJ10pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzUGFpciAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3JhdGUnOiBwcmljZSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdLZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnU2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBidGN4ID0ge1xuXG4gICAgJ2lkJzogJ2J0Y3gnLFxuICAgICduYW1lJzogJ0JUQ1gnLFxuICAgICdjb3VudHJpZXMnOiBbICdJUycsICdVUycsICdFVScsIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDMwMDAsIC8vIHN1cHBvcnQgaW4gZW5nbGlzaCBpcyB2ZXJ5IHBvb3IsIHVuYWJsZSB0byB0ZWxsIHJhdGUgbGltaXRzXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2Mzg1LTlmZGNjOThjLTVlZDYtMTFlNy04ZjE0LTY2ZDVlNWNkNDdlNi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYnRjLXguaXMvYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2J0Yy14LmlzJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2J0Yy14LmlzL2N1c3RvbS9hcGktZG9jdW1lbnQuaHRtbCcsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZGVwdGgve2lkfS97bGltaXR9JyxcbiAgICAgICAgICAgICAgICAndGlja2VyL3tpZH0nLCAgICAgICAgIFxuICAgICAgICAgICAgICAgICd0cmFkZS97aWR9L3tsaW1pdH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3JlZGVlbScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdidGMvdXNkJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdidGMvZXVyJywgJ3N5bWJvbCc6ICdCVEMvRVVSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgdGhpcy5wdWJsaWNHZXREZXB0aElkTGltaXQgKHsgXG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnbGltaXQnOiAxMDAwLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gb3JkZXJbJ3ByaWNlJ107XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IG9yZGVyWydhbW91bnQnXTtcbiAgICAgICAgICAgICAgICByZXN1bHRbc2lkZV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7IFxuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXJJZCAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndGltZSddICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVJZExpbWl0ICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnbGltaXQnOiAxMDAsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICd0eXBlJzogc2lkZS50b1VwcGVyQ2FzZSAoKSxcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJztcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIHVybCArPSB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgdXJsICs9IHR5cGU7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ01ldGhvZCc6IHBhdGgudG9VcHBlckNhc2UgKCksXG4gICAgICAgICAgICAgICAgJ05vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdLZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnU2lnbmF0dXJlJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJ4aW50aCA9IHtcblxuICAgICdpZCc6ICdieGludGgnLFxuICAgICduYW1lJzogJ0JYLmluLnRoJyxcbiAgICAnY291bnRyaWVzJzogJ1RIJywgLy8gVGhhaWxhbmRcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjQxMi01NjdiMWViNC01ZWQ3LTExZTctOTRhOC1mZjZhMzg4NGY2YzUuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2J4LmluLnRoL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9ieC5pbi50aCcsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9ieC5pbi50aC9pbmZvL2FwaScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnJywgLy8gdGlja2VyXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnLFxuICAgICAgICAgICAgICAgICdvcHRpb25ib29rJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAncGFpcmluZycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAndHJhZGVoaXN0b3J5JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdiaWxsZXInLFxuICAgICAgICAgICAgICAgICdiaWxsZ3JvdXAnLFxuICAgICAgICAgICAgICAgICdiaWxscGF5JyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdCcsXG4gICAgICAgICAgICAgICAgJ2dldG9yZGVycycsXG4gICAgICAgICAgICAgICAgJ2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdvcHRpb24taXNzdWUnLFxuICAgICAgICAgICAgICAgICdvcHRpb24tYmlkJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLXNlbGwnLFxuICAgICAgICAgICAgICAgICdvcHRpb24tbXlpc3N1ZScsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1teWJpZCcsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1teW9wdGlvbnMnLFxuICAgICAgICAgICAgICAgICdvcHRpb24tZXhlcmNpc2UnLFxuICAgICAgICAgICAgICAgICdvcHRpb24tY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLWhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2FsLWhpc3RvcnknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0UGFpcmluZyAoKTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAocHJvZHVjdHMpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwga2V5cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1trZXlzW3BdXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ3BhaXJpbmdfaWQnXTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gcHJvZHVjdFsncHJpbWFyeV9jdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsnc2Vjb25kYXJ5X2N1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyYm9vayAoe1xuICAgICAgICAgICAgJ3BhaXJpbmcnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IFsgJ2JpZHMnLCAnYXNrcycgXTtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBzaWRlcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1tzXTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlclswXSk7XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IHBhcnNlRmxvYXQgKG9yZGVyWzFdKTtcbiAgICAgICAgICAgICAgICByZXN1bHRbc2lkZV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHRpY2tlcnMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldCAoeyAncGFpcmluZyc6IHBbJ2lkJ10gfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSB0aWNrZXJzW3BbJ2lkJ11dO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbG93JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3JkZXJib29rJ11bJ2JpZHMnXVsnaGlnaGJpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29yZGVyYm9vayddWydhc2tzJ11bJ2hpZ2hiaWQnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RfcHJpY2UnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogcGFyc2VGbG9hdCAodGlja2VyWydjaGFuZ2UnXSksXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZV8yNGhvdXJzJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlICh7XG4gICAgICAgICAgICAncGFpcmluZyc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ3BhaXJpbmcnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3JhdGUnOiBwcmljZSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgcGF0aCArICcvJztcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3ByaXZhdGUnKSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaGFzaCAodGhpcy5hcGlLZXkgKyBub25jZSArIHRoaXMuc2VjcmV0LCAnc2hhMjU2Jyk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdzaWduYXR1cmUnOiBzaWduYXR1cmUsXG4gICAgICAgICAgICAgICAgLy8gdHdvZmE6IHRoaXMudHdvZmEsXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGNjZXggPSB7XG5cbiAgICAnaWQnOiAnY2NleCcsXG4gICAgJ25hbWUnOiAnQy1DRVgnLFxuICAgICdjb3VudHJpZXMnOiBbICdERScsICdFVScsIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY0MzMtMTY4ODFmOTAtNWVkOC0xMWU3LTkyZjgtM2Q5MmNjNzQ3YTZjLmpwZycsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAndGlja2Vycyc6ICdodHRwczovL2MtY2V4LmNvbS90JyxcbiAgICAgICAgICAgICdwdWJsaWMnOiAnaHR0cHM6Ly9jLWNleC5jb20vdC9hcGlfcHViLmh0bWwnLFxuICAgICAgICAgICAgJ3ByaXZhdGUnOiAnaHR0cHM6Ly9jLWNleC5jb20vdC9hcGkuaHRtbCcsXG4gICAgICAgIH0sXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9jLWNleC5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vYy1jZXguY29tLz9pZD1hcGknLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3RpY2tlcnMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdjb2lubmFtZXMnLFxuICAgICAgICAgICAgICAgICd7bWFya2V0fScsXG4gICAgICAgICAgICAgICAgJ3BhaXJzJyxcbiAgICAgICAgICAgICAgICAncHJpY2VzJyxcbiAgICAgICAgICAgICAgICAndm9sdW1lX3tjb2lufScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VkaXN0cmlidXRpb24nLFxuICAgICAgICAgICAgICAgICdtYXJrZXRoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnbWFya2V0cycsXG4gICAgICAgICAgICAgICAgJ21hcmtldHN1bW1hcmllcycsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9vaycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHsgICAgICAgICAgICBcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2J1eWxpbWl0JyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnZ2V0YmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2dldGJhbGFuY2VzJywgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2dldG9wZW5vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdnZXRvcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldG9yZGVyaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ215dHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnc2VsbGxpbWl0JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE1hcmtldHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0c1sncmVzdWx0J10ubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3Jlc3VsdCddW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnTWFya2V0TmFtZSddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0WydNYXJrZXRDdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsnQmFzZUN1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0QmFsYW5jZXMgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0T3JkZXJib29rICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiAnYm90aCcsXG4gICAgICAgICAgICAnZGVwdGgnOiAxMDAsXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgb3JkZXJib29rID0gcmVzcG9uc2VbJ3Jlc3VsdCddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IHsgJ2JpZHMnOiAnYnV5JywgJ2Fza3MnOiAnc2VsbCcgfTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAoc2lkZXMpO1xuICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IGtleXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2tdO1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1trZXldO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWydSYXRlJ10pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsnUXVhbnRpdHknXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMudGlja2Vyc0dldE1hcmtldCAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KS50b0xvd2VyQ2FzZSAoKSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsndGlja2VyJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3VwZGF0ZWQnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0cHJpY2UnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXZnJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eXN1cHBvcnQnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0TWFya2V0aGlzdG9yeSAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogJ2JvdGgnLFxuICAgICAgICAgICAgJ2RlcHRoJzogMTAwLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZUdldCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpICsgdHlwZTtcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAncXVhbnRpdHknOiBhbW91bnQsXG4gICAgICAgICAgICAncmF0ZSc6IHByaWNlLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV07XG4gICAgICAgIGlmICh0eXBlID09ICdwcml2YXRlJykge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IHRoaXMua2V5c29ydCAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnYSc6IHBhdGgsXG4gICAgICAgICAgICAgICAgJ2FwaWtleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdhcGlzaWduJzogdGhpcy5obWFjICh1cmwsIHRoaXMuc2VjcmV0LCAnc2hhNTEyJykgfTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ2EnOiAnZ2V0JyArIHBhdGgsXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCArPSAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcykgKyAnLmpzb24nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgY2V4ID0ge1xuXG4gICAgJ2lkJzogJ2NleCcsXG4gICAgJ25hbWUnOiAnQ0VYLklPJyxcbiAgICAnY291bnRyaWVzJzogWyAnR0InLCAnRVUnLCAnQ1knLCAnUlUnLCBdLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NDQyLThkZGMzM2IwLTVlZDgtMTFlNy04Yjk4LWY3ODZhZWYwZjNjOS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vY2V4LmlvL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9jZXguaW8nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vY2V4LmlvL2NleC1hcGknLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2N1cnJlbmN5X2xpbWl0cycsXG4gICAgICAgICAgICAgICAgJ2xhc3RfcHJpY2Uve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnbGFzdF9wcmljZXMve2N1cnJlbmNpZXN9JyxcbiAgICAgICAgICAgICAgICAnb2hsY3YvaGQve3l5eXltbWRkfS97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdvcmRlcl9ib29rL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3RpY2tlci97cGFpcn0nLFxuICAgICAgICAgICAgICAgICd0aWNrZXJzL3tjdXJyZW5jaWVzfScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX2hpc3Rvcnkve3BhaXJ9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnY29udmVydC97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdwcmljZV9zdGF0cy97cGFpcn0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYWN0aXZlX29yZGVyc19zdGF0dXMvJyxcbiAgICAgICAgICAgICAgICAnYXJjaGl2ZWRfb3JkZXJzL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UvJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVyLycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlcnMve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX3JlcGxhY2Vfb3JkZXIve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnY2xvc2VfcG9zaXRpb24ve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnZ2V0X2FkZHJlc3MvJyxcbiAgICAgICAgICAgICAgICAnZ2V0X215ZmVlLycsXG4gICAgICAgICAgICAgICAgJ2dldF9vcmRlci8nLFxuICAgICAgICAgICAgICAgICdnZXRfb3JkZXJfdHgvJyxcbiAgICAgICAgICAgICAgICAnb3Blbl9vcmRlcnMve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnb3Blbl9vcmRlcnMvJyxcbiAgICAgICAgICAgICAgICAnb3Blbl9wb3NpdGlvbi97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdvcGVuX3Bvc2l0aW9ucy97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdwbGFjZV9vcmRlci97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdwbGFjZV9vcmRlci97cGFpcn0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRDdXJyZW5jeUxpbWl0cyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzWydkYXRhJ11bJ3BhaXJzJ10ubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ2RhdGEnXVsncGFpcnMnXVtwXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ3N5bWJvbDEnXSArICcvJyArIHByb2R1Y3RbJ3N5bWJvbDInXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBpZDtcbiAgICAgICAgICAgIGxldCBbIGJhc2UsIHF1b3RlIF0gPSBzeW1ib2wuc3BsaXQgKCcvJyk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0ICB0aGlzLnB1YmxpY0dldE9yZGVyQm9va1BhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IG9yZGVyYm9va1sndGltZXN0YW1wJ10gKiAxMDAwO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBvcmRlcmJvb2tbJ2JpZHMnXSxcbiAgICAgICAgICAgICdhc2tzJzogb3JkZXJib29rWydhc2tzJ10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXJQYWlyICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAodGlja2VyWyd0aW1lc3RhbXAnXSkgKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnY2hhbmdlJ10pLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVIaXN0b3J5UGFpciAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LCAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3JkZXJbJ29yZGVyX3R5cGUnXSA9IHR5cGU7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0UGxhY2VPcmRlclBhaXIgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7ICAgXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnc2lnbmF0dXJlJzogdGhpcy5obWFjIChub25jZSArIHRoaXMudWlkICsgdGhpcy5hcGlLZXksIHRoaXMuc2VjcmV0KS50b1VwcGVyQ2FzZSAoKSxcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHF1ZXJ5KSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBjb2luY2hlY2sgPSB7XG5cbiAgICAnaWQnOiAnY29pbmNoZWNrJyxcbiAgICAnbmFtZSc6ICdjb2luY2hlY2snLFxuICAgICdjb3VudHJpZXMnOiBbICdKUCcsICdJRCcsIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY0NjQtM2I1YzNjNzQtNWVkOS0xMWU3LTg0MGUtMzFiMzI5NjhlMWRhLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9jb2luY2hlY2suY29tL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9jb2luY2hlY2suY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2NvaW5jaGVjay5jb20vZG9jdW1lbnRzL2V4Y2hhbmdlL2FwaScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2Uvb3JkZXJzL3JhdGUnLFxuICAgICAgICAgICAgICAgICdvcmRlcl9ib29rcycsXG4gICAgICAgICAgICAgICAgJ3JhdGUve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdhY2NvdW50cy9iYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMvbGV2ZXJhZ2VfYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2JhbmtfYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0X21vbmV5JyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2Uvb3JkZXJzL29wZW5zJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2Uvb3JkZXJzL3RyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL29yZGVycy90cmFuc2FjdGlvbnNfcGFnaW5hdGlvbicsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL2xldmVyYWdlL3Bvc2l0aW9ucycsXG4gICAgICAgICAgICAgICAgJ2xlbmRpbmcvYm9ycm93cy9tYXRjaGVzJyxcbiAgICAgICAgICAgICAgICAnc2VuZF9tb25leScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3cycsXG4gICAgICAgICAgICBdLCAgICAgICAgICAgIFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbmtfYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0X21vbmV5L3tpZH0vZmFzdCcsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL29yZGVycycsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL3RyYW5zZmVycy90b19sZXZlcmFnZScsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL3RyYW5zZmVycy9mcm9tX2xldmVyYWdlJyxcbiAgICAgICAgICAgICAgICAnbGVuZGluZy9ib3Jyb3dzJyxcbiAgICAgICAgICAgICAgICAnbGVuZGluZy9ib3Jyb3dzL3tpZH0vcmVwYXknLFxuICAgICAgICAgICAgICAgICdzZW5kX21vbmV5JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICdiYW5rX2FjY291bnRzL3tpZH0nLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9vcmRlcnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3cy97aWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvSlBZJzogIHsgJ2lkJzogJ2J0Y19qcHknLCAgJ3N5bWJvbCc6ICdCVEMvSlBZJywgICdiYXNlJzogJ0JUQycsICAncXVvdGUnOiAnSlBZJyB9LCAvLyB0aGUgb25seSByZWFsIHBhaXJcbiAgICAgICAgJ0VUSC9KUFknOiAgeyAnaWQnOiAnZXRoX2pweScsICAnc3ltYm9sJzogJ0VUSC9KUFknLCAgJ2Jhc2UnOiAnRVRIJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdFVEMvSlBZJzogIHsgJ2lkJzogJ2V0Y19qcHknLCAgJ3N5bWJvbCc6ICdFVEMvSlBZJywgICdiYXNlJzogJ0VUQycsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnREFPL0pQWSc6ICB7ICdpZCc6ICdkYW9fanB5JywgICdzeW1ib2wnOiAnREFPL0pQWScsICAnYmFzZSc6ICdEQU8nLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ0xTSy9KUFknOiAgeyAnaWQnOiAnbHNrX2pweScsICAnc3ltYm9sJzogJ0xTSy9KUFknLCAgJ2Jhc2UnOiAnTFNLJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdGQ1QvSlBZJzogIHsgJ2lkJzogJ2ZjdF9qcHknLCAgJ3N5bWJvbCc6ICdGQ1QvSlBZJywgICdiYXNlJzogJ0ZDVCcsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnWE1SL0pQWSc6ICB7ICdpZCc6ICd4bXJfanB5JywgICdzeW1ib2wnOiAnWE1SL0pQWScsICAnYmFzZSc6ICdYTVInLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ1JFUC9KUFknOiAgeyAnaWQnOiAncmVwX2pweScsICAnc3ltYm9sJzogJ1JFUC9KUFknLCAgJ2Jhc2UnOiAnUkVQJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdYUlAvSlBZJzogIHsgJ2lkJzogJ3hycF9qcHknLCAgJ3N5bWJvbCc6ICdYUlAvSlBZJywgICdiYXNlJzogJ1hSUCcsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnWkVDL0pQWSc6ICB7ICdpZCc6ICd6ZWNfanB5JywgICdzeW1ib2wnOiAnWkVDL0pQWScsICAnYmFzZSc6ICdaRUMnLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ1hFTS9KUFknOiAgeyAnaWQnOiAneGVtX2pweScsICAnc3ltYm9sJzogJ1hFTS9KUFknLCAgJ2Jhc2UnOiAnWEVNJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdMVEMvSlBZJzogIHsgJ2lkJzogJ2x0Y19qcHknLCAgJ3N5bWJvbCc6ICdMVEMvSlBZJywgICdiYXNlJzogJ0xUQycsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnREFTSC9KUFknOiB7ICdpZCc6ICdkYXNoX2pweScsICdzeW1ib2wnOiAnREFTSC9KUFknLCAnYmFzZSc6ICdEQVNIJywgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ0VUSC9CVEMnOiAgeyAnaWQnOiAnZXRoX2J0YycsICAnc3ltYm9sJzogJ0VUSC9CVEMnLCAgJ2Jhc2UnOiAnRVRIJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdFVEMvQlRDJzogIHsgJ2lkJzogJ2V0Y19idGMnLCAgJ3N5bWJvbCc6ICdFVEMvQlRDJywgICdiYXNlJzogJ0VUQycsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnTFNLL0JUQyc6ICB7ICdpZCc6ICdsc2tfYnRjJywgICdzeW1ib2wnOiAnTFNLL0JUQycsICAnYmFzZSc6ICdMU0snLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0ZDVC9CVEMnOiAgeyAnaWQnOiAnZmN0X2J0YycsICAnc3ltYm9sJzogJ0ZDVC9CVEMnLCAgJ2Jhc2UnOiAnRkNUJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdYTVIvQlRDJzogIHsgJ2lkJzogJ3htcl9idGMnLCAgJ3N5bWJvbCc6ICdYTVIvQlRDJywgICdiYXNlJzogJ1hNUicsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnUkVQL0JUQyc6ICB7ICdpZCc6ICdyZXBfYnRjJywgICdzeW1ib2wnOiAnUkVQL0JUQycsICAnYmFzZSc6ICdSRVAnLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ1hSUC9CVEMnOiAgeyAnaWQnOiAneHJwX2J0YycsICAnc3ltYm9sJzogJ1hSUC9CVEMnLCAgJ2Jhc2UnOiAnWFJQJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdaRUMvQlRDJzogIHsgJ2lkJzogJ3plY19idGMnLCAgJ3N5bWJvbCc6ICdaRUMvQlRDJywgICdiYXNlJzogJ1pFQycsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnWEVNL0JUQyc6ICB7ICdpZCc6ICd4ZW1fYnRjJywgICdzeW1ib2wnOiAnWEVNL0JUQycsICAnYmFzZSc6ICdYRU0nLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0xUQy9CVEMnOiAgeyAnaWQnOiAnbHRjX2J0YycsICAnc3ltYm9sJzogJ0xUQy9CVEMnLCAgJ2Jhc2UnOiAnTFRDJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdEQVNIL0JUQyc6IHsgJ2lkJzogJ2Rhc2hfYnRjJywgJ3N5bWJvbCc6ICdEQVNIL0JUQycsICdiYXNlJzogJ0RBU0gnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0QWNjb3VudHNCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgIHRoaXMucHVibGljR2V0T3JkZXJCb29rcyAoKTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbMF0pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsxXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKCk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3RpbWVzdGFtcCddICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXMgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgcHJlZml4ID0gJyc7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0Jykge1xuICAgICAgICAgICAgbGV0IG9yZGVyX3R5cGUgPSB0eXBlICsgJ18nICsgc2lkZTtcbiAgICAgICAgICAgIG9yZGVyWydvcmRlcl90eXBlJ10gPSBvcmRlcl90eXBlO1xuICAgICAgICAgICAgbGV0IHByZWZpeCA9IChzaWRlID09IGJ1eSkgPyAob3JkZXJfdHlwZSArICdfJykgOiAnJztcbiAgICAgICAgICAgIG9yZGVyW3ByZWZpeCArICdhbW91bnQnXSA9IGFtb3VudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9yZGVyWydvcmRlcl90eXBlJ10gPSBzaWRlO1xuICAgICAgICAgICAgb3JkZXJbJ3JhdGUnXSA9IHByaWNlO1xuICAgICAgICAgICAgb3JkZXJbJ2Ftb3VudCddID0gYW1vdW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0RXhjaGFuZ2VPcmRlcnMgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5rZXlzb3J0IChxdWVyeSkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0FDQ0VTUy1LRVknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnQUNDRVNTLU5PTkNFJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ0FDQ0VTUy1TSUdOQVRVUkUnOiB0aGlzLmhtYWMgKG5vbmNlICsgdXJsICsgKGJvZHkgfHwgJycpLCB0aGlzLnNlY3JldClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBjb2lubWF0ZSA9IHtcbiAgICBcbiAgICAnaWQnOiAnY29pbm1hdGUnLFxuICAgICduYW1lJzogJ0NvaW5NYXRlJyxcbiAgICAnY291bnRyaWVzJzogWyAnR0InLCAnQ1onIF0sIC8vIFVLLCBDemVjaCBSZXB1YmxpY1xuICAgICdyYXRlTGltaXQnOiAxMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3ODExMjI5LWMxZWZiNTEwLTYwNmMtMTFlNy05YTM2LTg0YmEyY2U0MTJkOC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vY29pbm1hdGUuaW8vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2NvaW5tYXRlLmlvJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL2NvaW5tYXRlLmlvL2RldmVsb3BlcnMnLFxuICAgICAgICAgICAgJ2h0dHA6Ly9kb2NzLmNvaW5tYXRlLmFwaWFyeS5pby8jcmVmZXJlbmNlJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdvcmRlckJvb2snLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdiaXRjb2luV2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ2JpdGNvaW5EZXBvc2l0QWRkcmVzc2VzJyxcbiAgICAgICAgICAgICAgICAnYnV5SW5zdGFudCcsXG4gICAgICAgICAgICAgICAgJ2J1eUxpbWl0JyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsT3JkZXInLFxuICAgICAgICAgICAgICAgICdjYW5jZWxPcmRlcldpdGhJbmZvJyxcbiAgICAgICAgICAgICAgICAnY3JlYXRlVm91Y2hlcicsXG4gICAgICAgICAgICAgICAgJ29wZW5PcmRlcnMnLFxuICAgICAgICAgICAgICAgICdyZWRlZW1Wb3VjaGVyJyxcbiAgICAgICAgICAgICAgICAnc2VsbEluc3RhbnQnLFxuICAgICAgICAgICAgICAgICdzZWxsTGltaXQnLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbkhpc3RvcnknLFxuICAgICAgICAgICAgICAgICd1bmNvbmZpcm1lZEJpdGNvaW5EZXBvc2l0cycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ0JUQ19FVVInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJyAgfSxcbiAgICAgICAgJ0JUQy9DWksnOiB7ICdpZCc6ICdCVENfQ1pLJywgJ3N5bWJvbCc6ICdCVEMvQ1pLJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NaSycgIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZXMgKCk7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyQm9vayAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5UGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdncm91cEJ5UHJpY2VMaW1pdCc6ICdGYWxzZScsXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgb3JkZXJib29rID0gcmVzcG9uc2VbJ2RhdGEnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IG9yZGVyYm9va1sndGltZXN0YW1wJ10gKiAxMDAwO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gb3JkZXJbJ3ByaWNlJ107XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IG9yZGVyWydhbW91bnQnXTtcbiAgICAgICAgICAgICAgICByZXN1bHRbc2lkZV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5UGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsnZGF0YSddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd0aW1lc3RhbXAnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydhbW91bnQnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhbnNhY3Rpb25zICh7XG4gICAgICAgICAgICAnY3VycmVuY3lQYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ21pbnV0ZXNJbnRvSGlzdG9yeSc6IDEwLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVBvc3QnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKTtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2N1cnJlbmN5UGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHtcbiAgICAgICAgICAgIGlmIChzaWRlID09ICdidXknKVxuICAgICAgICAgICAgICAgIG9yZGVyWyd0b3RhbCddID0gYW1vdW50OyAvLyBhbW91bnQgaW4gZmlhdFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9yZGVyWydhbW91bnQnXSA9IGFtb3VudDsgLy8gYW1vdW50IGluIGZpYXRcbiAgICAgICAgICAgIG1ldGhvZCArPSAnSW5zdGFudCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcmRlclsnYW1vdW50J10gPSBhbW91bnQ7IC8vIGFtb3VudCBpbiBjcnlwdG9cbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgICAgICBtZXRob2QgKz0gdGhpcy5jYXBpdGFsaXplICh0eXBlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdIChzZWxmLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHBhdGg7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBsZXQgYXV0aCA9IFsgbm9uY2UsIHRoaXMudWlkLCB0aGlzLmFwaUtleSBdLmpvaW4gKCcgJyk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5obWFjIChhdXRoLCB0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ2NsaWVudElkJzogdGhpcy51aWQsXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ3B1YmxpY0tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdzaWduYXR1cmUnOiBzaWduYXR1cmUudG9VcHBlckNhc2UgKCksXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBjb2luc2VjdXJlID0ge1xuXG4gICAgJ2lkJzogJ2NvaW5zZWN1cmUnLFxuICAgICduYW1lJzogJ0NvaW5zZWN1cmUnLFxuICAgICdjb3VudHJpZXMnOiAnSU4nLCAvLyBJbmRpYVxuICAgICdyYXRlTGltaXQnOiAxMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjQ3Mi05Y2JkMjAwYS01ZWQ5LTExZTctOTU1MS0yMjY3YWQ3YmFjMDguanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5jb2luc2VjdXJlLmluJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2NvaW5zZWN1cmUuaW4nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vYXBpLmNvaW5zZWN1cmUuaW4nLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9jb2luc2VjdXJlL3BsdWdpbnMnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JpdGNvaW4vc2VhcmNoL2NvbmZpcm1hdGlvbi97dHhpZH0nLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9hc2svbG93JyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvYXNrL29yZGVycycsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL2JpZC9oaWdoJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvYmlkL29yZGVycycsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL2xhc3RUcmFkZScsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL21heDI0SHInLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9taW4yNEhyJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvdGlja2VyJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvdHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnbWZhL2F1dGh5L2NhbGwnLFxuICAgICAgICAgICAgICAgICdtZmEvYXV0aHkvc21zJywgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnbmV0a2kvc2VhcmNoL3tuZXRraU5hbWV9JyxcbiAgICAgICAgICAgICAgICAndXNlci9iYW5rL290cC97bnVtYmVyfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIva3ljL290cC97bnVtYmVyfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcHJvZmlsZS9waG9uZS9vdHAve251bWJlcn0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL2FkZHJlc3Mve2lkfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vZGVwb3NpdC9jb25maXJtZWQvYWxsJyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi9kZXBvc2l0L2NvbmZpcm1lZC97aWR9JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi9kZXBvc2l0L3VuY29uZmlybWVkL2FsbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vZGVwb3NpdC91bmNvbmZpcm1lZC97aWR9JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi93YWxsZXRzJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9iYWxhbmNlL2F2YWlsYWJsZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2JhbGFuY2UvcGVuZGluZycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2JhbGFuY2UvdG90YWwnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9kZXBvc2l0L2NhbmNlbGxlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2RlcG9zaXQvdW52ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2RlcG9zaXQvdmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC93aXRoZHJhdy9jYW5jZWxsZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC93aXRoZHJhdy9jb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC93aXRoZHJhdy91bnZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvdmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2Fzay9jYW5jZWxsZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2Fzay9jb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2Fzay9wZW5kaW5nJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iaWQvY2FuY2VsbGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iaWQvY29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iaWQvcGVuZGluZycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL2FkZHJlc3NlcycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL2JhbGFuY2UvYXZhaWxhYmxlJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vYmFsYW5jZS9wZW5kaW5nJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vYmFsYW5jZS90b3RhbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL2RlcG9zaXQvY2FuY2VsbGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vZGVwb3NpdC91bnZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vZGVwb3NpdC92ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL3dpdGhkcmF3L2NhbmNlbGxlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL3dpdGhkcmF3L2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL3dpdGhkcmF3L3VudmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy92ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9zdW1tYXJ5JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9jb2luL2ZlZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvZmlhdC9mZWUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2t5Y3MnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL3JlZmVycmFsL2NvaW4vcGFpZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvcmVmZXJyYWwvY29pbi9zdWNjZXNzZnVsJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9yZWZlcnJhbC9maWF0L3BhaWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL3JlZmVycmFscycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvdHJhZGUvc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbG9naW4vdG9rZW4ve3Rva2VufScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L3N1bW1hcnknLFxuICAgICAgICAgICAgICAgICd3YWxsZXQvY29pbi93aXRoZHJhdy9jYW5jZWxsZWQnLFxuICAgICAgICAgICAgICAgICd3YWxsZXQvY29pbi93aXRoZHJhdy9jb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgICd3YWxsZXQvY29pbi93aXRoZHJhdy91bnZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0L2NvaW4vd2l0aGRyYXcvdmVyaWZpZWQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdsb2dpbicsXG4gICAgICAgICAgICAgICAgJ2xvZ2luL2luaXRpYXRlJyxcbiAgICAgICAgICAgICAgICAnbG9naW4vcGFzc3dvcmQvZm9yZ290JyxcbiAgICAgICAgICAgICAgICAnbWZhL2F1dGh5L2luaXRpYXRlJyxcbiAgICAgICAgICAgICAgICAnbWZhL2dhL2luaXRpYXRlJyxcbiAgICAgICAgICAgICAgICAnc2lnbnVwJyxcbiAgICAgICAgICAgICAgICAndXNlci9uZXRraS91cGRhdGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL3Byb2ZpbGUvaW1hZ2UvdXBkYXRlJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vd2l0aGRyYXcvaW5pdGlhdGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy9uZXdWZXJpZnljb2RlJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvaW5pdGlhdGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC93aXRoZHJhdy9uZXdWZXJpZnljb2RlJyxcbiAgICAgICAgICAgICAgICAndXNlci9wYXNzd29yZC9jaGFuZ2UnLFxuICAgICAgICAgICAgICAgICd1c2VyL3Bhc3N3b3JkL3Jlc2V0JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi93aXRoZHJhdy9pbml0aWF0ZScsXG4gICAgICAgICAgICAgICAgJ3dhbGxldC9jb2luL3dpdGhkcmF3L25ld1ZlcmlmeWNvZGUnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwdXQnOiBbXG4gICAgICAgICAgICAgICAgJ3NpZ251cC92ZXJpZnkve3Rva2VufScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2Uva3ljJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvZGVwb3NpdC9uZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2Fzay9uZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JpZC9uZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2luc3RhbnQvYnV5JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9pbnN0YW50L3NlbGwnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy92ZXJpZnknLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9hY2NvdW50L25ldycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L3dpdGhkcmF3L3ZlcmlmeScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbWZhL2F1dGh5L2luaXRpYXRlL2VuYWJsZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbWZhL2dhL2luaXRpYXRlL2VuYWJsZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbmV0a2kvY3JlYXRlJyxcbiAgICAgICAgICAgICAgICAndXNlci9wcm9maWxlL3Bob25lL25ldycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vYWRkcmVzcy9uZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL25ldycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vd2l0aGRyYXcvc2VuZFRvRXhjaGFuZ2UnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL3dpdGhkcmF3L3ZlcmlmeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlbGV0ZSc6IFtcbiAgICAgICAgICAgICAgICAndXNlci9nY20ve2NvZGV9JyxcbiAgICAgICAgICAgICAgICAndXNlci9sb2dvdXQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy91bnZlcmlmaWVkL2NhbmNlbC97d2l0aGRyYXdJRH0nLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9kZXBvc2l0L2NhbmNlbC97ZGVwb3NpdElEfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYXNrL2NhbmNlbC97b3JkZXJJRH0nLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JpZC9jYW5jZWwve29yZGVySUR9JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvdW52ZXJpZmllZC9jYW5jZWwve3dpdGhkcmF3SUR9JyxcbiAgICAgICAgICAgICAgICAndXNlci9tZmEvYXV0aHkvZGlzYWJsZS97Y29kZX0nLFxuICAgICAgICAgICAgICAgICd1c2VyL21mYS9nYS9kaXNhYmxlL3tjb2RlfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcHJvZmlsZS9waG9uZS9kZWxldGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL3Byb2ZpbGUvaW1hZ2UvZGVsZXRlL3tuZXRraU5hbWV9JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi93aXRoZHJhdy91bnZlcmlmaWVkL2NhbmNlbC97d2l0aGRyYXdJRH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9JTlInOiB7ICdpZCc6ICdCVEMvSU5SJywgJ3N5bWJvbCc6ICdCVEMvSU5SJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0lOUicgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldFVzZXJFeGNoYW5nZUJhbmtTdW1tYXJ5ICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkgeyBcbiAgICAgICAgbGV0IGJpZHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEV4Y2hhbmdlQmlkT3JkZXJzICgpO1xuICAgICAgICBsZXQgYXNrcyA9IGF3YWl0IHRoaXMucHVibGljR2V0RXhjaGFuZ2VBc2tPcmRlcnMgKCk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IGJpZHNbJ21lc3NhZ2UnXSxcbiAgICAgICAgICAgICdhc2tzJzogYXNrc1snbWVzc2FnZSddLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IFsgJ2JpZHMnLCAnYXNrcycgXTtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBzaWRlcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1tzXTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBvcmRlclsncmF0ZSddO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBvcmRlclsndm9sJ107XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEV4Y2hhbmdlVGlja2VyICgpO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ21lc3NhZ2UnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndGltZXN0YW1wJ107XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RQcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2NvaW52b2x1bWUnXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2ZpYXR2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RXhjaGFuZ2VUcmFkZXMgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQdXRVc2VyRXhjaGFuZ2UnO1xuICAgICAgICBsZXQgb3JkZXIgPSB7fTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHsgICAgICAgXG4gICAgICAgICAgICBtZXRob2QgKz0gJ0luc3RhbnQnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKTtcbiAgICAgICAgICAgIGlmIChzaWRlID09ICdidXknKVxuICAgICAgICAgICAgICAgIG9yZGVyWydtYXhGaWF0J10gPSBhbW91bnQ7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb3JkZXJbJ21heFZvbCddID0gYW1vdW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGRpcmVjdGlvbiA9IChzaWRlID09ICdidXknKSA/ICdCaWQnIDogJ0Fzayc7XG4gICAgICAgICAgICBtZXRob2QgKz0gZGlyZWN0aW9uICsgJ05ldyc7XG4gICAgICAgICAgICBvcmRlclsncmF0ZSddID0gcHJpY2U7XG4gICAgICAgICAgICBvcmRlclsndm9sJ10gPSBhbW91bnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAoc2VsZi5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3ByaXZhdGUnKSB7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnQXV0aG9yaXphdGlvbic6IHRoaXMuYXBpS2V5IH07XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHF1ZXJ5KTtcbiAgICAgICAgICAgICAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGV4bW8gPSB7XG5cbiAgICAnaWQnOiAnZXhtbycsXG4gICAgJ25hbWUnOiAnRVhNTycsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0VTJywgJ1JVJywgXSwgLy8gU3BhaW4sIFJ1c3NpYVxuICAgICdyYXRlTGltaXQnOiAxMDAwLCAvLyBvbmNlIGV2ZXJ5IDM1MCBtcyDiiYggMTgwIHJlcXVlc3RzIHBlciBtaW51dGUg4omIIDMgcmVxdWVzdHMgcGVyIHNlY29uZFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjQ5MS0xYjBlYTk1Ni01ZWRhLTExZTctOTIyNS00MGQ2N2I0ODFiOGQuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5leG1vLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9leG1vLm1lJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL2V4bW8ubWUvcnUvYXBpX2RvYycsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL2V4bW8tZGV2L2V4bW9fYXBpX2xpYi90cmVlL21hc3Rlci9ub2RlanMnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2N1cnJlbmN5JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfYm9vaycsXG4gICAgICAgICAgICAgICAgJ3BhaXJfc2V0dGluZ3MnLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAndXNlcl9pbmZvJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfY3JlYXRlJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAndXNlcl9vcGVuX29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3VzZXJfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAndXNlcl9jYW5jZWxsZWRfb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAncmVxdWlyZWRfYW1vdW50JyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdF9hZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdfY3J5cHQnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd19nZXRfdHhpZCcsXG4gICAgICAgICAgICAgICAgJ2V4Y29kZV9jcmVhdGUnLFxuICAgICAgICAgICAgICAgICdleGNvZGVfbG9hZCcsXG4gICAgICAgICAgICAgICAgJ3dhbGxldF9oaXN0b3J5JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFBhaXJTZXR0aW5ncyAoKTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAocHJvZHVjdHMpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwga2V5cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IGlkID0ga2V5c1twXTtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbaWRdO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGlkLnJlcGxhY2UgKCdfJywgJy8nKTtcbiAgICAgICAgICAgIGxldCBbIGJhc2UsIHF1b3RlIF0gPSBzeW1ib2wuc3BsaXQgKCcvJyk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VXNlckluZm8gKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRPcmRlckJvb2sgKHtcbiAgICAgICAgICAgICdwYWlyJzogcFsnaWQnXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSByZXNwb25zZVtwWydpZCddXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSB7ICdiaWRzJzogJ2JpZCcsICdhc2tzJzogJ2FzaycgfTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAoc2lkZXMpO1xuICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IGtleXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2tdO1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1trZXldO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWzBdKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbMV0pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoKTtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbcFsnaWQnXV07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3VwZGF0ZWQnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXlfcHJpY2UnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsX3ByaWNlJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0X3RyYWRlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2F2ZyddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbF9jdXJyJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IHByZWZpeCA9ICcnO1xuICAgICAgICBpZiAodHlwZSA9PSdtYXJrZXQnKVxuICAgICAgICAgICAgcHJlZml4ID0gJ21hcmtldF8nO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdxdWFudGl0eSc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlIHx8IDAsXG4gICAgICAgICAgICAndHlwZSc6IHByZWZpeCArIHNpZGUsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXJDcmVhdGUgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHsgJ25vbmNlJzogbm9uY2UgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAnS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1NpZ24nOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgZnliID0ge1xuXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcmRldGFpbGVkJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ3Rlc3QnLFxuICAgICAgICAgICAgICAgICdnZXRhY2NpbmZvJyxcbiAgICAgICAgICAgICAgICAnZ2V0cGVuZGluZ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ2dldG9yZGVyaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbHBlbmRpbmdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3BsYWNlb3JkZXInLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEdldGFjY2luZm8gKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyYm9vayAoKTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbMF0pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsxXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXJkZXRhaWxlZCAoKTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xvdyc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXMgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFBsYWNlb3JkZXIgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAncXR5JzogYW1vdW50LFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UsXG4gICAgICAgICAgICAndHlwZSc6IHNpZGVbMF0udG9VcHBlckNhc2UgKClcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHsgICAgICAgICAgIFxuICAgICAgICAgICAgdXJsICs9ICcuanNvbic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoeyAndGltZXN0YW1wJzogbm9uY2UgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ3NpZyc6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGExJylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBmeWJzZSA9IGV4dGVuZCAoZnliLCB7XG4gICAgJ2lkJzogJ2Z5YnNlJyxcbiAgICAnbmFtZSc6ICdGWUItU0UnLFxuICAgICdjb3VudHJpZXMnOiAnU0UnLCAvLyBTd2VkZW5cbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjUxMi0zMTAxOTc3Mi01ZWRiLTExZTctODI0MS0yZTY3NWU2Nzk3ZjEuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5meWJzZS5zZS9hcGkvU0VLJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5meWJzZS5zZScsXG4gICAgICAgICdkb2MnOiAnaHR0cDovL2RvY3MuZnliLmFwaWFyeS5pbycsXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvU0VLJzogeyAnaWQnOiAnU0VLJywgJ3N5bWJvbCc6ICdCVEMvU0VLJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1NFSycgfSxcbiAgICB9LFxufSlcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgZnlic2cgPSBleHRlbmQgKGZ5Yiwge1xuICAgICdpZCc6ICdmeWJzZycsXG4gICAgJ25hbWUnOiAnRllCLVNHJyxcbiAgICAnY291bnRyaWVzJzogJ1NHJywgLy8gU2luZ2Fwb3JlXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY1MTMtMzM2NGQ1NmEtNWVkYi0xMWU3LTllNmItZDU4OThiYjg5YzgxLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly93d3cuZnlic2cuY29tL2FwaS9TR0QnLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmZ5YnNnLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cDovL2RvY3MuZnliLmFwaWFyeS5pbycsXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvU0dEJzogeyAnaWQnOiAnU0dEJywgJ3N5bWJvbCc6ICdCVEMvU0dEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1NHRCcgfSxcbiAgICB9LFxufSlcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgZ2RheCA9IHtcbiAgICAnaWQnOiAnZ2RheCcsXG4gICAgJ25hbWUnOiAnR0RBWCcsXG4gICAgJ2NvdW50cmllcyc6ICdVUycsXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY1MjctYjFiZTQxYzYtNWVkYi0xMWU3LTk1ZjYtNWI0OTZjNDY5ZTJjLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkuZ2RheC5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmdkYXguY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2RvY3MuZ2RheC5jb20nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2N1cnJlbmNpZXMnLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cycsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzL3tpZH0vYm9vaycsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzL3tpZH0vY2FuZGxlcycsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzL3tpZH0vc3RhdHMnLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cy97aWR9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzL3tpZH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAndGltZScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMve2lkfScsXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL3tpZH0vaG9sZHMnLFxuICAgICAgICAgICAgICAgICdhY2NvdW50cy97aWR9L2xlZGdlcicsXG4gICAgICAgICAgICAgICAgJ2NvaW5iYXNlLWFjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnZmlsbHMnLFxuICAgICAgICAgICAgICAgICdmdW5kaW5nJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3tpZH0nLFxuICAgICAgICAgICAgICAgICdwYXltZW50LW1ldGhvZHMnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgJ3JlcG9ydHMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3VzZXJzL3NlbGYvdHJhaWxpbmctdm9sdW1lJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnZGVwb3NpdHMvY29pbmJhc2UtYWNjb3VudCcsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRzL3BheW1lbnQtbWV0aG9kJyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZy9yZXBheScsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL2Nsb3NlJyxcbiAgICAgICAgICAgICAgICAncHJvZmlsZXMvbWFyZ2luLXRyYW5zZmVyJyxcbiAgICAgICAgICAgICAgICAncmVwb3J0cycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzL2NvaW5iYXNlJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMvY3J5cHRvJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMvcGF5bWVudC1tZXRob2QnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ29yZGVycy97aWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFByb2R1Y3RzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydpZCddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0WydiYXNlX2N1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydxdW90ZV9jdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTsgICAgICAgICAgICBcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEFjY291bnRzICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQcm9kdWN0c0lkQm9vayAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbMF0pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsxXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFByb2R1Y3RzSWRUaWNrZXIgKHtcbiAgICAgICAgICAgICdpZCc6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgcXVvdGUgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFByb2R1Y3RzSWRTdGF0cyAoe1xuICAgICAgICAgICAgJ2lkJzogcFsnaWQnXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLnBhcnNlODYwMSAodGlja2VyWyd0aW1lJ10pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAocXVvdGVbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAocXVvdGVbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0IChxdW90ZVsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAocXVvdGVbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0UHJvZHVjdHNJZFRyYWRlcyAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLCAvLyBmaXhlcyBpc3N1ZSAjMlxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdjbGllbnRfb2lkJzogdGhpcy5ub25jZSAoKSxcbiAgICAgICAgICAgICdwcm9kdWN0X2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3NpemUnOiBhbW91bnQsXG4gICAgICAgICAgICAndHlwZSc6IHR5cGUsICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgcmVxdWVzdCA9ICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyByZXF1ZXN0O1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgbGV0IHdoYXQgPSBub25jZSArIG1ldGhvZCArIHJlcXVlc3QgKyAoYm9keSB8fCAnJyk7XG4gICAgICAgICAgICBsZXQgc2VjcmV0ID0gdGhpcy5iYXNlNjRUb0JpbmFyeSAodGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaGFzaCAod2hhdCwgc2VjcmV0LCAnc2hhMjU2JywgJ2JpbmFyeScpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ0ItQUNDRVNTLUtFWSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdDQi1BQ0NFU1MtU0lHTic6IHRoaXMuc3RyaW5nVG9CYXNlNjQgKHNpZ25hdHVyZSksXG4gICAgICAgICAgICAgICAgJ0NCLUFDQ0VTUy1USU1FU1RBTVAnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnQ0ItQUNDRVNTLVBBU1NQSFJBU0UnOiB0aGlzLnBhc3N3b3JkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRCRCBSRVFVSVJFUyAyRkEgVklBIEFVVEhZLCBBIEJBTksgQUNDT1VOVCwgSURFTlRJVFkgVkVSSUZJQ0FUSU9OIFRPIFNUQVJUXG5cbnZhciBnZW1pbmkgPSB7XG4gICAgJ2lkJzogJ2dlbWluaScsXG4gICAgJ25hbWUnOiAnR2VtaW5pJyxcbiAgICAnY291bnRyaWVzJzogJ1VTJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCwgLy8gMjAwIGZvciBwcml2YXRlIEFQSVxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzgxNjg1Ny1jZTdiZTY0NC02MDk2LTExZTctODJkNi0zYzI1NzI2MzIyOWMuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5nZW1pbmkuY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2dlbWluaS5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vZG9jcy5nZW1pbmkuY29tL3Jlc3QtYXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdzeW1ib2xzJyxcbiAgICAgICAgICAgICAgICAncHVidGlja2VyL3tzeW1ib2x9JyxcbiAgICAgICAgICAgICAgICAnYm9vay97c3ltYm9sfScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97c3ltYm9sfScsXG4gICAgICAgICAgICAgICAgJ2F1Y3Rpb24ve3N5bWJvbH0nLFxuICAgICAgICAgICAgICAgICdhdWN0aW9uL3tzeW1ib2x9L2hpc3RvcnknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXIvbmV3JyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY2FuY2VsL3Nlc3Npb24nLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwvYWxsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvc3RhdHVzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnbXl0cmFkZXMnLFxuICAgICAgICAgICAgICAgICd0cmFkZXZvbHVtZScsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdC97Y3VycmVuY3l9L25ld0FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdy97Y3VycmVuY3l9JyxcbiAgICAgICAgICAgICAgICAnaGVhcnRiZWF0JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFN5bWJvbHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1twXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3Q7XG4gICAgICAgICAgICBsZXQgdXBwZXJjYXNlUHJvZHVjdCA9IHByb2R1Y3QudG9VcHBlckNhc2UgKCk7XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHVwcGVyY2FzZVByb2R1Y3Quc2xpY2UgKDAsIDMpO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gdXBwZXJjYXNlUHJvZHVjdC5zbGljZSAoMywgNik7XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRCb29rU3ltYm9sICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbJ3ByaWNlJ10pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsnYW1vdW50J10pO1xuICAgICAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAob3JkZXJbJ3RpbWVzdGFtcCddKSAqIDEwMDA7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCwgdGltZXN0YW1wIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0UHVidGlja2VyU3ltYm9sICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogcFsnaWQnXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3ZvbHVtZSddWyd0aW1lc3RhbXAnXTtcbiAgICAgICAgbGV0IGJhc2VWb2x1bWUgPSBwWydiYXNlJ107XG4gICAgICAgIGxldCBxdW90ZVZvbHVtZSA9IHBbJ3F1b3RlJ107XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbG93JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ11bYmFzZVZvbHVtZV0pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXVtxdW90ZVZvbHVtZV0pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlc1N5bWJvbCAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZXMgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0JylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAodGhpcy5pZCArICcgYWxsb3dzIGxpbWl0IG9yZGVycyBvbmx5Jyk7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdjbGllbnRfb3JkZXJfaWQnOiB0aGlzLm5vbmNlICgpLFxuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQudG9TdHJpbmcgKCksXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZS50b1N0cmluZyAoKSxcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICd0eXBlJzogJ2V4Y2hhbmdlIGxpbWl0JywgLy8gZ2VtaW5pIGFsbG93cyBsaW1pdCBvcmRlcnMgb25seVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyTmV3ICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdyZXF1ZXN0JzogdXJsLFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcXVlcnkpO1xuICAgICAgICAgICAgbGV0IHBheWxvYWQgPSB0aGlzLnN0cmluZ1RvQmFzZTY0IChKU09OLnN0cmluZ2lmeSAocmVxdWVzdCkpO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaG1hYyAocGF5bG9hZCwgdGhpcy5zZWNyZXQsICdzaGEzODQnKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L3BsYWluJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiAwLFxuICAgICAgICAgICAgICAgICdYLUdFTUlOSS1BUElLRVknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnWC1HRU1JTkktUEFZTE9BRCc6IHBheWxvYWQsXG4gICAgICAgICAgICAgICAgJ1gtR0VNSU5JLVNJR05BVFVSRSc6IHNpZ25hdHVyZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHVybDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBoaXRidGMgPSB7XG5cbiAgICAnaWQnOiAnaGl0YnRjJyxcbiAgICAnbmFtZSc6ICdIaXRCVEMnLFxuICAgICdjb3VudHJpZXMnOiAnSEsnLCAvLyBIb25nIEtvbmdcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndmVyc2lvbic6ICcxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjU1NS04ZWFlYzIwZS01ZWRjLTExZTctOWM1Yi02ZGM2OWZjNDJmNWUuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwOi8vYXBpLmhpdGJ0Yy5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vaGl0YnRjLmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9oaXRidGMuY29tL2FwaScsXG4gICAgICAgICAgICAnaHR0cDovL2hpdGJ0Yy1jb20uZ2l0aHViLmlvL2hpdGJ0Yy1hcGknLFxuICAgICAgICAgICAgJ2h0dHA6Ly9qc2ZpZGRsZS5uZXQvYm1rbmlnaHQvUnFiWUInLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3tzeW1ib2x9L29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ3tzeW1ib2x9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3tzeW1ib2x9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3tzeW1ib2x9L3RyYWRlcy9yZWNlbnQnLFxuICAgICAgICAgICAgICAgICdzeW1ib2xzJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndGltZSwnXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAndHJhZGluZyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3JlY2VudCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzL2J5L29yZGVyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnbmV3X29yZGVyJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVyJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVycycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncGF5bWVudCc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdhZGRyZXNzL3tjdXJyZW5jeX0nLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMve3RyYW5zYWN0aW9ufScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyX3RvX3RyYWRpbmcnLFxuICAgICAgICAgICAgICAgICd0cmFuc2Zlcl90b19tYWluJyxcbiAgICAgICAgICAgICAgICAnYWRkcmVzcy97Y3VycmVuY3l9JyxcbiAgICAgICAgICAgICAgICAncGF5b3V0JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0U3ltYm9scyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzWydzeW1ib2xzJ10ubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3N5bWJvbHMnXVtwXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ3N5bWJvbCddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0Wydjb21tb2RpdHknXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ2N1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFkaW5nR2V0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0U3ltYm9sT3JkZXJib29rICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbMF0pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsxXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRTeW1ib2xUaWNrZXIgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd0aW1lc3RhbXAnXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lX3F1b3RlJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFN5bWJvbFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnY2xpZW50T3JkZXJJZCc6IHRoaXMubm9uY2UgKCksXG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3F1YW50aXR5JzogYW1vdW50LFxuICAgICAgICAgICAgJ3R5cGUnOiB0eXBlLCAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhZGluZ1Bvc3ROZXdPcmRlciAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9ICcvYXBpLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0eXBlICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgcXVlcnkgPSB0aGlzLmV4dGVuZCAoeyAnbm9uY2UnOiBub25jZSwgJ2FwaWtleSc6IHRoaXMuYXBpS2V5IH0sIHF1ZXJ5KTtcbiAgICAgICAgICAgIGlmIChtZXRob2QgPT0gJ1BPU1QnKVxuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnWC1TaWduYXR1cmUnOiB0aGlzLmhtYWMgKHVybCArIChib2R5IHx8ICcnKSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKS50b0xvd2VyQ2FzZSAoKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHVybDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBodW9iaSA9IHtcblxuICAgICdpZCc6ICdodW9iaScsXG4gICAgJ25hbWUnOiAnSHVvYmknLFxuICAgICdjb3VudHJpZXMnOiAnQ04nLFxuICAgICdyYXRlTGltaXQnOiA1MDAwLFxuICAgICd2ZXJzaW9uJzogJ3YzJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjU2OS0xNWFhN2I5YS01ZWRkLTExZTctOWU3Zi00NDc5MWY0ZWU0OWMuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwOi8vYXBpLmh1b2JpLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuaHVvYmkuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2dpdGh1Yi5jb20vaHVvYmlhcGkvQVBJX0RvY3NfZW4vd2lraScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAnc3RhdGljbWFya2V0Jzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAne2lkfV9rbGluZV97cGVyaW9kfScsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcl97aWR9JyxcbiAgICAgICAgICAgICAgICAnZGVwdGhfe2lkfScsXG4gICAgICAgICAgICAgICAgJ2RlcHRoX3tpZH1fe2xlbmd0aH0nLFxuICAgICAgICAgICAgICAgICdkZXRhaWxfe2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAndXNkbWFya2V0Jzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAne2lkfV9rbGluZV97cGVyaW9kfScsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcl97aWR9JyxcbiAgICAgICAgICAgICAgICAnZGVwdGhfe2lkfScsXG4gICAgICAgICAgICAgICAgJ2RlcHRoX3tpZH1fe2xlbmd0aH0nLFxuICAgICAgICAgICAgICAgICdkZXRhaWxfe2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAndHJhZGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnZ2V0X2FjY291bnRfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2dldF9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcl9pbmZvJyxcbiAgICAgICAgICAgICAgICAnYnV5JyxcbiAgICAgICAgICAgICAgICAnc2VsbCcsXG4gICAgICAgICAgICAgICAgJ2J1eV9tYXJrZXQnLFxuICAgICAgICAgICAgICAgICdzZWxsX21hcmtldCcsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldF9uZXdfZGVhbF9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdnZXRfb3JkZXJfaWRfYnlfdHJhZGVfaWQnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd19jb2luJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX3dpdGhkcmF3X2NvaW4nLFxuICAgICAgICAgICAgICAgICdnZXRfd2l0aGRyYXdfY29pbl9yZXN1bHQnLFxuICAgICAgICAgICAgICAgICd0cmFuc2ZlcicsXG4gICAgICAgICAgICAgICAgJ2xvYW4nLFxuICAgICAgICAgICAgICAgICdyZXBheW1lbnQnLFxuICAgICAgICAgICAgICAgICdnZXRfbG9hbl9hdmFpbGFibGUnLFxuICAgICAgICAgICAgICAgICdnZXRfbG9hbnMnLFxuICAgICAgICAgICAgXSwgICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9DTlknOiB7ICdpZCc6ICdidGMnLCAnc3ltYm9sJzogJ0JUQy9DTlknLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ05ZJywgJ3R5cGUnOiAnc3RhdGljbWFya2V0JywgJ2NvaW5UeXBlJzogMSwgfSxcbiAgICAgICAgJ0xUQy9DTlknOiB7ICdpZCc6ICdsdGMnLCAnc3ltYm9sJzogJ0xUQy9DTlknLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnQ05ZJywgJ3R5cGUnOiAnc3RhdGljbWFya2V0JywgJ2NvaW5UeXBlJzogMiwgfSxcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdidGMnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJywgJ3R5cGUnOiAndXNkbWFya2V0JywgICAgJ2NvaW5UeXBlJzogMSwgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhZGVQb3N0R2V0QWNjb3VudEluZm8gKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG1ldGhvZCA9IHBbJ3R5cGUnXSArICdHZXREZXB0aElkJztcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXNbbWV0aG9kXSAoeyAnaWQnOiBwWydpZCddIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IG9yZGVyYm9va1snYmlkcyddLFxuICAgICAgICAgICAgJ2Fza3MnOiBvcmRlcmJvb2tbJ2Fza3MnXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG1ldGhvZCA9IHBbJ3R5cGUnXSArICdHZXRUaWNrZXJJZCc7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXNbbWV0aG9kXSAoeyAnaWQnOiBwWydpZCddIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3RpY2tlciddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKHJlc3BvbnNlWyd0aW1lJ10pICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gcFsndHlwZSddICsgJ0dldERldGFpbElkJztcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAoeyAnaWQnOiBwWydpZCddIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3RyYWRlUG9zdCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnY29pbl90eXBlJzogcFsnY29pblR5cGUnXSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAnbWFya2V0JzogcFsncXVvdGUnXS50b0xvd2VyQ2FzZSAoKSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1ldGhvZCArPSB0aGlzLmNhcGl0YWxpemUgKHR5cGUpO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3RyYWRlJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddO1xuICAgICAgICBpZiAodHlwZSA9PSAndHJhZGUnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy9hcGknICsgdGhpcy52ZXJzaW9uO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5rZXlzb3J0ICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdtZXRob2QnOiBwYXRoLFxuICAgICAgICAgICAgICAgICdhY2Nlc3Nfa2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZWQnOiB0aGlzLm5vbmNlICgpLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBsZXQgcXVlcnlTdHJpbmcgPSB0aGlzLnVybGVuY29kZSAodGhpcy5vbWl0IChxdWVyeSwgJ21hcmtldCcpKTtcbiAgICAgICAgICAgIC8vIHNlY3JldCBrZXkgbXVzdCBiZSBhdCB0aGUgZW5kIG9mIHF1ZXJ5IHRvIGJlIHNpZ25lZFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcgKz0gJyZzZWNyZXRfa2V5PScgKyB0aGlzLnNlY3JldDtcbiAgICAgICAgICAgIHF1ZXJ5WydzaWduJ10gPSB0aGlzLmhhc2ggKHF1ZXJ5U3RyaW5nKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsICs9ICcvJyArIHR5cGUgKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcykgKyAnX2pzb24uanMnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgaXRiaXQgPSB7XG5cbiAgICAnaWQnOiAnaXRiaXQnLCAgICBcbiAgICAnbmFtZSc6ICdpdEJpdCcsXG4gICAgJ2NvdW50cmllcyc6ICdVUycsXG4gICAgJ3JhdGVMaW1pdCc6IDMwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3ODIyMTU5LTY2MTUzNjIwLTYwYWQtMTFlNy04OWU3LTAwNWY2ZDdmM2RlMC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLml0Yml0LmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuaXRiaXQuY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3d3dy5pdGJpdC5jb20vYXBpJyxcbiAgICAgICAgICAgICdodHRwczovL2FwaS5pdGJpdC5jb20vZG9jcycsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnbWFya2V0cy97c3ltYm9sfS90aWNrZXInLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzL3tzeW1ib2x9L29yZGVyX2Jvb2snLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzL3tzeW1ib2x9L3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMnLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0nLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vYmFsYW5jZXMve2N1cnJlbmN5Q29kZX0nLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vZnVuZGluZ19oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0cy97d2FsbGV0SWR9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMve3dhbGxldElkfS9vcmRlcnMve29yZGVySWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnd2FsbGV0X3RyYW5zZmVycycsXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMnLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vY3J5cHRvY3VycmVuY3lfZGVwb3NpdHMnLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vY3J5cHRvY3VycmVuY3lfd2l0aGRyYXdhbHMnLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnd2lyZV93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vb3JkZXJzL3tvcmRlcklkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ1hCVFVTRCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdCVEMvU0dEJzogeyAnaWQnOiAnWEJUU0dEJywgJ3N5bWJvbCc6ICdCVEMvU0dEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1NHRCcgfSxcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdYQlRFVVInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRNYXJrZXRzU3ltYm9sT3JkZXJCb29rICh7IFxuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWzBdKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbMV0pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0TWFya2V0c1N5bWJvbFRpY2tlciAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLnBhcnNlODYwMSAodGlja2VyWydzZXJ2ZXJUaW1lVVRDJ10pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoMjRoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93MjRoJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAyNGgnXSksXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlblRvZGF5J10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RQcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZTI0aCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0TWFya2V0c1N5bWJvbFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRXYWxsZXRzICgpO1xuICAgIH0sXG5cbiAgICBub25jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICh0aGlzLmlkICsgJyBhbGxvd3MgbGltaXQgb3JkZXJzIG9ubHknKTtcbiAgICAgICAgYW1vdW50ID0gYW1vdW50LnRvU3RyaW5nICgpO1xuICAgICAgICBwcmljZSA9IHByaWNlLnRvU3RyaW5nICgpO1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICd0eXBlJzogdHlwZSxcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IHBbJ2Jhc2UnXSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAnZGlzcGxheSc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLFxuICAgICAgICAgICAgJ2luc3RydW1lbnQnOiBwWydpZCddLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFRyYWRlQWRkICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGJvZHkgPSAnJztcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gbm9uY2U7XG4gICAgICAgICAgICBsZXQgYXV0aCA9IFsgbWV0aG9kLCB1cmwsIGJvZHksIG5vbmNlLCB0aW1lc3RhbXAgXTtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gbm9uY2UgKyBKU09OLnN0cmluZ2lmeSAoYXV0aCk7XG4gICAgICAgICAgICBsZXQgaGFzaGVkTWVzc2FnZSA9IHRoaXMuaGFzaCAobWVzc2FnZSwgJ3NoYTI1NicsICdiaW5hcnknKTtcbiAgICAgICAgICAgIGxldCBzaWduYXR1cmUgPSB0aGlzLmhtYWMgKHVybCArIGhhc2hlZE1lc3NhZ2UsIHRoaXMuc2VjcmV0LCAnc2hhNTEyJywgJ2Jhc2U2NCcpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQXV0aG9yaXphdGlvbic6IHNlbGYuYXBpS2V5ICsgJzonICsgc2lnbmF0dXJlLFxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgJ1gtQXV0aC1UaW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgJ1gtQXV0aC1Ob25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGp1YmkgPSB7XG5cbiAgICAnaWQnOiAnanViaScsXG4gICAgJ25hbWUnOiAnanViaS5jb20nLFxuICAgICdjb3VudHJpZXMnOiAnQ04nLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjU4MS05ZDM5N2Q5YS01ZWRkLTExZTctOGZiOS01ZDgyMzZjMGU2OTIuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5qdWJpLmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3Lmp1YmkuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL3d3dy5qdWJpLmNvbS9oZWxwL2FwaS5odG1sJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdkZXB0aCcsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfYWRkJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfbGlzdCcsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX3ZpZXcnLFxuICAgICAgICAgICAgICAgICd3YWxsZXQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9DTlknOiAgeyAnaWQnOiAnYnRjJywgICdzeW1ib2wnOiAnQlRDL0NOWScsICAnYmFzZSc6ICdCVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0VUSC9DTlknOiAgeyAnaWQnOiAnZXRoJywgICdzeW1ib2wnOiAnRVRIL0NOWScsICAnYmFzZSc6ICdFVEgnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0FOUy9DTlknOiAgeyAnaWQnOiAnYW5zJywgICdzeW1ib2wnOiAnQU5TL0NOWScsICAnYmFzZSc6ICdBTlMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0JMSy9DTlknOiAgeyAnaWQnOiAnYmxrJywgICdzeW1ib2wnOiAnQkxLL0NOWScsICAnYmFzZSc6ICdCTEsnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0ROQy9DTlknOiAgeyAnaWQnOiAnZG5jJywgICdzeW1ib2wnOiAnRE5DL0NOWScsICAnYmFzZSc6ICdETkMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0RPR0UvQ05ZJzogeyAnaWQnOiAnZG9nZScsICdzeW1ib2wnOiAnRE9HRS9DTlknLCAnYmFzZSc6ICdET0dFJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0VBQy9DTlknOiAgeyAnaWQnOiAnZWFjJywgICdzeW1ib2wnOiAnRUFDL0NOWScsICAnYmFzZSc6ICdFQUMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0VUQy9DTlknOiAgeyAnaWQnOiAnZXRjJywgICdzeW1ib2wnOiAnRVRDL0NOWScsICAnYmFzZSc6ICdFVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0ZaL0NOWSc6ICAgeyAnaWQnOiAnZnonLCAgICdzeW1ib2wnOiAnRlovQ05ZJywgICAnYmFzZSc6ICdGWicsICAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0dPT0MvQ05ZJzogeyAnaWQnOiAnZ29vYycsICdzeW1ib2wnOiAnR09PQy9DTlknLCAnYmFzZSc6ICdHT09DJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0dBTUUvQ05ZJzogeyAnaWQnOiAnZ2FtZScsICdzeW1ib2wnOiAnR0FNRS9DTlknLCAnYmFzZSc6ICdHQU1FJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0hMQi9DTlknOiAgeyAnaWQnOiAnaGxiJywgICdzeW1ib2wnOiAnSExCL0NOWScsICAnYmFzZSc6ICdITEInLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0lGQy9DTlknOiAgeyAnaWQnOiAnaWZjJywgICdzeW1ib2wnOiAnSUZDL0NOWScsICAnYmFzZSc6ICdJRkMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0pCQy9DTlknOiAgeyAnaWQnOiAnamJjJywgICdzeW1ib2wnOiAnSkJDL0NOWScsICAnYmFzZSc6ICdKQkMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0tUQy9DTlknOiAgeyAnaWQnOiAna3RjJywgICdzeW1ib2wnOiAnS1RDL0NOWScsICAnYmFzZSc6ICdLVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0xLQy9DTlknOiAgeyAnaWQnOiAnbGtjJywgICdzeW1ib2wnOiAnTEtDL0NOWScsICAnYmFzZSc6ICdMS0MnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0xTSy9DTlknOiAgeyAnaWQnOiAnbHNrJywgICdzeW1ib2wnOiAnTFNLL0NOWScsICAnYmFzZSc6ICdMU0snLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0xUQy9DTlknOiAgeyAnaWQnOiAnbHRjJywgICdzeW1ib2wnOiAnTFRDL0NOWScsICAnYmFzZSc6ICdMVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ01BWC9DTlknOiAgeyAnaWQnOiAnbWF4JywgICdzeW1ib2wnOiAnTUFYL0NOWScsICAnYmFzZSc6ICdNQVgnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ01FVC9DTlknOiAgeyAnaWQnOiAnbWV0JywgICdzeW1ib2wnOiAnTUVUL0NOWScsICAnYmFzZSc6ICdNRVQnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ01SWUMvQ05ZJzogeyAnaWQnOiAnbXJ5YycsICdzeW1ib2wnOiAnTVJZQy9DTlknLCAnYmFzZSc6ICdNUllDJywgJ3F1b3RlJzogJ0NOWScgfSwgICAgICAgIFxuICAgICAgICAnTVRDL0NOWSc6ICB7ICdpZCc6ICdtdGMnLCAgJ3N5bWJvbCc6ICdNVEMvQ05ZJywgICdiYXNlJzogJ01UQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnTlhUL0NOWSc6ICB7ICdpZCc6ICdueHQnLCAgJ3N5bWJvbCc6ICdOWFQvQ05ZJywgICdiYXNlJzogJ05YVCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUEVCL0NOWSc6ICB7ICdpZCc6ICdwZWInLCAgJ3N5bWJvbCc6ICdQRUIvQ05ZJywgICdiYXNlJzogJ1BFQicsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUEdDL0NOWSc6ICB7ICdpZCc6ICdwZ2MnLCAgJ3N5bWJvbCc6ICdQR0MvQ05ZJywgICdiYXNlJzogJ1BHQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUExDL0NOWSc6ICB7ICdpZCc6ICdwbGMnLCAgJ3N5bWJvbCc6ICdQTEMvQ05ZJywgICdiYXNlJzogJ1BMQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUFBDL0NOWSc6ICB7ICdpZCc6ICdwcGMnLCAgJ3N5bWJvbCc6ICdQUEMvQ05ZJywgICdiYXNlJzogJ1BQQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUUVDL0NOWSc6ICB7ICdpZCc6ICdxZWMnLCAgJ3N5bWJvbCc6ICdRRUMvQ05ZJywgICdiYXNlJzogJ1FFQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUklPL0NOWSc6ICB7ICdpZCc6ICdyaW8nLCAgJ3N5bWJvbCc6ICdSSU8vQ05ZJywgICdiYXNlJzogJ1JJTycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUlNTL0NOWSc6ICB7ICdpZCc6ICdyc3MnLCAgJ3N5bWJvbCc6ICdSU1MvQ05ZJywgICdiYXNlJzogJ1JTUycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnU0tUL0NOWSc6ICB7ICdpZCc6ICdza3QnLCAgJ3N5bWJvbCc6ICdTS1QvQ05ZJywgICdiYXNlJzogJ1NLVCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnVEZDL0NOWSc6ICB7ICdpZCc6ICd0ZmMnLCAgJ3N5bWJvbCc6ICdURkMvQ05ZJywgICdiYXNlJzogJ1RGQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnVlJDL0NOWSc6ICB7ICdpZCc6ICd2cmMnLCAgJ3N5bWJvbCc6ICdWUkMvQ05ZJywgICdiYXNlJzogJ1ZSQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnVlRDL0NOWSc6ICB7ICdpZCc6ICd2dGMnLCAgJ3N5bWJvbCc6ICdWVEMvQ05ZJywgICdiYXNlJzogJ1ZUQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnV0RDL0NOWSc6ICB7ICdpZCc6ICd3ZGMnLCAgJ3N5bWJvbCc6ICdXREMvQ05ZJywgICdiYXNlJzogJ1dEQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWEFTL0NOWSc6ICB7ICdpZCc6ICd4YXMnLCAgJ3N5bWJvbCc6ICdYQVMvQ05ZJywgICdiYXNlJzogJ1hBUycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWFBNL0NOWSc6ICB7ICdpZCc6ICd4cG0nLCAgJ3N5bWJvbCc6ICdYUE0vQ05ZJywgICdiYXNlJzogJ1hQTScsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWFJQL0NOWSc6ICB7ICdpZCc6ICd4cnAnLCAgJ3N5bWJvbCc6ICdYUlAvQ05ZJywgICdiYXNlJzogJ1hSUCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWFNHUy9DTlknOiB7ICdpZCc6ICd4c2dzJywgJ3N5bWJvbCc6ICdYU0dTL0NOWScsICdiYXNlJzogJ1hTR1MnLCAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWVRDL0NOWSc6ICB7ICdpZCc6ICd5dGMnLCAgJ3N5bWJvbCc6ICdZVEMvQ05ZJywgICdiYXNlJzogJ1lUQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWkVUL0NOWSc6ICB7ICdpZCc6ICd6ZXQnLCAgJ3N5bWJvbCc6ICdaRVQvQ05ZJywgICdiYXNlJzogJ1pFVCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWkNDL0NOWSc6ICB7ICdpZCc6ICd6Y2MnLCAgJ3N5bWJvbCc6ICdaQ0MvQ05ZJywgICdiYXNlJzogJ1pDQycsICAncXVvdGUnOiAnQ05ZJyB9LCAgICAgICAgXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0RGVwdGggKHtcbiAgICAgICAgICAgICdjb2luJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBvcmRlcmJvb2tbJ2JpZHMnXSxcbiAgICAgICAgICAgICdhc2tzJzogb3JkZXJib29rWydhc2tzJ10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHsgXG4gICAgICAgICAgICAnY29pbic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRPcmRlcnMgKHtcbiAgICAgICAgICAgICdjb2luJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VHJhZGVBZGQgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UsXG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgICAgICAnY29pbic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHsgIFxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBwYXJhbXMpO1xuICAgICAgICAgICAgcXVlcnlbJ3NpZ25hdHVyZSddID0gdGhpcy5obWFjICh0aGlzLnVybGVuY29kZSAocXVlcnkpLCB0aGlzLmhhc2ggKHRoaXMuc2VjcmV0KSk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtyYWtlbiBpcyBhbHNvIG93bmVyIG9mIGV4LiBDb2luc2V0dGVyIC8gQ2FWaXJ0RXggLyBDbGV2ZXJjb2luXG5cbnZhciBrcmFrZW4gPSB7XG5cbiAgICAnaWQnOiAna3Jha2VuJyxcbiAgICAnbmFtZSc6ICdLcmFrZW4nLFxuICAgICdjb3VudHJpZXMnOiAnVVMnLFxuICAgICd2ZXJzaW9uJzogJzAnLFxuICAgICdyYXRlTGltaXQnOiAzMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NTk5LTIyNzA5MzA0LTVlZGUtMTFlNy05ZGUxLTlmMzM3MzJlMTUwOS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLmtyYWtlbi5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmtyYWtlbi5jb20nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3LmtyYWtlbi5jb20vZW4tdXMvaGVscC9hcGknLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3RoaW5naXNkZWFkL25wbS1rcmFrZW4tYXBpJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdBc3NldHMnLFxuICAgICAgICAgICAgICAgICdBc3NldFBhaXJzJyxcbiAgICAgICAgICAgICAgICAnRGVwdGgnLFxuICAgICAgICAgICAgICAgICdPSExDJyxcbiAgICAgICAgICAgICAgICAnU3ByZWFkJyxcbiAgICAgICAgICAgICAgICAnVGlja2VyJyxcbiAgICAgICAgICAgICAgICAnVGltZScsXG4gICAgICAgICAgICAgICAgJ1RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdBZGRPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdDYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0Nsb3NlZE9yZGVycycsXG4gICAgICAgICAgICAgICAgJ0RlcG9zaXRBZGRyZXNzZXMnLFxuICAgICAgICAgICAgICAgICdEZXBvc2l0TWV0aG9kcycsXG4gICAgICAgICAgICAgICAgJ0RlcG9zaXRTdGF0dXMnLFxuICAgICAgICAgICAgICAgICdMZWRnZXJzJyxcbiAgICAgICAgICAgICAgICAnT3Blbk9yZGVycycsXG4gICAgICAgICAgICAgICAgJ09wZW5Qb3NpdGlvbnMnLCBcbiAgICAgICAgICAgICAgICAnUXVlcnlMZWRnZXJzJywgXG4gICAgICAgICAgICAgICAgJ1F1ZXJ5T3JkZXJzJywgXG4gICAgICAgICAgICAgICAgJ1F1ZXJ5VHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnVHJhZGVCYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnVHJhZGVzSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ1RyYWRlVm9sdW1lJyxcbiAgICAgICAgICAgICAgICAnV2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICdXaXRoZHJhd0NhbmNlbCcsIFxuICAgICAgICAgICAgICAgICdXaXRoZHJhd0luZm8nLCAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ1dpdGhkcmF3U3RhdHVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEFzc2V0UGFpcnMgKCk7XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHByb2R1Y3RzWydyZXN1bHQnXSk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgaWQgPSBrZXlzW3BdO1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sncmVzdWx0J11baWRdO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0WydiYXNlJ107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydxdW90ZSddO1xuICAgICAgICAgICAgaWYgKChiYXNlWzBdID09ICdYJykgfHwgKGJhc2VbMF0gPT0gJ1onKSlcbiAgICAgICAgICAgICAgICBiYXNlID0gYmFzZS5zbGljZSAoMSk7XG4gICAgICAgICAgICBpZiAoKHF1b3RlWzBdID09ICdYJykgfHwgKHF1b3RlWzBdID09ICdaJykpXG4gICAgICAgICAgICAgICAgcXVvdGUgPSBxdW90ZS5zbGljZSAoMSk7XG4gICAgICAgICAgICBiYXNlID0gdGhpcy5jb21tb25DdXJyZW5jeUNvZGUgKGJhc2UpO1xuICAgICAgICAgICAgcXVvdGUgPSB0aGlzLmNvbW1vbkN1cnJlbmN5Q29kZSAocXVvdGUpO1xuICAgICAgICAgICAgbGV0IGRhcmtwb29sID0gaWQuaW5kZXhPZiAoJy5kJykgPj0gMDtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBkYXJrcG9vbCA/IHByb2R1Y3RbJ2FsdG5hbWUnXSA6IChiYXNlICsgJy8nICsgcXVvdGUpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0RGVwdGggICh7XG4gICAgICAgICAgICAncGFpcic6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgb3JkZXJib29rID0gcmVzcG9uc2VbJ3Jlc3VsdCddW3BbJ2lkJ11dO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IFsgJ2JpZHMnLCAnYXNrcycgXTtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBzaWRlcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1tzXTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlclswXSk7XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IHBhcnNlRmxvYXQgKG9yZGVyWzFdKTtcbiAgICAgICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gb3JkZXJbMl0gKiAxMDAwO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQsIHRpbWVzdGFtcCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAncGFpcic6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3Jlc3VsdCddW3BbJ2lkJ11dO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2gnXVsxXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsJ11bMV0pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYiddWzBdKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2EnXVswXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsncCddWzFdKSxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2MnXVswXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2J11bMV0pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdvcmRlcnR5cGUnOiB0eXBlLFxuICAgICAgICAgICAgJ3ZvbHVtZSc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QWRkT3JkZXIgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7ICBcbiAgICAgICAgbGV0IHVybCA9ICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHR5cGUgKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgJ25vbmNlJzogbm9uY2UgfSwgcGFyYW1zKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgcXVlcnkgPSB0aGlzLnN0cmluZ1RvQmluYXJ5ICh1cmwgKyB0aGlzLmhhc2ggKG5vbmNlICsgYm9keSwgJ3NoYTI1NicsICdiaW5hcnknKSk7XG4gICAgICAgICAgICBsZXQgc2VjcmV0ID0gdGhpcy5iYXNlNjRUb0JpbmFyeSAodGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQVBJLUtleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdBUEktU2lnbic6IHRoaXMuaG1hYyAocXVlcnksIHNlY3JldCwgJ3NoYTUxMicsICdiYXNlNjQnKSxcbiAgICAgICAgICAgICAgICAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyB1cmw7XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgbHVubyA9IHtcblxuICAgICdpZCc6ICdsdW5vJyxcbiAgICAnbmFtZSc6ICdsdW5vJyxcbiAgICAnY291bnRyaWVzJzogWyAnR0InLCAnU0cnLCAnWkEnLCBdLFxuICAgICdyYXRlTGltaXQnOiA1MDAwLFxuICAgICd2ZXJzaW9uJzogJzEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NjA3LThjMWE2OWQ4LTVlZGUtMTFlNy05MzBjLTU0MGI1ZWI5YmUyNC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLm15Yml0eC5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5sdW5vLmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9ucG1qcy5vcmcvcGFja2FnZS9iaXR4JyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vYmF1c21laWVyL25vZGUtYml0eCcsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndGlja2VycycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL3tpZH0vcGVuZGluZycsXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL3tpZH0vdHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2ZlZV9pbmZvJyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZ19hZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnbGlzdG9yZGVycycsXG4gICAgICAgICAgICAgICAgJ2xpc3R0cmFkZXMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3F1b3Rlcy97aWR9JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy97aWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdwb3N0b3JkZXInLFxuICAgICAgICAgICAgICAgICdtYXJrZXRvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3N0b3BvcmRlcicsXG4gICAgICAgICAgICAgICAgJ2Z1bmRpbmdfYWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzJyxcbiAgICAgICAgICAgICAgICAnc2VuZCcsXG4gICAgICAgICAgICAgICAgJ3F1b3RlcycsXG4gICAgICAgICAgICAgICAgJ29hdXRoMi9ncmFudCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3B1dCc6IFtcbiAgICAgICAgICAgICAgICAncXVvdGVzL3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ3F1b3Rlcy97aWR9JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMve2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXJzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ3RpY2tlcnMnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sndGlja2VycyddW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsncGFpciddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBpZC5zbGljZSAoMCwgMyk7XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBpZC5zbGljZSAoMywgNik7XG4gICAgICAgICAgICBiYXNlID0gdGhpcy5jb21tb25DdXJyZW5jeUNvZGUgKGJhc2UpO1xuICAgICAgICAgICAgcXVvdGUgPSB0aGlzLmNvbW1vbkN1cnJlbmN5Q29kZSAocXVvdGUpO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0T3JkZXJib29rICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3RpbWVzdGFtcCddO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xvdyc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdF90cmFkZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3JvbGxpbmdfMjRfaG91cl92b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVBvc3QnO1xuICAgICAgICBsZXQgb3JkZXIgPSB7ICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpIH07XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKSB7XG4gICAgICAgICAgICBtZXRob2QgKz0gJ01hcmtldG9yZGVyJztcbiAgICAgICAgICAgIG9yZGVyWyd0eXBlJ10gPSBzaWRlLnRvVXBwZXJDYXNlICgpO1xuICAgICAgICAgICAgaWYgKHNpZGUgPT0gJ2J1eScpXG4gICAgICAgICAgICAgICAgb3JkZXJbJ2NvdW50ZXJfdm9sdW1lJ10gPSBhbW91bnQ7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb3JkZXJbJ2Jhc2Vfdm9sdW1lJ10gPSBhbW91bnQ7ICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXRob2QgKz0gJ09yZGVyJztcbiAgICAgICAgICAgIG9yZGVyWyd2b2x1bWUnXSA9IGFtb3VudDtcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgICAgICBpZiAoc2lkZSA9PSAnYnV5JylcbiAgICAgICAgICAgICAgICBvcmRlclsndHlwZSddID0gJ0JJRCc7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb3JkZXJbJ3R5cGUnXSA9ICdBU0snO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHJpdmF0ZScpIHtcbiAgICAgICAgICAgIGxldCBhdXRoID0gdGhpcy5zdHJpbmdUb0Jhc2U2NCAodGhpcy5hcGlLZXkgKyAnOicgKyB0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnQXV0aG9yaXphdGlvbic6ICdCYXNpYyAnICsgYXV0aCB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgbWVyY2FkbyA9IHtcblxuICAgICdpZCc6ICdtZXJjYWRvJyxcbiAgICAnbmFtZSc6ICdNZXJjYWRvIEJpdGNvaW4nLFxuICAgICdjb3VudHJpZXMnOiAnQlInLCAvLyBCcmF6aWxcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndmVyc2lvbic6ICd2MycsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc4MzcwNjAtZTdjNTg3MTQtNjBlYS0xMWU3LTkxOTItZjA1ZTg2YWRiODNmLmpwZycsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAncHVibGljJzogJ2h0dHBzOi8vd3d3Lm1lcmNhZG9iaXRjb2luLm5ldC9hcGknLFxuICAgICAgICAgICAgJ3ByaXZhdGUnOiAnaHR0cHM6Ly93d3cubWVyY2Fkb2JpdGNvaW4ubmV0L3RhcGknLFxuICAgICAgICB9LFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3Lm1lcmNhZG9iaXRjb2luLmNvbS5icicsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cubWVyY2Fkb2JpdGNvaW4uY29tLmJyL2FwaS1kb2MnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lm1lcmNhZG9iaXRjb2luLmNvbS5ici90cmFkZS1hcGknLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbIC8vIGxhc3Qgc2xhc2ggY3JpdGljYWxcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rLycsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9va19saXRlY29pbi8nLFxuICAgICAgICAgICAgICAgICd0aWNrZXIvJyxcbiAgICAgICAgICAgICAgICAndGlja2VyX2xpdGVjb2luLycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy8nLFxuICAgICAgICAgICAgICAgICd0cmFkZXNfbGl0ZWNvaW4vJyxcbiAgICAgICAgICAgICAgICAndjIvdGlja2VyLycsXG4gICAgICAgICAgICAgICAgJ3YyL3RpY2tlcl9saXRlY29pbi8nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVyJyxcbiAgICAgICAgICAgICAgICAnZ2V0X2FjY291bnRfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2dldF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldF93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9zeXN0ZW1fbWVzc2FnZXMnLFxuICAgICAgICAgICAgICAgICdsaXN0X29yZGVycycsXG4gICAgICAgICAgICAgICAgJ2xpc3Rfb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAncGxhY2VfYnV5X29yZGVyJyxcbiAgICAgICAgICAgICAgICAncGxhY2Vfc2VsbF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2NvaW4nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9CUkwnOiB7ICdpZCc6ICdCUkxCVEMnLCAnc3ltYm9sJzogJ0JUQy9CUkwnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQlJMJywgJ3N1ZmZpeCc6ICcnIH0sXG4gICAgICAgICdMVEMvQlJMJzogeyAnaWQnOiAnQlJMTFRDJywgJ3N5bWJvbCc6ICdMVEMvQlJMJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0JSTCcsICdzdWZmaXgnOiAnTGl0ZWNvaW4nIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwdWJsaWNHZXRPcmRlcmJvb2snICsgdGhpcy5jYXBpdGFsaXplIChwWydzdWZmaXgnXSk7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXNbbWV0aG9kXSAoKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHVibGljR2V0VjJUaWNrZXInICsgdGhpcy5jYXBpdGFsaXplIChwWydzdWZmaXgnXSk7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXNbbWV0aG9kXSAoKTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWyd0aWNrZXInXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50ICh0aWNrZXJbJ2RhdGUnXSkgKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHVibGljR2V0VHJhZGVzJyArIHRoaXMuY2FwaXRhbGl6ZSAocFsnc3VmZml4J10pO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEdldEFjY291bnRJbmZvICgpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgKHRoaXMuaWQgKyAnIGFsbG93cyBsaW1pdCBvcmRlcnMgb25seScpO1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0UGxhY2UnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKSArICdPcmRlcic7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdjb2luX3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAncXVhbnRpdHknOiBhbW91bnQsXG4gICAgICAgICAgICAnbGltaXRfcHJpY2UnOiBwcmljZSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTsgICAgICAgIFxuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXVt0eXBlXSArICcvJztcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIHVybCArPSBwYXRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsICs9IHRoaXMudmVyc2lvbiArICcvJztcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ3RhcGlfbWV0aG9kJzogcGF0aCxcbiAgICAgICAgICAgICAgICAndGFwaV9ub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBsZXQgYXV0aCA9ICcvdGFwaS8nICsgdGhpcy52ZXJzaW9uICArICcvJyArICc/JyArIGJvZHk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnVEFQSS1JRCc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdUQVBJLU1BQyc6IHRoaXMuaG1hYyAoYXV0aCwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBPS0NvaW4gXG4vLyBDaGluYVxuLy8gaHR0cHM6Ly93d3cub2tjb2luLmNvbS9cbi8vIGh0dHBzOi8vd3d3Lm9rY29pbi5jb20vcmVzdF9nZXRTdGFydGVkLmh0bWxcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9PS0NvaW4vd2Vic29ja2V0XG4vLyBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9va2NvaW4uY29tXG4vLyBodHRwczovL3d3dy5va2NvaW4uY25cbi8vIGh0dHBzOi8vd3d3Lm9rY29pbi5jbi9yZXN0X2dldFN0YXJ0ZWQuaHRtbFxuXG52YXIgb2tjb2luID0ge1xuXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLCAvLyB1cCB0byAzMDAwIHJlcXVlc3RzIHBlciA1IG1pbnV0ZXMg4omIIDYwMCByZXF1ZXN0cyBwZXIgbWludXRlIOKJiCAxMCByZXF1ZXN0cyBwZXIgc2Vjb25kIOKJiCAxMDAgbXNcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZGVwdGgnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZV9yYXRlJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2RlcHRoJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2VzdGltYXRlZF9wcmljZScsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9ob2xkX2Ftb3VudCcsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9pbmRleCcsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9rbGluZScsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9wcmljZV9saW1pdCcsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV90aWNrZXInLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAna2xpbmUnLFxuICAgICAgICAgICAgICAgICdvdGNzJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJywgICAgXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdhY2NvdW50X3JlY29yZHMnLFxuICAgICAgICAgICAgICAgICdiYXRjaF90cmFkZScsXG4gICAgICAgICAgICAgICAgJ2JvcnJvd19tb25leScsXG4gICAgICAgICAgICAgICAgJ2JvcnJvd19vcmRlcl9pbmZvJyxcbiAgICAgICAgICAgICAgICAnYm9ycm93c19pbmZvJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX2JvcnJvdycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vdGNfb3JkZXInLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfd2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfYmF0Y2hfdHJhZGUnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2Rldm9sdmUnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfZXhwbG9zaXZlJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX29yZGVyX2luZm8nLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfb3JkZXJzX2luZm8nLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfcG9zaXRpb24nLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfcG9zaXRpb25fNGZpeCcsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV90cmFkZScsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV90cmFkZXNfaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV91c2VyaW5mbycsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV91c2VyaW5mb180Zml4JyxcbiAgICAgICAgICAgICAgICAnbGVuZF9kZXB0aCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyX2ZlZScsXG4gICAgICAgICAgICAgICAgJ29yZGVyX2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdvcmRlcl9pbmZvJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzX2luZm8nLFxuICAgICAgICAgICAgICAgICdvdGNfb3JkZXJfaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ290Y19vcmRlcl9pbmZvJyxcbiAgICAgICAgICAgICAgICAncmVwYXltZW50JyxcbiAgICAgICAgICAgICAgICAnc3VibWl0X290Y19vcmRlcicsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX290Y19vcmRlcicsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdfaW5mbycsXG4gICAgICAgICAgICAgICAgJ3VucmVwYXltZW50c19pbmZvJyxcbiAgICAgICAgICAgICAgICAndXNlcmluZm8nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXREZXB0aCAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3RpY2tlciddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKHJlc3BvbnNlWydkYXRlJ10pICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RVc2VyaW5mbyAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3JkZXJbJ3R5cGUnXSArPSAnX21hcmtldCc7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VHJhZGUgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSAnL2FwaS8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aCArICcuZG8nOyAgIFxuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmtleXNvcnQgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ2FwaV9rZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgLy8gc2VjcmV0IGtleSBtdXN0IGJlIGF0IHRoZSBlbmQgb2YgcXVlcnlcbiAgICAgICAgICAgIGxldCBxdWVyeVN0cmluZyA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSkgKyAnJnNlY3JldF9rZXk9JyArIHRoaXMuc2VjcmV0O1xuICAgICAgICAgICAgcXVlcnlbJ3NpZ24nXSA9IHRoaXMuaGFzaCAocXVlcnlTdHJpbmcpLnRvVXBwZXJDYXNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcgfTtcbiAgICAgICAgfVxuICAgICAgICB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgdXJsO1xuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIG9rY29pbmNueSA9IGV4dGVuZCAob2tjb2luLCB7XG4gICAgJ2lkJzogJ29rY29pbmNueScsXG4gICAgJ25hbWUnOiAnT0tDb2luIENOWScsXG4gICAgJ2NvdW50cmllcyc6ICdDTicsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY3OTItOGJlOTE1N2EtNWVlNS0xMWU3LTkyNmMtNmQ2OWI4ZDMzNzhkLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly93d3cub2tjb2luLmNuJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5va2NvaW4uY24nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vd3d3Lm9rY29pbi5jbi9yZXN0X2dldFN0YXJ0ZWQuaHRtbCcsXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvQ05ZJzogeyAnaWQnOiAnYnRjX2NueScsICdzeW1ib2wnOiAnQlRDL0NOWScsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdMVEMvQ05ZJzogeyAnaWQnOiAnbHRjX2NueScsICdzeW1ib2wnOiAnTFRDL0NOWScsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdDTlknIH0sXG4gICAgfSxcbn0pXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIG9rY29pbnVzZCA9IGV4dGVuZCAob2tjb2luLCB7XG4gICAgJ2lkJzogJ29rY29pbnVzZCcsXG4gICAgJ25hbWUnOiAnT0tDb2luIFVTRCcsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0NOJywgJ1VTJyBdLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NzkxLTg5ZmZiNTAyLTVlZTUtMTFlNy04YTViLWM1OTUwYjY4YWM2NS5qcGcnLCAgICAgICAgXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly93d3cub2tjb2luLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cub2tjb2luLmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cub2tjb2luLmNvbS9yZXN0X2dldFN0YXJ0ZWQuaHRtbCcsXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2Uvb2tjb2luLmNvbScsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvVVNEJzogeyAnaWQnOiAnYnRjX3VzZCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdMVEMvVVNEJzogeyAnaWQnOiAnbHRjX3VzZCcsICdzeW1ib2wnOiAnTFRDL1VTRCcsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgfSxcbn0pXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIHBheW1pdW0gPSB7XG5cbiAgICAnaWQnOiAncGF5bWl1bScsXG4gICAgJ25hbWUnOiAnUGF5bWl1bScsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0ZSJywgJ0VVJywgXSxcbiAgICAncmF0ZUxpbWl0JzogMzAwMCxcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3OTA1NjQtYTk0NWE5ZDQtNWZmOS0xMWU3LTlkMmQtYjYzNTc2M2YyZjI0LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9wYXltaXVtLmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LnBheW1pdW0uY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3d3dy5wYXltaXVtLmNvbS9wYWdlL2RldmVsb3BlcnMnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9QYXltaXVtL2FwaS1kb2N1bWVudGF0aW9uJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdjb3VudHJpZXMnLFxuICAgICAgICAgICAgICAgICdkYXRhL3tpZH0vdGlja2VyJyxcbiAgICAgICAgICAgICAgICAnZGF0YS97aWR9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2RhdGEve2lkfS9kZXB0aCcsXG4gICAgICAgICAgICAgICAgJ2JpdGNvaW5fY2hhcnRzL3tpZH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnYml0Y29pbl9jaGFydHMve2lkfS9kZXB0aCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ21lcmNoYW50L2dldF9wYXltZW50L3tVVUlEfScsXG4gICAgICAgICAgICAgICAgJ3VzZXInLFxuICAgICAgICAgICAgICAgICd1c2VyL2FkZHJlc3NlcycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvYWRkcmVzc2VzL3tidGNfYWRkcmVzc30nLFxuICAgICAgICAgICAgICAgICd1c2VyL29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvb3JkZXJzL3tVVUlEfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcHJpY2VfYWxlcnRzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAndXNlci9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICd1c2VyL2FkZHJlc3NlcycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcGF5bWVudF9yZXF1ZXN0cycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcHJpY2VfYWxlcnRzJyxcbiAgICAgICAgICAgICAgICAnbWVyY2hhbnQvY3JlYXRlX3BheW1lbnQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ3VzZXIvb3JkZXJzL3tVVUlEfS9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICd1c2VyL3ByaWNlX2FsZXJ0cy97aWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvRVVSJzogeyAnaWQnOiAnZXVyJywgJ3N5bWJvbCc6ICdCVEMvRVVSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldFVzZXIgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0RGF0YUlkRGVwdGggICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldERhdGFJZFRpY2tlciAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsnYXQnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogcGFyc2VGbG9hdCAodGlja2VyWyd2YXJpYXRpb24nXSksXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RGF0YUlkVHJhZGVzICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3R5cGUnOiB0aGlzLmNhcGl0YWxpemUgKHR5cGUpICsgJ09yZGVyJyxcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdkaXJlY3Rpb24nOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFVzZXJPcmRlcnMgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE9yZGVyIChpZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RDYW5jZWxPcmRlciAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdvcmRlck51bWJlcic6IGlkLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocGFyYW1zKTtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7ICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgYXV0aCA9IG5vbmNlICsgdXJsICsgYm9keTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0FwaS1LZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnQXBpLVNpZ25hdHVyZSc6IHRoaXMuaG1hYyAoYXV0aCwgdGhpcy5zZWNyZXQpLFxuICAgICAgICAgICAgICAgICdBcGktTm9uY2UnOiBub25jZSwgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBwb2xvbmlleCA9IHtcblxuICAgICdpZCc6ICdwb2xvbmlleCcsXG4gICAgJ25hbWUnOiAnUG9sb25pZXgnLFxuICAgICdjb3VudHJpZXMnOiAnVVMnLFxuICAgICdyYXRlTGltaXQnOiAxMDAwLCAvLyA2IGNhbGxzIHBlciBzZWNvbmRcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjgxNy1lOTQ1NjMxMi01ZWU2LTExZTctOWIzYy1iNjI4Y2E1NjI2YTUuanBnJyxcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdwdWJsaWMnOiAnaHR0cHM6Ly9wb2xvbmlleC5jb20vcHVibGljJyxcbiAgICAgICAgICAgICdwcml2YXRlJzogJ2h0dHBzOi8vcG9sb25pZXguY29tL3RyYWRpbmdBcGknLFxuICAgICAgICB9LFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vcG9sb25pZXguY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3BvbG9uaWV4LmNvbS9zdXBwb3J0L2FwaS8nLFxuICAgICAgICAgICAgJ2h0dHA6Ly9wYXN0ZWJpbi5jb20vZE1YN21aRTAnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3JldHVybjI0aFZvbHVtZScsXG4gICAgICAgICAgICAgICAgJ3JldHVybkNoYXJ0RGF0YScsXG4gICAgICAgICAgICAgICAgJ3JldHVybkN1cnJlbmNpZXMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5Mb2FuT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuT3JkZXJCb29rJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuVGlja2VyJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuVHJhZGVIaXN0b3J5JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2J1eScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbExvYW5PZmZlcicsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnY2xvc2VNYXJnaW5Qb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZUxvYW5PZmZlcicsXG4gICAgICAgICAgICAgICAgJ2dlbmVyYXRlTmV3QWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ2dldE1hcmdpblBvc2l0aW9uJyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luQnV5JyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luU2VsbCcsXG4gICAgICAgICAgICAgICAgJ21vdmVPcmRlcicsXG4gICAgICAgICAgICAgICAgJ3JldHVybkFjdGl2ZUxvYW5zJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuQXZhaWxhYmxlQWNjb3VudEJhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuQmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5Db21wbGV0ZUJhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuRGVwb3NpdEFkZHJlc3NlcycsXG4gICAgICAgICAgICAgICAgJ3JldHVybkRlcG9zaXRzV2l0aGRyYXdhbHMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5GZWVJbmZvJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuTGVuZGluZ0hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdyZXR1cm5NYXJnaW5BY2NvdW50U3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJ3JldHVybk9wZW5Mb2FuT2ZmZXJzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuT3Blbk9yZGVycycsXG4gICAgICAgICAgICAgICAgJ3JldHVybk9yZGVyVHJhZGVzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuVHJhZGFibGVCYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ3JldHVyblRyYWRlSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3NlbGwnLFxuICAgICAgICAgICAgICAgICd0b2dnbGVBdXRvUmVuZXcnLFxuICAgICAgICAgICAgICAgICd0cmFuc2ZlckJhbGFuY2UnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRSZXR1cm5UaWNrZXIgKCk7XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHByb2R1Y3RzKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IGtleXMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBpZCA9IGtleXNbcF07XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW2lkXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBpZC5yZXBsYWNlICgnXycsICcvJyk7XG4gICAgICAgICAgICBsZXQgWyBiYXNlLCBxdW90ZSBdID0gc3ltYm9sLnNwbGl0ICgnLycpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFJldHVybkNvbXBsZXRlQmFsYW5jZXMgKHtcbiAgICAgICAgICAgICdhY2NvdW50JzogJ2FsbCcsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFJldHVybk9yZGVyQm9vayAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5UGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VycyA9IGF3YWl0IHRoaXMucHVibGljR2V0UmV0dXJuVGlja2VyICgpO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1twWydpZCddXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoMjRociddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdzI0aHInXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoZXN0QmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93ZXN0QXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsncGVyY2VudENoYW5nZSddKSxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmFzZVZvbHVtZSddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsncXVvdGVWb2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0UmV0dXJuVHJhZGVIaXN0b3J5ICh7XG4gICAgICAgICAgICAnY3VycmVuY3lQYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVBvc3QnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKTtcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeVBhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAncmF0ZSc6IHByaWNlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE9yZGVyIChpZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RDYW5jZWxPcmRlciAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdvcmRlck51bWJlcic6IGlkLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV07XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7ICdjb21tYW5kJzogcGF0aCB9LCBwYXJhbXMpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBxdWVyeVsnbm9uY2UnXSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdLZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnU2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBxdWFkcmlnYWN4ID0ge1xuXG4gICAgJ2lkJzogJ3F1YWRyaWdhY3gnLFxuICAgICduYW1lJzogJ1F1YWRyaWdhQ1gnLFxuICAgICdjb3VudHJpZXMnOiAnQ0EnLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YyJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjgyNS05OGE2ZDBkZS01ZWU3LTExZTctOWZhNC0zOGUxMWEyYzZmNTIuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5xdWFkcmlnYWN4LmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cucXVhZHJpZ2FjeC5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vd3d3LnF1YWRyaWdhY3guY29tL2FwaV9pbmZvJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdvcmRlcl9ib29rJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJywgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnYml0Y29pbl9kZXBvc2l0X2FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICdiaXRjb2luX3dpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdidXknLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXInLFxuICAgICAgICAgICAgICAgICdldGhlcl9kZXBvc2l0X2FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICdldGhlcl93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnbG9va3VwX29yZGVyJyxcbiAgICAgICAgICAgICAgICAnb3Blbl9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdzZWxsJyxcbiAgICAgICAgICAgICAgICAndXNlcl90cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9DQUQnOiB7ICdpZCc6ICdidGNfY2FkJywgJ3N5bWJvbCc6ICdCVEMvQ0FEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NBRCcgfSxcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdidGNfdXNkJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0VUSC9CVEMnOiB7ICdpZCc6ICdldGhfYnRjJywgJ3N5bWJvbCc6ICdFVEgvQlRDJywgJ2Jhc2UnOiAnRVRIJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0VUSC9DQUQnOiB7ICdpZCc6ICdldGhfY2FkJywgJ3N5bWJvbCc6ICdFVEgvQ0FEJywgJ2Jhc2UnOiAnRVRIJywgJ3F1b3RlJzogJ0NBRCcgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyQm9vayAoe1xuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoe1xuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKHRpY2tlclsndGltZXN0YW1wJ10pICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWyd2d2FwJ10pLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFuc2FjdGlvbnMgKHtcbiAgICAgICAgICAgICdib29rJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVBvc3QnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKTsgXG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAnYm9vayc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE9yZGVyIChpZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RDYW5jZWxPcmRlciAodGhpcy5leHRlbmQgKHsgaWQgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBsZXQgcmVxdWVzdCA9IFsgbm9uY2UsIHRoaXMudWlkLCB0aGlzLmFwaUtleSBdLmpvaW4gKCcnKTtcbiAgICAgICAgICAgIGxldCBzaWduYXR1cmUgPSB0aGlzLmhtYWMgKHJlcXVlc3QsIHRoaXMuc2VjcmV0KTtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7IFxuICAgICAgICAgICAgICAgICdrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnc2lnbmF0dXJlJzogc2lnbmF0dXJlLFxuICAgICAgICAgICAgfSwgcGFyYW1zKTtcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIHF1b2luZSA9IHtcblxuICAgICdpZCc6ICdxdW9pbmUnLFxuICAgICduYW1lJzogJ1FVT0lORScsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0pQJywgJ1NHJywgJ1ZOJyBdLFxuICAgICd2ZXJzaW9uJzogJzInLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2ODQ0LTk2MTVhNGU4LTVlZTgtMTFlNy04ODE0LWZjZDAwNGRiOGNkZC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLnF1b2luZS5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LnF1b2luZS5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vZGV2ZWxvcGVycy5xdW9pbmUuY29tJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdwcm9kdWN0cycsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzL3tpZH0nLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cy97aWR9L3ByaWNlX2xldmVscycsXG4gICAgICAgICAgICAgICAgJ2V4ZWN1dGlvbnMnLFxuICAgICAgICAgICAgICAgICdpcl9sYWRkZXJzL3tjdXJyZW5jeX0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdhY2NvdW50cy9iYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnY3J5cHRvX2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnZXhlY3V0aW9ucy9tZScsXG4gICAgICAgICAgICAgICAgJ2ZpYXRfYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdsb2FuX2JpZHMnLFxuICAgICAgICAgICAgICAgICdsb2FucycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ29yZGVycy97aWR9JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3tpZH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzL3tpZH0vbG9hbnMnLFxuICAgICAgICAgICAgICAgICd0cmFkaW5nX2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAndHJhZGluZ19hY2NvdW50cy97aWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnZmlhdF9hY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2xvYW5fYmlkcycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3B1dCc6IFtcbiAgICAgICAgICAgICAgICAnbG9hbl9iaWRzL3tpZH0vY2xvc2UnLFxuICAgICAgICAgICAgICAgICdsb2Fucy97aWR9JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3tpZH0nLFxuICAgICAgICAgICAgICAgICdvcmRlcnMve2lkfS9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICd0cmFkZXMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97aWR9L2Nsb3NlJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzL2Nsb3NlX2FsbCcsXG4gICAgICAgICAgICAgICAgJ3RyYWRpbmdfYWNjb3VudHMve2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQcm9kdWN0cyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnaWQnXTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gcHJvZHVjdFsnYmFzZV9jdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsncXVvdGVkX2N1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0QWNjb3VudHNCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFByb2R1Y3RzSWRQcmljZUxldmVscyAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQcm9kdWN0c0lkICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2hfbWFya2V0X2FzayddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvd19tYXJrZXRfYmlkJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWFya2V0X2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21hcmtldF9hc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RfdHJhZGVkX3ByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lXzI0aCddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRFeGVjdXRpb25zICh7XG4gICAgICAgICAgICAncHJvZHVjdF9pZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnb3JkZXJfdHlwZSc6IHR5cGUsXG4gICAgICAgICAgICAncHJvZHVjdF9pZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICdxdWFudGl0eSc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXJzICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ29yZGVyJzogb3JkZXIsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQdXRPcmRlcnNJZENhbmNlbCAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9ICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgJ1gtUXVvaW5lLUFQSS1WZXJzaW9uJzogdGhpcy52ZXJzaW9uLFxuICAgICAgICAgICAgJ0NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBsZXQgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICAncGF0aCc6IHVybCwgXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsIFxuICAgICAgICAgICAgICAgICd0b2tlbl9pZCc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdpYXQnOiBNYXRoLmZsb29yIChub25jZSAvIDEwMDApLCAvLyBpc3N1ZWQgYXRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5IChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzWydYLVF1b2luZS1BdXRoJ10gPSB0aGlzLmp3dCAocmVxdWVzdCwgdGhpcy5zZWNyZXQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh0aGlzLnVybHNbJ2FwaSddICsgdXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIHRoZXJvY2sgPSB7XG5cbiAgICAnaWQnOiAndGhlcm9jaycsXG4gICAgJ25hbWUnOiAnVGhlUm9ja1RyYWRpbmcnLFxuICAgICdjb3VudHJpZXMnOiAnTVQnLFxuICAgICdyYXRlTGltaXQnOiAxMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2Njg2OS03NTA1N2ZhMi01ZWU5LTExZTctOWE2Zi0xM2U2NDFmYTQ3MDcuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS50aGVyb2NrdHJhZGluZy5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vdGhlcm9ja3RyYWRpbmcuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2FwaS50aGVyb2NrdHJhZGluZy5jb20vZG9jLycsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZnVuZHMve2lkfS9vcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICdmdW5kcy97aWR9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tpZH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnZnVuZHMvdGlja2VycycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZXMve2lkfScsXG4gICAgICAgICAgICAgICAgJ2Rpc2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2Rpc2NvdW50cy97aWR9JyxcbiAgICAgICAgICAgICAgICAnZnVuZHMnLFxuICAgICAgICAgICAgICAgICdmdW5kcy97aWR9JyxcbiAgICAgICAgICAgICAgICAnZnVuZHMve2lkfS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZnVuZHMve2Z1bmRfaWR9L29yZGVycy97aWR9JywgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9wb3NpdGlvbl9iYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9wb3NpdGlvbnMnLFxuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vcG9zaXRpb25zL3tpZH0nLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2xpbWl0cy97aWR9JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdfbGltaXRzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYXRtcy93aXRoZHJhdycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9vcmRlcnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9vcmRlcnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9vcmRlcnMvcmVtb3ZlX2FsbCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRGdW5kc1RpY2tlcnMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0c1sndGlja2VycyddLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWyd0aWNrZXJzJ11bcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydmdW5kX2lkJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IGlkLnNsaWNlICgwLCAzKTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IGlkLnNsaWNlICgzLCA2KTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0QmFsYW5jZXMgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0RnVuZHNJZE9yZGVyYm9vayAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRGdW5kc0lkVGlja2VyICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5wYXJzZTg2MDEgKHRpY2tlclsnZGF0ZSddKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2Nsb3NlJ10pLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWVfdHJhZGVkJ10pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RnVuZHNJZFRyYWRlcyAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICh0aGlzLmlkICsgJyBhbGxvd3MgbGltaXQgb3JkZXJzIG9ubHknKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RGdW5kc0Z1bmRJZE9yZGVycyAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdmdW5kX2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3ByaXZhdGUnKSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnWC1UUlQtS0VZJzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1gtVFJULU5PTkNFJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ1gtVFJULVNJR04nOiB0aGlzLmhtYWMgKG5vbmNlICsgdXJsLCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgdmF1bHRvcm8gPSB7XG5cbiAgICAnaWQnOiAndmF1bHRvcm8nLFxuICAgICduYW1lJzogJ1ZhdWx0b3JvJyxcbiAgICAnY291bnRyaWVzJzogJ0NIJyxcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndmVyc2lvbic6ICcxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2Njg4MC1mMjA1ZTg3MC01ZWU5LTExZTctOGZlMi0wZDViMTU4ODA3NTIuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS52YXVsdG9yby5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LnZhdWx0b3JvLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9hcGkudmF1bHRvcm8uY29tJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdiaWRhbmRhc2snLFxuICAgICAgICAgICAgICAgICdidXlvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdsYXRlc3QnLFxuICAgICAgICAgICAgICAgICdsYXRlc3R0cmFkZXMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAnc2VsbG9yZGVycycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucy9kYXknLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMvaG91cicsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucy9tb250aCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdteXRyYWRlcycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2J1eS97c3ltYm9sfS97dHlwZX0nLFxuICAgICAgICAgICAgICAgICdjYW5jZWwve29yZGVyaWQnLFxuICAgICAgICAgICAgICAgICdzZWxsL3tzeW1ib2x9L3t0eXBlfScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0TWFya2V0cyAoKTtcbiAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1snZGF0YSddO1xuICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ0Jhc2VDdXJyZW5jeSddO1xuICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydNYXJrZXRDdXJyZW5jeSddO1xuICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICBsZXQgYmFzZUlkID0gYmFzZTtcbiAgICAgICAgbGV0IHF1b3RlSWQgPSBxdW90ZTtcbiAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnTWFya2V0TmFtZSddO1xuICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAnYmFzZUlkJzogYmFzZUlkLFxuICAgICAgICAgICAgJ3F1b3RlSWQnOiBxdW90ZUlkLFxuICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0T3JkZXJib29rICgpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBxdW90ZSA9IGF3YWl0IHRoaXMucHVibGljR2V0QmlkYW5kYXNrICgpO1xuICAgICAgICBsZXQgYmlkc0xlbmd0aCA9IHF1b3RlWydiaWRzJ10ubGVuZ3RoO1xuICAgICAgICBsZXQgYmlkID0gcXVvdGVbJ2JpZHMnXVtiaWRzTGVuZ3RoIC0gMV07XG4gICAgICAgIGxldCBhc2sgPSBxdW90ZVsnYXNrcyddWzBdO1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE1hcmtldHMgKCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsnZGF0YSddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJzI0aEhpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWycyNGhMb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogYmlkWzBdLFxuICAgICAgICAgICAgJ2Fzayc6IGFza1swXSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdFByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnMjRoVm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYW5zYWN0aW9uc0RheSAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlUG9zdCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpICsgJ1N5bWJvbFR5cGUnO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHBbJ3F1b3RlSWQnXS50b0xvd2VyQ2FzZSAoKSxcbiAgICAgICAgICAgICd0eXBlJzogdHlwZSxcbiAgICAgICAgICAgICdnbGQnOiBhbW91bnQsXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZSB8fCAxLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLyc7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gcGF0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICB1cmwgKz0gdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnYXBpa2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICB9LCB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSkpO1xuICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgJ1gtU2lnbmF0dXJlJzogdGhpcy5obWFjICh1cmwsIHRoaXMuc2VjcmV0KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIHZpcndveCA9IHtcblxuICAgICdpZCc6ICd2aXJ3b3gnLFxuICAgICduYW1lJzogJ1ZpcldvWCcsXG4gICAgJ2NvdW50cmllcyc6ICdBVCcsXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY4OTQtNmRhOWQzNjAtNWVlYS0xMWU3LTkwYWEtNDFmMjcxMWI3NDA1LmpwZycsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAncHVibGljJzogJ2h0dHA6Ly9hcGkudmlyd294LmNvbS9hcGkvanNvbi5waHAnLFxuICAgICAgICAgICAgJ3ByaXZhdGUnOiAnaHR0cHM6Ly93d3cudmlyd294LmNvbS9hcGkvdHJhZGluZy5waHAnLFxuICAgICAgICB9LFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LnZpcndveC5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vd3d3LnZpcndveC5jb20vZGV2ZWxvcGVycy5waHAnLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2dldEluc3RydW1lbnRzJyxcbiAgICAgICAgICAgICAgICAnZ2V0QmVzdFByaWNlcycsXG4gICAgICAgICAgICAgICAgJ2dldE1hcmtldERlcHRoJyxcbiAgICAgICAgICAgICAgICAnZXN0aW1hdGVNYXJrZXRPcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldFRyYWRlZFByaWNlVm9sdW1lJyxcbiAgICAgICAgICAgICAgICAnZ2V0UmF3VHJhZGVEYXRhJyxcbiAgICAgICAgICAgICAgICAnZ2V0U3RhdGlzdGljcycsXG4gICAgICAgICAgICAgICAgJ2dldFRlcm1pbmFsTGlzdCcsXG4gICAgICAgICAgICAgICAgJ2dldEdyaWRMaXN0JyxcbiAgICAgICAgICAgICAgICAnZ2V0R3JpZFN0YXRpc3RpY3MnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdnZXRJbnN0cnVtZW50cycsXG4gICAgICAgICAgICAgICAgJ2dldEJlc3RQcmljZXMnLFxuICAgICAgICAgICAgICAgICdnZXRNYXJrZXREZXB0aCcsXG4gICAgICAgICAgICAgICAgJ2VzdGltYXRlTWFya2V0T3JkZXInLFxuICAgICAgICAgICAgICAgICdnZXRUcmFkZWRQcmljZVZvbHVtZScsXG4gICAgICAgICAgICAgICAgJ2dldFJhd1RyYWRlRGF0YScsXG4gICAgICAgICAgICAgICAgJ2dldFN0YXRpc3RpY3MnLFxuICAgICAgICAgICAgICAgICdnZXRUZXJtaW5hbExpc3QnLFxuICAgICAgICAgICAgICAgICdnZXRHcmlkTGlzdCcsXG4gICAgICAgICAgICAgICAgJ2dldEdyaWRTdGF0aXN0aWNzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnY2FuY2VsT3JkZXInLFxuICAgICAgICAgICAgICAgICdnZXRCYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2dldENvbW1pc3Npb25EaXNjb3VudCcsXG4gICAgICAgICAgICAgICAgJ2dldE9yZGVycycsXG4gICAgICAgICAgICAgICAgJ2dldFRyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICAgICAgJ3BsYWNlT3JkZXInLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdjYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldEJhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAnZ2V0Q29tbWlzc2lvbkRpc2NvdW50JyxcbiAgICAgICAgICAgICAgICAnZ2V0T3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZ2V0VHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAncGxhY2VPcmRlcicsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRJbnN0cnVtZW50cyAoKTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAocHJvZHVjdHNbJ3Jlc3VsdCddKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IGtleXMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3Jlc3VsdCddW2tleXNbcF1dO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnaW5zdHJ1bWVudElEJ107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gcHJvZHVjdFsnc3ltYm9sJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ2xvbmdDdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsnc2hvcnRDdXJyZW5jeSddO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEdldEJhbGFuY2VzICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaEJlc3RQcmljZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljUG9zdEdldEJlc3RQcmljZXMgKHtcbiAgICAgICAgICAgICdzeW1ib2xzJzogWyB0aGlzLnN5bWJvbCAocHJvZHVjdCkgXSxcbiAgICAgICAgfSk7XG4gICAgfSwgXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY1Bvc3RHZXRNYXJrZXREZXB0aCAoe1xuICAgICAgICAgICAgJ3N5bWJvbHMnOiBbIHRoaXMuc3ltYm9sIChwcm9kdWN0KSBdLFxuICAgICAgICAgICAgJ2J1eURlcHRoJzogMTAwLFxuICAgICAgICAgICAgJ3NlbGxEZXB0aCc6IDEwMCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IGVuZCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgc3RhcnQgPSBlbmQgLSA4NjQwMDAwMDtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUcmFkZWRQcmljZVZvbHVtZSAoe1xuICAgICAgICAgICAgJ2luc3RydW1lbnQnOiB0aGlzLnN5bWJvbCAocHJvZHVjdCksXG4gICAgICAgICAgICAnZW5kRGF0ZSc6IHRoaXMueXl5eW1tZGRoaG1tc3MgKGVuZCksXG4gICAgICAgICAgICAnc3RhcnREYXRlJzogdGhpcy55eXl5bW1kZGhobW1zcyAoc3RhcnQpLFxuICAgICAgICAgICAgJ0hMT0MnOiAxLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlcnMgPSByZXNwb25zZVsncmVzdWx0J11bJ3ByaWNlVm9sdW1lTGlzdCddO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzICh0aWNrZXJzKTtcbiAgICAgICAgbGV0IGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgICAgICBsZXQgbGFzdEtleSA9IGtleXNbbGVuZ3RoIC0gMV07XG4gICAgICAgIGxldCB0aWNrZXIgPSB0aWNrZXJzW2xhc3RLZXldO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Fzayc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2Nsb3NlJ10pLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydsb25nVm9sdW1lJ10pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydzaG9ydFZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRSYXdUcmFkZURhdGEgKHtcbiAgICAgICAgICAgICdpbnN0cnVtZW50JzogdGhpcy5zeW1ib2wgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3RpbWVzcGFuJzogMzYwMCxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnaW5zdHJ1bWVudCc6IHRoaXMuc3ltYm9sIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdvcmRlclR5cGUnOiBzaWRlLnRvVXBwZXJDYXNlICgpLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0UGxhY2VPcmRlciAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV07XG4gICAgICAgIGxldCBhdXRoID0ge307XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBhdXRoWydrZXknXSA9IHRoaXMuYXBpS2V5O1xuICAgICAgICAgICAgYXV0aFsndXNlciddID0gdGhpcy5sb2dpbjtcbiAgICAgICAgICAgIGF1dGhbJ3Bhc3MnXSA9IHRoaXMucGFzc3dvcmQ7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgaWYgKG1ldGhvZCA9PSAnR0VUJykge1xuICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoeyBcbiAgICAgICAgICAgICAgICAnbWV0aG9kJzogcGF0aCwgXG4gICAgICAgICAgICAgICAgJ2lkJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBhdXRoLCBwYXJhbXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfTtcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAoeyBcbiAgICAgICAgICAgICAgICAnbWV0aG9kJzogcGF0aCwgXG4gICAgICAgICAgICAgICAgJ3BhcmFtcyc6IHRoaXMuZXh0ZW5kIChhdXRoLCBwYXJhbXMpLFxuICAgICAgICAgICAgICAgICdpZCc6IG5vbmNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciB5b2JpdCA9IHtcblxuICAgICdpZCc6ICd5b2JpdCcsXG4gICAgJ25hbWUnOiAnWW9CaXQnLFxuICAgICdjb3VudHJpZXMnOiAnUlUnLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLCAvLyByZXNwb25zZXMgYXJlIGNhY2hlZCBldmVyeSAyIHNlY29uZHNcbiAgICAndmVyc2lvbic6ICczJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjkxMC1jZGNiZmRhZS01ZWVhLTExZTctOTg1OS0wM2ZlYTg3MzI3MmQuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3lvYml0Lm5ldCcsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cueW9iaXQubmV0JyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL3d3dy55b2JpdC5uZXQvZW4vYXBpLycsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAnYXBpJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZGVwdGgve3BhaXJzfScsXG4gICAgICAgICAgICAgICAgJ2luZm8nLFxuICAgICAgICAgICAgICAgICd0aWNrZXIve3BhaXJzfScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97cGFpcnN9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICd0YXBpJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ0FjdGl2ZU9yZGVycycsXG4gICAgICAgICAgICAgICAgJ0NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnR2V0RGVwb3NpdEFkZHJlc3MnLFxuICAgICAgICAgICAgICAgICdnZXRJbmZvJyxcbiAgICAgICAgICAgICAgICAnT3JkZXJJbmZvJyxcbiAgICAgICAgICAgICAgICAnVHJhZGUnLCAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnVHJhZGVIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnV2l0aGRyYXdDb2luc1RvQWRkcmVzcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5hcGlHZXRJbmZvICgpO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0c1sncGFpcnMnXSk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgaWQgPSBrZXlzW3BdO1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sncGFpcnMnXVtpZF07XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gaWQudG9VcHBlckNhc2UgKCkucmVwbGFjZSAoJ18nLCAnLycpO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFwaVBvc3RHZXRJbmZvICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmFwaUdldERlcHRoUGFpcnMgKHtcbiAgICAgICAgICAgICdwYWlycyc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VycyA9IGF3YWl0IHRoaXMuYXBpR2V0VGlja2VyUGFpcnMgKHtcbiAgICAgICAgICAgICdwYWlycyc6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1twWydpZCddXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndXBkYXRlZCddICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXZnJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbF9jdXInXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcGlHZXRUcmFkZXNQYWlycyAoe1xuICAgICAgICAgICAgJ3BhaXJzJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICh0aGlzLmlkICsgJyBhbGxvd3MgbGltaXQgb3JkZXJzIG9ubHknKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFwaVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdyYXRlJzogcHJpY2UsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcGlQb3N0Q2FuY2VsT3JkZXIgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnb3JkZXJfaWQnOiBpZCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAnYXBpJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdHlwZTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2FwaScpIHtcbiAgICAgICAgICAgIHVybCArPSAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgJ21ldGhvZCc6IHBhdGgsICdub25jZSc6IG5vbmNlIH0sIHBhcmFtcyk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnc2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciB6YWlmID0ge1xuXG4gICAgJ2lkJzogJ3phaWYnLFxuICAgICduYW1lJzogJ1phaWYnLFxuICAgICdjb3VudHJpZXMnOiAnSlAnLFxuICAgICdyYXRlTGltaXQnOiAzMDAwLFxuICAgICd2ZXJzaW9uJzogJzEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2OTI3LTM5Y2EyYWRhLTVlZWItMTFlNy05NzJmLTFiNDE5OTUxOGNhNi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLnphaWYuanAnLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vemFpZi5qcCcsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9jb3JwLnphaWYuanAvYXBpLWRvY3MnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vY29ycC56YWlmLmpwL2FwaS1kb2NzL2FwaV9saW5rcycsXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvemFpZi5qcCcsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL3lvdTIxOTc5L25vZGUtemFpZicsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAnYXBpJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZGVwdGgve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnY3VycmVuY2llcy97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdjdXJyZW5jaWVzL2FsbCcsXG4gICAgICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXJzL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXJzL2FsbCcsXG4gICAgICAgICAgICAgICAgJ2xhc3RfcHJpY2Uve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAndGlja2VyL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97cGFpcn0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3RhcGknOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYWN0aXZlX29yZGVycycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRfaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ2dldF9pZF9pbmZvJyxcbiAgICAgICAgICAgICAgICAnZ2V0X2luZm8nLFxuICAgICAgICAgICAgICAgICdnZXRfaW5mbzInLFxuICAgICAgICAgICAgICAgICdnZXRfcGVyc29uYWxfaW5mbycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdfaGlzdG9yeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAnZWNhcGknOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnY3JlYXRlSW52b2ljZScsXG4gICAgICAgICAgICAgICAgJ2dldEludm9pY2UnLFxuICAgICAgICAgICAgICAgICdnZXRJbnZvaWNlSWRzQnlPcmRlck51bWJlcicsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbEludm9pY2UnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMuYXBpR2V0Q3VycmVuY3lQYWlyc0FsbCAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnY3VycmVuY3lfcGFpciddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IHByb2R1Y3RbJ25hbWUnXTtcbiAgICAgICAgICAgIGxldCBbIGJhc2UsIHF1b3RlIF0gPSBzeW1ib2wuc3BsaXQgKCcvJyk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcGlQb3N0R2V0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5hcGlHZXREZXB0aFBhaXIgICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMuYXBpR2V0VGlja2VyUGFpciAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBpR2V0VHJhZGVzUGFpciAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgKHRoaXMuaWQgKyAnIGFsbG93cyBsaW1pdCBvcmRlcnMgb25seScpO1xuICAgICAgICByZXR1cm4gdGhpcy50YXBpUG9zdFRyYWRlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnYWN0aW9uJzogKHNpZGUgPT0gJ2J1eScpID8gJ2JpZCcgOiAnYXNrJyxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE9yZGVyIChpZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFwaVBvc3RDYW5jZWxPcmRlciAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdvcmRlcl9pZCc6IGlkLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdhcGknLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0eXBlO1xuICAgICAgICBpZiAodHlwZSA9PSAnYXBpJykge1xuICAgICAgICAgICAgdXJsICs9ICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ21ldGhvZCc6IHBhdGgsXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdLZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnU2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnZhciBtYXJrZXRzID0ge1xuXG4gICAgJ18xYnJva2VyJzogICAgXzFicm9rZXIsXG4gICAgJ18xYnRjeGUnOiAgICAgXzFidGN4ZSxcbiAgICAnYW54cHJvJzogICAgICBhbnhwcm8sXG4gICAgJ2JpdDJjJzogICAgICAgYml0MmMsXG4gICAgJ2JpdGJheSc6ICAgICAgYml0YmF5LFxuICAgICdiaXRiYXlzJzogICAgIGJpdGJheXMsXG4gICAgJ2JpdGNvaW5jb2lkJzogYml0Y29pbmNvaWQsXG4gICAgJ2JpdGZpbmV4JzogICAgYml0ZmluZXgsXG4gICAgJ2JpdGxpc2gnOiAgICAgYml0bGlzaCxcbiAgICAnYml0bWFya2V0JzogICBiaXRtYXJrZXQsXG4gICAgJ2JpdG1leCc6ICAgICAgYml0bWV4LFxuICAgICdiaXRzbyc6ICAgICAgIGJpdHNvLFxuICAgICdiaXRzdGFtcCc6ICAgIGJpdHN0YW1wLFxuICAgICdiaXR0cmV4JzogICAgIGJpdHRyZXgsXG4gICAgJ2J0Y2NoaW5hJzogICAgYnRjY2hpbmEsXG4gICAgJ2J0Y2UnOiAgICAgICAgYnRjZSxcbiAgICAnYnRjeCc6ICAgICAgICBidGN4LFxuICAgICdieGludGgnOiAgICAgIGJ4aW50aCxcbiAgICAnY2NleCc6ICAgICAgICBjY2V4LFxuICAgICdjZXgnOiAgICAgICAgIGNleCxcbiAgICAnY29pbmNoZWNrJzogICBjb2luY2hlY2ssXG4gICAgJ2NvaW5tYXRlJzogICAgY29pbm1hdGUsXG4gICAgJ2NvaW5zZWN1cmUnOiAgY29pbnNlY3VyZSxcbiAgICAnZXhtbyc6ICAgICAgICBleG1vLFxuICAgICdmeWJzZSc6ICAgICAgIGZ5YnNlLFxuICAgICdmeWJzZyc6ICAgICAgIGZ5YnNnLFxuICAgICdnZGF4JzogICAgICAgIGdkYXgsXG4gICAgJ2dlbWluaSc6ICAgICAgZ2VtaW5pLFxuICAgICdoaXRidGMnOiAgICAgIGhpdGJ0YyxcbiAgICAnaHVvYmknOiAgICAgICBodW9iaSxcbiAgICAnaXRiaXQnOiAgICAgICBpdGJpdCxcbiAgICAnanViaSc6ICAgICAgICBqdWJpLFxuICAgICdrcmFrZW4nOiAgICAgIGtyYWtlbixcbiAgICAnbHVubyc6ICAgICAgICBsdW5vLFxuICAgICdtZXJjYWRvJzogICAgIG1lcmNhZG8sXG4gICAgJ29rY29pbmNueSc6ICAgb2tjb2luY255LFxuICAgICdva2NvaW51c2QnOiAgIG9rY29pbnVzZCxcbiAgICAncGF5bWl1bSc6ICAgICBwYXltaXVtLFxuICAgICdwb2xvbmlleCc6ICAgIHBvbG9uaWV4LFxuICAgICdxdWFkcmlnYWN4JzogIHF1YWRyaWdhY3gsXG4gICAgJ3F1b2luZSc6ICAgICAgcXVvaW5lLFxuICAgICd0aGVyb2NrJzogICAgIHRoZXJvY2ssXG4gICAgJ3ZhdWx0b3JvJzogICAgdmF1bHRvcm8sXG4gICAgJ3ZpcndveCc6ICAgICAgdmlyd294LFxuICAgICd5b2JpdCc6ICAgICAgIHlvYml0LFxuICAgICd6YWlmJzogICAgICAgIHphaWYsXG59XG5cbmxldCBkZWZpbmVBbGxNYXJrZXRzID0gZnVuY3Rpb24gKG1hcmtldHMpIHtcbiAgICBsZXQgcmVzdWx0ID0ge31cbiAgICBmb3IgKGxldCBpZCBpbiBtYXJrZXRzKVxuICAgICAgICByZXN1bHRbaWRdID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXJrZXQgKGV4dGVuZCAobWFya2V0c1tpZF0sIHBhcmFtcykpXG4gICAgICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG59XG5cbmlmIChpc05vZGUpXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbmVBbGxNYXJrZXRzIChtYXJrZXRzKVxuZWxzZVxuICAgIHdpbmRvdy5jY3h0ID0gZGVmaW5lQWxsTWFya2V0cyAobWFya2V0cylcblxufSkgKCkiXX0=