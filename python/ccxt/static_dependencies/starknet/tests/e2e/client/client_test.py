# pylint: disable=too-many-arguments
import dataclasses
from typing import Tuple
from unittest.mock import AsyncMock, Mock, patch

import pytest
from aiohttp import ClientSession

from hash.selector import get_selector_from_name
from hash.storage import get_storage_var_address
from net.client_errors import ClientError
from net.client_models import (
    Call,
    ContractClass,
    DeclaredContractHash,
    DeclareTransactionV1,
    DeclareTransactionV2,
    DeployAccountTransactionV1,
    EstimatedFee,
    ExecutionResources,
    FeePayment,
    InvokeTransactionV1,
    L1HandlerTransaction,
    PendingBlockStateUpdate,
    PriceUnit,
    ResourceBounds,
    SierraContractClass,
    SierraEntryPointsByType,
    TransactionExecutionStatus,
    TransactionFinalityStatus,
    TransactionReceipt,
    TransactionStatus,
    TransactionStatusResponse,
    TransactionType,
)
from net.full_node_client import FullNodeClient
from net.http_client import RpcHttpClient
from net.models.transaction import DeclareV2
from net.udc_deployer.deployer import Deployer
from tests.e2e.fixtures.constants import CONTRACTS_COMPILED_V0_DIR, MAX_FEE
from tests.e2e.fixtures.misc import read_contract
from transaction_errors import (
    TransactionNotReceivedError,
    TransactionRejectedError,
    TransactionRevertedError,
)


@pytest.mark.asyncio
async def test_get_declare_transaction(
    client, declare_transaction_hash, class_hash, account
):
    transaction = await client.get_transaction(declare_transaction_hash)

    assert isinstance(transaction, DeclareTransactionV1)
    assert transaction.class_hash == class_hash
    assert transaction.hash == declare_transaction_hash
    assert transaction.sender_address == account.address


@pytest.mark.asyncio
async def test_get_invoke_transaction(
    client,
    invoke_transaction_hash,
):
    transaction = await client.get_transaction(invoke_transaction_hash)

    assert isinstance(transaction, InvokeTransactionV1)
    assert any(data == 1234 for data in transaction.calldata)
    assert transaction.hash == invoke_transaction_hash


@pytest.mark.asyncio
async def test_get_deploy_account_transaction(client, deploy_account_transaction_hash):
    transaction = await client.get_transaction(deploy_account_transaction_hash)

    assert isinstance(transaction, DeployAccountTransactionV1)
    assert transaction.hash == deploy_account_transaction_hash
    assert len(transaction.signature) > 0
    assert transaction.nonce == 0


@pytest.mark.asyncio
async def test_get_transaction_raises_on_not_received(client):
    with pytest.raises(
        TransactionNotReceivedError, match="Transaction was not received on Starknet."
    ):
        await client.get_transaction(tx_hash=0x9999)


@pytest.mark.asyncio
async def test_get_block_by_hash(
    client,
    block_with_declare_hash,
    block_with_declare_number,
):
    block = await client.get_block(block_hash=block_with_declare_hash)

    assert block.block_number == block_with_declare_number
    assert block.block_hash == block_with_declare_hash
    assert len(block.transactions) != 0


@pytest.mark.asyncio
async def test_get_block_by_number(
    client,
    block_with_declare_number,
    block_with_declare_hash,
):
    block = await client.get_block(block_number=block_with_declare_number)

    assert block.block_number == block_with_declare_number
    assert block.block_hash == block_with_declare_hash
    assert len(block.transactions) != 0


@pytest.mark.asyncio
async def test_get_storage_at(client, contract_address):
    storage = await client.get_storage_at(
        contract_address=contract_address,
        key=get_storage_var_address("balance"),
        block_hash="latest",
    )

    assert storage == 1234


@pytest.mark.asyncio
async def test_get_transaction_receipt(
    client, invoke_transaction_hash, block_with_invoke_number
):
    receipt = await client.get_transaction_receipt(tx_hash=invoke_transaction_hash)

    assert receipt.transaction_hash == invoke_transaction_hash
    assert receipt.block_number == block_with_invoke_number
    assert receipt.type == TransactionType.INVOKE


