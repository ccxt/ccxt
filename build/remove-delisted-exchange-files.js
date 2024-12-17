
import fs from 'fs'
import { URL } from 'url'
import path from 'path'
import { platform } from 'process'

let __dirname = new URL('.', import.meta.url).pathname;
__dirname = (platform === 'win32' && __dirname[0] === '/' ? __dirname = __dirname.substring(1) : __dirname);

const { keys, values, entries, fromEntries } = Object

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
            'excluded': ['BaseExchange', 'BaseProExchange'],
        },
        'ws': {
            'path': './cs/ccxt/exchanges/pro/',
            'excluded': ['BaseExchange', 'BaseProExchange'],
        }
    },
    'py': {
        'rest': {
            'path': './python/ccxt/',
            'excluded': ['BaseExchange', 'BaseProExchange'],
        },
        'ws': {
            'path': './python/ccxt/pro/',
            'excluded': ['BaseExchange', 'BaseProExchange'],
        },
    },
    'php': {
        'rest': {
            'path': './php/',
            'excluded': ['BaseExchange', 'BaseProExchange'],
        },
        'ws': {
            'path': './php/pro/',
            'excluded': ['BaseExchange', 'BaseProExchange'],
        },
    },
};

const rootDir = __dirname + '..';

function findRemovedExchanges () {
    const ids = getIncludedExchangeIds ('./ts/src/');
    const wsIds = getIncludedExchangeIds ('./ts/src/pro/');
    for (const [ext, block] of Object.entries (exchangeDirs)) {
        for (const [restOrWs, block2] of Object.entries (block)) {
            const dir = `${rootDir}/${block2.path}`;
            const files = fs.readdirSync (dir);
            const allowedFiles = [...ids, ...block2.excluded];
            for (const file of files) {
                const id = file.split('.')[0];
            }
        }
    }
    console.log ('ids', ids);
}


findRemovedExchanges ();