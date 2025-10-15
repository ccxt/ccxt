from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_market_symbols = publicGetMarketSymbols = Entry('market/symbols', 'public', 'GET', {'cost': 1})
    public_get_market_rollingprice = publicGetMarketRollingprice = Entry('market/rollingprice', 'public', 'GET', {'cost': 1})
    public_get_market_candle = publicGetMarketCandle = Entry('market/candle', 'public', 'GET', {'cost': 1})
    public_get_market_order = publicGetMarketOrder = Entry('market/order', 'public', 'GET', {'cost': 1})
