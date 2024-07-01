import functools
import os

from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME
from starkware.starknet.services.api.contract_class.contract_class import (
    CompiledClass,
    CompiledClassEntryPoint,
    DeprecatedCompiledClass,
    EntryPointType,
)


@functools.lru_cache(maxsize=None)
def get_deprecated_compiled_class(contract_name: str) -> DeprecatedCompiledClass:
    main_dir_path = os.path.dirname(__file__)
    file_path = os.path.join(main_dir_path, contract_name + ".json")

    with open(file_path, "r") as fp:
        return DeprecatedCompiledClass.loads(data=fp.read())


def get_test_deprecated_compiled_class() -> DeprecatedCompiledClass:
    return get_deprecated_compiled_class("test_contract")


def get_test_compiled_class(contract_segmentation: bool = True) -> CompiledClass:
    return CompiledClass(
        prime=DEFAULT_PRIME,
        bytecode=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        bytecode_segment_lengths=[3, [1, 1, [1]], 4] if contract_segmentation else 10,
        hints=[],
        pythonic_hints={},
        compiler_version="",
        entry_points_by_type={
            EntryPointType.EXTERNAL: [
                CompiledClassEntryPoint(selector=1, offset=1, builtins=["237"])
            ],
            EntryPointType.L1_HANDLER: [],
            EntryPointType.CONSTRUCTOR: [
                CompiledClassEntryPoint(selector=5, offset=0, builtins=[])
            ],
        },
    )
