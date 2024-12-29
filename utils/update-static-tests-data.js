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
const useJsonParsing = false; 

function getExchangeSettings (exchangeId) {
    // set up keys and settings, if any
    const keysGlobal = path.resolve (rootDir + '/keys.json');
    const keysLocal = path.resolve (rootDir + '/keys.local.json');
    const keysFile = fs.existsSync (keysLocal) ? keysLocal : keysGlobal;
    const settingsFile  = fs.readFileSync(keysFile);
    let settings = JSON.parse(settingsFile.toString());
    settings = settings[exchangeId] || {};
    return settings;
}

function jsonStringify (elem, spaces = 4) {
    return JSON.stringify (elem, (k, v) => (v === undefined ? null : v), spaces); // preserve undefined values and convert them to null
}

function readFileInit (filename, defaultData = '{}') {
    try {
        return fs.readFileSync(filename, "utf8");
    } catch (e) {
        writeString(filename, defaultData);
        return defaultData;
    }
}

function writeJson (filename, data, spaces = 4) {
    return writeString(filename, jsonStringify(data, spaces));
}

function writeString (filename, data) {
    return fs.writeFileSync(filename, data);
}

function spaces (amount) {
    return ' '.repeat(amount);
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
    const defaultStructure = {"exchange":exchangeId, "skipKeys": [], "options": {}, "methods": {}};
    if (requestOrResponse === 'request') {
        defaultStructure.outputType = 'both';
    }
    const fileContent = readFileInit (filePath, jsonStringify(defaultStructure));
    // auto-detect 2 or 4 spaces used (just for backward compatibility)
    let spacesAmount = spacesIndent;
    if (spacesAmount === undefined) {
        spacesAmount = fileContent.includes('{\n  "exchange"') ? 2 : 4
    }
    // either Parse JSON or use string manipulation
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
        writeJson(filePath, jsonFull, spacesAmount);
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
            const newContent = fileContent.replace(regex, `"${method}": [\n${indentedContent},`);
            writeString(filePath, newContent);
        } else {
            // inject it after "methods": { line
            const methodsRegex = new RegExp(`"methods":\\s*\\{`, '');
            const replacementContent = '"methods": {\n' + spaces(spacesAmount * 2) + `"${method}": [\n${indentedContent}\n`+  spaces(spacesAmount * 2) + '],';
            let newContent = fileContent.replace(methodsRegex, replacementContent);
            newContent = newContent.replace('],}', ']\n  }'); // temporary fix,
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
    indentForMarkets: 4,
    filePathForCurrencies : '',
    currenciesJson : {},
    indentForCurrencies: 4,
}

function twoSpacedIndent (jsonStr) {
    return jsonStr.includes('\n  "BTC') || jsonStr.includes('\n  "USDT');
}

async function update_markets_and_currencies () {
    try {
        const exchangeId = args[0];
        if (!exchangeId) {
            die ();
        }

        dataContainer.filePathForMarkets = rootDir + `/ts/src/test/static/markets/${exchangeId}.json`;
        const strMarkets = readFileInit(dataContainer.filePathForMarkets, '{}');
        dataContainer.marketsJson = JSON.parse(strMarkets);
        dataContainer.indentForMarkets = twoSpacedIndent(strMarkets) ? 2 : 4;

        dataContainer.filePathForCurrencies = rootDir + `/ts/src/test/static/currencies/${exchangeId}.json`;
        const strCurrencies = readFileInit(dataContainer.filePathForCurrencies, '{}');
        dataContainer.currenciesJson = JSON.parse(strCurrencies);
        dataContainer.indentForCurrencies = twoSpacedIndent(strCurrencies) ? 2 : 4;
        //
        if (!ccxt.exchanges.includes(exchangeId)) {
            console.log('Exchange id ' + exchangeId + ' not found in exchanges.json');
            process.exit(1);
        }
    
        // remove first item
        args.shift ();
        const symbolsOrCurrencies = args;
        if (!symbolsOrCurrencies.length) {
            die ();
        }

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
        die ('Finished! ' + exchangeId + ' > ' + jsonStringify (symbolsOrCurrencies), 0);
    } catch (e) {
        // @ts-expect-error
        die ('Static data writeJson error: ' + e.stack.toString (), 1);
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
            console.log ('[info] can not update data for key, it is no longer found in latest fetched ' + exchange.id + ' > ' + type + ' > ' + key);
        }
    }
    const filePath = type === 'markets' ? dataContainer.filePathForMarkets : dataContainer.filePathForCurrencies;
    writeJson(filePath, destination, 2);
}

// update signle market or currency
function updateMarketOrCurrency (exchange, symbolOrCurrency) {
    // check whether it's market or currency
    const isMarketOrCurrency = symbolOrCurrency.includes('/');

    const targetObject = isMarketOrCurrency ? exchange.markets[symbolOrCurrency] : exchange.currencies[symbolOrCurrency];
    if (!targetObject) {
        // @ts-expect-error
        die ('Symbol or Currency ['  + (symbolOrCurrency || 'undefined')  + '] not found in '+ exchange.id, 1);
    }
    // writeJson to file
    if (isMarketOrCurrency) {
        // if it's market, then writeJson market object and currencies too
        // market object
        dataContainer.marketsJson[symbolOrCurrency] = targetObject;
        writeJson (dataContainer.filePathForMarkets, dataContainer.marketsJson, dataContainer.indentForMarkets);
        // base & quote currency objects
        const base = targetObject.base;
        const quote = targetObject.quote;
        const baseCurrency = exchange.currencies[base];
        const quoteCurrency = exchange.currencies[quote];
        dataContainer.currenciesJson[base] = baseCurrency;
        dataContainer.currenciesJson[quote] = quoteCurrency;
        writeJson (dataContainer.filePathForCurrencies, dataContainer.currenciesJson, dataContainer.indentForCurrencies);
    } else {
        // if currency, then only writeJson currency object
        dataContainer.currenciesJson[symbolOrCurrency] = targetObject;
        writeJson(dataContainer.filePathForCurrencies, dataContainer.currenciesJson, dataContainer.indentForCurrencies);
    }
}


export default {};

export { add_static_result, update_markets_and_currencies };


if (process.argv.includes ('--update')) {
    args.shift ();
    update_markets_and_currencies();
}
