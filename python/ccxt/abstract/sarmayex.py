from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_v1_public_currencies = publicGetApiV1PublicCurrencies = Entry('api/v1/public/currencies', 'public', 'GET', {'cost': 1})
