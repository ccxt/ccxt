from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import (
    BitwiseBuiltin,
    HashBuiltin,
    KeccakBuiltin,
    PoseidonBuiltin,
)
from starkware.cairo.common.dict import dict_new, dict_read, dict_update
from starkware.cairo.common.dict_access import DictAccess
from starkware.cairo.common.math import assert_nn, assert_nn_le, assert_not_zero
from starkware.cairo.common.memcpy import memcpy
from starkware.cairo.common.registers import get_fp_and_pc
from starkware.cairo.common.segments import relocate_segment
from starkware.cairo.common.uint256 import Uint256
from starkware.starknet.builtins.segment_arena.segment_arena import new_arena
from starkware.starknet.common.constants import (
    DECLARE_HASH_PREFIX,
    DEPLOY_ACCOUNT_HASH_PREFIX,
    INVOKE_HASH_PREFIX,
    ORIGIN_ADDRESS,
)
from starkware.starknet.common.new_syscalls import BlockInfo, ExecutionInfo, ResourceBounds, TxInfo
from starkware.starknet.common.syscalls import Deploy
from starkware.starknet.common.syscalls import TxInfo as DeprecatedTxInfo
from starkware.starknet.core.os.block_context import BlockContext
from starkware.starknet.core.os.builtins import (
    BuiltinPointers,
    NonSelectableBuiltins,
    SelectableBuiltins,
)
from starkware.starknet.core.os.constants import (
    CONSTRUCTOR_ENTRY_POINT_SELECTOR,
    DEFAULT_ENTRY_POINT_SELECTOR,
    ENTRY_POINT_TYPE_CONSTRUCTOR,
    ENTRY_POINT_TYPE_EXTERNAL,
    ENTRY_POINT_TYPE_L1_HANDLER,
    EXECUTE_ENTRY_POINT_SELECTOR,
    INITIAL_GAS_COST,
    L1_GAS_INDEX,
    L1_HANDLER_VERSION,
    SIERRA_ARRAY_LEN_BOUND,
    TRANSACTION_GAS_COST,
    TRANSFER_ENTRY_POINT_SELECTOR,
    VALIDATE_DECLARE_ENTRY_POINT_SELECTOR,
    VALIDATE_DEPLOY_ENTRY_POINT_SELECTOR,
    VALIDATE_ENTRY_POINT_SELECTOR,
    VALIDATED,
)
from starkware.starknet.core.os.contract_address.contract_address import get_contract_address
from starkware.starknet.core.os.contract_class.deprecated_compiled_class import (
    DeprecatedCompiledClassFact,
)
from starkware.starknet.core.os.execution.deprecated_execute_entry_point import (
    deprecated_execute_entry_point,
)
from starkware.starknet.core.os.execution.deprecated_execute_syscalls import (
    deploy_contract,
    select_execute_entry_point_func,
)
from starkware.starknet.core.os.execution.execute_entry_point import ExecutionContext
from starkware.starknet.core.os.output import (
    MessageToL2Header,
    OsCarriedOutputs,
    os_carried_outputs_new,
)
from starkware.starknet.core.os.state.commitment import StateEntry
from starkware.starknet.core.os.transaction_hash.transaction_hash import (
    CommonTxFields,
    compute_declare_transaction_hash,
    compute_deploy_account_transaction_hash,
    compute_invoke_transaction_hash,
    compute_l1_handler_transaction_hash,
    update_builtin_ptrs,
)

// Verifies that the given (non-deprecated) `TxInfo` object is consistent with its version, in the
// sense that deprecated transactions (version < 3) have all new fields set to zero and
// non-deprecated transactions (version = 3) have old fields set to zero.
func assert_deprecated_tx_fields_consistency(tx_info: TxInfo*) {
    tempvar version = tx_info.version;
    if (version * (version - 1) * (version - 2) == 0) {
        let nullptr = cast(0, felt*);
        assert tx_info.tip = 0;
        assert tx_info.resource_bounds_start = cast(0, ResourceBounds*);
        assert tx_info.resource_bounds_end = cast(0, ResourceBounds*);
        assert tx_info.paymaster_data_start = nullptr;
        assert tx_info.paymaster_data_end = nullptr;
        assert tx_info.nonce_data_availability_mode = 0;
        assert tx_info.fee_data_availability_mode = 0;
        assert tx_info.account_deployment_data_start = nullptr;
        assert tx_info.account_deployment_data_end = nullptr;
    } else {
        with_attr error_message("Invalid transaction version: {version}.") {
            assert version = 3;
        }
        assert tx_info.max_fee = 0;
    }
    return ();
}

