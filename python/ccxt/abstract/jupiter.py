from ccxt.base.types import Entry
_List = list[object]
_Dict = dict[str, object]


class ImplicitAPI:
    public_get_tokens_v2_tag = publicGetTokensV2Tag = Entry[_List]('tokens/v2/tag', 'public', 'GET', {'cost': 1})
    public_get_tokens_v2_search = publicGetTokensV2Search = Entry[_List]('tokens/v2/search', 'public', 'GET', {'cost': 1})
    public_get_price_v3 = publicGetPriceV3 = Entry[_Dict]('price/v3', 'public', 'GET', {'cost': 1})
    public_get_swap_v1_quote = publicGetSwapV1Quote = Entry[_Dict]('swap/v1/quote', 'public', 'GET', {'cost': 1})
    public_post_swap_v1_swap = publicPostSwapV1Swap = Entry[_Dict]('swap/v1/swap', 'public', 'POST', {'cost': 1})
