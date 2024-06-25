# data from cairo repository: crates/cairo-lang-starknet/src/abi_test.rs
from collections import OrderedDict

from abi.v1.model import Abi
from cairo.data_types import (
    ArrayType,
    EnumType,
    FeltType,
    StructType,
    UintType,
)

core_structures = {
    "core::starknet::eth_address::EthAddress": StructType(
        name="core::starknet::eth_address::EthAddress",
        types=OrderedDict([("address", FeltType())]),
    )
}

pool_id_dict = {
    "type": "struct",
    "name": "PoolId",
    "members": [
        {"name": "value", "type": "core::integer::u256"},
    ],
}
pool_id_struct = StructType("PoolId", OrderedDict(value=UintType(256)))

user_dict = {
    "type": "struct",
    "name": "User",
    "members": [
        {"name": "id", "type": "core::integer::u256"},
        {"name": "name_len", "type": "core::felt252"},
        {"name": "name", "type": "core::array::Array::<core::felt252>"},
        {"name": "pool_id", "type": "PoolId"},
    ],
}
user_struct = StructType(
    "User",
    OrderedDict(
        id=UintType(256),
        name_len=FeltType(),
        name=ArrayType(FeltType()),
        pool_id=pool_id_struct,
    ),
)

user_added_dict = {
    "type": "event",
    "name": "UserAdded",
    "inputs": [
        {"name": "user", "type": "User"},
    ],
}
user_added_event: Abi.Event = Abi.Event(
    "UserAdded",
    OrderedDict(user=user_struct),
)

pool_id_added_dict = {
    "type": "event",
    "name": "PoolIdAdded",
    "inputs": [
        {"name": "pool_id", "type": "PoolId"},
    ],
}
pool_id_added_event: Abi.Event = Abi.Event(
    "PoolIdAdded",
    OrderedDict(pool_id=pool_id_struct),
)

get_user_dict = {
    "type": "function",
    "name": "get_user",
    "inputs": [
        {
            "name": "id",
            "type": "core::integer::u256",
        }
    ],
    "outputs": [{"type": "User"}],
}
get_user_fn = Abi.Function("get_user", OrderedDict(id=UintType(256)), [user_struct])

delete_pool_dict = {
    "type": "function",
    "name": "delete_pool",
    "inputs": [
        {
            "name": "id",
            "type": "PoolId",
        },
        {"name": "user_id", "type": "core::integer::u256"},
    ],
    "outputs": [],
}
delete_pool_fn = Abi.Function(
    "delete_pool", OrderedDict(id=pool_id_struct, user_id=UintType(256)), []
)

my_struct_dict = {
    "type": "struct",
    "name": "test::MyStruct::<core::integer::u256>",
    "members": [
        {"name": "a", "type": "core::integer::u256"},
        {"name": "b", "type": "core::felt252"},
    ],
}
my_struct = StructType(
    name="test::MyStruct::<core::integer::u256>",
    types=OrderedDict(a=UintType(256), b=FeltType()),
)

my_enum_dict = {
    "type": "enum",
    "name": "test::MyEnum::<core::integer::u128>",
    "variants": [
        {"name": "a", "type": "core::integer::u256"},
        {"name": "b", "type": "test::MyStruct::<core::integer::u128>"},
    ],
}
my_enum = EnumType(
    name="test::MyEnum::<core::integer::u128>",
    variants=OrderedDict(a=UintType(256), b=my_struct),
)

foo_event_dict = {
    "type": "event",
    "name": "foo_event",
    "inputs": [
        {"name": "a", "type": "core::felt252"},
        {"name": "b", "type": "core::integer::u128"},
    ],
}
foo_event = Abi.Event(
    name="foo_event", inputs=OrderedDict(a=FeltType(), b=UintType(128))
)

foo_external_dict = {
    "type": "function",
    "name": "foo_external",
    "inputs": [
        {"name": "a", "type": "core::felt252"},
        {"name": "b", "type": "core::integer::u128"},
    ],
    "outputs": [{"type": "test::MyStruct::<core::integer::u256>"}],
    "state_mutability": "external",
}
foo_external = Abi.Function(
    name="foo_external",
    inputs=OrderedDict(a=FeltType(), b=UintType(128)),
    outputs=[my_struct],
)

foo_view_dict = {
    "type": "function",
    "name": "foo_view",
    "inputs": [
        {"name": "a", "type": "core::felt252"},
        {"name": "b", "type": "core::integer::u128"},
    ],
    "outputs": [{"type": "test::MyEnum::<core::integer::u128>"}],
    "state_mutability": "view",
}
foo_view = Abi.Function(
    name="foo_view",
    inputs=OrderedDict(a=FeltType(), b=UintType(128)),
    outputs=[my_enum],
)

abi_v1 = Abi(
    defined_structures={},
    events={
        "PoolIdAdded": pool_id_added_event,
    },
    functions={},
    defined_enums={},
)
