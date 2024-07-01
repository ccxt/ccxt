import dataclasses
from bisect import bisect_left, bisect_right
from typing import Collection, Dict, List, Optional, Tuple

from starkware.python.utils import process_concurrently, safe_zip
from starkware.starkware_utils.commitment_tree.binary_fact_tree import TLeafFact
from starkware.starkware_utils.commitment_tree.patricia_tree.nodes import (
    BinaryNodeFact,
    EdgeNodeFact,
    EmptyNodeFact,
    PatriciaNodeFact,
    deserialize_edge,
    hash_edge,
    serialize_edge,
)
from starkware.storage.storage import HASH_BYTES, FactFetchingContext, HashFunctionType

# Utility classes.


@dataclasses.dataclass(frozen=True)
class Node:
    """
    Represents an edge node.
    When length=0, it is used to represent a non-edge node:
      * value=None: binary.
      * value!=None: depends on the height. May represent a leaf (height 0) or a binary node that
      has no updates (but is probably a sibiling of a modified node so its hash is required).
    """

    path: int
    length: int
    value: Optional[bytes]

    @classmethod
    def from_value(cls, value: Optional[bytes]) -> "Node":
        return cls(path=0, length=0, value=value)

    @property
    def is_edge(self) -> bool:
        return self.length > 0

    @property
    def is_binary(self) -> bool:
        return self.value is None and self.length == 0

    @property
    def is_empty(self) -> bool:
        return self.value == EmptyNodeFact.EMPTY_NODE_HASH


IndexedNode = Tuple[int, Node]
LayeredNode = Tuple[int, Node]
Facts = Dict[bytes, bytes]

EMPTY_NODE = Node.from_value(value=EmptyNodeFact.EMPTY_NODE_HASH)
BINARY_NODE = Node.from_value(value=None)


@dataclasses.dataclass
class TreeContext:
    """
    Context for fetching nodes and updating tree structure.
    """

    height: int
    # Index to leaf hash update.
    leaves: Dict[int, bytes]

    # Should be filled with required nodes from the previous tree and the updated leaves.
    prefetched_nodes: Dict[int, Node]
    # Updated nodes, grouped and ordered by dependency.
    nodes_by_dependency_layers: List[List[IndexedNode]]
    ffc: FactFetchingContext

    @classmethod
    def create(
        cls, height: int, leaves: Dict[int, bytes], ffc: FactFetchingContext
    ) -> "TreeContext":
        return cls(
            height=height,
            leaves=leaves,
            prefetched_nodes={},
            nodes_by_dependency_layers=[],
            ffc=ffc,
        )

    def get_node_height(self, index: int) -> int:
        return self.height - index.bit_length() + 1

    def set_updated_node(self, index: int, layered_node: LayeredNode):
        layer, node = layered_node
        if len(self.nodes_by_dependency_layers) == layer:
            self.nodes_by_dependency_layers.append([])

        self.nodes_by_dependency_layers[layer].append((index, node))


@dataclasses.dataclass(frozen=True)
class SubTree:
    index: int
    root_hash: bytes
    leaf_indices: List[int]

    def set_leaf(self, context: TreeContext):
        """
        Assumes the subtree represents a leaf; creates a corresponding Node object and sets it.
        """
        if len(self.leaf_indices) == 0:
            # Leaf sibiling.
            value = self.root_hash
        else:
            (leaf_index,) = self.leaf_indices
            assert self.index == leaf_index
            value = context.leaves[leaf_index]

        context.prefetched_nodes[self.index] = (
            EMPTY_NODE if value == EmptyNodeFact.EMPTY_NODE_HASH else Node.from_value(value=value)
        )


# Hash calculation.


