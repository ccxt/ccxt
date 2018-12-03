'use strict';

const ccxt = require('../../ccxt.js')
const extend = ccxt.extend;
var fs = require('fs');

const baseConfig = {
    exchangeDefaults: {
        verbose: false
    },
    symbolDefaults: {
        limit: 5
    },
    marketTable: {
        marketsByRow: 3,
        maxLimit: 10,
        marketColumnWidth: 50,
    },
    exchanges : {
        bitfinex2 : {
            symbols: {
                "BTC/USDT": {},
                "XRP/USDT": {}
            },
            options: {

            }
        },
        binance: {
            symbols: {
                'BTC/USDT':{}
            },
            options: {

            }
        }
    }
};



var marketTable;
function main() {
    var config;
    if (process.argv.length > 2) {
        config = extend ({}, baseConfig, JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
    } else {
        config = extend ({} , baseConfig);
    }
    marketTable = new MarketTable(config.marketTable);
    for (var id in config.exchanges) {
        var exchange = config.exchanges[id];
        const exConf = extend ({}, config.exchangeDefaults, exchange.options | {});
        
        const ex = new ccxt[id]({
            apiKey: exConf.apiKey | '',
            secret: exConf.apiSecret | '',
            enableRateLimit: true,
            verbose: exConf.verbose | false,
        }); 
        for (var symbol in exchange.symbols) {
            marketTable.addMarket (ex.id, symbol);
        }
        subscribe (ex, exchange.symbols, config.symbolDefaults);
    }
}



function subscribe(exchange, symbols, defaultConfig) {
    exchange.on('err', (err, conxid) => {
        try {
          exchange.websocketClose(conxid);
        } catch (ex) {
        }
        for (var symbol in symbols) {
            marketTable.marketError(exchange.id, symbol, err);
        }
        marketTable.print();
    });
    exchange.on('ob', (market, ob) => {
        marketTable.updateMarket (exchange.id, market, ob);
        marketTable.print();
    });
    exchange.loadMarkets().
        then(async () => {
            for (var symbol in symbols) {
                const config = extend ({}, defaultConfig, symbols[symbol]);
                try {
                    await exchange.websocketSubscribe('ob', symbol, config);
                } catch (ex) {
                    marketTable.marketError(exchange.id, symbol, ex);
                    marketTable.print();
                }
            }
        }).
        catch((error) => {
            for (var symbol in symbols) {
                marketTable.marketError(exchange.id, symbol, error);
            }
            marketTable.print();
        });
}


class MarketTable {
    constructor (options){
        this.options = extend ({}, {
            marketsByRow: 2,
            maxLimit: 10,
            marketColumnWidth: 50,
        }, options);
        this.markets = {};
        this.grid = [];
        this.newEmptyLine = Array(this.options.marketColumnWidth * this.options.marketsByRow).join(" ");
        this.hr = Array(this.options.marketColumnWidth).join("-");
        this.bidsAdksSeparator = Array(this.options.marketColumnWidth).join(".");
        this.emptyCell = Array(this.options.marketColumnWidth).join(" ");
        this.amountColumn = Math.floor(this.options.marketColumnWidth / 2);
        this.height = 2+this.options.maxLimit + 1 + this.options.maxLimit + 1;
    }

    replaceAt (str, index, replacement) {
        return str.substr(0, index) + replacement + str.substr(index + replacement.length);
    }

    addMarket (marketId, marketSymbol) {
        const gridPosition = Object.keys(this.markets).length;
        const gridRow = Math.floor(gridPosition / this.options.marketsByRow) * this.height;
        const gridColumn = (gridPosition % this.options.marketsByRow) * this.options.marketColumnWidth;
        const lastUpdate = new Date();
        this.markets[marketId + '@' + marketSymbol] = {
            gridPosition,
            gridRow,
            gridColumn,
            lastUpdate,
            marketId,
            marketSymbol
        };
        // add new row
        if (this.grid.length <= gridRow) {
            const newHeight = gridRow + (this.options.maxLimit * 2) + 4;
            for (var i=this.grid.length ; i < newHeight; i++) {
                this.grid.push(this.newEmptyLine);
            }
        }
        this.grid[gridRow] = this.replaceAt (this.grid[gridRow], gridColumn, marketId + ":" + marketSymbol+ ":" + lastUpdate.toISOString());
        this.grid[gridRow+1] = this.replaceAt (this.grid[gridRow+1], gridColumn, this.hr);
        const separatorRow = gridRow+2+this.options.maxLimit;
        this.grid[separatorRow] = this.replaceAt (this.grid[separatorRow], gridColumn, this.bidsAdksSeparator);
    }

    updateMarket (marketId, marketSymbol, ob) {
        const lastUpdate =  new Date();
        const gridRow = this.markets[marketId + '@' + marketSymbol].gridRow;
        const gridColumn = this.markets[marketId + '@' + marketSymbol].gridColumn;
        this.markets[marketId + '@' + marketSymbol].lastUpdate = lastUpdate;
        // update title
        this.grid[gridRow] = this.replaceAt (this.grid[gridRow], gridColumn, marketId + ":" + marketSymbol+ ":" + lastUpdate.toISOString());
        for (var index=0,i=gridRow + 2 + this.options.maxLimit - 1; (index < this.options.maxLimit) && (index < ob.bids.length); i--, index++) {
            const price = ob.bids[index][0];
            const ammount = ob.bids[index][1];
            this.grid[i] = this.replaceAt (this.grid[i], gridColumn, this.emptyCell);
            this.grid[i] = this.replaceAt (this.grid[i], gridColumn, price.toString());
            this.grid[i] = this.replaceAt (this.grid[i], gridColumn + this.amountColumn, ":"+ ammount);
        }
        for (; index < this.options.maxLimit; index++,i--) {
            this.grid[i] = this.replaceAt (this.grid[i], gridColumn, this.emptyCell);
        }
        for (var index=0,i = gridRow + 2 + this.options.maxLimit + 1; (index < this.options.maxLimit) && (index < ob.asks.length); i++, index++) {
            const price = ob.asks[index][0];
            const ammount = ob.asks[index][1];
            this.grid[i] = this.replaceAt (this.grid[i], gridColumn, this.emptyCell);
            this.grid[i] = this.replaceAt (this.grid[i], gridColumn, price.toString());
            this.grid[i] = this.replaceAt (this.grid[i], gridColumn + this.amountColumn, ":"+ ammount);
        }
        for (; index < this.options.maxLimit; index++,i++) {
            this.grid[i] = this.replaceAt (this.grid[i], gridColumn, this.emptyCell);
        }
    }

    marketError (marketId, marketSymbol, error) {
        const gridRow = this.markets[marketId + '@' + marketSymbol].gridRow;
        const gridColumn = this.markets[marketId + '@' + marketSymbol].gridColumn;
        const errLines = error.toString().split(this.options.marketColumnWidth - 1);
        // this.grid[gridRow+1] = this.replaceAt (this.grid[gridRow+1], gridColumn, this.bidsAdksSeparator);
        for (var index=0,i=gridRow + 2; (index < this.options.maxLimit * 2 + 1) && (index < errLines.length); i++, index++) {
            this.grid[i] = this.replaceAt (this.grid[i], gridColumn, this.emptyCell);
            this.grid[i] = this.replaceAt (this.grid[i], gridColumn, errLines[index]);
        }
    }

    print () {
        //process.stdout.write('\\033c');
        // process.stdout.write("\u001b[2J\u001b[0;0H");
        process.stdout.write("\u001b[0;0H");
        for (var i = 0; i<this.grid.length; i++) {
            console.log(this.grid[i]);
        }
    }
}




main();