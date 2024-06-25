import dataclasses
import sys

import pytest

from hash.selector import get_selector_from_name
from net.client_errors import ClientError
from net.client_models import (
    BlockHeader,
    BlockStatus,
    Call,
    DAMode,
    DeclareTransactionV3,
    DeployAccountTransactionV3,
    EmittedEvent,
    EstimatedFee,
    EventsChunk,
    InvokeTransactionV3,
    PendingBlockHeader,
    PendingStarknetBlockWithReceipts,
    ResourceBoundsMapping,
    StarknetBlockWithReceipts,
    TransactionExecutionStatus,
    TransactionFinalityStatus,
    TransactionReceipt,
    TransactionStatus,
)
from net.models import StarknetChainId
from net.networks import SEPOLIA, default_token_address_for_network
from tests.e2e.fixtures.constants import EMPTY_CONTRACT_ADDRESS_SEPOLIA
from transaction_errors import TransactionRevertedError


@pytest.mark.parametrize(
    "transaction_hash",
    (
        "0x016df225d14eb927b1c85ec85d2f9f4fc7653ba13a99e30ffe9e21c96ddc7a6d",  # invoke
        "0x0255f63b1dbd52902e2fb5707d2d2b52d5600fa228f0655b02b78bfcf9cab353",  # declare
        "0x0379c52f40fad2d94152d7c924b69cd61a99cf45b85ba9cb836f69026db67af8",  # deploy_account
        "0x06098d74f3fe1b2b96dcfbb3b9ca9be0c396bde0a0825e111fcbefec9c34fcc6",  # l1_handler
    ),
)
@pytest.mark.asyncio
async def test_get_transaction_receipt(client_sepolia_testnet, transaction_hash):
    receipt = await client_sepolia_testnet.get_transaction_receipt(
        tx_hash=transaction_hash
    )

    assert isinstance(receipt, TransactionReceipt)
    assert receipt.execution_status is not None
    assert receipt.finality_status is not None
    assert receipt.execution_resources is not None
    assert receipt.type is not None


@pytest.mark.asyncio
async def test_wait_for_tx_reverted(account_sepolia_testnet):
    account = account_sepolia_testnet
    # Calldata too long for the function (it has no parameters) to trigger REVERTED status
    call = Call(
        to_addr=int(EMPTY_CONTRACT_ADDRESS_SEPOLIA, 0),
        selector=get_selector_from_name("empty"),
        calldata=[0x1, 0x2, 0x3, 0x4, 0x5],
    )
    sign_invoke = await account.sign_invoke_v1(calls=call, max_fee=int(1e16))
    invoke = await account.client.send_transaction(sign_invoke)

    with pytest.raises(TransactionRevertedError, match="Input too long for arguments"):
        await account.client.wait_for_tx(tx_hash=invoke.transaction_hash)


@pytest.mark.asyncio
async def test_wait_for_tx_accepted(account_sepolia_testnet):
    account = account_sepolia_testnet
    call = Call(
        to_addr=int(EMPTY_CONTRACT_ADDRESS_SEPOLIA, 0),
        selector=get_selector_from_name("empty"),
        calldata=[],
    )
    sign_invoke = await account.sign_invoke_v1(calls=call, max_fee=int(1e16))
    invoke = await account.client.send_transaction(sign_invoke)

    result = await account.client.wait_for_tx(tx_hash=invoke.transaction_hash)

    assert result.execution_status == TransactionExecutionStatus.SUCCEEDED
    assert result.finality_status == TransactionFinalityStatus.ACCEPTED_ON_L2


@pytest.mark.asyncio
async def test_transaction_not_received_max_fee_too_small(account_sepolia_testnet):
    account = account_sepolia_testnet
    call = Call(
        to_addr=int(EMPTY_CONTRACT_ADDRESS_SEPOLIA, 0),
        selector=get_selector_from_name("empty"),
        calldata=[],
    )
    sign_invoke = await account.sign_invoke_v1(calls=call, max_fee=int(1e10))

    with pytest.raises(ClientError, match=r".*MaxFeeTooLow.*"):
        await account.client.send_transaction(sign_invoke)


@pytest.mark.asyncio
async def test_transaction_not_received_max_fee_too_big(account_sepolia_testnet):
    account = account_sepolia_testnet
    call = Call(
        to_addr=int(EMPTY_CONTRACT_ADDRESS_SEPOLIA, 0),
        selector=get_selector_from_name("empty"),
        calldata=[],
    )
    sign_invoke = await account.sign_invoke_v1(calls=call, max_fee=sys.maxsize)

    with pytest.raises(ClientError, match=r".*max_fee.*"):
        await account.client.send_transaction(sign_invoke)


