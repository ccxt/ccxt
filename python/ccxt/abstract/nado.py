from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict, List

_List = List[PythonAny]
_Dict = Dict[str, PythonAny]

class ImplicitAPI:
    gateway_public_get_symbols = gatewayPublicGetSymbols = Entry[_List]('symbols', ['gateway', 'public'], 'GET', {'cost': 2})
    gateway_public_get_query = gatewayPublicGetQuery = Entry[_Dict]('query', ['gateway', 'public'], 'GET', {'cost': 1})
    gateway_public_get_edge_query = gatewayPublicGetEdgeQuery = Entry[_Dict]('edge/query', ['gateway', 'public'], 'GET', {'cost': 1})
    gateway_public_post_query = gatewayPublicPostQuery = Entry[_Dict]('query', ['gateway', 'public'], 'POST', {'cost': 1})
    gateway_private_post_execute = gatewayPrivatePostExecute = Entry[_Dict]('execute', ['gateway', 'private'], 'POST', {'cost': 1})
    gatewayv2_public_get_assets = gatewayV2PublicGetAssets = Entry[_List]('assets', ['gatewayV2', 'public'], 'GET', {'cost': 2})
    gatewayv2_public_get_pairs = gatewayV2PublicGetPairs = Entry[_List]('pairs', ['gatewayV2', 'public'], 'GET', {'cost': 1})
    gatewayv2_public_get_orderbook = gatewayV2PublicGetOrderbook = Entry[_Dict]('orderbook', ['gatewayV2', 'public'], 'GET', {'cost': 1})
    archive_post = archivePost = Entry[_Dict]('', 'archive', 'POST', {'cost': 1})
    archivev2_public_get_tickers = archiveV2PublicGetTickers = Entry[_Dict]('tickers', ['archiveV2', 'public'], 'GET', {'cost': 1})
    archivev2_public_get_contracts = archiveV2PublicGetContracts = Entry[_Dict]('contracts', ['archiveV2', 'public'], 'GET', {'cost': 1})
    archivev2_public_get_trades = archiveV2PublicGetTrades = Entry[_List]('trades', ['archiveV2', 'public'], 'GET', {'cost': 1})
    trigger_private_post_execute = triggerPrivatePostExecute = Entry[_Dict]('execute', ['trigger', 'private'], 'POST', {'cost': 1})
    trigger_private_post_query = triggerPrivatePostQuery = Entry[_Dict]('query', ['trigger', 'private'], 'POST', {'cost': 1})
