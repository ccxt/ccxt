"""
JSON-RPC client test.
"""

import json

import pytest

from starkware.python.json_rpc.client import JsonRpcEncoder


def test_json_rpc_encoder():
    """
    Tests the JSON RPC encoder.
    """
    encoder = JsonRpcEncoder()

    assert json.loads(encoder.bar.call(x=1, y="abc", z={"a": 3, "b": "c"})) == {
        "jsonrpc": "2.0",
        "method": "bar",
        "params": {
            "x": 1,
            "y": "abc",
            "z": {
                "a": 3,
                "b": "c",
            },
        },
        "id": None,
    }

    with pytest.raises(AssertionError, match="JSON-RPC call can only contain named arguments."):
        encoder.foo.call(1, 2, x=3)
