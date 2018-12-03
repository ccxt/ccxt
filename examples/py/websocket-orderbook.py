import os
import sys
import pprint
import traceback
import datetime

pp = pprint.PrettyPrinter(depth=6)

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')
# import ccxt  # noqa: E402
import ccxt.async_support as ccxt  # noqa: E402
import asyncio  # noqa: E402
from ccxt.base.exchange import Exchange as BaseExchange

loop = asyncio.get_event_loop()

baseConfig = {
    "exchangeDefaults": {
        "verbose": False
    },
    "symbolDefaults": {
        "limit": 5
    },
    "marketTable": {
        "marketsByRow": 3,
        "maxLimit": 10,
        "marketColumnWidth": 50,
    },
    "exchanges" : {
        "bitfinex2" : {
            "symbols": {
                "BTC/USDT": {},
                "XRP/USDT": {}
            },
            "options": {

            }
        },
        "binance": {
            "symbols": {
                'BTC/USDT':{}
            },
            "options": {

            }
        }
    }
}
marketTable = None
def main():
    global marketTable
    if (len(sys.argv) > 2):
        with open(sys.argv[2]) as f:
            config = BaseExchange.extend ({}, baseConfig, json.load(f))
    else:
        config = BaseExchange.extend ({} , baseConfig)
    marketTable = MarketTable(config['marketTable'])
    for id in config['exchanges'].keys():
        exchange = config['exchanges'][id]
        exConf = BaseExchange.extend ({}, config['exchangeDefaults'], exchange['options'] if 'options' in exchange else {})
        
        ex = getattr(ccxt, id)({
            'apiKey': exConf['apiKey'] if 'apiKey' in exConf else '',
            'secret': exConf['apiSecret'] if 'apiSecret' in exConf else '',
            'enableRateLimit': True,
            'verbose': exConf['verbose'] if 'verbose' in exConf else False,
        }); 
        for symbol in exchange['symbols'].keys():
            marketTable.addMarket (ex.id, symbol)
        asyncio.ensure_future(subscribe (ex, exchange['symbols'], config['symbolDefaults']), loop=loop)
        # await subscribe (ex, exchange['symbols'], config['symbolDefaults'])

async def subscribe(exchange, symbols, defaultConfig):
    
    @exchange.on('err')
    def websocket_error(err, conxid):  # pylint: disable=W0612
        print(err)
        try:
          exchange.websocketClose(conxid)
        except ex:
            pass
        for symbol in symbols.keys():
            marketTable.marketError(exchange.id, symbol, err)
        marketTable.print()

    @exchange.on('ob')
    def websocket_ob(market, ob):  # pylint: disable=W0612
        marketTable.updateMarket (exchange.id, market, ob)
        marketTable.print()

    try:
        await exchange.load_markets()
        for symbol in symbols.keys():
            sys.stdout.flush()
            config = BaseExchange.extend ({}, defaultConfig, symbols[symbol])
            try:
                await exchange.websocket_subscribe('ob', symbol, config)
            except ex:
                print(ex)
                sys.stdout.flush()
                marketTable.marketError(exchange.id, symbol, ex)
                marketTable.print()
    except ex: 
        print(ex)
        sys.stdout.flush()
        for symbol in symbols.keys():
            marketTable.marketError(exchange.id, symbol, ex)
        marketTable.print()

