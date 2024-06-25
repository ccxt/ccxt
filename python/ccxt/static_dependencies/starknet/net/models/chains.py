from enum import IntEnum
from typing import Optional, Union

from ...common import int_from_bytes
from net.networks import MAINNET, SEPOLIA, SEPOLIA_INTEGRATION, Network


class StarknetChainId(IntEnum):
    """
    An enumeration representing Starknet chain IDs.
    """

    MAINNET = int_from_bytes(b"SN_MAIN")
    SEPOLIA = int_from_bytes(b"SN_SEPOLIA")
    SEPOLIA_INTEGRATION = int_from_bytes(b"SN_INTEGRATION_SEPOLIA")


RECOGNIZED_CHAIN_IDS = [
    StarknetChainId.MAINNET,
    StarknetChainId.SEPOLIA,
    StarknetChainId.SEPOLIA_INTEGRATION,
]


def chain_from_network(
    net: Network, chain: Optional[StarknetChainId] = None
) -> StarknetChainId:
    mapping = {
        MAINNET: StarknetChainId.MAINNET,
        SEPOLIA: StarknetChainId.SEPOLIA,
        SEPOLIA_INTEGRATION: StarknetChainId.SEPOLIA_INTEGRATION,
    }

    if isinstance(net, str) and net in mapping:
        return mapping[net]

    if not chain:
        raise ValueError("Chain is required when not using predefined networks.")

    return chain


ChainId = Union[StarknetChainId, int]
Chain = Union[str, ChainId]


def parse_chain(chain: Chain) -> ChainId:
    if isinstance(chain, str):
        try:
            return int(chain, 16)
        except ValueError:
            return int_from_bytes(chain.encode())
    else:
        return chain
