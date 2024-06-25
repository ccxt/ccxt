%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.syscalls import replace_class

@external
func replace_implementation{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*}(new_class: felt) {
    replace_class(new_class);
    return ();
}
