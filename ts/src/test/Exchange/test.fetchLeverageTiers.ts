import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testLeverageTier from './base/test.leverageTier.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchLeverageTiers (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchLeverageTiers';
    const tiers = await exchange.fetchLeverageTiers ([ 'symbol' ]);
    // const format = {
    //     'RAY/USDT': [
    //       {},
    //     ],
    // };
    assert (typeof tiers === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (tiers));
    const tierKeys = Object.keys (tiers);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, tierKeys, symbol);
    for (let i = 0; i < tierKeys.length; i++) {
        const tiersForSymbol = tiers[tierKeys[i]];
        testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, tiersForSymbol, symbol);
        for (let j = 0; j < tiersForSymbol.length; j++) {
            testLeverageTier (exchange, skippedProperties, method, tiersForSymbol[j]);
        }
    }
    return true;
}

export default testFetchLeverageTiers;
