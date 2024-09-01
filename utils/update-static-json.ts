
import fs from 'fs';
import ccxt from '../ts/ccxt.js';

const exchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
const exchangeIds = exchanges.ids;
const [,, ...args] = process.argv;

const exchangeId = args[0];
const symbolOrCurrency = args[1];
const errorMessage = 'Please specify correct format, e.g. `node ./utils/update-static-json.js binance BTC/USDT` (you can also pass a single CurrencyCode instead of a symbol)';

if (!exchangeId || !symbolOrCurrency) {
    console.log(errorMessage);
    process.exit(1);
}
if (!exchangeIds.includes(exchangeId)) {
    console.log('Exchange id ' + exchangeId + ' not found in exchanges.json');
    process.exit(1);
}

const isMarketOrCurrency = symbolOrCurrency.includes('/');
const keyName = isMarketOrCurrency ? 'markets' : 'currencies';
const filePath = `./ts/src/test/static/${keyName}/${exchangeId}.json`;
const existingJson = JSON.parse (fs.readFileSync(filePath, "utf8"));

async function main() {
    try {
        const exchange = new ccxt[exchangeId]();
        await exchange.loadMarkets();
        let targetObject = undefined;
        // check whether it's market or currency
        if (isMarketOrCurrency) {
            targetObject = exchange.markets[symbolOrCurrency];
        } else {
            targetObject = exchange.currencies[symbolOrCurrency];
        }
        if (!targetObject) {
            console.log('Symbol or Currency not found in ' + exchangeId);
            process.exit(1);
        }
        // replace existing
        existingJson[symbolOrCurrency] = targetObject;
        fs.writeFileSync(filePath, JSON.stringify(existingJson, null, 2));
        process.exit(0);
    } catch (e) {
        console.log('Static data write error: ', e);
        process.exit (1);
    }
}

main();
