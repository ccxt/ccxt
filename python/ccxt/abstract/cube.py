from ccxt.base.types import Entry

class ImplicitAPI:
    # Public
    public_get_tickers_snapshot = publicGetTickersSnapshot = Entry('tickers/snapshot', 'public', 'GET', {})
    public_get_parsed_tickers = publicGetParsedTickers = Entry('parsed/tickers', 'public', 'GET', {})
    public_get_parsed_book_snapshot = publicGetParsedBookSnapshot = Entry('parsed/book/{market_symbol}/snapshot', 'public', 'GET', {})
    public_get_parsed_book_recent_trades = publicGetParsedBookRecentTrades = Entry('parsed/book/{market_symbol}/recent-trades', 'public', 'GET', {})
    public_get_book_snapshot = publicGetBookSnapshot = Entry('book/{market_id}/snapshot', 'public', 'GET', {})
    public_get_book_recent_trades = publicGetBookRecentTrades = Entry('book/{market_id}/recent-trades', 'public', 'GET', {})

    public_get_markets = publicGetMarkets = Entry('markets', 'public2', 'GET', {})
    public_get_history_klines = publicGetHistoryKlines = Entry('history/klines', 'public2', 'GET', {})
    # Private
    auth_get_markets = authGetMarkets = Entry('markets', 'private', 'GET', {})
    auth_get_users_check = authGetUsersCheck = Entry('users/check', 'private', 'GET', {})
    auth_post_users_apikeys = authPostUsersApikeys = Entry('users/apikeys', 'private', 'POST', {})
    auth_delete_users_apikeys = authDeleteUsersApikeys = Entry('users/apikeys/{api_key}', 'private', 'DELETE', {})
    auth_get_users_subaccounts = authGetUsersSubaccounts = Entry('users/subaccounts', 'private', 'GET', {})
    auth_post_users_subaccounts = authPostUsersSubaccounts = Entry('users/subaccounts', 'private', 'POST', {})
    auth_get_users_subaccount = authGetUsersSubaccount = Entry('users/subaccount/{subaccount_id}', 'private', 'GET', {})
    auth_patch_users_subaccount = authPatchUsersSubaccount = Entry('users/subaccount/{subaccount_id}', 'private', 'PATCH', {})
    auth_get_users_subaccount_positions = authGetUsersSubaccountPositions = Entry('users/subaccount/{subaccount_id}/positions', 'private', 'GET', {})
    auth_get_users_subaccount_transfers = authGetUsersSubaccountTransfers = Entry('users/subaccount/{subaccount_id}/transfers', 'private', 'GET', {})
    auth_get_users_subaccount_deposits = authGetUsersSubaccountDeposits = Entry('users/subaccount/{subaccount_id}/deposits', 'private', 'GET', {})
    auth_get_users_subaccount_withdrawals = authGetUsersSubaccountWithdrawals = Entry('users/subaccount/{subaccount_id}/withdrawals', 'private', 'GET', {})
    auth_get_users_subaccount_orders = authGetUsersSubaccountOrders = Entry('users/subaccount/{subaccount_id}/orders', 'private', 'GET', {})
    auth_get_users_subaccount_fills = authGetUsersSubaccountFills = Entry('users/subaccount/{subaccount_id}/fills', 'private', 'GET', {})
    auth_post_users_fee_estimates = authPostUsersFeeEstimates = Entry('users/fee-estimates', 'private', 'POST', {})
    auth_get_users_address = authGetUsersAddress = Entry('users/address', 'private', 'GET', {})
    auth_get_users_address_settings = authGetUsersAddressSettings = Entry('users/address/settings', 'private', 'GET', {})
    auth_post_users_withdraw = authPostUsersWithdraw = Entry('users/withdraw', 'private', 'POST', {})