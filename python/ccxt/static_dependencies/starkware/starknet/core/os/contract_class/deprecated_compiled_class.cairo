from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.hash_state import (
    HashState,
    hash_finalize,
    hash_init,
    hash_update,
    hash_update_single,
    hash_update_with_hashchain,
)
from starkware.cairo.common.math import assert_lt_felt
from starkware.cairo.common.registers import get_fp_and_pc

const DEPRECATED_COMPILED_CLASS_VERSION = 0;

struct DeprecatedContractEntryPoint {
    // A field element that encodes the signature of the called function.
    selector: felt,
    // The offset of the instruction that should be called within the contract bytecode.
    offset: felt,
}

struct DeprecatedCompiledClass {
    compiled_class_version: felt,

    // The length and pointer to the external entry point table of the contract.
    n_external_functions: felt,
    external_functions: DeprecatedContractEntryPoint*,

    // The length and pointer to the L1 handler entry point table of the contract.
    n_l1_handlers: felt,
    l1_handlers: DeprecatedContractEntryPoint*,

    // The length and pointer to the constructor entry point table of the contract.
    n_constructors: felt,
    constructors: DeprecatedContractEntryPoint*,

    n_builtins: felt,
    // 'builtin_list' is a continuous memory segment containing the ASCII encoding of the (ordered)
    // builtins used by the program.
    builtin_list: felt*,

    // The hinted_class_hash field should be set to the starknet_keccak of the
    // contract program, including its hints. However the OS does not validate that.
    // This field may be used by the operator to differentiate between contract classes that
    // differ only in the hints.
    // This field is included in the hash of the ContractClass to simplify the implementation.
    hinted_class_hash: felt,

    // The length and pointer of the bytecode.
    bytecode_length: felt,
    bytecode_ptr: felt*,
}

// Checks that the list of selectors is sorted.
func deprecated_validate_entry_points{range_check_ptr}(
    n_entry_points: felt, entry_points: DeprecatedContractEntryPoint*
) {
    if (n_entry_points == 0) {
        return ();
    }

    return deprecated_validate_entry_points_inner(
        n_entry_points=n_entry_points - 1,
        entry_points=&entry_points[1],
        prev_selector=entry_points[0].selector,
    );
}

// Inner function for deprecated_validate_entry_points.
func deprecated_validate_entry_points_inner{range_check_ptr}(
    n_entry_points: felt, entry_points: DeprecatedContractEntryPoint*, prev_selector
) {
    if (n_entry_points == 0) {
        return ();
    }

    assert_lt_felt(prev_selector, entry_points.selector);

    return deprecated_validate_entry_points_inner(
        n_entry_points=n_entry_points - 1,
        entry_points=&entry_points[1],
        prev_selector=entry_points[0].selector,
    );
}

func deprecated_compiled_class_hash{hash_ptr: HashBuiltin*}(
    compiled_class: DeprecatedCompiledClass*
) -> (hash: felt) {
    let (hash_state_ptr: HashState*) = hash_init();
    let (hash_state_ptr) = hash_update_single(
        hash_state_ptr=hash_state_ptr, item=compiled_class.compiled_class_version
    );

    // Hash external entry points.
    let (hash_state_ptr) = hash_update_with_hashchain(
        hash_state_ptr=hash_state_ptr,
        data_ptr=compiled_class.external_functions,
        data_length=compiled_class.n_external_functions * DeprecatedContractEntryPoint.SIZE,
    );

    // Hash L1 handler entry points.
    let (hash_state_ptr) = hash_update_with_hashchain(
        hash_state_ptr=hash_state_ptr,
        data_ptr=compiled_class.l1_handlers,
        data_length=compiled_class.n_l1_handlers * DeprecatedContractEntryPoint.SIZE,
    );

    // Hash constructor entry points.
    let (hash_state_ptr) = hash_update_with_hashchain(
        hash_state_ptr=hash_state_ptr,
        data_ptr=compiled_class.constructors,
        data_length=compiled_class.n_constructors * DeprecatedContractEntryPoint.SIZE,
    );

    // Hash builtins.
    let (hash_state_ptr) = hash_update_with_hashchain(
        hash_state_ptr=hash_state_ptr,
        data_ptr=compiled_class.builtin_list,
        data_length=compiled_class.n_builtins,
    );

    // Hash hinted_class_hash.
    let (hash_state_ptr) = hash_update_single(
        hash_state_ptr=hash_state_ptr, item=compiled_class.hinted_class_hash
    );

    // Hash bytecode.
    let (hash_state_ptr) = hash_update_with_hashchain(
        hash_state_ptr=hash_state_ptr,
        data_ptr=compiled_class.bytecode_ptr,
        data_length=compiled_class.bytecode_length,
    );

    let (hash: felt) = hash_finalize(hash_state_ptr=hash_state_ptr);
    return (hash=hash);
}

