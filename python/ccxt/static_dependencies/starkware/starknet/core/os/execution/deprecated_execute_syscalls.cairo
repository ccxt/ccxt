from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import KeccakBuiltin
from starkware.cairo.common.dict import dict_read, dict_update
from starkware.cairo.common.dict_access import DictAccess
from starkware.cairo.common.find_element import find_element
from starkware.cairo.common.math import assert_not_zero
from starkware.cairo.common.memcpy import memcpy
from starkware.cairo.common.segments import relocate_segment
from starkware.starknet.common.constants import ORIGIN_ADDRESS
from starkware.starknet.common.new_syscalls import ExecutionInfo
from starkware.starknet.common.syscalls import (
    CALL_CONTRACT_SELECTOR,
    DELEGATE_CALL_SELECTOR,
    DELEGATE_L1_HANDLER_SELECTOR,
    DEPLOY_SELECTOR,
    EMIT_EVENT_SELECTOR,
    GET_BLOCK_NUMBER_SELECTOR,
    GET_BLOCK_TIMESTAMP_SELECTOR,
    GET_CALLER_ADDRESS_SELECTOR,
    GET_CONTRACT_ADDRESS_SELECTOR,
    GET_SEQUENCER_ADDRESS_SELECTOR,
    GET_TX_INFO_SELECTOR,
    GET_TX_SIGNATURE_SELECTOR,
    LIBRARY_CALL_L1_HANDLER_SELECTOR,
    LIBRARY_CALL_SELECTOR,
    REPLACE_CLASS_SELECTOR,
    SEND_MESSAGE_TO_L1_SELECTOR,
    STORAGE_READ_SELECTOR,
    STORAGE_WRITE_SELECTOR,
    CallContract,
    CallContractResponse,
    Deploy,
    DeployResponse,
    EmitEvent,
    GetBlockNumber,
    GetBlockNumberResponse,
    GetBlockTimestamp,
    GetBlockTimestampResponse,
    GetCallerAddress,
    GetCallerAddressResponse,
    GetContractAddress,
    GetContractAddressResponse,
    GetSequencerAddress,
    GetSequencerAddressResponse,
    GetTxInfo,
    GetTxInfoResponse,
    GetTxSignature,
    GetTxSignatureResponse,
    LibraryCall,
    ReplaceClass,
    SendMessageToL1SysCall,
    StorageRead,
    StorageWrite,
)
from starkware.starknet.core.os.block_context import BlockContext
from starkware.starknet.core.os.builtins import (
    BuiltinPointers,
    NonSelectableBuiltins,
    SelectableBuiltins,
)
from starkware.starknet.core.os.constants import (
    BLOCK_HASH_CONTRACT_ADDRESS,
    CONSTRUCTOR_ENTRY_POINT_SELECTOR,
    ENTRY_POINT_TYPE_CONSTRUCTOR,
    ENTRY_POINT_TYPE_EXTERNAL,
    ENTRY_POINT_TYPE_L1_HANDLER,
    INITIAL_GAS_COST,
)
from starkware.starknet.core.os.contract_address.contract_address import get_contract_address
from starkware.starknet.core.os.execution.deprecated_execute_entry_point import (
    select_execute_entry_point_func,
)
from starkware.starknet.core.os.execution.execute_entry_point import ExecutionContext
from starkware.starknet.core.os.output import (
    MessageToL1Header,
    OsCarriedOutputs,
    os_carried_outputs_new,
)
from starkware.starknet.core.os.state.commitment import UNINITIALIZED_CLASS_HASH, StateEntry

