import sys

import pytest

from cairo.felt import decode_shortstring, encode_shortstring
from contract import Contract
from tests.e2e.fixtures.constants import MAX_FEE
from tests.e2e.fixtures.contracts import deploy_v1_contract

# TODO (#1219): investigate why some of these tests fails for contracts_compiled_v1


@pytest.mark.skipif(
    "--contract_dir=v2" not in sys.argv,
    reason="Some cairo 1 contracts compiled with v1 compiler fail with new devnet-rs",
)
@pytest.mark.asyncio
async def test_general_v1_interaction(account, cairo1_erc20_class_hash: int):
    calldata = {
        "name_": encode_shortstring("erc20_basic"),
        "symbol_": encode_shortstring("ERC20B"),
        "decimals_": 10,
        "initial_supply": 12345,
        "recipient": account.address,
    }
    erc20 = await deploy_v1_contract(
        account=account,
        contract_name="ERC20",
        class_hash=cairo1_erc20_class_hash,
        calldata=calldata,
    )

    (name,) = await erc20.functions["get_name"].call()
    decoded_name = decode_shortstring(name)
    (decimals,) = await erc20.functions["get_decimals"].call()
    (supply,) = await erc20.functions["get_total_supply"].call()
    (account_balance,) = await erc20.functions["balance_of"].call(
        account=account.address
    )

    transfer_amount = 10
    await (
        await erc20.functions["transfer"].invoke_v1(
            recipient=0x11, amount=transfer_amount, max_fee=MAX_FEE
        )
    ).wait_for_acceptance()

    (after_transfer_balance,) = await erc20.functions["balance_of"].call(
        account=account.address
    )

    assert decoded_name == "erc20_basic"
    assert decimals == calldata["decimals_"]
    assert supply == calldata["initial_supply"]
    assert account_balance == calldata["initial_supply"]
    assert after_transfer_balance == calldata["initial_supply"] - transfer_amount


@pytest.mark.skipif(
    "--contract_dir=v2" not in sys.argv,
    reason="Some Cairo 1 contracts compiled with v1 compiler fail with new devnet-rs",
)
@pytest.mark.asyncio
async def test_serializing_struct(account, cairo1_token_bridge_class_hash: int):
    bridge = await deploy_v1_contract(
        account=account,
        contract_name="TokenBridge",
        class_hash=cairo1_token_bridge_class_hash,
        calldata={"governor_address": account.address},
    )

    await (
        await bridge.functions["set_l1_bridge"].invoke_v1(
            l1_bridge_address={"address": 0x11}, max_fee=MAX_FEE
        )
    ).wait_for_acceptance()


@pytest.mark.asyncio
async def test_serializing_option(account, cairo1_test_option_class_hash: int):
    test_option = await deploy_v1_contract(
        account=account,
        contract_name="TestOption",
        class_hash=cairo1_test_option_class_hash,
    )

    (received_option,) = await test_option.functions["get_option_struct"].call()

    assert dict(received_option) == {
        "first_field": 1,
        "second_field": 2,
        "third_field": None,
        "fourth_field": 4,
    }

    option_struct = {
        "first_field": 1,
        "second_field": 2**128 + 1,
        "third_field": None,
        "fourth_field": 4,
    }

    (received_option,) = await test_option.functions[
        "receive_and_send_option_struct"
    ].call(option_struct=option_struct)

    assert dict(received_option) == option_struct

    (received_option,) = await test_option.functions["get_empty_option"].call()

    assert received_option is None


@pytest.mark.asyncio
async def test_serializing_enum(account, cairo1_test_enum_class_hash: int):
    test_enum = await deploy_v1_contract(
        account=account,
        contract_name="TestEnum",
        class_hash=cairo1_test_enum_class_hash,
    )

    (received_enum,) = await test_enum.functions["get_enum"].call()

    assert received_enum.variant == "a"
    assert received_enum.value == 100

    (received_enum,) = await test_enum.functions["get_enum_without_value"].call()

    assert received_enum.variant == "c"
    assert received_enum.value is None

    variant_name = "b"
    value = 200
    (received_enum,) = await test_enum.functions["receive_and_send_enum"].call(
        my_enum={variant_name: value}
    )

    assert received_enum.variant == variant_name
    assert received_enum.value == value

    variant_name = "c"
    value = None
    (received_enum,) = await test_enum.functions["receive_and_send_enum"].call(
        my_enum={variant_name: value}
    )

    assert received_enum.variant == variant_name
    assert received_enum.value == value


@pytest.mark.skipif(
    "--contract_dir=v2" not in sys.argv,
    reason="Some cairo 1 contracts compiled with v1 compiler fail with new devnet-rs",
)
@pytest.mark.asyncio
async def test_from_address_on_v1_contract(account, cairo1_erc20_class_hash: int):
    calldata = {
        "name_": encode_shortstring("erc20_basic"),
        "symbol_": encode_shortstring("ERC20B"),
        "decimals_": 10,
        "initial_supply": 12345,
        "recipient": account.address,
    }
    erc20 = await deploy_v1_contract(
        account=account,
        contract_name="ERC20",
        class_hash=cairo1_erc20_class_hash,
        calldata=calldata,
    )

    erc20_from_address = await Contract.from_address(erc20.address, provider=account)

    assert erc20_from_address.address == erc20.address
    assert erc20_from_address.account == erc20.account
    assert erc20_from_address.functions.keys() == erc20.functions.keys()
    assert erc20_from_address.data == erc20.data


@pytest.mark.skipif(
    "--contract_dir=v1" in sys.argv,
    reason="Contract exists only in v2 directory",
)
@pytest.mark.asyncio
async def test_invoke_contract_with_bytearray(string_contract):
    (initial_string,) = await string_contract.functions["get_string"].call()
    assert initial_string == "Hello"

    value_to_set = """
        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    """

    await string_contract.functions["set_string"].invoke_v3(
        new_string=value_to_set, auto_estimate=True
    )
    (new_string,) = await string_contract.functions["get_string"].call()
    assert new_string == value_to_set
