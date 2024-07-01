%builtins output pedersen range_check ecdsa bitwise ec_op keccak poseidon

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.bool import FALSE
from starkware.cairo.common.cairo_builtins import (
    BitwiseBuiltin,
    HashBuiltin,
    KeccakBuiltin,
    PoseidonBuiltin,
)
from starkware.cairo.common.dict import dict_new, dict_update
from starkware.cairo.common.dict_access import DictAccess
from starkware.cairo.common.math import assert_not_equal
from starkware.cairo.common.math_cmp import is_nn
from starkware.cairo.common.registers import get_label_location
from starkware.starknet.core.os.block_context import BlockContext, get_block_context
from starkware.starknet.core.os.constants import (
    BLOCK_HASH_CONTRACT_ADDRESS,
    STORED_BLOCK_HASH_BUFFER,
)
from starkware.starknet.core.os.execution.deprecated_execute_syscalls import (
    execute_deprecated_syscalls,
)
from starkware.starknet.core.os.execution.execute_syscalls import execute_syscalls
from starkware.starknet.core.os.execution.execute_transactions import execute_transactions
from starkware.starknet.core.os.os_config.os_config import get_starknet_os_config_hash
from starkware.starknet.core.os.output import (
    OsCarriedOutputs,
    OsOutput,
    OsOutputHeader,
    serialize_os_output,
)
from starkware.starknet.core.os.state.commitment import StateEntry
from starkware.starknet.core.os.state.state import OsStateUpdate, state_update

// Executes transactions on Starknet.
func main{
    output_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr,
    ecdsa_ptr,
    bitwise_ptr: BitwiseBuiltin*,
    ec_op_ptr,
    keccak_ptr: KeccakBuiltin*,
    poseidon_ptr: PoseidonBuiltin*,
}() {
    alloc_locals;

    // Reserve the initial range check for self validation.
    // Note that this must point to the first range check used by the OS.
    let initial_range_check_ptr = range_check_ptr;
    let range_check_ptr = range_check_ptr + 1;

    let (initial_carried_outputs: OsCarriedOutputs*) = alloc();
    %{
        from starkware.starknet.core.os.os_input import StarknetOsInput

        os_input = StarknetOsInput.load(data=program_input)

        ids.initial_carried_outputs.messages_to_l1 = segments.add_temp_segment()
        ids.initial_carried_outputs.messages_to_l2 = segments.add_temp_segment()
    %}

    // Build block context.
    let (execute_syscalls_ptr) = get_label_location(label_value=execute_syscalls);
    let (execute_deprecated_syscalls_ptr) = get_label_location(
        label_value=execute_deprecated_syscalls
    );
    let (block_context: BlockContext*) = get_block_context(
        execute_syscalls_ptr=execute_syscalls_ptr,
        execute_deprecated_syscalls_ptr=execute_deprecated_syscalls_ptr,
    );

    let (
        contract_state_changes: DictAccess*, contract_class_changes: DictAccess*
    ) = initialize_state_changes();

    // Keep a reference to the start of contract_state_changes and contract_class_changes.
    let contract_state_changes_start = contract_state_changes;
    let contract_class_changes_start = contract_class_changes;

    // Pre-process block.
    with contract_state_changes {
        write_block_number_to_block_hash_mapping(block_context=block_context);
    }

    // Execute transactions.
    let outputs = initial_carried_outputs;
    with contract_state_changes, contract_class_changes, outputs {
        let (local reserved_range_checks_end) = execute_transactions(block_context=block_context);
    }
    let final_carried_outputs = outputs;

    %{
        # This hint shouldn't be whitelisted.
        vm_enter_scope(dict(
            commitment_info_by_address=execution_helper.compute_storage_commitments(),
            os_input=os_input,
        ))
    %}

    let (squashed_os_state_update, state_update_output) = state_update{hash_ptr=pedersen_ptr}(
        os_state_update=OsStateUpdate(
            contract_state_changes_start=contract_state_changes_start,
            contract_state_changes_end=contract_state_changes,
            contract_class_changes_start=contract_class_changes_start,
            contract_class_changes_end=contract_class_changes,
        ),
    );

    %{ vm_exit_scope() %}

    // Compute the general config hash.
    // This is done here to avoid passing pedersen_ptr to serialize_output_header.
    let hash_ptr = pedersen_ptr;
    with hash_ptr {
        let (starknet_os_config_hash) = get_starknet_os_config_hash(
            starknet_os_config=&block_context.starknet_os_config
        );
    }
    let pedersen_ptr = hash_ptr;

    // Guess whether to use KZG commitment scheme.
    local use_kzg_da = nondet %{ syscall_handler.block_info.use_kzg_da %};

    // Serialize OS output.

    // Currently, the block hash is not enforced by the OS.
    serialize_os_output(
        os_output=new OsOutput(
            header=new OsOutputHeader(
                state_update_output=state_update_output,
                block_number=block_context.block_info.block_number,
                block_hash=nondet %{ os_input.block_hash %},
                starknet_os_config_hash=starknet_os_config_hash,
                use_kzg_da=use_kzg_da,
            ),
            squashed_os_state_update=squashed_os_state_update,
            initial_carried_outputs=initial_carried_outputs,
            final_carried_outputs=final_carried_outputs,
        ),
    );

    // Make sure that we report using at least 1 range check to guarantee that
    // initial_range_check_ptr points to a valid range check instance.
    assert_not_equal(initial_range_check_ptr, range_check_ptr);
    // Use initial_range_check_ptr to check that range_check_ptr >= reserved_range_checks_end.
    // This should guarantee that all the reserved range checks point to valid instances.
    assert [initial_range_check_ptr] = range_check_ptr - reserved_range_checks_end;

    return ();
}

