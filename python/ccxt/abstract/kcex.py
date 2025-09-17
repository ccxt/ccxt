from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_market_2_spot_market_v2_web_symbols = publicGetMarket2SpotMarketV2WebSymbols = Entry('market-2/spot/market/v2/web/symbols', 'public', 'GET', {'cost': 1})
    public_get_market_2_spot_market_v2_web_tickers = publicGetMarket2SpotMarketV2WebTickers = Entry('market-2/spot/market/v2/web/tickers', 'public', 'GET', {'cost': 1})
    public_get_market_2_spot_market_v2_web_symbol_ticker = publicGetMarket2SpotMarketV2WebSymbolTicker = Entry('market-2/spot/market/v2/web/symbol/ticker', 'public', 'GET', {'cost': 1})
