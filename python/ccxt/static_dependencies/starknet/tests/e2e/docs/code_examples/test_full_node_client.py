# pylint: disable=unused-variable
import pytest

from contract import Contract
from hash.selector import get_selector_from_name
from hash.storage import get_storage_var_address
from net.client_models import Call
from net.full_node_client import FullNodeClient


def test_init():
    # docs-start: init
    client = FullNodeClient(node_url="https://your.node.url")
    # docs-end: init


@pytest.mark.asyncio
async def test_get_block(client, block_with_declare_hash):
    # docs-start: get_block
    block = await client.get_block(block_number="latest")
    block = await client.get_block(block_number=0)
    # or
    block_hash = "0x0"
    # docs-end: get_block
    block_hash = block_with_declare_hash
    # docs-start: get_block
    block = await client.get_block(block_hash=block_hash)
    # docs-end: get_block


@pytest.mark.asyncio
async def test_get_state_update(
    client, declare_transaction_hash
):  # pylint: disable=unused-argument
    # parameter `declare_transaction_hash` is needed because devnet blockchain is empty without it
    # and methods return invalid data

    # docs-start: get_state_update
    state_update = await client.get_state_update(block_number="latest")
    state_update = await client.get_state_update(block_number=1)
    # or
    block_hash = "0x0"
    # docs-end: get_state_update
    block_hash = state_update.block_hash
    # docs-start: get_state_update
    state_update = await client.get_state_update(block_hash=block_hash)
    # docs-end: get_state_update


@pytest.mark.asyncio
async def test_get_storage_at(client, map_contract):
    address = map_contract.address
    # docs-start: get_storage_at
    storage_value = await client.get_storage_at(
        contract_address=address,
        key=get_storage_var_address("storage_var name"),
        block_number="latest",
    )
    # docs-end: get_storage_at


@pytest.mark.asyncio
async def test_get_transaction(client, declare_transaction_hash):
    # docs-start: get_transaction
    transaction_hash = 0x1 or 1 or "0x1"
    # docs-end: get_transaction
    transaction_hash = declare_transaction_hash
    # docs-start: get_transaction
    transaction = await client.get_transaction(tx_hash=transaction_hash)
    # docs-end: get_transaction


@pytest.mark.asyncio
async def test_get_transaction_receipt(client, declare_transaction_hash):
    transaction_hash = declare_transaction_hash
    # docs-start: get_transaction_receipt
    transaction_receipt = await client.get_transaction_receipt(tx_hash=transaction_hash)
    # docs-end: get_transaction_receipt


@pytest.mark.asyncio
async def test_estimate_fee(client, deploy_account_transaction):
    transaction = deploy_account_transaction
    # docs-start: estimate_fee
    # a single transaction
    estimated_fee = await client.estimate_fee(tx=transaction)
    # or a list of transactions
    estimated_fee = await client.estimate_fee(tx=[transaction])
    # docs-end: estimate_fee


@pytest.mark.asyncio
async def test_call_contract(client, contract_address):
    # docs-start: call_contract
    response = await client.call_contract(
        call=Call(
            to_addr=contract_address,
            selector=get_selector_from_name("increase_balance"),
            calldata=[123],
        ),
        block_number="latest",
    )
    # docs-end: call_contract


@pytest.mark.asyncio
async def test_get_class_hash_at(client, contract_address):
    # docs-start: get_class_hash_at
    address = 0x1 or 1 or "0x1"
    # docs-end: get_class_hash_at
    address = contract_address
    # docs-start: get_class_hash_at
    class_hash = await client.get_class_hash_at(
        contract_address=address, block_number="latest"
    )
    # docs-end: get_class_hash_at


@pytest.mark.asyncio
async def test_get_class_by_hash(client, class_hash):
    # docs-start: get_class_by_hash
    hash_ = 0x1 or 1 or "0x1"
    # docs-end: get_class_by_hash
    hash_ = class_hash
    # docs-start: get_class_by_hash
    contract_class = await client.get_class_by_hash(class_hash=hash_)
    # docs-end: get_class_by_hash


