import pytest

from contract import Contract
from net.client import Client
from tests.e2e.fixtures.constants import MAX_FEE
from tests.e2e.utils import _get_random_private_key_unsafe


@pytest.mark.asyncio
async def test_deploy_prefunded_account(
    account_with_validate_deploy_class_hash: int,
    eth_fee_contract: Contract,
    client: Client,
):
    # pylint: disable=import-outside-toplevel, too-many-locals
    full_node_client_fixture = client
    # docs: start
    from hash.address import compute_address
    from net.account.account import Account
    from net.full_node_client import FullNodeClient
    from net.signer.stark_curve_signer import KeyPair

    # First, make sure to generate private key and salt
    # docs: end
    private_key = _get_random_private_key_unsafe()
    salt = 1
    class_hash = account_with_validate_deploy_class_hash
    # docs: start

    key_pair = KeyPair.from_private_key(private_key)

    # Compute an address
    address = compute_address(
        salt=salt,
        class_hash=class_hash,  # class_hash of the Account declared on the Starknet
        constructor_calldata=[key_pair.public_key],
        deployer_address=0,
    )

    # Prefund the address (using the token bridge or by sending fee tokens to the computed address)
    # Make sure the tx has been accepted on L2 before proceeding
    # docs: end
    res = await eth_fee_contract.functions["transfer"].invoke_v1(
        recipient=address, amount=int(1e16), max_fee=MAX_FEE
    )
    await res.wait_for_acceptance()
    # docs: start

    # Define the client to be used to interact with Starknet
    client = FullNodeClient(node_url="your.node.url")
    # docs: end

    client = full_node_client_fixture
    # docs: start

    # Use `Account.deploy_account_v1` or `Account.deploy_account_v3` static methods to deploy an account
    account_deployment_result = await Account.deploy_account_v1(
        address=address,
        class_hash=class_hash,
        salt=salt,
        key_pair=key_pair,
        client=client,
        constructor_calldata=[key_pair.public_key],
        max_fee=int(1e15),
    )
    # Wait for deployment transaction to be accepted
    await account_deployment_result.wait_for_acceptance()

    # From now on, account can be used as usual
    account = account_deployment_result.account
    # docs: end
    assert account.address == address
