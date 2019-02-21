import os
import sys
import pprint
import traceback

pp = pprint.PrettyPrinter(depth=6)

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')
# import ccxt  # noqa: E402
import ccxt.async_support as ccxt  # noqa: E402
import asyncio  # noqa: E402

loop = asyncio.get_event_loop()
# import txaio
# txaio.start_logging(level='debug')


async def main(exchange, symbols, eventSymbols):
    @exchange.on('err')
    def websocket_error(err, conxid):  # pylint: disable=W0612
        print(type(err).__name__ + ":" + str(err))
        traceback.print_tb(err.__traceback__)
        traceback.print_stack()
        loop.stop()

    @exchange.on('ob')
    def websocket_ob(symbol, ob):  # pylint: disable=W0612
        print("ob received from: " + symbol)
        sys.stdout.flush()
        # pp.pprint(ob)

    sys.stdout.flush()

    print("subscribe: " + ','.join(symbols))
    sys.stdout.flush()
    await exchange.websocket_subscribe_all(eventSymbols)
    print("subscribed: " + ','.join(symbols))
    sys.stdout.flush()
    await asyncio.sleep(10)
    print("unsubscribe: " + ','.join(symbols[len(eventSymbols) // 2 - 1: - 1]))
    sys.stdout.flush()
    await exchange.websocket_unsubscribe_all(eventSymbols[len(eventSymbols) // 2 - 1: - 1])
    print("unsubscribed: " + ','.join(symbols[len(eventSymbols) // 2 - 1: - 1]))
    await asyncio.sleep(10)
    print("unsubscribe: " + ','.join(symbols))
    sys.stdout.flush()
    await exchange.websocket_unsubscribe_all(eventSymbols)
    print("unsubscribed: " + ','.join(symbols))
    await asyncio.sleep(2)
    await exchange.close()


class binance2 (ccxt.binance):
    def describe(self):
        return self.deep_extend(super(binance2, self).describe(), {
            'wsconf': {
                'conx-tpls': {
                    'default': {
                        'type': 'ws-s',
                        'baseurl': 'wss://stream.binance.com:9443/stream?streams=',
                    },
                },
                'methodmap': {
                    'fetchOrderBook': 'fetchOrderBook',
                    '_websocketHandleObRestSnapshot': '_websocketHandleObRestSnapshot',
                },
                'events': {
                    'ob': {
                        'conx-tpl': 'default',
                        'conx-param': {
                            'url': '{baseurl}',
                            'id': '{id}-{symbol}',
                            'stream': '{symbol}@depth',
                        },
                    },
                },
            },
        })


if len(sys.argv) <= 2:
    print('python ' + __file__ + ' limit symbol ...')
    sys.exit(-1)

limit = int(sys.argv[1])
symbols = []
eventSymbols = []
for i in range(2, len(sys.argv)):
    symbols.append(sys.argv[i])
    eventSymbols.append({
        "event": "ob",
        "symbol": sys.argv[i],
        "params": {
            'limit': limit
        }
    })

exchange = binance2({  # getattr(ccxt, exchange_id)({
    "enableRateLimit": True,
    'verbose': False,
    'timeout': 5 * 1000,
    # 'wsproxy': 'http://185.93.3.123:8080/',
})
print("simulating multiple endpoints to each symbol....")
sys.stdout.flush()
loop.run_until_complete(main(exchange, symbols, eventSymbols))

exchange = ccxt.binance({  # getattr(ccxt, exchange_id)({
    "enableRateLimit": True,
    'verbose': False,
    'timeout': 5 * 1000,
    # 'wsproxy': 'http://185.93.3.123:8080/',
})
print("simulating one endpoint to all symbols....")
sys.stdout.flush()
loop.run_until_complete(main(exchange, symbols, eventSymbols))
# loop.run_forever()
# loop.stop()
# loop.close()
print("after complete")
