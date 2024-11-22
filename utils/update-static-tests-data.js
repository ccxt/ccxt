//
// Usage:
//
// add a new item in response tests:
//
//   npm run cli.ts xt fetchTrades BTC/USDT undefined 5 -- -- --response --name "My description"
//
// update specific symbols, specific currencies or ALL (update all currencies & markets):
//
//   node ./utils/static-updater-tests-data.js binance BTC/USDT ETH/USDT
//                                            binance USDC LTC
//                                            binance ALL


import fs from 'fs';
import path from 'path'
import { platform } from 'process'
import ccxt from '../js/ccxt.js';

const [,, ...args] = process.argv;

let __dirname = new URL('.', import.meta.url).pathname;
if (platform === 'win32' && __dirname[0] === '/') {
    __dirname = __dirname.substring (1);
}
const rootDir = __dirname + '/../';

function getExchangeSettings (exchangeId) {
    // set up keys and settings, if any
    const keysGlobal = path.resolve (rootDir + '/keys.json');
    const keysLocal = path.resolve (rootDir + '/keys.local.json');
    const keysFile = fs.existsSync (keysLocal) ? keysLocal : keysGlobal;
    const settingsFile  = fs.readFileSync(keysFile);
    // eslint-disable-next-line import/no-dynamic-require, no-path-concat
    let settings = JSON.parse(settingsFile.toString());
    settings = settings[exchangeId] || {};
    return settings;
}

function jsonStringify (elem, spaces = 4) {
    return JSON.stringify (elem, (k, v) => (v === undefined ? null : v), spaces); // preserve undefined values and convert them to null
}

function write (filename, data, spaces = 4) {
    return fs.writeFileSync(filename, jsonStringify(data, spaces));
}
function writeString (filename, data) {
    return fs.writeFileSync(filename, data);
}

function die (errorMessage = undefined, code = 1) {
    const defaultMsg = 'Please specify correct format, e.g.: \n\n' +
                       '    npm run static-updater binance BTC/USDT ETH/USDT\n' +
                       '               ...                 USDC LTC\n' +
                       '               ...                 ALL\n'
    console.log (errorMessage || defaultMsg);
    process.exit(code);
}

function add_static_result (requestOrResponse, exchangeId, method, entry, spacesIndent = undefined) {
        
    if (!exchangeId) {
        die ();
    }

    if (!ccxt.exchanges.includes(exchangeId)) {
        console.log('Exchange id ' + exchangeId + ' not found in exchanges.json');
        process.exit(1);
    }

    if (requestOrResponse !== 'request' && requestOrResponse !== 'response') {
        throw new Error ('should be either "request" or "response"');
    }
    const filePath = rootDir + `/ts/src/test/static/${requestOrResponse}/${exchangeId}.json`;
    const fileContent = fs.readFileSync(filePath, "utf8");
    // auto-detect 2 or 4 spaces used (just for backward compatibility)
    let spacesAmount = spacesIndent;
    if (spacesAmount === undefined) {
        spacesAmount = fileContent.includes('{\n    "exchange"') ? 4 : 2;
    }
    // either Parse JSON or use string manipulation
    const useJsonParsing = false; 
    if (useJsonParsing) {
        const jsonFull = JSON.parse (fileContent);
        const jsonMethods = jsonFull['methods']
        const orderedMap = new Map(Object.entries(jsonMethods));
        let methodArray = orderedMap.get(method);
        if (methodArray === undefined) {
            methodArray = [];
        }
        methodArray.push(entry);
        orderedMap.set(method, methodArray);
        jsonFull['methods'] = Object.fromEntries(orderedMap);
        write(filePath, jsonFull, spacesAmount);
    } else {
        // stringify the new entry
        const entryString = jsonStringify(entry, spacesAmount);
        // typically, method entries are at 3 levels deep, so add 3 indents
        const indentedContent = prependWhitespace(entryString, spacesAmount, 3);
        // check if regex matches and if so, then append an entry to it
        const regex = new RegExp(`    "${method}":\\s*\\[`, 'g');
        const match = fileContent.match(regex);
        // if method exists
        if (match !== null) {
            const newContent = fileContent.replace(regex, `    "${method}": [\n${indentedContent},`);
            writeString(filePath, newContent);
        } else {
            // inject it after "methods": { line
            const methodsRegex = new RegExp(`  "methods":\\s*\\{`, '');
            const newContent = fileContent.replace(methodsRegex, `  "methods": {\n    "${method}": [\n${indentedContent}\n    ],`);
            writeString(filePath, newContent);
        }
    }
}

