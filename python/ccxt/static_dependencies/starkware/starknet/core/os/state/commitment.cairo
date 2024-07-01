from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.builtin_poseidon.poseidon import poseidon_hash, poseidon_hash_many
from starkware.cairo.common.cairo_builtins import HashBuiltin, PoseidonBuiltin
from starkware.cairo.common.dict import DictAccess
from starkware.cairo.common.hash import hash2
from starkware.cairo.common.patricia import patricia_update_using_update_constants
from starkware.cairo.common.patricia_utils import PatriciaUpdateConstants
from starkware.cairo.common.patricia_with_poseidon import (
    patricia_update_using_update_constants as patricia_update_using_update_constants_with_poseidon,
)

const MERKLE_HEIGHT = 251;  // PRIME.bit_length() - 1.
const UNINITIALIZED_CLASS_HASH = 0;
const GLOBAL_STATE_VERSION = 'STARKNET_STATE_V0';
const CONTRACT_CLASS_LEAF_VERSION = 'CONTRACT_CLASS_LEAF_V0';

struct CommitmentUpdate {
    initial_root: felt,
    final_root: felt,
}

struct StateEntry {
    class_hash: felt,
    storage_ptr: DictAccess*,
    nonce: felt,
}

// Calculates and returns the global state root given the contract state root and
// the contract class state root.
// If both the contract class and contract state trees are empty, the global root is set to 0.
// If the contract class tree is empty, the global state root is equal to the
// contract state root (for backward compatibility);
// Otherwise, the global root is obtained by:
//     global_root = H(GLOBAL_STATE_VERSION, contract_state_root, contract_class_root).
func calculate_global_state_root{poseidon_ptr: PoseidonBuiltin*, range_check_ptr}(
    contract_state_root: felt, contract_class_root: felt
) -> (global_root: felt) {
    if (contract_state_root == 0 and contract_class_root == 0) {
        // The state is empty.
        return (global_root=0);
    }

    // Backward compatibility; Used during the migration from a state without a
    // contract class tree to a state with a contract class tree.
    if (contract_class_root == 0) {
        // The contract classes' state is empty.
        return (global_root=contract_state_root);
    }

    tempvar elements: felt* = new (GLOBAL_STATE_VERSION, contract_state_root, contract_class_root);
    let (global_root) = poseidon_hash_many(n=3, elements=elements);
    return (global_root=global_root);
}

func get_contract_state_hash{hash_ptr: HashBuiltin*}(
    class_hash: felt, storage_root: felt, nonce: felt
) -> (hash: felt) {
    const CONTRACT_STATE_HASH_VERSION = 0;
    if (class_hash == UNINITIALIZED_CLASS_HASH) {
        if (storage_root == 0) {
            if (nonce == 0) {
                return (hash=0);
            }
        }
    }

    // Set res = H(H(class_hash, storage_root), nonce).
    let (hash_value) = hash2(class_hash, storage_root);
    let (hash_value) = hash2(hash_value, nonce);

    // Return H(hash_value, CONTRACT_STATE_HASH_VERSION). CONTRACT_STATE_HASH_VERSION must be in the
    // outermost hash to guarantee unique "decoding".
    let (hash) = hash2(hash_value, CONTRACT_STATE_HASH_VERSION);
    return (hash=hash);
}

