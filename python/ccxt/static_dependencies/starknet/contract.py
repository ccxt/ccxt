from __future__ import annotations

import dataclasses
from abc import ABC, abstractmethod
from dataclasses import dataclass
from functools import cached_property
from typing import Dict, List, Optional, TypeVar, Union

from ..marshmallow import ValidationError

from abi.v0 import Abi as AbiV0
from abi.v0 import AbiParser as AbiParserV0
from abi.v1 import Abi as AbiV1
from abi.v1 import AbiParser as AbiParserV1
from abi.v2 import Abi as AbiV2
from abi.v2 import AbiParser as AbiParserV2
from abi.v2.shape import (
    FUNCTION_ENTRY,
    IMPL_ENTRY,
    INTERFACE_ENTRY,
    L1_HANDLER_ENTRY,
)
from common import create_compiled_contract, create_sierra_compiled_contract
from constants import DEFAULT_DEPLOYER_ADDRESS
from contract_utils import _extract_compiled_class_hash, _unpack_provider
from hash.address import compute_address
from hash.class_hash import compute_class_hash
from hash.selector import get_selector_from_name
from net.account.base_account import BaseAccount
from net.client import Client
from net.client_models import Call, EstimatedFee, Hash, ResourceBounds, Tag
from net.models import AddressRepresentation, parse_address
from net.models.transaction import Declare, Invoke
from net.udc_deployer.deployer import Deployer
from proxy.contract_abi_resolver import (
    ContractAbiResolver,
    ProxyConfig,
    prepare_proxy_config,
)
from serialization import (
    FunctionSerializationAdapter,
    TupleDataclass,
    serializer_for_function,
)
from serialization.factory import serializer_for_function_v1
from .utils.constructor_args_translator import (
    _is_abi_v2,
    translate_constructor_args,
)
from utils.sync import add_sync_methods

# pylint: disable=too-many-lines

ABI = list
ABIEntry = dict
TypeSentTransaction = TypeVar("TypeSentTransaction", bound="SentTransaction")


@dataclass(frozen=True)
class ContractData:
    """
    Basic data of a deployed contract.
    """

    address: int
    abi: ABI
    cairo_version: int

    @cached_property
    def parsed_abi(self) -> Union[AbiV0, AbiV1, AbiV2]:
        """
        Abi parsed into proper dataclass.

        :return: Abi
        """
        if self.cairo_version == 1:
            if _is_abi_v2(self.abi):
                return AbiParserV2(self.abi).parse()
            return AbiParserV1(self.abi).parse()
        return AbiParserV0(self.abi).parse()

    @staticmethod
    def from_abi(address: int, abi: ABI, cairo_version: int = 1) -> ContractData:
        """
        Create ContractData from ABI.

        :param address: Address of the deployed contract.
        :param abi: Abi of the contract.
        :param cairo_version: Version of the Cairo in which contract is written.
        :return: ContractData instance.
        """
        return ContractData(
            address=address,
            abi=abi,
            cairo_version=cairo_version,
        )


@add_sync_methods
@dataclass(frozen=True)
class SentTransaction:
    """
    Dataclass exposing the interface of transaction related to a performed action.
    """

    hash: int
    """Hash of the transaction."""

    _client: Client
    status: Optional[str] = None
    """Status of the transaction."""

    block_number: Optional[int] = None
    """Number of the block in which transaction was included."""

    async def wait_for_acceptance(
        self: TypeSentTransaction,
        check_interval: float = 2,
        retries: int = 500,
    ) -> TypeSentTransaction:
        """
        Waits for transaction to be accepted on chain till ``ACCEPTED`` status.
        Returns a new SentTransaction instance, **does not mutate original instance**.
        """

        tx_receipt = await self._client.wait_for_tx(
            self.hash,
            check_interval=check_interval,
            retries=retries,
        )
        return dataclasses.replace(
            self,
            status=tx_receipt.finality_status,
            block_number=tx_receipt.block_number,
        )


@add_sync_methods
@dataclass(frozen=True)
class InvokeResult(SentTransaction):
    """
    Result of the Invoke transaction.
    """

    # We ensure these are not None in __post_init__
    contract: ContractData = None  # pyright: ignore
    """Additional information about the Contract that made the transaction."""

    invoke_transaction: Invoke = None  # pyright: ignore
    """A InvokeTransaction instance used."""

    def __post_init__(self):
        assert self.contract is not None
        assert self.invoke_transaction is not None


