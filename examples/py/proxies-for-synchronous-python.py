# The python version of the library uses the python-requests (https://python-requests.org) package for underlying HTTP and supports all means of customization available in the `requests` package, including proxies.

import ccxt

my_proxies = {
    'http': 'http://1.2.3.4:5678',
    'https': 'http://1.2.3.4:5678',
}

# You can pass them to the constructor
exchange = ccxt.poloniex({
    'proxies': my_proxies,
})
# or set them anytime after instantiation
exchange.proxies = my_proxies




# ########## CONFIGURING FROM ENV ########## #
# You can configure proxies by setting the environment variables:

# $ export HTTP_PROXY="http://1.2.3.4:5678" 
# $ export HTTPS_PROXY="http://1.2.3.4:5678"

# And then passing `trust_env` to `True`(by default, it is set to `False`)
# exchange = ccxt.binance({
#    'trust_env': True
# })

# ########################################## #


# A more detailed documentation on using proxies with the sync python version of the ccxt library can be found here:

# http://docs.python-requests.org/en/master/user/advanced/#proxies
# http://docs.python-requests.org/en/master/user/advanced/#socks