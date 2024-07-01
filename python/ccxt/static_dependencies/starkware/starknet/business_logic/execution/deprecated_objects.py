import dataclasses
import functools
import operator
from dataclasses import field
from enum import Enum, auto
from typing import Dict, Iterable, Iterator, List, Optional, Set, cast

import marshmallow.fields as mfields
import marshmallow_dataclass

from services.everest.business_logic.transaction_execution_objects import (
    EverestTransactionExecutionInfo,
)
from services.everest.definitions import fields as everest_fields
from starkware.cairo.lang.vm.cairo_pie import ExecutionResources
from starkware.starknet.business_logic.execution.objects import (
    CallInfo,
    CallType,
    Event,
    L2ToL1MessageInfo,
    OrderedEvent,
    OrderedL2ToL1Message,
    ResourcesMapping,
    TransactionExecutionInfo,
)
from starkware.starknet.business_logic.fact_state.contract_state_objects import StateSelector
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.transaction_type import TransactionType
from starkware.starknet.services.api.contract_class.contract_class import EntryPointType
from starkware.starkware_utils.marshmallow_dataclass_fields import (
    SetField,
    additional_metadata,
    nonrequired_list_metadata,
    nonrequired_optional_metadata,
)
from starkware.starkware_utils.marshmallow_fields_metadata import sequential_id_metadata
from starkware.starkware_utils.serializable_dataclass import SerializableMarshmallowDataclass
from starkware.starkware_utils.validated_dataclass import (
    ValidatedDataclass,
    ValidatedMarshmallowDataclass,
)

# These classes represents the deprecated transaction execution information. Please refer to the
# above non-deprecated classes for up-to-date functionality and documentation.
# Thess classes are retained for backward compatibility and reading old databases only.


class DeprecatedCallType(Enum):
    CALL = 0
    DELEGATE = auto()

    def to_non_deprecated(self) -> CallType:
        if self is DeprecatedCallType.CALL:
            return CallType.Call
        elif self is DeprecatedCallType.DELEGATE:
            return CallType.Delegate
        else:
            raise NotImplementedError(f"Unsupported call type: {self}.")


@dataclasses.dataclass(frozen=True)
class DeprecatedOrderedEvent(ValidatedDataclass):
    order: int = field(metadata=sequential_id_metadata("Event order"))
    keys: List[int] = field(metadata=fields.felt_as_hex_or_str_list_metadata)
    data: List[int] = field(metadata=fields.felt_as_hex_or_str_list_metadata)

    def to_non_deprecated(self) -> OrderedEvent:
        return OrderedEvent.create(order=self.order, keys=self.keys, data=self.data)


@dataclasses.dataclass(frozen=True)
class DeprecatedOrderedL2ToL1Message(ValidatedDataclass):
    order: int = field(metadata=sequential_id_metadata("L2-to-L1 message order"))
    to_address: int = field(
        metadata=everest_fields.EthAddressIntField.metadata(field_name="to_address")
    )
    payload: List[int] = field(metadata=fields.felt_as_hex_or_str_list_metadata)

    def to_non_deprecated(self) -> OrderedL2ToL1Message:
        return OrderedL2ToL1Message.create(
            order=self.order, to_address=self.to_address, payload=self.payload
        )


