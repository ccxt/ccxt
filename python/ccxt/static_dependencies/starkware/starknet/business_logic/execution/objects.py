import dataclasses
import functools
import logging
import operator
from dataclasses import field
from enum import Enum, auto
from typing import FrozenSet, Iterable, Iterator, List, Mapping, Optional, Set, Union, cast

import marshmallow.fields as mfields
import marshmallow_dataclass

from services.everest.business_logic.transaction_execution_objects import (
    EverestTransactionExecutionInfo,
    TransactionFailureReason,
)
from services.everest.definitions import fields as everest_fields
from starkware.cairo.lang.vm.cairo_pie import ExecutionResources
from starkware.cairo.lang.vm.relocatable import MaybeRelocatable
from starkware.cairo.lang.vm.utils import RunResources
from starkware.python.utils import as_non_optional
from starkware.starknet.business_logic.fact_state.contract_state_objects import StateSelector
from starkware.starknet.business_logic.state.state import StorageEntry
from starkware.starknet.definitions import constants, fields
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.definitions.execution_mode import ExecutionMode
from starkware.starknet.definitions.transaction_type import TransactionType
from starkware.starknet.public.abi import CONSTRUCTOR_ENTRY_POINT_SELECTOR
from starkware.starknet.services.api.contract_class.contract_class import EntryPointType
from starkware.starknet.services.api.gateway.deprecated_transaction import (
    DEFAULT_DECLARE_SENDER_ADDRESS,
)
from starkware.starkware_utils.error_handling import stark_assert
from starkware.starkware_utils.field_validators import validate_non_negative
from starkware.starkware_utils.marshmallow_dataclass_fields import (
    SetField,
    additional_metadata,
    nonrequired_optional_metadata,
)
from starkware.starkware_utils.marshmallow_fields_metadata import sequential_id_metadata
from starkware.starkware_utils.serializable_dataclass import SerializableMarshmallowDataclass
from starkware.starkware_utils.validated_dataclass import (
    ValidatedDataclass,
    ValidatedMarshmallowDataclass,
)

logger = logging.getLogger(__name__)
ResourcesMapping = Mapping[str, int]
RawTransactionExecutionInfo = bytes
RawTransactionExecutionResult = Union[TransactionFailureReason, RawTransactionExecutionInfo]
TransactionExecutionResult = Union[TransactionFailureReason, "TransactionExecutionInfo"]


class CallType(Enum):
    Call = 0
    Delegate = auto()


@dataclasses.dataclass
class TransactionExecutionContext(ValidatedDataclass):
    """
    A context for transaction execution, which is shared between internal calls.
    """

    # The account contract from which this transaction originates.
    account_contract_address: int = field(
        metadata=fields.AddressField.metadata(field_name="account_contract_address")
    )
    # The hash of the transaction.
    transaction_hash: int = field(metadata=fields.transaction_hash_metadata)
    # The signature of the transaction.
    signature: List[int] = field(metadata=fields.signature_metadata)
    # The maximal fee to be paid in Wei for the execution.
    max_fee: int = field(metadata=fields.fee_metadata)
    # The nonce of the transaction.
    nonce: int
    version: int = field(metadata=fields.tx_version_metadata)
    run_resources: RunResources
    # Used for tracking global events order.
    n_emitted_events: int = field(metadata=sequential_id_metadata("Number of emitted events"))
    # Used for tracking global L2-to-L1 messages order.
    n_sent_messages: int = field(metadata=sequential_id_metadata("Number of messages sent to L1"))
    # The execution mode for the appropriate part of the execution.
    execution_mode: ExecutionMode = field(metadata=fields.execution_mode_metadata)

    @classmethod
    def create(
        cls,
        account_contract_address: int,
        transaction_hash: int,
        signature: List[int],
        max_fee: int,
        nonce: Optional[int],
        n_steps: int,
        version: int,
        execution_mode: ExecutionMode,
    ) -> "TransactionExecutionContext":
        nonce = 0 if version in [0, constants.QUERY_VERSION_BASE] else as_non_optional(nonce)
        return cls(
            account_contract_address=account_contract_address,
            transaction_hash=transaction_hash,
            signature=signature,
            max_fee=max_fee,
            nonce=nonce,
            version=version,
            run_resources=RunResources(n_steps=n_steps),
            n_emitted_events=0,
            n_sent_messages=0,
            execution_mode=execution_mode,
        )

    @classmethod
    def create_for_testing(
        cls,
        account_contract_address: int = 0,
        max_fee: int = 0,
        nonce: int = 0,
        n_steps: int = 100000,
        version: int = constants.DEPRECATED_TRANSACTION_VERSION,
        execution_mode=ExecutionMode.EXECUTE,
    ) -> "TransactionExecutionContext":
        return cls(
            account_contract_address=account_contract_address,
            transaction_hash=0,
            signature=[],
            max_fee=max_fee,
            nonce=nonce,
            version=version,
            run_resources=RunResources(n_steps=n_steps),
            n_emitted_events=0,
            n_sent_messages=0,
            execution_mode=execution_mode,
        )


