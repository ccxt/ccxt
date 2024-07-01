from typing import List, Sequence

from starkware.cairo.lang.vm.crypto import poseidon_hash_many
from starkware.starknet.core.os.contract_class.class_hash import compute_class_hash
from starkware.starknet.core.os.transaction_hash.deprecated_transaction_hash import (
    TransactionHashPrefix,
)
from starkware.starknet.definitions import constants
from starkware.starknet.definitions.fields import Resource, ResourceBoundsMapping
from starkware.starknet.services.api.contract_class.contract_class import ContractClass


def _calculate_transaction_hash_common(
    tx_hash_prefix: TransactionHashPrefix,
    version: int,
    sender_address: int,
    chain_id: int,
    nonce: int,
    tx_type_specific_data: Sequence[int],
    tip: int,
    paymaster_data: Sequence[int],
    nonce_data_availability_mode: int,
    fee_data_availability_mode: int,
    resource_bounds: ResourceBoundsMapping,
) -> int:
    """
    Calculates the transaction hash in the StarkNet network - a unique identifier of the
    transaction.
    The transaction hash is a hash of the following information:
        1. A prefix that depends on the transaction type.
        2. The transaction's version.
        3. Sender address.
        4. A hash of the fee-related fields (see `_hash_fee_related_fields()`'s docstring).
        5. A hash of the paymaster data.
        6. The network's chain ID.
        7. The transaction's nonce.
        8. A concatenation of the nonce and fee data availability modes.
        9. Transaction-specific additional data.
    """
    fee_fields_hash = _hash_fee_related_fields(tip=tip, resource_bounds=resource_bounds)
    da_mode_concatenation = (
        nonce_data_availability_mode << constants.DATA_AVAILABILITY_MODE_BITS
    ) + fee_data_availability_mode
    data_to_hash = [
        tx_hash_prefix.value,
        version,
        sender_address,
        fee_fields_hash,
        poseidon_hash_many(paymaster_data),
        chain_id,
        nonce,
        da_mode_concatenation,
        *tx_type_specific_data,
    ]

    return poseidon_hash_many(array=data_to_hash)


def _hash_fee_related_fields(tip: int, resource_bounds: ResourceBoundsMapping) -> int:
    """
    Calculates the hash of the fee related fields of a transaction:
        1. The transaction's tip.
        2. A concatenation of the resource name, max amount and max price per unit - for each entry
            in the resource bounds, in the following order: L1_gas, L2_gas.
    """
    data_to_hash = [tip]
    resource_value_offset = constants.MAX_AMOUNT_BITS + constants.MAX_PRICE_PER_UNIT_BITS

    for resource in (Resource.L1_GAS, Resource.L2_GAS):
        bounds = resource_bounds[resource]
        data_to_hash += [
            (resource.value << resource_value_offset)
            + (bounds.max_amount << constants.MAX_PRICE_PER_UNIT_BITS)
            + bounds.max_price_per_unit,
        ]

    return poseidon_hash_many(array=data_to_hash)


def calculate_deploy_account_transaction_hash(
    version: int,
    nonce: int,
    contract_address: int,
    nonce_data_availability_mode: int,
    fee_data_availability_mode: int,
    resource_bounds: ResourceBoundsMapping,
    tip: int,
    paymaster_data: List[int],
    salt: int,
    class_hash: int,
    constructor_calldata: List[int],
    chain_id: int,
) -> int:
    deploy_account_specific_data = [poseidon_hash_many(constructor_calldata), class_hash, salt]

    return _calculate_transaction_hash_common(
        tx_hash_prefix=TransactionHashPrefix.DEPLOY_ACCOUNT,
        version=version,
        nonce=nonce,
        sender_address=contract_address,
        nonce_data_availability_mode=nonce_data_availability_mode,
        fee_data_availability_mode=fee_data_availability_mode,
        tip=tip,
        paymaster_data=paymaster_data,
        resource_bounds=resource_bounds,
        chain_id=chain_id,
        tx_type_specific_data=deploy_account_specific_data,
    )


def calculate_declare_transaction_hash(
    version: int,
    nonce: int,
    sender_address: int,
    nonce_data_availability_mode: int,
    fee_data_availability_mode: int,
    resource_bounds: ResourceBoundsMapping,
    tip: int,
    paymaster_data: List[int],
    compiled_class_hash: int,
    account_deployment_data: List[int],
    contract_class: ContractClass,
    chain_id: int,
) -> int:
    class_hash = compute_class_hash(contract_class=contract_class)
    declare_specific_data = [
        poseidon_hash_many(array=account_deployment_data),
        class_hash,
        compiled_class_hash,
    ]

    return _calculate_transaction_hash_common(
        tx_hash_prefix=TransactionHashPrefix.DECLARE,
        version=version,
        nonce=nonce,
        sender_address=sender_address,
        nonce_data_availability_mode=nonce_data_availability_mode,
        fee_data_availability_mode=fee_data_availability_mode,
        resource_bounds=resource_bounds,
        tip=tip,
        paymaster_data=paymaster_data,
        chain_id=chain_id,
        tx_type_specific_data=declare_specific_data,
    )


def calculate_invoke_transaction_hash(
    version: int,
    nonce: int,
    sender_address: int,
    nonce_data_availability_mode: int,
    fee_data_availability_mode: int,
    resource_bounds: ResourceBoundsMapping,
    tip: int,
    paymaster_data: List[int],
    calldata: List[int],
    account_deployment_data: List[int],
    chain_id: int,
) -> int:
    invoke_specific_data = [
        poseidon_hash_many(array=account_deployment_data),
        poseidon_hash_many(array=calldata),
    ]

    return _calculate_transaction_hash_common(
        tx_hash_prefix=TransactionHashPrefix.INVOKE,
        version=version,
        nonce=nonce,
        sender_address=sender_address,
        nonce_data_availability_mode=nonce_data_availability_mode,
        fee_data_availability_mode=fee_data_availability_mode,
        resource_bounds=resource_bounds,
        tip=tip,
        paymaster_data=paymaster_data,
        chain_id=chain_id,
        tx_type_specific_data=invoke_specific_data,
    )


def create_resource_bounds_list(resource_bounds: ResourceBoundsMapping) -> List[int]:
    """
    Converts the resource bounds mapping to a list of integers (the format used in the OS).
    """
    resource_bounds_list = []
    for resource in (Resource.L1_GAS, Resource.L2_GAS):
        bounds = resource_bounds[resource]
        resource_bounds_list += [
            resource.value,
            bounds.max_amount,
            bounds.max_price_per_unit,
        ]

    return resource_bounds_list
