from starkware.cairo.builtin_selection.select_builtins import select_builtins
from starkware.cairo.builtin_selection.validate_builtins import validate_builtins
from starkware.cairo.common.cairo_builtins import (
    BitwiseBuiltin,
    EcOpBuiltin,
    HashBuiltin,
    KeccakBuiltin,
    PoseidonBuiltin,
    SignatureBuiltin,
)
from starkware.cairo.common.registers import get_fp_and_pc
from starkware.starknet.builtins.segment_arena.segment_arena import SegmentArenaBuiltin

struct SelectableBuiltins {
    pedersen: HashBuiltin*,
    range_check: felt,
    ecdsa: felt,
    bitwise: BitwiseBuiltin*,
    ec_op: felt,
    poseidon: PoseidonBuiltin*,
    segment_arena: SegmentArenaBuiltin*,
}

struct NonSelectableBuiltins {
    keccak: KeccakBuiltin*,
}

struct BuiltinPointers {
    selectable: SelectableBuiltins,
    non_selectable: NonSelectableBuiltins,
}

// A struct containing the ASCII encoding of each builtin.
struct BuiltinEncodings {
    pedersen: felt,
    range_check: felt,
    ecdsa: felt,
    bitwise: felt,
    ec_op: felt,
    poseidon: felt,
    segment_arena: felt,
}

// A struct containing the instance size of each builtin.
struct BuiltinInstanceSizes {
    pedersen: felt,
    range_check: felt,
    ecdsa: felt,
    bitwise: felt,
    ec_op: felt,
    poseidon: felt,
    segment_arena: felt,
}

struct BuiltinParams {
    builtin_encodings: BuiltinEncodings*,
    builtin_instance_sizes: BuiltinInstanceSizes*,
}

static_assert SelectableBuiltins.SIZE == BuiltinEncodings.SIZE;
static_assert SelectableBuiltins.SIZE == BuiltinInstanceSizes.SIZE;

func get_builtin_params() -> (builtin_params: BuiltinParams*) {
    alloc_locals;
    let (local __fp__, _) = get_fp_and_pc();

    local builtin_encodings: BuiltinEncodings = BuiltinEncodings(
        pedersen='pedersen',
        range_check='range_check',
        ecdsa='ecdsa',
        bitwise='bitwise',
        ec_op='ec_op',
        poseidon='poseidon',
        segment_arena='segment_arena',
    );

    local builtin_instance_sizes: BuiltinInstanceSizes = BuiltinInstanceSizes(
        pedersen=HashBuiltin.SIZE,
        range_check=1,
        ecdsa=SignatureBuiltin.SIZE,
        bitwise=BitwiseBuiltin.SIZE,
        ec_op=EcOpBuiltin.SIZE,
        poseidon=PoseidonBuiltin.SIZE,
        segment_arena=SegmentArenaBuiltin.SIZE,
    );

    local builtin_params: BuiltinParams = BuiltinParams(
        builtin_encodings=&builtin_encodings, builtin_instance_sizes=&builtin_instance_sizes
    );
    return (builtin_params=&builtin_params);
}

// Updates the builtins listed in `selected_encodings` (the "selected" builtins) in `builtin_ptrs`
// to the values that appear in `selected_ptrs` (which should be of the same length as
// `selected_encodings`).
//
// For the non-selected builtins (that is, selectable builtins that do not appear in
// `selected_encodings`), this function validates that the difference is nonnegative
// (that is, they weren't moved backward) and divisible by the builtin size.
//
// In particular, note that the prover may choose to advance the non-selected builtins.
//
// Non-selectable builtins (see `NonSelectableBuiltins`) are copied as-is.
func update_builtin_ptrs{range_check_ptr}(
    builtin_params: BuiltinParams*,
    builtin_ptrs: BuiltinPointers*,
    n_selected_builtins,
    selected_encodings: felt*,
    selected_ptrs: felt*,
) -> BuiltinPointers* {
    alloc_locals;
    let n_builtins = BuiltinEncodings.SIZE;
    local return_builtin_ptrs: BuiltinPointers*;

    %{
        from starkware.starknet.core.os.os_utils import update_builtin_pointers

        # Fill the values of all builtin pointers after the current transaction.
        ids.return_builtin_ptrs = segments.gen_arg(
            update_builtin_pointers(
                memory=memory,
                n_builtins=ids.n_builtins,
                builtins_encoding_addr=ids.builtin_params.builtin_encodings.address_,
                n_selected_builtins=ids.n_selected_builtins,
                selected_builtins_encoding_addr=ids.selected_encodings,
                orig_builtin_ptrs_addr=ids.builtin_ptrs.selectable.address_,
                selected_builtin_ptrs_addr=ids.selected_ptrs,
                ),
            )
    %}

    select_builtins(
        n_builtins=n_builtins,
        all_encodings=builtin_params.builtin_encodings,
        all_ptrs=&return_builtin_ptrs.selectable,
        n_selected_builtins=n_selected_builtins,
        selected_encodings=selected_encodings,
        selected_ptrs=selected_ptrs,
    );

    // Call validate_builtins to validate that the builtin pointers have advanced correctly.
    validate_builtins(
        prev_builtin_ptrs=&builtin_ptrs.selectable,
        new_builtin_ptrs=&return_builtin_ptrs.selectable,
        builtin_instance_sizes=builtin_params.builtin_instance_sizes,
        n_builtins=n_builtins,
    );

    // Copy non-selectable builtins.
    assert return_builtin_ptrs.non_selectable = builtin_ptrs.non_selectable;

    return return_builtin_ptrs;
}
