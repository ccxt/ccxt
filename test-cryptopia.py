import ccxt
import json

exchange = ccxt.cryptopia({
    "apiKey": "1b1a398d7d4c415287a3ca04107257aa",
    "secret": "ODXmrj4JWDxVo2kaGhJ8m/BmwEcDUNmSBIf2bQtGvtA=",
})

print(exchange.fetch_open_orders('PIVX/BTC'))
