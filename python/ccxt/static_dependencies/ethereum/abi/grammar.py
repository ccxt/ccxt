import functools
import re

from ...parsimonious import (
    expressions,
    ParseError,
    NodeVisitor,
    Grammar
)

from .exceptions import (
    ABITypeError,
    ParseError,
)

grammar = Grammar(
    r"""
    type = tuple_type / basic_type

    tuple_type = components arrlist?
    components = non_zero_tuple / zero_tuple

    non_zero_tuple = "(" type next_type* ")"
    next_type = "," type

    zero_tuple = "()"

    basic_type = base sub? arrlist?

    base = alphas

    sub = two_size / digits
    two_size = (digits "x" digits)

    arrlist = (const_arr / dynam_arr)+
    const_arr = "[" digits "]"
    dynam_arr = "[]"

    alphas = ~"[A-Za-z]+"
    digits = ~"[1-9][0-9]*"
    """
)


class NodeVisitor(NodeVisitor):
    """
    Parsimonious node visitor which performs both parsing of type strings and
    post-processing of parse trees.  Parsing operations are cached.
    """

    grammar = grammar

    def visit_non_zero_tuple(self, node, visited_children):
        # Ignore left and right parens
        _, first, rest, _ = visited_children

        return (first,) + rest

    def visit_tuple_type(self, node, visited_children):
        components, arrlist = visited_children

        return TupleType(components, arrlist, node=node)

    def visit_next_type(self, node, visited_children):
        # Ignore comma
        _, abi_type = visited_children

        return abi_type

    def visit_zero_tuple(self, node, visited_children):
        return tuple()

    def visit_basic_type(self, node, visited_children):
        base, sub, arrlist = visited_children

        return BasicType(base, sub, arrlist, node=node)

    def visit_two_size(self, node, visited_children):
        # Ignore "x"
        first, _, second = visited_children

        return first, second

    def visit_const_arr(self, node, visited_children):
        # Ignore left and right brackets
        _, int_value, _ = visited_children

        return (int_value,)

    def visit_dynam_arr(self, node, visited_children):
        return tuple()

    def visit_alphas(self, node, visited_children):
        return node.text

    def visit_digits(self, node, visited_children):
        return int(node.text)

    def generic_visit(self, node, visited_children):
        if isinstance(node.expr, expressions.OneOf):
            # Unwrap value chosen from alternatives
            return visited_children[0]
        if isinstance(node.expr, expressions.Optional):
            # Unwrap optional value or return `None`
            if len(visited_children) != 0:
                return visited_children[0]

            return None

        return tuple(visited_children)

    @functools.lru_cache(maxsize=None)
    def parse(self, type_str):
        """
        Parses a type string into an appropriate instance of
        :class:`~eth_abi.grammar.ABIType`.  If a type string cannot be parsed,
        throws :class:`~eth_abi.exceptions.ParseError`.

        :param type_str: The type string to be parsed.
        :returns: An instance of :class:`~eth_abi.grammar.ABIType` containing
            information about the parsed type string.
        """
        if not isinstance(type_str, str):
            raise TypeError(
                "Can only parse string values: got {}".format(type(type_str))
            )

        try:
            return super().parse(type_str)
        except ParseError as e:
            raise ParseError(e.text, e.pos, e.expr)


visitor = NodeVisitor()


class ABIType:
    """
    Base class for results of type string parsing operations.
    """

    __slots__ = ("arrlist", "node")

    def __init__(self, arrlist=None, node=None):
        self.arrlist = arrlist
        """
        The list of array dimensions for a parsed type.  Equal to ``None`` if
        type string has no array dimensions.
        """

        self.node = node
        """
        The parsimonious ``Node`` instance associated with this parsed type.
        Used to generate error messages for invalid types.
        """

    def __repr__(self):  # pragma: no cover
        return "<{} {}>".format(
            type(self).__qualname__,
            repr(self.to_type_str()),
        )

    def __eq__(self, other):
        # Two ABI types are equal if their string representations are equal
        return type(self) is type(other) and self.to_type_str() == other.to_type_str()

    def to_type_str(self):  # pragma: no cover
        """
        Returns the string representation of an ABI type.  This will be equal to
        the type string from which it was created.
        """
        raise NotImplementedError("Must implement `to_type_str`")

    @property
    def item_type(self):
        """
        If this type is an array type, equal to an appropriate
        :class:`~eth_abi.grammar.ABIType` instance for the array's items.
        """
        raise NotImplementedError("Must implement `item_type`")

    def validate(self):  # pragma: no cover
        """
        Validates the properties of an ABI type against the solidity ABI spec:

        https://solidity.readthedocs.io/en/develop/abi-spec.html

        Raises :class:`~eth_abi.exceptions.ABITypeError` if validation fails.
        """
        raise NotImplementedError("Must implement `validate`")

    def invalidate(self, error_msg):
        # Invalidates an ABI type with the given error message.  Expects that a
        # parsimonious node was provided from the original parsing operation
        # that yielded this type.
        node = self.node

        raise ABITypeError(
            "For '{comp_str}' type at column {col} "
            "in '{type_str}': {error_msg}".format(
                comp_str=node.text,
                col=node.start + 1,
                type_str=node.full_text,
                error_msg=error_msg,
            ),
        )

    @property
    def is_array(self):
        """
        Equal to ``True`` if a type is an array type (i.e. if it has an array
        dimension list).  Otherwise, equal to ``False``.
        """
        return self.arrlist is not None

    @property
    def is_dynamic(self):
        """
        Equal to ``True`` if a type has a dynamically sized encoding.
        Otherwise, equal to ``False``.
        """
        raise NotImplementedError("Must implement `is_dynamic`")

    @property
    def _has_dynamic_arrlist(self):
        return self.is_array and any(len(dim) == 0 for dim in self.arrlist)


