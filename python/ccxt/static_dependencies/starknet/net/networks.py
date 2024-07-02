from typing import Literal, Union

from ..constants import FEE_CONTRACT_ADDRESS

MAINNET = "mainnet"
SEPOLIA = "sepolia"
SEPOLIA_INTEGRATION = "sepolia_integration"

PredefinedNetwork = Literal["mainnet", "sepolia", "sepolia_integration"]

Network = Union[PredefinedNetwork, str]


def default_token_address_for_network(net: Network) -> str:
    if net not in [MAINNET, SEPOLIA, SEPOLIA_INTEGRATION]:
        raise ValueError(
            "Argument token_address must be specified when using a custom net address"
        )

    return FEE_CONTRACT_ADDRESS
