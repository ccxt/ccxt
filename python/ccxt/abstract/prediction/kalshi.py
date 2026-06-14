from ccxt.base.types import Entry


class ImplicitAPI:
    kalshi_public_get_events = kalshiPublicGetEvents = Entry('events', ['kalshi', 'public'], 'GET', {'cost': 1})
    kalshi_public_get_events_event_ticker = kalshiPublicGetEventsEventTicker = Entry('events/{event_ticker}', ['kalshi', 'public'], 'GET', {'cost': 1})
    kalshi_public_get_series = kalshiPublicGetSeries = Entry('series', ['kalshi', 'public'], 'GET', {'cost': 1})
    kalshi_public_get_series_series_ticker = kalshiPublicGetSeriesSeriesTicker = Entry('series/{series_ticker}', ['kalshi', 'public'], 'GET', {'cost': 1})
    kalshi_public_get_markets = kalshiPublicGetMarkets = Entry('markets', ['kalshi', 'public'], 'GET', {'cost': 1})
    kalshi_public_get_markets_ticker = kalshiPublicGetMarketsTicker = Entry('markets/{ticker}', ['kalshi', 'public'], 'GET', {'cost': 1})
    kalshi_public_get_markets_ticker_orderbook = kalshiPublicGetMarketsTickerOrderbook = Entry('markets/{ticker}/orderbook', ['kalshi', 'public'], 'GET', {'cost': 1})
    kalshi_public_get_markets_trades = kalshiPublicGetMarketsTrades = Entry('markets/trades', ['kalshi', 'public'], 'GET', {'cost': 1})
    kalshi_public_get_series_series_ticker_markets_ticker_candlesticks = kalshiPublicGetSeriesSeriesTickerMarketsTickerCandlesticks = Entry('series/{series_ticker}/markets/{ticker}/candlesticks', ['kalshi', 'public'], 'GET', {'cost': 1})
    kalshi_private_get_portfolio_balance = kalshiPrivateGetPortfolioBalance = Entry('portfolio/balance', ['kalshi', 'private'], 'GET', {'cost': 1})
    kalshi_private_get_portfolio_orders = kalshiPrivateGetPortfolioOrders = Entry('portfolio/orders', ['kalshi', 'private'], 'GET', {'cost': 1})
    kalshi_private_get_portfolio_orders_order_id = kalshiPrivateGetPortfolioOrdersOrderId = Entry('portfolio/orders/{order_id}', ['kalshi', 'private'], 'GET', {'cost': 1})
    kalshi_private_get_portfolio_positions = kalshiPrivateGetPortfolioPositions = Entry('portfolio/positions', ['kalshi', 'private'], 'GET', {'cost': 1})
    kalshi_private_get_portfolio_fills = kalshiPrivateGetPortfolioFills = Entry('portfolio/fills', ['kalshi', 'private'], 'GET', {'cost': 1})
    kalshi_private_post_portfolio_orders = kalshiPrivatePostPortfolioOrders = Entry('portfolio/orders', ['kalshi', 'private'], 'POST', {'cost': 1})
    kalshi_private_delete_portfolio_orders_order_id = kalshiPrivateDeletePortfolioOrdersOrderId = Entry('portfolio/orders/{order_id}', ['kalshi', 'private'], 'DELETE', {'cost': 1})
    kalshi_private_delete_portfolio_orders = kalshiPrivateDeletePortfolioOrders = Entry('portfolio/orders', ['kalshi', 'private'], 'DELETE', {'cost': 1})
