from ....lark import Lark

from .cairo_types import CairoType
from .parser_transformer import ParserTransformer

CAIRO_EBNF = """
    %import common.WS_INLINE
    %ignore WS_INLINE

    IDENTIFIER: /[a-zA-Z_][a-zA-Z_0-9]*/
    _DBL_STAR: "**"
    COMMA: ","

    ?type: non_identifier_type
        | identifier             -> type_struct

    comma_separated{item}: item? (COMMA item)* COMMA?

    named_type: identifier (":" type)? | non_identifier_type
    non_identifier_type: "felt"                                         -> type_felt
                    | "codeoffset"                                   -> type_codeoffset
                    | type "*"                                       -> type_pointer
                    | type _DBL_STAR                                 -> type_pointer2
                    | "(" comma_separated{named_type} ")" -> type_tuple

    identifier: IDENTIFIER ("." IDENTIFIER)*
"""


def parse(code: str) -> CairoType:
    """
    Parses the given string and returns a CairoType.
    """

    grammar = CAIRO_EBNF

    grammar_parser = Lark(
        grammar=grammar,
        start=["type"],
        parser="lalr",
    )

    parsed = grammar_parser.parse(code)
    transformed = ParserTransformer().transform(parsed)

    return transformed
