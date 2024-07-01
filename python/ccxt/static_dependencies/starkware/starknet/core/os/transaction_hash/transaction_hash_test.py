from typing import List

import pytest

from starkware.cairo.lang.vm.crypto import poseidon_hash_many
from starkware.crypto.signature.fast_pedersen_hash import pedersen_hash as fast_pedersen_hash
from starkware.starknet.core.os.contract_class.class_hash import compute_class_hash
from starkware.starknet.core.os.contract_class.deprecated_class_hash import (
    compute_deprecated_class_hash,
)
from starkware.starknet.core.os.transaction_hash.deprecated_transaction_hash import (
    TransactionHashPrefix,
)
from starkware.starknet.core.os.transaction_hash.transaction_hash import (
    calculate_declare_transaction_hash,
    calculate_deploy_account_transaction_hash,
    calculate_invoke_transaction_hash,
    create_resource_bounds_list,
)
from starkware.starknet.core.os.transaction_hash.transaction_hash_test_utils import (
    hash_fee_related_fields,
    run_cairo_declare_transaction_hash,
    run_cairo_deploy_account_transaction_hash,
    run_cairo_invoke_transaction_hash,
)
from starkware.starknet.core.test_contract.test_utils import get_deprecated_compiled_class
from starkware.starknet.definitions import constants, fields
from starkware.starknet.definitions.fields import Resource, ResourceBounds, ResourceBoundsMapping
from starkware.starknet.services.api.contract_class.contract_class import (
    ContractClass,
    ContractEntryPoint,
    EntryPointType,
)


@pytest.fixture
def resource_bounds() -> ResourceBoundsMapping:
    """
    Returns a resource bounds mapping. The resources order should be different from the hash order
    to make sure the order does affect the hash result.
    """
    return {
        Resource.L2_GAS: ResourceBounds(max_amount=0, max_price_per_unit=0),
        Resource.L1_GAS: ResourceBounds(max_amount=1993, max_price_per_unit=1),
    }


def test_resource_name_value():
    """
    The fee resource names are included in the transaction hash and therefore must be constant.
    """
    assert list(fields.Resource) == [fields.Resource.L1_GAS, fields.Resource.L2_GAS]
    assert fields.Resource.L1_GAS.value == constants.L1_GAS_RESOURCE_NAME_VALUE
    assert fields.Resource.L2_GAS.value == constants.L2_GAS_RESOURCE_NAME_VALUE


def test_declare_transaction_hash(resource_bounds: ResourceBoundsMapping):
    # Tested transaction data.
    version = constants.TRANSACTION_VERSION
    nonce = 0
    sender_address = 19911992
    chain_id = 3
    contract_class = ContractClass(
        contract_class_version="0.1.0",
        sierra_program=[0x2, 0x3],
        entry_points_by_type={
            EntryPointType.CONSTRUCTOR: [ContractEntryPoint(selector=4, function_idx=5)],
            EntryPointType.L1_HANDLER: [],
            EntryPointType.EXTERNAL: [],
        },
        abi="abi",
    )
    class_hash = compute_class_hash(contract_class=contract_class)
    compiled_class_hash = 123
    fee_data_availability_mode = 0
    nonce_data_availability_mode = 0
    da_mode_concatenation = 0
    tip = 0
    paymaster_data: List[int] = []
    account_deployment_data: List[int] = []

    expected_hash = poseidon_hash_many(
        array=[
            TransactionHashPrefix.DECLARE.value,
            version,
            sender_address,
            hash_fee_related_fields(tip=tip, resource_bounds=resource_bounds),
            poseidon_hash_many(array=paymaster_data),
            chain_id,
            nonce,
            da_mode_concatenation,
            poseidon_hash_many(array=account_deployment_data),
            class_hash,
            compiled_class_hash,
        ],
    )

    assert (
        calculate_declare_transaction_hash(
            version=version,
            nonce=nonce,
            sender_address=sender_address,
            fee_data_availability_mode=fee_data_availability_mode,
            nonce_data_availability_mode=nonce_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=paymaster_data,
            compiled_class_hash=compiled_class_hash,
            account_deployment_data=account_deployment_data,
            contract_class=contract_class,
            chain_id=chain_id,
        )
        == expected_hash
    )

    assert (
        run_cairo_declare_transaction_hash(
            class_hash=class_hash,
            compiled_class_hash=compiled_class_hash,
            version=version,
            sender_address=sender_address,
            chain_id=chain_id,
            nonce=nonce,
            n_resource_bounds=2,
            resource_bounds=create_resource_bounds_list(resource_bounds=resource_bounds),
        )
        == expected_hash
    )


