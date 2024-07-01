import os

import pytest
import pytest_asyncio

from starkware.eth.eth_test_utils import EthTestUtils, eth_reverts
from starkware.starknet.public.abi import get_selector_from_name
from starkware.starknet.services.api.messages import StarknetMessageToL1, StarknetMessageToL2
from starkware.starknet.testing.contract import StarknetContract
from starkware.starknet.testing.contracts import MockStarknetMessaging
from starkware.starknet.testing.postman import Postman

CONTRACT_FILE = os.path.join(os.path.dirname(__file__), "test.cairo")


@pytest_asyncio.fixture
async def postman(eth_test_utils: EthTestUtils) -> Postman:
    return await Postman.create(eth_test_utils)


@pytest_asyncio.fixture
async def test_contract(postman: Postman) -> StarknetContract:
    declare_info = await postman.starknet.deprecated_declare(source=CONTRACT_FILE)
    return await postman.starknet.deploy(class_hash=declare_info.class_hash)


@pytest.mark.asyncio
async def test_postman_l1_to_l2_positive_flow(
    eth_test_utils: EthTestUtils, test_contract: StarknetContract, postman: Postman
):
    selector = get_selector_from_name("deposit")
    l1_address = int(eth_test_utils.accounts[0].address, 16)

    user1 = 31
    amount1 = 5
    payload1 = [user1, amount1]

    nonce = postman.mock_starknet_messaging_contract.l1ToL2MessageNonce.call()

    # Set fee as it is mandatory to be greater than 0.
    transact_args = {"value": 4}

    postman.mock_starknet_messaging_contract.sendMessageToL2.transact(
        test_contract.contract_address, selector, payload1, transact_args=transact_args
    )
    postman.mock_starknet_messaging_contract.sendMessageToL2.transact(
        test_contract.contract_address, selector, payload1, transact_args=transact_args
    )

    msg_hashes = [
        StarknetMessageToL2(
            from_address=l1_address,
            to_address=test_contract.contract_address,
            l1_handler_selector=selector,
            payload=payload1,
            nonce=nonce + i,
        ).get_hash()
        for i in range(2)
    ]

    for msg_hash in msg_hashes:
        assert (
            postman.mock_starknet_messaging_contract.l1ToL2Messages.call(msg_hash)
            == transact_args["value"] + 1
        )
    await postman.flush()
    for msg_hash in msg_hashes:
        assert postman.mock_starknet_messaging_contract.l1ToL2Messages.call(msg_hash) == 0

    execution_info = await test_contract.get_value(user1).execute()
    assert execution_info.result == (2 * amount1,)

    user2 = 47
    amount2 = 7
    payload2 = [user2, amount2]

    nonce += 2
    assert nonce == postman.mock_starknet_messaging_contract.l1ToL2MessageNonce.call()
    postman.mock_starknet_messaging_contract.sendMessageToL2.transact(
        test_contract.contract_address, selector, payload2, transact_args=transact_args
    )

    msg_hash2 = StarknetMessageToL2(
        from_address=l1_address,
        to_address=test_contract.contract_address,
        l1_handler_selector=selector,
        payload=payload2,
        nonce=nonce,
    ).get_hash()

    assert (
        postman.mock_starknet_messaging_contract.l1ToL2Messages.call(msg_hash2)
        == transact_args["value"] + 1
    )
    await postman.flush()
    assert postman.mock_starknet_messaging_contract.l1ToL2Messages.call(msg_hash2) == 0

    execution_info = await test_contract.get_value(user2).execute()
    assert execution_info.result == (amount2,)


@pytest.mark.asyncio
async def test_postman_l1_to_l2_another_mock_starknet_messaging_contract(
    postman: Postman, eth_test_utils: EthTestUtils
):
    # Set fee as it is mandatory to be greater than 0.
    transact_args = {"value": 4}

    other_messaging_contract = eth_test_utils.accounts[0].deploy(MockStarknetMessaging, 0)
    INVALID_L2_ADDRESS = 0
    INVALID_SELECTOR = 2
    # This message is sent into another StarknetMessaging contract and therefore shouldn't be
    # proccessed by postman. If it will be proccessed the test will fail because the address and
    # selector are invalid.
    other_messaging_contract.sendMessageToL2.transact(
        INVALID_L2_ADDRESS, INVALID_SELECTOR, [3, 4], transact_args=transact_args
    )
    await postman.flush()


@pytest.mark.asyncio
async def test_postman_l2_to_l1_positive_flow(
    test_contract: StarknetContract, postman: Postman, eth_test_utils: EthTestUtils
):
    l1_address = int(eth_test_utils.accounts[0].address, 16)

    payload1 = [1, 2, 3]
    await test_contract.send_message(to_address=l1_address, payload=payload1).execute()
    await test_contract.send_message(to_address=l1_address, payload=payload1).execute()

    msg_hash1 = StarknetMessageToL1(
        from_address=test_contract.contract_address,
        to_address=l1_address,
        payload=payload1,
    ).get_hash()

    assert postman.mock_starknet_messaging_contract.l2ToL1Messages.call(msg_hash1) == 0
    await postman.flush()
    assert postman.mock_starknet_messaging_contract.l2ToL1Messages.call(msg_hash1) == 2

    postman.mock_starknet_messaging_contract.consumeMessageFromL2.transact(
        test_contract.contract_address, payload1
    )
    postman.mock_starknet_messaging_contract.consumeMessageFromL2.transact(
        test_contract.contract_address, payload1
    )
    assert postman.mock_starknet_messaging_contract.l2ToL1Messages.call(msg_hash1) == 0

    with eth_reverts("INVALID_MESSAGE_TO_CONSUME"):
        postman.mock_starknet_messaging_contract.consumeMessageFromL2.transact(
            test_contract.contract_address, payload1
        )

    payload2 = [4, 5]
    await test_contract.send_message(to_address=l1_address, payload=payload2).execute()

    msg_hash2 = StarknetMessageToL1(
        from_address=test_contract.contract_address,
        to_address=l1_address,
        payload=payload2,
    ).get_hash()

    assert postman.mock_starknet_messaging_contract.l2ToL1Messages.call(msg_hash2) == 0
    await postman.flush()
    assert postman.mock_starknet_messaging_contract.l2ToL1Messages.call(msg_hash1) == 0
    assert postman.mock_starknet_messaging_contract.l2ToL1Messages.call(msg_hash2) == 1
