__title__ = 'aiohttp-socks'
__version__ = '0.8.0'

from .python_socks import (
    ProxyError,
    ProxyTimeoutError,
    ProxyConnectionError,
    ProxyType
)

from .connector import (
    ProxyConnector,
    ChainProxyConnector,
    ProxyInfo
)
from .utils import open_connection, create_connection

from ._deprecated import (
    SocksVer,
    SocksConnector,
    SocksConnectionError,
    SocksError
)

__all__ = (
    '__title__',
    '__version__',
    'ProxyConnector',
    'ChainProxyConnector',
    'ProxyInfo',
    'ProxyType',
    'ProxyError',
    'ProxyConnectionError',
    'ProxyTimeoutError',
    'open_connection',
    'create_connection',

    'SocksVer',
    'SocksConnector',
    'SocksError',
    'SocksConnectionError',
)
