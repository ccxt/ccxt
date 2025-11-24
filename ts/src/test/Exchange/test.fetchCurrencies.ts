import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testCurrency from './base/test.currency.js';
import testSharedMethods from './base/test.sharedMethods.js';


async function testFetchCurrencies (exchange: Exchange, skippedProperties: object) {
    const method = 'fetchCurrencies';
    const currencies = await exchange.fetchCurrencies ();
    // todo: try to invent something to avoid undefined undefined, i.e. maybe move into private and force it to have a value
    let numInactiveCurrencies = 0;
    const maxInactiveCurrenciesPercentage = exchange.safeInteger (skippedProperties, 'maxInactiveCurrenciesPercentage', 50); // no more than X% currencies should be inactive
    const requiredActiveCurrencies = [ 'BTC', 'ETH', 'USDT', 'USDC' ];
    const features = exchange.features;
    const featuresSpot = exchange.safeDict (features, 'spot', {});
    const fetchCurrencies = exchange.safeDict (featuresSpot, 'fetchCurrencies', {});
    const isFetchCurrenciesPrivate = exchange.safeValue (fetchCurrencies, 'private', false);
    if (!isFetchCurrenciesPrivate) {
        const values = Object.values (currencies);
        testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, values);
        const currenciesLength = values.length;
        // ensure exchange returns enough length of currencies
        const skipAmount = ('amountOfCurrencies' in skippedProperties);
        assert (skipAmount || currenciesLength > 5, exchange.id + ' ' + method + ' must return at least several currencies, but it returned ' + currenciesLength.toString ());
        // allow skipped exchanges
        const skipActive = ('activeCurrenciesQuota' in skippedProperties);
        const skipMajorCurrencyCheck = ('activeMajorCurrencies' in skippedProperties);
        // loop
        for (let i = 0; i < currenciesLength; i++) {
            const currency = values[i];
            testCurrency (exchange, skippedProperties, method, currency);
            // detailed check for deposit/withdraw
            const active = exchange.safeBool (currency, 'active');
            if (active === false) {
                numInactiveCurrencies = numInactiveCurrencies + 1;
            }
            // ensure that major currencies are active and enabled for deposit and withdrawal
            const code = exchange.safeString (currency, 'code', undefined);
            const withdraw = exchange.safeBool (currency, 'withdraw');
            const deposit = exchange.safeBool (currency, 'deposit');
            if (exchange.inArray (code, requiredActiveCurrencies)) {
                assert (skipMajorCurrencyCheck || (withdraw && deposit), 'Major currency ' + code + ' should have withdraw and deposit flags enabled');
            }
        }
        // check at least X% of currencies are active
        const inactiveCurrenciesPercentage = (numInactiveCurrencies / currenciesLength) * 100;
        assert (skipActive || (inactiveCurrenciesPercentage < maxInactiveCurrenciesPercentage), 'Percentage of inactive currencies is too high at ' + inactiveCurrenciesPercentage.toString () + '% that is more than the allowed maximum of ' + maxInactiveCurrenciesPercentage.toString () + '%');
        detectCurrencyConflicts (exchange, currencies);
    }
    return true;
}

function detectCurrencyConflicts (exchange: Exchange, currencyValues: any) {
    // detect if there are currencies with different ids for the same code
    const ids = {};
    const keys = Object.keys (currencyValues);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const currency = currencyValues[key];
        const code = currency['code'];
        if (!(code in ids)) {
            ids[code] = currency['id'];
        } else {
            const isDifferent = ids[code] !== currency['id'];
            assert (!isDifferent, exchange.id + ' fetchCurrencies() has different ids for the same code: ' + code + ' ' + ids[code] + ' ' + currency['id']);
        }
    }
    return true;
}

export default testFetchCurrencies;
