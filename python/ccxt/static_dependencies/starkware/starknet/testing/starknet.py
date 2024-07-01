import copy
from typing import List, MutableMapping, Optional, Union

from starkware.python.utils import as_non_optional
from starkware.starknet.business_logic.execution.objects import TransactionExecutionInfo
from starkware.starknet.business_logic.transaction.deprecated_objects import (
    DeprecatedInternalDeployAccount,
    InternalL1Handler,
)
from starkware.starknet.compiler.v1.compile import JsonObject
from starkware.starknet.core.os.contract_class.deprecated_class_hash import (
    compute_deprecated_class_hash,
)
from starkware.starknet.core.test_contract.test_utils import get_deprecated_compiled_class
from starkware.starknet.definitions import constants, fields
from starkware.starknet.definitions.general_config import StarknetGeneralConfig
from starkware.starknet.public.abi import AbiType, get_selector_from_name
from starkware.starknet.services.api.contract_class.contract_class import (
    ContractClass,
    DeprecatedCompiledClass,
)
from starkware.starknet.services.api.contract_class.contract_class_utils import (
    load_sierra,
    load_sierra_from_dict,
)
from starkware.starknet.services.api.messages import StarknetMessageToL1
from starkware.starknet.testing.contract import DeclaredClass, StarknetContract
from starkware.starknet.testing.contract_utils import (
    CastableToAddress,
    CastableToAddressSalt,
    CastableToFelt,
    cast_to_int,
    external_call_info_from_internal,
    gather_deprecated_compiled_class,
    get_deprecated_compiled_class_abi,
)
from starkware.starknet.testing.state import StarknetState


