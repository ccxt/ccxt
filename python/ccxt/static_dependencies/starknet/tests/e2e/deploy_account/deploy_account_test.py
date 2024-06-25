import pytest

from net.account.account import Account
from net.models import StarknetChainId
from net.models.transaction import DeployAccountV3
from tests.e2e.fixtures.constants import MAX_FEE, MAX_RESOURCE_BOUNDS_L1


@pytest.mark.asyncio
async def test_general_flow(client, deploy_account_details_factory):
    address, key_pair, salt, class_hash = await deploy_account_details_factory.get()

    account = Account(
        address=address,
        client=client,
        key_pair=key_pair,
        chain=StarknetChainId.SEPOLIA,
    )

    deploy_account_tx = await account.sign_deploy_account_v1(
        class_hash=class_hash,
        contract_address_salt=salt,
        constructor_calldata=[key_pair.public_key],
        max_fee=MAX_FEE,
    )
    resp = await account.client.deploy_account(transaction=deploy_account_tx)

    assert resp.address == address


@pytest.mark.asyncio
async def test_deploy_account_v3(client, deploy_account_details_factory):
    address, key_pair, salt, class_hash = await deploy_account_details_factory.get()

    account = Account(
        address=address,
        client=client,
        key_pair=key_pair,
        chain=StarknetChainId.SEPOLIA,
    )

    deploy_account_tx = await account.sign_deploy_account_v3(
        class_hash=class_hash,
        contract_address_salt=salt,
        constructor_calldata=[key_pair.public_key],
        l1_resource_bounds=MAX_RESOURCE_BOUNDS_L1,
    )

    assert isinstance(deploy_account_tx, DeployAccountV3)

    resp = await account.client.deploy_account(transaction=deploy_account_tx)

    assert resp.address == address
