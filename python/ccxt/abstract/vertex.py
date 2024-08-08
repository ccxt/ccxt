from ccxt.base.types import Entry


class ImplicitAPI:
    v1_archive_post = v1ArchivePost = Entry('', ['v1', 'archive'], 'POST', {'cost': 1})
    v1_gateway_get_query = v1GatewayGetQuery = Entry('query', ['v1', 'gateway'], 'GET', {'cost': 1})
    v1_gateway_get_symbols = v1GatewayGetSymbols = Entry('symbols', ['v1', 'gateway'], 'GET', {'cost': 1})
    v1_gateway_get_time = v1GatewayGetTime = Entry('time', ['v1', 'gateway'], 'GET', {'cost': 1})
    v1_gateway_post_query = v1GatewayPostQuery = Entry('query', ['v1', 'gateway'], 'POST', {'cost': 1})
    v1_gateway_post_execute = v1GatewayPostExecute = Entry('execute', ['v1', 'gateway'], 'POST', {'cost': 1})
    v1_trigger_post_execute = v1TriggerPostExecute = Entry('execute', ['v1', 'trigger'], 'POST', {'cost': 1})
    v1_trigger_post_query = v1TriggerPostQuery = Entry('query', ['v1', 'trigger'], 'POST', {'cost': 1})
    v2_archive_get_tickers = v2ArchiveGetTickers = Entry('tickers', ['v2', 'archive'], 'GET', {'cost': 1})
    v2_archive_get_contracts = v2ArchiveGetContracts = Entry('contracts', ['v2', 'archive'], 'GET', {'cost': 1})
    v2_archive_get_trades = v2ArchiveGetTrades = Entry('trades', ['v2', 'archive'], 'GET', {'cost': 1})
    v2_archive_get_vrtx = v2ArchiveGetVrtx = Entry('vrtx', ['v2', 'archive'], 'GET', {'cost': 1})
    v2_gateway_get_assets = v2GatewayGetAssets = Entry('assets', ['v2', 'gateway'], 'GET', {'cost': 0.6667})
    v2_gateway_get_pairs = v2GatewayGetPairs = Entry('pairs', ['v2', 'gateway'], 'GET', {'cost': 1})
    v2_gateway_get_orderbook = v2GatewayGetOrderbook = Entry('orderbook', ['v2', 'gateway'], 'GET', {'cost': 1})
