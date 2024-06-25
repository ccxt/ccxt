from __future__ import annotations

from collections import OrderedDict

from abi.v0 import Abi
from cairo.data_types import ArrayType, FeltType, StructType

uint256_dict = {
    "type": "struct",
    "name": "Uint256",
    "size": 2,
    "members": [
        # low and high were switched on purpose. Parser has to use offset to order them properly.
        {"name": "high", "offset": 1, "type": "felt"},
        {"name": "low", "offset": 0, "type": "felt"},
    ],
}
uint256_struct = StructType("Uint256", OrderedDict(low=FeltType(), high=FeltType()))

pool_id_dict = {
    "type": "struct",
    "name": "PoolId",
    "size": 1,
    "members": [
        {"name": "value", "offset": 0, "type": "Uint256"},
    ],
}
pool_id_struct = StructType("PoolId", OrderedDict(value=uint256_struct))

user_dict = {
    "type": "struct",
    "name": "User",
    "size": 4,
    "members": [
        {"name": "id", "offset": 0, "type": "Uint256"},
        {"name": "name_len", "offset": 1, "type": "felt"},
        {"name": "name", "offset": 2, "type": "felt*"},
        {"name": "pool_id", "offset": 3, "type": "PoolId"},
    ],
}
user_missing_offset_dict = {
    "type": "struct",
    "name": "User",
    "size": 4,
    "members": [
        {"name": "id", "type": "Uint256"},
        {"name": "name_len", "type": "felt"},
        {"name": "name", "type": "felt*"},
        {"name": "pool_id", "type": "PoolId"},
    ],
}
user_struct = StructType(
    "User",
    OrderedDict(
        id=uint256_struct,
        name_len=FeltType(),
        name=ArrayType(FeltType()),
        pool_id=pool_id_struct,
    ),
)

user_partial_missing_offset_dict = {
    "type": "struct",
    "name": "User",
    "size": 4,
    "members": [
        {"name": "id", "offset": 0, "type": "Uint256"},
        {"name": "name_len", "type": "felt"},
        {"name": "name", "type": "felt*"},
        {"name": "pool_id", "offset": 1, "type": "PoolId"},
    ],
}
user_partial_missing_offset_struct = StructType(
    "User",
    OrderedDict(
        id=uint256_struct,
        pool_id=pool_id_struct,
        name_len=FeltType(),
        name=ArrayType(FeltType()),
    ),
)

user_added_dict = {
    "type": "event",
    "name": "UserAdded",
    "data": [
        {"name": "user", "type": "User"},
    ],
    "keys": [],
}
user_added_event: Abi.Event = Abi.Event(
    "UserAdded",
    OrderedDict(user=user_struct),
)

pool_id_added_dict = {
    "type": "event",
    "name": "PoolIdAdded",
    "data": [
        {"name": "pool_id", "type": "PoolId"},
    ],
    "keys": [],
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
            "type": "Uint256",
        }
    ],
    "outputs": [{"name": "user", "type": "User"}],
}
get_user_fn = Abi.Function(
    "get_user", OrderedDict(id=uint256_struct), OrderedDict(user=user_struct)
)

delete_pool_dict = {
    "type": "function",
    "name": "delete_pool",
    "inputs": [
        {
            "name": "id",
            "type": "PoolId",
        },
        {"name": "user_id", "type": "Uint256"},
    ],
    "outputs": [],
}
delete_pool_fn = Abi.Function(
    "delete_pool", OrderedDict(id=pool_id_struct, user_id=uint256_struct), OrderedDict()
)

oz_proxy_abi = Abi(
    defined_structures={},
    functions={
        "__default__": Abi.Function(
            name="__default__",
            inputs=OrderedDict(
                [
                    ("selector", FeltType()),
                    ("calldata_size", FeltType()),
                    ("calldata", ArrayType(inner_type=FeltType())),
                ]
            ),
            outputs=OrderedDict(
                [
                    ("retdata_size", FeltType()),
                    ("retdata", ArrayType(inner_type=FeltType())),
                ]
            ),
        )
    },
    constructor=Abi.Function(
        name="constructor",
        inputs=OrderedDict(
            [
                ("implementation_hash", FeltType()),
                ("selector", FeltType()),
                ("calldata_len", FeltType()),
                ("calldata", ArrayType(inner_type=FeltType())),
            ]
        ),
        outputs=OrderedDict(),
    ),
    l1_handler=Abi.Function(
        name="__l1_default__",
        inputs=OrderedDict(
            [
                ("selector", FeltType()),
                ("calldata_size", FeltType()),
                ("calldata", ArrayType(inner_type=FeltType())),
            ]
        ),
        outputs=OrderedDict(),
    ),
    events={
        "Upgraded": Abi.Event(
            name="Upgraded", data=OrderedDict([("implementation", FeltType())])
        ),
        "AdminChanged": Abi.Event(
            name="AdminChanged",
            data=OrderedDict([("previousAdmin", FeltType()), ("newAdmin", FeltType())]),
        ),
    },
)

nested_struct = StructType(
    name="NestedStruct", types=OrderedDict([("value", FeltType())])
)
top_struct = StructType(
    name="TopStruct",
    types=OrderedDict(value=FeltType(), nested_struct=nested_struct),
)
balance_struct_abi = Abi(
    defined_structures={
        "TopStruct": top_struct,
        "NestedStruct": nested_struct,
    },
    functions={
        "increase_balance": Abi.Function(
            name="increase_balance",
            inputs=OrderedDict(
                [
                    ("key", FeltType()),
                    (
                        "amount",
                        top_struct,
                    ),
                ]
            ),
            outputs=OrderedDict(),
        ),
        "get_balance": Abi.Function(
            name="get_balance",
            inputs=OrderedDict([("key", FeltType())]),
            outputs=OrderedDict(value=top_struct),
        ),
    },
    constructor=None,
    l1_handler=None,
    events={
        "increase_balance_called": Abi.Event(
            name="increase_balance_called",
            data=OrderedDict(key=FeltType(), prev_amount=top_struct, amount=top_struct),
        )
    },
)
