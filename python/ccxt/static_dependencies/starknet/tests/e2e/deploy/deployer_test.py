import pytest

from contract import Contract
from hash.address import compute_address
from net.full_node_client import FullNodeClient
from net.udc_deployer.deployer import Deployer
from tests.e2e.fixtures.constants import MAX_FEE
from utils.constructor_args_translator import translate_constructor_args


@pytest.mark.asyncio
async def test_default_deploy_with_class_hash(account, map_class_hash):
    deployer = Deployer()

    contract_deployment = deployer.create_contract_deployment(class_hash=map_class_hash)

    deploy_invoke_tx = await account.sign_invoke_v1(
        contract_deployment.call, max_fee=MAX_FEE
    )
    resp = await account.client.send_transaction(deploy_invoke_tx)
    await account.client.wait_for_tx(resp.transaction_hash)

    assert isinstance(contract_deployment.address, int)
    assert contract_deployment.address != 0


@pytest.mark.asyncio
async def test_throws_when_calldata_provided_without_abi(map_class_hash):
    deployer = Deployer()

    with pytest.raises(ValueError, match="calldata was provided without an ABI."):
        deployer.create_contract_deployment(
            class_hash=map_class_hash, calldata=[12, 34]
        )


@pytest.mark.asyncio
async def test_throws_when_calldata_not_provided(constructor_with_arguments_abi):
    deployer = Deployer()

    with pytest.raises(
        ValueError,
        match="Provided contract has a constructor and no arguments were provided.",
    ):
        deployer.create_contract_deployment(
            class_hash=1234, abi=constructor_with_arguments_abi, cairo_version=0
        )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "calldata",
    [
        [10, (1, (2, 3)), [1, 2, 3], {"value": 12, "nested_struct": {"value": 99}}],
        {
            "single_value": 10,
            "tuple": (1, (2, 3)),
            "arr": [1, 2, 3],
            "dict": {"value": 12, "nested_struct": {"value": 99}},
        },
    ],
)
async def test_constructor_arguments_contract_deploy(
    account,
    constructor_with_arguments_abi,
    constructor_with_arguments_class_hash,
    calldata,
):
    deployer = Deployer(account_address=account.address)

    deploy_call, contract_address = deployer.create_contract_deployment(
        class_hash=constructor_with_arguments_class_hash,
        abi=constructor_with_arguments_abi,
        calldata=calldata,
        cairo_version=0,
    )

    deploy_invoke_transaction = await account.sign_invoke_v1(
        deploy_call, max_fee=MAX_FEE
    )
    resp = await account.client.send_transaction(deploy_invoke_transaction)
    await account.client.wait_for_tx(resp.transaction_hash)

    contract = Contract(
        address=contract_address,
        abi=constructor_with_arguments_abi,
        provider=account,
        cairo_version=0,
    )

    result = await contract.functions["get"].call(block_number="latest")

    assert result == (
        10,
        (1, (2, 3)),
        sum([1, 2, 3]),
        {"value": 12, "nested_struct": {"value": 99}},
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "salt, pass_account_address", [(1, True), (2, False), (None, True), (None, False)]
)
async def test_address_computation(salt, pass_account_address, account, map_class_hash):
    deployer = Deployer(
        account_address=account.address if pass_account_address else None
    )
    if isinstance(salt, int) and isinstance(account.client, FullNodeClient):
        # transactions have to be different for each account
        salt += 1

    deploy_call, computed_address = deployer.create_contract_deployment(
        class_hash=map_class_hash,
        salt=salt,
    )

    deploy_invoke_tx = await account.sign_invoke_v1(deploy_call, max_fee=MAX_FEE)
    resp = await account.client.send_transaction(deploy_invoke_tx)
    await account.client.wait_for_tx(resp.transaction_hash)

    tx_receipt = await account.client.get_transaction_receipt(resp.transaction_hash)
    address_from_event = tx_receipt.events[0].data[0]

    assert computed_address == address_from_event


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "calldata",
    [
        [10, (1, (2, 3)), [1, 2, 3], {"value": 12, "nested_struct": {"value": 99}}],
        {
            "single_value": 10,
            "tuple": (1, (2, 3)),
            "arr": [1, 2, 3],
            "dict": {"value": 12, "nested_struct": {"value": 99}},
        },
    ],
)
async def test_create_deployment_call_raw(
    account,
    constructor_with_arguments_abi,
    constructor_with_arguments_class_hash,
    calldata,
):
    deployer = Deployer(account_address=account.address)

    raw_calldata = translate_constructor_args(
        abi=constructor_with_arguments_abi, constructor_args=calldata, cairo_version=0
    )

    (
        deploy_call,
        contract_address,
    ) = deployer.create_contract_deployment_raw(
        class_hash=constructor_with_arguments_class_hash,
        raw_calldata=raw_calldata,
    )

    deploy_invoke_transaction = await account.sign_invoke_v1(
        deploy_call, max_fee=MAX_FEE
    )
    resp = await account.client.send_transaction(deploy_invoke_transaction)
    await account.client.wait_for_tx(resp.transaction_hash)

    assert isinstance(contract_address, int)
    assert contract_address != 0


@pytest.mark.asyncio
async def test_create_deployment_call_raw_supports_seed_0(
    account,
    constructor_with_arguments_abi,
    constructor_with_arguments_class_hash,
):
    sample_calldata = {
        # the transactions have to be different for each account
        "single_value": 20 if isinstance(account.client, FullNodeClient) else 30,
        "tuple": (1, (2, 3)),
        "arr": [1, 2, 3],
        "dict": {"value": 12, "nested_struct": {"value": 99}},
    }
    deployer = Deployer()

    raw_calldata = translate_constructor_args(
        abi=constructor_with_arguments_abi,
        constructor_args=sample_calldata,
        cairo_version=0,
    )

    expected_address = compute_address(
        class_hash=constructor_with_arguments_class_hash,
        constructor_calldata=raw_calldata,
        salt=0,
    )

    (
        deploy_call,
        contract_address,
    ) = deployer.create_contract_deployment_raw(
        class_hash=constructor_with_arguments_class_hash,
        raw_calldata=raw_calldata,
        salt=0,
    )

    deploy_invoke_transaction = await account.sign_invoke_v1(
        deploy_call, max_fee=MAX_FEE
    )
    resp = await account.client.send_transaction(deploy_invoke_transaction)
    await account.client.wait_for_tx(resp.transaction_hash)

    assert isinstance(contract_address, int)
    assert (
        contract_address == expected_address
    ), f"Expected address {expected_address}, got {contract_address}."
