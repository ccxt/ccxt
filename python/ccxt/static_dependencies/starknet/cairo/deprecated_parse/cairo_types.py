import dataclasses
from typing import List, Optional


class CairoType:
    """
    Base class for cairo types.
    """


@dataclasses.dataclass
class TypeFelt(CairoType):
    pass


@dataclasses.dataclass
class TypeCodeoffset(CairoType):
    pass


@dataclasses.dataclass
class TypePointer(CairoType):
    pointee: CairoType


@dataclasses.dataclass
class TypeIdentifier(CairoType):
    """
    Represents a name of an unresolved type.
    This type can be resolved to TypeStruct or TypeDefinition.
    """

    name: str


@dataclasses.dataclass
class TypeStruct(CairoType):
    scope: str


@dataclasses.dataclass
class TypeFunction(CairoType):
    """
    Represents a type of a function.
    """

    scope: str


@dataclasses.dataclass
class TypeTuple(CairoType):
    """
    Represents a type of a named or unnamed tuple.
    For example, "(felt, felt*)" or "(a: felt, b: felt*)".
    """

    @dataclasses.dataclass
    class Item(CairoType):
        """
        Represents a possibly named type item of a TypeTuple.
        For example: "felt" or "a: felt".
        """

        name: Optional[str]
        typ: CairoType

    members: List["TypeTuple.Item"]
    has_trailing_comma: bool = dataclasses.field(hash=False, compare=False)

    @property
    def is_named(self) -> bool:
        return all(member.name is not None for member in self.members)


@dataclasses.dataclass
class ExprIdentifier(CairoType):
    name: str