// Calls execute_entry_point and generates the corresponding CallContractResponse.
func contract_call_helper{
    range_check_ptr,
    builtin_ptrs: BuiltinPointers*,
    contract_state_changes: DictAccess*,
    contract_class_changes: DictAccess*,
    outputs: OsCarriedOutputs*,
}(
    block_context: BlockContext*,
    execution_context: ExecutionContext*,
    call_response: CallContractResponse*,
) {
    // Set enough gas for this call to succeed.
    // This is needed since the caller contract is of version 0 and has no notion of gas, and
    // the callee may be of version 1.0.
    let remaining_gas = INITIAL_GAS_COST;
    with remaining_gas {
        let (retdata_size, retdata, _is_deprecated) = select_execute_entry_point_func(
            block_context=block_context, execution_context=execution_context
        );
    }
    %{
        # Check that the actual return value matches the expected one.
        expected = memory.get_range(
            addr=ids.call_response.retdata, size=ids.call_response.retdata_size
        )
        actual = memory.get_range(addr=ids.retdata, size=ids.retdata_size)

        assert expected == actual, f'Return value mismatch expected={expected}, actual={actual}.'
    %}
    relocate_segment(src_ptr=call_response.retdata, dest_ptr=retdata);

    assert [call_response] = CallContractResponse(retdata_size=retdata_size, retdata=retdata);
    return ();
}

// Executes a syscall that calls another contract, invokes a delegate call or a library call.
func execute_contract_call_syscall{
    range_check_ptr,
    builtin_ptrs: BuiltinPointers*,
    contract_state_changes: DictAccess*,
    contract_class_changes: DictAccess*,
    outputs: OsCarriedOutputs*,
}(
    block_context: BlockContext*,
    contract_address: felt,
    caller_address: felt,
    entry_point_type: felt,
    caller_execution_context: ExecutionContext*,
    syscall_ptr: CallContract*,
) {
    alloc_locals;

    let call_req = syscall_ptr.request;

    let (state_entry: StateEntry*) = dict_read{dict_ptr=contract_state_changes}(
        key=call_req.contract_address
    );

    tempvar caller_execution_info = caller_execution_context.execution_info;
    local execution_context: ExecutionContext* = new ExecutionContext(
        entry_point_type=entry_point_type,
        class_hash=state_entry.class_hash,
        calldata_size=call_req.calldata_size,
        calldata=call_req.calldata,
        execution_info=new ExecutionInfo(
            block_info=caller_execution_info.block_info,
            tx_info=caller_execution_info.tx_info,
            caller_address=caller_address,
            contract_address=contract_address,
            selector=call_req.function_selector,
        ),
        deprecated_tx_info=caller_execution_context.deprecated_tx_info,
    );

    return contract_call_helper(
        block_context=block_context,
        execution_context=execution_context,
        call_response=&syscall_ptr.response,
    );
}

// Implements the library_call and library_call_l1_handler system calls.
func execute_library_call_syscall{
    range_check_ptr,
    builtin_ptrs: BuiltinPointers*,
    contract_state_changes: DictAccess*,
    contract_class_changes: DictAccess*,
    outputs: OsCarriedOutputs*,
}(
    block_context: BlockContext*,
    caller_execution_context: ExecutionContext*,
    entry_point_type: felt,
    syscall_ptr: LibraryCall*,
) {
    alloc_locals;

    let call_req = syscall_ptr.request;

    tempvar caller_execution_info = caller_execution_context.execution_info;
    local execution_context: ExecutionContext* = new ExecutionContext(
        entry_point_type=entry_point_type,
        class_hash=call_req.class_hash,
        calldata_size=call_req.calldata_size,
        calldata=call_req.calldata,
        execution_info=new ExecutionInfo(
            block_info=caller_execution_info.block_info,
            tx_info=caller_execution_info.tx_info,
            caller_address=caller_execution_info.caller_address,
            contract_address=caller_execution_info.contract_address,
            selector=call_req.function_selector,
        ),
        deprecated_tx_info=caller_execution_context.deprecated_tx_info,
    );

    return contract_call_helper(
        block_context=block_context,
        execution_context=execution_context,
        call_response=&syscall_ptr.response,
    );
}