// Executes the transactions in the hint variable os_input.transactions.
//
// Returns:
// reserved_range_checks_end - end pointer for the reserved range checks.
//
// Assumptions:
//   The caller verifies that the memory range [range_check_ptr, reserved_range_checks_end)
//   corresponds to valid range check instances.
//   Note that if the assumption above does not hold it might be the case that
//   the returned range_check_ptr is smaller then reserved_range_checks_end.
func execute_transactions{
    pedersen_ptr: HashBuiltin*,
    range_check_ptr,
    ecdsa_ptr,
    bitwise_ptr: BitwiseBuiltin*,
    ec_op_ptr,
    keccak_ptr: KeccakBuiltin*,
    poseidon_ptr: PoseidonBuiltin*,
    contract_state_changes: DictAccess*,
    contract_class_changes: DictAccess*,
    outputs: OsCarriedOutputs*,
}(block_context: BlockContext*) -> (reserved_range_checks_end: felt) {
    alloc_locals;

    // Prepare builtin pointers.
    let segment_arena_ptr = new_arena();

    let (__fp__, _) = get_fp_and_pc();
    local local_builtin_ptrs: BuiltinPointers = BuiltinPointers(
        selectable=SelectableBuiltins(
            pedersen=pedersen_ptr,
            range_check=nondet %{ segments.add_temp_segment() %},
            ecdsa=ecdsa_ptr,
            bitwise=bitwise_ptr,
            ec_op=ec_op_ptr,
            poseidon=poseidon_ptr,
            segment_arena=segment_arena_ptr,
        ),
        non_selectable=NonSelectableBuiltins(keccak=keccak_ptr),
    );

    let builtin_ptrs = &local_builtin_ptrs;

    // Execute transactions.
    local n_txs = nondet %{ len(os_input.transactions) %};
    %{
        vm_enter_scope({
            '__deprecated_class_hashes': __deprecated_class_hashes,
            'transactions': iter(os_input.transactions),
            'execution_helper': execution_helper,
            'deprecated_syscall_handler': deprecated_syscall_handler,
            'syscall_handler': syscall_handler,
             '__dict_manager': __dict_manager,
        })
    %}
    execute_transactions_inner{
        builtin_ptrs=builtin_ptrs,
        contract_state_changes=contract_state_changes,
        contract_class_changes=contract_class_changes,
    }(block_context=block_context, n_txs=n_txs);
    %{ vm_exit_scope() %}

    let reserved_range_checks_end = range_check_ptr;
    // Relocate the range checks used by the transactions to reserved_range_checks_end.
    relocate_segment(
        src_ptr=cast(local_builtin_ptrs.selectable.range_check, felt*),
        dest_ptr=cast(reserved_range_checks_end, felt*),
    );

    let selectable_builtins = &builtin_ptrs.selectable;
    let pedersen_ptr = selectable_builtins.pedersen;
    let range_check_ptr = selectable_builtins.range_check;
    let ecdsa_ptr = selectable_builtins.ecdsa;
    let bitwise_ptr = selectable_builtins.bitwise;
    let ec_op_ptr = selectable_builtins.ec_op;
    let poseidon_ptr = selectable_builtins.poseidon;
    let keccak_ptr = builtin_ptrs.non_selectable.keccak;

    return (reserved_range_checks_end=reserved_range_checks_end);
}

// Inner function for execute_transactions.
// Arguments:
// block_context - a read-only context used for transaction execution.
// n_txs - the number of transactions to execute.
//
// Implicit arguments:
// range_check_ptr - a range check builtin, used and advanced by the OS, not the transactions.
// builtin_ptrs - a struct of builtin pointer that are going to be used by the
// executed transactions.
// The range-checks used internally by the transactions do not affect range_check_ptr.
// They are accounted for in builtin_ptrs.
func execute_transactions_inner{
    range_check_ptr,
    builtin_ptrs: BuiltinPointers*,
    contract_state_changes: DictAccess*,
    contract_class_changes: DictAccess*,
    outputs: OsCarriedOutputs*,
}(block_context: BlockContext*, n_txs) {
    if (n_txs == 0) {
        return ();
    }

    alloc_locals;
    local tx_type;
    // Guess the current transaction's type.
    %{
        tx = next(transactions)
        assert tx.tx_type.name in ('INVOKE_FUNCTION', 'L1_HANDLER', 'DEPLOY_ACCOUNT', 'DECLARE'), (
            f"Unexpected transaction type: {tx.type.name}."
        )

        tx_type_bytes = tx.tx_type.name.encode("ascii")
        ids.tx_type = int.from_bytes(tx_type_bytes, "big")
        execution_helper.os_logger.enter_tx(
            tx=tx,
            n_steps=current_step,
            builtin_ptrs=ids.builtin_ptrs,
            range_check_ptr=ids.range_check_ptr,
        )

        # Prepare a short callable to save code duplication.
        exit_tx = lambda: execution_helper.os_logger.exit_tx(
            n_steps=current_step,
            builtin_ptrs=ids.builtin_ptrs,
            range_check_ptr=ids.range_check_ptr,
        )
    %}

    let remaining_gas = INITIAL_GAS_COST - TRANSACTION_GAS_COST;
    with remaining_gas {
        if (tx_type == 'INVOKE_FUNCTION') {
            // Handle the invoke-function transaction.
            execute_invoke_function_transaction(block_context=block_context);
            %{ exit_tx() %}
            return execute_transactions_inner(block_context=block_context, n_txs=n_txs - 1);
        }
        if (tx_type == 'L1_HANDLER') {
            // Handle the L1-handler transaction.
            execute_l1_handler_transaction(block_context=block_context);
            %{ exit_tx() %}
            return execute_transactions_inner(block_context=block_context, n_txs=n_txs - 1);
        }
        if (tx_type == 'DEPLOY_ACCOUNT') {
            // Handle the deploy-account transaction.
            execute_deploy_account_transaction(block_context=block_context);
            %{ exit_tx() %}
            return execute_transactions_inner(block_context=block_context, n_txs=n_txs - 1);
        }

        assert tx_type = 'DECLARE';
        // Handle the declare transaction.
        execute_declare_transaction(block_context=block_context);
        %{ exit_tx() %}
        return execute_transactions_inner(block_context=block_context, n_txs=n_txs - 1);
    }
}

// Represents the calldata of an ERC20 transfer.
struct TransferCallData {
    recipient: felt,
    amount: Uint256,
}

