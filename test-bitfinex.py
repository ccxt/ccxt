import ccxt
import time

bitfinex = ccxt.bitfinex2({
    'apiKey': 'N2riVgFz9FGV2ZzY5xVhsVmeYJNZpljMBni78iUCpcO',
    'secret': 'pm9J0XdjIaHlm5tktg8YJvBXdrX7QU8ydlPNQhfHMJn',
    'verbose': True,
})

print(bitfinex.create_market_buy_order('BTC/USD', 1))
