from typing import Dict, List, Optional, Tuple

from starkware.starknet.business_logic.transaction.deprecated_objects import (
    DeprecatedInternalInvokeFunction,
)
from starkware.starknet.core.os.contract_address.contract_address import (
    calculate_contract_address_from_hash,
)
from starkware.starknet.public.abi import get_selector_from_name


class NonceManager:
    """
    Manages transaction nonces. Nonce is a property of the (account) contract, and it should
    advance sequentially in the transactions using any given contract.
    """

    def __init__(self):
        self.address_to_nonce: Dict[int, int] = {}

    def get(self, address: int) -> int:
        """
        Returns the current nonce for the given address.
        """
        return self.address_to_nonce.get(address, 0)

    def set(self, address: int, nonce: int):
        """
        Sets the given nonce as the next expected nonce, for the given address.
        """
        self.address_to_nonce[address] = nonce

    def next_nonce(self, address: int) -> int:
        """
        Returns the current nonce for the given address and advances it by 1.
        """
        nonce = self.get(address=address)
        self.address_to_nonce[address] = nonce + 1
        return nonce

    def as_dict(self) -> Dict[int, int]:
        """
        Returns a map from contract address to the next expected nonce.
        """
        return self.address_to_nonce

    def diff(self, other_address_to_nonce: Dict[int, int]) -> Dict[int, int]:
        """
        Gets a map between contract address to nonce values and returns a submap of it, containing
        all contract_addresses with nonces different from the next expected ones.
        """
        diff_items = other_address_to_nonce.items() - self.address_to_nonce.items()
        return dict(diff_items)


def create_internal_deploy_tx_for_testing(
    sender_address: int,
    class_hash: int,
    constructor_calldata: List[int],
    salt: int,
    max_fee: int,
    nonce: int,
    signature: Optional[List[int]] = None,
    chain_id: Optional[int] = None,
) -> Tuple[int, DeprecatedInternalInvokeFunction]:
    """
    Returns an invoke transaction object that deploys a contract by calling the `dummy_account`'s
    `deploy_contract` function.
    """
    contract_address = calculate_contract_address_from_hash(
        salt=salt,
        class_hash=class_hash,
        constructor_calldata=constructor_calldata,
        deployer_address=sender_address,
    )
    deploy_contract_calldata = [
        class_hash,
        salt,
        len(constructor_calldata),
        *constructor_calldata,
    ]
    deploy_tx = DeprecatedInternalInvokeFunction.create_wrapped_with_account(
        account_address=sender_address,
        contract_address=sender_address,
        calldata=deploy_contract_calldata,
        entry_point_selector=get_selector_from_name("deploy_contract"),
        max_fee=max_fee,
        nonce=nonce,
        signature=signature,
        chain_id=chain_id,
    )

    return contract_address, deploy_tx
