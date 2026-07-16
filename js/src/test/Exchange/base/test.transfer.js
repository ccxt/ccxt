import testSharedMethods from './test.sharedMethods.js';
function testTransfer(exchange, skippedProperties, method, entry, requestedCode) {
    const format = {
        'info': {},
        'id': '1234',
        'timestamp': 1502962946216,
        'datetime': '2017-08-17 12:42:48.000',
        'currency': 'USDT',
        'amount': exchange.parseNumber('1.234'),
        'fromAccount': 'spot',
        'toAccount': 'swap',
        'status': 'ok',
    };
    const emptyAllowedFor = ['fromAccount', 'toAccount'];
    testSharedMethods.assertStructure(exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertTimestampAndDatetime(exchange, skippedProperties, method, entry, exchange.milliseconds());
    testSharedMethods.assertCurrencyCode(exchange, skippedProperties, method, entry, entry['currency'], requestedCode);
    //
    testSharedMethods.assertInArray(exchange, skippedProperties, method, entry, 'status', ['ok', 'pending', 'failed']);
    testSharedMethods.assertGreaterOrEqual(exchange, skippedProperties, method, entry, 'amount', '0');
}
export default testTransfer;
