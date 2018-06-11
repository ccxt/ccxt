import asyncio
import os
import sys
import pprint

pp = pprint.PrettyPrinter(depth=6)

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')
import ccxt

loop = ccxt.Exchange.loop

async def main():
    if len(sys.argv) <= 4:
        print('python ' + __file__ + ' apikey secret symbol limit')
        sys.exit(-1)

    apiKey = sys.argv[1]
    secret = sys.argv[2]
    symbol = sys.argv[3]
    limit = int(sys.argv[4])


    exchange = ccxt.cex({
        "apiKey": apiKey,
        "secret": secret,
        "enableRateLimit": True,
        'verbose': True,
        'timeout': 5 * 1000
    })

    @exchange.on('error')
    def async_error(err):
        print(err)
        loop.stop()

    @exchange.on('ob')
    def async_ob(symbol, ob):
        print("ob received from: " + symbol)
        #pp.pprint(ob)

    print("async_s")
    sys.stdout.flush()

    await exchange.async_subscribe_order_book(symbol)
    ob = await exchange.async_fetch_order_book(symbol, limit)
    print("od received\n")
    #pp.pprint(ob)


loop.run_until_complete(main())
loop.run_forever()
print("after complete")