from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.hash_state import hash_finalize, hash_init, hash_update_single
from starkware.cairo.common.registers import get_fp_and_pc

const STARKNET_OS_CONFIG_VERSION = 'StarknetOsConfig2';

struct StarknetOsConfig {
    // The identifier of the chain.
    // This field can be used to prevent replay of testnet transactions on mainnet.
    chain_id: felt,
    // The (L2) address of the old fee token contract.
    deprecated_fee_token_address: felt,
    // The (L2) address of the fee token contract.
    fee_token_address: felt,
}

// Calculates the hash of StarkNet OS config.
func get_starknet_os_config_hash{hash_ptr: HashBuiltin*}(starknet_os_config: StarknetOsConfig*) -> (
    starknet_os_config_hash: felt
) {
    let (hash_state_ptr) = hash_init();
    let (hash_state_ptr) = hash_update_single(
        hash_state_ptr=hash_state_ptr, item=STARKNET_OS_CONFIG_VERSION
    );
    let (hash_state_ptr) = hash_update_single(
        hash_state_ptr=hash_state_ptr, item=starknet_os_config.chain_id
    );
    let (hash_state_ptr) = hash_update_single(
        hash_state_ptr=hash_state_ptr, item=starknet_os_config.deprecated_fee_token_address
    );
    let (hash_state_ptr) = hash_update_single(
        hash_state_ptr=hash_state_ptr, item=starknet_os_config.fee_token_address
    );

    let (starknet_os_config_hash) = hash_finalize(hash_state_ptr=hash_state_ptr);

    return (starknet_os_config_hash=starknet_os_config_hash);
}
