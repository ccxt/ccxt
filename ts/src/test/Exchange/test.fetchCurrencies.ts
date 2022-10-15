
// ----------------------------------------------------------------------------

import testCurrency from './test.currency.js';

// ----------------------------------------------------------------------------

export default async (exchange) => {
    const method = 'fetchCurrencies';
    const skippedExchanges = [];
    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...');
        return;
    }
    if (exchange.has[method] === true || exchange.has[method] === 'emulated') {
        const currencies = await exchange[method] ();
        if (currencies !== undefined) {
            const values = Object.values (currencies);
            for (let i = 0; i < values.length; i++) {
                const currency = values[i];
                testCurrency (exchange, currency, method);
            }
        }
        return currencies;
    } else {
        console.log (method + '() is not supported');
    }
};
