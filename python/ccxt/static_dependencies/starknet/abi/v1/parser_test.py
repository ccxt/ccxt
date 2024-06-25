import pytest

import starknet_py.tests.e2e.fixtures.abi_v1_structures as fixtures
from abi.v1.parser import AbiParser, AbiParsingError
from cairo.v1.type_parser import UnknownCairoTypeError


def test_parsing_types_abi():
    # Even though user depend on pool id and uint256 it is defined first. Parser has to consider those cases
    abi = AbiParser(
        [
            fixtures.user_dict,
            fixtures.pool_id_dict,
            fixtures.user_added_dict,
            fixtures.pool_id_added_dict,
            fixtures.get_user_dict,
            fixtures.delete_pool_dict,
        ]
    ).parse()

    assert abi.defined_structures == {
        "PoolId": fixtures.pool_id_struct,
        "User": fixtures.user_struct,
        **fixtures.core_structures,
    }
    assert abi.events == {
        "UserAdded": fixtures.user_added_event,
        "PoolIdAdded": fixtures.pool_id_added_event,
    }
    assert abi.functions == {
        "get_user": fixtures.get_user_fn,
        "delete_pool": fixtures.delete_pool_fn,
    }


def test_parsing_types_abi2():
    abi = AbiParser(
        [
            fixtures.foo_external_dict,
            fixtures.foo_event_dict,
            fixtures.foo_view_dict,
            fixtures.my_enum_dict,
            fixtures.my_struct_dict,
        ]
    ).parse()

    assert abi.defined_structures == {
        "test::MyStruct::<core::integer::u256>": fixtures.my_struct,
        **fixtures.core_structures,
    }
    assert abi.defined_enums == {
        "test::MyEnum::<core::integer::u128>": fixtures.my_enum,
    }
    assert abi.events == {
        "foo_event": fixtures.foo_event,
    }
    assert abi.functions == {
        "foo_external": fixtures.foo_external,
        "foo_view": fixtures.foo_view,
    }


def test_self_cycle():
    self_referencing_struct = {
        "type": "struct",
        "name": "Infinite",
        "members": [
            {"name": "value", "type": "Infinite"},
        ],
    }
    with pytest.raises(
        AbiParsingError,
        match="Circular reference detected",
    ):
        AbiParser([self_referencing_struct]).parse()


def test_bigger_cycle():
    # first -> seconds -> third -> first...
    first = {
        "type": "struct",
        "name": "First",
        "members": [{"name": "value", "type": "Second"}],
    }
    second = {
        "type": "struct",
        "name": "Second",
        "members": [{"name": "value", "type": "Third"}],
    }
    third = {
        "type": "struct",
        "name": "Third",
        "members": [{"name": "value", "type": "First"}],
    }
    with pytest.raises(
        AbiParsingError,
        match="Circular reference detected",
    ):
        AbiParser([first, second, third]).parse()


def test_duplicated_structure():
    with pytest.raises(
        AbiParsingError,
        match="Name 'User' was used more than once in defined structures",
    ):
        AbiParser(
            [fixtures.user_dict, fixtures.pool_id_dict, fixtures.user_dict]
        ).parse()


def test_duplicated_function():
    with pytest.raises(
        AbiParsingError,
        match="Name 'get_user' was used more than once in defined functions",
    ):
        AbiParser(
            [
                fixtures.get_user_dict,
                fixtures.delete_pool_dict,
                fixtures.get_user_dict,
                fixtures.delete_pool_dict,
            ]
        ).parse()


def test_duplicated_event():
    with pytest.raises(
        AbiParsingError,
        match="Name 'UserAdded' was used more than once in defined events",
    ):
        AbiParser(
            [
                fixtures.user_added_dict,
                fixtures.delete_pool_dict,
                fixtures.user_added_dict,
            ]
        ).parse()


def test_duplicated_type_members():
    type_dict = {
        "type": "struct",
        "name": "Record",
        "members": [
            {"name": "name", "type": "core::felt252"},
            {"name": "value", "type": "core::felt252"},
            {"name": "id", "type": "core::felt252"},
            {"name": "value", "type": "core::felt252"},
        ],
    }
    with pytest.raises(
        AbiParsingError,
        match="Name 'value' was used more than once in members of structure 'Record'",
    ):
        AbiParser([type_dict]).parse()


@pytest.mark.parametrize(
    "missing_name, input_dict",
    [
        # Type
        ("PoolId", fixtures.user_dict),
        # Function
        ("User", fixtures.get_user_dict),
        # Event
        ("User", fixtures.user_added_dict),
    ],
)
def test_missing_type_used(missing_name, input_dict):
    with pytest.raises(
        UnknownCairoTypeError, match=f"Type '{missing_name}' is not defined.*"
    ):
        AbiParser([input_dict]).parse()