@dataclasses.dataclass(frozen=True)
class EventContent(ValidatedDataclass):
    # The keys by which the event will be indexed.
    keys: List[int] = field(metadata=everest_fields.felt_as_hex_list_metadata)
    # The data of the event.
    data: List[int] = field(metadata=everest_fields.felt_as_hex_list_metadata)


@dataclasses.dataclass(frozen=True)
class OrderedEvent(ValidatedDataclass):
    """
    Contains the raw content of an event, without the context its origin
    (emitting contract, etc.) along with its order in the transaction execution.
    """

    order: int = field(metadata=sequential_id_metadata("Event order"))
    event: EventContent

    @classmethod
    def create(cls, order: int, keys: List[int], data: List[int]) -> "OrderedEvent":
        return cls(order=order, event=EventContent(keys=keys, data=data))

    @property
    def keys(self) -> List[int]:
        return self.event.keys

    @property
    def data(self) -> List[int]:
        return self.event.data


@dataclasses.dataclass(frozen=True)
class Event(ValidatedDataclass):
    """
    Represents a StarkNet event; contains all the fields that will be included in the
    block hash.
    """

    # Emitting contract address.
    from_address: int = field(metadata=fields.L2AddressField.metadata(field_name="from_address"))
    # The keys by which the event will be indexed.
    keys: List[int] = field(metadata=everest_fields.felt_as_hex_list_metadata)
    # The data of the event.
    data: List[int] = field(metadata=everest_fields.felt_as_hex_list_metadata)

    @classmethod
    def create(cls, event_content: "OrderedEvent", emitting_contract_address: int) -> "Event":
        return cls(
            from_address=emitting_contract_address,
            keys=event_content.keys,
            data=event_content.data,
        )


@dataclasses.dataclass(frozen=True)
class MessageToL1(ValidatedDataclass):
    to_address: int = field(metadata=fields.felt_metadata)
    payload: List[int] = field(metadata=everest_fields.felt_as_hex_list_metadata)


@dataclasses.dataclass(frozen=True)
class OrderedL2ToL1Message(ValidatedDataclass):
    """
    A class containing the raw content of a L2-to-L1 message, without the context its origin
    (the sending contract, etc.) along with its order in the transaction execution.
    """

    order: int = field(metadata=sequential_id_metadata("L2-to-L1 message order"))
    message: MessageToL1

    @classmethod
    def create(cls, order: int, to_address: int, payload: List[int]) -> "OrderedL2ToL1Message":
        return cls(order=order, message=MessageToL1(to_address=to_address, payload=payload))

    @property
    def to_address(self) -> int:
        return self.message.to_address

    @property
    def payload(self) -> List[int]:
        return self.message.payload


@dataclasses.dataclass(frozen=True)
class L2ToL1MessageInfo(ValidatedDataclass):
    """
    Represents a StarkNet L2-to-L1 message.
    """

    from_address: int = field(metadata=fields.L2AddressField.metadata(field_name="from_address"))
    to_address: int = field(
        metadata=everest_fields.EthAddressIntField.metadata(field_name="to_address")
    )
    payload: List[int] = field(metadata=fields.felt_as_hex_or_str_list_metadata)

    @classmethod
    def create(
        cls, message_content: "OrderedL2ToL1Message", sending_contract_address: int
    ) -> "L2ToL1MessageInfo":
        return cls(
            from_address=sending_contract_address,
            to_address=message_content.to_address,
            payload=message_content.payload,
        )


