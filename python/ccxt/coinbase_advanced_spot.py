from typing import List, Optional

from ccxt.coinbase import coinbase
from ccxt.base.errors import PermissionDenied
from ccxt.base.types import Int, Market, Trade

COINBASE_ADVANCED_SPOT = 'Coinbase Advanced Spot'


class coinbase_advanced_spot(coinbase):
    def describe(self):
        return self.deep_extend(super().describe(), {
            'exceptions': {
                'broad': {
                    'Missing required scopes': PermissionDenied,
                },
            },
        })

    def __init__(self, config={}):
        super().__init__(config)
        self.options['fetchBalance'] = 'v3PrivateGetBrokerageAccounts'
        self.options.setdefault('networksById', {})

    def _normalize_market_alias(self, market: Market) -> Market:
        info = market.get('info', {})
        alias = info.get('alias')
        market['alias'] = alias.replace('-', '/') if alias else None
        return market

    def fetch_markets(self, params={}) -> List[Market]:
        markets = super().fetch_markets(params)
        return [self._normalize_market_alias(m) for m in markets if m['spot']]

    def fetch_trades(self, symbol: str, since: Int = None, limit: Int = None, params={}) -> List[Trade]:
        if since is not None:
            until, _ = self.handle_option_and_params(params, 'fetchTrades', 'until')
            if until is None:
                params = self.extend({'until': self.milliseconds()}, params)
        return super().fetch_trades(symbol, since, limit, params)

    def fetch_order_trades(self, id: str, symbol: Optional[str] = None, since: Optional[int] = None,
                           limit: Optional[int] = None, params={}):
        request = {'order_id': id}
        return self.fetch_my_trades(symbol, since, limit, self.extend(request, params))
