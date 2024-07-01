import dataclasses
from dataclasses import field
from enum import Enum, auto
from typing import Any, Dict, Iterable, List, Optional, Tuple, Type, TypeVar, Union

import marshmallow
import marshmallow.exceptions
import marshmallow.fields as mfields
import marshmallow.utils
import marshmallow_dataclass
from marshmallow.decorators import pre_load
from typing_extensions import Literal

from services.everest.api.feeder_gateway.response_objects import (
    BaseResponseObject,
    ValidatedResponseObject,
)
from services.everest.business_logic.transaction_execution_objects import TransactionFailureReason
from services.everest.definitions import fields as everest_fields
from starkware.cairo.lang.vm.cairo_pie import ExecutionResources
from starkware.crypto.signature.signature import ECSignature
from starkware.eth.web3_wrapper import Web3
from starkware.python.utils import as_non_optional, to_bytes
from starkware.starknet.business_logic.execution.objects import (
    CallInfo,
    CallType,
    Event,
    GasVector,
    OrderedEvent,
    OrderedL2ToL1Message,
)
from starkware.starknet.business_logic.state.state_api_objects import (
    GasPrices,
    ResourcePrice,
    rename_old_gas_price_fields,
)
from starkware.starknet.business_logic.transaction.deprecated_objects import (
    DeprecatedInternalTransaction,
)
from starkware.starknet.business_logic.transaction.objects import InternalTransaction
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.l1_da_mode import L1DaMode
from starkware.starknet.services.api.contract_class.contract_class import EntryPointType
from starkware.starknet.services.api.feeder_gateway.account_transaction_specific_info import (
    AccountTransactionSpecificInfo,
)
from starkware.starknet.services.api.feeder_gateway.deprecated_transaction_specific_info import (
    DeprecatedTransactionSpecificInfo,
)
from starkware.starknet.services.api.feeder_gateway.transaction_specific_info import (
    TransactionSpecificInfo,
)
from starkware.starknet.services.api.feeder_gateway.transaction_specific_info_schema import (
    TransactionSpecificInfoSchema,
)
from starkware.starkware_utils.marshmallow_dataclass_fields import (
    VariadicLengthTupleField,
    additional_metadata,
    nonrequired_list_metadata,
    nonrequired_optional_metadata,
)
from starkware.starkware_utils.marshmallow_fields_metadata import sequential_id_metadata
from starkware.starkware_utils.serializable_dataclass import SerializableMarshmallowDataclass
from starkware.starkware_utils.validated_dataclass import ValidatedDataclass

BlockNumber = int
LatestBlock = Literal["latest"]
PendingBlock = Literal["pending"]
BlockIdentifier = Union[BlockNumber, LatestBlock, PendingBlock]
OptionalBlockIdentifier = Optional[BlockIdentifier]
TBlockInfo = TypeVar("TBlockInfo", bound="StarknetBlock")

LATEST_BLOCK_ID: LatestBlock = "latest"
PENDING_BLOCK_ID: PendingBlock = "pending"


def transaction_specific_info_from_internal(
    internal_tx: InternalTransaction,
) -> TransactionSpecificInfo:
    """
    Returns a TransactionSpecificInfo object from an InternalTransaction object.
    Used for backward compatibility.
    """
    if isinstance(internal_tx, DeprecatedInternalTransaction):
        return DeprecatedTransactionSpecificInfo.from_internal(internal_tx=internal_tx)
    else:
        return AccountTransactionSpecificInfo.from_internal(internal_tx=internal_tx)


class ResponseCallType(Enum):
    CALL = 0
    DELEGATE = auto()


class BlockStatus(Enum):
    # A pending block; i.e., a block that is yet to be closed.
    PENDING = 0
    # An aborted block (failed in the L2 pipeline).
    ABORTED = auto()
    # A reverted block (rejected on L1).
    REVERTED = auto()
    # A block that was created on L2, in contrast to PENDING, which is not yet closed.
    ACCEPTED_ON_L2 = auto()
    # A block accepted on L1.
    ACCEPTED_ON_L1 = auto()


