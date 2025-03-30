from ccxt.base.types import Market, Str
from ccxt.hyperliquid import hyperliquid

from ccxt.base.types import Str, Int


class hyperliquid_abs(hyperliquid):
    def coin_to_market_id(self, coin: Str):
        market_id = super().coin_to_market_id(coin)
        return market_id.split(':')[0]

    def fetch_order_trades(self, id: str, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        symbol_trades = self.fetch_my_trades(symbol, since, limit, params=params)
        return self.filter_by_array(symbol_trades, 'order', values=[id], indexed=False)