@pytest.mark.asyncio
async def test_estimate_fee_invoke(account, contract_address):
    invoke_tx = await account.sign_invoke_v1(
        calls=Call(
            to_addr=contract_address,
            selector=get_selector_from_name("increase_balance"),
            calldata=[123],
        ),
        max_fee=MAX_FEE,
    )
    invoke_tx = await account.sign_for_fee_estimate(invoke_tx)
    estimate_fee = await account.client.estimate_fee(tx=invoke_tx)

    assert isinstance(estimate_fee, EstimatedFee)
    assert estimate_fee.unit == PriceUnit.WEI
    assert estimate_fee.overall_fee > 0
    assert estimate_fee.gas_price > 0
    assert estimate_fee.gas_consumed > 0
    assert estimate_fee.data_gas_price > 0
    assert estimate_fee.data_gas_consumed > 0


@pytest.mark.asyncio
async def test_estimate_fee_invoke_v3(account, contract_address):
    invoke_tx = await account.sign_invoke_v3(
        calls=Call(
            to_addr=contract_address,
            selector=get_selector_from_name("increase_balance"),
            calldata=[123],
        ),
        l1_resource_bounds=ResourceBounds.init_with_zeros(),
    )
    invoke_tx = await account.sign_for_fee_estimate(invoke_tx)
    estimate_fee = await account.client.estimate_fee(tx=invoke_tx)

    assert isinstance(estimate_fee, EstimatedFee)
    assert estimate_fee.unit == PriceUnit.FRI
    assert estimate_fee.overall_fee > 0
    assert estimate_fee.gas_price > 0
    assert estimate_fee.gas_consumed > 0
    assert estimate_fee.data_gas_price > 0
    assert estimate_fee.data_gas_consumed > 0


@pytest.mark.asyncio
async def test_estimate_fee_declare(account):
    declare_tx = await account.sign_declare_v1(
        compiled_contract=read_contract(
            "map_compiled.json", directory=CONTRACTS_COMPILED_V0_DIR
        ),
        max_fee=MAX_FEE,
    )
    declare_tx = await account.sign_for_fee_estimate(declare_tx)
    estimate_fee = await account.client.estimate_fee(tx=declare_tx)

    assert isinstance(estimate_fee, EstimatedFee)
    assert estimate_fee.unit == PriceUnit.WEI
    assert estimate_fee.overall_fee > 0
    assert estimate_fee.gas_price > 0
    assert estimate_fee.gas_consumed > 0
    assert estimate_fee.data_gas_price > 0
    assert estimate_fee.data_gas_consumed > 0


@pytest.mark.asyncio
async def test_estimate_fee_deploy_account(client, deploy_account_transaction):
    estimate_fee = await client.estimate_fee(tx=deploy_account_transaction)

    assert isinstance(estimate_fee, EstimatedFee)
    assert estimate_fee.unit == PriceUnit.WEI
    assert estimate_fee.overall_fee > 0
    assert estimate_fee.gas_price > 0
    assert estimate_fee.gas_consumed > 0
    assert estimate_fee.data_gas_price > 0
    assert estimate_fee.data_gas_consumed > 0


@pytest.mark.asyncio
async def test_estimate_fee_for_multiple_transactions(
    client, deploy_account_transaction, contract_address, account
):
    invoke_tx = await account.sign_invoke_v1(
        calls=Call(
            to_addr=contract_address,
            selector=get_selector_from_name("increase_balance"),
            calldata=[123],
        ),
        max_fee=MAX_FEE,
    )
    invoke_tx = await account.sign_for_fee_estimate(invoke_tx)

    declare_tx = await account.sign_declare_v1(
        compiled_contract=read_contract(
            "map_compiled.json", directory=CONTRACTS_COMPILED_V0_DIR
        ),
        max_fee=MAX_FEE,
    )
    declare_tx = dataclasses.replace(declare_tx, nonce=invoke_tx.nonce + 1)
    declare_tx = await account.sign_for_fee_estimate(declare_tx)

    transactions = [invoke_tx, declare_tx, deploy_account_transaction]

    estimated_fees = await client.estimate_fee(tx=transactions, block_number="latest")

    assert isinstance(estimated_fees, list)

    for estimated_fee in estimated_fees:
        assert isinstance(estimated_fee, EstimatedFee)
        assert estimated_fee.unit == PriceUnit.WEI
        assert estimated_fee.overall_fee > 0
        assert estimated_fee.gas_price > 0
        assert estimated_fee.gas_consumed > 0
        assert estimated_fee.data_gas_price > 0
        assert estimated_fee.data_gas_consumed > 0


