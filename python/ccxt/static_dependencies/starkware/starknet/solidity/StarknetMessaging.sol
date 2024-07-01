// SPDX-License-Identifier: Apache-2.0.
pragma solidity ^0.8.0;

import "./IStarknetMessaging.sol";
import "starkware/solidity/libraries/NamedStorage8.sol";

/**
  Implements sending messages to L2 by adding them to a pipe and consuming messages from L2 by
  removing them from a different pipe. A deriving contract can handle the former pipe and add items
  to the latter pipe while interacting with L2.
*/
contract StarknetMessaging is IStarknetMessaging {
    /*
      Random slot storage elements and accessors.
    */
    string constant L1L2_MESSAGE_MAP_TAG = "STARKNET_1.0_MSGING_L1TOL2_MAPPPING_V2";
    string constant L2L1_MESSAGE_MAP_TAG = "STARKNET_1.0_MSGING_L2TOL1_MAPPPING";

    string constant L1L2_MESSAGE_NONCE_TAG = "STARKNET_1.0_MSGING_L1TOL2_NONCE";

    string constant L1L2_MESSAGE_CANCELLATION_MAP_TAG = (
        "STARKNET_1.0_MSGING_L1TOL2_CANCELLATION_MAPPPING"
    );

    string constant L1L2_MESSAGE_CANCELLATION_DELAY_TAG = (
        "STARKNET_1.0_MSGING_L1TOL2_CANCELLATION_DELAY"
    );

    uint256 constant MAX_L1_MSG_FEE = 1 ether;

    function getMaxL1MsgFee() public pure override returns (uint256) {
        return MAX_L1_MSG_FEE;
    }

    /**
      Returns the msg_fee + 1 for the message with the given 'msgHash',
      or 0 if no message with such a hash is pending.
    */
    function l1ToL2Messages(bytes32 msgHash) external view override returns (uint256) {
        return l1ToL2Messages()[msgHash];
    }

    function l2ToL1Messages(bytes32 msgHash) external view returns (uint256) {
        return l2ToL1Messages()[msgHash];
    }

    function l1ToL2Messages() internal pure returns (mapping(bytes32 => uint256) storage) {
        return NamedStorage.bytes32ToUint256Mapping(L1L2_MESSAGE_MAP_TAG);
    }

    function l2ToL1Messages() internal pure returns (mapping(bytes32 => uint256) storage) {
        return NamedStorage.bytes32ToUint256Mapping(L2L1_MESSAGE_MAP_TAG);
    }

    function l1ToL2MessageNonce() public view returns (uint256) {
        return NamedStorage.getUintValue(L1L2_MESSAGE_NONCE_TAG);
    }

    function messageCancellationDelay() public view returns (uint256) {
        return NamedStorage.getUintValue(L1L2_MESSAGE_CANCELLATION_DELAY_TAG);
    }

    function messageCancellationDelay(uint256 delayInSeconds) internal {
        NamedStorage.setUintValue(L1L2_MESSAGE_CANCELLATION_DELAY_TAG, delayInSeconds);
    }

    /**
      Returns the timestamp at the time cancelL1ToL2Message was called with a message
      matching 'msgHash'.

      The function returns 0 if cancelL1ToL2Message was never called.
    */
    function l1ToL2MessageCancellations(bytes32 msgHash) external view returns (uint256) {
        return l1ToL2MessageCancellations()[msgHash];
    }

    function l1ToL2MessageCancellations()
        internal
        pure
        returns (mapping(bytes32 => uint256) storage)
    {
        return NamedStorage.bytes32ToUint256Mapping(L1L2_MESSAGE_CANCELLATION_MAP_TAG);
    }

    /**
      Returns the hash of an L1 -> L2 message from msg.sender.
    */
    function getL1ToL2MsgHash(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload,
        uint256 nonce
    ) internal view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    uint256(uint160(msg.sender)),
                    toAddress,
                    nonce,
                    selector,
                    payload.length,
                    payload
                )
            );
    }

    /**
      Sends a message to an L2 contract.
    */
    function sendMessageToL2(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload
    ) external payable override returns (bytes32, uint256) {
        require(msg.value > 0, "L1_MSG_FEE_MUST_BE_GREATER_THAN_0");
        require(msg.value <= getMaxL1MsgFee(), "MAX_L1_MSG_FEE_EXCEEDED");
        uint256 nonce = l1ToL2MessageNonce();
        NamedStorage.setUintValue(L1L2_MESSAGE_NONCE_TAG, nonce + 1);
        emit LogMessageToL2(msg.sender, toAddress, selector, payload, nonce, msg.value);
        bytes32 msgHash = getL1ToL2MsgHash(toAddress, selector, payload, nonce);
        // Note that the inclusion of the unique nonce in the message hash implies that
        // l1ToL2Messages()[msgHash] was not accessed before.
        l1ToL2Messages()[msgHash] = msg.value + 1;
        return (msgHash, nonce);
    }

    /**
      Consumes a message that was sent from an L2 contract.

      Returns the hash of the message.
    */
    function consumeMessageFromL2(uint256 fromAddress, uint256[] calldata payload)
        external
        override
        returns (bytes32)
    {
        bytes32 msgHash = keccak256(
            abi.encodePacked(fromAddress, uint256(uint160(msg.sender)), payload.length, payload)
        );

        require(l2ToL1Messages()[msgHash] > 0, "INVALID_MESSAGE_TO_CONSUME");
        emit ConsumedMessageToL1(fromAddress, msg.sender, payload);
        l2ToL1Messages()[msgHash] -= 1;
        return msgHash;
    }

    function startL1ToL2MessageCancellation(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload,
        uint256 nonce
    ) external override returns (bytes32) {
        emit MessageToL2CancellationStarted(msg.sender, toAddress, selector, payload, nonce);
        bytes32 msgHash = getL1ToL2MsgHash(toAddress, selector, payload, nonce);
        uint256 msgFeePlusOne = l1ToL2Messages()[msgHash];
        require(msgFeePlusOne > 0, "NO_MESSAGE_TO_CANCEL");
        l1ToL2MessageCancellations()[msgHash] = block.timestamp;
        return msgHash;
    }

    function cancelL1ToL2Message(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload,
        uint256 nonce
    ) external override returns (bytes32) {
        emit MessageToL2Canceled(msg.sender, toAddress, selector, payload, nonce);
        // Note that the message hash depends on msg.sender, which prevents one contract from
        // cancelling another contract's message.
        // Trying to do so will result in NO_MESSAGE_TO_CANCEL.
        bytes32 msgHash = getL1ToL2MsgHash(toAddress, selector, payload, nonce);
        uint256 msgFeePlusOne = l1ToL2Messages()[msgHash];
        require(msgFeePlusOne != 0, "NO_MESSAGE_TO_CANCEL");

        uint256 requestTime = l1ToL2MessageCancellations()[msgHash];
        require(requestTime != 0, "MESSAGE_CANCELLATION_NOT_REQUESTED");

        uint256 cancelAllowedTime = requestTime + messageCancellationDelay();
        require(cancelAllowedTime >= requestTime, "CANCEL_ALLOWED_TIME_OVERFLOW");
        require(block.timestamp >= cancelAllowedTime, "MESSAGE_CANCELLATION_NOT_ALLOWED_YET");

        l1ToL2Messages()[msgHash] = 0;
        return (msgHash);
    }
}
