from ccxt.base.types import Entry


class ImplicitAPI:
    private_get_v1_listing_pairs = privateGetV1ListingPairs = Entry('v1/listing/pairs', 'private', 'GET', {'cost': 1})
    private_get_v1_listing_tokens = privateGetV1ListingTokens = Entry('v1/listing/tokens', 'private', 'GET', {'cost': 1})
    private_get_v1_market_pair = privateGetV1MarketPair = Entry('v1/market/pair', 'private', 'GET', {'cost': 1})
    private_get_v1_market_klines = privateGetV1MarketKlines = Entry('v1/market/klines', 'private', 'GET', {'cost': 1})
    private_post_v1_quote_indicative = privatePostV1QuoteIndicative = Entry('v1/quote/indicative', 'private', 'POST', {'cost': 1})
    private_post_v1_quote_firm = privatePostV1QuoteFirm = Entry('v1/quote/firm', 'private', 'POST', {'cost': 1})