@pytest.mark.asyncio
async def test_call_contract(client, contract_address):
    call = Call(
        to_addr=contract_address,
        selector=get_selector_from_name("get_balance"),
        calldata=[],
    )

    result = await client.call_contract(call, block_number="latest")

    assert result == [1234]


@pytest.mark.asyncio
async def test_add_transaction(map_contract, client, account):
    prepared_function_call = map_contract.functions["put"].prepare_invoke_v1(
        key=73, value=12
    )
    signed_invoke = await account.sign_invoke_v1(
        calls=prepared_function_call, max_fee=MAX_FEE
    )

    result = await client.send_transaction(signed_invoke)
    await client.wait_for_tx(result.transaction_hash)
    transaction_receipt = await client.get_transaction_receipt(result.transaction_hash)

    assert transaction_receipt.execution_status == TransactionExecutionStatus.SUCCEEDED
    assert transaction_receipt.type == TransactionType.INVOKE


@pytest.mark.asyncio
async def test_get_class_hash_at(client, contract_address, class_hash):
    received_class_hash = await client.get_class_hash_at(
        contract_address=contract_address, block_hash="latest"
    )
    assert received_class_hash == class_hash


@pytest.mark.asyncio
async def test_get_class_by_hash(client, class_hash):
    contract_class = await client.get_class_by_hash(class_hash=class_hash)

    assert isinstance(contract_class, ContractClass)
    assert contract_class.program != ""
    assert contract_class.entry_points_by_type is not None
    assert contract_class.abi is not None


@pytest.mark.asyncio
async def test_wait_for_tx_accepted(client, get_tx_receipt_path, get_tx_status_path):
    with patch(
        get_tx_receipt_path,
        AsyncMock(),
    ) as mocked_receipt, patch(get_tx_status_path, AsyncMock()) as mocked_status:
        mocked_receipt.return_value = TransactionReceipt(
            transaction_hash=0x1,
            block_number=1,
            type=TransactionType.INVOKE,
            execution_status=TransactionExecutionStatus.SUCCEEDED,
            finality_status=TransactionFinalityStatus.ACCEPTED_ON_L2,
            execution_resources=Mock(spec=ExecutionResources),
            actual_fee=FeePayment(amount=1, unit=PriceUnit.WEI),
        )

        mocked_status.return_value = TransactionStatusResponse(
            finality_status=TransactionStatus.RECEIVED
        )

        tx_receipt = await client.wait_for_tx(tx_hash=0x1)
        assert tx_receipt.finality_status == TransactionFinalityStatus.ACCEPTED_ON_L2


@pytest.mark.asyncio
async def test_wait_for_tx_reverted(client, get_tx_receipt_path, get_tx_status_path):
    exc_message = "Unknown Starknet error"

    with patch(
        get_tx_receipt_path,
        AsyncMock(),
    ) as mocked_receipt, patch(get_tx_status_path, AsyncMock()) as mocked_status:
        mocked_receipt.return_value = TransactionReceipt(
            transaction_hash=0x1,
            block_number=1,
            type=TransactionType.INVOKE,
            execution_status=TransactionExecutionStatus.REVERTED,
            finality_status=Mock(spec=TransactionFinalityStatus),
            execution_resources=Mock(spec=ExecutionResources),
            revert_reason=exc_message,
            actual_fee=FeePayment(amount=1, unit=PriceUnit.WEI),
        )

        mocked_status.return_value = TransactionStatusResponse(
            finality_status=TransactionStatus.RECEIVED
        )

        with pytest.raises(TransactionRevertedError) as err:
            await client.wait_for_tx(tx_hash=0x1)

        assert exc_message in err.value.message


@pytest.mark.asyncio
async def test_wait_for_tx_rejected(client, get_tx_status_path):
    with patch(get_tx_status_path, AsyncMock()) as mocked_status:
        mocked_status.return_value = TransactionStatusResponse(
            finality_status=TransactionStatus.REJECTED
        )

        with pytest.raises(TransactionRejectedError):
            await client.wait_for_tx(tx_hash=0x1)