func execute_deploy_syscall{
    range_check_ptr,
    builtin_ptrs: BuiltinPointers*,
    contract_state_changes: DictAccess*,
    contract_class_changes: DictAccess*,
    outputs: OsCarriedOutputs*,
}(block_context: BlockContext*, caller_execution_context: ExecutionContext*, syscall_ptr: Deploy*) {
    alloc_locals;
    local caller_execution_info: ExecutionInfo* = caller_execution_context.execution_info;
    local caller_address = caller_execution_info.contract_address;

    let request = syscall_ptr.request;
    // Verify deploy_from_zero is either 0 (FALSE) or 1 (TRUE).
    assert request.deploy_from_zero * (request.deploy_from_zero - 1) = 0;
    // Set deployer_address to 0 if request.deploy_from_zero is TRUE.
    let deployer_address = (1 - request.deploy_from_zero) * caller_address;

    let selectable_builtins = &builtin_ptrs.selectable;
    let hash_ptr = selectable_builtins.pedersen;
    with hash_ptr {
        let (contract_address) = get_contract_address(
            salt=request.contract_address_salt,
            class_hash=request.class_hash,
            constructor_calldata_size=request.constructor_calldata_size,
            constructor_calldata=request.constructor_calldata,
            deployer_address=deployer_address,
        );
    }
    tempvar builtin_ptrs = new BuiltinPointers(
        selectable=SelectableBuiltins(
            pedersen=hash_ptr,
            range_check=selectable_builtins.range_check,
            ecdsa=selectable_builtins.ecdsa,
            bitwise=selectable_builtins.bitwise,
            ec_op=selectable_builtins.ec_op,
            poseidon=selectable_builtins.poseidon,
            segment_arena=selectable_builtins.segment_arena,
        ),
        non_selectable=builtin_ptrs.non_selectable,
    );

    // Fill the syscall response, before contract_address is revoked.
    assert syscall_ptr.response = DeployResponse(
        contract_address=contract_address,
        constructor_retdata_size=0,
        constructor_retdata=cast(0, felt*),
    );

    tempvar constructor_execution_context = new ExecutionContext(
        entry_point_type=ENTRY_POINT_TYPE_CONSTRUCTOR,
        class_hash=request.class_hash,
        calldata_size=request.constructor_calldata_size,
        calldata=request.constructor_calldata,
        execution_info=new ExecutionInfo(
            block_info=caller_execution_info.block_info,
            tx_info=caller_execution_info.tx_info,
            caller_address=caller_address,
            contract_address=contract_address,
            selector=CONSTRUCTOR_ENTRY_POINT_SELECTOR,
        ),
        deprecated_tx_info=caller_execution_context.deprecated_tx_info,
    );

    // Set enough gas for this call to succeed; see the comment in 'contract_call_helper'.
    let remaining_gas = INITIAL_GAS_COST;
    with remaining_gas {
        deploy_contract(
            block_context=block_context, constructor_execution_context=constructor_execution_context
        );
    }

    return ();
}

func execute_replace_class{contract_state_changes: DictAccess*}(
    contract_address, syscall_ptr: ReplaceClass*
) {
    alloc_locals;
    let class_hash = syscall_ptr.class_hash;

    local state_entry: StateEntry*;
    %{
        # Fetch a state_entry in this hint and validate it in the update at the end
        # of this function.
        ids.state_entry = __dict_manager.get_dict(ids.contract_state_changes)[ids.contract_address]
    %}

    tempvar new_state_entry = new StateEntry(
        class_hash=class_hash, storage_ptr=state_entry.storage_ptr, nonce=state_entry.nonce
    );

    dict_update{dict_ptr=contract_state_changes}(
        key=contract_address,
        prev_value=cast(state_entry, felt),
        new_value=cast(new_state_entry, felt),
    );

    return ();
}

