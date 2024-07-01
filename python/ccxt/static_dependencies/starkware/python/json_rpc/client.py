"""
JSON-RPC client implementation.
"""

import json
from typing import Any, Dict


class JsonRpcMethod:
    """
    Represents a JSON-RPC method that can be called to generate a JSON-RPC request.
    """

    def __init__(self, name: str):
        self.name = name

    def call(self, *args, **kwargs) -> str:
        """
        Returns a JSON-RPC call.
        """
        assert len(args) == 0, "JSON-RPC call can only contain named arguments."

        call_dict: Dict[str, Any] = {"jsonrpc": "2.0", "method": self.name, "id": None}
        if len(kwargs) != 0:
            call_dict["params"] = kwargs

        return json.dumps(call_dict)


class JsonRpcEncoder:
    """
    Generates JsonRpcMethods.
    """

    def __getattr__(self, name: str) -> JsonRpcMethod:
        return JsonRpcMethod(name=name)
