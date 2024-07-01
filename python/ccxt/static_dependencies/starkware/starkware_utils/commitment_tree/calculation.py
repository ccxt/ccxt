import asyncio
import dataclasses
import itertools
from abc import ABC, abstractmethod
from concurrent.futures import Executor
from typing import Any, Dict, Generic, Iterable, List, Optional, Tuple, Type, TypeVar

from starkware.starkware_utils.commitment_tree.binary_fact_tree import BinaryFactDict
from starkware.starkware_utils.commitment_tree.binary_fact_tree_node import (
    BinaryFactDict,
    TBinaryFactTreeNode,
)
from starkware.starkware_utils.commitment_tree.inner_node_fact import InnerNodeFact
from starkware.starkware_utils.commitment_tree.leaf_fact import LeafFact
from starkware.storage.storage import Fact, FactFetchingContext, HashFunctionType

T = TypeVar("T")
TCalculationNode = TypeVar("TCalculationNode", bound="CalculationNode")


@dataclasses.dataclass
class NodeFactDict:
    """
    A mapping between a hash and its corresponding fact. Split into two maps, one for leaves and
    one for inner nodes.
    """

    inner_nodes: Dict[bytes, InnerNodeFact] = dataclasses.field(default_factory=dict)
    leaves: Dict[bytes, LeafFact] = dataclasses.field(default_factory=dict)

    def update(self, other: "NodeFactDict"):
        self.inner_nodes.update(other.inner_nodes)
        self.leaves.update(other.leaves)

    def items(self) -> Iterable[Tuple[bytes, Fact]]:
        return itertools.chain(self.inner_nodes.items(), self.leaves.items())


class Calculation(Generic[T], ABC):
    """
    A calculation that can produce a result of type T. The calculation is dependent on the results
    of other calculations. Those calculations can be of type other than T.
    The result of the calculation can be produced when the results of the dependency calculations
    are given.
    """

    @abstractmethod
    def get_dependency_calculations(self) -> List["Calculation"]:
        """
        Returns a list of the calculations that this calculation depends on.
        """

    @abstractmethod
    def calculate(
        self,
        dependency_results: List[Any],
        hash_func: HashFunctionType,
        fact_nodes: NodeFactDict,
    ) -> T:
        """
        Produces the result of this calculation, given a list of results for the dependency
        calculations. The order of dependency_results should match the order of the list returned by
        get_dependency_calculations.

        The calculation might need to calculate hashes along the way. It will use hash_func for
        that.

        Any facts generated during the calculation will be saved in fact_nodes
        (using their hash as the key).
        """

    def calculate_new_fact_nodes(
        self,
        dependency_results: List[Any],
        hash_func: HashFunctionType,
    ) -> Tuple[T, NodeFactDict]:
        """
        Same as calculate(), but return the facts.
        """
        fact_nodes = NodeFactDict()
        result = self.calculate(
            dependency_results=dependency_results, hash_func=hash_func, fact_nodes=fact_nodes
        )
        return result, fact_nodes

    def full_calculate(
        self,
        hash_func: HashFunctionType,
        fact_nodes: NodeFactDict,
    ) -> T:
        """
        Produces the result of this calculation.

        Recursively calcuates the result of the dependency calculations.

        Any facts generated during the calculation will be saved in fact_nodes
        (using their hash as the key).
        """
        dependency_results: List[Any] = [
            dependency_calculation.full_calculate(fact_nodes=fact_nodes, hash_func=hash_func)
            for dependency_calculation in self.get_dependency_calculations()
        ]

        return self.calculate(
            dependency_results=dependency_results, hash_func=hash_func, fact_nodes=fact_nodes
        )

    def full_calculate_new_fact_nodes(
        self,
        hash_func: HashFunctionType,
    ) -> Tuple[T, NodeFactDict]:
        """
        Produces the result of this calculation. Returns the result and a dict containing generated
        facts.

        Recursively calcuates the result of the dependency calculations.
        """
        fact_nodes = NodeFactDict()
        result = self.full_calculate(hash_func=hash_func, fact_nodes=fact_nodes)
        return result, fact_nodes

    async def full_calculate_with_executor(
        self,
        executor: Optional[Executor],
        hash_func: HashFunctionType,
        fact_nodes: NodeFactDict,
        depth: int,
    ) -> T:
        """
        Produces the result of this calculation.

        Gets the dependency calculations at the layer that is `depth` layers from the current node.
        Distributes those calculations using the executor.

        Any facts generated during the calculation will be saved in fact_nodes
        (using their hash as the key).
        """
        if depth == 0:
            # We can't use full_calculate here due to thread-safety issues.
            result, sub_facts = await asyncio.get_event_loop().run_in_executor(
                executor, self.full_calculate_new_fact_nodes, hash_func
            )
            fact_nodes.update(sub_facts)
            return result

        dependency_results = await asyncio.gather(
            *[
                dependency_calculation.full_calculate_with_executor(
                    executor=executor, hash_func=hash_func, fact_nodes=fact_nodes, depth=depth - 1
                )
                for dependency_calculation in self.get_dependency_calculations()
            ]
        )
        # We can't use full_calculate here due to thread-safety issues.
        result, sub_facts = await asyncio.get_event_loop().run_in_executor(
            executor, self.calculate_new_fact_nodes, dependency_results, hash_func
        )
        fact_nodes.update(sub_facts)
        return result