async def calculate_inner_node_facts(
    nodes_by_dependency_layer: List[List[IndexedNode]], hash_func: HashFunctionType, n_workers: int
) -> Tuple[bytes, Facts]:
    """
    Calculates the facts corresponding to the given nodes.
    Returns the new root hash and the facts of the updated inner nodes
    (leaf facts should be added separatly).
    """
    inner_node_facts: Facts = {}
    index_to_hash: Dict[int, bytes] = {}

    def calculate_fact(indexed_node: IndexedNode):
        index, node = indexed_node
        # Used as the basis for the db_key of the fact.
        node_hash: bytes
        # Used as the value of the fact (equals `None` when the fact is not to be set).
        serialized_node_value: Optional[bytes]
        if node.is_binary:
            left, right = index_to_hash[(left_index := index << 1)], index_to_hash[left_index ^ 1]
            node_hash = hash_func(left, right)
            serialized_node_value = left + right
        elif node.is_edge:
            if node.value is not None:
                # Edge holds the bottom hash value.
                bottom = node.value
            else:
                # Indirection.
                bottom_index = (index << node.length) | node.path
                bottom = index_to_hash[bottom_index]

            node_hash = hash_edge(
                bottom=bottom, path=node.path, length=node.length, hash_func=hash_func
            )
            serialized_node_value = serialize_edge(
                bottom=bottom, path=node.path, length=node.length
            )
        else:
            assert node.length == 0 and node.value is not None
            # Either a leaf or an unchanged node - the hash is the value itself and there's no need
            # to set the fact: leaf facts are set elsewhere, and unchanged node facts are not set.
            node_hash = node.value
            serialized_node_value = None

        index_to_hash[index] = node_hash
        if serialized_node_value is not None:
            inner_node_facts[PatriciaNodeFact.db_key(suffix=node_hash)] = serialized_node_value

    for nodes in nodes_by_dependency_layer:
        # Calculate layer facts with threads (assuming the hash function does not take the GIL).
        # Note that `caclculate_hash` is not suitable for multi-processing.
        await process_concurrently(func=calculate_fact, items=nodes, n_chunks=n_workers)

    return index_to_hash[1], inner_node_facts


# Traversal logic.


async def update_structure(
    height: int, root: bytes, leaves: Dict[int, bytes], ffc: FactFetchingContext
) -> List[List[IndexedNode]]:
    """
    Builds the updated tree structure, formed by applying the given leaf updates.
    Returns a representation of the updated nodes, from which the actual facts can be derived.
    The nodes are ordered and grouped by dependency, i.e., nodes may only have descendants in
    previous layers.
    Assumes the given list of indices is not empty.
    """
    assert len(leaves) > 0, "Empty leaf list."
    assert height > 0, "Non-positive height is not supported."
    context = TreeContext.create(height=height, leaves=leaves, ffc=ffc)
    leaf_indices = sorted(leaves.keys())

    # Update leaf nodes.
    context.prefetched_nodes.update(
        [(index, Node.from_value(value=context.leaves[index])) for index in leaf_indices]
    )
    if root == EmptyNodeFact.EMPTY_NODE_HASH:
        root_node = update_empty_node(index=1, leaf_indices=leaf_indices, context=context)
    else:
        # The tree is not empty; pre-fetch all required nodes from storage.
        await fetch_nodes(
            subtrees=[SubTree(index=1, root_hash=root, leaf_indices=leaf_indices)], context=context
        )
        root_node = update_nonempty_node(
            index=1, node=context.prefetched_nodes[1], leaf_indices=leaf_indices, context=context
        )

    # Set the updated root.
    context.set_updated_node(index=1, layered_node=root_node)

    return context.nodes_by_dependency_layers


async def fetch_nodes(subtrees: List[SubTree], context: TreeContext):
    """
    Given a list of subtrees, traverses towards their leaves and fetches all non-empty and sibiling
    nodes. Assumes no subtrees of height 0 (leaves).
    """
    if len(subtrees) == 0:
        return

    # Read DB nodes.
    serialized_node_values = await context.ffc.storage.mget_or_fail(
        keys=[PatriciaNodeFact.db_key(suffix=subtree.root_hash) for subtree in subtrees]
    )

    # Update nodes and build next layer.
    next_subtrees: List[SubTree] = []
    for subtree, value in safe_zip(subtrees, serialized_node_values):
        height = context.get_node_height(index=subtree.index)
        if len(value) == BinaryNodeFact.PREIMAGE_LENGTH:
            # Binary.
            if len(subtree.leaf_indices) == 0:
                # Sibiling - no need to open its children.
                context.prefetched_nodes[subtree.index] = Node.from_value(value=subtree.root_hash)
                continue

            # Update.
            context.prefetched_nodes[subtree.index] = BINARY_NODE
            # Parse children.
            left_hash, right_hash = value[:HASH_BYTES], value[HASH_BYTES:]
            left_leaves, right_leaves = split_leaves(
                root_index=subtree.index, root_height=height, leaf_indices=subtree.leaf_indices
            )
            left_subtree = SubTree(
                index=(left_index := subtree.index << 1),
                root_hash=left_hash,
                leaf_indices=left_leaves,
            )
            right_subtree = SubTree(
                index=left_index | 1, root_hash=right_hash, leaf_indices=right_leaves
            )
            if height - 1 == 0:
                # Children are leaves.
                left_subtree.set_leaf(context=context)
                right_subtree.set_leaf(context=context)
                continue

            next_subtrees += [left_subtree, right_subtree]

        else:
            assert len(value) == EdgeNodeFact.PREIMAGE_LENGTH
            # Update.
            bottom_hash, path, length = deserialize_edge(data=value)
            context.prefetched_nodes[subtree.index] = Node(
                path=path, length=length, value=bottom_hash
            )
            if len(subtree.leaf_indices) == 0:
                # Sibiling - no need to open its bottom.
                # Note that unlike binary sibiling, an edge sibiling may be modified (if its brother
                # becomes empty).
                continue

            # Parse bottom.
            bottom_index = (subtree.index << length) | path
            bottom_height = height - length
            leftmost_in_subtree = bottom_index << bottom_height
            rightmost_in_subtree = leftmost_in_subtree + (1 << bottom_height) - 1
            bottom_leaves = subtree.leaf_indices[
                bisect_left(subtree.leaf_indices, leftmost_in_subtree) : bisect_right(
                    subtree.leaf_indices, rightmost_in_subtree
                )
            ]
            bottom_subtree = SubTree(
                index=bottom_index, root_hash=bottom_hash, leaf_indices=bottom_leaves
            )
            if bottom_height == 0:
                # Bottom is a leaf.
                bottom_subtree.set_leaf(context=context)
                continue

            next_subtrees.append(bottom_subtree)

    await fetch_nodes(subtrees=next_subtrees, context=context)


