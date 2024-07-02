import pytest
from lark import Token, Tree

from abi.v1.parser_transformer import ParserTransformer


def test_default_parser_transformer():
    with pytest.raises(TypeError, match="Unable to parse tree node of type wrong."):
        ParserTransformer({}).transform(Tree(data=Token("RULE", "wrong"), children=[]))
