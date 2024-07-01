from typing import Optional

import pytest

from starkware.cairo.lang.compiler.parser import parse_expr
from starkware.starknet.security.simple_references import is_simple_reference


@pytest.mark.parametrize(
    "expr_str, simplicity",
    [
        ["ap", 1],
        ["1234", 1],
        ["(ap * (-3) + 4) - 5", 10],
        ["[[[ap] + [fp]]]", 7],
        ["cast(ap, x)", 2],
        ["[cast(ap, x)]", 3],
        ["cast(ap, x) + 1", None],
        ["cast(cast(ap, x), x)", None],
        ["x", None],
        ["&ap", None],
        ["3 ** 2", None],
        ["3 / 2", None],
        ["nondet %{ 5 %}", None],
    ],
)
def test_is_simple_reference(expr_str: str, simplicity: Optional[int]):
    expr = parse_expr(expr_str)
    if simplicity is not None:
        assert is_simple_reference(expr, simplicity_bound=simplicity) is False
        assert is_simple_reference(expr, simplicity_bound=simplicity + 1) is True
    else:
        assert is_simple_reference(expr, simplicity_bound=0) is False
        assert is_simple_reference(expr, simplicity_bound=1000) is False
