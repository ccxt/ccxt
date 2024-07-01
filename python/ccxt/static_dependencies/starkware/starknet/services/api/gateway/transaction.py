import dataclasses
from abc import abstractmethod
from dataclasses import field

from services.everest.api.gateway.transaction import EverestTransaction
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.general_config import StarknetGeneralConfig
from starkware.starknet.definitions.transaction_type import TransactionType


# Mypy has a problem with dataclasses that contain unimplemented abstract methods.
# See https://github.com/python/mypy/issues/5374 for details on this problem.
@dataclasses.dataclass(frozen=True)  # type: ignore[misc]
class Transaction(EverestTransaction):
    """
    Represents the StarkNet transaction base class.
    """

    # The version of the transaction. It is fixed in the OS, and should be signed by the account
    # contract.
    # This field allows invalidating old transactions, whenever the meaning of the other
    # transaction fields is changed (in the OS).
    version: int = field(metadata=fields.tx_version_metadata)

    @property
    @classmethod
    @abstractmethod
    def tx_type(cls) -> TransactionType:
        """
        See base class for documentation.
        Declared here for return type downcast.
        """

    @abstractmethod
    def calculate_hash(self, general_config: StarknetGeneralConfig) -> int:
        """
        Calculates the transaction hash in the StarkNet network - a unique identifier of the
        transaction. See _calculate_transaction_hash_common() docstring for more details.
        """
