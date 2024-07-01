from typing import Callable, Sequence

from starkware.cairo.common.hash_state import compute_hash_on_elements
from starkware.cairo.lang.vm.crypto import pedersen_hash
from starkware.python.utils import from_bytes
from starkware.starknet.core.os.contract_class.deprecated_class_hash import (
    compute_deprecated_class_hash,
)
from starkware.starknet.definitions.constants import L2_ADDRESS_UPPER_BOUND
from starkware.starknet.services.api.contract_class.contract_class import DeprecatedCompiledClass

CONTRACT_ADDRESS_PREFIX = from_bytes(b"STARKNET_CONTRACT_ADDRESS")


def calculate_contract_address(
    salt: int,
    contract_class: DeprecatedCompiledClass,
    constructor_calldata: Sequence[int],
    deployer_address: int,
    hash_function: Callable[[int, int], int] = pedersen_hash,
) -> int:
    """
    Calculates the contract address in the starkNet network - a unique identifier of the contract.
    The contract address is a hash chain of the following information:
        1. Prefix.
        2. Deployer address.
        3. Salt.
        4. Class hash.
    To avoid exceeding the maximum address we take modulus L2_ADDRESS_UPPER_BOUND of the above
    result.
    """
    class_hash = compute_deprecated_class_hash(
        contract_class=contract_class, hash_func=hash_function
    )
    return calculate_contract_address_from_hash(
        salt=salt,
        class_hash=class_hash,
        constructor_calldata=constructor_calldata,
        deployer_address=deployer_address,
        hash_function=hash_function,
    )


def calculate_contract_address_from_hash(
    salt: int,
    class_hash: int,
    constructor_calldata: Sequence[int],
    deployer_address: int,
    hash_function: Callable[[int, int], int] = pedersen_hash,
) -> int:
    """
    Same as calculate_contract_address(), except that it gets class_hash instead of
    contract_class.
    """
    constructor_calldata_hash = compute_hash_on_elements(
        data=constructor_calldata, hash_func=hash_function
    )
    raw_address = compute_hash_on_elements(
        data=[
            CONTRACT_ADDRESS_PREFIX,
            deployer_address,
            salt,
            class_hash,
            constructor_calldata_hash,
        ],
        hash_func=hash_function,
    )

    return raw_address % L2_ADDRESS_UPPER_BOUND
