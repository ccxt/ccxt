from enum import Enum
from typing import Callable, List, Optional, Sequence, Tuple

from starkware.cairo.common.hash_state import compute_hash_on_elements
from starkware.cairo.lang.vm.crypto import pedersen_hash
from starkware.python.utils import as_non_optional, from_bytes
from starkware.starknet.core.os.contract_class.class_hash import compute_class_hash
from starkware.starknet.core.os.contract_class.deprecated_class_hash import (
    compute_deprecated_class_hash,
)
from starkware.starknet.definitions import constants
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.public.abi import CONSTRUCTOR_ENTRY_POINT_SELECTOR
from starkware.starknet.services.api.contract_class.contract_class import (
    ContractClass,
    DeprecatedCompiledClass,
)
from starkware.starkware_utils.error_handling import stark_assert


class TransactionHashPrefix(Enum):
    DECLARE = from_bytes(b"declare")
    DEPLOY = from_bytes(b"deploy")
    DEPLOY_ACCOUNT = from_bytes(b"deploy_account")
    INVOKE = from_bytes(b"invoke")
    L1_HANDLER = from_bytes(b"l1_handler")


def _deprecated_calculate_transaction_hash_common(
    tx_hash_prefix: TransactionHashPrefix,
    version: int,
    contract_address: int,
    entry_point_selector: int,
    calldata: Sequence[int],
    max_fee: int,
    chain_id: int,
    additional_data: Sequence[int],
    hash_function: Callable[[int, int], int] = pedersen_hash,
) -> int:
    """
    Calculates the deprecated transaction hash in the StarkNet network - a unique identifier of the
    transaction.
    The transaction hash is a hash chain of the following information:
        1. A prefix that depends on the transaction type.
        2. The transaction's version.
        3. Contract address.
        4. Entry point selector.
        5. A hash chain of the calldata.
        6. The transaction's maximum fee.
        7. The network's chain ID.
    Each hash chain computation begins with 0 as initialization and ends with its length appended.
    The length is appended in order to avoid collisions of the following kind:
    H([x,y,z]) = h(h(x,y),z) = H([w, z]) where w = h(x,y).
    """
    calldata_hash = compute_hash_on_elements(data=calldata, hash_func=hash_function)
    data_to_hash = [
        tx_hash_prefix.value,
        version,
        contract_address,
        entry_point_selector,
        calldata_hash,
        max_fee,
        chain_id,
        *additional_data,
    ]

    return compute_hash_on_elements(
        data=data_to_hash,
        hash_func=hash_function,
    )


def deprecated_calculate_deploy_transaction_hash(
    version: int,
    contract_address: int,
    constructor_calldata: Sequence[int],
    chain_id: int,
    hash_function: Callable[[int, int], int] = pedersen_hash,
) -> int:
    return _deprecated_calculate_transaction_hash_common(
        tx_hash_prefix=TransactionHashPrefix.DEPLOY,
        version=version,
        contract_address=contract_address,
        entry_point_selector=CONSTRUCTOR_ENTRY_POINT_SELECTOR,
        calldata=constructor_calldata,
        # Field max_fee is considered 0 for Deploy transaction hash calculation purposes.
        max_fee=0,
        chain_id=chain_id,
        additional_data=[],
        hash_function=hash_function,
    )


def deprecated_calculate_deploy_account_transaction_hash(
    version: int,
    contract_address: int,
    class_hash: int,
    constructor_calldata: List[int],
    max_fee: int,
    nonce: int,
    salt: int,
    chain_id: int,
    hash_function: Callable[[int, int], int] = pedersen_hash,
) -> int:
    return _deprecated_calculate_transaction_hash_common(
        tx_hash_prefix=TransactionHashPrefix.DEPLOY_ACCOUNT,
        version=version,
        contract_address=contract_address,
        entry_point_selector=0,
        calldata=[class_hash, salt, *constructor_calldata],
        max_fee=max_fee,
        chain_id=chain_id,
        additional_data=[nonce],
        hash_function=hash_function,
    )


