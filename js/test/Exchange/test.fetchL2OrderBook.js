'use strict'

const testOrderBook = require ('./test.orderBook.js');

async function testFetchL2OrderBook(exchange, symbol) {
    const method = 'fetchL2OrderBook';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const orderBook = await exchange[method] (symbol);
    assert (typeof orderBook === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json(orderBook));
    console.log (exchange.id, method, 'fetched, with items length', orderBook['bids'].length, 'asserting now.');
    testOrderBook (exchange, method, orderBook, symbol);
}

module.exports = testFetchL2OrderBook;