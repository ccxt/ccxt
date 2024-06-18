from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_market_symbol_thumb_trend = publicGetMarketSymbolThumbTrend = Entry('market/symbol-thumb-trend', 'public', 'GET', {'cost': 1})
    public_get_market_history = publicGetMarketHistory = Entry('market/history', 'public', 'GET', {'cost': 1})
    public_get_market_exchange_plate_full = publicGetMarketExchangePlateFull = Entry('market/exchange-plate-full', 'public', 'GET', {'cost': 1})
