import json

import pytest

import starknet_py.tests.e2e.fixtures.abi_structures as fixtures
from abi.v0 import AbiParser, AbiParsingError
from cairo.type_parser import UnknownCairoTypeError
from tests.e2e.fixtures.constants import CONTRACTS_COMPILED_V0_DIR
from tests.e2e.fixtures.misc import read_contract


def test_parsing_types_abi():
    # Even though user depend on pool id and uint256 it is defined first. Parser has to consider those cases
    abi = AbiParser(
        [
            fixtures.user_dict,
            fixtures.pool_id_dict,
            fixtures.uint256_dict,
            fixtures.user_added_dict,
            fixtures.pool_id_added_dict,
            fixtures.get_user_dict,
            fixtures.delete_pool_dict,
        ]
    ).parse()

    assert abi.defined_structures == {
        "Uint256": fixtures.uint256_struct,
        "PoolId": fixtures.pool_id_struct,
        "User": fixtures.user_struct,
    }
    assert abi.events == {
        "UserAdded": fixtures.user_added_event,
        "PoolIdAdded": fixtures.pool_id_added_event,
    }
    assert abi.functions == {
        "get_user": fixtures.get_user_fn,
        "delete_pool": fixtures.delete_pool_fn,
    }


def test_parsing_types_abi_missing_offset():
    abi = AbiParser(
        [
            fixtures.user_missing_offset_dict,
            fixtures.uint256_dict,
            fixtures.pool_id_dict,
        ]
    ).parse()

    assert abi.defined_structures == {
        "Uint256": fixtures.uint256_struct,
        "PoolId": fixtures.pool_id_struct,
        "User": fixtures.user_struct,
    }


def test_parsing_types_abi_partial_missing_offset():
    abi = AbiParser(
        [
            fixtures.user_partial_missing_offset_dict,
            fixtures.uint256_dict,
            fixtures.pool_id_dict,
        ]
    ).parse()

    assert abi.defined_structures == {
        "Uint256": fixtures.uint256_struct,
        "PoolId": fixtures.pool_id_struct,
        "User": fixtures.user_partial_missing_offset_struct,
    }


def test_self_cycle():
    self_referencing_struct = {
        "type": "struct",
        "name": "Infinite",
        "size": 1,
        "members": [
            {"name": "value", "offset": 0, "type": "Infinite"},
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
        "size": 1,
        "members": [{"name": "value", "offset": 0, "type": "Second"}],
    }
    second = {
        "type": "struct",
        "name": "Second",
        "size": 1,
        "members": [{"name": "value", "offset": 0, "type": "Third"}],
    }
    third = {
        "type": "struct",
        "name": "Third",
        "size": 1,
        "members": [{"name": "value", "offset": 0, "type": "First"}],
    }
    with pytest.raises(
        AbiParsingError,
        match="Circular reference detected",
    ):
        AbiParser([first, second, third]).parse()


def test_duplicated_structure():
    with pytest.raises(
        AbiParsingError,
        match="Name 'Uint256' was used more than once in defined structures",
    ):
        AbiParser(
            [fixtures.uint256_dict, fixtures.pool_id_dict, fixtures.uint256_dict]
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
        "size": 4,
        "members": [
            {"name": "name", "offset": 0, "type": "felt"},
            {"name": "value", "offset": 1, "type": "felt"},
            {"name": "id", "offset": 2, "type": "felt"},
            {"name": "value", "offset": 3, "type": "felt"},
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
        ("Uint256", fixtures.pool_id_dict),
        # Function
        ("Uint256", fixtures.get_user_dict),
        # Event
        ("User", fixtures.user_added_dict),
    ],
)
def test_missing_type_used(missing_name, input_dict):
    with pytest.raises(
        UnknownCairoTypeError, match=f"Type '{missing_name}' is not defined"
    ):
        AbiParser([input_dict]).parse()


def test_deserialize_proxy_abi():
    # Contains all types of ABI apart from structures
    abi = json.loads(
        read_contract("oz_proxy_abi.json", directory=CONTRACTS_COMPILED_V0_DIR)
    )
    deserialized = AbiParser(abi).parse()

    assert deserialized == fixtures.oz_proxy_abi


def test_deserialize_balance_struct_event_abi():
    # Contains all types of ABI apart from structures
    abi = json.loads(
        read_contract(
            "balance_struct_event_abi.json", directory=CONTRACTS_COMPILED_V0_DIR
        )
    )
    deserialized = AbiParser(abi).parse()

    assert deserialized == fixtures.balance_struct_abi


def test_duplicated_constructor():
    constructor = {
        "inputs": [],
        "name": "constructor",
        "outputs": [],
        "type": "constructor",
    }
    with pytest.raises(
        AbiParsingError, match="Constructor in ABI must be defined at most once"
    ):
        AbiParser([constructor, constructor]).parse()


def test_duplicated_l1_handler():
    l1_handler = {
        "inputs": [],
        "name": "__l1_default__",
        "outputs": [],
        "type": "l1_handler",
    }
    with pytest.raises(
        AbiParsingError, match="L1 handler in ABI must be defined at most once"
    ):
        AbiParser([l1_handler, l1_handler]).parse()
