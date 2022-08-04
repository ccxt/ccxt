// This is a demonstration-only, unmaintained, unsupported implementation of methods to work the Binance P2P Exchange API.
// We do not endorse to use this code in any application, as this approach can be deprecated at any moment, can be blocked, or cause potential action against IP address (we can not guarantee anything) or lead to some other unexpected consecuences. So, the provided example snippet could only be used as a test-case snippet.

const ccxt       = require ('../../ccxt.js')

class unsupported_binance_p2p {

    baseDomain = 'https://p2p.binance.com/bapi/';
    baseExchange = null;
    markets = undefined;
    fiatList = [];
    currenciesForFiat = {};
    loadingPromise = null;

    constructor() {
        this.baseExchange = new ccxt.Exchange();
    }


    async loadMarkets(force = false){
        if (this.markets !== undefined && force === false) {
            return this.markets;
        }
        if (this.loadingPromise !== null) {
            return await this.loadingPromise;
        } else {
            this.loadingPromise = this.loadMarketsHelper(force);
            return await this.loadingPromise;
        }
    }

    async loadMarketsHelper(force = false){
        const currencyResp = await this.baseExchange.fetch(this.baseDomain + 'fiat/v1/public/fiatpayment/menu/currency');
        const data = this.baseExchange.safeValue (currencyResp, 'data');
        const currencyList = this.baseExchange.safeValue (data, 'currencyList');
        const keyed = this.baseExchange.indexBy (currencyList, 'name');
        this.fiatList = Object.keys (keyed);

        // fill promises
        const fPromises = [];
        for (const fiat of this.fiatList){
            const promise = this.baseExchange.fetch(this.baseDomain + 'c2c/v2/friendly/c2c/portal/config', 'POST', {"Content-Type":"application/json", "Accept":"*/*"}, '{"fiat":"'+ fiat +'"}');
            fPromises.push (promise);
            // avoid load
            this.baseExchange.sleep(100);
        }
        const fiatDatasResponse = await Promise.all(fPromises);
        this.markets = {};
        for (const fiatData of fiatDatasResponse) {
            const data = fiatData['data'];
            const fiat = data['fiat'];
            const areas = data['areas'];
            const areasKeyed = this.baseExchange.indexBy (areas, 'area');
            const assets = areasKeyed['P2P']['tradeSides'][0]['assets'];
            const assetsKeyed = this.baseExchange.indexBy (assets, 'asset');
            const assetsForFiat = Object.keys (assetsKeyed);
            for (const asset of assetsForFiat){
                const symbol = asset + '/' + fiat;
                const market = {
                    'symbol': symbol,
                    'base': asset,
                    'quote': fiat,
                };
                this.markets[symbol] = market;
            }
            this.currenciesForFiat[fiat] = assetsForFiat;
        }
        return this.markets;
    }


    async fetchOfferBook(cryptoCurrency, fiatCurrency, limit = 10, page = 1, publisherType = null, countries = [], payTypes = []){
        await this.loadMarkets();
        limit = Math.min(limit, 50); // don't abuse api
        const publisher = publisherType; // null | 'merchant'
        const header = {"Content-Type":"application/json", "user-agent":"appClient"};
        const paramsPart = (side)=>'{"page":'+page+',"rows":'+limit+',"payTypes":'+payTypes+',"countries":'+countries+',"asset":"' + cryptoCurrency.toUpperCase()+'","fiat":"' + fiatCurrency.toUpperCase()+'","tradeType":"'+side+'","publisherType":'+publisher+'}';
        const promiseAsks = this.baseExchange.fetch(this.baseDomain + 'c2c/v2/friendly/c2c/adv/search', 'POST', header, paramsPart("BUY"));
        const promiseBids = this.baseExchange.fetch(this.baseDomain + 'c2c/v2/friendly/c2c/adv/search', 'POST', header, paramsPart("SELL"));
        const responses = [];
        [responses['bid'], responses['ask']] = await Promise.all([promiseAsks, promiseBids]);
        const pn = (str)=>this.baseExchange.parseNumber (str);
        const offerBook = {};
        for (const bidAsk of ['bid','ask']){
            offerBook[bidAsk] = [];
            for (const offerObject of responses[bidAsk]['data']){
                const adv = offerObject['adv'];
                const element = {
                    'id': adv['advNo'],
                    'price': pn(adv['price']),
                    'tradableQuantity': pn(adv['tradableQuantity']),
                    'limits': {
                        'minAmount': pn(adv['minSingleTransQuantity']),
                        'maxAmount': pn(adv['maxSingleTransQuantity']),
                        'maxAmountDynamic': pn(adv['dynamicMaxSingleTransQuantity']),
                        'minCost': pn(adv['minSingleTransAmount']),
                        'maxCost': pn(adv['maxSingleTransAmount']),
                        'maxCostDynamic': pn(adv['dynamicMaxSingleTransAmount']),
                    },
                    'commissionRate': pn(adv['commissionRate']),
                    'info': offerObject,
                };
                offerBook[bidAsk].push(element);
            }
        }
        return offerBook;
    }
}






async function startApp(){
    // init exchange only once through lifetime of the application !
    const binance_p2p = new unsupported_binance_p2p();
    await binance_p2p.loadMarkets();

    // get prices
    let i = 0;
    for (const market of Object.values(binance_p2p.markets)){
        i++; if (i>5)  break; // for example purposes, just get 5 items
        const cryptoCurrency = market.base;
        const fiatCurrency = market.quote;
        const side = "BUY";
        const limit = 15;
        const res = await binance_p2p.fetchOfferBook('BNB', 'AUD', limit);
        console.log(await binance_p2p.fetchOfferBook(cryptoCurrency, fiatCurrency, limit));
    }
}
startApp();
