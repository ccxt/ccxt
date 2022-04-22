import ccxt


# make sure your version is the latest
print('CCXT Version:', ccxt.__version__)


def get_max_leverage(self, market, leverage, positionSize, orderType, entryPrice=None, bid=None, ask=None):
    """
    Equation taken from https://support.aax.com/en/articles/5295653-what-is-margin
    :param dict market: CCXT market
    :param float leverage:
    :param float positionSize: The number of contracts
    :param str orderType: 'limit' or 'market'
    :param {float|None} entryPrice: The average entry price for the position, required when orderType == 'limit', default is None
    :param {float|None} bid: The highest buying price on the order book, required when orderType == 'market', default is None
    :param {float|None} ask: The lowest selling price on the order book, required when orderType == 'market', default is None
    :returns: The maximum leverage available for the market for the given position size
    """
    isLimit = orderType == 'limit'
    if isLimit and entryPrice is None:  # limit order
        raise Exception('getMaxLeverage argument entryPrice required when orderType == limit')
    elif not isLimit and (bid is None or ask is None):  # market order
        raise Exception('getMaxLeverage arguments bid and ask required when orderType == market')
    info = market['info']
    multiplier = float(info['multiplier'])
    price = entryPrice if isLimit else ((bid + ask) / 2)
    price = price if market['inverse'] else (price * multiplier)
    return positionSize / price / leverage


def get_maintenance_margin_rate(self, market, leverage, positionSize, entryPrice, takerOrMaker='taker'):
    """
    Equation taken from https://support.aax.com/en/articles/5295653-what-is-margin
    :param dict market: CCXT market
    :param float leverage:
    :param float positionSize: The number of contracts
    :param float entryPrice: The average entry price for the position
    :param str takerOrMaker: Not required market is inverse, default 'taker'
    :returns: The maintenanceMargin rate as a percentage for the market with the given position size
    """
    info = market['info']
    multiplier = float(info['multiplier'])
    if market['inverse']:
        return positionSize / entryPrice / leverage
    else:
        price = (entryPrice * multiplier)
        positionValue = price * positionSize
        commissionFees = positionValue * market[takerOrMaker]
        return(positionSize / price / leverage) + commissionFees


def get_margin_when_adjusting_leverage(self, market, leverage, positionSize, entryPrice, takerOrMaker, unrealizedPnl):
    """
    Equation taken from https://support.aax.com/en/articles/5295653-what-is-margin
    :param dict market: CCXT market
    :param float leverage:
    :param float positionSize: The number of contracts
    :param float entryPrice: The average entry price for the position
    :param str takerOrMaker: default 'taker'
    :param float unrealizedPnl: Unrealized profit/loss for the position
    :returns: The maintenanceMargin rate as a percentage for the market with the given position size
    """
    info = market['info']
    multiplier = float(info['multiplier'])
    price = entryPrice if market['inverse'] else (entryPrice * multiplier)
    positionValue = price * positionSize
    commissionFees = positionValue * market[takerOrMaker]
    if market['inverse']:
        return(positionValue * ((1 / leverage) + commissionFees)) - min(0, unrealizedPnl)
    else:
        return(positionValue * ((1 / leverage) + commissionFees)) - min(0, unrealizedPnl)


def main_function(self):

    exchange = ccxt.aax({
        'enableRateLimit': True,  # https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_API_SECRET',
    })

    exchange.load_markets()

    leverage = 10
    positionSize = 10
    bid = 1.0000
    ask = 1.0001
    unrealizedPnl = 0.1

    # Linear markets
    symbol = 'ADA/USDT:USDT'
    market = exchange.market(symbol)

    maxLeverage = self.get_max_leverage(market, leverage, positionSize, 'limit', bid)  # Max leverage for linear limit position, entryPrice=bid
    maintenanceMarginRate = self.get_maintenance_margin_rate(market, leverage, positionSize, bid, 'maker')  # Maintenance margin rate for linear maker position, entryPrice=bid
    marginWhenAdjustingLeverage = self.get_margin_when_adjusting_leverage(market, leverage, positionSize, bid, 'maker', unrealizedPnl)  # Margin when adjusting leverage for linear maker position, entryPrice=bid
    print(maxLeverage, maintenanceMarginRate, marginWhenAdjustingLeverage)

    maxLeverage = self.get_max_leverage(market, leverage, positionSize, 'market', None, bid, ask)  # Max leverage for linear market position
    maintenanceMarginRate = self.get_maintenance_margin_rate(market, leverage, positionSize, ask, 'taker')  # Maintenance margin rate for linear taker position, entryPrice=ask
    marginWhenAdjustingLeverage = self.get_margin_when_adjusting_leverage(market, leverage, positionSize, ask, 'taker', unrealizedPnl)  # Margin when adjusting leverage for linear taker position, entryPrice=ask
    print(maxLeverage, maintenanceMarginRate, marginWhenAdjustingLeverage)

    # Inverse markets
    symbol = 'BTC/USD:BTC'
    market = exchange.market(symbol)

    maxLeverage = self.get_max_leverage(market, leverage, positionSize, 'limit', bid)  # Max leverage for linear limit position, entryPrice=bid
    maintenanceMarginRate = self.get_maintenance_margin_rate(market, leverage, positionSize, bid, 'maker')  # Maintenance margin rate for linear maker position, entryPrice=bid
    marginWhenAdjustingLeverage = self.get_margin_when_adjusting_leverage(market, leverage, positionSize, bid, 'maker', unrealizedPnl)  # Margin when adjusting leverage for linear maker position, entryPrice=bid
    print(maxLeverage, maintenanceMarginRate, marginWhenAdjustingLeverage)

    maxLeverage = self.get_max_leverage(market, leverage, positionSize, 'market', None, bid, ask)  # Max leverage for linear market position
    maintenanceMarginRate = self.get_maintenance_margin_rate(market, leverage, positionSize, ask, 'taker')  # Maintenance margin rate for linear taker position, entryPrice=ask
    marginWhenAdjustingLeverage = self.get_margin_when_adjusting_leverage(market, leverage, positionSize, ask, 'taker', unrealizedPnl)  # Margin when adjusting leverage for linear taker position, entryPrice=ask
    print(maxLeverage, maintenanceMarginRate, marginWhenAdjustingLeverage)
