from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_currencies = publicGetApiCurrencies = Entry('api/currencies', 'public', 'GET', {'cost': 1})
