import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
const DIR_NAME = fileURLToPath (new URL ('.', import.meta.url));
class ParserBase {
    
    exchangeId = '';
    type = '';
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
    cachePath () {
        // get constructor name
        return DIR_NAME + '/' + this.exchangeId + '-' + this.type + '-cache.json';
    }

    cacheExists () {
        // if fetched once and mtime is less than 12 hour, then cache it temporarily
        const cacheHours = 12;
        return (fs.existsSync (this.cachePath()) && fs.statSync (this.cachePath()).mtimeMs > Date.now () - cacheHours * 60 * 60 * 1000);
    }
    
    cacheSet (data) {
        fs.writeFileSync (this.cachePath(), JSON.stringify(data, null, 2));
    }

    cacheGet () {
        const filedata = fs.readFileSync(this.cachePath(), 'utf8');
        return JSON.parse(filedata);
    }
}


export default ParserBase;