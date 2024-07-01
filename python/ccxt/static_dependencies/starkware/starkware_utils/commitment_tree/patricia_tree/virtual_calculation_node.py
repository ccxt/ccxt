import dataclasses
from typing import List, Optional

from starkware.starkware_utils.commitment_tree.binary_fact_tree import BinaryFactDict
from starkware.starkware_utils.commitment_tree.binary_fact_tree_node import read_node_fact
from starkware.starkware_utils.commitment_tree.calculation import (
    Calculation,
    CalculationNode,
    ConstantCalculation,
    HashCalculation,
    LeafFactCalculation,
    NodeFactDict,
)
from starkware.starkware_utils.commitment_tree.leaf_fact import LeafFact
from starkware.starkware_utils.commitment_tree.patricia_tree.nodes import (
    BinaryNodeFact,
    EdgeNodeFact,
    EmptyNodeFact,
    PatriciaNodeFact,
    verify_path_value,
)
from starkware.starkware_utils.commitment_tree.patricia_tree.virtual_patricia_node import (
    VirtualPatriciaNode,
)
from starkware.storage.storage import FactFetchingContext, HashFunctionType


@dataclasses.dataclass(frozen=True)
class BinaryCalculation(HashCalculation):
    left: HashCalculation
    right: HashCalculation

    def get_dependency_calculations(self) -> List[Calculation[bytes]]:
        return [self.left, self.right]

    def calculate(
        self,
        dependency_results: List[bytes],
        hash_func: HashFunctionType,
        fact_nodes: NodeFactDict,
    ) -> bytes:
        left_hash, right_hash = dependency_results
        fact = BinaryNodeFact(left_hash, right_hash)
        fact_hash = fact._hash(hash_func=hash_func)
        fact_nodes.inner_nodes[fact_hash] = fact
        return fact_hash


@dataclasses.dataclass(frozen=True)
class EdgeCalculation(HashCalculation):
    bottom: HashCalculation
    path: int
    length: int

    def get_dependency_calculations(self) -> List[Calculation[bytes]]:
        return [self.bottom]

    def calculate(
        self,
        dependency_results: List[bytes],
        hash_func: HashFunctionType,
        fact_nodes: NodeFactDict,
    ) -> bytes:
        (bottom_hash,) = dependency_results
        fact = EdgeNodeFact(bottom_node=bottom_hash, edge_path=self.path, edge_length=self.length)
        fact_hash = fact._hash(hash_func=hash_func)
        fact_nodes.inner_nodes[fact_hash] = fact
        return fact_hash


