import ccxt
from pprint import pprint


# make sure your version is the latest
print('CCXT Version:', ccxt.__version__)

exchange = ccxt.okex({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_API_SECRET',
    'password': 'YOUR_API_PASSWORD',
})

exchange.load_markets()

# https://github.com/ccxt/ccxt/wiki/Manual#implicit-api-methods
# https://github.com/ccxt/ccxt/wiki/Manual#passing-parameters-to-api-methods
# uncomment to see all available methods
# pprint(dir(exchange))

code = 'BTC'
currency = exchange.currency(code)


try:
    response = exchange.account_post_transfer({
        'currency': currency['id'],
        'amount': '0.1',
        # 'type': '0',  # 0 transfer between accounts, 1 main to sub_account, 2 sub_account to main
        'from': '6',  # 1 spot, 3 futures, 5 margin, 6 funding account, 9 swap, 12 option
        'to': '1',  # 1 spot, 3 futures, 5 margin, 6 funding account, 9 swap, 12 option
        # 'sub_account': 'name_of_sub_account',  # when type is 1 or 2 sub_account is required
        # 'instrument_id': 'String',  # margin trading pair of token or underlying of USDT-margined futures transferred out, such as: btc-usdt. Limited to trading pairs available for margin trading or underlying of enabled futures trading.
        # 'to_instrument_id': 'String'  # margin trading pair of token or underlying of USDT-margined futures transferred in, such as: btc-usdt. Limited to trading pairs available for margin trading or underlying of enabled futures trading.
    })
    pprint(response)
except Exception as e:
    print(type(e).__name__, str(e))
