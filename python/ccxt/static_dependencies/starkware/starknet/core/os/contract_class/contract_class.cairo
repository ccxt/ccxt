from starkware.cairo.common.cairo_builtins import PoseidonBuiltin
from starkware.cairo.common.hash_state_poseidon import (
    HashState,
    hash_finalize,
    hash_init,
    hash_update_single,
    hash_update_with_nested_hash,
)
from starkware.starknet.common.storage import normalize_address

const CONTRACT_CLASS_VERSION = 'CONTRACT_CLASS_V0.1.0';

struct ContractEntryPoint {
    // A field element that encodes the signature of the called function.
    selector: felt,
    function_idx: felt,
}

struct ContractClass {
    contract_class_version: felt,

    // The length and pointer to the external entry point table of the contract.
    n_external_functions: felt,
    external_functions: ContractEntryPoint*,

    // The length and pointer to the L1 handler entry point table of the contract.
    n_l1_handlers: felt,
    l1_handlers: ContractEntryPoint*,

    // The length and pointer to the constructor entry point table of the contract.
    n_constructors: felt,
    constructors: ContractEntryPoint*,

    // starknet_keccak of the contract ABI.
    // Note that the OS does not enforce any constraints on this value.
    abi_hash: felt,

    // The length and pointer of the Sierra program.
    sierra_program_length: felt,
    sierra_program_ptr: felt*,
}

func class_hash{poseidon_ptr: PoseidonBuiltin*, range_check_ptr: felt}(
    contract_class: ContractClass*
) -> (hash: felt) {
    assert contract_class.contract_class_version = CONTRACT_CLASS_VERSION;

    let hash_state: HashState = hash_init();
    with hash_state {
        hash_update_single(item=contract_class.contract_class_version);

        // Hash external entry points.
        hash_update_with_nested_hash(
            data_ptr=contract_class.external_functions,
            data_length=contract_class.n_external_functions * ContractEntryPoint.SIZE,
        );

        // Hash L1 handler entry points.
        hash_update_with_nested_hash(
            data_ptr=contract_class.l1_handlers,
            data_length=contract_class.n_l1_handlers * ContractEntryPoint.SIZE,
        );

        // Hash constructor entry points.
        hash_update_with_nested_hash(
            data_ptr=contract_class.constructors,
            data_length=contract_class.n_constructors * ContractEntryPoint.SIZE,
        );

        // Hash abi_hash.
        hash_update_single(item=contract_class.abi_hash);

        // Hash Sierra program.
        hash_update_with_nested_hash(
            data_ptr=contract_class.sierra_program_ptr,
            data_length=contract_class.sierra_program_length,
        );
    }

    let hash: felt = hash_finalize(hash_state=hash_state);
    let (normalized_hash) = normalize_address(addr=hash);
    return (hash=normalized_hash);
}
