from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, OrderedDict

from ...cairo.data_types import CairoType, EnumType, StructType


@dataclass
class Abi:
    """
    Dataclass representing class abi. Contains parsed functions, enums, events and structures.
    """

    @dataclass
    class Function:
        """
        Dataclass representing function's abi.
        """

        name: str
        inputs: OrderedDict[str, CairoType]
        outputs: List[CairoType]

    @dataclass
    class Event:
        """
        Dataclass representing event's abi.
        """

        name: str
        inputs: OrderedDict[str, CairoType]

    defined_structures: Dict[
        str, StructType
    ]  #: Abi of structures defined by the class.
    defined_enums: Dict[str, EnumType]  #: Abi of enums defined by the class.
    functions: Dict[str, Function]  #: Functions defined by the class.
    events: Dict[str, Event]  #: Events defined by the class
