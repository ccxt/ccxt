from typing import List

import pytest

from starkware.crypto.signature.fast_pedersen_hash import pedersen_hash as fast_pedersen_hash
from starkware.starknet.core.os.contract_class.class_hash import compute_class_hash
from starkware.starknet.core.os.contract_class.deprecated_class_hash import (
    compute_deprecated_class_hash,
)
from starkware.starknet.core.os.transaction_hash.deprecated_transaction_hash import (
    TransactionHashPrefix,
    _deprecated_calculate_transaction_hash_common,
    compute_hash_on_elements,
    deprecated_calculate_declare_transaction_hash,
    deprecated_calculate_deploy_account_transaction_hash,
    deprecated_calculate_deploy_transaction_hash,
    deprecated_calculate_invoke_transaction_hash,
    deprecated_calculate_l1_handler_transaction_hash,
    deprecated_calculate_old_declare_transaction_hash,
)
from starkware.starknet.core.os.transaction_hash.transaction_hash_test_utils import (
    run_cairo_declare_transaction_hash,
    run_cairo_deploy_account_transaction_hash,
    run_cairo_invoke_transaction_hash,
    run_cairo_l1_handler_transaction_hash,
    run_cairo_transaction_hash,
)
from starkware.starknet.core.test_contract.test_utils import get_deprecated_compiled_class
from starkware.starknet.definitions import constants
from starkware.starknet.public.abi import CONSTRUCTOR_ENTRY_POINT_SELECTOR
from starkware.starknet.services.api.contract_class.contract_class import (
    ContractClass,
    ContractEntryPoint,
    EntryPointType,
)


@pytest.mark.parametrize("tx_hash_prefix", set(TransactionHashPrefix))
@pytest.mark.parametrize("calldata", [[], [540, 338]])
@pytest.mark.parametrize("version", [0])
@pytest.mark.parametrize("additional_data", [[], [17]])
def test_transaction_hash_common_flow(
    tx_hash_prefix: TransactionHashPrefix,
    version: int,
    calldata: List[int],
    additional_data: List[int],
):
    """
    Tests that the Python and Cairo tx_hash implementations return the same value.
    """
    contract_address = 42
    entry_point_selector = 100
    chain_id = 1
    max_fee = 299

    tx_hash = _deprecated_calculate_transaction_hash_common(
        tx_hash_prefix=tx_hash_prefix,
        version=version,
        contract_address=contract_address,
        entry_point_selector=entry_point_selector,
        calldata=calldata,
        max_fee=max_fee,
        chain_id=chain_id,
        hash_function=fast_pedersen_hash,
        additional_data=additional_data,
    )

    assert tx_hash == run_cairo_transaction_hash(
        tx_hash_prefix=tx_hash_prefix,
        contract_address=contract_address,
        entry_point_selector=entry_point_selector,
        calldata=calldata,
        max_fee=max_fee,
        chain_id=chain_id,
        version=version,
        additional_data=additional_data,
    )


@pytest.mark.parametrize("constructor_calldata", [[], [539, 337]])
def test_deploy_transaction_hash(constructor_calldata: List[int]):
    # Constant value unrelated to the transaction data.
    version = constants.DEPRECATED_TRANSACTION_VERSION
    max_fee = 0

    # Tested transaction data.
    contract_address = 10
    chain_id = 1

    expected_hash = compute_hash_on_elements(
        data=[
            TransactionHashPrefix.DEPLOY.value,
            version,
            contract_address,
            CONSTRUCTOR_ENTRY_POINT_SELECTOR,
            compute_hash_on_elements(data=constructor_calldata, hash_func=fast_pedersen_hash),
            max_fee,
            chain_id,
        ],
        hash_func=fast_pedersen_hash,
    )

    assert (
        deprecated_calculate_deploy_transaction_hash(
            contract_address=contract_address,
            constructor_calldata=constructor_calldata,
            chain_id=chain_id,
            version=version,
        )
        == expected_hash
    )


@pytest.mark.parametrize("constructor_calldata", [[], [539, 337]])
def test_deploy_account_transaction_hash(constructor_calldata: List[int]):
    # Constant value unrelated to the transaction data.
    entry_point_selector = 0

    # Tested transaction data.
    version = constants.DEPRECATED_TRANSACTION_VERSION
    salt = 0
    contract_address = 19911991
    max_fee = 1
    chain_id = 2
    nonce = 0
    contract_class = get_deprecated_compiled_class(contract_name="dummy_account")
    class_hash = compute_deprecated_class_hash(
        contract_class=contract_class, hash_func=fast_pedersen_hash
    )
    calldata = [class_hash, salt, *constructor_calldata]

    expected_hash = compute_hash_on_elements(
        data=[
            TransactionHashPrefix.DEPLOY_ACCOUNT.value,
            version,
            contract_address,
            entry_point_selector,
            compute_hash_on_elements(data=calldata, hash_func=fast_pedersen_hash),
            max_fee,
            chain_id,
            nonce,
        ],
        hash_func=fast_pedersen_hash,
    )

    assert (
        deprecated_calculate_deploy_account_transaction_hash(
            version=version,
            contract_address=contract_address,
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            max_fee=max_fee,
            nonce=nonce,
            salt=salt,
            chain_id=chain_id,
        )
        == expected_hash
    )

    assert (
        run_cairo_deploy_account_transaction_hash(
            version=version,
            contract_address=contract_address,
            calldata=calldata,
            max_fee=max_fee,
            chain_id=chain_id,
            nonce=nonce,
        )
        == expected_hash
    )


