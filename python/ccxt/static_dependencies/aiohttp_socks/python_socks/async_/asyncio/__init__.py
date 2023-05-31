from ..._types import ProxyType
from ..._proxy_factory import ProxyFactory
from ._proxy import (
    AsyncioProxy,
    Socks5Proxy,
    Socks4Proxy,
    HttpProxy
)


class Proxy(ProxyFactory[AsyncioProxy]):
    types = {
        ProxyType.SOCKS4: Socks4Proxy,
        ProxyType.SOCKS5: Socks5Proxy,
        ProxyType.HTTP: HttpProxy,
    }


__all__ = ('Proxy',)