// Charges a fee from the user.
// If max_fee is not 0, validates that the selector matches the entry point of an account contract
// and executes an ERC20 transfer on the behalf of that account contract.
//
// Arguments:
// block_context - a global context that is fixed throughout the block.
// tx_execution_context - The execution context of the transaction that pays the fee.
func charge_fee{
    range_check_ptr,
    builtin_ptrs: BuiltinPointers*,
    contract_state_changes: DictAccess*,
    contract_class_changes: DictAccess*,
    outputs: OsCarriedOutputs*,
}(block_context: BlockContext*, tx_execution_context: ExecutionContext*) {
    alloc_locals;
    local execution_info: ExecutionInfo* = tx_execution_context.execution_info;
    local tx_info: TxInfo* = execution_info.tx_info;
    tempvar version = tx_info.version;
    tempvar not_deprecated_version = version * (version - 1) * (version - 2);

    local max_fee: felt;
    if (not_deprecated_version == 0) {
        assert max_fee = tx_info.max_fee;
    } else {
        let resource_bounds: ResourceBounds* = tx_info.resource_bounds_start;
        tempvar l1_gas_bounds: ResourceBounds = resource_bounds[L1_GAS_INDEX];
        assert max_fee = l1_gas_bounds.max_amount * l1_gas_bounds.max_price_per_unit;
    }
    if (max_fee == 0) {
        return ();
    }

    // Transactions with fee should go through an account contract.
    tempvar selector = execution_info.selector;
    assert (selector - EXECUTE_ENTRY_POINT_SELECTOR) * (
        selector - VALIDATE_DECLARE_ENTRY_POINT_SELECTOR
    ) * (selector - VALIDATE_DEPLOY_ENTRY_POINT_SELECTOR) = 0;

    local calldata: TransferCallData = TransferCallData(
        recipient=block_context.block_info.sequencer_address,
        amount=Uint256(low=nondet %{ execution_helper.tx_execution_info.actual_fee %}, high=0),
    );

    // Verify that the charged amount is not larger than the transaction's max_fee field.
    assert_nn_le(calldata.amount.low, max_fee);

    local fee_token_address: felt;
    if (not_deprecated_version == 0) {
        fee_token_address = block_context.starknet_os_config.deprecated_fee_token_address;
    } else {
        // The fee token is STRK.
        fee_token_address = block_context.starknet_os_config.fee_token_address;
    }
    let (fee_state_entry: StateEntry*) = dict_read{dict_ptr=contract_state_changes}(
        key=fee_token_address
    );
    let (__fp__, _) = get_fp_and_pc();
    // Use block_info directly from block_context, so that charge_fee will always run in
    // execute-mode rather than validate-mode.
    local execution_context: ExecutionContext = ExecutionContext(
        entry_point_type=ENTRY_POINT_TYPE_EXTERNAL,
        class_hash=fee_state_entry.class_hash,
        calldata_size=TransferCallData.SIZE,
        calldata=&calldata,
        execution_info=new ExecutionInfo(
            block_info=block_context.block_info,
            tx_info=tx_info,
            caller_address=tx_info.account_contract_address,
            contract_address=fee_token_address,
            selector=TRANSFER_ENTRY_POINT_SELECTOR,
        ),
        deprecated_tx_info=tx_execution_context.deprecated_tx_info,
    );

    let remaining_gas = INITIAL_GAS_COST;
    select_execute_entry_point_func{remaining_gas=remaining_gas}(
        block_context=block_context, execution_context=&execution_context
    );

    return ();
}

// Executes an invoke-function transaction.
//
// The transaction should be passed in the hint variable 'tx'.
//
// Arguments:
// block_context - a global context that is fixed throughout the block.
func execute_invoke_function_transaction{
    range_check_ptr,
    remaining_gas: felt,
    builtin_ptrs: BuiltinPointers*,
    contract_state_changes: DictAccess*,
    contract_class_changes: DictAccess*,
    outputs: OsCarriedOutputs*,
}(block_context: BlockContext*) {
    alloc_locals;

    let (local tx_execution_context: ExecutionContext*) = get_invoke_tx_execution_context(
        block_context=block_context, entry_point_type=ENTRY_POINT_TYPE_EXTERNAL
    );
    local tx_execution_info: ExecutionInfo* = tx_execution_context.execution_info;

    // Guess tx fields.
    // The version validation is done in `compute_invoke_transaction_hash()`.
    let (__fp__, _) = get_fp_and_pc();
    local resource_bounds: ResourceBounds*;
    %{
        from src.starkware.starknet.core.os.transaction_hash.transaction_hash import (
            create_resource_bounds_list,
        )

        ids.resource_bounds = (
            0
            if tx.version < 3
            else segments.gen_arg(create_resource_bounds_list(tx.resource_bounds))
        )
    %}
    local common_tx_fields: CommonTxFields = CommonTxFields(
        tx_hash_prefix=INVOKE_HASH_PREFIX,
        version=nondet %{ tx.version %},
        sender_address=tx_execution_info.contract_address,
        max_fee=nondet %{ tx.max_fee if tx.version < 3 else 0 %},
        chain_id=block_context.starknet_os_config.chain_id,
        nonce=nondet %{ 0 if tx.nonce is None else tx.nonce %},
        tip=nondet %{ 0 if tx.version < 3 else tx.tip %},
        n_resource_bounds=nondet %{ 0 if tx.version < 3 else len(tx.resource_bounds) %},
        resource_bounds=resource_bounds,
        paymaster_data_length=nondet %{ 0 if tx.version < 3 else len(tx.paymaster_data) %},
        paymaster_data=cast(
            nondet %{ 0 if tx.version < 3 else segments.gen_arg(tx.paymaster_data) %}, felt*
        ),
        nonce_data_availability_mode=(
            nondet %{ 0 if tx.version < 3 else tx.nonce_data_availability_mode %}
        ),
        fee_data_availability_mode=(
            nondet %{ 0 if tx.version < 3 else tx.fee_data_availability_mode %}
        ),
    );
    local account_deployment_data_size = (
        nondet %{ 0 if tx.version < 3 else len(tx.account_deployment_data) %}
    );
    local account_deployment_data: felt* = cast(
        nondet %{ 0 if tx.version < 3 else segments.gen_arg(tx.account_deployment_data) %}, felt*
    );
    let pedersen_ptr = builtin_ptrs.selectable.pedersen;
    let poseidon_ptr = builtin_ptrs.selectable.poseidon;
    with pedersen_ptr, poseidon_ptr {
        let transaction_hash = compute_invoke_transaction_hash(
            common_fields=&common_tx_fields,
            execution_context=tx_execution_context,
            account_deployment_data_size=account_deployment_data_size,
            account_deployment_data=account_deployment_data,
        );
    }
    update_builtin_ptrs(pedersen_ptr=pedersen_ptr, poseidon_ptr=poseidon_ptr);

    %{
        assert ids.transaction_hash == tx.hash_value, (
            "Computed transaction_hash is inconsistent with the hash in the transaction. "
            f"Computed hash = {ids.transaction_hash}, Expected hash = {tx.hash_value}.")
    %}

    // Write the transaction info and complete the ExecutionInfo struct.
    tempvar tx_info = tx_execution_info.tx_info;
    local signature_start: felt*;
    local signature_len: felt;
    %{
        ids.signature_start = segments.gen_arg(arg=tx.signature)
        ids.signature_len = len(tx.signature)
    %}
    assert_nn_le(signature_len, SIERRA_ARRAY_LEN_BOUND - 1);
    assert [tx_info] = TxInfo(
        version=common_tx_fields.version,
        account_contract_address=tx_execution_info.contract_address,
        max_fee=common_tx_fields.max_fee,
        signature_start=signature_start,
        signature_end=&signature_start[signature_len],
        transaction_hash=transaction_hash,
        chain_id=common_tx_fields.chain_id,
        nonce=common_tx_fields.nonce,
        resource_bounds_start=common_tx_fields.resource_bounds,
        resource_bounds_end=&common_tx_fields.resource_bounds[common_tx_fields.n_resource_bounds],
        tip=common_tx_fields.tip,
        paymaster_data_start=common_tx_fields.paymaster_data,
        paymaster_data_end=&common_tx_fields.paymaster_data[common_tx_fields.paymaster_data_length],
        nonce_data_availability_mode=common_tx_fields.nonce_data_availability_mode,
        fee_data_availability_mode=common_tx_fields.fee_data_availability_mode,
        account_deployment_data_start=account_deployment_data,
        account_deployment_data_end=&account_deployment_data[account_deployment_data_size],
    );
    fill_deprecated_tx_info(tx_info=tx_info, dst=tx_execution_context.deprecated_tx_info);
    assert_deprecated_tx_fields_consistency(tx_info=tx_info);

    check_and_increment_nonce(tx_info=tx_info);

    %{
        tx_info_ptr = ids.tx_execution_context.deprecated_tx_info.address_
        execution_helper.start_tx(tx_info_ptr=tx_info_ptr)
    %}

    run_validate(block_context=block_context, tx_execution_context=tx_execution_context);
    let updated_tx_execution_context = update_class_hash_in_execution_context(
        execution_context=tx_execution_context
    );

    // Execute only non-reverted transactions.
    if (nondet %{ execution_helper.tx_execution_info.is_reverted %} == 0) {
        select_execute_entry_point_func(
            block_context=block_context, execution_context=updated_tx_execution_context
        );
    } else {
        // Align the stack with the `if` branch to avoid revoked references.
        tempvar range_check_ptr = range_check_ptr;
        tempvar remaining_gas = remaining_gas;
        tempvar builtin_ptrs = builtin_ptrs;
        tempvar contract_state_changes = contract_state_changes;
        tempvar contract_class_changes = contract_class_changes;
        tempvar outputs = outputs;
        tempvar _dummy_return_value: select_execute_entry_point_func.Return;
    }
    local remaining_gas = remaining_gas;

    // Charge fee.
    charge_fee(block_context=block_context, tx_execution_context=updated_tx_execution_context);

    %{ execution_helper.end_tx() %}

    return ();
}

