from typing import Any

from ccxt.base.errors import PermissionDenied, ExchangeError
from ccxt.bitget import bitget


class bitget_abs(bitget):
    def __init__(self, config={}):
        super().__init__(config)
        self.headers['locale'] = 'en-US'
        self.has['fetchCurrencies'] = False

    def describe(self) -> Any:
        return self.deep_extend(super().describe(), {
            'exceptions': {
                'exact': {
                    '32038': ExchangeError,  # {"code":"32038","msg":"The sell price cannot be lower than the trigger price percentX%","requestTime":1778044519615,"data":null}
                    '40013': PermissionDenied,  # {"code":"40013","msg":"User status is abnormal","requestTime":1768398859928,"data":null}
                }
            }
        })
