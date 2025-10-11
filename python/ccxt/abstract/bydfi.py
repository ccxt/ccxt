from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_spot_product_list = publicGetApiSpotProductList = Entry('api/spot/product/list', 'public', 'GET', {'cost': 1})
    public_get_api_tv_tradingview_history = publicGetApiTvTradingViewHistory = Entry('api/tv/tradingView/history', 'public', 'GET', {'cost': 1})
    quote_get_tickers = quoteGetTickers = Entry('tickers', 'quote', 'GET', {'cost': 1})
    quote_get_mkpai_depth_v2 = quoteGetMkpaiDepthV2 = Entry('mkpai/depth-v2', 'quote', 'GET', {'cost': 1})
