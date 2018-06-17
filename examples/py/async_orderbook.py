import os
import sys
import pprint
import traceback

pp = pprint.PrettyPrinter(depth=6)

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')
# import ccxt  # noqa: E402
import ccxt.async as ccxt  # noqa: E402

loop = ccxt.Exchange.loop


async def main():
    if len(sys.argv) <= 5:
        print('python ' + __file__ + ' exchange apikey secret symbol limit')
        sys.exit(-1)

    exchange_id = sys.argv[1]
    apiKey = sys.argv[2]
    secret = sys.argv[3]
    symbol = sys.argv[4]
    limit = int(sys.argv[5])

    exchange = getattr(ccxt, exchange_id)({
        "apiKey": apiKey,
        "secret": secret,
        "enableRateLimit": True,
        'verbose': True,
        'timeout': 5 * 1000
    })

    @exchange.on('err')
    def async_error(err, conxid):  # pylint: disable=W0612
        print(type(err).__name__ + ":" + str(err))
        traceback.print_tb(err.__traceback__)
        traceback.print_stack()
        loop.stop()

    @exchange.on('ob')
    def async_ob(symbol, ob):  # pylint: disable=W0612
        print("ob received from: " + symbol)
        # pp.pprint(ob)

    sys.stdout.flush()

    await exchange.async_subscribe_order_book(symbol)
    ob = await exchange.async_fetch_order_book(symbol, limit)  # noqa: F841 pylint: disable=W0612
    print("od received\n")
    # pp.pprint(ob)


loop.run_until_complete(main())
loop.run_forever()
print("after complete")
