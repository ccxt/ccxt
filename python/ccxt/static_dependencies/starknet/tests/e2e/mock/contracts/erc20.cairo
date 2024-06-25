%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256

@event
func Transfer(from_: felt, to: felt, value: Uint256) {
}

@external
func transferFrom{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    sender: felt, recipient: felt, amount: felt
) -> (success: felt) {
    alloc_locals;
    local success: felt = 1;
    return (success,);
}

@view
func balanceOf{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(account: felt) -> (
    balance: Uint256
) {
    alloc_locals;
    local balance: Uint256 = Uint256(low=200, high=0);
    return (balance,);
}
