# coding=utf-8

def style     (s, style): return style + str (s) + '\033[0m'
def green     (s): return style (s, '\033[92m')
def blue      (s): return style (s, '\033[94m')
def yellow    (s): return style (s, '\033[93m')
def red       (s): return style (s, '\033[91m')
def pink      (s): return style (s, '\033[95m')
def bold      (s): return style (s, '\033[1m')
def underline (s): return style (s, '\033[4m')

import ccxt
import time
import sys

try: # try to load the markets config

    from config import markets as markets

except ImportError: # fallback

    markets = {}

# print a colored string
def dump (*args):
    print (' '.join ([str (arg) for arg in args]))

def test_market_symbol_orderbook (market, symbol):
    delay = int (market.rateLimit / 1000)
    time.sleep (delay)
    orderbook = market.fetch_order_book (symbol)
    print (market.id, symbol, 'order book',
        orderbook['datetime'],
        'bid: ' +       str (orderbook['bids'][0][0] if len (orderbook['bids']) else 'N/A'), 
        'bidVolume: ' + str (orderbook['bids'][0][1] if len (orderbook['bids']) else 'N/A'),
        'ask: '       + str (orderbook['asks'][0][0] if len (orderbook['asks']) else 'N/A'),
        'askVolume: ' + str (orderbook['asks'][0][1] if len (orderbook['asks']) else 'N/A'),
    )

def test_market_symbol_ticker (market, symbol):
    delay = int (market.rateLimit / 1000)
    time.sleep (delay)
    ticker = market.fetch_ticker (symbol)
    print (market.id, symbol, 'ticker',
        ticker['datetime'],
        'high: '    + str (ticker['high']),
        'low: '     + str (ticker['low']),
        'bid: '     + str (ticker['bid']),
        'ask: '     + str (ticker['ask']),
        'volume: '  + str (ticker['quoteVolume']),
    )

def test_market_symbol (market, symbol):

    test_market_symbol_ticker (market, symbol)
    if market.id == 'coinmarketcap':
        dump (green (market.fetchGlobal ()))
    else:
        test_market_symbol_orderbook (market, symbol)

def load_market (market):
    products = market.load_products ()
    keys = list (market.products.keys ())
    # print (market.id , len (keys), 'symbols', keys)

def test_market (market):

    dump (red (market.id))
    delay = 2
    keys = list (market.products.keys ())

    #--------------------------------------------------------------------------
    # public API

    symbol = keys[0]
    symbols = [
        'BTC/USD',
        'BTC/CNY',
        'BTC/ETH',
        'ETH/BTC',
        'BTC/JPY',
        'LTC/BTC',
    ]

    for s in symbols:
        if s in keys:
            symbol = s
            break

    if symbol.find ('.d') < 0:
        test_market_symbol (market, symbol)

    #--------------------------------------------------------------------------
    # private API

    if (not hasattr (market, 'apiKey') or (len (market.apiKey) < 1)):
        return 

    balance = market.fetch_balance ()
    print (balance)
    # time.sleep (delay)

    amount = 1
    price = 0.0161

    # marketBuy = market.create_market_buy_order (symbol, amount)
    # print (marketBuy)
    # time.sleep (delay)

    # marketSell = market.create_market_sell_order (symbol, amount)
    # print (marketSell)
    # time.sleep (delay)

    # limitBuy = market.create_limit_buy_order (symbol, amount, price)
    # print (limitBuy)
    # time.sleep (delay)

    # limitSell = market.create_limit_sell_order (symbol, amount, price)
    # print (limitSell)
    # time.sleep (delay)

#------------------------------------------------------------------------------

for id in ccxt.markets:
    market = getattr (ccxt, id)
    markets[id] = market ({
        'verbose': True,
        # 'proxy': 'https://crossorigin.me/',
        # 'proxy': 'https://cors-anywhere.herokuapp.com/',
        # 'proxy': 'http://cors-proxy.htmldriven.com/?url=',
    })

