import dataclasses
from typing import ClassVar, Optional, Tuple, Type

from services.everest.api.gateway.transaction import EverestTransaction
from starkware.starknet.business_logic.execution.deprecated_objects import ExecutionResourcesManager
from starkware.starknet.business_logic.execution.objects import CallInfo, ResourcesMapping
from starkware.starknet.business_logic.state.state_api import SyncState
from starkware.starknet.business_logic.transaction.deprecated_objects import (
    DeprecatedInternalAccountTransaction,
    DeprecatedInternalDeclare,
    DeprecatedInternalDeployAccount,
    DeprecatedInternalInvokeFunction,
    DeprecatedInternalTransaction,
)
from starkware.starknet.business_logic.transaction.fee import calculate_tx_fee
from starkware.starknet.business_logic.transaction.state_objects import FeeInfo
from starkware.starknet.definitions.general_config import StarknetGeneralConfig
from starkware.starknet.services.api.feeder_gateway.response_objects import FeeEstimationInfo
from starkware.starknet.services.api.gateway.deprecated_transaction import (
    DeprecatedAccountTransaction,
    DeprecatedDeclare,
    DeprecatedDeployAccount,
    DeprecatedInvokeFunction,
    DeprecatedOldDeclare,
)
from starkware.starkware_utils.config_base import Config


def format_fee_info(gas_price: int, overall_fee: int) -> FeeEstimationInfo:
    return FeeEstimationInfo(
        overall_fee=overall_fee, gas_price=gas_price, gas_usage=overall_fee // gas_price
    )


@dataclasses.dataclass(frozen=True)  # type: ignore[misc]
class InternalAccountTransactionForSimulate(DeprecatedInternalAccountTransaction):
    """
    Represents an internal transaction in the Starknet network for the simulate transaction API.
    """

    # Simulation flags; should be replaced with actual values after construction.
    skip_validate: Optional[bool] = None

    # Override internal account transaction flag; enable query-version transactions to be created
    # and  executed.
    only_query: ClassVar[bool] = True

    @classmethod
    def create_for_simulate(
        cls, external_tx: EverestTransaction, general_config: Config, skip_validate: bool
    ) -> DeprecatedInternalTransaction:
        """
        Returns an internal transaction for simulation with the related simulation flags.
        """
        internal_tx_without_flags = cls._from_external(
            external_tx=external_tx, general_config=general_config
        )
        return dataclasses.replace(internal_tx_without_flags, skip_validate=skip_validate)

    @classmethod
    def _from_external(
        cls, external_tx: EverestTransaction, general_config: Config
    ) -> DeprecatedInternalTransaction:
        """
        Returns an internal transaction for simulation, generated based on an external one.
        """
        # Downcast arguments to application-specific types.
        assert isinstance(external_tx, DeprecatedAccountTransaction)
        assert isinstance(general_config, StarknetGeneralConfig)

        internal_cls: Type[InternalAccountTransactionForSimulate]
        if isinstance(external_tx, DeprecatedInvokeFunction):
            internal_cls = InternalInvokeFunctionForSimulate
        elif isinstance(external_tx, (DeprecatedDeclare, DeprecatedOldDeclare)):
            internal_cls = InternalDeprecatedDeclareForSimulate
        elif isinstance(external_tx, DeprecatedDeployAccount):
            internal_cls = InternalDeployAccountForSimulate
        else:
            raise NotImplementedError(f"Unexpected type {type(external_tx).__name__}.")

        return internal_cls._specific_from_external(
            external_tx=external_tx, general_config=general_config
        )

    def charge_fee(
        self, state: SyncState, resources: ResourcesMapping, general_config: StarknetGeneralConfig
    ) -> FeeInfo:
        """
        Overrides the charge fee method. Only calculates the actual fee and does not charge any fee.
        """
        actual_fee = calculate_tx_fee(
            l1_gas_price=state.block_info.l1_gas_price.price_in_wei, resources=resources
        )

        return None, actual_fee

    def run_validate_entrypoint(
        self,
        remaining_gas: int,
        state: SyncState,
        resources_manager: ExecutionResourcesManager,
        general_config: StarknetGeneralConfig,
    ) -> Tuple[Optional[CallInfo], int]:
        """
        Overrides the run_validate_entrypoint method. Validates only if skip_validate is False.
        """
        assert self.skip_validate is not None, "skip_validate flag is not initialized."
        if self.skip_validate:
            return None, remaining_gas

        return super().run_validate_entrypoint(
            remaining_gas=remaining_gas,
            state=state,
            resources_manager=resources_manager,
            general_config=general_config,
        )


@dataclasses.dataclass(frozen=True)
class InternalInvokeFunctionForSimulate(
    InternalAccountTransactionForSimulate, DeprecatedInternalInvokeFunction
):
    """
    Represents an internal invoke function in the StarkNet network for the simulate transaction API.
    """


@dataclasses.dataclass(frozen=True)
class InternalDeprecatedDeclareForSimulate(
    InternalAccountTransactionForSimulate, DeprecatedInternalDeclare
):
    """
    Represents an internal declare in the StarkNet network for the simulate transaction API.
    """


@dataclasses.dataclass(frozen=True)
class InternalDeployAccountForSimulate(
    InternalAccountTransactionForSimulate, DeprecatedInternalDeployAccount
):
    """
    Represents an internal deploy account in the StarkNet network for the simulate transaction API.
    """
