from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_quote_v1_ticker_24hr = publicGetQuoteV1Ticker24hr = Entry('quote/v1/ticker/24hr', 'public', 'GET', {'cost': 1})
    public_get_quote_v1_ticker_24hr = publicGetQuoteV1Ticker24hr = Entry('/quote/v1/ticker/24hr', 'public', 'GET', {'cost': 1})
    public_get_quote_v1_ticker_depth = publicGetQuoteV1TickerDepth = Entry('/quote/v1/ticker/depth', 'public', 'GET', {'cost': 1})
