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
                _this46 = this;

            return Promise.resolve().then(function () {
                return _this46.publicGetSymbols();
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
            return this.publicGetBookSymbol({
                'symbol': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var p,
                ticker,
                timestamp,
                baseVolume,
                quoteVolume,
                _this47 = this;

            return Promise.resolve().then(function () {
                p = _this47.product(product);
                return _this47.publicGetPubtickerSymbol({
                    'symbol': p['id']
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['volume']['timestamp'];
                baseVolume = p['base'];
                quoteVolume = p['quote'];

                return {
                    'timestamp': timestamp,
                    'datetime': _this47.iso8601(timestamp),
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
                _this48 = this;

            return Promise.resolve().then(function () {
                return _this48.publicGetSymbols();
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
                _this49 = this;

            return Promise.resolve().then(function () {
                return _this49.publicGetSymbolTicker({
                    'symbol': _this49.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['timestamp'];

                return {
                    'timestamp': timestamp,
                    'datetime': _this49.iso8601(timestamp),
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
                _this50 = this;

            return Promise.resolve().then(function () {
                p = _this50.product(product);
                method = p['type'] + 'GetTickerId';
                return _this50[method]({ 'id': p['id'] });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['ticker'];
                timestamp = parseInt(response['time']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this50.iso8601(timestamp),
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
            return this.publicGetMarketsSymbolOrderBook({
                'symbol': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this51 = this;

            return Promise.resolve().then(function () {
                return _this51.publicGetMarketsSymbolTicker({
                    'symbol': _this51.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this51.parse8601(ticker['serverTimeUTC']);

                return {
                    'timestamp': timestamp,
                    'datetime': _this51.iso8601(timestamp),
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
            return this.publicGetDepth({
                'coin': this.productId(product)
            });
        },
        fetchTicker: function fetchTicker(product) {
            var ticker,
                timestamp,
                _this52 = this;

            return Promise.resolve().then(function () {
                return _this52.publicGetTicker({
                    'coin': _this52.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this52.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this52.iso8601(timestamp),
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
                _this53 = this;

            return Promise.resolve().then(function () {
                return _this53.publicGetAssetPairs();
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
                    }base = _this53.commonCurrencyCode(base);
                    quote = _this53.commonCurrencyCode(quote);
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
                _this54 = this;

            return Promise.resolve().then(function () {
                p = _this54.product(product);
                return _this54.publicGetTicker({
                    'pair': p['id']
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['result'][p['id']];
                timestamp = _this54.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this54.iso8601(timestamp),
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
                _this55 = this;

            return Promise.resolve().then(function () {
                return _this55.publicGetTickers();
            }).then(function (_resp) {
                products = _resp;
                result = [];

                for (p = 0; p < products['tickers'].length; p++) {
                    product = products['tickers'][p];
                    id = product['pair'];
                    base = id.slice(0, 3);
                    quote = id.slice(3, 6);

                    base = _this55.commonCurrencyCode(base);
                    quote = _this55.commonCurrencyCode(quote);
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
                _this56 = this;

            return Promise.resolve().then(function () {
                return _this56.publicGetTicker({
                    'pair': _this56.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['timestamp'];

                return {
                    'timestamp': timestamp,
                    'datetime': _this56.iso8601(timestamp),
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
                _this57 = this;

            return Promise.resolve().then(function () {
                return _this57.publicGetTicker({
                    'symbol': _this57.productId(product)
                });
            }).then(function (_resp) {
                response = _resp;
                ticker = response['ticker'];
                timestamp = parseInt(response['date']) * 1000;

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
                _this58 = this;

            return Promise.resolve().then(function () {
                return _this58.publicGetDataIdTicker({
                    'id': _this58.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = ticker['at'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this58.iso8601(timestamp),
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
                _this59 = this;

            return Promise.resolve().then(function () {
                return _this59.publicGetReturnTicker();
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
                _this60 = this;

            return Promise.resolve().then(function () {
                p = _this60.product(product);
                return _this60.publicGetReturnTicker();
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers[p['id']];
                timestamp = _this60.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this60.iso8601(timestamp),
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
                _this61 = this;

            return Promise.resolve().then(function () {
                return _this61.publicGetTicker({
                    'book': _this61.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = parseInt(ticker['timestamp']) * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this61.iso8601(timestamp),
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
                _this62 = this;

            return Promise.resolve().then(function () {
                return _this62.publicGetProducts();
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
                _this63 = this;

            return Promise.resolve().then(function () {
                return _this63.publicGetProductsId({
                    'id': _this63.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this63.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this63.iso8601(timestamp),
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
                _this64 = this;

            return Promise.resolve().then(function () {
                return _this64.publicGetFundsTickers();
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
                _this65 = this;

            return Promise.resolve().then(function () {
                return _this65.publicGetFundsIdTicker({
                    'id': _this65.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this65.parse8601(ticker['date']);

                return {
                    'timestamp': timestamp,
                    'datetime': _this65.iso8601(timestamp),
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
                _this66 = this;

            return Promise.resolve().then(function () {
                result = [];
                return _this66.publicGetMarkets();
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
                _this67 = this;

            return Promise.resolve().then(function () {
                return _this67.publicGetBidandask();
            }).then(function (_resp) {
                quote = _resp;
                bidsLength = quote['bids'].length;
                bid = quote['bids'][bidsLength - 1];
                ask = quote['asks'][0];
                return _this67.publicGetMarkets();
            }).then(function (_resp) {
                response = _resp;
                ticker = response['data'];
                timestamp = _this67.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this67.iso8601(timestamp),
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
                _this68 = this;

            return Promise.resolve().then(function () {
                return _this68.publicGetInstruments();
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
                _this69 = this;

            return Promise.resolve().then(function () {
                end = _this69.milliseconds();
                start = end - 86400000;
                return _this69.publicGetTradedPriceVolume({
                    'instrument': _this69.symbol(product),
                    'endDate': _this69.yyyymmddhhmmss(end),
                    'startDate': _this69.yyyymmddhhmmss(start),
                    'HLOC': 1
                });
            }).then(function (_resp) {
                response = _resp;
                tickers = response['result']['priceVolumeList'];
                keys = Object.keys(tickers);
                length = keys.length;
                lastKey = keys[length - 1];
                ticker = tickers[lastKey];
                timestamp = _this69.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this69.iso8601(timestamp),
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
                _this70 = this;

            return Promise.resolve().then(function () {
                return _this70.apiGetInfo();
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
                _this71 = this;

            return Promise.resolve().then(function () {
                p = _this71.product(product);
                return _this71.apiGetTickerPairs({
                    'pairs': p['id']
                });
            }).then(function (_resp) {
                tickers = _resp;
                ticker = tickers[p['id']];
                timestamp = ticker['updated'] * 1000;

                return {
                    'timestamp': timestamp,
                    'datetime': _this71.iso8601(timestamp),
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
                _this72 = this;

            return Promise.resolve().then(function () {
                return _this72.apiGetCurrencyPairsAll();
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
                _this73 = this;

            return Promise.resolve().then(function () {
                return _this73.apiGetTickerPair({
                    'pair': _this73.productId(product)
                });
            }).then(function (_resp) {
                ticker = _resp;
                timestamp = _this73.milliseconds();

                return {
                    'timestamp': timestamp,
                    'datetime': _this73.iso8601(timestamp),
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
        'gemini': gemini,
        'hitbtc': hitbtc,
        'huobi': huobi,
        'itbit': itbit,
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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S0FBL0QsRUFmSjtBQWdCUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQWhCSjtBQWlCUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQWpCSjtBQWtCUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQWxCSjtBQW1CUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQW5CSjtBQW9CUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQXBCSjtBQXFCUix3QkFBWSxFQUFFLE1BQU0sTUFBUixFQUFnQixVQUFVLFVBQTFCLEVBQXNDLFFBQVEsTUFBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQXJCSjtBQXNCUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQXRCSjtBQXVCUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQXZCSjtBQXdCUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQXhCSjtBQXlCUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQXpCSjtBQTBCUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQTFCSjtBQTJCUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQTNCSjtBQTRCUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQTVCSjtBQTZCUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQTdCSjtBQThCUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQTlCSjtBQStCUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQS9CSjtBQWdDUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQWhDSjtBQWlDUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQWpDSjtBQWtDUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQWxDSjtBQW1DUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQW5DSjtBQW9DUix1QkFBWSxFQUFFLE1BQU0sS0FBUixFQUFnQixVQUFVLFNBQTFCLEVBQXNDLFFBQVEsS0FBOUMsRUFBc0QsU0FBUyxLQUEvRCxFQXBDSjtBQXFDUix1QkFBWSxFQUFFLE1BQU0sS0FB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SUEzQkw7QUE0QlYsa0JBQWUsTUE1Qkw7QUE2QlYsa0JBQWUsTUE3Qkw7QUE4QlYsaUJBQWUsS0E5Qkw7QUErQlYsaUJBQWUsS0EvQkw7QUFnQ1YsZ0JBQWUsSUFoQ0w7QUFpQ1Ysa0JBQWUsTUFqQ0w7QUFrQ1YsZ0JBQWUsSUFsQ0w7QUFtQ1YscUJBQWUsU0FuQ0w7QUFvQ1YscUJBQWUsU0FwQ0w7QUFxQ1YsbUJBQWUsT0FyQ0w7QUFzQ1Ysb0JBQWUsUUF0Q0w7QUF1Q1Ysc0JBQWUsVUF2Q0w7QUF3Q1Ysa0JBQWUsTUF4Q0w7QUF5Q1YsbUJBQWUsT0F6Q0w7QUEwQ1Ysb0JBQWUsUUExQ0w7QUEyQ1Ysa0JBQWUsTUEzQ0w7QUE0Q1YsaUJBQWUsS0E1Q0w7QUE2Q1YsZ0JBQWU7QUE3Q0wsS0FBZDs7QUFnREEsUUFBSSxtQkFBbUIsU0FBbkIsZ0JBQW1CLENBQVUsT0FBVixFQUFtQjtBQUN0QyxZQUFJLFNBQVMsRUFBYjs7QUFEc0MscUNBRTdCLEVBRjZCO0FBR2xDLG1CQUFPLEVBQVAsSUFBYSxVQUFVLE1BQVYsRUFBa0I7QUFDM0IsdUJBQU8sSUFBSSxNQUFKLENBQVksT0FBUSxRQUFRLEVBQVIsQ0FBUixFQUFxQixNQUFyQixDQUFaLENBQVA7QUFDSCxhQUZEO0FBSGtDOztBQUV0QyxhQUFLLElBQUksRUFBVCxJQUFlLE9BQWY7QUFBQSxtQkFBUyxFQUFUO0FBQUEsU0FJQSxPQUFPLE1BQVA7QUFDSCxLQVBEOztBQVNBLFFBQUksTUFBSixFQUNJLE9BQU8sT0FBUCxHQUFpQixpQkFBa0IsT0FBbEIsQ0FBakIsQ0FESixLQUdJLE9BQU8sSUFBUCxHQUFjLGlCQUFrQixPQUFsQixDQUFkO0FBRUgsQ0Fqc05EIiwiZmlsZSI6ImNjeHQuZXM1LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbihmdW5jdGlvbiAoKSB7XG5cbnZhciBpc05vZGUgPSAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGNhcGl0YWxpemUgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5sZW5ndGggPyAoc3RyaW5nLmNoYXJBdCAoMCkudG9VcHBlckNhc2UgKCkgKyBzdHJpbmcuc2xpY2UgKDEpKSA6IHN0cmluZ1xufVxuXG52YXIga2V5c29ydCA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fVxuICAgIE9iamVjdC5rZXlzIChvYmplY3QpLnNvcnQgKCkuZm9yRWFjaCAoa2V5ID0+IHJlc3VsdFtrZXldID0gb2JqZWN0W2tleV0pXG4gICAgcmV0dXJuIHJlc3VsdFxufVxuXG52YXIgZXh0ZW5kID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXG4gICAgICAgIGlmICh0eXBlb2YgYXJndW1lbnRzW2ldID09PSAnb2JqZWN0JylcbiAgICAgICAgICAgIE9iamVjdC5rZXlzIChhcmd1bWVudHNbaV0pLmZvckVhY2ggKGtleSA9PlxuICAgICAgICAgICAgICAgIChyZXN1bHRba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldKSlcbiAgICByZXR1cm4gcmVzdWx0XG59XG5cbnZhciBvbWl0ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciByZXN1bHQgPSBleHRlbmQgKG9iamVjdClcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcbiAgICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbaV0gPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgZGVsZXRlIHJlc3VsdFthcmd1bWVudHNbaV1dXG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkgKGFyZ3VtZW50c1tpXSkpXG4gICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGFyZ3VtZW50c1tpXS5sZW5ndGg7IGsrKylcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVzdWx0W2FyZ3VtZW50c1tpXVtrXV1cbiAgICByZXR1cm4gcmVzdWx0XG59XG5cbnZhciBpbmRleEJ5ID0gZnVuY3Rpb24gKGFycmF5LCBrZXkpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspXG4gICAgICAgIHJlc3VsdFthcnJheVtpXVtrZXldXSA9IGFycmF5W2ldXG4gICAgcmV0dXJuIHJlc3VsdFxufVxuXG52YXIgZmxhdCA9IGZ1bmN0aW9uIChhcnJheSkge1xuICAgIHJldHVybiBhcnJheS5yZWR1Y2UgKChhY2MsIGN1cikgPT4gYWNjLmNvbmNhdCAoY3VyKSwgW10pXG59XG5cbnZhciB1cmxlbmNvZGUgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzIChvYmplY3QpLm1hcCAoa2V5ID0+IFxuICAgICAgICBlbmNvZGVVUklDb21wb25lbnQgKGtleSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQgKG9iamVjdFtrZXldKSkuam9pbiAoJyYnKVxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmlmIChpc05vZGUpIHtcblxuICAgIGNvbnN0IGNyeXB0byA9IHJlcXVpcmUgKCdjcnlwdG8nKVxuICAgIHZhciAgIGZldGNoICA9IHJlcXVpcmUgKCdub2RlLWZldGNoJylcblxuICAgIHZhciBzdHJpbmdUb0JpbmFyeSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tIChzdHJpbmcsICdiaW5hcnknKVxuICAgIH1cblxuICAgIHZhciBzdHJpbmdUb0Jhc2U2NCA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCdWZmZXIgKHN0cmluZykudG9TdHJpbmcgKCdiYXNlNjQnKVxuICAgIH1cblxuICAgIHZhciB1dGYxNlRvQmFzZTY0ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyaW5nVG9CYXNlNjQgKHN0cmluZylcbiAgICB9XG5cbiAgICB2YXIgYmFzZTY0VG9CaW5hcnkgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBCdWZmZXIuZnJvbSAoc3RyaW5nLCAnYmFzZTY0JylcbiAgICB9XG5cbiAgICB2YXIgYmFzZTY0VG9TdHJpbmcgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBCdWZmZXIuZnJvbSAoc3RyaW5nLCAnYmFzZTY0JykudG9TdHJpbmcgKClcbiAgICB9XG5cbiAgICB2YXIgaGFzaCA9IGZ1bmN0aW9uIChyZXF1ZXN0LCBoYXNoID0gJ21kNScsIGRpZ2VzdCA9ICdoZXgnKSB7XG4gICAgICAgIHJldHVybiBjcnlwdG8uY3JlYXRlSGFzaCAoaGFzaCkudXBkYXRlIChyZXF1ZXN0KS5kaWdlc3QgKGRpZ2VzdClcbiAgICB9XG5cbiAgICB2YXIgaG1hYyA9IGZ1bmN0aW9uIChyZXF1ZXN0LCBzZWNyZXQsIGhhc2ggPSAnc2hhMjU2JywgZGlnZXN0ID0gJ2hleCcpIHtcbiAgICAgICAgcmV0dXJuIGNyeXB0by5jcmVhdGVIbWFjIChoYXNoLCBzZWNyZXQpLnVwZGF0ZSAocmVxdWVzdCkuZGlnZXN0IChkaWdlc3QpXG4gICAgfVxuXG59IGVsc2Uge1xuXG4gICAgdmFyIGZldGNoID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucywgdmVyYm9zZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlICgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgIGlmICh2ZXJib3NlKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nICh1cmwsIG9wdGlvbnMpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QgKClcbiAgICAgICAgICAgIHZhciBtZXRob2QgPSBvcHRpb25zLm1ldGhvZCB8fCAnR0VUJ1xuXG4gICAgICAgICAgICB4aHIub3BlbiAobWV0aG9kLCB1cmwsIHRydWUpICAgICAgICAgICAgXG4gICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4geyBcbiAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PSAyMDApXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlICh4aHIucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIChtZXRob2QsIHVybCwgeGhyLnN0YXR1cywgeGhyLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5oZWFkZXJzICE9ICd1bmRlZmluZWQnKVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGhlYWRlciBpbiBvcHRpb25zLmhlYWRlcnMpXG4gICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyIChoZWFkZXIsIG9wdGlvbnMuaGVhZGVyc1toZWFkZXJdKVxuXG4gICAgICAgICAgICB4aHIuc2VuZCAob3B0aW9ucy5ib2R5KVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHZhciBzdHJpbmdUb0JpbmFyeSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIENyeXB0b0pTLmVuYy5MYXRpbjEucGFyc2UgKHN0cmluZylcbiAgICB9XG5cbiAgICB2YXIgc3RyaW5nVG9CYXNlNjQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBDcnlwdG9KUy5lbmMuTGF0aW4xLnBhcnNlIChzdHJpbmcpLnRvU3RyaW5nIChDcnlwdG9KUy5lbmMuQmFzZTY0KVxuICAgIH1cblxuICAgIHZhciB1dGYxNlRvQmFzZTY0ICA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIENyeXB0b0pTLmVuYy5VdGYxNi5wYXJzZSAoc3RyaW5nKS50b1N0cmluZyAoQ3J5cHRvSlMuZW5jLkJhc2U2NClcbiAgICB9XG5cbiAgICB2YXIgYmFzZTY0VG9CaW5hcnkgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBDcnlwdG9KUy5lbmMuQmFzZTY0LnBhcnNlIChzdHJpbmcpXG4gICAgfVxuXG4gICAgdmFyIGJhc2U2NFRvU3RyaW5nID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gQ3J5cHRvSlMuZW5jLkJhc2U2NC5wYXJzZSAoc3RyaW5nKS50b1N0cmluZyAoQ3J5cHRvSlMuZW5jLlV0ZjgpXG4gICAgfVxuXG4gICAgdmFyIGhhc2ggPSBmdW5jdGlvbiAocmVxdWVzdCwgaGFzaCA9ICdtZDUnLCBkaWdlc3QgPSAnaGV4Jykge1xuICAgICAgICB2YXIgZW5jb2RpbmcgPSAoZGlnZXN0ID09PSAnYmluYXJ5JykgPyAnTGF0aW4xJyA6IGNhcGl0YWxpemUgKGRpZ2VzdClcbiAgICAgICAgcmV0dXJuIENyeXB0b0pTW2hhc2gudG9VcHBlckNhc2UgKCldIChyZXF1ZXN0KS50b1N0cmluZyAoQ3J5cHRvSlMuZW5jW2VuY29kaW5nXSlcbiAgICB9XG5cbiAgICB2YXIgaG1hYyA9IGZ1bmN0aW9uIChyZXF1ZXN0LCBzZWNyZXQsIGhhc2ggPSAnc2hhMjU2JywgZGlnZXN0ID0gJ2hleCcpIHtcbiAgICAgICAgdmFyIGVuY29kaW5nID0gKGRpZ2VzdCA9PT0gJ2JpbmFyeScpID8gJ0xhdGluMScgOiBjYXBpdGFsaXplIChkaWdlc3QpXG4gICAgICAgIHJldHVybiBDcnlwdG9KU1snSG1hYycgKyBoYXNoLnRvVXBwZXJDYXNlICgpXSAocmVxdWVzdCwgc2VjcmV0KS50b1N0cmluZyAoQ3J5cHRvSlMuZW5jW2NhcGl0YWxpemUgKGVuY29kaW5nKV0pXG4gICAgfVxufVxuXG52YXIgdXJsZW5jb2RlQmFzZTY0ID0gZnVuY3Rpb24gKGJhc2U2NHN0cmluZykge1xuICAgIHJldHVybiBiYXNlNjRzdHJpbmcucmVwbGFjZSAoL1s9XSskLywgJycpLnJlcGxhY2UgKC9cXCsvZywgJy0nKS5yZXBsYWNlICgvXFwvL2csICdfJykgXG59XG5cbnZhciBqd3QgPSBmdW5jdGlvbiAocmVxdWVzdCwgc2VjcmV0LCBhbGcgPSAnSFMyNTYnLCBoYXNoID0gJ3NoYTI1NicpIHtcbiAgICB2YXIgZW5jb2RlZEhlYWRlciA9IHVybGVuY29kZUJhc2U2NCAoc3RyaW5nVG9CYXNlNjQgKEpTT04uc3RyaW5naWZ5ICh7ICdhbGcnOiBhbGcsICd0eXAnOiAnSldUJyB9KSkpXG4gICAgdmFyIGVuY29kZWREYXRhID0gdXJsZW5jb2RlQmFzZTY0IChzdHJpbmdUb0Jhc2U2NCAoSlNPTi5zdHJpbmdpZnkgKHJlcXVlc3QpKSlcbiAgICB2YXIgdG9rZW4gPSBbIGVuY29kZWRIZWFkZXIsIGVuY29kZWREYXRhIF0uam9pbiAoJy4nKVxuICAgIHZhciBzaWduYXR1cmUgPSB1cmxlbmNvZGVCYXNlNjQgKHV0ZjE2VG9CYXNlNjQgKGhtYWMgKHRva2VuLCBzZWNyZXQsIGhhc2gsICd1dGYxNicpKSlcbiAgICByZXR1cm4gWyB0b2tlbiwgc2lnbmF0dXJlIF0uam9pbiAoJy4nKVxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBNYXJrZXQgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICB0aGlzLmhhc2ggPSBoYXNoXG4gICAgdGhpcy5obWFjID0gaG1hY1xuICAgIHRoaXMuand0ID0gand0XG4gICAgdGhpcy5zdHJpbmdUb0JpbmFyeSA9IHN0cmluZ1RvQmluYXJ5XG4gICAgdGhpcy5zdHJpbmdUb0Jhc2U2NCA9IHN0cmluZ1RvQmFzZTY0XG4gICAgdGhpcy5iYXNlNjRUb0JpbmFyeSA9IGJhc2U2NFRvQmluYXJ5XG4gICAgdGhpcy51cmxlbmNvZGUgPSB1cmxlbmNvZGVcbiAgICB0aGlzLm9taXQgPSBvbWl0XG4gICAgdGhpcy5leHRlbmQgPSBleHRlbmRcbiAgICB0aGlzLmZsYXR0ZW4gPSBmbGF0XG4gICAgdGhpcy5pbmRleEJ5ID0gaW5kZXhCeVxuICAgIHRoaXMua2V5c29ydCA9IGtleXNvcnRcbiAgICB0aGlzLmNhcGl0YWxpemUgPSBjYXBpdGFsaXplXG5cbiAgICB0aGlzLmluaXQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGlzTm9kZSlcbiAgICAgICAgICAgIHRoaXMubm9kZVZlcnNpb24gPSBwcm9jZXNzLnZlcnNpb24ubWF0Y2ggKC9cXGQrXFwuXFxkKy5cXGQrLykgWzBdXG5cbiAgICAgICAgaWYgKHRoaXMuYXBpKVxuICAgICAgICAgICAgT2JqZWN0LmtleXMgKHRoaXMuYXBpKS5mb3JFYWNoICh0eXBlID0+IHtcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyAodGhpcy5hcGlbdHlwZV0pLmZvckVhY2ggKG1ldGhvZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1cmxzID0gdGhpcy5hcGlbdHlwZV1bbWV0aG9kXVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHVybHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1cmwgPSB1cmxzW2ldLnRyaW0gKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzcGxpdFBhdGggPSB1cmwuc3BsaXQgKC9bXmEtekEtWjAtOV0vKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXBwZXJjYXNlTWV0aG9kICA9IG1ldGhvZC50b1VwcGVyQ2FzZSAoKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvd2VyY2FzZU1ldGhvZCAgPSBtZXRob2QudG9Mb3dlckNhc2UgKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYW1lbGNhc2VNZXRob2QgID0gY2FwaXRhbGl6ZSAobG93ZXJjYXNlTWV0aG9kKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhbWVsY2FzZVN1ZmZpeCAgPSBzcGxpdFBhdGgubWFwIChjYXBpdGFsaXplKS5qb2luICgnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1bmRlcnNjb3JlU3VmZml4ID0gc3BsaXRQYXRoLm1hcCAoeCA9PiB4LnRyaW0gKCkudG9Mb3dlckNhc2UgKCkpLmZpbHRlciAoeCA9PiB4Lmxlbmd0aCA+IDApLmpvaW4gKCdfJylcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbWVsY2FzZVN1ZmZpeC5pbmRleE9mIChjYW1lbGNhc2VNZXRob2QpID09PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbWVsY2FzZVN1ZmZpeCA9IGNhbWVsY2FzZVN1ZmZpeC5zbGljZSAoY2FtZWxjYXNlTWV0aG9kLmxlbmd0aClcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVuZGVyc2NvcmVTdWZmaXguaW5kZXhPZiAobG93ZXJjYXNlTWV0aG9kKSA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmRlcnNjb3JlU3VmZml4ID0gdW5kZXJzY29yZVN1ZmZpeC5zbGljZSAobG93ZXJjYXNlTWV0aG9kLmxlbmd0aClcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhbWVsY2FzZSAgPSB0eXBlICsgY2FtZWxjYXNlTWV0aG9kICsgY2FwaXRhbGl6ZSAoY2FtZWxjYXNlU3VmZml4KVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVuZGVyc2NvcmUgPSB0eXBlICsgJ18nICsgbG93ZXJjYXNlTWV0aG9kICsgJ18nICsgdW5kZXJzY29yZVN1ZmZpeFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZiA9IChwYXJhbXMgPT4gdGhpcy5yZXF1ZXN0ICh1cmwsIHR5cGUsIHVwcGVyY2FzZU1ldGhvZCwgcGFyYW1zKSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1tjYW1lbGNhc2VdICA9IGZcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbdW5kZXJzY29yZV0gPSBmXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyB0aGlzLmZldGNoID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuXG4gICAgLy8gICAgIGlmIChpc05vZGUpXG4gICAgLy8gICAgICAgICBvcHRpb25zLmhlYWRlcnMgPSBleHRlbmQgKHtcbiAgICAvLyAgICAgICAgICAgICAnVXNlci1BZ2VudCc6ICdjY3h0LzAuMS4wICgraHR0cHM6Ly9naXRodWIuY29tL2tyb2l0b3IvY2N4dCkgTm9kZS5qcy8nICsgdGhpcy5ub2RlVmVyc2lvbiArICcgKEphdmFTY3JpcHQpJ1xuICAgIC8vICAgICAgICAgfSwgb3B0aW9ucy5oZWFkZXJzKVxuXG4gICAgLy8gICAgIGlmICh0aGlzLnZlcmJvc2UpXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZyAodGhpcy5pZCwgdXJsLCBvcHRpb25zKVxuXG4gICAgLy8gICAgIHJldHVybiAoZmV0Y2ggKCh0aGlzLmNvcnMgPyB0aGlzLmNvcnMgOiAnJykgKyB1cmwsIG9wdGlvbnMpXG4gICAgLy8gICAgICAgICAudGhlbiAocmVzcG9uc2UgPT4gKHR5cGVvZiByZXNwb25zZSA9PT0gJ3N0cmluZycpID8gcmVzcG9uc2UgOiByZXNwb25zZS50ZXh0ICgpKVxuICAgIC8vICAgICAgICAgLnRoZW4gKHJlc3BvbnNlID0+IHtcbiAgICAvLyAgICAgICAgICAgICB0cnkge1xuICAgIC8vICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSAocmVzcG9uc2UpXG4gICAgLy8gICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgIC8vICAgICAgICAgICAgICAgICB2YXIgY2xvdWRmbGFyZVByb3RlY3Rpb24gPSByZXNwb25zZS5tYXRjaCAoL2Nsb3VkZmxhcmUvaSkgPyAnRERvUyBwcm90ZWN0aW9uIGJ5IENsb3VkZmxhcmUnIDogJydcbiAgICAvLyAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmVyYm9zZSlcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nICh0aGlzLmlkLCByZXNwb25zZSwgY2xvdWRmbGFyZVByb3RlY3Rpb24sIGUpXG4gICAgLy8gICAgICAgICAgICAgICAgIHRocm93IGVcbiAgICAvLyAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICB9KSlcbiAgICAvLyB9XG5cbiAgICB0aGlzLmZldGNoID0gZnVuY3Rpb24gKHVybCwgbWV0aG9kID0gJ0dFVCcsIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcblxuICAgICAgICBpZiAoaXNOb2RlKVxuICAgICAgICAgICAgaGVhZGVycyA9IGV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdVc2VyLUFnZW50JzogJ2NjeHQvMC4xLjAgKCtodHRwczovL2dpdGh1Yi5jb20va3JvaXRvci9jY3h0KSBOb2RlLmpzLycgKyB0aGlzLm5vZGVWZXJzaW9uICsgJyAoSmF2YVNjcmlwdCknXG4gICAgICAgICAgICB9LCBoZWFkZXJzKVxuXG4gICAgICAgIGxldCBvcHRpb25zID0geyAnbWV0aG9kJzogbWV0aG9kLCAnaGVhZGVycyc6IGhlYWRlcnMsICdib2R5JzogYm9keSB9XG5cbiAgICAgICAgaWYgKHRoaXMudmVyYm9zZSlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nICh0aGlzLmlkLCB1cmwsIG9wdGlvbnMpXG5cbiAgICAgICAgcmV0dXJuIChmZXRjaCAoKHRoaXMuY29ycyA/IHRoaXMuY29ycyA6ICcnKSArIHVybCwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuIChyZXNwb25zZSA9PiAodHlwZW9mIHJlc3BvbnNlID09PSAnc3RyaW5nJykgPyByZXNwb25zZSA6IHJlc3BvbnNlLnRleHQgKCkpXG4gICAgICAgICAgICAudGhlbiAocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlIChyZXNwb25zZSlcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjbG91ZGZsYXJlUHJvdGVjdGlvbiA9IHJlc3BvbnNlLm1hdGNoICgvY2xvdWRmbGFyZS9pKSA/ICdERG9TIHByb3RlY3Rpb24gYnkgQ2xvdWRmbGFyZScgOiAnJ1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52ZXJib3NlKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgKHRoaXMuaWQsIHJlc3BvbnNlLCBjbG91ZGZsYXJlUHJvdGVjdGlvbiwgZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKVxuICAgIH1cblxuICAgIHRoaXMubG9hZF9wcm9kdWN0cyA9IFxuICAgIHRoaXMubG9hZFByb2R1Y3RzID0gZnVuY3Rpb24gKHJlbG9hZCA9IGZhbHNlKSB7XG4gICAgICAgIGlmICghcmVsb2FkICYmIHRoaXMucHJvZHVjdHMpXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UgKChyZXNvbHZlLCByZWplY3QpID0+IHJlc29sdmUgKHRoaXMucHJvZHVjdHMpKVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaFByb2R1Y3RzICgpLnRoZW4gKHByb2R1Y3RzID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2R1Y3RzID0gaW5kZXhCeSAocHJvZHVjdHMsICdzeW1ib2wnKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuZmV0Y2hfcHJvZHVjdHMgPSBcbiAgICB0aGlzLmZldGNoUHJvZHVjdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSAoKHJlc29sdmUsIHJlamVjdCkgPT4gcmVzb2x2ZSAodGhpcy5wcm9kdWN0cykpXG4gICAgfVxuXG4gICAgdGhpcy5jb21tb25DdXJyZW5jeUNvZGUgPSBmdW5jdGlvbiAoY3VycmVuY3kpIHsgXG4gICAgICAgIHJldHVybiAoY3VycmVuY3kgPT09ICdYQlQnKSA/ICdCVEMnIDogY3VycmVuY3lcbiAgICB9XG5cbiAgICB0aGlzLnByb2R1Y3QgPSBmdW5jdGlvbiAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gKCgodHlwZW9mIHByb2R1Y3QgPT09ICdzdHJpbmcnKSAmJlxuICAgICAgICAgICAgKHR5cGVvZiB0aGlzLnByb2R1Y3RzICE9ICd1bmRlZmluZWQnKSAmJlxuICAgICAgICAgICAgKHR5cGVvZiB0aGlzLnByb2R1Y3RzW3Byb2R1Y3RdICE9ICd1bmRlZmluZWQnKSkgPyB0aGlzLnByb2R1Y3RzW3Byb2R1Y3RdIDogcHJvZHVjdCkgICAgICAgIFxuICAgIH1cblxuICAgIHRoaXMucHJvZHVjdF9pZCA9IFxuICAgIHRoaXMucHJvZHVjdElkICA9IGZ1bmN0aW9uIChwcm9kdWN0KSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5wcm9kdWN0IChwcm9kdWN0KS5pZCB8fCBwcm9kdWN0XG4gICAgfVxuXG4gICAgdGhpcy5zeW1ib2wgPSBmdW5jdGlvbiAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9kdWN0IChwcm9kdWN0KS5zeW1ib2wgfHwgcHJvZHVjdFxuICAgIH1cblxuICAgIHRoaXMuZXh0cmFjdF9wYXJhbXMgPSBcbiAgICB0aGlzLmV4dHJhY3RQYXJhbXMgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHZhciByZSA9IC97KFthLXpBLVowLTlfXSs/KX0vZ1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IFtdXG4gICAgICAgIGxldCBtYXRjaFxuICAgICAgICB3aGlsZSAobWF0Y2ggPSByZS5leGVjIChzdHJpbmcpKVxuICAgICAgICAgICAgbWF0Y2hlcy5wdXNoIChtYXRjaFsxXSlcbiAgICAgICAgcmV0dXJuIG1hdGNoZXNcbiAgICB9XG5cbiAgICB0aGlzLmltcGxvZGVfcGFyYW1zID0gXG4gICAgdGhpcy5pbXBsb2RlUGFyYW1zID0gZnVuY3Rpb24gKHN0cmluZywgcGFyYW1zKSB7XG4gICAgICAgIGZvciAodmFyIHByb3BlcnR5IGluIHBhcmFtcylcbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlICgneycgKyBwcm9wZXJ0eSArICd9JywgcGFyYW1zW3Byb3BlcnR5XSlcbiAgICAgICAgcmV0dXJuIHN0cmluZ1xuICAgIH1cblxuICAgIHRoaXMuYnV5ID0gZnVuY3Rpb24gKHByb2R1Y3QsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yZGVyIChwcm9kdWN0LCAnYnV5JywgYW1vdW50LCBwcmljZSwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuc2VsbCA9IGZ1bmN0aW9uIChwcm9kdWN0LCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcmRlciAocHJvZHVjdCwgJ3NlbGwnLCBhbW91bnQsIHByaWNlLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy50cmFkZSA9XG4gICAgdGhpcy5vcmRlciA9IGZ1bmN0aW9uIChwcm9kdWN0LCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgdHlwZSA9ICh0eXBlb2YgcHJpY2UgPT0gJ3VuZGVmaW5lZCcpID8gJ21hcmtldCcgOiAnbGltaXQnXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVfYnV5X29yZGVyID1cbiAgICB0aGlzLmNyZWF0ZUJ1eU9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIHR5cGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgJ2J1eScsICBhbW91bnQsIHByaWNlLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVfc2VsbF9vcmRlciA9XG4gICAgdGhpcy5jcmVhdGVTZWxsT3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgdHlwZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsICdzZWxsJywgYW1vdW50LCBwcmljZSwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlX2xpbWl0X2J1eV9vcmRlciA9XG4gICAgdGhpcy5jcmVhdGVMaW1pdEJ1eU9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIGFtb3VudCwgcHJpY2UsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUxpbWl0T3JkZXIgIChwcm9kdWN0LCAnYnV5JywgIGFtb3VudCwgcHJpY2UsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9saW1pdF9zZWxsX29yZGVyID0gXG4gICAgdGhpcy5jcmVhdGVMaW1pdFNlbGxPcmRlciA9IGZ1bmN0aW9uIChwcm9kdWN0LCBhbW91bnQsIHByaWNlLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVMaW1pdE9yZGVyIChwcm9kdWN0LCAnc2VsbCcsIGFtb3VudCwgcHJpY2UsIHBhcmFtcylcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZV9tYXJrZXRfYnV5X29yZGVyID1cbiAgICB0aGlzLmNyZWF0ZU1hcmtldEJ1eU9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIGFtb3VudCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTWFya2V0T3JkZXIgKHByb2R1Y3QsICdidXknLCAgYW1vdW50LCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVfbWFya2V0X3NlbGxfb3JkZXIgPVxuICAgIHRoaXMuY3JlYXRlTWFya2V0U2VsbE9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIGFtb3VudCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTWFya2V0T3JkZXIgKHByb2R1Y3QsICdzZWxsJywgYW1vdW50LCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVfbGltaXRfb3JkZXIgPSBcbiAgICB0aGlzLmNyZWF0ZUxpbWl0T3JkZXIgPSBmdW5jdGlvbiAocHJvZHVjdCwgc2lkZSwgYW1vdW50LCBwcmljZSwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlT3JkZXIgKHByb2R1Y3QsICdsaW1pdCcsICBzaWRlLCBhbW91bnQsIHByaWNlLCBwYXJhbXMpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVfbWFya2V0X29yZGVyID1cbiAgICB0aGlzLmNyZWF0ZU1hcmtldE9yZGVyID0gZnVuY3Rpb24gKHByb2R1Y3QsIHNpZGUsIGFtb3VudCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlT3JkZXIgKHByb2R1Y3QsICdtYXJrZXQnLCBzaWRlLCBhbW91bnQsIHVuZGVmaW5lZCwgcGFyYW1zKVxuICAgIH1cblxuICAgIHRoaXMuaXNvODYwMSAgICAgICAgPSB0aW1lc3RhbXAgPT4gbmV3IERhdGUgKHRpbWVzdGFtcCkudG9JU09TdHJpbmcgKClcbiAgICB0aGlzLnBhcnNlODYwMSAgICAgID0gRGF0ZS5wYXJzZSBcbiAgICB0aGlzLnNlY29uZHMgICAgICAgID0gKCkgPT4gTWF0aC5mbG9vciAodGhpcy5taWxsaXNlY29uZHMgKCkgLyAxMDAwKVxuICAgIHRoaXMubWljcm9zZWNvbmRzICAgPSAoKSA9PiBNYXRoLmZsb29yICh0aGlzLm1pbGxpc2Vjb25kcyAoKSAqIDEwMDApXG4gICAgdGhpcy5taWxsaXNlY29uZHMgICA9IERhdGUubm93XG4gICAgdGhpcy5ub25jZSAgICAgICAgICA9IHRoaXMuc2Vjb25kc1xuICAgIHRoaXMuaWQgICAgICAgICAgICAgPSB1bmRlZmluZWRcbiAgICB0aGlzLnJhdGVMaW1pdCAgICAgID0gMjAwMFxuICAgIHRoaXMudGltZW91dCAgICAgICAgPSB1bmRlZmluZWRcbiAgICB0aGlzLnl5eXltbWRkaGhtbXNzID0gdGltZXN0YW1wID0+IHtcbiAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSAodGltZXN0YW1wKVxuICAgICAgICBsZXQgeXl5eSA9IGRhdGUuZ2V0VVRDRnVsbFllYXIgKClcbiAgICAgICAgbGV0IE1NID0gZGF0ZS5nZXRVVENNb250aCAoKVxuICAgICAgICBsZXQgZGQgPSBkYXRlLmdldFVUQ0RheSAoKVxuICAgICAgICBsZXQgaGggPSBkYXRlLmdldFVUQ0hvdXJzICgpXG4gICAgICAgIGxldCBtbSA9IGRhdGUuZ2V0VVRDTWludXRlcyAoKVxuICAgICAgICBsZXQgc3MgPSBkYXRlLmdldFVUQ1NlY29uZHMgKClcbiAgICAgICAgTU0gPSBNTSA8IDEwID8gKCcwJyArIE1NKSA6IE1NXG4gICAgICAgIGRkID0gZGQgPCAxMCA/ICgnMCcgKyBkZCkgOiBkZFxuICAgICAgICBoaCA9IGhoIDwgMTAgPyAoJzAnICsgaGgpIDogaGhcbiAgICAgICAgbW0gPSBtbSA8IDEwID8gKCcwJyArIG1tKSA6IG1tXG4gICAgICAgIHNzID0gc3MgPCAxMCA/ICgnMCcgKyBzcykgOiBzc1xuICAgICAgICByZXR1cm4geXl5eSArICctJyArIE1NICsgJy0nICsgZGQgKyAnICcgKyBoaCArICc6JyArIG1tICsgJzonICsgc3NcbiAgICB9XG5cbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBjb25maWcpXG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gY29uZmlnW3Byb3BlcnR5XVxuXG4gICAgdGhpcy5mZXRjaF9iYWxhbmNlICAgID0gdGhpcy5mZXRjaEJhbGFuY2VcbiAgICB0aGlzLmZldGNoX29yZGVyX2Jvb2sgPSB0aGlzLmZldGNoT3JkZXJCb29rXG4gICAgdGhpcy5mZXRjaF90aWNrZXIgICAgID0gdGhpcy5mZXRjaFRpY2tlclxuICAgIHRoaXMuZmV0Y2hfdHJhZGVzICAgICA9IHRoaXMuZmV0Y2hUcmFkZXNcbiAgXG4gICAgdGhpcy52ZXJib3NlID0gdGhpcy5sb2cgfHwgdGhpcy5kZWJ1ZyB8fCAodGhpcy52ZXJib3NpdHkgPT0gMSkgfHwgdGhpcy52ZXJib3NlXG5cbiAgICB0aGlzLmluaXQgKClcbn1cblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG52YXIgXzFicm9rZXIgPSB7XG5cbiAgICAnaWQnOiAnXzFicm9rZXInLFxuICAgICduYW1lJzogJzFCcm9rZXInLFxuICAgICdjb3VudHJpZXMnOiAnVVMnLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YyJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjAyMS00MjBiZDlmYy01ZWNiLTExZTctOGVkNi01NmQwMDgxZWZlZDIuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovLzFicm9rZXIuY29tL2FwaScsICAgICAgICBcbiAgICAgICAgJ3d3dyc6ICdodHRwczovLzFicm9rZXIuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovLzFicm9rZXIuY29tLz9jPWVuL2NvbnRlbnQvYXBpLWRvY3VtZW50YXRpb24nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdtYXJrZXQvYmFycycsXG4gICAgICAgICAgICAgICAgJ21hcmtldC9jYXRlZ29yaWVzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0L2RldGFpbHMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXQvbGlzdCcsXG4gICAgICAgICAgICAgICAgJ21hcmtldC9xdW90ZXMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXQvdGlja3MnLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICdvcmRlci9jcmVhdGUnLFxuICAgICAgICAgICAgICAgICdvcmRlci9vcGVuJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vY2xvc2UnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9jbG9zZV9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9lZGl0JyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL29wZW4nLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9zaGFyZWQvZ2V0JyxcbiAgICAgICAgICAgICAgICAnc29jaWFsL3Byb2ZpbGVfc3RhdGlzdGljcycsXG4gICAgICAgICAgICAgICAgJ3NvY2lhbC9wcm9maWxlX3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvYml0Y29pbl9kZXBvc2l0X2FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICd1c2VyL2RldGFpbHMnLFxuICAgICAgICAgICAgICAgICd1c2VyL292ZXJ2aWV3JyxcbiAgICAgICAgICAgICAgICAndXNlci9xdW90YV9zdGF0dXMnLFxuICAgICAgICAgICAgICAgICd1c2VyL3RyYW5zYWN0aW9uX2xvZycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaENhdGVnb3JpZXMgKCkge1xuICAgICAgICBsZXQgY2F0ZWdvcmllcyA9IGF3YWl0IHRoaXMucHJpdmF0ZUdldE1hcmtldENhdGVnb3JpZXMgKCk7XG4gICAgICAgIHJldHVybiBjYXRlZ29yaWVzWydyZXNwb25zZSddO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IGNhdGVnb3JpZXMgPSBhd2FpdCB0aGlzLmZldGNoQ2F0ZWdvcmllcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IGNhdGVnb3JpZXMubGVuZ3RoOyBjKyspIHtcbiAgICAgICAgICAgIGxldCBjYXRlZ29yeSA9IGNhdGVnb3JpZXNbY107XG4gICAgICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnByaXZhdGVHZXRNYXJrZXRMaXN0ICh7IFxuICAgICAgICAgICAgICAgICdjYXRlZ29yeSc6IGNhdGVnb3J5LnRvTG93ZXJDYXNlICgpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzWydyZXNwb25zZSddLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sncmVzcG9uc2UnXVtwXTtcbiAgICAgICAgICAgICAgICBpZiAoKGNhdGVnb3J5ID09ICdGT1JFWCcpIHx8IChjYXRlZ29yeSA9PSAnQ1JZUFRPJykpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnc3ltYm9sJ107XG4gICAgICAgICAgICAgICAgICAgIGxldCBzeW1ib2wgPSBwcm9kdWN0WyduYW1lJ107XG4gICAgICAgICAgICAgICAgICAgIGxldCBbIGJhc2UsIHF1b3RlIF0gPSBzeW1ib2wuc3BsaXQgKCcvJyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnc3ltYm9sJ107XG4gICAgICAgICAgICAgICAgICAgIGxldCBzeW1ib2wgPSBwcm9kdWN0WydzeW1ib2wnXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBwcm9kdWN0WyduYW1lJ107XG4gICAgICAgICAgICAgICAgICAgIGxldCB0eXBlID0gcHJvZHVjdFsndHlwZSddLnRvTG93ZXJDYXNlICgpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3R5cGUnOiB0eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHsgXG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRVc2VyT3ZlcnZpZXcgKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRNYXJrZXRRdW90ZXMgKHtcbiAgICAgICAgICAgICdzeW1ib2xzJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldE1hcmtldEJhcnMgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAncmVzb2x1dGlvbic6IDYwLFxuICAgICAgICAgICAgJ2xpbWl0JzogMSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ21hcmdpbic6IGFtb3VudCxcbiAgICAgICAgICAgICdkaXJlY3Rpb24nOiAoc2lkZSA9PSAnc2VsbCcpID8gJ3Nob3J0JyA6ICdsb25nJyxcbiAgICAgICAgICAgICdsZXZlcmFnZSc6IDEsXG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcmRlclsndHlwZSddICs9ICdfbWFya2V0JztcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldE9yZGVyQ3JlYXRlICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHBhdGggKyAnLnBocCc7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7ICd0b2tlbic6ICh0aGlzLmFwaUtleSB8fCB0aGlzLnRva2VuKSB9LCBwYXJhbXMpO1xuICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kKTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBjcnlwdG9jYXBpdGFsID0ge1xuXG4gICAgJ2NvbW1lbnQnOiAnQ3J5cHRvIENhcGl0YWwgQVBJJyxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnc3RhdHMnLFxuICAgICAgICAgICAgICAgICdoaXN0b3JpY2FsLXByaWNlcycsXG4gICAgICAgICAgICAgICAgJ29yZGVyLWJvb2snLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7ICAgICAgICAgICAgXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZXMtYW5kLWluZm8nLFxuICAgICAgICAgICAgICAgICdvcGVuLW9yZGVycycsXG4gICAgICAgICAgICAgICAgJ3VzZXItdHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAnYnRjLWRlcG9zaXQtYWRkcmVzcy9nZXQnLFxuICAgICAgICAgICAgICAgICdidGMtZGVwb3NpdC1hZGRyZXNzL25ldycsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRzL2dldCcsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzL2dldCcsXG4gICAgICAgICAgICAgICAgJ29yZGVycy9uZXcnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvZWRpdCcsXG4gICAgICAgICAgICAgICAgJ29yZGVycy9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvc3RhdHVzJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMvbmV3JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZXNBbmRJbmZvICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkgeyBcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0T3JkZXJCb29rICh7XG4gICAgICAgICAgICAnY3VycmVuY3knOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFN0YXRzICh7XG4gICAgICAgICAgICAnY3VycmVuY3knOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3N0YXRzJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWF4J10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWluJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0X3ByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnZGFpbHlfY2hhbmdlJ10pLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd0b3RhbF9idGNfdHJhZGVkJ10pLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFuc2FjdGlvbnMgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnc2lkZSc6IHNpZGUsXG4gICAgICAgICAgICAndHlwZSc6IHR5cGUsXG4gICAgICAgICAgICAnY3VycmVuY3knOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ2xpbWl0X3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RPcmRlcnNOZXcgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnYXBpX2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdub25jZSc6IHRoaXMubm9uY2UgKCksXG4gICAgICAgICAgICB9LCBwYXJhbXMpO1xuICAgICAgICAgICAgcXVlcnlbJ3NpZ25hdHVyZSddID0gdGhpcy5obWFjIChKU09OLnN0cmluZ2lmeSAocXVlcnkpLCB0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIF8xYnRjeGUgPSBleHRlbmQgKGNyeXB0b2NhcGl0YWwsIHtcblxuICAgICdpZCc6ICdfMWJ0Y3hlJyxcbiAgICAnbmFtZSc6ICcxQlRDWEUnLFxuICAgICdjb3VudHJpZXMnOiAnUEEnLCAvLyBQYW5hbWFcbiAgICAnY29tbWVudCc6ICdDcnlwdG8gQ2FwaXRhbCBBUEknLFxuICAgICd1cmxzJzogeyBcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjA0OS0yYjI5NDQwOC01ZWNjLTExZTctODVjYy1hZGFmZjAxM2RjMWEuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovLzFidGN4ZS5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovLzFidGN4ZS5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vMWJ0Y3hlLmNvbS9hcGktZG9jcy5waHAnLFxuICAgIH0sICAgIFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdVU0QnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJywgfSxcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdFVVInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJywgfSxcbiAgICAgICAgJ0JUQy9DTlknOiB7ICdpZCc6ICdDTlknLCAnc3ltYm9sJzogJ0JUQy9DTlknLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ05ZJywgfSxcbiAgICAgICAgJ0JUQy9SVUInOiB7ICdpZCc6ICdSVUInLCAnc3ltYm9sJzogJ0JUQy9SVUInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnUlVCJywgfSxcbiAgICAgICAgJ0JUQy9DSEYnOiB7ICdpZCc6ICdDSEYnLCAnc3ltYm9sJzogJ0JUQy9DSEYnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ0hGJywgfSxcbiAgICAgICAgJ0JUQy9KUFknOiB7ICdpZCc6ICdKUFknLCAnc3ltYm9sJzogJ0JUQy9KUFknLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSlBZJywgfSxcbiAgICAgICAgJ0JUQy9HQlAnOiB7ICdpZCc6ICdHQlAnLCAnc3ltYm9sJzogJ0JUQy9HQlAnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnR0JQJywgfSxcbiAgICAgICAgJ0JUQy9DQUQnOiB7ICdpZCc6ICdDQUQnLCAnc3ltYm9sJzogJ0JUQy9DQUQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ0FEJywgfSxcbiAgICAgICAgJ0JUQy9BVUQnOiB7ICdpZCc6ICdBVUQnLCAnc3ltYm9sJzogJ0JUQy9BVUQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQVVEJywgfSxcbiAgICAgICAgJ0JUQy9BRUQnOiB7ICdpZCc6ICdBRUQnLCAnc3ltYm9sJzogJ0JUQy9BRUQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQUVEJywgfSxcbiAgICAgICAgJ0JUQy9CR04nOiB7ICdpZCc6ICdCR04nLCAnc3ltYm9sJzogJ0JUQy9CR04nLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQkdOJywgfSxcbiAgICAgICAgJ0JUQy9DWksnOiB7ICdpZCc6ICdDWksnLCAnc3ltYm9sJzogJ0JUQy9DWksnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnQ1pLJywgfSxcbiAgICAgICAgJ0JUQy9ES0snOiB7ICdpZCc6ICdES0snLCAnc3ltYm9sJzogJ0JUQy9ES0snLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnREtLJywgfSxcbiAgICAgICAgJ0JUQy9IS0QnOiB7ICdpZCc6ICdIS0QnLCAnc3ltYm9sJzogJ0JUQy9IS0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSEtEJywgfSxcbiAgICAgICAgJ0JUQy9IUksnOiB7ICdpZCc6ICdIUksnLCAnc3ltYm9sJzogJ0JUQy9IUksnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSFJLJywgfSxcbiAgICAgICAgJ0JUQy9IVUYnOiB7ICdpZCc6ICdIVUYnLCAnc3ltYm9sJzogJ0JUQy9IVUYnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSFVGJywgfSxcbiAgICAgICAgJ0JUQy9JTFMnOiB7ICdpZCc6ICdJTFMnLCAnc3ltYm9sJzogJ0JUQy9JTFMnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSUxTJywgfSxcbiAgICAgICAgJ0JUQy9JTlInOiB7ICdpZCc6ICdJTlInLCAnc3ltYm9sJzogJ0JUQy9JTlInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnSU5SJywgfSxcbiAgICAgICAgJ0JUQy9NVVInOiB7ICdpZCc6ICdNVVInLCAnc3ltYm9sJzogJ0JUQy9NVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnTVVSJywgfSxcbiAgICAgICAgJ0JUQy9NWE4nOiB7ICdpZCc6ICdNWE4nLCAnc3ltYm9sJzogJ0JUQy9NWE4nLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnTVhOJywgfSxcbiAgICAgICAgJ0JUQy9OT0snOiB7ICdpZCc6ICdOT0snLCAnc3ltYm9sJzogJ0JUQy9OT0snLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnTk9LJywgfSxcbiAgICAgICAgJ0JUQy9OWkQnOiB7ICdpZCc6ICdOWkQnLCAnc3ltYm9sJzogJ0JUQy9OWkQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnTlpEJywgfSxcbiAgICAgICAgJ0JUQy9QTE4nOiB7ICdpZCc6ICdQTE4nLCAnc3ltYm9sJzogJ0JUQy9QTE4nLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnUExOJywgfSxcbiAgICAgICAgJ0JUQy9ST04nOiB7ICdpZCc6ICdST04nLCAnc3ltYm9sJzogJ0JUQy9ST04nLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnUk9OJywgfSxcbiAgICAgICAgJ0JUQy9TRUsnOiB7ICdpZCc6ICdTRUsnLCAnc3ltYm9sJzogJ0JUQy9TRUsnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnU0VLJywgfSxcbiAgICAgICAgJ0JUQy9TR0QnOiB7ICdpZCc6ICdTR0QnLCAnc3ltYm9sJzogJ0JUQy9TR0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnU0dEJywgfSxcbiAgICAgICAgJ0JUQy9USEInOiB7ICdpZCc6ICdUSEInLCAnc3ltYm9sJzogJ0JUQy9USEInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVEhCJywgfSxcbiAgICAgICAgJ0JUQy9UUlknOiB7ICdpZCc6ICdUUlknLCAnc3ltYm9sJzogJ0JUQy9UUlknLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVFJZJywgfSxcbiAgICAgICAgJ0JUQy9aQVInOiB7ICdpZCc6ICdaQVInLCAnc3ltYm9sJzogJ0JUQy9aQVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnWkFSJywgfSxcbiAgICB9LFxufSlcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYW54cHJvID0ge1xuXG4gICAgJ2lkJzogJ2FueHBybycsXG4gICAgJ25hbWUnOiAnQU5YUHJvJyxcbiAgICAnY291bnRyaWVzJzogWyAnSlAnLCAnU0cnLCAnSEsnLCAnTlonLCBdLFxuICAgICd2ZXJzaW9uJzogJzInLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY1OTgzLWZkODU5NWRhLTVlYzktMTFlNy04MmUzLWFkYjNhYjhjMjYxMi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYW54cHJvLmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vYW54cHJvLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9hbnhwcm8uY29tL3BhZ2VzL2FwaScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAne2N1cnJlbmN5X3BhaXJ9L21vbmV5L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3tjdXJyZW5jeV9wYWlyfS9tb25leS9kZXB0aC9mdWxsJyxcbiAgICAgICAgICAgICAgICAne2N1cnJlbmN5X3BhaXJ9L21vbmV5L3RyYWRlL2ZldGNoJywgLy8gZGlzYWJsZWQgYnkgQU5YUHJvXG4gICAgICAgICAgICBdLCAgICBcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAne2N1cnJlbmN5X3BhaXJ9L21vbmV5L29yZGVyL2FkZCcsXG4gICAgICAgICAgICAgICAgJ3tjdXJyZW5jeV9wYWlyfS9tb25leS9vcmRlci9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICd7Y3VycmVuY3lfcGFpcn0vbW9uZXkvb3JkZXIvcXVvdGUnLFxuICAgICAgICAgICAgICAgICd7Y3VycmVuY3lfcGFpcn0vbW9uZXkvb3JkZXIvcmVzdWx0JyxcbiAgICAgICAgICAgICAgICAne2N1cnJlbmN5X3BhaXJ9L21vbmV5L29yZGVycycsXG4gICAgICAgICAgICAgICAgJ21vbmV5L3tjdXJyZW5jeX0vYWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ21vbmV5L3tjdXJyZW5jeX0vc2VuZF9zaW1wbGUnLFxuICAgICAgICAgICAgICAgICdtb25leS9pbmZvJyxcbiAgICAgICAgICAgICAgICAnbW9uZXkvdHJhZGUvbGlzdCcsXG4gICAgICAgICAgICAgICAgJ21vbmV5L3dhbGxldC9oaXN0b3J5JyxcbiAgICAgICAgICAgIF0sICAgIFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ0JUQ1VTRCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdCVEMvSEtEJzogeyAnaWQnOiAnQlRDSEtEJywgJ3N5bWJvbCc6ICdCVEMvSEtEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0hLRCcgfSxcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdCVENFVVInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgICAgICAnQlRDL0NBRCc6IHsgJ2lkJzogJ0JUQ0NBRCcsICdzeW1ib2wnOiAnQlRDL0NBRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDQUQnIH0sXG4gICAgICAgICdCVEMvQVVEJzogeyAnaWQnOiAnQlRDQVVEJywgJ3N5bWJvbCc6ICdCVEMvQVVEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0FVRCcgfSxcbiAgICAgICAgJ0JUQy9TR0QnOiB7ICdpZCc6ICdCVENTR0QnLCAnc3ltYm9sJzogJ0JUQy9TR0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnU0dEJyB9LFxuICAgICAgICAnQlRDL0pQWSc6IHsgJ2lkJzogJ0JUQ0pQWScsICdzeW1ib2wnOiAnQlRDL0pQWScsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdCVEMvR0JQJzogeyAnaWQnOiAnQlRDR0JQJywgJ3N5bWJvbCc6ICdCVEMvR0JQJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0dCUCcgfSxcbiAgICAgICAgJ0JUQy9OWkQnOiB7ICdpZCc6ICdCVENOWkQnLCAnc3ltYm9sJzogJ0JUQy9OWkQnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnTlpEJyB9LFxuICAgICAgICAnTFRDL0JUQyc6IHsgJ2lkJzogJ0xUQ0JUQycsICdzeW1ib2wnOiAnTFRDL0JUQycsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdET0dFL0JUQyc6IHsgJ2lkJzogJ0RPR0VCVEMnLCAnc3ltYm9sJzogJ0RPR0UvQlRDJywgJ2Jhc2UnOiAnRE9HRScsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdTVFIvQlRDJzogeyAnaWQnOiAnU1RSQlRDJywgJ3N5bWJvbCc6ICdTVFIvQlRDJywgJ2Jhc2UnOiAnU1RSJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ1hSUC9CVEMnOiB7ICdpZCc6ICdYUlBCVEMnLCAnc3ltYm9sJzogJ1hSUC9CVEMnLCAnYmFzZSc6ICdYUlAnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE1vbmV5SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0Q3VycmVuY3lQYWlyTW9uZXlEZXB0aEZ1bGwgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeV9wYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRDdXJyZW5jeVBhaXJNb25leVRpY2tlciAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ2RhdGEnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHBhcnNlSW50ICh0aWNrZXJbJ2RhdGFVcGRhdGVUaW1lJ10gLyAxMDAwKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddWyd2YWx1ZSddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddWyd2YWx1ZSddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddWyd2YWx1ZSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSlbJ3ZhbHVlJ10sXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddWyd2YWx1ZSddKSxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXVsndmFsdWUnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXZnJ11bJ3ZhbHVlJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddWyd2YWx1ZSddKSxcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0Q3VycmVuY3lQYWlyTW9uZXlUcmFkZUZldGNoICh7XG4gICAgICAgICAgICAnY3VycmVuY3lfcGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnY3VycmVuY3lfcGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdhbW91bnRfaW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlX2ludCddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0Q3VycmVuY3lQYWlyT3JkZXJBZGQgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIG5vbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgcmVxdWVzdCA9IHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHJlcXVlc3Q7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoeyAnbm9uY2UnOiBub25jZSB9LCBxdWVyeSkpO1xuICAgICAgICAgICAgbGV0IHNlY3JldCA9IHRoaXMuYmFzZTY0VG9CaW5hcnkgKHRoaXMuc2VjcmV0KTtcbiAgICAgICAgICAgIGxldCBhdXRoID0gcmVxdWVzdCArIFwiXFwwXCIgKyBib2R5O1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ1Jlc3QtS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1Jlc3QtU2lnbic6IHRoaXMuaG1hYyAoYXV0aCwgc2VjcmV0LCAnc2hhNTEyJywgJ2Jhc2U2NCcpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdDJjID0ge1xuXG4gICAgJ2lkJzogJ2JpdDJjJyxcbiAgICAnbmFtZSc6ICdCaXQyQycsXG4gICAgJ2NvdW50cmllcyc6ICdJTCcsIC8vIElzcmFlbFxuICAgICdyYXRlTGltaXQnOiAzMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MTE5LTM1OTMyMjBlLTVlY2UtMTFlNy04YjNhLTVhMDQxZjZiY2MzZi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vd3d3LmJpdDJjLmNvLmlsJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5iaXQyYy5jby5pbCcsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cuYml0MmMuY28uaWwvaG9tZS9hcGknLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9PZmVyRS9iaXQyYycsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnRXhjaGFuZ2VzL3twYWlyfS9UaWNrZXInLFxuICAgICAgICAgICAgICAgICdFeGNoYW5nZXMve3BhaXJ9L29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ0V4Y2hhbmdlcy97cGFpcn0vdHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ0FjY291bnQvQmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ0FjY291bnQvQmFsYW5jZS92MicsXG4gICAgICAgICAgICAgICAgJ01lcmNoYW50L0NyZWF0ZUNoZWNrb3V0JyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvQWNjb3VudEhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdPcmRlci9BZGRDb2luRnVuZHNSZXF1ZXN0JyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvQWRkRnVuZCcsXG4gICAgICAgICAgICAgICAgJ09yZGVyL0FkZE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvQWRkT3JkZXJNYXJrZXRQcmljZUJ1eScsXG4gICAgICAgICAgICAgICAgJ09yZGVyL0FkZE9yZGVyTWFya2V0UHJpY2VTZWxsJyxcbiAgICAgICAgICAgICAgICAnT3JkZXIvQ2FuY2VsT3JkZXInLFxuICAgICAgICAgICAgICAgICdPcmRlci9NeU9yZGVycycsXG4gICAgICAgICAgICAgICAgJ1BheW1lbnQvR2V0TXlJZCcsXG4gICAgICAgICAgICAgICAgJ1BheW1lbnQvU2VuZCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL05JUyc6IHsgJ2lkJzogJ0J0Y05pcycsICdzeW1ib2wnOiAnQlRDL05JUycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdOSVMnIH0sXG4gICAgICAgICdMVEMvQlRDJzogeyAnaWQnOiAnTHRjQnRjJywgJ3N5bWJvbCc6ICdMVEMvQlRDJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0xUQy9OSVMnOiB7ICdpZCc6ICdMdGNOaXMnLCAnc3ltYm9sJzogJ0xUQy9OSVMnLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnTklTJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEFjY291bnRCYWxhbmNlVjIgKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldEV4Y2hhbmdlc1BhaXJPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0RXhjaGFuZ2VzUGFpclRpY2tlciAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhc2snOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xsJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2F2J10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2EnXSksXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldEV4Y2hhbmdlc1BhaXJUcmFkZXMgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVBvc3RPcmRlckFkZE9yZGVyJztcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ0Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdQYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0Jykge1xuICAgICAgICAgICAgbWV0aG9kICs9ICdNYXJrZXRQcmljZScgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3JkZXJbJ1ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgICAgIG9yZGVyWydUb3RhbCddID0gYW1vdW50ICogcHJpY2U7XG4gICAgICAgICAgICBvcmRlclsnSXNCaWQnXSA9IChzaWRlID09ICdidXknKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIHVybCArPSAnLmpzb24nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7ICdub25jZSc6IG5vbmNlIH0sIHBhcmFtcyk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnc2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInLCAnYmFzZTY0JyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0YmF5ID0ge1xuXG4gICAgJ2lkJzogJ2JpdGJheScsXG4gICAgJ25hbWUnOiAnQml0QmF5JyxcbiAgICAnY291bnRyaWVzJzogWyAnUEwnLCAnRVUnLCBdLCAvLyBQb2xhbmRcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjEzMi05NzhhN2JkOC01ZWNlLTExZTctOTU0MC1iYzk2ZDFlOWJiYjguanBnJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2JpdGJheS5uZXQnLFxuICAgICAgICAnYXBpJzoge1xuICAgICAgICAgICAgJ3B1YmxpYyc6ICdodHRwczovL2JpdGJheS5uZXQvQVBJL1B1YmxpYycsXG4gICAgICAgICAgICAncHJpdmF0ZSc6ICdodHRwczovL2JpdGJheS5uZXQvQVBJL1RyYWRpbmcvdHJhZGluZ0FwaS5waHAnLFxuICAgICAgICB9LFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vYml0YmF5Lm5ldC9wdWJsaWMtYXBpJyxcbiAgICAgICAgICAgICdodHRwczovL2JpdGJheS5uZXQvYWNjb3VudC90YWItYXBpJyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vQml0QmF5TmV0L0FQSScsXG4gICAgICAgIF0sIFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3tpZH0vYWxsJyxcbiAgICAgICAgICAgICAgICAne2lkfS9tYXJrZXQnLFxuICAgICAgICAgICAgICAgICd7aWR9L29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ3tpZH0vdGlja2VyJyxcbiAgICAgICAgICAgICAgICAne2lkfS90cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnaW5mbycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAndHJhbnNmZXInLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICAgICAgJ2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHsgIFxuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ0JUQ1VTRCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdCVEMvRVVSJzogeyAnaWQnOiAnQlRDRVVSJywgJ3N5bWJvbCc6ICdCVEMvRVVSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICAgICAgJ0JUQy9QTE4nOiB7ICdpZCc6ICdCVENQTE4nLCAnc3ltYm9sJzogJ0JUQy9QTE4nLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnUExOJyB9LFxuICAgICAgICAnTFRDL1VTRCc6IHsgJ2lkJzogJ0xUQ1VTRCcsICdzeW1ib2wnOiAnTFRDL1VTRCcsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdMVEMvRVVSJzogeyAnaWQnOiAnTFRDRVVSJywgJ3N5bWJvbCc6ICdMVEMvRVVSJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICAgICAgJ0xUQy9QTE4nOiB7ICdpZCc6ICdMVENQTE4nLCAnc3ltYm9sJzogJ0xUQy9QTE4nLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnUExOJyB9LFxuICAgICAgICAnTFRDL0JUQyc6IHsgJ2lkJzogJ0xUQ0JUQycsICdzeW1ib2wnOiAnTFRDL0JUQycsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdFVEgvVVNEJzogeyAnaWQnOiAnRVRIVVNEJywgJ3N5bWJvbCc6ICdFVEgvVVNEJywgJ2Jhc2UnOiAnRVRIJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0VUSC9FVVInOiB7ICdpZCc6ICdFVEhFVVInLCAnc3ltYm9sJzogJ0VUSC9FVVInLCAnYmFzZSc6ICdFVEgnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgICAgICAnRVRIL1BMTic6IHsgJ2lkJzogJ0VUSFBMTicsICdzeW1ib2wnOiAnRVRIL1BMTicsICdiYXNlJzogJ0VUSCcsICdxdW90ZSc6ICdQTE4nIH0sXG4gICAgICAgICdFVEgvQlRDJzogeyAnaWQnOiAnRVRIQlRDJywgJ3N5bWJvbCc6ICdFVEgvQlRDJywgJ2Jhc2UnOiAnRVRIJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0xTSy9VU0QnOiB7ICdpZCc6ICdMU0tVU0QnLCAnc3ltYm9sJzogJ0xTSy9VU0QnLCAnYmFzZSc6ICdMU0snLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnTFNLL0VVUic6IHsgJ2lkJzogJ0xTS0VVUicsICdzeW1ib2wnOiAnTFNLL0VVUicsICdiYXNlJzogJ0xTSycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgICAgICdMU0svUExOJzogeyAnaWQnOiAnTFNLUExOJywgJ3N5bWJvbCc6ICdMU0svUExOJywgJ2Jhc2UnOiAnTFNLJywgJ3F1b3RlJzogJ1BMTicgfSxcbiAgICAgICAgJ0xTSy9CVEMnOiB7ICdpZCc6ICdMU0tCVEMnLCAnc3ltYm9sJzogJ0xTSy9CVEMnLCAnYmFzZSc6ICdMU0snLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkgeyBcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RJbmZvICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRJZE9yZGVyYm9vayAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0SWRUaWNrZXIgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWF4J10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbWluJ10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2F2ZXJhZ2UnXSksXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRJZFRyYWRlcyAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IHBbJ2Jhc2UnXSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncGF5bWVudF9jdXJyZW5jeSc6IHBbJ3F1b3RlJ10sXG4gICAgICAgICAgICAncmF0ZSc6IHByaWNlLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV07XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpICsgJy5qc29uJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbWV0aG9kJzogcGF0aCxcbiAgICAgICAgICAgICAgICAnbW9tZW50JzogdGhpcy5ub25jZSAoKSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0FQSS1LZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnQVBJLUhhc2gnOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0YmF5cyA9IHtcblxuICAgICdpZCc6ICdiaXRiYXlzJyxcbiAgICAnbmFtZSc6ICdCaXRCYXlzJyxcbiAgICAnY291bnRyaWVzJzogWyAnQ04nLCAnR0InLCAnSEsnLCAnQVUnLCAnQ0EnIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3ODA4NTk5LTk4MzY4N2QyLTYwNTEtMTFlNy04ZDk1LTgwZGZjYmU1Y2JiNC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYml0YmF5cy5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2JpdGJheXMuY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2JpdGJheXMuY29tL2hlbHAvYXBpLycsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnZGVwdGgnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnaW5mbycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAndHJhZGUnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdidGNfdXNkJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0JUQy9DTlknOiB7ICdpZCc6ICdidGNfY255JywgJ3N5bWJvbCc6ICdCVEMvQ05ZJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ09EUy9CVEMnOiB7ICdpZCc6ICdvZHNfYnRjJywgJ3N5bWJvbCc6ICdPRFMvQlRDJywgJ2Jhc2UnOiAnT0RTJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0xTSy9CVEMnOiB7ICdpZCc6ICdsc2tfYnRjJywgJ3N5bWJvbCc6ICdMU0svQlRDJywgJ2Jhc2UnOiAnTFNLJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0xTSy9DTlknOiB7ICdpZCc6ICdsc2tfY255JywgJ3N5bWJvbCc6ICdMU0svQ05ZJywgJ2Jhc2UnOiAnTFNLJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RGVwdGggKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3Jlc3VsdCddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXMgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdvcCc6IHNpZGUsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0Jykge1xuICAgICAgICAgICAgb3JkZXJbJ29yZGVyX3R5cGUnXSA9IDE7XG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3JkZXJbJ29yZGVyX3R5cGUnXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAnS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1NpZ24nOiB0aGlzLmhtYWMgKGJvZHksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0Y29pbmNvaWQgPSB7XG5cbiAgICAnaWQnOiAnYml0Y29pbmNvaWQnLFxuICAgICduYW1lJzogJ0JpdGNvaW4uY28uaWQnLFxuICAgICdjb3VudHJpZXMnOiAnSUQnLCAvLyBJbmRvbmVzaWFcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjEzOC0wNDNjNzc4Ni01ZWNmLTExZTctODgyYi04MDljMTRmMzhiNTMuanBnJyxcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdwdWJsaWMnOiAnaHR0cHM6Ly92aXAuYml0Y29pbi5jby5pZC9hcGknLFxuICAgICAgICAgICAgJ3ByaXZhdGUnOiAnaHR0cHM6Ly92aXAuYml0Y29pbi5jby5pZC90YXBpJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5iaXRjb2luLmNvLmlkJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3ZpcC5iaXRjb2luLmNvLmlkL3RyYWRlX2FwaScsXG4gICAgICAgICAgICAnaHR0cHM6Ly92aXAuYml0Y29pbi5jby5pZC9kb3dubG9hZHMvQklUQ09JTkNPSUQtQVBJLURPQ1VNRU5UQVRJT04ucGRmJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICd7cGFpcn0vdGlja2VyJyxcbiAgICAgICAgICAgICAgICAne3BhaXJ9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3twYWlyfS9kZXB0aCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdnZXRJbmZvJyxcbiAgICAgICAgICAgICAgICAndHJhbnNIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAndHJhZGUnLFxuICAgICAgICAgICAgICAgICd0cmFkZUhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdvcGVuT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsT3JkZXInLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9JRFInOiAgeyAnaWQnOiAnYnRjX2lkcicsICdzeW1ib2wnOiAnQlRDL0lEUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdJRFInLCAnYmFzZUlkJzogJ2J0YycsICdxdW90ZUlkJzogJ2lkcicgfSxcbiAgICAgICAgJ0JUUy9CVEMnOiAgeyAnaWQnOiAnYnRzX2J0YycsICdzeW1ib2wnOiAnQlRTL0JUQycsICdiYXNlJzogJ0JUUycsICdxdW90ZSc6ICdCVEMnLCAnYmFzZUlkJzogJ2J0cycsICdxdW90ZUlkJzogJ2J0YycgfSxcbiAgICAgICAgJ0RBU0gvQlRDJzogeyAnaWQnOiAnZHJrX2J0YycsICdzeW1ib2wnOiAnREFTSC9CVEMnLCAnYmFzZSc6ICdEQVNIJywgJ3F1b3RlJzogJ0JUQycsICdiYXNlSWQnOiAnZHJrJywgJ3F1b3RlSWQnOiAnYnRjJyB9LFxuICAgICAgICAnRE9HRS9CVEMnOiB7ICdpZCc6ICdkb2dlX2J0YycsICdzeW1ib2wnOiAnRE9HRS9CVEMnLCAnYmFzZSc6ICdET0dFJywgJ3F1b3RlJzogJ0JUQycsICdiYXNlSWQnOiAnZG9nZScsICdxdW90ZUlkJzogJ2J0YycgfSxcbiAgICAgICAgJ0VUSC9CVEMnOiAgeyAnaWQnOiAnZXRoX2J0YycsICdzeW1ib2wnOiAnRVRIL0JUQycsICdiYXNlJzogJ0VUSCcsICdxdW90ZSc6ICdCVEMnLCAnYmFzZUlkJzogJ2V0aCcsICdxdW90ZUlkJzogJ2J0YycgfSxcbiAgICAgICAgJ0xUQy9CVEMnOiAgeyAnaWQnOiAnbHRjX2J0YycsICdzeW1ib2wnOiAnTFRDL0JUQycsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdCVEMnLCAnYmFzZUlkJzogJ2x0YycsICdxdW90ZUlkJzogJ2J0YycgfSxcbiAgICAgICAgJ05YVC9CVEMnOiAgeyAnaWQnOiAnbnh0X2J0YycsICdzeW1ib2wnOiAnTlhUL0JUQycsICdiYXNlJzogJ05YVCcsICdxdW90ZSc6ICdCVEMnLCAnYmFzZUlkJzogJ254dCcsICdxdW90ZUlkJzogJ2J0YycgfSxcbiAgICAgICAgJ1NUUi9CVEMnOiAgeyAnaWQnOiAnc3RyX2J0YycsICdzeW1ib2wnOiAnU1RSL0JUQycsICdiYXNlJzogJ1NUUicsICdxdW90ZSc6ICdCVEMnLCAnYmFzZUlkJzogJ3N0cicsICdxdW90ZUlkJzogJ2J0YycgfSxcbiAgICAgICAgJ05FTS9CVEMnOiAgeyAnaWQnOiAnbmVtX2J0YycsICdzeW1ib2wnOiAnTkVNL0JUQycsICdiYXNlJzogJ05FTScsICdxdW90ZSc6ICdCVEMnLCAnYmFzZUlkJzogJ25lbScsICdxdW90ZUlkJzogJ2J0YycgfSxcbiAgICAgICAgJ1hSUC9CVEMnOiAgeyAnaWQnOiAneHJwX2J0YycsICdzeW1ib2wnOiAnWFJQL0JUQycsICdiYXNlJzogJ1hSUCcsICdxdW90ZSc6ICdCVEMnLCAnYmFzZUlkJzogJ3hycCcsICdxdW90ZUlkJzogJ2J0YycgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RHZXRJbmZvICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRQYWlyRGVwdGggKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHBhaXIgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFBhaXJUaWNrZXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogcGFpclsnaWQnXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsndGlja2VyJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlcnZlcl90aW1lJ10pICogMTAwMDtcbiAgICAgICAgbGV0IGJhc2VWb2x1bWUgPSAndm9sXycgKyBwYWlyWydiYXNlSWQnXS50b0xvd2VyQ2FzZSAoKTtcbiAgICAgICAgbGV0IHF1b3RlVm9sdW1lID0gJ3ZvbF8nICsgcGFpclsncXVvdGVJZCddLnRvTG93ZXJDYXNlICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWyd2d2FwJ10pLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogcGFyc2VGbG9hdCAodGlja2VyWydhdmVyYWdlJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbYmFzZVZvbHVtZV0pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyW3F1b3RlVm9sdW1lXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0UGFpclRyYWRlcyAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAncGFpcic6IHBbJ2lkJ10sXG4gICAgICAgICAgICAndHlwZSc6IHNpZGUsXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IGJhc2UgPSBwWydiYXNlJ10udG9Mb3dlckNhc2UgKCk7XG4gICAgICAgIG9yZGVyW2Jhc2VdID0gYW1vdW50O1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFRyYWRlICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXVt0eXBlXTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIHVybCArPSAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ21ldGhvZCc6IHBhdGgsXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogdGhpcy5ub25jZSAoKSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdTaWduJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdGZpbmV4ID0ge1xuXG4gICAgJ2lkJzogJ2JpdGZpbmV4JyxcbiAgICAnbmFtZSc6ICdCaXRmaW5leCcsXG4gICAgJ2NvdW50cmllcyc6ICdVUycsXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MjQ0LWUzMjhhNTBjLTVlZDItMTFlNy05NDdiLTA0MTQxNjU3OWJiMy5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLmJpdGZpbmV4LmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cuYml0ZmluZXguY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL2JpdGZpbmV4LnJlYWRtZS5pby92MS9kb2NzJyxcbiAgICAgICAgICAgICdodHRwczovL2JpdGZpbmV4LnJlYWRtZS5pby92Mi9kb2NzJyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vYml0ZmluZXhjb20vYml0ZmluZXgtYXBpLW5vZGUnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2Jvb2sve3N5bWJvbH0nLFxuICAgICAgICAgICAgICAgICdjYW5kbGVzL3tzeW1ib2x9JyxcbiAgICAgICAgICAgICAgICAnbGVuZGJvb2sve2N1cnJlbmN5fScsXG4gICAgICAgICAgICAgICAgJ2xlbmRzL3tjdXJyZW5jeX0nLFxuICAgICAgICAgICAgICAgICdwdWJ0aWNrZXIve3N5bWJvbH0nLFxuICAgICAgICAgICAgICAgICdzdGF0cy97c3ltYm9sfScsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbHMnLFxuICAgICAgICAgICAgICAgICdzeW1ib2xzX2RldGFpbHMnLFxuICAgICAgICAgICAgICAgICd0b2RheScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97c3ltYm9sfScsICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudF9pbmZvcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAnYmFza2V0X21hbmFnZScsXG4gICAgICAgICAgICAgICAgJ2NyZWRpdHMnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0L25ldycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRpbmcvY2xvc2UnLFxuICAgICAgICAgICAgICAgICdoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnaGlzdG9yeS9tb3ZlbWVudHMnLFxuICAgICAgICAgICAgICAgICdrZXlfaW5mbycsXG4gICAgICAgICAgICAgICAgJ21hcmdpbl9pbmZvcycsXG4gICAgICAgICAgICAgICAgJ215dHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnb2ZmZXIvY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb2ZmZXIvbmV3JyxcbiAgICAgICAgICAgICAgICAnb2ZmZXIvc3RhdHVzJyxcbiAgICAgICAgICAgICAgICAnb2ZmZXJzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY2FuY2VsL2FsbCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NhbmNlbC9tdWx0aScsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NhbmNlbC9yZXBsYWNlJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvbmV3JyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvbmV3L211bHRpJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvc3RhdHVzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAncG9zaXRpb24vY2xhaW0nLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbnMnLFxuICAgICAgICAgICAgICAgICdzdW1tYXJ5JyxcbiAgICAgICAgICAgICAgICAndGFrZW5fZnVuZHMnLFxuICAgICAgICAgICAgICAgICd0b3RhbF90YWtlbl9mdW5kcycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyJyxcbiAgICAgICAgICAgICAgICAndW51c2VkX3Rha2VuX2Z1bmRzJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0U3ltYm9sc0RldGFpbHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1twXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ3BhaXInXS50b1VwcGVyQ2FzZSAoKTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gaWQuc2xpY2UgKDAsIDMpO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gaWQuc2xpY2UgKDMsIDYpO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlcyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0Qm9va1N5bWJvbCAoeyBcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQdWJ0aWNrZXJTeW1ib2wgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VGbG9hdCAodGlja2VyWyd0aW1lc3RhbXAnXSkgKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0X3ByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21pZCddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzU3ltYm9sICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXJOZXcgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudC50b1N0cmluZyAoKSxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLnRvU3RyaW5nICgpLFxuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3R5cGUnOiAnZXhjaGFuZ2UgJyArIHR5cGUsXG4gICAgICAgICAgICAnb2Nvb3JkZXInOiBmYWxzZSxcbiAgICAgICAgICAgICdidXlfcHJpY2Vfb2NvJzogMCxcbiAgICAgICAgICAgICdzZWxsX3ByaWNlX29jbyc6IDAsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgcmVxdWVzdCA9ICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHJlcXVlc3Q7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7ICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgcXVlcnkgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLnRvU3RyaW5nICgpLFxuICAgICAgICAgICAgICAgICdyZXF1ZXN0JzogcmVxdWVzdCxcbiAgICAgICAgICAgIH0sIHF1ZXJ5KTtcbiAgICAgICAgICAgIGxldCBwYXlsb2FkID0gdGhpcy5zdHJpbmdUb0Jhc2U2NCAoSlNPTi5zdHJpbmdpZnkgKHF1ZXJ5KSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdYLUJGWC1BUElLRVknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnWC1CRlgtUEFZTE9BRCc6IHBheWxvYWQsXG4gICAgICAgICAgICAgICAgJ1gtQkZYLVNJR05BVFVSRSc6IHRoaXMuaG1hYyAocGF5bG9hZCwgdGhpcy5zZWNyZXQsICdzaGEzODQnKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXRsaXNoID0ge1xuXG4gICAgJ2lkJzogJ2JpdGxpc2gnLFxuICAgICduYW1lJzogJ2JpdGxpc2gnLFxuICAgICdjb3VudHJpZXMnOiBbICdHQicsICdFVScsICdSVScsIF0sXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsICAgIFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjI3NS1kY2ZjNmMzMC01ZWQzLTExZTctODM5ZC0wMGE4NDYzODVkMGIuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2JpdGxpc2guY29tL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9iaXRsaXNoLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9iaXRsaXNoLmNvbS9hcGknLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2luc3RydW1lbnRzJyxcbiAgICAgICAgICAgICAgICAnb2hsY3YnLFxuICAgICAgICAgICAgICAgICdwYWlycycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcnMnLFxuICAgICAgICAgICAgICAgICd0cmFkZXNfZGVwdGgnLFxuICAgICAgICAgICAgICAgICd0cmFkZXNfaGlzdG9yeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdhY2NvdW50c19vcGVyYXRpb25zJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF90cmFkZScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF90cmFkZXNfYnlfaWRzJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX2FsbF90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdjcmVhdGVfYmNvZGUnLFxuICAgICAgICAgICAgICAgICdjcmVhdGVfdGVtcGxhdGVfd2FsbGV0JyxcbiAgICAgICAgICAgICAgICAnY3JlYXRlX3RyYWRlJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdCcsXG4gICAgICAgICAgICAgICAgJ2xpc3RfYWNjb3VudHNfb3BlcmF0aW9uc19mcm9tX3RzJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9hY3RpdmVfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9iY29kZXMnLFxuICAgICAgICAgICAgICAgICdsaXN0X215X21hdGNoZXNfZnJvbV90cycsXG4gICAgICAgICAgICAgICAgJ2xpc3RfbXlfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9teV90cmFkc19mcm9tX3RzJyxcbiAgICAgICAgICAgICAgICAnbGlzdF9wYXltZW50X21ldGhvZHMnLFxuICAgICAgICAgICAgICAgICdsaXN0X3BheW1lbnRzJyxcbiAgICAgICAgICAgICAgICAncmVkZWVtX2NvZGUnLFxuICAgICAgICAgICAgICAgICdyZXNpZ24nLFxuICAgICAgICAgICAgICAgICdzaWduaW4nLFxuICAgICAgICAgICAgICAgICdzaWdub3V0JyxcbiAgICAgICAgICAgICAgICAndHJhZGVfZGV0YWlscycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX29wdGlvbnMnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2J5X2lkJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFBhaXJzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHByb2R1Y3RzKTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW2tleXNbcF1dO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnaWQnXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBwcm9kdWN0WyduYW1lJ107XG4gICAgICAgICAgICBsZXQgWyBiYXNlLCBxdW90ZSBdID0gc3ltYm9sLnNwbGl0ICgnLycpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXJzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXJzICgpO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1twWydpZCddXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydtYXgnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydtaW4nXSksXG4gICAgICAgICAgICAnYmlkJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Fzayc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2ZpcnN0J10pLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlc0RlcHRoICh7XG4gICAgICAgICAgICAncGFpcl9pZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlc0hpc3RvcnkgKHtcbiAgICAgICAgICAgICdwYWlyX2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBzaWduSW4gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFNpZ25pbiAoe1xuICAgICAgICAgICAgJ2xvZ2luJzogdGhpcy5sb2dpbixcbiAgICAgICAgICAgICdwYXNzd2QnOiB0aGlzLnBhc3N3b3JkLFxuICAgICAgICB9KTtcbiAgICB9LCAgICBcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAncGFpcl9pZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdkaXInOiAoc2lkZSA9PSAnYnV5JykgPyAnYmlkJyA6ICdhc2snLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0Q3JlYXRlVHJhZGUgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5ICh0aGlzLmV4dGVuZCAoeyAndG9rZW4nOiB0aGlzLmFwaUtleSB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdG1hcmtldCA9IHtcblxuICAgICdpZCc6ICdiaXRtYXJrZXQnLFxuICAgICduYW1lJzogJ0JpdE1hcmtldCcsXG4gICAgJ2NvdW50cmllcyc6IFsgJ1BMJywgJ0VVJywgXSxcbiAgICAncmF0ZUxpbWl0JzogMzAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NzI1Ni1hODU1NTIwMC01ZWY5LTExZTctOTZmZC00NjlhNjVlMmIwYmQuanBnJyxcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdwdWJsaWMnOiAnaHR0cHM6Ly93d3cuYml0bWFya2V0Lm5ldCcsXG4gICAgICAgICAgICAncHJpdmF0ZSc6ICdodHRwczovL3d3dy5iaXRtYXJrZXQucGwvYXBpMi8nLCAvLyBsYXN0IHNsYXNoIGlzIGNyaXRpY2FsXG4gICAgICAgIH0sXG4gICAgICAgICd3d3cnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cuYml0bWFya2V0LnBsJyxcbiAgICAgICAgICAgICdodHRwczovL3d3dy5iaXRtYXJrZXQubmV0JyxcbiAgICAgICAgXSxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3d3dy5iaXRtYXJrZXQubmV0L2RvY3MucGhwP2ZpbGU9YXBpX3B1YmxpYy5odG1sJyxcbiAgICAgICAgICAgICdodHRwczovL3d3dy5iaXRtYXJrZXQubmV0L2RvY3MucGhwP2ZpbGU9YXBpX3ByaXZhdGUuaHRtbCcsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL2JpdG1hcmtldC1uZXQvYXBpJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdqc29uL3ttYXJrZXR9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ2pzb24ve21hcmtldH0vb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAnanNvbi97bWFya2V0fS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdqc29uL2N0cmFuc2ZlcicsXG4gICAgICAgICAgICAgICAgJ2dyYXBocy97bWFya2V0fS85MG0nLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vNmgnLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vMWQnLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vN2QnLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vMW0nLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vM20nLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vNm0nLFxuICAgICAgICAgICAgICAgICdncmFwaHMve21hcmtldH0vMXknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnaW5mbycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzJyxcbiAgICAgICAgICAgICAgICAndHJhZGluZ2Rlc2snLFxuICAgICAgICAgICAgICAgICd0cmFkaW5nZGVza1N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ3RyYWRpbmdkZXNrQ29uZmlybScsXG4gICAgICAgICAgICAgICAgJ2NyeXB0b3RyYWRpbmdkZXNrJyxcbiAgICAgICAgICAgICAgICAnY3J5cHRvdHJhZGluZ2Rlc2tTdGF0dXMnLFxuICAgICAgICAgICAgICAgICdjcnlwdG90cmFkaW5nZGVza0NvbmZpcm0nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3RmlhdCcsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3UExOUFAnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd0ZpYXRGYXN0JyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdCcsXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyJyxcbiAgICAgICAgICAgICAgICAndHJhbnNmZXJzJyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luTGlzdCcsXG4gICAgICAgICAgICAgICAgJ21hcmdpbk9wZW4nLFxuICAgICAgICAgICAgICAgICdtYXJnaW5DbG9zZScsXG4gICAgICAgICAgICAgICAgJ21hcmdpbkNhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ21hcmdpbk1vZGlmeScsXG4gICAgICAgICAgICAgICAgJ21hcmdpbkJhbGFuY2VBZGQnLFxuICAgICAgICAgICAgICAgICdtYXJnaW5CYWxhbmNlUmVtb3ZlJyxcbiAgICAgICAgICAgICAgICAnc3dhcExpc3QnLFxuICAgICAgICAgICAgICAgICdzd2FwT3BlbicsXG4gICAgICAgICAgICAgICAgJ3N3YXBDbG9zZScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1BMTic6IHsgJ2lkJzogJ0JUQ1BMTicsICdzeW1ib2wnOiAnQlRDL1BMTicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdQTE4nIH0sXG4gICAgICAgICdCVEMvRVVSJzogeyAnaWQnOiAnQlRDRVVSJywgJ3N5bWJvbCc6ICdCVEMvRVVSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICAgICAgJ0xUQy9QTE4nOiB7ICdpZCc6ICdMVENQTE4nLCAnc3ltYm9sJzogJ0xUQy9QTE4nLCAnYmFzZSc6ICdMVEMnLCAncXVvdGUnOiAnUExOJyB9LFxuICAgICAgICAnTFRDL0JUQyc6IHsgJ2lkJzogJ0xUQ0JUQycsICdzeW1ib2wnOiAnTFRDL0JUQycsICdiYXNlJzogJ0xUQycsICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMTVgvQlRDJzogeyAnaWQnOiAnTGl0ZU1pbmVYQlRDJywgJ3N5bWJvbCc6ICdMTVgvQlRDJywgJ2Jhc2UnOiAnTE1YJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RJbmZvICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkgeyBcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0SnNvbk1hcmtldE9yZGVyYm9vayAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEpzb25NYXJrZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0SnNvbk1hcmtldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFRyYWRlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncmF0ZSc6IHByaWNlLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV07XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoICsgJy5qc29uJywgcGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICd0b25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdtZXRob2QnOiBwYXRoLFxuICAgICAgICAgICAgfSwgcGFyYW1zKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQVBJLUtleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdBUEktSGFzaCc6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBiaXRtZXggPSB7XG5cbiAgICAnaWQnOiAnYml0bWV4JyxcbiAgICAnbmFtZSc6ICdCaXRNRVgnLFxuICAgICdjb3VudHJpZXMnOiAnU0MnLCAvLyBTZXljaGVsbGVzXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MzE5LWY2NTNjNmU2LTVlZDQtMTFlNy05MzNkLWYwYmMzNjk5YWU4Zi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vd3d3LmJpdG1leC5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmJpdG1leC5jb20nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3LmJpdG1leC5jb20vYXBwL2FwaU92ZXJ2aWV3JyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vQml0TUVYL2FwaS1jb25uZWN0b3JzL3RyZWUvbWFzdGVyL29mZmljaWFsLWh0dHAnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2Fubm91bmNlbWVudCcsXG4gICAgICAgICAgICAgICAgJ2Fubm91bmNlbWVudC91cmdlbnQnLFxuICAgICAgICAgICAgICAgICdmdW5kaW5nJyxcbiAgICAgICAgICAgICAgICAnaW5zdHJ1bWVudCcsXG4gICAgICAgICAgICAgICAgJ2luc3RydW1lbnQvYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAnaW5zdHJ1bWVudC9hY3RpdmVBbmRJbmRpY2VzJyxcbiAgICAgICAgICAgICAgICAnaW5zdHJ1bWVudC9hY3RpdmVJbnRlcnZhbHMnLFxuICAgICAgICAgICAgICAgICdpbnN0cnVtZW50L2NvbXBvc2l0ZUluZGV4JyxcbiAgICAgICAgICAgICAgICAnaW5zdHJ1bWVudC9pbmRpY2VzJyxcbiAgICAgICAgICAgICAgICAnaW5zdXJhbmNlJyxcbiAgICAgICAgICAgICAgICAnbGVhZGVyYm9hcmQnLFxuICAgICAgICAgICAgICAgICdsaXF1aWRhdGlvbicsXG4gICAgICAgICAgICAgICAgJ29yZGVyQm9vaycsXG4gICAgICAgICAgICAgICAgJ29yZGVyQm9vay9MMicsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJyxcbiAgICAgICAgICAgICAgICAncXVvdGUvYnVja2V0ZWQnLFxuICAgICAgICAgICAgICAgICdzY2hlbWEnLFxuICAgICAgICAgICAgICAgICdzY2hlbWEvd2Vic29ja2V0SGVscCcsXG4gICAgICAgICAgICAgICAgJ3NldHRsZW1lbnQnLFxuICAgICAgICAgICAgICAgICdzdGF0cycsXG4gICAgICAgICAgICAgICAgJ3N0YXRzL2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICd0cmFkZScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlL2J1Y2tldGVkJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYXBpS2V5JyxcbiAgICAgICAgICAgICAgICAnY2hhdCcsXG4gICAgICAgICAgICAgICAgJ2NoYXQvY2hhbm5lbHMnLFxuICAgICAgICAgICAgICAgICdjaGF0L2Nvbm5lY3RlZCcsXG4gICAgICAgICAgICAgICAgJ2V4ZWN1dGlvbicsXG4gICAgICAgICAgICAgICAgJ2V4ZWN1dGlvbi90cmFkZUhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdub3RpZmljYXRpb24nLFxuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uJyxcbiAgICAgICAgICAgICAgICAndXNlcicsXG4gICAgICAgICAgICAgICAgJ3VzZXIvYWZmaWxpYXRlU3RhdHVzJyxcbiAgICAgICAgICAgICAgICAndXNlci9jaGVja1JlZmVycmFsQ29kZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvY29tbWlzc2lvbicsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZGVwb3NpdEFkZHJlc3MnLFxuICAgICAgICAgICAgICAgICd1c2VyL21hcmdpbicsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbWluV2l0aGRyYXdhbEZlZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXRIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXRTdW1tYXJ5JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYXBpS2V5JyxcbiAgICAgICAgICAgICAgICAnYXBpS2V5L2Rpc2FibGUnLFxuICAgICAgICAgICAgICAgICdhcGlLZXkvZW5hYmxlJyxcbiAgICAgICAgICAgICAgICAnY2hhdCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvYnVsaycsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NhbmNlbEFsbEFmdGVyJyxcbiAgICAgICAgICAgICAgICAnb3JkZXIvY2xvc2VQb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL2lzb2xhdGUnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbi9sZXZlcmFnZScsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL3Jpc2tMaW1pdCcsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL3RyYW5zZmVyTWFyZ2luJyxcbiAgICAgICAgICAgICAgICAndXNlci9jYW5jZWxXaXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAndXNlci9jb25maXJtRW1haWwnLFxuICAgICAgICAgICAgICAgICd1c2VyL2NvbmZpcm1FbmFibGVURkEnLFxuICAgICAgICAgICAgICAgICd1c2VyL2NvbmZpcm1XaXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAndXNlci9kaXNhYmxlVEZBJyxcbiAgICAgICAgICAgICAgICAndXNlci9sb2dvdXQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2xvZ291dEFsbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcHJlZmVyZW5jZXMnLFxuICAgICAgICAgICAgICAgICd1c2VyL3JlcXVlc3RFbmFibGVURkEnLFxuICAgICAgICAgICAgICAgICd1c2VyL3JlcXVlc3RXaXRoZHJhd2FsJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncHV0JzogW1xuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2J1bGsnLFxuICAgICAgICAgICAgICAgICd1c2VyJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICdhcGlLZXknLFxuICAgICAgICAgICAgICAgICdvcmRlcicsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2FsbCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9XG4gICAgfSwgXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRJbnN0cnVtZW50QWN0aXZlICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydzeW1ib2wnXTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gcHJvZHVjdFsndW5kZXJseWluZyddO1xuICAgICAgICAgICAgbGV0IHF1b3RlID0gcHJvZHVjdFsncXVvdGVDdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IGlzRnV0dXJlc0NvbnRyYWN0ID0gaWQgIT0gKGJhc2UgKyBxdW90ZSk7XG4gICAgICAgICAgICBiYXNlID0gdGhpcy5jb21tb25DdXJyZW5jeUNvZGUgKGJhc2UpO1xuICAgICAgICAgICAgcXVvdGUgPSB0aGlzLmNvbW1vbkN1cnJlbmN5Q29kZSAocXVvdGUpO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGlzRnV0dXJlc0NvbnRyYWN0ID8gaWQgOiAoYmFzZSArICcvJyArIHF1b3RlKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldFVzZXJNYXJnaW4gKHsgJ2N1cnJlbmN5JzogJ2FsbCcgfSk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVyQm9va0wyICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2JpblNpemUnOiAnMWQnLFxuICAgICAgICAgICAgJ3BhcnRpYWwnOiB0cnVlLFxuICAgICAgICAgICAgJ2NvdW50JzogMSxcbiAgICAgICAgICAgICdyZXZlcnNlJzogdHJ1ZSwgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHF1b3RlcyA9IGF3YWl0IHRoaXMucHVibGljR2V0UXVvdGVCdWNrZXRlZCAocmVxdWVzdCk7XG4gICAgICAgIGxldCBxdW90ZXNMZW5ndGggPSBxdW90ZXMubGVuZ3RoO1xuICAgICAgICBsZXQgcXVvdGUgPSBxdW90ZXNbcXVvdGVzTGVuZ3RoIC0gMV07XG4gICAgICAgIGxldCB0aWNrZXJzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUcmFkZUJ1Y2tldGVkIChyZXF1ZXN0KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHRpY2tlcnNbMF07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0IChxdW90ZVsnYmlkUHJpY2UnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAocXVvdGVbJ2Fza1ByaWNlJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnY2xvc2UnXSksXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hvbWVOb3Rpb25hbCddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnZm9yZWlnbk5vdGlvbmFsJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnc2lkZSc6IHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSksXG4gICAgICAgICAgICAnb3JkZXJRdHknOiBhbW91bnQsXG4gICAgICAgICAgICAnb3JkVHlwZSc6IHRoaXMuY2FwaXRhbGl6ZSAodHlwZSksXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncmF0ZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXIgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCBxdWVyeSA9ICcvYXBpLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgcXVlcnkgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgcXVlcnk7XG4gICAgICAgIGlmICh0eXBlID09ICdwcml2YXRlJykge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGlmIChtZXRob2QgPT0gJ1BPU1QnKVxuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocGFyYW1zKTtcbiAgICAgICAgICAgIGxldCByZXF1ZXN0ID0gWyBtZXRob2QsIHF1ZXJ5LCBub25jZSwgYm9keSB8fCAnJ10uam9pbiAoJycpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICdhcGktbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnYXBpLWtleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdhcGktc2lnbmF0dXJlJzogdGhpcy5obWFjIChyZXF1ZXN0LCB0aGlzLnNlY3JldCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgYml0c28gPSB7XG5cbiAgICAnaWQnOiAnYml0c28nLFxuICAgICduYW1lJzogJ0JpdHNvJyxcbiAgICAnY291bnRyaWVzJzogJ01YJywgLy8gTWV4aWNvXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsIC8vIDMwIHJlcXVlc3RzIHBlciBtaW51dGVcbiAgICAndmVyc2lvbic6ICd2MycsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYzMzUtNzE1Y2U3YWEtNWVkNS0xMWU3LTg4YTgtMTczYTI3YmIzMGZlLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkuYml0c28uY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2JpdHNvLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9iaXRzby5jb20vYXBpX2luZm8nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2F2YWlsYWJsZV9ib29rcycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ29yZGVyX2Jvb2snLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdhY2NvdW50X3N0YXR1cycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdmZWVzJyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZ3MnLFxuICAgICAgICAgICAgICAgICdmdW5kaW5ncy97ZmlkfScsXG4gICAgICAgICAgICAgICAgJ2Z1bmRpbmdfZGVzdGluYXRpb24nLFxuICAgICAgICAgICAgICAgICdreWNfZG9jdW1lbnRzJyxcbiAgICAgICAgICAgICAgICAnbGVkZ2VyJyxcbiAgICAgICAgICAgICAgICAnbGVkZ2VyL3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2xlZGdlci9mZWVzJyxcbiAgICAgICAgICAgICAgICAnbGVkZ2VyL2Z1bmRpbmdzJyxcbiAgICAgICAgICAgICAgICAnbGVkZ2VyL3dpdGhkcmF3YWxzJyxcbiAgICAgICAgICAgICAgICAnbXhfYmFua19jb2RlcycsXG4gICAgICAgICAgICAgICAgJ29wZW5fb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfdHJhZGVzL3tvaWR9JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3tvaWR9JyxcbiAgICAgICAgICAgICAgICAndXNlcl90cmFkZXMnLFxuICAgICAgICAgICAgICAgICd1c2VyX3RyYWRlcy97dGlkfScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzLycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzL3t3aWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYml0Y29pbl93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnZGViaXRfY2FyZF93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnZXRoZXJfd2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3Bob25lX251bWJlcicsXG4gICAgICAgICAgICAgICAgJ3Bob25lX3ZlcmlmaWNhdGlvbicsXG4gICAgICAgICAgICAgICAgJ3Bob25lX3dpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdzcGVpX3dpdGhkcmF3YWwnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ29yZGVycy97b2lkfScsXG4gICAgICAgICAgICAgICAgJ29yZGVycy9hbGwnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRBdmFpbGFibGVCb29rcyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzWydwYXlsb2FkJ10ubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3BheWxvYWQnXVtwXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ2Jvb2snXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBpZC50b1VwcGVyQ2FzZSAoKS5yZXBsYWNlICgnXycsICcvJyk7XG4gICAgICAgICAgICBsZXQgWyBiYXNlLCBxdW90ZSBdID0gc3ltYm9sLnNwbGl0ICgnLycpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHsgXG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVyQm9vayAoe1xuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoe1xuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3BheWxvYWQnXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMucGFyc2U4NjAxICh0aWNrZXJbJ2NyZWF0ZWRfYXQnXSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsndndhcCddKSxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICh7XG4gICAgICAgICAgICAnYm9vayc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnYm9vayc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICd0eXBlJzogdHlwZSxcbiAgICAgICAgICAgICdtYWpvcic6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXJzICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgcXVlcnkgPSAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgcXVlcnk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5IChwYXJhbXMpO1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGxldCByZXF1ZXN0ID0gWyBub25jZSwgbWV0aG9kLCBxdWVyeSwgYm9keSB8fCAnJyBdLmpvaW4gKCcnKTtcbiAgICAgICAgICAgIGxldCBzaWduYXR1cmUgPSB0aGlzLmhtYWMgKHJlcXVlc3QsIHRoaXMuc2VjcmV0KTtcbiAgICAgICAgICAgIGxldCBhdXRoID0gdGhpcy5hcGlLZXkgKyAnOicgKyBub25jZSArICc6JyArIHNpZ25hdHVyZTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdBdXRob3JpemF0aW9uJzogXCJCaXRzbyBcIiArIGF1dGggfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdHN0YW1wID0ge1xuXG4gICAgJ2lkJzogJ2JpdHN0YW1wJyxcbiAgICAnbmFtZSc6ICdCaXRzdGFtcCcsXG4gICAgJ2NvdW50cmllcyc6ICdHQicsXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjInLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3Nzg2Mzc3LThjOGFiNTdlLTVmZTktMTFlNy04ZWE0LTJiMDViNmJjY2VlYy5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vd3d3LmJpdHN0YW1wLm5ldC9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmJpdHN0YW1wLm5ldCcsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly93d3cuYml0c3RhbXAubmV0L2FwaScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXJfYm9vay97aWR9LycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcl9ob3VyL3tpZH0vJyxcbiAgICAgICAgICAgICAgICAndGlja2VyL3tpZH0vJyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zL3tpZH0vJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UvJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZS97aWR9LycsXG4gICAgICAgICAgICAgICAgJ2J1eS97aWR9LycsXG4gICAgICAgICAgICAgICAgJ2J1eS9tYXJrZXQve2lkfS8nLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXIvJyxcbiAgICAgICAgICAgICAgICAnbGlxdWlkYXRpb25fYWRkcmVzcy9pbmZvLycsXG4gICAgICAgICAgICAgICAgJ2xpcXVpZGF0aW9uX2FkZHJlc3MvbmV3LycsXG4gICAgICAgICAgICAgICAgJ29wZW5fb3JkZXJzL2FsbC8nLFxuICAgICAgICAgICAgICAgICdvcGVuX29yZGVycy97aWR9LycsXG4gICAgICAgICAgICAgICAgJ3NlbGwve2lkfS8nLFxuICAgICAgICAgICAgICAgICdzZWxsL21hcmtldC97aWR9LycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyLWZyb20tbWFpbi8nLFxuICAgICAgICAgICAgICAgICd0cmFuc2Zlci10by1tYWluLycsXG4gICAgICAgICAgICAgICAgJ3VzZXJfdHJhbnNhY3Rpb25zLycsXG4gICAgICAgICAgICAgICAgJ3VzZXJfdHJhbnNhY3Rpb25zL3tpZH0vJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbC9jYW5jZWwvJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbC9vcGVuLycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWwvc3RhdHVzLycsXG4gICAgICAgICAgICAgICAgJ3hycF9hZGRyZXNzLycsXG4gICAgICAgICAgICAgICAgJ3hycF93aXRoZHJhd2FsLycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ2J0Y3VzZCcsICdzeW1ib2wnOiAnQlRDL1VTRCcsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdCVEMvRVVSJzogeyAnaWQnOiAnYnRjZXVyJywgJ3N5bWJvbCc6ICdCVEMvRVVSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICAgICAgJ0VVUi9VU0QnOiB7ICdpZCc6ICdldXJ1c2QnLCAnc3ltYm9sJzogJ0VVUi9VU0QnLCAnYmFzZSc6ICdFVVInLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnWFJQL1VTRCc6IHsgJ2lkJzogJ3hycHVzZCcsICdzeW1ib2wnOiAnWFJQL1VTRCcsICdiYXNlJzogJ1hSUCcsICdxdW90ZSc6ICdVU0QnIH0sXG4gICAgICAgICdYUlAvRVVSJzogeyAnaWQnOiAneHJwZXVyJywgJ3N5bWJvbCc6ICdYUlAvRVVSJywgJ2Jhc2UnOiAnWFJQJywgJ3F1b3RlJzogJ0VVUicgfSxcbiAgICAgICAgJ1hSUC9CVEMnOiB7ICdpZCc6ICd4cnBidGMnLCAnc3ltYm9sJzogJ1hSUC9CVEMnLCAnYmFzZSc6ICdYUlAnLCAncXVvdGUnOiAnQlRDJyB9LFxuICAgIH0sXG4gICAgXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0T3JkZXJCb29rSWQgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlcklkICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKHRpY2tlclsndGltZXN0YW1wJ10pICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWyd2d2FwJ10pLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhbnNhY3Rpb25zSWQgKHsgXG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlUG9zdCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0JylcbiAgICAgICAgICAgIG1ldGhvZCArPSAnTWFya2V0JztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgbWV0aG9kICs9ICdJZCc7XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgbGV0IGF1dGggPSBub25jZSArIHRoaXMudWlkICsgdGhpcy5hcGlLZXk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5obWFjIChhdXRoLCB0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdzaWduYXR1cmUnOiBzaWduYXR1cmUudG9VcHBlckNhc2UgKCksXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBxdWVyeSk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJpdHRyZXggPSB7XG5cbiAgICAnaWQnOiAnYml0dHJleCcsXG4gICAgJ25hbWUnOiAnQml0dHJleCcsXG4gICAgJ2NvdW50cmllcyc6ICdVUycsXG4gICAgJ3ZlcnNpb24nOiAndjEuMScsXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYzNTItY2YwYjNjMjYtNWVkNS0xMWU3LTgyYjctZjM4MjZiN2E5N2Q4LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9iaXR0cmV4LmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vYml0dHJleC5jb20nLFxuICAgICAgICAnZG9jJzogWyBcbiAgICAgICAgICAgICdodHRwczovL2JpdHRyZXguY29tL0hvbWUvQXBpJyxcbiAgICAgICAgICAgICdodHRwczovL3d3dy5ucG1qcy5vcmcvcGFja2FnZS9ub2RlLmJpdHRyZXguYXBpJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdjdXJyZW5jaWVzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0aGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ21hcmtldHMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzdW1tYXJpZXMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzdW1tYXJ5JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJywgICAgICAgICAgICBcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdhY2NvdW50Jzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdGFkZHJlc3MnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0aGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbGhpc3RvcnknLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAnbWFya2V0Jzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYnV5bGltaXQnLFxuICAgICAgICAgICAgICAgICdidXltYXJrZXQnLFxuICAgICAgICAgICAgICAgICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgICdvcGVub3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnc2VsbGxpbWl0JyxcbiAgICAgICAgICAgICAgICAnc2VsbG1hcmtldCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRNYXJrZXRzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ3Jlc3VsdCddLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWydyZXN1bHQnXVtwXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ01hcmtldE5hbWUnXTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gcHJvZHVjdFsnQmFzZUN1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydNYXJrZXRDdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWNjb3VudEdldEJhbGFuY2VzICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAndHlwZSc6ICdib3RoJyxcbiAgICAgICAgICAgICdkZXB0aCc6IDUwLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRNYXJrZXRzdW1tYXJ5ICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydyZXN1bHQnXVswXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMucGFyc2U4NjAxICh0aWNrZXJbJ1RpbWVTdGFtcCddKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnSGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ0xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ0JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ0FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnTGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ1ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRNYXJrZXRoaXN0b3J5ICh7IFxuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ21hcmtldEdldCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpICsgdHlwZTtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdxdWFudGl0eSc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydyYXRlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLyc7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gdHlwZSArICcvJyArIG1ldGhvZC50b0xvd2VyQ2FzZSAoKSArIHBhdGg7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICB1cmwgKz0gdHlwZSArICcvJztcbiAgICAgICAgICAgIGlmICgoKHR5cGUgPT0gJ2FjY291bnQnKSAmJiAocGF0aCAhPSAnd2l0aGRyYXcnKSkgfHwgKHBhdGggPT0gJ29wZW5vcmRlcnMnKSlcbiAgICAgICAgICAgICAgICB1cmwgKz0gbWV0aG9kLnRvTG93ZXJDYXNlICgpO1xuICAgICAgICAgICAgdXJsICs9IHBhdGggKyAnPycgKyB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgICAgICAnYXBpa2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdhcGlzaWduJzogdGhpcy5obWFjICh1cmwsIHRoaXMuc2VjcmV0LCAnc2hhNTEyJykgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJ0Y2NoaW5hID0ge1xuXG4gICAgJ2lkJzogJ2J0Y2NoaW5hJyxcbiAgICAnbmFtZSc6ICdCVENDaGluYScsXG4gICAgJ2NvdW50cmllcyc6ICdDTicsXG4gICAgJ3JhdGVMaW1pdCc6IDMwMDAsXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2MzY4LTQ2NWIzMjg2LTVlZDYtMTFlNy05YTExLTBmNjQ2N2UxZDgyYi5qcGcnLFxuICAgICAgICAnYXBpJzoge1xuICAgICAgICAgICAgJ3B1YmxpYyc6ICdodHRwczovL2RhdGEuYnRjY2hpbmEuY29tL2RhdGEnLFxuICAgICAgICAgICAgJ3ByaXZhdGUnOiAnaHR0cHM6Ly9hcGkuYnRjY2hpbmEuY29tL2FwaV90cmFkZV92MS5waHAnLFxuICAgICAgICB9LFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmJ0Y2NoaW5hLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly93d3cuYnRjY2hpbmEuY29tL2FwaWRvY3MnXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnaGlzdG9yeWRhdGEnLFxuICAgICAgICAgICAgICAgICdvcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnQnV5SWNlYmVyZ09yZGVyJyxcbiAgICAgICAgICAgICAgICAnQnV5T3JkZXInLFxuICAgICAgICAgICAgICAgICdCdXlPcmRlcjInLFxuICAgICAgICAgICAgICAgICdCdXlTdG9wT3JkZXInLFxuICAgICAgICAgICAgICAgICdDYW5jZWxJY2ViZXJnT3JkZXInLFxuICAgICAgICAgICAgICAgICdDYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0NhbmNlbFN0b3BPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0dldEFjY291bnRJbmZvJyxcbiAgICAgICAgICAgICAgICAnZ2V0QXJjaGl2ZWRPcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldEFyY2hpdmVkT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnR2V0RGVwb3NpdHMnLFxuICAgICAgICAgICAgICAgICdHZXRJY2ViZXJnT3JkZXInLFxuICAgICAgICAgICAgICAgICdHZXRJY2ViZXJnT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnR2V0TWFya2V0RGVwdGgnLFxuICAgICAgICAgICAgICAgICdHZXRNYXJrZXREZXB0aDInLFxuICAgICAgICAgICAgICAgICdHZXRPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0dldE9yZGVycycsXG4gICAgICAgICAgICAgICAgJ0dldFN0b3BPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0dldFN0b3BPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdHZXRUcmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICdHZXRXaXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnR2V0V2l0aGRyYXdhbHMnLFxuICAgICAgICAgICAgICAgICdSZXF1ZXN0V2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgJ1NlbGxJY2ViZXJnT3JkZXInLFxuICAgICAgICAgICAgICAgICdTZWxsT3JkZXInLFxuICAgICAgICAgICAgICAgICdTZWxsT3JkZXIyJyxcbiAgICAgICAgICAgICAgICAnU2VsbFN0b3BPcmRlcicsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiAnYWxsJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAocHJvZHVjdHMpO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IGtleXMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW3BdO1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1trZXldO1xuICAgICAgICAgICAgbGV0IHBhcnRzID0ga2V5LnNwbGl0ICgnXycpO1xuICAgICAgICAgICAgbGV0IGlkID0gcGFydHNbMV07XG4gICAgICAgICAgICBsZXQgYmFzZSA9IGlkLnNsaWNlICgwLCAzKTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IGlkLnNsaWNlICgzLCA2KTtcbiAgICAgICAgICAgIGJhc2UgPSBiYXNlLnRvVXBwZXJDYXNlICgpO1xuICAgICAgICAgICAgcXVvdGUgPSBxdW90ZS50b1VwcGVyQ2FzZSAoKTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0R2V0QWNjb3VudEluZm8gKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVyYm9vayAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHRpY2tlcnMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1sndGlja2VyJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ2RhdGUnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsncHJldl9jbG9zZSddKSxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ21hcmtldCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVBvc3QnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKSArICdPcmRlcjInO1xuICAgICAgICBsZXQgb3JkZXIgPSB7fTtcbiAgICAgICAgbGV0IGlkID0gcFsnaWQnXS50b1VwcGVyQ2FzZSAoKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHtcbiAgICAgICAgICAgIG9yZGVyWydwYXJhbXMnXSA9IFsgdW5kZWZpbmVkLCBhbW91bnQsIGlkIF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcmRlclsncGFyYW1zJ10gPSBbIHByaWNlLCBhbW91bnQsIGlkIF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgbm9uY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5taWNyb3NlY29uZHMgKCk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddW3R5cGVdICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocGFyYW1zKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHAgPSBbXTtcbiAgICAgICAgICAgIGlmICgncGFyYW1zJyBpbiBwYXJhbXMpXG4gICAgICAgICAgICAgICAgcCA9IHBhcmFtc1sncGFyYW1zJ107XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAgICAgJ21ldGhvZCc6IHBhdGgsXG4gICAgICAgICAgICAgICAgJ2lkJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ3BhcmFtcyc6IHAsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcCA9IHAuam9pbiAoJywnKTtcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocmVxdWVzdCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSAoXG4gICAgICAgICAgICAgICAgJ3RvbmNlPScgKyBub25jZSArXG4gICAgICAgICAgICAgICAgJyZhY2Nlc3NrZXk9JyArIHRoaXMuYXBpS2V5ICtcbiAgICAgICAgICAgICAgICAnJnJlcXVlc3RtZXRob2Q9JyArIG1ldGhvZC50b0xvd2VyQ2FzZSAoKSArXG4gICAgICAgICAgICAgICAgJyZpZD0nICsgbm9uY2UgK1xuICAgICAgICAgICAgICAgICcmbWV0aG9kPScgKyBwYXRoICtcbiAgICAgICAgICAgICAgICAnJnBhcmFtcz0nICsgcFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGxldCBzaWduYXR1cmUgPSB0aGlzLmhtYWMgKHF1ZXJ5LCB0aGlzLnNlY3JldCwgJ3NoYTEnKTtcbiAgICAgICAgICAgIGxldCBhdXRoID0gdGhpcy5hcGlLZXkgKyAnOicgKyBzaWduYXR1cmU7IFxuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAnQXV0aG9yaXphdGlvbic6ICdCYXNpYyAnICsgdGhpcy5zdHJpbmdUb0Jhc2U2NCAocXVlcnkpLFxuICAgICAgICAgICAgICAgICdKc29uLVJwYy1Ub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGJ0Y3ggPSB7XG5cbiAgICAnaWQnOiAnYnRjeCcsXG4gICAgJ25hbWUnOiAnQlRDWCcsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0lTJywgJ1VTJywgJ0VVJywgXSxcbiAgICAncmF0ZUxpbWl0JzogMzAwMCwgLy8gc3VwcG9ydCBpbiBlbmdsaXNoIGlzIHZlcnkgcG9vciwgdW5hYmxlIHRvIHRlbGwgcmF0ZSBsaW1pdHNcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjYzODUtOWZkY2M5OGMtNWVkNi0xMWU3LThmMTQtNjZkNWU1Y2Q0N2U2LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9idGMteC5pcy9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vYnRjLXguaXMnLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vYnRjLXguaXMvY3VzdG9tL2FwaS1kb2N1bWVudC5odG1sJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdkZXB0aC97aWR9L3tsaW1pdH0nLFxuICAgICAgICAgICAgICAgICd0aWNrZXIve2lkfScsICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ3RyYWRlL3tpZH0ve2xpbWl0fScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAncmVkZWVtJyxcbiAgICAgICAgICAgICAgICAndHJhZGUnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhdycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL1VTRCc6IHsgJ2lkJzogJ2J0Yy91c2QnLCAnc3ltYm9sJzogJ0JUQy9VU0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnVVNEJyB9LFxuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ2J0Yy9ldXInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7IFxuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldERlcHRoSWRMaW1pdCAoeyBcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdsaW1pdCc6IDEwMDAsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkgeyBcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VySWQgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3RpbWUnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydidXknXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydzZWxsJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlSWRMaW1pdCAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2xpbWl0JzogMTAwLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0VHJhZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAndHlwZSc6IHNpZGUudG9VcHBlckNhc2UgKCksXG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLyc7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICB1cmwgKz0gdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIHVybCArPSB0eXBlO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdNZXRob2QnOiBwYXRoLnRvVXBwZXJDYXNlICgpLFxuICAgICAgICAgICAgICAgICdOb25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1NpZ25hdHVyZSc6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBieGludGggPSB7XG5cbiAgICAnaWQnOiAnYnhpbnRoJyxcbiAgICAnbmFtZSc6ICdCWC5pbi50aCcsXG4gICAgJ2NvdW50cmllcyc6ICdUSCcsIC8vIFRoYWlsYW5kXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY0MTItNTY3YjFlYjQtNWVkNy0xMWU3LTk0YTgtZmY2YTM4ODRmNmM1LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9ieC5pbi50aC9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vYnguaW4udGgnLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vYnguaW4udGgvaW5mby9hcGknLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJycsIC8vIHRpY2tlclxuICAgICAgICAgICAgICAgICdvcHRpb25zJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uYm9vaycsXG4gICAgICAgICAgICAgICAgJ29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ3BhaXJpbmcnLFxuICAgICAgICAgICAgICAgICd0cmFkZScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlaGlzdG9yeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnYmlsbGVyJyxcbiAgICAgICAgICAgICAgICAnYmlsbGdyb3VwJyxcbiAgICAgICAgICAgICAgICAnYmlsbHBheScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXQnLFxuICAgICAgICAgICAgICAgICdnZXRvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLWlzc3VlJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLWJpZCcsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1zZWxsJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLW15aXNzdWUnLFxuICAgICAgICAgICAgICAgICdvcHRpb24tbXliaWQnLFxuICAgICAgICAgICAgICAgICdvcHRpb24tbXlvcHRpb25zJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLWV4ZXJjaXNlJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9uLWNhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ29wdGlvbi1oaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnb3JkZXInLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbC1oaXN0b3J5JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFBhaXJpbmcgKCk7XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMgKHByb2R1Y3RzKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IGtleXMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNba2V5c1twXV07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydwYWlyaW5nX2lkJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ3ByaW1hcnlfY3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ3NlY29uZGFyeV9jdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRPcmRlcmJvb2sgKHtcbiAgICAgICAgICAgICdwYWlyaW5nJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VycyA9IGF3YWl0IHRoaXMucHVibGljR2V0ICh7ICdwYWlyaW5nJzogcFsnaWQnXSB9KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHRpY2tlcnNbcFsnaWQnXV07XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsb3cnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydvcmRlcmJvb2snXVsnYmlkcyddWydoaWdoYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3JkZXJib29rJ11bJ2Fza3MnXVsnaGlnaGJpZCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdF9wcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2NoYW5nZSddKSxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lXzI0aG91cnMnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGUgKHtcbiAgICAgICAgICAgICdwYWlyaW5nJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXIgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAncGFpcmluZyc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncmF0ZSc6IHByaWNlLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyBwYXRoICsgJy8nO1xuICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHJpdmF0ZScpIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5oYXNoICh0aGlzLmFwaUtleSArIG5vbmNlICsgdGhpcy5zZWNyZXQsICdzaGEyNTYnKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ3NpZ25hdHVyZSc6IHNpZ25hdHVyZSxcbiAgICAgICAgICAgICAgICAvLyB0d29mYTogdGhpcy50d29mYSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgY2NleCA9IHtcblxuICAgICdpZCc6ICdjY2V4JyxcbiAgICAnbmFtZSc6ICdDLUNFWCcsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0RFJywgJ0VVJywgXSxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjQzMy0xNjg4MWY5MC01ZWQ4LTExZTctOTJmOC0zZDkyY2M3NDdhNmMuanBnJyxcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICd0aWNrZXJzJzogJ2h0dHBzOi8vYy1jZXguY29tL3QnLFxuICAgICAgICAgICAgJ3B1YmxpYyc6ICdodHRwczovL2MtY2V4LmNvbS90L2FwaV9wdWIuaHRtbCcsXG4gICAgICAgICAgICAncHJpdmF0ZSc6ICdodHRwczovL2MtY2V4LmNvbS90L2FwaS5odG1sJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2MtY2V4LmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9jLWNleC5jb20vP2lkPWFwaScsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAndGlja2Vycyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2NvaW5uYW1lcycsXG4gICAgICAgICAgICAgICAgJ3ttYXJrZXR9JyxcbiAgICAgICAgICAgICAgICAncGFpcnMnLFxuICAgICAgICAgICAgICAgICdwcmljZXMnLFxuICAgICAgICAgICAgICAgICd2b2x1bWVfe2NvaW59JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogWyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnYmFsYW5jZWRpc3RyaWJ1dGlvbicsXG4gICAgICAgICAgICAgICAgJ21hcmtldGhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzJyxcbiAgICAgICAgICAgICAgICAnbWFya2V0c3VtbWFyaWVzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzogeyAgICAgICAgICAgIFxuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnYnV5bGltaXQnLFxuICAgICAgICAgICAgICAgICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgICdnZXRiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnZ2V0YmFsYW5jZXMnLCAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnZ2V0b3Blbm9yZGVycycsXG4gICAgICAgICAgICAgICAgJ2dldG9yZGVyJyxcbiAgICAgICAgICAgICAgICAnZ2V0b3JkZXJoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnbXl0cmFkZXMnLFxuICAgICAgICAgICAgICAgICdzZWxsbGltaXQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0TWFya2V0cyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzWydyZXN1bHQnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sncmVzdWx0J11bcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydNYXJrZXROYW1lJ107XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ01hcmtldEN1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydCYXNlQ3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRCYWxhbmNlcyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0T3JkZXJib29rICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiAnYm90aCcsXG4gICAgICAgICAgICAnZGVwdGgnOiAxMDAsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnRpY2tlcnNHZXRNYXJrZXQgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCkudG9Mb3dlckNhc2UgKCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3RpY2tlciddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd1cGRhdGVkJ10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdHByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2F2ZyddKSxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydidXlzdXBwb3J0J10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE1hcmtldGhpc3RvcnkgKHtcbiAgICAgICAgICAgICdtYXJrZXQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAndHlwZSc6ICdib3RoJyxcbiAgICAgICAgICAgICdkZXB0aCc6IDEwMCxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVHZXQnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKSArIHR5cGU7XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnbWFya2V0JzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3F1YW50aXR5JzogYW1vdW50LFxuICAgICAgICAgICAgJ3JhdGUnOiBwcmljZSxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddW3R5cGVdO1xuICAgICAgICBpZiAodHlwZSA9PSAncHJpdmF0ZScpIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmtleXNvcnQgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ2EnOiBwYXRoLFxuICAgICAgICAgICAgICAgICdhcGlrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnYXBpc2lnbic6IHRoaXMuaG1hYyAodXJsLCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpIH07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdhJzogJ2dldCcgKyBwYXRoLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpICsgJy5qc29uJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIGNleCA9IHtcblxuICAgICdpZCc6ICdjZXgnLFxuICAgICduYW1lJzogJ0NFWC5JTycsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0dCJywgJ0VVJywgJ0NZJywgJ1JVJywgXSxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjQ0Mi04ZGRjMzNiMC01ZWQ4LTExZTctOGI5OC1mNzg2YWVmMGYzYzkuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2NleC5pby9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vY2V4LmlvJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2NleC5pby9jZXgtYXBpJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdjdXJyZW5jeV9saW1pdHMnLFxuICAgICAgICAgICAgICAgICdsYXN0X3ByaWNlL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2xhc3RfcHJpY2VzL3tjdXJyZW5jaWVzfScsXG4gICAgICAgICAgICAgICAgJ29obGN2L2hkL3t5eXl5bW1kZH0ve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfYm9vay97cGFpcn0nLFxuICAgICAgICAgICAgICAgICd0aWNrZXIve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAndGlja2Vycy97Y3VycmVuY2llc30nLFxuICAgICAgICAgICAgICAgICd0cmFkZV9oaXN0b3J5L3twYWlyfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2NvbnZlcnQve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAncHJpY2Vfc3RhdHMve3BhaXJ9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2FjdGl2ZV9vcmRlcnNfc3RhdHVzLycsXG4gICAgICAgICAgICAgICAgJ2FyY2hpdmVkX29yZGVycy97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdiYWxhbmNlLycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlci8nLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXJzL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9yZXBsYWNlX29yZGVyL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2Nsb3NlX3Bvc2l0aW9uL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2dldF9hZGRyZXNzLycsXG4gICAgICAgICAgICAgICAgJ2dldF9teWZlZS8nLFxuICAgICAgICAgICAgICAgICdnZXRfb3JkZXIvJyxcbiAgICAgICAgICAgICAgICAnZ2V0X29yZGVyX3R4LycsXG4gICAgICAgICAgICAgICAgJ29wZW5fb3JkZXJzL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ29wZW5fb3JkZXJzLycsXG4gICAgICAgICAgICAgICAgJ29wZW5fcG9zaXRpb24ve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnb3Blbl9wb3NpdGlvbnMve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAncGxhY2Vfb3JkZXIve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAncGxhY2Vfb3JkZXIve3BhaXJ9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0Q3VycmVuY3lMaW1pdHMgKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwcm9kdWN0c1snZGF0YSddWydwYWlycyddLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWydkYXRhJ11bJ3BhaXJzJ11bcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydzeW1ib2wxJ10gKyAnLycgKyBwcm9kdWN0WydzeW1ib2wyJ107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gaWQ7XG4gICAgICAgICAgICBsZXQgWyBiYXNlLCBxdW90ZSBdID0gc3ltYm9sLnNwbGl0ICgnLycpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVyQm9va1BhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyUGFpciAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyc2VJbnQgKHRpY2tlclsndGltZXN0YW1wJ10pICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2NoYW5nZSddKSxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlSGlzdG9yeVBhaXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCwgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9yZGVyWydvcmRlcl90eXBlJ10gPSB0eXBlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFBsYWNlT3JkZXJQYWlyICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykgeyAgIFxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ3NpZ25hdHVyZSc6IHRoaXMuaG1hYyAobm9uY2UgKyB0aGlzLnVpZCArIHRoaXMuYXBpS2V5LCB0aGlzLnNlY3JldCkudG9VcHBlckNhc2UgKCksXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICB9LCBxdWVyeSkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgY29pbmNoZWNrID0ge1xuXG4gICAgJ2lkJzogJ2NvaW5jaGVjaycsXG4gICAgJ25hbWUnOiAnY29pbmNoZWNrJyxcbiAgICAnY291bnRyaWVzJzogWyAnSlAnLCAnSUQnLCBdLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NDY0LTNiNWMzYzc0LTVlZDktMTFlNy04NDBlLTMxYjMyOTY4ZTFkYS5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vY29pbmNoZWNrLmNvbS9hcGknLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vY29pbmNoZWNrLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9jb2luY2hlY2suY29tL2RvY3VtZW50cy9leGNoYW5nZS9hcGknLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL29yZGVycy9yYXRlJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfYm9va3MnLFxuICAgICAgICAgICAgICAgICdyYXRlL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMvYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL2xldmVyYWdlX2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdiYW5rX2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdF9tb25leScsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL29yZGVycy9vcGVucycsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL29yZGVycy90cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9vcmRlcnMvdHJhbnNhY3Rpb25zX3BhZ2luYXRpb24nLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9sZXZlcmFnZS9wb3NpdGlvbnMnLFxuICAgICAgICAgICAgICAgICdsZW5kaW5nL2JvcnJvd3MvbWF0Y2hlcycsXG4gICAgICAgICAgICAgICAgJ3NlbmRfbW9uZXknLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd3MnLFxuICAgICAgICAgICAgXSwgICAgICAgICAgICBcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYW5rX2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnZGVwb3NpdF9tb25leS97aWR9L2Zhc3QnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS90cmFuc2ZlcnMvdG9fbGV2ZXJhZ2UnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS90cmFuc2ZlcnMvZnJvbV9sZXZlcmFnZScsXG4gICAgICAgICAgICAgICAgJ2xlbmRpbmcvYm9ycm93cycsXG4gICAgICAgICAgICAgICAgJ2xlbmRpbmcvYm9ycm93cy97aWR9L3JlcGF5JyxcbiAgICAgICAgICAgICAgICAnc2VuZF9tb25leScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3cycsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlbGV0ZSc6IFtcbiAgICAgICAgICAgICAgICAnYmFua19hY2NvdW50cy97aWR9JyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2Uvb3JkZXJzL3tpZH0nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd3Mve2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ3Byb2R1Y3RzJzoge1xuICAgICAgICAnQlRDL0pQWSc6ICB7ICdpZCc6ICdidGNfanB5JywgICdzeW1ib2wnOiAnQlRDL0pQWScsICAnYmFzZSc6ICdCVEMnLCAgJ3F1b3RlJzogJ0pQWScgfSwgLy8gdGhlIG9ubHkgcmVhbCBwYWlyXG4gICAgICAgICdFVEgvSlBZJzogIHsgJ2lkJzogJ2V0aF9qcHknLCAgJ3N5bWJvbCc6ICdFVEgvSlBZJywgICdiYXNlJzogJ0VUSCcsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnRVRDL0pQWSc6ICB7ICdpZCc6ICdldGNfanB5JywgICdzeW1ib2wnOiAnRVRDL0pQWScsICAnYmFzZSc6ICdFVEMnLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ0RBTy9KUFknOiAgeyAnaWQnOiAnZGFvX2pweScsICAnc3ltYm9sJzogJ0RBTy9KUFknLCAgJ2Jhc2UnOiAnREFPJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdMU0svSlBZJzogIHsgJ2lkJzogJ2xza19qcHknLCAgJ3N5bWJvbCc6ICdMU0svSlBZJywgICdiYXNlJzogJ0xTSycsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnRkNUL0pQWSc6ICB7ICdpZCc6ICdmY3RfanB5JywgICdzeW1ib2wnOiAnRkNUL0pQWScsICAnYmFzZSc6ICdGQ1QnLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ1hNUi9KUFknOiAgeyAnaWQnOiAneG1yX2pweScsICAnc3ltYm9sJzogJ1hNUi9KUFknLCAgJ2Jhc2UnOiAnWE1SJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdSRVAvSlBZJzogIHsgJ2lkJzogJ3JlcF9qcHknLCAgJ3N5bWJvbCc6ICdSRVAvSlBZJywgICdiYXNlJzogJ1JFUCcsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnWFJQL0pQWSc6ICB7ICdpZCc6ICd4cnBfanB5JywgICdzeW1ib2wnOiAnWFJQL0pQWScsICAnYmFzZSc6ICdYUlAnLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ1pFQy9KUFknOiAgeyAnaWQnOiAnemVjX2pweScsICAnc3ltYm9sJzogJ1pFQy9KUFknLCAgJ2Jhc2UnOiAnWkVDJywgICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdYRU0vSlBZJzogIHsgJ2lkJzogJ3hlbV9qcHknLCAgJ3N5bWJvbCc6ICdYRU0vSlBZJywgICdiYXNlJzogJ1hFTScsICAncXVvdGUnOiAnSlBZJyB9LFxuICAgICAgICAnTFRDL0pQWSc6ICB7ICdpZCc6ICdsdGNfanB5JywgICdzeW1ib2wnOiAnTFRDL0pQWScsICAnYmFzZSc6ICdMVEMnLCAgJ3F1b3RlJzogJ0pQWScgfSxcbiAgICAgICAgJ0RBU0gvSlBZJzogeyAnaWQnOiAnZGFzaF9qcHknLCAnc3ltYm9sJzogJ0RBU0gvSlBZJywgJ2Jhc2UnOiAnREFTSCcsICdxdW90ZSc6ICdKUFknIH0sXG4gICAgICAgICdFVEgvQlRDJzogIHsgJ2lkJzogJ2V0aF9idGMnLCAgJ3N5bWJvbCc6ICdFVEgvQlRDJywgICdiYXNlJzogJ0VUSCcsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnRVRDL0JUQyc6ICB7ICdpZCc6ICdldGNfYnRjJywgICdzeW1ib2wnOiAnRVRDL0JUQycsICAnYmFzZSc6ICdFVEMnLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0xTSy9CVEMnOiAgeyAnaWQnOiAnbHNrX2J0YycsICAnc3ltYm9sJzogJ0xTSy9CVEMnLCAgJ2Jhc2UnOiAnTFNLJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdGQ1QvQlRDJzogIHsgJ2lkJzogJ2ZjdF9idGMnLCAgJ3N5bWJvbCc6ICdGQ1QvQlRDJywgICdiYXNlJzogJ0ZDVCcsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnWE1SL0JUQyc6ICB7ICdpZCc6ICd4bXJfYnRjJywgICdzeW1ib2wnOiAnWE1SL0JUQycsICAnYmFzZSc6ICdYTVInLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ1JFUC9CVEMnOiAgeyAnaWQnOiAncmVwX2J0YycsICAnc3ltYm9sJzogJ1JFUC9CVEMnLCAgJ2Jhc2UnOiAnUkVQJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdYUlAvQlRDJzogIHsgJ2lkJzogJ3hycF9idGMnLCAgJ3N5bWJvbCc6ICdYUlAvQlRDJywgICdiYXNlJzogJ1hSUCcsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnWkVDL0JUQyc6ICB7ICdpZCc6ICd6ZWNfYnRjJywgICdzeW1ib2wnOiAnWkVDL0JUQycsICAnYmFzZSc6ICdaRUMnLCAgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ1hFTS9CVEMnOiAgeyAnaWQnOiAneGVtX2J0YycsICAnc3ltYm9sJzogJ1hFTS9CVEMnLCAgJ2Jhc2UnOiAnWEVNJywgICdxdW90ZSc6ICdCVEMnIH0sXG4gICAgICAgICdMVEMvQlRDJzogIHsgJ2lkJzogJ2x0Y19idGMnLCAgJ3N5bWJvbCc6ICdMVEMvQlRDJywgICdiYXNlJzogJ0xUQycsICAncXVvdGUnOiAnQlRDJyB9LFxuICAgICAgICAnREFTSC9CVEMnOiB7ICdpZCc6ICdkYXNoX2J0YycsICdzeW1ib2wnOiAnREFTSC9CVEMnLCAnYmFzZSc6ICdEQVNIJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEFjY291bnRzQmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0T3JkZXJCb29rcyAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICgpO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd0aW1lc3RhbXAnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICgpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IHByZWZpeCA9ICcnO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHtcbiAgICAgICAgICAgIGxldCBvcmRlcl90eXBlID0gdHlwZSArICdfJyArIHNpZGU7XG4gICAgICAgICAgICBvcmRlclsnb3JkZXJfdHlwZSddID0gb3JkZXJfdHlwZTtcbiAgICAgICAgICAgIGxldCBwcmVmaXggPSAoc2lkZSA9PSBidXkpID8gKG9yZGVyX3R5cGUgKyAnXycpIDogJyc7XG4gICAgICAgICAgICBvcmRlcltwcmVmaXggKyAnYW1vdW50J10gPSBhbW91bnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcmRlclsnb3JkZXJfdHlwZSddID0gc2lkZTtcbiAgICAgICAgICAgIG9yZGVyWydyYXRlJ10gPSBwcmljZTtcbiAgICAgICAgICAgIG9yZGVyWydhbW91bnQnXSA9IGFtb3VudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEV4Y2hhbmdlT3JkZXJzICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKS50b1N0cmluZyAoKTtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMua2V5c29ydCAocXVlcnkpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdBQ0NFU1MtS0VZJzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ0FDQ0VTUy1OT05DRSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdBQ0NFU1MtU0lHTkFUVVJFJzogdGhpcy5obWFjIChub25jZSArIHVybCArIChib2R5IHx8ICcnKSwgdGhpcy5zZWNyZXQpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgY29pbm1hdGUgPSB7XG4gICAgXG4gICAgJ2lkJzogJ2NvaW5tYXRlJyxcbiAgICAnbmFtZSc6ICdDb2luTWF0ZScsXG4gICAgJ2NvdW50cmllcyc6IFsgJ0dCJywgJ0NaJyBdLCAvLyBVSywgQ3plY2ggUmVwdWJsaWNcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzgxMTIyOS1jMWVmYjUxMC02MDZjLTExZTctOWEzNi04NGJhMmNlNDEyZDguanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2NvaW5tYXRlLmlvL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly9jb2lubWF0ZS5pbycsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9jb2lubWF0ZS5pby9kZXZlbG9wZXJzJyxcbiAgICAgICAgICAgICdodHRwOi8vZG9jcy5jb2lubWF0ZS5hcGlhcnkuaW8vI3JlZmVyZW5jZScsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXJCb29rJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAnYml0Y29pbldpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdiaXRjb2luRGVwb3NpdEFkZHJlc3NlcycsXG4gICAgICAgICAgICAgICAgJ2J1eUluc3RhbnQnLFxuICAgICAgICAgICAgICAgICdidXlMaW1pdCcsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsT3JkZXJXaXRoSW5mbycsXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZVZvdWNoZXInLFxuICAgICAgICAgICAgICAgICdvcGVuT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAncmVkZWVtVm91Y2hlcicsXG4gICAgICAgICAgICAgICAgJ3NlbGxJbnN0YW50JyxcbiAgICAgICAgICAgICAgICAnc2VsbExpbWl0JyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25IaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAndW5jb25maXJtZWRCaXRjb2luRGVwb3NpdHMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdCVENfRVVSJywgJ3N5bWJvbCc6ICdCVEMvRVVSJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0VVUicgIH0sXG4gICAgICAgICdCVEMvQ1pLJzogeyAnaWQnOiAnQlRDX0NaSycsICdzeW1ib2wnOiAnQlRDL0NaSycsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdDWksnICB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2VzICgpO1xuICAgIH0sXG4gICAgXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0T3JkZXJCb29rICh7XG4gICAgICAgICAgICAnY3VycmVuY3lQYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2dyb3VwQnlQcmljZUxpbWl0JzogJ0ZhbHNlJyxcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoe1xuICAgICAgICAgICAgJ2N1cnJlbmN5UGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsnZGF0YSddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd0aW1lc3RhbXAnXSAqIDEwMDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWydhbW91bnQnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhbnNhY3Rpb25zICh7XG4gICAgICAgICAgICAnY3VycmVuY3lQYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ21pbnV0ZXNJbnRvSGlzdG9yeSc6IDEwLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVBvc3QnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKTtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2N1cnJlbmN5UGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHtcbiAgICAgICAgICAgIGlmIChzaWRlID09ICdidXknKVxuICAgICAgICAgICAgICAgIG9yZGVyWyd0b3RhbCddID0gYW1vdW50OyAvLyBhbW91bnQgaW4gZmlhdFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9yZGVyWydhbW91bnQnXSA9IGFtb3VudDsgLy8gYW1vdW50IGluIGZpYXRcbiAgICAgICAgICAgIG1ldGhvZCArPSAnSW5zdGFudCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcmRlclsnYW1vdW50J10gPSBhbW91bnQ7IC8vIGFtb3VudCBpbiBjcnlwdG9cbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgICAgICBtZXRob2QgKz0gdGhpcy5jYXBpdGFsaXplICh0eXBlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdIChzZWxmLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHBhdGg7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBsZXQgYXV0aCA9IFsgbm9uY2UsIHRoaXMudWlkLCB0aGlzLmFwaUtleSBdLmpvaW4gKCcgJyk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5obWFjIChhdXRoLCB0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ2NsaWVudElkJzogdGhpcy51aWQsXG4gICAgICAgICAgICAgICAgJ25vbmNlJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ3B1YmxpY0tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdzaWduYXR1cmUnOiBzaWduYXR1cmUudG9VcHBlckNhc2UgKCksXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBjb2luc2VjdXJlID0ge1xuXG4gICAgJ2lkJzogJ2NvaW5zZWN1cmUnLFxuICAgICduYW1lJzogJ0NvaW5zZWN1cmUnLFxuICAgICdjb3VudHJpZXMnOiAnSU4nLCAvLyBJbmRpYVxuICAgICdyYXRlTGltaXQnOiAxMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjQ3Mi05Y2JkMjAwYS01ZWQ5LTExZTctOTU1MS0yMjY3YWQ3YmFjMDguanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5jb2luc2VjdXJlLmluJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2NvaW5zZWN1cmUuaW4nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vYXBpLmNvaW5zZWN1cmUuaW4nLFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9jb2luc2VjdXJlL3BsdWdpbnMnLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JpdGNvaW4vc2VhcmNoL2NvbmZpcm1hdGlvbi97dHhpZH0nLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9hc2svbG93JyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvYXNrL29yZGVycycsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL2JpZC9oaWdoJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvYmlkL29yZGVycycsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL2xhc3RUcmFkZScsXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlL21heDI0SHInLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZS9taW4yNEhyJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvdGlja2VyJyxcbiAgICAgICAgICAgICAgICAnZXhjaGFuZ2UvdHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnbWZhL2F1dGh5L2NhbGwnLFxuICAgICAgICAgICAgICAgICdtZmEvYXV0aHkvc21zJywgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnbmV0a2kvc2VhcmNoL3tuZXRraU5hbWV9JyxcbiAgICAgICAgICAgICAgICAndXNlci9iYW5rL290cC97bnVtYmVyfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIva3ljL290cC97bnVtYmVyfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcHJvZmlsZS9waG9uZS9vdHAve251bWJlcn0nLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL2FkZHJlc3Mve2lkfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vZGVwb3NpdC9jb25maXJtZWQvYWxsJyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi9kZXBvc2l0L2NvbmZpcm1lZC97aWR9JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi9kZXBvc2l0L3VuY29uZmlybWVkL2FsbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vZGVwb3NpdC91bmNvbmZpcm1lZC97aWR9JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi93YWxsZXRzJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9iYWxhbmNlL2F2YWlsYWJsZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2JhbGFuY2UvcGVuZGluZycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2JhbGFuY2UvdG90YWwnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9kZXBvc2l0L2NhbmNlbGxlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2RlcG9zaXQvdW52ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L2RlcG9zaXQvdmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC93aXRoZHJhdy9jYW5jZWxsZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC93aXRoZHJhdy9jb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC93aXRoZHJhdy91bnZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvdmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2Fzay9jYW5jZWxsZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2Fzay9jb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2Fzay9wZW5kaW5nJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iaWQvY2FuY2VsbGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iaWQvY29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iaWQvcGVuZGluZycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL2FkZHJlc3NlcycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL2JhbGFuY2UvYXZhaWxhYmxlJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vYmFsYW5jZS9wZW5kaW5nJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vYmFsYW5jZS90b3RhbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL2RlcG9zaXQvY2FuY2VsbGVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vZGVwb3NpdC91bnZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vZGVwb3NpdC92ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL3dpdGhkcmF3L2NhbmNlbGxlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL3dpdGhkcmF3L2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9jb2luL3dpdGhkcmF3L3VudmVyaWZpZWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy92ZXJpZmllZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9zdW1tYXJ5JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9jb2luL2ZlZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvZmlhdC9mZWUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2t5Y3MnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL3JlZmVycmFsL2NvaW4vcGFpZCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvcmVmZXJyYWwvY29pbi9zdWNjZXNzZnVsJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9yZWZlcnJhbC9maWF0L3BhaWQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL3JlZmVycmFscycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvdHJhZGUvc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbG9naW4vdG9rZW4ve3Rva2VufScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L3N1bW1hcnknLFxuICAgICAgICAgICAgICAgICd3YWxsZXQvY29pbi93aXRoZHJhdy9jYW5jZWxsZWQnLFxuICAgICAgICAgICAgICAgICd3YWxsZXQvY29pbi93aXRoZHJhdy9jb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgICd3YWxsZXQvY29pbi93aXRoZHJhdy91bnZlcmlmaWVkJyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0L2NvaW4vd2l0aGRyYXcvdmVyaWZpZWQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdsb2dpbicsXG4gICAgICAgICAgICAgICAgJ2xvZ2luL2luaXRpYXRlJyxcbiAgICAgICAgICAgICAgICAnbG9naW4vcGFzc3dvcmQvZm9yZ290JyxcbiAgICAgICAgICAgICAgICAnbWZhL2F1dGh5L2luaXRpYXRlJyxcbiAgICAgICAgICAgICAgICAnbWZhL2dhL2luaXRpYXRlJyxcbiAgICAgICAgICAgICAgICAnc2lnbnVwJyxcbiAgICAgICAgICAgICAgICAndXNlci9uZXRraS91cGRhdGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL3Byb2ZpbGUvaW1hZ2UvdXBkYXRlJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2NvaW4vd2l0aGRyYXcvaW5pdGlhdGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy9uZXdWZXJpZnljb2RlJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvaW5pdGlhdGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC93aXRoZHJhdy9uZXdWZXJpZnljb2RlJyxcbiAgICAgICAgICAgICAgICAndXNlci9wYXNzd29yZC9jaGFuZ2UnLFxuICAgICAgICAgICAgICAgICd1c2VyL3Bhc3N3b3JkL3Jlc2V0JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi93aXRoZHJhdy9pbml0aWF0ZScsXG4gICAgICAgICAgICAgICAgJ3dhbGxldC9jb2luL3dpdGhkcmF3L25ld1ZlcmlmeWNvZGUnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwdXQnOiBbXG4gICAgICAgICAgICAgICAgJ3NpZ251cC92ZXJpZnkve3Rva2VufScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2Uva3ljJyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvZGVwb3NpdC9uZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2Fzay9uZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JpZC9uZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2luc3RhbnQvYnV5JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9pbnN0YW50L3NlbGwnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy92ZXJpZnknLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9hY2NvdW50L25ldycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYmFuay9maWF0L3dpdGhkcmF3L3ZlcmlmeScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbWZhL2F1dGh5L2luaXRpYXRlL2VuYWJsZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbWZhL2dhL2luaXRpYXRlL2VuYWJsZScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvbmV0a2kvY3JlYXRlJyxcbiAgICAgICAgICAgICAgICAndXNlci9wcm9maWxlL3Bob25lL25ldycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vYWRkcmVzcy9uZXcnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL25ldycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvd2FsbGV0L2NvaW4vd2l0aGRyYXcvc2VuZFRvRXhjaGFuZ2UnLFxuICAgICAgICAgICAgICAgICd1c2VyL3dhbGxldC9jb2luL3dpdGhkcmF3L3ZlcmlmeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlbGV0ZSc6IFtcbiAgICAgICAgICAgICAgICAndXNlci9nY20ve2NvZGV9JyxcbiAgICAgICAgICAgICAgICAndXNlci9sb2dvdXQnLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvY29pbi93aXRoZHJhdy91bnZlcmlmaWVkL2NhbmNlbC97d2l0aGRyYXdJRH0nLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JhbmsvZmlhdC9kZXBvc2l0L2NhbmNlbC97ZGVwb3NpdElEfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvZXhjaGFuZ2UvYXNrL2NhbmNlbC97b3JkZXJJRH0nLFxuICAgICAgICAgICAgICAgICd1c2VyL2V4Y2hhbmdlL2JpZC9jYW5jZWwve29yZGVySUR9JyxcbiAgICAgICAgICAgICAgICAndXNlci9leGNoYW5nZS9iYW5rL2ZpYXQvd2l0aGRyYXcvdW52ZXJpZmllZC9jYW5jZWwve3dpdGhkcmF3SUR9JyxcbiAgICAgICAgICAgICAgICAndXNlci9tZmEvYXV0aHkvZGlzYWJsZS97Y29kZX0nLFxuICAgICAgICAgICAgICAgICd1c2VyL21mYS9nYS9kaXNhYmxlL3tjb2RlfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcHJvZmlsZS9waG9uZS9kZWxldGUnLFxuICAgICAgICAgICAgICAgICd1c2VyL3Byb2ZpbGUvaW1hZ2UvZGVsZXRlL3tuZXRraU5hbWV9JyxcbiAgICAgICAgICAgICAgICAndXNlci93YWxsZXQvY29pbi93aXRoZHJhdy91bnZlcmlmaWVkL2NhbmNlbC97d2l0aGRyYXdJRH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9JTlInOiB7ICdpZCc6ICdCVEMvSU5SJywgJ3N5bWJvbCc6ICdCVEMvSU5SJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0lOUicgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldFVzZXJFeGNoYW5nZUJhbmtTdW1tYXJ5ICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkgeyBcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RXhjaGFuZ2VBc2tPcmRlcnMgKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0RXhjaGFuZ2VUaWNrZXIgKCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsnbWVzc2FnZSddO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGlja2VyWyd0aW1lc3RhbXAnXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdFByaWNlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnY29pbnZvbHVtZSddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnZmlhdHZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRFeGNoYW5nZVRyYWRlcyAoKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVB1dFVzZXJFeGNoYW5nZSc7XG4gICAgICAgIGxldCBvcmRlciA9IHt9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0JykgeyAgICAgICBcbiAgICAgICAgICAgIG1ldGhvZCArPSAnSW5zdGFudCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpO1xuICAgICAgICAgICAgaWYgKHNpZGUgPT0gJ2J1eScpXG4gICAgICAgICAgICAgICAgb3JkZXJbJ21heEZpYXQnXSA9IGFtb3VudDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvcmRlclsnbWF4Vm9sJ10gPSBhbW91bnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgZGlyZWN0aW9uID0gKHNpZGUgPT0gJ2J1eScpID8gJ0JpZCcgOiAnQXNrJztcbiAgICAgICAgICAgIG1ldGhvZCArPSBkaXJlY3Rpb24gKyAnTmV3JztcbiAgICAgICAgICAgIG9yZGVyWydyYXRlJ10gPSBwcmljZTtcbiAgICAgICAgICAgIG9yZGVyWyd2b2wnXSA9IGFtb3VudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdIChzZWxmLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHJpdmF0ZScpIHtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdBdXRob3JpemF0aW9uJzogdGhpcy5hcGlLZXkgfTtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgZXhtbyA9IHtcblxuICAgICdpZCc6ICdleG1vJyxcbiAgICAnbmFtZSc6ICdFWE1PJyxcbiAgICAnY291bnRyaWVzJzogWyAnRVMnLCAnUlUnLCBdLCAvLyBTcGFpbiwgUnVzc2lhXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsIC8vIG9uY2UgZXZlcnkgMzUwIG1zIOKJiCAxODAgcmVxdWVzdHMgcGVyIG1pbnV0ZSDiiYggMyByZXF1ZXN0cyBwZXIgc2Vjb25kXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NDkxLTFiMGVhOTU2LTVlZGEtMTFlNy05MjI1LTQwZDY3YjQ4MWI4ZC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLmV4bW8uY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL2V4bW8ubWUnLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vZXhtby5tZS9ydS9hcGlfZG9jJyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vZXhtby1kZXYvZXhtb19hcGlfbGliL3RyZWUvbWFzdGVyL25vZGVqcycsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnY3VycmVuY3knLFxuICAgICAgICAgICAgICAgICdvcmRlcl9ib29rJyxcbiAgICAgICAgICAgICAgICAncGFpcl9zZXR0aW5ncycsXG4gICAgICAgICAgICAgICAgJ3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICd1c2VyX2luZm8nLFxuICAgICAgICAgICAgICAgICdvcmRlcl9jcmVhdGUnLFxuICAgICAgICAgICAgICAgICdvcmRlcl9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICd1c2VyX29wZW5fb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAndXNlcl90cmFkZXMnLFxuICAgICAgICAgICAgICAgICd1c2VyX2NhbmNlbGxlZF9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdvcmRlcl90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdyZXF1aXJlZF9hbW91bnQnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0X2FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd19jcnlwdCcsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2dldF90eGlkJyxcbiAgICAgICAgICAgICAgICAnZXhjb2RlX2NyZWF0ZScsXG4gICAgICAgICAgICAgICAgJ2V4Y29kZV9sb2FkJyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0X2hpc3RvcnknLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0UGFpclNldHRpbmdzICgpO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0cyk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgaWQgPSBrZXlzW3BdO1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1tpZF07XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gaWQucmVwbGFjZSAoJ18nLCAnLycpO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RVc2VySW5mbyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0T3JkZXJCb29rICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICgpO1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVtwWydpZCddXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndXBkYXRlZCddICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eV9wcmljZSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGxfcHJpY2UnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3RfdHJhZGUnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXZnJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sX2N1cnInXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhZGVzICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgcHJlZml4ID0gJyc7XG4gICAgICAgIGlmICh0eXBlID09J21hcmtldCcpXG4gICAgICAgICAgICBwcmVmaXggPSAnbWFya2V0Xyc7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3F1YW50aXR5JzogYW1vdW50LFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UgfHwgMCxcbiAgICAgICAgICAgICd0eXBlJzogcHJlZml4ICsgc2lkZSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RPcmRlckNyZWF0ZSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoeyAnbm9uY2UnOiBub25jZSB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGJvZHkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdLZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnU2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBmeWIgPSB7XG5cbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndGlja2VyZGV0YWlsZWQnLFxuICAgICAgICAgICAgICAgICdvcmRlcmJvb2snLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAndGVzdCcsXG4gICAgICAgICAgICAgICAgJ2dldGFjY2luZm8nLFxuICAgICAgICAgICAgICAgICdnZXRwZW5kaW5nb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZ2V0b3JkZXJoaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnY2FuY2VscGVuZGluZ29yZGVyJyxcbiAgICAgICAgICAgICAgICAncGxhY2VvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0R2V0YWNjaW5mbyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0T3JkZXJib29rICgpO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXJkZXRhaWxlZCAoKTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xvdyc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXMgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFBsYWNlb3JkZXIgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAncXR5JzogYW1vdW50LFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UsXG4gICAgICAgICAgICAndHlwZSc6IHNpZGVbMF0udG9VcHBlckNhc2UgKClcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgcGF0aDtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHsgICAgICAgICAgIFxuICAgICAgICAgICAgdXJsICs9ICcuanNvbic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoeyAndGltZXN0YW1wJzogbm9uY2UgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAna2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ3NpZyc6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGExJylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBmeWJzZSA9IGV4dGVuZCAoZnliLCB7XG4gICAgJ2lkJzogJ2Z5YnNlJyxcbiAgICAnbmFtZSc6ICdGWUItU0UnLFxuICAgICdjb3VudHJpZXMnOiAnU0UnLCAvLyBTd2VkZW5cbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjUxMi0zMTAxOTc3Mi01ZWRiLTExZTctODI0MS0yZTY3NWU2Nzk3ZjEuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5meWJzZS5zZS9hcGkvU0VLJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5meWJzZS5zZScsXG4gICAgICAgICdkb2MnOiAnaHR0cDovL2RvY3MuZnliLmFwaWFyeS5pbycsXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvU0VLJzogeyAnaWQnOiAnU0VLJywgJ3N5bWJvbCc6ICdCVEMvU0VLJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1NFSycgfSxcbiAgICB9LFxufSlcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgZnlic2cgPSBleHRlbmQgKGZ5Yiwge1xuICAgICdpZCc6ICdmeWJzZycsXG4gICAgJ25hbWUnOiAnRllCLVNHJyxcbiAgICAnY291bnRyaWVzJzogJ1NHJywgLy8gU2luZ2Fwb3JlXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY1MTMtMzM2NGQ1NmEtNWVkYi0xMWU3LTllNmItZDU4OThiYjg5YzgxLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly93d3cuZnlic2cuY29tL2FwaS9TR0QnLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmZ5YnNnLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cDovL2RvY3MuZnliLmFwaWFyeS5pbycsXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvU0dEJzogeyAnaWQnOiAnU0dEJywgJ3N5bWJvbCc6ICdCVEMvU0dEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1NHRCcgfSxcbiAgICB9LFxufSlcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgZ2RheCA9IHtcbiAgICAnaWQnOiAnZ2RheCcsXG4gICAgJ25hbWUnOiAnR0RBWCcsXG4gICAgJ2NvdW50cmllcyc6ICdVUycsXG4gICAgJ3JhdGVMaW1pdCc6IDEwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY1MjctYjFiZTQxYzYtNWVkYi0xMWU3LTk1ZjYtNWI0OTZjNDY5ZTJjLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkuZ2RheC5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LmdkYXguY29tJyxcbiAgICAgICAgJ2RvYyc6ICdodHRwczovL2RvY3MuZ2RheC5jb20nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2N1cnJlbmNpZXMnLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cycsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzL3tpZH0vYm9vaycsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzL3tpZH0vY2FuZGxlcycsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzL3tpZH0vc3RhdHMnLFxuICAgICAgICAgICAgICAgICdwcm9kdWN0cy97aWR9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzL3tpZH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAndGltZScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMve2lkfScsXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL3tpZH0vaG9sZHMnLFxuICAgICAgICAgICAgICAgICdhY2NvdW50cy97aWR9L2xlZGdlcicsXG4gICAgICAgICAgICAgICAgJ2NvaW5iYXNlLWFjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnZmlsbHMnLFxuICAgICAgICAgICAgICAgICdmdW5kaW5nJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3tpZH0nLFxuICAgICAgICAgICAgICAgICdwYXltZW50LW1ldGhvZHMnLFxuICAgICAgICAgICAgICAgICdwb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgJ3JlcG9ydHMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3VzZXJzL3NlbGYvdHJhaWxpbmctdm9sdW1lJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnZGVwb3NpdHMvY29pbmJhc2UtYWNjb3VudCcsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRzL3BheW1lbnQtbWV0aG9kJyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZy9yZXBheScsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3Bvc2l0aW9uL2Nsb3NlJyxcbiAgICAgICAgICAgICAgICAncHJvZmlsZXMvbWFyZ2luLXRyYW5zZmVyJyxcbiAgICAgICAgICAgICAgICAncmVwb3J0cycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzL2NvaW5iYXNlJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMvY3J5cHRvJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMvcGF5bWVudC1tZXRob2QnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICAgICAgJ29yZGVycy97aWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFByb2R1Y3RzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydpZCddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0WydiYXNlX2N1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydxdW90ZV9jdXJyZW5jeSddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTsgICAgICAgICAgICBcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEFjY291bnRzICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRQcm9kdWN0c0lkQm9vayAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQcm9kdWN0c0lkVGlja2VyICh7XG4gICAgICAgICAgICAnaWQnOiBwWydpZCddLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHF1b3RlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRQcm9kdWN0c0lkU3RhdHMgKHtcbiAgICAgICAgICAgICdpZCc6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5wYXJzZTg2MDEgKHRpY2tlclsndGltZSddKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHF1b3RlWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHF1b3RlWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAocXVvdGVbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHF1b3RlWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFByb2R1Y3RzSWRUcmFkZXMgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2NsaWVudF9vaWQnOiB0aGlzLm5vbmNlICgpLFxuICAgICAgICAgICAgJ3Byb2R1Y3RfaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnc2lkZSc6IHNpZGUsXG4gICAgICAgICAgICAnc2l6ZSc6IGFtb3VudCxcbiAgICAgICAgICAgICd0eXBlJzogdHlwZSwgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0T3JkZXIgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCByZXF1ZXN0ID0gJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHJlcXVlc3Q7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5IChxdWVyeSk7XG4gICAgICAgICAgICBsZXQgd2hhdCA9IG5vbmNlICsgbWV0aG9kICsgcmVxdWVzdCArIChib2R5IHx8ICcnKTtcbiAgICAgICAgICAgIGxldCBzZWNyZXQgPSB0aGlzLmJhc2U2NFRvQmluYXJ5ICh0aGlzLnNlY3JldCk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5oYXNoICh3aGF0LCBzZWNyZXQsICdzaGEyNTYnLCAnYmluYXJ5Jyk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDQi1BQ0NFU1MtS0VZJzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ0NCLUFDQ0VTUy1TSUdOJzogdGhpcy5zdHJpbmdUb0Jhc2U2NCAoc2lnbmF0dXJlKSxcbiAgICAgICAgICAgICAgICAnQ0ItQUNDRVNTLVRJTUVTVEFNUCc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdDQi1BQ0NFU1MtUEFTU1BIUkFTRSc6IHRoaXMucGFzc3dvcmQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVEJEIFJFUVVJUkVTIDJGQSBWSUEgQVVUSFksIEEgQkFOSyBBQ0NPVU5ULCBJREVOVElUWSBWRVJJRklDQVRJT04gVE8gU1RBUlRcblxudmFyIGdlbWluaSA9IHtcbiAgICAnaWQnOiAnZ2VtaW5pJyxcbiAgICAnbmFtZSc6ICdHZW1pbmknLFxuICAgICdjb3VudHJpZXMnOiAnVVMnLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLCAvLyAyMDAgZm9yIHByaXZhdGUgQVBJXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3ODE2ODU3LWNlN2JlNjQ0LTYwOTYtMTFlNy04MmQ2LTNjMjU3MjYzMjI5Yy5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLmdlbWluaS5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vZ2VtaW5pLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9kb2NzLmdlbWluaS5jb20vcmVzdC1hcGknLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3N5bWJvbHMnLFxuICAgICAgICAgICAgICAgICdwdWJ0aWNrZXIve3N5bWJvbH0nLFxuICAgICAgICAgICAgICAgICdib29rL3tzeW1ib2x9JyxcbiAgICAgICAgICAgICAgICAndHJhZGVzL3tzeW1ib2x9JyxcbiAgICAgICAgICAgICAgICAnYXVjdGlvbi97c3ltYm9sfScsXG4gICAgICAgICAgICAgICAgJ2F1Y3Rpb24ve3N5bWJvbH0vaGlzdG9yeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdvcmRlci9uZXcnLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwnLFxuICAgICAgICAgICAgICAgICdvcmRlci9jYW5jZWwvc2Vzc2lvbicsXG4gICAgICAgICAgICAgICAgJ29yZGVyL2NhbmNlbC9hbGwnLFxuICAgICAgICAgICAgICAgICdvcmRlci9zdGF0dXMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdteXRyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3RyYWRldm9sdW1lJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdkZXBvc2l0L3tjdXJyZW5jeX0vbmV3QWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3L3tjdXJyZW5jeX0nLFxuICAgICAgICAgICAgICAgICdoZWFydGJlYXQnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0U3ltYm9scyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdDtcbiAgICAgICAgICAgIGxldCB1cHBlcmNhc2VQcm9kdWN0ID0gcHJvZHVjdC50b1VwcGVyQ2FzZSAoKTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gdXBwZXJjYXNlUHJvZHVjdC5zbGljZSAoMCwgMyk7XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSB1cHBlcmNhc2VQcm9kdWN0LnNsaWNlICgzLCA2KTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0Qm9va1N5bWJvbCAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wcm9kdWN0IChwcm9kdWN0KTtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0UHVidGlja2VyU3ltYm9sICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogcFsnaWQnXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ3ZvbHVtZSddWyd0aW1lc3RhbXAnXTtcbiAgICAgICAgbGV0IGJhc2VWb2x1bWUgPSBwWydiYXNlJ107XG4gICAgICAgIGxldCBxdW90ZVZvbHVtZSA9IHBbJ3F1b3RlJ107XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbG93JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0J10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ11bYmFzZVZvbHVtZV0pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXVtxdW90ZVZvbHVtZV0pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlc1N5bWJvbCAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QmFsYW5jZXMgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0JylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAodGhpcy5pZCArICcgYWxsb3dzIGxpbWl0IG9yZGVycyBvbmx5Jyk7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdjbGllbnRfb3JkZXJfaWQnOiB0aGlzLm5vbmNlICgpLFxuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQudG9TdHJpbmcgKCksXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZS50b1N0cmluZyAoKSxcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICd0eXBlJzogJ2V4Y2hhbmdlIGxpbWl0JywgLy8gZ2VtaW5pIGFsbG93cyBsaW1pdCBvcmRlcnMgb25seVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVyTmV3ICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdyZXF1ZXN0JzogdXJsLFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcXVlcnkpO1xuICAgICAgICAgICAgbGV0IHBheWxvYWQgPSB0aGlzLnN0cmluZ1RvQmFzZTY0IChKU09OLnN0cmluZ2lmeSAocmVxdWVzdCkpO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaG1hYyAocGF5bG9hZCwgdGhpcy5zZWNyZXQsICdzaGEzODQnKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L3BsYWluJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiAwLFxuICAgICAgICAgICAgICAgICdYLUdFTUlOSS1BUElLRVknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnWC1HRU1JTkktUEFZTE9BRCc6IHBheWxvYWQsXG4gICAgICAgICAgICAgICAgJ1gtR0VNSU5JLVNJR05BVFVSRSc6IHNpZ25hdHVyZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gdGhpcy51cmxzWydhcGknXSArIHVybDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBoaXRidGMgPSB7XG5cbiAgICAnaWQnOiAnaGl0YnRjJyxcbiAgICAnbmFtZSc6ICdIaXRCVEMnLFxuICAgICdjb3VudHJpZXMnOiAnSEsnLCAvLyBIb25nIEtvbmdcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndmVyc2lvbic6ICcxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjU1NS04ZWFlYzIwZS01ZWRjLTExZTctOWM1Yi02ZGM2OWZjNDJmNWUuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwOi8vYXBpLmhpdGJ0Yy5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vaGl0YnRjLmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9oaXRidGMuY29tL2FwaScsXG4gICAgICAgICAgICAnaHR0cDovL2hpdGJ0Yy1jb20uZ2l0aHViLmlvL2hpdGJ0Yy1hcGknLFxuICAgICAgICAgICAgJ2h0dHA6Ly9qc2ZpZGRsZS5uZXQvYm1rbmlnaHQvUnFiWUInLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3tzeW1ib2x9L29yZGVyYm9vaycsXG4gICAgICAgICAgICAgICAgJ3tzeW1ib2x9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3tzeW1ib2x9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3tzeW1ib2x9L3RyYWRlcy9yZWNlbnQnLFxuICAgICAgICAgICAgICAgICdzeW1ib2xzJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndGltZSwnXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAndHJhZGluZyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMvYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3JlY2VudCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzL2J5L29yZGVyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnbmV3X29yZGVyJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVyJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVycycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncGF5bWVudCc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdhZGRyZXNzL3tjdXJyZW5jeX0nLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMve3RyYW5zYWN0aW9ufScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyX3RvX3RyYWRpbmcnLFxuICAgICAgICAgICAgICAgICd0cmFuc2Zlcl90b19tYWluJyxcbiAgICAgICAgICAgICAgICAnYWRkcmVzcy97Y3VycmVuY3l9JyxcbiAgICAgICAgICAgICAgICAncGF5b3V0JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0U3ltYm9scyAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzWydzeW1ib2xzJ10ubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3N5bWJvbHMnXVtwXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHByb2R1Y3RbJ3N5bWJvbCddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0Wydjb21tb2RpdHknXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ2N1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFkaW5nR2V0QmFsYW5jZSAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0U3ltYm9sT3JkZXJib29rICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0U3ltYm9sVGlja2VyICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndGltZXN0YW1wJ107XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2hpZ2gnXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3cnXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydiaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydhc2snXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZV9xdW90ZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRTeW1ib2xUcmFkZXMgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2NsaWVudE9yZGVySWQnOiB0aGlzLm5vbmNlICgpLFxuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdzaWRlJzogc2lkZSxcbiAgICAgICAgICAgICdxdWFudGl0eSc6IGFtb3VudCxcbiAgICAgICAgICAgICd0eXBlJzogdHlwZSwgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYWRpbmdQb3N0TmV3T3JkZXIgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSAnL2FwaS8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdHlwZSArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKTtcbiAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5vbWl0IChwYXJhbXMsIHRoaXMuZXh0cmFjdFBhcmFtcyAocGF0aCkpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgJ25vbmNlJzogbm9uY2UsICdhcGlrZXknOiB0aGlzLmFwaUtleSB9LCBxdWVyeSk7XG4gICAgICAgICAgICBpZiAobWV0aG9kID09ICdQT1NUJylcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ1gtU2lnbmF0dXJlJzogdGhpcy5obWFjICh1cmwgKyAoYm9keSB8fCAnJyksIHRoaXMuc2VjcmV0LCAnc2hhNTEyJykudG9Mb3dlckNhc2UgKCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyB1cmw7XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgaHVvYmkgPSB7XG5cbiAgICAnaWQnOiAnaHVvYmknLFxuICAgICduYW1lJzogJ0h1b2JpJyxcbiAgICAnY291bnRyaWVzJzogJ0NOJyxcbiAgICAncmF0ZUxpbWl0JzogNTAwMCxcbiAgICAndmVyc2lvbic6ICd2MycsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY1NjktMTVhYTdiOWEtNWVkZC0xMWU3LTllN2YtNDQ3OTFmNGVlNDljLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cDovL2FwaS5odW9iaS5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3Lmh1b2JpLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9naXRodWIuY29tL2h1b2JpYXBpL0FQSV9Eb2NzX2VuL3dpa2knLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3N0YXRpY21hcmtldCc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3tpZH1fa2xpbmVfe3BlcmlvZH0nLFxuICAgICAgICAgICAgICAgICd0aWNrZXJfe2lkfScsXG4gICAgICAgICAgICAgICAgJ2RlcHRoX3tpZH0nLFxuICAgICAgICAgICAgICAgICdkZXB0aF97aWR9X3tsZW5ndGh9JyxcbiAgICAgICAgICAgICAgICAnZGV0YWlsX3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3VzZG1hcmtldCc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3tpZH1fa2xpbmVfe3BlcmlvZH0nLFxuICAgICAgICAgICAgICAgICd0aWNrZXJfe2lkfScsXG4gICAgICAgICAgICAgICAgJ2RlcHRoX3tpZH0nLFxuICAgICAgICAgICAgICAgICdkZXB0aF97aWR9X3tsZW5ndGh9JyxcbiAgICAgICAgICAgICAgICAnZGV0YWlsX3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3RyYWRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2dldF9hY2NvdW50X2luZm8nLFxuICAgICAgICAgICAgICAgICdnZXRfb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJfaW5mbycsXG4gICAgICAgICAgICAgICAgJ2J1eScsXG4gICAgICAgICAgICAgICAgJ3NlbGwnLFxuICAgICAgICAgICAgICAgICdidXlfbWFya2V0JyxcbiAgICAgICAgICAgICAgICAnc2VsbF9tYXJrZXQnLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXInLFxuICAgICAgICAgICAgICAgICdnZXRfbmV3X2RlYWxfb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZ2V0X29yZGVyX2lkX2J5X3RyYWRlX2lkJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdfY29pbicsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF93aXRoZHJhd19jb2luJyxcbiAgICAgICAgICAgICAgICAnZ2V0X3dpdGhkcmF3X2NvaW5fcmVzdWx0JyxcbiAgICAgICAgICAgICAgICAndHJhbnNmZXInLFxuICAgICAgICAgICAgICAgICdsb2FuJyxcbiAgICAgICAgICAgICAgICAncmVwYXltZW50JyxcbiAgICAgICAgICAgICAgICAnZ2V0X2xvYW5fYXZhaWxhYmxlJyxcbiAgICAgICAgICAgICAgICAnZ2V0X2xvYW5zJyxcbiAgICAgICAgICAgIF0sICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvQ05ZJzogeyAnaWQnOiAnYnRjJywgJ3N5bWJvbCc6ICdCVEMvQ05ZJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NOWScsICd0eXBlJzogJ3N0YXRpY21hcmtldCcsICdjb2luVHlwZSc6IDEsIH0sXG4gICAgICAgICdMVEMvQ05ZJzogeyAnaWQnOiAnbHRjJywgJ3N5bWJvbCc6ICdMVEMvQ05ZJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0NOWScsICd0eXBlJzogJ3N0YXRpY21hcmtldCcsICdjb2luVHlwZSc6IDIsIH0sXG4gICAgICAgICdCVEMvVVNEJzogeyAnaWQnOiAnYnRjJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcsICd0eXBlJzogJ3VzZG1hcmtldCcsICAgICdjb2luVHlwZSc6IDEsIH0sXG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYWRlUG9zdEdldEFjY291bnRJbmZvICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBtZXRob2QgPSBwWyd0eXBlJ10gKyAnR2V0RGVwdGhJZCc7XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHsgJ2lkJzogcFsnaWQnXSB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gcFsndHlwZSddICsgJ0dldFRpY2tlcklkJztcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpc1ttZXRob2RdICh7ICdpZCc6IHBbJ2lkJ10gfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsndGlja2VyJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAocmVzcG9uc2VbJ3RpbWUnXSkgKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBtZXRob2QgPSBwWyd0eXBlJ10gKyAnR2V0RGV0YWlsSWQnO1xuICAgICAgICByZXR1cm4gdGhpc1ttZXRob2RdICh7ICdpZCc6IHBbJ2lkJ10gfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCBtZXRob2QgPSAndHJhZGVQb3N0JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSk7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICdjb2luX3R5cGUnOiBwWydjb2luVHlwZSddLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdtYXJrZXQnOiBwWydxdW90ZSddLnRvTG93ZXJDYXNlICgpLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbWV0aG9kICs9IHRoaXMuY2FwaXRhbGl6ZSAodHlwZSk7XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAndHJhZGUnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ107XG4gICAgICAgIGlmICh0eXBlID09ICd0cmFkZScpIHtcbiAgICAgICAgICAgIHVybCArPSAnL2FwaScgKyB0aGlzLnZlcnNpb247XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmtleXNvcnQgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAgICAgJ21ldGhvZCc6IHBhdGgsXG4gICAgICAgICAgICAgICAgJ2FjY2Vzc19rZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnY3JlYXRlZCc6IHRoaXMubm9uY2UgKCksXG4gICAgICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICAgICAgICAgIGxldCBxdWVyeVN0cmluZyA9IHRoaXMudXJsZW5jb2RlICh0aGlzLm9taXQgKHF1ZXJ5LCAnbWFya2V0JykpO1xuICAgICAgICAgICAgLy8gc2VjcmV0IGtleSBtdXN0IGJlIGF0IHRoZSBlbmQgb2YgcXVlcnkgdG8gYmUgc2lnbmVkXG4gICAgICAgICAgICBxdWVyeVN0cmluZyArPSAnJnNlY3JldF9rZXk9JyArIHRoaXMuc2VjcmV0O1xuICAgICAgICAgICAgcXVlcnlbJ3NpZ24nXSA9IHRoaXMuaGFzaCAocXVlcnlTdHJpbmcpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdHlwZSArICcvJyArIHRoaXMuaW1wbG9kZVBhcmFtcyAocGF0aCwgcGFyYW1zKSArICdfanNvbi5qcyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBpdGJpdCA9IHtcblxuICAgICdpZCc6ICdpdGJpdCcsICAgIFxuICAgICduYW1lJzogJ2l0Qml0JyxcbiAgICAnY291bnRyaWVzJzogJ1VTJyxcbiAgICAncmF0ZUxpbWl0JzogMzAwMCxcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc4MjIxNTktNjYxNTM2MjAtNjBhZC0xMWU3LTg5ZTctMDA1ZjZkN2YzZGUwLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkuaXRiaXQuY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5pdGJpdC5jb20nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lml0Yml0LmNvbS9hcGknLFxuICAgICAgICAgICAgJ2h0dHBzOi8vYXBpLml0Yml0LmNvbS9kb2NzJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdtYXJrZXRzL3tzeW1ib2x9L3RpY2tlcicsXG4gICAgICAgICAgICAgICAgJ21hcmtldHMve3N5bWJvbH0vb3JkZXJfYm9vaycsXG4gICAgICAgICAgICAgICAgJ21hcmtldHMve3N5bWJvbH0vdHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnd2FsbGV0cycsXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMve3dhbGxldElkfScsXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMve3dhbGxldElkfS9iYWxhbmNlcy97Y3VycmVuY3lDb2RlfScsXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMve3dhbGxldElkfS9mdW5kaW5nX2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICd3YWxsZXRzL3t3YWxsZXRJZH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0cy97d2FsbGV0SWR9L29yZGVycy97b3JkZXJJZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICd3YWxsZXRfdHJhbnNmZXJzJyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0cycsXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMve3dhbGxldElkfS9jcnlwdG9jdXJyZW5jeV9kZXBvc2l0cycsXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMve3dhbGxldElkfS9jcnlwdG9jdXJyZW5jeV93aXRoZHJhd2FscycsXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMve3dhbGxldElkfS9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICd3aXJlX3dpdGhkcmF3YWwnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ3dhbGxldHMve3dhbGxldElkfS9vcmRlcnMve29yZGVySWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvVVNEJzogeyAnaWQnOiAnWEJUVVNEJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0JUQy9TR0QnOiB7ICdpZCc6ICdYQlRTR0QnLCAnc3ltYm9sJzogJ0JUQy9TR0QnLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnU0dEJyB9LFxuICAgICAgICAnQlRDL0VVUic6IHsgJ2lkJzogJ1hCVEVVUicsICdzeW1ib2wnOiAnQlRDL0VVUicsICdiYXNlJzogJ0JUQycsICdxdW90ZSc6ICdFVVInIH0sXG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE1hcmtldHNTeW1ib2xPcmRlckJvb2sgKHsgXG4gICAgICAgICAgICAnc3ltYm9sJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIFxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldE1hcmtldHNTeW1ib2xUaWNrZXIgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5wYXJzZTg2MDEgKHRpY2tlclsnc2VydmVyVGltZVVUQyddKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaDI0aCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdzI0aCddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWyd2d2FwMjRoJ10pLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW5Ub2RheSddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0UHJpY2UnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUyNGgnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIFxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE1hcmtldHNTeW1ib2xUcmFkZXMgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0V2FsbGV0cyAoKTtcbiAgICB9LFxuXG4gICAgbm9uY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0JylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAodGhpcy5pZCArICcgYWxsb3dzIGxpbWl0IG9yZGVycyBvbmx5Jyk7XG4gICAgICAgIGFtb3VudCA9IGFtb3VudC50b1N0cmluZyAoKTtcbiAgICAgICAgcHJpY2UgPSBwcmljZS50b1N0cmluZyAoKTtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAnc2lkZSc6IHNpZGUsXG4gICAgICAgICAgICAndHlwZSc6IHR5cGUsXG4gICAgICAgICAgICAnY3VycmVuY3knOiBwWydiYXNlJ10sXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50LFxuICAgICAgICAgICAgJ2Rpc3BsYXknOiBhbW91bnQsXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZSxcbiAgICAgICAgICAgICdpbnN0cnVtZW50JzogcFsnaWQnXSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZUFkZCAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aClcbiAgICAgICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBib2R5ID0gJyc7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgbGV0IHRpbWVzdGFtcCA9IG5vbmNlO1xuICAgICAgICAgICAgbGV0IGF1dGggPSBbIG1ldGhvZCwgdXJsLCBib2R5LCBub25jZSwgdGltZXN0YW1wIF07XG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9IG5vbmNlICsgSlNPTi5zdHJpbmdpZnkgKGF1dGgpO1xuICAgICAgICAgICAgbGV0IGhhc2hlZE1lc3NhZ2UgPSB0aGlzLmhhc2ggKG1lc3NhZ2UsICdzaGEyNTYnLCAnYmluYXJ5Jyk7XG4gICAgICAgICAgICBsZXQgc2lnbmF0dXJlID0gdGhpcy5obWFjICh1cmwgKyBoYXNoZWRNZXNzYWdlLCB0aGlzLnNlY3JldCwgJ3NoYTUxMicsICdiYXNlNjQnKTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBzZWxmLmFwaUtleSArICc6JyArIHNpZ25hdHVyZSxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICdYLUF1dGgtVGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgICAgICdYLUF1dGgtTm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBqdWJpID0ge1xuXG4gICAgJ2lkJzogJ2p1YmknLFxuICAgICduYW1lJzogJ2p1YmkuY29tJyxcbiAgICAnY291bnRyaWVzJzogJ0NOJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCxcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY1ODEtOWQzOTdkOWEtNWVkZC0xMWU3LThmYjktNWQ4MjM2YzBlNjkyLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly93d3cuanViaS5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5qdWJpLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly93d3cuanViaS5jb20vaGVscC9hcGkuaHRtbCcsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZGVwdGgnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMnLFxuICAgICAgICAgICAgICAgICd0aWNrZXInLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX2FkZCcsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX2xpc3QnLFxuICAgICAgICAgICAgICAgICd0cmFkZV92aWV3JyxcbiAgICAgICAgICAgICAgICAnd2FsbGV0JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAncHJvZHVjdHMnOiB7XG4gICAgICAgICdCVEMvQ05ZJzogIHsgJ2lkJzogJ2J0YycsICAnc3ltYm9sJzogJ0JUQy9DTlknLCAgJ2Jhc2UnOiAnQlRDJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdFVEgvQ05ZJzogIHsgJ2lkJzogJ2V0aCcsICAnc3ltYm9sJzogJ0VUSC9DTlknLCAgJ2Jhc2UnOiAnRVRIJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdBTlMvQ05ZJzogIHsgJ2lkJzogJ2FucycsICAnc3ltYm9sJzogJ0FOUy9DTlknLCAgJ2Jhc2UnOiAnQU5TJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdCTEsvQ05ZJzogIHsgJ2lkJzogJ2JsaycsICAnc3ltYm9sJzogJ0JMSy9DTlknLCAgJ2Jhc2UnOiAnQkxLJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdETkMvQ05ZJzogIHsgJ2lkJzogJ2RuYycsICAnc3ltYm9sJzogJ0ROQy9DTlknLCAgJ2Jhc2UnOiAnRE5DJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdET0dFL0NOWSc6IHsgJ2lkJzogJ2RvZ2UnLCAnc3ltYm9sJzogJ0RPR0UvQ05ZJywgJ2Jhc2UnOiAnRE9HRScsICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdFQUMvQ05ZJzogIHsgJ2lkJzogJ2VhYycsICAnc3ltYm9sJzogJ0VBQy9DTlknLCAgJ2Jhc2UnOiAnRUFDJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdFVEMvQ05ZJzogIHsgJ2lkJzogJ2V0YycsICAnc3ltYm9sJzogJ0VUQy9DTlknLCAgJ2Jhc2UnOiAnRVRDJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdGWi9DTlknOiAgIHsgJ2lkJzogJ2Z6JywgICAnc3ltYm9sJzogJ0ZaL0NOWScsICAgJ2Jhc2UnOiAnRlonLCAgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdHT09DL0NOWSc6IHsgJ2lkJzogJ2dvb2MnLCAnc3ltYm9sJzogJ0dPT0MvQ05ZJywgJ2Jhc2UnOiAnR09PQycsICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdHQU1FL0NOWSc6IHsgJ2lkJzogJ2dhbWUnLCAnc3ltYm9sJzogJ0dBTUUvQ05ZJywgJ2Jhc2UnOiAnR0FNRScsICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdITEIvQ05ZJzogIHsgJ2lkJzogJ2hsYicsICAnc3ltYm9sJzogJ0hMQi9DTlknLCAgJ2Jhc2UnOiAnSExCJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdJRkMvQ05ZJzogIHsgJ2lkJzogJ2lmYycsICAnc3ltYm9sJzogJ0lGQy9DTlknLCAgJ2Jhc2UnOiAnSUZDJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdKQkMvQ05ZJzogIHsgJ2lkJzogJ2piYycsICAnc3ltYm9sJzogJ0pCQy9DTlknLCAgJ2Jhc2UnOiAnSkJDJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdLVEMvQ05ZJzogIHsgJ2lkJzogJ2t0YycsICAnc3ltYm9sJzogJ0tUQy9DTlknLCAgJ2Jhc2UnOiAnS1RDJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdMS0MvQ05ZJzogIHsgJ2lkJzogJ2xrYycsICAnc3ltYm9sJzogJ0xLQy9DTlknLCAgJ2Jhc2UnOiAnTEtDJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdMU0svQ05ZJzogIHsgJ2lkJzogJ2xzaycsICAnc3ltYm9sJzogJ0xTSy9DTlknLCAgJ2Jhc2UnOiAnTFNLJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdMVEMvQ05ZJzogIHsgJ2lkJzogJ2x0YycsICAnc3ltYm9sJzogJ0xUQy9DTlknLCAgJ2Jhc2UnOiAnTFRDJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdNQVgvQ05ZJzogIHsgJ2lkJzogJ21heCcsICAnc3ltYm9sJzogJ01BWC9DTlknLCAgJ2Jhc2UnOiAnTUFYJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdNRVQvQ05ZJzogIHsgJ2lkJzogJ21ldCcsICAnc3ltYm9sJzogJ01FVC9DTlknLCAgJ2Jhc2UnOiAnTUVUJywgICdxdW90ZSc6ICdDTlknIH0sXG4gICAgICAgICdNUllDL0NOWSc6IHsgJ2lkJzogJ21yeWMnLCAnc3ltYm9sJzogJ01SWUMvQ05ZJywgJ2Jhc2UnOiAnTVJZQycsICdxdW90ZSc6ICdDTlknIH0sICAgICAgICBcbiAgICAgICAgJ01UQy9DTlknOiAgeyAnaWQnOiAnbXRjJywgICdzeW1ib2wnOiAnTVRDL0NOWScsICAnYmFzZSc6ICdNVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ05YVC9DTlknOiAgeyAnaWQnOiAnbnh0JywgICdzeW1ib2wnOiAnTlhUL0NOWScsICAnYmFzZSc6ICdOWFQnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1BFQi9DTlknOiAgeyAnaWQnOiAncGViJywgICdzeW1ib2wnOiAnUEVCL0NOWScsICAnYmFzZSc6ICdQRUInLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1BHQy9DTlknOiAgeyAnaWQnOiAncGdjJywgICdzeW1ib2wnOiAnUEdDL0NOWScsICAnYmFzZSc6ICdQR0MnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1BMQy9DTlknOiAgeyAnaWQnOiAncGxjJywgICdzeW1ib2wnOiAnUExDL0NOWScsICAnYmFzZSc6ICdQTEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1BQQy9DTlknOiAgeyAnaWQnOiAncHBjJywgICdzeW1ib2wnOiAnUFBDL0NOWScsICAnYmFzZSc6ICdQUEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1FFQy9DTlknOiAgeyAnaWQnOiAncWVjJywgICdzeW1ib2wnOiAnUUVDL0NOWScsICAnYmFzZSc6ICdRRUMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1JJTy9DTlknOiAgeyAnaWQnOiAncmlvJywgICdzeW1ib2wnOiAnUklPL0NOWScsICAnYmFzZSc6ICdSSU8nLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1JTUy9DTlknOiAgeyAnaWQnOiAncnNzJywgICdzeW1ib2wnOiAnUlNTL0NOWScsICAnYmFzZSc6ICdSU1MnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1NLVC9DTlknOiAgeyAnaWQnOiAnc2t0JywgICdzeW1ib2wnOiAnU0tUL0NOWScsICAnYmFzZSc6ICdTS1QnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1RGQy9DTlknOiAgeyAnaWQnOiAndGZjJywgICdzeW1ib2wnOiAnVEZDL0NOWScsICAnYmFzZSc6ICdURkMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1ZSQy9DTlknOiAgeyAnaWQnOiAndnJjJywgICdzeW1ib2wnOiAnVlJDL0NOWScsICAnYmFzZSc6ICdWUkMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1ZUQy9DTlknOiAgeyAnaWQnOiAndnRjJywgICdzeW1ib2wnOiAnVlRDL0NOWScsICAnYmFzZSc6ICdWVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1dEQy9DTlknOiAgeyAnaWQnOiAnd2RjJywgICdzeW1ib2wnOiAnV0RDL0NOWScsICAnYmFzZSc6ICdXREMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1hBUy9DTlknOiAgeyAnaWQnOiAneGFzJywgICdzeW1ib2wnOiAnWEFTL0NOWScsICAnYmFzZSc6ICdYQVMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1hQTS9DTlknOiAgeyAnaWQnOiAneHBtJywgICdzeW1ib2wnOiAnWFBNL0NOWScsICAnYmFzZSc6ICdYUE0nLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1hSUC9DTlknOiAgeyAnaWQnOiAneHJwJywgICdzeW1ib2wnOiAnWFJQL0NOWScsICAnYmFzZSc6ICdYUlAnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1hTR1MvQ05ZJzogeyAnaWQnOiAneHNncycsICdzeW1ib2wnOiAnWFNHUy9DTlknLCAnYmFzZSc6ICdYU0dTJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1lUQy9DTlknOiAgeyAnaWQnOiAneXRjJywgICdzeW1ib2wnOiAnWVRDL0NOWScsICAnYmFzZSc6ICdZVEMnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1pFVC9DTlknOiAgeyAnaWQnOiAnemV0JywgICdzeW1ib2wnOiAnWkVUL0NOWScsICAnYmFzZSc6ICdaRVQnLCAgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ1pDQy9DTlknOiAgeyAnaWQnOiAnemNjJywgICdzeW1ib2wnOiAnWkNDL0NOWScsICAnYmFzZSc6ICdaQ0MnLCAgJ3F1b3RlJzogJ0NOWScgfSwgICAgICAgIFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldERlcHRoICh7XG4gICAgICAgICAgICAnY29pbic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoeyBcbiAgICAgICAgICAgICdjb2luJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVycyAoe1xuICAgICAgICAgICAgJ2NvaW4nOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZUFkZCAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdjb2luJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykgeyAgXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCkudG9TdHJpbmcgKCk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgICAgICBxdWVyeVsnc2lnbmF0dXJlJ10gPSB0aGlzLmhtYWMgKHRoaXMudXJsZW5jb2RlIChxdWVyeSksIHRoaXMuaGFzaCAodGhpcy5zZWNyZXQpKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga3Jha2VuIGlzIGFsc28gb3duZXIgb2YgZXguIENvaW5zZXR0ZXIgLyBDYVZpcnRFeCAvIENsZXZlcmNvaW5cblxudmFyIGtyYWtlbiA9IHtcblxuICAgICdpZCc6ICdrcmFrZW4nLFxuICAgICduYW1lJzogJ0tyYWtlbicsXG4gICAgJ2NvdW50cmllcyc6ICdVUycsXG4gICAgJ3ZlcnNpb24nOiAnMCcsXG4gICAgJ3JhdGVMaW1pdCc6IDMwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY1OTktMjI3MDkzMDQtNWVkZS0xMWU3LTlkZTEtOWYzMzczMmUxNTA5LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkua3Jha2VuLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cua3Jha2VuLmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cua3Jha2VuLmNvbS9lbi11cy9oZWxwL2FwaScsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL25vdGhpbmdpc2RlYWQvbnBtLWtyYWtlbi1hcGknLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ0Fzc2V0cycsXG4gICAgICAgICAgICAgICAgJ0Fzc2V0UGFpcnMnLFxuICAgICAgICAgICAgICAgICdEZXB0aCcsXG4gICAgICAgICAgICAgICAgJ09ITEMnLFxuICAgICAgICAgICAgICAgICdTcHJlYWQnLFxuICAgICAgICAgICAgICAgICdUaWNrZXInLFxuICAgICAgICAgICAgICAgICdUaW1lJyxcbiAgICAgICAgICAgICAgICAnVHJhZGVzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ0FkZE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnQmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ0NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnQ2xvc2VkT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnRGVwb3NpdEFkZHJlc3NlcycsXG4gICAgICAgICAgICAgICAgJ0RlcG9zaXRNZXRob2RzJyxcbiAgICAgICAgICAgICAgICAnRGVwb3NpdFN0YXR1cycsXG4gICAgICAgICAgICAgICAgJ0xlZGdlcnMnLFxuICAgICAgICAgICAgICAgICdPcGVuT3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnT3BlblBvc2l0aW9ucycsIFxuICAgICAgICAgICAgICAgICdRdWVyeUxlZGdlcnMnLCBcbiAgICAgICAgICAgICAgICAnUXVlcnlPcmRlcnMnLCBcbiAgICAgICAgICAgICAgICAnUXVlcnlUcmFkZXMnLFxuICAgICAgICAgICAgICAgICdUcmFkZUJhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdUcmFkZXNIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAnVHJhZGVWb2x1bWUnLFxuICAgICAgICAgICAgICAgICdXaXRoZHJhdycsXG4gICAgICAgICAgICAgICAgJ1dpdGhkcmF3Q2FuY2VsJywgXG4gICAgICAgICAgICAgICAgJ1dpdGhkcmF3SW5mbycsICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnV2l0aGRyYXdTdGF0dXMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0QXNzZXRQYWlycyAoKTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAocHJvZHVjdHNbJ3Jlc3VsdCddKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IGtleXMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBpZCA9IGtleXNbcF07XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzWydyZXN1bHQnXVtpZF07XG4gICAgICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ2Jhc2UnXTtcbiAgICAgICAgICAgIGxldCBxdW90ZSA9IHByb2R1Y3RbJ3F1b3RlJ107XG4gICAgICAgICAgICBpZiAoKGJhc2VbMF0gPT0gJ1gnKSB8fCAoYmFzZVswXSA9PSAnWicpKVxuICAgICAgICAgICAgICAgIGJhc2UgPSBiYXNlLnNsaWNlICgxKTtcbiAgICAgICAgICAgIGlmICgocXVvdGVbMF0gPT0gJ1gnKSB8fCAocXVvdGVbMF0gPT0gJ1onKSlcbiAgICAgICAgICAgICAgICBxdW90ZSA9IHF1b3RlLnNsaWNlICgxKTtcbiAgICAgICAgICAgIGJhc2UgPSB0aGlzLmNvbW1vbkN1cnJlbmN5Q29kZSAoYmFzZSk7XG4gICAgICAgICAgICBxdW90ZSA9IHRoaXMuY29tbW9uQ3VycmVuY3lDb2RlIChxdW90ZSk7XG4gICAgICAgICAgICBsZXQgZGFya3Bvb2wgPSBpZC5pbmRleE9mICgnLmQnKSA+PSAwO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGRhcmtwb29sID8gcHJvZHVjdFsnYWx0bmFtZSddIDogKGJhc2UgKyAnLycgKyBxdW90ZSk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldERlcHRoICAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucHJvZHVjdCAocHJvZHVjdCk7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAncGFpcic6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gcmVzcG9uc2VbJ3Jlc3VsdCddW3BbJ2lkJ11dO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2gnXVsxXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsJ11bMV0pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYiddWzBdKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2EnXVswXSksXG4gICAgICAgICAgICAndndhcCc6IHBhcnNlRmxvYXQgKHRpY2tlclsncCddWzFdKSxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2MnXVswXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2J11bMV0pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYWRlcyAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBsZXQgb3JkZXIgPSB7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdvcmRlcnR5cGUnOiB0eXBlLFxuICAgICAgICAgICAgJ3ZvbHVtZSc6IGFtb3VudCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2xpbWl0JylcbiAgICAgICAgICAgIG9yZGVyWydwcmljZSddID0gcHJpY2U7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0QWRkT3JkZXIgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7ICBcbiAgICAgICAgbGV0IHVybCA9ICcvJyArIHRoaXMudmVyc2lvbiArICcvJyArIHR5cGUgKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChwYXJhbXMpLmxlbmd0aClcbiAgICAgICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgJ25vbmNlJzogbm9uY2UgfSwgcGFyYW1zKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAocXVlcnkpO1xuICAgICAgICAgICAgcXVlcnkgPSB0aGlzLnN0cmluZ1RvQmluYXJ5ICh1cmwgKyB0aGlzLmhhc2ggKG5vbmNlICsgYm9keSwgJ3NoYTI1NicsICdiaW5hcnknKSk7XG4gICAgICAgICAgICBsZXQgc2VjcmV0ID0gdGhpcy5iYXNlNjRUb0JpbmFyeSAodGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQVBJLUtleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdBUEktU2lnbic6IHRoaXMuaG1hYyAocXVlcnksIHNlY3JldCwgJ3NoYTUxMicsICdiYXNlNjQnKSxcbiAgICAgICAgICAgICAgICAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyB1cmw7XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgbHVubyA9IHtcblxuICAgICdpZCc6ICdsdW5vJyxcbiAgICAnbmFtZSc6ICdsdW5vJyxcbiAgICAnY291bnRyaWVzJzogWyAnR0InLCAnU0cnLCAnWkEnLCBdLFxuICAgICdyYXRlTGltaXQnOiA1MDAwLFxuICAgICd2ZXJzaW9uJzogJzEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2NjA3LThjMWE2OWQ4LTVlZGUtMTFlNy05MzBjLTU0MGI1ZWI5YmUyNC5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLm15Yml0eC5jb20vYXBpJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5sdW5vLmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9ucG1qcy5vcmcvcGFja2FnZS9iaXR4JyxcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vYmF1c21laWVyL25vZGUtYml0eCcsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndGlja2VycycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL3tpZH0vcGVuZGluZycsXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL3tpZH0vdHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAnYmFsYW5jZScsXG4gICAgICAgICAgICAgICAgJ2ZlZV9pbmZvJyxcbiAgICAgICAgICAgICAgICAnZnVuZGluZ19hZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnbGlzdG9yZGVycycsXG4gICAgICAgICAgICAgICAgJ2xpc3R0cmFkZXMnLFxuICAgICAgICAgICAgICAgICdvcmRlcnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3F1b3Rlcy97aWR9JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMnLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2Fscy97aWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdwb3N0b3JkZXInLFxuICAgICAgICAgICAgICAgICdtYXJrZXRvcmRlcicsXG4gICAgICAgICAgICAgICAgJ3N0b3BvcmRlcicsXG4gICAgICAgICAgICAgICAgJ2Z1bmRpbmdfYWRkcmVzcycsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxzJyxcbiAgICAgICAgICAgICAgICAnc2VuZCcsXG4gICAgICAgICAgICAgICAgJ3F1b3RlcycsXG4gICAgICAgICAgICAgICAgJ29hdXRoMi9ncmFudCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3B1dCc6IFtcbiAgICAgICAgICAgICAgICAncXVvdGVzL3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWxldGUnOiBbXG4gICAgICAgICAgICAgICAgJ3F1b3Rlcy97aWR9JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdhbHMve2lkfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFByb2R1Y3RzICgpIHtcbiAgICAgICAgbGV0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXJzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ3RpY2tlcnMnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sndGlja2VycyddW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsncGFpciddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBpZC5zbGljZSAoMCwgMyk7XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBpZC5zbGljZSAoMywgNik7XG4gICAgICAgICAgICBiYXNlID0gdGhpcy5jb21tb25DdXJyZW5jeUNvZGUgKGJhc2UpO1xuICAgICAgICAgICAgcXVvdGUgPSB0aGlzLmNvbW1vbkN1cnJlbmN5Q29kZSAocXVvdGUpO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGJhc2UgKyAnLycgKyBxdW90ZTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVyYm9vayAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRUaWNrZXIgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndGltZXN0YW1wJ107XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbG93JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0X3RyYWRlJ10pLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsncm9sbGluZ18yNF9ob3VyX3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXMgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlUG9zdCc7XG4gICAgICAgIGxldCBvcmRlciA9IHsgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCkgfTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ21hcmtldCcpIHtcbiAgICAgICAgICAgIG1ldGhvZCArPSAnTWFya2V0b3JkZXInO1xuICAgICAgICAgICAgb3JkZXJbJ3R5cGUnXSA9IHNpZGUudG9VcHBlckNhc2UgKCk7XG4gICAgICAgICAgICBpZiAoc2lkZSA9PSAnYnV5JylcbiAgICAgICAgICAgICAgICBvcmRlclsnY291bnRlcl92b2x1bWUnXSA9IGFtb3VudDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvcmRlclsnYmFzZV92b2x1bWUnXSA9IGFtb3VudDsgICAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1ldGhvZCArPSAnT3JkZXInO1xuICAgICAgICAgICAgb3JkZXJbJ3ZvbHVtZSddID0gYW1vdW50O1xuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgICAgIGlmIChzaWRlID09ICdidXknKVxuICAgICAgICAgICAgICAgIG9yZGVyWyd0eXBlJ10gPSAnQklEJztcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvcmRlclsndHlwZSddID0gJ0FTSyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwcml2YXRlJykge1xuICAgICAgICAgICAgbGV0IGF1dGggPSB0aGlzLnN0cmluZ1RvQmFzZTY0ICh0aGlzLmFwaUtleSArICc6JyArIHRoaXMuc2VjcmV0KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdBdXRob3JpemF0aW9uJzogJ0Jhc2ljICcgKyBhdXRoIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBPS0NvaW4gXG4vLyBDaGluYVxuLy8gaHR0cHM6Ly93d3cub2tjb2luLmNvbS9cbi8vIGh0dHBzOi8vd3d3Lm9rY29pbi5jb20vcmVzdF9nZXRTdGFydGVkLmh0bWxcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9PS0NvaW4vd2Vic29ja2V0XG4vLyBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9va2NvaW4uY29tXG4vLyBodHRwczovL3d3dy5va2NvaW4uY25cbi8vIGh0dHBzOi8vd3d3Lm9rY29pbi5jbi9yZXN0X2dldFN0YXJ0ZWQuaHRtbFxuXG52YXIgb2tjb2luID0ge1xuXG4gICAgJ3ZlcnNpb24nOiAndjEnLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLCAvLyB1cCB0byAzMDAwIHJlcXVlc3RzIHBlciA1IG1pbnV0ZXMg4omIIDYwMCByZXF1ZXN0cyBwZXIgbWludXRlIOKJiCAxMCByZXF1ZXN0cyBwZXIgc2Vjb25kIOKJiCAxMDAgbXNcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZGVwdGgnLFxuICAgICAgICAgICAgICAgICdleGNoYW5nZV9yYXRlJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2RlcHRoJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2VzdGltYXRlZF9wcmljZScsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9ob2xkX2Ftb3VudCcsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9pbmRleCcsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9rbGluZScsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV9wcmljZV9saW1pdCcsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV90aWNrZXInLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAna2xpbmUnLFxuICAgICAgICAgICAgICAgICdvdGNzJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJyxcbiAgICAgICAgICAgICAgICAndHJhZGVzJywgICAgXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdhY2NvdW50X3JlY29yZHMnLFxuICAgICAgICAgICAgICAgICdiYXRjaF90cmFkZScsXG4gICAgICAgICAgICAgICAgJ2JvcnJvd19tb25leScsXG4gICAgICAgICAgICAgICAgJ2JvcnJvd19vcmRlcl9pbmZvJyxcbiAgICAgICAgICAgICAgICAnYm9ycm93c19pbmZvJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsX2JvcnJvdycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vdGNfb3JkZXInLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfd2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfYmF0Y2hfdHJhZGUnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX2Rldm9sdmUnLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfZXhwbG9zaXZlJyxcbiAgICAgICAgICAgICAgICAnZnV0dXJlX29yZGVyX2luZm8nLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfb3JkZXJzX2luZm8nLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfcG9zaXRpb24nLFxuICAgICAgICAgICAgICAgICdmdXR1cmVfcG9zaXRpb25fNGZpeCcsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV90cmFkZScsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV90cmFkZXNfaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV91c2VyaW5mbycsXG4gICAgICAgICAgICAgICAgJ2Z1dHVyZV91c2VyaW5mb180Zml4JyxcbiAgICAgICAgICAgICAgICAnbGVuZF9kZXB0aCcsXG4gICAgICAgICAgICAgICAgJ29yZGVyX2ZlZScsXG4gICAgICAgICAgICAgICAgJ29yZGVyX2hpc3RvcnknLFxuICAgICAgICAgICAgICAgICdvcmRlcl9pbmZvJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzX2luZm8nLFxuICAgICAgICAgICAgICAgICdvdGNfb3JkZXJfaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ290Y19vcmRlcl9pbmZvJyxcbiAgICAgICAgICAgICAgICAncmVwYXltZW50JyxcbiAgICAgICAgICAgICAgICAnc3VibWl0X290Y19vcmRlcicsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlX290Y19vcmRlcicsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdfaW5mbycsXG4gICAgICAgICAgICAgICAgJ3VucmVwYXltZW50c19pbmZvJyxcbiAgICAgICAgICAgICAgICAndXNlcmluZm8nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RGVwdGggKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlciAoe1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXIgPSByZXNwb25zZVsndGlja2VyJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAocmVzcG9uc2VbJ2RhdGUnXSkgKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYnV5J10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2VsbCddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRUcmFkZXMgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFVzZXJpbmZvICgpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ3N5bWJvbCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0eXBlJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcmRlclsndHlwZSddICs9ICdfbWFya2V0JztcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9ICcvYXBpLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyBwYXRoICsgJy5kbyc7ICAgXG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHBhcmFtcykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAocGFyYW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IHRoaXMua2V5c29ydCAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnYXBpX2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICAvLyBzZWNyZXQga2V5IG11c3QgYmUgYXQgdGhlIGVuZCBvZiBxdWVyeVxuICAgICAgICAgICAgbGV0IHF1ZXJ5U3RyaW5nID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KSArICcmc2VjcmV0X2tleT0nICsgdGhpcy5zZWNyZXQ7XG4gICAgICAgICAgICBxdWVyeVsnc2lnbiddID0gdGhpcy5oYXNoIChxdWVyeVN0cmluZykudG9VcHBlckNhc2UgKCk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7ICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyB9O1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyB1cmw7XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgb2tjb2luY255ID0gZXh0ZW5kIChva2NvaW4sIHtcbiAgICAnaWQnOiAnb2tjb2luY255JyxcbiAgICAnbmFtZSc6ICdPS0NvaW4gQ05ZJyxcbiAgICAnY291bnRyaWVzJzogJ0NOJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2Njc5Mi04YmU5MTU3YS01ZWU1LTExZTctOTI2Yy02ZDY5YjhkMzM3OGQuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5va2NvaW4uY24nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3Lm9rY29pbi5jbicsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly93d3cub2tjb2luLmNuL3Jlc3RfZ2V0U3RhcnRlZC5odG1sJyxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9DTlknOiB7ICdpZCc6ICdidGNfY255JywgJ3N5bWJvbCc6ICdCVEMvQ05ZJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICAgICAgJ0xUQy9DTlknOiB7ICdpZCc6ICdsdGNfY255JywgJ3N5bWJvbCc6ICdMVEMvQ05ZJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ0NOWScgfSxcbiAgICB9LFxufSlcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgb2tjb2ludXNkID0gZXh0ZW5kIChva2NvaW4sIHtcbiAgICAnaWQnOiAnb2tjb2ludXNkJyxcbiAgICAnbmFtZSc6ICdPS0NvaW4gVVNEJyxcbiAgICAnY291bnRyaWVzJzogWyAnQ04nLCAnVVMnIF0sXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY3OTEtODlmZmI1MDItNWVlNS0xMWU3LThhNWItYzU5NTBiNjhhYzY1LmpwZycsICAgICAgICBcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3d3dy5va2NvaW4uY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3d3dy5va2NvaW4uY29tJyxcbiAgICAgICAgJ2RvYyc6IFtcbiAgICAgICAgICAgICdodHRwczovL3d3dy5va2NvaW4uY29tL3Jlc3RfZ2V0U3RhcnRlZC5odG1sJyxcbiAgICAgICAgICAgICdodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9va2NvaW4uY29tJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdidGNfdXNkJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0xUQy9VU0QnOiB7ICdpZCc6ICdsdGNfdXNkJywgJ3N5bWJvbCc6ICdMVEMvVVNEJywgJ2Jhc2UnOiAnTFRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICB9LFxufSlcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgcGF5bWl1bSA9IHtcblxuICAgICdpZCc6ICdwYXltaXVtJyxcbiAgICAnbmFtZSc6ICdQYXltaXVtJyxcbiAgICAnY291bnRyaWVzJzogWyAnRlInLCAnRVUnLCBdLFxuICAgICdyYXRlTGltaXQnOiAzMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc5MDU2NC1hOTQ1YTlkNC01ZmY5LTExZTctOWQyZC1iNjM1NzYzZjJmMjQuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL3BheW1pdW0uY29tL2FwaScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cucGF5bWl1bS5jb20nLFxuICAgICAgICAnZG9jJzogW1xuICAgICAgICAgICAgJ2h0dHBzOi8vd3d3LnBheW1pdW0uY29tL3BhZ2UvZGV2ZWxvcGVycycsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL1BheW1pdW0vYXBpLWRvY3VtZW50YXRpb24nLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2NvdW50cmllcycsXG4gICAgICAgICAgICAgICAgJ2RhdGEve2lkfS90aWNrZXInLFxuICAgICAgICAgICAgICAgICdkYXRhL3tpZH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnZGF0YS97aWR9L2RlcHRoJyxcbiAgICAgICAgICAgICAgICAnYml0Y29pbl9jaGFydHMve2lkfS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICdiaXRjb2luX2NoYXJ0cy97aWR9L2RlcHRoJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnbWVyY2hhbnQvZ2V0X3BheW1lbnQve1VVSUR9JyxcbiAgICAgICAgICAgICAgICAndXNlcicsXG4gICAgICAgICAgICAgICAgJ3VzZXIvYWRkcmVzc2VzJyxcbiAgICAgICAgICAgICAgICAndXNlci9hZGRyZXNzZXMve2J0Y19hZGRyZXNzfScsXG4gICAgICAgICAgICAgICAgJ3VzZXIvb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAndXNlci9vcmRlcnMve1VVSUR9JyxcbiAgICAgICAgICAgICAgICAndXNlci9wcmljZV9hbGVydHMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICd1c2VyL29yZGVycycsXG4gICAgICAgICAgICAgICAgJ3VzZXIvYWRkcmVzc2VzJyxcbiAgICAgICAgICAgICAgICAndXNlci9wYXltZW50X3JlcXVlc3RzJyxcbiAgICAgICAgICAgICAgICAndXNlci9wcmljZV9hbGVydHMnLFxuICAgICAgICAgICAgICAgICdtZXJjaGFudC9jcmVhdGVfcGF5bWVudCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlbGV0ZSc6IFtcbiAgICAgICAgICAgICAgICAndXNlci9vcmRlcnMve1VVSUR9L2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ3VzZXIvcHJpY2VfYWxlcnRzL3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9FVVInOiB7ICdpZCc6ICdldXInLCAnc3ltYm9sJzogJ0JUQy9FVVInLCAnYmFzZSc6ICdCVEMnLCAncXVvdGUnOiAnRVVSJyB9LFxuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlR2V0VXNlciAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RGF0YUlkRGVwdGggICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXREYXRhSWRUaWNrZXIgKHtcbiAgICAgICAgICAgICdpZCc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aWNrZXJbJ2F0J10gKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHBhcnNlRmxvYXQgKHRpY2tlclsnb3BlbiddKSxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydwcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndmFyaWF0aW9uJ10pLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldERhdGFJZFRyYWRlcyAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBvcmRlciA9IHtcbiAgICAgICAgICAgICd0eXBlJzogdGhpcy5jYXBpdGFsaXplICh0eXBlKSArICdPcmRlcicsXG4gICAgICAgICAgICAnY3VycmVuY3knOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnZGlyZWN0aW9uJzogc2lkZSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RVc2VyT3JkZXJzICh0aGlzLmV4dGVuZCAob3JkZXIsIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0Q2FuY2VsT3JkZXIgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnb3JkZXJOdW1iZXInOiBpZCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHBhcmFtcyk7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpOyAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGF1dGggPSBub25jZSArIHVybCArIGJvZHk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdBcGktS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ0FwaS1TaWduYXR1cmUnOiB0aGlzLmhtYWMgKGF1dGgsIHRoaXMuc2VjcmV0KSxcbiAgICAgICAgICAgICAgICAnQXBpLU5vbmNlJzogbm9uY2UsICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgcG9sb25pZXggPSB7XG5cbiAgICAnaWQnOiAncG9sb25pZXgnLFxuICAgICduYW1lJzogJ1BvbG9uaWV4JyxcbiAgICAnY291bnRyaWVzJzogJ1VTJyxcbiAgICAncmF0ZUxpbWl0JzogMTAwMCwgLy8gNiBjYWxscyBwZXIgc2Vjb25kXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY4MTctZTk0NTYzMTItNWVlNi0xMWU3LTliM2MtYjYyOGNhNTYyNmE1LmpwZycsXG4gICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAncHVibGljJzogJ2h0dHBzOi8vcG9sb25pZXguY29tL3B1YmxpYycsXG4gICAgICAgICAgICAncHJpdmF0ZSc6ICdodHRwczovL3BvbG9uaWV4LmNvbS90cmFkaW5nQXBpJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3BvbG9uaWV4LmNvbScsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9wb2xvbmlleC5jb20vc3VwcG9ydC9hcGkvJyxcbiAgICAgICAgICAgICdodHRwOi8vcGFzdGViaW4uY29tL2RNWDdtWkUwJyxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdyZXR1cm4yNGhWb2x1bWUnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5DaGFydERhdGEnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5DdXJyZW5jaWVzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuTG9hbk9yZGVycycsXG4gICAgICAgICAgICAgICAgJ3JldHVybk9yZGVyQm9vaycsXG4gICAgICAgICAgICAgICAgJ3JldHVyblRpY2tlcicsXG4gICAgICAgICAgICAgICAgJ3JldHVyblRyYWRlSGlzdG9yeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdidXknLFxuICAgICAgICAgICAgICAgICdjYW5jZWxMb2FuT2ZmZXInLFxuICAgICAgICAgICAgICAgICdjYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ2Nsb3NlTWFyZ2luUG9zaXRpb24nLFxuICAgICAgICAgICAgICAgICdjcmVhdGVMb2FuT2ZmZXInLFxuICAgICAgICAgICAgICAgICdnZW5lcmF0ZU5ld0FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICdnZXRNYXJnaW5Qb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgJ21hcmdpbkJ1eScsXG4gICAgICAgICAgICAgICAgJ21hcmdpblNlbGwnLFxuICAgICAgICAgICAgICAgICdtb3ZlT3JkZXInLFxuICAgICAgICAgICAgICAgICdyZXR1cm5BY3RpdmVMb2FucycsXG4gICAgICAgICAgICAgICAgJ3JldHVybkF2YWlsYWJsZUFjY291bnRCYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ3JldHVybkJhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuQ29tcGxldGVCYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ3JldHVybkRlcG9zaXRBZGRyZXNzZXMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5EZXBvc2l0c1dpdGhkcmF3YWxzJyxcbiAgICAgICAgICAgICAgICAncmV0dXJuRmVlSW5mbycsXG4gICAgICAgICAgICAgICAgJ3JldHVybkxlbmRpbmdIaXN0b3J5JyxcbiAgICAgICAgICAgICAgICAncmV0dXJuTWFyZ2luQWNjb3VudFN1bW1hcnknLFxuICAgICAgICAgICAgICAgICdyZXR1cm5PcGVuTG9hbk9mZmVycycsXG4gICAgICAgICAgICAgICAgJ3JldHVybk9wZW5PcmRlcnMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5PcmRlclRyYWRlcycsXG4gICAgICAgICAgICAgICAgJ3JldHVyblRyYWRhYmxlQmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdyZXR1cm5UcmFkZUhpc3RvcnknLFxuICAgICAgICAgICAgICAgICdzZWxsJyxcbiAgICAgICAgICAgICAgICAndG9nZ2xlQXV0b1JlbmV3JyxcbiAgICAgICAgICAgICAgICAndHJhbnNmZXJCYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXcnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0UmV0dXJuVGlja2VyICgpO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0cyk7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBrZXlzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgaWQgPSBrZXlzW3BdO1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1tpZF07XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gaWQucmVwbGFjZSAoJ18nLCAnLycpO1xuICAgICAgICAgICAgbGV0IFsgYmFzZSwgcXVvdGUgXSA9IHN5bWJvbC5zcGxpdCAoJy8nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoICh7XG4gICAgICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAgICAgJ3N5bWJvbCc6IHN5bWJvbCxcbiAgICAgICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RSZXR1cm5Db21wbGV0ZUJhbGFuY2VzICh7XG4gICAgICAgICAgICAnYWNjb3VudCc6ICdhbGwnLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0UmV0dXJuT3JkZXJCb29rICh7XG4gICAgICAgICAgICAnY3VycmVuY3lQYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VycyA9IGF3YWl0IHRoaXMucHVibGljR2V0UmV0dXJuVGlja2VyICgpO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1twWydpZCddXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoMjRociddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdzI0aHInXSksXG4gICAgICAgICAgICAnYmlkJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoZXN0QmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93ZXN0QXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsncGVyY2VudENoYW5nZSddKSxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmFzZVZvbHVtZSddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsncXVvdGVWb2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0UmV0dXJuVHJhZGVIaXN0b3J5ICh7XG4gICAgICAgICAgICAnY3VycmVuY3lQYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGxldCBtZXRob2QgPSAncHJpdmF0ZVBvc3QnICsgdGhpcy5jYXBpdGFsaXplIChzaWRlKTtcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdjdXJyZW5jeVBhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAncmF0ZSc6IHByaWNlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE9yZGVyIChpZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RDYW5jZWxPcmRlciAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdvcmRlck51bWJlcic6IGlkLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bdHlwZV07XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMuZXh0ZW5kICh7ICdjb21tYW5kJzogcGF0aCB9LCBwYXJhbXMpO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBxdWVyeVsnbm9uY2UnXSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdLZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnU2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBxdWFkcmlnYWN4ID0ge1xuXG4gICAgJ2lkJzogJ3F1YWRyaWdhY3gnLFxuICAgICduYW1lJzogJ1F1YWRyaWdhQ1gnLFxuICAgICdjb3VudHJpZXMnOiAnQ0EnLFxuICAgICdyYXRlTGltaXQnOiAyMDAwLFxuICAgICd2ZXJzaW9uJzogJ3YyJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2NjgyNS05OGE2ZDBkZS01ZWU3LTExZTctOWZhNC0zOGUxMWEyYzZmNTIuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS5xdWFkcmlnYWN4LmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cucXVhZHJpZ2FjeC5jb20nLFxuICAgICAgICAnZG9jJzogJ2h0dHBzOi8vd3d3LnF1YWRyaWdhY3guY29tL2FwaV9pbmZvJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdvcmRlcl9ib29rJyxcbiAgICAgICAgICAgICAgICAndGlja2VyJywgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucycsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlJyxcbiAgICAgICAgICAgICAgICAnYml0Y29pbl9kZXBvc2l0X2FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICdiaXRjb2luX3dpdGhkcmF3YWwnLFxuICAgICAgICAgICAgICAgICdidXknLFxuICAgICAgICAgICAgICAgICdjYW5jZWxfb3JkZXInLFxuICAgICAgICAgICAgICAgICdldGhlcl9kZXBvc2l0X2FkZHJlc3MnLFxuICAgICAgICAgICAgICAgICdldGhlcl93aXRoZHJhd2FsJyxcbiAgICAgICAgICAgICAgICAnbG9va3VwX29yZGVyJyxcbiAgICAgICAgICAgICAgICAnb3Blbl9vcmRlcnMnLFxuICAgICAgICAgICAgICAgICdzZWxsJyxcbiAgICAgICAgICAgICAgICAndXNlcl90cmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgICdwcm9kdWN0cyc6IHtcbiAgICAgICAgJ0JUQy9DQUQnOiB7ICdpZCc6ICdidGNfY2FkJywgJ3N5bWJvbCc6ICdCVEMvQ0FEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ0NBRCcgfSxcbiAgICAgICAgJ0JUQy9VU0QnOiB7ICdpZCc6ICdidGNfdXNkJywgJ3N5bWJvbCc6ICdCVEMvVVNEJywgJ2Jhc2UnOiAnQlRDJywgJ3F1b3RlJzogJ1VTRCcgfSxcbiAgICAgICAgJ0VUSC9CVEMnOiB7ICdpZCc6ICdldGhfYnRjJywgJ3N5bWJvbCc6ICdFVEgvQlRDJywgJ2Jhc2UnOiAnRVRIJywgJ3F1b3RlJzogJ0JUQycgfSxcbiAgICAgICAgJ0VUSC9DQUQnOiB7ICdpZCc6ICdldGhfY2FkJywgJ3N5bWJvbCc6ICdFVEgvQ0FEJywgJ2Jhc2UnOiAnRVRIJywgJ3F1b3RlJzogJ0NBRCcgfSxcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RCYWxhbmNlICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRPcmRlckJvb2sgKHtcbiAgICAgICAgICAgICdib29rJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0VGlja2VyICh7XG4gICAgICAgICAgICAnYm9vayc6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBwYXJzZUludCAodGlja2VyWyd0aW1lc3RhbXAnXSkgKiAxMDAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYmlkJ10pLFxuICAgICAgICAgICAgJ2Fzayc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3Z3YXAnXSksXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsndm9sdW1lJ10pLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGZldGNoVHJhZGVzIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFRyYW5zYWN0aW9ucyAoe1xuICAgICAgICAgICAgJ2Jvb2snOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9ICdwcml2YXRlUG9zdCcgKyB0aGlzLmNhcGl0YWxpemUgKHNpZGUpOyBcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdib29rJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZSA9PSAnbGltaXQnKVxuICAgICAgICAgICAgb3JkZXJbJ3ByaWNlJ10gPSBwcmljZTtcbiAgICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXSAodGhpcy5leHRlbmQgKG9yZGVyLCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsT3JkZXIgKGlkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdENhbmNlbE9yZGVyICh0aGlzLmV4dGVuZCAoeyBpZCB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyBwYXRoO1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGxldCByZXF1ZXN0ID0gWyBub25jZSwgdGhpcy51aWQsIHRoaXMuYXBpS2V5IF0uam9pbiAoJycpO1xuICAgICAgICAgICAgbGV0IHNpZ25hdHVyZSA9IHRoaXMuaG1hYyAocmVxdWVzdCwgdGhpcy5zZWNyZXQpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgXG4gICAgICAgICAgICAgICAgJ2tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdzaWduYXR1cmUnOiBzaWduYXR1cmUsXG4gICAgICAgICAgICB9LCBwYXJhbXMpO1xuICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5IChxdWVyeSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgcXVvaW5lID0ge1xuXG4gICAgJ2lkJzogJ3F1b2luZScsXG4gICAgJ25hbWUnOiAnUVVPSU5FJyxcbiAgICAnY291bnRyaWVzJzogWyAnSlAnLCAnU0cnLCAnVk4nIF0sXG4gICAgJ3ZlcnNpb24nOiAnMicsXG4gICAgJ3JhdGVMaW1pdCc6IDIwMDAsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY4NDQtOTYxNWE0ZTgtNWVlOC0xMWU3LTg4MTQtZmNkMDA0ZGI4Y2RkLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkucXVvaW5lLmNvbScsXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cucXVvaW5lLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9kZXZlbG9wZXJzLnF1b2luZS5jb20nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzJyxcbiAgICAgICAgICAgICAgICAncHJvZHVjdHMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3Byb2R1Y3RzL3tpZH0vcHJpY2VfbGV2ZWxzJyxcbiAgICAgICAgICAgICAgICAnZXhlY3V0aW9ucycsXG4gICAgICAgICAgICAgICAgJ2lyX2xhZGRlcnMve2N1cnJlbmN5fScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2FjY291bnRzL2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdjcnlwdG9fYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdleGVjdXRpb25zL21lJyxcbiAgICAgICAgICAgICAgICAnZmlhdF9hY2NvdW50cycsXG4gICAgICAgICAgICAgICAgJ2xvYW5fYmlkcycsXG4gICAgICAgICAgICAgICAgJ2xvYW5zJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzL3tpZH0nLFxuICAgICAgICAgICAgICAgICdvcmRlcnMve2lkfS90cmFkZXMnLFxuICAgICAgICAgICAgICAgICd0cmFkZXMnLFxuICAgICAgICAgICAgICAgICd0cmFkZXMve2lkfS9sb2FucycsXG4gICAgICAgICAgICAgICAgJ3RyYWRpbmdfYWNjb3VudHMnLFxuICAgICAgICAgICAgICAgICd0cmFkaW5nX2FjY291bnRzL3tpZH0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdmaWF0X2FjY291bnRzJyxcbiAgICAgICAgICAgICAgICAnbG9hbl9iaWRzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAncHV0JzogW1xuICAgICAgICAgICAgICAgICdsb2FuX2JpZHMve2lkfS9jbG9zZScsXG4gICAgICAgICAgICAgICAgJ2xvYW5zL3tpZH0nLFxuICAgICAgICAgICAgICAgICdvcmRlcnMve2lkfScsXG4gICAgICAgICAgICAgICAgJ29yZGVycy97aWR9L2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97aWR9JyxcbiAgICAgICAgICAgICAgICAndHJhZGVzL3tpZH0vY2xvc2UnLFxuICAgICAgICAgICAgICAgICd0cmFkZXMvY2xvc2VfYWxsJyxcbiAgICAgICAgICAgICAgICAndHJhZGluZ19hY2NvdW50cy97aWR9JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFByb2R1Y3RzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbcF07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydpZCddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBwcm9kdWN0WydiYXNlX2N1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydxdW90ZWRfY3VycmVuY3knXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVHZXRBY2NvdW50c0JhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldFByb2R1Y3RzSWRQcmljZUxldmVscyAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHRpY2tlciA9IGF3YWl0IHRoaXMucHVibGljR2V0UHJvZHVjdHNJZCAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoX21hcmtldF9hc2snXSksXG4gICAgICAgICAgICAnbG93JzogcGFyc2VGbG9hdCAodGlja2VyWydsb3dfbWFya2V0X2JpZCddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ21hcmtldF9iaWQnXSksXG4gICAgICAgICAgICAnYXNrJzogcGFyc2VGbG9hdCAodGlja2VyWydtYXJrZXRfYXNrJ10pLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0X3RyYWRlZF9wcmljZSddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZV8yNGgnXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RXhlY3V0aW9ucyAoe1xuICAgICAgICAgICAgJ3Byb2R1Y3RfaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ29yZGVyX3R5cGUnOiB0eXBlLFxuICAgICAgICAgICAgJ3Byb2R1Y3RfaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgICAgICAnc2lkZSc6IHNpZGUsXG4gICAgICAgICAgICAncXVhbnRpdHknOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdE9yZGVycyAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdvcmRlcic6IG9yZGVyLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsT3JkZXIgKGlkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUHV0T3JkZXJzSWRDYW5jZWwgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICdYLVF1b2luZS1BUEktVmVyc2lvbic6IHRoaXMudmVyc2lvbixcbiAgICAgICAgICAgICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdwdWJsaWMnKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAgICAgJ3BhdGgnOiB1cmwsIFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLCBcbiAgICAgICAgICAgICAgICAndG9rZW5faWQnOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnaWF0JzogTWF0aC5mbG9vciAobm9uY2UgLyAxMDAwKSwgLy8gaXNzdWVkIGF0XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzIChxdWVyeSkubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgaGVhZGVyc1snWC1RdW9pbmUtQXV0aCddID0gdGhpcy5qd3QgKHJlcXVlc3QsIHRoaXMuc2VjcmV0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodGhpcy51cmxzWydhcGknXSArIHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciB0aGVyb2NrID0ge1xuXG4gICAgJ2lkJzogJ3RoZXJvY2snLFxuICAgICduYW1lJzogJ1RoZVJvY2tUcmFkaW5nJyxcbiAgICAnY291bnRyaWVzJzogJ01UJyxcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndmVyc2lvbic6ICd2MScsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY4NjktNzUwNTdmYTItNWVlOS0xMWU3LTlhNmYtMTNlNjQxZmE0NzA3LmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly9hcGkudGhlcm9ja3RyYWRpbmcuY29tJyxcbiAgICAgICAgJ3d3dyc6ICdodHRwczovL3RoZXJvY2t0cmFkaW5nLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9hcGkudGhlcm9ja3RyYWRpbmcuY29tL2RvYy8nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tpZH0vb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAnZnVuZHMve2lkfS90aWNrZXInLFxuICAgICAgICAgICAgICAgICdmdW5kcy97aWR9L3RyYWRlcycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3RpY2tlcnMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdiYWxhbmNlcycsXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2VzL3tpZH0nLFxuICAgICAgICAgICAgICAgICdkaXNjb3VudHMnLFxuICAgICAgICAgICAgICAgICdkaXNjb3VudHMve2lkfScsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzJyxcbiAgICAgICAgICAgICAgICAnZnVuZHMve2lkfScsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tpZH0vdHJhZGVzJyxcbiAgICAgICAgICAgICAgICAnZnVuZHMve2Z1bmRfaWR9L29yZGVycycsXG4gICAgICAgICAgICAgICAgJ2Z1bmRzL3tmdW5kX2lkfS9vcmRlcnMve2lkfScsICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vcG9zaXRpb25fYmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vcG9zaXRpb25zJyxcbiAgICAgICAgICAgICAgICAnZnVuZHMve2Z1bmRfaWR9L3Bvc2l0aW9ucy97aWR9JyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAndHJhbnNhY3Rpb25zL3tpZH0nLFxuICAgICAgICAgICAgICAgICd3aXRoZHJhd19saW1pdHMve2lkfScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2xpbWl0cycsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2F0bXMvd2l0aGRyYXcnLFxuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vb3JkZXJzJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVsZXRlJzogW1xuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vb3JkZXJzL3tpZH0nLFxuICAgICAgICAgICAgICAgICdmdW5kcy97ZnVuZF9pZH0vb3JkZXJzL3JlbW92ZV9hbGwnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0RnVuZHNUaWNrZXJzICgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvZHVjdHNbJ3RpY2tlcnMnXS5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sndGlja2VycyddW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnZnVuZF9pZCddO1xuICAgICAgICAgICAgbGV0IGJhc2UgPSBpZC5zbGljZSAoMCwgMyk7XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBpZC5zbGljZSAoMywgNik7XG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2ggKHtcbiAgICAgICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgICAgICdiYXNlJzogYmFzZSxcbiAgICAgICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICAgICAnaW5mbyc6IHByb2R1Y3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBmZXRjaEJhbGFuY2UgKCkgeyBcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEJhbGFuY2VzICgpO1xuICAgIH0sXG5cbiAgICBmZXRjaE9yZGVyQm9vayAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNHZXRGdW5kc0lkT3JkZXJib29rICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRGdW5kc0lkVGlja2VyICh7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGltZXN0YW1wID0gdGhpcy5wYXJzZTg2MDEgKHRpY2tlclsnZGF0ZSddKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wZW4nOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ29wZW4nXSksXG4gICAgICAgICAgICAnY2xvc2UnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2Nsb3NlJ10pLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWVfdHJhZGVkJ10pLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWyd2b2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0RnVuZHNJZFRyYWRlcyAoe1xuICAgICAgICAgICAgJ2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICh0aGlzLmlkICsgJyBhbGxvd3MgbGltaXQgb3JkZXJzIG9ubHknKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZVBvc3RGdW5kc0Z1bmRJZE9yZGVycyAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdmdW5kX2lkJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdCAocGF0aCwgdHlwZSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ10gKyAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3ByaXZhdGUnKSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpLnRvU3RyaW5nICgpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnWC1UUlQtS0VZJzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1gtVFJULU5PTkNFJzogbm9uY2UsXG4gICAgICAgICAgICAgICAgJ1gtVFJULVNJR04nOiB0aGlzLmhtYWMgKG5vbmNlICsgdXJsLCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyAocXVlcnkpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeSAocXVlcnkpO1xuICAgICAgICAgICAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgdmF1bHRvcm8gPSB7XG5cbiAgICAnaWQnOiAndmF1bHRvcm8nLFxuICAgICduYW1lJzogJ1ZhdWx0b3JvJyxcbiAgICAnY291bnRyaWVzJzogJ0NIJyxcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndmVyc2lvbic6ICcxJyxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2Njg4MC1mMjA1ZTg3MC01ZWU5LTExZTctOGZlMi0wZDViMTU4ODA3NTIuanBnJyxcbiAgICAgICAgJ2FwaSc6ICdodHRwczovL2FwaS52YXVsdG9yby5jb20nLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LnZhdWx0b3JvLmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly9hcGkudmF1bHRvcm8uY29tJyxcbiAgICB9LFxuICAgICdhcGknOiB7XG4gICAgICAgICdwdWJsaWMnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdiaWRhbmRhc2snLFxuICAgICAgICAgICAgICAgICdidXlvcmRlcnMnLFxuICAgICAgICAgICAgICAgICdsYXRlc3QnLFxuICAgICAgICAgICAgICAgICdsYXRlc3R0cmFkZXMnLFxuICAgICAgICAgICAgICAgICdtYXJrZXRzJyxcbiAgICAgICAgICAgICAgICAnb3JkZXJib29rJyxcbiAgICAgICAgICAgICAgICAnc2VsbG9yZGVycycsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucy9kYXknLFxuICAgICAgICAgICAgICAgICd0cmFuc2FjdGlvbnMvaG91cicsXG4gICAgICAgICAgICAgICAgJ3RyYW5zYWN0aW9ucy9tb250aCcsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAncHJpdmF0ZSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2JhbGFuY2UnLFxuICAgICAgICAgICAgICAgICdteXRyYWRlcycsXG4gICAgICAgICAgICAgICAgJ29yZGVycycsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2J1eS97c3ltYm9sfS97dHlwZX0nLFxuICAgICAgICAgICAgICAgICdjYW5jZWwve29yZGVyaWQnLFxuICAgICAgICAgICAgICAgICdzZWxsL3tzeW1ib2x9L3t0eXBlfScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMucHVibGljR2V0TWFya2V0cyAoKTtcbiAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1snZGF0YSddO1xuICAgICAgICBsZXQgYmFzZSA9IHByb2R1Y3RbJ0Jhc2VDdXJyZW5jeSddO1xuICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydNYXJrZXRDdXJyZW5jeSddO1xuICAgICAgICBsZXQgc3ltYm9sID0gYmFzZSArICcvJyArIHF1b3RlO1xuICAgICAgICBsZXQgYmFzZUlkID0gYmFzZTtcbiAgICAgICAgbGV0IHF1b3RlSWQgPSBxdW90ZTtcbiAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnTWFya2V0TmFtZSddO1xuICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgJ2lkJzogaWQsXG4gICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgJ3F1b3RlJzogcXVvdGUsXG4gICAgICAgICAgICAnYmFzZUlkJzogYmFzZUlkLFxuICAgICAgICAgICAgJ3F1b3RlSWQnOiBxdW90ZUlkLFxuICAgICAgICAgICAgJ2luZm8nOiBwcm9kdWN0LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZmV0Y2hCYWxhbmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUdldEJhbGFuY2UgKCk7XG4gICAgfSxcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0dldE9yZGVyYm9vayAoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHF1b3RlID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRCaWRhbmRhc2sgKCk7XG4gICAgICAgIGxldCBiaWRzTGVuZ3RoID0gcXVvdGVbJ2JpZHMnXS5sZW5ndGg7XG4gICAgICAgIGxldCBiaWQgPSBxdW90ZVsnYmlkcyddW2JpZHNMZW5ndGggLSAxXTtcbiAgICAgICAgbGV0IGFzayA9IHF1b3RlWydhc2tzJ11bMF07XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0TWFya2V0cyAoKTtcbiAgICAgICAgbGV0IHRpY2tlciA9IHJlc3BvbnNlWydkYXRhJ107XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnMjRoSGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJzI0aExvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBiaWRbMF0sXG4gICAgICAgICAgICAnYXNrJzogYXNrWzBdLFxuICAgICAgICAgICAgJ3Z3YXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnb3Blbic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjbG9zZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogcGFyc2VGbG9hdCAodGlja2VyWydsYXN0UHJpY2UnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3F1b3RlVm9sdW1lJzogcGFyc2VGbG9hdCAodGlja2VyWycyNGhWb2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0VHJhbnNhY3Rpb25zRGF5ICgpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgbWV0aG9kID0gJ3ByaXZhdGVQb3N0JyArIHRoaXMuY2FwaXRhbGl6ZSAoc2lkZSkgKyAnU3ltYm9sVHlwZSc7XG4gICAgICAgIHJldHVybiB0aGlzW21ldGhvZF0gKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnc3ltYm9sJzogcFsncXVvdGVJZCddLnRvTG93ZXJDYXNlICgpLFxuICAgICAgICAgICAgJ3R5cGUnOiB0eXBlLFxuICAgICAgICAgICAgJ2dsZCc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlIHx8IDEsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ3B1YmxpYycsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJztcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIHVybCArPSBwYXRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIHVybCArPSB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgICAgICdhcGlrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgIH0sIHRoaXMub21pdCAocGFyYW1zLCB0aGlzLmV4dHJhY3RQYXJhbXMgKHBhdGgpKSk7XG4gICAgICAgICAgICB1cmwgKz0gJz8nICsgdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAnWC1TaWduYXR1cmUnOiB0aGlzLmhtYWMgKHVybCwgdGhpcy5zZWNyZXQpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgdmlyd294ID0ge1xuXG4gICAgJ2lkJzogJ3ZpcndveCcsXG4gICAgJ25hbWUnOiAnVmlyV29YJyxcbiAgICAnY291bnRyaWVzJzogJ0FUJyxcbiAgICAncmF0ZUxpbWl0JzogMTAwMCxcbiAgICAndXJscyc6IHtcbiAgICAgICAgJ2xvZ28nOiAnaHR0cHM6Ly91c2VyLWltYWdlcy5naXRodWJ1c2VyY29udGVudC5jb20vMTI5NDQ1NC8yNzc2Njg5NC02ZGE5ZDM2MC01ZWVhLTExZTctOTBhYS00MWYyNzExYjc0MDUuanBnJyxcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdwdWJsaWMnOiAnaHR0cDovL2FwaS52aXJ3b3guY29tL2FwaS9qc29uLnBocCcsXG4gICAgICAgICAgICAncHJpdmF0ZSc6ICdodHRwczovL3d3dy52aXJ3b3guY29tL2FwaS90cmFkaW5nLnBocCcsXG4gICAgICAgIH0sXG4gICAgICAgICd3d3cnOiAnaHR0cHM6Ly93d3cudmlyd294LmNvbScsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly93d3cudmlyd294LmNvbS9kZXZlbG9wZXJzLnBocCcsXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAncHVibGljJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZ2V0SW5zdHJ1bWVudHMnLFxuICAgICAgICAgICAgICAgICdnZXRCZXN0UHJpY2VzJyxcbiAgICAgICAgICAgICAgICAnZ2V0TWFya2V0RGVwdGgnLFxuICAgICAgICAgICAgICAgICdlc3RpbWF0ZU1hcmtldE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnZ2V0VHJhZGVkUHJpY2VWb2x1bWUnLFxuICAgICAgICAgICAgICAgICdnZXRSYXdUcmFkZURhdGEnLFxuICAgICAgICAgICAgICAgICdnZXRTdGF0aXN0aWNzJyxcbiAgICAgICAgICAgICAgICAnZ2V0VGVybWluYWxMaXN0JyxcbiAgICAgICAgICAgICAgICAnZ2V0R3JpZExpc3QnLFxuICAgICAgICAgICAgICAgICdnZXRHcmlkU3RhdGlzdGljcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2dldEluc3RydW1lbnRzJyxcbiAgICAgICAgICAgICAgICAnZ2V0QmVzdFByaWNlcycsXG4gICAgICAgICAgICAgICAgJ2dldE1hcmtldERlcHRoJyxcbiAgICAgICAgICAgICAgICAnZXN0aW1hdGVNYXJrZXRPcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldFRyYWRlZFByaWNlVm9sdW1lJyxcbiAgICAgICAgICAgICAgICAnZ2V0UmF3VHJhZGVEYXRhJyxcbiAgICAgICAgICAgICAgICAnZ2V0U3RhdGlzdGljcycsXG4gICAgICAgICAgICAgICAgJ2dldFRlcm1pbmFsTGlzdCcsXG4gICAgICAgICAgICAgICAgJ2dldEdyaWRMaXN0JyxcbiAgICAgICAgICAgICAgICAnZ2V0R3JpZFN0YXRpc3RpY3MnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3ByaXZhdGUnOiB7XG4gICAgICAgICAgICAnZ2V0JzogW1xuICAgICAgICAgICAgICAgICdjYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ2dldEJhbGFuY2VzJyxcbiAgICAgICAgICAgICAgICAnZ2V0Q29tbWlzc2lvbkRpc2NvdW50JyxcbiAgICAgICAgICAgICAgICAnZ2V0T3JkZXJzJyxcbiAgICAgICAgICAgICAgICAnZ2V0VHJhbnNhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAncGxhY2VPcmRlcicsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3Bvc3QnOiBbXG4gICAgICAgICAgICAgICAgJ2NhbmNlbE9yZGVyJyxcbiAgICAgICAgICAgICAgICAnZ2V0QmFsYW5jZXMnLFxuICAgICAgICAgICAgICAgICdnZXRDb21taXNzaW9uRGlzY291bnQnLFxuICAgICAgICAgICAgICAgICdnZXRPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdnZXRUcmFuc2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICdwbGFjZU9yZGVyJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdHMgKCkge1xuICAgICAgICBsZXQgcHJvZHVjdHMgPSBhd2FpdCB0aGlzLnB1YmxpY0dldEluc3RydW1lbnRzICgpO1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzIChwcm9kdWN0c1sncmVzdWx0J10pO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwga2V5cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwcm9kdWN0c1sncmVzdWx0J11ba2V5c1twXV07XG4gICAgICAgICAgICBsZXQgaWQgPSBwcm9kdWN0WydpbnN0cnVtZW50SUQnXTtcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSBwcm9kdWN0WydzeW1ib2wnXTtcbiAgICAgICAgICAgIGxldCBiYXNlID0gcHJvZHVjdFsnbG9uZ0N1cnJlbmN5J107XG4gICAgICAgICAgICBsZXQgcXVvdGUgPSBwcm9kdWN0WydzaG9ydEN1cnJlbmN5J107XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVQb3N0R2V0QmFsYW5jZXMgKCk7XG4gICAgfSxcblxuICAgIGZldGNoQmVzdFByaWNlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNQb3N0R2V0QmVzdFByaWNlcyAoe1xuICAgICAgICAgICAgJ3N5bWJvbHMnOiBbIHRoaXMuc3ltYm9sIChwcm9kdWN0KSBdLFxuICAgICAgICB9KTtcbiAgICB9LCBcblxuICAgIGZldGNoT3JkZXJCb29rIChwcm9kdWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY1Bvc3RHZXRNYXJrZXREZXB0aCAoe1xuICAgICAgICAgICAgJ3N5bWJvbHMnOiBbIHRoaXMuc3ltYm9sIChwcm9kdWN0KSBdLFxuICAgICAgICAgICAgJ2J1eURlcHRoJzogMTAwLFxuICAgICAgICAgICAgJ3NlbGxEZXB0aCc6IDEwMCxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGZldGNoVGlja2VyIChwcm9kdWN0KSB7XG4gICAgICAgIGxldCBlbmQgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgbGV0IHN0YXJ0ID0gZW5kIC0gODY0MDAwMDA7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0VHJhZGVkUHJpY2VWb2x1bWUgKHtcbiAgICAgICAgICAgICdpbnN0cnVtZW50JzogdGhpcy5zeW1ib2wgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ2VuZERhdGUnOiB0aGlzLnl5eXltbWRkaGhtbXNzIChlbmQpLFxuICAgICAgICAgICAgJ3N0YXJ0RGF0ZSc6IHRoaXMueXl5eW1tZGRoaG1tc3MgKHN0YXJ0KSxcbiAgICAgICAgICAgICdITE9DJzogMSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aWNrZXJzID0gcmVzcG9uc2VbJ3Jlc3VsdCddWydwcmljZVZvbHVtZUxpc3QnXTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAodGlja2Vycyk7XG4gICAgICAgIGxldCBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgbGV0IGxhc3RLZXkgPSBrZXlzW2xlbmd0aCAtIDFdO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1tsYXN0S2V5XTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRoaXMubWlsbGlzZWNvbmRzICgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHRoaXMuaXNvODYwMSAodGltZXN0YW1wKSxcbiAgICAgICAgICAgICdoaWdoJzogcGFyc2VGbG9hdCAodGlja2VyWydoaWdoJ10pLFxuICAgICAgICAgICAgJ2xvdyc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG93J10pLFxuICAgICAgICAgICAgJ2JpZCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhc2snOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogcGFyc2VGbG9hdCAodGlja2VyWydvcGVuJ10pLFxuICAgICAgICAgICAgJ2Nsb3NlJzogcGFyc2VGbG9hdCAodGlja2VyWydjbG9zZSddKSxcbiAgICAgICAgICAgICdmaXJzdCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdsYXN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbG9uZ1ZvbHVtZSddKSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnc2hvcnRWb2x1bWUnXSksXG4gICAgICAgICAgICAnaW5mbyc6IHRpY2tlcixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZmV0Y2hUcmFkZXMgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljR2V0UmF3VHJhZGVEYXRhICh7XG4gICAgICAgICAgICAnaW5zdHJ1bWVudCc6IHRoaXMuc3ltYm9sIChwcm9kdWN0KSxcbiAgICAgICAgICAgICd0aW1lc3Bhbic6IDM2MDAsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjcmVhdGVPcmRlciAocHJvZHVjdCwgdHlwZSwgc2lkZSwgYW1vdW50LCBwcmljZSA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgbGV0IG9yZGVyID0ge1xuICAgICAgICAgICAgJ2luc3RydW1lbnQnOiB0aGlzLnN5bWJvbCAocHJvZHVjdCksXG4gICAgICAgICAgICAnb3JkZXJUeXBlJzogc2lkZS50b1VwcGVyQ2FzZSAoKSxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09ICdsaW1pdCcpXG4gICAgICAgICAgICBvcmRlclsncHJpY2UnXSA9IHByaWNlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlUG9zdFBsYWNlT3JkZXIgKHRoaXMuZXh0ZW5kIChvcmRlciwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAncHVibGljJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddW3R5cGVdO1xuICAgICAgICBsZXQgYXV0aCA9IHt9O1xuICAgICAgICBpZiAodHlwZSA9PSAncHVibGljJykge1xuICAgICAgICAgICAgYXV0aFsna2V5J10gPSB0aGlzLmFwaUtleTtcbiAgICAgICAgICAgIGF1dGhbJ3VzZXInXSA9IHRoaXMubG9naW47XG4gICAgICAgICAgICBhdXRoWydwYXNzJ10gPSB0aGlzLnBhc3N3b3JkO1xuICAgICAgICB9XG4gICAgICAgIGxldCBub25jZSA9IHRoaXMubm9uY2UgKCk7XG4gICAgICAgIGlmIChtZXRob2QgPT0gJ0dFVCcpIHtcbiAgICAgICAgICAgIHVybCArPSAnPycgKyB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHsgXG4gICAgICAgICAgICAgICAgJ21ldGhvZCc6IHBhdGgsIFxuICAgICAgICAgICAgICAgICdpZCc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgYXV0aCwgcGFyYW1zKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoZWFkZXJzID0geyAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH07XG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkgKHsgXG4gICAgICAgICAgICAgICAgJ21ldGhvZCc6IHBhdGgsIFxuICAgICAgICAgICAgICAgICdwYXJhbXMnOiB0aGlzLmV4dGVuZCAoYXV0aCwgcGFyYW1zKSxcbiAgICAgICAgICAgICAgICAnaWQnOiBub25jZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoICh1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSk7XG4gICAgfSxcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgeW9iaXQgPSB7XG5cbiAgICAnaWQnOiAneW9iaXQnLFxuICAgICduYW1lJzogJ1lvQml0JyxcbiAgICAnY291bnRyaWVzJzogJ1JVJyxcbiAgICAncmF0ZUxpbWl0JzogMjAwMCwgLy8gcmVzcG9uc2VzIGFyZSBjYWNoZWQgZXZlcnkgMiBzZWNvbmRzXG4gICAgJ3ZlcnNpb24nOiAnMycsXG4gICAgJ3VybHMnOiB7XG4gICAgICAgICdsb2dvJzogJ2h0dHBzOi8vdXNlci1pbWFnZXMuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzEyOTQ0NTQvMjc3NjY5MTAtY2RjYmZkYWUtNWVlYS0xMWU3LTk4NTktMDNmZWE4NzMyNzJkLmpwZycsXG4gICAgICAgICdhcGknOiAnaHR0cHM6Ly95b2JpdC5uZXQnLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vd3d3LnlvYml0Lm5ldCcsXG4gICAgICAgICdkb2MnOiAnaHR0cHM6Ly93d3cueW9iaXQubmV0L2VuL2FwaS8nLFxuICAgIH0sXG4gICAgJ2FwaSc6IHtcbiAgICAgICAgJ2FwaSc6IHtcbiAgICAgICAgICAgICdnZXQnOiBbXG4gICAgICAgICAgICAgICAgJ2RlcHRoL3twYWlyc30nLFxuICAgICAgICAgICAgICAgICdpbmZvJyxcbiAgICAgICAgICAgICAgICAndGlja2VyL3twYWlyc30nLFxuICAgICAgICAgICAgICAgICd0cmFkZXMve3BhaXJzfScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAndGFwaSc6IHtcbiAgICAgICAgICAgICdwb3N0JzogW1xuICAgICAgICAgICAgICAgICdBY3RpdmVPcmRlcnMnLFxuICAgICAgICAgICAgICAgICdDYW5jZWxPcmRlcicsXG4gICAgICAgICAgICAgICAgJ0dldERlcG9zaXRBZGRyZXNzJyxcbiAgICAgICAgICAgICAgICAnZ2V0SW5mbycsXG4gICAgICAgICAgICAgICAgJ09yZGVySW5mbycsXG4gICAgICAgICAgICAgICAgJ1RyYWRlJywgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ1RyYWRlSGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ1dpdGhkcmF3Q29pbnNUb0FkZHJlc3MnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMuYXBpR2V0SW5mbyAoKTtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyAocHJvZHVjdHNbJ3BhaXJzJ10pO1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwga2V5cy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgbGV0IGlkID0ga2V5c1twXTtcbiAgICAgICAgICAgIGxldCBwcm9kdWN0ID0gcHJvZHVjdHNbJ3BhaXJzJ11baWRdO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IGlkLnRvVXBwZXJDYXNlICgpLnJlcGxhY2UgKCdfJywgJy8nKTtcbiAgICAgICAgICAgIGxldCBbIGJhc2UsIHF1b3RlIF0gPSBzeW1ib2wuc3BsaXQgKCcvJyk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcGlQb3N0R2V0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBpR2V0RGVwdGhQYWlycyAoe1xuICAgICAgICAgICAgJ3BhaXJzJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnByb2R1Y3QgKHByb2R1Y3QpO1xuICAgICAgICBsZXQgdGlja2VycyA9IGF3YWl0IHRoaXMuYXBpR2V0VGlja2VyUGFpcnMgKHtcbiAgICAgICAgICAgICdwYWlycyc6IHBbJ2lkJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgdGlja2VyID0gdGlja2Vyc1twWydpZCddXTtcbiAgICAgICAgbGV0IHRpbWVzdGFtcCA9IHRpY2tlclsndXBkYXRlZCddICogMTAwMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2J1eSddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3NlbGwnXSksXG4gICAgICAgICAgICAndndhcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdvcGVuJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Nsb3NlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2ZpcnN0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2xhc3QnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xhc3QnXSksXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHBhcnNlRmxvYXQgKHRpY2tlclsnYXZnJ10pLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbF9jdXInXSksXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbCddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcGlHZXRUcmFkZXNQYWlycyAoe1xuICAgICAgICAgICAgJ3BhaXJzJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlT3JkZXIgKHByb2R1Y3QsIHR5cGUsIHNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlID09ICdtYXJrZXQnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICh0aGlzLmlkICsgJyBhbGxvd3MgbGltaXQgb3JkZXJzIG9ubHknKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFwaVBvc3RUcmFkZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICdwYWlyJzogdGhpcy5wcm9kdWN0SWQgKHByb2R1Y3QpLFxuICAgICAgICAgICAgJ3R5cGUnOiBzaWRlLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdyYXRlJzogcHJpY2UsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxPcmRlciAoaWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcGlQb3N0Q2FuY2VsT3JkZXIgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnb3JkZXJfaWQnOiBpZCxcbiAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfSxcblxuICAgIHJlcXVlc3QgKHBhdGgsIHR5cGUgPSAnYXBpJywgbWV0aG9kID0gJ0dFVCcsIHBhcmFtcyA9IHt9LCBoZWFkZXJzID0gdW5kZWZpbmVkLCBib2R5ID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVybHNbJ2FwaSddICsgJy8nICsgdHlwZTtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ2FwaScpIHtcbiAgICAgICAgICAgIHVybCArPSAnLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm9taXQgKHBhcmFtcywgdGhpcy5leHRyYWN0UGFyYW1zIChwYXRoKSk7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMgKHF1ZXJ5KS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdXJsICs9ICc/JyArIHRoaXMudXJsZW5jb2RlIChxdWVyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbm9uY2UgPSB0aGlzLm5vbmNlICgpO1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gdGhpcy5leHRlbmQgKHsgJ21ldGhvZCc6IHBhdGgsICdub25jZSc6IG5vbmNlIH0sIHBhcmFtcyk7XG4gICAgICAgICAgICBib2R5ID0gdGhpcy51cmxlbmNvZGUgKHF1ZXJ5KTtcbiAgICAgICAgICAgIGhlYWRlcnMgPSB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdrZXknOiB0aGlzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnc2lnbic6IHRoaXMuaG1hYyAoYm9keSwgdGhpcy5zZWNyZXQsICdzaGE1MTInKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2ggKHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5KTtcbiAgICB9LFxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciB6YWlmID0ge1xuXG4gICAgJ2lkJzogJ3phaWYnLFxuICAgICduYW1lJzogJ1phaWYnLFxuICAgICdjb3VudHJpZXMnOiAnSlAnLFxuICAgICdyYXRlTGltaXQnOiAzMDAwLFxuICAgICd2ZXJzaW9uJzogJzEnLFxuICAgICd1cmxzJzoge1xuICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2OTI3LTM5Y2EyYWRhLTVlZWItMTFlNy05NzJmLTFiNDE5OTUxOGNhNi5qcGcnLFxuICAgICAgICAnYXBpJzogJ2h0dHBzOi8vYXBpLnphaWYuanAnLFxuICAgICAgICAnd3d3JzogJ2h0dHBzOi8vemFpZi5qcCcsXG4gICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAnaHR0cHM6Ly9jb3JwLnphaWYuanAvYXBpLWRvY3MnLFxuICAgICAgICAgICAgJ2h0dHBzOi8vY29ycC56YWlmLmpwL2FwaS1kb2NzL2FwaV9saW5rcycsXG4gICAgICAgICAgICAnaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvemFpZi5qcCcsXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL3lvdTIxOTc5L25vZGUtemFpZicsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAnYXBpJzoge1xuICAgICAgICAnYXBpJzoge1xuICAgICAgICAgICAgJ2dldCc6IFtcbiAgICAgICAgICAgICAgICAnZGVwdGgve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAnY3VycmVuY2llcy97cGFpcn0nLFxuICAgICAgICAgICAgICAgICdjdXJyZW5jaWVzL2FsbCcsXG4gICAgICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXJzL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ2N1cnJlbmN5X3BhaXJzL2FsbCcsXG4gICAgICAgICAgICAgICAgJ2xhc3RfcHJpY2Uve3BhaXJ9JyxcbiAgICAgICAgICAgICAgICAndGlja2VyL3twYWlyfScsXG4gICAgICAgICAgICAgICAgJ3RyYWRlcy97cGFpcn0nLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3RhcGknOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnYWN0aXZlX29yZGVycycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbF9vcmRlcicsXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRfaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ2dldF9pZF9pbmZvJyxcbiAgICAgICAgICAgICAgICAnZ2V0X2luZm8nLFxuICAgICAgICAgICAgICAgICdnZXRfaW5mbzInLFxuICAgICAgICAgICAgICAgICdnZXRfcGVyc29uYWxfaW5mbycsXG4gICAgICAgICAgICAgICAgJ3RyYWRlJyxcbiAgICAgICAgICAgICAgICAndHJhZGVfaGlzdG9yeScsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JyxcbiAgICAgICAgICAgICAgICAnd2l0aGRyYXdfaGlzdG9yeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICAnZWNhcGknOiB7XG4gICAgICAgICAgICAncG9zdCc6IFtcbiAgICAgICAgICAgICAgICAnY3JlYXRlSW52b2ljZScsXG4gICAgICAgICAgICAgICAgJ2dldEludm9pY2UnLFxuICAgICAgICAgICAgICAgICdnZXRJbnZvaWNlSWRzQnlPcmRlck51bWJlcicsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbEludm9pY2UnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0cyAoKSB7XG4gICAgICAgIGxldCBwcm9kdWN0cyA9IGF3YWl0IHRoaXMuYXBpR2V0Q3VycmVuY3lQYWlyc0FsbCAoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHByb2R1Y3RzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBsZXQgcHJvZHVjdCA9IHByb2R1Y3RzW3BdO1xuICAgICAgICAgICAgbGV0IGlkID0gcHJvZHVjdFsnY3VycmVuY3lfcGFpciddO1xuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IHByb2R1Y3RbJ25hbWUnXTtcbiAgICAgICAgICAgIGxldCBbIGJhc2UsIHF1b3RlIF0gPSBzeW1ib2wuc3BsaXQgKCcvJyk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCAoe1xuICAgICAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAgICAgJ2Jhc2UnOiBiYXNlLFxuICAgICAgICAgICAgICAgICdxdW90ZSc6IHF1b3RlLFxuICAgICAgICAgICAgICAgICdpbmZvJzogcHJvZHVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGZldGNoQmFsYW5jZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcGlQb3N0R2V0SW5mbyAoKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hPcmRlckJvb2sgKHByb2R1Y3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBpR2V0RGVwdGhQYWlyICAoe1xuICAgICAgICAgICAgJ3BhaXInOiB0aGlzLnByb2R1Y3RJZCAocHJvZHVjdCksXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3luYyBmZXRjaFRpY2tlciAocHJvZHVjdCkge1xuICAgICAgICBsZXQgdGlja2VyID0gYXdhaXQgdGhpcy5hcGlHZXRUaWNrZXJQYWlyICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSB0aGlzLm1pbGxpc2Vjb25kcyAoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnaGlnaCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnaGlnaCddKSxcbiAgICAgICAgICAgICdsb3cnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2xvdyddKSxcbiAgICAgICAgICAgICdiaWQnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2JpZCddKSxcbiAgICAgICAgICAgICdhc2snOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ2FzayddKSxcbiAgICAgICAgICAgICd2d2FwJzogcGFyc2VGbG9hdCAodGlja2VyWyd2d2FwJ10pLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmlyc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbGFzdCc6IHBhcnNlRmxvYXQgKHRpY2tlclsnbGFzdCddKSxcbiAgICAgICAgICAgICdjaGFuZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncGVyY2VudGFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhdmVyYWdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Jhc2VWb2x1bWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncXVvdGVWb2x1bWUnOiBwYXJzZUZsb2F0ICh0aWNrZXJbJ3ZvbHVtZSddKSxcbiAgICAgICAgICAgICdpbmZvJzogdGlja2VyLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBmZXRjaFRyYWRlcyAocHJvZHVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcGlHZXRUcmFkZXNQYWlyICh7XG4gICAgICAgICAgICAncGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU9yZGVyIChwcm9kdWN0LCB0eXBlLCBzaWRlLCBhbW91bnQsIHByaWNlID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBpZiAodHlwZSA9PSAnbWFya2V0JylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAodGhpcy5pZCArICcgYWxsb3dzIGxpbWl0IG9yZGVycyBvbmx5Jyk7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcGlQb3N0VHJhZGUgKHRoaXMuZXh0ZW5kICh7XG4gICAgICAgICAgICAnY3VycmVuY3lfcGFpcic6IHRoaXMucHJvZHVjdElkIChwcm9kdWN0KSxcbiAgICAgICAgICAgICdhY3Rpb24nOiAoc2lkZSA9PSAnYnV5JykgPyAnYmlkJyA6ICdhc2snLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdwcmljZSc6IHByaWNlLFxuICAgICAgICB9LCBwYXJhbXMpKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsT3JkZXIgKGlkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy50YXBpUG9zdENhbmNlbE9yZGVyICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgJ29yZGVyX2lkJzogaWQsXG4gICAgICAgIH0sIHBhcmFtcykpO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0IChwYXRoLCB0eXBlID0gJ2FwaScsIG1ldGhvZCA9ICdHRVQnLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHVuZGVmaW5lZCwgYm9keSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmxzWydhcGknXSArICcvJyArIHR5cGU7XG4gICAgICAgIGlmICh0eXBlID09ICdhcGknKSB7XG4gICAgICAgICAgICB1cmwgKz0gJy8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5vbmNlID0gdGhpcy5ub25jZSAoKTtcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLnVybGVuY29kZSAodGhpcy5leHRlbmQgKHtcbiAgICAgICAgICAgICAgICAnbWV0aG9kJzogcGF0aCxcbiAgICAgICAgICAgICAgICAnbm9uY2UnOiBub25jZSxcbiAgICAgICAgICAgIH0sIHBhcmFtcykpO1xuICAgICAgICAgICAgaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogYm9keS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0tleSc6IHRoaXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgICdTaWduJzogdGhpcy5obWFjIChib2R5LCB0aGlzLnNlY3JldCwgJ3NoYTUxMicpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaCAodXJsLCBtZXRob2QsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH0sXG59XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxudmFyIG1hcmtldHMgPSB7XG5cbiAgICAnXzFicm9rZXInOiAgICBfMWJyb2tlcixcbiAgICAnXzFidGN4ZSc6ICAgICBfMWJ0Y3hlLFxuICAgICdhbnhwcm8nOiAgICAgIGFueHBybyxcbiAgICAnYml0MmMnOiAgICAgICBiaXQyYyxcbiAgICAnYml0YmF5JzogICAgICBiaXRiYXksXG4gICAgJ2JpdGJheXMnOiAgICAgYml0YmF5cyxcbiAgICAnYml0Y29pbmNvaWQnOiBiaXRjb2luY29pZCxcbiAgICAnYml0ZmluZXgnOiAgICBiaXRmaW5leCxcbiAgICAnYml0bGlzaCc6ICAgICBiaXRsaXNoLFxuICAgICdiaXRtYXJrZXQnOiAgIGJpdG1hcmtldCxcbiAgICAnYml0bWV4JzogICAgICBiaXRtZXgsXG4gICAgJ2JpdHNvJzogICAgICAgYml0c28sXG4gICAgJ2JpdHN0YW1wJzogICAgYml0c3RhbXAsXG4gICAgJ2JpdHRyZXgnOiAgICAgYml0dHJleCxcbiAgICAnYnRjY2hpbmEnOiAgICBidGNjaGluYSxcbiAgICAnYnRjeCc6ICAgICAgICBidGN4LFxuICAgICdieGludGgnOiAgICAgIGJ4aW50aCxcbiAgICAnY2NleCc6ICAgICAgICBjY2V4LFxuICAgICdjZXgnOiAgICAgICAgIGNleCxcbiAgICAnY29pbmNoZWNrJzogICBjb2luY2hlY2ssXG4gICAgJ2NvaW5tYXRlJzogICAgY29pbm1hdGUsXG4gICAgJ2NvaW5zZWN1cmUnOiAgY29pbnNlY3VyZSxcbiAgICAnZXhtbyc6ICAgICAgICBleG1vLFxuICAgICdmeWJzZSc6ICAgICAgIGZ5YnNlLFxuICAgICdmeWJzZyc6ICAgICAgIGZ5YnNnLFxuICAgICdnZGF4JzogICAgICAgIGdkYXgsXG4gICAgJ2dlbWluaSc6ICAgICAgZ2VtaW5pLFxuICAgICdoaXRidGMnOiAgICAgIGhpdGJ0YyxcbiAgICAnaHVvYmknOiAgICAgICBodW9iaSxcbiAgICAnaXRiaXQnOiAgICAgICBpdGJpdCxcbiAgICAnanViaSc6ICAgICAgICBqdWJpLFxuICAgICdrcmFrZW4nOiAgICAgIGtyYWtlbixcbiAgICAnbHVubyc6ICAgICAgICBsdW5vLFxuICAgICdva2NvaW5jbnknOiAgIG9rY29pbmNueSxcbiAgICAnb2tjb2ludXNkJzogICBva2NvaW51c2QsXG4gICAgJ3BheW1pdW0nOiAgICAgcGF5bWl1bSxcbiAgICAncG9sb25pZXgnOiAgICBwb2xvbmlleCxcbiAgICAncXVhZHJpZ2FjeCc6ICBxdWFkcmlnYWN4LFxuICAgICdxdW9pbmUnOiAgICAgIHF1b2luZSxcbiAgICAndGhlcm9jayc6ICAgICB0aGVyb2NrLFxuICAgICd2YXVsdG9ybyc6ICAgIHZhdWx0b3JvLFxuICAgICd2aXJ3b3gnOiAgICAgIHZpcndveCxcbiAgICAneW9iaXQnOiAgICAgICB5b2JpdCxcbiAgICAnemFpZic6ICAgICAgICB6YWlmLFxufVxuXG5sZXQgZGVmaW5lQWxsTWFya2V0cyA9IGZ1bmN0aW9uIChtYXJrZXRzKSB7XG4gICAgbGV0IHJlc3VsdCA9IHt9XG4gICAgZm9yIChsZXQgaWQgaW4gbWFya2V0cylcbiAgICAgICAgcmVzdWx0W2lkXSA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWFya2V0IChleHRlbmQgKG1hcmtldHNbaWRdLCBwYXJhbXMpKVxuICAgICAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxufVxuXG5pZiAoaXNOb2RlKVxuICAgIG1vZHVsZS5leHBvcnRzID0gZGVmaW5lQWxsTWFya2V0cyAobWFya2V0cylcbmVsc2VcbiAgICB3aW5kb3cuY2N4dCA9IGRlZmluZUFsbE1hcmtldHMgKG1hcmtldHMpXG5cbn0pICgpIl19