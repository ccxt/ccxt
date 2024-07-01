from starkware.cairo.common.builtin_poseidon.poseidon import poseidon_hash_many
from starkware.cairo.common.cairo_builtins import HashBuiltin, PoseidonBuiltin
from starkware.cairo.common.hash_state import (
    hash_finalize,
    hash_init,
    hash_update,
    hash_update_single,
    hash_update_with_hashchain,
)
from starkware.cairo.common.hash_state_poseidon import HashState as PoseidonHashState
from starkware.cairo.common.hash_state_poseidon import hash_finalize as poseidon_hash_finalize
from starkware.cairo.common.hash_state_poseidon import hash_init as poseidon_hash_init
from starkware.cairo.common.hash_state_poseidon import hash_update as poseidon_hash_update
from starkware.cairo.common.hash_state_poseidon import (
    hash_update_single as poseidon_hash_update_single,
)
from starkware.cairo.common.hash_state_poseidon import (
    hash_update_with_nested_hash as poseidon_hash_update_with_nested_hash,
)
from starkware.cairo.common.math import assert_nn, assert_nn_le, assert_not_zero
from starkware.cairo.common.registers import get_fp_and_pc
from starkware.starknet.common.constants import DEPLOY_HASH_PREFIX, L1_HANDLER_HASH_PREFIX
from starkware.starknet.common.new_syscalls import ResourceBounds
from starkware.starknet.core.os.builtins import BuiltinPointers, SelectableBuiltins
from starkware.starknet.core.os.constants import (
    CONSTRUCTOR_ENTRY_POINT_SELECTOR,
    EXECUTE_ENTRY_POINT_SELECTOR,
    L1_GAS,
    L1_GAS_INDEX,
    L1_HANDLER_VERSION,
    L2_GAS,
    L2_GAS_INDEX,
)
from starkware.starknet.core.os.execution.execute_entry_point import ExecutionContext

// Common fields of a transaction. Used in hash calculation.
struct CommonTxFields {
    // The prefix of the transaction hash.
    tx_hash_prefix: felt,
    // The version of the transaction.
    version: felt,
    // The address of the account contract that sent the transaction.
    sender_address: felt,
    // The maximal fee to be paid in Wei for executing the transaction.
    max_fee: felt,
    // The chain id.
    chain_id: felt,
    // The nonce of the transaction: a sequential transaction number, attached to the account
    // contract. Allows transaction ordering and prevents re-execution of transactions.
    nonce: felt,
    // Fee-related fields.
    // The tip.
    tip: felt,
    n_resource_bounds: felt,
    // An array of ResourceBounds structs.
    resource_bounds: ResourceBounds*,
    // If specified, the paymaster should pay for the execution of the tx.
    // The data includes the address of the paymaster sponsoring the transaction, followed by extra
    // data to send to the paymaster.
    paymaster_data_length: felt,
    paymaster_data: felt*,
    // The data availability mode for the nonce.
    nonce_data_availability_mode: felt,
    // The data availability mode for the account balance from which fee will be taken.
    fee_data_availability_mode: felt,
}

func deprecated_get_transaction_hash{hash_ptr: HashBuiltin*}(
    tx_hash_prefix: felt,
    version: felt,
    contract_address: felt,
    entry_point_selector: felt,
    calldata_size: felt,
    calldata: felt*,
    max_fee: felt,
    chain_id: felt,
    additional_data_size: felt,
    additional_data: felt*,
) -> (tx_hash: felt) {
    let (hash_state_ptr) = hash_init();
    let (hash_state_ptr) = hash_update_single(hash_state_ptr=hash_state_ptr, item=tx_hash_prefix);
    let (hash_state_ptr) = hash_update_single(hash_state_ptr=hash_state_ptr, item=version);
    let (hash_state_ptr) = hash_update_single(hash_state_ptr=hash_state_ptr, item=contract_address);
    let (hash_state_ptr) = hash_update_single(
        hash_state_ptr=hash_state_ptr, item=entry_point_selector
    );
    let (hash_state_ptr) = hash_update_with_hashchain(
        hash_state_ptr=hash_state_ptr, data_ptr=calldata, data_length=calldata_size
    );
    let (hash_state_ptr) = hash_update_single(hash_state_ptr=hash_state_ptr, item=max_fee);
    let (hash_state_ptr) = hash_update_single(hash_state_ptr=hash_state_ptr, item=chain_id);

    let (hash_state_ptr) = hash_update(
        hash_state_ptr=hash_state_ptr, data_ptr=additional_data, data_length=additional_data_size
    );

    let (tx_hash) = hash_finalize(hash_state_ptr=hash_state_ptr);

    return (tx_hash=tx_hash);
}