// Executes an L1-handler transaction.
//
// The transaction should be passed in the hint variable 'tx'.
//
// Arguments:
// block_context - a global context that is fixed throughout the block.
func execute_l1_handler_transaction{
    range_check_ptr,
    remaining_gas: felt,
    builtin_ptrs: BuiltinPointers*,
    contract_state_changes: DictAccess*,
    contract_class_changes: DictAccess*,
    outputs: OsCarriedOutputs*,
}(block_context: BlockContext*) {
    alloc_locals;

    let (local tx_execution_context: ExecutionContext*) = get_invoke_tx_execution_context(
        block_context=block_context, entry_point_type=ENTRY_POINT_TYPE_L1_HANDLER
    );
    local tx_execution_info: ExecutionInfo* = tx_execution_context.execution_info;

    local nonce = nondet %{ tx.nonce %};
    local chain_id = block_context.starknet_os_config.chain_id;

    let pedersen_ptr = builtin_ptrs.selectable.pedersen;
    let poseidon_ptr = builtin_ptrs.selectable.poseidon;
    with pedersen_ptr {
        let transaction_hash = compute_l1_handler_transaction_hash(
            execution_context=tx_execution_context, chain_id=chain_id, nonce=nonce
        );
    }
    update_builtin_ptrs(pedersen_ptr=pedersen_ptr, poseidon_ptr=poseidon_ptr);

    %{
        assert ids.transaction_hash == tx.hash_value, (
            "Computed transaction_hash is inconsistent with the hash in the transaction. "
            f"Computed hash = {ids.transaction_hash}, Expected hash = {tx.hash_value}.")
    %}

    // Write the transaction info and complete the ExecutionInfo struct.
    tempvar tx_info = tx_execution_info.tx_info;
    assert [tx_info] = TxInfo(
        version=L1_HANDLER_VERSION,
        account_contract_address=tx_execution_info.contract_address,
        max_fee=0,
        signature_start=cast(0, felt*),
        signature_end=cast(0, felt*),
        transaction_hash=transaction_hash,
        chain_id=chain_id,
        nonce=nonce,
        resource_bounds_start=cast(0, ResourceBounds*),
        resource_bounds_end=cast(0, ResourceBounds*),
        tip=0,
        paymaster_data_start=cast(0, felt*),
        paymaster_data_end=cast(0, felt*),
        nonce_data_availability_mode=0,
        fee_data_availability_mode=0,
        account_deployment_data_start=cast(0, felt*),
        account_deployment_data_end=cast(0, felt*),
    );
    fill_deprecated_tx_info(tx_info=tx_info, dst=tx_execution_context.deprecated_tx_info);
    assert_deprecated_tx_fields_consistency(tx_info=tx_info);

    // Consume L1-to-L2 message.
    consume_l1_to_l2_message(execution_context=tx_execution_context, nonce=nonce);

    %{
        tx_info_ptr = ids.tx_execution_context.deprecated_tx_info.address_
        execution_helper.start_tx(tx_info_ptr=tx_info_ptr)
    %}
    select_execute_entry_point_func(
        block_context=block_context, execution_context=tx_execution_context
    );
    %{ execution_helper.end_tx() %}

    return ();
}

