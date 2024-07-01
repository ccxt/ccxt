from starkware.cairo.common.dict import DictAccess
from starkware.cairo.common.math import assert_nn_le
from starkware.cairo.common.math_cmp import is_not_zero
from starkware.starknet.core.os.state.commitment import StateEntry

// The on-chain data for contract state changes has the following format:
//
// * The number of affected contracts.
// * For each contract:
//   * Header:
//     * The contract address (1 word).
//     * 1 word with the following info:
//       * A flag indicating whether the class hash was updated,
//       * the number of entry updates,
//       * and the new nonce:
//          +-------+-----------+-----------+ LSB
//          | flag  | new nonce | n_updates |
//          | 1 bit | 64 bits   | 64 bits   |
//          +-------+-----------+-----------+
//   * The class hash for this contract (if it was updated) (0 or 1 word).
//   * For each entry update:
//       * key (1 word).
//       * new value (1 word).
//
// The on-chain data for contract class changes has the following format:
// * The number of classes that have been declared.
// * For each contract class:
//   * The class hash (1 word).
//   * The compiled class hash (casm, 1 word).

// A bound on the number of contract state entry updates in a contract.
const N_UPDATES_BOUND = 2 ** 64;
// A bound on the nonce of a contract.
const NONCE_BOUND = 2 ** 64;

// Represents an update of a state entry; Either a contract state entry of a contract or a
// contract class entry in the contract class hash mapping.
struct StateUpdateEntry {
    // The entry's key.
    key: felt,
    // The new value.
    value: felt,
}

func serialize_da_changes{state_updates: StateUpdateEntry*}(
    update_ptr: DictAccess*, n_updates: felt
) {
    if (n_updates == 0) {
        return ();
    }
    if (update_ptr.prev_value == update_ptr.new_value) {
        tempvar state_updates = state_updates;
    } else {
        assert [state_updates] = StateUpdateEntry(key=update_ptr.key, value=update_ptr.new_value);
        tempvar state_updates = state_updates + StateUpdateEntry.SIZE;
    }
    return serialize_da_changes(update_ptr=update_ptr + DictAccess.SIZE, n_updates=n_updates - 1);
}

// Writes the changed values in the contract state into `state_updates_ptr`
// to make this data available on-chain.
// See documentation in the beginning of the file for more information.
//
// Assumption: The dictionary `contract_state_changes_start` is squashed.
func output_contract_state{range_check_ptr, state_updates_ptr: felt*}(
    contract_state_changes_start: DictAccess*, n_contract_state_changes: felt
) {
    alloc_locals;

    // Make room for number of state updates.
    let output_n_updates = [state_updates_ptr];
    let state_updates_ptr = state_updates_ptr + 1;
    let n_actual_state_changes = 0;

    with n_actual_state_changes {
        output_contract_state_inner(
            n_contract_state_changes=n_contract_state_changes,
            state_changes=contract_state_changes_start,
        );
    }
    // Write number of state updates.
    assert output_n_updates = n_actual_state_changes;

    return ();
}

// Helper function for `output_contract_state()`.
//
// Increases `n_actual_state_changes` by the number of contracts with state changes.
func output_contract_state_inner{range_check_ptr, state_updates_ptr: felt*, n_actual_state_changes}(
    n_contract_state_changes: felt, state_changes: DictAccess*
) {
    if (n_contract_state_changes == 0) {
        return ();
    }
    alloc_locals;

    local prev_state: StateEntry* = cast(state_changes.prev_value, StateEntry*);
    local new_state: StateEntry* = cast(state_changes.new_value, StateEntry*);
    local new_state_nonce = new_state.nonce;

    local storage_dict_start: DictAccess* = prev_state.storage_ptr;
    let storage_dict_end: DictAccess* = new_state.storage_ptr;
    local n_updates = (storage_dict_end - storage_dict_start) / DictAccess.SIZE;

    // Write contract state updates to output (state_updates_ptr).

    // Prepare updates.
    let contract_header = state_updates_ptr;

    // Class hash.
    local was_class_updated = is_not_zero(prev_state.class_hash - new_state.class_hash);
    const BASE_HEADER_SIZE = 2;
    if (was_class_updated != 0) {
        // Write the new class hash.
        assert contract_header[BASE_HEADER_SIZE] = new_state.class_hash;
        // The offset of the storage diff from the header.
        tempvar storage_diff_offset = BASE_HEADER_SIZE + 1;
    } else {
        tempvar storage_diff_offset = BASE_HEADER_SIZE;
    }

    local storage_diff_start: StateUpdateEntry* = cast(
        contract_header + storage_diff_offset, StateUpdateEntry*
    );
    let storage_diff = storage_diff_start;
    serialize_da_changes{state_updates=storage_diff}(
        update_ptr=storage_dict_start, n_updates=n_updates
    );

    // Number of actual updates.
    local n_updates = (storage_diff - storage_diff_start) / StateUpdateEntry.SIZE;

    if (n_updates == 0 and new_state_nonce == prev_state.nonce and was_class_updated == 0) {
        // There are no updates for this contract.
        return output_contract_state_inner(
            n_contract_state_changes=n_contract_state_changes - 1, state_changes=&state_changes[1]
        );
    }

    // Complete the header; Write contract address.
    assert contract_header[0] = state_changes.key;

    // Write the second word of the header.
    // Write 'was class update' flag.
    let value = was_class_updated;
    // Write the nonce.
    assert_nn_le(new_state_nonce, NONCE_BOUND - 1);
    let value = value * NONCE_BOUND + new_state_nonce;
    // Write the number of updates.
    assert_nn_le(n_updates, N_UPDATES_BOUND - 1);
    let value = value * N_UPDATES_BOUND + n_updates;
    assert contract_header[1] = value;

    let state_updates_ptr = cast(storage_diff, felt*);
    let n_actual_state_changes = n_actual_state_changes + 1;

    return output_contract_state_inner(
        n_contract_state_changes=n_contract_state_changes - 1, state_changes=&state_changes[1]
    );
}

// Serializes changes in the contract class tree into 'state_updates_ptr'.
func output_contract_class_da_changes{state_updates_ptr: felt*}(
    update_ptr: DictAccess*, n_updates: felt
) {
    alloc_locals;

    // Allocate space for the number of changes.
    let n_diffs_output_placeholder = state_updates_ptr[0];
    let state_updates_ptr = &state_updates_ptr[1];

    // Write the updates.
    local state_updates: StateUpdateEntry* = cast(state_updates_ptr, StateUpdateEntry*);
    let state_updates_start = state_updates;
    with state_updates {
        serialize_da_changes(update_ptr=update_ptr, n_updates=n_updates);
    }
    let state_updates_ptr = cast(state_updates, felt*);

    // Write the number of updates.
    let n_diffs = (state_updates - state_updates_start) / StateUpdateEntry.SIZE;
    assert n_diffs_output_placeholder = n_diffs;

    return ();
}
