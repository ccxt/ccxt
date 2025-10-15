from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_v1_currencies = publicGetApiV1Currencies = Entry('/api/v1/currencies', 'public', 'GET', {'cost': 1})
