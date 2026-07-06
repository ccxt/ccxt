import assert from 'assert';
import { Exchange } from "../../../ccxt.js";
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
            const code = exchange.safeString (currency, 'code');
            const withdraw = exchange.safeBool (currency, 'withdraw');
            const deposit = exchange.safeBool (currency, 'deposit');
            const isMicaCompliant = exchange.safeBool (exchange.options, 'mica', false);
            const skipUsdtForMica = isMicaCompliant && code === 'USDT';
            if (exchange.inArray (code, requiredActiveCurrencies) && !skipMajorCurrencyCheck && !skipUsdtForMica) {
                assert (withdraw && deposit, 'Major currency ' + code + ' should have withdraw and deposit flags enabled ::: ' + exchange.json (currency));
            }
        }
        // check at least X% of currencies are active
        const inactiveCurrenciesPercentage = (numInactiveCurrencies / currenciesLength) * 100;
        assert (skipActive || (inactiveCurrenciesPercentage < maxInactiveCurrenciesPercentage), 'Percentage of inactive currencies is too high at ' + inactiveCurrenciesPercentage.toString () + '% that is more than the allowed maximum of ' + maxInactiveCurrenciesPercentage.toString () + '%');
        detectCurrencyConflicts (exchange, currencies);
        if (!('skipObsoleteNetworks' in skippedProperties)) {
            detectObsoleteNetworks (exchange);
        }
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

function detectObsoleteNetworks (exchange: Exchange) {
    // detect if there are networks defined in options, but no longer exist on exchange
    const networks = exchange.safeDict (exchange.options, 'networks');
    if (networks === undefined) {
        return;
    }
    const allNetworkCodes: string[] = Object.keys (networks);
    if (allNetworkCodes.length <= 0) {
        return;
    }
    let collectedNetworkCodes: string[] = [];
    const currencies = Object.values (exchange.currencies);
    for (let i = 0; i < currencies.length; i++) {
        const currency = currencies[i];
        const currencyNetworks = exchange.safeDict (currency, 'networks', {});
        const networkCodes = Object.keys (currencyNetworks);
        collectedNetworkCodes = exchange.arrayConcat (collectedNetworkCodes, networkCodes);
    }
    const filteredCodes = exchange.unique (collectedNetworkCodes);
    for (let j = 0; j < allNetworkCodes.length; j++) {
        const networkCode = allNetworkCodes[j];
        if (!exchange.inArray (networkCode, filteredCodes)) {
            console.log ('Warning: networkCode ' + networkCode + ' is defined in exchange.options.networks, but exchange no longer supports that chain.');
        }
    }
}

export default testFetchCurrencies;