# NOTE: This dataclass isn't validated due to a forward-declaration issue.
@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedCallInfo(SerializableMarshmallowDataclass):
    caller_address: int
    call_type: Optional[DeprecatedCallType] = field(metadata=nonrequired_optional_metadata)
    contract_address: int
    class_hash: Optional[int] = field(metadata=fields.optional_new_class_hash_metadata)
    entry_point_selector: Optional[int]
    entry_point_type: Optional[EntryPointType]
    calldata: List[int]
    gas_consumed: int = field(metadata=fields.gas_consumed_metadata)
    failure_flag: int = field(metadata=fields.failure_flag_metadata)
    retdata: List[int]

    execution_resources: ExecutionResources
    events: List[DeprecatedOrderedEvent]
    l2_to_l1_messages: List[DeprecatedOrderedL2ToL1Message]

    storage_read_values: List[int]
    accessed_storage_keys: Set[int] = field(
        metadata=additional_metadata(
            marshmallow_field=SetField(
                everest_fields.felt_metadata("storage_accessed_address")["marshmallow_field"]
            )
        )
    )

    internal_calls: List["DeprecatedCallInfo"] = field(
        metadata=additional_metadata(
            marshmallow_field=mfields.List(mfields.Nested(lambda: DeprecatedCallInfo.Schema()))
        )
    )

    code_address: Optional[int]

    @classmethod
    def create(
        cls,
        caller_address: int,
        call_type: Optional[DeprecatedCallType],
        contract_address: int,
        class_hash: Optional[int],
        entry_point_selector: Optional[int],
        entry_point_type: Optional[EntryPointType],
        calldata: List[int],
        gas_consumed: int,
        failure_flag: int,
        retdata: List[int],
        execution_resources: ExecutionResources,
        events: List[DeprecatedOrderedEvent],
        l2_to_l1_messages: List[DeprecatedOrderedL2ToL1Message],
        storage_read_values: List[int],
        accessed_storage_keys: Set[int],
        internal_calls: List["DeprecatedCallInfo"],
        code_address: Optional[int],
    ) -> "DeprecatedCallInfo":
        return cls(
            caller_address=caller_address,
            call_type=call_type,
            contract_address=contract_address,
            class_hash=class_hash,
            entry_point_selector=entry_point_selector,
            entry_point_type=entry_point_type,
            calldata=calldata,
            gas_consumed=gas_consumed,
            failure_flag=failure_flag,
            retdata=retdata,
            execution_resources=execution_resources,
            events=events,
            l2_to_l1_messages=l2_to_l1_messages,
            storage_read_values=storage_read_values,
            accessed_storage_keys=accessed_storage_keys,
            internal_calls=internal_calls,
            code_address=code_address,
        )

    def to_non_deprecated(self) -> CallInfo:
        call_type = None if self.call_type is None else self.call_type.to_non_deprecated()
        return CallInfo.create(
            caller_address=self.caller_address,
            call_type=call_type,
            contract_address=self.contract_address,
            class_hash=self.class_hash,
            entry_point_selector=self.entry_point_selector,
            entry_point_type=self.entry_point_type,
            calldata=self.calldata,
            gas_consumed=self.gas_consumed,
            failure_flag=self.failure_flag,
            retdata=self.retdata,
            execution_resources=self.execution_resources,
            events=[event.to_non_deprecated() for event in self.events],
            l2_to_l1_messages=[message.to_non_deprecated() for message in self.l2_to_l1_messages],
            storage_read_values=self.storage_read_values,
            accessed_storage_keys=self.accessed_storage_keys,
            internal_calls=[
                internal_call.to_non_deprecated() for internal_call in self.internal_calls
            ],
            code_address=self.code_address,
        )

    @classmethod
    def empty(
        cls,
        contract_address: int,
        caller_address: int,
        class_hash: Optional[int],
        call_type: Optional[DeprecatedCallType] = None,
        entry_point_type: Optional[EntryPointType] = None,
        entry_point_selector: Optional[int] = None,
    ) -> "DeprecatedCallInfo":
        vm_resources = ExecutionResources(n_steps=0, builtin_instance_counter={}, n_memory_holes=0)
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
            execution_resources=vm_resources,
            events=[],
            l2_to_l1_messages=[],
            storage_read_values=[],
            accessed_storage_keys=set(),
            internal_calls=[],
            code_address=None,
        )

    def gen_call_topology(self) -> Iterator["DeprecatedCallInfo"]:
        """
        Yields the contract calls in DFS (preorder).
        """
        yield self
        for call in self.internal_calls:
            yield from call.gen_call_topology()


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedTransactionExecutionInfo(EverestTransactionExecutionInfo):
    validate_info: Optional[DeprecatedCallInfo]
    call_info: Optional[DeprecatedCallInfo]
    fee_transfer_info: Optional[DeprecatedCallInfo]
    actual_fee: int = field(metadata=fields.FeeField.metadata(field_name="actual_fee"))
    actual_resources: ResourcesMapping = field(metadata=fields.name_to_resources_metadata)
    tx_type: Optional[TransactionType]

    revert_error: Optional[str] = field(metadata=fields.revert_error_metadata)

    def to_non_deprecated(self) -> TransactionExecutionInfo:
        validate_info, call_info, fee_transfer_info = map(
            lambda info: None if info is None else info.to_non_deprecated(),
            (self.validate_info, self.call_info, self.fee_transfer_info),
        )
        return TransactionExecutionInfo.create(
            validate_info=validate_info,
            call_info=call_info,
            fee_transfer_info=fee_transfer_info,
            actual_fee=self.actual_fee,
            actual_resources=self.actual_resources,
            tx_type=self.tx_type,
            revert_error=self.revert_error,
            da_gas=None,
        )

    @property
    def non_optional_calls(self) -> Iterable[DeprecatedCallInfo]:
        if self.tx_type is TransactionType.DEPLOY_ACCOUNT:
            # In deploy account tx, validation will take place after execution of the constructor.
            ordered_optional_calls = (
                self.call_info,
                self.validate_info,
                self.fee_transfer_info,
            )
        else:
            ordered_optional_calls = (
                self.validate_info,
                self.call_info,
                self.fee_transfer_info,
            )
        return tuple(call for call in ordered_optional_calls if call is not None)


@dataclasses.dataclass(frozen=True)
class ContractCallResponse(ValidatedDataclass):
    """
    Contains the information needed by the OS to guess the response of a contract call.
    """

    retdata: List[int]


