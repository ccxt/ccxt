# data from cairo repository: crates/cairo-lang-starknet/src/abi_test.rs
from collections import OrderedDict

from abi.v2 import Abi
from cairo.data_types import EventType, StructType, UintType

pool_id_struct = StructType("PoolId", OrderedDict(value=UintType(256)))

pool_id_added_event: EventType = EventType(
    "PoolIdAdded",
    OrderedDict(pool_id=pool_id_struct),
)

abi_v2 = Abi(
    defined_structures={},
    events={
        "PoolIdAdded": pool_id_added_event,
    },
    functions={},
    constructor=None,
    l1_handler=None,
    defined_enums={},
    interfaces={},
    implementations={},
)
