import re

import pytest

from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME
from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
from starkware.starknet.security.secure_hints import HintsWhitelist, InsecureHintError

ALLOWED_CODE = """
func f(a: felt, b: felt) {
    %{ This is a hint. %}
    ap += 5;
    ret;
}
"""

GOOD_CODES = [
    """
func f(b: felt) {
    %{ This is a hint. %}
    ap += 5;
    ret;
}
""",
]

BAD_CODES = [
    (
        """
func f(a: felt, b: felt) {
    let c = a / b;
    %{ This is a hint. %}
    ap += 5;
    ret;
}
""",
        """Forbidden expressions in hint "This is a hint.":
[NamedExpression(name='__main__.f.c', expr='cast([fp + (-4)] / [fp + (-3)], felt)')]""",
    ),
    (
        """
func f(a: felt, b: felt) {
    %{ This is a bad hint. %}
    ap += 5;
    ret;
}
""",
        "is not whitelisted",
    ),
]


def test_secure_hints_cases():
    template_program = compile_cairo(ALLOWED_CODE, DEFAULT_PRIME)
    whitelist = HintsWhitelist.from_program(template_program)
    for good_code in GOOD_CODES:
        program = compile_cairo(good_code, DEFAULT_PRIME)
        whitelist.verify_program_hint_secure(program)
    for bad_code, message in BAD_CODES:
        program = compile_cairo(bad_code, DEFAULT_PRIME)
        with pytest.raises(InsecureHintError, match=re.escape(message)):
            whitelist.verify_program_hint_secure(program)


def test_secure_hints_serialization():
    template_program = compile_cairo(ALLOWED_CODE, DEFAULT_PRIME)
    whitelist = HintsWhitelist.from_program(template_program)
    whitelist = HintsWhitelist.loads(data=whitelist.dumps())
    for good_code in GOOD_CODES:
        program = compile_cairo(good_code, DEFAULT_PRIME)
        whitelist.verify_program_hint_secure(program)


def test_collision():
    """
    Tests multiple hints with the same code but different reference expressions.
    """
    code = """
func f() {
    let b = [ap];
    %{ ids.b = 1 %}
    ret;
}
func g() {
    let b = [ap - 10];
    %{ ids.b = 1 %}
    ret;
}
"""
    program = compile_cairo(code, DEFAULT_PRIME)
    whitelist = HintsWhitelist.from_program(program)
    assert len(whitelist.allowed_reference_expressions_for_hint) == 1
    whitelist.verify_program_hint_secure(program)