// Guess the execution context of an invoke transaction (either invoke function or L1 handler).
// Leaves 'execution_info.tx_info' and 'deprecated_tx_info' empty - should be
// filled later on.
func get_invoke_tx_execution_context{range_check_ptr, contract_state_changes: DictAccess*}(
    block_context: BlockContext*, entry_point_type: felt
) -> (tx_execution_context: ExecutionContext*) {
    alloc_locals;
    local contract_address;
    %{
        from starkware.starknet.business_logic.transaction.deprecated_objects import (
            InternalL1Handler,
        )
        ids.contract_address = (
            tx.contract_address if isinstance(tx, InternalL1Handler) else tx.sender_address
        )
    %}
    let (state_entry: StateEntry*) = dict_read{dict_ptr=contract_state_changes}(
        key=contract_address
    );
    local tx_execution_context: ExecutionContext* = new ExecutionContext(
        entry_point_type=entry_point_type,
        class_hash=state_entry.class_hash,
        calldata_size=nondet %{ len(tx.calldata) %},
        calldata=cast(nondet %{ segments.gen_arg(tx.calldata) %}, felt*),
        execution_info=new ExecutionInfo(
            block_info=block_context.block_info,
            tx_info=cast(nondet %{ segments.add() %}, TxInfo*),
            caller_address=ORIGIN_ADDRESS,
            contract_address=contract_address,
            selector=nondet %{ tx.entry_point_selector %},
        ),
        deprecated_tx_info=cast(nondet %{ segments.add() %}, DeprecatedTxInfo*),
    );
    assert_nn_le(tx_execution_context.calldata_size, SIERRA_ARRAY_LEN_BOUND - 1);

    return (tx_execution_context=tx_execution_context);
}

// Changes the class_hash according to the class that belongs to the executed contract address.
// Therefore, it shouldn't be used for execution_context that was created for library_call
// (since the class hash has nothing to do with the contract address in that case).
func update_class_hash_in_execution_context{range_check_ptr, contract_state_changes: DictAccess*}(
    execution_context: ExecutionContext*
) -> ExecutionContext* {
    let (state_entry: StateEntry*) = dict_read{dict_ptr=contract_state_changes}(
        key=execution_context.execution_info.contract_address
    );
    return new ExecutionContext(
        entry_point_type=execution_context.entry_point_type,
        class_hash=state_entry.class_hash,
        calldata_size=execution_context.calldata_size,
        calldata=execution_context.calldata,
        execution_info=execution_context.execution_info,
        deprecated_tx_info=execution_context.deprecated_tx_info,
    );
}

// Initializes the given DeprecatedTxInfo (dst) based on the given TxInfo.
func fill_deprecated_tx_info(tx_info: TxInfo*, dst: DeprecatedTxInfo*) {
    tempvar signature_start = tx_info.signature_start;
    assert [dst] = DeprecatedTxInfo(
        version=tx_info.version,
        account_contract_address=tx_info.account_contract_address,
        max_fee=tx_info.max_fee,
        signature_len=tx_info.signature_end - signature_start,
        signature=signature_start,
        transaction_hash=tx_info.transaction_hash,
        chain_id=tx_info.chain_id,
        nonce=tx_info.nonce,
    );
    return ();
}

// Verifies that the transaction's nonce matches the contract's nonce and increments the
// latter.
func check_and_increment_nonce{contract_state_changes: DictAccess*}(tx_info: TxInfo*) -> () {
    // Do not handle nonce for version 0.
    if (tx_info.version == 0) {
        return ();
    }

    tempvar state_entry: StateEntry*;
    %{
        # Fetch a state_entry in this hint and validate it in the update that comes next.
        ids.state_entry = __dict_manager.get_dict(ids.contract_state_changes)[
            ids.tx_info.account_contract_address
        ]
    %}

    tempvar current_nonce = state_entry.nonce;
    with_attr error_message("Unexpected nonce.") {
        assert current_nonce = tx_info.nonce;
    }

    // Update contract_state_changes.
    tempvar new_state_entry = new StateEntry(
        class_hash=state_entry.class_hash,
        storage_ptr=state_entry.storage_ptr,
        nonce=current_nonce + 1,
    );
    dict_update{dict_ptr=contract_state_changes}(
        key=tx_info.account_contract_address,
        prev_value=cast(state_entry, felt),
        new_value=cast(new_state_entry, felt),
    );
    return ();
}

// Runs the account contract's "__validate__" entry point, which is responsible for
// signature verification.
//
// Arguments:
// block_context - a global context that is fixed throughout the block.
// tx_execution_context - The execution context of the underlying invoke transaction.
func run_validate{
    range_check_ptr,
    remaining_gas: felt,
    builtin_ptrs: BuiltinPointers*,
    contract_state_changes: DictAccess*,
    contract_class_changes: DictAccess*,
    outputs: OsCarriedOutputs*,
}(block_context: BlockContext*, tx_execution_context: ExecutionContext*) {
    alloc_locals;
    local tx_execution_info: ExecutionInfo* = tx_execution_context.execution_info;

    // Do not run "__validate__" for version 0.
    if (tx_execution_info.tx_info.version == 0) {
        return ();
    }

    // "__validate__" is expected to get the same calldata as "__execute__".
    local validate_execution_context: ExecutionContext* = new ExecutionContext(
        entry_point_type=ENTRY_POINT_TYPE_EXTERNAL,
        class_hash=tx_execution_context.class_hash,
        calldata_size=tx_execution_context.calldata_size,
        calldata=tx_execution_context.calldata,
        execution_info=new ExecutionInfo(
            block_info=block_context.block_info_for_validate,
            tx_info=tx_execution_info.tx_info,
            caller_address=tx_execution_info.caller_address,
            contract_address=tx_execution_info.contract_address,
            selector=VALIDATE_ENTRY_POINT_SELECTOR,
        ),
        deprecated_tx_info=tx_execution_context.deprecated_tx_info,
    );

    let (retdata_size, retdata, is_deprecated) = select_execute_entry_point_func(
        block_context=block_context, execution_context=validate_execution_context
    );
    if (is_deprecated == 0) {
        %{
            # Fetch the result, up to 100 elements.
            result = memory.get_range(ids.retdata, min(100, ids.retdata_size))

            if result != [ids.VALIDATED]:
                print("Invalid return value from __validate__:")
                print(f"  Size: {ids.retdata_size}")
                print(f"  Result (at most 100 elements): {result}")
        %}
        assert retdata_size = 1;
        assert retdata[0] = VALIDATED;
    }

    return ();
}

