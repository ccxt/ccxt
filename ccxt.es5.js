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
            var response,
                _this65 = this;

            return Promise.resolve().then(function () {
                return _this65.publicGetExchangeAskOrders();
            }).then(function (_resp) {
                response = _resp;

                return response;
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
            var response,
                _this68 = this;

            return Promise.resolve().then(function () {
                return _this68.publicGetOrderBook({
                    'pair': _this68.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
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
            var response,
                _this70 = this;

            return Promise.resolve().then(function () {
                return _this70.publicGetOrderbook();
            }).then(function (_resp) {
                response = _resp;

                return response;
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
            var response,
                _this73 = this;

            return Promise.resolve().then(function () {
                return _this73.publicGetProductsIdBook({
                    'id': _this73.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
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
            var response,
                _this76 = this;

            return Promise.resolve().then(function () {
                return _this76.publicGetBookSymbol({
                    'symbol': _this76.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
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
            var response,
                _this79 = this;

            return Promise.resolve().then(function () {
                return _this79.publicGetSymbolOrderbook({
                    'symbol': _this79.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
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
                response,
                _this81 = this;

            return Promise.resolve().then(function () {
                p = _this81.product(product);
                method = p['type'] + 'GetDepthId';
                return _this81[method]({ 'id': p['id'] });
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
            var response,
                _this83 = this;

            return Promise.resolve().then(function () {
                return _this83.publicGetMarketsSymbolOrderBook({
                    'symbol': _this83.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
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
            var response,
                _this85 = this;

            return Promise.resolve().then(function () {
                return _this85.publicGetDepth({
                    'coin': _this85.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
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
            var response,
                _this88 = this;

            return Promise.resolve().then(function () {
                return _this88.publicGetDepth({
                    'pair': _this88.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;

                return response;
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QixPQUFsQixDQUFkO0FBRUgsQ0F6M09EIiwiZmlsZSI6ImNjeHQuZXM1LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbihmdW5jdGlvbiAoKSB7XG5cbnZhciBpc05vZGUgPSAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGNhcGl0YWxpemUgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5sZW5ndGggPyAoc3RyaW5nLmNoYXJBdCAoMCkudG9VcHBlckNhc2UgKCkgKyBzdHJpbmcuc2xpY2UgKDEpKSA6IHN0cmluZ1xufVxuXG52YXIga2V5c29ydCA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fVxuICAgIE9iamVjdC5rZXlzIChvYmplY3QpLnNvcnQgKCkuZm9yRWFjaCAoa2V5ID0+IHJlc3VsdFtrZXldID0gb2JqZWN0W2tleV0pXG4gICAgcmV0dXJuIHJlc3VsdFxufVxuXG52YXIgZXh0ZW5kID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXG4gICAgICAgIGlmICh0eXBlb2YgYXJndW1lbnRzW2ldID09PSAnb2JqZWN0JylcbiAgICAgICAgICAgIE9iamVjdC5rZXlzIChhcmd1bWVudHNbaV0pLmZvckVhY2ggKGtleSA9PlxuICAgICAgICAgICAgICAgIChyZXN1bHRba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldKSlcbiAgICByZXR1cm4gcmVzdWx0XG59XG5cbnZhciBvbWl0ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciByZXN1bHQgPSBleHRlbmQgKG9iamVjdClcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcbiAgICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbaV0gPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgZGVsZXRlIHJlc3VsdFthcmd1bWVudHNbaV1dXG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkgKGFyZ3VtZW50c1tpXSkpXG4gICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGFyZ3VtZW50c1tpXS5sZW5ndGg7IGsrKylcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVzdWx0W2FyZ3VtZW50c1tpXVtrXV1cbiAgICByZXR1cm4gcmVzdWx0XG59XG5cbnZhciBpbmRleEJ5ID0gZnVuY3Rpb24gKGFycmF5LCBrZXkpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspXG4gICAgICAgIHJlc3VsdFthcnJheVtpXVtrZXldXSA9IGFycmF5W2ldXG4gICAgcmV0dXJuIHJlc3VsdFxufVxuXG52YXIgZmxhdCA9IGZ1bmN0aW9uIChhcnJheSkge1xuICAgIHJldHVybiBhcnJheS5yZWR1Y2UgKChhY2MsIGN1cikgPT4gYWNjLmNvbmNhdCAoY3VyKSwgW10pXG59XG5cbnZhciB1cmxlbmNvZGUgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzIChvYmplY3QpLm1hcCAoa2V5ID0+IFxuICAgICAgICBlbmNvZGVVUklDb21wb25lbnQgKGtleSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQgKG9iamVjdFtrZXldKSkuam9pbiAoJyYnKVxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmlmIChpc05vZGUpIHtcblxuICAgIGNvbnN0IGNyeXB0byA9IHJlcXVpcmUgKCdjcnlwdG8nKVxuICAgIHZhciAgIGZldGNoICA9IHJlcXVpcmUgKCdub2RlLWZldGNoJylcblxuICAgIHZhciBzdHJpbmdUb0JpbmFyeSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tIChzdHJpbmcsICdiaW5hcnknKVxuICAgIH1cblxuICAgIHZhciBzdHJpbmdUb0Jhc2U2NCA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCdWZmZXIgKHN0cmluZykudG9TdHJpbmcgKCdiYXNlNjQnKVxuICAgIH1cblxuICAgIHZhciB1dGYxNlRvQmFzZTY0ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyaW5nVG9CYXNlNjQgKHN0cmluZylcbiAgICB9XG5cbiAgICB2YXIgYmFzZTY0VG9CaW5hcnkgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBCdWZmZXIuZnJvbSAoc3RyaW5nLCAnYmFzZTY0JylcbiAgICB9XG5cbiAgICB2YXIgYmFzZTY0VG9TdHJpbmcgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBCdWZmZXIuZnJvbSAoc3RyaW5nLCAnYmFzZTY0JykudG9TdHJpbmcgKClcbiAgICB9XG5cbiAgICB2YXIgaGFzaCA9IGZ1bmN0aW9uIChyZXF1ZXN0LCBoYXNoID0gJ21kNScsIGRpZ2VzdCA9ICdoZXgnKSB7XG4gICAgICAgIHJldHVybiBjcnlwdG8uY3JlYXRlSGFzaCAoaGFzaCkudXBkYXRlIChyZXF1ZXN0KS5kaWdlc3QgKGRpZ2VzdClcbiAgICB9XG5cbiAgICB2YXIgaG1hYyA9IGZ1bmN0aW9uIChyZXF1ZXN0LCBzZWNyZXQsIGhhc2ggPSAnc2hhMjU2JywgZGlnZXN0ID0gJ2hleCcpIHtcbiAgICAgICAgcmV0dXJuIGNyeXB0by5jcmVhdGVIbWFjIChoYXNoLCBzZWNyZXQpLnVwZGF0ZSAocmVxdWVzdCkuZGlnZXN0IChkaWdlc3QpXG4gICAgfVxuXG59IGVsc2Uge1xuXG4gICAgdmFyIGZldGNoID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucywgdmVyYm9zZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlICgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgIGlmICh2ZXJib3NlKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nICh1cmwsIG9wdGlvbnMpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QgKClcbiAgICAgICAgICAgIHZhciBtZXRob2QgPSBvcHRpb25zLm1ldGhvZCB8fCAnR0VUJ1xuXG4gICAgICAgICAgICB4aHIub3BlbiAobWV0aG9kLCB1cmwsIHRydWUpICAgICAgICAgICAgXG4gICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4geyBcbiAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PSAyMDApXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlICh4aHIucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIChtZXRob2QsIHVybCwgeGhyLnN0YXR1cywgeGhyLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5oZWFkZXJzICE9ICd1bmRlZmluZWQnKVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGhlYWRlciBpbiBvcHRpb25zLmhlYWRlcnMpXG4gICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyIChoZWFkZXIsIG9wdGlvbnMuaGVhZGVyc1toZWFkZXJdKVxuXG4gICAgICAgICAgICB4aHIuc2VuZCAob3B0aW9ucy5ib2R5KVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHZhciBzdHJpbmdUb0JpbmFyeSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIENyeXB0b0pTLmVuYy5MYXRpbjEucGFyc2UgKHN0cmluZylcbiAgICB9XG5cbiAgICB2YXIgc3RyaW5nVG9CYXNlNjQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBDcnlwdG9KUy5lbmMuTGF0aW4xLnBhcnNlIChzdHJpbmcpLnRvU3RyaW5nIChDcnlwdG9KUy5lbmMuQmFzZTY0KVxuICAgIH1cblxuICAgIHZhciB1dGYxNlRvQmFzZTY0ICA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIENyeXB0b0pTLmVuYy5VdGYxNi5wYXJzZSAoc3RyaW5nKS50b1N0cmluZyAoQ3J5cHRvSlMuZW5jLkJhc2U2NClcbiAgICB9XG5cbiAgICB2YXIgYmFzZTY0VG9CaW5hcnkgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBDcnlwdG9KUy5lbmMuQmFzZTY0LnBhcnNlIChzdHJpbmcpXG4gICAgfVxuXG4gICAgdmFyIGJhc2U2NFRvU3RyaW5nID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gQ3J5cHRvSlMuZW5jLkJhc2U2NC5wYXJzZSAoc3RyaW5nKS50b1N0cmluZyAoQ3J5cHRvSlMuZW5jLlV0ZjgpXG4gICAgfVxuXG4gICAgdmFyIGhhc2ggPSBmdW5jdGlvbiAocmVxdWVzdCwgaGFzaCA9ICdtZDUnLCBkaWdlc3QgPSAnaGV4Jykge1xuICAgICAgICB2YXIgZW5jb2RpbmcgPSAoZGlnZXN0ID09PSAnYmluYXJ5JykgPyAnTGF0aW4xJyA6IGNhcGl0YWxpemUgKGRpZ2VzdClcbiAgICAgICAgcmV0dXJuIENyeXB0b0pTW2hhc2gudG9VcHBlckNhc2UgKCldIChyZXF1ZXN0KS50b1N0cmluZyAoQ3J5cHRvSlMuZW5jW2VuY29kaW5nXSlcbiAgICB9XG5cbiAgICB2YXIgaG1hYyA9IGZ1bmN0aW9uIChyZXF1ZXN0LCBzZWNyZXQsIGhhc2ggPSAnc2hhMjU2JywgZGlnZXN0ID0gJ2hleCcpIHtcbiAgICAgICAgdmFyIGVuY29kaW5nID0gKGRpZ2VzdCA9PT0gJ2JpbmFyeScpID8gJ0xhdGluMScgOiBjYXBpdGFsaXplIChkaWdlc3QpXG4gICAgICAgIHJldHVybiBDcnlwdG9KU1snSG1hYycgKyBoYXNoLnRvVXBwZXJDYXNlICgpXSAocmVxdWVzdCwgc2VjcmV0KS50b1N0cmluZyAoQ3J5cHRvSlMuZW5jW2NhcGl0YWxpemUgKGVuY29kaW5nKV0pXG4gICAgfVxufVxuXG52YXIgdXJsZW5jb2RlQmFzZTY0ID0gZnVuY3Rpb24gKGJhc2U2NHN0cmluZykge1xuICAgIHJldHVybiBiYXNlNjRzdHJpbmcucmVwbGFjZSAoL1s9XSskLywgJycpLnJlcGxhY2UgKC9cXCsvZywgJy0nKS5yZXBsYWNlICgvXFwvL2csICdfJykgXG59XG5cbnZhciBqd3QgPSBmdW5jdGlvbiAocmVxdWVzdCwgc2VjcmV0LCBhbGcgPSAnSFMyNTYnLCBoYXNoID0gJ3NoYTI1NicpIHtcbiAgICB2YXIgZW5jb2RlZEhlYWRlciA9IHVybGVuY29kZUJhc2U2NCAoc3RyaW5nVG9CYXNlNjQgKEpTT04uc3RyaW5naWZ5ICh7ICdhbGcnOiBhbGcsICd0eXAnOiAnSldUJyB9KSkpXG4gICAgdmFyIGVuY29kZWREYXRhID0gdXJsZW5jb2RlQmFzZTY0IChzdHJpbmdUb0Jhc2U2NCAoSlNPTi5zdHJpbmdpZnkgKHJlcXVlc3QpKSlcbiAgICB2YXIgdG9rZW4gPSBbIGVuY29kZWRIZWFkZXIsIGVuY29kZWREYXRhIF0uam9pbiAoJy4nKVxuICAgIHZhciBzaWduYXR1cmUgPSB1cmxlbmNvZGVCYXNlNjQgKHV0ZjE2VG9CYXNlNjQgKGhtYWMgKHRva2VuLCBzZWNyZXQsIGhhc2gsICd1dGYxNicpKSlcbiAgICByZXR1cm4gWyB0b2tlbiwgc2lnbmF0dXJlIF0uam9pbiAoJy4nKVxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBNYXJrZXQgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICB0aGlzLmhhc2ggPSBoYXNoXG4gICAgdGhpcy5obWFjID0gaG1hY1xuICAgIHRoaXMuand0ID0gand0XG4gICAgdGhpcy5zdHJpbmdUb0JpbmFyeSA9IHN0cmluZ1RvQmluYXJ5XG4gICAgdGhpcy5zdHJpbmdUb0Jhc2U2NCA9IHN0cmluZ1RvQmFzZTY0XG4gICAgdGhpcy5iYXNlNjRUb0JpbmFyeSA9IGJhc2U2NFRvQmluYXJ5XG4gICAgdGhpcy51cmxlbmNvZGUgPSB1cmxlbmNvZGVcbiAgICB0aGlzLm9taXQgPSBvbWl0XG4gICAgdGhpcy5leHRlbmQgPSBleHRlbmRcbiAgICB0aGlzLmZsYXR0ZW4gPSBmbGF0XG4gICAgdGhpcy5pbmRleEJ5ID0gaW5kZXhCeVxuICAgIHRoaXMua2V5c29ydCA9IGtleXNvcnRcbiAgICB0aGlzLmNhcGl0YWxpemUgPSBjYXBpdGFsaXplXG5cbiAgICB0aGlzLmluaXQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGlzTm9kZSlcbiAgICAgICAgICAgIHRoaXMubm9kZVZlcnNpb24gPSBwcm9jZXNzLnZlcnNpb24ubWF0Y2ggKC9cXGQrXFwuXFxkKy5cXGQrLykgWzBdXG5cbiAgICAgICAgaWYgKHRoaXMuYXBpKVxuICAgICAgICAgICAgT2JqZWN0LmtleXMgKHRoaXMuYXBpKS5mb3JFYWNoICh0eXBlID0+IHtcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyAodGhpcy5hcGlbdHlwZV0pLmZvckVhY2ggKG1ldGhvZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1cmxzID0gdGhpcy5hcGlbdHlwZV1bbWV0aG9kXVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHVybHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1cmwgPSB1cmxzW2ldLnRyaW0gKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzcGxpdFBhdGggPSB1cmwuc3BsaXQgKC9bXmEtekEtWjAtOV0vKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXBwZXJjYXNlTWV0aG9kICA9IG1ldGhvZC50b1VwcGVyQ2FzZSAoKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvd2VyY2FzZU1ldGhvZCAgPSBtZXRob2QudG9Mb3dlckNhc2UgKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYW1lbGNhc2VNZXRob2QgID0gY2FwaXRhbGl6ZSAobG93ZXJjYXNlTWV0aG9kKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhbWVsY2FzZVN1ZmZpeCAgPSBzcGxpdFBhdGgubWFwIChjYXBpdGFsaXplKS5qb2luICgnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1bmRlcnNjb3JlU3VmZml4ID0gc3BsaXRQYXRoLm1hcCAoeCA9PiB4LnRyaW0gKCkudG9Mb3dlckNhc2UgKCkpLmZpbHRlciAoeCA9PiB4Lmxlbmd0aCA+IDApLmpvaW4gKCdfJylcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbWVsY2FzZVN1ZmZpeC5pbmRleE9mIChjYW1lbGNhc2VNZXRob2QpID09PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbWVsY2FzZVN1ZmZpeCA9IGNhbWVsY2FzZVN1ZmZpeC5zbGljZSAoY2FtZWxjYXNlTWV0aG9kLmxlbmd0aClcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVuZGVyc2NvcmVTdWZmaXguaW5kZXhPZiAobG93ZXJjYXNlTWV0aG9kKSA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmRlcnNjb3JlU3VmZml4ID0gdW5kZXJzY29yZVN1ZmZpeC5zbGljZSAobG93ZXJjYXNlTWV0aG9kLmxlbmd0aClcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhbWVsY2FzZSAgPSB0eXBlICsgY2FtZWxjYXNlTWV0aG9kICsgY2FwaXRhbGl6ZSAoY2FtZWxjYXNlU3VmZml4KVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVuZGVyc2NvcmUgPSB0eXBlICsgJ18nICsgbG93ZXJjYXNlTWV0aG9kICsgJ18nICsgdW5kZXJzY29yZVN1ZmZpeFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZiA9IChwYXJhbXMgPT4gdGhpcy5yZXF1ZXN0ICh1cmwsIHR5cGUsIHVwcGVyY2FzZU1ldGhvZCwgcGFyYW1zKSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1tjYW1lbGNhc2VdICA9IGZcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbdW5kZXJzY29yZV0gPSBmXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyB0aGlzLmZldGNoID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuXG4gICAgLy8gICAgIGlmIChpc05vZGUpXG4gICAgLy8gICAgICAgICBvcHRpb25zLmhlYWRlcnMgPSBleHRlbmQgKHtcbiAgICAvLyAgICAgICAgICAgICAnVXNlci1BZ2VudCc6ICdjY3h0LzAuMS4wICgraHR0cHM6Ly9naXRodWIuY29tL2tyb2l0b3IvY2N4dCkgTm9kZS5qcy8nICsgdGhpcy5ub2RlVmVyc2lvbiArICcgKEphdmFTY3JpcHQpJ1xuICAgIC8vICAgICAgICAgfSwgb3B0aW9ucy5oZWFkZXJzKVxuXG4gICAgLy8gICAgIGlmICh0aGlzLnZlcmJvc2UpXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZyAodGhpcy5pZCwgdXJsLCBvcHRpb25zKVxuXG4gICAgLy8gICAgIHJldHVybiAoZmV0Y2ggKCh0aGlzLmNvcnMgPyB0aGlzLmNvcnMgOiAnJykgKyB1cmwsIG9wdGlvbnMpXG4gICAgLy8gICAgICAgICAudGhlbiAocmVzcG9uc2UgPT4gKHR5cGVvZiByZXNwb25zZSA9PT0gJ3N0cmluZycpID8gcmVzcG9uc2UgOiByZXNwb25zZS50ZXh0ICgpKVxuICAgIC8vICAgICAgICAgLnRoZW4gKHJlc3BvbnNlID0+IHtcbiAgICAvLyAgICAgICAgICAgICB0cnkge1xuICAgIC8vICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSAocmVzcG9uc2UpXG4gICAgLy8gICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgIC8vICAgICAgICAgICAgICAgICB2YXIgY2xvdWRmbGFyZVByb3RlY3Rpb24gPSByZXNwb25zZS5tYXRjaCAoL2Nsb3VkZmxhcmUvaSkgPyAnRERvUyBwcm90ZWN0aW9uIGJ5IENsb3VkZmxhcmUnIDogJydcbiAgICAvLyAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmVyYm9zZSlcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nICh0aGlzLmlkLCByZXNwb25zZSwgY2xvdWRmbGFyZVByb3RlY3Rpb24sIGUpXG4gICAgLy8gICAgICAgICAgICAgICAgIHRocm93IGVcbiAgICAvLyAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICB9KSlcbiAgICAvLyB9XG5cbiAgICB0aGlzLmZldGNoID0gZnVuY3Rpb24gKHVybCwgbWV0aG9kID0gJ0dFVCcsIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcblxuICAgICAgICBpZiAoaXNOb2RlKVxuICAgICAgICAgICAgaGVhZGVycyA9IGV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdVc2VyLUFnZW50JzogJ2NjeHQvMC4xLjAgKCtodHRwczovL2dpdGh1Yi5jb20va3JvaXRvci9jY3h0KSBOb2RlLmpzLycgKyB0aGlzLm5vZGVWZXJzaW9uICsgJyAoSmF2YVNjcmlwdCknXG4gICAgICAgICAgICB9LCBoZWFkZXJzKVxuXG4gICAgICAgIGxldCBvcHRpb25zID0geyAnbWV0aG9kJzogbWV0aG9kLCAnaGVhZGVycyc6IGhlYWRlcnMsICdib2R5JzogYm9keSB9XG5cbiAgICAgICAgaWYgKHRoaXMudmVyYm9zZSlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nICh0aGlzLmlkLCB1cmwsIG9wdGlvbnMpXG5cbiAgICAgICAgcmV0dXJuIChmZXRjaCAoKHRoaXMuY29ycyA/IHRoaXMuY29ycyA6ICcnKSArIHVybCwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuIChyZXNwb25zZSA9PiAodHlwZW9mIHJlc3BvbnNlID09PSAnc3RyaW5nJykgPyByZXNwb25zZSA6IHJlc3BvbnNlLnRleHQgKCkpXG4gICAgICAgICAgICAudGhlbiAocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlIChyZXNwb25zZSlcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjbG91ZGZsYXJlUHJvdGVjdGlvbiA9IHJlc3BvbnNlLm1hdGNoICgvY2xvdWRmbGFyZS9pKSA/ICdERG9TIHByb3RlY3Rpb24gYnkgQ2xvdWRmbGFyZScgOiAnJ1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52ZXJib3NlKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgKHRoaXMuaWQsIHJlc3BvbnNlLCBjbG91ZGZsYXJlUHJvdGVjdGlvbiwgZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKVxuICAgIH1cblxuICAgIHRoaXMubG9hZF9wcm9kdWN0cyA9IFxuICAgIHRoaXMubG9hZFByb2R1Y3RzID0gZnVuY3Rpb24gKHJlbG9hZCA9IGZhbHNlKSB7XG4gICAgICAgIGlmICghcmVsb2FkICYmIHRoaXMucHJvZHVjdHMpXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UgKChyZXNvbHZlLCByZWplY3QpID0+IHJlc29sdmUgKHRoaXMucHJvZHVjdHMpKVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaFByb2R1Y3RzICgpLnRoZW4gKHByb2R1Y3RzID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2R1Y3RzID0gaW5kZXhCeSAocHJvZHVjdHMsICdzeW1ib2wnKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuZmV0Y2hfcHJvZHVjdHMgPSBcbiAgICB0aGlzLmZldGNoUHJvZHVjdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSAoKHJlc29sdmUsIHJlamVjdCkgPT4gcmVzb2x2ZSAodGhpcy5wcm9kdWN0cykpXG4gICAgfVxuXG4gICAgdGhpcy5jb21tb25DdXJyZW5jeUNvZGUgPSBmdW5jdGlvbiAoY3VycmVuY3kpIHsgXG4gICAgICAgIHJldHVybiAoY3VycmVuY3kgPT09ICdYQlQnKSA/ICdCVEMnIDogY3VycmVuY3lcbiAgICB9XG5cbiAgICB0aGlzLnByb2R1Y3QgPSBmdW5jdGlvbiAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gKCgodHlwZW9mIHByb2R1Y3QgPT09ICdzdHJpbmcnKSAmJlxuICAgICAgICAgICAgKHR5cGVvZiB0aGlzLnByb2R1Y3RzICE9ICd1bmRlZmluZWQnKSAmJlxuICAgICAgICAgICAgKHR5cGVvZiB0aGlzLnByb2R1Y3RzW3Byb2R1Y3RdICE9ICd1bmRlZmluZWQnKSkgPyB0aGlzLnByb2R1Y3RzW3Byb2R1Y3RdIDogcHJvZHVjdCkgICAgICAgIFxuICAgIH1cblxuICAgIHRoaXMucHJvZHVjdF9pZCA9IFxuICAgIHRoaXMucHJvZHVjdElkICA9IGZ1bmN0aW9uIChwcm9kdWN0KSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5wcm9kdWN0IChwcm9kdWN0KS5pZCB8fCBwcm9kdWN0XG4gICAgfVxuXG4gICAgdGhpcy5zeW1ib2wgPSBmdW5jdGlvbiAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9kdWN0IChwcm9kdWN0KS5zeW1ib2wgfHwgcHJvZHVjdFxuICAgIH1cblxuICAgIHRoaXMuZXh0cmFjdF9wYXJhbXMgPSBcbiAgICB0aGlzLmV4dHJhY3RQYXJhbXMgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHZhciByZSA9IC97KFthLXpBLVowLTlfXSs/KX0vZ1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IFtdXG4gICAgICAgIGxldCBtYXRjaFxuICAgICAgICB3aGlsZSAobWF0Y2ggPSByZS5leGVjIChzdHJpbmcpKVxuICAgICAgICAgICAgbWF0Y2hlcy5wdXNoIChtYXRjaFsxXSlcbiAgICAgICAgcmV0dXJuIG1hdGNoZXNcbiAgICB9XG5cbiAgICB0aGlzLmltcGxvZGVfcGFyYW1zID0gXG4gICAgdGhpcy5pbXBsb2RlUGFyYW1zID0gZnVuY3Rpb24gKHN0cmluZywgcGFyYW1zKSB7XG4gICAgICAgIGZvciAodmFyIHByb3BlcnR5IGluIHBhcmFtcylcbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlICgneycgKyBwcm9wZXJ0eSArICd9JywgcGFyYW1zW3Byb3BlcnR5XSlcbiAgICAgICAgcmV0dXJuIHN0cmluZ1xuICAgIH1cblxuICAgIHRoaXMuYnV5ID0gZnVuY3Rpb24gKHByb2R1Y3QsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yZGVyIChwcm9kdWN0LCAnYnV5JywgYW1vdW50LCBwcmljZSwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuc2VsbCA9IGZ1bmN0aW9uIChwcm9kdWN0LCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcmRlciAocHJvZHVjdCwgJ3NlbGwnLCBhbW91bnQsIHByaWNlLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy50cmFkZSA9XG4gICAgdGhpcy5vcmRlciA9IGZ1bmN0aW9uIChwcm9kdWN0LCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgdHlwZSA9ICh0eXBlb2YgcHJpY2UgPT0gJ3VuZGVmaW5lZCcpID8gJ21hcmtldCcgOiAnbGltaXQnXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVfYnV5X29yZGVyID1cbiAgICB0aGlzLmNyZWF0ZUJ1eU9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIHR5cGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgJ2J1eScsICBhbW91bnQsIHByaWNlLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVfc2VsbF9vcmRlciA9XG4gICAgdGhpcy5jcmVhdGVTZWxsT3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgdHlwZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsICdzZWxsJywgYW1vdW50LCBwcmljZSwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlX2xpbWl0X2J1eV9vcmRlciA9XG4gICAgdGhpcy5jcmVhdGVMaW1pdEJ1eU9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIGFtb3VudCwgcHJpY2UsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUxpbWl0T3JkZXIgIChwcm9kdWN0LCAnYnV5JywgIGFtb3VudCwgcHJpY2UsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9saW1pdF9zZWxsX29yZGVyID0gXG4gICAgdGhpcy5jcmVhdGVMaW1pdFNlbGxPcmRlciA9IGZ1bmN0aW9uIChwcm9kdWN0LCBhbW91bnQsIHByaWNlLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVMaW1pdE9yZGVyIChwcm9kdWN0LCAnc2VsbCcsIGFtb3VudCwgcHJpY2UsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9tYXJrZXRfYnV5X29yZGVyID1cbiAgICB0aGlzLmNyZWF0ZU1hcmtldEJ1eU9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIGFtb3VudCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTWFya2V0T3JkZXIgKHByb2R1Y3QsICdidXknLCAgYW1vdW50LCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVfbWFya2V0X3NlbGxfb3JkZXIgPVxuICAgIHRoaXMuY3JlYXRlTWFya2V0U2VsbE9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIGFtb3VudCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTWFya2V0T3JkZXIgKHByb2R1Y3QsICdzZWxsJywgYW1vdW50LCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVfbGltaXRfb3JkZXIgPSBcbiAgICB0aGlzLmNyZWF0ZUxpbWl0T3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgc2lkZSwgYW1vdW50LCBwcmljZSwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlT3JkZXIgKHByb2R1Y3QsICdsaW1pdCcsICBzaWRlLCBhbW91bnQsIHByaWNlLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVfbWFya2V0X29yZGVyID1cbiAgICB0aGlzLmNyZWF0ZU1hcmtldE9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIHNpZGUsIGFtb3VudCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlT3JkZXIgKHByb2R1Y3QsICdtYXJrZXQnLCBzaWRlLCBhbW91bnQsIHVuZGVmaW5lZCwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuaXNvODYwMSAgICAgICAgPSB0aW1lc3RhbXAgPT4gbmV3IERhdGUgKHRpbWVzdGFtcCkudG9JU09TdHJpbmcgKClcbiAgICB0aGlzLnBhcnNlODYwMSAgICAgID0gRGF0ZS5wYXJzZSBcbiAgICB0aGlzLnNlY29uZHMgICAgICAgID0gKCkgPT4gTWF0aC5mbG9vciAodGhpcy5taWxsaXNlY29uZHMgKCkgLyAxMDAwKVxuICAgIHRoaXMubWljcm9zZWNvbmRzICAgPSAoKSA9PiBNYXRoLmZsb29yICh0aGlzLm1pbGxpc2Vjb25kcyAoKSAqIDEwMDApXG4gICAgdGhpcy5taWxsaXNlY29uZHMgICA9IERhdGUubm93XG4gICAgdGhpcy5ub25jZSAgICAgICAgICA9IHRoaXMuc2Vjb25kc1xuICAgIHRoaXMuaWQgICAgICAgICAgICAgPSB1bmRlZmluZWRcbiAgICB0aGlzLnJhdGVMaW1pdCAgICAgID0gMjAwMFxuICAgIHRoaXMudGltZW91dCAgICAgICAgPSB1bmRlZmluZWRcbiAgICB0aGlzLnl5eXltbWRkaGhtbXNzID0gdGltZXN0YW1wID0+IHtcbiAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSAodGltZXN0YW1wKVxuICAgICAgICBsZXQgeXl5eSA9IGRhdGUuZ2V0VVRDRnVsbFllYXIgKClcbiAgICAgICAgbGV0IE1NID0gZGF0ZS5nZXRVVENNb250aCAoKVxuICAgICAgICBsZXQgZGQgPSBkYXRlLmdldFVUQ0RheSAoKVxuICAgICAgICBsZXQgaGggPSBkYXRlLmdldFVUQ0hvdXJzICgpXG4gICAgICAgIGxldCBtbSA9IGRhdGUuZ2V0VVRDTWludXRlcyAoKVxuICAgICAgICBsZXQgc3MgPSBkYXRlLmdldFVUQ1NlY29uZHMgKClcbiAgICAgICAgTU0gPSBNTSA8IDEwID8gKCcwJyArIE1NKSA6IE1NXG4gICAgICAgIGRkID0gZGQgPCAxMCA/ICgnMCcgKyBkZCkgOiBkZFxuICAgICAgICBoaCA9IGhoIDwgMTAgPyAoJzAnICsgaGgpIDogaGhcbiAgICAgICAgbW0gPSBtbSA8IDEwID8gKCcwJyArIG1tKSA6IG1tXG4gICAgICAgIHNzID0gc3MgPCAxMCA/ICgnMCcgKyBzcykgOiBzc1xuICAgICAgICByZXR1cm4geXl5eSArICctJyArIE1NICsgJy0nICsgZGQgKyAnICcgKyBoaCArICc6JyArIG1tICsgJzonICsgc3NcbiAgICB9XG5cbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBjb25maWcpXG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gY29uZmlnW3Byb3BlcnR5XVxuXG4gICAgdGhpcy5mZXRjaF9iYWxhbmNlICAgID0gdGhpcy5mZXRjaEJhbGFuY2VcbiAgICB0aGlzLmZldGNoX29yZGVyX2Jvb2sgPSB0aGlzLmZldGNoT3JkZXJCb29rXG4gICAgdGhpcy5mZXRjaF90aWNrZXIgICAgID0gdGhpcy5mZXRjaFRpY2tlclxuICAgIHRoaXMuZmV0Y2hfdHJhZGVzICAgICA9IHRoaXMuZmV0Y2hUcmFkZXNcbiAgXG4gICAgdGhpcy52ZXJib3NlID0gdGhpcy5sb2cgfHwgdGhpcy5kZWJ1ZyB8fCAodGhpcy52ZXJib3NpdHkgPT0gMSkgfHwgdGhpcy52ZXJib3NlXG5cbiAgICB0aGlzLmluaXQgKClcbn1cblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG52YXIgXzFicm9rZXIgPSB7XG5cbiAgICAnaWQnOiAnXzFicm9rZXInLFxuICAgICduYW1lJzogJzFCcm9rZXInLFxuICAgICdjb3VudHJpZXMnOiAnVVMnLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YyJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjAyMS00MjBiZDlmYy01ZWNiLTExZTctOGVkNi01NmQwMDgxZWZlZDIuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovLzFicm9rZXIuY29tL2FwaScsICAgICAgICBcbiAgICAgICAgJ3d3dyc6ICdodHRwczovLzFicm9rZXIuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovLzFicm9rZXIuY29tLz9jPWVuL2NvbnRlbnQvYXBpLWRvY3VtZW50YXRpb24nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdtYXJrZXQvYmFycycsXG4gICAgICAgICAgICAgICAgJ21hcmtldC9jYXRlZ29yaWVzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0L2RldGFpbHMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXQvbGlzdCcsXG4gICAgICAgICAgICAgICAgJ21hcmtldC9xdW90ZXMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXQvdGlja3MnLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICdvcmRlci9jcmVhdGUnLFxuICAgICAgICAgICAgICAgICdvcmRlci9vcGVuJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vY2xvc2UnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9jbG9zZV9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9lZGl0JyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL29wZW4nLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9zaGFyZWQvZ2V0JyxcbiAgICAgICAgICAgICAgICAnc29jaWFsL3Byb2ZpbGVfc3RhdGlzdGljcycsXG4gICAgICAgICAgICAgICAgJ3NvY2lhbC9wcm9maWxlX3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvYml0Y29pbl9kZXBvc2l0X2FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICd1c2VyL2RldGFpbHMnLFxuICAgICAgICAgICAgICAgICd1c2VyL292ZXJ2aWV3JyxcbiAgICAgICAgICAgICAgICAndXNlci9xdW90YV9zdGF0dXMnLFxuICAgICAgICAgICAgICAgICd1c2VyL3RyYW5zYWN0aW9uX2xvZycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaENhdGVnb3JpZXMgKCkge1xuICAgICAgICBsZXQgY2F0ZWdvcmllcyA9IGF3YWl0IHRoaXMucHJpdmF0ZUdldE1hcmtldENhdGVnb3JpZXMgKCk7XG4gICAgICAgIHJldHVybiBjYXRlZ29yaWVzWydyZXNwb25zZSddO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IGNhdGVnb3JpZXMgPSBhd2FpdCB0aGlzLmZldGNoQ2F0ZWdvcmllcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IGNhdGVnb3JpZXMubGVuZ3RoOyBjKyspIHtcbiAgICAgICAgICAgIGxldCBjYXRlZ29yeSA9IGNhdGVnb3JpZXNbY107XG4gICAgICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnByaXZhdGVHZXRNYXJrZXRMaXN0ICh7IFxuICAgICAgICAgICAgICAgICdjYXRlZ29yeSc6IGNhdGVnb3J5LnRvTG93ZXJDYXNlICgpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzWydyZXNwb25zZSddLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sncmVzcG9uc2UnXVtwXTtcbiAgICAgICAgICAgICAgICBpZiAoKGNhdGVnb3J5ID09ICdGT1JFWCcpIHx8IChjYXRlZ29yeSA9PSAnQ1JZUFRPJykpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnc3ltYm9sJ107XG4gICAgICAgICAgICAgICAgICAgIGxldCBzeW1ib2wgPSBwcm9kdWN0WyduYW1lJ107XG4gICAgICAgICAgICAgICAgICAgIGxldCBbIGJhc2UsIHF1b3RlIF0gPSBzeW1ib2wuc3BsaXQgKCcvJyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnc3ltYm9sJ107XG4gICAgICAgICAgICAgICAgICAgIGxldCBzeW1ib2wgPSBwcm9kdWN0WydzeW1ib2wnXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBwcm9kdWN0WyduYW1lJ107XG4gICAgICAgICAgICAgICAgICAgIGxldCB0eXBlID0gcHJvZHVjdFsndHlwZSddLnRvTG93ZXJDYXNlICgpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3R5cGUnOiB0eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHsgXG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRVc2VyT3ZlcnZpZXcgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHJpdmF0ZUdldE1hcmtldFF1b3RlcyAoe1xuICAgICAgICAgICAgJ3N5bWJvbHMnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgb3JkZXJib29rID0gcmVzcG9uc2VbJ3Jlc3BvbnNlJ11bMF07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLnBhcnNlODYwMSAob3JkZXJib29rWyd1cGRhdGVkJ10pO1xuICAgICAgICBsZXQgYmlkUHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlcmJvb2tbJ2JpZCddKTtcbiAgICAgICAgbGV0IGFza1ByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJib29rWydhc2snXSk7XG4gICAgICAgIGxldCBiaWQgPSBbIGJpZFByaWNlLCB1bmRlZmluZWQgXTtcbiAgICAgICAgbGV0IGFzayA9IFsgYXNrUHJpY2UsIHVuZGVmaW5lZCBdO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdiaWRzJzogWyBiaWQgXSxcbiAgICAgICAgICAgICdhc2tzJzogWyBhc2sgXSxcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IGF3YWl0IHRoaXMucHJpdmF0ZUdldE1hcmtldEJhcnMgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAncmVzb2x1dGlvbic6IDYwLFxuICAgICAgICAgICAgJ2xpbWl0JzogMSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLmZldGNoT3JkZXJCb29rIChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3VsdFsncmVzcG9uc2UnXVswXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMucGFyc2U4NjAxICh0aWNrZXJbJ2RhdGUnXSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IG9yZGVyYm9va1snYmlkcyddWzBdWydwcmljZSddLFxuICAgICAgICAgICAgJ2Fzayc6IG9yZGVyYm9va1snYXNrcyddWzBdWydwcmljZSddLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnbyddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYyddKSxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgfTsgXG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ21hcmdpbic6IGFtb3VudCxcbiAgICAgICAgICAgICdkaXJlY3Rpb24nOiAoc2lkZSA9PSAnc2VsbCcpID8gJ3Nob3J0JyA6ICdsb25nJyxcbiAgICAgICAgICAgICdsZXZlcmFnZSc6IDEsXG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcmRlclsndHlwZSddICs9ICdfbWFya2V0JztcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldE9yZGVyQ3JlYXRlICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHBhdGggKyAnLnBocCc7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7ICd0b2tlbic6IHRoaXMuYXBpS2V5IH0sIHBhcmFtcyk7XG4gICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGNyeXB0b2NhcGl0YWwgPSB7XG5cbiAgICAnY29tbWVudCc6ICdDcnlwdG8gQ2FwaXRhbCBBUEknLFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdzdGF0cycsXG4gICAgICAgICAgICAgICAgJ2hpc3RvcmljYWwtcHJpY2VzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXItYm9vaycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHsgICAgICAgICAgICBcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlcy1hbmQtaW5mbycsXG4gICAgICAgICAgICAgICAgJ29wZW4tb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAndXNlci10cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICdidGMtZGVwb3NpdC1hZGRyZXNzL2dldCcsXG4gICAgICAgICAgICAgICAgJ2J0Yy1kZXBvc2l0LWFkZHJlc3MvbmV3JyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdHMvZ2V0JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMvZ2V0JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL25ldycsXG4gICAgICAgICAgICAgICAgJ29yZGVycy9lZGl0JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29yZGVycy9zdGF0dXMnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy9uZXcnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlc0FuZEluZm8gKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7IFxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyQm9vayAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IHJlc3BvbnNlWydvcmRlci1ib29rJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0geyAnYmlkcyc6ICdiaWQnLCAnYXNrcyc6ICdhc2snIH07XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHNpZGVzKTtcbiAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBrZXlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICBsZXQga2V5ID0ga2V5c1trXTtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNba2V5XTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKG9yZGVyWyd0aW1lc3RhbXAnXSkgKiAxMDAwO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWydwcmljZSddKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbJ29yZGVyX2Ftb3VudCddKTtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XS5wdXNoIChbIHByaWNlLCBhbW91bnQsIHRpbWVzdGFtcCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFN0YXRzICh7XG4gICAgICAgICAgICAnY3VycmVuY3knOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3N0YXRzJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWF4J10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWluJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0X3ByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnZGFpbHlfY2hhbmdlJ10pLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd0b3RhbF9idGNfdHJhZGVkJ10pLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFuc2FjdGlvbnMgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnc2lkZSc6IHNpZGUsXG4gICAgICAgICAgICAndHlwZSc6IHR5cGUsXG4gICAgICAgICAgICAnY3VycmVuY3knOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ2xpbWl0X3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RPcmRlcnNOZXcgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnYXBpX2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdub25jZSc6IHRoaXMubm9uY2UgKCksXG4gICAgICAgICAgICB9LCBwYXJhbXMpO1xuICAgICAgICAgICAgcXVlcnlbJ3NpZ25hdHVyZSddID0gdGhpcy5obWFjIChKU09OLnN0cmluZ2lmeSAocXVlcnkpLCB0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIF8xYnRjeGUgPSBleHRlbmQgKGNyeXB0b2NhcGl0YWwsIHtcblxuICAgICdpZCc6ICdfMWJ0Y3hlJyxcbiAgICAnbmFtZSc6ICcxQlRDWEUnLFxuICAgICdjb3VudHJpZXMnOiAnUEEnLCAvLyBQYW5hbWFcbiAgICAnY29tbWVudCc6ICdDcnlwdG8gQ2FwaXRhbCBBUEknLFxuICAgICd1cmxzJzogeyBcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjA0OS0yYjI5NDQwOC01ZWNjLTExZTctODVjYy1hZGFmZjAxM2RjMWEuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovLzFidGN4ZS5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovLzFidGN4ZS5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vMWJ0Y3hlLmNvbS9hcGktZG9jcy5waHAnLFxuICAgIH0sICAgIFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdVU0QnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJywgfSxcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdFVVInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJywgfSxcbiAgICAgICAgJ0JUQy9DTlknOiB7ICdpZCc6ICdDTlknLCAnc3ltYm9sJzogJ0JUQy9DTlknLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ05ZJywgfSxcbiAgICAgICAgJ0JUQy9SVUInOiB7ICdpZCc6ICdSVUInLCAnc3ltYm9sJzogJ0JUQy9SVUInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnUlVCJywgfSxcbiAgICAgICAgJ0JUQy9DSEYnOiB7ICdpZCc6ICdDSEYnLCAnc3ltYm9sJzogJ0JUQy9DSEYnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ0hGJywgfSxcbiAgICAgICAgJ0JUQy9KUFknOiB7ICdpZCc6ICdKUFknLCAnc3ltYm9sJzogJ0JUQy9KUFknLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSlBZJywgfSxcbiAgICAgICAgJ0JUQy9HQlAnOiB7ICdpZCc6ICdHQlAnLCAnc3ltYm9sJzogJ0JUQy9HQlAnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnR0JQJywgfSxcbiAgICAgICAgJ0JUQy9DQUQnOiB7ICdpZCc6ICdDQUQnLCAnc3ltYm9sJzogJ0JUQy9DQUQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ0FEJywgfSxcbiAgICAgICAgJ0JUQy9BVUQnOiB7ICdpZCc6ICdBVUQnLCAnc3ltYm9sJzogJ0JUQy9BVUQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQVVEJywgfSxcbiAgICAgICAgJ0JUQy9BRUQnOiB7ICdpZCc6ICdBRUQnLCAnc3ltYm9sJzogJ0JUQy9BRUQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQUVEJywgfSxcbiAgICAgICAgJ0JUQy9CR04nOiB7ICdpZCc6ICdCR04nLCAnc3ltYm9sJzogJ0JUQy9CR04nLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQkdOJywgfSxcbiAgICAgICAgJ0JUQy9DWksnOiB7ICdpZCc6ICdDWksnLCAnc3ltYm9sJzogJ0JUQy9DWksnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ1pLJywgfSxcbiAgICAgICAgJ0JUQy9ES0snOiB7ICdpZCc6ICdES0snLCAnc3ltYm9sJzogJ0JUQy9ES0snLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnREtLJywgfSxcbiAgICAgICAgJ0JUQy9IS0QnOiB7ICdpZCc6ICdIS0QnLCAnc3ltYm9sJzogJ0JUQy9IS0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSEtEJywgfSxcbiAgICAgICAgJ0JUQy9IUksnOiB7ICdpZCc6ICdIUksnLCAnc3ltYm9sJzogJ0JUQy9IUksnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSFJLJywgfSxcbiAgICAgICAgJ0JUQy9IVUYnOiB7ICdpZCc6ICdIVUYnLCAnc3ltYm9sJzogJ0JUQy9IVUYnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSFVGJywgfSxcbiAgICAgICAgJ0JUQy9JTFMnOiB7ICdpZCc6ICdJTFMnLCAnc3ltYm9sJzogJ0JUQy9JTFMnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSUxTJywgfSxcbiAgICAgICAgJ0JUQy9JTlInOiB7ICdpZCc6ICdJTlInLCAnc3ltYm9sJzogJ0JUQy9JTlInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSU5SJywgfSxcbiAgICAgICAgJ0JUQy9NVVInOiB7ICdpZCc6ICdNVVInLCAnc3ltYm9sJzogJ0JUQy9NVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnTVVSJywgfSxcbiAgICAgICAgJ0JUQy9NWE4nOiB7ICdpZCc6ICdNWE4nLCAnc3ltYm9sJzogJ0JUQy9NWE4nLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnTVhOJywgfSxcbiAgICAgICAgJ0JUQy9OT0snOiB7ICdpZCc6ICdOT0snLCAnc3ltYm9sJzogJ0JUQy9OT0snLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnTk9LJywgfSxcbiAgICAgICAgJ0JUQy9OWkQnOiB7ICdpZCc6ICdOWkQnLCAnc3ltYm9sJzogJ0JUQy9OWkQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnTlpEJywgfSxcbiAgICAgICAgJ0JUQy9QTE4nOiB7ICdpZCc6ICdQTE4nLCAnc3ltYm9sJzogJ0JUQy9QTE4nLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnUExOJywgfSxcbiAgICAgICAgJ0JUQy9ST04nOiB7ICdpZCc6ICdST04nLCAnc3ltYm9sJzogJ0JUQy9ST04nLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnUk9OJywgfSxcbiAgICAgICAgJ0JUQy9TRUsnOiB7ICdpZCc6ICdTRUsnLCAnc3ltYm9sJzogJ0JUQy9TRUsnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnU0VLJywgfSxcbiAgICAgICAgJ0JUQy9TR0QnOiB7ICdpZCc6ICdTR0QnLCAnc3ltYm9sJzogJ0JUQy9TR0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnU0dEJywgfSxcbiAgICAgICAgJ0JUQy9USEInOiB7ICdpZCc6ICdUSEInLCAnc3ltYm9sJzogJ0JUQy9USEInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVEhCJywgfSxcbiAgICAgICAgJ0JUQy9UUlknOiB7ICdpZCc6ICdUUlknLCAnc3ltYm9sJzogJ0JUQy9UUlknLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVFJZJywgfSxcbiAgICAgICAgJ0JUQy9aQVInOiB7ICdpZCc6ICdaQVInLCAnc3ltYm9sJzogJ0JUQy9aQVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnWkFSJywgfSxcbiAgICB9LFxufSlcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYW54cHJvID0ge1xuXG4gICAgJ2lkJzogJ2FueHBybycsXG4gICAgJ25hbWUnOiAnQU5YUHJvJyxcbiAgICAnY291bnRyaWVzJzogWyAnSlAnLCAnU0cnLCAnSEsnLCAnTlonLCBdLFxuICAgICd2ZXJzaW9uJzogJzInLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY1OTgzLWZkODU5NWRhLTVlYzktMTFlNy04MmUzLWFkYjNhYjhjMjYxMi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYW54cHJvLmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vYW54cHJvLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9hbnhwcm8uY29tL3BhZ2VzL2FwaScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAne2N1cnJlbmN5X3BhaXJ9L21vbmV5L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3tjdXJyZW5jeV9wYWlyfS9tb25leS9kZXB0aC9mdWxsJyxcbiAgICAgICAgICAgICAgICAne2N1cnJlbmN5X3BhaXJ9L21vbmV5L3RyYWRlL2ZldGNoJywgLy8gZGlzYWJsZWQgYnkgQU5YUHJvXG4gICAgICAgICAgICBdLCAgICBcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAne2N1cnJlbmN5X3BhaXJ9L21vbmV5L29yZGVyL2FkZCcsXG4gICAgICAgICAgICAgICAgJ3tjdXJyZW5jeV9wYWlyfS9tb25leS9vcmRlci9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICd7Y3VycmVuY3lfcGFpcn0vbW9uZXkvb3JkZXIvcXVvdGUnLFxuICAgICAgICAgICAgICAgICd7Y3VycmVuY3lfcGFpcn0vbW9uZXkvb3JkZXIvcmVzdWx0JyxcbiAgICAgICAgICAgICAgICAne2N1cnJlbmN5X3BhaXJ9L21vbmV5L29yZGVycycsXG4gICAgICAgICAgICAgICAgJ21vbmV5L3tjdXJyZW5jeX0vYWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ21vbmV5L3tjdXJyZW5jeX0vc2VuZF9zaW1wbGUnLFxuICAgICAgICAgICAgICAgICdtb25leS9pbmZvJyxcbiAgICAgICAgICAgICAgICAnbW9uZXkvdHJhZGUvbGlzdCcsXG4gICAgICAgICAgICAgICAgJ21vbmV5L3dhbGxldC9oaXN0b3J5JyxcbiAgICAgICAgICAgIF0sICAgIFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ0JUQ1VTRCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdCVEMvSEtEJzogeyAnaWQnOiAnQlRDSEtEJywgJ3N5bWJvbCc6ICdCVEMvSEtEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0hLRCcgfSxcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdCVENFVVInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgICAgICAnQlRDL0NBRCc6IHsgJ2lkJzogJ0JUQ0NBRCcsICdzeW1ib2wnOiAnQlRDL0NBRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDQUQnIH0sXG4gICAgICAgICdCVEMvQVVEJzogeyAnaWQnOiAnQlRDQVVEJywgJ3N5bWJvbCc6ICdCVEMvQVVEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0FVRCcgfSxcbiAgICAgICAgJ0JUQy9TR0QnOiB7ICdpZCc6ICdCVENTR0QnLCAnc3ltYm9sJzogJ0JUQy9TR0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnU0dEJyB9LFxuICAgICAgICAnQlRDL0pQWSc6IHsgJ2lkJzogJ0JUQ0pQWScsICdzeW1ib2wnOiAnQlRDL0pQWScsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdCVEMvR0JQJzogeyAnaWQnOiAnQlRDR0JQJywgJ3N5bWJvbCc6ICdCVEMvR0JQJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0dCUCcgfSxcbiAgICAgICAgJ0JUQy9OWkQnOiB7ICdpZCc6ICdCVENOWkQnLCAnc3ltYm9sJzogJ0JUQy9OWkQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnTlpEJyB9LFxuICAgICAgICAnTFRDL0JUQyc6IHsgJ2lkJzogJ0xUQ0JUQycsICdzeW1ib2wnOiAnTFRDL0JUQycsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdET0dFL0JUQyc6IHsgJ2lkJzogJ0RPR0VCVEMnLCAnc3ltYm9sJzogJ0RPR0UvQlRDJywgJ2Jhc2UnOiAnRE9HRScsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdTVFIvQlRDJzogeyAnaWQnOiAnU1RSQlRDJywgJ3N5bWJvbCc6ICdTVFIvQlRDJywgJ2Jhc2UnOiAnU1RSJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ1hSUC9CVEMnOiB7ICdpZCc6ICdYUlBCVEMnLCAnc3ltYm9sJzogJ1hSUC9CVEMnLCAnYmFzZSc6ICdYUlAnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE1vbmV5SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRDdXJyZW5jeVBhaXJNb25leURlcHRoRnVsbCAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgb3JkZXJib29rID0gcmVzcG9uc2VbJ2RhdGEnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50IChvcmRlcmJvb2tbJ2RhdGFVcGRhdGVUaW1lJ10pIC8gMTAwMDtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWydwcmljZSddKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbJ2Ftb3VudCddKTtcbiAgICAgICAgICAgICAgICByZXN1bHRbc2lkZV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0Q3VycmVuY3lQYWlyTW9uZXlUaWNrZXIgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeV9wYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydkYXRhJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAodGlja2VyWydkYXRhVXBkYXRlVGltZSddIC8gMTAwMCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXVsndmFsdWUnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXVsndmFsdWUnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXVsndmFsdWUnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pWyd2YWx1ZSddLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXVsndmFsdWUnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J11bJ3ZhbHVlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2F2ZyddWyd2YWx1ZSddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXVsndmFsdWUnXSksXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldEN1cnJlbmN5UGFpck1vbmV5VHJhZGVGZXRjaCAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnYW1vdW50X2ludCc6IGFtb3VudCxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZV9pbnQnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEN1cnJlbmN5UGFpck9yZGVyQWRkICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBub25jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHJlcXVlc3QgPSB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyByZXF1ZXN0O1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHsgJ25vbmNlJzogbm9uY2UgfSwgcXVlcnkpKTtcbiAgICAgICAgICAgIGxldCBzZWNyZXQgPSB0aGlzLmJhc2U2NFRvQmluYXJ5ICh0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBsZXQgYXV0aCA9IHJlcXVlc3QgKyBcIlxcMFwiICsgYm9keTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdSZXN0LUtleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdSZXN0LVNpZ24nOiB0aGlzLmhtYWMgKGF1dGgsIHNlY3JldCwgJ3NoYTUxMicsICdiYXNlNjQnKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXQyYyA9IHtcblxuICAgICdpZCc6ICdiaXQyYycsXG4gICAgJ25hbWUnOiAnQml0MkMnLFxuICAgICdjb3VudHJpZXMnOiAnSUwnLCAvLyBJc3JhZWxcbiAgICAncmF0ZUxpbWl0JzogMzAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjExOS0zNTkzMjIwZS01ZWNlLTExZTctOGIzYS01YTA0MWY2YmNjM2YuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5iaXQyYy5jby5pbCcsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuYml0MmMuY28uaWwnLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3LmJpdDJjLmNvLmlsL2hvbWUvYXBpJyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vT2ZlckUvYml0MmMnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ0V4Y2hhbmdlcy97cGFpcn0vVGlja2VyJyxcbiAgICAgICAgICAgICAgICAnRXhjaGFuZ2VzL3twYWlyfS9vcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICdFeGNoYW5nZXMve3BhaXJ9L3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdBY2NvdW50L0JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdBY2NvdW50L0JhbGFuY2UvdjInLFxuICAgICAgICAgICAgICAgICdNZXJjaGFudC9DcmVhdGVDaGVja291dCcsXG4gICAgICAgICAgICAgICAgJ09yZGVyL0FjY291bnRIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvQWRkQ29pbkZ1bmRzUmVxdWVzdCcsXG4gICAgICAgICAgICAgICAgJ09yZGVyL0FkZEZ1bmQnLFxuICAgICAgICAgICAgICAgICdPcmRlci9BZGRPcmRlcicsXG4gICAgICAgICAgICAgICAgJ09yZGVyL0FkZE9yZGVyTWFya2V0UHJpY2VCdXknLFxuICAgICAgICAgICAgICAgICdPcmRlci9BZGRPcmRlck1hcmtldFByaWNlU2VsbCcsXG4gICAgICAgICAgICAgICAgJ09yZGVyL0NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvTXlPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdQYXltZW50L0dldE15SWQnLFxuICAgICAgICAgICAgICAgICdQYXltZW50L1NlbmQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9OSVMnOiB7ICdpZCc6ICdCdGNOaXMnLCAnc3ltYm9sJzogJ0JUQy9OSVMnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnTklTJyB9LFxuICAgICAgICAnTFRDL0JUQyc6IHsgJ2lkJzogJ0x0Y0J0YycsICdzeW1ib2wnOiAnTFRDL0JUQycsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMVEMvTklTJzogeyAnaWQnOiAnTHRjTmlzJywgJ3N5bWJvbCc6ICdMVEMvTklTJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ05JUycgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RBY2NvdW50QmFsYW5jZVYyICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRFeGNoYW5nZXNQYWlyT3JkZXJib29rICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IG9yZGVyWzBdO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBvcmRlclsxXTtcbiAgICAgICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gb3JkZXJbMl0gKiAxMDAwO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQsIHRpbWVzdGFtcCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRFeGNoYW5nZXNQYWlyVGlja2VyICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2wnXSksXG4gICAgICAgICAgICAnYmlkJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Fzayc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGwnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXYnXSksXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYSddKSxcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RXhjaGFuZ2VzUGFpclRyYWRlcyAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlUG9zdE9yZGVyQWRkT3JkZXInO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnQW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ1BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKSB7XG4gICAgICAgICAgICBtZXRob2QgKz0gJ01hcmtldFByaWNlJyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcmRlclsnUHJpY2UnXSA9IHByaWNlO1xuICAgICAgICAgICAgb3JkZXJbJ1RvdGFsJ10gPSBhbW91bnQgKiBwcmljZTtcbiAgICAgICAgICAgIG9yZGVyWydJc0JpZCddID0gKHNpZGUgPT0gJ2J1eScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9ICcuanNvbic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgJ25vbmNlJzogbm9uY2UgfSwgcGFyYW1zKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgJ2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdzaWduJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTUxMicsICdiYXNlNjQnKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXRiYXkgPSB7XG5cbiAgICAnaWQnOiAnYml0YmF5JyxcbiAgICAnbmFtZSc6ICdCaXRCYXknLFxuICAgICdjb3VudHJpZXMnOiBbICdQTCcsICdFVScsIF0sIC8vIFBvbGFuZFxuICAgICdyYXRlTGltaXQnOiAxMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MTMyLTk3OGE3YmQ4LTVlY2UtMTFlNy05NTQwLWJjOTZkMWU5YmJiOC5qcGcnLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vYml0YmF5Lm5ldCcsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAncHVibGljJzogJ2h0dHBzOi8vYml0YmF5Lm5ldC9BUEkvUHVibGljJyxcbiAgICAgICAgICAgICdwcml2YXRlJzogJ2h0dHBzOi8vYml0YmF5Lm5ldC9BUEkvVHJhZGluZy90cmFkaW5nQXBpLnBocCcsXG4gICAgICAgIH0sXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9iaXRiYXkubmV0L3B1YmxpYy1hcGknLFxuICAgICAgICAgICAgJ2h0dHBzOi8vYml0YmF5Lm5ldC9hY2NvdW50L3RhYi1hcGknLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9CaXRCYXlOZXQvQVBJJyxcbiAgICAgICAgXSwgXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAne2lkfS9hbGwnLFxuICAgICAgICAgICAgICAgICd7aWR9L21hcmtldCcsXG4gICAgICAgICAgICAgICAgJ3tpZH0vb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAne2lkfS90aWNrZXInLFxuICAgICAgICAgICAgICAgICd7aWR9L3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdpbmZvJyxcbiAgICAgICAgICAgICAgICAndHJhZGUnLFxuICAgICAgICAgICAgICAgICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgICdvcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICd0cmFuc2ZlcicsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgICAgICAnaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzogeyAgXG4gICAgICAgICdCVEMvVVNEJzogeyAnaWQnOiAnQlRDVVNEJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdCVENFVVInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgICAgICAnQlRDL1BMTic6IHsgJ2lkJzogJ0JUQ1BMTicsICdzeW1ib2wnOiAnQlRDL1BMTicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdQTE4nIH0sXG4gICAgICAgICdMVEMvVVNEJzogeyAnaWQnOiAnTFRDVVNEJywgJ3N5bWJvbCc6ICdMVEMvVVNEJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0xUQy9FVVInOiB7ICdpZCc6ICdMVENFVVInLCAnc3ltYm9sJzogJ0xUQy9FVVInLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgICAgICAnTFRDL1BMTic6IHsgJ2lkJzogJ0xUQ1BMTicsICdzeW1ib2wnOiAnTFRDL1BMTicsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdQTE4nIH0sXG4gICAgICAgICdMVEMvQlRDJzogeyAnaWQnOiAnTFRDQlRDJywgJ3N5bWJvbCc6ICdMVEMvQlRDJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0VUSC9VU0QnOiB7ICdpZCc6ICdFVEhVU0QnLCAnc3ltYm9sJzogJ0VUSC9VU0QnLCAnYmFzZSc6ICdFVEgnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnRVRIL0VVUic6IHsgJ2lkJzogJ0VUSEVVUicsICdzeW1ib2wnOiAnRVRIL0VVUicsICdiYXNlJzogJ0VUSCcsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdFVEgvUExOJzogeyAnaWQnOiAnRVRIUExOJywgJ3N5bWJvbCc6ICdFVEgvUExOJywgJ2Jhc2UnOiAnRVRIJywgJ3F1b3RlJzogJ1BMTicgfSxcbiAgICAgICAgJ0VUSC9CVEMnOiB7ICdpZCc6ICdFVEhCVEMnLCAnc3ltYm9sJzogJ0VUSC9CVEMnLCAnYmFzZSc6ICdFVEgnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnTFNLL1VTRCc6IHsgJ2lkJzogJ0xTS1VTRCcsICdzeW1ib2wnOiAnTFNLL1VTRCcsICdiYXNlJzogJ0xTSycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdMU0svRVVSJzogeyAnaWQnOiAnTFNLRVVSJywgJ3N5bWJvbCc6ICdMU0svRVVSJywgJ2Jhc2UnOiAnTFNLJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICAgICAgJ0xTSy9QTE4nOiB7ICdpZCc6ICdMU0tQTE4nLCAnc3ltYm9sJzogJ0xTSy9QTE4nLCAnYmFzZSc6ICdMU0snLCAncXVvdGUnOiAnUExOJyB9LFxuICAgICAgICAnTFNLL0JUQyc6IHsgJ2lkJzogJ0xTS0JUQycsICdzeW1ib2wnOiAnTFNLL0JUQycsICdiYXNlJzogJ0xTSycsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEluZm8gKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldElkT3JkZXJib29rICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IG9yZGVyYm9va1snYmlkcyddLFxuICAgICAgICAgICAgJ2Fza3MnOiBvcmRlcmJvb2tbJ2Fza3MnXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldElkVGlja2VyICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21heCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21pbiddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWyd2d2FwJ10pLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogcGFyc2VGbG9hdCAodGlja2VyWydhdmVyYWdlJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkgeyBcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0SWRUcmFkZXMgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VHJhZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgICAgICAnY3VycmVuY3knOiBwWydiYXNlJ10sXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3BheW1lbnRfY3VycmVuY3knOiBwWydxdW90ZSddLFxuICAgICAgICAgICAgJ3JhdGUnOiBwcmljZSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddW3R5cGVdO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9ICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKSArICcuanNvbic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ21ldGhvZCc6IHBhdGgsXG4gICAgICAgICAgICAgICAgJ21vbWVudCc6IHRoaXMubm9uY2UgKCksXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdBUEktS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ0FQSS1IYXNoJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdGJheXMgPSB7XG5cbiAgICAnaWQnOiAnYml0YmF5cycsXG4gICAgJ25hbWUnOiAnQml0QmF5cycsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0NOJywgJ0dCJywgJ0hLJywgJ0FVJywgJ0NBJyBdLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzgwODU5OS05ODM2ODdkMi02MDUxLTExZTctOGQ5NS04MGRmY2JlNWNiYjQuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2JpdGJheXMuY29tL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9iaXRiYXlzLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9iaXRiYXlzLmNvbS9oZWxwL2FwaS8nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2RlcHRoJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ2luZm8nLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvVVNEJzogeyAnaWQnOiAnYnRjX3VzZCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdCVEMvQ05ZJzogeyAnaWQnOiAnYnRjX2NueScsICdzeW1ib2wnOiAnQlRDL0NOWScsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdPRFMvQlRDJzogeyAnaWQnOiAnb2RzX2J0YycsICdzeW1ib2wnOiAnT0RTL0JUQycsICdiYXNlJzogJ09EUycsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMU0svQlRDJzogeyAnaWQnOiAnbHNrX2J0YycsICdzeW1ib2wnOiAnTFNLL0JUQycsICdiYXNlJzogJ0xTSycsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMU0svQ05ZJzogeyAnaWQnOiAnbHNrX2NueScsICdzeW1ib2wnOiAnTFNLL0NOWScsICdiYXNlJzogJ0xTSycsICdxdW90ZSc6ICdDTlknIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0RGVwdGggKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgb3JkZXJib29rID0gcmVzcG9uc2VbJ3Jlc3VsdCddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IFsgJ2JpZHMnLCAnYXNrcycgXTtcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBzaWRlcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1tzXTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlclswXSk7XG4gICAgICAgICAgICAgICAgbGV0IGFtb3VudCA9IHBhcnNlRmxvYXQgKG9yZGVyWzFdKTtcbiAgICAgICAgICAgICAgICByZXN1bHRbc2lkZV0ucHVzaCAoWyBwcmljZSwgYW1vdW50IF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsncmVzdWx0J107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ29wJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKSB7XG4gICAgICAgICAgICBvcmRlclsnb3JkZXJfdHlwZSddID0gMTtcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcmRlclsnb3JkZXJfdHlwZSddID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFRyYWRlICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHBhdGg7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdLZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnU2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXRjb2luY29pZCA9IHtcblxuICAgICdpZCc6ICdiaXRjb2luY29pZCcsXG4gICAgJ25hbWUnOiAnQml0Y29pbi5jby5pZCcsXG4gICAgJ2NvdW50cmllcyc6ICdJRCcsIC8vIEluZG9uZXNpYVxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MTM4LTA0M2M3Nzg2LTVlY2YtMTFlNy04ODJiLTgwOWMxNGYzOGI1My5qcGcnLFxuICAgICAgICAnYXBpJzoge1xuICAgICAgICAgICAgJ3B1YmxpYyc6ICdodHRwczovL3ZpcC5iaXRjb2luLmNvLmlkL2FwaScsXG4gICAgICAgICAgICAncHJpdmF0ZSc6ICdodHRwczovL3ZpcC5iaXRjb2luLmNvLmlkL3RhcGknLFxuICAgICAgICB9LFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmJpdGNvaW4uY28uaWQnLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vdmlwLmJpdGNvaW4uY28uaWQvdHJhZGVfYXBpJyxcbiAgICAgICAgICAgICdodHRwczovL3ZpcC5iaXRjb2luLmNvLmlkL2Rvd25sb2Fkcy9CSVRDT0lOQ09JRC1BUEktRE9DVU1FTlRBVElPTi5wZGYnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3twYWlyfS90aWNrZXInLFxuICAgICAgICAgICAgICAgICd7cGFpcn0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAne3BhaXJ9L2RlcHRoJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2dldEluZm8nLFxuICAgICAgICAgICAgICAgICd0cmFuc0hpc3RvcnknLFxuICAgICAgICAgICAgICAgICd0cmFkZScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ29wZW5PcmRlcnMnLFxuICAgICAgICAgICAgICAgICdjYW5jZWxPcmRlcicsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL0lEUic6ICB7ICdpZCc6ICdidGNfaWRyJywgJ3N5bWJvbCc6ICdCVEMvSURSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0lEUicsICdiYXNlSWQnOiAnYnRjJywgJ3F1b3RlSWQnOiAnaWRyJyB9LFxuICAgICAgICAnQlRTL0JUQyc6ICB7ICdpZCc6ICdidHNfYnRjJywgJ3N5bWJvbCc6ICdCVFMvQlRDJywgJ2Jhc2UnOiAnQlRTJywgJ3F1b3RlJzogJ0JUQycsICdiYXNlSWQnOiAnYnRzJywgJ3F1b3RlSWQnOiAnYnRjJyB9LFxuICAgICAgICAnREFTSC9CVEMnOiB7ICdpZCc6ICdkcmtfYnRjJywgJ3N5bWJvbCc6ICdEQVNIL0JUQycsICdiYXNlJzogJ0RBU0gnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdkcmsnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdET0dFL0JUQyc6IHsgJ2lkJzogJ2RvZ2VfYnRjJywgJ3N5bWJvbCc6ICdET0dFL0JUQycsICdiYXNlJzogJ0RPR0UnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdkb2dlJywgJ3F1b3RlSWQnOiAnYnRjJyB9LFxuICAgICAgICAnRVRIL0JUQyc6ICB7ICdpZCc6ICdldGhfYnRjJywgJ3N5bWJvbCc6ICdFVEgvQlRDJywgJ2Jhc2UnOiAnRVRIJywgJ3F1b3RlJzogJ0JUQycsICdiYXNlSWQnOiAnZXRoJywgJ3F1b3RlSWQnOiAnYnRjJyB9LFxuICAgICAgICAnTFRDL0JUQyc6ICB7ICdpZCc6ICdsdGNfYnRjJywgJ3N5bWJvbCc6ICdMVEMvQlRDJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0JUQycsICdiYXNlSWQnOiAnbHRjJywgJ3F1b3RlSWQnOiAnYnRjJyB9LFxuICAgICAgICAnTlhUL0JUQyc6ICB7ICdpZCc6ICdueHRfYnRjJywgJ3N5bWJvbCc6ICdOWFQvQlRDJywgJ2Jhc2UnOiAnTlhUJywgJ3F1b3RlJzogJ0JUQycsICdiYXNlSWQnOiAnbnh0JywgJ3F1b3RlSWQnOiAnYnRjJyB9LFxuICAgICAgICAnU1RSL0JUQyc6ICB7ICdpZCc6ICdzdHJfYnRjJywgJ3N5bWJvbCc6ICdTVFIvQlRDJywgJ2Jhc2UnOiAnU1RSJywgJ3F1b3RlJzogJ0JUQycsICdiYXNlSWQnOiAnc3RyJywgJ3F1b3RlSWQnOiAnYnRjJyB9LFxuICAgICAgICAnTkVNL0JUQyc6ICB7ICdpZCc6ICduZW1fYnRjJywgJ3N5bWJvbCc6ICdORU0vQlRDJywgJ2Jhc2UnOiAnTkVNJywgJ3F1b3RlJzogJ0JUQycsICdiYXNlSWQnOiAnbmVtJywgJ3F1b3RlSWQnOiAnYnRjJyB9LFxuICAgICAgICAnWFJQL0JUQyc6ICB7ICdpZCc6ICd4cnBfYnRjJywgJ3N5bWJvbCc6ICdYUlAvQlRDJywgJ2Jhc2UnOiAnWFJQJywgJ3F1b3RlJzogJ0JUQycsICdiYXNlSWQnOiAneHJwJywgJ3F1b3RlSWQnOiAnYnRjJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEdldEluZm8gKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFBhaXJEZXB0aCAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IFtdLFxuICAgICAgICAgICAgJ2Fza3MnOiBbXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzaWRlcyA9IHsgJ2JpZHMnOiAnYnV5JywgJ2Fza3MnOiAnc2VsbCcgfTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAoc2lkZXMpO1xuICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IGtleXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2tdO1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1trZXldO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWzBdKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbMV0pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcGFpciA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0UGFpclRpY2tlciAoe1xuICAgICAgICAgICAgJ3BhaXInOiBwYWlyWydpZCddLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWyd0aWNrZXInXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VydmVyX3RpbWUnXSkgKiAxMDAwO1xuICAgICAgICBsZXQgYmFzZVZvbHVtZSA9ICd2b2xfJyArIHBhaXJbJ2Jhc2VJZCddLnRvTG93ZXJDYXNlICgpO1xuICAgICAgICBsZXQgcXVvdGVWb2x1bWUgPSAndm9sXycgKyBwYWlyWydxdW90ZUlkJ10udG9Mb3dlckNhc2UgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2F2ZXJhZ2UnXSksXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlcltiYXNlVm9sdW1lXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbcXVvdGVWb2x1bWVdKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRQYWlyVHJhZGVzICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdwYWlyJzogcFsnaWQnXSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgYmFzZSA9IHBbJ2Jhc2UnXS50b0xvd2VyQ2FzZSAoKTtcbiAgICAgICAgb3JkZXJbYmFzZV0gPSBhbW91bnQ7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VHJhZGUgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddW3R5cGVdO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9ICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbWV0aG9kJzogcGF0aCxcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiB0aGlzLm5vbmNlICgpLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAnS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1NpZ24nOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0ZmluZXggPSB7XG5cbiAgICAnaWQnOiAnYml0ZmluZXgnLFxuICAgICduYW1lJzogJ0JpdGZpbmV4JyxcbiAgICAnY291bnRyaWVzJzogJ1VTJyxcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYyNDQtZTMyOGE1MGMtNWVkMi0xMWU3LTk0N2ItMDQxNDE2NTc5YmIzLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkuYml0ZmluZXguY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5iaXRmaW5leC5jb20nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vYml0ZmluZXgucmVhZG1lLmlvL3YxL2RvY3MnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vYml0ZmluZXgucmVhZG1lLmlvL3YyL2RvY3MnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9iaXRmaW5leGNvbS9iaXRmaW5leC1hcGktbm9kZScsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYm9vay97c3ltYm9sfScsXG4gICAgICAgICAgICAgICAgJ2NhbmRsZXMve3N5bWJvbH0nLFxuICAgICAgICAgICAgICAgICdsZW5kYm9vay97Y3VycmVuY3l9JyxcbiAgICAgICAgICAgICAgICAnbGVuZHMve2N1cnJlbmN5fScsXG4gICAgICAgICAgICAgICAgJ3B1YnRpY2tlci97c3ltYm9sfScsXG4gICAgICAgICAgICAgICAgJ3N0YXRzL3tzeW1ib2x9JyxcbiAgICAgICAgICAgICAgICAnc3ltYm9scycsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbHNfZGV0YWlscycsXG4gICAgICAgICAgICAgICAgJ3RvZGF5JyxcbiAgICAgICAgICAgICAgICAndHJhZGVzL3tzeW1ib2x9JywgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdhY2NvdW50X2luZm9zJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdiYXNrZXRfbWFuYWdlJyxcbiAgICAgICAgICAgICAgICAnY3JlZGl0cycsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXQvbmV3JyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZy9jbG9zZScsXG4gICAgICAgICAgICAgICAgJ2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdoaXN0b3J5L21vdmVtZW50cycsXG4gICAgICAgICAgICAgICAgJ2tleV9pbmZvJyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luX2luZm9zJyxcbiAgICAgICAgICAgICAgICAnbXl0cmFkZXMnLFxuICAgICAgICAgICAgICAgICdvZmZlci9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICdvZmZlci9uZXcnLFxuICAgICAgICAgICAgICAgICdvZmZlci9zdGF0dXMnLFxuICAgICAgICAgICAgICAgICdvZmZlcnMnLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwvYWxsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY2FuY2VsL211bHRpJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY2FuY2VsL3JlcGxhY2UnLFxuICAgICAgICAgICAgICAgICdvcmRlci9uZXcnLFxuICAgICAgICAgICAgICAgICdvcmRlci9uZXcvbXVsdGknLFxuICAgICAgICAgICAgICAgICdvcmRlci9zdGF0dXMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9jbGFpbScsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9ucycsXG4gICAgICAgICAgICAgICAgJ3N1bW1hcnknLFxuICAgICAgICAgICAgICAgICd0YWtlbl9mdW5kcycsXG4gICAgICAgICAgICAgICAgJ3RvdGFsX3Rha2VuX2Z1bmRzJyxcbiAgICAgICAgICAgICAgICAndHJhbnNmZXInLFxuICAgICAgICAgICAgICAgICd1bnVzZWRfdGFrZW5fZnVuZHMnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRTeW1ib2xzRGV0YWlscyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsncGFpciddLnRvVXBwZXJDYXNlICgpO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBpZC5zbGljZSAoMCwgMyk7XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBpZC5zbGljZSAoMywgNik7XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2VzICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRCb29rU3ltYm9sICh7IFxuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWydwcmljZSddKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbJ2Ftb3VudCddKTtcbiAgICAgICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKHBhcnNlRmxvYXQgKG9yZGVyWyd0aW1lc3RhbXAnXSkpO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQsIHRpbWVzdGFtcCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQdWJ0aWNrZXJTeW1ib2wgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VGbG9hdCAodGlja2VyWyd0aW1lc3RhbXAnXSkgKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0X3ByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21pZCddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzU3ltYm9sICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXJOZXcgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudC50b1N0cmluZyAoKSxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLnRvU3RyaW5nICgpLFxuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3R5cGUnOiAnZXhjaGFuZ2UgJyArIHR5cGUsXG4gICAgICAgICAgICAnb2Nvb3JkZXInOiBmYWxzZSxcbiAgICAgICAgICAgICdidXlfcHJpY2Vfb2NvJzogMCxcbiAgICAgICAgICAgICdzZWxsX3ByaWNlX29jbyc6IDAsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgcmVxdWVzdCA9ICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHJlcXVlc3Q7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7ICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgcXVlcnkgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLnRvU3RyaW5nICgpLFxuICAgICAgICAgICAgICAgICdyZXF1ZXN0JzogcmVxdWVzdCxcbiAgICAgICAgICAgIH0sIHF1ZXJ5KTtcbiAgICAgICAgICAgIGxldCBwYXlsb2FkID0gdGhpcy5zdHJpbmdUb0Jhc2U2NCAoSlNPTi5zdHJpbmdpZnkgKHF1ZXJ5KSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdYLUJGWC1BUElLRVknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnWC1CRlgtUEFZTE9BRCc6IHBheWxvYWQsXG4gICAgICAgICAgICAgICAgJ1gtQkZYLVNJR05BVFVSRSc6IHRoaXMuaG1hYyAocGF5bG9hZCwgdGhpcy5zZWNyZXQsICdzaGEzODQnKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXRsaXNoID0ge1xuXG4gICAgJ2lkJzogJ2JpdGxpc2gnLFxuICAgICduYW1lJzogJ2JpdGxpc2gnLFxuICAgICdjb3VudHJpZXMnOiBbICdHQicsICdFVScsICdSVScsIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsICAgIFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjI3NS1kY2ZjNmMzMC01ZWQzLTExZTctODM5ZC0wMGE4NDYzODVkMGIuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2JpdGxpc2guY29tL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9iaXRsaXNoLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9iaXRsaXNoLmNvbS9hcGknLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2luc3RydW1lbnRzJyxcbiAgICAgICAgICAgICAgICAnb2hsY3YnLFxuICAgICAgICAgICAgICAgICdwYWlycycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcnMnLFxuICAgICAgICAgICAgICAgICd0cmFkZXNfZGVwdGgnLFxuICAgICAgICAgICAgICAgICd0cmFkZXNfaGlzdG9yeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdhY2NvdW50c19vcGVyYXRpb25zJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF90cmFkZScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF90cmFkZXNfYnlfaWRzJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX2FsbF90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdjcmVhdGVfYmNvZGUnLFxuICAgICAgICAgICAgICAgICdjcmVhdGVfdGVtcGxhdGVfd2FsbGV0JyxcbiAgICAgICAgICAgICAgICAnY3JlYXRlX3RyYWRlJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdCcsXG4gICAgICAgICAgICAgICAgJ2xpc3RfYWNjb3VudHNfb3BlcmF0aW9uc19mcm9tX3RzJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9hY3RpdmVfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9iY29kZXMnLFxuICAgICAgICAgICAgICAgICdsaXN0X215X21hdGNoZXNfZnJvbV90cycsXG4gICAgICAgICAgICAgICAgJ2xpc3RfbXlfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9teV90cmFkc19mcm9tX3RzJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9wYXltZW50X21ldGhvZHMnLFxuICAgICAgICAgICAgICAgICdsaXN0X3BheW1lbnRzJyxcbiAgICAgICAgICAgICAgICAncmVkZWVtX2NvZGUnLFxuICAgICAgICAgICAgICAgICdyZXNpZ24nLFxuICAgICAgICAgICAgICAgICdzaWduaW4nLFxuICAgICAgICAgICAgICAgICdzaWdub3V0JyxcbiAgICAgICAgICAgICAgICAndHJhZGVfZGV0YWlscycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX29wdGlvbnMnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2J5X2lkJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFBhaXJzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHByb2R1Y3RzKTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW2tleXNbcF1dO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnaWQnXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBwcm9kdWN0WyduYW1lJ107XG4gICAgICAgICAgICBsZXQgWyBiYXNlLCBxdW90ZSBdID0gc3ltYm9sLnNwbGl0ICgnLycpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXJzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXJzICgpO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1twWydpZCddXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydtYXgnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydtaW4nXSksXG4gICAgICAgICAgICAnYmlkJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Fzayc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2ZpcnN0J10pLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRyYWRlc0RlcHRoICh7XG4gICAgICAgICAgICAncGFpcl9pZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAocGFyc2VJbnQgKG9yZGVyYm9va1snbGFzdCddKSAvIDEwMDApO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSB7ICdiaWRzJzogJ2JpZCcsICdhc2tzJzogJ2FzaycgfTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAoc2lkZXMpO1xuICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IGtleXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2tdO1xuICAgICAgICAgICAgbGV0IHNpZGUgPSBzaWRlc1trZXldO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWydwcmljZSddKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbJ3ZvbHVtZSddKTtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzSGlzdG9yeSAoe1xuICAgICAgICAgICAgJ3BhaXJfaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIHNpZ25JbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0U2lnbmluICh7XG4gICAgICAgICAgICAnbG9naW4nOiB0aGlzLmxvZ2luLFxuICAgICAgICAgICAgJ3Bhc3N3ZCc6IHRoaXMucGFzc3dvcmQsXG4gICAgICAgIH0pO1xuICAgIH0sICAgIFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdwYWlyX2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2Rpcic6IChzaWRlID09ICdidXknKSA/ICdiaWQnIDogJ2FzaycsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RDcmVhdGVUcmFkZSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHRoaXMuZXh0ZW5kICh7ICd0b2tlbic6IHRoaXMuYXBpS2V5IH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0bWFya2V0ID0ge1xuXG4gICAgJ2lkJzogJ2JpdG1hcmtldCcsXG4gICAgJ25hbWUnOiAnQml0TWFya2V0JyxcbiAgICAnY291bnRyaWVzJzogWyAnUEwnLCAnRVUnLCBdLFxuICAgICdyYXRlTGltaXQnOiAzMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY3MjU2LWE4NTU1MjAwLTVlZjktMTFlNy05NmZkLTQ2OWE2NWUyYjBiZC5qcGcnLFxuICAgICAgICAnYXBpJzoge1xuICAgICAgICAgICAgJ3B1YmxpYyc6ICdodHRwczovL3d3dy5iaXRtYXJrZXQubmV0JyxcbiAgICAgICAgICAgICdwcml2YXRlJzogJ2h0dHBzOi8vd3d3LmJpdG1hcmtldC5wbC9hcGkyLycsIC8vIGxhc3Qgc2xhc2ggaXMgY3JpdGljYWxcbiAgICAgICAgfSxcbiAgICAgICAgJ3d3dyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3d3dy5iaXRtYXJrZXQucGwnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3LmJpdG1hcmtldC5uZXQnLFxuICAgICAgICBdLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3LmJpdG1hcmtldC5uZXQvZG9jcy5waHA/ZmlsZT1hcGlfcHVibGljLmh0bWwnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3LmJpdG1hcmtldC5uZXQvZG9jcy5waHA/ZmlsZT1hcGlfcHJpdmF0ZS5odG1sJyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vYml0bWFya2V0LW5ldC9hcGknLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2pzb24ve21hcmtldH0vdGlja2VyJyxcbiAgICAgICAgICAgICAgICAnanNvbi97bWFya2V0fS9vcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICdqc29uL3ttYXJrZXR9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2pzb24vY3RyYW5zZmVyJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzkwbScsXG4gICAgICAgICAgICAgICAgJ2dyYXBocy97bWFya2V0fS82aCcsXG4gICAgICAgICAgICAgICAgJ2dyYXBocy97bWFya2V0fS8xZCcsXG4gICAgICAgICAgICAgICAgJ2dyYXBocy97bWFya2V0fS83ZCcsXG4gICAgICAgICAgICAgICAgJ2dyYXBocy97bWFya2V0fS8xbScsXG4gICAgICAgICAgICAgICAgJ2dyYXBocy97bWFya2V0fS8zbScsXG4gICAgICAgICAgICAgICAgJ2dyYXBocy97bWFya2V0fS82bScsXG4gICAgICAgICAgICAgICAgJ2dyYXBocy97bWFya2V0fS8xeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdpbmZvJyxcbiAgICAgICAgICAgICAgICAndHJhZGUnLFxuICAgICAgICAgICAgICAgICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgICAgICdoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMnLFxuICAgICAgICAgICAgICAgICd0cmFkaW5nZGVzaycsXG4gICAgICAgICAgICAgICAgJ3RyYWRpbmdkZXNrU3RhdHVzJyxcbiAgICAgICAgICAgICAgICAndHJhZGluZ2Rlc2tDb25maXJtJyxcbiAgICAgICAgICAgICAgICAnY3J5cHRvdHJhZGluZ2Rlc2snLFxuICAgICAgICAgICAgICAgICdjcnlwdG90cmFkaW5nZGVza1N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ2NyeXB0b3RyYWRpbmdkZXNrQ29uZmlybScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdGaWF0JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdQTE5QUCcsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3RmlhdEZhc3QnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0JyxcbiAgICAgICAgICAgICAgICAndHJhbnNmZXInLFxuICAgICAgICAgICAgICAgICd0cmFuc2ZlcnMnLFxuICAgICAgICAgICAgICAgICdtYXJnaW5MaXN0JyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luT3BlbicsXG4gICAgICAgICAgICAgICAgJ21hcmdpbkNsb3NlJyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luQ2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luTW9kaWZ5JyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luQmFsYW5jZUFkZCcsXG4gICAgICAgICAgICAgICAgJ21hcmdpbkJhbGFuY2VSZW1vdmUnLFxuICAgICAgICAgICAgICAgICdzd2FwTGlzdCcsXG4gICAgICAgICAgICAgICAgJ3N3YXBPcGVuJyxcbiAgICAgICAgICAgICAgICAnc3dhcENsb3NlJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvUExOJzogeyAnaWQnOiAnQlRDUExOJywgJ3N5bWJvbCc6ICdCVEMvUExOJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1BMTicgfSxcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdCVENFVVInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgICAgICAnTFRDL1BMTic6IHsgJ2lkJzogJ0xUQ1BMTicsICdzeW1ib2wnOiAnTFRDL1BMTicsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdQTE4nIH0sXG4gICAgICAgICdMVEMvQlRDJzogeyAnaWQnOiAnTFRDQlRDJywgJ3N5bWJvbCc6ICdMVEMvQlRDJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0xNWC9CVEMnOiB7ICdpZCc6ICdMaXRlTWluZVhCVEMnLCAnc3ltYm9sJzogJ0xNWC9CVEMnLCAnYmFzZSc6ICdMTVgnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEluZm8gKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7IFxuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRKc29uTWFya2V0T3JkZXJib29rICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBvcmRlcmJvb2tbJ2JpZHMnXSxcbiAgICAgICAgICAgICdhc2tzJzogb3JkZXJib29rWydhc2tzJ10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEpzb25NYXJrZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0SnNvbk1hcmtldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFRyYWRlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncmF0ZSc6IHByaWNlLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV07XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoICsgJy5qc29uJywgcGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICd0b25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdtZXRob2QnOiBwYXRoLFxuICAgICAgICAgICAgfSwgcGFyYW1zKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQVBJLUtleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdBUEktSGFzaCc6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXRtZXggPSB7XG5cbiAgICAnaWQnOiAnYml0bWV4JyxcbiAgICAnbmFtZSc6ICdCaXRNRVgnLFxuICAgICdjb3VudHJpZXMnOiAnU0MnLCAvLyBTZXljaGVsbGVzXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MzE5LWY2NTNjNmU2LTVlZDQtMTFlNy05MzNkLWYwYmMzNjk5YWU4Zi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vd3d3LmJpdG1leC5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmJpdG1leC5jb20nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3LmJpdG1leC5jb20vYXBwL2FwaU92ZXJ2aWV3JyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vQml0TUVYL2FwaS1jb25uZWN0b3JzL3RyZWUvbWFzdGVyL29mZmljaWFsLWh0dHAnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2Fubm91bmNlbWVudCcsXG4gICAgICAgICAgICAgICAgJ2Fubm91bmNlbWVudC91cmdlbnQnLFxuICAgICAgICAgICAgICAgICdmdW5kaW5nJyxcbiAgICAgICAgICAgICAgICAnaW5zdHJ1bWVudCcsXG4gICAgICAgICAgICAgICAgJ2luc3RydW1lbnQvYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAnaW5zdHJ1bWVudC9hY3RpdmVBbmRJbmRpY2VzJyxcbiAgICAgICAgICAgICAgICAnaW5zdHJ1bWVudC9hY3RpdmVJbnRlcnZhbHMnLFxuICAgICAgICAgICAgICAgICdpbnN0cnVtZW50L2NvbXBvc2l0ZUluZGV4JyxcbiAgICAgICAgICAgICAgICAnaW5zdHJ1bWVudC9pbmRpY2VzJyxcbiAgICAgICAgICAgICAgICAnaW5zdXJhbmNlJyxcbiAgICAgICAgICAgICAgICAnbGVhZGVyYm9hcmQnLFxuICAgICAgICAgICAgICAgICdsaXF1aWRhdGlvbicsXG4gICAgICAgICAgICAgICAgJ29yZGVyQm9vaycsXG4gICAgICAgICAgICAgICAgJ29yZGVyQm9vay9MMicsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJyxcbiAgICAgICAgICAgICAgICAncXVvdGUvYnVja2V0ZWQnLFxuICAgICAgICAgICAgICAgICdzY2hlbWEnLFxuICAgICAgICAgICAgICAgICdzY2hlbWEvd2Vic29ja2V0SGVscCcsXG4gICAgICAgICAgICAgICAgJ3NldHRsZW1lbnQnLFxuICAgICAgICAgICAgICAgICdzdGF0cycsXG4gICAgICAgICAgICAgICAgJ3N0YXRzL2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICd0cmFkZScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlL2J1Y2tldGVkJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYXBpS2V5JyxcbiAgICAgICAgICAgICAgICAnY2hhdCcsXG4gICAgICAgICAgICAgICAgJ2NoYXQvY2hhbm5lbHMnLFxuICAgICAgICAgICAgICAgICdjaGF0L2Nvbm5lY3RlZCcsXG4gICAgICAgICAgICAgICAgJ2V4ZWN1dGlvbicsXG4gICAgICAgICAgICAgICAgJ2V4ZWN1dGlvbi90cmFkZUhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdub3RpZmljYXRpb24nLFxuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uJyxcbiAgICAgICAgICAgICAgICAndXNlcicsXG4gICAgICAgICAgICAgICAgJ3VzZXIvYWZmaWxpYXRlU3RhdHVzJyxcbiAgICAgICAgICAgICAgICAndXNlci9jaGVja1JlZmVycmFsQ29kZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvY29tbWlzc2lvbicsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZGVwb3NpdEFkZHJlc3MnLFxuICAgICAgICAgICAgICAgICd1c2VyL21hcmdpbicsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbWluV2l0aGRyYXdhbEZlZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXRIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXRTdW1tYXJ5JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYXBpS2V5JyxcbiAgICAgICAgICAgICAgICAnYXBpS2V5L2Rpc2FibGUnLFxuICAgICAgICAgICAgICAgICdhcGlLZXkvZW5hYmxlJyxcbiAgICAgICAgICAgICAgICAnY2hhdCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvYnVsaycsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NhbmNlbEFsbEFmdGVyJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY2xvc2VQb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL2lzb2xhdGUnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9sZXZlcmFnZScsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL3Jpc2tMaW1pdCcsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL3RyYW5zZmVyTWFyZ2luJyxcbiAgICAgICAgICAgICAgICAndXNlci9jYW5jZWxXaXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAndXNlci9jb25maXJtRW1haWwnLFxuICAgICAgICAgICAgICAgICd1c2VyL2NvbmZpcm1FbmFibGVURkEnLFxuICAgICAgICAgICAgICAgICd1c2VyL2NvbmZpcm1XaXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAndXNlci9kaXNhYmxlVEZBJyxcbiAgICAgICAgICAgICAgICAndXNlci9sb2dvdXQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2xvZ291dEFsbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcHJlZmVyZW5jZXMnLFxuICAgICAgICAgICAgICAgICd1c2VyL3JlcXVlc3RFbmFibGVURkEnLFxuICAgICAgICAgICAgICAgICd1c2VyL3JlcXVlc3RXaXRoZHJhd2FsJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncHV0JzogW1xuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2J1bGsnLFxuICAgICAgICAgICAgICAgICd1c2VyJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICdhcGlLZXknLFxuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2FsbCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9XG4gICAgfSwgXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRJbnN0cnVtZW50QWN0aXZlICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydzeW1ib2wnXTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gcHJvZHVjdFsndW5kZXJseWluZyddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsncXVvdGVDdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IGlzRnV0dXJlc0NvbnRyYWN0ID0gaWQgIT0gKGJhc2UgKyBxdW90ZSk7XG4gICAgICAgICAgICBiYXNlID0gdGhpcy5jb21tb25DdXJyZW5jeUNvZGUgKGJhc2UpO1xuICAgICAgICAgICAgcXVvdGUgPSB0aGlzLmNvbW1vbkN1cnJlbmN5Q29kZSAocXVvdGUpO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGlzRnV0dXJlc0NvbnRyYWN0ID8gaWQgOiAoYmFzZSArICcvJyArIHF1b3RlKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldFVzZXJNYXJnaW4gKHsgJ2N1cnJlbmN5JzogJ2FsbCcgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyQm9va0wyICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBmb3IgKGxldCBvID0gMDsgbyA8IG9yZGVyYm9vay5sZW5ndGg7IG8rKykge1xuICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJib29rW29dO1xuICAgICAgICAgICAgbGV0IHNpZGUgPSAob3JkZXJbJ3NpZGUnXSA9PSAnU2VsbCcpID8gJ2Fza3MnIDogJ2JpZHMnO1xuICAgICAgICAgICAgbGV0IGFtb3VudCA9IG9yZGVyWydzaXplJ107XG4gICAgICAgICAgICBsZXQgcHJpY2UgPSBvcmRlclsncHJpY2UnXTtcbiAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETyBzb3J0IGJpZGFza3NcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2JpblNpemUnOiAnMWQnLFxuICAgICAgICAgICAgJ3BhcnRpYWwnOiB0cnVlLFxuICAgICAgICAgICAgJ2NvdW50JzogMSxcbiAgICAgICAgICAgICdyZXZlcnNlJzogdHJ1ZSwgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHF1b3RlcyA9IGF3YWl0IHRoaXMucHVibGljR2V0UXVvdGVCdWNrZXRlZCAocmVxdWVzdCk7XG4gICAgICAgIGxldCBxdW90ZXNMZW5ndGggPSBxdW90ZXMubGVuZ3RoO1xuICAgICAgICBsZXQgcXVvdGUgPSBxdW90ZXNbcXVvdGVzTGVuZ3RoIC0gMV07XG4gICAgICAgIGxldCB0aWNrZXJzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUcmFkZUJ1Y2tldGVkIChyZXF1ZXN0KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHRpY2tlcnNbMF07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0IChxdW90ZVsnYmlkUHJpY2UnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAocXVvdGVbJ2Fza1ByaWNlJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnY2xvc2UnXSksXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hvbWVOb3Rpb25hbCddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnZm9yZWlnbk5vdGlvbmFsJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnc2lkZSc6IHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSksXG4gICAgICAgICAgICAnb3JkZXJRdHknOiBhbW91bnQsXG4gICAgICAgICAgICAnb3JkVHlwZSc6IHRoaXMuY2FwaXRhbGl6ZSAodHlwZSksXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncmF0ZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXIgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCBxdWVyeSA9ICcvYXBpLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgcXVlcnkgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgcXVlcnk7XG4gICAgICAgIGlmICh0eXBlID09ICdwcml2YXRlJykge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGlmIChtZXRob2QgPT0gJ1BPU1QnKVxuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocGFyYW1zKTtcbiAgICAgICAgICAgIGxldCByZXF1ZXN0ID0gWyBtZXRob2QsIHF1ZXJ5LCBub25jZSwgYm9keSB8fCAnJ10uam9pbiAoJycpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICdhcGktbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnYXBpLWtleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdhcGktc2lnbmF0dXJlJzogdGhpcy5obWFjIChyZXF1ZXN0LCB0aGlzLnNlY3JldCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0c28gPSB7XG5cbiAgICAnaWQnOiAnYml0c28nLFxuICAgICduYW1lJzogJ0JpdHNvJyxcbiAgICAnY291bnRyaWVzJzogJ01YJywgLy8gTWV4aWNvXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsIC8vIDMwIHJlcXVlc3RzIHBlciBtaW51dGVcbiAgICAndmVyc2lvbic6ICd2MycsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYzMzUtNzE1Y2U3YWEtNWVkNS0xMWU3LTg4YTgtMTczYTI3YmIzMGZlLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkuYml0c28uY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2JpdHNvLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9iaXRzby5jb20vYXBpX2luZm8nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2F2YWlsYWJsZV9ib29rcycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ29yZGVyX2Jvb2snLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdhY2NvdW50X3N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdmZWVzJyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZ3MnLFxuICAgICAgICAgICAgICAgICdmdW5kaW5ncy97ZmlkfScsXG4gICAgICAgICAgICAgICAgJ2Z1bmRpbmdfZGVzdGluYXRpb24nLFxuICAgICAgICAgICAgICAgICdreWNfZG9jdW1lbnRzJyxcbiAgICAgICAgICAgICAgICAnbGVkZ2VyJyxcbiAgICAgICAgICAgICAgICAnbGVkZ2VyL3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2xlZGdlci9mZWVzJyxcbiAgICAgICAgICAgICAgICAnbGVkZ2VyL2Z1bmRpbmdzJyxcbiAgICAgICAgICAgICAgICAnbGVkZ2VyL3dpdGhkcmF3YWxzJyxcbiAgICAgICAgICAgICAgICAnbXhfYmFua19jb2RlcycsXG4gICAgICAgICAgICAgICAgJ29wZW5fb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfdHJhZGVzL3tvaWR9JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3tvaWR9JyxcbiAgICAgICAgICAgICAgICAndXNlcl90cmFkZXMnLFxuICAgICAgICAgICAgICAgICd1c2VyX3RyYWRlcy97dGlkfScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzLycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzL3t3aWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYml0Y29pbl93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnZGViaXRfY2FyZF93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnZXRoZXJfd2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3Bob25lX251bWJlcicsXG4gICAgICAgICAgICAgICAgJ3Bob25lX3ZlcmlmaWNhdGlvbicsXG4gICAgICAgICAgICAgICAgJ3Bob25lX3dpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdzcGVpX3dpdGhkcmF3YWwnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ29yZGVycy97b2lkfScsXG4gICAgICAgICAgICAgICAgJ29yZGVycy9hbGwnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRBdmFpbGFibGVCb29rcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzWydwYXlsb2FkJ10ubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3BheWxvYWQnXVtwXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ2Jvb2snXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBpZC50b1VwcGVyQ2FzZSAoKS5yZXBsYWNlICgnXycsICcvJyk7XG4gICAgICAgICAgICBsZXQgWyBiYXNlLCBxdW90ZSBdID0gc3ltYm9sLnNwbGl0ICgnLycpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRPcmRlckJvb2sgKHtcbiAgICAgICAgICAgICdib29rJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IHJlc3BvbnNlWydwYXlsb2FkJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLnBhcnNlODYwMSAob3JkZXJib29rWyd1cGRhdGVkX2F0J10pO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbJ3ByaWNlJ10pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsnYW1vdW50J10pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoe1xuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3BheWxvYWQnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMucGFyc2U4NjAxICh0aWNrZXJbJ2NyZWF0ZWRfYXQnXSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICh7XG4gICAgICAgICAgICAnYm9vayc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnYm9vayc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICd0eXBlJzogdHlwZSxcbiAgICAgICAgICAgICdtYWpvcic6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXJzICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgcXVlcnkgPSAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgcXVlcnk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5IChwYXJhbXMpO1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGxldCByZXF1ZXN0ID0gWyBub25jZSwgbWV0aG9kLCBxdWVyeSwgYm9keSB8fCAnJyBdLmpvaW4gKCcnKTtcbiAgICAgICAgICAgIGxldCBzaWduYXR1cmUgPSB0aGlzLmhtYWMgKHJlcXVlc3QsIHRoaXMuc2VjcmV0KTtcbiAgICAgICAgICAgIGxldCBhdXRoID0gdGhpcy5hcGlLZXkgKyAnOicgKyBub25jZSArICc6JyArIHNpZ25hdHVyZTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdBdXRob3JpemF0aW9uJzogXCJCaXRzbyBcIiArIGF1dGggfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdHN0YW1wID0ge1xuXG4gICAgJ2lkJzogJ2JpdHN0YW1wJyxcbiAgICAnbmFtZSc6ICdCaXRzdGFtcCcsXG4gICAgJ2NvdW50cmllcyc6ICdHQicsXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjInLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3Nzg2Mzc3LThjOGFiNTdlLTVmZTktMTFlNy04ZWE0LTJiMDViNmJjY2VlYy5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vd3d3LmJpdHN0YW1wLm5ldC9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmJpdHN0YW1wLm5ldCcsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly93d3cuYml0c3RhbXAubmV0L2FwaScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXJfYm9vay97aWR9LycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcl9ob3VyL3tpZH0vJyxcbiAgICAgICAgICAgICAgICAndGlja2VyL3tpZH0vJyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zL3tpZH0vJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UvJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZS97aWR9LycsXG4gICAgICAgICAgICAgICAgJ2J1eS97aWR9LycsXG4gICAgICAgICAgICAgICAgJ2J1eS9tYXJrZXQve2lkfS8nLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXIvJyxcbiAgICAgICAgICAgICAgICAnbGlxdWlkYXRpb25fYWRkcmVzcy9pbmZvLycsXG4gICAgICAgICAgICAgICAgJ2xpcXVpZGF0aW9uX2FkZHJlc3MvbmV3LycsXG4gICAgICAgICAgICAgICAgJ29wZW5fb3JkZXJzL2FsbC8nLFxuICAgICAgICAgICAgICAgICdvcGVuX29yZGVycy97aWR9LycsXG4gICAgICAgICAgICAgICAgJ3NlbGwve2lkfS8nLFxuICAgICAgICAgICAgICAgICdzZWxsL21hcmtldC97aWR9LycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyLWZyb20tbWFpbi8nLFxuICAgICAgICAgICAgICAgICd0cmFuc2Zlci10by1tYWluLycsXG4gICAgICAgICAgICAgICAgJ3VzZXJfdHJhbnNhY3Rpb25zLycsXG4gICAgICAgICAgICAgICAgJ3VzZXJfdHJhbnNhY3Rpb25zL3tpZH0vJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbC9jYW5jZWwvJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbC9vcGVuLycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWwvc3RhdHVzLycsXG4gICAgICAgICAgICAgICAgJ3hycF9hZGRyZXNzLycsXG4gICAgICAgICAgICAgICAgJ3hycF93aXRoZHJhd2FsLycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ2J0Y3VzZCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdCVEMvRVVSJzogeyAnaWQnOiAnYnRjZXVyJywgJ3N5bWJvbCc6ICdCVEMvRVVSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICAgICAgJ0VVUi9VU0QnOiB7ICdpZCc6ICdldXJ1c2QnLCAnc3ltYm9sJzogJ0VVUi9VU0QnLCAnYmFzZSc6ICdFVVInLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnWFJQL1VTRCc6IHsgJ2lkJzogJ3hycHVzZCcsICdzeW1ib2wnOiAnWFJQL1VTRCcsICdiYXNlJzogJ1hSUCcsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdYUlAvRVVSJzogeyAnaWQnOiAneHJwZXVyJywgJ3N5bWJvbCc6ICdYUlAvRVVSJywgJ2Jhc2UnOiAnWFJQJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICAgICAgJ1hSUC9CVEMnOiB7ICdpZCc6ICd4cnBidGMnLCAnc3ltYm9sJzogJ1hSUC9CVEMnLCAnYmFzZSc6ICdYUlAnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0T3JkZXJCb29rSWQgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAob3JkZXJib29rWyd0aW1lc3RhbXAnXSkgKiAxMDAwO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbMF0pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsxXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXJJZCAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50ICh0aWNrZXJbJ3RpbWVzdGFtcCddKSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYW5zYWN0aW9uc0lkICh7IFxuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIFxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVBvc3QnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKTtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpXG4gICAgICAgICAgICBtZXRob2QgKz0gJ01hcmtldCc7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIG1ldGhvZCArPSAnSWQnO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGxldCBhdXRoID0gbm9uY2UgKyB0aGlzLnVpZCArIHRoaXMuYXBpS2V5O1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaG1hYyAoYXV0aCwgdGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgcXVlcnkgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnc2lnbmF0dXJlJzogc2lnbmF0dXJlLnRvVXBwZXJDYXNlICgpLFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcXVlcnkpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXR0cmV4ID0ge1xuXG4gICAgJ2lkJzogJ2JpdHRyZXgnLFxuICAgICduYW1lJzogJ0JpdHRyZXgnLFxuICAgICdjb3VudHJpZXMnOiAnVVMnLFxuICAgICd2ZXJzaW9uJzogJ3YxLjEnLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MzUyLWNmMGIzYzI2LTVlZDUtMTFlNy04MmI3LWYzODI2YjdhOTdkOC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYml0dHJleC5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2JpdHRyZXguY29tJyxcbiAgICAgICAgJ2RvYyc6IFsgXG4gICAgICAgICAgICAnaHR0cHM6Ly9iaXR0cmV4LmNvbS9Ib21lL0FwaScsXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cubnBtanMub3JnL3BhY2thZ2Uvbm9kZS5iaXR0cmV4LmFwaScsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnY3VycmVuY2llcycsXG4gICAgICAgICAgICAgICAgJ21hcmtldGhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0c3VtbWFyaWVzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0c3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsICAgICAgICAgICAgXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAnYWNjb3VudCc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRhZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdGhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ29yZGVyaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtldCc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2J1eWxpbWl0JyxcbiAgICAgICAgICAgICAgICAnYnV5bWFya2V0JyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb3Blbm9yZGVycycsXG4gICAgICAgICAgICAgICAgJ3NlbGxsaW1pdCcsXG4gICAgICAgICAgICAgICAgJ3NlbGxtYXJrZXQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0TWFya2V0cyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzWydyZXN1bHQnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sncmVzdWx0J11bcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydNYXJrZXROYW1lJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ0Jhc2VDdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsnTWFya2V0Q3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjY291bnRHZXRCYWxhbmNlcyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAndHlwZSc6ICdib3RoJyxcbiAgICAgICAgICAgICdkZXB0aCc6IDUwLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IHJlc3BvbnNlWydyZXN1bHQnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSB7ICdiaWRzJzogJ2J1eScsICdhc2tzJzogJ3NlbGwnIH07XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHNpZGVzKTtcbiAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBrZXlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICBsZXQga2V5ID0ga2V5c1trXTtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNba2V5XTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlclsnUmF0ZSddKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbJ1F1YW50aXR5J10pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE1hcmtldHN1bW1hcnkgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3Jlc3VsdCddWzBdO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5wYXJzZTg2MDEgKHRpY2tlclsnVGltZVN0YW1wJ10pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydIaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnTG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnQmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnQXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydMYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnVm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE1hcmtldGhpc3RvcnkgKHsgXG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBtZXRob2QgPSAnbWFya2V0R2V0JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSkgKyB0eXBlO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3F1YW50aXR5JzogYW1vdW50LFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3JhdGUnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJztcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIHVybCArPSB0eXBlICsgJy8nICsgbWV0aG9kLnRvTG93ZXJDYXNlICgpICsgcGF0aDtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIHVybCArPSB0eXBlICsgJy8nO1xuICAgICAgICAgICAgaWYgKCgodHlwZSA9PSAnYWNjb3VudCcpICYmIChwYXRoICE9ICd3aXRoZHJhdycpKSB8fCAocGF0aCA9PSAnb3Blbm9yZGVycycpKVxuICAgICAgICAgICAgICAgIHVybCArPSBtZXRob2QudG9Mb3dlckNhc2UgKCk7XG4gICAgICAgICAgICB1cmwgKz0gcGF0aCArICc/JyArIHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdhcGlrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHsgJ2FwaXNpZ24nOiB0aGlzLmhtYWMgKHVybCwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYnRjY2hpbmEgPSB7XG5cbiAgICAnaWQnOiAnYnRjY2hpbmEnLFxuICAgICduYW1lJzogJ0JUQ0NoaW5hJyxcbiAgICAnY291bnRyaWVzJzogJ0NOJyxcbiAgICAncmF0ZUxpbWl0JzogMzAwMCxcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYzNjgtNDY1YjMyODYtNWVkNi0xMWU3LTlhMTEtMGY2NDY3ZTFkODJiLmpwZycsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAncHVibGljJzogJ2h0dHBzOi8vZGF0YS5idGNjaGluYS5jb20vZGF0YScsXG4gICAgICAgICAgICAncHJpdmF0ZSc6ICdodHRwczovL2FwaS5idGNjaGluYS5jb20vYXBpX3RyYWRlX3YxLnBocCcsXG4gICAgICAgIH0sXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuYnRjY2hpbmEuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL3d3dy5idGNjaGluYS5jb20vYXBpZG9jcydcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdoaXN0b3J5ZGF0YScsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdCdXlJY2ViZXJnT3JkZXInLFxuICAgICAgICAgICAgICAgICdCdXlPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0J1eU9yZGVyMicsXG4gICAgICAgICAgICAgICAgJ0J1eVN0b3BPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0NhbmNlbEljZWJlcmdPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnQ2FuY2VsU3RvcE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnR2V0QWNjb3VudEluZm8nLFxuICAgICAgICAgICAgICAgICdnZXRBcmNoaXZlZE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnZ2V0QXJjaGl2ZWRPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdHZXREZXBvc2l0cycsXG4gICAgICAgICAgICAgICAgJ0dldEljZWJlcmdPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0dldEljZWJlcmdPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdHZXRNYXJrZXREZXB0aCcsXG4gICAgICAgICAgICAgICAgJ0dldE1hcmtldERlcHRoMicsXG4gICAgICAgICAgICAgICAgJ0dldE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnR2V0T3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnR2V0U3RvcE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnR2V0U3RvcE9yZGVycycsXG4gICAgICAgICAgICAgICAgJ0dldFRyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICAgICAgJ0dldFdpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdHZXRXaXRoZHJhd2FscycsXG4gICAgICAgICAgICAgICAgJ1JlcXVlc3RXaXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnU2VsbEljZWJlcmdPcmRlcicsXG4gICAgICAgICAgICAgICAgJ1NlbGxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ1NlbGxPcmRlcjInLFxuICAgICAgICAgICAgICAgICdTZWxsU3RvcE9yZGVyJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoe1xuICAgICAgICAgICAgJ21hcmtldCc6ICdhbGwnLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0cyk7XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwga2V5cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IGtleSA9IGtleXNbcF07XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW2tleV07XG4gICAgICAgICAgICBsZXQgcGFydHMgPSBrZXkuc3BsaXQgKCdfJyk7XG4gICAgICAgICAgICBsZXQgaWQgPSBwYXJ0c1sxXTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gaWQuc2xpY2UgKDAsIDMpO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gaWQuc2xpY2UgKDMsIDYpO1xuICAgICAgICAgICAgYmFzZSA9IGJhc2UudG9VcHBlckNhc2UgKCk7XG4gICAgICAgICAgICBxdW90ZSA9IHF1b3RlLnRvVXBwZXJDYXNlICgpO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RHZXRBY2NvdW50SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0T3JkZXJib29rICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IG9yZGVyYm9va1snZGF0ZSddICogMTAwMDs7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnYmlkcyc6IG9yZGVyYm9va1snYmlkcyddLFxuICAgICAgICAgICAgJ2Fza3MnOiBvcmRlcmJvb2tbJ2Fza3MnXSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgIH07XG4gICAgICAgIC8vIFRPRE8gc29ydCBiaWRhc2tzXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHRpY2tlcnMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1sndGlja2VyJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ2RhdGUnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsncHJldl9jbG9zZSddKSxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVBvc3QnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKSArICdPcmRlcjInO1xuICAgICAgICBsZXQgb3JkZXIgPSB7fTtcbiAgICAgICAgbGV0IGlkID0gcFsnaWQnXS50b1VwcGVyQ2FzZSAoKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHtcbiAgICAgICAgICAgIG9yZGVyWydwYXJhbXMnXSA9IFsgdW5kZWZpbmVkLCBhbW91bnQsIGlkIF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcmRlclsncGFyYW1zJ10gPSBbIHByaWNlLCBhbW91bnQsIGlkIF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgbm9uY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5taWNyb3NlY29uZHMgKCk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddW3R5cGVdICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHAgPSBbXTtcbiAgICAgICAgICAgIGlmICgncGFyYW1zJyBpbiBwYXJhbXMpXG4gICAgICAgICAgICAgICAgcCA9IHBhcmFtc1sncGFyYW1zJ107XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAgICAgJ21ldGhvZCc6IHBhdGgsXG4gICAgICAgICAgICAgICAgJ2lkJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ3BhcmFtcyc6IHAsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcCA9IHAuam9pbiAoJywnKTtcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocmVxdWVzdCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSAoXG4gICAgICAgICAgICAgICAgJ3RvbmNlPScgKyBub25jZSArXG4gICAgICAgICAgICAgICAgJyZhY2Nlc3NrZXk9JyArIHRoaXMuYXBpS2V5ICtcbiAgICAgICAgICAgICAgICAnJnJlcXVlc3RtZXRob2Q9JyArIG1ldGhvZC50b0xvd2VyQ2FzZSAoKSArXG4gICAgICAgICAgICAgICAgJyZpZD0nICsgbm9uY2UgK1xuICAgICAgICAgICAgICAgICcmbWV0aG9kPScgKyBwYXRoICtcbiAgICAgICAgICAgICAgICAnJnBhcmFtcz0nICsgcFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGxldCBzaWduYXR1cmUgPSB0aGlzLmhtYWMgKHF1ZXJ5LCB0aGlzLnNlY3JldCwgJ3NoYTEnKTtcbiAgICAgICAgICAgIGxldCBhdXRoID0gdGhpcy5hcGlLZXkgKyAnOicgKyBzaWduYXR1cmU7IFxuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAnQXV0aG9yaXphdGlvbic6ICdCYXNpYyAnICsgdGhpcy5zdHJpbmdUb0Jhc2U2NCAocXVlcnkpLFxuICAgICAgICAgICAgICAgICdKc29uLVJwYy1Ub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJ0Y2UgPSB7XG5cbiAgICAnaWQnOiAnYnRjZScsXG4gICAgJ25hbWUnOiAnQlRDLWUnLFxuICAgICdjb3VudHJpZXMnOiBbICdCRycsICdSVScgXSwgLy8gQnVsZ2FyaWEsIFJ1c3NpYVxuICAgICd2ZXJzaW9uJzogJzMnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3ODQzMjI1LTFiNTcxNTE0LTYxMWEtMTFlNy05MjA4LTI2NDFhNTYwYjU2MS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYnRjLWUuY29tL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9idGMtZS5jb20nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vYnRjLWUuY29tL2FwaS8zL2RvY3MnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vYnRjLWUuY29tL3RhcGkvZG9jcycsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnaW5mbycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlci97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdkZXB0aC97cGFpcn0nLFxuICAgICAgICAgICAgICAgICd0cmFkZXMve3BhaXJ9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2dldEluZm8nLFxuICAgICAgICAgICAgICAgICdUcmFkZScsXG4gICAgICAgICAgICAgICAgJ0FjdGl2ZU9yZGVycycsXG4gICAgICAgICAgICAgICAgJ09yZGVySW5mbycsXG4gICAgICAgICAgICAgICAgJ0NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnVHJhZGVIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnVHJhbnNIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnQ29pbkRlcG9zaXRBZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnV2l0aGRyYXdDb2luJyxcbiAgICAgICAgICAgICAgICAnQ3JlYXRlQ291cG9uJyxcbiAgICAgICAgICAgICAgICAnUmVkZWVtQ291cG9uJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0SW5mbyAoKTtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gcmVzcG9uc2VbJ3BhaXJzJ107XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHByb2R1Y3RzKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IGtleXMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBpZCA9IGtleXNbcF07XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW2lkXTtcbiAgICAgICAgICAgIGxldCBbIGJhc2UsIHF1b3RlIF0gPSBpZC5zcGxpdCAoJ18nKTtcbiAgICAgICAgICAgIGJhc2UgPSBiYXNlLnRvVXBwZXJDYXNlICgpO1xuICAgICAgICAgICAgcXVvdGUgPSBxdW90ZS50b1VwcGVyQ2FzZSAoKTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0R2V0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldERlcHRoUGFpciAoe1xuICAgICAgICAgICAgJ3BhaXInOiBwWydpZCddLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IHJlc3BvbnNlW3BbJ2lkJ11dOyBcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBvcmRlcmJvb2tbJ2JpZHMnXSxcbiAgICAgICAgICAgICdhc2tzJzogb3JkZXJib29rWydhc2tzJ10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHRpY2tlcnMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlclBhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogcFsnaWQnXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSB0aWNrZXJzW3BbJ2lkJ11dO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd1cGRhdGVkJ10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogcGFyc2VGbG9hdCAodGlja2VyWydhdmcnXSksXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sX2N1ciddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlc1BhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdyYXRlJzogcHJpY2UsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VHJhZGUgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAnS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1NpZ24nOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYnRjeCA9IHtcblxuICAgICdpZCc6ICdidGN4JyxcbiAgICAnbmFtZSc6ICdCVENYJyxcbiAgICAnY291bnRyaWVzJzogWyAnSVMnLCAnVVMnLCAnRVUnLCBdLFxuICAgICdyYXRlTGltaXQnOiAzMDAwLCAvLyBzdXBwb3J0IGluIGVuZ2xpc2ggaXMgdmVyeSBwb29yLCB1bmFibGUgdG8gdGVsbCByYXRlIGxpbWl0c1xuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjM4NS05ZmRjYzk4Yy01ZWQ2LTExZTctOGYxNC02NmQ1ZTVjZDQ3ZTYuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2J0Yy14LmlzL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9idGMteC5pcycsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9idGMteC5pcy9jdXN0b20vYXBpLWRvY3VtZW50Lmh0bWwnLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2RlcHRoL3tpZH0ve2xpbWl0fScsXG4gICAgICAgICAgICAgICAgJ3RpY2tlci97aWR9JywgICAgICAgICBcbiAgICAgICAgICAgICAgICAndHJhZGUve2lkfS97bGltaXR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgICdoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnb3JkZXInLFxuICAgICAgICAgICAgICAgICdyZWRlZW0nLFxuICAgICAgICAgICAgICAgICd0cmFkZScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvVVNEJzogeyAnaWQnOiAnYnRjL3VzZCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdCVEMvRVVSJzogeyAnaWQnOiAnYnRjL2V1cicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0IHRoaXMucHVibGljR2V0RGVwdGhJZExpbWl0ICh7IFxuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2xpbWl0JzogMTAwMCxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IG9yZGVyWydwcmljZSddO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBvcmRlclsnYW1vdW50J107XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkgeyBcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VySWQgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3RpbWUnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlSWRMaW1pdCAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2xpbWl0JzogMTAwLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VHJhZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAndHlwZSc6IHNpZGUudG9VcHBlckNhc2UgKCksXG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLyc7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIHVybCArPSB0eXBlO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdNZXRob2QnOiBwYXRoLnRvVXBwZXJDYXNlICgpLFxuICAgICAgICAgICAgICAgICdOb25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1NpZ25hdHVyZSc6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBieGludGggPSB7XG5cbiAgICAnaWQnOiAnYnhpbnRoJyxcbiAgICAnbmFtZSc6ICdCWC5pbi50aCcsXG4gICAgJ2NvdW50cmllcyc6ICdUSCcsIC8vIFRoYWlsYW5kXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY0MTItNTY3YjFlYjQtNWVkNy0xMWU3LTk0YTgtZmY2YTM4ODRmNmM1LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9ieC5pbi50aC9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vYnguaW4udGgnLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vYnguaW4udGgvaW5mby9hcGknLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJycsIC8vIHRpY2tlclxuICAgICAgICAgICAgICAgICdvcHRpb25zJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uYm9vaycsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ3BhaXJpbmcnLFxuICAgICAgICAgICAgICAgICd0cmFkZScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlaGlzdG9yeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnYmlsbGVyJyxcbiAgICAgICAgICAgICAgICAnYmlsbGdyb3VwJyxcbiAgICAgICAgICAgICAgICAnYmlsbHBheScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXQnLFxuICAgICAgICAgICAgICAgICdnZXRvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLWlzc3VlJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLWJpZCcsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1zZWxsJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLW15aXNzdWUnLFxuICAgICAgICAgICAgICAgICdvcHRpb24tbXliaWQnLFxuICAgICAgICAgICAgICAgICdvcHRpb24tbXlvcHRpb25zJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLWV4ZXJjaXNlJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLWNhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnb3JkZXInLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbC1oaXN0b3J5JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFBhaXJpbmcgKCk7XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHByb2R1Y3RzKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IGtleXMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNba2V5c1twXV07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydwYWlyaW5nX2lkJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ3ByaW1hcnlfY3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ3NlY29uZGFyeV9jdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgb3JkZXJib29rID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdwYWlyaW5nJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSBbICdiaWRzJywgJ2Fza3MnIF07XG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgc2lkZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNbc107XG4gICAgICAgICAgICBsZXQgb3JkZXJzID0gb3JkZXJib29rW3NpZGVdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHByaWNlID0gcGFyc2VGbG9hdCAob3JkZXJbMF0pO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBwYXJzZUZsb2F0IChvcmRlclsxXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXJzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXQgKHsgJ3BhaXJpbmcnOiBwWydpZCddIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1twWydpZCddXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xvdyc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29yZGVyYm9vayddWydiaWRzJ11bJ2hpZ2hiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydvcmRlcmJvb2snXVsnYXNrcyddWydoaWdoYmlkJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0X3ByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnY2hhbmdlJ10pLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWVfMjRob3VycyddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZSAoe1xuICAgICAgICAgICAgJ3BhaXJpbmcnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RPcmRlciAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdwYWlyaW5nJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdyYXRlJzogcHJpY2UsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHBhdGggKyAnLyc7XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIGlmICh0eXBlID09ICdwcml2YXRlJykge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGxldCBzaWduYXR1cmUgPSB0aGlzLmhhc2ggKHRoaXMuYXBpS2V5ICsgbm9uY2UgKyB0aGlzLnNlY3JldCwgJ3NoYTI1NicpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnc2lnbmF0dXJlJzogc2lnbmF0dXJlLFxuICAgICAgICAgICAgICAgIC8vIHR3b2ZhOiB0aGlzLnR3b2ZhLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBjY2V4ID0ge1xuXG4gICAgJ2lkJzogJ2NjZXgnLFxuICAgICduYW1lJzogJ0MtQ0VYJyxcbiAgICAnY291bnRyaWVzJzogWyAnREUnLCAnRVUnLCBdLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NDMzLTE2ODgxZjkwLTVlZDgtMTFlNy05MmY4LTNkOTJjYzc0N2E2Yy5qcGcnLFxuICAgICAgICAnYXBpJzoge1xuICAgICAgICAgICAgJ3RpY2tlcnMnOiAnaHR0cHM6Ly9jLWNleC5jb20vdCcsXG4gICAgICAgICAgICAncHVibGljJzogJ2h0dHBzOi8vYy1jZXguY29tL3QvYXBpX3B1Yi5odG1sJyxcbiAgICAgICAgICAgICdwcml2YXRlJzogJ2h0dHBzOi8vYy1jZXguY29tL3QvYXBpLmh0bWwnLFxuICAgICAgICB9LFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vYy1jZXguY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2MtY2V4LmNvbS8/aWQ9YXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICd0aWNrZXJzJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnY29pbm5hbWVzJyxcbiAgICAgICAgICAgICAgICAne21hcmtldH0nLFxuICAgICAgICAgICAgICAgICdwYWlycycsXG4gICAgICAgICAgICAgICAgJ3ByaWNlcycsXG4gICAgICAgICAgICAgICAgJ3ZvbHVtZV97Y29pbn0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdiYWxhbmNlZGlzdHJpYnV0aW9uJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0aGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ21hcmtldHMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzdW1tYXJpZXMnLFxuICAgICAgICAgICAgICAgICdvcmRlcmJvb2snLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7ICAgICAgICAgICAgXG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdidXlsaW1pdCcsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ2dldGJhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdnZXRiYWxhbmNlcycsICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdnZXRvcGVub3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZ2V0b3JkZXInLFxuICAgICAgICAgICAgICAgICdnZXRvcmRlcmhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdteXRyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3NlbGxsaW1pdCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRNYXJrZXRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ3Jlc3VsdCddLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWydyZXN1bHQnXVtwXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ01hcmtldE5hbWUnXTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gcHJvZHVjdFsnTWFya2V0Q3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ0Jhc2VDdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEJhbGFuY2VzICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyYm9vayAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogJ2JvdGgnLFxuICAgICAgICAgICAgJ2RlcHRoJzogMTAwLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IHJlc3BvbnNlWydyZXN1bHQnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgJ2JpZHMnOiBbXSxcbiAgICAgICAgICAgICdhc2tzJzogW10sXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgc2lkZXMgPSB7ICdiaWRzJzogJ2J1eScsICdhc2tzJzogJ3NlbGwnIH07XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHNpZGVzKTtcbiAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBrZXlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICBsZXQga2V5ID0ga2V5c1trXTtcbiAgICAgICAgICAgIGxldCBzaWRlID0gc2lkZXNba2V5XTtcbiAgICAgICAgICAgIGxldCBvcmRlcnMgPSBvcmRlcmJvb2tbc2lkZV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgcHJpY2UgPSBwYXJzZUZsb2F0IChvcmRlclsnUmF0ZSddKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbJ1F1YW50aXR5J10pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnRpY2tlcnNHZXRNYXJrZXQgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCkudG9Mb3dlckNhc2UgKCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3RpY2tlciddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd1cGRhdGVkJ10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdHByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2F2ZyddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydidXlzdXBwb3J0J10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE1hcmtldGhpc3RvcnkgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAndHlwZSc6ICdib3RoJyxcbiAgICAgICAgICAgICdkZXB0aCc6IDEwMCxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVHZXQnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKSArIHR5cGU7XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3F1YW50aXR5JzogYW1vdW50LFxuICAgICAgICAgICAgJ3JhdGUnOiBwcmljZSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddW3R5cGVdO1xuICAgICAgICBpZiAodHlwZSA9PSAncHJpdmF0ZScpIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmtleXNvcnQgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ2EnOiBwYXRoLFxuICAgICAgICAgICAgICAgICdhcGlrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnYXBpc2lnbic6IHRoaXMuaG1hYyAodXJsLCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpIH07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdhJzogJ2dldCcgKyBwYXRoLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpICsgJy5qc29uJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGNleCA9IHtcblxuICAgICdpZCc6ICdjZXgnLFxuICAgICduYW1lJzogJ0NFWC5JTycsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0dCJywgJ0VVJywgJ0NZJywgJ1JVJywgXSxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjQ0Mi04ZGRjMzNiMC01ZWQ4LTExZTctOGI5OC1mNzg2YWVmMGYzYzkuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2NleC5pby9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vY2V4LmlvJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2NleC5pby9jZXgtYXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdjdXJyZW5jeV9saW1pdHMnLFxuICAgICAgICAgICAgICAgICdsYXN0X3ByaWNlL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2xhc3RfcHJpY2VzL3tjdXJyZW5jaWVzfScsXG4gICAgICAgICAgICAgICAgJ29obGN2L2hkL3t5eXl5bW1kZH0ve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfYm9vay97cGFpcn0nLFxuICAgICAgICAgICAgICAgICd0aWNrZXIve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAndGlja2Vycy97Y3VycmVuY2llc30nLFxuICAgICAgICAgICAgICAgICd0cmFkZV9oaXN0b3J5L3twYWlyfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2NvbnZlcnQve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAncHJpY2Vfc3RhdHMve3BhaXJ9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2FjdGl2ZV9vcmRlcnNfc3RhdHVzLycsXG4gICAgICAgICAgICAgICAgJ2FyY2hpdmVkX29yZGVycy97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlLycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlci8nLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXJzL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9yZXBsYWNlX29yZGVyL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2Nsb3NlX3Bvc2l0aW9uL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2dldF9hZGRyZXNzLycsXG4gICAgICAgICAgICAgICAgJ2dldF9teWZlZS8nLFxuICAgICAgICAgICAgICAgICdnZXRfb3JkZXIvJyxcbiAgICAgICAgICAgICAgICAnZ2V0X29yZGVyX3R4LycsXG4gICAgICAgICAgICAgICAgJ29wZW5fb3JkZXJzL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ29wZW5fb3JkZXJzLycsXG4gICAgICAgICAgICAgICAgJ29wZW5fcG9zaXRpb24ve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnb3Blbl9wb3NpdGlvbnMve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAncGxhY2Vfb3JkZXIve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAncGxhY2Vfb3JkZXIve3BhaXJ9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0Q3VycmVuY3lMaW1pdHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0c1snZGF0YSddWydwYWlycyddLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWydkYXRhJ11bJ3BhaXJzJ11bcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydzeW1ib2wxJ10gKyAnLycgKyBwcm9kdWN0WydzeW1ib2wyJ107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gaWQ7XG4gICAgICAgICAgICBsZXQgWyBiYXNlLCBxdW90ZSBdID0gc3ltYm9sLnNwbGl0ICgnLycpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBvcmRlcmJvb2sgPSBhd2FpdCAgdGhpcy5wdWJsaWNHZXRPcmRlckJvb2tQYWlyICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBvcmRlcmJvb2tbJ3RpbWVzdGFtcCddICogMTAwMDtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogb3JkZXJib29rWydiaWRzJ10sXG4gICAgICAgICAgICAnYXNrcyc6IG9yZGVyYm9va1snYXNrcyddLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyUGFpciAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKHRpY2tlclsndGltZXN0YW1wJ10pICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2NoYW5nZSddKSxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlSGlzdG9yeVBhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCwgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9yZGVyWydvcmRlcl90eXBlJ10gPSB0eXBlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFBsYWNlT3JkZXJQYWlyICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykgeyAgIFxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ3NpZ25hdHVyZSc6IHRoaXMuaG1hYyAobm9uY2UgKyB0aGlzLnVpZCArIHRoaXMuYXBpS2V5LCB0aGlzLnNlY3JldCkudG9VcHBlckNhc2UgKCksXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBxdWVyeSkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgY29pbmNoZWNrID0ge1xuXG4gICAgJ2lkJzogJ2NvaW5jaGVjaycsXG4gICAgJ25hbWUnOiAnY29pbmNoZWNrJyxcbiAgICAnY291bnRyaWVzJzogWyAnSlAnLCAnSUQnLCBdLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NDY0LTNiNWMzYzc0LTVlZDktMTFlNy04NDBlLTMxYjMyOTY4ZTFkYS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vY29pbmNoZWNrLmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vY29pbmNoZWNrLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9jb2luY2hlY2suY29tL2RvY3VtZW50cy9leGNoYW5nZS9hcGknLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL29yZGVycy9yYXRlJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfYm9va3MnLFxuICAgICAgICAgICAgICAgICdyYXRlL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMvYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL2xldmVyYWdlX2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdiYW5rX2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdF9tb25leScsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL29yZGVycy9vcGVucycsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL29yZGVycy90cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9vcmRlcnMvdHJhbnNhY3Rpb25zX3BhZ2luYXRpb24nLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9sZXZlcmFnZS9wb3NpdGlvbnMnLFxuICAgICAgICAgICAgICAgICdsZW5kaW5nL2JvcnJvd3MvbWF0Y2hlcycsXG4gICAgICAgICAgICAgICAgJ3NlbmRfbW9uZXknLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd3MnLFxuICAgICAgICAgICAgXSwgICAgICAgICAgICBcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYW5rX2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdF9tb25leS97aWR9L2Zhc3QnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS90cmFuc2ZlcnMvdG9fbGV2ZXJhZ2UnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS90cmFuc2ZlcnMvZnJvbV9sZXZlcmFnZScsXG4gICAgICAgICAgICAgICAgJ2xlbmRpbmcvYm9ycm93cycsXG4gICAgICAgICAgICAgICAgJ2xlbmRpbmcvYm9ycm93cy97aWR9L3JlcGF5JyxcbiAgICAgICAgICAgICAgICAnc2VuZF9tb25leScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3cycsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlbGV0ZSc6IFtcbiAgICAgICAgICAgICAgICAnYmFua19hY2NvdW50cy97aWR9JyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2Uvb3JkZXJzL3tpZH0nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd3Mve2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL0pQWSc6ICB7ICdpZCc6ICdidGNfanB5JywgICdzeW1ib2wnOiAnQlRDL0pQWScsICAnYmFzZSc6ICdCVEMnLCAgJ3F1b3RlJzogJ0pQWScgfSwgLy8gdGhlIG9ubHkgcmVhbCBwYWlyXG4gICAgICAgICdFVEgvSlBZJzogIHsgJ2lkJzogJ2V0aF9qcHknLCAgJ3N5bWJvbCc6ICdFVEgvSlBZJywgICdiYXNlJzogJ0VUSCcsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnRVRDL0pQWSc6ICB7ICdpZCc6ICdldGNfanB5JywgICdzeW1ib2wnOiAnRVRDL0pQWScsICAnYmFzZSc6ICdFVEMnLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ0RBTy9KUFknOiAgeyAnaWQnOiAnZGFvX2pweScsICAnc3ltYm9sJzogJ0RBTy9KUFknLCAgJ2Jhc2UnOiAnREFPJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdMU0svSlBZJzogIHsgJ2lkJzogJ2xza19qcHknLCAgJ3N5bWJvbCc6ICdMU0svSlBZJywgICdiYXNlJzogJ0xTSycsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnRkNUL0pQWSc6ICB7ICdpZCc6ICdmY3RfanB5JywgICdzeW1ib2wnOiAnRkNUL0pQWScsICAnYmFzZSc6ICdGQ1QnLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ1hNUi9KUFknOiAgeyAnaWQnOiAneG1yX2pweScsICAnc3ltYm9sJzogJ1hNUi9KUFknLCAgJ2Jhc2UnOiAnWE1SJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdSRVAvSlBZJzogIHsgJ2lkJzogJ3JlcF9qcHknLCAgJ3N5bWJvbCc6ICdSRVAvSlBZJywgICdiYXNlJzogJ1JFUCcsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnWFJQL0pQWSc6ICB7ICdpZCc6ICd4cnBfanB5JywgICdzeW1ib2wnOiAnWFJQL0pQWScsICAnYmFzZSc6ICdYUlAnLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ1pFQy9KUFknOiAgeyAnaWQnOiAnemVjX2pweScsICAnc3ltYm9sJzogJ1pFQy9KUFknLCAgJ2Jhc2UnOiAnWkVDJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdYRU0vSlBZJzogIHsgJ2lkJzogJ3hlbV9qcHknLCAgJ3N5bWJvbCc6ICdYRU0vSlBZJywgICdiYXNlJzogJ1hFTScsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnTFRDL0pQWSc6ICB7ICdpZCc6ICdsdGNfanB5JywgICdzeW1ib2wnOiAnTFRDL0pQWScsICAnYmFzZSc6ICdMVEMnLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ0RBU0gvSlBZJzogeyAnaWQnOiAnZGFzaF9qcHknLCAnc3ltYm9sJzogJ0RBU0gvSlBZJywgJ2Jhc2UnOiAnREFTSCcsICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdFVEgvQlRDJzogIHsgJ2lkJzogJ2V0aF9idGMnLCAgJ3N5bWJvbCc6ICdFVEgvQlRDJywgICdiYXNlJzogJ0VUSCcsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnRVRDL0JUQyc6ICB7ICdpZCc6ICdldGNfYnRjJywgICdzeW1ib2wnOiAnRVRDL0JUQycsICAnYmFzZSc6ICdFVEMnLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0xTSy9CVEMnOiAgeyAnaWQnOiAnbHNrX2J0YycsICAnc3ltYm9sJzogJ0xTSy9CVEMnLCAgJ2Jhc2UnOiAnTFNLJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdGQ1QvQlRDJzogIHsgJ2lkJzogJ2ZjdF9idGMnLCAgJ3N5bWJvbCc6ICdGQ1QvQlRDJywgICdiYXNlJzogJ0ZDVCcsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnWE1SL0JUQyc6ICB7ICdpZCc6ICd4bXJfYnRjJywgICdzeW1ib2wnOiAnWE1SL0JUQycsICAnYmFzZSc6ICdYTVInLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ1JFUC9CVEMnOiAgeyAnaWQnOiAncmVwX2J0YycsICAnc3ltYm9sJzogJ1JFUC9CVEMnLCAgJ2Jhc2UnOiAnUkVQJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdYUlAvQlRDJzogIHsgJ2lkJzogJ3hycF9idGMnLCAgJ3N5bWJvbCc6ICdYUlAvQlRDJywgICdiYXNlJzogJ1hSUCcsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnWkVDL0JUQyc6ICB7ICdpZCc6ICd6ZWNfYnRjJywgICdzeW1ib2wnOiAnWkVDL0JUQycsICAnYmFzZSc6ICdaRUMnLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ1hFTS9CVEMnOiAgeyAnaWQnOiAneGVtX2J0YycsICAnc3ltYm9sJzogJ1hFTS9CVEMnLCAgJ2Jhc2UnOiAnWEVNJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMVEMvQlRDJzogIHsgJ2lkJzogJ2x0Y19idGMnLCAgJ3N5bWJvbCc6ICdMVEMvQlRDJywgICdiYXNlJzogJ0xUQycsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnREFTSC9CVEMnOiB7ICdpZCc6ICdkYXNoX2J0YycsICdzeW1ib2wnOiAnREFTSC9CVEMnLCAnYmFzZSc6ICdEQVNIJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEFjY291bnRzQmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IGF3YWl0ICB0aGlzLnB1YmxpY0dldE9yZGVyQm9va3MgKCk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IHBhcnNlRmxvYXQgKG9yZGVyWzBdKTtcbiAgICAgICAgICAgICAgICBsZXQgYW1vdW50ID0gcGFyc2VGbG9hdCAob3JkZXJbMV0pO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtzaWRlXS5wdXNoIChbIHByaWNlLCBhbW91bnQgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICgpO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd0aW1lc3RhbXAnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICgpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IHByZWZpeCA9ICcnO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHtcbiAgICAgICAgICAgIGxldCBvcmRlcl90eXBlID0gdHlwZSArICdfJyArIHNpZGU7XG4gICAgICAgICAgICBvcmRlclsnb3JkZXJfdHlwZSddID0gb3JkZXJfdHlwZTtcbiAgICAgICAgICAgIGxldCBwcmVmaXggPSAoc2lkZSA9PSBidXkpID8gKG9yZGVyX3R5cGUgKyAnXycpIDogJyc7XG4gICAgICAgICAgICBvcmRlcltwcmVmaXggKyAnYW1vdW50J10gPSBhbW91bnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcmRlclsnb3JkZXJfdHlwZSddID0gc2lkZTtcbiAgICAgICAgICAgIG9yZGVyWydyYXRlJ10gPSBwcmljZTtcbiAgICAgICAgICAgIG9yZGVyWydhbW91bnQnXSA9IGFtb3VudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEV4Y2hhbmdlT3JkZXJzICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMua2V5c29ydCAocXVlcnkpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdBQ0NFU1MtS0VZJzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ0FDQ0VTUy1OT05DRSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdBQ0NFU1MtU0lHTkFUVVJFJzogdGhpcy5obWFjIChub25jZSArIHVybCArIChib2R5IHx8ICcnKSwgdGhpcy5zZWNyZXQpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgY29pbm1hdGUgPSB7XG4gICAgXG4gICAgJ2lkJzogJ2NvaW5tYXRlJyxcbiAgICAnbmFtZSc6ICdDb2luTWF0ZScsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0dCJywgJ0NaJyBdLCAvLyBVSywgQ3plY2ggUmVwdWJsaWNcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzgxMTIyOS1jMWVmYjUxMC02MDZjLTExZTctOWEzNi04NGJhMmNlNDEyZDguanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2NvaW5tYXRlLmlvL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9jb2lubWF0ZS5pbycsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9jb2lubWF0ZS5pby9kZXZlbG9wZXJzJyxcbiAgICAgICAgICAgICdodHRwOi8vZG9jcy5jb2lubWF0ZS5hcGlhcnkuaW8vI3JlZmVyZW5jZScsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXJCb29rJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAnYml0Y29pbldpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdiaXRjb2luRGVwb3NpdEFkZHJlc3NlcycsXG4gICAgICAgICAgICAgICAgJ2J1eUluc3RhbnQnLFxuICAgICAgICAgICAgICAgICdidXlMaW1pdCcsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsT3JkZXJXaXRoSW5mbycsXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZVZvdWNoZXInLFxuICAgICAgICAgICAgICAgICdvcGVuT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAncmVkZWVtVm91Y2hlcicsXG4gICAgICAgICAgICAgICAgJ3NlbGxJbnN0YW50JyxcbiAgICAgICAgICAgICAgICAnc2VsbExpbWl0JyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25IaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAndW5jb25maXJtZWRCaXRjb2luRGVwb3NpdHMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdCVENfRVVSJywgJ3N5bWJvbCc6ICdCVEMvRVVSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0VVUicgIH0sXG4gICAgICAgICdCVEMvQ1pLJzogeyAnaWQnOiAnQlRDX0NaSycsICdzeW1ib2wnOiAnQlRDL0NaSycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDWksnICB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2VzICgpO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRPcmRlckJvb2sgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeVBhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnZ3JvdXBCeVByaWNlTGltaXQnOiAnRmFsc2UnLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IG9yZGVyYm9vayA9IHJlc3BvbnNlWydkYXRhJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBvcmRlcmJvb2tbJ3RpbWVzdGFtcCddICogMTAwMDtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICdiaWRzJzogW10sXG4gICAgICAgICAgICAnYXNrcyc6IFtdLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNpZGVzID0gWyAnYmlkcycsICdhc2tzJyBdO1xuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHNpZGVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICBsZXQgc2lkZSA9IHNpZGVzW3NdO1xuICAgICAgICAgICAgbGV0IG9yZGVycyA9IG9yZGVyYm9va1tzaWRlXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gb3JkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBwcmljZSA9IG9yZGVyWydwcmljZSddO1xuICAgICAgICAgICAgICAgIGxldCBhbW91bnQgPSBvcmRlclsnYW1vdW50J107XG4gICAgICAgICAgICAgICAgcmVzdWx0W3NpZGVdLnB1c2ggKFsgcHJpY2UsIGFtb3VudCBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeVBhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ2RhdGEnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndGltZXN0YW1wJ10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYW1vdW50J10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYW5zYWN0aW9ucyAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5UGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdtaW51dGVzSW50b0hpc3RvcnknOiAxMCxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSk7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdjdXJyZW5jeVBhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKSB7XG4gICAgICAgICAgICBpZiAoc2lkZSA9PSAnYnV5JylcbiAgICAgICAgICAgICAgICBvcmRlclsndG90YWwnXSA9IGFtb3VudDsgLy8gYW1vdW50IGluIGZpYXRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvcmRlclsnYW1vdW50J10gPSBhbW91bnQ7IC8vIGFtb3VudCBpbiBmaWF0XG4gICAgICAgICAgICBtZXRob2QgKz0gJ0luc3RhbnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3JkZXJbJ2Ftb3VudCddID0gYW1vdW50OyAvLyBhbW91bnQgaW4gY3J5cHRvXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICAgICAgbWV0aG9kICs9IHRoaXMuY2FwaXRhbGl6ZSAodHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAoc2VsZi5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgbGV0IGF1dGggPSBbIG5vbmNlLCB0aGlzLnVpZCwgdGhpcy5hcGlLZXkgXS5qb2luICgnICcpO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaG1hYyAoYXV0aCwgdGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdjbGllbnRJZCc6IHRoaXMudWlkLFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdwdWJsaWNLZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnc2lnbmF0dXJlJzogc2lnbmF0dXJlLnRvVXBwZXJDYXNlICgpLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgY29pbnNlY3VyZSA9IHtcblxuICAgICdpZCc6ICdjb2luc2VjdXJlJyxcbiAgICAnbmFtZSc6ICdDb2luc2VjdXJlJyxcbiAgICAnY291bnRyaWVzJzogJ0lOJywgLy8gSW5kaWFcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY0NzItOWNiZDIwMGEtNWVkOS0xMWU3LTk1NTEtMjI2N2FkN2JhYzA4LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkuY29pbnNlY3VyZS5pbicsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9jb2luc2VjdXJlLmluJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL2FwaS5jb2luc2VjdXJlLmluJyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vY29pbnNlY3VyZS9wbHVnaW5zJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdiaXRjb2luL3NlYXJjaC9jb25maXJtYXRpb24ve3R4aWR9JyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvYXNrL2xvdycsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL2Fzay9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9iaWQvaGlnaCcsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL2JpZC9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9sYXN0VHJhZGUnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9tYXgyNEhyJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvbWluMjRIcicsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ21mYS9hdXRoeS9jYWxsJyxcbiAgICAgICAgICAgICAgICAnbWZhL2F1dGh5L3NtcycsICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ25ldGtpL3NlYXJjaC97bmV0a2lOYW1lfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvYmFuay9vdHAve251bWJlcn0nLFxuICAgICAgICAgICAgICAgICd1c2VyL2t5Yy9vdHAve251bWJlcn0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3Byb2ZpbGUvcGhvbmUvb3RwL3tudW1iZXJ9JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi9hZGRyZXNzL3tpZH0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL2RlcG9zaXQvY29uZmlybWVkL2FsbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vZGVwb3NpdC9jb25maXJtZWQve2lkfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vZGVwb3NpdC91bmNvbmZpcm1lZC9hbGwnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL2RlcG9zaXQvdW5jb25maXJtZWQve2lkfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vd2FsbGV0cycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvYmFsYW5jZS9hdmFpbGFibGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9iYWxhbmNlL3BlbmRpbmcnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9iYWxhbmNlL3RvdGFsJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvZGVwb3NpdC9jYW5jZWxsZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9kZXBvc2l0L3VudmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9kZXBvc2l0L3ZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvY2FuY2VsbGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvY29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvdW52ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L3dpdGhkcmF3L3ZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9hc2svY2FuY2VsbGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9hc2svY29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9hc2svcGVuZGluZycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmlkL2NhbmNlbGxlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmlkL2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmlkL3BlbmRpbmcnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi9hZGRyZXNzZXMnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi9iYWxhbmNlL2F2YWlsYWJsZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL2JhbGFuY2UvcGVuZGluZycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL2JhbGFuY2UvdG90YWwnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi9kZXBvc2l0L2NhbmNlbGxlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL2RlcG9zaXQvdW52ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL2RlcG9zaXQvdmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy9jYW5jZWxsZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy9jb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy91bnZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vd2l0aGRyYXcvdmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2Jhbmsvc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvY29pbi9mZWUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2ZpYXQvZmVlJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9reWNzJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9yZWZlcnJhbC9jb2luL3BhaWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL3JlZmVycmFsL2NvaW4vc3VjY2Vzc2Z1bCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvcmVmZXJyYWwvZmlhdC9wYWlkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9yZWZlcnJhbHMnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL3RyYWRlL3N1bW1hcnknLFxuICAgICAgICAgICAgICAgICd1c2VyL2xvZ2luL3Rva2VuL3t0b2tlbn0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3N1bW1hcnknLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9zdW1tYXJ5JyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0L2NvaW4vd2l0aGRyYXcvY2FuY2VsbGVkJyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0L2NvaW4vd2l0aGRyYXcvY29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0L2NvaW4vd2l0aGRyYXcvdW52ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3dhbGxldC9jb2luL3dpdGhkcmF3L3ZlcmlmaWVkJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnbG9naW4nLFxuICAgICAgICAgICAgICAgICdsb2dpbi9pbml0aWF0ZScsXG4gICAgICAgICAgICAgICAgJ2xvZ2luL3Bhc3N3b3JkL2ZvcmdvdCcsXG4gICAgICAgICAgICAgICAgJ21mYS9hdXRoeS9pbml0aWF0ZScsXG4gICAgICAgICAgICAgICAgJ21mYS9nYS9pbml0aWF0ZScsXG4gICAgICAgICAgICAgICAgJ3NpZ251cCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbmV0a2kvdXBkYXRlJyxcbiAgICAgICAgICAgICAgICAndXNlci9wcm9maWxlL2ltYWdlL3VwZGF0ZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL3dpdGhkcmF3L2luaXRpYXRlJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vd2l0aGRyYXcvbmV3VmVyaWZ5Y29kZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L3dpdGhkcmF3L2luaXRpYXRlJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvbmV3VmVyaWZ5Y29kZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcGFzc3dvcmQvY2hhbmdlJyxcbiAgICAgICAgICAgICAgICAndXNlci9wYXNzd29yZC9yZXNldCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vd2l0aGRyYXcvaW5pdGlhdGUnLFxuICAgICAgICAgICAgICAgICd3YWxsZXQvY29pbi93aXRoZHJhdy9uZXdWZXJpZnljb2RlJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncHV0JzogW1xuICAgICAgICAgICAgICAgICdzaWdudXAvdmVyaWZ5L3t0b2tlbn0nLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2t5YycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2RlcG9zaXQvbmV3JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9hc2svbmV3JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iaWQvbmV3JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9pbnN0YW50L2J1eScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvaW5zdGFudC9zZWxsJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vd2l0aGRyYXcvdmVyaWZ5JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvYWNjb3VudC9uZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC93aXRoZHJhdy92ZXJpZnknLFxuICAgICAgICAgICAgICAgICd1c2VyL21mYS9hdXRoeS9pbml0aWF0ZS9lbmFibGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL21mYS9nYS9pbml0aWF0ZS9lbmFibGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL25ldGtpL2NyZWF0ZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcHJvZmlsZS9waG9uZS9uZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL2FkZHJlc3MvbmV3JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi9uZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL3dpdGhkcmF3L3NlbmRUb0V4Y2hhbmdlJyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi93aXRoZHJhdy92ZXJpZnknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ3VzZXIvZ2NtL3tjb2RlfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbG9nb3V0JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vd2l0aGRyYXcvdW52ZXJpZmllZC9jYW5jZWwve3dpdGhkcmF3SUR9JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvZGVwb3NpdC9jYW5jZWwve2RlcG9zaXRJRH0nLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2Fzay9jYW5jZWwve29yZGVySUR9JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iaWQvY2FuY2VsL3tvcmRlcklEfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L3dpdGhkcmF3L3VudmVyaWZpZWQvY2FuY2VsL3t3aXRoZHJhd0lEfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbWZhL2F1dGh5L2Rpc2FibGUve2NvZGV9JyxcbiAgICAgICAgICAgICAgICAndXNlci9tZmEvZ2EvZGlzYWJsZS97Y29kZX0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3Byb2ZpbGUvcGhvbmUvZGVsZXRlJyxcbiAgICAgICAgICAgICAgICAndXNlci9wcm9maWxlL2ltYWdlL2RlbGV0ZS97bmV0a2lOYW1lfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vd2l0aGRyYXcvdW52ZXJpZmllZC9jYW5jZWwve3dpdGhkcmF3SUR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvSU5SJzogeyAnaWQnOiAnQlRDL0lOUicsICdzeW1ib2wnOiAnQlRDL0lOUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdJTlInIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRVc2VyRXhjaGFuZ2VCYW5rU3VtbWFyeSAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHsgXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0RXhjaGFuZ2VBc2tPcmRlcnMgKCk7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRFeGNoYW5nZVRpY2tlciAoKTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydtZXNzYWdlJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3RpbWVzdGFtcCddO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0UHJpY2UnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydjb2ludm9sdW1lJ10pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydmaWF0dm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldEV4Y2hhbmdlVHJhZGVzICgpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlUHV0VXNlckV4Y2hhbmdlJztcbiAgICAgICAgbGV0IG9yZGVyID0ge307XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKSB7ICAgICAgIFxuICAgICAgICAgICAgbWV0aG9kICs9ICdJbnN0YW50JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSk7XG4gICAgICAgICAgICBpZiAoc2lkZSA9PSAnYnV5JylcbiAgICAgICAgICAgICAgICBvcmRlclsnbWF4RmlhdCddID0gYW1vdW50O1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9yZGVyWydtYXhWb2wnXSA9IGFtb3VudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBkaXJlY3Rpb24gPSAoc2lkZSA9PSAnYnV5JykgPyAnQmlkJyA6ICdBc2snO1xuICAgICAgICAgICAgbWV0aG9kICs9IGRpcmVjdGlvbiArICdOZXcnO1xuICAgICAgICAgICAgb3JkZXJbJ3JhdGUnXSA9IHByaWNlO1xuICAgICAgICAgICAgb3JkZXJbJ3ZvbCddID0gYW1vdW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHNlbGYuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwcml2YXRlJykge1xuICAgICAgICAgICAgaGVhZGVycyA9IHsgJ0F1dGhvcml6YXRpb24nOiB0aGlzLmFwaUtleSB9O1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5IChxdWVyeSk7XG4gICAgICAgICAgICAgICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBleG1vID0ge1xuXG4gICAgJ2lkJzogJ2V4bW8nLFxuICAgICduYW1lJzogJ0VYTU8nLFxuICAgICdjb3VudHJpZXMnOiBbICdFUycsICdSVScsIF0sIC8vIFNwYWluLCBSdXNzaWFcbiAgICAncmF0ZUxpbWl0JzogMTAwMCwgLy8gb25jZSBldmVyeSAzNTAgbXMg4omIIDE4MCByZXF1ZXN0cyBwZXIgbWludXRlIOKJiCAzIHJlcXVlc3RzIHBlciBzZWNvbmRcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY0OTEtMWIwZWE5NTYtNWVkYS0xMWU3LTkyMjUtNDBkNjdiNDgxYjhkLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkuZXhtby5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vZXhtby5tZScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9leG1vLm1lL3J1L2FwaV9kb2MnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9leG1vLWRldi9leG1vX2FwaV9saWIvdHJlZS9tYXN0ZXIvbm9kZWpzJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdjdXJyZW5jeScsXG4gICAgICAgICAgICAgICAgJ29yZGVyX2Jvb2snLFxuICAgICAgICAgICAgICAgICdwYWlyX3NldHRpbmdzJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ3VzZXJfaW5mbycsXG4gICAgICAgICAgICAgICAgJ29yZGVyX2NyZWF0ZScsXG4gICAgICAgICAgICAgICAgJ29yZGVyX2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXJfb3Blbl9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICd1c2VyX3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3VzZXJfY2FuY2VsbGVkX29yZGVycycsXG4gICAgICAgICAgICAgICAgJ29yZGVyX3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3JlcXVpcmVkX2Ftb3VudCcsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRfYWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2NyeXB0JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdfZ2V0X3R4aWQnLFxuICAgICAgICAgICAgICAgICdleGNvZGVfY3JlYXRlJyxcbiAgICAgICAgICAgICAgICAnZXhjb2RlX2xvYWQnLFxuICAgICAgICAgICAgICAgICd3YWxsZXRfaGlzdG9yeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQYWlyU2V0dGluZ3MgKCk7XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHByb2R1Y3RzKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IGtleXMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBpZCA9IGtleXNbcF07XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW2lkXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBpZC5yZXBsYWNlICgnXycsICcvJyk7XG4gICAgICAgICAgICBsZXQgWyBiYXNlLCBxdW90ZSBdID0gc3ltYm9sLnNwbGl0ICgnLycpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFVzZXJJbmZvICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyQm9vayAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICgpO1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVtwWydpZCddXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndXBkYXRlZCddICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eV9wcmljZSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGxfcHJpY2UnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RfdHJhZGUnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXZnJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sX2N1cnInXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgcHJlZml4ID0gJyc7XG4gICAgICAgIGlmICh0eXBlID09J21hcmtldCcpXG4gICAgICAgICAgICBwcmVmaXggPSAnbWFya2V0Xyc7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3F1YW50aXR5JzogYW1vdW50LFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UgfHwgMCxcbiAgICAgICAgICAgICd0eXBlJzogcHJlZml4ICsgc2lkZSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RPcmRlckNyZWF0ZSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoeyAnbm9uY2UnOiBub25jZSB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdLZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnU2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBmeWIgPSB7XG5cbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndGlja2VyZGV0YWlsZWQnLFxuICAgICAgICAgICAgICAgICdvcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAndGVzdCcsXG4gICAgICAgICAgICAgICAgJ2dldGFjY2luZm8nLFxuICAgICAgICAgICAgICAgICdnZXRwZW5kaW5nb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZ2V0b3JkZXJoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnY2FuY2VscGVuZGluZ29yZGVyJyxcbiAgICAgICAgICAgICAgICAncGxhY2VvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0R2V0YWNjaW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRPcmRlcmJvb2sgKCk7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyZGV0YWlsZWQgKCk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsb3cnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICgpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RQbGFjZW9yZGVyICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ3F0eSc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlWzBdLnRvVXBwZXJDYXNlICgpXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHBhdGg7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7ICAgICAgICAgICBcbiAgICAgICAgICAgIHVybCArPSAnLmpzb24nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHsgJ3RpbWVzdGFtcCc6IG5vbmNlIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdzaWcnOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhMScpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgZnlic2UgPSBleHRlbmQgKGZ5Yiwge1xuICAgICdpZCc6ICdmeWJzZScsXG4gICAgJ25hbWUnOiAnRllCLVNFJyxcbiAgICAnY291bnRyaWVzJzogJ1NFJywgLy8gU3dlZGVuXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY1MTItMzEwMTk3NzItNWVkYi0xMWU3LTgyNDEtMmU2NzVlNjc5N2YxLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly93d3cuZnlic2Uuc2UvYXBpL1NFSycsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuZnlic2Uuc2UnLFxuICAgICAgICAnZG9jJzogJ2h0dHA6Ly9kb2NzLmZ5Yi5hcGlhcnkuaW8nLFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1NFSyc6IHsgJ2lkJzogJ1NFSycsICdzeW1ib2wnOiAnQlRDL1NFSycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdTRUsnIH0sXG4gICAgfSxcbn0pXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGZ5YnNnID0gZXh0ZW5kIChmeWIsIHtcbiAgICAnaWQnOiAnZnlic2cnLFxuICAgICduYW1lJzogJ0ZZQi1TRycsXG4gICAgJ2NvdW50cmllcyc6ICdTRycsIC8vIFNpbmdhcG9yZVxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NTEzLTMzNjRkNTZhLTVlZGItMTFlNy05ZTZiLWQ1ODk4YmI4OWM4MS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vd3d3LmZ5YnNnLmNvbS9hcGkvU0dEJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5meWJzZy5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHA6Ly9kb2NzLmZ5Yi5hcGlhcnkuaW8nLFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1NHRCc6IHsgJ2lkJzogJ1NHRCcsICdzeW1ib2wnOiAnQlRDL1NHRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdTR0QnIH0sXG4gICAgfSxcbn0pXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGdkYXggPSB7XG4gICAgJ2lkJzogJ2dkYXgnLFxuICAgICduYW1lJzogJ0dEQVgnLFxuICAgICdjb3VudHJpZXMnOiAnVVMnLFxuICAgICdyYXRlTGltaXQnOiAxMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NTI3LWIxYmU0MWM2LTVlZGItMTFlNy05NWY2LTViNDk2YzQ2OWUyYy5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLmdkYXguY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5nZGF4LmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9kb2NzLmdkYXguY29tJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdjdXJyZW5jaWVzJyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdHMnLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cy97aWR9L2Jvb2snLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cy97aWR9L2NhbmRsZXMnLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cy97aWR9L3N0YXRzJyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdHMve2lkfS90aWNrZXInLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cy97aWR9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3RpbWUnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdhY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL3tpZH0nLFxuICAgICAgICAgICAgICAgICdhY2NvdW50cy97aWR9L2hvbGRzJyxcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMve2lkfS9sZWRnZXInLFxuICAgICAgICAgICAgICAgICdjb2luYmFzZS1hY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2ZpbGxzJyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ29yZGVycy97aWR9JyxcbiAgICAgICAgICAgICAgICAncGF5bWVudC1tZXRob2RzJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24nLFxuICAgICAgICAgICAgICAgICdyZXBvcnRzL3tpZH0nLFxuICAgICAgICAgICAgICAgICd1c2Vycy9zZWxmL3RyYWlsaW5nLXZvbHVtZScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRzL2NvaW5iYXNlLWFjY291bnQnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0cy9wYXltZW50LW1ldGhvZCcsXG4gICAgICAgICAgICAgICAgJ2Z1bmRpbmcvcmVwYXknLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9jbG9zZScsXG4gICAgICAgICAgICAgICAgJ3Byb2ZpbGVzL21hcmdpbi10cmFuc2ZlcicsXG4gICAgICAgICAgICAgICAgJ3JlcG9ydHMnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy9jb2luYmFzZScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzL2NyeXB0bycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzL3BheW1lbnQtbWV0aG9kJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMve2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQcm9kdWN0cyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnaWQnXTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gcHJvZHVjdFsnYmFzZV9jdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsncXVvdGVfY3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7ICAgICAgICAgICAgXG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRBY2NvdW50cyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQcm9kdWN0c0lkQm9vayAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFByb2R1Y3RzSWRUaWNrZXIgKHtcbiAgICAgICAgICAgICdpZCc6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgcXVvdGUgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFByb2R1Y3RzSWRTdGF0cyAoe1xuICAgICAgICAgICAgJ2lkJzogcFsnaWQnXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLnBhcnNlODYwMSAodGlja2VyWyd0aW1lJ10pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAocXVvdGVbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAocXVvdGVbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0IChxdW90ZVsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAocXVvdGVbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0UHJvZHVjdHNJZFRyYWRlcyAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLCAvLyBmaXhlcyBpc3N1ZSAjMlxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdjbGllbnRfb2lkJzogdGhpcy5ub25jZSAoKSxcbiAgICAgICAgICAgICdwcm9kdWN0X2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3NpemUnOiBhbW91bnQsXG4gICAgICAgICAgICAndHlwZSc6IHR5cGUsICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgcmVxdWVzdCA9ICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyByZXF1ZXN0O1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgbGV0IHdoYXQgPSBub25jZSArIG1ldGhvZCArIHJlcXVlc3QgKyAoYm9keSB8fCAnJyk7XG4gICAgICAgICAgICBsZXQgc2VjcmV0ID0gdGhpcy5iYXNlNjRUb0JpbmFyeSAodGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaGFzaCAod2hhdCwgc2VjcmV0LCAnc2hhMjU2JywgJ2JpbmFyeScpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ0ItQUNDRVNTLUtFWSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdDQi1BQ0NFU1MtU0lHTic6IHRoaXMuc3RyaW5nVG9CYXNlNjQgKHNpZ25hdHVyZSksXG4gICAgICAgICAgICAgICAgJ0NCLUFDQ0VTUy1USU1FU1RBTVAnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnQ0ItQUNDRVNTLVBBU1NQSFJBU0UnOiB0aGlzLnBhc3N3b3JkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRCRCBSRVFVSVJFUyAyRkEgVklBIEFVVEhZLCBBIEJBTksgQUNDT1VOVCwgSURFTlRJVFkgVkVSSUZJQ0FUSU9OIFRPIFNUQVJUXG5cbnZhciBnZW1pbmkgPSB7XG4gICAgJ2lkJzogJ2dlbWluaScsXG4gICAgJ25hbWUnOiAnR2VtaW5pJyxcbiAgICAnY291bnRyaWVzJzogJ1VTJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCwgLy8gMjAwIGZvciBwcml2YXRlIEFQSVxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzgxNjg1Ny1jZTdiZTY0NC02MDk2LTExZTctODJkNi0zYzI1NzI2MzIyOWMuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5nZW1pbmkuY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2dlbWluaS5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vZG9jcy5nZW1pbmkuY29tL3Jlc3QtYXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdzeW1ib2xzJyxcbiAgICAgICAgICAgICAgICAncHVidGlja2VyL3tzeW1ib2x9JyxcbiAgICAgICAgICAgICAgICAnYm9vay97c3ltYm9sfScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97c3ltYm9sfScsXG4gICAgICAgICAgICAgICAgJ2F1Y3Rpb24ve3N5bWJvbH0nLFxuICAgICAgICAgICAgICAgICdhdWN0aW9uL3tzeW1ib2x9L2hpc3RvcnknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXIvbmV3JyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY2FuY2VsL3Nlc3Npb24nLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwvYWxsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvc3RhdHVzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnbXl0cmFkZXMnLFxuICAgICAgICAgICAgICAgICd0cmFkZXZvbHVtZScsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdC97Y3VycmVuY3l9L25ld0FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdy97Y3VycmVuY3l9JyxcbiAgICAgICAgICAgICAgICAnaGVhcnRiZWF0JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFN5bWJvbHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1twXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3Q7XG4gICAgICAgICAgICBsZXQgdXBwZXJjYXNlUHJvZHVjdCA9IHByb2R1Y3QudG9VcHBlckNhc2UgKCk7XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHVwcGVyY2FzZVByb2R1Y3Quc2xpY2UgKDAsIDMpO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gdXBwZXJjYXNlUHJvZHVjdC5zbGljZSAoMywgNik7XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0Qm9va1N5bWJvbCAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQdWJ0aWNrZXJTeW1ib2wgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiBwWydpZCddLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndm9sdW1lJ11bJ3RpbWVzdGFtcCddO1xuICAgICAgICBsZXQgYmFzZVZvbHVtZSA9IHBbJ2Jhc2UnXTtcbiAgICAgICAgbGV0IHF1b3RlVm9sdW1lID0gcFsncXVvdGUnXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsb3cnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXVtiYXNlVm9sdW1lXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddW3F1b3RlVm9sdW1lXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzU3ltYm9sICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlcyAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICh0aGlzLmlkICsgJyBhbGxvd3MgbGltaXQgb3JkZXJzIG9ubHknKTtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2NsaWVudF9vcmRlcl9pZCc6IHRoaXMubm9uY2UgKCksXG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudC50b1N0cmluZyAoKSxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLnRvU3RyaW5nICgpLFxuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3R5cGUnOiAnZXhjaGFuZ2UgbGltaXQnLCAvLyBnZW1pbmkgYWxsb3dzIGxpbWl0IG9yZGVycyBvbmx5XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXJOZXcgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBsZXQgcmVxdWVzdCA9IHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ3JlcXVlc3QnOiB1cmwsXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBxdWVyeSk7XG4gICAgICAgICAgICBsZXQgcGF5bG9hZCA9IHRoaXMuc3RyaW5nVG9CYXNlNjQgKEpTT04uc3RyaW5naWZ5IChyZXF1ZXN0KSk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5obWFjIChwYXlsb2FkLCB0aGlzLnNlY3JldCwgJ3NoYTM4NCcpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ3RleHQvcGxhaW4nLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IDAsXG4gICAgICAgICAgICAgICAgJ1gtR0VNSU5JLUFQSUtFWSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdYLUdFTUlOSS1QQVlMT0FEJzogcGF5bG9hZCxcbiAgICAgICAgICAgICAgICAnWC1HRU1JTkktU0lHTkFUVVJFJzogc2lnbmF0dXJlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgdXJsO1xuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGhpdGJ0YyA9IHtcblxuICAgICdpZCc6ICdoaXRidGMnLFxuICAgICduYW1lJzogJ0hpdEJUQycsXG4gICAgJ2NvdW50cmllcyc6ICdISycsIC8vIEhvbmcgS29uZ1xuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd2ZXJzaW9uJzogJzEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NTU1LThlYWVjMjBlLTVlZGMtMTFlNy05YzViLTZkYzY5ZmM0MmY1ZS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHA6Ly9hcGkuaGl0YnRjLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9oaXRidGMuY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL2hpdGJ0Yy5jb20vYXBpJyxcbiAgICAgICAgICAgICdodHRwOi8vaGl0YnRjLWNvbS5naXRodWIuaW8vaGl0YnRjLWFwaScsXG4gICAgICAgICAgICAnaHR0cDovL2pzZmlkZGxlLm5ldC9ibWtuaWdodC9ScWJZQicsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAne3N5bWJvbH0vb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAne3N5bWJvbH0vdGlja2VyJyxcbiAgICAgICAgICAgICAgICAne3N5bWJvbH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAne3N5bWJvbH0vdHJhZGVzL3JlY2VudCcsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbHMnLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLFxuICAgICAgICAgICAgICAgICd0aW1lLCdcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICd0cmFkaW5nJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ29yZGVycy9hY3RpdmUnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvcmVjZW50JyxcbiAgICAgICAgICAgICAgICAnb3JkZXInLFxuICAgICAgICAgICAgICAgICd0cmFkZXMvYnkvb3JkZXInLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICduZXdfb3JkZXInLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXInLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXJzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwYXltZW50Jzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2FkZHJlc3Mve2N1cnJlbmN5fScsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucy97dHJhbnNhY3Rpb259JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAndHJhbnNmZXJfdG9fdHJhZGluZycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyX3RvX21haW4nLFxuICAgICAgICAgICAgICAgICdhZGRyZXNzL3tjdXJyZW5jeX0nLFxuICAgICAgICAgICAgICAgICdwYXlvdXQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRTeW1ib2xzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ3N5bWJvbHMnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1snc3ltYm9scyddW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnc3ltYm9sJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ2NvbW1vZGl0eSddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsnY3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYWRpbmdHZXRCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFN5bWJvbE9yZGVyYm9vayAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0U3ltYm9sVGlja2VyICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndGltZXN0YW1wJ107XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZV9xdW90ZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRTeW1ib2xUcmFkZXMgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2NsaWVudE9yZGVySWQnOiB0aGlzLm5vbmNlICgpLFxuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICdxdWFudGl0eSc6IGFtb3VudCxcbiAgICAgICAgICAgICd0eXBlJzogdHlwZSwgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYWRpbmdQb3N0TmV3T3JkZXIgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSAnL2FwaS8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdHlwZSArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgJ25vbmNlJzogbm9uY2UsICdhcGlrZXknOiB0aGlzLmFwaUtleSB9LCBxdWVyeSk7XG4gICAgICAgICAgICBpZiAobWV0aG9kID09ICdQT1NUJylcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ1gtU2lnbmF0dXJlJzogdGhpcy5obWFjICh1cmwgKyAoYm9keSB8fCAnJyksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJykudG9Mb3dlckNhc2UgKCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyB1cmw7XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgaHVvYmkgPSB7XG5cbiAgICAnaWQnOiAnaHVvYmknLFxuICAgICduYW1lJzogJ0h1b2JpJyxcbiAgICAnY291bnRyaWVzJzogJ0NOJyxcbiAgICAncmF0ZUxpbWl0JzogNTAwMCxcbiAgICAndmVyc2lvbic6ICd2MycsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY1NjktMTVhYTdiOWEtNWVkZC0xMWU3LTllN2YtNDQ3OTFmNGVlNDljLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cDovL2FwaS5odW9iaS5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3Lmh1b2JpLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9naXRodWIuY29tL2h1b2JpYXBpL0FQSV9Eb2NzX2VuL3dpa2knLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3N0YXRpY21hcmtldCc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3tpZH1fa2xpbmVfe3BlcmlvZH0nLFxuICAgICAgICAgICAgICAgICd0aWNrZXJfe2lkfScsXG4gICAgICAgICAgICAgICAgJ2RlcHRoX3tpZH0nLFxuICAgICAgICAgICAgICAgICdkZXB0aF97aWR9X3tsZW5ndGh9JyxcbiAgICAgICAgICAgICAgICAnZGV0YWlsX3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3VzZG1hcmtldCc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3tpZH1fa2xpbmVfe3BlcmlvZH0nLFxuICAgICAgICAgICAgICAgICd0aWNrZXJfe2lkfScsXG4gICAgICAgICAgICAgICAgJ2RlcHRoX3tpZH0nLFxuICAgICAgICAgICAgICAgICdkZXB0aF97aWR9X3tsZW5ndGh9JyxcbiAgICAgICAgICAgICAgICAnZGV0YWlsX3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3RyYWRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2dldF9hY2NvdW50X2luZm8nLFxuICAgICAgICAgICAgICAgICdnZXRfb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2J1eScsXG4gICAgICAgICAgICAgICAgJ3NlbGwnLFxuICAgICAgICAgICAgICAgICdidXlfbWFya2V0JyxcbiAgICAgICAgICAgICAgICAnc2VsbF9tYXJrZXQnLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXInLFxuICAgICAgICAgICAgICAgICdnZXRfbmV3X2RlYWxfb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZ2V0X29yZGVyX2lkX2J5X3RyYWRlX2lkJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdfY29pbicsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF93aXRoZHJhd19jb2luJyxcbiAgICAgICAgICAgICAgICAnZ2V0X3dpdGhkcmF3X2NvaW5fcmVzdWx0JyxcbiAgICAgICAgICAgICAgICAndHJhbnNmZXInLFxuICAgICAgICAgICAgICAgICdsb2FuJyxcbiAgICAgICAgICAgICAgICAncmVwYXltZW50JyxcbiAgICAgICAgICAgICAgICAnZ2V0X2xvYW5fYXZhaWxhYmxlJyxcbiAgICAgICAgICAgICAgICAnZ2V0X2xvYW5zJyxcbiAgICAgICAgICAgIF0sICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvQ05ZJzogeyAnaWQnOiAnYnRjJywgJ3N5bWJvbCc6ICdCVEMvQ05ZJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NOWScsICd0eXBlJzogJ3N0YXRpY21hcmtldCcsICdjb2luVHlwZSc6IDEsIH0sXG4gICAgICAgICdMVEMvQ05ZJzogeyAnaWQnOiAnbHRjJywgJ3N5bWJvbCc6ICdMVEMvQ05ZJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0NOWScsICd0eXBlJzogJ3N0YXRpY21hcmtldCcsICdjb2luVHlwZSc6IDIsIH0sXG4gICAgICAgICdCVEMvVVNEJzogeyAnaWQnOiAnYnRjJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcsICd0eXBlJzogJ3VzZG1hcmtldCcsICAgICdjb2luVHlwZSc6IDEsIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYWRlUG9zdEdldEFjY291bnRJbmZvICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBtZXRob2QgPSBwWyd0eXBlJ10gKyAnR2V0RGVwdGhJZCc7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXNbbWV0aG9kXSAoeyAnaWQnOiBwWydpZCddIH0pO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG1ldGhvZCA9IHBbJ3R5cGUnXSArICdHZXRUaWNrZXJJZCc7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXNbbWV0aG9kXSAoeyAnaWQnOiBwWydpZCddIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3RpY2tlciddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKHJlc3BvbnNlWyd0aW1lJ10pICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gcFsndHlwZSddICsgJ0dldERldGFpbElkJztcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAoeyAnaWQnOiBwWydpZCddIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3RyYWRlUG9zdCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnY29pbl90eXBlJzogcFsnY29pblR5cGUnXSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAnbWFya2V0JzogcFsncXVvdGUnXS50b0xvd2VyQ2FzZSAoKSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1ldGhvZCArPSB0aGlzLmNhcGl0YWxpemUgKHR5cGUpO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3RyYWRlJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddO1xuICAgICAgICBpZiAodHlwZSA9PSAndHJhZGUnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy9hcGknICsgdGhpcy52ZXJzaW9uO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5rZXlzb3J0ICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdtZXRob2QnOiBwYXRoLFxuICAgICAgICAgICAgICAgICdhY2Nlc3Nfa2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZWQnOiB0aGlzLm5vbmNlICgpLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBsZXQgcXVlcnlTdHJpbmcgPSB0aGlzLnVybGVuY29kZSAodGhpcy5vbWl0IChxdWVyeSwgJ21hcmtldCcpKTtcbiAgICAgICAgICAgIC8vIHNlY3JldCBrZXkgbXVzdCBiZSBhdCB0aGUgZW5kIG9mIHF1ZXJ5IHRvIGJlIHNpZ25lZFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcgKz0gJyZzZWNyZXRfa2V5PScgKyB0aGlzLnNlY3JldDtcbiAgICAgICAgICAgIHF1ZXJ5WydzaWduJ10gPSB0aGlzLmhhc2ggKHF1ZXJ5U3RyaW5nKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsICs9ICcvJyArIHR5cGUgKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcykgKyAnX2pzb24uanMnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgaXRiaXQgPSB7XG5cbiAgICAnaWQnOiAnaXRiaXQnLCAgICBcbiAgICAnbmFtZSc6ICdpdEJpdCcsXG4gICAgJ2NvdW50cmllcyc6ICdVUycsXG4gICAgJ3JhdGVMaW1pdCc6IDMwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3ODIyMTU5LTY2MTUzNjIwLTYwYWQtMTFlNy04OWU3LTAwNWY2ZDdmM2RlMC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLml0Yml0LmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuaXRiaXQuY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3d3dy5pdGJpdC5jb20vYXBpJyxcbiAgICAgICAgICAgICdodHRwczovL2FwaS5pdGJpdC5jb20vZG9jcycsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnbWFya2V0cy97c3ltYm9sfS90aWNrZXInLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzL3tzeW1ib2x9L29yZGVyX2Jvb2snLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzL3tzeW1ib2x9L3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMnLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0nLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vYmFsYW5jZXMve2N1cnJlbmN5Q29kZX0nLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vZnVuZGluZ19oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0cy97d2FsbGV0SWR9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMve3dhbGxldElkfS9vcmRlcnMve29yZGVySWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnd2FsbGV0X3RyYW5zZmVycycsXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMnLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vY3J5cHRvY3VycmVuY3lfZGVwb3NpdHMnLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vY3J5cHRvY3VycmVuY3lfd2l0aGRyYXdhbHMnLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnd2lyZV93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vb3JkZXJzL3tvcmRlcklkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ1hCVFVTRCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdCVEMvU0dEJzogeyAnaWQnOiAnWEJUU0dEJywgJ3N5bWJvbCc6ICdCVEMvU0dEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1NHRCcgfSxcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdYQlRFVVInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE1hcmtldHNTeW1ib2xPcmRlckJvb2sgKHsgXG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0TWFya2V0c1N5bWJvbFRpY2tlciAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLnBhcnNlODYwMSAodGlja2VyWydzZXJ2ZXJUaW1lVVRDJ10pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoMjRoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93MjRoJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAyNGgnXSksXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlblRvZGF5J10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RQcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZTI0aCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0TWFya2V0c1N5bWJvbFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRXYWxsZXRzICgpO1xuICAgIH0sXG5cbiAgICBub25jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICh0aGlzLmlkICsgJyBhbGxvd3MgbGltaXQgb3JkZXJzIG9ubHknKTtcbiAgICAgICAgYW1vdW50ID0gYW1vdW50LnRvU3RyaW5nICgpO1xuICAgICAgICBwcmljZSA9IHByaWNlLnRvU3RyaW5nICgpO1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICd0eXBlJzogdHlwZSxcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IHBbJ2Jhc2UnXSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAnZGlzcGxheSc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLFxuICAgICAgICAgICAgJ2luc3RydW1lbnQnOiBwWydpZCddLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFRyYWRlQWRkICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGJvZHkgPSAnJztcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gbm9uY2U7XG4gICAgICAgICAgICBsZXQgYXV0aCA9IFsgbWV0aG9kLCB1cmwsIGJvZHksIG5vbmNlLCB0aW1lc3RhbXAgXTtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gbm9uY2UgKyBKU09OLnN0cmluZ2lmeSAoYXV0aCk7XG4gICAgICAgICAgICBsZXQgaGFzaGVkTWVzc2FnZSA9IHRoaXMuaGFzaCAobWVzc2FnZSwgJ3NoYTI1NicsICdiaW5hcnknKTtcbiAgICAgICAgICAgIGxldCBzaWduYXR1cmUgPSB0aGlzLmhtYWMgKHVybCArIGhhc2hlZE1lc3NhZ2UsIHRoaXMuc2VjcmV0LCAnc2hhNTEyJywgJ2Jhc2U2NCcpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQXV0aG9yaXphdGlvbic6IHNlbGYuYXBpS2V5ICsgJzonICsgc2lnbmF0dXJlLFxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgJ1gtQXV0aC1UaW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgJ1gtQXV0aC1Ob25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGp1YmkgPSB7XG5cbiAgICAnaWQnOiAnanViaScsXG4gICAgJ25hbWUnOiAnanViaS5jb20nLFxuICAgICdjb3VudHJpZXMnOiAnQ04nLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjU4MS05ZDM5N2Q5YS01ZWRkLTExZTctOGZiOS01ZDgyMzZjMGU2OTIuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5qdWJpLmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3Lmp1YmkuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL3d3dy5qdWJpLmNvbS9oZWxwL2FwaS5odG1sJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdkZXB0aCcsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfYWRkJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfbGlzdCcsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX3ZpZXcnLFxuICAgICAgICAgICAgICAgICd3YWxsZXQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9DTlknOiAgeyAnaWQnOiAnYnRjJywgICdzeW1ib2wnOiAnQlRDL0NOWScsICAnYmFzZSc6ICdCVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0VUSC9DTlknOiAgeyAnaWQnOiAnZXRoJywgICdzeW1ib2wnOiAnRVRIL0NOWScsICAnYmFzZSc6ICdFVEgnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0FOUy9DTlknOiAgeyAnaWQnOiAnYW5zJywgICdzeW1ib2wnOiAnQU5TL0NOWScsICAnYmFzZSc6ICdBTlMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0JMSy9DTlknOiAgeyAnaWQnOiAnYmxrJywgICdzeW1ib2wnOiAnQkxLL0NOWScsICAnYmFzZSc6ICdCTEsnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0ROQy9DTlknOiAgeyAnaWQnOiAnZG5jJywgICdzeW1ib2wnOiAnRE5DL0NOWScsICAnYmFzZSc6ICdETkMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0RPR0UvQ05ZJzogeyAnaWQnOiAnZG9nZScsICdzeW1ib2wnOiAnRE9HRS9DTlknLCAnYmFzZSc6ICdET0dFJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0VBQy9DTlknOiAgeyAnaWQnOiAnZWFjJywgICdzeW1ib2wnOiAnRUFDL0NOWScsICAnYmFzZSc6ICdFQUMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0VUQy9DTlknOiAgeyAnaWQnOiAnZXRjJywgICdzeW1ib2wnOiAnRVRDL0NOWScsICAnYmFzZSc6ICdFVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0ZaL0NOWSc6ICAgeyAnaWQnOiAnZnonLCAgICdzeW1ib2wnOiAnRlovQ05ZJywgICAnYmFzZSc6ICdGWicsICAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0dPT0MvQ05ZJzogeyAnaWQnOiAnZ29vYycsICdzeW1ib2wnOiAnR09PQy9DTlknLCAnYmFzZSc6ICdHT09DJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0dBTUUvQ05ZJzogeyAnaWQnOiAnZ2FtZScsICdzeW1ib2wnOiAnR0FNRS9DTlknLCAnYmFzZSc6ICdHQU1FJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0hMQi9DTlknOiAgeyAnaWQnOiAnaGxiJywgICdzeW1ib2wnOiAnSExCL0NOWScsICAnYmFzZSc6ICdITEInLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0lGQy9DTlknOiAgeyAnaWQnOiAnaWZjJywgICdzeW1ib2wnOiAnSUZDL0NOWScsICAnYmFzZSc6ICdJRkMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0pCQy9DTlknOiAgeyAnaWQnOiAnamJjJywgICdzeW1ib2wnOiAnSkJDL0NOWScsICAnYmFzZSc6ICdKQkMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0tUQy9DTlknOiAgeyAnaWQnOiAna3RjJywgICdzeW1ib2wnOiAnS1RDL0NOWScsICAnYmFzZSc6ICdLVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0xLQy9DTlknOiAgeyAnaWQnOiAnbGtjJywgICdzeW1ib2wnOiAnTEtDL0NOWScsICAnYmFzZSc6ICdMS0MnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0xTSy9DTlknOiAgeyAnaWQnOiAnbHNrJywgICdzeW1ib2wnOiAnTFNLL0NOWScsICAnYmFzZSc6ICdMU0snLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0xUQy9DTlknOiAgeyAnaWQnOiAnbHRjJywgICdzeW1ib2wnOiAnTFRDL0NOWScsICAnYmFzZSc6ICdMVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ01BWC9DTlknOiAgeyAnaWQnOiAnbWF4JywgICdzeW1ib2wnOiAnTUFYL0NOWScsICAnYmFzZSc6ICdNQVgnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ01FVC9DTlknOiAgeyAnaWQnOiAnbWV0JywgICdzeW1ib2wnOiAnTUVUL0NOWScsICAnYmFzZSc6ICdNRVQnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ01SWUMvQ05ZJzogeyAnaWQnOiAnbXJ5YycsICdzeW1ib2wnOiAnTVJZQy9DTlknLCAnYmFzZSc6ICdNUllDJywgJ3F1b3RlJzogJ0NOWScgfSwgICAgICAgIFxuICAgICAgICAnTVRDL0NOWSc6ICB7ICdpZCc6ICdtdGMnLCAgJ3N5bWJvbCc6ICdNVEMvQ05ZJywgICdiYXNlJzogJ01UQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnTlhUL0NOWSc6ICB7ICdpZCc6ICdueHQnLCAgJ3N5bWJvbCc6ICdOWFQvQ05ZJywgICdiYXNlJzogJ05YVCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUEVCL0NOWSc6ICB7ICdpZCc6ICdwZWInLCAgJ3N5bWJvbCc6ICdQRUIvQ05ZJywgICdiYXNlJzogJ1BFQicsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUEdDL0NOWSc6ICB7ICdpZCc6ICdwZ2MnLCAgJ3N5bWJvbCc6ICdQR0MvQ05ZJywgICdiYXNlJzogJ1BHQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUExDL0NOWSc6ICB7ICdpZCc6ICdwbGMnLCAgJ3N5bWJvbCc6ICdQTEMvQ05ZJywgICdiYXNlJzogJ1BMQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUFBDL0NOWSc6ICB7ICdpZCc6ICdwcGMnLCAgJ3N5bWJvbCc6ICdQUEMvQ05ZJywgICdiYXNlJzogJ1BQQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUUVDL0NOWSc6ICB7ICdpZCc6ICdxZWMnLCAgJ3N5bWJvbCc6ICdRRUMvQ05ZJywgICdiYXNlJzogJ1FFQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUklPL0NOWSc6ICB7ICdpZCc6ICdyaW8nLCAgJ3N5bWJvbCc6ICdSSU8vQ05ZJywgICdiYXNlJzogJ1JJTycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUlNTL0NOWSc6ICB7ICdpZCc6ICdyc3MnLCAgJ3N5bWJvbCc6ICdSU1MvQ05ZJywgICdiYXNlJzogJ1JTUycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnU0tUL0NOWSc6ICB7ICdpZCc6ICdza3QnLCAgJ3N5bWJvbCc6ICdTS1QvQ05ZJywgICdiYXNlJzogJ1NLVCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnVEZDL0NOWSc6ICB7ICdpZCc6ICd0ZmMnLCAgJ3N5bWJvbCc6ICdURkMvQ05ZJywgICdiYXNlJzogJ1RGQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnVlJDL0NOWSc6ICB7ICdpZCc6ICd2cmMnLCAgJ3N5bWJvbCc6ICdWUkMvQ05ZJywgICdiYXNlJzogJ1ZSQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnVlRDL0NOWSc6ICB7ICdpZCc6ICd2dGMnLCAgJ3N5bWJvbCc6ICdWVEMvQ05ZJywgICdiYXNlJzogJ1ZUQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnV0RDL0NOWSc6ICB7ICdpZCc6ICd3ZGMnLCAgJ3N5bWJvbCc6ICdXREMvQ05ZJywgICdiYXNlJzogJ1dEQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWEFTL0NOWSc6ICB7ICdpZCc6ICd4YXMnLCAgJ3N5bWJvbCc6ICdYQVMvQ05ZJywgICdiYXNlJzogJ1hBUycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWFBNL0NOWSc6ICB7ICdpZCc6ICd4cG0nLCAgJ3N5bWJvbCc6ICdYUE0vQ05ZJywgICdiYXNlJzogJ1hQTScsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWFJQL0NOWSc6ICB7ICdpZCc6ICd4cnAnLCAgJ3N5bWJvbCc6ICdYUlAvQ05ZJywgICdiYXNlJzogJ1hSUCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWFNHUy9DTlknOiB7ICdpZCc6ICd4c2dzJywgJ3N5bWJvbCc6ICdYU0dTL0NOWScsICdiYXNlJzogJ1hTR1MnLCAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWVRDL0NOWSc6ICB7ICdpZCc6ICd5dGMnLCAgJ3N5bWJvbCc6ICdZVEMvQ05ZJywgICdiYXNlJzogJ1lUQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWkVUL0NOWSc6ICB7ICdpZCc6ICd6ZXQnLCAgJ3N5bWJvbCc6ICdaRVQvQ05ZJywgICdiYXNlJzogJ1pFVCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWkNDL0NOWSc6ICB7ICdpZCc6ICd6Y2MnLCAgJ3N5bWJvbCc6ICdaQ0MvQ05ZJywgICdiYXNlJzogJ1pDQycsICAncXVvdGUnOiAnQ05ZJyB9LCAgICAgICAgXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXREZXB0aCAoe1xuICAgICAgICAgICAgJ2NvaW4nOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoeyBcbiAgICAgICAgICAgICdjb2luJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVycyAoe1xuICAgICAgICAgICAgJ2NvaW4nOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZUFkZCAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdjb2luJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykgeyAgXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgICAgICBxdWVyeVsnc2lnbmF0dXJlJ10gPSB0aGlzLmhtYWMgKHRoaXMudXJsZW5jb2RlIChxdWVyeSksIHRoaXMuaGFzaCAodGhpcy5zZWNyZXQpKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga3Jha2VuIGlzIGFsc28gb3duZXIgb2YgZXguIENvaW5zZXR0ZXIgLyBDYVZpcnRFeCAvIENsZXZlcmNvaW5cblxudmFyIGtyYWtlbiA9IHtcblxuICAgICdpZCc6ICdrcmFrZW4nLFxuICAgICduYW1lJzogJ0tyYWtlbicsXG4gICAgJ2NvdW50cmllcyc6ICdVUycsXG4gICAgJ3ZlcnNpb24nOiAnMCcsXG4gICAgJ3JhdGVMaW1pdCc6IDMwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY1OTktMjI3MDkzMDQtNWVkZS0xMWU3LTlkZTEtOWYzMzczMmUxNTA5LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkua3Jha2VuLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cua3Jha2VuLmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cua3Jha2VuLmNvbS9lbi11cy9oZWxwL2FwaScsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL25vdGhpbmdpc2RlYWQvbnBtLWtyYWtlbi1hcGknLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ0Fzc2V0cycsXG4gICAgICAgICAgICAgICAgJ0Fzc2V0UGFpcnMnLFxuICAgICAgICAgICAgICAgICdEZXB0aCcsXG4gICAgICAgICAgICAgICAgJ09ITEMnLFxuICAgICAgICAgICAgICAgICdTcHJlYWQnLFxuICAgICAgICAgICAgICAgICdUaWNrZXInLFxuICAgICAgICAgICAgICAgICdUaW1lJyxcbiAgICAgICAgICAgICAgICAnVHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ0FkZE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnQmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ0NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnQ2xvc2VkT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnRGVwb3NpdEFkZHJlc3NlcycsXG4gICAgICAgICAgICAgICAgJ0RlcG9zaXRNZXRob2RzJyxcbiAgICAgICAgICAgICAgICAnRGVwb3NpdFN0YXR1cycsXG4gICAgICAgICAgICAgICAgJ0xlZGdlcnMnLFxuICAgICAgICAgICAgICAgICdPcGVuT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnT3BlblBvc2l0aW9ucycsIFxuICAgICAgICAgICAgICAgICdRdWVyeUxlZGdlcnMnLCBcbiAgICAgICAgICAgICAgICAnUXVlcnlPcmRlcnMnLCBcbiAgICAgICAgICAgICAgICAnUXVlcnlUcmFkZXMnLFxuICAgICAgICAgICAgICAgICdUcmFkZUJhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdUcmFkZXNIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnVHJhZGVWb2x1bWUnLFxuICAgICAgICAgICAgICAgICdXaXRoZHJhdycsXG4gICAgICAgICAgICAgICAgJ1dpdGhkcmF3Q2FuY2VsJywgXG4gICAgICAgICAgICAgICAgJ1dpdGhkcmF3SW5mbycsICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnV2l0aGRyYXdTdGF0dXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0QXNzZXRQYWlycyAoKTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAocHJvZHVjdHNbJ3Jlc3VsdCddKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IGtleXMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBpZCA9IGtleXNbcF07XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWydyZXN1bHQnXVtpZF07XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ2Jhc2UnXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ3F1b3RlJ107XG4gICAgICAgICAgICBpZiAoKGJhc2VbMF0gPT0gJ1gnKSB8fCAoYmFzZVswXSA9PSAnWicpKVxuICAgICAgICAgICAgICAgIGJhc2UgPSBiYXNlLnNsaWNlICgxKTtcbiAgICAgICAgICAgIGlmICgocXVvdGVbMF0gPT0gJ1gnKSB8fCAocXVvdGVbMF0gPT0gJ1onKSlcbiAgICAgICAgICAgICAgICBxdW90ZSA9IHF1b3RlLnNsaWNlICgxKTtcbiAgICAgICAgICAgIGJhc2UgPSB0aGlzLmNvbW1vbkN1cnJlbmN5Q29kZSAoYmFzZSk7XG4gICAgICAgICAgICBxdW90ZSA9IHRoaXMuY29tbW9uQ3VycmVuY3lDb2RlIChxdW90ZSk7XG4gICAgICAgICAgICBsZXQgZGFya3Bvb2wgPSBpZC5pbmRleE9mICgnLmQnKSA+PSAwO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGRhcmtwb29sID8gcHJvZHVjdFsnYWx0bmFtZSddIDogKGJhc2UgKyAnLycgKyBxdW90ZSk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0RGVwdGggICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoe1xuICAgICAgICAgICAgJ3BhaXInOiBwWydpZCddLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydyZXN1bHQnXVtwWydpZCddXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoJ11bMV0pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbCddWzFdKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2InXVswXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhJ11bMF0pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3AnXVsxXSksXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnbyddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydjJ11bMF0pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndiddWzFdKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXMgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgICAgICAnb3JkZXJ0eXBlJzogdHlwZSxcbiAgICAgICAgICAgICd2b2x1bWUnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEFkZE9yZGVyICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkgeyAgXG4gICAgICAgIGxldCB1cmwgPSAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0eXBlICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7ICdub25jZSc6IG5vbmNlIH0sIHBhcmFtcyk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIHF1ZXJ5ID0gdGhpcy5zdHJpbmdUb0JpbmFyeSAodXJsICsgdGhpcy5oYXNoIChub25jZSArIGJvZHksICdzaGEyNTYnLCAnYmluYXJ5JykpO1xuICAgICAgICAgICAgbGV0IHNlY3JldCA9IHRoaXMuYmFzZTY0VG9CaW5hcnkgKHRoaXMuc2VjcmV0KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0FQSS1LZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnQVBJLVNpZ24nOiB0aGlzLmhtYWMgKHF1ZXJ5LCBzZWNyZXQsICdzaGE1MTInLCAnYmFzZTY0JyksXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgdXJsO1xuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGx1bm8gPSB7XG5cbiAgICAnaWQnOiAnbHVubycsXG4gICAgJ25hbWUnOiAnbHVubycsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0dCJywgJ1NHJywgJ1pBJywgXSxcbiAgICAncmF0ZUxpbWl0JzogNTAwMCxcbiAgICAndmVyc2lvbic6ICcxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjYwNy04YzFhNjlkOC01ZWRlLTExZTctOTMwYy01NDBiNWViOWJlMjQuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5teWJpdHguY29tL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cubHVuby5jb20nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vbnBtanMub3JnL3BhY2thZ2UvYml0eCcsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL2JhdXNtZWllci9ub2RlLWJpdHgnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcnMnLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdhY2NvdW50cy97aWR9L3BlbmRpbmcnLFxuICAgICAgICAgICAgICAgICdhY2NvdW50cy97aWR9L3RyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdmZWVfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRpbmdfYWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ2xpc3RvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdsaXN0dHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3tpZH0nLFxuICAgICAgICAgICAgICAgICdxdW90ZXMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMve2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAncG9zdG9yZGVyJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0b3JkZXInLFxuICAgICAgICAgICAgICAgICdzdG9wb3JkZXInLFxuICAgICAgICAgICAgICAgICdmdW5kaW5nX2FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2FscycsXG4gICAgICAgICAgICAgICAgJ3NlbmQnLFxuICAgICAgICAgICAgICAgICdxdW90ZXMnLFxuICAgICAgICAgICAgICAgICdvYXV0aDIvZ3JhbnQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwdXQnOiBbXG4gICAgICAgICAgICAgICAgJ3F1b3Rlcy97aWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICdxdW90ZXMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzL3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VycyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzWyd0aWNrZXJzJ10ubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3RpY2tlcnMnXVtwXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ3BhaXInXTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gaWQuc2xpY2UgKDAsIDMpO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gaWQuc2xpY2UgKDMsIDYpO1xuICAgICAgICAgICAgYmFzZSA9IHRoaXMuY29tbW9uQ3VycmVuY3lDb2RlIChiYXNlKTtcbiAgICAgICAgICAgIHF1b3RlID0gdGhpcy5jb21tb25DdXJyZW5jeUNvZGUgKHF1b3RlKTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyYm9vayAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd0aW1lc3RhbXAnXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsb3cnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RfdHJhZGUnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydyb2xsaW5nXzI0X2hvdXJfdm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdClcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0JztcbiAgICAgICAgbGV0IG9yZGVyID0geyAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0Jykge1xuICAgICAgICAgICAgbWV0aG9kICs9ICdNYXJrZXRvcmRlcic7XG4gICAgICAgICAgICBvcmRlclsndHlwZSddID0gc2lkZS50b1VwcGVyQ2FzZSAoKTtcbiAgICAgICAgICAgIGlmIChzaWRlID09ICdidXknKVxuICAgICAgICAgICAgICAgIG9yZGVyWydjb3VudGVyX3ZvbHVtZSddID0gYW1vdW50O1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9yZGVyWydiYXNlX3ZvbHVtZSddID0gYW1vdW50OyAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWV0aG9kICs9ICdPcmRlcic7XG4gICAgICAgICAgICBvcmRlclsndm9sdW1lJ10gPSBhbW91bnQ7XG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICAgICAgaWYgKHNpZGUgPT0gJ2J1eScpXG4gICAgICAgICAgICAgICAgb3JkZXJbJ3R5cGUnXSA9ICdCSUQnO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9yZGVyWyd0eXBlJ10gPSAnQVNLJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3ByaXZhdGUnKSB7XG4gICAgICAgICAgICBsZXQgYXV0aCA9IHRoaXMuc3RyaW5nVG9CYXNlNjQgKHRoaXMuYXBpS2V5ICsgJzonICsgdGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHsgJ0F1dGhvcml6YXRpb24nOiAnQmFzaWMgJyArIGF1dGggfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIG1lcmNhZG8gPSB7XG5cbiAgICAnaWQnOiAnbWVyY2FkbycsXG4gICAgJ25hbWUnOiAnTWVyY2FkbyBCaXRjb2luJyxcbiAgICAnY291bnRyaWVzJzogJ0JSJywgLy8gQnJhemlsXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjMnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3ODM3MDYwLWU3YzU4NzE0LTYwZWEtMTFlNy05MTkyLWYwNWU4NmFkYjgzZi5qcGcnLFxuICAgICAgICAnYXBpJzoge1xuICAgICAgICAgICAgJ3B1YmxpYyc6ICdodHRwczovL3d3dy5tZXJjYWRvYml0Y29pbi5uZXQvYXBpJyxcbiAgICAgICAgICAgICdwcml2YXRlJzogJ2h0dHBzOi8vd3d3Lm1lcmNhZG9iaXRjb2luLm5ldC90YXBpJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5tZXJjYWRvYml0Y29pbi5jb20uYnInLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lm1lcmNhZG9iaXRjb2luLmNvbS5ici9hcGktZG9jJyxcbiAgICAgICAgICAgICdodHRwczovL3d3dy5tZXJjYWRvYml0Y29pbi5jb20uYnIvdHJhZGUtYXBpJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogWyAvLyBsYXN0IHNsYXNoIGNyaXRpY2FsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9vay8nLFxuICAgICAgICAgICAgICAgICdvcmRlcmJvb2tfbGl0ZWNvaW4vJyxcbiAgICAgICAgICAgICAgICAndGlja2VyLycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcl9saXRlY29pbi8nLFxuICAgICAgICAgICAgICAgICd0cmFkZXMvJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzX2xpdGVjb2luLycsXG4gICAgICAgICAgICAgICAgJ3YyL3RpY2tlci8nLFxuICAgICAgICAgICAgICAgICd2Mi90aWNrZXJfbGl0ZWNvaW4vJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldF9hY2NvdW50X2luZm8nLFxuICAgICAgICAgICAgICAgICdnZXRfb3JkZXInLFxuICAgICAgICAgICAgICAgICdnZXRfd2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ2xpc3Rfc3lzdGVtX21lc3NhZ2VzJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdsaXN0X29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ3BsYWNlX2J1eV9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ3BsYWNlX3NlbGxfb3JkZXInLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd19jb2luJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvQlJMJzogeyAnaWQnOiAnQlJMQlRDJywgJ3N5bWJvbCc6ICdCVEMvQlJMJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0JSTCcsICdzdWZmaXgnOiAnJyB9LFxuICAgICAgICAnTFRDL0JSTCc6IHsgJ2lkJzogJ0JSTExUQycsICdzeW1ib2wnOiAnTFRDL0JSTCcsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdCUkwnLCAnc3VmZml4JzogJ0xpdGVjb2luJyB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHVibGljR2V0T3JkZXJib29rJyArIHRoaXMuY2FwaXRhbGl6ZSAocFsnc3VmZml4J10pO1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzW21ldGhvZF0gKCk7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3B1YmxpY0dldFYyVGlja2VyJyArIHRoaXMuY2FwaXRhbGl6ZSAocFsnc3VmZml4J10pO1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzW21ldGhvZF0gKCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsndGlja2VyJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAodGlja2VyWydkYXRlJ10pICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3B1YmxpY0dldFRyYWRlcycgKyB0aGlzLmNhcGl0YWxpemUgKHBbJ3N1ZmZpeCddKTtcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RHZXRBY2NvdW50SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICh0aGlzLmlkICsgJyBhbGxvd3MgbGltaXQgb3JkZXJzIG9ubHknKTtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlUG9zdFBsYWNlJyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSkgKyAnT3JkZXInO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnY29pbl9wYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3F1YW50aXR5JzogYW1vdW50LFxuICAgICAgICAgICAgJ2xpbWl0X3ByaWNlJzogcHJpY2UsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7ICAgICAgICBcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV0gKyAnLyc7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gcGF0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCArPSB0aGlzLnZlcnNpb24gKyAnLyc7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICd0YXBpX21ldGhvZCc6IHBhdGgsXG4gICAgICAgICAgICAgICAgJ3RhcGlfbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgbGV0IGF1dGggPSAnL3RhcGkvJyArIHRoaXMudmVyc2lvbiAgKyAnLycgKyAnPycgKyBib2R5O1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ1RBUEktSUQnOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnVEFQSS1NQUMnOiB0aGlzLmhtYWMgKGF1dGgsIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gT0tDb2luIFxuLy8gQ2hpbmFcbi8vIGh0dHBzOi8vd3d3Lm9rY29pbi5jb20vXG4vLyBodHRwczovL3d3dy5va2NvaW4uY29tL3Jlc3RfZ2V0U3RhcnRlZC5odG1sXG4vLyBodHRwczovL2dpdGh1Yi5jb20vT0tDb2luL3dlYnNvY2tldFxuLy8gaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2Uvb2tjb2luLmNvbVxuLy8gaHR0cHM6Ly93d3cub2tjb2luLmNuXG4vLyBodHRwczovL3d3dy5va2NvaW4uY24vcmVzdF9nZXRTdGFydGVkLmh0bWxcblxudmFyIG9rY29pbiA9IHtcblxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCwgLy8gdXAgdG8gMzAwMCByZXF1ZXN0cyBwZXIgNSBtaW51dGVzIOKJiCA2MDAgcmVxdWVzdHMgcGVyIG1pbnV0ZSDiiYggMTAgcmVxdWVzdHMgcGVyIHNlY29uZCDiiYggMTAwIG1zXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2RlcHRoJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2VfcmF0ZScsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9kZXB0aCcsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9lc3RpbWF0ZWRfcHJpY2UnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfaG9sZF9hbW91bnQnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfaW5kZXgnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfa2xpbmUnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfcHJpY2VfbGltaXQnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfdGlja2VyJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2tsaW5lJyxcbiAgICAgICAgICAgICAgICAnb3RjcycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsICAgIFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudF9yZWNvcmRzJyxcbiAgICAgICAgICAgICAgICAnYmF0Y2hfdHJhZGUnLFxuICAgICAgICAgICAgICAgICdib3Jyb3dfbW9uZXknLFxuICAgICAgICAgICAgICAgICdib3Jyb3dfb3JkZXJfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2JvcnJvd3NfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9ib3Jyb3cnLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXInLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3RjX29yZGVyJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX3dpdGhkcmF3JyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2JhdGNoX3RyYWRlJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9kZXZvbHZlJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2V4cGxvc2l2ZScsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9vcmRlcl9pbmZvJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX29yZGVyc19pbmZvJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX3Bvc2l0aW9uJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX3Bvc2l0aW9uXzRmaXgnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfdHJhZGUnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfdHJhZGVzX2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfdXNlcmluZm8nLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfdXNlcmluZm9fNGZpeCcsXG4gICAgICAgICAgICAgICAgJ2xlbmRfZGVwdGgnLFxuICAgICAgICAgICAgICAgICdvcmRlcl9mZWUnLFxuICAgICAgICAgICAgICAgICdvcmRlcl9oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfaW5mbycsXG4gICAgICAgICAgICAgICAgJ29yZGVyc19pbmZvJyxcbiAgICAgICAgICAgICAgICAnb3RjX29yZGVyX2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdvdGNfb3JkZXJfaW5mbycsXG4gICAgICAgICAgICAgICAgJ3JlcGF5bWVudCcsXG4gICAgICAgICAgICAgICAgJ3N1Ym1pdF9vdGNfb3JkZXInLFxuICAgICAgICAgICAgICAgICd0cmFkZScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICd0cmFkZV9vdGNfb3JkZXInLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2luZm8nLFxuICAgICAgICAgICAgICAgICd1bnJlcGF5bWVudHNfaW5mbycsXG4gICAgICAgICAgICAgICAgJ3VzZXJpbmZvJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0RGVwdGggKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWyd0aWNrZXInXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50IChyZXNwb25zZVsnZGF0ZSddKSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VXNlcmluZm8gKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9yZGVyWyd0eXBlJ10gKz0gJ19tYXJrZXQnO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFRyYWRlICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gJy9hcGkvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHBhdGggKyAnLmRvJzsgICBcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5rZXlzb3J0ICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdhcGlfa2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIC8vIHNlY3JldCBrZXkgbXVzdCBiZSBhdCB0aGUgZW5kIG9mIHF1ZXJ5XG4gICAgICAgICAgICBsZXQgcXVlcnlTdHJpbmcgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpICsgJyZzZWNyZXRfa2V5PScgKyB0aGlzLnNlY3JldDtcbiAgICAgICAgICAgIHF1ZXJ5WydzaWduJ10gPSB0aGlzLmhhc2ggKHF1ZXJ5U3RyaW5nKS50b1VwcGVyQ2FzZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHsgJ0NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnIH07XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHVybDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBva2NvaW5jbnkgPSBleHRlbmQgKG9rY29pbiwge1xuICAgICdpZCc6ICdva2NvaW5jbnknLFxuICAgICduYW1lJzogJ09LQ29pbiBDTlknLFxuICAgICdjb3VudHJpZXMnOiAnQ04nLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NzkyLThiZTkxNTdhLTVlZTUtMTFlNy05MjZjLTZkNjliOGQzMzc4ZC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vd3d3Lm9rY29pbi5jbicsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cub2tjb2luLmNuJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL3d3dy5va2NvaW4uY24vcmVzdF9nZXRTdGFydGVkLmh0bWwnLFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL0NOWSc6IHsgJ2lkJzogJ2J0Y19jbnknLCAnc3ltYm9sJzogJ0JUQy9DTlknLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnTFRDL0NOWSc6IHsgJ2lkJzogJ2x0Y19jbnknLCAnc3ltYm9sJzogJ0xUQy9DTlknLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnQ05ZJyB9LFxuICAgIH0sXG59KVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBva2NvaW51c2QgPSBleHRlbmQgKG9rY29pbiwge1xuICAgICdpZCc6ICdva2NvaW51c2QnLFxuICAgICduYW1lJzogJ09LQ29pbiBVU0QnLFxuICAgICdjb3VudHJpZXMnOiBbICdDTicsICdVUycgXSxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2Njc5MS04OWZmYjUwMi01ZWU1LTExZTctOGE1Yi1jNTk1MGI2OGFjNjUuanBnJywgICAgICAgIFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vd3d3Lm9rY29pbi5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3Lm9rY29pbi5jb20nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lm9rY29pbi5jb20vcmVzdF9nZXRTdGFydGVkLmh0bWwnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL29rY29pbi5jb20nLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ2J0Y191c2QnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnTFRDL1VTRCc6IHsgJ2lkJzogJ2x0Y191c2QnLCAnc3ltYm9sJzogJ0xUQy9VU0QnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgIH0sXG59KVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBwYXltaXVtID0ge1xuXG4gICAgJ2lkJzogJ3BheW1pdW0nLFxuICAgICduYW1lJzogJ1BheW1pdW0nLFxuICAgICdjb3VudHJpZXMnOiBbICdGUicsICdFVScsIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDMwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzkwNTY0LWE5NDVhOWQ0LTVmZjktMTFlNy05ZDJkLWI2MzU3NjNmMmYyNC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vcGF5bWl1bS5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5wYXltaXVtLmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cucGF5bWl1bS5jb20vcGFnZS9kZXZlbG9wZXJzJyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vUGF5bWl1bS9hcGktZG9jdW1lbnRhdGlvbicsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnY291bnRyaWVzJyxcbiAgICAgICAgICAgICAgICAnZGF0YS97aWR9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ2RhdGEve2lkfS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdkYXRhL3tpZH0vZGVwdGgnLFxuICAgICAgICAgICAgICAgICdiaXRjb2luX2NoYXJ0cy97aWR9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2JpdGNvaW5fY2hhcnRzL3tpZH0vZGVwdGgnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdtZXJjaGFudC9nZXRfcGF5bWVudC97VVVJRH0nLFxuICAgICAgICAgICAgICAgICd1c2VyJyxcbiAgICAgICAgICAgICAgICAndXNlci9hZGRyZXNzZXMnLFxuICAgICAgICAgICAgICAgICd1c2VyL2FkZHJlc3Nlcy97YnRjX2FkZHJlc3N9JyxcbiAgICAgICAgICAgICAgICAndXNlci9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICd1c2VyL29yZGVycy97VVVJRH0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3ByaWNlX2FsZXJ0cycsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ3VzZXIvb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAndXNlci9hZGRyZXNzZXMnLFxuICAgICAgICAgICAgICAgICd1c2VyL3BheW1lbnRfcmVxdWVzdHMnLFxuICAgICAgICAgICAgICAgICd1c2VyL3ByaWNlX2FsZXJ0cycsXG4gICAgICAgICAgICAgICAgJ21lcmNoYW50L2NyZWF0ZV9wYXltZW50JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICd1c2VyL29yZGVycy97VVVJRH0vY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAndXNlci9wcmljZV9hbGVydHMve2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ2V1cicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRVc2VyICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldERhdGFJZERlcHRoICAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXREYXRhSWRUaWNrZXIgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ2F0J10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydwcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndmFyaWF0aW9uJ10pLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldERhdGFJZFRyYWRlcyAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICd0eXBlJzogdGhpcy5jYXBpdGFsaXplICh0eXBlKSArICdPcmRlcicsXG4gICAgICAgICAgICAnY3VycmVuY3knOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnZGlyZWN0aW9uJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RVc2VyT3JkZXJzICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0Q2FuY2VsT3JkZXIgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnb3JkZXJOdW1iZXInOiBpZCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHBhcmFtcyk7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpOyAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGF1dGggPSBub25jZSArIHVybCArIGJvZHk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdBcGktS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ0FwaS1TaWduYXR1cmUnOiB0aGlzLmhtYWMgKGF1dGgsIHRoaXMuc2VjcmV0KSxcbiAgICAgICAgICAgICAgICAnQXBpLU5vbmNlJzogbm9uY2UsICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgcG9sb25pZXggPSB7XG5cbiAgICAnaWQnOiAncG9sb25pZXgnLFxuICAgICduYW1lJzogJ1BvbG9uaWV4JyxcbiAgICAnY291bnRyaWVzJzogJ1VTJyxcbiAgICAncmF0ZUxpbWl0JzogMTAwMCwgLy8gNiBjYWxscyBwZXIgc2Vjb25kXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY4MTctZTk0NTYzMTItNWVlNi0xMWU3LTliM2MtYjYyOGNhNTYyNmE1LmpwZycsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAncHVibGljJzogJ2h0dHBzOi8vcG9sb25pZXguY29tL3B1YmxpYycsXG4gICAgICAgICAgICAncHJpdmF0ZSc6ICdodHRwczovL3BvbG9uaWV4LmNvbS90cmFkaW5nQXBpJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3BvbG9uaWV4LmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9wb2xvbmlleC5jb20vc3VwcG9ydC9hcGkvJyxcbiAgICAgICAgICAgICdodHRwOi8vcGFzdGViaW4uY29tL2RNWDdtWkUwJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdyZXR1cm4yNGhWb2x1bWUnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5DaGFydERhdGEnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5DdXJyZW5jaWVzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuTG9hbk9yZGVycycsXG4gICAgICAgICAgICAgICAgJ3JldHVybk9yZGVyQm9vaycsXG4gICAgICAgICAgICAgICAgJ3JldHVyblRpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3JldHVyblRyYWRlSGlzdG9yeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdidXknLFxuICAgICAgICAgICAgICAgICdjYW5jZWxMb2FuT2ZmZXInLFxuICAgICAgICAgICAgICAgICdjYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ2Nsb3NlTWFyZ2luUG9zaXRpb24nLFxuICAgICAgICAgICAgICAgICdjcmVhdGVMb2FuT2ZmZXInLFxuICAgICAgICAgICAgICAgICdnZW5lcmF0ZU5ld0FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICdnZXRNYXJnaW5Qb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgJ21hcmdpbkJ1eScsXG4gICAgICAgICAgICAgICAgJ21hcmdpblNlbGwnLFxuICAgICAgICAgICAgICAgICdtb3ZlT3JkZXInLFxuICAgICAgICAgICAgICAgICdyZXR1cm5BY3RpdmVMb2FucycsXG4gICAgICAgICAgICAgICAgJ3JldHVybkF2YWlsYWJsZUFjY291bnRCYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ3JldHVybkJhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuQ29tcGxldGVCYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ3JldHVybkRlcG9zaXRBZGRyZXNzZXMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5EZXBvc2l0c1dpdGhkcmF3YWxzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuRmVlSW5mbycsXG4gICAgICAgICAgICAgICAgJ3JldHVybkxlbmRpbmdIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAncmV0dXJuTWFyZ2luQWNjb3VudFN1bW1hcnknLFxuICAgICAgICAgICAgICAgICdyZXR1cm5PcGVuTG9hbk9mZmVycycsXG4gICAgICAgICAgICAgICAgJ3JldHVybk9wZW5PcmRlcnMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5PcmRlclRyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3JldHVyblRyYWRhYmxlQmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5UcmFkZUhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdzZWxsJyxcbiAgICAgICAgICAgICAgICAndG9nZ2xlQXV0b1JlbmV3JyxcbiAgICAgICAgICAgICAgICAndHJhbnNmZXJCYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0UmV0dXJuVGlja2VyICgpO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0cyk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgaWQgPSBrZXlzW3BdO1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1tpZF07XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gaWQucmVwbGFjZSAoJ18nLCAnLycpO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RSZXR1cm5Db21wbGV0ZUJhbGFuY2VzICh7XG4gICAgICAgICAgICAnYWNjb3VudCc6ICdhbGwnLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRSZXR1cm5PcmRlckJvb2sgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeVBhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHRpY2tlcnMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFJldHVyblRpY2tlciAoKTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHRpY2tlcnNbcFsnaWQnXV07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaDI0aHInXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cyNGhyJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaGVzdEJpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvd2VzdEFzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjaGFuZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3BlcmNlbnRDaGFuZ2UnXSksXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2Jhc2VWb2x1bWUnXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3F1b3RlVm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFJldHVyblRyYWRlSGlzdG9yeSAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5UGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSk7XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnY3VycmVuY3lQYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3JhdGUnOiBwcmljZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0Q2FuY2VsT3JkZXIgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnb3JkZXJOdW1iZXInOiBpZCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddW3R5cGVdO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoeyAnY29tbWFuZCc6IHBhdGggfSwgcGFyYW1zKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcXVlcnlbJ25vbmNlJ10gPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1NpZ24nOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgcXVhZHJpZ2FjeCA9IHtcblxuICAgICdpZCc6ICdxdWFkcmlnYWN4JyxcbiAgICAnbmFtZSc6ICdRdWFkcmlnYUNYJyxcbiAgICAnY291bnRyaWVzJzogJ0NBJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndmVyc2lvbic6ICd2MicsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY4MjUtOThhNmQwZGUtNWVlNy0xMWU3LTlmYTQtMzhlMTFhMmM2ZjUyLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkucXVhZHJpZ2FjeC5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LnF1YWRyaWdhY3guY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL3d3dy5xdWFkcmlnYWN4LmNvbS9hcGlfaW5mbycsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXJfYm9vaycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2JpdGNvaW5fZGVwb3NpdF9hZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnYml0Y29pbl93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnYnV5JyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVyJyxcbiAgICAgICAgICAgICAgICAnZXRoZXJfZGVwb3NpdF9hZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnZXRoZXJfd2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ2xvb2t1cF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ29wZW5fb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnc2VsbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXJfdHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvQ0FEJzogeyAnaWQnOiAnYnRjX2NhZCcsICdzeW1ib2wnOiAnQlRDL0NBRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDQUQnIH0sXG4gICAgICAgICdCVEMvVVNEJzogeyAnaWQnOiAnYnRjX3VzZCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdFVEgvQlRDJzogeyAnaWQnOiAnZXRoX2J0YycsICdzeW1ib2wnOiAnRVRIL0JUQycsICdiYXNlJzogJ0VUSCcsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdFVEgvQ0FEJzogeyAnaWQnOiAnZXRoX2NhZCcsICdzeW1ib2wnOiAnRVRIL0NBRCcsICdiYXNlJzogJ0VUSCcsICdxdW90ZSc6ICdDQUQnIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRPcmRlckJvb2sgKHtcbiAgICAgICAgICAgICdib29rJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdib29rJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50ICh0aWNrZXJbJ3RpbWVzdGFtcCddKSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhbnNhY3Rpb25zICh7XG4gICAgICAgICAgICAnYm9vayc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSk7IFxuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0Q2FuY2VsT3JkZXIgKHRoaXMuZXh0ZW5kICh7IGlkIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHBhdGg7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSBbIG5vbmNlLCB0aGlzLnVpZCwgdGhpcy5hcGlLZXkgXS5qb2luICgnJyk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5obWFjIChyZXF1ZXN0LCB0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoeyBcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ3NpZ25hdHVyZSc6IHNpZ25hdHVyZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBxdW9pbmUgPSB7XG5cbiAgICAnaWQnOiAncXVvaW5lJyxcbiAgICAnbmFtZSc6ICdRVU9JTkUnLFxuICAgICdjb3VudHJpZXMnOiBbICdKUCcsICdTRycsICdWTicgXSxcbiAgICAndmVyc2lvbic6ICcyJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2Njg0NC05NjE1YTRlOC01ZWU4LTExZTctODgxNC1mY2QwMDRkYjhjZGQuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5xdW9pbmUuY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5xdW9pbmUuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2RldmVsb3BlcnMucXVvaW5lLmNvbScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAncHJvZHVjdHMnLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cy97aWR9JyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdHMve2lkfS9wcmljZV9sZXZlbHMnLFxuICAgICAgICAgICAgICAgICdleGVjdXRpb25zJyxcbiAgICAgICAgICAgICAgICAnaXJfbGFkZGVycy97Y3VycmVuY3l9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMvYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2NyeXB0b19hY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2V4ZWN1dGlvbnMvbWUnLFxuICAgICAgICAgICAgICAgICdmaWF0X2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnbG9hbl9iaWRzJyxcbiAgICAgICAgICAgICAgICAnbG9hbnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ29yZGVycy97aWR9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97aWR9L2xvYW5zJyxcbiAgICAgICAgICAgICAgICAndHJhZGluZ19hY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ3RyYWRpbmdfYWNjb3VudHMve2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2ZpYXRfYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdsb2FuX2JpZHMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwdXQnOiBbXG4gICAgICAgICAgICAgICAgJ2xvYW5fYmlkcy97aWR9L2Nsb3NlJyxcbiAgICAgICAgICAgICAgICAnbG9hbnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ29yZGVycy97aWR9JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3tpZH0vY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzL3tpZH0nLFxuICAgICAgICAgICAgICAgICd0cmFkZXMve2lkfS9jbG9zZScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy9jbG9zZV9hbGwnLFxuICAgICAgICAgICAgICAgICd0cmFkaW5nX2FjY291bnRzL3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0UHJvZHVjdHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1twXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ2lkJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ2Jhc2VfY3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ3F1b3RlZF9jdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEFjY291bnRzQmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQcm9kdWN0c0lkUHJpY2VMZXZlbHMgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0UHJvZHVjdHNJZCAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoX21hcmtldF9hc2snXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3dfbWFya2V0X2JpZCddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21hcmtldF9iaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydtYXJrZXRfYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0X3RyYWRlZF9wcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZV8yNGgnXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RXhlY3V0aW9ucyAoe1xuICAgICAgICAgICAgJ3Byb2R1Y3RfaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ29yZGVyX3R5cGUnOiB0eXBlLFxuICAgICAgICAgICAgJ3Byb2R1Y3RfaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnc2lkZSc6IHNpZGUsXG4gICAgICAgICAgICAncXVhbnRpdHknOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVycyAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdvcmRlcic6IG9yZGVyLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsT3JkZXIgKGlkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUHV0T3JkZXJzSWRDYW5jZWwgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICdYLVF1b2luZS1BUEktVmVyc2lvbic6IHRoaXMudmVyc2lvbixcbiAgICAgICAgICAgICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAgICAgJ3BhdGgnOiB1cmwsIFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLCBcbiAgICAgICAgICAgICAgICAndG9rZW5faWQnOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnaWF0JzogTWF0aC5mbG9vciAobm9uY2UgLyAxMDAwKSwgLy8gaXNzdWVkIGF0XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVyc1snWC1RdW9pbmUtQXV0aCddID0gdGhpcy5qd3QgKHJlcXVlc3QsIHRoaXMuc2VjcmV0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodGhpcy51cmxzWydhcGknXSArIHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciB0aGVyb2NrID0ge1xuXG4gICAgJ2lkJzogJ3RoZXJvY2snLFxuICAgICduYW1lJzogJ1RoZVJvY2tUcmFkaW5nJyxcbiAgICAnY291bnRyaWVzJzogJ01UJyxcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY4NjktNzUwNTdmYTItNWVlOS0xMWU3LTlhNmYtMTNlNjQxZmE0NzA3LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkudGhlcm9ja3RyYWRpbmcuY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3RoZXJvY2t0cmFkaW5nLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9hcGkudGhlcm9ja3RyYWRpbmcuY29tL2RvYy8nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tpZH0vb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAnZnVuZHMve2lkfS90aWNrZXInLFxuICAgICAgICAgICAgICAgICdmdW5kcy97aWR9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3RpY2tlcnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzL3tpZH0nLFxuICAgICAgICAgICAgICAgICdkaXNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdkaXNjb3VudHMve2lkfScsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzJyxcbiAgICAgICAgICAgICAgICAnZnVuZHMve2lkfScsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tpZH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnZnVuZHMve2Z1bmRfaWR9L29yZGVycycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9vcmRlcnMve2lkfScsICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vcG9zaXRpb25fYmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vcG9zaXRpb25zJyxcbiAgICAgICAgICAgICAgICAnZnVuZHMve2Z1bmRfaWR9L3Bvc2l0aW9ucy97aWR9JyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zL3tpZH0nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd19saW1pdHMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2xpbWl0cycsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2F0bXMvd2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vb3JkZXJzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vb3JkZXJzL3tpZH0nLFxuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vb3JkZXJzL3JlbW92ZV9hbGwnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0RnVuZHNUaWNrZXJzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ3RpY2tlcnMnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sndGlja2VycyddW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnZnVuZF9pZCddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBpZC5zbGljZSAoMCwgMyk7XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBpZC5zbGljZSAoMywgNik7XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkgeyBcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEJhbGFuY2VzICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEZ1bmRzSWRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0RnVuZHNJZFRpY2tlciAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMucGFyc2U4NjAxICh0aWNrZXJbJ2RhdGUnXSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogcGFyc2VGbG9hdCAodGlja2VyWydjbG9zZSddKSxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lX3RyYWRlZCddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldEZ1bmRzSWRUcmFkZXMgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0JylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAodGhpcy5pZCArICcgYWxsb3dzIGxpbWl0IG9yZGVycyBvbmx5Jyk7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0RnVuZHNGdW5kSWRPcmRlcnMgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnZnVuZF9pZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwcml2YXRlJykge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ1gtVFJULUtFWSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdYLVRSVC1OT05DRSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdYLVRSVC1TSUdOJzogdGhpcy5obWFjIChub25jZSArIHVybCwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHF1ZXJ5KTtcbiAgICAgICAgICAgICAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIHZhdWx0b3JvID0ge1xuXG4gICAgJ2lkJzogJ3ZhdWx0b3JvJyxcbiAgICAnbmFtZSc6ICdWYXVsdG9ybycsXG4gICAgJ2NvdW50cmllcyc6ICdDSCcsXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsXG4gICAgJ3ZlcnNpb24nOiAnMScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY4ODAtZjIwNWU4NzAtNWVlOS0xMWU3LThmZTItMGQ1YjE1ODgwNzUyLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkudmF1bHRvcm8uY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy52YXVsdG9yby5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vYXBpLnZhdWx0b3JvLmNvbScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYmlkYW5kYXNrJyxcbiAgICAgICAgICAgICAgICAnYnV5b3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnbGF0ZXN0JyxcbiAgICAgICAgICAgICAgICAnbGF0ZXN0dHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0cycsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ3NlbGxvcmRlcnMnLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMvZGF5JyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zL2hvdXInLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMvbW9udGgnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnbXl0cmFkZXMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdidXkve3N5bWJvbH0ve3R5cGV9JyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsL3tvcmRlcmlkJyxcbiAgICAgICAgICAgICAgICAnc2VsbC97c3ltYm9sfS97dHlwZX0nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE1hcmtldHMgKCk7XG4gICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ2RhdGEnXTtcbiAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0WydCYXNlQ3VycmVuY3knXTtcbiAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsnTWFya2V0Q3VycmVuY3knXTtcbiAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgbGV0IGJhc2VJZCA9IGJhc2U7XG4gICAgICAgIGxldCBxdW90ZUlkID0gcXVvdGU7XG4gICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ01hcmtldE5hbWUnXTtcbiAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgJ2Jhc2VJZCc6IGJhc2VJZCxcbiAgICAgICAgICAgICdxdW90ZUlkJzogcXVvdGVJZCxcbiAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE9yZGVyYm9vayAoKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcXVvdGUgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEJpZGFuZGFzayAoKTtcbiAgICAgICAgbGV0IGJpZHNMZW5ndGggPSBxdW90ZVsnYmlkcyddLmxlbmd0aDtcbiAgICAgICAgbGV0IGJpZCA9IHF1b3RlWydiaWRzJ11bYmlkc0xlbmd0aCAtIDFdO1xuICAgICAgICBsZXQgYXNrID0gcXVvdGVbJ2Fza3MnXVswXTtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRNYXJrZXRzICgpO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ2RhdGEnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWycyNGhIaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnMjRoTG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IGJpZFswXSxcbiAgICAgICAgICAgICdhc2snOiBhc2tbMF0sXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RQcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJzI0aFZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFuc2FjdGlvbnNEYXkgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVBvc3QnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKSArICdTeW1ib2xUeXBlJztcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiBwWydxdW90ZUlkJ10udG9Mb3dlckNhc2UgKCksXG4gICAgICAgICAgICAndHlwZSc6IHR5cGUsXG4gICAgICAgICAgICAnZ2xkJzogYW1vdW50LFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UgfHwgMSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9IHBhdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgdXJsICs9IHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ2FwaWtleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgfSwgdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpKTtcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICdYLVNpZ25hdHVyZSc6IHRoaXMuaG1hYyAodXJsLCB0aGlzLnNlY3JldClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciB2aXJ3b3ggPSB7XG5cbiAgICAnaWQnOiAndmlyd294JyxcbiAgICAnbmFtZSc6ICdWaXJXb1gnLFxuICAgICdjb3VudHJpZXMnOiAnQVQnLFxuICAgICdyYXRlTGltaXQnOiAxMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2ODk0LTZkYTlkMzYwLTVlZWEtMTFlNy05MGFhLTQxZjI3MTFiNzQwNS5qcGcnLFxuICAgICAgICAnYXBpJzoge1xuICAgICAgICAgICAgJ3B1YmxpYyc6ICdodHRwOi8vYXBpLnZpcndveC5jb20vYXBpL2pzb24ucGhwJyxcbiAgICAgICAgICAgICdwcml2YXRlJzogJ2h0dHBzOi8vd3d3LnZpcndveC5jb20vYXBpL3RyYWRpbmcucGhwJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy52aXJ3b3guY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL3d3dy52aXJ3b3guY29tL2RldmVsb3BlcnMucGhwJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdnZXRJbnN0cnVtZW50cycsXG4gICAgICAgICAgICAgICAgJ2dldEJlc3RQcmljZXMnLFxuICAgICAgICAgICAgICAgICdnZXRNYXJrZXREZXB0aCcsXG4gICAgICAgICAgICAgICAgJ2VzdGltYXRlTWFya2V0T3JkZXInLFxuICAgICAgICAgICAgICAgICdnZXRUcmFkZWRQcmljZVZvbHVtZScsXG4gICAgICAgICAgICAgICAgJ2dldFJhd1RyYWRlRGF0YScsXG4gICAgICAgICAgICAgICAgJ2dldFN0YXRpc3RpY3MnLFxuICAgICAgICAgICAgICAgICdnZXRUZXJtaW5hbExpc3QnLFxuICAgICAgICAgICAgICAgICdnZXRHcmlkTGlzdCcsXG4gICAgICAgICAgICAgICAgJ2dldEdyaWRTdGF0aXN0aWNzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnZ2V0SW5zdHJ1bWVudHMnLFxuICAgICAgICAgICAgICAgICdnZXRCZXN0UHJpY2VzJyxcbiAgICAgICAgICAgICAgICAnZ2V0TWFya2V0RGVwdGgnLFxuICAgICAgICAgICAgICAgICdlc3RpbWF0ZU1hcmtldE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnZ2V0VHJhZGVkUHJpY2VWb2x1bWUnLFxuICAgICAgICAgICAgICAgICdnZXRSYXdUcmFkZURhdGEnLFxuICAgICAgICAgICAgICAgICdnZXRTdGF0aXN0aWNzJyxcbiAgICAgICAgICAgICAgICAnZ2V0VGVybWluYWxMaXN0JyxcbiAgICAgICAgICAgICAgICAnZ2V0R3JpZExpc3QnLFxuICAgICAgICAgICAgICAgICdnZXRHcmlkU3RhdGlzdGljcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnZ2V0QmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdnZXRDb21taXNzaW9uRGlzY291bnQnLFxuICAgICAgICAgICAgICAgICdnZXRPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdnZXRUcmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICdwbGFjZU9yZGVyJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnY2FuY2VsT3JkZXInLFxuICAgICAgICAgICAgICAgICdnZXRCYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2dldENvbW1pc3Npb25EaXNjb3VudCcsXG4gICAgICAgICAgICAgICAgJ2dldE9yZGVycycsXG4gICAgICAgICAgICAgICAgJ2dldFRyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICAgICAgJ3BsYWNlT3JkZXInLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0SW5zdHJ1bWVudHMgKCk7XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHByb2R1Y3RzWydyZXN1bHQnXSk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWydyZXN1bHQnXVtrZXlzW3BdXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ2luc3RydW1lbnRJRCddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IHByb2R1Y3RbJ3N5bWJvbCddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0Wydsb25nQ3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ3Nob3J0Q3VycmVuY3knXTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RHZXRCYWxhbmNlcyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hCZXN0UHJpY2VzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY1Bvc3RHZXRCZXN0UHJpY2VzICh7XG4gICAgICAgICAgICAnc3ltYm9scyc6IFsgdGhpcy5zeW1ib2wgKHByb2R1Y3QpIF0sXG4gICAgICAgIH0pO1xuICAgIH0sIFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNQb3N0R2V0TWFya2V0RGVwdGggKHtcbiAgICAgICAgICAgICdzeW1ib2xzJzogWyB0aGlzLnN5bWJvbCAocHJvZHVjdCkgXSxcbiAgICAgICAgICAgICdidXlEZXB0aCc6IDEwMCxcbiAgICAgICAgICAgICdzZWxsRGVwdGgnOiAxMDAsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBlbmQgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHN0YXJ0ID0gZW5kIC0gODY0MDAwMDA7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VHJhZGVkUHJpY2VWb2x1bWUgKHtcbiAgICAgICAgICAgICdpbnN0cnVtZW50JzogdGhpcy5zeW1ib2wgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2VuZERhdGUnOiB0aGlzLnl5eXltbWRkaGhtbXNzIChlbmQpLFxuICAgICAgICAgICAgJ3N0YXJ0RGF0ZSc6IHRoaXMueXl5eW1tZGRoaG1tc3MgKHN0YXJ0KSxcbiAgICAgICAgICAgICdITE9DJzogMSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXJzID0gcmVzcG9uc2VbJ3Jlc3VsdCddWydwcmljZVZvbHVtZUxpc3QnXTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAodGlja2Vycyk7XG4gICAgICAgIGxldCBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgbGV0IGxhc3RLZXkgPSBrZXlzW2xlbmd0aCAtIDFdO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1tsYXN0S2V5XTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhc2snOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogcGFyc2VGbG9hdCAodGlja2VyWydjbG9zZSddKSxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG9uZ1ZvbHVtZSddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2hvcnRWb2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0UmF3VHJhZGVEYXRhICh7XG4gICAgICAgICAgICAnaW5zdHJ1bWVudCc6IHRoaXMuc3ltYm9sIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0aW1lc3Bhbic6IDM2MDAsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2luc3RydW1lbnQnOiB0aGlzLnN5bWJvbCAocHJvZHVjdCksXG4gICAgICAgICAgICAnb3JkZXJUeXBlJzogc2lkZS50b1VwcGVyQ2FzZSAoKSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFBsYWNlT3JkZXIgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddW3R5cGVdO1xuICAgICAgICBsZXQgYXV0aCA9IHt9O1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgYXV0aFsna2V5J10gPSB0aGlzLmFwaUtleTtcbiAgICAgICAgICAgIGF1dGhbJ3VzZXInXSA9IHRoaXMubG9naW47XG4gICAgICAgICAgICBhdXRoWydwYXNzJ10gPSB0aGlzLnBhc3N3b3JkO1xuICAgICAgICB9XG4gICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgIGlmIChtZXRob2QgPT0gJ0dFVCcpIHtcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHsgXG4gICAgICAgICAgICAgICAgJ21ldGhvZCc6IHBhdGgsIFxuICAgICAgICAgICAgICAgICdpZCc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgYXV0aCwgcGFyYW1zKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH07XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHsgXG4gICAgICAgICAgICAgICAgJ21ldGhvZCc6IHBhdGgsIFxuICAgICAgICAgICAgICAgICdwYXJhbXMnOiB0aGlzLmV4dGVuZCAoYXV0aCwgcGFyYW1zKSxcbiAgICAgICAgICAgICAgICAnaWQnOiBub25jZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgeW9iaXQgPSB7XG5cbiAgICAnaWQnOiAneW9iaXQnLFxuICAgICduYW1lJzogJ1lvQml0JyxcbiAgICAnY291bnRyaWVzJzogJ1JVJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCwgLy8gcmVzcG9uc2VzIGFyZSBjYWNoZWQgZXZlcnkgMiBzZWNvbmRzXG4gICAgJ3ZlcnNpb24nOiAnMycsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY5MTAtY2RjYmZkYWUtNWVlYS0xMWU3LTk4NTktMDNmZWE4NzMyNzJkLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly95b2JpdC5uZXQnLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LnlvYml0Lm5ldCcsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly93d3cueW9iaXQubmV0L2VuL2FwaS8nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2RlcHRoL3twYWlyc30nLFxuICAgICAgICAgICAgICAgICdpbmZvJyxcbiAgICAgICAgICAgICAgICAndGlja2VyL3twYWlyc30nLFxuICAgICAgICAgICAgICAgICd0cmFkZXMve3BhaXJzfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAndGFwaSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdBY3RpdmVPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdDYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0dldERlcG9zaXRBZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnZ2V0SW5mbycsXG4gICAgICAgICAgICAgICAgJ09yZGVySW5mbycsXG4gICAgICAgICAgICAgICAgJ1RyYWRlJywgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ1RyYWRlSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ1dpdGhkcmF3Q29pbnNUb0FkZHJlc3MnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMuYXBpR2V0SW5mbyAoKTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAocHJvZHVjdHNbJ3BhaXJzJ10pO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwga2V5cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IGlkID0ga2V5c1twXTtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3BhaXJzJ11baWRdO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGlkLnRvVXBwZXJDYXNlICgpLnJlcGxhY2UgKCdfJywgJy8nKTtcbiAgICAgICAgICAgIGxldCBbIGJhc2UsIHF1b3RlIF0gPSBzeW1ib2wuc3BsaXQgKCcvJyk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcGlQb3N0R2V0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5hcGlHZXREZXB0aFBhaXJzICh7XG4gICAgICAgICAgICAncGFpcnMnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHRpY2tlcnMgPSBhd2FpdCB0aGlzLmFwaUdldFRpY2tlclBhaXJzICh7XG4gICAgICAgICAgICAncGFpcnMnOiBwWydpZCddLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHRpY2tlcnNbcFsnaWQnXV07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3VwZGF0ZWQnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2F2ZyddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2xfY3VyJ10pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBpR2V0VHJhZGVzUGFpcnMgKHtcbiAgICAgICAgICAgICdwYWlycyc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0JylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAodGhpcy5pZCArICcgYWxsb3dzIGxpbWl0IG9yZGVycyBvbmx5Jyk7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcGlQb3N0VHJhZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncmF0ZSc6IHByaWNlLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsT3JkZXIgKGlkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy50YXBpUG9zdENhbmNlbE9yZGVyICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ29yZGVyX2lkJzogaWQsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ2FwaScsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHR5cGU7XG4gICAgICAgIGlmICh0eXBlID09ICdhcGknKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7ICdtZXRob2QnOiBwYXRoLCAnbm9uY2UnOiBub25jZSB9LCBwYXJhbXMpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ3NpZ24nOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgemFpZiA9IHtcblxuICAgICdpZCc6ICd6YWlmJyxcbiAgICAnbmFtZSc6ICdaYWlmJyxcbiAgICAnY291bnRyaWVzJzogJ0pQJyxcbiAgICAncmF0ZUxpbWl0JzogMzAwMCxcbiAgICAndmVyc2lvbic6ICcxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjkyNy0zOWNhMmFkYS01ZWViLTExZTctOTcyZi0xYjQxOTk1MThjYTYuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS56YWlmLmpwJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3phaWYuanAnLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vY29ycC56YWlmLmpwL2FwaS1kb2NzJyxcbiAgICAgICAgICAgICdodHRwczovL2NvcnAuemFpZi5qcC9hcGktZG9jcy9hcGlfbGlua3MnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3phaWYuanAnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS95b3UyMTk3OS9ub2RlLXphaWYnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2RlcHRoL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2N1cnJlbmNpZXMve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnY3VycmVuY2llcy9hbGwnLFxuICAgICAgICAgICAgICAgICdjdXJyZW5jeV9wYWlycy97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdjdXJyZW5jeV9wYWlycy9hbGwnLFxuICAgICAgICAgICAgICAgICdsYXN0X3ByaWNlL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3RpY2tlci97cGFpcn0nLFxuICAgICAgICAgICAgICAgICd0cmFkZXMve3BhaXJ9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICd0YXBpJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2FjdGl2ZV9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXInLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0X2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdnZXRfaWRfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2dldF9pbmZvJyxcbiAgICAgICAgICAgICAgICAnZ2V0X2luZm8yJyxcbiAgICAgICAgICAgICAgICAnZ2V0X3BlcnNvbmFsX2luZm8nLFxuICAgICAgICAgICAgICAgICd0cmFkZScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2hpc3RvcnknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ2VjYXBpJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZUludm9pY2UnLFxuICAgICAgICAgICAgICAgICdnZXRJbnZvaWNlJyxcbiAgICAgICAgICAgICAgICAnZ2V0SW52b2ljZUlkc0J5T3JkZXJOdW1iZXInLFxuICAgICAgICAgICAgICAgICdjYW5jZWxJbnZvaWNlJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLmFwaUdldEN1cnJlbmN5UGFpcnNBbGwgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1twXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ2N1cnJlbmN5X3BhaXInXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBwcm9kdWN0WyduYW1lJ107XG4gICAgICAgICAgICBsZXQgWyBiYXNlLCBxdW90ZSBdID0gc3ltYm9sLnNwbGl0ICgnLycpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50YXBpUG9zdEdldEluZm8gKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMuYXBpR2V0RGVwdGhQYWlyICAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLmFwaUdldFRpY2tlclBhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFwaUdldFRyYWRlc1BhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICh0aGlzLmlkICsgJyBhbGxvd3MgbGltaXQgb3JkZXJzIG9ubHknKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFwaVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeV9wYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2FjdGlvbic6IChzaWRlID09ICdidXknKSA/ICdiaWQnIDogJ2FzaycsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcGlQb3N0Q2FuY2VsT3JkZXIgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnb3JkZXJfaWQnOiBpZCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAnYXBpJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdHlwZTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2FwaScpIHtcbiAgICAgICAgICAgIHVybCArPSAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdtZXRob2QnOiBwYXRoLFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAnS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1NpZ24nOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG52YXIgbWFya2V0cyA9IHtcblxuICAgICdfMWJyb2tlcic6ICAgIF8xYnJva2VyLFxuICAgICdfMWJ0Y3hlJzogICAgIF8xYnRjeGUsXG4gICAgJ2FueHBybyc6ICAgICAgYW54cHJvLFxuICAgICdiaXQyYyc6ICAgICAgIGJpdDJjLFxuICAgICdiaXRiYXknOiAgICAgIGJpdGJheSxcbiAgICAnYml0YmF5cyc6ICAgICBiaXRiYXlzLFxuICAgICdiaXRjb2luY29pZCc6IGJpdGNvaW5jb2lkLFxuICAgICdiaXRmaW5leCc6ICAgIGJpdGZpbmV4LFxuICAgICdiaXRsaXNoJzogICAgIGJpdGxpc2gsXG4gICAgJ2JpdG1hcmtldCc6ICAgYml0bWFya2V0LFxuICAgICdiaXRtZXgnOiAgICAgIGJpdG1leCxcbiAgICAnYml0c28nOiAgICAgICBiaXRzbyxcbiAgICAnYml0c3RhbXAnOiAgICBiaXRzdGFtcCxcbiAgICAnYml0dHJleCc6ICAgICBiaXR0cmV4LFxuICAgICdidGNjaGluYSc6ICAgIGJ0Y2NoaW5hLFxuICAgICdidGNlJzogICAgICAgIGJ0Y2UsXG4gICAgJ2J0Y3gnOiAgICAgICAgYnRjeCxcbiAgICAnYnhpbnRoJzogICAgICBieGludGgsXG4gICAgJ2NjZXgnOiAgICAgICAgY2NleCxcbiAgICAnY2V4JzogICAgICAgICBjZXgsXG4gICAgJ2NvaW5jaGVjayc6ICAgY29pbmNoZWNrLFxuICAgICdjb2lubWF0ZSc6ICAgIGNvaW5tYXRlLFxuICAgICdjb2luc2VjdXJlJzogIGNvaW5zZWN1cmUsXG4gICAgJ2V4bW8nOiAgICAgICAgZXhtbyxcbiAgICAnZnlic2UnOiAgICAgICBmeWJzZSxcbiAgICAnZnlic2cnOiAgICAgICBmeWJzZyxcbiAgICAnZ2RheCc6ICAgICAgICBnZGF4LFxuICAgICdnZW1pbmknOiAgICAgIGdlbWluaSxcbiAgICAnaGl0YnRjJzogICAgICBoaXRidGMsXG4gICAgJ2h1b2JpJzogICAgICAgaHVvYmksXG4gICAgJ2l0Yml0JzogICAgICAgaXRiaXQsXG4gICAgJ2p1YmknOiAgICAgICAganViaSxcbiAgICAna3Jha2VuJzogICAgICBrcmFrZW4sXG4gICAgJ2x1bm8nOiAgICAgICAgbHVubyxcbiAgICAnbWVyY2Fkbyc6ICAgICBtZXJjYWRvLFxuICAgICdva2NvaW5jbnknOiAgIG9rY29pbmNueSxcbiAgICAnb2tjb2ludXNkJzogICBva2NvaW51c2QsXG4gICAgJ3BheW1pdW0nOiAgICAgcGF5bWl1bSxcbiAgICAncG9sb25pZXgnOiAgICBwb2xvbmlleCxcbiAgICAncXVhZHJpZ2FjeCc6ICBxdWFkcmlnYWN4LFxuICAgICdxdW9pbmUnOiAgICAgIHF1b2luZSxcbiAgICAndGhlcm9jayc6ICAgICB0aGVyb2NrLFxuICAgICd2YXVsdG9ybyc6ICAgIHZhdWx0b3JvLFxuICAgICd2aXJ3b3gnOiAgICAgIHZpcndveCxcbiAgICAneW9iaXQnOiAgICAgICB5b2JpdCxcbiAgICAnemFpZic6ICAgICAgICB6YWlmLFxufVxuXG5sZXQgZGVmaW5lQWxsTWFya2V0cyA9IGZ1bmN0aW9uIChtYXJrZXRzKSB7XG4gICAgbGV0IHJlc3VsdCA9IHt9XG4gICAgZm9yIChsZXQgaWQgaW4gbWFya2V0cylcbiAgICAgICAgcmVzdWx0W2lkXSA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWFya2V0IChleHRlbmQgKG1hcmtldHNbaWRdLCBwYXJhbXMpKVxuICAgICAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxufVxuXG5pZiAoaXNOb2RlKVxuICAgIG1vZHVsZS5leHBvcnRzID0gZGVmaW5lQWxsTWFya2V0cyAobWFya2V0cylcbmVsc2VcbiAgICB3aW5kb3cuY2N4dCA9IGRlZmluZUFsbE1hcmtldHMgKG1hcmtldHMpXG5cbn0pICgpIl19