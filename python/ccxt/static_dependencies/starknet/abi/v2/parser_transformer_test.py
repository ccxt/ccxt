import pytest
from lark import Token, Tree

from abi.v2.parser_transformer import ParserTransformer


def test_default_parser_transformer():
    with pytest.raises(TypeError, match="Unable to parse tree node of type wrong."):
        ParserTransformer(type_identifiers={}).transform(
            Tree(data=Token("RULE", "wrong"), children=[])
        )
