from ccxt.async_support.bitget import bitget

BITGET_FUTURES = 'Bitget Futures'


class bitget_futures(bitget):
    def __init__(self, config={}):
        super().__init__(config)
        self.options['defaultType'] = 'swap'
        self.options['defaultSubType'] = 'linear'