class Starknet:
    """
    A high level interface to a StarkNet state object.
    Example:
      starknet = await Starknet.empty()
      declare_info = await starknet.deprecated_declare(source='contract.cairo')
      contract = await starknet.deploy(class_hash=declare_info.class_hash)
      await contract.foo(a=1, b=[2, 3]).execute()
    """

    def __init__(
        self, state: StarknetState, default_account_address: Optional[CastableToAddress] = None
    ):
        self.state = state

        # l1_to_l2_nonce starts from 2**128 to avoid nonce collisions with
        # messages that were sent using starkware.starknet.testing.postman.Postman.
        self.l1_to_l2_nonce = 2**128
        self.class_hash_to_abi: MutableMapping[int, AbiType] = {}
        self._default_account_address = default_account_address

    @property
    def default_account_address(self) -> CastableToAddress:
        assert (
            self._default_account_address is not None
        ), "Default account address is not initialized."
        return self._default_account_address

    @classmethod
    async def empty(cls, general_config: Optional[StarknetGeneralConfig] = None) -> "Starknet":
        starknet = Starknet(state=await StarknetState.empty(general_config=general_config))
        starknet._default_account_address = await starknet.deploy_simple_account()
        return starknet

    def copy(self) -> "Starknet":
        return copy.deepcopy(self)

    async def deprecated_declare(
        self,
        source: Optional[str] = None,
        contract_class: Optional[DeprecatedCompiledClass] = None,
        cairo_path: Optional[List[str]] = None,
        disable_hint_validation: bool = False,
    ) -> DeclaredClass:
        """
        Declares a `DeprecatedCompiledClass` in the StarkNet network.
        Returns the class hash and the ABI of the contract.
        """
        contract_class = gather_deprecated_compiled_class(
            source=source,
            contract_class=contract_class,
            cairo_path=cairo_path,
            disable_hint_validation=disable_hint_validation,
        )
        class_hash, _ = await self.state.deprecated_declare(contract_class=contract_class)
        abi = get_deprecated_compiled_class_abi(contract_class=contract_class)
        self.class_hash_to_abi[class_hash] = abi
        return DeclaredClass(class_hash=class_hash, abi=abi)

    async def declare(
        self,
        abi: AbiType,
        sierra_path: Optional[str] = None,
        sierra_dict: Optional[JsonObject] = None,
        contract_class: Optional[ContractClass] = None,
        sender_address: Optional[CastableToAddress] = None,
        compiler_dir: Optional[str] = None,
    ) -> int:
        """
        Declares a Cairo 1.0 contract class in the StarkNet network.
        Returns the hash of the contract.
        """
        assert (sierra_path is not None) + (sierra_dict is not None) + (
            contract_class is not None
        ) == 1, "Exactly one of sierra_path, sierra_dict, contract_class should be supplied."

        if contract_class is None:
            if sierra_path is not None:
                contract_class = load_sierra(sierra_path=sierra_path)
            else:
                assert sierra_dict is not None
                contract_class = load_sierra_from_dict(sierra_dict)

        if sender_address is None:
            sender_address = self.default_account_address

        class_hash, _ = await self.state.declare(
            contract_class=contract_class, sender_address=sender_address, compiler_dir=compiler_dir
        )
        self.class_hash_to_abi[class_hash] = abi

        return class_hash

    async def deploy(
        self,
        class_hash: CastableToFelt,
        contract_address_salt: Optional[CastableToAddressSalt] = None,
        constructor_calldata: Optional[List[int]] = None,
        sender_address: Optional[CastableToAddress] = None,
    ) -> StarknetContract:
        if sender_address is None:
            sender_address = self.default_account_address

        abi = self.class_hash_to_abi.get(cast_to_int(class_hash))
        assert abi is not None, f"Missing abi for class of hash {class_hash}."

        # Deploy.
        deployed_contract_address, execution_info = await self.state.deploy(
            class_hash=class_hash,
            constructor_calldata=[] if constructor_calldata is None else constructor_calldata,
            sender_address=sender_address,
            contract_address_salt=contract_address_salt,
        )

        # Prepare the constructor call info and the StarknetContract object.
        main_call_info = as_non_optional(execution_info.call_info)
        (internal_constructor_call_info,) = main_call_info.internal_calls
        constructor_call_info = external_call_info_from_internal(
            call_info=internal_constructor_call_info, abi=abi
        )
        deployed_contract = StarknetContract(
            state=self.state,
            abi=abi,
            contract_address=deployed_contract_address,
            constructor_call_info=constructor_call_info,
        )
        return deployed_contract

    def consume_message_from_l2(self, from_address: int, to_address: int, payload: List[int]):
        """
        Mocks the L1 contract function consumeMessageFromL2.
        """
        starknet_message = StarknetMessageToL1(
            from_address=from_address,
            to_address=to_address,
            payload=payload,
        )
        self.state.consume_message_hash(message_hash=starknet_message.get_hash())

    async def send_message_to_l2(
        self,
        from_address: int,
        to_address: CastableToAddress,
        selector: Union[int, str],
        payload: List[int],
        nonce: Optional[int] = None,
        paid_fee_on_l1: Optional[int] = None,
    ) -> TransactionExecutionInfo:
        """
        Mocks the L1 contract function sendMessageToL2.

        Takes an optional nonce paramater to force a specific nonce, this
        should only be used by the Postman class.
        """
        if isinstance(selector, str):
            selector = get_selector_from_name(selector)
        assert isinstance(selector, int)

        if nonce is None:
            nonce = self.l1_to_l2_nonce
            self.l1_to_l2_nonce += 1

        tx = InternalL1Handler.create(
            contract_address=cast_to_int(to_address),
            entry_point_selector=selector,
            calldata=[from_address, *payload],
            nonce=nonce,
            chain_id=self.state.general_config.chain_id.value,
            paid_fee_on_l1=paid_fee_on_l1,
        )

        return await self.state.execute_tx(tx=tx)

    async def deploy_simple_account(self) -> int:
        """
        Declares and deploys the `dummy_account.cairo` contract and returns its address.
        This contract has no signature validation nor multicall support.
        """
        # Declare the dummy_account contract class.
        dummy_account_contract_class = get_deprecated_compiled_class("dummy_account")
        await self.deprecated_declare(contract_class=dummy_account_contract_class)
        general_config = self.state.general_config
        salt = fields.ContractAddressSalt.get_random_value()
        # Deploy the dummy_account contract.
        deploy_account_tx = DeprecatedInternalDeployAccount.create(
            class_hash=compute_deprecated_class_hash(contract_class=dummy_account_contract_class),
            constructor_calldata=[],
            contract_address_salt=salt,
            nonce=0,
            max_fee=0,
            version=constants.DEPRECATED_TRANSACTION_VERSION,
            chain_id=general_config.chain_id.value,
            signature=[],
        )

        await self.state.execute_tx(tx=deploy_account_tx)
        return deploy_account_tx.sender_address
