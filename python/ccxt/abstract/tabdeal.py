from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_plots_market_information = publicGetPlotsMarketInformation = Entry('plots/market_information', 'public', 'GET', {'cost': 1})
    public_get_r_api_v1_depth = publicGetRApiV1Depth = Entry('r/api/v1/depth', 'public', 'GET', {'cost': 1})
    public_get_r_plots_history = publicGetRPlotsHistory = Entry('r/plots/history/', 'public', 'GET', {'cost': 1})
