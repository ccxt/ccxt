import itertools
from typing import Any, Iterable

# This file contains functions of utils.py, for which stubs exist in the corresponding *.pyi file.
# It is needed since mypy looks for all definitions in *.pyi files, without falling back to the
# *.py.


def safe_zip(*iterables: Iterable[Any]) -> Iterable:
    """
    Zips iterables. Makes sure the lengths of all iterables are equal.
    """
    sentinel = object()
    for combo in itertools.zip_longest(*iterables, fillvalue=sentinel):
        assert sentinel not in combo, "Iterables to safe_zip are not equal in length."
        yield combo