@dataclasses.dataclass(frozen=True)
class CallResult(ValidatedDataclass):
    """
    Contains the return values of a contract call.
    """

    gas_consumed: int
    # The result selector corresponds to the Rust panic result:
    #   0 if the syscall succeeded; a non-zero otherwise.
    failure_flag: int
    retdata: List[int]

    @classmethod
    def create(
        cls,
        initial_gas: int,
        updated_gas: MaybeRelocatable,
        failure_flag: MaybeRelocatable,
        retdata: List[MaybeRelocatable],
    ) -> "CallResult":
        stark_assert(
            all(isinstance(value, int) for value in retdata),
            code=StarknetErrorCode.INVALID_RETURN_DATA,
            message="Return data expected to be non-relocatable.",
        )
        stark_assert(
            failure_flag in (0, 1),
            code=StarknetErrorCode.INVALID_RETURN_DATA,
            message="failure_flag field expected to be either 0 or 1.",
        )
        updated_gas = cast(int, updated_gas)
        stark_assert(
            isinstance(updated_gas, int) and 0 <= updated_gas <= initial_gas,
            code=StarknetErrorCode.INVALID_RETURN_DATA,
            message=f"Unexpected remaining gas: {updated_gas}.",
        )

        return cls(
            gas_consumed=initial_gas - updated_gas,
            failure_flag=cast(int, failure_flag),
            retdata=cast(List[int], retdata),
        )

    @property
    def succeeded(self) -> bool:
        return self.failure_flag == 0


@dataclasses.dataclass(frozen=True)
class CallEntryPoint(ValidatedDataclass):
    """
    Represents a call to an entry point.
    """

    # Holds the hash of the executed class; in the case of a library call, it may differ from the
    # class hash of the called contract state.
    class_hash: Optional[int] = field(metadata=fields.optional_new_class_hash_metadata)
    entry_point_type: Optional[EntryPointType] = field(metadata=nonrequired_optional_metadata)
    entry_point_selector: Optional[int] = field(
        metadata=fields.optional_entry_point_selector_metadata
    )
    calldata: List[int] = field(metadata=everest_fields.felt_as_hex_list_metadata)
    storage_address: int = field(metadata=fields.felt_metadata)
    caller_address: int = field(metadata=fields.felt_metadata)
    # We can assume that the initial gas is less than 2^64.
    initial_gas: int

    # Deprecated fields.
    # The address that holds the executed code; relevant just for delegate calls (version 1), where
    # it may differ from the code of the to_address contract.
    code_address: Optional[int] = field(metadata=fields.optional_l2_address_metadata)
    call_type: Optional[CallType] = field(metadata=nonrequired_optional_metadata)


@dataclasses.dataclass(frozen=True)
class CallExecution(ValidatedDataclass):
    retdata: List[int] = field(metadata=fields.felt_as_hex_or_str_list_metadata)
    # Note that the order starts from a transaction-global offset.
    events: List[OrderedEvent]
    l2_to_l1_messages: List[OrderedL2ToL1Message]
    failed: bool
    gas_consumed: int


