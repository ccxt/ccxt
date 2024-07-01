import asyncio
import functools
import logging
from abc import ABC, abstractmethod
from typing import Iterable, Optional, Tuple

from services.everest.business_logic.internal_transaction import EverestInternalStateTransaction
from services.everest.business_logic.state import StateSelectorBase
from services.everest.business_logic.state_api import StateProxy
from starkware.starknet.business_logic.execution.objects import (
    CallInfo,
    ResourcesMapping,
    TransactionExecutionInfo,
)
from starkware.starknet.business_logic.state.state import StateSyncifier, UpdatesTrackerState
from starkware.starknet.business_logic.state.state_api import State, SyncState
from starkware.starknet.definitions.constants import GasCost
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.definitions.general_config import StarknetGeneralConfig
from starkware.starkware_utils.config_base import Config
from starkware.starkware_utils.error_handling import wrap_with_stark_exception

logger = logging.getLogger(__name__)

FeeInfo = Tuple[Optional[CallInfo], int]


class InternalStateTransaction(EverestInternalStateTransaction, ABC):
    """
    StarkNet internal state transaction.
    This is the API of transactions that update the state,
    but do not necessarily have an external transaction counterpart.
    See for example, SyntheticTransaction.
    """

    @staticmethod
    def get_state_selector_of_many(
        txs: Iterable[EverestInternalStateTransaction], general_config: Config
    ) -> StateSelectorBase:
        raise NotImplementedError

    def get_state_selector(self, general_config: Config) -> StateSelectorBase:
        raise NotImplementedError

    async def apply_state_updates(
        self, state: StateProxy, general_config: Config
    ) -> Optional[TransactionExecutionInfo]:
        """
        Applies the transaction on the commitment tree state in an atomic manner.
        """
        loop = asyncio.get_running_loop()

        # Downcast arguments to application-specific types.
        assert isinstance(state, State)

        sync_state = StateSyncifier(async_state=state, loop=loop)
        sync_apply_state_updates = functools.partial(
            self.sync_apply_state_updates,
            state=sync_state,
            general_config=general_config,
        )
        execution_info = await loop.run_in_executor(executor=None, func=sync_apply_state_updates)

        return execution_info

    def sync_apply_state_updates(
        self, state: StateProxy, general_config: Config
    ) -> Optional[TransactionExecutionInfo]:
        """
        Applies the transaction on the commitment tree state in an atomic manner.
        """
        # Downcast arguments to application-specific types.
        assert isinstance(state, SyncState)
        assert isinstance(general_config, StarknetGeneralConfig)

        concurrent_execution_info = self.apply_concurrent_changes(
            state=state, general_config=general_config
        )
        fee_transfer_info, actual_fee = self.apply_sequential_changes(
            state=state,
            general_config=general_config,
            actual_resources=concurrent_execution_info.actual_resources,
        )

        return TransactionExecutionInfo.from_concurrent_stage_execution_info(
            concurrent_execution_info=concurrent_execution_info,
            fee_transfer_info=fee_transfer_info,
            actual_fee=actual_fee,
        )

    def apply_concurrent_changes(
        self, state: SyncState, general_config: StarknetGeneralConfig
    ) -> TransactionExecutionInfo:
        """
        Applies changes that can be efficiently done in concurrent execution.
        Returns a partial execution info.
        """
        initial_gas = self.get_initial_gas()
        with wrap_with_stark_exception(
            code=StarknetErrorCode.UNEXPECTED_FAILURE,
            logger=logger,
            exception_types=[Exception],
        ):
            return self._apply_specific_concurrent_changes(
                state=UpdatesTrackerState(state=state),
                general_config=general_config,
                remaining_gas=initial_gas,
            )

    def apply_sequential_changes(
        self,
        state: SyncState,
        general_config: StarknetGeneralConfig,
        actual_resources: ResourcesMapping,
    ) -> FeeInfo:
        """
        Applies the parts of the transaction needed to be executed sequentially to enable
        efficient concurrency, as they are likely to collide in a concurrent execution,
        for example, access to bottleneck storage cells such as the sequencer balance).
        """
        with wrap_with_stark_exception(
            code=StarknetErrorCode.UNEXPECTED_FAILURE,
            logger=logger,
            exception_types=[Exception],
        ):
            return self._apply_specific_sequential_changes(
                state=state,
                general_config=general_config,
                actual_resources=actual_resources,
            )

    @abstractmethod
    def _apply_specific_concurrent_changes(
        self, state: UpdatesTrackerState, general_config: StarknetGeneralConfig, remaining_gas: int
    ) -> TransactionExecutionInfo:
        """
        A specific implementation of apply_concurrent_changes for each internal transaction.
        See apply_concurrent_changes.
        """

    @abstractmethod
    def _apply_specific_sequential_changes(
        self,
        state: SyncState,
        general_config: StarknetGeneralConfig,
        actual_resources: ResourcesMapping,
    ) -> FeeInfo:
        """
        A specific implementation of apply_sequential_changes for each internal transaction.
        See apply_sequential_changes.
        """

    def get_initial_gas(self) -> int:
        """
        Returns the initial gas of the transaction to run with.
        """
        return GasCost.INITIAL.value - GasCost.TRANSACTION.value
