// SPDX-License-Identifier: Apache-2.0.
pragma solidity >=0.6.12;

import "./MGovernance.sol";

abstract contract MOperator {
    event LogOperatorAdded(address operator);
    event LogOperatorRemoved(address operator);

    function isOperator(address user) public view virtual returns (bool);

    modifier onlyOperator() {
        require(isOperator(msg.sender), "ONLY_OPERATOR");
        _;
    }

    function registerOperator(address newOperator) external virtual;

    function unregisterOperator(address removedOperator) external virtual;

    function getOperators() internal view virtual returns (mapping(address => bool) storage);
}
