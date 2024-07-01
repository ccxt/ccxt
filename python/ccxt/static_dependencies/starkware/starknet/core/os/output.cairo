from starkware.cairo.common.cairo_builtins import PoseidonBuiltin
from starkware.cairo.common.registers import get_fp_and_pc
from starkware.cairo.common.segments import relocate_segment
from starkware.cairo.common.serialize import serialize_word
from starkware.starknet.core.os.data_availability.commitment import (
    OsKzgCommitmentInfo,
    compute_os_kzg_commitment_info,
)
from starkware.starknet.core.os.state.commitment import CommitmentUpdate
from starkware.starknet.core.os.state.output import (
    output_contract_class_da_changes,
    output_contract_state,
)
from starkware.starknet.core.os.state.state import SquashedOsStateUpdate

// Represents the output of the OS.
struct OsOutput {
    header: OsOutputHeader*,
    squashed_os_state_update: SquashedOsStateUpdate*,
    initial_carried_outputs: OsCarriedOutputs*,
    final_carried_outputs: OsCarriedOutputs*,
}

// The header of the OS output.
struct OsOutputHeader {
    state_update_output: CommitmentUpdate*,
    block_number: felt,
    // Currently, the block hash is not enforced by the OS.
    block_hash: felt,
    starknet_os_config_hash: felt,
    // Indicates whether to use KZG commitment scheme instead of adding the data-availability to
    // the transaction data.
    use_kzg_da: felt,
}

// An L2 to L1 message header, the message payload is concatenated to the end of the header.
struct MessageToL1Header {
    // The L2 address of the contract sending the message.
    from_address: felt,
    // The L1 address of the contract receiving the message.
    to_address: felt,
    payload_size: felt,
}

// An L1 to L2 message header, the message payload is concatenated to the end of the header.
struct MessageToL2Header {
    // The L1 address of the contract sending the message.
    from_address: felt,
    // The L2 address of the contract receiving the message.
    to_address: felt,
    nonce: felt,
    selector: felt,
    payload_size: felt,
}

// Holds all the information that StarkNet's OS needs to output.
struct OsCarriedOutputs {
    messages_to_l1: MessageToL1Header*,
    messages_to_l2: MessageToL2Header*,
}

func serialize_os_output{range_check_ptr, poseidon_ptr: PoseidonBuiltin*, output_ptr: felt*}(
    os_output: OsOutput*
) {
    alloc_locals;

    local use_kzg_da = os_output.header.use_kzg_da;

    // Compute the data availability segment.
    local state_updates_start: felt*;
    let state_updates_ptr = state_updates_start;
    %{
        if ids.use_kzg_da:
            ids.state_updates_start = segments.add()
        else:
            # Assign a temporary segment, to be relocated into the output segment.
            ids.state_updates_start = segments.add_temp_segment()
    %}
    local squashed_os_state_update: SquashedOsStateUpdate* = os_output.squashed_os_state_update;
    with state_updates_ptr {
        // Output the contract state diff.
        output_contract_state(
            contract_state_changes_start=squashed_os_state_update.contract_state_changes,
            n_contract_state_changes=squashed_os_state_update.n_contract_state_changes,
        );

        // Output the contract class diff.
        output_contract_class_da_changes(
            update_ptr=squashed_os_state_update.contract_class_changes,
            n_updates=squashed_os_state_update.n_class_updates,
        );
    }

    serialize_output_header(os_output_header=os_output.header);

    if (use_kzg_da != 0) {
        let os_kzg_commitment_info = compute_os_kzg_commitment_info(
            state_updates_start=state_updates_start, state_updates_end=state_updates_ptr
        );
        serialize_os_kzg_commitment_info(os_kzg_commitment_info=os_kzg_commitment_info);
        tempvar poseidon_ptr = poseidon_ptr;
        tempvar range_check_ptr = range_check_ptr;
    } else {
        // Align the stack with the `if` branch to avoid revoked references.
        tempvar output_ptr = output_ptr;
        tempvar poseidon_ptr = poseidon_ptr;
        tempvar range_check_ptr = range_check_ptr;
    }
    local range_check_ptr = range_check_ptr;
    local poseidon_ptr: PoseidonBuiltin* = poseidon_ptr;

    serialize_messages(
        initial_carried_outputs=os_output.initial_carried_outputs,
        final_carried_outputs=os_output.final_carried_outputs,
    );

    if (use_kzg_da == 0) {
        serialize_data_availability(
            state_updates_start=state_updates_start, state_updates_end=state_updates_ptr
        );
    }

    return ();
}

