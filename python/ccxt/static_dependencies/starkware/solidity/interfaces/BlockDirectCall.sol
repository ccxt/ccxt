// SPDX-License-Identifier: Apache-2.0.
pragma solidity >=0.6.12;

/*
  This contract provides means to block direct call of an external function.
  A derived contract (e.g. MainDispatcherBase) should decorate sensitive functions with the
  notCalledDirectly modifier, thereby preventing it from being called directly, and allowing only
  calling using delegate_call.
*/
abstract contract BlockDirectCall {
    address immutable this_;

    constructor() internal {
        this_ = address(this);
    }

    modifier notCalledDirectly() {
        require(this_ != address(this), "DIRECT_CALL_DISALLOWED");
        _;
    }
}
