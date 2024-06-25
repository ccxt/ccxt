// MIT License
//
// Copyright (c) 2021 OpenZeppelin
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

%lang starknet

from starkware.starknet.common.syscalls import get_caller_address, deploy
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.hash import hash2
from starkware.cairo.common.bool import FALSE, TRUE

@event
func ContractDeployed(
    address: felt,
    deployer: felt,
    unique: felt,
    classHash: felt,
    calldata_len: felt,
    calldata: felt*,
    salt: felt
) {
}

@external
func deployContract{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr
}(
    classHash: felt,
    salt: felt,
    unique: felt,
    calldata_len: felt,
    calldata: felt*
) -> (address: felt) {
    alloc_locals;
    let (deployer) = get_caller_address();

    local _salt;
    local from_zero;
    if (unique == TRUE) {
        let (unique_salt) = hash2{hash_ptr=pedersen_ptr}(deployer, salt);
        _salt = unique_salt;
        from_zero = FALSE;
        tempvar _pedersen = pedersen_ptr;
    } else {
        _salt = salt;
        from_zero = TRUE;
        tempvar _pedersen = pedersen_ptr;
    }

    let pedersen_ptr = _pedersen;

    let (address) = deploy(
        class_hash=classHash,
        contract_address_salt=_salt,
        constructor_calldata_size=calldata_len,
        constructor_calldata=calldata,
        deploy_from_zero=from_zero,
    );

    ContractDeployed.emit(
        address=address,
        deployer=deployer,
        unique=unique,
        classHash=classHash,
        calldata_len=calldata_len,
        calldata=calldata,
        salt=salt
    );

    return (address=address);
}