// Reads a value from the current contract's storage.
func execute_storage_read{contract_state_changes: DictAccess*}(
    contract_address, syscall_ptr: StorageRead*
) {
    alloc_locals;
    local state_entry: StateEntry*;
    local new_state_entry: StateEntry*;
    %{
        # Fetch a state_entry in this hint and validate it in the update that comes next.
        ids.state_entry = __dict_manager.get_dict(ids.contract_state_changes)[
            ids.contract_address
        ]

        ids.new_state_entry = segments.add()
    %}

    tempvar value = syscall_ptr.response.value;
    %{
        # Make sure the value is cached (by reading it), to be used later on for the
        # commitment computation.
        value = execution_helper.storage_by_address[ids.contract_address].read(
            key=ids.syscall_ptr.request.address
        )
        assert ids.value == value, "Inconsistent storage value."
    %}

    // Update the contract's storage.
    tempvar storage_ptr = state_entry.storage_ptr;
    assert [storage_ptr] = DictAccess(
        key=syscall_ptr.request.address, prev_value=value, new_value=value
    );
    let storage_ptr = storage_ptr + DictAccess.SIZE;

    // Update contract_state_changes.
    assert [new_state_entry] = StateEntry(
        class_hash=state_entry.class_hash, storage_ptr=storage_ptr, nonce=state_entry.nonce
    );
    dict_update{dict_ptr=contract_state_changes}(
        key=contract_address,
        prev_value=cast(state_entry, felt),
        new_value=cast(new_state_entry, felt),
    );

    return ();
}

// Write a value to the current contract's storage.
func execute_storage_write{contract_state_changes: DictAccess*}(
    contract_address, syscall_ptr: StorageWrite*
) {
    alloc_locals;
    local prev_value: felt;
    local state_entry: StateEntry*;
    local new_state_entry: StateEntry*;
    %{
        storage = execution_helper.storage_by_address[ids.contract_address]
        ids.prev_value = storage.read(key=ids.syscall_ptr.address)
        storage.write(key=ids.syscall_ptr.address, value=ids.syscall_ptr.value)

        # Fetch a state_entry in this hint and validate it in the update that comes next.
        ids.state_entry = __dict_manager.get_dict(ids.contract_state_changes)[ids.contract_address]

        ids.new_state_entry = segments.add()
    %}

    // Update the contract's storage.
    tempvar storage_ptr = state_entry.storage_ptr;
    assert [storage_ptr] = DictAccess(
        key=syscall_ptr.address, prev_value=prev_value, new_value=syscall_ptr.value
    );
    let storage_ptr = storage_ptr + DictAccess.SIZE;

    // Update contract_state_changes.
    assert [new_state_entry] = StateEntry(
        class_hash=state_entry.class_hash, storage_ptr=storage_ptr, nonce=state_entry.nonce
    );
    dict_update{dict_ptr=contract_state_changes}(
        key=contract_address,
        prev_value=cast(state_entry, felt),
        new_value=cast(new_state_entry, felt),
    );

    return ();
}

