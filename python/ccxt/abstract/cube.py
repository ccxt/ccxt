from ccxt.base.types import Entry

class Entry:
    def __init__(self, endpoint, api, method, params):
        self.endpoint = endpoint
        self.api = api
        self.method = method
        self.params = params


class ImplicitAPI:
    # Public endpoints
    public_get_markets = Entry('markets', 'private', 'GET', {})
    public_get_history_klines = Entry('history/klines', 'public', 'GET', {})
    public_get_tickers_snapshot = Entry('tickers/snapshot', 'public', 'GET', {})
    public_get_parsed_tickers = Entry('parsed/tickers', 'public', 'GET', {})
    public_get_parsed_book_snapshot = Entry('parsed/book/{market_symbol}/snapshot', 'public', 'GET', {})
    public_get_parsed_book_recent_trades = Entry('parsed/book/{market_symbol}/recent-trades', 'public', 'GET', {})
    public_get_book_snapshot = Entry('book/{market_id}/snapshot', 'public', 'GET', {})
    public_get_book_recent_trades = Entry('book/{market_id}/recent-trades', 'public', 'GET', {})
    # Authenticated endpoints
    auth_get_markets = Entry('markets', 'private', 'GET', {})
    auth_get_users_check = Entry('users/check', 'private', 'GET', {})
    auth_post_users_apikeys = Entry('users/apikeys', 'private', 'POST', {})
    auth_delete_users_apikeys = Entry('users/apikeys/{api_key}', 'private', 'DELETE', {})
    auth_get_users_subaccounts = Entry('users/subaccounts', 'private', 'GET', {})
    auth_post_users_subaccounts = Entry('users/subaccounts', 'private', 'POST', {})
    auth_get_users_subaccount = Entry('users/subaccount/{subaccount_id}', 'private', 'GET', {})
    auth_patch_users_subaccount = Entry('users/subaccount/{subaccount_id}', 'private', 'PATCH', {})
    auth_get_users_subaccount_positions = Entry('users/subaccount/{subaccount_id}/positions', 'private', 'GET', {})
    auth_get_users_subaccount_transfers = Entry('users/subaccount/{subaccount_id}/transfers', 'private', 'GET', {})
    auth_get_users_subaccount_deposits = Entry('users/subaccount/{subaccount_id}/deposits', 'private', 'GET', {})
    auth_get_users_subaccount_withdrawals = Entry('users/subaccount/{subaccount_id}/withdrawals', 'private', 'GET', {})
    auth_get_users_subaccount_orders = Entry('users/subaccount/{subaccount_id}/orders', 'private', 'GET', {})
    auth_get_users_subaccount_fills = Entry('users/subaccount/{subaccount_id}/fills', 'private', 'GET', {})
    auth_post_users_fee_estimates = Entry('users/fee-estimates', 'private', 'POST', {})
    auth_get_users_address = Entry('users/address', 'private', 'GET', {})
    auth_get_users_address_settings = Entry('users/address/settings', 'private', 'GET', {})
    auth_post_users_withdraw = Entry('users/withdraw', 'private', 'POST', {})