func hash_fee_fields{range_check_ptr, poseidon_ptr: PoseidonBuiltin*}(
    tip: felt, resource_bounds: ResourceBounds*, n_resource_bounds: felt
) -> felt {
    alloc_locals;

    local data_to_hash: felt*;
    %{ ids.data_to_hash = segments.add() %}
    assert data_to_hash[0] = tip;
    assert_nn_le(tip, 2 ** 64 - 1);

    static_assert L1_GAS_INDEX == 0;
    static_assert L2_GAS_INDEX == 1;
    assert n_resource_bounds = 2;
    let l1_gas_bounds = resource_bounds[L1_GAS_INDEX];
    assert l1_gas_bounds.resource = L1_GAS;
    assert_nn_le(l1_gas_bounds.max_amount, 2 ** 64 - 1);
    assert_nn(l1_gas_bounds.max_price_per_unit);
    assert data_to_hash[1] = (l1_gas_bounds.resource * 2 ** 64 + l1_gas_bounds.max_amount) * 2 **
        128 + l1_gas_bounds.max_price_per_unit;

    let l2_gas_bounds = resource_bounds[L2_GAS_INDEX];
    assert l2_gas_bounds.resource = L2_GAS;
    assert l2_gas_bounds.max_amount = 0;
    assert l2_gas_bounds.max_price_per_unit = 0;
    assert data_to_hash[2] = (l2_gas_bounds.resource * 2 ** 64 + l2_gas_bounds.max_amount) * 2 **
        128 + l2_gas_bounds.max_price_per_unit;

    let (hash) = poseidon_hash_many(n=n_resource_bounds + 1, elements=data_to_hash);

    return hash;
}

func hash_tx_common_fields{
    range_check_ptr, poseidon_ptr: PoseidonBuiltin*, hash_state: PoseidonHashState
}(common_fields: CommonTxFields*) {
    alloc_locals;

    assert common_fields.paymaster_data_length = 0;

    let fee_fields_hash = hash_fee_fields(
        tip=common_fields.tip,
        resource_bounds=common_fields.resource_bounds,
        n_resource_bounds=common_fields.n_resource_bounds,
    );

    assert common_fields.nonce_data_availability_mode = 0;
    assert common_fields.fee_data_availability_mode = 0;
    let data_availability_modes = common_fields.nonce_data_availability_mode * 2 ** 32 +
        common_fields.fee_data_availability_mode;

    poseidon_hash_update_single(item=common_fields.tx_hash_prefix);
    poseidon_hash_update_single(item=common_fields.version);
    poseidon_hash_update_single(item=common_fields.sender_address);
    poseidon_hash_update_single(item=fee_fields_hash);
    poseidon_hash_update_with_nested_hash(
        data_ptr=common_fields.paymaster_data, data_length=common_fields.paymaster_data_length
    );
    poseidon_hash_update_single(item=common_fields.chain_id);
    poseidon_hash_update_single(item=common_fields.nonce);
    poseidon_hash_update_single(item=data_availability_modes);

    return ();
}

