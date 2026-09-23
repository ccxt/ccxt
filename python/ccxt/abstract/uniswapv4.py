from ccxt.base.types import Entry
_Dict = dict[str, object]


class ImplicitAPI:
    subgraph_post_graphql = subgraphPostGraphql = Entry[_Dict]('graphql', 'subgraph', 'POST', {'cost': 1})
    trading_post_check_approval = tradingPostCheckApproval = Entry[_Dict]('check_approval', 'trading', 'POST', {'cost': 1})
    trading_post_quote = tradingPostQuote = Entry[_Dict]('quote', 'trading', 'POST', {'cost': 1})
    trading_post_swap = tradingPostSwap = Entry[_Dict]('swap', 'trading', 'POST', {'cost': 1})
