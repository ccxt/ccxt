from abc import ABC, abstractmethod
from typing import List, Optional, Tuple

from starkware.crypto.signature.signature import sign
from starkware.starknet.core.os.contract_address.contract_address import (
    calculate_contract_address_from_hash,
)
from starkware.starknet.core.os.transaction_hash.deprecated_transaction_hash import (
    deprecated_calculate_declare_transaction_hash,
    deprecated_calculate_deploy_account_transaction_hash,
    deprecated_calculate_invoke_transaction_hash,
    deprecated_calculate_old_declare_transaction_hash,
)
from starkware.starknet.core.os.transaction_hash.transaction_hash import (
    calculate_declare_transaction_hash,
    calculate_deploy_account_transaction_hash,
    calculate_invoke_transaction_hash,
)
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.data_availability_mode import DataAvailabilityMode
from starkware.starknet.definitions.transaction_type import TransactionType
from starkware.starknet.public.abi import get_selector_from_name
from starkware.starknet.services.api.contract_class.contract_class import (
    ContractClass,
    DeprecatedCompiledClass,
)
from starkware.starknet.services.api.feeder_gateway.request_objects import CallFunction
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


class SignerBase(ABC):
    """
    Base class for signing transactions.
    """

    @classmethod
    @abstractmethod
    def format_multicall_calldata(cls, calls: List[CallFunction]) -> List[int]:
        """
        Flattens the given calls according to the specific account API.
        """

    @classmethod
    @abstractmethod
    def sign_tx_hash(
        cls,
        tx_hash: int,
        private_key: Optional[int],
        tx_type: Optional[TransactionType] = None,
        additional_data: Optional[List[int]] = None,
    ) -> List[int]:
        """
        Signs the transaction hash.
        """

    # Sign functions for version 3 transactions.

    @classmethod
    def sign_declare_tx(
        cls,
        version: int,
        nonce: int,
        resource_bounds: fields.ResourceBoundsMapping,
        contract_class: ContractClass,
        compiled_class_hash: int,
        sender_address: int,
        private_key: Optional[int],
        chain_id: int,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        account_deployment_data: Optional[List[int]] = None,
    ) -> Declare:
        account_deployment_data = [] if account_deployment_data is None else account_deployment_data
        hash_value = calculate_declare_transaction_hash(
            version=version,
            nonce=nonce,
            sender_address=sender_address,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            contract_class=contract_class,
            compiled_class_hash=compiled_class_hash,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=[] if paymaster_data is None else paymaster_data,
            account_deployment_data=account_deployment_data,
            chain_id=chain_id,
        )

        return Declare.create(
            version=version,
            signature=cls.sign_tx_hash(tx_hash=hash_value, private_key=private_key),
            nonce=nonce,
            resource_bounds=resource_bounds,
            contract_class=contract_class,
            compiled_class_hash=compiled_class_hash,
            sender_address=sender_address,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            tip=tip,
            paymaster_data=paymaster_data,
            account_deployment_data=account_deployment_data,
        )

    @classmethod
    def sign_deploy_account_tx(
        cls,
        private_key: Optional[int],
        public_key: int,
        class_hash: int,
        salt: int,
        resource_bounds: fields.ResourceBoundsMapping,
        version: int,
        chain_id: int,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        deployer_address: int = 0,
    ) -> Tuple[int, DeployAccount]:
        constructor_calldata = [public_key]
        contract_address = calculate_contract_address_from_hash(
            salt=salt,
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            deployer_address=deployer_address,
        )
        hash_value = calculate_deploy_account_transaction_hash(
            version=version,
            nonce=0,
            contract_address=contract_address,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=nonce_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=[] if paymaster_data is None else paymaster_data,
            salt=salt,
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            chain_id=chain_id,
        )
        return contract_address, DeployAccount.create(
            version=version,
            signature=cls.sign_tx_hash(tx_hash=hash_value, private_key=private_key),
            nonce=0,
            resource_bounds=resource_bounds,
            class_hash=class_hash,
            contract_address_salt=salt,
            constructor_calldata=constructor_calldata,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            tip=tip,
            paymaster_data=paymaster_data,
        )

    @classmethod
    def sign_invoke_tx(
        cls,
        sender_address: int,
        private_key: Optional[int],
        contract_address: int,
        selector: int,
        calldata: List[int],
        chain_id: int,
        version: int,
        nonce: int,
        resource_bounds: fields.ResourceBoundsMapping,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        account_deployment_data: Optional[List[int]] = None,
    ) -> InvokeFunction:
        """
        Given a function to invoke (contract address, selector, calldata) and account identifiers
        (signer address, private key) prepares and signs an OpenZeppelin account invocation to this
        function.
        """
        call_function = CallFunction(
            contract_address=contract_address,
            entry_point_selector=selector,
            calldata=calldata,
        )

        return cls.sign_multicall_tx(
            version=version,
            nonce=nonce,
            resource_bounds=resource_bounds,
            sender_address=sender_address,
            private_key=private_key,
            call_functions=[call_function],
            chain_id=chain_id,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            tip=tip,
            paymaster_data=paymaster_data,
            account_deployment_data=account_deployment_data,
        )

    @classmethod
    def sign_multicall_tx(
        cls,
        version: int,
        nonce: int,
        resource_bounds: fields.ResourceBoundsMapping,
        sender_address: int,
        private_key: Optional[int],
        call_functions: List[CallFunction],
        chain_id: int,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        account_deployment_data: Optional[List[int]] = None,
    ) -> InvokeFunction:
        """
        Given a list of call functions to invoke and account identifiers
        (signer address, private key), prepares and signs an OpenZeppelin account multicall to this
        list of call functions.
        """
        multicall_calldata = cls.format_multicall_calldata(calls=call_functions)
        account_deployment_data = [] if account_deployment_data is None else account_deployment_data
        hash_value = calculate_invoke_transaction_hash(
            version=version,
            nonce=nonce,
            sender_address=sender_address,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=[] if paymaster_data is None else paymaster_data,
            calldata=multicall_calldata,
            account_deployment_data=account_deployment_data,
            chain_id=chain_id,
        )
        return InvokeFunction.create(
            version=version,
            signature=cls.sign_tx_hash(tx_hash=hash_value, private_key=private_key),
            nonce=nonce,
            resource_bounds=resource_bounds,
            sender_address=sender_address,
            calldata=multicall_calldata,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            tip=tip,
            paymaster_data=paymaster_data,
            account_deployment_data=account_deployment_data,
        )

    # Sign functions for deprecated transactions. Compatible transactions of version 1 and 2.

    @classmethod
    def sign_deprecated_declare_tx(
        cls,
        contract_class: ContractClass,
        private_key: Optional[int],
        sender_address: int,
        chain_id: int,
        compiled_class_hash: int,
        max_fee: int,
        version: int,
        nonce: int,
    ) -> DeprecatedDeclare:
        hash_value = deprecated_calculate_declare_transaction_hash(
            contract_class=contract_class,
            compiled_class_hash=compiled_class_hash,
            chain_id=chain_id,
            sender_address=sender_address,
            max_fee=max_fee,
            version=version,
            nonce=nonce,
        )

        return DeprecatedDeclare(
            contract_class=contract_class,
            compiled_class_hash=compiled_class_hash,
            sender_address=sender_address,
            max_fee=max_fee,
            signature=cls.sign_tx_hash(tx_hash=hash_value, private_key=private_key),
            nonce=nonce,
            version=version,
        )

    @classmethod
    def sign_old_declare_tx(
        cls,
        contract_class: DeprecatedCompiledClass,
        private_key: Optional[int],
        sender_address: int,
        chain_id: int,
        max_fee: int,
        version: int,
        nonce: int,
    ) -> DeprecatedOldDeclare:
        hash_value = deprecated_calculate_old_declare_transaction_hash(
            contract_class=contract_class,
            chain_id=chain_id,
            sender_address=sender_address,
            max_fee=max_fee,
            version=version,
            nonce=nonce,
        )

        return DeprecatedOldDeclare(
            contract_class=contract_class,
            sender_address=sender_address,
            max_fee=max_fee,
            signature=cls.sign_tx_hash(tx_hash=hash_value, private_key=private_key),
            nonce=nonce,
            version=version,
        )

    @classmethod
    def sign_deprecated_invoke_tx(
        cls,
        signer_address: int,
        private_key: Optional[int],
        call_function: CallFunction,
        chain_id: int,
        max_fee: int,
        version: int,
        nonce: int,
    ) -> DeprecatedInvokeFunction:
        """
        Given a function to invoke (contract address, selector, calldata) and account identifiers
        (signer address, private key) prepares and signs an OpenZeppelin account invocation to this
        function.
        """
        return cls.sign_deprecated_multicall_tx(
            signer_address=signer_address,
            private_key=private_key,
            call_functions=[call_function],
            chain_id=chain_id,
            max_fee=max_fee,
            version=version,
            nonce=nonce,
        )

    @classmethod
    def sign_deprecated_multicall_tx(
        cls,
        signer_address: int,
        private_key: Optional[int],
        call_functions: List[CallFunction],
        chain_id: int,
        max_fee: int,
        version: int,
        nonce: int,
    ) -> DeprecatedInvokeFunction:
        """
        Given a list of call functions to invoke and account identifiers
        (signer address, private key), prepares and signs an OpenZeppelin account multicall to this
        list of call functions.
        """
        multicall_calldata = cls.format_multicall_calldata(calls=call_functions)
        hash_value = deprecated_calculate_invoke_transaction_hash(
            version=version,
            sender_address=signer_address,
            entry_point_selector=None,
            calldata=multicall_calldata,
            max_fee=max_fee,
            chain_id=chain_id,
            nonce=nonce,
        )

        return DeprecatedInvokeFunction(
            sender_address=signer_address,
            calldata=multicall_calldata,
            max_fee=max_fee,
            nonce=nonce,
            signature=cls.sign_tx_hash(tx_hash=hash_value, private_key=private_key),
            version=version,
        )

    @classmethod
    def sign_deprecated_deploy_account_tx(
        cls,
        private_key: Optional[int],
        public_key: int,
        class_hash: int,
        salt: int,
        max_fee: int,
        version: int,
        chain_id: int,
    ) -> Tuple[int, DeprecatedDeployAccount]:
        contract_address = calculate_contract_address_from_hash(
            salt=salt,
            class_hash=class_hash,
            constructor_calldata=[public_key],
            deployer_address=0,
        )
        hash_value = deprecated_calculate_deploy_account_transaction_hash(
            contract_address=contract_address,
            class_hash=class_hash,
            constructor_calldata=[public_key],
            salt=salt,
            max_fee=max_fee,
            version=version,
            chain_id=chain_id,
            nonce=0,
        )

        return contract_address, DeprecatedDeployAccount(
            class_hash=class_hash,
            constructor_calldata=[public_key],
            contract_address_salt=salt,
            max_fee=max_fee,
            nonce=0,
            signature=cls.sign_tx_hash(tx_hash=hash_value, private_key=private_key),
            version=version,
        )

    @classmethod
    def calculate_contract_address_and_deploy_contract_calldata(
        cls,
        account_address: int,
        class_hash: int,
        constructor_calldata: List[int],
        deploy_from_zero: bool = False,
        salt: int = 0,
    ) -> Tuple[int, List[int]]:
        contract_address = calculate_contract_address_from_hash(
            salt=salt,
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            deployer_address=account_address,
        )
        deploy_from_zero_felt = 1 if deploy_from_zero else 0
        deploy_contract_calldata = [
            class_hash,
            salt,
            len(constructor_calldata),
            *constructor_calldata,
            deploy_from_zero_felt,
        ]
        return contract_address, deploy_contract_calldata

    @classmethod
    def sign_deploy_syscall_deprecated_tx(
        cls,
        account_address: int,
        class_hash: int,
        private_key: Optional[int],
        constructor_calldata: List[int],
        chain_id: int,
        max_fee: int,
        version: int,
        nonce: int,
        deploy_from_zero: bool = False,
        salt: int = 0,
    ) -> Tuple[int, DeprecatedInvokeFunction]:
        """
        Returns a signed external `DeprecatedInvokeFunction` object that deploys a contract
        by calling the account's `deploy_contract` function.
        """
        (
            contract_address,
            deploy_contract_calldata,
        ) = cls.calculate_contract_address_and_deploy_contract_calldata(
            account_address=account_address,
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            deploy_from_zero=deploy_from_zero,
            salt=salt,
        )
        deploy_tx = cls.sign_deprecated_invoke_tx(
            signer_address=account_address,
            private_key=private_key,
            call_function=CallFunction(
                contract_address=account_address,
                entry_point_selector=get_selector_from_name("deploy_contract"),
                calldata=deploy_contract_calldata,
            ),
            chain_id=chain_id,
            max_fee=max_fee,
            version=version,
            nonce=nonce,
        )
        return contract_address, deploy_tx

    @classmethod
    def sign_deploy_syscall_tx(
        cls,
        account_address: int,
        class_hash: int,
        private_key: Optional[int],
        constructor_calldata: List[int],
        chain_id: int,
        resource_bounds: fields.ResourceBoundsMapping,
        version: int,
        nonce: int,
        deploy_from_zero: bool = False,
        salt: int = 0,
    ) -> Tuple[int, InvokeFunction]:
        """
        Returns a signed external `InvokeFunction` object that deploys a contract
        by calling the account's `deploy_contract` function.
        """
        (
            contract_address,
            deploy_contract_calldata,
        ) = cls.calculate_contract_address_and_deploy_contract_calldata(
            account_address=account_address,
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            deploy_from_zero=deploy_from_zero,
            salt=salt,
        )
        deploy_tx = cls.sign_invoke_tx(
            sender_address=account_address,
            private_key=private_key,
            contract_address=account_address,
            selector=get_selector_from_name("deploy_contract"),
            calldata=deploy_contract_calldata,
            chain_id=chain_id,
            version=version,
            nonce=nonce,
            resource_bounds=resource_bounds,
        )
        return contract_address, deploy_tx


