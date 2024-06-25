# pylint: disable=redefined-outer-name
from typing import Any, Dict, List, Optional, Tuple

import pytest
import pytest_asyncio

from common import (
    create_casm_class,
    create_compiled_contract,
    create_sierra_compiled_contract,
)
from constants import FEE_CONTRACT_ADDRESS
from contract import Contract
from hash.casm_class_hash import compute_casm_class_hash
from net.account.base_account import BaseAccount
from net.udc_deployer.deployer import Deployer
from tests.e2e.fixtures.constants import (
    CONTRACTS_COMPILED_V0_DIR,
    CONTRACTS_DIR,
    MAX_FEE,
    PRECOMPILED_CONTRACTS_DIR,
    STRK_FEE_CONTRACT_ADDRESS,
)
from tests.e2e.fixtures.misc import (
    ContractVersion,
    load_contract,
    read_contract,
)


@pytest.fixture(scope="package")
def map_source_code() -> str:
    """
    Returns source code of the map contract.
    """
    return read_contract("map.cairo", directory=CONTRACTS_DIR)


@pytest.fixture(scope="package")
def map_compiled_contract() -> str:
    """
    Returns compiled map contract.
    """
    return read_contract("map_compiled.json", directory=CONTRACTS_COMPILED_V0_DIR)


@pytest.fixture(scope="package")
def sierra_minimal_compiled_contract_and_class_hash() -> Tuple[str, int]:
    """
    Returns minimal contract compiled to sierra and its compiled class hash.
    """
    contract = load_contract(contract_name="MinimalContract")

    return (
        contract["sierra"],
        compute_casm_class_hash(create_casm_class(contract["casm"])),
    )


@pytest.fixture(scope="package")
def abi_types_compiled_contract_and_class_hash() -> Tuple[str, int]:
    """
    Returns abi_types contract compiled to sierra and its compiled class hash.
    """
    contract = load_contract(contract_name="AbiTypes", version=ContractVersion.V2)

    return (
        contract["sierra"],
        compute_casm_class_hash(create_casm_class(contract["casm"])),
    )


@pytest.fixture(scope="package")
def simple_storage_with_event_compiled_contract() -> str:
    """
    Returns compiled simple storage contract that emits an event.
    """
    return read_contract(
        "simple_storage_with_event_compiled.json", directory=CONTRACTS_COMPILED_V0_DIR
    )


@pytest.fixture(scope="package")
def erc20_compiled_contract() -> str:
    """
    Returns compiled erc20 contract.
    """
    return read_contract("erc20_compiled.json", directory=CONTRACTS_COMPILED_V0_DIR)


@pytest.fixture(scope="package")
def constructor_with_arguments_compiled_contract() -> str:
    """
    Returns compiled constructor_with_arguments contract.
    """
    return read_contract(
        "constructor_with_arguments_compiled.json", directory=CONTRACTS_COMPILED_V0_DIR
    )


@pytest.fixture(scope="package")
def constructor_without_arguments_compiled_contract() -> str:
    """
    Returns compiled constructor_without_arguments contract.
    """
    return read_contract(
        "constructor_without_arguments_compiled.json",
        directory=CONTRACTS_COMPILED_V0_DIR,
    )


async def deploy_contract(account: BaseAccount, class_hash: int, abi: List) -> Contract:
    """
    Deploys a contract and returns its instance.
    """
    deployment_result = await Contract.deploy_contract_v1(
        account=account, class_hash=class_hash, abi=abi, max_fee=MAX_FEE
    )
    deployment_result = await deployment_result.wait_for_acceptance()
    return deployment_result.deployed_contract


async def deploy_v1_contract(
    account: BaseAccount,
    contract_name: str,
    class_hash: int,
    calldata: Optional[Dict[str, Any]] = None,
) -> Contract:
    """
    Deploys Cairo1.0 contract.

    :param account: An account which will be used to deploy the Contract.
    :param contract_name: Name of the contract from project mocks (e.g. `ERC20`).
    :param class_hash: class_hash of the contract to be deployed.
    :param calldata: Dict with constructor arguments (can be empty).
    :returns: Instance of the deployed contract.
    """
    contract_sierra = load_contract(contract_name)["sierra"]

    abi = create_sierra_compiled_contract(compiled_contract=contract_sierra).parsed_abi

    deployer = Deployer()
    deploy_call, address = deployer.create_contract_deployment(
        class_hash=class_hash,
        abi=abi,
        calldata=calldata,
        cairo_version=1,
    )
    res = await account.execute_v1(calls=deploy_call, max_fee=MAX_FEE)
    await account.client.wait_for_tx(res.transaction_hash)

    return Contract(address, abi, provider=account, cairo_version=1)


