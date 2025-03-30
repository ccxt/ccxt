from typing import List

from ccxt.base.types import Market
from ccxt.hyperliquid import hyperliquid
from ccxt.hyperliquid_abs import hyperliquid_abs

HYPERLIQUID_SPOT = 'HyperLiquid Spot'


class hyperliquid_spot(hyperliquid_abs):
    def __init__(self, config={}):
        super().__init__(config)
        self.options['defaultType'] = 'spot'

    def fetch_markets(self, params={}) -> List[Market]:
        markets = self.fetch_spot_markets(params)
        if relevant_markets := [market for market in markets if market['symbol'] == 'UBTC/USDC']:
            ubtc_market = relevant_markets[0]
            ubtc_market['symbol'] = 'BTC/USDC'
        markets = self.replace_k_with_1000(markets)
        return markets
