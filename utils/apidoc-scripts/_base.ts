import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
const DIR_NAME = fileURLToPath (new URL ('.', import.meta.url));

type Str = string | undefined;
const isNumber = Number.isFinite;
const isInteger = Number.isInteger;
const isArray = Array.isArray;
const hasProps = (o: any) => ((o !== undefined) && (o !== null));
const isString = (s: any) => (typeof s === 'string');
const isObject = (o: any) => ((o !== null) && (typeof o === 'object'));
const isRegExp = (o: any) => (o instanceof RegExp);
const isDictionary = (o: any) => (isObject (o) && (Object.getPrototypeOf (o) === Object.prototype) && !isArray (o) && !isRegExp (o));


class ParserBase {

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
        return new Promise (resolve => setTimeout (resolve, ms));
    }

    deepExtend (...xs: any) {
        let out = undefined;
        for (const x of xs) {
            if (isDictionary (x)) {
                if (!isDictionary (out)) {
                    out = {};
                }
                for (const k in x) {
                    out[k] = this.deepExtend (out[k], x[k]);
                }
            } else {
                out = x;
            }
        }
        return out;
    }

    stripTags (input) {
        return input.replace(/<[^>]*>?/gm, '').trim ();
    }

    sanitizeEndpoint (input) {
        const sanitized = this.stripTags(input);
        // add slash in the beginning
        return sanitized.startsWith ('/') ? sanitized : '/' + sanitized;
    }



    // cache methods
    cachePath (filename: Str = undefined) {
        // get constructor name
        return DIR_NAME + '/cache-' + (filename ? filename : this.constructor.name) + '.json';
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
}


export default ParserBase;