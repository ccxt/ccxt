from dataclasses import field
from typing import ClassVar

import marshmallow_dataclass

from services.everest.api.feeder_gateway.response_objects import ValidatedResponseObject
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.transaction_type import TransactionType


@marshmallow_dataclass.dataclass(frozen=True)
class TransactionSpecificInfo(ValidatedResponseObject):
    transaction_hash: int = field(metadata=fields.transaction_hash_metadata)
    tx_type: ClassVar[TransactionType]
    version: int = field(metadata=fields.tx_version_metadata)
