import { Exchange } from "../../../ccxt";
import testTakerVolume from './base/test.takerVolume.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchTakerBuySellVolume (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchTakerBuySellVolume';
    const takerVolumes = await exchange.fetchTakerBuySellVolume (symbol);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, takerVolumes, symbol);
    for (let i = 0; i < takerVolumes.length; i++) {
        testTakerVolume (exchange, skippedProperties, method, takerVolumes[i]);
    }
    return true;
}

export default testFetchTakerBuySellVolume;
