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
    const minmiumActiveCurrenciesPcnt = 40; // eg. at least 50% currencies should be active
    const requiredActiveCurrencies = [ 'BTC', 'ETH', 'USDT', 'USDC' ];
    if (currencies !== undefined) {
        const values = Object.values (currencies);
        testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, values);
        const currenciesLength = values.length;
        for (let i = 0; i < currenciesLength; i++) {
            const currencyObj = values[i];
            testCurrency (exchange, skippedProperties, method, currencyObj);
            // detailed check for deposit/withdraw
            const active = exchange.safeBool (currencyObj, 'active', false);
            const withdraw = exchange.safeBool (currencyObj, 'withdraw', false);
            const deposit = exchange.safeBool (currencyObj, 'deposit', false);
            if (active) {
                activeAmount = activeAmount + 1;
            }
            // check if major currency
            const code = exchange.safeString (currencyObj, 'code', undefined);
            if (exchange.inArray (code, requiredActiveCurrencies)) {
                assert (withdraw && deposit, 'Major currency ' + code + ' should have withdraw and deposit enabled');
            }
        }
        const activeCurrenciesPcnt = (activeAmount / currenciesLength) * 100;
        assert (activeCurrenciesPcnt >= minmiumActiveCurrenciesPcnt, 'Active currencies percentage is below the minimum (' + minmiumActiveCurrenciesPcnt.toString () + ') required: ' + activeCurrenciesPcnt.toString () + '%');
    }
    return true;
}

export default testFetchCurrencies;
