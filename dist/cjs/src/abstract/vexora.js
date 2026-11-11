'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetProducts(params = {}) {
        return this.request('products', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetProductsIdBook(params = {}) {
        return this.request('products/{id}/book', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetProductsIdTrades(params = {}) {
        return this.request('products/{id}/trades', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetProductsIdCandles(params = {}) {
        return this.request('products/{id}/candles', ['public'], 'GET', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
