from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, OrderedDict, Union

from ...cairo.data_types import CairoType, EnumType, EventType, StructType


@dataclass
class Abi:
    """
    Dataclass representing class abi. Contains parsed functions, enums, events and structures.
    """

    # pylint: disable=too-many-instance-attributes

    @dataclass
    class Function:
        """
        Dataclass representing function's abi.
        """

        name: str
        inputs: OrderedDict[str, CairoType]
        outputs: List[CairoType]

    @dataclass
    class Constructor:
        """
        Dataclass representing constructor's abi.
        """

        name: str
        inputs: OrderedDict[str, CairoType]

    @dataclass
    class EventStruct:
        """
        Dataclass representing struct event's abi.
        """

        name: str
        members: OrderedDict[str, CairoType]

    @dataclass
    class EventEnum:
        """
        Dataclass representing enum event's abi.
        """

        name: str
        variants: OrderedDict[str, CairoType]

    Event = Union[EventStruct, EventEnum]

    @dataclass
    class Interface:
        """
        Dataclass representing an interface.
        """

        name: str
        items: OrderedDict[
            str, Abi.Function
        ]  # Only functions can be defined in the interface

    @dataclass
    class Impl:
        """
        Dataclass representing an impl.
        """

        name: str
        interface_name: str

    defined_structures: Dict[
        str, StructType
    ]  #: Abi of structures defined by the class.
    defined_enums: Dict[str, EnumType]  #: Abi of enums defined by the class.
    functions: Dict[str, Function]  #: Functions defined by the class.
    events: Dict[str, EventType]  #: Events defined by the class
    constructor: Optional[
        Constructor
    ]  #: Contract's constructor. It is None if class doesn't define one.
    l1_handler: Optional[
        Dict[str, Function]
    ]  #: Handlers of L1 messages. It is None if class doesn't define one.
    interfaces: Dict[str, Interface]
    implementations: Dict[str, Impl]