class FinalityStatus(Enum):
    # The transaction has not been received yet (i.e., not written to storage).
    NOT_RECEIVED = 0
    # The transaction was received by the sequencer.
    RECEIVED = auto()
    # The transaction passed validation and entered a pending or a finalized block.
    ACCEPTED_ON_L2 = auto()
    # The transaction was accepted on-chain.
    ACCEPTED_ON_L1 = auto()

    def __ge__(self, other: object) -> bool:
        if not isinstance(other, FinalityStatus):
            return NotImplemented

        return self.value >= other.value

    def __lt__(self, other: object) -> bool:
        return not self >= other

    @property
    def was_executed(self) -> bool:
        """
        Returns True if a transaction with this finality status is in a pending / finalized block.
        """
        return self >= FinalityStatus.ACCEPTED_ON_L2

    @classmethod
    def from_block_status(cls, block_status: BlockStatus) -> "FinalityStatus":
        """
        Returns the finality status of a transaction in a block with the given block status.
        """

        if block_status is BlockStatus.PENDING:
            # Finality status does not distinguish between pending and finalized blocks -
            # A pending block will eventually be finalized, so the transaction is considered
            # accepted on L2.
            return FinalityStatus.ACCEPTED_ON_L2
        elif block_status in (BlockStatus.ACCEPTED_ON_L2, BlockStatus.ACCEPTED_ON_L1):
            return FinalityStatus[block_status.name]
        elif block_status in (BlockStatus.REVERTED, BlockStatus.ABORTED):
            # The transaction passed Batcher validations, but the block containing it failed on
            # L1 or L2. Hence, it is yet again waiting to be inserted to a new block.
            return FinalityStatus.RECEIVED

        raise NotImplementedError(f"Handling block status {block_status.name} is not implemented.")


class ExecutionStatus(Enum):
    # The transaction failed validation and thus was skipped.
    REJECTED = 0
    # The transaction passed validation but failed execution, and will be (or was) included in
    # a block (nonce will be incremented and an execution fee will be charged).
    REVERTED = auto()
    # The transaction passed validation and its execution is valid.
    SUCCEEDED = auto()


class TransactionStatus(Enum):
    """
    This class is DEPRECATED and will be removed.
    It is replaced by ExecutionStatus & FinalityStatus.
    """

    # The transaction has not been received yet (i.e., not written to storage).
    NOT_RECEIVED = 0
    # The transaction was received by the sequencer.
    RECEIVED = auto()
    # The transaction failed validation and thus was skipped (applies both to a pending and a
    # finalized block).
    REJECTED = auto()
    # The transaction passed validation but failed execution, and will be (or was) included in
    # a block (nonce will be incremented and an execution fee will be charged).
    # This status does not distinguish between accepted on L2 / accepted on L1 blocks.
    REVERTED = auto()
    # The transaction passed validation and entered a pending or a finalized block.
    ACCEPTED_ON_L2 = auto()
    # The transaction was accepted on-chain.
    ACCEPTED_ON_L1 = auto()

    @property
    def was_executed(self) -> bool:
        """
        Returns whether a transaction with that status has been executed successfully.
        """
        return self in (
            TransactionStatus.ACCEPTED_ON_L2,
            TransactionStatus.ACCEPTED_ON_L1,
        )

    @classmethod
    def from_block_status(cls, block_status: BlockStatus) -> "TransactionStatus":
        """
        Returns a transaction status according to the status of a block containing it.
        """

        if block_status is BlockStatus.PENDING:
            # We do not distinguish between a pending and a finalized block in transaction status.
            # A pending block will eventually be closed, so the transaction is considered
            # accepted on L2.
            return TransactionStatus.ACCEPTED_ON_L2
        elif block_status in (BlockStatus.ACCEPTED_ON_L2, BlockStatus.ACCEPTED_ON_L1):
            # The statuses above are identical for a block and a transaction.
            return TransactionStatus[block_status.name]
        elif block_status in (BlockStatus.REVERTED, BlockStatus.ABORTED):
            # The transaction passed Batcher validations, but the block containing it failed on
            # L1 or L2. Hence, it is yet again waiting to be inserted to a new block.
            return TransactionStatus.RECEIVED

        raise NotImplementedError(f"Handling block status {block_status.name} is not implemented.")

    def __ge__(self, other: object) -> bool:
        if not isinstance(other, TransactionStatus):
            return NotImplemented

        self_not_comparable, other_not_comparable = (
            status not in tx_status_order_relation.keys() for status in (self, other)
        )
        if self_not_comparable or other_not_comparable:
            raise NotImplementedError(
                f"Comparison is not supported between status {self.name} and {other.name}."
            )

        return tx_status_order_relation[self] >= tx_status_order_relation[other]

    def __lt__(self, other: object) -> bool:
        return not self >= other

    @classmethod
    def from_new_status(
        cls, finality_status: FinalityStatus, execution_status: Optional[ExecutionStatus]
    ) -> "TransactionStatus":
        """
        Returns the DEPRECATED status which matches the given finality and execution
        statuses.
        """
        if execution_status in (None, ExecutionStatus.SUCCEEDED):
            return cls[finality_status.name]

        assert execution_status in (
            ExecutionStatus.REVERTED,
            ExecutionStatus.REJECTED,
        ), f"Unrecognized execution status {as_non_optional(execution_status).name}."
        return cls[execution_status.name]


