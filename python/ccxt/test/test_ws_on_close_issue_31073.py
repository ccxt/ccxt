"""
Regression test for Issue #31073:
Verify that a server CLOSE frame does not run Client.on_close twice,
and that Exchange.on_close does not unregister a replacement client.
"""

import asyncio
import pytest
from unittest.mock import MagicMock
from aiohttp import WSMsgType

import ccxt
import ccxt.pro as ccxtpro
from ccxt.async_support.base.ws.client import Client


def test_client_on_close_idempotency():
    mock_exchange = MagicMock()
    mock_exchange.milliseconds.return_value = 100000
    mock_exchange.iso8601.return_value = "2026-11-11T00:00:00Z"

    client = Client("ws://test:1234", mock_exchange, None)
    closed_codes = []

    def spy_callback(c, code):
        closed_codes.append(code)

    client.on_close_callback = spy_callback

    # First on_close call with CLOSE frame code (e.g. 1001)
    client.on_close(1001)
    assert closed_codes == [1001]

    # Second on_close call (e.g. from receive_loop 1006) should be a no-op
    client.on_close(1006)
    assert closed_codes == [1001], "Client.on_close must be idempotent"


def test_exchange_on_close_preserves_replacement_client():
    exchange = ccxtpro.Exchange({"enableRateLimit": False})
    url = "ws://mock-exchange-endpoint:9999"

    first_client = exchange.client(url)
    assert exchange.clients[url] is first_client

    # Simulate replacement client registered after first client rejected
    replacement_client = Client(url, exchange, None)
    exchange.clients[url] = replacement_client

    # First client triggers on_close
    exchange.on_close(first_client, error=None)

    # Replacement client must NOT be unregistered
    assert exchange.clients.get(url) is replacement_client
    assert exchange.client(url) is replacement_client


if __name__ == "__main__":
    test_client_on_close_idempotency()
    test_exchange_on_close_preserves_replacement_client()
    print("ALL TESTS PASSED EXIT CODE 0")
