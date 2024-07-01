from starkware.cairo.common.hash_state import compute_hash_on_elements
from starkware.starknet.definitions.general_config import StarknetOsConfig

# A constant representing the StarkNet OS config version.
STARKNET_OS_CONFIG_HASH_VERSION = int.from_bytes(b"StarknetOsConfig2", "big")


def calculate_starknet_config_hash(starknet_os_config: StarknetOsConfig) -> int:
    """
    Calculates the hash of StarkNet config.
    """
    return compute_hash_on_elements(
        data=[
            STARKNET_OS_CONFIG_HASH_VERSION,
            starknet_os_config.chain_id,
            starknet_os_config.deprecated_fee_token_address,
            starknet_os_config.fee_token_address,
        ]
    )
