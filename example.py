import pprint

import ccxt

gooplex = ccxt.gooplex({
    'apiKey': '94C9ae99e268804BDD945c9F51A032F8esBgoCmuMKYjPj29nsGIV8WP2rztU9qC',
    'secret': '257755452B7a0dBbe304295658bE58842dL3iem85kPaBAkkxh264Rl2nxqARHDU'
})

# Informações de símbolos, se estão ativos, preço mínimo, preço máximo, etc.
# markets = gooplex.load_markets()
# pprint.pprint(markets)

# Simbolos reconhecidos pelo exchange
# pprint.pprint(gooplex.symbols)

symbol = 'BTC/USDT'
# pprint.pprint(gooplex.fetchOHLCV(symbol))
markets = gooplex.load_markets()
pprint.pprint(gooplex.fetch_trades(symbol))
pprint.pprint(gooplex.fetch_ticker(symbol))
pprint.pprint(gooplex.fetch_agg_trades(symbol))
pprint.pprint(gooplex.fetch_bids_asks(symbol))
pprint.pprint(gooplex.fetch_ticker(symbol))

# # Mostra bids & asks
# pprint.pprint(gooplex.fetch_order_book(symbol))

# # Saldo da carteira -- requer apiKey + secret
# pprint.pprint(gooplex.fetch_balance())

# pprint.pprint(gooplex.create_order(symbol='BNB/BTC',
#                                    type='market',
#                                    side='sell',
#                                    amount='0.2'))
# pprint.pprint(gooplex.create_order('BTC/BNB',
#                                    type='market',
#                                    side='sell',
#                                    amount='0.2'))
# pprint.pprint(gooplex.fetch_orders(symbol))

# pprint.pprint(gooplex.cancel_order('348864'))
# pprint.pprint(gooplex.fetch_order('348864'))
# pprint.pprint(gooplex.fetch_order('177'))