class MarketTable:
    def __init__ (self, options):
        self.options = BaseExchange.extend ({}, {
            "marketsByRow": 2,
            "maxLimit": 10,
            "marketColumnWidth": 50,
        }, options)
        self.markets = {}
        self.grid = []
        self.newEmptyLine = ' ' * (self.options['marketColumnWidth'] * self.options['marketsByRow'])
        self.hr = "-" * (self.options['marketColumnWidth'])
        self.bidsAdksSeparator = "." * (self.options['marketColumnWidth'])
        self.emptyCell = " " * (self.options['marketColumnWidth'])
        self.amountColumn = self.options['marketColumnWidth'] // 2
        self.height = 2+self.options['maxLimit'] + 1 + self.options['maxLimit'] + 1

    def replaceAt (self, str, index, replacement):
        return str[:index] + replacement + str[index + len(replacement):]

    def addMarket (self, marketId, marketSymbol):
        gridPosition = len(self.markets.keys())
        gridRow = (gridPosition // self.options['marketsByRow']) * self.height
        gridColumn = (gridPosition % self.options['marketsByRow']) * self.options['marketColumnWidth']
        lastUpdate = datetime.datetime.now()
        self.markets[marketId + '@' + marketSymbol] = {
            'gridPosition': gridPosition,
            'gridRow': gridRow,
            'gridColumn': gridColumn,
            'lastUpdate': lastUpdate,
            'marketId': marketId,
            'marketSymbol': marketSymbol
        }
        # add new row
        if (len(self.grid) <= gridRow):
            newHeight = gridRow + (self.options['maxLimit'] * 2) + 4
            for i in range(len(self.grid), newHeight):
                self.grid.append(self.newEmptyLine)

        self.grid[gridRow] = self.replaceAt (self.grid[gridRow], gridColumn, marketId + ":" + marketSymbol+ ":" + str(lastUpdate))
        self.grid[gridRow+1] = self.replaceAt (self.grid[gridRow+1], gridColumn, self.hr)
        separatorRow = gridRow+2+self.options['maxLimit']
        self.grid[separatorRow] = self.replaceAt (self.grid[separatorRow], gridColumn, self.bidsAdksSeparator)

    def updateMarket (self, marketId, marketSymbol, ob):
        lastUpdate = datetime.datetime.now()
        gridRow = self.markets[marketId + '@' + marketSymbol]['gridRow']
        gridColumn = self.markets[marketId + '@' + marketSymbol]['gridColumn']
        self.markets[marketId + '@' + marketSymbol]['lastUpdate'] = lastUpdate
        # update title
        self.grid[gridRow] = self.replaceAt (self.grid[gridRow], gridColumn, marketId + ":" + marketSymbol+ ":" + str(lastUpdate))
        i = gridRow + 2 + self.options['maxLimit'] - 1
        for index in range (0,min(self.options['maxLimit'],len(ob['bids']))):
            price = ob['bids'][index][0]
            ammount = ob['bids'][index][1]
            self.grid[i] = self.replaceAt (self.grid[i], gridColumn, self.emptyCell)
            self.grid[i] = self.replaceAt (self.grid[i], gridColumn, str(price))
            self.grid[i] = self.replaceAt (self.grid[i], gridColumn + self.amountColumn, ":"+ str(ammount))
            i = i - 1
        for index in range(index + 1, self.options['maxLimit']):
            self.grid[i] = self.replaceAt (self.grid[i], gridColumn, self.emptyCell)
            i = i - 1
        i = gridRow + 2 + self.options['maxLimit'] + 1
        for index in range (0,min(self.options['maxLimit'],len(ob['asks']))):
            price = ob['asks'][index][0]
            ammount = ob['asks'][index][1]
            self.grid[i] = self.replaceAt (self.grid[i], gridColumn, self.emptyCell)
            self.grid[i] = self.replaceAt (self.grid[i], gridColumn, str(price))
            self.grid[i] = self.replaceAt (self.grid[i], gridColumn + self.amountColumn, ":"+ str(ammount))
            i = i + 1
        for index in range(index + 1, self.options['maxLimit']):
            self.grid[i] = self.replaceAt (self.grid[i], gridColumn, self.emptyCell)
            i = i + 1

    def marketError (self, marketId, marketSymbol, error):
        gridRow = self.markets[marketId + '@' + marketSymbol]['gridRow']
        gridColumn = self.markets[marketId + '@' + marketSymbol]['gridColumn']
        errText = str(error)
        errLines = [errText[i:i+n] for i in range(0, len(errText), self.options['marketColumnWidth'] - 1)]
        for index in range (0,min(self.options['maxLimit'],len(errLines))):
            self.grid[i] = self.replaceAt (self.grid[i], gridColumn, self.emptyCell)
            self.grid[i] = self.replaceAt (self.grid[i], gridColumn, errLines[index])

    def print (self):
        sys.stdout.write("\u001b[0;0H")
        for line in self.grid:
            print(line)
        sys.stdout.flush()


#loop.run_until_complete(main())
main()
loop.run_forever()