# NOTE: This dataclass isn't validated due to a forward-declaration issue.
@marshmallow_dataclass.dataclass(frozen=True)
class CallInfo(SerializableMarshmallowDataclass):
    """
    Represents a contract call, either internal or external.
    Holds the information needed for the execution of the represented contract call by the OS.
    No need for validations here, as the fields are taken from validated objects.
    """

    call: CallEntryPoint
    execution: CallExecution
    resources: ExecutionResources

    # Internal calls made by this call.
    inner_calls: List["CallInfo"] = field(
        metadata=additional_metadata(
            marshmallow_field=mfields.List(mfields.Nested(lambda: CallInfo.Schema()))
        )
    )

    # Information kept for the StarkNet OS run in the GpsAmbassador.

    # A list of values read from storage by this call, **excluding** readings from nested calls.
    storage_read_values: List[int] = field(metadata=fields.felt_as_hex_or_str_list_metadata)
    # A set of storage keys accessed by this call, **excluding** keys from nested calls;
    # kept in order to calculate and prepare the commitment tree facts before the StarkNet OS run.
    accessed_storage_keys: Set[int] = field(
        metadata=additional_metadata(
            marshmallow_field=SetField(
                everest_fields.felt_metadata("storage_accessed_address")["marshmallow_field"]
            )
        )
    )

    @classmethod
    def create(
        cls,
        caller_address: int,
        call_type: Optional[CallType],
        contract_address: int,
        class_hash: Optional[int],
        entry_point_selector: Optional[int],
        entry_point_type: Optional[EntryPointType],
        calldata: List[int],
        gas_consumed: int,
        failure_flag: int,
        retdata: List[int],
        execution_resources: ExecutionResources,
        events: List[OrderedEvent],
        l2_to_l1_messages: List[OrderedL2ToL1Message],
        storage_read_values: List[int],
        accessed_storage_keys: Set[int],
        internal_calls: List["CallInfo"],
        code_address: Optional[int],
    ) -> "CallInfo":
        call = CallEntryPoint(
            caller_address=caller_address,
            call_type=call_type,
            storage_address=contract_address,
            class_hash=class_hash,
            code_address=code_address,
            entry_point_type=entry_point_type,
            entry_point_selector=entry_point_selector,
            calldata=calldata,
            initial_gas=0,
        )
        execution = CallExecution(
            retdata=retdata,
            events=events,
            l2_to_l1_messages=l2_to_l1_messages,
            failed=failure_flag != 0,
            gas_consumed=gas_consumed,
        )

        return cls(
            call=call,
            execution=execution,
            resources=execution_resources,
            storage_read_values=storage_read_values,
            accessed_storage_keys=accessed_storage_keys,
            inner_calls=internal_calls,
        )

    # CallEntryPoint fields.

    @property
    def class_hash(self) -> Optional[int]:
        return self.call.class_hash

    @property
    def entry_point_type(self) -> Optional[EntryPointType]:
        return self.call.entry_point_type

    @property
    def entry_point_selector(self) -> Optional[int]:
        return self.call.entry_point_selector

    @property
    def calldata(self) -> List[int]:
        return self.call.calldata

    @property
    def contract_address(self) -> int:
        return self.call.storage_address

    @property
    def caller_address(self) -> int:
        return self.call.caller_address

    @property
    def code_address(self) -> Optional[int]:
        return self.call.code_address

    @property
    def call_type(self) -> Optional[CallType]:
        return self.call.call_type

    # CallExecution fields.

    @property
    def retdata(self) -> List[int]:
        return self.execution.retdata

    @property
    def events(self) -> List[OrderedEvent]:
        return self.execution.events

    @property
    def l2_to_l1_messages(self) -> List[OrderedL2ToL1Message]:
        return self.execution.l2_to_l1_messages

    @property
    def failure_flag(self) -> int:
        return self.execution.failed

    @property
    def gas_consumed(self) -> int:
        return self.execution.gas_consumed

    # Remaining fields.

    @property
    def execution_resources(self) -> ExecutionResources:
        return self.resources

    @property
    def internal_calls(self) -> List["CallInfo"]:
        return self.inner_calls

    def result(self) -> CallResult:
        return CallResult(
            gas_consumed=self.gas_consumed,
            failure_flag=self.failure_flag,
            retdata=self.retdata,
        )

    def get_visited_storage_entries(self) -> Set[StorageEntry]:
        storage_entries = {(self.contract_address, key) for key in self.accessed_storage_keys}
        internal_visited_storage_entries = CallInfo.get_visited_storage_entries_of_many(
            call_infos=self.inner_calls
        )
        return storage_entries | internal_visited_storage_entries

    def get_state_selector(self) -> StateSelector:
        code_address = self.contract_address if self.code_address is None else self.code_address
        assert self.class_hash is not None, "Class hash is missing from call info."
        selector = StateSelector.create(
            contract_addresses={self.contract_address, code_address}
            - {DEFAULT_DECLARE_SENDER_ADDRESS},
            class_hashes=[self.class_hash],
        )

        return selector | CallInfo.get_state_selector_of_many(call_infos=self.internal_calls)

    @staticmethod
    def get_visited_storage_entries_of_many(call_infos: Iterable["CallInfo"]) -> Set[StorageEntry]:
        return functools.reduce(
            operator.__or__,
            (call_info.get_visited_storage_entries() for call_info in call_infos),
            set(),
        )

    @staticmethod
    def get_state_selector_of_many(call_infos: Iterable["CallInfo"]) -> StateSelector:
        return functools.reduce(
            operator.__or__,
            (call_info.get_state_selector() for call_info in call_infos),
            StateSelector.empty(),
        )

    def gen_call_topology(self) -> Iterator["CallInfo"]:
        """
        Yields the contract calls in DFS (preorder).
        """
        yield self
        for call in self.internal_calls:
            yield from call.gen_call_topology()

    @classmethod
    def empty(
        cls,
        contract_address: int,
        caller_address: int,
        class_hash: Optional[int],
        call_type: Optional[CallType] = None,
        entry_point_type: Optional[EntryPointType] = None,
        entry_point_selector: Optional[int] = None,
    ) -> "CallInfo":
        return cls.create(
            caller_address=caller_address,
            call_type=call_type,
            contract_address=contract_address,
            class_hash=class_hash,
            entry_point_selector=entry_point_selector,
            entry_point_type=entry_point_type,
            calldata=[],
            gas_consumed=0,
            failure_flag=0,
            retdata=[],
            execution_resources=ExecutionResources.empty(),
            events=[],
            l2_to_l1_messages=[],
            storage_read_values=[],
            accessed_storage_keys=set(),
            internal_calls=[],
            code_address=None,
        )

    @classmethod
    def empty_for_testing(cls) -> "CallInfo":
        return cls.empty(contract_address=1, caller_address=0, class_hash=None)

    @classmethod
    def empty_constructor_call(
        cls, contract_address: int, caller_address: int, class_hash: int
    ) -> "CallInfo":
        return cls.empty(
            contract_address=contract_address,
            caller_address=caller_address,
            class_hash=class_hash,
            call_type=CallType.Call,
            entry_point_type=EntryPointType.CONSTRUCTOR,
            entry_point_selector=CONSTRUCTOR_ENTRY_POINT_SELECTOR,
        )

    def get_sorted_events(self) -> List[Event]:
        """
        Returns a list of StarkNet Event objects collected during the execution, sorted by the order
        in which they were emitted.
        """
        n_events = sum(len(call.events) for call in self.gen_call_topology())
        starknet_events: List[Optional[Event]] = [None] * n_events

        for call in self.gen_call_topology():
            for ordered_event_content in call.events:
                # Convert OrderedEvent -> Event. I.e., add emitting contract address
                # and remove the order.
                starknet_events[ordered_event_content.order] = Event.create(
                    emitting_contract_address=call.contract_address,
                    event_content=ordered_event_content,
                )

        assert all(
            starknet_event is not None for starknet_event in starknet_events
        ), "Unexpected holes in the event order."

        return cast(List[Event], starknet_events)

    def get_sorted_l2_to_l1_messages(self) -> List[L2ToL1MessageInfo]:
        """
        Returns a list of StarkNet L2ToL1MessageInfo objects collected during the execution, sorted
        by the order in which they were sent.
        """
        n_messages = sum(len(call.l2_to_l1_messages) for call in self.gen_call_topology())
        starknet_l2_to_l1_messages: List[Optional[L2ToL1MessageInfo]] = [None] * n_messages

        for call in self.gen_call_topology():
            for ordered_message_content in call.l2_to_l1_messages:
                # Convert OrderedL2ToL1Message -> L2ToL1MessageInfo. I.e., add sending
                # contract address and remove the order.
                starknet_l2_to_l1_messages[
                    ordered_message_content.order
                ] = L2ToL1MessageInfo.create(
                    sending_contract_address=call.contract_address,
                    message_content=ordered_message_content,
                )

        assert all(
            message is not None for message in starknet_l2_to_l1_messages
        ), "Unexpected holes in the L2-to-L1 message order."

        return cast(List[L2ToL1MessageInfo], starknet_l2_to_l1_messages)


