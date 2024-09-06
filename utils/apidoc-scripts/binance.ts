// once there was also swagger version, but it was outdated and I've removed it in this commit: https://github.com/ccxt/ccxt/pull/23632/commits/1d7bd4e14a6baa1e56649c7f3ef9d4b06882611d


import ParserBase from './_base';

import manualOverrides from './binance-ts-overrides';
class binance extends ParserBase {
    exchangeId = 'binance';

    exchangeInfos = {
        'api': 'https://api.binance.com/api/v3/exchangeInfo',
        'sapi': 'https://api.binance.com/api/v3/exchangeInfo',
        'dapi': 'https://dapi.binance.com/dapi/v1/exchangeInfo',
        'fapi': 'https://fapi.binance.com/fapi/v1/exchangeInfo',
        'eapi': 'https://eapi.binance.com/eapi/v1/exchangeInfo',
        'papi': 'https://fapi.binance.com/fapi/v1/exchangeInfo', // seems belongs to futures api, even though separate url
    };

    RateLimitBaseValue = 10; // hardcoded
    RateLimitCoefficients = {}; // will be filled dynamically


    async init () {
        await this.parseExchangeInfos ();
        const spot = await this.retrieveSpotDocs ();
        const misc = await this.retrievePortalDocs ();
        const all = Object.assign (spot, misc);
        const generatedApiTree = this.deepExtend (all, manualOverrides);
        const apiDiffs = this.createApiDiff (generatedApiTree);
        const final = {
            '_not_in_fetched': apiDiffs.removed,
            '_not_in_existing': apiDiffs.added,
            'coefficients': this.RateLimitCoefficients,
        };
        // some endpoints are missing in generatedTree, so add them from binance.ts
        const completeApi = this.deepExtend (generatedApiTree, apiDiffs.removed);
        final['completeApi'] = completeApi;
        return final;
    }

    
    async parseExchangeInfos () {
        const marketTypes = Object.keys (this.exchangeInfos);
        let results : any[] = [];
        if (this.cacheExists ('binanceinfos')) {
            results = this.cacheGet ('binanceinfos');
        } else {
            const promises: any[] = [];
            for (const type of marketTypes) {
                const url = this.exchangeInfos[type];
                promises.push (this.fetchData (url));
            }
            results = await Promise.all (promises);
            this.cacheSet ('binanceinfos', results);
        }
        for (let i = 0; i < marketTypes.length; i++) {
            const type = marketTypes[i];
            const data = JSON.parse (results[i]);
            const rateLimitsInfo = data['rateLimits'];
            const minuteInfo= rateLimitsInfo.find (obj => obj.interval === 'MINUTE');
            const minuteQuota = minuteInfo['limit'];
            const callsPer1000Ms = minuteQuota / 60;
            const msForOneCall = 1000 / callsPer1000Ms;
            this.RateLimitCoefficients[type] = msForOneCall / this.RateLimitBaseValue;
        }
    }

    // we have separate SPOT docs url, which has different page format and needs to be fetched separately
    async retrieveSpotDocs () {
        const webLink = 'https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md'
        const sourceUrl = webLink.replace('github.com', 'raw.githubusercontent.com').replace('blob/', '');
        const data = await this.fetchData (sourceUrl);
        const regex2 = /\n(GET|POST|PUT|DELETE)\s+(.+)((.|\n)*?)Weight(.*)\s+(.*)\s+/g;
        const publicEndpoints = [ 'ping', 'time', 'exchangeInfo', 'depth', 'trades', 'historicalTrades', 'aggTrades', 'klines', 'uiKlines', 'avgPrice', 'ticker' ];
        const matches = data.matchAll(regex2);
        const matchesArray = [...matches];
        let apiTree = {};
        for (const match of matchesArray) {
            if (match.length != 7) {
                console.log('match length is not 7', match);
                continue;
            }
            const reqMethod = match[1].toLowerCase ();
            const endpoint = match[2]; // sometimes needed
            // eg: path = '/sapi/v2/account/balance'
            const parts = endpoint.split ('/');
            const apyType = parts[1]; // eg: 'sapi'
            const version = parts[2];
            let path = endpoint.substring(1 + apyType.length + 1);
            path = path.substring (version.length + 1); // hack for binance.ts
            const isPublic = publicEndpoints.some (publicEndpoint => path.startsWith ( publicEndpoint));
            const rootKeySuffix = (isPublic? 'public':'private');
            const weight = this.stripTags (match[6] ?? '');
            this.setEndpoint (apiTree, apyType, rootKeySuffix, reqMethod, path, webLink, weight);
        }
        return apiTree;
    }


