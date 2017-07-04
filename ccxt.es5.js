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
            return this.privateGetMarketQuotes({
                'symbols': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            return this.privateGetMarketBars({
                'symbol': this.productId(product),
                'resolution': 60,
                'limit': 1
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
            var query = this.extend({ 'token': this.apiKey || this.token }, params);
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
            return this.publicGetOrderBook({
                'currency': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this11 = this;

            return Promise.resolve().then(function () {
                return _this11.publicGetStats({
                    'currency': _this11.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['stats'];
                timestamp = _this11.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this11.iso8601(timestamp),
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
            return this.publicGetCurrencyPairMoneyDepthFull({
                'currency_pair': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this12 = this;

            return Promise.resolve().then(function () {
                return _this12.publicGetCurrencyPairMoneyTicker({
                    'currency_pair': _this12.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['data'];
                timestamp = parseInt(ticker['dataUpdateTime'] / 1000);

                return {
                    'timestamp': timestamp,
                    'datetime': _this12.iso8601(timestamp),
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
            return this.publicGetExchangesPairOrderbook({
                'pair': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this13 = this;

            return Promise.resolve().then(function () {
                return _this13.publicGetExchangesPairTicker({
                    'pair': _this13.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this13.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this13.iso8601(timestamp),
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
            return this.publicGetIdOrderbook({
                'id': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this14 = this;

            return Promise.resolve().then(function () {
                return _this14.publicGetIdTicker({
                    'id': _this14.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this14.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this14.iso8601(timestamp),
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
        'countries': ['CN', 'UK', 'HK', 'AU', 'CA'],
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
            return this.publicGetDepth({
                'market': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this15 = this;

            return Promise.resolve().then(function () {
                return _this15.publicGetTicker({
                    'market': _this15.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['result'];
                timestamp = _this15.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this15.iso8601(timestamp),
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
            return this.publicGetPairDepth({
                'pair': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var pair,
                response,
                ticker,
                timestamp,
                baseVolume,
                quoteVolume,
                _this16 = this;

            return Promise.resolve().then(function () {
                pair = _this16.product(product);
                return _this16.publicGetPairTicker({
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
                    'datetime': _this16.iso8601(timestamp),
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
                _this17 = this;

            return Promise.resolve().then(function () {
                return _this17.publicGetSymbolsDetails();
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
            return this.publicGetBookSymbol({
                'symbol': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this18 = this;

            return Promise.resolve().then(function () {
                return _this18.publicGetPubtickerSymbol({
                    'symbol': _this18.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = parseFloat(ticker['timestamp']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this18.iso8601(timestamp),
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
        'countries': ['UK', 'EU', 'RU'],
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
                _this19 = this;

            return Promise.resolve().then(function () {
                return _this19.publicGetPairs();
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
                _this20 = this;

            return Promise.resolve().then(function () {
                p = _this20.product(product);
                return _this20.publicGetTickers();
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers[p['id']];
                timestamp = _this20.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this20.iso8601(timestamp),
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
            return this.publicGetTradesDepth({
                'pair_id': this.productId(product)
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
            return this.publicGetJsonMarketOrderbook({
                'market': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this21 = this;

            return Promise.resolve().then(function () {
                return _this21.publicGetJsonMarketTicker({
                    'market': _this21.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this21.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this21.iso8601(timestamp),
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
                _this22 = this;

            return Promise.resolve().then(function () {
                return _this22.publicGetInstrumentActive();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products.length; p++) {
                    product = products[p];
                    id = product['symbol'];
                    base = product['underlying'];
                    quote = product['quoteCurrency'];
                    isFuturesContract = id != base + quote;

                    base = _this22.commonCurrencyCode(base);
                    quote = _this22.commonCurrencyCode(quote);
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
            return this.publicGetOrderBookL2({
                'symbol': this.productId(product)
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
                _this23 = this;

            return Promise.resolve().then(function () {
                request = {
                    'symbol': _this23.productId(product),
                    'binSize': '1d',
                    'partial': true,
                    'count': 1,
                    'reverse': true
                };
                return _this23.publicGetQuoteBucketed(request);
            }).then(function (_resp) {
                quotes = _resp;
                quotesLength = quotes.length;
                quote = quotes[quotesLength - 1];
                return _this23.publicGetTradeBucketed(request);
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers[0];
                timestamp = _this23.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this23.iso8601(timestamp),
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
                _this24 = this;

            return Promise.resolve().then(function () {
                return _this24.publicGetAvailableBooks();
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
            return this.publicGetOrderBook({
                'book': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this25 = this;

            return Promise.resolve().then(function () {
                return _this25.publicGetTicker({
                    'book': _this25.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['payload'];
                timestamp = _this25.parse8601(ticker['created_at']);

                return {
                    'timestamp': timestamp,
                    'datetime': _this25.iso8601(timestamp),
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
        'countries': 'UK',
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
            return this.publicGetOrderBookId({
                'id': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this26 = this;

            return Promise.resolve().then(function () {
                return _this26.publicGetTickerId({
                    'id': _this26.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = parseInt(ticker['timestamp']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this26.iso8601(timestamp),
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
                _this27 = this;

            return Promise.resolve().then(function () {
                return _this27.publicGetMarkets();
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
            return this.publicGetOrderbook({
                'market': this.productId(product),
                'type': 'both',
                'depth': 50
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this28 = this;

            return Promise.resolve().then(function () {
                return _this28.publicGetMarketsummary({
                    'market': _this28.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['result'][0];
                timestamp = _this28.parse8601(ticker['TimeStamp']);

                return {
                    'timestamp': timestamp,
                    'datetime': _this28.iso8601(timestamp),
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
                _this29 = this;

            return Promise.resolve().then(function () {
                return _this29.publicGetTicker({
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
            return this.publicGetOrderbook({
                'market': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                tickers,
                ticker,
                timestamp,
                _this30 = this;

            return Promise.resolve().then(function () {
                p = _this30.product(product);
                return _this30.publicGetTicker({
                    'market': p['id']
                });
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers['ticker'];
                timestamp = ticker['date'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this30.iso8601(timestamp),
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
            var p = this.product(product);
            return this.publicGetDepthIdLimit({
                'id': this.productId(product),
                'limit': 1000
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this31 = this;

            return Promise.resolve().then(function () {
                return _this31.publicGetTickerId({
                    'id': _this31.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['time'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this31.iso8601(timestamp),
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
                _this32 = this;

            return Promise.resolve().then(function () {
                return _this32.publicGetPairing();
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
            return this.publicGetOrderbook({
                'pairing': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                tickers,
                ticker,
                timestamp,
                _this33 = this;

            return Promise.resolve().then(function () {
                p = _this33.product(product);
                return _this33.publicGet({ 'pairing': p['id'] });
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers[p['id']];
                timestamp = _this33.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this33.iso8601(timestamp),
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
                _this34 = this;

            return Promise.resolve().then(function () {
                return _this34.publicGetMarkets();
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
            return this.publicGetOrderbook({
                'market': this.productId(product),
                'type': 'both',
                'depth': 100
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this35 = this;

            return Promise.resolve().then(function () {
                return _this35.tickersGetMarket({
                    'market': _this35.productId(product).toLowerCase()
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['ticker'];
                timestamp = ticker['updated'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this35.iso8601(timestamp),
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
        'countries': ['UK', 'EU', 'CY', 'RU'],
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
                _this36 = this;

            return Promise.resolve().then(function () {
                return _this36.publicGetCurrencyLimits();
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
            return this.publicGetOrderBookPair({
                'pair': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this37 = this;

            return Promise.resolve().then(function () {
                return _this37.publicGetTickerPair({
                    'pair': _this37.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = parseInt(ticker['timestamp']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this37.iso8601(timestamp),
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
            return this.publicGetOrderBooks();
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this38 = this;

            return Promise.resolve().then(function () {
                return _this38.publicGetTicker();
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['timestamp'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this38.iso8601(timestamp),
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
        'countries': ['UK', 'CZ'], // UK, Czech Republic
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
            return this.publicGetOrderBook({
                'currencyPair': this.productId(product),
                'groupByPriceLimit': 'False'
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this39 = this;

            return Promise.resolve().then(function () {
                return _this39.publicGetTicker({
                    'currencyPair': _this39.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['data'];
                timestamp = ticker['timestamp'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this39.iso8601(timestamp),
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
            return this.publicGetExchangeAskOrders();
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this40 = this;

            return Promise.resolve().then(function () {
                return _this40.publicGetExchangeTicker();
            }).then(function (_resp) {
                response = _resp;
                ticker = response['message'];
                timestamp = ticker['timestamp'];

                return {
                    'timestamp': timestamp,
                    'datetime': _this40.iso8601(timestamp),
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
                _this41 = this;

            return Promise.resolve().then(function () {
                return _this41.publicGetPairSettings();
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
            return this.publicGetOrderBook({
                'pair': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                p,
                ticker,
                timestamp,
                _this42 = this;

            return Promise.resolve().then(function () {
                return _this42.publicGetTicker();
            }).then(function (_resp) {
                response = _resp;
                p = _this42.product(product);
                ticker = response[p['id']];
                timestamp = ticker['updated'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this42.iso8601(timestamp),
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
            return this.publicGetOrderbook();
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this43 = this;

            return Promise.resolve().then(function () {
                return _this43.publicGetTickerdetailed();
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this43.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this43.iso8601(timestamp),
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
                _this44 = this;

            return Promise.resolve().then(function () {
                return _this44.publicGetProducts();
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
            return this.publicGetProductsIdBook({
                'id': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                ticker,
                quote,
                timestamp,
                _this45 = this;

            return Promise.resolve().then(function () {
                p = _this45.product(product);
                return _this45.publicGetProductsIdTicker({
                    'id': p['id']
                });
            }).then(function (_resp) {
                ticker = _resp;
                return _this45.publicGetProductsIdStats({
                    'id': p['id']
                });
            }).then(function (_resp) {
                quote = _resp;
                timestamp = _this45.parse8601(ticker['time']);

                return {
                    'timestamp': timestamp,
                    'datetime': _this45.iso8601(timestamp),
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
                'symbol': this.productId(product)
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
                _this46 = this;

            return Promise.resolve().then(function () {
                return _this46.publicGetSymbols();
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
            return this.publicGetSymbolOrderbook({
                'symbol': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this47 = this;

            return Promise.resolve().then(function () {
                return _this47.publicGetSymbolTicker({
                    'symbol': _this47.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['timestamp'];

                return {
                    'timestamp': timestamp,
                    'datetime': _this47.iso8601(timestamp),
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
            var p = this.product(product);
            var method = p['type'] + 'GetDepthId';
            return this[method]({ 'id': p['id'] });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                method,
                response,
                ticker,
                timestamp,
                _this48 = this;

            return Promise.resolve().then(function () {
                p = _this48.product(product);
                method = p['type'] + 'GetTickerId';
                return _this48[method]({ 'id': p['id'] });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['ticker'];
                timestamp = parseInt(response['time']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this48.iso8601(timestamp),
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
            return this.publicGetDepth({
                'coin': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this49 = this;

            return Promise.resolve().then(function () {
                return _this49.publicGetTicker({
                    'coin': _this49.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this49.milliseconds();

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
                _this50 = this;

            return Promise.resolve().then(function () {
                return _this50.publicGetAssetPairs();
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
                    }base = _this50.commonCurrencyCode(base);
                    quote = _this50.commonCurrencyCode(quote);
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
            return this.publicGetDepth({
                'pair': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                response,
                ticker,
                timestamp,
                _this51 = this;

            return Promise.resolve().then(function () {
                p = _this51.product(product);
                return _this51.publicGetTicker({
                    'pair': p['id']
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['result'][p['id']];
                timestamp = _this51.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this51.iso8601(timestamp),
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
        'countries': ['UK', 'SG', 'ZA'],
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
                _this52 = this;

            return Promise.resolve().then(function () {
                return _this52.publicGetTickers();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products['tickers'].length; p++) {
                    product = products['tickers'][p];
                    id = product['pair'];
                    base = id.slice(0, 3);
                    quote = id.slice(3, 6);

                    base = _this52.commonCurrencyCode(base);
                    quote = _this52.commonCurrencyCode(quote);
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
            return this.publicGetOrderbook({
                'pair': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this53 = this;

            return Promise.resolve().then(function () {
                return _this53.publicGetTicker({
                    'pair': _this53.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['timestamp'];

                return {
                    'timestamp': timestamp,
                    'datetime': _this53.iso8601(timestamp),
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
            return this.publicGetDepth({
                'symbol': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var response,
                ticker,
                timestamp,
                _this54 = this;

            return Promise.resolve().then(function () {
                return _this54.publicGetTicker({
                    'symbol': _this54.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['ticker'];
                timestamp = parseInt(response['date']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this54.iso8601(timestamp),
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
            return this.publicGetDataIdDepth({
                'id': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this55 = this;

            return Promise.resolve().then(function () {
                return _this55.publicGetDataIdTicker({
                    'id': _this55.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['at'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this55.iso8601(timestamp),
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
                _this56 = this;

            return Promise.resolve().then(function () {
                return _this56.publicGetReturnTicker();
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
            return this.publicGetReturnOrderBook({
                'currencyPair': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                tickers,
                ticker,
                timestamp,
                _this57 = this;

            return Promise.resolve().then(function () {
                p = _this57.product(product);
                return _this57.publicGetReturnTicker();
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers[p['id']];
                timestamp = _this57.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this57.iso8601(timestamp),
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
            return this.publicGetOrderBook({
                'book': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this58 = this;

            return Promise.resolve().then(function () {
                return _this58.publicGetTicker({
                    'book': _this58.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = parseInt(ticker['timestamp']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this58.iso8601(timestamp),
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
                _this59 = this;

            return Promise.resolve().then(function () {
                return _this59.publicGetProducts();
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
            return this.publicGetProductsIdPriceLevels({
                'id': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this60 = this;

            return Promise.resolve().then(function () {
                return _this60.publicGetProductsId({
                    'id': _this60.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this60.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this60.iso8601(timestamp),
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
                _this61 = this;

            return Promise.resolve().then(function () {
                return _this61.publicGetFundsTickers();
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
            return this.publicGetFundsIdOrderbook({
                'id': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this62 = this;

            return Promise.resolve().then(function () {
                return _this62.publicGetFundsIdTicker({
                    'id': _this62.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this62.parse8601(ticker['date']);

                return {
                    'timestamp': timestamp,
                    'datetime': _this62.iso8601(timestamp),
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
                _this63 = this;

            return Promise.resolve().then(function () {
                result = [];
                return _this63.publicGetMarkets();
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
            return this.publicGetOrderbook();
        },
        fetchTicker: function fetchTicker(product) {
            var quote,
                bidsLength,
                bid,
                ask,
                response,
                ticker,
                timestamp,
                _this64 = this;

            return Promise.resolve().then(function () {
                return _this64.publicGetBidandask();
            }).then(function (_resp) {
                quote = _resp;
                bidsLength = quote['bids'].length;
                bid = quote['bids'][bidsLength - 1];
                ask = quote['asks'][0];
                return _this64.publicGetMarkets();
            }).then(function (_resp) {
                response = _resp;
                ticker = response['data'];
                timestamp = _this64.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this64.iso8601(timestamp),
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
                _this65 = this;

            return Promise.resolve().then(function () {
                return _this65.publicGetInstruments();
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
            return this.publicPostGetMarketDepth({
                'symbols': [this.symbol(product)],
                'buyDepth': 100,
                'sellDepth': 100
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
                _this66 = this;

            return Promise.resolve().then(function () {
                end = _this66.milliseconds();
                start = end - 86400000;
                return _this66.publicGetTradedPriceVolume({
                    'instrument': _this66.symbol(product),
                    'endDate': _this66.yyyymmddhhmmss(end),
                    'startDate': _this66.yyyymmddhhmmss(start),
                    'HLOC': 1
                });
            }).then(function (_resp) {
                response = _resp;
                tickers = response['result']['priceVolumeList'];
                keys = Object.keys(tickers);
                length = keys.length;
                lastKey = keys[length - 1];
                ticker = tickers[lastKey];
                timestamp = _this66.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this66.iso8601(timestamp),
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
                _this67 = this;

            return Promise.resolve().then(function () {
                return _this67.apiGetInfo();
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
            return this.apiGetDepthPairs({
                'pairs': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                tickers,
                ticker,
                timestamp,
                _this68 = this;

            return Promise.resolve().then(function () {
                p = _this68.product(product);
                return _this68.apiGetTickerPairs({
                    'pairs': p['id']
                });
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers[p['id']];
                timestamp = ticker['updated'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this68.iso8601(timestamp),
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
                _this69 = this;

            return Promise.resolve().then(function () {
                return _this69.apiGetCurrencyPairsAll();
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
            return this.apiGetDepthPair({
                'pair': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this70 = this;

            return Promise.resolve().then(function () {
                return _this70.apiGetTickerPair({
                    'pair': _this70.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this70.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this70.iso8601(timestamp),
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
        'hitbtc': hitbtc,
        'huobi': huobi,
        'jubi': jubi,
        'kraken': kraken,
        'luno': luno,
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBc0JWLG9CQUFlLFFBdEJMO0FBdUJWLHNCQUFlLFVBdkJMO0FBd0JWLGdCQUFlLElBeEJMO0FBeUJWLGlCQUFlLEtBekJMO0FBMEJWLGlCQUFlLEtBMUJMO0FBMkJWLGdCQUFlLElBM0JMO0FBNEJWLGtCQUFlLE1BNUJMO0FBNkJWLGlCQUFlLEtBN0JMO0FBOEJWLGdCQUFlLElBOUJMO0FBK0JWLGtCQUFlLE1BL0JMO0FBZ0NWLGdCQUFlLElBaENMO0FBaUNWLHFCQUFlLFNBakNMO0FBa0NWLHFCQUFlLFNBbENMO0FBbUNWLG1CQUFlLE9BbkNMO0FBb0NWLG9CQUFlLFFBcENMO0FBcUNWLHNCQUFlLFVBckNMO0FBc0NWLGtCQUFlLE1BdENMO0FBdUNWLG1CQUFlLE9BdkNMO0FBd0NWLG9CQUFlLFFBeENMO0FBeUNWLGtCQUFlLE1BekNMO0FBMENWLGlCQUFlLEtBMUNMO0FBMkNWLGdCQUFlO0FBM0NMLEtBQWQ7O0FBOENBLFFBQUksbUJBQW1CLFNBQW5CLGdCQUFtQixDQUFVLE9BQVYsRUFBbUI7QUFDdEMsWUFBSSxTQUFTLEVBQWI7O0FBRHNDLHFDQUU3QixFQUY2QjtBQUdsQyxtQkFBTyxFQUFQLElBQWEsVUFBVSxNQUFWLEVBQWtCO0FBQzNCLHVCQUFPLElBQUksTUFBSixDQUFZLE9BQVEsUUFBUSxFQUFSLENBQVIsRUFBcUIsTUFBckIsQ0FBWixDQUFQO0FBQ0gsYUFGRDtBQUhrQzs7QUFFdEMsYUFBSyxJQUFJLEVBQVQsSUFBZSxPQUFmO0FBQUEsbUJBQVMsRUFBVDtBQUFBLFNBSUEsT0FBTyxNQUFQO0FBQ0gsS0FQRDs7QUFTQSxRQUFJLE1BQUosRUFDSSxPQUFPLE9BQVAsR0FBaUIsaUJBQWtCLE9BQWxCLENBQWpCLENBREosS0FHSSxPQUFPLElBQVAsR0FBYyxpQkFBa0IsT0FBbEIsQ0FBZDtBQUVILENBcjVNRCIsImZpbGUiOiJjY3h0LmVzNS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG4oZnVuY3Rpb24gKCkge1xuXG52YXIgaXNOb2RlID0gKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBjYXBpdGFsaXplID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcubGVuZ3RoID8gKHN0cmluZy5jaGFyQXQgKDApLnRvVXBwZXJDYXNlICgpICsgc3RyaW5nLnNsaWNlICgxKSkgOiBzdHJpbmdcbn1cblxudmFyIGtleXNvcnQgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge31cbiAgICBPYmplY3Qua2V5cyAob2JqZWN0KS5zb3J0ICgpLmZvckVhY2ggKGtleSA9PiByZXN1bHRba2V5XSA9IG9iamVjdFtrZXldKVxuICAgIHJldHVybiByZXN1bHRcbn1cblxudmFyIGV4dGVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxuICAgICAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1tpXSA9PT0gJ29iamVjdCcpXG4gICAgICAgICAgICBPYmplY3Qua2V5cyAoYXJndW1lbnRzW2ldKS5mb3JFYWNoIChrZXkgPT5cbiAgICAgICAgICAgICAgICAocmVzdWx0W2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XSkpXG4gICAgcmV0dXJuIHJlc3VsdFxufVxuXG52YXIgb21pdCA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICB2YXIgcmVzdWx0ID0gZXh0ZW5kIChvYmplY3QpXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXG4gICAgICAgIGlmICh0eXBlb2YgYXJndW1lbnRzW2ldID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgIGRlbGV0ZSByZXN1bHRbYXJndW1lbnRzW2ldXVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5IChhcmd1bWVudHNbaV0pKVxuICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBhcmd1bWVudHNbaV0ubGVuZ3RoOyBrKyspXG4gICAgICAgICAgICAgICAgZGVsZXRlIHJlc3VsdFthcmd1bWVudHNbaV1ba11dXG4gICAgcmV0dXJuIHJlc3VsdFxufVxuXG52YXIgaW5kZXhCeSA9IGZ1bmN0aW9uIChhcnJheSwga2V5KSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge31cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKVxuICAgICAgICByZXN1bHRbYXJyYXlbaV1ba2V5XV0gPSBhcnJheVtpXVxuICAgIHJldHVybiByZXN1bHRcbn1cblxudmFyIGZsYXQgPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICByZXR1cm4gYXJyYXkucmVkdWNlICgoYWNjLCBjdXIpID0+IGFjYy5jb25jYXQgKGN1ciksIFtdKVxufVxuXG52YXIgdXJsZW5jb2RlID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyAob2JqZWN0KS5tYXAgKGtleSA9PiBcbiAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50IChrZXkpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50IChvYmplY3Rba2V5XSkpLmpvaW4gKCcmJylcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5pZiAoaXNOb2RlKSB7XG5cbiAgICBjb25zdCBjcnlwdG8gPSByZXF1aXJlICgnY3J5cHRvJylcbiAgICB2YXIgICBmZXRjaCAgPSByZXF1aXJlICgnbm9kZS1mZXRjaCcpXG5cbiAgICB2YXIgc3RyaW5nVG9CaW5hcnkgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBCdWZmZXIuZnJvbSAoc3RyaW5nLCAnYmluYXJ5JylcbiAgICB9XG5cbiAgICB2YXIgc3RyaW5nVG9CYXNlNjQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgQnVmZmVyIChzdHJpbmcpLnRvU3RyaW5nICgnYmFzZTY0JylcbiAgICB9XG5cbiAgICB2YXIgdXRmMTZUb0Jhc2U2NCA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZ1RvQmFzZTY0IChzdHJpbmcpXG4gICAgfVxuXG4gICAgdmFyIGJhc2U2NFRvQmluYXJ5ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20gKHN0cmluZywgJ2Jhc2U2NCcpXG4gICAgfVxuXG4gICAgdmFyIGJhc2U2NFRvU3RyaW5nID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20gKHN0cmluZywgJ2Jhc2U2NCcpLnRvU3RyaW5nICgpXG4gICAgfVxuXG4gICAgdmFyIGhhc2ggPSBmdW5jdGlvbiAocmVxdWVzdCwgaGFzaCA9ICdtZDUnLCBkaWdlc3QgPSAnaGV4Jykge1xuICAgICAgICByZXR1cm4gY3J5cHRvLmNyZWF0ZUhhc2ggKGhhc2gpLnVwZGF0ZSAocmVxdWVzdCkuZGlnZXN0IChkaWdlc3QpXG4gICAgfVxuXG4gICAgdmFyIGhtYWMgPSBmdW5jdGlvbiAocmVxdWVzdCwgc2VjcmV0LCBoYXNoID0gJ3NoYTI1NicsIGRpZ2VzdCA9ICdoZXgnKSB7XG4gICAgICAgIHJldHVybiBjcnlwdG8uY3JlYXRlSG1hYyAoaGFzaCwgc2VjcmV0KS51cGRhdGUgKHJlcXVlc3QpLmRpZ2VzdCAoZGlnZXN0KVxuICAgIH1cblxufSBlbHNlIHtcblxuICAgIHZhciBmZXRjaCA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMsIHZlcmJvc2UgPSBmYWxzZSkge1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSAoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAodmVyYm9zZSlcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyAodXJsLCBvcHRpb25zKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0ICgpXG4gICAgICAgICAgICB2YXIgbWV0aG9kID0gb3B0aW9ucy5tZXRob2QgfHwgJ0dFVCdcblxuICAgICAgICAgICAgeGhyLm9wZW4gKG1ldGhvZCwgdXJsLCB0cnVlKSAgICAgICAgICAgIFxuICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHsgXG4gICAgICAgICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT0gMjAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSAoeGhyLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAobWV0aG9kLCB1cmwsIHhoci5zdGF0dXMsIHhoci5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuaGVhZGVycyAhPSAndW5kZWZpbmVkJylcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBoZWFkZXIgaW4gb3B0aW9ucy5oZWFkZXJzKVxuICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlciAoaGVhZGVyLCBvcHRpb25zLmhlYWRlcnNbaGVhZGVyXSlcblxuICAgICAgICAgICAgeGhyLnNlbmQgKG9wdGlvbnMuYm9keSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICB2YXIgc3RyaW5nVG9CaW5hcnkgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBDcnlwdG9KUy5lbmMuTGF0aW4xLnBhcnNlIChzdHJpbmcpXG4gICAgfVxuXG4gICAgdmFyIHN0cmluZ1RvQmFzZTY0ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gQ3J5cHRvSlMuZW5jLkxhdGluMS5wYXJzZSAoc3RyaW5nKS50b1N0cmluZyAoQ3J5cHRvSlMuZW5jLkJhc2U2NClcbiAgICB9XG5cbiAgICB2YXIgdXRmMTZUb0Jhc2U2NCAgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBDcnlwdG9KUy5lbmMuVXRmMTYucGFyc2UgKHN0cmluZykudG9TdHJpbmcgKENyeXB0b0pTLmVuYy5CYXNlNjQpXG4gICAgfVxuXG4gICAgdmFyIGJhc2U2NFRvQmluYXJ5ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gQ3J5cHRvSlMuZW5jLkJhc2U2NC5wYXJzZSAoc3RyaW5nKVxuICAgIH1cblxuICAgIHZhciBiYXNlNjRUb1N0cmluZyA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIENyeXB0b0pTLmVuYy5CYXNlNjQucGFyc2UgKHN0cmluZykudG9TdHJpbmcgKENyeXB0b0pTLmVuYy5VdGY4KVxuICAgIH1cblxuICAgIHZhciBoYXNoID0gZnVuY3Rpb24gKHJlcXVlc3QsIGhhc2ggPSAnbWQ1JywgZGlnZXN0ID0gJ2hleCcpIHtcbiAgICAgICAgdmFyIGVuY29kaW5nID0gKGRpZ2VzdCA9PT0gJ2JpbmFyeScpID8gJ0xhdGluMScgOiBjYXBpdGFsaXplIChkaWdlc3QpXG4gICAgICAgIHJldHVybiBDcnlwdG9KU1toYXNoLnRvVXBwZXJDYXNlICgpXSAocmVxdWVzdCkudG9TdHJpbmcgKENyeXB0b0pTLmVuY1tlbmNvZGluZ10pXG4gICAgfVxuXG4gICAgdmFyIGhtYWMgPSBmdW5jdGlvbiAocmVxdWVzdCwgc2VjcmV0LCBoYXNoID0gJ3NoYTI1NicsIGRpZ2VzdCA9ICdoZXgnKSB7XG4gICAgICAgIHZhciBlbmNvZGluZyA9IChkaWdlc3QgPT09ICdiaW5hcnknKSA/ICdMYXRpbjEnIDogY2FwaXRhbGl6ZSAoZGlnZXN0KVxuICAgICAgICByZXR1cm4gQ3J5cHRvSlNbJ0htYWMnICsgaGFzaC50b1VwcGVyQ2FzZSAoKV0gKHJlcXVlc3QsIHNlY3JldCkudG9TdHJpbmcgKENyeXB0b0pTLmVuY1tjYXBpdGFsaXplIChlbmNvZGluZyldKVxuICAgIH1cbn1cblxudmFyIHVybGVuY29kZUJhc2U2NCA9IGZ1bmN0aW9uIChiYXNlNjRzdHJpbmcpIHtcbiAgICByZXR1cm4gYmFzZTY0c3RyaW5nLnJlcGxhY2UgKC9bPV0rJC8sICcnKS5yZXBsYWNlICgvXFwrL2csICctJykucmVwbGFjZSAoL1xcLy9nLCAnXycpIFxufVxuXG52YXIgand0ID0gZnVuY3Rpb24gKHJlcXVlc3QsIHNlY3JldCwgYWxnID0gJ0hTMjU2JywgaGFzaCA9ICdzaGEyNTYnKSB7XG4gICAgdmFyIGVuY29kZWRIZWFkZXIgPSB1cmxlbmNvZGVCYXNlNjQgKHN0cmluZ1RvQmFzZTY0IChKU09OLnN0cmluZ2lmeSAoeyAnYWxnJzogYWxnLCAndHlwJzogJ0pXVCcgfSkpKVxuICAgIHZhciBlbmNvZGVkRGF0YSA9IHVybGVuY29kZUJhc2U2NCAoc3RyaW5nVG9CYXNlNjQgKEpTT04uc3RyaW5naWZ5IChyZXF1ZXN0KSkpXG4gICAgdmFyIHRva2VuID0gWyBlbmNvZGVkSGVhZGVyLCBlbmNvZGVkRGF0YSBdLmpvaW4gKCcuJylcbiAgICB2YXIgc2lnbmF0dXJlID0gdXJsZW5jb2RlQmFzZTY0ICh1dGYxNlRvQmFzZTY0IChobWFjICh0b2tlbiwgc2VjcmV0LCBoYXNoLCAndXRmMTYnKSkpXG4gICAgcmV0dXJuIFsgdG9rZW4sIHNpZ25hdHVyZSBdLmpvaW4gKCcuJylcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgTWFya2V0ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgdGhpcy5oYXNoID0gaGFzaFxuICAgIHRoaXMuaG1hYyA9IGhtYWNcbiAgICB0aGlzLmp3dCA9IGp3dFxuICAgIHRoaXMuc3RyaW5nVG9CaW5hcnkgPSBzdHJpbmdUb0JpbmFyeVxuICAgIHRoaXMuc3RyaW5nVG9CYXNlNjQgPSBzdHJpbmdUb0Jhc2U2NFxuICAgIHRoaXMuYmFzZTY0VG9CaW5hcnkgPSBiYXNlNjRUb0JpbmFyeVxuICAgIHRoaXMudXJsZW5jb2RlID0gdXJsZW5jb2RlXG4gICAgdGhpcy5vbWl0ID0gb21pdFxuICAgIHRoaXMuZXh0ZW5kID0gZXh0ZW5kXG4gICAgdGhpcy5mbGF0dGVuID0gZmxhdFxuICAgIHRoaXMuaW5kZXhCeSA9IGluZGV4QnlcbiAgICB0aGlzLmtleXNvcnQgPSBrZXlzb3J0XG4gICAgdGhpcy5jYXBpdGFsaXplID0gY2FwaXRhbGl6ZVxuXG4gICAgdGhpcy5pbml0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmIChpc05vZGUpXG4gICAgICAgICAgICB0aGlzLm5vZGVWZXJzaW9uID0gcHJvY2Vzcy52ZXJzaW9uLm1hdGNoICgvXFxkK1xcLlxcZCsuXFxkKy8pIFswXVxuXG4gICAgICAgIGlmICh0aGlzLmFwaSlcbiAgICAgICAgICAgIE9iamVjdC5rZXlzICh0aGlzLmFwaSkuZm9yRWFjaCAodHlwZSA9PiB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMgKHRoaXMuYXBpW3R5cGVdKS5mb3JFYWNoIChtZXRob2QgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdXJscyA9IHRoaXMuYXBpW3R5cGVdW21ldGhvZF1cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1cmxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXJsID0gdXJsc1tpXS50cmltICgpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3BsaXRQYXRoID0gdXJsLnNwbGl0ICgvW15hLXpBLVowLTldLylcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVwcGVyY2FzZU1ldGhvZCAgPSBtZXRob2QudG9VcHBlckNhc2UgKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb3dlcmNhc2VNZXRob2QgID0gbWV0aG9kLnRvTG93ZXJDYXNlICgpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2FtZWxjYXNlTWV0aG9kICA9IGNhcGl0YWxpemUgKGxvd2VyY2FzZU1ldGhvZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYW1lbGNhc2VTdWZmaXggID0gc3BsaXRQYXRoLm1hcCAoY2FwaXRhbGl6ZSkuam9pbiAoJycpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdW5kZXJzY29yZVN1ZmZpeCA9IHNwbGl0UGF0aC5tYXAgKHggPT4geC50cmltICgpLnRvTG93ZXJDYXNlICgpKS5maWx0ZXIgKHggPT4geC5sZW5ndGggPiAwKS5qb2luICgnXycpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYW1lbGNhc2VTdWZmaXguaW5kZXhPZiAoY2FtZWxjYXNlTWV0aG9kKSA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW1lbGNhc2VTdWZmaXggPSBjYW1lbGNhc2VTdWZmaXguc2xpY2UgKGNhbWVsY2FzZU1ldGhvZC5sZW5ndGgpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1bmRlcnNjb3JlU3VmZml4LmluZGV4T2YgKGxvd2VyY2FzZU1ldGhvZCkgPT09IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZXJzY29yZVN1ZmZpeCA9IHVuZGVyc2NvcmVTdWZmaXguc2xpY2UgKGxvd2VyY2FzZU1ldGhvZC5sZW5ndGgpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYW1lbGNhc2UgID0gdHlwZSArIGNhbWVsY2FzZU1ldGhvZCArIGNhcGl0YWxpemUgKGNhbWVsY2FzZVN1ZmZpeClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1bmRlcnNjb3JlID0gdHlwZSArICdfJyArIGxvd2VyY2FzZU1ldGhvZCArICdfJyArIHVuZGVyc2NvcmVTdWZmaXhcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGYgPSAocGFyYW1zID0+IHRoaXMucmVxdWVzdCAodXJsLCB0eXBlLCB1cHBlcmNhc2VNZXRob2QsIHBhcmFtcykpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbY2FtZWxjYXNlXSAgPSBmXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzW3VuZGVyc2NvcmVdID0gZlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gdGhpcy5mZXRjaCA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcblxuICAgIC8vICAgICBpZiAoaXNOb2RlKVxuICAgIC8vICAgICAgICAgb3B0aW9ucy5oZWFkZXJzID0gZXh0ZW5kICh7XG4gICAgLy8gICAgICAgICAgICAgJ1VzZXItQWdlbnQnOiAnY2N4dC8wLjEuMCAoK2h0dHBzOi8vZ2l0aHViLmNvbS9rcm9pdG9yL2NjeHQpIE5vZGUuanMvJyArIHRoaXMubm9kZVZlcnNpb24gKyAnIChKYXZhU2NyaXB0KSdcbiAgICAvLyAgICAgICAgIH0sIG9wdGlvbnMuaGVhZGVycylcblxuICAgIC8vICAgICBpZiAodGhpcy52ZXJib3NlKVxuICAgIC8vICAgICAgICAgY29uc29sZS5sb2cgKHRoaXMuaWQsIHVybCwgb3B0aW9ucylcblxuICAgIC8vICAgICByZXR1cm4gKGZldGNoICgodGhpcy5jb3JzID8gdGhpcy5jb3JzIDogJycpICsgdXJsLCBvcHRpb25zKVxuICAgIC8vICAgICAgICAgLnRoZW4gKHJlc3BvbnNlID0+ICh0eXBlb2YgcmVzcG9uc2UgPT09ICdzdHJpbmcnKSA/IHJlc3BvbnNlIDogcmVzcG9uc2UudGV4dCAoKSlcbiAgICAvLyAgICAgICAgIC50aGVuIChyZXNwb25zZSA9PiB7XG4gICAgLy8gICAgICAgICAgICAgdHJ5IHtcbiAgICAvLyAgICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UgKHJlc3BvbnNlKVxuICAgIC8vICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgdmFyIGNsb3VkZmxhcmVQcm90ZWN0aW9uID0gcmVzcG9uc2UubWF0Y2ggKC9jbG91ZGZsYXJlL2kpID8gJ0REb1MgcHJvdGVjdGlvbiBieSBDbG91ZGZsYXJlJyA6ICcnXG4gICAgLy8gICAgICAgICAgICAgICAgIGlmICh0aGlzLnZlcmJvc2UpXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyAodGhpcy5pZCwgcmVzcG9uc2UsIGNsb3VkZmxhcmVQcm90ZWN0aW9uLCBlKVxuICAgIC8vICAgICAgICAgICAgICAgICB0aHJvdyBlXG4gICAgLy8gICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgfSkpXG4gICAgLy8gfVxuXG4gICAgdGhpcy5mZXRjaCA9IGZ1bmN0aW9uICh1cmwsIG1ldGhvZCA9ICdHRVQnLCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgaWYgKGlzTm9kZSlcbiAgICAgICAgICAgIGhlYWRlcnMgPSBleHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnVXNlci1BZ2VudCc6ICdjY3h0LzAuMS4wICgraHR0cHM6Ly9naXRodWIuY29tL2tyb2l0b3IvY2N4dCkgTm9kZS5qcy8nICsgdGhpcy5ub2RlVmVyc2lvbiArICcgKEphdmFTY3JpcHQpJ1xuICAgICAgICAgICAgfSwgaGVhZGVycylcblxuICAgICAgICBsZXQgb3B0aW9ucyA9IHsgJ21ldGhvZCc6IG1ldGhvZCwgJ2hlYWRlcnMnOiBoZWFkZXJzLCAnYm9keSc6IGJvZHkgfVxuXG4gICAgICAgIGlmICh0aGlzLnZlcmJvc2UpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyAodGhpcy5pZCwgdXJsLCBvcHRpb25zKVxuXG4gICAgICAgIHJldHVybiAoZmV0Y2ggKCh0aGlzLmNvcnMgPyB0aGlzLmNvcnMgOiAnJykgKyB1cmwsIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbiAocmVzcG9uc2UgPT4gKHR5cGVvZiByZXNwb25zZSA9PT0gJ3N0cmluZycpID8gcmVzcG9uc2UgOiByZXNwb25zZS50ZXh0ICgpKVxuICAgICAgICAgICAgLnRoZW4gKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSAocmVzcG9uc2UpXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2xvdWRmbGFyZVByb3RlY3Rpb24gPSByZXNwb25zZS5tYXRjaCAoL2Nsb3VkZmxhcmUvaSkgPyAnRERvUyBwcm90ZWN0aW9uIGJ5IENsb3VkZmxhcmUnIDogJydcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmVyYm9zZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nICh0aGlzLmlkLCByZXNwb25zZSwgY2xvdWRmbGFyZVByb3RlY3Rpb24sIGUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSlcbiAgICB9XG5cbiAgICB0aGlzLmxvYWRfcHJvZHVjdHMgPSBcbiAgICB0aGlzLmxvYWRQcm9kdWN0cyA9IGZ1bmN0aW9uIChyZWxvYWQgPSBmYWxzZSkge1xuICAgICAgICBpZiAoIXJlbG9hZCAmJiB0aGlzLnByb2R1Y3RzKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlICgocmVzb2x2ZSwgcmVqZWN0KSA9PiByZXNvbHZlICh0aGlzLnByb2R1Y3RzKSlcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hQcm9kdWN0cyAoKS50aGVuIChwcm9kdWN0cyA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9kdWN0cyA9IGluZGV4QnkgKHByb2R1Y3RzLCAnc3ltYm9sJylcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLmZldGNoX3Byb2R1Y3RzID0gXG4gICAgdGhpcy5mZXRjaFByb2R1Y3RzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UgKChyZXNvbHZlLCByZWplY3QpID0+IHJlc29sdmUgKHRoaXMucHJvZHVjdHMpKVxuICAgIH1cblxuICAgIHRoaXMuY29tbW9uQ3VycmVuY3lDb2RlID0gZnVuY3Rpb24gKGN1cnJlbmN5KSB7IFxuICAgICAgICByZXR1cm4gKGN1cnJlbmN5ID09PSAnWEJUJykgPyAnQlRDJyA6IGN1cnJlbmN5XG4gICAgfVxuXG4gICAgdGhpcy5wcm9kdWN0ID0gZnVuY3Rpb24gKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuICgoKHR5cGVvZiBwcm9kdWN0ID09PSAnc3RyaW5nJykgJiZcbiAgICAgICAgICAgICh0eXBlb2YgdGhpcy5wcm9kdWN0cyAhPSAndW5kZWZpbmVkJykgJiZcbiAgICAgICAgICAgICh0eXBlb2YgdGhpcy5wcm9kdWN0c1twcm9kdWN0XSAhPSAndW5kZWZpbmVkJykpID8gdGhpcy5wcm9kdWN0c1twcm9kdWN0XSA6IHByb2R1Y3QpICAgICAgICBcbiAgICB9XG5cbiAgICB0aGlzLnByb2R1Y3RfaWQgPSBcbiAgICB0aGlzLnByb2R1Y3RJZCAgPSBmdW5jdGlvbiAocHJvZHVjdCkgeyBcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvZHVjdCAocHJvZHVjdCkuaWQgfHwgcHJvZHVjdFxuICAgIH1cblxuICAgIHRoaXMuc3ltYm9sID0gZnVuY3Rpb24gKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvZHVjdCAocHJvZHVjdCkuc3ltYm9sIHx8IHByb2R1Y3RcbiAgICB9XG5cbiAgICB0aGlzLmV4dHJhY3RfcGFyYW1zID0gXG4gICAgdGhpcy5leHRyYWN0UGFyYW1zID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICB2YXIgcmUgPSAveyhbYS16QS1aMC05X10rPyl9L2dcbiAgICAgICAgdmFyIG1hdGNoZXMgPSBbXVxuICAgICAgICBsZXQgbWF0Y2hcbiAgICAgICAgd2hpbGUgKG1hdGNoID0gcmUuZXhlYyAoc3RyaW5nKSlcbiAgICAgICAgICAgIG1hdGNoZXMucHVzaCAobWF0Y2hbMV0pXG4gICAgICAgIHJldHVybiBtYXRjaGVzXG4gICAgfVxuXG4gICAgdGhpcy5pbXBsb2RlX3BhcmFtcyA9IFxuICAgIHRoaXMuaW1wbG9kZVBhcmFtcyA9IGZ1bmN0aW9uIChzdHJpbmcsIHBhcmFtcykge1xuICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBwYXJhbXMpXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSAoJ3snICsgcHJvcGVydHkgKyAnfScsIHBhcmFtc1twcm9wZXJ0eV0pXG4gICAgICAgIHJldHVybiBzdHJpbmdcbiAgICB9XG5cbiAgICB0aGlzLmJ1eSA9IGZ1bmN0aW9uIChwcm9kdWN0LCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcmRlciAocHJvZHVjdCwgJ2J1eScsIGFtb3VudCwgcHJpY2UsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLnNlbGwgPSBmdW5jdGlvbiAocHJvZHVjdCwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3JkZXIgKHByb2R1Y3QsICdzZWxsJywgYW1vdW50LCBwcmljZSwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMudHJhZGUgPVxuICAgIHRoaXMub3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IHR5cGUgPSAodHlwZW9mIHByaWNlID09ICd1bmRlZmluZWQnKSA/ICdtYXJrZXQnIDogJ2xpbWl0J1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlX2J1eV9vcmRlciA9XG4gICAgdGhpcy5jcmVhdGVCdXlPcmRlciA9IGZ1bmN0aW9uIChwcm9kdWN0LCB0eXBlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkgeyBcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsICdidXknLCAgYW1vdW50LCBwcmljZSwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlX3NlbGxfb3JkZXIgPVxuICAgIHRoaXMuY3JlYXRlU2VsbE9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIHR5cGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCAnc2VsbCcsIGFtb3VudCwgcHJpY2UsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9saW1pdF9idXlfb3JkZXIgPVxuICAgIHRoaXMuY3JlYXRlTGltaXRCdXlPcmRlciA9IGZ1bmN0aW9uIChwcm9kdWN0LCBhbW91bnQsIHByaWNlLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVMaW1pdE9yZGVyICAocHJvZHVjdCwgJ2J1eScsICBhbW91bnQsIHByaWNlLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVfbGltaXRfc2VsbF9vcmRlciA9IFxuICAgIHRoaXMuY3JlYXRlTGltaXRTZWxsT3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgYW1vdW50LCBwcmljZSwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTGltaXRPcmRlciAocHJvZHVjdCwgJ3NlbGwnLCBhbW91bnQsIHByaWNlLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVfbWFya2V0X2J1eV9vcmRlciA9XG4gICAgdGhpcy5jcmVhdGVNYXJrZXRCdXlPcmRlciA9IGZ1bmN0aW9uIChwcm9kdWN0LCBhbW91bnQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU1hcmtldE9yZGVyIChwcm9kdWN0LCAnYnV5JywgIGFtb3VudCwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlX21hcmtldF9zZWxsX29yZGVyID1cbiAgICB0aGlzLmNyZWF0ZU1hcmtldFNlbGxPcmRlciA9IGZ1bmN0aW9uIChwcm9kdWN0LCBhbW91bnQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU1hcmtldE9yZGVyIChwcm9kdWN0LCAnc2VsbCcsIGFtb3VudCwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlX2xpbWl0X29yZGVyID0gXG4gICAgdGhpcy5jcmVhdGVMaW1pdE9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIHNpZGUsIGFtb3VudCwgcHJpY2UsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU9yZGVyIChwcm9kdWN0LCAnbGltaXQnLCAgc2lkZSwgYW1vdW50LCBwcmljZSwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlX21hcmtldF9vcmRlciA9XG4gICAgdGhpcy5jcmVhdGVNYXJrZXRPcmRlciA9IGZ1bmN0aW9uIChwcm9kdWN0LCBzaWRlLCBhbW91bnQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU9yZGVyIChwcm9kdWN0LCAnbWFya2V0Jywgc2lkZSwgYW1vdW50LCB1bmRlZmluZWQsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmlzbzg2MDEgICAgICAgID0gdGltZXN0YW1wID0+IG5ldyBEYXRlICh0aW1lc3RhbXApLnRvSVNPU3RyaW5nICgpXG4gICAgdGhpcy5wYXJzZTg2MDEgICAgICA9IERhdGUucGFyc2UgXG4gICAgdGhpcy5zZWNvbmRzICAgICAgICA9ICgpID0+IE1hdGguZmxvb3IgKHRoaXMubWlsbGlzZWNvbmRzICgpIC8gMTAwMClcbiAgICB0aGlzLm1pY3Jvc2Vjb25kcyAgID0gKCkgPT4gTWF0aC5mbG9vciAodGhpcy5taWxsaXNlY29uZHMgKCkgKiAxMDAwKVxuICAgIHRoaXMubWlsbGlzZWNvbmRzICAgPSBEYXRlLm5vd1xuICAgIHRoaXMubm9uY2UgICAgICAgICAgPSB0aGlzLnNlY29uZHNcbiAgICB0aGlzLmlkICAgICAgICAgICAgID0gdW5kZWZpbmVkXG4gICAgdGhpcy5yYXRlTGltaXQgICAgICA9IDIwMDBcbiAgICB0aGlzLnRpbWVvdXQgICAgICAgID0gdW5kZWZpbmVkXG4gICAgdGhpcy55eXl5bW1kZGhobW1zcyA9IHRpbWVzdGFtcCA9PiB7XG4gICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUgKHRpbWVzdGFtcClcbiAgICAgICAgbGV0IHl5eXkgPSBkYXRlLmdldFVUQ0Z1bGxZZWFyICgpXG4gICAgICAgIGxldCBNTSA9IGRhdGUuZ2V0VVRDTW9udGggKClcbiAgICAgICAgbGV0IGRkID0gZGF0ZS5nZXRVVENEYXkgKClcbiAgICAgICAgbGV0IGhoID0gZGF0ZS5nZXRVVENIb3VycyAoKVxuICAgICAgICBsZXQgbW0gPSBkYXRlLmdldFVUQ01pbnV0ZXMgKClcbiAgICAgICAgbGV0IHNzID0gZGF0ZS5nZXRVVENTZWNvbmRzICgpXG4gICAgICAgIE1NID0gTU0gPCAxMCA/ICgnMCcgKyBNTSkgOiBNTVxuICAgICAgICBkZCA9IGRkIDwgMTAgPyAoJzAnICsgZGQpIDogZGRcbiAgICAgICAgaGggPSBoaCA8IDEwID8gKCcwJyArIGhoKSA6IGhoXG4gICAgICAgIG1tID0gbW0gPCAxMCA/ICgnMCcgKyBtbSkgOiBtbVxuICAgICAgICBzcyA9IHNzIDwgMTAgPyAoJzAnICsgc3MpIDogc3NcbiAgICAgICAgcmV0dXJuIHl5eXkgKyAnLScgKyBNTSArICctJyArIGRkICsgJyAnICsgaGggKyAnOicgKyBtbSArICc6JyArIHNzXG4gICAgfVxuXG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gY29uZmlnKVxuICAgICAgICB0aGlzW3Byb3BlcnR5XSA9IGNvbmZpZ1twcm9wZXJ0eV1cblxuICAgIHRoaXMuZmV0Y2hfYmFsYW5jZSAgICA9IHRoaXMuZmV0Y2hCYWxhbmNlXG4gICAgdGhpcy5mZXRjaF9vcmRlcl9ib29rID0gdGhpcy5mZXRjaE9yZGVyQm9va1xuICAgIHRoaXMuZmV0Y2hfdGlja2VyICAgICA9IHRoaXMuZmV0Y2hUaWNrZXJcbiAgICB0aGlzLmZldGNoX3RyYWRlcyAgICAgPSB0aGlzLmZldGNoVHJhZGVzXG4gIFxuICAgIHRoaXMudmVyYm9zZSA9IHRoaXMubG9nIHx8IHRoaXMuZGVidWcgfHwgKHRoaXMudmVyYm9zaXR5ID09IDEpIHx8IHRoaXMudmVyYm9zZVxuXG4gICAgdGhpcy5pbml0ICgpXG59XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxudmFyIF8xYnJva2VyID0ge1xuXG4gICAgJ2lkJzogJ18xYnJva2VyJyxcbiAgICAnbmFtZSc6ICcxQnJva2VyJyxcbiAgICAnY291bnRyaWVzJzogJ1VTJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndmVyc2lvbic6ICd2MicsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYwMjEtNDIwYmQ5ZmMtNWVjYi0xMWU3LThlZDYtNTZkMDA4MWVmZWQyLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly8xYnJva2VyLmNvbS9hcGknLCAgICAgICAgXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly8xYnJva2VyLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly8xYnJva2VyLmNvbS8/Yz1lbi9jb250ZW50L2FwaS1kb2N1bWVudGF0aW9uJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnbWFya2V0L2JhcnMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXQvY2F0ZWdvcmllcycsXG4gICAgICAgICAgICAgICAgJ21hcmtldC9kZXRhaWxzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0L2xpc3QnLFxuICAgICAgICAgICAgICAgICdtYXJrZXQvcXVvdGVzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0L3RpY2tzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY3JlYXRlJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvb3BlbicsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL2Nsb3NlJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vY2xvc2VfY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vZWRpdCcsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9vcGVuJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vc2hhcmVkL2dldCcsXG4gICAgICAgICAgICAgICAgJ3NvY2lhbC9wcm9maWxlX3N0YXRpc3RpY3MnLFxuICAgICAgICAgICAgICAgICdzb2NpYWwvcHJvZmlsZV90cmFkZXMnLFxuICAgICAgICAgICAgICAgICd1c2VyL2JpdGNvaW5fZGVwb3NpdF9hZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAndXNlci9kZXRhaWxzJyxcbiAgICAgICAgICAgICAgICAndXNlci9vdmVydmlldycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcXVvdGFfc3RhdHVzJyxcbiAgICAgICAgICAgICAgICAndXNlci90cmFuc2FjdGlvbl9sb2cnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hDYXRlZ29yaWVzICgpIHtcbiAgICAgICAgbGV0IGNhdGVnb3JpZXMgPSBhd2FpdCB0aGlzLnByaXZhdGVHZXRNYXJrZXRDYXRlZ29yaWVzICgpO1xuICAgICAgICByZXR1cm4gY2F0ZWdvcmllc1sncmVzcG9uc2UnXTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBjYXRlZ29yaWVzID0gYXdhaXQgdGhpcy5mZXRjaENhdGVnb3JpZXMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCBjYXRlZ29yaWVzLmxlbmd0aDsgYysrKSB7XG4gICAgICAgICAgICBsZXQgY2F0ZWdvcnkgPSBjYXRlZ29yaWVzW2NdO1xuICAgICAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wcml2YXRlR2V0TWFya2V0TGlzdCAoeyBcbiAgICAgICAgICAgICAgICAnY2F0ZWdvcnknOiBjYXRlZ29yeS50b0xvd2VyQ2FzZSAoKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0c1sncmVzcG9uc2UnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3Jlc3BvbnNlJ11bcF07XG4gICAgICAgICAgICAgICAgaWYgKChjYXRlZ29yeSA9PSAnRk9SRVgnKSB8fCAoY2F0ZWdvcnkgPT0gJ0NSWVBUTycpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ3N5bWJvbCddO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3ltYm9sID0gcHJvZHVjdFsnbmFtZSddO1xuICAgICAgICAgICAgICAgICAgICBsZXQgWyBiYXNlLCBxdW90ZSBdID0gc3ltYm9sLnNwbGl0ICgnLycpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ3N5bWJvbCddO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3ltYm9sID0gcHJvZHVjdFsnc3ltYm9sJ107XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gcHJvZHVjdFsnbmFtZSddO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IHByb2R1Y3RbJ3R5cGUnXS50b0xvd2VyQ2FzZSAoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICduYW1lJzogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0eXBlJzogdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0VXNlck92ZXJ2aWV3ICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0TWFya2V0UXVvdGVzICh7XG4gICAgICAgICAgICAnc3ltYm9scyc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRNYXJrZXRCYXJzICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3Jlc29sdXRpb24nOiA2MCxcbiAgICAgICAgICAgICdsaW1pdCc6IDEsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdtYXJnaW4nOiBhbW91bnQsXG4gICAgICAgICAgICAnZGlyZWN0aW9uJzogKHNpZGUgPT0gJ3NlbGwnKSA/ICdzaG9ydCcgOiAnbG9uZycsXG4gICAgICAgICAgICAnbGV2ZXJhZ2UnOiAxLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3JkZXJbJ3R5cGUnXSArPSAnX21hcmtldCc7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRPcmRlckNyZWF0ZSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyBwYXRoICsgJy5waHAnO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoeyAndG9rZW4nOiAodGhpcy5hcGlLZXkgfHwgdGhpcy50b2tlbikgfSwgcGFyYW1zKTtcbiAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgY3J5cHRvY2FwaXRhbCA9IHtcblxuICAgICdjb21tZW50JzogJ0NyeXB0byBDYXBpdGFsIEFQSScsXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3N0YXRzJyxcbiAgICAgICAgICAgICAgICAnaGlzdG9yaWNhbC1wcmljZXMnLFxuICAgICAgICAgICAgICAgICdvcmRlci1ib29rJyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzogeyAgICAgICAgICAgIFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzLWFuZC1pbmZvJyxcbiAgICAgICAgICAgICAgICAnb3Blbi1vcmRlcnMnLFxuICAgICAgICAgICAgICAgICd1c2VyLXRyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICAgICAgJ2J0Yy1kZXBvc2l0LWFkZHJlc3MvZ2V0JyxcbiAgICAgICAgICAgICAgICAnYnRjLWRlcG9zaXQtYWRkcmVzcy9uZXcnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0cy9nZXQnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy9nZXQnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvbmV3JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL2VkaXQnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzL25ldycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2VzQW5kSW5mbyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHsgXG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVyQm9vayAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRTdGF0cyAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydzdGF0cyddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21heCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21pbiddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdF9wcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2RhaWx5X2NoYW5nZSddKSxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndG90YWxfYnRjX3RyYWRlZCddKSxcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhbnNhY3Rpb25zICh7XG4gICAgICAgICAgICAnY3VycmVuY3knOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3R5cGUnOiB0eXBlLFxuICAgICAgICAgICAgJ2N1cnJlbmN5JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydsaW1pdF9wcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXJzTmV3ICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHBhdGg7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ2FwaV9rZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiB0aGlzLm5vbmNlICgpLFxuICAgICAgICAgICAgfSwgcGFyYW1zKTtcbiAgICAgICAgICAgIHF1ZXJ5WydzaWduYXR1cmUnXSA9IHRoaXMuaG1hYyAoSlNPTi5zdHJpbmdpZnkgKHF1ZXJ5KSwgdGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5IChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBfMWJ0Y3hlID0gZXh0ZW5kIChjcnlwdG9jYXBpdGFsLCB7XG5cbiAgICAnaWQnOiAnXzFidGN4ZScsXG4gICAgJ25hbWUnOiAnMUJUQ1hFJyxcbiAgICAnY291bnRyaWVzJzogJ1BBJywgLy8gUGFuYW1hXG4gICAgJ2NvbW1lbnQnOiAnQ3J5cHRvIENhcGl0YWwgQVBJJyxcbiAgICAndXJscyc6IHsgXG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYwNDktMmIyOTQ0MDgtNWVjYy0xMWU3LTg1Y2MtYWRhZmYwMTNkYzFhLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly8xYnRjeGUuY29tL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly8xYnRjeGUuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovLzFidGN4ZS5jb20vYXBpLWRvY3MucGhwJyxcbiAgICB9LCAgICBcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvVVNEJzogeyAnaWQnOiAnVVNEJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcsIH0sXG4gICAgICAgICdCVEMvRVVSJzogeyAnaWQnOiAnRVVSJywgJ3N5bWJvbCc6ICdCVEMvRVVSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0VVUicsIH0sXG4gICAgICAgICdCVEMvQ05ZJzogeyAnaWQnOiAnQ05ZJywgJ3N5bWJvbCc6ICdCVEMvQ05ZJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NOWScsIH0sXG4gICAgICAgICdCVEMvUlVCJzogeyAnaWQnOiAnUlVCJywgJ3N5bWJvbCc6ICdCVEMvUlVCJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1JVQicsIH0sXG4gICAgICAgICdCVEMvQ0hGJzogeyAnaWQnOiAnQ0hGJywgJ3N5bWJvbCc6ICdCVEMvQ0hGJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NIRicsIH0sXG4gICAgICAgICdCVEMvSlBZJzogeyAnaWQnOiAnSlBZJywgJ3N5bWJvbCc6ICdCVEMvSlBZJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0pQWScsIH0sXG4gICAgICAgICdCVEMvR0JQJzogeyAnaWQnOiAnR0JQJywgJ3N5bWJvbCc6ICdCVEMvR0JQJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0dCUCcsIH0sXG4gICAgICAgICdCVEMvQ0FEJzogeyAnaWQnOiAnQ0FEJywgJ3N5bWJvbCc6ICdCVEMvQ0FEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NBRCcsIH0sXG4gICAgICAgICdCVEMvQVVEJzogeyAnaWQnOiAnQVVEJywgJ3N5bWJvbCc6ICdCVEMvQVVEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0FVRCcsIH0sXG4gICAgICAgICdCVEMvQUVEJzogeyAnaWQnOiAnQUVEJywgJ3N5bWJvbCc6ICdCVEMvQUVEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0FFRCcsIH0sXG4gICAgICAgICdCVEMvQkdOJzogeyAnaWQnOiAnQkdOJywgJ3N5bWJvbCc6ICdCVEMvQkdOJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0JHTicsIH0sXG4gICAgICAgICdCVEMvQ1pLJzogeyAnaWQnOiAnQ1pLJywgJ3N5bWJvbCc6ICdCVEMvQ1pLJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NaSycsIH0sXG4gICAgICAgICdCVEMvREtLJzogeyAnaWQnOiAnREtLJywgJ3N5bWJvbCc6ICdCVEMvREtLJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0RLSycsIH0sXG4gICAgICAgICdCVEMvSEtEJzogeyAnaWQnOiAnSEtEJywgJ3N5bWJvbCc6ICdCVEMvSEtEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0hLRCcsIH0sXG4gICAgICAgICdCVEMvSFJLJzogeyAnaWQnOiAnSFJLJywgJ3N5bWJvbCc6ICdCVEMvSFJLJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0hSSycsIH0sXG4gICAgICAgICdCVEMvSFVGJzogeyAnaWQnOiAnSFVGJywgJ3N5bWJvbCc6ICdCVEMvSFVGJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0hVRicsIH0sXG4gICAgICAgICdCVEMvSUxTJzogeyAnaWQnOiAnSUxTJywgJ3N5bWJvbCc6ICdCVEMvSUxTJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0lMUycsIH0sXG4gICAgICAgICdCVEMvSU5SJzogeyAnaWQnOiAnSU5SJywgJ3N5bWJvbCc6ICdCVEMvSU5SJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0lOUicsIH0sXG4gICAgICAgICdCVEMvTVVSJzogeyAnaWQnOiAnTVVSJywgJ3N5bWJvbCc6ICdCVEMvTVVSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ01VUicsIH0sXG4gICAgICAgICdCVEMvTVhOJzogeyAnaWQnOiAnTVhOJywgJ3N5bWJvbCc6ICdCVEMvTVhOJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ01YTicsIH0sXG4gICAgICAgICdCVEMvTk9LJzogeyAnaWQnOiAnTk9LJywgJ3N5bWJvbCc6ICdCVEMvTk9LJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ05PSycsIH0sXG4gICAgICAgICdCVEMvTlpEJzogeyAnaWQnOiAnTlpEJywgJ3N5bWJvbCc6ICdCVEMvTlpEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ05aRCcsIH0sXG4gICAgICAgICdCVEMvUExOJzogeyAnaWQnOiAnUExOJywgJ3N5bWJvbCc6ICdCVEMvUExOJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1BMTicsIH0sXG4gICAgICAgICdCVEMvUk9OJzogeyAnaWQnOiAnUk9OJywgJ3N5bWJvbCc6ICdCVEMvUk9OJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1JPTicsIH0sXG4gICAgICAgICdCVEMvU0VLJzogeyAnaWQnOiAnU0VLJywgJ3N5bWJvbCc6ICdCVEMvU0VLJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1NFSycsIH0sXG4gICAgICAgICdCVEMvU0dEJzogeyAnaWQnOiAnU0dEJywgJ3N5bWJvbCc6ICdCVEMvU0dEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1NHRCcsIH0sXG4gICAgICAgICdCVEMvVEhCJzogeyAnaWQnOiAnVEhCJywgJ3N5bWJvbCc6ICdCVEMvVEhCJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1RIQicsIH0sXG4gICAgICAgICdCVEMvVFJZJzogeyAnaWQnOiAnVFJZJywgJ3N5bWJvbCc6ICdCVEMvVFJZJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1RSWScsIH0sXG4gICAgICAgICdCVEMvWkFSJzogeyAnaWQnOiAnWkFSJywgJ3N5bWJvbCc6ICdCVEMvWkFSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1pBUicsIH0sXG4gICAgfSxcbn0pXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGFueHBybyA9IHtcblxuICAgICdpZCc6ICdhbnhwcm8nLFxuICAgICduYW1lJzogJ0FOWFBybycsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0pQJywgJ1NHJywgJ0hLJywgJ05aJywgXSxcbiAgICAndmVyc2lvbic6ICcyJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NTk4My1mZDg1OTVkYS01ZWM5LTExZTctODJlMy1hZGIzYWI4YzI2MTIuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FueHByby5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2FueHByby5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vYW54cHJvLmNvbS9wYWdlcy9hcGknLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3tjdXJyZW5jeV9wYWlyfS9tb25leS90aWNrZXInLFxuICAgICAgICAgICAgICAgICd7Y3VycmVuY3lfcGFpcn0vbW9uZXkvZGVwdGgvZnVsbCcsXG4gICAgICAgICAgICAgICAgJ3tjdXJyZW5jeV9wYWlyfS9tb25leS90cmFkZS9mZXRjaCcsIC8vIGRpc2FibGVkIGJ5IEFOWFByb1xuICAgICAgICAgICAgXSwgICAgXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ3tjdXJyZW5jeV9wYWlyfS9tb25leS9vcmRlci9hZGQnLFxuICAgICAgICAgICAgICAgICd7Y3VycmVuY3lfcGFpcn0vbW9uZXkvb3JkZXIvY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAne2N1cnJlbmN5X3BhaXJ9L21vbmV5L29yZGVyL3F1b3RlJyxcbiAgICAgICAgICAgICAgICAne2N1cnJlbmN5X3BhaXJ9L21vbmV5L29yZGVyL3Jlc3VsdCcsXG4gICAgICAgICAgICAgICAgJ3tjdXJyZW5jeV9wYWlyfS9tb25leS9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdtb25leS97Y3VycmVuY3l9L2FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICdtb25leS97Y3VycmVuY3l9L3NlbmRfc2ltcGxlJyxcbiAgICAgICAgICAgICAgICAnbW9uZXkvaW5mbycsXG4gICAgICAgICAgICAgICAgJ21vbmV5L3RyYWRlL2xpc3QnLFxuICAgICAgICAgICAgICAgICdtb25leS93YWxsZXQvaGlzdG9yeScsXG4gICAgICAgICAgICBdLCAgICBcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdCVENVU0QnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnQlRDL0hLRCc6IHsgJ2lkJzogJ0JUQ0hLRCcsICdzeW1ib2wnOiAnQlRDL0hLRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdIS0QnIH0sXG4gICAgICAgICdCVEMvRVVSJzogeyAnaWQnOiAnQlRDRVVSJywgJ3N5bWJvbCc6ICdCVEMvRVVSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICAgICAgJ0JUQy9DQUQnOiB7ICdpZCc6ICdCVENDQUQnLCAnc3ltYm9sJzogJ0JUQy9DQUQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ0FEJyB9LFxuICAgICAgICAnQlRDL0FVRCc6IHsgJ2lkJzogJ0JUQ0FVRCcsICdzeW1ib2wnOiAnQlRDL0FVRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdBVUQnIH0sXG4gICAgICAgICdCVEMvU0dEJzogeyAnaWQnOiAnQlRDU0dEJywgJ3N5bWJvbCc6ICdCVEMvU0dEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1NHRCcgfSxcbiAgICAgICAgJ0JUQy9KUFknOiB7ICdpZCc6ICdCVENKUFknLCAnc3ltYm9sJzogJ0JUQy9KUFknLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnQlRDL0dCUCc6IHsgJ2lkJzogJ0JUQ0dCUCcsICdzeW1ib2wnOiAnQlRDL0dCUCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdHQlAnIH0sXG4gICAgICAgICdCVEMvTlpEJzogeyAnaWQnOiAnQlRDTlpEJywgJ3N5bWJvbCc6ICdCVEMvTlpEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ05aRCcgfSxcbiAgICAgICAgJ0xUQy9CVEMnOiB7ICdpZCc6ICdMVENCVEMnLCAnc3ltYm9sJzogJ0xUQy9CVEMnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnRE9HRS9CVEMnOiB7ICdpZCc6ICdET0dFQlRDJywgJ3N5bWJvbCc6ICdET0dFL0JUQycsICdiYXNlJzogJ0RPR0UnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnU1RSL0JUQyc6IHsgJ2lkJzogJ1NUUkJUQycsICdzeW1ib2wnOiAnU1RSL0JUQycsICdiYXNlJzogJ1NUUicsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdYUlAvQlRDJzogeyAnaWQnOiAnWFJQQlRDJywgJ3N5bWJvbCc6ICdYUlAvQlRDJywgJ2Jhc2UnOiAnWFJQJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RNb25leUluZm8gKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldEN1cnJlbmN5UGFpck1vbmV5RGVwdGhGdWxsICh7XG4gICAgICAgICAgICAnY3VycmVuY3lfcGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0Q3VycmVuY3lQYWlyTW9uZXlUaWNrZXIgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeV9wYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydkYXRhJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAodGlja2VyWydkYXRhVXBkYXRlVGltZSddIC8gMTAwMCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXVsndmFsdWUnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXVsndmFsdWUnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXVsndmFsdWUnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pWyd2YWx1ZSddLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXVsndmFsdWUnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J11bJ3ZhbHVlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2F2ZyddWyd2YWx1ZSddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXVsndmFsdWUnXSksXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldEN1cnJlbmN5UGFpck1vbmV5VHJhZGVGZXRjaCAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnYW1vdW50X2ludCc6IGFtb3VudCxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZV9pbnQnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEN1cnJlbmN5UGFpck9yZGVyQWRkICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBub25jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHJlcXVlc3QgPSB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyByZXF1ZXN0O1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHsgJ25vbmNlJzogbm9uY2UgfSwgcXVlcnkpKTtcbiAgICAgICAgICAgIGxldCBzZWNyZXQgPSB0aGlzLmJhc2U2NFRvQmluYXJ5ICh0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBsZXQgYXV0aCA9IHJlcXVlc3QgKyBcIlxcMFwiICsgYm9keTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdSZXN0LUtleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdSZXN0LVNpZ24nOiB0aGlzLmhtYWMgKGF1dGgsIHNlY3JldCwgJ3NoYTUxMicsICdiYXNlNjQnKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXQyYyA9IHtcblxuICAgICdpZCc6ICdiaXQyYycsXG4gICAgJ25hbWUnOiAnQml0MkMnLFxuICAgICdjb3VudHJpZXMnOiAnSUwnLCAvLyBJc3JhZWxcbiAgICAncmF0ZUxpbWl0JzogMzAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjExOS0zNTkzMjIwZS01ZWNlLTExZTctOGIzYS01YTA0MWY2YmNjM2YuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5iaXQyYy5jby5pbCcsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuYml0MmMuY28uaWwnLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3LmJpdDJjLmNvLmlsL2hvbWUvYXBpJyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vT2ZlckUvYml0MmMnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ0V4Y2hhbmdlcy97cGFpcn0vVGlja2VyJyxcbiAgICAgICAgICAgICAgICAnRXhjaGFuZ2VzL3twYWlyfS9vcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICdFeGNoYW5nZXMve3BhaXJ9L3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdBY2NvdW50L0JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdBY2NvdW50L0JhbGFuY2UvdjInLFxuICAgICAgICAgICAgICAgICdNZXJjaGFudC9DcmVhdGVDaGVja291dCcsXG4gICAgICAgICAgICAgICAgJ09yZGVyL0FjY291bnRIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvQWRkQ29pbkZ1bmRzUmVxdWVzdCcsXG4gICAgICAgICAgICAgICAgJ09yZGVyL0FkZEZ1bmQnLFxuICAgICAgICAgICAgICAgICdPcmRlci9BZGRPcmRlcicsXG4gICAgICAgICAgICAgICAgJ09yZGVyL0FkZE9yZGVyTWFya2V0UHJpY2VCdXknLFxuICAgICAgICAgICAgICAgICdPcmRlci9BZGRPcmRlck1hcmtldFByaWNlU2VsbCcsXG4gICAgICAgICAgICAgICAgJ09yZGVyL0NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvTXlPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdQYXltZW50L0dldE15SWQnLFxuICAgICAgICAgICAgICAgICdQYXltZW50L1NlbmQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9OSVMnOiB7ICdpZCc6ICdCdGNOaXMnLCAnc3ltYm9sJzogJ0JUQy9OSVMnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnTklTJyB9LFxuICAgICAgICAnTFRDL0JUQyc6IHsgJ2lkJzogJ0x0Y0J0YycsICdzeW1ib2wnOiAnTFRDL0JUQycsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMVEMvTklTJzogeyAnaWQnOiAnTHRjTmlzJywgJ3N5bWJvbCc6ICdMVEMvTklTJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ05JUycgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RBY2NvdW50QmFsYW5jZVYyICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRFeGNoYW5nZXNQYWlyT3JkZXJib29rICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEV4Y2hhbmdlc1BhaXJUaWNrZXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbCddKSxcbiAgICAgICAgICAgICdiaWQnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXNrJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsbCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogcGFyc2VGbG9hdCAodGlja2VyWydhdiddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydhJ10pLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRFeGNoYW5nZXNQYWlyVHJhZGVzICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0T3JkZXJBZGRPcmRlcic7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdBbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAnUGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHtcbiAgICAgICAgICAgIG1ldGhvZCArPSAnTWFya2V0UHJpY2UnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9yZGVyWydQcmljZSddID0gcHJpY2U7XG4gICAgICAgICAgICBvcmRlclsnVG90YWwnXSA9IGFtb3VudCAqIHByaWNlO1xuICAgICAgICAgICAgb3JkZXJbJ0lzQmlkJ10gPSAoc2lkZSA9PSAnYnV5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy5qc29uJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoeyAnbm9uY2UnOiBub25jZSB9LCBwYXJhbXMpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ3NpZ24nOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJywgJ2Jhc2U2NCcpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdGJheSA9IHtcblxuICAgICdpZCc6ICdiaXRiYXknLFxuICAgICduYW1lJzogJ0JpdEJheScsXG4gICAgJ2NvdW50cmllcyc6IFsgJ1BMJywgJ0VVJywgXSwgLy8gUG9sYW5kXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYxMzItOTc4YTdiZDgtNWVjZS0xMWU3LTk1NDAtYmM5NmQxZTliYmI4LmpwZycsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9iaXRiYXkubmV0JyxcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdwdWJsaWMnOiAnaHR0cHM6Ly9iaXRiYXkubmV0L0FQSS9QdWJsaWMnLFxuICAgICAgICAgICAgJ3ByaXZhdGUnOiAnaHR0cHM6Ly9iaXRiYXkubmV0L0FQSS9UcmFkaW5nL3RyYWRpbmdBcGkucGhwJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL2JpdGJheS5uZXQvcHVibGljLWFwaScsXG4gICAgICAgICAgICAnaHR0cHM6Ly9iaXRiYXkubmV0L2FjY291bnQvdGFiLWFwaScsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL0JpdEJheU5ldC9BUEknLFxuICAgICAgICBdLCBcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICd7aWR9L2FsbCcsXG4gICAgICAgICAgICAgICAgJ3tpZH0vbWFya2V0JyxcbiAgICAgICAgICAgICAgICAne2lkfS9vcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICd7aWR9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3tpZH0vdHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2luZm8nLFxuICAgICAgICAgICAgICAgICd0cmFkZScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICdoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7ICBcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdCVENVU0QnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ0JUQ0VVUicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdCVEMvUExOJzogeyAnaWQnOiAnQlRDUExOJywgJ3N5bWJvbCc6ICdCVEMvUExOJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1BMTicgfSxcbiAgICAgICAgJ0xUQy9VU0QnOiB7ICdpZCc6ICdMVENVU0QnLCAnc3ltYm9sJzogJ0xUQy9VU0QnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnTFRDL0VVUic6IHsgJ2lkJzogJ0xUQ0VVUicsICdzeW1ib2wnOiAnTFRDL0VVUicsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdMVEMvUExOJzogeyAnaWQnOiAnTFRDUExOJywgJ3N5bWJvbCc6ICdMVEMvUExOJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ1BMTicgfSxcbiAgICAgICAgJ0xUQy9CVEMnOiB7ICdpZCc6ICdMVENCVEMnLCAnc3ltYm9sJzogJ0xUQy9CVEMnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnRVRIL1VTRCc6IHsgJ2lkJzogJ0VUSFVTRCcsICdzeW1ib2wnOiAnRVRIL1VTRCcsICdiYXNlJzogJ0VUSCcsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdFVEgvRVVSJzogeyAnaWQnOiAnRVRIRVVSJywgJ3N5bWJvbCc6ICdFVEgvRVVSJywgJ2Jhc2UnOiAnRVRIJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICAgICAgJ0VUSC9QTE4nOiB7ICdpZCc6ICdFVEhQTE4nLCAnc3ltYm9sJzogJ0VUSC9QTE4nLCAnYmFzZSc6ICdFVEgnLCAncXVvdGUnOiAnUExOJyB9LFxuICAgICAgICAnRVRIL0JUQyc6IHsgJ2lkJzogJ0VUSEJUQycsICdzeW1ib2wnOiAnRVRIL0JUQycsICdiYXNlJzogJ0VUSCcsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMU0svVVNEJzogeyAnaWQnOiAnTFNLVVNEJywgJ3N5bWJvbCc6ICdMU0svVVNEJywgJ2Jhc2UnOiAnTFNLJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0xTSy9FVVInOiB7ICdpZCc6ICdMU0tFVVInLCAnc3ltYm9sJzogJ0xTSy9FVVInLCAnYmFzZSc6ICdMU0snLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgICAgICAnTFNLL1BMTic6IHsgJ2lkJzogJ0xTS1BMTicsICdzeW1ib2wnOiAnTFNLL1BMTicsICdiYXNlJzogJ0xTSycsICdxdW90ZSc6ICdQTE4nIH0sXG4gICAgICAgICdMU0svQlRDJzogeyAnaWQnOiAnTFNLQlRDJywgJ3N5bWJvbCc6ICdMU0svQlRDJywgJ2Jhc2UnOiAnTFNLJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHsgXG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0SWRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldElkVGlja2VyICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21heCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21pbiddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWyd2d2FwJ10pLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogcGFyc2VGbG9hdCAodGlja2VyWydhdmVyYWdlJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkgeyBcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0SWRUcmFkZXMgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VHJhZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgICAgICAnY3VycmVuY3knOiBwWydiYXNlJ10sXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3BheW1lbnRfY3VycmVuY3knOiBwWydxdW90ZSddLFxuICAgICAgICAgICAgJ3JhdGUnOiBwcmljZSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddW3R5cGVdO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9ICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKSArICcuanNvbic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ21ldGhvZCc6IHBhdGgsXG4gICAgICAgICAgICAgICAgJ21vbWVudCc6IHRoaXMubm9uY2UgKCksXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdBUEktS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ0FQSS1IYXNoJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdGJheXMgPSB7XG5cbiAgICAnaWQnOiAnYml0YmF5cycsXG4gICAgJ25hbWUnOiAnQml0QmF5cycsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0NOJywgJ1VLJywgJ0hLJywgJ0FVJywgJ0NBJyBdLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzgwODU5OS05ODM2ODdkMi02MDUxLTExZTctOGQ5NS04MGRmY2JlNWNiYjQuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2JpdGJheXMuY29tL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9iaXRiYXlzLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9iaXRiYXlzLmNvbS9oZWxwL2FwaS8nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2RlcHRoJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ2luZm8nLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvVVNEJzogeyAnaWQnOiAnYnRjX3VzZCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdCVEMvQ05ZJzogeyAnaWQnOiAnYnRjX2NueScsICdzeW1ib2wnOiAnQlRDL0NOWScsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdPRFMvQlRDJzogeyAnaWQnOiAnb2RzX2J0YycsICdzeW1ib2wnOiAnT0RTL0JUQycsICdiYXNlJzogJ09EUycsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMU0svQlRDJzogeyAnaWQnOiAnbHNrX2J0YycsICdzeW1ib2wnOiAnTFNLL0JUQycsICdiYXNlJzogJ0xTSycsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMU0svQ05ZJzogeyAnaWQnOiAnbHNrX2NueScsICdzeW1ib2wnOiAnTFNLL0NOWScsICdiYXNlJzogJ0xTSycsICdxdW90ZSc6ICdDTlknIH0sXG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldERlcHRoICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydyZXN1bHQnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnb3AnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHtcbiAgICAgICAgICAgIG9yZGVyWydvcmRlcl90eXBlJ10gPSAxO1xuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9yZGVyWydvcmRlcl90eXBlJ10gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VHJhZGUgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdTaWduJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdGNvaW5jb2lkID0ge1xuXG4gICAgJ2lkJzogJ2JpdGNvaW5jb2lkJyxcbiAgICAnbmFtZSc6ICdCaXRjb2luLmNvLmlkJyxcbiAgICAnY291bnRyaWVzJzogJ0lEJywgLy8gSW5kb25lc2lhXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYxMzgtMDQzYzc3ODYtNWVjZi0xMWU3LTg4MmItODA5YzE0ZjM4YjUzLmpwZycsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAncHVibGljJzogJ2h0dHBzOi8vdmlwLmJpdGNvaW4uY28uaWQvYXBpJyxcbiAgICAgICAgICAgICdwcml2YXRlJzogJ2h0dHBzOi8vdmlwLmJpdGNvaW4uY28uaWQvdGFwaScsXG4gICAgICAgIH0sXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuYml0Y29pbi5jby5pZCcsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly92aXAuYml0Y29pbi5jby5pZC90cmFkZV9hcGknLFxuICAgICAgICAgICAgJ2h0dHBzOi8vdmlwLmJpdGNvaW4uY28uaWQvZG93bmxvYWRzL0JJVENPSU5DT0lELUFQSS1ET0NVTUVOVEFUSU9OLnBkZicsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAne3BhaXJ9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3twYWlyfS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICd7cGFpcn0vZGVwdGgnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnZ2V0SW5mbycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAndHJhZGVIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnb3Blbk9yZGVycycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvSURSJzogIHsgJ2lkJzogJ2J0Y19pZHInLCAnc3ltYm9sJzogJ0JUQy9JRFInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSURSJywgJ2Jhc2VJZCc6ICdidGMnLCAncXVvdGVJZCc6ICdpZHInIH0sXG4gICAgICAgICdCVFMvQlRDJzogIHsgJ2lkJzogJ2J0c19idGMnLCAnc3ltYm9sJzogJ0JUUy9CVEMnLCAnYmFzZSc6ICdCVFMnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdidHMnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdEQVNIL0JUQyc6IHsgJ2lkJzogJ2Rya19idGMnLCAnc3ltYm9sJzogJ0RBU0gvQlRDJywgJ2Jhc2UnOiAnREFTSCcsICdxdW90ZSc6ICdCVEMnLCAnYmFzZUlkJzogJ2RyaycsICdxdW90ZUlkJzogJ2J0YycgfSxcbiAgICAgICAgJ0RPR0UvQlRDJzogeyAnaWQnOiAnZG9nZV9idGMnLCAnc3ltYm9sJzogJ0RPR0UvQlRDJywgJ2Jhc2UnOiAnRE9HRScsICdxdW90ZSc6ICdCVEMnLCAnYmFzZUlkJzogJ2RvZ2UnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdFVEgvQlRDJzogIHsgJ2lkJzogJ2V0aF9idGMnLCAnc3ltYm9sJzogJ0VUSC9CVEMnLCAnYmFzZSc6ICdFVEgnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdldGgnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdMVEMvQlRDJzogIHsgJ2lkJzogJ2x0Y19idGMnLCAnc3ltYm9sJzogJ0xUQy9CVEMnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdsdGMnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdOWFQvQlRDJzogIHsgJ2lkJzogJ254dF9idGMnLCAnc3ltYm9sJzogJ05YVC9CVEMnLCAnYmFzZSc6ICdOWFQnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdueHQnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdTVFIvQlRDJzogIHsgJ2lkJzogJ3N0cl9idGMnLCAnc3ltYm9sJzogJ1NUUi9CVEMnLCAnYmFzZSc6ICdTVFInLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICdzdHInLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdORU0vQlRDJzogIHsgJ2lkJzogJ25lbV9idGMnLCAnc3ltYm9sJzogJ05FTS9CVEMnLCAnYmFzZSc6ICdORU0nLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICduZW0nLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgICAgICdYUlAvQlRDJzogIHsgJ2lkJzogJ3hycF9idGMnLCAnc3ltYm9sJzogJ1hSUC9CVEMnLCAnYmFzZSc6ICdYUlAnLCAncXVvdGUnOiAnQlRDJywgJ2Jhc2VJZCc6ICd4cnAnLCAncXVvdGVJZCc6ICdidGMnIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0R2V0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0UGFpckRlcHRoICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwYWlyID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQYWlyVGlja2VyICh7XG4gICAgICAgICAgICAncGFpcic6IHBhaXJbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3RpY2tlciddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VGbG9hdCAodGlja2VyWydzZXJ2ZXJfdGltZSddKSAqIDEwMDA7XG4gICAgICAgIGxldCBiYXNlVm9sdW1lID0gJ3ZvbF8nICsgcGFpclsnYmFzZUlkJ10udG9Mb3dlckNhc2UgKCk7XG4gICAgICAgIGxldCBxdW90ZVZvbHVtZSA9ICd2b2xfJyArIHBhaXJbJ3F1b3RlSWQnXS50b0xvd2VyQ2FzZSAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXZlcmFnZSddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyW2Jhc2VWb2x1bWVdKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlcltxdW90ZVZvbHVtZV0pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFBhaXJUcmFkZXMgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3BhaXInOiBwWydpZCddLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UsXG4gICAgICAgIH07XG4gICAgICAgIGxldCBiYXNlID0gcFsnYmFzZSddLnRvTG93ZXJDYXNlICgpO1xuICAgICAgICBvcmRlcltiYXNlXSA9IGFtb3VudDtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV07XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdtZXRob2QnOiBwYXRoLFxuICAgICAgICAgICAgICAgICdub25jZSc6IHRoaXMubm9uY2UgKCksXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdLZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnU2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXRmaW5leCA9IHtcblxuICAgICdpZCc6ICdiaXRmaW5leCcsXG4gICAgJ25hbWUnOiAnQml0ZmluZXgnLFxuICAgICdjb3VudHJpZXMnOiAnVVMnLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjI0NC1lMzI4YTUwYy01ZWQyLTExZTctOTQ3Yi0wNDE0MTY1NzliYjMuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5iaXRmaW5leC5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmJpdGZpbmV4LmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9iaXRmaW5leC5yZWFkbWUuaW8vdjEvZG9jcycsXG4gICAgICAgICAgICAnaHR0cHM6Ly9iaXRmaW5leC5yZWFkbWUuaW8vdjIvZG9jcycsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL2JpdGZpbmV4Y29tL2JpdGZpbmV4LWFwaS1ub2RlJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdib29rL3tzeW1ib2x9JyxcbiAgICAgICAgICAgICAgICAnY2FuZGxlcy97c3ltYm9sfScsXG4gICAgICAgICAgICAgICAgJ2xlbmRib29rL3tjdXJyZW5jeX0nLFxuICAgICAgICAgICAgICAgICdsZW5kcy97Y3VycmVuY3l9JyxcbiAgICAgICAgICAgICAgICAncHVidGlja2VyL3tzeW1ib2x9JyxcbiAgICAgICAgICAgICAgICAnc3RhdHMve3N5bWJvbH0nLFxuICAgICAgICAgICAgICAgICdzeW1ib2xzJyxcbiAgICAgICAgICAgICAgICAnc3ltYm9sc19kZXRhaWxzJyxcbiAgICAgICAgICAgICAgICAndG9kYXknLFxuICAgICAgICAgICAgICAgICd0cmFkZXMve3N5bWJvbH0nLCAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRfaW5mb3MnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2Jhc2tldF9tYW5hZ2UnLFxuICAgICAgICAgICAgICAgICdjcmVkaXRzJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdC9uZXcnLFxuICAgICAgICAgICAgICAgICdmdW5kaW5nL2Nsb3NlJyxcbiAgICAgICAgICAgICAgICAnaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ2hpc3RvcnkvbW92ZW1lbnRzJyxcbiAgICAgICAgICAgICAgICAna2V5X2luZm8nLFxuICAgICAgICAgICAgICAgICdtYXJnaW5faW5mb3MnLFxuICAgICAgICAgICAgICAgICdteXRyYWRlcycsXG4gICAgICAgICAgICAgICAgJ29mZmVyL2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29mZmVyL25ldycsXG4gICAgICAgICAgICAgICAgJ29mZmVyL3N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ29mZmVycycsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NhbmNlbC9hbGwnLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwvbXVsdGknLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwvcmVwbGFjZScsXG4gICAgICAgICAgICAgICAgJ29yZGVyL25ldycsXG4gICAgICAgICAgICAgICAgJ29yZGVyL25ldy9tdWx0aScsXG4gICAgICAgICAgICAgICAgJ29yZGVyL3N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL2NsYWltJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb25zJyxcbiAgICAgICAgICAgICAgICAnc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJ3Rha2VuX2Z1bmRzJyxcbiAgICAgICAgICAgICAgICAndG90YWxfdGFrZW5fZnVuZHMnLFxuICAgICAgICAgICAgICAgICd0cmFuc2ZlcicsXG4gICAgICAgICAgICAgICAgJ3VudXNlZF90YWtlbl9mdW5kcycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFN5bWJvbHNEZXRhaWxzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydwYWlyJ10udG9VcHBlckNhc2UgKCk7XG4gICAgICAgICAgICBsZXQgYmFzZSA9IGlkLnNsaWNlICgwLCAzKTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IGlkLnNsaWNlICgzLCA2KTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZXMgKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldEJvb2tTeW1ib2wgKHsgXG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0UHVidGlja2VyU3ltYm9sICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlRmxvYXQgKHRpY2tlclsndGltZXN0YW1wJ10pICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdF9wcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogcGFyc2VGbG9hdCAodGlja2VyWydtaWQnXSksXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlc1N5bWJvbCAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyTmV3ICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQudG9TdHJpbmcgKCksXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZS50b1N0cmluZyAoKSxcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICd0eXBlJzogJ2V4Y2hhbmdlICcgKyB0eXBlLFxuICAgICAgICAgICAgJ29jb29yZGVyJzogZmFsc2UsXG4gICAgICAgICAgICAnYnV5X3ByaWNlX29jbyc6IDAsXG4gICAgICAgICAgICAnc2VsbF9wcmljZV9vY28nOiAwLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHJlcXVlc3QgPSAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyByZXF1ZXN0O1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykgeyAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZS50b1N0cmluZyAoKSxcbiAgICAgICAgICAgICAgICAncmVxdWVzdCc6IHJlcXVlc3QsXG4gICAgICAgICAgICB9LCBxdWVyeSk7XG4gICAgICAgICAgICBsZXQgcGF5bG9hZCA9IHRoaXMuc3RyaW5nVG9CYXNlNjQgKEpTT04uc3RyaW5naWZ5IChxdWVyeSkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnWC1CRlgtQVBJS0VZJzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1gtQkZYLVBBWUxPQUQnOiBwYXlsb2FkLFxuICAgICAgICAgICAgICAgICdYLUJGWC1TSUdOQVRVUkUnOiB0aGlzLmhtYWMgKHBheWxvYWQsIHRoaXMuc2VjcmV0LCAnc2hhMzg0JyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0bGlzaCA9IHtcblxuICAgICdpZCc6ICdiaXRsaXNoJyxcbiAgICAnbmFtZSc6ICdiaXRsaXNoJyxcbiAgICAnY291bnRyaWVzJzogWyAnVUsnLCAnRVUnLCAnUlUnLCBdLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLCAgICBcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYyNzUtZGNmYzZjMzAtNWVkMy0xMWU3LTgzOWQtMDBhODQ2Mzg1ZDBiLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9iaXRsaXNoLmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vYml0bGlzaC5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vYml0bGlzaC5jb20vYXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdpbnN0cnVtZW50cycsXG4gICAgICAgICAgICAgICAgJ29obGN2JyxcbiAgICAgICAgICAgICAgICAncGFpcnMnLFxuICAgICAgICAgICAgICAgICd0aWNrZXJzJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzX2RlcHRoJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzX2hpc3RvcnknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudHNfb3BlcmF0aW9ucycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfdHJhZGUnLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfdHJhZGVzX2J5X2lkcycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9hbGxfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnY3JlYXRlX2Jjb2RlJyxcbiAgICAgICAgICAgICAgICAnY3JlYXRlX3RlbXBsYXRlX3dhbGxldCcsXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZV90cmFkZScsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXQnLFxuICAgICAgICAgICAgICAgICdsaXN0X2FjY291bnRzX29wZXJhdGlvbnNfZnJvbV90cycsXG4gICAgICAgICAgICAgICAgJ2xpc3RfYWN0aXZlX3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2xpc3RfYmNvZGVzJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9teV9tYXRjaGVzX2Zyb21fdHMnLFxuICAgICAgICAgICAgICAgICdsaXN0X215X3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2xpc3RfbXlfdHJhZHNfZnJvbV90cycsXG4gICAgICAgICAgICAgICAgJ2xpc3RfcGF5bWVudF9tZXRob2RzJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9wYXltZW50cycsXG4gICAgICAgICAgICAgICAgJ3JlZGVlbV9jb2RlJyxcbiAgICAgICAgICAgICAgICAncmVzaWduJyxcbiAgICAgICAgICAgICAgICAnc2lnbmluJyxcbiAgICAgICAgICAgICAgICAnc2lnbm91dCcsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX2RldGFpbHMnLFxuICAgICAgICAgICAgICAgICd0cmFkZV9vcHRpb25zJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd19ieV9pZCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQYWlycyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0cyk7XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwga2V5cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1trZXlzW3BdXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ2lkJ107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gcHJvZHVjdFsnbmFtZSddO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VycyA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VycyAoKTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHRpY2tlcnNbcFsnaWQnXV07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWF4J10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWluJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhc2snOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogcGFyc2VGbG9hdCAodGlja2VyWydmaXJzdCddKSxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXNEZXB0aCAoe1xuICAgICAgICAgICAgJ3BhaXJfaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXNIaXN0b3J5ICh7XG4gICAgICAgICAgICAncGFpcl9pZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgc2lnbkluICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RTaWduaW4gKHtcbiAgICAgICAgICAgICdsb2dpbic6IHRoaXMubG9naW4sXG4gICAgICAgICAgICAncGFzc3dkJzogdGhpcy5wYXNzd29yZCxcbiAgICAgICAgfSk7XG4gICAgfSwgICAgXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3BhaXJfaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnZGlyJzogKHNpZGUgPT0gJ2J1eScpID8gJ2JpZCcgOiAnYXNrJyxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdENyZWF0ZVRyYWRlICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHBhdGg7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAodGhpcy5leHRlbmQgKHsgJ3Rva2VuJzogdGhpcy5hcGlLZXkgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXRtYXJrZXQgPSB7XG5cbiAgICAnaWQnOiAnYml0bWFya2V0JyxcbiAgICAnbmFtZSc6ICdCaXRNYXJrZXQnLFxuICAgICdjb3VudHJpZXMnOiBbICdQTCcsICdFVScsIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDMwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjcyNTYtYTg1NTUyMDAtNWVmOS0xMWU3LTk2ZmQtNDY5YTY1ZTJiMGJkLmpwZycsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAncHVibGljJzogJ2h0dHBzOi8vd3d3LmJpdG1hcmtldC5uZXQnLFxuICAgICAgICAgICAgJ3ByaXZhdGUnOiAnaHR0cHM6Ly93d3cuYml0bWFya2V0LnBsL2FwaTIvJywgLy8gbGFzdCBzbGFzaCBpcyBjcml0aWNhbFxuICAgICAgICB9LFxuICAgICAgICAnd3d3JzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3LmJpdG1hcmtldC5wbCcsXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cuYml0bWFya2V0Lm5ldCcsXG4gICAgICAgIF0sXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cuYml0bWFya2V0Lm5ldC9kb2NzLnBocD9maWxlPWFwaV9wdWJsaWMuaHRtbCcsXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cuYml0bWFya2V0Lm5ldC9kb2NzLnBocD9maWxlPWFwaV9wcml2YXRlLmh0bWwnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9iaXRtYXJrZXQtbmV0L2FwaScsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnanNvbi97bWFya2V0fS90aWNrZXInLFxuICAgICAgICAgICAgICAgICdqc29uL3ttYXJrZXR9L29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ2pzb24ve21hcmtldH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnanNvbi9jdHJhbnNmZXInLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vOTBtJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzZoJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzFkJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzdkJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzFtJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzNtJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzZtJyxcbiAgICAgICAgICAgICAgICAnZ3JhcGhzL3ttYXJrZXR9LzF5JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2luZm8nLFxuICAgICAgICAgICAgICAgICd0cmFkZScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2FscycsXG4gICAgICAgICAgICAgICAgJ3RyYWRpbmdkZXNrJyxcbiAgICAgICAgICAgICAgICAndHJhZGluZ2Rlc2tTdGF0dXMnLFxuICAgICAgICAgICAgICAgICd0cmFkaW5nZGVza0NvbmZpcm0nLFxuICAgICAgICAgICAgICAgICdjcnlwdG90cmFkaW5nZGVzaycsXG4gICAgICAgICAgICAgICAgJ2NyeXB0b3RyYWRpbmdkZXNrU3RhdHVzJyxcbiAgICAgICAgICAgICAgICAnY3J5cHRvdHJhZGluZ2Rlc2tDb25maXJtJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd0ZpYXQnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd1BMTlBQJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdGaWF0RmFzdCcsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXQnLFxuICAgICAgICAgICAgICAgICd0cmFuc2ZlcicsXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVycycsXG4gICAgICAgICAgICAgICAgJ21hcmdpbkxpc3QnLFxuICAgICAgICAgICAgICAgICdtYXJnaW5PcGVuJyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luQ2xvc2UnLFxuICAgICAgICAgICAgICAgICdtYXJnaW5DYW5jZWwnLFxuICAgICAgICAgICAgICAgICdtYXJnaW5Nb2RpZnknLFxuICAgICAgICAgICAgICAgICdtYXJnaW5CYWxhbmNlQWRkJyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luQmFsYW5jZVJlbW92ZScsXG4gICAgICAgICAgICAgICAgJ3N3YXBMaXN0JyxcbiAgICAgICAgICAgICAgICAnc3dhcE9wZW4nLFxuICAgICAgICAgICAgICAgICdzd2FwQ2xvc2UnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9QTE4nOiB7ICdpZCc6ICdCVENQTE4nLCAnc3ltYm9sJzogJ0JUQy9QTE4nLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnUExOJyB9LFxuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ0JUQ0VVUicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdMVEMvUExOJzogeyAnaWQnOiAnTFRDUExOJywgJ3N5bWJvbCc6ICdMVEMvUExOJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ1BMTicgfSxcbiAgICAgICAgJ0xUQy9CVEMnOiB7ICdpZCc6ICdMVENCVEMnLCAnc3ltYm9sJzogJ0xUQy9CVEMnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnTE1YL0JUQyc6IHsgJ2lkJzogJ0xpdGVNaW5lWEJUQycsICdzeW1ib2wnOiAnTE1YL0JUQycsICdiYXNlJzogJ0xNWCcsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHsgXG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldEpzb25NYXJrZXRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRKc29uTWFya2V0VGlja2VyICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldEpzb25NYXJrZXRUcmFkZXMgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3JhdGUnOiBwcmljZSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddW3R5cGVdO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9ICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCArICcuanNvbicsIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAndG9uY2UnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnbWV0aG9kJzogcGF0aCxcbiAgICAgICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0FQSS1LZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnQVBJLUhhc2gnOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0bWV4ID0ge1xuXG4gICAgJ2lkJzogJ2JpdG1leCcsXG4gICAgJ25hbWUnOiAnQml0TUVYJyxcbiAgICAnY291bnRyaWVzJzogJ1NDJywgLy8gU2V5Y2hlbGxlc1xuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjMxOS1mNjUzYzZlNi01ZWQ0LTExZTctOTMzZC1mMGJjMzY5OWFlOGYuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5iaXRtZXguY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5iaXRtZXguY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3d3dy5iaXRtZXguY29tL2FwcC9hcGlPdmVydmlldycsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL0JpdE1FWC9hcGktY29ubmVjdG9ycy90cmVlL21hc3Rlci9vZmZpY2lhbC1odHRwJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdhbm5vdW5jZW1lbnQnLFxuICAgICAgICAgICAgICAgICdhbm5vdW5jZW1lbnQvdXJnZW50JyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZycsXG4gICAgICAgICAgICAgICAgJ2luc3RydW1lbnQnLFxuICAgICAgICAgICAgICAgICdpbnN0cnVtZW50L2FjdGl2ZScsXG4gICAgICAgICAgICAgICAgJ2luc3RydW1lbnQvYWN0aXZlQW5kSW5kaWNlcycsXG4gICAgICAgICAgICAgICAgJ2luc3RydW1lbnQvYWN0aXZlSW50ZXJ2YWxzJyxcbiAgICAgICAgICAgICAgICAnaW5zdHJ1bWVudC9jb21wb3NpdGVJbmRleCcsXG4gICAgICAgICAgICAgICAgJ2luc3RydW1lbnQvaW5kaWNlcycsXG4gICAgICAgICAgICAgICAgJ2luc3VyYW5jZScsXG4gICAgICAgICAgICAgICAgJ2xlYWRlcmJvYXJkJyxcbiAgICAgICAgICAgICAgICAnbGlxdWlkYXRpb24nLFxuICAgICAgICAgICAgICAgICdvcmRlckJvb2snLFxuICAgICAgICAgICAgICAgICdvcmRlckJvb2svTDInLFxuICAgICAgICAgICAgICAgICdxdW90ZScsXG4gICAgICAgICAgICAgICAgJ3F1b3RlL2J1Y2tldGVkJyxcbiAgICAgICAgICAgICAgICAnc2NoZW1hJyxcbiAgICAgICAgICAgICAgICAnc2NoZW1hL3dlYnNvY2tldEhlbHAnLFxuICAgICAgICAgICAgICAgICdzZXR0bGVtZW50JyxcbiAgICAgICAgICAgICAgICAnc3RhdHMnLFxuICAgICAgICAgICAgICAgICdzdGF0cy9oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAndHJhZGUnLFxuICAgICAgICAgICAgICAgICd0cmFkZS9idWNrZXRlZCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2FwaUtleScsXG4gICAgICAgICAgICAgICAgJ2NoYXQnLFxuICAgICAgICAgICAgICAgICdjaGF0L2NoYW5uZWxzJyxcbiAgICAgICAgICAgICAgICAnY2hhdC9jb25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgICdleGVjdXRpb24nLFxuICAgICAgICAgICAgICAgICdleGVjdXRpb24vdHJhZGVIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnbm90aWZpY2F0aW9uJyxcbiAgICAgICAgICAgICAgICAnb3JkZXInLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgJ3VzZXInLFxuICAgICAgICAgICAgICAgICd1c2VyL2FmZmlsaWF0ZVN0YXR1cycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvY2hlY2tSZWZlcnJhbENvZGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2NvbW1pc3Npb24nLFxuICAgICAgICAgICAgICAgICd1c2VyL2RlcG9zaXRBZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAndXNlci9tYXJnaW4nLFxuICAgICAgICAgICAgICAgICd1c2VyL21pbldpdGhkcmF3YWxGZWUnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0SGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0U3VtbWFyeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2FwaUtleScsXG4gICAgICAgICAgICAgICAgJ2FwaUtleS9kaXNhYmxlJyxcbiAgICAgICAgICAgICAgICAnYXBpS2V5L2VuYWJsZScsXG4gICAgICAgICAgICAgICAgJ2NoYXQnLFxuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2J1bGsnLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWxBbGxBZnRlcicsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2Nsb3NlUG9zaXRpb24nLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9pc29sYXRlJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vbGV2ZXJhZ2UnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9yaXNrTGltaXQnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi90cmFuc2Zlck1hcmdpbicsXG4gICAgICAgICAgICAgICAgJ3VzZXIvY2FuY2VsV2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvY29uZmlybUVtYWlsJyxcbiAgICAgICAgICAgICAgICAndXNlci9jb25maXJtRW5hYmxlVEZBJyxcbiAgICAgICAgICAgICAgICAndXNlci9jb25maXJtV2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZGlzYWJsZVRGQScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbG9nb3V0JyxcbiAgICAgICAgICAgICAgICAndXNlci9sb2dvdXRBbGwnLFxuICAgICAgICAgICAgICAgICd1c2VyL3ByZWZlcmVuY2VzJyxcbiAgICAgICAgICAgICAgICAndXNlci9yZXF1ZXN0RW5hYmxlVEZBJyxcbiAgICAgICAgICAgICAgICAndXNlci9yZXF1ZXN0V2l0aGRyYXdhbCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3B1dCc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXInLFxuICAgICAgICAgICAgICAgICdvcmRlci9idWxrJyxcbiAgICAgICAgICAgICAgICAndXNlcicsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlbGV0ZSc6IFtcbiAgICAgICAgICAgICAgICAnYXBpS2V5JyxcbiAgICAgICAgICAgICAgICAnb3JkZXInLFxuICAgICAgICAgICAgICAgICdvcmRlci9hbGwnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfVxuICAgIH0sIFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0SW5zdHJ1bWVudEFjdGl2ZSAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnc3ltYm9sJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ3VuZGVybHlpbmcnXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ3F1b3RlQ3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBpc0Z1dHVyZXNDb250cmFjdCA9IGlkICE9IChiYXNlICsgcXVvdGUpO1xuICAgICAgICAgICAgYmFzZSA9IHRoaXMuY29tbW9uQ3VycmVuY3lDb2RlIChiYXNlKTtcbiAgICAgICAgICAgIHF1b3RlID0gdGhpcy5jb21tb25DdXJyZW5jeUNvZGUgKHF1b3RlKTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBpc0Z1dHVyZXNDb250cmFjdCA/IGlkIDogKGJhc2UgKyAnLycgKyBxdW90ZSk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRVc2VyTWFyZ2luICh7ICdjdXJyZW5jeSc6ICdhbGwnIH0pO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRPcmRlckJvb2tMMiAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdiaW5TaXplJzogJzFkJyxcbiAgICAgICAgICAgICdwYXJ0aWFsJzogdHJ1ZSxcbiAgICAgICAgICAgICdjb3VudCc6IDEsXG4gICAgICAgICAgICAncmV2ZXJzZSc6IHRydWUsICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIGxldCBxdW90ZXMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFF1b3RlQnVja2V0ZWQgKHJlcXVlc3QpO1xuICAgICAgICBsZXQgcXVvdGVzTGVuZ3RoID0gcXVvdGVzLmxlbmd0aDtcbiAgICAgICAgbGV0IHF1b3RlID0gcXVvdGVzW3F1b3Rlc0xlbmd0aCAtIDFdO1xuICAgICAgICBsZXQgdGlja2VycyA9IGF3YWl0IHRoaXMucHVibGljR2V0VHJhZGVCdWNrZXRlZCAocmVxdWVzdCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSB0aWNrZXJzWzBdO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAocXVvdGVbJ2JpZFByaWNlJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHF1b3RlWydhc2tQcmljZSddKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWyd2d2FwJ10pLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2Nsb3NlJ10pLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydob21lTm90aW9uYWwnXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2ZvcmVpZ25Ob3Rpb25hbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZSAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3NpZGUnOiB0aGlzLmNhcGl0YWxpemUgKHNpZGUpLFxuICAgICAgICAgICAgJ29yZGVyUXR5JzogYW1vdW50LFxuICAgICAgICAgICAgJ29yZFR5cGUnOiB0aGlzLmNhcGl0YWxpemUgKHR5cGUpLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3JhdGUnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgcXVlcnkgPSAnL2FwaS8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgIHF1ZXJ5ICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHF1ZXJ5O1xuICAgICAgICBpZiAodHlwZSA9PSAncHJpdmF0ZScpIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBpZiAobWV0aG9kID09ICdQT1NUJylcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHBhcmFtcyk7XG4gICAgICAgICAgICBsZXQgcmVxdWVzdCA9IFsgbWV0aG9kLCBxdWVyeSwgbm9uY2UsIGJvZHkgfHwgJyddLmpvaW4gKCcnKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAnYXBpLW5vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ2FwaS1rZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnYXBpLXNpZ25hdHVyZSc6IHRoaXMuaG1hYyAocmVxdWVzdCwgdGhpcy5zZWNyZXQpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdHNvID0ge1xuXG4gICAgJ2lkJzogJ2JpdHNvJyxcbiAgICAnbmFtZSc6ICdCaXRzbycsXG4gICAgJ2NvdW50cmllcyc6ICdNWCcsIC8vIE1leGljb1xuICAgICdyYXRlTGltaXQnOiAyMDAwLCAvLyAzMCByZXF1ZXN0cyBwZXIgbWludXRlXG4gICAgJ3ZlcnNpb24nOiAndjMnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MzM1LTcxNWNlN2FhLTVlZDUtMTFlNy04OGE4LTE3M2EyN2JiMzBmZS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLmJpdHNvLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9iaXRzby5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vYml0c28uY29tL2FwaV9pbmZvJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdhdmFpbGFibGVfYm9va3MnLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLFxuICAgICAgICAgICAgICAgICdvcmRlcl9ib29rJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudF9zdGF0dXMnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnZmVlcycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRpbmdzJyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZ3Mve2ZpZH0nLFxuICAgICAgICAgICAgICAgICdmdW5kaW5nX2Rlc3RpbmF0aW9uJyxcbiAgICAgICAgICAgICAgICAna3ljX2RvY3VtZW50cycsXG4gICAgICAgICAgICAgICAgJ2xlZGdlcicsXG4gICAgICAgICAgICAgICAgJ2xlZGdlci90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdsZWRnZXIvZmVlcycsXG4gICAgICAgICAgICAgICAgJ2xlZGdlci9mdW5kaW5ncycsXG4gICAgICAgICAgICAgICAgJ2xlZGdlci93aXRoZHJhd2FscycsXG4gICAgICAgICAgICAgICAgJ214X2JhbmtfY29kZXMnLFxuICAgICAgICAgICAgICAgICdvcGVuX29yZGVycycsXG4gICAgICAgICAgICAgICAgJ29yZGVyX3RyYWRlcy97b2lkfScsXG4gICAgICAgICAgICAgICAgJ29yZGVycy97b2lkfScsXG4gICAgICAgICAgICAgICAgJ3VzZXJfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAndXNlcl90cmFkZXMve3RpZH0nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy8nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy97d2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2JpdGNvaW5fd2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ2RlYml0X2NhcmRfd2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ2V0aGVyX3dpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdwaG9uZV9udW1iZXInLFxuICAgICAgICAgICAgICAgICdwaG9uZV92ZXJpZmljYXRpb24nLFxuICAgICAgICAgICAgICAgICdwaG9uZV93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnc3BlaV93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICdvcmRlcnMve29pZH0nLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvYWxsJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0QXZhaWxhYmxlQm9va3MgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0c1sncGF5bG9hZCddLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWydwYXlsb2FkJ11bcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0Wydib29rJ107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gaWQudG9VcHBlckNhc2UgKCkucmVwbGFjZSAoJ18nLCAnLycpO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRPcmRlckJvb2sgKHtcbiAgICAgICAgICAgICdib29rJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdib29rJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydwYXlsb2FkJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLnBhcnNlODYwMSAodGlja2VyWydjcmVhdGVkX2F0J10pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnc2lkZSc6IHNpZGUsXG4gICAgICAgICAgICAndHlwZSc6IHR5cGUsXG4gICAgICAgICAgICAnbWFqb3InOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVycyAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHF1ZXJ5O1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocGFyYW1zKTtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBsZXQgcmVxdWVzdCA9IFsgbm9uY2UsIG1ldGhvZCwgcXVlcnksIGJvZHkgfHwgJycgXS5qb2luICgnJyk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5obWFjIChyZXF1ZXN0LCB0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBsZXQgYXV0aCA9IHRoaXMuYXBpS2V5ICsgJzonICsgbm9uY2UgKyAnOicgKyBzaWduYXR1cmU7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnQXV0aG9yaXphdGlvbic6IFwiQml0c28gXCIgKyBhdXRoIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXRzdGFtcCA9IHtcblxuICAgICdpZCc6ICdiaXRzdGFtcCcsXG4gICAgJ25hbWUnOiAnQml0c3RhbXAnLFxuICAgICdjb3VudHJpZXMnOiAnVUsnLFxuICAgICdyYXRlTGltaXQnOiAxMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YyJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc4NjM3Ny04YzhhYjU3ZS01ZmU5LTExZTctOGVhNC0yYjA1YjZiY2NlZWMuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5iaXRzdGFtcC5uZXQvYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5iaXRzdGFtcC5uZXQnLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vd3d3LmJpdHN0YW1wLm5ldC9hcGknLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ29yZGVyX2Jvb2sve2lkfS8nLFxuICAgICAgICAgICAgICAgICd0aWNrZXJfaG91ci97aWR9LycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlci97aWR9LycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucy97aWR9LycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlLycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2Uve2lkfS8nLFxuICAgICAgICAgICAgICAgICdidXkve2lkfS8nLFxuICAgICAgICAgICAgICAgICdidXkvbWFya2V0L3tpZH0vJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVyLycsXG4gICAgICAgICAgICAgICAgJ2xpcXVpZGF0aW9uX2FkZHJlc3MvaW5mby8nLFxuICAgICAgICAgICAgICAgICdsaXF1aWRhdGlvbl9hZGRyZXNzL25ldy8nLFxuICAgICAgICAgICAgICAgICdvcGVuX29yZGVycy9hbGwvJyxcbiAgICAgICAgICAgICAgICAnb3Blbl9vcmRlcnMve2lkfS8nLFxuICAgICAgICAgICAgICAgICdzZWxsL3tpZH0vJyxcbiAgICAgICAgICAgICAgICAnc2VsbC9tYXJrZXQve2lkfS8nLFxuICAgICAgICAgICAgICAgICd0cmFuc2Zlci1mcm9tLW1haW4vJyxcbiAgICAgICAgICAgICAgICAndHJhbnNmZXItdG8tbWFpbi8nLFxuICAgICAgICAgICAgICAgICd1c2VyX3RyYW5zYWN0aW9ucy8nLFxuICAgICAgICAgICAgICAgICd1c2VyX3RyYW5zYWN0aW9ucy97aWR9LycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWwvY2FuY2VsLycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWwvb3Blbi8nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2FsL3N0YXR1cy8nLFxuICAgICAgICAgICAgICAgICd4cnBfYWRkcmVzcy8nLFxuICAgICAgICAgICAgICAgICd4cnBfd2l0aGRyYXdhbC8nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdidGN1c2QnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ2J0Y2V1cicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdFVVIvVVNEJzogeyAnaWQnOiAnZXVydXNkJywgJ3N5bWJvbCc6ICdFVVIvVVNEJywgJ2Jhc2UnOiAnRVVSJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ1hSUC9VU0QnOiB7ICdpZCc6ICd4cnB1c2QnLCAnc3ltYm9sJzogJ1hSUC9VU0QnLCAnYmFzZSc6ICdYUlAnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnWFJQL0VVUic6IHsgJ2lkJzogJ3hycGV1cicsICdzeW1ib2wnOiAnWFJQL0VVUicsICdiYXNlJzogJ1hSUCcsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdYUlAvQlRDJzogeyAnaWQnOiAneHJwYnRjJywgJ3N5bWJvbCc6ICdYUlAvQlRDJywgJ2Jhc2UnOiAnWFJQJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICB9LFxuICAgIFxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVyQm9va0lkICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXJJZCAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50ICh0aWNrZXJbJ3RpbWVzdGFtcCddKSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYW5zYWN0aW9uc0lkICh7IFxuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIFxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVBvc3QnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKTtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpXG4gICAgICAgICAgICBtZXRob2QgKz0gJ01hcmtldCc7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIG1ldGhvZCArPSAnSWQnO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGxldCBhdXRoID0gbm9uY2UgKyB0aGlzLnVpZCArIHRoaXMuYXBpS2V5O1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaG1hYyAoYXV0aCwgdGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgcXVlcnkgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnc2lnbmF0dXJlJzogc2lnbmF0dXJlLnRvVXBwZXJDYXNlICgpLFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcXVlcnkpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXR0cmV4ID0ge1xuXG4gICAgJ2lkJzogJ2JpdHRyZXgnLFxuICAgICduYW1lJzogJ0JpdHRyZXgnLFxuICAgICdjb3VudHJpZXMnOiAnVVMnLFxuICAgICd2ZXJzaW9uJzogJ3YxLjEnLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MzUyLWNmMGIzYzI2LTVlZDUtMTFlNy04MmI3LWYzODI2YjdhOTdkOC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYml0dHJleC5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2JpdHRyZXguY29tJyxcbiAgICAgICAgJ2RvYyc6IFsgXG4gICAgICAgICAgICAnaHR0cHM6Ly9iaXR0cmV4LmNvbS9Ib21lL0FwaScsXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cubnBtanMub3JnL3BhY2thZ2Uvbm9kZS5iaXR0cmV4LmFwaScsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnY3VycmVuY2llcycsXG4gICAgICAgICAgICAgICAgJ21hcmtldGhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0c3VtbWFyaWVzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0c3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsICAgICAgICAgICAgXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAnYWNjb3VudCc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRhZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdGhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ29yZGVyaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtldCc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2J1eWxpbWl0JyxcbiAgICAgICAgICAgICAgICAnYnV5bWFya2V0JyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb3Blbm9yZGVycycsXG4gICAgICAgICAgICAgICAgJ3NlbGxsaW1pdCcsXG4gICAgICAgICAgICAgICAgJ3NlbGxtYXJrZXQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0TWFya2V0cyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzWydyZXN1bHQnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sncmVzdWx0J11bcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydNYXJrZXROYW1lJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ0Jhc2VDdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsnTWFya2V0Q3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjY291bnRHZXRCYWxhbmNlcyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0T3JkZXJib29rICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiAnYm90aCcsXG4gICAgICAgICAgICAnZGVwdGgnOiA1MCxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0TWFya2V0c3VtbWFyeSAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsncmVzdWx0J11bMF07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLnBhcnNlODYwMSAodGlja2VyWydUaW1lU3RhbXAnXSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ0hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydMb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydCaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydBc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ0xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydWb2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0TWFya2V0aGlzdG9yeSAoeyBcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdtYXJrZXRHZXQnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKSArIHR5cGU7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAncXVhbnRpdHknOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncmF0ZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9IHR5cGUgKyAnLycgKyBtZXRob2QudG9Mb3dlckNhc2UgKCkgKyBwYXRoO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgdXJsICs9IHR5cGUgKyAnLyc7XG4gICAgICAgICAgICBpZiAoKCh0eXBlID09ICdhY2NvdW50JykgJiYgKHBhdGggIT0gJ3dpdGhkcmF3JykpIHx8IChwYXRoID09ICdvcGVub3JkZXJzJykpXG4gICAgICAgICAgICAgICAgdXJsICs9IG1ldGhvZC50b0xvd2VyQ2FzZSAoKTtcbiAgICAgICAgICAgIHVybCArPSBwYXRoICsgJz8nICsgdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ2FwaWtleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnYXBpc2lnbic6IHRoaXMuaG1hYyAodXJsLCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBidGNjaGluYSA9IHtcblxuICAgICdpZCc6ICdidGNjaGluYScsXG4gICAgJ25hbWUnOiAnQlRDQ2hpbmEnLFxuICAgICdjb3VudHJpZXMnOiAnQ04nLFxuICAgICdyYXRlTGltaXQnOiAzMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjM2OC00NjViMzI4Ni01ZWQ2LTExZTctOWExMS0wZjY0NjdlMWQ4MmIuanBnJyxcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdwdWJsaWMnOiAnaHR0cHM6Ly9kYXRhLmJ0Y2NoaW5hLmNvbS9kYXRhJyxcbiAgICAgICAgICAgICdwcml2YXRlJzogJ2h0dHBzOi8vYXBpLmJ0Y2NoaW5hLmNvbS9hcGlfdHJhZGVfdjEucGhwJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5idGNjaGluYS5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vd3d3LmJ0Y2NoaW5hLmNvbS9hcGlkb2NzJ1xuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2hpc3RvcnlkYXRhJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ0J1eUljZWJlcmdPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0J1eU9yZGVyJyxcbiAgICAgICAgICAgICAgICAnQnV5T3JkZXIyJyxcbiAgICAgICAgICAgICAgICAnQnV5U3RvcE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnQ2FuY2VsSWNlYmVyZ09yZGVyJyxcbiAgICAgICAgICAgICAgICAnQ2FuY2VsT3JkZXInLFxuICAgICAgICAgICAgICAgICdDYW5jZWxTdG9wT3JkZXInLFxuICAgICAgICAgICAgICAgICdHZXRBY2NvdW50SW5mbycsXG4gICAgICAgICAgICAgICAgJ2dldEFyY2hpdmVkT3JkZXInLFxuICAgICAgICAgICAgICAgICdnZXRBcmNoaXZlZE9yZGVycycsXG4gICAgICAgICAgICAgICAgJ0dldERlcG9zaXRzJyxcbiAgICAgICAgICAgICAgICAnR2V0SWNlYmVyZ09yZGVyJyxcbiAgICAgICAgICAgICAgICAnR2V0SWNlYmVyZ09yZGVycycsXG4gICAgICAgICAgICAgICAgJ0dldE1hcmtldERlcHRoJyxcbiAgICAgICAgICAgICAgICAnR2V0TWFya2V0RGVwdGgyJyxcbiAgICAgICAgICAgICAgICAnR2V0T3JkZXInLFxuICAgICAgICAgICAgICAgICdHZXRPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdHZXRTdG9wT3JkZXInLFxuICAgICAgICAgICAgICAgICdHZXRTdG9wT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnR2V0VHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAnR2V0V2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ0dldFdpdGhkcmF3YWxzJyxcbiAgICAgICAgICAgICAgICAnUmVxdWVzdFdpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdTZWxsSWNlYmVyZ09yZGVyJyxcbiAgICAgICAgICAgICAgICAnU2VsbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnU2VsbE9yZGVyMicsXG4gICAgICAgICAgICAgICAgJ1NlbGxTdG9wT3JkZXInLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAnbWFya2V0JzogJ2FsbCcsXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHByb2R1Y3RzKTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQga2V5ID0ga2V5c1twXTtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNba2V5XTtcbiAgICAgICAgICAgIGxldCBwYXJ0cyA9IGtleS5zcGxpdCAoJ18nKTtcbiAgICAgICAgICAgIGxldCBpZCA9IHBhcnRzWzFdO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBpZC5zbGljZSAoMCwgMyk7XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBpZC5zbGljZSAoMywgNik7XG4gICAgICAgICAgICBiYXNlID0gYmFzZS50b1VwcGVyQ2FzZSAoKTtcbiAgICAgICAgICAgIHF1b3RlID0gcXVvdGUudG9VcHBlckNhc2UgKCk7XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEdldEFjY291bnRJbmZvICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXJzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiBwWydpZCddLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHRpY2tlcnNbJ3RpY2tlciddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWydkYXRlJ10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWyd2d2FwJ10pLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ByZXZfY2xvc2UnXSksXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXMgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSkgKyAnT3JkZXIyJztcbiAgICAgICAgbGV0IG9yZGVyID0ge307XG4gICAgICAgIGxldCBpZCA9IHBbJ2lkJ10udG9VcHBlckNhc2UgKCk7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKSB7XG4gICAgICAgICAgICBvcmRlclsncGFyYW1zJ10gPSBbIHVuZGVmaW5lZCwgYW1vdW50LCBpZCBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3JkZXJbJ3BhcmFtcyddID0gWyBwcmljZSwgYW1vdW50LCBpZCBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIG5vbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWljcm9zZWNvbmRzICgpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXVt0eXBlXSArICcvJyArIHBhdGg7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBwID0gW107XG4gICAgICAgICAgICBpZiAoJ3BhcmFtcycgaW4gcGFyYW1zKVxuICAgICAgICAgICAgICAgIHAgPSBwYXJhbXNbJ3BhcmFtcyddO1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGxldCByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgICAgICdtZXRob2QnOiBwYXRoLFxuICAgICAgICAgICAgICAgICdpZCc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdwYXJhbXMnOiBwLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHAgPSBwLmpvaW4gKCcsJyk7XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHJlcXVlc3QpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gKFxuICAgICAgICAgICAgICAgICd0b25jZT0nICsgbm9uY2UgK1xuICAgICAgICAgICAgICAgICcmYWNjZXNza2V5PScgKyB0aGlzLmFwaUtleSArXG4gICAgICAgICAgICAgICAgJyZyZXF1ZXN0bWV0aG9kPScgKyBtZXRob2QudG9Mb3dlckNhc2UgKCkgK1xuICAgICAgICAgICAgICAgICcmaWQ9JyArIG5vbmNlICtcbiAgICAgICAgICAgICAgICAnJm1ldGhvZD0nICsgcGF0aCArXG4gICAgICAgICAgICAgICAgJyZwYXJhbXM9JyArIHBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5obWFjIChxdWVyeSwgdGhpcy5zZWNyZXQsICdzaGExJyk7XG4gICAgICAgICAgICBsZXQgYXV0aCA9IHRoaXMuYXBpS2V5ICsgJzonICsgc2lnbmF0dXJlOyBcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiAnQmFzaWMgJyArIHRoaXMuc3RyaW5nVG9CYXNlNjQgKHF1ZXJ5KSxcbiAgICAgICAgICAgICAgICAnSnNvbi1ScGMtVG9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBidGN4ID0ge1xuXG4gICAgJ2lkJzogJ2J0Y3gnLFxuICAgICduYW1lJzogJ0JUQ1gnLFxuICAgICdjb3VudHJpZXMnOiBbICdJUycsICdVUycsICdFVScsIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDMwMDAsIC8vIHN1cHBvcnQgaW4gZW5nbGlzaCBpcyB2ZXJ5IHBvb3IsIHVuYWJsZSB0byB0ZWxsIHJhdGUgbGltaXRzXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2Mzg1LTlmZGNjOThjLTVlZDYtMTFlNy04ZjE0LTY2ZDVlNWNkNDdlNi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYnRjLXguaXMvYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2J0Yy14LmlzJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2J0Yy14LmlzL2N1c3RvbS9hcGktZG9jdW1lbnQuaHRtbCcsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZGVwdGgve2lkfS97bGltaXR9JyxcbiAgICAgICAgICAgICAgICAndGlja2VyL3tpZH0nLCAgICAgICAgIFxuICAgICAgICAgICAgICAgICd0cmFkZS97aWR9L3tsaW1pdH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3JlZGVlbScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdidGMvdXNkJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdidGMvZXVyJywgJ3N5bWJvbCc6ICdCVEMvRVVSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkgeyBcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXREZXB0aElkTGltaXQgKHsgXG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnbGltaXQnOiAxMDAwLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHsgXG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlcklkICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd0aW1lJ10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZUlkTGltaXQgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdsaW1pdCc6IDEwMCxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFRyYWRlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLnRvVXBwZXJDYXNlICgpLFxuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9IHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICB1cmwgKz0gdHlwZTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnTWV0aG9kJzogcGF0aC50b1VwcGVyQ2FzZSAoKSxcbiAgICAgICAgICAgICAgICAnTm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdTaWduYXR1cmUnOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYnhpbnRoID0ge1xuXG4gICAgJ2lkJzogJ2J4aW50aCcsXG4gICAgJ25hbWUnOiAnQlguaW4udGgnLFxuICAgICdjb3VudHJpZXMnOiAnVEgnLCAvLyBUaGFpbGFuZFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NDEyLTU2N2IxZWI0LTVlZDctMTFlNy05NGE4LWZmNmEzODg0ZjZjNS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYnguaW4udGgvYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2J4LmluLnRoJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2J4LmluLnRoL2luZm8vYXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICcnLCAvLyB0aWNrZXJcbiAgICAgICAgICAgICAgICAnb3B0aW9ucycsXG4gICAgICAgICAgICAgICAgJ29wdGlvbmJvb2snLFxuICAgICAgICAgICAgICAgICdvcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICdwYWlyaW5nJyxcbiAgICAgICAgICAgICAgICAndHJhZGUnLFxuICAgICAgICAgICAgICAgICd0cmFkZWhpc3RvcnknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2JpbGxlcicsXG4gICAgICAgICAgICAgICAgJ2JpbGxncm91cCcsXG4gICAgICAgICAgICAgICAgJ2JpbGxwYXknLFxuICAgICAgICAgICAgICAgICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0JyxcbiAgICAgICAgICAgICAgICAnZ2V0b3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1pc3N1ZScsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1iaWQnLFxuICAgICAgICAgICAgICAgICdvcHRpb24tc2VsbCcsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1teWlzc3VlJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLW15YmlkJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLW15b3B0aW9ucycsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1leGVyY2lzZScsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1jYW5jZWwnLFxuICAgICAgICAgICAgICAgICdvcHRpb24taGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWwtaGlzdG9yeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQYWlyaW5nICgpO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0cyk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW2tleXNbcF1dO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsncGFpcmluZ19pZCddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0WydwcmltYXJ5X2N1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydzZWNvbmRhcnlfY3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0T3JkZXJib29rICh7XG4gICAgICAgICAgICAncGFpcmluZyc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHRpY2tlcnMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldCAoeyAncGFpcmluZyc6IHBbJ2lkJ10gfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSB0aWNrZXJzW3BbJ2lkJ11dO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbG93JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3JkZXJib29rJ11bJ2JpZHMnXVsnaGlnaGJpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29yZGVyYm9vayddWydhc2tzJ11bJ2hpZ2hiaWQnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RfcHJpY2UnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogcGFyc2VGbG9hdCAodGlja2VyWydjaGFuZ2UnXSksXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZV8yNGhvdXJzJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlICh7XG4gICAgICAgICAgICAncGFpcmluZyc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ3BhaXJpbmcnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3JhdGUnOiBwcmljZSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgcGF0aCArICcvJztcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3ByaXZhdGUnKSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaGFzaCAodGhpcy5hcGlLZXkgKyBub25jZSArIHRoaXMuc2VjcmV0LCAnc2hhMjU2Jyk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdzaWduYXR1cmUnOiBzaWduYXR1cmUsXG4gICAgICAgICAgICAgICAgLy8gdHdvZmE6IHRoaXMudHdvZmEsXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGNjZXggPSB7XG5cbiAgICAnaWQnOiAnY2NleCcsXG4gICAgJ25hbWUnOiAnQy1DRVgnLFxuICAgICdjb3VudHJpZXMnOiBbICdERScsICdFVScsIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY0MzMtMTY4ODFmOTAtNWVkOC0xMWU3LTkyZjgtM2Q5MmNjNzQ3YTZjLmpwZycsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAndGlja2Vycyc6ICdodHRwczovL2MtY2V4LmNvbS90JyxcbiAgICAgICAgICAgICdwdWJsaWMnOiAnaHR0cHM6Ly9jLWNleC5jb20vdC9hcGlfcHViLmh0bWwnLFxuICAgICAgICAgICAgJ3ByaXZhdGUnOiAnaHR0cHM6Ly9jLWNleC5jb20vdC9hcGkuaHRtbCcsXG4gICAgICAgIH0sXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9jLWNleC5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vYy1jZXguY29tLz9pZD1hcGknLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3RpY2tlcnMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdjb2lubmFtZXMnLFxuICAgICAgICAgICAgICAgICd7bWFya2V0fScsXG4gICAgICAgICAgICAgICAgJ3BhaXJzJyxcbiAgICAgICAgICAgICAgICAncHJpY2VzJyxcbiAgICAgICAgICAgICAgICAndm9sdW1lX3tjb2lufScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VkaXN0cmlidXRpb24nLFxuICAgICAgICAgICAgICAgICdtYXJrZXRoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnbWFya2V0cycsXG4gICAgICAgICAgICAgICAgJ21hcmtldHN1bW1hcmllcycsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9vaycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHsgICAgICAgICAgICBcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2J1eWxpbWl0JyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnZ2V0YmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2dldGJhbGFuY2VzJywgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2dldG9wZW5vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdnZXRvcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldG9yZGVyaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ215dHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnc2VsbGxpbWl0JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE1hcmtldHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0c1sncmVzdWx0J10ubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3Jlc3VsdCddW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnTWFya2V0TmFtZSddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0WydNYXJrZXRDdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsnQmFzZUN1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0QmFsYW5jZXMgKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVyYm9vayAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogJ2JvdGgnLFxuICAgICAgICAgICAgJ2RlcHRoJzogMTAwLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy50aWNrZXJzR2V0TWFya2V0ICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLnRvTG93ZXJDYXNlICgpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWyd0aWNrZXInXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndXBkYXRlZCddICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RwcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogcGFyc2VGbG9hdCAodGlja2VyWydhdmcnXSksXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5c3VwcG9ydCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRNYXJrZXRoaXN0b3J5ICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiAnYm90aCcsXG4gICAgICAgICAgICAnZGVwdGgnOiAxMDAsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlR2V0JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSkgKyB0eXBlO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdxdWFudGl0eSc6IGFtb3VudCxcbiAgICAgICAgICAgICdyYXRlJzogcHJpY2UsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXVt0eXBlXTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3ByaXZhdGUnKSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5rZXlzb3J0ICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdhJzogcGF0aCxcbiAgICAgICAgICAgICAgICAnYXBpa2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHsgJ2FwaXNpZ24nOiB0aGlzLmhtYWMgKHVybCwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSB9O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnYSc6ICdnZXQnICsgcGF0aCxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsICs9ICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKSArICcuanNvbic7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBjZXggPSB7XG5cbiAgICAnaWQnOiAnY2V4JyxcbiAgICAnbmFtZSc6ICdDRVguSU8nLFxuICAgICdjb3VudHJpZXMnOiBbICdVSycsICdFVScsICdDWScsICdSVScsIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY0NDItOGRkYzMzYjAtNWVkOC0xMWU3LThiOTgtZjc4NmFlZjBmM2M5LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9jZXguaW8vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2NleC5pbycsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9jZXguaW8vY2V4LWFwaScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnY3VycmVuY3lfbGltaXRzJyxcbiAgICAgICAgICAgICAgICAnbGFzdF9wcmljZS97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdsYXN0X3ByaWNlcy97Y3VycmVuY2llc30nLFxuICAgICAgICAgICAgICAgICdvaGxjdi9oZC97eXl5eW1tZGR9L3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ29yZGVyX2Jvb2sve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAndGlja2VyL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcnMve2N1cnJlbmNpZXN9JyxcbiAgICAgICAgICAgICAgICAndHJhZGVfaGlzdG9yeS97cGFpcn0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdjb252ZXJ0L3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3ByaWNlX3N0YXRzL3twYWlyfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdhY3RpdmVfb3JkZXJzX3N0YXR1cy8nLFxuICAgICAgICAgICAgICAgICdhcmNoaXZlZF9vcmRlcnMve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZS8nLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXIvJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVycy97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfcmVwbGFjZV9vcmRlci97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdjbG9zZV9wb3NpdGlvbi97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdnZXRfYWRkcmVzcy8nLFxuICAgICAgICAgICAgICAgICdnZXRfbXlmZWUvJyxcbiAgICAgICAgICAgICAgICAnZ2V0X29yZGVyLycsXG4gICAgICAgICAgICAgICAgJ2dldF9vcmRlcl90eC8nLFxuICAgICAgICAgICAgICAgICdvcGVuX29yZGVycy97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdvcGVuX29yZGVycy8nLFxuICAgICAgICAgICAgICAgICdvcGVuX3Bvc2l0aW9uL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ29wZW5fcG9zaXRpb25zL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3BsYWNlX29yZGVyL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3BsYWNlX29yZGVyL3twYWlyfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEN1cnJlbmN5TGltaXRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ2RhdGEnXVsncGFpcnMnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1snZGF0YSddWydwYWlycyddW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnc3ltYm9sMSddICsgJy8nICsgcHJvZHVjdFsnc3ltYm9sMiddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGlkO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRPcmRlckJvb2tQYWlyICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlclBhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50ICh0aWNrZXJbJ3RpbWVzdGFtcCddKSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogcGFyc2VGbG9hdCAodGlja2VyWydjaGFuZ2UnXSksXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZUhpc3RvcnlQYWlyICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcmRlclsnb3JkZXJfdHlwZSddID0gdHlwZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RQbGFjZU9yZGVyUGFpciAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHsgICBcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdzaWduYXR1cmUnOiB0aGlzLmhtYWMgKG5vbmNlICsgdGhpcy51aWQgKyB0aGlzLmFwaUtleSwgdGhpcy5zZWNyZXQpLnRvVXBwZXJDYXNlICgpLFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcXVlcnkpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGNvaW5jaGVjayA9IHtcblxuICAgICdpZCc6ICdjb2luY2hlY2snLFxuICAgICduYW1lJzogJ2NvaW5jaGVjaycsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0pQJywgJ0lEJywgXSxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjQ2NC0zYjVjM2M3NC01ZWQ5LTExZTctODQwZS0zMWIzMjk2OGUxZGEuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2NvaW5jaGVjay5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2NvaW5jaGVjay5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vY29pbmNoZWNrLmNvbS9kb2N1bWVudHMvZXhjaGFuZ2UvYXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdleGNoYW5nZS9vcmRlcnMvcmF0ZScsXG4gICAgICAgICAgICAgICAgJ29yZGVyX2Jvb2tzJyxcbiAgICAgICAgICAgICAgICAncmF0ZS97cGFpcn0nLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdhY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdhY2NvdW50cy9sZXZlcmFnZV9iYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnYmFua19hY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRfbW9uZXknLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9vcmRlcnMvb3BlbnMnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9vcmRlcnMvdHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2Uvb3JkZXJzL3RyYW5zYWN0aW9uc19wYWdpbmF0aW9uJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvbGV2ZXJhZ2UvcG9zaXRpb25zJyxcbiAgICAgICAgICAgICAgICAnbGVuZGluZy9ib3Jyb3dzL21hdGNoZXMnLFxuICAgICAgICAgICAgICAgICdzZW5kX21vbmV5JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdzJyxcbiAgICAgICAgICAgIF0sICAgICAgICAgICAgXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYmFua19hY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRfbW9uZXkve2lkfS9mYXN0JyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2Uvb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvdHJhbnNmZXJzL3RvX2xldmVyYWdlJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvdHJhbnNmZXJzL2Zyb21fbGV2ZXJhZ2UnLFxuICAgICAgICAgICAgICAgICdsZW5kaW5nL2JvcnJvd3MnLFxuICAgICAgICAgICAgICAgICdsZW5kaW5nL2JvcnJvd3Mve2lkfS9yZXBheScsXG4gICAgICAgICAgICAgICAgJ3NlbmRfbW9uZXknLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd3MnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbmtfYWNjb3VudHMve2lkfScsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL29yZGVycy97aWR9JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdzL3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9KUFknOiAgeyAnaWQnOiAnYnRjX2pweScsICAnc3ltYm9sJzogJ0JUQy9KUFknLCAgJ2Jhc2UnOiAnQlRDJywgICdxdW90ZSc6ICdKUFknIH0sIC8vIHRoZSBvbmx5IHJlYWwgcGFpclxuICAgICAgICAnRVRIL0pQWSc6ICB7ICdpZCc6ICdldGhfanB5JywgICdzeW1ib2wnOiAnRVRIL0pQWScsICAnYmFzZSc6ICdFVEgnLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ0VUQy9KUFknOiAgeyAnaWQnOiAnZXRjX2pweScsICAnc3ltYm9sJzogJ0VUQy9KUFknLCAgJ2Jhc2UnOiAnRVRDJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdEQU8vSlBZJzogIHsgJ2lkJzogJ2Rhb19qcHknLCAgJ3N5bWJvbCc6ICdEQU8vSlBZJywgICdiYXNlJzogJ0RBTycsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnTFNLL0pQWSc6ICB7ICdpZCc6ICdsc2tfanB5JywgICdzeW1ib2wnOiAnTFNLL0pQWScsICAnYmFzZSc6ICdMU0snLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ0ZDVC9KUFknOiAgeyAnaWQnOiAnZmN0X2pweScsICAnc3ltYm9sJzogJ0ZDVC9KUFknLCAgJ2Jhc2UnOiAnRkNUJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdYTVIvSlBZJzogIHsgJ2lkJzogJ3htcl9qcHknLCAgJ3N5bWJvbCc6ICdYTVIvSlBZJywgICdiYXNlJzogJ1hNUicsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnUkVQL0pQWSc6ICB7ICdpZCc6ICdyZXBfanB5JywgICdzeW1ib2wnOiAnUkVQL0pQWScsICAnYmFzZSc6ICdSRVAnLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ1hSUC9KUFknOiAgeyAnaWQnOiAneHJwX2pweScsICAnc3ltYm9sJzogJ1hSUC9KUFknLCAgJ2Jhc2UnOiAnWFJQJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdaRUMvSlBZJzogIHsgJ2lkJzogJ3plY19qcHknLCAgJ3N5bWJvbCc6ICdaRUMvSlBZJywgICdiYXNlJzogJ1pFQycsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnWEVNL0pQWSc6ICB7ICdpZCc6ICd4ZW1fanB5JywgICdzeW1ib2wnOiAnWEVNL0pQWScsICAnYmFzZSc6ICdYRU0nLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ0xUQy9KUFknOiAgeyAnaWQnOiAnbHRjX2pweScsICAnc3ltYm9sJzogJ0xUQy9KUFknLCAgJ2Jhc2UnOiAnTFRDJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdEQVNIL0pQWSc6IHsgJ2lkJzogJ2Rhc2hfanB5JywgJ3N5bWJvbCc6ICdEQVNIL0pQWScsICdiYXNlJzogJ0RBU0gnLCAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnRVRIL0JUQyc6ICB7ICdpZCc6ICdldGhfYnRjJywgICdzeW1ib2wnOiAnRVRIL0JUQycsICAnYmFzZSc6ICdFVEgnLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0VUQy9CVEMnOiAgeyAnaWQnOiAnZXRjX2J0YycsICAnc3ltYm9sJzogJ0VUQy9CVEMnLCAgJ2Jhc2UnOiAnRVRDJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMU0svQlRDJzogIHsgJ2lkJzogJ2xza19idGMnLCAgJ3N5bWJvbCc6ICdMU0svQlRDJywgICdiYXNlJzogJ0xTSycsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnRkNUL0JUQyc6ICB7ICdpZCc6ICdmY3RfYnRjJywgICdzeW1ib2wnOiAnRkNUL0JUQycsICAnYmFzZSc6ICdGQ1QnLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ1hNUi9CVEMnOiAgeyAnaWQnOiAneG1yX2J0YycsICAnc3ltYm9sJzogJ1hNUi9CVEMnLCAgJ2Jhc2UnOiAnWE1SJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdSRVAvQlRDJzogIHsgJ2lkJzogJ3JlcF9idGMnLCAgJ3N5bWJvbCc6ICdSRVAvQlRDJywgICdiYXNlJzogJ1JFUCcsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnWFJQL0JUQyc6ICB7ICdpZCc6ICd4cnBfYnRjJywgICdzeW1ib2wnOiAnWFJQL0JUQycsICAnYmFzZSc6ICdYUlAnLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ1pFQy9CVEMnOiAgeyAnaWQnOiAnemVjX2J0YycsICAnc3ltYm9sJzogJ1pFQy9CVEMnLCAgJ2Jhc2UnOiAnWkVDJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdYRU0vQlRDJzogIHsgJ2lkJzogJ3hlbV9idGMnLCAgJ3N5bWJvbCc6ICdYRU0vQlRDJywgICdiYXNlJzogJ1hFTScsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnTFRDL0JUQyc6ICB7ICdpZCc6ICdsdGNfYnRjJywgICdzeW1ib2wnOiAnTFRDL0JUQycsICAnYmFzZSc6ICdMVEMnLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0RBU0gvQlRDJzogeyAnaWQnOiAnZGFzaF9idGMnLCAnc3ltYm9sJzogJ0RBU0gvQlRDJywgJ2Jhc2UnOiAnREFTSCcsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRBY2NvdW50c0JhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVyQm9va3MgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoKTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndGltZXN0YW1wJ10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBwcmVmaXggPSAnJztcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKSB7XG4gICAgICAgICAgICBsZXQgb3JkZXJfdHlwZSA9IHR5cGUgKyAnXycgKyBzaWRlO1xuICAgICAgICAgICAgb3JkZXJbJ29yZGVyX3R5cGUnXSA9IG9yZGVyX3R5cGU7XG4gICAgICAgICAgICBsZXQgcHJlZml4ID0gKHNpZGUgPT0gYnV5KSA/IChvcmRlcl90eXBlICsgJ18nKSA6ICcnO1xuICAgICAgICAgICAgb3JkZXJbcHJlZml4ICsgJ2Ftb3VudCddID0gYW1vdW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3JkZXJbJ29yZGVyX3R5cGUnXSA9IHNpZGU7XG4gICAgICAgICAgICBvcmRlclsncmF0ZSddID0gcHJpY2U7XG4gICAgICAgICAgICBvcmRlclsnYW1vdW50J10gPSBhbW91bnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RFeGNoYW5nZU9yZGVycyAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmtleXNvcnQgKHF1ZXJ5KSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAnQUNDRVNTLUtFWSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdBQ0NFU1MtTk9OQ0UnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnQUNDRVNTLVNJR05BVFVSRSc6IHRoaXMuaG1hYyAobm9uY2UgKyB1cmwgKyAoYm9keSB8fCAnJyksIHRoaXMuc2VjcmV0KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGNvaW5tYXRlID0ge1xuICAgIFxuICAgICdpZCc6ICdjb2lubWF0ZScsXG4gICAgJ25hbWUnOiAnQ29pbk1hdGUnLFxuICAgICdjb3VudHJpZXMnOiBbICdVSycsICdDWicgXSwgLy8gVUssIEN6ZWNoIFJlcHVibGljXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc4MTEyMjktYzFlZmI1MTAtNjA2Yy0xMWU3LTlhMzYtODRiYTJjZTQxMmQ4LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9jb2lubWF0ZS5pby9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vY29pbm1hdGUuaW8nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vY29pbm1hdGUuaW8vZGV2ZWxvcGVycycsXG4gICAgICAgICAgICAnaHR0cDovL2RvY3MuY29pbm1hdGUuYXBpYXJ5LmlvLyNyZWZlcmVuY2UnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ29yZGVyQm9vaycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2JpdGNvaW5XaXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnYml0Y29pbkRlcG9zaXRBZGRyZXNzZXMnLFxuICAgICAgICAgICAgICAgICdidXlJbnN0YW50JyxcbiAgICAgICAgICAgICAgICAnYnV5TGltaXQnLFxuICAgICAgICAgICAgICAgICdjYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbE9yZGVyV2l0aEluZm8nLFxuICAgICAgICAgICAgICAgICdjcmVhdGVWb3VjaGVyJyxcbiAgICAgICAgICAgICAgICAnb3Blbk9yZGVycycsXG4gICAgICAgICAgICAgICAgJ3JlZGVlbVZvdWNoZXInLFxuICAgICAgICAgICAgICAgICdzZWxsSW5zdGFudCcsXG4gICAgICAgICAgICAgICAgJ3NlbGxMaW1pdCcsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9uSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3VuY29uZmlybWVkQml0Y29pbkRlcG9zaXRzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvRVVSJzogeyAnaWQnOiAnQlRDX0VVUicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInICB9LFxuICAgICAgICAnQlRDL0NaSyc6IHsgJ2lkJzogJ0JUQ19DWksnLCAnc3ltYm9sJzogJ0JUQy9DWksnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ1pLJyAgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlcyAoKTtcbiAgICB9LFxuICAgIFxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVyQm9vayAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5UGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdncm91cEJ5UHJpY2VMaW1pdCc6ICdGYWxzZScsXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeVBhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ2RhdGEnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndGltZXN0YW1wJ10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYW1vdW50J10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYW5zYWN0aW9ucyAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5UGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdtaW51dGVzSW50b0hpc3RvcnknOiAxMCxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSk7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdjdXJyZW5jeVBhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKSB7XG4gICAgICAgICAgICBpZiAoc2lkZSA9PSAnYnV5JylcbiAgICAgICAgICAgICAgICBvcmRlclsndG90YWwnXSA9IGFtb3VudDsgLy8gYW1vdW50IGluIGZpYXRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvcmRlclsnYW1vdW50J10gPSBhbW91bnQ7IC8vIGFtb3VudCBpbiBmaWF0XG4gICAgICAgICAgICBtZXRob2QgKz0gJ0luc3RhbnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3JkZXJbJ2Ftb3VudCddID0gYW1vdW50OyAvLyBhbW91bnQgaW4gY3J5cHRvXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICAgICAgbWV0aG9kICs9IHRoaXMuY2FwaXRhbGl6ZSAodHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAoc2VsZi5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgbGV0IGF1dGggPSBbIG5vbmNlLCB0aGlzLnVpZCwgdGhpcy5hcGlLZXkgXS5qb2luICgnICcpO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaG1hYyAoYXV0aCwgdGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdjbGllbnRJZCc6IHRoaXMudWlkLFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdwdWJsaWNLZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnc2lnbmF0dXJlJzogc2lnbmF0dXJlLnRvVXBwZXJDYXNlICgpLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgY29pbnNlY3VyZSA9IHtcblxuICAgICdpZCc6ICdjb2luc2VjdXJlJyxcbiAgICAnbmFtZSc6ICdDb2luc2VjdXJlJyxcbiAgICAnY291bnRyaWVzJzogJ0lOJywgLy8gSW5kaWFcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY0NzItOWNiZDIwMGEtNWVkOS0xMWU3LTk1NTEtMjI2N2FkN2JhYzA4LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkuY29pbnNlY3VyZS5pbicsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9jb2luc2VjdXJlLmluJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL2FwaS5jb2luc2VjdXJlLmluJyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vY29pbnNlY3VyZS9wbHVnaW5zJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdiaXRjb2luL3NlYXJjaC9jb25maXJtYXRpb24ve3R4aWR9JyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvYXNrL2xvdycsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL2Fzay9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9iaWQvaGlnaCcsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL2JpZC9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9sYXN0VHJhZGUnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9tYXgyNEhyJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvbWluMjRIcicsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ21mYS9hdXRoeS9jYWxsJyxcbiAgICAgICAgICAgICAgICAnbWZhL2F1dGh5L3NtcycsICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ25ldGtpL3NlYXJjaC97bmV0a2lOYW1lfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvYmFuay9vdHAve251bWJlcn0nLFxuICAgICAgICAgICAgICAgICd1c2VyL2t5Yy9vdHAve251bWJlcn0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3Byb2ZpbGUvcGhvbmUvb3RwL3tudW1iZXJ9JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi9hZGRyZXNzL3tpZH0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL2RlcG9zaXQvY29uZmlybWVkL2FsbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vZGVwb3NpdC9jb25maXJtZWQve2lkfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vZGVwb3NpdC91bmNvbmZpcm1lZC9hbGwnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL2RlcG9zaXQvdW5jb25maXJtZWQve2lkfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vd2FsbGV0cycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvYmFsYW5jZS9hdmFpbGFibGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9iYWxhbmNlL3BlbmRpbmcnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9iYWxhbmNlL3RvdGFsJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvZGVwb3NpdC9jYW5jZWxsZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9kZXBvc2l0L3VudmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9kZXBvc2l0L3ZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvY2FuY2VsbGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvY29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvdW52ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L3dpdGhkcmF3L3ZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9hc2svY2FuY2VsbGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9hc2svY29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9hc2svcGVuZGluZycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmlkL2NhbmNlbGxlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmlkL2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmlkL3BlbmRpbmcnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi9hZGRyZXNzZXMnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi9iYWxhbmNlL2F2YWlsYWJsZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL2JhbGFuY2UvcGVuZGluZycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL2JhbGFuY2UvdG90YWwnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi9kZXBvc2l0L2NhbmNlbGxlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL2RlcG9zaXQvdW52ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL2RlcG9zaXQvdmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy9jYW5jZWxsZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy9jb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy91bnZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vd2l0aGRyYXcvdmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2Jhbmsvc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvY29pbi9mZWUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2ZpYXQvZmVlJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9reWNzJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9yZWZlcnJhbC9jb2luL3BhaWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL3JlZmVycmFsL2NvaW4vc3VjY2Vzc2Z1bCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvcmVmZXJyYWwvZmlhdC9wYWlkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9yZWZlcnJhbHMnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL3RyYWRlL3N1bW1hcnknLFxuICAgICAgICAgICAgICAgICd1c2VyL2xvZ2luL3Rva2VuL3t0b2tlbn0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3N1bW1hcnknLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9zdW1tYXJ5JyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0L2NvaW4vd2l0aGRyYXcvY2FuY2VsbGVkJyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0L2NvaW4vd2l0aGRyYXcvY29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0L2NvaW4vd2l0aGRyYXcvdW52ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3dhbGxldC9jb2luL3dpdGhkcmF3L3ZlcmlmaWVkJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnbG9naW4nLFxuICAgICAgICAgICAgICAgICdsb2dpbi9pbml0aWF0ZScsXG4gICAgICAgICAgICAgICAgJ2xvZ2luL3Bhc3N3b3JkL2ZvcmdvdCcsXG4gICAgICAgICAgICAgICAgJ21mYS9hdXRoeS9pbml0aWF0ZScsXG4gICAgICAgICAgICAgICAgJ21mYS9nYS9pbml0aWF0ZScsXG4gICAgICAgICAgICAgICAgJ3NpZ251cCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbmV0a2kvdXBkYXRlJyxcbiAgICAgICAgICAgICAgICAndXNlci9wcm9maWxlL2ltYWdlL3VwZGF0ZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL3dpdGhkcmF3L2luaXRpYXRlJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vd2l0aGRyYXcvbmV3VmVyaWZ5Y29kZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L3dpdGhkcmF3L2luaXRpYXRlJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvbmV3VmVyaWZ5Y29kZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcGFzc3dvcmQvY2hhbmdlJyxcbiAgICAgICAgICAgICAgICAndXNlci9wYXNzd29yZC9yZXNldCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vd2l0aGRyYXcvaW5pdGlhdGUnLFxuICAgICAgICAgICAgICAgICd3YWxsZXQvY29pbi93aXRoZHJhdy9uZXdWZXJpZnljb2RlJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncHV0JzogW1xuICAgICAgICAgICAgICAgICdzaWdudXAvdmVyaWZ5L3t0b2tlbn0nLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2t5YycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2RlcG9zaXQvbmV3JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9hc2svbmV3JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iaWQvbmV3JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9pbnN0YW50L2J1eScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvaW5zdGFudC9zZWxsJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vd2l0aGRyYXcvdmVyaWZ5JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvYWNjb3VudC9uZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC93aXRoZHJhdy92ZXJpZnknLFxuICAgICAgICAgICAgICAgICd1c2VyL21mYS9hdXRoeS9pbml0aWF0ZS9lbmFibGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL21mYS9nYS9pbml0aWF0ZS9lbmFibGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL25ldGtpL2NyZWF0ZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcHJvZmlsZS9waG9uZS9uZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL2FkZHJlc3MvbmV3JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi9uZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL3dpdGhkcmF3L3NlbmRUb0V4Y2hhbmdlJyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi93aXRoZHJhdy92ZXJpZnknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ3VzZXIvZ2NtL3tjb2RlfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbG9nb3V0JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vd2l0aGRyYXcvdW52ZXJpZmllZC9jYW5jZWwve3dpdGhkcmF3SUR9JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvZGVwb3NpdC9jYW5jZWwve2RlcG9zaXRJRH0nLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2Fzay9jYW5jZWwve29yZGVySUR9JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iaWQvY2FuY2VsL3tvcmRlcklEfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L3dpdGhkcmF3L3VudmVyaWZpZWQvY2FuY2VsL3t3aXRoZHJhd0lEfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbWZhL2F1dGh5L2Rpc2FibGUve2NvZGV9JyxcbiAgICAgICAgICAgICAgICAndXNlci9tZmEvZ2EvZGlzYWJsZS97Y29kZX0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3Byb2ZpbGUvcGhvbmUvZGVsZXRlJyxcbiAgICAgICAgICAgICAgICAndXNlci9wcm9maWxlL2ltYWdlL2RlbGV0ZS97bmV0a2lOYW1lfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vd2l0aGRyYXcvdW52ZXJpZmllZC9jYW5jZWwve3dpdGhkcmF3SUR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvSU5SJzogeyAnaWQnOiAnQlRDL0lOUicsICdzeW1ib2wnOiAnQlRDL0lOUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdJTlInIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRVc2VyRXhjaGFuZ2VCYW5rU3VtbWFyeSAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHsgXG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldEV4Y2hhbmdlQXNrT3JkZXJzICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEV4Y2hhbmdlVGlja2VyICgpO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ21lc3NhZ2UnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndGltZXN0YW1wJ107XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RQcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2NvaW52b2x1bWUnXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2ZpYXR2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RXhjaGFuZ2VUcmFkZXMgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQdXRVc2VyRXhjaGFuZ2UnO1xuICAgICAgICBsZXQgb3JkZXIgPSB7fTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHsgICAgICAgXG4gICAgICAgICAgICBtZXRob2QgKz0gJ0luc3RhbnQnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKTtcbiAgICAgICAgICAgIGlmIChzaWRlID09ICdidXknKVxuICAgICAgICAgICAgICAgIG9yZGVyWydtYXhGaWF0J10gPSBhbW91bnQ7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb3JkZXJbJ21heFZvbCddID0gYW1vdW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGRpcmVjdGlvbiA9IChzaWRlID09ICdidXknKSA/ICdCaWQnIDogJ0Fzayc7XG4gICAgICAgICAgICBtZXRob2QgKz0gZGlyZWN0aW9uICsgJ05ldyc7XG4gICAgICAgICAgICBvcmRlclsncmF0ZSddID0gcHJpY2U7XG4gICAgICAgICAgICBvcmRlclsndm9sJ10gPSBhbW91bnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAoc2VsZi5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3ByaXZhdGUnKSB7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnQXV0aG9yaXphdGlvbic6IHRoaXMuYXBpS2V5IH07XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHF1ZXJ5KTtcbiAgICAgICAgICAgICAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGV4bW8gPSB7XG5cbiAgICAnaWQnOiAnZXhtbycsXG4gICAgJ25hbWUnOiAnRVhNTycsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0VTJywgJ1JVJywgXSwgLy8gU3BhaW4sIFJ1c3NpYVxuICAgICdyYXRlTGltaXQnOiAxMDAwLCAvLyBvbmNlIGV2ZXJ5IDM1MCBtcyDiiYggMTgwIHJlcXVlc3RzIHBlciBtaW51dGUg4omIIDMgcmVxdWVzdHMgcGVyIHNlY29uZFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjQ5MS0xYjBlYTk1Ni01ZWRhLTExZTctOTIyNS00MGQ2N2I0ODFiOGQuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5leG1vLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9leG1vLm1lJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL2V4bW8ubWUvcnUvYXBpX2RvYycsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL2V4bW8tZGV2L2V4bW9fYXBpX2xpYi90cmVlL21hc3Rlci9ub2RlanMnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2N1cnJlbmN5JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfYm9vaycsXG4gICAgICAgICAgICAgICAgJ3BhaXJfc2V0dGluZ3MnLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAndXNlcl9pbmZvJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfY3JlYXRlJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAndXNlcl9vcGVuX29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3VzZXJfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAndXNlcl9jYW5jZWxsZWRfb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAncmVxdWlyZWRfYW1vdW50JyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdF9hZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdfY3J5cHQnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd19nZXRfdHhpZCcsXG4gICAgICAgICAgICAgICAgJ2V4Y29kZV9jcmVhdGUnLFxuICAgICAgICAgICAgICAgICdleGNvZGVfbG9hZCcsXG4gICAgICAgICAgICAgICAgJ3dhbGxldF9oaXN0b3J5JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFBhaXJTZXR0aW5ncyAoKTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAocHJvZHVjdHMpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwga2V5cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IGlkID0ga2V5c1twXTtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbaWRdO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGlkLnJlcGxhY2UgKCdfJywgJy8nKTtcbiAgICAgICAgICAgIGxldCBbIGJhc2UsIHF1b3RlIF0gPSBzeW1ib2wuc3BsaXQgKCcvJyk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VXNlckluZm8gKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVyQm9vayAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoKTtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbcFsnaWQnXV07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3VwZGF0ZWQnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXlfcHJpY2UnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsX3ByaWNlJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0X3RyYWRlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2F2ZyddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbF9jdXJyJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IHByZWZpeCA9ICcnO1xuICAgICAgICBpZiAodHlwZSA9PSdtYXJrZXQnKVxuICAgICAgICAgICAgcHJlZml4ID0gJ21hcmtldF8nO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdxdWFudGl0eSc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlIHx8IDAsXG4gICAgICAgICAgICAndHlwZSc6IHByZWZpeCArIHNpZGUsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXJDcmVhdGUgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHsgJ25vbmNlJzogbm9uY2UgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAnS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1NpZ24nOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgZnliID0ge1xuXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcmRldGFpbGVkJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ3Rlc3QnLFxuICAgICAgICAgICAgICAgICdnZXRhY2NpbmZvJyxcbiAgICAgICAgICAgICAgICAnZ2V0cGVuZGluZ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ2dldG9yZGVyaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbHBlbmRpbmdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3BsYWNlb3JkZXInLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEdldGFjY2luZm8gKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVyYm9vayAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyZGV0YWlsZWQgKCk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsb3cnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2wnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICgpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RQbGFjZW9yZGVyICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ3F0eSc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlWzBdLnRvVXBwZXJDYXNlICgpXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHBhdGg7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7ICAgICAgICAgICBcbiAgICAgICAgICAgIHVybCArPSAnLmpzb24nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHsgJ3RpbWVzdGFtcCc6IG5vbmNlIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdzaWcnOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhMScpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgZnlic2UgPSBleHRlbmQgKGZ5Yiwge1xuICAgICdpZCc6ICdmeWJzZScsXG4gICAgJ25hbWUnOiAnRllCLVNFJyxcbiAgICAnY291bnRyaWVzJzogJ1NFJywgLy8gU3dlZGVuXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY1MTItMzEwMTk3NzItNWVkYi0xMWU3LTgyNDEtMmU2NzVlNjc5N2YxLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly93d3cuZnlic2Uuc2UvYXBpL1NFSycsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuZnlic2Uuc2UnLFxuICAgICAgICAnZG9jJzogJ2h0dHA6Ly9kb2NzLmZ5Yi5hcGlhcnkuaW8nLFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1NFSyc6IHsgJ2lkJzogJ1NFSycsICdzeW1ib2wnOiAnQlRDL1NFSycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdTRUsnIH0sXG4gICAgfSxcbn0pXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGZ5YnNnID0gZXh0ZW5kIChmeWIsIHtcbiAgICAnaWQnOiAnZnlic2cnLFxuICAgICduYW1lJzogJ0ZZQi1TRycsXG4gICAgJ2NvdW50cmllcyc6ICdTRycsIC8vIFNpbmdhcG9yZVxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NTEzLTMzNjRkNTZhLTVlZGItMTFlNy05ZTZiLWQ1ODk4YmI4OWM4MS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vd3d3LmZ5YnNnLmNvbS9hcGkvU0dEJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5meWJzZy5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHA6Ly9kb2NzLmZ5Yi5hcGlhcnkuaW8nLFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1NHRCc6IHsgJ2lkJzogJ1NHRCcsICdzeW1ib2wnOiAnQlRDL1NHRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdTR0QnIH0sXG4gICAgfSxcbn0pXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGdkYXggPSB7XG4gICAgJ2lkJzogJ2dkYXgnLFxuICAgICduYW1lJzogJ0dEQVgnLFxuICAgICdjb3VudHJpZXMnOiAnVVMnLFxuICAgICdyYXRlTGltaXQnOiAxMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NTI3LWIxYmU0MWM2LTVlZGItMTFlNy05NWY2LTViNDk2YzQ2OWUyYy5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLmdkYXguY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5nZGF4LmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9kb2NzLmdkYXguY29tJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdjdXJyZW5jaWVzJyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdHMnLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cy97aWR9L2Jvb2snLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cy97aWR9L2NhbmRsZXMnLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cy97aWR9L3N0YXRzJyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdHMve2lkfS90aWNrZXInLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cy97aWR9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3RpbWUnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdhY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL3tpZH0nLFxuICAgICAgICAgICAgICAgICdhY2NvdW50cy97aWR9L2hvbGRzJyxcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMve2lkfS9sZWRnZXInLFxuICAgICAgICAgICAgICAgICdjb2luYmFzZS1hY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2ZpbGxzJyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ29yZGVycy97aWR9JyxcbiAgICAgICAgICAgICAgICAncGF5bWVudC1tZXRob2RzJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24nLFxuICAgICAgICAgICAgICAgICdyZXBvcnRzL3tpZH0nLFxuICAgICAgICAgICAgICAgICd1c2Vycy9zZWxmL3RyYWlsaW5nLXZvbHVtZScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRzL2NvaW5iYXNlLWFjY291bnQnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0cy9wYXltZW50LW1ldGhvZCcsXG4gICAgICAgICAgICAgICAgJ2Z1bmRpbmcvcmVwYXknLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9jbG9zZScsXG4gICAgICAgICAgICAgICAgJ3Byb2ZpbGVzL21hcmdpbi10cmFuc2ZlcicsXG4gICAgICAgICAgICAgICAgJ3JlcG9ydHMnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy9jb2luYmFzZScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzL2NyeXB0bycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzL3BheW1lbnQtbWV0aG9kJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMve2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQcm9kdWN0cyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnaWQnXTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gcHJvZHVjdFsnYmFzZV9jdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsncXVvdGVfY3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7ICAgICAgICAgICAgXG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRBY2NvdW50cyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0UHJvZHVjdHNJZEJvb2sgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0UHJvZHVjdHNJZFRpY2tlciAoe1xuICAgICAgICAgICAgJ2lkJzogcFsnaWQnXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBxdW90ZSA9IGF3YWl0IHRoaXMucHVibGljR2V0UHJvZHVjdHNJZFN0YXRzICh7XG4gICAgICAgICAgICAnaWQnOiBwWydpZCddLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMucGFyc2U4NjAxICh0aWNrZXJbJ3RpbWUnXSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0IChxdW90ZVsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0IChxdW90ZVsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHF1b3RlWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0IChxdW90ZVsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRQcm9kdWN0c0lkVHJhZGVzICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdjbGllbnRfb2lkJzogdGhpcy5ub25jZSAoKSxcbiAgICAgICAgICAgICdwcm9kdWN0X2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3NpemUnOiBhbW91bnQsXG4gICAgICAgICAgICAndHlwZSc6IHR5cGUsICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgcmVxdWVzdCA9ICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyByZXF1ZXN0O1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgbGV0IHdoYXQgPSBub25jZSArIG1ldGhvZCArIHJlcXVlc3QgKyAoYm9keSB8fCAnJyk7XG4gICAgICAgICAgICBsZXQgc2VjcmV0ID0gdGhpcy5iYXNlNjRUb0JpbmFyeSAodGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaGFzaCAod2hhdCwgc2VjcmV0LCAnc2hhMjU2JywgJ2JpbmFyeScpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ0ItQUNDRVNTLUtFWSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdDQi1BQ0NFU1MtU0lHTic6IHRoaXMuc3RyaW5nVG9CYXNlNjQgKHNpZ25hdHVyZSksXG4gICAgICAgICAgICAgICAgJ0NCLUFDQ0VTUy1USU1FU1RBTVAnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnQ0ItQUNDRVNTLVBBU1NQSFJBU0UnOiB0aGlzLnBhc3N3b3JkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGhpdGJ0YyA9IHtcblxuICAgICdpZCc6ICdoaXRidGMnLFxuICAgICduYW1lJzogJ0hpdEJUQycsXG4gICAgJ2NvdW50cmllcyc6ICdISycsIC8vIEhvbmcgS29uZ1xuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd2ZXJzaW9uJzogJzEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NTU1LThlYWVjMjBlLTVlZGMtMTFlNy05YzViLTZkYzY5ZmM0MmY1ZS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHA6Ly9hcGkuaGl0YnRjLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9oaXRidGMuY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL2hpdGJ0Yy5jb20vYXBpJyxcbiAgICAgICAgICAgICdodHRwOi8vaGl0YnRjLWNvbS5naXRodWIuaW8vaGl0YnRjLWFwaScsXG4gICAgICAgICAgICAnaHR0cDovL2pzZmlkZGxlLm5ldC9ibWtuaWdodC9ScWJZQicsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAne3N5bWJvbH0vb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAne3N5bWJvbH0vdGlja2VyJyxcbiAgICAgICAgICAgICAgICAne3N5bWJvbH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAne3N5bWJvbH0vdHJhZGVzL3JlY2VudCcsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbHMnLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLFxuICAgICAgICAgICAgICAgICd0aW1lLCdcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICd0cmFkaW5nJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ29yZGVycy9hY3RpdmUnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvcmVjZW50JyxcbiAgICAgICAgICAgICAgICAnb3JkZXInLFxuICAgICAgICAgICAgICAgICd0cmFkZXMvYnkvb3JkZXInLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICduZXdfb3JkZXInLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXInLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXJzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwYXltZW50Jzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2FkZHJlc3Mve2N1cnJlbmN5fScsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucy97dHJhbnNhY3Rpb259JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAndHJhbnNmZXJfdG9fdHJhZGluZycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyX3RvX21haW4nLFxuICAgICAgICAgICAgICAgICdhZGRyZXNzL3tjdXJyZW5jeX0nLFxuICAgICAgICAgICAgICAgICdwYXlvdXQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRTeW1ib2xzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ3N5bWJvbHMnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1snc3ltYm9scyddW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnc3ltYm9sJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ2NvbW1vZGl0eSddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsnY3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYWRpbmdHZXRCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRTeW1ib2xPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRTeW1ib2xUaWNrZXIgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd0aW1lc3RhbXAnXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lX3F1b3RlJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFN5bWJvbFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnY2xpZW50T3JkZXJJZCc6IHRoaXMubm9uY2UgKCksXG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3F1YW50aXR5JzogYW1vdW50LFxuICAgICAgICAgICAgJ3R5cGUnOiB0eXBlLCAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhZGluZ1Bvc3ROZXdPcmRlciAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9ICcvYXBpLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0eXBlICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgcXVlcnkgPSB0aGlzLmV4dGVuZCAoeyAnbm9uY2UnOiBub25jZSwgJ2FwaWtleSc6IHRoaXMuYXBpS2V5IH0sIHF1ZXJ5KTtcbiAgICAgICAgICAgIGlmIChtZXRob2QgPT0gJ1BPU1QnKVxuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnWC1TaWduYXR1cmUnOiB0aGlzLmhtYWMgKHVybCArIChib2R5IHx8ICcnKSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKS50b0xvd2VyQ2FzZSAoKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHVybDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBodW9iaSA9IHtcblxuICAgICdpZCc6ICdodW9iaScsXG4gICAgJ25hbWUnOiAnSHVvYmknLFxuICAgICdjb3VudHJpZXMnOiAnQ04nLFxuICAgICdyYXRlTGltaXQnOiA1MDAwLFxuICAgICd2ZXJzaW9uJzogJ3YzJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjU2OS0xNWFhN2I5YS01ZWRkLTExZTctOWU3Zi00NDc5MWY0ZWU0OWMuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwOi8vYXBpLmh1b2JpLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuaHVvYmkuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2dpdGh1Yi5jb20vaHVvYmlhcGkvQVBJX0RvY3NfZW4vd2lraScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAnc3RhdGljbWFya2V0Jzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAne2lkfV9rbGluZV97cGVyaW9kfScsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcl97aWR9JyxcbiAgICAgICAgICAgICAgICAnZGVwdGhfe2lkfScsXG4gICAgICAgICAgICAgICAgJ2RlcHRoX3tpZH1fe2xlbmd0aH0nLFxuICAgICAgICAgICAgICAgICdkZXRhaWxfe2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAndXNkbWFya2V0Jzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAne2lkfV9rbGluZV97cGVyaW9kfScsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcl97aWR9JyxcbiAgICAgICAgICAgICAgICAnZGVwdGhfe2lkfScsXG4gICAgICAgICAgICAgICAgJ2RlcHRoX3tpZH1fe2xlbmd0aH0nLFxuICAgICAgICAgICAgICAgICdkZXRhaWxfe2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAndHJhZGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnZ2V0X2FjY291bnRfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2dldF9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcl9pbmZvJyxcbiAgICAgICAgICAgICAgICAnYnV5JyxcbiAgICAgICAgICAgICAgICAnc2VsbCcsXG4gICAgICAgICAgICAgICAgJ2J1eV9tYXJrZXQnLFxuICAgICAgICAgICAgICAgICdzZWxsX21hcmtldCcsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldF9uZXdfZGVhbF9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdnZXRfb3JkZXJfaWRfYnlfdHJhZGVfaWQnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd19jb2luJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX3dpdGhkcmF3X2NvaW4nLFxuICAgICAgICAgICAgICAgICdnZXRfd2l0aGRyYXdfY29pbl9yZXN1bHQnLFxuICAgICAgICAgICAgICAgICd0cmFuc2ZlcicsXG4gICAgICAgICAgICAgICAgJ2xvYW4nLFxuICAgICAgICAgICAgICAgICdyZXBheW1lbnQnLFxuICAgICAgICAgICAgICAgICdnZXRfbG9hbl9hdmFpbGFibGUnLFxuICAgICAgICAgICAgICAgICdnZXRfbG9hbnMnLFxuICAgICAgICAgICAgXSwgICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9DTlknOiB7ICdpZCc6ICdidGMnLCAnc3ltYm9sJzogJ0JUQy9DTlknLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ05ZJywgJ3R5cGUnOiAnc3RhdGljbWFya2V0JywgJ2NvaW5UeXBlJzogMSwgfSxcbiAgICAgICAgJ0xUQy9DTlknOiB7ICdpZCc6ICdsdGMnLCAnc3ltYm9sJzogJ0xUQy9DTlknLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnQ05ZJywgJ3R5cGUnOiAnc3RhdGljbWFya2V0JywgJ2NvaW5UeXBlJzogMiwgfSxcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdidGMnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJywgJ3R5cGUnOiAndXNkbWFya2V0JywgICAgJ2NvaW5UeXBlJzogMSwgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhZGVQb3N0R2V0QWNjb3VudEluZm8gKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG1ldGhvZCA9IHBbJ3R5cGUnXSArICdHZXREZXB0aElkJztcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAoeyAnaWQnOiBwWydpZCddIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBtZXRob2QgPSBwWyd0eXBlJ10gKyAnR2V0VGlja2VySWQnO1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzW21ldGhvZF0gKHsgJ2lkJzogcFsnaWQnXSB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWyd0aWNrZXInXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50IChyZXNwb25zZVsndGltZSddKSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG1ldGhvZCA9IHBbJ3R5cGUnXSArICdHZXREZXRhaWxJZCc7XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHsgJ2lkJzogcFsnaWQnXSB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICd0cmFkZVBvc3QnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKTtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2NvaW5fdHlwZSc6IHBbJ2NvaW5UeXBlJ10sXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ21hcmtldCc6IHBbJ3F1b3RlJ10udG9Mb3dlckNhc2UgKCksXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBtZXRob2QgKz0gdGhpcy5jYXBpdGFsaXplICh0eXBlKTtcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICd0cmFkZScsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3RyYWRlJykge1xuICAgICAgICAgICAgdXJsICs9ICcvYXBpJyArIHRoaXMudmVyc2lvbjtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IHRoaXMua2V5c29ydCAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbWV0aG9kJzogcGF0aCxcbiAgICAgICAgICAgICAgICAnYWNjZXNzX2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdjcmVhdGVkJzogdGhpcy5ub25jZSAoKSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5U3RyaW5nID0gdGhpcy51cmxlbmNvZGUgKHRoaXMub21pdCAocXVlcnksICdtYXJrZXQnKSk7XG4gICAgICAgICAgICAvLyBzZWNyZXQga2V5IG11c3QgYmUgYXQgdGhlIGVuZCBvZiBxdWVyeSB0byBiZSBzaWduZWRcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nICs9ICcmc2VjcmV0X2tleT0nICsgdGhpcy5zZWNyZXQ7XG4gICAgICAgICAgICBxdWVyeVsnc2lnbiddID0gdGhpcy5oYXNoIChxdWVyeVN0cmluZyk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCArPSAnLycgKyB0eXBlICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpICsgJ19qc29uLmpzJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGp1YmkgPSB7XG5cbiAgICAnaWQnOiAnanViaScsXG4gICAgJ25hbWUnOiAnanViaS5jb20nLFxuICAgICdjb3VudHJpZXMnOiAnQ04nLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjU4MS05ZDM5N2Q5YS01ZWRkLTExZTctOGZiOS01ZDgyMzZjMGU2OTIuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5qdWJpLmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3Lmp1YmkuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL3d3dy5qdWJpLmNvbS9oZWxwL2FwaS5odG1sJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdkZXB0aCcsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfYWRkJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfbGlzdCcsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX3ZpZXcnLFxuICAgICAgICAgICAgICAgICd3YWxsZXQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9DTlknOiAgeyAnaWQnOiAnYnRjJywgICdzeW1ib2wnOiAnQlRDL0NOWScsICAnYmFzZSc6ICdCVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0VUSC9DTlknOiAgeyAnaWQnOiAnZXRoJywgICdzeW1ib2wnOiAnRVRIL0NOWScsICAnYmFzZSc6ICdFVEgnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0FOUy9DTlknOiAgeyAnaWQnOiAnYW5zJywgICdzeW1ib2wnOiAnQU5TL0NOWScsICAnYmFzZSc6ICdBTlMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0JMSy9DTlknOiAgeyAnaWQnOiAnYmxrJywgICdzeW1ib2wnOiAnQkxLL0NOWScsICAnYmFzZSc6ICdCTEsnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0ROQy9DTlknOiAgeyAnaWQnOiAnZG5jJywgICdzeW1ib2wnOiAnRE5DL0NOWScsICAnYmFzZSc6ICdETkMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0RPR0UvQ05ZJzogeyAnaWQnOiAnZG9nZScsICdzeW1ib2wnOiAnRE9HRS9DTlknLCAnYmFzZSc6ICdET0dFJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0VBQy9DTlknOiAgeyAnaWQnOiAnZWFjJywgICdzeW1ib2wnOiAnRUFDL0NOWScsICAnYmFzZSc6ICdFQUMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0VUQy9DTlknOiAgeyAnaWQnOiAnZXRjJywgICdzeW1ib2wnOiAnRVRDL0NOWScsICAnYmFzZSc6ICdFVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0ZaL0NOWSc6ICAgeyAnaWQnOiAnZnonLCAgICdzeW1ib2wnOiAnRlovQ05ZJywgICAnYmFzZSc6ICdGWicsICAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0dPT0MvQ05ZJzogeyAnaWQnOiAnZ29vYycsICdzeW1ib2wnOiAnR09PQy9DTlknLCAnYmFzZSc6ICdHT09DJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0dBTUUvQ05ZJzogeyAnaWQnOiAnZ2FtZScsICdzeW1ib2wnOiAnR0FNRS9DTlknLCAnYmFzZSc6ICdHQU1FJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0hMQi9DTlknOiAgeyAnaWQnOiAnaGxiJywgICdzeW1ib2wnOiAnSExCL0NOWScsICAnYmFzZSc6ICdITEInLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0lGQy9DTlknOiAgeyAnaWQnOiAnaWZjJywgICdzeW1ib2wnOiAnSUZDL0NOWScsICAnYmFzZSc6ICdJRkMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0pCQy9DTlknOiAgeyAnaWQnOiAnamJjJywgICdzeW1ib2wnOiAnSkJDL0NOWScsICAnYmFzZSc6ICdKQkMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0tUQy9DTlknOiAgeyAnaWQnOiAna3RjJywgICdzeW1ib2wnOiAnS1RDL0NOWScsICAnYmFzZSc6ICdLVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0xLQy9DTlknOiAgeyAnaWQnOiAnbGtjJywgICdzeW1ib2wnOiAnTEtDL0NOWScsICAnYmFzZSc6ICdMS0MnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0xTSy9DTlknOiAgeyAnaWQnOiAnbHNrJywgICdzeW1ib2wnOiAnTFNLL0NOWScsICAnYmFzZSc6ICdMU0snLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0xUQy9DTlknOiAgeyAnaWQnOiAnbHRjJywgICdzeW1ib2wnOiAnTFRDL0NOWScsICAnYmFzZSc6ICdMVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ01BWC9DTlknOiAgeyAnaWQnOiAnbWF4JywgICdzeW1ib2wnOiAnTUFYL0NOWScsICAnYmFzZSc6ICdNQVgnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ01FVC9DTlknOiAgeyAnaWQnOiAnbWV0JywgICdzeW1ib2wnOiAnTUVUL0NOWScsICAnYmFzZSc6ICdNRVQnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ01SWUMvQ05ZJzogeyAnaWQnOiAnbXJ5YycsICdzeW1ib2wnOiAnTVJZQy9DTlknLCAnYmFzZSc6ICdNUllDJywgJ3F1b3RlJzogJ0NOWScgfSwgICAgICAgIFxuICAgICAgICAnTVRDL0NOWSc6ICB7ICdpZCc6ICdtdGMnLCAgJ3N5bWJvbCc6ICdNVEMvQ05ZJywgICdiYXNlJzogJ01UQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnTlhUL0NOWSc6ICB7ICdpZCc6ICdueHQnLCAgJ3N5bWJvbCc6ICdOWFQvQ05ZJywgICdiYXNlJzogJ05YVCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUEVCL0NOWSc6ICB7ICdpZCc6ICdwZWInLCAgJ3N5bWJvbCc6ICdQRUIvQ05ZJywgICdiYXNlJzogJ1BFQicsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUEdDL0NOWSc6ICB7ICdpZCc6ICdwZ2MnLCAgJ3N5bWJvbCc6ICdQR0MvQ05ZJywgICdiYXNlJzogJ1BHQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUExDL0NOWSc6ICB7ICdpZCc6ICdwbGMnLCAgJ3N5bWJvbCc6ICdQTEMvQ05ZJywgICdiYXNlJzogJ1BMQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUFBDL0NOWSc6ICB7ICdpZCc6ICdwcGMnLCAgJ3N5bWJvbCc6ICdQUEMvQ05ZJywgICdiYXNlJzogJ1BQQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUUVDL0NOWSc6ICB7ICdpZCc6ICdxZWMnLCAgJ3N5bWJvbCc6ICdRRUMvQ05ZJywgICdiYXNlJzogJ1FFQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUklPL0NOWSc6ICB7ICdpZCc6ICdyaW8nLCAgJ3N5bWJvbCc6ICdSSU8vQ05ZJywgICdiYXNlJzogJ1JJTycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnUlNTL0NOWSc6ICB7ICdpZCc6ICdyc3MnLCAgJ3N5bWJvbCc6ICdSU1MvQ05ZJywgICdiYXNlJzogJ1JTUycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnU0tUL0NOWSc6ICB7ICdpZCc6ICdza3QnLCAgJ3N5bWJvbCc6ICdTS1QvQ05ZJywgICdiYXNlJzogJ1NLVCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnVEZDL0NOWSc6ICB7ICdpZCc6ICd0ZmMnLCAgJ3N5bWJvbCc6ICdURkMvQ05ZJywgICdiYXNlJzogJ1RGQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnVlJDL0NOWSc6ICB7ICdpZCc6ICd2cmMnLCAgJ3N5bWJvbCc6ICdWUkMvQ05ZJywgICdiYXNlJzogJ1ZSQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnVlRDL0NOWSc6ICB7ICdpZCc6ICd2dGMnLCAgJ3N5bWJvbCc6ICdWVEMvQ05ZJywgICdiYXNlJzogJ1ZUQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnV0RDL0NOWSc6ICB7ICdpZCc6ICd3ZGMnLCAgJ3N5bWJvbCc6ICdXREMvQ05ZJywgICdiYXNlJzogJ1dEQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWEFTL0NOWSc6ICB7ICdpZCc6ICd4YXMnLCAgJ3N5bWJvbCc6ICdYQVMvQ05ZJywgICdiYXNlJzogJ1hBUycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWFBNL0NOWSc6ICB7ICdpZCc6ICd4cG0nLCAgJ3N5bWJvbCc6ICdYUE0vQ05ZJywgICdiYXNlJzogJ1hQTScsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWFJQL0NOWSc6ICB7ICdpZCc6ICd4cnAnLCAgJ3N5bWJvbCc6ICdYUlAvQ05ZJywgICdiYXNlJzogJ1hSUCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWFNHUy9DTlknOiB7ICdpZCc6ICd4c2dzJywgJ3N5bWJvbCc6ICdYU0dTL0NOWScsICdiYXNlJzogJ1hTR1MnLCAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWVRDL0NOWSc6ICB7ICdpZCc6ICd5dGMnLCAgJ3N5bWJvbCc6ICdZVEMvQ05ZJywgICdiYXNlJzogJ1lUQycsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWkVUL0NOWSc6ICB7ICdpZCc6ICd6ZXQnLCAgJ3N5bWJvbCc6ICdaRVQvQ05ZJywgICdiYXNlJzogJ1pFVCcsICAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnWkNDL0NOWSc6ICB7ICdpZCc6ICd6Y2MnLCAgJ3N5bWJvbCc6ICdaQ0MvQ05ZJywgICdiYXNlJzogJ1pDQycsICAncXVvdGUnOiAnQ05ZJyB9LCAgICAgICAgXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RGVwdGggKHtcbiAgICAgICAgICAgICdjb2luJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7IFxuICAgICAgICAgICAgJ2NvaW4nOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sJ10pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0T3JkZXJzICh7XG4gICAgICAgICAgICAnY29pbic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFRyYWRlQWRkICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ2NvaW4nOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHBhdGg7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7ICBcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcGFyYW1zKTtcbiAgICAgICAgICAgIHF1ZXJ5WydzaWduYXR1cmUnXSA9IHRoaXMuaG1hYyAodGhpcy51cmxlbmNvZGUgKHF1ZXJ5KSwgdGhpcy5oYXNoICh0aGlzLnNlY3JldCkpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrcmFrZW4gaXMgYWxzbyBvd25lciBvZiBleC4gQ29pbnNldHRlciAvIENhVmlydEV4IC8gQ2xldmVyY29pblxuXG52YXIga3Jha2VuID0ge1xuXG4gICAgJ2lkJzogJ2tyYWtlbicsXG4gICAgJ25hbWUnOiAnS3Jha2VuJyxcbiAgICAnY291bnRyaWVzJzogJ1VTJyxcbiAgICAndmVyc2lvbic6ICcwJyxcbiAgICAncmF0ZUxpbWl0JzogMzAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjU5OS0yMjcwOTMwNC01ZWRlLTExZTctOWRlMS05ZjMzNzMyZTE1MDkuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5rcmFrZW4uY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5rcmFrZW4uY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3d3dy5rcmFrZW4uY29tL2VuLXVzL2hlbHAvYXBpJyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vbm90aGluZ2lzZGVhZC9ucG0ta3Jha2VuLWFwaScsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnQXNzZXRzJyxcbiAgICAgICAgICAgICAgICAnQXNzZXRQYWlycycsXG4gICAgICAgICAgICAgICAgJ0RlcHRoJyxcbiAgICAgICAgICAgICAgICAnT0hMQycsXG4gICAgICAgICAgICAgICAgJ1NwcmVhZCcsXG4gICAgICAgICAgICAgICAgJ1RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ1RpbWUnLFxuICAgICAgICAgICAgICAgICdUcmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnQWRkT3JkZXInLFxuICAgICAgICAgICAgICAgICdCYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnQ2FuY2VsT3JkZXInLFxuICAgICAgICAgICAgICAgICdDbG9zZWRPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdEZXBvc2l0QWRkcmVzc2VzJyxcbiAgICAgICAgICAgICAgICAnRGVwb3NpdE1ldGhvZHMnLFxuICAgICAgICAgICAgICAgICdEZXBvc2l0U3RhdHVzJyxcbiAgICAgICAgICAgICAgICAnTGVkZ2VycycsXG4gICAgICAgICAgICAgICAgJ09wZW5PcmRlcnMnLFxuICAgICAgICAgICAgICAgICdPcGVuUG9zaXRpb25zJywgXG4gICAgICAgICAgICAgICAgJ1F1ZXJ5TGVkZ2VycycsIFxuICAgICAgICAgICAgICAgICdRdWVyeU9yZGVycycsIFxuICAgICAgICAgICAgICAgICdRdWVyeVRyYWRlcycsXG4gICAgICAgICAgICAgICAgJ1RyYWRlQmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ1RyYWRlc0hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdUcmFkZVZvbHVtZScsXG4gICAgICAgICAgICAgICAgJ1dpdGhkcmF3JyxcbiAgICAgICAgICAgICAgICAnV2l0aGRyYXdDYW5jZWwnLCBcbiAgICAgICAgICAgICAgICAnV2l0aGRyYXdJbmZvJywgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdXaXRoZHJhd1N0YXR1cycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRBc3NldFBhaXJzICgpO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0c1sncmVzdWx0J10pO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwga2V5cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IGlkID0ga2V5c1twXTtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3Jlc3VsdCddW2lkXTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gcHJvZHVjdFsnYmFzZSddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsncXVvdGUnXTtcbiAgICAgICAgICAgIGlmICgoYmFzZVswXSA9PSAnWCcpIHx8IChiYXNlWzBdID09ICdaJykpXG4gICAgICAgICAgICAgICAgYmFzZSA9IGJhc2Uuc2xpY2UgKDEpO1xuICAgICAgICAgICAgaWYgKChxdW90ZVswXSA9PSAnWCcpIHx8IChxdW90ZVswXSA9PSAnWicpKVxuICAgICAgICAgICAgICAgIHF1b3RlID0gcXVvdGUuc2xpY2UgKDEpO1xuICAgICAgICAgICAgYmFzZSA9IHRoaXMuY29tbW9uQ3VycmVuY3lDb2RlIChiYXNlKTtcbiAgICAgICAgICAgIHF1b3RlID0gdGhpcy5jb21tb25DdXJyZW5jeUNvZGUgKHF1b3RlKTtcbiAgICAgICAgICAgIGxldCBkYXJrcG9vbCA9IGlkLmluZGV4T2YgKCcuZCcpID49IDA7XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gZGFya3Bvb2wgPyBwcm9kdWN0WydhbHRuYW1lJ10gOiAoYmFzZSArICcvJyArIHF1b3RlKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RGVwdGggICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogcFsnaWQnXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsncmVzdWx0J11bcFsnaWQnXV07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaCddWzFdKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2wnXVsxXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiJ11bMF0pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYSddWzBdKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWydwJ11bMV0pLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ28nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYyddWzBdKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3YnXVsxXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ29yZGVydHlwZSc6IHR5cGUsXG4gICAgICAgICAgICAndm9sdW1lJzogYW1vdW50LFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RBZGRPcmRlciAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHsgIFxuICAgICAgICBsZXQgdXJsID0gJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdHlwZSArICcvJyArIHBhdGg7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoeyAnbm9uY2UnOiBub25jZSB9LCBwYXJhbXMpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBxdWVyeSA9IHRoaXMuc3RyaW5nVG9CaW5hcnkgKHVybCArIHRoaXMuaGFzaCAobm9uY2UgKyBib2R5LCAnc2hhMjU2JywgJ2JpbmFyeScpKTtcbiAgICAgICAgICAgIGxldCBzZWNyZXQgPSB0aGlzLmJhc2U2NFRvQmluYXJ5ICh0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdBUEktS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ0FQSS1TaWduJzogdGhpcy5obWFjIChxdWVyeSwgc2VjcmV0LCAnc2hhNTEyJywgJ2Jhc2U2NCcpLFxuICAgICAgICAgICAgICAgICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHVybDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBsdW5vID0ge1xuXG4gICAgJ2lkJzogJ2x1bm8nLFxuICAgICduYW1lJzogJ2x1bm8nLFxuICAgICdjb3VudHJpZXMnOiBbICdVSycsICdTRycsICdaQScsIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDUwMDAsXG4gICAgJ3ZlcnNpb24nOiAnMScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY2MDctOGMxYTY5ZDgtNWVkZS0xMWU3LTkzMGMtNTQwYjVlYjliZTI0LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkubXliaXR4LmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3Lmx1bm8uY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL25wbWpzLm9yZy9wYWNrYWdlL2JpdHgnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9iYXVzbWVpZXIvbm9kZS1iaXR4JyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdvcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLFxuICAgICAgICAgICAgICAgICd0aWNrZXJzJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMve2lkfS9wZW5kaW5nJyxcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMve2lkfS90cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnZmVlX2luZm8nLFxuICAgICAgICAgICAgICAgICdmdW5kaW5nX2FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICdsaXN0b3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnbGlzdHRyYWRlcycsXG4gICAgICAgICAgICAgICAgJ29yZGVycy97aWR9JyxcbiAgICAgICAgICAgICAgICAncXVvdGVzL3tpZH0nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2FscycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzL3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdhY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ3Bvc3RvcmRlcicsXG4gICAgICAgICAgICAgICAgJ21hcmtldG9yZGVyJyxcbiAgICAgICAgICAgICAgICAnc3RvcG9yZGVyJyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZ19hZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMnLFxuICAgICAgICAgICAgICAgICdzZW5kJyxcbiAgICAgICAgICAgICAgICAncXVvdGVzJyxcbiAgICAgICAgICAgICAgICAnb2F1dGgyL2dyYW50JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncHV0JzogW1xuICAgICAgICAgICAgICAgICdxdW90ZXMve2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlbGV0ZSc6IFtcbiAgICAgICAgICAgICAgICAncXVvdGVzL3tpZH0nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy97aWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlcnMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0c1sndGlja2VycyddLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWyd0aWNrZXJzJ11bcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydwYWlyJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IGlkLnNsaWNlICgwLCAzKTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IGlkLnNsaWNlICgzLCA2KTtcbiAgICAgICAgICAgIGJhc2UgPSB0aGlzLmNvbW1vbkN1cnJlbmN5Q29kZSAoYmFzZSk7XG4gICAgICAgICAgICBxdW90ZSA9IHRoaXMuY29tbW9uQ3VycmVuY3lDb2RlIChxdW90ZSk7XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0T3JkZXJib29rICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd0aW1lc3RhbXAnXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsb3cnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RfdHJhZGUnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydyb2xsaW5nXzI0X2hvdXJfdm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdClcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0JztcbiAgICAgICAgbGV0IG9yZGVyID0geyAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0Jykge1xuICAgICAgICAgICAgbWV0aG9kICs9ICdNYXJrZXRvcmRlcic7XG4gICAgICAgICAgICBvcmRlclsndHlwZSddID0gc2lkZS50b1VwcGVyQ2FzZSAoKTtcbiAgICAgICAgICAgIGlmIChzaWRlID09ICdidXknKVxuICAgICAgICAgICAgICAgIG9yZGVyWydjb3VudGVyX3ZvbHVtZSddID0gYW1vdW50O1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9yZGVyWydiYXNlX3ZvbHVtZSddID0gYW1vdW50OyAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWV0aG9kICs9ICdPcmRlcic7XG4gICAgICAgICAgICBvcmRlclsndm9sdW1lJ10gPSBhbW91bnQ7XG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICAgICAgaWYgKHNpZGUgPT0gJ2J1eScpXG4gICAgICAgICAgICAgICAgb3JkZXJbJ3R5cGUnXSA9ICdCSUQnO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9yZGVyWyd0eXBlJ10gPSAnQVNLJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3ByaXZhdGUnKSB7XG4gICAgICAgICAgICBsZXQgYXV0aCA9IHRoaXMuc3RyaW5nVG9CYXNlNjQgKHRoaXMuYXBpS2V5ICsgJzonICsgdGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHsgJ0F1dGhvcml6YXRpb24nOiAnQmFzaWMgJyArIGF1dGggfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE9LQ29pbiBcbi8vIENoaW5hXG4vLyBodHRwczovL3d3dy5va2NvaW4uY29tL1xuLy8gaHR0cHM6Ly93d3cub2tjb2luLmNvbS9yZXN0X2dldFN0YXJ0ZWQuaHRtbFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL09LQ29pbi93ZWJzb2NrZXRcbi8vIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL29rY29pbi5jb21cbi8vIGh0dHBzOi8vd3d3Lm9rY29pbi5jblxuLy8gaHR0cHM6Ly93d3cub2tjb2luLmNuL3Jlc3RfZ2V0U3RhcnRlZC5odG1sXG5cbnZhciBva2NvaW4gPSB7XG5cbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsIC8vIHVwIHRvIDMwMDAgcmVxdWVzdHMgcGVyIDUgbWludXRlcyDiiYggNjAwIHJlcXVlc3RzIHBlciBtaW51dGUg4omIIDEwIHJlcXVlc3RzIHBlciBzZWNvbmQg4omIIDEwMCBtc1xuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdkZXB0aCcsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlX3JhdGUnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfZGVwdGgnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfZXN0aW1hdGVkX3ByaWNlJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2hvbGRfYW1vdW50JyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2luZGV4JyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2tsaW5lJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX3ByaWNlX2xpbWl0JyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdrbGluZScsXG4gICAgICAgICAgICAgICAgJ290Y3MnLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLCAgICBcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRfcmVjb3JkcycsXG4gICAgICAgICAgICAgICAgJ2JhdGNoX3RyYWRlJyxcbiAgICAgICAgICAgICAgICAnYm9ycm93X21vbmV5JyxcbiAgICAgICAgICAgICAgICAnYm9ycm93X29yZGVyX2luZm8nLFxuICAgICAgICAgICAgICAgICdib3Jyb3dzX2luZm8nLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfYm9ycm93JyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVyJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX290Y19vcmRlcicsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF93aXRoZHJhdycsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9iYXRjaF90cmFkZScsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfZGV2b2x2ZScsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9leHBsb3NpdmUnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfb3JkZXJfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9vcmRlcnNfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9wb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9wb3NpdGlvbl80Zml4JyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX3RyYWRlJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX3RyYWRlc19oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX3VzZXJpbmZvJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX3VzZXJpbmZvXzRmaXgnLFxuICAgICAgICAgICAgICAgICdsZW5kX2RlcHRoJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfZmVlJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ29yZGVyX2luZm8nLFxuICAgICAgICAgICAgICAgICdvcmRlcnNfaW5mbycsXG4gICAgICAgICAgICAgICAgJ290Y19vcmRlcl9oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnb3RjX29yZGVyX2luZm8nLFxuICAgICAgICAgICAgICAgICdyZXBheW1lbnQnLFxuICAgICAgICAgICAgICAgICdzdWJtaXRfb3RjX29yZGVyJyxcbiAgICAgICAgICAgICAgICAndHJhZGUnLFxuICAgICAgICAgICAgICAgICd0cmFkZV9oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAndHJhZGVfb3RjX29yZGVyJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd19pbmZvJyxcbiAgICAgICAgICAgICAgICAndW5yZXBheW1lbnRzX2luZm8nLFxuICAgICAgICAgICAgICAgICd1c2VyaW5mbycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXREZXB0aCAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWyd0aWNrZXInXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50IChyZXNwb25zZVsnZGF0ZSddKSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VXNlcmluZm8gKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9yZGVyWyd0eXBlJ10gKz0gJ19tYXJrZXQnO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFRyYWRlICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gJy9hcGkvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHBhdGggKyAnLmRvJzsgICBcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5rZXlzb3J0ICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdhcGlfa2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIC8vIHNlY3JldCBrZXkgbXVzdCBiZSBhdCB0aGUgZW5kIG9mIHF1ZXJ5XG4gICAgICAgICAgICBsZXQgcXVlcnlTdHJpbmcgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpICsgJyZzZWNyZXRfa2V5PScgKyB0aGlzLnNlY3JldDtcbiAgICAgICAgICAgIHF1ZXJ5WydzaWduJ10gPSB0aGlzLmhhc2ggKHF1ZXJ5U3RyaW5nKS50b1VwcGVyQ2FzZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHsgJ0NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnIH07XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHVybDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBva2NvaW5jbnkgPSBleHRlbmQgKG9rY29pbiwge1xuICAgICdpZCc6ICdva2NvaW5jbnknLFxuICAgICduYW1lJzogJ09LQ29pbiBDTlknLFxuICAgICdjb3VudHJpZXMnOiAnQ04nLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NzkyLThiZTkxNTdhLTVlZTUtMTFlNy05MjZjLTZkNjliOGQzMzc4ZC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vd3d3Lm9rY29pbi5jbicsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cub2tjb2luLmNuJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL3d3dy5va2NvaW4uY24vcmVzdF9nZXRTdGFydGVkLmh0bWwnLFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL0NOWSc6IHsgJ2lkJzogJ2J0Y19jbnknLCAnc3ltYm9sJzogJ0JUQy9DTlknLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ05ZJyB9LFxuICAgICAgICAnTFRDL0NOWSc6IHsgJ2lkJzogJ2x0Y19jbnknLCAnc3ltYm9sJzogJ0xUQy9DTlknLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnQ05ZJyB9LFxuICAgIH0sXG59KVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBva2NvaW51c2QgPSBleHRlbmQgKG9rY29pbiwge1xuICAgICdpZCc6ICdva2NvaW51c2QnLFxuICAgICduYW1lJzogJ09LQ29pbiBVU0QnLFxuICAgICdjb3VudHJpZXMnOiBbICdDTicsICdVUycgXSxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2Njc5MS04OWZmYjUwMi01ZWU1LTExZTctOGE1Yi1jNTk1MGI2OGFjNjUuanBnJywgICAgICAgIFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vd3d3Lm9rY29pbi5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3Lm9rY29pbi5jb20nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lm9rY29pbi5jb20vcmVzdF9nZXRTdGFydGVkLmh0bWwnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL29rY29pbi5jb20nLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ2J0Y191c2QnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnTFRDL1VTRCc6IHsgJ2lkJzogJ2x0Y191c2QnLCAnc3ltYm9sJzogJ0xUQy9VU0QnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgIH0sXG59KVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBwYXltaXVtID0ge1xuXG4gICAgJ2lkJzogJ3BheW1pdW0nLFxuICAgICduYW1lJzogJ1BheW1pdW0nLFxuICAgICdjb3VudHJpZXMnOiBbICdGUicsICdFVScsIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDMwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzkwNTY0LWE5NDVhOWQ0LTVmZjktMTFlNy05ZDJkLWI2MzU3NjNmMmYyNC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vcGF5bWl1bS5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5wYXltaXVtLmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cucGF5bWl1bS5jb20vcGFnZS9kZXZlbG9wZXJzJyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vUGF5bWl1bS9hcGktZG9jdW1lbnRhdGlvbicsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnY291bnRyaWVzJyxcbiAgICAgICAgICAgICAgICAnZGF0YS97aWR9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ2RhdGEve2lkfS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdkYXRhL3tpZH0vZGVwdGgnLFxuICAgICAgICAgICAgICAgICdiaXRjb2luX2NoYXJ0cy97aWR9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2JpdGNvaW5fY2hhcnRzL3tpZH0vZGVwdGgnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdtZXJjaGFudC9nZXRfcGF5bWVudC97VVVJRH0nLFxuICAgICAgICAgICAgICAgICd1c2VyJyxcbiAgICAgICAgICAgICAgICAndXNlci9hZGRyZXNzZXMnLFxuICAgICAgICAgICAgICAgICd1c2VyL2FkZHJlc3Nlcy97YnRjX2FkZHJlc3N9JyxcbiAgICAgICAgICAgICAgICAndXNlci9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICd1c2VyL29yZGVycy97VVVJRH0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3ByaWNlX2FsZXJ0cycsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ3VzZXIvb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAndXNlci9hZGRyZXNzZXMnLFxuICAgICAgICAgICAgICAgICd1c2VyL3BheW1lbnRfcmVxdWVzdHMnLFxuICAgICAgICAgICAgICAgICd1c2VyL3ByaWNlX2FsZXJ0cycsXG4gICAgICAgICAgICAgICAgJ21lcmNoYW50L2NyZWF0ZV9wYXltZW50JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICd1c2VyL29yZGVycy97VVVJRH0vY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAndXNlci9wcmljZV9hbGVydHMve2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ2V1cicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRVc2VyICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXREYXRhSWREZXB0aCAgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldERhdGFJZFRpY2tlciAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsnYXQnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogcGFyc2VGbG9hdCAodGlja2VyWyd2YXJpYXRpb24nXSksXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RGF0YUlkVHJhZGVzICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3R5cGUnOiB0aGlzLmNhcGl0YWxpemUgKHR5cGUpICsgJ09yZGVyJyxcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdkaXJlY3Rpb24nOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFVzZXJPcmRlcnMgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE9yZGVyIChpZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RDYW5jZWxPcmRlciAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdvcmRlck51bWJlcic6IGlkLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocGFyYW1zKTtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7ICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgYXV0aCA9IG5vbmNlICsgdXJsICsgYm9keTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0FwaS1LZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnQXBpLVNpZ25hdHVyZSc6IHRoaXMuaG1hYyAoYXV0aCwgdGhpcy5zZWNyZXQpLFxuICAgICAgICAgICAgICAgICdBcGktTm9uY2UnOiBub25jZSwgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBwb2xvbmlleCA9IHtcblxuICAgICdpZCc6ICdwb2xvbmlleCcsXG4gICAgJ25hbWUnOiAnUG9sb25pZXgnLFxuICAgICdjb3VudHJpZXMnOiAnVVMnLFxuICAgICdyYXRlTGltaXQnOiAxMDAwLCAvLyA2IGNhbGxzIHBlciBzZWNvbmRcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjgxNy1lOTQ1NjMxMi01ZWU2LTExZTctOWIzYy1iNjI4Y2E1NjI2YTUuanBnJyxcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdwdWJsaWMnOiAnaHR0cHM6Ly9wb2xvbmlleC5jb20vcHVibGljJyxcbiAgICAgICAgICAgICdwcml2YXRlJzogJ2h0dHBzOi8vcG9sb25pZXguY29tL3RyYWRpbmdBcGknLFxuICAgICAgICB9LFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vcG9sb25pZXguY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3BvbG9uaWV4LmNvbS9zdXBwb3J0L2FwaS8nLFxuICAgICAgICAgICAgJ2h0dHA6Ly9wYXN0ZWJpbi5jb20vZE1YN21aRTAnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3JldHVybjI0aFZvbHVtZScsXG4gICAgICAgICAgICAgICAgJ3JldHVybkNoYXJ0RGF0YScsXG4gICAgICAgICAgICAgICAgJ3JldHVybkN1cnJlbmNpZXMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5Mb2FuT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuT3JkZXJCb29rJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuVGlja2VyJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuVHJhZGVIaXN0b3J5JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2J1eScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbExvYW5PZmZlcicsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnY2xvc2VNYXJnaW5Qb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZUxvYW5PZmZlcicsXG4gICAgICAgICAgICAgICAgJ2dlbmVyYXRlTmV3QWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ2dldE1hcmdpblBvc2l0aW9uJyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luQnV5JyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luU2VsbCcsXG4gICAgICAgICAgICAgICAgJ21vdmVPcmRlcicsXG4gICAgICAgICAgICAgICAgJ3JldHVybkFjdGl2ZUxvYW5zJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuQXZhaWxhYmxlQWNjb3VudEJhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuQmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5Db21wbGV0ZUJhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuRGVwb3NpdEFkZHJlc3NlcycsXG4gICAgICAgICAgICAgICAgJ3JldHVybkRlcG9zaXRzV2l0aGRyYXdhbHMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5GZWVJbmZvJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuTGVuZGluZ0hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdyZXR1cm5NYXJnaW5BY2NvdW50U3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJ3JldHVybk9wZW5Mb2FuT2ZmZXJzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuT3Blbk9yZGVycycsXG4gICAgICAgICAgICAgICAgJ3JldHVybk9yZGVyVHJhZGVzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuVHJhZGFibGVCYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ3JldHVyblRyYWRlSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3NlbGwnLFxuICAgICAgICAgICAgICAgICd0b2dnbGVBdXRvUmVuZXcnLFxuICAgICAgICAgICAgICAgICd0cmFuc2ZlckJhbGFuY2UnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRSZXR1cm5UaWNrZXIgKCk7XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHByb2R1Y3RzKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IGtleXMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBpZCA9IGtleXNbcF07XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW2lkXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBpZC5yZXBsYWNlICgnXycsICcvJyk7XG4gICAgICAgICAgICBsZXQgWyBiYXNlLCBxdW90ZSBdID0gc3ltYm9sLnNwbGl0ICgnLycpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFJldHVybkNvbXBsZXRlQmFsYW5jZXMgKHtcbiAgICAgICAgICAgICdhY2NvdW50JzogJ2FsbCcsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRSZXR1cm5PcmRlckJvb2sgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeVBhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXJzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRSZXR1cm5UaWNrZXIgKCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSB0aWNrZXJzW3BbJ2lkJ11dO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gyNGhyJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93MjRociddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2hlc3RCaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydsb3dlc3RBc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2hhbmdlJzogcGFyc2VGbG9hdCAodGlja2VyWydwZXJjZW50Q2hhbmdlJ10pLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydiYXNlVm9sdW1lJ10pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydxdW90ZVZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRSZXR1cm5UcmFkZUhpc3RvcnkgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeVBhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlUG9zdCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5UGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdyYXRlJzogcHJpY2UsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsT3JkZXIgKGlkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdENhbmNlbE9yZGVyICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ29yZGVyTnVtYmVyJzogaWQsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXVt0eXBlXTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgJ2NvbW1hbmQnOiBwYXRoIH0sIHBhcmFtcyk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHF1ZXJ5Wydub25jZSddID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdTaWduJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIHF1YWRyaWdhY3ggPSB7XG5cbiAgICAnaWQnOiAncXVhZHJpZ2FjeCcsXG4gICAgJ25hbWUnOiAnUXVhZHJpZ2FDWCcsXG4gICAgJ2NvdW50cmllcyc6ICdDQScsXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjInLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2ODI1LTk4YTZkMGRlLTVlZTctMTFlNy05ZmE0LTM4ZTExYTJjNmY1Mi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLnF1YWRyaWdhY3guY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5xdWFkcmlnYWN4LmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly93d3cucXVhZHJpZ2FjeC5jb20vYXBpX2luZm8nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ29yZGVyX2Jvb2snLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLCAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdiaXRjb2luX2RlcG9zaXRfYWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ2JpdGNvaW5fd2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ2J1eScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ2V0aGVyX2RlcG9zaXRfYWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ2V0aGVyX3dpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdsb29rdXBfb3JkZXInLFxuICAgICAgICAgICAgICAgICdvcGVuX29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3NlbGwnLFxuICAgICAgICAgICAgICAgICd1c2VyX3RyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL0NBRCc6IHsgJ2lkJzogJ2J0Y19jYWQnLCAnc3ltYm9sJzogJ0JUQy9DQUQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ0FEJyB9LFxuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ2J0Y191c2QnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnRVRIL0JUQyc6IHsgJ2lkJzogJ2V0aF9idGMnLCAnc3ltYm9sJzogJ0VUSC9CVEMnLCAnYmFzZSc6ICdFVEgnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnRVRIL0NBRCc6IHsgJ2lkJzogJ2V0aF9jYWQnLCAnc3ltYm9sJzogJ0VUSC9DQUQnLCAnYmFzZSc6ICdFVEgnLCAncXVvdGUnOiAnQ0FEJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVyQm9vayAoe1xuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdib29rJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50ICh0aWNrZXJbJ3RpbWVzdGFtcCddKSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhbnNhY3Rpb25zICh7XG4gICAgICAgICAgICAnYm9vayc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSk7IFxuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0Q2FuY2VsT3JkZXIgKHRoaXMuZXh0ZW5kICh7IGlkIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHBhdGg7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSBbIG5vbmNlLCB0aGlzLnVpZCwgdGhpcy5hcGlLZXkgXS5qb2luICgnJyk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5obWFjIChyZXF1ZXN0LCB0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoeyBcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ3NpZ25hdHVyZSc6IHNpZ25hdHVyZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBxdW9pbmUgPSB7XG5cbiAgICAnaWQnOiAncXVvaW5lJyxcbiAgICAnbmFtZSc6ICdRVU9JTkUnLFxuICAgICdjb3VudHJpZXMnOiBbICdKUCcsICdTRycsICdWTicgXSxcbiAgICAndmVyc2lvbic6ICcyJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2Njg0NC05NjE1YTRlOC01ZWU4LTExZTctODgxNC1mY2QwMDRkYjhjZGQuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5xdW9pbmUuY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5xdW9pbmUuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2RldmVsb3BlcnMucXVvaW5lLmNvbScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAncHJvZHVjdHMnLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cy97aWR9JyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdHMve2lkfS9wcmljZV9sZXZlbHMnLFxuICAgICAgICAgICAgICAgICdleGVjdXRpb25zJyxcbiAgICAgICAgICAgICAgICAnaXJfbGFkZGVycy97Y3VycmVuY3l9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMvYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2NyeXB0b19hY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2V4ZWN1dGlvbnMvbWUnLFxuICAgICAgICAgICAgICAgICdmaWF0X2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnbG9hbl9iaWRzJyxcbiAgICAgICAgICAgICAgICAnbG9hbnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ29yZGVycy97aWR9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97aWR9L2xvYW5zJyxcbiAgICAgICAgICAgICAgICAndHJhZGluZ19hY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ3RyYWRpbmdfYWNjb3VudHMve2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2ZpYXRfYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdsb2FuX2JpZHMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwdXQnOiBbXG4gICAgICAgICAgICAgICAgJ2xvYW5fYmlkcy97aWR9L2Nsb3NlJyxcbiAgICAgICAgICAgICAgICAnbG9hbnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ29yZGVycy97aWR9JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3tpZH0vY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzL3tpZH0nLFxuICAgICAgICAgICAgICAgICd0cmFkZXMve2lkfS9jbG9zZScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy9jbG9zZV9hbGwnLFxuICAgICAgICAgICAgICAgICd0cmFkaW5nX2FjY291bnRzL3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0UHJvZHVjdHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1twXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ2lkJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ2Jhc2VfY3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ3F1b3RlZF9jdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEFjY291bnRzQmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0UHJvZHVjdHNJZFByaWNlTGV2ZWxzICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQcm9kdWN0c0lkICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2hfbWFya2V0X2FzayddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvd19tYXJrZXRfYmlkJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWFya2V0X2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21hcmtldF9hc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RfdHJhZGVkX3ByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lXzI0aCddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRFeGVjdXRpb25zICh7XG4gICAgICAgICAgICAncHJvZHVjdF9pZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnb3JkZXJfdHlwZSc6IHR5cGUsXG4gICAgICAgICAgICAncHJvZHVjdF9pZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICdxdWFudGl0eSc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXJzICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ29yZGVyJzogb3JkZXIsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQdXRPcmRlcnNJZENhbmNlbCAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9ICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgJ1gtUXVvaW5lLUFQSS1WZXJzaW9uJzogdGhpcy52ZXJzaW9uLFxuICAgICAgICAgICAgJ0NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBsZXQgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICAncGF0aCc6IHVybCwgXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsIFxuICAgICAgICAgICAgICAgICd0b2tlbl9pZCc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdpYXQnOiBNYXRoLmZsb29yIChub25jZSAvIDEwMDApLCAvLyBpc3N1ZWQgYXRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5IChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzWydYLVF1b2luZS1BdXRoJ10gPSB0aGlzLmp3dCAocmVxdWVzdCwgdGhpcy5zZWNyZXQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh0aGlzLnVybHNbJ2FwaSddICsgdXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIHRoZXJvY2sgPSB7XG5cbiAgICAnaWQnOiAndGhlcm9jaycsXG4gICAgJ25hbWUnOiAnVGhlUm9ja1RyYWRpbmcnLFxuICAgICdjb3VudHJpZXMnOiAnTVQnLFxuICAgICdyYXRlTGltaXQnOiAxMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2Njg2OS03NTA1N2ZhMi01ZWU5LTExZTctOWE2Zi0xM2U2NDFmYTQ3MDcuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS50aGVyb2NrdHJhZGluZy5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vdGhlcm9ja3RyYWRpbmcuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2FwaS50aGVyb2NrdHJhZGluZy5jb20vZG9jLycsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZnVuZHMve2lkfS9vcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICdmdW5kcy97aWR9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tpZH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnZnVuZHMvdGlja2VycycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZXMve2lkfScsXG4gICAgICAgICAgICAgICAgJ2Rpc2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2Rpc2NvdW50cy97aWR9JyxcbiAgICAgICAgICAgICAgICAnZnVuZHMnLFxuICAgICAgICAgICAgICAgICdmdW5kcy97aWR9JyxcbiAgICAgICAgICAgICAgICAnZnVuZHMve2lkfS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZnVuZHMve2Z1bmRfaWR9L29yZGVycy97aWR9JywgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9wb3NpdGlvbl9iYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9wb3NpdGlvbnMnLFxuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vcG9zaXRpb25zL3tpZH0nLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2xpbWl0cy97aWR9JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdfbGltaXRzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYXRtcy93aXRoZHJhdycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9vcmRlcnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9vcmRlcnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9vcmRlcnMvcmVtb3ZlX2FsbCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRGdW5kc1RpY2tlcnMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0c1sndGlja2VycyddLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWyd0aWNrZXJzJ11bcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydmdW5kX2lkJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IGlkLnNsaWNlICgwLCAzKTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IGlkLnNsaWNlICgzLCA2KTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0QmFsYW5jZXMgKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldEZ1bmRzSWRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEZ1bmRzSWRUaWNrZXIgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLnBhcnNlODYwMSAodGlja2VyWydkYXRlJ10pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnY2xvc2UnXSksXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZV90cmFkZWQnXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRGdW5kc0lkVHJhZGVzICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgKHRoaXMuaWQgKyAnIGFsbG93cyBsaW1pdCBvcmRlcnMgb25seScpO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEZ1bmRzRnVuZElkT3JkZXJzICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ2Z1bmRfaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnc2lkZSc6IHNpZGUsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHJpdmF0ZScpIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdYLVRSVC1LRVknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnWC1UUlQtTk9OQ0UnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnWC1UUlQtU0lHTic6IHRoaXMuaG1hYyAobm9uY2UgKyB1cmwsIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5IChxdWVyeSk7XG4gICAgICAgICAgICAgICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciB2YXVsdG9ybyA9IHtcblxuICAgICdpZCc6ICd2YXVsdG9ybycsXG4gICAgJ25hbWUnOiAnVmF1bHRvcm8nLFxuICAgICdjb3VudHJpZXMnOiAnQ0gnLFxuICAgICdyYXRlTGltaXQnOiAxMDAwLFxuICAgICd2ZXJzaW9uJzogJzEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2ODgwLWYyMDVlODcwLTVlZTktMTFlNy04ZmUyLTBkNWIxNTg4MDc1Mi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLnZhdWx0b3JvLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cudmF1bHRvcm8uY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2FwaS52YXVsdG9yby5jb20nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JpZGFuZGFzaycsXG4gICAgICAgICAgICAgICAgJ2J1eW9yZGVycycsXG4gICAgICAgICAgICAgICAgJ2xhdGVzdCcsXG4gICAgICAgICAgICAgICAgJ2xhdGVzdHRyYWRlcycsXG4gICAgICAgICAgICAgICAgJ21hcmtldHMnLFxuICAgICAgICAgICAgICAgICdvcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICdzZWxsb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zL2RheScsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucy9ob3VyJyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zL21vbnRoJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ215dHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYnV5L3tzeW1ib2x9L3t0eXBlfScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbC97b3JkZXJpZCcsXG4gICAgICAgICAgICAgICAgJ3NlbGwve3N5bWJvbH0ve3R5cGV9JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRNYXJrZXRzICgpO1xuICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWydkYXRhJ107XG4gICAgICAgIGxldCBiYXNlID0gcHJvZHVjdFsnQmFzZUN1cnJlbmN5J107XG4gICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ01hcmtldEN1cnJlbmN5J107XG4gICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgIGxldCBiYXNlSWQgPSBiYXNlO1xuICAgICAgICBsZXQgcXVvdGVJZCA9IHF1b3RlO1xuICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydNYXJrZXROYW1lJ107XG4gICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICdiYXNlSWQnOiBiYXNlSWQsXG4gICAgICAgICAgICAncXVvdGVJZCc6IHF1b3RlSWQsXG4gICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0T3JkZXJib29rICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcXVvdGUgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEJpZGFuZGFzayAoKTtcbiAgICAgICAgbGV0IGJpZHNMZW5ndGggPSBxdW90ZVsnYmlkcyddLmxlbmd0aDtcbiAgICAgICAgbGV0IGJpZCA9IHF1b3RlWydiaWRzJ11bYmlkc0xlbmd0aCAtIDFdO1xuICAgICAgICBsZXQgYXNrID0gcXVvdGVbJ2Fza3MnXVswXTtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRNYXJrZXRzICgpO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ2RhdGEnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWycyNGhIaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnMjRoTG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IGJpZFswXSxcbiAgICAgICAgICAgICdhc2snOiBhc2tbMF0sXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RQcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJzI0aFZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFuc2FjdGlvbnNEYXkgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVBvc3QnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKSArICdTeW1ib2xUeXBlJztcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiBwWydxdW90ZUlkJ10udG9Mb3dlckNhc2UgKCksXG4gICAgICAgICAgICAndHlwZSc6IHR5cGUsXG4gICAgICAgICAgICAnZ2xkJzogYW1vdW50LFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UgfHwgMSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9IHBhdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgdXJsICs9IHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ2FwaWtleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgfSwgdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpKTtcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICdYLVNpZ25hdHVyZSc6IHRoaXMuaG1hYyAodXJsLCB0aGlzLnNlY3JldClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciB2aXJ3b3ggPSB7XG5cbiAgICAnaWQnOiAndmlyd294JyxcbiAgICAnbmFtZSc6ICdWaXJXb1gnLFxuICAgICdjb3VudHJpZXMnOiAnQVQnLFxuICAgICdyYXRlTGltaXQnOiAxMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2ODk0LTZkYTlkMzYwLTVlZWEtMTFlNy05MGFhLTQxZjI3MTFiNzQwNS5qcGcnLFxuICAgICAgICAnYXBpJzoge1xuICAgICAgICAgICAgJ3B1YmxpYyc6ICdodHRwOi8vYXBpLnZpcndveC5jb20vYXBpL2pzb24ucGhwJyxcbiAgICAgICAgICAgICdwcml2YXRlJzogJ2h0dHBzOi8vd3d3LnZpcndveC5jb20vYXBpL3RyYWRpbmcucGhwJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy52aXJ3b3guY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL3d3dy52aXJ3b3guY29tL2RldmVsb3BlcnMucGhwJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdnZXRJbnN0cnVtZW50cycsXG4gICAgICAgICAgICAgICAgJ2dldEJlc3RQcmljZXMnLFxuICAgICAgICAgICAgICAgICdnZXRNYXJrZXREZXB0aCcsXG4gICAgICAgICAgICAgICAgJ2VzdGltYXRlTWFya2V0T3JkZXInLFxuICAgICAgICAgICAgICAgICdnZXRUcmFkZWRQcmljZVZvbHVtZScsXG4gICAgICAgICAgICAgICAgJ2dldFJhd1RyYWRlRGF0YScsXG4gICAgICAgICAgICAgICAgJ2dldFN0YXRpc3RpY3MnLFxuICAgICAgICAgICAgICAgICdnZXRUZXJtaW5hbExpc3QnLFxuICAgICAgICAgICAgICAgICdnZXRHcmlkTGlzdCcsXG4gICAgICAgICAgICAgICAgJ2dldEdyaWRTdGF0aXN0aWNzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnZ2V0SW5zdHJ1bWVudHMnLFxuICAgICAgICAgICAgICAgICdnZXRCZXN0UHJpY2VzJyxcbiAgICAgICAgICAgICAgICAnZ2V0TWFya2V0RGVwdGgnLFxuICAgICAgICAgICAgICAgICdlc3RpbWF0ZU1hcmtldE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnZ2V0VHJhZGVkUHJpY2VWb2x1bWUnLFxuICAgICAgICAgICAgICAgICdnZXRSYXdUcmFkZURhdGEnLFxuICAgICAgICAgICAgICAgICdnZXRTdGF0aXN0aWNzJyxcbiAgICAgICAgICAgICAgICAnZ2V0VGVybWluYWxMaXN0JyxcbiAgICAgICAgICAgICAgICAnZ2V0R3JpZExpc3QnLFxuICAgICAgICAgICAgICAgICdnZXRHcmlkU3RhdGlzdGljcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnZ2V0QmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdnZXRDb21taXNzaW9uRGlzY291bnQnLFxuICAgICAgICAgICAgICAgICdnZXRPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdnZXRUcmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICdwbGFjZU9yZGVyJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnY2FuY2VsT3JkZXInLFxuICAgICAgICAgICAgICAgICdnZXRCYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2dldENvbW1pc3Npb25EaXNjb3VudCcsXG4gICAgICAgICAgICAgICAgJ2dldE9yZGVycycsXG4gICAgICAgICAgICAgICAgJ2dldFRyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICAgICAgJ3BsYWNlT3JkZXInLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0SW5zdHJ1bWVudHMgKCk7XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHByb2R1Y3RzWydyZXN1bHQnXSk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWydyZXN1bHQnXVtrZXlzW3BdXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ2luc3RydW1lbnRJRCddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IHByb2R1Y3RbJ3N5bWJvbCddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0Wydsb25nQ3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ3Nob3J0Q3VycmVuY3knXTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RHZXRCYWxhbmNlcyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hCZXN0UHJpY2VzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY1Bvc3RHZXRCZXN0UHJpY2VzICh7XG4gICAgICAgICAgICAnc3ltYm9scyc6IFsgdGhpcy5zeW1ib2wgKHByb2R1Y3QpIF0sXG4gICAgICAgIH0pO1xuICAgIH0sIFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljUG9zdEdldE1hcmtldERlcHRoICh7XG4gICAgICAgICAgICAnc3ltYm9scyc6IFsgdGhpcy5zeW1ib2wgKHByb2R1Y3QpIF0sXG4gICAgICAgICAgICAnYnV5RGVwdGgnOiAxMDAsXG4gICAgICAgICAgICAnc2VsbERlcHRoJzogMTAwLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IGVuZCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICBsZXQgc3RhcnQgPSBlbmQgLSA4NjQwMDAwMDtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUcmFkZWRQcmljZVZvbHVtZSAoe1xuICAgICAgICAgICAgJ2luc3RydW1lbnQnOiB0aGlzLnN5bWJvbCAocHJvZHVjdCksXG4gICAgICAgICAgICAnZW5kRGF0ZSc6IHRoaXMueXl5eW1tZGRoaG1tc3MgKGVuZCksXG4gICAgICAgICAgICAnc3RhcnREYXRlJzogdGhpcy55eXl5bW1kZGhobW1zcyAoc3RhcnQpLFxuICAgICAgICAgICAgJ0hMT0MnOiAxLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlcnMgPSByZXNwb25zZVsncmVzdWx0J11bJ3ByaWNlVm9sdW1lTGlzdCddO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzICh0aWNrZXJzKTtcbiAgICAgICAgbGV0IGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgICAgICBsZXQgbGFzdEtleSA9IGtleXNbbGVuZ3RoIC0gMV07XG4gICAgICAgIGxldCB0aWNrZXIgPSB0aWNrZXJzW2xhc3RLZXldO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Fzayc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2Nsb3NlJ10pLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydsb25nVm9sdW1lJ10pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydzaG9ydFZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRSYXdUcmFkZURhdGEgKHtcbiAgICAgICAgICAgICdpbnN0cnVtZW50JzogdGhpcy5zeW1ib2wgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3RpbWVzcGFuJzogMzYwMCxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnaW5zdHJ1bWVudCc6IHRoaXMuc3ltYm9sIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdvcmRlclR5cGUnOiBzaWRlLnRvVXBwZXJDYXNlICgpLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0UGxhY2VPcmRlciAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV07XG4gICAgICAgIGxldCBhdXRoID0ge307XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBhdXRoWydrZXknXSA9IHRoaXMuYXBpS2V5O1xuICAgICAgICAgICAgYXV0aFsndXNlciddID0gdGhpcy5sb2dpbjtcbiAgICAgICAgICAgIGF1dGhbJ3Bhc3MnXSA9IHRoaXMucGFzc3dvcmQ7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgaWYgKG1ldGhvZCA9PSAnR0VUJykge1xuICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoeyBcbiAgICAgICAgICAgICAgICAnbWV0aG9kJzogcGF0aCwgXG4gICAgICAgICAgICAgICAgJ2lkJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBhdXRoLCBwYXJhbXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfTtcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAoeyBcbiAgICAgICAgICAgICAgICAnbWV0aG9kJzogcGF0aCwgXG4gICAgICAgICAgICAgICAgJ3BhcmFtcyc6IHRoaXMuZXh0ZW5kIChhdXRoLCBwYXJhbXMpLFxuICAgICAgICAgICAgICAgICdpZCc6IG5vbmNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciB5b2JpdCA9IHtcblxuICAgICdpZCc6ICd5b2JpdCcsXG4gICAgJ25hbWUnOiAnWW9CaXQnLFxuICAgICdjb3VudHJpZXMnOiAnUlUnLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLCAvLyByZXNwb25zZXMgYXJlIGNhY2hlZCBldmVyeSAyIHNlY29uZHNcbiAgICAndmVyc2lvbic6ICczJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjkxMC1jZGNiZmRhZS01ZWVhLTExZTctOTg1OS0wM2ZlYTg3MzI3MmQuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3lvYml0Lm5ldCcsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cueW9iaXQubmV0JyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL3d3dy55b2JpdC5uZXQvZW4vYXBpLycsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAnYXBpJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZGVwdGgve3BhaXJzfScsXG4gICAgICAgICAgICAgICAgJ2luZm8nLFxuICAgICAgICAgICAgICAgICd0aWNrZXIve3BhaXJzfScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97cGFpcnN9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICd0YXBpJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ0FjdGl2ZU9yZGVycycsXG4gICAgICAgICAgICAgICAgJ0NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnR2V0RGVwb3NpdEFkZHJlc3MnLFxuICAgICAgICAgICAgICAgICdnZXRJbmZvJyxcbiAgICAgICAgICAgICAgICAnT3JkZXJJbmZvJyxcbiAgICAgICAgICAgICAgICAnVHJhZGUnLCAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnVHJhZGVIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnV2l0aGRyYXdDb2luc1RvQWRkcmVzcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5hcGlHZXRJbmZvICgpO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0c1sncGFpcnMnXSk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgaWQgPSBrZXlzW3BdO1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sncGFpcnMnXVtpZF07XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gaWQudG9VcHBlckNhc2UgKCkucmVwbGFjZSAoJ18nLCAnLycpO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFwaVBvc3RHZXRJbmZvICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcGlHZXREZXB0aFBhaXJzICh7XG4gICAgICAgICAgICAncGFpcnMnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXJzID0gYXdhaXQgdGhpcy5hcGlHZXRUaWNrZXJQYWlycyAoe1xuICAgICAgICAgICAgJ3BhaXJzJzogcFsnaWQnXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSB0aWNrZXJzW3BbJ2lkJ11dO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd1cGRhdGVkJ10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogcGFyc2VGbG9hdCAodGlja2VyWydhdmcnXSksXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sX2N1ciddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFwaUdldFRyYWRlc1BhaXJzICh7XG4gICAgICAgICAgICAncGFpcnMnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgKHRoaXMuaWQgKyAnIGFsbG93cyBsaW1pdCBvcmRlcnMgb25seScpO1xuICAgICAgICByZXR1cm4gdGhpcy50YXBpUG9zdFRyYWRlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3JhdGUnOiBwcmljZSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE9yZGVyIChpZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFwaVBvc3RDYW5jZWxPcmRlciAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdvcmRlcl9pZCc6IGlkLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdhcGknLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0eXBlO1xuICAgICAgICBpZiAodHlwZSA9PSAnYXBpJykge1xuICAgICAgICAgICAgdXJsICs9ICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoeyAnbWV0aG9kJzogcGF0aCwgJ25vbmNlJzogbm9uY2UgfSwgcGFyYW1zKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdzaWduJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIHphaWYgPSB7XG5cbiAgICAnaWQnOiAnemFpZicsXG4gICAgJ25hbWUnOiAnWmFpZicsXG4gICAgJ2NvdW50cmllcyc6ICdKUCcsXG4gICAgJ3JhdGVMaW1pdCc6IDMwMDAsXG4gICAgJ3ZlcnNpb24nOiAnMScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY5MjctMzljYTJhZGEtNWVlYi0xMWU3LTk3MmYtMWI0MTk5NTE4Y2E2LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkuemFpZi5qcCcsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly96YWlmLmpwJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL2NvcnAuemFpZi5qcC9hcGktZG9jcycsXG4gICAgICAgICAgICAnaHR0cHM6Ly9jb3JwLnphaWYuanAvYXBpLWRvY3MvYXBpX2xpbmtzJyxcbiAgICAgICAgICAgICdodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS96YWlmLmpwJyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20veW91MjE5Nzkvbm9kZS16YWlmJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdkZXB0aC97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdjdXJyZW5jaWVzL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2N1cnJlbmNpZXMvYWxsJyxcbiAgICAgICAgICAgICAgICAnY3VycmVuY3lfcGFpcnMve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnY3VycmVuY3lfcGFpcnMvYWxsJyxcbiAgICAgICAgICAgICAgICAnbGFzdF9wcmljZS97cGFpcn0nLFxuICAgICAgICAgICAgICAgICd0aWNrZXIve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAndHJhZGVzL3twYWlyfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAndGFwaSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdhY3RpdmVfb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVyJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdF9oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnZ2V0X2lkX2luZm8nLFxuICAgICAgICAgICAgICAgICdnZXRfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2dldF9pbmZvMicsXG4gICAgICAgICAgICAgICAgJ2dldF9wZXJzb25hbF9pbmZvJyxcbiAgICAgICAgICAgICAgICAndHJhZGUnLFxuICAgICAgICAgICAgICAgICd0cmFkZV9oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd19oaXN0b3J5JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdlY2FwaSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdjcmVhdGVJbnZvaWNlJyxcbiAgICAgICAgICAgICAgICAnZ2V0SW52b2ljZScsXG4gICAgICAgICAgICAgICAgJ2dldEludm9pY2VJZHNCeU9yZGVyTnVtYmVyJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsSW52b2ljZScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5hcGlHZXRDdXJyZW5jeVBhaXJzQWxsICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydjdXJyZW5jeV9wYWlyJ107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gcHJvZHVjdFsnbmFtZSddO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFwaVBvc3RHZXRJbmZvICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcGlHZXREZXB0aFBhaXIgICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLmFwaUdldFRpY2tlclBhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFwaUdldFRyYWRlc1BhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICh0aGlzLmlkICsgJyBhbGxvd3MgbGltaXQgb3JkZXJzIG9ubHknKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFwaVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeV9wYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2FjdGlvbic6IChzaWRlID09ICdidXknKSA/ICdiaWQnIDogJ2FzaycsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcGlQb3N0Q2FuY2VsT3JkZXIgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnb3JkZXJfaWQnOiBpZCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAnYXBpJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdHlwZTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2FwaScpIHtcbiAgICAgICAgICAgIHVybCArPSAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdtZXRob2QnOiBwYXRoLFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAnS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1NpZ24nOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG52YXIgbWFya2V0cyA9IHtcblxuICAgICdfMWJyb2tlcic6ICAgIF8xYnJva2VyLFxuICAgICdfMWJ0Y3hlJzogICAgIF8xYnRjeGUsXG4gICAgJ2FueHBybyc6ICAgICAgYW54cHJvLFxuICAgICdiaXQyYyc6ICAgICAgIGJpdDJjLFxuICAgICdiaXRiYXknOiAgICAgIGJpdGJheSxcbiAgICAnYml0YmF5cyc6ICAgICBiaXRiYXlzLFxuICAgICdiaXRjb2luY29pZCc6IGJpdGNvaW5jb2lkLFxuICAgICdiaXRmaW5leCc6ICAgIGJpdGZpbmV4LFxuICAgICdiaXRsaXNoJzogICAgIGJpdGxpc2gsXG4gICAgJ2JpdG1hcmtldCc6ICAgYml0bWFya2V0LFxuICAgICdiaXRtZXgnOiAgICAgIGJpdG1leCxcbiAgICAnYml0c28nOiAgICAgICBiaXRzbyxcbiAgICAnYml0c3RhbXAnOiAgICBiaXRzdGFtcCxcbiAgICAnYml0dHJleCc6ICAgICBiaXR0cmV4LFxuICAgICdidGNjaGluYSc6ICAgIGJ0Y2NoaW5hLFxuICAgICdidGN4JzogICAgICAgIGJ0Y3gsXG4gICAgJ2J4aW50aCc6ICAgICAgYnhpbnRoLFxuICAgICdjY2V4JzogICAgICAgIGNjZXgsXG4gICAgJ2NleCc6ICAgICAgICAgY2V4LFxuICAgICdjb2luY2hlY2snOiAgIGNvaW5jaGVjayxcbiAgICAnY29pbm1hdGUnOiAgICBjb2lubWF0ZSxcbiAgICAnY29pbnNlY3VyZSc6ICBjb2luc2VjdXJlLFxuICAgICdleG1vJzogICAgICAgIGV4bW8sXG4gICAgJ2Z5YnNlJzogICAgICAgZnlic2UsXG4gICAgJ2Z5YnNnJzogICAgICAgZnlic2csXG4gICAgJ2dkYXgnOiAgICAgICAgZ2RheCxcbiAgICAnaGl0YnRjJzogICAgICBoaXRidGMsXG4gICAgJ2h1b2JpJzogICAgICAgaHVvYmksXG4gICAgJ2p1YmknOiAgICAgICAganViaSxcbiAgICAna3Jha2VuJzogICAgICBrcmFrZW4sXG4gICAgJ2x1bm8nOiAgICAgICAgbHVubyxcbiAgICAnb2tjb2luY255JzogICBva2NvaW5jbnksXG4gICAgJ29rY29pbnVzZCc6ICAgb2tjb2ludXNkLFxuICAgICdwYXltaXVtJzogICAgIHBheW1pdW0sXG4gICAgJ3BvbG9uaWV4JzogICAgcG9sb25pZXgsXG4gICAgJ3F1YWRyaWdhY3gnOiAgcXVhZHJpZ2FjeCxcbiAgICAncXVvaW5lJzogICAgICBxdW9pbmUsXG4gICAgJ3RoZXJvY2snOiAgICAgdGhlcm9jayxcbiAgICAndmF1bHRvcm8nOiAgICB2YXVsdG9ybyxcbiAgICAndmlyd294JzogICAgICB2aXJ3b3gsXG4gICAgJ3lvYml0JzogICAgICAgeW9iaXQsXG4gICAgJ3phaWYnOiAgICAgICAgemFpZixcbn1cblxubGV0IGRlZmluZUFsbE1hcmtldHMgPSBmdW5jdGlvbiAobWFya2V0cykge1xuICAgIGxldCByZXN1bHQgPSB7fVxuICAgIGZvciAobGV0IGlkIGluIG1hcmtldHMpXG4gICAgICAgIHJlc3VsdFtpZF0gPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hcmtldCAoZXh0ZW5kIChtYXJrZXRzW2lkXSwgcGFyYW1zKSlcbiAgICAgICAgfVxuICAgIHJldHVybiByZXN1bHRcbn1cblxuaWYgKGlzTm9kZSlcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluZUFsbE1hcmtldHMgKG1hcmtldHMpXG5lbHNlXG4gICAgd2luZG93LmNjeHQgPSBkZWZpbmVBbGxNYXJrZXRzIChtYXJrZXRzKVxuXG59KSAoKSJdfQ==