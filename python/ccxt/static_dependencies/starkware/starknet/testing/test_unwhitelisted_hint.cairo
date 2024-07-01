%lang starknet
from starkware.cairo.common.cairo_builtins import HashBuiltin

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    %{ print("Deploying contract...") %}
    return ();
}
