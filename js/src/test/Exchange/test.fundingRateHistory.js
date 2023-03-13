import testSharedMethods from './test.sharedMethods';
function testFundingRateHistory(exchange, method, entry, symbol) {
    const format = {
        'info': {},
        'symbol': 'BTC/USDT:USDT',
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'fundingRate': exchange.parseNumber('0.0006'),
    };
    const emptyNotAllowedFor = ['symbol', 'timestamp', 'fundingRate'];
    testSharedMethods.assertStructureKeys(exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertSymbol(exchange, method, entry, 'symbol', symbol);
    testSharedMethods.assertCommonTimestamp(exchange, method, entry);
}
export default testFundingRateHistory;
