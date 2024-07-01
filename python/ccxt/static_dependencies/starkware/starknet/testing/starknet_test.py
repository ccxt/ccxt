import os
import re

import pytest
import pytest_asyncio

from starkware.cairo.lang.compiler.preprocessor.preprocessor_error import PreprocessorError
from starkware.starknet.compiler.compile import compile_starknet_files
from starkware.starknet.compiler.v1.compile import compile_cairo_to_sierra
from starkware.starknet.services.api.contract_class.contract_class import DeprecatedCompiledClass
from starkware.starknet.testing.contract import StarknetContract
from starkware.starknet.testing.starknet import Starknet

CONTRACT_FILE = os.path.join(os.path.dirname(__file__), "test.cairo")
HINT_CONTRACT_FILE = os.path.join(os.path.dirname(__file__), "test_unwhitelisted_hint.cairo")
TEST_CAIRO1_FILE = os.path.join(os.path.dirname(__file__), "test_cairo1.cairo")


@pytest_asyncio.fixture
async def starknet() -> Starknet:
    return await Starknet.empty()


@pytest.fixture(scope="session")
def contract_class() -> DeprecatedCompiledClass:
    return compile_starknet_files(files=[CONTRACT_FILE])


@pytest_asyncio.fixture
async def class_hash(starknet: Starknet, contract_class: DeprecatedCompiledClass) -> int:
    declare_info = await starknet.deprecated_declare(contract_class=contract_class)
    return declare_info.class_hash


@pytest_asyncio.fixture
async def contract(starknet: Starknet, class_hash: int) -> StarknetContract:
    return await starknet.deploy(class_hash=class_hash)


@pytest.mark.asyncio
async def test_basic(starknet: Starknet, contract: StarknetContract):
    call_info = await contract.increase_value(address=100, value=5).execute()
    assert call_info.result == ()
    call_info = await contract.get_value(address=100).call()
    assert call_info.result == (5,)

    # Check caller address.
    call_info = await contract.get_caller().execute()
    assert call_info.result == (0,)
    call_info = await contract.get_caller().execute(caller_address=1234)
    assert call_info.result == (1234,)


@pytest.mark.asyncio
async def test_l2_to_l1_message(starknet: Starknet, contract: StarknetContract):
    l1_address = int("0xce08635cc6477f3634551db7613cc4f36b4e49dc", 16)
    payload = [6, 28]
    await contract.send_message(to_address=l1_address, payload=payload).execute()

    # Consume the message.
    starknet.consume_message_from_l2(
        from_address=contract.contract_address, to_address=l1_address, payload=payload
    )

    # Try to consume the message again; should fail.
    with pytest.raises(AssertionError):
        starknet.consume_message_from_l2(
            from_address=contract.contract_address, to_address=l1_address, payload=payload
        )


@pytest.mark.asyncio
async def test_l1_to_l2_message(starknet: Starknet, contract: StarknetContract):
    l1_address = int("0xce08635cc6477f3634551db7613cc4f36b4e49dc", 16)
    user = 6
    amount = 28

    # Send message to L2: Deposit 28 to user 6.
    await starknet.send_message_to_l2(
        from_address=l1_address,
        to_address=contract.contract_address,
        selector="deposit",
        payload=[user, amount],
    )
    execution_info = await contract.get_value(address=user).execute()
    assert execution_info.result == (28,)


@pytest.mark.asyncio
async def test_contract_interaction(starknet: Starknet, class_hash: int):
    contract = await starknet.deploy(class_hash=class_hash)
    proxy_contract = await starknet.deploy(class_hash=class_hash)

    await proxy_contract.call_increase_value(contract.contract_address, 123, 234).execute()
    assert (await proxy_contract.get_value(123).execute()).result == (0,)
    assert (await contract.get_value(123).execute()).result == (234,)


@pytest.mark.asyncio
async def test_struct_arrays(starknet: Starknet, class_hash: int):
    contract = await starknet.deploy(class_hash=class_hash)
    assert (await contract.transpose([(123, 234), (4, 5)]).execute()).result == (
        [
            contract.Point(x=123, y=4),
            contract.Point(x=234, y=5),
        ],
    )

    with pytest.raises(
        TypeError,
        match=re.escape("argument inp[1] has wrong number of elements (expected 2, got 3 instead)"),
    ):
        await contract.transpose([(123, 234), (4, 5, 6)]).execute()


@pytest.mark.asyncio
async def test_declare_unwhitelisted_hint_contract(starknet: Starknet):
    with pytest.raises(
        PreprocessorError,
        match=re.escape(
            "This may indicate that this library function cannot be used in StarkNet contracts."
        ),
    ):
        await starknet.deprecated_declare(source=HINT_CONTRACT_FILE)

    # Check that declare() does not throw an error with disable_hint_validation.
    await starknet.deprecated_declare(source=HINT_CONTRACT_FILE, disable_hint_validation=True)


@pytest.mark.asyncio
async def test_cairo1_flow(starknet: Starknet):
    sierra_dict = compile_cairo_to_sierra(cairo_path=TEST_CAIRO1_FILE)
    abi = [
        {
            "type": "function",
            "name": "write",
            "inputs": [{"name": "key", "type": "felt"}, {"name": "value", "type": "felt"}],
            "outputs": [],
        },
        {
            "type": "function",
            "name": "read",
            "inputs": [{"name": "key", "type": "felt"}],
            "outputs": [{"name": "value", "type": "felt"}],
        },
    ]
    class_hash = await starknet.declare(sierra_dict=sierra_dict, abi=abi)
    contract = await starknet.deploy(class_hash=class_hash)

    key, value = 1991, 6
    call_info = await contract.write(key=key, value=value).execute()
    call_info = await contract.read(key=key).call()
    assert call_info.result == (value,)