@pytest.mark.asyncio
async def test_wait_for_tx_unknown_error(
    client, get_tx_receipt_path, get_tx_status_path
):
    with patch(
        get_tx_receipt_path,
        AsyncMock(),
    ) as mocked_receipt, patch(get_tx_status_path, AsyncMock()) as mocked_status:
        mocked_receipt.side_effect = ClientError(message="Unknown error")
        mocked_status.return_value = TransactionStatusResponse(
            finality_status=TransactionStatus.RECEIVED
        )

        with pytest.raises(ClientError, match="Unknown error"):
            await client.wait_for_tx(tx_hash="0x2137")


@pytest.mark.asyncio
async def test_declare_contract(account, map_compiled_contract):
    declare_tx = await account.sign_declare_v1(
        compiled_contract=map_compiled_contract, max_fee=MAX_FEE
    )

    client = account.client
    result = await client.declare(declare_tx)
    await client.wait_for_tx(result.transaction_hash)
    transaction_receipt = await client.get_transaction_receipt(result.transaction_hash)

    assert transaction_receipt.execution_status == TransactionExecutionStatus.SUCCEEDED
    assert transaction_receipt.transaction_hash
    assert 0 < transaction_receipt.actual_fee.amount <= MAX_FEE
    assert transaction_receipt.type == TransactionType.DECLARE


@pytest.mark.asyncio
async def test_custom_session_client(map_contract, devnet):
    # We must access protected `_client` to test session
    # pylint: disable=protected-access

    session = ClientSession()

    tx_hash = (
        await (
            await map_contract.functions["put"].invoke_v1(
                key=10, value=20, max_fee=MAX_FEE
            )
        ).wait_for_acceptance()
    ).hash

    client1 = FullNodeClient(node_url=devnet + "/rpc", session=session)
    client2 = FullNodeClient(node_url=devnet + "/rpc", session=session)
    internal_client1 = client1._client
    internal_client2 = client2._client

    assert internal_client1.session is not None
    assert internal_client1.session == session
    assert internal_client1.session.closed is False
    assert internal_client2.session is not None
    assert internal_client2.session == session
    assert internal_client2.session.closed is False

    response1 = await client1.get_transaction_receipt(tx_hash=tx_hash)
    response2 = await client2.get_transaction_receipt(tx_hash=tx_hash)
    assert response1 == response2

    assert internal_client1.session.closed is False
    assert internal_client2.session.closed is False

    await session.close()

    assert internal_client1.session.closed is True
    assert internal_client2.session.closed is True


@pytest.mark.asyncio
async def test_get_l1_handler_transaction(client):
    with patch(
        f"{RpcHttpClient.__module__}.RpcHttpClient.call", AsyncMock()
    ) as mocked_transaction_call_rpc:
        return_value = {
            "status": "ACCEPTED_ON_L1",
            "block_hash": "0x38ce7678420eaff5cd62597643ca515d0887579a8be69563067fe79a624592b",
            "block_number": 370459,
            "transaction_index": 9,
            "transaction": {
                "version": "0x0",
                "contract_address": "0x278f24c3e74cbf7a375ec099df306289beb0605a346277d200b791a7f811a19",
                "entry_point_selector": "0x2d757788a8d8d6f21d1cd40bce38a8222d70654214e96ff95d8086e684fbee5",
                "nonce": "0x34c20",
                "calldata": [
                    "0xd8beaa22894cd33f24075459cfba287a10a104e4",
                    "0x3f9c67ef1d31e24b386184b4ede63a869c4659de093ef437ee235cae4daf2be",
                    "0x3635c9adc5dea00000",
                    "0x0",
                    "0x7cb4539b69a2371f75d21160026b76a7a7c1cacb",
                ],
                "transaction_hash": "0x7e1ed66dbccf915857c6367fc641c24292c063e54a5dd55947c2d958d94e1a9",
                "type": "L1_HANDLER",
            },
        }
        mocked_transaction_call_rpc.return_value = return_value["transaction"]

        transaction = await client.get_transaction(tx_hash=0x1)

        assert isinstance(transaction, L1HandlerTransaction)
        assert transaction.nonce is not None
        assert transaction.nonce == 0x34C20


# TODO (#1219): investigate why test fails in batch but passes when single run
@pytest.mark.skip
@pytest.mark.run_on_devnet
@pytest.mark.asyncio
async def test_state_update_declared_contract_hashes(
    client,
    block_with_declare_number,
    class_hash,
):
    state_update = await client.get_state_update(block_number=block_with_declare_number)

    assert class_hash in state_update.state_diff.deprecated_declared_classes


