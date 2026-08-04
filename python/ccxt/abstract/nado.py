from ccxt.base.types import Entry


class ImplicitAPI:
    gateway_public_get_symbols = gatewayPublicGetSymbols = Entry('symbols', ['gateway', 'public'], 'GET', {'cost': 2})
    gateway_public_get_query = gatewayPublicGetQuery = Entry('query', ['gateway', 'public'], 'GET', {'cost': 1})
    gateway_public_get_edge_query = gatewayPublicGetEdgeQuery = Entry('edge/query', ['gateway', 'public'], 'GET', {'cost': 1})
    gateway_public_post_query = gatewayPublicPostQuery = Entry('query', ['gateway', 'public'], 'POST', {'cost': 1})
    gateway_private_post_execute = gatewayPrivatePostExecute = Entry('execute', ['gateway', 'private'], 'POST', {'cost': 1})
    gatewayv2_public_get_assets = gatewayV2PublicGetAssets = Entry('assets', ['gatewayV2', 'public'], 'GET', {'cost': 2})
    gatewayv2_public_get_pairs = gatewayV2PublicGetPairs = Entry('pairs', ['gatewayV2', 'public'], 'GET', {'cost': 1})
    gatewayv2_public_get_orderbook = gatewayV2PublicGetOrderbook = Entry('orderbook', ['gatewayV2', 'public'], 'GET', {'cost': 1})
    archive_post = archivePost = Entry('', 'archive', 'POST', {'cost': 1})
    archivev2_public_get_tickers = archiveV2PublicGetTickers = Entry('tickers', ['archiveV2', 'public'], 'GET', {'cost': 1})
    archivev2_public_get_contracts = archiveV2PublicGetContracts = Entry('contracts', ['archiveV2', 'public'], 'GET', {'cost': 1})
    archivev2_public_get_trades = archiveV2PublicGetTrades = Entry('trades', ['archiveV2', 'public'], 'GET', {'cost': 1})
    trigger_private_post_execute = triggerPrivatePostExecute = Entry('execute', ['trigger', 'private'], 'POST', {'cost': 1})
    trigger_private_post_query = triggerPrivatePostQuery = Entry('query', ['trigger', 'private'], 'POST', {'cost': 1})