// Note that 'execution_context.execution_info.tx_info' and 'deprecated_tx_info' are uninitialized
// when this functions is called. In particular, these fields are not used in this function.
func compute_invoke_transaction_hash{
    range_check_ptr, pedersen_ptr: HashBuiltin*, poseidon_ptr: PoseidonBuiltin*
}(
    common_fields: CommonTxFields*,
    execution_context: ExecutionContext*,
    account_deployment_data_size: felt,
    account_deployment_data: felt*,
) -> felt {
    alloc_locals;

    assert account_deployment_data_size = 0;
    local version = common_fields.version;
    if ((version - 0) * (version - 1) == 0) {
        let (__fp__, _) = get_fp_and_pc();

        if (version == 0) {
            tempvar entry_point_selector_field = execution_context.execution_info.selector;
            tempvar additional_data_size = 0;
            tempvar additional_data = cast(0, felt*);
        } else {
            assert execution_context.execution_info.selector = EXECUTE_ENTRY_POINT_SELECTOR;
            tempvar entry_point_selector_field = 0;
            tempvar additional_data_size = 1;
            tempvar additional_data = &common_fields.nonce;
        }

        let (transaction_hash) = deprecated_get_transaction_hash{hash_ptr=pedersen_ptr}(
            tx_hash_prefix=common_fields.tx_hash_prefix,
            version=version,
            contract_address=common_fields.sender_address,
            entry_point_selector=entry_point_selector_field,
            calldata_size=execution_context.calldata_size,
            calldata=execution_context.calldata,
            max_fee=common_fields.max_fee,
            chain_id=common_fields.chain_id,
            additional_data_size=additional_data_size,
            additional_data=additional_data,
        );

        return transaction_hash;
    }

    // The invoke transaction has only versions 0, 1 and 3.
    with_attr error_message("Invalid transaction version: {version}.") {
        assert version = 3;
    }

    let hash_state: PoseidonHashState = poseidon_hash_init();
    with hash_state {
        hash_tx_common_fields(common_fields=common_fields);
        poseidon_hash_update_with_nested_hash(
            data_ptr=account_deployment_data, data_length=account_deployment_data_size
        );
        poseidon_hash_update_with_nested_hash(
            data_ptr=execution_context.calldata, data_length=execution_context.calldata_size
        );
    }
    let transaction_hash = poseidon_hash_finalize(hash_state=hash_state);

    return transaction_hash;
}

// See comment above `compute_invoke_transaction_hash()`.
func compute_l1_handler_transaction_hash{pedersen_ptr: HashBuiltin*}(
    execution_context: ExecutionContext*, chain_id: felt, nonce: felt
) -> felt {
    let (__fp__, _) = get_fp_and_pc();
    let (transaction_hash) = deprecated_get_transaction_hash{hash_ptr=pedersen_ptr}(
        tx_hash_prefix=L1_HANDLER_HASH_PREFIX,
        version=L1_HANDLER_VERSION,
        contract_address=execution_context.execution_info.contract_address,
        entry_point_selector=execution_context.execution_info.selector,
        calldata_size=execution_context.calldata_size,
        calldata=execution_context.calldata,
        max_fee=0,
        chain_id=chain_id,
        additional_data_size=1,
        additional_data=&nonce,
    );

    return transaction_hash;
}

