from __future__ import annotations

from typing import List, Literal, Optional, TypedDict, Union

STRUCT_ENTRY = "struct"
EVENT_ENTRY = "event"
FUNCTION_ENTRY = "function"
ENUM_ENTRY = "enum"
CONSTRUCTOR_ENTRY = "constructor"
L1_HANDLER_ENTRY = "l1_handler"
IMPL_ENTRY = "impl"
INTERFACE_ENTRY = "interface"

DATA_KIND = "data"
NESTED_KIND = "nested"


class TypeDict(TypedDict):
    type: str


class TypedParameterDict(TypeDict):
    name: str


class StructDict(TypedDict):
    type: Literal["struct"]
    name: str
    members: List[TypedParameterDict]


class FunctionBaseDict(TypedDict):
    name: str
    inputs: List[TypedParameterDict]
    outputs: List[TypeDict]
    state_mutability: Optional[Literal["external", "view"]]


class FunctionDict(FunctionBaseDict):
    type: Literal["function"]


class ConstructorDict(TypedDict):
    type: Literal["constructor"]
    name: str
    inputs: List[TypedParameterDict]


class L1HandlerDict(FunctionBaseDict):
    type: Literal["l1_handler"]


class EventBaseDict(TypedDict):
    type: Literal["event"]
    name: str


class EventStructMemberDict(TypedParameterDict):
    kind: Literal["data"]


class EventStructDict(EventBaseDict):
    kind: Literal["struct"]
    members: List[EventStructMemberDict]


class EventEnumVariantDict(TypedParameterDict):
    kind: Literal["nested"]


class EventEnumDict(EventBaseDict):
    kind: Literal["enum"]
    variants: List[EventEnumVariantDict]


EventDict = Union[EventStructDict, EventEnumDict]


class EnumDict(TypedDict):
    type: Literal["enum"]
    name: str
    variants: List[TypedParameterDict]


class ImplDict(TypedDict):
    type: Literal["impl"]
    name: str
    interface_name: str


class InterfaceDict(TypedDict):
    type: Literal["interface"]
    name: str
    items: List[FunctionDict]  # for now only functions can be defined here


AbiDictEntry = Union[
    StructDict,
    FunctionDict,
    EventDict,
    EnumDict,
    ConstructorDict,
    L1HandlerDict,
    ImplDict,
    InterfaceDict,
]
AbiDictList = List[AbiDictEntry]
