from abc import ABC, abstractmethod
from typing import Awaitable, Callable, List, Optional, Tuple

from starkware.starknet.definitions import fields
from starkware.starknet.definitions.data_availability_mode import DataAvailabilityMode
from starkware.starknet.services.api.contract_class.contract_class import (
    ContractClass,
    DeprecatedCompiledClass,
)
from starkware.starknet.services.api.gateway.account_transaction import (
    Declare,
    DeployAccount,
    InvokeFunction,
)
from starkware.starknet.services.api.gateway.deprecated_transaction import (
    DeprecatedDeclare,
    DeprecatedDeployAccount,
    DeprecatedInvokeFunction,
    DeprecatedOldDeclare,
)
from starkware.starknet.wallets.starknet_context import StarknetContext

DEFAULT_ACCOUNT_DIR = "~/.starknet_accounts"


class Account(ABC):
    @classmethod
    @abstractmethod
    def create(cls, starknet_context: StarknetContext, account_name: str) -> "Account":
        """
        Constructs an instance of the class.
        """

    @abstractmethod
    def new_account(self) -> int:
        """
        Initializes the account. For example, this may include choosing a new random private key.
        Returns the contract address of the new account.
        """

    # Transaction objects. For version 3 transactions.
    @abstractmethod
    async def declare(
        self,
        version: int,
        nonce_callback: Callable[[int], Awaitable[int]],
        resource_bounds: fields.ResourceBoundsMapping,
        contract_class: ContractClass,
        compiled_class_hash: int,
        chain_id: int,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        account_deployment_data: Optional[List[int]] = None,
        dry_run: bool = False,
    ) -> Declare:
        """
        Creates a Declare object; this is a version 3 transaction.
        Prepares the required information for declaring a contract class through the account
        contract.
        """

    @abstractmethod
    async def deploy_account(
        self,
        version: int,
        chain_id: int,
        resource_bounds: fields.ResourceBoundsMapping,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        deployer_address: int = 0,
        dry_run: bool = False,
        force_deploy: bool = False,
    ) -> Tuple[DeployAccount, int]:
        """
        Creates a DeployAccount object; this is a version 3 transaction.
        Prepares the deployment of the initialized account contract to the network.
        Returns the transaction and the new account address.
        """

    @abstractmethod
    async def invoke(
        self,
        version: int,
        resource_bounds: fields.ResourceBoundsMapping,
        contract_address: int,
        calldata: List[int],
        selector: int,
        chain_id: int,
        nonce_callback: Callable[[int], Awaitable[int]],
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        account_deployment_data: Optional[List[int]] = None,
        dry_run: bool = False,
    ) -> InvokeFunction:
        """
        Creates an InvokeFunction object; compatible with version 3 transactions.
        Given a function (contract address, selector, calldata) to invoke (or call) within the
        context of the account, prepares the required information for invoking it through the
        account contract.
        nonce_callback is a callback that gets the address of the contract and returns the next
        nonce to use.
        """

    @abstractmethod
    async def deploy_contract(
        self,
        version: int,
        resource_bounds: fields.ResourceBoundsMapping,
        calldata: List[int],
        constructor_calldata: List[int],
        class_hash: int,
        salt: int,
        deploy_from_zero: bool,
        chain_id: int,
        nonce_callback: Callable[[int], Awaitable[int]],
        contract_address: int,
        selector: int,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        account_deployment_data: Optional[List[int]] = None,
        dry_run: bool = False,
    ) -> Tuple[InvokeFunction, int]:
        """
        Creates an InvokeFunction object; compatible with version 3 transactions.
        Prepares the required information for invoking a contract deployment function through
        the account contract.
        Returns the signed transaction and the deployed contract address.
        """

    # Deprecated transaction objects. For version 0, 1 and 2 transactions.

    @abstractmethod
    async def deprecated_declare(
        self,
        contract_class: ContractClass,
        compiled_class_hash: int,
        chain_id: int,
        max_fee: int,
        version: int,
        nonce_callback: Callable[[int], Awaitable[int]],
        dry_run: bool = False,
    ) -> DeprecatedDeclare:
        """
        Creates a DeprecatedDeclare object; compatible with version 2 transactions.
        Prepares the required information for declaring a contract class through the account
        contract.
        """

    @abstractmethod
    async def deprecated_deploy_account(
        self,
        max_fee: int,
        version: int,
        chain_id: int,
        dry_run: bool = False,
        force_deploy: bool = False,
    ) -> Tuple[DeprecatedDeployAccount, int]:
        """
        Creates a DeprecatedDeployAccount object; compatible with version 1 transactions.
        Prepares the deployment of the initialized account contract to the network.
        Returns the transaction and the new account address.
        """

    @abstractmethod
    async def deprecated_invoke(
        self,
        contract_address: int,
        selector: int,
        calldata: List[int],
        chain_id: int,
        max_fee: int,
        version: int,
        nonce_callback: Callable[[int], Awaitable[int]],
        dry_run: bool = False,
    ) -> DeprecatedInvokeFunction:
        """
        Creates a DeprecatedInvokeFunction object; compatible with version 0 and version 1
        transactions.
        Given a function (contract address, selector, calldata) to invoke (or call) within the
        context of the account, prepares the required information for invoking it through the
        account contract.
        nonce_callback is a callback that gets the address of the contract and returns the next
        nonce to use.
        """

    @abstractmethod
    async def deprecated_deploy_contract(
        self,
        class_hash: int,
        salt: int,
        constructor_calldata: List[int],
        deploy_from_zero: bool,
        chain_id: int,
        max_fee: int,
        version: int,
        nonce_callback: Callable[[int], Awaitable[int]],
    ) -> Tuple[DeprecatedInvokeFunction, int]:
        """
        Creates a DeprecatedInvokeFunction object; compatible with version 0 transactions.
        Prepares the required information for invoking a contract deployment function through
        the account contract.
        Returns the signed transaction and the deployed contract address.
        """

    # Deprecated transaction objects. For version 0 and version 1 transactions, used to declare
    # Cairo 0 contracts.

    @abstractmethod
    async def deprecated_old_declare(
        self,
        contract_class: DeprecatedCompiledClass,
        chain_id: int,
        max_fee: int,
        version: int,
        nonce_callback: Callable[[int], Awaitable[int]],
        dry_run: bool = False,
    ) -> DeprecatedOldDeclare:
        """
        Creates a DeprecatedOldDeclare object; compatible with version 0 and version 1 transactions,
        used to declare a Cairo 0 contract.
        Prepares the required information for declaring a deprecated contract class through the
        account contract.
        """
