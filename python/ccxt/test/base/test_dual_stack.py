import asyncio
import os
import socket
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

# ----------------------------------------------------------------------------
# hand-written python-only base test (not transpiled from ts/src/test/base)
# ----------------------------------------------------------------------------

import requests  # noqa: E402
from requests.adapters import HTTPAdapter  # noqa: E402

import ccxt as ccxt_sync  # noqa: E402
import ccxt.async_support as ccxt  # noqa: E402


def test_dual_stack_sync():
    # the sync (requests) path must not force an IPv4-only address family:
    # a default Session uses urllib3's socket.create_connection, which resolves
    # with AF_UNSPEC and tries addresses in getaddrinfo order (dual-stack)
    exchange = ccxt_sync.Exchange({
        'id': 'sampleexchange',
    })
    assert exchange.session is not None
    assert isinstance(exchange.session, requests.Session)
    # no custom adapters overriding the connection family
    for prefix, adapter in exchange.session.adapters.items():
        assert type(adapter) is HTTPAdapter
    exchange.session.close()


async def test_dual_stack():
    test_dual_stack_sync()
    exchange = ccxt.Exchange({
        'id': 'sampleexchange',
    })
    exchange.open()
    connector = exchange.tcp_connector
    assert connector is not None
    # AF_UNSPEC (0) → getaddrinfo returns both IPv4 and IPv6 addresses,
    # and the WS session inherits this connector via session.ws_connect
    assert connector.family == socket.AF_UNSPEC
    # RFC 8305 Happy Eyeballs (supported by aiohttp >= 3.9)
    if hasattr(connector, '_happy_eyeballs_delay'):
        assert connector._happy_eyeballs_delay == 0
    await exchange.close()
    return True


if __name__ == '__main__':
    asyncio.run(test_dual_stack())
    print('test_dual_stack passed')
