from __future__ import annotations

from typing import Generic, Optional, T

from typing_extensions import Annotated, Required, TypedDict


# this class must not be imported into test_typing_extensions.py at top level, otherwise
# the test_get_type_hints_cross_module_subclass test will pass for the wrong reason
class _DoNotImport:
    pass


class Foo(TypedDict):
    a: _DoNotImport


class FooGeneric(TypedDict, Generic[T]):
    a: Optional[T]


class VeryAnnotated(TypedDict, total=False):
    a: Annotated[Annotated[Annotated[Required[int], "a"], "b"], "c"]
