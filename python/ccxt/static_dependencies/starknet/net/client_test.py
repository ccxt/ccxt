import dataclasses

import pytest

from constants import ADDR_BOUND
from hash.selector import get_selector_from_name
from net.client_models import (
    Call,
    DAMode,
    ResourceBoundsMapping,
    Transaction,
    TransactionType,
    TransactionV3,
)
from net.client_utils import _create_broadcasted_txn
from net.full_node_client import _to_storage_key
from net.http_client import RpcHttpClient, ServerError
from net.models.transaction import (
    DeclareV1,
    DeclareV2,
    DeclareV3,
    DeployAccountV1,
    DeployAccountV3,
    InvokeV1,
    InvokeV3,
)
from tests.e2e.fixtures.constants import MAX_FEE, MAX_RESOURCE_BOUNDS_L1


@pytest.mark.asyncio
async def test_wait_for_tx_negative_check_interval(client):
    with pytest.raises(
        ValueError, match="Argument check_interval has to be greater than 0."
    ):
        await client.wait_for_tx(tx_hash=0, check_interval=-1)


def test_cannot_instantiate_abstract_transaction_class():
    with pytest.raises(
        TypeError, match="Cannot instantiate abstract Transaction class."
    ):
        _ = Transaction(hash=0, signature=[0, 0], version=0)


def test_cannot_instantiate_abstract_transaction_v3_class():
    with pytest.raises(
        TypeError, match="Cannot instantiate abstract TransactionV3 class."
    ):
        _ = TransactionV3(
            hash=0,
            signature=[0, 0],
            version=0,
            paymaster_data=[],
            tip=0,
            nonce_data_availability_mode=DAMode.L1,
            fee_data_availability_mode=DAMode.L1,
            resource_bounds=ResourceBoundsMapping.init_with_zeros(),
        )


def test_handle_rpc_error_server_error():
    no_error_dict = {"not_an_error": "success"}

    with pytest.raises(ServerError, match="RPC request failed."):
        RpcHttpClient.handle_rpc_error(no_error_dict)


@pytest.mark.parametrize(
    "key, expected",
    [
        (0x0, "0x00"),
        (0x12345, "0x012345"),
        (0x10001, "0x010001"),
        (0xFFAA, "0x00ffaa"),
        (0xDE, "0x00de"),
        (
            ADDR_BOUND - 1,
            "0x07fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeff",
        ),
    ],
)
def test_get_rpc_storage_key(key, expected):
    assert _to_storage_key(key) == expected


@pytest.mark.parametrize(
    "key",
    [int(1e100), -1, 0x8FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF],
)
def test_get_rpc_storage_key_raises_on_non_representable_key(key):
    with pytest.raises(ValueError, match="cannot be represented"):
        _to_storage_key(key)


@pytest.mark.asyncio
async def test_broadcasted_txn_declare_v3(
    account, abi_types_compiled_contract_and_class_hash
):
    declare_v3 = await account.sign_declare_v3(
        compiled_contract=abi_types_compiled_contract_and_class_hash[0],
        compiled_class_hash=abi_types_compiled_contract_and_class_hash[1],
        l1_resource_bounds=MAX_RESOURCE_BOUNDS_L1,
    )

    brodcasted_txn = _create_broadcasted_txn(declare_v3)
    assert brodcasted_txn["type"] == TransactionType.DECLARE.name

    expected_keys = dataclasses.fields(DeclareV3)
    assert all(key.name in brodcasted_txn for key in expected_keys)


@pytest.mark.asyncio
async def test_broadcasted_txn_declare_v2(
    account, abi_types_compiled_contract_and_class_hash
):
    declare_v2 = await account.sign_declare_v2(
        compiled_contract=abi_types_compiled_contract_and_class_hash[0],
        compiled_class_hash=abi_types_compiled_contract_and_class_hash[1],
        max_fee=MAX_FEE,
    )

    brodcasted_txn = _create_broadcasted_txn(declare_v2)

    assert brodcasted_txn["type"] == TransactionType.DECLARE.name

    expected_keys = dataclasses.fields(DeclareV2)
    assert all(key.name in brodcasted_txn for key in expected_keys)


@pytest.mark.asyncio
async def test_broadcasted_txn_declare_v1(account, map_compiled_contract):
    declare_v1 = await account.sign_declare_v1(
        compiled_contract=map_compiled_contract,
        max_fee=MAX_FEE,
    )

    brodcasted_txn = _create_broadcasted_txn(declare_v1)

    assert brodcasted_txn["type"] == TransactionType.DECLARE.name

    expected_keys = dataclasses.fields(DeclareV1)
    assert all(key.name in brodcasted_txn for key in expected_keys)


@pytest.mark.asyncio
async def test_broadcasted_txn_invoke_v3(account, map_contract):
    invoke_tx = await account.sign_invoke_v3(
        calls=Call(map_contract.address, get_selector_from_name("put"), [3, 4]),
        l1_resource_bounds=MAX_RESOURCE_BOUNDS_L1,
    )

    brodcasted_txn = _create_broadcasted_txn(invoke_tx)

    assert brodcasted_txn["type"] == TransactionType.INVOKE.name

    expected_keys = dataclasses.fields(InvokeV3)
    assert all(key.name in brodcasted_txn for key in expected_keys)


@pytest.mark.asyncio
async def test_broadcasted_txn_invoke_v1(account, map_contract):
    invoke_tx = await account.sign_invoke_v1(
        calls=Call(map_contract.address, get_selector_from_name("put"), [3, 4]),
        max_fee=int(1e16),
    )

    brodcasted_txn = _create_broadcasted_txn(invoke_tx)

    assert brodcasted_txn["type"] == TransactionType.INVOKE.name

    expected_keys = dataclasses.fields(InvokeV1)
    assert all(key.name in brodcasted_txn for key in expected_keys)


@pytest.mark.asyncio
async def test_broadcasted_txn_deploy_account_v3(account):
    class_hash = 0x1234
    salt = 0x123
    calldata = [1, 2, 3]
    signed_tx = await account.sign_deploy_account_v3(
        class_hash,
        salt,
        l1_resource_bounds=MAX_RESOURCE_BOUNDS_L1,
        constructor_calldata=calldata,
    )
    brodcasted_txn = _create_broadcasted_txn(signed_tx)
    assert brodcasted_txn["type"] == TransactionType.DEPLOY_ACCOUNT.name

    expected_keys = dataclasses.fields(DeployAccountV3)
    assert all(key.name in brodcasted_txn for key in expected_keys)


@pytest.mark.asyncio
async def test_broadcasted_txn_deploy_account_v1(account):
    class_hash = 0x1234
    salt = 0x123
    calldata = [1, 2, 3]
    signed_tx = await account.sign_deploy_account_v1(
        class_hash, salt, calldata, max_fee=MAX_FEE
    )

    brodcasted_txn = _create_broadcasted_txn(signed_tx)

    assert brodcasted_txn["type"] == TransactionType.DEPLOY_ACCOUNT.name

    expected_keys = dataclasses.fields(DeployAccountV1)
    assert all(key.name in brodcasted_txn for key in expected_keys)
