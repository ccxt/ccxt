from typing import (
    Callable,
    Union,
)

from ...typing.abi import (
    TypeStr,
)
from ..utils import (
    to_checksum_address,
)
from hypothesis import (
    strategies as st,
)

from ..grammar import (
    ABIType,
    normalize,
    parse,
)
from ..registry import (
    BaseEquals,
    BaseRegistry,
    Lookup,
    PredicateMapping,
    has_arrlist,
    is_base_tuple,
)
from ..utils.numeric import (
    scale_places,
)

StrategyFactory = Callable[[ABIType, "StrategyRegistry"], st.SearchStrategy]
StrategyRegistration = Union[st.SearchStrategy, StrategyFactory]


class StrategyRegistry(BaseRegistry):
    def __init__(self):
        self._strategies = PredicateMapping("strategy registry")

    def register_strategy(
        self, lookup: Lookup, registration: StrategyRegistration, label: str = None
    ) -> None:
        self._register(self._strategies, lookup, registration, label=label)

    def unregister_strategy(self, lookup_or_label: Lookup) -> None:
        self._unregister(self._strategies, lookup_or_label)

    def get_strategy(self, type_str: TypeStr) -> st.SearchStrategy:
        """
        Returns a hypothesis strategy for the given ABI type.

        :param type_str: The canonical string representation of the ABI type
            for which a hypothesis strategy should be returned.

        :returns: A hypothesis strategy for generating Python values that are
            encodable as values of the given ABI type.
        """
        registration = self._get_registration(self._strategies, type_str)

        if isinstance(registration, st.SearchStrategy):
            # If a hypothesis strategy was registered, just return it
            return registration
        else:
            # Otherwise, assume the factory is a callable.  Call it with the abi
            # type to get an appropriate hypothesis strategy.
            normalized_type_str = normalize(type_str)
            abi_type = parse(normalized_type_str)
            strategy = registration(abi_type, self)

            return strategy


def get_uint_strategy(
    abi_type: ABIType, registry: StrategyRegistry
) -> st.SearchStrategy:
    bits = abi_type.sub

    return st.integers(
        min_value=0,
        max_value=2**bits - 1,
    )


def get_int_strategy(
    abi_type: ABIType, registry: StrategyRegistry
) -> st.SearchStrategy:
    bits = abi_type.sub

    return st.integers(
        min_value=-(2 ** (bits - 1)),
        max_value=2 ** (bits - 1) - 1,
    )


address_strategy = st.binary(min_size=20, max_size=20).map(to_checksum_address)
bool_strategy = st.booleans()


def get_ufixed_strategy(
    abi_type: ABIType, registry: StrategyRegistry
) -> st.SearchStrategy:
    bits, places = abi_type.sub

    return st.decimals(
        min_value=0,
        max_value=2**bits - 1,
        places=0,
    ).map(scale_places(places))


def get_fixed_strategy(
    abi_type: ABIType, registry: StrategyRegistry
) -> st.SearchStrategy:
    bits, places = abi_type.sub

    return st.decimals(
        min_value=-(2 ** (bits - 1)),
        max_value=2 ** (bits - 1) - 1,
        places=0,
    ).map(scale_places(places))


def get_bytes_strategy(
    abi_type: ABIType, registry: StrategyRegistry
) -> st.SearchStrategy:
    num_bytes = abi_type.sub

    return st.binary(
        min_size=num_bytes,
        max_size=num_bytes,
    )


bytes_strategy = st.binary(min_size=0, max_size=4096)
string_strategy = st.text()


def get_array_strategy(
    abi_type: ABIType, registry: StrategyRegistry
) -> st.SearchStrategy:
    item_type = abi_type.item_type
    item_type_str = item_type.to_type_str()
    item_strategy = registry.get_strategy(item_type_str)

    last_dim = abi_type.arrlist[-1]
    if len(last_dim) == 0:
        # Is dynamic list.  Don't restrict length.
        return st.lists(item_strategy)
    else:
        # Is static list.  Restrict length.
        dim_size = last_dim[0]
        return st.lists(item_strategy, min_size=dim_size, max_size=dim_size)


def get_tuple_strategy(
    abi_type: ABIType, registry: StrategyRegistry
) -> st.SearchStrategy:
    component_strategies = [
        registry.get_strategy(comp_abi_type.to_type_str())
        for comp_abi_type in abi_type.components
    ]

    return st.tuples(*component_strategies)


strategy_registry = StrategyRegistry()

strategy_registry.register_strategy(
    BaseEquals("uint"),
    get_uint_strategy,
    label="uint",
)
strategy_registry.register_strategy(
    BaseEquals("int"),
    get_int_strategy,
    label="int",
)
strategy_registry.register_strategy(
    BaseEquals("address", with_sub=False),
    address_strategy,
    label="address",
)
strategy_registry.register_strategy(
    BaseEquals("bool", with_sub=False),
    bool_strategy,
    label="bool",
)
strategy_registry.register_strategy(
    BaseEquals("ufixed"),
    get_ufixed_strategy,
    label="ufixed",
)
strategy_registry.register_strategy(
    BaseEquals("fixed"),
    get_fixed_strategy,
    label="fixed",
)
strategy_registry.register_strategy(
    BaseEquals("bytes", with_sub=True),
    get_bytes_strategy,
    label="bytes<M>",
)
strategy_registry.register_strategy(
    BaseEquals("bytes", with_sub=False),
    bytes_strategy,
    label="bytes",
)
strategy_registry.register_strategy(
    BaseEquals("function", with_sub=False),
    get_bytes_strategy,
    label="function",
)
strategy_registry.register_strategy(
    BaseEquals("string", with_sub=False),
    string_strategy,
    label="string",
)
strategy_registry.register_strategy(
    has_arrlist,
    get_array_strategy,
    label="has_arrlist",
)
strategy_registry.register_strategy(
    is_base_tuple,
    get_tuple_strategy,
    label="is_base_tuple",
)

get_abi_strategy = strategy_registry.get_strategy
