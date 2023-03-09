'use strict'

const assert = require ('assert');
const testOrderBook = require ('./test.orderBook.js');

async function testFetchL2OrderBook (exchange, symbol) {
    const method = 'fetchL2OrderBook';
    const orderBook = await exchange[method] (symbol);
    assert (typeof orderBook === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json(orderBook));
    console.log (exchange.id, method, 'fetched, with items length', orderBook['bids'].length, 'asserting now ...');
    testOrderBook (exchange, method, orderBook, symbol);
}

module.exports = testFetchL2OrderBook;