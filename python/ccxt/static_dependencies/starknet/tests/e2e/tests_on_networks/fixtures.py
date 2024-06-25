import pytest

from net.account.account import Account
from net.full_node_client import FullNodeClient
from net.models import StarknetChainId
from net.signer.stark_curve_signer import KeyPair
from tests.e2e.fixtures.constants import (
    SEPOLIA_ACCOUNT_ADDRESS,
    SEPOLIA_ACCOUNT_PRIVATE_KEY,
    SEPOLIA_INTEGRATION_ACCOUNT_ADDRESS,
    SEPOLIA_INTEGRATION_ACCOUNT_PRIVATE_KEY,
    SEPOLIA_INTEGRATION_RPC_URL,
    SEPOLIA_RPC_URL,
)


@pytest.fixture(scope="package")
def client_sepolia_integration() -> FullNodeClient:
    return FullNodeClient(node_url=SEPOLIA_INTEGRATION_RPC_URL())


@pytest.fixture(scope="package")
def client_sepolia_testnet() -> FullNodeClient:
    return FullNodeClient(node_url=SEPOLIA_RPC_URL())


@pytest.fixture(scope="package")
def account_sepolia_integration(client_sepolia_integration) -> Account:
    return Account(
        address=SEPOLIA_INTEGRATION_ACCOUNT_ADDRESS(),
        client=client_sepolia_integration,
        key_pair=KeyPair.from_private_key(
            int(SEPOLIA_INTEGRATION_ACCOUNT_PRIVATE_KEY(), 0)
        ),
        chain=StarknetChainId.SEPOLIA_INTEGRATION,
    )


@pytest.fixture(scope="package")
def account_sepolia_testnet(client_sepolia_testnet) -> Account:
    return Account(
        address=SEPOLIA_ACCOUNT_ADDRESS(),
        client=client_sepolia_testnet,
        key_pair=KeyPair.from_private_key(int(SEPOLIA_ACCOUNT_PRIVATE_KEY(), 0)),
        chain=StarknetChainId.SEPOLIA,
    )
