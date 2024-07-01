// SPDX-License-Identifier: Apache-2.0.
pragma solidity ^0.8.0;

import "./IStarknetMessagingEvents.sol";

library CommitmentTreeUpdateOutput {
    /**
      Returns the previous commitment tree root.
    */
    function getPrevRoot(uint256[] calldata commitmentTreeUpdateData)
        internal
        pure
        returns (uint256)
    {
        return commitmentTreeUpdateData[0];
    }

    /**
      Returns the new commitment tree root.
    */
    function getNewRoot(uint256[] calldata commitmentTreeUpdateData)
        internal
        pure
        returns (uint256)
    {
        return commitmentTreeUpdateData[1];
    }
}

library StarknetOutput {
    uint256 internal constant MERKLE_UPDATE_OFFSET = 0;
    uint256 internal constant BLOCK_NUMBER_OFFSET = 2;
    uint256 internal constant BLOCK_HASH_OFFSET = 3;
    uint256 internal constant CONFIG_HASH_OFFSET = 4;
    uint256 internal constant USE_KZG_DA_OFFSET = 5;
    uint256 internal constant HEADER_SIZE = 6;
    uint256 internal constant KZG_SEGMENT_SIZE = 5;

    uint256 constant MESSAGE_TO_L1_FROM_ADDRESS_OFFSET = 0;
    uint256 constant MESSAGE_TO_L1_TO_ADDRESS_OFFSET = 1;
    uint256 constant MESSAGE_TO_L1_PAYLOAD_SIZE_OFFSET = 2;
    uint256 constant MESSAGE_TO_L1_PREFIX_SIZE = 3;

    uint256 constant MESSAGE_TO_L2_FROM_ADDRESS_OFFSET = 0;
    uint256 constant MESSAGE_TO_L2_TO_ADDRESS_OFFSET = 1;
    uint256 constant MESSAGE_TO_L2_NONCE_OFFSET = 2;
    uint256 constant MESSAGE_TO_L2_SELECTOR_OFFSET = 3;
    uint256 constant MESSAGE_TO_L2_PAYLOAD_SIZE_OFFSET = 4;
    uint256 constant MESSAGE_TO_L2_PREFIX_SIZE = 5;

    /**
      Returns the offset of the messages segment in the output_data.
    */
    function messageSegmentOffset(uint256 use_kzg_da) internal pure returns (uint256) {
        return HEADER_SIZE + (use_kzg_da == 1 ? KZG_SEGMENT_SIZE : 0);
    }

    /**
      Returns a slice of the 'output_data' with the commitment tree update information.
    */
    function getMerkleUpdate(uint256[] calldata output_data)
        internal
        pure
        returns (uint256[] calldata)
    {
        return output_data[MERKLE_UPDATE_OFFSET:MERKLE_UPDATE_OFFSET + 2];
    }

    /**
      Processes a message segment from the program output.
      The format of a message segment is the length of the messages in words followed
      by the concatenation of all the messages.

      The 'messages' mapping is updated according to the messages and the direction ('isL2ToL1').
    */
    function processMessages(
        bool isL2ToL1,
        uint256[] calldata programOutputSlice,
        mapping(bytes32 => uint256) storage messages
    ) internal returns (uint256) {
        uint256 messageSegmentSize = programOutputSlice[0];
        require(messageSegmentSize < 2**30, "INVALID_MESSAGE_SEGMENT_SIZE");

        uint256 offset = 1;
        uint256 messageSegmentEnd = offset + messageSegmentSize;

        uint256 payloadSizeOffset = (
            isL2ToL1 ? MESSAGE_TO_L1_PAYLOAD_SIZE_OFFSET : MESSAGE_TO_L2_PAYLOAD_SIZE_OFFSET
        );

        uint256 totalMsgFees = 0;
        while (offset < messageSegmentEnd) {
            uint256 payloadLengthOffset = offset + payloadSizeOffset;
            require(payloadLengthOffset < programOutputSlice.length, "MESSAGE_TOO_SHORT");

            uint256 payloadLength = programOutputSlice[payloadLengthOffset];
            require(payloadLength < 2**30, "INVALID_PAYLOAD_LENGTH");

            uint256 endOffset = payloadLengthOffset + 1 + payloadLength;
            require(endOffset <= programOutputSlice.length, "TRUNCATED_MESSAGE_PAYLOAD");

            if (isL2ToL1) {
                bytes32 messageHash = keccak256(
                    abi.encodePacked(programOutputSlice[offset:endOffset])
                );

                emit IStarknetMessagingEvents.LogMessageToL1(
                    // from=
                    programOutputSlice[offset + MESSAGE_TO_L1_FROM_ADDRESS_OFFSET],
                    // to=
                    address(uint160(programOutputSlice[offset + MESSAGE_TO_L1_TO_ADDRESS_OFFSET])),
                    // payload=
                    (uint256[])(programOutputSlice[offset + MESSAGE_TO_L1_PREFIX_SIZE:endOffset])
                );
                messages[messageHash] += 1;
            } else {
                {
                    bytes32 messageHash = keccak256(
                        abi.encodePacked(programOutputSlice[offset:endOffset])
                    );

                    uint256 msgFeePlusOne = messages[messageHash];
                    require(msgFeePlusOne > 0, "INVALID_MESSAGE_TO_CONSUME");
                    totalMsgFees += msgFeePlusOne - 1;
                    messages[messageHash] = 0;
                }

                uint256 nonce = programOutputSlice[offset + MESSAGE_TO_L2_NONCE_OFFSET];
                uint256[] memory messageSlice = (uint256[])(
                    programOutputSlice[offset + MESSAGE_TO_L2_PREFIX_SIZE:endOffset]
                );
                emit IStarknetMessagingEvents.ConsumedMessageToL2(
                    // from=
                    address(
                        uint160(programOutputSlice[offset + MESSAGE_TO_L2_FROM_ADDRESS_OFFSET])
                    ),
                    // to=
                    programOutputSlice[offset + MESSAGE_TO_L2_TO_ADDRESS_OFFSET],
                    // selector=
                    programOutputSlice[offset + MESSAGE_TO_L2_SELECTOR_OFFSET],
                    // payload=
                    messageSlice,
                    // nonce =
                    nonce
                );
            }

            offset = endOffset;
        }
        require(offset == messageSegmentEnd, "INVALID_MESSAGE_SEGMENT_SIZE");

        if (totalMsgFees > 0) {
            // NOLINTNEXTLINE: low-level-calls.
            (bool success, ) = msg.sender.call{value: totalMsgFees}("");
            require(success, "ETH_TRANSFER_FAILED");
        }

        return offset;
    }
}
