# pylint: disable=redefined-outer-name
from typing import AsyncGenerator, Dict, Tuple

import pytest
import pytest_asyncio

from hash.selector import get_selector_from_name
from net.account.account import Account
from tests.e2e.client.fixtures.prepare_net_for_gateway_test import (
    PreparedNetworkData,
    prepare_net_for_tests,
)
from tests.e2e.fixtures.accounts import AccountToBeDeployedDetailsFactory
from tests.e2e.fixtures.constants import CONTRACTS_COMPILED_V0_DIR
from tests.e2e.fixtures.misc import read_contract
from tests.e2e.utils import AccountToBeDeployedDetails


async def prepare_network(
    account: Account,
    deploy_account_details: AccountToBeDeployedDetails,
) -> PreparedNetworkData:
    contract_compiled = read_contract(
        "balance_compiled.json", directory=CONTRACTS_COMPILED_V0_DIR
    )

    prepared_data = await prepare_net_for_tests(
        account,
        compiled_contract=contract_compiled,
        deploy_account_details=deploy_account_details,
    )

    return prepared_data


@pytest.fixture(name="block_with_invoke_number")
def fixture_block_with_invoke_number(
    prepare_network: Tuple[str, PreparedNetworkData]
) -> int:
    """
    Returns number of the block with invoke transaction
    """
    _, prepared_data = prepare_network
    return prepared_data.block_with_invoke_number


@pytest.fixture(name="block_with_declare_number")
def fixture_block_with_declare_number(
    prepare_network: Tuple[str, PreparedNetworkData]
) -> int:
    """
    Returns number of the block with declare transaction
    """
    _, prepared_data = prepare_network
    return prepared_data.block_with_declare_number


@pytest.fixture(name="block_with_declare_hash")
def fixture_block_with_declare_hash(
    prepare_network: Tuple[str, PreparedNetworkData]
) -> int:
    """
    Returns hash of the block with declare transaction
    """
    _, prepared_data = prepare_network
    return prepared_data.block_with_declare_hash


@pytest.fixture(name="invoke_transaction")
def fixture_invoke_transaction(
    prepare_network: Tuple[str, PreparedNetworkData]
) -> Dict:
    """
    Returns basic data of Invoke
    """
    _, prepared_data = prepare_network
    return {
        "hash": prepared_data.invoke_transaction_hash,
        "calldata": [1234],
        "entry_point_selector": get_selector_from_name("increase_balance"),
    }


@pytest.fixture(name="invoke_transaction_hash")
def fixture_invoke_transaction_hash(invoke_transaction: Dict) -> int:
    """
    Returns hash of Invoke
    """
    return invoke_transaction["hash"]


@pytest.fixture(name="invoke_transaction_calldata")
def fixture_invoke_transaction_calldata(invoke_transaction: Dict) -> int:
    """
    Returns calldata of Invoke
    """
    return invoke_transaction["calldata"]


@pytest.fixture(name="invoke_transaction_selector")
def fixture_invoke_transaction_selector(invoke_transaction: Dict) -> int:
    """
    Returns entry_point_selector of Invoke
    """
    return invoke_transaction["entry_point_selector"]


@pytest.fixture(name="declare_transaction_hash")
def fixture_declare_transaction_hash(
    prepare_network: Tuple[str, PreparedNetworkData]
) -> int:
    """
    Returns hash of the DeclareTransaction
    """
    _, prepared_data = prepare_network
    return prepared_data.declare_transaction_hash


@pytest.fixture(name="contract_address")
def fixture_contract_address(prepare_network: Tuple[str, PreparedNetworkData]) -> int:
    """
    Returns an address of the deployed contract
    """
    _, prepared_data = prepare_network
    return prepared_data.contract_address


@pytest.fixture(name="balance_contract", scope="package")
def fixture_balance_contract() -> str:
    """
    Returns compiled code of the balance.cairo contract
    """
    return read_contract("balance_compiled.json", directory=CONTRACTS_COMPILED_V0_DIR)


@pytest.fixture(name="class_hash")
def fixture_class_hash(prepare_network: Tuple[str, PreparedNetworkData]) -> int:
    """
    Returns class hash of the deployed contract
    """
    _, prepared_data = prepare_network
    return prepared_data.class_hash


@pytest_asyncio.fixture(name="prepare_network", scope="package")
async def fixture_prepare_network(
    devnet,
    account: Account,
    deploy_account_details_factory: AccountToBeDeployedDetailsFactory,
) -> AsyncGenerator[Tuple[str, PreparedNetworkData], None]:
    """
    Adds transactions to the network. Returns network address and PreparedNetworkData
    """
    net = devnet
    details = await deploy_account_details_factory.get()
    prepared_data = await prepare_network(account, details)
    yield net, prepared_data
