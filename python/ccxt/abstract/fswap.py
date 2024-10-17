from ccxt.base.types import Entry


class ImplicitAPI:
    fswappublic_get_info = fswapPublicGetInfo = Entry('info', 'fswapPublic', 'GET', {'cost': 1})
    fswappublic_get_assets = fswapPublicGetAssets = Entry('assets', 'fswapPublic', 'GET', {'cost': 1})
    fswappublic_get_pairs = fswapPublicGetPairs = Entry('pairs', 'fswapPublic', 'GET', {'cost': 1})
    fswappublic_get_cmc_pairs = fswapPublicGetCmcPairs = Entry('cmc/pairs', 'fswapPublic', 'GET', {'cost': 1})
    fswappublic_get_stats_markets = fswapPublicGetStatsMarkets = Entry('stats/markets', 'fswapPublic', 'GET', {'cost': 1})
    fswappublic_get_stats_markets_base_quote = fswapPublicGetStatsMarketsBaseQuote = Entry('stats/markets/{base}/{quote}', 'fswapPublic', 'GET', {'cost': 1})
    fswappublic_get_stats_markets_base_quote_kline_v2 = fswapPublicGetStatsMarketsBaseQuoteKlineV2 = Entry('stats/markets/{base}/{quote}/kline/v2', 'fswapPublic', 'GET', {'cost': 1})
    fswappublic_get_transactions_base_quote = fswapPublicGetTransactionsBaseQuote = Entry('transactions/{base}/{quote}', 'fswapPublic', 'GET', {'cost': 1})
    mixinpublic_get_network_asset_asset_id = mixinPublicGetNetworkAssetAssetId = Entry('network/asset/{asset_id}', 'mixinPublic', 'GET', {'cost': 1})
    fswapprivate_get_orders_follow_id = fswapPrivateGetOrdersFollowId = Entry('orders/{follow_id}', 'fswapPrivate', 'GET', {'cost': 1})
    fswapprivate_get_transactions_base_quote_mine = fswapPrivateGetTransactionsBaseQuoteMine = Entry('transactions/{base}/{quote}/mine', 'fswapPrivate', 'GET', {'cost': 1})
    fswapprivate_post_actions = fswapPrivatePostActions = Entry('actions', 'fswapPrivate', 'POST', {'cost': 1})
    mixinprivate_get_safe_snapshots = mixinPrivateGetSafeSnapshots = Entry('safe/snapshots', 'mixinPrivate', 'GET', {'cost': 1})
    mixinprivate_get_safe_deposit_entries = mixinPrivateGetSafeDepositEntries = Entry('safe/deposit/entries', 'mixinPrivate', 'GET', {'cost': 1})
    mixinprivate_post_safe_keys = mixinPrivatePostSafeKeys = Entry('safe/keys', 'mixinPrivate', 'POST', {'cost': 1})
    mixinprivate_post_safe_transaction_requests = mixinPrivatePostSafeTransactionRequests = Entry('safe/transaction/requests', 'mixinPrivate', 'POST', {'cost': 1})
    mixinprivate_post_safe_transactions = mixinPrivatePostSafeTransactions = Entry('safe/transactions', 'mixinPrivate', 'POST', {'cost': 1})
    mixinprivate_post_safe_deposit_entries = mixinPrivatePostSafeDepositEntries = Entry('safe/deposit/entries', 'mixinPrivate', 'POST', {'cost': 1})
    ccxtproxy_post_4swap_preorder = ccxtProxyPost4swapPreorder = Entry('4swap/preorder', 'ccxtProxy', 'POST', {'cost': 1})
    ccxtproxy_post_mixin_encodetx = ccxtProxyPostMixinEncodetx = Entry('mixin/encodetx', 'ccxtProxy', 'POST', {'cost': 1})
