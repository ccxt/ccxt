from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_v1_market = publicGetV1Market = Entry('v1/market', 'public', 'GET', {'cost': 1})
    public_get_v2_udf_real_history = publicGetV2UdfRealHistory = Entry('v2/udf/real/history', 'public', 'GET', {'cost': 1})
    public_get_v1_market_id_order = publicGetV1MarketIdOrder = Entry('v1/market/{id}/order', 'public', 'GET', {'cost': 1})
