# pylint: disable=redefined-outer-name

import pytest
import pytest_asyncio

from contract import Contract, DeployResult
from hash.selector import get_selector_from_name
from net.account.account import Account
from tests.e2e.fixtures.constants import CONTRACTS_COMPILED_V0_DIR, MAX_FEE
from tests.e2e.fixtures.misc import read_contract


@pytest.fixture(
    params=["argent_proxy_compiled.json", "oz_proxy_compiled.json"],
    scope="session",
)
def compiled_proxy(request) -> str:
    """
    Returns source code of compiled proxy contract.
    """
    return read_contract(request.param, directory=CONTRACTS_COMPILED_V0_DIR)


@pytest.fixture(scope="session")
def custom_proxy() -> str:
    """
    Returns compiled source code of a custom proxy.
    """
    return read_contract(
        "oz_proxy_custom_compiled.json", directory=CONTRACTS_COMPILED_V0_DIR
    )


@pytest.fixture(
    scope="session",
    params=[
        "precompiled/oz_proxy_address_0.8.1_compiled.json",
    ],
)
def old_proxy(request) -> str:
    """
    Returns compiled (using starknet-compile 0.8.1) source code of proxy using address and delegate_call.
    """
    return read_contract(request.param, directory=CONTRACTS_COMPILED_V0_DIR)


@pytest_asyncio.fixture(
    name="proxy_oz_argent",
    params=[
        ("oz_proxy_compiled.json", "map_compiled.json"),
        ("argent_proxy_compiled.json", "map_compiled.json"),
    ],
)
async def deploy_proxy_to_contract_oz_argent_eth(
    request, account: Account
) -> DeployResult:
    """
    Declares a contract and deploys a proxy (OZ, Argent, Eth) pointing to that contract.
    """
    compiled_proxy_name, compiled_contract_name = request.param
    return await deploy_proxy_to_contract(
        compiled_proxy_name, compiled_contract_name, account
    )


@pytest_asyncio.fixture(
    name="proxy_custom", params=[("oz_proxy_custom_compiled.json", "map_compiled.json")]
)
async def deploy_proxy_to_contract_custom(request, account: Account) -> DeployResult:
    """
    Declares a contract and deploys a custom proxy pointing to that contract.
    """
    compiled_proxy_name, compiled_contract_name = request.param
    return await deploy_proxy_to_contract(
        compiled_proxy_name, compiled_contract_name, account
    )


@pytest_asyncio.fixture(
    name="proxy_impl_func",
    params=[("oz_proxy_impl_func_compiled.json", "map_compiled.json")],
)
async def deploy_proxy_to_contract_impl_func(request, account: Account) -> DeployResult:
    """
    Declares a contract and deploys a custom proxy pointing to that contract.
    """
    compiled_proxy_name, compiled_contract_name = request.param
    return await deploy_proxy_to_contract(
        compiled_proxy_name, compiled_contract_name, account
    )


async def deploy_proxy_to_contract(
    compiled_proxy_name: str,
    compiled_contract_name: str,
    account: Account,
) -> DeployResult:
    """
    Declares a contract and deploys a proxy pointing to that contract.
    """
    compiled_proxy = read_contract(
        compiled_proxy_name, directory=CONTRACTS_COMPILED_V0_DIR
    )
    compiled_contract = read_contract(
        compiled_contract_name, directory=CONTRACTS_COMPILED_V0_DIR
    )

    declare_tx = await account.sign_declare_v1(
        compiled_contract=compiled_contract, max_fee=MAX_FEE
    )
    declare_result = await account.client.declare(declare_tx)
    await account.client.wait_for_tx(declare_result.transaction_hash)

    declare_proxy_result = await Contract.declare_v1(
        account=account,
        compiled_contract=compiled_proxy,
        max_fee=MAX_FEE,
    )
    await declare_proxy_result.wait_for_acceptance()
    deploy_result = await declare_proxy_result.deploy_v1(
        constructor_args=[
            declare_result.class_hash,
            get_selector_from_name("put"),
            [69, 420],
        ],
        max_fee=MAX_FEE,
    )
    await deploy_result.wait_for_acceptance()
    return deploy_result
