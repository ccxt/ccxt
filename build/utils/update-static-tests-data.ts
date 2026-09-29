//
// add a new item in response tests:
//
//   npm run cli.ts kucoin fetchTrades BTC/USDT undefined 5 -- -- --response --name "My description"
//


import fs from 'fs';
import { platform } from 'process'
// import the TS source ccxt (resolved by tsx) so the ccxt.prediction namespace is available —
// the built js/ccxt.js may be stale and miss prediction exchanges (kalshi/limitless/... and the
// hyperliquid prediction variant)
import ccxt from '../../ts/ccxt.js';

let __dirname = new URL('.', import.meta.url).pathname;
if (platform === 'win32' && __dirname[0] === '/') {
    __dirname = __dirname.substring (1);
}
const rootDir = __dirname + '/../../';

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

function twoSpacedIndent (jsonStr) {
    return jsonStr.startsWith('{\n  "');
}


// #####################################

function add_static_result (requestOrResponse, exchangeId, method, entry, spacesIndent = undefined, isPrediction = false) {

    if (!exchangeId) {
        die ("Exchange id is missing");
    }

    // prediction-market exchanges live in the ccxt.prediction namespace (some, like kalshi, are not
    // in ccxt.exchanges at all) and their fixtures are stored under the static/<type>/prediction/ subfolder
    const predictionExchanges = ((ccxt as any).prediction !== undefined) ? (ccxt as any).prediction.exchanges : [];
    const validIds = isPrediction ? predictionExchanges : ccxt.exchanges;
    if (!validIds.includes(exchangeId)) {
        console.log('Exchange id ' + exchangeId + ' not found in exchanges.json');
        process.exit(1);
    }

    if (requestOrResponse !== 'request' && requestOrResponse !== 'response' && requestOrResponse !== 'ws') {
        throw new Error ('should be either "request", "response" or "ws"');
    }
    const subFolder = isPrediction ? 'prediction/' : '';
    const filePath = rootDir + `/ts/src/test/static/${requestOrResponse}/${subFolder}${exchangeId}.json`;
    let defaultStructure;
    if (isPrediction) {
        defaultStructure = {"exchange":exchangeId, "asyncOnly": true, "skipKeys": [], "outputType": "json", "options": {"loadAllOutcomes": true}, "methods": {}};
    } else {
        defaultStructure = {"exchange":exchangeId, "skipKeys": [], "options": {}, "methods": {}};
        if (requestOrResponse === 'request') {
            (defaultStructure as any).outputType = 'both';
        }
    }
    const fileContent = readFileInit (filePath, jsonStringify(defaultStructure));
    // auto-detect 2 or 4 spaces used (just for backward compatibility)
    const spacesAmount = spacesIndent || (twoSpacedIndent (fileContent) ? 2 : 4);
    // stringify the new entry
    const entryString = jsonStringify(entry, spacesAmount);
    // typically, method entries are at 3 levels deep, so add 3 indents
    const indentedContent = prependWhitespace(entryString, spacesAmount, 3);
    // check if regex matches and if so, then append an entry to it
    const methodStartRegex = `    "${method}":`;
    const regex = new RegExp(methodStartRegex + `\\s*\\[`, 'g');
    const match = fileContent.match(regex);
    // if method exists
    if (match !== null) {
        const newContent = fileContent.replace(regex, methodStartRegex + ` [\n${indentedContent},`);
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

function prependWhitespace(content, spacesAmountPerIndent, indentAmount) {
    const spaces = " ".repeat(spacesAmountPerIndent).repeat(indentAmount);
    const lines = content.split("\n");
    const indentedLines = lines.map((line) => spaces + line);
    const indentedScript = indentedLines.join("\n");
    return indentedScript;
}
  

export default {};

export { add_static_result };
