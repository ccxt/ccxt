import ccxt
hitbtc = ccxt.hitbtc()

# def try_proxy(exchange, symbol, proxy=''):
#     try:
#         print('Trying', proxy if proxy else 'without proxy')
#         hitbtc.proxy = proxy
#         print(exchange.id, proxy, symbol, hitbtc.fetch_ticker(symbol), 'succeeded')
#     except Exception as e:
#         print(exchange.id, proxy, symbol, 'failed')

# try_proxy(hitbtc, 'BTC/USD')
# try_proxy(hitbtc, 'BTC/EUR', 'https://crossorigin.me/')
# try_proxy(hitbtc, 'ETH/BTC', 'https://cors-anywhere.herokuapp.com/')
