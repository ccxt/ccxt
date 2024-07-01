from typing import List, Optional

from services.external_api import eth_gas_constants
from starkware.starknet.business_logic.execution.objects import L2ToL1MessageInfo
from starkware.starknet.definitions import constants


def calculate_tx_gas_usage(
    l2_to_l1_messages: List[L2ToL1MessageInfo],
    n_modified_contracts: int,
    n_storage_changes: int,
    l1_handler_payload_size: Optional[int],
    n_class_hash_updates: int,
    n_compiled_class_hash_updates: int,
) -> int:
    """
    Returns an estimation of the L1 gas amount that will be used (by StarkNet's update state and
    the verifier) following the addition of a transaction with the given parameters to a batch;
    e.g., a message from L2 to L1 is followed by a storage write operation in StarkNet L1 contract
    which requires gas.

    Arguments:
    l1_handler_payload_size should be an int if and only if we calculate the gas usage of an
    L1 handler. Otherwise the payload size is irrelevant, and should be None.
    n_class_hash_updates is the number of contracts which got assigned a class hash by the
    transaction; this can happen through either a deploy or a replace class request.
    n_compiled_class_hash_updates is the number of contract classes that where paired with
    a compiled class hash; this can happen through a declare (cairo 1) transaction.
    """
    # Calculate the addition of the transaction to the output messages segment.
    residual_message_segment_length = get_message_segment_length(
        l2_to_l1_messages=l2_to_l1_messages,
        l1_handler_payload_size=l1_handler_payload_size,
    )

    # Calculate the effect of the transaction on the output data availability segment.
    residual_onchain_data_segment_length = get_onchain_data_segment_length(
        n_modified_contracts=n_modified_contracts,
        n_storage_changes=n_storage_changes,
        n_class_hash_updates=n_class_hash_updates,
        n_compiled_class_hash_updates=n_compiled_class_hash_updates,
    )

    n_l2_to_l1_messages = len(l2_to_l1_messages)
    n_l1_to_l2_messages = 0 if l1_handler_payload_size is None else 1

    starknet_gas_usage = (
        # StarkNet's updateState gets the message segment as an argument.
        residual_message_segment_length * eth_gas_constants.GAS_PER_MEMORY_WORD
        # StarkNet's updateState increases a (storage) counter for each L2-to-L1 message.
        + n_l2_to_l1_messages * eth_gas_constants.GAS_PER_ZERO_TO_NONZERO_STORAGE_SET
        # StarkNet's updateState decreases a (storage) counter for each L1-to-L2 consumed message.
        # (Note that we will probably get a refund of 15,000 gas for each consumed message but we
        # ignore it since refunded gas cannot be used for the current transaction execution).
        + n_l1_to_l2_messages * eth_gas_constants.GAS_PER_COUNTER_DECREASE
        + get_consumed_message_to_l2_emissions_cost(l1_handler_payload_size=l1_handler_payload_size)
        + get_log_message_to_l1_emissions_cost(l2_to_l1_messages=l2_to_l1_messages)
    )

    sharp_gas_usage = (
        residual_message_segment_length * eth_gas_constants.SHARP_GAS_PER_MEMORY_WORD
        + residual_onchain_data_segment_length * eth_gas_constants.SHARP_GAS_PER_MEMORY_WORD
    )

    return starknet_gas_usage + sharp_gas_usage


def get_message_segment_length(
    l2_to_l1_messages: List[L2ToL1MessageInfo],
    l1_handler_payload_size: Optional[int],
) -> int:
    """
    Returns the number of felts added to the output messages segment as a result of adding
    a transaction with the given parameters to a batch. Note that constant cells - such as the one
    that holds the segment size - are not counted.
    """
    # Add L2-to-L1 message segment length; for each message, the OS outputs the following:
    # to_address, from_address, payload_size, payload.
    message_segment_length = sum(
        constants.L2_TO_L1_MSG_HEADER_SIZE + len(message.payload) for message in l2_to_l1_messages
    )

    if l1_handler_payload_size is not None:
        # The corresponding transaction is of type L1 handler; add the length of the L1-to-L2
        # message sent by the sequencer (that will be outputted by the OS), which is of the
        # following format: from_address=calldata[0], to_address=contract_address,
        # nonce, selector, payload_size, payload=calldata[1:].
        message_segment_length += constants.L1_TO_L2_MSG_HEADER_SIZE + l1_handler_payload_size

    return message_segment_length


def get_onchain_data_segment_length(
    n_modified_contracts: int,
    n_storage_changes: int,
    n_class_hash_updates: int,
    n_compiled_class_hash_updates: int,
) -> int:
    """
    Returns the number of felts added to the output data availability segment as a result of adding
    a transaction to a batch. Note that constant cells - such as the one that holds the number of
    modified contracts - are not counted.
    This segment consists of deployment info (of contracts deployed by the transaction) and
    storage updates.
    """
    # For each newly modified contract: contract address, number of modified storage cells.
    onchain_data_segment_length = n_modified_contracts * 2
    # For each class updated (through a deploy or a class replacement).
    onchain_data_segment_length += n_class_hash_updates * constants.CLASS_UPDATE_SIZE
    # For each modified storage cell: key, new value.
    onchain_data_segment_length += n_storage_changes * 2
    # For each compiled class updated (through declare): class_hash, compiled_class_hash.
    onchain_data_segment_length += n_compiled_class_hash_updates * 2

    return onchain_data_segment_length


def get_consumed_message_to_l2_emissions_cost(l1_handler_payload_size: Optional[int]) -> int:
    """
    Returns the cost of ConsumedMessageToL2 event emissions caused by an L1 handler with the given
    payload size.
    """
    if l1_handler_payload_size is None:
        # The corresponding transaction is not an L1 handler.
        return 0

    return get_event_emission_cost(
        n_topics=constants.CONSUMED_MSG_TO_L2_N_TOPICS,
        # We're assuming the existence of one (not indexed) payload array.
        data_length=constants.CONSUMED_MSG_TO_L2_ENCODED_DATA_SIZE + l1_handler_payload_size,
    )


def get_log_message_to_l1_emissions_cost(l2_to_l1_messages: List[L2ToL1MessageInfo]) -> int:
    """
    Returns the cost of LogMessageToL1 event emissions caused by the given messages.
    """
    return sum(
        get_event_emission_cost(
            n_topics=constants.LOG_MSG_TO_L1_N_TOPICS,
            # We're assuming the existence of one (not indexed) payload array.
            data_length=constants.LOG_MSG_TO_L1_ENCODED_DATA_SIZE + len(message.payload),
        )
        for message in l2_to_l1_messages
    )


def get_event_emission_cost(n_topics: int, data_length: int) -> int:
    return (
        eth_gas_constants.GAS_PER_LOG
        + (n_topics + constants.N_DEFAULT_TOPICS) * eth_gas_constants.GAS_PER_LOG_TOPIC
        + data_length * eth_gas_constants.GAS_PER_LOG_DATA_WORD
    )