// Initializes state changes dictionaries.
func initialize_state_changes() -> (
    contract_state_changes: DictAccess*, contract_class_changes: DictAccess*
) {
    %{
        from starkware.python.utils import from_bytes

        initial_dict = {
            address: segments.gen_arg(
                (from_bytes(contract.contract_hash), segments.add(), contract.nonce))
            for address, contract in os_input.contracts.items()
        }
    %}
    // A dictionary from contract address to a dict of storage changes of type StateEntry.
    let (contract_state_changes: DictAccess*) = dict_new();

    %{ initial_dict = os_input.class_hash_to_compiled_class_hash %}
    // A dictionary from class hash to compiled class hash (Casm).
    let (contract_class_changes: DictAccess*) = dict_new();

    return (
        contract_state_changes=contract_state_changes, contract_class_changes=contract_class_changes
    );
}

// Writes the hash of the (current_block_number - buffer) block under its block number in the
// dedicated contract state, where buffer=STORED_BLOCK_HASH_BUFFER.
func write_block_number_to_block_hash_mapping{range_check_ptr, contract_state_changes: DictAccess*}(
    block_context: BlockContext*
) {
    alloc_locals;
    tempvar old_block_number = block_context.block_info.block_number - STORED_BLOCK_HASH_BUFFER;
    let is_old_block_number_non_negative = is_nn(old_block_number);
    if (is_old_block_number_non_negative == FALSE) {
        // Not enough blocks in the system - nothing to write.
        return ();
    }

    // Fetch the (block number -> block hash) mapping contract state.
    local state_entry: StateEntry*;
    %{
        ids.state_entry = __dict_manager.get_dict(ids.contract_state_changes)[
            ids.BLOCK_HASH_CONTRACT_ADDRESS
        ]
    %}

    // Currently, the block hash mapping is not enforced by the OS.
    local old_block_hash;
    %{
        (
            old_block_number, old_block_hash
        ) = execution_helper.get_old_block_number_and_hash()
        assert old_block_number == ids.old_block_number,(
            "Inconsistent block number. "
            "The constant STORED_BLOCK_HASH_BUFFER is probably out of sync."
        )
        ids.old_block_hash = old_block_hash
    %}

    // Update mapping.
    assert state_entry.class_hash = 0;
    assert state_entry.nonce = 0;
    tempvar storage_ptr = state_entry.storage_ptr;
    assert [storage_ptr] = DictAccess(key=old_block_number, prev_value=0, new_value=old_block_hash);
    let storage_ptr = storage_ptr + DictAccess.SIZE;
    %{
        storage = execution_helper.storage_by_address[ids.BLOCK_HASH_CONTRACT_ADDRESS]
        storage.write(key=ids.old_block_number, value=ids.old_block_hash)
    %}

    // Update contract state.
    tempvar new_state_entry = new StateEntry(class_hash=0, storage_ptr=storage_ptr, nonce=0);
    dict_update{dict_ptr=contract_state_changes}(
        key=BLOCK_HASH_CONTRACT_ADDRESS,
        prev_value=cast(state_entry, felt),
        new_value=cast(new_state_entry, felt),
    );
    return ();
}
