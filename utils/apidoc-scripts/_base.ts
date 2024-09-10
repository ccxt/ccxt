import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
const DIR_NAME = fileURLToPath (new URL ('.', import.meta.url));

import ccxt from '../../ts/ccxt';

type Str = string | undefined;

class ParserBase {

    exchangeId = '';
    url = '';
    baseUrl = '';
    rateLimitMultiplier = 0;

    ccxt = ccxt;

    constructor (){
        if (this.exchangeId === '') {
            this.exchangeId = this.constructor.name.toLowerCase ();
        }
    }

    async fetchData (url) {
        if (!url) {
            throw new Error ('URL not set');
        }
        const response = await fetch (url);
        const data = await response.text ();
        return data;
    }

    stripTags (input) {
        return input.replace(/<[^>]*>?/gm, '').trim ();
    }

    sanitizeEndpoint (input) {
        let sanitized = input;
        sanitized = sanitized.replace (/\((.*?)\)/,''); // few exceptional cases, to remove bracketed content
        sanitized = this.stripTags(sanitized);
        // add slash in the beginning
        return sanitized.startsWith ('/') ? sanitized : '/' + sanitized;
    }



    // cache methods
    cachePath (filename: Str = undefined) {
        return DIR_NAME + '/cache-' + (filename ? filename : this.exchangeId) + '.json';
    }

    cacheExists (filename: Str = undefined) {
        // if fetched once and mtime is less than 12 hour, then cache it temporarily
        const cacheHours = 12;
        const path = this.cachePath(filename);
        return (fs.existsSync (path) && fs.statSync (path).mtimeMs > Date.now () - cacheHours * 60 * 60 * 1000);
    }
    
    cacheGet (filename: Str = undefined) {
        const filedata = fs.readFileSync(this.cachePath(filename), 'utf8');
        return JSON.parse(filedata);
    }

    cacheSet (filename: Str = undefined, data = {}) {
        fs.writeFileSync (this.cachePath(filename), JSON.stringify(data, null, 2));
    }
    //

    createApiDiff (generated) {
        const ex = new ccxt[this.exchangeId] ();
        const existing = ex.api;
        // we need to create a new object, which have three keys:
        //   removed - the endpoints that are missing from "generated", but exist in "existing"
        //   added - the endpoints that are missing from "existing", but exist in "generated"
        const res = this.runDiff (generated, existing);
        return res;
    }

    runDiff (obj1, obj2) {
        // 3 levels depth comparison, this method can be improved ofc, but recursive method would be tricky and will need more time to code
        let result = {};
        const keys = Object.keys(obj2).concat(Object.keys(obj1));
        for (const key1 of keys) {
            if (!(key1 in obj1)) {
                result['removed'] = result['removed'] || {};
                result['removed'][key1] = obj2[key1];
            } else if (!(key1 in obj2)) {
                result['added'] = result['added'] || {};
                result['added'][key1] = obj1[key1];
            } else {
                if (typeof obj1[key1] === 'object' && typeof obj2[key1] === 'object') {
                    //
                    const keys2 = Object.keys(obj1[key1]).concat(Object.keys(obj2[key1]));
                    for (const key2 of keys2) {
                        if (!(key2 in obj1[key1])) {
                            result['removed']             = result['removed'] || {};
                            result['removed'][key1]       = result['removed'][key1] || {};
                            result['removed'][key1][key2] = obj2[key1][key2];
                        } else if (!(key2 in obj2[key1])) {
                            result['added']             = result['added'] || {};
                            result['added'][key1]       = result['added'][key1] || {};
                            result['added'][key1][key2] = obj1[key1][key2];
                        } else {
                            //
                            const keys3 = Object.keys(obj1[key1][key2]).concat(Object.keys(obj2[key1][key2]));
                            for (const key3 of keys3) {
                                if (!(key3 in obj1[key1][key2])) {
                                    result['removed']             = result['removed'] || {};
                                    result['removed'][key1]       = result['removed'][key1] || {};
                                    result['removed'][key1][key2] = result['removed'][key1][key2] || {};
                                    result['removed'][key1][key2][key3] = obj2[key1][key2][key3];
                                } else if (!(key3 in obj2[key1][key2])) {
                                    result['added']             = result['added'] || {};
                                    result['added'][key1]       = result['added'][key1] || {};
                                    result['added'][key1][key2] = result['added'][key1][key2] || {};
                                    result['added'][key1][key2][key3] = obj1[key1][key2][key3];
                                } else {
                                    // no need after 3rd depth
                                    continue;
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    }

    exit(...args) {
        console.log(...args);
        process.exit(0);
    }

}



export default ParserBase;