from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional, OrderedDict

from ...cairo.data_types import CairoType, StructType


@dataclass
class Abi:
    """
    Dataclass representing class abi. Contains parsed functions, events and structures.
    """

    @dataclass
    class Function:
        """
        Dataclass representing function's abi.
        """

        name: str
        inputs: OrderedDict[str, CairoType]
        outputs: OrderedDict[str, CairoType]

    @dataclass
    class Event:
        """
        Dataclass representing event's abi.
        """

        name: str
        data: OrderedDict[str, CairoType]

    defined_structures: Dict[
        str, StructType
    ]  #: Abi of structures defined by the class.
    functions: Dict[str, Function]  #: Functions defined by the class.
    constructor: Optional[
        Function
    ]  #: Contract's constructor. It is None if class doesn't define one.
    l1_handler: Optional[
        Function
    ]  #: Handler of L1 messages. It is None if class doesn't define one.
    events: Dict[str, Event]  #: Events defined by the class
