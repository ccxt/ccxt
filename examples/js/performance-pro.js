'use strict';

const ccxt = require ('../../ccxt');

const process = require('process'); 

if (process.pid) {
    console.log('This process is your pid ' + process.pid);
  }

const exchanges = [
    { ccxt_exchange_id: "binance", exchange_name: "binance", market_type: "spot" },
    { ccxt_exchange_id: "binanceusdm", exchange_name: "binance", market_type: "futures" },
    // works but is alot of pairs, and the cpu usage is there with just binance { ccxt_exchange_id: "kucoin", exchange_name: "kucoin", market_type: "spot", market_split: "/" },
];
const stablecoins = ["USD", "USDT", "BUSD"];

let ccxt_exchanges = {};

async function loadMarkets() {
    for (const exchange_data of exchanges) {
        (async () => {
            let options = {};
            if (exchange_data.ccxt_exchange_id.indexOf('binance') !== -1) {
                options = {
                    'streamLimits': {
                        'spot': 5, // default is 50
                        'margin': 5, // default is 50
                        'future': 5, // default is 50
                        'delivery': 5, // default is 50
                    },
                }
            }
            ccxt_exchanges[exchange_data.ccxt_exchange_id] = new ccxt.pro[exchange_data.ccxt_exchange_id]({ newUpdates: true, options: options });
            const markets = await ccxt_exchanges[exchange_data.ccxt_exchange_id].loadMarkets();

            for (const marketId in markets) {
                const market = markets[marketId];

                if (market.active && stablecoins.includes(market.quote) && (!market.base.includes("UP") || !market.base.includes("DOWN"))) {
                    watchTrades(exchange_data, market['symbol']);

                    if (exchange_data.exchange_name === "kucoin") {
                        await new Promise((resolve) => setTimeout(resolve, 250));
                    } else {
                        await new Promise((resolve) => setTimeout(resolve, 100));
                    }
                }
            }
            console.log(`Loaded ${exchange_data.exchange_name} ${exchange_data.market_type} markets`);
        })();
    }
}
loadMarkets();

async function watchTrades(exchange_data, symbol) {
    console.log(`Watching ${symbol} ${exchange_data.market_type} on ${exchange_data.ccxt_exchange_id}...`);

    while (true) {
        try {
            // const symbol = exchange_data.market_split ? `${base}${exchange_data.market_split}${quote}` : `${base}${quote}`;
            const trades = await ccxt_exchanges[exchange_data.ccxt_exchange_id].watchTrades(symbol);
            //addTrade(exchange_data.exchange_name, exchange_data.market_type, base, quote, trades);
        } catch (e) {
            console.error(e);
        }
    }
}