import dataclasses
from abc import ABC, abstractmethod
from typing import List, Optional

from starkware.starknet.business_logic.execution.deprecated_objects import ExecutionResourcesManager
from starkware.starknet.business_logic.execution.objects import (
    CallInfo,
    CallType,
    TransactionExecutionContext,
)
from starkware.starknet.business_logic.state.state_api import SyncState
from starkware.starknet.definitions.general_config import StarknetGeneralConfig
from starkware.starknet.services.api.contract_class.contract_class import EntryPointType
from starkware.starkware_utils.validated_dataclass import ValidatedDataclass


# Mypy has a problem with dataclasses that contain unimplemented abstract methods.
# See https://github.com/python/mypy/issues/5374 for details on this problem.
@dataclasses.dataclass(frozen=True)  # type: ignore[misc]
class ExecuteEntryPointBase(ABC, ValidatedDataclass):
    """
    Represents a StarkNet contract call. This interface is meant to prevent a cyclic dependency
    with the `BusinessLogicSyscallHandler`.
    """

    # For fields that are shared with the internal invoke transaction, see documentation there.
    call_type: CallType
    contract_address: int
    # The address that holds the code to execute.
    # It may differ from contract_address in the case of delegate call.
    code_address: Optional[int]
    class_hash: Optional[int]
    entry_point_selector: int
    entry_point_type: EntryPointType
    calldata: List[int]
    # The caller contract address.
    caller_address: int
    # The amount of gas allocated to this execution on initiation.
    initial_gas: int

    @abstractmethod
    def execute(
        self,
        state: SyncState,
        resources_manager: ExecutionResourcesManager,
        tx_execution_context: TransactionExecutionContext,
        general_config: StarknetGeneralConfig,
        support_reverted: bool = False,
    ) -> CallInfo:
        """
        Executes the entry point.
        """
