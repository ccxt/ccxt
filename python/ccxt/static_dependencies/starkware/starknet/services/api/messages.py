import dataclasses
from abc import ABC, abstractmethod
from dataclasses import field
from typing import List

from services.everest.definitions import fields as everest_fields
from starkware.cairo.bootloaders.compute_fact import keccak_ints
from starkware.python.utils import as_non_optional
from starkware.starknet.business_logic.transaction.deprecated_objects import InternalL1Handler
from starkware.starknet.definitions import fields
from starkware.starkware_utils.validated_dataclass import ValidatedDataclass


class StarknetMessage(ABC, ValidatedDataclass):
    """
    Abstract base class for StarkNet Messages.
    """

    @abstractmethod
    def encode(self) -> List[int]:
        """
        Encodes the message as it would appear in the output of the StarkNet OS.
        """


@dataclasses.dataclass(frozen=True)
class StarknetMessageToL1(StarknetMessage):
    """
    A StarkNet Message from L2 to L1.
    """

    from_address: int = field(metadata=fields.L2AddressField.metadata(field_name="from_address"))
    to_address: int = field(
        metadata=everest_fields.EthAddressIntField.metadata(field_name="to_address")
    )
    payload: List[int] = field(metadata=fields.felt_as_hex_or_str_list_metadata)

    def encode(self) -> List[int]:
        return [self.from_address, self.to_address, len(self.payload)] + self.payload

    def get_hash(self) -> str:
        return keccak_ints(values=self.encode())


@dataclasses.dataclass(frozen=True)
class StarknetMessageToL2(StarknetMessage):
    """
    A StarkNet Message from L1 to L2.
    """

    from_address: int = field(
        metadata=everest_fields.EthAddressIntField.metadata(field_name="from_address")
    )
    to_address: int = field(metadata=fields.L2AddressField.metadata(field_name="to_address"))
    l1_handler_selector: int
    payload: List[int] = field(metadata=fields.felt_as_hex_or_str_list_metadata)
    nonce: int = field(metadata=fields.nonce_metadata)

    def encode(self) -> List[int]:
        return [
            self.from_address,
            self.to_address,
            self.nonce,
            self.l1_handler_selector,
            len(self.payload),
            *self.payload,
        ]

    def get_hash(self) -> str:
        return keccak_ints(values=self.encode())

    @staticmethod
    def get_message_hash_from_tx(tx: InternalL1Handler) -> str:
        return StarknetMessageToL2(
            from_address=tx.calldata[0],
            to_address=tx.contract_address,
            l1_handler_selector=tx.entry_point_selector,
            payload=tx.calldata[1:],
            nonce=as_non_optional(tx.nonce),
        ).get_hash()
