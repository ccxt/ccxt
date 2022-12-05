import ccxt
from ccxt import Exchange


class kucoinfutures(Exchange, ccxt.async_support.kucoin):
    pass