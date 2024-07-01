// SPDX-License-Identifier: Apache-2.0.
pragma solidity >=0.6.12;

interface Identity {
    /*
      Allows a caller to ensure that the provided address is of the expected type and version.
    */
    function identify() external pure returns (string memory);
}
