import copy
from typing import List, MutableMapping, Optional, Tuple, Union

from starkware.cairo.lang.vm.crypto import pedersen_hash_func
from starkware.starknet.business_logic.execution.execute_entry_point import ExecuteEntryPoint
from starkware.starknet.business_logic.execution.objects import (
    CallInfo,
    Event,
    TransactionExecutionInfo,
)
from starkware.starknet.business_logic.fact_state.patricia_state import PatriciaStateReader
from starkware.starknet.business_logic.fact_state.state import SharedState
from starkware.starknet.business_logic.state.state import CachedState
from starkware.starknet.business_logic.state.state_api import State
from starkware.starknet.business_logic.state.state_api_objects import BlockInfo
from starkware.starknet.business_logic.transaction.deprecated_objects import (
    DeprecatedInternalDeclare,
    DeprecatedInternalInvokeFunction,
    DeprecatedInternalTransaction,
)
from starkware.starknet.core.os.contract_class.compiled_class_hash import (
    compute_compiled_class_hash,
)
from starkware.starknet.definitions import constants, fields
from starkware.starknet.definitions.data_availability_mode import DataAvailabilityMode
from starkware.starknet.definitions.general_config import StarknetGeneralConfig
from starkware.starknet.public.abi import get_selector_from_name
from starkware.starknet.services.api.contract_class.contract_class import (
    ContractClass,
    DeprecatedCompiledClass,
    EntryPointType,
)
from starkware.starknet.services.api.contract_class.contract_class_utils import (
    compile_contract_class,
)
from starkware.starknet.services.api.gateway.deprecated_transaction import (
    DEFAULT_DECLARE_SENDER_ADDRESS,
)
from starkware.starknet.services.api.messages import StarknetMessageToL1
from starkware.starknet.testing.contract_utils import (
    CastableToAddress,
    CastableToAddressSalt,
    CastableToFelt,
    cast_to_int,
)
from starkware.starknet.testing.test_utils import create_internal_deploy_tx_for_testing
from starkware.storage.dict_storage import DictStorage
from starkware.storage.storage import FactFetchingContext


