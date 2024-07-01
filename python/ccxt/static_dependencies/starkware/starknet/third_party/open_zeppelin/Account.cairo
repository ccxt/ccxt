// SPDX-License-Identifier: MIT
// OpenZeppelin Cairo Contracts v0.1.0 (account/Account.cairo)

%lang starknet

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin
from starkware.cairo.common.hash_state import (
    hash_finalize,
    hash_init,
    hash_update,
    hash_update_single,
)
from starkware.cairo.common.math import assert_not_equal
from starkware.cairo.common.memcpy import memcpy
from starkware.cairo.common.registers import get_fp_and_pc
from starkware.cairo.common.signature import verify_ecdsa_signature
from starkware.starknet.common.syscalls import (
    call_contract,
    deploy,
    get_caller_address,
    get_contract_address,
    get_tx_info,
)
from starkware.starknet.common.constants import ORIGIN_ADDRESS
from starkware.starknet.third_party.open_zeppelin.utils.constants import PREFIX_TRANSACTION

//
// Structs
//

struct MultiCall {
    account: felt,
    calls_len: felt,
    calls: Call*,
    max_fee: felt,
    version: felt,
}

struct Call {
    to: felt,
    selector: felt,
    calldata_len: felt,
    calldata: felt*,
}

// Tmp struct introduced while we wait for Cairo
// to support passing `[Call]` to __execute__
struct CallArray {
    to: felt,
    selector: felt,
    data_offset: felt,
    data_len: felt,
}

//
// Storage
//

@storage_var
func public_key() -> (res: felt) {
}

//
// Guards
//

@view
func assert_only_self{syscall_ptr: felt*}() {
    let (self) = get_contract_address();
    let (caller) = get_caller_address();
    assert self = caller;
    return ();
}

//
// Getters
//

@view
func get_public_key{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    res: felt
) {
    let (res) = public_key.read();
    return (res=res);
}

//
// Setters
//

@external
func set_public_key{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    new_public_key: felt
) {
    assert_only_self();
    public_key.write(new_public_key);
    return ();
}

//
// Constructor
//

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    _public_key: felt
) {
    public_key.write(_public_key);
    return ();
}

//
// Business logic
//

@view
func is_valid_signature{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr, ecdsa_ptr: SignatureBuiltin*
}(hash: felt, signature_len: felt, signature: felt*) -> () {
    let (_public_key) = public_key.read();

    // This interface expects a signature pointer and length to make
    // no assumption about signature validation schemes.
    // But this implementation does, and it expects a (sig_r, sig_s) pair.
    with_attr error_message("INVALID_SIGNATURE_LENGTH") {
        assert signature_len = 2;
    }

    let sig_r = signature[0];
    let sig_s = signature[1];

    verify_ecdsa_signature(
        message=hash, public_key=_public_key, signature_r=sig_r, signature_s=sig_s
    );

    return ();
}

@external
func __validate_declare__{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr, ecdsa_ptr: SignatureBuiltin*
}(class_hash: felt) {
    let (tx_info) = get_tx_info();
    is_valid_signature(tx_info.transaction_hash, tx_info.signature_len, tx_info.signature);
    return ();
}

@external
func __validate_deploy__{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr, ecdsa_ptr: SignatureBuiltin*
}(class_hash: felt, contract_address_salt: felt, _public_key: felt) {
    let (tx_info) = get_tx_info();
    is_valid_signature(tx_info.transaction_hash, tx_info.signature_len, tx_info.signature);
    return ();
}

@external
func __validate__{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr, ecdsa_ptr: SignatureBuiltin*
}(call_array_len: felt, call_array: CallArray*, calldata_len: felt, calldata: felt*) {
    let (tx_info) = get_tx_info();
    is_valid_signature(tx_info.transaction_hash, tx_info.signature_len, tx_info.signature);
    return ();
}

@external
@raw_output
func __execute__{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr, ecdsa_ptr: SignatureBuiltin*
}(call_array_len: felt, call_array: CallArray*, calldata_len: felt, calldata: felt*) -> (
    retdata_size: felt, retdata: felt*
) {
    alloc_locals;

    let (__fp__, _) = get_fp_and_pc();
    let (tx_info) = get_tx_info();

    // validate caller.
    let (caller) = get_caller_address();
    with_attr error_message(
            "Invalid caller. This function cannot be called from another contract.") {
        assert caller = ORIGIN_ADDRESS;
    }

    // validate version
    with_attr error_message(
            "Invalid transaction version. This account contract does not support "
            "transaction version 0.") {
        assert_not_equal(tx_info.version, 0);
    }

    // TMP: Convert `CallArray` to 'Call'.
    let (calls: Call*) = alloc();
    from_call_array_to_call(call_array_len, call_array, calldata, calls);
    let calls_len = call_array_len;

    local multicall: MultiCall = MultiCall(
        tx_info.account_contract_address,
        calls_len,
        calls,
        tx_info.max_fee,
        tx_info.version
        );

    // execute call.
    let (response: felt*) = alloc();
    let (response_len) = execute_list(multicall.calls_len, multicall.calls, response);

    return (retdata_size=response_len, retdata=response);
}

@external
func deploy_contract{syscall_ptr: felt*}(
    class_hash: felt,
    contract_address_salt: felt,
    constructor_calldata_len: felt,
    constructor_calldata: felt*,
    deploy_from_zero: felt,
) -> (contract_address: felt) {
    assert_only_self();
    let (contract_address) = deploy(
        class_hash=class_hash,
        contract_address_salt=contract_address_salt,
        constructor_calldata_size=constructor_calldata_len,
        constructor_calldata=constructor_calldata,
        deploy_from_zero=deploy_from_zero,
    );
    return (contract_address=contract_address);
}

func execute_list{syscall_ptr: felt*}(calls_len: felt, calls: Call*, response: felt*) -> (
    response_len: felt
) {
    alloc_locals;

    // if no more calls
    if (calls_len == 0) {
        return (response_len=0);
    }

    // do the current call
    let this_call: Call = [calls];
    let res = call_contract(
        contract_address=this_call.to,
        function_selector=this_call.selector,
        calldata_size=this_call.calldata_len,
        calldata=this_call.calldata,
    );
    // copy the result in response
    memcpy(response, res.retdata, res.retdata_size);
    // do the next calls recursively
    let (response_len) = execute_list(
        calls_len - 1, calls + Call.SIZE, response + res.retdata_size
    );
    return (response_len=response_len + res.retdata_size);
}

func from_call_array_to_call{syscall_ptr: felt*}(
    call_array_len: felt, call_array: CallArray*, calldata: felt*, calls: Call*
) {
    // if no more calls
    if (call_array_len == 0) {
        return ();
    }

    // parse the current call
    assert [calls] = Call(
        to=[call_array].to,
        selector=[call_array].selector,
        calldata_len=[call_array].data_len,
        calldata=calldata + [call_array].data_offset
        );

    // parse the remaining calls recursively
    from_call_array_to_call(
        call_array_len - 1, call_array + CallArray.SIZE, calldata, calls + Call.SIZE
    );
    return ();
}
