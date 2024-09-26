from __future__ import annotations

from dataclasses import dataclass, fields, make_dataclass
from typing import Dict, Optional, Tuple


@dataclass(frozen=True, eq=False)
class TupleDataclass:
    """
    Dataclass that behaves like a tuple at the same time. Used when data has defined order and names.
    For instance in case of named tuples or function responses.
    """

    # getattr is called when attribute is not found in object. For instance when using object.unknown_attribute.
    # This way pyright will know that there might be some arguments it doesn't know about and will stop complaining
    # about some fields that don't exist statically.
    def __getattr__(self, item):
        # This should always fail - only attributes that don't exist end up in here.
        # We use __getattribute__ to get the native error.
        return super().__getattribute__(item)

    def __getitem__(self, item: int):
        field = fields(self)[item]
        return getattr(self, field.name)

    def __iter__(self):
        return (getattr(self, field.name) for field in fields(self))

    def as_tuple(self) -> Tuple:
        """
        Creates a regular tuple from TupleDataclass.
        """
        return tuple(self)

    def as_dict(self) -> Dict:
        """
        Creates a regular dict from TupleDataclass.
        """
        return {field.name: getattr(self, field.name) for field in fields(self)}

    # Added for backward compatibility with previous implementation based on NamedTuple
    def _asdict(self):
        return self.as_dict()

    def __eq__(self, other):
        if isinstance(other, TupleDataclass):
            return self.as_tuple() == other.as_tuple()
        return self.as_tuple() == other

    @staticmethod
    def from_dict(data: Dict, *, name: Optional[str] = None) -> TupleDataclass:
        result_class = make_dataclass(
            name or "TupleDataclass",
            fields=[(key, type(value)) for key, value in data.items()],
            bases=(TupleDataclass,),
            frozen=True,
            eq=False,
        )
        return result_class(**data)
