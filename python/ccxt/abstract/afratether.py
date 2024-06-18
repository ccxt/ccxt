from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_v1_0_price = publicGetApiV10Price = Entry('api/v1.0/price', 'public', 'GET', {'cost': 1})
    public_get_token = publicGetToken = Entry('token', 'public', 'GET', {'cost': 1})
