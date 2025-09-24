from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_spot_v1_common_coin_pair_list = publicGetApiSpotV1CommonCoinPairList = Entry('api/spot/v1/common/coin_pair/list/', 'public', 'GET', {'cost': 1})
    public_get_web_api_v1_common_tickers = publicGetWebApiV1CommonTickers = Entry('web/api/v1/common/tickers/', 'public', 'GET', {'cost': 1})
