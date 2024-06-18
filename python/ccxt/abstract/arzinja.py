from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_prices = publicGetPrices = Entry('prices', 'public', 'GET', {'cost': 1})
