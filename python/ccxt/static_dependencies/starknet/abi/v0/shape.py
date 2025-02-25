# TODO (#1260): update pylint to 3.1.0 and remove pylint disable
# pylint: disable=too-many-ancestors
import sys
from typing import List, Literal, Union

if sys.version_info < (3, 11):
    from typing_extensions import NotRequired, TypedDict
else:
    from typing import NotRequired, TypedDict

STRUCT_ENTRY = "struct"
FUNCTION_ENTRY = "function"
CONSTRUCTOR_ENTRY = "constructor"
L1_HANDLER_ENTRY = "l1_handler"
EVENT_ENTRY = "event"


class TypedMemberDict(TypedDict):
    name: str
    type: str


class StructMemberDict(TypedMemberDict):
    offset: NotRequired[int]


class StructDict(TypedDict):
    type: Literal["struct"]
    name: str
    size: int
    members: List[StructMemberDict]


class FunctionBaseDict(TypedDict):
    name: str
    inputs: List[TypedMemberDict]
    outputs: List[TypedMemberDict]
    stateMutability: NotRequired[Literal["view"]]


class FunctionDict(FunctionBaseDict):
    type: Literal["function"]


class ConstructorDict(FunctionBaseDict):
    type: Literal["constructor"]


class L1HandlerDict(FunctionBaseDict):
    type: Literal["l1_handler"]


class EventDict(TypedDict):
    name: str
    type: Literal["event"]
    data: List[TypedMemberDict]
    keys: List[TypedMemberDict]


AbiDictEntry = Union[
    StructDict, FunctionDict, ConstructorDict, L1HandlerDict, EventDict
]
AbiDictList = List[AbiDictEntry]