def test_old_declare_transaction_hash():
    # Constant value unrelated to the transaction data.
    entry_point_selector = 0

    # Tested transaction data.
    version = 1
    sender_address = 19911991
    max_fee = 1
    chain_id = 2
    nonce = 0
    contract_class = get_deprecated_compiled_class(contract_name="dummy_account")
    class_hash = compute_deprecated_class_hash(
        contract_class=contract_class, hash_func=fast_pedersen_hash
    )

    expected_hash = compute_hash_on_elements(
        data=[
            TransactionHashPrefix.DECLARE.value,
            version,
            sender_address,
            entry_point_selector,
            compute_hash_on_elements(data=[class_hash], hash_func=fast_pedersen_hash),
            max_fee,
            chain_id,
            nonce,
        ],
        hash_func=fast_pedersen_hash,
    )

    assert (
        deprecated_calculate_old_declare_transaction_hash(
            contract_class=contract_class,
            chain_id=chain_id,
            sender_address=sender_address,
            max_fee=max_fee,
            version=version,
            nonce=nonce,
        )
        == expected_hash
    )

    assert (
        run_cairo_declare_transaction_hash(
            class_hash=class_hash,
            version=version,
            sender_address=sender_address,
            max_fee=max_fee,
            chain_id=chain_id,
            nonce=nonce,
        )
        == expected_hash
    )


def test_declare_transaction_hash():
    # Constant value unrelated to the transaction data.
    entry_point_selector = 0

    # Tested transaction data.
    version = constants.DEPRECATED_DECLARE_VERSION
    sender_address = 19911992
    max_fee = 2
    chain_id = 3
    nonce = 0
    compiled_class_hash = 123
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

    expected_hash = compute_hash_on_elements(
        data=[
            TransactionHashPrefix.DECLARE.value,
            version,
            sender_address,
            entry_point_selector,
            compute_hash_on_elements(data=[class_hash], hash_func=fast_pedersen_hash),
            max_fee,
            chain_id,
            nonce,
            compiled_class_hash,
        ],
        hash_func=fast_pedersen_hash,
    )

    assert (
        deprecated_calculate_declare_transaction_hash(
            contract_class=contract_class,
            compiled_class_hash=compiled_class_hash,
            chain_id=chain_id,
            sender_address=sender_address,
            max_fee=max_fee,
            version=version,
            nonce=nonce,
        )
        == expected_hash
    )

    assert (
        run_cairo_declare_transaction_hash(
            class_hash=class_hash,
            compiled_class_hash=compiled_class_hash,
            version=version,
            sender_address=sender_address,
            max_fee=max_fee,
            chain_id=chain_id,
            nonce=nonce,
        )
        == expected_hash
    )


def test_invoke_transaction_hash():
    # Constant value unrelated to the transaction data.
    entry_point_selector = None
    entry_point_selector_for_hash = 0

    # Tested transaction data.
    version = constants.DEPRECATED_TRANSACTION_VERSION
    sender_address = 19911992
    calldata = [17, 38]
    max_fee = 2
    chain_id = 3
    nonce = 9

    expected_hash = compute_hash_on_elements(
        data=[
            TransactionHashPrefix.INVOKE.value,
            version,
            sender_address,
            entry_point_selector_for_hash,
            compute_hash_on_elements(data=calldata, hash_func=fast_pedersen_hash),
            max_fee,
            chain_id,
            nonce,
        ],
        hash_func=fast_pedersen_hash,
    )

    assert (
        deprecated_calculate_invoke_transaction_hash(
            version=version,
            sender_address=sender_address,
            entry_point_selector=entry_point_selector,
            calldata=calldata,
            max_fee=max_fee,
            chain_id=chain_id,
            nonce=nonce,
        )
        == expected_hash
    )

    assert (
        run_cairo_invoke_transaction_hash(
            version=version,
            sender_address=sender_address,
            calldata=calldata,
            max_fee=max_fee,
            chain_id=chain_id,
            nonce=nonce,
        )
        == expected_hash
    )


def test_l1_handler_transaction_hash():
    # Constant value unrelated to the transaction data.
    max_fee = 0

    # Tested transaction data.
    contract_address = 19911992
    entry_point_selector = 2007
    calldata = [17, 38]
    chain_id = 3
    nonce = 9

    expected_hash = compute_hash_on_elements(
        data=[
            TransactionHashPrefix.L1_HANDLER.value,
            constants.L1_HANDLER_VERSION,
            contract_address,
            entry_point_selector,
            compute_hash_on_elements(data=calldata, hash_func=fast_pedersen_hash),
            max_fee,
            chain_id,
            nonce,
        ],
        hash_func=fast_pedersen_hash,
    )

    assert (
        deprecated_calculate_l1_handler_transaction_hash(
            contract_address=contract_address,
            entry_point_selector=entry_point_selector,
            calldata=calldata,
            chain_id=chain_id,
            nonce=nonce,
        )
        == expected_hash
    )

    assert (
        run_cairo_l1_handler_transaction_hash(
            contract_address=contract_address,
            entry_point_selector=entry_point_selector,
            calldata=calldata,
            chain_id=chain_id,
            nonce=nonce,
        )
        == expected_hash
    )
