import dataclasses
from typing import Any, List

from starkware.starknet.business_logic.execution.objects import CallInfo, Event, L2ToL1MessageInfo
from starkware.starknet.services.api.feeder_gateway.response_objects import FunctionInvocation
from starkware.starkware_utils.validated_dataclass import ValidatedDataclass

Dataclass = Any


@dataclasses.dataclass(frozen=True)
class StarknetCallInfo(ValidatedDataclass):
    """
    A lean version of CallInfo class, containing merely the information relevant
    for the user.
    """

    result: tuple
    call_info: FunctionInvocation
    # High-level events emitted by the main call through an @event decorated function.
    main_call_events: List[Dataclass]
    # All low-level events (emitted through emit_event syscall, including those corresponding to
    # high-level ones).
    raw_events: List[Event]
    l2_to_l1_messages: List[L2ToL1MessageInfo]

    @classmethod
    def from_internal(
        cls,
        call_info: CallInfo,
        result: tuple,
        main_call_events: List[Dataclass],
    ) -> "StarknetCallInfo":
        return cls(
            result=result,
            main_call_events=main_call_events,
            raw_events=call_info.get_sorted_events(),
            l2_to_l1_messages=call_info.get_sorted_l2_to_l1_messages(),
            call_info=FunctionInvocation.from_internal(call_info=call_info),
        )
