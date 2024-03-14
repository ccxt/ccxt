from typing import (
    Any,
)


def abbr(value: Any, limit: int = 79) -> str:
    """
    Converts a value into its string representation and abbreviates that
    representation based on the given length `limit` if necessary.
    """
    rep = repr(value)

    if len(rep) > limit:
        if limit < 3:
            raise ValueError("Abbreviation limit may not be less than 3")

        rep = rep[: limit - 3] + "..."

    return rep
