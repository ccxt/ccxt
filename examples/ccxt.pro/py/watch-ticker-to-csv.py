# -*- coding: utf-8 -*-

from asyncio import gather, get_event_loop
import ccxtpro
from pprint import pprint


async def watch_ticker_continuously(exchange, symbol):
    filename = exchange.id + '-' + symbol.replace('/', '-') + '.csv'
    print('Watching', exchange.id, symbol, filename)
    keys = ['index', 'exchange', 'symbol', 'timestamp', 'open', 'high', 'low', 'close', 'baseVolume']
    with open(filename, 'w') as file:
        file.write(','.join(keys) + "\n")
    index = 0
    while True:
        try:
            ticker = await exchange.watch_ticker(symbol)
            values = [str(index), exchange.id] + [str(ticker[key]) for key in keys[2:]]
            print(*values)
            with open(filename, 'a') as file:
                file.write(','.join(values) + "\n")
            index += 1
        except Exception as e:
            print(e)


async def watch_tickers_continuously(loop, exchange_id, overrides, symbols):
    defaults = {
        'enableRateLimit': True, # required https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
        'asyncio_loop': loop,
    }
    exchange_class = getattr(ccxtpro, exchange_id)
    exchange = exchange_class(ccxtpro.Exchange.extend(defaults, overrides))
    coroutines = [watch_ticker_continuously(exchange, symbol) for symbol in symbols]
    await gather(*coroutines)
    await exchange.close()


async def main(loop):
    exchanges = {
        'binance': {'options': {'defaultType': 'future'}},
        'huobipro': {}
    }
    symbols = ['BTC/USDT', 'ETH/USDT', 'LTC/USDT', 'XRP/USDT', 'BCH/USDT']
    coroutines = [watch_tickers_continuously(loop, exchange_id, exchanges[exchange_id], symbols) for exchange_id in exchanges.keys()]
    return await gather(*coroutines)

if __name__ == "__main__":
    loop = get_event_loop()
    loop.run_until_complete(main(loop))





#         # with open('C:/'') as csv_file:
#         #     csv_writer = csv.DictWriter(csv_file, fieldnames=field_names)
#         #     info = {
#         #         'index': index_time,
#         #         'timestamp_val': timestamp_val,
#         #         'open_value': open_val,
#         #         'high_value': high_val,
#         #         'low_value': low_val,
#         #         'close_value': close_val,
#         #         'volume': vol
#         #     }
#         #     csv_writer.writerow(info)




# field_names =
# for k in exchange_list:
#     for j in ticker_list:
#         with open('C:/' + k + j.split('/')[0] + '.csv', 'w', newline='') as csv_file:
#             csv_writer = csv.DictWriter(csv_file, fieldnames=field_names)
#             csv_writer.writeheader()







# loop = asyncio.new_event_loop()

# for i in ticker_list:
#     loop.create_task(main_pro_binance(loop, i))
#     loop.create_task(main_pro_huobi(loop, i))
# loop.run_forever()