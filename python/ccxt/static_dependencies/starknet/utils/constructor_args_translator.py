from typing import List, Optional, Union

from ..abi.v2 import shape as ShapeV2
from ..abi.v0 import AbiParser as AbiParserV0
from ..abi.v1 import AbiParser as AbiParserV1
from ..abi.v2 import AbiParser as AbiParserV2
from ..serialization import (
    FunctionSerializationAdapter,
    serializer_for_function,
)
from ..serialization.factory import (
    serializer_for_constructor_v2,
    serializer_for_function_v1,
)


def translate_constructor_args(
    abi: List, constructor_args: Optional[Union[List, dict]], *, cairo_version: int = 1
) -> List[int]:
    serializer = (
        _get_constructor_serializer_v1(abi)
        if cairo_version == 1
        else _get_constructor_serializer_v0(abi)
    )

    if serializer is None or len(serializer.inputs_serializer.serializers) == 0:
        return []

    if not constructor_args:
        raise ValueError(
            "Provided contract has a constructor and no arguments were provided."
        )

    args, kwargs = (
        ([], constructor_args)
        if isinstance(constructor_args, dict)
        else (constructor_args, {})
    )
    return serializer.serialize(*args, **kwargs)


def _get_constructor_serializer_v1(abi: List) -> Optional[FunctionSerializationAdapter]:
    if _is_abi_v2(abi):
        parsed = AbiParserV2(abi).parse()
        constructor = parsed.constructor

        if constructor is None or not constructor.inputs:
            return None

        return serializer_for_constructor_v2(constructor)

    parsed = AbiParserV1(abi).parse()
    constructor = parsed.functions.get("constructor", None)

    # Constructor might not accept any arguments
    if constructor is None or not constructor.inputs:
        return None

    return serializer_for_function_v1(constructor)


def _is_abi_v2(abi: List) -> bool:
    for entry in abi:
        if entry["type"] in [
            ShapeV2.CONSTRUCTOR_ENTRY,
            ShapeV2.L1_HANDLER_ENTRY,
            ShapeV2.INTERFACE_ENTRY,
            ShapeV2.IMPL_ENTRY,
        ]:
            return True
        if entry["type"] == ShapeV2.EVENT_ENTRY:
            if "inputs" in entry:
                return False
            if "kind" in entry:
                return True
    return False


def _get_constructor_serializer_v0(abi: List) -> Optional[FunctionSerializationAdapter]:
    parsed = AbiParserV0(abi).parse()

    # Constructor might not accept any arguments
    if not parsed.constructor or not parsed.constructor.inputs:
        return None

    return serializer_for_function(parsed.constructor)
