import { Exchange } from "../../../../ccxt";
import testSharedMethods from './test.sharedMethods.js';

function testLeverageTier (exchange: Exchange, skippedProperties: object, method: string, entry: object) {
    const format = {
        'tier': exchange.parseNumber ('1'),
        'minNotional': exchange.parseNumber ('0'),
        'maxNotional': exchange.parseNumber ('5000'),
        'maintenanceMarginRate': exchange.parseNumber ('0.01'),
        'maxLeverage': exchange.parseNumber ('25'),
        'info': {},
    };
    const emptyAllowedFor = [ 'maintenanceMarginRate' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    //
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'tier', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'minNotional', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'maxNotional', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'maxLeverage', '1');
    testSharedMethods.assertLessOrEqual (exchange, skippedProperties, method, entry, 'maintenanceMarginRate', '1');
}

export default testLeverageTier;
