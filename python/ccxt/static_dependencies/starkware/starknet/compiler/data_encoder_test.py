import re
from typing import List

import pytest

from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME
from starkware.cairo.lang.compiler.ast.cairo_types import CairoType, TypeFelt, TypePointer
from starkware.cairo.lang.compiler.error_handling import InputFile, Location
from starkware.cairo.lang.compiler.identifier_manager import IdentifierManager
from starkware.cairo.lang.compiler.parser import parse_type
from starkware.cairo.lang.compiler.preprocessor.preprocessor_error import PreprocessorError
from starkware.cairo.lang.compiler.preprocessor.preprocessor_test_utils import preprocess_str
from starkware.cairo.lang.compiler.scoped_name import ScopedName
from starkware.cairo.lang.compiler.type_casts import FELT_STAR
from starkware.cairo.lang.compiler.type_system import mark_type_resolved
from starkware.starknet.compiler.data_encoder import (
    ArgumentInfo,
    EncodingType,
    decode_data,
    encode_data,
)

scope = ScopedName.from_string
FELT_STAR_STAR = TypePointer(pointee=FELT_STAR)


def parse_resolved_type(typ_str: str) -> CairoType:
    return mark_type_resolved(parse_type(typ_str))


def dummy_location():
    return Location(
        start_line=1,
        start_col=2,
        end_line=3,
        end_col=4,
        input_file=InputFile(filename=None, content=""),
    )


def identifiers_for_testing() -> IdentifierManager:
    return preprocess_str(
        """
struct MyStruct {
    x: felt,
    y: felt,
}
""",
        prime=DEFAULT_PRIME,
    ).identifiers


def run_decode_data(
    arguments: List[ArgumentInfo],
    encoding_type: EncodingType = EncodingType.CALLDATA,
    has_range_check_builtin=True,
):
    return decode_data(
        data_ptr="data_ptr",
        data_size="data_size",
        arguments=arguments,
        encoding_type=encoding_type,
        has_range_check_builtin=has_range_check_builtin,
        location=dummy_location(),
        identifiers=identifiers_for_testing(),
    )


def test_decode_data_flow():
    location = dummy_location()
    arguments = [
        ArgumentInfo(name="a_len", cairo_type=TypeFelt(), location=location),
        ArgumentInfo(
            name="a",
            cairo_type=parse_resolved_type("(test_scope.MyStruct, (felt, felt))*"),
            location=location,
        ),
        ArgumentInfo(name="b", cairo_type=TypeFelt(), location=location),
        ArgumentInfo(
            name="c",
            cairo_type=parse_resolved_type("(felt, (felt, felt))"),
            location=location,
        ),
    ]
    code_elements, expr = run_decode_data(arguments)

    assert (
        "".join(code_element.format(100) + "\n" for code_element in code_elements)
        == """\
let __calldata_ptr: felt* = cast(data_ptr, felt*);

let __calldata_arg_a_len = [__calldata_ptr];
let __calldata_ptr = __calldata_ptr + 1;

// Check that the length is non-negative.
assert [range_check_ptr] = __calldata_arg_a_len;
let range_check_ptr = range_check_ptr + 1;
// Create the reference.
let __calldata_arg_a = cast(__calldata_ptr, (test_scope.MyStruct, (felt, felt))*);
// Use 'tempvar' instead of 'let' to avoid repeating this computation for the
// following arguments.
tempvar __calldata_ptr = __calldata_ptr + __calldata_arg_a_len * 4;

let __calldata_arg_b = [__calldata_ptr];
let __calldata_ptr = __calldata_ptr + 1;

let __calldata_arg_c = [cast(__calldata_ptr, (felt, (felt, felt))*)];
let __calldata_ptr = __calldata_ptr + 3;

let __calldata_actual_size = __calldata_ptr - cast(data_ptr, felt*);
assert data_size = __calldata_actual_size;
""".replace(
            "\n\n", "\n"
        )
    )

    assert (
        expr.format()
        == "a_len=__calldata_arg_a_len, a=__calldata_arg_a, b=__calldata_arg_b, c=__calldata_arg_c,"
    )

    assert code_elements[0].code_elm.expr.location.parent_location == (
        location,
        "While handling calldata of",
    )

    # Do the same, with encoding_type=EncodingType.RETURN.
    # Only validate the beginning of the generated code.
    code_elements, expr = run_decode_data(arguments, encoding_type=EncodingType.RETURN)
    assert "".join(code_element.format(100) + "\n" for code_element in code_elements).startswith(
        """\
let __return_value_ptr: felt* = cast(data_ptr, felt*);
let __return_value_arg_a_len = [__return_value_ptr];
"""
    )
    assert code_elements[0].code_elm.expr.location.parent_location == (
        location,
        "While handling return values of",
    )


