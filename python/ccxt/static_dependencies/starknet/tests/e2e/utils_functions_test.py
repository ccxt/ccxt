import pytest

from constants import FEE_CONTRACT_ADDRESS
from net.full_node_client import _is_valid_eth_address
from net.networks import default_token_address_for_network


def test_is_valid_eth_address():
    assert _is_valid_eth_address("0x333333f332a06ECB5D20D35da44ba07986D6E203")
    assert not _is_valid_eth_address("0x1")
    assert not _is_valid_eth_address("123")


def test_default_token_address_for_network():
    res = default_token_address_for_network("mainnet")
    assert res == FEE_CONTRACT_ADDRESS

    res = default_token_address_for_network("sepolia")
    assert res == FEE_CONTRACT_ADDRESS

    with pytest.raises(
        ValueError,
        match="Argument token_address must be specified when using a custom net address",
    ):
        _ = default_token_address_for_network("")
