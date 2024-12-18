
import fs from 'fs'
import { URL } from 'url'
import path from 'path'
import { platform } from 'process'

const urlObj = new URL('.', import.meta.url);
let __dirname = urlObj.pathname;
__dirname = (platform === 'win32' && __dirname[0] === '/' ? __dirname = __dirname.substring(1) : __dirname);

const rootDir = __dirname + '..';

function getIncludedExchangeIds (path) {
    const includedIds = fs.readFileSync ('exchanges.cfg')
        .toString () // Buffer → String
        .split ('\n') // String → Array
        .map (line => line.split ('#')[0].trim ()) // trim comments
        .filter (exchange => exchange); // filter empty lines
    const isIncluded = (id) => ((includedIds.length === 0) || includedIds.includes (id))
    const ids = fs.readdirSync (path)
        .filter (file => file.match (/[a-zA-Z0-9_-]+.ts$/))
        .map (file => file.slice (0, -3))
        .filter (isIncluded);
    return ids
}

const exchangeDirs = {
    'cs': {
        'rest': {
            'path': './cs/ccxt/exchanges/',
            'excluded': ['pro'],
        },
        'ws': {
            'path': './cs/ccxt/exchanges/pro/',
            'excluded': ['wrappers', 'BaseProExchange'],
        }
    },
    'py': {
        'rest': {
            'path': './python/ccxt/',
            'excluded': ['pro', 'abstract', 'async_support', 'base', 'static_dependencies', 'test', '__init__', '__pycache__'],
        },
        'ws': {
            'path': './python/ccxt/pro/',
            'excluded': ['test', 'BaseProExchange', '__init__', '__pycache__'],
        },
    },
    'php': {
        'rest': {
            'path': './php/',
            'excluded': ['abstract', 'async', 'InvalidOperation', 'ProxyError', 'static_dependencies', 'test', 'Precise', 'pro', 'Exchange'],
        },
        'ws': {
            'path': './php/pro/',
            'excluded': ['ArrayCache', 'ArrayCacheBySymbolById', 'ArrayCacheBySymbolBySide', 'ArrayCacheByTimestamp', 'base', 'BaseCache', 'Client', 'ClientTrait', 'Exchange', 'Future', 'OrderBook', 'OrderBookSide', 'test'],
        },
    },
};

function getErrorHierarchy() {
    const path = rootDir + '/ts/src/base/errorHierarchy.ts';
    const content = fs.readFileSync (path, 'utf8');
    let errorObject = content.matchAll (/const\s*[\w\d]+\s*=\s({(.|\n)+});/gm).next().value[1];
    errorObject = errorObject.replace(/(,)(\n\s*[}|\]])/g, '$2'); //remove trailing comma
    errorObject = errorObject.replace(/'/g, '"');
    return JSON.parse(errorObject);
}

function getAllKeys(obj, keys = []) {
    // Iterate over each key in the current object
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          getAllKeys(obj[key], keys);
        }
      }
    }
    return keys;
}


function findRemovedExchanges () {
    const ids = getIncludedExchangeIds ('./ts/src/');
    const wsIds = getIncludedExchangeIds ('./ts/src/pro/');
    const errors = getAllKeys(getErrorHierarchy());
    let exited = false;
    for (const [ext, block] of Object.entries (exchangeDirs)) {
        for (const [restOrWs, block2] of Object.entries (block)) {
            const dir = `${rootDir}/${block2.path}`;
            const files = fs.readdirSync (dir);
            const allowedFiles = [...ids, ...block2.excluded, ...errors];
            for (const file of files) {
                const id = file.split('.')[0];
                if (!allowedFiles.includes (id)) {
                    exited = true;
                    console.log (ext, restOrWs, 'File needs to be removed:', id, '(if you think this is a mistake, add it to the allowedFiles array in ' + block2.path + ')');
                }
            }
        }
    }
    if (exited) {
        process.exit (1);
    }
}


findRemovedExchanges();
