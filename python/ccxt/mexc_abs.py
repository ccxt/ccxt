from ccxt.mexc import mexc
from ccxt.base.errors import DDoSProtection

MEXC = 'MEXC'


class mexc_abs(mexc):
    def describe(self):
        return self.deep_extend(super(mexc_abs, self).describe(), {
            'exceptions': {
                'exact': {
                    '510': DDoSProtection,  # {"success":false,"code":510,"message":"Requests are too frequent, please try again later"}
                },
            },
        })

    def __init__(self, config={}):
        super().__init__(config)
        self.options['broker'] = 'CORNIX'