@marshmallow_dataclass.dataclass(frozen=True)
class ContractCall(ValidatedMarshmallowDataclass):
    """
    Represents a contract call, either internal or external.
    Holds the information needed for the execution of the represented contract call by the OS.
    No need for validations here, as the fields are taken from validated objects.
    """

    # Static info.

    from_address: int  # Should be zero if the call represents the parent transaction itself.
    to_address: int  # The called contract address.
    # The address that holds the executed code; relevant just for delegate calls, where it may
    # differ from the code of the to_address contract.
    code_address: Optional[int] = field(metadata=fields.optional_l2_address_metadata)
    entry_point_selector: Optional[int] = field(metadata=nonrequired_optional_metadata)
    entry_point_type: Optional[EntryPointType] = field(metadata=nonrequired_optional_metadata)
    calldata: List[int]
    signature: List[int]

    # Execution info.

    cairo_usage: ExecutionResources
    # Note that the order starts from a transaction-global offset.
    events: List[OrderedEvent] = field(metadata=nonrequired_list_metadata)
    l2_to_l1_messages: List[L2ToL1MessageInfo] = field(metadata=nonrequired_list_metadata)

    # Information kept for the StarkNet OS run in the GpsAmbassador.

    # The response of the direct internal calls invoked by this call; kept in the order
    # the OS "guesses" them.
    internal_call_responses: List[ContractCallResponse]
    # A list of values read from storage by this call, **excluding** readings from nested calls.
    storage_read_values: List[int]
    # A set of storage addresses accessed by this call, **excluding** addresses from nested calls;
    # kept in order to calculate and prepare the commitment tree facts before the StarkNet OS run.
    storage_accessed_addresses: Set[int] = field(
        metadata=additional_metadata(
            marshmallow_field=SetField(
                everest_fields.felt_metadata("storage_accessed_address")["marshmallow_field"]
            )
        )
    )

    @classmethod
    def empty(cls, to_address: int) -> "ContractCall":
        return cls(
            from_address=0,
            to_address=to_address,
            code_address=None,
            entry_point_type=None,
            entry_point_selector=None,
            calldata=[],
            signature=[],
            cairo_usage=ExecutionResources.empty(),
            events=[],
            l2_to_l1_messages=[],
            internal_call_responses=[],
            storage_read_values=[],
            storage_accessed_addresses=set(),
        )

    @property
    def state_selector(self) -> StateSelector:
        code_address = self.to_address if self.code_address is None else self.code_address
        return StateSelector.create(
            contract_addresses=[self.to_address, code_address], class_hashes=[]
        )


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedOldTransactionExecutionInfo(EverestTransactionExecutionInfo):
    """
    Contains the information gathered by the execution of a transation. Main uses:
    1. Supplies hints for the OS run on the corresponding transaction; e.g., internal call results.
    2. Stores useful information for users; e.g., L2-to-L1 messages it sent and emitted events.
    """

    l2_to_l1_messages: List[L2ToL1MessageInfo]
    # The retdata of the main transaction.
    retdata: List[int]
    call_info: ContractCall
    # The internal contract calls; arranged in DFS order, which is the order they are invoked by the
    # OS.
    internal_calls: List[ContractCall]

    @classmethod
    def create(
        cls,
        call_info: ContractCall,
        internal_calls: Optional[List[ContractCall]] = None,
    ) -> "DeprecatedOldTransactionExecutionInfo":
        return cls(
            l2_to_l1_messages=[],
            retdata=[],
            call_info=call_info,
            internal_calls=[] if internal_calls is None else internal_calls,
        )

    @property
    def contract_calls(self) -> List[ContractCall]:
        return [self.call_info, *self.internal_calls]

    def get_state_selector(self) -> StateSelector:
        return functools.reduce(
            operator.__or__,
            (contract_call.state_selector for contract_call in self.contract_calls),
            StateSelector.empty(),
        )

    def get_sorted_events(self) -> List[Event]:
        """
        Returns a list of StarkNet Event objects collected during the execution, sorted by the order
        in which they were emitted.
        """
        n_events = sum(len(contract_call.events) for contract_call in self.contract_calls)
        starknet_events: List[Optional[Event]] = [None] * n_events

        for contract_call in self.contract_calls:
            for ordered_event_content in contract_call.events:
                # Convert OrderedEvent -> Event. I.e., add emitting contract address
                # and remove the order.
                starknet_events[ordered_event_content.order] = Event.create(
                    emitting_contract_address=contract_call.to_address,
                    event_content=ordered_event_content,
                )

        assert all(
            starknet_event is not None for starknet_event in starknet_events
        ), "Unexpected holes in the event order."

        return cast(List[Event], starknet_events)

    @staticmethod
    def get_state_selector_of_many(
        execution_infos: List["DeprecatedOldTransactionExecutionInfo"],
    ) -> StateSelector:
        return functools.reduce(
            operator.__or__,
            (execution_info.get_state_selector() for execution_info in execution_infos),
            StateSelector.empty(),
        )


class ExecutionResourcesManager:
    """
    Aggregates execution resources throughout transaction stream processing.
    """

    def __init__(self, cairo_usage: ExecutionResources, syscall_counter: Dict[str, int]):
        # The accumulated Cairo usage.
        self.cairo_usage = cairo_usage

        # A mapping from system call to the cumulative times it was invoked.
        self.syscall_counter = syscall_counter

    # Alternative constructors.

    @classmethod
    def empty(cls) -> "ExecutionResourcesManager":
        return cls(
            cairo_usage=ExecutionResources.empty(),
            syscall_counter={},
        )