// Computes the previous and new commitments to the contract state.
//
// Assumption: The dictionary `contract_state_changes_start` is squashed.
func compute_contract_state_commitment{hash_ptr: HashBuiltin*, range_check_ptr}(
    contract_state_changes_start: DictAccess*,
    n_contract_state_changes: felt,
    patricia_update_constants: PatriciaUpdateConstants*,
) -> CommitmentUpdate {
    alloc_locals;

    // Hash the entries of the contract state changes to prepare the input for the commitment tree
    // multi-update.
    let (local hashed_state_changes: DictAccess*) = alloc();
    compute_contract_state_commitment_inner(
        state_changes=contract_state_changes_start,
        n_contract_state_changes=n_contract_state_changes,
        hashed_state_changes=hashed_state_changes,
        patricia_update_constants=patricia_update_constants,
    );

    // Compute the initial and final roots of the contracts' state tree.
    local initial_root;
    local final_root;

    %{
        ids.initial_root = os_input.contract_state_commitment_info.previous_root
        ids.final_root = os_input.contract_state_commitment_info.updated_root
        preimage = {
            int(root): children
            for root, children in os_input.contract_state_commitment_info.commitment_facts.items()
        }
        assert os_input.contract_state_commitment_info.tree_height == ids.MERKLE_HEIGHT
    %}

    // Call patricia_update_using_update_constants() instead of patricia_update()
    // in order not to repeat globals_pow2 calculation.
    patricia_update_using_update_constants(
        patricia_update_constants=patricia_update_constants,
        update_ptr=hashed_state_changes,
        n_updates=n_contract_state_changes,
        height=MERKLE_HEIGHT,
        prev_root=initial_root,
        new_root=final_root,
    );

    return (CommitmentUpdate(initial_root=initial_root, final_root=final_root));
}

// Helper function for `compute_contract_state_commitment()`.
func compute_contract_state_commitment_inner{hash_ptr: HashBuiltin*, range_check_ptr}(
    state_changes: DictAccess*,
    n_contract_state_changes: felt,
    hashed_state_changes: DictAccess*,
    patricia_update_constants: PatriciaUpdateConstants*,
) {
    if (n_contract_state_changes == 0) {
        return ();
    }
    alloc_locals;

    // Compute the previous and new hash of the contract state and write the result into
    // hashed_state_changes[0].
    hash_contract_state_changes(
        contract_address=state_changes.key,
        prev_state=cast(state_changes.prev_value, StateEntry*),
        new_state=cast(state_changes.new_value, StateEntry*),
        patricia_update_constants=patricia_update_constants,
        hashed_state_changes=&hashed_state_changes[0],
    );

    return compute_contract_state_commitment_inner(
        state_changes=&state_changes[1],
        n_contract_state_changes=n_contract_state_changes - 1,
        hashed_state_changes=&hashed_state_changes[1],
        patricia_update_constants=patricia_update_constants,
    );
}

// Takes two `StateEntry` objects, representing the state of a contract before and after,
// and computes the previous and new contract hash in the contract tree.
//
// Assumption: The dict representing the storage changes (`StateEntry::storage_ptr`) is squashed.
// The output is written into `hashed_state_changes`.
func hash_contract_state_changes{hash_ptr: HashBuiltin*, range_check_ptr}(
    contract_address: felt,
    prev_state: StateEntry*,
    new_state: StateEntry*,
    patricia_update_constants: PatriciaUpdateConstants*,
    hashed_state_changes: DictAccess*,
) {
    alloc_locals;

    local initial_contract_state_root;
    local final_contract_state_root;

    %{
        commitment_info = commitment_info_by_address[ids.contract_address]
        ids.initial_contract_state_root = commitment_info.previous_root
        ids.final_contract_state_root = commitment_info.updated_root
        preimage = {
            int(root): children
            for root, children in commitment_info.commitment_facts.items()
        }
        assert commitment_info.tree_height == ids.MERKLE_HEIGHT
    %}

    local state_dict_start: DictAccess* = prev_state.storage_ptr;
    local state_dict_end: DictAccess* = new_state.storage_ptr;
    local n_updates = (state_dict_end - state_dict_start) / DictAccess.SIZE;
    // Call patricia_update_using_update_constants() instead of patricia_update()
    // in order not to repeat globals_pow2 calculation.
    patricia_update_using_update_constants(
        patricia_update_constants=patricia_update_constants,
        update_ptr=state_dict_start,
        n_updates=n_updates,
        height=MERKLE_HEIGHT,
        prev_root=initial_contract_state_root,
        new_root=final_contract_state_root,
    );

    let (prev_value) = get_contract_state_hash(
        class_hash=prev_state.class_hash,
        storage_root=initial_contract_state_root,
        nonce=prev_state.nonce,
    );
    assert hashed_state_changes.prev_value = prev_value;
    let (new_value) = get_contract_state_hash(
        class_hash=new_state.class_hash,
        storage_root=final_contract_state_root,
        nonce=new_state.nonce,
    );

    assert hashed_state_changes.new_value = new_value;
    assert hashed_state_changes.key = contract_address;

    return ();
}

