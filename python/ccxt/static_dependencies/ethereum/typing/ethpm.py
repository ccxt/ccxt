from typing import (
    Any,
    Dict,
    NewType,
)

ContractName = NewType("ContractName", str)
Manifest = NewType("Manifest", Dict[str, Any])
URI = NewType("URI", str)
