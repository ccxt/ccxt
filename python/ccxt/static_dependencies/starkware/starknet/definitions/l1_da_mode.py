from enum import Enum, auto


class L1DaMode(Enum):
    CALLDATA = 0
    BLOB = auto()

    @classmethod
    def from_boolean(cls, use_kzg_da: bool) -> "L1DaMode":
        return cls.BLOB if use_kzg_da else cls.CALLDATA