// Adds 'tx' with the given 'nonce' to 'outputs.messages_to_l2'.
func consume_l1_to_l2_message{outputs: OsCarriedOutputs*}(
    execution_context: ExecutionContext*, nonce: felt
) {
    assert_not_zero(execution_context.calldata_size);
    // The payload is the calldata without the from_address argument (which is the first).
    let payload: felt* = execution_context.calldata + 1;
    tempvar payload_size = execution_context.calldata_size - 1;

    tempvar execution_info = execution_context.execution_info;

    // Write the given transaction to the output.
    assert [outputs.messages_to_l2] = MessageToL2Header(
        from_address=[execution_context.calldata],
        to_address=execution_info.contract_address,
        nonce=nonce,
        selector=execution_info.selector,
        payload_size=payload_size,
    );

    let message_payload = cast(outputs.messages_to_l2 + MessageToL2Header.SIZE, felt*);
    memcpy(dst=message_payload, src=payload, len=payload_size);

    let (outputs) = os_carried_outputs_new(
        messages_to_l1=outputs.messages_to_l1,
        messages_to_l2=outputs.messages_to_l2 + MessageToL2Header.SIZE +
        outputs.messages_to_l2.payload_size,
    );
    return ();
}

// Prepares a constructor execution context based on the 'tx' hint variable.
// Leaves 'execution_info.tx_info' and 'deprecated_tx_info' empty - should be filled later on.
func prepare_constructor_execution_context{range_check_ptr, builtin_ptrs: BuiltinPointers*}(
    block_info: BlockInfo*
) -> (constructor_execution_context: ExecutionContext*, salt: felt) {
    alloc_locals;

    local contract_address_salt;
    local class_hash;
    local constructor_calldata_size;
    local constructor_calldata: felt*;
    %{
        ids.contract_address_salt = tx.contract_address_salt
        ids.class_hash = tx.class_hash
        ids.constructor_calldata_size = len(tx.constructor_calldata)
        ids.constructor_calldata = segments.gen_arg(arg=tx.constructor_calldata)
    %}
    assert_nn_le(constructor_calldata_size, SIERRA_ARRAY_LEN_BOUND - 1);

    let hash_ptr = builtin_ptrs.selectable.pedersen;
    with hash_ptr {
        let (contract_address) = get_contract_address(
            salt=contract_address_salt,
            class_hash=class_hash,
            constructor_calldata_size=constructor_calldata_size,
            constructor_calldata=constructor_calldata,
            deployer_address=0,
        );
    }
    update_builtin_ptrs(pedersen_ptr=hash_ptr, poseidon_ptr=builtin_ptrs.selectable.poseidon);

    tempvar constructor_execution_context = new ExecutionContext(
        entry_point_type=ENTRY_POINT_TYPE_CONSTRUCTOR,
        class_hash=class_hash,
        calldata_size=constructor_calldata_size,
        calldata=constructor_calldata,
        execution_info=new ExecutionInfo(
            block_info=block_info,
            tx_info=cast(nondet %{ segments.add() %}, TxInfo*),
            caller_address=ORIGIN_ADDRESS,
            contract_address=contract_address,
            selector=CONSTRUCTOR_ENTRY_POINT_SELECTOR,
        ),
        deprecated_tx_info=cast(nondet %{ segments.add() %}, DeprecatedTxInfo*),
    );

    return (
        constructor_execution_context=constructor_execution_context, salt=contract_address_salt
    );
}

