from __future__ import annotations

from abc import ABC
from collections import OrderedDict
from dataclasses import dataclass
from typing import List


class CairoType(ABC):
    """
    Base type for all Cairo type representations. All types extend it.
    """


@dataclass
class FeltType(CairoType):
    """
    Type representation of Cairo field element.
    """


@dataclass
class BoolType(CairoType):
    """
    Type representation of Cairo boolean.
    """


@dataclass
class TupleType(CairoType):
    """
    Type representation of Cairo tuples without named fields.
    """

    types: List[CairoType]  #: types of every tuple element.


@dataclass
class NamedTupleType(CairoType):
    """
    Type representation of Cairo tuples with named fields.
    """

    types: OrderedDict[str, CairoType]  #: types of every tuple member.


@dataclass
class ArrayType(CairoType):
    """
    Type representation of Cairo arrays.
    """

    inner_type: CairoType  #: type of element inside array.


@dataclass
class StructType(CairoType):
    """
    Type representation of Cairo structures.
    """

    name: str  #: Structure name
    # We need ordered dict, because it is important in serialization
    types: OrderedDict[str, CairoType]  #: types of every structure member.


@dataclass
class EnumType(CairoType):
    """
    Type representation of Cairo enums.
    """

    name: str
    variants: OrderedDict[str, CairoType]


@dataclass
class OptionType(CairoType):
    """
    Type representation of Cairo options.
    """

    type: CairoType


@dataclass
class UintType(CairoType):
    """
    Type representation of Cairo unsigned integers.
    """

    bits: int

    def check_range(self, value: int):
        """
        Utility method checking if the `value` is in range.
        """


@dataclass
class TypeIdentifier(CairoType):
    """
    Type representation of Cairo identifiers.
    """

    name: str


@dataclass
class UnitType(CairoType):
    """
    Type representation of Cairo unit `()`.
    """


@dataclass
class EventType(CairoType):
    """
    Type representation of Cairo Event.
    """

    name: str
    types: OrderedDict[str, CairoType]
