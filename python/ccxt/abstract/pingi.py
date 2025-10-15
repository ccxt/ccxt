from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_market_prices = publicGetMarketPrices = Entry('market/prices', 'public', 'GET', {'cost': 1})
    public_get_udf_history = publicGetUdfHistory = Entry('udf/history', 'public', 'GET', {'cost': 1})
