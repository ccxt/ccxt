from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_v1_markets = publicGetV1Markets = Entry('v1/markets', 'public', 'GET', {'cost': 1})
    public_get_v1_currencies_stats = publicGetV1CurrenciesStats = Entry('v1/currencies/stats', 'public', 'GET', {'cost': 1})
    public_get_v1_depth = publicGetV1Depth = Entry('v1/depth', 'public', 'GET', {'cost': 1})
    public_get_v1_udf_history = publicGetV1UdfHistory = Entry('v1/udf/history', 'public', 'GET', {'cost': 1})
