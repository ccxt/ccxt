from ccxt.mexc import mexc
from ccxt.base.errors import DDoSProtection, AuthenticationError

MEXC = 'MEXC'


class mexc_abs(mexc):
    def describe(self):
        return self.deep_extend(super(mexc_abs, self).describe(), {
            'exceptions': {
                'exact': {
                    '402': AuthenticationError,  # {"success":false,"code":402,"message":"API Key expired, please apply again"}
                    '510': DDoSProtection,  # {"success":false,"code":510,"message":"Requests are too frequent, please try again later"}
                },
            },
        })

    def __init__(self, config={}):
        super().__init__(config)
        self.options['broker'] = 'CORNIX'

    def fetch_refer_code(self, params={}):
        self.load_markets()
        return self.spotPrivateGetRebateReferCode(params)

    def fetch_rebate_tax_query(self, relevant_date=None, page=None, params={}):
        self.load_markets()
        request = {'pageSize': 100}
        if page is not None:
            request['page'] = page
        response = self.brokerPrivateGetRebateTaxQuery(self.extend(request, params))
        if relevant_date is not None:
            date_str = relevant_date.strftime('%Y%m%d')
            response['data'] = [r for r in response.get('data', []) if r.get('time') == date_str]
        return response
