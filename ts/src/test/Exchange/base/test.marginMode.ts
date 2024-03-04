import testSharedMethods from './test.sharedMethods.js';

function testMarginMode (exchange, skippedProperties, method, entry) {
    const format = {
        'info': {},
        'symbol': 'BTC/USDT:USDT',
        'marginMode': 'cross',
    };
    const emptyAllowedFor = [ 'symbol' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
}

export default testMarginMode;
