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

    async fetchData (url) {
        if (!url) {
            throw new Error ('URL not set');
        }
        const response = await fetch (url);
        const data = await response.text ();
        return data;
    }

    async sleep (ms) {
        return await ccxt.sleep (ms);
    }

    deepExtend (...xs: any) {
        return ccxt.deepExtend (...xs);
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

    compareGeneratedApi (tree) {
        const ex = new ccxt[this.exchangeId] ();
        const generated = ex.api;
    }

    exit(...args) {
        console.log(...args);
        process.exit(0);
    }
}



export default ParserBase;