config = {
    '_1broker':    { 'apiKey': 'A0f79063a5e91e6d62fbcbbbbdd63258' },
    '_1btcxe':     { 'apiKey': '7SuUd4B6zfGAojPn', 'secret': '392WCRKmGpcXdiVzsyQqwengLTOHkhDa' },
    'bit2c':       { 'apiKey': '5296814c-b1dc-4201-a62a-9b2364e890da', 'secret': '8DC1100F7CAB0AE6FE72451C442BE7B111404CBD569CE6162F8F2122CAEB211C' },
    'bitbay':      { 'apiKey': '3faec3e5458d24809a68fbaf0e97245b', 'secret': '2ffb20992e10dd54fd4fd4133cc09b00' },
    'bitcoincoid': { 'apiKey': 'KFB2MWYU-HTOUVOSO-UZYRPLUY-LIYMVPRU-UTOMHXYD', 'secret': '5ecb9464b3fad228110f33c6fbb32990b755351216e63089fdaf8f2735b4577bd9c335236f1a71e3' },
    'bitfinex':    { 'apiKey': '3oMHSKu37ZoJliKwcN35JHfXUBHxWvVqQmRfaFhbBTF', 'secret': 'm9Cf9krGuRolalRxsIBO53GNLmr6GXYIASwoGJiZxhS' },
    'bitlish':     { 'apiKey': 'fixed:N5lK4iokAc9ajk0Z8pvHfpoJsyzNzQ2nespNH/mY7is', 'login': 'igor.kroitor@gmail.com', 'password': 'VfvfVskfHfve229!' },
    'bitmarket':   { 'apiKey': '43a868dc9517485f28905b320581d1cf', 'secret': '892b34c7d8e6669550aa9d12aed0ad34' },
    'bitmex':      { 'apiKey': 'nsLKchj2hAxc5t5CP6LGTNSC', 'secret': '4AqteCYo9ZCPx9J3dhNiGY-_LTfmtLyqCzh-XSbCibuC-Pf6' },
    'bitso':       { 'apiKey': 'FZZzVkZgza', 'secret': 'f763b98d46d8c5e352b4ef70050bc9b1' },
    'bittrex':     { 'apiKey': '60f38a5818934fc08308778f94d3d8c4', 'secret': '9d294ddb5b944403b58e5298653720c1' },
    'btcx':        { 'apiKey': '53IPO-ZBQEN-91UNL-B8VD5-CTU1Z-E6RB1-S9X3P', 'secret': 'ptrearsi6oy1lmzazfcytnbozmsvjsnzha8hrrqqbjlnvgnqlpjb7kqxyency45a' },
    'bxinth':      { 'apiKey': '191c59bb46d5', 'secret': '03031e588e69' },
    # 'ccex':        { 'apiKey': '301D5954466D87CEAA9BA713A7951F5A', 'secret': 'F7DC06D6329FC1C266BFFA18DCC8A07D' },
    'cex':         { 'apiKey': 'eqCv267WySlu577JnFbGK2RQzIs', 'secret': 'pZnbuNEm5eE4W1VRuFQvZEiFCA', 'uid': 'up105393824' },
    'coincheck':   { 'apiKey': '1YBiSTpyEIkchWdE', 'secret': 'URuZrMASNkcd7vh1zb7zn4IQfZMoai3S' },
    'coinsecure':  { 'apiKey': 'gzrm0fP6BGMilMzmsoJFPMpWjDvCLThyrVanX0yu' },
    'coinspot':    { 'apiKey': '36b5803f892fe97ccd0b22da79ce6b21', 'secret': 'QGWL9ADB3JEQ7W48E8A3KTQQ42V2P821LQRJW3UU424ATYPXF893RR4THKE9DT0RBNHKX8L54F35KBVFH', },
    'fybse':       { 'apiKey': 'gY7y57RlYqKN5ZI50O5C', 'secret': '1qm63Ojf5a' },
    'fybsg':       { 'apiKey': '', 'secret': '' },
    'gdax':        { 'apiKey': '92560ffae9b8a01d012726c698bcb2f1', 'secret': '9aHjPmW+EtRRKN/OiZGjXh8OxyThnDL4mMDre4Ghvn8wjMniAr5jdEZJLN/knW6FHeQyiz3dPIL5ytnF0Y6Xwg==', 'password': '6kszf4aci8r', },
    'hitbtc':      { 'apiKey': '18339694544745d9357f9e7c0f7c41bb', 'secret': '8340a60fb4e9fc73a169c26c7a7926f5' },
    'huobi':       { 'apiKey': '09bdde40-cc179779-1941272a-433a7', 'secret': 'ce6487f4-f078c39f-018ea6ce-01922' },
    'jubi':        { 'apiKey': '4edas-tn7jn-cpr8a-1er4k-r8h8i-cp6kj-jpzyz', 'secret': 'YYO(r-mp$2G-m4&1b-EYu~$-%tS4&-jNNhI-L!pg^' },
    'livecoin':    { 'apiKey': 'W5z7bvQM2pEShvGmqq1bXZkb1MR32GKw', 'secret': 'n8FrknvqwsRnTpGeNAbC51waYdE4xxSB', },
    'luno':        { 'apiKey': 'nrpzg7rkd8pnf', 'secret': 'Ps0DXw0TpTzdJ2Yek8V5TzFDfTWzyU5vfLdCiBP6vsI' },
    'okcoinusd':   { 'apiKey': 'da83cf1b-6fdc-495a-af55-f809bec64e2b', 'secret': '614D2E6D3428C2C5E54C81139A500BE0' },
    'okcoincny':   { 'apiKey': '', 'secret' : '' },
    'poloniex':    { 'apiKey': '6ORNNIXJ-EGXMM5BT-EEGJ5NRV-H78QHS3D', 'secret': '065aad42b2656f374974f4e42558b2d5071f31187aa973210186932acb2f2f3d86e2c481ddf5436e56596a50d4833f00e002d467d1d0597022a9a81ff4e66506' },
    'quadrigacx':  { 'apiKey': 'jKvWkMqrOj', 'secret': 'f65a2e3bf3c73171ee14e389314b2f78', 'uid': '395037' },
    'quoine':      { 'apiKey': '80953', 'secret': 'WfHUWcdFoGvZSuE7pE8XDh8FG9t5OP69iYrcwdnRs4rRn2uzZW+AHCyp/nBjlZcB+LWe3r6y2DCCYu+WcYkCAA==' },
    'therock':     { 'apiKey': '2b2a54cc6258b2a971318000d60e6b61ba4af05e', 'secret': 'b424a76088bda492852dbd5cadbb60ebcf144427' },
    'vaultoro':    { 'apiKey': 'A5jfgi567JP5QPpXYpETfsw92khpuNfR', 'secret': 'OExkUFpUX3o5UHB4amFtQ2R4QUh1RFBPMUhnX0k1bUY=' },
    'virwox':      { 'apiKey': '1ea680450b32585f743c50c051bf8e4e', 'login': 'IgorKroitor', 'password': 'HfveVskfVfvf260' },
    'xbtce':       { 'apiKey': 'dK2jBXMTppAM57ZJ', 'secret': 'qGNTrzs3d956DZKSRnPPJ5nrQJCwetAnh7cR6Mkj5E4eRQyMKwKqH7ywsxcR78WT', 'uid': '68ef0552-3c37-4896-ba56-76173d9cd573', },
    'yobit':       { 'apiKey': '5DB6C7C6034E667D77F85B245772A7FD', 'secret': '1b6cf1838716f5c87f07391a9b30f974' },
    'zaif':        { 'apiKey': '580c7232-06c7-4698-8fb7-4cd2a543cea8', 'secret': '4c529fd6-fb28-4879-b20d-2a8f02c5db47' },
}

