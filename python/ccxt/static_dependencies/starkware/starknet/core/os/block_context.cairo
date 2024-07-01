from starkware.cairo.common.cairo_builtins import HashBuiltin, PoseidonBuiltin
from starkware.cairo.common.math import unsigned_div_rem
from starkware.cairo.common.registers import get_fp_and_pc
from starkware.starknet.common.new_syscalls import BlockInfo
from starkware.starknet.core.os.builtins import BuiltinParams, get_builtin_params
from starkware.starknet.core.os.constants import (
    VALIDATE_BLOCK_NUMBER_ROUNDING,
    VALIDATE_TIMESTAMP_ROUNDING,
)
from starkware.starknet.core.os.contract_class.compiled_class import (
    CompiledClassFact,
    load_compiled_class_facts,
)
from starkware.starknet.core.os.contract_class.deprecated_compiled_class import (
    DeprecatedCompiledClassFact,
    deprecated_load_compiled_class_facts,
)
from starkware.starknet.core.os.os_config.os_config import StarknetOsConfig

// Represents information that is the same throughout the block.
struct BlockContext {
    // Parameters for select_builtins.
    builtin_params: BuiltinParams*,

    // A list of (compiled_class_hash, compiled_class) with the classes that are executed
    // in this block.
    n_compiled_class_facts: felt,
    compiled_class_facts: CompiledClassFact*,

    // A list of (deprecated_compiled_class_hash, deprecated_compiled_class) with
    // the classes that are executed in this block.
    n_deprecated_compiled_class_facts: felt,
    deprecated_compiled_class_facts: DeprecatedCompiledClassFact*,

    // Information about the block.
    block_info: BlockInfo*,
    // A version of `block_info` that will be returned by the 'get_execution_info'
    // syscall during '__validate__'.
    // Some of the fields, which cannot be used in validate mode, are zeroed out.
    block_info_for_validate: BlockInfo*,
    // StarknetOsConfig instance.
    starknet_os_config: StarknetOsConfig,
    // A function pointer to the 'execute_syscalls' function.
    execute_syscalls_ptr: felt*,
    // A function pointer to the 'execute_deprecated_syscalls' function.
    execute_deprecated_syscalls_ptr: felt*,
}

// Returns a BlockContext instance.
//
// 'syscall_handler' and 'os_input' should be passed as hint variables.
func get_block_context{poseidon_ptr: PoseidonBuiltin*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    execute_syscalls_ptr: felt*, execute_deprecated_syscalls_ptr: felt*
) -> (block_context: BlockContext*) {
    alloc_locals;
    let (n_compiled_class_facts, compiled_class_facts) = load_compiled_class_facts();
    let (
        n_deprecated_compiled_class_facts, deprecated_compiled_class_facts
    ) = deprecated_load_compiled_class_facts();
    let (builtin_params) = get_builtin_params();
    tempvar block_number = nondet %{ syscall_handler.block_info.block_number %};
    tempvar block_timestamp = nondet %{ syscall_handler.block_info.block_timestamp %};
    let (divided_block_number, _) = unsigned_div_rem(block_number, VALIDATE_BLOCK_NUMBER_ROUNDING);
    tempvar block_number_for_validate = divided_block_number * VALIDATE_BLOCK_NUMBER_ROUNDING;
    let (divided_block_timestamp, _) = unsigned_div_rem(
        block_timestamp, VALIDATE_TIMESTAMP_ROUNDING
    );
    tempvar block_timestamp_for_validate = divided_block_timestamp * VALIDATE_TIMESTAMP_ROUNDING;
    local block_context: BlockContext = BlockContext(
        builtin_params=builtin_params,
        n_compiled_class_facts=n_compiled_class_facts,
        compiled_class_facts=compiled_class_facts,
        n_deprecated_compiled_class_facts=n_deprecated_compiled_class_facts,
        deprecated_compiled_class_facts=deprecated_compiled_class_facts,
        block_info=new BlockInfo(
            block_number=block_number,
            block_timestamp=block_timestamp,
            sequencer_address=nondet %{ syscall_handler.block_info.sequencer_address %},
        ),
        block_info_for_validate=new BlockInfo(
            block_number=block_number_for_validate,
            block_timestamp=block_timestamp_for_validate,
            sequencer_address=0,
        ),
        starknet_os_config=StarknetOsConfig(
            chain_id=nondet %{ os_input.general_config.chain_id.value %},
            deprecated_fee_token_address=(
                nondet %{ os_input.general_config.deprecated_fee_token_address %}
            ),
            fee_token_address=nondet %{ os_input.general_config.fee_token_address %},
        ),
        execute_syscalls_ptr=execute_syscalls_ptr,
        execute_deprecated_syscalls_ptr=execute_deprecated_syscalls_ptr,
    );

    let (__fp__, _) = get_fp_and_pc();
    return (block_context=&block_context);
}
