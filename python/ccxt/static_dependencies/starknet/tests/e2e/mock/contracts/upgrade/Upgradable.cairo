%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_not_zero

/////////////////////
// STORAGE VARIABLES
/////////////////////

@storage_var
func _implementation() -> (address: felt) {
}

/////////////////////
// INTERNAL FUNCTIONS
/////////////////////

func _get_implementation{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    implementation: felt
) {
    let (res) = _implementation.read();
    return (implementation=res);
}

func _set_implementation{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    implementation: felt
) {
    assert_not_zero(implementation);
    _implementation.write(implementation);
    return ();
}