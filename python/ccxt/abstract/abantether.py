from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_management_all_coins = publicGetManagementAllCoins = Entry('management/all-coins/', 'public', 'GET', {'cost': 1})
