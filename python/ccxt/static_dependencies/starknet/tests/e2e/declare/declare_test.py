import pytest

from net.client_models import TransactionExecutionStatus
from net.models.transaction import DeclareV3
from tests.e2e.fixtures.constants import MAX_FEE, MAX_RESOURCE_BOUNDS_L1


@pytest.mark.asyncio
async def test_declare_tx(account, map_compiled_contract):
    declare_tx = await account.sign_declare_v1(
        compiled_contract=map_compiled_contract, max_fee=MAX_FEE
    )
    result = await account.client.declare(declare_tx)

    await account.client.wait_for_tx(tx_hash=result.transaction_hash)


@pytest.mark.asyncio
async def test_declare_v2_tx(cairo1_minimal_contract_class_hash: int):
    assert isinstance(cairo1_minimal_contract_class_hash, int)
    assert cairo1_minimal_contract_class_hash != 0


@pytest.mark.asyncio
async def test_declare_v3_tx(account, abi_types_compiled_contract_and_class_hash):
    declare_tx = await account.sign_declare_v3(
        compiled_contract=abi_types_compiled_contract_and_class_hash[0],
        compiled_class_hash=abi_types_compiled_contract_and_class_hash[1],
        l1_resource_bounds=MAX_RESOURCE_BOUNDS_L1,
    )
    assert isinstance(declare_tx, DeclareV3)

    result = await account.client.declare(declare_tx)
    tx_receipt = await account.client.wait_for_tx(tx_hash=result.transaction_hash)

    assert tx_receipt.execution_status == TransactionExecutionStatus.SUCCEEDED