@pytest.mark.parametrize("constructor_calldata", [[], [539, 337]])
def test_deploy_account_transaction_hash(
    constructor_calldata: List[int], resource_bounds: ResourceBoundsMapping
):
    # Tested transaction data.
    version = constants.TRANSACTION_VERSION
    nonce = 0
    salt = 0
    contract_address = 19911991
    contract_class = get_deprecated_compiled_class(contract_name="dummy_account")
    class_hash = compute_deprecated_class_hash(
        contract_class=contract_class, hash_func=fast_pedersen_hash
    )
    chain_id = 2
    fee_data_availability_mode = 0
    nonce_data_availability_mode = 0
    da_mode_concatenation = 0
    tip = 0
    paymaster_data: List[int] = []

    expected_hash = poseidon_hash_many(
        array=[
            TransactionHashPrefix.DEPLOY_ACCOUNT.value,
            version,
            contract_address,
            hash_fee_related_fields(tip=tip, resource_bounds=resource_bounds),
            poseidon_hash_many(array=paymaster_data),
            chain_id,
            nonce,
            da_mode_concatenation,
            poseidon_hash_many(array=constructor_calldata),
            class_hash,
            salt,
        ],
    )

    assert (
        calculate_deploy_account_transaction_hash(
            version=version,
            nonce=nonce,
            contract_address=contract_address,
            fee_data_availability_mode=fee_data_availability_mode,
            nonce_data_availability_mode=nonce_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=paymaster_data,
            salt=salt,
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            chain_id=chain_id,
        )
        == expected_hash
    )

    assert (
        run_cairo_deploy_account_transaction_hash(
            version=version,
            contract_address=contract_address,
            calldata=[class_hash, salt, *constructor_calldata],
            chain_id=chain_id,
            nonce=nonce,
            n_resource_bounds=2,
            resource_bounds=create_resource_bounds_list(resource_bounds=resource_bounds),
        )
        == expected_hash
    )


def test_invoke_transaction_hash(resource_bounds: ResourceBoundsMapping):
    # Tested transaction data.
    version = constants.TRANSACTION_VERSION
    sender_address = 19911992
    calldata = [17, 38]
    chain_id = 3
    nonce = 9
    paymaster_data: List[int] = []
    tip = 0
    fee_data_availability_mode = 0
    nonce_data_availability_mode = 0
    da_mode_concatenation = 0
    account_deployment_data: List[int] = []

    expected_hash = poseidon_hash_many(
        array=[
            TransactionHashPrefix.INVOKE.value,
            version,
            sender_address,
            hash_fee_related_fields(tip=tip, resource_bounds=resource_bounds),
            poseidon_hash_many(array=paymaster_data),
            chain_id,
            nonce,
            da_mode_concatenation,
            poseidon_hash_many(array=account_deployment_data),
            poseidon_hash_many(array=calldata),
        ],
    )

    assert (
        calculate_invoke_transaction_hash(
            version=version,
            nonce=nonce,
            sender_address=sender_address,
            fee_data_availability_mode=fee_data_availability_mode,
            nonce_data_availability_mode=nonce_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=paymaster_data,
            calldata=calldata,
            account_deployment_data=account_deployment_data,
            chain_id=chain_id,
        )
        == expected_hash
    )

    assert (
        run_cairo_invoke_transaction_hash(
            version=version,
            sender_address=sender_address,
            calldata=calldata,
            chain_id=chain_id,
            nonce=nonce,
            n_resource_bounds=2,
            resource_bounds=create_resource_bounds_list(resource_bounds=resource_bounds),
        )
        == expected_hash
    )
