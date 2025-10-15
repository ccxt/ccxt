from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_v1_tokens_public = publicGetApiV1TokensPublic = Entry('api/v1/tokens/public', 'public', 'GET', {'cost': 1})