# NOTE: We avoid using ValidatedDataclass here for performance.
@dataclasses.dataclass(frozen=True)
class ConstantCalculation(Calculation[T]):
    """
    A calculation that contains a value and simply produces it. It doesn't depend on any other
    calculations.
    """

    value: T

    def calculate(
        self,
        dependency_results: list,
        hash_func: HashFunctionType,
        fact_nodes: NodeFactDict,
    ) -> T:
        assert len(dependency_results) == 0, "ConstantCalculation has no dependencies."
        return self.value

    def get_dependency_calculations(self) -> List[Calculation[T]]:
        return []


# A calculation that produces a hash result.
HashCalculation = Calculation[bytes]


# NOTE: We avoid using ValidatedDataclass here for performance.
@dataclasses.dataclass(frozen=True)
class LeafFactCalculation(HashCalculation):
    """
    A calculation that contains a LeafFact and produces its hash. It doesn't depend on any other
    calculations.
    """

    fact: LeafFact

    def calculate(
        self,
        dependency_results: list,
        hash_func: HashFunctionType,
        fact_nodes: NodeFactDict,
    ) -> bytes:
        assert len(dependency_results) == 0, "LeafFactCalculation has no dependencies."
        hash_result = self.fact._hash(hash_func=hash_func)
        fact_nodes.leaves[hash_result] = self.fact
        return hash_result

    def get_dependency_calculations(self) -> List[Calculation[bytes]]:
        return []


class CalculationNode(Calculation[TBinaryFactTreeNode], ABC):
    """
    A calculation that produces a BinaryFactTreeNode. The calculation can be created from either a
    node or from a combination of two other calculations of the same type.
    """

    @classmethod
    @abstractmethod
    async def combine(
        cls: Type[TCalculationNode],
        ffc: FactFetchingContext,
        left: TCalculationNode,
        right: TCalculationNode,
        facts: Optional[BinaryFactDict],
    ) -> TCalculationNode:
        """
        Combines two calculations into a calculation that its children are the given calculations.
        The function might need to read facts from the DB using FFC.
        If so, and if facts argument is not None, facts is filled with the facts read.
        """

    @classmethod
    @abstractmethod
    def create_from_node(
        cls: Type[TCalculationNode], node: TBinaryFactTreeNode
    ) -> TCalculationNode:
        """
        Creates a Calculation object from a node. It will produce the node and will have no
        dependencies.
        This will be used in order to create calculations that represent unchanged subtrees.
        """

    @classmethod
    @abstractmethod
    def create_from_fact(cls: Type[TCalculationNode], fact: LeafFact) -> TCalculationNode:
        """
        Creates a Calculation object from a fact. It will calculate the fact's hash and produce a
        node with the hash result. It will have no dependencies.
        This will be used in order to create calculations that represent changed leaves.
        """