@pytest.mark.asyncio
async def test_transaction_not_received_invalid_nonce(account_sepolia_testnet):
    account = account_sepolia_testnet
    call = Call(
        to_addr=int(EMPTY_CONTRACT_ADDRESS_SEPOLIA, 0),
        selector=get_selector_from_name("empty"),
        calldata=[],
    )
    sign_invoke = await account.sign_invoke_v1(calls=call, max_fee=int(1e16), nonce=0)

    with pytest.raises(ClientError, match=r".*nonce.*"):
        await account.client.send_transaction(sign_invoke)


@pytest.mark.asyncio
async def test_transaction_not_received_invalid_signature(account_sepolia_testnet):
    account = account_sepolia_testnet
    call = Call(
        to_addr=int(EMPTY_CONTRACT_ADDRESS_SEPOLIA, 0),
        selector=get_selector_from_name("empty"),
        calldata=[],
    )
    sign_invoke = await account.sign_invoke_v1(calls=call, max_fee=int(1e16))
    sign_invoke = dataclasses.replace(sign_invoke, signature=[0x21, 0x37])
    with pytest.raises(
        ClientError,
        match=r"Account validation failed",
    ) as exc:
        await account.client.send_transaction(sign_invoke)

    assert exc.value.data is not None
    assert "Data:" in exc.value.message


# TODO (#1219): move tests below to full_node_test.py
@pytest.mark.asyncio
async def test_estimate_message_fee(client_sepolia_testnet):
    client = client_sepolia_testnet
    # info about this message from
    # https://sepolia.starkscan.co/message-log/0x061e8c5211c705d0ab608e42f181edf4ef9ae891b3e568a6fe1c3b83076eefc2_0_1
    estimated_message = await client.estimate_message_fee(
        from_address="0x18e4a8e2badb5f5950758f46f8108e2c5d357b07",
        block_number=51569,
        to_address="0x054f677f3e952d023e2f31d74606270b676eaf493befbcfa2111f2b96a242362",
        entry_point_selector="0x03fa70707d0e831418fb142ca8fb7483611b84e89c0c42bf1fc2a7a5c40890ad",
        payload=[
            "0x1b0b3ddfc5264c441c9eee709011a863",
            "0xfbe265a54523fc9070e26bfc5aa145ab",
            "0x5469d9",
            "0x0",
        ],
    )

    assert isinstance(estimated_message, EstimatedFee)
    assert estimated_message.overall_fee > 0
    assert estimated_message.gas_price > 0
    assert estimated_message.gas_consumed > 0
    assert estimated_message.data_gas_price > 0
    assert estimated_message.data_gas_consumed >= 0
    assert estimated_message.unit is not None


@pytest.mark.asyncio
async def test_estimate_message_fee_invalid_eth_address_assertion_error(
    client_sepolia_testnet,
):
    client = client_sepolia_testnet
    invalid_eth_address = "0xD"

    # info about this transaction from
    # https://sepolia.starkscan.co/tx/0x07041ce61b01f677ef05391ae1db043d0ea8b96309574ddcf90e7f59ec7d76d6
    with pytest.raises(
        AssertionError,
        match=f"Argument 'from_address': {invalid_eth_address} is not a valid Ethereum address.",
    ):
        _ = await client.estimate_message_fee(
            from_address=invalid_eth_address,
            block_number=51569,
            to_address="0x054f677f3e952d023e2f31d74606270b676eaf493befbcfa2111f2b96a242362",
            entry_point_selector="0x03fa70707d0e831418fb142ca8fb7483611b84e89c0c42bf1fc2a7a5c40890ad",
            payload=[
                "0x1b0b3ddfc5264c441c9eee709011a863",
                "0xfbe265a54523fc9070e26bfc5aa145ab",
                "0x5469d9",
                "0x0",
            ],
        )


@pytest.mark.parametrize(
    "from_address, to_address",
    (
        (
            "0xbe1259ff905cadbbaa62514388b71bdefb8aacc1",
            "0x2137",
        ),  # valid `from_address`, invalid `to_address`
        (
            "0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
            "0x073314940630fd6dcda0d772d4c972c4e0a9946bef9dabf4ef84eda8ef542b82",
        ),  # invalid `from_address` (passes through assert), valid `to_address`
    ),
)
@pytest.mark.asyncio
async def test_estimate_message_fee_throws(
    client_sepolia_integration, from_address, to_address
):
    client = client_sepolia_integration

    with pytest.raises(ClientError):
        _ = await client.estimate_message_fee(
            block_number=123123,
            from_address=from_address,
            to_address=to_address,
            entry_point_selector="0x3248",
            payload=[
                "0x4359",
            ],
        )