@pytest_asyncio.fixture(scope="package")
async def deployed_balance_contract(
    account: BaseAccount,
    balance_contract: str,
) -> Contract:
    """
    Declares, deploys a new balance contract and returns its instance.
    """
    declare_result = await Contract.declare_v1(
        account=account,
        compiled_contract=balance_contract,
        max_fee=int(1e16),
    )
    await declare_result.wait_for_acceptance()

    deploy_result = await declare_result.deploy_v1(max_fee=int(1e16))
    await deploy_result.wait_for_acceptance()

    return deploy_result.deployed_contract


@pytest_asyncio.fixture(scope="package")
async def map_contract(
    account: BaseAccount,
    map_compiled_contract: str,
    map_class_hash: int,
) -> Contract:
    """
    Deploys map contract and returns its instance.
    """
    abi = create_compiled_contract(compiled_contract=map_compiled_contract).abi
    return await deploy_contract(account, map_class_hash, abi)


@pytest_asyncio.fixture(scope="package")
async def map_contract_declare_hash(
    account: BaseAccount,
    map_compiled_contract: str,
):
    declare_result = await Contract.declare_v1(
        account=account,
        compiled_contract=map_compiled_contract,
        max_fee=MAX_FEE,
    )
    await declare_result.wait_for_acceptance()
    return declare_result.hash


@pytest_asyncio.fixture(scope="function")
async def simple_storage_with_event_contract(
    account: BaseAccount,
    simple_storage_with_event_compiled_contract: str,
    simple_storage_with_event_class_hash: int,
) -> Contract:
    """
    Deploys storage contract with an events and returns its instance.
    """
    abi = create_compiled_contract(
        compiled_contract=simple_storage_with_event_compiled_contract
    ).abi
    return await deploy_contract(account, simple_storage_with_event_class_hash, abi)


@pytest_asyncio.fixture(name="erc20_contract", scope="package")
async def deploy_erc20_contract(
    account: BaseAccount,
    erc20_compiled_contract: str,
    erc20_class_hash: int,
) -> Contract:
    """
    Deploys erc20 contract and returns its instance.
    """
    abi = create_compiled_contract(compiled_contract=erc20_compiled_contract).abi
    return await deploy_contract(account, erc20_class_hash, abi)


@pytest.fixture(scope="package")
def eth_fee_contract(account: BaseAccount, fee_contract_abi) -> Contract:
    """
    Returns an instance of the ETH fee contract. It is used to transfer tokens.
    """

    return Contract(
        address=FEE_CONTRACT_ADDRESS,
        abi=fee_contract_abi,
        provider=account,
        cairo_version=0,
    )


@pytest.fixture(scope="package")
def strk_fee_contract(account: BaseAccount, fee_contract_abi) -> Contract:
    """
    Returns an instance of the STRK fee contract. It is used to transfer tokens.
    """

    return Contract(
        address=STRK_FEE_CONTRACT_ADDRESS,
        abi=fee_contract_abi,
        provider=account,
        cairo_version=0,
    )


@pytest.fixture(scope="package")
def fee_contract_abi():
    return [
        {
            "inputs": [
                {"name": "recipient", "type": "felt"},
                {"name": "amount", "type": "Uint256"},
            ],
            "name": "transfer",
            "outputs": [{"name": "success", "type": "felt"}],
            "type": "function",
        },
        {
            "members": [
                {"name": "low", "offset": 0, "type": "felt"},
                {"name": "high", "offset": 1, "type": "felt"},
            ],
            "name": "Uint256",
            "size": 2,
            "type": "struct",
        },
    ]


@pytest.fixture(name="balance_contract")
def fixture_balance_contract() -> str:
    """
    Returns compiled code of the balance.cairo contract.
    """
    return read_contract("balance_compiled.json", directory=CONTRACTS_COMPILED_V0_DIR)


async def declare_account(account: BaseAccount, compiled_account_contract: str) -> int:
    """
    Declares a specified account.
    """

    declare_tx = await account.sign_declare_v1(
        compiled_contract=compiled_account_contract,
        max_fee=MAX_FEE,
    )
    resp = await account.client.declare(transaction=declare_tx)
    await account.client.wait_for_tx(resp.transaction_hash)

    return resp.class_hash


