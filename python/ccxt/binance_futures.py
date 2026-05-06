from typing import Any

from ccxt.base.errors import ExchangeError, OrderNotFound, PermissionDenied, RateLimitExceeded
from ccxt.base.types import Int, Str
from ccxt.binance_futures_abs import binance_futures_abs

BINANCE_FUTURES = 'Binance Futures'


class binance_futures(binance_futures_abs):
    def describe(self) -> Any:
        return self.deep_extend(super(binance_futures, self).describe(), {
            'options': {
                'fetchMarkets': ['linear'],
                'defaultType': 'future',
                'defaultSubType': 'linear',
            },
            'exceptions': {
                'linear': {
                    'exact': {
                        '-4109': PermissionDenied,
                        '-4192': RateLimitExceeded, #  {"code":-4192,"msg":"Trade forbidden due to Cooling-off Period."}
                        '-4400': ExchangeError,
                        '-4401': ExchangeError,
                        '-4402': ExchangeError,
                        '-4403': ExchangeError,
                    }
                },
            }
        })

    def fetch_order(self, id: str, symbol: Str = None, params={}):
        if params.get('stop'):
            params.pop('stop')
            try:
                return super().fetch_order(id, symbol, params)
            except OrderNotFound:
                algo_order = super().fetch_order(id, symbol, params | {'stop': True})
                if algo_order['status'] == 'closed':
                    return super().fetch_order(id, symbol, params)
                return algo_order
        else:
            return super().fetch_order(id, symbol, params)

    def cancel_order(self, id: str, symbol: Str = None, params={}):
        if params.get('stop'):
            params.pop('stop')
            try:
                return super().cancel_order(id, symbol, params)
            except OrderNotFound:
                return super().cancel_order(id, symbol, params | {'stop': True})
        else:
            return super().cancel_order(id, symbol, params)

    def fetch_order_trades(self, id: str, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        if params.get('stop'):
            params.pop('stop')
            order = self.fetch_order(id, symbol, params)
            return super().fetch_order_trades(order['id'], symbol, since, limit, params)
        else:
            return super().fetch_order_trades(id, symbol, since, limit, params)
