from collections import OrderedDict
from typing import Dict, Union

import pytest

from cairo.data_types import (
    ArrayType,
    EnumType,
    FeltType,
    StructType,
    TupleType,
    UnitType,
)
from cairo.v2.type_parser import TypeParser, UnknownCairoTypeError


@pytest.mark.parametrize(
    "type_string, expected",
    [
        ("core::felt252", FeltType()),
        ("core::array::Array::<core::felt252>", ArrayType(FeltType())),
        (
            "(core::felt252, core::felt252, core::felt252, core::felt252)",
            TupleType([FeltType()] * 4),
        ),
        ("(,)", TupleType([])),
        ("()", UnitType()),
        (
            "(core::felt252, (core::felt252, (core::array::Array::<core::felt252>, core::felt252)))",
            TupleType(
                [
                    FeltType(),
                    TupleType(
                        [
                            FeltType(),
                            TupleType(
                                [
                                    ArrayType(FeltType()),
                                    FeltType(),
                                ]
                            ),
                        ]
                    ),
                ]
            ),
        ),
    ],
)
def test_parse_without_defined_types(type_string, expected):
    parsed = TypeParser({}).parse_inline_type(type_string)
    assert parsed == expected


uint256_type = StructType("Uint256", OrderedDict(low=FeltType(), high=FeltType()))
wrapped_felt_type = StructType("WrappedFelt", OrderedDict(value=FeltType()))


@pytest.mark.parametrize(
    "type_string, expected",
    [
        ("Uint256", uint256_type),
        ("core::array::Array::<Uint256>", ArrayType(uint256_type)),
        (
            "(Uint256, WrappedFelt)",
            TupleType([uint256_type, wrapped_felt_type]),
        ),
        (
            "(Uint256, (WrappedFelt, (core::array::Array::<core::felt252>, core::array::Array::<WrappedFelt>)))",
            TupleType(
                [
                    uint256_type,
                    TupleType(
                        [
                            wrapped_felt_type,
                            TupleType(
                                [
                                    ArrayType(FeltType()),
                                    ArrayType(wrapped_felt_type),
                                ]
                            ),
                        ]
                    ),
                ]
            ),
        ),
    ],
)
def test_parse_with_defined_types(type_string, expected):
    types: Dict[str, Union[StructType, EnumType]] = {
        "Uint256": uint256_type,
        "WrappedFelt": wrapped_felt_type,
    }
    parsed = TypeParser(types).parse_inline_type(type_string)  # pyright: ignore
    assert parsed == expected


def test_missing_type():
    with pytest.raises(
        UnknownCairoTypeError, match="Type 'Uint256' is not defined"
    ) as err_info:
        TypeParser({}).parse_inline_type("Uint256")

    assert err_info.value.type_name == "Uint256"


def test_names_not_matching():
    with pytest.raises(
        ValueError, match="Keys must match name of type, 'OtherName' != 'Uint256'."
    ):
        TypeParser({"OtherName": uint256_type})
