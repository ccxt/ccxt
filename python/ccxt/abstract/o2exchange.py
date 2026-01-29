from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_v1_markets = publicGetV1Markets = Entry('v1/markets', 'public', 'GET', {'cost': 1})
    public_get_v1_markets_summary = publicGetV1MarketsSummary = Entry('v1/markets/summary', 'public', 'GET', {'cost': 1})
    public_get_v1_markets_ticker = publicGetV1MarketsTicker = Entry('v1/markets/ticker', 'public', 'GET', {'cost': 1})
    public_get_v1_depth = publicGetV1Depth = Entry('v1/depth', 'public', 'GET', {'cost': 1})
    public_get_v1_trades = publicGetV1Trades = Entry('v1/trades', 'public', 'GET', {'cost': 1})
    public_get_v1_bars = publicGetV1Bars = Entry('v1/bars', 'public', 'GET', {'cost': 1})
    public_get_health = publicGetHealth = Entry('health', 'public', 'GET', {'cost': 1})
    private_get_v1_accounts = privateGetV1Accounts = Entry('v1/accounts', 'private', 'GET', {'cost': 1})
    private_get_v1_balance = privateGetV1Balance = Entry('v1/balance', 'private', 'GET', {'cost': 1})
    private_get_v1_orders = privateGetV1Orders = Entry('v1/orders', 'private', 'GET', {'cost': 1})
    private_post_v1_accounts = privatePostV1Accounts = Entry('v1/accounts', 'private', 'POST', {'cost': 1})
    private_post_v1_session_call = privatePostV1SessionCall = Entry('v1/session/call', 'private', 'POST', {'cost': 1})
    private_put_v1_session = privatePutV1Session = Entry('v1/session', 'private', 'PUT', {'cost': 1})