@marshmallow_dataclass.dataclass(frozen=True)
class GasVector(ValidatedMarshmallowDataclass):
    l1_gas: int = field(
        metadata=additional_metadata(
            marshmallow_field=mfields.Integer(
                strict=True, validate=validate_non_negative("l1_gas")
            ),
            description="L1 gas amount",
        ),
    )
    l1_data_gas: int = field(
        metadata=additional_metadata(
            marshmallow_field=mfields.Integer(
                strict=True, validate=validate_non_negative("l1_data_gas")
            ),
            description="Blob gas amount",
        ),
    )

    @classmethod
    def empty(cls) -> "GasVector":
        return cls(l1_gas=0, l1_data_gas=0)


@marshmallow_dataclass.dataclass(frozen=True)
class TransactionExecutionInfo(EverestTransactionExecutionInfo):
    """
    Contains the information gathered by the execution of a transaction. Main usages:
    1. Supplies hints for the OS run on the corresponding transaction; e.g., internal call results.
    2. Stores useful information for users; e.g., L2-to-L1 messages and emitted events.
    """

    # Transaction-specific validation call info.
    validate_call_info: Optional[CallInfo]
    # Transaction-specific execution call info, `None` for declare transaction.
    execute_call_info: Optional[CallInfo]
    # Fee transfer call info, executed by the BE for account contract transactions (e.g., declare
    # and invoke).
    fee_transfer_call_info: Optional[CallInfo]
    # The actual fee that was charged in Wei.
    actual_fee: int = field(metadata=fields.FeeField.metadata(field_name="actual_fee"))
    # Actual resources the transaction is charged for, including L1 gas
    # and OS additional resources estimation.
    actual_resources: ResourcesMapping = field(metadata=fields.name_to_resources_metadata)
    # Transaction type is used to determine the order of the calls.
    tx_type: Optional[TransactionType]

    # The reason for the transaction revert, if applicable.
    revert_error: Optional[str] = field(metadata=fields.revert_error_metadata)
    # Contains the gas cost of data availability (from version 0.13.1).
    da_gas: Optional[GasVector]

    def __post_init__(self):
        super().__post_init__()
        if self.is_reverted:
            assert (
                self.execute_call_info is None
            ), "Reverted transactions only execute validation and fee transfer."

    @classmethod
    def create(
        cls,
        validate_info: Optional[CallInfo],
        call_info: Optional[CallInfo],
        fee_transfer_info: Optional[CallInfo],
        actual_fee: int,
        actual_resources: ResourcesMapping,
        tx_type: Optional[TransactionType],
        revert_error: Optional[str],
        da_gas: Optional[GasVector],
    ) -> "TransactionExecutionInfo":
        return cls(
            validate_call_info=validate_info,
            execute_call_info=call_info,
            fee_transfer_call_info=fee_transfer_info,
            actual_fee=actual_fee,
            actual_resources=actual_resources,
            tx_type=tx_type,
            revert_error=revert_error,
            da_gas=da_gas,
        )

    @property
    def validate_info(self) -> Optional[CallInfo]:
        return self.validate_call_info

    @property
    def call_info(self) -> Optional[CallInfo]:
        return self.execute_call_info

    @property
    def fee_transfer_info(self) -> Optional[CallInfo]:
        return self.fee_transfer_call_info

    @property
    def is_reverted(self) -> bool:
        return self.revert_error is not None

    @property
    def non_optional_calls(self) -> Iterable[CallInfo]:
        if self.tx_type is TransactionType.DEPLOY_ACCOUNT:
            # In deploy account tx, validation will take place after execution of the constructor.
            ordered_optional_calls = (
                self.execute_call_info,
                self.validate_call_info,
                self.fee_transfer_call_info,
            )
        else:
            ordered_optional_calls = (
                self.validate_call_info,
                self.execute_call_info,
                self.fee_transfer_call_info,
            )
        return tuple(call for call in ordered_optional_calls if call is not None)

    def get_state_selector(self) -> StateSelector:
        return CallInfo.get_state_selector_of_many(call_infos=self.non_optional_calls)

    def get_executed_class_hashes(self) -> FrozenSet[int]:
        return self.get_state_selector().class_hashes

    def get_visited_storage_entries(self) -> Set[StorageEntry]:
        return CallInfo.get_visited_storage_entries_of_many(call_infos=self.non_optional_calls)

    @classmethod
    def from_call_infos(
        cls,
        execute_call_info: Optional[CallInfo],
        tx_type: Optional[TransactionType],
        validate_info: Optional[CallInfo] = None,
        fee_transfer_info: Optional[CallInfo] = None,
        revert_error: Optional[str] = None,
    ) -> "TransactionExecutionInfo":
        return cls.create(
            validate_info=validate_info,
            call_info=execute_call_info,
            fee_transfer_info=fee_transfer_info,
            actual_fee=0,
            actual_resources={},
            tx_type=tx_type,
            revert_error=revert_error,
            da_gas=GasVector.empty(),
        )

    @classmethod
    def empty(cls) -> "TransactionExecutionInfo":
        return cls.create(
            validate_info=None,
            call_info=None,
            fee_transfer_info=None,
            actual_fee=0,
            actual_resources={},
            tx_type=None,
            revert_error=None,
            da_gas=GasVector.empty(),
        )

    @classmethod
    def create_concurrent_stage_execution_info(
        cls,
        validate_info: Optional[CallInfo],
        call_info: Optional[CallInfo],
        actual_resources: ResourcesMapping,
        tx_type: TransactionType,
        revert_error: Optional[str],
        da_gas: Optional[GasVector] = None,
    ) -> "TransactionExecutionInfo":
        """
        Returns TransactionExecutionInfo for the concurrent stage (without
        fee_transfer_info and without fee).
        """
        return cls.create(
            validate_info=validate_info,
            call_info=call_info,
            fee_transfer_info=None,
            actual_fee=0,
            actual_resources=actual_resources,
            tx_type=tx_type,
            revert_error=revert_error,
            da_gas=da_gas,
        )

    @classmethod
    def from_concurrent_stage_execution_info(
        cls,
        concurrent_execution_info: "TransactionExecutionInfo",
        actual_fee: int,
        fee_transfer_info: Optional[CallInfo],
    ) -> "TransactionExecutionInfo":
        """
        Fills the given concurrent_execution_info with actual_fee and fee_transfer_info.
        Used when the call infos (except for the fee handling) executed in the concurrent stage.
        """
        return cls.create(
            validate_info=concurrent_execution_info.validate_call_info,
            call_info=concurrent_execution_info.execute_call_info,
            fee_transfer_info=fee_transfer_info,
            actual_fee=actual_fee,
            actual_resources=concurrent_execution_info.actual_resources,
            tx_type=concurrent_execution_info.tx_type,
            revert_error=concurrent_execution_info.revert_error,
            da_gas=concurrent_execution_info.da_gas,
        )

    def gen_call_iterator(self) -> Iterator[CallInfo]:
        """
        Yields the contract calls in the order that they are going to be executed in the OS.
        (Preorder of the original call tree followed by the preorder of the call tree that was
        generated while charging the fee).
        """
        for call_info in self.non_optional_calls:
            yield from call_info.gen_call_topology()

    @staticmethod
    def get_state_selector_of_many(
        execution_infos: Iterable["TransactionExecutionInfo"],
    ) -> StateSelector:
        return functools.reduce(
            operator.__or__,
            (execution_info.get_state_selector() for execution_info in execution_infos),
            StateSelector.empty(),
        )

    @staticmethod
    def get_visited_storage_entries_of_many(
        execution_infos: Iterable["TransactionExecutionInfo"],
    ) -> Set[StorageEntry]:
        return functools.reduce(
            operator.__or__,
            (execution_info.get_visited_storage_entries() for execution_info in execution_infos),
            set(),
        )

    def get_sorted_events(self) -> List[Event]:
        return [
            event
            for call_info in self.non_optional_calls
            for event in call_info.get_sorted_events()
        ]

    def get_sorted_l2_to_l1_messages(self) -> List[L2ToL1MessageInfo]:
        return [
            message
            for call_info in self.non_optional_calls
            for message in call_info.get_sorted_l2_to_l1_messages()
        ]
