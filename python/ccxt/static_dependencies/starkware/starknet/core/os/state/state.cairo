from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin, PoseidonBuiltin
from starkware.cairo.common.dict import DictAccess, squash_dict
from starkware.cairo.common.patricia import patricia_update_constants_new
from starkware.cairo.common.patricia_utils import PatriciaUpdateConstants
from starkware.starknet.core.os.state.commitment import (
    MERKLE_HEIGHT,
    CommitmentUpdate,
    calculate_global_state_root,
    compute_class_commitment,
    compute_contract_state_commitment,
)
from starkware.starknet.core.os.state.squash import squash_class_changes, squash_state_changes

// Represents the changes in the state of the system.
struct OsStateUpdate {
    // A pointer to the beginning of the state changes dict.
    contract_state_changes_start: DictAccess*,
    // A pointer to the end of the state changes dict.
    contract_state_changes_end: DictAccess*,
    // A pointer to the beginning of the contract class changes dict.
    contract_class_changes_start: DictAccess*,
    // A pointer to the end of the contract class changes dict.
    contract_class_changes_end: DictAccess*,
}

struct SquashedOsStateUpdate {
    // A pointer to the beginning of the state changes dict.
    contract_state_changes: DictAccess*,
    // The size of the contract state changes dict.
    n_contract_state_changes: felt,
    // A pointer to the beginning of the contract class changes dict.
    contract_class_changes: DictAccess*,
    // The size of the contract class changes dict.
    n_class_updates: felt,
}

// Performs the commitment tree updates required for (validating and) updating the global state.
// Returns a CommitmentUpdate struct.
func state_update{poseidon_ptr: PoseidonBuiltin*, hash_ptr: HashBuiltin*, range_check_ptr}(
    os_state_update: OsStateUpdate
) -> (squashed_os_state_update: SquashedOsStateUpdate*, state_update_output: CommitmentUpdate*) {
    alloc_locals;

    // Create PatriciaUpdateConstants struct for patricia update.
    let (local patricia_update_constants: PatriciaUpdateConstants*) = patricia_update_constants_new(
        );

    // Squash the contract state tree.
    let (n_contract_state_changes, squashed_contract_state_dict) = squash_state_changes(
        contract_state_changes_start=os_state_update.contract_state_changes_start,
        contract_state_changes_end=os_state_update.contract_state_changes_end,
    );

    // Compute the contract state commitment.
    let contract_state_tree_update_output = compute_contract_state_commitment(
        contract_state_changes_start=squashed_contract_state_dict,
        n_contract_state_changes=n_contract_state_changes,
        patricia_update_constants=patricia_update_constants,
    );

    // Squash the contract class tree.
    let (n_class_updates, squashed_class_changes) = squash_class_changes(
        class_changes_start=os_state_update.contract_class_changes_start,
        class_changes_end=os_state_update.contract_class_changes_end,
    );

    // Update the contract class tree.
    let (contract_class_tree_update_output) = compute_class_commitment(
        class_changes_start=squashed_class_changes,
        n_class_updates=n_class_updates,
        patricia_update_constants=patricia_update_constants,
    );

    // Compute the initial and final roots of the global state.
    let (local initial_global_root) = calculate_global_state_root(
        contract_state_root=contract_state_tree_update_output.initial_root,
        contract_class_root=contract_class_tree_update_output.initial_root,
    );
    let (local final_global_root) = calculate_global_state_root(
        contract_state_root=contract_state_tree_update_output.final_root,
        contract_class_root=contract_class_tree_update_output.final_root,
    );

    // Prepare the return values.
    tempvar squashed_os_state_update = new SquashedOsStateUpdate(
        contract_state_changes=squashed_contract_state_dict,
        n_contract_state_changes=n_contract_state_changes,
        contract_class_changes=squashed_class_changes,
        n_class_updates=n_class_updates,
    );

    tempvar state_update_output = new CommitmentUpdate(
        initial_root=initial_global_root, final_root=final_global_root
    );

    return (
        squashed_os_state_update=squashed_os_state_update, state_update_output=state_update_output
    );
}
