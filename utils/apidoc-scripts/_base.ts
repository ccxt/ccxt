import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
const DIR_NAME = fileURLToPath (new URL ('.', import.meta.url));
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

    stripTags (input) {
        return input.replace(/<[^>]*>?/gm, '');
    }

    sanitizeEndpoint (input) {
        const sanitized = this.stripTags(input).trim ();
        // add slash in the beginning
        return sanitized.startsWith ('/') ? sanitized : '/' + sanitized;
    }



    // cache methods
    cachePath (exchangeId = undefined) {
        // get constructor name
        return DIR_NAME + '/' + (exchangeId ? exchangeId : this.constructor.name) + '-cache.json';
    }

    cacheExists (exchangeId = undefined) {
        // if fetched once and mtime is less than 12 hour, then cache it temporarily
        const cacheHours = 12;
        const path = this.cachePath(exchangeId);
        return (fs.existsSync (path) && fs.statSync (path).mtimeMs > Date.now () - cacheHours * 60 * 60 * 1000);
    }
    
    cacheGet (exchangeId = undefined) {
        const filedata = fs.readFileSync(this.cachePath(exchangeId), 'utf8');
        return JSON.parse(filedata);
    }

    cacheSet (data, exchangeId = undefined) {
        fs.writeFileSync (this.cachePath(exchangeId), JSON.stringify(data, null, 2));
    }
}


export default ParserBase;