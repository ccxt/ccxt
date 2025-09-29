//
// Usage:
//
// add a new item in response tests:
//
//   npm run cli.ts xt fetchTrades BTC/USDT undefined 5 -- -- --response --name "My description"
//

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
    console.log (errorMessage || 'Please specify correct format, e.g. \ntsx ./utils/update-static-json.ts binance BTC/USDT ETH/USDT\n(you can also pass a CurrencyCode instead of a symbol)\n\n OR\n\n or you can ');
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
  

export default add_static_result;