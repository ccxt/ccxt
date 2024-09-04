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




class BinanceAll extends ParserBase {
    
    exchangeId = 'binance';
    type = 'all';
    baseUrl = 'https://developers.binance.com';

    verbose = false;

    async init () {
        const newDocs = await this.retrieveNewDocs ();
        const spotDocs = await this.retrieveSpotDocs ();
        const tree = Object.assign (spotDocs, newDocs);
        return tree;
    }


    // we have separate SPOT docs url, which has different page format and needs to be fetched separately
    async retrieveSpotDocs () {
        const spotDocsUrl = 'https://raw.githubusercontent.com/binance/binance-spot-api-docs/master/rest-api.md';
        const data = await this.fetchData (spotDocsUrl);
        const regex2 = /\n(GET|POST|PUT|DELETE)\s+(.+)((.|\n)*?)Weight(.*?)\s+(\d+)/g;
        const matches = data.matchAll(regex2);
        const matchesArray = [...matches];
        const apiTree = {};
        for (const match of matchesArray) {
            if (match.length != 7) {
                console.log('match length is not 7', match);
                continue;
            }
            const method = match[1];
            const endpoint = match[2]; // sometimes needed
            // eg: path = '/sapi/v2/account/balance'
            const parts = endpoint.split ('/');
            const kind = parts[1]; // eg: 'sapi'
            if (!(kind in apiTree)) {
                apiTree[kind] = {};
            }
            const rl = parseInt (match[6]);
            if (!(method in apiTree[kind])) {
                apiTree[kind][method] = {};
            }
            const path = endpoint.substring(1 + kind.length + 1);
            apiTree[kind][method][path] = rl;
        }
        return apiTree;
    }


    // here we fetch all other markets (but ignore included SPOT docs, as we already have it)
    async retrieveNewDocs () {
        if (!this.cacheExists ()) {
            const data = await this.fetchData (this.baseUrl + '/docs/');
            const mainJsPattern = /<script src="(\/docs\/assets\/js\/main(.*?)\.js)"/g;
            const match = mainJsPattern.exec(data);
            if (!match) {
                throw new Error ('main.js not found');
            }
            const mainJs = match[1];
            const mainJsUrl = this.baseUrl + mainJs;
            const response = await this.fetchData (mainJsUrl);
            const regex2 = /\)\.then\(a\.bind\(a,(.*?)"@(.*?)"/g;
            const matches = response.matchAll(regex2);
            const matchesArray = [...matches];
            const skips = ['theme/NotFound', 'autogen_index', '@iterator'];
            const urls: string[] = [];
            for (const match of matchesArray) {
                const arr = [...match];
                if (arr.length != 3) {
                    console.log('match length is not 3', arr);
                    continue;
                }
                const path = arr[2];
                if (skips.some (skip => path.includes (skip))) {
                    continue;
                }
                const url = this.baseUrl + '/' + arr[2].replace('site/', '').replace('.md', '');
                urls.push(url);
            }
            let i = 0;
            const promises = urls.map(async (url) => {
                i++;
                await this.sleep(10 * i);
                return this.fetchData(url);
            });
            const responses = await Promise.all (promises);
            this.cacheSet (responses);
        }
        return this.parseNewDocs ();
    }

    parseNewDocs() {
        const responses = this.cacheGet ();
        const apiTree = {};
        const skipedUrls = [ 'binance-spot-api-docs/rest-api', 'binance-spot-api-docs/testnet/rest-api', '/docs/spot/en', '/change-log' ];
        for (const res of responses) {
            // regex match url in res: 'property="og:url" content="https://developers.binance.com/docs/derivatives/change-log"'
            const regex = /property="og:url" content="(.*?)"/g;
            let mainUrl = regex.exec(res);
            if (!mainUrl) {
                continue;
            }
            mainUrl = mainUrl[1];
            if (skipedUrls.some (skip => mainUrl.includes (skip))) {
                continue;
            }
            // remove content only between <h1> and "Request Parameters" section
            let apiParagraph = res.match(/<h1>(.*?)<\/h1>((.|\n)*?)Parameters/g);
            if (!apiParagraph) {
                // if api paragraph not found, then it's not specifications page
                continue;
            }
            apiParagraph = apiParagraph[0];
            const endpointDatas = apiParagraph.matchAll(/\n(<p>|<p><code>|<code>)(GET|POST|PUT|DELETE)\b(?!\b|\s)*?([\s\S]*?)<\/code>[\s\S]*?Weight(.*?UID|)(\b[\s\S]*?<p><strong>(\d+)|)/g);
            const array = [...endpointDatas];
            for (let match of array) {
                // remove first two from match
                match = match.slice(2);
                if (match.length != 5) {
                    console.log('endpoint data match length is incorrect', match);
                    continue;
                }
                // 0 ='POST'
                // 1 = '/sapi/v1/algo/futures/newOrderVp'
                // 2 = 'UID'
                // 3 = '300'
                const reqMethod = match[0];
                const rawEndpoint = match[1];
                const isUID = match[2].includes('UID');
                const rateLimit = match[4];
                //
                if (!rawEndpoint.includes('/')) {
                    continue;
                }
                const endpoint = this.sanitizeEndpoint(rawEndpoint);
                const parts = endpoint.split ('/');
                const kind = parts[1]; // eg: 'sapi'
                if (!(kind in apiTree)) {
                    apiTree[kind] = {};
                }
                if (!(reqMethod in apiTree[kind])) {
                    apiTree[kind][reqMethod] = {};
                }
                const path = endpoint.substring(1 + kind.length + 1);
                if (!(path in apiTree[kind][reqMethod])) {
                    apiTree[kind][reqMethod][path] = rateLimit;
                } else {
                    if (this.verbose) {
                        console.log('duplicate path',  kind, reqMethod, path, mainUrl); // seems only few exceptions
                    }
                }
            }
        }
        delete apiTree['futures']; // it's odd atm
        return apiTree;
    }
}



const tree = await (new BinanceAll()).init ();
// comment below
console.log(JSON.stringify(tree, null, 2));