# Dictionary that represents the TransactionStatus valid flows.
# [NOT_RECEIVED] -> [RECEIVED] -> [PENDING] -> [ACCEPTED_ON_L2] -> [ACCEPTED_ON_L1].
# REJECTED is excluded from the relation since the status of a REJECTED transaction will not
# become ACCEPTED_ON_L2.
tx_status_order_relation: Dict[TransactionStatus, int] = {
    TransactionStatus.NOT_RECEIVED: 0,
    TransactionStatus.RECEIVED: 1,
    TransactionStatus.ACCEPTED_ON_L2: 2,
    TransactionStatus.ACCEPTED_ON_L1: 3,
}


@marshmallow_dataclass.dataclass(frozen=True)
class TransactionInBlockInfo(ValidatedResponseObject):
    """
    Represents the information regarding a StarkNet transaction that appears in a block.
    """

    # The reason for the transaction revert, if applicable.
    revert_error: Optional[str] = field(metadata=nonrequired_optional_metadata)
    # Execution status of the transaction.
    execution_status: Optional[ExecutionStatus] = field(metadata=nonrequired_optional_metadata)
    # Finality of the transaction.
    finality_status: FinalityStatus
    # The status of the transaction.
    # This field is DEPRECATED and will be removed.
    status: TransactionStatus

    # The reason for the transaction failure, if applicable.
    transaction_failure_reason: Optional[TransactionFailureReason]
    # The unique identifier of the block on the active chain containing the transaction.
    block_hash: Optional[int] = field(metadata=fields.optional_block_hash_metadata)
    # The sequence number of the block corresponding to block_hash, which is the number of blocks
    # prior to it in the active chain.
    block_number: Optional[int] = field(metadata=fields.default_optional_block_number_metadata)
    # The index of the transaction within the block corresponding to block_hash.
    transaction_index: Optional[int] = field(
        metadata=fields.default_optional_transaction_index_metadata
    )

    def __post_init__(self):
        super().__post_init__()

        # Assert the DEPRECATED status matches execution status and finality status.
        execution_status_mismatch_msg = (
            f"DEPRECATED status {self.status} doesn't match "
            f"execution status {self.execution_status}."
        )
        if self.status in (TransactionStatus.REVERTED, TransactionStatus.REJECTED):
            assert (
                self.status.name == as_non_optional(self.execution_status).name
            ), execution_status_mismatch_msg
        else:
            assert self.execution_status not in (
                ExecutionStatus.REVERTED,
                ExecutionStatus.REJECTED,
            ), execution_status_mismatch_msg
            assert self.status.name == as_non_optional(self.finality_status).name, (
                f"DEPRECATED status {self.status} doesn't match finality status "
                f"{self.finality_status}."
            )

        # Verify fields match for NOT_RECEIVED/RECEIVED finality status.
        if self.finality_status in (
            FinalityStatus.NOT_RECEIVED,
            FinalityStatus.RECEIVED,
        ):
            assert all(
                field is None
                for field in (
                    self.block_hash,
                    self.block_number,
                    self.transaction_index,
                    self.revert_error,
                )
            ), (
                f"For a transaction with finality status: {self.finality_status}, the following "
                f"fields must be None, but are instead: "
                f"{self.block_hash=}, {self.block_number=}, {self.transaction_index=}, "
                f"{self.revert_error=}."
            )
            if self.execution_status is ExecutionStatus.REJECTED:
                assert (
                    self.transaction_failure_reason is not None
                ), "Rejected transactions must have a failure reason."
                assert self.finality_status is FinalityStatus.RECEIVED, (
                    f"The finality status of a rejected transaction should always be RECEIVED. "
                    f"Instead it's {self.finality_status}."
                )
            else:
                assert (self.execution_status is None) and (
                    self.transaction_failure_reason is None
                ), f"For a non-reverted transaction with finality status: {self.finality_status}, "
                f"the following fields must be None, but are instead: "
                f"{self.execution_status=}, {self.transaction_failure_reason=}."

            return

        # At this point finality status should be ACCEPTED_ON_L2/L1.
        # The following section verifies all fields match for the above cases.
        assert self.finality_status.was_executed

        assert self.execution_status in (ExecutionStatus.REVERTED, ExecutionStatus.SUCCEEDED), (
            f"Accepted (on either L1 or L2) transactions' execution status must be SUCCEEDED or "
            f"REVERTED. instead it's {self.execution_status}."
        )

        assert (
            self.transaction_failure_reason is None
        ), "Only rejected transactions should have a failure reason."

        # Assert execution status is REVERTED if, and only if, revert error is not None.
        assert (self.execution_status is ExecutionStatus.REVERTED) == (
            self.revert_error is not None
        ), "A transaction must contain revert information if and only if it is reverted."

        assert (self.block_number is not None) and (self.transaction_index is not None), (
            f"Block number and transaction index in block must appear in Accepted (on either L1 or "
            f"L2) transactions. Actual values: {self.block_number=}, {self.transaction_index=}."
        )

        # ACCEPTED_ON_L2 transactions may be in a non finalized block. In this case the block hash
        # is not known yet and will be None.
        if self.finality_status is FinalityStatus.ACCEPTED_ON_L1:
            assert (
                self.block_hash is not None
            ), "Transactions accepted on L1 must have a block hash."


