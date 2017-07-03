# coding=utf-8

import ccxt
import time

verbose = False

try:

	from config import markets as markets

except ImportError:

	markets = { # defaults

		'_1broker':    { 'verbose': verbose, 'apiKey': '' },
		'_1btcxe':     { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'anxpro':      { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'bit2c':       { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'bitbay':      { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'bitcoincoid': { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'bitfinex':    { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'bitlish':     { 'verbose': verbose, 'apiKey': '', 'login': '', 'password': '' },
		'bitmarket':   { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'bitmex':      { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'bitso':       { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'bitstamp':    { 'verbose': verbose, 'apiKey': '', 'secret': '', 'uid': '' },
		'bittrex':     { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'btcchina':    { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'btcx':        { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'bxinth':      { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'ccex':        { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'cex':         { 'verbose': verbose, 'apiKey': '', 'secret': '', 'uid': '' },
		'coincheck':   { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'coinsecure':  { 'verbose': verbose, 'apiKey': '' },
		'exmo':        { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'fybse':       { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'fybsg':       { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'gdax':        { 'verbose': verbose, 'apiKey': '', 'secret': '', 'password': '' },
		'hitbtc':      { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'huobi':       { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'jubi':        { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'kraken':      { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'luno':        { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'okcoinusd':   { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'okcoincny':   { 'verbose': verbose, 'apiKey': '', 'secret' : '' },
		'poloniex':    { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'quadrigacx':  { 'verbose': verbose, 'apiKey': '', 'secret': '', 'uid': '' },
		'quoine':      { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'therock':     { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'vaultoro':    { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'virwox':      { 'verbose': verbose, 'apiKey': '', 'login': '', 'password': '' },
		'yobit':       { 'verbose': verbose, 'apiKey': '', 'secret': '' },
		'zaif':        { 'verbose': verbose, 'apiKey': '', 'secret': '' },
	}

#------------------------------------------------------------------------------

tuples = list (ccxt.Market.keysort (markets).items ())

# print (tuples)

for (id, params) in tuples:
	# id, params = tuples[t]
	market = getattr (ccxt, id)
	markets[id] = market (dict (params, **({ 'id': id, 'verbose': verbose })))

def test_market (market):

	delay = 2
	
	print ('-----------------------------------------------------------------')
	# print (dir (market))
	# print (market.id)

	products = market.load_products ()
	# print (market.id, 'products', products)

	keys = list(products.keys ())
	print (market.id , len (keys), 'symbols', keys)
	# time.sleep (delay)

	symbol = keys[0]
	for s in ['BTC/USD', 'BTC/CNY', 'BTC/ETH', 'ETH/BTC', 'BTC/JPY']:
		if s in keys:
			symbol = s
			break

	# symbol = products.keys ()[0]
	# symbol = 'BTC/IDR'
	# symbol = 'BTC/JPY'
	# symbol = 'BTC/CNY'

	#--------------------------------------------------------------------------
	# public API

	# print (market.id, symbol, 'orderbook')
	# orderbook = market.fetch_order_book (symbol)
	# print (orderbook)
	# time.sleep (delay)

	# print (market.id, symbol, 'trades')
	# trades = market.fetch_trades (symbol)
	# print (trades)
	# time.sleep (delay)

	for symbol in keys:
		if symbol.find ('.d') < 0:
			# print (market.id, symbol, market.product (symbol))
			ticker = market.fetch_ticker (symbol)
			print (market.id, symbol, 'ticker',
				ticker['datetime'],
				'high: '    + str (ticker['high']),
				'low: '     + str (ticker['low']),
				'bid: '     + str (ticker['bid']),
				'ask: '     + str (ticker['ask']),
				'volume: '  + str (ticker['quoteVolume']),
			)
			time.sleep (delay)

	#--------------------------------------------------------------------------
	# private API

	if (not market.apiKey) or (len (market.apiKey) < 1):
		return 

	print ('balance')
	balance = market.fetch_balance ()
	print (balance)
	time.sleep (delay)

	amount = 1
	price = 0.0161

	# print ('market buy')
	# marketBuy = market.buy (symbol, amount)
	# print (marketBuy)
	# time.sleep (delay)

	# print ('market sell')
	# marketSell = market.sell (symbol, amount)
	# print (marketSell)
	# time.sleep (delay)

	# print ('limit buy')
	# limitBuy = market.buy (symbol, amount, price)
	# print (limitBuy)
	# time.sleep (delay)

	# print ('limit sell')
	# limitSell = market.sell (symbol, amount, price)
	# print (limitSell)
	# time.sleep (delay)

# for (id, params) in tuples:
# 	try:
# 		test_market (markets[id])
# 	except Exception as e:
# 		print (type (e).__name__, e.args)
# 		sys.exit ()

test_market (markets['btcchina'])
