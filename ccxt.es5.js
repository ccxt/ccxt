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

    var sortBy = function sortBy(array, key) {
        return array.sort(function (a, b) {
            return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
        });
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
                    if (response.match(/cloudflare/i)) throw {
                        name: 'DDoS Protection By Cloudflare',
                        message: 'Access to ' + _this2.id + ' from this location currently requires JavaScript in a browser.',
                        toString: function toString() {
                            return this.name + ': ' + this.message;
                        }
                    };
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

                    if (base == 'DSH') {
                        // issue #4 Bitfinex names Dash as DSH, instead of DASH
                        base = 'DASH';
                    }symbol = base + '/' + quote;

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
                // TODO sort bids and asks
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
                    'id': _this73.productId(product),
                    'level': 2 // 1 best bidask, 2 aggregated, 3 full
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
                _this91 = this;

            return Promise.resolve().then(function () {
                return _this91.publicGetOrderbook({
                    'pair': _this91.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = orderbook['timestamp'];
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this91.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = parseFloat(order['price']);
                        amount = parseFloat(order['volume']);
                        // let timestamp = order[2] * 1000;

                        result[side].push([price, amount]);
                    }
                }
                return result;
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
                orderbook,
                timestamp,
                result,
                _this93 = this;

            return Promise.resolve().then(function () {
                p = _this93.product(product);
                method = 'publicGetOrderbook' + _this93.capitalize(p['suffix']);
                return _this93[method]();
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this93.milliseconds();
                result = {
                    'bids': orderbook['bids'],
                    'asks': orderbook['asks'],
                    'timestamp': timestamp,
                    'datetime': _this93.iso8601(timestamp)
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
            var orderbook,
                timestamp,
                result,
                _this95 = this;

            return Promise.resolve().then(function () {
                return _this95.publicGetDepth({
                    'symbol': _this95.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this95.milliseconds();
                result = {
                    'bids': orderbook['bids'],
                    'asks': orderbook['asks'],
                    'timestamp': timestamp,
                    'datetime': _this95.iso8601(timestamp)
                };

                return result;
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
                _timestamp6,
                _this97 = this;

            return Promise.resolve().then(function () {
                return _this97.publicGetDataIdDepth({
                    'id': _this97.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this97.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this97.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = order['price'];
                        amount = order['amount'];
                        _timestamp6 = order['timestamp'] * 1000;

                        result[side].push([price, amount, _timestamp6]);
                    }
                }
                return result;
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
                _this100 = this;

            return Promise.resolve().then(function () {
                return _this100.publicGetReturnOrderBook({
                    'currencyPair': _this100.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this100.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this100.iso8601(timestamp)
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
                _this102 = this;

            return Promise.resolve().then(function () {
                return _this102.publicGetOrderBook({
                    'book': _this102.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = parseInt(orderbook['timestamp']) * 1000;
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this102.iso8601(timestamp)
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
                _this105 = this;

            return Promise.resolve().then(function () {
                return _this105.publicGetProductsIdPriceLevels({
                    'id': _this105.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this105.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this105.iso8601(timestamp)
                };
                sides = { 'bids': 'buy_price_levels', 'asks': 'sell_price_levels' };
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
                _this108 = this;

            return Promise.resolve().then(function () {
                return _this108.publicGetFundsIdOrderbook({
                    'id': _this108.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this108.parse8601(orderbook['date']);
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this108.iso8601(timestamp)
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
                _this111 = this;

            return Promise.resolve().then(function () {
                return _this111.publicGetOrderbook();
            }).then(function (_resp) {
                response = _resp;
                orderbook = {
                    'bids': response['data'][0]['b'],
                    'asks': response['data'][1]['s']
                };
                timestamp = _this111.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this111.iso8601(timestamp)
                };
                sides = ['bids', 'asks'];

                for (s = 0; s < sides.length; s++) {
                    side = sides[s];
                    orders = orderbook[side];

                    for (i = 0; i < orders.length; i++) {
                        order = orders[i];
                        price = order['Gold_Price'];
                        amount = order['Gold_Amount'];

                        result[side].push([price, amount]);
                    }
                }
                return result;
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
                _this114 = this;

            return Promise.resolve().then(function () {
                return _this114.publicPostGetMarketDepth({
                    'symbols': [_this114.symbol(product)],
                    'buyDepth': 100,
                    'sellDepth': 100
                });
            }).then(function (_resp) {
                response = _resp;
                orderbook = response['result'][0];
                timestamp = _this114.milliseconds();
                result = {
                    'bids': [],
                    'asks': [],
                    'timestamp': timestamp,
                    'datetime': _this114.iso8601(timestamp)
                };
                sides = { 'bids': 'buy', 'asks': 'sell' };
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
            var p,
                response,
                orderbook,
                timestamp,
                result,
                _this117 = this;

            return Promise.resolve().then(function () {
                p = _this117.product(product);
                return _this117.apiGetDepthPairs({
                    'pairs': p['id']
                });
            }).then(function (_resp) {
                response = _resp;
                orderbook = response[p['id']];
                timestamp = _this117.milliseconds();
                result = {
                    'bids': orderbook['bids'],
                    'asks': orderbook['asks'],
                    'timestamp': timestamp,
                    'datetime': _this117.iso8601(timestamp)
                };

                return result;
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
            var orderbook,
                timestamp,
                result,
                _this120 = this;

            return Promise.resolve().then(function () {
                return _this120.apiGetDepthPair({
                    'pair': _this120.productId(product)
                });
            }).then(function (_resp) {
                orderbook = _resp;
                timestamp = _this120.milliseconds();
                result = {
                    'bids': orderbook['bids'],
                    'asks': orderbook['asks'],
                    'timestamp': timestamp,
                    'datetime': _this120.iso8601(timestamp)
                };

                return result;
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QVMsS0FBNUQsRUFISDtBQUlSLHVCQUFXLEVBQUUsTUFBTSxLQUFSLEVBQWUsVUFBVSxTQUF6QixFQUFvQyxRQUFRLEtBQTVDLEVBQW1ELFNBQVMsS0FBNUQsRUFKSDtBQUtSLHVCQUFXLEVBQUUsTUFBTSxLQUFSLEVBQWUsVUFBVSxTQUF6QixFQUFvQyxRQUFRLEtBQTVDLEVBQW1ELFNBQVMsS0FBNUQsRUFMSDtBQU1SLHVCQUFXLEVBQUUsTUFBTSxLQUFSLEVBQWUsVUFBVSxTQUF6QixFQUFvQyxRQUFRLEtBQTVDLEVBQW1ELFNBQVMsS0FBNUQsRUFOSDtBQU9SLHVCQUFXLEVBQUUsTUFBTSxLQUFSLEVBQWUsVUFBVSxTQUF6QixFQUFvQyxRQUFRLEtBQTVDLEVBQW1ELFNBQVMsS0FBNUQsRUFQSDtBQVFSLHVCQUFXLEVBQUUsTUFBTSxLQUFSLEVBQWUsVUFBVSxTQUF6QixFQUFvQyxRQUFRLEtBQTVDLEVBQW1ELFNBQVMsS0FBNUQsRUFSSDtBQVNSLHVCQUFXLEVBQUUsTUFBTSxLQUFSLEVBQWUsVUFBVSxTQUF6QixFQUFvQyxRQUFRLEtBQTVDLEVBQW1ELFNBQVMsS0FBNUQsRUFUSDtBQVVSLHVCQUFXLEVBQUUsTUFBTSxLQUFSLEVBQWUsVUFBVSxTQUF6QixFQUFvQyxRQUFRLEtBQTVDLEVBQW1ELFNBQVMsS0FBNUQsRUFWSDtBQVdSLHVCQUFXLEVBQUUsTUFBTSxLQUFSLEVBQWUsVUFBVSxTQUF6QixFQUFvQyxRQUFRLEtBQTVDLEVBQW1ELFNBQVMsS0FBNUQsRUFYSDtBQVlSLHVCQUFXLEVBQUUsTUFBTSxLQUFSLEVBQWUsVUFBVSxTQUF6QixFQUFvQyxRQUFRLEtBQTVDLEVBQW1ELFNBQVMsS0FBNUQsRUFaSDtBQWFSLHVCQUFXLEVBQUUsTUFBTSxLQUFSLEVBQWUsVUFBVSxTQUF6QixFQUFvQyxRQUFRLEtBQTVDLEVBQW1ELFNBQVMsS0FBNUQsRUFiSDtBQWNSLHVCQUFXLEVBQUUsTUFBTSxLQUFSLEVBQWUsVUFBVSxTQUF6QixFQUFvQyxRQUFRLEtBQTVDLEVBQW1ELFNBQVMsS0FBNUQs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LE1BQVA7QUFDSCxLQVBEOztBQVNBLFFBQUksTUFBSixFQUNJLE9BQU8sT0FBUCxHQUFpQixpQkFBa0IsT0FBbEIsQ0FBakIsQ0FESixLQUdJLE9BQU8sSUFBUCxHQUFjLGlCQUFrQixPQUFsQixDQUFkO0FBRUgsQ0F0dVBEIiwiZmlsZSI6ImNjeHQuZXM1LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbihmdW5jdGlvbiAoKSB7XG5cbnZhciBpc05vZGUgPSAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGNhcGl0YWxpemUgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5sZW5ndGggPyAoc3RyaW5nLmNoYXJBdCAoMCkudG9VcHBlckNhc2UgKCkgKyBzdHJpbmcuc2xpY2UgKDEpKSA6IHN0cmluZ1xufVxuXG52YXIga2V5c29ydCA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fVxuICAgIE9iamVjdC5rZXlzIChvYmplY3QpLnNvcnQgKCkuZm9yRWFjaCAoa2V5ID0+IHJlc3VsdFtrZXldID0gb2JqZWN0W2tleV0pXG4gICAgcmV0dXJuIHJlc3VsdFxufVxuXG52YXIgZXh0ZW5kID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXG4gICAgICAgIGlmICh0eXBlb2YgYXJndW1lbnRzW2ldID09PSAnb2JqZWN0JylcbiAgICAgICAgICAgIE9iamVjdC5rZXlzIChhcmd1bWVudHNbaV0pLmZvckVhY2ggKGtleSA9PlxuICAgICAgICAgICAgICAgIChyZXN1bHRba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldKSlcbiAgICByZXR1cm4gcmVzdWx0XG59XG5cbnZhciBvbWl0ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciByZXN1bHQgPSBleHRlbmQgKG9iamVjdClcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcbiAgICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbaV0gPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgZGVsZXRlIHJlc3VsdFthcmd1bWVudHNbaV1dXG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkgKGFyZ3VtZW50c1tpXSkpXG4gICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGFyZ3VtZW50c1tpXS5sZW5ndGg7IGsrKylcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVzdWx0W2FyZ3VtZW50c1tpXVtrXV1cbiAgICByZXR1cm4gcmVzdWx0XG59XG5cbnZhciBpbmRleEJ5ID0gZnVuY3Rpb24gKGFycmF5LCBrZXkpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspXG4gICAgICAgIHJlc3VsdFthcnJheVtpXVtrZXldXSA9IGFycmF5W2ldXG4gICAgcmV0dXJuIHJlc3VsdFxufVxuXG52YXIgc29ydEJ5ID0gZnVuY3Rpb24gKGFycmF5LCBrZXkpIHtcbiAgICByZXR1cm4gYXJyYXkuc29ydCAoKGEsIGIpID0+ICgoYVtrZXldIDwgYltrZXldKSA/IC0xIDogKChhW2tleV0gPiBiW2tleV0pID8gMSA6IDApKSlcbn1cblxudmFyIGZsYXQgPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICByZXR1cm4gYXJyYXkucmVkdWNlICgoYWNjLCBjdXIpID0+IGFjYy5jb25jYXQgKGN1ciksIFtdKVxufVxuXG52YXIgdXJsZW5jb2RlID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyAob2JqZWN0KS5tYXAgKGtleSA9PiBcbiAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50IChrZXkpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50IChvYmplY3Rba2V5XSkpLmpvaW4gKCcmJylcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5pZiAoaXNOb2RlKSB7XG5cbiAgICBjb25zdCBjcnlwdG8gPSByZXF1aXJlICgnY3J5cHRvJylcbiAgICB2YXIgICBmZXRjaCAgPSByZXF1aXJlICgnbm9kZS1mZXRjaCcpXG5cbiAgICB2YXIgc3RyaW5nVG9CaW5hcnkgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBCdWZmZXIuZnJvbSAoc3RyaW5nLCAnYmluYXJ5JylcbiAgICB9XG5cbiAgICB2YXIgc3RyaW5nVG9CYXNlNjQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgQnVmZmVyIChzdHJpbmcpLnRvU3RyaW5nICgnYmFzZTY0JylcbiAgICB9XG5cbiAgICB2YXIgdXRmMTZUb0Jhc2U2NCA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZ1RvQmFzZTY0IChzdHJpbmcpXG4gICAgfVxuXG4gICAgdmFyIGJhc2U2NFRvQmluYXJ5ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20gKHN0cmluZywgJ2Jhc2U2NCcpXG4gICAgfVxuXG4gICAgdmFyIGJhc2U2NFRvU3RyaW5nID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20gKHN0cmluZywgJ2Jhc2U2NCcpLnRvU3RyaW5nICgpXG4gICAgfVxuXG4gICAgdmFyIGhhc2ggPSBmdW5jdGlvbiAocmVxdWVzdCwgaGFzaCA9ICdtZDUnLCBkaWdlc3QgPSAnaGV4Jykge1xuICAgICAgICByZXR1cm4gY3J5cHRvLmNyZWF0ZUhhc2ggKGhhc2gpLnVwZGF0ZSAocmVxdWVzdCkuZGlnZXN0IChkaWdlc3QpXG4gICAgfVxuXG4gICAgdmFyIGhtYWMgPSBmdW5jdGlvbiAocmVxdWVzdCwgc2VjcmV0LCBoYXNoID0gJ3NoYTI1NicsIGRpZ2VzdCA9ICdoZXgnKSB7XG4gICAgICAgIHJldHVybiBjcnlwdG8uY3JlYXRlSG1hYyAoaGFzaCwgc2VjcmV0KS51cGRhdGUgKHJlcXVlc3QpLmRpZ2VzdCAoZGlnZXN0KVxuICAgIH1cblxufSBlbHNlIHtcblxuICAgIHZhciBmZXRjaCA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMsIHZlcmJvc2UgPSBmYWxzZSkge1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSAoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAodmVyYm9zZSlcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyAodXJsLCBvcHRpb25zKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0ICgpXG4gICAgICAgICAgICB2YXIgbWV0aG9kID0gb3B0aW9ucy5tZXRob2QgfHwgJ0dFVCdcblxuICAgICAgICAgICAgeGhyLm9wZW4gKG1ldGhvZCwgdXJsLCB0cnVlKSAgICAgICAgICAgIFxuICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHsgXG4gICAgICAgICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT0gMjAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSAoeGhyLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAobWV0aG9kLCB1cmwsIHhoci5zdGF0dXMsIHhoci5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuaGVhZGVycyAhPSAndW5kZWZpbmVkJylcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBoZWFkZXIgaW4gb3B0aW9ucy5oZWFkZXJzKVxuICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlciAoaGVhZGVyLCBvcHRpb25zLmhlYWRlcnNbaGVhZGVyXSlcblxuICAgICAgICAgICAgeGhyLnNlbmQgKG9wdGlvbnMuYm9keSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICB2YXIgc3RyaW5nVG9CaW5hcnkgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBDcnlwdG9KUy5lbmMuTGF0aW4xLnBhcnNlIChzdHJpbmcpXG4gICAgfVxuXG4gICAgdmFyIHN0cmluZ1RvQmFzZTY0ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gQ3J5cHRvSlMuZW5jLkxhdGluMS5wYXJzZSAoc3RyaW5nKS50b1N0cmluZyAoQ3J5cHRvSlMuZW5jLkJhc2U2NClcbiAgICB9XG5cbiAgICB2YXIgdXRmMTZUb0Jhc2U2NCAgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBDcnlwdG9KUy5lbmMuVXRmMTYucGFyc2UgKHN0cmluZykudG9TdHJpbmcgKENyeXB0b0pTLmVuYy5CYXNlNjQpXG4gICAgfVxuXG4gICAgdmFyIGJhc2U2NFRvQmluYXJ5ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gQ3J5cHRvSlMuZW5jLkJhc2U2NC5wYXJzZSAoc3RyaW5nKVxuICAgIH1cblxuICAgIHZhciBiYXNlNjRUb1N0cmluZyA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIENyeXB0b0pTLmVuYy5CYXNlNjQucGFyc2UgKHN0cmluZykudG9TdHJpbmcgKENyeXB0b0pTLmVuYy5VdGY4KVxuICAgIH1cblxuICAgIHZhciBoYXNoID0gZnVuY3Rpb24gKHJlcXVlc3QsIGhhc2ggPSAnbWQ1JywgZGlnZXN0ID0gJ2hleCcpIHtcbiAgICAgICAgdmFyIGVuY29kaW5nID0gKGRpZ2VzdCA9PT0gJ2JpbmFyeScpID8gJ0xhdGluMScgOiBjYXBpdGFsaXplIChkaWdlc3QpXG4gICAgICAgIHJldHVybiBDcnlwdG9KU1toYXNoLnRvVXBwZXJDYXNlICgpXSAocmVxdWVzdCkudG9TdHJpbmcgKENyeXB0b0pTLmVuY1tlbmNvZGluZ10pXG4gICAgfVxuXG4gICAgdmFyIGhtYWMgPSBmdW5jdGlvbiAocmVxdWVzdCwgc2VjcmV0LCBoYXNoID0gJ3NoYTI1NicsIGRpZ2VzdCA9ICdoZXgnKSB7XG4gICAgICAgIHZhciBlbmNvZGluZyA9IChkaWdlc3QgPT09ICdiaW5hcnknKSA/ICdMYXRpbjEnIDogY2FwaXRhbGl6ZSAoZGlnZXN0KVxuICAgICAgICByZXR1cm4gQ3J5cHRvSlNbJ0htYWMnICsgaGFzaC50b1VwcGVyQ2FzZSAoKV0gKHJlcXVlc3QsIHNlY3JldCkudG9TdHJpbmcgKENyeXB0b0pTLmVuY1tjYXBpdGFsaXplIChlbmNvZGluZyldKVxuICAgIH1cbn1cblxudmFyIHVybGVuY29kZUJhc2U2NCA9IGZ1bmN0aW9uIChiYXNlNjRzdHJpbmcpIHtcbiAgICByZXR1cm4gYmFzZTY0c3RyaW5nLnJlcGxhY2UgKC9bPV0rJC8sICcnKS5yZXBsYWNlICgvXFwrL2csICctJykucmVwbGFjZSAoL1xcLy9nLCAnXycpIFxufVxuXG52YXIgand0ID0gZnVuY3Rpb24gKHJlcXVlc3QsIHNlY3JldCwgYWxnID0gJ0hTMjU2JywgaGFzaCA9ICdzaGEyNTYnKSB7XG4gICAgdmFyIGVuY29kZWRIZWFkZXIgPSB1cmxlbmNvZGVCYXNlNjQgKHN0cmluZ1RvQmFzZTY0IChKU09OLnN0cmluZ2lmeSAoeyAnYWxnJzogYWxnLCAndHlwJzogJ0pXVCcgfSkpKVxuICAgIHZhciBlbmNvZGVkRGF0YSA9IHVybGVuY29kZUJhc2U2NCAoc3RyaW5nVG9CYXNlNjQgKEpTT04uc3RyaW5naWZ5IChyZXF1ZXN0KSkpXG4gICAgdmFyIHRva2VuID0gWyBlbmNvZGVkSGVhZGVyLCBlbmNvZGVkRGF0YSBdLmpvaW4gKCcuJylcbiAgICB2YXIgc2lnbmF0dXJlID0gdXJsZW5jb2RlQmFzZTY0ICh1dGYxNlRvQmFzZTY0IChobWFjICh0b2tlbiwgc2VjcmV0LCBoYXNoLCAndXRmMTYnKSkpXG4gICAgcmV0dXJuIFsgdG9rZW4sIHNpZ25hdHVyZSBdLmpvaW4gKCcuJylcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgTWFya2V0ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgdGhpcy5oYXNoID0gaGFzaFxuICAgIHRoaXMuaG1hYyA9IGhtYWNcbiAgICB0aGlzLmp3dCA9IGp3dFxuICAgIHRoaXMuc3RyaW5nVG9CaW5hcnkgPSBzdHJpbmdUb0JpbmFyeVxuICAgIHRoaXMuc3RyaW5nVG9CYXNlNjQgPSBzdHJpbmdUb0Jhc2U2NFxuICAgIHRoaXMuYmFzZTY0VG9CaW5hcnkgPSBiYXNlNjRUb0JpbmFyeVxuICAgIHRoaXMudXJsZW5jb2RlID0gdXJsZW5jb2RlXG4gICAgdGhpcy5vbWl0ID0gb21pdFxuICAgIHRoaXMuZXh0ZW5kID0gZXh0ZW5kXG4gICAgdGhpcy5mbGF0dGVuID0gZmxhdFxuICAgIHRoaXMuaW5kZXhCeSA9IGluZGV4QnlcbiAgICB0aGlzLmtleXNvcnQgPSBrZXlzb3J0XG4gICAgdGhpcy5jYXBpdGFsaXplID0gY2FwaXRhbGl6ZVxuXG4gICAgdGhpcy5pbml0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmIChpc05vZGUpXG4gICAgICAgICAgICB0aGlzLm5vZGVWZXJzaW9uID0gcHJvY2Vzcy52ZXJzaW9uLm1hdGNoICgvXFxkK1xcLlxcZCsuXFxkKy8pIFswXVxuXG4gICAgICAgIGlmICh0aGlzLmFwaSlcbiAgICAgICAgICAgIE9iamVjdC5rZXlzICh0aGlzLmFwaSkuZm9yRWFjaCAodHlwZSA9PiB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMgKHRoaXMuYXBpW3R5cGVdKS5mb3JFYWNoIChtZXRob2QgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdXJscyA9IHRoaXMuYXBpW3R5cGVdW21ldGhvZF1cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1cmxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXJsID0gdXJsc1tpXS50cmltICgpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3BsaXRQYXRoID0gdXJsLnNwbGl0ICgvW15hLXpBLVowLTldLylcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVwcGVyY2FzZU1ldGhvZCAgPSBtZXRob2QudG9VcHBlckNhc2UgKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb3dlcmNhc2VNZXRob2QgID0gbWV0aG9kLnRvTG93ZXJDYXNlICgpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2FtZWxjYXNlTWV0aG9kICA9IGNhcGl0YWxpemUgKGxvd2VyY2FzZU1ldGhvZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYW1lbGNhc2VTdWZmaXggID0gc3BsaXRQYXRoLm1hcCAoY2FwaXRhbGl6ZSkuam9pbiAoJycpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdW5kZXJzY29yZVN1ZmZpeCA9IHNwbGl0UGF0aC5tYXAgKHggPT4geC50cmltICgpLnRvTG93ZXJDYXNlICgpKS5maWx0ZXIgKHggPT4geC5sZW5ndGggPiAwKS5qb2luICgnXycpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYW1lbGNhc2VTdWZmaXguaW5kZXhPZiAoY2FtZWxjYXNlTWV0aG9kKSA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW1lbGNhc2VTdWZmaXggPSBjYW1lbGNhc2VTdWZmaXguc2xpY2UgKGNhbWVsY2FzZU1ldGhvZC5sZW5ndGgpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1bmRlcnNjb3JlU3VmZml4LmluZGV4T2YgKGxvd2VyY2FzZU1ldGhvZCkgPT09IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZXJzY29yZVN1ZmZpeCA9IHVuZGVyc2NvcmVTdWZmaXguc2xpY2UgKGxvd2VyY2FzZU1ldGhvZC5sZW5ndGgpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYW1lbGNhc2UgID0gdHlwZSArIGNhbWVsY2FzZU1ldGhvZCArIGNhcGl0YWxpemUgKGNhbWVsY2FzZVN1ZmZpeClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1bmRlcnNjb3JlID0gdHlwZSArICdfJyArIGxvd2VyY2FzZU1ldGhvZCArICdfJyArIHVuZGVyc2NvcmVTdWZmaXhcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGYgPSAocGFyYW1zID0+IHRoaXMucmVxdWVzdCAodXJsLCB0eXBlLCB1cHBlcmNhc2VNZXRob2QsIHBhcmFtcykpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbY2FtZWxjYXNlXSAgPSBmXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzW3VuZGVyc2NvcmVdID0gZlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gdGhpcy5mZXRjaCA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcblxuICAgIC8vICAgICBpZiAoaXNOb2RlKVxuICAgIC8vICAgICAgICAgb3B0aW9ucy5oZWFkZXJzID0gZXh0ZW5kICh7XG4gICAgLy8gICAgICAgICAgICAgJ1VzZXItQWdlbnQnOiAnY2N4dC8wLjEuMCAoK2h0dHBzOi8vZ2l0aHViLmNvbS9rcm9pdG9yL2NjeHQpIE5vZGUuanMvJyArIHRoaXMubm9kZVZlcnNpb24gKyAnIChKYXZhU2NyaXB0KSdcbiAgICAvLyAgICAgICAgIH0sIG9wdGlvbnMuaGVhZGVycylcblxuICAgIC8vICAgICBpZiAodGhpcy52ZXJib3NlKVxuICAgIC8vICAgICAgICAgY29uc29sZS5sb2cgKHRoaXMuaWQsIHVybCwgb3B0aW9ucylcblxuICAgIC8vICAgICByZXR1cm4gKGZldGNoICgodGhpcy5jb3JzID8gdGhpcy5jb3JzIDogJycpICsgdXJsLCBvcHRpb25zKVxuICAgIC8vICAgICAgICAgLnRoZW4gKHJlc3BvbnNlID0+ICh0eXBlb2YgcmVzcG9uc2UgPT09ICdzdHJpbmcnKSA/IHJlc3BvbnNlIDogcmVzcG9uc2UudGV4dCAoKSlcbiAgICAvLyAgICAgICAgIC50aGVuIChyZXNwb25zZSA9PiB7XG4gICAgLy8gICAgICAgICAgICAgdHJ5IHtcbiAgICAvLyAgICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UgKHJlc3BvbnNlKVxuICAgIC8vICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgdmFyIGNsb3VkZmxhcmVQcm90ZWN0aW9uID0gcmVzcG9uc2UubWF0Y2ggKC9jbG91ZGZsYXJlL2kpID8gJ0REb1MgcHJvdGVjdGlvbiBieSBDbG91ZGZsYXJlJyA6ICcnXG4gICAgLy8gICAgICAgICAgICAgICAgIGlmICh0aGlzLnZlcmJvc2UpXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyAodGhpcy5pZCwgcmVzcG9uc2UsIGNsb3VkZmxhcmVQcm90ZWN0aW9uLCBlKVxuICAgIC8vICAgICAgICAgICAgICAgICB0aHJvdyBlXG4gICAgLy8gICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgfSkpXG4gICAgLy8gfVxuXG4gICAgdGhpcy5mZXRjaCA9IGZ1bmN0aW9uICh1cmwsIG1ldGhvZCA9ICdHRVQnLCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgaWYgKGlzTm9kZSlcbiAgICAgICAgICAgIGhlYWRlcnMgPSBleHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnVXNlci1BZ2VudCc6ICdjY3h0LzAuMS4wICgraHR0cHM6Ly9naXRodWIuY29tL2tyb2l0b3IvY2N4dCkgTm9kZS5qcy8nICsgdGhpcy5ub2RlVmVyc2lvbiArICcgKEphdmFTY3JpcHQpJ1xuICAgICAgICAgICAgfSwgaGVhZGVycylcblxuICAgICAgICBsZXQgb3B0aW9ucyA9IHsgJ21ldGhvZCc6IG1ldGhvZCwgJ2hlYWRlcnMnOiBoZWFkZXJzLCAnYm9keSc6IGJvZHkgfVxuXG4gICAgICAgIGlmICh0aGlzLnZlcmJvc2UpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyAodGhpcy5pZCwgdXJsLCBvcHRpb25zKVxuXG4gICAgICAgIHJldHVybiAoZmV0Y2ggKCh0aGlzLmNvcnMgPyB0aGlzLmNvcnMgOiAnJykgKyB1cmwsIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbiAocmVzcG9uc2UgPT4gKHR5cGVvZiByZXNwb25zZSA9PT0gJ3N0cmluZycpID8gcmVzcG9uc2UgOiByZXNwb25zZS50ZXh0ICgpKVxuICAgICAgICAgICAgLnRoZW4gKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSAocmVzcG9uc2UpXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubWF0Y2ggKC9jbG91ZGZsYXJlL2kpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdERG9TIFByb3RlY3Rpb24gQnkgQ2xvdWRmbGFyZScsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBY2Nlc3MgdG8gJyArIHRoaXMuaWQgKyAnIGZyb20gdGhpcyBsb2NhdGlvbiBjdXJyZW50bHkgcmVxdWlyZXMgSmF2YVNjcmlwdCBpbiBhIGJyb3dzZXIuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b1N0cmluZzogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5uYW1lICsgJzogJyArIHRoaXMubWVzc2FnZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpXG4gICAgfVxuXG4gICAgdGhpcy5sb2FkX3Byb2R1Y3RzID0gXG4gICAgdGhpcy5sb2FkUHJvZHVjdHMgPSBmdW5jdGlvbiAocmVsb2FkID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKCFyZWxvYWQgJiYgdGhpcy5wcm9kdWN0cylcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSAoKHJlc29sdmUsIHJlamVjdCkgPT4gcmVzb2x2ZSAodGhpcy5wcm9kdWN0cykpXG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoUHJvZHVjdHMgKCkudGhlbiAocHJvZHVjdHMgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvZHVjdHMgPSBpbmRleEJ5IChwcm9kdWN0cywgJ3N5bWJvbCcpXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5mZXRjaF9wcm9kdWN0cyA9IFxuICAgIHRoaXMuZmV0Y2hQcm9kdWN0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlICgocmVzb2x2ZSwgcmVqZWN0KSA9PiByZXNvbHZlICh0aGlzLnByb2R1Y3RzKSlcbiAgICB9XG5cbiAgICB0aGlzLmNvbW1vbkN1cnJlbmN5Q29kZSA9IGZ1bmN0aW9uIChjdXJyZW5jeSkgeyBcbiAgICAgICAgcmV0dXJuIChjdXJyZW5jeSA9PT0gJ1hCVCcpID8gJ0JUQycgOiBjdXJyZW5jeVxuICAgIH1cblxuICAgIHRoaXMucHJvZHVjdCA9IGZ1bmN0aW9uIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiAoKCh0eXBlb2YgcHJvZHVjdCA9PT0gJ3N0cmluZycpICYmXG4gICAgICAgICAgICAodHlwZW9mIHRoaXMucHJvZHVjdHMgIT0gJ3VuZGVmaW5lZCcpICYmXG4gICAgICAgICAgICAodHlwZW9mIHRoaXMucHJvZHVjdHNbcHJvZHVjdF0gIT0gJ3VuZGVmaW5lZCcpKSA/IHRoaXMucHJvZHVjdHNbcHJvZHVjdF0gOiBwcm9kdWN0KSAgICAgICAgXG4gICAgfVxuXG4gICAgdGhpcy5wcm9kdWN0X2lkID0gXG4gICAgdGhpcy5wcm9kdWN0SWQgID0gZnVuY3Rpb24gKHByb2R1Y3QpIHsgXG4gICAgICAgIHJldHVybiB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpLmlkIHx8IHByb2R1Y3RcbiAgICB9XG5cbiAgICB0aGlzLnN5bWJvbCA9IGZ1bmN0aW9uIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpLnN5bWJvbCB8fCBwcm9kdWN0XG4gICAgfVxuXG4gICAgdGhpcy5leHRyYWN0X3BhcmFtcyA9IFxuICAgIHRoaXMuZXh0cmFjdFBhcmFtcyA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgdmFyIHJlID0gL3soW2EtekEtWjAtOV9dKz8pfS9nXG4gICAgICAgIHZhciBtYXRjaGVzID0gW11cbiAgICAgICAgbGV0IG1hdGNoXG4gICAgICAgIHdoaWxlIChtYXRjaCA9IHJlLmV4ZWMgKHN0cmluZykpXG4gICAgICAgICAgICBtYXRjaGVzLnB1c2ggKG1hdGNoWzFdKVxuICAgICAgICByZXR1cm4gbWF0Y2hlc1xuICAgIH1cblxuICAgIHRoaXMuaW1wbG9kZV9wYXJhbXMgPSBcbiAgICB0aGlzLmltcGxvZGVQYXJhbXMgPSBmdW5jdGlvbiAoc3RyaW5nLCBwYXJhbXMpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcGVydHkgaW4gcGFyYW1zKVxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UgKCd7JyArIHByb3BlcnR5ICsgJ30nLCBwYXJhbXNbcHJvcGVydHldKVxuICAgICAgICByZXR1cm4gc3RyaW5nXG4gICAgfVxuXG4gICAgdGhpcy5idXkgPSBmdW5jdGlvbiAocHJvZHVjdCwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3JkZXIgKHByb2R1Y3QsICdidXknLCBhbW91bnQsIHByaWNlLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5zZWxsID0gZnVuY3Rpb24gKHByb2R1Y3QsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yZGVyIChwcm9kdWN0LCAnc2VsbCcsIGFtb3VudCwgcHJpY2UsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLnRyYWRlID1cbiAgICB0aGlzLm9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCB0eXBlID0gKHR5cGVvZiBwcmljZSA9PSAndW5kZWZpbmVkJykgPyAnbWFya2V0JyA6ICdsaW1pdCdcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9idXlfb3JkZXIgPVxuICAgIHRoaXMuY3JlYXRlQnV5T3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgdHlwZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHsgXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCAnYnV5JywgIGFtb3VudCwgcHJpY2UsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9zZWxsX29yZGVyID1cbiAgICB0aGlzLmNyZWF0ZVNlbGxPcmRlciA9IGZ1bmN0aW9uIChwcm9kdWN0LCB0eXBlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgJ3NlbGwnLCBhbW91bnQsIHByaWNlLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVfbGltaXRfYnV5X29yZGVyID1cbiAgICB0aGlzLmNyZWF0ZUxpbWl0QnV5T3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgYW1vdW50LCBwcmljZSwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTGltaXRPcmRlciAgKHByb2R1Y3QsICdidXknLCAgYW1vdW50LCBwcmljZSwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlX2xpbWl0X3NlbGxfb3JkZXIgPSBcbiAgICB0aGlzLmNyZWF0ZUxpbWl0U2VsbE9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIGFtb3VudCwgcHJpY2UsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUxpbWl0T3JkZXIgKHByb2R1Y3QsICdzZWxsJywgYW1vdW50LCBwcmljZSwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlX21hcmtldF9idXlfb3JkZXIgPVxuICAgIHRoaXMuY3JlYXRlTWFya2V0QnV5T3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgYW1vdW50LCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVNYXJrZXRPcmRlciAocHJvZHVjdCwgJ2J1eScsICBhbW91bnQsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9tYXJrZXRfc2VsbF9vcmRlciA9XG4gICAgdGhpcy5jcmVhdGVNYXJrZXRTZWxsT3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgYW1vdW50LCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVNYXJrZXRPcmRlciAocHJvZHVjdCwgJ3NlbGwnLCBhbW91bnQsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9saW1pdF9vcmRlciA9IFxuICAgIHRoaXMuY3JlYXRlTGltaXRPcmRlciA9IGZ1bmN0aW9uIChwcm9kdWN0LCBzaWRlLCBhbW91bnQsIHByaWNlLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVPcmRlciAocHJvZHVjdCwgJ2xpbWl0JywgIHNpZGUsIGFtb3VudCwgcHJpY2UsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9tYXJrZXRfb3JkZXIgPVxuICAgIHRoaXMuY3JlYXRlTWFya2V0T3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgc2lkZSwgYW1vdW50LCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVPcmRlciAocHJvZHVjdCwgJ21hcmtldCcsIHNpZGUsIGFtb3VudCwgdW5kZWZpbmVkLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5pc284NjAxICAgICAgICA9IHRpbWVzdGFtcCA9PiBuZXcgRGF0ZSAodGltZXN0YW1wKS50b0lTT1N0cmluZyAoKVxuICAgIHRoaXMucGFyc2U4NjAxICAgICAgPSBEYXRlLnBhcnNlIFxuICAgIHRoaXMuc2Vjb25kcyAgICAgICAgPSAoKSA9PiBNYXRoLmZsb29yICh0aGlzLm1pbGxpc2Vjb25kcyAoKSAvIDEwMDApXG4gICAgdGhpcy5taWNyb3NlY29uZHMgICA9ICgpID0+IE1hdGguZmxvb3IgKHRoaXMubWlsbGlzZWNvbmRzICgpICogMTAwMClcbiAgICB0aGlzLm1pbGxpc2Vjb25kcyAgID0gRGF0ZS5ub3dcbiAgICB0aGlzLm5vbmNlICAgICAgICAgID0gdGhpcy5zZWNvbmRzXG4gICAgdGhpcy5pZCAgICAgICAgICAgICA9IHVuZGVmaW5lZFxuICAgIHRoaXMucmF0ZUxpbWl0ICAgICAgPSAyMDAwXG4gICAgdGhpcy50aW1lb3V0ICAgICAgICA9IHVuZGVmaW5lZFxuICAgIHRoaXMueXl5eW1tZGRoaG1tc3MgPSB0aW1lc3RhbXAgPT4ge1xuICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlICh0aW1lc3RhbXApXG4gICAgICAgIGxldCB5eXl5ID0gZGF0ZS5nZXRVVENGdWxsWWVhciAoKVxuICAgICAgICBsZXQgTU0gPSBkYXRlLmdldFVUQ01vbnRoICgpXG4gICAgICAgIGxldCBkZCA9IGRhdGUuZ2V0VVRDRGF5ICgpXG4gICAgICAgIGxldCBoaCA9IGRhdGUuZ2V0VVRDSG91cnMgKClcbiAgICAgICAgbGV0IG1tID0gZGF0ZS5nZXRVVENNaW51dGVzICgpXG4gICAgICAgIGxldCBzcyA9IGRhdGUuZ2V0VVRDU2Vjb25kcyAoKVxuICAgICAgICBNTSA9IE1NIDwgMTAgPyAoJzAnICsgTU0pIDogTU1cbiAgICAgICAgZGQgPSBkZCA8IDEwID8gKCcwJyArIGRkKSA6IGRkXG4gICAgICAgIGhoID0gaGggPCAxMCA/ICgnMCcgKyBoaCkgOiBoaFxuICAgICAgICBtbSA9IG1tIDwgMTAgPyAoJzAnICsgbW0pIDogbW1cbiAgICAgICAgc3MgPSBzcyA8IDEwID8gKCcwJyArIHNzKSA6IHNzXG4gICAgICAgIHJldHVybiB5eXl5ICsgJy0nICsgTU0gKyAnLScgKyBkZCArICcgJyArIGhoICsgJzonICsgbW0gKyAnOicgKyBzc1xuICAgIH1cblxuICAgIGZvciAodmFyIHByb3BlcnR5IGluIGNvbmZpZylcbiAgICAgICAgdGhpc1twcm9wZXJ0eV0gPSBjb25maWdbcHJvcGVydHldXG5cbiAgICB0aGlzLmZldGNoX2JhbGFuY2UgICAgPSB0aGlzLmZldGNoQmFsYW5jZVxuICAgIHRoaXMuZmV0Y2hfb3JkZXJfYm9vayA9IHRoaXMuZmV0Y2hPcmRlckJvb2tcbiAgICB0aGlzLmZldGNoX3RpY2tlciAgICAgPSB0aGlzLmZldGNoVGlja2VyXG4gICAgdGhpcy5mZXRjaF90cmFkZXMgICAgID0gdGhpcy5mZXRjaFRyYWRlc1xuICBcbiAgICB0aGlzLnZlcmJvc2UgPSB0aGlzLmxvZyB8fCB0aGlzLmRlYnVnIHx8ICh0aGlzLnZlcmJvc2l0eSA9PSAxKSB8fCB0aGlzLnZlcmJvc2VcblxuICAgIHRoaXMuaW5pdCAoKVxufVxuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnZhciBfMWJyb2tlciA9IHtcblxuICAgICdpZCc6ICdfMWJyb2tlcicsXG4gICAgJ25hbWUnOiAnMUJyb2tlcicsXG4gICAgJ2NvdW50cmllcyc6ICdVUycsXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjInLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MDIxLTQyMGJkOWZjLTVlY2ItMTFlNy04ZWQ2LTU2ZDAwODFlZmVkMi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vMWJyb2tlci5jb20vYXBpJywgICAgICAgIFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vMWJyb2tlci5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vMWJyb2tlci5jb20vP2M9ZW4vY29udGVudC9hcGktZG9jdW1lbnRhdGlvbicsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ21hcmtldC9iYXJzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0L2NhdGVnb3JpZXMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXQvZGV0YWlscycsXG4gICAgICAgICAgICAgICAgJ21hcmtldC9saXN0JyxcbiAgICAgICAgICAgICAgICAnbWFya2V0L3F1b3RlcycsXG4gICAgICAgICAgICAgICAgJ21hcmtldC90aWNrcycsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NyZWF0ZScsXG4gICAgICAgICAgICAgICAgJ29yZGVyL29wZW4nLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9jbG9zZScsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL2Nsb3NlX2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL2VkaXQnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vb3BlbicsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL3NoYXJlZC9nZXQnLFxuICAgICAgICAgICAgICAgICdzb2NpYWwvcHJvZmlsZV9zdGF0aXN0aWNzJyxcbiAgICAgICAgICAgICAgICAnc29jaWFsL3Byb2ZpbGVfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAndXNlci9iaXRjb2luX2RlcG9zaXRfYWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZGV0YWlscycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvb3ZlcnZpZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL3F1b3RhX3N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvdHJhbnNhY3Rpb25fbG9nJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoQ2F0ZWdvcmllcyAoKSB7XG4gICAgICAgIGxldCBjYXRlZ29yaWVzID0gYXdhaXQgdGhpcy5wcml2YXRlR2V0TWFya2V0Q2F0ZWdvcmllcyAoKTtcbiAgICAgICAgcmV0dXJuIGNhdGVnb3JpZXNbJ3Jlc3BvbnNlJ107XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgY2F0ZWdvcmllcyA9IGF3YWl0IHRoaXMuZmV0Y2hDYXRlZ29yaWVzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgY2F0ZWdvcmllcy5sZW5ndGg7IGMrKykge1xuICAgICAgICAgICAgbGV0IGNhdGVnb3J5ID0gY2F0ZWdvcmllc1tjXTtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHJpdmF0ZUdldE1hcmtldExpc3QgKHsgXG4gICAgICAgICAgICAgICAgJ2NhdGVnb3J5JzogY2F0ZWdvcnkudG9Mb3dlckNhc2UgKCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ3Jlc3BvbnNlJ10ubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWydyZXNwb25zZSddW3BdO1xuICAgICAgICAgICAgICAgIGlmICgoY2F0ZWdvcnkgPT0gJ0ZPUkVYJykgfHwgKGNhdGVnb3J5ID09ICdDUllQVE8nKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydzeW1ib2wnXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN5bWJvbCA9IHByb2R1Y3RbJ25hbWUnXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydzeW1ib2wnXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN5bWJvbCA9IHByb2R1Y3RbJ3N5bWJvbCddO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHByb2R1Y3RbJ25hbWUnXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHR5cGUgPSBwcm9kdWN0Wyd0eXBlJ10udG9Mb3dlckNhc2UgKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgICAgICAgICAnbmFtZSc6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAndHlwZSc6IHR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkgeyBcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldFVzZXJPdmVydmlldyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wcml2YXRlR2V0TWFya2V0UXVvdGVzICh7XG4gICAgICAgICAgICAnc3ltYm9scyc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSByZXNwb25zZVsncmVzcG9uc2UnXVswXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMucGFyc2U4NjAxIChvcmRlcmJvb2tbJ3VwZGF0ZWQnXSk7XG4gICAgICAgIGxldCBiaWRQcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyYm9va1snYmlkJ10pO1xuICAgICAgICBsZXQgYXNrUHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlcmJvb2tbJ2FzayddKTtcbiAgICAgICAgbGV0IGJpZCA9IFsgYmlkUHJpY2UsIHVuZGVmaW5lZCBdO1xuICAgICAgICBsZXQgYXNrID0gWyBhc2tQcmljZSwgdW5kZWZpbmVkIF07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2JpZHMnOiBbIGJpZCBdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbIGFzayBdLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzdWx0ID0gYXdhaXQgdGhpcy5wcml2YXRlR2V0TWFya2V0QmFycyAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdyZXNvbHV0aW9uJzogNjAsXG4gICAgICAgICAgICAnbGltaXQnOiAxLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMuZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzdWx0WydyZXNwb25zZSddWzBdO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5wYXJzZTg2MDEgKHRpY2tlclsnZGF0ZSddKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2wnXSksXG4gICAgICAgICAgICAnYmlkJzogb3JkZXJib29rWydiaWRzJ11bMF1bJ3ByaWNlJ10sXG4gICAgICAgICAgICAnYXNrJzogb3JkZXJib29rWydhc2tzJ11bMF1bJ3ByaWNlJ10sXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogcGFyc2VGbG9hdCAodGlja2VyWydjJ10pLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICB9OyBcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnbWFyZ2luJzogYW1vdW50LFxuICAgICAgICAgICAgJ2RpcmVjdGlvbic6IChzaWRlID09ICdzZWxsJykgPyAnc2hvcnQnIDogJ2xvbmcnLFxuICAgICAgICAgICAgJ2xldmVyYWdlJzogMSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9yZGVyWyd0eXBlJ10gKz0gJ19tYXJrZXQnO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0T3JkZXJDcmVhdGUgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aCArICcucGhwJztcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgJ3Rva2VuJzogdGhpcy5hcGlLZXkgfSwgcGFyYW1zKTtcbiAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgY3J5cHRvY2FwaXRhbCA9IHtcblxuICAgICdjb21tZW50JzogJ0NyeXB0byBDYXBpdGFsIEFQSScsXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3N0YXRzJyxcbiAgICAgICAgICAgICAgICAnaGlzdG9yaWNhbC1wcmljZXMnLFxuICAgICAgICAgICAgICAgICdvcmRlci1ib29rJyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzogeyAgICAgICAgICAgIFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzLWFuZC1pbmZvJyxcbiAgICAgICAgICAgICAgICAnb3Blbi1vcmRlcnMnLFxuICAgICAgICAgICAgICAgICd1c2VyLXRyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICAgICAgJ2J0Yy1kZXBvc2l0LWFkZHJlc3MvZ2V0JyxcbiAgICAgICAgICAgICAgICAnYnRjLWRlcG9zaXQtYWRkcmVzcy9uZXcnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0cy9nZXQnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy9nZXQnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvbmV3JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL2VkaXQnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzL25ldycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2VzQW5kSW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHsgXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0T3JkZXJCb29rICh7XG4gICAgICAgICAgICAnY3VycmVuY3knOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgb3JkZXJib29rID0gcmVzcG9uc2VbJ29yZGVyLWJvb2snXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSB7ICdiaWRzJzogJ2JpZCcsICdhc2tzJzogJ2FzaycgfTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAoc2lkZXMpO1xuICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IGtleXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2tdO1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1trZXldO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAob3JkZXJbJ3RpbWVzdGFtcCddKSAqIDEwMDA7XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbJ3ByaWNlJ10pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsnb3JkZXJfYW1vdW50J10pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldLnB1c2ggKFsgcHJpY2UsIGFtb3VudCwgdGltZXN0YW1wIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0U3RhdHMgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsnc3RhdHMnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydtYXgnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydtaW4nXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RfcHJpY2UnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogcGFyc2VGbG9hdCAodGlja2VyWydkYWlseV9jaGFuZ2UnXSksXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3RvdGFsX2J0Y190cmFkZWQnXSksXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYW5zYWN0aW9ucyAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICd0eXBlJzogdHlwZSxcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsnbGltaXRfcHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyc05ldyAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdhcGlfa2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogdGhpcy5ub25jZSAoKSxcbiAgICAgICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgICAgICBxdWVyeVsnc2lnbmF0dXJlJ10gPSB0aGlzLmhtYWMgKEpTT04uc3RyaW5naWZ5IChxdWVyeSksIHRoaXMuc2VjcmV0KTtcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgXzFidGN4ZSA9IGV4dGVuZCAoY3J5cHRvY2FwaXRhbCwge1xuXG4gICAgJ2lkJzogJ18xYnRjeGUnLFxuICAgICduYW1lJzogJzFCVENYRScsXG4gICAgJ2NvdW50cmllcyc6ICdQQScsIC8vIFBhbmFtYVxuICAgICdjb21tZW50JzogJ0NyeXB0byBDYXBpdGFsIEFQSScsXG4gICAgJ3VybHMnOiB7IFxuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MDQ5LTJiMjk0NDA4LTVlY2MtMTFlNy04NWNjLWFkYWZmMDEzZGMxYS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vMWJ0Y3hlLmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vMWJ0Y3hlLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly8xYnRjeGUuY29tL2FwaS1kb2NzLnBocCcsXG4gICAgfSwgICAgXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ1VTRCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnLCB9LFxuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ0VVUicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInLCB9LFxuICAgICAgICAnQlRDL0NOWSc6IHsgJ2lkJzogJ0NOWScsICdzeW1ib2wnOiAnQlRDL0NOWScsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDTlknLCB9LFxuICAgICAgICAnQlRDL1JVQic6IHsgJ2lkJzogJ1JVQicsICdzeW1ib2wnOiAnQlRDL1JVQicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdSVUInLCB9LFxuICAgICAgICAnQlRDL0NIRic6IHsgJ2lkJzogJ0NIRicsICdzeW1ib2wnOiAnQlRDL0NIRicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDSEYnLCB9LFxuICAgICAgICAnQlRDL0pQWSc6IHsgJ2lkJzogJ0pQWScsICdzeW1ib2wnOiAnQlRDL0pQWScsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdKUFknLCB9LFxuICAgICAgICAnQlRDL0dCUCc6IHsgJ2lkJzogJ0dCUCcsICdzeW1ib2wnOiAnQlRDL0dCUCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdHQlAnLCB9LFxuICAgICAgICAnQlRDL0NBRCc6IHsgJ2lkJzogJ0NBRCcsICdzeW1ib2wnOiAnQlRDL0NBRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDQUQnLCB9LFxuICAgICAgICAnQlRDL0FVRCc6IHsgJ2lkJzogJ0FVRCcsICdzeW1ib2wnOiAnQlRDL0FVRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdBVUQnLCB9LFxuICAgICAgICAnQlRDL0FFRCc6IHsgJ2lkJzogJ0FFRCcsICdzeW1ib2wnOiAnQlRDL0FFRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdBRUQnLCB9LFxuICAgICAgICAnQlRDL0JHTic6IHsgJ2lkJzogJ0JHTicsICdzeW1ib2wnOiAnQlRDL0JHTicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdCR04nLCB9LFxuICAgICAgICAnQlRDL0NaSyc6IHsgJ2lkJzogJ0NaSycsICdzeW1ib2wnOiAnQlRDL0NaSycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDWksnLCB9LFxuICAgICAgICAnQlRDL0RLSyc6IHsgJ2lkJzogJ0RLSycsICdzeW1ib2wnOiAnQlRDL0RLSycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdES0snLCB9LFxuICAgICAgICAnQlRDL0hLRCc6IHsgJ2lkJzogJ0hLRCcsICdzeW1ib2wnOiAnQlRDL0hLRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdIS0QnLCB9LFxuICAgICAgICAnQlRDL0hSSyc6IHsgJ2lkJzogJ0hSSycsICdzeW1ib2wnOiAnQlRDL0hSSycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdIUksnLCB9LFxuICAgICAgICAnQlRDL0hVRic6IHsgJ2lkJzogJ0hVRicsICdzeW1ib2wnOiAnQlRDL0hVRicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdIVUYnLCB9LFxuICAgICAgICAnQlRDL0lMUyc6IHsgJ2lkJzogJ0lMUycsICdzeW1ib2wnOiAnQlRDL0lMUycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdJTFMnLCB9LFxuICAgICAgICAnQlRDL0lOUic6IHsgJ2lkJzogJ0lOUicsICdzeW1ib2wnOiAnQlRDL0lOUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdJTlInLCB9LFxuICAgICAgICAnQlRDL01VUic6IHsgJ2lkJzogJ01VUicsICdzeW1ib2wnOiAnQlRDL01VUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdNVVInLCB9LFxuICAgICAgICAnQlRDL01YTic6IHsgJ2lkJzogJ01YTicsICdzeW1ib2wnOiAnQlRDL01YTicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdNWE4nLCB9LFxuICAgICAgICAnQlRDL05PSyc6IHsgJ2lkJzogJ05PSycsICdzeW1ib2wnOiAnQlRDL05PSycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdOT0snLCB9LFxuICAgICAgICAnQlRDL05aRCc6IHsgJ2lkJzogJ05aRCcsICdzeW1ib2wnOiAnQlRDL05aRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdOWkQnLCB9LFxuICAgICAgICAnQlRDL1BMTic6IHsgJ2lkJzogJ1BMTicsICdzeW1ib2wnOiAnQlRDL1BMTicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdQTE4nLCB9LFxuICAgICAgICAnQlRDL1JPTic6IHsgJ2lkJzogJ1JPTicsICdzeW1ib2wnOiAnQlRDL1JPTicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdST04nLCB9LFxuICAgICAgICAnQlRDL1NFSyc6IHsgJ2lkJzogJ1NFSycsICdzeW1ib2wnOiAnQlRDL1NFSycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdTRUsnLCB9LFxuICAgICAgICAnQlRDL1NHRCc6IHsgJ2lkJzogJ1NHRCcsICdzeW1ib2wnOiAnQlRDL1NHRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdTR0QnLCB9LFxuICAgICAgICAnQlRDL1RIQic6IHsgJ2lkJzogJ1RIQicsICdzeW1ib2wnOiAnQlRDL1RIQicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdUSEInLCB9LFxuICAgICAgICAnQlRDL1RSWSc6IHsgJ2lkJzogJ1RSWScsICdzeW1ib2wnOiAnQlRDL1RSWScsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdUUlknLCB9LFxuICAgICAgICAnQlRDL1pBUic6IHsgJ2lkJzogJ1pBUicsICdzeW1ib2wnOiAnQlRDL1pBUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdaQVInLCB9LFxuICAgIH0sXG59KVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBhbnhwcm8gPSB7XG5cbiAgICAnaWQnOiAnYW54cHJvJyxcbiAgICAnbmFtZSc6ICdBTlhQcm8nLFxuICAgICdjb3VudHJpZXMnOiBbICdKUCcsICdTRycsICdISycsICdOWicsIF0sXG4gICAgJ3ZlcnNpb24nOiAnMicsXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjU5ODMtZmQ4NTk1ZGEtNWVjOS0xMWU3LTgyZTMtYWRiM2FiOGMyNjEyLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hbnhwcm8uY29tL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9hbnhwcm8uY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2FueHByby5jb20vcGFnZXMvYXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICd7Y3VycmVuY3lfcGFpcn0vbW9uZXkvdGlja2VyJyxcbiAgICAgICAgICAgICAgICAne2N1cnJlbmN5X3BhaXJ9L21vbmV5L2RlcHRoL2Z1bGwnLFxuICAgICAgICAgICAgICAgICd7Y3VycmVuY3lfcGFpcn0vbW9uZXkvdHJhZGUvZmV0Y2gnLCAvLyBkaXNhYmxlZCBieSBBTlhQcm9cbiAgICAgICAgICAgIF0sICAgIFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICd7Y3VycmVuY3lfcGFpcn0vbW9uZXkvb3JkZXIvYWRkJyxcbiAgICAgICAgICAgICAgICAne2N1cnJlbmN5X3BhaXJ9L21vbmV5L29yZGVyL2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ3tjdXJyZW5jeV9wYWlyfS9tb25leS9vcmRlci9xdW90ZScsXG4gICAgICAgICAgICAgICAgJ3tjdXJyZW5jeV9wYWlyfS9tb25leS9vcmRlci9yZXN1bHQnLFxuICAgICAgICAgICAgICAgICd7Y3VycmVuY3lfcGFpcn0vbW9uZXkvb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnbW9uZXkve2N1cnJlbmN5fS9hZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnbW9uZXkve2N1cnJlbmN5fS9zZW5kX3NpbXBsZScsXG4gICAgICAgICAgICAgICAgJ21vbmV5L2luZm8nLFxuICAgICAgICAgICAgICAgICdtb25leS90cmFkZS9saXN0JyxcbiAgICAgICAgICAgICAgICAnbW9uZXkvd2FsbGV0L2hpc3RvcnknLFxuICAgICAgICAgICAgXSwgICAgXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvVVNEJzogeyAnaWQnOiAnQlRDVVNEJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0JUQy9IS0QnOiB7ICdpZCc6ICdCVENIS0QnLCAnc3ltYm9sJzogJ0JUQy9IS0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSEtEJyB9LFxuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ0JUQ0VVUicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdCVEMvQ0FEJzogeyAnaWQnOiAnQlRDQ0FEJywgJ3N5bWJvbCc6ICdCVEMvQ0FEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NBRCcgfSxcbiAgICAgICAgJ0JUQy9BVUQnOiB7ICdpZCc6ICdCVENBVUQnLCAnc3ltYm9sJzogJ0JUQy9BVUQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQVVEJyB9LFxuICAgICAgICAnQlRDL1NHRCc6IHsgJ2lkJzogJ0JUQ1NHRCcsICdzeW1ib2wnOiAnQlRDL1NHRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdTR0QnIH0sXG4gICAgICAgICdCVEMvSlBZJzogeyAnaWQnOiAnQlRDSlBZJywgJ3N5bWJvbCc6ICdCVEMvSlBZJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ0JUQy9HQlAnOiB7ICdpZCc6ICdCVENHQlAnLCAnc3ltYm9sJzogJ0JUQy9HQlAnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnR0JQJyB9LFxuICAgICAgICAnQlRDL05aRCc6IHsgJ2lkJzogJ0JUQ05aRCcsICdzeW1ib2wnOiAnQlRDL05aRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdOWkQnIH0sXG4gICAgICAgICdMVEMvQlRDJzogeyAnaWQnOiAnTFRDQlRDJywgJ3N5bWJvbCc6ICdMVEMvQlRDJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0RPR0UvQlRDJzogeyAnaWQnOiAnRE9HRUJUQycsICdzeW1ib2wnOiAnRE9HRS9CVEMnLCAnYmFzZSc6ICdET0dFJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ1NUUi9CVEMnOiB7ICdpZCc6ICdTVFJCVEMnLCAnc3ltYm9sJzogJ1NUUi9CVEMnLCAnYmFzZSc6ICdTVFInLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnWFJQL0JUQyc6IHsgJ2lkJzogJ1hSUEJUQycsICdzeW1ib2wnOiAnWFJQL0JUQycsICdiYXNlJzogJ1hSUCcsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0TW9uZXlJbmZvICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEN1cnJlbmN5UGFpck1vbmV5RGVwdGhGdWxsICh7XG4gICAgICAgICAgICAnY3VycmVuY3lfcGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSByZXNwb25zZVsnZGF0YSddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKG9yZGVyYm9va1snZGF0YVVwZGF0ZVRpbWUnXSkgLyAxMDAwO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbJ3ByaWNlJ10pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsnYW1vdW50J10pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRDdXJyZW5jeVBhaXJNb25leVRpY2tlciAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ2RhdGEnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50ICh0aWNrZXJbJ2RhdGFVcGRhdGVUaW1lJ10gLyAxMDAwKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddWyd2YWx1ZSddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddWyd2YWx1ZSddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddWyd2YWx1ZSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSlbJ3ZhbHVlJ10sXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddWyd2YWx1ZSddKSxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXVsndmFsdWUnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXZnJ11bJ3ZhbHVlJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddWyd2YWx1ZSddKSxcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0Q3VycmVuY3lQYWlyTW9uZXlUcmFkZUZldGNoICh7XG4gICAgICAgICAgICAnY3VycmVuY3lfcGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnY3VycmVuY3lfcGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdhbW91bnRfaW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlX2ludCddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0Q3VycmVuY3lQYWlyT3JkZXJBZGQgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIG5vbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgcmVxdWVzdCA9IHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHJlcXVlc3Q7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoeyAnbm9uY2UnOiBub25jZSB9LCBxdWVyeSkpO1xuICAgICAgICAgICAgbGV0IHNlY3JldCA9IHRoaXMuYmFzZTY0VG9CaW5hcnkgKHRoaXMuc2VjcmV0KTtcbiAgICAgICAgICAgIGxldCBhdXRoID0gcmVxdWVzdCArIFwiXFwwXCIgKyBib2R5O1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ1Jlc3QtS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1Jlc3QtU2lnbic6IHRoaXMuaG1hYyAoYXV0aCwgc2VjcmV0LCAnc2hhNTEyJywgJ2Jhc2U2NCcpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdDJjID0ge1xuXG4gICAgJ2lkJzogJ2JpdDJjJyxcbiAgICAnbmFtZSc6ICdCaXQyQycsXG4gICAgJ2NvdW50cmllcyc6ICdJTCcsIC8vIElzcmFlbFxuICAgICdyYXRlTGltaXQnOiAzMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MTE5LTM1OTMyMjBlLTVlY2UtMTFlNy04YjNhLTVhMDQxZjZiY2MzZi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vd3d3LmJpdDJjLmNvLmlsJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5iaXQyYy5jby5pbCcsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cuYml0MmMuY28uaWwvaG9tZS9hcGknLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9PZmVyRS9iaXQyYycsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnRXhjaGFuZ2VzL3twYWlyfS9UaWNrZXInLFxuICAgICAgICAgICAgICAgICdFeGNoYW5nZXMve3BhaXJ9L29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ0V4Y2hhbmdlcy97cGFpcn0vdHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ0FjY291bnQvQmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ0FjY291bnQvQmFsYW5jZS92MicsXG4gICAgICAgICAgICAgICAgJ01lcmNoYW50L0NyZWF0ZUNoZWNrb3V0JyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvQWNjb3VudEhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdPcmRlci9BZGRDb2luRnVuZHNSZXF1ZXN0JyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvQWRkRnVuZCcsXG4gICAgICAgICAgICAgICAgJ09yZGVyL0FkZE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvQWRkT3JkZXJNYXJrZXRQcmljZUJ1eScsXG4gICAgICAgICAgICAgICAgJ09yZGVyL0FkZE9yZGVyTWFya2V0UHJpY2VTZWxsJyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvQ2FuY2VsT3JkZXInLFxuICAgICAgICAgICAgICAgICdPcmRlci9NeU9yZGVycycsXG4gICAgICAgICAgICAgICAgJ1BheW1lbnQvR2V0TXlJZCcsXG4gICAgICAgICAgICAgICAgJ1BheW1lbnQvU2VuZCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL05JUyc6IHsgJ2lkJzogJ0J0Y05pcycsICdzeW1ib2wnOiAnQlRDL05JUycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdOSVMnIH0sXG4gICAgICAgICdMVEMvQlRDJzogeyAnaWQnOiAnTHRjQnRjJywgJ3N5bWJvbCc6ICdMVEMvQlRDJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0xUQy9OSVMnOiB7ICdpZCc6ICdMdGNOaXMnLCAnc3ltYm9sJzogJ0xUQy9OSVMnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnTklTJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEFjY291bnRCYWxhbmNlVjIgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEV4Y2hhbmdlc1BhaXJPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gb3JkZXJbMF07XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IG9yZGVyWzFdO1xuICAgICAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBvcmRlclsyXSAqIDEwMDA7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCwgdGltZXN0YW1wIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEV4Y2hhbmdlc1BhaXJUaWNrZXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbCddKSxcbiAgICAgICAgICAgICdiaWQnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXNrJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsbCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogcGFyc2VGbG9hdCAodGlja2VyWydhdiddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydhJ10pLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRFeGNoYW5nZXNQYWlyVHJhZGVzICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0T3JkZXJBZGRPcmRlcic7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdBbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAnUGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHtcbiAgICAgICAgICAgIG1ldGhvZCArPSAnTWFya2V0UHJpY2UnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9yZGVyWydQcmljZSddID0gcHJpY2U7XG4gICAgICAgICAgICBvcmRlclsnVG90YWwnXSA9IGFtb3VudCAqIHByaWNlO1xuICAgICAgICAgICAgb3JkZXJbJ0lzQmlkJ10gPSAoc2lkZSA9PSAnYnV5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy5qc29uJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoeyAnbm9uY2UnOiBub25jZSB9LCBwYXJhbXMpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ3NpZ24nOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJywgJ2Jhc2U2NCcpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdGJheSA9IHtcblxuICAgICdpZCc6ICdiaXRiYXknLFxuICAgICduYW1lJzogJ0JpdEJheScsXG4gICAgJ2NvdW50cmllcyc6IFsgJ1BMJywgJ0VVJywgXSwgLy8gUG9sYW5kXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYxMzItOTc4YTdiZDgtNWVjZS0xMWU3LTk1NDAtYmM5NmQxZTliYmI4LmpwZycsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9iaXRiYXkubmV0JyxcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdwdWJsaWMnOiAnaHR0cHM6Ly9iaXRiYXkubmV0L0FQSS9QdWJsaWMnLFxuICAgICAgICAgICAgJ3ByaXZhdGUnOiAnaHR0cHM6Ly9iaXRiYXkubmV0L0FQSS9UcmFkaW5nL3RyYWRpbmdBcGkucGhwJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL2JpdGJheS5uZXQvcHVibGljLWFwaScsXG4gICAgICAgICAgICAnaHR0cHM6Ly9iaXRiYXkubmV0L2FjY291bnQvdGFiLWFwaScsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL0JpdEJheU5ldC9BUEknLFxuICAgICAgICBdLCBcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICd7aWR9L2FsbCcsXG4gICAgICAgICAgICAgICAgJ3tpZH0vbWFya2V0JyxcbiAgICAgICAgICAgICAgICAne2lkfS9vcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICd7aWR9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3tpZH0vdHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2luZm8nLFxuICAgICAgICAgICAgICAgICd0cmFkZScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICdoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7ICBcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdCVENVU0QnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ0JUQ0VVUicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdCVEMvUExOJzogeyAnaWQnOiAnQlRDUExOJywgJ3N5bWJvbCc6ICdCVEMvUExOJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1BMTicgfSxcbiAgICAgICAgJ0xUQy9VU0QnOiB7ICdpZCc6ICdMVENVU0QnLCAnc3ltYm9sJzogJ0xUQy9VU0QnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnTFRDL0VVUic6IHsgJ2lkJzogJ0xUQ0VVUicsICdzeW1ib2wnOiAnTFRDL0VVUicsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdMVEMvUExOJzogeyAnaWQnOiAnTFRDUExOJywgJ3N5bWJvbCc6ICdMVEMvUExOJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ1BMTicgfSxcbiAgICAgICAgJ0xUQy9CVEMnOiB7ICdpZCc6ICdMVENCVEMnLCAnc3ltYm9sJzogJ0xUQy9CVEMnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnRVRIL1VTRCc6IHsgJ2lkJzogJ0VUSFVTRCcsICdzeW1ib2wnOiAnRVRIL1VTRCcsICdiYXNlJzogJ0VUSCcsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdFVEgvRVVSJzogeyAnaWQnOiAnRVRIRVVSJywgJ3N5bWJvbCc6ICdFVEgvRVVSJywgJ2Jhc2UnOiAnRVRIJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICAgICAgJ0VUSC9QTE4nOiB7ICdpZCc6ICdFVEhQTE4nLCAnc3ltYm9sJzogJ0VUSC9QTE4nLCAnYmFzZSc6ICdFVEgnLCAncXVvdGUnOiAnUExOJyB9LFxuICAgICAgICAnRVRIL0JUQyc6IHsgJ2lkJzogJ0VUSEJUQycsICdzeW1ib2wnOiAnRVRIL0JUQycsICdiYXNlJzogJ0VUSCcsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMU0svVVNEJzogeyAnaWQnOiAnTFNLVVNEJywgJ3N5bWJvbCc6ICdMU0svVVNEJywgJ2Jhc2UnOiAnTFNLJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0xTSy9FVVInOiB7ICdpZCc6ICdMU0tFVVInLCAnc3ltYm9sJzogJ0xTSy9FVVInLCAnYmFzZSc6ICdMU0snLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgICAgICAnTFNLL1BMTic6IHsgJ2lkJzogJ0xTS1BMTicsICdzeW1ib2wnOiAnTFNLL1BMTicsICdiYXNlJzogJ0xTSycsICdxdW90ZSc6ICdQTE4nIH0sXG4gICAgICAgICdMU0svQlRDJzogeyAnaWQnOiAnTFNLQlRDJywgJ3N5bWJvbCc6ICdMU0svQlRDJywgJ2Jhc2UnOiAnTFNLJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHsgXG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0SWRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogb3JkZXJib29rWydiaWRzJ10sXG4gICAgICAgICAgICAnYXNrcyc6IG9yZGVyYm9va1snYXNrcyddLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0SWRUaWNrZXIgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWF4J10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWluJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2F2ZXJhZ2UnXSksXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRJZFRyYWRlcyAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IHBbJ2Jhc2UnXSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncGF5bWVudF9jdXJyZW5jeSc6IHBbJ3F1b3RlJ10sXG4gICAgICAgICAgICAncmF0ZSc6IHByaWNlLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV07XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpICsgJy5qc29uJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbWV0aG9kJzogcGF0aCxcbiAgICAgICAgICAgICAgICAnbW9tZW50JzogdGhpcy5ub25jZSAoKSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0FQSS1LZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnQVBJLUhhc2gnOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0YmF5cyA9IHtcblxuICAgICdpZCc6ICdiaXRiYXlzJyxcbiAgICAnbmFtZSc6ICdCaXRCYXlzJyxcbiAgICAnY291bnRyaWVzJzogWyAnQ04nLCAnR0InLCAnSEsnLCAnQVUnLCAnQ0EnIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3ODA4NTk5LTk4MzY4N2QyLTYwNTEtMTFlNy04ZDk1LTgwZGZjYmU1Y2JiNC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYml0YmF5cy5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2JpdGJheXMuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2JpdGJheXMuY29tL2hlbHAvYXBpLycsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnZGVwdGgnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnaW5mbycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAndHJhZGUnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdidGNfdXNkJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0JUQy9DTlknOiB7ICdpZCc6ICdidGNfY255JywgJ3N5bWJvbCc6ICdCVEMvQ05ZJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ09EUy9CVEMnOiB7ICdpZCc6ICdvZHNfYnRjJywgJ3N5bWJvbCc6ICdPRFMvQlRDJywgJ2Jhc2UnOiAnT0RTJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0xTSy9CVEMnOiB7ICdpZCc6ICdsc2tfYnRjJywgJ3N5bWJvbCc6ICdMU0svQlRDJywgJ2Jhc2UnOiAnTFNLJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0xTSy9DTlknOiB7ICdpZCc6ICdsc2tfY255JywgJ3N5bWJvbCc6ICdMU0svQ05ZJywgJ2Jhc2UnOiAnTFNLJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXREZXB0aCAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSByZXNwb25zZVsncmVzdWx0J107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWzBdKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbMV0pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydyZXN1bHQnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnb3AnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHtcbiAgICAgICAgICAgIG9yZGVyWydvcmRlcl90eXBlJ10gPSAxO1xuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9yZGVyWydvcmRlcl90eXBlJ10gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VHJhZGUgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdTaWduJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdGNvaW5jb2lkID0ge1xuXG4gICAgJ2lkJzogJ2JpdGNvaW5jb2lkJyxcbiAgICAnbmFtZSc6ICdCaXRjb2luLmNvLmlkJyxcbiAgICAnY291bnRyaWVzJzogJ0lEJywgLy8gSW5kb25lc2lhXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYxMzgtMDQzYzc3ODYtNWVjZi0xMWU3LTg4MmItODA5YzE0ZjM4YjUzLmpwZycsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAncHVibGljJzogJ2h0dHBzOi8vdmlwLmJpdGNvaW4uY28uaWQvYXBpJyxcbiAgICAgICAgICAgICdwcml2YXRlJzogJ2h0dHBzOi8vdmlwLmJpdGNvaW4uY28uaWQvdGFwaScsXG4gICAgICAgIH0sXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuYml0Y29pbi5jby5pZCcsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly92aXAuYml0Y29pbi5jby5pZC90cmFkZV9hcGknLFxuICAgICAgICAgICAgJ2h0dHBzOi8vdmlwLmJpdGNvaW4uY28uaWQvZG93bmxvYWRzL0JJVENPSU5DT0lELUFQSS1ET0NVTUVOVEFUSU9OLnBkZicsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAne3BhaXJ9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3twYWlyfS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICd7cGFpcn0vZGVwdGgnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnZ2V0SW5mbycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAndHJhZGVIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnb3Blbk9yZGVycycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvSURSJzogIHsgJ2lkJzogJ2J0Y19pZHInLCAnc3ltYm9sJzogJ0JUQy9JRFInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSURSJywgJ2Jhc2VJZCc6ICdidGMnLCAncXVvdGVJZCc6ICdpZHInIH0sXG4gICAgICAgICdCVFMvQlRDJzogIHsgJ2lkJzogJ2J0c19idGMnLCAnc3ltYm9sJzogJ0JUUy9CVEMnLCAnYmFzZSc6ICdCVFMnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdidHMnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdEQVNIL0JUQyc6IHsgJ2lkJzogJ2Rya19idGMnLCAnc3ltYm9sJzogJ0RBU0gvQlRDJywgJ2Jhc2UnOiAnREFTSCcsICdxdW90ZSc6ICdCVEMnLCAnYmFzZUlkJzogJ2RyaycsICdxdW90ZUlkJzogJ2J0YycgfSxcbiAgICAgICAgJ0RPR0UvQlRDJzogeyAnaWQnOiAnZG9nZV9idGMnLCAnc3ltYm9sJzogJ0RPR0UvQlRDJywgJ2Jhc2UnOiAnRE9HRScsICdxdW90ZSc6ICdCVEMnLCAnYmFzZUlkJzogJ2RvZ2UnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdFVEgvQlRDJzogIHsgJ2lkJzogJ2V0aF9idGMnLCAnc3ltYm9sJzogJ0VUSC9CVEMnLCAnYmFzZSc6ICdFVEgnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdldGgnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdMVEMvQlRDJzogIHsgJ2lkJzogJ2x0Y19idGMnLCAnc3ltYm9sJzogJ0xUQy9CVEMnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdsdGMnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdOWFQvQlRDJzogIHsgJ2lkJzogJ254dF9idGMnLCAnc3ltYm9sJzogJ05YVC9CVEMnLCAnYmFzZSc6ICdOWFQnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdueHQnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdTVFIvQlRDJzogIHsgJ2lkJzogJ3N0cl9idGMnLCAnc3ltYm9sJzogJ1NUUi9CVEMnLCAnYmFzZSc6ICdTVFInLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdzdHInLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdORU0vQlRDJzogIHsgJ2lkJzogJ25lbV9idGMnLCAnc3ltYm9sJzogJ05FTS9CVEMnLCAnYmFzZSc6ICdORU0nLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICduZW0nLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdYUlAvQlRDJzogIHsgJ2lkJzogJ3hycF9idGMnLCAnc3ltYm9sJzogJ1hSUC9CVEMnLCAnYmFzZSc6ICdYUlAnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICd4cnAnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0R2V0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0UGFpckRlcHRoICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0geyAnYmlkcyc6ICdidXknLCAnYXNrcyc6ICdzZWxsJyB9O1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChzaWRlcyk7XG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwga2V5cy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgbGV0IGtleSA9IGtleXNba107XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW2tleV07XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbMF0pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsxXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwYWlyID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQYWlyVGlja2VyICh7XG4gICAgICAgICAgICAncGFpcic6IHBhaXJbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3RpY2tlciddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VGbG9hdCAodGlja2VyWydzZXJ2ZXJfdGltZSddKSAqIDEwMDA7XG4gICAgICAgIGxldCBiYXNlVm9sdW1lID0gJ3ZvbF8nICsgcGFpclsnYmFzZUlkJ10udG9Mb3dlckNhc2UgKCk7XG4gICAgICAgIGxldCBxdW90ZVZvbHVtZSA9ICd2b2xfJyArIHBhaXJbJ3F1b3RlSWQnXS50b0xvd2VyQ2FzZSAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXZlcmFnZSddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyW2Jhc2VWb2x1bWVdKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlcltxdW90ZVZvbHVtZV0pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFBhaXJUcmFkZXMgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3BhaXInOiBwWydpZCddLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UsXG4gICAgICAgIH07XG4gICAgICAgIGxldCBiYXNlID0gcFsnYmFzZSddLnRvTG93ZXJDYXNlICgpO1xuICAgICAgICBvcmRlcltiYXNlXSA9IGFtb3VudDtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV07XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdtZXRob2QnOiBwYXRoLFxuICAgICAgICAgICAgICAgICdub25jZSc6IHRoaXMubm9uY2UgKCksXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdLZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnU2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXRmaW5leCA9IHtcblxuICAgICdpZCc6ICdiaXRmaW5leCcsXG4gICAgJ25hbWUnOiAnQml0ZmluZXgnLFxuICAgICdjb3VudHJpZXMnOiAnVVMnLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjI0NC1lMzI4YTUwYy01ZWQyLTExZTctOTQ3Yi0wNDE0MTY1NzliYjMuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5iaXRmaW5leC5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmJpdGZpbmV4LmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9iaXRmaW5leC5yZWFkbWUuaW8vdjEvZG9jcycsXG4gICAgICAgICAgICAnaHR0cHM6Ly9iaXRmaW5leC5yZWFkbWUuaW8vdjIvZG9jcycsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL2JpdGZpbmV4Y29tL2JpdGZpbmV4LWFwaS1ub2RlJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdib29rL3tzeW1ib2x9JyxcbiAgICAgICAgICAgICAgICAnY2FuZGxlcy97c3ltYm9sfScsXG4gICAgICAgICAgICAgICAgJ2xlbmRib29rL3tjdXJyZW5jeX0nLFxuICAgICAgICAgICAgICAgICdsZW5kcy97Y3VycmVuY3l9JyxcbiAgICAgICAgICAgICAgICAncHVidGlja2VyL3tzeW1ib2x9JyxcbiAgICAgICAgICAgICAgICAnc3RhdHMve3N5bWJvbH0nLFxuICAgICAgICAgICAgICAgICdzeW1ib2xzJyxcbiAgICAgICAgICAgICAgICAnc3ltYm9sc19kZXRhaWxzJyxcbiAgICAgICAgICAgICAgICAndG9kYXknLFxuICAgICAgICAgICAgICAgICd0cmFkZXMve3N5bWJvbH0nLCAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRfaW5mb3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2Jhc2tldF9tYW5hZ2UnLFxuICAgICAgICAgICAgICAgICdjcmVkaXRzJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdC9uZXcnLFxuICAgICAgICAgICAgICAgICdmdW5kaW5nL2Nsb3NlJyxcbiAgICAgICAgICAgICAgICAnaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ2hpc3RvcnkvbW92ZW1lbnRzJyxcbiAgICAgICAgICAgICAgICAna2V5X2luZm8nLFxuICAgICAgICAgICAgICAgICdtYXJnaW5faW5mb3MnLFxuICAgICAgICAgICAgICAgICdteXRyYWRlcycsXG4gICAgICAgICAgICAgICAgJ29mZmVyL2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29mZmVyL25ldycsXG4gICAgICAgICAgICAgICAgJ29mZmVyL3N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ29mZmVycycsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NhbmNlbC9hbGwnLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwvbXVsdGknLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwvcmVwbGFjZScsXG4gICAgICAgICAgICAgICAgJ29yZGVyL25ldycsXG4gICAgICAgICAgICAgICAgJ29yZGVyL25ldy9tdWx0aScsXG4gICAgICAgICAgICAgICAgJ29yZGVyL3N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL2NsYWltJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb25zJyxcbiAgICAgICAgICAgICAgICAnc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJ3Rha2VuX2Z1bmRzJyxcbiAgICAgICAgICAgICAgICAndG90YWxfdGFrZW5fZnVuZHMnLFxuICAgICAgICAgICAgICAgICd0cmFuc2ZlcicsXG4gICAgICAgICAgICAgICAgJ3VudXNlZF90YWtlbl9mdW5kcycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFN5bWJvbHNEZXRhaWxzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydwYWlyJ10udG9VcHBlckNhc2UgKCk7XG4gICAgICAgICAgICBsZXQgYmFzZSA9IGlkLnNsaWNlICgwLCAzKTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IGlkLnNsaWNlICgzLCA2KTtcbiAgICAgICAgICAgIGlmIChiYXNlID09ICdEU0gnKSAvLyBpc3N1ZSAjNCBCaXRmaW5leCBuYW1lcyBEYXNoIGFzIERTSCwgaW5zdGVhZCBvZiBEQVNIXG4gICAgICAgICAgICAgICAgYmFzZSA9ICdEQVNIJ1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlcyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0Qm9va1N5bWJvbCAoeyBcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IFsgJ2JpZHMnLCAnYXNrcycgXTtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBzaWRlcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1tzXTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlclsncHJpY2UnXSk7XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IHBhcnNlRmxvYXQgKG9yZGVyWydhbW91bnQnXSk7XG4gICAgICAgICAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50IChwYXJzZUZsb2F0IChvcmRlclsndGltZXN0YW1wJ10pKTtcbiAgICAgICAgICAgICAgICByZXN1bHRbc2lkZV0ucHVzaCAoWyBwcmljZSwgYW1vdW50LCB0aW1lc3RhbXAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0UHVidGlja2VyU3ltYm9sICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlRmxvYXQgKHRpY2tlclsndGltZXN0YW1wJ10pICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdF9wcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogcGFyc2VGbG9hdCAodGlja2VyWydtaWQnXSksXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlc1N5bWJvbCAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyTmV3ICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQudG9TdHJpbmcgKCksXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZS50b1N0cmluZyAoKSxcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICd0eXBlJzogJ2V4Y2hhbmdlICcgKyB0eXBlLFxuICAgICAgICAgICAgJ29jb29yZGVyJzogZmFsc2UsXG4gICAgICAgICAgICAnYnV5X3ByaWNlX29jbyc6IDAsXG4gICAgICAgICAgICAnc2VsbF9wcmljZV9vY28nOiAwLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHJlcXVlc3QgPSAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyByZXF1ZXN0O1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykgeyAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZS50b1N0cmluZyAoKSxcbiAgICAgICAgICAgICAgICAncmVxdWVzdCc6IHJlcXVlc3QsXG4gICAgICAgICAgICB9LCBxdWVyeSk7XG4gICAgICAgICAgICBsZXQgcGF5bG9hZCA9IHRoaXMuc3RyaW5nVG9CYXNlNjQgKEpTT04uc3RyaW5naWZ5IChxdWVyeSkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnWC1CRlgtQVBJS0VZJzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1gtQkZYLVBBWUxPQUQnOiBwYXlsb2FkLFxuICAgICAgICAgICAgICAgICdYLUJGWC1TSUdOQVRVUkUnOiB0aGlzLmhtYWMgKHBheWxvYWQsIHRoaXMuc2VjcmV0LCAnc2hhMzg0JyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0bGlzaCA9IHtcblxuICAgICdpZCc6ICdiaXRsaXNoJyxcbiAgICAnbmFtZSc6ICdiaXRsaXNoJyxcbiAgICAnY291bnRyaWVzJzogWyAnR0InLCAnRVUnLCAnUlUnLCBdLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLCAgICBcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYyNzUtZGNmYzZjMzAtNWVkMy0xMWU3LTgzOWQtMDBhODQ2Mzg1ZDBiLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9iaXRsaXNoLmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vYml0bGlzaC5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vYml0bGlzaC5jb20vYXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdpbnN0cnVtZW50cycsXG4gICAgICAgICAgICAgICAgJ29obGN2JyxcbiAgICAgICAgICAgICAgICAncGFpcnMnLFxuICAgICAgICAgICAgICAgICd0aWNrZXJzJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzX2RlcHRoJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzX2hpc3RvcnknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudHNfb3BlcmF0aW9ucycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfdHJhZGUnLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfdHJhZGVzX2J5X2lkcycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9hbGxfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnY3JlYXRlX2Jjb2RlJyxcbiAgICAgICAgICAgICAgICAnY3JlYXRlX3RlbXBsYXRlX3dhbGxldCcsXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZV90cmFkZScsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXQnLFxuICAgICAgICAgICAgICAgICdsaXN0X2FjY291bnRzX29wZXJhdGlvbnNfZnJvbV90cycsXG4gICAgICAgICAgICAgICAgJ2xpc3RfYWN0aXZlX3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2xpc3RfYmNvZGVzJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9teV9tYXRjaGVzX2Zyb21fdHMnLFxuICAgICAgICAgICAgICAgICdsaXN0X215X3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2xpc3RfbXlfdHJhZHNfZnJvbV90cycsXG4gICAgICAgICAgICAgICAgJ2xpc3RfcGF5bWVudF9tZXRob2RzJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9wYXltZW50cycsXG4gICAgICAgICAgICAgICAgJ3JlZGVlbV9jb2RlJyxcbiAgICAgICAgICAgICAgICAncmVzaWduJyxcbiAgICAgICAgICAgICAgICAnc2lnbmluJyxcbiAgICAgICAgICAgICAgICAnc2lnbm91dCcsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX2RldGFpbHMnLFxuICAgICAgICAgICAgICAgICd0cmFkZV9vcHRpb25zJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd19ieV9pZCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQYWlycyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0cyk7XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwga2V5cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1trZXlzW3BdXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ2lkJ107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gcHJvZHVjdFsnbmFtZSddO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VycyA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VycyAoKTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHRpY2tlcnNbcFsnaWQnXV07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWF4J10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWluJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhc2snOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogcGFyc2VGbG9hdCAodGlja2VyWydmaXJzdCddKSxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUcmFkZXNEZXB0aCAoe1xuICAgICAgICAgICAgJ3BhaXJfaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKHBhcnNlSW50IChvcmRlcmJvb2tbJ2xhc3QnXSkgLyAxMDAwKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0geyAnYmlkcyc6ICdiaWQnLCAnYXNrcyc6ICdhc2snIH07XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHNpZGVzKTtcbiAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBrZXlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICBsZXQga2V5ID0ga2V5c1trXTtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNba2V5XTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlclsncHJpY2UnXSk7XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IHBhcnNlRmxvYXQgKG9yZGVyWyd2b2x1bWUnXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlc0hpc3RvcnkgKHtcbiAgICAgICAgICAgICdwYWlyX2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBzaWduSW4gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFNpZ25pbiAoe1xuICAgICAgICAgICAgJ2xvZ2luJzogdGhpcy5sb2dpbixcbiAgICAgICAgICAgICdwYXNzd2QnOiB0aGlzLnBhc3N3b3JkLFxuICAgICAgICB9KTtcbiAgICB9LCAgICBcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAncGFpcl9pZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdkaXInOiAoc2lkZSA9PSAnYnV5JykgPyAnYmlkJyA6ICdhc2snLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0Q3JlYXRlVHJhZGUgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5ICh0aGlzLmV4dGVuZCAoeyAndG9rZW4nOiB0aGlzLmFwaUtleSB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdG1hcmtldCA9IHtcblxuICAgICdpZCc6ICdiaXRtYXJrZXQnLFxuICAgICduYW1lJzogJ0JpdE1hcmtldCcsXG4gICAgJ2NvdW50cmllcyc6IFsgJ1BMJywgJ0VVJywgXSxcbiAgICAncmF0ZUxpbWl0JzogMzAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NzI1Ni1hODU1NTIwMC01ZWY5LTExZTctOTZmZC00NjlhNjVlMmIwYmQuanBnJyxcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdwdWJsaWMnOiAnaHR0cHM6Ly93d3cuYml0bWFya2V0Lm5ldCcsXG4gICAgICAgICAgICAncHJpdmF0ZSc6ICdodHRwczovL3d3dy5iaXRtYXJrZXQucGwvYXBpMi8nLCAvLyBsYXN0IHNsYXNoIGlzIGNyaXRpY2FsXG4gICAgICAgIH0sXG4gICAgICAgICd3d3cnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cuYml0bWFya2V0LnBsJyxcbiAgICAgICAgICAgICdodHRwczovL3d3dy5iaXRtYXJrZXQubmV0JyxcbiAgICAgICAgXSxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3d3dy5iaXRtYXJrZXQubmV0L2RvY3MucGhwP2ZpbGU9YXBpX3B1YmxpYy5odG1sJyxcbiAgICAgICAgICAgICdodHRwczovL3d3dy5iaXRtYXJrZXQubmV0L2RvY3MucGhwP2ZpbGU9YXBpX3ByaXZhdGUuaHRtbCcsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL2JpdG1hcmtldC1uZXQvYXBpJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdqc29uL3ttYXJrZXR9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ2pzb24ve21hcmtldH0vb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAnanNvbi97bWFya2V0fS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdqc29uL2N0cmFuc2ZlcicsXG4gICAgICAgICAgICAgICAgJ2dyYXBocy97bWFya2V0fS85MG0nLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vNmgnLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vMWQnLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vN2QnLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vMW0nLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vM20nLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vNm0nLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vMXknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnaW5mbycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzJyxcbiAgICAgICAgICAgICAgICAndHJhZGluZ2Rlc2snLFxuICAgICAgICAgICAgICAgICd0cmFkaW5nZGVza1N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ3RyYWRpbmdkZXNrQ29uZmlybScsXG4gICAgICAgICAgICAgICAgJ2NyeXB0b3RyYWRpbmdkZXNrJyxcbiAgICAgICAgICAgICAgICAnY3J5cHRvdHJhZGluZ2Rlc2tTdGF0dXMnLFxuICAgICAgICAgICAgICAgICdjcnlwdG90cmFkaW5nZGVza0NvbmZpcm0nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3RmlhdCcsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3UExOUFAnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd0ZpYXRGYXN0JyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdCcsXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyJyxcbiAgICAgICAgICAgICAgICAndHJhbnNmZXJzJyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luTGlzdCcsXG4gICAgICAgICAgICAgICAgJ21hcmdpbk9wZW4nLFxuICAgICAgICAgICAgICAgICdtYXJnaW5DbG9zZScsXG4gICAgICAgICAgICAgICAgJ21hcmdpbkNhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ21hcmdpbk1vZGlmeScsXG4gICAgICAgICAgICAgICAgJ21hcmdpbkJhbGFuY2VBZGQnLFxuICAgICAgICAgICAgICAgICdtYXJnaW5CYWxhbmNlUmVtb3ZlJyxcbiAgICAgICAgICAgICAgICAnc3dhcExpc3QnLFxuICAgICAgICAgICAgICAgICdzd2FwT3BlbicsXG4gICAgICAgICAgICAgICAgJ3N3YXBDbG9zZScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1BMTic6IHsgJ2lkJzogJ0JUQ1BMTicsICdzeW1ib2wnOiAnQlRDL1BMTicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdQTE4nIH0sXG4gICAgICAgICdCVEMvRVVSJzogeyAnaWQnOiAnQlRDRVVSJywgJ3N5bWJvbCc6ICdCVEMvRVVSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICAgICAgJ0xUQy9QTE4nOiB7ICdpZCc6ICdMVENQTE4nLCAnc3ltYm9sJzogJ0xUQy9QTE4nLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnUExOJyB9LFxuICAgICAgICAnTFRDL0JUQyc6IHsgJ2lkJzogJ0xUQ0JUQycsICdzeW1ib2wnOiAnTFRDL0JUQycsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMTVgvQlRDJzogeyAnaWQnOiAnTGl0ZU1pbmVYQlRDJywgJ3N5bWJvbCc6ICdMTVgvQlRDJywgJ2Jhc2UnOiAnTE1YJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RJbmZvICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkgeyBcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0SnNvbk1hcmtldE9yZGVyYm9vayAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogb3JkZXJib29rWydiaWRzJ10sXG4gICAgICAgICAgICAnYXNrcyc6IG9yZGVyYm9va1snYXNrcyddLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRKc29uTWFya2V0VGlja2VyICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldEpzb25NYXJrZXRUcmFkZXMgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3JhdGUnOiBwcmljZSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddW3R5cGVdO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9ICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCArICcuanNvbicsIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAndG9uY2UnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnbWV0aG9kJzogcGF0aCxcbiAgICAgICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0FQSS1LZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnQVBJLUhhc2gnOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0bWV4ID0ge1xuXG4gICAgJ2lkJzogJ2JpdG1leCcsXG4gICAgJ25hbWUnOiAnQml0TUVYJyxcbiAgICAnY291bnRyaWVzJzogJ1NDJywgLy8gU2V5Y2hlbGxlc1xuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjMxOS1mNjUzYzZlNi01ZWQ0LTExZTctOTMzZC1mMGJjMzY5OWFlOGYuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5iaXRtZXguY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5iaXRtZXguY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3d3dy5iaXRtZXguY29tL2FwcC9hcGlPdmVydmlldycsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL0JpdE1FWC9hcGktY29ubmVjdG9ycy90cmVlL21hc3Rlci9vZmZpY2lhbC1odHRwJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdhbm5vdW5jZW1lbnQnLFxuICAgICAgICAgICAgICAgICdhbm5vdW5jZW1lbnQvdXJnZW50JyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZycsXG4gICAgICAgICAgICAgICAgJ2luc3RydW1lbnQnLFxuICAgICAgICAgICAgICAgICdpbnN0cnVtZW50L2FjdGl2ZScsXG4gICAgICAgICAgICAgICAgJ2luc3RydW1lbnQvYWN0aXZlQW5kSW5kaWNlcycsXG4gICAgICAgICAgICAgICAgJ2luc3RydW1lbnQvYWN0aXZlSW50ZXJ2YWxzJyxcbiAgICAgICAgICAgICAgICAnaW5zdHJ1bWVudC9jb21wb3NpdGVJbmRleCcsXG4gICAgICAgICAgICAgICAgJ2luc3RydW1lbnQvaW5kaWNlcycsXG4gICAgICAgICAgICAgICAgJ2luc3VyYW5jZScsXG4gICAgICAgICAgICAgICAgJ2xlYWRlcmJvYXJkJyxcbiAgICAgICAgICAgICAgICAnbGlxdWlkYXRpb24nLFxuICAgICAgICAgICAgICAgICdvcmRlckJvb2snLFxuICAgICAgICAgICAgICAgICdvcmRlckJvb2svTDInLFxuICAgICAgICAgICAgICAgICdxdW90ZScsXG4gICAgICAgICAgICAgICAgJ3F1b3RlL2J1Y2tldGVkJyxcbiAgICAgICAgICAgICAgICAnc2NoZW1hJyxcbiAgICAgICAgICAgICAgICAnc2NoZW1hL3dlYnNvY2tldEhlbHAnLFxuICAgICAgICAgICAgICAgICdzZXR0bGVtZW50JyxcbiAgICAgICAgICAgICAgICAnc3RhdHMnLFxuICAgICAgICAgICAgICAgICdzdGF0cy9oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAndHJhZGUnLFxuICAgICAgICAgICAgICAgICd0cmFkZS9idWNrZXRlZCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2FwaUtleScsXG4gICAgICAgICAgICAgICAgJ2NoYXQnLFxuICAgICAgICAgICAgICAgICdjaGF0L2NoYW5uZWxzJyxcbiAgICAgICAgICAgICAgICAnY2hhdC9jb25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgICdleGVjdXRpb24nLFxuICAgICAgICAgICAgICAgICdleGVjdXRpb24vdHJhZGVIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnbm90aWZpY2F0aW9uJyxcbiAgICAgICAgICAgICAgICAnb3JkZXInLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgJ3VzZXInLFxuICAgICAgICAgICAgICAgICd1c2VyL2FmZmlsaWF0ZVN0YXR1cycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvY2hlY2tSZWZlcnJhbENvZGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2NvbW1pc3Npb24nLFxuICAgICAgICAgICAgICAgICd1c2VyL2RlcG9zaXRBZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAndXNlci9tYXJnaW4nLFxuICAgICAgICAgICAgICAgICd1c2VyL21pbldpdGhkcmF3YWxGZWUnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0SGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0U3VtbWFyeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2FwaUtleScsXG4gICAgICAgICAgICAgICAgJ2FwaUtleS9kaXNhYmxlJyxcbiAgICAgICAgICAgICAgICAnYXBpS2V5L2VuYWJsZScsXG4gICAgICAgICAgICAgICAgJ2NoYXQnLFxuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2J1bGsnLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWxBbGxBZnRlcicsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2Nsb3NlUG9zaXRpb24nLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9pc29sYXRlJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vbGV2ZXJhZ2UnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9yaXNrTGltaXQnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi90cmFuc2Zlck1hcmdpbicsXG4gICAgICAgICAgICAgICAgJ3VzZXIvY2FuY2VsV2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvY29uZmlybUVtYWlsJyxcbiAgICAgICAgICAgICAgICAndXNlci9jb25maXJtRW5hYmxlVEZBJyxcbiAgICAgICAgICAgICAgICAndXNlci9jb25maXJtV2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZGlzYWJsZVRGQScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbG9nb3V0JyxcbiAgICAgICAgICAgICAgICAndXNlci9sb2dvdXRBbGwnLFxuICAgICAgICAgICAgICAgICd1c2VyL3ByZWZlcmVuY2VzJyxcbiAgICAgICAgICAgICAgICAndXNlci9yZXF1ZXN0RW5hYmxlVEZBJyxcbiAgICAgICAgICAgICAgICAndXNlci9yZXF1ZXN0V2l0aGRyYXdhbCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3B1dCc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXInLFxuICAgICAgICAgICAgICAgICdvcmRlci9idWxrJyxcbiAgICAgICAgICAgICAgICAndXNlcicsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlbGV0ZSc6IFtcbiAgICAgICAgICAgICAgICAnYXBpS2V5JyxcbiAgICAgICAgICAgICAgICAnb3JkZXInLFxuICAgICAgICAgICAgICAgICdvcmRlci9hbGwnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfVxuICAgIH0sIFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0SW5zdHJ1bWVudEFjdGl2ZSAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnc3ltYm9sJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ3VuZGVybHlpbmcnXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ3F1b3RlQ3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBpc0Z1dHVyZXNDb250cmFjdCA9IGlkICE9IChiYXNlICsgcXVvdGUpO1xuICAgICAgICAgICAgYmFzZSA9IHRoaXMuY29tbW9uQ3VycmVuY3lDb2RlIChiYXNlKTtcbiAgICAgICAgICAgIHF1b3RlID0gdGhpcy5jb21tb25DdXJyZW5jeUNvZGUgKHF1b3RlKTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBpc0Z1dHVyZXNDb250cmFjdCA/IGlkIDogKGJhc2UgKyAnLycgKyBxdW90ZSk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRVc2VyTWFyZ2luICh7ICdjdXJyZW5jeSc6ICdhbGwnIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRPcmRlckJvb2tMMiAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgZm9yIChsZXQgbyA9IDA7IG8gPCBvcmRlcmJvb2subGVuZ3RoOyBvKyspIHtcbiAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyYm9va1tvXTtcbiAgICAgICAgICAgIGxldCBzaWRlID0gKG9yZGVyWydzaWRlJ10gPT0gJ1NlbGwnKSA/ICdhc2tzJyA6ICdiaWRzJztcbiAgICAgICAgICAgIGxldCBhbW91bnQgPSBvcmRlclsnc2l6ZSddO1xuICAgICAgICAgICAgbGV0IHByaWNlID0gb3JkZXJbJ3ByaWNlJ107XG4gICAgICAgICAgICByZXN1bHRbc2lkZV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE8gc29ydCBiaWRzIGFuZCBhc2tzXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdiaW5TaXplJzogJzFkJyxcbiAgICAgICAgICAgICdwYXJ0aWFsJzogdHJ1ZSxcbiAgICAgICAgICAgICdjb3VudCc6IDEsXG4gICAgICAgICAgICAncmV2ZXJzZSc6IHRydWUsICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIGxldCBxdW90ZXMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFF1b3RlQnVja2V0ZWQgKHJlcXVlc3QpO1xuICAgICAgICBsZXQgcXVvdGVzTGVuZ3RoID0gcXVvdGVzLmxlbmd0aDtcbiAgICAgICAgbGV0IHF1b3RlID0gcXVvdGVzW3F1b3Rlc0xlbmd0aCAtIDFdO1xuICAgICAgICBsZXQgdGlja2VycyA9IGF3YWl0IHRoaXMucHVibGljR2V0VHJhZGVCdWNrZXRlZCAocmVxdWVzdCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSB0aWNrZXJzWzBdO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAocXVvdGVbJ2JpZFByaWNlJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHF1b3RlWydhc2tQcmljZSddKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWyd2d2FwJ10pLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2Nsb3NlJ10pLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydob21lTm90aW9uYWwnXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2ZvcmVpZ25Ob3Rpb25hbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZSAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3NpZGUnOiB0aGlzLmNhcGl0YWxpemUgKHNpZGUpLFxuICAgICAgICAgICAgJ29yZGVyUXR5JzogYW1vdW50LFxuICAgICAgICAgICAgJ29yZFR5cGUnOiB0aGlzLmNhcGl0YWxpemUgKHR5cGUpLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3JhdGUnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgcXVlcnkgPSAnL2FwaS8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgIHF1ZXJ5ICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHF1ZXJ5O1xuICAgICAgICBpZiAodHlwZSA9PSAncHJpdmF0ZScpIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBpZiAobWV0aG9kID09ICdQT1NUJylcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHBhcmFtcyk7XG4gICAgICAgICAgICBsZXQgcmVxdWVzdCA9IFsgbWV0aG9kLCBxdWVyeSwgbm9uY2UsIGJvZHkgfHwgJyddLmpvaW4gKCcnKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAnYXBpLW5vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ2FwaS1rZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnYXBpLXNpZ25hdHVyZSc6IHRoaXMuaG1hYyAocmVxdWVzdCwgdGhpcy5zZWNyZXQpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdHNvID0ge1xuXG4gICAgJ2lkJzogJ2JpdHNvJyxcbiAgICAnbmFtZSc6ICdCaXRzbycsXG4gICAgJ2NvdW50cmllcyc6ICdNWCcsIC8vIE1leGljb1xuICAgICdyYXRlTGltaXQnOiAyMDAwLCAvLyAzMCByZXF1ZXN0cyBwZXIgbWludXRlXG4gICAgJ3ZlcnNpb24nOiAndjMnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MzM1LTcxNWNlN2FhLTVlZDUtMTFlNy04OGE4LTE3M2EyN2JiMzBmZS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLmJpdHNvLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9iaXRzby5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vYml0c28uY29tL2FwaV9pbmZvJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdhdmFpbGFibGVfYm9va3MnLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLFxuICAgICAgICAgICAgICAgICdvcmRlcl9ib29rJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudF9zdGF0dXMnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnZmVlcycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRpbmdzJyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZ3Mve2ZpZH0nLFxuICAgICAgICAgICAgICAgICdmdW5kaW5nX2Rlc3RpbmF0aW9uJyxcbiAgICAgICAgICAgICAgICAna3ljX2RvY3VtZW50cycsXG4gICAgICAgICAgICAgICAgJ2xlZGdlcicsXG4gICAgICAgICAgICAgICAgJ2xlZGdlci90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdsZWRnZXIvZmVlcycsXG4gICAgICAgICAgICAgICAgJ2xlZGdlci9mdW5kaW5ncycsXG4gICAgICAgICAgICAgICAgJ2xlZGdlci93aXRoZHJhd2FscycsXG4gICAgICAgICAgICAgICAgJ214X2JhbmtfY29kZXMnLFxuICAgICAgICAgICAgICAgICdvcGVuX29yZGVycycsXG4gICAgICAgICAgICAgICAgJ29yZGVyX3RyYWRlcy97b2lkfScsXG4gICAgICAgICAgICAgICAgJ29yZGVycy97b2lkfScsXG4gICAgICAgICAgICAgICAgJ3VzZXJfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAndXNlcl90cmFkZXMve3RpZH0nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy8nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy97d2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2JpdGNvaW5fd2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ2RlYml0X2NhcmRfd2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ2V0aGVyX3dpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdwaG9uZV9udW1iZXInLFxuICAgICAgICAgICAgICAgICdwaG9uZV92ZXJpZmljYXRpb24nLFxuICAgICAgICAgICAgICAgICdwaG9uZV93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnc3BlaV93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICdvcmRlcnMve29pZH0nLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvYWxsJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0QXZhaWxhYmxlQm9va3MgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0c1sncGF5bG9hZCddLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWydwYXlsb2FkJ11bcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0Wydib29rJ107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gaWQudG9VcHBlckNhc2UgKCkucmVwbGFjZSAoJ18nLCAnLycpO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0T3JkZXJCb29rICh7XG4gICAgICAgICAgICAnYm9vayc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSByZXNwb25zZVsncGF5bG9hZCddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5wYXJzZTg2MDEgKG9yZGVyYm9va1sndXBkYXRlZF9hdCddKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWydwcmljZSddKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbJ2Ftb3VudCddKTtcbiAgICAgICAgICAgICAgICByZXN1bHRbc2lkZV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdib29rJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydwYXlsb2FkJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLnBhcnNlODYwMSAodGlja2VyWydjcmVhdGVkX2F0J10pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnc2lkZSc6IHNpZGUsXG4gICAgICAgICAgICAndHlwZSc6IHR5cGUsXG4gICAgICAgICAgICAnbWFqb3InOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVycyAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHF1ZXJ5O1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocGFyYW1zKTtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBsZXQgcmVxdWVzdCA9IFsgbm9uY2UsIG1ldGhvZCwgcXVlcnksIGJvZHkgfHwgJycgXS5qb2luICgnJyk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5obWFjIChyZXF1ZXN0LCB0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBsZXQgYXV0aCA9IHRoaXMuYXBpS2V5ICsgJzonICsgbm9uY2UgKyAnOicgKyBzaWduYXR1cmU7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnQXV0aG9yaXphdGlvbic6IFwiQml0c28gXCIgKyBhdXRoIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXRzdGFtcCA9IHtcblxuICAgICdpZCc6ICdiaXRzdGFtcCcsXG4gICAgJ25hbWUnOiAnQml0c3RhbXAnLFxuICAgICdjb3VudHJpZXMnOiAnR0InLFxuICAgICdyYXRlTGltaXQnOiAxMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YyJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc4NjM3Ny04YzhhYjU3ZS01ZmU5LTExZTctOGVhNC0yYjA1YjZiY2NlZWMuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5iaXRzdGFtcC5uZXQvYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5iaXRzdGFtcC5uZXQnLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vd3d3LmJpdHN0YW1wLm5ldC9hcGknLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ29yZGVyX2Jvb2sve2lkfS8nLFxuICAgICAgICAgICAgICAgICd0aWNrZXJfaG91ci97aWR9LycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlci97aWR9LycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucy97aWR9LycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlLycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Uve2lkfS8nLFxuICAgICAgICAgICAgICAgICdidXkve2lkfS8nLFxuICAgICAgICAgICAgICAgICdidXkvbWFya2V0L3tpZH0vJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVyLycsXG4gICAgICAgICAgICAgICAgJ2xpcXVpZGF0aW9uX2FkZHJlc3MvaW5mby8nLFxuICAgICAgICAgICAgICAgICdsaXF1aWRhdGlvbl9hZGRyZXNzL25ldy8nLFxuICAgICAgICAgICAgICAgICdvcGVuX29yZGVycy9hbGwvJyxcbiAgICAgICAgICAgICAgICAnb3Blbl9vcmRlcnMve2lkfS8nLFxuICAgICAgICAgICAgICAgICdzZWxsL3tpZH0vJyxcbiAgICAgICAgICAgICAgICAnc2VsbC9tYXJrZXQve2lkfS8nLFxuICAgICAgICAgICAgICAgICd0cmFuc2Zlci1mcm9tLW1haW4vJyxcbiAgICAgICAgICAgICAgICAndHJhbnNmZXItdG8tbWFpbi8nLFxuICAgICAgICAgICAgICAgICd1c2VyX3RyYW5zYWN0aW9ucy8nLFxuICAgICAgICAgICAgICAgICd1c2VyX3RyYW5zYWN0aW9ucy97aWR9LycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWwvY2FuY2VsLycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWwvb3Blbi8nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2FsL3N0YXR1cy8nLFxuICAgICAgICAgICAgICAgICd4cnBfYWRkcmVzcy8nLFxuICAgICAgICAgICAgICAgICd4cnBfd2l0aGRyYXdhbC8nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdidGN1c2QnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ2J0Y2V1cicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdFVVIvVVNEJzogeyAnaWQnOiAnZXVydXNkJywgJ3N5bWJvbCc6ICdFVVIvVVNEJywgJ2Jhc2UnOiAnRVVSJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ1hSUC9VU0QnOiB7ICdpZCc6ICd4cnB1c2QnLCAnc3ltYm9sJzogJ1hSUC9VU0QnLCAnYmFzZSc6ICdYUlAnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnWFJQL0VVUic6IHsgJ2lkJzogJ3hycGV1cicsICdzeW1ib2wnOiAnWFJQL0VVUicsICdiYXNlJzogJ1hSUCcsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdYUlAvQlRDJzogeyAnaWQnOiAneHJwYnRjJywgJ3N5bWJvbCc6ICdYUlAvQlRDJywgJ2Jhc2UnOiAnWFJQJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyQm9va0lkICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKG9yZGVyYm9va1sndGltZXN0YW1wJ10pICogMTAwMDtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWzBdKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbMV0pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VySWQgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAodGlja2VyWyd0aW1lc3RhbXAnXSkgKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFuc2FjdGlvbnNJZCAoeyBcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBcbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSk7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgbWV0aG9kICs9ICdNYXJrZXQnO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICBtZXRob2QgKz0gJ0lkJztcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBsZXQgYXV0aCA9IG5vbmNlICsgdGhpcy51aWQgKyB0aGlzLmFwaUtleTtcbiAgICAgICAgICAgIGxldCBzaWduYXR1cmUgPSB0aGlzLmhtYWMgKGF1dGgsIHRoaXMuc2VjcmV0KTtcbiAgICAgICAgICAgIHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ3NpZ25hdHVyZSc6IHNpZ25hdHVyZS50b1VwcGVyQ2FzZSAoKSxcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHF1ZXJ5KTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0dHJleCA9IHtcblxuICAgICdpZCc6ICdiaXR0cmV4JyxcbiAgICAnbmFtZSc6ICdCaXR0cmV4JyxcbiAgICAnY291bnRyaWVzJzogJ1VTJyxcbiAgICAndmVyc2lvbic6ICd2MS4xJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjM1Mi1jZjBiM2MyNi01ZWQ1LTExZTctODJiNy1mMzgyNmI3YTk3ZDguanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2JpdHRyZXguY29tL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9iaXR0cmV4LmNvbScsXG4gICAgICAgICdkb2MnOiBbIFxuICAgICAgICAgICAgJ2h0dHBzOi8vYml0dHJleC5jb20vSG9tZS9BcGknLFxuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lm5wbWpzLm9yZy9wYWNrYWdlL25vZGUuYml0dHJleC5hcGknLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2N1cnJlbmNpZXMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXRoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnbWFya2V0cycsXG4gICAgICAgICAgICAgICAgJ21hcmtldHN1bW1hcmllcycsXG4gICAgICAgICAgICAgICAgJ21hcmtldHN1bW1hcnknLFxuICAgICAgICAgICAgICAgICdvcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLCAgICAgICAgICAgIFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ2FjY291bnQnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0YWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnb3JkZXInLFxuICAgICAgICAgICAgICAgICdvcmRlcmhpc3RvcnknLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2FsaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZXQnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdidXlsaW1pdCcsXG4gICAgICAgICAgICAgICAgJ2J1eW1hcmtldCcsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29wZW5vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdzZWxsbGltaXQnLFxuICAgICAgICAgICAgICAgICdzZWxsbWFya2V0JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE1hcmtldHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0c1sncmVzdWx0J10ubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3Jlc3VsdCddW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnTWFya2V0TmFtZSddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0WydNYXJrZXRDdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsnQmFzZUN1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hY2NvdW50R2V0QmFsYW5jZXMgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0T3JkZXJib29rICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiAnYm90aCcsXG4gICAgICAgICAgICAnZGVwdGgnOiA1MCxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSByZXNwb25zZVsncmVzdWx0J107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0geyAnYmlkcyc6ICdidXknLCAnYXNrcyc6ICdzZWxsJyB9O1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChzaWRlcyk7XG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwga2V5cy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgbGV0IGtleSA9IGtleXNba107XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW2tleV07XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbJ1JhdGUnXSk7XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IHBhcnNlRmxvYXQgKG9yZGVyWydRdWFudGl0eSddKTtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRNYXJrZXRzdW1tYXJ5ICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydyZXN1bHQnXVswXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMucGFyc2U4NjAxICh0aWNrZXJbJ1RpbWVTdGFtcCddKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnSGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ0xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ0JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ0FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnTGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ1ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRNYXJrZXRoaXN0b3J5ICh7IFxuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ21hcmtldEdldCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpICsgdHlwZTtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdxdWFudGl0eSc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydyYXRlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLyc7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gdHlwZSArICcvJyArIG1ldGhvZC50b0xvd2VyQ2FzZSAoKSArIHBhdGg7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICB1cmwgKz0gdHlwZSArICcvJztcbiAgICAgICAgICAgIGlmICgoKHR5cGUgPT0gJ2FjY291bnQnKSAmJiAocGF0aCAhPSAnd2l0aGRyYXcnKSkgfHwgKHBhdGggPT0gJ29wZW5vcmRlcnMnKSlcbiAgICAgICAgICAgICAgICB1cmwgKz0gbWV0aG9kLnRvTG93ZXJDYXNlICgpO1xuICAgICAgICAgICAgdXJsICs9IHBhdGggKyAnPycgKyB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnYXBpa2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdhcGlzaWduJzogdGhpcy5obWFjICh1cmwsIHRoaXMuc2VjcmV0LCAnc2hhNTEyJykgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJ0Y2NoaW5hID0ge1xuXG4gICAgJ2lkJzogJ2J0Y2NoaW5hJyxcbiAgICAnbmFtZSc6ICdCVENDaGluYScsXG4gICAgJ2NvdW50cmllcyc6ICdDTicsXG4gICAgJ3JhdGVMaW1pdCc6IDMwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MzY4LTQ2NWIzMjg2LTVlZDYtMTFlNy05YTExLTBmNjQ2N2UxZDgyYi5qcGcnLFxuICAgICAgICAnYXBpJzoge1xuICAgICAgICAgICAgJ3B1YmxpYyc6ICdodHRwczovL2RhdGEuYnRjY2hpbmEuY29tL2RhdGEnLFxuICAgICAgICAgICAgJ3ByaXZhdGUnOiAnaHR0cHM6Ly9hcGkuYnRjY2hpbmEuY29tL2FwaV90cmFkZV92MS5waHAnLFxuICAgICAgICB9LFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmJ0Y2NoaW5hLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly93d3cuYnRjY2hpbmEuY29tL2FwaWRvY3MnXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnaGlzdG9yeWRhdGEnLFxuICAgICAgICAgICAgICAgICdvcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnQnV5SWNlYmVyZ09yZGVyJyxcbiAgICAgICAgICAgICAgICAnQnV5T3JkZXInLFxuICAgICAgICAgICAgICAgICdCdXlPcmRlcjInLFxuICAgICAgICAgICAgICAgICdCdXlTdG9wT3JkZXInLFxuICAgICAgICAgICAgICAgICdDYW5jZWxJY2ViZXJnT3JkZXInLFxuICAgICAgICAgICAgICAgICdDYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0NhbmNlbFN0b3BPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0dldEFjY291bnRJbmZvJyxcbiAgICAgICAgICAgICAgICAnZ2V0QXJjaGl2ZWRPcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldEFyY2hpdmVkT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnR2V0RGVwb3NpdHMnLFxuICAgICAgICAgICAgICAgICdHZXRJY2ViZXJnT3JkZXInLFxuICAgICAgICAgICAgICAgICdHZXRJY2ViZXJnT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnR2V0TWFya2V0RGVwdGgnLFxuICAgICAgICAgICAgICAgICdHZXRNYXJrZXREZXB0aDInLFxuICAgICAgICAgICAgICAgICdHZXRPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0dldE9yZGVycycsXG4gICAgICAgICAgICAgICAgJ0dldFN0b3BPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0dldFN0b3BPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdHZXRUcmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICdHZXRXaXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnR2V0V2l0aGRyYXdhbHMnLFxuICAgICAgICAgICAgICAgICdSZXF1ZXN0V2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ1NlbGxJY2ViZXJnT3JkZXInLFxuICAgICAgICAgICAgICAgICdTZWxsT3JkZXInLFxuICAgICAgICAgICAgICAgICdTZWxsT3JkZXIyJyxcbiAgICAgICAgICAgICAgICAnU2VsbFN0b3BPcmRlcicsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiAnYWxsJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAocHJvZHVjdHMpO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IGtleXMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW3BdO1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1trZXldO1xuICAgICAgICAgICAgbGV0IHBhcnRzID0ga2V5LnNwbGl0ICgnXycpO1xuICAgICAgICAgICAgbGV0IGlkID0gcGFydHNbMV07XG4gICAgICAgICAgICBsZXQgYmFzZSA9IGlkLnNsaWNlICgwLCAzKTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IGlkLnNsaWNlICgzLCA2KTtcbiAgICAgICAgICAgIGJhc2UgPSBiYXNlLnRvVXBwZXJDYXNlICgpO1xuICAgICAgICAgICAgcXVvdGUgPSBxdW90ZS50b1VwcGVyQ2FzZSAoKTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0R2V0QWNjb3VudEluZm8gKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyYm9vayAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBvcmRlcmJvb2tbJ2RhdGUnXSAqIDEwMDA7O1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBvcmRlcmJvb2tbJ2JpZHMnXSxcbiAgICAgICAgICAgICdhc2tzJzogb3JkZXJib29rWydhc2tzJ10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICAvLyBUT0RPIHNvcnQgYmlkYXNrc1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXJzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiBwWydpZCddLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHRpY2tlcnNbJ3RpY2tlciddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWydkYXRlJ10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWyd2d2FwJ10pLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ByZXZfY2xvc2UnXSksXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXMgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSkgKyAnT3JkZXIyJztcbiAgICAgICAgbGV0IG9yZGVyID0ge307XG4gICAgICAgIGxldCBpZCA9IHBbJ2lkJ10udG9VcHBlckNhc2UgKCk7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKSB7XG4gICAgICAgICAgICBvcmRlclsncGFyYW1zJ10gPSBbIHVuZGVmaW5lZCwgYW1vdW50LCBpZCBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3JkZXJbJ3BhcmFtcyddID0gWyBwcmljZSwgYW1vdW50LCBpZCBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIG5vbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWljcm9zZWNvbmRzICgpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXVt0eXBlXSArICcvJyArIHBhdGg7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBwID0gW107XG4gICAgICAgICAgICBpZiAoJ3BhcmFtcycgaW4gcGFyYW1zKVxuICAgICAgICAgICAgICAgIHAgPSBwYXJhbXNbJ3BhcmFtcyddO1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGxldCByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgICAgICdtZXRob2QnOiBwYXRoLFxuICAgICAgICAgICAgICAgICdpZCc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdwYXJhbXMnOiBwLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHAgPSBwLmpvaW4gKCcsJyk7XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHJlcXVlc3QpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gKFxuICAgICAgICAgICAgICAgICd0b25jZT0nICsgbm9uY2UgK1xuICAgICAgICAgICAgICAgICcmYWNjZXNza2V5PScgKyB0aGlzLmFwaUtleSArXG4gICAgICAgICAgICAgICAgJyZyZXF1ZXN0bWV0aG9kPScgKyBtZXRob2QudG9Mb3dlckNhc2UgKCkgK1xuICAgICAgICAgICAgICAgICcmaWQ9JyArIG5vbmNlICtcbiAgICAgICAgICAgICAgICAnJm1ldGhvZD0nICsgcGF0aCArXG4gICAgICAgICAgICAgICAgJyZwYXJhbXM9JyArIHBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5obWFjIChxdWVyeSwgdGhpcy5zZWNyZXQsICdzaGExJyk7XG4gICAgICAgICAgICBsZXQgYXV0aCA9IHRoaXMuYXBpS2V5ICsgJzonICsgc2lnbmF0dXJlOyBcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiAnQmFzaWMgJyArIHRoaXMuc3RyaW5nVG9CYXNlNjQgKHF1ZXJ5KSxcbiAgICAgICAgICAgICAgICAnSnNvbi1ScGMtVG9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBidGNlID0ge1xuXG4gICAgJ2lkJzogJ2J0Y2UnLFxuICAgICduYW1lJzogJ0JUQy1lJyxcbiAgICAnY291bnRyaWVzJzogWyAnQkcnLCAnUlUnIF0sIC8vIEJ1bGdhcmlhLCBSdXNzaWFcbiAgICAndmVyc2lvbic6ICczJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzg0MzIyNS0xYjU3MTUxNC02MTFhLTExZTctOTIwOC0yNjQxYTU2MGI1NjEuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2J0Yy1lLmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vYnRjLWUuY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL2J0Yy1lLmNvbS9hcGkvMy9kb2NzJyxcbiAgICAgICAgICAgICdodHRwczovL2J0Yy1lLmNvbS90YXBpL2RvY3MnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2luZm8nLFxuICAgICAgICAgICAgICAgICd0aWNrZXIve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnZGVwdGgve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAndHJhZGVzL3twYWlyfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdnZXRJbmZvJyxcbiAgICAgICAgICAgICAgICAnVHJhZGUnLFxuICAgICAgICAgICAgICAgICdBY3RpdmVPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdPcmRlckluZm8nLFxuICAgICAgICAgICAgICAgICdDYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ1RyYWRlSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ1RyYW5zSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ0NvaW5EZXBvc2l0QWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ1dpdGhkcmF3Q29pbicsXG4gICAgICAgICAgICAgICAgJ0NyZWF0ZUNvdXBvbicsXG4gICAgICAgICAgICAgICAgJ1JlZGVlbUNvdXBvbicsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEluZm8gKCk7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IHJlc3BvbnNlWydwYWlycyddO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0cyk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgaWQgPSBrZXlzW3BdO1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1tpZF07XG4gICAgICAgICAgICBsZXQgWyBiYXNlLCBxdW90ZSBdID0gaWQuc3BsaXQgKCdfJyk7XG4gICAgICAgICAgICBiYXNlID0gYmFzZS50b1VwcGVyQ2FzZSAoKTtcbiAgICAgICAgICAgIHF1b3RlID0gcXVvdGUudG9VcHBlckNhc2UgKCk7XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEdldEluZm8gKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXREZXB0aFBhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogcFsnaWQnXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSByZXNwb25zZVtwWydpZCddXTsgXG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogb3JkZXJib29rWydiaWRzJ10sXG4gICAgICAgICAgICAnYXNrcyc6IG9yZGVyYm9va1snYXNrcyddLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXJzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXJQYWlyICh7XG4gICAgICAgICAgICAncGFpcic6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1twWydpZCddXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndXBkYXRlZCddICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXZnJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbF9jdXInXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXNQYWlyICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncmF0ZSc6IHByaWNlLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFRyYWRlICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdTaWduJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJ0Y3ggPSB7XG5cbiAgICAnaWQnOiAnYnRjeCcsXG4gICAgJ25hbWUnOiAnQlRDWCcsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0lTJywgJ1VTJywgJ0VVJywgXSxcbiAgICAncmF0ZUxpbWl0JzogMzAwMCwgLy8gc3VwcG9ydCBpbiBlbmdsaXNoIGlzIHZlcnkgcG9vciwgdW5hYmxlIHRvIHRlbGwgcmF0ZSBsaW1pdHNcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYzODUtOWZkY2M5OGMtNWVkNi0xMWU3LThmMTQtNjZkNWU1Y2Q0N2U2LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9idGMteC5pcy9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vYnRjLXguaXMnLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vYnRjLXguaXMvY3VzdG9tL2FwaS1kb2N1bWVudC5odG1sJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdkZXB0aC97aWR9L3tsaW1pdH0nLFxuICAgICAgICAgICAgICAgICd0aWNrZXIve2lkfScsICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ3RyYWRlL3tpZH0ve2xpbWl0fScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAncmVkZWVtJyxcbiAgICAgICAgICAgICAgICAndHJhZGUnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ2J0Yy91c2QnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ2J0Yy9ldXInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldERlcHRoSWRMaW1pdCAoeyBcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdsaW1pdCc6IDEwMDAsXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IFsgJ2JpZHMnLCAnYXNrcycgXTtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBzaWRlcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1tzXTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBvcmRlclsncHJpY2UnXTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gb3JkZXJbJ2Ftb3VudCddO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHsgXG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlcklkICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd0aW1lJ10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZUlkTGltaXQgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdsaW1pdCc6IDEwMCxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFRyYWRlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLnRvVXBwZXJDYXNlICgpLFxuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9IHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICB1cmwgKz0gdHlwZTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnTWV0aG9kJzogcGF0aC50b1VwcGVyQ2FzZSAoKSxcbiAgICAgICAgICAgICAgICAnTm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdTaWduYXR1cmUnOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYnhpbnRoID0ge1xuXG4gICAgJ2lkJzogJ2J4aW50aCcsXG4gICAgJ25hbWUnOiAnQlguaW4udGgnLFxuICAgICdjb3VudHJpZXMnOiAnVEgnLCAvLyBUaGFpbGFuZFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NDEyLTU2N2IxZWI0LTVlZDctMTFlNy05NGE4LWZmNmEzODg0ZjZjNS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYnguaW4udGgvYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2J4LmluLnRoJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2J4LmluLnRoL2luZm8vYXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICcnLCAvLyB0aWNrZXJcbiAgICAgICAgICAgICAgICAnb3B0aW9ucycsXG4gICAgICAgICAgICAgICAgJ29wdGlvbmJvb2snLFxuICAgICAgICAgICAgICAgICdvcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICdwYWlyaW5nJyxcbiAgICAgICAgICAgICAgICAndHJhZGUnLFxuICAgICAgICAgICAgICAgICd0cmFkZWhpc3RvcnknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2JpbGxlcicsXG4gICAgICAgICAgICAgICAgJ2JpbGxncm91cCcsXG4gICAgICAgICAgICAgICAgJ2JpbGxwYXknLFxuICAgICAgICAgICAgICAgICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0JyxcbiAgICAgICAgICAgICAgICAnZ2V0b3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1pc3N1ZScsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1iaWQnLFxuICAgICAgICAgICAgICAgICdvcHRpb24tc2VsbCcsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1teWlzc3VlJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLW15YmlkJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLW15b3B0aW9ucycsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1leGVyY2lzZScsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1jYW5jZWwnLFxuICAgICAgICAgICAgICAgICdvcHRpb24taGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWwtaGlzdG9yeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQYWlyaW5nICgpO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0cyk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW2tleXNbcF1dO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsncGFpcmluZ19pZCddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0WydwcmltYXJ5X2N1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydzZWNvbmRhcnlfY3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0T3JkZXJib29rICh7XG4gICAgICAgICAgICAncGFpcmluZyc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWzBdKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbMV0pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VycyA9IGF3YWl0IHRoaXMucHVibGljR2V0ICh7ICdwYWlyaW5nJzogcFsnaWQnXSB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHRpY2tlcnNbcFsnaWQnXV07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsb3cnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydvcmRlcmJvb2snXVsnYmlkcyddWydoaWdoYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3JkZXJib29rJ11bJ2Fza3MnXVsnaGlnaGJpZCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdF9wcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2NoYW5nZSddKSxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lXzI0aG91cnMnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGUgKHtcbiAgICAgICAgICAgICdwYWlyaW5nJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXIgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAncGFpcmluZyc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncmF0ZSc6IHByaWNlLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyBwYXRoICsgJy8nO1xuICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHJpdmF0ZScpIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5oYXNoICh0aGlzLmFwaUtleSArIG5vbmNlICsgdGhpcy5zZWNyZXQsICdzaGEyNTYnKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ3NpZ25hdHVyZSc6IHNpZ25hdHVyZSxcbiAgICAgICAgICAgICAgICAvLyB0d29mYTogdGhpcy50d29mYSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgY2NleCA9IHtcblxuICAgICdpZCc6ICdjY2V4JyxcbiAgICAnbmFtZSc6ICdDLUNFWCcsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0RFJywgJ0VVJywgXSxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjQzMy0xNjg4MWY5MC01ZWQ4LTExZTctOTJmOC0zZDkyY2M3NDdhNmMuanBnJyxcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICd0aWNrZXJzJzogJ2h0dHBzOi8vYy1jZXguY29tL3QnLFxuICAgICAgICAgICAgJ3B1YmxpYyc6ICdodHRwczovL2MtY2V4LmNvbS90L2FwaV9wdWIuaHRtbCcsXG4gICAgICAgICAgICAncHJpdmF0ZSc6ICdodHRwczovL2MtY2V4LmNvbS90L2FwaS5odG1sJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2MtY2V4LmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9jLWNleC5jb20vP2lkPWFwaScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAndGlja2Vycyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2NvaW5uYW1lcycsXG4gICAgICAgICAgICAgICAgJ3ttYXJrZXR9JyxcbiAgICAgICAgICAgICAgICAncGFpcnMnLFxuICAgICAgICAgICAgICAgICdwcmljZXMnLFxuICAgICAgICAgICAgICAgICd2b2x1bWVfe2NvaW59JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogWyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnYmFsYW5jZWRpc3RyaWJ1dGlvbicsXG4gICAgICAgICAgICAgICAgJ21hcmtldGhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0c3VtbWFyaWVzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzogeyAgICAgICAgICAgIFxuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYnV5bGltaXQnLFxuICAgICAgICAgICAgICAgICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgICdnZXRiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnZ2V0YmFsYW5jZXMnLCAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnZ2V0b3Blbm9yZGVycycsXG4gICAgICAgICAgICAgICAgJ2dldG9yZGVyJyxcbiAgICAgICAgICAgICAgICAnZ2V0b3JkZXJoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnbXl0cmFkZXMnLFxuICAgICAgICAgICAgICAgICdzZWxsbGltaXQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0TWFya2V0cyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzWydyZXN1bHQnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sncmVzdWx0J11bcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydNYXJrZXROYW1lJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ01hcmtldEN1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydCYXNlQ3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRCYWxhbmNlcyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAndHlwZSc6ICdib3RoJyxcbiAgICAgICAgICAgICdkZXB0aCc6IDEwMCxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSByZXNwb25zZVsncmVzdWx0J107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0geyAnYmlkcyc6ICdidXknLCAnYXNrcyc6ICdzZWxsJyB9O1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChzaWRlcyk7XG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwga2V5cy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgbGV0IGtleSA9IGtleXNba107XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW2tleV07XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbJ1JhdGUnXSk7XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IHBhcnNlRmxvYXQgKG9yZGVyWydRdWFudGl0eSddKTtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy50aWNrZXJzR2V0TWFya2V0ICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLnRvTG93ZXJDYXNlICgpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWyd0aWNrZXInXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndXBkYXRlZCddICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RwcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogcGFyc2VGbG9hdCAodGlja2VyWydhdmcnXSksXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5c3VwcG9ydCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRNYXJrZXRoaXN0b3J5ICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiAnYm90aCcsXG4gICAgICAgICAgICAnZGVwdGgnOiAxMDAsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlR2V0JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSkgKyB0eXBlO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdxdWFudGl0eSc6IGFtb3VudCxcbiAgICAgICAgICAgICdyYXRlJzogcHJpY2UsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXVt0eXBlXTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3ByaXZhdGUnKSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5rZXlzb3J0ICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdhJzogcGF0aCxcbiAgICAgICAgICAgICAgICAnYXBpa2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHsgJ2FwaXNpZ24nOiB0aGlzLmhtYWMgKHVybCwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSB9O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnYSc6ICdnZXQnICsgcGF0aCxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsICs9ICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKSArICcuanNvbic7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBjZXggPSB7XG5cbiAgICAnaWQnOiAnY2V4JyxcbiAgICAnbmFtZSc6ICdDRVguSU8nLFxuICAgICdjb3VudHJpZXMnOiBbICdHQicsICdFVScsICdDWScsICdSVScsIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY0NDItOGRkYzMzYjAtNWVkOC0xMWU3LThiOTgtZjc4NmFlZjBmM2M5LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9jZXguaW8vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2NleC5pbycsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9jZXguaW8vY2V4LWFwaScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnY3VycmVuY3lfbGltaXRzJyxcbiAgICAgICAgICAgICAgICAnbGFzdF9wcmljZS97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdsYXN0X3ByaWNlcy97Y3VycmVuY2llc30nLFxuICAgICAgICAgICAgICAgICdvaGxjdi9oZC97eXl5eW1tZGR9L3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ29yZGVyX2Jvb2sve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAndGlja2VyL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcnMve2N1cnJlbmNpZXN9JyxcbiAgICAgICAgICAgICAgICAndHJhZGVfaGlzdG9yeS97cGFpcn0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdjb252ZXJ0L3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3ByaWNlX3N0YXRzL3twYWlyfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdhY3RpdmVfb3JkZXJzX3N0YXR1cy8nLFxuICAgICAgICAgICAgICAgICdhcmNoaXZlZF9vcmRlcnMve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZS8nLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXIvJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVycy97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfcmVwbGFjZV9vcmRlci97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdjbG9zZV9wb3NpdGlvbi97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdnZXRfYWRkcmVzcy8nLFxuICAgICAgICAgICAgICAgICdnZXRfbXlmZWUvJyxcbiAgICAgICAgICAgICAgICAnZ2V0X29yZGVyLycsXG4gICAgICAgICAgICAgICAgJ2dldF9vcmRlcl90eC8nLFxuICAgICAgICAgICAgICAgICdvcGVuX29yZGVycy97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdvcGVuX29yZGVycy8nLFxuICAgICAgICAgICAgICAgICdvcGVuX3Bvc2l0aW9uL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ29wZW5fcG9zaXRpb25zL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3BsYWNlX29yZGVyL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3BsYWNlX29yZGVyL3twYWlyfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEN1cnJlbmN5TGltaXRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ2RhdGEnXVsncGFpcnMnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1snZGF0YSddWydwYWlycyddW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnc3ltYm9sMSddICsgJy8nICsgcHJvZHVjdFsnc3ltYm9sMiddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGlkO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgIHRoaXMucHVibGljR2V0T3JkZXJCb29rUGFpciAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gb3JkZXJib29rWyd0aW1lc3RhbXAnXSAqIDEwMDA7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IG9yZGVyYm9va1snYmlkcyddLFxuICAgICAgICAgICAgJ2Fza3MnOiBvcmRlcmJvb2tbJ2Fza3MnXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlclBhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50ICh0aWNrZXJbJ3RpbWVzdGFtcCddKSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogcGFyc2VGbG9hdCAodGlja2VyWydjaGFuZ2UnXSksXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZUhpc3RvcnlQYWlyICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcmRlclsnb3JkZXJfdHlwZSddID0gdHlwZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RQbGFjZU9yZGVyUGFpciAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHsgICBcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdzaWduYXR1cmUnOiB0aGlzLmhtYWMgKG5vbmNlICsgdGhpcy51aWQgKyB0aGlzLmFwaUtleSwgdGhpcy5zZWNyZXQpLnRvVXBwZXJDYXNlICgpLFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcXVlcnkpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGNvaW5jaGVjayA9IHtcblxuICAgICdpZCc6ICdjb2luY2hlY2snLFxuICAgICduYW1lJzogJ2NvaW5jaGVjaycsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0pQJywgJ0lEJywgXSxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjQ2NC0zYjVjM2M3NC01ZWQ5LTExZTctODQwZS0zMWIzMjk2OGUxZGEuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2NvaW5jaGVjay5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2NvaW5jaGVjay5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vY29pbmNoZWNrLmNvbS9kb2N1bWVudHMvZXhjaGFuZ2UvYXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdleGNoYW5nZS9vcmRlcnMvcmF0ZScsXG4gICAgICAgICAgICAgICAgJ29yZGVyX2Jvb2tzJyxcbiAgICAgICAgICAgICAgICAncmF0ZS97cGFpcn0nLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdhY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdhY2NvdW50cy9sZXZlcmFnZV9iYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnYmFua19hY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRfbW9uZXknLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9vcmRlcnMvb3BlbnMnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9vcmRlcnMvdHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2Uvb3JkZXJzL3RyYW5zYWN0aW9uc19wYWdpbmF0aW9uJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvbGV2ZXJhZ2UvcG9zaXRpb25zJyxcbiAgICAgICAgICAgICAgICAnbGVuZGluZy9ib3Jyb3dzL21hdGNoZXMnLFxuICAgICAgICAgICAgICAgICdzZW5kX21vbmV5JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdzJyxcbiAgICAgICAgICAgIF0sICAgICAgICAgICAgXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYmFua19hY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRfbW9uZXkve2lkfS9mYXN0JyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2Uvb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvdHJhbnNmZXJzL3RvX2xldmVyYWdlJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvdHJhbnNmZXJzL2Zyb21fbGV2ZXJhZ2UnLFxuICAgICAgICAgICAgICAgICdsZW5kaW5nL2JvcnJvd3MnLFxuICAgICAgICAgICAgICAgICdsZW5kaW5nL2JvcnJvd3Mve2lkfS9yZXBheScsXG4gICAgICAgICAgICAgICAgJ3NlbmRfbW9uZXknLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd3MnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbmtfYWNjb3VudHMve2lkfScsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL29yZGVycy97aWR9JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdzL3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9KUFknOiAgeyAnaWQnOiAnYnRjX2pweScsICAnc3ltYm9sJzogJ0JUQy9KUFknLCAgJ2Jhc2UnOiAnQlRDJywgICdxdW90ZSc6ICdKUFknIH0sIC8vIHRoZSBvbmx5IHJlYWwgcGFpclxuICAgICAgICAnRVRIL0pQWSc6ICB7ICdpZCc6ICdldGhfanB5JywgICdzeW1ib2wnOiAnRVRIL0pQWScsICAnYmFzZSc6ICdFVEgnLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ0VUQy9KUFknOiAgeyAnaWQnOiAnZXRjX2pweScsICAnc3ltYm9sJzogJ0VUQy9KUFknLCAgJ2Jhc2UnOiAnRVRDJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdEQU8vSlBZJzogIHsgJ2lkJzogJ2Rhb19qcHknLCAgJ3N5bWJvbCc6ICdEQU8vSlBZJywgICdiYXNlJzogJ0RBTycsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnTFNLL0pQWSc6ICB7ICdpZCc6ICdsc2tfanB5JywgICdzeW1ib2wnOiAnTFNLL0pQWScsICAnYmFzZSc6ICdMU0snLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ0ZDVC9KUFknOiAgeyAnaWQnOiAnZmN0X2pweScsICAnc3ltYm9sJzogJ0ZDVC9KUFknLCAgJ2Jhc2UnOiAnRkNUJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdYTVIvSlBZJzogIHsgJ2lkJzogJ3htcl9qcHknLCAgJ3N5bWJvbCc6ICdYTVIvSlBZJywgICdiYXNlJzogJ1hNUicsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnUkVQL0pQWSc6ICB7ICdpZCc6ICdyZXBfanB5JywgICdzeW1ib2wnOiAnUkVQL0pQWScsICAnYmFzZSc6ICdSRVAnLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ1hSUC9KUFknOiAgeyAnaWQnOiAneHJwX2pweScsICAnc3ltYm9sJzogJ1hSUC9KUFknLCAgJ2Jhc2UnOiAnWFJQJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdaRUMvSlBZJzogIHsgJ2lkJzogJ3plY19qcHknLCAgJ3N5bWJvbCc6ICdaRUMvSlBZJywgICdiYXNlJzogJ1pFQycsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnWEVNL0pQWSc6ICB7ICdpZCc6ICd4ZW1fanB5JywgICdzeW1ib2wnOiAnWEVNL0pQWScsICAnYmFzZSc6ICdYRU0nLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ0xUQy9KUFknOiAgeyAnaWQnOiAnbHRjX2pweScsICAnc3ltYm9sJzogJ0xUQy9KUFknLCAgJ2Jhc2UnOiAnTFRDJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdEQVNIL0pQWSc6IHsgJ2lkJzogJ2Rhc2hfanB5JywgJ3N5bWJvbCc6ICdEQVNIL0pQWScsICdiYXNlJzogJ0RBU0gnLCAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnRVRIL0JUQyc6ICB7ICdpZCc6ICdldGhfYnRjJywgICdzeW1ib2wnOiAnRVRIL0JUQycsICAnYmFzZSc6ICdFVEgnLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0VUQy9CVEMnOiAgeyAnaWQnOiAnZXRjX2J0YycsICAnc3ltYm9sJzogJ0VUQy9CVEMnLCAgJ2Jhc2UnOiAnRVRDJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMU0svQlRDJzogIHsgJ2lkJzogJ2xza19idGMnLCAgJ3N5bWJvbCc6ICdMU0svQlRDJywgICdiYXNlJzogJ0xTSycsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnRkNUL0JUQyc6ICB7ICdpZCc6ICdmY3RfYnRjJywgICdzeW1ib2wnOiAnRkNUL0JUQycsICAnYmFzZSc6ICdGQ1QnLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ1hNUi9CVEMnOiAgeyAnaWQnOiAneG1yX2J0YycsICAnc3ltYm9sJzogJ1hNUi9CVEMnLCAgJ2Jhc2UnOiAnWE1SJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdSRVAvQlRDJzogIHsgJ2lkJzogJ3JlcF9idGMnLCAgJ3N5bWJvbCc6ICdSRVAvQlRDJywgICdiYXNlJzogJ1JFUCcsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnWFJQL0JUQyc6ICB7ICdpZCc6ICd4cnBfYnRjJywgICdzeW1ib2wnOiAnWFJQL0JUQycsICAnYmFzZSc6ICdYUlAnLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ1pFQy9CVEMnOiAgeyAnaWQnOiAnemVjX2J0YycsICAnc3ltYm9sJzogJ1pFQy9CVEMnLCAgJ2Jhc2UnOiAnWkVDJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdYRU0vQlRDJzogIHsgJ2lkJzogJ3hlbV9idGMnLCAgJ3N5bWJvbCc6ICdYRU0vQlRDJywgICdiYXNlJzogJ1hFTScsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnTFRDL0JUQyc6ICB7ICdpZCc6ICdsdGNfYnRjJywgICdzeW1ib2wnOiAnTFRDL0JUQycsICAnYmFzZSc6ICdMVEMnLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0RBU0gvQlRDJzogeyAnaWQnOiAnZGFzaF9idGMnLCAnc3ltYm9sJzogJ0RBU0gvQlRDJywgJ2Jhc2UnOiAnREFTSCcsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRBY2NvdW50c0JhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCAgdGhpcy5wdWJsaWNHZXRPcmRlckJvb2tzICgpO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IFsgJ2JpZHMnLCAnYXNrcycgXTtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBzaWRlcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1tzXTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlclswXSk7XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IHBhcnNlRmxvYXQgKG9yZGVyWzFdKTtcbiAgICAgICAgICAgICAgICByZXN1bHRbc2lkZV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoKTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndGltZXN0YW1wJ10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBwcmVmaXggPSAnJztcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKSB7XG4gICAgICAgICAgICBsZXQgb3JkZXJfdHlwZSA9IHR5cGUgKyAnXycgKyBzaWRlO1xuICAgICAgICAgICAgb3JkZXJbJ29yZGVyX3R5cGUnXSA9IG9yZGVyX3R5cGU7XG4gICAgICAgICAgICBsZXQgcHJlZml4ID0gKHNpZGUgPT0gYnV5KSA/IChvcmRlcl90eXBlICsgJ18nKSA6ICcnO1xuICAgICAgICAgICAgb3JkZXJbcHJlZml4ICsgJ2Ftb3VudCddID0gYW1vdW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3JkZXJbJ29yZGVyX3R5cGUnXSA9IHNpZGU7XG4gICAgICAgICAgICBvcmRlclsncmF0ZSddID0gcHJpY2U7XG4gICAgICAgICAgICBvcmRlclsnYW1vdW50J10gPSBhbW91bnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RFeGNoYW5nZU9yZGVycyAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmtleXNvcnQgKHF1ZXJ5KSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAnQUNDRVNTLUtFWSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdBQ0NFU1MtTk9OQ0UnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnQUNDRVNTLVNJR05BVFVSRSc6IHRoaXMuaG1hYyAobm9uY2UgKyB1cmwgKyAoYm9keSB8fCAnJyksIHRoaXMuc2VjcmV0KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGNvaW5tYXRlID0ge1xuICAgIFxuICAgICdpZCc6ICdjb2lubWF0ZScsXG4gICAgJ25hbWUnOiAnQ29pbk1hdGUnLFxuICAgICdjb3VudHJpZXMnOiBbICdHQicsICdDWicgXSwgLy8gVUssIEN6ZWNoIFJlcHVibGljXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc4MTEyMjktYzFlZmI1MTAtNjA2Yy0xMWU3LTlhMzYtODRiYTJjZTQxMmQ4LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9jb2lubWF0ZS5pby9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vY29pbm1hdGUuaW8nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vY29pbm1hdGUuaW8vZGV2ZWxvcGVycycsXG4gICAgICAgICAgICAnaHR0cDovL2RvY3MuY29pbm1hdGUuYXBpYXJ5LmlvLyNyZWZlcmVuY2UnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ29yZGVyQm9vaycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2JpdGNvaW5XaXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnYml0Y29pbkRlcG9zaXRBZGRyZXNzZXMnLFxuICAgICAgICAgICAgICAgICdidXlJbnN0YW50JyxcbiAgICAgICAgICAgICAgICAnYnV5TGltaXQnLFxuICAgICAgICAgICAgICAgICdjYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbE9yZGVyV2l0aEluZm8nLFxuICAgICAgICAgICAgICAgICdjcmVhdGVWb3VjaGVyJyxcbiAgICAgICAgICAgICAgICAnb3Blbk9yZGVycycsXG4gICAgICAgICAgICAgICAgJ3JlZGVlbVZvdWNoZXInLFxuICAgICAgICAgICAgICAgICdzZWxsSW5zdGFudCcsXG4gICAgICAgICAgICAgICAgJ3NlbGxMaW1pdCcsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9uSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3VuY29uZmlybWVkQml0Y29pbkRlcG9zaXRzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvRVVSJzogeyAnaWQnOiAnQlRDX0VVUicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInICB9LFxuICAgICAgICAnQlRDL0NaSyc6IHsgJ2lkJzogJ0JUQ19DWksnLCAnc3ltYm9sJzogJ0JUQy9DWksnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ1pLJyAgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlcyAoKTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0T3JkZXJCb29rICh7XG4gICAgICAgICAgICAnY3VycmVuY3lQYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2dyb3VwQnlQcmljZUxpbWl0JzogJ0ZhbHNlJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSByZXNwb25zZVsnZGF0YSddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gb3JkZXJib29rWyd0aW1lc3RhbXAnXSAqIDEwMDA7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IFsgJ2JpZHMnLCAnYXNrcycgXTtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBzaWRlcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1tzXTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBvcmRlclsncHJpY2UnXTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gb3JkZXJbJ2Ftb3VudCddO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAnY3VycmVuY3lQYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydkYXRhJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3RpbWVzdGFtcCddICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2Ftb3VudCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFuc2FjdGlvbnMgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeVBhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnbWludXRlc0ludG9IaXN0b3J5JzogMTAsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlUG9zdCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnY3VycmVuY3lQYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0Jykge1xuICAgICAgICAgICAgaWYgKHNpZGUgPT0gJ2J1eScpXG4gICAgICAgICAgICAgICAgb3JkZXJbJ3RvdGFsJ10gPSBhbW91bnQ7IC8vIGFtb3VudCBpbiBmaWF0XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb3JkZXJbJ2Ftb3VudCddID0gYW1vdW50OyAvLyBhbW91bnQgaW4gZmlhdFxuICAgICAgICAgICAgbWV0aG9kICs9ICdJbnN0YW50JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9yZGVyWydhbW91bnQnXSA9IGFtb3VudDsgLy8gYW1vdW50IGluIGNyeXB0b1xuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgICAgIG1ldGhvZCArPSB0aGlzLmNhcGl0YWxpemUgKHR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHNlbGYuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGxldCBhdXRoID0gWyBub25jZSwgdGhpcy51aWQsIHRoaXMuYXBpS2V5IF0uam9pbiAoJyAnKTtcbiAgICAgICAgICAgIGxldCBzaWduYXR1cmUgPSB0aGlzLmhtYWMgKGF1dGgsIHRoaXMuc2VjcmV0KTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnY2xpZW50SWQnOiB0aGlzLnVpZCxcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgICAgICAncHVibGljS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ3NpZ25hdHVyZSc6IHNpZ25hdHVyZS50b1VwcGVyQ2FzZSAoKSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGNvaW5zZWN1cmUgPSB7XG5cbiAgICAnaWQnOiAnY29pbnNlY3VyZScsXG4gICAgJ25hbWUnOiAnQ29pbnNlY3VyZScsXG4gICAgJ2NvdW50cmllcyc6ICdJTicsIC8vIEluZGlhXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NDcyLTljYmQyMDBhLTVlZDktMTFlNy05NTUxLTIyNjdhZDdiYWMwOC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLmNvaW5zZWN1cmUuaW4nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vY29pbnNlY3VyZS5pbicsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9hcGkuY29pbnNlY3VyZS5pbicsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL2NvaW5zZWN1cmUvcGx1Z2lucycsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYml0Y29pbi9zZWFyY2gvY29uZmlybWF0aW9uL3t0eGlkfScsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL2Fzay9sb3cnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9hc2svb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvYmlkL2hpZ2gnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9iaWQvb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvbGFzdFRyYWRlJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvbWF4MjRIcicsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL21pbjI0SHInLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS90aWNrZXInLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS90cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdtZmEvYXV0aHkvY2FsbCcsXG4gICAgICAgICAgICAgICAgJ21mYS9hdXRoeS9zbXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICduZXRraS9zZWFyY2gve25ldGtpTmFtZX0nLFxuICAgICAgICAgICAgICAgICd1c2VyL2Jhbmsvb3RwL3tudW1iZXJ9JyxcbiAgICAgICAgICAgICAgICAndXNlci9reWMvb3RwL3tudW1iZXJ9JyxcbiAgICAgICAgICAgICAgICAndXNlci9wcm9maWxlL3Bob25lL290cC97bnVtYmVyfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vYWRkcmVzcy97aWR9JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi9kZXBvc2l0L2NvbmZpcm1lZC9hbGwnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL2RlcG9zaXQvY29uZmlybWVkL3tpZH0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL2RlcG9zaXQvdW5jb25maXJtZWQvYWxsJyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi9kZXBvc2l0L3VuY29uZmlybWVkL3tpZH0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL3dhbGxldHMnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9hY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2JhbGFuY2UvYXZhaWxhYmxlJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvYmFsYW5jZS9wZW5kaW5nJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvYmFsYW5jZS90b3RhbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2RlcG9zaXQvY2FuY2VsbGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvZGVwb3NpdC91bnZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvZGVwb3NpdC92ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L3dpdGhkcmF3L2NhbmNlbGxlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L3dpdGhkcmF3L2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L3dpdGhkcmF3L3VudmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC93aXRoZHJhdy92ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYXNrL2NhbmNlbGxlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYXNrL2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYXNrL3BlbmRpbmcnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JpZC9jYW5jZWxsZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JpZC9jb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JpZC9wZW5kaW5nJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vYWRkcmVzc2VzJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vYmFsYW5jZS9hdmFpbGFibGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi9iYWxhbmNlL3BlbmRpbmcnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi9iYWxhbmNlL3RvdGFsJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vZGVwb3NpdC9jYW5jZWxsZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi9kZXBvc2l0L3VudmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi9kZXBvc2l0L3ZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vd2l0aGRyYXcvY2FuY2VsbGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vd2l0aGRyYXcvY29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vd2l0aGRyYXcvdW52ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL3dpdGhkcmF3L3ZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL3N1bW1hcnknLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2NvaW4vZmVlJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9maWF0L2ZlZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2Uva3ljcycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvcmVmZXJyYWwvY29pbi9wYWlkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9yZWZlcnJhbC9jb2luL3N1Y2Nlc3NmdWwnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL3JlZmVycmFsL2ZpYXQvcGFpZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvcmVmZXJyYWxzJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS90cmFkZS9zdW1tYXJ5JyxcbiAgICAgICAgICAgICAgICAndXNlci9sb2dpbi90b2tlbi97dG9rZW59JyxcbiAgICAgICAgICAgICAgICAndXNlci9zdW1tYXJ5JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJ3dhbGxldC9jb2luL3dpdGhkcmF3L2NhbmNlbGxlZCcsXG4gICAgICAgICAgICAgICAgJ3dhbGxldC9jb2luL3dpdGhkcmF3L2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgJ3dhbGxldC9jb2luL3dpdGhkcmF3L3VudmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd3YWxsZXQvY29pbi93aXRoZHJhdy92ZXJpZmllZCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2xvZ2luJyxcbiAgICAgICAgICAgICAgICAnbG9naW4vaW5pdGlhdGUnLFxuICAgICAgICAgICAgICAgICdsb2dpbi9wYXNzd29yZC9mb3Jnb3QnLFxuICAgICAgICAgICAgICAgICdtZmEvYXV0aHkvaW5pdGlhdGUnLFxuICAgICAgICAgICAgICAgICdtZmEvZ2EvaW5pdGlhdGUnLFxuICAgICAgICAgICAgICAgICdzaWdudXAnLFxuICAgICAgICAgICAgICAgICd1c2VyL25ldGtpL3VwZGF0ZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcHJvZmlsZS9pbWFnZS91cGRhdGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy9pbml0aWF0ZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL3dpdGhkcmF3L25ld1ZlcmlmeWNvZGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC93aXRoZHJhdy9pbml0aWF0ZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L3dpdGhkcmF3L25ld1ZlcmlmeWNvZGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL3Bhc3N3b3JkL2NoYW5nZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcGFzc3dvcmQvcmVzZXQnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL3dpdGhkcmF3L2luaXRpYXRlJyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0L2NvaW4vd2l0aGRyYXcvbmV3VmVyaWZ5Y29kZScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3B1dCc6IFtcbiAgICAgICAgICAgICAgICAnc2lnbnVwL3ZlcmlmeS97dG9rZW59JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9reWMnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9kZXBvc2l0L25ldycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYXNrL25ldycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmlkL25ldycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvaW5zdGFudC9idXknLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2luc3RhbnQvc2VsbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL3dpdGhkcmF3L3ZlcmlmeScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2FjY291bnQvbmV3JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvdmVyaWZ5JyxcbiAgICAgICAgICAgICAgICAndXNlci9tZmEvYXV0aHkvaW5pdGlhdGUvZW5hYmxlJyxcbiAgICAgICAgICAgICAgICAndXNlci9tZmEvZ2EvaW5pdGlhdGUvZW5hYmxlJyxcbiAgICAgICAgICAgICAgICAndXNlci9uZXRraS9jcmVhdGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL3Byb2ZpbGUvcGhvbmUvbmV3JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi9hZGRyZXNzL25ldycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vbmV3JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi93aXRoZHJhdy9zZW5kVG9FeGNoYW5nZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vd2l0aGRyYXcvdmVyaWZ5JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICd1c2VyL2djbS97Y29kZX0nLFxuICAgICAgICAgICAgICAgICd1c2VyL2xvZ291dCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL3dpdGhkcmF3L3VudmVyaWZpZWQvY2FuY2VsL3t3aXRoZHJhd0lEfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2RlcG9zaXQvY2FuY2VsL3tkZXBvc2l0SUR9JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9hc2svY2FuY2VsL3tvcmRlcklEfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmlkL2NhbmNlbC97b3JkZXJJRH0nLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC93aXRoZHJhdy91bnZlcmlmaWVkL2NhbmNlbC97d2l0aGRyYXdJRH0nLFxuICAgICAgICAgICAgICAgICd1c2VyL21mYS9hdXRoeS9kaXNhYmxlL3tjb2RlfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbWZhL2dhL2Rpc2FibGUve2NvZGV9JyxcbiAgICAgICAgICAgICAgICAndXNlci9wcm9maWxlL3Bob25lL2RlbGV0ZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcHJvZmlsZS9pbWFnZS9kZWxldGUve25ldGtpTmFtZX0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL3dpdGhkcmF3L3VudmVyaWZpZWQvY2FuY2VsL3t3aXRoZHJhd0lEfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL0lOUic6IHsgJ2lkJzogJ0JUQy9JTlInLCAnc3ltYm9sJzogJ0JUQy9JTlInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSU5SJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0VXNlckV4Y2hhbmdlQmFua1N1bW1hcnkgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7IFxuICAgICAgICBsZXQgYmlkcyA9IGF3YWl0IHRoaXMucHVibGljR2V0RXhjaGFuZ2VCaWRPcmRlcnMgKCk7XG4gICAgICAgIGxldCBhc2tzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRFeGNoYW5nZUFza09yZGVycyAoKTtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IHtcbiAgICAgICAgICAgICdiaWRzJzogYmlkc1snbWVzc2FnZSddLFxuICAgICAgICAgICAgJ2Fza3MnOiBhc2tzWydtZXNzYWdlJ10sXG4gICAgICAgIH07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IG9yZGVyWydyYXRlJ107XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IG9yZGVyWyd2b2wnXTtcbiAgICAgICAgICAgICAgICByZXN1bHRbc2lkZV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0RXhjaGFuZ2VUaWNrZXIgKCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsnbWVzc2FnZSddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd0aW1lc3RhbXAnXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdFByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnY29pbnZvbHVtZSddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnZmlhdHZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRFeGNoYW5nZVRyYWRlcyAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVB1dFVzZXJFeGNoYW5nZSc7XG4gICAgICAgIGxldCBvcmRlciA9IHt9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0JykgeyAgICAgICBcbiAgICAgICAgICAgIG1ldGhvZCArPSAnSW5zdGFudCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpO1xuICAgICAgICAgICAgaWYgKHNpZGUgPT0gJ2J1eScpXG4gICAgICAgICAgICAgICAgb3JkZXJbJ21heEZpYXQnXSA9IGFtb3VudDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvcmRlclsnbWF4Vm9sJ10gPSBhbW91bnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgZGlyZWN0aW9uID0gKHNpZGUgPT0gJ2J1eScpID8gJ0JpZCcgOiAnQXNrJztcbiAgICAgICAgICAgIG1ldGhvZCArPSBkaXJlY3Rpb24gKyAnTmV3JztcbiAgICAgICAgICAgIG9yZGVyWydyYXRlJ10gPSBwcmljZTtcbiAgICAgICAgICAgIG9yZGVyWyd2b2wnXSA9IGFtb3VudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdIChzZWxmLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHJpdmF0ZScpIHtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdBdXRob3JpemF0aW9uJzogdGhpcy5hcGlLZXkgfTtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgZXhtbyA9IHtcblxuICAgICdpZCc6ICdleG1vJyxcbiAgICAnbmFtZSc6ICdFWE1PJyxcbiAgICAnY291bnRyaWVzJzogWyAnRVMnLCAnUlUnLCBdLCAvLyBTcGFpbiwgUnVzc2lhXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsIC8vIG9uY2UgZXZlcnkgMzUwIG1zIOKJiCAxODAgcmVxdWVzdHMgcGVyIG1pbnV0ZSDiiYggMyByZXF1ZXN0cyBwZXIgc2Vjb25kXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NDkxLTFiMGVhOTU2LTVlZGEtMTFlNy05MjI1LTQwZDY3YjQ4MWI4ZC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLmV4bW8uY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2V4bW8ubWUnLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vZXhtby5tZS9ydS9hcGlfZG9jJyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vZXhtby1kZXYvZXhtb19hcGlfbGliL3RyZWUvbWFzdGVyL25vZGVqcycsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnY3VycmVuY3knLFxuICAgICAgICAgICAgICAgICdvcmRlcl9ib29rJyxcbiAgICAgICAgICAgICAgICAncGFpcl9zZXR0aW5ncycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICd1c2VyX2luZm8nLFxuICAgICAgICAgICAgICAgICdvcmRlcl9jcmVhdGUnLFxuICAgICAgICAgICAgICAgICdvcmRlcl9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICd1c2VyX29wZW5fb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAndXNlcl90cmFkZXMnLFxuICAgICAgICAgICAgICAgICd1c2VyX2NhbmNlbGxlZF9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcl90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdyZXF1aXJlZF9hbW91bnQnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0X2FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd19jcnlwdCcsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2dldF90eGlkJyxcbiAgICAgICAgICAgICAgICAnZXhjb2RlX2NyZWF0ZScsXG4gICAgICAgICAgICAgICAgJ2V4Y29kZV9sb2FkJyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0X2hpc3RvcnknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0UGFpclNldHRpbmdzICgpO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0cyk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgaWQgPSBrZXlzW3BdO1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1tpZF07XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gaWQucmVwbGFjZSAoJ18nLCAnLycpO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RVc2VySW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyQm9vayAoe1xuICAgICAgICAgICAgJ3BhaXInOiBwWydpZCddLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IHJlc3BvbnNlW3BbJ2lkJ11dO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IHsgJ2JpZHMnOiAnYmlkJywgJ2Fza3MnOiAnYXNrJyB9O1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChzaWRlcyk7XG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwga2V5cy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgbGV0IGtleSA9IGtleXNba107XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW2tleV07XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbMF0pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsxXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICgpO1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVtwWydpZCddXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndXBkYXRlZCddICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eV9wcmljZSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGxfcHJpY2UnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RfdHJhZGUnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXZnJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sX2N1cnInXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgcHJlZml4ID0gJyc7XG4gICAgICAgIGlmICh0eXBlID09J21hcmtldCcpXG4gICAgICAgICAgICBwcmVmaXggPSAnbWFya2V0Xyc7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3F1YW50aXR5JzogYW1vdW50LFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UgfHwgMCxcbiAgICAgICAgICAgICd0eXBlJzogcHJlZml4ICsgc2lkZSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RPcmRlckNyZWF0ZSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoeyAnbm9uY2UnOiBub25jZSB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdLZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnU2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBmeWIgPSB7XG5cbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndGlja2VyZGV0YWlsZWQnLFxuICAgICAgICAgICAgICAgICdvcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAndGVzdCcsXG4gICAgICAgICAgICAgICAgJ2dldGFjY2luZm8nLFxuICAgICAgICAgICAgICAgICdnZXRwZW5kaW5nb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZ2V0b3JkZXJoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnY2FuY2VscGVuZGluZ29yZGVyJyxcbiAgICAgICAgICAgICAgICAncGxhY2VvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0R2V0YWNjaW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0T3JkZXJib29rICgpO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IFsgJ2JpZHMnLCAnYXNrcycgXTtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBzaWRlcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1tzXTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlclswXSk7XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IHBhcnNlRmxvYXQgKG9yZGVyWzFdKTtcbiAgICAgICAgICAgICAgICByZXN1bHRbc2lkZV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlcmRldGFpbGVkICgpO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbG93JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0UGxhY2VvcmRlciAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdxdHknOiBhbW91bnQsXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZVswXS50b1VwcGVyQ2FzZSAoKVxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykgeyAgICAgICAgICAgXG4gICAgICAgICAgICB1cmwgKz0gJy5qc29uJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7ICd0aW1lc3RhbXAnOiBub25jZSB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnc2lnJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTEnKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGZ5YnNlID0gZXh0ZW5kIChmeWIsIHtcbiAgICAnaWQnOiAnZnlic2UnLFxuICAgICduYW1lJzogJ0ZZQi1TRScsXG4gICAgJ2NvdW50cmllcyc6ICdTRScsIC8vIFN3ZWRlblxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NTEyLTMxMDE5NzcyLTVlZGItMTFlNy04MjQxLTJlNjc1ZTY3OTdmMS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vd3d3LmZ5YnNlLnNlL2FwaS9TRUsnLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmZ5YnNlLnNlJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwOi8vZG9jcy5meWIuYXBpYXJ5LmlvJyxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9TRUsnOiB7ICdpZCc6ICdTRUsnLCAnc3ltYm9sJzogJ0JUQy9TRUsnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnU0VLJyB9LFxuICAgIH0sXG59KVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBmeWJzZyA9IGV4dGVuZCAoZnliLCB7XG4gICAgJ2lkJzogJ2Z5YnNnJyxcbiAgICAnbmFtZSc6ICdGWUItU0cnLFxuICAgICdjb3VudHJpZXMnOiAnU0cnLCAvLyBTaW5nYXBvcmVcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjUxMy0zMzY0ZDU2YS01ZWRiLTExZTctOWU2Yi1kNTg5OGJiODljODEuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5meWJzZy5jb20vYXBpL1NHRCcsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuZnlic2cuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwOi8vZG9jcy5meWIuYXBpYXJ5LmlvJyxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9TR0QnOiB7ICdpZCc6ICdTR0QnLCAnc3ltYm9sJzogJ0JUQy9TR0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnU0dEJyB9LFxuICAgIH0sXG59KVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBnZGF4ID0ge1xuICAgICdpZCc6ICdnZGF4JyxcbiAgICAnbmFtZSc6ICdHREFYJyxcbiAgICAnY291bnRyaWVzJzogJ1VTJyxcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjUyNy1iMWJlNDFjNi01ZWRiLTExZTctOTVmNi01YjQ5NmM0NjllMmMuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5nZGF4LmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuZ2RheC5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vZG9jcy5nZGF4LmNvbScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnY3VycmVuY2llcycsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzJyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdHMve2lkfS9ib29rJyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdHMve2lkfS9jYW5kbGVzJyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdHMve2lkfS9zdGF0cycsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzL3tpZH0vdGlja2VyJyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdHMve2lkfS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICd0aW1lJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdhY2NvdW50cy97aWR9JyxcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMve2lkfS9ob2xkcycsXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL3tpZH0vbGVkZ2VyJyxcbiAgICAgICAgICAgICAgICAnY29pbmJhc2UtYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdmaWxscycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRpbmcnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3BheW1lbnQtbWV0aG9kcycsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uJyxcbiAgICAgICAgICAgICAgICAncmVwb3J0cy97aWR9JyxcbiAgICAgICAgICAgICAgICAndXNlcnMvc2VsZi90cmFpbGluZy12b2x1bWUnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdkZXBvc2l0cy9jb2luYmFzZS1hY2NvdW50JyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdHMvcGF5bWVudC1tZXRob2QnLFxuICAgICAgICAgICAgICAgICdmdW5kaW5nL3JlcGF5JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vY2xvc2UnLFxuICAgICAgICAgICAgICAgICdwcm9maWxlcy9tYXJnaW4tdHJhbnNmZXInLFxuICAgICAgICAgICAgICAgICdyZXBvcnRzJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMvY29pbmJhc2UnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy9jcnlwdG8nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy9wYXltZW50LW1ldGhvZCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlbGV0ZSc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0UHJvZHVjdHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1twXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ2lkJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ2Jhc2VfY3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ3F1b3RlX2N1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlOyAgICAgICAgICAgIFxuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0QWNjb3VudHMgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFByb2R1Y3RzSWRCb29rICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnbGV2ZWwnOiAyLCAvLyAxIGJlc3QgYmlkYXNrLCAyIGFnZ3JlZ2F0ZWQsIDMgZnVsbFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbMF0pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsxXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFByb2R1Y3RzSWRUaWNrZXIgKHtcbiAgICAgICAgICAgICdpZCc6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgcXVvdGUgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFByb2R1Y3RzSWRTdGF0cyAoe1xuICAgICAgICAgICAgJ2lkJzogcFsnaWQnXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLnBhcnNlODYwMSAodGlja2VyWyd0aW1lJ10pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAocXVvdGVbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAocXVvdGVbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0IChxdW90ZVsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAocXVvdGVbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0UHJvZHVjdHNJZFRyYWRlcyAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLCAvLyBmaXhlcyBpc3N1ZSAjMlxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdjbGllbnRfb2lkJzogdGhpcy5ub25jZSAoKSxcbiAgICAgICAgICAgICdwcm9kdWN0X2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3NpemUnOiBhbW91bnQsXG4gICAgICAgICAgICAndHlwZSc6IHR5cGUsICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgcmVxdWVzdCA9ICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyByZXF1ZXN0O1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgbGV0IHdoYXQgPSBub25jZSArIG1ldGhvZCArIHJlcXVlc3QgKyAoYm9keSB8fCAnJyk7XG4gICAgICAgICAgICBsZXQgc2VjcmV0ID0gdGhpcy5iYXNlNjRUb0JpbmFyeSAodGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaGFzaCAod2hhdCwgc2VjcmV0LCAnc2hhMjU2JywgJ2JpbmFyeScpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ0ItQUNDRVNTLUtFWSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdDQi1BQ0NFU1MtU0lHTic6IHRoaXMuc3RyaW5nVG9CYXNlNjQgKHNpZ25hdHVyZSksXG4gICAgICAgICAgICAgICAgJ0NCLUFDQ0VTUy1USU1FU1RBTVAnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnQ0ItQUNDRVNTLVBBU1NQSFJBU0UnOiB0aGlzLnBhc3N3b3JkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRCRCBSRVFVSVJFUyAyRkEgVklBIEFVVEhZLCBBIEJBTksgQUNDT1VOVCwgSURFTlRJVFkgVkVSSUZJQ0FUSU9OIFRPIFNUQVJUXG5cbnZhciBnZW1pbmkgPSB7XG4gICAgJ2lkJzogJ2dlbWluaScsXG4gICAgJ25hbWUnOiAnR2VtaW5pJyxcbiAgICAnY291bnRyaWVzJzogJ1VTJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCwgLy8gMjAwIGZvciBwcml2YXRlIEFQSVxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzgxNjg1Ny1jZTdiZTY0NC02MDk2LTExZTctODJkNi0zYzI1NzI2MzIyOWMuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5nZW1pbmkuY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2dlbWluaS5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vZG9jcy5nZW1pbmkuY29tL3Jlc3QtYXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdzeW1ib2xzJyxcbiAgICAgICAgICAgICAgICAncHVidGlja2VyL3tzeW1ib2x9JyxcbiAgICAgICAgICAgICAgICAnYm9vay97c3ltYm9sfScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97c3ltYm9sfScsXG4gICAgICAgICAgICAgICAgJ2F1Y3Rpb24ve3N5bWJvbH0nLFxuICAgICAgICAgICAgICAgICdhdWN0aW9uL3tzeW1ib2x9L2hpc3RvcnknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXIvbmV3JyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY2FuY2VsL3Nlc3Npb24nLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwvYWxsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvc3RhdHVzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnbXl0cmFkZXMnLFxuICAgICAgICAgICAgICAgICd0cmFkZXZvbHVtZScsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdC97Y3VycmVuY3l9L25ld0FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdy97Y3VycmVuY3l9JyxcbiAgICAgICAgICAgICAgICAnaGVhcnRiZWF0JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFN5bWJvbHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1twXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3Q7XG4gICAgICAgICAgICBsZXQgdXBwZXJjYXNlUHJvZHVjdCA9IHByb2R1Y3QudG9VcHBlckNhc2UgKCk7XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHVwcGVyY2FzZVByb2R1Y3Quc2xpY2UgKDAsIDMpO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gdXBwZXJjYXNlUHJvZHVjdC5zbGljZSAoMywgNik7XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRCb29rU3ltYm9sICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbJ3ByaWNlJ10pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsnYW1vdW50J10pO1xuICAgICAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAob3JkZXJbJ3RpbWVzdGFtcCddKSAqIDEwMDA7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCwgdGltZXN0YW1wIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0UHVidGlja2VyU3ltYm9sICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogcFsnaWQnXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3ZvbHVtZSddWyd0aW1lc3RhbXAnXTtcbiAgICAgICAgbGV0IGJhc2VWb2x1bWUgPSBwWydiYXNlJ107XG4gICAgICAgIGxldCBxdW90ZVZvbHVtZSA9IHBbJ3F1b3RlJ107XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbG93JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ11bYmFzZVZvbHVtZV0pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXVtxdW90ZVZvbHVtZV0pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlc1N5bWJvbCAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZXMgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0JylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAodGhpcy5pZCArICcgYWxsb3dzIGxpbWl0IG9yZGVycyBvbmx5Jyk7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdjbGllbnRfb3JkZXJfaWQnOiB0aGlzLm5vbmNlICgpLFxuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQudG9TdHJpbmcgKCksXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZS50b1N0cmluZyAoKSxcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICd0eXBlJzogJ2V4Y2hhbmdlIGxpbWl0JywgLy8gZ2VtaW5pIGFsbG93cyBsaW1pdCBvcmRlcnMgb25seVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyTmV3ICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdyZXF1ZXN0JzogdXJsLFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcXVlcnkpO1xuICAgICAgICAgICAgbGV0IHBheWxvYWQgPSB0aGlzLnN0cmluZ1RvQmFzZTY0IChKU09OLnN0cmluZ2lmeSAocmVxdWVzdCkpO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaG1hYyAocGF5bG9hZCwgdGhpcy5zZWNyZXQsICdzaGEzODQnKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L3BsYWluJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiAwLFxuICAgICAgICAgICAgICAgICdYLUdFTUlOSS1BUElLRVknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnWC1HRU1JTkktUEFZTE9BRCc6IHBheWxvYWQsXG4gICAgICAgICAgICAgICAgJ1gtR0VNSU5JLVNJR05BVFVSRSc6IHNpZ25hdHVyZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHVybDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBoaXRidGMgPSB7XG5cbiAgICAnaWQnOiAnaGl0YnRjJyxcbiAgICAnbmFtZSc6ICdIaXRCVEMnLFxuICAgICdjb3VudHJpZXMnOiAnSEsnLCAvLyBIb25nIEtvbmdcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndmVyc2lvbic6ICcxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjU1NS04ZWFlYzIwZS01ZWRjLTExZTctOWM1Yi02ZGM2OWZjNDJmNWUuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwOi8vYXBpLmhpdGJ0Yy5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vaGl0YnRjLmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9oaXRidGMuY29tL2FwaScsXG4gICAgICAgICAgICAnaHR0cDovL2hpdGJ0Yy1jb20uZ2l0aHViLmlvL2hpdGJ0Yy1hcGknLFxuICAgICAgICAgICAgJ2h0dHA6Ly9qc2ZpZGRsZS5uZXQvYm1rbmlnaHQvUnFiWUInLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3tzeW1ib2x9L29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ3tzeW1ib2x9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3tzeW1ib2x9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3tzeW1ib2x9L3RyYWRlcy9yZWNlbnQnLFxuICAgICAgICAgICAgICAgICdzeW1ib2xzJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndGltZSwnXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAndHJhZGluZyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3JlY2VudCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzL2J5L29yZGVyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnbmV3X29yZGVyJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVyJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVycycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncGF5bWVudCc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdhZGRyZXNzL3tjdXJyZW5jeX0nLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMve3RyYW5zYWN0aW9ufScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyX3RvX3RyYWRpbmcnLFxuICAgICAgICAgICAgICAgICd0cmFuc2Zlcl90b19tYWluJyxcbiAgICAgICAgICAgICAgICAnYWRkcmVzcy97Y3VycmVuY3l9JyxcbiAgICAgICAgICAgICAgICAncGF5b3V0JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0U3ltYm9scyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzWydzeW1ib2xzJ10ubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3N5bWJvbHMnXVtwXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ3N5bWJvbCddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0Wydjb21tb2RpdHknXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ2N1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFkaW5nR2V0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0U3ltYm9sT3JkZXJib29rICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbMF0pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsxXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRTeW1ib2xUaWNrZXIgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd0aW1lc3RhbXAnXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lX3F1b3RlJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFN5bWJvbFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnY2xpZW50T3JkZXJJZCc6IHRoaXMubm9uY2UgKCksXG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3F1YW50aXR5JzogYW1vdW50LFxuICAgICAgICAgICAgJ3R5cGUnOiB0eXBlLCAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhZGluZ1Bvc3ROZXdPcmRlciAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9ICcvYXBpLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0eXBlICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgcXVlcnkgPSB0aGlzLmV4dGVuZCAoeyAnbm9uY2UnOiBub25jZSwgJ2FwaWtleSc6IHRoaXMuYXBpS2V5IH0sIHF1ZXJ5KTtcbiAgICAgICAgICAgIGlmIChtZXRob2QgPT0gJ1BPU1QnKVxuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnWC1TaWduYXR1cmUnOiB0aGlzLmhtYWMgKHVybCArIChib2R5IHx8ICcnKSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKS50b0xvd2VyQ2FzZSAoKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHVybDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBodW9iaSA9IHtcblxuICAgICdpZCc6ICdodW9iaScsXG4gICAgJ25hbWUnOiAnSHVvYmknLFxuICAgICdjb3VudHJpZXMnOiAnQ04nLFxuICAgICdyYXRlTGltaXQnOiA1MDAwLFxuICAgICd2ZXJzaW9uJzogJ3YzJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjU2OS0xNWFhN2I5YS01ZWRkLTExZTctOWU3Zi00NDc5MWY0ZWU0OWMuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwOi8vYXBpLmh1b2JpLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuaHVvYmkuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2dpdGh1Yi5jb20vaHVvYmlhcGkvQVBJX0RvY3NfZW4vd2lraScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAnc3RhdGljbWFya2V0Jzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAne2lkfV9rbGluZV97cGVyaW9kfScsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcl97aWR9JyxcbiAgICAgICAgICAgICAgICAnZGVwdGhfe2lkfScsXG4gICAgICAgICAgICAgICAgJ2RlcHRoX3tpZH1fe2xlbmd0aH0nLFxuICAgICAgICAgICAgICAgICdkZXRhaWxfe2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAndXNkbWFya2V0Jzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAne2lkfV9rbGluZV97cGVyaW9kfScsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcl97aWR9JyxcbiAgICAgICAgICAgICAgICAnZGVwdGhfe2lkfScsXG4gICAgICAgICAgICAgICAgJ2RlcHRoX3tpZH1fe2xlbmd0aH0nLFxuICAgICAgICAgICAgICAgICdkZXRhaWxfe2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAndHJhZGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnZ2V0X2FjY291bnRfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2dldF9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcl9pbmZvJyxcbiAgICAgICAgICAgICAgICAnYnV5JyxcbiAgICAgICAgICAgICAgICAnc2VsbCcsXG4gICAgICAgICAgICAgICAgJ2J1eV9tYXJrZXQnLFxuICAgICAgICAgICAgICAgICdzZWxsX21hcmtldCcsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldF9uZXdfZGVhbF9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdnZXRfb3JkZXJfaWRfYnlfdHJhZGVfaWQnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd19jb2luJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX3dpdGhkcmF3X2NvaW4nLFxuICAgICAgICAgICAgICAgICdnZXRfd2l0aGRyYXdfY29pbl9yZXN1bHQnLFxuICAgICAgICAgICAgICAgICd0cmFuc2ZlcicsXG4gICAgICAgICAgICAgICAgJ2xvYW4nLFxuICAgICAgICAgICAgICAgICdyZXBheW1lbnQnLFxuICAgICAgICAgICAgICAgICdnZXRfbG9hbl9hdmFpbGFibGUnLFxuICAgICAgICAgICAgICAgICdnZXRfbG9hbnMnLFxuICAgICAgICAgICAgXSwgICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9DTlknOiB7ICdpZCc6ICdidGMnLCAnc3ltYm9sJzogJ0JUQy9DTlknLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ05ZJywgJ3R5cGUnOiAnc3RhdGljbWFya2V0JywgJ2NvaW5UeXBlJzogMSwgfSxcbiAgICAgICAgJ0xUQy9DTlknOiB7ICdpZCc6ICdsdGMnLCAnc3ltYm9sJzogJ0xUQy9DTlknLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnQ05ZJywgJ3R5cGUnOiAnc3RhdGljbWFya2V0JywgJ2NvaW5UeXBlJzogMiwgfSxcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdidGMnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJywgJ3R5cGUnOiAndXNkbWFya2V0JywgICAgJ2NvaW5UeXBlJzogMSwgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhZGVQb3N0R2V0QWNjb3VudEluZm8gKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG1ldGhvZCA9IHBbJ3R5cGUnXSArICdHZXREZXB0aElkJztcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXNbbWV0aG9kXSAoeyAnaWQnOiBwWydpZCddIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IG9yZGVyYm9va1snYmlkcyddLFxuICAgICAgICAgICAgJ2Fza3MnOiBvcmRlcmJvb2tbJ2Fza3MnXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG1ldGhvZCA9IHBbJ3R5cGUnXSArICdHZXRUaWNrZXJJZCc7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXNbbWV0aG9kXSAoeyAnaWQnOiBwWydpZCddIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3RpY2tlciddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKHJlc3BvbnNlWyd0aW1lJ10pICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gcFsndHlwZSddICsgJ0dldERldGFpbElkJztcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAoeyAnaWQnOiBwWydpZCddIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3RyYWRlUG9zdCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnY29pbl90eXBlJzogcFsnY29pblR5cGUnXSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAnbWFya2V0JzogcFsncXVvdGUnXS50b0xvd2VyQ2FzZSAoKSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1ldGhvZCArPSB0aGlzLmNhcGl0YWxpemUgKHR5cGUpO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3RyYWRlJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddO1xuICAgICAgICBpZiAodHlwZSA9PSAndHJhZGUnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy9hcGknICsgdGhpcy52ZXJzaW9uO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5rZXlzb3J0ICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdtZXRob2QnOiBwYXRoLFxuICAgICAgICAgICAgICAgICdhY2Nlc3Nfa2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZWQnOiB0aGlzLm5vbmNlICgpLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBsZXQgcXVlcnlTdHJpbmcgPSB0aGlzLnVybGVuY29kZSAodGhpcy5vbWl0IChxdWVyeSwgJ21hcmtldCcpKTtcbiAgICAgICAgICAgIC8vIHNlY3JldCBrZXkgbXVzdCBiZSBhdCB0aGUgZW5kIG9mIHF1ZXJ5IHRvIGJlIHNpZ25lZFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcgKz0gJyZzZWNyZXRfa2V5PScgKyB0aGlzLnNlY3JldDtcbiAgICAgICAgICAgIHF1ZXJ5WydzaWduJ10gPSB0aGlzLmhhc2ggKHF1ZXJ5U3RyaW5nKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsICs9ICcvJyArIHR5cGUgKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcykgKyAnX2pzb24uanMnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgaXRiaXQgPSB7XG5cbiAgICAnaWQnOiAnaXRiaXQnLCAgICBcbiAgICAnbmFtZSc6ICdpdEJpdCcsXG4gICAgJ2NvdW50cmllcyc6ICdVUycsXG4gICAgJ3JhdGVMaW1pdCc6IDMwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3ODIyMTU5LTY2MTUzNjIwLTYwYWQtMTFlNy04OWU3LTAwNWY2ZDdmM2RlMC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLml0Yml0LmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuaXRiaXQuY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3d3dy5pdGJpdC5jb20vYXBpJyxcbiAgICAgICAgICAgICdodHRwczovL2FwaS5pdGJpdC5jb20vZG9jcycsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnbWFya2V0cy97c3ltYm9sfS90aWNrZXInLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzL3tzeW1ib2x9L29yZGVyX2Jvb2snLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzL3tzeW1ib2x9L3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMnLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0nLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vYmFsYW5jZXMve2N1cnJlbmN5Q29kZX0nLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vZnVuZGluZ19oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0cy97d2FsbGV0SWR9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMve3dhbGxldElkfS9vcmRlcnMve29yZGVySWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnd2FsbGV0X3RyYW5zZmVycycsXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMnLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vY3J5cHRvY3VycmVuY3lfZGVwb3NpdHMnLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vY3J5cHRvY3VycmVuY3lfd2l0aGRyYXdhbHMnLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnd2lyZV93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vb3JkZXJzL3tvcmRlcklkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ1hCVFVTRCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdCVEMvU0dEJzogeyAnaWQnOiAnWEJUU0dEJywgJ3N5bWJvbCc6ICdCVEMvU0dEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1NHRCcgfSxcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdYQlRFVVInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRNYXJrZXRzU3ltYm9sT3JkZXJCb29rICh7IFxuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWzBdKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbMV0pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0TWFya2V0c1N5bWJvbFRpY2tlciAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLnBhcnNlODYwMSAodGlja2VyWydzZXJ2ZXJUaW1lVVRDJ10pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoMjRoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93MjRoJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAyNGgnXSksXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlblRvZGF5J10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RQcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZTI0aCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0TWFya2V0c1N5bWJvbFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRXYWxsZXRzICgpO1xuICAgIH0sXG5cbiAgICBub25jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICh0aGlzLmlkICsgJyBhbGxvd3MgbGltaXQgb3JkZXJzIG9ubHknKTtcbiAgICAgICAgYW1vdW50ID0gYW1vdW50LnRvU3RyaW5nICgpO1xuICAgICAgICBwcmljZSA9IHByaWNlLnRvU3RyaW5nICgpO1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICd0eXBlJzogdHlwZSxcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IHBbJ2Jhc2UnXSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAnZGlzcGxheSc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLFxuICAgICAgICAgICAgJ2luc3RydW1lbnQnOiBwWydpZCddLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFRyYWRlQWRkICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGJvZHkgPSAnJztcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gbm9uY2U7XG4gICAgICAgICAgICBsZXQgYXV0aCA9IFsgbWV0aG9kLCB1cmwsIGJvZHksIG5vbmNlLCB0aW1lc3RhbXAgXTtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gbm9uY2UgKyBKU09OLnN0cmluZ2lmeSAoYXV0aCk7XG4gICAgICAgICAgICBsZXQgaGFzaGVkTWVzc2FnZSA9IHRoaXMuaGFzaCAobWVzc2FnZSwgJ3NoYTI1NicsICdiaW5hcnknKTtcbiAgICAgICAgICAgIGxldCBzaWduYXR1cmUgPSB0aGlzLmhtYWMgKHVybCArIGhhc2hlZE1lc3NhZ2UsIHRoaXMuc2VjcmV0LCAnc2hhNTEyJywgJ2Jhc2U2NCcpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQXV0aG9yaXphdGlvbic6IHNlbGYuYXBpS2V5ICsgJzonICsgc2lnbmF0dXJlLFxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgJ1gtQXV0aC1UaW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgJ1gtQXV0aC1Ob25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGp1YmkgPSB7XG5cbiAgICAnaWQnOiAnanViaScsXG4gICAgJ25hbWUnOiAnanViaS5jb20nLFxuICAgICdjb3VudHJpZXMnOiAnQ04nLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjU4MS05ZDM5N2Q5YS01ZWRkLTExZTctOGZiOS01ZDgyMzZjMGU2OTIuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5qdWJpLmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3Lmp1YmkuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL3d3dy5qdWJpLmNvbS9oZWxwL2FwaS5odG1sJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdkZXB0aCcsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfYWRkJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfbGlzdCcsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX3ZpZXcnLFxuICAgICAgICAgICAgICAgICd3YWxsZXQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9DTlknOiAgeyAnaWQnOiAnYnRjJywgICdzeW1ib2wnOiAnQlRDL0NOWScsICAnYmFzZSc6ICdCVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0VUSC9DTlknOiAgeyAnaWQnOiAnZXRoJywgICdzeW1ib2wnOiAnRVRIL0NOWScsICAnYmFzZSc6ICdFVEgnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0FOUy9DTlknOiAgeyAnaWQnOiAnYW5zJywgICdzeW1ib2wnOiAnQU5TL0NOWScsICAnYmFzZSc6ICdBTlMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0JMSy9DTlknOiAgeyAnaWQnOiAnYmxrJywgICdzeW1ib2wnOiAnQkxLL0NOWScsICAnYmFzZSc6ICdCTEsnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0ROQy9DTlknOiAgeyAnaWQnOiAnZG5jJywgICdzeW1ib2wnOiAnRE5DL0NOWScsICAnYmFzZSc6ICdETkMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0RPR0UvQ05ZJzogeyAnaWQnOiAnZG9nZScsICdzeW1ib2wnOiAnRE9HRS9DTlknLCAnYmFzZSc6ICdET0dFJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0VBQy9DTlknOiAgeyAnaWQnOiAnZWFjJywgICdzeW1ib2wnOiAnRUFDL0NOWScsICAnYmFzZSc6ICdFQUMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0VUQy9DTlknOiAgeyAnaWQnOiAnZXRjJywgICdzeW1ib2wnOiAnRVRDL0NOWScsICAnYmFzZSc6ICdFVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0ZaL0NOWSc6ICAgeyAnaWQnOiAnZnonLCAgICdzeW1ib2wnOiAnRlovQ05ZJywgICAnYmFzZSc6ICdGWicsICAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0dPT0MvQ05ZJzogeyAnaWQnOiAnZ29vYycsICdzeW1ib2wnOiAnR09PQy9DTlknLCAnYmFzZSc6ICdHT09DJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0dBTUUvQ05ZJzogeyAnaWQnOiAnZ2FtZScsICdzeW1ib2wnOiAnR0FNRS9DTlknLCAnYmFzZSc6ICdHQU1FJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0hMQi9DTlknOiAgeyAnaWQnOiAnaGxiJywgICdzeW1ib2wnOiAnSExCL0NOWScsICAnYmFzZSc6ICdITEInLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0lGQy9DTlknOiAgeyAnaWQnOiAnaWZjJywgICdzeW1ib2wnOiAnSUZDL0NOWScsICAnYmFzZSc6ICdJRkMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0pCQy9DTlknOiAgeyAnaWQnOiAnamJjJywgICdzeW1ib2wnOiAnSkJDL0NOWScsICAnYmFzZSc6ICdKQkMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0tUQy9DTlknOiAgeyAnaWQnOiAna3RjJywgICdzeW1ib2wnOiAnS1RDL0NOWScsICAnYmFzZSc6ICdLVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0xLQy9DTlknOiAgeyAnaWQnOiAnbGtjJywgICdzeW1ib2wnOiAnTEtDL0NOWScsICAnYmFzZSc6ICdMS0MnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0xTSy9DTlknOiAgeyAnaWQnOiAnbHNrJywgICdzeW1ib2wnOiAnTFNLL0NOWScsICAnYmFzZSc6ICdMU0snLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0xUQy9DTlknOiAgeyAnaWQnOiAnbHRjJywgICdzeW1ib2wnOiAnTFRDL0NOWScsICAnYmFzZSc6ICdMVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ01BWC9DTlknOiAgeyAnaWQnOiAnbWF4JywgICdzeW1ib2wnOiAnTUFYL0NOWScsICAnYmFzZSc6ICdNQVgnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ01FVC9DTlknOiAgeyAnaWQnOiAnbWV0JywgICdzeW1ib2wnOiAnTUVUL0NOWScsICAnYmFzZSc6ICdNRVQnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ01SWUMvQ05ZJzogeyAnaWQnOiAnbXJ5YycsICdzeW1ib2wnOiAnTVJZQy9DTlknLCAnYmFzZSc6ICdNUllDJywgJ3F1b3RlJzogJ0NOWScgfSwgICAgICAgIFxuICAgICAgICAnTVRDL0NOWSc6ICB7ICdpZCc6ICdtdGMnLCAgJ3N5bWJvbCc6ICdNVEMvQ05ZJywgICdiYXNlJzogJ01UQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnTlhUL0NOWSc6ICB7ICdpZCc6ICdueHQnLCAgJ3N5bWJvbCc6ICdOWFQvQ05ZJywgICdiYXNlJzogJ05YVCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUEVCL0NOWSc6ICB7ICdpZCc6ICdwZWInLCAgJ3N5bWJvbCc6ICdQRUIvQ05ZJywgICdiYXNlJzogJ1BFQicsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUEdDL0NOWSc6ICB7ICdpZCc6ICdwZ2MnLCAgJ3N5bWJvbCc6ICdQR0MvQ05ZJywgICdiYXNlJzogJ1BHQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUExDL0NOWSc6ICB7ICdpZCc6ICdwbGMnLCAgJ3N5bWJvbCc6ICdQTEMvQ05ZJywgICdiYXNlJzogJ1BMQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUFBDL0NOWSc6ICB7ICdpZCc6ICdwcGMnLCAgJ3N5bWJvbCc6ICdQUEMvQ05ZJywgICdiYXNlJzogJ1BQQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUUVDL0NOWSc6ICB7ICdpZCc6ICdxZWMnLCAgJ3N5bWJvbCc6ICdRRUMvQ05ZJywgICdiYXNlJzogJ1FFQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUklPL0NOWSc6ICB7ICdpZCc6ICdyaW8nLCAgJ3N5bWJvbCc6ICdSSU8vQ05ZJywgICdiYXNlJzogJ1JJTycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUlNTL0NOWSc6ICB7ICdpZCc6ICdyc3MnLCAgJ3N5bWJvbCc6ICdSU1MvQ05ZJywgICdiYXNlJzogJ1JTUycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnU0tUL0NOWSc6ICB7ICdpZCc6ICdza3QnLCAgJ3N5bWJvbCc6ICdTS1QvQ05ZJywgICdiYXNlJzogJ1NLVCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnVEZDL0NOWSc6ICB7ICdpZCc6ICd0ZmMnLCAgJ3N5bWJvbCc6ICdURkMvQ05ZJywgICdiYXNlJzogJ1RGQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnVlJDL0NOWSc6ICB7ICdpZCc6ICd2cmMnLCAgJ3N5bWJvbCc6ICdWUkMvQ05ZJywgICdiYXNlJzogJ1ZSQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnVlRDL0NOWSc6ICB7ICdpZCc6ICd2dGMnLCAgJ3N5bWJvbCc6ICdWVEMvQ05ZJywgICdiYXNlJzogJ1ZUQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnV0RDL0NOWSc6ICB7ICdpZCc6ICd3ZGMnLCAgJ3N5bWJvbCc6ICdXREMvQ05ZJywgICdiYXNlJzogJ1dEQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWEFTL0NOWSc6ICB7ICdpZCc6ICd4YXMnLCAgJ3N5bWJvbCc6ICdYQVMvQ05ZJywgICdiYXNlJzogJ1hBUycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWFBNL0NOWSc6ICB7ICdpZCc6ICd4cG0nLCAgJ3N5bWJvbCc6ICdYUE0vQ05ZJywgICdiYXNlJzogJ1hQTScsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWFJQL0NOWSc6ICB7ICdpZCc6ICd4cnAnLCAgJ3N5bWJvbCc6ICdYUlAvQ05ZJywgICdiYXNlJzogJ1hSUCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWFNHUy9DTlknOiB7ICdpZCc6ICd4c2dzJywgJ3N5bWJvbCc6ICdYU0dTL0NOWScsICdiYXNlJzogJ1hTR1MnLCAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWVRDL0NOWSc6ICB7ICdpZCc6ICd5dGMnLCAgJ3N5bWJvbCc6ICdZVEMvQ05ZJywgICdiYXNlJzogJ1lUQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWkVUL0NOWSc6ICB7ICdpZCc6ICd6ZXQnLCAgJ3N5bWJvbCc6ICdaRVQvQ05ZJywgICdiYXNlJzogJ1pFVCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWkNDL0NOWSc6ICB7ICdpZCc6ICd6Y2MnLCAgJ3N5bWJvbCc6ICdaQ0MvQ05ZJywgICdiYXNlJzogJ1pDQycsICAncXVvdGUnOiAnQ05ZJyB9LCAgICAgICAgXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0RGVwdGggKHtcbiAgICAgICAgICAgICdjb2luJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBvcmRlcmJvb2tbJ2JpZHMnXSxcbiAgICAgICAgICAgICdhc2tzJzogb3JkZXJib29rWydhc2tzJ10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHsgXG4gICAgICAgICAgICAnY29pbic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRPcmRlcnMgKHtcbiAgICAgICAgICAgICdjb2luJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VHJhZGVBZGQgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UsXG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgICAgICAnY29pbic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHsgIFxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBwYXJhbXMpO1xuICAgICAgICAgICAgcXVlcnlbJ3NpZ25hdHVyZSddID0gdGhpcy5obWFjICh0aGlzLnVybGVuY29kZSAocXVlcnkpLCB0aGlzLmhhc2ggKHRoaXMuc2VjcmV0KSk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtyYWtlbiBpcyBhbHNvIG93bmVyIG9mIGV4LiBDb2luc2V0dGVyIC8gQ2FWaXJ0RXggLyBDbGV2ZXJjb2luXG5cbnZhciBrcmFrZW4gPSB7XG5cbiAgICAnaWQnOiAna3Jha2VuJyxcbiAgICAnbmFtZSc6ICdLcmFrZW4nLFxuICAgICdjb3VudHJpZXMnOiAnVVMnLFxuICAgICd2ZXJzaW9uJzogJzAnLFxuICAgICdyYXRlTGltaXQnOiAzMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NTk5LTIyNzA5MzA0LTVlZGUtMTFlNy05ZGUxLTlmMzM3MzJlMTUwOS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLmtyYWtlbi5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmtyYWtlbi5jb20nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3LmtyYWtlbi5jb20vZW4tdXMvaGVscC9hcGknLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3RoaW5naXNkZWFkL25wbS1rcmFrZW4tYXBpJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdBc3NldHMnLFxuICAgICAgICAgICAgICAgICdBc3NldFBhaXJzJyxcbiAgICAgICAgICAgICAgICAnRGVwdGgnLFxuICAgICAgICAgICAgICAgICdPSExDJyxcbiAgICAgICAgICAgICAgICAnU3ByZWFkJyxcbiAgICAgICAgICAgICAgICAnVGlja2VyJyxcbiAgICAgICAgICAgICAgICAnVGltZScsXG4gICAgICAgICAgICAgICAgJ1RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdBZGRPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdDYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0Nsb3NlZE9yZGVycycsXG4gICAgICAgICAgICAgICAgJ0RlcG9zaXRBZGRyZXNzZXMnLFxuICAgICAgICAgICAgICAgICdEZXBvc2l0TWV0aG9kcycsXG4gICAgICAgICAgICAgICAgJ0RlcG9zaXRTdGF0dXMnLFxuICAgICAgICAgICAgICAgICdMZWRnZXJzJyxcbiAgICAgICAgICAgICAgICAnT3Blbk9yZGVycycsXG4gICAgICAgICAgICAgICAgJ09wZW5Qb3NpdGlvbnMnLCBcbiAgICAgICAgICAgICAgICAnUXVlcnlMZWRnZXJzJywgXG4gICAgICAgICAgICAgICAgJ1F1ZXJ5T3JkZXJzJywgXG4gICAgICAgICAgICAgICAgJ1F1ZXJ5VHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnVHJhZGVCYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnVHJhZGVzSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ1RyYWRlVm9sdW1lJyxcbiAgICAgICAgICAgICAgICAnV2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICdXaXRoZHJhd0NhbmNlbCcsIFxuICAgICAgICAgICAgICAgICdXaXRoZHJhd0luZm8nLCAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ1dpdGhkcmF3U3RhdHVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEFzc2V0UGFpcnMgKCk7XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHByb2R1Y3RzWydyZXN1bHQnXSk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgaWQgPSBrZXlzW3BdO1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sncmVzdWx0J11baWRdO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0WydiYXNlJ107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydxdW90ZSddO1xuICAgICAgICAgICAgaWYgKChiYXNlWzBdID09ICdYJykgfHwgKGJhc2VbMF0gPT0gJ1onKSlcbiAgICAgICAgICAgICAgICBiYXNlID0gYmFzZS5zbGljZSAoMSk7XG4gICAgICAgICAgICBpZiAoKHF1b3RlWzBdID09ICdYJykgfHwgKHF1b3RlWzBdID09ICdaJykpXG4gICAgICAgICAgICAgICAgcXVvdGUgPSBxdW90ZS5zbGljZSAoMSk7XG4gICAgICAgICAgICBiYXNlID0gdGhpcy5jb21tb25DdXJyZW5jeUNvZGUgKGJhc2UpO1xuICAgICAgICAgICAgcXVvdGUgPSB0aGlzLmNvbW1vbkN1cnJlbmN5Q29kZSAocXVvdGUpO1xuICAgICAgICAgICAgbGV0IGRhcmtwb29sID0gaWQuaW5kZXhPZiAoJy5kJykgPj0gMDtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBkYXJrcG9vbCA/IHByb2R1Y3RbJ2FsdG5hbWUnXSA6IChiYXNlICsgJy8nICsgcXVvdGUpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0RGVwdGggICh7XG4gICAgICAgICAgICAncGFpcic6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgb3JkZXJib29rID0gcmVzcG9uc2VbJ3Jlc3VsdCddW3BbJ2lkJ11dO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IFsgJ2JpZHMnLCAnYXNrcycgXTtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBzaWRlcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1tzXTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlclswXSk7XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IHBhcnNlRmxvYXQgKG9yZGVyWzFdKTtcbiAgICAgICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gb3JkZXJbMl0gKiAxMDAwO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQsIHRpbWVzdGFtcCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAncGFpcic6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3Jlc3VsdCddW3BbJ2lkJ11dO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2gnXVsxXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsJ11bMV0pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYiddWzBdKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2EnXVswXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsncCddWzFdKSxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2MnXVswXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2J11bMV0pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdvcmRlcnR5cGUnOiB0eXBlLFxuICAgICAgICAgICAgJ3ZvbHVtZSc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QWRkT3JkZXIgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7ICBcbiAgICAgICAgbGV0IHVybCA9ICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHR5cGUgKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgJ25vbmNlJzogbm9uY2UgfSwgcGFyYW1zKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgcXVlcnkgPSB0aGlzLnN0cmluZ1RvQmluYXJ5ICh1cmwgKyB0aGlzLmhhc2ggKG5vbmNlICsgYm9keSwgJ3NoYTI1NicsICdiaW5hcnknKSk7XG4gICAgICAgICAgICBsZXQgc2VjcmV0ID0gdGhpcy5iYXNlNjRUb0JpbmFyeSAodGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQVBJLUtleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdBUEktU2lnbic6IHRoaXMuaG1hYyAocXVlcnksIHNlY3JldCwgJ3NoYTUxMicsICdiYXNlNjQnKSxcbiAgICAgICAgICAgICAgICAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyB1cmw7XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgbHVubyA9IHtcblxuICAgICdpZCc6ICdsdW5vJyxcbiAgICAnbmFtZSc6ICdsdW5vJyxcbiAgICAnY291bnRyaWVzJzogWyAnR0InLCAnU0cnLCAnWkEnLCBdLFxuICAgICdyYXRlTGltaXQnOiA1MDAwLFxuICAgICd2ZXJzaW9uJzogJzEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NjA3LThjMWE2OWQ4LTVlZGUtMTFlNy05MzBjLTU0MGI1ZWI5YmUyNC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLm15Yml0eC5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5sdW5vLmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9ucG1qcy5vcmcvcGFja2FnZS9iaXR4JyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vYmF1c21laWVyL25vZGUtYml0eCcsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndGlja2VycycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL3tpZH0vcGVuZGluZycsXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL3tpZH0vdHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2ZlZV9pbmZvJyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZ19hZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnbGlzdG9yZGVycycsXG4gICAgICAgICAgICAgICAgJ2xpc3R0cmFkZXMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3F1b3Rlcy97aWR9JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy97aWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdwb3N0b3JkZXInLFxuICAgICAgICAgICAgICAgICdtYXJrZXRvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3N0b3BvcmRlcicsXG4gICAgICAgICAgICAgICAgJ2Z1bmRpbmdfYWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzJyxcbiAgICAgICAgICAgICAgICAnc2VuZCcsXG4gICAgICAgICAgICAgICAgJ3F1b3RlcycsXG4gICAgICAgICAgICAgICAgJ29hdXRoMi9ncmFudCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3B1dCc6IFtcbiAgICAgICAgICAgICAgICAncXVvdGVzL3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ3F1b3Rlcy97aWR9JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMve2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXJzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ3RpY2tlcnMnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sndGlja2VycyddW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsncGFpciddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBpZC5zbGljZSAoMCwgMyk7XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBpZC5zbGljZSAoMywgNik7XG4gICAgICAgICAgICBiYXNlID0gdGhpcy5jb21tb25DdXJyZW5jeUNvZGUgKGJhc2UpO1xuICAgICAgICAgICAgcXVvdGUgPSB0aGlzLmNvbW1vbkN1cnJlbmN5Q29kZSAocXVvdGUpO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyYm9vayAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gb3JkZXJib29rWyd0aW1lc3RhbXAnXTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWydwcmljZSddKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbJ3ZvbHVtZSddKTtcbiAgICAgICAgICAgICAgICAvLyBsZXQgdGltZXN0YW1wID0gb3JkZXJbMl0gKiAxMDAwO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3RpbWVzdGFtcCddO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xvdyc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdF90cmFkZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3JvbGxpbmdfMjRfaG91cl92b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVBvc3QnO1xuICAgICAgICBsZXQgb3JkZXIgPSB7ICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpIH07XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKSB7XG4gICAgICAgICAgICBtZXRob2QgKz0gJ01hcmtldG9yZGVyJztcbiAgICAgICAgICAgIG9yZGVyWyd0eXBlJ10gPSBzaWRlLnRvVXBwZXJDYXNlICgpO1xuICAgICAgICAgICAgaWYgKHNpZGUgPT0gJ2J1eScpXG4gICAgICAgICAgICAgICAgb3JkZXJbJ2NvdW50ZXJfdm9sdW1lJ10gPSBhbW91bnQ7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb3JkZXJbJ2Jhc2Vfdm9sdW1lJ10gPSBhbW91bnQ7ICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXRob2QgKz0gJ09yZGVyJztcbiAgICAgICAgICAgIG9yZGVyWyd2b2x1bWUnXSA9IGFtb3VudDtcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgICAgICBpZiAoc2lkZSA9PSAnYnV5JylcbiAgICAgICAgICAgICAgICBvcmRlclsndHlwZSddID0gJ0JJRCc7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb3JkZXJbJ3R5cGUnXSA9ICdBU0snO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHJpdmF0ZScpIHtcbiAgICAgICAgICAgIGxldCBhdXRoID0gdGhpcy5zdHJpbmdUb0Jhc2U2NCAodGhpcy5hcGlLZXkgKyAnOicgKyB0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnQXV0aG9yaXphdGlvbic6ICdCYXNpYyAnICsgYXV0aCB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgbWVyY2FkbyA9IHtcblxuICAgICdpZCc6ICdtZXJjYWRvJyxcbiAgICAnbmFtZSc6ICdNZXJjYWRvIEJpdGNvaW4nLFxuICAgICdjb3VudHJpZXMnOiAnQlInLCAvLyBCcmF6aWxcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndmVyc2lvbic6ICd2MycsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc4MzcwNjAtZTdjNTg3MTQtNjBlYS0xMWU3LTkxOTItZjA1ZTg2YWRiODNmLmpwZycsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAncHVibGljJzogJ2h0dHBzOi8vd3d3Lm1lcmNhZG9iaXRjb2luLm5ldC9hcGknLFxuICAgICAgICAgICAgJ3ByaXZhdGUnOiAnaHR0cHM6Ly93d3cubWVyY2Fkb2JpdGNvaW4ubmV0L3RhcGknLFxuICAgICAgICB9LFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3Lm1lcmNhZG9iaXRjb2luLmNvbS5icicsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cubWVyY2Fkb2JpdGNvaW4uY29tLmJyL2FwaS1kb2MnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lm1lcmNhZG9iaXRjb2luLmNvbS5ici90cmFkZS1hcGknLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbIC8vIGxhc3Qgc2xhc2ggY3JpdGljYWxcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rLycsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9va19saXRlY29pbi8nLFxuICAgICAgICAgICAgICAgICd0aWNrZXIvJyxcbiAgICAgICAgICAgICAgICAndGlja2VyX2xpdGVjb2luLycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy8nLFxuICAgICAgICAgICAgICAgICd0cmFkZXNfbGl0ZWNvaW4vJyxcbiAgICAgICAgICAgICAgICAndjIvdGlja2VyLycsXG4gICAgICAgICAgICAgICAgJ3YyL3RpY2tlcl9saXRlY29pbi8nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVyJyxcbiAgICAgICAgICAgICAgICAnZ2V0X2FjY291bnRfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2dldF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldF93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9zeXN0ZW1fbWVzc2FnZXMnLFxuICAgICAgICAgICAgICAgICdsaXN0X29yZGVycycsXG4gICAgICAgICAgICAgICAgJ2xpc3Rfb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAncGxhY2VfYnV5X29yZGVyJyxcbiAgICAgICAgICAgICAgICAncGxhY2Vfc2VsbF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2NvaW4nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9CUkwnOiB7ICdpZCc6ICdCUkxCVEMnLCAnc3ltYm9sJzogJ0JUQy9CUkwnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQlJMJywgJ3N1ZmZpeCc6ICcnIH0sXG4gICAgICAgICdMVEMvQlJMJzogeyAnaWQnOiAnQlJMTFRDJywgJ3N5bWJvbCc6ICdMVEMvQlJMJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0JSTCcsICdzdWZmaXgnOiAnTGl0ZWNvaW4nIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwdWJsaWNHZXRPcmRlcmJvb2snICsgdGhpcy5jYXBpdGFsaXplIChwWydzdWZmaXgnXSk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzW21ldGhvZF0gKCk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogb3JkZXJib29rWydiaWRzJ10sXG4gICAgICAgICAgICAnYXNrcyc6IG9yZGVyYm9va1snYXNrcyddLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3B1YmxpY0dldFYyVGlja2VyJyArIHRoaXMuY2FwaXRhbGl6ZSAocFsnc3VmZml4J10pO1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzW21ldGhvZF0gKCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsndGlja2VyJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAodGlja2VyWydkYXRlJ10pICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3B1YmxpY0dldFRyYWRlcycgKyB0aGlzLmNhcGl0YWxpemUgKHBbJ3N1ZmZpeCddKTtcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RHZXRBY2NvdW50SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICh0aGlzLmlkICsgJyBhbGxvd3MgbGltaXQgb3JkZXJzIG9ubHknKTtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlUG9zdFBsYWNlJyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSkgKyAnT3JkZXInO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnY29pbl9wYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3F1YW50aXR5JzogYW1vdW50LFxuICAgICAgICAgICAgJ2xpbWl0X3ByaWNlJzogcHJpY2UsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7ICAgICAgICBcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV0gKyAnLyc7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gcGF0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCArPSB0aGlzLnZlcnNpb24gKyAnLyc7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICd0YXBpX21ldGhvZCc6IHBhdGgsXG4gICAgICAgICAgICAgICAgJ3RhcGlfbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgbGV0IGF1dGggPSAnL3RhcGkvJyArIHRoaXMudmVyc2lvbiAgKyAnLycgKyAnPycgKyBib2R5O1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ1RBUEktSUQnOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnVEFQSS1NQUMnOiB0aGlzLmhtYWMgKGF1dGgsIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gT0tDb2luIFxuLy8gQ2hpbmFcbi8vIGh0dHBzOi8vd3d3Lm9rY29pbi5jb20vXG4vLyBodHRwczovL3d3dy5va2NvaW4uY29tL3Jlc3RfZ2V0U3RhcnRlZC5odG1sXG4vLyBodHRwczovL2dpdGh1Yi5jb20vT0tDb2luL3dlYnNvY2tldFxuLy8gaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2Uvb2tjb2luLmNvbVxuLy8gaHR0cHM6Ly93d3cub2tjb2luLmNuXG4vLyBodHRwczovL3d3dy5va2NvaW4uY24vcmVzdF9nZXRTdGFydGVkLmh0bWxcblxudmFyIG9rY29pbiA9IHtcblxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCwgLy8gdXAgdG8gMzAwMCByZXF1ZXN0cyBwZXIgNSBtaW51dGVzIOKJiCA2MDAgcmVxdWVzdHMgcGVyIG1pbnV0ZSDiiYggMTAgcmVxdWVzdHMgcGVyIHNlY29uZCDiiYggMTAwIG1zXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2RlcHRoJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2VfcmF0ZScsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9kZXB0aCcsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9lc3RpbWF0ZWRfcHJpY2UnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfaG9sZF9hbW91bnQnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfaW5kZXgnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfa2xpbmUnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfcHJpY2VfbGltaXQnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfdGlja2VyJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2tsaW5lJyxcbiAgICAgICAgICAgICAgICAnb3RjcycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsICAgIFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudF9yZWNvcmRzJyxcbiAgICAgICAgICAgICAgICAnYmF0Y2hfdHJhZGUnLFxuICAgICAgICAgICAgICAgICdib3Jyb3dfbW9uZXknLFxuICAgICAgICAgICAgICAgICdib3Jyb3dfb3JkZXJfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2JvcnJvd3NfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9ib3Jyb3cnLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXInLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3RjX29yZGVyJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX3dpdGhkcmF3JyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2JhdGNoX3RyYWRlJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9kZXZvbHZlJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2V4cGxvc2l2ZScsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9vcmRlcl9pbmZvJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX29yZGVyc19pbmZvJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX3Bvc2l0aW9uJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX3Bvc2l0aW9uXzRmaXgnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfdHJhZGUnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfdHJhZGVzX2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfdXNlcmluZm8nLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfdXNlcmluZm9fNGZpeCcsXG4gICAgICAgICAgICAgICAgJ2xlbmRfZGVwdGgnLFxuICAgICAgICAgICAgICAgICdvcmRlcl9mZWUnLFxuICAgICAgICAgICAgICAgICdvcmRlcl9oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfaW5mbycsXG4gICAgICAgICAgICAgICAgJ29yZGVyc19pbmZvJyxcbiAgICAgICAgICAgICAgICAnb3RjX29yZGVyX2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdvdGNfb3JkZXJfaW5mbycsXG4gICAgICAgICAgICAgICAgJ3JlcGF5bWVudCcsXG4gICAgICAgICAgICAgICAgJ3N1Ym1pdF9vdGNfb3JkZXInLFxuICAgICAgICAgICAgICAgICd0cmFkZScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICd0cmFkZV9vdGNfb3JkZXInLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2luZm8nLFxuICAgICAgICAgICAgICAgICd1bnJlcGF5bWVudHNfaW5mbycsXG4gICAgICAgICAgICAgICAgJ3VzZXJpbmZvJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldERlcHRoICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBvcmRlcmJvb2tbJ2JpZHMnXSxcbiAgICAgICAgICAgICdhc2tzJzogb3JkZXJib29rWydhc2tzJ10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsndGlja2VyJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAocmVzcG9uc2VbJ2RhdGUnXSkgKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXMgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFVzZXJpbmZvICgpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcmRlclsndHlwZSddICs9ICdfbWFya2V0JztcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9ICcvYXBpLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyBwYXRoICsgJy5kbyc7ICAgXG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IHRoaXMua2V5c29ydCAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnYXBpX2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICAvLyBzZWNyZXQga2V5IG11c3QgYmUgYXQgdGhlIGVuZCBvZiBxdWVyeVxuICAgICAgICAgICAgbGV0IHF1ZXJ5U3RyaW5nID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KSArICcmc2VjcmV0X2tleT0nICsgdGhpcy5zZWNyZXQ7XG4gICAgICAgICAgICBxdWVyeVsnc2lnbiddID0gdGhpcy5oYXNoIChxdWVyeVN0cmluZykudG9VcHBlckNhc2UgKCk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyB9O1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyB1cmw7XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgb2tjb2luY255ID0gZXh0ZW5kIChva2NvaW4sIHtcbiAgICAnaWQnOiAnb2tjb2luY255JyxcbiAgICAnbmFtZSc6ICdPS0NvaW4gQ05ZJyxcbiAgICAnY291bnRyaWVzJzogJ0NOJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2Njc5Mi04YmU5MTU3YS01ZWU1LTExZTctOTI2Yy02ZDY5YjhkMzM3OGQuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5va2NvaW4uY24nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3Lm9rY29pbi5jbicsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly93d3cub2tjb2luLmNuL3Jlc3RfZ2V0U3RhcnRlZC5odG1sJyxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9DTlknOiB7ICdpZCc6ICdidGNfY255JywgJ3N5bWJvbCc6ICdCVEMvQ05ZJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0xUQy9DTlknOiB7ICdpZCc6ICdsdGNfY255JywgJ3N5bWJvbCc6ICdMVEMvQ05ZJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICB9LFxufSlcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgb2tjb2ludXNkID0gZXh0ZW5kIChva2NvaW4sIHtcbiAgICAnaWQnOiAnb2tjb2ludXNkJyxcbiAgICAnbmFtZSc6ICdPS0NvaW4gVVNEJyxcbiAgICAnY291bnRyaWVzJzogWyAnQ04nLCAnVVMnIF0sXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY3OTEtODlmZmI1MDItNWVlNS0xMWU3LThhNWItYzU5NTBiNjhhYzY1LmpwZycsICAgICAgICBcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5va2NvaW4uY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5va2NvaW4uY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3d3dy5va2NvaW4uY29tL3Jlc3RfZ2V0U3RhcnRlZC5odG1sJyxcbiAgICAgICAgICAgICdodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9va2NvaW4uY29tJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdidGNfdXNkJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0xUQy9VU0QnOiB7ICdpZCc6ICdsdGNfdXNkJywgJ3N5bWJvbCc6ICdMVEMvVVNEJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICB9LFxufSlcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgcGF5bWl1bSA9IHtcblxuICAgICdpZCc6ICdwYXltaXVtJyxcbiAgICAnbmFtZSc6ICdQYXltaXVtJyxcbiAgICAnY291bnRyaWVzJzogWyAnRlInLCAnRVUnLCBdLFxuICAgICdyYXRlTGltaXQnOiAzMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc5MDU2NC1hOTQ1YTlkNC01ZmY5LTExZTctOWQyZC1iNjM1NzYzZjJmMjQuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3BheW1pdW0uY29tL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cucGF5bWl1bS5jb20nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3LnBheW1pdW0uY29tL3BhZ2UvZGV2ZWxvcGVycycsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL1BheW1pdW0vYXBpLWRvY3VtZW50YXRpb24nLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2NvdW50cmllcycsXG4gICAgICAgICAgICAgICAgJ2RhdGEve2lkfS90aWNrZXInLFxuICAgICAgICAgICAgICAgICdkYXRhL3tpZH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnZGF0YS97aWR9L2RlcHRoJyxcbiAgICAgICAgICAgICAgICAnYml0Y29pbl9jaGFydHMve2lkfS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdiaXRjb2luX2NoYXJ0cy97aWR9L2RlcHRoJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnbWVyY2hhbnQvZ2V0X3BheW1lbnQve1VVSUR9JyxcbiAgICAgICAgICAgICAgICAndXNlcicsXG4gICAgICAgICAgICAgICAgJ3VzZXIvYWRkcmVzc2VzJyxcbiAgICAgICAgICAgICAgICAndXNlci9hZGRyZXNzZXMve2J0Y19hZGRyZXNzfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAndXNlci9vcmRlcnMve1VVSUR9JyxcbiAgICAgICAgICAgICAgICAndXNlci9wcmljZV9hbGVydHMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICd1c2VyL29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvYWRkcmVzc2VzJyxcbiAgICAgICAgICAgICAgICAndXNlci9wYXltZW50X3JlcXVlc3RzJyxcbiAgICAgICAgICAgICAgICAndXNlci9wcmljZV9hbGVydHMnLFxuICAgICAgICAgICAgICAgICdtZXJjaGFudC9jcmVhdGVfcGF5bWVudCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlbGV0ZSc6IFtcbiAgICAgICAgICAgICAgICAndXNlci9vcmRlcnMve1VVSUR9L2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcHJpY2VfYWxlcnRzL3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdldXInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0VXNlciAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0RGF0YUlkRGVwdGggICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IFsgJ2JpZHMnLCAnYXNrcycgXTtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBzaWRlcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1tzXTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBvcmRlclsncHJpY2UnXTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gb3JkZXJbJ2Ftb3VudCddO1xuICAgICAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBvcmRlclsndGltZXN0YW1wJ10gKiAxMDAwO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQsIHRpbWVzdGFtcCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXREYXRhSWRUaWNrZXIgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ2F0J10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydwcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndmFyaWF0aW9uJ10pLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldERhdGFJZFRyYWRlcyAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICd0eXBlJzogdGhpcy5jYXBpdGFsaXplICh0eXBlKSArICdPcmRlcicsXG4gICAgICAgICAgICAnY3VycmVuY3knOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnZGlyZWN0aW9uJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RVc2VyT3JkZXJzICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0Q2FuY2VsT3JkZXIgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnb3JkZXJOdW1iZXInOiBpZCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHBhcmFtcyk7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpOyAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGF1dGggPSBub25jZSArIHVybCArIGJvZHk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdBcGktS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ0FwaS1TaWduYXR1cmUnOiB0aGlzLmhtYWMgKGF1dGgsIHRoaXMuc2VjcmV0KSxcbiAgICAgICAgICAgICAgICAnQXBpLU5vbmNlJzogbm9uY2UsICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgcG9sb25pZXggPSB7XG5cbiAgICAnaWQnOiAncG9sb25pZXgnLFxuICAgICduYW1lJzogJ1BvbG9uaWV4JyxcbiAgICAnY291bnRyaWVzJzogJ1VTJyxcbiAgICAncmF0ZUxpbWl0JzogMTAwMCwgLy8gNiBjYWxscyBwZXIgc2Vjb25kXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY4MTctZTk0NTYzMTItNWVlNi0xMWU3LTliM2MtYjYyOGNhNTYyNmE1LmpwZycsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAncHVibGljJzogJ2h0dHBzOi8vcG9sb25pZXguY29tL3B1YmxpYycsXG4gICAgICAgICAgICAncHJpdmF0ZSc6ICdodHRwczovL3BvbG9uaWV4LmNvbS90cmFkaW5nQXBpJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3BvbG9uaWV4LmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9wb2xvbmlleC5jb20vc3VwcG9ydC9hcGkvJyxcbiAgICAgICAgICAgICdodHRwOi8vcGFzdGViaW4uY29tL2RNWDdtWkUwJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdyZXR1cm4yNGhWb2x1bWUnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5DaGFydERhdGEnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5DdXJyZW5jaWVzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuTG9hbk9yZGVycycsXG4gICAgICAgICAgICAgICAgJ3JldHVybk9yZGVyQm9vaycsXG4gICAgICAgICAgICAgICAgJ3JldHVyblRpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3JldHVyblRyYWRlSGlzdG9yeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdidXknLFxuICAgICAgICAgICAgICAgICdjYW5jZWxMb2FuT2ZmZXInLFxuICAgICAgICAgICAgICAgICdjYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ2Nsb3NlTWFyZ2luUG9zaXRpb24nLFxuICAgICAgICAgICAgICAgICdjcmVhdGVMb2FuT2ZmZXInLFxuICAgICAgICAgICAgICAgICdnZW5lcmF0ZU5ld0FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICdnZXRNYXJnaW5Qb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgJ21hcmdpbkJ1eScsXG4gICAgICAgICAgICAgICAgJ21hcmdpblNlbGwnLFxuICAgICAgICAgICAgICAgICdtb3ZlT3JkZXInLFxuICAgICAgICAgICAgICAgICdyZXR1cm5BY3RpdmVMb2FucycsXG4gICAgICAgICAgICAgICAgJ3JldHVybkF2YWlsYWJsZUFjY291bnRCYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ3JldHVybkJhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuQ29tcGxldGVCYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ3JldHVybkRlcG9zaXRBZGRyZXNzZXMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5EZXBvc2l0c1dpdGhkcmF3YWxzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuRmVlSW5mbycsXG4gICAgICAgICAgICAgICAgJ3JldHVybkxlbmRpbmdIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAncmV0dXJuTWFyZ2luQWNjb3VudFN1bW1hcnknLFxuICAgICAgICAgICAgICAgICdyZXR1cm5PcGVuTG9hbk9mZmVycycsXG4gICAgICAgICAgICAgICAgJ3JldHVybk9wZW5PcmRlcnMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5PcmRlclRyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3JldHVyblRyYWRhYmxlQmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5UcmFkZUhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdzZWxsJyxcbiAgICAgICAgICAgICAgICAndG9nZ2xlQXV0b1JlbmV3JyxcbiAgICAgICAgICAgICAgICAndHJhbnNmZXJCYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0UmV0dXJuVGlja2VyICgpO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0cyk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgaWQgPSBrZXlzW3BdO1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1tpZF07XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gaWQucmVwbGFjZSAoJ18nLCAnLycpO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RSZXR1cm5Db21wbGV0ZUJhbGFuY2VzICh7XG4gICAgICAgICAgICAnYWNjb3VudCc6ICdhbGwnLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0UmV0dXJuT3JkZXJCb29rICh7XG4gICAgICAgICAgICAnY3VycmVuY3lQYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbMF0pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsxXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXJzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRSZXR1cm5UaWNrZXIgKCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSB0aWNrZXJzW3BbJ2lkJ11dO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gyNGhyJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93MjRociddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2hlc3RCaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydsb3dlc3RBc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2hhbmdlJzogcGFyc2VGbG9hdCAodGlja2VyWydwZXJjZW50Q2hhbmdlJ10pLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydiYXNlVm9sdW1lJ10pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydxdW90ZVZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRSZXR1cm5UcmFkZUhpc3RvcnkgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeVBhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlUG9zdCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5UGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdyYXRlJzogcHJpY2UsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsT3JkZXIgKGlkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdENhbmNlbE9yZGVyICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ29yZGVyTnVtYmVyJzogaWQsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXVt0eXBlXTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgJ2NvbW1hbmQnOiBwYXRoIH0sIHBhcmFtcyk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHF1ZXJ5Wydub25jZSddID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdTaWduJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIHF1YWRyaWdhY3ggPSB7XG5cbiAgICAnaWQnOiAncXVhZHJpZ2FjeCcsXG4gICAgJ25hbWUnOiAnUXVhZHJpZ2FDWCcsXG4gICAgJ2NvdW50cmllcyc6ICdDQScsXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjInLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2ODI1LTk4YTZkMGRlLTVlZTctMTFlNy05ZmE0LTM4ZTExYTJjNmY1Mi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLnF1YWRyaWdhY3guY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5xdWFkcmlnYWN4LmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly93d3cucXVhZHJpZ2FjeC5jb20vYXBpX2luZm8nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ29yZGVyX2Jvb2snLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLCAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdiaXRjb2luX2RlcG9zaXRfYWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ2JpdGNvaW5fd2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ2J1eScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ2V0aGVyX2RlcG9zaXRfYWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ2V0aGVyX3dpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdsb29rdXBfb3JkZXInLFxuICAgICAgICAgICAgICAgICdvcGVuX29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3NlbGwnLFxuICAgICAgICAgICAgICAgICd1c2VyX3RyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL0NBRCc6IHsgJ2lkJzogJ2J0Y19jYWQnLCAnc3ltYm9sJzogJ0JUQy9DQUQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ0FEJyB9LFxuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ2J0Y191c2QnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnRVRIL0JUQyc6IHsgJ2lkJzogJ2V0aF9idGMnLCAnc3ltYm9sJzogJ0VUSC9CVEMnLCAnYmFzZSc6ICdFVEgnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnRVRIL0NBRCc6IHsgJ2lkJzogJ2V0aF9jYWQnLCAnc3ltYm9sJzogJ0VUSC9DQUQnLCAnYmFzZSc6ICdFVEgnLCAncXVvdGUnOiAnQ0FEJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyQm9vayAoe1xuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKG9yZGVyYm9va1sndGltZXN0YW1wJ10pICogMTAwMDtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWzBdKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbMV0pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAnYm9vayc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAodGlja2VyWyd0aW1lc3RhbXAnXSkgKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYW5zYWN0aW9ucyAoe1xuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlUG9zdCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpOyBcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdib29rJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsT3JkZXIgKGlkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdENhbmNlbE9yZGVyICh0aGlzLmV4dGVuZCAoeyBpZCB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGxldCByZXF1ZXN0ID0gWyBub25jZSwgdGhpcy51aWQsIHRoaXMuYXBpS2V5IF0uam9pbiAoJycpO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaG1hYyAocmVxdWVzdCwgdGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgXG4gICAgICAgICAgICAgICAgJ2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdzaWduYXR1cmUnOiBzaWduYXR1cmUsXG4gICAgICAgICAgICB9LCBwYXJhbXMpO1xuICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5IChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgcXVvaW5lID0ge1xuXG4gICAgJ2lkJzogJ3F1b2luZScsXG4gICAgJ25hbWUnOiAnUVVPSU5FJyxcbiAgICAnY291bnRyaWVzJzogWyAnSlAnLCAnU0cnLCAnVk4nIF0sXG4gICAgJ3ZlcnNpb24nOiAnMicsXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY4NDQtOTYxNWE0ZTgtNWVlOC0xMWU3LTg4MTQtZmNkMDA0ZGI4Y2RkLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkucXVvaW5lLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cucXVvaW5lLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9kZXZlbG9wZXJzLnF1b2luZS5jb20nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzJyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdHMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzL3tpZH0vcHJpY2VfbGV2ZWxzJyxcbiAgICAgICAgICAgICAgICAnZXhlY3V0aW9ucycsXG4gICAgICAgICAgICAgICAgJ2lyX2xhZGRlcnMve2N1cnJlbmN5fScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdjcnlwdG9fYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdleGVjdXRpb25zL21lJyxcbiAgICAgICAgICAgICAgICAnZmlhdF9hY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2xvYW5fYmlkcycsXG4gICAgICAgICAgICAgICAgJ2xvYW5zJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3tpZH0nLFxuICAgICAgICAgICAgICAgICdvcmRlcnMve2lkfS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgICAgICd0cmFkZXMve2lkfS9sb2FucycsXG4gICAgICAgICAgICAgICAgJ3RyYWRpbmdfYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICd0cmFkaW5nX2FjY291bnRzL3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdmaWF0X2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnbG9hbl9iaWRzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncHV0JzogW1xuICAgICAgICAgICAgICAgICdsb2FuX2JpZHMve2lkfS9jbG9zZScsXG4gICAgICAgICAgICAgICAgJ2xvYW5zL3tpZH0nLFxuICAgICAgICAgICAgICAgICdvcmRlcnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ29yZGVycy97aWR9L2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97aWR9JyxcbiAgICAgICAgICAgICAgICAndHJhZGVzL3tpZH0vY2xvc2UnLFxuICAgICAgICAgICAgICAgICd0cmFkZXMvY2xvc2VfYWxsJyxcbiAgICAgICAgICAgICAgICAndHJhZGluZ19hY2NvdW50cy97aWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFByb2R1Y3RzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydpZCddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0WydiYXNlX2N1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydxdW90ZWRfY3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRBY2NvdW50c0JhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFByb2R1Y3RzSWRQcmljZUxldmVscyAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSB7ICdiaWRzJzogJ2J1eV9wcmljZV9sZXZlbHMnLCAnYXNrcyc6ICdzZWxsX3ByaWNlX2xldmVscycgfTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAoc2lkZXMpO1xuICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IGtleXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2tdO1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1trZXldO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWzBdKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbMV0pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQcm9kdWN0c0lkICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2hfbWFya2V0X2FzayddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvd19tYXJrZXRfYmlkJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWFya2V0X2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21hcmtldF9hc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RfdHJhZGVkX3ByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lXzI0aCddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRFeGVjdXRpb25zICh7XG4gICAgICAgICAgICAncHJvZHVjdF9pZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnb3JkZXJfdHlwZSc6IHR5cGUsXG4gICAgICAgICAgICAncHJvZHVjdF9pZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICdxdWFudGl0eSc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXJzICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ29yZGVyJzogb3JkZXIsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQdXRPcmRlcnNJZENhbmNlbCAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9ICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgJ1gtUXVvaW5lLUFQSS1WZXJzaW9uJzogdGhpcy52ZXJzaW9uLFxuICAgICAgICAgICAgJ0NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBsZXQgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICAncGF0aCc6IHVybCwgXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsIFxuICAgICAgICAgICAgICAgICd0b2tlbl9pZCc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdpYXQnOiBNYXRoLmZsb29yIChub25jZSAvIDEwMDApLCAvLyBpc3N1ZWQgYXRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5IChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzWydYLVF1b2luZS1BdXRoJ10gPSB0aGlzLmp3dCAocmVxdWVzdCwgdGhpcy5zZWNyZXQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh0aGlzLnVybHNbJ2FwaSddICsgdXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIHRoZXJvY2sgPSB7XG5cbiAgICAnaWQnOiAndGhlcm9jaycsXG4gICAgJ25hbWUnOiAnVGhlUm9ja1RyYWRpbmcnLFxuICAgICdjb3VudHJpZXMnOiAnTVQnLFxuICAgICdyYXRlTGltaXQnOiAxMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2Njg2OS03NTA1N2ZhMi01ZWU5LTExZTctOWE2Zi0xM2U2NDFmYTQ3MDcuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS50aGVyb2NrdHJhZGluZy5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vdGhlcm9ja3RyYWRpbmcuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2FwaS50aGVyb2NrdHJhZGluZy5jb20vZG9jLycsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZnVuZHMve2lkfS9vcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICdmdW5kcy97aWR9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tpZH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnZnVuZHMvdGlja2VycycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZXMve2lkfScsXG4gICAgICAgICAgICAgICAgJ2Rpc2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2Rpc2NvdW50cy97aWR9JyxcbiAgICAgICAgICAgICAgICAnZnVuZHMnLFxuICAgICAgICAgICAgICAgICdmdW5kcy97aWR9JyxcbiAgICAgICAgICAgICAgICAnZnVuZHMve2lkfS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZnVuZHMve2Z1bmRfaWR9L29yZGVycy97aWR9JywgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9wb3NpdGlvbl9iYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9wb3NpdGlvbnMnLFxuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vcG9zaXRpb25zL3tpZH0nLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2xpbWl0cy97aWR9JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdfbGltaXRzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYXRtcy93aXRoZHJhdycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9vcmRlcnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9vcmRlcnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9vcmRlcnMvcmVtb3ZlX2FsbCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRGdW5kc1RpY2tlcnMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0c1sndGlja2VycyddLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWyd0aWNrZXJzJ11bcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydmdW5kX2lkJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IGlkLnNsaWNlICgwLCAzKTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IGlkLnNsaWNlICgzLCA2KTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0QmFsYW5jZXMgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEZ1bmRzSWRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLnBhcnNlODYwMSAob3JkZXJib29rWydkYXRlJ10pO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbJ3ByaWNlJ10pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsnYW1vdW50J10pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0RnVuZHNJZFRpY2tlciAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMucGFyc2U4NjAxICh0aWNrZXJbJ2RhdGUnXSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogcGFyc2VGbG9hdCAodGlja2VyWydjbG9zZSddKSxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lX3RyYWRlZCddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldEZ1bmRzSWRUcmFkZXMgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0JylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAodGhpcy5pZCArICcgYWxsb3dzIGxpbWl0IG9yZGVycyBvbmx5Jyk7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0RnVuZHNGdW5kSWRPcmRlcnMgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnZnVuZF9pZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwcml2YXRlJykge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ1gtVFJULUtFWSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdYLVRSVC1OT05DRSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdYLVRSVC1TSUdOJzogdGhpcy5obWFjIChub25jZSArIHVybCwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHF1ZXJ5KTtcbiAgICAgICAgICAgICAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIHZhdWx0b3JvID0ge1xuXG4gICAgJ2lkJzogJ3ZhdWx0b3JvJyxcbiAgICAnbmFtZSc6ICdWYXVsdG9ybycsXG4gICAgJ2NvdW50cmllcyc6ICdDSCcsXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsXG4gICAgJ3ZlcnNpb24nOiAnMScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY4ODAtZjIwNWU4NzAtNWVlOS0xMWU3LThmZTItMGQ1YjE1ODgwNzUyLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkudmF1bHRvcm8uY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy52YXVsdG9yby5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vYXBpLnZhdWx0b3JvLmNvbScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYmlkYW5kYXNrJyxcbiAgICAgICAgICAgICAgICAnYnV5b3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnbGF0ZXN0JyxcbiAgICAgICAgICAgICAgICAnbGF0ZXN0dHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0cycsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ3NlbGxvcmRlcnMnLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMvZGF5JyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zL2hvdXInLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMvbW9udGgnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnbXl0cmFkZXMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdidXkve3N5bWJvbH0ve3R5cGV9JyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsL3tvcmRlcmlkJyxcbiAgICAgICAgICAgICAgICAnc2VsbC97c3ltYm9sfS97dHlwZX0nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE1hcmtldHMgKCk7XG4gICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ2RhdGEnXTtcbiAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0WydCYXNlQ3VycmVuY3knXTtcbiAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsnTWFya2V0Q3VycmVuY3knXTtcbiAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgbGV0IGJhc2VJZCA9IGJhc2U7XG4gICAgICAgIGxldCBxdW90ZUlkID0gcXVvdGU7XG4gICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ01hcmtldE5hbWUnXTtcbiAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgJ2Jhc2VJZCc6IGJhc2VJZCxcbiAgICAgICAgICAgICdxdW90ZUlkJzogcXVvdGVJZCxcbiAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyYm9vayAoKTtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IHtcbiAgICAgICAgICAgICdiaWRzJzogcmVzcG9uc2VbJ2RhdGEnXVswXVsnYiddLFxuICAgICAgICAgICAgJ2Fza3MnOiByZXNwb25zZVsnZGF0YSddWzFdWydzJ10sXG4gICAgICAgIH07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IG9yZGVyWydHb2xkX1ByaWNlJ107XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IG9yZGVyWydHb2xkX0Ftb3VudCddO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHF1b3RlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRCaWRhbmRhc2sgKCk7XG4gICAgICAgIGxldCBiaWRzTGVuZ3RoID0gcXVvdGVbJ2JpZHMnXS5sZW5ndGg7XG4gICAgICAgIGxldCBiaWQgPSBxdW90ZVsnYmlkcyddW2JpZHNMZW5ndGggLSAxXTtcbiAgICAgICAgbGV0IGFzayA9IHF1b3RlWydhc2tzJ11bMF07XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0TWFya2V0cyAoKTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydkYXRhJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnMjRoSGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJzI0aExvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBiaWRbMF0sXG4gICAgICAgICAgICAnYXNrJzogYXNrWzBdLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0UHJpY2UnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWycyNGhWb2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhbnNhY3Rpb25zRGF5ICgpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSkgKyAnU3ltYm9sVHlwZSc7XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogcFsncXVvdGVJZCddLnRvTG93ZXJDYXNlICgpLFxuICAgICAgICAgICAgJ3R5cGUnOiB0eXBlLFxuICAgICAgICAgICAgJ2dsZCc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlIHx8IDEsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJztcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIHVybCArPSBwYXRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIHVybCArPSB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdhcGlrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgIH0sIHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKSk7XG4gICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAnWC1TaWduYXR1cmUnOiB0aGlzLmhtYWMgKHVybCwgdGhpcy5zZWNyZXQpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgdmlyd294ID0ge1xuXG4gICAgJ2lkJzogJ3ZpcndveCcsXG4gICAgJ25hbWUnOiAnVmlyV29YJyxcbiAgICAnY291bnRyaWVzJzogJ0FUJyxcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2Njg5NC02ZGE5ZDM2MC01ZWVhLTExZTctOTBhYS00MWYyNzExYjc0MDUuanBnJyxcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdwdWJsaWMnOiAnaHR0cDovL2FwaS52aXJ3b3guY29tL2FwaS9qc29uLnBocCcsXG4gICAgICAgICAgICAncHJpdmF0ZSc6ICdodHRwczovL3d3dy52aXJ3b3guY29tL2FwaS90cmFkaW5nLnBocCcsXG4gICAgICAgIH0sXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cudmlyd294LmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly93d3cudmlyd294LmNvbS9kZXZlbG9wZXJzLnBocCcsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZ2V0SW5zdHJ1bWVudHMnLFxuICAgICAgICAgICAgICAgICdnZXRCZXN0UHJpY2VzJyxcbiAgICAgICAgICAgICAgICAnZ2V0TWFya2V0RGVwdGgnLFxuICAgICAgICAgICAgICAgICdlc3RpbWF0ZU1hcmtldE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnZ2V0VHJhZGVkUHJpY2VWb2x1bWUnLFxuICAgICAgICAgICAgICAgICdnZXRSYXdUcmFkZURhdGEnLFxuICAgICAgICAgICAgICAgICdnZXRTdGF0aXN0aWNzJyxcbiAgICAgICAgICAgICAgICAnZ2V0VGVybWluYWxMaXN0JyxcbiAgICAgICAgICAgICAgICAnZ2V0R3JpZExpc3QnLFxuICAgICAgICAgICAgICAgICdnZXRHcmlkU3RhdGlzdGljcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2dldEluc3RydW1lbnRzJyxcbiAgICAgICAgICAgICAgICAnZ2V0QmVzdFByaWNlcycsXG4gICAgICAgICAgICAgICAgJ2dldE1hcmtldERlcHRoJyxcbiAgICAgICAgICAgICAgICAnZXN0aW1hdGVNYXJrZXRPcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldFRyYWRlZFByaWNlVm9sdW1lJyxcbiAgICAgICAgICAgICAgICAnZ2V0UmF3VHJhZGVEYXRhJyxcbiAgICAgICAgICAgICAgICAnZ2V0U3RhdGlzdGljcycsXG4gICAgICAgICAgICAgICAgJ2dldFRlcm1pbmFsTGlzdCcsXG4gICAgICAgICAgICAgICAgJ2dldEdyaWRMaXN0JyxcbiAgICAgICAgICAgICAgICAnZ2V0R3JpZFN0YXRpc3RpY3MnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdjYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldEJhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAnZ2V0Q29tbWlzc2lvbkRpc2NvdW50JyxcbiAgICAgICAgICAgICAgICAnZ2V0T3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZ2V0VHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAncGxhY2VPcmRlcicsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnZ2V0QmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdnZXRDb21taXNzaW9uRGlzY291bnQnLFxuICAgICAgICAgICAgICAgICdnZXRPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdnZXRUcmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICdwbGFjZU9yZGVyJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEluc3RydW1lbnRzICgpO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0c1sncmVzdWx0J10pO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwga2V5cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sncmVzdWx0J11ba2V5c1twXV07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydpbnN0cnVtZW50SUQnXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBwcm9kdWN0WydzeW1ib2wnXTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gcHJvZHVjdFsnbG9uZ0N1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydzaG9ydEN1cnJlbmN5J107XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0R2V0QmFsYW5jZXMgKCk7XG4gICAgfSxcblxuICAgIGZldGNoQmVzdFByaWNlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNQb3N0R2V0QmVzdFByaWNlcyAoe1xuICAgICAgICAgICAgJ3N5bWJvbHMnOiBbIHRoaXMuc3ltYm9sIChwcm9kdWN0KSBdLFxuICAgICAgICB9KTtcbiAgICB9LCBcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljUG9zdEdldE1hcmtldERlcHRoICh7XG4gICAgICAgICAgICAnc3ltYm9scyc6IFsgdGhpcy5zeW1ib2wgKHByb2R1Y3QpIF0sXG4gICAgICAgICAgICAnYnV5RGVwdGgnOiAxMDAsXG4gICAgICAgICAgICAnc2VsbERlcHRoJzogMTAwLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IHJlc3BvbnNlWydyZXN1bHQnXVswXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSB7ICdiaWRzJzogJ2J1eScsICdhc2tzJzogJ3NlbGwnIH07XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHNpZGVzKTtcbiAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBrZXlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICBsZXQga2V5ID0ga2V5c1trXTtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNba2V5XTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlclsncHJpY2UnXSk7XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IHBhcnNlRmxvYXQgKG9yZGVyWyd2b2x1bWUnXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBlbmQgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHN0YXJ0ID0gZW5kIC0gODY0MDAwMDA7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VHJhZGVkUHJpY2VWb2x1bWUgKHtcbiAgICAgICAgICAgICdpbnN0cnVtZW50JzogdGhpcy5zeW1ib2wgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2VuZERhdGUnOiB0aGlzLnl5eXltbWRkaGhtbXNzIChlbmQpLFxuICAgICAgICAgICAgJ3N0YXJ0RGF0ZSc6IHRoaXMueXl5eW1tZGRoaG1tc3MgKHN0YXJ0KSxcbiAgICAgICAgICAgICdITE9DJzogMSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXJzID0gcmVzcG9uc2VbJ3Jlc3VsdCddWydwcmljZVZvbHVtZUxpc3QnXTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAodGlja2Vycyk7XG4gICAgICAgIGxldCBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgbGV0IGxhc3RLZXkgPSBrZXlzW2xlbmd0aCAtIDFdO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1tsYXN0S2V5XTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhc2snOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogcGFyc2VGbG9hdCAodGlja2VyWydjbG9zZSddKSxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG9uZ1ZvbHVtZSddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2hvcnRWb2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0UmF3VHJhZGVEYXRhICh7XG4gICAgICAgICAgICAnaW5zdHJ1bWVudCc6IHRoaXMuc3ltYm9sIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0aW1lc3Bhbic6IDM2MDAsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2luc3RydW1lbnQnOiB0aGlzLnN5bWJvbCAocHJvZHVjdCksXG4gICAgICAgICAgICAnb3JkZXJUeXBlJzogc2lkZS50b1VwcGVyQ2FzZSAoKSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFBsYWNlT3JkZXIgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddW3R5cGVdO1xuICAgICAgICBsZXQgYXV0aCA9IHt9O1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgYXV0aFsna2V5J10gPSB0aGlzLmFwaUtleTtcbiAgICAgICAgICAgIGF1dGhbJ3VzZXInXSA9IHRoaXMubG9naW47XG4gICAgICAgICAgICBhdXRoWydwYXNzJ10gPSB0aGlzLnBhc3N3b3JkO1xuICAgICAgICB9XG4gICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgIGlmIChtZXRob2QgPT0gJ0dFVCcpIHtcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHsgXG4gICAgICAgICAgICAgICAgJ21ldGhvZCc6IHBhdGgsIFxuICAgICAgICAgICAgICAgICdpZCc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgYXV0aCwgcGFyYW1zKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH07XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHsgXG4gICAgICAgICAgICAgICAgJ21ldGhvZCc6IHBhdGgsIFxuICAgICAgICAgICAgICAgICdwYXJhbXMnOiB0aGlzLmV4dGVuZCAoYXV0aCwgcGFyYW1zKSxcbiAgICAgICAgICAgICAgICAnaWQnOiBub25jZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgeW9iaXQgPSB7XG5cbiAgICAnaWQnOiAneW9iaXQnLFxuICAgICduYW1lJzogJ1lvQml0JyxcbiAgICAnY291bnRyaWVzJzogJ1JVJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCwgLy8gcmVzcG9uc2VzIGFyZSBjYWNoZWQgZXZlcnkgMiBzZWNvbmRzXG4gICAgJ3ZlcnNpb24nOiAnMycsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY5MTAtY2RjYmZkYWUtNWVlYS0xMWU3LTk4NTktMDNmZWE4NzMyNzJkLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly95b2JpdC5uZXQnLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LnlvYml0Lm5ldCcsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly93d3cueW9iaXQubmV0L2VuL2FwaS8nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2RlcHRoL3twYWlyc30nLFxuICAgICAgICAgICAgICAgICdpbmZvJyxcbiAgICAgICAgICAgICAgICAndGlja2VyL3twYWlyc30nLFxuICAgICAgICAgICAgICAgICd0cmFkZXMve3BhaXJzfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAndGFwaSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdBY3RpdmVPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdDYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0dldERlcG9zaXRBZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnZ2V0SW5mbycsXG4gICAgICAgICAgICAgICAgJ09yZGVySW5mbycsXG4gICAgICAgICAgICAgICAgJ1RyYWRlJywgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ1RyYWRlSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ1dpdGhkcmF3Q29pbnNUb0FkZHJlc3MnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMuYXBpR2V0SW5mbyAoKTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAocHJvZHVjdHNbJ3BhaXJzJ10pO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwga2V5cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IGlkID0ga2V5c1twXTtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3BhaXJzJ11baWRdO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGlkLnRvVXBwZXJDYXNlICgpLnJlcGxhY2UgKCdfJywgJy8nKTtcbiAgICAgICAgICAgIGxldCBbIGJhc2UsIHF1b3RlIF0gPSBzeW1ib2wuc3BsaXQgKCcvJyk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcGlQb3N0R2V0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmFwaUdldERlcHRoUGFpcnMgKHtcbiAgICAgICAgICAgICdwYWlycyc6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgb3JkZXJib29rID0gcmVzcG9uc2VbcFsnaWQnXV07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogb3JkZXJib29rWydiaWRzJ10sXG4gICAgICAgICAgICAnYXNrcyc6IG9yZGVyYm9va1snYXNrcyddLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VycyA9IGF3YWl0IHRoaXMuYXBpR2V0VGlja2VyUGFpcnMgKHtcbiAgICAgICAgICAgICdwYWlycyc6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1twWydpZCddXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndXBkYXRlZCddICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXZnJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbF9jdXInXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcGlHZXRUcmFkZXNQYWlycyAoe1xuICAgICAgICAgICAgJ3BhaXJzJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICh0aGlzLmlkICsgJyBhbGxvd3MgbGltaXQgb3JkZXJzIG9ubHknKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFwaVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdyYXRlJzogcHJpY2UsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcGlQb3N0Q2FuY2VsT3JkZXIgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnb3JkZXJfaWQnOiBpZCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAnYXBpJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdHlwZTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2FwaScpIHtcbiAgICAgICAgICAgIHVybCArPSAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgJ21ldGhvZCc6IHBhdGgsICdub25jZSc6IG5vbmNlIH0sIHBhcmFtcyk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnc2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciB6YWlmID0ge1xuXG4gICAgJ2lkJzogJ3phaWYnLFxuICAgICduYW1lJzogJ1phaWYnLFxuICAgICdjb3VudHJpZXMnOiAnSlAnLFxuICAgICdyYXRlTGltaXQnOiAzMDAwLFxuICAgICd2ZXJzaW9uJzogJzEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2OTI3LTM5Y2EyYWRhLTVlZWItMTFlNy05NzJmLTFiNDE5OTUxOGNhNi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLnphaWYuanAnLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vemFpZi5qcCcsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9jb3JwLnphaWYuanAvYXBpLWRvY3MnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vY29ycC56YWlmLmpwL2FwaS1kb2NzL2FwaV9saW5rcycsXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvemFpZi5qcCcsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL3lvdTIxOTc5L25vZGUtemFpZicsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAnYXBpJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZGVwdGgve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnY3VycmVuY2llcy97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdjdXJyZW5jaWVzL2FsbCcsXG4gICAgICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXJzL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXJzL2FsbCcsXG4gICAgICAgICAgICAgICAgJ2xhc3RfcHJpY2Uve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAndGlja2VyL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97cGFpcn0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3RhcGknOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYWN0aXZlX29yZGVycycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRfaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ2dldF9pZF9pbmZvJyxcbiAgICAgICAgICAgICAgICAnZ2V0X2luZm8nLFxuICAgICAgICAgICAgICAgICdnZXRfaW5mbzInLFxuICAgICAgICAgICAgICAgICdnZXRfcGVyc29uYWxfaW5mbycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdfaGlzdG9yeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAnZWNhcGknOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnY3JlYXRlSW52b2ljZScsXG4gICAgICAgICAgICAgICAgJ2dldEludm9pY2UnLFxuICAgICAgICAgICAgICAgICdnZXRJbnZvaWNlSWRzQnlPcmRlck51bWJlcicsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbEludm9pY2UnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMuYXBpR2V0Q3VycmVuY3lQYWlyc0FsbCAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnY3VycmVuY3lfcGFpciddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IHByb2R1Y3RbJ25hbWUnXTtcbiAgICAgICAgICAgIGxldCBbIGJhc2UsIHF1b3RlIF0gPSBzeW1ib2wuc3BsaXQgKCcvJyk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcGlQb3N0R2V0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMuYXBpR2V0RGVwdGhQYWlyICAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IG9yZGVyYm9va1snYmlkcyddLFxuICAgICAgICAgICAgJ2Fza3MnOiBvcmRlcmJvb2tbJ2Fza3MnXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLmFwaUdldFRpY2tlclBhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFwaUdldFRyYWRlc1BhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICh0aGlzLmlkICsgJyBhbGxvd3MgbGltaXQgb3JkZXJzIG9ubHknKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFwaVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeV9wYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2FjdGlvbic6IChzaWRlID09ICdidXknKSA/ICdiaWQnIDogJ2FzaycsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcGlQb3N0Q2FuY2VsT3JkZXIgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnb3JkZXJfaWQnOiBpZCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAnYXBpJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdHlwZTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2FwaScpIHtcbiAgICAgICAgICAgIHVybCArPSAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdtZXRob2QnOiBwYXRoLFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAnS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1NpZ24nOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG52YXIgbWFya2V0cyA9IHtcblxuICAgICdfMWJyb2tlcic6ICAgIF8xYnJva2VyLFxuICAgICdfMWJ0Y3hlJzogICAgIF8xYnRjeGUsXG4gICAgJ2FueHBybyc6ICAgICAgYW54cHJvLFxuICAgICdiaXQyYyc6ICAgICAgIGJpdDJjLFxuICAgICdiaXRiYXknOiAgICAgIGJpdGJheSxcbiAgICAnYml0YmF5cyc6ICAgICBiaXRiYXlzLFxuICAgICdiaXRjb2luY29pZCc6IGJpdGNvaW5jb2lkLFxuICAgICdiaXRmaW5leCc6ICAgIGJpdGZpbmV4LFxuICAgICdiaXRsaXNoJzogICAgIGJpdGxpc2gsXG4gICAgJ2JpdG1hcmtldCc6ICAgYml0bWFya2V0LFxuICAgICdiaXRtZXgnOiAgICAgIGJpdG1leCxcbiAgICAnYml0c28nOiAgICAgICBiaXRzbyxcbiAgICAnYml0c3RhbXAnOiAgICBiaXRzdGFtcCxcbiAgICAnYml0dHJleCc6ICAgICBiaXR0cmV4LFxuICAgICdidGNjaGluYSc6ICAgIGJ0Y2NoaW5hLFxuICAgICdidGNlJzogICAgICAgIGJ0Y2UsXG4gICAgJ2J0Y3gnOiAgICAgICAgYnRjeCxcbiAgICAnYnhpbnRoJzogICAgICBieGludGgsXG4gICAgJ2NjZXgnOiAgICAgICAgY2NleCxcbiAgICAnY2V4JzogICAgICAgICBjZXgsXG4gICAgJ2NvaW5jaGVjayc6ICAgY29pbmNoZWNrLFxuICAgICdjb2lubWF0ZSc6ICAgIGNvaW5tYXRlLFxuICAgICdjb2luc2VjdXJlJzogIGNvaW5zZWN1cmUsXG4gICAgJ2V4bW8nOiAgICAgICAgZXhtbyxcbiAgICAnZnlic2UnOiAgICAgICBmeWJzZSxcbiAgICAnZnlic2cnOiAgICAgICBmeWJzZyxcbiAgICAnZ2RheCc6ICAgICAgICBnZGF4LFxuICAgICdnZW1pbmknOiAgICAgIGdlbWluaSxcbiAgICAnaGl0YnRjJzogICAgICBoaXRidGMsXG4gICAgJ2h1b2JpJzogICAgICAgaHVvYmksXG4gICAgJ2l0Yml0JzogICAgICAgaXRiaXQsXG4gICAgJ2p1YmknOiAgICAgICAganViaSxcbiAgICAna3Jha2VuJzogICAgICBrcmFrZW4sXG4gICAgJ2x1bm8nOiAgICAgICAgbHVubyxcbiAgICAnbWVyY2Fkbyc6ICAgICBtZXJjYWRvLFxuICAgICdva2NvaW5jbnknOiAgIG9rY29pbmNueSxcbiAgICAnb2tjb2ludXNkJzogICBva2NvaW51c2QsXG4gICAgJ3BheW1pdW0nOiAgICAgcGF5bWl1bSxcbiAgICAncG9sb25pZXgnOiAgICBwb2xvbmlleCxcbiAgICAncXVhZHJpZ2FjeCc6ICBxdWFkcmlnYWN4LFxuICAgICdxdW9pbmUnOiAgICAgIHF1b2luZSxcbiAgICAndGhlcm9jayc6ICAgICB0aGVyb2NrLFxuICAgICd2YXVsdG9ybyc6ICAgIHZhdWx0b3JvLFxuICAgICd2aXJ3b3gnOiAgICAgIHZpcndveCxcbiAgICAneW9iaXQnOiAgICAgICB5b2JpdCxcbiAgICAnemFpZic6ICAgICAgICB6YWlmLFxufVxuXG5sZXQgZGVmaW5lQWxsTWFya2V0cyA9IGZ1bmN0aW9uIChtYXJrZXRzKSB7XG4gICAgbGV0IHJlc3VsdCA9IHt9XG4gICAgZm9yIChsZXQgaWQgaW4gbWFya2V0cylcbiAgICAgICAgcmVzdWx0W2lkXSA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWFya2V0IChleHRlbmQgKG1hcmtldHNbaWRdLCBwYXJhbXMpKVxuICAgICAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxufVxuXG5pZiAoaXNOb2RlKVxuICAgIG1vZHVsZS5leHBvcnRzID0gZGVmaW5lQWxsTWFya2V0cyAobWFya2V0cylcbmVsc2VcbiAgICB3aW5kb3cuY2N4dCA9IGRlZmluZUFsbE1hcmtldHMgKG1hcmtldHMpXG5cbn0pICgpIl19