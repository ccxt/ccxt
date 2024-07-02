"""
TypedDict structures for TypedData
"""

from typing import Any, Dict, List, TypedDict, Union


class ParameterDict(TypedDict):
    """
    TypedDict representing a Parameter object
    """

    name: str
    type: str


class StarkNetDomainDict(TypedDict):
    """
    TypedDict representing a StarkNetDomain object
    """

    name: str
    version: str
    chainId: Union[str, int]


class TypedDataDict(TypedDict):
    """
    TypedDict representing a TypedData object
    """

    types: Dict[str, List[ParameterDict]]
    primaryType: str
    domain: StarkNetDomainDict
    message: Dict[str, Any]
