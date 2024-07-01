// A dummy account contract without any validations.

%lang starknet

from starkware.cairo.common.bool import FALSE
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.syscalls import (
    call_contract,
    deploy,
    get_caller_address,
    get_contract_address,
)

@view
func assert_only_self{syscall_ptr: felt*}() {
    let (self) = get_contract_address();
    let (caller) = get_caller_address();
    assert self = caller;
    return ();
}

@external
func __validate_declare__(class_hash: felt) {
    return ();
}

@external
func __validate_deploy__(class_hash: felt, contract_address_salt: felt) {
    return ();
}

@external
func __validate__(contract_address, selector: felt, calldata_len: felt, calldata: felt*) {
    return ();
}

@external
@raw_output
func __execute__{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    contract_address, selector: felt, calldata_len: felt, calldata: felt*
) -> (retdata_size: felt, retdata: felt*) {
    let (retdata_size: felt, retdata: felt*) = call_contract(
        contract_address=contract_address,
        function_selector=selector,
        calldata_size=calldata_len,
        calldata=calldata,
    );
    return (retdata_size=retdata_size, retdata=retdata);
}

@external
func deploy_contract{syscall_ptr: felt*}(
    class_hash: felt,
    contract_address_salt: felt,
    constructor_calldata_len: felt,
    constructor_calldata: felt*,
) -> (contract_address: felt) {
    assert_only_self();
    let (contract_address) = deploy(
        class_hash=class_hash,
        contract_address_salt=contract_address_salt,
        constructor_calldata_size=constructor_calldata_len,
        constructor_calldata=constructor_calldata,
        deploy_from_zero=FALSE,
    );
    return (contract_address=contract_address);
}