tuples = list (ccxt.Market.keysort (config).items ())
for (id, params) in tuples:
    options = list (params.items ())
    for key in params:
        setattr (markets[id], key, params[key])

# for id in config
#     for key in config[id]
# markets['_1broker'].apiKey = 'A0f79063a5e91e6d62fbcbbbbdd63258'

markets['gdax'].urls['api'] = 'https://api-public.sandbox.gdax.com'
markets['anxpro'].proxy = 'https://crossorigin.me/'

# markets['bitstamp'].apiKey = 'blabla'
# markets['bitstamp'].secret = 'blabla'

id = None

try:
    id = sys.argv[1]
except:
    id = None

if id:
    
    market = markets[id]
    load_market (market)
    symbol = None
    
    try:
        symbol = sys.argv[2]
    except:
        symbol = None
    
    if symbol:
        test_market_symbol (market, symbol)
    else:
        test_market (market)

else:
    tuples = list (ccxt.Market.keysort (markets).items ())
    for (id, params) in tuples:
        try:
            market = markets[id]
            load_market (market)
            test_market (market)
        except ccxt.DDoSProtectionError as e:
            print (type (e).__name__, e.args, 'DDoS Protection Error (ignoring)')
        except ccxt.TimeoutError as e:
            print (type (e).__name__, e.args, 'Timeout Error, request timed out (ignoring)')
        except ccxt.MarketNotAvailaibleError as e:
            print (type (e).__name__, e.args, 'Market Not Available Error due to downtime or maintenance (ignoring)')
        except ccxt.AuthenticationError as e:
            print (type (e).__name__, e.args, 'Authentication Error (missing API keys, ignoring)')
        except Exception as e:
            print (type (e).__name__, e.args, str (e))