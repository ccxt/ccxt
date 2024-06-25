// Declare this file as a Starknet contract and set the required
// builtins.
%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin

// Define a storage variable.
@storage_var
func storage(key: felt) -> (value: felt) {
}

@external
func put{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(key: felt, value: felt) {
    storage.write(key, value);
    return ();
}

@view
func get{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(key: felt) -> (
    res: felt
) {
    let (value) = storage.read(key);
    return (value,);
}
