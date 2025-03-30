from typing import List

from ccxt.base.types import Market
from ccxt.hyperliquid import hyperliquid
from ccxt.hyperliquid_abs import hyperliquid_abs

HYPERLIQUID_FUTURES = 'HyperLiquid Futures'


class hyperliquid_futures(hyperliquid_abs):
    def __init__(self, config={}):
        super().__init__(config)
        self.options['defaultType'] = 'swap'

    def fetch_markets(self, params={}) -> List[Market]:
        markets = self.fetch_swap_markets(params)
        for market in markets:
            market['symbol'] = market['symbol'].split(':')[0]
        return markets