@marshmallow_dataclass.dataclass(frozen=True)
class TransactionInfo(TransactionInBlockInfo):
    """
    Represents the information regarding a StarkNet transaction.
    """

    transaction: Optional[TransactionSpecificInfo] = field(
        metadata=additional_metadata(
            marshmallow_field=mfields.Nested(TransactionSpecificInfoSchema),
            required=False,
            load_default=None,
        )
    )

    @classmethod
    def create(
        cls,
        finality_status: FinalityStatus,
        execution_status: Optional[ExecutionStatus] = None,
        revert_error: Optional[str] = None,
        transaction: Optional[InternalTransaction] = None,
        transaction_failure_reason: Optional[TransactionFailureReason] = None,
        block_hash: Optional[int] = None,
        block_number: Optional[int] = None,
        transaction_index: Optional[int] = None,
    ) -> "TransactionInfo":
        return cls(
            revert_error=revert_error,
            execution_status=execution_status,
            finality_status=finality_status,
            transaction=None
            if transaction is None
            else transaction_specific_info_from_internal(internal_tx=transaction),
            status=TransactionStatus.from_new_status(
                finality_status=finality_status, execution_status=execution_status
            ),
            transaction_failure_reason=transaction_failure_reason,
            block_hash=block_hash,
            block_number=block_number,
            transaction_index=transaction_index,
        )

    def __post_init__(self):
        super().__post_init__()

        if self.transaction is None:
            assert (
                self.finality_status is FinalityStatus.NOT_RECEIVED
            ), "A received transaction must be included in TransactionInfo object."


@dataclasses.dataclass(frozen=True)
class L1ToL2Message(ValidatedResponseObject):
    """
    Represents a StarkNet L1-to-L2 message.
    """

    from_address: str = field(
        metadata=everest_fields.EthAddressField.metadata(field_name="from_address")
    )
    to_address: int = field(metadata=fields.L2AddressField.metadata(field_name="to_address"))
    selector: int = field(metadata=fields.entry_point_selector_metadata)
    payload: List[int] = field(metadata=everest_fields.felt_as_hex_list_metadata)
    nonce: Optional[int] = field(metadata=fields.optional_nonce_metadata)


@dataclasses.dataclass(frozen=True)
class L2ToL1Message(ValidatedResponseObject):
    """
    Represents a StarkNet L2-to-L1 message.
    """

    from_address: int = field(metadata=fields.L2AddressField.metadata(field_name="from_address"))
    to_address: str = field(
        metadata=everest_fields.EthAddressField.metadata(field_name="to_address")
    )
    payload: List[int] = field(metadata=everest_fields.felt_as_hex_list_metadata)