// See comment above `compute_invoke_transaction_hash()`.
func compute_deploy_account_transaction_hash{
    range_check_ptr, pedersen_ptr: HashBuiltin*, poseidon_ptr: PoseidonBuiltin*
}(common_fields: CommonTxFields*, calldata_size: felt, calldata: felt*) -> felt {
    alloc_locals;

    local version = common_fields.version;
    if (version == 1) {
        let (__fp__, _) = get_fp_and_pc();
        let (transaction_hash) = deprecated_get_transaction_hash{hash_ptr=pedersen_ptr}(
            tx_hash_prefix=common_fields.tx_hash_prefix,
            version=version,
            contract_address=common_fields.sender_address,
            entry_point_selector=0,
            calldata_size=calldata_size,
            calldata=calldata,
            max_fee=common_fields.max_fee,
            chain_id=common_fields.chain_id,
            additional_data_size=1,
            additional_data=&common_fields.nonce,
        );

        return transaction_hash;
    }

    // The deploy account transaction has only versions 1 and 3.
    with_attr error_message("Invalid transaction version: {version}.") {
        assert version = 3;
    }

    let hash_state: PoseidonHashState = poseidon_hash_init();
    with hash_state {
        hash_tx_common_fields(common_fields=common_fields);
        // Hash and add the constructor calldata to the hash state.
        poseidon_hash_update_with_nested_hash(data_ptr=&calldata[2], data_length=calldata_size - 2);
        // Add the class hash and the contract address salt to the hash state.
        poseidon_hash_update(data_ptr=calldata, data_length=2);
    }
    let transaction_hash = poseidon_hash_finalize(hash_state=hash_state);

    return transaction_hash;
}

// See comment above `compute_invoke_transaction_hash()`.
func compute_declare_transaction_hash{
    range_check_ptr, pedersen_ptr: HashBuiltin*, poseidon_ptr: PoseidonBuiltin*
}(
    common_fields: CommonTxFields*,
    execution_context: ExecutionContext*,
    compiled_class_hash: felt,
    account_deployment_data_size: felt,
    account_deployment_data: felt*,
) -> felt {
    alloc_locals;

    assert account_deployment_data_size = 0;
    // Declare of version 0 should not reach this function.
    local version = common_fields.version;
    if ((version - 1) * (version - 2) == 0) {
        // For deprecated declare (of version 1), additional_data == [nonce];
        // otherwise, additional_data == [nonce, compiled_class_hash].
        local additional_data_size;
        local additional_data: felt*;
        %{ ids.additional_data = segments.add() %}
        assert additional_data[0] = common_fields.nonce;
        if (version == 1) {
            assert additional_data_size = 1;
        } else {
            assert additional_data_size = 2;
            assert additional_data[1] = compiled_class_hash;
        }

        let (transaction_hash) = deprecated_get_transaction_hash{hash_ptr=pedersen_ptr}(
            tx_hash_prefix=common_fields.tx_hash_prefix,
            version=version,
            contract_address=common_fields.sender_address,
            entry_point_selector=0,
            calldata_size=execution_context.calldata_size,
            calldata=execution_context.calldata,
            max_fee=common_fields.max_fee,
            chain_id=common_fields.chain_id,
            additional_data_size=additional_data_size,
            additional_data=additional_data,
        );

        return transaction_hash;
    }

    with_attr error_message("Invalid transaction version: {version}.") {
        assert version = 3;
    }

    let hash_state: PoseidonHashState = poseidon_hash_init();
    with hash_state {
        hash_tx_common_fields(common_fields=common_fields);
        poseidon_hash_update_with_nested_hash(
            data_ptr=account_deployment_data, data_length=account_deployment_data_size
        );
        // Add the class hash to the hash state.
        poseidon_hash_update_single(item=execution_context.calldata[0]);
        poseidon_hash_update_single(item=compiled_class_hash);
    }
    let transaction_hash = poseidon_hash_finalize(hash_state=hash_state);

    return transaction_hash;
}

func update_builtin_ptrs{builtin_ptrs: BuiltinPointers*}(
    pedersen_ptr: HashBuiltin*, poseidon_ptr: PoseidonBuiltin*
) {
    tempvar builtin_ptrs = new BuiltinPointers(
        selectable=SelectableBuiltins(
            pedersen=pedersen_ptr,
            range_check=builtin_ptrs.selectable.range_check,
            ecdsa=builtin_ptrs.selectable.ecdsa,
            bitwise=builtin_ptrs.selectable.bitwise,
            ec_op=builtin_ptrs.selectable.ec_op,
            poseidon=poseidon_ptr,
            segment_arena=builtin_ptrs.selectable.segment_arena,
        ),
        non_selectable=builtin_ptrs.non_selectable,
    );

    return ();
}
