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

def chunkIt(seq, num):
    avg = len(seq) / float(num)
    out = []
    last = 0.0

    while last < len(seq):
        out.append(seq[int(last):int(last + avg)])
        last += avg

    return out

async def main():
    if len(sys.argv) <= 2:
        print('python ' + __file__ + ' exchange apikey secret limit symbol ...')
        sys.exit(-1)

    exchange_id = sys.argv[1]
    apiKey = sys.argv[2]
    secret = sys.argv[3]
    limit = int(sys.argv[4])
    symbols = []
    eventSymbols = []
    for i in range(5, len(sys.argv)):
        symbols.append(sys.argv[i])
        eventSymbols.append({
            "event": "ob",
            "symbol": sys.argv[i],
            "params": {
                'limit': limit  
            }
        })

    exchange = getattr(ccxt, exchange_id)({
        "apiKey": apiKey,
        "secret": secret,
        "enableRateLimit": True,
        'verbose': False,
        'timeout': 5 * 1000,
        # 'wsproxy': 'http://185.93.3.123:8080/',
    })


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

    chunkedSymbols = chunkIt(symbols,2)
    chunkedEventSymbols = chunkIt(eventSymbols,2)
    print("unsubscribe: " + ','.join(chunkedSymbols[1]))
    sys.stdout.flush()
    await exchange.websocket_unsubscribe_all(chunkedEventSymbols[1])
    print("unsubscribed: " + ','.join(chunkedSymbols[1]))
    await asyncio.sleep(10)
    print("unsubscribe: " + ','.join(chunkedSymbols[0]))
    sys.stdout.flush()
    await exchange.websocket_unsubscribe_all(chunkedEventSymbols[0])
    print("unsubscribed: " + ','.join(chunkedSymbols[0]))
    await asyncio.sleep(2)
    await exchange.close()



loop.run_until_complete(main())
# loop.run_forever()
# loop.stop()
# loop.close()
print("after complete")