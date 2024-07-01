import json
import os

from starkware.python.utils import get_source_dir_path
from starkware.starknet.core.os.os_config.os_config_hash import calculate_starknet_config_hash
from starkware.starknet.definitions.chain_ids import (
    CHAIN_ID_TO_DEPRECATED_FEE_TOKEN_ADDRESS,
    CHAIN_ID_TO_FEE_TOKEN_ADDRESS,
    StarknetChainId,
)
from starkware.starknet.definitions.general_config import StarknetOsConfig

CONFIG_HASH_DIR_PATH = get_source_dir_path(
    "src/starkware/starknet/core/os/os_config",
    default_value=os.path.dirname(__file__),
)
CONFIG_HASH_FILENAME = "os_config_hash.json"
PRIVATE_CONFIG_HASH_FILENAME = "private_os_config_hash.json"
CONFIG_HASH_PATH = os.path.join(CONFIG_HASH_DIR_PATH, CONFIG_HASH_FILENAME)
PRIVATE_CONFIG_HASH_PATH = os.path.join(CONFIG_HASH_DIR_PATH, PRIVATE_CONFIG_HASH_FILENAME)
FIX_COMMAND = "starknet_os_config_hash_fix"


def run_starknet_os_config_hash_test(fix: bool):
    configs = {
        chain_id.name: StarknetOsConfig(
            chain_id=chain_id.value,
            deprecated_fee_token_address=CHAIN_ID_TO_DEPRECATED_FEE_TOKEN_ADDRESS[chain_id],
            fee_token_address=CHAIN_ID_TO_FEE_TOKEN_ADDRESS[chain_id],
        )
        for chain_id in StarknetChainId
    }
    config_hashes = {
        chain_id.name: hex(
            calculate_starknet_config_hash(starknet_os_config=configs[chain_id.name])
        )
        for chain_id in StarknetChainId
    }
    private_config_hashes = {
        chain_id.name: config_hashes[chain_id.name]
        for chain_id in StarknetChainId
        if chain_id.is_private()
    }
    public_config_hashes = {
        chain_id.name: config_hashes[chain_id.name]
        for chain_id in StarknetChainId
        if not chain_id.is_private()
    }

    if fix:
        with open(CONFIG_HASH_PATH, "w") as fp:
            fp.write(json.dumps(public_config_hashes, indent=4) + "\n")
        with open(PRIVATE_CONFIG_HASH_PATH, "w") as fp:
            fp.write(json.dumps(private_config_hashes, indent=4) + "\n")
        return

    # Assert all hashes in PRIVATE_CONFIG_HASH_PATH are for private chains and that all hashes in
    #   CONFIG_HASH_FILENAME are for public.
    public_expected_hashes = json.load(open(CONFIG_HASH_PATH))
    private_expected_hashes = json.load(open(PRIVATE_CONFIG_HASH_PATH))
    assert not any(
        (StarknetChainId[config_name].is_private() for config_name in public_expected_hashes)
    ), f"{CONFIG_HASH_FILENAME} should not contain any private chains' hashes."
    assert all(
        (StarknetChainId[config_name].is_private() for config_name in private_expected_hashes)
    ), f"{PRIVATE_CONFIG_HASH_FILENAME} should only contain private chains' hashes."

    # Assert the computed hashes are the same as the expected hashes.
    all_expected_hashes = {**public_expected_hashes, **private_expected_hashes}
    for config_name, computed_hash in config_hashes.items():
        assert (
            config_name in all_expected_hashes
        ), f"Missing StarkNet OS config hash for {config_name=}."
        expected_hash = all_expected_hashes[config_name]
        config_hash_filename = (
            PRIVATE_CONFIG_HASH_FILENAME
            if StarknetChainId[config_name].is_private()
            else CONFIG_HASH_FILENAME
        )
        assert expected_hash == computed_hash, (
            f"Wrong StarkNet OS config hash in {config_hash_filename}.\n"
            f"Computed hash: {computed_hash}. Expected: {expected_hash}.\n"
            f"Please run {FIX_COMMAND}."
        )
    assert len(all_expected_hashes) == len(
        config_hashes
    ), f"Unexpected hashes in {PRIVATE_CONFIG_HASH_FILENAME} or {CONFIG_HASH_FILENAME}."
