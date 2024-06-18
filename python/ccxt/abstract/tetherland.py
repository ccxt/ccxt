from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_v5_currencies = publicGetApiV5Currencies = Entry('api/v5/currencies', 'public', 'GET', {'cost': 1})