// Executes the system calls in syscall_ptr.
// The signature of the function 'call_execute_deprecated_syscalls'
// must match this function's signature.
//
// Arguments:
// block_context - a read-only context used for transaction execution.
// execution_context - The execution context in which the system calls need to be executed.
// syscall_ptr - a pointer to the syscall segment that needs to be executed.
// syscall_size - The size of the system call segment to be executed.
func execute_deprecated_syscalls{
    range_check_ptr,
    builtin_ptrs: BuiltinPointers*,
    contract_state_changes: DictAccess*,
    contract_class_changes: DictAccess*,
    outputs: OsCarriedOutputs*,
}(
    block_context: BlockContext*,
    execution_context: ExecutionContext*,
    syscall_size,
    syscall_ptr: felt*,
) {
    if (syscall_size == 0) {
        return ();
    }

    tempvar selector = [syscall_ptr];
    %{
        execution_helper.os_logger.enter_syscall(
            n_steps=current_step,
            builtin_ptrs=ids.builtin_ptrs,
            deprecated=True,
            selector=ids.selector,
            range_check_ptr=ids.range_check_ptr,
        )

        # Prepare a short callable to save code duplication.
        exit_syscall = lambda selector: execution_helper.os_logger.exit_syscall(
            n_steps=current_step,
            builtin_ptrs=ids.builtin_ptrs,
            range_check_ptr=ids.range_check_ptr,
            selector=selector,
        )
    %}
    if (selector == STORAGE_READ_SELECTOR) {
        execute_storage_read(
            contract_address=execution_context.execution_info.contract_address,
            syscall_ptr=cast(syscall_ptr, StorageRead*),
        );
        %{ exit_syscall(selector=ids.STORAGE_READ_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - StorageRead.SIZE,
            syscall_ptr=syscall_ptr + StorageRead.SIZE,
        );
    }

    if (selector == STORAGE_WRITE_SELECTOR) {
        execute_storage_write(
            contract_address=execution_context.execution_info.contract_address,
            syscall_ptr=cast(syscall_ptr, StorageWrite*),
        );
        %{ exit_syscall(selector=ids.STORAGE_WRITE_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - StorageWrite.SIZE,
            syscall_ptr=syscall_ptr + StorageWrite.SIZE,
        );
    }

    if (selector == EMIT_EVENT_SELECTOR) {
        // Skip as long as the block hash is not calculated by the OS.
        %{ exit_syscall(selector=ids.EMIT_EVENT_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - EmitEvent.SIZE,
            syscall_ptr=syscall_ptr + EmitEvent.SIZE,
        );
    }

    if (selector == CALL_CONTRACT_SELECTOR) {
        let call_contract_syscall = cast(syscall_ptr, CallContract*);
        execute_contract_call_syscall(
            block_context=block_context,
            contract_address=call_contract_syscall.request.contract_address,
            caller_address=execution_context.execution_info.contract_address,
            entry_point_type=ENTRY_POINT_TYPE_EXTERNAL,
            caller_execution_context=execution_context,
            syscall_ptr=call_contract_syscall,
        );
        %{ exit_syscall(selector=ids.CALL_CONTRACT_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - CallContract.SIZE,
            syscall_ptr=syscall_ptr + CallContract.SIZE,
        );
    }

    if (selector == LIBRARY_CALL_SELECTOR) {
        execute_library_call_syscall(
            block_context=block_context,
            caller_execution_context=execution_context,
            entry_point_type=ENTRY_POINT_TYPE_EXTERNAL,
            syscall_ptr=cast(syscall_ptr, LibraryCall*),
        );
        %{ exit_syscall(selector=ids.LIBRARY_CALL_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - LibraryCall.SIZE,
            syscall_ptr=syscall_ptr + LibraryCall.SIZE,
        );
    }

    if (selector == LIBRARY_CALL_L1_HANDLER_SELECTOR) {
        execute_library_call_syscall(
            block_context=block_context,
            caller_execution_context=execution_context,
            entry_point_type=ENTRY_POINT_TYPE_L1_HANDLER,
            syscall_ptr=cast(syscall_ptr, LibraryCall*),
        );
        %{ exit_syscall(selector=ids.LIBRARY_CALL_L1_HANDLER_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - LibraryCall.SIZE,
            syscall_ptr=syscall_ptr + LibraryCall.SIZE,
        );
    }

    if (selector == GET_TX_INFO_SELECTOR) {
        assert cast(syscall_ptr, GetTxInfo*).response = GetTxInfoResponse(
            tx_info=execution_context.deprecated_tx_info
        );
        %{ exit_syscall(selector=ids.GET_TX_INFO_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - GetTxInfo.SIZE,
            syscall_ptr=syscall_ptr + GetTxInfo.SIZE,
        );
    }

    if (selector == GET_CALLER_ADDRESS_SELECTOR) {
        assert [cast(syscall_ptr, GetCallerAddress*)].response = GetCallerAddressResponse(
            caller_address=execution_context.execution_info.caller_address
        );
        %{ exit_syscall(selector=ids.GET_CALLER_ADDRESS_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - GetCallerAddress.SIZE,
            syscall_ptr=syscall_ptr + GetCallerAddress.SIZE,
        );
    }

    if (selector == GET_SEQUENCER_ADDRESS_SELECTOR) {
        assert [cast(syscall_ptr, GetSequencerAddress*)].response = GetSequencerAddressResponse(
            sequencer_address=block_context.block_info.sequencer_address
        );
        %{ exit_syscall(selector=ids.GET_SEQUENCER_ADDRESS_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - GetSequencerAddress.SIZE,
            syscall_ptr=syscall_ptr + GetSequencerAddress.SIZE,
        );
    }

    if (selector == GET_CONTRACT_ADDRESS_SELECTOR) {
        assert [cast(syscall_ptr, GetContractAddress*)].response = GetContractAddressResponse(
            contract_address=execution_context.execution_info.contract_address
        );
        %{ exit_syscall(selector=ids.GET_CONTRACT_ADDRESS_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - GetContractAddress.SIZE,
            syscall_ptr=syscall_ptr + GetContractAddress.SIZE,
        );
    }

    if (selector == GET_BLOCK_TIMESTAMP_SELECTOR) {
        assert [cast(syscall_ptr, GetBlockTimestamp*)].response = GetBlockTimestampResponse(
            block_timestamp=block_context.block_info.block_timestamp
        );
        %{ exit_syscall(selector=ids.GET_BLOCK_TIMESTAMP_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - GetBlockTimestamp.SIZE,
            syscall_ptr=syscall_ptr + GetBlockTimestamp.SIZE,
        );
    }

    if (selector == GET_BLOCK_NUMBER_SELECTOR) {
        assert [cast(syscall_ptr, GetBlockNumber*)].response = GetBlockNumberResponse(
            block_number=block_context.block_info.block_number
        );
        %{ exit_syscall(selector=ids.GET_BLOCK_NUMBER_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - GetBlockNumber.SIZE,
            syscall_ptr=syscall_ptr + GetBlockNumber.SIZE,
        );
    }

    if (selector == GET_TX_SIGNATURE_SELECTOR) {
        tempvar deprecated_tx_info = execution_context.deprecated_tx_info;
        assert [cast(syscall_ptr, GetTxSignature*)].response = GetTxSignatureResponse(
            signature_len=deprecated_tx_info.signature_len, signature=deprecated_tx_info.signature
        );
        %{ exit_syscall(selector=ids.GET_TX_SIGNATURE_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - GetTxSignature.SIZE,
            syscall_ptr=syscall_ptr + GetTxSignature.SIZE,
        );
    }

    if (selector == DEPLOY_SELECTOR) {
        execute_deploy_syscall(
            block_context=block_context,
            caller_execution_context=execution_context,
            syscall_ptr=cast(syscall_ptr, Deploy*),
        );
        %{ exit_syscall(selector=ids.DEPLOY_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - Deploy.SIZE,
            syscall_ptr=syscall_ptr + Deploy.SIZE,
        );
    }

    // DEPRECATED.
    if (selector == DELEGATE_CALL_SELECTOR) {
        tempvar execution_info = execution_context.execution_info;
        execute_contract_call_syscall(
            block_context=block_context,
            contract_address=execution_info.contract_address,
            caller_address=execution_info.caller_address,
            entry_point_type=ENTRY_POINT_TYPE_EXTERNAL,
            caller_execution_context=execution_context,
            syscall_ptr=cast(syscall_ptr, CallContract*),
        );
        %{ exit_syscall(selector=ids.DELEGATE_CALL_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - CallContract.SIZE,
            syscall_ptr=syscall_ptr + CallContract.SIZE,
        );
    }

    // DEPRECATED.
    if (selector == DELEGATE_L1_HANDLER_SELECTOR) {
        tempvar execution_info = execution_context.execution_info;
        execute_contract_call_syscall(
            block_context=block_context,
            contract_address=execution_info.contract_address,
            caller_address=execution_info.caller_address,
            entry_point_type=ENTRY_POINT_TYPE_L1_HANDLER,
            caller_execution_context=execution_context,
            syscall_ptr=cast(syscall_ptr, CallContract*),
        );
        %{ exit_syscall(selector=ids.DELEGATE_L1_HANDLER_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - CallContract.SIZE,
            syscall_ptr=syscall_ptr + CallContract.SIZE,
        );
    }

    if (selector == REPLACE_CLASS_SELECTOR) {
        execute_replace_class(
            contract_address=execution_context.execution_info.contract_address,
            syscall_ptr=cast(syscall_ptr, ReplaceClass*),
        );
        %{ exit_syscall(selector=ids.REPLACE_CLASS_SELECTOR) %}
        return execute_deprecated_syscalls(
            block_context=block_context,
            execution_context=execution_context,
            syscall_size=syscall_size - ReplaceClass.SIZE,
            syscall_ptr=syscall_ptr + ReplaceClass.SIZE,
        );
    }

    // Here the system call must be 'SendMessageToL1'.
    assert selector = SEND_MESSAGE_TO_L1_SELECTOR;

    let syscall = [cast(syscall_ptr, SendMessageToL1SysCall*)];

    assert [outputs.messages_to_l1] = MessageToL1Header(
        from_address=execution_context.execution_info.contract_address,
        to_address=syscall.to_address,
        payload_size=syscall.payload_size,
    );
    memcpy(
        dst=outputs.messages_to_l1 + MessageToL1Header.SIZE,
        src=syscall.payload_ptr,
        len=syscall.payload_size,
    );
    let (outputs) = os_carried_outputs_new(
        messages_to_l1=outputs.messages_to_l1 + MessageToL1Header.SIZE +
        outputs.messages_to_l1.payload_size,
        messages_to_l2=outputs.messages_to_l2,
    );
    %{ exit_syscall(selector=ids.SEND_MESSAGE_TO_L1_SELECTOR) %}
    return execute_deprecated_syscalls(
        block_context=block_context,
        execution_context=execution_context,
        syscall_size=syscall_size - SendMessageToL1SysCall.SIZE,
        syscall_ptr=syscall_ptr + SendMessageToL1SysCall.SIZE,
    );
}

// Deploys a contract and invokes its constructor.
// Returns the constructor's return data.
//
// Arguments:
// block_context - A global context that is fixed throughout the block.
// constructor_execution_context - The ExecutionContext of the constructor.
func deploy_contract{
    range_check_ptr,
    remaining_gas: felt,
    builtin_ptrs: BuiltinPointers*,
    contract_state_changes: DictAccess*,
    contract_class_changes: DictAccess*,
    outputs: OsCarriedOutputs*,
}(block_context: BlockContext*, constructor_execution_context: ExecutionContext*) -> (
    retdata_size: felt, retdata: felt*
) {
    alloc_locals;

    local contract_address = constructor_execution_context.execution_info.contract_address;

    // Assert that we don't deploy to one of the reserved addresses.
    assert_not_zero(
        (contract_address - ORIGIN_ADDRESS) * (contract_address - BLOCK_HASH_CONTRACT_ADDRESS)
    );

    local state_entry: StateEntry*;
    %{
        # Fetch a state_entry in this hint and validate it in the update at the end
        # of this function.
        ids.state_entry = __dict_manager.get_dict(ids.contract_state_changes)[ids.contract_address]
    %}
    assert state_entry.class_hash = UNINITIALIZED_CLASS_HASH;
    assert state_entry.nonce = 0;

    tempvar new_state_entry = new StateEntry(
        class_hash=constructor_execution_context.class_hash,
        storage_ptr=state_entry.storage_ptr,
        nonce=0,
    );

    dict_update{dict_ptr=contract_state_changes}(
        key=contract_address,
        prev_value=cast(state_entry, felt),
        new_value=cast(new_state_entry, felt),
    );

    // Invoke the contract constructor.
    let (retdata_size, retdata, _is_deprecated) = select_execute_entry_point_func(
        block_context=block_context, execution_context=constructor_execution_context
    );
    return (retdata_size=retdata_size, retdata=retdata);
}
