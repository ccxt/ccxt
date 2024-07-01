from dataclasses import field
from typing import List

import marshmallow_dataclass

from starkware.starknet.business_logic.execution.execute_entry_point import ExecuteEntryPoint
from starkware.starknet.business_logic.transaction.deprecated_objects import InternalL1Handler
from starkware.starknet.definitions import fields
from starkware.starkware_utils.validated_dataclass import ValidatedMarshmallowDataclass


@marshmallow_dataclass.dataclass(frozen=True)
class CallFunction(ValidatedMarshmallowDataclass):
    """
    Represents a contract function call in the StarkNet network.
    """

    contract_address: int = field(metadata=fields.contract_address_metadata)
    # A field element that encodes the invoked method.
    entry_point_selector: int = field(metadata=fields.entry_point_selector_metadata)
    calldata: List[int] = field(metadata=fields.calldata_metadata)

    def to_entry_point(self) -> ExecuteEntryPoint:
        return ExecuteEntryPoint.create_for_testing(
            contract_address=self.contract_address,
            calldata=self.calldata,
            entry_point_selector=self.entry_point_selector,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class CallL1Handler(ValidatedMarshmallowDataclass):
    """
    Represents an L1 handler call in the StarkNet network.
    """

    from_address: int = field(metadata=fields.from_address_field_metadata)
    to_address: int = field(metadata=fields.contract_address_metadata)
    entry_point_selector: int = field(metadata=fields.entry_point_selector_metadata)
    payload: List[int] = field(metadata=fields.payload_metadata)

    def to_internal(self, chain_id: int) -> InternalL1Handler:
        """
        Creates an internal L1 handler with nonce 0.
        """
        return InternalL1Handler.create(
            contract_address=self.to_address,
            entry_point_selector=self.entry_point_selector,
            calldata=[self.from_address, *self.payload],
            nonce=0,
            chain_id=chain_id,
            paid_fee_on_l1=None,
        )