@marshmallow_dataclass.dataclass
class ReceiptExecutionResources(ValidatedResponseObject):
    """
    Contains the execution resources a transaction uses, e.g., the number of Cairo
    steps and the data availability gas usage.
    """

    n_steps: int
    builtin_instance_counter: Dict[str, int]
    n_memory_holes: int = field(
        metadata=additional_metadata(marshmallow_field=mfields.Integer(load_default=0))
    )
    # The amount of l1_gas or l1_data_gas charged for data availability.
    # Optional for backwards compatibility.
    data_availability: Optional[GasVector]

    @classmethod
    def create(
        cls, execution_resources: ExecutionResources, da_gas: Optional[GasVector]
    ) -> "ReceiptExecutionResources":
        return cls(
            n_steps=execution_resources.n_steps,
            builtin_instance_counter=execution_resources.builtin_instance_counter,
            n_memory_holes=0,
            data_availability=da_gas,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class TransactionExecution(ValidatedResponseObject):
    """
    Represents a receipt of an executed transaction.
    """

    # The reason for the transaction revert, if applicable.
    revert_error: Optional[str] = field(metadata=nonrequired_optional_metadata)
    # Execution status of the transaction.
    execution_status: Optional[ExecutionStatus] = field(metadata=nonrequired_optional_metadata)

    # The index of the transaction within the block.
    transaction_index: Optional[int] = field(
        metadata=fields.default_optional_transaction_index_metadata
    )
    # A unique identifier of the transaction.
    transaction_hash: int = field(metadata=fields.transaction_hash_metadata)
    # L1-to-L2 messages.
    l1_to_l2_consumed_message: Optional[L1ToL2Message]
    # L2-to-L1 messages.
    l2_to_l1_messages: List[L2ToL1Message]
    # Events emitted during the execution of the transaction.
    events: List[Event]
    # The resources needed by the transaction.
    execution_resources: Optional[ReceiptExecutionResources]
    # The actual fee that was charged in Wei.
    actual_fee: Optional[int] = field(metadata=fields.optional_fee_metadata)

    @property
    def has_execution_info(self) -> bool:
        """
        Returns whether the transaction has execution info.
        """
        return (
            self.l1_to_l2_consumed_message is not None
            or self.execution_resources is not None
            or len(self.l2_to_l1_messages) > 0
            or len(self.events) > 0
            or self.actual_fee is not None
        )

    def __post_init__(self):
        super().__post_init__()
        assert (self.execution_status is ExecutionStatus.REVERTED) == (
            self.revert_error is not None
        ), (
            f"A transaction must have a revert error if and only if it is reverted. Actual values: "
            f"{self.execution_status=}, {self.revert_error=}."
        )

        if self.execution_status is ExecutionStatus.REJECTED and self.has_execution_info:
            raise AssertionError("A rejected transaction cannot have execution info.")


@marshmallow_dataclass.dataclass(frozen=True)
class TransactionReceipt(TransactionExecution, TransactionInBlockInfo):
    """
    Represents a receipt of a StarkNet transaction;
    i.e., the information regarding its execution and the block it appears in.
    """

    @classmethod
    def from_tx_info(
        cls,
        transaction_hash: int,
        tx_info: TransactionInBlockInfo,
        actual_fee: Optional[int],
        l1_to_l2_consumed_message: Optional[L1ToL2Message] = None,
        l2_to_l1_messages: Optional[List[L2ToL1Message]] = None,
        events: Optional[List[Event]] = None,
        execution_resources: Optional[ReceiptExecutionResources] = None,
    ) -> "TransactionReceipt":
        return cls(
            revert_error=tx_info.revert_error,
            execution_status=tx_info.execution_status,
            finality_status=tx_info.finality_status,
            l1_to_l2_consumed_message=l1_to_l2_consumed_message,
            l2_to_l1_messages=[] if l2_to_l1_messages is None else l2_to_l1_messages,
            events=[] if events is None else events,
            execution_resources=execution_resources,
            actual_fee=actual_fee,
            transaction_hash=transaction_hash,
            status=tx_info.status,
            transaction_failure_reason=tx_info.transaction_failure_reason,
            block_hash=tx_info.block_hash,
            block_number=tx_info.block_number,
            transaction_index=tx_info.transaction_index,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class StorageEntry(ValidatedResponseObject):
    """
    Represents a value stored in a single contract storage entry.
    """

    key: int = field(metadata=everest_fields.felt_metadata(name_in_error_message="key"))
    value: int = field(metadata=everest_fields.felt_metadata(name_in_error_message="value"))


@marshmallow_dataclass.dataclass(frozen=True)
class ContractAddressHashPair(ValidatedResponseObject):
    """
    Represents a newly deployed contract in a block state update.
    """

    address: int = field(metadata=fields.L2AddressField.metadata(field_name="address"))
    class_hash: int = field(metadata=fields.ClassHashIntField.metadata())

    @marshmallow.decorators.pre_load
    def replace_contract_hash_with_class_hash(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, Any]:
        """
        Renames the variable "contract_hash" to "class_hash" and casts its type from
        bytes-hex to int-hex.
        """
        if "class_hash" not in data:
            assert "contract_hash" in data
            data["class_hash"] = data.pop("contract_hash")

        assert isinstance(data["class_hash"], str)
        if not data["class_hash"].startswith("0x"):
            data["class_hash"] = hex(int(data["class_hash"], 16))

        return data


@dataclasses.dataclass(frozen=True)
class ClassHashPair(ValidatedResponseObject):
    """
    Represents a newly declared contract in a block state update.
    """

    class_hash: int = field(metadata=fields.ClassHashIntField.metadata())
    compiled_class_hash: int = field(metadata=fields.CompiledClassHashField.metadata())


@marshmallow_dataclass.dataclass(frozen=True)
class StateDiff(ValidatedResponseObject):
    """
    Represents the difference in the StarkNet state induced by applying a block's transactions.
    """

    storage_diffs: Dict[int, List[StorageEntry]] = field(
        metadata=additional_metadata(
            marshmallow_field=mfields.Dict(
                keys=fields.L2AddressField.get_marshmallow_field(),
                values=mfields.List(mfields.Nested(StorageEntry.Schema)),
            )
        )
    )

    nonces: Dict[int, int] = field(metadata=fields.address_to_nonce_metadata)
    deployed_contracts: List[ContractAddressHashPair]
    old_declared_contracts: Tuple[int, ...] = field(metadata=fields.declared_contracts_metadata)
    declared_classes: List[ClassHashPair] = field(metadata=nonrequired_list_metadata)
    replaced_classes: List[ContractAddressHashPair] = field(metadata=nonrequired_list_metadata)

    @marshmallow.decorators.pre_load
    def replace_declared_contracts_with_old_declared_contracts(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, Any]:
        """
        Renames the variable "declared_contracts" to "old_declared_contracts".
        """
        if "declared_contracts" in data:
            assert "old_declared_contracts" not in data
            data["old_declared_contracts"] = data.pop("declared_contracts")

        return data


@marshmallow_dataclass.dataclass(frozen=True)
class BlockStateUpdate(ValidatedResponseObject):
    """
    Represents a response block state update.
    """

    block_hash: Optional[int] = field(metadata=fields.optional_block_hash_metadata)
    new_root: Optional[int] = field(
        metadata=fields.backward_compatible_optional_state_root_metadata
    )
    old_root: int = field(metadata=fields.backward_compatible_state_root_metadata)
    state_diff: StateDiff

    def __post_init__(self):
        super().__post_init__()
        assert (self.block_hash is None) == (
            self.new_root is None
        ), "new_root must appear in state update for any block other than pending block."


@dataclasses.dataclass(frozen=True)
class OrderedL2ToL1MessageResponse(ValidatedDataclass):
    """
    See datails in OrderedL2ToL1Message's documentation.
    """

    order: int = field(metadata=sequential_id_metadata("L2-to-L1 message order"))
    to_address: str = field(
        metadata=everest_fields.EthAddressField.metadata(field_name="to_address")
    )
    payload: List[int] = field(metadata=everest_fields.felt_as_hex_list_metadata)

    @classmethod
    def from_internal(
        cls, messages: List[OrderedL2ToL1Message]
    ) -> List["OrderedL2ToL1MessageResponse"]:
        return [
            cls(
                order=message.order,
                to_address=Web3.to_checksum_address(  # type: ignore
                    to_bytes(message.to_address, 20)
                ),
                payload=message.payload,
            )
            for message in messages
        ]


@dataclasses.dataclass(frozen=True)
class OrderedEventResponse(ValidatedDataclass):
    """
    See datails in OrderedEvent's documentation.
    """

    order: int = field(metadata=sequential_id_metadata("Event order"))
    keys: List[int] = field(metadata=everest_fields.felt_as_hex_list_metadata)
    data: List[int] = field(metadata=everest_fields.felt_as_hex_list_metadata)

    @classmethod
    def from_internal(cls, events: List[OrderedEvent]) -> List["OrderedEventResponse"]:
        return [cls(order=event.order, keys=event.keys, data=event.data) for event in events]


# NOTE: This dataclass isn't validated due to a forward-declaration issue.
@marshmallow_dataclass.dataclass(frozen=True)
class FunctionInvocation(BaseResponseObject, SerializableMarshmallowDataclass):
    """
    A lean version of CallInfo class, containing merely the information relevant for the user.
    """

    # Static info.
    caller_address: int = field(
        metadata=fields.L2AddressField.metadata(field_name="caller_address")
    )
    contract_address: int = field(metadata=fields.contract_address_metadata)
    calldata: List[int] = field(metadata=fields.calldata_as_hex_metadata)
    call_type: Optional[ResponseCallType] = field(metadata=nonrequired_optional_metadata)
    class_hash: Optional[int] = field(metadata=fields.optional_new_class_hash_metadata)
    selector: Optional[int] = field(metadata=fields.optional_entry_point_selector_metadata)
    entry_point_type: Optional[EntryPointType]

    # Execution info.
    result: List[int] = field(metadata=fields.retdata_as_hex_metadata)
    execution_resources: ExecutionResources
    internal_calls: List["FunctionInvocation"] = field(
        metadata=additional_metadata(
            marshmallow_field=mfields.List(mfields.Nested(lambda: FunctionInvocation.Schema()))
        )
    )
    events: List[OrderedEventResponse]
    messages: List[OrderedL2ToL1MessageResponse]

    @classmethod
    def from_inner(cls, call_type: CallType) -> ResponseCallType:
        if call_type is CallType.Call:
            return ResponseCallType.CALL
        elif call_type is CallType.Delegate:
            return ResponseCallType.DELEGATE
        else:
            raise NotImplementedError(f"Unsupported call type {call_type}.")

    @classmethod
    def from_internal(cls, call_info: CallInfo) -> "FunctionInvocation":
        return cls(
            caller_address=call_info.caller_address,
            call_type=(
                None
                if call_info.call_type is None
                else cls.from_inner(call_type=call_info.call_type)
            ),
            contract_address=call_info.contract_address,
            class_hash=call_info.class_hash,
            selector=call_info.entry_point_selector,
            entry_point_type=call_info.entry_point_type,
            calldata=call_info.calldata,
            result=call_info.retdata,
            execution_resources=call_info.execution_resources,
            internal_calls=[
                cls.from_internal(call_info=internal_call)
                for internal_call in call_info.internal_calls
            ],
            events=OrderedEventResponse.from_internal(events=call_info.events),
            messages=OrderedL2ToL1MessageResponse.from_internal(
                messages=call_info.l2_to_l1_messages
            ),
        )

    @classmethod
    def from_optional_internal(
        cls, call_info: Optional[CallInfo]
    ) -> Optional["FunctionInvocation"]:
        return None if call_info is None else cls.from_internal(call_info=call_info)


@marshmallow_dataclass.dataclass(frozen=True)
class TransactionTrace(ValidatedResponseObject):
    """
    Represents the trace of a StarkNet transaction execution,
    including internal calls.
    """

    # The reason for the transaction revert, if applicable.
    revert_error: Optional[str] = field(metadata=nonrequired_optional_metadata)
    # Objects describe invocation of validation, fee transfer, and a specific function.
    validate_invocation: Optional[FunctionInvocation]
    function_invocation: Optional[FunctionInvocation]
    fee_transfer_invocation: Optional[FunctionInvocation]
    signature: List[int] = field(metadata=fields.deprecated_signature_metadata)

    def __post_init__(self):
        super().__post_init__()
        if self.revert_error is not None:
            assert (
                self.function_invocation is None
            ), "Reverted transactions only execute validation and fee transfer."


@marshmallow_dataclass.dataclass(frozen=True)
class BlockSingleTransactionTrace(TransactionTrace):
    """
    An object describing the trace and the transaction hash of a single transaction in the block.
    """

    transaction_hash: int = field(metadata=fields.transaction_hash_metadata)


@marshmallow_dataclass.dataclass(frozen=True)
class BlockTransactionTraces(ValidatedResponseObject):
    """
    Represents the execution traces of all transactions included in a block.
    """

    traces: Tuple[BlockSingleTransactionTrace, ...] = field(
        metadata=additional_metadata(
            marshmallow_field=VariadicLengthTupleField(
                mfields.Nested(BlockSingleTransactionTrace.Schema)
            )
        )
    )


@marshmallow_dataclass.dataclass(frozen=True)
class BlockHeader(ValidatedResponseObject):
    block_hash: int = field(metadata=fields.block_hash_metadata)
    block_number: int = field(metadata=fields.block_number_metadata)


@marshmallow_dataclass.dataclass(frozen=True)
class StarknetBlock(ValidatedResponseObject):
    """
    Represents a response StarkNet block.
    """

    block_hash: Optional[int] = field(metadata=fields.optional_block_hash_metadata)
    parent_block_hash: int = field(metadata=fields.block_hash_metadata)
    block_number: Optional[int] = field(metadata=fields.default_optional_block_number_metadata)
    state_root: Optional[int] = field(
        metadata=fields.backward_compatible_optional_state_root_metadata
    )
    transaction_commitment: Optional[int] = field(metadata=fields.optional_commitment_metadata)
    event_commitment: Optional[int] = field(metadata=fields.optional_commitment_metadata)
    status: Optional[BlockStatus]
    l1_da_mode: L1DaMode = field(metadata=fields.l1_da_mode_enum_metadata)
    l1_gas_price: ResourcePrice
    l1_data_gas_price: ResourcePrice
    transactions: Tuple[TransactionSpecificInfo, ...] = field(
        metadata=additional_metadata(
            marshmallow_field=VariadicLengthTupleField(
                mfields.Nested(TransactionSpecificInfoSchema)
            )
        )
    )
    timestamp: int = field(metadata=fields.timestamp_metadata)
    sequencer_address: Optional[int] = field(metadata=fields.optional_sequencer_address_metadata)
    transaction_receipts: Optional[Tuple[TransactionExecution, ...]] = field(
        metadata=additional_metadata(
            marshmallow_field=VariadicLengthTupleField(
                mfields.Nested(TransactionExecution.Schema), allow_none=True
            )
        )
    )
    starknet_version: Optional[str] = field(metadata=fields.starknet_version_metadata)

    @pre_load
    def rename_old_gas_price_fields(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, List[str]]:
        return rename_old_gas_price_fields(data=data)

    @classmethod
    def create(
        cls: Type[TBlockInfo],
        block_hash: Optional[int],
        transaction_commitment: Optional[int],
        event_commitment: Optional[int],
        parent_block_hash: int,
        block_number: Optional[int],
        state_root: Optional[int],
        transactions: Iterable[InternalTransaction],
        timestamp: int,
        sequencer_address: Optional[int],
        status: Optional[BlockStatus],
        l1_da_mode: L1DaMode,
        gas_prices: GasPrices,
        transaction_receipts: Optional[Tuple[TransactionExecution, ...]],
        starknet_version: Optional[str],
    ) -> TBlockInfo:
        return cls(
            block_hash=block_hash,
            transaction_commitment=transaction_commitment,
            event_commitment=event_commitment,
            parent_block_hash=parent_block_hash,
            block_number=block_number,
            state_root=state_root,
            transactions=tuple(
                transaction_specific_info_from_internal(internal_tx=tx) for tx in transactions
            ),
            timestamp=timestamp,
            sequencer_address=sequencer_address,
            status=status,
            l1_da_mode=l1_da_mode,
            l1_gas_price=ResourcePrice(
                price_in_wei=gas_prices.l1_gas_price_wei, price_in_fri=gas_prices.l1_gas_price_fri
            ),
            l1_data_gas_price=ResourcePrice(
                price_in_wei=gas_prices.l1_data_gas_price_wei,
                price_in_fri=gas_prices.l1_data_gas_price_fri,
            ),
            transaction_receipts=transaction_receipts,
            starknet_version=starknet_version,
        )

    def __post_init__(self):
        super().__post_init__()

        if self.status in (BlockStatus.ABORTED, BlockStatus.REVERTED):
            assert (
                self.transaction_receipts is None
            ), "Aborted and reverted blocks must not have transaction receipts."

            return

        # Validate PENDING status matches missing created block fields.
        created_block_fields = (self.block_hash, self.block_number, self.state_root)
        if self.status is BlockStatus.PENDING:
            assert all(
                field is None for field in created_block_fields
            ), "Block hash, block number, state_root must not appear in a pending block."
        else:
            assert all(
                field is not None for field in created_block_fields
            ), "Block hash, block number, state_root must appear in a created block."

    @marshmallow.pre_load
    def fill_missing_execution_statuses(self, data: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        if data.get("transaction_receipts", None) is None:
            return data

        have_execution_status = [
            "execution_status" in tx_receipt for tx_receipt in data["transaction_receipts"]
        ]
        if all(have_execution_status):
            return data

        assert not any(
            have_execution_status
        ), "Either all transaction receipts should have execution statuses, or none should."
        for tx_receipt in data["transaction_receipts"]:
            tx_receipt["execution_status"] = ExecutionStatus.SUCCEEDED.name

        return data


@dataclasses.dataclass(frozen=True)
class BlockSignatureInput(ValidatedResponseObject):
    block_hash: int = field(metadata=fields.block_hash_metadata)
    state_diff_commitment: int = field(metadata=fields.state_diff_commitment_metadata)


@marshmallow_dataclass.dataclass(frozen=True)
class BlockSignature(ValidatedResponseObject):
    """
    Contains the signature of a block.
    """

    block_number: int = field(metadata=fields.block_number_metadata)
    signature: ECSignature = field(metadata=fields.ec_signature_metadata)
    signature_input: BlockSignatureInput


@marshmallow_dataclass.dataclass(frozen=True)
class FeeEstimationInfo(ValidatedResponseObject):
    """
    Represents the fee estimation information.
    """

    overall_fee: int
    gas_price: int
    gas_usage: int
    unit: str = "wei"


@marshmallow_dataclass.dataclass(frozen=True)
class TransactionSimulationInfo(ValidatedResponseObject):
    """
    Represents the information regarding a StarkNet transaction's simulation.
    """

    trace: TransactionTrace
    fee_estimation: FeeEstimationInfo


@marshmallow_dataclass.dataclass(frozen=True)
class StarknetBlockAndStateUpdate(ValidatedResponseObject):
    """
    Contains both StarknetBlock and BlockStateUpdate objects, corresponding to a certain block.
    """

    block: StarknetBlock
    state_update: BlockStateUpdate
