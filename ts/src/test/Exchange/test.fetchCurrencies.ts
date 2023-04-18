
import testCurrency from './base/test.currency.js';

async function testFetchCurrencies (exchange) {
    const method = 'fetchCurrencies';
    const currencies = await exchange.fetchCurrencies ();
    // todo: try to invent something to avoid undefined undefined, i.e. maybe move into private and force it to have a value
    if (currencies !== undefined) {
        const values = Object.values (currencies);
        for (let i = 0; i < values.length; i++) {
            testCurrency (exchange, method, values[i]);
        }
    }
}

export default testFetchCurrencies;
