from __future__ import annotations

from collections import OrderedDict
from typing import Dict, cast

from .deprecated_parse import cairo_types as cairo_lang_types
from .data_types import (
    ArrayType,
    CairoType,
    FeltType,
    NamedTupleType,
    StructType,
    TupleType,
)
from .deprecated_parse.parser import parse


class UnknownCairoTypeError(ValueError):
    """
    Error thrown when TypeParser finds type that was not declared prior to parsing.
    """

    type_name: str

    def __init__(self, type_name: str):
        super().__init__(f"Type '{type_name}' is not defined")
        self.type_name = type_name


class TypeParser:
    """
    Low level utility class for parsing Cairo types that can be used in external methods.
    """

    defined_types: Dict[str, StructType]

    def __init__(self, defined_types: Dict[str, StructType]):
        """
        TypeParser constructor.

        :param defined_types: dictionary containing all defined types. For now, they can only be structures.
        """
        self.defined_types = defined_types
        for name, struct in defined_types.items():
            if name != struct.name:
                raise ValueError(
                    f"Keys must match name of type, '{name}' != '{struct.name}'."
                )

    def parse_inline_type(self, type_string: str) -> CairoType:
        """
        Inline type is one that can be used inline, for instance as return type. For instance
        (a: Uint256, b: felt*, c: (felt, felt)). Structure can only be referenced in inline type, can't be defined
        this way.

        :param type_string: type to parse.
        """
        parsed = parse(type_string)
        return self._transform_cairo_lang_type(parsed)

    def _transform_cairo_lang_type(
        self, cairo_type: cairo_lang_types.CairoType
    ) -> CairoType:
        """
        For now, we use parse function from cairo-lang package. It will be replaced in the future, but we need to hide
        it from the users.
        This function takes types returned by cairo-lang package and maps them to our type classes.

        :param cairo_type: type returned from parse_type function.
        :return: CairoType defined by our package.
        """
        if isinstance(cairo_type, cairo_lang_types.TypeFelt):
            return FeltType()

        if isinstance(cairo_type, cairo_lang_types.TypePointer):
            return ArrayType(self._transform_cairo_lang_type(cairo_type.pointee))

        if isinstance(cairo_type, cairo_lang_types.TypeIdentifier):
            return self._get_struct(str(cairo_type.name))

        if isinstance(cairo_type, cairo_lang_types.TypeTuple):
            # Cairo returns is_named when there are no members
            if cairo_type.is_named and len(cairo_type.members) != 0:
                assert all(member.name is not None for member in cairo_type.members)

                return NamedTupleType(
                    OrderedDict(
                        (
                            cast(
                                str, member.name
                            ),  # without that pyright is complaining
                            self._transform_cairo_lang_type(member.typ),
                        )
                        for member in cairo_type.members
                    )
                )

            return TupleType(
                [
                    self._transform_cairo_lang_type(member.typ)
                    for member in cairo_type.members
                ]
            )

        # Contracts don't support codeoffset as input/output type, user can only use it if it was defined in types
        if isinstance(cairo_type, cairo_lang_types.TypeCodeoffset):
            return self._get_struct("codeoffset")

        # Other options are: TypeFunction, TypeStruct
        # Neither of them are possible. In particular TypeStruct is not possible because we parse structs without
        # info about other structs, so they will be just TypeIdentifier (structure that was not parsed).

        # This is an error of our logic, so we throw a RuntimeError.
        raise RuntimeError(
            f"Received unknown type '{cairo_type}' from parser."
        )  # pragma: no cover

    def _get_struct(self, name: str):
        if name not in self.defined_types:
            raise UnknownCairoTypeError(name)
        return self.defined_types[name]
