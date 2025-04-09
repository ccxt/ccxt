//
// add a new item in response tests:
//
//   npm run cli.ts kucoin fetchTrades BTC/USDT undefined 5 -- -- --response --name "My description"
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

async function ccxtClass () {
    let ccxtRef = undefined;
    try {
        // if this script is running from tsx (cli.ts), import untranspiled ccxt
        ccxtRef = await import ('../ts/ccxt.ts');
    } catch (e) {
        ccxtRef = ccxt;
    }
    return ccxtRef;
}

function twoSpacedIndent (jsonStr) {
    return jsonStr.startsWith('{\n  "');
}




// #####################################

function add_static_result (requestOrResponse, exchangeId, method, entry, spacesIndent = undefined) {
        
    if (!exchangeId) {
        die ("Exchange id is missing");
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
    const spacesAmount = spacesIndent || (twoSpacedIndent (fileContent) ? 2 : 4);
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
