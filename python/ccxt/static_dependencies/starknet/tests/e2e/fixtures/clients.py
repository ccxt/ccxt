import pytest

from net.full_node_client import FullNodeClient


@pytest.fixture(name="client", scope="package")
def create_full_node_client(devnet) -> FullNodeClient:
    return FullNodeClient(node_url=devnet + "/rpc")
