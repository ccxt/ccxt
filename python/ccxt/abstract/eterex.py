from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_ad_rates = publicGetAdRates = Entry('ad/rates', 'public', 'GET', {'cost': 1})
