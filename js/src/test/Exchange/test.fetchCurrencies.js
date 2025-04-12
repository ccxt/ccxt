import testCurrency from './base/test.currency.js';
import testSharedMethods from './base/test.sharedMethods.js';
async function testFetchCurrencies(exchange, skippedProperties) {
    const method = 'fetchCurrencies';
    // const isNative = exchange.has['fetchCurrencies'] && exchange.has['fetchCurrencies'] !== 'emulated';
    const currencies = await exchange.fetchCurrencies();
    // todo: try to invent something to avoid undefined undefined, i.e. maybe move into private and force it to have a value
    if (currencies !== undefined) {
        const values = Object.values(currencies);
        testSharedMethods.assertNonEmtpyArray(exchange, skippedProperties, method, values);
        for (let i = 0; i < values.length; i++) {
            testCurrency(exchange, skippedProperties, method, values[i]);
        }
    }
    return true;
}
export default testFetchCurrencies;
