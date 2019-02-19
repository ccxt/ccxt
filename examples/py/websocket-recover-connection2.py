import os
import sys
import pprint
import traceback
from random import randint


pp = pprint.PrettyPrinter(depth=6)

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')
# import ccxt  # noqa: E402
import ccxt.async_support as ccxt  # noqa: E402
import asyncio  # noqa: E402

loop = asyncio.get_event_loop()

notRecoverableError = False
nextRecoverableErrorTimeout = None

async def doUnsubscribe(exchange, symbols, params):  # noqa: E302
    for symbol in symbols:
        print('unsubscribe: ' + symbol)
        sys.stdout.flush()
        await exchange.websocket_unsubscribe('ob', symbol, params)
        print('unsubscribed: ' + symbol)
        sys.stdout.flush()

async def doSubscribe(exchange, symbols, params):  # noqa: E302
    global nextRecoverableErrorTimeout
    for symbol in symbols:
        if notRecoverableError:
            return
        print('subscribe: ' + symbol)
        sys.stdout.flush()
        await exchange.websocket_subscribe('ob', symbol, params)
        print('subscribed: ' + symbol)
        sys.stdout.flush()

    # hack to emit websocket error
    seconds2wait = randint(5, 10)
    print("NEXT PROGRAMATED WEBSOCKET ERROR AFTER " + str(seconds2wait) + " seconds")
    sys.stdout.flush()

    def raise_recoverable_error():  # noqa: E302
        keys = list(exchange.websocketContexts.keys())
        keyIndex = randint(0, len(keys) - 1)
        contextId = keys[keyIndex]
        exchange.websocketContexts[contextId]['conx']['conx'].emit('err', 'recoverable error')
    nextRecoverableErrorTimeout = loop.call_later(seconds2wait, raise_recoverable_error)


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
        'verbose': False,
        'timeout': 5 * 1000
    })

    @exchange.on('err')
    async def websocket_error(err, conxid):  # pylint: disable=W0612
        global notRecoverableError
        global loop
        global nextRecoverableErrorTimeout
        print(type(err).__name__ + ":" + str(err))
        traceback.print_tb(err.__traceback__)
        # traceback.print_stack()
        sys.stdout.flush()
        if isinstance(err, ccxt.NetworkError):
            exchange.websocketClose(conxid)
            print("waiting 5 seconds ...")
            sys.stdout.flush()
            await asyncio.sleep(5)
            try:
                if notRecoverableError:
                    return
                print("subscribing again ...")
                sys.stdout.flush()
                
                await exchange.websocketRecoverConxid(conxid)
            except Exception as ex:
                print(ex)
                sys.stdout.flush()
        else:
            print("unsubscribing all ...")
            notRecoverableError = True
            if nextRecoverableErrorTimeout is not None:
                nextRecoverableErrorTimeout.cancel()
            await doUnsubscribe(exchange, symbols, {
                'limit': limit,
            })
            print("unsubscribed all")
            loop.stop()

    @exchange.on('ob')
    def websocket_ob(symbol, ob):  # pylint: disable=W0612
        print("ob received from: " + symbol)
        sys.stdout.flush()
        # pp.pprint(ob)

    await exchange.loadMarkets()

    def raise_unrecoverable_error():
        keys = list(exchange.websocketContexts.keys())
        keyIndex = randint(0, len(keys) - 1)
        contextId = keys[keyIndex]
        exchange.emit('err', ccxt.ExchangeError('not recoverable error'), contextId)
    loop.call_later(30, raise_unrecoverable_error)

    await doSubscribe(exchange, symbols, {
        'limit': limit
    })

asyncio.ensure_future(main())
loop.run_forever()
print("after complete")
