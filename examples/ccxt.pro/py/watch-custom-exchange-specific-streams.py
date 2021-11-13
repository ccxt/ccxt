import asyncio
import ccxtpro


class MyBinance(ccxtpro.binance):

    def handle_mini_ticker(self, client, message):
        market_id = self.safe_string_lower(message, 's')
        message_hash = market_id + '@miniTicker'
        client.resolve(message, message_hash)

    def handle_message(self, client, message):
        handlers = {
            '24hrMiniTicker': self.handle_mini_ticker,
            # add other custom handlers here
        }
        e = self.safe_string(message, 'e')
        method = self.safe_value(handlers, e)
        if method:
            return method(client, message)
        else:
            return super(MyBinance, self).handle_message(client, message)


async def main():
    exchange = MyBinance({
        'enableRateLimit': False,
        'options': {
            'defaultType': 'future'
        }
    })
    await exchange.load_markets()
    # exchange.verbose = True  # uncomment for debugging purposes
    market = exchange.market('BTC/USDT')
    message_hash = market['lowercaseId'] + '@miniTicker'
    while True:
        try:
            print(await exchange.watch_public(message_hash))
        except Exception as e:
            print(type(e).__name__, str(e))
    await exchange.close()


if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(main())