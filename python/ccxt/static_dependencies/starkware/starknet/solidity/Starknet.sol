// SPDX-License-Identifier: Apache-2.0.
pragma solidity ^0.8.24;

import "./Output.sol";
import "./StarknetGovernance.sol";
import "./StarknetMessaging.sol";
import "./StarknetOperator.sol";
import "./StarknetState.sol";
import "starkware/solidity/components/GovernedFinalizable.sol";
import "starkware/solidity/components/OnchainDataFactTreeEncoder.sol";
import "starkware/solidity/interfaces/ContractInitializer.sol";
import "starkware/solidity/interfaces/Identity.sol";
import "starkware/solidity/interfaces/IFactRegistry.sol";
import "starkware/solidity/interfaces/ProxySupport.sol";
import "starkware/solidity/libraries/NamedStorage8.sol";

contract Starknet is
    Identity,
    StarknetMessaging,
    StarknetGovernance,
    GovernedFinalizable,
    StarknetOperator,
    ContractInitializer,
    ProxySupport
{
    using StarknetState for StarknetState.State;

    // Indicates a change of the Starknet config hash.
    event ConfigHashChanged(
        address indexed changedBy,
        uint256 oldConfigHash,
        uint256 newConfigHash
    );

    // Logs the new state following a state update.
    event LogStateUpdate(uint256 globalRoot, int256 blockNumber, uint256 blockHash);

    // Logs a stateTransitionFact that was used to update the state.
    event LogStateTransitionFact(bytes32 stateTransitionFact);

    // Indicates a change of the Starknet OS program hash.
    event ProgramHashChanged(
        address indexed changedBy,
        uint256 oldProgramHash,
        uint256 newProgramHash
    );

    // Random storage slot tags.
    string internal constant PROGRAM_HASH_TAG = "STARKNET_1.0_INIT_PROGRAM_HASH_UINT";
    string internal constant VERIFIER_ADDRESS_TAG = "STARKNET_1.0_INIT_VERIFIER_ADDRESS";
    string internal constant STATE_STRUCT_TAG = "STARKNET_1.0_INIT_STARKNET_STATE_STRUCT";

    // The hash of the StarkNet config.
    string internal constant CONFIG_HASH_TAG = "STARKNET_1.0_STARKNET_CONFIG_HASH";

    // EIP-4844 constants.
    address internal constant POINT_EVALUATION_PRECOMPILE_ADDRESS = address(0x0A);
    // The precompile expected output:
    // Web3.keccak(FIELD_ELEMENTS_PER_BLOB.to_bytes(32, "big") + BLS_PRIME.to_bytes(32, "big")).
    bytes32 internal constant POINT_EVALUATION_PRECOMPILE_OUTPUT =
        0xb2157d3a40131b14c4c675335465dffde802f0ce5218ad012284d7f275d1b37c;
    uint256 internal constant PROOF_BYTES_LENGTH = 48;
    bytes1 internal constant VERSIONED_HASH_VERSION_KZG = bytes1(0x01);

    function setProgramHash(uint256 newProgramHash) external notFinalized onlyGovernance {
        emit ProgramHashChanged(msg.sender, programHash(), newProgramHash);
        programHash(newProgramHash);
    }

    function setConfigHash(uint256 newConfigHash) external notFinalized onlyGovernance {
        emit ConfigHashChanged(msg.sender, configHash(), newConfigHash);
        configHash(newConfigHash);
    }

    function setMessageCancellationDelay(uint256 delayInSeconds)
        external
        notFinalized
        onlyGovernance
    {
        messageCancellationDelay(delayInSeconds);
    }

    // State variable "programHash" read-access function.
    function programHash() public view returns (uint256) {
        return NamedStorage.getUintValue(PROGRAM_HASH_TAG);
    }

    // State variable "programHash" write-access function.
    function programHash(uint256 value) internal {
        NamedStorage.setUintValue(PROGRAM_HASH_TAG, value);
    }

    // State variable "verifier" access function.
    function verifier() internal view returns (address) {
        return NamedStorage.getAddressValue(VERIFIER_ADDRESS_TAG);
    }

    // State variable "configHash" write-access function.
    function configHash(uint256 value) internal {
        NamedStorage.setUintValue(CONFIG_HASH_TAG, value);
    }

    // State variable "configHash" read-access function.
    function configHash() public view returns (uint256) {
        return NamedStorage.getUintValue(CONFIG_HASH_TAG);
    }

    function setVerifierAddress(address value) internal {
        NamedStorage.setAddressValueOnce(VERIFIER_ADDRESS_TAG, value);
    }

    // State variable "state" access function.
    function state() internal pure returns (StarknetState.State storage stateStruct) {
        bytes32 location = keccak256(abi.encodePacked(STATE_STRUCT_TAG));
        assembly {
            stateStruct.slot := location
        }
    }

    function isInitialized() internal view override returns (bool) {
        return programHash() != 0;
    }

    function numOfSubContracts() internal pure override returns (uint256) {
        return 0;
    }

    function validateInitData(bytes calldata data) internal view override {
        require(data.length == 6 * 32, "ILLEGAL_INIT_DATA_SIZE");
        uint256 programHash_ = abi.decode(data[:32], (uint256));
        require(programHash_ != 0, "BAD_INITIALIZATION");
    }

    function processSubContractAddresses(bytes calldata subContractAddresses) internal override {}

    function initializeContractState(bytes calldata data) internal override {
        (
            uint256 programHash_,
            address verifier_,
            uint256 configHash_,
            StarknetState.State memory initialState
        ) = abi.decode(data, (uint256, address, uint256, StarknetState.State));

        programHash(programHash_);
        setVerifierAddress(verifier_);
        state().copy(initialState);
        configHash(configHash_);
        messageCancellationDelay(5 days);
    }

    /**
      Verifies p(z) = y given z, y, a commitment to p in the kzgSegment, and a KZG proof.
      The verification is done by calling Ethereum's point evaluation precompile.
    */
    function verifyKzgProof(uint256[] calldata kzgSegment, bytes calldata kzgProof) internal {
        require(kzgSegment.length == StarknetOutput.KZG_SEGMENT_SIZE, "INVALID_KZG_SEGMENT_SIZE");
        require(kzgProof.length == PROOF_BYTES_LENGTH, "INVALID_KZG_PROOF_SIZE");

        bytes32 blobHash = blobhash(
            // blobIndex=
            0
        );
        require(blobHash[0] == VERSIONED_HASH_VERSION_KZG, "UNEXPECTED_BLOB_HASH_VERSION");

        bytes memory kzgCommitment;
        bytes32 y;
        {
            uint256 kzgCommitmentLow = kzgSegment[0];
            uint256 kzgCommitmentHigh = kzgSegment[1];
            uint256 yLow = kzgSegment[3];
            uint256 yHigh = kzgSegment[4];

            require(kzgCommitmentLow <= type(uint192).max, "INVALID_KZG_COMMITMENT");
            require(kzgCommitmentHigh <= type(uint192).max, "INVALID_KZG_COMMITMENT");
            require(yLow <= type(uint128).max, "INVALID_Y_VALUE");
            require(yHigh <= type(uint128).max, "INVALID_Y_VALUE");

            kzgCommitment = abi.encodePacked(uint192(kzgCommitmentHigh), uint192(kzgCommitmentLow));
            y = bytes32((yHigh << 128) + yLow);
        }
        bytes32 z = bytes32(kzgSegment[2]);

        (bool ok, bytes memory precompile_output) = POINT_EVALUATION_PRECOMPILE_ADDRESS.staticcall(
            abi.encodePacked(blobHash, z, y, kzgCommitment, kzgProof)
        );

        require(ok, "POINT_EVALUATION_PRECOMPILE_CALL_FAILED");
        require(
            keccak256(precompile_output) == POINT_EVALUATION_PRECOMPILE_OUTPUT,
            "UNEXPECTED_POINT_EVALUATION_PRECOMPILE_OUTPUT"
        );
    }

    /**
      Performs the actual state update of Starknet, based on a proof of the Starknet OS that the
      state transition is valid.

      Arguments:
        programOutput - The main part of the StarkNet OS program output.
        stateTransitionFact - An encoding of the 'programOutput' (including on-chain data, if
            available).
    */
    function updateStateInternal(uint256[] calldata programOutput, bytes32 stateTransitionFact)
        internal
    {
        // Validate config hash.
        require(
            programOutput[StarknetOutput.CONFIG_HASH_OFFSET] == configHash(),
            "INVALID_CONFIG_HASH"
        );

        bytes32 sharpFact = keccak256(abi.encode(programHash(), stateTransitionFact));
        require(IFactRegistry(verifier()).isValid(sharpFact), "NO_STATE_TRANSITION_PROOF");
        emit LogStateTransitionFact(stateTransitionFact);

        // Perform state update.
        state().update(programOutput);

        // Process the messages after updating the state.
        // This is safer, as there is a call to transfer the fees during
        // the processing of the L1 -> L2 messages.

        // Process L2 -> L1 messages.
        uint256 outputOffset = StarknetOutput.messageSegmentOffset(
            programOutput[StarknetOutput.USE_KZG_DA_OFFSET]
        );
        outputOffset += StarknetOutput.processMessages(
            // isL2ToL1=
            true,
            programOutput[outputOffset:],
            l2ToL1Messages()
        );

        // Process L1 -> L2 messages.
        outputOffset += StarknetOutput.processMessages(
            // isL2ToL1=
            false,
            programOutput[outputOffset:],
            l1ToL2Messages()
        );
        require(outputOffset == programOutput.length, "STARKNET_OUTPUT_TOO_LONG");
        // Note that processing L1 -> L2 messages does an external call, and it shouldn't be
        // followed by storage changes.

        StarknetState.State storage state_ = state();
        emit LogStateUpdate(state_.globalRoot, state_.blockNumber, state_.blockHash);
    }

    /**
      Returns a string that identifies the contract.
    */
    function identify() external pure override returns (string memory) {
        return "StarkWare_Starknet_2024_8";
    }

    /**
      Returns the current state root.
    */
    function stateRoot() external view returns (uint256) {
        return state().globalRoot;
    }

    /**
      Returns the current block number.
    */
    function stateBlockNumber() external view returns (int256) {
        return state().blockNumber;
    }

    /**
      Returns the current block hash.
    */
    function stateBlockHash() external view returns (uint256) {
        return state().blockHash;
    }

    /**
      Updates the state of the Starknet, based on a proof of the Starknet OS that the state
      transition is valid. Data availability is provided on-chain.

      Arguments:
        programOutput - The main part of the StarkNet OS program output.
        data_availability_fact - An encoding of the on-chain data associated
        with the 'programOutput'.
    */
    function updateState(
        uint256[] calldata programOutput,
        uint256 onchainDataHash,
        uint256 onchainDataSize
    ) external onlyOperator {
        // We protect against re-entrancy attacks by reading the block number at the beginning
        // and validating that we have the expected block number at the end.
        int256 initialBlockNumber = state().blockNumber;

        // Validate program output.
        require(programOutput.length > StarknetOutput.HEADER_SIZE, "STARKNET_OUTPUT_TOO_SHORT");

        // Validate KZG DA flag.
        require(programOutput[StarknetOutput.USE_KZG_DA_OFFSET] == 0, "UNEXPECTED_KZG_DA_FLAG");

        bytes32 stateTransitionFact = OnchainDataFactTreeEncoder.encodeFactWithOnchainData(
            programOutput,
            OnchainDataFactTreeEncoder.DataAvailabilityFact(onchainDataHash, onchainDataSize)
        );
        updateStateInternal(programOutput, stateTransitionFact);
        // Note that updateStateInternal does an external call, and it shouldn't be followed by
        // storage changes.

        // Re-entrancy protection (see above).
        require(state().blockNumber == initialBlockNumber + 1, "INVALID_FINAL_BLOCK_NUMBER");
    }

    /**
      Updates the state of the StarkNet, based on a proof of the StarkNet OS that the state
      transition is valid. Data availability is committed with KZG and provided in a blob.

      Arguments:
        programOutput - The main part of the StarkNet OS program output.
        kzgProof - a KZG proof which is validated together with the StarkNet OS data commitment
            given in 'programOutput'.
    */
    function updateStateKzgDA(uint256[] calldata programOutput, bytes calldata kzgProof)
        external
        onlyOperator
    {
        // We protect against re-entrancy attacks by reading the block number at the beginning
        // and validating that we have the expected block number at the end.
        int256 initialBlockNumber = state().blockNumber;

        // Validate program output.
        require(
            programOutput.length > StarknetOutput.HEADER_SIZE + StarknetOutput.KZG_SEGMENT_SIZE,
            "STARKNET_OUTPUT_TOO_SHORT"
        );

        // Verify the KZG Proof.
        require(programOutput[StarknetOutput.USE_KZG_DA_OFFSET] == 1, "UNEXPECTED_KZG_DA_FLAG");
        verifyKzgProof(
            programOutput[StarknetOutput.HEADER_SIZE:][:StarknetOutput.KZG_SEGMENT_SIZE],
            kzgProof
        );

        bytes32 stateTransitionFact = OnchainDataFactTreeEncoder.hashMainPublicInput(programOutput);
        updateStateInternal(programOutput, stateTransitionFact);
        // Note that updateStateInternal does an external call, and it shouldn't be followed by
        // storage changes.

        // Re-entrancy protection (see above).
        require(state().blockNumber == initialBlockNumber + 1, "INVALID_FINAL_BLOCK_NUMBER");
    }
}