    // here we fetch all other markets (but ignore included SPOT docs, as we already have it)
    async retrievePortalDocs () {
        const responses = await this.fetchPortalData();
        const apiTree = {};
        const skippedPages = [ 'binance-spot-api-docs/rest-api', 'binance-spot-api-docs/testnet/rest-api', '/docs/spot/en', '/change-log' ];
        for (const page of responses) {
            const _mainContent = (/<h1>(.*?)<\/h1>((.|\n)*?)(Parameters|Response Example)/g).exec(page);
            const h1 = _mainContent ? _mainContent[1] : undefined;
            const mainContent = _mainContent ? _mainContent[2] : undefined;
            const _mainUrl = (/property="og:url" content="(.*?)"/g).exec(page);
            const mainUrl = _mainUrl ? _mainUrl[1] : undefined;
            if (
                !mainUrl // if url not found
                    ||
                skippedPages.some (skipPage => mainUrl.includes (skipPage)) // if skipped page
                    ||
                !mainContent // if doc content not found
            ){
                continue;
            }
            const endpointCollections = mainContent.matchAll(/\n(<p>|<p><code>|<code>)(GET|POST|PUT|DELETE)\b(?!\b|\s)*?([\s\S]*?)<\/code>[\s\S]*?Weight\b([\s\S]*?\n)([\s\S]*?\<h2|(.*?)\n)/g);
            const matches = [...endpointCollections];
            if (matches.length !== 1) continue;
            let match = matches[0];
            if (match.length !== 7) {
                this.exit('endpoint data match length is incorrect', match);
            }
            // [ 'POST',  '/sapi/v1/algo/futures/newOrderVp', '(UID)', '300' ]
            const reqMethod = match[2].toLowerCase ();
            const rawEndpoint = match[3]; if (!rawEndpoint.includes('/')) continue;
            const weightParagraph = match[5];
            let weight = this.stripTags((weightParagraph??'').replace('(UID)','').replace('(IP)','')).replace ('<h2','');
            const multipleWeights = /(\d+)(.*?)symbol([\s\S]*?)(\d+)(.*?)(omitted|without symbol|no symbol)/.exec (weightParagraph);
            if (multipleWeights) {
                weight = {
                    'cost': parseInt(multipleWeights[1]),
                    'noSymbol': parseInt(multipleWeights[4]),
                };
            }
            const endpoint = this.sanitizeEndpoint(rawEndpoint);
            const parts = endpoint.split ('/');
            const apiType = parts[1]; // eg: 'sapi' 
            const version = parts[2]; // eg: 'v2' 
            let apiRootKey = apiType;
            const versionSuffix = version.toUpperCase().replace('V1', ''); // we dont have `v1` suffixes from keys
            const isPrivate = 
                weightParagraph.includes ('(UID)') || ['(USER_DATA)', '(USER_STREAM)', '(MARKET_DATA)', '(TRADE)'].some (str => h1.includes (str));
            if (apiType.startsWith('sapi')) {
                apiRootKey += versionSuffix;
            } else if (apiType.startsWith('papi')) {
                // nothing needed
            } else if (['fapi','dapi','eapi'].includes(apiType)) {
                apiRootKey += ( isPrivate ? 'Private': 'Public') + versionSuffix; // eg: fapiPublic
            } else {
                // console.log('undetected path', match, mainUrl); // seems only few exceptions
                continue;
            }
            const path = endpoint.replace ('/'+ apiType + '/' + version + '/', ''); // eg: remove 'sapi/v2' from beggining
            this.setEndpoint (apiTree, apiType, apiRootKey, reqMethod, path, mainUrl, weight);
        }
        return apiTree;
    }

    
    setEndpoint (apiTreeRef, apiType = 'api|fapi|...', rootKeyNameInCcxt, reqMethod = 'post|get|..', path, linkToDoc, weightValue ){
        let rl_value = undefined;
        if (typeof weightValue === 'object') {
            // eg: { 'cost': 2, 'noSymbol': 4 }
            rl_value = weightValue;
        } else {
            // ensure it's a number
            const num = parseInt(weightValue);
            rl_value = (num !== 0 && num.toString () === weightValue) ? num : undefined;
        }
        if (!(rootKeyNameInCcxt in apiTreeRef)) {
            apiTreeRef[rootKeyNameInCcxt] = {};
        }
        if (!(reqMethod in apiTreeRef[rootKeyNameInCcxt])) {
            apiTreeRef[rootKeyNameInCcxt][reqMethod] = {};
        }
        if (!(path in apiTreeRef[rootKeyNameInCcxt][reqMethod])) {
            // const multiplier = this.RateLimitBases[type] / this.RateLimitBaseValue; // no longer need
            apiTreeRef[rootKeyNameInCcxt][reqMethod][path] = rl_value ?? linkToDoc; //
        } else {
            //console.log('duplicate path',  kind, reqMethod, path, mainUrl); // seems only few exceptions
        }
    }


    async fetchPortalData () {
        // fetches and saves cache
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
            this.cacheSet (undefined, responses);
        }
        return this.cacheGet ();
    }
}



const tree = await (new binance()).init ();
// comment below
console.log(JSON.stringify(tree, null, 2));



