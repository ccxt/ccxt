import dataclasses
from typing import Optional, Tuple

from ....lark import Token, Transformer, v_args

from .cairo_types import (
    CairoType,
    ExprIdentifier,
    TypeCodeoffset,
    TypeFelt,
    TypeIdentifier,
    TypePointer,
    TypeStruct,
    TypeTuple,
)


@dataclasses.dataclass
class ParserContext:
    """
    Represents information that affects the parsing process.
    """

    # If True, treat type identifiers as resolved.
    resolved_types: bool = False


class ParserError(Exception):
    """
    Base exception for parsing process.
    """


@dataclasses.dataclass
class CommaSeparated:
    """
    Represents a list of comma separated values, such as expressions or types.
    """

    args: list
    has_trailing_comma: bool


class ParserTransformer(Transformer):
    """
    Transforms the lark tree into an AST based on the classes defined in cairo_types.py.
    """

    # pylint: disable=unused-argument, no-self-use

    def __init__(self):
        super().__init__()
        self.parser_context = ParserContext()

    def __default__(self, data: str, children, meta):
        raise TypeError(f"Unable to parse tree node of type {data}")

    def comma_separated(self, value) -> CommaSeparated:
        saw_comma = None
        args: list = []
        for v in value:
            if isinstance(v, Token) and v.type == "COMMA":
                if saw_comma is not False:
                    raise ParserError("Unexpected comma.")
                saw_comma = True
            else:
                if saw_comma is False:
                    raise ParserError("Expected a comma before this expression.")
                args.append(v)

                # Reset state.
                saw_comma = False

        if saw_comma is None:
            saw_comma = False

        return CommaSeparated(args=args, has_trailing_comma=saw_comma)

    # Types.

    @v_args(meta=True)
    def named_type(self, meta, value) -> TypeTuple.Item:
        name: Optional[str]
        if len(value) == 1:
            # Unnamed type.
            (typ,) = value
            name = None
            if isinstance(typ, ExprIdentifier):
                typ = self.type_struct([typ])
        elif len(value) == 2:
            # Named type.
            identifier, typ = value
            assert isinstance(identifier, ExprIdentifier)
            assert isinstance(typ, CairoType)
            if "." in identifier.name:
                raise ParserError("Unexpected . in name.")
            name = identifier.name
        else:
            raise NotImplementedError(f"Unexpected number of values. {value}")

        return TypeTuple.Item(name=name, typ=typ)

    @v_args(meta=True)
    def type_felt(self, meta, value):
        return TypeFelt()

    @v_args(meta=True)
    def type_codeoffset(self, meta, value):
        return TypeCodeoffset()

    def type_struct(self, value):
        assert len(value) == 1 and isinstance(value[0], ExprIdentifier)
        if self.parser_context.resolved_types:
            # If parser_context.resolved_types is True, assume that the type is a struct.
            return TypeStruct(scope=value[0].name)

        return TypeIdentifier(name=value[0].name)

    @v_args(meta=True)
    def type_pointer(self, meta, value):
        return TypePointer(pointee=value[0])

    @v_args(meta=True)
    def type_pointer2(self, meta, value):
        return TypePointer(pointee=TypePointer(pointee=value[0]))

    @v_args(meta=True)
    def type_tuple(self, meta, value: Tuple[CommaSeparated]):
        (lst,) = value
        return TypeTuple(members=lst.args, has_trailing_comma=lst.has_trailing_comma)

    @v_args(meta=True)
    def identifier(self, meta, value):
        return ExprIdentifier(name=".".join(x.value for x in value))

    @v_args(meta=True)
    def identifier_def(self, meta, value):
        return ExprIdentifier(name=value[0].value)