def update_nonempty_node(
    index: int, node: Node, leaf_indices: List[int], context: TreeContext
) -> LayeredNode:
    """
    Updates the Patricia tree rooted at the given index, with the given leaves; returns the root.
    Assumes the given list of indices is sorted.
    """
    height = context.get_node_height(index=index)
    if len(leaf_indices) == 0:
        # Sibiling of an updated node.
        assert node.value is not None, "Sibling has no value."
        return 0, node
    if height == 0:
        # Leaf.
        (leaf_index,) = leaf_indices
        assert index == leaf_index, "Leaf index mismatch."
        return 0, context.prefetched_nodes[index]

    if node.is_binary:
        left_indices, right_indices = split_leaves(
            root_index=index, root_height=height, leaf_indices=leaf_indices
        )
        left = update_nonempty_node(
            index=(left_index := index << 1),
            node=context.prefetched_nodes[left_index],
            leaf_indices=left_indices,
            context=context,
        )
        right = update_nonempty_node(
            index=(right_index := left_index | 1),
            node=context.prefetched_nodes[right_index],
            leaf_indices=right_indices,
            context=context,
        )
        return construct_binary_node(index=index, left=left, right=right, context=context)

    assert node.is_edge, f"Unrecognized node format: {node}."
    return update_edge_node(index=index, node=node, leaf_indices=leaf_indices, context=context)


def update_edge_node(
    index: int, node: Node, leaf_indices: List[int], context: TreeContext
) -> LayeredNode:
    """
    Handles edge node.
    """
    height = context.get_node_height(index=index)
    edge_direction = node.path >> (node.length - 1)
    has_leaves_on_empty_child = has_leaves_on_child_side(
        root_height=height, child_direction=edge_direction ^ 1, leaf_indices=leaf_indices
    )
    if has_leaves_on_empty_child:
        left_indices, right_indices = split_leaves(
            root_index=index, root_height=height, leaf_indices=leaf_indices
        )
        edge_leaves, empty_tree_leaves = (
            (left_indices, right_indices) if edge_direction == 0 else (right_indices, left_indices)
        )
        edge_child = update_nonempty_node(
            index=(edge_child_index := (index << 1) | edge_direction),
            node=get_edge_or_prefetched_node(
                index=edge_child_index,
                node=Node(
                    path=get_suffix(path=node.path, n=node.length - 1),
                    length=node.length - 1,
                    value=node.value,
                ),
                context=context,
            ),
            leaf_indices=edge_leaves,
            context=context,
        )
        empty_child = update_empty_node(
            index=edge_child_index ^ 1, leaf_indices=empty_tree_leaves, context=context
        )
        left, right = (
            (edge_child, empty_child) if edge_direction == 0 else (empty_child, edge_child)
        )

        return construct_binary_node(index=index, left=left, right=right, context=context)

    # All leaves are on the edge's direction - they have a non-trivial common path with the edge.
    path_to_leaf_lca_length, path_to_leaf_lca = get_path_to_lca(
        root_index=index, root_height=height, leaf_indices=leaf_indices
    )

    # Calculate the common prefix of the edge path and the leaf LCA path.
    # The result (`edge_prefix`) is the path from the index to the LCA of the leaves and bottom.
    # The remaining (`edge_suffix`) is the path from the above to the bottom.

    # A walk-through example: path_to_leaf_lca=01101, path_to_bottom=011100100.

    # Align leaf LCA path with edge path.
    # path_to_leaf_lca=011010000, path_to_bottom=011100100.
    path_to_leaf_lca >>= max(0, path_to_leaf_lca_length - node.length)
    path_to_leaf_lca <<= max(0, node.length - path_to_leaf_lca_length)

    # Split the edge path: common prefix with leaf LCA path, and the remaining suffix.
    # edge_suffix_length=(011010000 ^ 011100100).bit_length() = 000110100.bit_length() = 6.
    edge_suffix_length = (path_to_leaf_lca ^ node.path).bit_length()
    edge_suffix_length = max(edge_suffix_length, node.length - path_to_leaf_lca_length)
    # edge_prefix=011, edge_suffix=100100.
    edge_suffix = get_suffix(path=node.path, n=edge_suffix_length)
    edge_prefix = node.path >> edge_suffix_length
    edge_prefix_length = node.length - edge_suffix_length
    bottom_index = (index << edge_prefix_length) | edge_prefix
    bottom = update_nonempty_node(
        index=bottom_index,
        node=get_edge_or_prefetched_node(
            index=bottom_index,
            node=Node(path=edge_suffix, length=edge_suffix_length, value=node.value),
            context=context,
        ),
        leaf_indices=leaf_indices,
        context=context,
    )

    return construct_edge_node(
        path=edge_prefix,
        length=edge_prefix_length,
        bottom_index=bottom_index,
        bottom=bottom,
        context=context,
    )