# NOTE: We avoid using ValidatedDataclass here for performance.
@dataclasses.dataclass(frozen=True)
class VirtualCalculationNode(CalculationNode[VirtualPatriciaNode]):
    """
    Represents a virtual calculation node. It consists a bottom calculation and a virtual edge that
    can be empty (and then the calculation just represents the bottom calculation).
    The main purpose of this class is to maintain the information of the virtual edge while it's
    uncertain what its length will be, and then create an EdgeCalculation from it and store it in
    the bottom calculation when the length becomes certain.
    """

    bottom_calculation: HashCalculation
    path: int
    length: int

    # The height of the subtree rooted at this node.
    # In other words, this is the length of the path from this node to the leaves.
    height: int

    def __post_init__(self):
        """
        Performs validations on the constructed object.
        Note that many of the functions in this class rely on the invariants checked in this
        function, and on the fact they are made at initialization time (the object is immutable).
        """
        verify_path_value(path=self.path, length=self.length)

    @classmethod
    def create_from_node(cls, node: VirtualPatriciaNode):
        if node.is_empty:
            return cls.empty_node(height=node.height)

        return cls(
            bottom_calculation=ConstantCalculation(value=node.bottom_node),
            path=node.path,
            length=node.length,
            height=node.height,
        )

    @classmethod
    def create_from_fact(cls, fact: LeafFact):
        return cls(bottom_calculation=LeafFactCalculation(fact=fact), path=0, length=0, height=0)

    @classmethod
    def empty_node(cls, height: int) -> "VirtualCalculationNode":
        return cls(
            bottom_calculation=ConstantCalculation(EmptyNodeFact.EMPTY_NODE_HASH),
            path=0,
            length=0,
            height=height,
        )

    @property
    def is_empty(self) -> bool:
        # NOTE: we compare directly the values (instead of comparing objects) for performance.
        if isinstance(self.bottom_calculation, ConstantCalculation):
            return self.bottom_calculation.value == EmptyNodeFact.EMPTY_NODE_HASH

        if isinstance(self.bottom_calculation, LeafFactCalculation):
            return self.bottom_calculation.fact.is_empty

        return False

    @property
    def is_virtual_edge(self) -> bool:
        return self.length != 0

    @property
    def is_leaf(self) -> bool:
        return self.height == 0

    def get_dependency_calculations(self) -> List[Calculation[bytes]]:
        return self.bottom_calculation.get_dependency_calculations()

    def calculate(
        self,
        dependency_results: List[bytes],
        hash_func: HashFunctionType,
        fact_nodes: NodeFactDict,
    ) -> VirtualPatriciaNode:
        bottom_hash = self.bottom_calculation.calculate(
            dependency_results=dependency_results, hash_func=hash_func, fact_nodes=fact_nodes
        )
        return VirtualPatriciaNode(
            bottom_node=bottom_hash, path=self.path, length=self.length, height=self.height
        )

    @classmethod
    async def combine(
        cls,
        ffc: FactFetchingContext,
        left: "VirtualCalculationNode",
        right: "VirtualCalculationNode",
        facts: Optional[BinaryFactDict],
    ) -> "VirtualCalculationNode":
        """
        Gets two VirtualCalculationNode objects left and right representing children nodes, and
        builds their parent node. Returns a new VirtualCalculationNode.

        If facts argument is not None, this dictionary is filled with facts read from the DB.
        """
        assert right.height == left.height, (
            "Only trees of same height can be combined; "
            f"got: left={left.height} right={right.height}."
        )

        parent_height = right.height + 1
        if left.is_empty and right.is_empty:
            return cls.empty_node(height=parent_height)

        if not left.is_empty and not right.is_empty:
            return cls._combine_to_binary_node(left=left, right=right)

        return await cls._combine_to_virtual_edge_node(ffc=ffc, left=left, right=right, facts=facts)

    # Internal utils.

    @classmethod
    def _combine_to_binary_node(
        cls,
        left: "VirtualCalculationNode",
        right: "VirtualCalculationNode",
    ) -> "VirtualCalculationNode":
        """
        Combines two non-empty nodes to form a binary node.
        """
        return VirtualCalculationNode(
            bottom_calculation=BinaryCalculation(left=left._commit(), right=right._commit()),
            path=0,
            length=0,
            height=right.height + 1,
        )

    @classmethod
    async def _combine_to_virtual_edge_node(
        cls,
        ffc: FactFetchingContext,
        left: "VirtualCalculationNode",
        right: "VirtualCalculationNode",
        facts: Optional[BinaryFactDict],
    ) -> "VirtualCalculationNode":
        """
        Combines an empty node and a non-empty node to form a virtual edge node.
        If the non-empty node is an edge, enter that edge into the parent virtual edge and extend it
        by 1. If not, create a new virtual edge of length 1.
        """
        assert (
            left.is_empty != right.is_empty
        ), "_combine_to_virtual_edge_node() must be called on one empty and one non-empty nodes."

        non_empty_child = right if left.is_empty else left
        non_empty_child = await non_empty_child._decommit(ffc=ffc, facts=facts)

        parent_path = non_empty_child.path
        if left.is_empty:
            # Turn on the MSB bit if the non-empty child is on the right.
            parent_path += 1 << non_empty_child.length

        return VirtualCalculationNode(
            bottom_calculation=non_empty_child.bottom_calculation,
            path=parent_path,
            length=non_empty_child.length + 1,
            height=non_empty_child.height + 1,
        )

    async def _decommit(
        self, ffc: FactFetchingContext, facts: Optional[BinaryFactDict]
    ) -> "VirtualCalculationNode":
        """
        Converts self into a virtual edge. Transfer any edge that exists in the bottom calculation
        to the virtual edge. If the bottom calculation is a constant calculation, read its fact
        from the DB to check if it's an edge.
        """
        if self.is_leaf or self.is_empty or self.is_virtual_edge:
            # Node is already decommitted (of canonical form); no work to be done (We assume that
            # in this case the bottom calculation doensn't contain an edge).
            return self

        # Check if the bottom calculation represents an edge.
        if isinstance(self.bottom_calculation, EdgeCalculation):
            # Moving the edge of bottom_calculation into the virtual edge.
            return VirtualCalculationNode(
                bottom_calculation=self.bottom_calculation.bottom,
                path=self.bottom_calculation.path,
                length=self.bottom_calculation.length,
                height=self.height,
            )
        if isinstance(self.bottom_calculation, ConstantCalculation):
            # Need to read fact from storage to understand if it contains an edge.
            bottom_fact = await read_node_fact(
                ffc=ffc,
                inner_node_fact_cls=PatriciaNodeFact,  # type: ignore
                fact_hash=self.bottom_calculation.value,
                facts=facts,
            )
            if isinstance(bottom_fact, EdgeNodeFact):
                # Moving the edge of the fact into the virtual edge.
                return VirtualCalculationNode(
                    bottom_calculation=ConstantCalculation(value=bottom_fact.bottom_node),
                    path=bottom_fact.edge_path,
                    length=bottom_fact.edge_length,
                    height=self.height,
                )

        return self

    def _commit(self) -> HashCalculation:
        """
        Converts self into a non-virtual calculation. Enters the virtual edge (if it exists) into
        the resulting calculation.
        """
        if not self.is_virtual_edge:
            # Node is already of form (hash, 0, 0); no work to be done.
            return self.bottom_calculation

        return EdgeCalculation(bottom=self.bottom_calculation, path=self.path, length=self.length)
