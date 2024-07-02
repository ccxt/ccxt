from typing import Union

AddressRepresentation = Union[int, str]
Address = int


def parse_address(value: AddressRepresentation) -> Address:
    if isinstance(value, int):
        return value

    try:
        return int(value, 16)
    except TypeError as t_err:
        raise TypeError("Invalid address format.") from t_err
