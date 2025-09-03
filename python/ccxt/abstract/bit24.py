from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_pro_v3_markets = publicGetProV3Markets = Entry('pro/v3/markets', 'public', 'GET', {'cost': 1})
