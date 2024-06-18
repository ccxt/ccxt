from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_v1_mkt_markets = publicGetV1MktMarkets = Entry('v1/mkt/markets/', 'public', 'GET', {'cost': 1})
    public_get_v2_mth_actives = publicGetV2MthActives = Entry('v2/mth/actives/', 'public', 'GET', {'cost': 1})
    public_get_v1_mkt_tv_get_bars = publicGetV1MktTvGetBars = Entry('v1/mkt/tv/get_bars/', 'public', 'GET', {'cost': 1})
