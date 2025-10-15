from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_manager_coins_data = publicGetManagerCoinsData = Entry('manager/coins/data', 'public', 'GET', {'cost': 1})
