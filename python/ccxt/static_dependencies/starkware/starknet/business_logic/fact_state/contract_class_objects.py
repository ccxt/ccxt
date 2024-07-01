from dataclasses import field

import marshmallow_dataclass

from starkware.cairo.lang.vm.crypto import poseidon_hash_func
from starkware.python.utils import to_bytes
from starkware.starknet.core.os.contract_class.class_hash import compute_class_hash
from starkware.starknet.core.os.contract_class.compiled_class_hash import (
    compute_compiled_class_hash,
)
from starkware.starknet.core.os.contract_class.deprecated_class_hash import (
    compute_deprecated_class_hash,
)
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.constants import CONTRACT_CLASS_LEAF_VERSION
from starkware.starknet.services.api.contract_class.contract_class import (
    CompiledClass,
    ContractClass,
    DeprecatedCompiledClass,
)
from starkware.starkware_utils.commitment_tree.leaf_fact import LeafFact
from starkware.starkware_utils.commitment_tree.patricia_tree.nodes import EmptyNodeFact
from starkware.starkware_utils.validated_dataclass import ValidatedMarshmallowDataclass
from starkware.storage.storage import Fact, FactFetchingContext, HashFunctionType


def get_ffc_for_contract_class_facts(ffc: FactFetchingContext) -> FactFetchingContext:
    """
    Replaces the given FactFetchingContext object with a corresponding one used for·
    fetching contract class facts.
    """
    return FactFetchingContext(
        storage=ffc.storage, hash_func=poseidon_hash_func, n_workers=ffc.n_workers
    )


@marshmallow_dataclass.dataclass(frozen=True)
class ContractClassFact(ValidatedMarshmallowDataclass, Fact):
    """
    Represents a single contract class which is stored in the StarkNet state.
    """

    contract_class: ContractClass

    def _hash(self, hash_func: HashFunctionType) -> bytes:
        return to_bytes(compute_class_hash(contract_class=self.contract_class))


@marshmallow_dataclass.dataclass(frozen=True)
class CompiledClassFact(ValidatedMarshmallowDataclass, Fact):
    """
    Represents a single compiled contract class which is stored in the Starknet state.
    """

    compiled_class: CompiledClass

    def _hash(self, hash_func: HashFunctionType) -> bytes:
        return to_bytes(compute_compiled_class_hash(compiled_class=self.compiled_class))


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedCompiledClassFact(ValidatedMarshmallowDataclass, Fact):
    """
    Represents a single deprecated compiled contract class which is stored in the Starknet state.
    """

    contract_definition: DeprecatedCompiledClass

    def _hash(self, hash_func: HashFunctionType) -> bytes:
        return to_bytes(compute_deprecated_class_hash(contract_class=self.contract_definition))

    @classmethod
    def prefix(cls) -> bytes:
        """
        Overrides the prefix for backward compatibility.
        """
        return b"contract_definition_fact"


@marshmallow_dataclass.dataclass(frozen=True)
class ContractClassLeaf(ValidatedMarshmallowDataclass, LeafFact):
    """
    Represents a leaf in the Starknet contract class tree.
    """

    compiled_class_hash: int = field(metadata=fields.compiled_class_hash_metadata)

    @classmethod
    def create(cls, compiled_class_hash: int) -> "ContractClassLeaf":
        return cls(compiled_class_hash=compiled_class_hash)

    @classmethod
    def empty(cls) -> "ContractClassLeaf":
        return cls(compiled_class_hash=0)

    @property
    def is_empty(self) -> bool:
        return self.compiled_class_hash == 0

    def _hash(self, hash_func: HashFunctionType) -> bytes:
        """
        Computes the hash of the contract class leaf.
        """
        if self.is_empty:
            return EmptyNodeFact.EMPTY_NODE_HASH

        # Return H(CONTRACT_CLASS_LEAF_VERSION, compiled_class_hash).
        hash_value = hash_func(CONTRACT_CLASS_LEAF_VERSION, to_bytes(self.compiled_class_hash))

        return hash_value