@add_sync_methods
@dataclass(frozen=True)
class DeclareResult(SentTransaction):
    """
    Result of the Declare transaction.
    """

    _account: BaseAccount = None  # pyright: ignore
    _cairo_version: int = 1

    class_hash: int = None  # pyright: ignore
    """Class hash of the declared contract."""

    compiled_contract: str = None  # pyright: ignore
    """Compiled contract that was declared."""

    declare_transaction: Declare = None  # pyright: ignore
    """A Declare transaction that has been sent."""

    def __post_init__(self):
        if self._account is None:
            raise ValueError("Argument _account can't be None.")

        if self.class_hash is None:
            raise ValueError("Argument class_hash can't be None.")

        if self.compiled_contract is None:
            raise ValueError("Argument compiled_contract can't be None.")

        if self.declare_transaction is None:
            raise ValueError("Argument declare_transaction can't be None.")

    async def deploy_v1(
        self,
        *,
        deployer_address: AddressRepresentation = DEFAULT_DEPLOYER_ADDRESS,
        salt: Optional[int] = None,
        unique: bool = True,
        constructor_args: Optional[Union[List, Dict]] = None,
        nonce: Optional[int] = None,
        max_fee: Optional[int] = None,
        auto_estimate: bool = False,
    ) -> "DeployResult":
        """
        Deploys a contract.

        :param deployer_address: Address of the UDC. Is set to the address of
            the default UDC (same address on mainnet/sepolia) by default.
            Must be set when using custom network other than ones listed above.
        :param salt: Optional salt. Random value is selected if it is not provided.
        :param unique: Determines if the contract should be salted with the account address.
        :param constructor_args: a ``list`` or ``dict`` of arguments for the constructor.
        :param nonce: Nonce of the transaction with call to deployer.
        :param max_fee: Max amount of Wei to be paid when executing transaction.
        :param auto_estimate: Use automatic fee estimation (not recommended, as it may lead to high costs).
        :return: DeployResult instance.
        """
        # pylint: disable=too-many-arguments, too-many-locals
        abi = self._get_abi()

        return await Contract.deploy_contract_v1(
            account=self._account,
            class_hash=self.class_hash,
            abi=abi,
            constructor_args=constructor_args,
            deployer_address=deployer_address,
            cairo_version=self._cairo_version,
            nonce=nonce,
            max_fee=max_fee,
            auto_estimate=auto_estimate,
            salt=salt,
            unique=unique,
        )

    async def deploy_v3(
        self,
        *,
        deployer_address: AddressRepresentation = DEFAULT_DEPLOYER_ADDRESS,
        salt: Optional[int] = None,
        unique: bool = True,
        constructor_args: Optional[Union[List, Dict]] = None,
        nonce: Optional[int] = None,
        l1_resource_bounds: Optional[ResourceBounds] = None,
        auto_estimate: bool = False,
    ) -> "DeployResult":
        """
        Deploys a contract.

        :param deployer_address: Address of the UDC. Is set to the address of
            the default UDC (same address on mainnet/sepolia) by default.
            Must be set when using custom network other than ones listed above.
        :param salt: Optional salt. Random value is selected if it is not provided.
        :param unique: Determines if the contract should be salted with the account address.
        :param constructor_args: a ``list`` or ``dict`` of arguments for the constructor.
        :param nonce: Nonce of the transaction with call to deployer.
        :param l1_resource_bounds: Max amount and max price per unit of L1 gas (in Fri) used when executing
            this transaction.
        :param auto_estimate: Use automatic fee estimation (not recommended, as it may lead to high costs).
        :return: DeployResult instance.
        """
        # pylint: disable=too-many-arguments, too-many-locals
        abi = self._get_abi()

        return await Contract.deploy_contract_v3(
            account=self._account,
            class_hash=self.class_hash,
            abi=abi,
            constructor_args=constructor_args,
            deployer_address=deployer_address,
            cairo_version=self._cairo_version,
            nonce=nonce,
            l1_resource_bounds=l1_resource_bounds,
            auto_estimate=auto_estimate,
            salt=salt,
            unique=unique,
        )

    def _get_abi(self) -> List:
        if self._cairo_version == 0:
            abi = create_compiled_contract(compiled_contract=self.compiled_contract).abi
        else:
            try:
                sierra_compiled_contract = create_sierra_compiled_contract(
                    compiled_contract=self.compiled_contract
                )
                abi = sierra_compiled_contract.parsed_abi

            except Exception as exc:
                raise ValueError(
                    "Contract's ABI can't be converted to format List[Dict]. "
                    "Make sure provided compiled_contract is correct."
                ) from exc
        return abi


