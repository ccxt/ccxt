import random
from typing import Tuple

from constants import EC_ORDER
from contract import Contract
from hash.address import compute_address
from net.account.account import Account
from net.client import Client
from net.http_client import HttpClient, HttpMethod
from net.models import StarknetChainId
from net.models.transaction import DeployAccountV1
from net.signer.stark_curve_signer import KeyPair
from net.udc_deployer.deployer import _get_random_salt
from tests.e2e.fixtures.constants import MAX_FEE

AccountToBeDeployedDetails = Tuple[int, KeyPair, int, int]


async def get_deploy_account_details(
    *,
    class_hash: int,
    eth_fee_contract: Contract,
    strk_fee_contract: Contract,
    argent_calldata: bool = False,
) -> AccountToBeDeployedDetails:
    """
    Returns address, key_pair, salt and class_hash of the account with validate deploy.

    :param class_hash: Class hash of account to be deployed.
    :param eth_fee_contract: Contract for prefunding deployments in ETH.
    :param strk_fee_contract: Contract for prefunding deployments in STRK.
    :param argent_calldata: Flag deciding whether calldata should be in Argent-account format.
    """
    priv_key = _get_random_private_key_unsafe()
    key_pair = KeyPair.from_private_key(priv_key)
    salt = _get_random_salt()

    calldata = [key_pair.public_key]
    if argent_calldata:
        # Argent account's calldata to the constructor requires 'owner' and 'guardian', hence the additional 0 for the
        # 'guardian'.
        calldata.append(0)
    address = compute_address(
        salt=salt,
        class_hash=class_hash,
        constructor_calldata=calldata,
        deployer_address=0,
    )

    transfer_wei_res = await eth_fee_contract.functions["transfer"].invoke_v1(
        recipient=address, amount=int(1e19), max_fee=MAX_FEE
    )
    await transfer_wei_res.wait_for_acceptance()

    transfer_fri_res = await strk_fee_contract.functions["transfer"].invoke_v1(
        recipient=address, amount=int(1e19), max_fee=MAX_FEE
    )
    await transfer_fri_res.wait_for_acceptance()

    return address, key_pair, salt, class_hash


async def get_deploy_account_transaction(
    *, address: int, key_pair: KeyPair, salt: int, class_hash: int, client: Client
) -> DeployAccountV1:
    """
    Get a signed DeployAccount transaction from provided details
    """

    account = Account(
        address=address,
        client=client,
        key_pair=key_pair,
        chain=StarknetChainId.SEPOLIA,
    )
    return await account.sign_deploy_account_v1(
        class_hash=class_hash,
        contract_address_salt=salt,
        constructor_calldata=[key_pair.public_key],
        max_fee=int(1e16),
    )


def _get_random_private_key_unsafe() -> int:
    """
    Returns a private key in the range [1, EC_ORDER).
    This is not a safe way of generating private keys and should be used only in tests.
    """
    return random.randint(1, EC_ORDER - 1)


async def create_empty_block(http_client: HttpClient) -> None:
    url = http_client.url[:-4] if http_client.url.endswith("/rpc") else http_client.url
    await http_client.request(
        address=f"{url}/create_block",
        http_method=HttpMethod.POST,
    )