class EcdsaSignerBase(SignerBase):
    """
    Base class for signing transactions using ECDSA.
    """

    @classmethod
    def sign_tx_hash(
        cls,
        tx_hash: int,
        private_key: Optional[int],
        tx_type: Optional[TransactionType] = None,
        additional_data: Optional[List[int]] = None,
    ) -> List[int]:
        return [] if private_key is None else list(sign(msg_hash=tx_hash, priv_key=private_key))


class OpenZeppelinSigner(EcdsaSignerBase):
    """
    Contains signing logic for the OpenZeppelin Cairo 0 account contract.
    """

    @classmethod
    def format_multicall_calldata(cls, calls: List[CallFunction]) -> List[int]:
        call_array_len = len(calls)
        multicall_calldata = [call_array_len]
        data_offset = 0
        flat_calldata_list = []
        for call in calls:
            flat_calldata_list.extend(call.calldata)
            data_len = len(call.calldata)
            call_entry = [
                call.contract_address,
                call.entry_point_selector,
                data_offset,
                data_len,
            ]
            multicall_calldata.extend(call_entry)
            data_offset += data_len

        multicall_calldata.extend([len(flat_calldata_list), *flat_calldata_list])
        return multicall_calldata


class StandardSigner(EcdsaSignerBase):
    """
    Contains signing logic for the standard Cairo 1 account contract from the Cairo compiler repo.

    Assumes the following calldata format: `calls: Array<Call>`, where `Call` struct is
    struct Call {
        to: ContractAddress,
        selector: felt252,
        calldata: Array<felt252>
    }
    """

    @classmethod
    def format_multicall_calldata(cls, calls: List[CallFunction]) -> List[int]:
        multicall_calldata = [len(calls)]
        for call in calls:
            multicall_calldata += [
                call.contract_address,
                call.entry_point_selector,
                len(call.calldata),
                *call.calldata,
            ]

        return multicall_calldata


class TrivialSigner(SignerBase):
    """
    Trivial implementation for accounts without multicalls nor signature verfication.
    """

    @classmethod
    def sign_tx_hash(
        cls,
        tx_hash: int,
        private_key: Optional[int],
        tx_type: Optional[TransactionType] = None,
        additional_data: Optional[List[int]] = None,
    ) -> List[int]:
        assert private_key is None, "Sigining is not supproted for the TrivialSigner."
        return []

    @classmethod
    def format_multicall_calldata(cls, calls: List[CallFunction]) -> List[int]:
        assert len(calls) == 1, "Multicall is not supported for the TrivialSigner."
        (call,) = calls
        return [
            call.contract_address,
            call.entry_point_selector,
            len(call.calldata),
            *call.calldata,
        ]
