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


async def main():
    if len(sys.argv) <= 5:
        print('python ' + __file__ + ' exchange apikey secret limit symbol ...')
        sys.exit(-1)

    exchange_id = sys.argv[1]
    apiKey = sys.argv[2]
    secret = sys.argv[3]
    limit = int(sys.argv[4])
    symbols = []
    for i in range(5, len(sys.argv)):
        symbols.append(sys.argv[i])

    exchange = getattr(ccxt, exchange_id)({
        "apiKey": apiKey,
        "secret": secret,
        "enableRateLimit": True,
        'verbose': True,
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

    for j in range(2):
        for i in range(len(symbols)):
            symbol = symbols[i]
            print("subscribe: " + symbol)
            sys.stdout.flush()
            await exchange.websocket_subscribe('ob', symbol, {'limit': limit})
            print("subscribed: " + symbol)
            sys.stdout.flush()
            ob = await exchange.websocket_fetch_order_book(symbol, limit)  # noqa: F841 pylint: disable=W0612
            print("ob fetched: " + symbol)
            # print(ob)
            sys.stdout.flush()
            await asyncio.sleep(5)

        for i in range(len(symbols)):
            symbol = symbols[i]
            print("unsubscribe: " + symbol)
            sys.stdout.flush()
            await exchange.websocket_unsubscribe('ob', symbol)
            print("unsubscribed: " + symbol)
            sys.stdout.flush()
            await asyncio.sleep(5)

    await exchange.close()

loop.run_until_complete(main())
# loop.run_forever()
# loop.stop()
# loop.close()
print("after complete")
