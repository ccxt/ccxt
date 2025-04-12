import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testCurrency from './base/test.currency.js';
import testSharedMethods from './base/test.sharedMethods.js';


async function testFetchCurrencies (exchange: Exchange, skippedProperties: object) {
    const method = 'fetchCurrencies';
    // const isNative = exchange.has['fetchCurrencies'] && exchange.has['fetchCurrencies'] !== 'emulated';
    const currencies = await exchange.fetchCurrencies ();
    // todo: try to invent something to avoid undefined undefined, i.e. maybe move into private and force it to have a value
    let activeAmount = 0;
    const minmiumActiveCurrenciesPcnt = 40; // eg. at least X% currencies should be active
    const requiredActiveCurrencies = [ 'BTC', 'ETH', 'USDT', 'USDC' ];
    if (currencies !== undefined) {
        const values = Object.values (currencies);
        testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, values);
        const currenciesLength = values.length;
        // ensure exchange returns enough length of currencies
        assert (currenciesLength > 5, exchange.id + ' ' + method + ' must return at least several currencies, but it returned ' + currenciesLength.toString ());
        // allow skipped exchanges
        const skipActive = ('active' in skippedProperties);
        // loop
        for (let i = 0; i < currenciesLength; i++) {
            const currencyObj = values[i];
            testCurrency (exchange, skippedProperties, method, currencyObj);
            // detailed check for deposit/withdraw
            const active = exchange.safeBool (currencyObj, 'active', false);
            if (active) {
                activeAmount = activeAmount + 1;
            }
            // ensure that major currencies are not disabled for W/D
            const code = exchange.safeString (currencyObj, 'code', undefined);
            if (exchange.inArray (code, requiredActiveCurrencies)) {
                assert (skipActive || active, 'Major currency ' + code + ' should have withdraw and deposit enabled');
            }
        }
        // check at least X% of currencies are active
        const activeCurrenciesPcnt = (activeAmount / currenciesLength) * 100;
        assert (skipActive || (activeCurrenciesPcnt >= minmiumActiveCurrenciesPcnt), 'Percentage of active currencies is too low at ' + activeCurrenciesPcnt.toString () + '% that is less than the required minimum of ' + minmiumActiveCurrenciesPcnt.toString () + '%');
    }
    return true;
}

export default testFetchCurrencies;
