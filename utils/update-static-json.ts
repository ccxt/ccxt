//
// Usage:
//
//     tsx ./utils/update-static-json.ts binance BTC/USDT
// or
//     npm run static-data-updater binance BTC/USDT
//
import fs from 'fs';
import { platform } from 'process'
import ccxt from '../ts/ccxt.js';

const [,, ...args] = process.argv;

let __dirname = new URL('.', import.meta.url).pathname;
if (platform === 'win32' && __dirname[0] === '/') {
    __dirname = __dirname.substring (1);
}
const rootDir = __dirname + '/../';

function write (filename, data) {
    return fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

const exchangeId = args[0];
const symbolOrCurrency = args[1];
const errorMessage = 'Please specify correct format, e.g. `node ./utils/update-static-json.js binance BTC/USDT` (you can also pass a single CurrencyCode instead of a symbol)';

if (!exchangeId || !symbolOrCurrency) {
    console.log(errorMessage);
    process.exit(1);
}
if (!ccxt.exchanges.includes(exchangeId)) {
    console.log('Exchange id ' + exchangeId + ' not found in exchanges.json');
    process.exit(1);
}

const isMarketOrCurrency = symbolOrCurrency.includes('/');
const filePathForMarkets = rootDir + `/ts/src/test/static/markets/${exchangeId}.json`;
const marketsJson = JSON.parse (fs.readFileSync(filePathForMarkets, "utf8"));
const filePathForCurrencies = rootDir + `/ts/src/test/static/currencies/${exchangeId}.json`;
const currenciesJson = JSON.parse (fs.readFileSync(filePathForCurrencies, "utf8"));

async function main() {
    try {
        const exchange = new ccxt[exchangeId]();
        await exchange.loadMarkets();
        // check whether it's market or currency
        const targetObject = isMarketOrCurrency ? exchange.markets[symbolOrCurrency] : exchange.currencies[symbolOrCurrency];
        if (!targetObject) {
            console.log('Symbol or Currency not found in ' + exchangeId);
            process.exit(1);
        }
        // replace existing data
        if (isMarketOrCurrency) {
            // if it's market, then write market object and currencies too
            marketsJson[symbolOrCurrency] = targetObject;
            write(filePathForMarkets, marketsJson);
            const base = targetObject.base;
            const quote = targetObject.quote;
            const baseCurrency = exchange.currencies[base];
            const quoteCurrency = exchange.currencies[quote];
            currenciesJson[base] = baseCurrency;
            currenciesJson[quote] = quoteCurrency;
            write(filePathForCurrencies, currenciesJson);
        } else {
            // if currency, then only write currency object
            currenciesJson[symbolOrCurrency] = targetObject;
            write(filePathForCurrencies, currenciesJson);
        }
        console.log('Finished! ', exchangeId,' > ', (isMarketOrCurrency ? 'markets': 'currencies'), ' > ',  symbolOrCurrency);
        process.exit(0);
    } catch (e) {
        console.log('Static data write error: ', e);
        process.exit (1);
    }
}

main();
