'use strict';

const assert = require ('assert');
const testLeverageTier = require ('./test.leverageTier.js');

async function testFetchMarketLeverageTiers (exchange, symbol) {
    const method = 'fetchMarketLeverageTiers';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const tiers = await exchange [method] (symbol);
    assert (Array.isArray(tiers), exchange.id + ' ' + method + ' ' + symbol + ' must return an array. ' + exchange.json(tiers));
    const arrayLength = tiers.length;
    assert (arrayLength >= 1, exchange.id + ' ' + method + ' ' + symbol + ' must return an array with at least one entry. ' + exchange.json(tiers));
    console.log (exchange.id, method, 'fetched', arrayLength, 'entries, asserting each ...');
    for (let j=0; j < tiers.length; j++) {
        testLeverageTier (exchange, method, tiers[j]);
    }
}

module.exports = testFetchMarketLeverageTiers;