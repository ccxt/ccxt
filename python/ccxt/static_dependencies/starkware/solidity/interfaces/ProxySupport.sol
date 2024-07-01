// SPDX-License-Identifier: Apache-2.0.
pragma solidity >=0.6.12;

import "../components/Governance.sol";
import "../libraries/Addresses.sol";
import "./BlockDirectCall.sol";
import "./ContractInitializer.sol";

/**
  This contract contains the code commonly needed for a contract to be deployed behind
  an upgradability proxy.
  It perform the required semantics of the proxy pattern,
  but in a generic manner.
  Instantiation of the Governance and of the ContractInitializer, that are the app specific
  part of initialization, has to be done by the using contract.
*/
abstract contract ProxySupport is Governance, BlockDirectCall, ContractInitializer {
    using Addresses for address;

    // The two function below (isFrozen & initialize) needed to bind to the Proxy.
    function isFrozen() external view virtual returns (bool) {
        return false;
    }

    /*
      The initialize() function serves as an alternative constructor for a proxied deployment.

      Flow and notes:
      1. This function cannot be called directly on the deployed contract, but only via
         delegate call.
      2. If an EIC is provided - init is passed onto EIC and the standard init flow is skipped.
         This true for both first intialization or a later one.
      3. The data passed to this function is as follows:
         [sub_contracts addresses, eic address, initData].

         When calling on an initialized contract (no EIC scenario), initData.length must be 0.
    */
    function initialize(bytes calldata data) external notCalledDirectly {
        uint256 eicOffset = 32 * numOfSubContracts();
        uint256 expectedBaseSize = eicOffset + 32;
        require(data.length >= expectedBaseSize, "INIT_DATA_TOO_SMALL");
        address eicAddress = abi.decode(data[eicOffset:expectedBaseSize], (address));

        bytes calldata subContractAddresses = data[:eicOffset];

        processSubContractAddresses(subContractAddresses);

        bytes calldata initData = data[expectedBaseSize:];

        // EIC Provided - Pass initData to EIC and the skip standard init flow.
        if (eicAddress != address(0x0)) {
            callExternalInitializer(eicAddress, initData);
            return;
        }

        if (isInitialized()) {
            require(initData.length == 0, "UNEXPECTED_INIT_DATA");
        } else {
            // Contract was not initialized yet.
            validateInitData(initData);
            initializeContractState(initData);
            initGovernance();
        }
    }

    function callExternalInitializer(address externalInitializerAddr, bytes calldata eicData)
        private
    {
        require(externalInitializerAddr.isContract(), "EIC_NOT_A_CONTRACT");

        // NOLINTNEXTLINE: low-level-calls, controlled-delegatecall.
        (bool success, bytes memory returndata) = externalInitializerAddr.delegatecall(
            abi.encodeWithSelector(this.initialize.selector, eicData)
        );
        require(success, string(returndata));
        require(returndata.length == 0, string(returndata));
    }
}
