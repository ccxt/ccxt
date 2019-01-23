import {Exchange, OrderBook, Trade} from "ccxt";

const https = require("https");

module.exports = class tokens extends Exchange {
    describe()  {
        return this.deepExtend(super.describe(), {
            id: "tokens",
            name: "Tokens",
            rateLimit: 1000,
            urls: {
                api: "https://api.tokens.net/",
            },
            requiredCredentials: {
                apiKey: true,
                secret: true,
                uid: true,
            },
            api: {
                public: {
                    get: [
                        "public/trades/hour/{pair}/",
                    ],
                },
            },
        });
    }

    // @ts-ignore
     async loadMarkets(reload)  {
        return {
            "DPP/ETH": {
                id: "DPPETH",
                symbol: "DPP/ETH",
                base: "DPP",
                quote: "ETH",
            },
        };
    }

     async fetchTrades(symbol, since, limit, params) {
        const market = this.formatSymbol(this.formatSymbol(symbol));
        let response;

        try {
            response = await this.makeTradesCallToApi(market);
        } catch (e) {
            throw new Error(`Could not fetch trades from tokens for pair ${symbol}`);
        }

        if (response === undefined || response.status !== "ok") {
            Logger.error(response);
            throw new Error(`Error on ${this.constructor.name} exchange fetching pair ${symbol}`);
        }

        return this.parseTrades(response, market, since, limit);
    }

     async fetchOrderBook(symbol, limit, params) {
        const market = this.formatSymbol(this.formatSymbol(symbol));
        let response;

        try {
            response = await this.makeOrderbookCallToApi(market);
        } catch (e) {
            throw new Error(`Could not fetch order book from tokens for pair ${symbol}`);
        }

        if (response === undefined || response.status !== "ok") {
            Logger.error(response);
            throw new Error(`Error on ${this.constructor.name} exchange fetching pair ${symbol}`);
        }

        return this.parseOrderBook(response, market);
    }

     async makeTradesCallToApi(market) {
        return new Promise((resolve, reject) => {
            https.get(`https://api.tokens.net/public/trades/hour/${market}/`, (resp) => {
                let data = "";

                resp.on("data", (chunk) => {
                    data += chunk;
                });

                resp.on("end", () => {

                    try {

                        const parsed = JSON.parse(data);
                        resolve(parsed);

                    } catch (error) {

                        Logger.error(error.message);
                        Logger.debug(data);
                        reject(error)
                    }
                });
            }).on('error', (error) => {
                Logger.error(error.message);
                reject(error)
            });
        });

    }

     async makeOrderbookCallToApi(market) {
        return new Promise((resolve, reject) => {
            https.get(`https://api.tokens.net/public/order-book/${market}/`, (resp
            ) => {
                let data = "";

                resp.on("data", (chunk) => {
                    data += chunk;
                });

                resp.on("end", () => {

                    try {

                        const parsed = JSON.parse(data);
                        resolve(parsed);

                    } catch (error) {

                        Logger.error(error.message);
                        Logger.debug(data);
                        reject(error)
                    }
                });
            }).on('error', (error) => {
                Logger.error(error.message);
                reject(error)
            });
        });

    }

     async parseTrades(trades, market, since, limit) {
        let tradeList = [];

        if (trades.trades.length === 0) {
            return [];
        }

        for (const trade of trades.trades) {
            const parsedTrade = await this.parseTrade(trade);
            tradeList.push(parsedTrade);
        }

        return tradeList;
    }

     async parseOrderBook(orderbook, market) {

        orderbook.asks = orderbook.asks.map((item) => {
            return [parseFloat(item[1]), parseFloat(item[0])];
        });

        orderbook.bids = orderbook.bids.map((item) => {
            return [parseFloat(item[1]), parseFloat(item[0])];
        });

        return {
            asks: orderbook.asks,
            bids: orderbook.bids,
            datetime: this.iso8601(orderbook.timestamp),
            timestamp: orderbook.timestamp * 1000,
            nonce: parseInt((Math.floor(Math.random() * 9999) + 1000).toString() + orderbook.timestamp.toString(), 10),
        };
    }

    formatSymbol(symbol) {
        return symbol.replace("/", "").toLowerCase();
    }

    async parseTrade(tradeItem) {
        return {
            amount: parseFloat(tradeItem.amount),
            datetime: new Date(tradeItem.datetime).toISOString(),
            id: tradeItem.id.toString(),
            info: tradeItem,
            order: undefined,
            price: parseFloat(tradeItem.price),
            timestamp: parseInt(tradeItem.datetime, 10) * 1000,
            type: undefined,
            side: tradeItem.type,
            symbol: "DPP/ETH",
        };
    }

}