// Hashes a contract class leaf.
// A contract class leaf contains a compiled class hash and the leaf version.
// Returns H(compiled_class_hash, leaf_version).
func get_contract_class_leaf_hash{poseidon_ptr: PoseidonBuiltin*}(compiled_class_hash: felt) -> (
    hash: felt
) {
    if (compiled_class_hash == UNINITIALIZED_CLASS_HASH) {
        return (hash=0);
    }

    // Return H(CONTRACT_CLASS_LEAF_VERSION, compiled_class_hash).
    let (hash_value) = poseidon_hash(CONTRACT_CLASS_LEAF_VERSION, compiled_class_hash);
    return (hash=hash_value);
}

// Takes a dict mapping class hash to compiled class hash and produces
// a dict mapping class hash to the corresponding leaf hash input dict.
// The output is written to 'hashed_state_changes'.
func hash_class_changes{poseidon_ptr: PoseidonBuiltin*}(
    n_class_updates: felt, class_changes: DictAccess*, hashed_class_changes: DictAccess*
) {
    if (n_class_updates == 0) {
        return ();
    }

    alloc_locals;

    let (local prev_value) = get_contract_class_leaf_hash(
        compiled_class_hash=class_changes.prev_value
    );
    let (new_value) = get_contract_class_leaf_hash(compiled_class_hash=class_changes.new_value);
    assert hashed_class_changes[0] = DictAccess(
        key=class_changes.key, prev_value=prev_value, new_value=new_value
    );

    return hash_class_changes(
        n_class_updates=n_class_updates - 1,
        class_changes=&class_changes[1],
        hashed_class_changes=&hashed_class_changes[1],
    );
}

// Performs the commitment tree updates required for (validating and) updating the
// contract class tree.
// Returns a CommitmentUpdate struct for the tree.
//
// Assumption: The dictionary `class_changes_start` is squashed.
func compute_class_commitment{poseidon_ptr: PoseidonBuiltin*, range_check_ptr}(
    class_changes_start: DictAccess*,
    n_class_updates: felt,
    patricia_update_constants: PatriciaUpdateConstants*,
) -> (contract_class_tree_update_output: CommitmentUpdate) {
    alloc_locals;

    // Guess the initial and final roots of the contract class tree.
    local initial_root;
    local final_root;
    %{
        ids.initial_root = os_input.contract_class_commitment_info.previous_root
        ids.final_root = os_input.contract_class_commitment_info.updated_root
        preimage = {
            int(root): children
            for root, children in os_input.contract_class_commitment_info.commitment_facts.items()
        }
        assert os_input.contract_class_commitment_info.tree_height == ids.MERKLE_HEIGHT
    %}

    // Create a dictionary mapping class hash to the contract class leaf hash,
    // to prepare the input for the commitment tree update.
    let (local hashed_class_changes: DictAccess*) = alloc();
    hash_class_changes(
        n_class_updates=n_class_updates,
        class_changes=class_changes_start,
        hashed_class_changes=hashed_class_changes,
    );

    // Call patricia_update_using_update_constants() instead of patricia_update()
    // in order not to repeat globals_pow2 calculation.
    patricia_update_using_update_constants_with_poseidon(
        patricia_update_constants=patricia_update_constants,
        update_ptr=hashed_class_changes,
        n_updates=n_class_updates,
        height=MERKLE_HEIGHT,
        prev_root=initial_root,
        new_root=final_root,
    );

    return (
        contract_class_tree_update_output=CommitmentUpdate(
            initial_root=initial_root, final_root=final_root
        ),
    );
}