func os_carried_outputs_new(
    messages_to_l1: MessageToL1Header*, messages_to_l2: MessageToL2Header*
) -> (os_carried_outputs: OsCarriedOutputs*) {
    let (fp_val, pc_val) = get_fp_and_pc();
    static_assert OsCarriedOutputs.SIZE == Args.SIZE;
    return (os_carried_outputs=cast(fp_val - 2 - OsCarriedOutputs.SIZE, OsCarriedOutputs*));
}

// Serializes to output the constant-sized execution info needed for the L1 state update;
// for example, state roots and config hash.
func serialize_output_header{output_ptr: felt*}(os_output_header: OsOutputHeader*) {
    // Serialize program output.

    // Serialize roots.
    serialize_word(os_output_header.state_update_output.initial_root);
    serialize_word(os_output_header.state_update_output.final_root);
    serialize_word(os_output_header.block_number);
    serialize_word(os_output_header.block_hash);
    serialize_word(os_output_header.starknet_os_config_hash);
    serialize_word(os_output_header.use_kzg_da);

    return ();
}

// Serializes to output the L1<>L2 messages sent during the execution.
func serialize_messages{output_ptr: felt*}(
    initial_carried_outputs: OsCarriedOutputs*, final_carried_outputs: OsCarriedOutputs*
) {
    let messages_to_l1_segment_size = (
        final_carried_outputs.messages_to_l1 - initial_carried_outputs.messages_to_l1
    );
    serialize_word(messages_to_l1_segment_size);

    // Relocate 'messages_to_l1_segment' to the correct place in the output segment.
    relocate_segment(src_ptr=initial_carried_outputs.messages_to_l1, dest_ptr=output_ptr);
    let output_ptr = cast(final_carried_outputs.messages_to_l1, felt*);

    let messages_to_l2_segment_size = (
        final_carried_outputs.messages_to_l2 - initial_carried_outputs.messages_to_l2
    );
    serialize_word(messages_to_l2_segment_size);

    // Relocate 'messages_to_l2_segment' to the correct place in the output segment.
    relocate_segment(src_ptr=initial_carried_outputs.messages_to_l2, dest_ptr=output_ptr);
    let output_ptr = cast(final_carried_outputs.messages_to_l2, felt*);

    return ();
}

// Serializes OsKzgCommitmentInfo to output. Required for publishing data on L1 using KZG
// commitment; see `compute_os_kzg_commitment_info` documentation for more details.
func serialize_os_kzg_commitment_info{output_ptr: felt*}(
    os_kzg_commitment_info: OsKzgCommitmentInfo*
) {
    assert [cast(output_ptr, OsKzgCommitmentInfo*)] = [os_kzg_commitment_info];
    let output_ptr = output_ptr + OsKzgCommitmentInfo.SIZE;

    return ();
}

func serialize_data_availability{output_ptr: felt*}(
    state_updates_start: felt*, state_updates_end: felt*
) {
    let da_start = output_ptr;

    // Relocate 'state_updates_segment' to the correct place in the output segment.
    relocate_segment(src_ptr=state_updates_start, dest_ptr=output_ptr);
    let output_ptr = state_updates_end;

    %{
        from starkware.python.math_utils import div_ceil
        onchain_data_start = ids.da_start
        onchain_data_size = ids.output_ptr - onchain_data_start

        max_page_size = 3800
        n_pages = div_ceil(onchain_data_size, max_page_size)
        for i in range(n_pages):
            start_offset = i * max_page_size
            output_builtin.add_page(
                page_id=1 + i,
                page_start=onchain_data_start + start_offset,
                page_size=min(onchain_data_size - start_offset, max_page_size),
            )
        # Set the tree structure to a root with two children:
        # * A leaf which represents the main part
        # * An inner node for the onchain data part (which contains n_pages children).
        #
        # This is encoded using the following sequence:
        output_builtin.add_attribute('gps_fact_topology', [
            # Push 1 + n_pages pages (all of the pages).
            1 + n_pages,
            # Create a parent node for the last n_pages.
            n_pages,
            # Don't push additional pages.
            0,
            # Take the first page (the main part) and the node that was created (onchain data)
            # and use them to construct the root of the fact tree.
            2,
        ])
    %}

    return ();
}
