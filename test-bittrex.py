import ccxt
import json
with open('./keys.json') as file:
    config = json.load(file)

exchange = ccxt.bittrex(config['bittrex'])

print(exchange.fetch_balance())