function prependWhitespace(content, spacesAmountPerIndent, indentAmount) {
    const spaces = " ".repeat(spacesAmountPerIndent).repeat(indentAmount);
    const lines = content.split("\n");
    const indentedLines = lines.map((line) => spaces + line);
    const indentedScript = indentedLines.join("\n");
    return indentedScript;
}
  



const dataContainer = {
    filePathForMarkets : '',
    marketsJson : {},
    filePathForCurrencies : '',
    currenciesJson : {},
}

async function update_markets_and_currencies () {
    try {
        const exchangeId = args[0];
        if (!exchangeId) {
            die ();
        }

        dataContainer.filePathForMarkets = rootDir + `/ts/src/test/static/markets/${exchangeId}.json`;
        dataContainer.marketsJson = JSON.parse (fs.readFileSync(dataContainer.filePathForMarkets, "utf8"));
        dataContainer.filePathForCurrencies = rootDir + `/ts/src/test/static/currencies/${exchangeId}.json`;
        dataContainer.currenciesJson = JSON.parse (fs.readFileSync(dataContainer.filePathForCurrencies, "utf8"));
    
        if (!ccxt.exchanges.includes(exchangeId)) {
            console.log('Exchange id ' + exchangeId + ' not found in exchanges.json');
            process.exit(1);
        }
    
        // remove first item
        args.shift ();
        const symbolsOrCurrencies = args;


        const settings = getExchangeSettings (exchangeId);
        const exchange = new ccxt[exchangeId]({ ...settings });
        let currencies = undefined;
        if (exchange.has['fetchCurrencies']) {
            currencies = await exchange.fetchCurrencies();
        }
        await exchange.loadMarkets();

        for (const argument of symbolsOrCurrencies) {
            // if it's update command for markets or currencies
            if (!argument) {
                die ();
            }
            if (argument === 'ALL') {
                // reserved keyword to update all markets and currencies
                updateMarketsOrCurrencies (exchange, 'markets', exchange.markets);
                updateMarketsOrCurrencies (exchange, 'currencies', currencies);
            } else {
                // update signle market or currency
                updateMarketOrCurrency (exchange, argument);
            }
        }
        // @ts-expect-error
        die ('Finished! ' + exchangeId + ' > ' + JSON.stringify (symbolsOrCurrencies), 0);
    } catch (e) {
        // @ts-expect-error
        die ('Static data write error: ' + e.stack.toString (), 1);
    }
}

// update all markets or currencies
function updateMarketsOrCurrencies (exchange, type, source) {
    if (!source) { // if undefined, e.g. from fetchCurrencies
        return;
    }
    let destination = type === 'markets' ? dataContainer.marketsJson : dataContainer.currenciesJson;
    // get existing keys which needs update
    const keys = Object.keys (destination);
    // update all existing keys
    for (const key of keys) {
        if (key in source) {
            destination[key] = source[key];
        } else {
            // if symbol or currency is removed from exchange
            console.log ('[info] can not update data for key, it is no longer found in latest fetched ' + exchangeId + ' > ' + type + ' > ' + key);
        }
    }
    const filePath = type === 'markets' ? dataContainer.filePathForMarkets : dataContainer.filePathForCurrencies;
    write(filePath, destination);
}

// update signle market or currency
function updateMarketOrCurrency (exchange, symbolOrCurrency) {
    // check whether it's market or currency
    const isMarketOrCurrency = symbolOrCurrency.includes('/');

    const targetObject = isMarketOrCurrency ? exchange.markets[symbolOrCurrency] : exchange.currencies[symbolOrCurrency];
    if (!targetObject) {
        // @ts-expect-error
        die ('Symbol or Currency not found in ' + exchangeId, 1);
    }
    // write to file
    if (isMarketOrCurrency) {
        // if it's market, then write market object and currencies too
        // market object
        dataContainer.marketsJson[symbolOrCurrency] = targetObject;
        write (dataContainer.filePathForMarkets, dataContainer.marketsJson);
        // base & quote currency objects
        const base = targetObject.base;
        const quote = targetObject.quote;
        const baseCurrency = exchange.currencies[base];
        const quoteCurrency = exchange.currencies[quote];
        dataContainer.currenciesJson[base] = baseCurrency;
        dataContainer.currenciesJson[quote] = quoteCurrency;
        write (dataContainer.filePathForCurrencies, dataContainer.currenciesJson);
    } else {
        // if currency, then only write currency object
        dataContainer.currenciesJson[symbolOrCurrency] = targetObject;
        write(dataContainer.filePathForCurrencies, dataContainer.currenciesJson);
    }
}



export default { add_static_result, update_markets_and_currencies };


if (process.argv.includes ('--update')) {
    args.shift ();
    update_markets_and_currencies();
}
