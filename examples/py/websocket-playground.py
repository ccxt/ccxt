import os
import sys
import pprint
import traceback

pp = pprint.PrettyPrinter(depth=6)

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')
# import ccxt  # noqa: E402
import ccxt.async as ccxt  # noqa: E402
import asyncio  # noqa: E402

loop = asyncio.get_event_loop()
# import txaio
# txaio.start_logging(level='debug')


async def main():
    if len(sys.argv) <= 3:
        print('python ' + __file__ + ' exchange event symbol [params]')
        sys.exit(-1)

    exchange_id = sys.argv[1]
    apiKey = 'API_KEY' in os.environ and os.environ['API_KEY'] or ''
    secret = 'SECRET' in os.environ and os.environ['SECRET'] or ''
    event = sys.argv[2]
    symbol = sys.argv[3]
    params = {}
    for i in range(4, len(sys.argv)):
        parts = sys.argv[i].split(':',2)
        params[parts[0]] = parts[1]


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

    @exchange.on(event)
    def websocket_ob(symbol, data):  # pylint: disable=W0612
        print(event + " received from: " + symbol)
        pp.pprint(data)
        sys.stdout.flush()

    sys.stdout.flush()

    await exchange.websocket_subscribe(event, symbol, params)
    print("subscribed: " + symbol)

#loop.run_until_complete(main())
try:
    asyncio.ensure_future(main())
    loop.run_forever()
except KeyboardInterrupt:
    pass
finally:
    print("Closing Loop")
    loop.close()
# loop.stop()
# loop.close()
print("after complete")