@add_sync_methods
@dataclass(frozen=True)
class DeployResult(SentTransaction):
    """
    Result of the contract deployment.
    """

    # We ensure this is not None in __post_init__
    deployed_contract: Contract = None  # pyright: ignore
    """A Contract instance representing the deployed contract."""

    def __post_init__(self):
        if self.deployed_contract is None:
            raise ValueError("Argument deployed_contract can't be None.")


@dataclass
class PreparedCallBase(Call):
    _client: Client
    _payload_transformer: FunctionSerializationAdapter


@add_sync_methods
@dataclass
class PreparedFunctionCall(PreparedCallBase):
    """
    Prepared date to call a contract function.
    """

    async def call_raw(
        self,
        block_hash: Optional[str] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> List[int]:
        """
        Calls a method without translating the result into python values.

        :param block_hash: Optional block hash.
        :param block_number: Optional block number.
        :return: list of ints.
        """
        return await self._client.call_contract(
            call=self, block_hash=block_hash, block_number=block_number
        )

    async def call(
        self,
        block_hash: Optional[str] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> TupleDataclass:
        """
        Calls a method.

        :param block_hash: Optional block hash.
        :param block_number: Optional block number.
        :return: TupleDataclass representing call result.
        """
        result = await self.call_raw(block_hash=block_hash, block_number=block_number)
        return self._payload_transformer.deserialize(result)


@add_sync_methods
@dataclass
class PreparedFunctionInvoke(ABC, PreparedCallBase):
    _contract_data: ContractData
    _account: Optional[BaseAccount]

    def __post_init__(self):
        if self._account is None:
            raise ValueError(
                "Contract instance was created without providing an Account. "
                "It is not possible to prepare and send an invoke transaction."
            )

    @property
    def get_account(self):
        if self._account is not None:
            return self._account

        raise ValueError(
            "The account is not defined. It is not possible to send an invoke transaction."
        )

    @abstractmethod
    async def estimate_fee(
        self,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
        *,
        nonce: Optional[int] = None,
    ) -> EstimatedFee:
        """
        Estimate fee for prepared function call.

        :param block_hash: Estimate fee at specific block hash.
        :param block_number: Estimate fee at given block number
            (or "latest" / "pending" for the latest / pending block), default is "pending".
        :param nonce: Nonce of the transaction.
        :return: Estimated amount of the transaction cost, either in Wei or Fri associated with executing the
            specified transaction.
        """

    async def _invoke(self, transaction: Invoke) -> InvokeResult:
        response = await self._client.send_transaction(transaction)

        invoke_result = InvokeResult(
            hash=response.transaction_hash,  # noinspection PyTypeChecker
            _client=self._client,
            contract=self._contract_data,
            invoke_transaction=transaction,
        )

        return invoke_result


@add_sync_methods
@dataclass
class PreparedFunctionInvokeV1(PreparedFunctionInvoke):
    """
    Prepared date to send an InvokeV1 transaction.
    """

    max_fee: Optional[int]

    async def invoke(
        self,
        max_fee: Optional[int] = None,
        auto_estimate: bool = False,
        *,
        nonce: Optional[int] = None,
    ) -> InvokeResult:
        """
        Send an Invoke transaction version 1 for the prepared data.

        :param max_fee: Max amount of Wei to be paid when executing transaction.
        :param auto_estimate: Use automatic fee estimation (not recommended, as it may lead to high costs).
        :param nonce: Nonce of the transaction.
        :return: InvokeResult.
        """

        transaction = await self.get_account.sign_invoke_v1(
            calls=self,
            nonce=nonce,
            max_fee=max_fee or self.max_fee,
            auto_estimate=auto_estimate,
        )

        return await self._invoke(transaction)

    async def estimate_fee(
        self,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
        *,
        nonce: Optional[int] = None,
    ) -> EstimatedFee:
        tx = await self.get_account.sign_invoke_v1(calls=self, nonce=nonce, max_fee=0)
        estimate_tx = await self.get_account.sign_for_fee_estimate(transaction=tx)

        estimated_fee = await self._client.estimate_fee(
            tx=estimate_tx,
            block_hash=block_hash,
            block_number=block_number,
        )

        assert isinstance(estimated_fee, EstimatedFee)
        return estimated_fee


@add_sync_methods
@dataclass
class PreparedFunctionInvokeV3(PreparedFunctionInvoke):
    """
    Prepared date to send an InvokeV3 transaction.
    """

    l1_resource_bounds: Optional[ResourceBounds]

    async def invoke(
        self,
        l1_resource_bounds: Optional[ResourceBounds] = None,
        auto_estimate: bool = False,
        *,
        nonce: Optional[int] = None,
    ) -> InvokeResult:
        """
        Send an Invoke transaction version 3 for the prepared data.

        :param l1_resource_bounds: Max amount and max price per unit of L1 gas (in Fri) used when executing
            this transaction.
        :param auto_estimate: Use automatic fee estimation (not recommended, as it may lead to high costs).
        :param nonce: Nonce of the transaction.
        :return: InvokeResult.
        """

        transaction = await self.get_account.sign_invoke_v3(
            calls=self,
            nonce=nonce,
            l1_resource_bounds=l1_resource_bounds or self.l1_resource_bounds,
            auto_estimate=auto_estimate,
        )

        return await self._invoke(transaction)

    async def estimate_fee(
        self,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
        *,
        nonce: Optional[int] = None,
    ) -> EstimatedFee:
        tx = await self.get_account.sign_invoke_v3(
            calls=self, nonce=nonce, l1_resource_bounds=ResourceBounds.init_with_zeros()
        )
        estimate_tx = await self.get_account.sign_for_fee_estimate(transaction=tx)

        estimated_fee = await self._client.estimate_fee(
            tx=estimate_tx,
            block_hash=block_hash,
            block_number=block_number,
        )

        assert isinstance(estimated_fee, EstimatedFee)
        return estimated_fee


@add_sync_methods
class ContractFunction:
    def __init__(
        self,
        name: str,
        abi: ABIEntry,
        contract_data: ContractData,
        client: Client,
        account: Optional[BaseAccount],
        cairo_version: int = 1,
        *,
        interface_name: Optional[str] = None,
    ):
        # pylint: disable=too-many-arguments
        self.name = name
        self.abi = abi
        self.inputs = abi["inputs"]
        self.contract_data = contract_data
        self.client = client
        self.account = account

        if abi["type"] == L1_HANDLER_ENTRY:
            assert not isinstance(contract_data.parsed_abi, AbiV1)
            function = (
                contract_data.parsed_abi.l1_handler
                if contract_data.parsed_abi.l1_handler is None
                or isinstance(contract_data.parsed_abi.l1_handler, AbiV0.Function)
                else contract_data.parsed_abi.l1_handler.get(name)
            )
        elif interface_name is None:
            function = contract_data.parsed_abi.functions.get(name)
        else:
            assert isinstance(contract_data.parsed_abi, AbiV2)
            interface = contract_data.parsed_abi.interfaces[interface_name]
            function = interface.items[name]

        assert function is not None

        if cairo_version == 1:
            assert not isinstance(function, AbiV0.Function) and function is not None
            self._payload_transformer = serializer_for_function_v1(function)

        else:
            assert isinstance(function, AbiV0.Function) and function is not None
            self._payload_transformer = serializer_for_function(function)

    def prepare_call(
        self,
        *args,
        **kwargs,
    ) -> PreparedFunctionCall:
        """
        ``*args`` and ``**kwargs`` are translated into Cairo calldata.
        Creates a ``PreparedFunctionCall`` instance which exposes calldata for every argument
        and adds more arguments when calling methods.

        :return: PreparedFunctionCall.
        """

        calldata = self._payload_transformer.serialize(*args, **kwargs)
        return PreparedFunctionCall(
            to_addr=self.contract_data.address,
            calldata=calldata,
            selector=self.get_selector(self.name),
            _client=self.client,
            _payload_transformer=self._payload_transformer,
        )

    async def call(
        self,
        *args,
        block_hash: Optional[str] = None,
        block_number: Optional[Union[int, Tag]] = None,
        **kwargs,
    ) -> TupleDataclass:
        """
        Call contract's function. ``*args`` and ``**kwargs`` are translated into Cairo calldata.
        The result is translated from Cairo data to python values.
        Equivalent of ``.prepare_call(*args, **kwargs).call()``.

        :param block_hash: Block hash to perform the call to the contract at specific point of time.
        :param block_number: Block number to perform the call to the contract at specific point of time.
        :return: TupleDataclass representing call result.
        """
        return await self.prepare_call(*args, **kwargs).call(
            block_hash=block_hash, block_number=block_number
        )

    def prepare_invoke_v1(
        self,
        *args,
        max_fee: Optional[int] = None,
        **kwargs,
    ) -> PreparedFunctionInvokeV1:
        """
        ``*args`` and ``**kwargs`` are translated into Cairo calldata.
        Creates a ``PreparedFunctionInvokeV1`` instance which exposes calldata for every argument
        and adds more arguments when calling methods.

        :param max_fee: Max amount of Wei to be paid when executing transaction.
        :return: PreparedFunctionCall.
        """

        calldata = self._payload_transformer.serialize(*args, **kwargs)
        return PreparedFunctionInvokeV1(
            to_addr=self.contract_data.address,
            calldata=calldata,
            selector=self.get_selector(self.name),
            max_fee=max_fee,
            _contract_data=self.contract_data,
            _client=self.client,
            _account=self.account,
            _payload_transformer=self._payload_transformer,
        )

    async def invoke_v1(
        self,
        *args,
        max_fee: Optional[int] = None,
        auto_estimate: bool = False,
        nonce: Optional[int] = None,
        **kwargs,
    ) -> InvokeResult:
        """
        Invoke contract's function. ``*args`` and ``**kwargs`` are translated into Cairo calldata.
        Equivalent of ``.prepare_invoke_v1(*args, **kwargs).invoke()``.

        :param max_fee: Max amount of Wei to be paid when executing transaction.
        :param auto_estimate: Use automatic fee estimation (not recommended, as it may lead to high costs).
        :param nonce: Nonce of the transaction.
        :return: InvokeResult.
        """
        prepared_invoke = self.prepare_invoke_v1(*args, **kwargs)
        return await prepared_invoke.invoke(
            max_fee=max_fee, nonce=nonce, auto_estimate=auto_estimate
        )

    def prepare_invoke_v3(
        self,
        *args,
        l1_resource_bounds: Optional[ResourceBounds] = None,
        **kwargs,
    ) -> PreparedFunctionInvokeV3:
        """
        ``*args`` and ``**kwargs`` are translated into Cairo calldata.
        Creates a ``PreparedFunctionInvokeV3`` instance which exposes calldata for every argument
        and adds more arguments when calling methods.

        :param l1_resource_bounds: Max amount and max price per unit of L1 gas (in Fri) used when executing
            this transaction.
        :return: PreparedFunctionInvokeV3.
        """

        calldata = self._payload_transformer.serialize(*args, **kwargs)
        return PreparedFunctionInvokeV3(
            to_addr=self.contract_data.address,
            calldata=calldata,
            selector=self.get_selector(self.name),
            l1_resource_bounds=l1_resource_bounds,
            _contract_data=self.contract_data,
            _client=self.client,
            _account=self.account,
            _payload_transformer=self._payload_transformer,
        )

    async def invoke_v3(
        self,
        *args,
        l1_resource_bounds: Optional[ResourceBounds] = None,
        auto_estimate: bool = False,
        nonce: Optional[int] = None,
        **kwargs,
    ) -> InvokeResult:
        """
        Invoke contract's function. ``*args`` and ``**kwargs`` are translated into Cairo calldata.
        Equivalent of ``.prepare_invoke_v3(*args, **kwargs).invoke()``.

        :param l1_resource_bounds: Max amount and max price per unit of L1 gas (in Fri) used when executing
            this transaction.
        :param auto_estimate: Use automatic fee estimation (not recommended, as it may lead to high costs).
        :param nonce: Nonce of the transaction.
        :return: InvokeResult.
        """
        prepared_invoke = self.prepare_invoke_v3(*args, **kwargs)
        return await prepared_invoke.invoke(
            l1_resource_bounds=l1_resource_bounds,
            nonce=nonce,
            auto_estimate=auto_estimate,
        )

    @staticmethod
    def get_selector(function_name: str):
        """
        :param function_name: Contract function's name.
        :return: A Starknet integer selector for this function inside the contract.
        """
        return get_selector_from_name(function_name)


FunctionsRepository = Dict[str, ContractFunction]


@add_sync_methods
class Contract:
    """
    Cairo contract's model.
    """

    def __init__(
        self,
        address: AddressRepresentation,
        abi: list,
        provider: Union[BaseAccount, Client],
        *,
        cairo_version: int = 1,
    ):
        """
        Should be used instead of ``from_address`` when ABI is known statically.

        Arguments provider and client are mutually exclusive and cannot be provided at the same time.

        :param address: contract's address.
        :param abi: contract's abi.
        :param provider: BaseAccount or Client used to perform transactions.
        :param cairo_version: Version of the Cairo in which contract is written.
        """
        client, account = _unpack_provider(provider)

        self.account: Optional[BaseAccount] = account
        self.client: Client = client
        self.data = ContractData.from_abi(parse_address(address), abi, cairo_version)

        try:
            self._functions = self._make_functions(
                contract_data=self.data,
                client=self.client,
                account=self.account,
                cairo_version=cairo_version,
            )
        except ValidationError as exc:
            raise ValueError(
                "Make sure valid ABI is used to create a Contract instance"
            ) from exc

    @property
    def functions(self) -> FunctionsRepository:
        """
        :return: All functions exposed from a contract.
        """
        return self._functions

    @property
    def address(self) -> int:
        """Address of the contract."""
        return self.data.address

    @staticmethod
    async def from_address(
        address: AddressRepresentation,
        provider: Union[BaseAccount, Client] = None,  # pyright: ignore
        proxy_config: Union[bool, ProxyConfig] = False,
    ) -> Contract:
        """
        Fetches ABI for given contract and creates a new Contract instance with it. If you know ABI statically you
        should create Contract's instances directly instead of using this function to avoid unnecessary API calls.

        :raises ContractNotFoundError: when contract is not found.
        :raises TypeError: when given client's `get_class_by_hash` method does not return abi.
        :raises ProxyResolutionError: when given ProxyChecks were not sufficient to resolve proxy's implementation.
        :param address: Contract's address.
        :param provider: BaseAccount or Client.
        :param proxy_config: Proxy resolving config
            If set to ``True``, will use default proxy checks
            :class:`starknet_py.proxy.proxy_check.OpenZeppelinProxyCheck` and
            :class:`starknet_py.proxy.proxy_check.ArgentProxyCheck`.

            If set to ``False``, :meth:`Contract.from_address` will not resolve proxies.

            If a valid :class:`starknet_py.contract_abi_resolver.ProxyConfig` is provided, will use its values instead.

        :return: an initialized Contract instance.
        """
        client, account = _unpack_provider(provider)

        address = parse_address(address)
        proxy_config = Contract._create_proxy_config(proxy_config)

        abi, cairo_version = await ContractAbiResolver(
            address=address, client=client, proxy_config=proxy_config
        ).resolve()

        return Contract(
            address=address,
            abi=abi,
            provider=account or client,
            cairo_version=cairo_version,
        )

    @staticmethod
    async def declare_v1(
        account: BaseAccount,
        compiled_contract: str,
        *,
        nonce: Optional[int] = None,
        max_fee: Optional[int] = None,
        auto_estimate: bool = False,
    ) -> DeclareResult:
        """
        Declares a contract.

        :param account: BaseAccount used to sign and send declare transaction.
        :param compiled_contract: String containing compiled contract.
        :param nonce: Nonce of the transaction.
        :param max_fee: Max amount of Wei to be paid when executing transaction.
        :param auto_estimate: Use automatic fee estimation (not recommended, as it may lead to high costs).
        :return: DeclareResult instance.
        """

        declare_tx = await account.sign_declare_v1(
            compiled_contract=compiled_contract,
            nonce=nonce,
            max_fee=max_fee,
            auto_estimate=auto_estimate,
        )

        return await _declare_contract(
            declare_tx, account, compiled_contract, cairo_version=0
        )

    @staticmethod
    async def declare_v2(
        account: BaseAccount,
        compiled_contract: str,
        *,
        compiled_contract_casm: Optional[str] = None,
        compiled_class_hash: Optional[int] = None,
        nonce: Optional[int] = None,
        max_fee: Optional[int] = None,
        auto_estimate: bool = False,
    ) -> DeclareResult:
        # pylint: disable=too-many-arguments
        """
        Declares a contract.

        :param account: BaseAccount used to sign and send declare transaction.
        :param compiled_contract: String containing compiled contract.
        :param compiled_contract_casm: String containing the content of the starknet-sierra-compile (.casm file).
        :param compiled_class_hash: Hash of the compiled_contract_casm.
        :param nonce: Nonce of the transaction.
        :param max_fee: Max amount of Wei to be paid when executing transaction.
        :param auto_estimate: Use automatic fee estimation (not recommended, as it may lead to high costs).
        :return: DeclareResult instance.
        """

        compiled_class_hash = _extract_compiled_class_hash(
            compiled_contract_casm, compiled_class_hash
        )

        declare_tx = await account.sign_declare_v2(
            compiled_contract=compiled_contract,
            compiled_class_hash=compiled_class_hash,
            nonce=nonce,
            max_fee=max_fee,
            auto_estimate=auto_estimate,
        )

        return await _declare_contract(
            declare_tx, account, compiled_contract, cairo_version=1
        )

    @staticmethod
    async def declare_v3(
        account: BaseAccount,
        compiled_contract: str,
        *,
        compiled_contract_casm: Optional[str] = None,
        compiled_class_hash: Optional[int] = None,
        nonce: Optional[int] = None,
        l1_resource_bounds: Optional[ResourceBounds] = None,
        auto_estimate: bool = False,
    ) -> DeclareResult:
        # pylint: disable=too-many-arguments

        """
        Declares a contract.

        :param account: BaseAccount used to sign and send declare transaction.
        :param compiled_contract: String containing compiled contract.
        :param compiled_contract_casm: String containing the content of the starknet-sierra-compile (.casm file).
        :param compiled_class_hash: Hash of the compiled_contract_casm.
        :param nonce: Nonce of the transaction.
        :param l1_resource_bounds: Max amount and max price per unit of L1 gas (in Fri) used when executing
            this transaction.
        :param auto_estimate: Use automatic fee estimation (not recommended, as it may lead to high costs).
        :return: DeclareResult instance.
        """

        compiled_class_hash = _extract_compiled_class_hash(
            compiled_contract_casm, compiled_class_hash
        )

        declare_tx = await account.sign_declare_v3(
            compiled_contract=compiled_contract,
            compiled_class_hash=compiled_class_hash,
            nonce=nonce,
            l1_resource_bounds=l1_resource_bounds,
            auto_estimate=auto_estimate,
        )

        return await _declare_contract(
            declare_tx, account, compiled_contract, cairo_version=1
        )

    @staticmethod
    async def deploy_contract_v1(
        account: BaseAccount,
        class_hash: Hash,
        abi: List,
        constructor_args: Optional[Union[List, Dict]] = None,
        *,
        deployer_address: AddressRepresentation = DEFAULT_DEPLOYER_ADDRESS,
        cairo_version: int = 0,
        nonce: Optional[int] = None,
        max_fee: Optional[int] = None,
        auto_estimate: bool = False,
        salt: Optional[int] = None,
        unique: bool = True,
    ) -> "DeployResult":
        """
        Deploys a contract through Universal Deployer Contract.

        :param account: BaseAccount used to sign and send deploy transaction.
        :param class_hash: The class_hash of the contract to be deployed.
        :param abi: An abi of the contract to be deployed.
        :param constructor_args: a ``list`` or ``dict`` of arguments for the constructor.
        :param deployer_address: Address of the UDC. Is set to the address of
            the default UDC (same address on mainnet/sepolia) by default.
            Must be set when using custom network other than ones listed above.
        :param cairo_version: Version of the Cairo in which contract is written.
            By default, it is set to 0.
        :param nonce: Nonce of the transaction.
        :param max_fee: Max amount of Wei to be paid when executing transaction.
        :param auto_estimate: Use automatic fee estimation (not recommended, as it may lead to high costs).
        :param salt: Optional salt. Random value is selected if it is not provided.
        :param unique: Determines if the contract should be salted with the account address.
        :return: DeployResult instance.
        """
        # pylint: disable=too-many-arguments, too-many-locals
        deployer = Deployer(
            deployer_address=deployer_address,
            account_address=account.address if unique else None,
        )
        deploy_call, address = deployer.create_contract_deployment(
            class_hash=class_hash,
            salt=salt,
            abi=abi,
            calldata=constructor_args,
            cairo_version=cairo_version,
        )

        res = await account.execute_v1(
            calls=deploy_call,
            nonce=nonce,
            max_fee=max_fee,
            auto_estimate=auto_estimate,
        )

        deployed_contract = Contract(
            provider=account, address=address, abi=abi, cairo_version=cairo_version
        )
        deploy_result = DeployResult(
            hash=res.transaction_hash,
            _client=account.client,
            deployed_contract=deployed_contract,
        )

        return deploy_result

    @staticmethod
    async def deploy_contract_v3(
        account: BaseAccount,
        class_hash: Hash,
        abi: List,
        constructor_args: Optional[Union[List, Dict]] = None,
        *,
        deployer_address: AddressRepresentation = DEFAULT_DEPLOYER_ADDRESS,
        cairo_version: int = 1,
        nonce: Optional[int] = None,
        l1_resource_bounds: Optional[ResourceBounds] = None,
        auto_estimate: bool = False,
        salt: Optional[int] = None,
        unique: bool = True,
    ) -> "DeployResult":
        """
        Deploys a contract through Universal Deployer Contract.

        :param account: BaseAccount used to sign and send deploy transaction.
        :param class_hash: The class_hash of the contract to be deployed.
        :param abi: An abi of the contract to be deployed.
        :param constructor_args: a ``list`` or ``dict`` of arguments for the constructor.
        :param deployer_address: Address of the UDC. Is set to the address of
            the default UDC (same address on mainnet/sepolia) by default.
            Must be set when using custom network other than ones listed above.
        :param cairo_version: Version of the Cairo in which contract is written.
            By default, it is set to 1.
        :param nonce: Nonce of the transaction.
        :param l1_resource_bounds: Max amount and max price per unit of L1 gas (in Fri) used when executing
            this transaction.
        :param auto_estimate: Use automatic fee estimation (not recommended, as it may lead to high costs).
        :param salt: Optional salt. Random value is selected if it is not provided.
        :param unique: Determines if the contract should be salted with the account address.
        :return: DeployResult instance.
        """
        # pylint: disable=too-many-arguments, too-many-locals
        deployer = Deployer(
            deployer_address=deployer_address,
            account_address=account.address if unique else None,
        )
        deploy_call, address = deployer.create_contract_deployment(
            class_hash=class_hash,
            salt=salt,
            abi=abi,
            calldata=constructor_args,
            cairo_version=cairo_version,
        )

        res = await account.execute_v3(
            calls=deploy_call,
            nonce=nonce,
            l1_resource_bounds=l1_resource_bounds,
            auto_estimate=auto_estimate,
        )

        deployed_contract = Contract(
            provider=account, address=address, abi=abi, cairo_version=cairo_version
        )
        deploy_result = DeployResult(
            hash=res.transaction_hash,
            _client=account.client,
            deployed_contract=deployed_contract,
        )

        return deploy_result

    @staticmethod
    def compute_address(
        salt: int,
        compiled_contract: str,
        constructor_args: Optional[Union[List, Dict]] = None,
        deployer_address: int = 0,
    ) -> int:
        """
        Computes address for given Cairo 0 contract.

        :param salt: int
        :param compiled_contract: String containing compiled Cairo 0 contract.
        :param constructor_args: A ``list`` or ``dict`` of arguments for the constructor.
        :param deployer_address: Address of the deployer (if not provided default 0 is used).

        :return: Contract's address.
        """

        compiled = create_compiled_contract(compiled_contract)
        assert compiled.abi is not None
        translated_args = translate_constructor_args(
            compiled.abi, constructor_args, cairo_version=0
        )
        return compute_address(
            salt=salt,
            class_hash=compute_class_hash(compiled),
            constructor_calldata=translated_args,
            deployer_address=deployer_address,
        )

    @staticmethod
    def compute_contract_hash(compiled_contract: str) -> int:
        """
        Computes hash for given contract.

        :param compiled_contract: String containing compiled contract.
        :return: Class_hash of the contract.
        """

        contract_class = create_compiled_contract(compiled_contract)
        return compute_class_hash(contract_class)

    @classmethod
    def _make_functions(
        cls,
        contract_data: ContractData,
        client: Client,
        account: Optional[BaseAccount],
        cairo_version: int = 1,
    ) -> FunctionsRepository:
        repository = {}
        implemented_interfaces = [
            entry["interface_name"]
            for entry in contract_data.abi
            if entry["type"] == IMPL_ENTRY
        ]

        for abi_entry in contract_data.abi:
            if abi_entry["type"] in [FUNCTION_ENTRY, L1_HANDLER_ENTRY]:
                name = abi_entry["name"]
                repository[name] = ContractFunction(
                    name=name,
                    abi=abi_entry,
                    contract_data=contract_data,
                    client=client,
                    account=account,
                    cairo_version=cairo_version,
                )

            if (
                abi_entry["type"] == INTERFACE_ENTRY
                and abi_entry["name"] in implemented_interfaces
            ):
                for item in abi_entry["items"]:
                    name = item["name"]
                    repository[name] = ContractFunction(
                        name=name,
                        abi=item,
                        contract_data=contract_data,
                        client=client,
                        account=account,
                        cairo_version=cairo_version,
                        interface_name=abi_entry["name"],
                    )

        return repository

    @staticmethod
    def _create_proxy_config(proxy_config) -> ProxyConfig:
        if proxy_config is False:
            return ProxyConfig()
        proxy_arg = ProxyConfig() if proxy_config is True else proxy_config
        return prepare_proxy_config(proxy_arg)


async def _declare_contract(
    transaction: Declare,
    account: BaseAccount,
    compiled_contract: str,
    cairo_version: int,
) -> DeclareResult:
    res = await account.client.declare(transaction=transaction)

    return DeclareResult(
        hash=res.transaction_hash,
        class_hash=res.class_hash,
        compiled_contract=compiled_contract,
        declare_transaction=transaction,
        _account=account,
        _client=account.client,
        _cairo_version=cairo_version,
    )
