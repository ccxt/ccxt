# pylint: disable=redefined-outer-name

from dataclasses import dataclass
from typing import Optional, Tuple

import pytest
import pytest_asyncio

from contract import Contract
from hash.address import compute_address
from net.account.account import Account
from net.account.base_account import BaseAccount
from net.client_models import PriceUnit
from net.full_node_client import FullNodeClient
from net.http_client import HttpMethod, RpcHttpClient
from net.models import StarknetChainId
from net.signer.stark_curve_signer import KeyPair
from tests.e2e.fixtures.constants import (
    DEVNET_PRE_DEPLOYED_ACCOUNT_ADDRESS,
    DEVNET_PRE_DEPLOYED_ACCOUNT_PRIVATE_KEY,
)
from tests.e2e.utils import (
    AccountToBeDeployedDetails,
    _get_random_private_key_unsafe,
    get_deploy_account_details,
    get_deploy_account_transaction,
)


async def devnet_account_details(
    account: BaseAccount,
    class_hash: int,
    devnet,
) -> Tuple[str, str]:
    """
    Deploys an Account and adds fee tokens to its balance (only on devnet).
    """

    private_key = _get_random_private_key_unsafe()
    key_pair = KeyPair.from_private_key(private_key)
    salt = 1

    address = compute_address(
        class_hash=class_hash,
        constructor_calldata=[key_pair.public_key],
        salt=salt,
        deployer_address=0,
    )

    await mint_token_on_devnet(devnet, address, int(1e30), PriceUnit.WEI.value)
    await mint_token_on_devnet(devnet, address, int(1e30), PriceUnit.FRI.value)

    deploy_account_tx = await get_deploy_account_transaction(
        address=address,
        key_pair=key_pair,
        salt=salt,
        class_hash=class_hash,
        client=account.client,
    )

    account = Account(
        address=address,
        client=account.client,
        key_pair=key_pair,
        chain=StarknetChainId.SEPOLIA,
    )
    res = await account.client.deploy_account(deploy_account_tx)
    await account.client.wait_for_tx(res.transaction_hash)

    return hex(address), hex(key_pair.private_key)


async def mint_token_on_devnet(url: str, address: int, amount: int, unit: str):
    http_client = RpcHttpClient(url)
    await http_client.request(
        http_method=HttpMethod.POST,
        address=f"{url}/mint",
        payload={"address": hex(address), "amount": amount, "unit": unit},
    )


@pytest_asyncio.fixture(scope="package")
async def address_and_private_key(
    pre_deployed_account_with_validate_deploy: BaseAccount,
    account_with_validate_deploy_class_hash: int,
    devnet,
) -> Tuple[str, str]:
    """
    Returns address and private key of an account, depending on the network.
    """

    return await devnet_account_details(
        pre_deployed_account_with_validate_deploy,
        account_with_validate_deploy_class_hash,
        devnet,
    )


@pytest.fixture(name="account", scope="package")
def full_node_account(
    address_and_private_key: Tuple[str, str], client: FullNodeClient
) -> BaseAccount:
    """
    Returns a new Account created with FullNodeClient.
    """
    address, private_key = address_and_private_key

    return Account(
        address=address,
        client=client,
        key_pair=KeyPair.from_private_key(int(private_key, 0)),
        chain=StarknetChainId.SEPOLIA,
    )


@dataclass
class AccountToBeDeployedDetailsFactory:
    class_hash: int
    eth_fee_contract: Contract
    strk_fee_contract: Contract

    async def get(
        self, *, class_hash: Optional[int] = None, argent_calldata: bool = False
    ) -> AccountToBeDeployedDetails:
        return await get_deploy_account_details(
            class_hash=class_hash if class_hash is not None else self.class_hash,
            eth_fee_contract=self.eth_fee_contract,
            strk_fee_contract=self.strk_fee_contract,
            argent_calldata=argent_calldata,
        )


@pytest_asyncio.fixture(scope="package")
async def deploy_account_details_factory(
    account_with_validate_deploy_class_hash: int,
    eth_fee_contract: Contract,
    strk_fee_contract: Contract,
) -> AccountToBeDeployedDetailsFactory:
    """
    Returns AccountToBeDeployedDetailsFactory.

    The Factory's get() method returns: address, key_pair, salt
    and class_hash of the account with validate deploy.
    Prefunds the address with enough tokens to allow for deployment.
    """
    return AccountToBeDeployedDetailsFactory(
        class_hash=account_with_validate_deploy_class_hash,
        eth_fee_contract=eth_fee_contract,
        strk_fee_contract=strk_fee_contract,
    )


@pytest.fixture(scope="package")
def pre_deployed_account_with_validate_deploy(client) -> BaseAccount:
    """
    Returns an Account pre-deployed on specified network. Used to deploy other accounts.
    """

    address = DEVNET_PRE_DEPLOYED_ACCOUNT_ADDRESS
    private_key = DEVNET_PRE_DEPLOYED_ACCOUNT_PRIVATE_KEY

    return Account(
        address=address,
        client=client,
        key_pair=KeyPair.from_private_key(int(private_key, 16)),
        chain=StarknetChainId.SEPOLIA,
    )


@pytest_asyncio.fixture(scope="package")
async def argent_cairo1_account(
    argent_cairo1_account_class_hash,
    deploy_account_details_factory: AccountToBeDeployedDetailsFactory,
    client,
) -> BaseAccount:
    address, key_pair, salt, class_hash = await deploy_account_details_factory.get(
        class_hash=argent_cairo1_account_class_hash,
        argent_calldata=True,
    )
    deploy_result = await Account.deploy_account_v1(
        address=address,
        class_hash=class_hash,
        salt=salt,
        key_pair=key_pair,
        client=client,
        constructor_calldata=[key_pair.public_key, 0],
        max_fee=int(1e16),
    )
    await deploy_result.wait_for_acceptance()
    return deploy_result.account
