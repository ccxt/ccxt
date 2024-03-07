import decimal
from decimal import (
    localcontext,
)
from typing import (
    Union,
)

from .types import (
    is_integer,
    is_string,
)
from .units import (
    units,
)


class denoms:
    wei = int(units["wei"])
    kwei = int(units["kwei"])
    babbage = int(units["babbage"])
    femtoether = int(units["femtoether"])
    mwei = int(units["mwei"])
    lovelace = int(units["lovelace"])
    picoether = int(units["picoether"])
    gwei = int(units["gwei"])
    shannon = int(units["shannon"])
    nanoether = int(units["nanoether"])
    nano = int(units["nano"])
    szabo = int(units["szabo"])
    microether = int(units["microether"])
    micro = int(units["micro"])
    finney = int(units["finney"])
    milliether = int(units["milliether"])
    milli = int(units["milli"])
    ether = int(units["ether"])
    kether = int(units["kether"])
    grand = int(units["grand"])
    mether = int(units["mether"])
    gether = int(units["gether"])
    tether = int(units["tether"])


MIN_WEI = 0
MAX_WEI = 2**256 - 1


def from_wei(number: int, unit: str) -> Union[int, decimal.Decimal]:
    """
    Takes a number of wei and converts it to any other ether unit.
    """
    if unit.lower() not in units:
        raise ValueError(f"Unknown unit. Must be one of {'/'.join(units.keys())}")

    if number == 0:
        return 0

    if number < MIN_WEI or number > MAX_WEI:
        raise ValueError("value must be between 1 and 2**256 - 1")

    unit_value = units[unit.lower()]

    with localcontext() as ctx:
        ctx.prec = 999
        d_number = decimal.Decimal(value=number, context=ctx)
        result_value = d_number / unit_value

    return result_value


def to_wei(number: Union[int, float, str, decimal.Decimal], unit: str) -> int:
    """
    Takes a number of a unit and converts it to wei.
    """
    if unit.lower() not in units:
        raise ValueError(f"Unknown unit. Must be one of {'/'.join(units.keys())}")

    if is_integer(number) or is_string(number):
        d_number = decimal.Decimal(value=number)
    elif isinstance(number, float):
        d_number = decimal.Decimal(value=str(number))
    elif isinstance(number, decimal.Decimal):
        d_number = number
    else:
        raise TypeError("Unsupported type. Must be one of integer, float, or string")

    s_number = str(number)
    unit_value = units[unit.lower()]

    if d_number == decimal.Decimal(0):
        return 0

    if d_number < 1 and "." in s_number:
        with localcontext() as ctx:
            multiplier = len(s_number) - s_number.index(".") - 1
            ctx.prec = multiplier
            d_number = decimal.Decimal(value=number, context=ctx) * 10**multiplier
        unit_value /= 10**multiplier

    with localcontext() as ctx:
        ctx.prec = 999
        result_value = decimal.Decimal(value=d_number, context=ctx) * unit_value

    if result_value < MIN_WEI or result_value > MAX_WEI:
        raise ValueError("Resulting wei value must be between 1 and 2**256 - 1")

    return int(result_value)