def get_edge_or_prefetched_node(index: int, node: Node, context: TreeContext) -> Node:
    if node.is_edge:
        return node

    # Indirection to the prefetched bottom node.
    return context.prefetched_nodes[index]


def update_empty_node(index: int, leaf_indices: List[int], context: TreeContext) -> LayeredNode:
    """
    Builds a Patricia tree, rooted at the given index, from the given leaves; returns the root.
    Assumes the given list of indices is sorted and not empty.
    """
    height = context.get_node_height(index=index)
    if height == 0:
        # Leaf.
        (leaf_index,) = leaf_indices
        assert leaf_index == index, "Leaf mismatch."
        return 0, context.prefetched_nodes[index]

    if has_leaves_on_both_sides(root_height=height, leaf_indices=leaf_indices):
        # Binary.
        left_indices, right_indices = split_leaves(
            root_index=index, root_height=height, leaf_indices=leaf_indices
        )
        left = update_empty_node(
            index=(left_index := index << 1), leaf_indices=left_indices, context=context
        )
        right = update_empty_node(index=left_index | 1, leaf_indices=right_indices, context=context)
        return construct_binary_node(index=index, left=left, right=right, context=context)

    # Edge.
    path_to_lca_length, path_to_lca = get_path_to_lca(
        root_index=index, root_height=height, leaf_indices=leaf_indices
    )
    bottom_index = (index << path_to_lca_length) + path_to_lca
    bottom = update_empty_node(index=bottom_index, leaf_indices=leaf_indices, context=context)
    return construct_edge_node(
        path=path_to_lca,
        length=path_to_lca_length,
        bottom_index=bottom_index,
        bottom=bottom,
        context=context,
    )


def construct_binary_node(
    index: int, left: LayeredNode, right: LayeredNode, context: TreeContext
) -> LayeredNode:
    """
    Builds a (probably binary) node from its two children. Note that the resulting node may not
    be binary if one or more children are empty.
    """
    left_index, (left_layer, left_node) = index << 1, left
    right_index, (right_layer, right_node) = left_index | 1, right

    if not left_node.is_empty and not right_node.is_empty:
        # Binary; finalize children (a binary node cannot change form).
        context.set_updated_node(index=left_index, layered_node=left)
        context.set_updated_node(index=right_index, layered_node=right)

        layer = max(left_layer, right_layer) + 1
        return layer, BINARY_NODE

    # At least one of them is empty.
    child_node, child_index, child_direction = (
        (left_node, left_index, 0) if right_node.is_empty else (right_node, right_index, 1)
    )
    child_layer = max(left_layer, right_layer)
    return construct_edge_node(
        path=child_direction,
        length=1,
        bottom_index=child_index,
        bottom=(child_layer, child_node),
        context=context,
    )