class StarknetState:
    """
    Starknet testing object. Represents a state of a Starknet network.

    Example usage:
      state = await StarknetState.empty()
      contract_class = compile_starknet_files([CONTRACT_FILE], debug_info=True)
      class_hash, _ = await state.deprecated_declare(contract_class=contract_class)
      contract_address, _ = await state.deploy(class_hash=class_hash)
      res = await state.invoke_raw(
          contract_address=contract_address, selector="func", calldata=[1, 2])
    """

    def __init__(self, state: CachedState, general_config: StarknetGeneralConfig):
        """
        Constructor. Should not be used directly. Use empty() instead.
        """
        self.state = state
        self.general_config = general_config
        # A mapping from L2-to-L1 message hash to its counter.
        self._l2_to_l1_messages: MutableMapping[str, int] = {}
        # A list of all L2-to-L1 messages sent, in chronological order.
        self.l2_to_l1_messages_log: List[StarknetMessageToL1] = []
        # A list of all events emitted, in chronological order.
        self.events: List[Event] = []

    def copy(self) -> "StarknetState":
        """
        Creates a new StarknetState instance with the same state. And modifications to one instance
        would not affect the other.
        """
        return copy.deepcopy(self)

    @classmethod
    async def empty(cls, general_config: Optional[StarknetGeneralConfig] = None) -> "StarknetState":
        """
        Creates a new StarknetState instance.
        """
        if general_config is None:
            general_config = StarknetGeneralConfig()

        ffc = FactFetchingContext(storage=DictStorage(), hash_func=pedersen_hash_func)
        empty_shared_state = await SharedState.empty(ffc=ffc, general_config=general_config)
        state_reader = PatriciaStateReader(
            contract_state_root=empty_shared_state.contract_states,
            contract_class_root=empty_shared_state.contract_classes,
            ffc=ffc,
            contract_class_storage=ffc.storage,
        )
        state = CachedState(
            block_info=BlockInfo.empty(
                sequencer_address=general_config.sequencer_address,
                use_kzg_da=general_config.use_kzg_da,
            ),
            state_reader=state_reader,
            compiled_class_cache={},
        )

        return cls(state=state, general_config=general_config)

    async def deprecated_declare(
        self, contract_class: DeprecatedCompiledClass
    ) -> Tuple[int, TransactionExecutionInfo]:
        """
        Declares a contract class.
        Returns the class hash and the execution info.

        Args:
        contract_class - a compiled StarkNet contract returned by compile_starknet_files().
        """
        tx = DeprecatedInternalDeclare.create_deprecated(
            contract_class=contract_class,
            chain_id=self.general_config.chain_id.value,
            sender_address=DEFAULT_DECLARE_SENDER_ADDRESS,
            max_fee=0,
            version=0,
            signature=[],
            nonce=0,
        )
        self.state.compiled_classes[tx.class_hash] = contract_class

        with self.state.copy_and_apply() as state_copy:
            tx_execution_info = await tx.apply_state_updates(
                state=state_copy, general_config=self.general_config
            )

        return tx.class_hash, tx_execution_info

    async def declare(
        self,
        contract_class: ContractClass,
        sender_address: CastableToAddress,
        compiler_dir: Optional[str] = None,
    ) -> Tuple[int, TransactionExecutionInfo]:
        """
        Declares a Cairo 1.0 contract class.
        Returns the class hash and the execution info.

        Args:
        contract_class - a compiled StarkNet contract.
        """
        compiled_class = compile_contract_class(
            contract_class=contract_class, compiler_dir=compiler_dir
        )
        compiled_class_hash = compute_compiled_class_hash(compiled_class=compiled_class)
        sender_address = cast_to_int(sender_address)
        tx = DeprecatedInternalDeclare.create(
            contract_class=contract_class,
            compiled_class_hash=compiled_class_hash,
            chain_id=self.general_config.chain_id.value,
            sender_address=sender_address,
            max_fee=0,
            version=constants.DEPRECATED_DECLARE_VERSION,
            signature=[],
            nonce=await self.state.get_nonce_at(
                data_availability_mode=DataAvailabilityMode.L1, contract_address=sender_address
            ),
        )
        self.state.compiled_classes[compiled_class_hash] = compiled_class

        with self.state.copy_and_apply() as state_copy:
            tx_execution_info = await tx.apply_state_updates(
                state=state_copy, general_config=self.general_config
            )

        return tx.class_hash, tx_execution_info

    async def deploy(
        self,
        class_hash: CastableToFelt,
        constructor_calldata: List[int],
        sender_address: CastableToAddress,
        max_fee: int = 0,
        contract_address_salt: Optional[CastableToAddressSalt] = None,
    ) -> Tuple[int, TransactionExecutionInfo]:
        """
        Deploys a contract by invoking the account contract's `deploy_contract` function.
        Returns the contract address and the execution info.

        Args:
        class_hash - a declared class hash.
        contract_address_salt - If supplied, a hexadecimal string or an integer representing
        the salt to use for deploying. Otherwise, the salt is randomized.
        """
        if contract_address_salt is None:
            contract_address_salt = fields.ContractAddressSalt.get_random_value()

        sender_address = cast_to_int(sender_address)
        nonce = await self.state.get_nonce_at(
            data_availability_mode=DataAvailabilityMode.L1, contract_address=sender_address
        )
        contract_address, tx = create_internal_deploy_tx_for_testing(
            sender_address=sender_address,
            class_hash=cast_to_int(class_hash),
            constructor_calldata=constructor_calldata,
            salt=cast_to_int(contract_address_salt),
            nonce=nonce,
            max_fee=max_fee,
            chain_id=self.general_config.chain_id.value,
        )

        tx_execution_info = await self.execute_tx(tx=tx)

        return contract_address, tx_execution_info

    async def invoke_raw(
        self,
        contract_address: CastableToAddress,
        selector: Union[int, str],
        calldata: List[int],
        max_fee: int,
        signature: Optional[List[int]] = None,
        nonce: Optional[int] = None,
    ) -> TransactionExecutionInfo:
        """
        Invokes a contract function. Returns the execution info.

        Args:
        contract_address - a hexadecimal string or an integer representing the contract address.
        selector - either a function name or an integer selector for the entrypoint to invoke.
        calldata - a list of integers to pass as calldata to the invoked function.
        signature - a list of integers to pass as signature to the invoked function.
        """
        tx = await create_invoke_function(
            state=self.state,
            contract_address=contract_address,
            selector=selector,
            calldata=calldata,
            max_fee=max_fee,
            version=constants.DEPRECATED_TRANSACTION_VERSION,
            signature=signature,
            nonce=nonce,
            chain_id=self.general_config.chain_id.value,
        )
        return await self.execute_tx(tx=tx)

    async def execute_entry_point_raw(
        self,
        contract_address: CastableToAddress,
        selector: Union[int, str],
        calldata: List[int],
        caller_address: int,
    ) -> CallInfo:
        """
        Builds the transaction execution context and executes the entry point.
        Returns the CallInfo.
        """
        if isinstance(contract_address, str):
            contract_address = int(contract_address, 16)
        assert isinstance(contract_address, int)

        if isinstance(selector, str):
            selector = get_selector_from_name(selector)
        assert isinstance(selector, int)

        call = ExecuteEntryPoint.create(
            contract_address=contract_address,
            entry_point_selector=selector,
            initial_gas=constants.GasCost.INITIAL.value,
            entry_point_type=EntryPointType.EXTERNAL,
            calldata=calldata,
            caller_address=caller_address,
        )

        with self.state.copy_and_apply() as state_copy:
            call_info = await call.execute_for_testing(
                state=state_copy,
                general_config=self.general_config,
            )

        self.add_messages_and_events(execution_info=call_info)

        return call_info

    async def execute_tx(self, tx: DeprecatedInternalTransaction) -> TransactionExecutionInfo:
        with self.state.copy_and_apply() as state_copy:
            tx_execution_info = await tx.apply_state_updates(
                state=state_copy, general_config=self.general_config
            )

        self.add_messages_and_events(execution_info=tx_execution_info)

        return tx_execution_info

    def add_messages_and_events(self, execution_info: Union[CallInfo, TransactionExecutionInfo]):
        # Add messages.
        for message in execution_info.get_sorted_l2_to_l1_messages():
            starknet_message = StarknetMessageToL1(
                from_address=message.from_address,
                to_address=message.to_address,
                payload=message.payload,
            )
            self.l2_to_l1_messages_log.append(starknet_message)
            message_hash = starknet_message.get_hash()
            self._l2_to_l1_messages[message_hash] = self._l2_to_l1_messages.get(message_hash, 0) + 1

        # Add events.
        self.events += execution_info.get_sorted_events()

    def consume_message_hash(self, message_hash: str):
        """
        Consumes the given message hash.
        """
        assert (
            self._l2_to_l1_messages.get(message_hash, 0) > 0
        ), f"Message of hash {message_hash} is fully consumed."

        self._l2_to_l1_messages[message_hash] -= 1


async def create_invoke_function(
    state: State,
    contract_address: CastableToAddress,
    selector: Union[int, str],
    calldata: List[int],
    max_fee: int,
    version: int,
    signature: Optional[List[int]],
    nonce: Optional[int],
    chain_id: int,
    only_query: bool = False,
) -> DeprecatedInternalInvokeFunction:
    contract_address = cast_to_int(contract_address)
    if isinstance(selector, str):
        selector = get_selector_from_name(selector)
    assert isinstance(selector, int)

    if signature is None:
        signature = []

    # We allow not specifying nonce. In this case, the current nonce of the contract will be used.
    if nonce is None:
        nonce = await state.get_nonce_at(
            data_availability_mode=DataAvailabilityMode.L1, contract_address=contract_address
        )

    return DeprecatedInternalInvokeFunction.create(
        sender_address=contract_address,
        entry_point_selector=selector,
        calldata=calldata,
        max_fee=max_fee,
        signature=signature,
        nonce=nonce,
        chain_id=chain_id,
        version=version,
    )
