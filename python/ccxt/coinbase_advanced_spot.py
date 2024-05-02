from ccxt.coinbase import coinbase

COINBASE_ADVANCED_SPOT = 'Coinbase Advanced Spot'


class coinbase_advanced_spot(coinbase):
    def __init__(self, config={}):
        super().__init__(config)