@pytest.mark.run_on_devnet
@pytest.mark.asyncio
async def test_state_update_storage_diffs(
    client,
    map_contract,
):
    resp = await map_contract.functions["put"].invoke_v1(
        key=10, value=20, max_fee=MAX_FEE
    )
    await resp.wait_for_acceptance()

    state_update = await client.get_state_update()

    assert len(state_update.state_diff.storage_diffs) != 0
    assert isinstance(state_update, PendingBlockStateUpdate)


@pytest.mark.run_on_devnet
@pytest.mark.asyncio
async def test_state_update_deployed_contracts(
    class_hash,
    account,
):
    # setup
    deployer = Deployer()
    contract_deployment = deployer.create_contract_deployment(class_hash=class_hash)
    deploy_invoke_tx = await account.sign_invoke_v1(
        contract_deployment.call, max_fee=MAX_FEE
    )
    resp = await account.client.send_transaction(deploy_invoke_tx)
    await account.client.wait_for_tx(resp.transaction_hash)

    # test
    state_update = await account.client.get_state_update()

    assert len(state_update.state_diff.deployed_contracts) != 0
    assert isinstance(state_update, PendingBlockStateUpdate)


@pytest.mark.asyncio
async def test_get_class_by_hash_sierra_program(
    client, cairo1_hello_starknet_class_hash: int
):
    contract_class = await client.get_class_by_hash(
        class_hash=cairo1_hello_starknet_class_hash
    )

    assert isinstance(contract_class.parsed_abi, list)
    assert isinstance(contract_class, SierraContractClass)
    assert contract_class.contract_class_version == "0.1.0"
    assert isinstance(contract_class.sierra_program, list)
    assert isinstance(contract_class.entry_points_by_type, SierraEntryPointsByType)
    assert isinstance(contract_class.abi, str)


@pytest.mark.asyncio
async def test_get_declare_v2_transaction(
    client,
    cairo1_hello_starknet_class_hash_tx_hash: Tuple[int, int],
    declare_v2_hello_starknet: DeclareV2,
):
    (class_hash, tx_hash) = cairo1_hello_starknet_class_hash_tx_hash

    transaction = await client.get_transaction(tx_hash=tx_hash)

    assert isinstance(transaction, DeclareTransactionV2)
    assert transaction == DeclareTransactionV2(
        class_hash=class_hash,
        compiled_class_hash=declare_v2_hello_starknet.compiled_class_hash,
        sender_address=declare_v2_hello_starknet.sender_address,
        hash=tx_hash,
        max_fee=declare_v2_hello_starknet.max_fee,
        signature=declare_v2_hello_starknet.signature,
        nonce=declare_v2_hello_starknet.nonce,
        version=declare_v2_hello_starknet.version,
    )


@pytest.mark.asyncio
async def test_get_block_with_declare_v2(
    client,
    cairo1_hello_starknet_class_hash_tx_hash: Tuple[int, int],
    declare_v2_hello_starknet: DeclareV2,
    block_with_declare_v2_number: int,
):
    (class_hash, tx_hash) = cairo1_hello_starknet_class_hash_tx_hash

    block = await client.get_block(block_number=block_with_declare_v2_number)

    assert (
        DeclareTransactionV2(
            class_hash=class_hash,
            compiled_class_hash=declare_v2_hello_starknet.compiled_class_hash,
            sender_address=declare_v2_hello_starknet.sender_address,
            hash=tx_hash,
            max_fee=declare_v2_hello_starknet.max_fee,
            signature=declare_v2_hello_starknet.signature,
            nonce=declare_v2_hello_starknet.nonce,
            version=declare_v2_hello_starknet.version,
        )
        in block.transactions
    )


# TODO (#1219): add assert for replaced_class once it is fixed in devnet
@pytest.mark.asyncio
async def test_get_new_state_update(
    client,
    cairo1_hello_starknet_class_hash: int,
    declare_v2_hello_starknet: DeclareV2,
    block_with_declare_v2_number: int,
):
    state_update_first = await client.get_state_update(
        block_number=block_with_declare_v2_number
    )
    assert state_update_first.state_diff.replaced_classes == []
    assert (
        DeclaredContractHash(
            class_hash=cairo1_hello_starknet_class_hash,
            compiled_class_hash=declare_v2_hello_starknet.compiled_class_hash,
        )
        in state_update_first.state_diff.declared_classes
    )
