//
// Usage to update specific symbols, currencies, everything (existing keys with new datas):
//
//   tsx ./utils/update-static-markets.ts binance BTC/USDT ETH/USDT
//                                        binance USDC LTC
//                                        binance ALL
//

import fs from 'fs';
import path from 'path'
import { platform } from 'process'
import ccxt from '../ts/ccxt.js';

const [,, ...args] = process.argv;

// @ts-expect-error
let __dirname = new URL('.', import.meta.url).pathname;
if (platform === 'win32' && __dirname[0] === '/') {
    __dirname = __dirname.substring (1);
}
const rootDir = __dirname + '/../';
const useJsonParsing = false; 

function getExchangeSettings (exchangeId: string) {
    // set up keys and settings, if any
    const keysGlobal = path.resolve (rootDir + '/keys.json');
    const keysLocal = path.resolve (rootDir + '/keys.local.json');
    const keysFile = fs.existsSync (keysLocal) ? keysLocal : keysGlobal;
    const settingsFile  = fs.readFileSync(keysFile);
    let settings = JSON.parse(settingsFile.toString());
    settings = settings[exchangeId] || {};
    return settings;
}

function jsonStringify (elem: any, spaces = 4) {
    return JSON.stringify (elem, (k, v) => (v === undefined ? null : v), spaces); // preserve undefined values and convert them to null
}

function readFileInit (filename: string, defaultData = '{}') {
    try {
        return fs.readFileSync(filename, "utf8");
    } catch (e) {
        writeString(filename, defaultData);
        return defaultData;
    }
}

function writeJson (filename: string, data: any, spaces = 4) {
    return writeString(filename, jsonStringify(data, spaces));
}

function writeString (filename: string, data: any) {
    return fs.writeFileSync(filename, data);
}

function spaces (amount: number) {
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

async function ccxtClass () {
    let ccxtRef = undefined;
    try {
        // if this script is running from tsx, import untranspiled ccxt
        // @ts-expect-error
        ccxtRef = await import ('../ts/ccxt.ts');
    } catch (e) {
        ccxtRef = ccxt;
    }
    return ccxtRef;
}

function twoSpacedIndent (jsonStr: string) {
    return jsonStr.startsWith('{\n  "');
}


// ##########################################


const dataContainer: any = {
    markets: {
        path: '',
        json: {},
        indent: 4,
    },
    currencies: {
        path: '',
        json: {},
        indent: 4,
    },
};

async function update_markets_and_currencies () {
    try {
        const exchangeId = args[0];
        if (!exchangeId) {
            die ();
        }

        for (const dataType of ['markets', 'currencies']) {
            dataContainer[dataType].path = rootDir + `/ts/src/test/static/${dataType}/${exchangeId}.json`;
            const strMarkets = readFileInit(dataContainer[dataType].path, '{}');
            dataContainer[dataType].json = JSON.parse(strMarkets);
            dataContainer[dataType].indent = twoSpacedIndent(strMarkets) ? 2 : 4;
        }
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
        // @ts-expect-error
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
        die ('Static data write error: ' + e.stack.toString (), 1);
    }
}

// update all markets or currencies
function updateMarketsOrCurrencies (exchange: any, type: string, source: any) {
    if (!source) { // if undefined, e.g. from fetchCurrencies
        return;
    }
    let targetJson = dataContainer[type].json;
    // get existing keys which needs update
    const keys = Object.keys (targetJson);
    // update all existing keys
    for (const key of keys) {
        if (key in source) {
            targetJson[key] = source[key];
        } else {
            // if symbol or currency is removed from exchange
            console.log ('[info] can not update data for key, it is no longer found in latest fetched ' + exchange.id + ' > ' + type + ' > ' + key);
        }
    }
    writeJson(dataContainer[type].path, targetJson, dataContainer[type].indent);
}

// update signle market or currency
function updateMarketOrCurrency (exchange: any, symbolOrCurrency:string) {
    // check whether it's market or currency
    const isMarketOrCurrency = symbolOrCurrency.includes('/');

    const targetObject = isMarketOrCurrency ? exchange.markets[symbolOrCurrency] : exchange.currencies[symbolOrCurrency];
    if (!targetObject) {
        // @ts-expect-error
        die ('Symbol or Currency ['  + (symbolOrCurrency || 'undefined')  + '] not found in '+ exchange.id, 1);
    }
    // write to file
    if (isMarketOrCurrency) {
        // if it's market, then write market object and currencies too
        // market object
        dataContainer.markets.json[symbolOrCurrency] = targetObject;
        writeJson (dataContainer.markets.path, dataContainer.markets.json, dataContainer.markets.indent);
        // base & quote currency objects
        const base = targetObject.base;
        const quote = targetObject.quote;
        const baseCurrency = exchange.currencies[base];
        const quoteCurrency = exchange.currencies[quote];
        dataContainer.currencies.json[base] = baseCurrency;
        dataContainer.currencies.json[quote] = quoteCurrency;
        writeJson (dataContainer.currencies.path, dataContainer.currencies.json, dataContainer.currencies.indent);
    } else {
        // if currency, then only write currency object
        dataContainer.currencies.json[symbolOrCurrency] = targetObject;
        writeJson(dataContainer.currencies.path, dataContainer.currencies.json, dataContainer.currencies.indent);
    }
}


export default {};

export { update_markets_and_currencies };


if (process.argv.includes ('--update')) {
    args.shift ();
    update_markets_and_currencies();
}
