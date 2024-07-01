from typing import List, Sequence, Union

from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME as PRIME


def cast_to_felts(values: Sequence[Union[str, int]]) -> List[int]:
    lower_bound = -(PRIME // 2)
    upper_bound = PRIME
    result = []
    for value in values:
        if isinstance(value, int):
            value_int = value
        else:
            try:
                value_int = int(value, 16) if value.startswith("0x") else int(value)
            except ValueError:
                raise ValueError(
                    f"Invalid input value: '{value}'. Expected a decimal or hexadecimal integer."
                ) from None

        if not lower_bound <= value_int < upper_bound:
            raise ValueError(
                f"Input value '{value}' is out of bounds. "
                f"Expected a value in the range [{lower_bound}, {upper_bound})."
            )

        result.append(value_int % PRIME)

    return result