// A list entry that maps a hash to the corresponding compiled classes.
struct DeprecatedCompiledClassFact {
    // The hash of the compiled class. This member should be first, so that we can lookup items
    // with the hash as key, using find_element().
    hash: felt,
    compiled_class: DeprecatedCompiledClass*,
}

// Loads the compiled classes from the `os_input` hint variable.
// Returns DeprecatedCompiledClassFact list that maps a hash to a `DeprecatedCompiledClass`.
func deprecated_load_compiled_class_facts{pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    n_compiled_class_facts: felt, compiled_class_facts: DeprecatedCompiledClassFact*
) {
    alloc_locals;
    local n_compiled_class_facts;
    local compiled_class_facts: DeprecatedCompiledClassFact*;
    %{
        # Creates a set of deprecated class hashes to distinguish calls to deprecated entry points.
        __deprecated_class_hashes=set(os_input.deprecated_compiled_classes.keys())
        ids.compiled_class_facts = segments.add()
        ids.n_compiled_class_facts = len(os_input.deprecated_compiled_classes)
        vm_enter_scope({
            'compiled_class_facts': iter(os_input.deprecated_compiled_classes.items()),
        })
    %}

    deprecated_load_compiled_class_facts_inner(
        n_compiled_class_facts=n_compiled_class_facts, compiled_class_facts=compiled_class_facts
    );
    %{ vm_exit_scope() %}

    return (
        n_compiled_class_facts=n_compiled_class_facts, compiled_class_facts=compiled_class_facts
    );
}

// Loads 'n_compiled_class_facts' from the hint 'compiled_class_facts' and appends the
// corresponding DeprecatedCompiledClassFact to compiled_class_facts.
func deprecated_load_compiled_class_facts_inner{pedersen_ptr: HashBuiltin*, range_check_ptr}(
    n_compiled_class_facts, compiled_class_facts: DeprecatedCompiledClassFact*
) {
    if (n_compiled_class_facts == 0) {
        return ();
    }
    alloc_locals;

    let compiled_class_fact = compiled_class_facts;
    let compiled_class = compiled_class_fact.compiled_class;

    // Fetch contract data form hints.
    %{
        from starkware.starknet.core.os.contract_class.deprecated_class_hash import (
            get_deprecated_contract_class_struct,
        )

        compiled_class_hash, compiled_class = next(compiled_class_facts)

        cairo_contract = get_deprecated_contract_class_struct(
            identifiers=ids._context.identifiers, contract_class=compiled_class)
        ids.compiled_class = segments.gen_arg(cairo_contract)
    %}

    assert compiled_class.compiled_class_version = DEPRECATED_COMPILED_CLASS_VERSION;

    deprecated_validate_entry_points(
        n_entry_points=compiled_class.n_external_functions,
        entry_points=compiled_class.external_functions,
    );

    deprecated_validate_entry_points(
        n_entry_points=compiled_class.n_l1_handlers, entry_points=compiled_class.l1_handlers
    );

    let (hash) = deprecated_compiled_class_hash{hash_ptr=pedersen_ptr}(compiled_class);
    compiled_class_fact.hash = hash;

    %{
        from starkware.python.utils import from_bytes

        computed_hash = ids.compiled_class_fact.hash
        expected_hash = compiled_class_hash
        assert computed_hash == expected_hash, (
            "Computed compiled_class_hash is inconsistent with the hash in the os_input. "
            f"Computed hash = {computed_hash}, Expected hash = {expected_hash}.")

        vm_load_program(compiled_class.program, ids.compiled_class.bytecode_ptr)
    %}

    return deprecated_load_compiled_class_facts_inner(
        n_compiled_class_facts=n_compiled_class_facts - 1,
        compiled_class_facts=compiled_class_facts + DeprecatedCompiledClassFact.SIZE,
    );
}