def test_decode_data_failure():
    location = dummy_location()
    with pytest.raises(
        PreprocessorError,
        match=re.escape("Only pointers to types that consist of felts are supported."),
    ):
        run_decode_data(
            [
                ArgumentInfo(name="arg_a", cairo_type=FELT_STAR_STAR, location=location),
                ArgumentInfo(name="arg_b", cairo_type=TypeFelt(), location=location),
            ]
        )
    with pytest.raises(
        PreprocessorError,
        match='Array argument "arg_a" must be preceded by a length '
        'argument named "arg_a_len" of type felt.',
    ):
        run_decode_data(
            [
                ArgumentInfo(name="arg_a", cairo_type=FELT_STAR, location=location),
                ArgumentInfo(name="arg_b", cairo_type=TypeFelt(), location=location),
            ]
        )
    with pytest.raises(
        PreprocessorError,
        match=re.escape(
            "The 'range_check' builtin must be declared in the '%builtins' directive when using "
            "array arguments in external functions."
        ),
    ):
        run_decode_data(
            [
                ArgumentInfo(name="arg_len", cairo_type=TypeFelt(), location=location),
                ArgumentInfo(name="arg", cairo_type=FELT_STAR, location=location),
            ],
            has_range_check_builtin=False,
        )


def test_encode_data_for_return():
    location = dummy_location()
    code_elements = encode_data(
        [
            ArgumentInfo(name="a", cairo_type=TypeFelt(), location=location),
            ArgumentInfo(name="b_len", cairo_type=TypeFelt(), location=location),
            ArgumentInfo(
                name="b",
                cairo_type=parse_resolved_type("(test_scope.MyStruct, felt)*"),
                location=location,
            ),
            ArgumentInfo(
                name="c",
                cairo_type=parse_resolved_type("(test_scope.MyStruct, felt)"),
                location=location,
            ),
        ],
        encoding_type=EncodingType.RETURN,
        has_range_check_builtin=True,
        identifiers=identifiers_for_testing(),
        arg_name_func=lambda arg_info: f"x.{arg_info.name}",
    )

    assert (
        "".join(code_element.format(100) + "\n" for code_element in code_elements)
        == """\
assert [__return_value_ptr] = x.a;
let __return_value_ptr = __return_value_ptr + 1;

assert [__return_value_ptr] = x.b_len;
let __return_value_ptr = __return_value_ptr + 1;

// Check that the length is non-negative.
assert [range_check_ptr] = x.b_len;
// Store the updated range_check_ptr as a local variable to keep it available after
// the memcpy.
local range_check_ptr = range_check_ptr + 1;
// Keep a reference to __return_value_ptr.
let __return_value_ptr_copy = __return_value_ptr;
// Store the updated __return_value_ptr as a local variable to keep it available after
// the memcpy.
local __return_value_ptr: felt* = __return_value_ptr + x.b_len * 3;
memcpy(dst=__return_value_ptr_copy, src=x.b, len=x.b_len * 3);

// Create a reference to x.c as felt*.
let __return_value_tmp: felt* = cast(&x.c, felt*);
assert [__return_value_ptr + 0] = [__return_value_tmp + 0];
assert [__return_value_ptr + 1] = [__return_value_tmp + 1];
assert [__return_value_ptr + 2] = [__return_value_tmp + 2];
let __return_value_ptr = __return_value_ptr + 3;
""".replace(
            "\n\n", "\n"
        )
    )

    assert code_elements[0].code_elm.a.location.parent_location == (
        location,
        "While handling return value 'a'",
    )
