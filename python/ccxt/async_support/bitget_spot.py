from ccxt.async_support.bitget import bitget

BITGET_SPOT = 'Bitget Spot'


class bitget_spot(bitget):
    def __init__(self, config={}):
        super().__init__(config)