class TupleType(ABIType):
    """
    Represents the result of parsing a tuple type string e.g. "(int,bool)".
    """

    __slots__ = ("components",)

    def __init__(self, components, arrlist=None, *, node=None):
        super().__init__(arrlist, node)

        self.components = components
        """
        A tuple of :class:`~eth_abi.grammar.ABIType` instances for each of the
        tuple type's components.
        """

    def to_type_str(self):
        arrlist = self.arrlist

        if isinstance(arrlist, tuple):
            arrlist = "".join(repr(list(a)) for a in arrlist)
        else:
            arrlist = ""

        return "({}){}".format(
            ",".join(c.to_type_str() for c in self.components),
            arrlist,
        )

    @property
    def item_type(self):
        if not self.is_array:
            raise ValueError(
                "Cannot determine item type for non-array type '{}'".format(
                    self.to_type_str(),
                )
            )

        return type(self)(
            self.components,
            self.arrlist[:-1] or None,
            node=self.node,
        )

    def validate(self):
        for c in self.components:
            c.validate()

    @property
    def is_dynamic(self):
        if self._has_dynamic_arrlist:
            return True

        return any(c.is_dynamic for c in self.components)


class BasicType(ABIType):
    """
    Represents the result of parsing a basic type string e.g. "uint", "address",
    "ufixed128x19[][2]".
    """

    __slots__ = ("base", "sub")

    def __init__(self, base, sub=None, arrlist=None, *, node=None):
        super().__init__(arrlist, node)

        self.base = base
        """The base of a basic type e.g. "uint" for "uint256" etc."""

        self.sub = sub
        """
        The sub type of a basic type e.g. ``256`` for "uint256" or ``(128, 18)``
        for "ufixed128x18" etc.  Equal to ``None`` if type string has no sub
        type.
        """

    def to_type_str(self):
        sub, arrlist = self.sub, self.arrlist

        if isinstance(sub, int):
            sub = str(sub)
        elif isinstance(sub, tuple):
            sub = "x".join(str(s) for s in sub)
        else:
            sub = ""

        if isinstance(arrlist, tuple):
            arrlist = "".join(repr(list(a)) for a in arrlist)
        else:
            arrlist = ""

        return self.base + sub + arrlist

    @property
    def item_type(self):
        if not self.is_array:
            raise ValueError(
                "Cannot determine item type for non-array type '{}'".format(
                    self.to_type_str(),
                )
            )

        return type(self)(
            self.base,
            self.sub,
            self.arrlist[:-1] or None,
            node=self.node,
        )

    @property
    def is_dynamic(self):
        if self._has_dynamic_arrlist:
            return True

        if self.base == "string":
            return True

        if self.base == "bytes" and self.sub is None:
            return True

        return False

    def validate(self):
        base, sub = self.base, self.sub

        # Check validity of string type
        if base == "string":
            if sub is not None:
                self.invalidate("string type cannot have suffix")

        # Check validity of bytes type
        elif base == "bytes":
            if not (sub is None or isinstance(sub, int)):
                self.invalidate(
                    "bytes type must have either no suffix or a numerical suffix"
                )

            if isinstance(sub, int) and sub > 32:
                self.invalidate("maximum 32 bytes for fixed-length bytes")

        # Check validity of integer type
        elif base in ("int", "uint"):
            if not isinstance(sub, int):
                self.invalidate("integer type must have numerical suffix")

            if sub < 8 or 256 < sub:
                self.invalidate("integer size out of bounds (max 256 bits)")

            if sub % 8 != 0:
                self.invalidate("integer size must be multiple of 8")

        # Check validity of fixed type
        elif base in ("fixed", "ufixed"):
            if not isinstance(sub, tuple):
                self.invalidate(
                    "fixed type must have suffix of form <bits>x<exponent>, "
                    "e.g. 128x19",
                )

            bits, minus_e = sub

            if bits < 8 or 256 < bits:
                self.invalidate("fixed size out of bounds (max 256 bits)")

            if bits % 8 != 0:
                self.invalidate("fixed size must be multiple of 8")

            if minus_e < 1 or 80 < minus_e:
                self.invalidate(
                    "fixed exponent size out of bounds, {} must be in 1-80".format(
                        minus_e,
                    ),
                )

        # Check validity of hash type
        elif base == "hash":
            if not isinstance(sub, int):
                self.invalidate("hash type must have numerical suffix")

        # Check validity of address type
        elif base == "address":
            if sub is not None:
                self.invalidate("address cannot have suffix")


TYPE_ALIASES = {
    "int": "int256",
    "uint": "uint256",
    "fixed": "fixed128x18",
    "ufixed": "ufixed128x18",
    "function": "bytes24",
    "byte": "bytes1",
}

TYPE_ALIAS_RE = re.compile(
    r"\b({})\b".format("|".join(re.escape(a) for a in TYPE_ALIASES.keys()))
)


def normalize(type_str):
    """
    Normalizes a type string into its canonical version e.g. the type string
    'int' becomes 'int256', etc.

    :param type_str: The type string to be normalized.
    :returns: The canonical version of the input type string.
    """
    return TYPE_ALIAS_RE.sub(
        lambda match: TYPE_ALIASES[match.group(0)],
        type_str,
    )


parse = visitor.parse