func execute_deploy_account_transaction{
    range_check_ptr,
    remaining_gas: felt,
    builtin_ptrs: BuiltinPointers*,
    contract_state_changes: DictAccess*,
    contract_class_changes: DictAccess*,
    outputs: OsCarriedOutputs*,
}(block_context: BlockContext*) {
    alloc_locals;

    // Calculate address and prepare constructor execution context.
    let (
        local constructor_execution_context: ExecutionContext*, local salt
    ) = prepare_constructor_execution_context(block_info=block_context.block_info_for_validate);
    local constructor_execution_info: ExecutionInfo* = constructor_execution_context.execution_info;
    local sender_address = constructor_execution_info.contract_address;

    // Prepare validate_deploy calldata.
    local validate_deploy_calldata_size = constructor_execution_context.calldata_size + 2;
    let (validate_deploy_calldata: felt*) = alloc();
    assert validate_deploy_calldata[0] = constructor_execution_context.class_hash;
    assert validate_deploy_calldata[1] = salt;
    memcpy(
        dst=&validate_deploy_calldata[2],
        src=constructor_execution_context.calldata,
        len=constructor_execution_context.calldata_size,
    );

    // Guess tx fields.
    // Compute transaction hash and prepare transaction info.
    // The version validation is done in `compute_deploy_account_transaction_hash()`.
    let (__fp__, _) = get_fp_and_pc();
    local resource_bounds: ResourceBounds*;
    %{
        from src.starkware.starknet.core.os.transaction_hash.transaction_hash import (
            create_resource_bounds_list,
        )

        ids.resource_bounds = (
            0
            if tx.version < 3
            else segments.gen_arg(create_resource_bounds_list(tx.resource_bounds))
        )
    %}
    local common_tx_fields: CommonTxFields = CommonTxFields(
        tx_hash_prefix=DEPLOY_ACCOUNT_HASH_PREFIX,
        version=nondet %{ tx.version %},
        sender_address=sender_address,
        max_fee=nondet %{ tx.max_fee if tx.version < 3 else 0 %},
        chain_id=block_context.starknet_os_config.chain_id,
        nonce=nondet %{ tx.nonce %},
        tip=nondet %{ 0 if tx.version < 3 else tx.tip %},
        n_resource_bounds=nondet %{ 0 if tx.version < 3 else len(tx.resource_bounds) %},
        resource_bounds=resource_bounds,
        paymaster_data_length=nondet %{ 0 if tx.version < 3 else len(tx.paymaster_data) %},
        paymaster_data=cast(
            nondet %{ 0 if tx.version < 3 else segments.gen_arg(tx.paymaster_data) %}, felt*
        ),
        nonce_data_availability_mode=(
            nondet %{ 0 if tx.version < 3 else tx.nonce_data_availability_mode %}
        ),
        fee_data_availability_mode=(
            nondet %{ 0 if tx.version < 3 else tx.fee_data_availability_mode %}
        ),
    );
    let pedersen_ptr = builtin_ptrs.selectable.pedersen;
    let poseidon_ptr = builtin_ptrs.selectable.poseidon;
    with pedersen_ptr, poseidon_ptr {
        let transaction_hash = compute_deploy_account_transaction_hash(
            common_fields=&common_tx_fields,
            calldata_size=validate_deploy_calldata_size,
            calldata=validate_deploy_calldata,
        );
    }
    update_builtin_ptrs(pedersen_ptr=pedersen_ptr, poseidon_ptr=poseidon_ptr);

    %{
        assert ids.transaction_hash == tx.hash_value, (
            "Computed transaction_hash is inconsistent with the hash in the transaction. "
            f"Computed hash = {ids.transaction_hash}, Expected hash = {tx.hash_value}.")
    %}

    // Initialize and fill the transaction info structs.
    local tx_info: TxInfo* = constructor_execution_info.tx_info;
    local deprecated_tx_info: DeprecatedTxInfo* = constructor_execution_context.deprecated_tx_info;

    local signature_start: felt*;
    local signature_len: felt;
    %{
        ids.signature_start = segments.gen_arg(arg=tx.signature)
        ids.signature_len = len(tx.signature)
    %}
    assert_nn_le(signature_len, SIERRA_ARRAY_LEN_BOUND - 1);
    assert [tx_info] = TxInfo(
        version=common_tx_fields.version,
        account_contract_address=sender_address,
        max_fee=common_tx_fields.max_fee,
        signature_start=signature_start,
        signature_end=&signature_start[signature_len],
        transaction_hash=transaction_hash,
        chain_id=common_tx_fields.chain_id,
        nonce=common_tx_fields.nonce,
        resource_bounds_start=common_tx_fields.resource_bounds,
        resource_bounds_end=&common_tx_fields.resource_bounds[common_tx_fields.n_resource_bounds],
        tip=common_tx_fields.tip,
        paymaster_data_start=common_tx_fields.paymaster_data,
        paymaster_data_end=&common_tx_fields.paymaster_data[common_tx_fields.paymaster_data_length],
        nonce_data_availability_mode=common_tx_fields.nonce_data_availability_mode,
        fee_data_availability_mode=common_tx_fields.fee_data_availability_mode,
        account_deployment_data_start=cast(0, felt*),
        account_deployment_data_end=cast(0, felt*),
    );
    fill_deprecated_tx_info(tx_info=tx_info, dst=deprecated_tx_info);
    assert_deprecated_tx_fields_consistency(tx_info=tx_info);

    %{ execution_helper.start_tx(tx_info_ptr=ids.deprecated_tx_info.address_) %}

    deploy_contract(
        block_context=block_context, constructor_execution_context=constructor_execution_context
    );

    // Handle nonce here since 'deploy_contract' verifies that the nonce is zeroed.
    check_and_increment_nonce(tx_info=tx_info);

    // Run the account contract's "__validate_deploy__" entry point.

    // Fetch the newest state entry, after constructor invocation.
    let (state_entry: StateEntry*) = dict_read{dict_ptr=contract_state_changes}(key=sender_address);
    // Prepare execution context.
    local validate_deploy_execution_context: ExecutionContext* = new ExecutionContext(
        entry_point_type=ENTRY_POINT_TYPE_EXTERNAL,
        class_hash=state_entry.class_hash,
        calldata_size=validate_deploy_calldata_size,
        calldata=validate_deploy_calldata,
        execution_info=new ExecutionInfo(
            block_info=block_context.block_info_for_validate,
            tx_info=tx_info,
            caller_address=constructor_execution_info.caller_address,
            contract_address=sender_address,
            selector=VALIDATE_DEPLOY_ENTRY_POINT_SELECTOR,
        ),
        deprecated_tx_info=deprecated_tx_info,
    );
    // Run the entrypoint.
    let (retdata_size, retdata, is_deprecated) = select_execute_entry_point_func(
        block_context=block_context, execution_context=validate_deploy_execution_context
    );
    if (is_deprecated == 0) {
        assert retdata_size = 1;
        assert retdata[0] = VALIDATED;
    }

    // Charge fee.
    charge_fee(block_context=block_context, tx_execution_context=validate_deploy_execution_context);

    %{ execution_helper.end_tx() %}
    return ();
}