def deprecated_calculate_declare_transaction_hash(
    contract_class: ContractClass,
    compiled_class_hash: int,
    chain_id: int,
    sender_address: int,
    max_fee: int,
    version: int,
    nonce: int,
    hash_function: Callable[[int, int], int] = pedersen_hash,
) -> int:
    class_hash = compute_class_hash(contract_class=contract_class)
    calldata = [class_hash]
    additional_data = [nonce, compiled_class_hash]

    return _deprecated_calculate_transaction_hash_common(
        tx_hash_prefix=TransactionHashPrefix.DECLARE,
        version=version,
        contract_address=sender_address,
        entry_point_selector=0,
        calldata=calldata,
        max_fee=max_fee,
        chain_id=chain_id,
        additional_data=additional_data,
        hash_function=hash_function,
    )


def deprecated_calculate_old_declare_transaction_hash(
    contract_class: DeprecatedCompiledClass,
    chain_id: int,
    sender_address: int,
    max_fee: int,
    version: int,
    nonce: int,
    hash_function: Callable[[int, int], int] = pedersen_hash,
) -> int:
    class_hash = compute_deprecated_class_hash(
        contract_class=contract_class, hash_func=hash_function
    )

    if version in [0, constants.QUERY_VERSION_BASE]:
        calldata = []
        additional_data = [class_hash]
    else:
        calldata = [class_hash]
        additional_data = [nonce]

    return _deprecated_calculate_transaction_hash_common(
        tx_hash_prefix=TransactionHashPrefix.DECLARE,
        version=version,
        contract_address=sender_address,
        entry_point_selector=0,
        calldata=calldata,
        max_fee=max_fee,
        chain_id=chain_id,
        additional_data=additional_data,
        hash_function=hash_function,
    )


def deprecated_calculate_invoke_transaction_hash(
    version: int,
    sender_address: int,
    entry_point_selector: Optional[int],
    calldata: List[int],
    max_fee: int,
    chain_id: int,
    nonce: Optional[int],
    hash_function: Callable[[int, int], int] = pedersen_hash,
) -> int:
    (entry_point_selector_field, additional_data) = prepare_invoke_fields_for_hash(
        entry_point_selector=entry_point_selector,
        nonce=nonce,
        version=version,
    )

    return _deprecated_calculate_transaction_hash_common(
        tx_hash_prefix=TransactionHashPrefix.INVOKE,
        version=version,
        contract_address=sender_address,
        entry_point_selector=entry_point_selector_field,
        calldata=calldata,
        max_fee=max_fee,
        chain_id=chain_id,
        additional_data=additional_data,
        hash_function=hash_function,
    )


def deprecated_calculate_l1_handler_transaction_hash(
    contract_address: int,
    entry_point_selector: int,
    calldata: Sequence[int],
    chain_id: int,
    nonce: int,
    hash_function: Callable[[int, int], int] = pedersen_hash,
) -> int:
    return _deprecated_calculate_transaction_hash_common(
        tx_hash_prefix=TransactionHashPrefix.L1_HANDLER,
        version=constants.L1_HANDLER_VERSION,
        contract_address=contract_address,
        entry_point_selector=entry_point_selector,
        calldata=calldata,
        max_fee=0,
        chain_id=chain_id,
        additional_data=[nonce],
        hash_function=hash_function,
    )


def prepare_invoke_fields_for_hash(
    entry_point_selector: Optional[int],
    nonce: Optional[int],
    version: int,
) -> Tuple[int, List[int]]:
    additional_data: List[int]

    if version in [0, constants.QUERY_VERSION_BASE]:
        stark_assert(
            nonce is None,
            code=StarknetErrorCode.INVALID_TRANSACTION_NONCE,
            message="An invoke transaction (version = 0) cannot have a nonce.",
        )
        additional_data = []
        stark_assert(
            entry_point_selector is not None,
            code=StarknetErrorCode.MISSING_ENTRY_POINT_FOR_INVOKE,
            message="Entry point selector must be specified for version 0.",
        )
        entry_point_selector_field = as_non_optional(entry_point_selector)
    else:
        stark_assert(
            nonce is not None,
            code=StarknetErrorCode.INVALID_TRANSACTION_NONCE,
            message="An invoke transaction (version != 0) must have a nonce.",
        )
        stark_assert(
            entry_point_selector is None,
            code=StarknetErrorCode.UNAUTHORIZED_ENTRY_POINT_FOR_INVOKE,
            message="Entry point selector must not be specified for version 1 and above.",
        )
        additional_data = [as_non_optional(nonce)]
        entry_point_selector_field = 0

    return entry_point_selector_field, additional_data