@pytest.mark.asyncio
async def test_get_transaction_by_block_id(client):
    # docs-start: get_transaction_by_block_id
    transaction = await client.get_transaction_by_block_id(
        index=0, block_number="latest"
    )
    # docs-end: get_transaction_by_block_id


@pytest.mark.asyncio
async def test_get_block_transaction_count(client):
    # docs-start: get_block_transaction_count
    num_of_transactions = await client.get_block_transaction_count(
        block_number="latest"
    )
    # docs-end: get_block_transaction_count


@pytest.mark.asyncio
async def test_get_class_at(client, contract_address):
    # docs-start: get_class_at
    address = 0x1 or 1 or "0x1"
    # docs-end: get_class_at
    address = contract_address
    # docs-start: get_class_at
    contract_class = await client.get_class_at(
        contract_address=address, block_number="latest"
    )
    # docs-end: get_class_at


@pytest.mark.asyncio
async def test_get_contract_nonce(client, contract_address):
    # docs-start: get_contract_nonce
    address = 0x1 or 1 or "0x1"
    # docs-end: get_contract_nonce
    address = contract_address
    # docs-start: get_contract_nonce
    nonce = await client.get_contract_nonce(
        contract_address=address, block_number="latest"
    )
    # docs-end: get_contract_nonce


@pytest.mark.asyncio
async def test_get_events(client, contract_address):
    # docs-start: get_events
    address = 0x1 or 1 or "0x1"
    # docs-end: get_events
    address = contract_address
    # docs-start: get_events
    events_response = await client.get_events(
        address=address,
        keys=[[1, 2], [], [3]],
        from_block_number=0,
        to_block_number="latest",
        follow_continuation_token=True,
        chunk_size=47,
    )
    # docs-end: get_events


# TODO (#1219): fix that after update to RPC to v0.6.0
@pytest.mark.xfail(
    reason="Passing devnet client without implemented methods - test simply for a code example."
)
@pytest.mark.asyncio
async def test_trace_block_transactions(client):
    # docs-start: trace_block_transactions
    block_number = 800002
    block_transaction_traces = await client.trace_block_transactions(
        block_number=block_number
    )
    # docs-end: trace_block_transactions


# TODO (#1219): fix that after update to RPC to v0.6.0
@pytest.mark.xfail(
    reason="Passing devnet client without implemented methods - test simply for a code example."
)
@pytest.mark.asyncio
async def test_trace_transaction(client):
    # docs-start: trace_transaction
    transaction_hash = "0x123"
    # docs-end: trace_transaction
    transaction_hash = (
        "0x31e9adddefb28fab4d2ef9a6907e5805f5f793f5198618119a5347e6fc4af57"
    )
    # docs-start: trace_transaction
    transaction_trace = await client.trace_transaction(tx_hash=transaction_hash)
    # docs-end: trace_transaction


@pytest.mark.asyncio
async def test_simulate_transactions(
    account, deployed_balance_contract, deploy_account_transaction
):
    assert isinstance(deployed_balance_contract, Contract)
    contract_address = deployed_balance_contract.address
    second_transaction = deploy_account_transaction
    # docs-start: simulate_transactions
    call = Call(
        to_addr=contract_address,
        selector=get_selector_from_name("method_name"),
        calldata=[0xCA11DA7A],
    )
    first_transaction = await account.sign_invoke_v1(calls=call, max_fee=int(1e16))
    # docs-end: simulate_transactions

    call = Call(
        to_addr=deployed_balance_contract.address,
        selector=get_selector_from_name("increase_balance"),
        calldata=[0x10],
    )
    first_transaction = await account.sign_invoke_v1(calls=call, auto_estimate=True)

    # docs-start: simulate_transactions
    # one transaction
    simulated_txs = await account.client.simulate_transactions(
        transactions=[first_transaction], block_number="latest"
    )
    # or multiple
    simulated_txs = await account.client.simulate_transactions(
        transactions=[first_transaction, second_transaction], block_number="latest"
    )
    # docs-end: simulate_transactions