def construct_edge_node(
    path: int, length: int, bottom_index: int, bottom: LayeredNode, context: TreeContext
) -> LayeredNode:
    """
    Builds a (probably edge) node from its given descendant.
    """
    assert length >= 0, "Attempt to build a trivial edge."
    bottom_layer, bottom_node = bottom
    if bottom_node.is_empty:
        return 0, EMPTY_NODE

    if bottom_node.is_binary:
        # Finalize bottom - a binary descendant cannot change form.
        context.set_updated_node(index=bottom_index, layered_node=bottom)
        layer = bottom_layer + 1
    else:
        # Edge or leaf.
        layer = bottom_layer

    # Unify paths. This may be trivial in case of a bottom leaf or binary.
    return layer, Node(
        path=bottom_node.path | (path << bottom_node.length),
        length=bottom_node.length + length,
        value=bottom_node.value,
    )


# Traversal utilities.


def split_leaves(
    root_index: int, root_height: int, leaf_indices: List[int]
) -> Tuple[List[int], List[int]]:
    """
    Splits and returns the leaves of the left and right child. Assumes the leaves are:
    * Sorted.
    * Descendants of the given index.
    """
    leftmost_index_in_right_subtree = ((root_index << 1) | 1) << (root_height - 1)
    mid = bisect_left(leaf_indices, leftmost_index_in_right_subtree)
    return leaf_indices[:mid], leaf_indices[mid:]


def get_path_to_lca(root_index: int, root_height: int, leaf_indices: List[int]) -> Tuple[int, int]:
    """
    Returns the path from the given index to the LCA of the leaves. Assumes the leaves are:
    * Sorted.
    * Descendants of the given index.
    * Non-empty list.
    """
    lca_height = (leaf_indices[0] ^ leaf_indices[-1]).bit_length()
    path_length = root_height - lca_height
    path = (leaf_indices[0] - (root_index << root_height)) >> lca_height
    return path_length, path


def has_leaves_on_both_sides(root_height: int, leaf_indices: List[int]) -> bool:
    """
    Indicates whether a root at the given height has leaves on both sides, given a list of
    leaf indices, assuming:
    * The list is sorted.
    * All leaves are descendants of the root.
    """
    child_direction_mask = 1 << (root_height - 1)
    return (leaf_indices[0] & child_direction_mask) != (leaf_indices[-1] & child_direction_mask)


def has_leaves_on_child_side(
    root_height: int, child_direction: int, leaf_indices: List[int]
) -> bool:
    """
    Indicates whether a root at the given height has leaves on the given child direction, given a
    list of leaf indices, assuming:
    * The list is sorted.
    * All leaves are descendants of the root.
    """
    is_first_leaf_on_child = ((leaf_indices[0] >> (root_height - 1)) & 1) == child_direction
    return (
        has_leaves_on_both_sides(root_height=root_height, leaf_indices=leaf_indices)
        or is_first_leaf_on_child
    )


def get_suffix(path: int, n: int) -> int:
    """
    Returns the last n steps of the path.
    """
    suffix_mask = (1 << n) - 1
    return path & suffix_mask


# Main.


async def update_tree(
    height: int,
    root: bytes,
    modifications: Collection[Tuple[int, TLeafFact]],
    ffc: FactFetchingContext,
) -> bytes:
    """
    Updates the tree with the given modifications, i.e., calculates and writes the new facts to
    storage and returns the new root hash.
    """
    if len(modifications) == 0:
        return root

    modification_keys, modification_values = safe_zip(*modifications)
    n_hash_workers = 32 if ffc.n_hash_workers is None else ffc.n_hash_workers

    def calculate_leaf_hash(leaf: TLeafFact) -> bytes:
        return leaf._hash(hash_func=ffc.hash_func)

    leaf_hashes = await process_concurrently(
        func=calculate_leaf_hash, items=modification_values, n_chunks=n_hash_workers
    )
    # Build a mapping from leaf index (in full representation) to leaf hash.
    leaf_layer_prefix = 1 << height
    leaves = {
        leaf_layer_prefix | address: leaf_hash
        for address, leaf_hash in safe_zip(modification_keys, leaf_hashes)
    }
    # Build new tree structure.
    nodes_by_dependency_layer = await update_structure(
        height=height, root=root, leaves=leaves, ffc=ffc
    )
    # Calculate facts.
    updated_root, inner_node_facts = await calculate_inner_node_facts(
        nodes_by_dependency_layer=nodes_by_dependency_layer,
        hash_func=ffc.hash_func,
        n_workers=n_hash_workers,
    )
    leaf_facts = {
        leaf.db_key(suffix=leaf_hash): leaf.serialize()
        for leaf_hash, leaf in safe_zip(leaf_hashes, modification_values)
    }
    # Write facts to DB.
    await ffc.storage.mset(updates=inner_node_facts | leaf_facts)
    return updated_root
