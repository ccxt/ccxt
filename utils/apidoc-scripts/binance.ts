// once there was also swagger version, but it was outdated and I've removed it in this commit: https://github.com/ccxt/ccxt/pull/23632/commits/1d7bd4e14a6baa1e56649c7f3ef9d4b06882611d


import ParserBase from './_base';

class binance extends ParserBase {

    exchangeInfos = {
        'api': 'https://api.binance.com/api/v3/exchangeInfo',
        'sapi': 'https://api.binance.com/api/v3/exchangeInfo',
        'dapi': 'https://dapi.binance.com/dapi/v1/exchangeInfo',
        'fapi': 'https://fapi.binance.com/fapi/v1/exchangeInfo',
        'eapi': 'https://eapi.binance.com/eapi/v1/exchangeInfo',
        'papi': 'https://fapi.binance.com/fapi/v1/exchangeInfo', // seems belongs to futures api, even though separate url
    };

    RateLimitBaseValue = 10; // hardcoded
    RateLimitBases = {}; // will be filled dynamically


    async init () {
        await this.initRateLimitValues ();
        const newDocs = await this.retrieveNewDocs ();
        const spotDocs = await this.retrieveSpotDocs ();
        const tree = Object.assign (spotDocs, newDocs);
        return tree;
    }

    
    async initRateLimitValues () {
        const marketTypes = Object.keys (this.exchangeInfos);
        const promises = [];
        for (const type of marketTypes) {
            const url = this.exchangeInfos[type];
            promises.push (this.fetchData (url));
        }
        const results = await Promise.all (promises);
        for (let i = 0; i < marketTypes.length; i++) {
            const type = marketTypes[i];
            const data = JSON.parse (results[i]);
            const rateLimitsInfo = data['rateLimits'];
            const minuteInfo= rateLimitsInfo.find (obj => obj.interval === 'MINUTE');
            const limit = minuteInfo['limit'];
            const callsPer1000Ms = limit / 60;
            const oneCallMs = 1000 / callsPer1000Ms;
            this.RateLimitBases[type] = oneCallMs;
        }
    }

    rateLimitValue (type, weightNum) {
        if (weightNum === undefined) {
            return undefined;
        }
        const weight = parseInt (weightNum);
        const multiplier = this.RateLimitBases[type] / this.RateLimitBaseValue;
        return weight * multiplier;
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
            const reqMethod = match[1].toLowerCase ();
            const endpoint = match[2]; // sometimes needed
            // eg: path = '/sapi/v2/account/balance'
            const parts = endpoint.split ('/');
            const kind = parts[1]; // eg: 'sapi'
            if (!(kind in apiTree)) {
                apiTree[kind] = {};
            }
            if (!(reqMethod in apiTree[kind])) {
                apiTree[kind][reqMethod] = {};
            }
            const path = endpoint.substring(1 + kind.length + 1);
            apiTree[kind][reqMethod][path] = this.rateLimitValue (kind, match[6]);
        }
        return apiTree;
    }


    // here we fetch all other markets (but ignore included SPOT docs, as we already have it)
    async retrieveNewDocs () {
        const baseUrl = 'https://developers.binance.com';
        if (!this.cacheExists ()) {
            const data = await this.fetchData (baseUrl + '/docs/');
            const mainJsPattern = /<script src="(\/docs\/assets\/js\/main(.*?)\.js)"/g;
            const match = mainJsPattern.exec(data);
            if (!match) {
                throw new Error ('main.js not found');
            }
            const mainJs = match[1];
            const mainJsUrl = baseUrl + mainJs;
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
                const url = baseUrl + '/' + arr[2].replace('site/', '').replace('.md', '');
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
                const reqMethod = match[0].toLowerCase ();
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
                const path = endpoint.substring(1 + kind.length + 1); // remove the prefix (eg '/sapi')
                if (!(path in apiTree[kind][reqMethod])) {
                    apiTree[kind][reqMethod][path] = this.rateLimitValue (kind, rateLimit);
                } else {
                    //console.log('duplicate path',  kind, reqMethod, path, mainUrl); // seems only few exceptions
                }
            }
        }
        delete apiTree['futures']; // it's odd atm
        return apiTree;
    }

}



const tree = await (new binance()).init ();
// comment below
console.log(JSON.stringify(tree, null, 2));