async def declare_cairo1_account(
    account: BaseAccount,
    compiled_account_contract: str,
    compiled_account_contract_casm: str,
) -> int:
    """
    Declares a specified Cairo1 account.
    """

    casm_class = create_casm_class(compiled_account_contract_casm)
    casm_class_hash = compute_casm_class_hash(casm_class)
    declare_v2_transaction = await account.sign_declare_v2(
        compiled_contract=compiled_account_contract,
        compiled_class_hash=casm_class_hash,
        max_fee=MAX_FEE,
    )
    resp = await account.client.declare(transaction=declare_v2_transaction)
    await account.client.wait_for_tx(resp.transaction_hash)
    return resp.class_hash


@pytest_asyncio.fixture(scope="package")
async def account_with_validate_deploy_class_hash(
    pre_deployed_account_with_validate_deploy: BaseAccount,
) -> int:
    compiled_contract = read_contract(
        "account_with_validate_deploy_compiled.json",
        directory=CONTRACTS_COMPILED_V0_DIR,
    )
    return await declare_account(
        pre_deployed_account_with_validate_deploy, compiled_contract
    )


@pytest_asyncio.fixture(scope="package")
async def argent_cairo1_account_class_hash(
    pre_deployed_account_with_validate_deploy: BaseAccount,
) -> int:
    # Use precompiled argent account contracts
    # we don't have the source code for this contract
    compiled_contract = read_contract(
        "argent_account.json", directory=PRECOMPILED_CONTRACTS_DIR
    )
    compiled_contract_casm = read_contract(
        "argent_account.casm", directory=PRECOMPILED_CONTRACTS_DIR
    )
    return await declare_cairo1_account(
        account=pre_deployed_account_with_validate_deploy,
        compiled_account_contract=compiled_contract,
        compiled_account_contract_casm=compiled_contract_casm,
    )


@pytest_asyncio.fixture(scope="package")
async def map_class_hash(account: BaseAccount, map_compiled_contract: str) -> int:
    """
    Returns class_hash of the map.cairo.
    """
    declare = await account.sign_declare_v1(
        compiled_contract=map_compiled_contract,
        max_fee=int(1e16),
    )
    res = await account.client.declare(declare)
    await account.client.wait_for_tx(res.transaction_hash)
    return res.class_hash


@pytest_asyncio.fixture(scope="package")
async def simple_storage_with_event_class_hash(
    account: BaseAccount, simple_storage_with_event_compiled_contract: str
):
    """
    Returns class_hash of the simple_storage_with_event.cairo
    """
    declare = await account.sign_declare_v1(
        compiled_contract=simple_storage_with_event_compiled_contract,
        max_fee=int(1e16),
    )
    res = await account.client.declare(declare)
    await account.client.wait_for_tx(res.transaction_hash)
    return res.class_hash


@pytest_asyncio.fixture(scope="package")
async def erc20_class_hash(account: BaseAccount, erc20_compiled_contract: str) -> int:
    """
    Returns class_hash of the erc20.cairo.
    """
    declare = await account.sign_declare_v1(
        compiled_contract=erc20_compiled_contract,
        max_fee=int(1e16),
    )
    res = await account.client.declare(declare)
    await account.client.wait_for_tx(res.transaction_hash)
    return res.class_hash


constructor_with_arguments_source = (
    CONTRACTS_DIR / "constructor_with_arguments.cairo"
).read_text("utf-8")


@pytest.fixture(scope="package")
def constructor_with_arguments_abi() -> List:
    """
    Returns an abi of the constructor_with_arguments.cairo.
    """
    compiled_contract = create_compiled_contract(
        compiled_contract=read_contract(
            "constructor_with_arguments_compiled.json",
            directory=CONTRACTS_COMPILED_V0_DIR,
        )
    )
    assert compiled_contract.abi is not None
    return compiled_contract.abi


@pytest.fixture(scope="package")
def constructor_with_arguments_compiled() -> str:
    """
    Returns a compiled constructor_with_arguments.cairo.
    """
    return read_contract(
        "constructor_with_arguments_compiled.json", directory=CONTRACTS_COMPILED_V0_DIR
    )


@pytest_asyncio.fixture(scope="package")
async def constructor_with_arguments_class_hash(
    account: BaseAccount, constructor_with_arguments_compiled
) -> int:
    """
    Returns a class_hash of the constructor_with_arguments.cairo.
    """
    declare = await account.sign_declare_v1(
        compiled_contract=constructor_with_arguments_compiled,
        max_fee=int(1e16),
    )
    res = await account.client.declare(declare)
    await account.client.wait_for_tx(res.transaction_hash)
    return res.class_hash
