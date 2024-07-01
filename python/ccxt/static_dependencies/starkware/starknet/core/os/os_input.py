import dataclasses
from dataclasses import field
from typing import Any, Dict, List, Sequence

import marshmallow.fields as mfields
import marshmallow_dataclass

from starkware.starknet.business_logic.fact_state.contract_state_objects import ContractState
from starkware.starknet.business_logic.transaction.internal_transaction_schema import (
    InternalTransactionSchema,
)
from starkware.starknet.business_logic.transaction.objects import InternalTransaction
from starkware.starknet.core.os.deprecated_syscall_handler import DeprecatedOsSysCallHandler
from starkware.starknet.core.os.syscall_handler import OsExecutionHelper, OsSyscallHandler
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.general_config import StarknetGeneralConfig
from starkware.starknet.services.api.contract_class.contract_class import (
    CompiledClass,
    DeprecatedCompiledClass,
)
from starkware.starknet.storage.starknet_storage import CommitmentInfo
from starkware.starkware_utils.validated_dataclass import (
    ValidatedDataclass,
    ValidatedMarshmallowDataclass,
)


@marshmallow_dataclass.dataclass(frozen=True)
class StarknetOsInput(ValidatedMarshmallowDataclass):
    contract_state_commitment_info: CommitmentInfo
    contract_class_commitment_info: CommitmentInfo
    deprecated_compiled_classes: Dict[int, DeprecatedCompiledClass] = field(
        metadata=fields.new_class_hash_dict_keys_metadata(
            values_schema=DeprecatedCompiledClass.Schema
        )
    )
    compiled_classes: Dict[int, CompiledClass] = field(
        metadata=fields.new_class_hash_dict_keys_metadata(values_schema=CompiledClass.Schema)
    )
    compiled_class_visited_pcs: Dict[int, List[int]]
    contracts: Dict[int, ContractState]
    class_hash_to_compiled_class_hash: Dict[int, int]
    general_config: StarknetGeneralConfig
    transactions: Sequence[InternalTransaction] = field(
        metadata=dict(marshmallow_field=mfields.List(mfields.Nested(InternalTransactionSchema)))
    )
    block_hash: int


@dataclasses.dataclass(frozen=True)
class OsHints(ValidatedDataclass):
    os_input: StarknetOsInput
    execution_helper: OsExecutionHelper
    deprecated_syscall_handler: DeprecatedOsSysCallHandler
    syscall_handler: OsSyscallHandler

    def to_dict(self) -> Dict[str, Any]:
        return {
            "program_input": self.os_input.dump(),
            "execution_helper": self.execution_helper,
            "deprecated_syscall_handler": self.deprecated_syscall_handler,
            "syscall_handler": self.syscall_handler,
            "storage_by_address": self.execution_helper.storage_by_address,
        }
