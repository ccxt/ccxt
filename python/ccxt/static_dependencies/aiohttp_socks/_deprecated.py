import warnings

from .python_socks import (
    ProxyError,
    ProxyConnectionError,
    ProxyType
)

from .connector import ProxyConnector


class SocksVer(object):
    SOCKS4 = 1
    SOCKS5 = 2


def _warn_about_connector():
    warnings.warn('SocksConnector is deprecated. '
                  'Use ProxyConnector instead.', DeprecationWarning,
                  stacklevel=3)


class SocksConnector(ProxyConnector):
    def __init__(self, socks_ver=SocksVer.SOCKS5, **kwargs):
        _warn_about_connector()  # noqa

        if 'proxy_type' in kwargs:  # from_url
            super().__init__(**kwargs)
        else:
            super().__init__(proxy_type=ProxyType(socks_ver), **kwargs)

    @classmethod
    def from_url(cls, url, **kwargs):
        _warn_about_connector()  # noqa
        return super().from_url(url, **kwargs)


SocksError = ProxyError
SocksConnectionError = ProxyConnectionError