func execute_declare_transaction{
    range_check_ptr,
    remaining_gas: felt,
    builtin_ptrs: BuiltinPointers*,
    contract_state_changes: DictAccess*,
    contract_class_changes: DictAccess*,
    outputs: OsCarriedOutputs*,
}(block_context: BlockContext*) {
    alloc_locals;

    // Guess tx fields.
    // The version validation is done in `compute_declare_transaction_hash()`.
    local tx_version;
    local sender_address;
    local class_hash_ptr: felt*;
    local compiled_class_hash;
    local account_deployment_data_size = (
        nondet %{ 0 if tx.version < 3 else len(tx.account_deployment_data) %}
    );
    local account_deployment_data: felt* = cast(
        nondet %{ 0 if tx.version < 3 else segments.gen_arg(tx.account_deployment_data) %}, felt*
    );
    %{
        ids.tx_version = tx.version
        ids.sender_address = tx.sender_address
        ids.class_hash_ptr = segments.gen_arg([tx.class_hash])
        if tx.version <= 1:
            assert tx.compiled_class_hash is None, (
                "Deprecated declare must not have compiled_class_hash."
            )
            ids.compiled_class_hash = 0
        else:
            assert tx.compiled_class_hash is not None, (
                "Declare must have a concrete compiled_class_hash."
            )
            ids.compiled_class_hash = tx.compiled_class_hash
    %}

    if (tx_version == 0) {
        %{ execution_helper.skip_tx() %}
        return ();
    }

    // Update contract_class_changes if needed.
    if (tx_version != 1) {
        // Version is >= 2; declare the class hash.
        // Note that prev_value=0 enforces that a class may be declared only once.
        dict_update{dict_ptr=contract_class_changes}(
            key=[class_hash_ptr], prev_value=0, new_value=compiled_class_hash
        );
    } else {
        tempvar contract_class_changes = contract_class_changes;
    }
    tempvar contract_class_changes = contract_class_changes;

    let (state_entry: StateEntry*) = dict_read{dict_ptr=contract_state_changes}(key=sender_address);
    // The calldata for declare tx is the class hash.
    local validate_declare_execution_context: ExecutionContext* = new ExecutionContext(
        entry_point_type=ENTRY_POINT_TYPE_EXTERNAL,
        class_hash=state_entry.class_hash,
        calldata_size=1,
        calldata=class_hash_ptr,
        execution_info=new ExecutionInfo(
            block_info=block_context.block_info_for_validate,
            tx_info=cast(nondet %{ segments.add() %}, TxInfo*),
            caller_address=ORIGIN_ADDRESS,
            contract_address=sender_address,
            selector=VALIDATE_DECLARE_ENTRY_POINT_SELECTOR,
        ),
        deprecated_tx_info=cast(nondet %{ segments.add() %}, DeprecatedTxInfo*),
    );

    let (__fp__, _) = get_fp_and_pc();
    local resource_bounds: ResourceBounds*;
    %{
        from src.starkware.starknet.core.os.transaction_hash.transaction_hash import (
            create_resource_bounds_list,
        )

        ids.resource_bounds = (
            0
            if tx.version < 3
            else segments.gen_arg(create_resource_bounds_list(tx.resource_bounds))
        )
    %}
    local common_tx_fields: CommonTxFields = CommonTxFields(
        tx_hash_prefix=DECLARE_HASH_PREFIX,
        version=tx_version,
        sender_address=sender_address,
        max_fee=nondet %{ tx.max_fee if tx.version < 3 else 0 %},
        chain_id=block_context.starknet_os_config.chain_id,
        nonce=nondet %{ tx.nonce %},
        tip=nondet %{ 0 if tx.version < 3 else tx.tip %},
        n_resource_bounds=nondet %{ 0 if tx.version < 3 else len(tx.resource_bounds) %},
        resource_bounds=resource_bounds,
        paymaster_data_length=nondet %{ 0 if tx.version < 3 else len(tx.paymaster_data) %},
        paymaster_data=cast(
            nondet %{ 0 if tx.version < 3 else segments.gen_arg(tx.paymaster_data) %}, felt*
        ),
        nonce_data_availability_mode=(
            nondet %{ 0 if tx.version < 3 else tx.nonce_data_availability_mode %}
        ),
        fee_data_availability_mode=(
            nondet %{ 0 if tx.version < 3 else tx.fee_data_availability_mode %}
        ),
    );
    let pedersen_ptr = builtin_ptrs.selectable.pedersen;
    let poseidon_ptr = builtin_ptrs.selectable.poseidon;
    with pedersen_ptr, poseidon_ptr {
        let transaction_hash = compute_declare_transaction_hash(
            common_fields=&common_tx_fields,
            execution_context=validate_declare_execution_context,
            compiled_class_hash=compiled_class_hash,
            account_deployment_data_size=account_deployment_data_size,
            account_deployment_data=account_deployment_data,
        );
    }
    update_builtin_ptrs(pedersen_ptr=pedersen_ptr, poseidon_ptr=poseidon_ptr);

    %{
        assert ids.transaction_hash == tx.hash_value, (
            "Computed transaction_hash is inconsistent with the hash in the transaction. "
            f"Computed hash = {ids.transaction_hash}, Expected hash = {tx.hash_value}.")
    %}

    // Write the transaction info and complete the ExecutionInfo struct.
    tempvar tx_info = validate_declare_execution_context.execution_info.tx_info;
    local signature_start: felt*;
    local signature_len: felt;
    %{
        ids.signature_start = segments.gen_arg(arg=tx.signature)
        ids.signature_len = len(tx.signature)
    %}
    assert_nn_le(signature_len, SIERRA_ARRAY_LEN_BOUND - 1);
    assert [tx_info] = TxInfo(
        version=tx_version,
        account_contract_address=sender_address,
        max_fee=common_tx_fields.max_fee,
        signature_start=signature_start,
        signature_end=&signature_start[signature_len],
        transaction_hash=transaction_hash,
        chain_id=common_tx_fields.chain_id,
        nonce=common_tx_fields.nonce,
        resource_bounds_start=common_tx_fields.resource_bounds,
        resource_bounds_end=&common_tx_fields.resource_bounds[common_tx_fields.n_resource_bounds],
        tip=common_tx_fields.tip,
        paymaster_data_start=common_tx_fields.paymaster_data,
        paymaster_data_end=&common_tx_fields.paymaster_data[common_tx_fields.paymaster_data_length],
        nonce_data_availability_mode=common_tx_fields.nonce_data_availability_mode,
        fee_data_availability_mode=common_tx_fields.fee_data_availability_mode,
        account_deployment_data_start=account_deployment_data,
        account_deployment_data_end=&account_deployment_data[account_deployment_data_size],
    );
    fill_deprecated_tx_info(
        tx_info=tx_info, dst=validate_declare_execution_context.deprecated_tx_info
    );
    assert_deprecated_tx_fields_consistency(tx_info=tx_info);

    check_and_increment_nonce(tx_info=tx_info);

    %{
        execution_helper.start_tx(
            tx_info_ptr=ids.validate_declare_execution_context.deprecated_tx_info.address_
        )
    %}

    // Run the account contract's "__validate_declare__" entry point.
    let (retdata_size, retdata, is_deprecated) = select_execute_entry_point_func(
        block_context=block_context, execution_context=validate_declare_execution_context
    );
    if (is_deprecated == 0) {
        assert retdata_size = 1;
        assert retdata[0] = VALIDATED;
    }

    // Charge fee.
    charge_fee(
        block_context=block_context, tx_execution_context=validate_declare_execution_context
    );

    %{ execution_helper.end_tx() %}

    return ();
}