@pytest.mark.asyncio
async def test_get_tx_receipt_reverted(client_sepolia_integration):
    client = client_sepolia_integration
    reverted_tx_hash = (
        "0x01b2d9e5a725069ae40e3149813ffe05b8c4405e253e9f8ab29d0a3b2e279927"
    )

    res = await client.get_transaction_receipt(tx_hash=reverted_tx_hash)

    assert res.execution_status == TransactionExecutionStatus.REVERTED
    assert res.finality_status == TransactionFinalityStatus.ACCEPTED_ON_L1
    assert "Got an exception while executing a hint" in res.revert_reason


@pytest.mark.parametrize(
    "block_number, transaction_index",
    [
        # declare: https://integration-sepolia.starkscan.co/tx/0x0544a629990d2bed8ccf11910b30f2f1e18228ed5be06660bea20cae13b2aced
        (9707, 0),
        # deploy_account: https://integration-sepolia.starkscan.co/tx/0x012debae2435ea43c06610a31ccf8e7ea5de9aec43dac7c7aa86905b4ccdec49
        (9708, 6),
        # invoke: https://integration-sepolia.starkscan.co/tx/0x069125fd85a199a5d06445e1ece5067781aa46c745e3e2993c696c60bbd5992c
        (9708, 0),
        # l1_handler: https://integration-sepolia.starkscan.co/tx/0x0117be3e303704f0acb630149250a78a262ecff8bef3ee8a53a02f18b472f873
        (9708, 7),
    ],
)
@pytest.mark.asyncio
async def test_get_transaction_by_block_id_and_index(
    client_sepolia_integration, block_number, transaction_index
):
    client = client_sepolia_integration

    tx = await client.get_transaction_by_block_id(
        block_number=block_number, index=transaction_index
    )

    assert tx.hash is not None

    receipt = await client.get_transaction_receipt(tx_hash=tx.hash)

    assert receipt.finality_status is not None
    assert receipt.execution_status is not None


@pytest.mark.asyncio
async def test_get_block(client_sepolia_integration):
    client = client_sepolia_integration
    res = await client.get_block(block_number="latest")

    for tx in res.transactions:
        assert tx.hash is not None


@pytest.mark.asyncio
async def test_get_l1_message_hash(client_sepolia_integration):
    tx_hash = "0x065b2b6543e49f2f8a22541e9141f506752d984b4d8c690526001025109cee30"
    l1_message_hash = await client_sepolia_integration.get_l1_message_hash(tx_hash)
    assert (
        hex(l1_message_hash)
        == "0x4aed43247e106a0687258bfc835131e5dee15c24fb18222d382dbff470df0f9e"
    )


@pytest.mark.asyncio
async def test_get_l1_message_hash_raises_on_incorrect_transaction_type(
    client_sepolia_integration,
):
    tx_hash = "0x044a5565cde76c445db6205d208f584879d9e6e8f8b6b2ebb58e658680320cfa"
    with pytest.raises(
        TypeError, match=f"Transaction {tx_hash} is not a result of L1->L2 interaction."
    ):
        await client_sepolia_integration.get_l1_message_hash(tx_hash)


@pytest.mark.asyncio
async def test_spec_version(client_sepolia_testnet):
    spec_version = await client_sepolia_testnet.spec_version()

    assert spec_version is not None
    assert isinstance(spec_version, str)


@pytest.mark.asyncio
async def test_get_transaction_status(client_sepolia_testnet):
    tx_status = await client_sepolia_testnet.get_transaction_status(
        tx_hash=0x06BF304EFEF9D0D28161C69A4660FA8AC769118A81FACE53BC8EA165BBB3F86F
    )

    assert tx_status.finality_status == TransactionStatus.ACCEPTED_ON_L1
    assert tx_status.execution_status == TransactionExecutionStatus.SUCCEEDED


@pytest.mark.asyncio
async def test_get_block_new_header_fields(client_sepolia_testnet):
    # testing l1_gas_price and starknet_version fields
    block = await client_sepolia_testnet.get_block_with_txs(block_number=155)

    assert block.starknet_version is not None
    assert block.l1_gas_price is not None
    assert block.l1_gas_price.price_in_wei > 0

    pending_block = await client_sepolia_testnet.get_block_with_txs(
        block_number="pending"
    )

    assert pending_block.starknet_version is not None
    assert pending_block.l1_gas_price is not None
    assert pending_block.l1_gas_price.price_in_wei > 0


