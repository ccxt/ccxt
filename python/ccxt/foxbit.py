from ccxt.base.exchange import Exchange
from ccxt.abstract.foxbit import ImplicitAPI


class foxbit(Exchange, ImplicitAPI):

    def describe(self):
        return self.deep_extend(super(foxbit, self).describe(), {
            'id': 'foxbit',
            'name': 'Foxbit',
            'countries': ['BR'],
            'version': 'v3',
            'certified': True,
        })