@pytest.mark.asyncio
async def test_get_block_with_tx_hashes_new_header_fields(client_sepolia_testnet):
    # testing l1_gas_price and starknet_version fields
    block = await client_sepolia_testnet.get_block_with_tx_hashes(block_number=155)

    assert block.starknet_version is not None
    assert block.l1_gas_price is not None
    assert block.l1_gas_price.price_in_wei > 0

    pending_block = await client_sepolia_testnet.get_block_with_tx_hashes(
        block_number="pending"
    )

    assert pending_block.starknet_version is not None
    assert pending_block.l1_gas_price is not None
    assert pending_block.l1_gas_price.price_in_wei > 0


@pytest.mark.parametrize(
    "tx_hash, tx_type",
    [
        (
            0x054270D103C875A613E013D1FD555EDCFF2085FECA9D7B4532243A8257FD5CF3,
            DeclareTransactionV3,
        ),
        (
            0x06718B783A0B888F5421C4EB76A532FEB9FD5167B2B09274298F79798C782B32,
            DeployAccountTransactionV3,
        ),
        (
            0x043868D939FA1B62B977FFFC659146688E954BBABEDA020CC99BAE1C220E4882,
            InvokeTransactionV3,
        ),
    ],
)
@pytest.mark.asyncio
async def test_get_transaction_v3(client_sepolia_testnet, tx_hash, tx_type):
    tx = await client_sepolia_testnet.get_transaction(tx_hash=tx_hash)
    assert isinstance(tx, tx_type)
    assert tx.version == 3
    assert isinstance(tx.resource_bounds, ResourceBoundsMapping)
    assert tx.paymaster_data == []
    assert tx.tip == 0
    assert tx.nonce_data_availability_mode == DAMode.L1
    assert tx.fee_data_availability_mode == DAMode.L1


@pytest.mark.asyncio
async def test_get_chain_id_sepolia_testnet(client_sepolia_testnet):
    chain_id = await client_sepolia_testnet.get_chain_id()
    assert isinstance(chain_id, str)
    assert chain_id == hex(StarknetChainId.SEPOLIA.value)


@pytest.mark.asyncio
async def test_get_chain_id_sepolia_integration(client_sepolia_integration):
    chain_id = await client_sepolia_integration.get_chain_id()
    assert isinstance(chain_id, str)
    assert chain_id == hex(StarknetChainId.SEPOLIA_INTEGRATION.value)


@pytest.mark.asyncio
async def test_get_events_sepolia_testnet(client_sepolia_testnet):
    events_chunk = await client_sepolia_testnet.get_events(
        address=default_token_address_for_network(SEPOLIA),
        from_block_number=1000,
        to_block_number=1005,
        chunk_size=10,
    )
    assert isinstance(events_chunk, EventsChunk)
    assert len(events_chunk.events) == 10
    assert events_chunk.continuation_token is not None
    assert isinstance(events_chunk.events[0], EmittedEvent)
    assert events_chunk.events[0].block_number == 1000
    assert events_chunk.events[0].block_hash is not None
    assert events_chunk.events[0].from_address is not None
    assert events_chunk.events[0].data is not None
    assert events_chunk.events[0].keys is not None


@pytest.mark.asyncio
async def test_get_tx_receipt_with_execution_resources(client_sepolia_integration):
    receipt = await client_sepolia_integration.get_transaction_receipt(
        tx_hash=0x077E84B7C0C4CC88B778EEAEF32B7CED4500FE4AAEE62FD2F849B7DD90A87826
    )

    assert receipt.execution_resources is not None
    assert receipt.execution_resources.data_availability is not None
    assert receipt.execution_resources.steps is not None
    assert receipt.execution_resources.bitwise_builtin_applications is not None
    assert receipt.execution_resources.ec_op_builtin_applications is not None
    assert receipt.execution_resources.pedersen_builtin_applications is not None
    assert receipt.execution_resources.range_check_builtin_applications is not None


@pytest.mark.asyncio
async def test_get_block_with_receipts(client_sepolia_testnet):
    block_with_receipts = await client_sepolia_testnet.get_block_with_receipts(
        block_number=48778
    )

    assert isinstance(block_with_receipts, StarknetBlockWithReceipts)
    assert block_with_receipts.status == BlockStatus.ACCEPTED_ON_L1
    assert len(block_with_receipts.transactions) == 43
    assert all(
        getattr(block_with_receipts, field.name) is not None
        for field in dataclasses.fields(BlockHeader)
    )


@pytest.mark.asyncio
async def test_get_pending_block_with_receipts(client_sepolia_integration):
    block_with_receipts = await client_sepolia_integration.get_block_with_receipts(
        block_number="pending"
    )

    assert isinstance(block_with_receipts, PendingStarknetBlockWithReceipts)
    assert len(block_with_receipts.transactions) >= 0
    assert all(
        getattr(block_with_receipts, field.name) is not None
        for field in dataclasses.fields(PendingBlockHeader)
    )
